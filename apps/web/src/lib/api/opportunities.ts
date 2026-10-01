import { apiFetch } from "./client";

export const getTrainingCenters = (district_code = "MH-NAG") =>
  apiFetch<any[]>(`/api/v1/opportunities/training-centers?district_code=${district_code}`);

export const getTrainingOptions = (district_code = "MH-NAG") =>
  apiFetch<any[]>(`/api/v1/opportunities/training-options?district_code=${district_code}`);

export const createTrainingBatch = (data: {
  center_id: string;
  qualification_id: string;
  batch_code: string;
  seat_capacity: number;
  seats_available: number;
  start_date?: string;
  is_verified_live_batch: boolean;
  truth_state: string;
}) =>
  apiFetch<any>("/api/v1/opportunities/training-options", {
    method: "POST",
    body: JSON.stringify(data)
  });

export const getEmployerJobs = (district_code = "MH-NAG") =>
  apiFetch<any[]>(`/api/v1/opportunities/jobs?district_code=${district_code}`);

export const createEmployerJob = (data: {
  organization_id: string;
  title: string;
  opportunity_type: string;
  district_code: string;
  worksite_address: string;
  monthly_wage_inr: number;
  is_wage_guaranteed: boolean;
  vacancies: number;
  is_accessible_workplace: boolean;
  truth_state: string;
}) =>
  apiFetch<any>("/api/v1/opportunities/jobs", {
    method: "POST",
    body: JSON.stringify(data)
  });

export const getEmployerCandidates = (skill_keyword?: string, district_code = "MH-NAG") =>
  apiFetch<any[]>(
    `/api/v1/opportunities/candidates?district_code=${district_code}${
      skill_keyword ? `&skill_keyword=${encodeURIComponent(skill_keyword)}` : ""
    }`
  );

export const getApplications = (params?: { opportunity_id?: string; training_option_id?: string }) => {
  const query = new URLSearchParams();
  if (params?.opportunity_id) query.set("opportunity_id", params.opportunity_id);
  if (params?.training_option_id) query.set("training_option_id", params.training_option_id);
  return apiFetch<any[]>(`/api/v1/opportunities/applications?${query.toString()}`);
};

export const updateApplicationHiringStatus = (application_id: string, status: string) =>
  apiFetch<any>(`/api/v1/opportunities/applications/${application_id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });

export const submitApplication = (data: {
  beneficiary_id: string;
  opportunity_id?: string;
  training_option_id?: string;
  application_type?: string;
}) =>
  apiFetch<any>("/api/v1/opportunities/apply", {
    method: "POST",
    body: JSON.stringify(data)
  });

export const getDistrictDemandIndex = (district_code = "MH-NAG") =>
  apiFetch<any>(`/api/v1/opportunities/demand-index?district_code=${district_code}`);
