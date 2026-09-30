"""
Admin, Planning & Data Ingestion Automated Tests
Covers:
- District demand and livelihood metrics
- Batch simulation with candidate feasibility and seat gap
- PM-AJAY project proposal generator
- Data ingestion provenance and run auditing
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

@pytest.fixture
def admin_headers():
    res = client.post("/api/v1/identity/login", json={
        "username": "admin@nagpur.gov.in",
        "password": "admin123"
    })
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_district_dashboard(admin_headers):
    """Verify district dashboard returns aggregated metrics with DEMO_DATA / LIVE provenance."""
    res = client.get("/api/v1/admin/dashboard?district_code=MH-NAG", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["district_code"] == "MH-NAG"
    assert "sector_demand_matrix" in data
    assert "barrier_indicators" in data
    assert "total_beneficiaries_onboarded" in data
    assert data["truth_state"] == "DEMO_DATA"

def test_simulate_training_batch(admin_headers):
    """Verify training batch simulation derives pool and issues honest READY_FOR_HUMAN_REVIEW status."""
    payload = {
        "district_code": "MH-NAG",
        "qualification_code": "ASC/Q1411",
        "proposed_capacity": 30,
        "duration_days": 90,
        "include_hostel_subsidy": False
    }
    res = client.post("/api/v1/admin/batch-planner", json=payload, headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "proposed_batch" in data
    assert data["verdict"] == "READY_FOR_HUMAN_REVIEW"
    assert "budget_breakdown_inr" in data
    assert data["truth_state"] == "DEMO_DATA"

def test_generate_livelihood_proposal(admin_headers):
    """Verify generation of PM-AJAY GIA project proposal with evidence citations and budget."""
    payload = {
        "project_title": "Nagpur Automotive Livelihood Project",
        "target_district": "MH-NAG",
        "target_beneficiary_count": 100,
        "priority_sectors": ["Automotive", "Solar PV"],
        "estimated_budget_inr": 3500000.0
    }
    res = client.post("/api/v1/admin/project-planner", json=payload, headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["project_title"] == "Nagpur Automotive Livelihood Project"
    assert data["proposal_status"] == "DRAFT_PROPOSAL_GENERATED"
    assert len(data["components"]) > 0
    assert data["truth_state"] == "DEMO_DATA"

def test_source_health_and_provenance(admin_headers):
    """Verify data sources, freshness SLA, and synchronization status are audited."""
    res = client.get("/api/v1/admin/source-health", headers=admin_headers)
    assert res.status_code == 200
    sources = res.json()
    assert isinstance(sources, list)
    assert len(sources) >= 4
    for s in sources:
        assert "source_name" in s
        assert "freshness_sla_days" in s
        assert "quality_status" in s
