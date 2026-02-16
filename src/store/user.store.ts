import { defineStore } from "pinia";
import { ref } from "vue";
import * as userService from "@/api/user.service";
import type { User } from "@/types/auth";
import type { UserStats } from "@/api/user.service";

export const useUserStore = defineStore("user", () => {
  const profile = ref<User | null>(null);
  const stats = ref<UserStats | null>(null);

  async function loadProfile() {
    profile.value = await userService.getProfile();
    return profile.value;
  }

  async function loadStats() {
    stats.value = await userService.getStats();
    return stats.value;
  }

  return {
    profile,
    stats,
    loadProfile,
    loadStats,
  };
});
