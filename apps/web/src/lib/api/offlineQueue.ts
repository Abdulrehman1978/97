// Scoped Offline Mutation Queue (Section 41 of Master Build Spec)

export interface QueuedMutation {
  client_mutation_id: string;
  created_at: string;
  operation: "profile_update" | "select_pathway" | "action_update" | "file_grievance" | "counsellor_override";
  endpoint: string;
  method: string;
  payload: any;
  retry_count: number;
  status: "queued" | "syncing" | "synced" | "failed";
  last_error?: string;
}

const STORAGE_KEY = "lip_offline_mutations_v1";

export function getQueuedMutations(): QueuedMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Legacy entries are retained for recovery, never replayed under a different
// login. Server-side idempotency and owner scoping are required before enabling
// mutation replay again.
export function enqueueMutation(): never {
  throw new Error("Connection required. Offline mutation replay is not supported.");
}

export async function flushOfflineQueue(): Promise<{
  processed: number; succeeded: number; failed: number;
}> {
  return { processed: 0, succeeded: 0, failed: getQueuedMutations().length };
}
