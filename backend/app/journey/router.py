from datetime import datetime, timedelta, timezone
from typing import Optional, List, Any, Literal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.journey.models import Pathway, PathwayAction, Case, CaseEvent, Referral, Grievance, Followup, Outcome
from backend.app.beneficiary.models import Beneficiary
from backend.app.opportunities.models import Application
from backend.app.admin.models import AuditEvent
from backend.app.identity.policies import is_beneficiary_owner, can_view_beneficiary, can_edit_beneficiary, can_view_case
from backend.app.identity.models import Membership, Organization
from backend.app.shared.security import get_current_user, require_roles
from backend.app.config import settings

router = APIRouter(prefix="/journey", tags=["journey"])

class SelectPathwayRequest(BaseModel):
    beneficiary_id: str
    title: str = Field(min_length=3, max_length=240, pattern=r"\S")
    pathway_category: Literal["wage_employment", "self_employment", "rpl_certification"] = "wage_employment" # wage_employment, self_employment, rpl_certification
    qualification_id: Optional[str] = None

class UpdateActionRequest(BaseModel):
    status: Literal["pending", "in_progress", "completed", "skipped"]

class CounsellorOverrideRequest(BaseModel):
    counsellor_user_id: Optional[str] = None
    original_recommendation_title: str
    new_pathway_title: str = Field(min_length=3, max_length=240, pattern=r"\S")
    mandatory_reason: str = Field(min_length=3, max_length=2000, pattern=r"\S")

class SubmitGrievanceRequest(BaseModel):
    beneficiary_id: str
    category: str
    title: str = Field(min_length=3, max_length=200, pattern=r"\S")
    description: str = Field(min_length=10, max_length=4000, pattern=r"\S")

class UpdateCoordinationStatusRequest(BaseModel):
    status: Literal["pending", "acknowledged", "in_progress", "enrolled", "rejected", "completed", "escalated"]
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
def file_grievance(
    req: SubmitGrievanceRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Submit a beneficiary grievance with registered audit ID and ownership check."""
    ben = db.query(Beneficiary).filter(Beneficiary.id == req.beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=404, detail="Beneficiary not found")

    if current_user.role == "beneficiary":
        if not is_beneficiary_owner(current_user, ben):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Beneficiaries can only file grievances for themselves")
    elif current_user.role in ["employer", "provider"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Unauthorized role to file beneficiary grievances")

    if not can_edit_beneficiary(current_user, ben, db):
        raise HTTPException(status_code=403, detail="Beneficiary is outside your authorized scope")
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
def list_cases(
    district_code: str = "MH-NAG",
    db: Session = Depends(get_db),
    current_user: Any = Depends(require_roles("field_worker", "counsellor", "financial_counsellor", "district_admin", "state_admin", "ministry_admin"))
):
    """List assigned cases for field workers and counsellors with jurisdiction scoping."""
    cases = db.query(Case).all()
    res = []
    for c in cases:
        ben = c.beneficiary or db.query(Beneficiary).filter(Beneficiary.id == c.beneficiary_id).first()
        if not ben or not can_view_case(current_user, c, db) or (district_code and ben.district_code != district_code):
            continue
        pathway = db.query(Pathway).filter(Pathway.beneficiary_id == ben.id, Pathway.status == "active").first()
        ref = db.query(Referral).filter(Referral.case_id == c.id).order_by(Referral.created_at.desc()).first()
        res.append({
            "id": c.id,
            "beneficiary_id": ben.id,
            "beneficiary_name": ben.full_name,
            "village": ", ".join(x for x in [ben.village_name, ben.block_name] if x) or "Not recorded",
            "phone": ben.phone or "Not provided",
            "current_rec": pathway.title if pathway else None,
            "blocker": ref.blocker_reason if (ref and ref.blocker_reason) else None,
            "next_action": ref.purpose if (ref and ref.purpose) else ("Complete field intake assessment" if c.status == "open" else "Review pathway selection"),
            "status": c.status.replace("_", " ").title(),
            "priority": c.priority.title() if c.priority else "Medium",
            "verified": ben.work_experiences[0].is_verified if (ben.work_experiences and len(ben.work_experiences) > 0) else False
        })
    return res

def _can_access_referral(user, referral, db):
    if user.role == "provider":
        return bool(referral.target_organization_id) and db.query(Membership).filter(
            Membership.user_id == user.id,
            Membership.organization_id == referral.target_organization_id
        ).first() is not None
    return bool(referral.case) and can_view_case(user, referral.case, db)


@router.get("/coordination")
def list_coordination_items(
    db: Session = Depends(get_db),
    current_user: Any = Depends(require_roles("field_worker", "counsellor", "financial_counsellor", "provider", "district_admin", "state_admin", "ministry_admin"))
):
    """Inter-Agency Coordination workspace: lists cross-department referrals, SLA, and blockers."""
    from backend.app.journey.models import Referral
    referrals = db.query(Referral).all()
    items = []
    for r in referrals:
        if not _can_access_referral(current_user, r, db):
            continue
        c = r.case
        ben = None
        if c:
            ben = c.beneficiary or db.query(Beneficiary).filter(Beneficiary.id == c.beneficiary_id).first()
        now = datetime.now(timezone.utc)
        # sla_due_date stored as naive UTC in DB — coerce to aware before subtracting
        sla = r.sla_due_date
        if sla is not None and sla.tzinfo is None:
            sla = sla.replace(tzinfo=timezone.utc)
        days_remaining = (sla - now).days if sla else None
        target = db.query(Organization).filter(Organization.id == r.target_organization_id).first() if r.target_organization_id else None
        items.append({
            "id": r.id,
            "beneficiary_name": ben.full_name if ben else "Beneficiary",
            "from_dept": "Case team",
            "to_dept": target.name if target else "Not assigned",
            "action_required": r.purpose,
            "sla_days_remaining": days_remaining,
            "status": r.status.replace("_", " ").title(),
            "blocker": r.blocker_reason or "None"
        })
    return items

@router.put("/coordination/{referral_id}/status")
def update_coordination_status(
    referral_id: str,
    req: UpdateCoordinationStatusRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(require_roles("field_worker", "counsellor", "financial_counsellor", "provider", "district_admin", "state_admin", "ministry_admin"))
):
    """Update referral state and SLA blocker in coordination workspace."""
    from backend.app.journey.models import Referral
    ref = db.query(Referral).filter(Referral.id == referral_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Referral item not found")
    if not _can_access_referral(current_user, ref, db):
        raise HTTPException(status_code=403, detail="Referral is outside your authorized scope")
    ref.status = req.status
    if req.blocker_reason is not None:
        ref.blocker_reason = req.blocker_reason
    db.commit()
    return {"status": "updated", "referral_id": ref.id, "new_status": ref.status}

@router.get("/enterprise/{beneficiary_id}")
def get_or_create_enterprise_plan(
    beneficiary_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Read a saved enterprise draft. A GET never invents or creates a plan."""
    ben = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    if not can_view_beneficiary(current_user, ben, db):
        raise HTTPException(status_code=403, detail="Enterprise plan is outside your authorized scope")

    from backend.app.admin.models import EnterprisePlan
    plan = db.query(EnterprisePlan).filter(EnterprisePlan.beneficiary_id == beneficiary_id).first()
    if not plan:
        return None
    return {
        "beneficiary_id": ben.id,
        "beneficiary_name": ben.full_name,
        "target_enterprise": plan.activity_title,
        "district": ben.district_code,
        "assumed_capital_needs": {
            "equipment_capex": plan.indicative_startup_capital_inr,
            "working_capital_opex": plan.indicative_working_capital_inr,
            "total_estimated_inr": plan.indicative_startup_capital_inr + plan.indicative_working_capital_inr,
            "break_even_months": plan.assumed_break_even_months
        },
        "scheme_prescreening": [
            {
                "scheme_name": name,
                "indicative_amount": "Not verified",
                "status": "For counsellor review only",
                "condition": "Verify current official eligibility and terms. No sanction or approval is implied."
            }
            for name in (plan.finance_schemes_considered or [])
        ],
        "literacy_checklist": [
            {"task": "Understand the difference between revenue and profit", "done": False},
            {"task": "Record business income and expenses", "done": False},
            {"task": "Separate household and business expenses", "done": False}
        ],
        "status": plan.status,
        "truth_state": "DEMO_DATA" if settings.DEMO_MODE else "UNVERIFIED"
    }

@router.post("/outcomes")
def record_outcome(
    req: RecordOutcomeRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(require_roles("field_worker", "counsellor", "employer", "provider", "district_admin", "state_admin", "ministry_admin"))
):
    """Record durable livelihood outcome and retention verification."""
    outcome = Outcome(
        beneficiary_id=req.beneficiary_id,
        outcome_type=req.outcome_type,
        organization_name=req.organization_name,
        wage_band_inr=req.wage_band_inr,
        retention_90d_verified=req.retention_90d_verified,
        retention_180d_verified=req.retention_180d_verified,
        verified_at=datetime.now(timezone.utc)
    )
    db.add(outcome)
    db.commit()
    db.refresh(outcome)
    return {"status": "outcome_recorded", "outcome_id": outcome.id, "milestone": "30_day" if req.retention_90d_verified else "initial"}

@router.get("/me")
def get_my_journey(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Retrieve journey home for currently authenticated beneficiary."""
    if current_user.role != "beneficiary":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: /journey/me is reserved for beneficiary accounts")
    ben = db.query(Beneficiary).filter(Beneficiary.user_id == current_user.id).first()
    if not ben and settings.DEMO_MODE:
        if str(current_user.id).startswith("demo-"):
            ben = db.query(Beneficiary).filter(Beneficiary.phone == "9876543210").first()
    if not ben:
        raise HTTPException(status_code=404, detail="No beneficiary profile linked to current user")
    return get_beneficiary_journey_home(ben.id, db, current_user)

@router.get("/{beneficiary_id}")
def get_beneficiary_journey_home(
    beneficiary_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
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

    if current_user.role in ["employer", "provider"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Unauthorized role for journey home")
    if current_user.role == "beneficiary":
        if not is_beneficiary_owner(current_user, ben):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Cannot view another beneficiary's journey")

    if not can_view_beneficiary(current_user, ben, db):
        raise HTTPException(status_code=403, detail="Beneficiary is outside your authorized scope")
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

    if not next_step and not pathway:
        next_step = {
            "action_id": "initial-profile",
            "title": "Complete your voice interview",
            "description": "Speak with the assistant to discover your self-reported skills and pathways.",
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
                "action_type": a.action_type,
                "title": a.title,
                "description": a.description,
                "status": a.status,
                "order_index": a.order_index,
                "due_date": a.due_date.isoformat() if a.due_date else None
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
def select_pathway(
    req: SelectPathwayRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Beneficiary selects a pathway; auto-generates sequential actionable steps."""
    ben = db.query(Beneficiary).filter(Beneficiary.id == req.beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=404, detail="Beneficiary not found")

    if current_user.role in ["employer", "provider"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Unauthorized role for pathway selection")
    if current_user.role == "beneficiary":
        if not is_beneficiary_owner(current_user, ben):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Cannot select pathway for another beneficiary")

    if not can_edit_beneficiary(current_user, ben, db):
        raise HTTPException(status_code=403, detail="Beneficiary is outside your authorized scope")

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
            title="Check the documents needed for your chosen pathway",
            description="Ask your counsellor which documents are required. Requirements depend on the opportunity; do not upload unnecessary sensitive documents.",
            order_index=1,
            due_date=datetime.now(timezone.utc) + timedelta(days=3)
        ),
        PathwayAction(
            pathway_id=pathway.id,
            action_type="rpl_precheck",
            title="Practical Skill Verification & RPL Pre-check",
            description="Complete a short hands-on task review with field counsellor or training center assessor.",
            order_index=2,
            due_date=datetime.now(timezone.utc) + timedelta(days=7)
        ),
        PathwayAction(
            pathway_id=pathway.id,
            action_type="enrollment_or_enterprise",
            title="Review available training or enterprise support",
            description="Check current availability, costs and eligibility with the provider. A recommendation is not a confirmed seat or grant.",
            order_index=3,
            due_date=datetime.now(timezone.utc) + timedelta(days=14)
        ),
        PathwayAction(
            pathway_id=pathway.id,
            action_type="placement_linkage",
            title="Post-Skilling Apprenticeship / Workshop Linkage",
            description="Discuss current work or enterprise opportunities with your counsellor. Placement and finance are not guaranteed.",
            order_index=4,
            due_date=datetime.now(timezone.utc) + timedelta(days=60)
        )
    ]
    db.add_all(actions)
    db.commit()

    return {"status": "success", "pathway_id": pathway.id, "title": pathway.title}

@router.put("/actions/{action_id}")
def update_action_status(
    action_id: str,
    req: UpdateActionRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Update action status with completion timestamp and ownership guard."""
    act = db.query(PathwayAction).filter(PathwayAction.id == action_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Action not found")

    pathway = db.query(Pathway).filter(Pathway.id == act.pathway_id).first()
    if not pathway:
        raise HTTPException(status_code=404, detail="Pathway not found")

    ben = db.query(Beneficiary).filter(Beneficiary.id == pathway.beneficiary_id).first()
    if current_user.role == "beneficiary":
        if not is_beneficiary_owner(current_user, ben):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Cannot update actions for another beneficiary")
    elif current_user.role in ["employer", "provider"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Unauthorized role for action updates")

    if not can_edit_beneficiary(current_user, ben, db):
        raise HTTPException(status_code=403, detail="Beneficiary is outside your authorized scope")
    act.status = req.status
    if req.status == "completed":
        act.completed_at = datetime.now(timezone.utc)
    else:
        act.completed_at = None
    db.commit()
    return {"status": "updated", "action_id": act.id, "new_status": act.status}

@router.post("/cases/{case_id}/override")
def counsellor_override(
    case_id: str,
    req: CounsellorOverrideRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(require_roles("counsellor", "financial_counsellor", "district_admin", "state_admin", "ministry_admin"))
):
    """Counsellor overrides AI recommendation. Mandatory reason is logged in immutable audit."""
    if not req.mandatory_reason.strip():
        raise HTTPException(status_code=400, detail="Mandatory reason must be provided for override")

    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if not can_view_case(current_user, case, db):
        raise HTTPException(status_code=403, detail="Case is outside your authorized scope")

    # Add case event with trusted authenticated actor
    event = CaseEvent(
        case_id=case_id,
        actor_user_id=current_user.id,
        event_type="recommendation_override",
        notes=f"Overrode '{req.original_recommendation_title}' with '{req.new_pathway_title}'. Reason: {req.mandatory_reason}"
    )
    db.add(event)

    # Add audit event with trusted authenticated actor
    audit = AuditEvent(
        actor_user_id=current_user.id,
        actor_role=current_user.role,
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

    return {"status": "override_recorded", "case_id": case_id, "audit_id": audit.id}
