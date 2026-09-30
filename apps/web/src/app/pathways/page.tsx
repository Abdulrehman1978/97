"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { LivingPathway } from "@/components/LivingPathway";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { selectPathway } from "@/lib/api";
import { Compass, Sparkles, Filter } from "lucide-react";

export default function PathwaysPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<string>("all");

  const samplePathways = [
    {
      qualification_title: "Automotive Two Wheeler Service Technician",
      qp_code: "ASC/Q1411",
      nsqf_level: 4,
      pathway_type: "wage_fit_now",
      fit_band: "Strong current-skill fit (सर्वोत्तम जुळणी)",
      overall_score: 0.89,
      factor_scores: {
        skill_transfer: 0.85,
        travel_mobility_fit: 0.95,
        local_demand_evidence: 0.90,
        preference_alignment: 0.88
      },
      explanation_beneficiary: "हा मार्ग तुमच्या 3 वर्षांच्या गॅरेज अनुभवावर आधारित आहे. हिंगणा एमआयडीसी ऑटोमोबाईल क्लस्टरमध्ये या कौशल्याची मोठी मागणी असून 12 किमी अंतरावर पीएम-अजय अंतर्गत मोफत शासकीय बॅच सुरू आहे.",
      training_center_nearby: "Nagpur Central Livelihood Center (Hingna)",
      distance_km: 11.5,
      has_live_batch: true,
      batch_code: "PM-AJAY-NAG-2026-B1"
    },
    {
      qualification_title: "Independent Workshop & Micro-Enterprise Owner",
      qp_code: "ASC/Q1411-ENT",
      nsqf_level: 4,
      pathway_type: "self_employment_pathway",
      fit_band: "Viable micro-enterprise route (व्यवसाय मार्ग)",
      overall_score: 0.84,
      factor_scores: {
        skill_transfer: 0.80,
        travel_mobility_fit: 1.0,
        local_demand_evidence: 0.85,
        preference_alignment: 0.95
      },
      explanation_beneficiary: "स्वतःचे दुकान सुरू करण्यासाठी हा मार्ग उपयुक्त आहे. यामध्ये 100% मोफत तांत्रिक कौशल्य आणि पीएम-अजय अंतर्गत Rs. 50,000 पर्यंत बिनव्याजी साधन अनुदान (Tool Asset Grant) उपलब्ध होऊ शकते.",
      training_center_nearby: "District Skill Center, Nagpur",
      distance_km: 8.0,
      has_live_batch: true,
      batch_code: "PM-AJAY-ENT-2026"
    },
    {
      qualification_title: "Solar Photovoltaic Rooftop Installer (Suryamitra)",
      qp_code: "SGJ/Q0101",
      nsqf_level: 4,
      pathway_type: "growth_pathway",
      fit_band: "High-growth vocational trajectory (भविष्यातील मागणी)",
      overall_score: 0.78,
      factor_scores: {
        skill_transfer: 0.65,
        travel_mobility_fit: 0.85,
        local_demand_evidence: 0.92,
        preference_alignment: 0.75
      },
      explanation_beneficiary: "नागपूर विभागात सौर ऊर्जेच्या कामात वेगाने वाढ होत आहे. तुमच्या 10वी शिक्षणावर हा अभ्यासक्रम पूर्ण करता येईल. विद्युत वायरिंगचा अधिक सराव या कोर्समध्ये दिला जाईल.",
      training_center_nearby: "Green Jobs Academy, Butibori",
      distance_km: 18.0,
      has_live_batch: false,
      batch_code: "Catalogue Discovery"
    }
  ];

  const handleSelectPathway = async (pathway: any) => {
    try {
      await selectPathway("demo-beneficiary-id", pathway.qualification_title, pathway.pathway_type);
    } catch (e) {
      console.warn("Using local path selection:", e);
    }
    router.push("/journey");
  };

  const filteredPathways = filterType === "all"
    ? samplePathways
    : samplePathways.filter(p => p.pathway_type === filterType);

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-24 md:pb-12">
      <Navbar />
      <BeneficiaryNav />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 3 of 5 • My Paths (माझे मार्ग)
              </span>
              <TruthBadge state="LIVE" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              तुमच्यासाठी सुचवलेले ३ उपजीविका मार्ग
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              तुमचे कौशल्य, १५ किमी प्रवास मर्यादा आणि नागपूर जिल्ह्यातील रोजगार मागणीनुसार प्रमाणित.
            </p>
          </div>

          <ReadAloudButton text="येथे तुमच्या कौशल्यानुसार तीन मार्ग सुचवले आहेत. तुम्ही पसंतीनुसार कोणताही एक मार्ग निवडू शकता." />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors touch-target ${
              filterType === "all" ? "bg-[#0f4c81] text-white" : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            सर्व मार्ग (All Paths)
          </button>
          <button
            onClick={() => setFilterType("wage_fit_now")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors touch-target ${
              filterType === "wage_fit_now" ? "bg-[#0f4c81] text-white" : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            थेट नोकरी (Immediate Wage)
          </button>
          <button
            onClick={() => setFilterType("self_employment_pathway")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors touch-target ${
              filterType === "self_employment_pathway" ? "bg-[#0f4c81] text-white" : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            स्वतःचा व्यवसाय (Self Employment)
          </button>
        </div>

        {/* Living Pathway Cards */}
        <div className="space-y-6">
          {filteredPathways.map((pathway, idx) => (
            <LivingPathway
              key={idx}
              pathway={pathway}
              onSelect={() => handleSelectPathway(pathway)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
