import type { TruthState } from "@/components/TruthBadge";

export interface JourneyAction {
  id: string; action_type: string; title: string; description: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
  order_index: number; due_date: string | null;
}
export interface JourneyHome {
  beneficiary_id: string; beneficiary_name: string; district_code: string;
  active_pathway: { id: string; title: string; category: string; status: string } | null;
  action_plan: JourneyAction[];
}

export interface FieldCase {
  id: string; beneficiary_id: string; beneficiary_name: string;
  village: string; phone: string; current_rec: string | null;
  blocker: string | null; next_action: string | null;
  status: string; priority: string; verified: boolean;
}

export interface CoordinationReferral {
  id: string; beneficiary_name: string; from_dept: string; to_dept: string;
  action_required: string; sla_days_remaining: number | null;
  status: string; blocker: string | null;
}

export interface EnterprisePlan {
  beneficiary_id: string; beneficiary_name: string; target_enterprise: string;
  district: string; status: string; truth_state: TruthState;
  assumed_capital_needs: {
    equipment_capex: number; working_capital_opex: number;
    total_estimated_inr: number; break_even_months: number;
  };
  scheme_prescreening: { scheme_name: string; indicative_amount: string; status: string; condition: string }[];
  literacy_checklist: { task: string; done: boolean }[];
}

export interface DistrictDashboard {
  district_code: string; district_name: string; truth_state: TruthState;
  total_beneficiaries_onboarded: number; active_training_centers: number;
  total_batch_capacity: number; current_available_seats: number; recorded_vacancies: number;
  sector_demand_matrix: {
    sector: string; expressed_demand_count: number; local_capacity: number;
    gap: number; demand_trend: string | null; truth_state: TruthState;
  }[];
  source_freshness_status: string;
}

export interface SourceHealth {
  id: string; publisher: string; source_name: string; source_type: string;
  canonical_url: string | null; freshness_sla_days: number;
  last_success_at: string | null; quality_status: string; notes: string | null;
}

export interface BatchSimulation {
  proposed_batch: { qualification_title: string; proposed_capacity: number; duration_days: number };
  feasibility_assessment: { potential_candidate_pool_in_radius: number | null; candidate_to_seat_ratio: number | null };
  budget_breakdown_inr: { total_batch_budget_inr: number; funding_component: string };
  verdict: string; truth_state: TruthState;
}

export interface ProjectProposalRequest {
  project_title: string; target_district: string; target_beneficiary_count: number;
  priority_sectors: string[]; estimated_budget_inr: number;
}

export interface ProjectProposal {
  project_title: string; target_district: string; target_sc_beneficiaries: number;
  total_budget_inr: number; proposal_status: string; executive_summary: string;
  truth_state: TruthState;
}
