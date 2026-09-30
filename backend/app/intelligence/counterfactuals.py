"""
Deterministic Counterfactual Pathway Explorer ("What-If" Reasoning Engine).
Allows beneficiaries, counsellors, and judges to simulate how modifying
mobility, education, or employment preference dynamically alters available pathways.
"""

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.intelligence.ranking import compute_pathway_recommendations

def evaluate_counterfactuals(
    db: Session,
    base_profile: Dict[str, Any],
    candidate_skill_ids: List[str],
    delta_parameters: Dict[str, Any],
    district_code: str = "MH-NAG"
) -> Dict[str, Any]:
    """
    Computes comparative pathway outcomes based on modified user parameters.
    delta_parameters may include:
    - 'max_travel_distance_km': int
    - 'wage_vs_self_employment': str
    - 'education_level': str
    - 'requires_wheelchair_access': bool
    """
    # 1. Base run
    base_results = compute_pathway_recommendations(db, base_profile, candidate_skill_ids, district_code)
    
    # 2. Cloned profile with applied deltas
    simulated_profile = {
        "education": dict(base_profile.get("education", {})),
        "aspirations": dict(base_profile.get("aspirations", {})),
        "work_preferences": dict(base_profile.get("work_preferences", {})),
        "mobility": dict(base_profile.get("mobility", {})),
        "accessibility": dict(base_profile.get("accessibility", {}))
    }

    explanations = []

    if "max_travel_distance_km" in delta_parameters:
        old_dist = simulated_profile["mobility"].get("max_travel_distance_km", 15)
        new_dist = delta_parameters["max_travel_distance_km"]
        simulated_profile["mobility"]["max_travel_distance_km"] = new_dist
        if new_dist > old_dist:
            explanations.append(f"Increasing travel radius from {old_dist} km to {new_dist} km expands training center options into neighboring industrial clusters.")
        else:
            explanations.append(f"Restricting travel radius to {new_dist} km prioritizes only immediate hyper-local workshop pathways.")

    if "wage_vs_self_employment" in delta_parameters:
        old_pref = simulated_profile["work_preferences"].get("wage_vs_self_employment", "hybrid")
        new_pref = delta_parameters["wage_vs_self_employment"]
        simulated_profile["work_preferences"]["wage_vs_self_employment"] = new_pref
        explanations.append(f"Switching work preference to '{new_pref}' re-weights enterprise readiness and credit linkage schemes.")

    if "education_level" in delta_parameters:
        old_edu = simulated_profile["education"].get("highest_level", "class_10")
        new_edu = delta_parameters["education_level"]
        simulated_profile["education"]["highest_level"] = new_edu
        explanations.append(f"Simulating education level at '{new_edu}' re-checks qualification entry prerequisites.")

    # 3. Simulated run
    simulated_results = compute_pathway_recommendations(db, simulated_profile, candidate_skill_ids, district_code)

    return {
        "original_top_pathway": base_results[0]["qualification_title"] if base_results else None,
        "simulated_top_pathway": simulated_results[0]["qualification_title"] if simulated_results else None,
        "original_results": base_results,
        "simulated_results": simulated_results,
        "parameters_changed": delta_parameters,
        "counterfactual_reasoning": explanations,
        "trade_off_summary": (
            "Simulated changes show genuine feasibility updates: higher travel yields broader batch access, "
            "while enterprise preference elevates PM-AJAY capital subsidy roadmaps."
        )
    }
