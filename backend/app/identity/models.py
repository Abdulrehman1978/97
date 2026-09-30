import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, nullable=False)
    role = Column(String, default="beneficiary") # beneficiary, field_worker, counsellor, financial_counsellor, provider, employer, district_admin, state_admin, ministry_admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    memberships = relationship("Membership", back_populates="user", cascade="all, delete-orphan")

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False) # ministry, state_dept, district_admin, training_provider, employer, field_ngo
    jurisdiction_code = Column(String, nullable=True, index=True) # e.g. state code or district LGD code
    verification_status = Column(String, default="verified") # pending, verified, rejected, de_empanelled
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("Membership", back_populates="organization", cascade="all, delete-orphan")

class Membership(Base):
    __tablename__ = "memberships"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    role = Column(String, nullable=False) # admin, staff, auditor
    jurisdiction_scope = Column(String, nullable=True) # block, district, state, national
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="memberships")
    organization = relationship("Organization", back_populates="members")

class Consent(Base):
    __tablename__ = "consents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    beneficiary_id = Column(String, nullable=False, index=True)
    consent_version = Column(String, default="v3.0")
    purpose = Column(String, nullable=False) # livelihood_profiling, opportunity_matching, field_assistance
    is_granted = Column(Boolean, default=True)
    raw_audio_retention_opt_in = Column(Boolean, default=False)
    channel = Column(String, default="pwa") # pwa, ivr, whatsapp, kiosk, field_worker
    language = Column(String, default="en")
    granted_at = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)
