/**
 * Centralized backend API base URL.
 * Set VITE_API_BASE_URL in .env (see .env.example) to https://localhost:7109 for the real backend; when unset, empty string (demo mode).
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
