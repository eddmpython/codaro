import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import type { PendingTarget } from "@/lib/assistantResponsePlan";
import {
  buildAcceptPendingChangesApplication,
  buildRejectPendingChangesApplication,
  type PendingChangesApplication,
} from "@/lib/pendingChanges";
import type { SurfaceMode } from "@/lib/surfaceModel";
import type { AppNotice, BlockConfig, CodaroDocument } from "@/types";

type SaveCurriculum = (
  blocks: BlockConfig[],
  title?: string,
) => { title: string } | null;

type UsePendingChangesStateOptions = {
  applyDraftUpdates: (updates: Record<string, string>) => void;
  document: CodaroDocument;
  replaceDocument: (document: CodaroDocument) => void;
  saveCurriculum: SaveCurriculum;
  selectNotebookBlock: (blockId: string) => void;
  setSurface: Dispatch<SetStateAction<SurfaceMode>>;
  onNotice: (notice: AppNotice) => void;
};

export function usePendingChangesState({
  applyDraftUpdates,
  document,
  replaceDocument,
  saveCurriculum,
  selectNotebookBlock,
  setSurface,
  onNotice,
}: UsePendingChangesStateOptions) {
  const [pendingBlocks, setPendingBlocks] = useState<BlockConfig[]>([]);
  const [pendingTarget, setPendingTarget] = useState<PendingTarget>("notebook");

  const clearPendingChanges = useCallback(() => {
    setPendingBlocks([]);
    setPendingTarget("notebook");
  }, []);

  const applyPendingChangesApplication = useCallback((application: PendingChangesApplication | null) => {
    if (!application) return;
    if (application.curriculumToSave) {
      saveCurriculum(application.curriculumToSave.blocks, application.curriculumToSave.title);
    }
    if (application.documentToApply) {
      replaceDocument(application.documentToApply);
    }
    if (Object.keys(application.draftUpdates).length) {
      applyDraftUpdates(application.draftUpdates);
    }
    if (application.selectedBlockId) {
      selectNotebookBlock(application.selectedBlockId);
    }
    if (application.clearPendingBlocks) {
      setPendingBlocks([]);
    }
    setPendingTarget(application.pendingTarget);
    if (application.surfaceToOpen) {
      setSurface(application.surfaceToOpen);
    }
    if (application.notice) {
      onNotice(application.notice);
    }
  }, [applyDraftUpdates, onNotice, replaceDocument, saveCurriculum, selectNotebookBlock, setSurface]);

  const acceptPendingBlocks = useCallback(() => {
    applyPendingChangesApplication(buildAcceptPendingChangesApplication({
      document,
      pendingBlocks,
      pendingTarget,
    }));
  }, [applyPendingChangesApplication, document, pendingBlocks, pendingTarget]);

  const rejectPendingBlocks = useCallback(() => {
    applyPendingChangesApplication(buildRejectPendingChangesApplication(pendingBlocks));
  }, [applyPendingChangesApplication, pendingBlocks]);

  return {
    acceptPendingBlocks,
    clearPendingChanges,
    pendingBlocks,
    rejectPendingBlocks,
    setPendingBlocks,
    setPendingTarget,
  };
}
