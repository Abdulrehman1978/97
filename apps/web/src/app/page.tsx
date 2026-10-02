"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowRight, Mic, Fingerprint, Route, ShieldCheck, Users, Building2, Briefcase, Landmark, Headphones, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { TruthBadge } from "@/components/TruthBadge";

const workspaces = [
  { href: "/field", icon: Users, title: "Field & counselling", desc: "Turn a conversation into a supported next step.", label: "Work with people" },
  { href: "/provider", icon: Building2, title: "Training providers", desc: "Manage opportunities, capacity and admissions.", label: "Build capability" },
  { href: "/employer", icon: Briefcase, title: "Employers", desc: "Connect work opportunities with practical skills.", label: "Create opportunity" },
  { href: "/admin", icon: Landmark, title: "District planning", desc: "See local demand. Plan a coordinated response.", label: "Understand the district" },
];

export default function HomePage() {
  return <div className="fieldbook">
    <Navbar />
    <main id="main-content">
      <section className="welcome-grid">
        <div className="welcome-copy">
          <p className="eyebrow"><span className="small-rule" /> PM-AJAY · LIVELIHOOD INTELLIGENCE</p>
          <h1>Your experience.<br />Your skills.<br /><em>A way forward.</em></h1>
          <p className="welcome-marathi" lang="mr">तुमचा अनुभव, तुमचे कौशल्य, तुमची पुढची संधी.</p>
          <p className="welcome-description">Tell us about the work you know. Discover your skills, explore local pathways, and take the next step—with support when you need it.</p>
          <div className="welcome-actions">
            <Link href="/interview" className="civic-button"><Mic size={19} /> Tell your story <ArrowRight size={18} /></Link>
            <Link href="/login" className="quiet-link">Continue your journey <ArrowUpRight size={17} /></Link>
          </div>
          <p className="welcome-footnote"><ShieldCheck size={16} /> Explore without signing in. Sign in to save your progress.</p>
        </div>
        <div className="story-board" aria-label="Illustration of the experience to opportunity journey">
          <div className="board-top"><span>FROM EXPERIENCE TO OPPORTUNITY</span><span className="board-index">01 — 03</span></div>
          <div className="story-quote"><span className="story-icon"><Mic size={21}/></span><div><span className="board-label">01 / YOUR WORDS</span><p>“I repair things.<br />I learned by doing.”</p><small>Illustrative story · not a beneficiary record</small></div></div>
          <div className="board-connector" aria-hidden="true"><span /></div>
          <div className="evidence-sheet"><div className="sheet-heading"><Fingerprint size={20}/><span>02 / SKILLS, MADE VISIBLE</span></div><div className="skill-chips"><span>Practical tasks</span><span>Tools you use</span><span>Your evidence</span></div><p>You review what we understood. Your experience stays at the centre.</p><div className="sheet-line"><Check size={15}/> Self-confirmed ≠ officially certified</div></div>
          <div className="board-connector" aria-hidden="true"><span /></div>
          <div className="opportunity-sheet"><Route size={25}/><div><span className="board-label">03 / A PRACTICAL NEXT STEP</span><strong>Learning. Work. Enterprise.</strong><p>Options shaped by your skills and constraints.</p></div><ArrowUpRight size={20}/></div>
          <div className="board-bottom"><span>Clear evidence. Human support.</span><TruthBadge state="LIVE"/></div>
        </div>
      </section>

      <section className="principle-strip" aria-label="Service principles">
        <div><span>01</span><strong>Your words, first.</strong><p>Speak or type about everyday work.</p></div>
        <div><span>02</span><strong>You stay in control.</strong><p>Review your skills and constraints.</p></div>
        <div><span>03</span><strong>Progress you can see.</strong><p>Saved actions, not empty promises.</p></div>
      </section>

      <section className="workspace-section">
        <div className="section-intro"><div><p className="eyebrow">ONE JOURNEY. A CONNECTED SUPPORT SYSTEM.</p><h2>Good opportunities<br />take a community.</h2></div><p>Dedicated workspaces bring field teams, training partners, employers and district planners into the same livelihood journey. Professional access requires sign-in.</p></div>
        <div className="workspace-grid">{workspaces.map(item => <Link href={item.href} key={item.href} className="workspace-card"><div className="workspace-card-top"><item.icon size={23}/><ArrowUpRight size={19}/></div><p className="eyebrow">{item.label}</p><h3>{item.title}</h3><p>{item.desc}</p><span className="workspace-card-link">Open workspace <ArrowRight size={16}/></span></Link>)}</div>
        <div className="support-links"><Link href="/counsellor/finance">Financial counselling <ArrowUpRight size={15}/></Link><Link href="/coordination">Inter-agency coordination <ArrowUpRight size={15}/></Link><Link href="/demo">SIH judge demonstration <ArrowUpRight size={15}/></Link></div>
      </section>

      <section className="trust-section"><div><p className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</p><h2>Support, without<br />false promises.</h2><Link href="/help" className="civic-button light"><Headphones size={18}/> Ask for help <ArrowRight size={18}/></Link></div><div className="trust-notes"><article><span>01 / EVIDENCE</span><h3>Skills are a starting point.</h3><p>A skill profile supports an assessment. It does not issue a qualification or guarantee employment.</p></article><article><span>02 / TRANSPARENCY</span><h3>Know what you’re looking at.</h3><p>Demo records, sandbox integrations and unverified service status are labelled. Financial recommendations are drafts, not sanctions.</p></article><article><span>03 / CONNECTIVITY</span><h3>Offline has clear boundaries.</h3><p>The app caches its shell. Selected updates can be queued on this device and explicitly synced from the same account. New submissions need a connection.</p></article></div></section>
    </main>
    <footer className="civic-footer"><div><strong>LIP</strong><span>PM-AJAY Livelihood Intelligence<br />SIH26097 · Demonstration & decision support</span></div><Link href="/help">Assistance & grievances <ArrowUpRight size={16}/></Link><TruthBadge state="LIVE"/></footer>
  </div>;
}
