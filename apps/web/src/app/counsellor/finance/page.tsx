"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import { RequireAuth } from "@/lib/api/auth-context";
import { getEnterprisePlan } from "@/lib/api";
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
  const [enterpriseCase, setEnterpriseCase] = useState<any>({
    beneficiary_name: "Ramesh Mesram (रमेश मेश्राम)",
    target_enterprise: "Two-Wheeler Service & Spare Parts Center",
    district: "Nagpur (MH)",
    assumed_capital_needs: {
      equipment_capex: 75000,
      working_capital_opex: 25000,
      total_estimated_inr: 100000,
      break_even_months: 6
    },
    scheme_prescreening: [
      {
        scheme_name: "PM-AJAY Grants-in-Aid (GIA) Asset Subsidy",
        indicative_amount: "Up to ₹50,000 (100% Grant)",
        status: "Potentially Relevant (Pre-screening)",
        condition: "SC candidate with income <= 2.5L and verified NSQF L4 certificate. Sanction subject to DSC approval."
      },
      {
        scheme_name: "NSFDC Micro-Credit Scheme",
        indicative_amount: "Up to ₹50,000 at 5% Concessional Interest",
        status: "Verification Required",
        condition: "Requires project feasibility endorsement by Financial Counsellor."
      },
      {
        scheme_name: "MUDRA Shishu Loan",
        indicative_amount: "Up to ₹50,000 collateral-free",
        status: "Alternative Bank Linkage",
        condition: "Commercial bank credit linkage with active Aadhaar DBT account."
      }
    ],
    literacy_checklist: [
      { id: "fc-1", task: "Understand difference between revenue and profit", done: true },
      { id: "fc-2", task: "Setup UPI Merchant QR code (PhonePe/GPay for shop)", done: true },
      { id: "fc-3", task: "Weekly physical cashbook logging", done: false },
      { id: "fc-4", task: "Separate personal household expenses from shop account", done: false }
    ],
    truth_state: "DEMO_DATA"
  });

  const [checklist, setChecklist] = useState<any[]>(enterpriseCase.literacy_checklist);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
        const idToFetch = storedId || "demo-beneficiary-id";
        const data = await getEnterprisePlan(idToFetch);
        if (data) {
          setEnterpriseCase(data);
          if (data.literacy_checklist) {
            setChecklist(data.literacy_checklist);
          }
        }
      } catch (err) {
        console.warn("Using default enterprise case:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const handleToggleChecklist = (idx: number) => {
    setChecklist((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, done: !c.done } : c))
    );
  };

  const handleExportDraft = () => {
    alert(
      "DECISION-SUPPORT DRAFT EXPORT:\n\n" +
      "This document is a technical decision-support draft for counselling review only.\n" +
      "It is NOT an approval, sanction letter, or official certificate.\n\n" +
      `Beneficiary: ${enterpriseCase.beneficiary_name}\n` +
      `Target Enterprise: ${enterpriseCase.target_enterprise}\n` +
      `Assumed Capital: ₹${enterpriseCase.assumed_capital_needs?.total_estimated_inr?.toLocaleString()}`
    );
  };

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
        {/* Header Strip */}
        <div className="bg-surface-container rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                GIA Mandate • Trained Financial Consultant Workspace
              </span>
              <TruthBadge state={enterpriseCase.truth_state || "DEMO_DATA"} />
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
