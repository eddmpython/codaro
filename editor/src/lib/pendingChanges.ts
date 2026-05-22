import type { PendingTarget } from "@/lib/assistantResponsePlan";
import {
  appendUniqueBlocks,
  draftsFromBlocks,
  firstCodeBlockId,
} from "@/lib/documentModel";
import { translate } from "@/lib/localeCopy";
import type { SurfaceMode } from "@/lib/surfaceModel";
import type { AppNotice, BlockConfig, CodaroDocument } from "@/types";

export type PendingChangesApplication = {
  clearPendingBlocks: boolean;
  curriculumToSave: {
    blocks: BlockConfig[];
    title?: string;
  } | null;
  documentToApply: CodaroDocument | null;
  draftUpdates: Record<string, string>;
  notice: AppNotice | null;
  pendingTarget: PendingTarget;
  selectedBlockId: string;
  surfaceToOpen: SurfaceMode | null;
};

export function buildAcceptPendingChangesApplication({
  document,
  pendingBlocks,
  pendingTarget,
}: {
  document: CodaroDocument;
  pendingBlocks: BlockConfig[];
  pendingTarget: PendingTarget;
}): PendingChangesApplication | null {
  if (!pendingBlocks.length) return null;

  if (pendingTarget === "curriculum") {
    return {
      clearPendingBlocks: true,
      curriculumToSave: { blocks: pendingBlocks },
      documentToApply: null,
      draftUpdates: {},
      notice: null,
      pendingTarget: "notebook",
      selectedBlockId: "",
      surfaceToOpen: null,
    };
  }

  const appended = appendUniqueBlocks(document, pendingBlocks, { generatedTitle: "생성된 노트북" });
  return {
    clearPendingBlocks: true,
    curriculumToSave: null,
    documentToApply: appended.document,
    draftUpdates: draftsFromBlocks(pendingBlocks, { includeMarkdown: true }),
    notice: {
      tone: "success",
      title: translate("system.pendingApplied.title"),
      detail: translate("system.pendingApplied.detail", { count: appended.addedBlocks.length || pendingBlocks.length }),
    },
    pendingTarget: "notebook",
    selectedBlockId: firstCodeBlockId(pendingBlocks),
    surfaceToOpen: "editor",
  };
}

export function buildRejectPendingChangesApplication(pendingBlocks: BlockConfig[]): PendingChangesApplication | null {
  if (!pendingBlocks.length) return null;

  return {
    clearPendingBlocks: true,
    curriculumToSave: null,
    documentToApply: null,
    draftUpdates: {},
    notice: {
      tone: "default",
      title: translate("system.pendingDiscarded.title"),
      detail: translate("system.pendingDiscarded.detail"),
    },
    pendingTarget: "notebook",
    selectedBlockId: "",
    surfaceToOpen: null,
  };
}
