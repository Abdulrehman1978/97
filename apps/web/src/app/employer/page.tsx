"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import { useAuth } from "@/lib/api/auth-context";
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
  CalendarCheck2,
  Lock,
  ArrowRight,
  Loader2
} from "lucide-react";
import {
  getEmployerJobs,
  createEmployerJob,
  getEmployerCandidates,
  getApplications,
  updateApplicationHiringStatus
} from "@/lib/api";

export default function EmployerPortalPage() {
  const { status, user } = useAuth();

  // If authenticated with non-employer / non-admin role, strictly enforce 403 Forbidden
  if (status === "authenticated" && user && !["employer", "district_admin", "state_admin", "ministry_admin"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="text-center max-w-sm bg-surface-container p-6 rounded-2xl border border-surface-variant/40 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">403</span>
          </div>
          <h1 className="text-lg font-bold text-on-surface mb-2">Access Forbidden</h1>
          <p className="text-sm text-on-surface-variant">
            Your role (<code className="bg-surface-container-high px-1 rounded">{user.role}</code>) is not authorized to access employer requisitions.
          </p>
        </div>
      </div>
    );
  }

  const isLiveEmployer = status === "authenticated" && !!user && ["employer", "district_admin", "state_admin", "ministry_admin"].includes(user.role);

  return <EmployerWorkspace isLive={isLiveEmployer} />;
}

function EmployerWorkspace({ isLive }: { isLive: boolean }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchSkill, setSearchSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddJob, setShowAddJob] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const [apiError, setApiError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [jList, cList, aList] = await Promise.all([
        getEmployerJobs("MH-NAG"),
        getEmployerCandidates(searchSkill, "MH-NAG"),
        getApplications()
      ]);

      const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
      if (jList && jList.length > 0) {
        setJobs(jList);
      } else if (isDemo) {
        setJobs([
          {
            id: "job-1",
            title: "Two-Wheeler Service & Maintenance Mechanic",
            vacancies: 3,
            monthly_wage_inr: 17500,
            worksite_address: "Mahindra First Choice Service Center, Hingna",
            status: "Active Hiring",
            truth_state: "DEMO_DATA"
          },
          {
            id: "job-2",
            title: "EV Scooter Battery Assembly Technician",
            vacancies: 5,
            monthly_wage_inr: 19500,
            worksite_address: "GreenWheels Assembly Plant, Butibori",
            status: "Interviewing",
            truth_state: "DEMO_DATA"
          }
        ]);
      } else {
        setJobs([]);
      }

      if (cList && cList.length > 0) {
        setCandidates(cList);
      } else if (isDemo) {
        setCandidates([
          {
            id: "cand-1",
            candidate_alias: "Candidate #MH-988",
            primary_trade: "Two-Wheeler Diagnostics & Overhaul",
            experience_months: 36,
            competencies: ["Engine Overhaul", "Brake Shoe Maintenance", "Pneumatic Tools"],
            skill_gap: "Needs 30h EV module",
            match_percentage: 94,
            distance_km: 11.2,
            is_accessible_match: true
          },
          {
            id: "cand-2",
            candidate_alias: "Candidate #MH-912",
            primary_trade: "Automotive Electrical Wiring",
            experience_months: 24,
            competencies: ["Wiring Harness", "Battery Health Diagnostic", "Multimeter"],
            skill_gap: "Mechanical engine overhaul novice",
            match_percentage: 88,
            distance_km: 8.5,
            is_accessible_match: true
          }
        ]);
      } else {
        setCandidates([]);
      }

      setApplications(aList || []);
    } catch (err: any) {
      console.warn("Failed to load employer data:", err);
      if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
        setJobs([
          {
            id: "job-1",
            title: "Two-Wheeler Service & Maintenance Mechanic",
            vacancies: 3,
            monthly_wage_inr: 17500,
            worksite_address: "Mahindra First Choice Service Center, Hingna",
            status: "Active Hiring",
            truth_state: "DEMO_DATA"
          }
        ]);
      } else {
        setApiError(err?.message || "Failed to load requisitions from server.");
        setJobs([]);
        setCandidates([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchSkill]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
        {/* Header Strip */}
        <div className="bg-surface-container rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                Industry Partner & Skill Matching Desk
              </span>
              <TruthBadge state={isLive ? "LIVE" : "DEMO_DATA"} />
            </div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold mt-1">
              नियोक्ता व उद्योग भागीदार पोर्टल (Employer Portal)
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              कौशल्य-आधारित थेट उमेदवार निवड • रिक्त जागा व्यवस्थापन व मुलाखत शेड्युलिंग
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddJob(!showAddJob)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center gap-2 shadow-sm active:bg-primary-container transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddJob ? "रद्द करा" : "नवीन नोकरी नोंदवा (Post Requisition)"}</span>
          </button>
        </div>

        {!isLive && (
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-primary font-bold">
                सार्वजनिक पूर्वावलोकन / डेमो मोड (Employer Preview Mode)
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                उमेदवार गोपनीयता व कौशल्य-आधारित जुळणीचे पूर्वपरीक्षण. थेट रिक्त पदे नोंदवण्यासाठी किंवा मुलाखत शेड्युलिंगसाठी अधिकृत नियोक्ता लॉगिन आवश्यक आहे.
              </span>
            </div>
          </div>
        )}

        {/* Mandatory Privacy Enclosure Banner */}
        <div className="p-3.5 rounded-xl bg-surface-container-high border border-outline-variant/60 flex items-center gap-3">
          <Lock className="w-5 h-5 text-secondary shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="font-label-md text-label-md text-primary font-bold">
              गोपनीयता व निष्पक्ष भरती नियम (DPDP & Fair Opportunity Shield)
            </span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">
              उमेदवारांची जात, धर्म किंवा संरक्षित सामाजिक प्रवर्ग नियोक्त्यांना प्रदर्शित केले जात नाहीत. निवड केवळ कौशल्ये, कामाचा प्रत्यक्ष अनुभव आणि प्रवासी अंतरावर आधारित आहे.
            </span>
          </div>
        </div>

        {actionNotice && (
          <div className="p-3 rounded-xl bg-tertiary-fixed/40 border border-secondary/30 flex items-center gap-2 text-on-tertiary-container font-body-md text-body-md">
            <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Create Requisition Modal / Form */}
        {showAddJob && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 border border-secondary/30 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
              <span className="font-title-md text-title-md text-primary font-bold">
                नवीन रिक्त पद नोंदणी (Post New Job Requisition)
              </span>
              <TruthBadge state="LIVE" />
            </div>

            <form onSubmit={handleCreateJob} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-primary font-semibold">
                  पदाचे नाव (Job Title)
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-primary font-semibold">
                  कामाचे ठिकाण (Worksite Address)
                </label>
                <input
                  type="text"
                  required
                  value={formData.worksite_address}
                  onChange={(e) => setFormData({ ...formData, worksite_address: e.target.value })}
                  className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-primary font-semibold">
                  मासिक वेतन (Monthly Guaranteed Wage INR)
                </label>
                <input
                  type="number"
                  min={10000}
                  value={formData.monthly_wage_inr}
                  onChange={(e) => setFormData({ ...formData, monthly_wage_inr: Number(e.target.value) })}
                  className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-primary font-semibold">
                  एकूण रिक्त जागा (Vacancies)
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.vacancies}
                  onChange={(e) => setFormData({ ...formData, vacancies: Number(e.target.value) })}
                  className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none"
                />
              </div>

              <div className="col-span-full flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddJob(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-primary font-label-md text-label-md font-semibold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>नोंदवत आहे...</span>
                    </>
                  ) : (
                    <span>पद प्रकाशित करा (Publish Requisition)</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2-Column Split: Active Jobs & Candidate Matching Pool */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Jobs Stream (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-5 border border-surface-variant/40 shadow-sm flex flex-col gap-3">
              <span className="font-title-md text-title-md text-primary font-bold">
                सध्याच्या रिक्त जागा (Active Requisitions)
              </span>

              <div className="flex flex-col gap-2.5">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-surface-variant/30 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-primary font-bold">
                        {job.title}
                      </span>
                      <span className="font-code-sm text-code-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
                        {job.vacancies} जागा
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                      <span>वेतन: ₹{job.monthly_wage_inr?.toLocaleString()}/महिना</span>
                      <span className="text-secondary font-semibold">{job.status}</span>
                    </div>
                    <p className="font-code-sm text-code-sm text-outline truncate">
                      {job.worksite_address}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Candidate Matching Stream (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-5 border border-surface-variant/40 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-title-md text-title-md text-primary font-bold">
                  कौशल्य जुळणी पूल (Competency Matched Candidates)
                </span>
                <span className="font-code-sm text-code-sm text-outline">
                  Redacted &amp; Objective Evaluation
                </span>
              </div>

              {/* Candidates Stream */}
              <div className="flex flex-col gap-3">
                {candidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-4 rounded-xl bg-surface-container-low border border-surface-variant/30 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-title-md text-title-md text-primary font-bold">
                          {cand.candidate_alias}
                        </span>
                        <p className="font-body-sm text-body-sm text-secondary font-semibold">
                          {cand.primary_trade} • {cand.experience_months} Months Hands-on
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-title-md text-title-md font-bold">
                        <span>{cand.match_percentage}% Match</span>
                      </div>
                    </div>

                    {/* Competency Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {cand.competencies?.map((c: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-surface-container text-primary font-code-sm text-code-sm font-semibold"
                        >
                          ✓ {c}
                        </span>
                      ))}
                    </div>

                    {/* Gap & Proximity */}
                    <div className="flex items-center justify-between pt-1 border-t border-surface-variant/20 font-code-sm text-code-sm text-on-surface-variant">
                      <span>अंतर: {cand.distance_km} किमी (Hingna Cluster)</span>
                      <span className="text-secondary font-medium">गॅप: {cand.skill_gap}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
