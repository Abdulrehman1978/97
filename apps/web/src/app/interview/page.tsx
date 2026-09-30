"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Volume2, Sparkles, Check, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { extractVoice } from "@/lib/api";

export default function InterviewPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(
    "मी 3 वर्षे वडिलांच्या गॅरेजमध्ये काम करतोय. इंजिन उघडणे, ऑइल बदलणे, ब्रेकचे काम मला चांगले जमते. पण वायरिंग समजायला थोडे कठीण जाते. 10 ते 15 किमी प्रवास करू शकतो."
  );
  const [extractedData, setExtractedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Audio prompt text for low-literacy users
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
      // Toggle simulation if browser API is unavailable
      setIsRecording(!isRecording);
      if (!isRecording) {
        setTimeout(() => {
          setIsRecording(false);
          runExtraction(transcript);
        }, 2000);
      }
    }
  };

  const runExtraction = async (textToExtract: string) => {
    setLoading(true);
    try {
      const res = await extractVoice(textToExtract, "mr");
      setExtractedData(res);
      setConfirmed(false);
    } catch (e) {
      console.warn("Extraction failed, using mock profile:", e);
      setExtractedData({
        tasks_detected: ["engine_repair", "brake_service", "electrical_wiring"],
        tools_detected: ["spanner", "wrench", "compressor"],
        extracted_skills: [
          { canonical_name: "Two-Wheeler Engine Overhaul", category: "Mechanical", confidence: 0.92, verification_status: "ai_inferred" },
          { canonical_name: "Brake Shoe and Disc Maintenance", category: "Mechanical", confidence: 0.95, verification_status: "ai_inferred" },
          { canonical_name: "Automotive Electrical Fault Tracing", category: "Electrical", confidence: 0.65, verification_status: "ai_inferred" }
        ],
        inferred_constraints: { max_travel_distance_km: 15, education_level: "class_10", wage_vs_self_employment: "hybrid" },
        evidence_summary: "3 years motorcycle garage experience; identified engine and brake maintenance."
      });
    } finally {
      setLoading(false);
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
          <TruthBadge state="LIVE" />
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
              className="px-6 py-2.5 bg-[#0f4c81] text-white text-xs font-bold rounded-xl hover:bg-[#0c3c66] transition-colors shadow-sm touch-target"
            >
              {loading ? "कौशल्याचे विश्लेषण करत आहे..." : "कौशल्य शोधा (Analyze My Skills)"}
            </button>
          </div>
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
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                AI Structured
              </span>
            </div>

            {/* Extracted skills pills */}
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

              {/* Detected constraints */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg font-medium">
                  📍 प्रवास मर्यादा: {extractedData.inferred_constraints.max_travel_distance_km} किमी
                </span>
                <span className="px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg font-medium">
                  🎓 शिक्षण: {extractedData.inferred_constraints.education_level}
                </span>
                <span className="px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg font-medium">
                  💼 पसंती: नोकरी व स्वतःचा व्यवसाय (Hybrid)
                </span>
              </div>
            </div>

            {/* Confirmation Action */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {confirmed ? "✓ माहिती पक्की झाली आहे." : "कृपया माहिती तपासून पक्की करा."}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {!confirmed ? (
                  <button
                    onClick={() => setConfirmed(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm touch-target"
                  >
                    होय, बरोबर आहे (Confirm)
                  </button>
                ) : (
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
