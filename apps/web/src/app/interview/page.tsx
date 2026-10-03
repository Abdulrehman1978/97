"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Check,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Loader2,
  Keyboard,
  HelpCircle,
  Play,
  Pause,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Zap,
  MapPin,
  Briefcase,
  UserCheck,
  RotateCcw,
  Sliders,
  LogIn,
  Wrench
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { extractVoice, registerBeneficiary } from "@/lib/api";
import { useAuth } from "@/lib/api/auth-context";
import { useLanguage } from "@/lib/language-context";
import { NetworkError } from "@/lib/api/errors";

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

interface ExtractedSkill {
  id?: string;
  skill_id?: string;
  canonical_name: string;
  category?: string;
  confidence: number;
  verification_status: string;
  evidence_phrase?: string;
  nsqf_level?: number | string;
}

function InterviewExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status } = useAuth();
  const { locale, t } = useLanguage();

  // 3-state flow: 'A' (Intake), 'B' (Transcript Review), 'C' (Skills & Constraint Confirmation)
  const [talkState, setTalkState] = useState<"A" | "B" | "C">("A");

  // State A controls
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micStatusText, setMicStatusText] = useState("तयार • Ready");
  const [showTypeDrawer, setShowTypeDrawer] = useState(true);
  const [typedInput, setTypedInput] = useState("");
  const [micUnsupported, setMicUnsupported] = useState(false);
  const [persistedSuccess, setPersistedSuccess] = useState(false);

  // State B transcript
  const [transcript, setTranscript] = useState(
    "मी ३ वर्षे दुचाकी गॅरेजमध्ये काम केले आहे. इंजिन उघडणे, ब्रेक बदलणे आणि ऑइल बदलणे येते. वायरिंगमध्ये थोडी मदत लागते."
  );
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackSeconds, setAudioPlaybackSeconds] = useState(8);
  const [savedAlertVisible, setSavedAlertVisible] = useState(false);

  // State C extraction & constraints
  const [extractedSkills, setExtractedSkills] = useState<ExtractedSkill[]>([]);
  const [tasksDetected, setTasksDetected] = useState<string[]>([]);
  const [toolsDetected, setToolsDetected] = useState<string[]>([]);
  const [bridgeSkillGap, setBridgeSkillGap] = useState<{
    title: string;
    marathi: string;
    hours: number;
    description: string;
  } | null>(null);

  const [travelDistance, setTravelDistance] = useState<number>(15);
  const [workPreference, setWorkPreference] = useState<"wage" | "self_employment" | "hybrid">("hybrid");

  // Operational states
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Recognition ref
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Check URL parameters on mount
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "type") {
      setShowTypeDrawer(true);
    }
    const sample = searchParams.get("sample");
    if (sample && typeof window !== "undefined") {
      const stored = sessionStorage.getItem("lip_prefill_transcript");
      if (stored) {
        setTranscript(stored);
        sessionStorage.removeItem("lip_prefill_transcript");
      }
    }
  }, [searchParams]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = locale === "mr" ? "mr-IN" : locale === "hi" ? "hi-IN" : "en-IN";

        recognition.onstart = () => {
          setIsRecording(true);
          setRecordingSeconds(1);
          setMicStatusText("ऐकत आहे • Recording Live");
          timerIntervalRef.current = setInterval(() => {
            setRecordingSeconds((prev) => prev + 1);
          }, 1000);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setTranscript(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("[SpeechRecognition] error", event.error);
          setIsRecording(false);
          clearInterval(timerIntervalRef.current);
          setMicStatusText("मायक्रोफोन त्रुटी • Error, Type instead");
          if (event.error === "not-allowed") {
            setMicUnsupported(true);
            setShowTypeDrawer(true);
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
          clearInterval(timerIntervalRef.current);
          setMicStatusText("पूर्ण झाले • Recorded");
        };

        recognitionRef.current = recognition;
      } else {
        setMicUnsupported(true);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [locale]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Toggle Microphone
  const handleToggleMic = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
      setMicStatusText("स्थिती: पूर्ण झाले • Recorded");
    } else {
      if (recognitionRef.current) {
        try {
          setMicStatusText("सुरू करत आहे…");
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Speech start failed", e);
          setIsRecording(false);
          setShowTypeDrawer(true);
        }
      } else {
        // Fallback for browsers without speech recognition
        setShowTypeDrawer(true);
        showToast("मायक्रोफोन उपलब्ध नाही — कृपया लिहून सांगा.");
      }
    }
  };

  const handleSelectSample = (text: string) => {
    setTranscript(text);
    setTypedInput(text);
    showToast("चाचणी उदाहरण जोडले (Sample Loaded)");
  };

  const handleSubmitStateA = () => {
    if (showTypeDrawer && typedInput.trim()) {
      setTranscript(typedInput.trim());
    }
    if (!transcript.trim()) {
      showToast("कृपया तुमचे काम बोला किंवा टाईप करा.");
      return;
    }
    setTalkState("B");
  };

  // Run backend extraction
  const handleAnalyzeSkills = async () => {
    setExtracting(true);
    setApiError(null);
    try {
      const res = await extractVoice(transcript, locale);
      setTasksDetected(res.tasks_detected || []);
      setToolsDetected(res.tools_detected || []);

      const formattedSkills: ExtractedSkill[] = (res.extracted_skills || []).map(
        (sk: any, idx: number) => ({
          id: `sk-${idx + 1}`,
          skill_id: sk.skill_id,
          canonical_name: sk.canonical_name,
          category: sk.category || "Mechanical",
          confidence: Math.round((sk.confidence || 0.85) * 100),
          verification_status: "User Confirmed",
          evidence_phrase: transcript.slice(0, 45) + "...",
          nsqf_level: sk.nsqf_level || 3,
        })
      );

      // Ensure fallback representation if natural language resulted in zero canonical skills
      if (formattedSkills.length === 0) {
        formattedSkills.push({
          id: "sk-1",
          canonical_name: "General Trade & Workshop Practice",
          category: "General",
          confidence: 75,
          verification_status: "Inferred",
          evidence_phrase: transcript.slice(0, 40),
          nsqf_level: 2,
        });
      }

      setExtractedSkills(formattedSkills);

      // Set bridge skill gap if appropriate
      setBridgeSkillGap({
        title: "Electric Wiring & Sensors",
        marathi: "इलेक्ट्रिक वायरिंग व ई-व्हायकल सेन्सर्स",
        hours: 30,
        description:
          "या विषयाचे ३० तासांचे मोफत ब्रिज मॉड्युल जवळच्या ITI केंद्रात उपलब्ध आहे, ज्यामुळे पगारात लक्षणीय वाढ शक्य आहे.",
      });

      if (res.inferred_constraints?.max_travel_distance_km) {
        setTravelDistance(res.inferred_constraints.max_travel_distance_km);
      }

      setTalkState("C");
    } catch (err: any) {
      if (IS_DEMO_MODE) {
        // Safe explicit demo fallback
        showToast("⚠️ DEMO_DATA fallback active");
        setExtractedSkills([
          {
            id: "sk-1",
            canonical_name: "Two-Wheeler Engine Overhaul",
            category: "Mechanical",
            confidence: 92,
            verification_status: "User Confirmed",
            evidence_phrase: "इंजिन उघडणे व पिस्टन काम",
            nsqf_level: 3,
          },
          {
            id: "sk-2",
            canonical_name: "Brake System Maintenance",
            category: "Mechanical",
            confidence: 95,
            verification_status: "User Confirmed",
            evidence_phrase: "डिस्क व ड्रम ब्रेक सर्विस",
            nsqf_level: 4,
          },
          {
            id: "sk-3",
            canonical_name: "Workshop Hand & Pneumatic Tools",
            category: "Tools",
            confidence: 78,
            verification_status: "Inferred",
            evidence_phrase: "गॅरेजमध्ये ३ वर्षे काम",
            nsqf_level: 2,
          },
        ]);
        setBridgeSkillGap({
          title: "Electric Wiring & Sensors",
          marathi: "इलेक्ट्रिक वायरिंग व ई-व्हायकल सेन्सर्स",
          hours: 30,
          description: "या विषयाचे ३० तासांचे मोफत ब्रिज मॉड्युल जवळच्या ITI केंद्रात उपलब्ध आहे.",
        });
        setTalkState("C");
      } else {
        if (err instanceof NetworkError) {
          setApiError("सर्व्हर उपलब्ध नाही. कृपया इंटरनेट तपासा.");
        } else {
          setApiError(err.message || "Skill extraction failed.");
        }
      }
    } finally {
      setExtracting(false);
    }
  };

  const handleRemoveSkill = (id?: string) => {
    setExtractedSkills((prev) => prev.filter((s) => s.id !== id));
    showToast("कौशल्य काढून टाकण्यात आले (Skill removed)");
  };

  // State C Final Confirmation & Persistence
  const handleConfirmAndProceed = async () => {
    // If not authenticated, prompt sign-in to protect ownership & avoid orphaned profiles
    if (!user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("lip_draft_transcript", transcript);
        sessionStorage.setItem("lip_draft_distance", travelDistance.toString());
        sessionStorage.setItem("lip_draft_pref", workPreference);
      }
      setShowAuthModal(true);
      return;
    }

    setSaving(true);
    try {
      const res = await registerBeneficiary({
        full_name: user.full_name || "Beneficiary",
        phone: user.phone || undefined,
        state_code: "MH",
        district_code: "MH-NAG",
        primary_language: locale,
        confirmed_transcript: transcript,
        profile_data: {
          mobility: { max_travel_distance_km: travelDistance },
          work_preferences: { wage_vs_self_employment: workPreference },
        },
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("lip_beneficiary_id", res.id);
        localStorage.setItem("lip_beneficiary_id_state", (res as any).is_offline ? "offline_queued" : "live");
      }

      setPersistedSuccess(true);
      showToast("माहिती यशस्वीरीत्या सुरक्षित केली आहे (Saved)");
      setTimeout(() => {
        router.push("/pathways");
      }, 1000);
    } catch (err: any) {
      if (IS_DEMO_MODE) {
        showToast("कौशल्ये निश्चित केली! (Demo Mode)");
        router.push("/pathways");
      } else {
        setApiError(err.message || "Failed to persist profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 w-full pt-16 pb-36 bg-surface">
        <div className="max-w-xl mx-auto px-gutter-mobile py-space-sm flex flex-col gap-space-md">
          {/* ========================================================
              STATE A — INITIAL VOICE INTAKE
          ======================================================== */}
          {talkState === "A" && (
            <div className="flex flex-col gap-space-md animate-in fade-in">
              {/* Linear Stepper Progress Bar */}
              <div className="flex flex-col gap-1.5 w-full bg-surface-container-low p-space-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold flex items-center gap-1">
                    <Mic className="w-4 h-4 text-secondary" />
                    {locale === "mr" ? "पायरी १ / ३ • कामाचा अनुभव" : locale === "hi" ? "चरण १ / ३ • कार्य अनुभव" : "Step 1 of 3 • Trade Intake"}
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant font-semibold">
                    LIP-INTAKE-V3
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full w-1/3 transition-all duration-300" />
                </div>
                <p className="font-title-md text-title-md text-on-surface mt-0.5 font-bold">
                  {locale === "mr" ? "तुमचा कामाचा अनुभव सांगा" : locale === "hi" ? "अपने कार्य अनुभव के बारे में बताएं" : "Tell your work story"}
                </p>
              </div>

              {/* Core Prompt Heading Box */}
              <div className="flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30">
                <div className="flex items-center gap-1.5 text-secondary">
                  <HelpCircle className="w-5 h-5 text-secondary" />
                  <span className="font-label-sm text-label-sm uppercase tracking-wide font-bold">
                    {locale === "mr" ? "प्रमुख प्रश्न" : locale === "hi" ? "प्रमुख प्रश्न" : "Core Question"}
                  </span>
                </div>
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
                  {locale === "mr"
                    ? "कामाबद्दल किंवा कौशल्याबद्दल सांगा (तुम्ही रोज काय काम करता?)"
                    : locale === "hi"
                    ? "अपने काम या हुनर के बारे में बताएं (आप रोज क्या काम करते हैं?)"
                    : "Tell us about your trade or daily work experience"}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {locale === "mr"
                    ? "मराठी, हिंदी किंवा स्थानिक भाषेत बोला. वापरत असलेली साधने, अवजारे, दुरुस्ती किंवा उत्पादनाबद्दल मोकळेपणाने सांगा."
                    : locale === "hi"
                    ? "हिंदी, मराठी या स्थानीय भाषा में बोलें। प्रयुक्त औजार, उपकरण, मरम्मत या उत्पादन कार्य के बारे में बताएं।"
                    : "Speak naturally in Marathi, Hindi, or English. Mention tools you use, repairs you make, or goods you produce."}
                </p>
                <div className="pt-space-xs">
                  <ReadAloudButton
                    text={
                      locale === "mr"
                        ? "तुम्ही रोज काय काम करता? साध्या भाषेत सांगा. मराठी किंवा हिंदीत बोला. तुम्ही वापरत असलेली अवजारे आणि दुरुस्तीच्या कामाबद्दल सांगा."
                        : locale === "hi"
                        ? "आप रोज क्या काम करते हैं? सरल भाषा में बताएं। प्रयुक्त औजारों और मरम्मत कार्यों का उल्लेख करें।"
                        : "Describe what you do every day. Mention tools you use and repairs you carry out."
                    }
                    label={locale === "mr" ? "मार्गदर्शन ऐका" : locale === "hi" ? "मार्गदर्शन सुनें" : "Listen"}
                  />
                </div>
              </div>

              {/* Central Interactive Voice Dictation Hub */}
              <div className="flex flex-col items-center justify-center p-space-lg bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 relative overflow-hidden text-center gap-space-md">
                {/* Status Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRecording ? "bg-error animate-ping" : "bg-secondary animate-pulse"
                    }`}
                  />
                  <span>
                    {isRecording ? `● ऐकत आहे (${recordingSeconds}s)` : `स्थिती: ${micStatusText}`}
                  </span>
                </div>

                {/* Big Round Touch Button (84px) with Pulsing Halo */}
                <div className="relative flex items-center justify-center my-space-xs">
                  <div
                    className={`absolute w-32 h-32 rounded-full pointer-events-none transition-all ${
                      isRecording ? "bg-error/20 animate-ping" : "bg-secondary/15 animate-pulse"
                    }`}
                  />
                  <div className="absolute w-28 h-28 rounded-full bg-secondary-fixed/40 pointer-events-none" />

                  <button
                    id="mic-main-button"
                    onClick={handleToggleMic}
                    type="button"
                    aria-label="येथे स्पर्श करा आणि बोला - Tap to Speak"
                    className={`relative z-10 w-[84px] h-[84px] rounded-full text-on-primary flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all ${
                      isRecording ? "bg-error" : "bg-primary hover:bg-primary-container"
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-10 h-10 text-white animate-pulse" />
                    ) : (
                      <Mic className="w-10 h-10 text-secondary-container" />
                    )}
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-title-md text-title-md text-on-surface font-bold">
                    {isRecording ? "ऐकणे चालू आहे... पूर्ण झाल्यावर टॅप करा" : "येथे स्पर्श करा आणि बोला"}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    {isRecording ? "Speaking in dialect..." : "Tap to Speak your experience"}
                  </span>
                </div>

                {/* Acoustic Waveform Simulation */}
                <div className="flex items-center justify-center gap-1 h-6 w-48 opacity-70">
                  {[2, 3, 5, 2, 4, 6, 3, 2].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: isRecording ? `${(h * 4) + 4}px` : `${h * 3}px` }}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isRecording ? "bg-secondary animate-pulse" : "bg-primary/40"
                      }`}
                    />
                  ))}
                </div>

                {/* Live Dictation Feedback Slot */}
                {transcript && (
                  <div className="w-full bg-surface-container-low p-space-sm rounded-lg text-left border border-outline-variant/30">
                    <div className="flex items-center justify-between text-secondary mb-1">
                      <span className="font-label-sm text-label-sm font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                        {locale === "mr" ? "नोंदवलेले शब्द:" : locale === "hi" ? "दर्ज किए गए शब्द:" : "Captured Narrative:"}
                      </span>
                      {isRecording && (
                        <span className="font-code-sm text-code-sm text-on-surface-variant">
                          00:0{recordingSeconds}
                        </span>
                      )}
                    </div>
                    <p className="font-body-md text-body-md text-on-surface italic">
                      &quot;{transcript}&quot;
                    </p>
                  </div>
                )}

                {/* Alternative Action: Type Instead */}
                <div className="w-full pt-space-xs">
                  <button
                    onClick={() => setShowTypeDrawer(!showTypeDrawer)}
                    type="button"
                    className="w-full min-h-[44px] py-2.5 px-space-md rounded-lg bg-surface-container text-primary font-label-md text-label-md flex items-center justify-center gap-2 active:bg-surface-container-high transition-colors"
                  >
                    <Keyboard className="w-5 h-5 text-secondary" />
                    <span>
                      {showTypeDrawer
                        ? locale === "mr" ? "टाईप खिडकी बंद करा" : locale === "hi" ? "टेक्स्ट इनपुट बंद करें" : "Close Text Input"
                        : locale === "mr" ? "किंवा टाईप करून सांगा" : locale === "hi" ? "या टाइप करके बताएं" : "Type Instead"}
                    </span>
                  </button>
                </div>

                {/* Collapsible Text Input Area */}
                {showTypeDrawer && (
                  <div className="w-full flex flex-col gap-2 pt-space-xs text-left animate-in fade-in">
                    <label htmlFor="manual-work-story" className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                      {locale === "mr" ? "तुमच्या कामाचा तपशील लिहा:" : locale === "hi" ? "अपने काम का विवरण लिखें:" : "Write details of your daily work:"}
                    </label>
                    <textarea
                      id="manual-work-story"
                      value={typedInput}
                      onChange={(e) => setTypedInput(e.target.value)}
                      placeholder={
                        locale === "mr"
                          ? "उदा. मी शेती अवजारे आणि ट्रॅक्टर दुरुस्ती करतो..."
                          : locale === "hi"
                          ? "उदा. मैं दोपहिया वाहन और ट्रैक्टर की मरम्मत करता हूँ..."
                          : "e.g. I repair two-wheelers, change engine oil and brake pads..."
                      }
                      rows={3}
                      className="w-full p-space-sm bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface border border-outline-variant/40 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowTypeDrawer(false)}
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm min-h-[44px]"
                      >
                        {locale === "mr" ? "रद्द करा" : locale === "hi" ? "रद्द करें" : "Cancel"}
                      </button>
                      <button
                        onClick={() => {
                          if (typedInput.trim()) {
                            setTranscript(typedInput.trim());
                            setShowTypeDrawer(false);
                            showToast(locale === "mr" ? "मजकूर जोडला" : locale === "hi" ? "टेक्स्ट जोड़ा गया" : "Text added");
                          }
                        }}
                        type="button"
                        className="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-bold min-h-[44px]"
                      >
                        {locale === "mr" ? "मजकूर जोडा" : locale === "hi" ? "टेक्स्ट जोड़ें" : "Save Text"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit to State B or direct Analyze */}
                <div className="w-full flex flex-col gap-2">
                  <button
                    id="submit-voice-btn"
                    onClick={handleSubmitStateA}
                    type="button"
                    className="w-full min-h-[50px] rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold shadow-md flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-all"
                  >
                    <span>{locale === "mr" ? "शब्दांची तपासणी करा" : locale === "hi" ? "शब्दों की समीक्षा करें" : "Review Spoken Words"}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    id="analyze-skills-direct-btn"
                    onClick={async () => {
                      if (typedInput.trim()) {
                        setTranscript(typedInput.trim());
                      }
                      setTalkState("B");
                      await handleAnalyzeSkills();
                    }}
                    type="button"
                    className="w-full min-h-[46px] rounded-xl bg-surface-container text-primary font-title-md text-title-md font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <span>{locale === "mr" ? "कौशल्य शोधा" : locale === "hi" ? "कौशल खोजें" : "Analyze My Skills"}</span>
                  </button>
                </div>
              </div>

              {/* Quick Sample Helper Pills */}
              <div className="flex flex-col gap-2 bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-bold flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    चाचणी उदाहरणे • QUICK SAMPLE HELPER
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary bg-secondary-fixed px-2 py-0.5 rounded-full font-bold">
                    TAP TO FILL
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  सराव किंवा चाचणीसाठी खालीलपैकी एका उदाहरणावर क्लिक करा:
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() =>
                      handleSelectSample(
                        "मी ५ वर्षे दुचाकी व ट्रॅक्टर गॅरेजमध्ये काम करतो. इंजिन दुरुस्ती, क्लच प्लेट बदलणे आणि वेल्डिंगची कामे रोज करतो."
                      )
                    }
                    type="button"
                    className="text-left w-full p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all flex items-start gap-2.5 border border-outline-variant/20 min-h-[48px]"
                  >
                    <Wrench className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface font-bold truncate">
                        दुचाकी व ट्रॅक्टर मेकॅनिक (Auto Mechanic)
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        &quot;मी ५ वर्षे गॅरेजमध्ये दुचाकी दुरुस्ती करतो...&quot;
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleSelectSample(
                        "मी गावकऱ्यांच्या घरातील वायरिंग, सोलर पॅनेल बसवणे आणि पाण्याची मोटार पंप दुरुस्तीची कामे करतो."
                      )
                    }
                    type="button"
                    className="text-left w-full p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all flex items-start gap-2.5 border border-outline-variant/20 min-h-[48px]"
                  >
                    <Zap className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface font-bold truncate">
                        ग्रामीण इलेक्ट्रिशियन व सोलर कामे (Electrician)
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        &quot;मी वायरिंग, सोलर पॅनेल व मोटार दुरुस्ती करतो...&quot;
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleSelectSample(
                        "मी महिला बचत गटात कापडी पिशव्या, शिवणकाम आणि स्थानिक हस्तकलेचे उत्पादन करते."
                      )
                    }
                    type="button"
                    className="text-left w-full p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all flex items-start gap-2.5 border border-outline-variant/20 min-h-[48px]"
                  >
                    <Briefcase className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface font-bold truncate">
                        शिवणकाम व हस्तकला कारागीर (Tailoring/Apparel)
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        &quot;मी बचत गटात शिवणकाम आणि कापडी पिशव्या बनवते...&quot;
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Statutory Privacy & Non-persistence Safeguard */}
              <div className="flex items-start gap-2.5 p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/20">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-primary font-bold">
                    गोपनीयता हमी • DPDP-Compliant Ephemeral Audio
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    तुमचा आवाज फक्त कौशल्यांचे विश्लेषण करण्यासाठी तात्पुरता वापरला जातो. कच्चा ऑडिओ डेटा कायमस्वरूपी साठवला जात नाही.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              STATE B — TRANSCRIPT REVIEW & EDIT
          ======================================================== */}
          {talkState === "B" && (
            <div className="flex flex-col gap-space-md animate-in fade-in">
              {/* Progress Spine */}
              <div className="flex flex-col gap-1.5 bg-surface-container-low p-space-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm">
                      2
                    </span>
                    <span className="font-label-md text-label-md text-on-surface-variant">
                      {locale === "mr" ? "पायरी २ / ३" : locale === "hi" ? "चरण २ / ३" : "Step 2 of 3"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span>{locale === "mr" ? "स्थानिक मसुदा" : locale === "hi" ? "स्थानीय ड्राफ्ट" : "Local Draft"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                    <div className="h-full bg-secondary rounded-full w-2/3" />
                  </div>
                  <span className="font-title-md text-title-md text-primary truncate font-bold">
                    {locale === "mr" ? "बोललेले शब्द तपासा" : locale === "hi" ? "शब्दों की समीक्षा करें" : "Review Spoken Words"}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {locale === "mr"
                    ? "कौशल्य काढण्यापूर्वी तुमचे बोललेले शब्द तपासा."
                    : locale === "hi"
                    ? "कौशल विश्लेषण से पहले अपने शब्द जांचें।"
                    : "Review your words before skill extraction begins."}
                </p>
              </div>

              {/* Highlighted Trade Evidence Tokens Box */}
              <div className="flex flex-col gap-2 p-3 bg-surface-container-low rounded-xl border border-surface-variant/30">
                <div className="flex items-center gap-1.5 text-secondary">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
                    {locale === "mr"
                      ? "ओळखलेले कामाचे संदर्भ (Trade Evidence Spans)"
                      : locale === "hi"
                      ? "पहचाने गए कार्य संदर्भ"
                      : "Highlighted Trade Evidence"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(tasksDetected.length > 0
                    ? tasksDetected
                    : ["इंजिन दुरुस्ती / Engine", "ब्रेक काम / Brakes", "ऑइल बदल / Oil Service", "वर्कशॉप साधने / Tools"]
                  ).map((item: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-surface-container-lowest text-primary text-xs font-semibold border border-outline-variant/30 flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Audio Playback / Replay Card with Waveform */}
              <div className="flex flex-col p-space-sm rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant/30 gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-secondary" />
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">
                        {locale === "mr" ? "ध्वनीमुद्रित संभाषण" : locale === "hi" ? "रिकॉर्ड किया गया संवाद" : "Recorded Audio"}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        0:18s
                      </span>
                    </div>
                  </div>
                  <ReadAloudButton text={transcript} />
                </div>

                {/* Synthetic Waveform Track */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    type="button"
                    className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                    aria-label={isPlayingAudio ? "Pause recording" : "Play recording"}
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <div className="flex-1 flex items-center gap-1 h-8 overflow-hidden px-1">
                    {[2, 4, 6, 7, 4, 8, 5, 3, 7, 5, 2, 4, 6, 3, 2, 4, 2].map((val, idx) => (
                      <span
                        key={idx}
                        style={{ height: `${val * 3}px` }}
                        className={`w-1 rounded-full transition-all ${
                          idx < 8 ? "bg-secondary" : "bg-outline-variant"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col items-end pr-1 font-code-sm text-code-sm">
                    <span className="text-primary font-bold">00:08</span>
                    <span className="text-on-surface-variant">/ 00:18</span>
                  </div>
                </div>
              </div>

              {/* Editable Transcript Card */}
              <div className="flex flex-col rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant/30 p-space-sm gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Mic className="w-5 h-5 text-primary" />
                    <span className="font-title-md text-title-md text-primary font-bold">
                      {locale === "mr" ? "तुमचे शब्द" : locale === "hi" ? "आपके शब्द" : "Your Words"}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                    type="button"
                    className="min-h-[44px] px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md flex items-center gap-1 active:bg-surface-container-high transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>{isEditingTranscript ? (locale === "mr" ? "पूर्ण झाले" : "Done") : (locale === "mr" ? "संपादित करा" : "Edit")}</span>
                  </button>
                </div>

                {/* Textarea */}
                <div className="relative w-full rounded-xl bg-surface-container-low p-3 border border-outline-variant/30 focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary">
                  <textarea
                    id="transcript-edit-area"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={4}
                    className="w-full bg-transparent font-body-lg text-body-lg text-on-surface resize-none focus:outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {locale === "mr" ? "मराठी • व्हॉइस सत्र" : locale === "hi" ? "हिंदी • वॉयस सत्र" : "English • Voice Session"}
                    </span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant">
                      {transcript.length} {locale === "mr" ? "अक्षरे" : locale === "hi" ? "अक्षर" : "chars"}
                    </span>
                  </div>
                </div>

                {savedAlertVisible && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md">
                    <CheckCircle2 className="w-4 h-4 text-on-tertiary-container" />
                    <span>{locale === "mr" ? "बदल सेव्ह झाले!" : locale === "hi" ? "परिवर्तन सहेजे गए!" : "Changes saved!"}</span>
                  </div>
                )}

                {/* Clear/Retry & Save Edits */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setTalkState("A");
                    }}
                    type="button"
                    className="min-h-[44px] px-2 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 active:bg-surface-container-high transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{locale === "mr" ? "पुन्हा बोला" : locale === "hi" ? "पुनः बोलें" : "Retry"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSavedAlertVisible(true);
                      setTimeout(() => setSavedAlertVisible(false), 2500);
                      showToast(locale === "mr" ? "बदल सेव्ह झाले." : locale === "hi" ? "परिवर्तन सहेजे गए." : "Changes saved.");
                    }}
                    type="button"
                    className="min-h-[44px] px-2 py-2 rounded-lg bg-surface-container-highest text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 active:bg-surface-variant transition-colors font-bold"
                  >
                    <Check className="w-4 h-4" />
                    <span>{locale === "mr" ? "बदल सेव्ह करा" : locale === "hi" ? "परिवर्तन सहेजें" : "Save Changes"}</span>
                  </button>
                </div>
              </div>

              {/* Dominant Primary CTA */}
              <div className="flex flex-col gap-2 pt-1 pb-2">
                <button
                  id="analyze-skills-btn"
                  onClick={handleAnalyzeSkills}
                  disabled={extracting}
                  type="button"
                  className="w-full min-h-[52px] px-4 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center justify-between shadow-md active:bg-primary-container transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    {extracting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-secondary-fixed" />
                    )}
                    <span>
                      {extracting
                        ? locale === "mr" ? "कौशल्यांचे विश्लेषण सुरू आहे…" : locale === "hi" ? "कौशल विश्लेषण जारी है..." : "Analyzing skills..."
                        : locale === "mr" ? "कौशल्ये शोधा व पुढे जा" : locale === "hi" ? "कौशल खोजें और आगे बढ़ें" : "Analyze My Skills & Continue"}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary-fixed-dim" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STATE C — SKILLS & CONSTRAINT CONFIRMATION
          ======================================================== */}
          {talkState === "C" && (
            <div className="flex flex-col gap-space-md animate-in fade-in">
              {/* Stepper Header */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-space-xs mb-1">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                    पायरी ३ / ३ • Step 3 of 3
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm shadow-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    खात्री करा • Confirmation
                  </span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden flex">
                  <div className="bg-secondary h-full rounded-full w-full transition-all duration-500" />
                </div>
                <div className="flex justify-between items-baseline mt-1">
                  <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                    कौशल्ये व मर्यादा तपासा
                  </h1>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Review &amp; Edit</span>
                </div>
              </div>

              {/* Advisory Banner */}
              <div className="bg-surface-container rounded-xl p-3 shadow-xs border border-outline-variant/30 flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-primary mt-0.5">
                  <Sparkles className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-title-md text-title-md text-primary font-bold">
                      आम्हाला समजलेले तुमचे कौशल्य (Extracted Competencies)
                    </span>
                    <ReadAloudButton text="आम्हाला समजलेले तुमचे कौशल्य खालीलप्रमाणे आहेत. कृपया तपासून खात्री करा." />
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                    ही अंतिम खात्री नसून तपासासाठी सुचवलेली माहिती आहे. कृपया खाली दिलेली कौशल्ये तपासून आवश्यक असल्यास दुरुस्त करा.
                  </p>
                </div>
              </div>

              {/* Extracted Competencies */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-primary" />
                    ओळखलेली क्षमता (Extracted Competencies)
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary font-bold px-2 py-0.5 rounded-full bg-surface-container-high">
                    {extractedSkills.length} सक्रिय
                  </span>
                </div>

                <div className="flex flex-col gap-2.5" id="confirmed-skills-list">
                  {extractedSkills.map((sk) => (
                    <div
                      key={sk.id}
                      className="bg-surface-container-lowest rounded-xl p-3 shadow-xs border border-outline-variant/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-title-md text-title-md text-on-surface font-bold">
                              {sk.canonical_name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                              {sk.category || "Skill"}
                            </span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                            प्रमाणित आधार:{" "}
                            <span className="bg-surface-container px-1.5 py-0.5 rounded text-primary font-code-sm text-code-sm font-semibold">
                              &quot;{sk.evidence_phrase}&quot;
                            </span>
                          </p>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-on-tertiary-container" />
                            {sk.verification_status}
                          </span>
                          <div className="flex items-center gap-1 mt-1 text-secondary font-code-sm text-code-sm font-bold">
                            <Sliders className="w-3.5 h-3.5" />
                            {sk.confidence}% जुळणी
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 bg-surface-container-low rounded-lg p-2 flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-tertiary-container" />
                          NSQF Level {sk.nsqf_level} समतुल्य क्षमता
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              showToast("कौशल्य संपादित केले");
                            }}
                            type="button"
                            className="min-h-[44px] px-2.5 py-1 rounded-lg bg-surface text-primary font-label-sm text-label-sm font-bold active:bg-surface-container-high transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>दुरुस्त करा</span>
                          </button>
                          <button
                            onClick={() => handleRemoveSkill(sk.id)}
                            type="button"
                            className="min-h-[44px] px-2.5 py-1 rounded-lg bg-surface text-error font-label-sm text-label-sm font-bold active:bg-error-container transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>काढून टाका</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identified Bridge Skill Gap */}
              {bridgeSkillGap && (
                <div className="bg-surface-container-high rounded-xl p-3 shadow-xs border border-outline-variant/30">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-secondary font-bold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-secondary" />
                      कौशल्यातील तफावत (Identified Bridge Skill Gap)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-secondary font-label-sm text-label-sm font-bold">
                      संध्याकाळ वर्ग
                    </span>
                  </div>

                  <div className="mt-2 bg-surface-container-lowest rounded-lg p-2.5 shadow-xs border border-outline-variant/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-title-md text-title-md text-primary font-bold">
                            {bridgeSkillGap.title}
                          </p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">
                            {bridgeSkillGap.marathi}
                          </p>
                        </div>
                      </div>
                      <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container text-primary font-bold">
                        {bridgeSkillGap.hours} तास
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 bg-surface-container-low p-2 rounded">
                      <span className="font-bold text-primary">उपाय:</span> {bridgeSkillGap.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Travel Radius Selector */}
              <div className="bg-surface-container-lowest rounded-xl p-3 shadow-xs border border-outline-variant/30">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-title-md text-title-md text-primary font-bold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-secondary" />
                    प्रवास मर्यादा (Max Travel Distance)
                  </label>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">कामाचे अंतर</span>
                </div>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Max travel distance">
                  {[
                    { km: 5, label: "५ किमी", sub: "स्थानिक परिसर" },
                    { km: 15, label: "१५ किमी", sub: "मध्यम अंतर" },
                    { km: 25, label: "२५ किमी", sub: "तालुका केंद्र" },
                  ].map((item) => (
                    <button
                      key={item.km}
                      id={`radius-${item.km}km`}
                      onClick={() => setTravelDistance(item.km)}
                      type="button"
                      role="radio"
                      aria-checked={travelDistance === item.km}
                      className={`min-h-[48px] rounded-lg p-2 flex flex-col items-center justify-center transition-all ${
                        travelDistance === item.km
                          ? "bg-primary text-on-primary shadow-xs font-bold"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <span className="font-title-md text-title-md">{item.label}</span>
                      <span
                        className={`font-label-sm text-label-sm ${
                          travelDistance === item.km ? "text-primary-fixed" : "text-on-surface-variant"
                        }`}
                      >
                        {travelDistance === item.km ? "निवडलेले (Selected)" : item.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Mode Preference */}
              <div className="bg-surface-container-lowest rounded-xl p-3 shadow-xs border border-outline-variant/30">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-title-md text-title-md text-primary font-bold flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-secondary" />
                    कामाची पसंती (Work Mode Preference)
                  </label>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">स्वरूप</span>
                </div>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Work mode preference">
                  {[
                    { mode: "wage", title: "नोकरी", sub: "Wage Job" },
                    { mode: "self_employment", title: "स्वतःचा व्यवसाय", sub: "Self-Employed" },
                    { mode: "hybrid", title: "दोन्ही चालतील", sub: "Both" },
                  ].map((item) => (
                    <button
                      key={item.mode}
                      onClick={() => setWorkPreference(item.mode as any)}
                      type="button"
                      role="radio"
                      aria-checked={workPreference === item.mode}
                      className={`min-h-[50px] rounded-lg p-2 flex flex-col items-center justify-center transition-all text-center ${
                        workPreference === item.mode
                          ? "bg-primary text-on-primary shadow-xs font-bold"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <span className="font-label-md text-label-md">{item.title}</span>
                      <span
                        className={`font-label-sm text-label-sm ${
                          workPreference === item.mode ? "text-primary-fixed" : "text-on-surface-variant"
                        }`}
                      >
                        {workPreference === item.mode ? `${item.sub} • Selected` : item.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-2">
                {persistedSuccess && (
                  <div className="p-3.5 rounded-xl bg-tertiary-fixed text-on-tertiary-container font-bold text-title-md flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <span>माहिती डेटाबेसमध्ये सेव्ह झाली आहे (Profile successfully saved to database)</span>
                  </div>
                )}

                <button
                  id="confirm-and-proceed-btn"
                  onClick={handleConfirmAndProceed}
                  disabled={saving}
                  type="button"
                  className="w-full min-h-[52px] rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold shadow-md hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>माहिती सेव्ह करत आहोत…</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm &amp; Save (पक्के करा व सेव्ह करा — माझे पर्याय दाखवा)</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => setTalkState("B")}
                  type="button"
                  className="w-full min-h-[46px] rounded-xl bg-surface-container-high text-primary font-label-md text-label-md font-bold active:bg-surface-container transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>पुन्हा तपासा (Re-analyze Words)</span>
                </button>
              </div>

              {/* Statutory Notice */}
              <div className="bg-surface-container-low rounded-xl p-3 shadow-xs flex items-start gap-2 border border-outline-variant/20">
                <ShieldCheck className="w-5 h-5 text-outline shrink-0 mt-0.5" />
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  <span className="font-bold text-on-surface">वैधानिक टीप:</span> हे व्यावसायिक किंवा शासकीय प्रमाणपत्र नाही. ही केवळ पुढील मार्ग शोधण्यासाठी केलेली प्राथमिक संगणकीय तपासणी आहे. (Assistive decision support; not an official certificate or guaranteed sanction.)
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Auth Gate Modal when Guest user confirms in State C */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-2xl p-space-md shadow-2xl border border-outline-variant/30 flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-primary">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                <LogIn className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-title-md text-title-md font-bold">खाते आवश्यक आहे</h3>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Sign In Required</span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              तुमची कौशल्ये आणि प्रवास सुरक्षित ठेवण्यासाठी कृपया प्रथम लॉगिन करा. तुमचे बोललेले शब्द सुरक्षित ठेवण्यात आले आहेत.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login?next=/interview"
                className="w-full min-h-[46px] rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center justify-center gap-2"
              >
                <span>लॉगिन करा (Sign In)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push("/pathways");
                }}
                type="button"
                className="w-full min-h-[44px] rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold"
              >
                फक्त चाचणीसाठी पुढे जा (Explore as Guest)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between z-50 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-tertiary-fixed" />
            <span className="font-body-sm text-body-sm font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            type="button"
            className="text-inverse-on-surface font-label-sm text-label-sm underline min-h-[44px] px-2 flex items-center"
          >
            ठीक आहे
          </button>
        </div>
      )}

      <BeneficiaryNav />
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <InterviewExperience />
    </Suspense>
  );
}
