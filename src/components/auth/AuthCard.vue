<script setup lang="ts"></script>

<template>
  <div class="mst-auth-card">
    <div class="mst-auth-card__glow" />
    <section class="mst-auth-card__inner">
      <slot />
    </section>
  </div>
</template>

<style scoped>
.mst-auth-card {
  position: relative;
  min-width: 35vw;
  margin: 0 auto;
}
.mst-auth-card__glow {
  position: absolute;
  inset: -2px;
  border-radius: var(--mst-radius-lg);
  background: linear-gradient(
    135deg,
    var(--mst-color-accent),
    var(--mst-color-surface-border),
    var(--mst-color-accent)
  );
  opacity: 0.4;
  filter: blur(12px);
  z-index: 0;
}
.mst-auth-card__inner {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.98);
  border-radius: var(--mst-radius-lg);
  border: 1px solid rgba(58, 167, 196, 0.5);
  box-shadow:
    var(--mst-shadow-soft),
    0 0 40px rgba(68, 211, 255, 0.15);
  padding: 2rem 2rem 2.25rem;
}
</style>
