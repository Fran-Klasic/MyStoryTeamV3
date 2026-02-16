<script setup lang="ts">
import { ref } from "vue";
import { useAiStore } from "@/store/ai.store";
import MstButton from "@/components/common/MstButton.vue";

const aiStore = useAiStore();
const input = ref("");
const sending = ref(false);

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

function close() {
  aiStore.closeQuickChat();
}
</script>

<template>
  <Teleport to="body">
    <div v-if="aiStore.isQuickChatOpen" class="mst-ai-quickchat">
      <div class="mst-ai-quickchat__backdrop" @click="close" />
      <div class="mst-ai-quickchat__panel">
        <header class="mst-ai-quickchat__header">
          <h3 class="mst-ai-quickchat__title">AI Helper</h3>
          <button type="button" class="mst-ai-quickchat__close" aria-label="Close" @click="close">
            ×
          </button>
        </header>
        <div class="mst-ai-quickchat__history">
          <div
            v-for="msg in aiStore.history"
            :key="msg.id"
            class="mst-ai-quickchat__message"
            :class="'mst-ai-quickchat__message--' + msg.role"
          >
            <span class="mst-ai-quickchat__message-role">{{ msg.role === "user" ? "You" : "AI" }}</span>
            <p class="mst-ai-quickchat__message-content">{{ msg.content }}</p>
          </div>
          <p v-if="aiStore.history.length === 0" class="mst-ai-quickchat__placeholder">
            Ask about tasks, canvases, or planning. (Mock responses.)
          </p>
        </div>
        <form class="mst-ai-quickchat__form" @submit.prevent="send">
          <input
            v-model="input"
            type="text"
            class="mst-ai-quickchat__input"
            placeholder="Type a message…"
            :disabled="sending"
          />
          <MstButton type="submit" variant="primary" :disabled="sending || !input.trim()">
            {{ sending ? "…" : "Send" }}
          </MstButton>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mst-ai-quickchat {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  pointer-events: none;
}
.mst-ai-quickchat__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}
.mst-ai-quickchat__panel {
  position: relative;
  pointer-events: auto;
  width: 100%;
  max-width: 400px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.98);
  border-radius: var(--mst-radius-lg) var(--mst-radius-lg) 0 0;
  border: 1px solid rgba(58, 167, 196, 0.4);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
}
.mst-ai-quickchat__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(58, 167, 196, 0.25);
}
.mst-ai-quickchat__title {
  margin: 0;
  font-size: var(--mst-font-size-md);
  font-weight: 600;
  color: var(--mst-color-text);
}
.mst-ai-quickchat__close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  color: var(--mst-color-text-soft);
  cursor: pointer;
  line-height: 1;
}
.mst-ai-quickchat__history {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  min-height: 200px;
  max-height: 50vh;
}
.mst-ai-quickchat__message {
  margin-bottom: 1rem;
}
.mst-ai-quickchat__message-role {
  font-size: var(--mst-font-size-xs);
  font-weight: 600;
  color: var(--mst-color-text-soft);
}
.mst-ai-quickchat__message-content {
  margin: 0.25rem 0 0;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text);
}
.mst-ai-quickchat__message--assistant .mst-ai-quickchat__message-content {
  padding: 0.5rem;
  background: var(--mst-color-accent-soft);
  border-radius: var(--mst-radius-sm);
}
.mst-ai-quickchat__placeholder {
  margin: 0;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-ai-quickchat__form {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid rgba(58, 167, 196, 0.25);
}
.mst-ai-quickchat__input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  border: 1px solid rgba(58, 167, 196, 0.5);
  border-radius: var(--mst-radius-md);
  font-size: var(--mst-font-size-sm);
  outline: none;
}
</style>
