import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as authService from "@/api/auth.service";
import { getAccessToken } from "@/api/api-handler";
import type { User } from "@/types/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  // Keep token in store so isAuthenticated is reactive; sync with api-handler
  const token = ref<string | null>(getAccessToken());

  const isAuthenticated = computed(() => !!token.value);

  async function login(email: string, password: string) {
    await authService.login({ email, password });
    token.value = getAccessToken();
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
    token.value = getAccessToken();
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
    token.value = null;
    user.value = null;
  }

  async function refreshUser() {
    const u = await authService.refreshUser();
    user.value = u;
    token.value = getAccessToken();
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
