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

@router.post("/grievances")
def file_grievance(req: SubmitGrievanceRequest, db: Session = Depends(get_db)):
    """Submit a beneficiary grievance."""
    g = Grievance(
        beneficiary_id=req.beneficiary_id,
        category=req.category,
        title=req.title,
        description=req.description,
        status="submitted"
    )
    db.add(g)
    db.commit()
    return {"status": "grievance_registered", "grievance_id": g.id}
