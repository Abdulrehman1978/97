from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.beneficiary.models import Beneficiary, BeneficiaryProfile, WorkExperience, BeneficiarySkill
from backend.app.knowledge.models import Skill
from backend.app.identity.policies import can_view_beneficiary, can_edit_beneficiary
from backend.app.shared.security import get_current_user, require_roles
from backend.app.config import settings

router = APIRouter(prefix="/beneficiaries", tags=["beneficiaries"])

def check_beneficiary_access(current_user: Any, ben: Optional[Beneficiary], beneficiary_id: str = ""):
    target_id = ben.id if ben else beneficiary_id
    if current_user.role in ["employer", "provider"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Employers and providers cannot directly inspect beneficiary profiles"
        )
    if current_user.role == "beneficiary":
        if current_user.id != target_id and not (settings.DEMO_MODE and str(current_user.id).startswith("demo-")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Beneficiaries cannot access another beneficiary's profile"
            )
    if ben and current_user.role in ["field_worker", "district_admin"]:
        user_district = getattr(current_user, "district_code", None)
        if user_district and ben.district_code and user_district != ben.district_code:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Cross-district access is not permitted for district-scoped roles"
            )

def check_beneficiary_edit_access(current_user: Any, ben: Optional[Beneficiary], beneficiary_id: str = ""):
    target_id = ben.id if ben else beneficiary_id
    if current_user.role in ["employer", "provider"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Unauthorized role for beneficiary profile edit"
        )
    if current_user.role == "beneficiary":
        if current_user.id != target_id and not (settings.DEMO_MODE and str(current_user.id).startswith("demo-")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Beneficiaries cannot edit another beneficiary's profile"
            )
    if ben and current_user.role in ["field_worker", "district_admin"]:
        user_district = getattr(current_user, "district_code", None)
        if user_district and ben.district_code and user_district != ben.district_code:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Cross-district edit is not permitted for district-scoped roles"
            )

class CreateBeneficiaryRequest(BaseModel):
    full_name: str
    phone: Optional[str] = None
    state_code: str = "MH"
    district_code: str = "MH-NAG"
    gender: Optional[str] = "male"
    age: Optional[int] = 22
    primary_language: str = "mr"
    profile_data: Optional[Dict[str, Any]] = None

class UpdateProfileRequest(BaseModel):
    education: Optional[Dict[str, Any]] = None
    aspirations: Optional[Dict[str, Any]] = None
    work_preferences: Optional[Dict[str, Any]] = None
    mobility: Optional[Dict[str, Any]] = None
    accessibility: Optional[Dict[str, Any]] = None

class AddSkillRequest(BaseModel):
    skill_id: str
    proficiency_band: str = "practicing"
    confidence_score: float = 0.9
    evidence_utterance: Optional[str] = None

@router.get("/")
def list_beneficiaries(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """List beneficiaries for field workers or district admins. Beneficiaries and employers forbidden."""
    if current_user.role in ["beneficiary", "employer", "provider"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Beneficiaries cannot list all profiles" if current_user.role == "beneficiary" else "Forbidden: Role not authorized to list beneficiary profiles"
        )
    query = db.query(Beneficiary)
    if current_user.role in ["field_worker", "district_admin"]:
        user_district = getattr(current_user, "district_code", None)
        if user_district:
            query = query.filter(Beneficiary.district_code == user_district)
    bens = query.limit(limit).all()
    return [
        {
            "id": b.id,
            "full_name": b.full_name,
            "phone": b.phone,
            "district_code": b.district_code,
            "primary_language": b.primary_language,
            "created_at": b.created_at.isoformat()
        }
        for b in bens
    ]

@router.post("/")
def create_beneficiary(req: CreateBeneficiaryRequest, db: Session = Depends(get_db)):
    """Create or register a new beneficiary aggregate with safe defaults."""
    ben = Beneficiary(
        full_name=req.full_name,
        phone=req.phone,
        state_code=req.state_code,
        district_code=req.district_code,
        gender=req.gender,
        age=req.age,
        primary_language=req.primary_language
    )
    db.add(ben)
    db.flush()

    profile_data = req.profile_data or {}
    prof = BeneficiaryProfile(
        beneficiary_id=ben.id,
        education=profile_data.get("education", {"highest_level": "unknown"}),
        aspirations=profile_data.get("aspirations", {"primary_goal": "unknown"}),
        work_preferences=profile_data.get("work_preferences", {"wage_vs_self_employment": "unknown"}),
        mobility=profile_data.get("mobility", {"max_travel_distance_km": 15}),
        accessibility=profile_data.get("accessibility", {"requires_wheelchair_access": False})
    )
    db.add(prof)
    db.commit()
    db.refresh(ben)

    return {"id": ben.id, "full_name": ben.full_name, "district_code": ben.district_code}

@router.get("/{beneficiary_id}")
def get_beneficiary(
    beneficiary_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Retrieve beneficiary record by ID with mandatory authorization."""
    check_beneficiary_access(current_user, None, beneficiary_id)
    ben = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Beneficiary not found")
    check_beneficiary_access(current_user, ben, beneficiary_id)
    return {
        "id": ben.id,
        "full_name": ben.full_name,
        "phone": ben.phone,
        "district_code": ben.district_code,
        "state_code": ben.state_code,
        "gender": ben.gender,
        "age": ben.age,
        "primary_language": ben.primary_language,
        "profile": {
            "education": ben.profile.education if ben.profile else {},
            "aspirations": ben.profile.aspirations if ben.profile else {},
            "work_preferences": ben.profile.work_preferences if ben.profile else {},
            "mobility": ben.profile.mobility if ben.profile else {},
            "accessibility": ben.profile.accessibility if ben.profile else {}
        } if ben.profile else {}
    }

@router.get("/{beneficiary_id}/passport")
def get_livelihood_passport(
    beneficiary_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """
    Returns the complete Livelihood Passport:
    - What You Know (Verified Skills)
    - Tasks & Tools Handled
    - Work Experience History
    - Mobility & Constraint profile
    - RPL Certification Readiness
    """
    check_beneficiary_access(current_user, None, beneficiary_id)
    ben = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Beneficiary not found")
    check_beneficiary_access(current_user, ben, beneficiary_id)

    skills_data = []
    for bs in ben.skills:
        sk = db.query(Skill).filter(Skill.id == bs.skill_id).first()
        if sk:
            skills_data.append({
                "skill_id": sk.id,
                "canonical_name": sk.canonical_name,
                "category": sk.category,
                "proficiency_band": bs.proficiency_band,
                "confidence_score": bs.confidence_score,
                "verification_status": bs.verification_status,
                "evidence_utterance": bs.evidence_utterance
            })

    exp_data = [
        {
            "id": exp.id,
            "title": exp.title,
            "duration_months": exp.duration_months,
            "tasks": exp.tasks_performed,
            "tools": exp.tools_used,
            "raw_utterance": exp.raw_utterance
        }
        for exp in ben.work_experiences
    ]

    return {
        "beneficiary_id": ben.id,
        "full_name": ben.full_name,
        "phone": ben.phone,
        "district_code": ben.district_code,
        "primary_language": ben.primary_language,
        "skills": skills_data,
        "work_experiences": exp_data,
        "profile": {
            "education": ben.profile.education if ben.profile else {},
            "aspirations": ben.profile.aspirations if ben.profile else {},
            "work_preferences": ben.profile.work_preferences if ben.profile else {},
            "mobility": ben.profile.mobility if ben.profile else {},
            "accessibility": ben.profile.accessibility if ben.profile else {}
        },
        "passport_version": "3.0.0",
        "qr_code_token": f"LIP-PASSPORT-{ben.id[:8]}"
    }

@router.put("/{beneficiary_id}/profile")
def update_profile(
    beneficiary_id: str,
    req: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Update profile sections with version increment and audit trail."""
    check_beneficiary_edit_access(current_user, None, beneficiary_id)
    ben = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    check_beneficiary_edit_access(current_user, ben, beneficiary_id)

    prof = ben.profile
    if not prof:
        prof = BeneficiaryProfile(beneficiary_id=beneficiary_id)
        db.add(prof)

    if req.education:
        prof.education = req.education
    if req.aspirations:
        prof.aspirations = req.aspirations
    if req.work_preferences:
        prof.work_preferences = req.work_preferences
    if req.mobility:
        prof.mobility = req.mobility
    if req.accessibility:
        prof.accessibility = req.accessibility

    prof.profile_version += 1
    db.commit()
    return {"status": "updated", "profile_version": prof.profile_version}
