<script setup lang="ts">
import CanvasViewport from "@/components/canvas/CanvasViewport.vue";
import CanvasToolbar from "@/components/canvas/CanvasToolbar.vue";
import type { CanvasElement } from "@/types/canvas/canvas-element";
import { useCanvasElements } from "@/composables/useCanvasElements";

const initial: CanvasElement[] = [
  {
    id: "welcome",
    type: "Text",
    data: "Welcome to your cinematic planner demo.",
    position: { x: 200, y: 200, z: 0 },
    size: { x: 260, y: 80 },
    connections: [],
  },
  {
    id: "today",
    type: "Text",
    data: "Today: choose one small action that moves your story forward.",
    position: { x: 560, y: 260, z: 0 },
    size: { x: 320, y: 90 },
    connections: [],
  },
];

const {
  elements,
  updatePosition,
  updateSize,
  updateText,
  updateList,
  updateTask,
  updateImage,
  updateAudio,
  updateVideo,
  updateDate,
  removeElement,
  addConnection,
  addElement,
} = useCanvasElements(initial);

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

function handleAdd(payload: { type: import("@/types/canvas/canvas-element").CanvasElement["type"]; x: number; y: number }) {
  addElement(payload.type, payload.x, payload.y);
}
</script>

<template>
  <main class="mst-discover">
    <header class="mst-discover__header">
      <h1>Discover</h1>
      <p>Try planning on a simple canvas. No saving, no setup—just exploration.</p>
      <p class="mst-discover__banner">Demo canvas – changes are not saved.</p>
    </header>

    <section class="mst-discover__body">
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
    </section>
  </main>
</template>

<style scoped>
.mst-discover {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.mst-discover__header h1 {
  margin-bottom: 0.4rem;
}

.mst-discover__banner {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--mst-color-text-soft);
}

.mst-discover__body {
  display: flex;
  gap: 1rem;
  align-items: stretch;
  flex: 1;
  min-height: 0;
}

.mst-discover__body :deep(.mst-canvas-toolbar) {
  flex-shrink: 0;
  position: sticky;
  left: 0;
  align-self: flex-start;
  top: 0;
}

.mst-discover__body :deep(.mst-canvas-viewport) {
  flex: 1;
  min-width: 560px;
  min-height: 0;
}

@media (max-width: 600px) {
  .mst-discover__body {
    flex-direction: column-reverse;
  }
  .mst-discover__body :deep(.mst-canvas-viewport) {
    min-width: 0;
  }
}
</style>

