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
        {"id": "test-admin-uuid", "email": "test_admin@gov.in", "role": "district_admin", "full_name": "Test District Admin"},
        {"id": "admin-1", "email": "admin1@nagpur.gov.in", "role": "district_admin", "full_name": "Admin One"},
        {"id": "pune-admin", "email": "pune_admin@gov.in", "role": "district_admin", "full_name": "Pune Admin"},
        {"id": "test-worker-1", "email": "worker1@nagpur.gov.in", "role": "field_worker", "full_name": "Worker One"},
        {"id": "employer-test-uuid", "email": "employer_test@corp.com", "role": "employer", "full_name": "Test Employer"},
        {"id": "test-ben-1", "email": "ben1@lip.in", "role": "beneficiary", "full_name": "Beneficiary One"},
        {"id": "legit-ben-1", "email": "legit@lip.in", "role": "beneficiary", "full_name": "Legit Beneficiary"},
        {"id": "test-b-1", "email": "test_b_1@lip.in", "role": "beneficiary", "full_name": "Beneficiary B1"}
    ]
    for idx, u in enumerate(test_users):
        existing = db.query(User).filter(User.id == u["id"]).first()
        if not existing:
            new_u = User(
                id=u["id"],
                email=u["email"],
                phone=f"98000000{idx:02d}",
                full_name=u["full_name"],
                role=u["role"],
                hashed_password=hash_password("test_pass_123"),
                is_active=True
            )
            db.add(new_u)
    db.commit()
    db.close()

    yield
