"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Volume2, Sparkles, Check, ArrowRight, RefreshCw, AlertCircle, Loader2, WifiOff } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { extractVoice, registerBeneficiary } from "@/lib/api";
import { useAuth } from "@/lib/api/auth-context";
import { NetworkError } from "@/lib/api/errors";

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function InterviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(
    "मी 3 वर्षे वडिलांच्या गॅरेजमध्ये काम करतोय. इंजिन उघडणे, ऑइल बदलणे, ब्रेकचे काम मला चांगले जमते. पण वायरिंग समजायला थोडे कठीण जाते. 10 ते 15 किमी प्रवास करू शकतो."
  );
  const [extractedData, setExtractedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Distinct states: null = not yet confirmed, "success" = persisted, "offline_queued" = queued, "error" = failed
  const [confirmState, setConfirmState] = useState<null | "success" | "offline_queued" | "error">(null);
  const [savedBeneficiaryId, setSavedBeneficiaryId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [editableTravel, setEditableTravel] = useState(15);
  const [editableEdu, setEditableEdu] = useState("class_10");
  const [editablePref, setEditablePref] = useState("hybrid");
  const [apiError, setApiError] = useState<string | null>(null);
  const [demoFallback, setDemoFallback] = useState(false);

  const promptText = "तुमच्या कामाबद्दल सांगा: तुम्ही कोणते काम करता किंवा कोणती साधने वापरता? (Tell us about your work and tools you use)";

  const handleStartRecording = () => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = "mr-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        setIsRecording(false);
        runExtraction(spoken);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } else {
      setIsRecording(!isRecording);
      if (!isRecording) {
        setTimeout(() => {
          setIsRecording(false);
          runExtraction(transcript);
        }, 1500);
      }
    }
  };

  const runExtraction = async (textToExtract: string) => {
    setLoading(true);
    setApiError(null);
    setDemoFallback(false);
    try {
      const res = await extractVoice(textToExtract, "mr");
      setExtractedData(res);
      setEditableTravel(res.inferred_constraints?.max_travel_distance_km || 15);
      setEditableEdu(res.inferred_constraints?.education_level || "class_10");
      setEditablePref(res.inferred_constraints?.wage_vs_self_employment || "hybrid");
      setConfirmState(null);
    } catch (e: any) {
      if (IS_DEMO_MODE) {
        // Demo mode: explicitly labelled fallback is allowed
        setDemoFallback(true);
        setApiError("⚠️ DEMO FALLBACK ACTIVE — Backend extraction unavailable; synthetic demo data loaded.");
        const fallback = {
          tasks_detected: ["engine_repair", "brake_service", "electrical_wiring"],
          tools_detected: ["spanner", "wrench", "compressor"],
          extracted_skills: [
            { canonical_name: "Two-Wheeler Engine Overhaul", category: "Mechanical", confidence: 0.92, verification_status: "ai_inferred" },
            { canonical_name: "Brake Shoe and Disc Maintenance", category: "Mechanical", confidence: 0.95, verification_status: "ai_inferred" },
            { canonical_name: "Automotive Electrical Fault Tracing", category: "Electrical", confidence: 0.65, verification_status: "ai_inferred" }
          ],
          inferred_constraints: { max_travel_distance_km: 15, education_level: "class_10", wage_vs_self_employment: "hybrid" },
          evidence_summary: "3 years motorcycle garage experience; identified engine and brake maintenance. [DEMO_DATA]"
        };
        setExtractedData(fallback);
      } else {
        // Production: show real error, do NOT load fake data
        if (e instanceof NetworkError) {
          setApiError("सर्व्हर उपलब्ध नाही. इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा. (Backend unreachable)");
        } else {
          setApiError(e.message || "Skill extraction failed. Please try again.");
        }
        setExtractedData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndPersist = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      // Use name from authenticated user if available, else prompt text default
      const beneficiaryName = user?.full_name || "Beneficiary";
      const res = await registerBeneficiary({
        full_name: beneficiaryName,
        phone: user?.phone || undefined,
        state_code: "MH",
        district_code: "MH-NAG",
        gender: "unspecified",
        age: undefined,
        primary_language: "mr",
        profile_data: {
          education: { highest_level: editableEdu },
          mobility: { max_travel_distance_km: editableTravel },
          work_preferences: { wage_vs_self_employment: editablePref }
        }
      });

      if ((res as any).is_offline || (res as any).status === "offline_queued") {
        // Offline-queued
        if (typeof window !== "undefined") {
          localStorage.setItem("lip_beneficiary_id", (res as any).client_mutation_id || "pending");
          localStorage.setItem("lip_beneficiary_id_state", "offline_queued");
        }
        setSavedBeneficiaryId(null);
        setConfirmState("offline_queued");
      } else {
        // Success — persist the real UUID
        if (typeof window !== "undefined") {
          localStorage.setItem("lip_beneficiary_id", res.id);
          localStorage.setItem("lip_beneficiary_id_state", "live");
        }
        setSavedBeneficiaryId(res.id);
        setConfirmState("success");
      }
    } catch (err: any) {
      if (IS_DEMO_MODE) {
        // Demo fallback: store demo ID explicitly labelled
        if (typeof window !== "undefined") {
          localStorage.setItem("lip_beneficiary_id", "demo-beneficiary-id");
          localStorage.setItem("lip_beneficiary_id_state", "demo");
        }
        setConfirmState("success");
        setSaveError("⚠️ DEMO FALLBACK ACTIVE — Profile saved in demo mode only. [DEMO_DATA]");
      } else {
        // Production: do NOT navigate forward, show real error
        if (err instanceof NetworkError) {
          setSaveError("Backend unreachable. Profile could not be saved. Please try again when connected.");
        } else {
          setSaveError(err.message || "Save failed. Please try again.");
        }
        setConfirmState("error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-24 md:pb-12">
      <Navbar />
      <BeneficiaryNav />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Step 1 of 5 • Talk (बोलणे)
          </span>
          <div className="flex items-center gap-2">
            <TruthBadge state="LIVE" />
            {demoFallback && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                DEMO_DATA
              </span>
            )}
          </div>
        </div>

        {/* Spoken Prompt Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
          <div className="flex justify-end mb-2">
            <ReadAloudButton text={promptText} />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            तुमच्या कामाबद्दल किंवा कौशल्याबद्दल सांगा
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
            कोणतेही सरकारी शब्द माहित असण्याची गरज नाही. तुम्ही दररोज काय काम करता किंवा कोणते अवजार वापरता ते सांगा.
          </p>

          {/* Large Microphone Control */}
          <div className="my-8 flex flex-col items-center justify-center">
            <button
              onClick={handleStartRecording}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white transition-all shadow-lg touch-target ${
                isRecording ? "bg-red-500 scale-105" : "bg-[#0f4c81] hover:bg-[#0c3c66]"
              }`}
              aria-label={isRecording ? "Stop recording" : "Start speaking"}
            >
              {isRecording ? (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-400 opacity-50 animate-pulse-ring" />
                  <MicOff className="w-10 h-10 relative z-10" />
                </>
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
            <span className="text-xs font-bold text-slate-700 mt-3">
              {isRecording ? "मी ऐकत आहे... (Listening... Tap to stop)" : "येथे स्पर्श करा आणि बोला (Tap to Speak)"}
            </span>
          </div>

          {/* Transcript Preview Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>तुमचे शब्द (Transcript):</span>
              <button
                onClick={() => runExtraction(transcript)}
                className="text-[#0f4c81] hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" /> Re-Analyze
              </button>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={3}
              className="w-full bg-transparent border-none text-sm text-slate-800 focus:ring-0 resize-none font-medium leading-relaxed"
              placeholder="तुमचे बोलणे येथे दिसेल..."
            />
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => runExtraction(transcript)}
              disabled={loading}
              className="px-6 py-2.5 bg-[#0f4c81] text-white text-xs font-bold rounded-xl hover:bg-[#0c3c66] transition-colors shadow-sm touch-target disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> कौशल्याचे विश्लेषण करत आहे...</span>
              ) : "कौशल्य शोधा (Analyze My Skills)"}
            </button>
          </div>

          {/* API error state — real error, no silent swallow */}
          {apiError && (
            <div className={`mt-4 flex items-start gap-2 p-3 rounded-xl text-xs font-medium border ${
              demoFallback
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {demoFallback ? <Sparkles className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />}
              <span>{apiError}</span>
            </div>
          )}
        </div>

        {/* Structured Extraction Preview */}
        {extractedData && (
          <div className="mt-6 bg-white rounded-3xl p-6 border border-sky-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">
                  आम्हाला समजलेले तुमचे कौशल्य (Extracted Profile)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  AI Structured
                </span>
                {demoFallback && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    DEMO_DATA
                  </span>
                )}
              </div>
            </div>

            {/* Extracted skills */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ओळखलेली कौशल्ये (Identified Competencies):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {extractedData.extracted_skills.map((sk: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{sk.canonical_name}</span>
                      <span className="text-[11px] text-slate-500">{sk.category} • Confidence: {Math.round(sk.confidence * 100)}%</span>
                    </div>
                    {sk.confidence >= 0.8 ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium">Verify</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Editable constraints */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-700">
                  माहिती तपासा व आवश्यक असल्यास बदला (Review & Correct Constraints):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      📍 कमाल प्रवास (Max Travel Radius)
                    </label>
                    <select
                      value={editableTravel}
                      onChange={(e) => setEditableTravel(Number(e.target.value))}
                      className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value={5}>5 किमी (स्थानिक)</option>
                      <option value={15}>15 किमी (तालुका / एमआयडीसी)</option>
                      <option value={25}>25 किमी (जिल्हा केंद्र)</option>
                    </select>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      🎓 शिक्षण (Education Level)
                    </label>
                    <select
                      value={editableEdu}
                      onChange={(e) => setEditableEdu(e.target.value)}
                      className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="class_8">इयत्ता 8 वी (Class 8)</option>
                      <option value="class_10">इयत्ता 10 वी (Class 10)</option>
                      <option value="class_12">इयत्ता 12 वी (Class 12)</option>
                      <option value="unlettered">अनौपचारिक / स्वाध्याय</option>
                    </select>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      💼 कामाची पसंती (Preference)
                    </label>
                    <select
                      value={editablePref}
                      onChange={(e) => setEditablePref(e.target.value)}
                      className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="wage">थेट पगारी नोकरी (Wage)</option>
                      <option value="self_employment">स्वतःचे दुकान / व्यवसाय (Self-Emp)</option>
                      <option value="hybrid">दोन्ही चालेल (Hybrid)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Action */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {confirmState === "success" && (
                  <span className="text-emerald-700 font-bold">
                    ✓ माहिती डेटाबेसमध्ये सेव्ह झाली आहे.
                    {savedBeneficiaryId && (
                      <span className="ml-1 font-mono text-[10px] text-slate-500">ID: {savedBeneficiaryId.slice(0, 8)}</span>
                    )}
                  </span>
                )}
                {confirmState === "offline_queued" && (
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <WifiOff className="w-3.5 h-3.5" />
                    Saved Offline — will sync when reconnected.
                  </span>
                )}
                {confirmState === "error" && saveError && (
                  <span className="text-red-700 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {saveError}
                  </span>
                )}
                {!confirmState && "कृपया माहिती तपासून पक्की करा."}
              </div>
              {/* Save error in demo fallback mode (not blocking, but labelled) */}
              {confirmState === "success" && saveError && (
                <p className="text-[11px] text-amber-700 font-bold">{saveError}</p>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {(confirmState === null || confirmState === "error") && (
                  <button
                    onClick={handleConfirmAndPersist}
                    disabled={saving}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm touch-target disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> डेटा सेव्ह करत आहे...</span>
                    ) : (confirmState === "error" ? "पुन्हा प्रयत्न करा (Retry)" : "होय, पक्के करा व सेव्ह करा (Confirm & Save)")}
                  </button>
                )}
                {(confirmState === "success" || confirmState === "offline_queued") && (
                  <button
                    onClick={() => router.push("/passport")}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#0f4c81] text-white text-xs font-bold rounded-xl hover:bg-[#0c3c66] transition-colors shadow-sm flex items-center justify-center gap-2 touch-target"
                  >
                    <span>माझे कौशल्य पहा (View My Skills)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
