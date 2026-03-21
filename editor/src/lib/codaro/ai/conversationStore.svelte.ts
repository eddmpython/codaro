import { listConversations, deleteConversation as apiDeleteConversation } from "./aiApi";
import type { AiConversation } from "./aiApi";

export interface ConversationSummary {
  conversationId: string;
  role: string;
  title: string;
  updatedAt: number;
}

let conversations = $state<ConversationSummary[]>([]);
let activeId = $state<string | null>(null);
let isOpen = $state(false);

export function getConversations() {
  return conversations;
}

export function getActiveConversationId() {
  return activeId;
}

export function setActiveConversationId(id: string | null) {
  activeId = id;
}

export function getIsHistoryOpen() {
  return isOpen;
}

export function setIsHistoryOpen(open: boolean) {
  isOpen = open;
}

export function toggleHistory() {
  isOpen = !isOpen;
}

export async function loadConversations(): Promise<void> {
  try {
    const data = await listConversations();
    conversations = data.conversations.map((c: AiConversation) => ({
      conversationId: c.conversationId,
      role: c.role,
      title: `${c.role} conversation`,
      updatedAt: Date.now(),
    }));
  } catch (e) {
    console.warn("[conversationStore] failed to load conversations:", e);
    conversations = [];
  }
}

export async function removeConversation(id: string): Promise<void> {
  try {
    await apiDeleteConversation(id);
    conversations = conversations.filter(c => c.conversationId !== id);
    if (activeId === id) {
      activeId = null;
    }
  } catch (e) {
    console.warn("[conversationStore] failed to remove conversation:", e);
  }
}
