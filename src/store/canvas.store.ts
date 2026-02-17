import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as canvasService from "@/api/canvas.service";
import type { CanvasMeta } from "@/types/canvas-meta";
import type { CanvasElement } from "@/types/canvas/canvas-element";
import { useAuthStore } from "@/store/auth.store";

export const useCanvasStore = defineStore("canvas", () => {
  const allCanvases = ref<CanvasMeta[]>([]);
  const publicCanvases = ref<CanvasMeta[]>([]);
  const favoriteIds = ref<Set<string>>(new Set());
  const recentIds = ref<string[]>([]);
  const currentCanvas = ref<{ meta: CanvasMeta; elements: CanvasElement[] } | null>(null);

  const myCanvases = computed(() =>
    allCanvases.value.map((c) => ({ ...c, isFavorite: favoriteIds.value.has(c.id) })),
  );
  /** Same canvases as My Canvases, but only those marked favorite */
  const favoriteCanvases = computed(() =>
    myCanvases.value.filter((c) => c.isFavorite),
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
    // Sync favorite state from API so Favorites shows the same list as My Canvases (filtered)
    favoriteIds.value = new Set(
      allCanvases.value.filter((c) => c.isFavorite).map((c) => c.id),
    );
  }

  async function loadPublicCanvases() {
    publicCanvases.value = await canvasService.getPublicCanvases();
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
    currentCanvas.value = null;
    let meta = await canvasService.createCanvas(name);
    const authStore = useAuthStore();
    if (authStore.user?.id) {
      meta = { ...meta, owner: authStore.user.id };
    }
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

  async function deleteCanvas(id: string) {
    await canvasService.deleteCanvas(id);
    allCanvases.value = allCanvases.value.filter((c) => c.id !== id);
    publicCanvases.value = publicCanvases.value.filter((c) => c.id !== id);
    recentIds.value = recentIds.value.filter((rid) => rid !== id);
    if (currentCanvas.value?.meta?.id === id) {
      currentCanvas.value = null;
    }
  }

  return {
    allCanvases,
    publicCanvases,
    favoriteIds,
    recentIds,
    currentCanvas,
    favoriteCanvases,
    myCanvases,
    recentCanvases,
    loadCanvases,
    loadPublicCanvases,
    loadCanvas,
    createCanvas,
    saveCurrentCanvas,
    setCurrentElements,
    setCurrentMeta,
    toggleFavorite,
    clearCurrentCanvas,
    deleteCanvas,
  };
});
