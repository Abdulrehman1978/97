import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.identity.models import User
from backend.app.shared.security import hash_password, create_access_token

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_users():
    db = SessionLocal()
    # Ensure test users exist with known bcrypt hashed passwords
    admin = db.query(User).filter(User.email == "test_admin@gov.in").first()
    if not admin:
        admin = User(
            id="test-admin-uuid",
            email="test_admin@gov.in",
            phone="9111111111",
            full_name="Test District Admin",
            role="district_admin",
            hashed_password=hash_password("admin_pass_123"),
            is_active=True
        )
        db.add(admin)

    beneficiary_1 = db.query(User).filter(User.email == "ben1@lip.in").first()
    if not beneficiary_1:
        beneficiary_1 = User(
            id="test-ben-1",
            email="ben1@lip.in",
            phone="9222222221",
            full_name="Ramesh Test",
            role="beneficiary",
            hashed_password=hash_password("ben_pass_123"),
            is_active=True
        )
        db.add(beneficiary_1)

    beneficiary_2 = db.query(User).filter(User.email == "ben2@lip.in").first()
    if not beneficiary_2:
        beneficiary_2 = User(
            id="test-ben-2",
            email="ben2@lip.in",
            phone="9222222222",
            full_name="Suresh Test",
            role="beneficiary",
            hashed_password=hash_password("ben_pass_456"),
            is_active=True
        )
        db.add(beneficiary_2)

    disabled_user = db.query(User).filter(User.email == "disabled@gov.in").first()
    if not disabled_user:
        disabled_user = User(
            id="test-disabled-uuid",
            email="disabled@gov.in",
            phone="9333333333",
            full_name="Disabled Officer",
            role="field_worker",
            hashed_password=hash_password("disabled_123"),
            is_active=False
        )
        db.add(disabled_user)

    db.commit()
    db.close()

def test_login_success():
    res = client.post("/api/v1/identity/login", json={
        "username": "test_admin@gov.in",
        "password": "admin_pass_123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "district_admin"
    assert data["token_type"] == "bearer"

def test_login_invalid_password_returns_401():
    res = client.post("/api/v1/identity/login", json={
        "username": "test_admin@gov.in",
        "password": "wrong_password_attempt"
    })
    assert res.status_code == 401
    assert "Invalid username or password" in res.json()["detail"]

def test_login_nonexistent_user_returns_401_no_autocreate():
    res = client.post("/api/v1/identity/login", json={
        "username": "totally_random_fake_user@gov.in",
        "password": "any_password"
    })
    assert res.status_code == 401
    assert "Invalid username or password" in res.json()["detail"]

def test_login_disabled_account_returns_403():
    res = client.post("/api/v1/identity/login", json={
        "username": "disabled@gov.in",
        "password": "disabled_123"
    })
    assert res.status_code == 403
    assert "Account is disabled" in res.json()["detail"]

def test_identity_me_unauthorized_without_token():
    res = client.get("/api/v1/identity/me")
    assert res.status_code == 401

def test_identity_me_authorized_with_token():
    token = create_access_token({"sub": "test-admin-uuid", "role": "district_admin", "name": "Test Admin"})
    res = client.get("/api/v1/identity/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "test-admin-uuid"
    assert data["role"] == "district_admin"

def test_beneficiary_cannot_list_all_beneficiaries():
    ben_token = create_access_token({"sub": "test-ben-1", "role": "beneficiary", "name": "Ramesh"})
    res = client.get("/api/v1/beneficiaries/", headers={"Authorization": f"Bearer {ben_token}"})
    assert res.status_code == 403
    assert "Beneficiaries cannot list all profiles" in res.json()["detail"]

def test_admin_can_list_beneficiaries():
    admin_token = create_access_token({"sub": "test-admin-uuid", "role": "district_admin", "name": "Admin"})
    res = client.get("/api/v1/beneficiaries/", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_beneficiary_cannot_access_other_beneficiary_passport():
    ben_token = create_access_token({"sub": "test-ben-1", "role": "beneficiary", "name": "Ramesh"})
    # Attempt to view beneficiary 2's passport
    res = client.get("/api/v1/beneficiaries/test-ben-2/passport", headers={"Authorization": f"Bearer {ben_token}"})
    assert res.status_code == 403

def test_beneficiary_cannot_access_admin_dashboard():
    ben_token = create_access_token({"sub": "test-ben-1", "role": "beneficiary", "name": "Ramesh"})
    res = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {ben_token}"})
    assert res.status_code == 403

def test_beneficiary_cannot_access_audit_logs():
    ben_token = create_access_token({"sub": "test-ben-1", "role": "beneficiary", "name": "Ramesh"})
    res = client.get("/api/v1/admin/audit-logs", headers={"Authorization": f"Bearer {ben_token}"})
    assert res.status_code == 403

def test_demo_switch_role_utility_for_judges():
    res = client.post("/api/v1/identity/demo/switch-role", json={"role": "counsellor"})
    assert res.status_code == 200
    data = res.json()
    assert data["active_role"] == "counsellor"
    assert "access_token" in data
    assert data["truth_state"] == "DEMO_DATA"
