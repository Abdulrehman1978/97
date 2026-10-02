"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown, LogOut, UserRound, LayoutGrid } from "lucide-react";
import { TruthBadge } from "./TruthBadge";
import { useAuth } from "@/lib/api/auth-context";

const admin = ["district_admin", "state_admin", "ministry_admin"];
const portals = [
  { path: "/interview", label: "My livelihood journey", roles: ["beneficiary", ...admin] },
  { path: "/field", label: "Field & counselling", roles: ["field_worker", "counsellor", ...admin] },
  { path: "/counsellor/finance", label: "Financial counselling", roles: ["financial_counsellor", "counsellor", ...admin] },
  { path: "/provider", label: "Training provider", roles: ["provider", ...admin] },
  { path: "/employer", label: "Employer workspace", roles: ["employer", ...admin] },
  { path: "/admin", label: "District planning", roles: admin },
  { path: "/coordination", label: "Coordination", roles: ["field_worker", "counsellor", "financial_counsellor", "provider", ...admin] },
];

export function Navbar() {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState<"portals" | "account" | null>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const available = portals.filter(item => user && item.roles.includes(user.role));
  return <header className="civic-header">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="civic-header-inner">
      <Link href="/" className="civic-brand" aria-label="LIP · PM-AJAY Livelihood Intelligence home"><span className="civic-mark">li<span>p</span><i /></span><span className="civic-brand-copy"><strong>Livelihood Intelligence</strong><small>PM-AJAY · SIH26097</small></span></Link>
      <div className="header-provenance"><TruthBadge state="LIVE"/></div>
      <div className="header-actions">
        <Link className="header-help" href="/help">Need help? <ArrowUpRight size={14}/></Link>
        {available.length > 0 && <div className="header-menu"><button id="portal-switcher-btn" aria-label="Switch Portal" aria-expanded={open === "portals"} aria-controls="workspace-menu" onClick={() => setOpen(open === "portals" ? null : "portals")} className="header-control"><LayoutGrid size={18}/><span className="desktop-label">Workspace</span><ChevronDown size={14}/></button>{open === "portals" && <nav id="workspace-menu" aria-label="Your workspaces" className="civic-popover"><p className="eyebrow">YOUR WORKSPACES</p>{available.map(item => <Link key={item.path} href={item.path} aria-current={pathname === item.path ? "page" : undefined} onClick={() => setOpen(null)}>{item.label}<ArrowUpRight size={14}/></Link>)}<Link href="/demo" onClick={() => setOpen(null)}>Demonstration desk <ArrowUpRight size={14}/></Link></nav>}</div>}
        {status === "checking" && <span className="session-check" role="status">Checking…</span>}
        {status === "authenticated" && user && <div className="header-menu"><button id="user-menu-btn" aria-label={`Account: ${user.full_name}`} aria-expanded={open === "account"} aria-controls="account-menu" className="account-control" onClick={() => setOpen(open === "account" ? null : "account")}><UserRound size={18}/><span className="desktop-label">{user.full_name.split(" ")[0]}</span></button>{open === "account" && <div id="account-menu" className="civic-popover"><strong>{user.full_name}</strong><p className="account-role">{user.role.replaceAll("_", " ")}</p><button onClick={() => { logout(); setOpen(null); router.push("/"); }}><LogOut size={16}/> Sign Out</button></div>}</div>}
        {status !== "checking" && status !== "authenticated" && <Link href="/login" id="nav-signin-btn" className="header-signin">Sign In <ArrowUpRight size={15}/></Link>}
      </div>
    </div>
  </header>;
}
