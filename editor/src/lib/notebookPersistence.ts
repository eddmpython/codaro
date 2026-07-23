import { codaroApi, shouldUseApi } from "@/lib/api";
import {
  normalizeDocumentPayload,
  starterDocument,
} from "@/lib/documentModel";
import type { CodaroDocument } from "@/types";

export const browserNotebookStorageKey = "codaro-notebook-document-v1";

export type NotebookPersistenceMode = "local" | "web";

export type NotebookPersistencePhase =
  | "idle"
  | "pending"
  | "saving"
  | "saved"
  | "error";

export type NotebookPersistenceState = {
  detail: string | null;
  error: string | null;
  mode: NotebookPersistenceMode;
  phase: NotebookPersistencePhase;
  ready: boolean;
  savedAt: number | null;
};

export type NotebookSaveCompletion = "ignore" | "pending" | "settled";

export type NotebookPersistenceResult = {
  accepted: boolean;
  detail: string;
  localPath: string | null;
  revision: number;
};

type NotebookStorage = Pick<Storage, "getItem" | "setItem">;

type BrowserNotebookPayload = {
  document: CodaroDocument;
  savedAt: string;
  version: 1;
};

export function notebookPersistenceMode(): NotebookPersistenceMode {
  return shouldUseApi() ? "local" : "web";
}

export function loadInitialNotebookDocument(): {
  document: CodaroDocument;
  error: string | null;
  mode: NotebookPersistenceMode;
} {
  const mode = notebookPersistenceMode();
  if (mode === "local" || typeof window === "undefined") {
    return {
      document: cloneStarterDocument(),
      error: null,
      mode,
    };
  }

  const loaded = loadBrowserNotebookDocument(window.localStorage);
  return {
    document: loaded.document ?? cloneStarterDocument(),
    error: loaded.error,
    mode,
  };
}

export function loadBrowserNotebookDocument(storage: NotebookStorage): {
  document: CodaroDocument | null;
  error: string | null;
} {
  try {
    const raw = storage.getItem(browserNotebookStorageKey);
    if (!raw) return { document: null, error: null };
    const payload = JSON.parse(raw) as Partial<BrowserNotebookPayload>;
    if (payload.version !== 1) {
      throw new Error("지원하지 않는 노트북 저장 버전입니다.");
    }
    const document = normalizeDocumentPayload(payload.document);
    if (!document) {
      throw new Error("저장된 노트북 형식이 올바르지 않습니다.");
    }
    return { document, error: null };
  } catch (error) {
    return {
      document: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function saveBrowserNotebookDocument(
  storage: NotebookStorage,
  document: CodaroDocument,
): void {
  const payload: BrowserNotebookPayload = {
    document,
    savedAt: new Date().toISOString(),
    version: 1,
  };
  storage.setItem(browserNotebookStorageKey, JSON.stringify(payload));
}

export async function persistNotebookDocument({
  document,
  keepalive = false,
  localPath,
  mode,
  revision,
  saveSessionId,
}: {
  document: CodaroDocument;
  keepalive?: boolean;
  localPath: string | null;
  mode: NotebookPersistenceMode;
  revision: number;
  saveSessionId: string;
}): Promise<NotebookPersistenceResult> {
  if (mode === "web") {
    if (typeof window === "undefined") {
      throw new Error("브라우저 저장소를 사용할 수 없습니다.");
    }
    saveBrowserNotebookDocument(window.localStorage, document);
    return {
      accepted: true,
      detail: "이 브라우저",
      localPath: null,
      revision,
    };
  }

  const saved = await codaroApi.saveDocument(localPath?.trim() || null, document, {
    keepalive,
    saveDocumentId: document.id,
    saveRevision: revision,
    saveSessionId,
  });
  return {
    accepted: saved.accepted,
    detail: saved.path,
    localPath: saved.path,
    revision: saved.saveRevision ?? revision,
  };
}

export function createNotebookSaveSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `notebook-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function resolveNotebookSaveCompletion({
  currentEpoch,
  latestSignature,
  pendingSignature,
  snapshotEpoch,
  snapshotSignature,
}: {
  currentEpoch: number;
  latestSignature: string;
  pendingSignature: string | null;
  snapshotEpoch: number;
  snapshotSignature: string;
}): NotebookSaveCompletion {
  if (snapshotEpoch !== currentEpoch) return "ignore";
  if (latestSignature !== snapshotSignature || pendingSignature !== null) {
    return "pending";
  }
  return "settled";
}

function cloneStarterDocument(): CodaroDocument {
  return {
    ...starterDocument,
    blocks: starterDocument.blocks.map((block) => ({ ...block })),
    metadata: starterDocument.metadata
      ? { ...starterDocument.metadata, tags: [...starterDocument.metadata.tags] }
      : undefined,
    runtime: starterDocument.runtime
      ? { ...starterDocument.runtime, packages: [...starterDocument.runtime.packages] }
      : undefined,
    app: starterDocument.app
      ? { ...starterDocument.app, entryBlockIds: [...starterDocument.app.entryBlockIds] }
      : undefined,
  };
}
