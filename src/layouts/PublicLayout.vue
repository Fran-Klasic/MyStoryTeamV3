<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="mst-shell mst-shell--column">
    <header class="mst-public-header">
      <div class="mst-public-header__inner">
        <RouterLink to="/" class="mst-public-header__brand">
          <span class="mst-public-header__title">My Story Team</span>
          <span class="mst-public-header__subtitle"
            >Cinematic Planner &amp; Helper</span
          >
        </RouterLink>
        <nav class="mst-public-header__nav">
          <RouterLink to="/" class="mst-public-header__nav-link"
            >Overview</RouterLink
          >
          <RouterLink :to="{ path: '/', hash: '#about' }" class="mst-public-header__nav-link">About</RouterLink>
          <RouterLink to="/discover" class="mst-public-header__nav-link"
            >Discover</RouterLink
          >
          <RouterLink to="/walkthrough" class="mst-public-header__nav-link"
            >Walkthrough</RouterLink
          >
          <RouterLink to="/demonstrations" class="mst-public-header__nav-link"
            >Demonstrations</RouterLink
          >
          <RouterLink
            to="/auth/sign-in"
            class="mst-public-header__nav-link mst-public-header__nav-link--accent"
          >
            Sign in
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="mst-main-container">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.mst-shell--column {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-y: auto;
}
.mst-main-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.mst-public-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(16px);
  background: linear-gradient(
    to bottom,
    rgba(214, 247, 255, 0.96),
    rgba(214, 247, 255, 0.8),
    transparent
  );
  border-bottom: 1px solid rgba(58, 167, 196, 0.35);
}

.mst-public-header__inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.mst-public-header__brand {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.mst-public-header__title {
  font-size: 1.1rem;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mst-color-text);
}

.mst-public-header__subtitle {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--mst-color-text-soft);
}

.mst-public-header__nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.mst-public-header__nav-link {
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 1px solid transparent;
  color: var(--mst-color-text-soft);
  transition:
    background-color var(--mst-duration-fast) var(--mst-ease-standard),
    border-color var(--mst-duration-fast) var(--mst-ease-standard),
    color var(--mst-duration-fast) var(--mst-ease-standard),
    transform var(--mst-duration-fast) var(--mst-ease-standard);
}

.mst-public-header__nav-link:hover {
  background-color: rgba(255, 255, 255, 0.8);
  border-color: rgba(31, 41, 55, 0.12);
  transform: translateY(-1px);
}

.mst-public-header__nav-link--accent {
  border-color: var(--mst-color-surface-border);
  color: var(--mst-color-bg-elevated);
  background-color: var(--mst-color-accent-soft);
}

.mst-public-header__nav-link--accent:hover {
  box-shadow: var(--mst-shadow-glow);
}

@media (max-width: 768px) {
  .mst-public-header__inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .mst-public-header__nav {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>
