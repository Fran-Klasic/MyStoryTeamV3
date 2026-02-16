import { defineStore } from "pinia";
import { ref } from "vue";
import * as aiService from "@/api/ai.service";
import type { AiMessage } from "@/api/ai.service";

export const useAiStore = defineStore("ai", () => {
  const history = ref<AiMessage[]>([]);
  const isQuickChatOpen = ref(false);

  async function sendMessage(content: string) {
    const userMsg: AiMessage = {
      id: "u-" + Date.now(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    history.value = [...history.value, userMsg];
    const reply = await aiService.sendMessage(content);
    const assistantMsg: AiMessage = {
      id: "a-" + Date.now(),
      role: "assistant",
      content: reply,
      timestamp: new Date().toISOString(),
    };
    history.value = [...history.value, assistantMsg];
    return reply;
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

  return {
    history,
    isQuickChatOpen,
    sendMessage,
    toggleQuickChat,
    openQuickChat,
    closeQuickChat,
  };
});
