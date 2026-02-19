import { API_BASE_URL } from "@/config/api";
import { api, setAccessToken, getAccessToken } from "./api-handler";
import type { Credentials, RegisterPayload, User } from "@/types/auth";

async function postForToken(
  path: string,
  body: unknown,
): Promise<string> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    let detail: string;
    try {
      const json = JSON.parse(text);
      // Try model state errors first: { errors: { Field: [\"msg\"] } }
      if (json.errors && typeof json.errors === "object") {
        const firstKey = Object.keys(json.errors)[0];
        const firstMessages = firstKey ? json.errors[firstKey] : null;
        if (Array.isArray(firstMessages) && firstMessages.length > 0) {
          detail = firstMessages[0];
        } else {
          detail = json.title ?? json.message ?? json.error ?? text;
        }
      } else {
        // Fallback: common fields the backend might use
        detail = json.message ?? json.error ?? json.title ?? text;
      }
    } catch {
      detail = text || response.statusText;
    }
    throw new Error(detail);
  }

  const token = (await response.text()).trim();
  if (!token) {
    throw new Error("Login response did not contain a token.");
  }
  return token;
}

/** Login only via the real API; response body is a bare JWT string. */
export async function login(credentials: Credentials): Promise<void> {
  const token = await postForToken("/api/auth/login", credentials);
  setAccessToken(token);
}

/** Register only via the real API; response body is a bare JWT string. */
export async function register(
  payload: RegisterPayload,
): Promise<void> {
  const token = await postForToken("/api/auth/register", payload);
  setAccessToken(token);
}

export async function logout(): Promise<void> {
  setAccessToken(null);
}

/** Test if the current token is valid. Throws on 401 or other errors. */
export async function testAuth(): Promise<void> {
  await api<unknown>("/api/auth/test", { method: "GET" });
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
