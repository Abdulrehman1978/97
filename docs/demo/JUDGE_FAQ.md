# SIH26097 — Jury Technical FAQ & Evidence Reference

**Problem Statement:** SIH26097 — AI-Driven Voice Assistant for Livelihood Mapping and NSQF-Aligned Skilling Recommendations for SC Communities under PM-AJAY (GIA Component).  
**Platform:** PM-AJAY Livelihood Intelligence Platform (LIP).

---

### Q1: "How is this different from ChatGPT or another generic chatbot?"
**Evidence-Backed Answer:**
1. **Official Grounding vs Web Text:** ChatGPT generates generic conversational prose. LIP resolves natural language into canonical domain entities mapped directly to official government taxonomies:
   - **NCO-2015:** National Classification of Occupations (e.g., Code `7231.0100` Motorcycle Mechanic).
   - **NCVET / NQR:** Official Qualification Packs (e.g., `ASC/Q1411` NSQF Level 4) with strict validity and expiry date checking.
   - **NOS Codes:** National Occupational Standards (e.g., `ASC/N1413`).
2. **Deterministic Constraint Engine:** An LLM is never allowed to decide statutory scheme eligibility or override physical constraints. Hard rules (e.g. minimum Class 10 prerequisite, 15 km mobility limit, wheelchair accessibility) filter candidates deterministically before ranking.
3. **Closed-Loop Action & District Feedback:** Chatbots stop at course links. LIP generates an inspectable action plan, routes to RPL or live batches, connects to Financial & Enterprise Counsellors, and aggregates demand into district supply-demand matrices for administrators.

---

### Q2: "How do you prevent hallucinations in skilling pathways and scheme grants?"
**Evidence-Backed Answer:**
1. **Zero Hallucinated Approvals Contract:** All scheme matches (PM-AJAY GIA, NSFDC, MUDRA Shishu) are explicitly presented as explainable non-binding pre-screenings with citations. The platform visibly informs users that statutory loan or grant sanctions rest solely with the competent authority.
2. **Strict Qualification Expiry Filtering:** Qualifications marked expired or superseded (such as `CON/Q0101-LEGACY`) are filtered at the database query layer by `backend/app/intelligence/constraints.py` and can never appear in active recommendations.
3. **Grounded Policy RAG with Safe Abstention:** In `backend/app/intelligence/rag.py`, queries without verified document matches trigger safe abstention (`"Information not found in authoritative PM-AJAY corpus"`), preventing fabricated rules.
4. **Inspectable Scoring Factors:** Every recommendation card exposes its exact factor weights: Existing Skill Fit, Mobility Radius, Local Demand Signal, and Prerequisite Readiness.

---

### Q3: "What happens in remote villages with no internet or on basic feature phones?"
**Evidence-Backed Answer:**
1. **Interactive Telephone IVR (`/api/v1/integrations/ivr/turn`):** Feature-phone users dial the toll-free number `1800-LIP-AJAY`. A voice and DTMF state machine handles language selection, informal trade questions, and reads back matched pathways and next actions.
2. **Missed-Call Callback Architecture:** Rural users without prepaid balance place a missed call. The system schedules an automated callback queue, ensuring zero out-of-pocket communication costs for beneficiaries.
3. **Progressive Web App (PWA) Offline Cache:** Service Worker (`sw.js`) caches the application shell, localized UI packs, and last saved Livelihood Passport. Beneficiaries and field workers can operate in low-connectivity areas with background sync on reconnect.
4. **Assisted Field Worker Caseload (`/field`):** Community field workers conduct offline interviews, capture photo evidence, and resolve sync conflicts when connectivity is restored.

---

### Q4: "Where does local job and employer demand data come from?"
**Evidence-Backed Answer:**
1. **Multi-Source Demand Index:** Combining:
   - **DPIIT ODOP & District MSME Clusters:** Real regional value chains (e.g., Automotive MIDC clusters in Nagpur, Solar micro-grids).
   - **Empanelled Training Center Feeds:** Verified seat capacity and live batch schedules from PMKKs and ITIs.
   - **National Career Service (NCS) & SIDH Adapters:** Verified public requisitions.
   - **Direct Industrial Requisitions:** Local employers post job/apprenticeship vacancies with guaranteed wage disclosures.
2. **Freshness & Provenance Transparency:** Every signal displays its source, timestamp, and truth status (`LIVE`, `SANDBOX`, `DEMO_DATA`). If no live batch exists in the district, the system honestly states *"Catalogue Discovery Only — No Verified Live Batch"* rather than fabricating empty seats.

---

### Q5: "How is caste and sensitive socioeconomic identity protected from employers?"
**Evidence-Backed Answer:**
1. **Server-Side Policy Gate (`backend/app/identity/policies.py`):**
   - The policy `can_access_sensitive_field(user, field_name, purpose)` explicitly evaluates the requesting user role.
   - Rule: `if user.role == "employer": if field_name in ["caste_category", "social_category", "bpl_status", "annual_income"]: return False`.
2. **Fair Opportunity Candidate Matching:** The employer candidate matching endpoint (`/api/v1/opportunities/candidates`) exposes only verified trade skills, experience, education level, and pseudonymous identifiers (`CAN-xxxx`). Employers never receive or filter by caste identity.
3. **Audit Logging:** Every sensitive field lookup by authorized administrators is recorded in immutable audit events.

---

### Q6: "Can this system scale across 700+ districts without giant cloud bills?"
**Evidence-Backed Answer:**
1. **Lean Modular Monolith:** A single FastAPI service with 8 domain modules replaces an over-engineered 15-microservice maze.
2. **Zero Unearned Infrastructure:** Runs on standard PostgreSQL with built-in full-text search and trigram indexing. No expensive proprietary vector databases (Pinecone/Weaviate), Kubernetes clusters, or Redis message brokers are required for production pilot scale.
3. **Sub-40 Table Schema:** The entire domain model operates within 38 normalized relational tables utilizing validated JSONB for flexible profile attributes.

---

### Q7: "Why will government stakeholders adopt this instead of existing portals?"
**Evidence-Backed Answer:**
- **Complement, Not Compete:** LIP does not replace Skill India Digital Hub (SIDH) or National Career Service (NCS); it acts as the **intelligent last-mile voice front-end and district planning copilot** for the PM-AJAY GIA scheme.
- **Solves the 5 Basic GIA Issues in the Problem Statement:**
  1. *Perspective Roadmaps & Planning:* District Admin Supply-Demand Gap Matrix and Project Builder.
  2. *Trained Financial Consultants:* Dedicated Financial & Enterprise Counsellor desk.
  3. *Post-Training Placement & Retention:* 90/180-day employment follow-ups.
  4. *Inter-Agency Coordination:* Cross-department SLA referral tracking workspace.
  5. *Ground-Level Support:* Offline field worker assisted intake tooling.
