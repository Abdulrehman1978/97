# PM-AJAY Livelihood Intelligence Platform (LIP)
### Production-Grade Livelihood Operating System for SC Communities | SIH26097

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![Python 3.14](https://img.shields.io/badge/Python-3.14-blue?logo=python&logoColor=white)](https://python.org)
[![TailwindCSS v4](https://img.shields.io/badge/Tailwind-v4.0-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./THIRD_PARTY_NOTICES.md)
[![Tests: 15 Passed](https://img.shields.io/badge/Pytest-15%20Passed-brightgreen)](./backend/tests)
[![GIGW 3.0 / WCAG 2.1 AA](https://img.shields.io/badge/Compliance-GIGW%203.0%20%7C%20WCAG%20AA-success)](./docs/compliance)

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
    (38 Tables • Strictly ≤ 45 budget)       (One Async Worker)
                    │
                    ▼
     Provider Adapters (Speech STT/TTS • Telephone IVR • WhatsApp)
```

- **Modular Monolith:** 8 cleanly decoupled domains in a single FastAPI application.
- **Relational Budget:** 38 normalized tables (under the 45-table architectural ceiling).
- **Zero Unearned Complexity:** No Redis, no Kafka, no dedicated vector DBs. PostgreSQL full-text search and trigram indexing satisfy all semantic and lexical retrieval needs.
- **Low-Tech Access:** Integrated telephone IVR (`1800-LIP-AJAY`) with DTMF/voice turns, missed-call callback scheduling, and offline-first PWA caching (`sw.js`).

---

## 4. Key Surfaces & Routes

| User Surface | Path | Key Capability |
|---|---|---|
| **Public Transparency Portal** | `/` | 3 USPs, PM-AJAY GIA mission, ecosystem directory, DPDP privacy principles. |
| **Talk (Voice Intake)** | `/interview` | Spoken trade story intake, real-time waveform, instant extraction preview. |
| **My Skills (Passport)** | `/passport` | Verified Skill Graph, trade tools, and RPL readiness percentage. |
| **My Paths (Recommendations)** | `/pathways` | **Living Pathway** node graph, factor breakdown, counterfactual travel slider. |
| **My Journey (Closed Loop)** | `/journey` | Dominant next action, document checklist, milestone tracking. |
| **Assistance & Grievances** | `/help` | Offline sync monitor, missed-call callback, grievance registration. |
| **Field Worker Caseload** | `/field` | Offline caseload, assisted village interviews, audited overrides. |
| **Financial Counsellor** | `/counsellor/finance` | Enterprise capital estimation, NSFDC/MUDRA pre-screening, literacy checklist. |
| **Training Provider Desk** | `/provider` | Empanelled center accessibility, batch capacity, live seat management. |
| **Employer Portal** | `/employer` | Job/apprenticeship requisitions, candidate matching with **caste strictly hidden**. |
| **District Admin Planning** | `/admin` | Supply-demand gap matrix, proposed batch simulator, project builder. |
| **Inter-Agency Coordination** | `/coordination` | Cross-department referral tracking, SLA countdowns, blocker escalation. |
| **⚡ SIH Judge Demo Desk** | `/demo` | Live microphone, judge-controlled radius variation, IVR simulator, proof matrix. |

---

## 5. Quick Start (Run Locally in 2 Minutes)

### Prerequisites
- Python 3.11+ (Tested on Python 3.14)
- Node.js 18+ (Tested on Node.js 22)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Abdulrehman1978/97.git
cd 97
```

### 2. Backend Setup & Seed
```bash
# Set up virtual environment
python -m venv .venv

# Activate environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1
# (Linux/macOS: source .venv/bin/activate)

# Install Python dependencies
pip install -r backend/requirements.txt

# Run database seed (creates 38 tables with real NCO & NQR codes)
python -m backend.app.seed

# Start FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API running at: `http://localhost:8000` | Swagger UI: `http://localhost:8000/docs`*

### 3. Frontend Setup
```bash
# In a new terminal:
cd apps/web
npm install
npm run dev
```
*Web Platform running at: `http://localhost:3000` | Judge Console: `http://localhost:3000/demo`*

---

## 6. Automated Verification & Tests

### Backend Unit & Integration Tests (15 Passed)
```bash
.\.venv\Scripts\pytest -v
```
- `test_health.py`: Liveness, readiness, DB connection.
- `test_extraction.py`: Spoken trade task & tool extraction from Hindi/Marathi utterances.
- `test_constraints_and_ranking.py`: Strict exclusion of expired qualifications, feasibility filtering, multi-factor ranking.
- `test_rpl_and_counterfactuals.py`: RPL gap identification, what-if travel radius slider.
- `test_policy_rag.py`: Grounded citations, safe abstention on out-of-domain queries.
- `test_ivr_telephony.py`: DTMF turns, missed-call callback scheduling.
- `test_opportunities_and_privacy.py`: Training options, candidate matching with strict caste privacy isolation, application status tracking.

### Frontend Production Build
```bash
cd apps/web
npm run build
```
*Prerenders all 16 static routes with 0 TypeScript/Turbopack errors.*

---

## 7. Governance, Privacy & Compliance

- **DPDP-2023 Readiness:** Strict purpose limitation, ephemeral raw audio deletion after transcription, and server-side policy gate `can_access_sensitive_field()` that strictly excludes caste from employer matching.
- **Zero Hallucinated Approvals:** Scheme matches are transparent non-binding pre-screenings; statutory approvals remain with authorized officials.
- **GIGW 3.0 & WCAG 2.1 AA:** Accessible contrast, 48px touch targets, screen-reader compatibility, keyboard navigation, and audio read-aloud buttons.

---

## 8. Documentation Index

- [Master Product Specification V3](./docs/MASTER_PRODUCT_SPEC_V3.md)
- [Implementation Progress Tracker](./docs/PROGRESS_TRACKER.md)
- [SIH26097 Problem Statement Traceability Matrix](./docs/traceability/SIH26097_REQUIREMENTS_MATRIX.md)
- [3-Minute Hero Demonstration Script](./docs/demo/DEMO_SCRIPT_3_MIN.md)
- [Jury Technical FAQ & Evidence](./docs/demo/JUDGE_FAQ.md)
- [Architecture Decision Records (ADRs)](./docs/architecture)
- [Third-Party Notices & Licenses](./THIRD_PARTY_NOTICES.md)
