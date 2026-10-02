"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { getJourneyHome, updateActionStatus } from "@/lib/api";
import { CheckCircle2, Clock, MapPin, Building2, AlertCircle, ArrowUpRight, PhoneCall, RefreshCw } from "lucide-react";

export default function JourneyPage() {
  const [loading, setLoading] = useState(true);
  const [pathwayTitle, setPathwayTitle] = useState("No pathway selected");
  const [truthState, setTruthState] = useState<"LIVE" | "DEMO_DATA">("LIVE");
  const [actions, setActions] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    const fetchJourney = async () => {
      setLoading(true);
      try {
        const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
        const idToFetch = storedId || "demo-beneficiary-id";
        const data = await getJourneyHome(idToFetch);

        if (data) {
          if (data.active_pathway?.title) {
            setPathwayTitle(data.active_pathway.title);
          }
          if (data.action_plan && data.action_plan.length > 0) {
            const mappedActions = data.action_plan.map((a: any) => ({
              id: a.id,
              title: a.title,
              desc: a.description || "",
              completed: a.status === "completed",
              due: a.due_date || "Not scheduled"
            }));
            setActions(mappedActions);
          }
          if (idToFetch.includes("demo")) {
            setTruthState("DEMO_DATA");
          } else {
            setTruthState("LIVE");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Journey could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    fetchJourney();
  }, []);

  const toggleAction = async (id: string) => {
    const target = actions.find(a => a.id === id);
    if (!target || pending) return;
    setPending(id); setError(""); setNotice("");
    const newCompleted = !target.completed;
    const newStatus = newCompleted ? "completed" : "pending";



    try {
      const result = await updateActionStatus(id, newStatus);
      if (result.is_offline || result.status === "offline_queued") {
        setNotice("Queued offline — not yet saved to the server. Reconnect and refresh after sync.");
      } else {
        setActions(items => items.map(a => a.id === id ? { ...a, completed: newCompleted } : a));
        setNotice("Progress saved.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Progress was not saved.");
    } finally {
      setPending(null);
    }
  };

  const nextStep = actions.find(a => !a.completed);

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-24 md:pb-12">
      <Navbar />
      <BeneficiaryNav />

      <main id="main-content" className="workspace-main max-w-4xl mx-auto px-4 py-6">
        {error && <p role="alert" className="p-4 bg-red-50 text-red-900 rounded-xl">{error} <a href="/login?next=/journey" className="underline">Sign in</a></p>}
        {notice && <p role="status" className="p-4 bg-sky-50 text-sky-900 rounded-xl">{notice}</p>}
        {!loading && !error && actions.length === 0 && <p>No saved action plan. <a href="/pathways" className="underline">Choose a pathway</a>.</p>}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 4 of 5 • My Journey (माझा प्रवास)
              </span>
              <TruthBadge state={truthState} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              उपजीविका प्रगती व पुढील पायरी
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              निवडलेला मार्ग: {pathwayTitle}
            </p>
          </div>

          <ReadAloudButton text={nextStep ? `${nextStep.title}. ${nextStep.desc}` : "No pending action is recorded."} />
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
                disabled={!!pending}
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
                role="button"
                tabIndex={0}
                aria-pressed={act.completed}
                onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); void toggleAction(act.id); } }}
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

      </main>
    </div>
  );
}
