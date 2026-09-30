from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.admin.models import Source, AuditEvent
from backend.app.beneficiary.models import Beneficiary, BeneficiaryProfile
from backend.app.opportunities.models import TrainingOption, TrainingCenter, LocalEconomicSignal
from backend.app.knowledge.models import Qualification
from backend.app.shared.security import get_current_user, get_current_user_optional, require_roles

router = APIRouter(prefix="/admin", tags=["admin"])

class BatchSimulateRequest(BaseModel):
    district_code: str = "MH-NAG"
    qualification_code: str = "ASC/Q1411"
    proposed_capacity: int = 30
    duration_days: int = 90
    include_hostel_subsidy: bool = False

class ProjectProposalRequest(BaseModel):
    project_title: str
    target_district: str = "MH-NAG"
    target_beneficiary_count: int = 120
    priority_sectors: List[str] = ["Automotive", "Apparel", "Solar PV"]
    estimated_budget_inr: float = 4500000.0

@router.get("/dashboard")
def get_district_dashboard(
    district_code: str = "MH-NAG",
    db: Session = Depends(get_db),
    current_user: Optional[Any] = Depends(get_current_user_optional)
):
    """
    District Livelihood Intelligence Layer.
    Aggregates beneficiary demand, training supply, supply-demand gaps, and mobility barriers.
    """
    if current_user and current_user.role == "beneficiary":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Beneficiaries cannot access administrative intelligence"
        )

    total_beneficiaries = db.query(Beneficiary).filter(Beneficiary.district_code == district_code).count()
    training_options = db.query(TrainingOption).join(TrainingCenter).filter(TrainingCenter.district_code == district_code).all()
    total_training_capacity = sum(opt.seat_capacity for opt in training_options)
    total_seats_available = sum(opt.seats_available for opt in training_options)

    # Sector Demand Breakdown (Aggregated safely)
    sector_demand = [
        {"sector": "Automotive & Mechanical", "expressed_demand_count": 85, "local_capacity": 30, "gap": 55, "demand_trend": "+18%", "truth_state": "DEMO_DATA"},
        {"sector": "Apparel & Tailoring", "expressed_demand_count": 62, "local_capacity": 25, "gap": 37, "demand_trend": "+12%", "truth_state": "DEMO_DATA"},
        {"sector": "Solar & Green Jobs", "expressed_demand_count": 48, "local_capacity": 0, "gap": 48, "demand_trend": "+35%", "truth_state": "DEMO_DATA"},
        {"sector": "Logistics & Retail", "expressed_demand_count": 30, "local_capacity": 15, "gap": 15, "demand_trend": "+5%", "truth_state": "DEMO_DATA"}
    ]

    # Mobility & Inclusion Barrier Metrics
    barriers = {
        "restricted_mobility_under_10km_pct": 58.4,
        "caregiving_duties_reported_pct": 34.2,
        "prefer_self_employment_pct": 42.0,
        "unlettered_or_below_class_8_pct": 21.5,
        "wheelchair_or_accessible_center_needed_pct": 4.8,
        "truth_state": "DEMO_DATA"
    }

    return {
        "district_code": district_code,
        "district_name": "Nagpur (Maharashtra)",
        "total_beneficiaries_onboarded": total_beneficiaries or 124,
        "active_training_centers": 2,
        "total_batch_capacity": total_training_capacity or 55,
        "current_available_seats": total_seats_available or 22,
        "sector_demand_matrix": sector_demand,
        "barrier_indicators": barriers,
        "source_freshness_status": "All 4 official sources within freshness SLA",
        "truth_state": "DEMO_DATA"
    }

@router.post("/batch-planner")
def simulate_training_batch(req: BatchSimulateRequest, db: Session = Depends(get_db)):
    """
    Simulates proposing a new training batch.
    Calculates candidate pool, prerequisite feasibility, cost under PM-AJAY GIA norms,
    and employer linkages.
    """
    qual = db.query(Qualification).filter(Qualification.qp_code == req.qualification_code).first()
    if not qual:
        raise HTTPException(status_code=404, detail="Qualification code not found")

    # Estimated costs per PM-AJAY common norms: Rs. 48.50 per hour per candidate
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
            "potential_candidate_pool_in_radius": 68,
            "candidate_to_seat_ratio": 2.26,
            "recommended_timing": "Morning Batch (9:00 AM - 1:00 PM)",
            "hostel_needed": req.include_hostel_subsidy
        },
        "budget_breakdown_inr": {
            "cost_per_trainee": round(cost_per_trainee, 2),
            "total_tuition_cost": round(total_training_cost, 2),
            "stipend_and_uniform_allowance": round(stipend_cost, 2),
            "total_batch_budget_inr": round(total_budget, 2),
            "funding_component": "100% Grants-in-Aid (GIA) under PM-AJAY"
        },
        "employer_linkages": [
            "Mahindra First Choice Service Network (Hingna)",
            "Bajaj Auto Service Authorized Dealers (Nagpur)"
        ],
        "verdict": "READY_FOR_HUMAN_REVIEW",
        "decision_support_level": "Draft Proposal for District Review",
        "truth_state": "DEMO_DATA"
    }

@router.post("/project-planner")
def build_comprehensive_livelihood_project(req: ProjectProposalRequest, db: Session = Depends(get_db)):
    """
    Assembles evidence for a PM-AJAY Comprehensive Livelihood Project proposal.
    Integrates needs assessment, skill component, enterprise grant component,
    and monitoring framework.
    """
    return {
        "project_title": req.project_title,
        "target_district": req.target_district,
        "target_sc_beneficiaries": req.target_beneficiary_count,
        "total_budget_inr": req.estimated_budget_inr,
        "truth_state": "DEMO_DATA",
        "executive_summary": (
            f"Comprehensive Livelihood Project for {req.target_beneficiary_count} SC candidates in {req.target_district} "
            f"covering high-growth trades ({', '.join(req.priority_sectors)}) with 100% NSQF certification, "
            f"RPL assessment, micro-enterprise asset subsidies, and 12-month post-placement retention tracking."
        ),
        "components": [
            {
                "component_name": "NSQF Skilling & RPL Bridge",
                "allocation_inr": req.estimated_budget_inr * 0.45,
                "target_trainees": int(req.target_beneficiary_count * 0.70)
            },
            {
                "component_name": "Enterprise Asset & Tool Grant (up to Rs 50k/unit)",
                "allocation_inr": req.estimated_budget_inr * 0.35,
                "target_enterprises": int(req.target_beneficiary_count * 0.30)
            },
            {
                "component_name": "Mobilization, Financial Counselling & Follow-up",
                "allocation_inr": req.estimated_budget_inr * 0.20,
                "activities": ["Field door-to-door profiling", "Trained financial counsellors", "30/90/180/365d retention checks"]
            }
        ],
        "kpis": {
            "min_placement_rate": "70%",
            "min_rpl_certification_rate": "85%",
            "average_wage_target": "Rs. 14,000 - 18,000 / month",
            "micro_enterprise_survival_180d": "80%"
        },
        "proposal_status": "DRAFT_PROPOSAL_GENERATED",
        "export_format": "JSON_AND_OFFICIAL_ANNEXURE_READY"
    }

@router.get("/source-health")
def list_source_health(db: Session = Depends(get_db)):
    """Lists data sources, freshness SLA, and synchronization status."""
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
    current_user: Optional[Any] = Depends(get_current_user_optional)
):
    """Returns immutable security and override audit logs."""
    if current_user and current_user.role not in ["district_admin", "state_admin", "ministry_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only administrators can view audit logs"
        )
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
