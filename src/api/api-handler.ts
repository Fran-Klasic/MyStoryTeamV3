import { API_BASE_URL } from "@/config/api";

const TOKEN_KEY = "mst_access_token";

let accessToken: string | null = (() => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
})();

export function setAccessToken(token: string | null) {
  accessToken = token;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

type OnUnauthorizedCallback = () => void;
let onUnauthorized: OnUnauthorizedCallback | null = null;

/** Register a callback to run when any API request returns 401. Used to logout and redirect. */
export function registerOnUnauthorized(callback: OnUnauthorizedCallback) {
  onUnauthorized = callback;
}

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: optHeaders, ...init } = options;
  const headers = new Headers(optHeaders as HeadersInit);
  if (body !== undefined && body !== null) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...init,
    headers,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    if (response.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    const text = await response.text();
    let detail: string;
    try {
      const json = JSON.parse(text);
      detail = json.message ?? json.error ?? text;
    } catch {
      detail = text || response.statusText;
    }
    throw new Error(detail);
  }
  const contentType = response.headers.get("Content-Type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  // Handle text/plain or other non-JSON responses (e.g. ASP.NET returning raw string)
  const text = await response.text();
  if (text != null && text.trim()) {
    const trimmed = text.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return JSON.parse(text) as T;
      } catch {
        return trimmed as unknown as T;
      }
    }
    return trimmed as unknown as T;
  }
  return undefined as unknown as T;
}
