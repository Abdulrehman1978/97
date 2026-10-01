"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Globe, ChevronDown, UserCheck, LayoutDashboard, Briefcase, Award } from "lucide-react";
import { TruthBadge } from "./TruthBadge";

export function Navbar() {
  const router = useRouter();
  const [lang, setLang] = useState("mr");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles = [
    { label: "Beneficiary Flow", path: "/interview", desc: "Spoken intake, skills & pathways" },
    { label: "Field Worker / Counsellor", path: "/field", desc: "Caseload, assisted intake & offline sync" },
    { label: "Financial Counsellor", path: "/counsellor/finance", desc: "Micro-enterprise, grants & credit linkage" },
    { label: "Training Provider Portal", path: "/provider", desc: "Batch capacity, seats & center profile" },
    { label: "Employer Requisitions", path: "/employer", desc: "Job requisitions & candidate matching" },
    { label: "District / State Admin", path: "/admin", desc: "Demand-supply gap matrix & batch planning" },
    { label: "Inter-Agency Coordination", path: "/coordination", desc: "SLA tracking, cross-agency handoffs" },
    { label: "⚡ SIH Judge Demo Desk", path: "/demo", desc: "Live mic, constraint test & proof matrix" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0f4c81] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            LIP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                PM-AJAY Livelihood Intelligence
              </span>
              <TruthBadge state="LIVE" className="hidden sm:inline-flex" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              MoSJE Grants-in-Aid (GIA) Operating System • SIH26097
            </p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="language-selector"
              aria-label="भाषा निवडा / Select Language"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer"
            >
              <option value="mr">मराठी (Marathi)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-[#0f4c81] border border-sky-200 text-xs font-bold hover:bg-sky-100 transition-colors touch-target"
            >
              <span>Switch Portal</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select User Context
                </div>
                {roles.map((r) => (
                  <button
                    key={r.path}
                    onClick={() => {
                      setRoleMenuOpen(false);
                      router.push(r.path);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-sky-50 transition-colors flex flex-col"
                  >
                    <span className="text-xs font-bold text-slate-800">{r.label}</span>
                    <span className="text-[11px] text-slate-500">{r.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
