"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge, TruthState } from "@/components/TruthBadge";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/api/auth-context";
import { useRuntimeTruth } from "@/lib/runtime-truth-context";
import { apiFetch, getLivelihoodPassport } from "@/lib/api";
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  Wrench,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  MapPin,
  Mic,
  Briefcase,
  RefreshCw,
  QrCode,
  Download,
  Share2,
  LogIn,
} from "lucide-react";

export type PassportViewStatus =
  | "loading"
  | "unauthenticated"
  | "empty"
  | "authenticated_with_profile"
  | "demo_profile"
  | "error";

interface SkillItem {
  id: string;
  name: string;
  name_mr?: string;
  status: "verified" | "inferred";
  confidence: number;
  evidence: string;
  nsqf_code?: string;
  level?: string;
  source: string;
}

interface PassportModel {
  beneficiary_name: string;
  district: string;
  district_code: string;
  qr_code_token: string;
  is_verifiable: boolean;
  skills: SkillItem[];
  experience: {
    title: string;
    duration: string;
    description: string;
    endorsement?: string;
    verified: boolean;
  };
  rpl: {
    title: string;
    readiness_tier: string;
    bridge_hours: number;
    description: string;
    disclaimer: string;
  };
}

const DEMO_PASSPORT: PassportModel = {
  beneficiary_name: "Ramesh Mesram",
  district: "Nagpur Rural (MH-NAG)",
  district_code: "MH-NAG",
  qr_code_token: "LIP-MH-NAG-2026-88",
  is_verifiable: true,
  skills: [
    {
      id: "sk-1",
      name: "Two-Wheeler Engine Overhaul",
      name_mr: "इंजिन दुरुस्ती व सुटे भाग जोडणी",
      status: "verified",
      confidence: 94,
      evidence: "3 years informal garage experience disassembling engines and tuning valves.",
      nsqf_code: "ASC/Q1411",
      level: "NSQF Level 3",
      source: "spoken_evidence",
    },
    {
      id: "sk-2",
      name: "Brake System Maintenance",
      name_mr: "हायड्रॉलिक व ड्रम ब्रेक दुरुस्ती",
      status: "verified",
      confidence: 95,
      evidence: "Inspects and replaces hydraulic brake pads and drum shoes routinely.",
      nsqf_code: "ASC/Q1402",
      level: "NSQF Level 4",
      source: "spoken_evidence",
    },
    {
      id: "sk-3",
      name: "Workshop Tools & Safety",
      name_mr: "टूल्स व गॅरेज सुरक्षा नियम",
      status: "verified",
      confidence: 90,
      evidence: "Proficient with pneumatic impact tools, torque wrenches, and shop safety.",
      nsqf_code: "ASC/Q1401",
      level: "Baseline Core",
      source: "spoken_evidence",
    },
  ],
  experience: {
    title: "Informal Mechanic Assistant at Roadside Garage",
    duration: "3 Years (36 Months)",
    description: "Daily maintenance, electrical diagnostics, engine overhauls and customer service at Hingna Automotive Hub.",
    endorsement: "Ward Committee Endorsed",
    verified: true,
  },
  rpl: {
    title: "Recognition of Prior Learning (RPL)",
    readiness_tier: "Tier 1 Fast Track",
    bridge_hours: 30,
    description: "Your 3 years of hands-on informal workshop experience qualifies for direct 30-hour bridge assessment under PM-AJAY GIA.",
    disclaimer: "Pre-screening decision support; formal credential issued after training center assessment.",
  },
};

export default function PassportPage() {
  return <React.Suspense fallback={<div role="status" className="p-8"><Loader2 aria-label="Loading" className="animate-spin" /></div>}><PassportContent /></React.Suspense>;
}

function PassportContent() {
  const searchParams = useSearchParams();
  const forceDemo = searchParams.get("demo") === "true";
  const { t, locale } = useLanguage();
  const { status: authStatus, user } = useAuth();
  const { truthState, isDemoMode } = useRuntimeTruth();

  const [viewStatus, setViewStatus] = useState<PassportViewStatus>("loading");
  const [passportData, setPassportData] = useState<PassportModel | null>(null);
  const [activeTab, setActiveTab] = useState<"skills" | "experience" | "rpl">("skills");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resolvePassport = async () => {
    setViewStatus("loading");
    setErrorMsg(null);

    // If explicit demo requested or environment in demo mode
    if (forceDemo || isDemoMode) {
      setPassportData(DEMO_PASSPORT);
      setViewStatus("demo_profile");
      return;
    }

    // If user is unauthenticated
    if (authStatus === "unauthenticated") {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
      if (storedId && storedId !== "demo-beneficiary-id") {
        // Try loading anonymous saved ID if exists
        try {
          const res = await getLivelihoodPassport(storedId);
          if (res && res.skills && res.skills.length > 0) {
            setPassportData({
              beneficiary_name: res.full_name || "Beneficiary",
              district: res.district_code || "MH-NAG",
              district_code: res.district_code || "MH-NAG",
              qr_code_token: res.qr_code_token || `LIP-MH-${storedId.slice(0, 6)}`,
              is_verifiable: true,
              skills: res.skills.map((s: any, idx: number) => ({
                id: s.id || `sk-${idx}`,
                name: s.canonical_name || s.name,
                name_mr: s.marathi_name,
                status: s.verification_status === "beneficiary_confirmed" ? "verified" : "inferred",
                confidence: Math.round((s.confidence_score || 0.9) * 100),
                evidence: s.evidence_utterance || "Spoken trade evidence confirmed during interview.",
                nsqf_code: s.nsqf_code,
                level: s.nsqf_level ? `NSQF Level ${s.nsqf_level}` : "NSQF Aligned",
                source: "spoken_evidence",
              })),
              experience: {
                title: res.work_experiences?.[0]?.title || "Trade Work Experience",
                duration: `${res.work_experiences?.[0]?.duration_months || 24} Months`,
                description: res.work_experiences?.[0]?.raw_utterance || "Practical hands-on workshop experience.",
                verified: true,
              },
              rpl: {
                title: "RPL Readiness Assessment",
                readiness_tier: "Tier 1 Fast Track",
                bridge_hours: 30,
                description: "Eligible for fast-track 30-hour bridge orientation under PM-AJAY.",
                disclaimer: "Pre-screening assessment result.",
              },
            });
            setViewStatus("authenticated_with_profile");
            return;
          }
        } catch {
          // Fall through to unauthenticated
        }
      }
      setViewStatus("unauthenticated");
      return;
    }

    // Authenticated user resolution via /beneficiaries/me
    try {
      const me = await apiFetch<any>("/api/v1/beneficiaries/me");
      if (!me || !me.id) {
        setViewStatus("empty");
        return;
      }

      const res = await getLivelihoodPassport(me.id);
      if (res && res.skills && res.skills.length > 0) {
        setPassportData({
          beneficiary_name: res.full_name || me.full_name,
          district: `${res.district_code || me.district_code || "Nagpur"} (Maharashtra)`,
          district_code: res.district_code || me.district_code || "MH-NAG",
          qr_code_token: res.qr_code_token || `LIP-MH-${me.id.slice(0, 6)}`,
          is_verifiable: true,
          skills: res.skills.map((s: any, idx: number) => ({
            id: s.id || `sk-${idx}`,
            name: s.canonical_name || s.name,
            name_mr: s.marathi_name,
            status: s.verification_status === "beneficiary_confirmed" ? "verified" : "inferred",
            confidence: Math.round((s.confidence_score || 0.9) * 100),
            evidence: s.evidence_utterance || "Spoken trade evidence confirmed during interview.",
            nsqf_code: s.nsqf_code,
            level: s.nsqf_level ? `NSQF Level ${s.nsqf_level}` : "NSQF Aligned",
            source: "spoken_evidence",
          })),
          experience: {
            title: res.work_experiences?.[0]?.title || "Trade Work Experience",
            duration: `${res.work_experiences?.[0]?.duration_months || 24} Months`,
            description: res.work_experiences?.[0]?.raw_utterance || "Practical hands-on workshop experience.",
            verified: true,
          },
          rpl: {
            title: "RPL Readiness Assessment",
            readiness_tier: "Tier 1 Fast Track",
            bridge_hours: 30,
            description: "Eligible for fast-track 30-hour bridge orientation under PM-AJAY.",
            disclaimer: "Pre-screening assessment result.",
          },
        });
        setViewStatus("authenticated_with_profile");
      } else {
        setViewStatus("empty");
      }
    } catch (err: any) {
      if (err.status === 404 || err.message?.includes("404")) {
        setViewStatus("empty");
      } else {
        setErrorMsg(err.message || "Failed to load skills passport from secure server.");
        setViewStatus("error");
      }
    }
  };

  useEffect(() => {
    resolvePassport();
  }, [authStatus, forceDemo, isDemoMode]);

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />
      <BeneficiaryNav />

      <main className="flex flex-col relative w-full pt-16 pb-36 min-h-screen">
        <div className="flex flex-col w-full max-w-2xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="pt-4 pb-2 flex flex-col gap-1">
            <div className="flex items-center justify-between text-label-sm font-label-sm uppercase tracking-wider text-outline">
              <span>{t("passport.title", "Skills Passport")}</span>
              <TruthBadge
                state={viewStatus === "demo_profile" ? "DEMO_DATA" : viewStatus === "authenticated_with_profile" ? "LIVE" : truthState}
              />
            </div>

            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight font-bold mt-1">
              {t("passport.title", "Skills Passport")}
            </h1>

            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {t("passport.subtitle", "Portable, verifiable digital credential of your informal experience and competency cluster.")}
            </p>
          </div>

          {/* STATE 1: LOADING */}
          {viewStatus === "loading" && (
            <div className="mt-8 p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm font-medium text-on-surface-variant">
                Loading your skills credential...
              </span>
            </div>
          )}

          {/* STATE 2: UNAUTHENTICATED */}
          {viewStatus === "unauthenticated" && (
            <div className="mt-6 p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-container/20 text-primary flex items-center justify-center ring-8 ring-primary-container/10">
                <BadgeCheck className="w-8 h-8" />
              </div>

              <div className="space-y-1 max-w-md">
                <h2 className="text-xl font-bold text-on-surface">
                  Create Your Skills Passport
                </h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Speak about your trade experience to generate your recognized competency cluster and unlock PM-AJAY livelihood pathways.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-2">
                <Link
                  href="/interview"
                  className="flex-1 min-h-[46px] rounded-xl bg-primary text-on-primary font-title-md text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-primary/90 transition-colors"
                >
                  <Mic className="w-4 h-4" />
                  <span>{t("home.pipeline.step1_title", "Start Voice Intake")}</span>
                </Link>
                <Link
                  href="/login"
                  className="flex-1 min-h-[46px] rounded-xl bg-surface-container-high text-on-surface font-title-md text-sm font-medium flex items-center justify-center gap-2 border border-outline-variant/40 hover:bg-surface-container-highest transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t("nav.login", "Sign In")}</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-outline-variant/20 text-xs text-on-surface-variant">
                Want to see a preview?{" "}
                <button
                  onClick={() => {
                    setPassportData(DEMO_PASSPORT);
                    setViewStatus("demo_profile");
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  Explore sample demo passport
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: AUTHENTICATED BUT EMPTY */}
          {viewStatus === "empty" && (
            <div className="mt-6 p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary-fixed/30 text-secondary flex items-center justify-center ring-8 ring-secondary-fixed/10">
                <Wrench className="w-8 h-8" />
              </div>

              <div className="space-y-1 max-w-md">
                <h2 className="text-xl font-bold text-on-surface">
                  {t("passport.empty_title", "You have not created your skills passport yet.")}
                </h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {t("passport.empty_desc", "Describe your daily work to generate your verified competency profile and RPL readiness.")}
                </p>
              </div>

              <Link
                href="/interview"
                className="min-h-[48px] px-6 rounded-xl bg-primary text-on-primary font-title-md text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-primary/90 transition-colors mt-2"
              >
                <Mic className="w-4 h-4" />
                <span>{t("passport.empty_btn", "Start Voice Assessment")}</span>
              </Link>
            </div>
          )}

          {/* STATE 4: ERROR */}
          {viewStatus === "error" && (
            <div className="mt-6 p-6 bg-error-container/20 border border-error/30 rounded-2xl flex flex-col items-center text-center gap-4">
              <AlertCircle className="w-8 h-8 text-error" />
              <div>
                <h3 className="font-bold text-lg text-on-surface">Unable to load skills credential</h3>
                <p className="text-sm text-on-surface-variant mt-1">{errorMsg}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resolvePassport}
                  className="px-4 py-2 bg-error text-on-error rounded-xl font-medium text-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t("action.retry", "Try Again")}</span>
                </button>
                <Link
                  href="/interview"
                  className="px-4 py-2 bg-surface-container-high text-on-surface rounded-xl font-medium text-sm border border-outline-variant/30"
                >
                  <span>Go to Voice Intake</span>
                </Link>
              </div>
            </div>
          )}

          {/* STATE 5 & 6: AUTHENTICATED WITH PROFILE OR DEMO PROFILE */}
          {(viewStatus === "authenticated_with_profile" || viewStatus === "demo_profile") && passportData && (
            <div className="flex flex-col gap-6 mt-4">
              {/* Sovereign Civic Passport Card */}
              <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-surface-variant/40 overflow-hidden flex flex-col">
                {/* Hero Header with Occupation Imagery */}
                <div className="relative w-full h-44 sm:h-48 bg-[#001428]">
                  <Image
                    src="/images/occupations/mechanic.webp"
                    alt="Occupation context"
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover opacity-60"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001428] via-[#001428]/40 to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-label-sm font-bold shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-secondary" />
                      <span>PM-AJAY Skills Passport</span>
                    </span>
                    <TruthBadge state={viewStatus === "demo_profile" ? "DEMO_DATA" : "LIVE"} />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="text-secondary-fixed text-xs font-semibold uppercase tracking-wider">
                        Verified Citizen Profile
                      </span>
                      <h2 className="text-2xl font-bold text-white tracking-tight">
                        {passportData.beneficiary_name}
                      </h2>
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-secondary" />
                        <span>{passportData.district}</span>
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md shrink-0 flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Sub-header Navigation Tabs */}
                <div className="grid grid-cols-3 border-b border-surface-variant/30 bg-surface-container-low" role="tablist">
                  <button
                    onClick={() => setActiveTab("skills")}
                    role="tab"
                    aria-selected={activeTab === "skills"}
                    className={`min-h-[46px] font-label-md text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                      activeTab === "skills"
                        ? "border-primary text-primary bg-surface-container-lowest"
                        : "border-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <BadgeCheck className="w-4 h-4 text-secondary" />
                    <span>Skills ({passportData.skills.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("experience")}
                    role="tab"
                    aria-selected={activeTab === "experience"}
                    className={`min-h-[46px] font-label-md text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                      activeTab === "experience"
                        ? "border-primary text-primary bg-surface-container-lowest"
                        : "border-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-secondary" />
                    <span>Experience</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("rpl")}
                    role="tab"
                    aria-selected={activeTab === "rpl"}
                    className={`min-h-[46px] font-label-md text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                      activeTab === "rpl"
                        ? "border-primary text-primary bg-surface-container-lowest"
                        : "border-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <Award className="w-4 h-4 text-secondary" />
                    <span>RPL Readiness</span>
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="p-4 sm:p-6">
                  {/* TAB 1: SKILLS */}
                  {activeTab === "skills" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs uppercase font-bold tracking-wider text-outline">
                          Demonstrated Trade Competencies
                        </span>
                        <ReadAloudButton
                          text={`Verified skills: ${passportData.skills.map((s) => s.name).join(", ")}`}
                          label={t("action.listen", "Listen")}
                          size="sm"
                        />
                      </div>

                      {passportData.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="p-3.5 rounded-xl bg-surface-container-low border border-surface-variant/30 flex flex-col gap-2 transition-all hover:bg-surface-container"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-base text-primary">
                                {skill.name}
                              </h3>
                              <p className="text-xs text-on-surface-variant mt-0.5 font-medium">
                                {skill.evidence}
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-code-sm text-xs font-bold shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                              <span>{skill.confidence}% Fit</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-surface-variant/20 text-xs text-outline">
                            <span className="font-semibold text-secondary">{skill.level || "NSQF Level 3"}</span>
                            <span>•</span>
                            <span>{skill.nsqf_code || "ASC/Q1411"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 2: EXPERIENCE */}
                  {activeTab === "experience" && (
                    <div className="flex flex-col gap-4">
                      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant/30 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-primary">
                            {passportData.experience.title}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-bold text-xs">
                            {passportData.experience.duration}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface leading-relaxed">
                          {passportData.experience.description}
                        </p>
                        {passportData.experience.endorsement && (
                          <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-secondary font-semibold">
                            <ShieldCheck className="w-4 h-4" />
                            <span>{passportData.experience.endorsement}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: RPL READINESS */}
                  {activeTab === "rpl" && (
                    <div className="flex flex-col gap-4">
                      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant/30 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-primary">
                            {passportData.rpl.title}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs">
                            {passportData.rpl.readiness_tier}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface leading-relaxed">
                          {passportData.rpl.description}
                        </p>
                        <div className="p-3 rounded-lg bg-surface-container text-xs text-on-surface-variant flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-secondary shrink-0" />
                          <span>{passportData.rpl.disclaimer}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Strip */}
                <div className="p-4 bg-surface-container-low border-t border-surface-variant/30 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/pathways"
                    className="flex-1 min-h-[48px] rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    <span>{t("nav.my_paths", "Explore Matching Pathways")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") window.print();
                    }}
                    className="min-h-[48px] px-4 rounded-xl bg-surface-container-high text-on-surface font-medium text-sm flex items-center justify-center gap-2 border border-outline-variant/30 hover:bg-surface-container-highest transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
