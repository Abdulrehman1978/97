"use client";

import { AuthProvider, RequireAuth } from "@/lib/api/auth-context";
import { usePathname } from "next/navigation";
import { RuntimeTruthProvider } from "./RuntimeTruth";
import { OfflineSync } from "./OfflineSync";

const ADMIN = ["district_admin", "state_admin", "ministry_admin"];
const ACCESS: Record<string, string[]> = {
  "/field": ["field_worker", "counsellor", ...ADMIN],
  "/counsellor/finance": ["financial_counsellor", "counsellor", ...ADMIN],
  "/provider": ["provider", ...ADMIN],
  "/employer": ["employer", ...ADMIN],
  "/admin": ADMIN,
  "/coordination": ["field_worker", "counsellor", "financial_counsellor", "provider", ...ADMIN],
};

/**
 * Thin client-component wrapper so the server-side RootLayout can import it.
 * The AuthProvider uses localStorage / browser APIs so it must be "use client".
 */
export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const roles = ACCESS[pathname];
  return <RuntimeTruthProvider><AuthProvider>{roles ? <RequireAuth roles={roles}>{children}</RequireAuth> : children}<OfflineSync /></AuthProvider></RuntimeTruthProvider>;
}
