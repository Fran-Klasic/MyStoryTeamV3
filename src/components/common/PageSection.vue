<script setup lang="ts">
import { useRevealOnScroll } from "@/composables/useRevealOnScroll";

useRevealOnScroll();

defineProps<{
  title?: string;
  id?: string;
}>();
</script>

<template>
  <section
    :id="id"
    data-mst-reveal
    class="mst-page-section"
  >
    <header v-if="title" class="mst-page-section__header">
      <h2>{{ title }}</h2>
    </header>
    <div class="mst-page-section__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.mst-page-section {
  margin-bottom: 2.5rem;
}

.mst-page-section__header {
  margin-bottom: 0.9rem;
  padding-left: 0.9rem;
  border-left: 3px solid var(--mst-color-surface-border);
}
</style>

