"""
Database Seed Script: Initializes tables and seeds official standards and deterministic demo data.
Includes:
- NCO-2015 standard occupations
- Canonical skills with multilingual aliases (Hindi, Marathi, English)
- NQR Qualifications with official validity dates (including current and an expired qualification to test exclusion)
- PM-AJAY GIA and financial scheme rules
- Training Centers & options
- Local economic signals (ODOP and MSME cluster data)
- Sample demonstration personas
"""

from datetime import datetime, timedelta
from backend.app.database import engine, Base, SessionLocal
from backend.app.identity.models import User, Organization, Membership, Consent
from backend.app.beneficiary.models import Beneficiary, BeneficiaryProfile, WorkExperience, BeneficiarySkill
from backend.app.knowledge.models import Skill, SkillAlias, Occupation, OccupationSkill, Qualification, QualificationCompetency, OccupationQualification, Program
from backend.app.opportunities.models import AdminArea, TrainingCenter, TrainingOption, EmployerOpportunity, LocalEconomicSignal
from backend.app.admin.models import Source, AuditEvent

def seed_database():
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Skill).first():
            print("Database already contains data. Skipping re-seed.")
            return

        print("Seeding Official Reference Sources...")
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

        print("Seeding Admin Areas...")
        dist_nagpur = AdminArea(code="MH-NAG", name="Nagpur", area_type="district", state_code="MH", latitude=21.1458, longitude=79.0882)
        dist_pune = AdminArea(code="MH-PUN", name="Pune", area_type="district", state_code="MH", latitude=18.5204, longitude=73.8567)
        dist_varanasi = AdminArea(code="UP-VAR", name="Varanasi", area_type="district", state_code="UP", latitude=25.3176, longitude=82.9739)
        db.add_all([dist_nagpur, dist_pune, dist_varanasi])
        db.flush()

        print("Seeding Canonical Skills and Multilingual Aliases...")
        sk_engine = Skill(canonical_name="Two-Wheeler Engine Overhaul", category="Mechanical", complexity_level=3)
        sk_brake = Skill(canonical_name="Brake Shoe and Disc Maintenance", category="Mechanical", complexity_level=2)
        sk_wiring = Skill(canonical_name="Automotive Electrical Fault Tracing", category="Electrical", complexity_level=3)
        sk_tools = Skill(canonical_name="Pneumatic & Hand Tool Handling", category="Mechanical", complexity_level=1)
        sk_cust = Skill(canonical_name="Customer Work Estimation & Communication", category="Retail", complexity_level=2)
        
        sk_sewing = Skill(canonical_name="Garment Stitching & Seam Finishing", category="Textiles", complexity_level=2)
        sk_pattern = Skill(canonical_name="Pattern Drafting and Fabric Cutting", category="Textiles", complexity_level=3)
        sk_alter = Skill(canonical_name="Garment Fitting and Alteration", category="Textiles", complexity_level=2)

        sk_solar = Skill(canonical_name="Solar PV Module Mounting & Inverter Wiring", category="Electrical", complexity_level=3)
        sk_inventory = Skill(canonical_name="Barcode Scanning & Stock Counting", category="Logistics", complexity_level=1)

        db.add_all([sk_engine, sk_brake, sk_wiring, sk_tools, sk_cust, sk_sewing, sk_pattern, sk_alter, sk_solar, sk_inventory])
        db.flush()

        # Aliases
        aliases = [
            SkillAlias(skill_id=sk_engine.id, alias_text="मोटर सायकल इंजिन दुरुस्ती", language_code="mr"),
            SkillAlias(skill_id=sk_engine.id, alias_text="इंजन खोलना और फिट करना", language_code="hi"),
            SkillAlias(skill_id=sk_engine.id, alias_text="two wheeler engine repair", language_code="en"),
            SkillAlias(skill_id=sk_brake.id, alias_text="ब्रेक शू बदलणे", language_code="mr"),
            SkillAlias(skill_id=sk_brake.id, alias_text="ब्रेक शू बदलना", language_code="hi"),
            SkillAlias(skill_id=sk_wiring.id, alias_text="वायरिंग फॉल्ट शोधणे", language_code="mr"),
            SkillAlias(skill_id=sk_wiring.id, alias_text="गाड़ी की वायरिंग चेक करना", language_code="hi"),
            SkillAlias(skill_id=sk_sewing.id, alias_text="कपडे शिवणे", language_code="mr"),
            SkillAlias(skill_id=sk_sewing.id, alias_text="सिलाई मशीन चलाना", language_code="hi"),
            SkillAlias(skill_id=sk_pattern.id, alias_text="ब्लाउज आणि कपडे कटिंग", language_code="mr"),
            SkillAlias(skill_id=sk_solar.id, alias_text="सोलर पॅनेल बसवणे", language_code="mr"),
            SkillAlias(skill_id=sk_solar.id, alias_text="सोलर प्लेट लगाना", language_code="hi")
        ]
        db.add_all(aliases)
        db.flush()

        print("Seeding NCO-2015 Occupations...")
        occ_mechanic = Occupation(
            nco_code="7231.0100",
            title="Motorcycle and Two-Wheeler Mechanic",
            sector="Automotive",
            description="Inspects, repairs, overhauls and services motorcycles, scooters and three-wheelers."
        )
        occ_tailor = Occupation(
            nco_code="7531.0100",
            title="Tailor, Dressmaker and Custom Garment Maker",
            sector="Apparel & Textiles",
            description="Fabricates, fits and alters bespoke garments from pattern drafting to finish."
        )
        occ_solar = Occupation(
            nco_code="7411.0100",
            title="Solar Photovoltaic System Installer",
            sector="Renewable Energy",
            description="Installs, tests, and commissions rooftop and decentralized solar PV systems."
        )
        occ_warehouse = Occupation(
            nco_code="4321.0100",
            title="Warehouse Inventory Associate",
            sector="Logistics",
            description="Receives, records, stores, and issues goods within fulfillment centers."
        )
        db.add_all([occ_mechanic, occ_tailor, occ_solar, occ_warehouse])
        db.flush()

        # Link Occupation to Skills
        db.add_all([
            OccupationSkill(occupation_id=occ_mechanic.id, skill_id=sk_engine.id, importance="mandatory", weight=1.0),
            OccupationSkill(occupation_id=occ_mechanic.id, skill_id=sk_brake.id, importance="mandatory", weight=0.9),
            OccupationSkill(occupation_id=occ_mechanic.id, skill_id=sk_wiring.id, importance="critical", weight=0.85),
            OccupationSkill(occupation_id=occ_mechanic.id, skill_id=sk_tools.id, importance="mandatory", weight=0.7),
            OccupationSkill(occupation_id=occ_mechanic.id, skill_id=sk_cust.id, importance="preferred", weight=0.5),
            OccupationSkill(occupation_id=occ_tailor.id, skill_id=sk_sewing.id, importance="mandatory", weight=1.0),
            OccupationSkill(occupation_id=occ_tailor.id, skill_id=sk_pattern.id, importance="critical", weight=0.9),
            OccupationSkill(occupation_id=occ_tailor.id, skill_id=sk_alter.id, importance="preferred", weight=0.7),
            OccupationSkill(occupation_id=occ_solar.id, skill_id=sk_solar.id, importance="mandatory", weight=1.0),
            OccupationSkill(occupation_id=occ_solar.id, skill_id=sk_wiring.id, importance="critical", weight=0.8),
            OccupationSkill(occupation_id=occ_warehouse.id, skill_id=sk_inventory.id, importance="mandatory", weight=1.0)
        ])
        db.flush()

        print("Seeding NSQF / NQR Qualifications (Current and Expired)...")
        # 1. Current valid automotive qualification
        q_auto = Qualification(
            qp_code="ASC/Q1411",
            title="Automotive Two Wheeler Service Technician",
            nsqf_level=4,
            awarding_body="Automotive Skills Development Council (ASDC)",
            validity_status="current",
            effective_from=datetime(2023, 1, 1),
            effective_to=datetime(2028, 12, 31),
            min_education="class_8",
            duration_hours=450,
            rpl_eligible=True,
            official_nqr_url="https://nqr.gov.in/qualifications/ASC-Q1411"
        )
        # 2. Current valid tailoring qualification
        q_tailor = Qualification(
            qp_code="AMH/Q1947",
            title="Self Employed Tailor",
            nsqf_level=4,
            awarding_body="Apparel Made-Ups & Home Furnishing Sector Skill Council (AMHSSC)",
            validity_status="current",
            effective_from=datetime(2022, 6, 1),
            effective_to=datetime(2027, 5, 31),
            min_education="class_8",
            duration_hours=350,
            rpl_eligible=True,
            official_nqr_url="https://nqr.gov.in/qualifications/AMH-Q1947"
        )
        # 3. Current valid solar qualification
        q_solar = Qualification(
            qp_code="SGJ/Q0101",
            title="Solar PV Installer (Suryamitra)",
            nsqf_level=4,
            awarding_body="Skill Council for Green Jobs (SCGJ)",
            validity_status="current",
            effective_from=datetime(2023, 3, 1),
            effective_to=datetime(2028, 2, 28),
            min_education="class_10",
            duration_hours=300,
            rpl_eligible=True,
            official_nqr_url="https://nqr.gov.in/qualifications/SGJ-Q0101"
        )
        # 4. DELIBERATELY EXPIRED QUALIFICATION to prove validity filtering rule
        q_expired = Qualification(
            qp_code="CON/Q0101-LEGACY",
            title="Assistant Mason - Legacy (Expired)",
            nsqf_level=2,
            awarding_body="Construction Skill Development Council of India",
            validity_status="expired",
            effective_from=datetime(2018, 1, 1),
            effective_to=datetime(2022, 12, 31), # Expired!
            min_education="unlettered",
            duration_hours=200,
            rpl_eligible=False,
            official_nqr_url="https://nqr.gov.in/legacy/CON-Q0101"
        )
        db.add_all([q_auto, q_tailor, q_solar, q_expired])
        db.flush()

        # Link Competencies (NOS)
        db.add_all([
            QualificationCompetency(qualification_id=q_auto.id, nos_code="ASC/N1421", nos_title="Perform routine maintenance of two wheeler", competency_type="core_technical"),
            QualificationCompetency(qualification_id=q_auto.id, nos_code="ASC/N1422", nos_title="Diagnose and repair two wheeler electrical faults", competency_type="core_technical"),
            QualificationCompetency(qualification_id=q_auto.id, nos_code="ASC/N0001", nos_title="Plan and organize work to meet expected outcomes", competency_type="soft_skill"),
            QualificationCompetency(qualification_id=q_tailor.id, nos_code="AMH/N1947", nos_title="Draft and cut fabric as per measurement", competency_type="core_technical"),
            QualificationCompetency(qualification_id=q_tailor.id, nos_code="AMH/N1948", nos_title="Stitch and assemble components of garments", competency_type="core_technical"),
            QualificationCompetency(qualification_id=q_solar.id, nos_code="SGJ/N0101", nos_title="Site survey and solar rooftop installation", competency_type="core_technical")
        ])
        
        # Link Occupations to Qualifications
        db.add_all([
            OccupationQualification(occupation_id=occ_mechanic.id, qualification_id=q_auto.id, alignment_score=0.98),
            OccupationQualification(occupation_id=occ_tailor.id, qualification_id=q_tailor.id, alignment_score=0.95),
            OccupationQualification(occupation_id=occ_solar.id, qualification_id=q_solar.id, alignment_score=0.96)
        ])
        db.flush()

        print("Seeding PM-AJAY and Enterprise Support Programs...")
        p_gia = Program(
            code="PM-AJAY-GIA",
            name="Grants-in-Aid for Livelihood Projects (PM-AJAY)",
            ministry="Ministry of Social Justice and Empowerment",
            target_group="SC Households with income <= 2.5 Lakhs or BPL",
            benefits_summary="Comprehensive livelihood interventions: 100% subsidized NSQF skilling, asset creation grants up to Rs. 50,000, market linkage.",
            indicative_subsidy_percentage=100.0,
            max_subsidy_amount_inr=50000.0,
            is_active=True
        )
        p_nsfdc = Program(
            code="NSFDC-ELIS",
            name="NSFDC Educational Loan & Micro-Credit for SC Youth",
            ministry="Ministry of Social Justice and Empowerment",
            target_group="Scheduled Caste Entrepreneurs",
            benefits_summary="Concessional credit at 4% to 6% per annum for establishing micro-enterprises and service workshops.",
            indicative_subsidy_percentage=33.3,
            max_subsidy_amount_inr=200000.0,
            is_active=True
        )
        p_mudra = Program(
            code="MUDRA-SHISHU",
            name="Pradhan Mantri MUDRA Yojana (Shishu Loan)",
            ministry="Ministry of Finance",
            target_group="Micro-enterprises and informal artisans",
            benefits_summary="Collateral-free institutional working capital loans up to Rs. 50,000.",
            indicative_subsidy_percentage=0.0,
            max_subsidy_amount_inr=50000.0,
            is_active=True
        )
        db.add_all([p_gia, p_nsfdc, p_mudra])
        db.flush()

        print("Seeding Organizations, Training Centers & Batches...")
        org_provider = Organization(
            name="Vidarbha Skills Academy (Empanelled PIA)",
            type="training_provider",
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

        # Training Options: Live verified batch vs catalogue
        to_auto_live = TrainingOption(
            center_id=tc_nagpur.id,
            qualification_id=q_auto.id,
            batch_code="PM-AJAY-NAG-2026-B1",
            is_verified_live_batch=True,
            truth_state="LIVE",
            seat_capacity=30,
            seats_available=14,
            start_date=datetime.utcnow() + timedelta(days=12),
            end_date=datetime.utcnow() + timedelta(days=102),
            fee_type="100% Free under PM-AJAY GIA"
        )
        to_tailor_live = TrainingOption(
            center_id=tc_nagpur.id,
            qualification_id=q_tailor.id,
            batch_code="PM-AJAY-NAG-2026-T1",
            is_verified_live_batch=True,
            truth_state="LIVE",
            seat_capacity=25,
            seats_available=8,
            start_date=datetime.utcnow() + timedelta(days=15),
            end_date=datetime.utcnow() + timedelta(days=85),
            fee_type="100% Free under PM-AJAY GIA"
        )
        db.add_all([to_auto_live, to_tailor_live])
        db.flush()

        print("Seeding Opportunities and Local Economic Signals...")
        opp_auto = EmployerOpportunity(
            organization_id=org_employer.id,
            title="Junior Two-Wheeler Maintenance Technician",
            opportunity_type="job",
            nco_code="7231.0100",
            qualification_id=q_auto.id,
            district_code="MH-NAG",
            worksite_address="Hingna Automotive Hub, Nagpur",
            monthly_wage_inr=16500,
            vacancies=6,
            is_accessible_workplace=True,
            truth_state="DEMO_DATA"
        )
        db.add(opp_auto)

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
        db.flush()

        print("Seeding Golden Demo Beneficiary: Rural Informal Mechanic (Ramesh Mesram)...")
        b1 = Beneficiary(
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
        bs1 = BeneficiarySkill(beneficiary_id=b1.id, skill_id=sk_engine.id, proficiency_band="competent", confidence_score=0.92, verification_status="beneficiary_confirmed", evidence_utterance="3 years engine overhaul experience")
        bs2 = BeneficiarySkill(beneficiary_id=b1.id, skill_id=sk_brake.id, proficiency_band="competent", confidence_score=0.95, verification_status="beneficiary_confirmed", evidence_utterance="Regularly handles brake shoes")
        bs3 = BeneficiarySkill(beneficiary_id=b1.id, skill_id=sk_tools.id, proficiency_band="competent", confidence_score=0.90, verification_status="beneficiary_confirmed", evidence_utterance="Uses shop tools daily")
        db.add_all([bs1, bs2, bs3])

        # Consent record
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

        db.commit()
        print("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
