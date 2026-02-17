import { defineStore } from "pinia";
import { ref } from "vue";
import * as userService from "@/api/user.service";
import type { User } from "@/types/auth";

export const useUserStore = defineStore("user", () => {
  const profile = ref<User | null>(null);

  async function loadProfile() {
    profile.value = await userService.getProfile();
    return profile.value;
  }

  return {
    profile,
    loadProfile,
  };
});
