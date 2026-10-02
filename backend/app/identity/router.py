from typing import Any, Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.identity.models import User, Consent
from backend.app.beneficiary.models import Beneficiary
from backend.app.identity.policies import can_record_consent
from backend.app.shared.security import create_access_token, hash_password, verify_password, get_current_user

router = APIRouter(prefix="/identity", tags=["identity"])

class LoginRequest(BaseModel):
    username: Optional[str] = None # phone or email
    email_or_phone: Optional[str] = None
    password: Optional[str] = None

class ConsentRequest(BaseModel):
    beneficiary_id: str
    purpose: str = "livelihood_profiling"
    raw_audio_retention_opt_in: bool = False
    language: str = "mr"

class DemoSwitchRoleRequest(BaseModel):
    role: Literal["beneficiary", "field_worker", "counsellor", "financial_counsellor", "provider", "employer", "district_admin", "state_admin", "ministry_admin"]

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Verifies credentials against hashed password and returns access token."""
    login_id = req.username or req.email_or_phone
    if not login_id:
        raise HTTPException(status_code=400, detail="Username or email/phone is required")
    
    user = db.query(User).filter((User.phone == login_id) | (User.email == login_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )

    # Verify password if password is set on user
    if user.hashed_password:
        if not req.password or not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )

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

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile for currently authenticated session."""
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "email": getattr(current_user, "email", None),
        "phone": getattr(current_user, "phone", None),
        "is_active": current_user.is_active
    }

@router.post("/consent")
def record_consent(
    req: ConsentRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Records layered consent with auditable purpose and authorization verification."""
    ben = db.query(Beneficiary).filter(Beneficiary.id == req.beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    if not can_record_consent(current_user, ben, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Consent must be recorded by the beneficiary self or authorized assisted district mobilizer"
        )

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
    if not settings.DEMO_MODE or settings.ENVIRONMENT.lower() == "production":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo role switcher is disabled in production mode"
        )
    token = create_access_token({"sub": f"demo-{req.role}", "role": req.role, "name": f"Demo {req.role.title()}"})
    return {
        "active_role": req.role,
        "access_token": token,
        "permissions_granted": [
            f"role:{req.role}",
            "district:MH-NAG",
            "audit:read" if "admin" in req.role else "cases:read"
        ],
        "truth_state": "DEMO_DATA"
    }

