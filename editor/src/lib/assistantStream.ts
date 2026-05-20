import type { AiChatRequest, AiChatResponse, ProviderDiagnostic } from "@/types";

export type StreamEvent = {
  type?: string;
  conversationId?: string;
  delta?: string;
  content?: string;
  answer?: string;
  provider?: string;
  model?: string | null;
  usage?: unknown;
  toolCall?: AiChatResponse["toolCalls"][number];
  toolCalls?: AiChatResponse["toolCalls"];
  trace?: AiChatResponse["trace"];
  error?: string;
  diagnostic?: ProviderDiagnostic;
};

export type AssistantStreamState = {
  conversationId: string;
  donePayload: AiChatResponse | null;
  error: string | null;
  diagnostic?: ProviderDiagnostic;
};

export function initialAssistantStreamState(request: AiChatRequest): AssistantStreamState {
  return {
    conversationId: request.conversationId ?? "",
    donePayload: null,
    error: null,
  };
}

export function applyAssistantStreamProtocolEvent(
  state: AssistantStreamState,
  event: StreamEvent,
): AssistantStreamState {
  const conversationId = event.conversationId ?? state.conversationId;
  if (event.type === "error") {
    return {
      ...state,
      conversationId,
      error: event.error ?? "provider stream failed",
      diagnostic: event.diagnostic,
    };
  }
  if (event.type === "done") {
    return {
      ...state,
      conversationId,
      donePayload: {
        conversationId,
        answer: event.answer ?? event.content ?? "",
        provider: event.provider ?? "",
        model: event.model,
        usage: event.usage,
        toolCalls: event.toolCalls ?? [],
        trace: event.trace,
      },
    };
  }
  return { ...state, conversationId };
}

export function parseAssistantStreamEvent(rawEvent: string): StreamEvent | null {
  const data = rawEvent
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n")
    .trim();
  if (!data) return null;
  return JSON.parse(data) as StreamEvent;
}
