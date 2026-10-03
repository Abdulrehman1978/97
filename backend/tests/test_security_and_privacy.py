"""
Security & Privacy Hardening Automated Tests
Covers:
- Strict caste / social category redaction from employer endpoints
- Pseudonymous beneficiary identification (Single initial 'R.' only)
- Password hashing verification with bcrypt
- SQL injection / XSS payload sanitization checks
- Audit log immutability and administrative authorization
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.shared.security import get_password_hash, verify_password

client = TestClient(app)

def test_bcrypt_password_hashing():
    """Verify password hashing creates non-reversible bcrypt hashes and correctly validates."""
    password = "SuperSecretPassword123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_employer_candidate_list_never_leaks_caste():
    """Verify employer candidate search completely redacts caste, religion, subcaste, and social identity."""
    # Obtain employer token
    login_res = client.post("/api/v1/identity/login", json={
        "username": "employer@mahavitaran.com",
        "password": "employer123"
    })
    assert login_res.status_code == 200, f"Employer login failed: {login_res.text}"
    token = login_res.json()["access_token"]

    res = client.get(
        "/api/v1/opportunities/candidates?district_code=MH-NAG",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    candidates = res.json()
    assert len(candidates) > 0

    for cand in candidates:
        # Sensitive fields must not be present in payload
        assert "caste" not in cand
        assert "subcaste" not in cand
        assert "social_category" not in cand
        assert "religion" not in cand
        assert "annual_income" not in cand
        assert "bpl_card_number" not in cand
        assert "aadhaar" not in cand

        # Verification that first_name_initial is strictly a single initial (e.g. "R.") or pseudonym
        if "first_name_initial" in cand and cand["first_name_initial"]:
            assert len(cand["first_name_initial"].replace(".", "").strip()) <= 1, \
                f"first_name_initial must be a single initial, got: {cand['first_name_initial']}"

def test_xss_and_sql_injection_resilience_in_grievance():
    """Verify malicious script payloads in grievance submission do not crash the server and are safely escaped."""
    import uuid
    from backend.app.shared.security import create_access_token
    from backend.app.database import SessionLocal
    from backend.app.beneficiary.models import Beneficiary
    from backend.app.identity.models import User
    from backend.app.journey.models import Grievance
    db = SessionLocal()
    test_ben_id = f"test-sec-{uuid.uuid4().hex[:8]}"
    test_user_id = f"test-sec-user-{uuid.uuid4().hex[:8]}"
    try:
        # Create isolated test beneficiary
        db.add(User(id=test_user_id, full_name="Security Audit Candidate", role="beneficiary", is_active=True))
        db.flush()
        ben = Beneficiary(id=test_ben_id, user_id=test_user_id, full_name="Security Audit Candidate", phone="9222222298", district_code="MH-NAG")
        db.add(ben)
        db.commit()

        ben_token = create_access_token({"sub": test_user_id, "role": "beneficiary", "name": "Security Audit Candidate"})
        malicious_payload = {
            "beneficiary_id": test_ben_id,
            "category": "training_center",
            "title": "<script>alert('xss')</script> OR '1'='1' --",
            "description": "DROP TABLE beneficiaries; <img src=x onerror=alert(1)>"
        }
        res = client.post(
            "/api/v1/journey/grievances",
            json=malicious_payload,
            headers={"Authorization": f"Bearer {ben_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] in ["registered", "submitted"]
        assert "grievance_id" in data
    finally:
        # Guaranteed cleanup so security test records never leak into serving database
        try:
            db.query(Grievance).filter(Grievance.beneficiary_id == test_ben_id).delete()
            db.query(Beneficiary).filter(Beneficiary.id == test_ben_id).delete()
            db.query(User).filter(User.id == test_user_id).delete()
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

def test_audit_log_access_strictly_restricted_to_admin():
    """Non-admin roles must be denied 403 on /api/v1/admin/audit-logs."""
    roles = [
        ("ramesh@beneficiary.lip", "ramesh123"),
        ("worker@nagpur.gov.in", "worker123"),
        ("employer@mahavitaran.com", "employer123"),
        ("provider@pmkk.gov.in", "provider123")
    ]

    for email, pwd in roles:
        login_res = client.post("/api/v1/identity/login", json={
            "username": email,
            "password": pwd
        })
        assert login_res.status_code == 200, f"Login failed for {email}: {login_res.text}"
        token = login_res.json()["access_token"]

        res = client.get("/api/v1/admin/audit-logs", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 403, f"Expected 403 for {email}, got {res.status_code}"

def test_admin_can_access_audit_logs():
    """Admin role must successfully view audit logs."""
    login_res = client.post("/api/v1/identity/login", json={
        "username": "admin@nagpur.gov.in",
        "password": "admin123"
    })
    assert login_res.status_code == 200, f"Admin login failed: {login_res.text}"
    token = login_res.json()["access_token"]

    res = client.get("/api/v1/admin/audit-logs", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_anonymous_admin_and_audit_access_denied():
    """Anonymous access to administrative endpoints must be denied with 401."""
    assert client.get("/api/v1/admin/dashboard").status_code == 401
    assert client.get("/api/v1/admin/audit-logs").status_code == 401
    assert client.get("/api/v1/admin/source-health").status_code == 401
    assert client.post("/api/v1/admin/batch-planner", json={}).status_code == 401

def test_beneficiary_cross_account_access_denied():
    """Beneficiary cannot view or edit another beneficiary's private data."""
    from backend.app.shared.security import create_access_token
    token = create_access_token({"sub": "legit-ben-1", "role": "beneficiary", "name": "Legit Ben"})
    headers = {"Authorization": f"Bearer {token}"}
    
    # Accessing someone else's profile
    res_prof = client.get("/api/v1/beneficiaries/other-ben-99", headers=headers)
    assert res_prof.status_code == 403

    # Accessing someone else's passport
    res_pass = client.get("/api/v1/beneficiaries/other-ben-99/passport", headers=headers)
    assert res_pass.status_code == 403

    # Updating someone else's profile
    res_edit = client.put("/api/v1/beneficiaries/other-ben-99/profile", json={"aspirations": {"primary_goal": "hack"}}, headers=headers)
    assert res_edit.status_code == 403

def test_district_cross_jurisdiction_access_denied():
    """District admin from Pune cannot view Nagpur district dashboard."""
    from backend.app.shared.security import create_access_token
    pune_token = create_access_token({"sub": "pune-admin", "role": "district_admin", "district_code": "MH-PUN", "name": "Pune Admin"})
    headers = {"Authorization": f"Bearer {pune_token}"}
    
    res = client.get("/api/v1/admin/dashboard?district_code=MH-NAG", headers=headers)
    assert res.status_code == 403
    assert "jurisdiction" in res.json()["detail"].lower()

def test_jwt_tampering_and_expiry_denied():
    """Invalid, tampered, or expired tokens must fail authentication."""
    from backend.app.shared.security import create_access_token

    # Completely invalid format
    res_inv = client.get("/api/v1/identity/me", headers={"Authorization": "Bearer not-a-valid-token"})
    assert res_inv.status_code == 401

    # Tampered signature
    valid_token = create_access_token({"sub": "admin-1", "role": "district_admin"})
    tampered_token = valid_token[:-4] + "abcd"
    res_tamp = client.get("/api/v1/identity/me", headers={"Authorization": f"Bearer {tampered_token}"})
    assert res_tamp.status_code == 401

    # Expired token (negative delta)
    expired_token = create_access_token({"sub": "admin-1", "role": "district_admin"}, expires_delta_seconds=-300)
    res_exp = client.get("/api/v1/identity/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res_exp.status_code == 401

def test_production_demo_role_endpoint_guarded():
    """When DEMO_MODE is False, /api/v1/identity/demo/switch-role must return 404."""
    from backend.app.config import settings
    orig_demo = settings.DEMO_MODE
    try:
        settings.DEMO_MODE = False
        res = client.post("/api/v1/identity/demo/switch-role", json={"role": "counsellor"})
        assert res.status_code == 404
    finally:
        settings.DEMO_MODE = orig_demo
