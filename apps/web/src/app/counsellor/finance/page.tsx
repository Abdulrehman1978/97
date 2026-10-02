"use client";

import React, { useState, useEffect } from "react";
import { DataState } from "@/components/DataState";
import { downloadDraft } from "@/lib/download-draft";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import { getEnterprisePlan, getCases } from "@/lib/api";
import { Briefcase, IndianRupee, ShieldCheck, CheckSquare, AlertTriangle, FileText, RefreshCw } from "lucide-react";

export default function FinancialCounsellorPage() {
  const [loading, setLoading] = useState(true);
  const [enterpriseCase, setEnterpriseCase] = useState<any>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true); setError("");
      try {
        const cases = await getCases();
        if (!cases.length) throw new Error("No authorized enterprise case is assigned.");
        const idToFetch = cases[0].beneficiary_id;
        const data = await getEnterprisePlan(idToFetch);
        if (data) {
          setEnterpriseCase(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Enterprise plan unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [revision]);

  if (loading) return <DataState title="Loading enterprise plan" message="Retrieving your authorized caseload…" />;
  if (error || !enterpriseCase) return <DataState title="Enterprise plan unavailable" message={error || "No saved plan."} retry={() => setRevision(n => n + 1)} />;
  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-12">
      <Navbar />

      <main id="main-content" className="workspace-main max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                GIA Mandate • Trained Financial Consultant Workspace
              </span>
              <TruthBadge state={enterpriseCase.truth_state || "DEMO_DATA"} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              वित्तीय व सूक्ष्म-उद्यम समुपदेशक डेस्क (Financial & Enterprise Counsellor)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              सूक्ष्म व्यवसाय व्यवहार्यता, पीएम-अजय टूल किट अनुदान आणि एनएसएफडीसी पतपुरवठा पूर्व-तपासणी
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>नो-सँक्शन सुरक्षा नियम (No Sanction Promise)</span>
            </span>
          </div>
        </div>

        {/* Legal & Decision Support Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
          <div>
            <strong>महत्त्वाची मार्गदर्शक सूचना (Important Governance Rule):</strong> हे व्यासपीठ थेट कर्ज किंवा अनुदान मंजूर करत नाही. हा निर्णय-समर्थन अहवाल केवळ लाभार्थ्याची वित्तीय तयारी तपासतो आणि अधिकृत जिल्हा कौशल्य समिती (DSC) किंवा बँकेकडे अर्ज करण्यासाठी मदत करतो.
          </div>
        </div>

        {/* Enterprise Capital Assumptions Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-2">
            प्रकल्प भांडवल अंदाज (Indicative Startup Capital Assumptions)
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            व्यवसाय: <strong>{enterpriseCase.target_enterprise}</strong> • लाभार्थी: <strong>{enterpriseCase.beneficiary_name}</strong>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">यंत्रसामग्री व अवजारे (Capex)</span>
              <div className="text-base font-bold text-slate-900 mt-1">₹{enterpriseCase.assumed_capital_needs.equipment_capex.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">खेळते भांडवल (Opex)</span>
              <div className="text-base font-bold text-slate-900 mt-1">₹{enterpriseCase.assumed_capital_needs.working_capital_opex.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">एकूण अंदाजित खर्च</span>
              <div className="text-base font-bold text-[#0f4c81] mt-1">₹{enterpriseCase.assumed_capital_needs.total_estimated_inr.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">अपेक्षित नफा कालावधी</span>
              <div className="text-base font-bold text-emerald-700 mt-1">{enterpriseCase.assumed_capital_needs.break_even_months} Months</div>
            </div>
          </div>
        </div>

        {/* Scheme Pre-Screening Matrix */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-3">
            शासकीय योजना व अनुदान पूर्व-तपासणी (Scheme Pre-Screening)
          </h2>

          <div className="space-y-3">
            {enterpriseCase.scheme_prescreening?.map((sc: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{sc.scheme_name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{sc.status}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{sc.condition}</p>
                </div>
                <div className="text-right sm:self-center">
                  <span className="font-bold text-[#0f4c81] font-mono text-sm">{sc.indicative_amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial & Digital Literacy Checklist */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-3">
            वित्तीय साक्षरता पडताळणी यादी (Financial Literacy Checklist)
          </h2>

          <div className="space-y-2 text-xs">
            {enterpriseCase.literacy_checklist?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <CheckSquare className={`w-4 h-4 ${item.done ? "text-emerald-600" : "text-slate-300"}`} />
                <span className={item.done ? "text-slate-800 font-medium" : "text-slate-500"}>
                  {item.task}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => downloadDraft("enterprise-readiness-draft", enterpriseCase, enterpriseCase.truth_state || "UNKNOWN")}
              className="px-6 py-2.5 bg-[#0f4c81] text-white text-xs font-bold rounded-xl hover:bg-[#0c3c66] transition-colors shadow-sm"
            >
              वित्तीय तयारी मसुदा डाउनलोड करा (Download Readiness Draft · JSON)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
