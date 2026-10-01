"""
Truth-State Automated Regression Guards (Rule 34)
Ensures mock, sandbox, and simulated adapters never emit LIVE truth_state.
Allowed truth states: LIVE, SANDBOX, ADAPTER_READY, DEMO_DATA.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.integrations.speech import speech_gateway
from backend.app.integrations.whatsapp import WhatsAppAdapter
from backend.app.integrations.ivr import IVRStateMachine

client = TestClient(app)

def test_mock_speech_transcription_is_never_live():
    """Mock speech transcription must never return truth_state = LIVE."""
    res_mock = speech_gateway.transcribe_audio(mock_text="Test spoken input")
    assert res_mock["truth_state"] != "LIVE", "Mock speech transcript cannot be labeled LIVE"
    assert res_mock["truth_state"] == "DEMO_DATA"

    res_fallback = speech_gateway.transcribe_audio()
    assert res_fallback["truth_state"] != "LIVE", "Fallback speech transcript cannot be labeled LIVE"
    assert res_fallback["truth_state"] == "DEMO_DATA"

def test_mock_speech_synthesis_is_never_live():
    """Browser/mock speech synthesis fallback must never return truth_state = LIVE."""
    res_synth = speech_gateway.synthesize_speech("Hello world", language="mr")
    assert res_synth["truth_state"] != "LIVE", "Browser speech synthesis cannot be labeled LIVE"
    assert res_synth["truth_state"] == "SANDBOX"

def test_sandbox_whatsapp_is_never_live():
    """WhatsApp sandbox adapter must never claim to be LIVE."""
    res = WhatsAppAdapter.handle_incoming_message(from_number="919876543210", content="Hi")
    assert res["truth_state"] != "LIVE", "Sandbox WhatsApp delivery cannot be labeled LIVE"
    assert res["truth_state"] == "SANDBOX"
    assert res["status"] == "delivered_to_sandbox"

def test_simulated_ivr_is_never_live():
    """Simulated IVR turns must never claim to be LIVE until live PSTN routing exists."""
    turn_0 = IVRStateMachine.process_call_turn(session_id=None)
    assert turn_0["truth_state"] != "LIVE", "IVR initial prompt cannot be labeled LIVE"
    assert turn_0["truth_state"] == "SANDBOX"

    turn_final = IVRStateMachine.process_call_turn(session_id=turn_0["session_id"], digits="1")
    assert turn_final["truth_state"] != "LIVE", "IVR prompt cannot be labeled LIVE"
    assert turn_final["truth_state"] == "SANDBOX"

def test_demo_opportunities_are_labeled_demo_data():
    """Synthetic opportunity listings must be labeled DEMO_DATA."""
    res = client.get("/api/v1/opportunities/training-options?district_code=MH-NAG")
    assert res.status_code == 200
    options = res.json()
    for opt in options:
        assert opt["truth_state"] in ["DEMO_DATA", "SANDBOX"], f"Synthetic option cannot be LIVE: {opt}"

def test_demo_district_demand_is_labeled_demo_data():
    """District analytics derived from seeded records must be labeled DEMO_DATA."""
    from backend.app.shared.security import create_access_token
    admin_token = create_access_token({"sub": "admin-1", "role": "district_admin", "district_code": "MH-NAG", "name": "Admin"})
    res = client.get("/api/v1/admin/dashboard?district_code=MH-NAG", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["truth_state"] == "DEMO_DATA"
    for sector in data["sector_demand_matrix"]:
        assert sector["truth_state"] == "DEMO_DATA"
