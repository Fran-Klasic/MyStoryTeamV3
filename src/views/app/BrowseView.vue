<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import DashboardSection from "@/components/dashboard/DashboardSection.vue";
import CanvasCard from "@/components/dashboard/CanvasCard.vue";
import { useCanvasStore } from "@/store/canvas.store";
import type { CanvasMeta } from "@/types/canvas-meta";

const canvasStore = useCanvasStore();

type SortField = "createdAt" | "updatedAt" | "name";
type SortOrder = "asc" | "desc";

const sortBy = ref<SortField>("updatedAt");
const sortOrder = ref<SortOrder>("desc");

onMounted(async () => {
  await canvasStore.loadPublicCanvases();
});

const publicCanvases = computed(() => {
  const list = [...canvasStore.publicCanvases];
  const field = sortBy.value;
  const asc = sortOrder.value === "asc";

  list.sort((a: CanvasMeta, b: CanvasMeta) => {
    let aVal: string | number;
    let bVal: string | number;

    if (field === "name") {
      aVal = (a.name ?? "").toLowerCase();
      bVal = (b.name ?? "").toLowerCase();
      return asc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    }

    const aDate = field === "createdAt" ? (a.createdAt ?? a.updatedAt ?? "") : (a.updatedAt ?? a.createdAt ?? "");
    const bDate = field === "createdAt" ? (b.createdAt ?? b.updatedAt ?? "") : (b.updatedAt ?? b.createdAt ?? "");
    aVal = new Date(aDate).getTime();
    bVal = new Date(bDate).getTime();

    return asc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  return list;
});
</script>

<template>
  <div class="mst-browse">
    <header class="mst-browse__header">
      <h1 class="mst-browse__title">Browse</h1>
      <p class="mst-browse__subtitle">Explore public canvases shared by the community.</p>
    </header>
    <div class="mst-browse__filters">
      <label class="mst-browse__filter-label">
        <span>Sort by</span>
        <select v-model="sortBy" class="mst-browse__select">
          <option value="createdAt">Created at</option>
          <option value="updatedAt">Updated at</option>
          <option value="name">Name</option>
        </select>
      </label>
      <label class="mst-browse__filter-label">
        <span>Order</span>
        <select v-model="sortOrder" class="mst-browse__select">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
    </div>
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
  margin-bottom: 1rem;
}
.mst-browse__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--mst-radius-md);
  border: 1px solid rgba(58, 167, 196, 0.3);
}
.mst-browse__filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-browse__filter-label span {
  font-weight: 500;
}
.mst-browse__select {
  padding: 0.4rem 0.6rem;
  font-size: var(--mst-font-size-sm);
  border: 1px solid rgba(58, 167, 196, 0.5);
  border-radius: var(--mst-radius-sm);
  background: white;
  color: var(--mst-color-text);
  cursor: pointer;
  outline: none;
}
.mst-browse__select:focus {
  border-color: var(--mst-color-accent);
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
