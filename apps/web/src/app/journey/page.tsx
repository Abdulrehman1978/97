"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, RefreshCw, ArrowRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { useLanguage } from "@/lib/language-context";
import { useRuntimeTruth } from "@/lib/runtime-truth-context";
import { useAuth } from "@/lib/api/auth-context";
import { getMyJourney, updateActionStatus } from "@/lib/api";
import type { JourneyAction, JourneyHome } from "@/lib/api/contracts";

const COPY = {
  en: {
    title: "Your next step", journey: "My journey", loading: "Loading your saved progress…",
    signIn: "Sign in to see your saved journey.", login: "Sign in",
    empty: "Choose a pathway to begin your action plan.", choose: "See my options",
    noActions: "No actions have been recorded for this pathway yet.", help: "Ask for help",
    complete: "Mark as complete", reopen: "Reopen", done: "Complete", upcoming: "To do",
    allDone: "All recorded actions are complete.", next: "Discuss your next milestone with your counsellor.",
    progress: "completed", refresh: "Refresh saved progress", saved: "Loaded from the server",
    offline: "An internet connection is required to save. Unsaved actions are not queued.",
    error: "We could not load your journey. Reconnect or sign in again, then retry.",
    saveError: "This change could not be confirmed. Your previous status is unchanged; refresh before retrying.",
    retry: "Retry", detail: "Details", notApproval: "Progress tracking is not proof of certification, placement or funding.",
  },
  mr: {
    title: "तुमची पुढील कृती", journey: "माझा प्रवास", loading: "जतन केलेली प्रगती आणत आहोत…",
    signIn: "तुमची जतन केलेली प्रगती पाहण्यासाठी प्रवेश करा.", login: "प्रवेश करा",
    empty: "कृती आराखडा सुरू करण्यासाठी मार्ग निवडा.", choose: "माझे पर्याय पाहा",
    noActions: "या मार्गासाठी अद्याप कोणतीही कृती नोंदवलेली नाही.", help: "मदत घ्या",
    complete: "पूर्ण झाल्याची नोंद करा", reopen: "पुन्हा उघडा", done: "पूर्ण", upcoming: "करायचे आहे",
    allDone: "नोंदवलेल्या सर्व कृती पूर्ण झाल्या.", next: "पुढील टप्प्याबद्दल समुपदेशकाशी बोला.",
    progress: "पूर्ण", refresh: "जतन केलेली प्रगती पुन्हा पाहा", saved: "सर्व्हरवरील नोंद पाहत आहात",
    offline: "जतन करण्यासाठी इंटरनेट आवश्यक आहे. न जतन केलेल्या कृती नंतर आपोआप पाठवल्या जात नाहीत.",
    error: "तुमची प्रगती आणता आली नाही. इंटरनेट तपासा किंवा पुन्हा प्रवेश करून प्रयत्न करा.",
    saveError: "बदल जतन झाल्याची खात्री करता आली नाही. आधीची स्थिती कायम आहे; पुन्हा प्रयत्न करण्यापूर्वी प्रगती तपासा.",
    retry: "पुन्हा प्रयत्न करा", detail: "तपशील", notApproval: "प्रगतीची नोंद म्हणजे प्रमाणपत्र, रोजगार किंवा निधी मंजुरी नाही.",
  },
  hi: {
    title: "आपका अगला कदम", journey: "मेरी यात्रा", loading: "सहेजी गई प्रगति ला रहे हैं…",
    signIn: "अपनी सहेजी गई यात्रा देखने के लिए प्रवेश करें.", login: "प्रवेश करें",
    empty: "कार्य योजना शुरू करने के लिए रास्ता चुनें.", choose: "मेरे विकल्प देखें",
    noActions: "इस रास्ते के लिए अभी कोई कार्य दर्ज नहीं है.", help: "मदद लें",
    complete: "पूरा होने की पुष्टि करें", reopen: "फिर खोलें", done: "पूरा", upcoming: "करना बाकी",
    allDone: "सभी दर्ज कार्य पूरे हो गए हैं.", next: "अगले चरण के बारे में परामर्शदाता से बात करें.",
    progress: "पूरा", refresh: "सहेजी गई प्रगति फिर देखें", saved: "सर्वर से प्राप्त रिकॉर्ड",
    offline: "सहेजने के लिए इंटरनेट ज़रूरी है। बिना सहेजे कार्य बाद में अपने आप नहीं भेजे जाते.",
    error: "आपकी यात्रा लोड नहीं हुई। इंटरनेट जाँचें या फिर प्रवेश करके दोबारा प्रयास करें.",
    saveError: "बदलाव की पुष्टि नहीं हुई। पिछली स्थिति बनी हुई है; दोबारा प्रयास से पहले प्रगति फिर देखें.",
    retry: "दोबारा प्रयास करें", detail: "विवरण", notApproval: "प्रगति का रिकॉर्ड प्रमाणपत्र, नौकरी या वित्तीय मंज़ूरी नहीं है.",
  },
};

const ACTION_TITLES: Record<string, { en: string; mr: string; hi: string }> = {
  document_collection: { en: "Check which documents you need", mr: "आवश्यक कागदपत्रे तपासा", hi: "ज़रूरी दस्तावेज़ जाँचें" },
  rpl_precheck: { en: "Arrange a practical skill assessment", mr: "प्रत्यक्ष कौशल्य तपासणी ठरवा", hi: "व्यावहारिक कौशल जाँच तय करें" },
  enrollment_or_enterprise: { en: "Review training or enterprise support", mr: "प्रशिक्षण किंवा व्यवसाय मदत तपासा", hi: "प्रशिक्षण या व्यवसाय सहायता जाँचें" },
  placement_linkage: { en: "Discuss work or enterprise opportunities", mr: "रोजगार किंवा व्यवसाय पर्यायांबद्दल बोला", hi: "रोजगार या व्यवसाय विकल्पों पर चर्चा करें" },
};

export default function JourneyPage() {
  const { locale } = useLanguage();
  const { status } = useAuth();
  const { truthState } = useRuntimeTruth();
  const copy = COPY[locale];
  const [journey, setJourney] = useState<JourneyHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setJourney(await getMyJourney());
      setLoadedAt(new Date());
    } catch {
      setJourney(null);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "checking") return;
    if (status === "authenticated") void load();
    else { setJourney(null); setLoading(false); }
  }, [status, load]);

  const mark = async (action: JourneyAction) => {
    if (updatingId) return;
    setUpdatingId(action.id);
    setSaveError(false);
    const nextStatus = action.status === "completed" ? "pending" : "completed";
    try {
      const response = await updateActionStatus(action.id, nextStatus);
      if (response.action_id !== action.id || response.new_status !== nextStatus) throw new Error("Unconfirmed mutation");
      setJourney(current => current ? {
        ...current,
        action_plan: current.action_plan.map(item => item.id === action.id ? { ...item, status: nextStatus } : item)
      } : null);
      setLoadedAt(new Date());
    } catch {
      setSaveError(true);
    } finally {
      setUpdatingId(null);
    }
  };

  const actions = journey?.action_plan ?? [];
  const done = actions.filter(action => action.status === "completed").length;
  const nextAction = actions.find(action => action.status !== "completed" && action.status !== "skipped");
  const actionTitle = (action: JourneyAction) => ACTION_TITLES[action.action_type]?.[locale] ?? action.title;
  const buttonStyle = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary disabled:opacity-50";
  return <div className="min-h-screen bg-surface text-on-surface">
    <Navbar /><BeneficiaryNav />
    <main className="mx-auto max-w-6xl px-4 pt-24 pb-[calc(7rem+env(safe-area-inset-bottom))] md:px-6">
      <div className="mb-7 flex items-center justify-between gap-4"><p className="font-semibold text-secondary">{copy.journey}</p><TruthBadge state={truthState} /></div>
      <h1 className="mb-6 text-3xl md:text-5xl font-bold text-primary">{copy.title}</h1>
      {loading ? <p role="status" className="flex gap-3"><Loader2 className="animate-spin" />{copy.loading}</p>
        : status !== "authenticated" ? <section className="rounded-2xl bg-surface-container p-6"><p className="mb-4">{copy.signIn}</p><Link className={buttonStyle} href="/login?next=/journey">{copy.login}</Link></section>
        : loadError ? <section role="alert" className="rounded-2xl bg-error-container p-6"><p className="mb-4">{copy.error}</p><button className={buttonStyle} onClick={load}>{copy.retry}</button></section>
        : !journey?.active_pathway ? <section className="rounded-2xl bg-surface-container p-6"><p className="mb-4">{copy.empty}</p><Link className={buttonStyle} href="/pathways">{copy.choose}<ArrowRight size={18} /></Link></section>
        : <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm md:p-8">
            <p className="text-sm text-on-surface-variant">{journey.active_pathway.title}</p>
            <h2 className="my-5 text-2xl font-bold text-primary">{nextAction ? actionTitle(nextAction) : actions.length ? copy.allDone : copy.noActions}</h2>
            {nextAction && <ReadAloudButton text={actionTitle(nextAction)} label={locale === "mr" ? "ऐका" : locale === "hi" ? "सुनें" : "Listen"} />}
            {saveError && <p role="alert" className="my-4 rounded-xl bg-error-container p-4 text-on-error-container">{copy.saveError}</p>}
            <div className="my-6 flex flex-col gap-3">
              {nextAction ? <button id="markCompleteBtn" className={buttonStyle} disabled={!!updatingId} onClick={() => mark(nextAction)}>
                {updatingId ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}{copy.complete}
              </button> : <p>{copy.next}</p>}
              <Link href="/help" className="min-h-11 rounded-xl border border-outline-variant px-5 py-3 text-center font-semibold">{copy.help}</Link>
            </div>
            <p className="text-sm leading-relaxed text-on-surface-variant">{copy.notApproval}</p>
          </section>
          <section className="rounded-3xl border border-outline-variant/40 p-6">
            <h2 className="font-semibold">{done} / {actions.length} {copy.progress}</h2>
            <progress aria-label={copy.progress} value={done} max={Math.max(1, actions.length)} className="my-4 h-3 w-full accent-primary" />
            <ol className="space-y-4">{actions.map((action, index) => <li key={action.id} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">{action.status === "completed" ? <Check size={18} /> : index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{actionTitle(action)}</p>
                <p className="text-sm text-on-surface-variant">{action.status === "completed" ? copy.done : copy.upcoming}</p>
                {action.status === "completed" && <button disabled={!!updatingId} onClick={() => mark(action)} className="min-h-11 text-sm underline">{copy.reopen}</button>}
              </div>
            </li>)}</ol>
          </section>
        </div>}
      {status === "authenticated" && <section className="mt-6 flex flex-col gap-3 rounded-2xl bg-surface-container p-5 md:flex-row md:items-center md:justify-between">
        <div><p className="text-sm">{copy.offline}</p>{loadedAt && <p className="mt-1 text-sm text-on-surface-variant">{copy.saved} · {loadedAt.toLocaleTimeString(locale + "-IN")}</p>}</div>
        <button id="syncTriggerBtn" disabled={loading || !!updatingId} onClick={load} className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-surface px-4 py-3 font-semibold"><RefreshCw size={18} />{copy.refresh}</button>
      </section>}
    </main>
  </div>;
}
