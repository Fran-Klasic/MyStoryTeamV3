<script setup lang="ts">
import type { CanvasElement } from "@/types/canvas/canvas-element";

const props = defineProps<{
  readOnly?: boolean;
  selectedAddType?: CanvasElement["type"] | null;
}>();

const emit = defineEmits<{
  (e: "update:selectedAddType", value: CanvasElement["type"] | null): void;
}>();

const base = import.meta.env.BASE_URL;
const ELEMENT_TYPES: { type: CanvasElement["type"]; label: string; icon: string }[] = [
  { type: "Text", label: "Text", icon: `${base}assets/icons/text-icon.svg` },
  { type: "List", label: "List", icon: `${base}assets/icons/list-icon.svg` },
  { type: "Task", label: "Task", icon: `${base}assets/icons/task-icon.svg` },
  { type: "Image", label: "Image", icon: `${base}assets/icons/image-icon.svg` },
  { type: "Audio", label: "Audio", icon: `${base}assets/icons/audio-icon.svg` },
  { type: "Video", label: "Video", icon: `${base}assets/icons/video-icon.svg` },
  { type: "Date", label: "Date", icon: `${base}assets/icons/date-icon.svg` },
];

function onDragStart(type: CanvasElement["type"], event: DragEvent) {
  event.dataTransfer?.setData("text/plain", type);
  event.dataTransfer!.effectAllowed = "copy";

  const ghost = document.createElement("div");
  ghost.className = "mst-drag-ghost";
  ghost.textContent = type;
  ghost.style.cssText = `
    position: absolute; left: -9999px; top: 0;
    padding: 8px 14px; border-radius: 10px;
    border: 2px solid rgba(68, 211, 255, 0.8);
    background: rgba(31, 41, 55, 0.85);
    color: #e0f7ff; font-size: 12px; font-weight: 600;
    pointer-events: none; white-space: nowrap;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(ghost);
  event.dataTransfer?.setDragImage(ghost, 24, 16);
  requestAnimationFrame(() => ghost.remove());
}

function onTap(item: { type: CanvasElement["type"] }) {
  const next = props.selectedAddType === item.type ? null : item.type;
  emit("update:selectedAddType", next);
}
</script>

<template>
  <aside v-if="!readOnly" class="mst-canvas-toolbar">
    <button
      v-for="item in ELEMENT_TYPES"
      :key="item.type"
      class="mst-canvas-toolbar__item"
      :class="{ 'mst-canvas-toolbar__item--selected': props.selectedAddType === item.type }"
      draggable="true"
      type="button"
      @dragstart="onDragStart(item.type, $event)"
      @click="onTap(item)"
    >
      <img :src="item.icon" :alt="item.label" class="mst-canvas-toolbar__icon" />
      <span class="mst-canvas-toolbar__label">{{ item.label }}</span>
    </button>
  </aside>
</template>

<style scoped>
.mst-canvas-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 0.5rem;
  border-radius: var(--mst-radius-lg);
  border: 1px solid rgba(58, 167, 196, 0.4);
  background: linear-gradient(
    180deg,
    rgba(31, 41, 55, 0.98),
    rgba(31, 41, 55, 0.9)
  );
  box-shadow: var(--mst-shadow-soft);
}

.mst-canvas-toolbar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  width: 3.25rem;
  padding: 0.5rem 0.25rem;
  border-radius: var(--mst-radius-md);
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: rgba(15, 23, 42, 0.95);
  color: var(--mst-color-text-inverse);
  font-size: 0.85rem;
  cursor: grab;
  transition: border-color var(--mst-duration-fast), box-shadow var(--mst-duration-fast);
}

.mst-canvas-toolbar__item:hover {
  border-color: var(--mst-color-accent);
  box-shadow: 0 0 12px rgba(68, 211, 255, 0.3);
}

.mst-canvas-toolbar__item:active {
  cursor: grabbing;
}
.mst-canvas-toolbar__item--selected {
  border-color: var(--mst-color-accent);
  box-shadow: 0 0 12px rgba(68, 211, 255, 0.3);
  background: rgba(68, 211, 255, 0.15);
}

.mst-canvas-toolbar__icon {
  width: 1.25rem;
  height: 1.25rem;
  object-fit: contain;
  filter: invert(1);
}

.mst-canvas-toolbar__label {
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.9;
}

@media (max-width: 600px) {
  .mst-canvas-toolbar {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0.5rem;
  }
  .mst-canvas-toolbar__item {
    min-width: 2.75rem;
    min-height: 44px;
    flex: 1 1 auto;
  }
}
</style>
