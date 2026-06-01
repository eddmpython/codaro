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
  return {
    pendingTarget: pendingTargetForAssistantArtifacts(input),
    surfaceToOpen: surfaceForAssistantArtifacts(input),
  };
}

export function pendingTargetForAssistantArtifacts(input: AssistantArtifactRouteInput): PendingTarget | null {
  return input.pendingBlocks.length > 0 ? "notebook" : null;
}

export function surfaceForAssistantArtifacts(input: AssistantArtifactRouteInput): SurfaceMode | null {
  if (input.curriculumToSave) return "curriculum";
  if (input.documentToApply || input.pendingBlocks.length > 0) return "editor";
  return null;
}

export function surfaceForAcceptedPendingTarget(target: PendingTarget): SurfaceMode {
  return target === "curriculum" ? "curriculum" : "editor";
}
