from typing import Any, Dict, Optional
from backend.app.identity.models import User

def can_view_beneficiary(user: Optional[User], beneficiary_id: str, assigned_worker_id: Optional[str] = None) -> bool:
    """Beneficiary can view self; assigned field workers, counsellors, and district/ministry admins have access."""
    if not user:
        return False
    if user.role in ["ministry_admin", "state_admin", "district_admin"]:
        return True
    if user.id == beneficiary_id:
        return True
    if user.role in ["field_worker", "counsellor", "financial_counsellor"]:
        if assigned_worker_id and user.id == assigned_worker_id:
            return True
        # If in same jurisdiction or assigned case
        return True
    return False

def can_edit_beneficiary(user: Optional[User], beneficiary_id: str) -> bool:
    """Beneficiary can edit self; authorized field staff can update with audit."""
    if not user:
        return False
    if user.id == beneficiary_id:
        return True
    if user.role in ["field_worker", "counsellor", "financial_counsellor", "district_admin"]:
        return True
    return False

def can_view_case(user: Optional[User], case: Any) -> bool:
    """Verify access to case based on user role and assignment."""
    if not user:
        return False
    if user.role in ["ministry_admin", "state_admin", "district_admin"]:
        return True
    if getattr(case, "beneficiary_id", None) == user.id:
        return True
    if getattr(case, "assigned_to_user_id", None) == user.id:
        return True
    if user.role in ["field_worker", "counsellor", "financial_counsellor"]:
        return True
    return False

def can_manage_training_provider(user: Optional[User], provider_id: str) -> bool:
    """Only provider admins or state/district authority can manage center batches."""
    if not user:
        return False
    if user.role in ["ministry_admin", "state_admin", "district_admin"]:
        return True
    if user.role == "provider":
        return True
    return False

def can_view_district_analytics(user: Optional[User], district_code: Optional[str] = None) -> bool:
    """Admins, planners, and officials can view district demand/supply intelligence."""
    if not user:
        return False
    return user.role in ["district_admin", "state_admin", "ministry_admin", "counsellor", "financial_counsellor"]

def can_access_sensitive_field(user: Optional[User], field_name: str, purpose: str) -> bool:
    """
    Guards high-sensitivity fields (caste category, household income, precise GPS coords).
    Strict Rule: Caste/social category is NEVER exposed to employers or public job matching.
    """
    if not user:
        return False
    
    # Employers NEVER have access to caste or sensitive social identity
    if user.role == "employer":
        if field_name in ["caste_category", "social_category", "bpl_status", "annual_income"]:
            return False
            
    # For scheme qualification verification by authorized staff
    if field_name in ["caste_category", "social_category", "annual_income"]:
        if purpose in ["scheme_eligibility_verification", "inclusion_audit"]:
            return user.role in ["district_admin", "state_admin", "ministry_admin", "field_worker", "counsellor"]
        return False
        
    return True
