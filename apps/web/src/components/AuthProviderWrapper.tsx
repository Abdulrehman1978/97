"use client";

import { AuthProvider } from "@/lib/api/auth-context";
import { LanguageProvider } from "@/lib/language-context";

/**
 * Client-component wrapper providing auth and localization context across all routes.
 */
export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AuthProvider>
  );
}
