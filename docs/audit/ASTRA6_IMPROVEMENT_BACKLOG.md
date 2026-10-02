# Astra 6 Improvement Backlog — SIH26097 LIP

Source: [LUNA_FULL_PRODUCT_AUDIT.md](LUNA_FULL_PRODUCT_AUDIT.md)  
Baseline: `main` at `f5d408baa0d3460728a77c168bdbba63e8873fd7`  
Ordering principle: security/data integrity → truthful runtime → complete workflows → validation/error states → beneficiary UX → judge proof → professional UX → visual polish.

## Current re-audit disposition — 2026-10-02

The backlog below is the original implementation plan. The following status ledger supersedes its “to do” implication where a wave has already been implemented in the working tree. The third pasted audit prompt requires stopping after this report; no additional product-code changes are made during this re-audit.

| Item | Current status | Evidence / next boundary |
|---|---|---|
| A6-001 route/auth gates | **DONE for tested local runtime** | Anonymous professional matrix redirects; wrong beneficiary→admin is 403; backend tests remain green. Keep server-side auth as authority. |
| A6-002 production/demo boundary | **DONE in config; deployment proof open** | Production validator, explicit demo overlay, empty production secret fallback and role allowlist are implemented. Start a real production-mode deployment with operator-provided secret before release. |
| A6-003 fixture/PII quality | **PARTIAL** | Silent sensitive fallbacks removed from professional pages. Duplicate/demo-data and idempotent seed audit remains. |
| A6-004 identity handoff | **DONE with sign-in-before-persist contract** | Anonymous POST rejects; authenticated self-service resolves `/me`; transcript/passport/DB test passes. A claimable anonymous session is intentionally not implemented. |
| A6-005 persisted journey actions | **DONE for tested workflow** | No fake action mutation; authoritative success/error, DB persistence, reload and explicit offline sync tested. Cross-tab/exactly-once remains open. |
| A6-006 migration/readiness | **OPEN P1** | PostgreSQL runtime is healthy and migration/FKs verified, but readiness does not report schema revision and SQLite FK enforcement/create_all ambiguity remains. |
| A6-007 API contract matrix | **OPEN P1** | Main API routes are exercised, but no generated UI→endpoint schema/ownership/error matrix or shared error envelope exists. |
| A6-008 validation/idempotency | **OPEN P1** | Required/max-length checks are partial; broad professional numeric/date/duplicate/script-like/idempotency coverage remains. |
| A6-009 explicit state machine | **MOSTLY DONE** | Major portal failures and empty states are visible. Help grievance fallback and judge local simulator fallback remain. |
| A6-010 real exports | **PARTIAL P1** | Admin/finance API-derived labelled JSON drafts download correctly. Persisted report IDs, signed artifacts and malformed-response rejection remain. |
| A6-011 split shells | **PARTIAL** | Beneficiary nav and shared civic shell improved; deeper professional density/task IA remains. |
| A6-012 localization | **OPEN P2** | Bilingual copy exists, but language selection is not full Marathi/Hindi/English localization. |
| A6-013 passport/pathway/journey | **MOSTLY DONE** | Evidence-led redesign, truthful recommendations, authoritative journey state and responsive checks pass. Help and deeper evidence visualization remain. |
| A6-014 trustworthy Help | **OPEN P1** | Callback labels sandbox correctly in success path; grievance must require identity, never synthesize IDs, use truthful runtime state, and prove persisted grievance status. |
| A6-015 three-minute proof | **PARTIAL P1** | Demo boundary and simulator work; one linear inspectable evidence chain is not complete. |
| A6-016 inspectable traceability | **PARTIAL P2** | Existing matrix remains largely explanatory prose rather than linked proof objects. |
| A6-017 field/counsellor | **PARTIAL P2** | Error state and role gate improved; override audit ID, selected-case semantics and full professional task IA remain. |
| A6-018 provider/employer | **PARTIAL P2** | Role gates and visible load errors improved; validation, duplicate prevention, and richer persisted success remain. |
| A6-019 admin/coordination | **PARTIAL P2** | Truthful labels and error surfaces improved; source freshness, audit history and decision-first information architecture remain. |
| A6-020 homepage proof system | **PARTIAL** | Civic-fieldbook redesign and evidence storyboard shipped; real livelihood imagery and deeper proof assets remain. |
| A6-021 graph/map | **OPEN P2** | Correctly deferred until data contracts are stable. |
| A6-022 network-independent build | **DONE for observed Docker build** | System fonts and successful 17-route build; isolated-network build should still be run as release evidence. |
| A6-023 responsive/accessibility | **PARTIAL** | 50+11 browser checks, selected axe contrast scans, and 320–1440 checks pass; requested full viewport matrix, keyboard/screen-reader, zoom 200% and focus-return audit remain. |
| A6-024 offline matrix | **OPEN P1** | PUT queue and same-account explicit sync pass; complete feature matrix, offline navigation, cross-tab and exactly-once semantics remain. |

### Remaining implementation order after this audit

1. A6-014 Help/grievance identity and truth contract; A6-010 malformed export/report contract.
2. A6-006 migration/readiness and A6-007 shared API/error contract.
3. A6-008 validation/idempotency and A6-024 explicit offline support matrix.
4. A6-015/A6-016 judge proof and remaining truth-state sweep.
5. A6-012, A6-017–A6-019, A6-021, A6-023, then performance/data-quality polish.

## Definition of done for the improvement phase

- No protected page renders operational/default data before authorization.
- Production configuration fails closed if secret/demo settings are unsafe.
- Every mutation has authoritative success, visible failure, retry, duplicate-submit protection, and persistence-after-refresh coverage.
- Demo, sandbox, offline, and live states are explicit and never represented by hard-coded `LIVE` badges.
- Core beneficiary workflow works at 320px and with keyboard/screen-reader semantics.
- Clean build works in a network-isolated environment.
- Each wave adds regression tests before visual polish is accepted.

## Wave 0 — P0 security, privacy, runtime blockers

### A6-001 — Wire route-level authentication and role gates

Source: F-001  
Priority: P0  
Scope: all professional portals; beneficiary private routes; demo separation

Acceptance criteria:

- Fresh context navigating to `/field`, `/counsellor/finance`, `/provider`, `/employer`, `/admin`, and `/coordination` redirects to login or a clearly scrubbed public demo page.
- Role-specific routes reject wrong roles before data fetch/render.
- No phone number, beneficiary name, case ID, operational SLA, or sensitive default fixture appears in the unauthenticated DOM.
- Backend authorization tests remain green for 401/403/ownership/jurisdiction cases.

Regression tests: fresh-context Playwright matrix plus API role matrix.

### A6-002 — Fail closed on production secrets and demo mode

Source: F-002  
Priority: P0  
Scope: Docker Compose, config validation, identity demo endpoint

Acceptance criteria:

- `ENVIRONMENT=production` with missing/weak `SECRET_KEY` prevents startup/readiness.
- `DEMO_MODE` defaults false in production-labelled config.
- Demo switch is disabled outside an explicitly isolated demo deployment.
- Role is a fixed enum; `ministry_admin`, `state_admin`, and arbitrary strings cannot be minted from public demo switch unless explicitly approved for the demo host.
- Token has explicit audience/issuer/demo claims and protected endpoints reject demo tokens in production.

Regression tests: production-config subprocess, altered role payload, no-auth switch, token replay.

### A6-003 — Remove PII from fixtures and make seed idempotent

Source: F-001, F-015  
Priority: P0/P2  
Scope: seed scripts and local demo DB

Acceptance criteria:

- Seed twice yields identical counts.
- No real-looking phone numbers in unauthenticated fixtures.
- Unique batch/requisition identities enforced by schema or deterministic upsert.
- A data-quality command reports duplicates before the demo is shown.

## Wave 1 — Broken workflows, navigation, API, database

### A6-004 — Repair anonymous-to-authenticated beneficiary identity handoff

Source: F-003  
Priority: P1  
Acceptance criteria:

- Anonymous intake either creates a claimable session or asks for login before persisting.
- After login, `/beneficiaries/me` is the only source for self-service beneficiary ID.
- Passport, pathways, journey, and grievance use the server-resolved identity, not a stale arbitrary local-storage ID.
- Refresh and re-login preserve the same profile.

### A6-005 — Bind journey actions to persisted pathways

Source: F-004  
Priority: P1  
Acceptance criteria:

- Default/static actions are never sent as fake IDs.
- Each action update returns 2xx and a server version before the UI marks complete.
- 404/403/timeout restores prior state and shows a retryable error.
- Duplicate click is idempotent.

### A6-006 — Establish migration/readiness contract

Source: F-008  
Priority: P1  
Acceptance criteria:

- Empty SQLite and empty PostgreSQL startup paths are documented and tested.
- One migration mechanism is authoritative; `alembic current` reports the expected revision.
- Readiness includes schema revision and seed/reference freshness.
- SQLite development connections enable `PRAGMA foreign_keys=ON` or the project explicitly drops SQLite support.

### A6-007 — Audit every frontend API call against OpenAPI

Source: backend audit  
Priority: P1  
Acceptance criteria:

- Every UI mutation maps to an endpoint, schema, role, ownership rule, and persistence test.
- Dead/fake actions are removed or marked preview.
- API error payloads are normalized to a user-safe error contract.

## Wave 2 — Validation and error handling

### A6-008 — Add shared form validation contract

Source: F-014 and validation audit  
Priority: P1  
Acceptance criteria:

- Empty/whitespace, overlong, HTML/script-like, unsupported-language, negative, zero, huge, invalid phone/email/date, and end-before-start cases have human-readable messages.
- Client validation prevents obvious requests; server and database remain authoritative.
- Entered values survive validation failure.
- Number/date inputs expose min/max, units, and suitable mobile keyboard types.
- Duplicate submits are disabled and idempotency keys are used for mutations.

### A6-009 — Replace silent fallback with explicit state machine

Source: F-005, F-016  
Priority: P1  
Acceptance criteria:

- Every async page exposes `loading`, `live`, `demo`, `offline`, `forbidden`, `empty`, and `error` states as applicable.
- 401/403 never become plausible default data.
- Each error says what happened, whether data was saved, and what to do next.
- Console warnings are supplemental, never the only user feedback.

### A6-010 — Make exports and readiness artifacts real

Source: F-010  
Priority: P1  
Acceptance criteria:

- Admin project export returns a real file or a clear not-implemented label.
- Finance readiness creates a traceable report ID with provenance and no-sanction disclaimer.
- Browser alerts are replaced with inline status/toast/dialog with focus management.

## Wave 3 — Beneficiary UX

### A6-011 — Split beneficiary and professional shells

Source: F-017  
Priority: P1  
Acceptance criteria:

- Beneficiary shell has five simple steps and one primary next action.
- Professional shell has dense tables, filters, provenance, and audit controls.
- Beneficiary can complete the core flow without knowing NSQF/NCO/RPL terminology.

### A6-012 — Implement real Marathi/Hindi/English localization

Source: F-014  
Priority: P2  
Acceptance criteria:

- Selector changes all visible copy, speech locale, and persisted preference.
- Translation strings are reviewed for naturalness by a language reviewer.
- Technical codes remain secondary and expandable.

### A6-013 — Redesign passport/pathway/journey for evidence and next action

Source: F-003, F-004, F-011  
Priority: P1  
Acceptance criteria:

- Passport shows saved evidence, confidence, and verification status from the API.
- Pathways show one concise reason based on current constraints and an optional detail drawer.
- Journey shows authoritative action status, due date, owner, and retry.
- Refresh/re-login tests preserve state.

### A6-014 — Make help trustworthy

Source: callback/grievance findings  
Priority: P1  
Acceptance criteria:

- Callback clearly says sandbox simulation or live carrier status.
- Grievance requires/establishes identity before submission and returns a grievance ID.
- Offline queued grievance visibly shows queued/synced status and does not claim submission before server acknowledgment.

## Wave 4 — Judge demo storytelling

### A6-015 — Build one truthful three-minute proof path

Source: F-009, F-019  
Priority: P1  
Acceptance criteria:

- One persona demonstrates voice/transcript, highlighted evidence, skill graph, NSQF/RPL mapping, constraint change, recommendation, action, and district consequence in one linear surface.
- Each object has explicit truth state and generated timestamp.
- Demo-only data is impossible to confuse with live production records.

### A6-016 — Replace traceability prose with inspectable proof

Source: judge audit  
Priority: P2  
Acceptance criteria:

- Each requirement row links to a working control and a visible result.
- “What is live/deterministic/simulated?” is shown without requiring source-code explanation.
- A judge can verify one database write and one RBAC boundary within three minutes.

## Wave 5 — Professional portal UX

### A6-017 — Field/counsellor case management

Acceptance criteria:

- Jurisdiction and assigned caseload are server-derived.
- Review selection visibly changes the selected case.
- Override records reason, actor, timestamp, old/new recommendation, and audit ID.
- Error/success states are inline and accessible.

### A6-018 — Provider/employer operational integrity

Acceptance criteria:

- Batch and requisition forms have constraints, duplicate prevention, truth-state labels, and persisted results.
- Candidate matching never exposes protected attributes.
- Empty candidate state explains filters/data freshness.

### A6-019 — Admin/coordination decision surfaces

Acceptance criteria:

- Shortage matrix is first-fold primary signal.
- Source-health freshness and provenance are visible.
- Batch planner/project builder distinguish simulation, draft, and submitted proposal.
- Coordination SLA status updates persist and show audit history.

## Wave 6 — Visual redesign and meaningful media

### A6-020 — Homepage visual proof system

Acceptance criteria:

- Static-first evidence strip communicates the three USPs without paragraphs.
- Imagery represents real Indian livelihoods respectfully and legally.
- No decorative gradient/animation is added without comprehension or trust benefit.

### A6-021 — Optional skill graph / district visualization

Acceptance criteria:

- At most one graph and one 2D district view are introduced after data contracts are stable.
- SVG/static fallback, keyboard alternative, mobile fallback, reduced-motion behavior, and performance budget are tested.
- No 3D dependency is added unless it materially improves judge comprehension.

## Wave 7 — Performance, accessibility, offline, polish

### A6-022 — Make builds network-independent

Source: F-006  
Acceptance criteria:

- Replace `next/font/google` with local/system fonts.
- Clean network-isolated `npm run build` passes.
- Bundle and font budgets are recorded.

### A6-023 — Responsive and accessibility completion

Source: F-012, F-013  
Acceptance criteria:

- No document-level overflow at 320×568 through 1920×1080.
- All interactive elements have accessible names and keyboard semantics.
- Tabs/dialogs/focus return/live announcements/reduced motion are verified.
- Zoom 200% and translated text expansion are tested.

### A6-024 — Define and verify offline support matrix

Source: F-007  
Acceptance criteria:

- Per-feature matrix states cached/read-only/queued/unsupported.
- Queue records are idempotent and observable.
- Reconnect sync is exactly-once from the user’s perspective.
- Uncached offline navigation has a truthful offline page, not an unrelated interview fallback.

## Suggested implementation order

1. A6-001, A6-002, A6-003
2. A6-004, A6-005, A6-006, A6-007
3. A6-008, A6-009, A6-010
4. A6-011 through A6-014
5. A6-015 and A6-016
6. A6-017 through A6-019
7. A6-020 and A6-021
8. A6-022 through A6-024

Do not begin broad visual redesign until Waves 0–2 have green regression coverage and the live/demo truth contract is enforceable.
