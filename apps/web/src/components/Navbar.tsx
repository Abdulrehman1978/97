"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, ChevronDown, LogIn, LogOut, ShieldCheck, Compass, Sparkles } from "lucide-react";
import { TruthBadge } from "./TruthBadge";
import { useAuth } from "@/lib/api/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useRuntimeTruth } from "@/lib/runtime-truth-context";


const ALL_PORTALS = [
  { label: "Beneficiary Talk & Intake", path: "/interview", role: "beneficiary", desc: "Spoken trade intake & skills verification" },
  { label: "My Skills Passport", path: "/passport", role: "beneficiary", desc: "Verified skills, work history & RPL" },
  { label: "Livelihood Paths", path: "/pathways", role: "beneficiary", desc: "NSQF recommendations & counterfactuals" },
  { label: "My Journey", path: "/journey", role: "beneficiary", desc: "Action checklist & offline sync" },
  { label: "Field Worker Caseload", path: "/field", role: "field_worker", desc: "Triage & recommendation override" },
  { label: "Financial Counsellor", path: "/counsellor/finance", role: "financial_counsellor", desc: "Enterprise capital & PM-AJAY schemes" },
  { label: "Training Provider", path: "/provider", role: "provider", desc: "VTC batch capacity & seat availability" },
  { label: "Employer Requisitions", path: "/employer", role: "employer", desc: "Privacy-safe candidate matchmaking" },
  { label: "District / State Admin", path: "/admin", role: "district_admin", desc: "Occupation shortages & project builder" },
  { label: "Inter-Agency Coordination", path: "/coordination", role: "counsellor", desc: "Handoff timeline & SLA tracking" },
  { label: "Citizen Support & Help", path: "/help", role: null, desc: "Telephony callback & grievances" },
];

const JUDGE_PORTAL = {
  label: "⚡ SIH Judge Desk",
  path: "/demo",
  role: null,
  desc: "3-minute evaluator proof & IVR simulator",
};

export function Navbar() {
  const router = useRouter();
  const { status, user, logout } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const { truthState, isDemoMode } = useRuntimeTruth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);


  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  const visiblePortals = isDemoMode
    ? [...ALL_PORTALS, JUDGE_PORTAL]
    : ALL_PORTALS.filter((p) => {
        if (!user) return p.role === null || p.role === "beneficiary";
        if (["ministry_admin", "state_admin", "district_admin"].includes(user.role)) return true;
        return p.role === user.role || p.role === null;
      });

  return (
    <header onKeyDown={event => { if (event.key === "Escape") { setRoleMenuOpen(false); setUserMenuOpen(false); } }} className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,41,66,0.05)] border-b border-outline-variant/20 pt-safe">
      <div className="max-w-7xl mx-auto h-16 px-3 sm:px-gutter flex items-center justify-between gap-space-xs">
        {/* Brand identity: LUNA / LIP */}
        <div className="flex shrink-0 flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-space-xs">
          <Link href="/" className="flex items-center gap-1.5 focus:outline-none">
            <span className="hidden sm:inline font-headline-sm text-headline-sm text-primary font-bold tracking-tight">LUNA</span>
            <span className="hidden sm:inline text-outline text-label-md font-label-md">/</span>
            <span className="font-label-md text-label-md text-secondary font-bold tracking-wider">LIP</span>
          </Link>
          <TruthBadge state={truthState} compact />
        </div>

        {/* Center / Navigation Portal Switcher (Desktop & Field) */}
        <div className="hidden xl:flex items-center gap-2">
          <Link
            href="/interview"
            className="px-3 py-1.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            {t("nav.talk", "Talk")}
          </Link>
          <Link
            href="/passport"
            className="px-3 py-1.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            {t("nav.my_skills", "My Skills")}
          </Link>
          <Link
            href="/pathways"
            className="px-3 py-1.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            {t("nav.my_paths", "My Paths")}
          </Link>
          <Link
            href="/journey"
            className="px-3 py-1.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            {t("nav.my_journey", "My Journey")}
          </Link>
          {isDemoMode && (
            <Link
              href="/demo"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold shadow-xs hover:bg-secondary-fixed-dim transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>Judge Desk</span>
            </Link>
          )}
        </div>

        {/* Controls: Language Switcher, Portal Menu & Profile */}
        <div className="flex items-center gap-space-xs">
          {/* Portals Dropdown Button */}
          <div className="relative">
            <button
              id="portals-menu-btn"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              type="button"
              className="min-w-11 min-h-[44px] justify-center px-2 py-1.5 flex items-center gap-1 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors"
              aria-expanded={roleMenuOpen}
              aria-label="Toggle all modules"
            >
              <Compass className="w-4 h-4 text-secondary" />
              <span className="hidden sm:inline">Portals</span>
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-outline" />
            </button>

            {roleMenuOpen && (
              <div
                className="fixed left-3 right-3 top-16 mt-2 sm:absolute sm:left-auto sm:top-auto sm:right-0 sm:w-80 rounded-xl bg-surface-container-lowest shadow-xl border border-outline-variant/30 py-2 z-50 animate-in fade-in"
                aria-label="Workspace navigation"
              >
                <div className="px-3 py-1.5 border-b border-outline-variant/20 flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase font-bold text-outline">
                    Workspaces &amp; Roles
                  </span>
                  <TruthBadge state={truthState} compact />
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {visiblePortals.map((portal) => (
                    <Link
                      key={portal.path}
                      href={portal.path}
                      onClick={() => setRoleMenuOpen(false)}
                      className="flex flex-col px-3 py-2 hover:bg-surface-container-low transition-colors"
                      
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          {portal.label}
                        </span>
                        {portal.role && (
                          <span className="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                            {portal.role}
                          </span>
                        )}
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        {portal.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Direct 3-Choice Language Switcher */}
          <div
            role="group"
            aria-label="Interface language"
            className="flex items-center bg-surface-container rounded-xl p-0.5 border border-outline-variant/40"
          >
            <button
              type="button"
              onClick={() => setLocale("mr")}
              aria-pressed={locale === "mr"}
              className={`min-h-[36px] px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                locale === "mr"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => setLocale("hi")}
              aria-pressed={locale === "hi"}
              className={`min-h-[36px] px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                locale === "hi"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              className={`min-h-[36px] px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                locale === "en"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              EN
            </button>
          </div>

          {/* User Account / Sign In */}
          <div className="relative">
            {status === "authenticated" && user ? (
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                type="button"
                className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-transform"
                aria-label="User profile menu"
                aria-expanded={userMenuOpen}
              >
                <span className="text-on-primary font-bold text-xs">
                  {user.full_name?.slice(0, 2).toUpperCase() || "ME"}
                </span>
              </button>
            ) : (
              <Link
                href="/login"
                className="min-h-11 min-w-11 justify-center px-3 py-1.5 rounded-full bg-primary-container text-on-primary flex items-center gap-1.5 shrink-0 shadow-sm hover:bg-primary transition-colors font-label-sm text-label-sm font-bold"
                aria-label="Sign In"
                title="Sign In"
              >
                <User className="w-4 h-4 text-secondary-fixed" />
                <span className="hidden sm:inline">{t("header.login", "Sign In")}</span>
              </Link>
            )}

            {userMenuOpen && user && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-container-lowest shadow-xl border border-outline-variant/30 p-3 z-50 animate-in fade-in"
                role="menu"
              >
                <div className="flex flex-col pb-2 border-b border-outline-variant/20">
                  <span className="font-title-md text-title-md text-on-surface font-bold truncate">
                    {user.full_name || "Beneficiary"}
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold">
                    Role: {user.role}
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant truncate">
                    {user.email || user.phone || "Active Session"}
                  </span>
                </div>
                <div className="pt-2 flex flex-col gap-1">
                  <Link
                    href="/passport"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-on-surface hover:bg-surface-container font-label-md text-label-md"
                  >
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>My Skills Passport</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    type="button"
                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-error hover:bg-error-container/20 font-label-md text-label-md font-bold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("header.logout", "Sign Out")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
