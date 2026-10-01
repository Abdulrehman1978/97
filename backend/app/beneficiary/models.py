import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utcnow():
    return datetime.now(timezone.utc)

class Beneficiary(Base):
    __tablename__ = "beneficiaries"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    full_name = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=True, index=True)
    state_code = Column(String, default="MH", index=True) # e.g. MH, UP, MP, etc.
    district_code = Column(String, default="NAGPUR", index=True) # District code / LGD code
    block_name = Column(String, nullable=True)
    village_name = Column(String, nullable=True)
    gender = Column(String, nullable=True) # male, female, other, prefer_not_to_say
    age = Column(Integer, nullable=True)
    primary_language = Column(String, default="mr") # mr (Marathi), hi (Hindi), ta, te, en, etc.
    is_shared_phone = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    profile = relationship("BeneficiaryProfile", back_populates="beneficiary", uselist=False, cascade="all, delete-orphan")
    work_experiences = relationship("WorkExperience", back_populates="beneficiary", cascade="all, delete-orphan")
    skills = relationship("BeneficiarySkill", back_populates="beneficiary", cascade="all, delete-orphan")

class BeneficiaryProfile(Base):
    __tablename__ = "beneficiary_profiles"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    beneficiary_id = Column(String, ForeignKey("beneficiaries.id"), nullable=False, unique=True)
    
    # Validated typed JSON structures for evolving sections
    education = Column(JSON, default=lambda: {
        "highest_level": "class_10", # unlettered, class_5, class_8, class_10, class_12, iti, diploma, graduate
        "has_formal_certificate": False,
        "specialization": None
    })
    aspirations = Column(JSON, default=lambda: {
        "preferred_sector": "Automotive & Mechanical",
        "primary_goal": "steady_wage_then_workshop", # immediate_wage, self_employment, apprenticeship, certification
        "desired_monthly_income_band": "12000-18000"
    })
    work_preferences = Column(JSON, default=lambda: {
        "wage_vs_self_employment": "hybrid", # wage, self_employment, hybrid
        "work_environment": "workshop_or_local", # indoor, outdoor, workshop_or_local, home_based
        "time_commitment": "full_time" # full_time, part_time, flexible
    })
    mobility = Column(JSON, default=lambda: {
        "max_travel_distance_km": 15,
        "can_relocate_district": False,
        "has_transport": True
    })
    availability = Column(JSON, default=lambda: {
        "daily_hours_available": 6,
        "caregiving_duties": False,
        "preferred_timing": "morning_afternoon"
    })
    accessibility = Column(JSON, default=lambda: {
        "has_mobility_impairment": False,
        "requires_wheelchair_access": False,
        "has_visual_audio_impairment": False,
        "assistive_tech_needed": None
    })
    household_context = Column(JSON, default=dict)
    financial_context = Column(JSON, default=dict) # optional, e.g. working capital constraints
    language_preferences = Column(JSON, default=lambda: {
        "spoken": "mr",
        "audio_read_aloud": True,
        "low_literacy_mode": True
    })
    profile_version = Column(Integer, default=1)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    beneficiary = relationship("Beneficiary", back_populates="profile")

class WorkExperience(Base):
    __tablename__ = "work_experiences"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    beneficiary_id = Column(String, ForeignKey("beneficiaries.id"), nullable=False, index=True)
    title = Column(String, nullable=False) # e.g. "Informal Two-Wheeler Repair Assistant"
    informal_sector = Column(String, nullable=True) # Automotive, Textiles, Construction, Retail, etc.
    duration_months = Column(Integer, default=12)
    tasks_performed = Column(JSON, default=list) # ["Engine dismantling", "Brake pad replacement", "Wiring troubleshooting"]
    tools_used = Column(JSON, default=list) # ["Spanner set", "Multimeter", "Air compressor", "Soldering iron"]
    materials_handled = Column(JSON, default=list)
    responsibility_level = Column(String, default="independent_and_assisted") # assisted, independent, supervisory
    raw_utterance = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    beneficiary = relationship("Beneficiary", back_populates="work_experiences")

class BeneficiarySkill(Base):
    __tablename__ = "beneficiaries_skills"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    beneficiary_id = Column(String, ForeignKey("beneficiaries.id"), nullable=False, index=True)
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False, index=True)
    proficiency_band = Column(String, default="practicing") # novice, practicing, competent, expert
    confidence_score = Column(Float, default=0.85) # 0.0 to 1.0 confidence in AI extraction
    verification_status = Column(String, default="beneficiary_confirmed") # self_reported, ai_inferred, beneficiary_confirmed, worker_verified, document_verified
    evidence_utterance = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    beneficiary = relationship("Beneficiary", back_populates="skills")
    evidence_items = relationship("SkillEvidence", back_populates="beneficiary_skill", cascade="all, delete-orphan")

class SkillEvidence(Base):
    __tablename__ = "skill_evidence"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    beneficiary_skill_id = Column(String, ForeignKey("beneficiaries_skills.id"), nullable=False, index=True)
    evidence_type = Column(String, default="spoken_task_description") # spoken_task_description, supervisor_attestation, work_photo, micro_quiz
    description = Column(String, nullable=True)
    file_url = Column(String, nullable=True)
    metadata_json = Column(JSON, default=dict)
    verified_by_user_id = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)

    beneficiary_skill = relationship("BeneficiarySkill", back_populates="evidence_items")
