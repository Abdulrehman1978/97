import { apiFetch } from "./client";

export interface ExtractVoiceResponse {
  tasks_detected: string[];
  tools_detected: string[];
  extracted_skills: Array<{
    canonical_name: string;
    category: string;
    confidence: number;
    verification_status: string;
    evidence_span?: string;
  }>;
  inferred_constraints: {
    max_travel_distance_km?: number;
    education_level?: string;
    wage_vs_self_employment?: string;
    requires_wheelchair_access?: boolean;
  };
  evidence_summary: string;
  requires_confirmation: boolean;
  truth_state: string;
}

export const extractVoice = (transcript: string, language = "mr") =>
  apiFetch<ExtractVoiceResponse>("/api/v1/intelligence/extract-voice", {
    method: "POST",
    body: JSON.stringify({ transcript, language })
  });

export const getRecommendations = (profile?: any, skill_ids?: string[], district_code = "MH-NAG") =>
  apiFetch<{
    district_code: string;
    recommendations_count: number;
    pathways: any[];
  }>("/api/v1/intelligence/recommend", {
    method: "POST",
    body: JSON.stringify({ profile, skill_ids, district_code })
  });

export const checkRpl = (qualification_id: string, beneficiary_skill_ids: string[] = [], experience_months = 24) =>
  apiFetch<any>("/api/v1/intelligence/rpl-check", {
    method: "POST",
    body: JSON.stringify({ qualification_id, beneficiary_skill_ids, experience_months })
  });

export const exploreCounterfactual = (
  base_profile_or_options: any,
  candidate_skill_ids: string[] = [],
  delta_parameters: any = {},
  district_code = "MH-NAG"
) => {
  let body: any;
  if (base_profile_or_options && typeof base_profile_or_options === "object" && "base_profile" in base_profile_or_options) {
    body = base_profile_or_options;
  } else {
    body = {
      base_profile: base_profile_or_options,
      candidate_skill_ids,
      delta_parameters,
      district_code
    };
  }
  return apiFetch<any>("/api/v1/intelligence/counterfactual", {
    method: "POST",
    body: JSON.stringify(body)
  });
};

export const askPolicyRag = (query: string) =>
  apiFetch<{
    query: string;
    answer: string;
    abstained: boolean;
    citations: string[];
    source_publisher?: string;
    effective_dates?: string;
    truth_state: string;
  }>("/api/v1/intelligence/policy-rag", {
    method: "POST",
    body: JSON.stringify({ query })
  });
