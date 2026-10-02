"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
import { RequireAuth } from "@/lib/api/auth-context";
import {
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  Clock,
  Award,
  FileCheck2,
  MapPin,
  Accessibility,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { getTrainingOptions, createTrainingBatch, getTrainingCenters } from "@/lib/api";

export default function ProviderPortalPage() {
  return (
    <RequireAuth roles={["provider", "district_admin", "state_admin", "ministry_admin"]}>
      <ProviderPortalWorkspace />
    </RequireAuth>
  );
}

function ProviderPortalWorkspace() {
  const [batches, setBatches] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    qualification_id: "qual-two-wheeler-1",
    qualification_title: "Automotive Two-Wheeler Service Technician (ASC/Q1411)",
    batch_code: "MH-NAG-EV-2026-B3",
    seat_capacity: 30,
    seats_available: 18,
    start_date: "2026-10-15",
    is_verified_live_batch: true,
    truth_state: "LIVE"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [bList, cList] = await Promise.all([
        getTrainingOptions("MH-NAG").catch(() => []),
        getTrainingCenters("MH-NAG").catch(() => [])
      ]);

      const seedBatches = [
        {
          id: "b-1",
          batch_code: "PM-AJAY-NAG-2026-B1",
          qualification_title: "Automotive Two-Wheeler Service Technician",
          qp_code: "ASC/Q1411",
          seat_capacity: 30,
          seats_available: 12,
          start_date: "2026-10-10",
          status: "Enrolling",
          is_verified: true,
          truth_state: "LIVE"
        },
        {
          id: "b-2",
          batch_code: "PM-AJAY-SOLAR-2026-B2",
          qualification_title: "Solar PV Rooftop Installer (Suryamitra)",
          qp_code: "SGJ/Q0101",
          seat_capacity: 25,
          seats_available: 4,
          start_date: "2026-10-20",
          status: "Near Full",
          is_verified: true,
          truth_state: "LIVE"
        }
      ];

      setBatches(bList && bList.length > 0 ? bList : seedBatches);
      setCenters(cList && cList.length > 0 ? cList : [
        {
          id: "tc-1",
          name: "Pradhan Mantri Kaushal Kendra (PMKK) — Hingna",
          code: "TC-MH-NAG-01",
          address: "Plot 42, Hingna MIDC, Nagpur, Maharashtra",
          has_ramp: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    const cap = Number(formData.seat_capacity);
    const avail = Number(formData.seats_available);

    if (!formData.batch_code.trim()) {
      setValidationError("कृपया बॅच कोड प्रविष्ट करा (Batch code required).");
      return;
    }
    if (cap <= 0 || cap > 200) {
      setValidationError("बॅच क्षमता १ ते २०० दरम्यान असावी (Capacity between 1 and 200).");
      return;
    }
    if (avail < 0 || avail > cap) {
      setValidationError("उपलब्ध जागा एकूण क्षमतेपेक्षा जास्त असू शकत नाहीत (Available seats cannot exceed capacity).");
      return;
    }
    if (!formData.start_date) {
      setValidationError("कृपया सुरुवातीची तारीख निवडा (Start date required).");
      return;
    }

    setIsSubmitting(true);
    try {
      const centerId = centers[0]?.id || "tc-1";
      await createTrainingBatch({
        center_id: centerId,
        qualification_id: formData.qualification_id,
        batch_code: formData.batch_code,
        seat_capacity: cap,
        seats_available: avail,
        start_date: formData.start_date,
        is_verified_live_batch: formData.is_verified_live_batch,
        truth_state: formData.truth_state
      });

      setSuccessMsg(`बॅच ${formData.batch_code} यशस्वीरित्या तयार झाली व नोंदवली गेली!`);
      setShowAddBatch(false);
      loadData();
    } catch (err: any) {
      setValidationError("Failed to create batch: " + err.message);
    } finally {
      setIsSubmitting(false);
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
                Empanelled Training Partner (PMKK) Workspace
              </span>
              <TruthBadge state="LIVE" />
            </div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold mt-1">
              प्रशिक्षण प्रदाता पोर्टल (Training Provider Desk)
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2 mt-0.5">
              <MapPin className="w-4 h-4 text-secondary" />
              Plot 42, Hingna MIDC, Nagpur • Center ID: TC-MH-NAG-01
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddBatch(!showAddBatch)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center gap-2 shadow-sm active:bg-primary-container transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddBatch ? "रद्द करा" : "नवीन बॅच जोडा (Schedule Batch)"}</span>
          </button>
        </div>

        {/* Success Message Banner */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-tertiary-fixed/40 border border-secondary/30 flex items-center gap-2 text-on-tertiary-container font-body-md text-body-md">
            <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Create Batch Modal / Inline Form */}
        {showAddBatch && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 border border-secondary/30 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
              <span className="font-title-md text-title-md text-primary font-bold">
                नवीन कौशल्य बॅच शेड्युल करा (Schedule Live Training Batch)
              </span>
              <TruthBadge state="LIVE" />
            </div>

            <form onSubmit={handleCreateBatch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-primary font-semibold">
                  अभ्यासक्रम / पात्रता (Qualification)
                </label>
                <select
                  value={formData.qualification_id}
                  onChange={(e) => setFormData({ ...formData, qualification_id: e.target.value })}
                  className="min-h-[44px] px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-sm text-body-sm text-on-surface focus:outline-none"
                >
                  <option value="qual-two-wheeler-1">
                    Automotive Two-Wheeler Service Technician (ASC/Q1411 - NSQF L4)
                  </option>
                  <option value="qual-solar-1">
                    Solar PV Rooftop Installer (SGJ/Q0101 - NSQF L4)
                  </option>
                  <option value="qual-tailor-1">
                    Self Employed Tailor & Garment Maker (AMH/Q1947 - NSQF L3)
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-primary font-semibold">
                  बॅच कोड (Unique Batch Code)
                </label>
                <input
                  type="text"
                  value={formData.batch_code}
                  onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
                  placeholder="उदा. MH-NAG-EV-2026-B3"
                  className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-code-sm text-code-sm text-on-surface focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-primary font-semibold">
                  एकूण आसन क्षमता (Total Seat Capacity)
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={formData.seat_capacity}
                  onChange={(e) => setFormData({ ...formData, seat_capacity: Number(e.target.value) })}
                  className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-primary font-semibold">
                  सध्या उपलब्ध जागा (Seats Available for Admissions)
                </label>
                <input
                  type="number"
                  min={0}
                  max={formData.seat_capacity}
                  value={formData.seats_available}
                  onChange={(e) => setFormData({ ...formData, seats_available: Number(e.target.value) })}
                  className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-primary font-semibold">
                  प्रशिक्षण सुरुवातीची तारीख (Batch Start Date)
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 justify-center">
                <label className="font-label-sm text-label-sm text-primary font-semibold">
                  NCVET / PM-AJAY पडताळणी स्थिती
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-surface-container-high text-primary font-code-sm text-code-sm font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                    Verified Partner Batch
                  </span>
                </div>
              </div>

              {validationError && (
                <div className="col-span-full p-2.5 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-error font-body-sm text-body-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="col-span-full flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBatch(false)}
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
                    <span>बॅच प्रकाशित करा (Publish Batch)</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Live Batches Table */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-variant/40 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-title-md text-title-md text-primary font-bold">
              सक्रिय प्रशिक्षण बॅचेस (Live Scheduled Batches)
            </span>
            <span className="font-code-sm text-code-sm px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-semibold">
              {batches.length} Registered Batches
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="bg-surface-container-low border-b border-surface-variant/30 text-outline font-label-sm text-label-sm uppercase tracking-wider">
                <tr>
                  <th className="p-3">Batch Code</th>
                  <th className="p-3">Qualification</th>
                  <th className="p-3">Total Capacity</th>
                  <th className="p-3">Seats Available</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant/20">
                {batches.map((b) => (
                  <tr key={b.id || b.batch_code} className="hover:bg-surface-bright transition-colors">
                    <td className="p-3 font-code-sm text-code-sm font-bold text-primary">
                      {b.batch_code}
                    </td>
                    <td className="p-3 font-medium text-on-surface">
                      {b.qualification_title}
                    </td>
                    <td className="p-3 text-on-surface">{b.seat_capacity} जागा</td>
                    <td className="p-3">
                      <span className="font-bold text-secondary">{b.seats_available} उपलब्ध</span>
                    </td>
                    <td className="p-3 text-outline">{b.start_date}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                        {b.status || "Live Verified"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
