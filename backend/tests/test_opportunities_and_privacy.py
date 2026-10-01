import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.shared.security import create_access_token

client = TestClient(app)

def test_list_training_options_and_centers():
    res = client.get("/api/v1/opportunities/training-options?district_code=MH-NAG")
    assert res.status_code == 200
    options = res.json()
    assert len(options) > 0
    # Must contain truth_state and verification status
    first = options[0]
    assert "truth_state" in first
    assert "is_verified_live_batch" in first

def test_candidate_matching_with_strict_caste_isolation():
    """Verify Section 8.17 & 13.3: Employers never receive caste or sensitive social identity."""
    employer_token = create_access_token({"sub": "employer-test-uuid", "role": "employer", "organization_id": "test-org-1", "name": "Test Employer"})
    res = client.get(
        "/api/v1/opportunities/candidates?district_code=MH-NAG",
        headers={"Authorization": f"Bearer {employer_token}"}
    )
    assert res.status_code == 200
    candidates = res.json()
    assert len(candidates) > 0
    
    for can in candidates:
        # Strict privacy check
        assert "caste" not in can
        assert "social_category" not in can
        assert "caste_category" not in can
        assert "candidate_id" in can
        assert "verified_skills" in can
        assert "education" in can
        assert "privacy_notice" in can

def test_create_and_update_application():
    from backend.app.database import SessionLocal
    from backend.app.beneficiary.models import Beneficiary
    db = SessionLocal()
    try:
        ben = db.query(Beneficiary).filter(Beneficiary.id == "test-b-1").first()
        if not ben:
            ben = Beneficiary(id="test-b-1", full_name="Test Beneficiary Apps", phone="9222222299", district_code="MH-NAG")
            db.add(ben)
            db.commit()
    finally:
        db.close()

    ben_token = create_access_token({"sub": "test-b-1", "role": "beneficiary", "name": "Beneficiary 1"})
    # Submit application
    app_res = client.post("/api/v1/opportunities/apply", json={
        "beneficiary_id": "test-b-1",
        "opportunity_id": None,
        "training_option_id": "test-opt-1",
        "application_type": "training"
    }, headers={"Authorization": f"Bearer {ben_token}"})
    assert app_res.status_code == 200
    app_id = app_res.json()["application_id"]
    
    # Update status with admin/provider token
    admin_token = create_access_token({"sub": "test-admin-uuid", "role": "district_admin", "district_code": "MH-NAG", "name": "Admin"})
    up_res = client.put(f"/api/v1/opportunities/applications/{app_id}/status", json={
        "status": "shortlisted"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert up_res.status_code == 200
    assert up_res.json()["new_status"] == "shortlisted"
