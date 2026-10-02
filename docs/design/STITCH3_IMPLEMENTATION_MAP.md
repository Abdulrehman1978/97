# STITCH 3 IMPLEMENTATION MAPPING SPECIFICATION
## SIH26097 — Sovereign Civic Livelihood Platform Convergence

This document defines the formal mapping between the Stitch 3 design specification (`stitch_lip_livelihood_pathways_platform (3).zip`) and the production Next.js 16 / FastAPI implementation in repository `C:\97`.

---

### 1. DIRECT STITCH 3 SCREEN MAPPING

| Stitch Component Directory | Target Route | Core Purpose | Current Backend API | DB Persistence & Entities | UI Component(s) | States Handled | Responsive Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `home_mobile_beneficiary_storytelling` | `/` | Beneficiary-first narrative, voice entry trigger, 4-step progressive explanation, illustrative livelihood cards, assistance CTA | `/api/v1/identity/me`, `/api/v1/beneficiaries/me` | None on homepage (read-only / intake launchpad) | `app/page.tsx`, `HeroVignette`, `VoiceIntakeHub`, `StoryboardStepper`, `SampleProfiles` | `DEMO_DATA`, `LIVE`, `GUEST`, `AUTHENTICATED` | 320px–420px mobile-first single column fluid; 768px+ 2-col tablet; 1024px+ centered civic canvas max-w-5xl |
| `talk_state_a_initial_voice_intake` | `/interview` (State A) | High-contrast voice intake with large 84px microphone, audio prompt, typed drawer fallback, quick sample helper pills | None until recording/typing submitted | Local component state / draft session storage | `app/interview/page.tsx`, `StateAVoiceIntake`, `AcousticWaveform`, `SamplePills` | `READY`, `RECORDING`, `PROCESSING`, `TYPED_INPUT`, `FALLBACK` | Full-width mobile container with 44px+ hit targets; adapts seamlessly on desktop |
| `talk_state_b_editable_transcript_review` | `/interview` (State B) | Verbatim spoken word review, in-place edit textarea, audio replay controller with waveform, detected skill category chips | `/api/v1/intelligence/extract-voice` | Ephemeral speech analysis payload | `app/interview/page.tsx`, `StateBTranscriptReview`, `AudioReplayController`, `ExtractedChips` | `EDITING`, `CONFIRMED_LOCAL`, `ANALYZING`, `ERROR` | Resilient textarea layout with character counter and bilingual action bar |
| `talk_state_c_skills_constraint_confirmation` | `/interview` (State C) | User confirmation of extracted competencies with evidence quotes, bridge skill gap display, travel distance and work mode selectors | `/api/v1/beneficiaries/` (POST), `/api/v1/beneficiaries/me` | `Beneficiary`, `BeneficiaryProfile`, `BeneficiarySkill`, `SkillEvidence`, `WorkExperience` | `app/interview/page.tsx`, `StateCSkillsConfirmation`, `SkillCard`, `ConstraintSelector` | `SAVING`, `SUCCESS`, `OFFLINE_QUEUED`, `ERROR`, `UNAUTHENTICATED_PROMPT` | Interactive touch pills (5km/15km/25km, wage/self/both), accordion expansions |
| `my_skills_mobile_skills_passport` | `/passport` | Livelihood Skills Passport with verified competencies, verbatim evidence quotes, work history, and RPL readiness tier | `/api/v1/beneficiaries/me/passport` or `/api/v1/beneficiaries/{id}/passport` | Reads `BeneficiarySkill`, `SkillEvidence`, `WorkExperience`, `BeneficiaryProfile` | `app/passport/page.tsx`, `PassportHeader`, `SkillsList`, `ExperienceTab`, `RplCard` | `LOADING`, `SAVED_DATA`, `EMPTY`, `DEMO_DATA`, `ERROR` | 3-tab segment control (`प्रमाणित कौशल्ये`, `अनुभव`, `RPL पात्रता`), audio playback pills |
| `my_paths_mobile_practical_comparison` | `/pathways` | Side-by-side comparative livelihood pathways (Wage vs Micro-Enterprise), dynamic radius counterfactuals, pathway enrollment | `/api/v1/intelligence/recommend`, `/api/v1/journey/pathways/select` | Writes `SelectedPathway`, `PathwayAction` records in PostgreSQL | `app/pathways/page.tsx`, `ConstraintSimulator`, `PathwayCard`, `DirectComparison` | `CALCULATING`, `RECOMMENDATIONS_READY`, `ENROLLING`, `ENROLLED_SUCCESS`, `ERROR` | Dual-card stack on mobile with expandable "Why this fits" drawer; side-by-side grid on desktop |
| `my_journey_mobile_action_offline_sync` | `/journey` | Actionable pathway execution tracker, single dominant next action, checklist with server confirmation, device ledger sync status | `/api/v1/journey/active`, `/api/v1/journey/actions/{id}/status`, `/api/v1/journey/actions/{id}/complete` | Reads/Updates `PathwayAction` (status, verification, evidence) | `app/journey/page.tsx`, `PriorityActionCard`, `ActionChecklist`, `SyncLedgerCard`, `StepperTimeline` | `ACTIVE`, `MUTATING`, `OFFLINE_QUEUED`, `SYNCED`, `ERROR` | Vertical progress spine, prominent completion button, field-worker hotlink |

---

### 2. EXTRAPOLATED SOVEREIGN CIVIC LIVELIHOOD ROUTES

For routes not directly rendered in the mobile beneficiary Stitch mockups, the same design system is strictly extrapolated:

| Route | Workspace / User Persona | Information Architecture & Key Interactions | Design Language Translation from `DESIGN.md` | Authoritative APIs & Security |
| :--- | :--- | :--- | :--- | :--- |
| `/login` | Public Beneficiary / Field / Admin Sign-in | Clean institutional card, phone/email, password with show/hide, inline field validation, demo role switch (demo mode only) | Slate navy canvas `#001428`, warm saffron `#904d00` accents, rounded-xl container, high contrast inputs | `/api/v1/identity/login`, `/api/v1/identity/demo/switch-role` |
| `/help` | Citizen Assistance & Grievance | Simple 3-option hub: Talk to counsellor, request callback, file formal grievance with real server-generated grievance ID | Soft cream cards, audio assist buttons, prominent helpline cards, distinct live/sandbox indicators | `/api/v1/integrations/grievances`, `/api/v1/integrations/telephony/callback` |
| `/field` | Field Worker / Coordinator | Priority triage list ("Who needs action now?"), beneficiary search, blockers filter, case intervention drawer, recommendation override with audit log | High-density desktop split-pane, Tier 1 elevation cards, status chips (`LIVE`, `BLOCKED`, `PENDING_REVIEW`) | `/api/v1/beneficiaries/`, `/api/v1/intelligence/override-recommendation` (RBAC: field_worker, counsellor, admin) |
| `/counsellor/finance` | Financial Counsellor / Enterprise Advisor | Capital requirement calculator, PM-AJAY / Mudra scheme integration, readiness checklist, non-binding decision-support export | Structured financial summary cards, amber advisory banners, clear "Not a Loan Sanction" disclaimers | `/api/v1/beneficiaries/{id}/passport`, `/api/v1/intelligence/recommend` (RBAC: financial_counsellor, counsellor, admin) |
| `/provider` | Training Center Admin (VTC/ITI) | Batch capacity management, enrollment quotas, course start dates, admission validation, seat publish workflow | Tabular batch console, verification badges, strict numeric capacity validation, error banners | `/api/v1/opportunities/batches` (GET/POST/PUT) (RBAC: provider, admin) |
| `/employer` | Verified Employer / Hiring Partner | Job requisition creator, privacy-safe candidate matchmaking (zero caste/religion exposure), application status management | Candidate fit cards, verified competency match scores, privacy border banners | `/api/v1/opportunities/jobs`, candidate match endpoints (RBAC: employer, admin) |
| `/admin` | District / State / Ministry Administrator | District demand-supply heatmaps, skill shortages, training capacity utilization, counterfactual project builder, draft proposal export | Administrative telemetry grid, multi-metric charts, strict "Draft Simulation" vs "Government Approved" markings | `/api/v1/admin/district-dashboard`, `/api/v1/admin/provenance-health` (RBAC: district_admin, state_admin, ministry_admin) |
| `/coordination` | Inter-Agency Task Force | Case handoff tracking: Sender -> Recipient -> Action -> SLA -> Status -> Escalation | Kanban / timeline flow, institutional badge hierarchy, status transition actions | `/api/v1/integrations/handoffs` (RBAC: coordination roles, admin) |
| `/demo` | SIH Judge Desk | 3-minute executive narrative: Voice -> Evidence -> Skills -> RPL -> Constraints -> Recommendations -> Action -> District Impact | Premium presentation console, live IVR telephone simulator, technical audit disclosures (AI vs deterministic rules) | Full platform endpoints + `/api/v1/identity/demo/switch-role` |

---

### 3. DESIGN TOKENS & SYSTEM PRIMITIVES

All components shall reference standardized CSS custom properties / Tailwind classes derived from `sovereign_civic_livelihood/DESIGN.md`:
- **Primary Navy:** `#001428` (`bg-primary`), `#0F2942` (`bg-primary-container`), `#ffffff` (`text-on-primary`)
- **Warm Saffron / Terracotta:** `#904d00` (`text-secondary`), `#fe932c` (`bg-secondary-container`), `#ffdcc3` (`bg-secondary-fixed`), `#2f1500` (`text-on-secondary-fixed`)
- **Emerald Verification Green:** `#059669` / `#21a173` (`text-on-tertiary-container`), `#002e1d` (`bg-tertiary-container`), `#85f8c4` (`bg-tertiary-fixed`)
- **Background & Surfaces:** `#f9f9ff` (`bg-surface`), `#ffffff` (`bg-surface-container-lowest`), `#f0f3ff` (`bg-surface-container-low`), `#e8eeff` (`bg-surface-container`), `#dfe8ff` (`bg-surface-container-high`)
- **Geometry:** `rounded-lg` (8px standard), `rounded-xl` (12px), `rounded-full` (chips/pills)
- **Minimum Tap Target:** 44px × 44px (recommended 48px for outdoor field operability)
- **Icons:** Bundled `lucide-react` mapping directly to Material Symbol semantics with zero external CDN dependencies.
