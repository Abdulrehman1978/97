"use client";

import React, { useState, useEffect } from "react";
import { downloadDraft } from "@/lib/download-draft";
import { useRuntimeTruth } from "@/components/RuntimeTruth";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import { getDistrictDashboard, simulateBatch, buildProjectProposal, getSourceHealth } from "@/lib/api";
import { LayoutDashboard, Users, GraduationCap, MapPin, Calculator, FileSpreadsheet, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminPortalPage() {
  const truth = useRuntimeTruth();
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "batch_planner" | "project_builder" | "sources">("overview");
  const [dashboard, setDashboard] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [batchResult, setBatchResult] = useState<any>(null);
  const [proposalResult, setProposalResult] = useState<any>(null);

  // Batch simulator form
  const [proposedCapacity, setProposedCapacity] = useState<number>(30);
  const [selectedQp, setSelectedQp] = useState<string>("ASC/Q1411");

  useEffect(() => {
    getDistrictDashboard("MH-NAG").then(setDashboard).catch(e => setError(e.message || "Data could not be loaded."));
    getSourceHealth().then(setSources).catch(e => setError(e.message || "Data could not be loaded."));
  }, []);

  const handleSimulateBatch = async () => {
    try {
      const res = await simulateBatch("MH-NAG", selectedQp, proposedCapacity);
      setBatchResult(res);
    } catch (e) {
      setBatchResult(null); setError(e instanceof Error ? e.message : "Simulation failed.");
    }
  };

  const handleBuildProposal = async () => {
    try {
      const res = await buildProjectProposal({
        project_title: "Nagpur District SC Youth Automotive & Green Energy Empowerment Project",
        target_district: "MH-NAG",
        target_beneficiary_count: 120,
        priority_sectors: ["Automotive", "Apparel", "Solar PV"],
        estimated_budget_inr: 4500000.0
      });
      setProposalResult(res);
    } catch (e) {
      setProposalResult(null); setError(e instanceof Error ? e.message : "Proposal failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-12">
      <Navbar />

      <main id="main-content" className="workspace-main max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {error && <p role="alert" className="p-4 bg-red-50 text-red-900">{error}</p>}
        {/* District Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                District Administration & Perspective Planning Portal
              </span>
              <TruthBadge state="LIVE" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              नागपूर जिल्हा उपजीविका बुद्धिमत्ता केंद्र (District Livelihood Intelligence)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              PM-AJAY Grants-in-Aid (GIA) Component • District Skill Committee (DSC) Workspace
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              Review source freshness in Source Health
            </span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-4 text-xs font-bold transition-colors whitespace-nowrap touch-target ${
              activeTab === "overview"
                ? "border-b-2 border-[#0f4c81] text-[#0f4c81]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            मागणी-पुरवठा विश्लेषण (Supply-Demand Gap)
          </button>
          <button
            onClick={() => setActiveTab("batch_planner")}
            className={`pb-3 px-4 text-xs font-bold transition-colors whitespace-nowrap touch-target ${
              activeTab === "batch_planner"
                ? "border-b-2 border-[#0f4c81] text-[#0f4c81]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            बॅच नियोजन सिम्युलेटर (Batch Planner)
          </button>
          <button
            onClick={() => setActiveTab("project_builder")}
            className={`pb-3 px-4 text-xs font-bold transition-colors whitespace-nowrap touch-target ${
              activeTab === "project_builder"
                ? "border-b-2 border-[#0f4c81] text-[#0f4c81]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            सर्वसमावेशक प्रकल्प प्रस्ताव (PM-AJAY Project Builder)
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={`pb-3 px-4 text-xs font-bold transition-colors whitespace-nowrap touch-target ${
              activeTab === "sources"
                ? "border-b-2 border-[#0f4c81] text-[#0f4c81]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            डेटा स्रोत आरोग्य (Source Health)
          </button>
        </div>

        {/* Tab 1: Supply Demand Overview */}
        {activeTab === "overview" && dashboard && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">ऑनबोर्ड लाभार्थी</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{dashboard.total_beneficiaries_onboarded}</div>
                <span className="text-[10px] text-slate-600 font-semibold">Recorded total · no trend comparison</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">सक्रिय प्रशिक्षण केंद्रे</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{dashboard.active_training_centers}</div>
                <span className="text-[10px] text-slate-500">MIDC Hingna & City</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">एकूण बॅच क्षमता</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{dashboard.total_batch_capacity}</div>
                <span className="text-[10px] text-slate-500">Seats allocated</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">उपलब्ध जागा</span>
                <div className="text-2xl font-bold text-emerald-700 mt-1">{dashboard.current_available_seats}</div>
                <span className="text-[10px] text-emerald-600 font-semibold">Immediate intake</span>
              </div>
            </div>

            {/* Sector Demand vs Supply Gap Matrix */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">
                क्षेत्रनिहाय मागणी आणि पुरवठा तूट (Sectoral Demand vs Supply Gap)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-3">Sector</th>
                      <th className="p-3">Expressed Demand</th>
                      <th className="p-3">Current Batch Capacity</th>
                      <th className="p-3">Unmet Gap (तूट)</th>
                      <th className="p-3">Demand Trend</th>
                      <th className="p-3">Planning Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {dashboard.sector_demand_matrix.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">{row.sector}</td>
                        <td className="p-3 text-slate-800">{row.expressed_demand_count} Candidates</td>
                        <td className="p-3 text-slate-800">{row.local_capacity} Seats</td>
                        <td className="p-3 font-bold text-amber-700">+{row.gap} Seats Needed</td>
                        <td className="p-3 text-emerald-600 font-bold">{row.demand_trend}</td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedQp(row.sector.includes("Auto") ? "ASC/Q1411" : "SGJ/Q0101");
                              setActiveTab("batch_planner");
                            }}
                            className="px-3 py-1 bg-sky-50 text-[#0f4c81] border border-sky-200 rounded-lg hover:bg-sky-100 font-bold"
                          >
                            Plan Batch →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobility & Inclusion Barriers */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-2">
                समावेशकता आणि प्रवास अडथळे विश्लेषण (Inclusion & Mobility Barrier Metrics)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                वास्तविक लाभार्थ्यांच्या प्रतिसादांवरून संकलित माहिती:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-500 font-bold">१० किमीपेक्षा कमी प्रवास मर्यादा</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{dashboard.barrier_indicators.restricted_mobility_under_10km_pct}%</div>
                  <p className="text-[11px] text-slate-500 mt-1">स्थानिक ब्लॉक किंवा फिरते प्रशिक्षण आवश्यक.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-500 font-bold">स्वतःचा व्यवसाय सुरू करण्याची पसंती</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{dashboard.barrier_indicators.prefer_self_employment_pct}%</div>
                  <p className="text-[11px] text-slate-500 mt-1">पीएम-अजय टूल किट व वित्तीय सल्लागार आवश्यक.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-500 font-bold">व्हीलचेअर किंवा दिव्यांग सुलभता आवश्यक</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{dashboard.barrier_indicators.wheelchair_or_accessible_center_needed_pct}%</div>
                  <p className="text-[11px] text-slate-500 mt-1">केवळ पडताळणी झालेल्या सुगम्य केंद्रांची शिफारस.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Batch Simulator */}
        {activeTab === "batch_planner" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                प्रस्तावित प्रशिक्षण बॅच सिम्युलेटर (Proposed Batch Simulator)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                पीएम-अजय सामान्य मानकांनुसार (Common Norms) नवीन बॅचचा आर्थिक व उमेदवार व्यवहार्यता अंदाज.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">अभ्यासक्रम (Qualification Pack)</label>
                  <select
                    value={selectedQp}
                    onChange={(e) => setSelectedQp(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="ASC/Q1411">Automotive Two Wheeler Technician (ASC/Q1411)</option>
                    <option value="AMH/Q1947">Self Employed Tailor (AMH/Q1947)</option>
                    <option value="SGJ/Q0101">Solar PV Installer - Green Jobs (SGJ/Q0101)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">प्रस्तावित जागा (Capacity)</label>
                  <input
                    type="number"
                    value={proposedCapacity}
                    onChange={(e) => setProposedCapacity(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSimulateBatch}
                    className="w-full py-2.5 bg-[#0f4c81] text-white text-xs font-bold rounded-xl hover:bg-[#0c3c66] transition-colors shadow-sm touch-target"
                  >
                    बॅच व्यवहार्यता तपासा (Simulate Feasibility)
                  </button>
                </div>
              </div>

              {batchResult && (
                <div className="mt-6 p-5 bg-sky-50/60 rounded-2xl border border-sky-200 text-xs space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-900 border-b border-sky-200 pb-2">
                    <span>सिम्युलेशन निष्कर्ष (Simulation Result)</span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">{batchResult.verdict}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-500 font-medium">स्थानिक उमेदवार उपलब्धता:</span>
                      <div className="font-bold text-slate-800 mt-0.5">{batchResult.feasibility_assessment.potential_candidate_pool_in_radius} Candidates</div>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">उमेदवार ते जागा प्रमाण:</span>
                      <div className="font-bold text-emerald-700 mt-0.5">{batchResult.feasibility_assessment.candidate_to_seat_ratio}x (High Demand)</div>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">अपेक्षित एकूण बजेट:</span>
                      <div className="font-bold text-slate-900 mt-0.5">₹{batchResult.budget_breakdown_inr.total_batch_budget_inr.toLocaleString()} (100% GIA)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: PM-AJAY Comprehensive Livelihood Project Builder */}
        {activeTab === "project_builder" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                पीएम-अजय सर्वसमावेशक उपजीविका प्रकल्प निर्माता (GIA Project Builder)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                जिल्हास्तरीय मागणी, कौशल्य प्रशिक्षण, टूल किट अनुदान आणि १२ महिन्यांच्या प्लेसमेंट मॉनिटरिंगचा शासकीय प्रस्ताव.
              </p>

              <button
                onClick={handleBuildProposal}
                className="px-6 py-2.5 bg-[#0f4c81] text-white text-xs font-bold rounded-xl hover:bg-[#0c3c66] transition-colors shadow-sm touch-target"
              >
                नवीन प्रकल्प प्रस्ताव तयार करा (Generate Project Proposal)
              </button>

              {proposalResult && (
                <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="font-bold text-slate-900">{proposalResult.project_title}</h3>
                    <span className="px-2.5 py-0.5 rounded bg-sky-100 text-[#0f4c81] font-bold">
                      {proposalResult.proposal_status}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{proposalResult.executive_summary}</p>

                  <div className="space-y-2">
                    <span className="font-bold text-slate-800">प्रकल्पाचे तीन मुख्य घटक (Project Allocations):</span>
                    {proposalResult.components.map((c: any, i: number) => (
                      <div key={i} className="flex justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-800">{c.component_name}</span>
                        <span className="font-mono font-bold text-slate-900">₹{c.allocation_inr.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => downloadDraft("district-project-draft", proposalResult, truth)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                    >
                      प्रस्तावाचा मसुदा डाउनलोड करा (Download Draft JSON)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Source Health Monitor */}
        {activeTab === "sources" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                डेटा स्रोत आणि ताजेपणा आरोग्य (Data Source Governance & Provenance)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                प्रत्येक शिफारस अधिकृत सरकारी पोर्टलशी जोडलेली असून कालबाह्य डेटा टाळला जातो.
              </p>

              <div className="space-y-3">
                {sources.map((s, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{s.source_name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">{s.quality_status}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">प्रकाशक: {s.publisher} • ताजेपणा मर्यादा: {s.freshness_sla_days} दिवस</p>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-700 font-mono">शेवटचा सिंक: {s.last_success_at}</div>
                      <a href={s.canonical_url} target="_blank" rel="noreferrer" className="text-[#0f4c81] hover:underline font-bold">
                        अधिकृत पोर्टल लिंक ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
