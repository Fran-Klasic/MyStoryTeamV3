import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAuthStore } from "@/store/auth.store";
import * as messageService from "@/api/message.service";
import type { ConversationSummary, Message } from "@/types/message";

export const useMessageStore = defineStore("message", () => {
  const authStore = useAuthStore();

  const conversations = ref<ConversationSummary[]>([]);
  const currentConversationId = ref<string | null>(null);
  const messages = ref<Message[]>([]);
  const loading = ref(false);
  const sending = ref(false);

  const currentConversation = computed(() => {
    const id = currentConversationId.value;
    if (!id) return null;
    return conversations.value.find((c) => c.id === id) ?? null;
  });

  const otherUserId = computed(() => currentConversation.value?.otherUserId ?? null);

  async function loadConversations() {
    loading.value = true;
    try {
      conversations.value = await messageService.getConversations();
    } finally {
      loading.value = false;
    }
  }

  async function loadMessages(conversationId: string) {
    loading.value = true;
    try {
      messages.value = await messageService.getMessages(conversationId);
    } finally {
      loading.value = false;
    }
  }

  async function selectConversation(id: string) {
    currentConversationId.value = id;
    await loadMessages(id);
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
    const receiverId = otherUserId.value;

    if (!convId || !senderId || !receiverId || !content.trim()) return false;

    sending.value = true;
    try {
      const id = await messageService.sendMessage(
        convId,
        parseInt(senderId, 10),
        parseInt(receiverId, 10),
        content.trim()
      );
      if (id > 0) {
        await loadMessages(convId);
        return true;
      }
      return false;
    } finally {
      sending.value = false;
    }
  }

  async function startConversationWith(otherUserId: string): Promise<string | null> {
    const currentUserId = authStore.user?.id;
    if (!currentUserId) return null;

    const existing = conversations.value.find(
      (c) => c.otherUserId === otherUserId
    );
    if (existing) {
      await selectConversation(existing.id);
      return existing.id;
    }

    const newId = await createConversation([
      parseInt(currentUserId, 10),
      parseInt(otherUserId, 10),
    ]);
    if (newId) {
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
    currentConversation,
    otherUserId,
    loadConversations,
    loadMessages,
    selectConversation,
    createConversation,
    sendMessage,
    startConversationWith,
  };
});
