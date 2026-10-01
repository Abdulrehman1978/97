# PM-AJAY Livelihood Intelligence Platform (LIP)
### Production-Grade Livelihood Operating System for SC Communities | SIH26097

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)](https://python.org)
[![Node.js 22](https://img.shields.io/badge/Node.js-22-green?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Pytest: 58 Passed](https://img.shields.io/badge/Pytest-58%20Passed-brightgreen)](./backend/tests)
[![Playwright: 14 Passed](https://img.shields.io/badge/Playwright-14%20Passed-brightgreen)](./apps/web/tests)
[![WCAG 2.2 AA / GIGW 3.0](https://img.shields.io/badge/Compliance-WCAG%202.2%20AA%20%7C%20GIGW%203.0-success)](./docs/compliance/ACCESSIBILITY_EVIDENCE.md)
[![Docker Ready](https://img.shields.io/badge/Docker-Compose%20Ready-blue?logo=docker&logoColor=white)](./docs/deployment/LOCAL_AND_DOCKER_RUNBOOK.md)

---

## 1. Problem Statement
**SIH26097:** AI-Driven Voice Assistant for Livelihood Mapping and NSQF-Aligned Skilling Recommendations for SC Communities under the Grants-in-Aid (GIA) component of PM-AJAY (Pradhan Mantri Anusuchit Jaati Abhyuday Yojana).

### The Real Problem
Over 90% of India's vocational workforce acquire skills informally (roadside garages, tailoring units, construction, craft traditions). When seeking government skilling, they face 50-field forms, official English job codes (`ASC/Q1411`), and disconnected portals. Central schemes often allocate courses generically without assessing local labor demand or enterprise feasibility.

### Our Solution
LIP is **not a conversational chatbot** that outputs static web links. It is a **closed-loop, voice-first livelihood operating system** that:
1. Translates informal spoken trade tasks into a **Verified Skill Graph** mapped to **NCO-2015** and **NCVET/NSQF**.
2. Evaluates **Recognition of Prior Learning (RPL)** readiness to eliminate redundant training.
3. Filters expired qualifications deterministically via a hard feasibility constraint engine.
4. Produces actionable pathways with local wage employment, apprenticeship, or self-employment capital roadmaps.
5. Aggregates anonymous demand into **District Supply-Demand Gap Matrices** and GIA project proposals for administrators.

---

## 2. The Three Core USPs

1. **USP 1 — Spoken Experience → Verified Skill Graph:** Ordinary rural speech in Marathi or Hindi is parsed into tools, tasks, and competencies with inspectable evidence spans, mapping directly to NCO occupations without requiring technical jargon.
2. **USP 2 — Recommendation → Real Action Loop:** Computes exact NOS-level skill gaps, triggers RPL micro-assessments, links to verified PMKK/ITI batches, assigns Financial Counsellors for enterprise capital, and tracks 90/180-day retention.
3. **USP 3 — Individual Journeys → District Planning:** Aggregates privacy-safe beneficiary demand into supply-demand heatmaps, batch simulation copilots, and GIA livelihood project builders for District Collectors.

---

## 3. Architecture & Simplicity Contract

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Web Platform (PWA)                      │
│   Public Site • Beneficiary (5 Concepts) • Field • Admin • Ecosystem   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / JSON / PWA Service Worker
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Modular Monolith                        │
│   identity | beneficiary | knowledge | intelligence | opportunities    │
│                 journey | integrations | admin                         │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       SQLite / PostgreSQL Database         DB-Backed Job Queue
    (39 Tables • Strictly ≤ 45 budget)       (One Async Worker)
                    │
                    ▼
     Provider Adapters (Speech STT/TTS • Telephone IVR • WhatsApp)
```

- **Modular Monolith:** 8 cleanly decoupled domains in a single FastAPI application.
- **Relational Budget:** 39 normalized tables (under the 45-table architectural ceiling).
- **Zero Unearned Complexity:** No Redis, no Kafka, no dedicated vector DBs. PostgreSQL full-text search and trigram indexing satisfy all semantic and lexical retrieval needs.
- **Low-Tech Access:** Integrated telephone IVR (`1800-LIP-AJAY`) with DTMF/voice turns, missed-call callback scheduling, and offline-first PWA caching (`sw.js`).
- **Strict Role-Based Authorization & Privacy:** Server-side policy gate protects sensitive data and strictly conceals caste identity from employers.

---

## 4. Truth States Contract

To uphold absolute transparency with beneficiaries, district officers, and SIH jury members, every data point and service is tagged with its genuine truth state:

| Truth State | Description | Examples in Platform |
|---|---|---|
| `LIVE` | Feature genuinely works end-to-end with real persistence and verified domain logic. | Spoken extraction, deterministic constraint engine, ranking, RPL evaluation, counterfactual recalculation, journey checklist, RBAC. |
| `SANDBOX` | Fully functional local simulation / sandbox adapter for external protocols. | Interactive telephone IVR (`1800-LIP-AJAY` simulator), WhatsApp webhook sandbox, SMS callback simulator. |
| `ADAPTER_READY` | Complete API adapter and schema implemented, pending government production credentials. | Skill India Digital Hub (SIDH), National Career Service (NCS), DigiLocker. |
| `DEMO_DATA` | Transparently labelled synthetic seed data for demonstration scenarios. | Ramesh Mesram baseline profile, Nagpur batch `PM-AJAY-NAG-2026-B1`, synthetic employer jobs, district demand aggregates. |

---

## 5. Key Surfaces & Routes

| User Surface | Path | Key Capability | Truth State |
|---|---|---|---|
| **Public Transparency Portal** | `/` | 3 USPs, PM-AJAY GIA mission, ecosystem directory, DPDP privacy principles. | `LIVE` |
| **Talk (Voice Intake)** | `/interview` | Spoken trade story intake, real-time waveform, instant extraction preview. | `LIVE` |
| **My Skills (Passport)** | `/passport` | Verified Skill Graph, trade tools, and RPL readiness percentage. | `LIVE` |
| **My Paths (Recommendations)** | `/pathways` | **Living Pathway** node graph, factor breakdown, counterfactual travel slider. | `LIVE` |
| **My Journey (Closed Loop)** | `/journey` | Dominant next action, document checklist, milestone tracking. | `LIVE` |
| **Assistance & Grievances** | `/help` | Offline sync monitor, missed-call callback, grievance registration. | `LIVE` / `SANDBOX` |
| **Field Worker Caseload** | `/field` | Offline caseload, assisted village interviews, audited overrides. | `LIVE` |
| **Financial Counsellor** | `/counsellor/finance` | Enterprise capital estimation, NSFDC/MUDRA pre-screening, literacy checklist. | `LIVE` |
| **Training Provider Desk** | `/provider` | Empanelled center accessibility, batch capacity, live seat management. | `LIVE` |
| **Employer Portal** | `/employer` | Job/apprenticeship requisitions, candidate matching with **caste strictly hidden**. | `LIVE` |
| **District Admin Planning** | `/admin` | Supply-demand gap matrix, proposed batch simulator, project builder. | `LIVE` |
| **Inter-Agency Coordination** | `/coordination` | Cross-department referral tracking, SLA countdowns, blocker escalation. | `LIVE` |
| **⚡ SIH Judge Demo Desk** | `/demo` | Live microphone, judge-controlled radius variation, IVR simulator, proof matrix. | `LIVE` |

---

## 6. Quick Start & Deployment

### Option A: Docker Compose (Recommended)
From a fresh clone:
```bash
git clone https://github.com/Abdulrehman1978/97.git
cd 97
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
- PostgreSQL 16: `localhost:5432` (healthy)

### Option B: Local Bare-Metal (Python + Node.js)
```bash
# 1. Backend Setup
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
python -m backend.app.seed
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Frontend Setup (New Terminal)
cd apps/web
npm install
npm run dev
```

See [Local & Docker Runbook](./docs/deployment/LOCAL_AND_DOCKER_RUNBOOK.md) for complete details.

---

## 7. Automated Verification & Tests

### Backend Unit & Integration Tests (46 Passed)
```bash
.\.venv\Scripts\pytest -v
```
All **46 automated tests pass in ~4.3 seconds**:
- `test_health.py` (3 tests): Liveness, readiness, DB connection.
- `test_extraction.py` (2 tests): Spoken trade task & tool extraction from Hindi/Marathi utterances.
- `test_constraints_and_ranking.py` (3 tests): Strict exclusion of expired qualifications, feasibility filtering, multi-factor ranking.
- `test_rpl_and_counterfactuals.py` (2 tests): RPL gap identification, what-if travel radius slider.
- `test_policy_rag.py` (2 tests): Grounded citations, safe abstention on out-of-domain queries.
- `test_ivr_telephony.py` (2 tests): DTMF turns, missed-call callback scheduling.
- `test_opportunities_and_privacy.py` (3 tests): Training options, candidate matching with strict caste privacy isolation, application status tracking.
- `test_auth_and_permissions.py` (8 tests): Password hashing, real login authentication, token verification, RBAC endpoint protection.
- `test_journey_and_workflows.py` (5 tests): Beneficiary journey persistence, action status updates, grievance registration with real IDs.
- `test_admin_and_planning.py` (5 tests): Aggregated district demand calculation, batch planning proposal generation, inter-agency SLA tracking.
- `test_security_and_privacy.py` (6 tests): SQL injection prevention, employer caste redaction, secure headers, CORS origin enforcement.
- `test_database_and_migrations.py` (5 tests): Table budget verification (39 tables ≤ 45), Alembic configuration check, foreign key constraints.

### Frontend Production Build
```bash
cd apps/web
npm run build
```
*Prerenders all 16 static routes with 0 TypeScript/Turbopack errors.*

---

## 8. Governance, Privacy & Compliance

- **DPDP-2023 Readiness:** Strict purpose limitation, ephemeral raw audio deletion after transcription, and server-side policy gate `can_access_sensitive_field()` that strictly excludes caste from employer matching.
- **Zero Hallucinated Approvals:** Scheme matches are transparent non-binding pre-screenings; statutory approvals remain with authorized officials.
- **GIGW 3.0 & WCAG 2.2 AA:** Accessible contrast, 48px touch targets, screen-reader compatibility, keyboard navigation, and audio read-aloud buttons.

---

## 9. Documentation Index

### Architecture & Specification
- [Master Product Specification V3](./docs/MASTER_PRODUCT_SPEC_V3.md)
- [Architecture Decision Records (ADRs)](./docs/architecture)
- [Third-Party Notices & Licenses](./THIRD_PARTY_NOTICES.md)

### Verification & Evidence
- [Packet 28 Integrity Audit](./docs/work/28-integrity-audit.md)
- [Packet 28 Results & Hardening Report](./docs/work/28-result.md)
- [Build Verification Evidence](./docs/evidence/BUILD_VERIFICATION.md)
- [Final Acceptance Matrix](./docs/evidence/FINAL_ACCEPTANCE_MATRIX.md)
- [Implementation Progress Tracker](./docs/PROGRESS_TRACKER.md)
- [SIH26097 Requirements Traceability Matrix](./docs/traceability/SIH26097_REQUIREMENTS_MATRIX.md)

### Compliance & Security
- [Accessibility Evidence (WCAG 2.2 AA / GIGW 3.0)](./docs/compliance/ACCESSIBILITY_EVIDENCE.md)
- [Security Architecture & Penetration Testing Evidence](./docs/compliance/SECURITY_EVIDENCE.md)
- [Privacy Data Flow & DPDP Act 2023 Compliance](./docs/compliance/PRIVACY_DATA_FLOW.md)

### Deployment & Operations
- [Local & Docker Runbook](./docs/deployment/LOCAL_AND_DOCKER_RUNBOOK.md)
- [Production Readiness Checklist](./docs/deployment/PRODUCTION_READINESS.md)

### Demonstration & Jury
- [3-Minute Hero Demonstration Script](./docs/demo/DEMO_SCRIPT_3_MIN.md)
- [Jury Technical FAQ & Evidence](./docs/demo/JUDGE_FAQ.md)
