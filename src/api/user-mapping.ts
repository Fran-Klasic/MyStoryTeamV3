import type { User } from "@/types/auth";

export type BackendUser = {
  ID_User?: number;
  iD_User?: number;
  Username?: string;
  username?: string;
  Email?: string;
  email?: string;
  Bio?: string;
  bio?: string;
};

export function mapBackendUserToUser(
  raw: BackendUser | null | undefined,
): User | null {
  if (!raw) return null;
  const id = raw.ID_User ?? raw.iD_User;
  if (id == null) return null;
  return {
    id: String(id),
    username: (raw.Username ?? raw.username ?? "").trim() || "User",
    email: (raw.Email ?? raw.email ?? "").trim() || "",
    bio: (raw.Bio ?? raw.bio ?? "").trim() || undefined,
  };
}
