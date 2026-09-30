from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.intelligence.extractor import extract_structured_livelihood_profile
from backend.app.intelligence.ranking import compute_pathway_recommendations
from backend.app.intelligence.rpl import evaluate_rpl_readiness
from backend.app.intelligence.counterfactuals import evaluate_counterfactuals
from backend.app.intelligence.rag import query_policy_rag
from backend.app.beneficiary.models import Beneficiary, BeneficiaryProfile, BeneficiarySkill

router = APIRouter(prefix="/intelligence", tags=["intelligence"])

class VoiceExtractRequest(BaseModel):
    transcript: str
    language: str = "mr"

class RecommendRequest(BaseModel):
    beneficiary_id: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None
    skill_ids: Optional[List[str]] = None
    district_code: str = "MH-NAG"

class RplCheckRequest(BaseModel):
    qualification_id: str
    beneficiary_skill_ids: List[str] = []
    experience_months: int = 24

class CounterfactualRequest(BaseModel):
    base_profile: Dict[str, Any]
    candidate_skill_ids: List[str]
    delta_parameters: Dict[str, Any]
    district_code: str = "MH-NAG"

class PolicyRagRequest(BaseModel):
    query: str

@router.post("/extract-voice")
def extract_voice_interview(req: VoiceExtractRequest):
    """Parses spoken natural language transcript into canonical skills, tools, and constraints."""
    if not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")
    return extract_structured_livelihood_profile(req.transcript, req.language)

@router.post("/recommend")
def get_recommendations(req: RecommendRequest, db: Session = Depends(get_db)):
    """Computes transparent, constraint-aware pathway recommendations."""
    profile_data = req.profile or {}
    skill_ids = req.skill_ids or []
    district_code = req.district_code

    if req.beneficiary_id:
        ben = db.query(Beneficiary).filter(Beneficiary.id == req.beneficiary_id).first()
        if not ben:
            raise HTTPException(status_code=404, detail="Beneficiary not found")
        district_code = ben.district_code
        if ben.profile:
            profile_data = {
                "education": ben.profile.education,
                "aspirations": ben.profile.aspirations,
                "work_preferences": ben.profile.work_preferences,
                "mobility": ben.profile.mobility,
                "accessibility": ben.profile.accessibility
            }
        skill_ids = [bs.skill_id for bs in ben.skills]

    recommendations = compute_pathway_recommendations(db, profile_data, skill_ids, district_code)
    return {
        "beneficiary_id": req.beneficiary_id,
        "district_code": district_code,
        "recommendations_count": len(recommendations),
        "pathways": recommendations
    }

@router.post("/rpl-check")
def check_rpl(req: RplCheckRequest, db: Session = Depends(get_db)):
    """Evaluates RPL readiness and identifies exact NOS competency gaps."""
    return evaluate_rpl_readiness(db, req.qualification_id, req.beneficiary_skill_ids, req.experience_months)

@router.post("/counterfactual")
def explore_counterfactuals(req: CounterfactualRequest, db: Session = Depends(get_db)):
    """Simulates What-If constraint modifications and explains resulting feasibility changes."""
    return evaluate_counterfactuals(db, req.base_profile, req.candidate_skill_ids, req.delta_parameters, req.district_code)

@router.post("/policy-rag")
def ask_policy_rag(req: PolicyRagRequest):
    """Grounded question answering over PM-AJAY and NCVET guidelines with citations."""
    return query_policy_rag(req.query)
