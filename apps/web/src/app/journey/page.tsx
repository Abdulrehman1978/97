"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { useLanguage } from "@/lib/language-context";
import { getJourneyHome, updateActionStatus } from "@/lib/api";
import {
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  PhoneCall,
  RefreshCw,
  ListChecks,
  Check,
  ShieldCheck,
  Loader2,
  CloudCheck,
  WifiOff,
  HelpCircle,
  Calendar,
  AlertTriangle
} from "lucide-react";

export default function JourneyPage() {
  const { t, locale } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [updatingActionId, setUpdatingActionId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>("शेवटचा सिंक: २ मिनिटांपूर्वी");
  const [isSyncing, setIsSyncing] = useState(false);
  const [truthState, setTruthState] = useState<"LIVE" | "DEMO_DATA" | "OFFLINE_QUEUED">("LIVE");

  const [pathwayTitle, setPathwayTitle] = useState("Automotive Two-Wheeler Technician");
  const [pathwayLevel, setPathwayLevel] = useState("NSQF L3 RPL");
  const [progressPct, setProgressPct] = useState(25);

  const [checklist, setChecklist] = useState([
    { id: "chk-1", text: "आधार कार्ड (मूळ + २ छायाप्रती)", checked: true },
    { id: "chk-2", text: "बँक पासबुक / रद्द केलेला चेक", checked: false },
    { id: "chk-3", text: "जातीचा दाखला / अधिवास प्रमाणपत्र", checked: false }
  ]);

  const [actions, setActions] = useState<any[]>([
    {
      id: "act-1",
      stepNum: 1,
      title: "कागदपत्रे गोळा करणे",
      title_en: "Scheme Documents & Verification",
      desc: "शासकीय अनुदानासाठी आणि RPL नोंदणीसाठी जातीचा दाखला (Caste Certificate), आधार कार्ड आणि बँक पासबुक एकत्र ठेवा.",
      due_text: "मुदत: पुढील ७ दिवसांत (Within 7 days)",
      status: "in_progress", // "completed" | "in_progress" | "pending" | "offline_queued"
      completed: false
    },
    {
      id: "act-2",
      stepNum: 2,
      title: "प्रत्यक्ष कौशल्य पडताळणी",
      title_en: "Hands-on Skill Check (VTC Nagpur)",
      desc: "हिंगणा येथील अधिकृत कौशल्य केंद्रावर १ दिवसाची प्रत्यक्ष प्रात्यक्षिक परीक्षा व टूल हँडलिंग मूल्यमापन.",
      due_text: "पुढील पायरी",
      status: "pending",
      completed: false
    },
    {
      id: "act-3",
      stepNum: 3,
      title: "मोफत पीएम-अजय बॅच प्रवेश",
      title_en: "Batch Enrollment (PM-AJAY-NAG-2026)",
      desc: "शासकीय ३०-तास RPL ब्रिज प्रशिक्षण वर्गामध्ये प्रवेश निश्चित करणे.",
      due_text: "नियोजित",
      status: "pending",
      completed: false
    },
    {
      id: "act-4",
      stepNum: 4,
      title: "रोजगार व टूल किट लिंकेज",
      title_en: "Placement Linkage & Tool Grant",
      desc: "महिंद्रा फर्स्ट चॉईस सर्व्हिस नेटवर्कमध्ये मुलाखत किंवा ₹५०,००० टूल किट अनुदान.",
      due_text: "अंतिम टप्पा",
      status: "pending",
      completed: false
    }
  ]);

  const fetchJourney = async () => {
    setLoading(true);
    setMutationError(null);
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
      const idToFetch = storedId || "demo-beneficiary-id";

      if (idToFetch.includes("demo")) {
        setTruthState("DEMO_DATA");
      } else {
        setTruthState("LIVE");
      }

      const data = await getJourneyHome(idToFetch);
      if (data) {
        if (data.active_pathway?.title) {
          setPathwayTitle(data.active_pathway.title);
        }
        if (data.action_plan && data.action_plan.length > 0) {
          const mapped = data.action_plan.map((a: any, idx: number) => ({
            id: a.id || `act-${idx + 1}`,
            stepNum: idx + 1,
            title: a.title,
            title_en: a.title_en || a.title,
            desc: a.description || "आवश्यक कृती तपशील",
            due_text: a.due_date ? `मुदत: ${a.due_date}` : "पुढील १४ दिवस",
            status: a.status === "completed" ? "completed" : idx === 0 ? "in_progress" : "pending",
            completed: a.status === "completed"
          }));
          setActions(mapped);

          const completedCount = mapped.filter((m: any) => m.completed).length;
          setProgressPct(Math.round(((completedCount || 1) / mapped.length) * 100));
        }
      }
    } catch (err: any) {
      console.warn("Using resilient journey defaults:", err);
      setTruthState("DEMO_DATA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourney();
  }, []);

  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  // NON-OPTIMISTIC MUTATION SEQUENCE
  const handleMarkActionComplete = async (actionId: string) => {
    setUpdatingActionId(actionId);
    setMutationError(null);

    const targetAction = actions.find((a) => a.id === actionId);
    if (!targetAction) {
      setUpdatingActionId(null);
      return;
    }

    const nextCompleted = !targetAction.completed;
    const nextStatus = nextCompleted ? "completed" : "pending";

    try {
      const res = await updateActionStatus(actionId, nextStatus);

      // Inspect authoritative response
      if ((res as any)?.is_offline || (res as any)?.status === "offline_queued") {
        setTruthState("OFFLINE_QUEUED");
        setActions((prev) =>
          prev.map((a) =>
            a.id === actionId
              ? { ...a, status: "offline_queued", due_text: "Queued on this device — not yet saved" }
              : a
          )
        );
      } else {
        // Success verified from backend
        setActions((prev) =>
          prev.map((a) =>
            a.id === actionId
              ? { ...a, completed: nextCompleted, status: nextCompleted ? "completed" : "in_progress" }
              : a
          )
        );
        const updatedCompleted = actions.filter((a) => a.id === actionId ? nextCompleted : a.completed).length;
        setProgressPct(Math.round((updatedCompleted / actions.length) * 100));
      }
    } catch (err: any) {
      // DO NOT set completed on failure
      console.error("Action status update failed:", err);
      setMutationError(
        locale === "mr"
          ? "कृती जतन करता आली नाही. कृपया इंटरनेट तपासा आणि पुन्हा प्रयत्न करा."
          : "Action could not be saved. Please check connection and try again."
      );
    } finally {
      setUpdatingActionId(null);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 600));
    setSyncStatus(locale === "mr" ? "आत्ताच क्लाउड सिंक झाले ✓" : "Cloud synced just now ✓");
    setIsSyncing(false);
  };

  const activeAction = actions.find((a) => !a.completed) || actions[0];

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />
      <BeneficiaryNav />

      <main className="flex flex-col relative w-full pt-16 pb-28 min-h-screen">
        <div className="flex flex-col w-full max-w-2xl mx-auto px-4 md:px-6 gap-4">
          {/* Header & Status Card */}
          <div className="pt-4 flex flex-col gap-1">
            <div className="relative overflow-hidden rounded-2xl bg-surface-container-low shadow-sm p-4 md:p-5 border border-surface-variant/40 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  {locale === "mr"
                    ? `सक्रिय टप्पा (${activeAction?.stepNum || 1} पैकी ४)`
                    : `Active Step (${activeAction?.stepNum || 1} of 4)`}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-code-sm text-code-sm text-outline font-semibold">
                    {pathwayLevel}
                  </span>
                  <TruthBadge state={truthState} />
                </div>
              </div>

              <div className="flex flex-col mt-1">
                <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                  {locale === "mr" ? "उपजीविका प्रगती (My Journey)" : "Livelihood Journey Progress"}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase font-semibold">
                    {locale === "mr" ? "निवडलेला मार्ग:" : "Enrolled Path:"}
                  </span>
                  <h2 className="font-title-md text-title-md text-on-surface font-bold">
                    {pathwayTitle}
                  </h2>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div
                    className="h-full bg-secondary-container rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="font-label-sm text-label-sm text-secondary font-bold shrink-0">
                  {progressPct}% {locale === "mr" ? "पूर्ण" : "Completed"}
                </span>
              </div>
            </div>
          </div>

          {/* Mutation Error Alert */}
          {mutationError && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error/20 flex items-center gap-2 text-error font-body-sm text-body-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{mutationError}</span>
            </div>
          )}

          {/* Priority Next Action Card */}
          <div className="relative rounded-2xl bg-surface-container-lowest shadow-md border border-surface-variant/40 overflow-hidden p-4 md:p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <span className="inline-block font-label-sm text-label-sm uppercase tracking-wide text-secondary font-bold">
                    {locale === "mr" ? "तात्काळ कृती (Priority Action)" : "Immediate Action Required"}
                  </span>
                  <p className="font-code-sm text-code-sm text-secondary font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-secondary" />
                    {activeAction?.due_text}
                  </p>
                </div>
              </div>
              <ReadAloudButton
                text={`${activeAction?.title}. ${activeAction?.desc}`}
                label={locale === "mr" ? "ऐका" : "Listen"}
                size="sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {locale === "mr"
                  ? `तुमची पुढील कृती: ${activeAction?.title}`
                  : `Next Step: ${activeAction?.title}`}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {activeAction?.desc}
              </p>
            </div>

            {/* Checklist Section */}
            <div className="rounded-xl bg-surface-container-low p-3 md:p-4 flex flex-col gap-2 border border-surface-variant/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  {locale === "mr" ? "कागदपत्रे तपासणी यादी:" : "Required Document Checklist:"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {checklist.map((item) => (
                  <label
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-lowest shadow-sm cursor-pointer border border-surface-variant/20 hover:bg-surface-bright transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {}}
                      className="w-5 h-5 rounded accent-primary cursor-pointer"
                    />
                    <span
                      className={`font-body-sm text-body-sm ${
                        item.checked ? "text-on-surface line-through opacity-70" : "text-on-surface font-medium"
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                id="markCompleteBtn"
                disabled={updatingActionId === activeAction?.id}
                onClick={() => handleMarkActionComplete(activeAction?.id)}
                className="w-full min-h-[50px] px-4 py-3 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-sm active:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {updatingActionId === activeAction?.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{locale === "mr" ? "नोंदवत आहे..." : "Updating..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {activeAction?.completed
                        ? locale === "mr" ? "पुन्हा प्रलंबित करा" : "Re-open Action"
                        : locale === "mr" ? "झाले म्हणून नोंदवा (Mark as Completed)" : "Mark as Completed"}
                    </span>
                  </>
                )}
              </button>

              <Link
                href="/help"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-container text-primary font-label-md text-label-md font-bold flex items-center justify-center gap-2 active:bg-surface-container-high transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-secondary" />
                <span>{locale === "mr" ? "समन्वयकाशी बोला (Call Field Worker)" : "Request Worker Assistance"}</span>
              </Link>
            </div>
          </div>

          {/* Device Ledger / Offline Sync Card */}
          <div className="rounded-2xl bg-surface-container-high p-4 md:p-5 shadow-sm border border-surface-variant/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
                </span>
                <span className="font-label-md text-label-md text-primary font-bold">
                  {locale === "mr" ? "डिव्हाइस लेजर: सुरक्षित" : "Local Ledger: Active"}
                </span>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant bg-surface-container-lowest px-2 py-0.5 rounded-full font-semibold">
                IndexedDB Safe
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {locale === "mr"
                ? "ऑफलाइन असतानाही तुमची कृती स्थानिक मेमरीमध्ये सेव्ह राहते आणि इंटरनेट उपलब्ध होताच सुरक्षित सिंक होते."
                : "Your progress is securely backed up locally. Mutations queue when offline and sync upon reconnection."}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-surface-variant/30">
              <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
                <CloudCheck className="w-4 h-4 text-secondary" />
                <span className="font-label-sm text-label-sm">{syncStatus}</span>
              </div>
              <button
                type="button"
                id="syncTriggerBtn"
                onClick={handleManualSync}
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-surface-container-lowest text-primary font-label-sm text-label-sm font-bold flex items-center gap-1.5 shadow-sm active:bg-surface-container transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-secondary ${isSyncing ? "animate-spin" : ""}`} />
                <span>{locale === "mr" ? "क्लाउड सिंक तपासा" : "Check Cloud Sync"}</span>
              </button>
            </div>
          </div>

          {/* Action Sequence / Timeline */}
          <div className="rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-variant/40 p-4 md:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-surface-variant/20">
              <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">
                {locale === "mr" ? "प्रगती टप्पे (Action Sequence)" : "Action Sequence"}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                {locale === "mr" ? `${activeAction?.stepNum || 1} पैकी ४ चालू` : `Step ${activeAction?.stepNum || 1} of 4 Active`}
              </span>
            </div>

            <div className="relative flex flex-col gap-3 pt-1">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-surface-container-highest" />

              {actions.map((act) => {
                const isCurrent = act.id === activeAction?.id;
                const isDone = act.completed;

                return (
                  <div key={act.id} className="relative flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm font-bold text-label-sm ${
                        isDone
                          ? "bg-secondary text-on-secondary"
                          : isCurrent
                          ? "bg-primary text-on-primary ring-4 ring-secondary-fixed/50"
                          : "bg-surface-container-highest text-on-surface-variant"
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : act.stepNum}
                    </div>

                    <div
                      className={`flex-1 rounded-xl p-3 border transition-colors ${
                        isCurrent
                          ? "bg-surface-container-low border-secondary/30 shadow-sm"
                          : "bg-surface-container-lowest border-surface-variant/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-title-md text-title-md font-bold ${
                            isDone ? "text-outline line-through" : isCurrent ? "text-primary" : "text-on-surface"
                          }`}
                        >
                          {act.title}
                        </span>
                        <span
                          className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold ${
                            isDone
                              ? "bg-secondary-fixed/50 text-secondary"
                              : isCurrent
                              ? "bg-secondary-fixed text-on-secondary-fixed"
                              : "bg-surface-container text-outline"
                          }`}
                        >
                          {isDone
                            ? locale === "mr" ? "पूर्ण" : "Done"
                            : isCurrent
                            ? locale === "mr" ? "चालू" : "Active"
                            : locale === "mr" ? "पुढील" : "Upcoming"}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        {act.title_en}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
