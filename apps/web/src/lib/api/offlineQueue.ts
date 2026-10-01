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

export function enqueueMutation(
  operation: QueuedMutation["operation"],
  endpoint: string,
  method: string,
  payload: any
): QueuedMutation {
  const mutation: QueuedMutation = {
    client_mutation_id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    created_at: new Date().toISOString(),
    operation,
    endpoint,
    method,
    payload,
    retry_count: 0,
    status: "queued"
  };

  if (typeof window !== "undefined") {
    const list = getQueuedMutations();
    list.push(mutation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("lip_offline_mutation_enqueued"));
  }

  return mutation;
}

export async function flushOfflineQueue(apiFetchFn: (endpoint: string, options?: any) => Promise<any>): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  if (typeof window === "undefined") return { processed: 0, succeeded: 0, failed: 0 };
  const queue = getQueuedMutations();
  if (queue.length === 0) return { processed: 0, succeeded: 0, failed: 0 };

  const remaining: QueuedMutation[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const item of queue) {
    if (item.status === "synced") continue;
    try {
      await apiFetchFn(item.endpoint, {
        method: item.method,
        body: JSON.stringify(item.payload),
        headers: { "X-Client-Mutation-ID": item.client_mutation_id }
      });
      succeeded++;
    } catch (err: any) {
      item.retry_count += 1;
      item.last_error = err.message || "Sync failed";
      if (item.retry_count < 5) {
        remaining.push(item);
      } else {
        item.status = "failed";
        remaining.push(item);
      }
      failed++;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  window.dispatchEvent(new Event("lip_offline_mutation_flushed"));
  return { processed: queue.length, succeeded, failed };
}
