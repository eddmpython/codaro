import { buildLocalBlocksFromPrompt } from "@/lib/localFallback";
import { translate } from "@/lib/localeCopy";
import {
  buildAssistantArtifactApplication,
  type AssistantArtifactApplication,
  type CurriculumToSave,
} from "@/lib/assistantArtifactRouting";
import type { TeacherScope } from "@/lib/teacherScope";
import {
  collectBlocksFromToolCalls,
  documentFromToolCalls,
} from "@/lib/toolCallDocuments";
import type { AiChatResponse, AppNotice, BlockConfig, CodaroDocument } from "@/types";

export type AssistantResponsePlan = {
  clearPendingBlocks: boolean;
  curriculumToSave: CurriculumToSave | null;
  documentToApply: CodaroDocument | null;
  pendingBlocks: BlockConfig[];
};

export type AssistantResponseApplication = AssistantArtifactApplication;

export function buildAssistantResponsePlan({
  activeScope,
  message,
  response,
}: {
  activeScope: TeacherScope;
  message: string;
  response: AiChatResponse;
}): AssistantResponsePlan {
  const plan: AssistantResponsePlan = {
    clearPendingBlocks: false,
    curriculumToSave: null,
    documentToApply: null,
    pendingBlocks: [],
  };

  if (response.toolCalls.length) {
    applyToolArtifacts(plan, response, activeScope);
  }

  if (!plan.curriculumToSave && !plan.documentToApply && !plan.pendingBlocks.length && activeScope !== "cell") {
    if (activeScope === "automation") {
      plan.pendingBlocks = buildLocalBlocksFromPrompt(message, activeScope);
    } else {
      plan.curriculumToSave = {
        blocks: buildLocalBlocksFromPrompt(message, activeScope),
      };
      plan.clearPendingBlocks = true;
    }
  }

  return plan;
}

export function buildAssistantResponseApplication({
  activeScope,
  message,
  response,
}: {
  activeScope: TeacherScope;
  message: string;
  response: AiChatResponse;
}): AssistantResponseApplication {
  const plan = buildAssistantResponsePlan({ activeScope, message, response });
  return buildAssistantArtifactApplication(plan);
}

export function mergePendingBlocks(current: BlockConfig[], incoming: BlockConfig[]): BlockConfig[] {
  const knownIds = new Set(current.map((block) => block.id));
  return [...current, ...incoming.filter((block) => !knownIds.has(block.id))];
}

export function assistantResponseNotice({
  activeScope,
  response,
  savedCurriculumTitle,
}: {
  activeScope: TeacherScope;
  response: AiChatResponse;
  savedCurriculumTitle: string;
}): AppNotice {
  if (savedCurriculumTitle) {
    return {
      tone: "success",
      title: translate("assistant.curriculumSaved"),
      detail: savedCurriculumTitle,
    };
  }

  if (!response.toolCalls.length && activeScope !== "automation") {
    return {
      tone: "default",
      title: translate("assistant.responseDone"),
      detail: response.provider,
    };
  }

  if (activeScope === "cell" || activeScope === "automation") {
    return {
      tone: "success",
      title: translate("assistant.notebookChangeReady"),
      detail: translate("assistant.notebookChangeReadyDetail"),
    };
  }

  return {
    tone: "success",
    title: translate("assistant.curriculumDraftReady"),
    detail: translate("assistant.curriculumDraftReadyDetail"),
  };
}

function applyToolArtifacts(
  plan: AssistantResponsePlan,
  response: AiChatResponse,
  activeScope: TeacherScope,
) {
  const generatedDocument = documentFromToolCalls(response.toolCalls);
  if (generatedDocument) {
    if (activeScope === "lesson" || activeScope === "curriculum") {
      plan.curriculumToSave = {
        blocks: generatedDocument.blocks,
        title: generatedDocument.title,
      };
      plan.clearPendingBlocks = true;
    } else {
      plan.documentToApply = generatedDocument;
    }
    return;
  }

  const generatedBlocks = collectBlocksFromToolCalls(response.toolCalls);
  if (!generatedBlocks.length) return;

  if (activeScope === "cell" || activeScope === "automation") {
    plan.pendingBlocks = generatedBlocks;
    return;
  }

  plan.curriculumToSave = {
    blocks: generatedBlocks,
  };
  plan.clearPendingBlocks = true;
}
