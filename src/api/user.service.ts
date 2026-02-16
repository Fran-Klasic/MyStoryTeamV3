import { api } from "./api-handler";
import type { User } from "@/types/auth";

export type UserStats = {
  completedTasks: number;
  streaks: number;
  timePlannedMinutes: number;
};

export async function getProfile(): Promise<User> {
  try {
    return await api<User>("/user/profile", { method: "GET" });
  } catch {
    return getMockProfile();
  }
}

export async function getStats(): Promise<UserStats> {
  try {
    return await api<UserStats>("/user/stats", { method: "GET" });
  } catch {
    return {
      completedTasks: 42,
      streaks: 7,
      timePlannedMinutes: 1200,
    };
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
