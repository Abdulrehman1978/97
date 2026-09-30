from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_rpl_readiness_evaluation():
    # Get automotive qualification
    quals = client.get("/api/v1/knowledge/qualifications?validity=current").json()
    auto_qual = next(q for q in quals if "ASC/Q1411" in q["qp_code"])

    payload = {
        "qualification_id": auto_qual["id"],
        "beneficiary_skill_ids": [],
        "experience_months": 36
    }
    response = client.post("/api/v1/intelligence/rpl-check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_rpl_recommended"] is True
    assert len(data["demonstrated_competencies"]) > 0
    assert len(data["gap_competencies"]) > 0 # Correctly pinpoints electrical gap

def test_counterfactual_travel_change():
    base_profile = {
        "education": {"highest_level": "class_10"},
        "aspirations": {"preferred_sector": "Automotive"},
        "work_preferences": {"wage_vs_self_employment": "hybrid"},
        "mobility": {"max_travel_distance_km": 5},
        "accessibility": {"requires_wheelchair_access": False}
    }
    payload = {
        "base_profile": base_profile,
        "candidate_skill_ids": [],
        "delta_parameters": {"max_travel_distance_km": 25},
        "district_code": "MH-NAG"
    }
    response = client.post("/api/v1/intelligence/counterfactual", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["counterfactual_reasoning"]) > 0
    assert data["parameters_changed"]["max_travel_distance_km"] == 25
