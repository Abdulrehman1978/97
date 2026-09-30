from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_ivr_full_turn_sequence():
    """Simulates multi-turn telephone IVR session for low-tech user."""
    # Turn 0: Initiate call
    r0 = client.post("/api/v1/integrations/ivr/turn", json={"phone_number": "9876543210"})
    assert r0.status_code == 200
    d0 = r0.json()
    assert d0["action"] == "play_and_get_digits"
    session_id = d0["session_id"]

    # Turn 1: Select Marathi (press 1)
    r1 = client.post("/api/v1/integrations/ivr/turn", json={"session_id": session_id, "digits": "1"})
    assert r1.status_code == 200
    d1 = r1.json()
    assert d1["action"] == "record_speech_or_press_key"
    assert "कोणते काम करता" in d1["prompt_text"]

    # Turn 2: Spoken work description
    r2 = client.post("/api/v1/integrations/ivr/turn", json={
        "session_id": session_id,
        "spoken_input": "मी गॅरेजमध्ये दुचाकी दुरुस्तीचे काम करतो."
    })
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2["action"] == "play_and_get_digits"

    # Turn 3: Mobility selection (press 2 for 15km)
    r3 = client.post("/api/v1/integrations/ivr/turn", json={"session_id": session_id, "digits": "2"})
    assert r3.status_code == 200
    d3 = r3.json()
    assert d3["action"] == "play_and_hangup"
    assert d3["sms_dispatched"] is True
    assert "दुचाकी सर्व्हिस टेक्निशियन" in d3["prompt_text"]

def test_ivr_missed_call_callback():
    """Simulates registering a missed-call for citizen balance protection."""
    resp = client.post("/api/v1/integrations/ivr/missed-call", json={"phone_number": "9876543210"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "callback_queued"
    assert data["sla_callback_minutes"] <= 15
