"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import type { DistrictDashboard, SourceHealth, BatchSimulation, ProjectProposal } from "@/lib/api/contracts";
import { useRuntimeTruth } from "@/lib/runtime-truth-context";
import { RequireAuth } from "@/lib/api/auth-context";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  MapPin,
  Calculator,
  FileSpreadsheet,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Download,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { getDistrictDashboard, simulateBatch, buildProjectProposal, getSourceHealth } from "@/lib/api";

export default function AdminPortalPage() {
  return (
    <RequireAuth roles={["district_admin", "state_admin", "ministry_admin"]}>
      <DistrictAdminWorkspace />
    </RequireAuth>
  );
}

function DistrictAdminWorkspace() {
  const { truthState } = useRuntimeTruth();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "batch_planner" | "project_builder" | "sources">("overview");
  const [dashboard, setDashboard] = useState<DistrictDashboard | null>(null);
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [batchResult, setBatchResult] = useState<BatchSimulation | null>(null);
  const [proposalResult, setProposalResult] = useState<ProjectProposal | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isBuildingProposal, setIsBuildingProposal] = useState(false);

  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [proposalError, setProposalError] = useState<string | null>(null);

  // Batch simulator form
  const [proposedCapacity, setProposedCapacity] = useState<number>(30);
  const [selectedQp, setSelectedQp] = useState<string>("ASC/Q1411");

  const loadDashboard = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [overview, health] = await Promise.all([getDistrictDashboard("MH-NAG"), getSourceHealth()]);
      setDashboard(overview);
      setSources(health);
    } catch (error: unknown) {
      setDashboard(null);
      setSources([]);
      setLoadError(error instanceof Error ? error.message : "Could not load district records.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void loadDashboard(); }, []);

  const handleSimulateBatch = async () => {
    setIsSimulating(true);
    setSimulationError(null);
    try {
      const res = await simulateBatch("MH-NAG", selectedQp, proposedCapacity);
      setBatchResult(res);
    } catch (e: any) {
      console.warn("Simulation call error:", e);
      setSimulationError(e?.message || "Batch simulation failed. Previous result is unchanged; retry.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleBuildProposal = async () => {
    setIsBuildingProposal(true);
    setProposalError(null);
    try {
      const res = await buildProjectProposal({
        project_title: "Nagpur District SC Youth Automotive & Green Energy Empowerment Project",
        target_district: "MH-NAG",
        target_beneficiary_count: 120,
        priority_sectors: ["Automotive", "Apparel", "Solar PV"],
        estimated_budget_inr: 4500000.0
      });
      setProposalResult(res);
    } catch (e: any) {
      console.warn("Project proposal call error:", e);
      setProposalError(e?.message || "Proposal generation failed. Previous result is unchanged; retry.");
    } finally {
      setIsBuildingProposal(false);
    }
  };

  const demandSupplyData = (dashboard?.sector_demand_matrix ?? []).map(row => ({
    trade: row.sector, demand: row.expressed_demand_count, supply: row.local_capacity,
    gap: row.gap, priority: row.gap > 0 ? "Review shortage" : "No recorded shortage"
  }));

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 pt-24 pb-6 flex flex-col gap-6">
        {/* District Admin Header Strip */}
        <div className="bg-surface-container rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                District Administration & Perspective Planning Portal
              </span>
              <TruthBadge state={dashboard?.truth_state ?? truthState} />
            </div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold mt-1">
              नागपूर जिल्हा उपजीविका बुद्धिमत्ता केंद्र (District Livelihood Intelligence)
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              PM-AJAY Grants-in-Aid (GIA) Component • District Skill Committee (DSC) Workspace
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-tertiary-fixed/40 border border-secondary/30 text-on-tertiary-container font-code-sm text-code-sm font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              Source verification required
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-surface-container-high p-1 rounded-xl flex items-center gap-1 shadow-sm overflow-x-auto">
          {[
            { id: "overview", label: "मागणी-पुरवठा विश्लेषण (Supply-Demand Gap)" },
            { id: "batch_planner", label: "बॅच नियोजन सिम्युलेटर (Batch Planner)" },
            { id: "project_builder", label: "प्रकल्प प्रस्ताव जनरेटर (Project Builder)" },
            { id: "sources", label: "डेटा स्रोत व फ्रेशनेस (Data Provenance)" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[44px] py-1.5 px-3.5 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                  : "text-on-surface-variant hover:text-on-surface font-semibold"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Demand & Supply Gap Overview */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-5">
            {loading && <p role="status">Loading district records…</p>}
            {loadError && <div role="alert">{loadError} <button onClick={loadDashboard} className="min-h-11 underline">Retry</button></div>}
            {!loading && !loadError && demandSupplyData.length === 0 && <p>No recorded demand or training capacity for this district.</p>}
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col">
                <span className="font-label-sm text-label-sm text-outline">जिल्हा नोंदणीकृत लाभार्थी</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold mt-1">{dashboard?.total_beneficiaries_onboarded.toLocaleString() ?? "—"}</span>
                <span className="font-code-sm text-code-sm text-secondary mt-0.5">Registered profiles; eligibility not assessed</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col">
                <span className="font-label-sm text-label-sm text-outline">उद्योग रिक्त पदे (Demand)</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold mt-1">{dashboard?.recorded_vacancies.toLocaleString() ?? "—"}</span>
                <span className="font-code-sm text-code-sm text-outline mt-0.5">Recorded active vacancies</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col">
                <span className="font-label-sm text-label-sm text-outline">प्रशिक्षण बॅच क्षमता</span>
                <span className="font-headline-sm text-headline-sm text-secondary font-bold mt-1">{dashboard?.total_batch_capacity.toLocaleString() ?? "—"}</span>
                <span className="font-code-sm text-code-sm text-outline mt-0.5">{dashboard ? `${dashboard.active_training_centers} recorded centers` : "—"}</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col">
                <span className="font-label-sm text-label-sm text-outline">निव्वळ तूट (Net Gap)</span>
                <span className="font-headline-sm text-headline-sm text-error font-bold mt-1">{dashboard ? demandSupplyData.reduce((sum, row) => sum + row.gap, 0).toLocaleString() : "—"}</span>
                <span className="font-code-sm text-code-sm text-error mt-0.5">Recorded vacancy / training-seat comparison</span>
              </div>
            </div>

            {/* Gap Table */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col gap-3">
              <span className="font-title-md text-title-md text-primary font-bold">
                व्यवसाय-वार तूट विश्लेषण (Occupation Shortage Analysis)
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm">
                  <thead className="bg-surface-container-low border-b border-surface-variant/30 text-outline font-label-sm text-label-sm uppercase tracking-wider">
                    <tr>
                      <th className="p-3">व्यवसाय (Trade)</th>
                      <th className="p-3">मागणी (Demand)</th>
                      <th className="p-3">पुरवठा (Capacity)</th>
                      <th className="p-3">तूट (Gap)</th>
                      <th className="p-3">प्राधान्य (Priority)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/20">
                    {demandSupplyData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-bright transition-colors">
                        <td className="p-3 font-bold text-primary">{row.trade}</td>
                        <td className="p-3 text-on-surface">{row.demand} जागा</td>
                        <td className="p-3 text-on-surface">{row.supply} जागा</td>
                        <td className="p-3 font-bold text-error">{row.gap} जागा</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                            row.priority.includes("Critical")
                              ? "bg-error-container text-error"
                              : "bg-surface-container text-outline"
                          }`}>
                            {row.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Batch Planner Simulator */}
        {activeTab === "batch_planner" && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 border border-surface-variant/40 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
              <div>
                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                  Illustrative budget calculator
                </span>
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold mt-0.5">
                  बॅच नियोजन व अवशोषण सिम्युलेटर (Batch Planning Simulator)
                </h2>
              </div>
              <TruthBadge state="SANDBOX" />
            </div>

            <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/60 flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
              <AlertCircle className="w-4 h-4 text-secondary shrink-0" />
              <span>
                <strong>DRAFT SIMULATION:</strong> Illustrative costs only. Candidate suitability, placement, official policy rates and funding have not been verified.
              </span>
            </div>

            {simulationError && (
              <div className="p-3 rounded-xl bg-error-container text-on-error-container flex items-center justify-between">
                <span>{simulationError}</span>
                <button
                  type="button"
                  onClick={() => setSimulationError(null)}
                  className="px-2 py-0.5 text-xs bg-surface rounded"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-primary font-semibold">
                  प्रशिक्षण पात्रता कोड (Qualification Code)
                </label>
                <select
                  value={selectedQp}
                  onChange={(e) => setSelectedQp(e.target.value)}
                  className="min-h-[44px] px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none"
                >
                  <option value="ASC/Q1411">Automotive Two-Wheeler Technician (ASC/Q1411)</option>
                  <option value="SGJ/Q0101">Solar PV Rooftop Installer (SGJ/Q0101)</option>
                  <option value="AMH/Q1947">Self Employed Tailor (AMH/Q1947)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-primary font-semibold">
                  प्रस्तावित क्षमता (Proposed Batch Capacity)
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={proposedCapacity}
                  onChange={(e) => setProposedCapacity(Number(e.target.value))}
                  className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none"
                />
              </div>

              <div className="col-span-full">
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={handleSimulateBatch}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center gap-2 shadow-sm active:bg-primary-container transition-all"
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>सिम्युलेशन मोजत आहे...</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4" />
                      <span>सिम्युलेशन चालवा (Run Simulation)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {batchResult && (
              <div className="mt-2 p-4 rounded-xl bg-surface-container-low border border-surface-variant/30 flex flex-col gap-2">
                <span className="font-title-md text-title-md text-primary font-bold">
                  सिम्युलेशन निष्कर्ष (Simulated Outcomes):
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                  <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-variant/20">
                    <span className="font-label-sm text-label-sm text-outline">पात्र उमेदवार पूल:</span>
                    <p className="font-title-md text-title-md font-bold text-primary mt-1">
                      {batchResult.feasibility_assessment.potential_candidate_pool_in_radius ?? "Not assessed"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-variant/20">
                    <span className="font-label-sm text-label-sm text-outline">स्थानिक न भरलेली मागणी:</span>
                    <p className="font-title-md text-title-md font-bold text-secondary mt-1">
                      Not assessed
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-variant/20">
                    <span className="font-label-sm text-label-sm text-outline">अपेक्षित अवशोषण दर:</span>
                    <p className="font-title-md text-title-md font-bold text-on-tertiary-container mt-1">
                      Not assessed
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-variant/20">
                    <span className="font-label-sm text-label-sm text-outline">अंदाजे आर्थिक तरतूद:</span>
                    <p className="font-title-md text-title-md font-bold text-primary mt-1">
                      ₹{batchResult.budget_breakdown_inr.total_batch_budget_inr.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Project Proposal Generator */}
        {activeTab === "project_builder" && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 border border-surface-variant/40 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
              <div>
                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                  PM-AJAY GIA Component Project Formulation
                </span>
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold mt-0.5">
                  जिल्हा प्रकल्प प्रस्ताव जनरेटर (Project Builder)
                </h2>
              </div>
              <TruthBadge state="DRAFT" />
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant">
              नागपूर जिल्ह्यातील वंचित घटकांसाठी ऑटोमोबाइल व सौर ऊर्जा क्षेत्रातील एकत्रित प्रकल्प प्रस्ताव तयार करा.
            </p>

            {proposalError && (
              <div className="p-3 rounded-xl bg-error-container text-on-error-container flex items-center justify-between">
                <span>{proposalError}</span>
                <button
                  type="button"
                  onClick={() => setProposalError(null)}
                  className="px-2 py-0.5 text-xs bg-surface rounded"
                >
                  Dismiss
                </button>
              </div>
            )}

            <button
              type="button"
              disabled={isBuildingProposal}
              onClick={handleBuildProposal}
              className="self-start px-5 py-2.5 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center gap-2 shadow-sm active:bg-primary-container transition-all"
            >
              {isBuildingProposal ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>प्रस्ताव तयार करत आहे...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>प्रस्ताव तयार करा (Generate Project Proposal)</span>
                </>
              )}
            </button>

            {proposalResult && (
              <div className="mt-2 p-5 rounded-2xl bg-surface-container-low border border-surface-variant/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-title-md text-title-md text-primary font-bold">
                    {proposalResult.project_title}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-code-sm text-code-sm font-bold">
                    {proposalResult.proposal_status}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-surface-container-lowest">
                    <span className="font-label-sm text-label-sm text-outline">लक्ष्यित लाभार्थी संख्या:</span>
                    <p className="font-title-md text-title-md font-bold text-primary mt-1">
                      {proposalResult.target_sc_beneficiaries} युवक
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-lowest">
                    <span className="font-label-sm text-label-sm text-outline">अंदाजे अर्थसंकल्प:</span>
                    <p className="font-title-md text-title-md font-bold text-secondary mt-1">
                      ₹{proposalResult.total_budget_inr.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-lowest">
                    <span className="font-label-sm text-label-sm text-outline">प्रकल्प कालावधी:</span>
                    <p className="font-title-md text-title-md font-bold text-primary mt-1">
                      Not specified
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Data Provenance & Health */}
        {activeTab === "sources" && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 border border-surface-variant/40 shadow-sm flex flex-col gap-4">
            <span className="font-title-md text-title-md text-primary font-bold">
              डेटा स्रोत, फ्रेशनेस व प्रमाणीकरण (Data Provenance & Health)
            </span>

            <div className="flex flex-col gap-2.5">
              {sources.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-surface-container-low border border-surface-variant/30 flex items-center justify-between"
                >
                  <div>
                    <span className="font-title-md text-title-md text-primary font-bold">{s.source_name}</span>
                    <p className="font-code-sm text-code-sm text-outline mt-0.5">{s.last_success_at ?? "No recorded synchronization"}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed/50 text-on-tertiary-container font-label-sm text-label-sm font-semibold">
                    {s.quality_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
