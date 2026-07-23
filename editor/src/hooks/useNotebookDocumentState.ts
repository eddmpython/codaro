import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  draftsFromDocument,
  materializeDrafts,
} from "@/lib/documentModel";
import {
  createNotebookSaveSessionId,
  loadInitialNotebookDocument,
  persistNotebookDocument,
  resolveNotebookSaveCompletion,
  type NotebookPersistenceMode,
  type NotebookPersistenceResult,
  type NotebookPersistenceState,
} from "@/lib/notebookPersistence";
import { documentSaveSupportsKeepalive } from "@/lib/documentSavePolicy";
import type { BlockConfig, CodaroDocument } from "@/types";

type UseNotebookDocumentStateOptions = {
  localDocumentPath: string | null;
  persistenceEnabled: boolean;
  retryKey: unknown;
};

type PendingNotebookSave = {
  document: CodaroDocument;
  epoch: number;
  keepalive: boolean;
  localPath: string | null;
  revision: number;
  signature: string;
};

type NotebookLocalPathBinding = {
  documentId: string;
  path: string | null;
};

const NOTEBOOK_AUTOSAVE_DELAY_MS = 700;

export function useNotebookDocumentState({
  localDocumentPath,
  persistenceEnabled,
  retryKey,
}: UseNotebookDocumentStateOptions) {
  const initialRef = useRef<ReturnType<typeof loadInitialNotebookDocument> | null>(null);
  if (!initialRef.current) {
    initialRef.current = loadInitialNotebookDocument();
  }
  const initial = initialRef.current;
  const [document, setDocument] = useState<CodaroDocument>(initial.document);
  const [drafts, setDrafts] = useState<Record<string, string>>(
    draftsFromDocument(initial.document),
  );
  const [selectedBlockId, setSelectedBlockId] = useState(
    initial.document.blocks.find((block) => block.type === "code")?.id
      ?? initial.document.blocks[0]?.id
      ?? "",
  );
  const {
    persistence,
    prepareLoadedDocument,
  } = useNotebookAutosave({
    document,
    drafts,
    initialError: initial.error,
    localDocumentPath,
    mode: initial.mode,
    persistenceEnabled,
    retryKey,
  });

  const applyNotebookDocument = useCallback((nextDocument: CodaroDocument) => {
    const nextDrafts = draftsFromDocument(nextDocument);
    const firstCodeBlock = nextDocument.blocks.find((block) => block.type === "code");

    setDocument(nextDocument);
    setDrafts(nextDrafts);
    setSelectedBlockId(firstCodeBlock?.id ?? nextDocument.blocks[0]?.id ?? "");
  }, []);

  const loadNotebookDocument = useCallback((nextDocument: CodaroDocument) => {
    prepareLoadedDocument(nextDocument);
    applyNotebookDocument(nextDocument);
  }, [applyNotebookDocument, prepareLoadedDocument]);

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

    const remainingBlocks = document.blocks.filter((block) => block.id !== blockId);
    const replacementBlock: BlockConfig | null = remainingBlocks.length
      ? null
      : { id: `code-${Date.now()}`, type: "code", content: "" };
    const nextBlocks = replacementBlock ? [replacementBlock] : remainingBlocks;
    const fallbackBlock = replacementBlock
      ?? nextBlocks[Math.min(blockIndex, Math.max(nextBlocks.length - 1, 0))];

    setDocument({
      ...document,
      blocks: nextBlocks,
      app: document.app
        ? {
          ...document.app,
          entryBlockIds: document.app.entryBlockIds
            .filter((entryBlockId) => entryBlockId !== blockId)
            .concat(
              replacementBlock && document.app.entryBlockIds.includes(blockId)
                ? replacementBlock.id
                : [],
            ),
        }
        : document.app,
    });
    setDrafts((current) => {
      const nextDrafts = { ...current };
      delete nextDrafts[blockId];
      if (replacementBlock) {
        nextDrafts[replacementBlock.id] = "";
      }
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

  const replaceDocument = useCallback((
    nextDocument: CodaroDocument | ((current: CodaroDocument) => CodaroDocument),
  ) => {
    setDocument((current) =>
      typeof nextDocument === "function" ? nextDocument(current) : nextDocument,
    );
  }, []);

  return {
    addNotebookCell,
    applyDraftUpdates,
    applyNotebookDocument,
    deleteNotebookCell,
    document,
    drafts,
    loadNotebookDocument,
    persistence,
    renameNotebookDocument,
    replaceDocument,
    selectedBlockId,
    selectBlock: setSelectedBlockId,
    updateDraft,
  };
}

function useNotebookAutosave({
  document,
  drafts,
  initialError,
  localDocumentPath,
  mode,
  persistenceEnabled,
  retryKey,
}: {
  document: CodaroDocument;
  drafts: Record<string, string>;
  initialError: string | null;
  localDocumentPath: string | null;
  mode: NotebookPersistenceMode;
  persistenceEnabled: boolean;
  retryKey: unknown;
}) {
  const initialDocument = materializeDrafts(document, drafts);
  const initialSignature = notebookDocumentSignature(initialDocument);
  const activeDocumentIdRef = useRef(document.id);
  const documentEpochRef = useRef(0);
  const initialErrorActiveRef = useRef(Boolean(initialError));
  const latestSignatureRef = useRef(initialSignature);
  const latestSnapshotRef = useRef<PendingNotebookSave | null>(null);
  const localPathBindingRef = useRef<NotebookLocalPathBinding>({
    documentId: document.id,
    path: localDocumentPath?.trim() || null,
  });
  const observedLocalDocumentPathRef = useRef(localDocumentPath?.trim() || null);
  const activeRegularSaveRef = useRef<PendingNotebookSave | null>(null);
  const lastTransitionKeepaliveRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const pendingRef = useRef<PendingNotebookSave | null>(null);
  const persistedSignatureRef = useRef(initialSignature);
  const revisionRef = useRef(0);
  const saveQueueRef = useRef<PendingNotebookSave[]>([]);
  const saveSessionIdRef = useRef(createNotebookSaveSessionId());
  const savingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const [persistence, setPersistence] = useState<NotebookPersistenceState>({
    detail: null,
    error: initialError,
    mode,
    phase: initialError ? "error" : "idle",
    ready: false,
    savedAt: null,
  });

  const clearSaveTimer = useCallback(() => {
    if (timeoutRef.current === null) return;
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const handleSnapshotSaved = useCallback((
    snapshot: PendingNotebookSave,
    saved: NotebookPersistenceResult,
  ) => {
    const initialCompletion = resolveNotebookSaveCompletion({
      currentEpoch: documentEpochRef.current,
      latestSignature: latestSignatureRef.current,
      pendingSignature: pendingRef.current?.signature ?? null,
      snapshotEpoch: snapshot.epoch,
      snapshotSignature: snapshot.signature,
    });
    if (initialCompletion === "ignore") return;
    if (saved.localPath) {
      localPathBindingRef.current = {
        documentId: snapshot.document.id,
        path: saved.localPath,
      };
    }
    if (!saved.accepted && saved.revision !== snapshot.revision) return;

    persistedSignatureRef.current = snapshot.signature;
    if (pendingRef.current?.signature === snapshot.signature) {
      pendingRef.current = null;
      clearSaveTimer();
    }
    if (!mountedRef.current) return;
    const completion = resolveNotebookSaveCompletion({
      currentEpoch: documentEpochRef.current,
      latestSignature: latestSignatureRef.current,
      pendingSignature: pendingRef.current?.signature ?? null,
      snapshotEpoch: snapshot.epoch,
      snapshotSignature: snapshot.signature,
    });
    setPersistence({
      detail: saved.detail,
      error: null,
      mode,
      phase: completion === "pending" ? "pending" : "saved",
      ready: true,
      savedAt: completion === "pending" ? null : Date.now(),
    });
  }, [clearSaveTimer, mode]);

  const handleSnapshotFailure = useCallback((
    snapshot: PendingNotebookSave,
    error: unknown,
  ) => {
    console.error("노트북을 자동 저장하지 못했습니다.", error);
    if (
      !mountedRef.current
      || persistedSignatureRef.current === snapshot.signature
    ) {
      return;
    }
    const completion = resolveNotebookSaveCompletion({
      currentEpoch: documentEpochRef.current,
      latestSignature: latestSignatureRef.current,
      pendingSignature: pendingRef.current?.signature ?? null,
      snapshotEpoch: snapshot.epoch,
      snapshotSignature: snapshot.signature,
    });
    if (completion === "ignore") return;
    if (completion === "settled") {
      pendingRef.current = snapshot;
    }
    setPersistence((current) => ({
      ...current,
      error: error instanceof Error ? error.message : String(error),
      phase: completion === "pending" ? "pending" : "error",
      ready: true,
      savedAt: null,
    }));
  }, []);

  const performSnapshotSave = useCallback(async (
    snapshot: PendingNotebookSave,
  ) => {
    if (mountedRef.current) {
      setPersistence((current) => ({
        ...current,
        error: null,
        phase: "saving",
        ready: true,
      }));
    }
    try {
      const saved = await persistNotebookDocument({
        document: snapshot.document,
        keepalive: snapshot.keepalive,
        localPath: snapshot.localPath,
        mode,
        revision: snapshot.revision,
        saveSessionId: saveSessionIdRef.current,
      });
      handleSnapshotSaved(snapshot, saved);
    } catch (error) {
      handleSnapshotFailure(snapshot, error);
    }
  }, [handleSnapshotFailure, handleSnapshotSaved, mode]);

  const drainSaveQueue = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      while (saveQueueRef.current.length) {
        const snapshot = saveQueueRef.current.shift();
        if (!snapshot) continue;
        activeRegularSaveRef.current = snapshot;
        try {
          await performSnapshotSave(snapshot);
        } finally {
          activeRegularSaveRef.current = null;
        }
      }
    } finally {
      savingRef.current = false;
    }
  }, [performSnapshotSave]);

  const enqueueRegularSave = useCallback((snapshot: PendingNotebookSave) => {
    const alreadyActive = activeRegularSaveRef.current?.epoch === snapshot.epoch
      && activeRegularSaveRef.current.revision === snapshot.revision;
    const alreadyQueued = saveQueueRef.current.some(
      (queued) => queued.epoch === snapshot.epoch && queued.revision === snapshot.revision,
    );
    if (!alreadyActive && !alreadyQueued) {
      saveQueueRef.current.push({ ...snapshot, keepalive: false });
    }
    void drainSaveQueue();
  }, [drainSaveQueue]);

  const flushPendingSave = useCallback(() => {
    clearSaveTimer();
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!pending) return;
    enqueueRegularSave(pending);
  }, [clearSaveTimer, enqueueRegularSave]);

  const flushForPageTransition = useCallback(() => {
    clearSaveTimer();
    const snapshot = pendingRef.current ?? latestSnapshotRef.current;
    if (
      !snapshot
      || (
        snapshot.signature === persistedSignatureRef.current
        && pendingRef.current === null
      )
    ) {
      return;
    }
    if (pendingRef.current?.revision === snapshot.revision) {
      pendingRef.current = null;
    }
    enqueueRegularSave(snapshot);

    if (
      mode !== "local"
      || !documentSaveSupportsKeepalive(
        snapshot.localPath,
        snapshot.document,
        {
          keepalive: true,
          saveDocumentId: snapshot.document.id,
          saveRevision: snapshot.revision,
          saveSessionId: saveSessionIdRef.current,
        },
      )
    ) {
      return;
    }
    const keepaliveKey = `${snapshot.epoch}:${snapshot.revision}`;
    if (lastTransitionKeepaliveRef.current === keepaliveKey) return;
    lastTransitionKeepaliveRef.current = keepaliveKey;
    void performSnapshotSave({ ...snapshot, keepalive: true });
  }, [clearSaveTimer, enqueueRegularSave, mode, performSnapshotSave]);

  const shouldWarnBeforeUnload = useCallback(() => {
    const snapshot = pendingRef.current ?? latestSnapshotRef.current;
    if (
      mode !== "local"
      || !snapshot
      || snapshot.signature === persistedSignatureRef.current
    ) {
      return false;
    }
    return !documentSaveSupportsKeepalive(
      snapshot.localPath,
      snapshot.document,
      {
        keepalive: true,
        saveDocumentId: snapshot.document.id,
        saveRevision: snapshot.revision,
        saveSessionId: saveSessionIdRef.current,
      },
    );
  }, [mode]);

  const prepareLoadedDocument = useCallback((nextDocument: CodaroDocument) => {
    flushPendingSave();
    documentEpochRef.current += 1;
    activeDocumentIdRef.current = nextDocument.id;
    const signature = notebookDocumentSignature(nextDocument);
    latestSignatureRef.current = signature;
    persistedSignatureRef.current = signature;
    initialErrorActiveRef.current = false;
    latestSnapshotRef.current = null;
    pendingRef.current = null;
    if (localPathBindingRef.current.documentId !== nextDocument.id) {
      localPathBindingRef.current = {
        documentId: nextDocument.id,
        path: null,
      };
    }
    lastTransitionKeepaliveRef.current = null;
    clearSaveTimer();
    setPersistence((current) => ({
      ...current,
      error: null,
      phase: "idle",
      savedAt: null,
    }));
  }, [clearSaveTimer, flushPendingSave]);

  useEffect(() => {
    const nextLocalPath = localDocumentPath?.trim() || null;
    if (observedLocalDocumentPathRef.current === nextLocalPath) return;
    observedLocalDocumentPathRef.current = nextLocalPath;
    localPathBindingRef.current = {
      documentId: document.id,
      path: nextLocalPath,
    };
  }, [document.id, localDocumentPath]);

  useEffect(() => {
    const materializedDocument = materializeDrafts(document, drafts);
    const signature = notebookDocumentSignature(materializedDocument);
    latestSignatureRef.current = signature;

    if (!persistenceEnabled) {
      clearSaveTimer();
      pendingRef.current = null;
      setPersistence((current) => ({
        ...current,
        phase: current.error ? "error" : "idle",
        ready: false,
      }));
      return;
    }

    if (activeDocumentIdRef.current !== document.id) {
      flushPendingSave();
      documentEpochRef.current += 1;
      activeDocumentIdRef.current = document.id;
      latestSnapshotRef.current = null;
      persistedSignatureRef.current = "";
      if (localPathBindingRef.current.documentId !== document.id) {
        localPathBindingRef.current = {
          documentId: document.id,
          path: null,
        };
      }
      lastTransitionKeepaliveRef.current = null;
    }

    if (signature === persistedSignatureRef.current) {
      clearSaveTimer();
      latestSnapshotRef.current = null;
      pendingRef.current = null;
      setPersistence((current) => ({
        ...current,
        error: initialErrorActiveRef.current ? current.error : null,
        phase: initialErrorActiveRef.current
          ? "error"
          : current.savedAt
            ? "saved"
            : "idle",
        ready: true,
      }));
      return;
    }

    initialErrorActiveRef.current = false;
    revisionRef.current += 1;
    const snapshot: PendingNotebookSave = {
      document: materializedDocument,
      epoch: documentEpochRef.current,
      keepalive: false,
      localPath: localPathBindingRef.current.documentId === document.id
        ? localPathBindingRef.current.path
        : null,
      revision: revisionRef.current,
      signature,
    };
    latestSnapshotRef.current = snapshot;
    pendingRef.current = snapshot;
    clearSaveTimer();
    setPersistence((current) => ({
      ...current,
      error: null,
      phase: "pending",
      ready: true,
      savedAt: null,
    }));
    timeoutRef.current = window.setTimeout(flushPendingSave, NOTEBOOK_AUTOSAVE_DELAY_MS);
  }, [
    clearSaveTimer,
    document,
    drafts,
    flushPendingSave,
    localDocumentPath,
    mode,
    persistenceEnabled,
    retryKey,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldWarnBeforeUnload()) return;
      flushForPageTransition();
      event.preventDefault();
      event.returnValue = "";
    };
    const handlePageHide = () => flushForPageTransition();
    const handleVisibilityChange = () => {
      if (window.document.visibilityState === "hidden") {
        flushForPageTransition();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    window.document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      window.document.removeEventListener("visibilitychange", handleVisibilityChange);
      mountedRef.current = false;
      flushForPageTransition();
    };
  }, [flushForPageTransition, shouldWarnBeforeUnload]);

  return {
    persistence,
    prepareLoadedDocument,
  };
}

function notebookDocumentSignature(document: CodaroDocument): string {
  return JSON.stringify(document);
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
