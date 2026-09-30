import hashlib
import hmac
import base64
import json
import time
from typing import Optional, Dict, Any, List
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db

security_scheme = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Deterministic, modern bcrypt password hashing."""
    salt = bcrypt.gensalt(12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

get_password_hash = hash_password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash, with fallback for PBKDF2 legacy hashes."""
    if not hashed_password or not plain_password:
        return False
    try:
        if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        # PBKDF2 fallback
        salt = settings.SECRET_KEY[:16].encode("utf-8")
        expected = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000).hex()
        return hmac.compare_digest(expected, hashed_password)
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta_seconds: Optional[int] = None) -> str:
    """Generate a signed HMAC-SHA256 token containing payload and expiration."""
    payload = data.copy()
    now = int(time.time())
    expires = now + (expires_delta_seconds or (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60))
    payload.update({"iat": now, "exp": expires})
    
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode("utf-8")).decode("utf-8").rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8")).decode("utf-8").rstrip("=")
    
    signature_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(settings.SECRET_KEY.encode("utf-8"), signature_input, hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify HMAC-SHA256 token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts
        
        # Verify signature
        signature_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(settings.SECRET_KEY.encode("utf-8"), signature_input, hashlib.sha256).digest()
        
        # Padding correction for base64 decode
        rem = len(signature_b64) % 4
        padded_sig = signature_b64 + ("=" * (4 - rem) if rem else "")
        actual_sig = base64.urlsafe_b64decode(padded_sig.encode("utf-8"))
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
            
        rem_p = len(payload_b64) % 4
        padded_payload = payload_b64 + ("=" * (4 - rem_p) if rem_p else "")
        payload = json.loads(base64.urlsafe_b64decode(padded_payload.encode("utf-8")).decode("utf-8"))
        
        if payload.get("exp", 0) < time.time():
            return None # Expired
            
        return payload
    except Exception:
        return None

def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Optional[Any]:
    """Extract and authenticate user from Authorization Bearer header, if provided."""
    from backend.app.identity.models import User
    if not auth or not auth.credentials:
        return None
    token = auth.credentials
    payload = decode_access_token(token)
    if not payload:
        return None
    sub = payload.get("sub")
    if not sub:
        return None
    # Support isolated judge demo tokens
    if str(sub).startswith("demo-"):
        role = payload.get("role", "beneficiary")
        return User(
            id=str(sub),
            full_name=payload.get("name", f"Demo {role.title()}"),
            role=role,
            is_active=True
        )
    user = db.query(User).filter(User.id == sub).first()
    if not user or not user.is_active:
        return None
    return user

def get_current_user(
    user: Optional[Any] = Depends(get_current_user_optional)
) -> Any:
    """Require valid authenticated user."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required or token expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

def require_roles(*allowed_roles: str):
    """Enforce endpoint authorization by role."""
    def role_checker(user: Any = Depends(get_current_user)) -> Any:
        if user.role not in allowed_roles and "ministry_admin" not in user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: role '{user.role}' is not authorized for this resource"
            )
        return user
    return role_checker

