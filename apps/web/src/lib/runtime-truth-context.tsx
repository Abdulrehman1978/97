"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TruthState } from "@/components/TruthBadge";

interface RuntimeTruthContextType {
  truthState: TruthState;
  isDemoMode: boolean;
  isOnline: boolean;
  lastChecked: Date | null;
  refreshTruth: () => Promise<void>;
  // Granular capability states
  capabilities: {
    coreApi: TruthState;
    grievance: TruthState;
    callback: TruthState;
    speech: TruthState;
    database: TruthState;
  };
}

const RuntimeTruthContext = createContext<RuntimeTruthContextType>({
  truthState: "UNKNOWN",
  isDemoMode: false,
  isOnline: true,
  lastChecked: null,
  refreshTruth: async () => {},
  capabilities: {
    coreApi: "UNKNOWN",
    grievance: "UNKNOWN",
    callback: "SANDBOX",
    speech: "UNKNOWN",
    database: "UNKNOWN",
  },
});

export function RuntimeTruthProvider({ children }: { children: React.ReactNode }) {
  const [truthState, setTruthState] = useState<TruthState>("UNKNOWN");
  const [speechState, setSpeechState] = useState<TruthState>("UNKNOWN");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    if (typeof window === "undefined") return;

    if (!navigator.onLine) {
      setIsOnline(false);
      setTruthState("OFFLINE");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/health/ready`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        setIsOnline(true);
        setIsDemoMode(data.demo_mode === true);
        // Never infer production truth from a missing or malformed field.
        setTruthState(data.demo_mode === true ? "DEMO_DATA" :
          data.truth_state === "LIVE" && data.database === "ok" ? "LIVE" : "UNKNOWN");
      } else {
        setTruthState("ERROR");
      }
    } catch {
      // If server unreachable or timeout
      if (!navigator.onLine) {
        setTruthState("OFFLINE");
      } else {
        // Local offline / unreachable
        setTruthState("ERROR");
      }
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    setSpeechState("webkitSpeechRecognition" in window || "SpeechRecognition" in window ? "ADAPTER_READY" : "UNKNOWN");
    checkHealth();

    const handleOnline = () => {
      setIsOnline(true);
      checkHealth();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setTruthState("OFFLINE");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodically re-verify runtime truth every 30s
    const interval = setInterval(checkHealth, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const capabilities = {
    coreApi: truthState,
    grievance: truthState,
    callback: "SANDBOX" as TruthState, // Telephony callback simulation is explicitly SANDBOX
    speech: speechState,
    database: truthState,
  };

  return (
    <RuntimeTruthContext.Provider
      value={{
        truthState,
        isDemoMode,
        isOnline,
        lastChecked,
        refreshTruth: checkHealth,
        capabilities,
      }}
    >
      {children}
    </RuntimeTruthContext.Provider>
  );
}

export function useRuntimeTruth() {
  return useContext(RuntimeTruthContext);
}
