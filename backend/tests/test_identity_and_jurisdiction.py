import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.identity.models import User, Organization, Membership
from backend.app.beneficiary.models import Beneficiary, BeneficiaryProfile
from backend.app.opportunities.models import TrainingCenter, TrainingOption, EmployerOpportunity
from backend.app.shared.security import create_access_token

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_jurisdiction_fixtures():
    db = SessionLocal()
    try:
        # Organizations
        org_nag = db.query(Organization).filter(Organization.id == "org-test-nag").first()
        if not org_nag:
            org_nag = Organization(id="org-test-nag", name="DSC Nagpur Test", type="district_admin", jurisdiction_code="MH-NAG")
            db.add(org_nag)

        org_pun = db.query(Organization).filter(Organization.id == "org-test-pun").first()
        if not org_pun:
            org_pun = Organization(id="org-test-pun", name="DSC Pune Test", type="district_admin", jurisdiction_code="MH-PUN")
            db.add(org_pun)

        org_state_mh = db.query(Organization).filter(Organization.id == "org-test-state-mh").first()
        if not org_state_mh:
            org_state_mh = Organization(id="org-test-state-mh", name="Maharashtra Skill Dept", type="state_dept", jurisdiction_code="MH")
            db.add(org_state_mh)

        org_up = db.query(Organization).filter(Organization.id == "org-test-up").first()
        if not org_up:
            org_up = Organization(id="org-test-up", name="DSC Varanasi Test", type="district_admin", jurisdiction_code="UP-VAR")
            db.add(org_up)

        org_prov_a = db.query(Organization).filter(Organization.id == "org-test-prov-a").first()
        if not org_prov_a:
            org_prov_a = Organization(id="org-test-prov-a", name="Provider Alpha", type="provider", jurisdiction_code="MH-NAG")
            db.add(org_prov_a)

        org_prov_b = db.query(Organization).filter(Organization.id == "org-test-prov-b").first()
        if not org_prov_b:
            org_prov_b = Organization(id="org-test-prov-b", name="Provider Beta", type="provider", jurisdiction_code="MH-PUN")
            db.add(org_prov_b)

        org_emp_a = db.query(Organization).filter(Organization.id == "org-test-emp-a").first()
        if not org_emp_a:
            org_emp_a = Organization(id="org-test-emp-a", name="Employer Alpha Motors", type="employer", jurisdiction_code="MH-NAG")
            db.add(org_emp_a)

        org_emp_b = db.query(Organization).filter(Organization.id == "org-test-emp-b").first()
        if not org_emp_b:
            org_emp_b = Organization(id="org-test-emp-b", name="Employer Beta Logistics", type="employer", jurisdiction_code="MH-PUN")
            db.add(org_emp_b)

        db.flush()

        # Users
        users = [
            ("u-test-ben-a", "bena@test.lip", "9111111101", "beneficiary", "Citizen A"),
            ("u-test-ben-b", "benb@test.lip", "9111111102", "beneficiary", "Citizen B"),
            ("u-test-nag-admin", "admin@nag.test", "9111111103", "district_admin", "Admin Nagpur"),
            ("u-test-pun-admin", "admin@pun.test", "9111111104", "district_admin", "Admin Pune"),
            ("u-test-mh-state", "admin@mh.test", "9111111105", "state_admin", "Admin Maharashtra"),
            ("u-test-national", "admin@india.test", "9111111106", "ministry_admin", "Admin National"),
            ("u-test-worker-nag", "worker@nag.test", "9111111107", "field_worker", "Mobilizer Nagpur"),
            ("u-test-counsel-nag", "counsel@nag.test", "9111111108", "counsellor", "Counsellor Nagpur"),
            ("u-test-prov-a", "user@prova.test", "9111111109", "provider", "Coordinator Provider A"),
            ("u-test-emp-a", "hr@empa.test", "9111111110", "employer", "HR Employer A"),
        ]
        for uid, email, phone, role, name in users:
            u = db.query(User).filter(User.id == uid).first()
            if not u:
                u = User(id=uid, email=email, phone=phone, role=role, full_name=name, is_active=True)
                db.add(u)
        db.flush()

        # Memberships
        memberships = [
            ("u-test-nag-admin", "org-test-nag", "admin"),
            ("u-test-pun-admin", "org-test-pun", "admin"),
            ("u-test-mh-state", "org-test-state-mh", "admin"),
            ("u-test-worker-nag", "org-test-nag", "staff"),
            ("u-test-counsel-nag", "org-test-nag", "staff"),
            ("u-test-prov-a", "org-test-prov-a", "admin"),
            ("u-test-emp-a", "org-test-emp-a", "staff"),
        ]
        for uid, oid, mrole in memberships:
            m = db.query(Membership).filter(Membership.user_id == uid, Membership.organization_id == oid).first()
            if not m:
                m = Membership(user_id=uid, organization_id=oid, role=mrole, jurisdiction_scope="district")
                db.add(m)
        db.flush()

        # Beneficiaries linked via user_id
        ben_a = db.query(Beneficiary).filter(Beneficiary.id == "ben-profile-a").first()
        if not ben_a:
            ben_a = Beneficiary(id="ben-profile-a", user_id="u-test-ben-a", full_name="Citizen A", phone="9111111101", district_code="MH-NAG", state_code="MH")
            db.add(ben_a)
            prof_a = BeneficiaryProfile(beneficiary_id="ben-profile-a")
            db.add(prof_a)

        ben_b = db.query(Beneficiary).filter(Beneficiary.id == "ben-profile-b").first()
        if not ben_b:
            ben_b = Beneficiary(id="ben-profile-b", user_id="u-test-ben-b", full_name="Citizen B", phone="9111111102", district_code="MH-PUN", state_code="MH")
            db.add(ben_b)
            prof_b = BeneficiaryProfile(beneficiary_id="ben-profile-b")
            db.add(prof_b)

        ben_up = db.query(Beneficiary).filter(Beneficiary.id == "ben-profile-up").first()
        if not ben_up:
            ben_up = Beneficiary(id="ben-profile-up", user_id=None, full_name="Citizen UP", phone="9111111199", district_code="UP-VAR", state_code="UP")
            db.add(ben_up)
            prof_up = BeneficiaryProfile(beneficiary_id="ben-profile-up")
            db.add(prof_up)

        # Centers & Batches
        tc_a = db.query(TrainingCenter).filter(TrainingCenter.id == "tc-test-a").first()
        if not tc_a:
            tc_a = TrainingCenter(id="tc-test-a", organization_id="org-test-prov-a", name="Center Alpha", district_code="MH-NAG", address="MIDC Nagpur Test Area")
            db.add(tc_a)

        tc_b = db.query(TrainingCenter).filter(TrainingCenter.id == "tc-test-b").first()
        if not tc_b:
            tc_b = TrainingCenter(id="tc-test-b", organization_id="org-test-prov-b", name="Center Beta", district_code="MH-PUN", address="Pune Industrial Zone Test")
            db.add(tc_b)
        db.flush()

        db.commit()
    finally:
        db.close()


def test_beneficiary_user_ownership(setup_jurisdiction_fixtures):
    """User A owns Beneficiary A via Beneficiary.user_id; cannot access Beneficiary B (returns 403)."""
    token_a = create_access_token({"sub": "u-test-ben-a", "role": "beneficiary", "name": "Citizen A"})
    
    # User A accesses own profile -> 200
    res_own = client.get("/api/v1/beneficiaries/ben-profile-a", headers={"Authorization": f"Bearer {token_a}"})
    assert res_own.status_code == 200
    assert res_own.json()["id"] == "ben-profile-a"
    assert res_own.json()["user_id"] == "u-test-ben-a"

    # User A accesses own passport -> 200
    res_own_pass = client.get("/api/v1/beneficiaries/ben-profile-a/passport", headers={"Authorization": f"Bearer {token_a}"})
    assert res_own_pass.status_code == 200

    # User A accesses Beneficiary B -> 403 Forbidden
    res_other = client.get("/api/v1/beneficiaries/ben-profile-b", headers={"Authorization": f"Bearer {token_a}"})
    assert res_other.status_code == 403

    # User A accesses Beneficiary B passport -> 403 Forbidden
    res_other_pass = client.get("/api/v1/beneficiaries/ben-profile-b/passport", headers={"Authorization": f"Bearer {token_a}"})
    assert res_other_pass.status_code == 403


def test_beneficiaries_me_endpoint(setup_jurisdiction_fixtures):
    """GET /beneficiaries/me resolves the currently authenticated user's linked beneficiary."""
    token_a = create_access_token({"sub": "u-test-ben-a", "role": "beneficiary", "name": "Citizen A"})
    res = client.get("/api/v1/beneficiaries/me", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "ben-profile-a"
    assert data["user_id"] == "u-test-ben-a"
    assert data["full_name"] == "Citizen A"


def test_journey_me_endpoint(setup_jurisdiction_fixtures):
    """GET /journey/me resolves the currently authenticated user's journey home."""
    token_a = create_access_token({"sub": "u-test-ben-a", "role": "beneficiary", "name": "Citizen A"})
    res = client.get("/api/v1/journey/me", headers={"Authorization": f"Bearer {token_a}"})
    assert res.status_code == 200
    data = res.json()
    assert data["beneficiary_id"] == "ben-profile-a"
    assert "action_plan" in data


def test_jurisdiction_matrix(setup_jurisdiction_fixtures):
    """
    Verifies DB-derived jurisdiction authorization:
    - Nagpur district admin -> Nagpur PASS, Pune 403
    - Pune district admin -> Pune PASS, Nagpur 403
    - State admin MH -> Nagpur PASS, Pune PASS, UP 403
    - Ministry admin -> Nagpur PASS, Pune PASS, UP PASS
    - Field worker Nagpur -> Nagpur PASS, Pune 403
    - Counsellor Nagpur -> Nagpur PASS, Pune 403
    """
    token_nag_admin = create_access_token({"sub": "u-test-nag-admin", "role": "district_admin", "name": "Admin Nagpur"})
    token_pun_admin = create_access_token({"sub": "u-test-pun-admin", "role": "district_admin", "name": "Admin Pune"})
    token_mh_state = create_access_token({"sub": "u-test-mh-state", "role": "state_admin", "name": "Admin MH"})
    token_national = create_access_token({"sub": "u-test-national", "role": "ministry_admin", "name": "Admin India"})
    token_worker_nag = create_access_token({"sub": "u-test-worker-nag", "role": "field_worker", "name": "Worker Nagpur"})
    token_counsel_nag = create_access_token({"sub": "u-test-counsel-nag", "role": "counsellor", "name": "Counsellor Nagpur"})

    # Nagpur admin: Nagpur PASS, Pune 403
    res = client.get("/api/v1/beneficiaries/ben-profile-a", headers={"Authorization": f"Bearer {token_nag_admin}"})
    assert res.status_code == 200
    res_pun = client.get("/api/v1/beneficiaries/ben-profile-b", headers={"Authorization": f"Bearer {token_nag_admin}"})
    assert res_pun.status_code == 403

    # Pune admin: Pune PASS, Nagpur 403
    res = client.get("/api/v1/beneficiaries/ben-profile-b", headers={"Authorization": f"Bearer {token_pun_admin}"})
    assert res.status_code == 200
    res_nag = client.get("/api/v1/beneficiaries/ben-profile-a", headers={"Authorization": f"Bearer {token_pun_admin}"})
    assert res_nag.status_code == 403

    # State admin MH: Nagpur PASS, Pune PASS, UP 403
    res_mh_nag = client.get("/api/v1/beneficiaries/ben-profile-a", headers={"Authorization": f"Bearer {token_mh_state}"})
    assert res_mh_nag.status_code == 200
    res_mh_pun = client.get("/api/v1/beneficiaries/ben-profile-b", headers={"Authorization": f"Bearer {token_mh_state}"})
    assert res_mh_pun.status_code == 200
    res_mh_up = client.get("/api/v1/beneficiaries/ben-profile-up", headers={"Authorization": f"Bearer {token_mh_state}"})
    assert res_mh_up.status_code == 403

    # Ministry admin: Nagpur PASS, UP PASS
    res_nat_nag = client.get("/api/v1/beneficiaries/ben-profile-a", headers={"Authorization": f"Bearer {token_national}"})
    assert res_nat_nag.status_code == 200
    res_nat_up = client.get("/api/v1/beneficiaries/ben-profile-up", headers={"Authorization": f"Bearer {token_national}"})
    assert res_nat_up.status_code == 200

    # Field worker Nagpur: Nagpur PASS, Pune 403
    res_w_nag = client.get("/api/v1/beneficiaries/ben-profile-a", headers={"Authorization": f"Bearer {token_worker_nag}"})
    assert res_w_nag.status_code == 200
    res_w_pun = client.get("/api/v1/beneficiaries/ben-profile-b", headers={"Authorization": f"Bearer {token_worker_nag}"})
    assert res_w_pun.status_code == 403

    # Counsellor Nagpur: Nagpur PASS, Pune 403
    res_c_nag = client.get("/api/v1/beneficiaries/ben-profile-a", headers={"Authorization": f"Bearer {token_counsel_nag}"})
    assert res_c_nag.status_code == 200
    res_c_pun = client.get("/api/v1/beneficiaries/ben-profile-b", headers={"Authorization": f"Bearer {token_counsel_nag}"})
    assert res_c_pun.status_code == 403


def test_provider_organization_ownership(setup_jurisdiction_fixtures):
    """Provider A can create batches for Provider A centers, but is forbidden on Provider B centers."""
    token_prov_a = create_access_token({"sub": "u-test-prov-a", "role": "provider", "name": "Provider A"})

    # Provider A creates batch for Center A (owned) -> 200
    res_ok = client.post("/api/v1/opportunities/training-options", json={
        "center_id": "tc-test-a",
        "qualification_id": "dummy-qp",
        "batch_code": "BATCH-TEST-A1",
        "seat_capacity": 30,
        "seats_available": 30
    }, headers={"Authorization": f"Bearer {token_prov_a}"})
    assert res_ok.status_code == 200

    # Provider A tries to create batch for Center B (owned by Provider B) -> 403 Forbidden
    res_forbidden = client.post("/api/v1/opportunities/training-options", json={
        "center_id": "tc-test-b",
        "qualification_id": "dummy-qp",
        "batch_code": "BATCH-TEST-B1",
        "seat_capacity": 30,
        "seats_available": 30
    }, headers={"Authorization": f"Bearer {token_prov_a}"})
    assert res_forbidden.status_code == 403


def test_employer_organization_ownership(setup_jurisdiction_fixtures):
    """Employer A can post jobs for Employer A organization, but is forbidden on Employer B."""
    token_emp_a = create_access_token({"sub": "u-test-emp-a", "role": "employer", "name": "Employer A"})

    # Employer A posts job for Org A -> 200
    res_ok = client.post("/api/v1/opportunities/jobs", json={
        "organization_id": "org-test-emp-a",
        "title": "Mechanic Technician Alpha",
        "worksite_address": "Nagpur MIDC",
        "monthly_wage_inr": 16000,
        "vacancies": 3
    }, headers={"Authorization": f"Bearer {token_emp_a}"})
    assert res_ok.status_code == 200

    # Employer A tries to post job for Org B -> 403 Forbidden
    res_forbidden = client.post("/api/v1/opportunities/jobs", json={
        "organization_id": "org-test-emp-b",
        "title": "Unauthorized Job",
        "worksite_address": "Pune Hub",
        "monthly_wage_inr": 18000,
        "vacancies": 2
    }, headers={"Authorization": f"Bearer {token_emp_a}"})
    assert res_forbidden.status_code == 403


def test_consent_authorization_guard(setup_jurisdiction_fixtures):
    """Anonymous callers cannot record consent; only beneficiary self or authorized staff in jurisdiction can."""
    # Anonymous -> 401 Unauthorized
    res_anon = client.post("/api/v1/identity/consent", json={
        "beneficiary_id": "ben-profile-a",
        "purpose": "livelihood_profiling"
    })
    assert res_anon.status_code == 401

    # Beneficiary A recording consent for Beneficiary A -> 200
    token_a = create_access_token({"sub": "u-test-ben-a", "role": "beneficiary", "name": "Citizen A"})
    res_self = client.post("/api/v1/identity/consent", json={
        "beneficiary_id": "ben-profile-a",
        "purpose": "livelihood_profiling"
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert res_self.status_code == 200
    assert res_self.json()["status"] == "consent_recorded"

    # Beneficiary A attempting to record consent for Beneficiary B -> 403 Forbidden
    res_other = client.post("/api/v1/identity/consent", json={
        "beneficiary_id": "ben-profile-b",
        "purpose": "livelihood_profiling"
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert res_other.status_code == 403

    # Nagpur Mobilizer recording consent for Beneficiary A (in Nagpur) -> 200
    token_worker = create_access_token({"sub": "u-test-worker-nag", "role": "field_worker", "name": "Worker Nagpur"})
    res_worker_nag = client.post("/api/v1/identity/consent", json={
        "beneficiary_id": "ben-profile-a",
        "purpose": "field_assisted_profiling"
    }, headers={"Authorization": f"Bearer {token_worker}"})
    assert res_worker_nag.status_code == 200

    # Nagpur Mobilizer attempting to record consent for Beneficiary B (in Pune) -> 403 Forbidden
    res_worker_pun = client.post("/api/v1/identity/consent", json={
        "beneficiary_id": "ben-profile-b",
        "purpose": "cross_district_consent"
    }, headers={"Authorization": f"Bearer {token_worker}"})
    assert res_worker_pun.status_code == 403


def test_seeded_ramesh_user_beneficiary_linkage():
    """Verify that seeded Ramesh User and Beneficiary are linked via foreign key."""
    from backend.app.seed import seed_database
    # seed_database() opens its own session and commits; run it before opening our query session
    # pass include_demo=True explicitly so the test is independent of DEMO_MODE env var
    seed_database(include_demo=True)
    db = SessionLocal()
    try:
        u_ramesh = db.query(User).filter(User.phone == "9876543210").first()
        b_ramesh = db.query(Beneficiary).filter(Beneficiary.phone == "9876543210").first()
        assert u_ramesh is not None, "Seeded Ramesh User must exist"
        assert b_ramesh is not None, "Seeded Ramesh Beneficiary must exist"
        assert b_ramesh.user_id == u_ramesh.id, "Beneficiary.user_id must equal User.id for Ramesh"
    finally:
        db.close()
