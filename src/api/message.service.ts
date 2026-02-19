import { api } from "@/api/api-handler";
import type { ConversationSummary, Message } from "@/types/message";

type BackendConversation = {
  ID_Conversation?: number;
  ID_User?: number;
  Created_At?: string;
};

type BackendMessage = {
  ID_Message?: number;
  ID_Conversation?: number;
  ID_User_Sender?: number;
  Message_Content?: string;
  Created_At?: string;
};

function mapConversation(c: BackendConversation): ConversationSummary {
  return {
    id: String(c.ID_Conversation ?? ""),
    otherUserId: String(c.ID_User ?? ""),
    createdAt: c.Created_At ?? new Date().toISOString(),
  };
}

function mapMessage(m: BackendMessage, conversationId: string): Message {
  return {
    id: String(m.ID_Message ?? ""),
    conversationId,
    senderId: String(m.ID_User_Sender ?? ""),
    content: m.Message_Content ?? "",
    createdAt: m.Created_At ?? new Date().toISOString(),
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
  return (Array.isArray(backend) ? backend : []).map((m) =>
    mapMessage(m, conversationId)
  );
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
