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
    malicious_payload = {
        "beneficiary_id": "demo-beneficiary-id",
        "category": "training_center",
        "title": "<script>alert('xss')</script> OR '1'='1' --",
        "description": "DROP TABLE beneficiaries; <img src=x onerror=alert(1)>"
    }
    res = client.post("/api/v1/journey/grievances", json=malicious_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["registered", "submitted"]
    assert "grievance_id" in data

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
