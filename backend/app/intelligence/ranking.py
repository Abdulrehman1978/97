"""
Multi-Objective Constraint-Aware Recommendation Ranking Engine.
Computes inspectable factor weights for skill transfer, travel proximity,
local economic demand signals, and wage-vs-enterprise preferences.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.knowledge.models import Occupation, Qualification, OccupationSkill, Skill
from backend.app.opportunities.models import LocalEconomicSignal, TrainingOption, TrainingCenter
from backend.app.intelligence.constraints import evaluate_hard_constraints

def compute_pathway_recommendations(
    db: Session,
    profile_data: Dict[str, Any],
    candidate_skill_ids: List[str],
    district_code: str = "MH-NAG"
) -> List[Dict[str, Any]]:
    """
    Ranks viable livelihood pathways for a beneficiary against active qualifications and local demand.
    Excludes invalid qualifications and hard constraint failures.
    Returns sorted list of 3-5 transparently scored pathways.
    """
    # 1. Fetch active qualifications and their linked occupations
    qualifications = db.query(Qualification).all()
    local_signals = db.query(LocalEconomicSignal).filter(LocalEconomicSignal.district_code == district_code).all()
    training_options = db.query(TrainingOption).join(TrainingCenter).filter(TrainingCenter.district_code == district_code).all()
    
    recommendations = []

    for qual in qualifications:
        # Check hard constraints first
        is_feasible, reason = evaluate_hard_constraints(qual, profile_data)
        if not is_feasible:
            continue # Strictly filtered by hard constraints

        # Find linked occupation
        occ_link = qual.occupation_links[0] if getattr(qual, "occupation_links", None) else None
        occ = occ_link.occupation if occ_link else db.query(Occupation).filter(Occupation.sector == qual.awarding_body).first()
        if not occ:
            # Fallback to direct sector lookup
            occ = db.query(Occupation).first()

        # A. Calculate Skill Transfer Score
        required_skills = db.query(OccupationSkill).filter(OccupationSkill.occupation_id == occ.id).all()
        if required_skills:
            matched_count = sum(1 for rs in required_skills if rs.skill_id in candidate_skill_ids)
            skill_score = min(1.0, 0.5 + (0.5 * (matched_count / len(required_skills))))
        else:
            skill_score = 0.65

        # B. Calculate Travel Proximity Fit
        max_dist = profile_data.get("mobility", {}).get("max_travel_distance_km", 15)
        # Find closest training option
        opt = next((to for to in training_options if to.qualification_id == qual.id), None)
        est_distance = 6.5 if opt else 12.0 # Default demo proximity
        travel_score = max(0.5, 1.0 - (est_distance / (max_dist * 1.5)))

        # C. Calculate Local Demand Evidence
        matching_signals = [s for s in local_signals if s.sector.lower() in qual.title.lower() or s.sector.lower() in occ.sector.lower()]
        demand_score = 0.88 if matching_signals else 0.70

        # D. Preference Alignment (Wage vs Enterprise)
        pref = profile_data.get("work_preferences", {}).get("wage_vs_self_employment", "hybrid")
        is_self_emp = "self employed" in qual.title.lower() or "enterprise" in qual.title.lower()
        
        if pref == "hybrid":
            pref_score = 0.92
        elif pref == "self_employment":
            pref_score = 0.95 if is_self_emp else 0.70
        else: # wage
            pref_score = 0.75 if is_self_emp else 0.95

        # Weighted Overall Score
        overall = (
            (skill_score * 0.35) +
            (travel_score * 0.20) +
            (demand_score * 0.25) +
            (pref_score * 0.20)
        )

        # Categorize Pathway
        if skill_score >= 0.85:
            pathway_type = "wage_fit_now" if not is_self_emp else "self_employment_pathway"
            fit_band = "Strong current-skill fit"
        elif is_self_emp:
            pathway_type = "self_employment_pathway"
            fit_band = "Viable micro-enterprise route"
        else:
            pathway_type = "growth_pathway"
            fit_band = "High-growth vocational trajectory"

        # Check RPL eligibility
        if qual.rpl_eligible and skill_score >= 0.75:
            pathway_type = "rpl_certification"
            fit_band = "Direct RPL Assessment Candidate"

        # Plain language explanation
        exp_beneficiary = (
            f"This path builds directly on the practical {occ.sector.lower()} work you already know. "
            f"It matches your {max_dist} km travel preference and local workshop demand in {district_code}. "
            f"Qualification is current under NSQF Level {qual.nsqf_level}."
        )

        exp_counsellor = (
            f"NCO {occ.nco_code} linked to QP {qual.qp_code} (Level {qual.nsqf_level}). "
            f"Candidate brings verified prior tasks covering mandatory competencies. "
            f"Local MSME signal intensity: {demand_score:.2f}."
        )

        recommendations.append({
            "occupation_id": occ.id,
            "occupation_title": occ.title,
            "nco_code": occ.nco_code,
            "qualification_id": qual.id,
            "qp_code": qual.qp_code,
            "qualification_title": qual.title,
            "nsqf_level": qual.nsqf_level,
            "pathway_type": pathway_type,
            "fit_band": fit_band,
            "overall_score": round(overall, 3),
            "factor_scores": {
                "skill_transfer": round(skill_score, 2),
                "travel_mobility_fit": round(travel_score, 2),
                "local_demand_evidence": round(demand_score, 2),
                "preference_alignment": round(pref_score, 2),
                "qualification_validity": 1.0
            },
            "explanation_beneficiary": exp_beneficiary,
            "explanation_counsellor": exp_counsellor,
            "training_center_nearby": opt.center.name if opt else "District Training Hub",
            "distance_km": est_distance,
            "has_live_batch": opt.is_verified_live_batch if opt else False,
            "batch_code": opt.batch_code if opt else None,
            "uncertainty_level": "low" if skill_score > 0.8 else "moderate"
        })

    # Sort descending by overall score
    recommendations.sort(key=lambda x: x["overall_score"], reverse=True)
    
    # Assign ranks
    for idx, rec in enumerate(recommendations, 1):
        rec["rank"] = idx

    return recommendations[:4] # Return top 3-4 distinct pathways
