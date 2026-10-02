"use client";
import { useState } from "react";
import { ArrowRight, MapPin, ChevronDown, Fingerprint } from "lucide-react";
import { TruthBadge } from "./TruthBadge";
import { ReadAloudButton } from "./ReadAloudButton";

interface PathwayProps {
  pathway: {
    qualification_title: string; qp_code: string; nsqf_level: number;
    pathway_type: string; fit_band: string; overall_score: number;
    factor_scores: Record<string, number>;
    explanation_beneficiary: string; training_center_nearby?: string;
    distance_km?: number; has_live_batch?: boolean; batch_code?: string; truth_state?: string;
  };
  onSelect?: () => void;
  showCounterfactual?: boolean;
}
const factors: Record<string, string> = {skill_transfer: "Skill transfer", travel_mobility_fit: "Travel fit", local_demand_evidence: "Local demand", preference_alignment: "Work preference"};

export function LivingPathway({pathway, onSelect}: PathwayProps) {
  const [expanded, setExpanded] = useState(false);
  return <article className="pathway-sheet">
    <div className="pathway-topline"><span className="eyebrow">{pathway.pathway_type.replaceAll("_", " ")}</span><TruthBadge state={pathway.truth_state || "UNKNOWN"}/></div>
    <div className="pathway-title-row"><div><h3>{pathway.qualification_title}</h3><p>NSQF {pathway.nsqf_level} <span>·</span> {pathway.qp_code}</p></div><div className="fit-score"><strong>{Number.isFinite(pathway.overall_score) ? Math.round(pathway.overall_score * 100) : "—"}<small>%</small></strong><span>model fit</span></div></div>
    <p className="fit-band">{pathway.fit_band}</p>
    <section className="pathway-evidence"><div><Fingerprint size={19}/><h4>Why this path <span>हा मार्ग का?</span></h4><ReadAloudButton text={pathway.explanation_beneficiary}/></div><p>{pathway.explanation_beneficiary}</p></section>
    <div className="pathway-location"><MapPin size={17}/><p>{pathway.training_center_nearby || "Training centre not yet confirmed"}{typeof pathway.distance_km === "number" ? ` · ${pathway.distance_km} km` : ""}<small>{pathway.has_live_batch ? "Batch listed · confirm availability with provider" : "Catalogue option · enrolment not confirmed"}</small></p></div>
    <button className="factor-toggle" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>Inspect recommendation factors <ChevronDown size={16}/></button>
    {expanded && <dl className="factor-grid">{Object.entries(factors).map(([key,label]) => <div key={key}><dt>{label}</dt><dd>{Number.isFinite(pathway.factor_scores?.[key]) ? Math.round(pathway.factor_scores[key] * 100) + "%" : "Not supplied"}</dd></div>)}</dl>}
    <footer><p>Recommendation, not a job or certification guarantee.</p>{onSelect && <button onClick={onSelect} className="civic-button">निवडा · Choose Path <ArrowRight size={17}/></button>}</footer>
  </article>;
}
