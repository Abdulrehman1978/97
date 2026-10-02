"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Fingerprint, Route, CircleCheck, Headphones } from "lucide-react";

const steps = [
  { href: "/interview", label: "Talk", marathi: "बोलणे", icon: Mic },
  { href: "/passport", label: "My Skills", marathi: "कौशल्य", icon: Fingerprint },
  { href: "/pathways", label: "My Paths", marathi: "मार्ग", icon: Route },
  { href: "/journey", label: "My Journey", marathi: "प्रवास", icon: CircleCheck },
  { href: "/help", label: "Help", marathi: "मदत", icon: Headphones },
];
export function BeneficiaryNav() {
  const pathname = usePathname();
  return <nav aria-label="Your livelihood journey" className="journey-navigation"><div>{steps.map((step, index) => <Link key={step.href} href={step.href} aria-current={pathname === step.href ? "step" : undefined}><span className="journey-step-icon"><step.icon size={19}/><small>{index + 1}</small></span><span><strong>{step.label}</strong><small lang="mr">{step.marathi}</small></span></Link>)}</div></nav>;
}
