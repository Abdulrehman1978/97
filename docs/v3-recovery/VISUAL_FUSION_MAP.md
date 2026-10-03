# SIH26097 — Cross-Stitch Visual Fusion Implementation Map
## Visual Recovery, Localization Repair, Truth-State Integrity & Release Closure

### Architecture & Design System
- **Core Aesthetic**: Sovereign Civic Livelihood (Teal `#004D40`, Navy `#001428`, Gold `#D97706`, high contrast, civic dignity).
- **Fusion Principle**:
  - Beneficiary mobile structure = Stitch 3 (bottom navigation, voice-first intake, compact cards, large touch targets, low-literacy ergonomics).
  - Beneficiary visual richness = Stitch 2 + Stitch 3 local livelihood photography.
  - Desktop beneficiary layout = Stitch 3 logic + Stitch 2 visual editorial split composition.
  - Professional workspaces = same design system, rich desktop information density, structured status inspectors, zero fake fallbacks.
  - Judge Desk (`/demo`) = Stitch 2 3-minute linear proof chain, truthful evidence, counterfactual comparison.
  - Truth / Data = Real FastAPI + PostgreSQL, never hard-coded or fabricated.

---

### Route-by-Route Matrix

| Route | Stitch 3 Reference | Stitch 2 Reference | Images Used | Visual Interactions | Text to Remove / Move to Disclosure | Truth State & APIs | Primary Mobile Goal | Primary Desktop Goal |
|---|---|---|---|---|---|---|---|---|
| `/` (Home) | `home_mobile_beneficiary_storytelling` | `luna_lip_home_refined_civic_storytelling_edition` | `/images/livelihoods/hero_mechanic.webp`, `/images/livelihoods/hero_storytelling.webp` | Dominant Speak CTA pulse, 4-node visual pipeline (Speak → Skills → Path → Action), sample worker cards | Remove long paragraphs; remove decorative grid dots; keep headline + 1 supporting sentence | LIVE / DEMO_DATA from `/health/ready` | 1-viewport decision: Speak or Type immediately with clear livelihood visual | Editorial split: Livelihood hero visual + 4-step pipeline + 2 sample profiles |
| `/login` | Sovereign Civic mobile form | Refined auth container | `/images/livelihoods/workshop_context.webp` | High contrast input focus, role pill selector, instant guest explore | Remove sprawling whitespace; eliminate floating empty card appearance | Auth state via `/api/v1/identity/login` | Instant, balanced mobile form above fold | Centered split card with civic livelihood photo strip and trust badge |
| `/interview` | `talk_state_a/b/c` progressive disclosure | `talk_voice_intake_progressive_evidence_intake` | `/images/livelihoods/candidate_intake.webp` | Mic wave animation, spoken phrase evidence highlight spans (`[engine]`, `[brakes]`), animated skill chips, constraint chips | Remove simultaneous bilingual instructional text walls; move technical qualification details behind "Why this?" | LIVE / MOCK_SPEECH / TYPING via `/api/v1/intelligence/extract-skills` | Focused mic hub → transcript review → skill confirmation with zero clutter | Two-column workbench: spoken evidence stream on left, discovered skills inspector on right |
| `/passport` | `my_skills_mobile_skills_passport` | Refined passport identity card | `/images/occupations/mechanic.webp` | Verified skill cluster, RPL readiness badge, work history timeline, mutually exclusive state machine | Remove NCO/NOS codes from primary view (move to expandable details); eliminate contradictory empty vs live header | Authoritative via `/api/v1/beneficiaries/me` & `/passport` | Answer: "What can I already do?" + "What does it unlock?" | Full credential layout with digital badge, share/print button, verified proof trail |
| `/pathways` | `my_paths_mobile_practical_comparison` | `my_paths_practical_livelihood_options_comparison` | `/images/occupations/mechanic.webp`, `/images/occupations/tailor.webp`, `/images/occupations/solar.webp` | Distance filter buttons (5km / 15km / 25km), occupation photo cards, fit badges, details accordion | Remove shared automotive text from tailoring cards; eliminate text essays; show title + why it fits + 2-3 visual facts | Authoritative via `/api/v1/intelligence/recommend` | Clear visual comparison between 2-3 practical local occupations | Side-by-side comparative cards with map/distance context and requirement tags |
| `/journey` | `my_journey_mobile_action_offline_sync` | Action timeline | `/images/livelihoods/workshop_context.webp` | Dominant "Your Next Action" hero card, compact checklist, offline sync queue indicator | Remove long policy paragraphs; move documentation prerequisites behind checklist item details | LIVE / OFFLINE_QUEUED via `/api/v1/journey/pathway/{id}` | Immediate next step is dominant; 1-tap checklist toggle | Step-by-step milestone progression with contact details & center location |
| `/help` | Sovereign Civic support center | Public grievance portal | `/images/livelihoods/counsellor_desk.webp` | 3 distinct visual support choices: Call/Callback (SANDBOX), File Grievance (LIVE), Common Questions | Remove single flattened VERIFIED LIVE badge; require authenticated ID or explicit demo sandbox | Capability-granular: Callback (SANDBOX), Grievance (LIVE) | 3 simple touch cards with direct action | Comprehensive support hub with grievance tracker and FAQ accordions |
| `/field` | Professional triage desk | Split caseworker inspector | `/images/livelihoods/counsellor_desk.webp` | Priority caseload queue, search/ward filter, case inspector, override modal with mandatory justification | Remove `c.name.toLowerCase()` crash; remove silent `defaultCases` fallback; show real server records | LIVE / DEMO_DATA via `/api/v1/journey/cases` | Quick priority triage list with 1-tap call & navigation | 5:7 split workspace: live caseload stream + detailed audit inspector |
| `/counsellor/finance` | Financial counselling workspace | Enterprise capital composition | `/images/occupations/tailor.webp` | Capital composition bars (PM-AJAY grant + MUDRA loan + self-contribution), downloadable decision-support artifact | Remove `XSS Test Beneficiary` contamination; replace browser `alert()` with real CSV/JSON export | DEMO_DATA / LIVE via `/api/v1/journey/enterprise/{id}` | Enterprise financial readiness score + subsidy breakdown | Full financial advisory desk with scheme comparison and exportable plan |
| `/provider` | VTC capacity desk | Training batch timeline | `/images/livelihoods/workshop_context.webp` | Capacity utilization progress bars, batch schedule modal with validation, real state reload | Remove fake `seedBatches` fallback and fake LIVE badges on failed API; show inline error + retry | LIVE / DEMO_DATA via `/api/v1/opportunities/training-options` | Batch status and available seats at a glance | Center utilization analytics and batch scheduling control |
| `/employer` | Opportunity & hiring workspace | Candidate matching radar | `/images/occupations/mechanic.webp` | Candidate skill-match bars, vacancy management, privacy-safe anonymized candidate cards | Strictly exclude caste, religion, income, BPL from UI & API responses | LIVE via `/api/v1/opportunities/matches` | Candidate match shortlist with contact linkage | Split requisition manager + applicant qualification inspector |
| `/admin` | District administration portal | Shortage & allocation dashboard | `/images/livelihoods/workshop_context.webp` | Demand vs supply gap matrix, shortage bars, GIA proposal status pipeline | Remove fake "High Feasibility (Approved...)" simulation fallback; show real calculations or clear draft status | LIVE / DEMO_DATA via `/api/v1/admin/dashboard` | District shortage highlights and intervention alerts | Multi-metric district planning workbench with gap analytics |
| `/coordination` | Inter-agency referral portal | Multi-department handoff | `/images/livelihoods/counsellor_desk.webp` | Referral SLA countdown chips, department handoff badges, optimistic write rollback on failure | Never update UI to "Complete" on failed server write; show inline error and retry | LIVE via `/api/v1/journey/coordination` | Pending referrals sorted by urgent SLA days remaining | Multi-agency handoff pipeline (DSC Nagpur ↔ PIA ↔ Bank/MPBCDC) |
| `/demo` (Judge Desk) | Evaluator proof desk | Stitch 2 Judge Desk 3-minute linear proof chain | `/images/demo/judge_evaluator.webp` | Linear 9-step story: Person → Voice → Evidence → Skills → Qualification → Constraint → Recommendation → Persistence → District | Remove false claims ("Approved for GIA Proposal", "100% Traceable"); label demo scenarios truthfully | Authoritative backend demonstration with explicit truth badges | Compact 3-minute executive summary for mobile evaluators | Full interactive proof workbench with counterfactual toggle and audit trace |

---

### Key Systemic Fixes Implemented
1. **Accessibility**: Removed `maximumScale: 1` and `userScalable: false` from `layout.tsx` to enable >= 200% zoom and responsive 320px ergonomics.
2. **Global Error Boundary**: Added `app/error.tsx` in Sovereign Civic styling with Retry, Back, and Home actions (no stack traces).
3. **Deterministic Localization (`mr`, `hi`, `en`)**:
   - Dictionaries: `apps/web/src/i18n/mr.ts`, `hi.ts`, `en.ts`.
   - Direct 3-choice toggle (`मराठी`, `हिंदी`, `EN`) with `aria-pressed`, keyboard navigation, localStorage persistence, and `document.documentElement.lang` sync.
4. **Contract Boundary Repair**:
   - `/field`: Mapped `beneficiary_name` to `FieldCaseViewModel.beneficiaryName`.
   - Backend `/journey/cases`: Returns `beneficiary_name`, `blocker`, `next_action`, `priority`, `status`, `verified`.
5. **Zero Fake Fallbacks**:
   - Eradicated silent fake data replacement in Field, Provider, Finance, Admin, and Coordination. Real API failure = Loading → Error → Retry.
6. **Test Isolation**:
   - Eliminated `XSS Test Beneficiary` leaks by isolating test IDs, adding teardown cleanup, and enforcing post-seed assertions.
