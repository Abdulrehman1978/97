"""Recovery contracts: real ownership, scoped records and no invented defaults."""
from uuid import uuid4
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.identity.models import User, Organization, Membership
from backend.app.identity.policies import is_beneficiary_owner, can_view_district_analytics
from backend.app.beneficiary.models import Beneficiary
from backend.app.journey.models import Case, Referral
from backend.app.admin.models import EnterprisePlan
from backend.app.shared.security import create_access_token

client = TestClient(app)


@pytest.fixture
def records():
    suffix = uuid4().hex
    db = SessionLocal()
    owner = User(id=f"v3-owner-{suffix}", full_name="Recovery owner", role="beneficiary")
    outsider = User(id=f"v3-outsider-{suffix}", full_name="Recovery outsider", role="beneficiary")
    admin = User(id=f"v3-admin-{suffix}", full_name="Recovery district admin", role="district_admin")
    org = Organization(id=f"v3-org-{suffix}", name="Recovery district", type="district_admin", jurisdiction_code="MH-NAG")
    db.add_all([owner, outsider, admin, org])
    db.flush()
    ben = Beneficiary(id=f"v3-ben-{suffix}", user_id=owner.id, full_name="Recovery candidate", district_code="MH-PUN")
    db.add_all([ben, Membership(user_id=admin.id, organization_id=org.id, role="admin")])
    db.flush()
    case = Case(id=f"v3-case-{suffix}", beneficiary_id=ben.id)
    db.add(case)
    db.flush()
    ref = Referral(id=f"v3-ref-{suffix}", case_id=case.id, referral_type="training_center", purpose="Review options")
    db.add(ref)
    db.commit()

    def headers(user):
        return {"Authorization": "Bearer " + create_access_token({"sub": user.id, "role": user.role})}

    yield SimpleNamespace(db=db, ben=ben, case=case, ref=ref, owner=headers(owner), outsider=headers(outsider), admin=headers(admin))
    db.rollback()
    db.query(Referral).filter(Referral.id == ref.id).delete()
    db.query(Case).filter(Case.id == case.id).delete()
    db.query(EnterprisePlan).filter(EnterprisePlan.beneficiary_id == ben.id).delete()
    db.query(Beneficiary).filter(Beneficiary.id == ben.id).delete()
    db.query(Membership).filter(Membership.organization_id == org.id).delete()
    db.query(Organization).filter(Organization.id == org.id).delete()
    db.query(User).filter(User.id.in_([owner.id, outsider.id, admin.id])).delete(synchronize_session=False)
    db.commit()
    db.close()


def test_id_collision_and_demo_prefix_are_not_ownership():
    ben = SimpleNamespace(id="demo-owner", user_id="actual-owner")
    impostor = SimpleNamespace(id="demo-owner", role="beneficiary")
    assert not is_beneficiary_owner(impostor, ben)


def test_missing_jurisdiction_is_not_national_access():
    assert not can_view_district_analytics(SimpleNamespace(id="unassigned", role="district_admin"), "MH-PUN")


def test_enterprise_get_is_read_only_and_empty(records):
    before = records.db.query(EnterprisePlan).count()
    response = client.get(f"/api/v1/journey/enterprise/{records.ben.id}", headers=records.owner)
    assert response.status_code == 200
    assert response.json() is None
    assert records.db.query(EnterprisePlan).count() == before


def test_enterprise_other_owner_denied(records):
    response = client.get(f"/api/v1/journey/enterprise/{records.ben.id}", headers=records.outsider)
    assert response.status_code == 403


def test_cross_district_cases_and_referrals_excluded(records):
    cases = client.get("/api/v1/journey/cases?district_code=MH-PUN", headers=records.admin)
    assert cases.status_code == 200
    assert records.case.id not in [x["id"] for x in cases.json()]
    refs = client.get("/api/v1/journey/coordination", headers=records.admin)
    assert refs.status_code == 200
    assert records.ref.id not in [x["id"] for x in refs.json()]


def test_cross_district_mutation_does_not_change_database(records):
    response = client.put(f"/api/v1/journey/coordination/{records.ref.id}/status", headers=records.admin, json={"status": "completed"})
    assert response.status_code == 403
    records.db.refresh(records.ref)
    assert records.ref.status == "pending"


def test_cross_district_planning_denied(records):
    response = client.post("/api/v1/admin/batch-planner", headers=records.admin, json={"district_code": "MH-PUN"})
    assert response.status_code == 403


@pytest.mark.parametrize("capacity", [0, -1, 1001])
def test_batch_capacity_is_bounded(records, capacity):
    response = client.post("/api/v1/admin/batch-planner", headers=records.admin, json={"proposed_capacity": capacity})
    assert response.status_code == 422


def test_invalid_referral_status_does_not_persist(records):
    response = client.put(f"/api/v1/journey/coordination/{records.ref.id}/status", headers=records.admin, json={"status": "approved-by-government"})
    assert response.status_code == 422
    records.db.refresh(records.ref)
    assert records.ref.status == "pending"
