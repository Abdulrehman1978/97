# SIH26097 — Master Product Specification V3: Livelihood Intelligence Platform (LIP)
**Problem Statement**: SIH26097 — AI-Driven Voice Assistant for Livelihood Mapping and NSQF-Aligned Skilling Recommendations for SC Communities under Grants-in-Aid (GIA) Component of PM-AJAY  
**Snapshot / Specification Date**: 30 September 2026  
**Status**: Canonical Master Product Specification & Production Architecture Contract  
**Classification**: Government Public Sector AI Platform / Open Architecture  

---

## 1. Executive Summary & Three Signature USPs

The **Livelihood Intelligence Platform (LIP)** is an AI-driven, voice-first, low-literacy operating system designed to bridge informal, experiential skills of Scheduled Caste (SC) citizens into formal qualification pathways, durable employment, and sustainable micro-enterprises under the **Grants-in-Aid (GIA)** component of the **Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY)**.

### The Three Signature USPs

1. **USP 1 — Spoken Experience → Verified Skill Graph**:
   Beneficiaries speak naturally in regional dialects (Marathi, Hindi, English, and Scheduled languages) about everyday tasks, tools, and work history. The platform extracts canonical competencies, tasks, and tools with confidence ratings and evidence spans, mapping them directly to the **National Classification of Occupations (NCO-2015)** and **National Qualifications Register (NQR / NSQF)** without requiring low-literacy users to understand bureaucratic taxonomies.

2. **USP 2 — Recommendation → Real Action**:
   Unlike generic chatbot advisory engines that merely return course links or static PDFs, LIP provides a closed-loop execution pathway:
   - Evaluates **Recognition of Prior Learning (RPL)** feasibility (e.g., 30-hour bridge training vs. 450-hour fresh skilling).
   - Enforces deterministic statutory and mobility constraints (e.g. 5km/15km travel limits, wheelchair accessibility, minimum education).
   - Exposes uncertainty honestly and provides human counsellor escalation.
   - Connects directly to verified local training batches, tool asset subsidies (up to ₹50,000 grant under PM-AJAY GIA), enterprise loans (NSFDC / MUDRA), and verified local employers.
   - Tracks 30-, 90-, 180-, and 365-day post-placement and micro-enterprise retention outcomes.

3. **USP 3 — Individual Journeys → District Livelihood Planning**:
   Anonymized, privacy-safe demand, mobility barriers, and outcome signals from individual journeys aggregate in real-time into the **District Livelihood Intelligence Layer**. District Skill Committees (DSC) and administrative officers gain actionable intelligence on localized skill supply-demand gaps, training center capacity utilization, batch proposals with PM-AJAY cost norm calculations, and project sanction proposals.

---

## 2. Feature-Preservation Contract

The following core workflows and surfaces are non-negotiable architectural requirements and must remain fully integrated:

### Beneficiary Experience Flow
```text
Talk (`/interview`)
  → My Skills (`/passport`)
    → My Paths (`/pathways`)
      → My Journey (`/journey`)
        → Help & Redressal (`/help`)
```

### Signature Operational Chain
```text
Spoken Experience
  → Tasks & Tools Detection
    → Canonical Skill Mapping
      → NCO-2015 Occupation Alignment
        → NSQF Qualification Validity
          → RPL / Bridge Course Feasibility
            → Local Batch & Job Opportunity Matching
              → Persisted Action Checklist
                → Verifiable Retention Outcome
```

### Portal Matrix
1. **Beneficiary PWA**: Voice-first conversation, Livelihood Skill Passport, Living Pathway visualizer, Counterfactual Explorer, milestone action checklist, grievance submission.
2. **Field Worker Desk (`/field`)**: Caseload management, door-to-door verification, offline data capture, and audited counsellor overrides.
3. **Financial & Enterprise Counsellor (`/counsellor/finance`)**: Capital expenditure estimation, working capital assumptions, scheme pre-screening (PM-AJAY GIA, NSFDC, MUDRA), and financial literacy checklist.
4. **Training Provider Portal (`/provider`)**: Center accreditation, batch creation, seat capacity management, enrollment tracking, and live batch verification.
5. **Employer Portal (`/employer`)**: Job requisition creation, candidate search with strict social category redaction, candidate shortlisting, and hiring pipeline updates.
6. **District Admin Dashboard (`/admin`)**: Aggregated skill demand, sector gap analysis, batch proposal simulation, comprehensive livelihood project generator, and immutable audit logs.
7. **Inter-Agency Coordination Workspace (`/coordination`)**: Cross-departmental handoffs (DSC, PIA, MPBCDC, Lead Bank) with SLA timers, blocker logging, and escalation flags.
8. **Scientific Judge Simulator (`/demo`)**: Live variable manipulation (travel radius, work preference, accessibility), end-to-end pipeline inspection, and resilient fallback execution.

---

## 3. Lean Architecture Contract

To guarantee production reliability, instant startup, low operational cost, and zero architectural bloat:

```text
┌────────────────────────────────────────────────────────┐
│             Next.js Progressive Web App                │
│    Beneficiary • Field • Provider • Employer • Admin   │
└───────────────────────────┬────────────────────────────┘
                            │ (Typed REST Client, Bearer JWT)
                            ▼
┌────────────────────────────────────────────────────────┐
│             FastAPI Modular Monolith                   │
│                                                        │
│  identity      │ beneficiary  │ knowledge              │
│  intelligence  │ opportunities│ journey                │
│  integrations  │ admin                                 │
└───────────────────────────┬────────────────────────────┘
                            │
               ┌────────────┼────────────┐
               ▼            ▼            ▼
         PostgreSQL      Storage     DB Jobs
      (pg_trgm / FTS) (S3-Compat)  (Transactional)
               │
               ▼
       External Adapters (Provider-Agnostic)
   Speech • LLM • WhatsApp • IVR • DigiLocker
```

### Complexity Budget & Rules
- **No Unearned Distributed Infrastructure**: Do NOT introduce Redis, Kafka, RabbitMQ, Elasticsearch, OpenSearch, Pinecone, Qdrant, or Kubernetes unless concrete throughput benchmarks prove their necessity.
- **Relational Footprint**: Table count ceiling is **≤45 tables** (currently 39 core SQLAlchemy models). Any expansion requires an Architecture Decision Record (ADR).
- **Dual Database Target**: Target deployment is **PostgreSQL 15+** with Alembic migrations and `pg_trgm` full-text search. Local zero-dependency judge evaluation seamlessly runs on **SQLite** with Write-Ahead Logging (`PRAGMA journal_mode=WAL`) and `busy_timeout=30000`.
- **Database-Backed Jobs**: Asynchronous background operations (SMS dispatch, IVR callbacks, ingestion runs) utilize the transactional `background_jobs` table with `FOR UPDATE SKIP LOCKED` semantics.
- **Truth State Engine**: Every data point and workflow must expose its verified state (`LIVE`, `SANDBOX`, `ADAPTER_READY`, `DEMO_DATA`).

---

## 4. Beneficiary Information Architecture & User Journeys

The beneficiary UI strictly limits cognitive load through 5 core conceptual touchpoints:

### Step 1 — Talk (`/interview`)
- Multimodal audio conversation supporting Marathi, Hindi, and English.
- Real-time audio waveform visualizer and speech-to-text extraction.
- Interactive constraint verification: allows the beneficiary to review and correct detected tasks, tools, education level, travel radius, and work preference.
- Unambiguous persistence: confirmed profile writes directly to `beneficiaries`, `beneficiary_profiles`, and `beneficiaries_skills`.

### Step 2 — My Skills (`/passport`)
- The **Livelihood Skill Passport**: digital portfolio displaying verified tasks, tools used, and canonical skills.
- Recognition of Prior Learning (RPL) readiness meter displaying competency match percentage and required bridge training hours.
- Formal occupation alignment to NCO-2015 codes.

### Step 3 — My Paths (`/pathways`)
- Signature **Living Pathway** visual component showing 3–5 personalized options (Immediate Wage, Self-Employment, Growth Vocational Trajectory).
- Explainable factor decomposition: skill transfer evidence, mobility fit, local demand trend, and preference alignment.
- **Live Counterfactual Explorer**: allows beneficiaries or judges to dynamically modify travel radius (5km → 15km → 25km), work type (wage vs. self-employment), or accessibility needs, triggering real-time server-side constraint recalculation.

### Step 4 — My Journey (`/journey`)
- Returning-user dashboard focused on a single **Dominant Next Action** with clear deadline and guidance.
- Closed-loop milestone action checklist (document preparation, RPL assessment, batch enrollment, job interview) with persistent completion toggles.
- Linked accredited training centers and verified local employer opportunities.

### Step 5 — Help (`/help`)
- Human-in-the-loop escalation: toll-free counsellor callback request with distinction between `LIVE` carrier scheduling and `SANDBOX` simulation.
- Grievance redressal submission with statutory 7-day SLA tracking and unique persisted ticket IDs.
- Offline resilience indicator and pending synchronization queue counter.

---

## 5. Intelligence & Recommendation Engine Architecture

The intelligence pipeline combines probabilistic extraction with deterministic statutory rules:

```text
Spoken Audio / Text
       │
       ▼
[Extraction Pipeline]
├── Intent & Emotion Recognition
├── Task & Tool Extraction
├── Confidence Scoring & Evidence Spans
└── Ambiguity Detection
       │
       ▼
[Canonical Skill Normalization]
└── Multilingual Skill Aliases Matching
       │
       ▼
[Deterministic Hard Constraints Filter]
├── Education Gate (Class 8/10/12/ITI)
├── Travel Radius Gate (Coordinates / Distance Matrix)
├── Workplace Accessibility Gate (Wheelchair / Assistive)
├── Qualification Validity Gate (Active / Archived)
└── Age & Statutory Criteria Gate
       │
       ▼
[Multi-Factor Explainable Ranking Engine]
├── Skill Transfer Match (0.35)
├── Local Demand Evidence (0.25)
├── Travel & Mobility Fit (0.20)
└── Preference Alignment (0.20)
       │
       ▼
[RPL & Action Plan Triage]
├── RPL Fast-Track (≥70% match + 24m exp → 30h Bridge)
├── Foundation Skilling (Course < 70% match)
└── Micro-Enterprise Pre-Screening
```

### Policy RAG (Retrieval-Augmented Generation)
- Uses PostgreSQL Full-Text Search (`tsvector`, `tsquery`) and trigram matching (`pg_trgm`) over official PM-AJAY GIA operational guidelines, NCVET norms, and NSQF standards.
- Grounded answers must cite specific document sections, circular numbers, and effective dates.
- Explicit abstention (`abstained: true`) whenever a query falls outside official corpus knowledge. Never hallucinate statutory benefits.

---

## 6. Data Sources, Ingestion Backbone & Authoritative Taxonomies

LIP ingests and aligns official government registries:

| Source Registry | Publisher | Scope & Use | Freshness SLA |
|---|---|---|---|
| **NQR (National Qualifications Register)** | NCVET / MSDE | NSQF qualification titles, QP codes, levels, NOS units, validity dates | 30 Days |
| **NCO-2015** | DGE / Ministry of Labour | 8-digit occupational classification, divisions, and job descriptions | 365 Days |
| **PM-AJAY GIA Guidelines** | MoSJE | Grants-in-Aid operational norms, asset subsidies, stipend rules | 90 Days |
| **ODOP / MSME Clusters** | DPIIT / MSME | District-level priority economic products, value chains, demand signals | 60 Days |

### Ingestion Run Pipeline
- **Fetch & Snapshot**: Raw download with SHA-256 checksum and source timestamp.
- **Normalize & Validate**: Schema validation, QP code verification, deduplication.
- **Audit & IngestionRun**: Records source URL, records processed, records updated, and quality status.

---

## 7. Truth-State Governance System

Every data point, badge, and external workflow is strictly classified into one of four verified truth states:

1. **`LIVE`**: The capability genuinely executes in real-time with authentic live data and verified external connectivity.
2. **`SANDBOX`**: The workflow executes through an active provider simulation environment (e.g. Twilio/Exotel test telephony, WhatsApp sandbox webhook, SMS sandbox).
3. **`ADAPTER_READY`**: The integration layer, data models, and API interfaces are fully implemented, but production government credentials or system access are awaiting administrative provisioning (e.g. SIDH, DigiLocker, NCS).
4. **`DEMO_DATA`**: Synthetic, representative operational records used for demonstration, testing, or pilot simulation (e.g. synthetic Ramesh Mesram profile, Nagpur demo batches).

---

## 8. Security Architecture, RBAC & Audit Trail

### Authentication & Passwords
- Passwords hashed using industry-standard **bcrypt** (cost factor 12) with salt generation.
- Stateless, cryptographically signed **JWT access tokens** with expiration and subject claims.
- Timing-attack safe comparisons; invalid credentials return 401; disabled accounts return 403; no arbitrary user auto-creation.

### Role-Based Access Control (RBAC) Matrix
- **Beneficiary**: Access strictly isolated to own profile, passport, active pathway, and grievances.
- **Field Worker**: Scoped to assigned beneficiaries within assigned jurisdiction block.
- **Counsellor**: Scoped to assigned cases; mandatory audit reason logged for pathway overrides.
- **Financial Counsellor**: Restricted to enterprise financial cases and credit scheme pre-screenings.
- **Training Provider**: Scoped strictly to managing own center, batch capacities, and enrollments.
- **Employer**: Requisition management and candidate review; strictly prohibited from accessing social categories.
- **District / State Admin**: District-wide aggregated intelligence, batch proposals, and audit logs.

### Audit Logging
- Immutable `audit_events` table recording timestamp, actor ID, role, action, target entity type, entity ID, and context details. Non-admin roles receive 403 when requesting audit logs.

---

## 9. Data Privacy, Social Category Isolation & Candidate Anonymity

### Anti-Discrimination Architectural Boundary
- To prevent caste profiling and bias during recruitment, the Employer API (`/api/v1/opportunities/candidates`) enforces absolute field-level redaction.
- **Strictly Redacted**: Caste, sub-caste, religion, social category, annual household income, BPL card numbers, Aadhaar details, and precise home address.
- **Pseudonymous Candidate View**: Beneficiary names are reduced to a single initial (e.g. `"R."`) and unique identifier. Only verified technical skills, NSQF certifications, tool experience, and general work district are exposed.

---

## 10. Offline-First Architecture & Low-Connectivity Resilience

Designed for remote rural field workers and low-connectivity village environments:
- **Service Worker (`/sw.js`)**: Automatically registered on page load, pre-caching the application shell, core beneficiary pages (`/interview`, `/passport`, `/pathways`, `/journey`, `/help`, `/field`), manifest, and icons.
- **Mutation Queue**: When network is unreachable, writes are saved to an offline queue with `client_mutation_id`, `created_at`, `operation`, `payload`, `retry_count`, and `status`.
- **Zero Fake Success**: Network failures never simulate success. Real states (`registered`, `offline_queued`, `loading`, `error`) are presented transparently to the user.
- **Background Synchronization**: Queued actions automatically sync when network connectivity is restored.

---

## 11. Multimodal Interface Architecture & Assistive Access

### Speech Interface
- Primary voice input uses browser **Web Speech API** where available, with clean fallback to text and touch interactions.
- Backend adapters for **BHASHINI** and **Sarvam AI** for regional speech-to-text and text-to-speech synthesis.
- Audio read-aloud buttons (`<ReadAloudButton />`) on every beneficiary screen for low-literacy accessibility.

### Telephony & IVR
- Finite State Machine IVR architecture supporting DTMF tones and voice responses.
- Handles missed call registrations and automated callback queues.

### Accessibility Standards
- Designed and verified toward **WCAG 2.2 Level AA** and **GIGW (Guidelines for Indian Government Websites)**.
- Minimum 44px touch targets (`touch-target` utility class).
- Prominent focus rings (`focus-visible: ring-2 ring-[#0f4c81]`).
- High-contrast color palette (deep ink navy `#0f4c81` on warm white `#fbfaf7`).
- Full semantic landmark structure (`<header>`, `<main>`, `<nav>`, `<h1>` to `<h3>`).

---

## 12. District Livelihood Intelligence & Batch Planning

### Demand Aggregation
- Automatically compiles expressed skills from beneficiaries and active employer vacancies to compute district-level skill gaps.
- Analyzes barrier indicators: travel limitations, caregiving responsibilities, self-employment preference, and accommodation requirements.

### Batch Simulation
- Allows district officers to simulate new training batches, calculating candidate pool density within specified radii, seat gap, PM-AJAY funding allocations, and stipend provisions.
- Verdict explicitly labeled as **`READY_FOR_HUMAN_REVIEW`** (decision support), avoiding deceptive "Approved" claims.

---

## 13. Retention, Follow-Up & Long-Term Livelihood Outcomes

LIP enforces durable livelihood tracking beyond training completion:
- **Outcome Milestones**: Placement confirmed, Joined, 30-day retention, 90-day retention, 180-day retention, 365-day retention.
- **Micro-Enterprise Milestones**: Registered, Equipment Purchased, Enterprise Active (90d), Sustainable Profitability (180d).
- Persisted in the `outcomes` table with employer/enterprise verification timestamps and wage bands.

---

## 14. Quality Assurance, Automated Testing & Verification Suite

The repository maintains an automated, evidence-backed test pyramid:
- **Backend Test Suite**: Pytest test suite covering unit, integration, RBAC, database constraints, IVR state machine, RAG retrieval, and security.
- **Frontend Verification**: Production Turbopack build (`npm run build`) compiling all 16 static routes with 100% clean TypeScript type checking.
- **PostgreSQL Support**: Alembic migration scripts tested against PostgreSQL service container.
- **CI Workflow**: GitHub Actions pipeline executing backend pytest, PostgreSQL migrations, frontend lint, and production build on every push and pull request.

---

## 15. Judge Experience & Demonstration Protocols

The `/demo` surface provides an interactive, scientifically truthful environment for SIH evaluation:
- Real-time simulation of Marathi rural voice extraction.
- Dynamic constraint tweaking (travel distance slider 5km/15km/25km, wage vs self-employment toggle, wheelchair requirement).
- Visible truth state indicators on every simulated component (`DEMO_DATA`, `SANDBOX`, `LIVE`).
- Resilient offline fallback: ensures the system functions smoothly even if external speech or LLM APIs experience network latency.
