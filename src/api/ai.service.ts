import { api } from "@/api/api-handler";
import type { AiConversationSummary, AiMessage } from "@/types/ai";

type BackendConversation = {
  ID_AI_Conversation?: number;
  iD_AI_Conversation?: number;
  Title?: string;
  title?: string;
};

type BackendMessage = {
  ID_AI_Message?: number;
  iD_AI_Message?: number;
  ID_AI_Conversation?: number;
  iD_AI_Conversation?: number;
  Content?: string;
  content?: string;
  Type?: string;
  type?: string;
};

function mapConversation(c: BackendConversation): AiConversationSummary {
  return {
    id: c.ID_AI_Conversation ?? c.iD_AI_Conversation ?? 0,
    title: (c.Title ?? c.title ?? "").trim() || "Conversation",
  };
}

function mapMessage(m: BackendMessage, conversationId: number): AiMessage {
  return {
    id: m.ID_AI_Message ?? m.iD_AI_Message ?? 0,
    conversationId: m.ID_AI_Conversation ?? m.iD_AI_Conversation ?? conversationId,
    content: m.Content ?? m.content ?? "",
    type: m.Type ?? m.type ?? "user",
  };
}

export async function getConversations(): Promise<AiConversationSummary[]> {
  const backend = await api<BackendConversation[]>("/api/auth/ai", { method: "GET" });
  return (Array.isArray(backend) ? backend : []).map(mapConversation);
}

export async function getMessages(conversationId: number): Promise<AiMessage[]> {
  const backend = await api<BackendMessage[]>(`/api/auth/ai/${conversationId}`, {
    method: "GET",
  });
  const list = (Array.isArray(backend) ? backend : []).map((m) =>
    mapMessage(m, conversationId)
  );
  return list;
}

export async function createConversation(
  userId: number,
  title?: string
): Promise<number> {
  const result = await api<number>("/api/auth/ai", {
    method: "POST",
    body: {
      ID_User: userId,
      Title: (title ?? "").trim() || null,
    },
  });
  return typeof result === "number" ? result : 0;
}

export async function addMessage(
  conversationId: number,
  content: string,
  type?: string
): Promise<number> {
  const result = await api<number>("/api/auth/ai/message", {
    method: "POST",
    body: {
      ID_AI_Conversation: conversationId,
      Content: content.slice(0, 4000),
      Type: type ?? "user",
    },
  });
  return typeof result === "number" ? result : 0;
}

export async function updateConversationTitle(
  conversationId: number,
  title: string
): Promise<boolean> {
  try {
    await api(`/api/auth/ai?id=${conversationId}`, {
      method: "PUT",
      body: {
        ID_AI_Conversation: conversationId,
        Title: title.trim(),
      },
    });
    return true;
  } catch {
    return false;
  }
}
