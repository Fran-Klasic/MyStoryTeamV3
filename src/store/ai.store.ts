import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAuthStore } from "@/store/auth.store";
import * as aiService from "@/api/ai.service";
import type { AiConversationSummary, AiMessage } from "@/types/ai";

export const useAiStore = defineStore("ai", () => {
  const authStore = useAuthStore();

  const conversations = ref<AiConversationSummary[]>([]);
  const currentConversationId = ref<number | null>(null);
  const messages = ref<AiMessage[]>([]);
  const loading = ref(false);
  const sending = ref(false);
  const sendError = ref<string | null>(null);
  const conversationTitlesByConvId = ref<Record<number, string>>({});
  const isQuickChatOpen = ref(false);

  const currentConversation = computed(() => {
    const id = currentConversationId.value;
    if (id == null) return null;
    return conversations.value.find((c) => c.id === id) ?? null;
  });

  function getConversationDisplayName(convId: number, fallback: string): string {
    return conversationTitlesByConvId.value[convId] ?? fallback;
  }

  async function loadConversations() {
    loading.value = true;
    try {
      const list = await aiService.getConversations();
      conversations.value = list;
      const titles: Record<number, string> = {};
      for (const c of list) {
        if (c.title) titles[c.id] = c.title;
      }
      conversationTitlesByConvId.value = titles;
    } finally {
      loading.value = false;
    }
  }

  async function selectConversation(id: number) {
    currentConversationId.value = id;
    loading.value = true;
    try {
      const list = await aiService.getMessages(id);
      messages.value = list;
      const conv = conversations.value.find((c) => c.id === id);
      if (conv?.title) {
        conversationTitlesByConvId.value = {
          ...conversationTitlesByConvId.value,
          [id]: conv.title,
        };
      }
    } finally {
      loading.value = false;
    }
  }

  async function createConversation(title?: string): Promise<number | null> {
    const userId = authStore.user?.id;
    if (!userId) return null;
    const numUserId = parseInt(userId, 10);
    if (Number.isNaN(numUserId)) return null;

    loading.value = true;
    try {
      const id = await aiService.createConversation(numUserId, title);
      if (id > 0) {
        await loadConversations();
        await selectConversation(id);
        return id;
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateConversationTitle(convId: number, title: string): Promise<boolean> {
    const ok = await aiService.updateConversationTitle(convId, title);
    if (ok) {
      conversationTitlesByConvId.value = {
        ...conversationTitlesByConvId.value,
        [convId]: title.trim(),
      };
    }
    return ok;
  }

  async function sendMessage(content: string): Promise<boolean> {
    const convId = currentConversationId.value;
    if (convId == null) {
      sendError.value = "Select or create a conversation first.";
      return false;
    }

    const trimmed = content.trim();
    if (!trimmed) return false;

    sendError.value = null;
    sending.value = true;
    try {
      const id = await aiService.addMessage(convId, trimmed, "user");
      if (id > 0) {
        const list = await aiService.getMessages(convId);
        messages.value = list;
        return true;
      }
      sendError.value = "Could not send message.";
      return false;
    } catch {
      sendError.value = "Could not send message.";
      return false;
    } finally {
      sending.value = false;
    }
  }

  function toggleQuickChat() {
    isQuickChatOpen.value = !isQuickChatOpen.value;
  }

  function openQuickChat() {
    isQuickChatOpen.value = true;
  }

  function closeQuickChat() {
    isQuickChatOpen.value = false;
  }

  function backToConversations() {
    currentConversationId.value = null;
  }

  return {
    conversations,
    currentConversationId,
    currentConversation,
    messages,
    loading,
    sending,
    sendError,
    conversationTitlesByConvId,
    isQuickChatOpen,
    loadConversations,
    selectConversation,
    createConversation,
    updateConversationTitle,
    sendMessage,
    getConversationDisplayName,
    toggleQuickChat,
    openQuickChat,
    closeQuickChat,
    backToConversations,
  };
});
