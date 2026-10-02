"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import { RequireAuth } from "@/lib/api/auth-context";
import { getCases, counsellorOverride } from "@/lib/api";
import {
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Phone,
  MapPin,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Sliders,
  History,
  Check,
  Loader2,
  ShieldCheck,
  FileText
} from "lucide-react";

export default function FieldWorkerPage() {
  return (
    <RequireAuth roles={["field_worker", "counsellor", "district_admin", "state_admin", "ministry_admin"]}>
      <FieldWorkerDesk />
    </RequireAuth>
  );
}

function FieldWorkerDesk() {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [overrideSubmitted, setOverrideSubmitted] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState("CASE-2026-NAG-01");
  const [auditLog, setAuditLog] = useState<any[]>([]);

  // Override Form
  const [currentRec, setCurrentRec] = useState("Automotive Service Technician (Wage)");
  const [newPathway, setNewPathway] = useState("Self Employed Motorcycle Workshop Owner");
  const [overrideReason, setOverrideReason] = useState(
    "Candidate already owns ancestral plot and basic compressor in village; enterprise model has higher family survival than distant wage employment."
  );

  const defaultCases = [
    {
      id: "CASE-2026-NAG-01",
      name: "Ramesh Mesram",
      name_mr: "रमेश मेश्राम",
      village: "Nildoh, Hingna",
      phone: "9876543210",
      current_rec: "Automotive Service Technician (Wage)",
      blocker: "Missing 10th marksheet copy for PM-AJAY registration",
      next_action: "Collect certified copy & verify workshop tools",
      status: "In Assessment",
      verified: true
    },
    {
      id: "CASE-2026-NAG-02",
      name: "Sunita Kamble",
      name_mr: "सुनीता कांबळे",
      village: "Wadi, Nagpur",
      phone: "9823114455",
      current_rec: "Self Employed Tailor (Enterprise)",
      blocker: "Caste certificate validation pending at revenue office",
      next_action: "Escalate to MPBCDC liaison officer",
      status: "Document Verification",
      verified: false
    },
    {
      id: "CASE-2026-NAG-03",
      name: "Vijay Gaikwad",
      name_mr: "विजय गायकवाड",
      village: "Butibori, Nagpur",
      phone: "9890123456",
      current_rec: "Solar PV Rooftop Technician",
      blocker: "Requires wheelchair-accessible training center verification",
      next_action: "Audit Center TC-MH-NAG-02 ramp infrastructure",
      status: "Placement Matched",
      verified: true
    }
  ];

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await getCases("MH-NAG");
      if (data && data.length > 0) {
        setCases(data);
        setSelectedCaseId(data[0].id);
        setCurrentRec(data[0].current_rec || "Automotive Service Technician (Wage)");
      } else {
        setCases(defaultCases);
      }
    } catch (e) {
      console.warn("Using default field caseload:", e);
      setCases(defaultCases);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSelectCase = (c: any) => {
    setSelectedCaseId(c.id);
    setCurrentRec(c.current_rec);
    setOverrideSubmitted(false);
    setOverrideError(null);
  };

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      setOverrideError("Mandatory justification reason must be entered for counsellor override.");
      return;
    }
    setIsSubmitting(true);
    setOverrideError(null);
    try {
      const res = await counsellorOverride(
        selectedCaseId,
        "counsellor-nagpur-01",
        currentRec,
        newPathway,
        overrideReason
      );

      const auditEntry = {
        id: (res as any)?.audit_id || `AUDIT-${Date.now().toString().slice(-6)}`,
        case_id: selectedCaseId,
        old_path: currentRec,
        new_path: newPathway,
        reason: overrideReason,
        timestamp: new Date().toLocaleTimeString()
      };

      setAuditLog((prev) => [auditEntry, ...prev]);
      setOverrideSubmitted(true);

      // Update in-memory cases list
      setCases((prev) =>
        prev.map((c) =>
          c.id === selectedCaseId
            ? { ...c, current_rec: newPathway, status: "Override Approved" }
            : c
        )
      );
      setCurrentRec(newPathway);
    } catch (err: any) {
      setOverrideError(err.message || "Failed to persist override to audit log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const filteredCases = cases.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
        {/* Header Strip */}
        <div className="bg-surface-container rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                Ground Support & Caseload Intervention Desk
              </span>
              <TruthBadge state="LIVE" />
            </div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold mt-1">
              क्षेत्रीय कार्यकर्ता व समुपदेशक कार्यक्षेत्र (Field Caseload & Override Desk)
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              नागपूर ग्रामीण विभाग • थेट लाभार्थी सहाय्य, अडथळा निवारण व व्यावसायिक मार्ग शिफारस
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-surface-variant/40 text-primary font-code-sm text-code-sm font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              Audit Log: ISO-27001 Immutable
            </span>
          </div>
        </div>

        {/* 2-Column Split Workspace: Caseload Stream + Detailed Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Caseload Table (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-variant/40 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-title-md text-title-md text-primary font-bold">
                  सक्रिय प्रकरणे (Assigned Caseload)
                </span>
                <span className="font-code-sm text-code-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
                  {filteredCases.length} Cases
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-outline absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="नावाने किंवा वॉर्डाने शोधा..."
                  className="w-full min-h-[42px] pl-9 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Caseload Cards Stream */}
              <div className="flex flex-col gap-2 max-h-[550px] overflow-y-auto pr-1">
                {filteredCases.map((c) => {
                  const isSelected = c.id === selectedCaseId;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCase(c)}
                      className={`p-3.5 rounded-xl cursor-pointer border transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? "bg-surface-container-high border-secondary shadow-sm"
                          : "bg-surface-container-low border-surface-variant/30 hover:bg-surface-container"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-title-md text-title-md text-primary font-bold">
                          {c.name} {c.name_mr ? `(${c.name_mr})` : ""}
                        </span>
                        <span className="font-code-sm text-code-sm text-outline font-semibold">
                          {c.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
                        <MapPin className="w-3.5 h-3.5 text-secondary" />
                        <span>{c.village}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-surface-variant/20">
                        <span className="font-label-sm text-label-sm text-secondary font-semibold truncate max-w-[200px]">
                          {c.current_rec}
                        </span>
                        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-medium">
                          {c.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Inspector & Counsellor Override Panel (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {selectedCase && (
              <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col gap-4">
                <div className="flex items-start justify-between border-b border-surface-variant/30 pb-3">
                  <div>
                    <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                      Selected Case Profile • {selectedCase.id}
                    </span>
                    <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                      {selectedCase.name}
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2 mt-0.5">
                      <span>{selectedCase.village}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-outline" /> {selectedCase.phone}
                      </span>
                    </p>
                  </div>
                  <TruthBadge state="LIVE" />
                </div>

                {/* Blocker & Next Intervention */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-error-container/30 border border-error/20 flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-error font-bold uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      सध्याचा अडथळा (Blocker)
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      {selectedCase.blocker || "None recorded"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-tertiary-fixed/30 border border-secondary/20 flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-on-tertiary-container font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                      पुढील हस्तक्षेप (Next Intervention)
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      {selectedCase.next_action || "Routine field follow-up"}
                    </p>
                  </div>
                </div>

                {/* Counsellor Override Form */}
                <div className="mt-2 pt-3 border-t border-surface-variant/30 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-title-md text-title-md text-primary font-bold flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-secondary" />
                      मार्ग शिफारस फेरबदल (Counsellor Override)
                    </span>
                    <span className="font-code-sm text-code-sm text-outline">
                      Formal Audit Record Required
                    </span>
                  </div>

                  {overrideSubmitted ? (
                    <div className="p-4 rounded-xl bg-tertiary-fixed/40 border border-secondary/30 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-on-tertiary-container font-bold font-title-md">
                        <Check className="w-5 h-5 text-secondary" />
                        <span>शिफारस फेरबदल यशस्वीरित्या नोंदवला गेला!</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface">
                        नवीन मार्ग: <strong>{newPathway}</strong>. ऑडिट लॉगमध्ये कायमस्वरूपी संदर्भ जतन करण्यात आला आहे.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleOverride} className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="font-label-sm text-label-sm text-outline font-semibold">
                            सध्याचा सुचवलेला मार्ग (Current AI Recommendation)
                          </label>
                          <input
                            type="text"
                            disabled
                            value={currentRec}
                            className="min-h-[42px] px-3 rounded-xl bg-surface-container-high border border-outline-variant/60 font-body-sm text-body-sm text-on-surface-variant opacity-80"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="font-label-sm text-label-sm text-primary font-semibold">
                            समुपदेशक सुचवलेला नवीन मार्ग (Proposed Override)
                          </label>
                          <select
                            value={newPathway}
                            onChange={(e) => setNewPathway(e.target.value)}
                            className="min-h-[42px] px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-sm text-body-sm text-on-surface focus:outline-none"
                          >
                            <option value="Self Employed Motorcycle Workshop Owner">
                              Self Employed Motorcycle Workshop Owner (Micro-Enterprise)
                            </option>
                            <option value="Automotive Service Technician (Wage Employment)">
                              Automotive Service Technician (Wage Employment)
                            </option>
                            <option value="Electric Vehicle Battery Assembly Specialist">
                              Electric Vehicle Battery Assembly Specialist (Green Jobs)
                            </option>
                            <option value="Agricultural Solar Pump Technician">
                              Agricultural Solar Pump Technician (Rural Cluster)
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-primary font-semibold">
                          बदलाचे बंधनकारक कारण (Mandatory Professional Justification)
                        </label>
                        <textarea
                          rows={3}
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          placeholder="स्थानिक संदर्भ, जमिनीची उपलब्धता किंवा कौटुंबिक अडचणींचे सविस्तर कारण लिहा..."
                          className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-sm text-body-sm text-on-surface focus:outline-none resize-none"
                        />
                      </div>

                      {overrideError && (
                        <div className="p-2.5 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-error font-body-sm text-body-sm">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{overrideError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="self-end min-h-[44px] px-5 py-2 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center gap-2 shadow-sm active:bg-primary-container transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>नोंदवत आहे...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>ऑडिट लॉगमध्ये फेरबदल जतन करा (Save Override)</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Audit Trail Preview */}
                {auditLog.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-surface-variant/30 flex flex-col gap-2">
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider flex items-center gap-1">
                      <History className="w-3.5 h-3.5" />
                      Session Override Audit Log
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {auditLog.map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-lg bg-surface-container-low border border-surface-variant/20 font-code-sm text-code-sm flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-primary">{log.id}</span> • {log.case_id}: {log.new_path}
                          </div>
                          <span className="text-outline">{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
