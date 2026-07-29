export type NotebookCellNavigationDirection = "next" | "previous";

export const NOTEBOOK_IME_BOUNDARY_GUARD_MS = 120;

export function shouldSuppressNotebookCellBoundaryDuringComposition({
  key,
  isComposing,
  keyCode,
  compositionActive,
  compositionEndedAt,
  now,
}: {
  key: string;
  isComposing: boolean;
  keyCode: number;
  compositionActive: boolean;
  compositionEndedAt: number;
  now: number;
}): boolean {
  if (key !== "ArrowUp" && key !== "ArrowDown") return false;
  if (isComposing || keyCode === 229 || compositionActive) return true;
  const elapsed = now - compositionEndedAt;
  return elapsed >= 0 && elapsed <= NOTEBOOK_IME_BOUNDARY_GUARD_MS;
}

export function resolveNotebookCellBoundaryNavigation({
  key,
  selectionAnchor,
  selectionHead,
  textLength,
}: {
  key: "ArrowDown" | "ArrowUp";
  selectionAnchor: number;
  selectionHead: number;
  textLength: number;
}): NotebookCellNavigationDirection | null {
  if (selectionAnchor !== selectionHead) return null;
  if (key === "ArrowUp" && selectionHead === 0) return "previous";
  if (key === "ArrowDown" && selectionHead === textLength) return "next";
  return null;
}
