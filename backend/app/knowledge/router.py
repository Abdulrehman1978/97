from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.knowledge.models import Skill, Occupation, Qualification, Program

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

@router.get("/skills")
def list_skills(q: Optional[str] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    """List canonical skills with optional keyword search."""
    query = db.query(Skill)
    if q:
        query = query.filter(Skill.canonical_name.ilike(f"%{q}%"))
    if category:
        query = query.filter(Skill.category == category)
    return [
        {
            "id": s.id,
            "canonical_name": s.canonical_name,
            "category": s.category,
            "complexity_level": s.complexity_level,
            "is_traditional_craft": s.is_traditional_craft
        }
        for s in query.all()
    ]

@router.get("/occupations")
def list_occupations(sector: Optional[str] = None, db: Session = Depends(get_db)):
    """List NCO-2015 occupational standards."""
    query = db.query(Occupation)
    if sector:
        query = query.filter(Occupation.sector.ilike(f"%{sector}%"))
    return [
        {
            "id": o.id,
            "nco_code": o.nco_code,
            "title": o.title,
            "sector": o.sector,
            "description": o.description
        }
        for o in query.all()
    ]

@router.get("/qualifications")
def list_qualifications(validity: Optional[str] = None, db: Session = Depends(get_db)):
    """List NSQF / NQR Qualifications with validity status."""
    query = db.query(Qualification)
    if validity:
        query = query.filter(Qualification.validity_status == validity)
    return [
        {
            "id": q.id,
            "qp_code": q.qp_code,
            "title": q.title,
            "nsqf_level": q.nsqf_level,
            "awarding_body": q.awarding_body,
            "validity_status": q.validity_status,
            "effective_to": q.effective_to.strftime("%Y-%m-%d") if q.effective_to else None,
            "min_education": q.min_education,
            "duration_hours": q.duration_hours,
            "rpl_eligible": q.rpl_eligible,
            "official_nqr_url": q.official_nqr_url
        }
        for q in query.all()
    ]

@router.get("/programs")
def list_programs(db: Session = Depends(get_db)):
    """List PM-AJAY GIA and allied enterprise support programs."""
    programs = db.query(Program).filter(Program.is_active == True).all()
    return [
        {
            "id": p.id,
            "code": p.code,
            "name": p.name,
            "ministry": p.ministry,
            "benefits_summary": p.benefits_summary,
            "max_subsidy_amount_inr": p.max_subsidy_amount_inr,
            "source_citation": p.source_citation
        }
        for p in programs
    ]
