import { apiFetch } from "./client";

export const getJourneyHome = (beneficiary_id: string) =>
  apiFetch<any>(`/api/v1/journey/${beneficiary_id}`);

export const selectPathway = (
  beneficiary_id: string,
  title: string,
  pathway_category = "wage_employment",
  qualification_id?: string
) =>
  apiFetch<any>("/api/v1/journey/select-pathway", {
    method: "POST",
    body: JSON.stringify({ beneficiary_id, title, pathway_category, qualification_id }),
    offlineOperation: "select_pathway",
    offlinePayload: { beneficiary_id, title, pathway_category, qualification_id }
  });

export const updateActionStatus = (action_id: string, status: string) =>
  apiFetch<any>(`/api/v1/journey/actions/${action_id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
    offlineOperation: "action_update",
    offlinePayload: { action_id, status }
  });

export const fileGrievance = (
  beneficiary_id: string,
  category: string,
  title: string,
  description: string
) =>
  apiFetch<{ status: string; grievance_id: string; is_offline?: boolean }>("/api/v1/journey/grievances", {
    method: "POST",
    body: JSON.stringify({ beneficiary_id, category, title, description }),
    offlineOperation: "file_grievance",
    offlinePayload: { beneficiary_id, category, title, description }
  });

export const counsellorOverride = (
  case_id: string,
  counsellor_user_id: string,
  original_recommendation_title: string,
  new_pathway_title: string,
  mandatory_reason: string
) =>
  apiFetch<any>(`/api/v1/journey/cases/${case_id}/override`, {
    method: "POST",
    body: JSON.stringify({
      counsellor_user_id,
      original_recommendation_title,
      new_pathway_title,
      mandatory_reason
    }),
    offlineOperation: "counsellor_override",
    offlinePayload: { case_id, counsellor_user_id, original_recommendation_title, new_pathway_title, mandatory_reason }
  });

export const getCases = (district_code = "MH-NAG") =>
  apiFetch<any[]>(`/api/v1/journey/cases?district_code=${district_code}`);

export const getCoordinationItems = () =>
  apiFetch<any[]>("/api/v1/journey/coordination");

export const updateCoordinationStatus = (referral_id: string, status: string, blocker_reason?: string) =>
  apiFetch<any>(`/api/v1/journey/coordination/${referral_id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, blocker_reason })
  });

export const getEnterprisePlan = (beneficiary_id: string) =>
  apiFetch<any>(`/api/v1/journey/enterprise/${beneficiary_id}`);

export const recordOutcome = (data: {
  beneficiary_id: string;
  outcome_type: string;
  organization_name?: string;
  wage_band_inr?: string;
  retention_90d_verified?: boolean;
  retention_180d_verified?: boolean;
}) =>
  apiFetch<any>("/api/v1/journey/outcomes", {
    method: "POST",
    body: JSON.stringify(data)
  });
