import { api } from "./api-handler";
import type { User } from "@/types/auth";

export async function getProfile(): Promise<User> {
  try {
    return await api<User>("/api/auth/user", { method: "GET" });
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
