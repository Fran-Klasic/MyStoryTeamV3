<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <section class="mst-dashboard-section">
    <h3 class="mst-dashboard-section__title">{{ title }}</h3>
    <div class="mst-dashboard-section__grid">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.mst-dashboard-section {
  margin-bottom: 2rem;
}
.mst-dashboard-section__title {
  font-size: var(--mst-font-size-lg);
  font-weight: 650;
  color: var(--mst-color-text);
  margin: 0 0 1rem;
}
.mst-dashboard-section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
</style>
