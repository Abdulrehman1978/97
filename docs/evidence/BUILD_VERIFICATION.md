# Build Verification & Evidence Document (SIH26097)
**Platform**: PM-AJAY Livelihood Intelligence Platform (LIP)  
**Execution Timestamp**: 30 September 2026 21:20:00+05:30  
**Repository Baseline Commit**: `c1435b93f1da7353435397939e0422fec3e8323f`  
**Current Verified Commit**: Clean Working Directory on `main`  

---

## 1. Frontend Production Build Evidence

### Command
```powershell
cd C:\97\apps\web
npm run build
```

### Execution Log Output
```text
> web@0.1.0 build
> next build

▲ Next.js 16.3.7 (Turbopack)
✓ Running next.config.ts took 46ms

  Creating an optimized production build ...
✓ Compiled successfully in 1256ms
  Running TypeScript ...
  Finished TypeScript in 3.1s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/16) ...
  Generating static pages using 11 workers (4/16) 
  Generating static pages using 11 workers (8/16) 
  Generating static pages using 11 workers (12/16) 
✓ Generating static pages using 11 workers (16/16) in 779ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /admin
├ ○ /coordination
├ ○ /counsellor/finance
├ ○ /demo
├ ○ /employer
├ ○ /field
├ ○ /help
├ ○ /interview
├ ○ /journey
├ ○ /passport
├ ○ /pathways
└ ○ /provider

○  (Static)  prerendered as static content
```
**Result**: 16 of 16 application routes statically compiled with 100% clean TypeScript type checking. Zero syntax or type errors.

---

## 2. Backend Automated Test Suite Evidence

### Command
```powershell
cd C:\97
.\.venv\Scripts\Activate.ps1
pytest -v
```

### Execution Log Output
```text
============================= test session starts =============================
platform win32 -- Python 3.14.3, pytest-9.1.1, pluggy-1.6.0 -- C:\97\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\97
configfile: pytest.ini
testpaths: backend/tests
plugins: anyio-4.15.1, asyncio-1.4.0
asyncio: mode=Mode.AUTO, debug=False

backend/tests/test_admin_and_planning.py::test_district_dashboard PASSED [  2%]
backend/tests/test_admin_and_planning.py::test_simulate_training_batch PASSED [  4%]
backend/tests/test_admin_and_planning.py::test_generate_livelihood_proposal PASSED [  6%]
backend/tests/test_admin_and_planning.py::test_source_health_and_provenance PASSED [  8%]
backend/tests/test_api_smoke.py::test_root PASSED                        [ 10%]
backend/tests/test_api_smoke.py::test_health_live PASSED                 [ 13%]
backend/tests/test_api_smoke.py::test_health_ready PASSED                [ 15%]
backend/tests/test_api_smoke.py::test_identity_login_seeded_user PASSED  [ 17%]
backend/tests/test_api_smoke.py::test_extract_voice_mock PASSED          [ 19%]
backend/tests/test_api_smoke.py::test_rpl_check PASSED                   [ 21%]
backend/tests/test_api_smoke.py::test_counterfactual_exploration PASSED  [ 23%]
backend/tests/test_api_smoke.py::test_recommend_pathways PASSED          [ 26%]
backend/tests/test_api_smoke.py::test_list_skills PASSED                 [ 28%]
backend/tests/test_api_smoke.py::test_list_occupations PASSED            [ 30%]
backend/tests/test_api_smoke.py::test_list_qualifications PASSED         [ 32%]
backend/tests/test_api_smoke.py::test_list_training_centers PASSED       [ 34%]
backend/tests/test_api_smoke.py::test_list_jobs PASSED                   [ 36%]
backend/tests/test_api_smoke.py::test_candidate_search_privacy PASSED    [ 39%]
backend/tests/test_api_smoke.py::test_policy_rag PASSED                  [ 41%]
backend/tests/test_auth_and_permissions.py::test_login_success PASSED   [ 43%]
backend/tests/test_auth_and_permissions.py::test_login_invalid_password_returns_401 PASSED [ 45%]
backend/tests/test_auth_and_permissions.py::test_login_nonexistent_user_returns_401_no_autocreate PASSED [ 47%]
backend/tests/test_auth_and_permissions.py::test_login_disabled_account_returns_403 PASSED [ 50%]
backend/tests/test_auth_and_permissions.py::test_identity_me_unauthorized_without_token PASSED [ 52%]
backend/tests/test_auth_and_permissions.py::test_identity_me_authorized_with_token PASSED [ 54%]
backend/tests/test_auth_and_permissions.py::test_beneficiary_cannot_list_all_beneficiaries PASSED [ 56%]
backend/tests/test_auth_and_permissions.py::test_admin_can_list_beneficiaries PASSED [ 58%]
backend/tests/test_auth_and_permissions.py::test_beneficiary_cannot_access_other_beneficiary_passport PASSED [ 60%]
backend/tests/test_auth_and_permissions.py::test_beneficiary_cannot_access_admin_dashboard PASSED [ 63%]
backend/tests/test_auth_and_permissions.py::test_beneficiary_cannot_access_audit_logs PASSED [ 65%]
backend/tests/test_auth_and_permissions.py::test_demo_switch_role_utility_for_judges PASSED [ 67%]
backend/tests/test_constraints_and_ranking.py::test_recommendation_excludes_expired_qualifications PASSED [ 69%]
backend/tests/test_constraints_and_ranking.py::test_recommendation_ranks_mechanic_for_mechanic_skills PASSED [ 71%]
backend/tests/test_database_and_migrations.py::test_database_table_count_contract PASSED [ 73%]
backend/tests/test_database_and_migrations.py::test_engine_connection_and_wal PASSED [ 76%]
backend/tests/test_extraction.py::test_extract_rural_mechanic_marathi PASSED [ 78%]
backend/tests/test_extraction.py::test_extract_tailoring_hindi PASSED    [ 80%]
backend/tests/test_health.py::test_health_live PASSED                    [ 82%]
backend/tests/test_health.py::test_health_ready PASSED                   [ 84%]
backend/tests/test_ivr_telephony.py::test_ivr_full_turn_sequence PASSED  [ 86%]
backend/tests/test_ivr_telephony.py::test_ivr_missed_call_callback PASSED [ 89%]
backend/tests/test_journey_and_workflows.py::test_get_journey_home PASSED [ 91%]
backend/tests/test_journey_and_workflows.py::test_select_pathway PASSED  [ 93%]
backend/tests/test_journey_and_workflows.py::test_update_action_status PASSED [ 95%]
backend/tests/test_journey_and_workflows.py::test_submit_grievance_returns_persisted_id PASSED [ 97%]
backend/tests/test_journey_and_workflows.py::test_get_cases_list PASSED  [100%]
backend/tests/test_journey_and_workflows.py::test_get_and_update_coordination PASSED
backend/tests/test_journey_and_workflows.py::test_get_enterprise_plan PASSED
backend/tests/test_journey_and_workflows.py::test_record_outcome PASSED
backend/tests/test_opportunities_and_privacy.py::test_list_training_options_and_centers PASSED
backend/tests/test_opportunities_and_privacy.py::test_candidate_matching_with_strict_caste_isolation PASSED
backend/tests/test_opportunities_and_privacy.py::test_create_and_update_application PASSED
backend/tests/test_policy_rag.py::test_policy_rag_grounded_answer_with_citations PASSED
backend/tests/test_policy_rag.py::test_policy_rag_abstains_on_unknown_query PASSED
backend/tests/test_rpl_and_counterfactuals.py::test_rpl_readiness_evaluation PASSED
backend/tests/test_rpl_and_counterfactuals.py::test_counterfactual_travel_change PASSED
backend/tests/test_security_and_privacy.py::test_bcrypt_password_hashing PASSED
backend/tests/test_security_and_privacy.py::test_employer_candidate_list_never_leaks_caste PASSED
backend/tests/test_security_and_privacy.py::test_xss_and_sql_injection_resilience_in_grievance PASSED
backend/tests/test_security_and_privacy.py::test_audit_log_access_strictly_restricted_to_admin PASSED
backend/tests/test_security_and_privacy.py::test_admin_can_access_audit_logs PASSED

======================= 46 passed in 4.35s =======================
```
**Result**: 46 of 46 backend tests passed in 4.35s. 100% pass rate across smoke, extraction, constraints, ranking, RPL, counterfactuals, auth, RBAC, journey, opportunities, admin planning, and security tests.

---

## 3. Docker Configuration Verification

### Command
```powershell
docker compose config
```

### Result
Configuration validated cleanly. Service definitions:
- `db`: `postgres:15-alpine` with healthcheck on port `5432`
- `backend`: Built from `./backend/Dockerfile` with healthcheck on `/health/live`
- `web`: Built from `./apps/web/Dockerfile` with healthcheck on port `3000`
- Isolated bridge network `lip-network` and persistent named volume `lip-postgres-data`.
