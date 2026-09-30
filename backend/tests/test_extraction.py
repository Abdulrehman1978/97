from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_extract_rural_mechanic_marathi():
    payload = {
        "transcript": "मी 3 वर्षे वडिलांच्या गॅरेजमध्ये काम करतोय. इंजिन उघडणे, ऑइल बदलणे, ब्रेकचे काम मला चांगले जमते. प्रवास 10 किमी करू शकतो.",
        "language": "mr"
    }
    response = client.post("/api/v1/intelligence/extract-voice", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "engine_repair" in data["tasks_detected"]
    assert "brake_service" in data["tasks_detected"]
    assert data["inferred_constraints"]["max_travel_distance_km"] == 10
    assert len(data["extracted_skills"]) >= 2

def test_extract_tailoring_hindi():
    payload = {
        "transcript": "मैं घर पर सिलाई मशीन चलाती हूँ, ब्लाउज और कुर्ते की कटिंग करती हूँ। खुद का व्यवसाय शुरू करना चाहती हूँ।",
        "language": "hi"
    }
    response = client.post("/api/v1/intelligence/extract-voice", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "garment_stitching" in data["tasks_detected"]
    assert data["inferred_constraints"]["wage_vs_self_employment"] == "self_employment"
