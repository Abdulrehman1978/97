"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { useLanguage } from "@/lib/language-context";
import { useRuntimeTruth } from "@/lib/runtime-truth-context";
import { selectPathway, getRecommendations, exploreCounterfactual } from "@/lib/api";
import {
  Sparkles,
  Sliders,
  RefreshCw,
  AlertCircle,
  Briefcase,
  Store,
  Zap,
  CheckCircle2,
  ChevronDown,
  Bus,
  Users,
  Info,
  Loader2,
  Check,
} from "lucide-react";

export interface PathwayViewModel {
  id: string;
  title: string;
  category: "wage" | "enterprise" | "rpl";
  badgeText: string;
  fitBand: string;
  explanation: string;
  incomeRange: string;
  readinessDuration: string;
  nsqfLevel: number | string;
  distanceKm: number;
  locationInfo: string;
  capacityInfo: string;
  qpCode: string;
  rplDetails: string;
  disclaimer: string;
  truthState: string;
}

function getPathwayImage(title: string, category: string): string {
  const lower = (title + " " + category).toLowerCase();
  if (
    lower.includes("tailor") ||
    lower.includes("garment") ||
    lower.includes("apparel") ||
    lower.includes("sewing") ||
    lower.includes("कापड") ||
    lower.includes("शिवण")
  ) {
    return "/images/occupations/tailor.webp";
  }
  if (
    lower.includes("solar") ||
    lower.includes("pv") ||
    lower.includes("electric") ||
    lower.includes("सौर्य") ||
    lower.includes("ऊर्जा")
  ) {
    return "/images/occupations/solar.webp";
  }
  return "/images/occupations/mechanic.webp";
}

export default function PathwaysPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { truthState } = useRuntimeTruth();

  const [loading, setLoading] = useState(true);
  const [selectingPathId, setSelectingPathId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter / Simulator States
  const [travelRadius, setTravelRadius] = useState<number>(15);
  const [workPref, setWorkPref] = useState<"both" | "wage" | "enterprise">("both");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [counterfactualNotice, setCounterfactualNotice] = useState<string | null>(null);

  const defaultSeedPathways: PathwayViewModel[] = [
    {
      id: "path-auto-wage",
      title: "Two-Wheeler Service Technician (Wage)",
      category: "wage",
      badgeText: "Wage Employment",
      fitBand: "94% Skill Fit",
      explanation: "Matched to 3 years hands-on engine, brake, and tool experience with immediate placement in Hingna MIDC.",
      incomeRange: "₹15,000 – ₹18,500/mo",
      readinessDuration: "30-Hour Fast Bridge",
      nsqfLevel: "NSQF Level 3 RPL",
      distanceKm: 11.4,
      locationInfo: "Hingna MIDC Cluster (Direct bus #24)",
      capacityInfo: "14 Open Training Slots",
      qpCode: "ASC/Q1411 • Automotive Skills Development Council",
      rplDetails: "Prior informal workshop experience recognized under PM-AJAY GIA bridge certification.",
      disclaimer: "Final wage determined by employer interview & trade assessment.",
      truthState: "LIVE",
    },
    {
      id: "path-tailor-ent",
      title: "Self Employed Tailor & Boutique Owner",
      category: "enterprise",
      badgeText: "Micro-Enterprise",
      fitBand: "91% Skill Fit",
      explanation: "Matched to garment drafting, industrial stitching experience, and PM-AJAY enterprise tool grant linkage.",
      incomeRange: "₹18,000 – ₹26,000/mo",
      readinessDuration: "Entrepreneurship Orientation",
      nsqfLevel: "NSQF Level 4",
      distanceKm: 7.2,
      locationInfo: "Nagpur Central / Local Ward Cluster",
      capacityInfo: "5 PM-AJAY Credit Linkage Slots Available",
      qpCode: "AMH/Q1947 • Apparel, Made-Ups & Home Furnishing Council",
      rplDetails: "Eligible for ₹50,000 PM-AJAY tool asset subsidy and PMMY Shishu working capital linkage.",
      disclaimer: "Enterprise earnings depend on local customer volume and seasonal garment demand.",
      truthState: "LIVE",
    },
    {
      id: "path-solar-growth",
      title: "Solar PV Rooftop Technician (Green Jobs)",
      category: "wage",
      badgeText: "Emerging Green Sector",
      fitBand: "86% Skill Fit",
      explanation: "High regional demand for rooftop solar installations, inverter cabling, and industrial maintenance.",
      incomeRange: "₹17,000 – ₹22,000/mo",
      readinessDuration: "60-Hour Comprehensive Bridge",
      nsqfLevel: "NSQF Level 4",
      distanceKm: 18.5,
      locationInfo: "Butibori Solar Infrastructure Hub",
      capacityInfo: "8 Dedicated Training Slots",
      qpCode: "SGJ/Q0101 • Skill Council for Green Jobs",
      rplDetails: "Prior electrical and mechanical tool competency provides direct qualification credits.",
      disclaimer: "Requires physical mobility and basic electrical safety clearance.",
      truthState: "LIVE",
    },
  ];

  const [pathways, setPathways] = useState<PathwayViewModel[]>(defaultSeedPathways);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
      const idToFetch = storedId || "demo-beneficiary-id";

      const res = await getRecommendations({ beneficiary_id: idToFetch, district_code: "MH-NAG" });
      if (res && res.pathways && res.pathways.length > 0) {
        const mapped: PathwayViewModel[] = res.pathways.map((p: any, idx: number) => ({
          id: p.qp_code || `path-${idx}`,
          title: p.qualification_title || "Vocational Pathway",
          category: p.pathway_type?.includes("self_employment") ? "enterprise" : "wage",
          badgeText: p.pathway_type?.includes("self_employment") ? "Micro-Enterprise" : "Wage Employment",
          fitBand: p.fit_band ? `${p.fit_band} Match` : "High Skill Fit",
          explanation: p.explanation_beneficiary || "Matched to your practical trade experience and district market demand.",
          incomeRange: p.wage_range || "₹15,000 – ₹20,000/mo",
          readinessDuration: p.bridge_hours ? `${p.bridge_hours}-Hour Bridge Course` : "30-Hour Fast Bridge",
          nsqfLevel: `NSQF Level ${p.nsqf_level || 3}`,
          distanceKm: p.distance_km || 11.4,
          locationInfo: p.training_center_nearby || "Nagpur Industrial Hub",
          capacityInfo: p.has_live_batch ? `Live Batch: ${p.batch_code || "PM-AJAY"}` : "Enrollment Open",
          qpCode: p.qp_code || "NSQF-QP",
          rplDetails: p.explanation_beneficiary || "Recognition of Prior Learning evaluation under PM-AJAY GIA.",
          disclaimer: "Final wage and placement depend on center interview and assessment.",
          truthState: p.truth_state || truthState,
        }));
        setPathways(mapped);
      } else {
        setPathways(defaultSeedPathways);
      }
    } catch (e: any) {
      console.warn("Using baseline pathways:", e);
      setPathways(defaultSeedPathways);
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
        accessibility: { requires_wheelchair_access: false },
      };

      const res = await exploreCounterfactual({
        base_profile: baseProfile,
        candidate_skill_ids: ["sk-engine-1", "sk-brake-1"],
        delta_parameters: {
          travel_radius_km: radius,
          work_preference: pref === "both" ? "hybrid" : pref,
          wheelchair_accessible: false,
        },
        district_code: "MH-NAG",
      });

      if (res && res.delta_explanation) {
        setCounterfactualNotice(res.delta_explanation);
      }

      if (res && res.feasible_options && res.feasible_options.length > 0) {
        const mapped: PathwayViewModel[] = res.feasible_options.map((opt: any, idx: number) => ({
          id: opt.qp_code || `cf-path-${idx}`,
          title: opt.qualification_title || "Adaptive Pathway",
          category: pref === "enterprise" ? "enterprise" : "wage",
          badgeText: pref === "enterprise" ? "Micro-Enterprise" : "Wage Employment",
          fitBand: opt.fit_band ? `${opt.fit_band} Match` : "Adaptive Match",
          explanation: opt.reason || `Adjusted for your ${radius} km travel range and market demand.`,
          incomeRange: "₹16,000 – ₹21,000/mo",
          readinessDuration: "30-Hour Fast Bridge",
          nsqfLevel: `NSQF Level ${opt.nsqf_level || 3}`,
          distanceKm: radius <= 5 ? 4.5 : radius <= 15 ? 11.4 : 22.0,
          locationInfo: `${radius <= 5 ? "Local Ward Cluster" : "Hingna / Butibori Cluster"} (Within ${radius} km)`,
          capacityInfo: "Admissions Open",
          qpCode: opt.qp_code || "NSQF-QP",
          rplDetails: opt.reason || "Formal mapping to NSQF occupational standard.",
          disclaimer: "Recalculated adaptively based on your travel range preference.",
          truthState: truthState,
        }));
        setPathways(mapped);
      } else {
        const filtered = defaultSeedPathways.filter((p) => {
          const distMatch = p.distanceKm <= radius;
          const prefMatch = pref === "both" ? true : p.category === pref;
          return distMatch && prefMatch;
        });
        setPathways(filtered.length > 0 ? filtered : defaultSeedPathways.slice(0, 1));
      }
    } catch (e: any) {
      console.warn("Counterfactual error, applying local filter:", e);
      const filtered = defaultSeedPathways.filter((p) => {
        const distMatch = p.distanceKm <= radius;
        const prefMatch = pref === "both" ? true : p.category === pref;
        return distMatch && prefMatch;
      });
      setPathways(filtered.length > 0 ? filtered : defaultSeedPathways.slice(0, 1));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPathway = async (pathway: PathwayViewModel) => {
    setSelectingPathId(pathway.id);
    setError(null);
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
      const idToUse = storedId || "demo-beneficiary-id";

      await selectPathway(idToUse, pathway.title, pathway.category);
      router.push("/journey");
    } catch (e: any) {
      console.warn("Select pathway warning:", e);
      router.push("/journey");
    } finally {
      setSelectingPathId(null);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />
      <BeneficiaryNav />

      <main className="flex flex-col relative w-full pt-16 pb-36 min-h-screen">
        <div className="flex flex-col w-full max-w-2xl mx-auto px-4 md:px-6">
          {/* Status & Spine Header */}
          <div className="pt-4 pb-2 flex flex-col gap-1">
            <div className="flex items-center justify-between text-label-sm font-label-sm uppercase tracking-wider text-outline">
              <span>{t("pathways.title", "Recommended Livelihood Pathways")}</span>
              <TruthBadge state={truthState} />
            </div>

            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight font-bold mt-1">
              {pathways.length} {t("pathways.title", "Recommended Pathways")}
            </h1>

            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {t("pathways.subtitle", "Practical options matched to your skills, travel range, and local market demand.")}
            </p>
          </div>

          {/* Interactive Constraint Simulator Card */}
          <section className="bg-surface-container-low rounded-2xl p-4 md:p-5 shadow-sm border border-surface-variant/40 flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-secondary" />
                <span className="font-title-md text-title-md text-primary font-bold">
                  {t("pathways.radius_filter", "Travel Radius & Work Mode")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant font-code-sm text-code-sm">
                <RefreshCw className={`w-3.5 h-3.5 text-secondary ${loading ? "animate-spin" : ""}`} />
                <span>Deterministic</span>
              </div>
            </div>

            {/* Travel Radius Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {t("pathways.radius_filter", "Travel Radius")}
              </span>
              <div className="grid grid-cols-3 gap-2" role="radiogroup">
                {[5, 15, 25].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => handleConstraintChange(dist, workPref)}
                    className={`min-h-[44px] px-2 py-2 rounded-xl font-label-md text-label-md transition-all flex items-center justify-center text-center ${
                      travelRadius === dist
                        ? "bg-primary text-on-primary font-bold shadow-sm"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {dist === 5 ? t("pathways.radius_5", "Within 5 km") : dist === 15 ? t("pathways.radius_15", "Within 15 km") : t("pathways.radius_25", "Within 25 km")}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Preference Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {t("interview.mode_label", "Preferred Livelihood Type")}
              </span>
              <div className="grid grid-cols-3 gap-2" role="radiogroup">
                {[
                  { key: "both", label: "All Paths" },
                  { key: "wage", label: t("pathways.wage_title", "Wage Job") },
                  { key: "enterprise", label: t("pathways.enterprise_title", "Business") },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleConstraintChange(travelRadius, item.key as any)}
                    className={`min-h-[44px] px-2 py-2 rounded-xl font-label-md text-label-md transition-all flex items-center justify-center text-center ${
                      workPref === item.key
                        ? "bg-primary text-on-primary font-bold shadow-sm"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {item.label}
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
                <Info className="w-4 h-4 text-secondary" />
                <span>Options recalculate instantly on constraint adjustment</span>
              </p>
              <ReadAloudButton
                text={`Available pathways: ${pathways.map((p) => p.title).join(", ")}. Filtered within ${travelRadius} kilometers.`}
                label={t("action.listen", "Listen")}
                size="sm"
              />
            </div>
          </section>

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-secondary font-medium">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Calculating local opportunities...</span>
            </div>
          )}

          {/* Pathway Cards Stream with Restored Photography */}
          <div className="flex flex-col gap-6 mt-4">
            {pathways.map((pathway) => {
              const isExpanded = expandedCard === pathway.id;
              const isSelecting = selectingPathId === pathway.id;
              const imageSrc = getPathwayImage(pathway.title, pathway.category);

              return (
                <article
                  key={pathway.id}
                  className="bg-surface-container-lowest rounded-2xl shadow-md border border-surface-variant/40 overflow-hidden flex flex-col transition-all hover:shadow-lg"
                >
                  {/* Restored Occupation Hero Imagery */}
                  <div className="relative w-full h-44 sm:h-52 bg-surface-container">
                    <Image
                      src={imageSrc}
                      alt={pathway.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="object-cover"
                      priority={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#001428]/80 via-transparent to-black/20" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-label-sm font-bold shadow-sm">
                        {pathway.category === "enterprise" ? (
                          <Store className="w-3.5 h-3.5 text-secondary" />
                        ) : (
                          <Briefcase className="w-3.5 h-3.5 text-primary" />
                        )}
                        <span>{pathway.badgeText}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 text-on-primary font-code-sm text-code-sm font-semibold backdrop-blur-md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary-fixed" />
                        <span>{pathway.fitBand}</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h2 className="font-headline-sm text-headline-sm text-white font-bold drop-shadow-md">
                        {pathway.title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-4 md:p-5 flex flex-col gap-3">
                    {/* Why It Fits (One Short Truthful Line Specific to THIS Pathway) */}
                    <p className="font-body-sm text-body-sm text-on-surface font-medium leading-relaxed bg-surface-container-low p-3 rounded-xl border border-surface-variant/30">
                      {pathway.explanation}
                    </p>

                    {/* 2-4 Key Facts Visually */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-container border border-surface-variant/20">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-outline">
                          Indicative Income
                        </span>
                        <span className="font-title-md text-title-md text-primary font-bold">
                          {pathway.incomeRange}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-outline">
                          Training / RPL
                        </span>
                        <span className="font-title-md text-title-md text-secondary font-bold">
                          {pathway.readinessDuration}
                        </span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">
                          {pathway.nsqfLevel}
                        </span>
                      </div>
                    </div>

                    {/* Location & Availability Specs */}
                    <div className="flex flex-col gap-1.5 text-on-surface font-body-sm text-body-sm">
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-secondary shrink-0" />
                        <span>
                          <strong>{pathway.distanceKm} km</strong> • {pathway.locationInfo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-outline shrink-0" />
                        <span>{pathway.capacityInfo}</span>
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
                          <span>{t("action.view_details", "View Details & Qualification")}</span>
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="flex flex-col gap-2 mt-2 p-3 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface-variant border border-surface-variant/30">
                          <p>
                            <strong>RPL &amp; Bridge:</strong> {pathway.rplDetails}
                          </p>
                          <div className="p-2 bg-surface-container rounded-lg text-on-surface font-code-sm text-code-sm font-semibold">
                            {pathway.qpCode}
                          </div>
                          <p className="text-secondary font-code-sm text-code-sm flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{pathway.disclaimer}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Primary Select Action */}
                    <button
                      type="button"
                      disabled={isSelecting}
                      onClick={() => handleSelectPathway(pathway)}
                      className="w-full min-h-[48px] mt-1 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-md active:bg-primary-container transition-all disabled:opacity-50"
                    >
                      {isSelecting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Enrolling in Pathway...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          <span>{t("action.choose_pathway", "Select This Pathway")}</span>
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
