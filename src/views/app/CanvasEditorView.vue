<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import CanvasViewport from "@/components/canvas/CanvasViewport.vue";
import CanvasToolbar from "@/components/canvas/CanvasToolbar.vue";
import CanvasOptionsPanel from "@/components/canvas/CanvasOptionsPanel.vue";
import type { CanvasElement } from "@/types/canvas/canvas-element";
import type { CanvasMeta } from "@/types/canvas-meta";
import { useCanvasStore } from "@/store/canvas.store";
import { useAuthStore } from "@/store/auth.store";
import { useCanvasElements } from "@/composables/useCanvasElements";

const route = useRoute();
const router = useRouter();
const canvasStore = useCanvasStore();
const authStore = useAuthStore();
const isSaving = ref(false);
const selectedAddType = ref<CanvasElement["type"] | null>(null);

const id = computed(() => (route.name === "canvas-editor" ? (route.params.id as string) : undefined));
const isNew = computed(() => route.name === "canvas-new" || id.value === "new");

const { elements, updatePosition, updateSize, updateText, updateList, updateTask, updateImage, updateAudio, updateVideo, updateDate, removeElement, addConnection, addElement } = useCanvasElements([]);

const currentMeta = computed(() => canvasStore.currentCanvas?.meta ?? null);

const isOwner = computed(() => {
  const meta = currentMeta.value;
  if (!meta) return false;
  const inMyCanvases = canvasStore.allCanvases.some((c) => c.id === meta!.id);
  if (inMyCanvases) return true;
  const userId = authStore.user?.id;
  if (meta.owner == null) return true;
  if (userId == null) return false;
  return String(meta.owner) === String(userId);
});
const readOnly = computed(() => !isOwner.value);

async function ensureNewCanvasCreated() {
  if (!isNew.value) return;
  canvasStore.clearCurrentCanvas();
  try {
    const meta = await canvasStore.createCanvas("Untitled");
    await router.replace({ name: "canvas-editor", params: { id: String(meta.id) } });
  } catch {
    await router.replace({ name: "dashboard", query: { error: "create-failed" } });
  }
}

async function loadCurrentCanvas() {
  const currentId = id.value;
  if (!currentId || isNew.value) return;
  // If we're already on this canvas (e.g. just created it), use store state and don't fetch — avoids overwriting with wrong canvas
  const current = canvasStore.currentCanvas;
  if (current?.meta?.id === currentId) {
    elements.value = [...(current.elements ?? [])];
    return;
  }
  if (canvasStore.allCanvases.length === 0) {
    await canvasStore.loadCanvases();
  }
  const data = await canvasStore.loadCanvas(currentId);
  if (!data) {
    await router.replace({ name: "dashboard" });
    return;
  }
  elements.value = [...data.elements];
}

watch(isNew, (newVal) => {
  if (newVal) ensureNewCanvasCreated();
}, { immediate: true });

watch(id, () => {
  if (!isNew.value && id.value) loadCurrentCanvas();
}, { immediate: true });

onMounted(async () => {
  if (!authStore.user && authStore.isAuthenticated) {
    await authStore.refreshUser();
  }
});

watch(
  elements,
  (el) => {
    if (readOnly.value) return;
    canvasStore.setCurrentElements([...el]);
  },
  { deep: true },
);

function handleMove(payload: { id: string; x: number; y: number }) {
  if (readOnly.value) return;
  const existing = elements.value.find((e) => e.id === payload.id);
  if (!existing) return;
  updatePosition(payload.id, { ...existing.position, x: payload.x, y: payload.y });
}

function handleResize(payload: { id: string; width: number; height: number }) {
  if (readOnly.value) return;
  const existing = elements.value.find((e) => e.id === payload.id);
  if (!existing) return;
  updateSize(payload.id, { ...existing.size, x: payload.width, y: payload.height });
}

function handleEdit(payload: { id: string; text: string }) {
  if (readOnly.value) return;
  updateText(payload.id, payload.text);
}
function handleEditList(payload: { id: string; listData: string[] }) {
  if (readOnly.value) return;
  updateList(payload.id, payload.listData);
}
function handleEditTask(payload: { id: string; data: string; checked: boolean }) {
  if (readOnly.value) return;
  updateTask(payload.id, payload.data, payload.checked);
}
function handleEditImage(payload: { id: string; base64File: string }) {
  if (readOnly.value) return;
  updateImage(payload.id, payload.base64File);
}
function handleEditAudio(payload: { id: string; base64File: string }) {
  if (readOnly.value) return;
  updateAudio(payload.id, payload.base64File);
}
function handleEditVideo(payload: { id: string; url: string }) {
  if (readOnly.value) return;
  updateVideo(payload.id, payload.url);
}
function handleEditDate(payload: { id: string; date: string; data: string }) {
  if (readOnly.value) return;
  updateDate(payload.id, payload.date, payload.data);
}
function handleDelete(id: string) {
  if (readOnly.value) return;
  removeElement(id);
}
function handleConnect(payload: { self: string; target: string }) {
  if (readOnly.value) return;
  addConnection(payload.self, payload.target);
}
function handleAdd(payload: { type: CanvasElement["type"]; x: number; y: number }) {
  if (readOnly.value) return;
  addElement(payload.type, payload.x, payload.y);
  selectedAddType.value = null;
}

function setSelectedAddType(v: CanvasElement["type"] | null) {
  selectedAddType.value = v;
}

function handleUpdateMeta(meta: Partial<CanvasMeta>) {
  if (readOnly.value) return;
  canvasStore.setCurrentMeta(meta);
}

async function handleSave() {
  if (readOnly.value) return;
  isSaving.value = true;
  await nextTick();
  try {
    await canvasStore.saveCurrentCanvas();
  } finally {
    isSaving.value = false;
  }
}

async function handleDeleteCanvas() {
  const meta = canvasStore.currentCanvas?.meta;
  if (!meta?.id) return;
  await canvasStore.deleteCanvas(meta.id);
  router.replace({ name: "dashboard" });
}

</script>

<template>
  <div class="mst-canvas-editor">
    <div v-if="isSaving" class="mst-canvas-editor__loading">
      <div class="mst-canvas-editor__loading-spinner" />
      <p class="mst-canvas-editor__loading-text">Saving canvas…</p>
    </div>
    <div v-if="readOnly" class="mst-canvas-editor__readonly-banner">
      View only — you're viewing someone else's canvas
    </div>
    <div class="mst-canvas-editor__body">
      <CanvasToolbar
        :read-only="readOnly"
        :selected-add-type="selectedAddType"
        @update:selected-add-type="setSelectedAddType"
      />
      <CanvasViewport
        :elements="elements"
        :read-only="readOnly"
        :background-image="currentMeta?.previewImage ?? null"
        :background-color="currentMeta?.backgroundColor ?? null"
        :selected-add-type="selectedAddType"
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
    <CanvasOptionsPanel
      :meta="currentMeta"
      :read-only="readOnly"
      :saving="isSaving"
      @update:meta="handleUpdateMeta"
      @save="handleSave"
      @delete="handleDeleteCanvas"
    />
  </div>
</template>

<style scoped>
.mst-canvas-editor__loading {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}
.mst-canvas-editor__loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(58, 167, 196, 0.3);
  border-top-color: var(--mst-color-accent);
  border-radius: 50%;
  animation: mst-spin 0.8s linear infinite;
}
.mst-canvas-editor__loading-text {
  margin: 0;
  font-size: var(--mst-font-size-md);
  font-weight: 500;
  color: var(--mst-color-text);
}
@keyframes mst-spin {
  to { transform: rotate(360deg); }
}
.mst-canvas-editor__readonly-banner {
  padding: 0.4rem 0.75rem;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
  background: rgba(148, 163, 184, 0.2);
  border-radius: var(--mst-radius-sm);
  margin-bottom: 0.5rem;
}
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
