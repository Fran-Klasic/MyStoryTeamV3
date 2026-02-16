<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from "vue";
import type { CanvasElement, ID } from "@/types/canvas/canvas-element";
import { useCanvasPanZoom } from "@/composables/useCanvasPanZoom";
import CanvasGrid from "./CanvasGrid.vue";
import CanvasElementRenderer from "./CanvasElementRenderer.vue";

const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 2000;
const MIN_WIDTH = 140;
const MIN_HEIGHT = 80;

const props = defineProps<{
  elements: CanvasElement[];
}>();

const emit = defineEmits<{
  (e: "move", payload: { id: ID; x: number; y: number }): void;
  (e: "resize", payload: { id: ID; width: number; height: number }): void;
  (e: "edit", payload: { id: ID; text: string }): void;
  (e: "edit:list", payload: { id: ID; listData: string[] }): void;
  (e: "edit:task", payload: { id: ID; data: string; checked: boolean }): void;
  (e: "edit:image", payload: { id: ID; base64File: string }): void;
  (e: "edit:audio", payload: { id: ID; base64File: string }): void;
  (e: "edit:video", payload: { id: ID; url: string }): void;
  (e: "edit:date", payload: { id: ID; date: string; data: string }): void;
  (e: "delete", id: ID): void;
  (e: "connect", payload: { self: ID; target: ID }): void;
  (e: "add", payload: { type: CanvasElement["type"]; x: number; y: number }): void;
}>();

const viewportRef = ref<HTMLElement | null>(null);
const { transformStyle, zoomAt, panBy, zoom, offsetX, offsetY } = useCanvasPanZoom();

const draggingId = ref<ID | null>(null);
const resizingId = ref<ID | null>(null);
const editingId = ref<ID | null>(null);
const editingWrapperRef = ref<HTMLElement | null>(null);
const lastX = ref(0);
const lastY = ref(0);
const isPanning = ref(false);

// Connect-by-drag: source element and current pointer in canvas space
const connectFromId = ref<ID | null>(null);
const connectLineEnd = ref<{ x: number; y: number } | null>(null);

const draggingElement = computed(() =>
  props.elements.find((e) => e.id === draggingId.value) || null,
);
const resizingElement = computed(() =>
  props.elements.find((e) => e.id === resizingId.value) || null,
);
const connectSourceElement = computed(() =>
  connectFromId.value ? props.elements.find((e) => e.id === connectFromId.value) : null,
);

function screenToCanvas(clientX: number, clientY: number): { x: number; y: number } {
  const el = viewportRef.value;
  if (!el) return { x: 0, y: 0 };
  const rect = el.getBoundingClientRect();
  const vx = clientX - rect.left;
  const vy = clientY - rect.top;
  return {
    x: (vx - offsetX.value) / zoom.value,
    y: (vy - offsetY.value) / zoom.value,
  };
}

function getElementCenter(element: CanvasElement) {
  return {
    x: element.position.x + element.size.x / 2,
    y: element.position.y + element.size.y / 2,
  };
}

function hitTest(canvasX: number, canvasY: number): CanvasElement | null {
  for (const el of [...props.elements].reverse()) {
    const { position, size } = el;
    if (
      canvasX >= position.x &&
      canvasX <= position.x + size.x &&
      canvasY >= position.y &&
      canvasY <= position.y + size.y
    ) {
      return el;
    }
  }
  return null;
}

function canConnectTo(sourceId: ID, targetId: ID): boolean {
  if (sourceId === targetId) return false;
  const source = props.elements.find((e) => e.id === sourceId);
  if (!source) return false;
  const already = source.connections.some((c) => c.target === targetId);
  return !already;
}

const connectTargetId = computed(() => {
  if (!connectFromId.value || !connectLineEnd.value) return null;
  const target = hitTest(connectLineEnd.value.x, connectLineEnd.value.y);
  if (!target || !canConnectTo(connectFromId.value, target.id)) return null;
  return target.id;
});

const isMovingResizingOrConnecting = computed(
  () =>
    draggingId.value != null ||
    resizingId.value != null ||
    connectFromId.value != null,
);

// Zoom: Ctrl+wheel toward cursor
function onViewportWheel(event: WheelEvent) {
  if (!event.ctrlKey) return;
  event.preventDefault();
  const el = viewportRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const vx = event.clientX - rect.left;
  const vy = event.clientY - rect.top;
  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  zoomAt(vx, vy, delta);
  const minX = rect.width - CANVAS_WIDTH * zoom.value;
  const minY = rect.height - CANVAS_HEIGHT * zoom.value;
  offsetX.value = Math.max(minX, Math.min(0, offsetX.value));
  offsetY.value = Math.max(minY, Math.min(0, offsetY.value));
}

// Middle mouse: pan (anywhere in viewport)
function onViewportMouseDown(event: MouseEvent) {
  if (event.button === 1) {
    event.preventDefault();
    isPanning.value = true;
    lastX.value = event.clientX;
    lastY.value = event.clientY;
  }
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  const type = event.dataTransfer?.getData("text/plain") as CanvasElement["type"] | undefined;
  if (!type) return;
  const { x, y } = screenToCanvas(event.clientX, event.clientY);
  emit("add", { type, x, y });
}

function onElementMouseDown(id: ID, event: MouseEvent) {
  if (event.button !== 0) return;
  if (editingId.value === id) return;
  draggingId.value = id;
  lastX.value = event.clientX;
  lastY.value = event.clientY;
}

function onResizeMouseDown(id: ID, event: MouseEvent) {
  if (event.button !== 0) return;
  event.preventDefault();
  resizingId.value = id;
  lastX.value = event.clientX;
  lastY.value = event.clientY;
}

function onMouseMove(event: MouseEvent) {
  const canvasPos = screenToCanvas(event.clientX, event.clientY);

  if (isPanning.value) {
    const dx = event.clientX - lastX.value;
    const dy = event.clientY - lastY.value;
    lastX.value = event.clientX;
    lastY.value = event.clientY;
    panBy(dx, dy);
    const el = viewportRef.value;
    if (el) {
      const r = el.getBoundingClientRect();
      const minX = r.width - CANVAS_WIDTH * zoom.value;
      const minY = r.height - CANVAS_HEIGHT * zoom.value;
      offsetX.value = Math.max(minX, Math.min(0, offsetX.value));
      offsetY.value = Math.max(minY, Math.min(0, offsetY.value));
    }
    return;
  }

  if (connectFromId.value !== null) {
    connectLineEnd.value = { x: canvasPos.x, y: canvasPos.y };
    return;
  }

  if (draggingId.value && draggingElement.value) {
    const dx = (event.clientX - lastX.value) / zoom.value;
    const dy = (event.clientY - lastY.value) / zoom.value;
    lastX.value = event.clientX;
    lastY.value = event.clientY;
    const pos = draggingElement.value.position;
    const size = draggingElement.value.size;
    const nextX = Math.min(
      CANVAS_WIDTH - size.x,
      Math.max(0, pos.x + dx),
    );
    const nextY = Math.min(
      CANVAS_HEIGHT - size.y,
      Math.max(0, pos.y + dy),
    );
    emit("move", { id: draggingElement.value.id, x: nextX, y: nextY });
    return;
  }

  if (resizingId.value && resizingElement.value) {
    const dx = (event.clientX - lastX.value) / zoom.value;
    const dy = (event.clientY - lastY.value) / zoom.value;
    lastX.value = event.clientX;
    lastY.value = event.clientY;
    const { position, size } = resizingElement.value;
    const newWidth = Math.min(
      CANVAS_WIDTH - position.x,
      Math.max(MIN_WIDTH, size.x + dx),
    );
    const newHeight = Math.min(
      CANVAS_HEIGHT - position.y,
      Math.max(MIN_HEIGHT, size.y + dy),
    );
    emit("resize", {
      id: resizingElement.value.id,
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    });
  }
}

function onMouseUp(event: MouseEvent) {
  if (connectFromId.value !== null && event.button === 0) {
    const targetId = connectTargetId.value;
    if (targetId) {
      emit("connect", { self: connectFromId.value, target: targetId });
    }
    connectFromId.value = null;
    connectLineEnd.value = null;
  }
  draggingId.value = null;
  resizingId.value = null;
  isPanning.value = false;
}

function onConnectHandleMouseDown(id: ID, event: MouseEvent) {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  connectFromId.value = id;
  const pos = screenToCanvas(event.clientX, event.clientY);
  connectLineEnd.value = { x: pos.x, y: pos.y };
}

function onElementDblClick(id: ID) {
  editingId.value = id;
  editingWrapperRef.value = null;
  setTimeout(() => {
    const wrapper = viewportRef.value?.querySelector(`[data-element-id="${id}"]`);
    editingWrapperRef.value = wrapper as HTMLElement | null;
  }, 0);
}

function onDocumentMouseDown(event: MouseEvent) {
  if (editingId.value == null) return;
  const target = event.target as Node;
  if (editingWrapperRef.value?.contains(target)) return;
  editingId.value = null;
  editingWrapperRef.value = null;
}

function onTextUpdate(id: ID, text: string) {
  emit("edit", { id, text });
}

function onEditBlur() {
  editingId.value = null;
  editingWrapperRef.value = null;
}

function onDelete(id: ID) {
  emit("delete", id);
}

function connectionPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const cpx = midX + (y2 - y1) * 0.2;
  const cpy = midY - (x2 - x1) * 0.2;
  return `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`;
}

function getConnectionPathFor(conn: { self: ID; target: ID }): string | null {
  const source = props.elements.find((e) => e.id === conn.self);
  const target = props.elements.find((e) => e.id === conn.target);
  if (!source || !target) return null;
  const a = getElementCenter(source);
  const b = getElementCenter(target);
  return connectionPath(a.x, a.y, b.x, b.y);
}

const draftLinePath = computed(() => {
  if (!connectSourceElement.value || !connectLineEnd.value) return null;
  const end = connectTargetId.value
    ? props.elements.find((e) => e.id === connectTargetId.value)
    : null;
  const x2 = end ? getElementCenter(end).x : connectLineEnd.value.x;
  const y2 = end ? getElementCenter(end).y : connectLineEnd.value.y;
  const start = getElementCenter(connectSourceElement.value);
  return connectionPath(start.x, start.y, x2, y2);
});

onMounted(() => {
  window.addEventListener("mouseup", onMouseUp);
  document.addEventListener("mousedown", onDocumentMouseDown, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("mouseup", onMouseUp);
  document.removeEventListener("mousedown", onDocumentMouseDown, true);
});
</script>

<template>
  <div
    ref="viewportRef"
    class="mst-canvas-viewport"
    :class="{ 'mst-canvas-viewport--moving-resizing-connecting': isMovingResizingOrConnecting }"
    @mousedown="onViewportMouseDown"
    @mousemove="onMouseMove"
    @wheel="onViewportWheel"
    @dragover.prevent
    @drop="onDrop"
  >
    <div class="mst-canvas-inner" :style="{ transform: transformStyle }">
      <CanvasGrid />
      <svg class="mst-canvas-connections" :width="CANVAS_WIDTH" :height="CANVAS_HEIGHT">
        <defs>
          <filter id="mst-connection-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="mst-connection-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="var(--mst-color-accent)" stop-opacity="0.7" />
            <stop offset="100%" stop-color="var(--mst-color-surface-border)" stop-opacity="1" />
          </linearGradient>
        </defs>
        <g v-for="element in props.elements" :key="'conn-' + element.id">
          <path
            v-for="conn in element.connections"
            :key="conn.self + '-' + conn.target"
            v-show="getConnectionPathFor(conn)"
            :d="getConnectionPathFor(conn)!"
            class="mst-canvas-connection-path"
            fill="none"
          />
        </g>
        <path
          v-if="draftLinePath"
          :d="draftLinePath"
          class="mst-canvas-connection-draft"
          fill="none"
        />
      </svg>
      <div
        v-for="element in props.elements"
        :key="element.id"
        :data-element-id="element.id"
        class="mst-canvas-element-wrapper"
        :class="{ 'mst-canvas-element--connect-target': connectTargetId === element.id }"
        :style="{
          left: element.position.x + 'px',
          top: element.position.y + 'px',
          width: element.size.x + 'px',
          height: element.size.y + 'px',
        }"
        @mousedown.left.stop="onElementMouseDown(element.id, $event)"
        @dblclick.stop="onElementDblClick(element.id)"
      >
        <div
          class="mst-canvas-element__connect-handle"
          title="Drag to connect"
          @mousedown.stop="onConnectHandleMouseDown(element.id, $event)"
        />
        <div
          class="mst-canvas-element__resize"
          @mousedown.stop.prevent="onResizeMouseDown(element.id, $event)"
        />
        <button
          class="mst-canvas-element__delete"
          type="button"
          @click.stop="onDelete(element.id)"
          title="Delete"
        >
          ×
        </button>
        <div class="mst-canvas-element__body">
          <CanvasElementRenderer
            :element="element"
            :editing="editingId === element.id"
            @update:text="onTextUpdate(element.id, $event)"
            @update:list="(listData: string[]) => emit('edit:list', { id: element.id, listData })"
            @update:task="(data: string, checked: boolean) => emit('edit:task', { id: element.id, data, checked })"
            @update:image="(base64File: string) => emit('edit:image', { id: element.id, base64File })"
            @update:audio="(base64File: string) => emit('edit:audio', { id: element.id, base64File })"
            @update:video="(url: string) => emit('edit:video', { id: element.id, url })"
            @update:date="(date: string, data: string) => emit('edit:date', { id: element.id, date, data })"
            @blur="onEditBlur"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mst-canvas-viewport {
  position: relative;
  overflow: hidden;
  border-radius: var(--mst-radius-lg);
  border: 1px solid rgba(58, 167, 196, 0.4);
  background-color: var(--mst-color-bg-elevated-soft);
  min-height: 280px;
  max-height: calc(100vh - 140px);
  flex: 1;
  min-width: 0;
}

.mst-canvas-viewport.mst-canvas-viewport--moving-resizing-connecting,
.mst-canvas-viewport.mst-canvas-viewport--moving-resizing-connecting :deep(*) {
  user-select: none;
  -webkit-user-select: none;
}

.mst-canvas-viewport.mst-canvas-viewport--moving-resizing-connecting :deep(.mst-canvas-image),
.mst-canvas-viewport.mst-canvas-viewport--moving-resizing-connecting :deep(.mst-canvas-video),
.mst-canvas-viewport.mst-canvas-viewport--moving-resizing-connecting :deep(.mst-canvas-audio) {
  pointer-events: none;
}

.mst-canvas-viewport.mst-canvas-viewport--moving-resizing-connecting :deep(.mst-canvas-image img),
.mst-canvas-viewport.mst-canvas-viewport--moving-resizing-connecting :deep(.mst-canvas-video iframe),
.mst-canvas-viewport.mst-canvas-viewport--moving-resizing-connecting :deep(.mst-canvas-audio audio) {
  pointer-events: none !important;
}

.mst-canvas-inner {
  position: relative;
  width: 2000px;
  height: 2000px;
  transform-origin: 0 0;
  background-color: var(--mst-color-bg);
}

.mst-canvas-connections {
  position: absolute;
  left: 0;
  top: 0;
  width: 2000px;
  height: 2000px;
  pointer-events: none;
}

.mst-canvas-connection-path {
  stroke: url(#mst-connection-stroke);
  stroke-width: 2.5;
  stroke-linecap: round;
  filter: url(#mst-connection-glow);
  transition: stroke-width 0.15s;
}

.mst-canvas-connection-path:hover {
  stroke-width: 3.5;
}

.mst-canvas-connection-draft {
  stroke: var(--mst-color-accent);
  stroke-width: 2;
  stroke-dasharray: 6 4;
  stroke-linecap: round;
  opacity: 0.9;
  animation: mst-dash 0.4s linear infinite;
}

@keyframes mst-dash {
  to { stroke-dashoffset: -10; }
}

.mst-canvas-element-wrapper {
  position: absolute;
  box-sizing: border-box;
  padding: 0;
  z-index: 1;
}

.mst-canvas-element-wrapper.mst-canvas-element--connect-target {
  outline: 2px solid var(--mst-color-accent);
  outline-offset: 2px;
  border-radius: var(--mst-radius-md);
  box-shadow: 0 0 16px rgba(68, 211, 255, 0.5);
}

.mst-canvas-element__body {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: var(--mst-radius-md);
  z-index: 0;
}

.mst-canvas-element__body :deep(.mst-canvas-card) {
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.mst-canvas-element__delete {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 6px;
  background: rgba(31, 41, 55, 0.9);
  color: #e0f7ff;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.mst-canvas-element__delete:hover {
  background: rgba(220, 38, 38, 0.9);
}

.mst-canvas-element__connect-handle {
  position: absolute;
  bottom: 4px;
  left: 4px;
  z-index: 1;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--mst-color-accent);
  cursor: crosshair;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 8px rgba(68, 211, 255, 0.6);
}

.mst-canvas-element__connect-handle:hover {
  transform: scale(1.15);
}

.mst-canvas-element__resize {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1;
  width: 16px;
  height: 16px;
  border-radius: 4px 0 0 0;
  background: linear-gradient(135deg, transparent 50%, var(--mst-color-accent) 50%);
  background-size: 100% 100%;
  cursor: nesw-resize;
  opacity: 0.8;
}

.mst-canvas-element__resize:hover {
  opacity: 1;
}
</style>
