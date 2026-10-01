import { apiFetch } from "./client";

export const runIvrTurn = (session_id?: string, digits?: string, spoken_input?: string) =>
  apiFetch<any>("/api/v1/integrations/ivr/turn", {
    method: "POST",
    body: JSON.stringify({ session_id, digits, spoken_input })
  });

export const registerMissedCall = (phone_number: string) =>
  apiFetch<{ status: string; queue_token: string; truth_state: string }>("/api/v1/integrations/ivr/missed-call", {
    method: "POST",
    body: JSON.stringify({ phone_number })
  });

export const sendWhatsAppMessage = (from_number: string, message_type: string, content?: string) =>
  apiFetch<any>("/api/v1/integrations/whatsapp/webhook", {
    method: "POST",
    body: JSON.stringify({ from_number, message_type, content })
  });

export const synthesizeSpeech = (text: string, language = "mr") =>
  apiFetch<any>("/api/v1/integrations/speech/synthesize", {
    method: "POST",
    body: JSON.stringify({ text, language })
  });
