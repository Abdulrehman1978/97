"use client";

import { AuthProvider } from "@/lib/api/auth-context";

/**
 * Thin client-component wrapper so the server-side RootLayout can import it.
 * The AuthProvider uses localStorage / browser APIs so it must be "use client".
 */
export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
