# SIH26097 — Packet 28 Integrity Audit Baseline
**Date:** 2026-09-30  
**Baseline Commit:** `c1435b93f1da7353435397939e0422fec3e8323f`  
**Repository Branch:** `main`  
**Lead Auditor:** Principal Software Architect & QA Systems Engineer  

---

## 1. Executive Summary

This audit establishes the ground truth of the SIH26097 V3 codebase. The project contains a well-structured domain model and modular FastAPI architecture, but displays significant gaps between documentation claims and live technical implementation:

1. **Frontend Disconnection:** Core beneficiary pages (`/passport`, `/pathways`, `/journey`) and staff workspaces (`/field`, `/counsellor/finance`, `/coordination`) contain hardcoded mock data and disconnected action buttons.
2. **Fake Success Fallbacks:** Catch blocks in `/help` silently display success banners when backend calls fail.
3. **Authentication Laxity:** `/identity/login` auto-creates arbitrary users without password hashing or verification.
4. **Unenforced Authorization:** Role and jurisdiction policies in `identity/policies.py` exist as standalone functions but are not wired as FastAPI route dependencies.
5. **PostgreSQL & Migration Gaps:** Missing PostgreSQL driver in `requirements.txt`; uninitialized Alembic migrations; reliance on runtime `Base.metadata.create_all()`.
6. **Docker Incompleteness:** `docker-compose.yml` referenced non-existent `backend/Dockerfile` and `apps/web/Dockerfile`.
7. **Truth State Overclaims:** Synthetic demo fixtures (Ramesh Mesram, PMKK Hingna live batch) were marked `LIVE` instead of `DEMO_DATA`; sandbox adapters (IVR, WhatsApp) were conflated with live integrations.

---

## 2. Technical Baseline Inventory

### 2.1 Database & Models
- **Database Engine:** SQLAlchemy 2.0 with SQLite local fallback and PostgreSQL target.
- **Relational Tables (39 total, strictly under 45-table ceiling):**
  - Identity (4): `users`, `organizations`, `memberships`, `consents`
  - Beneficiary (5): `beneficiaries`, `beneficiary_profiles`, `work_experiences`, `beneficiaries_skills`, `skill_evidence`
  - Knowledge (8): `skills`, `skill_aliases`, `occupations`, `occupation_skills`, `qualifications`, `qualification_competencies`, `occupation_qualifications`, `programs`
  - Opportunities (6): `admin_areas`, `training_centers`, `training_options`, `opportunities`, `applications`, `local_economic_signals`
  - Journey (10): `recommendation_runs`, `recommendations`, `skill_gaps`, `pathways`, `pathway_actions`, `cases`, `case_events`, `referrals`, `followups`, `outcomes`
  - Grievance & Admin (6): `grievances`, `enterprise_plans`, `sources`, `ingestion_runs`, `audit_events`, `background_jobs`

### 2.2 Backend Route Inventory (47 Endpoints Across 8 Modules)
- `identity` (3): `/login`, `/consent`, `/demo/switch-role`
- `beneficiary` (4): `POST /`, `GET /`, `GET /{id}/passport`, `PUT /{id}/profile`
- `knowledge` (4): `GET /skills`, `GET /occupations`, `GET /qualifications`, `GET /programs`
- `intelligence` (5): `POST /extract-voice`, `POST /recommend`, `POST /rpl-check`, `POST /counterfactual`, `POST /policy-rag`
- `opportunities` (11): `GET /training-centers`, `GET /training-options`, `POST /training-options`, `GET /jobs`, `POST /jobs`, `GET /candidates`, `GET /applications`, `PUT /applications/{id}/status`, `POST /apply`, `GET /demand-index`
- `journey` (5): `GET /{beneficiary_id}`, `POST /select-pathway`, `PUT /actions/{id}`, `POST /cases/{id}/override`, `POST /grievances`
- `integrations` (4): `POST /ivr/turn`, `POST /ivr/missed-call`, `POST /whatsapp/webhook`, `POST /speech/synthesize`
- `admin` (5): `GET /dashboard`, `POST /batch-planner`, `POST /project-planner`, `GET /source-health`, `GET /audit-logs`
- System/Health (6): `GET /`, `GET /health/live`, `GET /health/ready`, `GET /docs`, `GET /redoc`, `GET /openapi.json`

### 2.3 Automated Test Inventory
- Initial suite: 15 passing tests in `backend/tests/` (1.32s).
- Deficiencies: Zero frontend unit/component tests, zero E2E Playwright tests, zero dedicated authorization denial tests, zero PostgreSQL integration tests.

---

## 3. Discrepancy Matrix

| Feature / Claim | Claimed Status | Audited Reality | Remediation Required |
|---|---|---|---|
| **Beneficiary Talk Flow** | LIVE | Speech extract works, but confirmation does not persist profile to DB | Call `PUT /profile` and `POST /beneficiaries` upon user confirmation |
| **Livelihood Passport** | LIVE | Hardcoded `passportData` in `/passport/page.tsx` | Fetch via `GET /api/v1/beneficiaries/{id}/passport` |
| **Pathways Recommendation** | LIVE | Hardcoded `samplePathways` in `/pathways/page.tsx` | Call `POST /api/v1/intelligence/recommend` dynamically |
| **Counterfactual Explorer** | LIVE | UI changes text locally without invoking backend counterfactual engine | Call `POST /api/v1/intelligence/counterfactual` on slider change |
| **Beneficiary Journey** | LIVE | `actions` stored in local component state; resets on page reload | Fetch `GET /api/v1/journey/{id}` and persist with `PUT /actions/{id}` |
| **Help & Grievances** | LIVE | Catch block sets `setGrievanceSubmitted(true)` even on failure | Display real returned Grievance ID or queue offline mutation |
| **Counsellor Finance** | LIVE | Hardcoded `enterpriseCase` object | Connect to `EnterprisePlan` backend model and persistence |
| **Coordination Workspace** | LIVE | Hardcoded `items` array; changes not persisted | Wire to `Case`, `Referral`, and `CaseEvent` models |
| **Field Caseload** | LIVE | Hardcoded `cases` array; override action not sent to backend | Wire to `GET /cases` and `POST /cases/{id}/override` |
| **Authentication** | LIVE | Auto-creates unverified users without password check | Verify bcrypt/PBKDF2 hash, return 401 on invalid credentials |
| **Authorization** | LIVE | Standing functions in `policies.py` not wired to routes | Add `get_current_user` dependency and enforce on protected routes |
| **PostgreSQL Support** | LIVE | No PostgreSQL driver installed in `.venv` | Add `psycopg[binary]` to `requirements.txt` |
| **Alembic Migrations** | PASS | Uninitialized Alembic directory | Initialize Alembic and generate verified baseline migration |
| **Docker Compose** | LIVE | Missing `backend/Dockerfile` and `apps/web/Dockerfile` | Create production multi-stage Dockerfiles |
| **Truth Badges** | LIVE | Synthetic demo records labeled `LIVE` | Relabel synthetic records to `DEMO_DATA`, adapters to `SANDBOX` |

---

## 4. Remediation Plan (Packet 28 Execution)

1. **API Client Refactor:** Establish modular `apps/web/src/lib/api/` with typed requests, bearer tokens, error categorization, and offline queueing.
2. **Auth & Authorization Hardening:** Enforce password verification on login; wire `get_current_user` and role-checks to endpoints.
3. **End-to-End Beneficiary Flow:** Persist profile on `/interview`, load `/passport` via API, fetch real `/pathways`, wire live `/journey` milestones, and handle `/help` offline queueing.
4. **Staff & Ecosystem Workspaces:** Connect `/field`, `/counsellor/finance`, and `/coordination` to persisted backend models.
5. **PostgreSQL & Docker Verification:** Verify `psycopg` integration, Alembic migrations, and `docker compose up --build`.
6. **Testing Expansion:** Expand backend tests to include auth/authorization denial, offline sync, candidate privacy isolation, and add Playwright/frontend verification.
7. **Governance Documentation:** Restore full V3 Master Spec and update Progress Tracker and Requirements Traceability Matrix to reflect audited truth.
