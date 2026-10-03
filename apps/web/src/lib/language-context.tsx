"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, dictionaries, localeLanguages } from "@/i18n";

export type { Locale };

interface LanguageContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  speechLang: string;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "mr",
  setLocale: () => {},
  speechLang: "mr-IN",
  t: (key: string, fallback?: string) => fallback || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("mr");

  useEffect(() => {
    // Match the server's first render, then restore the device preference.
    try {
      const saved = localStorage.getItem("lip_locale");
      if (saved === "mr" || saved === "hi" || saved === "en") setLocaleState(saved);
    } catch { /* Storage may be disabled; the session selector still works. */ }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("lip_locale", newLocale); } catch { /* Session-only preference. */ }
      document.documentElement.lang = newLocale;
    }
  };

  const t = (key: string, fallback?: string): string => {
    const dict = dictionaries[locale] || dictionaries.mr;
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to English dictionary if key missing in target locale
    if (dictionaries.en && dictionaries.en[key]) {
      return dictionaries.en[key];
    }
    return fallback || key;
  };

  const speechLang = localeLanguages[locale]?.bcp47 || "mr-IN";

  return (
    <LanguageContext.Provider value={{ locale, setLocale, speechLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
