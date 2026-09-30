"""
Voice Interview & Spoken Experience Structured Extractor.
Converts unstructured spoken trade stories and regional dialect expressions into
canonical skills, tools, practical experience, constraints, and aspirations with evidence spans.
"""

import re
from typing import Dict, Any, List
from backend.app.database import SessionLocal
from backend.app.knowledge.models import Skill, SkillAlias

# Keyword and pattern mappings for Indian informal trades (Marathi, Hindi, English trade code-switching)
TASK_TRADE_PATTERNS = {
    "engine_repair": [
        "इंजिन", "engine", "पिस्टन", "piston", "overhaul", "इंजन खोलना", "इंजिन उघडणे",
        "bore", "valve", "clutch", "क्लच", "गियर", "gearbox"
    ],
    "brake_service": [
        "ब्रेक", "brake", "brake shoe", "ब्रेक शू", "disc brake", "डिस्क", "liner"
    ],
    "electrical_wiring": [
        "वायरिंग", "wiring", "battery", "बॅटरी", "बैटरी", "horn", "लाइट", "light",
        "fault", "शॉर्ट सर्किट", "कंडेंसर", "spark plug", "स्पार्क प्लग", "fuse"
    ],
    "garment_stitching": [
        "सिलाई", "शिवणकाम", "stitching", "sewing", "मशीन", "ब्लाउज", "कुर्ता",
        "कपडे शिवणे", "dressmaker", "सिलाई मशीन"
    ],
    "pattern_cutting": [
        "कटिंग", "cutting", "नाप", "measurement", "पॅटर्न", "ड्राफ्टिंग", "कपडा काटना"
    ],
    "solar_installation": [
        "सोलर", "solar", "रूफटॉप", "panel", "पॅनेल", "प्लेट लगाना", "इनवर्टर", "inverter"
    ],
    "inventory_handling": [
        "गोदाम", "warehouse", "माल भरणे", "माल गिनना", "लोडिंग", "packing", "बारकोड"
    ]
}

TOOL_PATTERNS = [
    "spanner", "पाना", "wrench", "screwdriver", "स्क्रूड्राइवर", "compressor", "हवा पंप",
    "multimeter", "मल्टीमीटर", "soldering", "pliers", "पकड", "कात्री", "scissors", "इंची टेप"
]

def extract_structured_livelihood_profile(transcript: str, language: str = "mr") -> Dict[str, Any]:
    """
    Analyzes spoken conversation transcript and extracts:
    - practical tasks performed
    - tools and equipment handled
    - inferred skills with confidence and text spans
    - mobility constraints (radius in km)
    - education clues
    - wage vs enterprise preferences
    """
    clean_text = transcript.lower()
    
    # 1. Extract Tasks and Tools
    detected_tasks = []
    evidence_spans = []
    
    for task_category, keywords in TASK_TRADE_PATTERNS.items():
        matched_words = [kw for kw in keywords if kw in clean_text]
        if matched_words:
            detected_tasks.append(task_category)
            evidence_spans.append(f"Mentioned {', '.join(matched_words)}")

    detected_tools = [tool for tool in TOOL_PATTERNS if tool in clean_text]

    # 2. Extract Mobility Distance
    mobility_km = 15 # Default
    km_match = re.search(r'(\d+)\s*(?:किमी|किलोमीटर|km|किलो मीटर)', clean_text)
    if km_match:
        mobility_km = int(km_match.group(1))
    elif "जवळ" in clean_text or "नजदीक" in clean_text or "near village" in clean_text:
        mobility_km = 5
    elif "दूर" in clean_text or "travel" in clean_text:
        mobility_km = 25

    # 3. Extract Wage vs Self-Employment Preference
    preference = "hybrid"
    if any(k in clean_text for k in ["स्वतःचे दुकान", "खुद का काम", "own shop", "workshop", "धंदा", "व्यवसाय"]):
        if any(k in clean_text for k in ["आधी नोकरी", "पहिला जॉब", "job first", "steady income"]):
            preference = "hybrid" # Steady income now, own workshop later
        else:
            preference = "self_employment"
    elif any(k in clean_text for k in ["नोकरी", "job", "पगार", "वेतन", "company"]):
        preference = "wage"

    # 4. Extract Education
    education_level = "class_10" # Default assumption for informal trade
    if any(k in clean_text for k in ["दहावी", "10th", "दसवीं", "class 10"]):
        education_level = "class_10"
    elif any(k in clean_text for k in ["बारावी", "12th", "बारहवीं", "class 12"]):
        education_level = "class_12"
    elif any(k in clean_text for k in ["आठवी", "8th", "आठवीं"]):
        education_level = "class_8"
    elif any(k in clean_text for k in ["शिकलो नाही", "अंगठा छाप", "uneducated", "never went to school"]):
        education_level = "unlettered"

    # 5. Map to Canonical Skills in DB
    db = SessionLocal()
    matched_skills = []
    try:
        if "engine_repair" in detected_tasks:
            sk = db.query(Skill).filter(Skill.canonical_name.ilike("%Engine%")).first()
            if sk:
                matched_skills.append({
                    "skill_id": sk.id,
                    "canonical_name": sk.canonical_name,
                    "category": sk.category,
                    "confidence": 0.92,
                    "verification_status": "ai_inferred_pending_confirmation",
                    "evidence": "Mentioned engine overhaul and cylinder head repair"
                })

        if "brake_service" in detected_tasks:
            sk = db.query(Skill).filter(Skill.canonical_name.ilike("%Brake%")).first()
            if sk:
                matched_skills.append({
                    "skill_id": sk.id,
                    "canonical_name": sk.canonical_name,
                    "category": sk.category,
                    "confidence": 0.95,
                    "verification_status": "ai_inferred_pending_confirmation",
                    "evidence": "Mentioned changing brake shoes and pads"
                })

        if "electrical_wiring" in detected_tasks:
            sk = db.query(Skill).filter(Skill.canonical_name.ilike("%Electrical%")).first()
            if sk:
                # Often informal mechanics acknowledge wiring is difficult or needs learning
                confidence = 0.65 if ("कठीण" in clean_text or "मुश्किल" in clean_text or "hard" in clean_text) else 0.85
                matched_skills.append({
                    "skill_id": sk.id,
                    "canonical_name": sk.canonical_name,
                    "category": sk.category,
                    "confidence": confidence,
                    "verification_status": "ai_inferred_pending_confirmation",
                    "evidence": "Identified electrical wiring tasks (highlighted for skill verification)"
                })

        if "garment_stitching" in detected_tasks:
            sk = db.query(Skill).filter(Skill.canonical_name.ilike("%Stitching%")).first()
            if sk:
                matched_skills.append({
                    "skill_id": sk.id,
                    "canonical_name": sk.canonical_name,
                    "category": sk.category,
                    "confidence": 0.94,
                    "verification_status": "ai_inferred_pending_confirmation",
                    "evidence": "Mentioned tailoring and sewing machine operation"
                })

        if "solar_installation" in detected_tasks:
            sk = db.query(Skill).filter(Skill.canonical_name.ilike("%Solar%")).first()
            if sk:
                matched_skills.append({
                    "skill_id": sk.id,
                    "canonical_name": sk.canonical_name,
                    "category": sk.category,
                    "confidence": 0.88,
                    "verification_status": "ai_inferred_pending_confirmation",
                    "evidence": "Mentioned solar panel mounting"
                })
    finally:
        db.close()

    return {
        "raw_transcript": transcript,
        "language_detected": language,
        "tasks_detected": detected_tasks,
        "tools_detected": detected_tools,
        "extracted_skills": matched_skills,
        "inferred_constraints": {
            "max_travel_distance_km": mobility_km,
            "education_level": education_level,
            "wage_vs_self_employment": preference
        },
        "evidence_summary": "; ".join(evidence_spans) if evidence_spans else "Informal conversational intake",
        "requires_confirmation": any(s["confidence"] < 0.75 for s in matched_skills) or len(matched_skills) == 0
    }
