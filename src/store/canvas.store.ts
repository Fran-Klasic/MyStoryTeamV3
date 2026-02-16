import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as canvasService from "@/api/canvas.service";
import type { CanvasMeta } from "@/types/canvas-meta";
import type { CanvasElement } from "@/types/canvas/canvas-element";

export const useCanvasStore = defineStore("canvas", () => {
  const allCanvases = ref<CanvasMeta[]>([]);
  const favoriteIds = ref<Set<string>>(new Set(["c-demo-1", "c-demo-3"]));
  const recentIds = ref<string[]>(["c-demo-1", "c-demo-2", "c-demo-3"]);
  const currentCanvas = ref<{ meta: CanvasMeta; elements: CanvasElement[] } | null>(null);

  const favoriteCanvases = computed(() =>
    allCanvases.value
      .filter((c) => favoriteIds.value.has(c.id))
      .map((c) => ({ ...c, isFavorite: true })),
  );
  const myCanvases = computed(() =>
    allCanvases.value.map((c) => ({ ...c, isFavorite: favoriteIds.value.has(c.id) })),
  );
  const recentCanvases = computed(() => {
    const byId = new Map(allCanvases.value.map((c) => [c.id, c]));
    return recentIds.value
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((c) => ({ ...c!, isFavorite: favoriteIds.value.has(c!.id) })) as CanvasMeta[];
  });

  async function loadCanvases() {
    allCanvases.value = await canvasService.getCanvases();
  }

  async function loadCanvas(id: string) {
    const data = await canvasService.getCanvas(id);
    if (data) {
      currentCanvas.value = data;
      if (!recentIds.value.includes(id)) {
        recentIds.value = [id, ...recentIds.value.slice(0, 9)];
      }
    }
    return data;
  }

  async function createCanvas(name: string) {
    const meta = await canvasService.createCanvas(name);
    allCanvases.value = [meta, ...allCanvases.value];
    currentCanvas.value = { meta, elements: [] };
    return meta;
  }

  async function saveCurrentCanvas() {
    if (!currentCanvas.value) return;
    const { meta, elements } = currentCanvas.value;
    const updated = await canvasService.saveCanvas(meta.id, meta, elements);
    const idx = allCanvases.value.findIndex((c) => c.id === meta.id);
    if (idx >= 0) allCanvases.value[idx] = { ...allCanvases.value[idx], ...updated };
    currentCanvas.value = { ...currentCanvas.value, meta: { ...meta, ...updated } };
  }

  function setCurrentElements(elements: CanvasElement[]) {
    if (currentCanvas.value) {
      currentCanvas.value = { ...currentCanvas.value, elements };
    }
  }

  function setCurrentMeta(meta: Partial<CanvasMeta>) {
    if (currentCanvas.value) {
      currentCanvas.value = { ...currentCanvas.value, meta: { ...currentCanvas.value.meta, ...meta } };
    }
  }

  function toggleFavorite(id: string) {
    const next = new Set(favoriteIds.value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    favoriteIds.value = next;
  }

  function clearCurrentCanvas() {
    currentCanvas.value = null;
  }

  return {
    allCanvases,
    favoriteIds,
    recentIds,
    currentCanvas,
    favoriteCanvases,
    myCanvases,
    recentCanvases,
    loadCanvases,
    loadCanvas,
    createCanvas,
    saveCurrentCanvas,
    setCurrentElements,
    setCurrentMeta,
    toggleFavorite,
    clearCurrentCanvas,
  };
});
