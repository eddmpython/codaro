import type { AssistantMessage } from "@/lib/assistantTypes";
import {
  buildLocalAssistantDraft,
  completeLocalAssistantDraft,
  type LocalAssistantDraft,
} from "@/lib/localFallback";
import type { CurriculumToSave, PendingTarget } from "@/lib/assistantResponsePlan";
import type { SurfaceMode } from "@/lib/surfaceModel";
import type { TeacherScope } from "@/lib/teacherScope";
import type { AppNotice, BlockConfig } from "@/types";

export type AssistantLocalTurnResult = {
  assistantMessage: AssistantMessage;
  clearPendingBlocks: boolean;
  notice: AppNotice;
  pendingTarget: PendingTarget | null;
};

export type AssistantLocalTurnApplication = {
  clearPendingBlocks: boolean;
  curriculumToSave: CurriculumToSave | null;
  draft: LocalAssistantDraft;
  pendingBlocks: BlockConfig[];
  pendingTarget: PendingTarget | null;
  surfaceToOpen: SurfaceMode | null;
};

export function buildAssistantLocalTurnApplication({
  message,
  scope,
}: {
  message: string;
  scope: TeacherScope;
}): AssistantLocalTurnApplication {
  const draft = buildLocalAssistantDraft(message, scope);
  const pendingBlocks = draft.shouldSaveCurriculum ? [] : draft.generatedBlocks;
  return {
    clearPendingBlocks: draft.clearPendingBlocks,
    curriculumToSave: draft.shouldSaveCurriculum ? { blocks: draft.generatedBlocks } : null,
    draft,
    pendingBlocks,
    pendingTarget: draft.clearPendingBlocks || pendingBlocks.length ? "notebook" : null,
    surfaceToOpen: draft.shouldSaveCurriculum ? "curriculum" : pendingBlocks.length ? "editor" : null,
  };
}

export function completeAssistantLocalTurn({
  application,
  message,
  savedCurriculumTitle,
  scope,
}: {
  application: AssistantLocalTurnApplication;
  message: string;
  savedCurriculumTitle?: string;
  scope: TeacherScope;
}): AssistantLocalTurnResult {
  const localResult = completeLocalAssistantDraft({
    draft: application.draft,
    message,
    savedTitle: savedCurriculumTitle,
    scope,
  });

  return {
    assistantMessage: localResult.assistantMessage,
    clearPendingBlocks: application.clearPendingBlocks,
    notice: localResult.notice,
    pendingTarget: application.pendingTarget,
  };
}

export function runAssistantLocalTurn({
  message,
  savedCurriculumTitle,
  scope,
}: {
  message: string;
  savedCurriculumTitle?: string;
  scope: TeacherScope;
}): AssistantLocalTurnResult {
  return completeAssistantLocalTurn({
    application: buildAssistantLocalTurnApplication({ message, scope }),
    message,
    savedCurriculumTitle,
    scope,
  });
}
