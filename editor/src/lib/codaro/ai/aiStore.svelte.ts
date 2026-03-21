import type {
  AiProfilePayload,
  AiChatResponse,
  AiToolCallResult,
  AiProviderEntry,
} from "./aiApi";
import {
  getProfile,
  getProviders,
  sendChatMessage,
  createConversation,
  deleteConversation,
  subscribeProfileEvents,
} from "./aiApi";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  timestamp: number;
  toolCalls?: AiToolCallResult[];
  isStreaming?: boolean;
}

export interface ArtifactEntry {
  id: string;
  type: "code" | "table" | "chart" | "text";
  title: string;
  content: string;
  toolName?: string;
  timestamp: number;
}

let profile = $state<AiProfilePayload | null>(null);
let providers = $state<AiProviderEntry[]>([]);
let conversationId = $state<string | null>(null);
let conversationRole = $state<string>("copilot");
let messages = $state<ChatMessage[]>([]);
let artifacts = $state<ArtifactEntry[]>([]);
let isLoading = $state(false);
let error = $state<string | null>(null);
let isChatBarOpen = $state(false);
let isArtifactPanelOpen = $state(false);
let unsubscribeProfile: (() => void) | null = null;

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getAiProfile() {
  return profile;
}

export function getProviderList() {
  return providers;
}

export function getConversationId() {
  return conversationId;
}

export function getConversationRole() {
  return conversationRole;
}

export function getMessages() {
  return messages;
}

export function getArtifacts() {
  return artifacts;
}

export function getIsLoading() {
  return isLoading;
}

export function getAiError() {
  return error;
}

export function getIsChatBarOpen() {
  return isChatBarOpen;
}

export function setIsChatBarOpen(open: boolean) {
  isChatBarOpen = open;
}

export function toggleChatBar() {
  isChatBarOpen = !isChatBarOpen;
}

export function getIsArtifactPanelOpen() {
  return isArtifactPanelOpen;
}

export function setIsArtifactPanelOpen(open: boolean) {
  isArtifactPanelOpen = open;
}

export function isAiReady(): boolean {
  return profile !== null && profile.ready === true;
}

export function getActiveProvider(): string | null {
  return profile?.activeProvider ?? null;
}

export function getActiveModel(): string | null {
  return profile?.activeModel ?? null;
}

export async function initAiStore(): Promise<void> {
  try {
    const [profileData, providerData] = await Promise.all([
      getProfile(),
      getProviders(),
    ]);
    profile = profileData;
    providers = providerData.catalog;

    if (unsubscribeProfile) unsubscribeProfile();
    unsubscribeProfile = subscribeProfileEvents((updated) => {
      profile = updated;
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to initialize AI";
  }
}

export function destroyAiStore(): void {
  if (unsubscribeProfile) {
    unsubscribeProfile();
    unsubscribeProfile = null;
  }
}

export async function startConversation(role: string = "copilot"): Promise<void> {
  try {
    const conv = await createConversation(role);
    conversationId = conv.conversationId;
    conversationRole = conv.role;
    messages = [];
    artifacts = [];
    error = null;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to start conversation";
  }
}

export async function endConversation(): Promise<void> {
  if (conversationId) {
    try {
      await deleteConversation(conversationId);
    } catch {
      /* ignore */
    }
  }
  conversationId = null;
  messages = [];
  artifacts = [];
}

export async function sendMessage(
  content: string,
  sessionId?: string,
): Promise<AiChatResponse | null> {
  if (!content.trim()) return null;

  const userMsg: ChatMessage = {
    id: generateId(),
    role: "user",
    content: content.trim(),
    timestamp: Date.now(),
  };
  messages = [...messages, userMsg];
  isLoading = true;
  error = null;

  try {
    const response = await sendChatMessage({
      conversationId: conversationId ?? undefined,
      message: content.trim(),
      sessionId,
      role: conversationRole,
    });

    if (!conversationId) {
      conversationId = response.conversationId;
    }

    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: response.answer,
      timestamp: Date.now(),
      toolCalls: response.toolCalls,
    };
    messages = [...messages, assistantMsg];

    if (response.toolCalls && response.toolCalls.length > 0) {
      processToolResults(response.toolCalls);
    }

    return response;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to send message";
    return null;
  } finally {
    isLoading = false;
  }
}

function processToolResults(toolCalls: AiToolCallResult[]): void {
  for (const tc of toolCalls) {
    const artifact = toolCallToArtifact(tc);
    if (artifact) {
      artifacts = [...artifacts, artifact];
      if (!isArtifactPanelOpen) {
        isArtifactPanelOpen = true;
      }
    }
  }
}

function toolCallToArtifact(tc: AiToolCallResult): ArtifactEntry | null {
  const result = tc.result;
  if (!result || "error" in result) return null;

  switch (tc.name) {
    case "insert-block":
      return {
        id: generateId(),
        type: "code",
        title: `Block inserted`,
        content: (result as Record<string, unknown>).blockId as string ?? "",
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "create-guide":
      return {
        id: generateId(),
        type: "text",
        title: `Guide: ${(result as Record<string, unknown>).exerciseType ?? "exercise"}`,
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "execute-reactive":
      return {
        id: generateId(),
        type: "code",
        title: "Execution result",
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    default:
      return null;
  }
}

export function clearError(): void {
  error = null;
}

export function clearArtifacts(): void {
  artifacts = [];
}
