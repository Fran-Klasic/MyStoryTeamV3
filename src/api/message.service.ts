import { api } from "@/api/api-handler";
import type { ConversationSummary, Message } from "@/types/message";

type BackendConversation = {
  ID_Conversation?: number;
  iD_Conversation?: number;
  ID_User?: number;
  iD_User?: number;
  Created_At?: string;
  created_At?: string;
};

type BackendMessage = {
  ID_Message?: number;
  iD_Message?: number;
  ID_Conversation?: number;
  iD_Conversation?: number;
  ID_User_Sender?: number;
  iD_User_Sender?: number;
  Message_Content?: string;
  message_Content?: string;
  Created_At?: string;
  created_At?: string;
};

function mapConversation(c: BackendConversation): ConversationSummary {
  return {
    id: String(c.ID_Conversation ?? c.iD_Conversation ?? ""),
    otherUserId: String(c.ID_User ?? c.iD_User ?? ""),
    createdAt: c.Created_At ?? c.created_At ?? new Date().toISOString(),
  };
}

function mapMessage(m: BackendMessage, conversationId: string): Message {
  return {
    id: String(m.ID_Message ?? m.iD_Message ?? ""),
    conversationId,
    senderId: String(m.ID_User_Sender ?? m.iD_User_Sender ?? ""),
    content: m.Message_Content ?? m.message_Content ?? "",
    createdAt: m.Created_At ?? m.created_At ?? new Date().toISOString(),
  };
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const backend = await api<BackendConversation[]>("/api/auth/conversations", {
    method: "GET",
  });
  return (Array.isArray(backend) ? backend : []).map(mapConversation);
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const backend = await api<BackendMessage[]>(
    `/api/auth/conversations/${conversationId}`,
    { method: "GET" }
  );
  const list = (Array.isArray(backend) ? backend : []).map((m) =>
    mapMessage(m, conversationId)
  );
  list.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  return list;
}

export async function createConversation(
  userIds: number[]
): Promise<number> {
  const result = await api<number>("/api/auth/conversations", {
    method: "POST",
    body: {
      ID_Users: userIds,
      Created_At: new Date().toISOString(),
    },
  });
  return typeof result === "number" ? result : 0;
}

export async function sendMessage(
  conversationId: string,
  senderId: number,
  receiverId: number,
  content: string
): Promise<number> {
  const result = await api<number>(
    `/api/auth/conversations/${conversationId}`,
    {
      method: "POST",
      body: {
        ID_Sender: senderId,
        ID_Reciever: receiverId,
        Message: content.slice(0, 1000),
      },
    }
  );
  return typeof result === "number" ? result : 0;
}

export async function addUserToConversation(
  conversationId: string,
  userId: number
): Promise<number> {
  const result = await api<number>(
    `/api/auth/conversations/${conversationId}`,
    {
      method: "PUT",
      body: {
        ID_User: userId,
        ID_Conversation: parseInt(conversationId, 10),
        Joined_At: new Date().toISOString(),
      },
    }
  );
  return typeof result === "number" ? result : 0;
}

/** Fetch conversation name. Returns null on 404. */
export async function getConversationName(conversationId: string): Promise<string | null> {
  try {
    const result = await api<string | { Conversation_Name?: string; value?: string }>(
      `/api/auth/conversations/${conversationId}/name`,
      { method: "GET" }
    );
    if (typeof result === "string" && result.trim().length > 0) return result.trim();
    if (result && typeof result === "object") {
      const name = (result as { Conversation_Name?: string; value?: string }).Conversation_Name
        ?? (result as { Conversation_Name?: string; value?: string }).value;
      if (typeof name === "string" && name.trim().length > 0) return name.trim();
    }
    return null;
  } catch {
    return null;
  }
}

/** Update conversation name. Returns true on success. */
export async function updateConversationName(
  conversationId: string,
  name: string
): Promise<boolean> {
  try {
    await api(`/api/auth/conversations/${conversationId}/name`, {
      method: "PUT",
      body: { Conversation_Name: name.trim() },
    });
    return true;
  } catch {
    return false;
  }
}
