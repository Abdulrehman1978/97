"""
Database Seed Script: Initializes official reference data and optional deterministic demo data.
Includes:
- Official Reference Sources (NQR, NCO-2015, PM-AJAY GIA Guidelines, ODOP/MSME Clusters)
- Admin Areas & Geographic boundaries
- NCO-2015 standard occupations
- Canonical skills with multilingual aliases (Hindi, Marathi, English)
- NQR Qualifications with official validity dates
- PM-AJAY GIA programs and funding scheme rules
- Local economic signals
- Optional Demo data (isolated behind settings.DEMO_MODE)
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import SessionLocal
from backend.app.identity.models import User, Organization, Membership, Consent
from backend.app.beneficiary.models import Beneficiary, BeneficiaryProfile, WorkExperience, BeneficiarySkill
from backend.app.knowledge.models import (
    Skill, SkillAlias, Occupation, OccupationSkill,
    Qualification, QualificationCompetency, OccupationQualification, Program
)
from backend.app.opportunities.models import AdminArea, TrainingCenter, TrainingOption, EmployerOpportunity, LocalEconomicSignal
from backend.app.admin.models import Source
from backend.app.shared.security import hash_password


def ensure_authenticated_users(db: Session):
    """Seed demo users only when DEMO_MODE is active."""
    if not settings.DEMO_MODE:
        print("[SEED] DEMO_MODE is disabled. Skipping demo user credential generation.")
        return

    users_to_ensure = [
        {"email": "admin@nagpur.gov.in", "phone": "9000000001", "full_name": "Nagpur District Skill Committee Admin", "role": "district_admin", "password": "admin123"},
        {"email": "worker@nagpur.gov.in", "phone": "9000000002", "full_name": "Sunita Patil (Field Mobilizer)", "role": "field_worker", "password": "worker123"},
        {"email": "counsellor@nagpur.gov.in", "phone": "9000000003", "full_name": "Dr. Aniket Deshmukh (Livelihood Counsellor)", "role": "counsellor", "password": "counsel123"},
        {"email": "finance@nagpur.gov.in", "phone": "9000000004", "full_name": "Pooja Sharma (Lead Bank Financial Counsellor)", "role": "financial_counsellor", "password": "finance123"},
        {"email": "provider@pmkk.gov.in", "phone": "9000000005", "full_name": "Vidarbha Skills Center Coordinator", "role": "provider", "password": "provider123"},
        {"email": "employer@mahavitaran.com", "phone": "9000000006", "full_name": "Bajaj & Mahindra Auto HR Representative", "role": "employer", "password": "employer123"},
        {"email": "ramesh@beneficiary.lip", "phone": "9876543210", "full_name": "Ramesh Mesram", "role": "beneficiary", "password": "ramesh123"}
    ]
    for u_spec in users_to_ensure:
        u = db.query(User).filter((User.email == u_spec["email"]) | (User.phone == u_spec["phone"])).first()
        if not u:
            u = User(
                email=u_spec["email"],
                phone=u_spec["phone"],
                full_name=u_spec["full_name"],
                role=u_spec["role"],
                hashed_password=hash_password(u_spec["password"]),
                is_active=True
            )
            db.add(u)
    db.commit()


def seed_reference_data(db: Session):
    """Seed official taxonomies and national standards (NCO-2015, NQR, PM-AJAY GIA norms)."""
    if db.query(Source).first():
        print("[SEED] Reference data already exists. Skipping.")
        return

    print("[SEED] Seeding Official Reference Sources...")
    s1 = Source(
        publisher="NCVET / MSDE",
        source_name="National Qualifications Register (NQR)",
        canonical_url="https://nqr.gov.in",
        freshness_sla_days=30,
        quality_status="healthy",
        notes="Authoritative registry of NSQF-aligned qualifications and NOS competencies."
    )
    s2 = Source(
        publisher="Directorate General of Employment (DGE)",
        source_name="National Classification of Occupations 2015 (NCO-2015)",
        canonical_url="https://dge.gov.in",
        freshness_sla_days=365,
        quality_status="healthy",
        notes="Occupational divisions, groups, and 8-digit codes."
    )
    s3 = Source(
        publisher="Ministry of Social Justice and Empowerment (MoSJE)",
        source_name="PM-AJAY Scheme Operational Guidelines 2023-26",
        canonical_url="https://socialjustice.gov.in",
        freshness_sla_days=90,
        quality_status="healthy",
        notes="Guidelines for Grants-in-Aid (GIA) component and Adarsh Gram."
    )
    s4 = Source(
        publisher="DPIIT, Ministry of Commerce",
        source_name="One District One Product (ODOP) & MSME Clusters",
        canonical_url="https://www.odop.org.in",
        freshness_sla_days=60,
        quality_status="healthy",
        notes="District-level priority economic products and value chains."
    )
    db.add_all([s1, s2, s3, s4])
    db.flush()

    print("[SEED] Seeding Admin Areas...")
    dist_nagpur = AdminArea(code="MH-NAG", name="Nagpur", area_type="district", state_code="MH", latitude=21.1458, longitude=79.0882)
    dist_pune = AdminArea(code="MH-PUN", name="Pune", area_type="district", state_code="MH", latitude=18.5204, longitude=73.8567)
    dist_varanasi = AdminArea(code="UP-VAR", name="Varanasi", area_type="district", state_code="UP", latitude=25.3176, longitude=82.9739)
    db.add_all([dist_nagpur, dist_pune, dist_varanasi])
    db.flush()

    print("[SEED] Seeding Programs & Financial Schemes...")
    prog_gia = Program(
        code="PM-AJAY-GIA",
        name="PM-AJAY Grants-in-Aid Component",
        ministry="Ministry of Social Justice and Empowerment",
        target_group="Scheduled Caste Beneficiaries",
        benefits_summary="Grants for socio-economic development, skill training, and asset generation for SC beneficiaries.",
        eligibility_rules={
            "stipend_per_day": 150,
            "max_tool_grant": 50000,
            "training_cost_coverage_pct": 100,
            "target_retention_days": [30, 90, 180, 365],
            "target_community": "SC",
            "max_annual_family_income_inr": 250000,
            "min_age": 18,
            "max_age": 45
        },
        indicative_subsidy_percentage=100.0,
        max_subsidy_amount_inr=50000.0,
        source_citation="PM-AJAY Scheme Operational Guidelines 2023-26"
    )
    prog_rpl = Program(
        code="NSQF-RPL-BRIDGE",
        name="Recognition of Prior Learning (RPL) & Bridge Certification",
        ministry="Ministry of Skill Development and Entrepreneurship",
        target_group="Informal SC Artisans & Mechanics",
        benefits_summary="Formal assessment and certification of prior informal work experience with 30-hour bridge courses.",
        eligibility_rules={
            "assessment_fee_sponsored": True,
            "reward_money_candidate": 500,
            "accidental_insurance_months": 36,
            "min_prior_experience_months": 12,
            "min_age": 18
        },
        indicative_subsidy_percentage=100.0,
        max_subsidy_amount_inr=5000.0,
        source_citation="MSDE PMKVY 4.0 RPL Guidelines"
    )
    prog_odop = Program(
        code="ODOP-MSME-GRANT",
        name="One District One Product Livelihood Grant Linkage",
        ministry="Ministry of Commerce & Industry",
        target_group="SC Micro-Entrepreneurs in ODOP Clusters",
        benefits_summary="Assistance for micro-enterprises operating in ODOP focus value chains.",
        eligibility_rules={
            "capital_subsidy_pct": 35,
            "max_loan_linkage_inr": 200000,
            "sector_match_required": True
        },
        indicative_subsidy_percentage=35.0,
        max_subsidy_amount_inr=200000.0,
        source_citation="DPIIT ODOP Scheme Framework"
    )
    db.add_all([prog_gia, prog_rpl, prog_odop])
    db.flush()

    print("[SEED] Seeding Canonical Skills with Multilingual Aliases...")
    sk_engine = Skill(canonical_name="Two-Wheeler Engine Overhaul", category="Mechanical", description="Disassembling, repairing, and tuning two-wheeler internal combustion engines.")
    sk_brake = Skill(canonical_name="Brake System Maintenance", category="Mechanical", description="Inspecting, repairing drum and disc brakes, fluid replacement, shoe adjustment.")
    sk_tools = Skill(canonical_name="Workshop Hand & Pneumatic Tools Operation", category="Mechanical", description="Proficiency with torque wrenches, spanners, pneumatic impact guns, and compressors.")
    sk_sewing = Skill(canonical_name="Industrial Sewing Machine Operation", category="Textiles", description="Operating single and multi-needle motorized sewing machines for garments.", is_traditional_craft=True)
    sk_pattern = Skill(canonical_name="Pattern Drafting & Fabric Cutting", category="Textiles", description="Taking measurements, drafting paper patterns, and precision fabric shearing.", is_traditional_craft=True)
    sk_solar = Skill(canonical_name="Solar PV Panel Installation & Inverter Wiring", category="Electrical", description="Mounting solar modules, civil structure fixing, DC/AC inverter cabling and earthing.")
    sk_digital = Skill(canonical_name="Digital Merchant UPI & Ledger Logging", category="Retail", description="Using QR merchant apps, SMS payment verification, and basic digital transaction logging.")
    db.add_all([sk_engine, sk_brake, sk_tools, sk_sewing, sk_pattern, sk_solar, sk_digital])
    db.flush()

    # Multilingual aliases
    aliases = [
        # Engine Overhaul
        SkillAlias(skill_id=sk_engine.id, alias_text="इंजिन दुरुस्ती", language_code="mr", confidence=1.0),
        SkillAlias(skill_id=sk_engine.id, alias_text="इंजिन खोलणे", language_code="mr", confidence=0.95),
        SkillAlias(skill_id=sk_engine.id, alias_text="इंजन की मरम्मत", language_code="hi", confidence=1.0),
        SkillAlias(skill_id=sk_engine.id, alias_text="bike engine repair", language_code="en", confidence=1.0),
        SkillAlias(skill_id=sk_engine.id, alias_text="piston valve setting", language_code="en", confidence=0.9),

        # Brake System
        SkillAlias(skill_id=sk_brake.id, alias_text="ब्रेक काम", language_code="mr", confidence=1.0),
        SkillAlias(skill_id=sk_brake.id, alias_text="ब्रेक शू बदलणे", language_code="mr", confidence=1.0),
        SkillAlias(skill_id=sk_brake.id, alias_text="ब्रेक बनाना", language_code="hi", confidence=1.0),
        SkillAlias(skill_id=sk_brake.id, alias_text="brake pad replacement", language_code="en", confidence=1.0),

        # Tools
        SkillAlias(skill_id=sk_tools.id, alias_text="पाने आणि रेंच", language_code="mr", confidence=0.95),
        SkillAlias(skill_id=sk_tools.id, alias_text="हवेचा कॉम्प्रेसर", language_code="mr", confidence=0.9),
        SkillAlias(skill_id=sk_tools.id, alias_text="पाना रेंच चलाना", language_code="hi", confidence=0.95),

        # Tailoring
        SkillAlias(skill_id=sk_sewing.id, alias_text="सिलाई मशीन चालवणे", language_code="mr", confidence=1.0),
        SkillAlias(skill_id=sk_sewing.id, alias_text="सिलाई काम", language_code="hi", confidence=1.0),
        SkillAlias(skill_id=sk_pattern.id, alias_text="कापड कटिंग", language_code="mr", confidence=1.0),
        SkillAlias(skill_id=sk_pattern.id, alias_text="ब्लाउज कटिंग", language_code="mr", confidence=1.0),

        # Solar & Digital
        SkillAlias(skill_id=sk_solar.id, alias_text="सोलर पॅनेल बसवणे", language_code="mr", confidence=1.0),
        SkillAlias(skill_id=sk_solar.id, alias_text="सोलर वायरिंग", language_code="hi", confidence=1.0),
        SkillAlias(skill_id=sk_digital.id, alias_text="फोन पे गुगल पे चालवणे", language_code="mr", confidence=1.0),
        SkillAlias(skill_id=sk_digital.id, alias_text="डिजिटल पेमेंट लेना", language_code="hi", confidence=1.0)
    ]
    db.add_all(aliases)
    db.flush()

    print("[SEED] Seeding Occupations (NCO-2015)...")
    occ_mechanic = Occupation(
        nco_code="7231.0100",
        title="Two-Wheeler Service Technician",
        sector="Automotive",
        description="Performs routine maintenance, fault diagnostics, engine overhaul, and brake servicing on motorcycles and scooters.",
        nco_division="72"
    )
    occ_tailor = Occupation(
        nco_code="7531.0100",
        title="Self Employed Tailor",
        sector="Apparel",
        description="Designs, cuts, fits, and sews custom garments using motorized or pedal sewing machines.",
        nco_division="75"
    )
    occ_solar = Occupation(
        nco_code="7421.0300",
        title="Solar PV Installation Helper",
        sector="Renewable Energy",
        description="Assists in mechanical assembly and electrical cabling of rooftop and ground-mounted solar panels.",
        nco_division="74"
    )
    db.add_all([occ_mechanic, occ_tailor, occ_solar])
    db.flush()

    print("[SEED] Seeding NQR Qualifications with Validity Windows...")
    now = datetime.now(timezone.utc)
    q_auto = Qualification(
        qp_code="ASC/Q1411",
        title="Two Wheeler Service Technician",
        awarding_body="Automotive Skills Development Council (ASDC)",
        nsqf_level=4,
        validity_status="current",
        effective_from=now - timedelta(days=730),
        effective_to=now + timedelta(days=730),
        duration_hours=450,
        min_education="class_8",
        rpl_eligible=True
    )
    q_tailor = Qualification(
        qp_code="AMH/Q1947",
        title="Self Employed Tailor",
        awarding_body="Apparel, Made-Ups & Home Furnishing Sector Skill Council",
        nsqf_level=4,
        validity_status="current",
        effective_from=now - timedelta(days=600),
        effective_to=now + timedelta(days=500),
        duration_hours=360,
        min_education="unlettered",
        rpl_eligible=True
    )
    # Expired qualification to test exclusion logic
    q_expired = Qualification(
        qp_code="ASC/Q1401-LEGACY",
        title="Two Wheeler Repair Assistant (Legacy Standard)",
        awarding_body="Automotive Skills Development Council (ASDC)",
        nsqf_level=3,
        validity_status="expired",
        effective_from=now - timedelta(days=1500),
        effective_to=now - timedelta(days=200),
        duration_hours=300,
        min_education="class_8",
        rpl_eligible=True
    )
    db.add_all([q_auto, q_tailor, q_expired])
    db.flush()

    # NOS Competencies
    comp_engine = QualificationCompetency(qualification_id=q_auto.id, nos_code="ASC/N1418", nos_title="Overhaul and repair two-wheeler engine assemblies", competency_type="core_technical")
    comp_brake = QualificationCompetency(qualification_id=q_auto.id, nos_code="ASC/N1419", nos_title="Service and overhaul two-wheeler brake systems", competency_type="core_technical")
    comp_electrical = QualificationCompetency(qualification_id=q_auto.id, nos_code="ASC/N1420", nos_title="Diagnose and service two-wheeler electrical units", competency_type="core_technical")
    comp_soft = QualificationCompetency(qualification_id=q_auto.id, nos_code="ASC/N9901", nos_title="Organize work and maintain health, safety and clean workshop", competency_type="health_safety")
    db.add_all([comp_engine, comp_brake, comp_electrical, comp_soft])

    # Occupation-Skill Mappings
    db.add_all([
        OccupationSkill(occupation_id=occ_mechanic.id, skill_id=sk_engine.id, importance="mandatory"),
        OccupationSkill(occupation_id=occ_mechanic.id, skill_id=sk_brake.id, importance="mandatory"),
        OccupationSkill(occupation_id=occ_mechanic.id, skill_id=sk_tools.id, importance="mandatory"),
        OccupationSkill(occupation_id=occ_mechanic.id, skill_id=sk_digital.id, importance="optional"),
        OccupationSkill(occupation_id=occ_tailor.id, skill_id=sk_sewing.id, importance="mandatory"),
        OccupationSkill(occupation_id=occ_tailor.id, skill_id=sk_pattern.id, importance="mandatory"),
        OccupationSkill(occupation_id=occ_tailor.id, skill_id=sk_digital.id, importance="optional")
    ])

    # Occupation-Qualification Alignment
    db.add_all([
        OccupationQualification(occupation_id=occ_mechanic.id, qualification_id=q_auto.id, alignment_score=0.95),
        OccupationQualification(occupation_id=occ_tailor.id, qualification_id=q_tailor.id, alignment_score=0.95)
    ])

    # Local economic signals
    sig_odop = LocalEconomicSignal(
        district_code="MH-NAG",
        signal_type="odop_product",
        sector="Agriculture & Food Processing",
        title="Nagpur Mandarin Orange & Agro-Processing Cluster",
        description="High seasonal demand for maintenance technicians, cold storage mechanics and transport fleets.",
        intensity_score=0.88,
        freshness_status="fresh"
    )
    sig_msme = LocalEconomicSignal(
        district_code="MH-NAG",
        signal_type="msme_cluster",
        sector="Automotive & Light Engineering",
        title="MIDC Hingna Auto Ancillary & Service Cluster",
        description="Dense concentration of 180+ service centers and components suppliers with acute shortage of certified electrical technicians.",
        intensity_score=0.92,
        freshness_status="fresh"
    )
    db.add_all([sig_odop, sig_msme])
    db.commit()
    print("[SEED] Reference data seeding completed successfully!")


def seed_demo_data(db: Session):
    """Seed synthetic demonstration organizations, training centers, and personas for judge testing."""
    if not settings.DEMO_MODE:
        print("[SEED] DEMO_MODE=False. Production isolation: Skipping synthetic demo operational data.")
        return

    # Ensure demo authenticated accounts exist before personas to link foreign keys.
    # Must happen BEFORE the early-exit check so user_id FK repairs can run.
    ensure_authenticated_users(db)

    existing_ben = db.query(Beneficiary).filter(Beneficiary.phone == "9876543210").first()
    if existing_ben:
        # Repair user_id FK in case beneficiary was seeded before users (legacy broken seed)
        if existing_ben.user_id is None:
            u_ramesh = db.query(User).filter(User.phone == "9876543210").first()
            if u_ramesh:
                existing_ben.user_id = u_ramesh.id
                db.commit()
                print(f"[SEED] Repaired Ramesh Beneficiary.user_id -> {u_ramesh.id}")
        print("[SEED] Demo persona already exists. Skipping demo seed.")
        return
    u_ramesh = db.query(User).filter(User.phone == "9876543210").first()

    print("[SEED] Seeding Demo Organizations and Centers...")
    org_provider = Organization(
        name="Vidarbha Skills Academy & PMKK Center",
        type="provider",
        jurisdiction_code="MH-NAG",
        verification_status="verified"
    )
    org_employer = Organization(
        name="Mahindra First Choice / Bajaj Auto Service Network",
        type="employer",
        jurisdiction_code="MH-NAG",
        verification_status="verified"
    )
    org_district = Organization(
        name="District Skill Committee (DSC) Nagpur",
        type="district_admin",
        jurisdiction_code="MH-NAG",
        verification_status="verified"
    )
    db.add_all([org_provider, org_employer, org_district])
    db.flush()

    tc_nagpur = TrainingCenter(
        organization_id=org_provider.id,
        name="Nagpur Central Livelihood & Skilling Center",
        district_code="MH-NAG",
        address="Plot 14, MIDC Industrial Area, Hingna Road, Nagpur",
        has_wheelchair_access=True,
        has_women_hostel=True,
        contact_phone="0712-2541099",
        latitude=21.1250,
        longitude=79.0250
    )
    db.add(tc_nagpur)
    db.flush()

    q_auto = db.query(Qualification).filter(Qualification.qp_code == "ASC/Q1411").first()
    q_tailor = db.query(Qualification).filter(Qualification.qp_code == "AMH/Q1947").first()

    if q_auto:
        to_auto_live = TrainingOption(
            center_id=tc_nagpur.id,
            qualification_id=q_auto.id,
            batch_code="PM-AJAY-NAG-2026-B1",
            is_verified_live_batch=True,
            truth_state="DEMO_DATA",
            seat_capacity=30,
            seats_available=14,
            start_date=datetime.now(timezone.utc) + timedelta(days=12),
            end_date=datetime.now(timezone.utc) + timedelta(days=102),
            fee_type="100% Free under PM-AJAY GIA"
        )
        db.add(to_auto_live)

    if q_tailor:
        to_tailor_live = TrainingOption(
            center_id=tc_nagpur.id,
            qualification_id=q_tailor.id,
            batch_code="PM-AJAY-NAG-2026-T1",
            is_verified_live_batch=True,
            truth_state="DEMO_DATA",
            seat_capacity=25,
            seats_available=8,
            start_date=datetime.now(timezone.utc) + timedelta(days=15),
            end_date=datetime.now(timezone.utc) + timedelta(days=85),
            fee_type="100% Free under PM-AJAY GIA"
        )
        db.add(to_tailor_live)

    opp_auto = EmployerOpportunity(
        organization_id=org_employer.id,
        title="Junior Two-Wheeler Maintenance Technician",
        opportunity_type="job",
        nco_code="7231.0100",
        qualification_id=q_auto.id if q_auto else None,
        district_code="MH-NAG",
        worksite_address="Hingna Automotive Hub, Nagpur",
        monthly_wage_inr=16500,
        vacancies=6,
        is_accessible_workplace=True,
        truth_state="DEMO_DATA"
    )
    db.add(opp_auto)
    db.flush()

    print("[SEED] Seeding Golden Demo Beneficiary: Rural Informal Mechanic (Ramesh Mesram)...")
    b1 = Beneficiary(
        user_id=u_ramesh.id if u_ramesh else None,
        full_name="Ramesh Mesram",
        phone="9876543210",
        state_code="MH",
        district_code="MH-NAG",
        block_name="Hingna",
        village_name="Nildoh",
        gender="male",
        age=22,
        primary_language="mr"
    )
    db.add(b1)
    db.flush()

    p1 = BeneficiaryProfile(
        beneficiary_id=b1.id,
        education={
            "highest_level": "class_10",
            "has_formal_certificate": False,
            "specialization": None
        },
        aspirations={
            "preferred_sector": "Automotive",
            "primary_goal": "steady_wage_then_workshop",
            "desired_monthly_income_band": "14000-18000"
        },
        work_preferences={
            "wage_vs_self_employment": "hybrid",
            "work_environment": "workshop_or_local",
            "time_commitment": "full_time"
        },
        mobility={
            "max_travel_distance_km": 15,
            "can_relocate_district": False,
            "has_transport": True
        },
        availability={
            "daily_hours_available": 8,
            "caregiving_duties": False,
            "preferred_timing": "daytime"
        },
        accessibility={
            "has_mobility_impairment": False,
            "requires_wheelchair_access": False,
            "has_visual_audio_impairment": False,
            "assistive_tech_needed": None
        },
        household_context={
            "family_trade": "Informal Mechanic / Daily Wage",
            "economic_status": "BPL / SC Community",
            "pm_ajay_eligible": True
        },
        language_preferences={
            "spoken": "mr",
            "audio_read_aloud": True,
            "low_literacy_mode": False
        }
    )
    db.add(p1)

    exp1 = WorkExperience(
        beneficiary_id=b1.id,
        title="Informal Assistant at Roadside Garage",
        informal_sector="Automotive",
        duration_months=36,
        tasks_performed=["Two-wheeler engine overhaul", "Brake shoe replacement", "Air filter and carburettor cleaning"],
        tools_used=["Ring spanner set", "T-handle wrench", "Compressor nozzle", "Pliers"],
        responsibility_level="independent_and_assisted",
        raw_utterance="मी 3 वर्षे वडिलांच्या गॅरेजमध्ये काम करतोय. इंजिन उघडणे, ऑइल बदलणे, ब्रेकचे काम मला चांगले जमते. पण वायरिंग समजायला थोडे कठीण जाते.",
        is_verified=True
    )
    db.add(exp1)

    # Beneficiary skills
    sk_engine = db.query(Skill).filter(Skill.canonical_name == "Two-Wheeler Engine Overhaul").first()
    sk_brake = db.query(Skill).filter(Skill.canonical_name == "Brake System Maintenance").first()
    sk_tools = db.query(Skill).filter(Skill.canonical_name == "Workshop Hand & Pneumatic Tools Operation").first()

    if sk_engine and sk_brake and sk_tools:
        bs1 = BeneficiarySkill(beneficiary_id=b1.id, skill_id=sk_engine.id, proficiency_band="competent", confidence_score=0.92, verification_status="beneficiary_confirmed", evidence_utterance="3 years engine overhaul experience")
        bs2 = BeneficiarySkill(beneficiary_id=b1.id, skill_id=sk_brake.id, proficiency_band="competent", confidence_score=0.95, verification_status="beneficiary_confirmed", evidence_utterance="Regularly handles brake shoes")
        bs3 = BeneficiarySkill(beneficiary_id=b1.id, skill_id=sk_tools.id, proficiency_band="competent", confidence_score=0.90, verification_status="beneficiary_confirmed", evidence_utterance="Uses shop tools daily")
        db.add_all([bs1, bs2, bs3])

    consent1 = Consent(
        beneficiary_id=b1.id,
        consent_version="v3.0",
        purpose="livelihood_profiling_and_opportunity_matching",
        is_granted=True,
        raw_audio_retention_opt_in=False,
        channel="pwa",
        language="mr"
    )
    db.add(consent1)
    db.flush()

    # Fetch users and link authoritative memberships
    u_admin = db.query(User).filter(User.email == "admin@nagpur.gov.in").first()
    u_worker = db.query(User).filter(User.email == "worker@nagpur.gov.in").first()
    u_counsellor = db.query(User).filter(User.email == "counsellor@nagpur.gov.in").first()
    u_finance = db.query(User).filter(User.email == "finance@nagpur.gov.in").first()
    u_provider = db.query(User).filter(User.email == "provider@pmkk.gov.in").first()
    u_employer = db.query(User).filter(User.email == "employer@mahavitaran.com").first()

    memberships_to_add = []
    if u_admin and not db.query(Membership).filter(Membership.user_id == u_admin.id, Membership.organization_id == org_district.id).first():
        memberships_to_add.append(Membership(user_id=u_admin.id, organization_id=org_district.id, role="admin", jurisdiction_scope="district"))
    if u_worker and not db.query(Membership).filter(Membership.user_id == u_worker.id, Membership.organization_id == org_district.id).first():
        memberships_to_add.append(Membership(user_id=u_worker.id, organization_id=org_district.id, role="staff", jurisdiction_scope="district"))
    if u_counsellor and not db.query(Membership).filter(Membership.user_id == u_counsellor.id, Membership.organization_id == org_district.id).first():
        memberships_to_add.append(Membership(user_id=u_counsellor.id, organization_id=org_district.id, role="staff", jurisdiction_scope="district"))
    if u_finance and not db.query(Membership).filter(Membership.user_id == u_finance.id, Membership.organization_id == org_district.id).first():
        memberships_to_add.append(Membership(user_id=u_finance.id, organization_id=org_district.id, role="staff", jurisdiction_scope="district"))
    if u_provider and not db.query(Membership).filter(Membership.user_id == u_provider.id, Membership.organization_id == org_provider.id).first():
        memberships_to_add.append(Membership(user_id=u_provider.id, organization_id=org_provider.id, role="admin", jurisdiction_scope="district"))
    if u_employer and not db.query(Membership).filter(Membership.user_id == u_employer.id, Membership.organization_id == org_employer.id).first():
        memberships_to_add.append(Membership(user_id=u_employer.id, organization_id=org_employer.id, role="staff", jurisdiction_scope="district"))

    if memberships_to_add:
        db.add_all(memberships_to_add)

    db.commit()
    print("[SEED] Demo data seeding completed successfully!")


def seed_database(include_demo: Optional[bool] = None):
    """Seed database with official reference data, and conditionally with demo personas."""
    db = SessionLocal()
    try:
        seed_reference_data(db)
        should_seed_demo = include_demo if include_demo is not None else settings.DEMO_MODE
        if should_seed_demo:
            seed_demo_data(db)
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
