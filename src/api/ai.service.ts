/** Placeholder AI service – swap for real backend later */

export type AiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export async function sendMessage(message: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 600));
  const lower = message.toLowerCase();
  if (lower.includes("task") || lower.includes("todo")) {
    return "I can help you break down tasks. Try: \"Generate tasks from my goal\" (coming soon). For now, add Task cards from the canvas toolbar.";
  }
  if (lower.includes("canvas") || lower.includes("board")) {
    return "You can create a new canvas from the Dashboard, or open an existing one. Use the toolbar on the left to add Text, List, Task, Image, Video, Audio, or Date elements.";
  }
  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hello! I'm your planning assistant. Ask me about tasks, canvases, or how to get started.";
  }
  return "Thanks for your message. AI features are being connected—try asking about tasks or canvases.";
}

export async function generateTasksFromSelection(_context: string): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 800));
  return ["Review your goal", "Break into 3–5 steps", "Add one action for today"];
}

export async function generateStarterCanvas(_topic: string): Promise<{ name: string; elements: unknown[] }> {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    name: "Starter: " + _topic,
    elements: [],
  };
}
