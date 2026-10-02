"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { LivingPathway } from "@/components/LivingPathway";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { selectPathway, getRecommendations, exploreCounterfactual, getLivelihoodPassport } from "@/lib/api";
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

  const [error, setError] = useState("");

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
      const idToFetch = storedId || "demo-beneficiary-id";
      const res = await getRecommendations({ beneficiary_id: idToFetch, district_code: "MH-NAG" });
      if (res && res.pathways && res.pathways.length > 0) {
        setPathways(res.pathways);
      } else {
        setPathways([]);
      }
    } catch (e: any) {
      setError(e.message || "Recommendations unavailable.");
      setPathways([]);
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
      const storedId = localStorage.getItem("lip_beneficiary_id");
      if (!storedId) throw new Error("Sign in and save a profile before exploring alternatives.");
      const passport = await getLivelihoodPassport(storedId);
      const baseProfile = {
        ...passport.profile,
        mobility: { max_travel_distance_km: newRadius },
        work_preferences: { wage_vs_self_employment: newPref },
        accessibility: { requires_wheelchair_access: newWheelchair }
      };
      const candidateSkills = passport.skills.map((skill: {skill_id: string}) => skill.skill_id);
      const res = await exploreCounterfactual({
        base_profile: baseProfile,
        candidate_skill_ids: candidateSkills,
        delta_parameters: {
          travel_radius_km: newRadius,
          work_preference: newPref,
          wheelchair_accessible: newWheelchair
        },
        district_code: passport.district_code
      });

      if (res && res.delta_explanation) {
        setCounterfactualNotice(res.delta_explanation);
      }
      if (res && res.feasible_options && res.feasible_options.length > 0) {
        // Map counterfactual options
        const mapped = res.feasible_options.map((opt: any) => ({
          qualification_title: opt.qualification_title,
          qp_code: opt.qp_code,
          nsqf_level: opt.nsqf_level,
          pathway_type: newPref === "self_employment" ? "self_employment_pathway" : "wage_fit_now",
          fit_band: opt.fit_band || "Feasible Under Modified Constraints",
          overall_score: opt.new_score,
          factor_scores: opt.factor_scores || {},
          explanation_beneficiary: opt.reason || `प्रवास मर्यादा ${newRadius} किमी केल्यामुळे हा पर्याय उपलब्ध झाला आहे.`,
          training_center_nearby: opt.training_center_nearby,
          distance_km: opt.distance_km,
          has_live_batch: false,
          truth_state: "SANDBOX"
        }));
        setPathways(mapped);
      } else {
        loadRecommendations();
      }
    } catch (e: any) {
      setError(e.message || "Recalculation failed. Previous results are unchanged.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPathway = async (pathway: any) => {
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
      const idToUse = storedId || "demo-beneficiary-id";
      const result = await selectPathway(idToUse, pathway.qualification_title, pathway.pathway_type);
      if (result.is_offline) { setError("Selection queued offline, not yet saved. Reconnect before continuing."); return; }
      router.push("/journey");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pathway was not saved.");
    }
  };

  const filteredPathways = filterType === "all"
    ? pathways
    : pathways.filter(p => p.pathway_type === filterType);

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-24 md:pb-12">
      <Navbar />
      <BeneficiaryNav />

      <main id="main-content" className="workspace-main max-w-4xl mx-auto px-4 py-6">
        {error && <p role="alert" className="p-4 bg-red-50 text-red-900">{error}</p>}
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
              तुमच्यासाठी सुचवलेले उपजीविका मार्ग
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {pathways.length} options · recommendations, not verified placements. Review fit and confirm availability.
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
                Counterfactual Explorer (मार्ग फेरबदल सिम्युलेटर)
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              What-if simulation · not a saved profile change
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
