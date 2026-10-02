"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, ShieldCheck, Compass, CalendarCheck, Headphones } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function BeneficiaryNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      href: "/interview",
      labelKey: "nav.talk",
      defaultLabel: "Talk",
      subKey: "nav.talk_sub",
      defaultSub: "बोलणे",
      icon: Mic,
      matchPrefix: "/interview",
    },
    {
      href: "/passport",
      labelKey: "nav.my_skills",
      defaultLabel: "My Skills",
      subKey: "nav.my_skills_sub",
      defaultSub: "माझे कौशल्य",
      icon: ShieldCheck,
      matchPrefix: "/passport",
    },
    {
      href: "/pathways",
      labelKey: "nav.my_paths",
      defaultLabel: "My Paths",
      subKey: "nav.my_paths_sub",
      defaultSub: "माझे मार्ग",
      icon: Compass,
      matchPrefix: "/pathways",
    },
    {
      href: "/journey",
      labelKey: "nav.my_journey",
      defaultLabel: "My Journey",
      subKey: "nav.my_journey_sub",
      defaultSub: "माझा प्रवास",
      icon: CalendarCheck,
      matchPrefix: "/journey",
    },
    {
      href: "/help",
      labelKey: "nav.help",
      defaultLabel: "Help",
      subKey: "nav.help_sub",
      defaultSub: "मदत",
      icon: Headphones,
      matchPrefix: "/help",
    },
  ];

  return (
    <nav
      aria-label="Beneficiary Navigation"
      className="fixed bottom-0 left-0 right-0 w-full z-50 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-1px_8px_rgba(15,41,66,0.08)] border-t border-outline-variant/30"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-20 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.matchPrefix);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-all group ${
                isActive
                  ? "text-primary font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <div
                className={`w-10 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? "bg-surface-container-high text-primary" : "text-on-surface-variant"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-label-sm text-label-sm mt-0.5 tracking-tight">
                {t(item.labelKey, item.defaultLabel)}
              </span>
              <span
                className={`w-3 h-0.5 rounded-full bg-secondary transition-transform mt-0.5 ${
                  isActive ? "scale-100" : "scale-0 opacity-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
