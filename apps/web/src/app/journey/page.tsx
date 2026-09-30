"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { CheckCircle2, Clock, MapPin, Building2, AlertCircle, ArrowUpRight, PhoneCall } from "lucide-react";

export default function JourneyPage() {
  const [actions, setActions] = useState([
    {
      id: "act-1",
      title: "आवश्यक कागदपत्रे गोळा करा (Prepare Documents)",
      desc: "जातीचा दाखला (SC Certificate), उत्पन्न दाखला आणि आधार लिंक बँक खाते.",
      completed: true,
      due: "2 Oct 2026"
    },
    {
      id: "act-2",
      title: "पूर्व कौशल्य पडताळणी व RPL चाचणी (RPL Assessment)",
      desc: "हिंगणा येथील अधिकृत केंद्रावर १ दिवसाची प्रत्यक्ष प्रात्यक्षिक परीक्षा.",
      completed: false,
      due: "8 Oct 2026"
    },
    {
      id: "act-3",
      title: "मोफत पीएम-अजय बॅच प्रवेश निश्चित करा (Batch Enrollment)",
      desc: "बॅच क्रमांक PM-AJAY-NAG-2026-B1 मध्ये जागा निश्चित करणे.",
      completed: false,
      due: "15 Oct 2026"
    },
    {
      id: "act-4",
      title: "रोजगार / व्यवसाय मदत (Placement Linkage)",
      desc: "महिंद्रा फर्स्ट चॉईस सर्व्हिस नेटवर्कमध्ये मुलाखत किंवा टूल किट अनुदान.",
      completed: false,
      due: "30 Nov 2026"
    }
  ]);

  const toggleAction = (id: string) => {
    setActions(actions.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const nextStep = actions.find(a => !a.completed);

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-24 md:pb-12">
      <Navbar />
      <BeneficiaryNav />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 4 of 5 • My Journey (माझा प्रवास)
              </span>
              <TruthBadge state="LIVE" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              उपजीविका प्रगती व पुढील पायरी
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              निवडलेला मार्ग: Automotive Two Wheeler Service Technician (NSQF L4)
            </p>
          </div>

          <ReadAloudButton text="तुमची पुढील पायरी म्हणजे पूर्व कौशल्य पडताळणी. हिंगणा केंद्रावर जाऊन प्रात्यक्षिक चाचणी द्या." />
        </div>

        {/* DOMINANT HERO: Single Next Action */}
        {nextStep && (
          <div className="bg-gradient-to-r from-[#0f4c81] to-[#0284c7] text-white p-6 rounded-3xl shadow-md mb-8">
            <div className="flex items-center justify-between">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white uppercase tracking-wider">
                तुमची पुढील मुख्य पायरी (Your Next Step)
              </span>
              <span className="text-xs font-medium text-white/80">मुदत: {nextStep.due}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-2">
              {nextStep.title}
            </h2>
            <p className="text-xs text-white/90 mt-1 max-w-xl">
              {nextStep.desc}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => toggleAction(nextStep.id)}
                className="px-5 py-2 bg-white text-[#0f4c81] text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors shadow touch-target"
              >
                पूर्ण झाले म्हणून नोंदवा (Mark Completed)
              </button>
              <a
                href="/help"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 touch-target"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>समुपदेशकाशी बोला (Call Counsellor)</span>
              </a>
            </div>
          </div>
        )}

        {/* Closed-Loop Action Checklist */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            कृती आराखडा (Closed-Loop Action Checklist)
          </h2>

          <div className="space-y-3">
            {actions.map((act) => (
              <div
                key={act.id}
                onClick={() => toggleAction(act.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 touch-target ${
                  act.completed
                    ? "bg-emerald-50/50 border-emerald-200 text-slate-700"
                    : "bg-slate-50 border-slate-200 hover:border-sky-300"
                }`}
              >
                <div className="mt-0.5">
                  {act.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${act.completed ? "line-through text-slate-500" : "text-slate-900"}`}>
                      {act.title}
                    </span>
                    <span className="text-[11px] text-slate-500">{act.due}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Linked Training Center & Verified Employer Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0f4c81] mb-2">
              <MapPin className="w-4 h-4" />
              <span>अधिकृत प्रशिक्षण केंद्र (Training Center)</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Nagpur Central Livelihood Center
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Plot 14, MIDC Industrial Area, Hingna Road, Nagpur • अंतर: 11.5 किमी
            </p>
            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
              <span className="font-semibold text-emerald-700">✓ 14 जागा शिल्लक (Seats Open)</span>
              <TruthBadge state="LIVE" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700 mb-2">
              <Building2 className="w-4 h-4" />
              <span>प्रमाणित रोजगार जोडणी (Verified Placement)</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Mahindra First Choice Service Network
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              अपेक्षित वेतन: Rs. 15,000 - 18,000 / महिना • हिंगणा वर्कशॉप
            </p>
            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
              <span className="text-slate-500">प्रमाणपत्रानंतर थेट मुलाखत</span>
              <TruthBadge state="DEMO_DATA" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
