import { getMessages } from "./aiStore.svelte";
import type { ChatMessage } from "./aiStore.svelte";
import { addToast } from "../stores/toast.svelte";

export interface CellInjection {
  id: string;
  blockId: string;
  code: string;
  source: "ai";
  timestamp: number;
}

let injectionQueue = $state<CellInjection[]>([]);
let processedToolCallIds = $state<Set<string>>(new Set());
let onInjectCallback: ((injection: CellInjection) => void) | null = null;

export function getCellInjectionQueue(): CellInjection[] {
  return injectionQueue;
}

export function consumeInjection(id: string): void {
  injectionQueue = injectionQueue.filter(i => i.id !== id);
}

export function onCellInject(callback: (injection: CellInjection) => void): () => void {
  onInjectCallback = callback;
  return () => { onInjectCallback = null; };
}

export function scanMessagesForInjections(messages: ChatMessage[]): void {
  for (const msg of messages) {
    if (msg.role !== "assistant" || !msg.toolCalls) continue;

    for (const tc of msg.toolCalls) {
      if (processedToolCallIds.has(tc.toolCallId)) continue;
      if (tc.name !== "insert-block") continue;

      const result = tc.result;
      if (!result || "error" in result) continue;

      const blockId = (result as Record<string, unknown>).blockId as string;
      const code = (result as Record<string, unknown>).code as string ?? "";

      const injection: CellInjection = {
        id: `inj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        blockId: blockId ?? "",
        code,
        source: "ai",
        timestamp: Date.now(),
      };

      const updated = new Set(processedToolCallIds);
      updated.add(tc.toolCallId);
      processedToolCallIds = updated;

      injectionQueue = [...injectionQueue, injection];

      if (onInjectCallback) {
        onInjectCallback(injection);
      }

      addToast("Cell added to notebook", "success");
    }
  }
}

export function resetCellBridge(): void {
  injectionQueue = [];
  processedToolCallIds = new Set();
}
