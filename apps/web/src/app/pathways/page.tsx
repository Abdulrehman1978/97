"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { useLanguage } from "@/lib/language-context";
import { selectPathway, getRecommendations, exploreCounterfactual } from "@/lib/api";
import {
  Compass,
  Sparkles,
  Sliders,
  RefreshCw,
  AlertCircle,
  Briefcase,
  Store,
  Zap,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Bus,
  Users,
  Info,
  Loader2,
  MapPin
} from "lucide-react";

export default function PathwaysPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [selectingPathId, setSelectingPathId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [truthState, setTruthState] = useState<"LIVE" | "DEMO_DATA" | "SANDBOX">("LIVE");

  // Filter / Simulator States
  const [travelRadius, setTravelRadius] = useState<number>(15);
  const [workPref, setWorkPref] = useState<"both" | "wage" | "enterprise">("both");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [counterfactualNotice, setCounterfactualNotice] = useState<string | null>(null);

  const defaultSeedPathways = [
    {
      id: "path-wage-1",
      title: "Automotive Two-Wheeler Technician",
      title_mr: "दुचाकी तंत्रज्ञ व सर्व्हिस मेकॅनिक",
      pathway_type: "wage",
      badge_text: "वेतन नोकरी (Wage Role)",
      badge_sub: "अनौपचारिक अनुभव पात्र",
      subtitle: "प्रमाणित ऑटोमोबाइल वर्कशॉप किंवा अधिकृत सर्व्हिस सेंटर",
      income_range: "₹१५,००० – ₹१८,५००",
      income_sub: "(Indicative Range)",
      readiness: "३० तास फास्ट ब्रिज",
      readiness_sub: "(NSQF Level 3 RPL)",
      distance_km: 11.4,
      location_info: "Hingna MIDC (थेट बस #२४)",
      capacity_info: "अंदाजे १४ जागा उपलब्ध (Unconfirmed Batch)",
      nco_code: "NCO: 7231.0501 • Two-Wheeler Maintenance",
      rpl_details: "तुमचे मागील ३ वर्षांचे अनौपचारिक गॅरेज काम थेट NSQF लेव्हल ३ समकक्ष मोजले जाईल.",
      disclaimer: "नोकरी मिळण्याची अंतिम खात्री नियोक्ता मुलाखतीवर अवलंबून असते.",
      truth_state: "LIVE"
    },
    {
      id: "path-ent-1",
      title: "Independent Workshop & Micro-Enterprise",
      title_mr: "स्वतंत्र गॅरेज व सुटे भाग व्यवसाय",
      pathway_type: "enterprise",
      badge_text: "स्वयंरोजगार (Micro-Enterprise)",
      badge_sub: "मुद्रा व पीएम-अजय सहाय्य",
      subtitle: "स्वतःचे गॅरेज किंवा फिरती मेकॅनिक दुरुस्ती सेवा",
      income_range: "₹२०,००० – ₹२८,०००",
      income_sub: "(संभाव्य निव्वळ नफा)",
      readiness: "उद्योजकता ओरिएंटेशन",
      readiness_sub: "(Skill + Credit Linkage)",
      distance_km: 7.2,
      location_info: "नागपूर ग्रामीण / स्थानिक परिसर",
      capacity_info: "५ क्रेडिट लिंकेज स्लॉट उपलब्ध",
      nco_code: "PMMY Shishu + PM-AJAY Tool Asset",
      rpl_details: "स्थानिक बँकांशी समन्वय साधून ₹५०,००० पर्यंत टूल किट व कार्यरत भांडवल सहाय्य मिळवता येईल.",
      disclaimer: "उत्पन्न ग्राहकांची संख्या व व्यवसायाच्या स्थानावर अवलंबून असते.",
      truth_state: "LIVE"
    },
    {
      id: "path-growth-1",
      title: "Electric Vehicle (EV) Retrofit & Battery Tech",
      title_mr: "ईव्ही व बॅटरी असेंब्ली तंत्रज्ञ",
      pathway_type: "wage",
      badge_text: "उगवते क्षेत्र (Green Sector)",
      badge_sub: "उच्च भविष्यकालीन मागणी",
      subtitle: "इलेक्ट्रिक टू-व्हीलर सर्व्हिस व बॅटरी स्वॅपिंग केंद्र",
      income_range: "₹१८,००० – ₹२४,०००",
      income_sub: "(Industry Placement)",
      readiness: "६० तास प्रगत वर्ग",
      readiness_sub: "(NSQF Level 4)",
      distance_km: 21.8,
      location_info: "Butibori Industrial Cluster",
      capacity_info: "८ जागा उपलब्ध (Green Skills Batch)",
      nco_code: "EV-SPEC / Green Jobs Skill Council",
      rpl_details: "पारंपरिक मेकॅनिक कौशल्यांना आधुनिक ईव्ही डायग्नोस्टिक टूल्सशी जोडणारा प्रगत कोर्स.",
      disclaimer: "प्रवेशासाठी प्राथमिक गणित व टूल्स हाताळणी परीक्षा उत्तीर्ण होणे आवश्यक.",
      truth_state: "DEMO_DATA"
    }
  ];

  const [pathways, setPathways] = useState<any[]>(defaultSeedPathways);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
      const idToFetch = storedId || "demo-beneficiary-id";

      if (idToFetch.includes("demo")) {
        setTruthState("DEMO_DATA");
      } else {
        setTruthState("LIVE");
      }

      const res = await getRecommendations({ beneficiary_id: idToFetch, district_code: "MH-NAG" });
      if (res && res.pathways && res.pathways.length > 0) {
        const mapped = res.pathways.map((p: any, idx: number) => ({
          id: p.qp_code || `path-${idx}`,
          title: p.qualification_title,
          title_mr: p.qualification_title_mr || p.qualification_title,
          pathway_type: p.pathway_type?.includes("self_employment") ? "enterprise" : "wage",
          badge_text: p.pathway_type?.includes("self_employment") ? "स्वयंरोजगार (Micro-Enterprise)" : "वेतन नोकरी (Wage Role)",
          badge_sub: p.fit_band || "कौशल्य जुळणी",
          subtitle: p.explanation_beneficiary || "स्थानिक रोजगार व कौशल्य मागणीनुसार शिफारस",
          income_range: p.wage_range || "₹१५,००० – ₹२०,०००",
          income_sub: "(Indicative Range)",
          readiness: p.bridge_hours ? `${p.bridge_hours} तास ब्रिज मॉड्युल` : "३० तास फास्ट ब्रिज",
          readiness_sub: `(NSQF Level ${p.nsqf_level || 3})`,
          distance_km: p.distance_km || 11.4,
          location_info: p.training_center_nearby || "Nagpur Industrial Hub",
          capacity_info: p.has_live_batch ? `बॅच उपलब्ध: ${p.batch_code || "PM-AJAY"}` : "Unconfirmed Batch",
          nco_code: p.qp_code,
          rpl_details: p.explanation_beneficiary,
          disclaimer: "शासकीय योजनेचे निकष व मुलाखतीवर अंतिम निवड अवलंबून आहे.",
          truth_state: p.truth_state || "LIVE"
        }));
        setPathways(mapped);
      } else {
        setPathways(defaultSeedPathways);
      }
    } catch (e: any) {
      console.warn("Using resilient pathway recommendations:", e);
      setPathways(defaultSeedPathways);
      setTruthState("DEMO_DATA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleConstraintChange = async (radius: number, pref: "both" | "wage" | "enterprise") => {
    setTravelRadius(radius);
    setWorkPref(pref);
    setLoading(true);
    setCounterfactualNotice(null);

    try {
      const baseProfile = {
        education: { highest_level: "class_10" },
        mobility: { max_travel_distance_km: radius },
        work_preferences: { wage_vs_self_employment: pref === "both" ? "hybrid" : pref },
        accessibility: { requires_wheelchair_access: false }
      };

      const res = await exploreCounterfactual({
        base_profile: baseProfile,
        candidate_skill_ids: ["sk-engine-1", "sk-brake-1"],
        delta_parameters: {
          travel_radius_km: radius,
          work_preference: pref === "both" ? "hybrid" : pref,
          wheelchair_accessible: false
        },
        district_code: "MH-NAG"
      });

      if (res && res.delta_explanation) {
        setCounterfactualNotice(res.delta_explanation);
      }

      if (res && res.feasible_options && res.feasible_options.length > 0) {
        const mapped = res.feasible_options.map((opt: any, idx: number) => ({
          id: opt.qp_code || `cf-path-${idx}`,
          title: opt.qualification_title,
          title_mr: opt.qualification_title,
          pathway_type: pref === "enterprise" ? "enterprise" : "wage",
          badge_text: pref === "enterprise" ? "स्वयंरोजगार (Micro-Enterprise)" : "वेतन नोकरी (Wage Role)",
          badge_sub: opt.fit_band || "Counterfactual Match",
          subtitle: opt.reason || `प्रवास मर्यादा ${radius} किमी अंतर्गत उपलब्ध पर्याय`,
          income_range: "₹१६,००० – ₹२१,०००",
          income_sub: "(Estimated Range)",
          readiness: "३० तास फास्ट ब्रिज",
          readiness_sub: `(NSQF Level ${opt.nsqf_level || 3})`,
          distance_km: radius <= 5 ? 4.5 : (radius <= 15 ? 11.4 : 22.0),
          location_info: `${radius <= 5 ? "स्थानिक वॉर्ड" : "Hingna / Butibori Cluster"} (Within ${radius}km)`,
          capacity_info: "प्रवेश प्रक्रिया सुरू",
          nco_code: opt.qp_code,
          rpl_details: opt.reason,
          disclaimer: "बदललेल्या मर्यादांनुसार तात्काळ मोजलेला पर्याय.",
          truth_state: "LIVE"
        }));
        setPathways(mapped);
      } else {
        // Filter local seed
        const filtered = defaultSeedPathways.filter((p) => {
          const distMatch = p.distance_km <= radius;
          const prefMatch = pref === "both" ? true : p.pathway_type === pref;
          return distMatch && prefMatch;
        });
        setPathways(filtered.length > 0 ? filtered : defaultSeedPathways.slice(0, 1));
      }
    } catch (e: any) {
      console.warn("Counterfactual error, applying local filter:", e);
      const filtered = defaultSeedPathways.filter((p) => {
        const distMatch = p.distance_km <= radius;
        const prefMatch = pref === "both" ? true : p.pathway_type === pref;
        return distMatch && prefMatch;
      });
      setPathways(filtered.length > 0 ? filtered : defaultSeedPathways.slice(0, 1));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPathway = async (pathway: any) => {
    setSelectingPathId(pathway.id);
    setError(null);
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
      const idToUse = storedId || "demo-beneficiary-id";

      await selectPathway(idToUse, pathway.title, pathway.pathway_type);
      router.push("/journey");
    } catch (e: any) {
      console.warn("Select pathway warning:", e);
      // Even if network glitches in demo, move to journey
      router.push("/journey");
    } finally {
      setSelectingPathId(null);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />
      <BeneficiaryNav />

      <main className="flex flex-col relative w-full pt-16 pb-28 min-h-screen">
        <div className="flex flex-col w-full max-w-2xl mx-auto px-4 md:px-6">
          {/* Status & Spine Header */}
          <div className="pt-4 pb-2 flex flex-col gap-1">
            <div className="flex items-center justify-between text-label-sm font-label-sm uppercase tracking-wider text-outline">
              <span>{locale === "mr" ? "टप्पा ३ / ५ • मार्गदर्शक निवड" : "Step 3 of 5 • Choose Your Path"}</span>
              <TruthBadge state={truthState} />
            </div>

            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight font-bold mt-1">
              {locale === "mr"
                ? `तुमच्या अनुभवानुसार ${pathways.length} उपजीविका मार्ग (Pathways)`
                : `${pathways.length} Recommended Livelihood Pathways (मार्ग)`}
            </h1>

            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {locale === "mr"
                  ? "३ वर्षे दुचाकी दुरुस्ती कौशल्यांवर आधारित शिफारसी"
                  : "Based on 3 years two-wheeler experience & local district demand"}
              </span>
            </div>
          </div>

          {/* Interactive Constraint Simulator Card */}
          <section className="bg-surface-container-low rounded-2xl p-4 md:p-5 shadow-sm border border-surface-variant/40 flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-secondary" />
                <span className="font-title-md text-title-md text-primary font-bold">
                  {locale === "mr" ? "पर्याय बदला (Live Simulator)" : "Adjust Constraints (Live Simulator)"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant font-code-sm text-code-sm">
                <RefreshCw className={`w-3.5 h-3.5 text-secondary ${loading ? "animate-spin" : ""}`} />
                <span>Auto-Sync</span>
              </div>
            </div>

            {/* Travel Radius Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {locale === "mr" ? "प्रवास मर्यादा (Travel Distance)" : "Travel Distance Radius"}
              </span>
              <div className="grid grid-cols-3 gap-2" role="radiogroup">
                {[5, 15, 25].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => handleConstraintChange(dist, workPref)}
                    className={`min-h-[44px] px-2 py-2 rounded-xl font-label-md text-label-md transition-all flex items-center justify-center text-center ${
                      travelRadius === dist
                        ? "bg-primary-container text-on-primary font-bold shadow-sm"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {locale === "mr"
                      ? `${dist === 5 ? "५" : dist === 15 ? "१५" : "२५"} किमी ${travelRadius === dist ? "✓" : ""}`
                      : `${dist} km ${travelRadius === dist ? "✓" : ""}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Preference Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {locale === "mr" ? "कामाचे स्वरूप (Work Preference)" : "Work Mode Preference"}
              </span>
              <div className="grid grid-cols-3 gap-2" role="radiogroup">
                {[
                  { key: "both", mr: "दोन्ही", en: "Both" },
                  { key: "wage", mr: "नोकरी", en: "Wage Job" },
                  { key: "enterprise", mr: "व्यवसाय", en: "Business" }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleConstraintChange(travelRadius, item.key as any)}
                    className={`min-h-[44px] px-2 py-2 rounded-xl font-label-md text-label-md transition-all flex items-center justify-center text-center ${
                      workPref === item.key
                        ? "bg-primary-container text-on-primary font-bold shadow-sm"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {locale === "mr"
                      ? `${item.mr} ${workPref === item.key ? "✓" : ""}`
                      : `${item.en} ${workPref === item.key ? "✓" : ""}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Counterfactual Notice */}
            {counterfactualNotice && (
              <div className="p-2.5 rounded-lg bg-secondary-fixed/40 border border-secondary/20 flex items-start gap-2 text-on-secondary-fixed font-body-sm text-body-sm">
                <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>{counterfactualNotice}</span>
              </div>
            )}

            {/* Audio helper bar */}
            <div className="flex items-center justify-between pt-1 border-t border-surface-variant/30">
              <p className="font-code-sm text-code-sm text-on-surface-variant flex items-center gap-1">
                <Info className="w-4 h-4 text-tertiary-container" />
                {locale === "mr" ? "बदल केल्यास पर्याय आपोआप बदलतात" : "Options recalculate deterministically"}
              </p>
              <ReadAloudButton
                text={`तुमच्यासाठी ${pathways.length} पर्याय उपलब्ध आहेत. प्रवास मर्यादा ${travelRadius} किलोमीटर.`}
                label={locale === "mr" ? "ऐका" : "Listen"}
                size="sm"
              />
            </div>
          </section>

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-secondary font-medium">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>{locale === "mr" ? "पर्याय शोधत आहे..." : "Recalculating pathways..."}</span>
            </div>
          )}

          {/* Pathway Cards Stream */}
          <div className="flex flex-col gap-4 mt-4">
            {pathways.map((pathway) => {
              const isExpanded = expandedCard === pathway.id;
              const isSelecting = selectingPathId === pathway.id;

              return (
                <article
                  key={pathway.id}
                  className="bg-surface-container-lowest rounded-2xl shadow-md border border-surface-variant/40 overflow-hidden flex flex-col transition-all"
                >
                  {/* Hero Badge Strip */}
                  <div className="p-4 bg-primary text-on-primary flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold">
                      {pathway.pathway_type === "enterprise" ? (
                        <Store className="w-4 h-4 text-secondary-fixed-dim" />
                      ) : (
                        <Briefcase className="w-4 h-4 text-primary-fixed" />
                      )}
                      {pathway.badge_text}
                    </span>
                    <span className="inline-flex items-center gap-1 text-on-primary font-code-sm text-code-sm bg-primary-container/60 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5 text-tertiary-fixed" />
                      {pathway.badge_sub}
                    </span>
                  </div>

                  <div className="p-4 md:p-5 flex flex-col gap-3">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                        {pathway.title}
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 font-medium">
                        {pathway.subtitle}
                      </p>
                    </div>

                    {/* Indicative Metrics Matrix */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-container-low border border-surface-variant/20">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-outline">
                          {locale === "mr" ? "अंदाजे मासिक उत्पन्न" : "Indicative Income"}
                        </span>
                        <span className="font-title-md text-title-md text-primary font-bold">
                          {pathway.income_range}
                        </span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">
                          {pathway.income_sub}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-outline">
                          {locale === "mr" ? "प्रशिक्षण तयारी" : "Training Duration"}
                        </span>
                        <span className="font-title-md text-title-md text-secondary font-bold">
                          {pathway.readiness}
                        </span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">
                          {pathway.readiness_sub}
                        </span>
                      </div>
                    </div>

                    {/* Location & Availability Specs */}
                    <div className="flex flex-col gap-1.5 pt-1 text-on-surface font-body-sm text-body-sm">
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-outline shrink-0" />
                        <span className="truncate">
                          <strong>{pathway.distance_km} किमी</strong> • {pathway.location_info}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-outline shrink-0" />
                        <span>{pathway.capacity_info}</span>
                      </div>
                    </div>

                    {/* Collapsible Accordion Details */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setExpandedCard(isExpanded ? null : pathway.id)}
                        className="w-full min-h-[44px] flex items-center justify-between py-2 text-primary font-label-md text-label-md bg-surface-container/60 px-3 rounded-xl hover:bg-surface-container transition-colors"
                      >
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Zap className="w-4 h-4 text-secondary" />
                          {locale === "mr" ? "तपशील व पात्रता निकष (View Details)" : "Details & Qualification Codes"}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="flex flex-col gap-2 mt-2 p-3 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface-variant border border-surface-variant/30">
                          <p>
                            <strong>RPL मान्यता:</strong> {pathway.rpl_details}
                          </p>
                          <div className="p-2 bg-surface-container rounded-lg text-on-surface font-code-sm text-code-sm font-semibold">
                            {pathway.nco_code}
                          </div>
                          <p className="text-secondary font-code-sm text-code-sm flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {pathway.disclaimer}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Primary Select Action */}
                    <button
                      type="button"
                      disabled={isSelecting}
                      onClick={() => handleSelectPathway(pathway)}
                      className="w-full min-h-[48px] mt-1 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-md active:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {isSelecting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{locale === "mr" ? "मार्ग निवडत आहे..." : "Enrolling..."}</span>
                        </>
                      ) : (
                        <>
                          <span>{locale === "mr" ? "हा मार्ग निवडा" : "Choose This Path"}</span>
                          <ArrowRight className="w-5 h-5 text-on-primary" />
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
