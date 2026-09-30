"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Wrench, Compass, CheckCircle2, HelpCircle } from "lucide-react";

export function BeneficiaryNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/interview", label: "Talk", marathi: "बोलणे", icon: Mic },
    { href: "/passport", label: "My Skills", marathi: "माझे कौशल्य", icon: Wrench },
    { href: "/pathways", label: "My Paths", marathi: "माझे मार्ग", icon: Compass },
    { href: "/journey", label: "My Journey", marathi: "माझा प्रवास", icon: CheckCircle2 },
    { href: "/help", label: "Help", marathi: "मदत", icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:sticky md:top-16 shadow-lg md:shadow-none">
      <div className="max-w-4xl mx-auto flex items-center justify-around py-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all touch-target ${
                isActive
                  ? "text-[#0f4c81] font-bold bg-sky-50 border border-sky-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-[#0f4c81]" : "text-slate-500"}`} />
              <span className="text-xs font-semibold mt-1">{item.label}</span>
              <span className="text-[10px] text-slate-500 font-normal leading-tight">{item.marathi}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
