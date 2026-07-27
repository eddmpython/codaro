export type NotebookCellNavigationDirection = "next" | "previous";

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
