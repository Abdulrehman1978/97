import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class EnterprisePlan(Base):
    __tablename__ = "enterprise_plans"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    beneficiary_id = Column(String, ForeignKey("beneficiaries.id"), nullable=False, index=True)
    activity_title = Column(String, nullable=False) # e.g. "Two-Wheeler Service & Spare Parts Center"
    sector = Column(String, default="Automotive")
    indicative_startup_capital_inr = Column(Integer, default=75000)
    indicative_working_capital_inr = Column(Integer, default=25000)
    assumed_break_even_months = Column(Integer, default=6)
    equipment_needed = Column(JSON, default=lambda: ["Hydraulic bike ramp", "Air compressor", "Comprehensive toolkit"])
    target_customers = Column(JSON, default=lambda: ["Local village commuters", "Farmers with 2-wheelers"])
    finance_schemes_considered = Column(JSON, default=lambda: ["PM-AJAY GIA Enterprise Subsidy", "NSFDC Term Loan", "MUDRA Shishu"])
    counsellor_id = Column(String, nullable=True)
    counsellor_notes = Column(Text, nullable=True)
    status = Column(String, default="draft") # draft, counsellor_reviewed, applied, active
    created_at = Column(DateTime, default=datetime.utcnow)

class Source(Base):
    __tablename__ = "sources"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    publisher = Column(String, nullable=False) # MoSJE, NCVET, DGE, MSDE, DPIIT
    source_name = Column(String, nullable=False, unique=True) # NQR Qualifications Registry, NCO 2015, PM-AJAY Guidelines, ODOP
    source_type = Column(String, default="official_government_portal")
    canonical_url = Column(String, nullable=True)
    update_frequency = Column(String, default="monthly")
    freshness_sla_days = Column(Integer, default=30)
    last_success_at = Column(DateTime, default=datetime.utcnow)
    quality_status = Column(String, default="healthy") # healthy, warning, stale
    notes = Column(Text, nullable=True)

class IngestionRun(Base):
    __tablename__ = "ingestion_runs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    source_id = Column(String, ForeignKey("sources.id"), nullable=False, index=True)
    status = Column(String, default="success") # success, failed, running
    records_ingested = Column(Integer, default=0)
    error_summary = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.utcnow)

class AuditEvent(Base):
    __tablename__ = "audit_events"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    actor_user_id = Column(String, nullable=True, index=True)
    actor_role = Column(String, default="system")
    action = Column(String, nullable=False, index=True) # recommendation_generated, counsellor_override, sensitive_field_access, export_report
    entity_type = Column(String, nullable=False) # beneficiary, recommendation, case, referral
    entity_id = Column(String, nullable=True)
    jurisdiction_code = Column(String, nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class BackgroundJob(Base):
    __tablename__ = "background_jobs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    job_type = Column(String, nullable=False, index=True) # source_sync, report_generation, notification_sms, ivr_callback
    payload = Column(JSON, default=dict)
    status = Column(String, default="pending", index=True) # pending, processing, completed, failed
    attempts = Column(Integer, default=0)
    available_at = Column(DateTime, default=datetime.utcnow)
    locked_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
