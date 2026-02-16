<script setup lang="ts">
import type { AudioData } from "@/types/canvas/canvas-element";

const props = defineProps<{
  data: AudioData;
  editing: boolean;
}>();

const emit = defineEmits<{
  (e: "update:audio", base64File: string): void;
  (e: "blur"): void;
}>();

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !file.type.startsWith("audio/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    emit("update:audio", reader.result as string);
  };
  reader.readAsDataURL(file);
  input.value = "";
}
</script>

<template>
  <div class="mst-canvas-card mst-canvas-audio">
    <p class="mst-canvas-audio__label">♪ Audio</p>
    <audio v-if="data.base64File" :src="data.base64File" controls class="mst-canvas-audio__player" />
    <template v-else-if="editing">
      <label class="mst-canvas-audio__upload">
        <input
          type="file"
          accept="audio/*"
          class="mst-canvas-audio__input"
          @change="onFileChange"
        />
        Upload audio
      </label>
    </template>
    <p v-else class="mst-canvas-audio__placeholder">Double‑click to upload audio</p>
    <template v-if="editing && data.base64File">
      <label class="mst-canvas-audio__replace">
        <input
          type="file"
          accept="audio/*"
          class="mst-canvas-audio__input"
          @change="onFileChange"
        />
        Replace file
      </label>
    </template>
  </div>
</template>

<style scoped>
.mst-canvas-card {
  padding: 0.75rem 0.9rem;
  border-radius: var(--mst-radius-md);
  background-color: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(58, 167, 196, 0.5);
  box-shadow: var(--mst-shadow-soft);
  font-size: 0.85rem;
}
.mst-canvas-audio__label { margin: 0 0 0.25rem 0; }
.mst-canvas-audio__player { width: 100%; max-height: 32px; }
.mst-canvas-audio__placeholder { margin: 0.25rem 0 0; font-size: 0.8rem; color: var(--mst-color-text-soft); }
.mst-canvas-audio__input { position: absolute; width: 0; height: 0; opacity: 0; }
.mst-canvas-audio__upload,
.mst-canvas-audio__replace {
  display: inline-block;
  margin-top: 0.25rem;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--mst-color-surface-border);
  background: var(--mst-color-accent-soft);
  font-size: 0.8rem;
  cursor: pointer;
}
</style>
