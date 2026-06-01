import type { SurfaceMode } from "@/lib/surfaceModel";
import type { BlockConfig, CodaroDocument } from "@/types";

export type PendingTarget = "notebook" | "curriculum";

export type CurriculumToSave = {
  blocks: BlockConfig[];
  title?: string;
};

export type AssistantArtifactRouteInput = {
  clearPendingBlocks: boolean;
  curriculumToSave: CurriculumToSave | null;
  documentToApply: CodaroDocument | null;
  pendingBlocks: BlockConfig[];
};

export type AssistantArtifactRoute = {
  pendingTarget: PendingTarget | null;
  surfaceToOpen: SurfaceMode | null;
};

export function routeAssistantArtifacts(input: AssistantArtifactRouteInput): AssistantArtifactRoute {
  const hasPendingNotebookChange = input.clearPendingBlocks || input.pendingBlocks.length > 0;
  const hasNotebookArtifact = Boolean(input.documentToApply) || input.pendingBlocks.length > 0;

  return {
    pendingTarget: hasPendingNotebookChange ? "notebook" : null,
    surfaceToOpen: input.curriculumToSave ? "curriculum" : hasNotebookArtifact ? "editor" : null,
  };
}

export function surfaceForAcceptedPendingTarget(target: PendingTarget): SurfaceMode {
  return target === "curriculum" ? "curriculum" : "editor";
}
