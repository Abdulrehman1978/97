# Independent verification and gated implementation

Baseline: remote main and local HEAD both `f5d408baa0d3460728a77c168bdbba63e8873fd7`, verified 2026-10-01. Original audit documents are preserved, not treated as proof.

## Gate 0 — independent reproduction

Real runtime: Docker services 97-web-1, 97-backend-1, 97-db-1. Backend reports production, DEMO_MODE=true, PostgreSQL driver. PostgreSQL migration is `8f7083d5f517`; 42 foreign keys exist. No database reset performed.

| Finding | Independent result | Decision |
| --- | --- | --- |
| F001 portal exposure | Anonymous browser /field shows hard-coded Ramesh/Sunita contacts. Anonymous cases API 401; beneficiary admin API 403. Source confirms fallback literals. | Confirm UI access/fallback defect; reject assertion of proven unrestricted private DB access. Guard portals and remove silent fallback. |
| F002 production demo tokens | No-auth demo mint 200; resulting ministry token admin dashboard 200. Runtime production+demo true. | Confirm unsafe production configuration; preserve explicit isolated demo mode. |
| F003 anonymous save | Browser Analyze → Confirm saves ID d1b99d9f… → passport 401. Independent API synthetic ID 3fd90cc9-8150-4fba-a48b-31d490ced357 has NULL user_id in PostgreSQL; passport 401. | Confirm; preserve public extraction, require identity for persistence. |
| F004 journey completion | Anonymous browser displays fallback actions; Mark Completed advances next step, reload restores previous step. API act-2 returns 404 with valid beneficiary token; PostgreSQL has zero matching actions. | Confirm false success; remove fallback actions, distinguish queued from committed. |
| F005 silent defaults | /field API failure renders fallback contacts; /journey API failure renders actionable fictional plan. Finance renders fallback capital plan. | Confirm; errors/empty states must not masquerade as data. |
| F006 build failure | Unchanged Docker web build compiled, typechecked and generated all 17 routes successfully. | Reported blocker not reproduced. Google font build dependency remains a portability concern, not demonstrated production build failure. |
| F007 offline overclaim | Browser homepage says 100% PWA Offline Mode. Service worker only handles GET; only selected mutation helpers queue. It also caches authenticated GET responses. | Confirm claim exceeds contract; full offline sync not yet verified. Treat shared-device caching as a separate security regression target. |
| F008 migrations/FKs | PostgreSQL migration head present, 42 FK constraints. Earlier SQLite observation does not describe Docker DB. | Reject for current Docker runtime. Preserve migrations/architecture. |
| F009 truth badges | Browser anonymous field/home/journey says Verified Live; readiness API DEMO_DATA. | Confirm; runtime truth must bound UI claims. |
| F010 exports | Browser finance Issue Readiness Certificate opens only JS alert. Authenticated admin Generate Project Proposal → Export also opens only an alert. | Confirm both. Must not imply official certification/sanction. |

## Gates

1. Security/identity/data integrity: fail-closed production settings, explicit demo profile, portal guards, authenticated persistence, truthful mutation states and private-cache isolation. Require targeted regressions and real-runtime checks before visual work.
2. Functional honesty: visible fetch errors, empty states, draft exports, runtime provenance, bounded offline contract. Preserve existing tests, add regression coverage.
3. Design: cohesive beneficiary and professional experiences, responsive hierarchy, accessible controls, evidence-led visual storytelling. No backend architecture rewrite.
4. Final browser/API/PostgreSQL verification, regression suite, build/type checks. No pass claim without observed evidence; report untested cases.

Current status (2026-10-02): independent baseline verification, security/data-integrity fixes, functional-honesty work and the first cross-product design wave are implemented. Final Docker build, TypeScript and regression checks passed as detailed below. This is not a claim of exhaustive production certification. Test-created anonymous records are explicitly synthetic and retained for traceability. Existing pytest fixture mutates whichever DB it is configured against, so it runs against an isolated database, never the serving PostgreSQL database.

## Security gate evidence

- 71 backend tests passed against isolated SQLite and PostgreSQL after the first wave (66 existing + 5 new).
- Ten Chromium checks passed after adding an explicit synthetic beneficiary fixture: six anonymous portal guards, beneficiary/admin denial, anonymous save refusal with zero PostgreSQL rows, failed write retention plus successful browser/API/DB persistence, and private API cache exclusion.
- Synthetic journey screenshot: `evidence/security-journey-persisted.png`.
- Temporary production-mode Docker backend on port 18001 returned readiness 200/demo_mode false, demo switch 404, anonymous admin 401. Explicit demo-mode service retains demo roles by design. Its volume was preserved, not reset.
- Original PostgreSQL migration remains `8f7083d5f517`. Tests use `lip_audit_regression_20261001`; live browser tests use the explicitly named `audit-browser-beneficiary` synthetic principal.
- Isolated test database and synthetic evidence records are retained for reproducibility. No claim of private-cache replay safety beyond the executed test; expanded offline checks are in progress.

## Functional wave scope

Runtime-aware provenance, no silent field/coordination/finance fallback records, visible employer/provider failures, actual labelled JSON draft exports (not PDF or issued certificates), persisted confirmed transcript/skill evidence, authorized saved-profile recommendations, no invented passport skills/RPL eligibility, bounded offline PUT queue and explicit same-account synchronization.

## Final verification — 2026-10-02

- Backend: **72 passed** on the isolated PostgreSQL database; one upstream Starlette/httpx deprecation warning.
- Browser: full **50-test suite passed**, then **11 design checks passed** after adding six professional-workspace checks (56 unique tests). No application edits between those runs.
- New evidence includes failed journey writes retaining prior state; successful completion in browser, API and PostgreSQL followed by reload; anonymous persistence rejected with zero matching DB rows; confirmed transcript in passport/API and two synthetic PostgreSQL skill-evidence rows; actual browser offline/online explicit synchronization; no authenticated API cache entries; both finance and admin downloads containing API-derived JSON labelled as drafts.
- Counterfactual request test verifies saved skill IDs and education are used. Frontend no longer invents factor scores, centres, distances or live batches for the simulation.
- Docker frontend build compiled, typechecked and generated all 17 routes. Local `npm run typecheck` passed. Lint completed with **0 errors and 181 warnings**; warning cleanup remains, not a clean-lint claim.
- PostgreSQL architecture check: migration `8f7083d5f517`, **42 foreign keys**, unchanged. No schema rewrite or database reset.
- Landing page tested at 320, 390, 768 and 1440 pixels. Axe WCAG A/AA scans including contrast passed at 390 and 1440. Five authenticated beneficiary pages fit 320 pixels. Six authorized professional workspaces fit 390 and 1440 pixels. This is automated overflow/selected accessibility coverage, not a complete accessibility certification.

## Design wave

The civic-fieldbook direction uses warm paper, dark ink, teal and restrained saffron. Rebuilt landing page, role-aware navigation, five-step beneficiary navigation and evidence-led pathway cards; improved shared workspace typography, touch targets and responsive layout. Reduced-motion behavior follows the design-engineering skill. Removed the unused remote Google-font build dependency. Removed unsupported QR-verification, fixed growth/SLA and default journey-deadline claims. Unsupported microphone access now directs users to typing rather than inserting a fictional transcript.

Visually inspected desktop/mobile landing, narrow passport/pathways and desktop administration screenshots. Evidence files are in `evidence/redesign-*.png`; original audit screenshots remain intact.

## Remaining boundaries

- Running localhost is explicitly **demo mode**, not production. Production now refuses demo configuration and requires a non-default secret; no production deployment performed.
- Some underlying recommendation explanations and district metrics remain reference/demo outputs. Their quality and provenance need a separate domain-data validation wave; runtime labels do not turn demo data into verified facts.
- No physical-device microphone, screen-reader, telephony-provider or external government integration certification. No full offline POST workflow, cross-tab conflict resolution or exactly-once delivery guarantee.
- Professional pages retain their established workflows under the new shared shell; deeper task-specific redesign and broader accessibility remediation remain follow-up scope.
- JSON exports are decision-support drafts, not official certificates, financial sanctions or signed PDFs.
- Synthetic test identities, records and isolated test DB are retained for reproducibility. All edits remain local/uncommitted; no push, PR or deployment.

## Reproduction

Run the explicit local demo with `docker compose -f docker-compose.yml -f docker-compose.demo.yml up -d --build`. In `apps/web`, run `npm run typecheck` and `npx playwright test`. The browser regressions require Docker access and the synthetic identity created by `seed_verification_identity.py` against the demo service. Never run backend pytest against the serving database: override both DATABASE_URL and DATABASE_SYNC_URL to the dedicated `lip_audit_regression_20261001` database, with ENVIRONMENT=development and DEMO_MODE=true.
