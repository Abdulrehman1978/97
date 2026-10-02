"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Mic, Sparkles, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, Lock } from "lucide-react";
import { useAuth } from "@/lib/api/auth-context";
import { NetworkError, ApiError } from "@/lib/api/errors";
import { TruthBadge } from "@/components/TruthBadge";
import { useLanguage } from "@/lib/language-context";

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const DEMO_ROLES = [
  { role: "beneficiary", label: "Beneficiary (Ramesh)", sub: "गॅरेज मेकॅनिक" },
  { role: "field_worker", label: "Field Worker", sub: "स्थानिक समन्वयक" },
  { role: "counsellor", label: "Counsellor", sub: "कौशल्य सल्लागार" },
  { role: "financial_counsellor", label: "Finance Counsellor", sub: "आर्थिक सल्लागार" },
  { role: "district_admin", label: "District Admin", sub: "जिल्हा प्रशासन" },
  { role: "employer", label: "Employer", sub: "नियोक्ता / कंपनी" },
  { role: "provider", label: "Training Provider", sub: "VTC प्रशिक्षण केंद्र" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/interview";
  const { status, user, login, switchDemoRole } = useAuth();
  const { locale } = useLanguage();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(nextPath);
    }
  }, [status, user, router, nextPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError(locale === "mr" ? "कृपया ईमेल किंवा फोन नंबर प्रविष्ट करा." : "Please enter email or phone number.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(username.trim(), password || undefined);
    } catch (err: any) {
      if (err instanceof NetworkError) {
        setError(
          locale === "mr"
            ? "सर्व्हरशी संपर्क होऊ शकला नाही. इंटरनेट कनेक्शन तपासा."
            : "Cannot connect to server. Please check internet connection."
        );
      } else if (err instanceof ApiError && err.status === 401) {
        setError(
          locale === "mr"
            ? "चुकीचा ईमेल/फोन किंवा पासवर्ड. कृपया पुन्हा तपासा."
            : "Invalid credentials. Please verify your email/phone and password."
        );
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    if (!IS_DEMO_MODE) return;
    setDemoLoading(role);
    setError(null);
    try {
      await switchDemoRole(role);
      const dest =
        role === "beneficiary" ? "/interview"
        : role === "field_worker" || role === "counsellor" ? "/field"
        : role === "financial_counsellor" ? "/counsellor/finance"
        : role === "district_admin" ? "/admin"
        : role === "employer" ? "/employer"
        : role === "provider" ? "/provider"
        : "/";
      router.replace(dest);
    } catch (err: any) {
      setError(err.message || "Demo login failed.");
    } finally {
      setDemoLoading(null);
    }
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar with Back Link and Truth Badge */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-safe">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-label-md text-label-md min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === "mr" ? "मुख्य पृष्ठ (Home)" : "Back to Home"}</span>
        </Link>
        <TruthBadge state={IS_DEMO_MODE ? "DEMO_DATA" : "LIVE"} compact />
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden">
          {/* Card Header */}
          <div className="bg-primary p-space-md text-on-primary flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-secondary-fixed">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-headline-sm text-headline-sm font-bold tracking-tight flex items-center gap-1.5">
                  <span>प्रवेश (Sign In)</span>
                  <span className="text-xs font-normal text-primary-fixed-dim opacity-80 ml-1">• LUNA LIP</span>
                </h1>
                <span className="font-label-sm text-label-sm text-primary-fixed-dim">
                  {locale === "mr" ? "तुमच्या कार्यक्षेत्रात प्रवेश करा" : "Sign In to Your Workspace"}
                </span>
              </div>
            </div>
            <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-primary-container text-primary-fixed-dim">
              SIH26097
            </span>
          </div>

          {/* Form Content */}
          <form onSubmit={handleLogin} className="p-space-md flex flex-col gap-space-sm">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-error-container text-on-error-container font-label-sm text-label-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="font-label-md text-label-md text-on-surface font-semibold">
                {locale === "mr" ? "ईमेल किंवा मोबाईल नंबर" : "Email or Mobile Phone"}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="उदा. ramesh@beneficiary.lip किंवा 9876543210"
                autoComplete="username"
                required
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/50 text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="font-label-md text-label-md text-on-surface font-semibold">
                  {locale === "mr" ? "पासवर्ड (Password)" : "Password"}
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full min-h-[46px] px-3.5 py-2.5 pr-10 rounded-lg bg-surface-container-low border border-outline-variant/50 text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full min-h-[48px] mt-2 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-bold shadow-md hover:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>सत्यापन करत आहे…</span>
                </>
              ) : (
                <span>प्रवेश करा (Sign In)</span>
              )}
            </button>
          </form>

          {/* Demo Role Switcher - Active only when NEXT_PUBLIC_DEMO_MODE=true */}
          {IS_DEMO_MODE && (
            <div className="p-space-md bg-secondary-fixed/20 border-t border-outline-variant/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  SIH Judge Demo Quick Access
                </span>
                <span className="font-code-sm text-code-sm text-on-secondary-fixed-variant bg-secondary-fixed px-1.5 py-0.5 rounded font-bold">
                  DEMO_DATA
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                परीक्षकांसाठी तात्काळ एका क्लिकवर विविध भूमिका तपासण्याची सुविधा:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {DEMO_ROLES.map(({ role, label, sub }) => (
                  <button
                    key={role}
                    id={`demo-btn-${role}`}
                    onClick={() => handleDemoLogin(role)}
                    disabled={!!demoLoading}
                    type="button"
                    className="p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/40 text-left transition-all active:scale-[0.99] flex items-center justify-between min-h-[44px]"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-on-surface font-bold truncate">
                        {label}
                      </span>
                      <span className="font-code-sm text-code-sm text-on-surface-variant truncate">
                        {sub}
                      </span>
                    </div>
                    {demoLoading === role ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                    ) : (
                      <span className="font-code-sm text-code-sm text-secondary font-bold shrink-0">Switch →</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voice Assistant Link */}
          <div className="p-space-sm bg-surface-container-low border-t border-outline-variant/20 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              खाते नाही?{" "}
              <Link href="/interview" className="font-bold text-primary hover:underline inline-flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-secondary" />
                <span>लॉगिन न करता बोला (Explore First)</span>
              </Link>
            </p>
          </div>
        </div>

        {/* DPDP and Privacy Note */}
        <p className="mt-4 text-center font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
          नागरिक गोपनीयता हमी: सर्व प्रगती सुरक्षितपणे सेव्ह होते. PM-AJAY DPDP नियमांनुसार डेटा हाताळला जातो.
        </p>
      </div>

      <div className="text-center font-label-sm text-label-sm text-outline pb-2">
        SIH26097 • Sovereign Civic Livelihood
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
