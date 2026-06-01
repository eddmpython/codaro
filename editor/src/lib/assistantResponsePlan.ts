import { buildLocalBlocksFromPrompt } from "@/lib/localFallback";
import { translate } from "@/lib/localeCopy";
import type { SurfaceMode } from "@/lib/surfaceModel";
import type { TeacherScope } from "@/lib/teacherScope";
import {
  collectBlocksFromToolCalls,
  documentFromToolCalls,
} from "@/lib/toolCallDocuments";
import type { AiChatResponse, AppNotice, BlockConfig, CodaroDocument } from "@/types";

export type PendingTarget = "notebook" | "curriculum";

export type CurriculumToSave = {
  blocks: BlockConfig[];
  title?: string;
};

export type AssistantResponsePlan = {
  clearPendingBlocks: boolean;
  curriculumToSave: CurriculumToSave | null;
  documentToApply: CodaroDocument | null;
  pendingBlocks: BlockConfig[];
};

export type AssistantResponseApplication = {
  clearPendingBlocks: boolean;
  curriculumToSave: CurriculumToSave | null;
  documentToApply: CodaroDocument | null;
  pendingBlocks: BlockConfig[];
  pendingTarget: PendingTarget | null;
  surfaceToOpen: SurfaceMode | null;
};

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

  return {
    clearPendingBlocks: plan.clearPendingBlocks,
    curriculumToSave: plan.curriculumToSave,
    documentToApply: plan.documentToApply,
    pendingBlocks: plan.pendingBlocks,
    pendingTarget: plan.pendingBlocks.length || plan.clearPendingBlocks ? "notebook" : null,
    surfaceToOpen: plan.curriculumToSave ? "curriculum" : plan.documentToApply || plan.pendingBlocks.length ? "editor" : null,
  };
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
