import type { LearningArchive } from "@/lib/learningArchive";

const DATABASE_NAME = "codaro-learning-archive-v1";
const DATABASE_VERSION = 1;
const ARCHIVE_STORE = "archives";

export type StoredBrowserLearningArchivePendingImport = {
  archive: LearningArchive;
  startedAt: string;
};

export type StoredBrowserLearningArchiveRecord = {
  archive?: LearningArchive;
  lessonRef: string;
  pendingImport?: StoredBrowserLearningArchivePendingImport;
  revision: number;
  savedAt: string;
};

export type StoredBrowserLearningArchiveState = {
  archive: LearningArchive | null;
  pendingImport: StoredBrowserLearningArchivePendingImport | null;
  revision: number;
  savedAt: string;
};

export type StoredBrowserLearningArchiveWriteReservation = {
  archive: LearningArchive | null;
  revision: number;
};

export async function readStoredBrowserLearningArchive(lessonRef: string): Promise<LearningArchive | null> {
  return (await readStoredBrowserLearningArchiveState(lessonRef)).archive;
}

export async function readStoredBrowserLearningArchiveState(
  lessonRef: string,
): Promise<StoredBrowserLearningArchiveState> {
  const database = await openDatabase();
  try {
    const stored = await requestValue<StoredBrowserLearningArchiveRecord | undefined>(
      database.transaction(ARCHIVE_STORE, "readonly").objectStore(ARCHIVE_STORE).get(lessonRef),
    );
    return storedBrowserLearningArchiveState(stored);
  } finally {
    database.close();
  }
}

export async function reserveStoredBrowserLearningArchiveWrite(
  lessonRef: string,
): Promise<StoredBrowserLearningArchiveWriteReservation | null> {
  const database = await openDatabase();
  try {
    return await new Promise<StoredBrowserLearningArchiveWriteReservation | null>((resolve, reject) => {
      const transaction = database.transaction(ARCHIVE_STORE, "readwrite", { durability: "strict" });
      const store = transaction.objectStore(ARCHIVE_STORE);
      const request = store.get(lessonRef);
      let reservation: StoredBrowserLearningArchiveWriteReservation | null = null;
      request.onsuccess = () => {
        const transition = reserveBrowserLearningArchiveWriteRecord(
          request.result as StoredBrowserLearningArchiveRecord | undefined,
          lessonRef,
        );
        if (!transition) return;
        reservation = transition.reservation;
        store.put(transition.record);
      };
      request.onerror = () => transaction.abort();
      transaction.oncomplete = () => resolve(reservation);
      transaction.onerror = () => reject(transaction.error ?? new Error("Web 학습 작업 저장 순서를 만들지 못했습니다."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Web 학습 작업 저장 순서가 중단되었습니다."));
    });
  } finally {
    database.close();
  }
}

export async function stageStoredBrowserLearningArchiveImport(
  lessonRef: string,
  archive: LearningArchive,
): Promise<number | null> {
  const database = await openDatabase();
  try {
    return await new Promise<number | null>((resolve, reject) => {
      const transaction = database.transaction(ARCHIVE_STORE, "readwrite", { durability: "strict" });
      const store = transaction.objectStore(ARCHIVE_STORE);
      const request = store.get(lessonRef);
      let revision: number | null = null;
      request.onsuccess = () => {
        const transition = stageBrowserLearningArchiveImportRecord(
          request.result as StoredBrowserLearningArchiveRecord | undefined,
          lessonRef,
          archive,
          new Date().toISOString(),
        );
        if (!transition) return;
        revision = transition.revision;
        store.put(transition.record);
      };
      request.onerror = () => transaction.abort();
      transaction.oncomplete = () => resolve(revision);
      transaction.onerror = () => reject(transaction.error ?? new Error("Web 학습 작업 가져오기를 준비하지 못했습니다."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Web 학습 작업 가져오기 준비가 중단되었습니다."));
    });
  } finally {
    database.close();
  }
}

export async function commitStoredBrowserLearningArchiveImport(
  lessonRef: string,
  revision: number,
  rootHash: string,
): Promise<boolean> {
  return updateStoredBrowserLearningArchive(
    lessonRef,
    (stored) => commitBrowserLearningArchiveImportRecord(
      stored,
      lessonRef,
      revision,
      rootHash,
      new Date().toISOString(),
    ),
    "Web 학습 작업 가져오기를 확정하지 못했습니다.",
    "Web 학습 작업 가져오기 확정이 중단되었습니다.",
  );
}

export async function rollbackStoredBrowserLearningArchiveImport(
  lessonRef: string,
  revision: number,
): Promise<boolean> {
  return updateStoredBrowserLearningArchive(
    lessonRef,
    (stored) => rollbackBrowserLearningArchiveImportRecord(stored, lessonRef, revision),
    "Web 학습 작업 가져오기를 복구하지 못했습니다.",
    "Web 학습 작업 가져오기 복구가 중단되었습니다.",
  );
}

export async function writeStoredBrowserLearningArchive(
  lessonRef: string,
  archive: LearningArchive,
  revision: number,
): Promise<boolean> {
  return updateStoredBrowserLearningArchive(
    lessonRef,
    (stored) => writeBrowserLearningArchiveRecord(
      stored,
      lessonRef,
      archive,
      revision,
      new Date().toISOString(),
    ),
    "Web 학습 작업 저장에 실패했습니다.",
    "Web 학습 작업 저장이 중단되었습니다.",
  );
}

export function storedBrowserLearningArchiveState(
  stored: StoredBrowserLearningArchiveRecord | undefined,
): StoredBrowserLearningArchiveState {
  return {
    archive: stored?.archive ?? null,
    pendingImport: stored?.pendingImport ?? null,
    revision: normalizeRevision(stored?.revision),
    savedAt: typeof stored?.savedAt === "string" ? stored.savedAt : "",
  };
}

export function reserveBrowserLearningArchiveWriteRecord(
  stored: StoredBrowserLearningArchiveRecord | undefined,
  lessonRef: string,
): { record: StoredBrowserLearningArchiveRecord; reservation: StoredBrowserLearningArchiveWriteReservation } | null {
  const current = storedBrowserLearningArchiveState(stored);
  if (current.pendingImport) return null;
  const revision = current.revision + 1;
  return {
    record: storedBrowserLearningArchiveRecord(lessonRef, current.archive, null, revision, current.savedAt),
    reservation: { archive: current.archive, revision },
  };
}

export function stageBrowserLearningArchiveImportRecord(
  stored: StoredBrowserLearningArchiveRecord | undefined,
  lessonRef: string,
  archive: LearningArchive,
  startedAt: string,
): { record: StoredBrowserLearningArchiveRecord; revision: number } | null {
  const current = storedBrowserLearningArchiveState(stored);
  if (current.pendingImport) return null;
  const revision = current.revision + 1;
  return {
    record: storedBrowserLearningArchiveRecord(
      lessonRef,
      current.archive,
      { archive, startedAt },
      revision,
      current.savedAt,
    ),
    revision,
  };
}

export function commitBrowserLearningArchiveImportRecord(
  stored: StoredBrowserLearningArchiveRecord | undefined,
  lessonRef: string,
  revision: number,
  rootHash: string,
  savedAt: string,
): StoredBrowserLearningArchiveRecord | null {
  const current = storedBrowserLearningArchiveState(stored);
  if (current.revision !== revision) return null;
  if (!current.pendingImport) {
    return current.archive?.manifest.rootHash === rootHash ? stored ?? null : null;
  }
  if (current.pendingImport.archive.manifest.rootHash !== rootHash) return null;
  return storedBrowserLearningArchiveRecord(
    lessonRef,
    current.pendingImport.archive,
    null,
    revision,
    savedAt,
  );
}

export function rollbackBrowserLearningArchiveImportRecord(
  stored: StoredBrowserLearningArchiveRecord | undefined,
  lessonRef: string,
  revision: number,
): StoredBrowserLearningArchiveRecord | null {
  const current = storedBrowserLearningArchiveState(stored);
  if (current.revision !== revision || !current.pendingImport) return null;
  return storedBrowserLearningArchiveRecord(
    lessonRef,
    current.archive,
    null,
    revision,
    current.savedAt,
  );
}

export function writeBrowserLearningArchiveRecord(
  stored: StoredBrowserLearningArchiveRecord | undefined,
  lessonRef: string,
  archive: LearningArchive,
  revision: number,
  savedAt: string,
): StoredBrowserLearningArchiveRecord | null {
  const current = storedBrowserLearningArchiveState(stored);
  if (current.revision !== revision || current.pendingImport) return null;
  return storedBrowserLearningArchiveRecord(lessonRef, archive, null, revision, savedAt);
}

function storedBrowserLearningArchiveRecord(
  lessonRef: string,
  archive: LearningArchive | null,
  pendingImport: StoredBrowserLearningArchivePendingImport | null,
  revision: number,
  savedAt: string,
): StoredBrowserLearningArchiveRecord {
  return {
    ...(archive ? { archive } : {}),
    lessonRef,
    ...(pendingImport ? { pendingImport } : {}),
    revision,
    savedAt,
  };
}

async function updateStoredBrowserLearningArchive(
  lessonRef: string,
  transition: (
    stored: StoredBrowserLearningArchiveRecord | undefined,
  ) => StoredBrowserLearningArchiveRecord | null,
  failureMessage: string,
  abortedMessage: string,
): Promise<boolean> {
  const database = await openDatabase();
  try {
    return await new Promise<boolean>((resolve, reject) => {
      const transaction = database.transaction(ARCHIVE_STORE, "readwrite", { durability: "strict" });
      const store = transaction.objectStore(ARCHIVE_STORE);
      const request = store.get(lessonRef);
      let updated = false;
      request.onsuccess = () => {
        const next = transition(request.result as StoredBrowserLearningArchiveRecord | undefined);
        if (!next) return;
        store.put(next);
        updated = true;
      };
      request.onerror = () => transaction.abort();
      transaction.oncomplete = () => resolve(updated);
      transaction.onerror = () => reject(transaction.error ?? new Error(failureMessage));
      transaction.onabort = () => reject(transaction.error ?? new Error(abortedMessage));
    });
  } finally {
    database.close();
  }
}

function normalizeRevision(value: unknown): number {
  return Number.isSafeInteger(value) && Number(value) >= 0 ? Number(value) : 0;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(ARCHIVE_STORE)) {
        database.createObjectStore(ARCHIVE_STORE, { keyPath: "lessonRef" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Web 학습 작업 저장소를 열지 못했습니다."));
    request.onblocked = () => reject(new Error("Web 학습 작업 저장소 갱신이 차단됐습니다."));
  });
}

function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Web 학습 작업을 읽지 못했습니다."));
  });
}
