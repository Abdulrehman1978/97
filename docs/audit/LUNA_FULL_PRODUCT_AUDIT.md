# SIH26097 — LUNA Full Product Audit

Audit date: 2026-10-01 (Asia/Calcutta)  
Repository: `https://github.com/Abdulrehman1978/97.git`  
Baseline: `main` at `f5d408baa0d3460728a77c168bdbba63e8873fd7` (`Packet 28.4`)  
Audit mode: read-only product audit; no product-code changes or commits made.

## Current re-audit status — 2026-10-02

This file retains the original 2026-10-01 baseline below for traceability. The original findings were not treated as proof after code changes. The current Docker/PostgreSQL application and the changed working tree were rechecked against those findings, the Astra backlog, and the third pasted audit prompt.

**AUDIT STATUS: PARTIAL — current P0 blockers reproduced: 0; current P1 gaps: 6 partial/open.** The security/data-integrity wave is materially verified, but this is not a production release sign-off. The local stack is intentionally running with the explicit `docker-compose.demo.yml` overlay (`ENVIRONMENT=demo`, `DEMO_MODE=true`, PostgreSQL). That demo behavior must not be interpreted as production behavior.

### Resolution ledger

| Original finding / backlog item | Current result | Evidence and remaining boundary |
|---|---|---|
| F-001 / A6-001 unauthenticated professional portals | **RESOLVED for observed runtime** | Browser matrix: all six professional routes redirect anonymous visitors; beneficiary→admin is 403; no phone fixture is rendered. `AuthProviderWrapper` now maps routes to roles. This is client-side route protection, so server/API authorization remains the authoritative boundary and must stay covered. |
| F-002 / A6-002 demo privilege/configuration | **RESOLVED for production configuration; demo expected** | `docker-compose.yml` defaults demo false and has no secret fallback; `docker-compose.demo.yml` is explicit. Production settings reject demo mode and weak/default secrets; demo roles are allow-listed. Current explicit demo stack returns readiness `demo_mode:true`, demo mint 200/admin 200 by design. A separately started production deployment still needs environment/secrets and deployment verification. |
| F-003 / A6-004 anonymous identity handoff | **RESOLVED for persistence boundary; UX is intentionally gated** | Anonymous save API is 401 and browser explains sign-in before save; authenticated flows resolve `/beneficiaries/me`; confirmed transcript → passport/API/PostgreSQL evidence passed. A true claimable anonymous profile was not added, which is acceptable only while copy continues to require sign-in before persistence. |
| F-004 / A6-005 journey persistence | **RESOLVED for tested path** | No fabricated actions are used; mutation changes UI only after server acknowledgment; injected 500 retains prior state; successful browser/API/DB write survives reload; offline PUT remains queued until explicit same-account sync. Cross-tab conflicts and exactly-once semantics remain out of scope. |
| F-005 / A6-009 silent fallbacks | **MOSTLY RESOLVED** | Field/provider/employer/admin/finance failures now render visible states; synthetic contacts and fake action plans are removed. Remaining review: `/demo` deliberately catches some simulator failures into local fallback, and Help still contains an invented grievance-ID fallback. |
| F-006 / A6-022 network-dependent build | **RESOLVED for current build** | `next/font/google` was removed; Docker build compiled, typechecked, and generated 17 routes. A genuinely network-isolated build was not separately run after the change; the image build itself succeeded. |
| F-007 / A6-024 offline overclaim | **PARTIAL / P1 OPEN** | Authenticated PUT queue, same-account ownership, explicit sync, and browser reconnect test pass. The service worker remains shell/GET oriented; not every mutation is supported, cross-tab coordination is absent, and offline navigation fallback/duplicate-sync semantics are not a full offline contract. |
| F-008 / A6-006 migration/FK concern | **NOT REPRODUCED on real runtime; P1 contract remains partial** | Docker PostgreSQL reports migration `8f7083d5f517` and 42 foreign keys. The local SQLite FK setting remains disabled and app startup still uses `create_all` in the model helper; authoritative migration/readiness reporting is not implemented. |
| F-009 truth-state mismatch | **MOSTLY RESOLVED; P1 OPEN for remaining surfaces** | Home, runtime badge, demo, pathway records, and admin/finance labels are bounded or explicit. Help header still says `LIVE` while callback is sandbox-capable; some demo copy uses “Live” as a product interaction label. Truth-state sweep should continue. |
| F-010 / A6-010 exports | **PARTIALLY RESOLVED / P1 OPEN** | Admin and finance now download API-derived labelled JSON drafts and browser tests inspect contents. They are not persisted report records, signed artifacts, or official PDFs; Help/grievance still fabricates an ID when API response is malformed. |
| A6-007 API contract audit | **PARTIAL / P1 OPEN** | Main flows map to real endpoints and 50 browser regressions plus 72 backend tests pass. A generated endpoint-to-UI schema/ownership matrix and uniform error envelope are still missing. |
| A6-008 shared validation | **PARTIAL / P1 OPEN** | Basic required fields and selected max lengths exist. Broad invalid-input coverage (HTML/script-like text, phone/date/number ranges, duplicates, idempotency keys) is not complete across professional forms. |
| A6-014 trustworthy Help | **PARTIAL / P1 OPEN** | Callback is visibly sandbox-capable and errors are inline; grievance requires real API response only in the tested happy path, but the page still uses a demo beneficiary ID when unauthenticated, displays `LIVE`, and invents `GRV-*` on malformed responses. |
| A6-015/A6-016 judge proof | **PARTIAL / P1/P2 OPEN** | Judge desk is labelled `DEMO_DATA` and IVR is sandbox-oriented; the simulator remains scenario-driven and its counterfactual catch can fall back locally without a visible error. A compact inspectable transcript→evidence→mapping→action→district proof chain is not yet complete. |

### Current release classification

- **P0:** 0 observed in the explicit local demo runtime after the security wave. Production deployment remains unverified until started with real secret material and `DEMO_MODE=false`.
- **P1:** 6 open/partial contracts: offline scope (F-007/A6-024), migration/readiness contract (F-008/A6-006), uniform API contract (A6-007), broad validation (A6-008), trustworthy Help/grievance (A6-014/F-010), and judge proof/remaining truth-state surfaces (A6-015 plus F-009).
- **P2:** localization, deeper professional task UX, visual evidence storytelling, manual keyboard/screen-reader coverage, and data-quality/duplicate fixture cleanup remain.
- **P3:** lint warnings, performance instrumentation, and polish remain.

### Current verification evidence

- Real Docker/PostgreSQL probe: readiness 200 with `DEMO_DATA`; anonymous admin 401; anonymous cases 401; demo switch 200 only because the explicit demo overlay is active; demo admin 200; beneficiary admin 403; missing action 404; anonymous beneficiary create 401.
- Backend: 72 tests passed on isolated PostgreSQL.
- Browser: 50 full-suite tests passed; 11 responsive/professional design tests passed; six authorized professional workspaces and beneficiary surfaces were checked at mobile/desktop widths; WCAG A/AA axe scans including contrast passed at selected 390/1440 landing widths.
- PostgreSQL: migration `8f7083d5f517`, 42 foreign keys, and synthetic confirmed skill evidence persisted. No schema reset.
- Screenshots: `docs/audit/evidence/redesign-*.png`, including landing, passport, pathways, admin, and professional workspaces. Original baseline screenshots remain unchanged.
- Competitor/reference recheck: Skill India Digital currently presents multilingual courses, centres, jobs/apprenticeships and recommendation entry points; NCS currently emphasizes jobseeker/employer/counsellor connection and no-fee warnings; the Social Justice department currently publishes PM-DAKSH scheme material. These support the existing comparison section, not a claim that LIP has live integration. Sources: [Skill India Digital](https://www.skillindiadigital.gov.in/Home/handbook/1050), [NCS](https://ncs.gov.in/), [PM-DAKSH](https://socialjustice.gov.in/schemes/100).

**PARTIAL — substantial integrated UI/API audit completed, but not a release sign-off.**

The local Next.js/FastAPI/SQLite runtime was exercised directly. Docker Compose could not be started because the environment denied access to the Docker engine named pipe. True browser offline mode, network interruption injection, and every requested viewport were therefore not independently verified. Those gaps are recorded as unverified rather than passed.

### Executive summary

What works well:

- The repository is clean and exactly matches the stated Packet 28.4 baseline.
- The local backend is alive and ready: `/health/live` and `/health/ready` both returned 200; readiness correctly reported `demo_mode: true` and `truth_state: DEMO_DATA`.
- Backend tests passed: **66 passed**.
- Existing Playwright suite passed: **28 passed**.
- TypeScript typecheck passed. ESLint completed with **0 errors and 196 warnings**.
- Marathi interview extraction, anonymous beneficiary profile creation, pathway counterfactual controls, and sandbox IVR/DTMF flows execute end to end at the UI layer.
- Backend authorization is stronger than the UI: unauthenticated admin access returned 401, beneficiary-to-admin returned 403, employer-to-beneficiary profile access returned 403, and beneficiary ownership access returned 200.
- The product has a clear conceptual differentiator: spoken experience → skill evidence → qualification/RPL → action → district planning.

What is broken or release-blocking:

- **P0:** Professional portals are directly reachable without authentication and render phone numbers, case data, and operational dashboards. No page uses the existing `RequireAuth` guard.
- **P0:** In the current production-labelled Docker configuration, `DEMO_MODE` defaults to true and the secret has a weak fallback. An unauthenticated caller can mint a `ministry_admin` demo token and receive a 200 admin dashboard response.
- **P1:** “Talk without login” saves an anonymous profile, but the next passport request fails with `Forbidden: Beneficiaries cannot access another beneficiary's profile`. The user is told the profile was saved, then cannot continue.
- **P1:** Journey completion is optimistic-only. The UI toggles completion even when the backend returns `Action not found`; the error is only logged and the state reverts after refresh.
- **P1:** Several portals silently replace 401/403/API failures with believable default data while retaining `LIVE` badges. This makes a broken integration look operational.
- **P1:** A clean production build fails because `next/font/google` cannot fetch Geist/Geist Mono from Google Fonts. The deployed/runtime build is therefore network-dependent.
- **P1:** The PWA claim is broader than the implementation: the service worker caches GET shell routes but does not make all writes offline-safe, and unknown offline HTML navigations fall back to `/interview`.

What is confusing:

- The health contract says `DEMO_DATA`, while most route headers and the homepage say `Verified Live`.
- The language selector changes selection state but does not change the page language.
- The judge traceability matrix labels IVR, field, finance, admin, and coordination capabilities `LIVE` although the judge desk itself is `DEMO_DATA` and the IVR explicitly says `SANDBOX`.
- The UI exposes professional portals to an authenticated beneficiary and to unauthenticated visitors, but the backend correctly rejects many of their API calls. This produces empty/default screens rather than clear authorization states.

What looks weak:

- The homepage is credible but text-heavy and visually close to a polished Tailwind landing page rather than a distinctive public-service product. The first-screen story is mostly paragraphs and pills; there is no visual proof of the skill graph, action loop, or district intelligence.
- Mobile navigation and long tab strips overflow at 320×568. The main header is compressed and the document scroll width exceeded the viewport on every sampled route.
- Operational screens show dense bilingual copy, static demo cards, duplicated sample rows, and generic empty states.
- There are no meaningful product visuals for voice evidence, skill graph, district gap matrix, or pathway transformation.

What judges will question:

1. Which data is live, which is deterministic, and which is demo-only?
2. Why does a clean build require Google Fonts network access?
3. Can a user really continue from voice intake to passport and persisted journey?
4. Are provider/employer/admin pages protected in production?
5. Is the “100% PWA Offline Mode” claim demonstrably true for writes and reconnect sync?
6. Which official source currently backs a recommendation, and when was it last synchronized?

What beneficiaries will struggle with:

- Completing the anonymous flow beyond intake.
- Understanding why a pathway is recommended when the card repeats generic explanatory text.
- Recovering from failed API calls because errors are often hidden in console logs or replaced by defaults.
- Using the 320px layout because the header and tab/navigation strips are wider than the viewport.
- Trusting the language selector because choosing English does not translate the UI.

First Astra 6 priorities:

1. Enforce route-level authentication/role guards and remove sensitive demo fixtures from unauthenticated pages.
2. Make demo mode explicit and impossible to enable accidentally in production; rotate/fail closed on weak secrets.
3. Repair the anonymous-to-authenticated beneficiary identity handoff and make every persisted mutation show authoritative success/error.
4. Remove silent fallback-to-demo behavior from professional portals; use explicit `DEMO_DATA`, `SANDBOX`, `OFFLINE`, or `ERROR` states.
5. Make the production build deterministic without runtime font downloads.
6. Fix 320px layout, keyboard semantics, language switching, and offline write contracts before visual redesign.

## Baseline and runtime evidence

### Git state

```text
git status --short --branch
## main...origin/main

git branch --show-current
main

git rev-parse HEAD
f5d408baa0d3460728a77c168bdbba63e8873fd7

git log -5 --oneline
f5d408b feat(deploy): harden production configuration and verify post-restart runtime (Packet 28.4)
34266b0 docs(packet-28.3): record full runtime verification, CI run 36869326529 and Vercel deployment evidence
7988587 fix(e2e): dynamic beneficiary session resolution for CI resilience
cdea30c feat(runtime): verify local Docker stack, full-stack E2E and CI runtime loops
87160a2 fix(packet-28.2): resolve auth-context eslint errors, qualification fk and datetime.utcnow deprecations
```

### Services

Docker Compose was attempted first. `docker compose ps` failed before service inspection because the Docker engine pipe was denied (`npipe:////./pipe/docker_engine`). The already-running local services were then verified:

| Check | Result |
|---|---|
| `GET http://localhost:8000/health/live` | 200, app `Livelihood Intelligence Platform`, version `3.0.0` |
| `GET http://localhost:8000/health/ready` | 200, database `ok`, `demo_mode: true`, truth `DEMO_DATA` |
| `HEAD http://localhost:3000` | 200 |
| PostgreSQL/Docker | Not verified; Docker engine access blocked |
| Browser UI | Available at `http://localhost:3000` |

### Automated checks

| Check | Result | Notes |
|---|---:|---|
| Backend pytest | PASS | 66 passed; 2 environment/dependency warnings |
| Playwright E2E | PASS | 28 passed in 25.3s |
| TypeScript | PASS | `tsc --noEmit` |
| ESLint | PASS with warnings | 0 errors, 196 warnings; unused imports, `any`, hook dependency and state-in-effect warnings |
| Next production build | FAIL | `next/font/google` failed to fetch Geist and Geist Mono from Google Fonts |
| Docker integrated stack | UNVERIFIED | Docker engine permission failure |

## Routes and interaction inventory

### Routes discovered

`/`, `/login`, `/interview`, `/passport`, `/pathways`, `/journey`, `/help`, `/field`, `/counsellor/finance`, `/provider`, `/employer`, `/admin`, `/coordination`, `/demo`.

No additional `src/app/**/page.tsx` routes were found beyond these 14.

### Inventory totals from rendered DOM

Across the 14 routes, the rendered inventory contained **70 links, 39 buttons, 22 inputs/selects/textareas, 3 forms, and 3 tables**. The following were directly exercised or inspected: language selection; sign-in and password visibility; voice/analyze/re-analyze/save; passport retry; pathway radius, preference, accessibility, filters, fit-factor disclosure, sliders and choose-path actions; journey completion; callback and grievance forms; field case selection and override; finance readiness action; provider batch modal and publish; employer requisition modal, filter and publish; admin tabs, batch planner, project builder and source health; coordination status actions; demo persona, live variable, IVR keypad and traceability tabs.

### Recursive navigation result

The beneficiary navigation bar was traversed through interview → passport → pathways → journey → help. Professional portal entry points and child modals were traversed individually. Several child workflows terminated in silent API failure or browser alert rather than a durable success screen; those are findings, not coverage gaps.

## Roles tested

Real seeded credentials authenticated successfully for beneficiary, field worker, counsellor, financial counsellor, provider, employer, and district administrator. The state/ministry role was exercised through the demo switch endpoint. SIH demo UI and sandbox IVR were exercised directly.

Backend authorization checks:

| Scenario | Result |
|---|---:|
| Unauthenticated `GET /api/v1/admin/dashboard` | 401 |
| Beneficiary token → admin dashboard | 403 |
| Employer token → beneficiary profile | 403 |
| Beneficiary token → own beneficiary profile | 200 |
| Public jobs catalogue | 200 by design in current router |
| Unauthenticated `POST /api/v1/identity/demo/switch-role` in current mode | 200 |
| Demo `ministry_admin` token → admin dashboard | 200 |

The last two rows are safe only when demo mode is isolated from production and the role input is allow-listed.

## Major workflow evidence

### Beneficiary golden flow

1. Opened `/interview` without login.
2. Entered synthetic Marathi: `मी तीन वर्षे दुचाकी गॅरेजमध्ये काम केले आहे...`.
3. Extraction returned Two-Wheeler Engine Overhaul at 92% and Brake System Maintenance at 95%, with editable travel/education/preference constraints.
4. Confirm & Save returned a real beneficiary UUID and the UI displayed “माहिती डेटाबेसमध्ये सेव्ह झाली आहे.”
5. Clicking “View My Skills” navigated to `/passport`; the API then returned `Forbidden: Beneficiaries cannot access another beneficiary's profile` because the anonymous saved ID and authenticated ownership identity were not reconciled.
6. `/help` callback worked as `SANDBOX Simulation` with queue token `CB-SIM-987`.
7. Anonymous grievance submission retained the entered data but displayed `Authentication credentials required or token expired`; the page did not explain that login was required before typing/submitting.

### Counterfactual and IVR

- `/pathways` radius changed from 15km to 25km and the heading updated, but card-level “why this fits” text and embedded sliders still displayed 15km. The judge variable test on `/demo` did produce a recalculation result for 20km.
- `/demo` IVR start produced a labelled `SANDBOX` session and prompt. Pressing `1` produced the expected Marathi next prompt. This is a strong demonstrable simulator, not live carrier integration.

### Journey persistence

Clicking “Mark Completed” immediately changed the UI optimistically. Browser console evidence then reported `ApiError: Action not found`, and a reload restored the incomplete state. This is not durable persistence.

### Professional portals

- `/field`, `/admin`, `/provider`, `/employer`, `/coordination`, and `/counsellor/finance` render operational-looking content without an authenticated role guard.
- Provider and employer publish forms open correctly, but unauthorized submissions resolve to browser alerts and do not present an inline actionable error.
- Admin API failures are caught with `console.warn("Using local simulation")`/similar and do not render an error, empty state, or retry control.

## Findings

Each finding includes reproducible evidence, expected behavior, and a regression requirement.

### F-001 — P0 — Unauthenticated professional routes expose operational/demo data

Area: authentication/authorization/privacy  
Roles: unauthenticated visitors, beneficiary, all professional roles  
Routes: `/field`, `/counsellor/finance`, `/provider`, `/employer`, `/admin`, `/coordination`  
Element/action: direct navigation by URL

Steps:

1. Clear the browser token or use a fresh context.
2. Navigate directly to `/field` or `/employer`.
3. Observe rendered case names, phone numbers, job data, operational copy, and action controls.
4. No redirect to `/login` occurs.

Expected: protected route guard before rendering; unauthenticated users receive a login redirect or a clearly public, scrubbed demo page.  
Actual: full dashboard-shaped pages render. `/field` exposes `9876543210` and `9823114455` in the default caseload.  
Frontend evidence: no page imports/uses `RequireAuth`; the guard exists only as an unused component in `auth-context.tsx`.  
Backend evidence: protected APIs themselves correctly return 401/403; the exposure is primarily the static frontend/default fixtures.  
Root cause: route-level auth is designed but not wired into pages.  
Fix: add route-level and component-level guards; remove PII from unauthenticated fallback fixtures; add server-side authorization for any server-rendered data.  
Regression: Playwright fresh-context test for every professional route must assert redirect/403 and no phone/beneficiary data in DOM.

### F-002 — P0 — Production-labelled Compose configuration permits demo privilege minting

Area: security/configuration/RBAC  
Roles: unauthenticated caller, ministry admin  
Route: `POST /api/v1/identity/demo/switch-role`

Steps:

1. Start the current configuration with its defaults.
2. POST `{"role":"ministry_admin"}` without an Authorization header.
3. Use the returned token on `GET /api/v1/admin/dashboard`.

Expected: demo switch is disabled unless an explicit isolated demo deployment is selected; role input is an allow-listed demo persona.  
Actual: current local `DEMO_MODE=true` endpoint returned 200 and minted a `ministry_admin` demo token; the admin dashboard returned 200. `docker-compose.yml` also defaults `DEMO_MODE` to true and uses a fallback secret string.  
Frontend/API evidence: `identity/router.py` copies `req.role` directly into the JWT.  
Root cause: demo utility is unauthenticated and accepts arbitrary roles; production-labelled Compose fails open to demo mode.  
Fix: fail closed on missing production secret, default `DEMO_MODE=false`, isolate demo host/config, validate a fixed role enum, and add a signed demo-only audience/issuer claim.  
Regression: production-config test must prove switch endpoint is 404/403 and altered/arbitrary roles cannot mint tokens.

### F-003 — P1 — Anonymous intake cannot continue to passport

Area: beneficiary workflow/identity persistence  
Role: beneficiary without login  
Route: `/interview` → `/passport`

Steps: complete the Marathi interview, confirm/save, then click “View My Skills.”

Expected: either the anonymous flow remains usable through passport/journey, or the UI requests login before saving and explains the handoff.  
Actual: save says the profile is in the database and stores an ID, but passport fetch is rejected as another beneficiary’s profile.  
Evidence: direct API login returned Ramesh beneficiary ID `7b921b01-...`; the UI-created anonymous record had a different UUID. The browser displayed `Forbidden: Beneficiaries cannot access another beneficiary's profile`.  
Root cause: anonymous `POST /beneficiaries/` and authenticated ownership are not reconciled; frontend stores a client-selected ID.  
Fix: create an explicit anonymous session/claim token or require login before save; on login, resolve `/beneficiaries/me` and replace stale local IDs; never call an arbitrary stored ID for beneficiary self-service.  
Regression: fresh-context anonymous golden flow through refresh/login/passport/journey.

### F-004 — P1 — Journey completion is optimistic and non-persistent

Area: workflow/data integrity  
Role: beneficiary  
Route: `/journey`

Steps: click “Mark Completed,” observe the item change, reload.

Expected: button is disabled while saving; success is shown only after authoritative 2xx; failed mutation restores prior state and gives retry guidance.  
Actual: UI toggles immediately; console records `ApiError: Action not found`; error is caught and only logged; refresh restores incomplete state.  
Frontend evidence: `journey/page.tsx` updates `actions` before `updateActionStatus` and logs errors without visible state.  
Root cause: static fallback action IDs (`act-1` etc.) do not necessarily correspond to the selected backend pathway.  
Fix: bind actions to the loaded pathway; do not render mutation controls for fallback-only data; show saving/success/error states.  
Regression: update, reload, duplicate click, API 404, timeout, and offline queue tests.

### F-005 — P1 — Silent fallback-to-demo hides broken integrations

Area: error states/truth-state integrity  
Roles: field worker, counsellor, admin, provider, employer, coordinator  
Routes: `/field`, `/counsellor/finance`, `/admin`, `/coordination`, `/employer`, `/journey`

Steps: load professional routes with a beneficiary token or no token; inspect page and browser console.

Expected: clear `401`, `403`, `OFFLINE`, `DEMO_DATA`, or `ERROR` state with recovery action.  
Actual: page renders plausible default cases/capital/jobs/coordination data; console carries warnings such as `Using default field caseload` and `Using offline/resilient journey defaults`. Admin catches failures without rendering an error.  
Evidence: console log collection recorded repeated `AuthError` warnings and API errors while the screen retained operational-looking content.  
Root cause: fallback fixtures are presentation-coupled to error handling and truth badges are hard-coded `LIVE`.  
Fix: model `loading | live | demo | offline | forbidden | error` explicitly; never replace forbidden data with a live-looking fixture.  
Regression: mock 401/403/404/500/timeout and assert visible status plus no sensitive/default content unless explicitly labelled.

### F-006 — P1 — Production build depends on live Google Fonts fetch

Area: build/release/performance  
Route: global layout

Steps: run `npm run build` from `apps/web` in the audit environment.

Expected: reproducible build without external network dependency.  
Actual: Turbopack build failed because `next/font/google` could not fetch Geist and Geist Mono from `fonts.googleapis.com`.  
Evidence: `apps/web/src/app/layout.tsx:2` imports `Geist` and `Geist_Mono` from `next/font/google`; build error explicitly says to self-host or provide network access.  
Root cause: font assets are not vendored/local.  
Fix: self-host licensed font files with `next/font/local` or use a system stack; add an offline clean-build CI job.  
Regression: build in a network-isolated container.

### F-007 — P1 — PWA offline claim exceeds verified write behavior

Area: PWA/offline/data safety  
Routes: `/interview`, `/passport`, `/pathways`, `/journey`, `/help`

Evidence: `sw.js` pre-caches selected GET routes and falls back any unknown HTML navigation to `/interview`. It ignores non-GET requests. The client has an offline queue, but journey completion and several portal mutations do not visibly use an offline mutation contract. Browser offline/reconnect injection was not available in this run, so actual behavior remains unverified.

Expected: every claimed offline-capable mutation is queued with an idempotency key, shown to the user, synchronized once after reconnect, and reconciled with server truth.  
Actual: marketing copy says `100% PWA Offline Mode`; implementation only provides partial GET shell caching and route fallback.  
Fix: define the offline support matrix per feature, add queue/sync observability, and change the claim to the verified subset until complete.  
Regression: Playwright service-worker/offline tests for shell, queued save, reconnect, duplicate sync, stale cache, and unsupported mutation messaging.

### F-008 — P1 — Local schema/migration state is not authoritative

Area: database operations  
Runtime: SQLite `lip.db`

Evidence: the database contains 40 tables including 39 application tables, but `alembic_version` is empty and `alembic current` prints no revision. `database.py` defines `init_db()` with `Base.metadata.create_all`, but `main.py` does not call it; only Docker entrypoint runs `alembic upgrade head`.

Expected: every supported local/deployment startup path has one authoritative migration mechanism and reports its revision in readiness.  
Actual: the running local DB is seeded and usable, but migration provenance is absent; a clean SQLite startup outside the Docker entrypoint is not proven.  
Fix: use migrations in the documented local runbook or explicitly initialize a disposable dev DB before startup; expose migration revision in health; test a clean database.  
Regression: start against an empty SQLite/PostgreSQL database and assert schema + seed + readiness.

### F-009 — P1 — Truth-state badges are inconsistent with runtime state

Area: trust/governance/judge demo  
Routes: homepage, interview, pathways, journey, field, provider, employer, admin, coordination, demo

Expected: a `DEMO_DATA` runtime cannot present deterministic/default content as `LIVE`; every externally sourced object carries its own freshness/truth state.  
Actual: `/health/ready` reports `truth_state: DEMO_DATA`, while the homepage, interview, field, provider, employer, admin, coordination and pathway headers hard-code `LIVE`. `/demo` correctly uses `DEMO_DATA` and its IVR uses `SANDBOX`, but the traceability rows label many capabilities `LIVE`.  
Root cause: badges are page constants rather than a shared runtime truth contract.  
Fix: propagate backend truth metadata, render `DEMO_DATA`/`SANDBOX`/`LIVE` at object level, and add a build-time lint rule for hard-coded LIVE in demo deployments.  
Regression: run the UI with `DEMO_MODE=true` and assert no unqualified LIVE badges.

### F-010 — P1 — Export/readiness actions are browser alerts, not artifacts

Area: professional workflow/dead ends  
Routes: `/admin`, `/counsellor/finance`

Steps: generate the admin project proposal or click the finance readiness action.

Expected: generate a downloadable, traceable artifact or show an explicit “not implemented” state.  
Actual: `alert("प्रस्ताव शासकीय फॉरमॅटमध्ये एक्सपोर्ट झाला आहे!")` and a similar finance alert claim completion without a file, job ID, or persisted record.  
Fix: implement a real export endpoint/download or relabel the control as a preview.  
Regression: wait for download, verify file contents/metadata, error and retry behavior.

### F-011 — P2 — Counterfactual screen shows stale constraints after change

Area: recommendations/consistency  
Route: `/pathways`

Steps: click `25 km`.

Expected: every dependent explanation, slider, reason, and recommendation updates to the same value.  
Actual: page heading shows 25km, but card explanation says 15km and embedded “What-If” sliders remain 15km.  
Fix: centralize constraint state and render all dependent components from the authoritative result.  
Regression: radius 5/15/25, wage/self-employment/hybrid, accessibility toggle, refresh.

### F-012 — P2 — 320px layout has document-level horizontal overflow

Area: responsive UX  
Routes: all sampled routes

Evidence: explicit 320×568 viewport produced document widths of 396–512px across all sampled pages. Homepage, login, interview, journey, help and provider reported `scrollWidth: 512`; admin reported 397; provider/employer/coordination contained wider tab/table strips.

Expected: body/document width must not exceed viewport; intentional table scrolling should be scoped to the table container.  
Actual: header and page shell themselves exceed viewport; tab strips and header controls are compressed/cropped.  
Fix: mobile navbar redesign, `min-width:0` on flex children, scoped table overflow, compact portal navigation, and 200% zoom test.  
Regression: 320×568, 360×800, 375×812, 390×844, 412×915 and core workflow traversal.

### F-013 — P2 — Manual accessibility gaps remain despite passing axe smoke tests

Area: accessibility/keyboard  
Evidence: the authenticated navbar user-menu button has no accessible name or title; the rendered inventory found one empty-name button on authenticated routes. Interactive persona/action cards use click handlers on non-button containers; tab groups do not expose tab/tabpanel semantics or `aria-selected`.

Expected: every control has a name, focus order, keyboard activation, state semantics, and live announcements for async changes.  
Actual: axe smoke tests pass, but manual semantics are incomplete and several interactions rely on pointer clicks.  
Fix: use semantic buttons/links, labelled icon buttons, dialog/tab primitives, focus return, live regions, and reduced-motion handling.  
Regression: keyboard-only route traversal with focus screenshots and screen-reader tree assertions.

### F-014 — P2 — Language selector is state-only, not localization

Area: multilingual UX  
Route: all shared pages

Steps: select English in the shared language combobox.

Expected: UI strings, speech language, and persisted preference change.  
Actual: selection changes to English, but the page remains the same bilingual Marathi/English content and no translation state is applied.  
Fix: use a real locale dictionary/router or explicitly label the control as a future preference; keep speech/transcription locale synchronized.  
Regression: Marathi/Hindi/English selection, reload persistence, interview language and read-aloud.

### F-015 — P2 — Demo data contains duplicate visible records

Area: data quality/demo credibility  
Routes: `/provider`, `/employer`

Evidence: provider showed `BATCH-TEST-A1` twice with identical values; employer showed `Mechanic Technician Alpha` twice. This may be fixture contamination, non-idempotent seeding, or insufficient UI deduplication.

Expected: idempotent seed data and unique visible records.  
Fix: unique constraints/idempotent upsert for batch and requisition identities, plus a data-quality check in demo bootstrap.  
Regression: restart/seed twice and assert stable row counts.

### F-016 — P2 — Professional fallback screens are not honest empty/error states

Area: admin/provider/employer/coordination UX

Expected: “No data loaded — sign in as Provider” or “Access denied — switch role,” with retry.  
Actual: static cards, tables, SLA percentages and operational claims remain visible while API calls fail. Employer candidate table is empty with no explanation.  
Fix: replace static defaults with explicit state components; show the role required for each action.

### F-017 — P2 — Shared portal model is too dense for beneficiary mode

Area: information architecture/low-literacy UX  
Evidence: homepage contains long bilingual paragraphs, many stakeholder cards, engineering terms such as NSQF/NCO/RPL/DPDP, and multiple equal-weight CTAs. `/pathways` repeats the full five-step “Living Pathway” for each recommendation.

Expected: beneficiary mode should show one next step, short explanations, read-aloud, and optional technical detail.  
Fix: split beneficiary and professional navigation shells; use progressive disclosure for codes, evidence spans, and policy terminology.

### F-018 — P3 — Build quality warnings are too numerous for a public-service baseline

Area: maintainability/performance  
Evidence: ESLint completed with 196 warnings, including unused imports,  `any`, missing hook dependencies, and `react-hooks/set-state-in-effect`.  
Fix: type API contracts, remove dead imports, memoize/load effects correctly, and make warnings fail in CI after a staged baseline.

### F-019 — P3 — Homepage and judge storytelling lack visual proof

Area: visual design/judge impact  
Evidence: hero is primarily text and pills; `/demo` hero tab shows persona cards and a link into `/interview`, not a compact visual pipeline from voice waveform to skill graph to NSQF/RPL to action to district gap.  
Fix: add one truthful, static-first proof composition with annotated evidence spans, constraint change, and district action result; keep live/demo state visible.

### F-020 — P3 — Static dates and snapshot copy reduce trust

Area: copy/freshness  
Evidence: judge desk says `Snapshot: 30 Sep 2026` while the audit date is 1 Oct 2026; several pages show hard-coded future due dates and “live” claims.  
Fix: display generated-at/freshness timestamps from the API and distinguish scenario dates from current platform time.

## Feature coverage matrix

Legend: `PASS` means manually observed with the stated boundary; `PARTIAL` means some layers work but a material gap remains; `FAIL` means the visible workflow contradicts its promise; `EXTERNAL/UNVERIFIED` means the environment prevented proof.

| Feature | Role | Route | Frontend | API | Backend/auth | DB persistence | Validation/error | Mobile/a11y | Truth | Manual status |
|---|---|---|---|---|---|---|---|---|---|---|
| Landing/USP story | visitor/judge | `/` | Present | n/a | n/a | n/a | n/a | PARTIAL | FAIL: LIVE in demo | PARTIAL |
| Login/logout | all seeded roles | `/login` | Present | Connected | PASS login/RBAC | PASS user lookup | PARTIAL | PARTIAL | LIVE | PASS |
| Voice transcript/extraction | beneficiary | `/interview` | Present | Connected | Public extraction | PARTIAL | PARTIAL empty input | PARTIAL | hard-coded LIVE | PASS extraction |
| Anonymous profile save | beneficiary | `/interview` | Present | Connected | Optional auth | PASS insert observed | PARTIAL | PARTIAL | LIVE/Demo ambiguity | PARTIAL |
| Passport | beneficiary | `/passport` | Present | Connected | Ownership correct | BLOCKED by ID handoff | ERROR visible but wrong state | PARTIAL | mixed | FAIL anonymous continuation |
| Pathway recommendation | beneficiary | `/pathways` | Present | Connected/fallback | Partial | Not proven | PARTIAL stale constraints | PARTIAL | hard-coded LIVE | PARTIAL |
| Journey action update | beneficiary | `/journey` | Present | Connected | Backend rejects fallback ID | FAIL persistence | FAIL silent | PARTIAL | mixed | FAIL |
| Callback | beneficiary | `/help` | Present | Sandbox endpoint | Public sandbox | token only | PASS labelled sandbox | PARTIAL | SANDBOX | PASS |
| Grievance | beneficiary | `/help` | Present | Connected | Auth required | Not persisted anonymous | PARTIAL | PARTIAL | LIVE label | FAIL anonymous |
| Field caseload/override | field/counsellor | `/field` | Present | Fallback on auth failure | Backend protected | Not proven | FAIL inline error | PARTIAL | hard-coded LIVE | PARTIAL |
| Finance readiness | financial counsellor | `/counsellor/finance` | Present | Fallback/action alert | Protected API | Not proven | FAIL fake completion | PARTIAL | mixed | PARTIAL |
| Provider batch | provider | `/provider` | Present | Connected on publish | Backend protected | Not proven | Alert-only failure | PARTIAL | demo rows | PARTIAL |
| Employer requisition | employer | `/employer` | Present | Connected on publish | Backend protected | Not proven | Alert-only failure | PARTIAL | demo rows | PARTIAL |
| District planning | admin | `/admin` | Present | Connected but silent failure | Backend protected | Not proven | FAIL silent | PARTIAL | hard-coded LIVE | PARTIAL |
| Coordination | counsellor/admin | `/coordination` | Present | Connected/fallback | Backend protected | Not proven | PARTIAL | PARTIAL | hard-coded LIVE | PARTIAL |
| Judge variable/IVR | judge/demo | `/demo` | Present | Connected | Sandbox/public | Scenario only | PASS sandbox errors | PARTIAL | DEMO/SANDBOX | PASS simulator |
| PWA shell/offline writes | beneficiary/field | all | Partial | Queue partial | Unverified | Unverified | Unverified | Unverified | overclaimed | UNVERIFIED |

## UX scorecard

| Surface | Clarity | Ease | Trust | Visual quality | Hierarchy | Accessibility | Responsive | Judge impact |
|---|---|---|---|---|---|---|---|---|
| Home | medium | medium | low-medium due LIVE/demo mismatch | medium | medium-low | partial | fail at 320px | medium |
| Interview | high for prompt | medium | low after save/passport break | medium | high | partial | partial | high when extraction works |
| Passport | low when unauthenticated | low | low | medium | medium | partial | partial | low |
| Pathways | medium | medium | medium-low due stale values | medium | medium | partial | partial | medium-high |
| Journey | high next-action concept | low for failed persistence | low | medium | high | fail on clickable cards | partial | medium |
| Help | medium | medium | medium for sandbox callback | medium | medium | partial | partial | low |
| Professional portals | low for wrong-role user | low | low due fallback | medium | medium | partial | partial | medium |
| Demo | medium | high for simulator controls | medium if state labels are read | medium | partial | partial | medium-high |

## Visual/design review

### Strengths

- Consistent navy/sky/amber/emerald palette and rounded card language.
- Clear primary interview CTA and large microphone control.
- Truth badges, bilingual labels, and read-aloud affordances are directionally right.
- The pathway “five concepts” component is a useful structural explanation.

### Weaknesses

- The homepage presents a lot of copy before demonstrating the product. It needs a single evidence-led visual narrative rather than more feature text.
- Beneficiary and professional surfaces share the same card density and navigation language, despite very different cognitive needs.
- Tables/tabs are visually ordinary and become hard to navigate on mobile.
- Icons are plentiful but not always informative; some controls rely on familiar icon meaning without a text/accessible name.
- Empty, loading, forbidden, and offline states are not designed as first-class product surfaces.

### Useful visual storytelling

1. A static-first “voice waveform → highlighted evidence spans → canonical skill nodes → NSQF/RPL gap → next action” strip on the judge desk.
2. A beneficiary pathway card that shows only the next action, distance, date, and one reason; technical codes expand on demand.
3. A district gap matrix with one highlighted shortage and a simulated batch response, clearly marked `DEMO_DATA` when synthetic.
4. A mobile-first evidence drawer rather than repeated large cards.

### 3D recommendation

Do not introduce 3D across the product. At most, test one optional desktop-only skill-network visualization on `/demo`, with an SVG/static fallback, no WebGL on low-end/mobile, and complete reduced-motion behavior. A district planning map can use a 2D map or matrix first; it is more useful than decorative 3D.

## Responsive, accessibility, performance and PWA evidence

### Responsive

The explicit 320×568 audit found document-level overflow on every sampled route. Other requested viewport sizes were not all executed because the browser automation session only exposed one temporary viewport override workflow during this pass. The report therefore does not claim 360/375/390/412/768/1024/1280/1366/1440/1920 coverage.

### Accessibility

The existing axe Playwright suite passed, but that is not a certification. Manual/DOM inspection found an unnamed authenticated user-menu button, pointer-only clickable cards/containers, missing tab semantics, and weak visible status for failed async actions. Keyboard-only and screen-reader manual traversal remain required.

### Performance/build

- The application loads locally, but clean production build fails on network font fetch.
- The page uses Google font fetching at build time and many client-rendered portal surfaces.
- Long text/card lists and duplicated demo records increase mobile scroll and cognitive load.
- No reliable LCP/CLS/INP measurement was taken in this environment; treat performance as unverified, not passed.

### PWA/offline

Manifest and service worker are present and existing service-worker tests pass. The service worker caches a small GET route list and uses network-first fallback. It does not intercept non-GET writes, and the generic fallback of every uncached HTML navigation to `/interview` is likely to misroute offline users. Actual offline/reconnect/duplicate-sync behavior remains unverified.

## Backend and database audit

### Backend route contract

The OpenAPI surface exposed 44 application/health/root operations across identity, beneficiaries, knowledge, intelligence, opportunities, journey, integrations, and admin. The current backend has meaningful role and ownership checks on protected mutations and beneficiary access. Public catalogue endpoints include training centers/options, jobs, demand index, deterministic intelligence, and sandbox integrations.

The most important frontend/backend mismatches are not missing endpoints; they are:

- pages not requiring the role that their API requires;
- static fallback data hiding API errors;
- anonymous create versus authenticated ownership mismatch;
- fallback action IDs not matching persisted journey actions;
- fake export/readiness success without a persisted artifact.

### Database inventory

The SQLite file contained exactly **39 application tables** plus `alembic_version`, matching the stated application-table count:

`admin_areas`, `applications`, `audit_events`, `background_jobs`, `beneficiaries`, `beneficiaries_skills`, `beneficiary_profiles`, `case_events`, `cases`, `consents`, `enterprise_plans`, `followups`, `grievances`, `ingestion_runs`, `local_economic_signals`, `memberships`, `occupation_qualifications`, `occupation_skills`, `occupations`, `opportunities`, `organizations`, `outcomes`, `pathway_actions`, `pathways`, `programs`, `qualification_competencies`, `qualifications`, `recommendation_runs`, `recommendations`, `referrals`, `skill_aliases`, `skill_evidence`, `skill_gaps`, `skills`, `sources`, `training_centers`, `training_options`, `users`, `work_experiences`.

Non-empty tables included users (27), beneficiaries (7), applications (36), grievances (64), pathways (70), pathway actions (280), and outcomes (33). Empty operational/audit tables included `audit_events`, `background_jobs`, `ingestion_runs`, `skill_evidence`, `recommendation_runs`, `recommendations`, `case_events`, `followups`, and `skill_gaps` in this runtime. These counts are evidence of the local fixture, not a production-volume claim.

SQLite inspection reported `PRAGMA foreign_keys = 0`; `database.py` enables WAL and busy timeout but does not enable SQLite foreign-key enforcement. Production PostgreSQL is a different runtime, but this is a real integrity gap for SQLite development/demo use.

## Competitor and reference insights (accessed 2026-10-01)

| Reference | Relevant pattern | What LIP can learn | What not to copy |
|---|---|---|---|
| [Skill India Digital Hub](https://www.skillindiadigital.gov.in/Home/handbook/1050) | Brings courses, jobs/apprenticeships, centres, recommendation, multilingual entry, and “not sure where to begin” into one service model | Use a short intent-first entry point and explain the next step; expose live opportunity freshness | Do not copy a broad catalogue homepage; LIP should stay focused on informal-skill evidence and district execution |
| [Skill India course catalogue](https://courses.skillindiadigital.gov.in/courses/) | Searchable course inventory with sector/provider listings | Treat catalogue discovery and verified live batch availability as separate states | Do not imply a catalogue course is a confirmed seat |
| [National Career Service](https://www.ncs.gov.in/job-seeker/pages/default.aspx) | Job-seeker registration, job search/application, counselling and training support; explicit no-fee trust messaging | Add clear “what happens next,” application status, and no-fee trust copy | Do not reproduce its form-heavy onboarding for low-literacy beneficiaries |
| [PM-DAKSH official scheme page](https://socialjustice.gov.in/schemes/100/archive) | Official target groups, age/income eligibility, free training, and training types are stated | Show eligibility and scheme provenance in a compact, human-readable explanation | Do not present scheme pre-screening as sanction or approval |
| [shadcn/ui component docs](https://ui.shadcn.com/docs/components) | Open-code primitives include dialog, tabs, table, skeleton, toast, slider, and empty states | Adopt only the primitives needed for consistent dialogs/tabs/status/empty states; keep ownership in-repo | Avoid library bloat and decorative registry blocks |
| [React Aria](https://react-aria.adobe.com/) | Accessible behavior, internationalization, adaptive interactions and unstyled components | Use for difficult dialog/tab/select/focus patterns if native HTML is insufficient | Do not replace simple native controls unnecessarily |
| [React Flow accessibility](https://reactflow.dev/learn/advanced-use/accessibility) | Keyboard instructions, localized accessible text, and live updates for graph interactions | If a skill graph is added, make graph state inspectable and keyboard/screen-reader reachable | Do not ship a graph that is visual-only |
| [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs) | Open-source interactive map option | Consider only for a real district planning map need, with static fallback | Do not add maps before the gap data contract and mobile interaction are ready |

## UI library recommendations

Keep the current Next.js/React/Tailwind architecture. Do not add a large component framework. Recommended narrow additions:

1. **In-repo shadcn/ui-style primitives** for Dialog, Tabs, Alert, Toast, Skeleton, EmptyState, and DataTable. Exact problem solved: current modal/tab/error patterns lack consistent focus and status behavior. Use only copied source primitives needed by the product.
2. **React Aria Components/hooks** only for complex focus management, localized comboboxes, dialogs, and tabs. Exact problem solved: manual ARIA/focus semantics currently fail in bespoke controls.
3. **No chart/map/3D library in Wave 0–5.** First establish truthful data contracts and responsive interaction. Add Recharts/Nivo/MapLibre/React Flow only after a specific chart/map/skill-graph acceptance criterion exists.

## Astra 6 improvement blueprint

### Global design system

- Define semantic tokens for background, ink, trust, warning, error, live, demo, sandbox, offline, and forbidden.
- Use a compact spacing/type scale with 44px minimum touch targets and 16px minimum body text for beneficiary surfaces.
- Establish one icon-button contract: visible label or accessible name, tooltip only as enhancement, focus ring always visible.
- Use one card pattern per mode: beneficiary “next action” card; professional “data block”; judge “evidence block.”
- Add status components for loading/empty/error/forbidden/offline/success with retry and data-loss messaging.

### Home page

- Replace the text-first hero with a single illustrated proof strip showing voice → skills → action → district signal.
- Make three CTAs distinct: `Start by speaking`, `See 3-minute demo`, `For district teams`.
- Add an explicit `Live / Demo / Sandbox` explanation near the trust block.
- Acceptance: a first-time judge can state target user, problem, differentiator, and demo boundary in 10 seconds.

### Beneficiary / interview / passport / pathways / journey / help

- Require or establish a real anonymous session before save; resolve beneficiary identity server-side after login.
- Keep Marathi/Hindi first, with short sentences and read-aloud; defer NSQF/NCO/RPL codes behind “Why this?” details.
- Make passport a truthful result of the saved profile, not a static seed fallback.
- Recompute all pathway explanations from one constraint state; show evidence spans and uncertainty.
- Make journey actions server-backed, idempotent, retryable, and visibly confirmed.
- Make help clearly distinguish callback simulation, real grievance intake, and offline queue state.
- Acceptance: fresh anonymous user completes intake → passport → pathway → journey → grievance, refreshes at each step, and sees the same state.

### Field / counsellor / finance

- Add required role gate and assigned-jurisdiction context.
- Replace default caseload fallback with explicit “cannot load caseload” state.
- Show override errors inline; show immutable audit ID after success.
- Finance readiness must generate a persisted report or clearly say “preview only.”

### Provider / employer

- Role gate before data render.
- Make batch/requisition forms use min/max/date validation, duplicate prevention, and inline errors.
- Separate catalogue discovery from provider-declared live seats.
- Employer candidate view must remain privacy-safe and show why a candidate matches without protected attributes.

### Admin / coordination

- First fold: shortage matrix and one actionable gap, not equal-weight KPI cards.
- Make source health, freshness timestamp, provenance, and stale-data warnings visible.
- Add batch/project preview versus persisted submission distinction.
- Add confirmation only for meaningful mutations; export real artifacts.

### Judge demo

- Keep a three-minute linear mode with one persona and one “change radius” action.
- Show the data path visually: transcript snippet → highlighted skill evidence → qualification/NOS → recommendation reason → action → district delta.
- Label every scenario object `DEMO_DATA` and every carrier/WhatsApp simulation `SANDBOX`.
- Add a visible “what is deterministic, what is live, what is simulated” panel.

## Motion strategy

- Use short, reduced-motion-safe transitions for extraction result reveal, pathway selection, completion confirmation, and table/filter changes.
- Use an animated voice waveform only when recording; do not imply live AI confidence beyond the returned data.
- Animate the district gap delta after a scenario change, with a text equivalent.
- Avoid scroll-driven spectacle until the static story is complete.

## Final product gap analysis

| Category | Main gap |
|---|---|
| Broken functionality | Anonymous continuation, journey persistence, exports/readiness |
| Backend | Demo switch boundary/config, migration provenance, partial offline contract |
| Database | SQLite FK enforcement off; empty audit/recommendation tables in local fixture; duplicate fixture rows |
| Authentication/authorization | No frontend route guards; production-labelled demo defaults |
| Validation | Empty transcript reaches server; professional numeric/date constraints need explicit min/max/duplicate handling |
| UX | Silent fallback, unclear next state, beneficiary/professional density conflated |
| Visual design | Text-heavy homepage, weak visual proof, generic cards/tables |
| Accessibility | Unnamed icon button, pointer-only containers, missing tab semantics/live status |
| Responsive | 320px document overflow; long tab/table strips |
| Performance | Clean build depends on Google Fonts; performance metrics not measured |
| PWA/offline | GET shell only is presented as 100% offline; write coverage unverified/partial |
| Judge/demo storytelling | Great simulator controls, but no compact evidence pipeline and truth-state contradictions |
| Competitor gaps | Less searchable/inspectable than Skill India/NCS; weaker next-step and provenance explanation |
| Missing evidence/tests | Docker, offline/reconnect, full viewport matrix, keyboard/screen-reader manual proof |
| Optional enhancements | One static-first skill graph; 2D district map only after data contract |

## Release confidence

| Question | Verdict | Reason |
|---|---|---|
| Technically functional? | PARTIAL | Core runtime and demos work; several material flows fail or fall back |
| Frontend↔backend↔database reliable? | NO | Passport identity mismatch and journey action mismatch; silent fallback hides failures |
| Safe against obvious misuse? | NO | Unauthenticated portal exposure and demo privilege/config risk |
| Beneficiary UX ready? | NO | Anonymous flow breaks after save; mobile overflow and language selector gaps |
| Professional portals ready? | NO | Route guards absent; API failure states are not trustworthy |
| Judge demo ready? | PARTIAL | Counterfactual/IVR are effective; truth-state and evidence-story issues remain |
| Visual design competitive? | PARTIAL | Clean and coherent but generic/text-heavy with limited proof visuals |
| Production deployment ready? | NO | Docker unverified here, build fails without font network, demo defaults unsafe |

## Screenshot evidence

- [Homepage at 320×568](evidence/home-320x568.png) — compressed header and long-scroll beneficiary landing experience.
- [Homepage at 1440×900](evidence/home-1440x900.png) — text-heavy hero and stakeholder-card structure.
- [Unauthenticated passport](evidence/passport-unauthenticated.png) — route renders a beneficiary shell and “Passport Unavailable” instead of enforcing route access/continuation.
- [Judge demo desk](evidence/judge-demo.png) — persona/demo presentation and truth-state context.

## Required Astra 6 handoff

See [ASTRA6_IMPROVEMENT_BACKLOG.md](ASTRA6_IMPROVEMENT_BACKLOG.md). The backlog is ordered by release risk and explicitly keeps visual redesign behind security, workflow, validation, and truth-state repair.

## Final requested output

```text
AUDIT STATUS: PARTIAL
BASELINE SHA: f5d408baa0d3460728a77c168bdbba63e8873fd7
ROUTES DISCOVERED: 14
INTERACTIVE ELEMENTS TESTED: 70 links, 39 buttons, 22 inputs/selects/textareas, 3 forms, 3 tables inventoried; meaningful controls traversed across all 14 routes
ROLES TESTED: unauthenticated, beneficiary, field worker, counsellor, financial counsellor, provider, employer, district admin, ministry demo, SIH demo
WORKFLOWS TESTED: login/logout surface, Marathi extraction/save, passport continuation, pathways/counterfactual, journey update, callback, grievance, field override, finance action, provider batch, employer requisition, admin tabs, coordination, judge variable test, sandbox IVR, PWA assets
P0 COUNT: 2
P1 COUNT: 8
P2 COUNT: 7
P3 COUNT: 3
P4 COUNT: 0
BROKEN FEATURES: anonymous passport continuation, journey persistence, honest error states, export/readiness artifact, production build without network fonts
FRONTEND ISSUES: missing route guards, static fallback fixtures, stale counterfactual text, mobile overflow, language selector, accessibility semantics
BACKEND ISSUES: demo role minting/config boundary, migration provenance, partial offline write contract
DATABASE ISSUES: SQLite foreign keys disabled in inspection; duplicate fixture records; audit/recommendation tables empty in local fixture
AUTHORIZATION ISSUES: professional pages render without auth; demo switch unauthenticated and arbitrary-role capable in DEMO_MODE
VALIDATION ISSUES: empty transcript reaches API; form min/max/date/duplicate coverage incomplete
BENEFICIARY UX FINDINGS: strong prompt/extraction, broken continuation, too much bilingual technical copy, mobile/header pressure
JUDGE UX FINDINGS: strong sandbox IVR and variable test, weak compact proof pipeline and truth-state consistency
VISUAL DESIGN FINDINGS: coherent palette, generic/text-heavy storytelling, missing evidence visuals, dense professional cards
MOBILE FINDINGS: document overflow at 320×568 on all sampled routes
ACCESSIBILITY FINDINGS: unnamed user menu, pointer-only containers, missing tab semantics, silent async states
PERFORMANCE FINDINGS: production build fails on Google font fetch; runtime metrics unmeasured
COMPETITOR FINDINGS: Skill India/NCS provide stronger catalogue/search/next-step patterns; LIP is stronger in spoken evidence-to-district concept
RECOMMENDED LIBRARIES/COMPONENTS: in-repo shadcn-style status/dialog/tab primitives; React Aria selectively for focus/ARIA; defer maps/graphs/3D
SCREENSHOT EVIDENCE: docs/audit/evidence/*.png
TOP 20 PRIORITY CHANGES: F-001 through F-020, ordered in ASTRA6_IMPROVEMENT_BACKLOG.md
ASTRA 6 HANDOFF FILE: docs/audit/ASTRA6_IMPROVEMENT_BACKLOG.md
GIT STATE: main clean at audit start; audit docs/evidence are the only new audit artifacts; no product-code changes or commits
```

## Superseding current output — 2026-10-02

```text
AUDIT STATUS: PARTIAL
BASELINE SHA: f5d408baa0d3460728a77c168bdbba63e8873fd7
CURRENT TREE: main with local, uncommitted implementation changes; HEAD remains the baseline SHA
ROUTES DISCOVERED: 14
INTERACTIVE ELEMENTS TESTED: original inventory retained; current browser suite 50 passed plus 11 responsive/professional design checks
ROLES TESTED: unauthenticated, beneficiary, field worker, counsellor, financial counsellor, provider, employer, district admin, explicit demo roles, judge demo
WORKFLOWS TESTED: login/RBAC, anonymous save refusal, confirmed transcript persistence, passport, recommendations/counterfactual, journey failure/success/offline sync, finance/admin draft exports, field failure, service-worker cache, grievance/callback surfaces, judge IVR/variables, responsive widths
P0 COUNT: 0 observed in explicit local demo runtime; production deployment unverified
P1 COUNT: 6 open/partial contracts
P2 COUNT: localization, deeper professional UX, manual accessibility, fixture/data-quality and judge-proof improvements
P3 COUNT: lint-warning/performance/polish work
BROKEN FEATURES: no current P0 reproduction; Help can invent a grievance ID on malformed API response; offline and production deployment contracts are incomplete
FRONTEND ISSUES: remaining Help truth/fallback copy, judge local-fallback visibility, partial validation and non-uniform error handling
BACKEND ISSUES: migration/readiness reporting, uniform API error contract, broad validation/idempotency, production deployment proof
DATABASE ISSUES: SQLite foreign-key pragma remains disabled; startup/model helper still uses create_all; no persisted export/report artifact
AUTHORIZATION ISSUES: observed route/API boundaries pass; production deployment with real secret remains unverified
VALIDATION ISSUES: professional form range/date/duplicate/idempotency coverage remains incomplete
BENEFICIARY UX FINDINGS: first wave substantially improved mobile hierarchy and evidence language; localization and trustworthy Help continuation remain
JUDGE UX FINDINGS: explicit demo/sandbox boundary exists; compact inspectable proof chain and visible simulator errors remain
VISUAL DESIGN FINDINGS: civic-fieldbook redesign is coherent and responsive; deeper portal-specific visual proof is still needed
MOBILE FINDINGS: tested 320/390/768/1440 selected surfaces and six professional routes; full requested matrix and 200% zoom remain unverified
ACCESSIBILITY FINDINGS: automated selected WCAG A/AA scans pass; manual keyboard/screen-reader/focus-return audit is incomplete
PERFORMANCE FINDINGS: build succeeds after font removal; LCP/CLS/INP and bundle budgets are unmeasured; lint has 181 warnings
COMPETITOR FINDINGS: current official references confirm Skill India Digital’s multilingual catalogue/recommendation pattern, NCS’s jobseeker/employer/counsellor model and no-fee trust messaging, and PM-DAKSH’s scheme-provenance need; LIP remains differentiated by spoken informal-experience evidence
RECOMMENDED LIBRARIES/COMPONENTS: preserve Next/FastAPI/PostgreSQL/Docker; add only in-repo status/dialog/tab primitives or React Aria selectively; defer maps/graphs/3D
SCREENSHOT EVIDENCE: docs/audit/evidence/redesign-*.png and security-journey-persisted.png
TOP 20 PRIORITY CHANGES: first six are remaining P1 contracts above; then Help/grievance identity, judge proof, localization, professional task UX, offline matrix, SQLite/migration contract, manual accessibility, performance instrumentation, and data-quality cleanup
ASTRA 6 HANDOFF FILE: docs/audit/ASTRA6_IMPROVEMENT_BACKLOG.md
GIT STATE: main at baseline SHA with local uncommitted product changes and audit artifacts; no commit, push, PR, or deployment
```
