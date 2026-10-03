"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import type { FieldCase } from "@/lib/api/contracts";
import { RequireAuth } from "@/lib/api/auth-context";
import { getCases, counsellorOverride } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { useRuntimeTruth } from "@/lib/runtime-truth-context";
import {
  ShieldAlert,
  CheckCircle2,
  Phone,
  MapPin,
  AlertCircle,
  RefreshCw,
  Search,
  Sliders,
  History,
  Check,
  Loader2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export interface FieldCaseViewModel {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  village: string;
  phone: string;
  currentRecommendation: string;
  blocker?: string;
  nextAction?: string;
  status: string;
  priority: string;
  verified: boolean;
}

function mapApiCase(raw: FieldCase): FieldCaseViewModel {
  return {
    id: raw.id,
    beneficiaryId: raw.beneficiary_id,
    beneficiaryName: raw.beneficiary_name,
    village: raw.village || "Not recorded",
    phone: raw.phone || "Not provided",
    currentRecommendation: raw.current_rec || "Livelihood Assessment Pending",
    blocker: raw.blocker || undefined,
    nextAction: raw.next_action || undefined,
    status: raw.status || "Open",
    priority: raw.priority || "Medium",
    verified: Boolean(raw.verified),
  };
}

export default function FieldWorkerPage() {
  return (
    <RequireAuth roles={["field_worker", "counsellor", "financial_counsellor", "district_admin", "state_admin", "ministry_admin"]}>
      <FieldWorkerDesk />
    </RequireAuth>
  );
}

function FieldWorkerDesk() {
  const { t } = useLanguage();
  const { truthState } = useRuntimeTruth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<FieldCaseViewModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [currentRec, setCurrentRec] = useState("");
  const [newPathway, setNewPathway] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideSubmitted, setOverrideSubmitted] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auditLog, setAuditLog] = useState<{ id: string; case_id: string; old_path: string; new_path: string; reason: string; timestamp: string }[]>([]);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCases("MH-NAG");
      if (Array.isArray(data)) {
        const mapped = data.map(mapApiCase);
        setCases(mapped);
        if (mapped.length > 0) {
          setSelectedCaseId(mapped[0].id);
          setCurrentRec(mapped[0].currentRecommendation);
        }
      } else {
        setCases([]);
      }
    } catch (e: any) {
      console.error("[Field Desk] API fetch error:", e);
      setError(e.message || "Failed to load assigned field cases from server.");
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSelectCase = (c: FieldCaseViewModel) => {
    setSelectedCaseId(c.id);
    setNewPathway("");
    setOverrideReason("");
    setCurrentRec(c.currentRecommendation);
    setOverrideSubmitted(false);
    setOverrideError(null);
  };

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim() || !newPathway.trim() || !selectedCaseId) {
      setOverrideError(t("field.reason_placeholder", "Mandatory justification reason must be entered."));
      return;
    }
    setIsSubmitting(true);
    setOverrideError(null);
    try {
      const res = await counsellorOverride(
        selectedCaseId,
        "",
        currentRec,
        newPathway,
        overrideReason
      );

      const auditEntry = {
        id: res.audit_id,
        case_id: selectedCaseId,
        old_path: currentRec,
        new_path: newPathway,
        reason: overrideReason,
        timestamp: new Date().toLocaleTimeString(),
      };

      setAuditLog((prev) => [auditEntry, ...prev]);
      setOverrideSubmitted(true);

      // The server records an advisory override, not approval or pathway selection.
    } catch (err: any) {
      setOverrideError(err.message || "Failed to persist override to audit log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCases = cases.filter(
    (c) =>
      c.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.currentRecommendation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || filteredCases[0] || cases[0];

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 pt-20 flex flex-col gap-6">
        {/* Header Strip */}
        <div className="bg-surface-container rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                Ground Support &amp; Caseload Intervention Desk
              </span>
              <TruthBadge state={truthState} />
            </div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold mt-1">
              {t("field.title", "Field Caseload & Override Desk")}
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {t("field.subtitle", "Nagpur Rural Division • Beneficiary support, blocker resolution & recommendation adjustments")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-surface-variant/40 text-primary font-code-sm text-code-sm font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              Recorded audit trail
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-medium text-on-surface-variant">
              Connecting to secure caseload service...
            </span>
          </div>
        )}

        {/* Error State with Retry (No silent fake fallbacks) */}
        {!loading && error && (
          <div className="p-6 bg-error-container/20 border border-error/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-error">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-base">Unable to load field caseload</h3>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchCases}
              className="px-4 py-2 bg-error text-on-error rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-error/90 transition-colors shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cases.length === 0 && (
          <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center gap-3">
            <UserCheck className="w-10 h-10 text-outline" />
            <h3 className="text-lg font-bold text-on-surface">No assigned cases found</h3>
            <p className="text-sm text-on-surface-variant max-w-md">
              There are currently no active caseload items assigned in this jurisdiction.
            </p>
            <button
              onClick={fetchCases}
              className="mt-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-medium text-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Caseload</span>
            </button>
          </div>
        )}

        {/* 2-Column Split Workspace */}
        {!loading && !error && cases.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Caseload Table (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-variant/40 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-title-md text-title-md text-primary font-bold">
                    {t("field.cases_count", "Assigned Cases")}
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
                    placeholder={t("field.search_placeholder", "Search by name, village, or ID...")}
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
                            {c.beneficiaryName}
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
                            {c.currentRecommendation}
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
                        {t("field.selected_profile", "Selected Case Profile")} • {selectedCase.id}
                      </span>
                      <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                        {selectedCase.beneficiaryName}
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2 mt-0.5">
                        <span>{selectedCase.village}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-outline" /> {selectedCase.phone}
                        </span>
                      </p>
                    </div>
                    <TruthBadge state={selectedCase.verified ? "VERIFIED" : truthState} />
                  </div>

                  {/* Blocker & Next Intervention */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-error-container/30 border border-error/20 flex flex-col gap-1">
                      <span className="font-label-sm text-label-sm text-error font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t("field.blocker_title", "Current Blocker")}
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface">
                        {selectedCase.blocker || "None recorded"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-tertiary-fixed/30 border border-secondary/20 flex flex-col gap-1">
                      <span className="font-label-sm text-label-sm text-on-tertiary-container font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                        {t("field.next_action_title", "Next Intervention")}
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface">
                        {selectedCase.nextAction || "Routine field follow-up"}
                      </p>
                    </div>
                  </div>

                  {/* Counsellor Override Form */}
                  <div className="mt-2 pt-3 border-t border-surface-variant/30 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-primary font-bold flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-secondary" />
                        {t("field.override_title", "Counsellor Pathway Override")}
                      </span>
                      <span className="font-code-sm text-code-sm text-outline">
                        Formal Audit Record Required
                      </span>
                    </div>

                    {overrideSubmitted ? (
                      <div className="p-4 rounded-xl bg-tertiary-fixed/40 border border-secondary/30 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-on-tertiary-container font-bold font-title-md">
                          <Check className="w-5 h-5 text-secondary" />
                          <span>{t("field.override_success", "Override recorded and logged to audit trail.")}</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface">
                          Updated: <strong>{newPathway}</strong>. An immutable audit entry has been persisted.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleOverride} className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-label-sm text-outline font-semibold">
                              {t("field.current_rec_label", "Current AI Recommendation")}
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
                              {t("field.proposed_rec_label", "Proposed Professional Override")}
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
                              <option value="Self Employed Tailor & Boutique Owner">
                                Self Employed Tailor &amp; Boutique Owner (Enterprise)
                              </option>
                              <option value="Solar PV Rooftop Technician">
                                Solar PV Rooftop Technician (Green Jobs)
                              </option>
                              <option value="Electric Vehicle Battery Assembly Specialist">
                                Electric Vehicle Battery Assembly Specialist (Emerging)
                              </option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="font-label-sm text-label-sm text-primary font-semibold">
                            {t("field.reason_label", "Mandatory Professional Justification")}
                          </label>
                          <textarea
                            rows={3}
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder={t("field.reason_placeholder", "Detailed justification reason...")}
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
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>{t("field.save_override", "Save Override to Audit Log")}</span>
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
        )}
      </main>
    </div>
  );
}
