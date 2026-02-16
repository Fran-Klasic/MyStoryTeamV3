import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/store/auth.store";
import { getAccessToken } from "@/api/api-handler";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/PublicLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/views/public/HomeView.vue"),
      },
      {
        path: "discover",
        name: "discover",
        component: () => import("@/views/public/DiscoverView.vue"),
      },
      {
        path: "walkthrough",
        name: "walkthrough",
        component: () => import("@/views/public/WalkthroughView.vue"),
      },
      {
        path: "demonstrations",
        name: "demonstrations",
        component: () => import("@/views/public/DemonstrationsView.vue"),
      },
      {
        path: "auth/sign-in",
        name: "sign-in",
        component: () => import("@/views/auth/SignInView.vue"),
      },
      {
        path: "auth/register",
        name: "register",
        component: () => import("@/views/auth/RegisterView.vue"),
      },
    ],
  },
  {
    path: "/app",
    component: () => import("@/layouts/AppLayout.vue"),
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/views/app/DashboardView.vue"),
        meta: { requiresAuth: true, title: "Dashboard", section: "Dashboard" },
      },
      {
        path: "browse",
        name: "browse",
        component: () => import("@/views/app/BrowseView.vue"),
        meta: { requiresAuth: true, title: "Browse", section: "Browse" },
      },
      {
        path: "messages",
        name: "messages",
        component: () => import("@/views/app/MessagesView.vue"),
        meta: { requiresAuth: true, title: "Messages", section: "Messages" },
      },
      {
        path: "ai-helper",
        name: "ai-helper",
        component: () => import("@/views/app/AiHelperView.vue"),
        meta: { requiresAuth: true, title: "AI Helper", section: "AI Helper" },
      },
      {
        path: "profile",
        name: "profile",
        component: () => import("@/views/app/ProfileView.vue"),
        meta: { requiresAuth: true, title: "Profile", section: "Profile" },
      },
      {
        path: "canvas/new",
        name: "canvas-new",
        component: () => import("@/views/app/CanvasEditorView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "canvas/:id",
        name: "canvas-editor",
        component: () => import("@/views/app/CanvasEditorView.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    }
    return { top: 0, behavior: "smooth" };
  },
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  if (getAccessToken() && !authStore.user) {
    await authStore.refreshUser();
  }
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: "/auth/sign-in", query: { redirect: to.fullPath } };
  }
  if (to.path.startsWith("/auth/") && authStore.isAuthenticated) {
    return { path: "/app/dashboard" };
  }
});

export default router;

