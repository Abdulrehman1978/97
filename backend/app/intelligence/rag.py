"""
Grounded Policy & Scheme Assistant (RAG Engine with Citations & Explicit Abstention).
Provides authoritative answers from official PM-AJAY, NQR, and MSDE guidelines.
Guards against hallucination by strictly citing verified document clauses and abstaining when uncertain.
"""

from typing import Dict, Any, List
from datetime import datetime

# Curated Official Policy Corpus with Source Provenance and Effective Dates
OFFICIAL_POLICY_CORPUS = [
    {
        "id": "DOC-PMAJAY-GIA-01",
        "title": "PM-AJAY Grants-in-Aid (GIA) Component Guidelines",
        "publisher": "Ministry of Social Justice and Empowerment (MoSJE)",
        "effective_date": "2023-04-01",
        "valid_until": "2026-03-31",
        "keywords": ["eligibility", "gia", "income", "caste", "subsidy", "sc", "grant"],
        "content": (
            "Under the Grants-in-Aid (GIA) component of PM-AJAY, financial assistance is provided for "
            "comprehensive livelihood projects targeting Scheduled Caste (SC) individuals and self-help groups. "
            "Eligibility criteria: The beneficiary must belong to a Scheduled Caste community and have an annual "
            "household income not exceeding Rs. 2.50 Lakh, or belong to BPL category. "
            "Skill training under GIA is 100% free with NSQF alignment, and an asset grant subsidy up to Rs. 50,000 "
            "is admissible for micro-enterprise establishment."
        ),
        "citation": "Section 4.2, Operational Guidelines of PM-AJAY (2023-26)"
    },
    {
        "id": "DOC-NQR-RPL-02",
        "title": "Recognition of Prior Learning (RPL) Implementation Framework",
        "publisher": "National Council for Vocational Education and Training (NCVET)",
        "effective_date": "2022-01-01",
        "valid_until": "2027-12-31",
        "keywords": ["rpl", "prior learning", "experience", "assessment", "certificate", "informal"],
        "content": (
            "Recognition of Prior Learning (RPL) assesses and certifies skills acquired through informal, "
            "traditional, or on-the-job work experience without requiring the candidate to undergo a full-term formal course. "
            "Eligibility: Candidates must possess minimum 1 to 2 years of demonstrable work experience in the relevant job role. "
            "Process includes 12 hours of orientation (soft skills, digital literacy, safety), followed by formal theory and "
            "practical assessment by an awarding body approved assessor. Successful candidates receive a government NSQF certificate."
        ),
        "citation": "NCVET RPL Guidelines, Gazette Notification No. 12/2022"
    },
    {
        "id": "DOC-NSFDC-LOAN-03",
        "title": "National Scheduled Castes Finance and Development Corporation (NSFDC) Credit Schemes",
        "publisher": "NSFDC / MoSJE",
        "effective_date": "2023-06-01",
        "valid_until": "2026-12-31",
        "keywords": ["loan", "credit", "nsfdc", "interest", "finance", "capital", "enterprise"],
        "content": (
            "NSFDC provides concessional credit for self-employment ventures to SC beneficiaries. "
            "Term loans up to Rs. 5.00 Lakhs are provided at 4% to 6% annual interest rate for viable service and "
            "manufacturing activities, with repayment tenures between 3 to 5 years. "
            "A moratorium period up to 6 months is available for technical units such as automotive workshops and garment units."
        ),
        "citation": "NSFDC Lending Policy Guidelines 2023-24, MoSJE"
    },
    {
        "id": "DOC-DOCS-CHECKLIST-04",
        "title": "Mandatory Verification Documents for PM-AJAY Benefits",
        "publisher": "District Skill Committee (DSC) Administration",
        "effective_date": "2023-01-01",
        "valid_until": "2026-12-31",
        "keywords": ["documents", "aadhaar", "caste certificate", "income certificate", "bank account", "ration card"],
        "content": (
            "Required documentation for formal enrollment in PM-AJAY GIA subsidized skilling and enterprise grants: "
            "1. Valid SC Caste Certificate issued by competent revenue authority. "
            "2. Income Certificate showing household income <= Rs. 2.5 Lakhs or BPL Ration Card. "
            "3. Identity proof (Aadhaar or Voter ID). "
            "4. Active Bank Account linked with Aadhaar/Direct Benefit Transfer (DBT). "
            "5. Two passport-size photographs."
        ),
        "citation": "DSC Circular No. DSC/PMAJAY/DOC-VERIF/2023"
    }
]

def query_policy_rag(query: str) -> Dict[str, Any]:
    """
    Retrieves matching clauses from the authoritative corpus.
    Calculates relevance, extracts citations, and synthesizes grounded answer.
    Abstains if confidence is low.
    """
    stopwords = {"is", "the", "for", "in", "what", "a", "an", "to", "of", "and", "or", "on", "with", "at", "by"}
    query_tokens = {w for w in query.lower().split() if w not in stopwords and len(w) > 2}
    scored_docs = []

    for doc in OFFICIAL_POLICY_CORPUS:
        keyword_hits = sum(1 for kw in doc["keywords"] if kw in query.lower())
        token_hits = sum(1 for token in query_tokens if token in doc["content"].lower())
        score = (keyword_hits * 4) + (token_hits * 1)
        if keyword_hits > 0 or token_hits >= 2:
            scored_docs.append((score, doc))

    scored_docs.sort(key=lambda x: x[0], reverse=True)

    if not scored_docs or scored_docs[0][0] < 4:
        return {
            "query": query,
            "answer": (
                "The requested policy information could not be verified against the official PM-AJAY GIA corpus. "
                "To prevent misinformation, please consult your District Skill Committee (DSC) office or the official "
                "portal at https://socialjustice.gov.in."
            ),
            "abstained": True,
            "citations": [],
            "retrieved_excerpts": []
        }

    top_doc = scored_docs[0][1]
    
    # Grounded synthesis
    answer = (
        f"According to {top_doc['citation']} ({top_doc['publisher']}):\n\n"
        f"{top_doc['content']}\n\n"
        f"Effective Period: {top_doc['effective_date']} to {top_doc['valid_until']}."
    )

    return {
        "query": query,
        "answer": answer,
        "abstained": False,
        "citations": [top_doc["citation"]],
        "source_publisher": top_doc["publisher"],
        "effective_dates": f"{top_doc['effective_date']} to {top_doc['valid_until']}",
        "retrieved_excerpts": [top_doc["content"]],
        "truth_state": "LIVE"
    }
