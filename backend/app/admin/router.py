from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.admin.models import Source, AuditEvent
from backend.app.beneficiary.models import Beneficiary, BeneficiaryProfile
from backend.app.opportunities.models import TrainingOption, TrainingCenter, LocalEconomicSignal, EmployerOpportunity, AdminArea
from backend.app.knowledge.models import Qualification
from backend.app.shared.security import get_current_user, get_current_user_optional, require_roles

from backend.app.identity.policies import can_view_district_analytics
from backend.app.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])

class BatchSimulateRequest(BaseModel):
    district_code: str = "MH-NAG"
    qualification_code: str = "ASC/Q1411"
    proposed_capacity: int = Field(default=30, ge=1, le=1000)
    duration_days: int = Field(default=90, ge=1, le=730)
    include_hostel_subsidy: bool = False

class ProjectProposalRequest(BaseModel):
    project_title: str = Field(min_length=3, max_length=240, pattern=r"\S")
    target_district: str = "MH-NAG"
    target_beneficiary_count: int = Field(default=120, ge=1, le=100000)
    priority_sectors: List[str] = ["Automotive", "Apparel", "Solar PV"]
    estimated_budget_inr: float = Field(default=4500000.0, gt=0, le=1_000_000_000, allow_inf_nan=False)

@router.get("/dashboard")
def get_district_dashboard(
    district_code: str = "MH-NAG",
    db: Session = Depends(get_db),
    current_user: Any = Depends(require_roles("district_admin", "state_admin", "ministry_admin", "counsellor", "financial_counsellor"))
):
    """
    District Livelihood Intelligence Layer.
    Aggregates beneficiary demand, training supply, supply-demand gaps, and mobility barriers.
    Requires administrative or counselling authorization.
    """
    if not can_view_district_analytics(current_user, district_code, db):
        raise HTTPException(status_code=403, detail="District is outside your assigned jurisdiction")

    total_beneficiaries = db.query(Beneficiary).filter(Beneficiary.district_code == district_code).count()
    training_options = db.query(TrainingOption).join(TrainingCenter).filter(TrainingCenter.district_code == district_code).all()
    total_training_capacity = sum(opt.seat_capacity for opt in training_options)
    total_seats_available = sum(opt.seats_available for opt in training_options)

    # Compare recorded vacancies with recorded training seats for the same qualification.
    # No synthetic demand, percentages, source freshness or empty-database defaults.
    opportunities = db.query(EmployerOpportunity).filter(
        EmployerOpportunity.district_code == district_code,
        EmployerOpportunity.is_active.is_(True)
    ).all()
    qualification_ids = {x.qualification_id for x in training_options + opportunities if x.qualification_id}
    sector_demand = []
    for qualification_id in sorted(qualification_ids):
        qualification = db.query(Qualification).filter(Qualification.id == qualification_id).first()
        demand = sum(x.vacancies for x in opportunities if x.qualification_id == qualification_id)
        capacity = sum(x.seat_capacity for x in training_options if x.qualification_id == qualification_id)
        sector_demand.append({
            "sector": qualification.title if qualification else qualification_id,
            "expressed_demand_count": demand,
            "local_capacity": capacity,
            "gap": max(0, demand - capacity),
            "demand_trend": None,
            "truth_state": "DEMO_DATA" if settings.DEMO_MODE else "UNVERIFIED",
        })
    area = db.query(AdminArea).filter(AdminArea.code == district_code).first()
    return {
        "district_code": district_code,
        "district_name": area.name if area else district_code,
        "total_beneficiaries_onboarded": total_beneficiaries,
        "active_training_centers": db.query(TrainingCenter).filter(TrainingCenter.district_code == district_code).count(),
        "total_batch_capacity": total_training_capacity,
        "current_available_seats": total_seats_available,
        "recorded_vacancies": sum(x.vacancies for x in opportunities),
        "sector_demand_matrix": sector_demand,
        "barrier_indicators": None,
        "source_freshness_status": "See individual source records; freshness is not independently verified",
        "truth_state": "DEMO_DATA" if settings.DEMO_MODE else "UNVERIFIED",
    }

@router.post("/batch-planner")
def simulate_training_batch(
    req: BatchSimulateRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(require_roles("district_admin", "state_admin", "ministry_admin"))
):
    """
    Simulates proposing a new training batch.
    Requires district, state, or ministry admin authorization.
    """
    if not can_view_district_analytics(current_user, req.district_code, db):
        raise HTTPException(status_code=403, detail="District is outside your assigned jurisdiction")
    qual = db.query(Qualification).filter(Qualification.qp_code == req.qualification_code).first()
    if not qual:
        raise HTTPException(status_code=404, detail="Qualification code not found")

    # Illustrative planning assumptions only; not policy rates or funding entitlement.
    cost_per_trainee = qual.duration_hours * 48.50
    total_training_cost = cost_per_trainee * req.proposed_capacity
    stipend_cost = 1500 * (req.duration_days / 30) * req.proposed_capacity
    total_budget = total_training_cost + stipend_cost

    return {
        "proposed_batch": {
            "qualification_title": qual.title,
            "qp_code": qual.qp_code,
            "nsqf_level": qual.nsqf_level,
            "district_code": req.district_code,
            "proposed_capacity": req.proposed_capacity,
            "duration_days": req.duration_days
        },
        "feasibility_assessment": {
            "potential_candidate_pool_in_radius": None,
            "candidate_to_seat_ratio": None,
            "recommended_timing": "Not assessed",
            "hostel_needed": req.include_hostel_subsidy
        },
        "budget_breakdown_inr": {
            "cost_per_trainee": round(cost_per_trainee, 2),
            "total_tuition_cost": round(total_training_cost, 2),
            "stipend_and_uniform_allowance": round(stipend_cost, 2),
            "total_batch_budget_inr": round(total_budget, 2),
            "funding_component": "Illustrative estimate only. Funding and eligibility require separate verification.",
            "assumptions": {"hourly_training_rate_inr": 48.5, "monthly_allowance_inr": 1500}
        },
        "employer_linkages": [],
        "verdict": "READY_FOR_HUMAN_REVIEW",
        "decision_support_level": "Draft Proposal for District Review",
        "truth_state": "SANDBOX"
    }

@router.post("/project-planner")
def build_comprehensive_livelihood_project(
    req: ProjectProposalRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(require_roles("district_admin", "state_admin", "ministry_admin"))
):
    """
    Assembles evidence for a PM-AJAY Comprehensive Livelihood Project proposal.
    Requires district, state, or ministry admin authorization.
    """
    if not can_view_district_analytics(current_user, req.target_district, db):
        raise HTTPException(status_code=403, detail="District is outside your assigned jurisdiction")
    return {
        "project_title": req.project_title,
        "target_district": req.target_district,
        "target_sc_beneficiaries": req.target_beneficiary_count,
        "total_budget_inr": req.estimated_budget_inr,
        "truth_state": "SANDBOX",
        "executive_summary": (
            f"Comprehensive Livelihood Project for {req.target_beneficiary_count} SC candidates in {req.target_district} "
            f"considering trades ({', '.join(req.priority_sectors)}) for possible training, "
            f"RPL assessment, and enterprise support. Illustrative allocation only; no certification, eligibility or funding is approved."
        ),
        "components": [
            {
                "component_name": "NSQF Skilling & RPL Bridge",
                "allocation_inr": req.estimated_budget_inr * 0.45,
                "target_trainees": int(req.target_beneficiary_count * 0.70)
            },
            {
                "component_name": "Proposed enterprise equipment support (funding unverified)",
                "allocation_inr": req.estimated_budget_inr * 0.35,
                "target_enterprises": int(req.target_beneficiary_count * 0.30)
            },
            {
                "component_name": "Mobilization, Financial Counselling & Follow-up",
                "allocation_inr": req.estimated_budget_inr * 0.20,
                "activities": ["Field door-to-door profiling", "Trained financial counsellors", "30/90/180/365d retention checks"]
            }
        ],
        "kpis": {},
        "proposal_status": "DRAFT_PROPOSAL_GENERATED",
        "export_format": "JSON_DRAFT_ONLY"
    }

@router.get("/source-health")
def list_source_health(
    db: Session = Depends(get_db),
    current_user: Any = Depends(require_roles("district_admin", "state_admin", "ministry_admin", "counsellor", "financial_counsellor", "field_worker", "provider", "employer"))
):
    """Lists data sources, freshness SLA, and synchronization status for authenticated platform stakeholders."""
    sources = db.query(Source).all()
    return [
        {
            "id": s.id,
            "publisher": s.publisher,
            "source_name": s.source_name,
            "source_type": s.source_type,
            "canonical_url": s.canonical_url,
            "freshness_sla_days": s.freshness_sla_days,
            "last_success_at": s.last_success_at.strftime("%Y-%m-%d %H:%M:%S") if s.last_success_at else None,
            "quality_status": s.quality_status,
            "notes": s.notes
        }
        for s in sources
    ]

@router.get("/audit-logs")
def list_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: Any = Depends(require_roles("district_admin", "state_admin", "ministry_admin"))
):
    """Returns immutable security and override audit logs. Restricted strictly to administrators."""
    logs = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "actor_user_id": log.actor_user_id,
            "actor_role": log.actor_role,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "timestamp": log.created_at.isoformat()
        }
        for log in logs
    ]
