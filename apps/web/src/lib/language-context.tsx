"use client";

import React, { createContext, useContext, useState } from "react";

export type Locale = "mr" | "hi" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const dictionaries: Record<Locale, Record<string, string>> = {
  mr: {
    // Nav
    "nav.talk": "Talk",
    "nav.talk_sub": "बोला",
    "nav.my_skills": "My Skills",
    "nav.my_skills_sub": "माझी कौशल्ये",
    "nav.my_paths": "My Paths",
    "nav.my_paths_sub": "माझे मार्ग",
    "nav.my_journey": "My Journey",
    "nav.my_journey_sub": "माझा प्रवास",
    "nav.help": "Help",
    "nav.help_sub": "मदत",
    
    // Header
    "brand.sub": "आजीविका संधी व कौशल्य प्रमाणीकरण मंच",
    "header.listen": "ऐका / Listen",
    "header.stop": "थांबवा / Stop",
    "header.login": "लॉगिन करा",
    "header.logout": "लॉगआउट",
    
    // Truth states
    "truth.live": "थेट प्रणाली • LIVE",
    "truth.demo_data": "डेमो डेटा • DEMO DATA",
    "truth.sandbox": "सँडबॉक्स • SANDBOX",
    "truth.offline_queued": "स्थानिक रांगेत • OFFLINE QUEUED",
    "truth.draft": "मसुदा • DRAFT",
    "truth.verified": "प्रमाणित • VERIFIED",
    
    // Common Actions
    "action.continue": "पुढे जा",
    "action.back": "मागे",
    "action.save": "बदल सेव्ह करा",
    "action.retry": "पुन्हा बोला",
    "action.cancel": "रद्द करा",
    "action.submit": "नोंदवा",
    "action.view": "पहा",
    "action.edit": "दुरुस्त करा",
    "action.delete": "काढून टाका",
    "action.call": "कॉल करा",
  },
  hi: {
    "nav.talk": "Talk",
    "nav.talk_sub": "बोलें",
    "nav.my_skills": "My Skills",
    "nav.my_skills_sub": "मेरे हुनर",
    "nav.my_paths": "My Paths",
    "nav.my_paths_sub": "मेरे रास्ते",
    "nav.my_journey": "My Journey",
    "nav.my_journey_sub": "मेरी यात्रा",
    "nav.help": "Help",
    "nav.help_sub": "मदद",
    
    "brand.sub": "आजीविका अवसर एवं कौशल प्रमाणीकरण मंच",
    "header.listen": "सुनें / Listen",
    "header.stop": "रोकें / Stop",
    "header.login": "लॉगिन करें",
    "header.logout": "लॉगआउट",
    
    "truth.live": "लाइव • LIVE",
    "truth.demo_data": "डेमो डेटा • DEMO DATA",
    "truth.sandbox": "सैंडबॉक्स • SANDBOX",
    "truth.offline_queued": "ऑफ़लाइन कतार • OFFLINE QUEUED",
    "truth.draft": "प्रारूप • DRAFT",
    "truth.verified": "सत्यापित • VERIFIED",
    
    "action.continue": "आगे बढ़ें",
    "action.back": "पीछे",
    "action.save": "सुरक्षित करें",
    "action.retry": "पुनः बोलें",
    "action.cancel": "रद्द करें",
    "action.submit": "जमा करें",
    "action.view": "देखें",
    "action.edit": "संशोधित करें",
    "action.delete": "हटाएं",
    "action.call": "कॉल करें",
  },
  en: {
    "nav.talk": "Talk",
    "nav.talk_sub": "Voice",
    "nav.my_skills": "My Skills",
    "nav.my_skills_sub": "Passport",
    "nav.my_paths": "My Paths",
    "nav.my_paths_sub": "Explore",
    "nav.my_journey": "My Journey",
    "nav.my_journey_sub": "Actions",
    "nav.help": "Help",
    "nav.help_sub": "Support",
    
    "brand.sub": "Livelihood Intelligence Platform",
    "header.listen": "Listen",
    "header.stop": "Stop",
    "header.login": "Sign In",
    "header.logout": "Sign Out",
    
    "truth.live": "LIVE",
    "truth.demo_data": "DEMO DATA",
    "truth.sandbox": "SANDBOX",
    "truth.offline_queued": "OFFLINE QUEUED",
    "truth.draft": "DRAFT",
    "truth.verified": "VERIFIED",
    
    "action.continue": "Continue",
    "action.back": "Back",
    "action.save": "Save Changes",
    "action.retry": "Retry",
    "action.cancel": "Cancel",
    "action.submit": "Submit",
    "action.view": "View",
    "action.edit": "Edit",
    "action.delete": "Remove",
    "action.call": "Call Now",
  }
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "mr",
  setLocale: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lip_locale") as Locale;
      if (saved && (saved === "mr" || saved === "hi" || saved === "en")) {
        return saved;
      }
    }
    return "mr";
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("lip_locale", newLocale);
    }
  };

  const t = (key: string, fallback?: string): string => {
    return dictionaries[locale]?.[key] || dictionaries.en[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
