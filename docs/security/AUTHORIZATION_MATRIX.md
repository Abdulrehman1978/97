# Platform Authorization Matrix & Role Access Control Spec

**Platform:** Livelihood Intelligence Platform (LIP) — SIH26097  
**Policy Baseline:** Packet 28.1 Mandatory Security Closure  
**Default Principle:** **Protected by default. Public by explicit decision.**

---

## 1. Role Definitions

1. **`anonymous`**: Unauthenticated public visitor.
2. **`beneficiary`**: Scheduled Caste citizen user seeking skilling, qualification, and livelihood.
3. **`field_worker`**: Community cadre (Prerak / Mitra) assisting citizens in rural habitations.
4. **`counsellor`**: District career and vocational counsellor.
5. **`financial_counsellor`**: Enterprise and credit linkage advisor.
6. **`provider`**: Empanelled Vocational Training Provider / PIA center manager.
7. **`employer`**: Registered local or state industrial employer.
8. **`district_admin`**: District Skill Development Officer / District Magistrate office.
9. **`state_admin`**: State Scheduled Castes Development Corporation / Skill Department.
10. **`ministry_admin`**: National Ministry of Social Justice and Empowerment (MoSJE).

---

## 2. Comprehensive Endpoint Authorization Matrix

| Method | Route | Anon | Beneficiary | Field Worker | Counsellor | Financial Counsellor | Provider | Employer | District Admin | State Admin | Ministry Admin | Scope / Isolation Rules |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **GET** | `/health/live` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Liveness probe; no auth required. |
| **GET** | `/health/ready` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifies DB connectivity; 503 if down. |
| **POST** | `/api/v1/identity/login` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Public login; bcrypt verified. |
| **GET** | `/api/v1/identity/me` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Requires Bearer token; returns own identity. |
| **POST** | `/api/v1/identity/demo/switch-role` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **Disabled (404)** in `DEMO_MODE=false`. Demo only. |
| **GET** | `/api/v1/beneficiaries/` | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | District-scoped for field_worker/district_admin. |
| **POST** | `/api/v1/beneficiaries/` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | Registration with safe unknown defaults. |
| **GET** | `/api/v1/beneficiaries/{id}` | ❌ | Self | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | Beneficiary can only access self; staff district-scoped. |
| **GET** | `/api/v1/beneficiaries/{id}/passport` | ❌ | Self | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | Cross-account access denied (403). Employers blocked. |
| **PUT** | `/api/v1/beneficiaries/{id}/profile` | ❌ | Self | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | Immutable audit increment on edit. Cross-account denied. |
| **POST** | `/api/v1/intelligence/extract-skills` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Public stateless extraction service. |
| **POST** | `/api/v1/intelligence/rpl-evaluate` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Stateless rule-based NQR competency matcher. |
| **POST** | `/api/v1/intelligence/recommend-pathways`| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Counterfactual recommendation engine. |
| **POST** | `/api/v1/intelligence/policy-assistant` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Grounded RAG with citations and explicit abstention. |
| **GET** | `/api/v1/opportunities/training-options` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Public course catalog discovery. |
| **POST** | `/api/v1/opportunities/training-options` | ❌ | ❌ | ❌ | ❌ | ❌ | Own | ❌ | ✅ | ✅ | ✅ | Provider can only create for owned training center. |
| **GET** | `/api/v1/opportunities/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Public job discovery (anonymized specs). |
| **POST** | `/api/v1/opportunities/` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Own | ✅ | ✅ | ✅ | Employer can only create for owned organization. |
| **GET** | `/api/v1/opportunities/candidates` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | **Strict Privacy**: Caste/religion/income redacted. |
| **POST** | `/api/v1/opportunities/apply` | ❌ | Self | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | Beneficiary self-application or assisted field cadre. |
| **GET** | `/api/v1/opportunities/applications` | ❌ | ❌ | ❌ | ❌ | ❌ | Own | Own | ✅ | ✅ | ✅ | Scoped to applications on owned training/jobs. |
| **PUT** | `/api/v1/opportunities/applications/{id}/status` | ❌ | ❌ | ❌ | ❌ | ❌ | Own | Own | ✅ | ✅ | ✅ | Status progression restricted to receiving org or admin. |
| **GET** | `/api/v1/journey/{beneficiary_id}` | ❌ | Self | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | Living pathway & action checklist. Cross-account denied. |
| **POST** | `/api/v1/journey/select-pathway` | ❌ | Self | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | Generates sequential closed-loop action checklist. |
| **PUT** | `/api/v1/journey/actions/{action_id}` | ❌ | Own | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | Progress updates verified against pathway ownership. |
| **POST** | `/api/v1/journey/grievance` | ❌ | Self | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | Submits grievance with immutable audit code. |
| **GET** | `/api/v1/journey/cases` | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | Caseload management. Scoped to assigned district. |
| **POST** | `/api/v1/journey/cases/{id}/override` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | Mandatory reason logged with authenticated user ID. |
| **GET** | `/api/v1/journey/coordination` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | Inter-agency referral and SLA blocker tracking. |
| **PUT** | `/api/v1/journey/coordination/{id}/status` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | Cross-department status transition. |
| **GET** | `/api/v1/journey/enterprise/{beneficiary_id}` | ❌ | Self | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | Capital expenditure and scheme pre-screening. |
| **POST** | `/api/v1/journey/outcomes` | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | Retention outcome logging (30d, 90d, 180d, 365d). |
| **GET** | `/api/v1/admin/dashboard` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Own Dist | Own State | ✅ | District demand matrix. Cross-jurisdiction blocked. |
| **POST** | `/api/v1/admin/batch-planner` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Own Dist | Own State | ✅ | Decision support (`READY_FOR_HUMAN_REVIEW`). |
| **POST** | `/api/v1/admin/project-planner` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Own Dist | Own State | ✅ | Project sanction proposal generator. |
| **GET** | `/api/v1/admin/audit-logs` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Own Dist | Own State | ✅ | Read-only immutable administrative audit records. |
| **GET** | `/api/v1/admin/source-health` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | Provenance monitoring of government data adapters. |
| **POST** | `/api/v1/integrations/speech/transcribe` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Fallbacks labeled `DEMO_DATA` (never fake LIVE). |
| **POST** | `/api/v1/integrations/speech/synthesize` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Fallbacks labeled `SANDBOX`. |
| **POST** | `/api/v1/integrations/ivr/turn` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Telephony FSM; truth state strictly `SANDBOX`. |
| **POST** | `/api/v1/integrations/ivr/missed-call` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Automated callback ticket queue (`SANDBOX`). |
| **POST** | `/api/v1/integrations/whatsapp/webhook` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Sandbox messaging delivery card (`SANDBOX`). |
