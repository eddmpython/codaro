import type { AssistantMessage } from "@/lib/assistantTypes";
import {
  buildLocalAssistantDraft,
  completeLocalAssistantDraft,
  type LocalAssistantDraft,
} from "@/lib/localFallback";
import {
  buildAssistantArtifactApplication,
  type AssistantArtifactApplication,
  type PendingTarget,
} from "@/lib/assistantArtifactRouting";
import type { TeacherScope } from "@/lib/teacherScope";
import type { AppNotice } from "@/types";

export type AssistantLocalTurnResult = {
  assistantMessage: AssistantMessage;
  clearPendingBlocks: boolean;
  notice: AppNotice;
  pendingTarget: PendingTarget | null;
};

export type AssistantLocalTurnApplication = AssistantArtifactApplication & {
  draft: LocalAssistantDraft;
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
  const curriculumToSave = draft.shouldSaveCurriculum ? { blocks: draft.generatedBlocks } : null;
  const application = buildAssistantArtifactApplication({
    clearPendingBlocks: draft.clearPendingBlocks,
    curriculumToSave,
    documentToApply: null,
    pendingBlocks,
  });
  return {
    ...application,
    draft,
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
