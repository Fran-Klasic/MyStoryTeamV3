import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as authService from "@/api/auth.service";
import { getAccessToken } from "@/api/api-handler";
import type { User } from "@/types/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!getAccessToken() && !!user.value);

  async function login(email: string, password: string) {
    const res = await authService.login({ email, password });
    user.value = res.user;
    return res;
  }

  async function register(username: string, email: string, password: string) {
    const res = await authService.register({ username, email, password });
    user.value = res.user;
    return res;
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
