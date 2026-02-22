export type AiConversationSummary = {
  id: number;
  title: string;
};

export type AiMessage = {
  id: number;
  conversationId: number;
  content: string;
  type: string;
};
