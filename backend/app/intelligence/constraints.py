"""
Hard Constraint Engine for Skilling & Livelihood Pathways.
Evaluates statutory rules, qualification validity, educational prerequisites,
mobility travel ceilings, and accessibility compliance.
Rule: Deterministic code enforces hard constraints; no LLM can bypass them.
"""

from typing import Tuple, Dict, Any, Optional
from datetime import datetime
from backend.app.knowledge.models import Qualification
from backend.app.opportunities.models import TrainingCenter

EDUCATION_HIERARCHY = {
    "unlettered": 0,
    "class_5": 1,
    "class_8": 2,
    "class_10": 3,
    "class_12": 4,
    "iti": 5,
    "diploma": 6,
    "graduate": 7
}

def evaluate_hard_constraints(
    qualification: Qualification,
    profile_data: Dict[str, Any],
    training_center: Optional[TrainingCenter] = None,
    center_distance_km: float = 8.0
) -> Tuple[bool, Optional[str]]:
    """
    Evaluates hard feasibility.
    Returns: (is_feasible: bool, failure_reason: Optional[str])
    """
    now = datetime.utcnow()

    # 1. Hard Rule: Qualification Validity
    if qualification.validity_status.lower() in ["expired", "superseded"]:
        return False, f"Qualification {qualification.qp_code} is expired or superseded as per NQR records."
    
    if qualification.effective_to and qualification.effective_to < now:
        return False, f"Qualification {qualification.qp_code} expired on {qualification.effective_to.strftime('%Y-%m-%d')}."

    if qualification.effective_from and qualification.effective_from > now:
        return False, f"Qualification {qualification.qp_code} is not yet effective (starts {qualification.effective_from.strftime('%Y-%m-%d')})."

    # 2. Hard Rule: Minimum Educational Prerequisite
    candidate_edu = profile_data.get("education", {}).get("highest_level", "class_10").lower()
    required_edu = (qualification.min_education or "unlettered").lower()
    
    candidate_rank = EDUCATION_HIERARCHY.get(candidate_edu, 3)
    required_rank = EDUCATION_HIERARCHY.get(required_edu, 0)

    if candidate_rank < required_rank:
        return False, f"Prerequisite mismatch: Requires minimum {qualification.min_education}, but profile indicates {candidate_edu}."

    # 3. Hard Rule: Mobility Travel Radius Ceiling
    max_radius = profile_data.get("mobility", {}).get("max_travel_distance_km", 15)
    can_relocate = profile_data.get("mobility", {}).get("can_relocate_district", False)
    
    if training_center and not can_relocate:
        if center_distance_km > max_radius:
            # Check if training center provides residential hostel
            if not getattr(training_center, "has_women_hostel", False): # or general hostel
                return False, f"Center is {center_distance_km:.1f} km away, exceeding travel radius of {max_radius} km."

    # 4. Hard Rule: Physical Accessibility Compliance
    accessibility = profile_data.get("accessibility", {})
    if accessibility.get("requires_wheelchair_access", False):
        if training_center and not training_center.has_wheelchair_access:
            return False, f"Training center does not meet verified wheelchair accessibility requirements."

    return True, None
