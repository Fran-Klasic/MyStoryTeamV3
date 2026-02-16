<script setup lang="ts">
import { ref } from "vue";

const selectedChat = ref<string | null>(null);
const mockChats = [
  { id: "1", name: "Support", lastMessage: "Welcome! How can we help?" },
  { id: "2", name: "Planning Group", lastMessage: "Next session: Friday 3pm" },
];
</script>

<template>
  <div class="mst-messages">
    <header class="mst-messages__header">
      <h1 class="mst-messages__title">Messages</h1>
      <p class="mst-messages__subtitle">Direct messages and group chats (placeholder).</p>
    </header>
    <div class="mst-messages__layout">
      <aside class="mst-messages__list">
        <button
          v-for="chat in mockChats"
          :key="chat.id"
          type="button"
          class="mst-messages__item"
          :class="{ 'mst-messages__item--active': selectedChat === chat.id }"
          @click="selectedChat = chat.id"
        >
          <span class="mst-messages__item-name">{{ chat.name }}</span>
          <span class="mst-messages__item-preview">{{ chat.lastMessage }}</span>
        </button>
      </aside>
      <main class="mst-messages__panel">
        <p v-if="!selectedChat" class="mst-messages__placeholder">
          Select a conversation
        </p>
        <div v-else class="mst-messages__thread">
          <p class="mst-messages__placeholder">Chat thread UI coming soon.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.mst-messages__header {
  margin-bottom: 1.5rem;
}
.mst-messages__title {
  margin: 0 0 0.25rem;
  font-size: var(--mst-font-size-xl);
  font-weight: 700;
  color: var(--mst-color-text);
}
.mst-messages__subtitle {
  margin: 0;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-messages__layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
  min-height: 400px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--mst-radius-lg);
  border: 1px solid rgba(58, 167, 196, 0.35);
  overflow: hidden;
}
.mst-messages__list {
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(58, 167, 196, 0.25);
}
.mst-messages__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background var(--mst-duration-fast);
}
.mst-messages__item:hover {
  background: rgba(68, 211, 255, 0.08);
}
.mst-messages__item--active {
  background: var(--mst-color-accent-soft);
}
.mst-messages__item-name {
  font-weight: 600;
  color: var(--mst-color-text);
}
.mst-messages__item-preview {
  font-size: var(--mst-font-size-xs);
  color: var(--mst-color-text-soft);
  margin-top: 0.2rem;
}
.mst-messages__panel {
  padding: 1.5rem;
}
.mst-messages__placeholder {
  color: var(--mst-color-text-soft);
  font-size: var(--mst-font-size-sm);
  margin: 0;
}
.mst-messages__thread {
  padding: 0;
}
</style>
