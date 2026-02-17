/**
 * Centralized backend API base URL.
 * Override with VITE_API_BASE_URL in .env (see .env.example). Defaults to the dev backend so login hits the API.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://localhost:7109";

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
