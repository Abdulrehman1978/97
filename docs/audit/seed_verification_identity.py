"""Create an explicitly synthetic local demo principal for browser regression tests."""
from backend.app.config import settings
from backend.app.database import SessionLocal
from backend.app.identity.models import User
from backend.app.shared.security import hash_password

assert settings.DEMO_MODE and settings.ENVIRONMENT != "production", "Demo environments only"
with SessionLocal() as db:
    user = db.query(User).filter(User.email == "audit.browser@example.invalid").first()
    if not user:
        db.add(User(id="audit-browser-beneficiary", full_name="Synthetic Browser Verification", email="audit.browser@example.invalid", role="beneficiary", hashed_password=hash_password("audit-local-only-2026"), is_active=True))
        db.commit()
    print("Synthetic browser verification identity ready; no existing identities modified.")
