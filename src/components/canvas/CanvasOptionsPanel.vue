<script setup lang="ts">
import { ref, watch } from "vue";
import type { CanvasMeta } from "@/types/canvas-meta";

const props = defineProps<{
  meta: CanvasMeta | null;
}>();

const emit = defineEmits<{
  (e: "update:meta", meta: Partial<CanvasMeta>): void;
}>();

const name = ref("");
const isFavorite = ref(false);
const isPublic = ref(false);

watch(
  () => props.meta,
  (m) => {
    if (m) {
      name.value = m.name;
      isFavorite.value = m.isFavorite;
      isPublic.value = m.isPublic;
    }
  },
  { immediate: true },
);

function updateName() {
  emit("update:meta", { name: name.value });
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value;
  emit("update:meta", { isFavorite: isFavorite.value });
}

function togglePublic() {
  isPublic.value = !isPublic.value;
  emit("update:meta", { isPublic: isPublic.value });
}
</script>

<template>
  <aside class="mst-canvas-options">
    <h3 class="mst-canvas-options__title">Options</h3>
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
        <input v-model="isFavorite" type="checkbox" @change="toggleFavorite" />
        <span>Favorite</span>
      </label>
    </div>
    <div class="mst-canvas-options__group">
      <label class="mst-canvas-options__row">
        <input v-model="isPublic" type="checkbox" @change="togglePublic" />
        <span>Public</span>
      </label>
    </div>
    <p class="mst-canvas-options__hint">Background, fonts, and autosave coming soon.</p>
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
.mst-canvas-options__hint {
  margin: 1rem 0 0;
  font-size: var(--mst-font-size-xs);
  color: var(--mst-color-text-soft);
}
</style>
