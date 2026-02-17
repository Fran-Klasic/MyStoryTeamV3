import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as authService from "@/api/auth.service";
import { getAccessToken } from "@/api/api-handler";
import type { User } from "@/types/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);

  // Consider user authenticated when a token is present.
  // User profile is fetched separately and is not required just to enter protected areas.
  const isAuthenticated = computed(() => !!getAccessToken());

  async function login(email: string, password: string) {
    await authService.login({ email, password });
    // Best-effort: try to load user profile, but don't block login on failure.
    try {
      const u = await authService.refreshUser();
      if (u) user.value = u;
    } catch {
      // ignore; token is still set and will be validated by backend on protected calls
    }
    return user.value;
  }

  async function register(
    username: string,
    email: string,
    password: string,
    repeatPassword: string,
  ) {
    await authService.register({ username, email, password, repeatPassword });
    try {
      const u = await authService.refreshUser();
      if (u) user.value = u;
    } catch {
      // ignore; token is still set and will be validated by backend on protected calls
    }
    return user.value;
  }

  function logout() {
    authService.logout();
    user.value = null;
  }

  async function refreshUser() {
    const u = await authService.refreshUser();
    user.value = u;
    return u;
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };
});
