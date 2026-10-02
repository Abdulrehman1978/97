"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { useLanguage } from "@/lib/language-context";
import { getLivelihoodPassport } from "@/lib/api";
import { NetworkError } from "@/lib/api/errors";
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  Wrench,
  Car,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  MapPin,
  Mic,
  Briefcase
} from "lucide-react";

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function PassportPage() {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<"skills" | "experience" | "rpl">("skills");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [truthState, setTruthState] = useState<"LIVE" | "DEMO_DATA" | "SAVED">("LIVE");

  const [passportData, setPassportData] = useState<any>({
    beneficiary_name: "रमेश मेश्राम (Ramesh Mesram)",
    district: "नागपूर ग्रामीण (Nagpur Rural)",
    district_code: "MH-NAG",
    qr_code_token: "LIP-MH-NAG-2026-88",
    is_verifiable: true,
    skills: [
      {
        id: "sk-1",
        name: "Two-Wheeler Engine Overhaul",
        name_mr: "इंजिन दुरुस्ती व सुटे भाग जोडणी",
        status: "verified",
        confidence: 92,
        evidence: "मी गॅरेजमध्ये इंजिन उघडणे आणि पिस्टन बदलण्याचे काम करतो.",
        nsqf_code: "ASC/Q1411",
        level: "Level 3 Equivalent",
        source: "spoken_evidence"
      },
      {
        id: "sk-2",
        name: "Brake System Maintenance",
        name_mr: "हायड्रॉलिक व ड्रम ब्रेक दुरुस्ती",
        status: "verified",
        confidence: 95,
        evidence: "सर्व प्रकारच्या दुचाकीचे ब्रेक दुरुस्त करतो आणि ऑइल बदलतो.",
        nsqf_code: "ASC/Q1402",
        level: "Level 4 Candidate",
        source: "spoken_evidence"
      },
      {
        id: "sk-3",
        name: "Workshop Tools & Safety",
        name_mr: "टूल्स व गॅरेज सुरक्षा नियम",
        status: "inferred",
        confidence: 78,
        evidence: "Inferred from tool context: टॉर्क रिंच, न्यूमॅटिक टूल्स व वेस्ट ऑइल डिस्पोजल.",
        nsqf_code: "ASC/Q1401",
        level: "Baseline Fit",
        source: "ai_inference"
      }
    ],
    experience: {
      title: "स्वयंरोजगार व गॅरेज अनुभव (Roadside Garage Work)",
      duration: "४ वर्षे (4 Years)",
      description: "नागपूर-हिंगणा मार्गावरील स्थानिक ऑटो सर्व्हिस केंद्रात दैनंदिन २००+ दुचाकींचे नियमित मेंटेनन्स, फॉल्ट डायग्नोस्टिक्स व सुटे भागांची जुळवणी.",
      endorsement: "वॉर्ड कमिटी शिफारस: उपस्थित (Ward Committee Endorsed)",
      verified: true
    },
    rpl: {
      title: "RPL प्राधान्य मूल्यांकन (Recognition of Prior Learning)",
      readiness_tier: "Tier 1 Fast Track",
      bridge_hours: 30,
      description: "Recognition of Prior Learning अंतर्गत आपल्या व्यावहारिक अनुभवाला शासनमान्य प्रमाणपत्रात रूपांतरित करण्यासाठी ३० तासांचे ओरिएंटेशन सत्र नियोजित करता येईल.",
      disclaimer: "हे शासकीय प्रमाणपत्र नाही; केवळ संकलित अनुभवावर आधारित कौशल्य शिफारस आहे."
    }
  });

  const DEMO_SEED = passportData;

  const loadPassport = async () => {
    setLoading(true);
    setError(null);
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
      const idState = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id_state") : null;

      if (IS_DEMO_MODE && (!storedId || storedId === "demo-beneficiary-id" || idState === "demo")) {
        setTruthState("DEMO_DATA");
        setLoading(false);
        return;
      }

      if (!storedId || storedId === "demo-beneficiary-id") {
        if (!IS_DEMO_MODE) {
          setError(
            locale === "mr"
              ? "कोणतेही प्रोफाइल आढळले नाही. कृपया आधी मुलाखत पूर्ण करा."
              : "No saved profile found. Please complete the voice interview first."
          );
          setLoading(false);
          return;
        }
        setTruthState("DEMO_DATA");
        setLoading(false);
        return;
      }

      const apiPassport = await getLivelihoodPassport(storedId);
      if (apiPassport) {
        setTruthState("LIVE");
        setPassportData({
          beneficiary_name: apiPassport.full_name || DEMO_SEED.beneficiary_name,
          district: apiPassport.district_code ? `${apiPassport.district_code} (Maharashtra)` : DEMO_SEED.district,
          district_code: apiPassport.district_code || "MH-NAG",
          qr_code_token: apiPassport.qr_code_token || `LIP-MH-${storedId.slice(0, 6)}`,
          is_verifiable: true,
          skills: apiPassport.skills && apiPassport.skills.length > 0
            ? apiPassport.skills.map((s: any, idx: number) => ({
                id: s.id || `sk-${idx}`,
                name: s.canonical_name || s.name,
                name_mr: s.marathi_name || s.canonical_name || s.name,
                status: s.verification_status === "beneficiary_confirmed" ? "verified" : "inferred",
                confidence: Math.round((s.confidence_score || 0.88) * 100),
                evidence: s.evidence_quote || "मुलाखती दरम्यान नोंदवलेले काम व कौशल्य संदर्भ.",
                nsqf_code: s.nsqf_code || "ASC/Q1411",
                level: s.proficiency_band === "competent" ? "Level 3 Equivalent" : "Level 2 / Bridge Needed",
                source: s.verification_status === "beneficiary_confirmed" ? "spoken_evidence" : "ai_inference"
              }))
            : DEMO_SEED.skills,
          experience: apiPassport.work_experiences && apiPassport.work_experiences.length > 0
            ? {
                title: apiPassport.work_experiences[0].title || DEMO_SEED.experience.title,
                duration: `${apiPassport.work_experiences[0].duration_months || 36} Months`,
                description: apiPassport.work_experiences[0].description || DEMO_SEED.experience.description,
                endorsement: "गाव कामगार समिती पडताळणी प्रलंबित",
                verified: false
              }
            : DEMO_SEED.experience,
          rpl: DEMO_SEED.rpl
        });
      }
    } catch (e: any) {
      if (IS_DEMO_MODE) {
        setTruthState("DEMO_DATA");
      } else {
        if (e instanceof NetworkError) {
          setError(locale === "mr" ? "सर्व्हरशी संपर्क होऊ शकला नाही. इंटरनेट तपासा." : "Server unreachable. Please check your connection.");
        } else {
          setError(e.message || "Failed to load passport.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPassport();
  }, []);

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />
      <BeneficiaryNav />

      <main className="flex flex-col relative w-full pt-16 pb-28 min-h-screen">
        <div className="flex flex-col w-full max-w-2xl mx-auto px-4 md:px-6">
          {/* Header Metadata */}
          <div className="pt-4 pb-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary font-bold tracking-wider uppercase">
                {locale === "mr" ? "राष्ट्रीय कौशल्य नोंदवही • MSDE सुसंगत" : "National Skills Repository • MSDE Alignment"}
              </span>
              <TruthBadge state={truthState} />
            </div>

            {/* Main Passport Card */}
            <div className="bg-surface-container rounded-2xl p-4 md:p-5 shadow-sm relative overflow-hidden mt-1 border border-surface-variant/40">
              <div className="absolute -right-4 -bottom-6 w-32 h-32 rounded-full bg-surface-variant/40 blur-xl pointer-events-none" />
              <div className="flex items-start justify-between gap-2 relative z-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-secondary" />
                    <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {locale === "mr" ? "उपजीविका पासपोर्ट" : "Livelihood Skills Passport"}
                    </h1>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {locale === "mr" ? "सत्यापित कौशल्य व क्षमता दस्तऐवज" : "Verifiable Competency & Livelihood Record"}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              {/* Citizen Details Subcard */}
              <div className="mt-3 pt-3 bg-surface-container-lowest/90 rounded-xl p-3 flex flex-col gap-1.5 shadow-sm border border-surface-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-title-md text-title-md text-primary font-bold">
                    {passportData.beneficiary_name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-on-tertiary-container font-label-sm text-label-sm bg-tertiary-fixed/30 px-2 py-0.5 rounded-full font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                    {locale === "mr" ? "पडताळणीयोग्य" : "Verifiable"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-body-sm text-body-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    {passportData.district}
                  </span>
                  <span className="font-code-sm text-code-sm text-outline font-semibold">
                    {passportData.qr_code_token}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Loading / Error States */}
          {loading && (
            <div className="flex flex-col items-center justify-center p-12 gap-3 text-on-surface-variant">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
              <p className="font-body-md text-body-md font-medium">
                {locale === "mr" ? "पासपोर्ट लोड होत आहे..." : "Loading skills passport..."}
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="mt-4 p-4 rounded-xl bg-error-container/40 border border-error/20 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-error font-semibold font-title-md">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/interview"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold"
                >
                  {locale === "mr" ? "मुलाखत सुरू करा" : "Start Interview"}
                </Link>
                <button
                  type="button"
                  onClick={loadPassport}
                  className="px-4 py-2 rounded-lg bg-surface-container-high text-primary font-label-md text-label-md font-semibold"
                >
                  {locale === "mr" ? "पुन्हा प्रयत्न करा" : "Retry"}
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* 3-Tab Filter Pill */}
              <div className="mt-3">
                <div className="bg-surface-container-high p-1 rounded-xl flex items-center gap-1 shadow-sm">
                  <button
                    id="tab-btn-skills"
                    type="button"
                    onClick={() => setActiveTab("skills")}
                    className={`flex-1 min-h-[46px] py-1.5 px-2 rounded-lg font-label-md text-label-md transition-all text-center ${
                      activeTab === "skills"
                        ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                        : "text-on-surface-variant hover:text-on-surface font-semibold"
                    }`}
                  >
                    {locale === "mr" ? "प्रमाणित कौशल्ये" : "Verified Skills"}
                    <span className="block font-label-sm text-label-sm text-secondary font-normal">
                      Skills ({passportData.skills?.length || 0})
                    </span>
                  </button>

                  <button
                    id="tab-btn-experience"
                    type="button"
                    onClick={() => setActiveTab("experience")}
                    className={`flex-1 min-h-[46px] py-1.5 px-2 rounded-lg font-label-md text-label-md transition-all text-center ${
                      activeTab === "experience"
                        ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                        : "text-on-surface-variant hover:text-on-surface font-semibold"
                    }`}
                  >
                    {locale === "mr" ? "अनुभव" : "Work History"}
                    <span className="block font-label-sm text-label-sm text-outline font-normal">
                      {passportData.experience?.duration || "History"}
                    </span>
                  </button>

                  <button
                    id="tab-btn-rpl"
                    type="button"
                    onClick={() => setActiveTab("rpl")}
                    className={`flex-1 min-h-[46px] py-1.5 px-2 rounded-lg font-label-md text-label-md transition-all text-center ${
                      activeTab === "rpl"
                        ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                        : "text-on-surface-variant hover:text-on-surface font-semibold"
                    }`}
                  >
                    {locale === "mr" ? "RPL पात्रता" : "RPL Readiness"}
                    <span className="block font-label-sm text-label-sm text-outline font-normal">
                      {passportData.rpl?.readiness_tier || "Tier 1"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Skills Stream */}
              {activeTab === "skills" && (
                <div className="flex flex-col gap-3 mt-3">
                  {passportData.skills && passportData.skills.length > 0 ? (
                    passportData.skills.map((skill: any) => (
                      <div
                        key={skill.id}
                        className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-variant/30 flex flex-col gap-2.5 transition-transform active:scale-[0.99]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-on-secondary-fixed shrink-0">
                              <Wrench className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                              <h2 className="font-title-md text-title-md text-on-surface font-bold">
                                {skill.name}
                              </h2>
                              <span className="font-body-sm text-body-sm text-secondary font-semibold">
                                {skill.name_mr}
                              </span>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-primary-fixed-variant font-label-sm text-label-sm shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            {skill.status === "verified"
                              ? locale === "mr" ? "खात्री केली" : "Verified"
                              : locale === "mr" ? "अनुमानित" : "Inferred"}
                          </span>
                        </div>

                        {/* Verbatim Spoken Evidence / Inference Box */}
                        <div className="bg-surface-container-low rounded-lg p-3 my-0.5 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider flex items-center gap-1 font-semibold">
                              <Mic className="w-3.5 h-3.5 text-secondary" />
                              {skill.source === "spoken_evidence"
                                ? locale === "mr" ? "प्रत्यक्ष उच्चारित पुरावा" : "Verbatim Spoken Evidence"
                                : locale === "mr" ? "एआय तर्क मॉडेल" : "AI Inferred Evidence"}
                            </span>
                            <ReadAloudButton
                              text={`${skill.name}. ${skill.name_mr}. ${skill.evidence}`}
                              label={locale === "mr" ? "ऐका" : "Listen"}
                              size="sm"
                            />
                          </div>
                          <p className="font-body-md text-body-md text-on-surface italic">
                            “{skill.evidence}”
                          </p>
                        </div>

                        {/* Percentage bar & Competency fit */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2 flex-1 mr-3">
                            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-secondary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${skill.confidence}%` }}
                              />
                            </div>
                            <span className="font-label-md text-label-md text-on-surface font-bold shrink-0">
                              {skill.confidence}%
                            </span>
                          </div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">
                            {locale === "mr" ? "कौशल्य जुळणी" : "Competency Fit"}
                          </span>
                        </div>

                        {/* NSQF Code */}
                        <div className="flex items-center justify-between text-label-sm font-label-sm text-outline pt-0.5 border-t border-surface-variant/20">
                          <span>Mapped NSQF Code: {skill.nsqf_code}</span>
                          <span className="text-secondary font-semibold">{skill.level}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-surface-variant/30 flex flex-col items-center gap-2">
                      <Wrench className="w-10 h-10 text-outline" />
                      <p className="font-title-md text-on-surface font-bold">
                        {locale === "mr" ? "कोणतेही कौशल्य आढळले नाही" : "No Skills Recorded Yet"}
                      </p>
                      <p className="font-body-sm text-on-surface-variant">
                        {locale === "mr"
                          ? "प्रथम आपल्या दैनंदिन कामाबद्दल बोलून मुलाखत पूर्ण करा."
                          : "Speak about your daily work to extract and verify your skills."}
                      </p>
                      <Link
                        href="/interview"
                        className="mt-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold"
                      >
                        {locale === "mr" ? "मुलाखत द्या" : "Start Voice Intake"}
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Experience Stream */}
              {activeTab === "experience" && (
                <div className="flex flex-col gap-3 mt-3">
                  <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-variant/30 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-primary font-bold">
                        {passportData.experience.title}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-bold">
                        {passportData.experience.duration}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {passportData.experience.description}
                    </p>
                    <div className="mt-2 pt-2 bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between border border-surface-variant/20">
                      <span className="font-label-sm text-label-sm text-outline">
                        {passportData.experience.endorsement}
                      </span>
                      <ShieldCheck className="w-5 h-5 text-secondary" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: RPL Readiness */}
              {activeTab === "rpl" && (
                <div className="flex flex-col gap-3 mt-3">
                  <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-variant/30 flex flex-col gap-2.5">
                    <span className="font-title-md text-title-md text-primary font-bold">
                      {passportData.rpl.title}
                    </span>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {passportData.rpl.description}
                    </p>
                    <div className="flex items-center justify-between bg-surface-container p-2.5 rounded-lg mt-1 border border-surface-variant/20">
                      <span className="font-label-md text-label-md text-primary font-bold">
                        {locale === "mr" ? "पात्रता स्थिती:" : "Readiness Tier:"}
                      </span>
                      <span className="font-label-md text-label-md text-on-tertiary-container font-bold bg-tertiary-fixed/30 px-2 py-0.5 rounded">
                        {passportData.rpl.readiness_tier}
                      </span>
                    </div>
                  </div>

                  {/* RPL Bridge Card */}
                  <div className="bg-secondary-fixed/30 rounded-xl p-4 shadow-sm border border-secondary/20 flex flex-col gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-title-md text-title-md text-on-secondary-fixed font-bold leading-tight">
                          {locale === "mr" ? "तुम्ही RPL ब्रिजसाठी पात्र आहात" : "RPL Fast-Track Eligible"}
                        </h3>
                        <span className="font-label-sm text-label-sm text-secondary font-semibold">
                          Recognition of Prior Learning Pathway
                        </span>
                      </div>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface mt-1 leading-relaxed">
                      {locale === "mr" ? (
                        <>४५० तासांच्या नियमित वर्गाऐवजी फक्त <strong className="text-secondary">३० तासांच्या ब्रिज मॉड्युलने</strong> थेट कौशल्य प्रमाणपत्राकडे वाटचाल शक्य.</>
                      ) : (
                        <>Instead of 450 hours of standard training, a fast-track <strong className="text-secondary">30-hour bridge module</strong> prepares you for formal skill certification.</>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-2 pt-2 bg-surface-container-lowest/80 rounded-lg p-2.5 border border-surface-variant/30">
                      <AlertCircle className="w-4 h-4 text-outline shrink-0" />
                      <span className="font-body-sm text-body-sm text-outline-variant font-medium leading-snug">
                        {passportData.rpl.disclaimer}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom CTA to My Paths */}
              <div className="mt-6 mb-4">
                <Link
                  href="/pathways"
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-primary text-on-primary flex items-center justify-center gap-2 shadow-md active:bg-primary-container transition-all group font-title-md text-title-md font-bold"
                >
                  <span>{locale === "mr" ? "माझे पर्याय पहा" : "Explore My Paths"}</span>
                  <span className="font-body-md text-body-md text-primary-fixed-dim font-medium">
                    (3 Matched)
                  </span>
                  <ArrowRight className="w-5 h-5 text-on-primary transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
