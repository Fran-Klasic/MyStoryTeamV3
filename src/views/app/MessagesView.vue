<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useMessageStore } from "@/store/message.store";
import { useAuthStore } from "@/store/auth.store";

const route = useRoute();
const messageStore = useMessageStore();
const authStore = useAuthStore();

const newMessageText = ref("");
const showNewConversation = ref(false);
const newConversationUserId = ref("");

const currentUserId = computed(() => authStore.user?.id ?? null);

const sortedConversations = computed(() => {
  const list = [...messageStore.conversations];
  list.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return list;
});

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: new Date(iso).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function isOwnMessage(senderId: string) {
  return senderId === currentUserId.value;
}

async function handleSelectConversation(id: string) {
  await messageStore.selectConversation(id);
}

async function handleSendMessage() {
  const text = newMessageText.value.trim();
  if (!text || messageStore.sending) return;
  const ok = await messageStore.sendMessage(text);
  if (ok) newMessageText.value = "";
}

function openNewConversation() {
  showNewConversation.value = true;
  newConversationUserId.value = "";
}

async function handleStartNewConversation() {
  const userId = newConversationUserId.value.trim();
  if (!userId) return;
  const convId = await messageStore.startConversationWith(userId);
  if (convId) {
    showNewConversation.value = false;
    newConversationUserId.value = "";
  }
}

onMounted(async () => {
  await messageStore.loadConversations();
  const userId = route.query.userId;
  if (typeof userId === "string" && userId) {
    await messageStore.startConversationWith(userId);
  }
});

watch(
  () => route.query.userId,
  async (userId) => {
    if (typeof userId === "string" && userId) {
      await messageStore.startConversationWith(userId);
    }
  }
);
</script>

<template>
  <div class="mst-messages">
    <header class="mst-messages__header">
      <h1 class="mst-messages__title">Messages</h1>
      <p class="mst-messages__subtitle">Direct messages with other users.</p>
    </header>
    <div class="mst-messages__layout">
      <aside class="mst-messages__list">
        <button
          type="button"
          class="mst-messages__new-btn"
          @click="openNewConversation"
        >
          + New message
        </button>
        <p v-if="messageStore.loading && sortedConversations.length === 0" class="mst-messages__loading">
          Loading conversations…
        </p>
        <p v-else-if="sortedConversations.length === 0" class="mst-messages__empty">
          No conversations yet.
        </p>
        <button
          v-for="conv in sortedConversations"
          :key="conv.id"
          type="button"
          class="mst-messages__item"
          :class="{ 'mst-messages__item--active': messageStore.currentConversationId === conv.id }"
          @click="handleSelectConversation(conv.id)"
        >
          <span class="mst-messages__item-name">User {{ conv.otherUserId }}</span>
          <span class="mst-messages__item-preview">{{ formatDate(conv.createdAt) }}</span>
        </button>
      </aside>
      <main class="mst-messages__panel">
        <p v-if="!messageStore.currentConversationId" class="mst-messages__placeholder">
          Select a conversation
        </p>
        <div v-else class="mst-messages__thread">
          <p v-if="messageStore.loading && messageStore.messages.length === 0" class="mst-messages__loading">
            Loading messages…
          </p>
          <div v-else class="mst-messages__messages">
            <div
              v-for="msg in messageStore.messages"
              :key="msg.id"
              class="mst-messages__bubble"
              :class="{ 'mst-messages__bubble--own': isOwnMessage(msg.senderId) }"
            >
              <span class="mst-messages__bubble-content">{{ msg.content }}</span>
              <span class="mst-messages__bubble-time">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>
          <form class="mst-messages__compose" @submit.prevent="handleSendMessage">
            <input
              v-model="newMessageText"
              type="text"
              class="mst-messages__input"
              placeholder="Type a message…"
              maxlength="1000"
              :disabled="messageStore.sending"
            />
            <button
              type="submit"
              class="mst-messages__send"
              :disabled="!newMessageText.trim() || messageStore.sending"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>

    <!-- New conversation modal -->
    <div v-if="showNewConversation" class="mst-messages__modal-overlay" @click.self="showNewConversation = false">
      <div class="mst-messages__modal">
        <h3 class="mst-messages__modal-title">New conversation</h3>
        <p class="mst-messages__modal-desc">Enter the user ID of the person you want to message.</p>
        <input
          v-model="newConversationUserId"
          type="text"
          class="mst-messages__input"
          placeholder="User ID"
          @keydown.enter="handleStartNewConversation"
        />
        <div class="mst-messages__modal-actions">
          <button type="button" class="mst-messages__modal-btn mst-messages__modal-btn--secondary" @click="showNewConversation = false">
            Cancel
          </button>
          <button
            type="button"
            class="mst-messages__modal-btn mst-messages__modal-btn--primary"
            :disabled="!newConversationUserId.trim()"
            @click="handleStartNewConversation"
          >
            Start
          </button>
        </div>
      </div>
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
  overflow-y: auto;
}
.mst-messages__new-btn {
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
.mst-messages__new-btn:hover {
  background: rgba(58, 167, 196, 0.2);
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
  display: flex;
  flex-direction: column;
  padding: 0;
  min-height: 0;
}
.mst-messages__placeholder,
.mst-messages__loading,
.mst-messages__empty {
  color: var(--mst-color-text-soft);
  font-size: var(--mst-font-size-sm);
  margin: 0;
  padding: 1.5rem;
}
.mst-messages__thread {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.mst-messages__messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.mst-messages__bubble {
  max-width: 75%;
  padding: 0.6rem 1rem;
  border-radius: var(--mst-radius-md);
  background: rgba(58, 167, 196, 0.12);
  align-self: flex-start;
}
.mst-messages__bubble--own {
  align-self: flex-end;
  background: var(--mst-color-accent-soft);
  color: var(--mst-color-text);
}
.mst-messages__bubble-content {
  display: block;
  font-size: var(--mst-font-size-sm);
  white-space: pre-wrap;
  word-break: break-word;
}
.mst-messages__bubble-time {
  display: block;
  font-size: var(--mst-font-size-xs);
  color: var(--mst-color-text-soft);
  margin-top: 0.25rem;
}
.mst-messages__bubble--own .mst-messages__bubble-time {
  color: inherit;
  opacity: 0.85;
}
.mst-messages__compose {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(58, 167, 196, 0.25);
  background: rgba(255, 255, 255, 0.5);
}
.mst-messages__input {
  flex: 1;
  padding: 0.6rem 1rem;
  font-size: var(--mst-font-size-sm);
  border: 1px solid rgba(58, 167, 196, 0.4);
  border-radius: var(--mst-radius-md);
  background: white;
  outline: none;
}
.mst-messages__input:focus {
  border-color: var(--mst-color-accent);
}
.mst-messages__send {
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
.mst-messages__send:hover:not(:disabled) {
  opacity: 0.9;
}
.mst-messages__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.mst-messages__modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.mst-messages__modal {
  background: white;
  border-radius: var(--mst-radius-lg);
  border: 1px solid rgba(58, 167, 196, 0.35);
  padding: 1.5rem;
  min-width: 320px;
  box-shadow: var(--mst-shadow-glow);
}
.mst-messages__modal-title {
  margin: 0 0 0.5rem;
  font-size: var(--mst-font-size-lg);
  font-weight: 600;
  color: var(--mst-color-text);
}
.mst-messages__modal-desc {
  margin: 0 0 1rem;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-messages__modal .mst-messages__input {
  width: 100%;
  margin-bottom: 1rem;
}
.mst-messages__modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.mst-messages__modal-btn {
  padding: 0.5rem 1rem;
  font-size: var(--mst-font-size-sm);
  font-weight: 500;
  border-radius: var(--mst-radius-md);
  cursor: pointer;
  transition: background var(--mst-duration-fast);
}
.mst-messages__modal-btn--secondary {
  background: transparent;
  border: 1px solid rgba(58, 167, 196, 0.4);
  color: var(--mst-color-text);
}
.mst-messages__modal-btn--secondary:hover {
  background: rgba(58, 167, 196, 0.1);
}
.mst-messages__modal-btn--primary {
  background: var(--mst-color-accent);
  border: none;
  color: white;
}
.mst-messages__modal-btn--primary:hover:not(:disabled) {
  opacity: 0.9;
}
.mst-messages__modal-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
