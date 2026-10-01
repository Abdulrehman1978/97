"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Globe, ChevronDown, LogIn, LogOut, UserCircle, Loader2 } from "lucide-react";
import { TruthBadge } from "./TruthBadge";
import { useAuth } from "@/lib/api/auth-context";

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const ALL_PORTALS = [
  { label: "Beneficiary Flow",            path: "/interview",        role: "beneficiary",         desc: "Spoken intake, skills & pathways" },
  { label: "Field Worker / Counsellor",   path: "/field",            role: "field_worker",        desc: "Caseload, assisted intake & offline sync" },
  { label: "Financial Counsellor",        path: "/counsellor/finance", role: "financial_counsellor", desc: "Micro-enterprise, grants & credit linkage" },
  { label: "Training Provider Portal",    path: "/provider",         role: "provider",            desc: "Batch capacity, seats & center profile" },
  { label: "Employer Requisitions",       path: "/employer",         role: "employer",            desc: "Job requisitions & candidate matching" },
  { label: "District / State Admin",      path: "/admin",            role: "district_admin",      desc: "Demand-supply gap matrix & batch planning" },
  { label: "Inter-Agency Coordination",   path: "/coordination",     role: "counsellor",          desc: "SLA tracking, cross-agency handoffs" },
];

// Roles that can see the Judge Demo desk
const JUDGE_PORTAL = { label: "⚡ SIH Judge Demo Desk", path: "/demo", role: null, desc: "Live mic, constraint test & proof matrix" };

export function Navbar() {
  const router = useRouter();
  const { status, user, logout } = useAuth();
  const [lang, setLang] = useState("mr");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Show only portals accessible to this user's role, or all in demo mode
  const visiblePortals = IS_DEMO_MODE
    ? [...ALL_PORTALS, JUDGE_PORTAL]
    : ALL_PORTALS.filter((p) => {
        if (!user) return false;
        if (user.role === "ministry_admin" || user.role === "state_admin" || user.role === "district_admin") return true;
        return p.role === user.role;
      });

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

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
              {IS_DEMO_MODE && (
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  DEMO
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              MoSJE Grants-in-Aid (GIA) Operating System • SIH26097
            </p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Portal Switcher (only when authenticated or demo) */}
          {(status === "authenticated" || IS_DEMO_MODE) && (
            <div className="relative">
              <button
                id="portal-switcher-btn"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-[#0f4c81] border border-sky-200 text-xs font-bold hover:bg-sky-100 transition-colors touch-target"
              >
                <span>Switch Portal</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {user ? `Signed in as: ${user.role}` : "Select User Context"}
                  </div>
                  {visiblePortals.map((r) => (
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
          )}

          {/* Auth controls */}
          {status === "checking" && (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          )}

          {status === "authenticated" && user && (
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors touch-target"
              >
                <UserCircle className="w-4 h-4" />
                <span className="hidden sm:inline max-w-[80px] truncate">{user.full_name.split(" ")[0]}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{user.full_name}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{user.role.replace("_", " ")}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-700 transition-colors flex items-center gap-2 text-xs font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {status === "unauthenticated" && (
            <Link
              href="/login"
              id="nav-signin-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f4c81] text-white text-xs font-bold hover:bg-[#0c3c66] transition-colors shadow-sm touch-target"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
