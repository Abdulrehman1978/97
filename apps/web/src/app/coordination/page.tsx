"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import { ArrowRightLeft, Clock, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export default function InterAgencyCoordinationPage() {
  const [items, setItems] = useState([
    {
      id: "COORD-2026-001",
      beneficiary_name: "Ramesh Mesram",
      from_dept: "District Skill Committee (DSC) Nagpur",
      to_dept: "Vidarbha Skills Academy (PIA)",
      action_required: "Verify workshop tools & confirm RPL assessment date",
      sla_days_remaining: 3,
      status: "In Progress",
      blocker: "None"
    },
    {
      id: "COORD-2026-002",
      beneficiary_name: "Sunita Kamble",
      from_dept: "Field Counsellor Desk",
      to_dept: "Mahatma Phule BC Development Corporation (MPBCDC)",
      action_required: "Verify Caste validity and revenue income certificate",
      sla_days_remaining: -1, // Escalated!
      status: "Escalated",
      blocker: "Revenue portal server response delay"
    }
  ]);

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-12">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
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
            SLA Compliance: 91.4%
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
                        onClick={() => alert(`Coordination case ${item.id} acknowledged.`)}
                        className="px-3 py-1 bg-sky-50 text-[#0f4c81] border border-sky-200 rounded-lg hover:bg-sky-100 font-bold"
                      >
                        Acknowledge
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
