# ADR-003: Hybrid Intelligence Pipeline and Hard Governance Guardrails

## Status
Accepted

## Context
Relying strictly on an LLM to decide statutory government benefits, calculate scheme eligibility, or recommend expired vocational courses leads to hallucinations, legal exposure, and discrimination. Conversely, rigid keyword forms alienate informal workers who cannot formulate bureaucratic terms.

## Decision
We implement a **Hybrid Intelligence Architecture**:
1. **Perception & Natural Language Processing (NLP)**:
   - Speech-to-Text (STT) and structured extraction parse unstructured spoken statements into candidate tasks, tools, and constraints.
   - Text is matched against canonical skill and occupational taxonomies (NCO-2015).
2. **Deterministic Governance & Hard Constraint Engine**:
   - Statutory eligibility rules (age thresholds, educational prerequisites, scheme criteria) and hard physical constraints (travel radius ceiling, mobility accessibility) are evaluated in deterministic code.
   - Qualification validity is verified against official NQR effective/expiration dates. Expired or superseded qualifications are excluded from active recommendations.
3. **Multi-Objective Constraint-Aware Ranking**:
   - Pathways are scored across inspectable, weighted factors: skill overlap, travel burden, local demand signals, and wage vs enterprise preference.
   - Counterfactual reasoning ("What-If" queries) is computed deterministically from real constraint deltas.
4. **Transparent Explainability & Human-in-the-Loop**:
   - Every recommendation provides plain-language reasons and evidence provenance.
   - Low confidence outputs automatically offer human counsellor escalation.

## Consequences
- Guaranteed elimination of fabricated scheme rules or expired course recommendations.
- Auditable factor traces for SIH judges and district officers.
- Graceful degradation: If hosted LLM APIs become unreachable, the system automatically falls back to deterministic rule-based ranking and tap interviews.
