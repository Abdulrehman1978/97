import { apiFetch, setStoredToken, clearStoredToken, getStoredToken } from "./client";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    full_name: string;
    role: string;
  };
}

export async function login(username: string, password?: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/api/v1/identity/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  if (data?.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function switchDemoRole(role: string): Promise<{
  active_role: string;
  access_token: string;
  permissions_granted: string[];
}> {
  const data = await apiFetch<any>("/api/v1/identity/demo/switch-role", {
    method: "POST",
    body: JSON.stringify({ role })
  });
  if (data?.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export function logout(): void {
  clearStoredToken();
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}
