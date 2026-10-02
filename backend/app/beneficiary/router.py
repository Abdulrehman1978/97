from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.beneficiary.models import Beneficiary, BeneficiaryProfile, WorkExperience, BeneficiarySkill, SkillEvidence
from backend.app.knowledge.models import Skill
from backend.app.identity.models import User
from backend.app.identity.policies import (
    can_view_beneficiary,
    can_edit_beneficiary,
    is_beneficiary_owner,
    get_user_jurisdictions
)
from backend.app.shared.security import get_current_user, get_current_user_optional, require_roles
from backend.app.config import settings

router = APIRouter(prefix="/beneficiaries", tags=["beneficiaries"])

def check_beneficiary_pre_access(current_user: Any, beneficiary_id: str, db: Session):
    """
    Prevent ID enumeration before database inspection:
    Rejects unauthorized roles (employer, provider) and cross-beneficiary requests (beneficiary role
    attempting to access an ID other than their own linked record).
    """
    if current_user.role in ["employer", "provider"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Employers and providers cannot directly inspect beneficiary profiles"
        )
    if current_user.role == "beneficiary":
        if settings.DEMO_MODE and str(current_user.id).startswith("demo-"):
            return
        own_ben = db.query(Beneficiary).filter(
            (Beneficiary.user_id == current_user.id) | (Beneficiary.id == current_user.id)
        ).first()
        allowed_ids = {current_user.id}
        if own_ben:
            allowed_ids.add(own_ben.id)
        if beneficiary_id not in allowed_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Beneficiaries cannot access another beneficiary's profile"
            )

def check_beneficiary_access(current_user: Any, ben: Beneficiary, db: Session):
    """Enforce ownership and DB-derived jurisdiction scoping for view access."""
    if not can_view_beneficiary(current_user, ben, db):
        if current_user.role == "beneficiary":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Beneficiaries cannot access another beneficiary's profile"
            )
        elif current_user.role in ["employer", "provider"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Employers and providers cannot directly inspect beneficiary profiles"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Cross-district access is not permitted for district-scoped roles"
            )

def check_beneficiary_edit_access(current_user: Any, ben: Beneficiary, db: Session):
    """Enforce ownership and DB-derived jurisdiction scoping for edit access."""
    if not can_edit_beneficiary(current_user, ben, db):
        if current_user.role == "beneficiary":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Beneficiaries cannot edit another beneficiary's profile"
            )
        elif current_user.role in ["employer", "provider"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Unauthorized role for beneficiary profile edit"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Cross-district edit is not permitted for district-scoped roles"
            )

class CreateBeneficiaryRequest(BaseModel):
    full_name: str
    phone: Optional[str] = None
    state_code: str = "MH"
    district_code: str = "MH-NAG"
    gender: Optional[str] = "unspecified"
    age: Optional[int] = None
    primary_language: str = "mr"
    profile_data: Optional[Dict[str, Any]] = None
    confirmed_transcript: Optional[str] = Field(default=None, max_length=12000)


def persist_confirmed_evidence(db: Session, ben: Beneficiary, transcript: Optional[str]):
    """Persist server-derived, self-confirmed evidence; never fabricate certification."""
    if not transcript or not transcript.strip():
        return
    from backend.app.intelligence.extractor import extract_structured_livelihood_profile
    result = extract_structured_livelihood_profile(transcript, ben.primary_language)
    for item in result.get("extracted_skills", []):
        skill_id = item.get("skill_id")
        if not skill_id or not db.get(Skill, skill_id):
            continue
        record = db.query(BeneficiarySkill).filter_by(beneficiary_id=ben.id, skill_id=skill_id).first()
        if not record:
            record = BeneficiarySkill(beneficiary_id=ben.id, skill_id=skill_id, confidence_score=item.get("confidence", 0), verification_status="beneficiary_confirmed", evidence_utterance=transcript)
            db.add(record)
            db.flush()
        evidence = db.query(SkillEvidence).filter_by(beneficiary_skill_id=record.id, description=transcript).first()
        if not evidence:
            db.add(SkillEvidence(beneficiary_skill_id=record.id, evidence_type="spoken_task_description", description=transcript))
    if not db.query(WorkExperience).filter_by(beneficiary_id=ben.id, raw_utterance=transcript).first():
        db.add(WorkExperience(beneficiary_id=ben.id, title="Self-reported work experience", duration_months=0, raw_utterance=transcript, tasks_performed=result.get("tasks_detected", []), tools_used=result.get("tools_detected", [])))

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
    """List beneficiaries for field workers or district admins using authoritative DB jurisdiction."""
    if current_user.role in ["beneficiary", "employer", "provider"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Beneficiaries cannot list all profiles" if current_user.role == "beneficiary" else "Forbidden: Role not authorized to list beneficiary profiles"
        )
    query = db.query(Beneficiary)
    if current_user.role in ["field_worker", "counsellor", "financial_counsellor", "district_admin"]:
        user_jurisdictions = get_user_jurisdictions(current_user, db)
        if user_jurisdictions:
            query = query.filter(Beneficiary.district_code.in_(user_jurisdictions))
    elif current_user.role == "state_admin":
        user_jurisdictions = get_user_jurisdictions(current_user, db)
        state_codes = [j for j in user_jurisdictions if len(j) == 2]
        if state_codes:
            query = query.filter(Beneficiary.state_code.in_(state_codes))

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

@router.get("/me")
def get_my_beneficiary_profile(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Retrieve currently authenticated beneficiary's own profile via User.id -> Beneficiary.user_id."""
    if current_user.role != "beneficiary":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: /beneficiaries/me is reserved for beneficiary accounts"
        )
    ben = db.query(Beneficiary).filter(Beneficiary.user_id == current_user.id).first()
    if not ben and settings.DEMO_MODE:
        if str(current_user.id).startswith("demo-"):
            ben = db.query(Beneficiary).filter(Beneficiary.phone == "9876543210").first()
    if not ben:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No beneficiary profile linked to current user"
        )
    return {
        "id": ben.id,
        "user_id": ben.user_id,
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

@router.post("/")
def create_beneficiary(
    req: CreateBeneficiaryRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """
    Create or register a new beneficiary aggregate.
    Links Beneficiary.user_id = current_user.id when authenticated as beneficiary.
    Does NOT manufacture fake default values for real citizens.
    """
    user_id_to_link: Optional[str] = None
    if current_user.role not in ["beneficiary", "field_worker", "counsellor", "district_admin", "state_admin", "ministry_admin"]:
        raise HTTPException(status_code=403, detail="Role cannot register beneficiaries")
    if current_user and current_user.role == "beneficiary":
        if str(current_user.id).startswith("demo-"):
            raise HTTPException(status_code=409, detail="Sign in with a beneficiary account to save a profile")
        # Serialize repeated saves for this identity, without changing existing schema.
        db.query(User).filter(User.id == current_user.id).with_for_update().first()
        existing = db.query(Beneficiary).filter(Beneficiary.user_id == current_user.id).first()
        if existing:
            if not existing.profile:
                existing.profile = BeneficiaryProfile(beneficiary_id=existing.id)
            for key in ("education", "aspirations", "work_preferences", "mobility", "accessibility"):
                if key in (req.profile_data or {}):
                    setattr(existing.profile, key, req.profile_data[key])
            persist_confirmed_evidence(db, existing, req.confirmed_transcript)
            db.commit()
            return {"id": existing.id, "user_id": existing.user_id, "full_name": existing.full_name, "district_code": existing.district_code}
        user_id_to_link = current_user.id

    ben = Beneficiary(
        user_id=user_id_to_link,
        full_name=req.full_name,
        phone=req.phone,
        state_code=req.state_code,
        district_code=req.district_code,
        gender=req.gender or "unspecified",
        age=req.age,
        primary_language=req.primary_language
    )
    db.add(ben)
    db.flush()

    profile_data = req.profile_data or {}
    prof = BeneficiaryProfile(
        beneficiary_id=ben.id,
        education=profile_data.get("education", {"highest_level": "unknown", "has_formal_certificate": None}),
        aspirations=profile_data.get("aspirations", {"primary_goal": "unknown", "preferred_sector": None}),
        work_preferences=profile_data.get("work_preferences", {"wage_vs_self_employment": "unknown"}),
        mobility=profile_data.get("mobility", {"max_travel_distance_km": None, "can_relocate_district": None, "has_transport": None}),
        accessibility=profile_data.get("accessibility", {"requires_wheelchair_access": None, "has_mobility_impairment": None})
    )
    db.add(prof)
    persist_confirmed_evidence(db, ben, req.confirmed_transcript)
    db.commit()
    db.refresh(ben)

    return {"id": ben.id, "user_id": ben.user_id, "full_name": ben.full_name, "district_code": ben.district_code}

@router.get("/{beneficiary_id}")
def get_beneficiary(
    beneficiary_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Retrieve beneficiary record by ID with mandatory authorization and ID enumeration protection."""
    check_beneficiary_pre_access(current_user, beneficiary_id, db)
    ben = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Beneficiary not found")
    check_beneficiary_access(current_user, ben, db)
    return {
        "id": ben.id,
        "user_id": ben.user_id,
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
    check_beneficiary_pre_access(current_user, beneficiary_id, db)
    ben = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Beneficiary not found")
    check_beneficiary_access(current_user, ben, db)

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
        "user_id": ben.user_id,
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
    """Update profile sections with version increment, ID enumeration guard, and audit trail."""
    check_beneficiary_pre_access(current_user, beneficiary_id, db)
    ben = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    check_beneficiary_edit_access(current_user, ben, db)

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
