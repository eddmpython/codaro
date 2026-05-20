import type { AssistantMessage } from "@/lib/assistantTypes";
import { codaroApi } from "@/lib/api";
import { applyAssistantStreamEvent } from "@/lib/assistantConversationState";
import type { AiChatRequest, AiChatResponse } from "@/types";

export type AssistantMessageUpdater = (
  update: (messages: AssistantMessage[]) => AssistantMessage[],
) => void;

export type AssistantProviderTurnResult = {
  response: AiChatResponse;
  streamedContent: string;
};

export async function runAssistantProviderTurn({
  assistantMessageId,
  onConversationId,
  request,
  updateMessages,
}: {
  assistantMessageId: string;
  onConversationId: (conversationId: string) => void;
  request: AiChatRequest;
  updateMessages: AssistantMessageUpdater;
}): Promise<AssistantProviderTurnResult> {
  let streamedContent = "";
  const response = await codaroApi.teacherChatStream(request, (event) => {
    if (event.conversationId) {
      onConversationId(event.conversationId);
    }
    updateMessages((current) => {
      const next = applyAssistantStreamEvent({
        assistantMessageId,
        event,
        messages: current,
        streamedContent,
      });
      streamedContent = next.streamedContent;
      return next.messages;
    });
  });

  return { response, streamedContent };
}
