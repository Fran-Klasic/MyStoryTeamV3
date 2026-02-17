import { api, setAccessToken, getAccessToken } from "./api-handler";
import type { AuthResponse, Credentials, RegisterPayload, User } from "@/types/auth";

/** Login only via the real API; no demo or workaround. */
export async function login(credentials: Credentials): Promise<AuthResponse> {
  const res = await api<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: credentials,
  });
  setAccessToken(res.accessToken);
  return res;
}

/** Register only via the real API; no demo or workaround. */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await api<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
  setAccessToken(res.accessToken);
  return res;
}

export async function logout(): Promise<void> {
  setAccessToken(null);
}

/** Validate token with API; clear and return null on 401/invalid. */
export async function refreshUser(): Promise<User | null> {
  if (!getAccessToken()) return null;
  try {
    const user = await api<User>("/api/auth/user", { method: "GET" });
    return user;
  } catch {
    setAccessToken(null);
    return null;
  }
}
