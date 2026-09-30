# Privacy Architecture & Data Flow Specification (SIH26097)
**Compliance Standard**: Digital Personal Data Protection (DPDP) Act 2023 / Constitutional Privacy Safeguards  
**Platform**: PM-AJAY Livelihood Intelligence Platform (LIP)  
**Verification Date**: 30 September 2026  

---

## 1. Architectural Privacy Boundary

To eliminate caste-based discrimination, bias in recruitment, and unauthorized profiling, LIP establishes a strict architectural boundary separating the **Protected Beneficiary Boundary** from the **Employer & Partner Boundary**.

```text
┌────────────────────────────────────────────────────────┐
│             PROTECTED BENEFICIARY BOUNDARY             │
│                                                        │
│  - Full Name: Ramesh Mesram                            │
│  - Caste / Sub-Caste: Mahar / SC (PM-AJAY Eligible)    │
│  - Annual Household Income: Rs. 1,40,000 (BPL Eligible)│
│  - Precise Home Address: Nildoh, Hingna, Nagpur        │
│  - Raw Audio Transcripts & Dialect Utterances          │
│  - Disability / Accommodation Details                  │
└───────────────────────────┬────────────────────────────┘
                            │
              [STRICT PRIVACY FILTER & REDACTION]
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             EMPLOYER & PARTNER VIEW BOUNDARY           │
│                                                        │
│  - Candidate ID: CAND-7492                             │
│  - Pseudonymous Name: R.                               │
│  - Verified Competencies: Two-Wheeler Engine Overhaul  │
│  - Tools Mastered: Multimeter, Spanner, Compressor     │
│  - NSQF Qualification: ASC/Q1411 (Automotive L4)       │
│  - General District: Nagpur (MH)                       │
│  - Wage Expectation Band: Rs. 15,000 - 18,000 / month  │
│  ───────────────────────────────────────────────────  │
│  REDACTED: Caste, Religion, BPL Card, Precise Home     │
└────────────────────────────────────────────────────────┘
```

---

## 2. DPDP Act 2023 Compliance & Consent Architecture

### 1. Purpose Limitation
Beneficiary consent is captured explicitly on first onboarding via `/api/v1/identity/consent`:
- **Purpose**: Livelihood skill profiling, RPL recommendation, and government opportunity linkage under PM-AJAY GIA.
- Data is strictly prohibited from secondary commercial monetization, data broker sales, or non-livelihood surveillance.

### 2. Raw Audio Retention Policy
- **Default Rule**: **Raw audio is NOT persisted**. Speech audio streams are processed in memory for feature extraction and immediately discarded.
- **Opt-in Only**: Users must explicitly check `raw_audio_retention_opt_in = true` for model fine-tuning or dialect preservation.
- **Revocation**: Beneficiaries can revoke audio consent at any time, triggering automated purge routines.

### 3. Verification & Test Evidence
- Verified via `backend/tests/test_security_and_privacy.py::test_employer_candidate_list_never_leaks_caste`.
- The candidate listing API automatically strips all sensitive fields and formats candidate names to single initials (`"R."`).
