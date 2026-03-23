import type { ChatMessage } from "./aiStore.svelte";
import type { AiToolCallResult } from "./aiApi";
import { addToast } from "../stores/toast.svelte";

export type DocumentMutationType = "insert" | "update" | "delete" | "execute";

export interface DocumentMutation {
  id: string;
  type: DocumentMutationType;
  toolCallId: string;
  toolName: string;
  blockId: string;
  content?: string;
  blockType?: string;
  position?: number;
  executionOrder?: string[];
  timestamp: number;
}

let mutationQueue = $state<DocumentMutation[]>([]);
let processedToolCallIds = $state<Set<string>>(new Set());
let mutationListeners: Array<(mutation: DocumentMutation) => void> = [];

export function getMutationQueue(): DocumentMutation[] {
  return mutationQueue;
}

export function consumeMutation(id: string): void {
  mutationQueue = mutationQueue.filter(m => m.id !== id);
}

export function onDocumentMutation(callback: (mutation: DocumentMutation) => void): () => void {
  mutationListeners.push(callback);
  return () => {
    mutationListeners = mutationListeners.filter(cb => cb !== callback);
  };
}

function generateMutationId(): string {
  return `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function markProcessed(toolCallId: string): void {
  const updated = new Set(processedToolCallIds);
  updated.add(toolCallId);
  processedToolCallIds = updated;
}

function emitMutation(mutation: DocumentMutation): void {
  mutationQueue = [...mutationQueue, mutation];
  for (const listener of mutationListeners) {
    listener(mutation);
  }
}

function processToolCall(tc: AiToolCallResult): void {
  if (processedToolCallIds.has(tc.toolCallId)) return;

  const result = tc.result;
  if (!result || "error" in result) return;

  const r = result as Record<string, unknown>;

  switch (tc.name) {
    case "insert-block": {
      const mutation: DocumentMutation = {
        id: generateMutationId(),
        type: "insert",
        toolCallId: tc.toolCallId,
        toolName: tc.name,
        blockId: (r.blockId as string) ?? "",
        content: (r.content as string) ?? (r.code as string) ?? "",
        blockType: (r.type as string) ?? (r.blockType as string) ?? "code",
        position: (r.position as number) ?? -1,
        timestamp: Date.now(),
      };
      markProcessed(tc.toolCallId);
      emitMutation(mutation);
      addToast("Block inserted by AI", "success");
      break;
    }

    case "update-block": {
      const mutation: DocumentMutation = {
        id: generateMutationId(),
        type: "update",
        toolCallId: tc.toolCallId,
        toolName: tc.name,
        blockId: (r.blockId as string) ?? "",
        content: (r.newContent as string) ?? (r.content as string) ?? "",
        timestamp: Date.now(),
      };
      markProcessed(tc.toolCallId);
      emitMutation(mutation);
      addToast("Block updated by AI", "info");
      break;
    }

    case "delete-block": {
      const mutation: DocumentMutation = {
        id: generateMutationId(),
        type: "delete",
        toolCallId: tc.toolCallId,
        toolName: tc.name,
        blockId: (r.blockId as string) ?? "",
        timestamp: Date.now(),
      };
      markProcessed(tc.toolCallId);
      emitMutation(mutation);
      addToast("Block deleted by AI", "info");
      break;
    }

    case "execute-reactive": {
      const mutation: DocumentMutation = {
        id: generateMutationId(),
        type: "execute",
        toolCallId: tc.toolCallId,
        toolName: tc.name,
        blockId: (r.blockId as string) ?? "",
        executionOrder: (r.executionOrder as string[]) ?? [],
        timestamp: Date.now(),
      };
      markProcessed(tc.toolCallId);
      emitMutation(mutation);
      addToast(`Executed ${(r.executionOrder as string[])?.length ?? 0} block(s)`, "success");
      break;
    }

    default:
      break;
  }
}

export function scanMessagesForMutations(messages: ChatMessage[]): void {
  for (const msg of messages) {
    if (msg.role !== "assistant" || !msg.toolCalls) continue;
    for (const tc of msg.toolCalls) {
      processToolCall(tc);
    }
  }
}

export function processToolCalls(toolCalls: AiToolCallResult[]): void {
  for (const tc of toolCalls) {
    processToolCall(tc);
  }
}

export function resetCellBridge(): void {
  mutationQueue = [];
  processedToolCallIds = new Set();
}
