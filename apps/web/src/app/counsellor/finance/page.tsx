"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import type { EnterprisePlan, FieldCase } from "@/lib/api/contracts";
import { RequireAuth } from "@/lib/api/auth-context";
import { getEnterprisePlan, getCases } from "@/lib/api";
import {
  Briefcase,
  IndianRupee,
  ShieldCheck,
  CheckSquare,
  AlertTriangle,
  FileText,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  CheckCircle2,
  ExternalLink,
  Download
} from "lucide-react";

export default function FinancialCounsellorPage() {
  return (
    <RequireAuth roles={["financial_counsellor", "counsellor", "district_admin", "state_admin", "ministry_admin"]}>
      <FinancialCounsellorWorkspace />
    </RequireAuth>
  );
}

function FinancialCounsellorWorkspace() {
  const [loading, setLoading] = useState(true);
  const [enterpriseCase, setEnterpriseCase] = useState<EnterprisePlan | null>(null);

  const [checklist, setChecklist] = useState<EnterprisePlan["literacy_checklist"]>([]);

  const [assignedCases, setAssignedCases] = useState<FieldCase[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [retry, setRetry] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCases().then(data => {
      if (cancelled) return;
      setAssignedCases(data);
      setSelectedBeneficiary(current => current || data[0]?.beneficiary_id || "");
      if (!data.length) setLoading(false);
    }).catch(error => {
      if (!cancelled) {
        setApiError(error instanceof Error ? error.message : "Could not load assigned cases.");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [retry]);

  useEffect(() => {
    if (!selectedBeneficiary) return;
    let cancelled = false;
    setLoading(true);
    setApiError(null);
    setEnterpriseCase(null);
    setChecklist([]);
    getEnterprisePlan(selectedBeneficiary).then(data => {
      if (!cancelled) {
        setEnterpriseCase(data);
        setChecklist(data?.literacy_checklist ?? []);
      }
    }).catch(error => {
      if (!cancelled) setApiError(error instanceof Error ? error.message : "Could not load the enterprise plan.");
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedBeneficiary, retry]);

  const caseSelector = <label className="flex flex-col gap-2">
    Assigned case
    <select className="min-h-11 rounded-xl border p-3 bg-surface" value={selectedBeneficiary}
      onChange={event => setSelectedBeneficiary(event.target.value)}>
      {!assignedCases.length && <option value="">No assigned cases</option>}
      {assignedCases.map(item => <option key={item.id} value={item.beneficiary_id}>{item.beneficiary_name}</option>)}
    </select>
  </label>;

  const handleToggleChecklist = (idx: number) => {
    setChecklist((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, done: !c.done } : c))
    );
  };

  const handleExportDraft = () => {
    if (!enterpriseCase) return;
    const payload = {
      DOCUMENT_TYPE: "DECISION_SUPPORT_DRAFT",
      LEGAL_STATUS: "DRAFT — NOT A SANCTION / NOT AN APPROVAL / NOT A CERTIFICATE",
      DISCLAIMER: "This artifact is a technical decision-support draft for counselling review only. It confers no legal sanction, credit approval, or scheme subsidy.",
      TIMESTAMP: new Date().toISOString(),
      BENEFICIARY_NAME: enterpriseCase.beneficiary_name,
      TARGET_ENTERPRISE: enterpriseCase.target_enterprise,
      DISTRICT: enterpriseCase.district,
      CAPITAL_REQUIREMENTS: enterpriseCase.assumed_capital_needs,
      SCHEME_PRESCREENING: enterpriseCase.scheme_prescreening,
      CHECKLIST_STORAGE: "Session draft — not persisted to the server",
      FINANCIAL_LITERACY_CHECKLIST: checklist
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PM-AJAY-Enterprise-Draft-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading || apiError || !enterpriseCase) {
    return <div className="min-h-screen bg-surface"><Navbar /><main className="mx-auto max-w-3xl px-4 pt-24">
      <h1 className="text-2xl font-bold">Financial counselling</h1>
      {caseSelector}
      <p role={apiError ? "alert" : "status"} className="my-4">{loading ? "Loading assigned enterprise plan…" : apiError || "No enterprise plan has been prepared for the assigned case."}</p>
      {apiError && <button onClick={() => setRetry(value => value + 1)} className="rounded-xl bg-primary p-3 text-on-primary">Retry</button>}
    </main></div>;
  }

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 pt-24 pb-6 flex flex-col gap-6">
        {caseSelector}
        {/* Header Strip */}
        <div className="bg-surface-container rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                GIA Mandate • Trained Financial Consultant Workspace
              </span>
              <TruthBadge state={enterpriseCase.truth_state} />
            </div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold mt-1">
              वित्तीय व सूक्ष्म-उद्यम समुपदेशक डेस्क (Financial & Enterprise Counsellor)
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              सूक्ष्म व्यवसाय व्यवहार्यता, पीएम-अजय टूल किट अनुदान आणि एनएसएफडीसी पतपुरवठा पूर्व-तपासणी
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-secondary-fixed/50 text-on-secondary-fixed border border-secondary/30 rounded-xl font-label-sm text-label-sm font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span>नो-सँक्शन सुरक्षा नियम (No Sanction Promise)</span>
            </span>
          </div>
        </div>

        {/* Mandatory Decision-Support Disclaimer Banner */}
        <div className="bg-surface-container-high border border-outline-variant/60 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-title-md text-title-md text-primary font-bold">
              कायदेशीर व वैधानिक सूचना: केवळ निर्णय-सहाय्य प्रारूप (Decision-Support Draft Only)
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              हे पोर्टल कोणत्याही प्रकारचे अधिकृत कर्ज किंवा अनुदान थेट मंजूर करत नाही. येथे दर्शविलेली आकडेवारी ही केवळ सूक्ष्म-व्यवसायाची आर्थिक व्यवहार्यता तपासण्यासाठी व समुपदेशनासाठी आहे. अंतिम मंजुरी जिल्हा समिती (DSC) व संबंधित बँकेच्या अधिकारात आहे.
            </p>
          </div>
        </div>

        <p className="rounded-xl bg-surface-container p-3">Checklist: session draft only. Download the advisory to keep your changes; it is not an approval.</p>
        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Beneficiary & Capital Breakdown (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Beneficiary Profile Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
                <div>
                  <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                    Assigned Entrepreneur Case
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                    {enterpriseCase.beneficiary_name}
                  </h2>
                </div>
                <span className="font-code-sm text-code-sm px-2.5 py-1 rounded-full bg-surface-container text-primary font-semibold">
                  {enterpriseCase.district}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-outline font-semibold">
                  प्रस्तावित सूक्ष्म-व्यवसाय मॉडेल (Target Enterprise Model)
                </span>
                <span className="font-title-md text-title-md text-on-surface font-bold">
                  {enterpriseCase.target_enterprise}
                </span>
              </div>

              {/* Capital Needs Matrix */}
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-variant/30 flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline">उपकरण भांडवल (Capex)</span>
                  <span className="font-title-md text-title-md text-primary font-bold mt-1">
                    ₹{enterpriseCase.assumed_capital_needs?.equipment_capex?.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-variant/30 flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline">कार्यरत भांडवल (Opex)</span>
                  <span className="font-title-md text-title-md text-primary font-bold mt-1">
                    ₹{enterpriseCase.assumed_capital_needs?.working_capital_opex?.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-high border border-surface-variant/40 flex flex-col">
                  <span className="font-label-sm text-label-sm text-primary font-semibold">एकूण अंदाजे गरज</span>
                  <span className="font-title-md text-title-md text-secondary font-bold mt-1">
                    ₹{enterpriseCase.assumed_capital_needs?.total_estimated_inr?.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-variant/30 flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline">नफा सुरू होण्याचा काळ</span>
                  <span className="font-title-md text-title-md text-primary font-bold mt-1">
                    {enterpriseCase.assumed_capital_needs?.break_even_months} महिने
                  </span>
                </div>
              </div>
            </div>

            {/* Scheme Prescreening Matrix */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col gap-3">
              <span className="font-title-md text-title-md text-primary font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-secondary" />
                शासकीय योजना व पतपुरवठा पूर्व-तपासणी (Scheme Fit Matrix)
              </span>

              <div className="flex flex-col gap-3 mt-1">
                {enterpriseCase.scheme_prescreening?.map((scheme: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-surface-variant/30 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-primary font-bold">
                        {scheme.scheme_name}
                      </span>
                      <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
                        {scheme.indicative_amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                      <span className="text-secondary font-semibold">{scheme.status}</span>
                    </div>
                    <p className="font-code-sm text-code-sm text-outline border-t border-surface-variant/20 pt-1.5 mt-0.5">
                      <strong>अट / निकष:</strong> {scheme.condition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Financial Literacy Checklist & Decision Export (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Literacy Checklist */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col gap-3">
              <span className="font-title-md text-title-md text-primary font-bold flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-secondary" />
                वित्तीय साक्षरता व पूर्वतयारी (Readiness Checklist)
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                समुपदेशकाने खालील मुद्यांवर उमेदवाराची खात्री करून नोंद करावी:
              </p>

              <div className="flex flex-col gap-2 mt-1">
                {checklist.map((item, idx) => (
                  <label
                    key={idx}
                    onClick={() => handleToggleChecklist(idx)}
                    className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-variant/30 cursor-pointer hover:bg-surface-container transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => {}}
                      className="w-4 h-4 mt-0.5 rounded accent-primary cursor-pointer"
                    />
                    <span
                      className={`font-body-sm text-body-sm ${
                        item.done ? "text-on-surface font-semibold" : "text-outline"
                      }`}
                    >
                      {item.task}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Export & Actions Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col gap-3">
              <span className="font-title-md text-title-md text-primary font-bold">
                समुपदेशन अहवाल निर्यात (Counselling Dossier)
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                जिल्हा समिती किंवा बँकेकडे सादर करण्यासाठी तांत्रिक प्रारूप प्रत तयार करा.
              </p>

              <button
                type="button"
                onClick={handleExportDraft}
                className="min-h-[46px] px-4 py-2.5 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-sm active:bg-primary-container transition-all"
              >
                <Download className="w-4 h-4" />
                <span>निर्णय-सहाय्य प्रारूप निर्यात करा (Export Draft)</span>
              </button>

              <span className="font-code-sm text-code-sm text-outline text-center">
                Draft Watermark: &quot;FOR REVIEW ONLY — NOT A FINANCIAL SANCTION&quot;
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
