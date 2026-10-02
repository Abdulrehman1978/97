"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BeneficiaryNav } from "@/components/BeneficiaryNav";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { TruthBadge } from "@/components/TruthBadge";
import { useLanguage } from "@/lib/language-context";
import { fileGrievance, registerMissedCall } from "@/lib/api";
import {
  PhoneCall,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  WifiOff,
  Headphones,
  HelpCircle,
  FileText,
  Loader2,
  Clock,
  ArrowRight,
  Send
} from "lucide-react";

export default function HelpPage() {
  const { t, locale } = useLanguage();

  const [activeTab, setActiveTab] = useState<"callback" | "grievance" | "faq">("grievance");

  // Telephony / Callback states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callbackState, setCallbackState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    token?: string;
    truthState?: "SANDBOX" | "LIVE";
    errorMessage?: string;
  }>({ status: "idle" });

  // Grievance states
  const [grievanceCategory, setGrievanceCategory] = useState("training_center");
  const [grievanceTitle, setGrievanceTitle] = useState("");
  const [grievanceDesc, setGrievanceDesc] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [grievanceState, setGrievanceState] = useState<{
    status: "idle" | "loading" | "registered" | "offline_queued" | "error";
    grievanceId?: string;
    mutationId?: string;
    errorMessage?: string;
  }>({ status: "idle" });

  const handleRequestCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setCallbackState({
        status: "error",
        errorMessage: locale === "mr" ? "कृपया वैध १० अंकी मोबाइल क्रमांक प्रविष्ट करा." : "Please enter a valid 10-digit mobile number."
      });
      return;
    }

    setCallbackState({ status: "loading" });
    try {
      const res = await registerMissedCall(cleanPhone);
      setCallbackState({
        status: "success",
        token: res?.queue_token || `CB-${Date.now().toString().slice(-6)}`,
        truthState: (res?.truth_state as any) || "SANDBOX"
      });
    } catch (err: any) {
      setCallbackState({
        status: "error",
        errorMessage: err.message || (locale === "mr" ? "सर्व्हरशी संपर्क होऊ शकला नाही. पुन्हा प्रयत्न करा." : "Server unreachable. Please try again.")
      });
    }
  };

  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!grievanceTitle.trim()) {
      setValidationError(locale === "mr" ? "कृपया तक्रारीचा विषय लिहा." : "Please enter grievance subject.");
      return;
    }
    if (!grievanceDesc.trim() || grievanceDesc.trim().length < 10) {
      setValidationError(locale === "mr" ? "कृपया किमान १० अक्षरांमध्ये सविस्तर माहिती द्या." : "Please describe your concern in at least 10 characters.");
      return;
    }

    setGrievanceState({ status: "loading" });
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("lip_beneficiary_id") : null;
      const idToUse = storedId || "demo-beneficiary-id";

      const res = await fileGrievance(idToUse, grievanceCategory, grievanceTitle, grievanceDesc);

      if ((res as any)?.is_offline || (res as any)?.status === "offline_queued") {
        setGrievanceState({
          status: "offline_queued",
          mutationId: (res as any).client_mutation_id
        });
      } else if (res && res.grievance_id) {
        // Authoritative server ID
        setGrievanceState({
          status: "registered",
          grievanceId: res.grievance_id
        });
        setGrievanceTitle("");
        setGrievanceDesc("");
      } else {
        // DO NOT invent a fake ID if server failed to respond with one!
        setGrievanceState({
          status: "error",
          errorMessage: locale === "mr" ? "सर्व्हरने तक्रार क्रमांक तयार केला नाही. कृपया पुन्हा प्रयत्न करा." : "Server did not generate a grievance reference. Please retry."
        });
      }
    } catch (err: any) {
      setGrievanceState({
        status: "error",
        errorMessage: err.message || (locale === "mr" ? "तक्रार नोंदवण्यात त्रुटी आली. कृपया इंटरनेट तपासा." : "Grievance submission failed. Please check network.")
      });
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar />
      <BeneficiaryNav />

      <main className="flex flex-col relative w-full pt-16 pb-28 min-h-screen">
        <div className="flex flex-col w-full max-w-2xl mx-auto px-4 md:px-6 gap-4">
          {/* Header */}
          <div className="pt-4 flex flex-col gap-1">
            <div className="flex items-center justify-between text-label-sm font-label-sm uppercase tracking-wider text-outline">
              <span>{locale === "mr" ? "टप्पा ५ / ५ • मदत व तक्रार निवारण" : "Step 5 of 5 • Help & Grievance Redressal"}</span>
              <TruthBadge state="LIVE" />
            </div>

            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight font-bold mt-1">
              {locale === "mr" ? "मदत आणि तक्रार निवारण केंद्र (Help & Grievance Redressal)" : "Help & Grievance Redressal Desk"}
            </h1>

            <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              {locale === "mr"
                ? "समन्वयक संपर्क, कॉलबॅक विनंती किंवा शासकीय योजनेबद्दल तक्रार नोंदणी."
                : "Connect with field coordinators, request a callback, or register official scheme grievances."}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-surface-container-high p-1 rounded-xl flex items-center gap-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("callback")}
              className={`flex-1 min-h-[46px] py-1.5 px-2 rounded-lg font-label-md text-label-md transition-all text-center ${
                activeTab === "callback"
                  ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                  : "text-on-surface-variant hover:text-on-surface font-semibold"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-secondary" />
                {locale === "mr" ? "कॉलबॅक विनंती" : "Request Callback"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("grievance")}
              className={`flex-1 min-h-[46px] py-1.5 px-2 rounded-lg font-label-md text-label-md transition-all text-center ${
                activeTab === "grievance"
                  ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                  : "text-on-surface-variant hover:text-on-surface font-semibold"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <FileText className="w-4 h-4 text-secondary" />
                {locale === "mr" ? "तक्रार नोंदवा" : "File Grievance"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("faq")}
              className={`flex-1 min-h-[46px] py-1.5 px-2 rounded-lg font-label-md text-label-md transition-all text-center ${
                activeTab === "faq"
                  ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                  : "text-on-surface-variant hover:text-on-surface font-semibold"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-secondary" />
                {locale === "mr" ? "नेहमीचे प्रश्न" : "FAQ & Guidance"}
              </span>
            </button>
          </div>

          {/* TAB 1: Request Callback */}
          {activeTab === "callback" && (
            <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-sm border border-surface-variant/40 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                    {locale === "mr" ? "थेट फोनवर मदत हवी आहे?" : "Need Phone Assistance?"}
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {locale === "mr"
                      ? "आपला मोबाइल क्रमांक नोंदवा; आमचे समन्वयक २४ तासांत संपर्क साधतील."
                      : "Enter your mobile number; our district field team will call you back within 24 hours."}
                  </p>
                </div>
                <TruthBadge state="SANDBOX" />
              </div>

              {callbackState.status === "success" ? (
                <div className="p-4 rounded-xl bg-tertiary-fixed/30 border border-secondary/30 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-on-tertiary-container font-bold font-title-md">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <span>{locale === "mr" ? "कॉलबॅक विनंती नोंदवली गेली आहे!" : "Callback Request Enqueued!"}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    {locale === "mr"
                      ? `आपला संदर्भ टोकन: ${callbackState.token}. जिल्हा समन्वयक लवकरच संपर्क साधतील.`
                      : `Your reference token is ${callbackState.token}. Telephony simulation active.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCallbackState({ status: "idle" })}
                    className="self-start mt-2 px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md font-semibold"
                  >
                    {locale === "mr" ? "दुसरा क्रमांक नोंदवा" : "Submit Another"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestCallback} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="callback-phone" className="font-label-md text-label-md text-on-surface font-semibold">
                      {locale === "mr" ? "मोबाइल क्रमांक (Mobile Number)" : "Mobile Number"}
                    </label>
                    <input
                      id="callback-phone"
                      aria-label={locale === "mr" ? "मोबाइल क्रमांक (Mobile Number)" : "Mobile Number"}
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98XXXXXXXX"
                      maxLength={12}
                      className="min-h-[48px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:bg-surface-bright focus:outline-none font-title-md text-title-md text-on-surface"
                    />
                  </div>

                  {callbackState.status === "error" && (
                    <div className="p-2.5 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-error font-body-sm text-body-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{callbackState.errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={callbackState.status === "loading"}
                    className="min-h-[48px] px-4 py-3 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-md active:bg-primary-container transition-all disabled:opacity-50"
                  >
                    {callbackState.status === "loading" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{locale === "mr" ? "नोंदवत आहे..." : "Requesting..."}</span>
                      </>
                    ) : (
                      <>
                        <PhoneCall className="w-5 h-5" />
                        <span>{locale === "mr" ? "कॉलबॅक विनंती पाठवा" : "Request Free Callback"}</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 bg-surface-container-low rounded-xl flex items-center gap-2 text-on-surface-variant font-code-sm text-code-sm">
                    <span className="font-bold text-secondary">SANDBOX:</span>
                    <span>{locale === "mr" ? "टेलिफोनी सिम्युलेटर सक्रिय • कॉल रांग चाचणीसाठी सक्षम" : "Telephony adapter in sandbox simulation mode"}</span>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: File Grievance */}
          {activeTab === "grievance" && (
            <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-sm border border-surface-variant/40 flex flex-col gap-4">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                  {locale === "mr" ? "अधिकृत तक्रार निवारण (Grievance Portal)" : "Official Grievance Registration"}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {locale === "mr"
                    ? "प्रशिक्षण केंद्र, बँक कर्ज किंवा समन्वयकाविषयी तक्रार थेट जिल्हा नियंत्रण कक्षाकडे नोंदवा."
                    : "File concerns regarding training institutes, loan sanctions, or coordinator support."}
                </p>
              </div>

              {grievanceState.status === "registered" ? (
                <div className="p-4 rounded-xl bg-tertiary-fixed/30 border border-secondary/30 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-on-tertiary-container font-bold font-title-md">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <span>{locale === "mr" ? "तक्रार यशस्वीरीत्या नोंदवली गेली आहे" : "Grievance Successfully Registered!"}</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">
                    {locale === "mr" ? "आपला तक्रार क्रमांक:" : "Official Grievance Reference ID:"}{" "}
                    <strong className="text-primary font-code-sm text-code-sm">{grievanceState.grievanceId}</strong>
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {locale === "mr"
                      ? "हा क्रमांक जतन करा. जिल्हा तक्रार निवारण अधिकारी ७ कामकाजाच्या दिवसांत निवारण करतील."
                      : "Preserve this reference. District Grievance Officer will review within 7 working days."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setGrievanceState({ status: "idle" })}
                    className="self-start mt-2 px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md font-semibold"
                  >
                    {locale === "mr" ? "नवी तक्रार नोंदवा" : "Submit Another"}
                  </button>
                </div>
              ) : grievanceState.status === "offline_queued" ? (
                <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary font-bold font-title-md">
                    <WifiOff className="w-5 h-5 text-secondary" />
                    <span>{locale === "mr" ? "डिव्हाइसवर सेव्ह झाले (Offline Queued)" : "Saved Locally (Offline Queued)"}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {locale === "mr"
                      ? "इंटरनेट कनेक्शन उपलब्ध नाही. इंटरनेट परत येताच तुमची तक्रार आपोआप सर्व्हरवर पाठवली जाईल."
                      : "Your grievance is queued on this device and will be synced upon network reconnection."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleGrievanceSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="grievance-category" className="font-label-md text-label-md text-on-surface font-semibold">
                      {locale === "mr" ? "तक्रारीचे स्वरूप (Category)" : "Category"}
                    </label>
                    <select
                      id="grievance-category"
                      aria-label={locale === "mr" ? "तक्रारीचे स्वरूप (Category)" : "Category"}
                      value={grievanceCategory}
                      onChange={(e) => setGrievanceCategory(e.target.value)}
                      className="min-h-[46px] px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none"
                    >
                      <option value="training_center">
                        {locale === "mr" ? "प्रशिक्षण केंद्र किंवा वर्ग समस्या" : "Training Center Issue"}
                      </option>
                      <option value="finance_credit">
                        {locale === "mr" ? "बँक कर्ज व अनुदान अडचण" : "Bank Loan & Subsidy Issue"}
                      </option>
                      <option value="coordinator">
                        {locale === "mr" ? "समन्वयक गैरहजेरी किंवा वर्तन" : "Coordinator Assistance Issue"}
                      </option>
                      <option value="certificate">
                        {locale === "mr" ? "प्रमाणपत्र किंवा निकाल विलंब" : "Certificate Delay"}
                      </option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="grievance-title" className="font-label-md text-label-md text-on-surface font-semibold">
                      {locale === "mr" ? "तक्रारीचा विषय (Subject)" : "Subject"}
                    </label>
                    <input
                      id="grievance-title"
                      aria-label={locale === "mr" ? "तक्रारीचा विषय (Subject)" : "Subject"}
                      type="text"
                      value={grievanceTitle}
                      onChange={(e) => setGrievanceTitle(e.target.value)}
                      placeholder={locale === "mr" ? "उदा. केंद्रावर टूल्स उपलब्ध नाहीत" : "e.g. Center lacks diagnostic equipment"}
                      maxLength={100}
                      className="min-h-[48px] px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:bg-surface-bright focus:outline-none font-body-md text-body-md text-on-surface"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="grievance-desc" className="font-label-md text-label-md text-on-surface font-semibold">
                      {locale === "mr" ? "सविस्तर माहिती (Description)" : "Detailed Description"}
                    </label>
                    <textarea
                      id="grievance-desc"
                      aria-label={locale === "mr" ? "सविस्तर माहिती (Description)" : "Detailed Description"}
                      rows={4}
                      value={grievanceDesc}
                      onChange={(e) => setGrievanceDesc(e.target.value)}
                      placeholder={locale === "mr" ? "आपली समस्या स्पष्टपणे लिहा..." : "Describe the incident or concern..."}
                      maxLength={500}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:bg-surface-bright focus:outline-none font-body-md text-body-md text-on-surface resize-none"
                    />
                  </div>

                  {validationError && (
                    <div className="p-2.5 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-error font-body-sm text-body-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {grievanceState.status === "error" && (
                    <div className="p-2.5 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-error font-body-sm text-body-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{grievanceState.errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={grievanceState.status === "loading"}
                    className="min-h-[48px] px-4 py-3 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-md active:bg-primary-container transition-all disabled:opacity-50 mt-1"
                  >
                    {grievanceState.status === "loading" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{locale === "mr" ? "तक्रार नोंदवत आहे..." : "Submitting..."}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>{locale === "mr" ? "तक्रार सबमिट करा (Submit Grievance)" : "Submit Grievance"}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: FAQ */}
          {activeTab === "faq" && (
            <div className="flex flex-col gap-3">
              {[
                {
                  q: locale === "mr" ? "पीएम-अजय योजना काय आहे?" : "What is the PM-AJAY Scheme?",
                  a: locale === "mr" ? "अनुसूचित जाती आणि दुर्बल घटकांसाठी कौशल्य विकास, पायाभूत सुविधा व उपजीविका निर्मितीसाठी केंद्र शासनाची योजना." : "A central government scheme funding skill development, infrastructure, and tool subsidies for disadvantaged beneficiaries."
                },
                {
                  q: locale === "mr" ? "RPL प्रमाणपत्र कसे मिळते?" : "How does RPL certification work?",
                  a: locale === "mr" ? "आपल्या जुन्या अनुभवावर आधारित ३० तासांचे ब्रिज प्रशिक्षण दिल्यानंतर प्रात्यक्षिक चाचणी घेऊन शासकीय NSQF प्रमाणपत्र दिले जाते." : "Based on your informal experience, a 30-hour bridge module followed by hands-on assessment confers an NSQF-aligned certificate."
                },
                {
                  q: locale === "mr" ? "प्रशिक्षण वर्ग मोफत आहेत का?" : "Are training courses completely free?",
                  a: locale === "mr" ? "होय, निवडक शासकीय व क्लस्टर भागीदारांमार्फत हे सर्व वर्ग व साहित्य मोफत पुरवले जातात." : "Yes, accredited PM-AJAY batches are 100% funded with no fees for registered beneficiaries."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-variant/40 flex flex-col gap-1.5">
                  <h3 className="font-title-md text-title-md text-primary font-bold">{item.q}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
