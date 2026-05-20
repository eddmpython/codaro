import type { AssistantMessage } from "@/lib/assistantTypes";
import type { StreamEvent } from "@/lib/assistantStream";
import {
  createComposeStep,
  finishAssistantWorkLoop,
  markAssistantStepsError,
  normalizeAssistantTrace,
  withToolStartStep,
  withToolWorkStep,
} from "@/lib/workLoop";
import type { AiChatResponse } from "@/types";

export function createUserMessage(content: string, now = Date.now()): AssistantMessage {
  return {
    id: `user-${now}`,
    role: "user",
    content,
  };
}

export function createAssistantPlaceholder({
  id,
  provider,
}: {
  id: string;
  provider: string;
}): AssistantMessage {
  return {
    id,
    role: "assistant",
    content: "",
    provider,
    steps: [createComposeStep()],
    loading: true,
  };
}

export function applyAssistantStreamEvent({
  assistantMessageId,
  event,
  messages,
  streamedContent,
}: {
  assistantMessageId: string;
  event: StreamEvent;
  messages: AssistantMessage[];
  streamedContent: string;
}): {
  messages: AssistantMessage[];
  streamedContent: string;
} {
  if (event.type === "tool_start" && event.toolCall) {
    return {
      streamedContent,
      messages: updateAssistantMessage(messages, assistantMessageId, (item) => ({
        ...item,
        steps: withToolStartStep(item.steps, event.toolCall!),
      })),
    };
  }

  if (event.type === "tool_results" && event.toolCalls?.length) {
    return {
      streamedContent,
      messages: updateAssistantMessage(messages, assistantMessageId, (item) => ({
        ...item,
        steps: withToolWorkStep(item.steps, event.toolCalls ?? []),
      })),
    };
  }

  if (event.type === "error") {
    return {
      streamedContent,
      messages: updateAssistantMessage(messages, assistantMessageId, (item) => ({
        ...item,
        tone: "error",
        content: event.error ?? "요청 처리 중 오류가 발생했습니다.",
        steps: markAssistantStepsError(item.steps),
        trace: normalizeAssistantTrace(event.trace),
        loading: false,
      })),
    };
  }

  const nextContent = nextStreamedContent(event, streamedContent);
  if (nextContent === streamedContent) {
    return { messages, streamedContent };
  }
  return {
    streamedContent: nextContent,
    messages: updateAssistantMessage(messages, assistantMessageId, (item) => ({
      ...item,
      content: nextContent,
      loading: true,
    })),
  };
}

export function finalizeAssistantMessage({
  assistantMessageId,
  messages,
  response,
  streamedContent,
}: {
  assistantMessageId: string;
  messages: AssistantMessage[];
  response: AiChatResponse;
  streamedContent: string;
}): AssistantMessage[] {
  return updateAssistantMessage(messages, assistantMessageId, (item) => {
    const workLoop = finishAssistantWorkLoop({ steps: item.steps, response });
    return {
      ...item,
      content: response.answer || streamedContent || "완료했습니다.",
      provider: response.provider,
      model: response.model,
      toolCalls: response.toolCalls,
      steps: workLoop.steps,
      trace: workLoop.trace,
      loading: false,
    };
  });
}

export function failAssistantMessage({
  action,
  assistantMessageId,
  content,
  messages,
}: {
  action?: AssistantMessage["action"];
  assistantMessageId: string;
  content: string;
  messages: AssistantMessage[];
}): AssistantMessage[] {
  return updateAssistantMessage(messages, assistantMessageId, (item) => ({
    ...item,
    tone: "error",
    action,
    content,
    steps: markAssistantStepsError(item.steps),
    loading: false,
  }));
}

function updateAssistantMessage(
  messages: AssistantMessage[],
  assistantMessageId: string,
  updater: (item: AssistantMessage) => AssistantMessage,
): AssistantMessage[] {
  return messages.map((item) => (item.id === assistantMessageId ? updater(item) : item));
}

function nextStreamedContent(event: StreamEvent, streamedContent: string) {
  if (event.type === "delta") {
    return event.content ?? `${streamedContent}${event.delta ?? ""}`;
  }
  if (event.type === "token" && event.content) {
    return `${streamedContent}${event.content}`;
  }
  return streamedContent;
}
