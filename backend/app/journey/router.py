from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.journey.models import Pathway, PathwayAction, Case, CaseEvent, Grievance, Followup, Outcome
from backend.app.beneficiary.models import Beneficiary
from backend.app.opportunities.models import Application
from backend.app.admin.models import AuditEvent

router = APIRouter(prefix="/journey", tags=["journey"])

class SelectPathwayRequest(BaseModel):
    beneficiary_id: str
    title: str
    pathway_category: str = "wage_employment" # wage_employment, self_employment, rpl_certification
    qualification_id: Optional[str] = None

class UpdateActionRequest(BaseModel):
    status: str # pending, in_progress, completed, skipped

class CounsellorOverrideRequest(BaseModel):
    counsellor_user_id: str
    original_recommendation_title: str
    new_pathway_title: str
    mandatory_reason: str

class SubmitGrievanceRequest(BaseModel):
    beneficiary_id: str
    category: str
    title: str
    description: str

class UpdateCoordinationStatusRequest(BaseModel):
    status: str
    blocker_reason: Optional[str] = None
    notes: Optional[str] = None

class RecordOutcomeRequest(BaseModel):
    beneficiary_id: str
    outcome_type: str # placed_wage_job, started_enterprise, certified_rpl
    organization_name: Optional[str] = None
    wage_band_inr: Optional[str] = "15000-18000"
    retention_90d_verified: bool = True
    retention_180d_verified: bool = False

@router.post("/grievance")
@router.post("/grievances")
def file_grievance(req: SubmitGrievanceRequest, db: Session = Depends(get_db)):
    """Submit a beneficiary grievance with registered audit ID."""
    g = Grievance(
        beneficiary_id=req.beneficiary_id,
        category=req.category,
        title=req.title,
        description=req.description,
        status="submitted"
    )
    db.add(g)
    db.commit()
    return {"status": "submitted", "grievance_id": g.id}

@router.get("/cases")
def list_cases(district_code: str = "MH-NAG", db: Session = Depends(get_db)):
    """List assigned cases for field workers and counsellors."""
    cases = db.query(Case).all()
    res = []
    for c in cases:
        ben = c.beneficiary or db.query(Beneficiary).filter(Beneficiary.id == c.beneficiary_id).first()
        if not ben or (district_code and ben.district_code != district_code):
            continue
        pathway = db.query(Pathway).filter(Pathway.beneficiary_id == ben.id, Pathway.status == "active").first()
        res.append({
            "id": c.id,
            "beneficiary_id": ben.id,
            "beneficiary_name": ben.full_name,
            "village": f"{ben.village_name or 'Central'}, {ben.block_name or 'Nagpur'}",
            "phone": ben.phone or "Not provided",
            "current_rec": pathway.title if pathway else "Two-Wheeler Service Technician (Wage)",
            "status": c.status.replace("_", " ").title(),
            "priority": c.priority,
            "verified": ben.work_experiences[0].is_verified if (ben.work_experiences and len(ben.work_experiences) > 0) else False
        })
    return res

@router.get("/coordination")
def list_coordination_items(db: Session = Depends(get_db)):
    """Inter-Agency Coordination workspace: lists cross-department referrals, SLA, and blockers."""
    from backend.app.journey.models import Referral
    referrals = db.query(Referral).all()
    items = []
    for r in referrals:
        c = r.case
        ben = None
        if c:
            ben = c.beneficiary or db.query(Beneficiary).filter(Beneficiary.id == c.beneficiary_id).first()
        now = datetime.utcnow()
        days_remaining = (r.sla_due_date - now).days if r.sla_due_date else 3
        items.append({
            "id": r.id,
            "beneficiary_name": ben.full_name if ben else "Beneficiary",
            "from_dept": "District Skill Committee (DSC) Nagpur",
            "to_dept": "Vidarbha Skills Academy (PIA)" if r.referral_type == "training_center" else "MPBCDC / Bank",
            "action_required": r.purpose,
            "sla_days_remaining": days_remaining,
            "status": r.status.replace("_", " ").title(),
            "blocker": r.blocker_reason or "None"
        })
    return items

@router.put("/coordination/{referral_id}/status")
def update_coordination_status(referral_id: str, req: UpdateCoordinationStatusRequest, db: Session = Depends(get_db)):
    """Update referral state and SLA blocker in coordination workspace."""
    from backend.app.journey.models import Referral
    ref = db.query(Referral).filter(Referral.id == referral_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Referral item not found")
    ref.status = req.status
    if req.blocker_reason is not None:
        ref.blocker_reason = req.blocker_reason
    db.commit()
    return {"status": "updated", "referral_id": ref.id, "new_status": ref.status}

@router.get("/enterprise/{beneficiary_id}")
def get_or_create_enterprise_plan(beneficiary_id: str, db: Session = Depends(get_db)):
    """Financial & Enterprise Counsellor: returns structured capital bands and pre-screened schemes."""
    ben = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=404, detail="Beneficiary not found")

    from backend.app.admin.models import EnterprisePlan
    plan = db.query(EnterprisePlan).filter(EnterprisePlan.beneficiary_id == beneficiary_id).first()

    if not plan:
        plan = EnterprisePlan(
            beneficiary_id=beneficiary_id,
            activity_title="Two-Wheeler Service & Spare Parts Center",
            sector="Automotive",
            indicative_startup_capital_inr=75000,
            indicative_working_capital_inr=25000,
            assumed_break_even_months=6,
            equipment_needed=["Hydraulic bike ramp", "Air compressor", "Comprehensive toolkit"],
            target_customers=["Local village commuters", "Farmers with 2-wheelers"],
            finance_schemes_considered=["PM-AJAY GIA Enterprise Subsidy", "NSFDC Term Loan", "MUDRA Shishu"],
            status="draft"
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

    return {
        "beneficiary_id": ben.id,
        "beneficiary_name": ben.full_name,
        "target_enterprise": plan.activity_title,
        "district": f"{ben.district_code} (MH)",
        "assumed_capital_needs": {
            "equipment_capex": plan.indicative_startup_capital_inr,
            "working_capital_opex": plan.indicative_working_capital_inr,
            "total_estimated_inr": plan.indicative_startup_capital_inr + plan.indicative_working_capital_inr,
            "break_even_months": plan.assumed_break_even_months
        },
        "scheme_prescreening": [
            {
                "scheme_name": "PM-AJAY Grants-in-Aid (GIA) Asset Subsidy",
                "indicative_amount": "Up to ₹50,000 (100% Grant)",
                "status": "Potentially Relevant (Pre-screening)",
                "condition": "SC candidate with verified income and NSQF L4 competency. Statutory sanction by DSC."
            },
            {
                "scheme_name": "NSFDC Micro-Credit Scheme",
                "indicative_amount": "Up to ₹50,000 at 5% Concessional Interest",
                "status": "Recommended for Balance Working Capital",
                "condition": "Requires project viability endorsement by Financial Counsellor."
            },
            {
                "scheme_name": "MUDRA Shishu Loan",
                "indicative_amount": "Up to ₹50,000 collateral-free",
                "status": "Alternative Bank Credit Linkage",
                "condition": "Commercial bank credit linkage with active Aadhaar DBT account."
            }
        ],
        "literacy_checklist": [
            {"task": "Understand difference between revenue and profit", "done": True},
            {"task": "Setup UPI Merchant QR code (PhonePe/GPay for shop)", "done": True},
            {"task": "Weekly physical cashbook logging", "done": False},
            {"task": "Separate personal household expenses from shop account", "done": False}
        ],
        "truth_state": "DEMO_DATA"
    }

@router.post("/outcomes")
def record_outcome(req: RecordOutcomeRequest, db: Session = Depends(get_db)):
    """Record durable livelihood outcome and retention verification."""
    outcome = Outcome(
        beneficiary_id=req.beneficiary_id,
        outcome_type=req.outcome_type,
        organization_name=req.organization_name,
        wage_band_inr=req.wage_band_inr,
        retention_90d_verified=req.retention_90d_verified,
        retention_180d_verified=req.retention_180d_verified,
        verified_at=datetime.utcnow()
    )
    db.add(outcome)
    db.commit()
    db.refresh(outcome)
    return {"status": "outcome_recorded", "outcome_id": outcome.id, "milestone": "30_day" if req.retention_90d_verified else "initial"}

@router.get("/{beneficiary_id}")
def get_beneficiary_journey_home(beneficiary_id: str, db: Session = Depends(get_db)):
    """
    Returning-user home endpoint.
    Prioritizes:
    1. Single dominant Next Step
    2. Active Living Pathway and progress
    3. Action Plan checklist
    4. Application status
    """
    ben = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=404, detail="Beneficiary not found")

    pathway = db.query(Pathway).filter(Pathway.beneficiary_id == beneficiary_id, Pathway.status == "active").first()
    actions = []
    next_step = None

    if pathway:
        actions = db.query(PathwayAction).filter(PathwayAction.pathway_id == pathway.id).order_by(PathwayAction.order_index).all()
        for act in actions:
            if act.status != "completed":
                next_step = {
                    "action_id": act.id,
                    "title": act.title,
                    "description": act.description,
                    "due_date": act.due_date.strftime("%Y-%m-%d") if act.due_date else "Soon"
                }
                break

    if not next_step:
        next_step = {
            "action_id": "initial-profile",
            "title": "Complete your voice interview",
            "description": "Speak with the assistant to discover your verified skill graph and pathways.",
            "due_date": "Today"
        }

    apps = db.query(Application).filter(Application.beneficiary_id == beneficiary_id).all()

    return {
        "beneficiary_id": ben.id,
        "beneficiary_name": ben.full_name,
        "district_code": ben.district_code,
        "active_pathway": {
            "id": pathway.id,
            "title": pathway.title,
            "category": pathway.pathway_category,
            "status": pathway.status
        } if pathway else None,
        "next_step": next_step,
        "action_plan": [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "status": a.status,
                "order_index": a.order_index
            }
            for a in actions
        ],
        "applications": [
            {
                "id": app.id,
                "application_type": app.application_type,
                "status": app.status,
                "applied_at": app.applied_at.strftime("%Y-%m-%d")
            }
            for app in apps
        ]
    }

@router.post("/select-pathway")
def select_pathway(req: SelectPathwayRequest, db: Session = Depends(get_db)):
    """Beneficiary selects a pathway; auto-generates sequential actionable steps."""
    # Deactivate existing active pathways
    db.query(Pathway).filter(Pathway.beneficiary_id == req.beneficiary_id, Pathway.status == "active").update({"status": "archived"})

    pathway = Pathway(
        beneficiary_id=req.beneficiary_id,
        title=req.title,
        pathway_category=req.pathway_category,
        status="active"
    )
    db.add(pathway)
    db.flush()

    # Generate Closed-Loop Action Plan Steps
    actions = [
        PathwayAction(
            pathway_id=pathway.id,
            action_type="document_collection",
            title="Prepare Mandatory Scheme Documents",
            description="Collect Caste Certificate, BPL/Income Proof, and Aadhaar-linked Bank Passbook.",
            order_index=1,
            due_date=datetime.utcnow() + timedelta(days=3)
        ),
        PathwayAction(
            pathway_id=pathway.id,
            action_type="rpl_precheck",
            title="Practical Skill Verification & RPL Pre-check",
            description="Complete a short hands-on task review with field counsellor or training center assessor.",
            order_index=2,
            due_date=datetime.utcnow() + timedelta(days=7)
        ),
        PathwayAction(
            pathway_id=pathway.id,
            action_type="enrollment_or_enterprise",
            title="Confirm Free Skilling Batch or Micro-Enterprise Grant",
            description="Seat confirmation under PM-AJAY GIA subsidized quota with DSC Nagpur.",
            order_index=3,
            due_date=datetime.utcnow() + timedelta(days=14)
        ),
        PathwayAction(
            pathway_id=pathway.id,
            action_type="placement_linkage",
            title="Post-Skilling Apprenticeship / Workshop Linkage",
            description="Interview with verified employer network or loan subsidy linkage under NSFDC.",
            order_index=4,
            due_date=datetime.utcnow() + timedelta(days=60)
        )
    ]
    db.add_all(actions)
    db.commit()

    return {"status": "success", "pathway_id": pathway.id, "title": pathway.title}

@router.put("/actions/{action_id}")
def update_action_status(action_id: str, req: UpdateActionRequest, db: Session = Depends(get_db)):
    """Update action status with completion timestamp."""
    act = db.query(PathwayAction).filter(PathwayAction.id == action_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Action not found")
    act.status = req.status
    if req.status == "completed":
        act.completed_at = datetime.utcnow()
    db.commit()
    return {"status": "updated", "action_id": act.id, "new_status": act.status}

@router.post("/cases/{case_id}/override")
def counsellor_override(case_id: str, req: CounsellorOverrideRequest, db: Session = Depends(get_db)):
    """Counsellor overrides AI recommendation. Mandatory reason is logged in immutable audit."""
    if not req.mandatory_reason.strip():
        raise HTTPException(status_code=400, detail="Mandatory reason must be provided for override")

    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Add case event
    event = CaseEvent(
        case_id=case_id,
        actor_user_id=req.counsellor_user_id,
        event_type="recommendation_override",
        notes=f"Overrode '{req.original_recommendation_title}' with '{req.new_pathway_title}'. Reason: {req.mandatory_reason}"
    )
    db.add(event)

    # Add audit event
    audit = AuditEvent(
        actor_user_id=req.counsellor_user_id,
        actor_role="counsellor",
        action="counsellor_override",
        entity_type="case",
        entity_id=case_id,
        details={
            "original_title": req.original_recommendation_title,
            "new_title": req.new_pathway_title,
            "reason": req.mandatory_reason
        }
    )
    db.add(audit)
    db.commit()

    return {"status": "override_recorded", "case_id": case_id}


