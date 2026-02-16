<script setup lang="ts">
import type { ImageData } from "@/types/canvas/canvas-element";

const props = defineProps<{
  data: ImageData;
  editing: boolean;
}>();

const emit = defineEmits<{
  (e: "update:image", base64File: string): void;
  (e: "blur"): void;
}>();

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result as string;
    emit("update:image", result);
  };
  reader.readAsDataURL(file);
  input.value = "";
}
</script>

<template>
  <div class="mst-canvas-card mst-canvas-image">
    <img v-if="data.base64File" :src="data.base64File" alt="" class="mst-canvas-image__img" />
    <template v-else-if="editing">
      <label class="mst-canvas-image__upload">
        <input
          type="file"
          accept="image/*"
          class="mst-canvas-image__input"
          @change="onFileChange"
        />
        Upload image
      </label>
    </template>
    <p v-else class="mst-canvas-image__placeholder">Image (double‑click to upload)</p>
    <template v-if="editing && data.base64File">
      <label class="mst-canvas-image__replace">
        <input
          type="file"
          accept="image/*"
          class="mst-canvas-image__input"
          @change="onFileChange"
        />
        Replace
      </label>
    </template>
  </div>
</template>

<style scoped>
.mst-canvas-card {
  padding: 0.5rem;
  border-radius: var(--mst-radius-md);
  background-color: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(58, 167, 196, 0.5);
  box-shadow: var(--mst-shadow-soft);
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}
.mst-canvas-image__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}
.mst-canvas-image__placeholder {
  margin: 0;
  font-size: 0.85rem;
  color: var(--mst-color-text-soft);
}
.mst-canvas-image__input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}
.mst-canvas-image__upload,
.mst-canvas-image__replace {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--mst-color-surface-border);
  background: var(--mst-color-accent-soft);
  font-size: 0.8rem;
  cursor: pointer;
}
</style>
