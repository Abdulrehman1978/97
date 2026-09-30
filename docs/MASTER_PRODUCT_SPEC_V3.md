# SIH26097 — Master Product Specification V3
**Platform**: Livelihood Intelligence Platform (PM-AJAY GIA AI-Driven Voice Operating System)  
**Snapshot Date**: 30 September 2026  
**Problem Statement**: SIH26097 — AI-Driven Voice Assistant for Livelihood Mapping and NSQF-Aligned Skilling Recommendations for SC Communities under Grants-in-Aid (GIA) component of PM-AJAY  
**Status**: Production-Grade Specification & Execution Blueprint

---

## 1. Executive Summary & Three Core USPs

The Livelihood Intelligence Platform is a voice-first, low-literacy, closed-loop livelihood operating system designed for Scheduled Caste (SC) beneficiaries, field workers, training partners, employers, district administrators, and the Ministry of Social Justice and Empowerment.

### The Three Memorable USPs
1. **USP 1 — Spoken Experience → Verified Skill Graph**:
   A beneficiary speaks naturally in their regional language about everyday tasks, tools, and work. The system extracts canonical skills with confidence and evidence spans, mapping them to National Classification of Occupations (NCO-2015) and National Skills Qualification Framework (NSQF/NQR) qualifications without requiring the user to know formal bureaucracy.
2. **USP 2 — Recommendation → Real Action**:
   The platform does not end with "here is a course link." It evaluates Recognition of Prior Learning (RPL), checks hard statutory/mobility constraints, exposes uncertainty, generates 3–5 personalized actionable livelihood pathways (wage, apprenticeship, self-employment), provides human counsellor escalation, and tracks post-training placements and business retention.
3. **USP 3 — Individual Journeys → Better District Planning**:
   Anonymized, privacy-safe demand and outcome data feed the **District Livelihood Intelligence Layer**. Aggregated journeys generate training supply-demand gap analyses, cohort/batch planning recommendations, mobility barrier metrics, and PM-AJAY Comprehensive Livelihood Project proposals.

---

## 2. Core Architectural Simplicity Contract

To prevent architectural bloat and ensure high reliability, low hosting cost, and auditability:
- **Client**: Canonical Next.js PWA with Progressive Web App offline caching and service worker. Five core beneficiary areas: **Talk**, **My Skills**, **My Paths**, **My Journey**, **Help**.
- **Backend**: Python FastAPI Modular Monolith structured into eight domain modules:
  1. `identity`
  2. `beneficiary`
  3. `knowledge`
  4. `intelligence`
  5. `opportunities`
  6. `journey`
  7. `integrations`
  8. `admin`
- **Database**: PostgreSQL (with SQLAlchemy 2.0 and Alembic migrations) utilizing full-text search (FTS) and `pg_trgm`. Supports local SQLite fallback for standalone zero-dependency judge evaluation.
- **Complexity Budget**: Strict 30–40 core relational tables; typed validated JSONB for flexible profile attributes.
- **Worker**: Database-backed `background_jobs` table with transactional leases. No Redis/RabbitMQ/Kafka required until measured load justifies it.
- **Truth States**: All features carry explicit truth labels (`LIVE`, `SANDBOX`, `ADAPTER_READY`, `DEMO_DATA`).

---

## 3. Beneficiary Information Architecture

The beneficiary UI strictly exposes 5 concepts:
1. **Talk (`/interview`)**: Voice-first conversation with live microphone visualizer, plain language, and tap fallback.
2. **My Skills (`/passport`)**: Verified Skill Graph showing what the user knows, tools used, and RPL readiness.
3. **My Paths (`/pathways`)**: The signature **Living Pathway** visual component, explainable factor weights, counterfactual explorer ("What if I travel 15km instead of 5km?").
4. **My Journey (`/journey`)**: Returning-user prioritized action dashboard, next steps, applications, and document checklist.
5. **Help (`/help`)**: Human-in-the-loop escalation, callback ticket, grievance filing, and offline status.
