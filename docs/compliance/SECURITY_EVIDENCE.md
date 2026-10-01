# Security Architecture & Verification Evidence Document (SIH26097)
**Platform**: PM-AJAY Livelihood Intelligence Platform (LIP)  
**Verification Date**: 01 October 2026  
**Auditor**: Senior Security Engineer & Backend Architect  
**Packet**: Packet 28.1 — Security Closure & Hardening  

---

## 1. Security Architecture Summary

The security architecture of the Livelihood Intelligence Platform implements defense-in-depth principles tailored for government digital public infrastructure. All data flows enforce least-privilege role boundaries, cryptographically secure token validation, and strict PII isolation.

---

## 2. Security Controls & Automated Evidence

| Security Control | Implementation Detail | Automated Test / Verification Evidence | Status |
|---|---|---|---|
| **Password Hashing** | Uses **bcrypt** with salt generation (work factor 12). Reversible or plaintext passwords are completely eliminated. | Tested in `backend/tests/test_security_and_privacy.py::test_bcrypt_password_hashing`. | PASS |
| **Authentication Enforcement** | `/api/v1/identity/login` authenticates registered users against database records. Rejects bad credentials with HTTP 401; rejects disabled users with HTTP 403; does NOT auto-create arbitrary users. | Tested in `backend/tests/test_auth_and_permissions.py::test_login_invalid_password_returns_401` and `test_login_disabled_account_returns_403`. | PASS |
| **Database Authoritative Role Validation** | Token claims alone are not trusted. The current user's role, active status, organization, and jurisdiction are verified from the live database on every request. | Enforced in `get_current_user_optional` and `require_roles`. | PASS |
| **Token Integrity & Expiry** | HMAC-SHA256 signed bearer tokens with cryptographic validation of expiration (`exp`) and subject claims (`sub`). Tampered or expired tokens fail with HTTP 401. | Tested in `backend/tests/test_security_and_privacy.py::test_jwt_tampering_and_expiry_denied`. | PASS |
| **Anonymous Admin Access Blocked** | Administrative endpoints (`/admin/dashboard`, `/admin/audit-logs`, `/admin/source-health`, `/admin/batch-planner`, `/admin/project-planner`) require mandatory authentication. Anonymous requests receive HTTP 401/403. | Tested in `backend/tests/test_security_and_privacy.py::test_anonymous_admin_and_audit_access_denied`. | PASS |
| **Beneficiary Isolation (Anti-Enumeration)** | Citizens can only view/mutate their own profile, passport, and pathway. Cross-account access attempts return HTTP 403 Forbidden without leaking whether target ID exists. | Tested in `backend/tests/test_security_and_privacy.py::test_beneficiary_cross_account_access_denied`. | PASS |
| **Jurisdiction Boundary Enforcement** | District administrators cannot access cross-district data (e.g. Nagpur admin querying Pune). Violations rejected with HTTP 403. | Tested in `backend/tests/test_security_and_privacy.py::test_district_cross_jurisdiction_access_denied`. | PASS |
| **Demo Role Guard in Production** | `POST /api/v1/identity/demo/switch-role` is completely disabled when `settings.DEMO_MODE == False` (returns HTTP 404 Not Found). Demo tokens are invalid in production mode. | Tested in `backend/tests/test_security_and_privacy.py::test_production_demo_role_endpoint_guarded`. | PASS |
| **Caste & PII Redaction for Employers** | Employer candidate search (`/api/v1/opportunities/candidates`) strictly isolates and removes caste, subcaste, religion, income, and BPL card numbers. Names are pseudonymized to a single initial ("R."). | Tested in `backend/tests/test_security_and_privacy.py::test_employer_candidate_list_never_leaks_caste`. | PASS |
| **Audit Log Protection** | Administrative audit logs (`/api/v1/admin/audit-logs`) are strictly restricted to `district_admin`, `state_admin`, and `ministry_admin`. Beneficiaries, field workers, employers, and training providers receive HTTP 403. | Tested in `test_audit_log_access_strictly_restricted_to_admin` and `test_admin_can_access_audit_logs`. | PASS |
| **Input Sanitization & Injection Defense** | Text transcripts, grievance submissions, and search queries handle malicious XSS and SQL injection payloads (`<script>`, `' OR '1'='1' --`) safely through SQLAlchemy parameterized queries and Pydantic validation. | Tested in `backend/tests/test_security_and_privacy.py::test_xss_and_sql_injection_resilience_in_grievance`. | PASS |

---

## 3. Negative Security Suite Summary

The backend test suite includes 9 dedicated negative security tests:
1. `test_bcrypt_password_hashing`: verifies non-reversible one-way cryptographic hashing.
2. `test_employer_candidate_list_never_leaks_caste`: verifies that candidate JSON sent to employers omits caste, religion, subcaste, income, and aadhaar.
3. `test_xss_and_sql_injection_resilience_in_grievance`: verifies SQL injection and XSS payloads in grievances do not corrupt data or execute script.
4. `test_audit_log_access_strictly_restricted_to_admin`: verifies non-admin tokens receive 403 Forbidden.
5. `test_admin_can_access_audit_logs`: verifies authorized admins receive 200 OK.
6. `test_anonymous_admin_and_audit_access_denied`: verifies unauthenticated requests to `/admin/dashboard` and `/admin/audit-logs` fail.
7. `test_beneficiary_cross_account_access_denied`: verifies that beneficiary user A cannot access beneficiary user B's profile or passport.
8. `test_district_cross_jurisdiction_access_denied`: verifies that Nagpur district admin cannot access Pune district records.
9. `test_jwt_tampering_and_expiry_denied`: verifies expired or altered JWT tokens return 401 Unauthorized.
10. `test_production_demo_role_endpoint_guarded`: verifies `/identity/demo/switch-role` raises 404 in production mode.
