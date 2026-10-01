"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch, getStoredToken, clearStoredToken, setStoredToken } from "./client";
import { AuthError } from "./errors";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionStatus =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "expired"
  | "forbidden";

export interface AuthUser {
  id: string;
  full_name: string;
  role: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
}

interface AuthContextValue {
  status: SessionStatus;
  user: AuthUser | null;
  /** Log in with email/phone + password and refresh session from /identity/me */
  login(username: string, password?: string): Promise<void>;
  /** Switch to a demo role (DEMO_MODE only) */
  switchDemoRole(role: string): Promise<void>;
  /** Clear session */
  logout(): void;
  /** Re-fetch /identity/me to refresh user object */
  refreshUser(): Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("checking");
  const [user, setUser] = useState<AuthUser | null>(null);

  /** Fetch /identity/me and populate user state */
  const fetchMe = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const me = await apiFetch<AuthUser>("/api/v1/identity/me");
      return me;
    } catch (e: any) {
      if (e instanceof AuthError || e?.status === 401) {
        clearStoredToken();
        return null;
      }
      throw e;
    }
  }, []);

  /** On mount, check if a stored token is still valid */
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }
    fetchMe()
      .then((me) => {
        if (me) {
          setUser(me);
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        setStatus("unauthenticated");
      });
  }, [fetchMe]);

  const login = useCallback(
    async (username: string, password?: string) => {
      const data = await apiFetch<{
        access_token: string;
        token_type: string;
        user: { id: string; full_name: string; role: string };
      }>("/api/v1/identity/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setStoredToken(data.access_token);
      // Load authoritative user from /identity/me (not trusting login payload alone)
      const me = await fetchMe();
      if (me) {
        setUser(me);
        setStatus("authenticated");
      } else {
        clearStoredToken();
        throw new Error("Session could not be established after login");
      }
    },
    [fetchMe]
  );

  const switchDemoRole = useCallback(
    async (role: string) => {
      const data = await apiFetch<{ access_token: string; active_role: string }>(
        "/api/v1/identity/demo/switch-role",
        { method: "POST", body: JSON.stringify({ role }) }
      );
      setStoredToken(data.access_token);
      const me = await fetchMe();
      if (me) {
        setUser(me);
        setStatus("authenticated");
      } else {
        // For demo tokens the /me endpoint synthesises a user from the JWT
        setUser({
          id: `demo-${role}`,
          full_name: `Demo ${role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
          role,
          email: null,
          phone: null,
          is_active: true,
        });
        setStatus("authenticated");
      }
    },
    [fetchMe]
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await fetchMe();
    if (me) {
      setUser(me);
      setStatus("authenticated");
    } else {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ status, user, login, switchDemoRole, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// ─── Guards ───────────────────────────────────────────────────────────────────

interface RequireAuthProps {
  children: React.ReactNode;
  /** Optional: allowed roles. If omitted, any authenticated user passes. */
  roles?: string[];
  /** Element to render while checking — defaults to a spinner */
  fallback?: React.ReactNode;
}

export function RequireAuth({ children, roles, fallback }: RequireAuthProps) {
  const { status, user } = useAuth();

  if (status === "checking") {
    return (
      <>
        {fallback ?? (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <div className="w-8 h-8 border-2 border-[#0f4c81] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">सत्यापन करत आहे… (Checking session)</p>
            </div>
          </div>
        )}
      </>
    );
  }

  if (status !== "authenticated" || !user) {
    // Redirect to login preserving the intended destination
    if (typeof window !== "undefined") {
      const dest = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?next=${dest}`;
    }
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl font-bold">403</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mb-2">Access Forbidden</h1>
          <p className="text-sm text-slate-600">
            Your role (<code className="bg-slate-100 px-1 rounded">{user.role}</code>) is not
            authorized to access this section.
          </p>
          <a href="/" className="mt-4 inline-block text-sm font-bold text-[#0f4c81] hover:underline">
            ← Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
