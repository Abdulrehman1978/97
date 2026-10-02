"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic,
  ArrowRight,
  Edit3,
  History,
  Volume2,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Wrench,
  Scissors,
  HelpCircle,
  Lock,
  Layers,
  Award
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { useLanguage } from "@/lib/language-context";

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function HomePage() {
  const router = useRouter();
  const { locale, t } = useLanguage();

  const handleLaunchVoice = () => {
    router.push("/interview");
  };

  const handleTypeInstead = () => {
    router.push("/interview?mode=type");
  };

  const handleContinueJourney = () => {
    router.push("/journey");
  };

  const handleLoadSample = (sampleText: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("lip_prefill_transcript", sampleText);
    }
    router.push("/interview?sample=1");
  };

  const heroReadoutText =
    locale === "mr"
      ? "तुमच्या कामाला मोल आहे. कामाचा अनुभव सांगा आणि पुढचा मार्ग शोधा. बोलून सुरुवात करा किंवा लिहून सांगा."
      : locale === "hi"
      ? "आपके काम का मोल है। अपने काम का अनुभव बताएं और आगे का रास्ता खोजें। बोलकर शुरुआत करें या लिखकर बताएं।"
      : "Your trade experience has value. Describe your daily work story and discover verified livelihood pathways. Speak or type to start.";

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 w-full pt-16 pb-24 md:pb-12 bg-surface">
        <div className="max-w-6xl mx-auto px-gutter-mobile sm:px-gutter py-space-sm sm:py-space-md">
          {/* Status Badge & Assistive Indicator */}
          <div className="flex items-center justify-between py-space-sm mb-space-xs flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed shadow-xs">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-label-sm text-label-sm tracking-wide">
                {locale === "mr"
                  ? "डेमो डेटा • DEMO DATA (Synthetic Scenario)"
                  : locale === "hi"
                  ? "डेमो डेटा • DEMO DATA (सिंथेटिक परिदृश्य)"
                  : "DEMO DATA • Synthetic Scenario"}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm bg-surface-container px-2.5 py-1 rounded-full">
              <Lock className="w-3 h-3 text-outline" />
              <span>SIH26097 • PM-AJAY GIA Assistive</span>
            </div>
          </div>

          {/* Desktop 2-column or Mobile single-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* Left Column: Hero, Civic Narrative & Primary Voice Intake */}
            <div className="lg:col-span-6 flex flex-col gap-space-md">
              {/* Hero Visual Vignette */}
              <div className="relative w-full rounded-xl overflow-hidden bg-primary-container shadow-md aspect-[16/9] max-h-64 sm:max-h-80">
                {/* Visual Representation of Skilled Worker */}
                <div className="w-full h-full bg-gradient-to-br from-primary-container via-[#001428] to-[#1a385c] flex items-center justify-center p-6 text-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(#d1e4ff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-surface-container/20 border border-secondary-fixed/30 flex items-center justify-center text-secondary-fixed shadow-inner">
                      <Wrench className="w-7 h-7" />
                    </div>
                    <span className="text-on-primary font-headline-sm text-headline-sm font-bold tracking-tight">
                      कौशल्य नोंदणी व प्रमाणीकरण
                    </span>
                    <span className="text-primary-fixed-dim font-body-sm text-body-sm max-w-xs">
                      PM-AJAY GIA Livelihood Intelligence Platform
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent pointer-events-none" />

                {/* Vignette Footer Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface/95 backdrop-blur-md shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                      कामगार नोंदणी मंच • PM-AJAY
                    </span>
                  </div>
                  <ReadAloudButton text={heroReadoutText} />
                </div>
              </div>

              {/* Dignified Civic Header */}
              <div className="flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                  {locale === "mr"
                    ? "आजीविका संधी व कौशल्य प्रमाणीकरण"
                    : locale === "hi"
                    ? "आजीविका अवसर एवं कौशल प्रमाणीकरण"
                    : "LIVELIHOOD PATHWAYS & SKILL RECOGNITION"}
                </span>
                <h1 className="font-headline-lg-mobile sm:font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface font-extrabold leading-tight">
                  {locale === "mr"
                    ? "तुमच्या कामाला मोल आहे. कामाचा अनुभव सांगा आणि पुढचा मार्ग शोधा."
                    : locale === "hi"
                    ? "आपके काम का मोल है। अपने काम का अनुभव बताएं और अगला रास्ता खोजें।"
                    : "Your trade experience has real value. Speak your story and discover verified pathways."}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {locale === "mr"
                    ? "कोणत्याही कागदपत्रांशिवाय, प्रमाणपत्रांशिवाय किंवा सरकारी इंग्रजी शब्दांशिवाय आपल्या स्थानिक बोलीत रोजचे काम सांगा."
                    : locale === "hi"
                    ? "बिना किसी दस्तावेज़, प्रमाणपत्र या जटिल शब्दों के अपनी स्थानीय भाषा में अपने दैनिक काम के बारे में बताएं।"
                    : "Describe your everyday trade experience in your own dialect. No paperwork, certificates, or bureaucratic jargon needed."}
                </p>
              </div>

              {/* Primary Voice Intake Hub */}
              <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-md border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      {locale === "mr" ? "थेट बोला • Step 1: Voice Narrative" : "Voice Intake • Step 1"}
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-outline px-2 py-0.5 rounded bg-surface-container font-semibold">
                    मराठी / Hindi / EN
                  </span>
                </div>

                {/* Pulsing Interactive Voice Trigger Button */}
                <button
                  id="home-voice-trigger-btn"
                  onClick={handleLaunchVoice}
                  type="button"
                  className="group relative flex items-center justify-between gap-3 w-full min-h-[58px] py-3.5 px-4 rounded-xl bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-container active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-primary-container text-secondary-fixed shrink-0">
                      <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="absolute -inset-1 rounded-full bg-secondary/20 animate-pulse pointer-events-none" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-title-md text-title-md font-bold tracking-tight text-on-primary">
                        {locale === "mr"
                          ? "बोलून सुरुवात करा (Start Speaking)"
                          : locale === "hi"
                          ? "बोलकर शुरुआत करें (Start Speaking)"
                          : "Start Speaking (Voice Intake)"}
                      </span>
                      <span className="font-label-sm text-label-sm text-primary-fixed-dim">
                        {locale === "mr"
                          ? "टॅप करा व आपल्या दैनंदिन कामाविषयी सांगा"
                          : locale === "hi"
                          ? "टैप करें और अपने दैनिक काम के बारे में बताएं"
                          : "Tap and describe your daily trade and tasks"}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary-fixed-dim group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                {/* Alternative Actions: Type Instead / Continue Journey */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={handleTypeInstead}
                    type="button"
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-surface-container text-on-surface flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-on-surface-variant" />
                    <span className="font-label-md text-label-md">
                      {locale === "mr" ? "किंवा लिहून सांगा" : locale === "hi" ? "या लिखकर बताएं" : "Type Instead"}
                    </span>
                  </button>
                  <button
                    onClick={handleContinueJourney}
                    type="button"
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center gap-1.5 hover:bg-surface-container-highest transition-colors"
                  >
                    <History className="w-4 h-4 text-secondary" />
                    <span className="font-label-md text-label-md font-bold">
                      {locale === "mr" ? "माझा प्रवास सुरू ठेवा" : locale === "hi" ? "मेरी यात्रा जारी रखें" : "My Journey"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: 4-Step Storyboard, Illustrative Trade Cards, Assistance & Civic Notice */}
            <div className="lg:col-span-6 flex flex-col gap-space-md">
              {/* 4-Step Progressive Storyboard */}
              <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {locale === "mr" ? "कसे काम करते? (How LUNA Works)" : "How LUNA Works"}
                  </h2>
                  <span className="font-label-sm text-label-sm text-secondary font-bold">
                    ४ सोप्या पायऱ्या
                  </span>
                </div>

                {/* Step 1 */}
                <div className="flex items-start gap-3 p-space-sm rounded-lg bg-surface-container-low">
                  <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 font-bold font-label-md">
                    1
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-title-md text-title-md text-on-surface font-semibold truncate">
                        Spoken Story (तुमची गोष्ट)
                      </h3>
                      <Mic className="w-4 h-4 text-secondary" />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Talk about your daily routines, machines used, repairs solved, or daily shop duties in your local words.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-space-sm rounded-lg bg-surface-container-low">
                  <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 font-bold font-label-md">
                    2
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-title-md text-title-md text-on-surface font-semibold truncate">
                        Evidence Spans (पुरावे शोधणे)
                      </h3>
                      <Sparkles className="w-4 h-4 text-secondary" />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Deterministic parsing extracts specific trade tools, mechanical skills, safety instincts, and raw competency points.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-space-sm rounded-lg bg-surface-container-low">
                  <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 font-bold font-label-md">
                    3
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-title-md text-title-md text-on-surface font-semibold truncate">
                        Skill &amp; RPL Mapping
                      </h3>
                      <Award className="w-4 h-4 text-secondary" />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Matches informal learning with National Skills Qualification Framework (NSQF) and RPL readiness tiers.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3 p-space-sm rounded-lg bg-surface-container-low">
                  <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 font-bold font-label-md">
                    4
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-title-md text-title-md text-on-surface font-semibold truncate">
                        Practical Action (पुढचे पाऊल)
                      </h3>
                      <ArrowRight className="w-4 h-4 text-secondary" />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Receive verified local training centers, micro-enterprise tools, or direct local apprenticeship links.
                    </p>
                  </div>
                </div>
              </div>

              {/* Illustrative Trade Examples */}
              <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {locale === "mr" ? "उदाहरणे (Sample Profiles)" : "Sample Trade Profiles"}
                  </h2>
                  <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                    [उदाहरणादाखल पर्याय]
                  </span>
                </div>

                {/* Trade Card 1: Two-Wheeler Mechanic */}
                <div className="flex flex-col p-3 rounded-xl bg-surface-container-low gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-title-md text-title-md text-on-surface font-bold">
                          दुचाकी मेकॅनिक (Motorcycle Technician)
                        </h4>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          ७ वर्षे अनुभव • ग्रामीण कार्यशाळा
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                      NSQF L3 Ready
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant font-body-sm text-body-sm italic border border-outline-variant/20">
                    &quot;मी स्पार्क प्लग, कार्बोरेटर ट्यूनिंग आणि क्लच प्लेट्स बदलण्याचे काम रोज करतो...&quot;
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-on-tertiary-container font-label-sm text-label-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-on-tertiary-container" />
                      <span>३ कौशल्ये प्रमाणित करता येतील</span>
                    </div>
                    <button
                      onClick={() =>
                        handleLoadSample(
                          "मी ३ वर्षे दुचाकी गॅरेजमध्ये काम केले आहे. इंजिन उघडणे, ब्रेक बदलणे आणि ऑइल बदलणे येते. वायरिंगमध्ये थोडी मदत लागते."
                        )
                      }
                      type="button"
                      className="text-primary font-label-md text-label-md font-bold flex items-center gap-0.5 hover:text-secondary transition-colors"
                    >
                      <span>पहा (View)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Trade Card 2: Custom Garments / Tailoring */}
                <div className="flex flex-col p-3 rounded-xl bg-surface-container-low gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-title-md text-title-md text-on-surface font-bold">
                          शिलाई व वस्त्रकाम (Custom Garments)
                        </h4>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          ४ वर्षे अनुभव • बचत गट सदस्य
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                      RPL Eligible
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant font-body-sm text-body-sm italic border border-outline-variant/20">
                    &quot;ब्लाऊज कटिंग, फॉल-पिको आणि शिलाई मशीन दुरुस्तीची सर्व कामे करतो...&quot;
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-on-tertiary-container font-label-sm text-label-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-on-tertiary-container" />
                      <span>स्वयंरोजगार कर्ज जोडणी शक्य</span>
                    </div>
                    <button
                      onClick={() =>
                        handleLoadSample(
                          "मी महिला बचत गटात कापडी पिशव्या, शिवणकाम आणि स्थानिक हस्तकलेचे उत्पादन करते. शिलाई मशीन चालवणे चांगले येते."
                        )
                      }
                      type="button"
                      className="text-primary font-label-md text-label-md font-bold flex items-center gap-0.5 hover:text-secondary transition-colors"
                    >
                      <span>पहा (View)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Field Coordinator Assistance Banner */}
              <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-high shadow-sm border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
                    <PhoneCall className="w-5 h-5 text-secondary-fixed" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-title-md text-title-md text-on-surface font-bold">
                      {locale === "mr" ? "मदत हवी आहे का?" : "Need Assistance?"}
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {locale === "mr"
                        ? "स्थानिक समन्वयकाचा मोफत कॉल मिळवा"
                        : "Connect with your local PM-AJAY coordinator"}
                    </p>
                  </div>
                </div>
                <Link
                  href="/help"
                  className="min-h-[44px] px-3.5 py-2 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-bold shadow-xs active:opacity-90 flex items-center gap-1.5"
                >
                  <span>{locale === "mr" ? "मदत केंद्र" : "Help Desk"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Civic Governance Footer Notice */}
              <div className="flex flex-col items-center text-center p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 gap-2">
                <div className="flex items-center justify-center gap-2 text-outline">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  <span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase">
                    PM-AJAY Civic Initiative • MoSJE GIA
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
                  A national demonstration project for PM-AJAY (SIH26097). Recommendations are assistive and provide decision support; they do not constitute official sanctions, loans, or guaranteed jobs.
                </p>
                <div className="flex items-center gap-4 mt-1 text-label-sm">
                  <Link href="/help?tab=privacy" className="text-secondary underline">
                    गोपनीयता धोरण (Privacy)
                  </Link>
                  <span className="text-outline-variant">•</span>
                  <Link href="/help?tab=rules" className="text-secondary underline">
                    प्रमाणन नियम (Rules)
                  </Link>
                  <span className="text-outline-variant">•</span>
                  <Link href="/demo" className="text-secondary font-bold">
                    Judge Desk
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BeneficiaryNav />
    </div>
  );
}
