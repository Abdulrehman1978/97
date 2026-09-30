import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class RecommendationRun(Base):
    __tablename__ = "recommendation_runs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    beneficiary_id = Column(String, ForeignKey("beneficiaries.id"), nullable=False, index=True)
    engine_version = Column(String, default="v3.0.0-hybrid")
    execution_time_ms = Column(Integer, default=45)
    created_at = Column(DateTime, default=datetime.utcnow)

    recommendations = relationship("Recommendation", back_populates="run", cascade="all, delete-orphan")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    run_id = Column(String, ForeignKey("recommendation_runs.id"), nullable=False, index=True)
    beneficiary_id = Column(String, ForeignKey("beneficiaries.id"), nullable=False, index=True)
    occupation_id = Column(String, ForeignKey("occupations.id"), nullable=False)
    qualification_id = Column(String, ForeignKey("qualifications.id"), nullable=False)
    pathway_type = Column(String, nullable=False) # wage_fit_now, growth_pathway, self_employment_pathway, rpl_certification
    fit_band = Column(String, default="Strong current-skill fit") # Strong, Promising, Developing
    overall_score = Column(Float, default=0.88)
    
    # Explainable factor weights
    factor_scores = Column(JSON, default=lambda: {
        "skill_transfer": 0.85,
        "travel_mobility_fit": 0.95,
        "local_demand_evidence": 0.80,
        "preference_alignment": 0.90,
        "qualification_validity": 1.0
    })
    
    explanation_beneficiary = Column(Text, nullable=False)
    explanation_counsellor = Column(Text, nullable=True)
    counterfactual_hints = Column(JSON, default=list) # e.g. ["Expanding travel to 20km unlocks 2 more certified centers"]
    uncertainty_level = Column(String, default="low") # low, moderate, needs_field_verification
    truth_state = Column(String, default="LIVE")
    rank = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("RecommendationRun", back_populates="recommendations")
    occupation = relationship("Occupation")
    qualification = relationship("Qualification")
    skill_gaps = relationship("SkillGap", back_populates="recommendation", cascade="all, delete-orphan")

class SkillGap(Base):
    __tablename__ = "skill_gaps"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    recommendation_id = Column(String, ForeignKey("recommendations.id"), nullable=False, index=True)
    competency_name = Column(String, nullable=False)
    gap_severity = Column(String, default="core_skill_to_learn") # demonstrated, needs_strengthening, core_skill_to_learn, mandatory_prerequisite
    how_to_close = Column(String, default="Covered in NSQF module 3")
    nos_code = Column(String, nullable=True)

    recommendation = relationship("Recommendation", back_populates="skill_gaps")

class Pathway(Base):
    __tablename__ = "pathways"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    beneficiary_id = Column(String, ForeignKey("beneficiaries.id"), nullable=False, index=True)
    recommendation_id = Column(String, ForeignKey("recommendations.id"), nullable=True)
    title = Column(String, nullable=False)
    pathway_category = Column(String, default="wage_employment") # wage_employment, apprenticeship, self_employment, rpl_certification
    status = Column(String, default="active") # active, completed, modified, paused
    selected_at = Column(DateTime, default=datetime.utcnow)

    actions = relationship("PathwayAction", back_populates="pathway", cascade="all, delete-orphan")

class PathwayAction(Base):
    __tablename__ = "pathway_actions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    pathway_id = Column(String, ForeignKey("pathways.id"), nullable=False, index=True)
    action_type = Column(String, nullable=False) # document_prep, rpl_check, training_enrollment, finance_consultation, job_interview
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="pending") # pending, in_progress, completed, skipped
    order_index = Column(Integer, default=1)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    pathway = relationship("Pathway", back_populates="actions")

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    beneficiary_id = Column(String, ForeignKey("beneficiaries.id"), nullable=False, index=True)
    assigned_to_user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    case_type = Column(String, default="standard_livelihood") # standard_livelihood, self_employment_finance, rpl_fast_track
    status = Column(String, default="open") # open, referred_to_training, in_counselling, placed, escalated, resolved, closed
    priority = Column(String, default="medium") # low, medium, high, urgent
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    events = relationship("CaseEvent", back_populates="case", cascade="all, delete-orphan")
    referrals = relationship("Referral", back_populates="case", cascade="all, delete-orphan")
    followups = relationship("Followup", back_populates="case", cascade="all, delete-orphan")
    beneficiary = relationship("Beneficiary")

class CaseEvent(Base):
    __tablename__ = "case_events"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False, index=True)
    actor_user_id = Column(String, nullable=True)
    event_type = Column(String, nullable=False) # note, recommendation_override, interview_update, contact_attempt, escalation
    notes = Column(Text, nullable=False)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="events")

class Referral(Base):
    __tablename__ = "referrals"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False, index=True)
    target_organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    referral_type = Column(String, nullable=False) # training_center, financial_counsellor, employer, government_welfare
    purpose = Column(String, nullable=False)
    status = Column(String, default="pending") # pending, acknowledged, enrolled, rejected, completed
    sla_due_date = Column(DateTime, nullable=True)
    blocker_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="referrals")

class Followup(Base):
    __tablename__ = "followups"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False, index=True)
    milestone_days = Column(Integer, default=30) # 30, 90, 180, 365
    scheduled_date = Column(DateTime, nullable=False)
    completed_date = Column(DateTime, nullable=True)
    is_retained = Column(Boolean, default=True)
    current_wage_band = Column(String, nullable=True) # e.g. "12000-15000"
    job_relevance_to_training = Column(String, default="high") # high, partial, unrelated
    notes = Column(Text, nullable=True)

    case = relationship("Case", back_populates="followups")

class Grievance(Base):
    __tablename__ = "grievances"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    beneficiary_id = Column(String, ForeignKey("beneficiaries.id"), nullable=False, index=True)
    category = Column(String, default="training_center") # training_center, stipend, employer, discrimination, technical
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="submitted") # submitted, under_investigation, resolved, closed
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class Outcome(Base):
    __tablename__ = "outcomes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    beneficiary_id = Column(String, ForeignKey("beneficiaries.id"), nullable=False, index=True)
    pathway_id = Column(String, ForeignKey("pathways.id"), nullable=True)
    outcome_type = Column(String, nullable=False) # placed_wage_job, started_enterprise, certified_rpl
    organization_name = Column(String, nullable=True)
    wage_band_inr = Column(String, default="15000-18000")
    retention_90d_verified = Column(Boolean, default=True)
    retention_180d_verified = Column(Boolean, default=True)
    verified_at = Column(DateTime, default=datetime.utcnow)
