"use client";

import React, { useState, useEffect } from "react";
import { DataState } from "@/components/DataState";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import { getCoordinationItems, updateCoordinationStatus } from "@/lib/api";
import { ArrowRightLeft, Clock, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

export default function InterAgencyCoordinationPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");

  const fetchItems = async () => {
    setLoading(true); setError("");
    try {
      const data = await getCoordinationItems();
      if (data) {
        setItems(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Referrals could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpdateStatus = async (referralId: string, currentStatus: string) => {
    const newStatus = currentStatus.toLowerCase().includes("progress") ? "completed" : "in_progress";
    try {
      await updateCoordinationStatus(referralId, newStatus);
      fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status was not saved.");
    }
  };

  if (loading) return <DataState title="Loading referrals" message="Retrieving coordination records…" />;
  if (error) return <DataState title="Coordination unavailable" message={error} retry={fetchItems} />;
  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-12">
      <Navbar />

      <main id="main-content" className="workspace-main max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                GIA Mandate • Inter-Agency Coordination Workspace
              </span>
              <TruthBadge state="LIVE" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              आंतर-विभागीय समन्वय कार्यक्षेत्र (Inter-Agency Coordination)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              जिल्हा कौशल्य समिती, महामंडळे, बँका आणि प्रशिक्षण संस्थांमधील प्रकरण ट्रॅकिंग व SLA नियंत्रण
            </p>
          </div>

          <span className="px-3 py-1 bg-sky-50 text-[#0f4c81] rounded-xl text-xs font-bold border border-sky-200">
            SLA compliance not measured
          </span>
        </div>

        {/* Coordination Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            सक्रिय समन्वय प्रकरणे (Active Cross-Agency Handoffs)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="p-3">Case ID</th>
                  <th className="p-3">Beneficiary</th>
                  <th className="p-3">From Dept</th>
                  <th className="p-3">To Dept</th>
                  <th className="p-3">Required Action</th>
                  <th className="p-3">SLA Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-800">{item.id}</td>
                    <td className="p-3 font-bold text-slate-900">{item.beneficiary_name}</td>
                    <td className="p-3 text-slate-600">{item.from_dept}</td>
                    <td className="p-3 text-slate-800 font-semibold">{item.to_dept}</td>
                    <td className="p-3 text-slate-700">{item.action_required}</td>
                    <td className="p-3">
                      {item.sla_days_remaining >= 0 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          {item.sla_days_remaining}d left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold animate-pulse">
                          Escalated (Overdue)
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleUpdateStatus(item.id, item.status)}
                        className="px-3 py-1 bg-sky-50 text-[#0f4c81] border border-sky-200 rounded-lg hover:bg-sky-100 font-bold"
                      >
                        {item.status.toLowerCase().includes("progress") ? "पूर्ण करा (Complete)" : "प्रक्रियेत घ्या (Progress)"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
