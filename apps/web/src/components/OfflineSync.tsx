"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/api/auth-context";
import { apiFetch } from "@/lib/api/client";
import { currentUserQueuedCount, flushOfflineQueue } from "@/lib/api/offlineQueue";

export function OfflineSync() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const update = () => setCount(currentUserQueuedCount());
    update();
    window.addEventListener("lip_offline_mutation_enqueued", update);
    window.addEventListener("lip_offline_mutation_flushed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("lip_offline_mutation_enqueued", update);
      window.removeEventListener("lip_offline_mutation_flushed", update);
      window.removeEventListener("storage", update);
    };
  }, [user]);
  if (!user || (!count && !notice)) return null;
  return <aside aria-label="Offline changes" className="fixed bottom-24 right-4 z-40 max-w-[calc(100%-2rem)] rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-lg text-sm text-amber-950"><p role="status">{notice || `${count} changes are queued for this account, not yet saved to the server.`}</p>{count > 0 && <button disabled={busy} className="mt-2 font-bold underline" onClick={async () => {
    setBusy(true); setNotice("");
    try { const result = await flushOfflineQueue(apiFetch); setNotice(`${result.succeeded} saved; ${result.failed} failed. Refresh this page after sync to see server-confirmed progress.`); }
    catch { setNotice("Sync failed. Your queued changes are still on this device."); }
    finally { setBusy(false); }
  }}>{busy ? "Syncing…" : "Sync my changes"}</button>}</aside>;
}
