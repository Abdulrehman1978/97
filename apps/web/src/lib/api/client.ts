import { ApiError, NetworkError, AuthError } from "./errors";
import { enqueueMutation, QueuedMutation } from "./offlineQueue";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOKEN_KEY = "lip_auth_token_v1";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.warn("Failed to save auth token in localStorage", e);
  }
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("lip_beneficiary_id");
    localStorage.removeItem("lip_beneficiary_id_state");
  } catch (e) {
    console.warn("Failed to clear auth token", e);
  }
}

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
  offlineOperation?: QueuedMutation["operation"];
  offlinePayload?: any;
}

export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const timeoutMs = options.timeoutMs || 12000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.status === 401) {
      clearStoredToken();
      const err = await res.json().catch(() => ({ detail: "Unauthorized" }));
      throw new AuthError(err.detail || "Authentication required");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new ApiError(err.detail || "API request failed", res.status, err);
    }

    return await res.json();
  } catch (error: any) {
    clearTimeout(timeoutId);

    const isNetworkOrAbort =
      error.name === "AbortError" ||
      error.name === "TypeError" ||
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("NetworkError");

    if (isNetworkOrAbort) {
      // If an offline-capable mutation was requested, queue it instead of failing silently
      // Only state-setting PUTs are safe to replay without server idempotency keys.
      // POST outcomes are ambiguous after a timeout and must not be duplicated.
      if (options.offlineOperation && options.method === "PUT" && getStoredToken()) {
        const payload = options.offlinePayload || (options.body ? JSON.parse(options.body as string) : {});
        const queued = enqueueMutation(options.offlineOperation, endpoint, options.method, payload);
        return {
          status: "offline_queued",
          client_mutation_id: queued.client_mutation_id,
          message: "Network unavailable. Queued on this device — not yet committed to the server.",
          is_offline: true
        } as unknown as T;
      }

      throw new NetworkError(`Server at ${API_BASE} is currently unreachable. Check connection.`);
    }

    throw error;
  }
}
