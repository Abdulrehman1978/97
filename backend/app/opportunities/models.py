import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class AdminArea(Base):
    __tablename__ = "admin_areas"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, index=True, nullable=False) # e.g. "MH-NAG", "UP-VAR"
    name = Column(String, index=True, nullable=False)
    area_type = Column(String, default="district") # state, district, block, village
    parent_code = Column(String, index=True, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    state_code = Column(String, index=True, default="MH")

class TrainingCenter(Base):
    __tablename__ = "training_centers"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    district_code = Column(String, index=True, nullable=False)
    address = Column(Text, nullable=False)
    has_wheelchair_access = Column(Boolean, default=True)
    has_women_hostel = Column(Boolean, default=False)
    contact_phone = Column(String, nullable=True)
    latitude = Column(Float, default=21.1458)
    longitude = Column(Float, default=79.0882)
    created_at = Column(DateTime, default=datetime.utcnow)

    training_options = relationship("TrainingOption", back_populates="center", cascade="all, delete-orphan")

class TrainingOption(Base):
    __tablename__ = "training_options"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    center_id = Column(String, ForeignKey("training_centers.id"), nullable=False, index=True)
    qualification_id = Column(String, ForeignKey("qualifications.id"), nullable=False, index=True)
    batch_code = Column(String, nullable=True) # None if catalogue course, string if live batch
    is_verified_live_batch = Column(Boolean, default=True) # False means catalogue discovery only
    truth_state = Column(String, default="LIVE") # LIVE, SANDBOX, DEMO_DATA
    seat_capacity = Column(Integer, default=30)
    seats_available = Column(Integer, default=12)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    fee_type = Column(String, default="100% Free under PM-AJAY GIA")
    stipend_details = Column(String, default="As per PM-AJAY norms where eligible")
    created_at = Column(DateTime, default=datetime.utcnow)

    center = relationship("TrainingCenter", back_populates="training_options")
    qualification = relationship("Qualification")

class EmployerOpportunity(Base):
    __tablename__ = "opportunities"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    title = Column(String, nullable=False, index=True)
    opportunity_type = Column(String, default="job") # job, apprenticeship, contract
    nco_code = Column(String, nullable=True, index=True)
    qualification_id = Column(String, ForeignKey("qualifications.id"), nullable=True)
    district_code = Column(String, index=True, nullable=False)
    worksite_address = Column(String, nullable=True)
    monthly_wage_inr = Column(Integer, default=15000)
    is_wage_guaranteed = Column(Boolean, default=False)
    vacancies = Column(Integer, default=5)
    is_accessible_workplace = Column(Boolean, default=True)
    truth_state = Column(String, default="DEMO_DATA") # Clearly labeled demo or live
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    beneficiary_id = Column(String, ForeignKey("beneficiaries.id"), nullable=False, index=True)
    opportunity_id = Column(String, ForeignKey("opportunities.id"), nullable=True, index=True)
    training_option_id = Column(String, ForeignKey("training_options.id"), nullable=True, index=True)
    application_type = Column(String, default="training") # training, job, apprenticeship
    status = Column(String, default="applied") # applied, shortlisted, interviewing, offered, joined, rejected
    applied_at = Column(DateTime, default=datetime.utcnow)
    status_updated_at = Column(DateTime, default=datetime.utcnow)

    opportunity = relationship("EmployerOpportunity", back_populates="applications")

class LocalEconomicSignal(Base):
    __tablename__ = "local_economic_signals"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    district_code = Column(String, index=True, nullable=False)
    signal_type = Column(String, nullable=False) # odop_product, msme_cluster, employer_demand, labor_shortage
    sector = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    intensity_score = Column(Float, default=0.8) # 0.0 to 1.0 demand strength
    source_name = Column(String, default="DPIIT ODOP & District MSME Survey")
    fetched_at = Column(DateTime, default=datetime.utcnow)
    freshness_status = Column(String, default="fresh") # fresh, stale, unconfirmed
