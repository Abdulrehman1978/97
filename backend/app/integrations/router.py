from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.integrations.speech import speech_gateway
from backend.app.integrations.ivr import IVRStateMachine
from backend.app.integrations.whatsapp import WhatsAppAdapter

router = APIRouter(prefix="/integrations", tags=["integrations"])

class TtsRequest(BaseModel):
    text: str
    language: str = "mr"

class IvrTurnRequest(BaseModel):
    session_id: Optional[str] = None
    digits: Optional[str] = None
    spoken_input: Optional[str] = None
    phone_number: str = "9876543210"

class MissedCallRequest(BaseModel):
    phone_number: str

class WhatsAppWebhookRequest(BaseModel):
    from_number: str = "9876543210"
    message_type: str = "text" # text or audio_voice_note
    content: Optional[str] = ""

@router.post("/speech/synthesize")
def synthesize_tts(req: TtsRequest):
    """Text-to-Speech synthesis directive for browser or telephony playback."""
    return speech_gateway.synthesize_speech(req.text, req.language)

@router.post("/ivr/turn")
def ivr_turn(req: IvrTurnRequest):
    """Processes an IVR conversational turn for telephone callers."""
    return IVRStateMachine.process_call_turn(req.session_id, req.digits, req.spoken_input, req.phone_number)

@router.post("/ivr/missed-call")
def register_missed_call(req: MissedCallRequest):
    """Registers citizen missed-call for automated callback without phone balance burn."""
    return IVRStateMachine.register_missed_call_callback(req.phone_number)

@router.post("/whatsapp/webhook")
def whatsapp_webhook(req: WhatsAppWebhookRequest):
    """Simulates receiving a WhatsApp message or voice note and dispatching a rich response card."""
    return WhatsAppAdapter.handle_incoming_message(req.from_number, req.message_type, req.content)
