"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import { 
  Briefcase, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Search, 
  CheckCircle2, 
  MapPin, 
  DollarSign,
  UserCheck,
  CalendarCheck2
} from "lucide-react";
import { 
  getEmployerJobs, 
  createEmployerJob, 
  getEmployerCandidates,
  getApplications,
  updateApplicationHiringStatus 
} from "@/lib/api";

export default function EmployerPortalPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchSkill, setSearchSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddJob, setShowAddJob] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  const [formData, setFormData] = useState({
    title: "EV Fleet Diagnostic Specialist",
    opportunity_type: "job",
    district_code: "MH-NAG",
    worksite_address: "Plot 12, Hingna Industrial Area, Nagpur",
    monthly_wage_inr: 18000,
    is_wage_guaranteed: true,
    vacancies: 4,
    is_accessible_workplace: true,
    truth_state: "LIVE"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [jList, cList, aList] = await Promise.all([
        getEmployerJobs("MH-NAG").catch(() => []),
        getEmployerCandidates(searchSkill, "MH-NAG").catch(() => []),
        getApplications().catch(() => [])
      ]);
      setJobs(jList);
      setCandidates(cList);
      setApplications(aList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchSkill]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployerJob({
        organization_id: "org-employer-1",
        title: formData.title,
        opportunity_type: formData.opportunity_type,
        district_code: formData.district_code,
        worksite_address: formData.worksite_address,
        monthly_wage_inr: Number(formData.monthly_wage_inr),
        is_wage_guaranteed: formData.is_wage_guaranteed,
        vacancies: Number(formData.vacancies),
        is_accessible_workplace: formData.is_accessible_workplace,
        truth_state: formData.truth_state
      });
      setActionNotice(`Requisition "${formData.title}" published successfully.`);
      setShowAddJob(false);
      loadData();
    } catch (err: any) {
      alert("Failed to post requisition: " + err.message);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await updateApplicationHiringStatus(appId, newStatus);
      setActionNotice(`Application updated to status: ${newStatus.toUpperCase()}`);
      loadData();
    } catch (err: any) {
      alert("Status update failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Employer Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Industrial Partner
              </span>
              <TruthBadge state="LIVE" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Mahavitaran EV Mobility & Fleet Services
            </h1>
            <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              Nagpur Zone, Maharashtra • Corporate Requisition Desk
            </p>
          </div>

          <button
            onClick={() => setShowAddJob(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-sm shadow hover:bg-emerald-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Requisition</span>
          </button>
        </div>

        {/* Section 8.17 & 13.3 Strict Caste Privacy Safeguard Banner */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3 text-sky-950 text-xs sm:text-sm">
          <ShieldCheck className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">DPDP & Fair Opportunity Architecture (Section 8.17 & 13.3):</span> Candidate matching is performed strictly on verified trade skills, experience, and accessibility needs. Protected attributes such as caste, social category, and personal demographic identifiers are programmatically isolated and never displayed to employers.
          </div>
        </div>

        {/* Action feedback */}
        {actionNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Active Requisitions Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#0f4c81]" />
              <span>Active Job & Apprenticeship Requisitions</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md">
              {jobs.length} Active Positions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((j) => (
              <div key={j.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {j.opportunity_type}
                    </span>
                    <TruthBadge state={j.truth_state} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{j.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {j.worksite_address}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>₹{j.monthly_wage_inr.toLocaleString()}/mo</span>
                      {j.is_wage_guaranteed && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                          Guaranteed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Users className="w-3.5 h-3.5" />
                      <span>{j.vacancies} Vacancies</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Workplace: {j.is_accessible_workplace ? "Wheelchair Accessible" : "Standard"}</span>
                  <span className="text-emerald-700 font-bold">Accepting Candidates</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Matching Desk */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>Verified Candidate Matching Desk</span>
              </h2>
              <p className="text-xs text-slate-500">Candidates filtered by verified vocational skills and RPL certification.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by skill (e.g. Electrical, Brake)..."
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate ID</th>
                  <th className="py-3 px-4">Verified Trade Skills</th>
                  <th className="py-3 px-4">Education</th>
                  <th className="py-3 px-4">Preference</th>
                  <th className="py-3 px-4">RPL Readiness</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((c) => (
                  <tr key={c.candidate_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {c.candidate_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.verified_skills.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{c.education}</td>
                    <td className="py-3 px-4 capitalize text-slate-600">{c.employment_preference}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        c.rpl_certified 
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {c.rpl_certified ? "RPL Certified" : "Skilling Ready"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActionNotice(`Candidate ${c.candidate_id} shortlisted for technical interview.`)}
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        Shortlist
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Post Requisition */}
        {showAddJob && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Post Job / Apprenticeship Position</h3>
                <button
                  onClick={() => setShowAddJob(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Position Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Opportunity Type</label>
                    <select
                      value={formData.opportunity_type}
                      onChange={(e) => setFormData({ ...formData, opportunity_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                    >
                      <option value="job">Regular Wage Employment</option>
                      <option value="apprenticeship">NAPS Apprenticeship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Vacancies</label>
                    <input
                      type="number"
                      value={formData.vacancies}
                      onChange={(e) => setFormData({ ...formData, vacancies: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      min={1}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Worksite Address</label>
                  <input
                    type="text"
                    value={formData.worksite_address}
                    onChange={(e) => setFormData({ ...formData, worksite_address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Monthly Wage / Stipend (₹)</label>
                    <input
                      type="number"
                      value={formData.monthly_wage_inr}
                      onChange={(e) => setFormData({ ...formData, monthly_wage_inr: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      min={8000}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="wage_guar"
                      checked={formData.is_wage_guaranteed}
                      onChange={(e) => setFormData({ ...formData, is_wage_guaranteed: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="wage_guar" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Guaranteed Base Wage
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddJob(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                  >
                    Publish Requisition
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
