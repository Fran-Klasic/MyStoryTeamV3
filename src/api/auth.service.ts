import { getApiBaseUrl } from "@/config/api";
import { api, setAccessToken, getAccessToken } from "./api-handler";
import type { AuthResponse, Credentials, RegisterPayload, User } from "@/types/auth";

const DEMO_TOKEN = "demo-access-token";

function demoUser(email: string): AuthResponse {
  const id = "demo-" + Math.random().toString(36).slice(2, 9);
  return {
    accessToken: DEMO_TOKEN,
    user: {
      id,
      username: email.split("@")[0] || "User",
      email,
    },
  };
}

export async function login(credentials: Credentials): Promise<AuthResponse> {
  try {
    const res = await api<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: credentials,
    });
    setAccessToken(res.accessToken);
    return res;
  } catch (err) {
    if (!getApiBaseUrl()) {
      const res = demoUser(credentials.email);
      setAccessToken(res.accessToken);
      return res;
    }
    throw err;
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const res = await api<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: payload,
    });
    setAccessToken(res.accessToken);
    return res;
  } catch (err) {
    if (!getApiBaseUrl()) {
      const res = demoUser(payload.email);
      setAccessToken(res.accessToken);
      return res;
    }
    throw err;
  }
}

export async function logout(): Promise<void> {
  setAccessToken(null);
}

export async function refreshUser(): Promise<User | null> {
  const token = getAccessToken();
  if (token === DEMO_TOKEN) {
    return { id: "demo", username: "Demo User", email: "demo@example.com" };
  }
  try {
    const user = await api<User>("/api/auth/user", { method: "GET" });
    return user;
  } catch {
    setAccessToken(null);
    return null;
  }
}

export function isDemoToken(): boolean {
  return getAccessToken() === DEMO_TOKEN;
}
