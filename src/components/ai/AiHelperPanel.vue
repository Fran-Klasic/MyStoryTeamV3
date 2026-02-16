<script setup lang="ts">
import { ref, computed } from "vue";
import { useAiStore } from "@/store/ai.store";
import MstButton from "@/components/common/MstButton.vue";

const aiStore = useAiStore();
const input = ref("");
const sending = ref(false);
const filter = ref<"all" | "canvas" | "planning">("all");

const filteredHistory = computed(() => {
  if (filter.value === "all") return aiStore.history;
  return aiStore.history.filter((m) => m.role === "assistant");
});

async function send() {
  const text = input.value.trim();
  if (!text || sending.value) return;
  input.value = "";
  sending.value = true;
  try {
    await aiStore.sendMessage(text);
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <div class="mst-ai-helper-panel">
    <header class="mst-ai-helper-panel__header">
      <h2 class="mst-ai-helper-panel__title">AI Helper</h2>
      <p class="mst-ai-helper-panel__subtitle">Planning assistant (mocked responses).</p>
    </header>
    <div class="mst-ai-helper-panel__filters">
      <button
        type="button"
        class="mst-ai-helper-panel__filter"
        :class="{ 'mst-ai-helper-panel__filter--on': filter === 'all' }"
        @click="filter = 'all'"
      >
        All
      </button>
      <button
        type="button"
        class="mst-ai-helper-panel__filter"
        :class="{ 'mst-ai-helper-panel__filter--on': filter === 'canvas' }"
        @click="filter = 'canvas'"
      >
        Canvas
      </button>
      <button
        type="button"
        class="mst-ai-helper-panel__filter"
        :class="{ 'mst-ai-helper-panel__filter--on': filter === 'planning' }"
        @click="filter = 'planning'"
      >
        Planning
      </button>
    </div>
    <div class="mst-ai-helper-panel__history">
      <div
        v-for="msg in filteredHistory"
        :key="msg.id"
        class="mst-ai-helper-panel__message"
        :class="'mst-ai-helper-panel__message--' + msg.role"
      >
        <span class="mst-ai-helper-panel__message-role">{{ msg.role === "user" ? "You" : "AI" }}</span>
        <p class="mst-ai-helper-panel__message-content">{{ msg.content }}</p>
      </div>
      <p v-if="filteredHistory.length === 0" class="mst-ai-helper-panel__empty">
        No messages yet. Send a message below or use Ctrl+K for quick chat.
      </p>
    </div>
    <form class="mst-ai-helper-panel__form" @submit.prevent="send">
      <input
        v-model="input"
        type="text"
        class="mst-ai-helper-panel__input"
        placeholder="Ask about tasks, canvases, or planning…"
        :disabled="sending"
      />
      <MstButton type="submit" variant="primary" :disabled="sending || !input.trim()">
        {{ sending ? "…" : "Send" }}
      </MstButton>
    </form>
  </div>
</template>

<style scoped>
.mst-ai-helper-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}
.mst-ai-helper-panel__header {
  margin-bottom: 1rem;
}
.mst-ai-helper-panel__title {
  margin: 0 0 0.25rem;
  font-size: var(--mst-font-size-xl);
  font-weight: 700;
  color: var(--mst-color-text);
}
.mst-ai-helper-panel__subtitle {
  margin: 0;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-ai-helper-panel__filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.mst-ai-helper-panel__filter {
  padding: 0.4rem 0.75rem;
  border: 1px solid rgba(58, 167, 196, 0.5);
  border-radius: var(--mst-radius-pill);
  background: transparent;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
  cursor: pointer;
  transition: background var(--mst-duration-fast), color var(--mst-duration-fast);
}
.mst-ai-helper-panel__filter:hover {
  background: var(--mst-color-accent-soft);
  color: var(--mst-color-text);
}
.mst-ai-helper-panel__filter--on {
  background: var(--mst-color-accent-soft);
  color: var(--mst-color-text);
  border-color: var(--mst-color-accent);
}
.mst-ai-helper-panel__history {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--mst-radius-md);
  border: 1px solid rgba(58, 167, 196, 0.25);
  margin-bottom: 1rem;
}
.mst-ai-helper-panel__message {
  margin-bottom: 1rem;
}
.mst-ai-helper-panel__message-role {
  font-size: var(--mst-font-size-xs);
  font-weight: 600;
  color: var(--mst-color-text-soft);
}
.mst-ai-helper-panel__message-content {
  margin: 0.25rem 0 0;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text);
}
.mst-ai-helper-panel__message--assistant .mst-ai-helper-panel__message-content {
  padding: 0.5rem;
  background: var(--mst-color-accent-soft);
  border-radius: var(--mst-radius-sm);
}
.mst-ai-helper-panel__empty {
  margin: 0;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-ai-helper-panel__form {
  display: flex;
  gap: 0.5rem;
}
.mst-ai-helper-panel__input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  border: 1px solid rgba(58, 167, 196, 0.5);
  border-radius: var(--mst-radius-md);
  font-size: var(--mst-font-size-sm);
  outline: none;
}
</style>
