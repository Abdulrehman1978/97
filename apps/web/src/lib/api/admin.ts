import { apiFetch } from "./client";

export const getDistrictDashboard = (district_code = "MH-NAG") =>
  apiFetch<any>(`/api/v1/admin/dashboard?district_code=${district_code}`);

export const simulateBatch = (
  district_code = "MH-NAG",
  qualification_code = "ASC/Q1411",
  proposed_capacity = 30
) =>
  apiFetch<any>("/api/v1/admin/batch-planner", {
    method: "POST",
    body: JSON.stringify({ district_code, qualification_code, proposed_capacity, duration_days: 90 })
  });

export const buildProjectProposal = (req: any) =>
  apiFetch<any>("/api/v1/admin/project-planner", {
    method: "POST",
    body: JSON.stringify(req)
  });

export const getSourceHealth = () =>
  apiFetch<any[]>("/api/v1/admin/source-health");

export const getAuditLogs = () =>
  apiFetch<any[]>("/api/v1/admin/audit-logs");
