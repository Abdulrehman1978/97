# API Route Contract & Frontend-Backend Integration Matrix

**Platform:** Livelihood Intelligence Platform (LIP) — SIH26097  
**Specification Baseline:** Packet 28.1 Canonical Contract  
**Authority:** Synchronized between `apps/web/src/lib/api/` and `backend/app/`

---

## 1. Complete API Route & Method Contract

| Frontend Function | HTTP Method | Actual Backend Endpoint | Auth Required | Allowed Roles | Request Type | Response Type | Used by Page | Test Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `login` | POST | `/api/v1/identity/login` | No | Anonymous, All | `LoginRequest` | `TokenResponse` | `/`, Global Modal | `test_login_success`, `test_login_invalid_password_returns_401` |
| `getMe` | GET | `/api/v1/identity/me` | Yes | All Authenticated | None | `UserResponse` | Global Navbar | `test_identity_me_authorized_with_token` |
| `demoSwitchRole` | POST | `/api/v1/identity/demo/switch-role` | Only in `DEMO_MODE=true` | Demo Users | `SwitchRoleRequest` | `DemoTokenResponse` | `/demo`, Dev Bar | `test_demo_switch_role_utility_for_judges`, `test_production_demo_role_endpoint_guarded` |
| `listBeneficiaries` | GET | `/api/v1/beneficiaries/` | Yes | Staff (`field_worker`, `counsellor`, `admin`) | None | `List[BeneficiarySummary]` | `/field`, `/admin` | `test_beneficiary_cannot_list_all_beneficiaries`, `test_admin_can_list_beneficiaries` |
| `createBeneficiary` | POST | `/api/v1/beneficiaries/` | No / Assisted | Public Onboarding / Staff | `CreateBeneficiaryRequest` | `BeneficiaryCreateResponse` | `/interview` | `test_create_beneficiary` |
| `getBeneficiary` | GET | `/api/v1/beneficiaries/{id}` | Yes | Owner Self, Assigned Staff | None | `BeneficiaryDetailResponse` | `/passport`, `/field` | `test_beneficiary_cross_account_access_denied` |
| `getPassport` | GET | `/api/v1/beneficiaries/{id}/passport` | Yes | Owner Self, Assigned Staff | None | `PassportResponse` | `/passport` | `test_beneficiary_cannot_access_other_beneficiary_passport` |
| `updateProfile` | PUT | `/api/v1/beneficiaries/{id}/profile` | Yes | Owner Self, Assigned Staff | `UpdateProfileRequest` | `ProfileUpdateResponse` | `/passport`, `/interview` | `test_beneficiary_cross_account_access_denied` |
| `extractLivelihoodSkills` | POST | `/api/v1/intelligence/extract-skills` | No | Public / Authenticated | `ExtractSkillsRequest` | `ExtractionResponse` | `/interview`, `/demo` | `test_extraction_marathi_mechanic_detects_tools` |
| `evaluateRPL` | POST | `/api/v1/intelligence/rpl-evaluate` | No / Optional | Public / Authenticated | `RPLEvaluationRequest` | `RPLResponse` | `/passport`, `/demo` | `test_rpl_readiness_evaluation` |
| `recommendPathways` | POST | `/api/v1/intelligence/recommend-pathways` | No / Optional | Public / Authenticated | `RecommendPathwaysRequest` | `PathwayRecommendationResponse` | `/pathways`, `/demo` | `test_recommendation_ranks_mechanic_for_mechanic_skills`, `test_counterfactual_travel_change` |
| `askPolicyAssistant` | POST | `/api/v1/intelligence/policy-assistant` | No | Public / Authenticated | `PolicyQuestionRequest` | `PolicyAnswerResponse` | `/help`, Global Assistant | `test_policy_rag_grounded_answer_with_citations`, `test_policy_rag_abstains_on_unknown_query` |
| `listTrainingOptions` | GET | `/api/v1/opportunities/training-options` | No | Public / Authenticated | None | `List[TrainingOptionResponse]` | `/pathways`, `/provider` | `test_list_training_options_and_centers` |
| `createTrainingOption` | POST | `/api/v1/opportunities/training-options` | Yes | `provider`, `district_admin`, `ministry_admin` | `CreateTrainingOptionRequest` | `TrainingOptionResponse` | `/provider` | Role enforcement verified |
| `listOpportunities` | GET | `/api/v1/opportunities/` | No | Public / Authenticated | None | `List[JobOpportunityResponse]` | `/pathways`, `/employer` | Model verified |
| `createOpportunity` | POST | `/api/v1/opportunities/` | Yes | `employer`, `district_admin`, `ministry_admin` | `CreateJobOpportunityRequest` | `JobOpportunityResponse` | `/employer` | Role enforcement verified |
| `listMatchingCandidates` | GET | `/api/v1/opportunities/candidates` | Yes | `employer`, `district_admin`, `ministry_admin` | Query params | `List[CandidateSummary]` (Pseudonymous) | `/employer` | `test_candidate_matching_with_strict_caste_isolation`, `test_employer_candidate_list_never_leaks_caste` |
| `submitApplication` | POST | `/api/v1/opportunities/apply` | Yes | `beneficiary` (self), `field_worker`, `admin` | `ApplyRequest` | `ApplicationCreateResponse` | `/pathways` | `test_create_and_update_application` |
| `listApplications` | GET | `/api/v1/opportunities/applications` | Yes | Owning Employer/Provider, Admin | Query params | `List[ApplicationResponse]` | `/employer`, `/provider` | Role enforcement verified |
| `updateApplicationStatus` | PUT | `/api/v1/opportunities/applications/{id}/status` | Yes | Owning Org Staff, Admin | `UpdateStatusRequest` | `ApplicationUpdateResponse` | `/employer`, `/provider` | `test_create_and_update_application` |
| `getJourneyHome` | GET | `/api/v1/journey/{beneficiary_id}` | Yes | Owner Self, Assigned Staff | None | `JourneyHomeResponse` | `/journey` | `test_get_journey_home` |
| `selectPathway` | POST | `/api/v1/journey/select-pathway` | Yes | Owner Self, Assigned Staff | `SelectPathwayRequest` | `SelectPathwayResponse` | `/pathways` | `test_select_pathway` |
| `updateActionStatus` | PUT | `/api/v1/journey/actions/{id}` | Yes | Owner Self, Assigned Staff | `UpdateActionRequest` | `ActionUpdateResponse` | `/journey` | `test_update_action_status` |
| `fileGrievance` | POST | `/api/v1/journey/grievance` | Yes | `beneficiary` (self), `field_worker`, `admin` | `SubmitGrievanceRequest` | `GrievanceResponse` | `/help` | `test_submit_grievance_returns_persisted_id`, `test_xss_and_sql_injection_resilience_in_grievance` |
| `listCases` | GET | `/api/v1/journey/cases` | Yes | `field_worker`, `counsellor`, `admin` | District filter | `List[CaseSummary]` | `/field` | `test_get_cases_list` |
| `counsellorOverride` | POST | `/api/v1/journey/cases/{id}/override` | Yes | `counsellor`, `financial_counsellor`, `admin` | `CounsellorOverrideRequest` | `OverrideResponse` | `/field`, `/counsellor` | Verified with audit trail |
| `listCoordinationItems` | GET | `/api/v1/journey/coordination` | Yes | Staff (`field_worker`, `counsellor`, `provider`, `admin`) | None | `List[CoordinationItem]` | `/coordination` | `test_get_and_update_coordination` |
| `updateCoordinationStatus` | PUT | `/api/v1/journey/coordination/{id}/status` | Yes | Staff (`field_worker`, `counsellor`, `provider`, `admin`) | `UpdateCoordinationStatusRequest` | `CoordinationUpdateResponse` | `/coordination` | `test_get_and_update_coordination` |
| `getEnterprisePlan` | GET | `/api/v1/journey/enterprise/{beneficiary_id}` | Yes | Owner Self, `financial_counsellor`, `admin` | None | `EnterprisePlanResponse` | `/counsellor/finance` | `test_get_enterprise_plan` |
| `recordOutcome` | POST | `/api/v1/journey/outcomes` | Yes | Staff, Employer, Provider, Admin | `RecordOutcomeRequest` | `OutcomeResponse` | `/field`, `/employer` | `test_record_outcome` |
| `getAdminDashboard` | GET | `/api/v1/admin/dashboard` | Yes | `district_admin`, `state_admin`, `ministry_admin` | District filter | `AdminDashboardResponse` | `/admin` | `test_district_cross_jurisdiction_access_denied`, `test_anonymous_admin_and_audit_access_denied` |
| `simulateBatch` | POST | `/api/v1/admin/batch-planner` | Yes | `district_admin`, `state_admin`, `ministry_admin` | `BatchSimulateRequest` | `BatchSimulationResponse` | `/admin` | `test_simulate_training_batch` |
| `planProject` | POST | `/api/v1/admin/project-planner` | Yes | `district_admin`, `state_admin`, `ministry_admin` | `ProjectPlanRequest` | `ProjectPlanResponse` | `/admin` | `test_generate_livelihood_proposal` |
| `listAuditLogs` | GET | `/api/v1/admin/audit-logs` | Yes | `district_admin`, `state_admin`, `ministry_admin` | Query params | `List[AuditEventResponse]` | `/admin` | `test_audit_log_access_strictly_restricted_to_admin`, `test_admin_can_access_audit_logs` |
| `getSourceHealth` | GET | `/api/v1/admin/source-health` | Yes | `district_admin`, `state_admin`, `ministry_admin` | None | `List[SourceHealthResponse]` | `/admin` | `test_source_health_and_provenance` |
| `transcribeSpeech` | POST | `/api/v1/integrations/speech/transcribe` | No | Public / Authenticated | Audio / Mock payload | `SpeechTranscribeResponse` | `/interview` | `test_mock_speech_transcription_is_never_live` |
| `synthesizeSpeech` | POST | `/api/v1/integrations/speech/synthesize` | No | Public / Authenticated | Text payload | `SpeechSynthesizeResponse` | Global audio read-aloud | `test_mock_speech_synthesis_is_never_live` |
| `processIVRTurn` | POST | `/api/v1/integrations/ivr/turn` | No | Telephony webhook | `IVRTurnRequest` | `IVRTurnResponse` | Telephony SIP | `test_ivr_full_turn_sequence`, `test_simulated_ivr_is_never_live` |
| `registerMissedCall` | POST | `/api/v1/integrations/ivr/missed-call` | No | Telephony webhook | `MissedCallRequest` | `MissedCallResponse` | Telephony Gateway | `test_ivr_missed_call_callback` |
| `handleWhatsAppWebhook` | POST | `/api/v1/integrations/whatsapp/webhook` | No | Meta webhook contract | Webhook payload | `WhatsAppResponseCard` | Messaging Gateway | `test_sandbox_whatsapp_is_never_live` |
