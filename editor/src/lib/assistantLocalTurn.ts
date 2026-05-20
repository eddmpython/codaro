import type { AssistantMessage } from "@/lib/assistantTypes";
import {
  buildLocalAssistantDraft,
  completeLocalAssistantDraft,
} from "@/lib/localFallback";
import type { PendingTarget } from "@/lib/assistantResponsePlan";
import type { TeacherScope } from "@/lib/teacherScope";
import type { AppNotice, BlockConfig } from "@/types";

export type SaveCurriculum = (
  blocks: BlockConfig[],
  title?: string,
) => { title: string } | null;

export type AssistantLocalTurnResult = {
  assistantMessage: AssistantMessage;
  clearPendingBlocks: boolean;
  notice: AppNotice;
  pendingTarget: PendingTarget | null;
};

export function runAssistantLocalTurn({
  message,
  saveCurriculum,
  scope,
}: {
  message: string;
  saveCurriculum: SaveCurriculum;
  scope: TeacherScope;
}): AssistantLocalTurnResult {
  const draft = buildLocalAssistantDraft(message, scope);
  const savedEntry = draft.shouldSaveCurriculum
    ? saveCurriculum(draft.generatedBlocks)
    : null;
  const localResult = completeLocalAssistantDraft({
    draft,
    message,
    savedTitle: savedEntry?.title,
    scope,
  });

  return {
    assistantMessage: localResult.assistantMessage,
    clearPendingBlocks: draft.clearPendingBlocks,
    notice: localResult.notice,
    pendingTarget: draft.clearPendingBlocks ? "notebook" : null,
  };
}
