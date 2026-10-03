"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import type { CoordinationReferral } from "@/lib/api/contracts";
import { useRuntimeTruth } from "@/lib/runtime-truth-context";
import { RequireAuth } from "@/lib/api/auth-context";
import {
  ArrowRightLeft,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Building,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Loader2
} from "lucide-react";
import { getCoordinationItems, updateCoordinationStatus } from "@/lib/api";

export default function InterAgencyCoordinationPage() {
  return (
    <RequireAuth roles={["counsellor", "field_worker", "district_admin", "state_admin", "ministry_admin"]}>
      <CoordinationWorkspace />
    </RequireAuth>
  );
}

function CoordinationWorkspace() {
  const { truthState } = useRuntimeTruth();
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);


  const [items, setItems] = useState<CoordinationReferral[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await getCoordinationItems();
      setItems(data || []);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Failed to load coordination records.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpdateStatus = async (referralId: string, currentStatus: string) => {
    setUpdatingId(referralId);
    setMutationError(null);
    const newStatus = currentStatus.toLowerCase().includes("progress") ? "completed" : "in_progress";
    try {
      await updateCoordinationStatus(referralId, newStatus);
      // AUTHORITATIVE UPDATE ONLY ON SUCCESS
      setItems((prev) =>
        prev.map((it) =>
          it.id === referralId ? { ...it, status: newStatus === "completed" ? "Completed" : "In Progress" } : it
        )
      );
    } catch (e: any) {
      console.warn("Status update failed:", e);
      // RETAIN PRIOR STATE ON FAILURE - DO NOT MUTATE UI
      setMutationError(`Failed to update status on server: ${e?.message || "Network error"}. Prior state retained.`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 pt-24 pb-6 flex flex-col gap-6">
        {/* Header Strip */}
        <div className="bg-surface-container rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                GIA Mandate • Cross-Agency Workflow &amp; Handoff Engine
              </span>
              <TruthBadge state={truthState} />
            </div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold mt-1">
              आंतर-विभागीय समन्वय कार्यक्षेत्र (Inter-Agency Coordination)
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              जिल्हा कौशल्य समिती, महामंडळे, बँका आणि प्रशिक्षण संस्थांमधील प्रकरण ट्रॅकिंग व SLA नियंत्रण
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-tertiary-fixed/40 border border-secondary/30 text-on-tertiary-container font-code-sm text-code-sm font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              Recorded handoffs
            </span>
          </div>
        </div>

        {/* Error Banners */}
        {apiError && (
          <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={fetchItems}
              className="px-3 py-1 bg-surface rounded-lg font-bold text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {mutationError && (
          <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{mutationError}</span>
            </div>
            <button
              onClick={() => setMutationError(null)}
              className="px-2 py-0.5 text-xs bg-surface rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Coordination Table Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 border border-surface-variant/40 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-title-md text-title-md text-primary font-bold">
              सक्रिय समन्वय प्रकरणे (Active Cross-Agency Handoffs)
            </span>
            <span className="font-code-sm text-code-sm px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-semibold">
              {items.length} Tracked Handoffs
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span>Loading cross-agency handoffs...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant">
              <p>No active cross-agency coordination records found.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="bg-surface-container-low border-b border-surface-variant/30 text-outline font-label-sm text-label-sm uppercase tracking-wider">
                <tr>
                  <th className="p-3">Case ID</th>
                  <th className="p-3">Beneficiary</th>
                  <th className="p-3">Handoff Route</th>
                  <th className="p-3">Action Required</th>
                  <th className="p-3">SLA Status</th>
                  <th className="p-3">Workflow State</th>
                  <th className="p-3 text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant/20">
                {items.map((it) => {
                  const isEscalated = it.status === "Escalated" || (it.sla_days_remaining !== null && it.sla_days_remaining < 0);
                  const isUpdating = updatingId === it.id;

                  return (
                    <tr key={it.id} className="hover:bg-surface-bright transition-colors">
                      <td className="p-3 font-code-sm text-code-sm font-bold text-primary">
                        {it.id}
                      </td>
                      <td className="p-3 font-semibold text-on-surface">
                        {it.beneficiary_name}
                      </td>
                      <td className="p-3 text-on-surface-variant">
                        <div className="flex items-center gap-1 text-label-sm font-label-sm">
                          <span className="truncate max-w-[120px]">{it.from_dept}</span>
                          <ArrowRight className="w-3 h-3 text-secondary shrink-0" />
                          <span className="font-semibold text-primary truncate max-w-[140px]">{it.to_dept}</span>
                        </div>
                      </td>
                      <td className="p-3 text-on-surface max-w-[220px]">
                        <p className="truncate font-medium">{it.action_required}</p>
                        {it.blocker !== "None" && (
                          <span className="text-error font-code-sm text-code-sm flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            {it.blocker}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                          isEscalated
                            ? "bg-error-container text-error"
                            : "bg-surface-container text-primary"
                        }`}>
                          <Clock className="w-3 h-3" />
                          {isEscalated ? "Overdue / escalated" : it.sla_days_remaining === null ? "No due date recorded" : `${it.sla_days_remaining}d remaining`}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                          it.status === "Completed"
                            ? "bg-tertiary-fixed text-on-tertiary-container"
                            : isEscalated
                            ? "bg-error-container text-error"
                            : "bg-secondary-fixed text-on-secondary-fixed"
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {it.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(it.id, it.status)}
                          className="min-h-[36px] px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm font-bold transition-colors disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>{it.status === "Completed" ? "Re-open" : "Progress"}</span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
