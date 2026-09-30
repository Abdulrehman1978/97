import React from "react";

export type TruthState = "LIVE" | "SANDBOX" | "ADAPTER_READY" | "DEMO_DATA";

interface TruthBadgeProps {
  state: TruthState | string;
  className?: string;
}

export function TruthBadge({ state, className = "" }: TruthBadgeProps) {
  const styles: Record<string, string> = {
    LIVE: "bg-emerald-100 text-emerald-800 border-emerald-300",
    SANDBOX: "bg-sky-100 text-sky-800 border-sky-300",
    ADAPTER_READY: "bg-amber-100 text-amber-800 border-amber-300",
    DEMO_DATA: "bg-slate-100 text-slate-700 border-slate-300",
  };

  const labels: Record<string, string> = {
    LIVE: "● Verified Live",
    SANDBOX: "◌ Sandbox",
    ADAPTER_READY: "⚙ Adapter Ready",
    DEMO_DATA: "✦ Demo / Reference",
  };

  const currentStyle = styles[state] || styles.LIVE;
  const currentLabel = labels[state] || state;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${currentStyle} ${className}`}
      title={`Truth State: ${state}`}
    >
      {currentLabel}
    </span>
  );
}
