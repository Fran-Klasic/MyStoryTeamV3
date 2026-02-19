<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.store";
import type { CanvasMeta } from "@/types/canvas-meta";

const props = defineProps<{
  canvas: CanvasMeta;
  showFavorite?: boolean;
  showMessage?: boolean;
}>();

const router = useRouter();
const authStore = useAuthStore();

const emit = defineEmits<{
  (e: "toggle-favorite", id: string): void;
}>();

/** Display author as username#user_id. For current user's canvases, use authStore (same as public canvas logic: backend for others, auth for self). */
const ownerDisplay = computed(() => {
  const owner = props.canvas.owner;
  if (!owner) return null;
  const isCurrentUser = authStore.user?.id && String(owner) === String(authStore.user.id);
  const username = isCurrentUser
    ? authStore.user?.username
    : props.canvas.ownerUsername;
  const userId = isCurrentUser ? authStore.user?.id : owner;
  const display = username && username.trim() ? username.trim() : "User";
  return `${display}#${userId}`;
});

function handleMessageOwner(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  if (props.canvas.owner && props.canvas.owner !== authStore.user?.id) {
    router.push({ path: "/app/messages", query: { userId: props.canvas.owner } });
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return "Today";
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString();
}
</script>

<template>
  <article class="mst-canvas-card">
    <RouterLink :to="{ name: 'canvas-editor', params: { id: canvas.id } }" class="mst-canvas-card__link">
      <div v-if="canvas.previewImage" class="mst-canvas-card__preview">
        <img :src="canvas.previewImage" alt="" />
      </div>
      <div v-else class="mst-canvas-card__preview mst-canvas-card__preview--placeholder">
        <span class="mst-canvas-card__placeholder-label">Canvas</span>
      </div>
      <div class="mst-canvas-card__body">
        <h4 class="mst-canvas-card__title">{{ canvas.name }}</h4>
        <p class="mst-canvas-card__meta">
          <template v-if="ownerDisplay">
            <span class="mst-canvas-card__author">{{ ownerDisplay }}</span>
            <span> · </span>
          </template>
          {{ formatDate(canvas.updatedAt) }}
          <template v-if="canvas.stats?.elementsCount">
            · {{ canvas.stats.elementsCount }} items
          </template>
        </p>
      </div>
    </RouterLink>
    <button
      v-if="showFavorite !== false"
      type="button"
      class="mst-canvas-card__fav"
      :class="{ 'mst-canvas-card__fav--on': canvas.isFavorite }"
      :aria-label="canvas.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
      @click.prevent="emit('toggle-favorite', canvas.id)"
    >
      ★
    </button>
    <button
      v-if="showMessage && canvas.owner && canvas.owner !== authStore.user?.id"
      type="button"
      class="mst-canvas-card__msg"
      aria-label="Message owner"
      @click="handleMessageOwner"
    >
      Message
    </button>
  </article>
</template>

<style scoped>
.mst-canvas-card {
  position: relative;
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--mst-radius-md);
  border: 1px solid rgba(58, 167, 196, 0.4);
  box-shadow: var(--mst-shadow-soft);
  overflow: hidden;
  transition: transform var(--mst-duration-fast) var(--mst-ease-standard),
    box-shadow var(--mst-duration-fast) var(--mst-ease-standard);
}
.mst-canvas-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--mst-shadow-glow);
}
.mst-canvas-card__link {
  display: block;
  color: inherit;
  text-decoration: none;
}
.mst-canvas-card__preview {
  aspect-ratio: 16 / 10;
  background: var(--mst-color-bg-elevated-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mst-canvas-card__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mst-canvas-card__preview--placeholder {
  background: linear-gradient(135deg, var(--mst-color-accent-soft), rgba(58, 167, 196, 0.15));
}
.mst-canvas-card__placeholder-label {
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-canvas-card__body {
  padding: 0.9rem 1rem;
}
.mst-canvas-card__title {
  margin: 0 0 0.25rem;
  font-size: var(--mst-font-size-md);
  font-weight: 600;
  color: var(--mst-color-text);
}
.mst-canvas-card__meta {
  margin: 0;
  font-size: var(--mst-font-size-xs);
  color: var(--mst-color-text-soft);
}
.mst-canvas-card__author {
  font-weight: 500;
  color: var(--mst-color-text);
}
.mst-canvas-card__fav {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--mst-radius-sm);
  background: rgba(255, 255, 255, 0.9);
  color: var(--mst-color-text-soft);
  font-size: 1.1rem;
  cursor: pointer;
  transition: color var(--mst-duration-fast), background var(--mst-duration-fast);
}
.mst-canvas-card__fav:hover {
  background: rgba(255, 255, 255, 1);
  color: var(--mst-color-accent);
}
.mst-canvas-card__fav--on {
  color: var(--mst-color-accent);
}
.mst-canvas-card__msg {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  padding: 0.35rem 0.6rem;
  font-size: var(--mst-font-size-xs);
  font-weight: 600;
  border: none;
  border-radius: var(--mst-radius-sm);
  background: var(--mst-color-accent);
  color: white;
  cursor: pointer;
  transition: opacity var(--mst-duration-fast);
}
.mst-canvas-card__msg:hover {
  opacity: 0.9;
}
</style>
