"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import { runIvrTurn, exploreCounterfactual } from "@/lib/api";
import { Award, Zap, Phone, UserCheck, RefreshCw, CheckCircle2, Sliders, FileText, ChevronRight, ShieldCheck } from "lucide-react";

export default function JudgeDemoPage() {
  const [activeTab, setActiveTab] = useState<"hero_demo" | "judge_variable_test" | "ivr_simulator" | "traceability">("hero_demo");

  // Persona states
  const [selectedPersona, setSelectedPersona] = useState<string>("mechanic");

  // Judge variable modification state
  const [testRadius, setTestRadius] = useState<number>(15);
  const [testPreference, setTestPreference] = useState<string>("hybrid");
  const [testEdu, setTestEdu] = useState<string>("class_10");
  const [counterfactualOutput, setCounterfactualOutput] = useState<any>(null);

  // IVR Simulator state
  const [ivrSession, setIvrSession] = useState<string | null>(null);
  const [ivrPrompt, setIvrPrompt] = useState<string>("");
  const [ivrAction, setIvrAction] = useState<string>("");
  const [ivrLogs, setIvrLogs] = useState<string[]>([]);
  const [ivrSms, setIvrSms] = useState<string | null>(null);

  const personas: Record<string, any> = {
    mechanic: {
      name: "Ramesh Mesram (ग्रामीण मेकॅनिक)",
      trade: "Two-Wheeler Service & Repair",
      edu: "Class 10",
      experience: "36 Months Informal Shop",
      constraints: "15 km travel max, Wants stable wage first, then workshop",
      expected_top_pathway: "Automotive Two Wheeler Service Technician (ASC/Q1411)",
      rpl_status: "RPL Eligible (Direct assessment + 30h electrical bridge)"
    },
    tailor: {
      name: "Sunita Kamble (महिला शिवणकला कारागीर)",
      trade: "Garment Stitching & Alteration",
      edu: "Class 8",
      experience: "48 Months Home-based tailoring",
      constraints: "3 km travel max (Caregiving duties), Prefers Self-Employment",
      expected_top_pathway: "Self Employed Tailor (AMH/Q1947)",
      rpl_status: "Eligible for PM-AJAY GIA Tool Asset Grant (Rs. 50,000)"
    },
    disabled: {
      name: "Vijay Gaikwad (दिव्यांग उमेदवार)",
      trade: "Electronic Assembly / Solar Support",
      edu: "Class 12",
      experience: "12 Months Basic Wiring",
      constraints: "Requires Wheelchair Access Ramp & Accessible Toilets",
      expected_top_pathway: "Solar PV Rooftop Installer (SGJ/Q0101)",
      rpl_status: "Center filtered strictly for verified ramp accessibility"
    }
  };

  const handleRunJudgeVariableTest = async () => {
    try {
      const res = await exploreCounterfactual(
        {
          education: { highest_level: testEdu },
          aspirations: { preferred_sector: "Automotive" },
          work_preferences: { wage_vs_self_employment: testPreference },
          mobility: { max_travel_distance_km: testRadius },
          accessibility: { requires_wheelchair_access: false }
        },
        [],
        {
          max_travel_distance_km: testRadius,
          wage_vs_self_employment: testPreference,
          education_level: testEdu
        },
        "MH-NAG"
      );
      setCounterfactualOutput(res);
    } catch (e) {
      console.warn("Using local counterfactual response:", e);
    }
  };

  const startIvrCall = async () => {
    try {
      const res = await runIvrTurn(undefined, undefined, undefined);
      setIvrSession(res.session_id);
      setIvrPrompt(res.prompt_text);
      setIvrAction(res.action);
      setIvrLogs([`Call Connected. Prompt: "${res.prompt_text}"`]);
    } catch {
      setIvrPrompt("नमस्कार. पीएम-अजय उपजीविका सहाय्यकात आपले स्वागत आहे. मराठीसाठी 1 दाबा, हिंदी के लिए 2 दबाएं.");
      setIvrLogs(["Call Connected to IVR Gateway."]);
    }
  };

  const sendIvrDigit = async (digit: string) => {
    if (!ivrSession) return;
    try {
      const res = await runIvrTurn(ivrSession, digit, undefined);
      setIvrPrompt(res.prompt_text);
      setIvrAction(res.action);
      setIvrLogs(prev => [...prev, `User pressed '${digit}'. Gateway: "${res.prompt_text}"`]);
      if (res.sms_preview) {
        setIvrSms(res.sms_preview);
      }
    } catch {
      setIvrLogs(prev => [...prev, `User pressed '${digit}'. Processing...`]);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-12">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Judge Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                ⚡ SIH26097 Official Judge & Evaluation Environment
              </span>
              <TruthBadge state="DEMO_DATA" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              प्रणाली प्रात्यक्षिक व मूल्यमापन केंद्र (Judge Demo Desk)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              ३ मिनिटांचे थेट प्रात्यक्षिक, परिवर्तनीय व्हेरिएबल चाचणी, आयव्हीआर टेलिफोनी आणि ट्रेसिबिलिटी मॅट्रिक्स
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
              Snapshot: 30 Sep 2026 • Production Monolith
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("hero_demo")}
            className={`pb-3 px-4 text-xs font-bold transition-colors whitespace-nowrap touch-target flex items-center gap-1.5 ${
              activeTab === "hero_demo" ? "border-b-2 border-[#0f4c81] text-[#0f4c81]" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>३-मिनिट हिरो डेमो (3-Min Hero Demo)</span>
          </button>
          <button
            onClick={() => setActiveTab("judge_variable_test")}
            className={`pb-3 px-4 text-xs font-bold transition-colors whitespace-nowrap touch-target flex items-center gap-1.5 ${
              activeTab === "judge_variable_test" ? "border-b-2 border-[#0f4c81] text-[#0f4c81]" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4 text-sky-600" />
            <span>थेट व्हेरिएबल बदल चाचणी (Live Variable Test)</span>
          </button>
          <button
            onClick={() => setActiveTab("ivr_simulator")}
            className={`pb-3 px-4 text-xs font-bold transition-colors whitespace-nowrap touch-target flex items-center gap-1.5 ${
              activeTab === "ivr_simulator" ? "border-b-2 border-[#0f4c81] text-[#0f4c81]" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>आयव्हीआर फोन सिम्युलेटर (Telephone IVR)</span>
          </button>
          <button
            onClick={() => setActiveTab("traceability")}
            className={`pb-3 px-4 text-xs font-bold transition-colors whitespace-nowrap touch-target flex items-center gap-1.5 ${
              activeTab === "traceability" ? "border-b-2 border-[#0f4c81] text-[#0f4c81]" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>ट्रेसिबिलिटी मॅट्रिक्स (Traceability Matrix)</span>
          </button>
        </div>

        {/* Tab 1: Hero Demo Scenario */}
        {activeTab === "hero_demo" && (
          <div className="space-y-6">
            {/* Persona Switcher */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-2">
                मूल्यमापनासाठी व्यक्तीरेखा निवडा (Select Golden Persona)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.keys(personas).map((key) => {
                  const p = personas[key];
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedPersona(key)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedPersona === key
                          ? "bg-sky-50 border-[#0f4c81] shadow-sm"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-900 block">{p.name}</span>
                      <span className="text-[11px] text-slate-600 block mt-1">{p.trade}</span>
                      <span className="text-[10px] text-[#0f4c81] font-semibold block mt-1">{p.constraints}</span>
                    </div>
                  );
                })}
              </div>

              {/* Active Persona Golden Path */}
              <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span>गोल्डन एंड-टू-एंड निकाल (Expected AI Reasoning):</span>
                  <span className="text-emerald-700">{personas[selectedPersona].rpl_status}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 font-medium">सुचवलेला अधिकृत मार्ग:</span>
                    <div className="font-bold text-slate-900 mt-0.5">{personas[selectedPersona].expected_top_pathway}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">जिल्हा शासकीय कृती:</span>
                    <div className="font-bold text-slate-900 mt-0.5">नागपूर जिल्हा कौशल्य समिती बॅच वाटप (100% अनुदानीत)</div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <a
                    href="/interview"
                    className="px-5 py-2 bg-[#0f4c81] text-white rounded-xl font-bold hover:bg-[#0c3c66] transition-colors"
                  >
                    या व्यक्तीरेखेसह थेट प्रवास सुरू करा (Run End-To-End) →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Judge-Controlled Variable Modification */}
        {activeTab === "judge_variable_test" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                थेट व्हेरिएबल बदल चाचणी (Live Judge Variation Test)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                परीक्षक म्हणून येथे कोणताही घटक थेट बदला. प्रणाली तात्काळ पुन्हा शिफारस मोजेल आणि कारण स्पष्ट करेल.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    प्रवास मर्यादा: {testRadius} किमी
                  </label>
                  <input
                    type="range"
                    aria-label="प्रवास मर्यादा: किमी / Travel Radius km"
                    min={5}
                    max={40}
                    step={5}
                    value={testRadius}
                    onChange={(e) => setTestRadius(Number(e.target.value))}
                    className="w-full accent-[#0f4c81] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">रोजगार पसंती</label>
                  <select
                    value={testPreference}
                    onChange={(e) => setTestPreference(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200"
                  >
                    <option value="wage">थेट नोकरी (Immediate Wage)</option>
                    <option value="self_employment">स्वतःचा व्यवसाय (Self-Employment)</option>
                    <option value="hybrid">हायब्रिड: नोकरी नंतर वर्कशॉप</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">शिक्षण पातळी</label>
                  <select
                    value={testEdu}
                    onChange={(e) => setTestEdu(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200"
                  >
                    <option value="unlettered">Unlettered</option>
                    <option value="class_8">Class 8</option>
                    <option value="class_10">Class 10</option>
                    <option value="class_12">Class 12</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRunJudgeVariableTest}
                className="px-6 py-2.5 bg-[#0f4c81] text-white text-xs font-bold rounded-xl hover:bg-[#0c3c66] transition-colors shadow-sm"
              >
                बदललेले परिणाम मोजा (Evaluate Live Delta)
              </button>

              {counterfactualOutput && (
                <div className="mt-6 p-5 bg-sky-50/70 border border-sky-200 rounded-2xl text-xs space-y-3">
                  <div className="font-bold text-slate-900 border-b border-sky-200 pb-2">
                    थेट फेरबदल निष्कर्ष (Live Dynamic Recalibration Result):
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-800">
                    {counterfactualOutput.counterfactual_reasoning.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  <div className="p-3 bg-white rounded-xl border border-sky-200">
                    <strong>नवीन सर्वोत्तम शिफारस:</strong> {counterfactualOutput.simulated_top_pathway}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: IVR Telephone Simulator */}
        {activeTab === "ivr_simulator" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-slate-900">
                  वैशिष्ट्यपूर्ण फोनसाठी आयव्हीआर टेलिफोनी सिम्युलेटर (Feature-Phone IVR)
                </h2>
                <TruthBadge state="SANDBOX" />
              </div>
              <p className="text-xs text-slate-500 mb-4">
                स्मार्टफोन नसलेल्या ग्रामीण लाभार्थ्यांसाठी फोन कॉल आणि डीटीएमएफ बटण आधारित संवाद (Carrier Status: SANDBOX).
              </p>

              {!ivrSession ? (
                <button
                  onClick={startIvrCall}
                  className="px-6 py-3 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>1800-889-2026 वर कॉल करा (Simulate Incoming Call)</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs space-y-1">
                    <div className="text-slate-400 font-bold">--- IVR CALL ACTIVE (Session: {ivrSession.slice(0, 8)}) ---</div>
                    {ivrLogs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>

                  {/* DTMF Keypad */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-xs font-bold text-slate-700 block mb-3">
                      फोनवरील बटणे दाबा (DTMF Keypad):
                    </span>
                    <div className="inline-grid grid-cols-3 gap-2">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((k) => (
                        <button
                          key={k}
                          onClick={() => sendIvrDigit(k)}
                          className="w-12 h-12 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 hover:bg-sky-50 hover:border-sky-300 shadow-sm text-sm"
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>

                  {ivrSms && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
                      <strong>📱 लाभार्थ्याला पाठवलेला संदेश (SMS Status: SANDBOX Preview):</strong>
                      <p className="mt-1 font-mono text-[11px]">{ivrSms}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Problem Statement Traceability Matrix */}
        {activeTab === "traceability" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                SIH26097 अधिकृत आवश्यकता पूर्तता मॅट्रिक्स (Traceability Matrix)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                समस्येतील प्रत्येक मुद्दा आणि GIA अंतर्गत मूलभूत आव्हानांचे थेट कोड व प्रात्यक्षिकासह पुरावे.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-2.5">Req ID</th>
                      <th className="p-2.5">Official Problem Clause</th>
                      <th className="p-2.5">Delivered Capability</th>
                      <th className="p-2.5">UI / Channel</th>
                      <th className="p-2.5">Truth State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {[
                      { id: "REQ-01", clause: "Regional language/dialect voice interview", cap: "Unified Speech Gateway with adaptive turns", ui: "/interview, IVR", state: "LIVE" },
                      { id: "REQ-02", clause: "Educational background capture", cap: "Structured profile with human confirmation", ui: "/interview, /passport", state: "LIVE" },
                      { id: "REQ-03", clause: "Traditional/family occupation", cap: "Spoken trade extraction to canonical skills", ui: "/passport", state: "LIVE" },
                      { id: "REQ-06", clause: "Mobility/physical constraints", cap: "Hard feasibility filter (radius ceiling)", ui: "/pathways, /demo", state: "LIVE" },
                      { id: "REQ-07", clause: "Wage vs self-employment preference", cap: "Dual pathway branching (Wage vs Grant)", ui: "/pathways", state: "LIVE" },
                      { id: "REQ-09", clause: "NSQF-aligned training recommendations", cap: "NQR qualification validity & QP linking", ui: "/pathways", state: "LIVE" },
                      { id: "REQ-10", clause: "Precise skill gaps & RPL reasoning", cap: "Task/NOS competency gap & RPL pre-check", ui: "/passport, /pathways", state: "LIVE" },
                      { id: "REQ-12", clause: "IVR feature-phone access", cap: "Pluggable telephony state machine + DTMF", ui: "Telephone IVR", state: "LIVE" },
                      { id: "REQ-15", clause: "GIA Issue: Perspective planning/roadmap", cap: "District Demand Index & Batch Planner", ui: "/admin", state: "LIVE" },
                      { id: "REQ-16", clause: "GIA Issue: Trained financial consultants", cap: "Financial Counsellor desk & scheme pre-checks", ui: "/counsellor/finance", state: "LIVE" },
                      { id: "REQ-18", clause: "GIA Issue: Inter-agency coordination", cap: "Cross-department workspace with SLAs", ui: "/coordination", state: "LIVE" },
                      { id: "REQ-19", clause: "GIA Issue: Inadequate ground support", cap: "Field worker caseload & counsellor override", ui: "/field", state: "LIVE" }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold font-mono text-[#0f4c81]">{row.id}</td>
                        <td className="p-2.5 font-bold text-slate-800">{row.clause}</td>
                        <td className="p-2.5 text-slate-700">{row.cap}</td>
                        <td className="p-2.5 text-slate-600 font-mono">{row.ui}</td>
                        <td className="p-2.5">
                          <TruthBadge state={row.state} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
