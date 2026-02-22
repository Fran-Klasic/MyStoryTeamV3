import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAuthStore } from "@/store/auth.store";
import * as messageService from "@/api/message.service";
import * as userService from "@/api/user.service";
import type { ConversationSummary, Message } from "@/types/message";

const POLL_INTERVAL_MS = 2500;

export const useMessageStore = defineStore("message", () => {
  const authStore = useAuthStore();

  const conversations = ref<ConversationSummary[]>([]);
  const currentConversationId = ref<string | null>(null);
  const messages = ref<Message[]>([]);
  const loading = ref(false);
  const sending = ref(false);
  const sendError = ref<string | null>(null);

  let pollingIntervalId: ReturnType<typeof setInterval> | null = null;
  const lastMessageByConversationId = new Map<string, { content: string; createdAt: string }>();
  /** Fallback when backend returns wrong otherUserId (e.g. current user). Set when creating conversation or from messages. */
  const otherParticipantByConversationId = new Map<string, string>();
  /** Cache of usernames by user ID for message display */
  const usernameByUserId = new Map<string, string>();
  /** Cache of conversation names by conversation ID (reactive for view) */
  const conversationNamesByConvId = ref<Record<string, string>>({});

  const currentConversation = computed(() => {
    const id = currentConversationId.value;
    if (!id) return null;
    return conversations.value.find((c) => c.id === id) ?? null;
  });

  const otherUserId = computed(() => {
    const conv = currentConversation.value;
    if (!conv) return null;
    const fromList = conv.otherUserId;
    const currentId = authStore.user?.id;
    const fromFallback = otherParticipantByConversationId.get(conv.id);
    if (fromFallback) return fromFallback;
    if (fromList && currentId && String(fromList) !== String(currentId)) return fromList;
    return fromList || null;
  });

  function updateLastMessageCache(conversationId: string, list: Message[]) {
    const last = list[list.length - 1];
    if (last) {
      lastMessageByConversationId.set(conversationId, {
        content: last.content,
        createdAt: last.createdAt,
      });
    }
  }

  function getLastMessagePreview(conversationId: string): { content: string; createdAt: string } | undefined {
    return lastMessageByConversationId.get(conversationId);
  }

  async function getUsernameForSender(senderId: string): Promise<string> {
    const currentId = authStore.user?.id;
    if (currentId && String(senderId) === String(currentId)) {
      return authStore.user?.username ?? "You";
    }
    const cached = usernameByUserId.get(senderId);
    if (cached) return cached;
    const numId = parseInt(senderId, 10);
    if (Number.isNaN(numId)) return `User#${senderId}`;
    const username = await userService.getUsernameById(numId);
    if (username) {
      usernameByUserId.set(senderId, username);
      return username;
    }
    return `User#${senderId}`;
  }

  function backToConversations() {
    currentConversationId.value = null;
    stopPolling();
  }

  function stopPolling() {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
    }
  }

  function startPolling(conversationId: string) {
    stopPolling();
    pollingIntervalId = setInterval(async () => {
      if (currentConversationId.value !== conversationId) return;
      try {
        const list = await messageService.getMessages(conversationId);
        if (currentConversationId.value === conversationId) {
          messages.value = list;
          updateLastMessageCache(conversationId, list);
          const currentId = authStore.user?.id;
          if (currentId && list.length > 0) {
            const otherSender = list.find((m) => String(m.senderId) !== String(currentId));
            if (otherSender) {
              otherParticipantByConversationId.set(conversationId, String(otherSender.senderId));
            }
          }
        }
      } catch {
        /* 401 handled by api-handler */
      }
    }, POLL_INTERVAL_MS);
  }

  async function loadConversations() {
    loading.value = true;
    try {
      conversations.value = await messageService.getConversations();
      const names: Record<string, string> = {};
      const currentId = authStore.user?.id;
      await Promise.all(
        conversations.value.map(async (conv) => {
          const name = await messageService.getConversationName(conv.id);
          if (name) {
            names[conv.id] = name;
            return;
          }
          const otherId = conv.otherUserId;
          if (otherId && currentId && String(otherId) !== String(currentId)) {
            const username = await userService.getUsernameById(parseInt(otherId, 10));
            if (username) names[conv.id] = username;
          }
        })
      );
      // Replace entirely so refresh always shows API-backed names, not stale cache
      conversationNamesByConvId.value = { ...names };
    } finally {
      loading.value = false;
    }
  }

  function getConversationDisplayName(convId: string, fallback: string): string {
    return conversationNamesByConvId.value[convId] ?? fallback;
  }

  async function updateConversationName(convId: string, name: string): Promise<boolean> {
    const ok = await messageService.updateConversationName(convId, name);
    if (ok) {
      conversationNamesByConvId.value = {
        ...conversationNamesByConvId.value,
        [convId]: name.trim(),
      };
    }
    return ok;
  }

  async function loadMessages(conversationId: string) {
    loading.value = true;
    try {
      const list = await messageService.getMessages(conversationId);
      messages.value = list;
      updateLastMessageCache(conversationId, list);
      const currentId = authStore.user?.id;
      if (currentId && list.length > 0) {
        const otherSender = list.find((m) => String(m.senderId) !== String(currentId));
        if (otherSender) {
          otherParticipantByConversationId.set(conversationId, String(otherSender.senderId));
        }
      }
      for (const msg of list) {
        await getUsernameForSender(msg.senderId);
      }
    } finally {
      loading.value = false;
    }
  }

  async function selectConversation(id: string) {
    if (!id || id.trim() === "") return;
    stopPolling();
    currentConversationId.value = id;
    await loadMessages(id);
    if (!conversationNamesByConvId.value[id]) {
      let name = await messageService.getConversationName(id);
      if (!name) {
        const otherId = otherParticipantByConversationId.get(id);
        const conv = conversations.value.find((c) => c.id === id);
        const fallbackId = otherId ?? (conv && String(conv.otherUserId) !== String(authStore.user?.id) ? conv.otherUserId : null);
        if (fallbackId) {
          const username = await userService.getUsernameById(parseInt(fallbackId, 10));
          if (username) name = username;
        }
      }
      if (name) {
        conversationNamesByConvId.value = {
          ...conversationNamesByConvId.value,
          [id]: name,
        };
      }
    }
    startPolling(id);
  }

  async function createConversation(userIds: number[]): Promise<string | null> {
    loading.value = true;
    try {
      const id = await messageService.createConversation(userIds);
      if (id > 0) {
        await loadConversations();
        return String(id);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function sendMessage(content: string): Promise<boolean> {
    const convId = currentConversationId.value;
    const senderId = authStore.user?.id;
    let receiverId = otherUserId.value;
    if (!receiverId || receiverId === senderId) {
      receiverId = otherParticipantByConversationId.get(convId ?? "") ?? receiverId ?? null;
    }

    if (!convId || !senderId || !content.trim()) return false;
    if (!receiverId) {
      sendError.value = "Could not determine conversation recipient.";
      return false;
    }

    sendError.value = null;
    const trimmed = content.trim();
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      conversationId: convId,
      senderId,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    messages.value = [...messages.value, tempMessage];

    sending.value = true;
    try {
      const id = await messageService.sendMessage(
        convId,
        parseInt(senderId, 10),
        parseInt(receiverId, 10),
        trimmed
      );
      if (id > 0) {
        await loadMessages(convId);
        return true;
      }
      messages.value = messages.value.filter((m) => m.id !== tempId);
      sendError.value = "Could not send message.";
      return false;
    } catch {
      messages.value = messages.value.filter((m) => m.id !== tempId);
      sendError.value = "Could not send message.";
      return false;
    } finally {
      sending.value = false;
    }
  }

  /**
   * Parse "username#id" format (e.g. "test#1") and return the numeric ID.
   * Also accepts comma-separated list: "test#1, john#2" → [1, 2].
   * If input has no #, treats whole string as ID.
   */
  function parseUsernameIdInput(input: string): number[] {
    const trimmed = input.trim();
    if (!trimmed) return [];
    const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    const ids: number[] = [];
    for (const part of parts) {
      const hashIdx = part.indexOf("#");
      const idStr = hashIdx >= 0 ? part.slice(hashIdx + 1).trim() : part;
      const num = parseInt(idStr, 10);
      if (!Number.isNaN(num) && num > 0) ids.push(num);
    }
    return [...new Set(ids)];
  }

  async function startConversationWith(input: string): Promise<string | null> {
    const currentUserId = authStore.user?.id;
    if (!currentUserId) return null;

    const otherIds = parseUsernameIdInput(input);
    if (otherIds.length === 0) return null;

    const userIds = [parseInt(currentUserId, 10), ...otherIds];
    const uniqueIds = [...new Set(userIds)];

    const existing = conversations.value.find((c) =>
      otherIds.some((id) => String(id) === c.otherUserId)
    );
    if (existing && otherIds.length === 1) {
      otherParticipantByConversationId.set(existing.id, String(otherIds[0]));
      await selectConversation(existing.id);
      return existing.id;
    }

    const newId = await createConversation(uniqueIds);
    if (newId) {
      if (otherIds.length > 0) {
        otherParticipantByConversationId.set(newId, String(otherIds[0]));
      }
      await selectConversation(newId);
      return newId;
    }
    return null;
  }

  return {
    conversations,
    currentConversationId,
    messages,
    loading,
    sending,
    sendError,
    currentConversation,
    otherUserId,
    loadConversations,
    loadMessages,
    selectConversation,
    createConversation,
    sendMessage,
    startConversationWith,
    parseUsernameIdInput,
    stopPolling,
    backToConversations,
    getLastMessagePreview,
    getUsernameForSender,
    getConversationDisplayName,
    updateConversationName,
  };
});
