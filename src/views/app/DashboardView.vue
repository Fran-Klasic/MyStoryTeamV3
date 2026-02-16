<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import DashboardSection from "@/components/dashboard/DashboardSection.vue";
import CanvasCard from "@/components/dashboard/CanvasCard.vue";
import MstButton from "@/components/common/MstButton.vue";
import { useCanvasStore } from "@/store/canvas.store";

const router = useRouter();
const canvasStore = useCanvasStore();

onMounted(async () => {
  await canvasStore.loadCanvases();
});

function handleCreateCanvas() {
  router.push({ name: "canvas-new" });
}

function handleToggleFavorite(id: string) {
  canvasStore.toggleFavorite(id);
}
</script>

<template>
  <div class="mst-dashboard">
    <header class="mst-dashboard__header">
      <h1 class="mst-dashboard__title">Dashboard</h1>
      <MstButton variant="primary" @click="handleCreateCanvas">Create Canvas</MstButton>
    </header>

    <DashboardSection title="Favorites">
      <CanvasCard
        v-for="c in canvasStore.favoriteCanvases"
        :key="c.id"
        :canvas="c"
        @toggle-favorite="handleToggleFavorite"
      />
      <p v-if="canvasStore.favoriteCanvases.length === 0" class="mst-dashboard__empty">
        No favorites yet. Open a canvas and star it.
      </p>
    </DashboardSection>

    <DashboardSection title="My Canvases">
      <CanvasCard
        v-for="c in canvasStore.myCanvases"
        :key="c.id"
        :canvas="c"
        @toggle-favorite="handleToggleFavorite"
      />
      <p v-if="canvasStore.myCanvases.length === 0" class="mst-dashboard__empty">
        No canvases yet. Create one to get started.
      </p>
    </DashboardSection>

    <DashboardSection title="Recent">
      <CanvasCard
        v-for="c in canvasStore.recentCanvases"
        :key="c.id"
        :canvas="c"
        @toggle-favorite="handleToggleFavorite"
      />
      <p v-if="canvasStore.recentCanvases.length === 0" class="mst-dashboard__empty">
        No recent canvases.
      </p>
    </DashboardSection>
  </div>
</template>

<style scoped>
.mst-dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}
.mst-dashboard__title {
  margin: 0;
  font-size: var(--mst-font-size-xl);
  font-weight: 700;
  color: var(--mst-color-text);
}
.mst-dashboard__empty {
  grid-column: 1 / -1;
  color: var(--mst-color-text-soft);
  font-size: var(--mst-font-size-sm);
  margin: 0;
  padding: 1rem 0;
}
</style>
