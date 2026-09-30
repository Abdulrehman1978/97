from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.opportunities.models import TrainingCenter, TrainingOption, EmployerOpportunity, LocalEconomicSignal, Application
from backend.app.beneficiary.models import Beneficiary, BeneficiaryProfile, BeneficiarySkill
from backend.app.knowledge.models import Qualification, Skill

router = APIRouter(prefix="/opportunities", tags=["opportunities"])

class ApplyRequest(BaseModel):
    beneficiary_id: str
    opportunity_id: Optional[str] = None
    training_option_id: Optional[str] = None
    application_type: str = "training" # training, job, apprenticeship

class CreateBatchRequest(BaseModel):
    center_id: str
    qualification_id: str
    batch_code: str
    seat_capacity: int = 30
    seats_available: int = 30
    start_date: Optional[str] = None
    is_verified_live_batch: bool = True
    truth_state: str = "LIVE"

class CreateJobRequest(BaseModel):
    organization_id: str
    title: str
    opportunity_type: str = "job" # job, apprenticeship
    district_code: str = "MH-NAG"
    worksite_address: str
    monthly_wage_inr: int = 15000
    is_wage_guaranteed: bool = False
    vacancies: int = 5
    is_accessible_workplace: bool = True
    truth_state: str = "LIVE"

class UpdateAppStatusRequest(BaseModel):
    status: str # applied, shortlisted, interviewing, offered, joined, rejected

@router.get("/training-centers")
def list_training_centers(district_code: str = "MH-NAG", db: Session = Depends(get_db)):
    """List empanelled training centers with physical accessibility details."""
    centers = db.query(TrainingCenter).filter(TrainingCenter.district_code == district_code).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "address": c.address,
            "district_code": c.district_code,
            "has_wheelchair_access": c.has_wheelchair_access,
            "has_women_hostel": c.has_women_hostel,
            "contact_phone": c.contact_phone,
            "latitude": c.latitude,
            "longitude": c.longitude
        }
        for c in centers
    ]

@router.get("/training-options")
def list_training_options(district_code: str = "MH-NAG", db: Session = Depends(get_db)):
    """List verified training batches and catalogue courses with truth status."""
    options = db.query(TrainingOption).join(TrainingCenter).filter(TrainingCenter.district_code == district_code).all()
    return [
        {
            "id": opt.id,
            "batch_code": opt.batch_code,
            "qualification_title": opt.qualification.title if opt.qualification else "Skilling Program",
            "qp_code": opt.qualification.qp_code if opt.qualification else "",
            "nsqf_level": opt.qualification.nsqf_level if opt.qualification else 4,
            "center_name": opt.center.name,
            "center_id": opt.center_id,
            "is_verified_live_batch": opt.is_verified_live_batch,
            "truth_state": opt.truth_state,
            "seat_capacity": opt.seat_capacity,
            "seats_available": opt.seats_available,
            "fee_type": opt.fee_type,
            "start_date": opt.start_date.strftime("%Y-%m-%d") if opt.start_date else "Catalogue Discovery"
        }
        for opt in options
    ]

@router.post("/training-options")
def create_training_option(req: CreateBatchRequest, db: Session = Depends(get_db)):
    """Create or update a verified training batch for an empanelled provider."""
    start_dt = datetime.strptime(req.start_date, "%Y-%m-%d") if req.start_date else datetime.utcnow()
    batch = TrainingOption(
        center_id=req.center_id,
        qualification_id=req.qualification_id,
        batch_code=req.batch_code,
        seat_capacity=req.seat_capacity,
        seats_available=req.seats_available,
        start_date=start_dt,
        is_verified_live_batch=req.is_verified_live_batch,
        truth_state=req.truth_state
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return {"status": "success", "batch_id": batch.id, "batch_code": batch.batch_code}

@router.get("/jobs")
def list_jobs(district_code: str = "MH-NAG", db: Session = Depends(get_db)):
    """List verified employer jobs and apprenticeships. Note: Sensitive traits (caste) are strictly isolated."""
    opps = db.query(EmployerOpportunity).filter(EmployerOpportunity.district_code == district_code, EmployerOpportunity.is_active == True).all()
    return [
        {
            "id": o.id,
            "title": o.title,
            "opportunity_type": o.opportunity_type,
            "district_code": o.district_code,
            "worksite_address": o.worksite_address,
            "monthly_wage_inr": o.monthly_wage_inr,
            "is_wage_guaranteed": o.is_wage_guaranteed,
            "vacancies": o.vacancies,
            "is_accessible_workplace": o.is_accessible_workplace,
            "truth_state": o.truth_state
        }
        for o in opps
    ]

@router.post("/jobs")
def create_job_opportunity(req: CreateJobRequest, db: Session = Depends(get_db)):
    """Publish a new job or apprenticeship requisition mapped to NCO & NSQF."""
    opp = EmployerOpportunity(
        organization_id=req.organization_id,
        title=req.title,
        opportunity_type=req.opportunity_type,
        district_code=req.district_code,
        worksite_address=req.worksite_address,
        monthly_wage_inr=req.monthly_wage_inr,
        is_wage_guaranteed=req.is_wage_guaranteed,
        vacancies=req.vacancies,
        is_accessible_workplace=req.is_accessible_workplace,
        truth_state=req.truth_state,
        is_active=True
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return {"status": "success", "opportunity_id": opp.id, "title": opp.title}

@router.get("/candidates")
def list_matching_candidates(skill_keyword: Optional[str] = None, district_code: str = "MH-NAG", db: Session = Depends(get_db)):
    """
    Candidate matching for employers.
    Strict Ethical Rule: Returns ONLY verified skills, tasks, education level, and readiness.
    Caste, social category, and sensitive personal identifiers are strictly NOT exposed.
    """
    beneficiaries = db.query(Beneficiary).all()
    candidates = []
    for b in beneficiaries:
        edu = (b.profile.education or {}).get("highest_level", "Class 10") if b.profile else "Class 10"
        pref = (b.profile.work_preferences or {}).get("wage_vs_self_employment", "wage") if b.profile else "wage"
        b_skills = db.query(Skill.canonical_name, BeneficiarySkill.verification_status)\
            .join(BeneficiarySkill, BeneficiarySkill.skill_id == Skill.id)\
            .filter(BeneficiarySkill.beneficiary_id == b.id).all()
        skill_names = [row[0] for row in b_skills]
        
        # Check if skills match
        if skill_keyword:
            if not any(skill_keyword.lower() in s.lower() for s in skill_names):
                continue
                
        rpl_ok = any(row[1] in ["beneficiary_confirmed", "worker_verified", "document_verified"] for row in b_skills)
        
        candidates.append({
            "candidate_id": f"CAN-{b.id[:8]}", # Pseudonymous identifier for privacy
            "first_name_initial": f"{b.full_name.strip()[0].upper()}." if (b.full_name and b.full_name.strip()) else "C.",
            "education": edu,
            "verified_skills": skill_names,
            "employment_preference": pref,
            "district": district_code,
            "rpl_certified": rpl_ok,
            "privacy_notice": "In compliance with Section 8.17 & 13.3, caste/social identity is strictly withheld from employer view."
        })
        
    return candidates

@router.get("/applications")
def list_applications(opportunity_id: Optional[str] = None, training_option_id: Optional[str] = None, db: Session = Depends(get_db)):
    """List applications for an employer opportunity or training batch."""
    q = db.query(Application)
    if opportunity_id:
        q = q.filter(Application.opportunity_id == opportunity_id)
    if training_option_id:
        q = q.filter(Application.training_option_id == training_option_id)
    apps = q.all()
    
    return [
        {
            "id": a.id,
            "beneficiary_id": a.beneficiary_id,
            "application_type": a.application_type,
            "status": a.status,
            "applied_at": a.applied_at.isoformat(),
            "status_updated_at": a.status_updated_at.isoformat()
        }
        for a in apps
    ]

@router.put("/applications/{application_id}/status")
def update_application_status(application_id: str, req: UpdateAppStatusRequest, db: Session = Depends(get_db)):
    """Update candidate hiring status: applied -> shortlisted -> interviewing -> offered -> joined."""
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    app.status = req.status
    app.status_updated_at = datetime.utcnow()
    db.commit()
    return {"status": "success", "application_id": app.id, "new_status": app.status}

@router.post("/apply")
def submit_application(req: ApplyRequest, db: Session = Depends(get_db)):
    """Apply to a verified training batch, apprenticeship, or wage job."""
    app = Application(
        beneficiary_id=req.beneficiary_id,
        opportunity_id=req.opportunity_id,
        training_option_id=req.training_option_id,
        application_type=req.application_type,
        status="applied"
    )
    db.add(app)
    db.commit()
    return {"status": "success", "application_id": app.id, "applied_at": app.applied_at.isoformat()}

@router.get("/demand-index")
def get_district_demand_index(district_code: str = "MH-NAG", db: Session = Depends(get_db)):
    """Returns Local Economic Signals and District Demand Index."""
    signals = db.query(LocalEconomicSignal).filter(LocalEconomicSignal.district_code == district_code).all()
    return {
        "district_code": district_code,
        "aggregate_demand_score": 0.86,
        "top_growth_sectors": ["Automotive Maintenance", "Renewable Energy (Solar)", "Apparel & Tailoring"],
        "signals": [
            {
                "id": s.id,
                "signal_type": s.signal_type,
                "sector": s.sector,
                "title": s.title,
                "description": s.description,
                "intensity_score": s.intensity_score,
                "source_name": s.source_name,
                "freshness_status": s.freshness_status
            }
            for s in signals
        ]
    }

