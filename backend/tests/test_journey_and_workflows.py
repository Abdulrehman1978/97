import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.journey.models import Pathway, PathwayAction, Case, Referral, Grievance
from backend.app.beneficiary.models import Beneficiary

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_journey_fixtures():
    db = SessionLocal()
    # Ensure test beneficiary exists
    ben = db.query(Beneficiary).filter(Beneficiary.id == "test-ben-1").first()
    if not ben:
        ben = Beneficiary(
            id="test-ben-1",
            full_name="Ramesh Test Journey",
            phone="9222222221",
            district_code="MH-NAG",
            primary_language="mr"
        )
        db.add(ben)
        db.flush()

    case = db.query(Case).filter(Case.id == "test-case-1").first()
    if not case:
        case = Case(
            id="test-case-1",
            beneficiary_id="test-ben-1",
            assigned_to_user_id="test-worker-1",
            case_type="standard_livelihood",
            status="open",
            priority="medium"
        )
        db.add(case)
        db.flush()

    referral = db.query(Referral).filter(Referral.id == "test-ref-1").first()
    if not referral:
        referral = Referral(
            id="test-ref-1",
            case_id="test-case-1",
            referral_type="training_center",
            purpose="Hostel accommodation check for PM-AJAY batch",
            status="pending",
            sla_due_date=datetime.utcnow() + timedelta(days=5)
        )
        db.add(referral)

    db.commit()
    db.close()

from backend.app.shared.security import create_access_token

ben_token = create_access_token({"sub": "test-ben-1", "role": "beneficiary", "name": "Ramesh"})
ben_headers = {"Authorization": f"Bearer {ben_token}"}
worker_token = create_access_token({"sub": "test-worker-1", "role": "field_worker", "district_code": "MH-NAG", "name": "Worker"})
worker_headers = {"Authorization": f"Bearer {worker_token}"}

def test_get_journey_home():
    res = client.get("/api/v1/journey/test-ben-1", headers=ben_headers)
    assert res.status_code == 200
    data = res.json()
    assert "beneficiary_id" in data
    assert "beneficiary_name" in data
    assert "action_plan" in data

def test_select_pathway():
    res = client.post("/api/v1/journey/select-pathway", json={
        "beneficiary_id": "test-ben-1",
        "title": "Automotive Two Wheeler Service Technician",
        "pathway_category": "wage_employment",
        "qualification_id": "test-qual-auto"
    }, headers=ben_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "pathway_id" in data
    assert data["title"] == "Automotive Two Wheeler Service Technician"

def test_update_action_status():
    # First select a pathway to ensure actions exist
    client.post("/api/v1/journey/select-pathway", json={
        "beneficiary_id": "test-ben-1",
        "title": "Automotive Technician Pathway",
        "pathway_category": "wage_employment"
    }, headers=ben_headers)
    journey_res = client.get("/api/v1/journey/test-ben-1", headers=ben_headers)
    actions = journey_res.json()["action_plan"]
    assert len(actions) > 0
    action_id = actions[0]["id"]

    res = client.put(f"/api/v1/journey/actions/{action_id}", json={
        "status": "completed"
    }, headers=ben_headers)
    assert res.status_code == 200
    assert res.json()["new_status"] == "completed"

def test_submit_grievance_returns_persisted_id():
    res = client.post("/api/v1/journey/grievance", json={
        "beneficiary_id": "test-ben-1",
        "category": "training_center",
        "title": "Stipend delay issue",
        "description": "Stipend for November not received yet"
    }, headers=ben_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "submitted"
    assert "grievance_id" in data
    assert len(data["grievance_id"]) > 5

def test_get_cases_list():
    res = client.get("/api/v1/journey/cases", headers=worker_headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "beneficiary_name" in data[0]
    assert "status" in data[0]

def test_get_and_update_coordination():
    res = client.get("/api/v1/journey/coordination", headers=worker_headers)
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)
    assert len(items) > 0
    
    item_id = items[0]["id"]
    update_res = client.put(f"/api/v1/journey/coordination/{item_id}/status", json={
        "status": "acknowledged",
        "blocker_reason": "Hostel room allocated on 2nd floor"
    }, headers=worker_headers)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "updated"

def test_get_enterprise_plan():
    res = client.get("/api/v1/journey/enterprise/test-ben-1", headers=ben_headers)
    assert res.status_code == 200
    data = res.json()
    assert "assumed_capital_needs" in data
    assert "working_capital_opex" in data["assumed_capital_needs"]
    assert "scheme_prescreening" in data
    assert "literacy_checklist" in data
    assert data["truth_state"] == "DEMO_DATA"

def test_record_outcome():
    res = client.post("/api/v1/journey/outcomes", json={
        "beneficiary_id": "test-ben-1",
        "outcome_type": "placed_wage_job",
        "organization_name": "Bajaj Auto Service Center",
        "wage_band_inr": "15000-18000",
        "retention_90d_verified": True,
        "retention_180d_verified": False
    }, headers=worker_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "outcome_recorded"
    assert "outcome_id" in data
