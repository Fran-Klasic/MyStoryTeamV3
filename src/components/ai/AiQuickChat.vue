<script setup lang="ts">
import { ref, watch } from "vue";
import { useAiStore } from "@/store/ai.store";
import MstButton from "@/components/common/MstButton.vue";
import AiMessageContent from "./AiMessageContent.vue";

const aiStore = useAiStore();
const input = ref("");

async function send() {
  const text = input.value.trim();
  if (!text || aiStore.sending) return;
  const ok = await aiStore.sendMessage(text);
  if (ok) input.value = "";
}

function close() {
  aiStore.closeQuickChat();
}

function isAiMessage(msg: { type: string }) {
  return msg.type === "response" || msg.type === "assistant";
}

function displayRole(msg: { type: string }): string {
  return isAiMessage(msg) ? "AI" : "You";
}

function messageRoleClass(msg: { type: string }): string {
  return isAiMessage(msg) ? "ai" : "user";
}

// When quick chat opens without a conversation, auto-create one
watch(
  () => aiStore.isQuickChatOpen,
  async (open) => {
    if (open && aiStore.currentConversationId == null) {
      await aiStore.loadConversations();
      if (aiStore.conversations.length === 0) {
        await aiStore.createConversation("Quick chat");
      } else {
        const first = aiStore.conversations[0];
        if (first) await aiStore.selectConversation(first.id);
      }
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <div v-if="aiStore.isQuickChatOpen" class="mst-ai-quickchat">
      <div class="mst-ai-quickchat__backdrop" @click="close" />
      <div class="mst-ai-quickchat__panel">
        <header class="mst-ai-quickchat__header">
          <h3 class="mst-ai-quickchat__title">AI Helper</h3>
          <button
            type="button"
            class="mst-ai-quickchat__close"
            aria-label="Close"
            @click="close"
          >
            ×
          </button>
        </header>
        <div class="mst-ai-quickchat__history">
          <div
            v-for="msg in aiStore.messages"
            :key="msg.id"
            class="mst-ai-quickchat__message"
            :class="'mst-ai-quickchat__message--' + messageRoleClass(msg)"
          >
            <span class="mst-ai-quickchat__message-role">{{
              displayRole(msg)
            }}</span>
            <p class="mst-ai-quickchat__message-content">
              <AiMessageContent
                v-if="isAiMessage(msg)"
                :content="msg.content"
                :animate="
                  aiStore.messages[aiStore.messages.length - 1]?.id === msg.id
                "
              />
              <template v-else>{{ msg.content }}</template>
            </p>
          </div>
          <p
            v-if="aiStore.messages.length === 0"
            class="mst-ai-quickchat__placeholder"
          >
            Ask about tasks, canvases, or planning.
          </p>
        </div>
        <form class="mst-ai-quickchat__form" @submit.prevent="send">
          <input
            v-model="input"
            type="text"
            class="mst-ai-quickchat__input"
            placeholder="Type a message…"
            :disabled="aiStore.sending"
          />
          <MstButton
            type="submit"
            variant="primary"
            :disabled="aiStore.sending || !input.trim()"
          >
            {{ aiStore.sending ? "…" : "Send" }}
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
  height: 85vh;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  min-height: 0;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
.mst-ai-quickchat__message {
  margin-bottom: 1rem;
  align-self: flex-end;
}
.mst-ai-quickchat__message--ai {
  align-self: flex-start;
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
.mst-ai-quickchat__message--ai .mst-ai-quickchat__message-content {
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
  flex-shrink: 0;
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
