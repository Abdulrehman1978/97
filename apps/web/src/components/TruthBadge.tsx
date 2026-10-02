import React from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Lock, Sparkles, ShieldCheck } from "lucide-react";

export type TruthState =
  | "LIVE"
  | "DEMO_DATA"
  | "SANDBOX"
  | "OFFLINE_QUEUED"
  | "ADAPTER_READY"
  | "UNKNOWN"
  | "UNVERIFIED"
  | "DRAFT"
  | "SAVED"
  | "ERROR"
  | "FORBIDDEN";

interface TruthBadgeProps {
  state: TruthState | string;
  className?: string;
  compact?: boolean;
}

export function TruthBadge({ state, className = "", compact = false }: TruthBadgeProps) {
  const normalized = (state || "UNKNOWN").toUpperCase();

  switch (normalized) {
    case "LIVE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] font-label-sm text-label-sm font-bold shadow-xs ${className}`}
          title="Verified Live Production Node"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
          <span>{compact ? "LIVE" : "Verified Live"}</span>
        </span>
      );

    case "DEMO_DATA":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold tracking-wider uppercase shadow-xs ${className}`}
          title="Synthetic Scenario / Demo Reference"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span>{compact ? "DEMO" : "DEMO_DATA"}</span>
        </span>
      );

    case "SANDBOX":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container text-primary border border-outline-variant font-label-sm text-label-sm font-semibold ${className}`}
          title="Isolated Sandbox Environment"
        >
          <Sparkles className="w-3 h-3 text-secondary" />
          <span>SANDBOX</span>
        </span>
      );

    case "OFFLINE_QUEUED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary border border-secondary-container font-label-sm text-label-sm font-bold ${className}`}
          title="Queued locally on device, pending cloud synchronization"
        >
          <RefreshCw className="w-3 h-3 animate-spin text-secondary" />
          <span>{compact ? "QUEUED" : "OFFLINE QUEUED"}</span>
        </span>
      );

    case "SAVED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold ${className}`}
          title="Successfully Persisted in PostgreSQL"
        >
          <CheckCircle2 className="w-3 h-3 text-on-tertiary-container" />
          <span>SAVED</span>
        </span>
      );

    case "DRAFT":
    case "UNVERIFIED":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm ${className}`}
          title="Draft / Unverified User Self-Report"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-outline" />
          <span>{normalized}</span>
        </span>
      );

    case "ADAPTER_READY":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm ${className}`}
          title="Adapter Ready"
        >
          <ShieldCheck className="w-3 h-3 text-secondary" />
          <span>ADAPTER_READY</span>
        </span>
      );

    case "ERROR":
    case "FORBIDDEN":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold ${className}`}
          title={normalized === "FORBIDDEN" ? "Access Denied" : "System Error"}
        >
          {normalized === "FORBIDDEN" ? <Lock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          <span>{normalized}</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm ${className}`}
        >
          <span>{state}</span>
        </span>
      );
  }
}
