from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.identity.models import User, Consent
from backend.app.shared.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/identity", tags=["identity"])

class LoginRequest(BaseModel):
    username: str # phone or email
    password: Optional[str] = "password123"

class ConsentRequest(BaseModel):
    beneficiary_id: str
    purpose: str = "livelihood_profiling"
    raw_audio_retention_opt_in: bool = False
    language: str = "mr"

class DemoSwitchRoleRequest(BaseModel):
    role: str # beneficiary, field_worker, counsellor, financial_counsellor, provider, employer, district_admin

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Logs in or generates an access token for development/demo."""
    user = db.query(User).filter((User.phone == req.username) | (User.email == req.username)).first()
    if not user:
        # Create demo user on the fly if needed
        user = User(
            full_name=req.username,
            phone=req.username if req.username.isdigit() else "9876543210",
            email=req.username if "@" in req.username else f"{req.username}@demo.gov.in",
            role="beneficiary"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role, "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.post("/consent")
def record_consent(req: ConsentRequest, db: Session = Depends(get_db)):
    """Records layered consent with auditable purpose and audio retention options."""
    consent = Consent(
        beneficiary_id=req.beneficiary_id,
        purpose=req.purpose,
        raw_audio_retention_opt_in=req.raw_audio_retention_opt_in,
        language=req.language
    )
    db.add(consent)
    db.commit()
    return {"status": "consent_recorded", "consent_id": consent.id}

@router.post("/demo/switch-role")
def demo_switch_role(req: DemoSwitchRoleRequest):
    """SIH Judge & Demonstration utility to simulate switching active user roles."""
    token = create_access_token({"sub": f"demo-{req.role}", "role": req.role, "name": f"Demo {req.role.title()}"})
    return {
        "active_role": req.role,
        "access_token": token,
        "permissions_granted": [
            f"role:{req.role}",
            "district:MH-NAG",
            "audit:read" if "admin" in req.role else "cases:read"
        ]
    }
