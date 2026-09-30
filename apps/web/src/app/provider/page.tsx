"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";
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
  Accessibility
} from "lucide-react";
import { getTrainingOptions, createTrainingBatch, getTrainingCenters } from "@/lib/api";

export default function ProviderPortalPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [formData, setFormData] = useState({
    qualification_id: "qual-two-wheeler-1",
    batch_code: "MH-NAG-EV-2026-B3",
    seat_capacity: 30,
    seats_available: 18,
    start_date: "2026-10-15",
    is_verified_live_batch: true,
    truth_state: "LIVE"
  });
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [bList, cList] = await Promise.all([
        getTrainingOptions("MH-NAG").catch(() => []),
        getTrainingCenters("MH-NAG").catch(() => [])
      ]);
      setBatches(bList);
      setCenters(cList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centers[0]) return;
    try {
      await createTrainingBatch({
        center_id: centers[0].id,
        qualification_id: formData.qualification_id,
        batch_code: formData.batch_code,
        seat_capacity: Number(formData.seat_capacity),
        seats_available: Number(formData.seats_available),
        start_date: formData.start_date,
        is_verified_live_batch: formData.is_verified_live_batch,
        truth_state: formData.truth_state
      });
      setSuccessMsg(`Batch ${formData.batch_code} successfully scheduled and verified.`);
      setShowAddBatch(false);
      loadData();
    } catch (err: any) {
      alert("Failed to create batch: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header & Verification Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                Empanelled Training Partner
              </span>
              <TruthBadge state="LIVE" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Pradhan Mantri Kaushal Kendra (PMKK) — Hingna, Nagpur
            </h1>
            <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              Plot 42, Hingna MIDC, Nagpur, Maharashtra • Center ID: TC-MH-NAG-01
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddBatch(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f4c81] text-white font-bold text-sm shadow hover:bg-sky-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Batch</span>
            </button>
          </div>
        </div>

        {/* Section 10.7 Truth Architecture Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Section 10.7 Training Batch Truth Contract:</span> Central portal courses must never be misrepresented to beneficiaries as confirmed live batches without provider declaration. Verified live batches display live seat counts; unconfirmed courses are strictly labeled as catalogue discovery.
          </div>
        </div>

        {/* Facility Indicators */}
        {centers[0] && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Empanelment Status</div>
                <div className="text-sm font-bold text-slate-800">PM-AJAY Active</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Accessibility className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Wheelchair Access</div>
                <div className="text-sm font-bold text-slate-800">
                  {centers[0].has_wheelchair_access ? "Verified Level Ramps" : "Limited Access"}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Women Hostel</div>
                <div className="text-sm font-bold text-slate-800">
                  {centers[0].has_women_hostel ? "Available on-campus" : "Day-Scholar Only"}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">RPL Center Level</div>
                <div className="text-sm font-bold text-slate-800">NCVET Grade A</div>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Active Batches Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Training Batches & Live Seat Status</h2>
              <p className="text-xs text-slate-500">Live batches visible to beneficiaries within 15-25 km travel radius.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              Total Batches: {batches.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Batch Code</th>
                  <th className="py-3 px-4">Qualification / NSQF</th>
                  <th className="py-3 px-4">Seat Capacity</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Fee / GIA Norm</th>
                  <th className="py-3 px-4">Truth State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {b.batch_code || "CATALOGUE"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{b.qualification_title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {b.qp_code} • NSQF Level {b.nsqf_level}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{b.seat_capacity} seats</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        b.seats_available > 5 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {b.seats_available} seats remaining
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{b.start_date}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {b.fee_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <TruthBadge state={b.truth_state} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Schedule Batch */}
        {showAddBatch && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Schedule New Skilling Batch</h3>
                <button
                  onClick={() => setShowAddBatch(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateBatch} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Qualification</label>
                  <select
                    value={formData.qualification_id}
                    onChange={(e) => setFormData({ ...formData, qualification_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                  >
                    <option value="qual-two-wheeler-1">ASC/Q1411: Two-Wheeler Service Technician (NSQF 4)</option>
                    <option value="qual-ev-technician-2">ASC/Q1412: Electric Vehicle Service Lead (NSQF 5)</option>
                    <option value="qual-solar-1">SGJ/Q0101: Solar PV Installer - Suryamitra (NSQF 4)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Code</label>
                  <input
                    type="text"
                    value={formData.batch_code}
                    onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sanctioned Seats</label>
                    <input
                      type="number"
                      value={formData.seat_capacity}
                      onChange={(e) => setFormData({ ...formData, seat_capacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      min={10}
                      max={60}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Available Seats</label>
                    <input
                      type="number"
                      value={formData.seats_available}
                      onChange={(e) => setFormData({ ...formData, seats_available: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      min={0}
                      max={formData.seat_capacity}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commencement Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBatch(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#0f4c81] text-white font-bold hover:bg-sky-900"
                  >
                    Publish Verified Batch
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
