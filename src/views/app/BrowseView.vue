<script setup lang="ts">
import { onMounted, computed } from "vue";
import DashboardSection from "@/components/dashboard/DashboardSection.vue";
import CanvasCard from "@/components/dashboard/CanvasCard.vue";
import { useCanvasStore } from "@/store/canvas.store";

const canvasStore = useCanvasStore();

onMounted(async () => {
  await canvasStore.loadPublicCanvases();
});

const publicCanvases = computed(() => canvasStore.publicCanvases);
</script>

<template>
  <div class="mst-browse">
    <header class="mst-browse__header">
      <h1 class="mst-browse__title">Browse</h1>
      <p class="mst-browse__subtitle">Explore public canvases shared by the community.</p>
    </header>
    <DashboardSection title="Public Canvases">
      <CanvasCard
        v-for="c in publicCanvases"
        :key="c.id"
        :canvas="c"
        :show-favorite="false"
      />
      <p v-if="publicCanvases.length === 0" class="mst-browse__empty">
        No public canvases yet.
      </p>
    </DashboardSection>
  </div>
</template>

<style scoped>
.mst-browse__header {
  margin-bottom: 2rem;
}
.mst-browse__title {
  margin: 0 0 0.25rem;
  font-size: var(--mst-font-size-xl);
  font-weight: 700;
  color: var(--mst-color-text);
}
.mst-browse__subtitle {
  margin: 0;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-browse__empty {
  grid-column: 1 / -1;
  color: var(--mst-color-text-soft);
  font-size: var(--mst-font-size-sm);
  margin: 0;
  padding: 1rem 0;
}
</style>
