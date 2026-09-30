"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import { 
  Mic, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Layers, 
  Compass, 
  CheckCircle2, 
  FileText, 
  Users, 
  Building2, 
  Briefcase, 
  Coins, 
  BarChart3, 
  PhoneCall, 
  Lock, 
  Award,
  Globe2,
  Workflow
} from "lucide-react";

export default function PublicTransparencyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-sky-50/70 via-white to-slate-50 border-b border-slate-200/80 pt-12 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>SIH26097 • PM-AJAY GIA Livelihood Operating System</span>
            <TruthBadge state="LIVE" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Turn Spoken Informal Experience Into a <br className="hidden sm:inline" />
            <span className="text-[#0f4c81]">Verified Livelihood Pathway</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            A voice-first, multilingual platform for Scheduled Caste beneficiaries under the Grants-in-Aid component of PM-AJAY. We extract practical skills from ordinary trade stories, match valid NSQF qualifications, trigger RPL certification, and turn individual demand into district skilling intelligence.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/interview"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0f4c81] text-white font-bold text-sm shadow-md hover:bg-sky-900 transition-all hover:scale-105 touch-target"
            >
              <Mic className="w-4 h-4" />
              <span>Launch Voice Assistant (बोलून सांगा)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/demo"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-white font-bold text-sm shadow-md hover:bg-amber-600 transition-all hover:scale-105 touch-target"
            >
              <Sparkles className="w-4 h-4" />
              <span>⚡ SIH Judge Live Demo Desk</span>
            </Link>

            <Link
              href="/admin"
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span>District Planning Portal</span>
            </Link>
          </div>

          {/* Low-Tech Channels Banner */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>Toll-Free IVR: 1800-LIP-AJAY (DTMF & Spoken)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Missed-Call Callback Supported</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-indigo-600" />
              <span>100% PWA Offline Mode</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Product USPs */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Core Value Proposition</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Three Memorable USPs That Power the Operating System
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Unlike superficial conversational chatbots, our hybrid intelligence architecture bridges informal village work directly to accredited skilling and government execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* USP 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-sky-300 transition-colors">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0f4c81] flex items-center justify-center font-black text-xl">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Spoken Experience → Verified Skill Graph
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Beneficiaries describe real work in natural Hindi or Marathi. The system extracts tools, tasks, and competencies with evidence spans, mapping them to official NCO-2015 occupations without requiring technical jargon.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-sky-700">
              <span>Inspectable Evidence Spans</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* USP 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xl">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Recommendation → Real Action Loop
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Does not end at generic course links. Computes exact NOS-level RPL skill gaps, filters expired qualifications, connects to live training batches, and assigns Financial Counsellors for enterprise roadmaps.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
              <span>Closed-Loop Milestones & RPL</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* USP 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-purple-300 transition-colors">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black text-xl">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Individual Journeys → District Planning
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Aggregates anonymous beneficiary demand into district supply-demand gap matrices, ODOP cluster signals, proposed batch simulators, and GIA livelihood project proposals for district administrators.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-purple-700">
              <span>Evidence-Backed Project Builder</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Full Platform Ecosystem Grid */}
      <section className="bg-white border-y border-slate-200 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Service Ecosystem</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              A Complete Operating System for Every Stakeholder
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              From the rural feature-phone caller to the District Collector and industrial employer, every actor operates in a synchronized workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Beneficiary */}
            <Link 
              href="/interview"
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-sky-50/50 hover:border-sky-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0f4c81] flex items-center justify-center mb-3">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-800">
                  Beneficiary PWA
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Spoken intake, Livelihood Passport, Living Pathway, and 5-concept navigation.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-sky-700">
                <span>Open Intake</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* Field Worker */}
            <Link 
              href="/field"
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800">
                  Field Worker / Counsellor
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Offline caseload, assisted village interviews, and audited recommendation overrides.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-emerald-700">
                <span>View Caseload</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* Financial Counsellor */}
            <Link 
              href="/counsellor/finance"
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-amber-50/50 hover:border-amber-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-800">
                  Financial Counsellor
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Self-employment capital bands, scheme pre-screening (NSFDC/MUDRA), literacy checklists.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-amber-700">
                <span>Counselling Desk</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* District Admin */}
            <Link 
              href="/admin"
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-purple-50/50 hover:border-purple-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-800">
                  District Admin & Planner
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Supply-demand gap matrix, proposed batch simulator, and PM-AJAY GIA project builder.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-purple-700">
                <span>District Insights</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* Training Provider */}
            <Link 
              href="/provider"
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-800">
                  Training Provider Portal
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Center accessibility verification, live seat capacity, and referral admissions.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-blue-700">
                <span>Manage Batches</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* Employer */}
            <Link 
              href="/employer"
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-800">
                  Employer Requisitions
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Job/apprenticeship postings with candidate matching (caste strictly protected).
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-teal-700">
                <span>Post Jobs</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* Inter-Agency Coordination */}
            <Link 
              href="/coordination"
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                  <Workflow className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-800">
                  Inter-Agency Coordination
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Cross-department referral tickets, SLA tracking, and blocker escalation workflows.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-700">
                <span>Track Referrals</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* SIH Judge Demo */}
            <Link 
              href="/demo"
              className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/50 hover:bg-amber-100/50 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3 font-bold">
                  ⚡
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-900">
                  Judge Demo Desk
                </h3>
                <p className="text-xs text-slate-700 mt-1">
                  Live microphone, real-time radius variation test, IVR keypad, and full proof matrix.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-amber-800">
                <span>Open Judge Console</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust, Governance & Privacy Commitments */}
      <section className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Constitutional Governance & DPDP-2023 Readiness
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-300">
            <div className="space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Zero Caste Exposure</span>
              </div>
              <p>
                In strict accordance with Section 8.17 & 13.3, caste and social category attributes are strictly isolated in server-side authorization policies and are never exposed to employers or hiring algorithms.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-sky-400" />
                <span>Ephemeral Raw Audio</span>
              </div>
              <p>
                Beneficiary audio recordings are ephemeral by default and securely deleted immediately following transcription verification. Voice is never warehoused for external commercial AI training.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>No Hallucinated Approvals</span>
              </div>
              <p>
                Scheme matches are clearly labeled as explainable pre-screenings. The platform never manufactures loans or certificates; statutory sanction decisions remain with authorized officials.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              <span>Authoritative Grounding: </span>
              <span className="text-slate-200">NCVET NQR • NCO-2015 • PM-AJAY GIA Norms • SIDH • NCS</span>
            </div>
            <div>
              <span>Platform Version: </span>
              <span className="font-mono text-sky-400">3.8.0-prod (V3 Lean Core)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 PM-AJAY Livelihood Intelligence Platform • Developed for SIH26097
          </div>
          <div className="flex items-center gap-4">
            <Link href="/help" className="hover:text-slate-800">Assistance & Grievances</Link>
            <Link href="/admin" className="hover:text-slate-800">Source Health</Link>
            <Link href="/demo" className="hover:text-slate-800">Verification Evidence</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
