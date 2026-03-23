import type {
  AiProfilePayload,
  AiChatResponse,
  AiToolCallResult,
  AiProviderEntry,
  StreamEvent,
  ChatContext,
} from "./aiApi";
import {
  getProfile,
  getProviders,
  sendChatMessage,
  streamChatMessage,
  createConversation,
  deleteConversation,
  subscribeProfileEvents,
} from "./aiApi";
import { processToolCalls } from "./cellBridge.svelte";
import { pushAgentAction, setActivePlan } from "../stores/automationStore.svelte";
import type { AgentAction, PlanStatus } from "../automationApi";

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
let contextProvider: (() => ChatContext | null) | null = null;

export function registerContextProvider(provider: () => ChatContext | null): () => void {
  contextProvider = provider;
  return () => { contextProvider = null; };
}

function collectContext(): ChatContext | undefined {
  if (!contextProvider) return undefined;
  const ctx = contextProvider();
  return ctx ?? undefined;
}

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
    } catch (e) {
      console.warn("[aiStore] failed to delete conversation:", e);
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
      context: collectContext(),
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

export async function sendMessageStreaming(
  content: string,
  sessionId?: string,
): Promise<void> {
  if (!content.trim()) return;

  const userMsg: ChatMessage = {
    id: generateId(),
    role: "user",
    content: content.trim(),
    timestamp: Date.now(),
  };
  messages = [...messages, userMsg];
  isLoading = true;
  error = null;

  const assistantMsg: ChatMessage = {
    id: generateId(),
    role: "assistant",
    content: "",
    timestamp: Date.now(),
    isStreaming: true,
  };
  messages.push(assistantMsg);

  function findAssistant(): ChatMessage | undefined {
    return messages.find((m) => m.id === assistantMsg.id);
  }

  try {
    await streamChatMessage(
      {
        conversationId: conversationId ?? undefined,
        message: content.trim(),
        sessionId,
        role: conversationRole,
        context: collectContext(),
      },
      (event: StreamEvent) => {
        const msg = findAssistant();
        if (!msg) return;
        switch (event.type) {
          case "start":
            if (event.conversationId && !conversationId) {
              conversationId = event.conversationId;
            }
            break;
          case "delta":
            if (event.delta) {
              msg.content += event.delta;
            }
            break;
          case "token":
            if (event.content) {
              msg.content = event.content;
            }
            break;
          case "tool_results":
            if (event.toolCalls && event.toolCalls.length > 0) {
              msg.toolCalls = [...(msg.toolCalls ?? []), ...event.toolCalls];
              processToolResults(event.toolCalls);
            }
            break;
          case "done":
            msg.content = event.answer ?? msg.content;
            msg.isStreaming = false;
            break;
        }
      },
    );
  } catch (e) {
    error = e instanceof Error ? e.message : "Stream failed";
    const msg = findAssistant();
    if (msg) {
      msg.isStreaming = false;
    }
  } finally {
    isLoading = false;
  }
}

const AGENT_ACTION_TOOLS = new Set([
  "capture-screen", "click-element", "type-text", "hotkey",
  "mouse-move", "mouse-drag", "scroll", "detect-elements",
  "ocr-screen", "voice-listen", "voice-speak", "execute-plan",
]);

function extractAgentAction(tc: AiToolCallResult): AgentAction | null {
  if (!AGENT_ACTION_TOOLS.has(tc.name)) return null;
  const r = (tc.result ?? {}) as Record<string, unknown>;
  const args = (tc.arguments ?? {}) as Record<string, unknown>;
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    actionType: tc.name,
    description: (args.description as string) ?? tc.name,
    screenshot: (r.screenshot as string) ?? null,
    ocrText: (r.ocrText as string) ?? (r.text as string) ?? null,
    clickPosition: args.x != null && args.y != null
      ? { x: args.x as number, y: args.y as number }
      : null,
    inputText: (args.text as string) ?? null,
    result: r.error ? "failed" : "success",
    planId: (r.planId as string) ?? null,
    stepIndex: (r.stepIndex as number) ?? null,
  };
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

    const agentAction = extractAgentAction(tc);
    if (agentAction) {
      pushAgentAction(agentAction);
    }

    if (tc.name === "execute-plan" && tc.result) {
      const r = tc.result as Record<string, unknown>;
      if (r.planId) {
        setActivePlan(r as unknown as PlanStatus);
      }
    }
  }
  processToolCalls(toolCalls);
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
    case "create-learning-card":
      return {
        id: generateId(),
        type: "text",
        title: `Card: ${(result as Record<string, unknown>).topic ?? "concept"}`,
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "create-quiz":
      return {
        id: generateId(),
        type: "text",
        title: `Quiz: ${(result as Record<string, unknown>).topic ?? "quiz"}`,
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "create-notebook-exercise":
      return {
        id: generateId(),
        type: "text",
        title: `Exercise: ${(result as Record<string, unknown>).title ?? "exercise"}`,
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "track-achievement":
      return {
        id: generateId(),
        type: "text",
        title: `Achievement: ${(result as Record<string, unknown>).topic ?? ""}`,
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "capture-screen":
      return {
        id: generateId(),
        type: "code",
        title: "Screen capture",
        content: `Captured ${(result as Record<string, unknown>).width}x${(result as Record<string, unknown>).height} (${(result as Record<string, unknown>).format})`,
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "read-screen-text":
      return {
        id: generateId(),
        type: "text",
        title: `OCR: ${(result as Record<string, unknown>).regionCount ?? 0} regions`,
        content: (result as Record<string, unknown>).fullText as string ?? "",
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "click-element":
      return {
        id: generateId(),
        type: "text",
        title: `Clicked (${(result as Record<string, unknown>).x}, ${(result as Record<string, unknown>).y})`,
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "type-text":
      return {
        id: generateId(),
        type: "text",
        title: `Typed ${(result as Record<string, unknown>).length ?? 0} chars`,
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "press-hotkey":
      return {
        id: generateId(),
        type: "text",
        title: `Hotkey: ${((result as Record<string, unknown>).keys as string[])?.join("+")}`,
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "find-element":
      return {
        id: generateId(),
        type: "text",
        title: `Found ${(result as Record<string, unknown>).matchCount ?? 0} elements`,
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "wait-for":
      return {
        id: generateId(),
        type: "text",
        title: (result as Record<string, unknown>).found ? "Wait: found" : "Wait: timeout",
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "detect-elements":
      return {
        id: generateId(),
        type: "text",
        title: `Detected ${(result as Record<string, unknown>).elementCount ?? 0} UI elements`,
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "run-automation":
      return {
        id: generateId(),
        type: "code",
        title: `Automation: ${(result as Record<string, unknown>).status}`,
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "start-recording":
    case "stop-recording":
      return {
        id: generateId(),
        type: "text",
        title: tc.name === "start-recording" ? "Recording started" : "Recording stopped",
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "voice-listen":
      return {
        id: generateId(),
        type: "text",
        title: "Voice input",
        content: (result as Record<string, unknown>).text as string ?? "",
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "voice-speak":
      return {
        id: generateId(),
        type: "text",
        title: "Voice output",
        content: (result as Record<string, unknown>).text as string ?? "",
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "send-notification":
      return {
        id: generateId(),
        type: "text",
        title: `Notification: ${(result as Record<string, unknown>).channel ?? "sent"}`,
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    case "emergency-stop":
      return {
        id: generateId(),
        type: "text",
        title: "EMERGENCY STOP",
        content: JSON.stringify(result, null, 2),
        toolName: tc.name,
        timestamp: Date.now(),
      };
    default:
      return null;
  }
}

export async function sendErrorFix(
  blockId: string,
  code: string,
  errorText: string,
  sessionId?: string,
): Promise<void> {
  const prompt = `The following code in block "${blockId}" produced an error. Fix the code and use the update-block tool to apply the fix.

Code:
\`\`\`python
${code}
\`\`\`

Error:
\`\`\`
${errorText}
\`\`\`

Analyze the error and fix the code. Use the update-block tool with blockId "${blockId}" to apply your fix.`;

  await sendMessageStreaming(prompt, sessionId);
}

export function clearError(): void {
  error = null;
}

export function setError(message: string): void {
  error = message;
}

export function clearArtifacts(): void {
  artifacts = [];
}
