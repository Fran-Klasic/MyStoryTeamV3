<script setup lang="ts">
import { computed } from "vue";
import type { VideoData } from "@/types/canvas/canvas-element";

const props = defineProps<{
  data: VideoData;
  editing: boolean;
}>();

const emit = defineEmits<{
  (e: "update:video", url: string): void;
  (e: "blur"): void;
}>();

function getYouTubeVideoId(url: string): string | null {
  if (!url?.trim()) return null;
  const watchMatch = url.trim().match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch?.[1]) return watchMatch[1];
  const shortMatch = url.trim().match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch?.[1]) return shortMatch[1];
  const embedMatch = url.trim().match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch?.[1]) return embedMatch[1];
  return null;
}

const youtubeVideoId = computed(() => getYouTubeVideoId(props.data.url));
</script>

<template>
  <div class="mst-canvas-card mst-canvas-video">
    <p class="mst-canvas-video__label">▶ Video URL</p>
    <input
      v-if="editing"
      type="url"
      class="mst-canvas-video__input"
      placeholder="https://www.youtube.com/..."
      :value="data.url"
      @input="emit('update:video', ($event.target as HTMLInputElement).value)"
      @blur="emit('blur')"
    />
    <template v-else>
      <div v-if="youtubeVideoId" class="mst-canvas-video__embed">
        <iframe
          :src="'https://www.youtube.com/embed/' + youtubeVideoId"
          title="YouTube video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
      <p v-else class="mst-canvas-video__url">
        <template v-if="data.url">{{ data.url }}</template>
        <template v-else>Double‑click to set video URL</template>
      </p>
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
.mst-canvas-video__label {
  margin: 0;
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--mst-color-text-soft);
}
.mst-canvas-video__input {
  width: 100%;
  margin-top: 0.35rem;
  padding: 0.4rem 0.5rem;
  border: 1px solid rgba(58, 167, 196, 0.5);
  border-radius: 6px;
  font-size: 0.8rem;
  outline: none;
}
.mst-canvas-video__url {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: var(--mst-color-text-soft);
  word-break: break-all;
}
.mst-canvas-video__embed {
  margin-top: 0.35rem;
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 6px;
}
.mst-canvas-video__embed iframe {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
