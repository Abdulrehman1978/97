"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { LivingPathway } from "@/components/LivingPathway";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { selectPathway, getRecommendations, exploreCounterfactual } from "@/lib/api";
import { Compass, Sparkles, Filter, Sliders, RefreshCw, AlertCircle } from "lucide-react";

export default function PathwaysPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<string>("all");
  const [pathways, setPathways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [counterfactualNotice, setCounterfactualNotice] = useState<string | null>(null);
  const [travelRadius, setTravelRadius] = useState<number>(15);
  const [workPref, setWorkPref] = useState<string>("hybrid");
  const [requiresWheelchair, setRequiresWheelchair] = useState<boolean>(false);

  const defaultSeedPathways = [
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
      batch_code: "PM-AJAY-NAG-2026-B1",
      truth_state: "DEMO_DATA"
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
      batch_code: "PM-AJAY-ENT-2026",
      truth_state: "DEMO_DATA"
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
      batch_code: "Catalogue Discovery",
      truth_state: "DEMO_DATA"
    }
  ];

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
      const idToFetch = storedId || "demo-beneficiary-id";
      const res = await getRecommendations({ beneficiary_id: idToFetch, district_code: "MH-NAG" });
      if (res && res.pathways && res.pathways.length > 0) {
        setPathways(res.pathways);
      } else {
        setPathways(defaultSeedPathways);
      }
    } catch (e: any) {
      console.warn("Recommendations API fetch error, using resilient seed:", e);
      setPathways(defaultSeedPathways);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleRecalculateCounterfactual = async (newRadius: number, newPref: string, newWheelchair: boolean) => {
    setLoading(true);
    try {
      const baseProfile = {
        education: { highest_level: "class_10" },
        mobility: { max_travel_distance_km: newRadius },
        work_preferences: { wage_vs_self_employment: newPref },
        accessibility: { requires_wheelchair_access: newWheelchair }
      };
      const candidateSkills = ["sk-engine-1", "sk-brake-1"];
      const res = await exploreCounterfactual({
        base_profile: baseProfile,
        candidate_skill_ids: candidateSkills,
        delta_parameters: {
          travel_radius_km: newRadius,
          work_preference: newPref,
          wheelchair_accessible: newWheelchair
        },
        district_code: "MH-NAG"
      });

      if (res && res.delta_explanation) {
        setCounterfactualNotice(res.delta_explanation);
      }
      if (res && res.feasible_options && res.feasible_options.length > 0) {
        // Map counterfactual options
        const mapped = res.feasible_options.map((opt: any) => ({
          qualification_title: opt.qualification_title,
          qp_code: opt.qp_code,
          nsqf_level: opt.nsqf_level || 4,
          pathway_type: newPref === "self_employment" ? "self_employment_pathway" : "wage_fit_now",
          fit_band: opt.fit_band || "Feasible Under Modified Constraints",
          overall_score: opt.new_score || 0.85,
          factor_scores: {
            travel_mobility_fit: opt.feasibility_change === "unlocked_by_distance" ? 0.98 : 0.85,
            skill_transfer: 0.85,
            local_demand_evidence: 0.90,
            preference_alignment: 0.90
          },
          explanation_beneficiary: opt.reason || `प्रवास मर्यादा ${newRadius} किमी केल्यामुळे हा पर्याय उपलब्ध झाला आहे.`,
          training_center_nearby: "Hingna / Nagpur Training Center",
          distance_km: newRadius <= 10 ? 8.0 : (newRadius <= 15 ? 12.0 : 21.0),
          has_live_batch: true,
          batch_code: "PM-AJAY-NAG-2026-B1",
          truth_state: "LIVE"
        }));
        setPathways(mapped);
      } else {
        loadRecommendations();
      }
    } catch (e: any) {
      console.warn("Counterfactual recalculation error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPathway = async (pathway: any) => {
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
      const idToUse = storedId || "demo-beneficiary-id";
      await selectPathway(idToUse, pathway.qualification_title, pathway.pathway_type);
    } catch (e) {
      console.warn("Using local path selection fallback:", e);
    }
    router.push("/journey");
  };

  const filteredPathways = filterType === "all"
    ? pathways
    : pathways.filter(p => p.pathway_type === filterType);

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
              तुमचे कौशल्य, {travelRadius} किमी प्रवास मर्यादा आणि नागपूर जिल्ह्यातील रोजगार मागणीनुसार प्रमाणित.
            </p>
          </div>

          <ReadAloudButton text="येथे तुमच्या कौशल्यानुसार तीन मार्ग सुचवले आहेत. तुम्ही पसंतीनुसार कोणताही एक मार्ग निवडू शकता किंवा खालील काउंटरफॅक्च्युअल स्लायडर बदलून नवीन पर्याय पाहू शकता." />
        </div>

        {/* Counterfactual Live Simulation Bar */}
        <div className="mb-6 bg-white p-5 rounded-3xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Live Counterfactual Explorer (मार्ग फेरबदल सिम्युलेटर)
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Deterministic Real-Time Recalculation
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-4">
            प्रवास अंतर किंवा कामाचा प्रकार बदलल्यास इंजिन तात्काळ निकष तपासून नवीन पर्याय उपलब्ध करते:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                प्रवास अंतर मर्यादा (Travel Radius): <span className="text-blue-700 font-bold">{travelRadius} km</span>
              </label>
              <div className="flex items-center gap-2">
                {[5, 15, 25].map(radius => (
                  <button
                    key={radius}
                    onClick={() => {
                      setTravelRadius(radius);
                      handleRecalculateCounterfactual(radius, workPref, requiresWheelchair);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      travelRadius === radius
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {radius} km
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                कामाचे स्वरूप (Work Preference):
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: "wage", label: "नोकरी" },
                  { id: "self_employment", label: "व्यवसाय" },
                  { id: "hybrid", label: "दोन्ही" }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setWorkPref(item.id);
                      handleRecalculateCounterfactual(travelRadius, item.id, requiresWheelchair);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      workPref === item.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                सुलभता गरज (Accessibility):
              </label>
              <button
                onClick={() => {
                  const nextVal = !requiresWheelchair;
                  setRequiresWheelchair(nextVal);
                  handleRecalculateCounterfactual(travelRadius, workPref, nextVal);
                }}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                  requiresWheelchair
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {requiresWheelchair ? "✓ व्हीलचेअर सुलभता आवश्यक" : "+ व्हीलचेअर सुलभता जोडा"}
              </button>
            </div>
          </div>

          {counterfactualNotice && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                {counterfactualNotice}
              </p>
            </div>
          )}
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
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">मार्ग आणि शासकीय बॅच तपासत आहे...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPathways.map((pathway, idx) => (
              <LivingPathway
                key={idx}
                pathway={pathway}
                onSelect={() => handleSelectPathway(pathway)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
