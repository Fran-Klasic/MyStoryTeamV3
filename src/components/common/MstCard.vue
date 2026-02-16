<script setup lang="ts">
</script>

<template>
  <section class="mst-card">
    <slot />
  </section>
</template>

<style scoped>
.mst-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: var(--mst-radius-lg);
  border: 1px solid rgba(58, 167, 196, 0.4);
  box-shadow: var(--mst-shadow-soft);
  padding: 1.25rem 1.5rem;
}
</style>

