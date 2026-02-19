<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useMessageStore } from "@/store/message.store";
import { useAuthStore } from "@/store/auth.store";

const route = useRoute();
const messageStore = useMessageStore();
const authStore = useAuthStore();

const newMessageText = ref("");
const showNewConversation = ref(false);
const newConversationUserId = ref("");
const newConversationError = ref("");
const newConversationLoading = ref(false);
const messagesContainerRef = ref<HTMLElement | null>(null);
const usernameBySenderId = ref<Record<string, string>>({});
const editingConvName = ref<string | null>(null);
const editingConvNameValue = ref("");

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

function truncatePreview(text: string, maxLen = 40) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + "…";
}

function isOwnMessage(senderId: string) {
  return senderId === currentUserId.value;
}

function displayName(senderId: string): string {
  return usernameBySenderId.value[senderId] ?? `User#${senderId}`;
}

function getConvDisplayName(conv: { id: string; otherUserId: string }): string {
  return messageStore.getConversationDisplayName(conv.id, "Conversation");
}

function startEditConvName() {
  const convId = messageStore.currentConversationId;
  const conv = messageStore.currentConversation;
  if (!convId || !conv) return;
  const current = messageStore.getConversationDisplayName(convId, "Conversation");
  editingConvName.value = convId;
  editingConvNameValue.value = current;
}

async function saveConvName() {
  const convId = editingConvName.value;
  const val = editingConvNameValue.value.trim();
  if (!convId || !val) {
    editingConvName.value = null;
    return;
  }
  const ok = await messageStore.updateConversationName(convId, val);
  editingConvName.value = null;
  if (!ok) {
    editingConvNameValue.value = "";
  }
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
  newConversationError.value = "";
}

async function handleStartNewConversation() {
  const input = newConversationUserId.value.trim();
  if (!input) return;
  if (!authStore.isAuthenticated) {
    newConversationError.value = "You must be signed in to start a conversation.";
    return;
  }
  if (!authStore.user?.id) {
    newConversationLoading.value = true;
    newConversationError.value = "";
    try {
      await authStore.refreshUser();
    } finally {
      newConversationLoading.value = false;
    }
    if (!authStore.user?.id) {
      newConversationError.value = "Could not load your profile. Please refresh the page.";
      return;
    }
  }
  const parsed = messageStore.parseUsernameIdInput(input);
  if (parsed.length === 0) {
    newConversationError.value = "Invalid format. Use username#id (e.g. test#1)";
    return;
  }
  newConversationError.value = "";
  newConversationLoading.value = true;
  try {
    const convId = await messageStore.startConversationWith(input);
    if (convId) {
      showNewConversation.value = false;
      newConversationUserId.value = "";
    } else {
      newConversationError.value = "Could not create conversation. Check the user ID exists.";
    }
  } finally {
    newConversationLoading.value = false;
  }
}

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user?.id) {
    await authStore.refreshUser();
  }
  await messageStore.loadConversations();
  const userId = route.query.userId;
  if (typeof userId === "string" && userId) {
    await messageStore.startConversationWith(userId);
  }
});

onBeforeUnmount(() => {
  messageStore.stopPolling();
});

watch(
  () => route.query.userId,
  async (userId) => {
    if (typeof userId === "string" && userId) {
      await messageStore.startConversationWith(userId);
    }
  }
);

watch(
  () => messageStore.messages,
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

watch(
  () => messageStore.messages,
  async () => {
    const msgs = messageStore.messages;
    const ids = [...new Set(msgs.map((m) => m.senderId))];
    const next: Record<string, string> = { ...usernameBySenderId.value };
    for (const id of ids) {
      if (!next[id]) {
        next[id] = await messageStore.getUsernameForSender(id);
      }
    }
    usernameBySenderId.value = next;
  },
  { immediate: true }
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
          <span class="mst-messages__item-name">{{ getConvDisplayName(conv) }}</span>
          <span class="mst-messages__item-preview">
            <template v-if="messageStore.getLastMessagePreview(conv.id)">
              {{ truncatePreview(messageStore.getLastMessagePreview(conv.id)!.content) }}
            </template>
            <template v-else>
              {{ formatDate(conv.createdAt) }}
            </template>
          </span>
        </button>
      </aside>
      <main class="mst-messages__panel">
        <p v-if="!messageStore.currentConversationId" class="mst-messages__placeholder">
          Select a conversation
        </p>
        <div v-else class="mst-messages__thread">
          <header class="mst-messages__thread-header">
            <template v-if="editingConvName === messageStore.currentConversationId">
              <input
                v-model="editingConvNameValue"
                type="text"
                class="mst-messages__thread-name-input"
                placeholder="Conversation name"
                @blur="saveConvName"
                @keydown.enter="saveConvName"
              />
            </template>
            <template v-else>
              <span class="mst-messages__thread-name">
                {{ messageStore.currentConversation && getConvDisplayName(messageStore.currentConversation) }}
              </span>
              <button
                type="button"
                class="mst-messages__thread-edit"
                title="Edit conversation name"
                @click="startEditConvName"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </template>
          </header>
          <div class="mst-messages__thread-content">
            <p v-if="messageStore.loading && messageStore.messages.length === 0" class="mst-messages__loading">
              Loading messages…
            </p>
            <p
              v-else-if="messageStore.messages.length === 0"
              class="mst-messages__empty-thread"
            >
              No messages yet. Start the conversation!
            </p>
            <div
              v-else
              ref="messagesContainerRef"
              class="mst-messages__messages"
            >
              <div
                v-for="msg in messageStore.messages"
                :key="msg.id"
                class="mst-messages__bubble"
                :class="{ 'mst-messages__bubble--own': isOwnMessage(msg.senderId) }"
              >
                <span class="mst-messages__bubble-username">{{ displayName(msg.senderId) }}</span>
                <span class="mst-messages__bubble-content">{{ msg.content }}</span>
                <span class="mst-messages__bubble-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
            </div>
          </div>
          <form class="mst-messages__compose" @submit.prevent="handleSendMessage">
            <div class="mst-messages__compose-row">
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
                @click.prevent="handleSendMessage"
              >
                {{ messageStore.sending ? "Sending…" : "Send" }}
              </button>
            </div>
            <p v-if="messageStore.sendError" class="mst-messages__send-error">
              {{ messageStore.sendError }}
            </p>
          </form>
        </div>
      </main>
    </div>

    <!-- New conversation modal -->
    <div v-if="showNewConversation" class="mst-messages__modal-overlay" @click.self="showNewConversation = false">
      <div class="mst-messages__modal">
        <h3 class="mst-messages__modal-title">New conversation</h3>
        <p class="mst-messages__modal-desc">Enter the user in format <strong>username#id</strong> (e.g. test#1). For multiple users, separate with commas.</p>
        <input
          v-model="newConversationUserId"
          type="text"
          class="mst-messages__input"
          placeholder="username#id (e.g. test#1)"
          :disabled="newConversationLoading"
          @keydown.enter="handleStartNewConversation"
        />
        <p v-if="newConversationError" class="mst-messages__modal-error">{{ newConversationError }}</p>
        <div class="mst-messages__modal-actions">
          <button type="button" class="mst-messages__modal-btn mst-messages__modal-btn--secondary" :disabled="newConversationLoading" @click="showNewConversation = false">
            Cancel
          </button>
          <button
            type="button"
            class="mst-messages__modal-btn mst-messages__modal-btn--primary"
            :disabled="!newConversationUserId.trim() || newConversationLoading"
            @click="handleStartNewConversation"
          >
            {{ newConversationLoading ? "Starting…" : "Start" }}
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
.mst-messages__empty,
.mst-messages__empty-thread {
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
.mst-messages__thread-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid rgba(58, 167, 196, 0.25);
  background: rgba(255, 255, 255, 0.6);
}
.mst-messages__thread-name {
  font-weight: 600;
  font-size: var(--mst-font-size-base);
  color: var(--mst-color-text);
}
.mst-messages__thread-name-input {
  flex: 1;
  padding: 0.4rem 0.75rem;
  font-size: var(--mst-font-size-sm);
  border: 1px solid rgba(58, 167, 196, 0.4);
  border-radius: var(--mst-radius-md);
  background: white;
  outline: none;
}
.mst-messages__thread-name-input:focus {
  border-color: var(--mst-color-accent);
}
.mst-messages__thread-edit {
  padding: 0.35rem;
  border: none;
  background: transparent;
  color: var(--mst-color-text-soft);
  cursor: pointer;
  border-radius: var(--mst-radius-sm);
  transition: color var(--mst-duration-fast), background var(--mst-duration-fast);
}
.mst-messages__thread-edit:hover {
  color: var(--mst-color-accent);
  background: rgba(58, 167, 196, 0.15);
}
.mst-messages__thread-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
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
  align-self: flex-end;
}
.mst-messages__bubble--own {
  align-self: flex-start;
  background: var(--mst-color-accent-soft);
  color: var(--mst-color-text);
}
.mst-messages__bubble-username {
  display: block;
  font-size: var(--mst-font-size-xs);
  color: var(--mst-color-text-soft);
  margin-bottom: 0.15rem;
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
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(58, 167, 196, 0.25);
  background: rgba(255, 255, 255, 0.5);
}
.mst-messages__compose-row {
  display: flex;
  gap: 0.5rem;
}
.mst-messages__send-error {
  margin: 0;
  font-size: var(--mst-font-size-xs);
  color: #c53030;
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
  margin-bottom: 0.5rem;
}
.mst-messages__modal-error {
  margin: 0 0 1rem;
  font-size: var(--mst-font-size-sm);
  color: #c53030;
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
