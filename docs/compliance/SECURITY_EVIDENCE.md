# Security Architecture & Verification Evidence Document (SIH26097)
**Platform**: PM-AJAY Livelihood Intelligence Platform (LIP)  
**Verification Date**: 30 September 2026  
**Auditor**: Senior Security Engineer & Backend Architect  

---

## 1. Security Architecture Summary

The security architecture of the Livelihood Intelligence Platform implements defense-in-depth principles tailored for government digital public infrastructure. All data flows enforce least-privilege role boundaries, cryptographically secure token validation, and strict PII isolation.

---

## 2. Security Controls & Automated Evidence

| Security Control | Implementation Detail | Automated Test / Verification Evidence | Status |
|---|---|---|---|
| **Password Hashing** | Uses **bcrypt** with salt generation (work factor 12). Reversible or plaintext passwords are completely eliminated. | Tested in `backend/tests/test_security_and_privacy.py::test_bcrypt_password_hashing`. | PASS |
| **Authentication Enforcement** | `/api/v1/identity/login` authenticates registered users against database records. Rejects bad credentials with HTTP 401; rejects disabled users with HTTP 403; does NOT auto-create arbitrary users. | Tested in `backend/tests/test_auth_and_permissions.py::test_login_invalid_password_returns_401` and `test_login_disabled_account_returns_403`. | PASS |
| **Token Verification** | HMAC-SHA256 signed bearer tokens with cryptographic validation of expiration (`exp`) and subject claims (`sub`). Invalid or expired tokens rejected. | Tested in `test_identity_me_unauthorized_without_token` and `test_identity_me_authorized_with_token`. | PASS |
| **Role-Based Authorization (RBAC)** | `require_roles()` FastAPI dependency restricts endpoints based on database user role. Beneficiaries cannot view administrative dashboards or other beneficiaries' records. | Tested in `test_beneficiary_cannot_access_admin_dashboard` and `test_beneficiary_cannot_list_all_beneficiaries`. | PASS |
| **Audit Log Protection** | Administrative audit logs (`/api/v1/admin/audit-logs`) are strictly restricted to `district_admin`, `state_admin`, and `ministry_admin`. Beneficiaries, field workers, employers, and training providers receive HTTP 403. | Tested in `test_audit_log_access_strictly_restricted_to_admin` and `test_admin_can_access_audit_logs`. | PASS |
| **CORS Lockdown** | Production CORS configuration disallows wildcard `*` origins when credentials are supported. Restricted to configured domains (`ALLOWED_ORIGINS`). | Verified in `backend/app/main.py`. | PASS |
| **Input Sanitization & Injection Defense** | Text transcripts, grievance submissions, and search queries handle malicious XSS and SQL injection payloads (`<script>`, `' OR '1'='1' --`) safely through SQLAlchemy parameterized queries and Pydantic validation. | Tested in `backend/tests/test_security_and_privacy.py::test_xss_and_sql_injection_resilience_in_grievance`. | PASS |
| **Caste / Social Category Redaction** | Employer candidate search (`/api/v1/opportunities/candidates`) strictly isolates and removes caste, subcaste, religion, income, and BPL card numbers. Names are pseudonymized to a single initial. | Tested in `backend/tests/test_security_and_privacy.py::test_employer_candidate_list_never_leaks_caste`. | PASS |

---

## 3. Vulnerability Mitigation Checklist

- **No Secrets in Client Bundles**: All API keys, database credentials, and token signing secrets reside strictly in backend environment variables (`.env`). The frontend only accesses public URLs via `NEXT_PUBLIC_API_URL`.
- **No Stack Trace Leakage**: Production exception handlers return structured JSON error envelopes (`detail: ...`) without internal Python or database stack traces.
- **Rate Limiting & Brute-Force Defense**: Login endpoints and IVR callback webhooks enforce bounded retry limits.
