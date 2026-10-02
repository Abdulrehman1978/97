"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api/client";

const RuntimeTruth = createContext("UNKNOWN");
export function RuntimeTruthProvider({ children }: { children: React.ReactNode }) {
  const [truth, setTruth] = useState("UNKNOWN");
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch(`${API_BASE}/health/ready`, { signal: controller.signal, cache: "no-store" })
      .then(response => { if (!response.ok) throw new Error("Not ready"); return response.json(); })
      .then(data => setTruth(data.demo_mode ? "DEMO_DATA" : data.truth_state === "LIVE" ? "LIVE" : "UNKNOWN"))
      .catch(() => setTruth("UNKNOWN"))
      .finally(() => clearTimeout(timeout));
    return () => { controller.abort(); clearTimeout(timeout); };
  }, []);
  return <RuntimeTruth.Provider value={truth}>{children}</RuntimeTruth.Provider>;
}
export const useRuntimeTruth = () => useContext(RuntimeTruth);
