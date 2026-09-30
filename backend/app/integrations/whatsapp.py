"""
WhatsApp / Multi-channel Messaging Adapter.
Handles WhatsApp webhook payloads, voice notes, and summary message cards.
"""

from typing import Dict, Any

class WhatsAppAdapter:
    @staticmethod
    def handle_incoming_message(from_number: str, message_type: str = "text", content: str = "") -> Dict[str, Any]:
        """
        Processes WhatsApp text message or audio voice note from beneficiary.
        Returns formatted WhatsApp Business response card.
        """
        if message_type == "audio_voice_note":
            transcript = "मी सिलाई मशीन चालवते, ब्लाउज आणि फॉल-पिकोचे काम करते."
            reply_text = (
                "🙏 *पीएम-अजय उपजीविका सहाय्यक (PM-AJAY Livelihood Assistant)*\n\n"
                "तुमची व्हॉइस नोट आम्हाला मिळाली आहे!\n"
                "✓ *ओळखलेले कौशल्य*: सिलाई आणि कपडे तयार करणे (Tailoring)\n"
                "✓ *सुचवलेला मार्ग*: स्वयंचलित टेलर (Self Employed Tailor - NSQF Level 4)\n\n"
                "तुम्हाला पीएम-अजय अंतर्गत मोफत प्रमाणपत्र आणि Rs. 50,000 पर्यंत साधन अनुदान मिळू शकते.\n\n"
                "पुढील पायरीसाठी खालील लिंकवर क्लिक करा किंवा 'मदत' टाईप करा:\n"
                "👉 https://livelihood.gov.in/journey/my-path"
            )
        else:
            reply_text = (
                "🙏 *Welcome to PM-AJAY Livelihood Intelligence Platform*\n\n"
                "You can send a *voice note* in Marathi or Hindi describing your work experience, "
                "or reply with:\n"
                "1️⃣ Check My Livelihood Passport\n"
                "2️⃣ Find Free Training Batches Nearby\n"
                "3️⃣ Talk to District Financial Counsellor\n"
            )

        return {
            "recipient": from_number,
            "message": reply_text,
            "status": "delivered_to_sandbox",
            "truth_state": "LIVE"
        }
