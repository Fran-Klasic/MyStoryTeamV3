<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useAiStore } from "@/store/ai.store";
import { useAuthStore } from "@/store/auth.store";
import { useMediaQuery } from "@/composables/useMediaQuery";
import type { AiConversationSummary } from "@/types/ai";
import AiMessageContent from "./AiMessageContent.vue";

const aiStore = useAiStore();
const isMobile = useMediaQuery("(max-width: 768px)");
const authStore = useAuthStore();
const input = ref("");
const messagesContainerRef = ref<HTMLElement | null>(null);
const editingConvId = ref<number | null>(null);
const editingConvValue = ref("");
const newConvLoading = ref(false);
const newConvError = ref("");

const sortedConversations = computed(() => {
  const list = [...aiStore.conversations];
  return list;
});

function getConvDisplayName(conv: AiConversationSummary): string {
  return aiStore.getConversationDisplayName(conv.id, "Conversation");
}

function startEditConvName() {
  const conv = aiStore.currentConversation;
  if (!conv) return;
  const current = aiStore.getConversationDisplayName(conv.id, "Conversation");
  editingConvId.value = conv.id;
  editingConvValue.value = current;
}

async function saveConvName() {
  const convId = editingConvId.value;
  const val = editingConvValue.value.trim();
  if (convId == null || !val) {
    editingConvId.value = null;
    return;
  }
  const ok = await aiStore.updateConversationTitle(convId, val);
  editingConvId.value = null;
  if (!ok) {
    editingConvValue.value = "";
  }
}

async function handleSelectConversation(id: number) {
  await aiStore.selectConversation(id);
}

async function handleNewConversation() {
  if (newConvLoading.value) return;
  newConvError.value = "";
  newConvLoading.value = true;
  try {
    if (authStore.isAuthenticated && !authStore.user?.id) {
      await authStore.refreshUser();
    }
    if (!authStore.user?.id) {
      newConvError.value = "Please sign in to create a conversation.";
      return;
    }
    const id = await aiStore.createConversation("New conversation");
    if (id) {
      /* selectConversation already called by createConversation */
    } else {
      newConvError.value = "Could not create conversation. Please try again.";
    }
  } catch {
    newConvError.value = "Could not create conversation. Please try again.";
  } finally {
    newConvLoading.value = false;
  }
}

async function handleSend() {
  const text = input.value.trim();
  if (!text || aiStore.sending) return;
  const ok = await aiStore.sendMessage(text);
  if (ok) input.value = "";
}

function isAiMessage(msg: { type: string }) {
  return msg.type === "response" || msg.type === "assistant";
}

function isUserMessage(msg: { type: string }) {
  return msg.type === "request" || msg.type === "user";
}

function displayRole(msg: { type: string }): string {
  return isAiMessage(msg) ? "AI" : "You";
}

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user?.id) {
    await authStore.refreshUser();
  }
  await aiStore.loadConversations();
});

watch(
  () => aiStore.messages,
  () => {
    nextTick(() => {
      const el = messagesContainerRef.value;
      if (!el) return;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      if (nearBottom) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
    });
  },
  { flush: "post" }
);
</script>

<template>
  <div class="mst-ai-helper">
    <header class="mst-ai-helper__header">
      <h2 class="mst-ai-helper__title">AI Helper</h2>
      <p class="mst-ai-helper__subtitle">Planning assistant powered by AI.</p>
    </header>
    <div
      class="mst-ai-helper__layout"
      :class="{
        'mst-ai-helper__layout--mobile-thread': isMobile && aiStore.currentConversationId != null,
      }"
    >
      <aside
        class="mst-ai-helper__list"
        :class="{ 'mst-ai-helper__list--hidden': isMobile && aiStore.currentConversationId != null }"
      >
        <button
          type="button"
          class="mst-ai-helper__new-btn"
          :disabled="newConvLoading"
          @click="handleNewConversation"
        >
          {{ newConvLoading ? "Creating…" : "+ New conversation" }}
        </button>
        <p v-if="newConvError" class="mst-ai-helper__error">{{ newConvError }}</p>
        <p v-if="aiStore.loading && sortedConversations.length === 0" class="mst-ai-helper__loading">
          Loading…
        </p>
        <p v-else-if="sortedConversations.length === 0" class="mst-ai-helper__empty">
          No conversations yet.
        </p>
        <button
          v-for="conv in sortedConversations"
          :key="conv.id"
          type="button"
          class="mst-ai-helper__item"
          :class="{ 'mst-ai-helper__item--active': aiStore.currentConversationId === conv.id }"
          @click="handleSelectConversation(conv.id)"
        >
          <span class="mst-ai-helper__item-name">{{ getConvDisplayName(conv) }}</span>
        </button>
      </aside>
      <main
        class="mst-ai-helper__panel"
        :class="{ 'mst-ai-helper__panel--hidden': isMobile && aiStore.currentConversationId == null }"
      >
        <p v-if="aiStore.currentConversationId == null" class="mst-ai-helper__placeholder">
          Select or create a conversation
        </p>
        <div v-else class="mst-ai-helper__thread">
          <header class="mst-ai-helper__thread-header">
            <button
              v-if="isMobile"
              type="button"
              class="mst-ai-helper__back-btn"
              aria-label="Back to conversations"
              @click="aiStore.backToConversations"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <template v-if="editingConvId === aiStore.currentConversationId">
              <input
                v-model="editingConvValue"
                type="text"
                class="mst-ai-helper__thread-name-input"
                placeholder="Conversation name"
                @blur="saveConvName"
                @keydown.enter="saveConvName"
              />
            </template>
            <template v-else>
              <span class="mst-ai-helper__thread-name">
                {{ aiStore.currentConversation && getConvDisplayName(aiStore.currentConversation) }}
              </span>
              <button
                type="button"
                class="mst-ai-helper__thread-edit"
                title="Edit conversation name"
                @click="startEditConvName"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </template>
          </header>
          <div class="mst-ai-helper__thread-content" ref="messagesContainerRef">
            <p v-if="aiStore.loading && aiStore.messages.length === 0" class="mst-ai-helper__loading">
              Loading messages…
            </p>
            <p
              v-else-if="aiStore.messages.length === 0"
              class="mst-ai-helper__empty-thread"
            >
              No messages yet. Start the conversation!
            </p>
            <div v-else class="mst-ai-helper__messages">
              <div
                v-for="msg in aiStore.messages"
                :key="msg.id"
                class="mst-ai-helper__bubble"
                :class="{
                  'mst-ai-helper__bubble--ai': isAiMessage(msg),
                  'mst-ai-helper__bubble--own': isUserMessage(msg),
                }"
              >
                <span class="mst-ai-helper__bubble-role">{{ displayRole(msg) }}</span>
                <span class="mst-ai-helper__bubble-content">
                  <AiMessageContent
                    v-if="isAiMessage(msg)"
                    :content="msg.content"
                    :animate="
                      aiStore.messages[aiStore.messages.length - 1]?.id === msg.id
                    "
                  />
                  <template v-else>{{ msg.content }}</template>
                </span>
              </div>
            </div>
          </div>
          <form class="mst-ai-helper__compose" @submit.prevent="handleSend">
            <div class="mst-ai-helper__compose-row">
              <input
                v-model="input"
                type="text"
                class="mst-ai-helper__input"
                placeholder="Ask about tasks, canvases, or planning…"
                maxlength="4000"
                :disabled="aiStore.sending"
              />
              <button
                type="submit"
                class="mst-ai-helper__send"
                :disabled="!input.trim() || aiStore.sending"
              >
                {{ aiStore.sending ? "Sending…" : "Send" }}
              </button>
            </div>
            <p v-if="aiStore.sendError" class="mst-ai-helper__send-error">
              {{ aiStore.sendError }}
            </p>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.mst-ai-helper__header {
  margin-bottom: 1.5rem;
}
.mst-ai-helper__title {
  margin: 0 0 0.25rem;
  font-size: var(--mst-font-size-xl);
  font-weight: 700;
  color: var(--mst-color-text);
}
.mst-ai-helper__subtitle {
  margin: 0;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-ai-helper__layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: minmax(0, 1fr);
  gap: 1rem;
  min-height: 400px;
  height: calc(100vh - 10rem);
  max-height: calc(100vh - 10rem);
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--mst-radius-lg);
  border: 1px solid rgba(58, 167, 196, 0.35);
  overflow: hidden;
}
@media (max-width: 768px) {
  .mst-ai-helper__header {
    margin-bottom: 1rem;
  }
  .mst-ai-helper__title {
    font-size: var(--mst-font-size-lg);
  }
  .mst-ai-helper__layout {
    grid-template-columns: 1fr;
    height: calc(100vh - 8rem);
    min-height: 50vh;
    max-height: calc(100vh - 8rem);
  }
  .mst-ai-helper__list--hidden {
    display: none !important;
  }
  .mst-ai-helper__panel--hidden {
    display: none !important;
  }
  .mst-ai-helper__new-btn {
    margin: 0.5rem 0.75rem;
    padding: 0.75rem 1rem;
    min-height: 44px;
  }
}
.mst-ai-helper__list {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid rgba(58, 167, 196, 0.25);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}
.mst-ai-helper__new-btn {
  margin: 0.75rem;
  padding: 0.6rem 1rem;
  font-size: var(--mst-font-size-sm);
  font-weight: 600;
  color: var(--mst-color-accent);
  background: var(--mst-color-accent-soft);
  border: 1px solid rgba(58, 167, 196, 0.4);
  border-radius: var(--mst-radius-md);
  cursor: pointer;
  transition: background var(--mst-duration-fast), color var(--mst-duration-fast);
}
.mst-ai-helper__new-btn:hover:not(:disabled) {
  background: rgba(58, 167, 196, 0.2);
}
.mst-ai-helper__new-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.mst-ai-helper__error {
  margin: 0 0.75rem;
  padding: 0.5rem;
  font-size: var(--mst-font-size-xs);
  color: #c53030;
}
.mst-ai-helper__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.875rem 1rem;
  min-height: 44px;
  touch-action: manipulation;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background var(--mst-duration-fast);
}
.mst-ai-helper__item:hover {
  background: rgba(68, 211, 255, 0.08);
}
.mst-ai-helper__item--active {
  background: var(--mst-color-accent-soft);
}
.mst-ai-helper__item-name {
  font-weight: 600;
  color: var(--mst-color-text);
}
.mst-ai-helper__panel {
  display: flex;
  flex-direction: column;
  padding: 0;
  min-height: 0;
  overflow: hidden;
}
.mst-ai-helper__placeholder,
.mst-ai-helper__loading,
.mst-ai-helper__empty,
.mst-ai-helper__empty-thread {
  color: var(--mst-color-text-soft);
  font-size: var(--mst-font-size-sm);
  margin: 0;
  padding: 1.5rem;
}
.mst-ai-helper__thread {
  display: grid;
  grid-template-rows: auto 1fr auto;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.mst-ai-helper__thread-header {
  grid-row: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(58, 167, 196, 0.25);
  background: rgba(255, 255, 255, 0.6);
}
.mst-ai-helper__back-btn {
  flex-shrink: 0;
  padding: 0.35rem;
  margin: -0.35rem 0 -0.35rem -0.35rem;
  border: none;
  background: transparent;
  color: var(--mst-color-text-soft);
  cursor: pointer;
  border-radius: var(--mst-radius-sm);
  touch-action: manipulation;
}
.mst-ai-helper__back-btn:hover {
  color: var(--mst-color-accent);
  background: rgba(58, 167, 196, 0.15);
}
.mst-ai-helper__thread-name {
  font-weight: 600;
  font-size: var(--mst-font-size-base);
  color: var(--mst-color-text);
}
.mst-ai-helper__thread-name-input {
  flex: 1;
  padding: 0.4rem 0.75rem;
  font-size: var(--mst-font-size-sm);
  border: 1px solid rgba(58, 167, 196, 0.4);
  border-radius: var(--mst-radius-md);
  background: white;
  outline: none;
}
.mst-ai-helper__thread-name-input:focus {
  border-color: var(--mst-color-accent);
}
.mst-ai-helper__thread-edit {
  padding: 0.35rem;
  border: none;
  background: transparent;
  color: var(--mst-color-text-soft);
  cursor: pointer;
  border-radius: var(--mst-radius-sm);
  transition: color var(--mst-duration-fast), background var(--mst-duration-fast);
}
.mst-ai-helper__thread-edit:hover {
  color: var(--mst-color-accent);
  background: rgba(58, 167, 196, 0.15);
}
.mst-ai-helper__thread-content {
  grid-row: 2;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior: contain;
  position: relative;
}
.mst-ai-helper__messages {
  min-height: min-content;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.mst-ai-helper__bubble {
  max-width: 75%;
  padding: 0.6rem 1rem;
  border-radius: var(--mst-radius-md);
}
.mst-ai-helper__bubble--ai {
  align-self: flex-start;
  background: var(--mst-color-accent-soft);
  color: var(--mst-color-text);
}
.mst-ai-helper__bubble--own {
  align-self: flex-end;
  background: rgba(58, 167, 196, 0.12);
}
.mst-ai-helper__bubble-role {
  display: block;
  font-size: var(--mst-font-size-xs);
  color: var(--mst-color-text-soft);
  margin-bottom: 0.15rem;
}
.mst-ai-helper__bubble-content {
  display: block;
  font-size: var(--mst-font-size-sm);
  white-space: pre-wrap;
  word-break: break-word;
}
.mst-ai-helper__compose {
  grid-row: 3;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(58, 167, 196, 0.25);
  background: rgba(255, 255, 255, 0.5);
}
.mst-ai-helper__compose-row {
  display: flex;
  gap: 0.5rem;
}
@media (max-width: 768px) {
  .mst-ai-helper__compose,
  .mst-ai-helper__messages {
    padding: 0.75rem 1rem;
  }
  .mst-ai-helper__bubble {
    max-width: 88%;
  }
}
.mst-ai-helper__send-error {
  margin: 0;
  font-size: var(--mst-font-size-xs);
  color: #c53030;
}
.mst-ai-helper__input {
  flex: 1;
  padding: 0.6rem 1rem;
  font-size: var(--mst-font-size-sm);
  border: 1px solid rgba(58, 167, 196, 0.4);
  border-radius: var(--mst-radius-md);
  background: white;
  outline: none;
}
.mst-ai-helper__input:focus {
  border-color: var(--mst-color-accent);
}
.mst-ai-helper__send {
  padding: 0.6rem 1.2rem;
  font-size: var(--mst-font-size-sm);
  font-weight: 600;
  color: white;
  background: var(--mst-color-accent);
  border: none;
  border-radius: var(--mst-radius-md);
  cursor: pointer;
  transition: opacity var(--mst-duration-fast);
}
.mst-ai-helper__send:hover:not(:disabled) {
  opacity: 0.9;
}
.mst-ai-helper__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
