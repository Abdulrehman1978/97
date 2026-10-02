"use client";

import React, { useState, useEffect } from "react";
import { DataState } from "@/components/DataState";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import { getCases, counsellorOverride } from "@/lib/api";
import { UserCheck, ShieldAlert, CheckCircle2, ArrowRight, Phone, MapPin, AlertCircle, RefreshCw } from "lucide-react";

export default function FieldWorkerPage() {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [overrideSubmitted, setOverrideSubmitted] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState("CASE-2026-NAG-01");
  const [currentRec, setCurrentRec] = useState("Automotive Two Wheeler Service Technician (Wage)");
  const [newPathway, setNewPathway] = useState("Self Employed Motorcycle Workshop Owner");
  const [overrideReason, setOverrideReason] = useState(
    "Candidate already owns ancestral plot and basic compressor in village; enterprise model has higher family survival than distant wage employment."
  );

  const [loadError, setLoadError] = useState("");

  const fetchCases = async () => {
    setLoading(true); setLoadError("");
    try {
      const data = await getCases("MH-NAG");
      if (data && data.length > 0) {
        setCases(data);
        setSelectedCase(data[0].id);
        setCurrentRec(data[0].current_rec || "Automotive Service Technician (Wage)");
      } else {
        setCases([]);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Caseload unavailable.");
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      alert("Mandatory reason must be entered for counsellor override.");
      return;
    }
    setOverrideError(null);
    try {
      await counsellorOverride(
        selectedCase,
        "counsellor-nagpur-01",
        currentRec,
        newPathway,
        overrideReason
      );
      setOverrideSubmitted(true);
    } catch (err: any) {
      setOverrideError(err.message || "Failed to persist override to audit log.");
    }
  };

  if (loading) return <DataState title="Loading caseload" message="Retrieving assigned cases…" />;
  if (loadError) return <DataState title="Caseload unavailable" message={loadError} retry={fetchCases} />;
  if (!cases.length) return <DataState title="No assigned cases" message="Your authorized caseload is empty. No sample records have been substituted." retry={fetchCases} />;
  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-12">
      <Navbar />

      <main id="main-content" className="workspace-main max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {overrideError && <p role="alert" className="p-4 bg-red-50 text-red-900">{overrideError}</p>}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ground Support & Case Management
              </span>
              <TruthBadge state="LIVE" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              क्षेत्रीय कार्यकर्ता व समुपदेशक डॅशबोर्ड (Field Worker Desk)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              घरोघरी सर्वेक्षण, ऑफलाइन पडताळणी आणि मानवी शिफारस बदल (Counsellor Override with Audit)
            </p>
          </div>

          <span className="px-3 py-1 bg-sky-50 text-[#0f4c81] rounded-xl text-xs font-bold border border-sky-200">
            हिंगणा ब्लॉक • २ नियुक्त प्रकरणे (Assigned)
          </span>
        </div>

        {/* Assigned Caseload */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            नियुक्त लाभार्थ्यांची यादी (Assigned Caseload)
          </h2>

          <div className="space-y-3">
            {cases.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{c.status}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {c.village} • फोन: {c.phone} • एआय शिफारस: <strong className="text-slate-800">{c.current_rec}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCase(c.id)}
                  className="px-4 py-2 bg-[#0f4c81] text-white rounded-xl font-bold hover:bg-[#0c3c66] transition-colors"
                >
                  तपासा व निर्णय घ्या (Review Case)
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Counsellor Override Form with Mandatory Reason & Audit */}
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                मानवी समुपदेशक बदल (Counsellor Override with Audit)
              </h2>
              <p className="text-xs text-slate-500">
                जर एआय शिफारसीपेक्षा वेगळा मार्ग स्थानिक परिस्थितीनुसार योग्य असेल, तर कारण नमूद करून शिफारस बदला.
              </p>
            </div>
          </div>

          {overrideSubmitted ? (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium">
              ✓ शिफारस यशस्वीरित्या बदलली गेली! अपरिवर्तनीय ऑडिट लॉगमध्ये कारण नोंदवले गेले आहे: 
              <br />
              <em className="text-slate-700">&quot;{overrideReason}&quot;</em>
            </div>
          ) : (
            <form onSubmit={handleOverride} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">निवडलेले प्रकरण (Selected Case)</label>
                <input
                  type="text"
                  value={selectedCase}
                  disabled
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">नवीन सुचवलेला उपजीविका मार्ग (New Pathway)</label>
                <input
                  type="text"
                  value={newPathway}
                  onChange={(e) => setNewPathway(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  बदलाचे अनिवार्य कारण (Mandatory Audit Reason) *
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-[#0f4c81]"
                  placeholder="उदा. स्थानिक जागेची उपलब्धता, कौटुंबिक पार्श्वभूमी, किंवा विशेष कारण..."
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors shadow-sm"
                >
                  शिफारस बदला व ऑडिट नोंद करा (Save Override & Log Audit)
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
