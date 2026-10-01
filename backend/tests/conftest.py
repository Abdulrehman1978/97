import os
import pytest
from backend.app.database import engine, init_db, SessionLocal
from backend.app.seed import seed_database
from backend.app.identity.models import User
from backend.app.opportunities.models import TrainingOption
from backend.app.shared.security import hash_password

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Initialize all tables and official seed data before test session."""
    init_db()
    try:
        seed_database()
    except Exception:
        pass

    db = SessionLocal()
    # Ensure any synthetic training options are labeled DEMO_DATA
    db.query(TrainingOption).update({"truth_state": "DEMO_DATA"})

    test_users = [
        {"id": "test-admin-uuid", "email": "test_admin@gov.in", "role": "district_admin", "full_name": "Test District Admin", "password": "admin_pass_123"},
        {"id": "admin-1", "email": "admin1@nagpur.gov.in", "role": "district_admin", "full_name": "Admin One", "password": "test_pass_123"},
        {"id": "pune-admin", "email": "pune_admin@gov.in", "role": "district_admin", "full_name": "Pune Admin", "password": "test_pass_123"},
        {"id": "test-worker-1", "email": "worker1@nagpur.gov.in", "role": "field_worker", "full_name": "Worker One", "password": "test_pass_123"},
        {"id": "employer-test-uuid", "email": "employer_test@corp.com", "role": "employer", "full_name": "Test Employer", "password": "test_pass_123"},
        {"id": "test-ben-1", "email": "ben1@lip.in", "role": "beneficiary", "full_name": "Beneficiary One", "password": "test_pass_123"},
        {"id": "legit-ben-1", "email": "legit@lip.in", "role": "beneficiary", "full_name": "Legit Beneficiary", "password": "test_pass_123"},
        {"id": "test-b-1", "email": "test_b_1@lip.in", "role": "beneficiary", "full_name": "Beneficiary B1", "password": "test_pass_123"},
        {"id": "ramesh-ben-uuid", "email": "ramesh@beneficiary.lip", "role": "beneficiary", "full_name": "Ramesh Mesram", "password": "ramesh123"},
        {"id": "admin-nagpur-uuid", "email": "admin@nagpur.gov.in", "role": "district_admin", "full_name": "Nagpur District Skill Admin", "password": "admin123"},
        {"id": "worker-nagpur-uuid", "email": "worker@nagpur.gov.in", "role": "field_worker", "full_name": "Sunita Patil", "password": "worker123"},
        {"id": "employer-nagpur-uuid", "email": "employer@mahavitaran.com", "role": "employer", "full_name": "Bajaj Auto HR", "password": "employer123"},
        {"id": "provider-nagpur-uuid", "email": "provider@pmkk.gov.in", "role": "provider", "full_name": "Vidarbha Skills Center", "password": "provider123"},
        {"id": "counsellor-nagpur-uuid", "email": "counsellor@nagpur.gov.in", "role": "counsellor", "full_name": "Dr. Aniket Deshmukh", "password": "counsel123"}
    ]
    for idx, u in enumerate(test_users):
        existing = db.query(User).filter((User.id == u["id"]) | (User.email == u["email"])).first()
        if not existing:
            new_u = User(
                id=u["id"],
                email=u["email"],
                phone=f"98000000{idx:02d}",
                full_name=u["full_name"],
                role=u["role"],
                hashed_password=hash_password(u.get("password", "test_pass_123")),
                is_active=True
            )
            db.add(new_u)
        else:
            # Update password hash if needed
            existing.hashed_password = hash_password(u.get("password", "test_pass_123"))
            existing.is_active = True
    db.commit()
    db.close()

    yield
