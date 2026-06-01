import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import type { PendingTarget } from "@/lib/assistantArtifactRouting";
import {
  saveAndOpenCustomCurriculum,
  type CustomCurriculumEntry,
  type SaveCustomCurriculum,
} from "@/lib/customCurricula";
import {
  buildAcceptPendingChangesApplication,
  buildRejectPendingChangesApplication,
  type PendingChangesApplication,
} from "@/lib/pendingChanges";
import type { SurfaceMode } from "@/lib/surfaceModel";
import type { AppNotice, BlockConfig, CodaroDocument } from "@/types";

type UsePendingChangesStateOptions = {
  applyDraftUpdates: (updates: Record<string, string>) => void;
  document: CodaroDocument;
  openCurriculum: (entry: CustomCurriculumEntry, options?: { showNotice?: boolean }) => void;
  replaceDocument: (document: CodaroDocument) => void;
  saveCurriculum: SaveCustomCurriculum;
  selectNotebookBlock: (blockId: string) => void;
  setSurface: Dispatch<SetStateAction<SurfaceMode>>;
  onNotice: (notice: AppNotice) => void;
};

export function usePendingChangesState({
  applyDraftUpdates,
  document,
  openCurriculum,
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
    const savedCurriculum = saveAndOpenCustomCurriculum({
      curriculumToSave: application.curriculumToSave,
      openCurriculum,
      openOptions: { showNotice: true },
      saveCurriculum,
    });
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
    if (application.surfaceToOpen && !savedCurriculum.opened) {
      setSurface(application.surfaceToOpen);
    }
    if (application.notice) {
      onNotice(application.notice);
    }
  }, [applyDraftUpdates, onNotice, openCurriculum, replaceDocument, saveCurriculum, selectNotebookBlock, setSurface]);

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
