import { resolveRegistryContentId } from "@/lib/curriculaRegistry";
import {
  learningEventDigest,
  sealLearningEvent,
  validateLearningEvent,
  type LearningEvent,
} from "@/lib/learningEvent";

export type WebStrongCheckEvidenceInput = {
  actual: string;
  aiHelpUsed?: boolean;
  artifacts?: LearningEvidenceArtifact[];
  assessmentMode?: "acquisition" | "capstone" | "mastery" | "reinforcement" | "retrieval" | "transfer";
  blockId: string;
  category: string;
  checkId: string;
  contentId: string;
  executionCount: number;
  expected: string;
  fixtureHash: string;
  packages?: LearningEvidencePackageAsset[];
  runtimeTier: "local" | "web";
  sectionId?: string;
  source: string;
  outcomeIds?: string[];
  unseen?: boolean;
};

type LearningEvidenceArtifactBase = {
  byteLength: number;
  contentHash: string;
  origin: "created" | "fixture";
  path: string;
  schemaVersion: 1;
};

export type LearningEvidenceArtifact = LearningEvidenceArtifactBase & (
  | { fileCount: number; kind: "directory" | "file" }
  | {
      columnCount: number;
      columns: string[];
      format: "csv" | "json";
      kind: "table";
      rowCount: number;
    }
  | {
      height: number;
      kind: "image";
      mediaType: "image/gif" | "image/jpeg" | "image/png";
      width: number;
    }
);

export type WebStrongCheckEvidenceEvent = {
  attemptFingerprint: string;
  artifacts?: LearningEvidenceArtifact[];
  blockId: string;
  canonicalEvents?: LearningEvent[];
  checkId: string;
  eventId: string;
  executionCount: number;
  expectedHash: string;
  fixtureHash: string;
  kind: "StrongCheckVerified";
  lessonRef: string;
  occurredAt: string;
  packages?: LearningEvidencePackageAsset[];
  payloadHash: string;
  resultHash: string;
  runtimeTier: "local" | "web";
  schemaVersion: 1;
  sourceHash: string;
  strength: "strong";
};

export type WebMigrationImportedEvent = {
  creditEligibility: "none";
  eventId: string;
  kind: "MigrationImported";
  legacyState: Record<string, unknown>;
  lessonRefMap: Record<string, string>;
  occurredAt: string;
  payloadHash: string;
  recordCount: number;
  runtimeTier: "local" | "web";
  schemaVersion: 1;
  sourceKind: "learner-state-sqlite-v1" | "progress-json-v1" | "web-progress-v1";
  sourceRecordHash: string;
};

export type WebLearningEvidenceEvent = WebMigrationImportedEvent | WebStrongCheckEvidenceEvent;

export type LearningEvidencePackageAsset = {
  integrity: string;
  name: string;
  schemaVersion: 1;
  url: string;
  version: string;
};

export type WebStrongCheckEvidenceReceipt = {
  attemptFingerprint: string;
  eventId: string;
  inserted: boolean;
};

export type WebLearningEvidenceArchive = {
  events: WebLearningEvidenceEvent[];
  kind: "codaro.learning-evidence-archive";
  manifest: {
    archiveId: string;
    createdAt: string;
    eventCount: number;
    eventSetHash: string;
    files: Array<{
      byteLength: number;
      contentHash: string;
      mediaType: "application/json";
      path: "evidence/events.json";
    }>;
    runtimeTier: "local" | "mixed" | "web";
    schemaVersion: 1;
  };
  schemaVersion: 1;
};

export type WebLearningEvidenceImportReceipt = {
  accepted: Array<{ checkId: string; lessonRef: string }>;
  conflicted: number;
  inserted: number;
  migrated: number;
  skipped: number;
};

export type WebLearningEvidenceSummary = {
  conflicts: number;
  events: number;
};

export type WebLearningEvidenceStoreHeader = {
  cutoverMarker: {
    eventId: string;
    occurredAt: string;
  };
  dataEpoch: 1;
  key: "store-header";
  legacyImport?: {
    eventCount: number;
    sources: Array<{
      backupHash: string;
      backupKey: string;
      eventId: string;
      recordCount: number;
      sourceKind: "web-progress-v1";
      sourceRecordHash: string;
    }>;
  };
  legacySnapshotHash: string;
  minimumReaderVersion: 3;
  schemaVersion: 1;
};

type StrongEvidenceCore = Omit<WebStrongCheckEvidenceEvent, "payloadHash">;
type EvidenceEventCore = Omit<WebMigrationImportedEvent, "payloadHash"> | StrongEvidenceCore;

const DATABASE_NAME = "codaro-learning-evidence-v1";
const DATABASE_VERSION = 3;
const EVENT_STORE = "events";
const CONFLICT_STORE = "conflicts";
const METADATA_STORE = "metadata";
const STORE_HEADER_KEY = "store-header";
const LEGACY_PROGRESS_STORAGE_KEY = "codaro-web-progress-v1";
const LEGACY_BACKUP_KEY_PREFIX = "legacy-backup:web-progress-v1:";
const ARCHIVE_KIND = "codaro.learning-evidence-archive";
const ARCHIVE_EVENT_PATH = "evidence/events.json";
const SHA256_PATTERN = /^sha256-(?:[A-Za-z0-9_-]{43}|[A-Za-z0-9+/]{43}=)$/;
const MAX_ARCHIVE_EVENTS = 10_000;
const MAX_EVENT_ARTIFACTS = 64;
const MAX_EVENT_PACKAGES = 16;
const MAX_CANONICAL_EVENTS = 4;

const strongEvidenceAttemptFingerprint = async (
  event: Pick<StrongEvidenceCore,
    "blockId" | "checkId" | "executionCount" | "fixtureHash" | "lessonRef" | "occurredAt" | "runtimeTier" | "sourceHash">,
  includeAttemptMetadata: boolean,
): Promise<string> => digestText(stableJson({
  blockId: event.blockId,
  checkId: event.checkId,
  ...(includeAttemptMetadata ? { executionCount: event.executionCount } : {}),
  fixtureHash: event.fixtureHash,
  lessonRef: event.lessonRef,
  ...(includeAttemptMetadata ? { occurredAt: event.occurredAt } : {}),
  runtimeTier: event.runtimeTier,
  sourceHash: event.sourceHash,
}));

export async function appendWebStrongCheckEvidenceTransaction(
  input: WebStrongCheckEvidenceInput,
): Promise<WebStrongCheckEvidenceReceipt> {
  const event = await createWebStrongCheckEvidenceEvent(input);
  return appendWebStrongCheckEvidenceEventTransaction(event);
}

export async function appendWebStrongCheckEvidenceEventTransaction(
  value: WebStrongCheckEvidenceEvent,
): Promise<WebStrongCheckEvidenceReceipt> {
  const event = await normalizeStoredEvidenceEvent(value);
  if (event.kind !== "StrongCheckVerified") throw new Error("strong learning evidence event가 아닙니다.");
  const database = await openEvidenceDatabase();
  try {
    await addEvent(database, event);
    return { attemptFingerprint: event.attemptFingerprint, eventId: event.eventId, inserted: true };
  } catch (error) {
    if (isConstraintError(error)) {
      return { attemptFingerprint: event.attemptFingerprint, eventId: event.eventId, inserted: false };
    }
    throw error;
  } finally {
    database.close();
  }
}

export async function createWebStrongCheckEvidenceEvent(
  input: WebStrongCheckEvidenceInput,
  canonicalEvents: LearningEvent[] = [],
): Promise<WebStrongCheckEvidenceEvent> {
  const sourceHash = await digestText(input.source);
  const resultHash = await digestText(input.actual);
  const expectedHash = await digestText(input.expected);
  const artifacts = normalizeEvidenceArtifacts(input.artifacts ?? []);
  const packages = normalizeEvidencePackages(input.packages ?? []);
  const occurredAt = new Date().toISOString();
  const attemptFingerprint = await strongEvidenceAttemptFingerprint({
    blockId: input.blockId,
    checkId: input.checkId,
    executionCount: input.executionCount,
    fixtureHash: input.fixtureHash,
    lessonRef: `${input.category}/${input.contentId}`,
    occurredAt,
    runtimeTier: input.runtimeTier,
    sourceHash,
  }, true);
  let eventCore: StrongEvidenceCore = {
    attemptFingerprint,
    ...(artifacts.length ? { artifacts } : {}),
    blockId: input.blockId,
    checkId: input.checkId,
    eventId: `${input.runtimeTier}-strong:${attemptFingerprint}`,
    executionCount: input.executionCount,
    expectedHash,
    fixtureHash: input.fixtureHash,
    kind: "StrongCheckVerified",
    lessonRef: `${input.category}/${input.contentId}`,
    occurredAt,
    ...(packages.length ? { packages } : {}),
    resultHash,
    runtimeTier: input.runtimeTier,
    schemaVersion: 1,
    sourceHash,
    strength: "strong",
  };
  if (canonicalEvents.length) {
    eventCore = { ...eventCore, canonicalEvents: await normalizeCanonicalEvents(canonicalEvents, eventCore) };
  }
  return {
    ...eventCore,
    payloadHash: await digestText(stableJson(eventCore)),
  };
}

export async function attachCanonicalEventsToStrongEvidence(
  value: WebStrongCheckEvidenceEvent,
  canonicalEvents: LearningEvent[],
): Promise<WebStrongCheckEvidenceEvent> {
  const { payloadHash: _payloadHash, ...core } = value;
  const normalizedCanonicalEvents = await normalizeCanonicalEvents(canonicalEvents, core);
  const eventCore = { ...core, canonicalEvents: normalizedCanonicalEvents };
  return {
    ...eventCore,
    payloadHash: await digestText(stableJson(eventCore)),
  };
}

export async function countWebStrongCheckEvidence(): Promise<number> {
  const summary = await summarizeWebLearningEvidence();
  return summary.events;
}

export async function readWebLearningEvidenceStoreHeader(): Promise<WebLearningEvidenceStoreHeader> {
  const database = await openEvidenceDatabase();
  try {
    const value = await getStoreValue(database, METADATA_STORE, STORE_HEADER_KEY);
    return validateWebLearningEvidenceStoreHeader(value);
  } finally {
    database.close();
  }
}

export async function listWebStrongCheckEvidence(
  lessonRef?: string,
): Promise<WebStrongCheckEvidenceEvent[]> {
  const database = await openEvidenceDatabase();
  let storedEvents: unknown[];
  try {
    storedEvents = await getAllStoreValues(database, EVENT_STORE);
  } finally {
    database.close();
  }
  const events = await Promise.all(storedEvents.map(normalizeStoredEvidenceEvent));
  return events
    .filter((event): event is WebStrongCheckEvidenceEvent => event.kind === "StrongCheckVerified")
    .filter((event) => !lessonRef || event.lessonRef === lessonRef)
    .sort((left, right) => unicodeCodePointCompare(left.occurredAt, right.occurredAt));
}

export async function summarizeWebLearningEvidence(): Promise<WebLearningEvidenceSummary> {
  const database = await openEvidenceDatabase();
  try {
    const [events, conflicts] = await Promise.all([
      countStore(database, EVENT_STORE),
      countStore(database, CONFLICT_STORE),
    ]);
    return { conflicts, events };
  } finally {
    database.close();
  }
}

export async function buildWebLearningEvidenceArchive(): Promise<WebLearningEvidenceArchive> {
  const database = await openEvidenceDatabase();
  let storedEvents: unknown[];
  try {
    storedEvents = await getAllStoreValues(database, EVENT_STORE);
  } finally {
    database.close();
  }
  const events = await Promise.all(storedEvents.map(normalizeStoredEvidenceEvent));
  events.sort((left, right) => unicodeCodePointCompare(left.eventId, right.eventId));
  const canonicalEvents = stableJson(events);
  const eventSetHash = await digestText(canonicalEvents);
  const hashValue = eventSetHash.slice("sha256-".length);
  const runtimeTier = archiveRuntimeTier(events);
  return {
    events,
    kind: ARCHIVE_KIND,
    manifest: {
      archiveId: `learning-evidence:${hashValue}`,
      createdAt: new Date().toISOString(),
      eventCount: events.length,
      eventSetHash,
      files: [{
        byteLength: new TextEncoder().encode(canonicalEvents).byteLength,
        contentHash: eventSetHash,
        mediaType: "application/json",
        path: ARCHIVE_EVENT_PATH,
      }],
      runtimeTier,
      schemaVersion: 1,
    },
    schemaVersion: 1,
  };
}

export async function serializeWebLearningEvidenceArchive(): Promise<string> {
  return `${JSON.stringify(await buildWebLearningEvidenceArchive(), null, 2)}\n`;
}

export async function importWebLearningEvidenceArchive(
  value: string | unknown,
): Promise<WebLearningEvidenceImportReceipt> {
  const parsed = typeof value === "string" ? parseArchiveJson(value) : value;
  const archive = await validateWebLearningEvidenceArchive(parsed);
  const events = await Promise.all(archive.events.map(migrateWebEvidenceEventLessonRef));
  const migrated = events.filter((event, index) => {
    const original = archive.events[index];
    return event.kind === "StrongCheckVerified"
      && original.kind === "StrongCheckVerified"
      && event.lessonRef !== original.lessonRef;
  }).length;
  const database = await openEvidenceDatabase();
  try {
    return await mergeArchiveEvents(database, events, migrated);
  } finally {
    database.close();
  }
}

export async function replaceWebLearningEvidenceArchive(value: string | unknown): Promise<void> {
  const parsed = typeof value === "string" ? parseArchiveJson(value) : value;
  const archive = await validateWebLearningEvidenceArchive(parsed);
  const events = await Promise.all(archive.events.map(migrateWebEvidenceEventLessonRef));
  const eventIds = events.map((event) => event.eventId);
  const fingerprints = events
    .filter((event): event is WebStrongCheckEvidenceEvent => event.kind === "StrongCheckVerified")
    .map((event) => event.attemptFingerprint);
  if (new Set(eventIds).size !== eventIds.length || new Set(fingerprints).size !== fingerprints.length) {
    throw new Error("복원할 학습 증거 archive의 identity가 중복되었습니다.");
  }
  const database = await openEvidenceDatabase();
  try {
    await replaceArchiveEvents(database, events);
  } finally {
    database.close();
  }
}

function openEvidenceDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      const transaction = request.transaction;
      const eventStore = database.objectStoreNames.contains(EVENT_STORE)
        ? transaction?.objectStore(EVENT_STORE)
        : database.createObjectStore(EVENT_STORE, { keyPath: "eventId" });
      if (eventStore && !eventStore.indexNames.contains("attemptFingerprint")) {
        eventStore.createIndex("attemptFingerprint", "attemptFingerprint", { unique: true });
      }
      if (eventStore && !eventStore.indexNames.contains("lessonRef")) {
        eventStore.createIndex("lessonRef", "lessonRef", { unique: false });
      }
      if (!database.objectStoreNames.contains(CONFLICT_STORE)) {
        const conflictStore = database.createObjectStore(CONFLICT_STORE, { keyPath: "conflictId" });
        conflictStore.createIndex("eventId", "eventId", { unique: false });
      }
      if (!database.objectStoreNames.contains(METADATA_STORE)) {
        database.createObjectStore(METADATA_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => {
      const database = request.result;
      void ensureWebLearningEvidenceCutover(database).then(
        () => resolve(database),
        (error: unknown) => {
          database.close();
          reject(error);
        },
      );
    };
    request.onerror = () => reject(request.error ?? new Error("learning evidence database open failed"));
    request.onblocked = () => reject(new Error("learning evidence database upgrade blocked"));
  });
}

async function ensureWebLearningEvidenceCutover(database: IDBDatabase): Promise<void> {
  const existing = await getStoreValue(database, METADATA_STORE, STORE_HEADER_KEY);
  if (existing !== undefined) {
    validateWebLearningEvidenceStoreHeader(existing);
    return;
  }
  const migrationEvent = await createWebLegacyProgressMigrationEvent();
  const events = await Promise.all(
    (await getAllStoreValues(database, EVENT_STORE)).map(normalizeStoredEvidenceEvent),
  );
  if (migrationEvent && !events.some((event) => event.eventId === migrationEvent.eventId)) {
    events.push(migrationEvent);
  }
  events.sort((left, right) => unicodeCodePointCompare(evidenceEventId(left), evidenceEventId(right)));
  const legacySnapshotHash = await digestText(stableJson(events));
  const backupKey = migrationEvent
    ? `${LEGACY_BACKUP_KEY_PREFIX}${migrationEvent.sourceRecordHash.slice("sha256-".length)}`
    : null;
  const header: WebLearningEvidenceStoreHeader = {
    cutoverMarker: {
      eventId: `learning-evidence-cutover:${legacySnapshotHash.slice("sha256-".length)}`,
      occurredAt: new Date().toISOString(),
    },
    dataEpoch: 1,
    key: STORE_HEADER_KEY,
    legacyImport: {
      eventCount: migrationEvent ? 1 : 0,
      sources: migrationEvent && backupKey ? [{
        backupHash: migrationEvent.sourceRecordHash,
        backupKey,
        eventId: migrationEvent.eventId,
        recordCount: migrationEvent.recordCount,
        sourceKind: "web-progress-v1",
        sourceRecordHash: migrationEvent.sourceRecordHash,
      }] : [],
    },
    legacySnapshotHash,
    minimumReaderVersion: DATABASE_VERSION,
    schemaVersion: 1,
  };
  await commitWebLearningEvidenceCutover(database, header, migrationEvent, backupKey);
}

function validateWebLearningEvidenceStoreHeader(value: unknown): WebLearningEvidenceStoreHeader {
  if (!isRecord(value) || !isRecord(value.cutoverMarker)) {
    throw new Error("학습 증거 store header 형식이 유효하지 않습니다.");
  }
  if (
    value.key !== STORE_HEADER_KEY
    || value.schemaVersion !== 1
    || value.dataEpoch !== 1
    || value.minimumReaderVersion !== DATABASE_VERSION
    || typeof value.legacySnapshotHash !== "string"
    || !SHA256_PATTERN.test(value.legacySnapshotHash)
    || typeof value.cutoverMarker.eventId !== "string"
    || !value.cutoverMarker.eventId.startsWith("learning-evidence-cutover:")
    || typeof value.cutoverMarker.occurredAt !== "string"
  ) {
    throw new Error("학습 증거 store header 계약이 유효하지 않습니다.");
  }
  validateWebLegacyImportHeader(value.legacyImport);
  return value as unknown as WebLearningEvidenceStoreHeader;
}

async function createWebLegacyProgressMigrationEvent(): Promise<WebMigrationImportedEvent | null> {
  const raw = window.localStorage.getItem(LEGACY_PROGRESS_STORAGE_KEY);
  if (!raw) return null;
  let legacyState: unknown;
  try {
    legacyState = JSON.parse(raw);
  } catch {
    throw new Error("기존 Web 학습 progress를 읽을 수 없습니다.");
  }
  if (!isRecord(legacyState) || legacyState.version !== 1 || !isRecord(legacyState.lessons)) {
    throw new Error("기존 Web 학습 progress 형식이 유효하지 않습니다.");
  }
  if (!Object.keys(legacyState.lessons).length) return null;
  const sourceRecordHash = await digestText(stableJson(legacyState));
  const lessonRefMap: Record<string, string> = {};
  for (const [key, value] of Object.entries(legacyState.lessons)) {
    if (!isRecord(value)) continue;
    const category = typeof value.category === "string" ? value.category : "";
    const contentId = typeof value.contentId === "string" ? value.contentId : "";
    const candidate = category && contentId ? `${category}/${contentId}` : key;
    const separator = candidate.indexOf("/");
    if (separator < 1 || separator !== candidate.lastIndexOf("/")) continue;
    const canonicalContentId = await resolveRegistryContentId(
      candidate.slice(0, separator),
      candidate.slice(separator + 1),
    );
    if (canonicalContentId) lessonRefMap[key] = `${candidate.slice(0, separator)}/${canonicalContentId}`;
  }
  const core: Omit<WebMigrationImportedEvent, "payloadHash"> = {
    creditEligibility: "none",
    eventId: `web-migration:${sourceRecordHash.slice("sha256-".length)}`,
    kind: "MigrationImported",
    legacyState,
    lessonRefMap,
    occurredAt: typeof legacyState.updatedAt === "string" ? legacyState.updatedAt : new Date().toISOString(),
    recordCount: Object.keys(legacyState.lessons).length,
    runtimeTier: "web",
    schemaVersion: 1,
    sourceKind: "web-progress-v1",
    sourceRecordHash,
  };
  return {
    ...core,
    payloadHash: await digestText(stableJson(core)),
  };
}

function commitWebLearningEvidenceCutover(
  database: IDBDatabase,
  header: WebLearningEvidenceStoreHeader,
  migrationEvent: WebMigrationImportedEvent | null,
  backupKey: string | null,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([EVENT_STORE, METADATA_STORE], "readwrite", { durability: "strict" });
    if (migrationEvent && backupKey) {
      transaction.objectStore(EVENT_STORE).put(migrationEvent);
      transaction.objectStore(METADATA_STORE).put({
        key: backupKey,
        kind: "LegacyProgressBackup",
        legacyState: migrationEvent.legacyState,
        payloadHash: migrationEvent.sourceRecordHash,
        recordCount: migrationEvent.recordCount,
        schemaVersion: 1,
        sourceKind: migrationEvent.sourceKind,
      });
    }
    transaction.objectStore(METADATA_STORE).put(header);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("learning evidence cutover failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("learning evidence cutover aborted"));
  });
}

function validateWebLegacyImportHeader(value: unknown): void {
  if (value === undefined) return;
  if (!isRecord(value) || !Number.isSafeInteger(value.eventCount) || Number(value.eventCount) < 0) {
    throw new Error("기존 Web 학습 진도 이관 header 형식이 유효하지 않습니다.");
  }
  if (!Array.isArray(value.sources) || value.sources.length !== value.eventCount) {
    throw new Error("기존 Web 학습 진도 이관 header 계약이 유효하지 않습니다.");
  }
  for (const source of value.sources) {
    if (
      !isRecord(source)
      || source.sourceKind !== "web-progress-v1"
      || typeof source.eventId !== "string"
      || !source.eventId.startsWith("web-migration:")
      || typeof source.backupKey !== "string"
      || !source.backupKey.startsWith(LEGACY_BACKUP_KEY_PREFIX)
      || typeof source.backupHash !== "string"
      || !SHA256_PATTERN.test(source.backupHash)
      || typeof source.sourceRecordHash !== "string"
      || !SHA256_PATTERN.test(source.sourceRecordHash)
      || source.backupHash !== source.sourceRecordHash
      || !Number.isSafeInteger(source.recordCount)
      || Number(source.recordCount) < 0
    ) {
      throw new Error("기존 Web 학습 진도 이관 source descriptor가 유효하지 않습니다.");
    }
  }
}

function addEvent(database: IDBDatabase, event: WebStrongCheckEvidenceEvent): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(EVENT_STORE, "readwrite", { durability: "strict" });
    transaction.objectStore(EVENT_STORE).add(event);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("learning evidence transaction failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("learning evidence transaction aborted"));
  });
}

function countStore(database: IDBDatabase, storeName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, "readonly").objectStore(storeName).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error(`learning evidence ${storeName} count failed`));
  });
}

function getAllStoreValues(database: IDBDatabase, storeName: string): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, "readonly").objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error(`learning evidence ${storeName} read failed`));
  });
}

function getStoreValue(database: IDBDatabase, storeName: string, key: IDBValidKey): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, "readonly").objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error(`learning evidence ${storeName} read failed`));
  });
}

function evidenceEventId(value: unknown): string {
  return isRecord(value) && typeof value.eventId === "string" ? value.eventId : "";
}

function mergeArchiveEvents(
  database: IDBDatabase,
  events: WebLearningEvidenceEvent[],
  migrated = 0,
): Promise<WebLearningEvidenceImportReceipt> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([EVENT_STORE, CONFLICT_STORE], "readwrite", { durability: "strict" });
    const eventStore = transaction.objectStore(EVENT_STORE);
    const conflictStore = transaction.objectStore(CONFLICT_STORE);
    const receipt: WebLearningEvidenceImportReceipt = {
      accepted: [],
      conflicted: 0,
      inserted: 0,
      migrated,
      skipped: 0,
    };
    for (const event of events) {
      const request = eventStore.get(event.eventId);
      request.onsuccess = () => {
        const existing = request.result as unknown;
        if (!existing) {
          eventStore.add(event);
          receipt.inserted += 1;
          if (event.kind === "StrongCheckVerified") {
            receipt.accepted.push({ checkId: event.checkId, lessonRef: event.lessonRef });
          }
          return;
        }
        if (sameEvidencePayload(existing, event)) {
          receipt.skipped += 1;
          if (event.kind === "StrongCheckVerified") {
            receipt.accepted.push({ checkId: event.checkId, lessonRef: event.lessonRef });
          }
          return;
        }
        receipt.conflicted += 1;
        conflictStore.put({
          conflictId: `${event.eventId}:${event.payloadHash}`,
          eventId: event.eventId,
          existingPayloadHash: evidencePayloadHash(existing),
          importedPayloadHash: event.payloadHash,
          kind: "EvidencePayloadConflict",
          occurredAt: new Date().toISOString(),
          schemaVersion: 1,
        });
      };
    }
    transaction.oncomplete = () => resolve(receipt);
    transaction.onerror = () => reject(transaction.error ?? new Error("learning evidence import failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("learning evidence import aborted"));
  });
}

function replaceArchiveEvents(
  database: IDBDatabase,
  events: WebLearningEvidenceEvent[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(EVENT_STORE, "readwrite", { durability: "strict" });
    const eventStore = transaction.objectStore(EVENT_STORE);
    eventStore.clear();
    for (const event of events) eventStore.put(event);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("learning evidence replacement failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("learning evidence replacement aborted"));
  });
}

async function validateWebLearningEvidenceArchive(value: unknown): Promise<WebLearningEvidenceArchive> {
  if (!isRecord(value) || value.kind !== ARCHIVE_KIND || value.schemaVersion !== 1) {
    throw new Error("지원하지 않는 Codaro 학습 증거 archive입니다.");
  }
  if (!Array.isArray(value.events) || value.events.length > MAX_ARCHIVE_EVENTS) {
    throw new Error("학습 증거 event 목록이 유효하지 않습니다.");
  }
  const events = await Promise.all(value.events.map(normalizeStoredEvidenceEvent));
  const eventIds = new Set(events.map((event) => event.eventId));
  if (eventIds.size !== events.length) throw new Error("학습 증거 archive에 중복 eventId가 있습니다.");
  events.sort((left, right) => unicodeCodePointCompare(left.eventId, right.eventId));
  const canonicalEvents = stableJson(events);
  const eventSetHash = await digestText(canonicalEvents);
  const manifest = value.manifest;
  const manifestFiles = isRecord(manifest) && Array.isArray(manifest.files) ? manifest.files : [];
  const file = manifestFiles[0];
  const hashValue = eventSetHash.slice("sha256-".length);
  const expectedArchiveIds = new Set([`learning-evidence:${hashValue}`, `web-evidence:${hashValue}`]);
  const expectedRuntimeTier = archiveRuntimeTier(events);
  if (
    !isRecord(manifest)
    || manifest.schemaVersion !== 1
    || manifest.runtimeTier !== expectedRuntimeTier
    || manifest.eventCount !== events.length
    || manifest.eventSetHash !== eventSetHash
    || typeof manifest.archiveId !== "string"
    || !expectedArchiveIds.has(manifest.archiveId)
    || typeof manifest.createdAt !== "string"
    || !isRecord(file)
    || manifestFiles.length !== 1
    || file.path !== ARCHIVE_EVENT_PATH
    || file.mediaType !== "application/json"
    || file.contentHash !== eventSetHash
    || file.byteLength !== new TextEncoder().encode(canonicalEvents).byteLength
  ) {
    throw new Error("학습 증거 archive manifest 해시가 일치하지 않습니다.");
  }
  return { ...(value as unknown as WebLearningEvidenceArchive), events };
}

export async function migrateWebEvidenceEventLessonRef(
  event: WebLearningEvidenceEvent,
): Promise<WebLearningEvidenceEvent> {
  if (event.kind !== "StrongCheckVerified") return event;
  const separator = event.lessonRef.indexOf("/");
  if (separator < 1 || separator !== event.lessonRef.lastIndexOf("/")) {
    throw new Error(`학습 증거 lessonRef가 유효하지 않습니다: ${event.lessonRef}`);
  }
  const category = event.lessonRef.slice(0, separator);
  const contentId = event.lessonRef.slice(separator + 1);
  const canonicalContentId = await resolveRegistryContentId(category, contentId);
  const lessonRef = `${category}/${canonicalContentId ?? contentId}`;
  if (lessonRef === event.lessonRef) return event;
  const includeAttemptMetadata = event.attemptFingerprint === await strongEvidenceAttemptFingerprint(event, true);
  const { payloadHash: _payloadHash, canonicalEvents, ...eventWithoutSeal } = event;
  let core: StrongEvidenceCore = {
    ...eventWithoutSeal,
    lessonRef,
  };
  const attemptFingerprint = await strongEvidenceAttemptFingerprint(core, includeAttemptMetadata);
  core = {
    ...core,
    attemptFingerprint,
    eventId: `${event.runtimeTier}-strong:${attemptFingerprint}`,
  };
  if (canonicalEvents?.length) {
    core = { ...core, canonicalEvents: await migrateCanonicalEventsLessonRef(canonicalEvents, core) };
  }
  return {
    ...core,
    payloadHash: await digestText(stableJson(core)),
  };
}

async function normalizeStoredEvidenceEvent(value: unknown): Promise<WebLearningEvidenceEvent> {
  if (!isRecord(value)) throw new Error("학습 증거 event 형식이 유효하지 않습니다.");
  let core = evidenceEventCore(value);
  if (core.kind === "StrongCheckVerified" && "canonicalEvents" in core) {
    core = { ...core, canonicalEvents: await normalizeCanonicalEvents(core.canonicalEvents, core) };
  }
  if (core.kind === "MigrationImported") {
    const sourceRecordHash = await digestText(stableJson(core.legacyState));
    if (sourceRecordHash !== core.sourceRecordHash) {
      throw new Error("기존 학습 진도 이관 source hash가 일치하지 않습니다.");
    }
  }
  const payloadHash = await digestText(stableJson(core));
  if (typeof value.payloadHash === "string" && value.payloadHash !== payloadHash) {
    throw new Error(`학습 증거 payload hash가 일치하지 않습니다: ${core.eventId}`);
  }
  return { ...core, payloadHash };
}

function evidenceEventCore(value: Record<string, unknown>): EvidenceEventCore {
  if (value.kind === "MigrationImported") return migrationImportedEventCore(value);
  const stringFields = [
    "attemptFingerprint",
    "blockId",
    "checkId",
    "eventId",
    "expectedHash",
    "fixtureHash",
    "lessonRef",
    "occurredAt",
    "resultHash",
    "sourceHash",
  ] as const;
  for (const field of stringFields) {
    if (typeof value[field] !== "string" || !value[field]) {
      throw new Error(`학습 증거 event의 ${field} 값이 유효하지 않습니다.`);
    }
  }
  if (
    value.kind !== "StrongCheckVerified"
    || !new Set(["local", "web"]).has(String(value.runtimeTier))
    || value.schemaVersion !== 1
    || value.strength !== "strong"
    || !Number.isSafeInteger(value.executionCount)
    || Number(value.executionCount) < 0
  ) {
    throw new Error("학습 증거 event 계약이 유효하지 않습니다.");
  }
  for (const field of ["attemptFingerprint", "expectedHash", "fixtureHash", "resultHash", "sourceHash"] as const) {
    if (!SHA256_PATTERN.test(String(value[field]))) {
      throw new Error(`학습 증거 event의 ${field} 해시가 유효하지 않습니다.`);
    }
  }
  if (value.eventId !== `${value.runtimeTier}-strong:${value.attemptFingerprint}` || !String(value.lessonRef).includes("/")) {
    throw new Error("학습 증거 event identity가 유효하지 않습니다.");
  }
  return {
    attemptFingerprint: String(value.attemptFingerprint),
    ...("artifacts" in value ? { artifacts: normalizeEvidenceArtifacts(value.artifacts) } : {}),
    blockId: String(value.blockId),
    ...("canonicalEvents" in value ? { canonicalEvents: value.canonicalEvents as LearningEvent[] } : {}),
    checkId: String(value.checkId),
    eventId: String(value.eventId),
    executionCount: Number(value.executionCount),
    expectedHash: String(value.expectedHash),
    fixtureHash: String(value.fixtureHash),
    kind: "StrongCheckVerified",
    lessonRef: String(value.lessonRef),
    occurredAt: String(value.occurredAt),
    ...("packages" in value ? { packages: normalizeEvidencePackages(value.packages) } : {}),
    resultHash: String(value.resultHash),
    runtimeTier: value.runtimeTier as "local" | "web",
    schemaVersion: 1,
    sourceHash: String(value.sourceHash),
    strength: "strong",
  };
}

async function migrateCanonicalEventsLessonRef(
  events: LearningEvent[],
  outerEvent: StrongEvidenceCore,
): Promise<LearningEvent[]> {
  const eventIds = {
    RunObserved: `${outerEvent.eventId}:run`,
    CheckEvaluated: `${outerEvent.eventId}:check`,
    SupportProvided: `${outerEvent.eventId}:support`,
    CreditGranted: `${outerEvent.eventId}:credit`,
  } as const;
  const supportIds = events.some((event) => event.kind === "SupportProvided")
    ? [eventIds.SupportProvided]
    : [];
  const migrated: LearningEvent[] = [];
  for (const event of events) {
    const { payloadHash: _payloadHash, ...eventCore } = event;
    const kind = event.kind as keyof typeof eventIds;
    const epochRefByScope = {
      ...(event.epochRefByScope as Record<string, string>),
      lesson: `${event.learningEpoch}:${outerEvent.lessonRef}`,
    };
    let core: Record<string, unknown> = { ...eventCore, epochRefByScope, eventId: eventIds[kind] };
    if (event.kind === "RunObserved") {
      const context = { ...(event.runContext as Record<string, unknown>) };
      context.attemptId = outerEvent.eventId;
      context.fixtureHash = outerEvent.fixtureHash;
      context.lessonRef = outerEvent.lessonRef;
      context.runId = outerEvent.eventId;
      context.sourceCodeHash = outerEvent.sourceHash;
      context.taskVariantId = `${outerEvent.lessonRef}#${String(context.sectionId)}`;
      context.lessonContentHash = await learningEventDigest({
        checkId: outerEvent.checkId,
        lessonRef: outerEvent.lessonRef,
        outcomeIds: context.outcomeIds,
        sectionId: context.sectionId,
      });
      core = { ...core, runContext: context };
    } else if (event.kind === "CheckEvaluated") {
      core = { ...core, checkId: outerEvent.checkId, runEventId: eventIds.RunObserved };
    } else if (event.kind === "SupportProvided") {
      core = { ...core, runEventId: eventIds.RunObserved };
    } else if (event.kind === "CreditGranted") {
      core = {
        ...core,
        attemptFingerprint: outerEvent.attemptFingerprint,
        checkEventIds: [eventIds.CheckEvaluated],
        runEventId: eventIds.RunObserved,
        supportEventIds: supportIds,
      };
    }
    migrated.push(await sealLearningEvent(core));
  }
  return normalizeCanonicalEvents(migrated, outerEvent);
}

async function normalizeCanonicalEvents(
  value: unknown,
  outerEvent?: StrongEvidenceCore,
): Promise<LearningEvent[]> {
  if (!Array.isArray(value) || value.length < 2 || value.length > MAX_CANONICAL_EVENTS) {
    throw new Error("학습 증거 canonical event chain 길이가 유효하지 않습니다.");
  }
  const events = await Promise.all(value.map(validateLearningEvent));
  const kinds = events.map((event) => event.kind);
  if (kinds[0] !== "RunObserved" || kinds[1] !== "CheckEvaluated") {
    throw new Error("학습 증거 canonical event chain 순서가 유효하지 않습니다.");
  }
  const suffix = kinds.slice(2).join(",");
  if (!new Set(["", "SupportProvided", "CreditGranted", "SupportProvided,CreditGranted"]).has(suffix)) {
    throw new Error("학습 증거 canonical event chain 순서가 유효하지 않습니다.");
  }
  const eventIds = events.map((event) => event.eventId);
  if (new Set(eventIds).size !== eventIds.length) throw new Error("학습 증거 canonical eventId가 중복되었습니다.");
  const runEventId = events[0].eventId;
  const check = events[1];
  if (check.runEventId !== runEventId) throw new Error("학습 증거 canonical check가 run과 연결되지 않았습니다.");
  const supports = events.filter((event) => event.kind === "SupportProvided");
  if (supports.some((event) => event.runEventId !== runEventId)) {
    throw new Error("학습 증거 canonical support가 run과 연결되지 않았습니다.");
  }
  const credit = events.find((event) => event.kind === "CreditGranted");
  if (credit && (
    credit.runEventId !== runEventId
    || stableJson(credit.checkEventIds) !== stableJson([check.eventId])
    || stableJson(credit.supportEventIds) !== stableJson(supports.map((event) => event.eventId))
  )) {
    throw new Error("학습 증거 canonical credit 연결이 유효하지 않습니다.");
  }
  if (outerEvent) await validateCanonicalEventBinding(events, outerEvent);
  return events;
}

async function validateCanonicalEventBinding(
  events: LearningEvent[],
  outerEvent: StrongEvidenceCore,
): Promise<void> {
  const byKind = new Map(events.map((event) => [event.kind, event]));
  const run = byKind.get("RunObserved");
  const check = byKind.get("CheckEvaluated");
  const support = byKind.get("SupportProvided");
  const credit = byKind.get("CreditGranted");
  if (!run || !check) throw new Error("학습 증거 canonical chain의 필수 event가 없습니다.");
  const expectedIds = {
    RunObserved: `${outerEvent.eventId}:run`,
    CheckEvaluated: `${outerEvent.eventId}:check`,
    SupportProvided: `${outerEvent.eventId}:support`,
    CreditGranted: `${outerEvent.eventId}:credit`,
  } as const;
  if (events.some((event) => event.eventId !== expectedIds[event.kind as keyof typeof expectedIds])) {
    throw new Error("학습 증거 canonical event identity가 outer evidence와 일치하지 않습니다.");
  }
  const expectedDeviceId = `codaro-${outerEvent.runtimeTier}-learning-evidence`;
  if (events.some((event) => (
    event.occurredAt !== outerEvent.occurredAt
    || event.deviceId !== expectedDeviceId
    || (event.epochRefByScope as Record<string, unknown>).lesson !== `${event.learningEpoch}:${outerEvent.lessonRef}`
  ))) {
    throw new Error("학습 증거 canonical envelope가 outer evidence와 일치하지 않습니다.");
  }
  const context = run.runContext as Record<string, unknown>;
  const runtimeBinding = outerEvent.runtimeTier === "web"
    ? { checkEngineVersion: "browser-worker-v1", runtimeId: "pyproc", tierUsed: "browser" }
    : { checkEngineVersion: "local-sandbox-v1", runtimeId: "codaro-local", tierUsed: "local" };
  const lessonContentHash = await learningEventDigest({
    checkId: outerEvent.checkId,
    lessonRef: outerEvent.lessonRef,
    outcomeIds: context.outcomeIds,
    sectionId: context.sectionId,
  });
  const packageSetHash = await learningEventDigest(outerEvent.packages ?? []);
  if (
    context.attemptId !== outerEvent.eventId
    || context.runId !== outerEvent.eventId
    || context.lessonRef !== outerEvent.lessonRef
    || context.checkSpecId !== outerEvent.checkId
    || context.fixtureHash !== outerEvent.fixtureHash
    || context.sourceCodeHash !== outerEvent.sourceHash
    || context.taskVariantId !== `${outerEvent.lessonRef}#${String(context.sectionId)}`
    || context.lessonContentHash !== lessonContentHash
    || context.packageSetHash !== packageSetHash
    || context.tierUsed !== runtimeBinding.tierUsed
    || context.runtimeId !== runtimeBinding.runtimeId
    || context.checkEngineVersion !== runtimeBinding.checkEngineVersion
    || context.runtimeVersion !== "1"
    || run.startedAt !== outerEvent.occurredAt
    || run.completedAt !== outerEvent.occurredAt
    || run.runStatus !== "success"
  ) {
    throw new Error("학습 증거 canonical run이 outer evidence와 일치하지 않습니다.");
  }
  if (check.checkId !== outerEvent.checkId || check.strength !== "strong" || check.passed !== true) {
    throw new Error("학습 증거 canonical check가 outer evidence와 일치하지 않습니다.");
  }
  if (support && support.runEventId !== run.eventId) {
    throw new Error("학습 증거 canonical support가 outer evidence와 일치하지 않습니다.");
  }
  if (credit && (
    credit.attemptFingerprint !== outerEvent.attemptFingerprint
    || credit.evidenceTime !== outerEvent.occurredAt
    || credit.appendReceiptAt !== outerEvent.occurredAt
  )) {
    throw new Error("학습 증거 canonical credit가 outer evidence와 일치하지 않습니다.");
  }
}

function migrationImportedEventCore(value: Record<string, unknown>): Omit<WebMigrationImportedEvent, "payloadHash"> {
  if (
    value.schemaVersion !== 1
    || value.creditEligibility !== "none"
    || !new Set(["local", "web"]).has(String(value.runtimeTier))
    || !new Set(["learner-state-sqlite-v1", "progress-json-v1", "web-progress-v1"]).has(String(value.sourceKind))
    || typeof value.eventId !== "string"
    || typeof value.occurredAt !== "string"
    || !value.occurredAt
    || typeof value.sourceRecordHash !== "string"
    || !SHA256_PATTERN.test(value.sourceRecordHash)
    || !isRecord(value.legacyState)
    || !isRecord(value.lessonRefMap)
    || !Number.isSafeInteger(value.recordCount)
    || Number(value.recordCount) < 0
  ) {
    throw new Error("기존 학습 진도 이관 event 계약이 유효하지 않습니다.");
  }
  const runtimeTier = value.runtimeTier as "local" | "web";
  const sourceRecordHash = value.sourceRecordHash;
  if (value.eventId !== `${runtimeTier}-migration:${sourceRecordHash.slice("sha256-".length)}`) {
    throw new Error("기존 학습 진도 이관 event identity가 유효하지 않습니다.");
  }
  const lessonRefMap = Object.fromEntries(
    Object.entries(value.lessonRefMap)
      .map(([key, item]) => {
        if (typeof item !== "string") {
          throw new Error("기존 학습 진도 이관 lessonRef map이 유효하지 않습니다.");
        }
        return [key, item];
      })
      .sort(([left], [right]) => left.localeCompare(right)),
  );
  return {
    creditEligibility: "none",
    eventId: value.eventId,
    kind: "MigrationImported",
    legacyState: value.legacyState,
    lessonRefMap,
    occurredAt: value.occurredAt,
    recordCount: Number(value.recordCount),
    runtimeTier,
    schemaVersion: 1,
    sourceKind: value.sourceKind as WebMigrationImportedEvent["sourceKind"],
    sourceRecordHash,
  };
}

function normalizeEvidencePackages(value: unknown): LearningEvidencePackageAsset[] {
  if (!Array.isArray(value) || value.length > MAX_EVENT_PACKAGES) {
    throw new Error("학습 증거 package descriptor 목록이 유효하지 않습니다.");
  }
  const seen = new Set<string>();
  const packages = value.map((item) => {
    if (!isRecord(item)) throw new Error("학습 증거 package descriptor 형식이 유효하지 않습니다.");
    const integrity = String(item.integrity ?? "");
    const name = String(item.name ?? "");
    const url = String(item.url ?? "");
    const version = String(item.version ?? "");
    if (
      item.schemaVersion !== 1
      || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)
      || !/^\d+(?:\.\d+){1,3}(?:[-+][A-Za-z0-9.-]+)?$/.test(version)
      || !url.startsWith("check-packages/")
      || !url.endsWith(".whl")
      || unsafeEvidencePath(url)
      || !SHA256_PATTERN.test(integrity)
    ) {
      throw new Error("학습 증거 package descriptor가 유효하지 않습니다.");
    }
    const key = `${name}:${version}:${url}`;
    if (seen.has(key)) throw new Error("학습 증거 package descriptor가 중복되었습니다.");
    seen.add(key);
    return {
      integrity,
      name,
      schemaVersion: 1 as const,
      url,
      version,
    };
  });
  return packages.sort((left, right) => (
    `${left.name}:${left.version}:${left.url}`.localeCompare(`${right.name}:${right.version}:${right.url}`)
  ));
}

function normalizeEvidenceArtifacts(value: unknown): LearningEvidenceArtifact[] {
  if (!Array.isArray(value) || value.length > MAX_EVENT_ARTIFACTS) {
    throw new Error("학습 증거 산출물 목록이 유효하지 않습니다.");
  }
  const seen = new Set<string>();
  const artifacts = value.map((item): LearningEvidenceArtifact => {
    if (!isRecord(item)) throw new Error("학습 증거 산출물 형식이 유효하지 않습니다.");
    const byteLength = Number(item.byteLength);
    const kind = item.kind;
    const origin = item.origin;
    const path = String(item.path ?? "");
    const contentHash = String(item.contentHash ?? "");
    if (
      item.schemaVersion !== 1
      || !new Set(["directory", "file", "table", "image"]).has(String(kind))
      || !new Set(["created", "fixture"]).has(String(origin))
      || !path
      || unsafeEvidencePath(path)
      || !SHA256_PATTERN.test(contentHash)
      || !Number.isSafeInteger(byteLength)
      || byteLength < 0
    ) {
      throw new Error("학습 증거 산출물 descriptor가 유효하지 않습니다.");
    }
    const key = `${origin}:${path}:${kind}`;
    if (seen.has(key)) throw new Error("학습 증거 산출물 descriptor가 중복되었습니다.");
    seen.add(key);
    const base = {
      byteLength,
      contentHash,
      origin: origin as "created" | "fixture",
      path,
      schemaVersion: 1 as const,
    };
    if (kind === "directory" || kind === "file") {
      const fileCount = Number(item.fileCount);
      if (!Number.isSafeInteger(fileCount) || fileCount < 0) {
        throw new Error("학습 증거 파일 산출물 descriptor가 유효하지 않습니다.");
      }
      return { ...base, fileCount, kind };
    }
    if (kind === "table") {
      const rowCount = Number(item.rowCount);
      const columnCount = Number(item.columnCount);
      const columns = item.columns;
      const format = item.format;
      if (
        (format !== "csv" && format !== "json")
        || !Number.isSafeInteger(rowCount)
        || rowCount < 0
        || !Number.isSafeInteger(columnCount)
        || columnCount < 1
        || !Array.isArray(columns)
        || !columns.every((column) => typeof column === "string" && Boolean(column))
        || new Set(columns).size !== columns.length
        || columns.length !== columnCount
      ) {
        throw new Error("학습 증거 표 산출물 descriptor가 유효하지 않습니다.");
      }
      return { ...base, columnCount, columns, format, kind, rowCount };
    }
    const width = Number(item.width);
    const height = Number(item.height);
    const mediaType = item.mediaType;
    if (
      !new Set(["image/png", "image/jpeg", "image/gif"]).has(String(mediaType))
      || !Number.isSafeInteger(width)
      || width < 1
      || !Number.isSafeInteger(height)
      || height < 1
    ) {
      throw new Error("학습 증거 이미지 산출물 descriptor가 유효하지 않습니다.");
    }
    return {
      ...base,
      height,
      kind: "image",
      mediaType: mediaType as "image/gif" | "image/jpeg" | "image/png",
      width,
    };
  });
  return artifacts.sort((left, right) => (
    `${left.origin}:${left.path}:${left.kind}`.localeCompare(`${right.origin}:${right.path}:${right.kind}`)
  ));
}

function unsafeEvidencePath(value: string): boolean {
  const normalized = value.replace(/\\/g, "/");
  return normalized.startsWith("/") || normalized.split("/").includes("..") || normalized.includes(":");
}

function archiveRuntimeTier(events: WebLearningEvidenceEvent[]): "local" | "mixed" | "web" {
  const tiers = new Set(events.map((event) => event.runtimeTier));
  if (tiers.size === 1) return events[0].runtimeTier;
  return tiers.size === 0 ? "web" : "mixed";
}

function parseArchiveJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error("학습 증거 archive JSON을 읽을 수 없습니다.");
  }
}

function sameEvidencePayload(left: unknown, right: WebLearningEvidenceEvent): boolean {
  if (!isRecord(left)) return false;
  const { payloadHash: _leftPayloadHash, ...leftPayload } = left;
  const { payloadHash: _rightPayloadHash, ...rightPayload } = right;
  return stableJson(leftPayload) === stableJson(rightPayload);
}

function evidencePayloadHash(value: unknown): string {
  return isRecord(value) && typeof value.payloadHash === "string" ? value.payloadHash : "legacy-unhashed";
}

async function digestText(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return `sha256-${bytesToBase64Url(new Uint8Array(digest))}`;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function unicodeCodePointCompare(left: string, right: string): number {
  const leftPoints = Array.from(left, (value) => value.codePointAt(0)!);
  const rightPoints = Array.from(right, (value) => value.codePointAt(0)!);
  const length = Math.min(leftPoints.length, rightPoints.length);
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index];
  }
  return leftPoints.length - rightPoints.length;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function isConstraintError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "ConstraintError";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
