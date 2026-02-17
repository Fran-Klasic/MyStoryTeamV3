<script setup lang="ts">
import { ref, watch } from "vue";
import type { CanvasMeta } from "@/types/canvas-meta";

const props = defineProps<{
  meta: CanvasMeta | null;
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:meta", meta: Partial<CanvasMeta>): void;
  (e: "save"): void;
}>();

const name = ref("");
const isFavorite = ref(false);
const isPublic = ref(false);

watch(
  () => props.meta,
  (m) => {
    if (m) {
      name.value = m.name ?? "";
      isFavorite.value = !!m.isFavorite;
      isPublic.value = !!m.isPublic;
    }
  },
  { immediate: true },
);

function updateName() {
  const v = name.value.trim();
  emit("update:meta", { name: v || "Untitled" });
}

function onFavoriteChange(event: Event) {
  const target = event.target as HTMLInputElement;
  isFavorite.value = target.checked;
  emit("update:meta", { isFavorite: target.checked });
}

function onPublicChange(event: Event) {
  const target = event.target as HTMLInputElement;
  isPublic.value = target.checked;
  emit("update:meta", { isPublic: target.checked });
}

function onSave() {
  updateName();
  emit("save");
}
</script>

<template>
  <aside class="mst-canvas-options">
    <h3 class="mst-canvas-options__title">Options</h3>
    <template v-if="readOnly">
      <p class="mst-canvas-options__readonly">View only — you cannot edit this canvas.</p>
      <p v-if="meta" class="mst-canvas-options__name-display">{{ meta.name }}</p>
    </template>
    <template v-else>
      <div class="mst-canvas-options__group">
        <label class="mst-canvas-options__label">Canvas name</label>
        <input
          v-model="name"
          type="text"
          class="mst-canvas-options__input"
          placeholder="Untitled"
          @blur="updateName"
        />
      </div>
      <div class="mst-canvas-options__group">
        <label class="mst-canvas-options__row">
          <input
            :checked="isFavorite"
            type="checkbox"
            @change="onFavoriteChange"
          />
          <span>Favorite</span>
        </label>
      </div>
      <div class="mst-canvas-options__group">
        <label class="mst-canvas-options__row">
          <input
            :checked="isPublic"
            type="checkbox"
            @change="onPublicChange"
          />
          <span>Public</span>
        </label>
      </div>
      <div class="mst-canvas-options__group">
        <button
          type="button"
          class="mst-canvas-options__save"
          @click="onSave"
        >
          Save
        </button>
      </div>
      <p class="mst-canvas-options__hint">Changes are saved only when you click Save.</p>
    </template>
  </aside>
</template>

<style scoped>
.mst-canvas-options {
  width: 260px;
  flex-shrink: 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--mst-radius-md);
  border: 1px solid rgba(58, 167, 196, 0.4);
  box-shadow: var(--mst-shadow-soft);
}
.mst-canvas-options__title {
  margin: 0 0 1rem;
  font-size: var(--mst-font-size-md);
  font-weight: 600;
  color: var(--mst-color-text);
}
.mst-canvas-options__group {
  margin-bottom: 1rem;
}
.mst-canvas-options__label {
  display: block;
  font-size: var(--mst-font-size-xs);
  font-weight: 600;
  color: var(--mst-color-text-soft);
  margin-bottom: 0.35rem;
}
.mst-canvas-options__input {
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 1px solid rgba(58, 167, 196, 0.5);
  border-radius: var(--mst-radius-sm);
  font-size: var(--mst-font-size-sm);
  outline: none;
}
.mst-canvas-options__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--mst-font-size-sm);
  cursor: pointer;
}
.mst-canvas-options__row input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: var(--mst-color-accent);
}
.mst-canvas-options__save {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: var(--mst-font-size-sm);
  font-weight: 600;
  color: white;
  background: var(--mst-color-accent);
  border: none;
  border-radius: var(--mst-radius-sm);
  cursor: pointer;
}
.mst-canvas-options__save:hover {
  filter: brightness(1.05);
}
.mst-canvas-options__save:active {
  filter: brightness(0.95);
}
.mst-canvas-options__hint {
  margin: 1rem 0 0;
  font-size: var(--mst-font-size-xs);
  color: var(--mst-color-text-soft);
}
.mst-canvas-options__readonly {
  margin: 0 0 0.5rem;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-canvas-options__name-display {
  margin: 0;
  font-size: var(--mst-font-size-md);
  font-weight: 600;
  color: var(--mst-color-text);
}
</style>
