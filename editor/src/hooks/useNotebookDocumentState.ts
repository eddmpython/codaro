import { useCallback, useState } from "react";
import {
  draftsFromDocument,
  starterDocument,
} from "@/lib/documentModel";
import type { BlockConfig, CodaroDocument } from "@/types";

export function useNotebookDocumentState() {
  const [document, setDocument] = useState<CodaroDocument>(starterDocument);
  const [drafts, setDrafts] = useState<Record<string, string>>(
    draftsFromDocument(starterDocument),
  );
  const [selectedBlockId, setSelectedBlockId] = useState(starterDocument.blocks[1]?.id ?? starterDocument.blocks[0]?.id ?? "");

  const applyNotebookDocument = useCallback((nextDocument: CodaroDocument) => {
    const nextDrafts = draftsFromDocument(nextDocument);
    const firstCodeBlock = nextDocument.blocks.find((block) => block.type === "code");

    setDocument(nextDocument);
    setDrafts(nextDrafts);
    setSelectedBlockId(firstCodeBlock?.id ?? nextDocument.blocks[0]?.id ?? "");
  }, []);

  const addNotebookCell = useCallback((
    type: "code" | "markdown",
    referenceBlockId?: string,
    placement: "before" | "after" = "after",
  ) => {
    const id = `${type}-${Date.now()}`;
    const nextBlock: BlockConfig = { id, type, content: "" };

    setDocument((current) => ({
      ...current,
      blocks: insertNotebookBlock(current.blocks, nextBlock, referenceBlockId, placement),
    }));
    setDrafts((current) => ({ ...current, [id]: "" }));
    setSelectedBlockId(id);
  }, []);

  const renameNotebookDocument = useCallback((title: string) => {
    setDocument((current) => ({
      ...current,
      title,
      app: current.app ? { ...current.app, title } : current.app,
    }));
  }, []);

  const deleteNotebookCell = useCallback((blockId: string) => {
    const blockIndex = document.blocks.findIndex((block) => block.id === blockId);
    if (blockIndex < 0) return;

    const nextBlocks = document.blocks.filter((block) => block.id !== blockId);
    const fallbackBlock = nextBlocks[Math.min(blockIndex, Math.max(nextBlocks.length - 1, 0))];

    setDocument({
      ...document,
      blocks: nextBlocks,
      app: document.app
        ? {
          ...document.app,
          entryBlockIds: document.app.entryBlockIds.filter((entryBlockId) => entryBlockId !== blockId),
        }
        : document.app,
    });
    setDrafts((current) => {
      const nextDrafts = { ...current };
      delete nextDrafts[blockId];
      return nextDrafts;
    });
    setSelectedBlockId((current) =>
      current !== blockId && nextBlocks.some((block) => block.id === current)
        ? current
        : fallbackBlock?.id ?? "",
    );
  }, [document]);

  const applyDraftUpdates = useCallback((updates: Record<string, string>) => {
    if (!Object.keys(updates).length) return;
    setDrafts((current) => ({
      ...current,
      ...updates,
    }));
  }, []);

  const updateDraft = useCallback((blockId: string, value: string) => {
    setDrafts((current) => ({ ...current, [blockId]: value }));
  }, []);

  return {
    addNotebookCell,
    applyDraftUpdates,
    applyNotebookDocument,
    deleteNotebookCell,
    document,
    drafts,
    renameNotebookDocument,
    replaceDocument: setDocument,
    selectedBlockId,
    selectBlock: setSelectedBlockId,
    updateDraft,
  };
}

function insertNotebookBlock(
  blocks: BlockConfig[],
  nextBlock: BlockConfig,
  referenceBlockId?: string,
  placement: "before" | "after" = "after",
) {
  if (!referenceBlockId) return [...blocks, nextBlock];
  const referenceIndex = blocks.findIndex((block) => block.id === referenceBlockId);
  if (referenceIndex < 0) return [...blocks, nextBlock];
  const insertionIndex = placement === "before" ? referenceIndex : referenceIndex + 1;
  return [
    ...blocks.slice(0, insertionIndex),
    nextBlock,
    ...blocks.slice(insertionIndex),
  ];
}
