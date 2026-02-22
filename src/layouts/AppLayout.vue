<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.store";
import { useCanvasStore } from "@/store/canvas.store";
import { useSidebarState } from "@/composables/useSidebarState";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const canvasStore = useCanvasStore();
const { sidebarOpen, isNarrow, toggleSidebar, closeSidebar } = useSidebarState();

const pageTitle = computed(() => {
  const meta = route.meta.title as string | undefined;
  if (meta) return meta;
  if (route.name === "canvas-editor" || route.name === "canvas-new") {
    return canvasStore.currentCanvas?.meta?.name ?? "Canvas";
  }
  return route.meta.section as string ?? "My Story Team";
});

function logout() {
  authStore.logout();
  router.replace("/");
}
</script>

<template>
  <div class="mst-app-layout">
    <div v-if="isNarrow && sidebarOpen" class="mst-app-sidebar-backdrop" @click="closeSidebar" />
    <aside
      class="mst-app-sidebar"
      :class="{
        'mst-app-sidebar--drawer': isNarrow,
        'mst-app-sidebar--drawer-open': isNarrow && sidebarOpen,
      }"
    >
      <div class="mst-app-sidebar__header">
        <span class="mst-app-sidebar__logo">My Story Team</span>
      </div>
      <nav class="mst-app-sidebar__nav">
        <RouterLink to="/app/dashboard" class="mst-app-sidebar__nav-item" @click="closeSidebar">
          Dashboard
        </RouterLink>
        <RouterLink to="/" class="mst-app-sidebar__nav-item" @click="closeSidebar">
          Home
        </RouterLink>
        <RouterLink
          to="/app/profile"
          class="mst-app-sidebar__nav-item"
          title="Profile"
          @click="closeSidebar"
        >
          Profile
        </RouterLink>
        <RouterLink to="/app/browse" class="mst-app-sidebar__nav-item" @click="closeSidebar">
          Browse
        </RouterLink>
        <RouterLink to="/app/messages" class="mst-app-sidebar__nav-item" @click="closeSidebar">
          Messages
        </RouterLink>
        <RouterLink to="/app/ai-helper" class="mst-app-sidebar__nav-item" @click="closeSidebar">
          AI Helper
        </RouterLink>
        <button type="button" class="mst-app-sidebar__nav-item mst-app-sidebar__nav-item--btn" @click="logout">
          Log out
        </button>
      </nav>
    </aside>

    <div class="mst-app-layout__content">
      <header class="mst-app-layout__topbar">
        <button
          v-if="isNarrow"
          type="button"
          class="mst-app-layout__menu-btn"
          aria-label="Open menu"
          @click="toggleSidebar"
        >
          ☰
        </button>
        <h2 class="mst-app-layout__title">
          {{ pageTitle }}
        </h2>
      </header>
      <main class="mst-app-layout__main">
        <RouterView />
      </main>
    </div>
    <p class="mst-attribution">
      Uicons by <a href="https://www.flaticon.com/uicons" target="_blank" rel="noopener noreferrer">Flaticon</a>
    </p>
  </div>
</template>

<style scoped>
.mst-app-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  min-height: 100vh;
  background: radial-gradient(circle at top, #f7fdff 0, var(--mst-color-bg) 55%);
}

.mst-app-sidebar {
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1rem;
  background: linear-gradient(
    180deg,
    var(--mst-color-bg-elevated),
    var(--mst-color-bg-elevated-soft)
  );
  color: var(--mst-color-text-inverse);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
}

.mst-app-sidebar__header {
  margin-bottom: 1.5rem;
}

.mst-app-sidebar__logo {
  display: inline-block;
  font-size: 1rem;
  font-weight: 650;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.mst-app-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.mst-app-sidebar__nav-item {
  padding: 0.6rem 0.8rem;
  border-radius: var(--mst-radius-md);
  color: inherit;
  text-decoration: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition:
    background-color var(--mst-duration-fast) var(--mst-ease-standard),
    transform var(--mst-duration-fast) var(--mst-ease-standard);
}

.mst-app-sidebar__nav-item:hover {
  background-color: rgba(255, 255, 255, 0.06);
  transform: translateX(2px);
}

.mst-app-sidebar__nav-item.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.14);
  font-weight: 600;
  box-shadow: inset 3px 0 0 var(--mst-color-accent);
}

.mst-app-sidebar__user-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mst-app-sidebar__nav-item--btn {
  margin-top: auto;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.mst-app-sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 18;
  background: rgba(0, 0, 0, 0.4);
}

.mst-app-layout__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mst-app-layout__topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.5rem;
  backdrop-filter: blur(16px);
  background: linear-gradient(
    to bottom,
    rgba(214, 247, 255, 0.96),
    rgba(214, 247, 255, 0.75),
    transparent
  );
  border-bottom: 1px solid rgba(58, 167, 196, 0.35);
}

.mst-app-layout__menu-btn {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(58, 167, 196, 0.4);
  border-radius: var(--mst-radius-md);
  background: rgba(255, 255, 255, 0.9);
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mst-app-layout__title {
  font-size: 1.05rem;
  margin: 0;
}

.mst-app-layout__main {
  flex: 1;
  min-height: 0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.mst-app-sidebar--drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 20;
  width: 260px;
  transform: translateX(-100%);
  transition: transform var(--mst-duration) var(--mst-ease-standard);
}

.mst-app-sidebar--drawer-open {
  transform: translateX(0);
}

.mst-attribution {
  position: fixed;
  bottom: 0.5rem;
  right: 0.75rem;
  margin: 0;
  font-size: 0.7rem;
  color: var(--mst-color-text-soft);
  z-index: 5;
}
.mst-attribution a {
  color: inherit;
  text-decoration: underline;
}
.mst-attribution a:hover {
  color: var(--mst-color-text);
}

@media (max-width: 900px) {
  .mst-app-layout {
    grid-template-columns: 1fr;
  }
}
</style>

