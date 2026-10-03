"use client";

import { AuthProvider } from "@/lib/api/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { RuntimeTruthProvider } from "@/lib/runtime-truth-context";

/**
 * Client-component wrapper providing auth, localization, and runtime truth context across all routes.
 */
export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RuntimeTruthProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </RuntimeTruthProvider>
    </AuthProvider>
  );
}
