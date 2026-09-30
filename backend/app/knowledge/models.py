import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    canonical_name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, index=True, nullable=False) # Mechanical, Electrical, Textiles, Construction, Retail, Healthcare, IT
    description = Column(Text, nullable=True)
    complexity_level = Column(Integer, default=2) # 1 (Basic/Task) to 5 (Master/Specialist)
    is_traditional_craft = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    aliases = relationship("SkillAlias", back_populates="skill", cascade="all, delete-orphan")
    occupation_links = relationship("OccupationSkill", back_populates="skill")

class SkillAlias(Base):
    __tablename__ = "skill_aliases"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False, index=True)
    alias_text = Column(String, index=True, nullable=False) # e.g. "टू-व्हीलर रिपेयर", "गाडी दुरुस्ती", "wiring check"
    language_code = Column(String, default="en") # hi, mr, ta, te, en
    confidence = Column(Float, default=0.9)

    skill = relationship("Skill", back_populates="aliases")

class Occupation(Base):
    __tablename__ = "occupations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    nco_code = Column(String, unique=True, index=True, nullable=False) # e.g. "7231.0100" (Motorcycle Mechanic)
    title = Column(String, index=True, nullable=False)
    sector = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    nco_division = Column(String, nullable=True) # e.g. "72" (Metal, Machinery and Related Trades)

    skills_required = relationship("OccupationSkill", back_populates="occupation", cascade="all, delete-orphan")
    qualifications = relationship("OccupationQualification", back_populates="occupation", cascade="all, delete-orphan")

class OccupationSkill(Base):
    __tablename__ = "occupation_skills"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    occupation_id = Column(String, ForeignKey("occupations.id"), nullable=False, index=True)
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False, index=True)
    importance = Column(String, default="mandatory") # mandatory, critical, preferred, optional
    weight = Column(Float, default=1.0)

    occupation = relationship("Occupation", back_populates="skills_required")
    skill = relationship("Skill", back_populates="occupation_links")

class Qualification(Base):
    __tablename__ = "qualifications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    qp_code = Column(String, unique=True, index=True, nullable=False) # e.g. "ASC/Q1411" (Automotive Two Wheeler Service Technician)
    title = Column(String, index=True, nullable=False)
    nsqf_level = Column(Integer, index=True, nullable=False) # e.g. 3, 4, 5
    awarding_body = Column(String, default="Automotive Skills Development Council (ASDC)")
    validity_status = Column(String, default="current") # current, expired, superseded, future_not_yet_effective
    effective_from = Column(DateTime, default=datetime(2023, 1, 1))
    effective_to = Column(DateTime, default=datetime(2028, 12, 31))
    min_education = Column(String, default="class_8") # unlettered, class_5, class_8, class_10, class_12, iti
    min_age = Column(Integer, default=18)
    duration_hours = Column(Integer, default=400)
    official_nqr_url = Column(String, nullable=True)
    rpl_eligible = Column(Boolean, default=True) # Eligible for Recognition of Prior Learning
    created_at = Column(DateTime, default=datetime.utcnow)

    competencies = relationship("QualificationCompetency", back_populates="qualification", cascade="all, delete-orphan")

class QualificationCompetency(Base):
    __tablename__ = "qualification_competencies"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    qualification_id = Column(String, ForeignKey("qualifications.id"), nullable=False, index=True)
    nos_code = Column(String, index=True, nullable=False) # National Occupational Standard code
    nos_title = Column(String, nullable=False)
    competency_type = Column(String, default="core_technical") # core_technical, domain_knowledge, soft_skill, health_safety
    description = Column(Text, nullable=True)

    qualification = relationship("Qualification", back_populates="competencies")

class OccupationQualification(Base):
    __tablename__ = "occupation_qualifications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    occupation_id = Column(String, ForeignKey("occupations.id"), nullable=False, index=True)
    qualification_id = Column(String, ForeignKey("qualifications.id"), nullable=False, index=True)
    alignment_score = Column(Float, default=0.95)

    occupation = relationship("Occupation", back_populates="qualifications")
    qualification = relationship("Qualification")

class Program(Base):
    __tablename__ = "programs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, index=True, nullable=False) # PM-AJAY-GIA, NSFDC-ELIS, STANDUP-INDIA, MUDRA-SHISHU
    name = Column(String, nullable=False)
    ministry = Column(String, default="Ministry of Social Justice and Empowerment")
    target_group = Column(String, default="Scheduled Caste Beneficiaries")
    benefits_summary = Column(Text, nullable=False)
    eligibility_rules = Column(JSON, default=dict)
    indicative_subsidy_percentage = Column(Float, default=50.0)
    max_subsidy_amount_inr = Column(Float, default=50000.0)
    is_active = Column(Boolean, default=True)
    source_citation = Column(String, default="PM-AJAY Scheme Operational Guidelines 2023-26")
    updated_at = Column(DateTime, default=datetime.utcnow)
