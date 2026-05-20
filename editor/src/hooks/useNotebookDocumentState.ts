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

  const addNotebookCell = useCallback((type: "code" | "markdown") => {
    const id = `${type}-${Date.now()}`;
    const nextBlock: BlockConfig = { id, type, content: "" };

    setDocument((current) => ({
      ...current,
      blocks: [...current.blocks, nextBlock],
    }));
    setDrafts((current) => ({ ...current, [id]: "" }));
    setSelectedBlockId(id);
  }, []);

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
    document,
    drafts,
    replaceDocument: setDocument,
    selectedBlockId,
    selectBlock: setSelectedBlockId,
    updateDraft,
  };
}
