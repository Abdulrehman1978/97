"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic,
  ArrowRight,
  Edit3,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  Compass,
  Wrench,
  Scissors,
  HelpCircle,
  Award,
  Layers,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { useLanguage } from "@/lib/language-context";
import { useRuntimeTruth } from "@/lib/runtime-truth-context";

export default function HomePage() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const { truthState } = useRuntimeTruth();

  const handleLaunchVoice = () => {
    router.push("/interview");
  };

  const handleTypeInstead = () => {
    router.push("/interview?mode=type");
  };

  const handleLoadSample = (sampleText: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("lip_prefill_transcript", sampleText);
    }
    router.push("/interview?sample=1");
  };

  const heroReadoutText = t(
    "home.headline",
    "Turn your real-world experience into recognized skills and certified livelihoods. Speak once. Understand your skills. See your options."
  );

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 w-full pt-16 pb-20 md:pb-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-12">
          {/* SECTION 1: EDITORIAL HERO (Desktop Split / Mobile Streamlined) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Headline, Narrative & Primary Actions */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-xs font-bold border border-outline-variant/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                  <span>{t("home.hero_badge", "Sovereign Civic Livelihood Intelligence")}</span>
                </span>
                <TruthBadge state={truthState} />
              </div>

              <div className="flex flex-col gap-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
                  {t(
                    "home.headline",
                    "Turn your real-world experience into recognized skills and certified livelihoods."
                  )}
                </h1>
                <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-2xl font-normal">
                  {t(
                    "home.subtitle",
                    "Speak in your own words. We identify your practical skills, map them to official qualifications, and connect you with local jobs and enterprise grants."
                  )}
                </p>
              </div>

              {/* Dominant Primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="home-speak-btn"
                  onClick={handleLaunchVoice}
                  className="min-h-[54px] px-8 rounded-2xl bg-primary text-on-primary font-bold text-base flex items-center justify-center gap-3 shadow-lg hover:bg-primary/95 active:scale-[0.99] transition-all group ring-4 ring-primary/10"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <span>{t("action.start_now", "Start Speaking")}</span>
                  <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="home-type-btn"
                  onClick={handleTypeInstead}
                  className="min-h-[54px] px-6 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-base flex items-center justify-center gap-2 border border-outline-variant/40 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-secondary" />
                  <span>{t("action.type_instead", "Type Instead")}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 pt-1 text-xs text-on-surface-variant">
                <ReadAloudButton text={heroReadoutText} label={t("action.listen", "Listen")} size="sm" />
                <span>•</span>
                <span>Marathi • Hindi • English supported</span>
              </div>
            </div>

            {/* Right Column: Restored Livelihood Photography & Context Overlay */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-surface-variant/40 bg-surface-container">
                <Image
                  src="/images/livelihoods/hero_mechanic.webp"
                  alt="Mechanic working on motorcycle engine in workshop"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001428]/85 via-transparent to-black/10" />

                {/* Floating Context Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                      <Wrench className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-primary">Ramesh Mesram</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                      </div>
                      <span className="text-[11px] text-on-surface-variant block">
                        3 Years Garage Experience → NSQF Level 3 RPL
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-secondary-fixed-dim bg-primary px-2.5 py-1 rounded-full text-white">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: CONCISE 4-STEP VISUAL PIPELINE */}
          <section className="bg-surface-container-low rounded-3xl p-6 sm:p-8 border border-surface-variant/30 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Structured Verification Flow
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-primary mt-0.5">
                  {t("home.pipeline.title", "How It Works in 4 Steps")}
                </h2>
              </div>
              <span className="text-xs font-code-sm text-on-surface-variant">
                Deterministic • Rule-Governed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 flex flex-col gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    {t("home.pipeline.step1_title", "Speak Your Trade")}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {t(
                      "home.pipeline.step1_desc",
                      "Describe your daily work in Marathi, Hindi, or English naturally."
                    )}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 flex flex-col gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed/40 text-secondary flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    {t("home.pipeline.step2_title", "Discover Skills")}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {t(
                      "home.pipeline.step2_desc",
                      "We extract verified competencies aligned with the National Skills Qualification Framework."
                    )}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 flex flex-col gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/40 text-on-tertiary-container flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    {t("home.pipeline.step3_title", "Compare Options")}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {t(
                      "home.pipeline.step3_desc",
                      "See wage employment, enterprise grants, and RPL certification near you."
                    )}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 flex flex-col gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    {t("home.pipeline.step4_title", "Take Action")}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {t(
                      "home.pipeline.step4_desc",
                      "Follow a step-by-step checklist with direct training center and financial linkages."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: 2 VISUAL SAMPLE PROFILES MAXIMUM */}
          <section className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Practical Proof Scenarios
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-primary mt-0.5">
                {t("home.sample_profiles_title", "Verified Local Livelihood Pathways")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile 1: Automotive Mechanic */}
              <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant/40 overflow-hidden shadow-sm flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0 bg-surface-container">
                  <Image
                    src="/images/occupations/mechanic.webp"
                    alt="Two-Wheeler Service Technician"
                    fill
                    sizes="(max-width: 640px) 100vw, 200px"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 sm:p-5 flex flex-col justify-between gap-3 flex-1">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-secondary uppercase">Wage Pathway</span>
                      <span className="text-xs font-code-sm font-semibold text-primary">₹15,000 – ₹18,500</span>
                    </div>
                    <h3 className="font-bold text-lg text-on-surface mt-1">
                      Two-Wheeler Service Technician
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      3 years garage experience recognized under NSQF Level 3 with placement in Hingna MIDC.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleLoadSample(
                        "मी 3 वर्षे वडिलांच्या गॅरेजमध्ये काम करतोय. इंजिन उघडणे, ऑइल बदलणे, ब्रेकचे काम मला चांगले जमते."
                      )
                    }
                    className="text-xs font-bold text-primary hover:text-primary/80 inline-flex items-center gap-1 self-start"
                  >
                    <span>Test Ramesh&apos;s Spoken Sample</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Profile 2: Tailoring Enterprise */}
              <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant/40 overflow-hidden shadow-sm flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0 bg-surface-container">
                  <Image
                    src="/images/occupations/tailor.webp"
                    alt="Self Employed Tailor"
                    fill
                    sizes="(max-width: 640px) 100vw, 200px"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 sm:p-5 flex flex-col justify-between gap-3 flex-1">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-secondary uppercase">Micro-Enterprise</span>
                      <span className="text-xs font-code-sm font-semibold text-primary">₹18,000 – ₹26,000</span>
                    </div>
                    <h3 className="font-bold text-lg text-on-surface mt-1">
                      Self Employed Tailor &amp; Boutique
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Garment drafting &amp; industrial stitching recognized with PM-AJAY tool grant linkage.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleLoadSample(
                        "मी ५ वर्षे घरगुती कपडे शिवण्याचे काम करत आहे. ब्लाउज डिझाइन आणि कटिंग मला चांगले जमते. मला स्वतःचे टेलरिंग दुकान सुरू करायचे आहे."
                      )
                    }
                    className="text-xs font-bold text-primary hover:text-primary/80 inline-flex items-center gap-1 self-start"
                  >
                    <span>Test Sunita&apos;s Spoken Sample</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: CONCISE TRUST / PROVENANCE & SUPPORT BANNER */}
          <section className="p-6 rounded-2xl bg-surface-container border border-surface-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 border border-outline-variant/30">
                <ShieldCheck className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-bold text-base text-primary">
                  {t("home.trust_title", "Built on Verifiable Public Data")}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {t(
                    "home.trust_desc",
                    "All recommendations are mapped to official NQR qualification packs, local industrial demand, and PM-AJAY welfare provisions."
                  )}
                </p>
              </div>
            </div>

            <Link
              href="/help"
              className="px-4 py-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-2 border border-outline-variant/30 transition-colors shrink-0"
            >
              <HelpCircle className="w-4 h-4 text-secondary" />
              <span>{t("nav.help", "Help & Grievance Desk")}</span>
            </Link>
          </section>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-outline-variant/20 bg-surface-container-lowest py-6 px-4 text-center text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>{t("brand.ministry", "Ministry of Social Justice & Empowerment • Government of India")}</span>
          <div className="flex items-center gap-4">
            <Link href="/help" className="hover:text-primary transition-colors">
              Support
            </Link>
            <span>•</span>
            <Link href="/demo" className="hover:text-primary transition-colors">
              Judge Desk
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
