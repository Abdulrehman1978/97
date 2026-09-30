from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_recommendation_excludes_expired_qualifications():
    """Validates that expired qualifications in NQR are strictly filtered out."""
    payload = {
        "profile": {
            "education": {"highest_level": "class_10"},
            "work_preferences": {"wage_vs_self_employment": "hybrid"},
            "mobility": {"max_travel_distance_km": 20},
            "accessibility": {"requires_wheelchair_access": False}
        },
        "skill_ids": [],
        "district_code": "MH-NAG"
    }
    response = client.post("/api/v1/intelligence/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    pathways = data["pathways"]
    
    # Assert NO recommendation is for the expired construction qualification
    for p in pathways:
        assert "EXPIRED" not in p["qp_code"]
        assert p["factor_scores"]["qualification_validity"] == 1.0

def test_recommendation_ranks_mechanic_for_mechanic_skills():
    """Validates that a candidate with automotive repair skills gets Automotive Technician as #1 rank."""
    # First get the skill ID for engine
    skills_resp = client.get("/api/v1/knowledge/skills?category=Mechanical")
    assert skills_resp.status_code == 200
    skills = skills_resp.json()
    skill_ids = [s["id"] for s in skills]

    payload = {
        "profile": {
            "education": {"highest_level": "class_10"},
            "aspirations": {"preferred_sector": "Automotive"},
            "work_preferences": {"wage_vs_self_employment": "hybrid"},
            "mobility": {"max_travel_distance_km": 15},
            "accessibility": {"requires_wheelchair_access": False}
        },
        "skill_ids": skill_ids,
        "district_code": "MH-NAG"
    }
    response = client.post("/api/v1/intelligence/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    top_pathway = data["pathways"][0]
    
    assert "Two Wheeler" in top_pathway["qualification_title"]
    assert top_pathway["factor_scores"]["skill_transfer"] >= 0.8
    assert top_pathway["rank"] == 1
