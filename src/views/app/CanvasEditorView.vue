<script setup lang="ts">
import { onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import CanvasViewport from "@/components/canvas/CanvasViewport.vue";
import CanvasToolbar from "@/components/canvas/CanvasToolbar.vue";
import CanvasOptionsPanel from "@/components/canvas/CanvasOptionsPanel.vue";
import type { CanvasElement } from "@/types/canvas/canvas-element";
import { useCanvasStore } from "@/store/canvas.store";
import { useCanvasElements } from "@/composables/useCanvasElements";

const route = useRoute();
const router = useRouter();
const canvasStore = useCanvasStore();

const id = computed(() => route.params.id as string);
const isNew = computed(() => id.value === "new");

const { elements, updatePosition, updateSize, updateText, updateList, updateTask, updateImage, updateAudio, updateVideo, updateDate, removeElement, addConnection, addElement } = useCanvasElements([]);

const currentMeta = computed(() => canvasStore.currentCanvas?.meta ?? null);

async function loadCurrentCanvas() {
  const currentId = id.value;
  if (!currentId || currentId === "new") return;
  const data = await canvasStore.loadCanvas(currentId);
  if (!data) {
    await router.replace({ name: "dashboard" });
    return;
  }
  elements.value = [...data.elements];
}

watch(id, loadCurrentCanvas, { immediate: true });

onMounted(async () => {
  if (isNew.value) {
    const meta = await canvasStore.createCanvas("Untitled");
    await router.replace({ name: "canvas-editor", params: { id: meta.id } });
    return;
  }
});

watch(
  elements,
  (el) => {
    canvasStore.setCurrentElements([...el]);
  },
  { deep: true },
);

function handleMove(payload: { id: string; x: number; y: number }) {
  const existing = elements.value.find((e) => e.id === payload.id);
  if (!existing) return;
  updatePosition(payload.id, { ...existing.position, x: payload.x, y: payload.y });
}

function handleResize(payload: { id: string; width: number; height: number }) {
  const existing = elements.value.find((e) => e.id === payload.id);
  if (!existing) return;
  updateSize(payload.id, { ...existing.size, x: payload.width, y: payload.height });
}

function handleEdit(payload: { id: string; text: string }) {
  updateText(payload.id, payload.text);
}
function handleEditList(payload: { id: string; listData: string[] }) {
  updateList(payload.id, payload.listData);
}
function handleEditTask(payload: { id: string; data: string; checked: boolean }) {
  updateTask(payload.id, payload.data, payload.checked);
}
function handleEditImage(payload: { id: string; base64File: string }) {
  updateImage(payload.id, payload.base64File);
}
function handleEditAudio(payload: { id: string; base64File: string }) {
  updateAudio(payload.id, payload.base64File);
}
function handleEditVideo(payload: { id: string; url: string }) {
  updateVideo(payload.id, payload.url);
}
function handleEditDate(payload: { id: string; date: string; data: string }) {
  updateDate(payload.id, payload.date, payload.data);
}
function handleDelete(id: string) {
  removeElement(id);
}
function handleConnect(payload: { self: string; target: string }) {
  addConnection(payload.self, payload.target);
}
function handleAdd(payload: { type: CanvasElement["type"]; x: number; y: number }) {
  addElement(payload.type, payload.x, payload.y);
}

function handleUpdateMeta(meta: Partial<{ name: string; isFavorite: boolean; isPublic: boolean }>) {
  canvasStore.setCurrentMeta(meta);
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
watch(
  elements,
  () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      canvasStore.saveCurrentCanvas();
      saveTimeout = null;
    }, 2000);
  },
  { deep: true },
);
</script>

<template>
  <div class="mst-canvas-editor">
    <div class="mst-canvas-editor__body">
      <CanvasToolbar />
      <CanvasViewport
        :elements="elements"
        @move="handleMove"
        @resize="handleResize"
        @edit="handleEdit"
        @edit:list="handleEditList"
        @edit:task="handleEditTask"
        @edit:image="handleEditImage"
        @edit:audio="handleEditAudio"
        @edit:video="handleEditVideo"
        @edit:date="handleEditDate"
        @delete="handleDelete"
        @connect="handleConnect"
        @add="handleAdd"
      />
    </div>
    <CanvasOptionsPanel :meta="currentMeta" @update:meta="handleUpdateMeta" />
  </div>
</template>

<style scoped>
.mst-canvas-editor {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  padding: 0;
}
.mst-canvas-editor__body {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-width: 0;
  min-height: 0;
}
.mst-canvas-editor__body :deep(.mst-canvas-toolbar) {
  flex-shrink: 0;
}
.mst-canvas-editor__body :deep(.mst-canvas-viewport) {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

@media (max-width: 600px) {
  .mst-canvas-editor {
    flex-direction: column;
  }
  .mst-canvas-editor__body {
    flex-direction: column-reverse;
  }
  .mst-canvas-editor :deep(.mst-canvas-options) {
    width: 100%;
  }
}
</style>
