import { api } from "./api-handler";
import type { User } from "@/types/auth";
import type { BackendUser } from "./user-mapping";
import { mapBackendUserToUser } from "./user-mapping";

/** Fetch username by user ID. Returns null on 404. */
export async function getUsernameById(id: number): Promise<string | null> {
  try {
    const result = await api<string | { value?: string; username?: string }>(
      `/api/auth/username/${id}`,
      { method: "GET" }
    );
    if (typeof result === "string" && result.trim().length > 0) return result.trim();
    if (result && typeof result === "object") {
      const name = (result as { value?: string; username?: string }).value
        ?? (result as { value?: string; username?: string }).username;
      if (typeof name === "string" && name.trim().length > 0) return name.trim();
    }
    return null;
  } catch {
    return null;
  }
}

export async function getProfile(): Promise<User> {
  try {
    const raw = await api<BackendUser>("/api/auth/user", { method: "GET" });
    const mapped = mapBackendUserToUser(raw);
    return mapped ?? getMockProfile();
  } catch {
    return getMockProfile();
  }
}

function getMockProfile(): User {
  return {
    id: "demo",
    username: "Demo User",
    email: "demo@example.com",
    bio: "Planning my story.",
  };
}
