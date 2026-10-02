import { apiFetch } from "./client";

export interface CreateBeneficiaryPayload {
  full_name: string;
  phone?: string;
  state_code?: string;
  district_code?: string;
  block_name?: string;
  village_name?: string;
  gender?: string;
  age?: number;
  primary_language?: string;
  profile_data?: Record<string, any>;
  confirmed_transcript?: string;
}

export interface ProfileUpdatePayload {
  education?: Record<string, any>;
  aspirations?: Record<string, any>;
  work_preferences?: Record<string, any>;
  mobility?: Record<string, any>;
  accessibility?: Record<string, any>;
  household_context?: Record<string, any>;
  financial_context?: Record<string, any>;
  language_preferences?: Record<string, any>;
}

export const createBeneficiary = (payload: CreateBeneficiaryPayload) =>
  apiFetch<any>("/api/v1/beneficiaries/", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const registerBeneficiary = createBeneficiary;

export const getBeneficiary = (beneficiary_id: string) =>
  apiFetch<any>(`/api/v1/beneficiaries/${beneficiary_id}`);

export const getLivelihoodPassport = (beneficiary_id: string) =>
  apiFetch<any>(`/api/v1/beneficiaries/${beneficiary_id}/passport`);

export const updateBeneficiaryProfile = (beneficiary_id: string, payload: ProfileUpdatePayload) =>
  apiFetch<any>(`/api/v1/beneficiaries/${beneficiary_id}/profile`, {
    method: "PUT",
    body: JSON.stringify(payload),
    offlineOperation: "profile_update",
    offlinePayload: { beneficiary_id, ...payload }
  });

export const recordConsent = (payload: {
  beneficiary_id: string;
  purpose?: string;
  raw_audio_retention_opt_in?: boolean;
  language?: string;
}) =>
  apiFetch<any>("/api/v1/identity/consent", {
    method: "POST",
    body: JSON.stringify(payload)
  });
