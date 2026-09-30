"use client";

import React, { useState } from "react";
import { CheckCircle2, ChevronRight, Sparkles, MapPin, Award, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { ReadAloudButton } from "./ReadAloudButton";
import { TruthBadge } from "./TruthBadge";

interface PathwayProps {
  pathway: {
    qualification_title: string;
    qp_code: string;
    nsqf_level: number;
    pathway_type: string;
    fit_band: string;
    overall_score: number;
    factor_scores: {
      skill_transfer: number;
      travel_mobility_fit: number;
      local_demand_evidence: number;
      preference_alignment: number;
    };
    explanation_beneficiary: string;
    training_center_nearby?: string;
    distance_km?: number;
    has_live_batch?: boolean;
    batch_code?: string;
  };
  onSelect?: () => void;
  showCounterfactual?: boolean;
}

export function LivingPathway({ pathway, onSelect, showCounterfactual = true }: PathwayProps) {
  const [simulatedRadius, setSimulatedRadius] = useState<number>(15);
  const [showFactors, setShowFactors] = useState(false);

  const steps = [
    {
      title: "1. Spoken Experience",
      marathi: "तुमचे बोलणे",
      desc: "3 years informal garage repair & engine overhaul",
      status: "verified"
    },
    {
      title: "2. Extracted Tasks & Tools",
      marathi: "साधने आणि काम",
      desc: "Engine overhaul, brake shoes, spanner & multimeter",
      status: "verified"
    },
    {
      title: "3. Verified Skills & RPL",
      marathi: "कौशल्य आणि पूर्व अनुभव",
      desc: "High competency in mechanical servicing. Gap: Electrical diagnostics.",
      status: "verified"
    },
    {
      title: "4. Official Qualification",
      marathi: "शासकीय प्रमाणपत्र",
      desc: `${pathway.qualification_title} (QP: ${pathway.qp_code}, NSQF L${pathway.nsqf_level})`,
      status: "active"
    },
    {
      title: "5. Real Next Action",
      marathi: "पुढील कृती",
      desc: `${pathway.training_center_nearby || "Hingna Skilling Center"} (${pathway.has_live_batch ? "Free Batch Available" : "Catalogue Route"})`,
      status: "action"
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with Title and Fit Band */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {pathway.fit_band}
            </span>
            <TruthBadge state="LIVE" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            {pathway.qualification_title}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            NSQF Level {pathway.nsqf_level} • Code: {pathway.qp_code} • NCVET Validated
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <ReadAloudButton text={pathway.explanation_beneficiary} />
          {onSelect && (
            <button
              onClick={onSelect}
              className="px-4 py-2 bg-[#0f4c81] text-white text-xs font-bold rounded-xl hover:bg-[#0c3c66] transition-colors touch-target shadow-sm"
            >
              निवडा (Choose Path)
            </button>
          )}
        </div>
      </div>

      {/* Signature Living Pathway Flow Nodes */}
      <div className="my-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Living Pathway Growth (शब्दांपासून संधीपर्यंत)
        </h4>

        <div className="relative pl-6 border-l-2 border-sky-300 space-y-4">
          {steps.map((st, i) => (
            <div key={i} className="relative group">
              {/* Node dot */}
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[#0f4c81] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#0f4c81]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{st.title}</span>
                  <span className="text-[11px] text-slate-500 font-normal">({st.marathi})</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plain Language Explanation Card */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0f4c81] mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>हा मार्ग तुमच्यासाठी का योग्य आहे? (Why this fits you)</span>
        </div>
        <p>{pathway.explanation_beneficiary}</p>
      </div>

      {/* Inspectable Factor Scores Dropdown */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={() => setShowFactors(!showFactors)}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <span>Transparent Fit Factors (शिफारस गुण आणि पुरावे)</span>
          <span>{showFactors ? "▲ Hide" : "▼ Inspect Scores"}</span>
        </button>

        {showFactors && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Skill Transfer</div>
              <div className="font-bold text-slate-800 mt-0.5">{Math.round(pathway.factor_scores.skill_transfer * 100)}%</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Travel Fit ({pathway.distance_km || 12} km)</div>
              <div className="font-bold text-slate-800 mt-0.5">{Math.round(pathway.factor_scores.travel_mobility_fit * 100)}%</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">District Demand</div>
              <div className="font-bold text-slate-800 mt-0.5">{Math.round(pathway.factor_scores.local_demand_evidence * 100)}%</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Preference Fit</div>
              <div className="font-bold text-slate-800 mt-0.5">{Math.round(pathway.factor_scores.preference_alignment * 100)}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Counterfactual Travel Explorer */}
      {showCounterfactual && (
        <div className="mt-4 bg-amber-50/60 border border-amber-200/70 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>What-If Explorer: प्रवास मर्यादा बदला (Simulate Travel Radius)</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300">{simulatedRadius} km</span>
          </div>
          <input
            type="range"
            min={5}
            max={35}
            step={5}
            value={simulatedRadius}
            onChange={(e) => setSimulatedRadius(Number(e.target.value))}
            className="w-full mt-2 accent-amber-600 cursor-pointer"
          />
          <p className="text-[11px] text-amber-800 mt-1">
            {simulatedRadius >= 20
              ? "✓ २ अधिक अधिकृत प्रशिक्षण केंद्रे आणि बुटीबोरी येथील औद्योगिक प्रशिक्षण उपलब्ध झाले आहे."
              : "● स्थानिक हिंगणा आणि नागपूर मध्यवर्ती केंद्रावर लक्ष केंद्रित केले आहे."}
          </p>
        </div>
      )}
    </div>
  );
}
