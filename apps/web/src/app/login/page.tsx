"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Mic, Sparkles, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/api/auth-context";
import { NetworkError, ApiError } from "@/lib/api/errors";

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const DEMO_ROLES = [
  { role: "beneficiary",          label: "Demo Beneficiary",      emoji: "👤", color: "bg-emerald-600 hover:bg-emerald-700" },
  { role: "field_worker",         label: "Demo Field Mobilizer",  emoji: "🏃", color: "bg-sky-600 hover:bg-sky-700" },
  { role: "counsellor",           label: "Demo Counsellor",       emoji: "🤝", color: "bg-violet-600 hover:bg-violet-700" },
  { role: "district_admin",       label: "Demo District Admin",   emoji: "🏛️", color: "bg-slate-700 hover:bg-slate-800" },
  { role: "employer",             label: "Demo Employer",         emoji: "🏭", color: "bg-orange-600 hover:bg-orange-700" },
  { role: "provider",             label: "Demo Provider",         emoji: "🎓", color: "bg-indigo-600 hover:bg-indigo-700" },
];

/**
 * Inner component that reads searchParams — must be wrapped in <Suspense> to
 * satisfy the Next.js App Router static rendering constraint.
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/interview";
  const { status, user, login, switchDemoRole } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(nextPath);
    }
  }, [status, user, router, nextPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await login(username.trim(), password || undefined);
      // AuthProvider will set status → "authenticated" → useEffect above redirects
    } catch (err: any) {
      if (err instanceof NetworkError) {
        setError("सर्व्हरशी संपर्क होऊ शकला नाही. Backend सुरू आहे का तपासा. (Backend unreachable)");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("चुकीचा ईमेल/फोन किंवा पासवर्ड. (Invalid credentials)");
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
      // role-specific redirect
      const dest =
        role === "beneficiary" ? "/interview"
        : role === "field_worker" ? "/field"
        : role === "counsellor" ? "/field"
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-[#0f4c81] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Brand header */}
      <Link href="/" className="flex flex-col items-center gap-3 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#0f4c81] text-white flex items-center justify-center font-black text-xl shadow-lg">
          LIP
        </div>
        <div className="text-center">
          <p className="font-bold text-slate-900 text-lg">PM-AJAY Livelihood Intelligence Platform</p>
          <p className="text-xs text-slate-500 font-medium">SIH26097 • MoSJE Grants-in-Aid (GIA)</p>
        </div>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Card header */}
        <div className="bg-[#0f4c81] px-6 py-5 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-sky-200" />
          <div>
            <h1 className="text-white font-bold text-base">प्रवेश करा / Sign In</h1>
            <p className="text-sky-200 text-xs">ईमेल किंवा मोबाईल नंबर वापरा</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="px-6 py-6 space-y-4">
          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-xs font-bold text-slate-700 mb-1.5">
              ईमेल / मोबाईल नंबर (Email or Phone)
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ramesh@beneficiary.lip  या  9876543210"
              autoComplete="username"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1.5">
              पासवर्ड (Password)
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81] transition-colors pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full py-3.5 rounded-xl bg-[#0f4c81] text-white font-bold text-sm hover:bg-[#0c3c66] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* Demo mode role quick-access — only when NEXT_PUBLIC_DEMO_MODE=true */}
        {IS_DEMO_MODE && (
          <div className="border-t border-slate-200 px-6 py-5 bg-amber-50/60">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                SIH Judge Demo — Quick Role Access
              </span>
            </div>
            <p className="text-[11px] text-amber-700 mb-3 font-medium">
              ⚠️ DEMO_DATA mode. These buttons are disabled in production.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ROLES.map(({ role, label, emoji, color }) => (
                <button
                  key={role}
                  id={`demo-btn-${role}`}
                  onClick={() => handleDemoLogin(role)}
                  disabled={!!demoLoading}
                  className={`${color} text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-60`}
                >
                  {demoLoading === role ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{emoji}</span>
                  )}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice assistant shortcut */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <p className="text-xs text-slate-500 text-center">
            खाते नाही?{" "}
            <Link href="/interview" className="font-bold text-[#0f4c81] hover:underline">
              <Mic className="w-3.5 h-3.5 inline mb-0.5 mr-0.5" />
              Voice Assistant वापरा (Talk without login)
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-6 text-[11px] text-slate-400 text-center max-w-sm">
        लॉगिन केल्यावर तुमची माहिती सुरक्षितपणे सेव्ह होते. हे व्यासपीठ MoSJE PM-AJAY GIA मार्गदर्शक तत्त्वांनुसार आहे.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 text-[#0f4c81] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
