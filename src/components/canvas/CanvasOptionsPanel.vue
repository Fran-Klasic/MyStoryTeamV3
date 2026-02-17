<script setup lang="ts">
import { ref, watch } from "vue";
import type { CanvasMeta } from "@/types/canvas-meta";

const props = defineProps<{
  meta: CanvasMeta | null;
  readOnly?: boolean;
  saving?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:meta", meta: Partial<CanvasMeta>): void;
  (e: "save"): void;
  (e: "delete"): void;
}>();

const name = ref("");
const isFavorite = ref(false);
const isPublic = ref(false);
const backgroundColor = ref("#ffffff");

watch(
  () => props.meta,
  (m) => {
    if (m) {
      name.value = m.name ?? "";
      isFavorite.value = !!m.isFavorite;
      isPublic.value = !!m.isPublic;
      backgroundColor.value = m.backgroundColor ?? "#ffffff";
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

function onBackgroundImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;
    emit("update:meta", { previewImage: base64 });
  };
  reader.readAsDataURL(file);
  input.value = "";
}

function onBackgroundColorChange(event: Event) {
  const target = event.target as HTMLInputElement;
  backgroundColor.value = target.value;
  emit("update:meta", { backgroundColor: target.value });
}

function onDelete() {
  if (confirm("Delete this canvas? This cannot be undone.")) {
    emit("delete");
  }
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
        <label class="mst-canvas-options__label">Background image</label>
        <div class="mst-canvas-options__image-row">
          <label class="mst-canvas-options__file-trigger">
            <input
              type="file"
              accept="image/*"
              class="mst-canvas-options__file"
              @change="onBackgroundImageChange"
            />
            <span class="mst-canvas-options__file-text">Choose image</span>
          </label>
          <img
            v-if="meta?.previewImage"
            :src="meta.previewImage"
            alt="Preview"
            class="mst-canvas-options__preview"
          />
        </div>
      </div>
      <div class="mst-canvas-options__group">
        <label class="mst-canvas-options__label">Background color</label>
        <div class="mst-canvas-options__color-row">
          <input
            v-model="backgroundColor"
            type="color"
            class="mst-canvas-options__color"
            @input="onBackgroundColorChange"
          />
          <span class="mst-canvas-options__color-value">{{ backgroundColor }}</span>
        </div>
      </div>
      <div class="mst-canvas-options__group">
        <button
          type="button"
          class="mst-canvas-options__save"
          :disabled="saving"
          @click="onSave"
        >
          {{ saving ? "Saving…" : "Save" }}
        </button>
      </div>
      <div class="mst-canvas-options__group">
        <button
          type="button"
          class="mst-canvas-options__delete"
          @click="onDelete"
        >
          Delete canvas
        </button>
      </div>
      <p class="mst-canvas-options__hint">Changes are saved only when you click Save.</p>
    </template>
  </aside>
</template>

<style scoped>
.mst-canvas-options {
  width: 280px;
  flex-shrink: 0;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.98);
  border-radius: var(--mst-radius-md);
  border: 1px solid rgba(58, 167, 196, 0.35);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.mst-canvas-options__title {
  margin: 0 0 1rem;
  font-size: var(--mst-font-size-md);
  font-weight: 600;
  color: var(--mst-color-text);
}
.mst-canvas-options__group {
  margin-bottom: 1.25rem;
}
.mst-canvas-options__group:last-of-type {
  margin-bottom: 0;
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
  transition: border-color 0.15s;
}
.mst-canvas-options__input:focus {
  border-color: var(--mst-color-accent);
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
.mst-canvas-options__file {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}
.mst-canvas-options__file-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: var(--mst-font-size-sm);
  font-weight: 500;
  color: var(--mst-color-accent);
  background: rgba(58, 167, 196, 0.12);
  border: 1px dashed rgba(58, 167, 196, 0.5);
  border-radius: var(--mst-radius-sm);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.mst-canvas-options__file-trigger:hover {
  background: rgba(58, 167, 196, 0.18);
  border-color: rgba(58, 167, 196, 0.7);
}
.mst-canvas-options__file-text {
  pointer-events: none;
}
.mst-canvas-options__image-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.mst-canvas-options__preview {
  width: 100%;
  max-height: 80px;
  object-fit: contain;
  border-radius: var(--mst-radius-sm);
  border: 1px solid rgba(58, 167, 196, 0.4);
}
.mst-canvas-options__color-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.mst-canvas-options__color {
  width: 2.5rem;
  height: 2rem;
  padding: 0;
  border: 1px solid rgba(58, 167, 196, 0.5);
  border-radius: var(--mst-radius-sm);
  cursor: pointer;
  background: none;
}
.mst-canvas-options__color-value {
  font-size: var(--mst-font-size-xs);
  color: var(--mst-color-text-soft);
}
.mst-canvas-options__delete {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: var(--mst-font-size-sm);
  font-weight: 600;
  color: white;
  background: #dc2626;
  border: none;
  border-radius: var(--mst-radius-sm);
  cursor: pointer;
}
.mst-canvas-options__delete:hover {
  filter: brightness(1.05);
}
.mst-canvas-options__delete:active {
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
