import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import ValidationError
from backend.app.config import Settings
from backend.app.main import app
from backend.app.shared.security import require_roles
from types import SimpleNamespace

client = TestClient(app)

def test_production_rejects_demo_and_known_secret():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, ENVIRONMENT="production", DEMO_MODE=True, SECRET_KEY="x" * 48)
    with pytest.raises(ValidationError):
        Settings(_env_file=None, ENVIRONMENT="production", DEMO_MODE=False)
    assert not Settings(_env_file=None, ENVIRONMENT="production", DEMO_MODE=False, SECRET_KEY="x" * 48).DEMO_MODE

def test_ministry_role_is_exact_not_substring():
    with pytest.raises(HTTPException) as error:
        require_roles("district_admin")(SimpleNamespace(role="fake_ministry_admin"))
    assert error.value.status_code == 403

def test_anonymous_save_rejected_before_database_write():
    assert client.post("/api/v1/beneficiaries/", json={"full_name": "Anonymous audit probe"}).status_code == 401

def test_unknown_demo_role_rejected():
    assert client.post("/api/v1/identity/demo/switch-role", json={"role": "fake_ministry_admin"}).status_code == 422

def test_repeated_self_save_preserves_identity():
    login = client.post("/api/v1/identity/login", json={"username": "ramesh@beneficiary.lip", "password": "ramesh123"})
    assert login.status_code == 200
    headers = {"Authorization": "Bearer " + login.json()["access_token"]}
    payload = {"full_name": "Ramesh Mesram", "confirmed_transcript": "I repair engines and brakes at a garage", "profile_data": {"mobility": {"max_travel_distance_km": 25}}}
    first = client.post("/api/v1/beneficiaries/", json=payload, headers=headers)
    second = client.post("/api/v1/beneficiaries/", json=payload, headers=headers)
    assert first.status_code == second.status_code == 200
    assert first.json()["id"] == second.json()["id"]
    passport = client.get(f"/api/v1/beneficiaries/{first.json()['id']}/passport", headers=headers)
    assert passport.status_code == 200
    assert passport.json()["profile"]["mobility"]["max_travel_distance_km"] == 25
    assert passport.json()["skills"]
    assert any(experience["raw_utterance"] == payload["confirmed_transcript"] for experience in passport.json()["work_experiences"])

def test_saved_recommendations_require_identity():
    assert client.post("/api/v1/intelligence/recommend", json={"beneficiary_id": "someone-else"}).status_code == 401
