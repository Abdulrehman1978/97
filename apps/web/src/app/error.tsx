"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowLeft, Home, HelpCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error reference internally, never exposing stack traces to user
    console.error("[LIP Application Error]", error.message || "Unknown error boundary capture");
  }, [error]);

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 py-12 text-on-surface">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-error-container/20 text-error flex items-center justify-center mx-auto ring-8 ring-error-container/10">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant border border-outline-variant/40">
            <span>System Notice</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
            Something went wrong
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            The page encountered an unexpected issue while loading data. No data has been lost. You can try refreshing the view or navigating back.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary font-medium hover:bg-primary/90 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = "/";
              }
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-medium transition-colors border border-outline-variant/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-center gap-6 text-xs text-on-surface-variant">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Platform Home</span>
          </Link>
          <span className="text-outline-variant/40">•</span>
          <Link href="/help" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support & Help Desk</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
