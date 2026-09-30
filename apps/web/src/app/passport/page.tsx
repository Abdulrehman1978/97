"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { Wrench, ShieldCheck, CheckCircle2, ArrowRight, Award, QrCode, FileText } from "lucide-react";

export default function PassportPage() {
  const [activeTab, setActiveTab] = useState<"skills" | "experience" | "rpl">("skills");

  const passportData = {
    beneficiary_name: "Ramesh Mesram",
    district: "Nagpur (MH)",
    primary_trade: "Two-Wheeler Maintenance & Service",
    skills: [
      { name: "Two-Wheeler Engine Overhaul", category: "Mechanical", level: "Competent", confidence: 92, status: "Verified" },
      { name: "Brake Shoe & Disc Maintenance", category: "Mechanical", level: "Competent", confidence: 95, status: "Verified" },
      { name: "Pneumatic & Hand Tool Handling", category: "Mechanical", level: "Competent", confidence: 90, status: "Verified" },
      { name: "Automotive Electrical Diagnostics", category: "Electrical", level: "Novice / Bridge Gap", confidence: 65, status: "Bridge Needed" }
    ],
    experience: {
      title: "Assistant at Roadside Garage (वडिलांचे गॅरेज)",
      duration: "36 Months (3 Years)",
      tasks: ["इंजिन उघडणे व ऑइल बदलणे", "ब्रेक शू फिटिंग", "कार्ब्युरेटर क्लिनिंग", "टायर पंक्चर व चेन टायटनिंग"],
      tools: ["Ring spanners", "T-handle wrench", "Compressor", "Pliers"]
    },
    rpl: {
      eligible: true,
      matched_qualification: "Automotive Two Wheeler Service Technician (ASC/Q1411)",
      nsqf_level: 4,
      experience_months: 36,
      match_pct: 75,
      bridge_hours: 30,
      benefit: "४५० तासांचा पूर्ण वर्ग न करता थेट शासकीय NSQF प्रमाणपत्र मिळवण्यास पात्र."
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-24 md:pb-12">
      <Navbar />
      <BeneficiaryNav />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Header with Title and QR Reference */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 2 of 5 • My Skills (माझे कौशल्य)
              </span>
              <TruthBadge state="LIVE" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              उपजीविका पासपोर्ट (Livelihood Passport)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              नाव: {passportData.beneficiary_name} • जिल्हा: {passportData.district} • टोकन: LIP-MH-NAG-2026
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ReadAloudButton text="हा तुमचा उपजीविका पासपोर्ट आहे. तुम्ही सांगितलेले काम आणि कौशल्य येथे प्रमाणित केले आहे." />
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-mono font-bold text-slate-700">
              <QrCode className="w-4 h-4 text-slate-600" />
              <span>QR Verified</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab("skills")}
            className={`pb-3 px-4 text-xs font-bold transition-colors touch-target ${
              activeTab === "skills"
                ? "border-b-2 border-[#0f4c81] text-[#0f4c81]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            प्रमाणित कौशल्ये (Verified Skills)
          </button>
          <button
            onClick={() => setActiveTab("rpl")}
            className={`pb-3 px-4 text-xs font-bold transition-colors touch-target flex items-center gap-1.5 ${
              activeTab === "rpl"
                ? "border-b-2 border-[#0f4c81] text-[#0f4c81]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>RPL पूर्व अनुभव पात्रता (RPL Readiness)</span>
          </button>
          <button
            onClick={() => setActiveTab("experience")}
            className={`pb-3 px-4 text-xs font-bold transition-colors touch-target ${
              activeTab === "experience"
                ? "border-b-2 border-[#0f4c81] text-[#0f4c81]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            कामाचा इतिहास (Work History)
          </button>
        </div>

        {/* Skills Tab Content */}
        {activeTab === "skills" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passportData.skills.map((s, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0f4c81] bg-sky-50 px-2.5 py-0.5 rounded-full">
                      {s.category}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      s.status === "Verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{s.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">पातळी: {s.level}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>आत्मविश्वास गुण (Confidence):</span>
                  <span className="font-bold text-slate-800">{s.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RPL Tab Content */}
        {activeTab === "rpl" && (
          <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Recognition of Prior Learning (RPL)
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  तुम्ही थेट RPL प्रमाणपत्रासाठी पात्र आहात!
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              तुमच्याकडे <strong>{passportData.rpl.experience_months} महिन्यांचा</strong> प्रत्यक्ष गॅरेज अनुभव असल्याने, 
              तुम्हाला ४५० तासांचा नवशिका वर्ग करण्याची आवश्यकता नाही. फक्त ३० तासांचे तांत्रिक ब्रीज प्रशिक्षण पूर्ण करून 
              तुम्ही अधिकृत NSQF Level 4 प्रमाणपत्र मिळवू शकता.
            </p>

            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2 text-xs">
              <div className="flex justify-between font-medium text-slate-700">
                <span>संबंधित पद:</span>
                <span className="font-bold text-slate-900">{passportData.rpl.matched_qualification}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-700">
                <span>कौशल्य जुळणी (Competency Match):</span>
                <span className="font-bold text-emerald-700">{passportData.rpl.match_pct}%</span>
              </div>
              <div className="flex justify-between font-medium text-slate-700">
                <span>आवश्यक ब्रीज मॉड्युल:</span>
                <span className="font-bold text-slate-900">इलेक्ट्रिकल वायरिंग व डायग्नोस्टिक्स ({passportData.rpl.bridge_hours} तास)</span>
              </div>
            </div>
          </div>
        )}

        {/* Experience Tab Content */}
        {activeTab === "experience" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{passportData.experience.title}</h2>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                {passportData.experience.duration}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                दररोज हाताळलेली कामे (Tasks Performed):
              </h3>
              <div className="flex flex-wrap gap-2">
                {passportData.experience.tasks.map((t, i) => (
                  <span key={i} className="text-xs font-medium bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-slate-700">
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                वापरलेली अवजारे (Tools Used):
              </h3>
              <div className="flex flex-wrap gap-2">
                {passportData.experience.tools.map((tl, i) => (
                  <span key={i} className="text-xs font-medium bg-sky-50 border border-sky-200 px-3 py-1 rounded-lg text-sky-800">
                    🔧 {tl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Forward Action to Pathways */}
        <div className="mt-8 flex justify-end">
          <Link
            href="/pathways"
            className="w-full sm:w-auto px-7 py-3 bg-[#0f4c81] text-white text-xs font-bold rounded-xl hover:bg-[#0c3c66] transition-colors shadow-sm flex items-center justify-center gap-2 touch-target"
          >
            <span>पुढील पायरी: माझे मार्ग पहा (Explore My Paths)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
