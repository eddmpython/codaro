import type { CodaroDocument } from "@/types";

export const LEARNING_ARCHIVE_KIND = "codaro.learning-archive" as const;
export const LEARNING_ARCHIVE_SCHEMA_VERSION = 2 as const;

const IMPORT_MODE = "atomic-head-swap" as const;
const DOCUMENT_MEDIA_TYPE = "application/vnd.codaro.document+json" as const;
const DRAFT_MEDIA_TYPE = "text/plain; charset=utf-8" as const;
const EVIDENCE_MEDIA_TYPE = "application/vnd.codaro.learning-evidence+json" as const;
const BLOB_MEDIA_TYPE = "application/octet-stream" as const;
const MAX_BLOB_BYTES = 128 * 1024 * 1024;
const MAX_TOTAL_BYTES = 512 * 1024 * 1024;
const MAX_DRAFTS = 10_000;
const MAX_VFS_ENTRIES = 10_000;
const MAX_PACKAGES = 256;
const MAX_AUTOMATION_DRAFTS = 256;
const HASH_PATTERN = /^sha256-[A-Za-z0-9_-]{43}$/;
const AUTOMATION_DRAFT_ID_PATTERN = /^automation-draft:[A-Za-z0-9_-]{43}$/;
const PACKAGE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const PACKAGE_VERSION_PATTERN = /^\d+(?:\.\d+){1,3}(?:[-+][A-Za-z0-9.-]+)?$/;
const DOCUMENT_BLOCK_TYPES = new Set(["automation", "code", "markdown"]);
const WINDOWS_RESERVED_NAMES = new Set([
  "CON", "PRN", "AUX", "NUL",
  ...Array.from({ length: 9 }, (_, index) => `COM${index + 1}`),
  ...Array.from({ length: 9 }, (_, index) => `LPT${index + 1}`),
]);

export type LearningArchiveBlob = {
  byteLength: number;
  encoding: "base64url";
  mediaType: "application/octet-stream";
  payload: string;
};

export type LearningArchiveDocumentRef = {
  blobHash: string;
  documentId: string;
  mediaType: typeof DOCUMENT_MEDIA_TYPE;
  path: "document/document.json";
};

export type LearningArchiveDraftRef = {
  blobHash: string;
  blockId: string;
  mediaType: typeof DRAFT_MEDIA_TYPE;
};

export type LearningArchiveVirtualFsEntry =
  | { kind: "directory"; path: string }
  | { blobHash: string; executable: boolean; kind: "file"; mediaType: string; path: string };

export type LearningArchivePackageRef = {
  blobHash: string;
  integrity: string;
  mediaType: "application/zip";
  name: string;
  path: string;
  version: string;
};

export type LearningArchiveEvidenceRef = {
  blobHash: string;
  eventCount: number;
  eventIds: string[];
  eventSetHash: string;
  mediaType: typeof EVIDENCE_MEDIA_TYPE;
  path: "evidence/archive.json";
};

export type LearningArchiveAutomationDraft = {
  confirmation: "required";
  description: string;
  draftId: string;
  lineageId: string;
  name: string;
  recipeBlobHash: string;
  sideEffectPolicy: "blocked-until-explicit-confirmation";
  sourceBlockIds: string[];
  state: "draft";
  taskDefaults: { enabled: false; schedule: null };
};

export type LearningArchiveLineage = {
  automationDraftIds: string[];
  documentBlobHash: string;
  evidenceEventIds: string[];
  lessonRef: string;
  lineageId: string;
};

export type LearningArchive = {
  automationDrafts: LearningArchiveAutomationDraft[];
  blobs: Record<string, LearningArchiveBlob>;
  document: LearningArchiveDocumentRef;
  drafts: LearningArchiveDraftRef[];
  evidence: LearningArchiveEvidenceRef;
  kind: typeof LEARNING_ARCHIVE_KIND;
  lineage: LearningArchiveLineage[];
  manifest: {
    archiveId: string;
    automationDraftCount: number;
    blobCount: number;
    createdAt: string;
    draftCount: number;
    evidenceEventCount: number;
    importMode: typeof IMPORT_MODE;
    packageCount: number;
    rootHash: string;
    runtimeTier: "local" | "mixed" | "web";
    totalByteLength: number;
    virtualFsEntryCount: number;
  };
  packages: LearningArchivePackageRef[];
  schemaVersion: typeof LEARNING_ARCHIVE_SCHEMA_VERSION;
  virtualFs: LearningArchiveVirtualFsEntry[];
};

export type LearningArchiveVirtualFileInput = {
  executable?: boolean;
  mediaType?: string;
  path: string;
  payload: string | Uint8Array;
};

export type LearningArchivePackageInput = {
  name: string;
  path: string;
  payload: Uint8Array;
  version: string;
};

export type LearningArchiveAutomationDraftInput = {
  description?: string;
  name: string;
  recipe: string | Uint8Array;
  sourceBlockIds: string[];
};

export type LearningArchiveBuildInput = {
  automationDrafts?: LearningArchiveAutomationDraftInput[];
  createdAt?: string;
  document: CodaroDocument;
  drafts: Record<string, string | Uint8Array>;
  evidenceArchive: unknown;
  lessonRef: string;
  packages?: LearningArchivePackageInput[];
  virtualDirectories?: string[];
  virtualFiles?: LearningArchiveVirtualFileInput[];
};

export type LearningArchiveImportPlan = {
  archiveId: string;
  blobs: ReadonlyMap<string, Uint8Array>;
  canonicalArchiveBytes: Uint8Array;
  rootHash: string;
};

export type LearningArchiveMaterialization = {
  archive: LearningArchive;
  automationDrafts: Array<LearningArchiveAutomationDraft & { recipe: Uint8Array }>;
  document: CodaroDocument;
  drafts: Record<string, string>;
  evidenceArchive: EvidenceArchive;
  packages: Array<LearningArchivePackageRef & { payload: Uint8Array }>;
  virtualDirectories: string[];
  virtualFiles: Array<Extract<LearningArchiveVirtualFsEntry, { kind: "file" }> & { payload: Uint8Array }>;
};

export type ConfirmedAutomationTaskRegistration = {
  confirmationId: string;
  confirmedAt: string;
  description: string;
  enabled: false;
  kind: "codaro.automation-task-registration";
  lineageId: string;
  name: string;
  recipeBlobHash: string;
  schedule: null;
  schemaVersion: 1;
  sourceDraftId: string;
};

type EvidenceArchive = {
  events: Array<Record<string, unknown>>;
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

export async function buildLearningArchive(input: LearningArchiveBuildInput): Promise<LearningArchive> {
  const documentPayload = jsonRecord(input.document, "document");
  if (typeof documentPayload.id !== "string" || !documentPayload.id) {
    throw new Error("학습 archive documentId가 유효하지 않습니다.");
  }
  const lessonRef = normalizeLessonRef(input.lessonRef);
  const blobs = new Map<string, LearningArchiveBlob>();
  const documentBytes = encodeText(stableJson(documentPayload));
  const documentBlobHash = await addBlob(blobs, documentBytes);
  const document: LearningArchiveDocumentRef = {
    blobHash: documentBlobHash,
    documentId: documentPayload.id,
    mediaType: DOCUMENT_MEDIA_TYPE,
    path: "document/document.json",
  };

  const draftEntries = Object.entries(input.drafts);
  if (!draftEntries.length || draftEntries.length > MAX_DRAFTS) {
    throw new Error("학습 archive draft 목록이 유효하지 않습니다.");
  }
  const draftBlockIds = new Set<string>();
  const drafts: LearningArchiveDraftRef[] = [];
  for (const [rawBlockId, rawDraft] of draftEntries) {
    const blockId = boundedString(rawBlockId, "draft blockId", 255);
    if (draftBlockIds.has(blockId)) throw new Error("학습 archive draft blockId가 중복되었습니다.");
    draftBlockIds.add(blockId);
    const payload = textOrBytes(rawDraft, "draft");
    drafts.push({ blobHash: await addBlob(blobs, payload), blockId, mediaType: DRAFT_MEDIA_TYPE });
  }
  drafts.sort((left, right) => unicodeCodePointCompare(left.blockId, right.blockId));

  const directories = normalizeStringSet(
    (input.virtualDirectories ?? []).map(normalizeSafePath),
    "virtual directories",
    MAX_VFS_ENTRIES,
    1024,
  );
  const directorySet = new Set(directories);
  directories.forEach((path) => requireParentDirectories(path, directorySet));
  const virtualPaths = new Set(directories);
  const virtualFs: LearningArchiveVirtualFsEntry[] = directories.map((path) => ({ kind: "directory", path }));
  for (const rawFile of input.virtualFiles ?? []) {
    const path = normalizeSafePath(rawFile.path);
    if (virtualPaths.has(path)) throw new Error(`학습 archive virtual FS 경로가 중복되었습니다: ${path}`);
    requireParentDirectories(path, directorySet);
    virtualPaths.add(path);
    virtualFs.push({
      blobHash: await addBlob(blobs, textOrBytes(rawFile.payload, "virtual file")),
      executable: rawFile.executable ?? false,
      kind: "file",
      mediaType: boundedString(rawFile.mediaType ?? BLOB_MEDIA_TYPE, "virtual file mediaType", 255),
      path,
    });
  }
  if (virtualFs.length > MAX_VFS_ENTRIES) throw new Error("학습 archive virtual FS 항목 수가 한도를 초과했습니다.");
  virtualFs.sort(comparePathAndKind);

  const packageInputs = input.packages ?? [];
  if (packageInputs.length > MAX_PACKAGES) throw new Error("학습 archive package 수가 한도를 초과했습니다.");
  const packageKeys = new Set<string>();
  const packages: LearningArchivePackageRef[] = [];
  for (const rawPackage of packageInputs) {
    const name = packageName(rawPackage.name);
    const version = packageVersion(rawPackage.version);
    const path = normalizeSafePath(rawPackage.path);
    if (!path.toLowerCase().endsWith(".whl") || !(rawPackage.payload instanceof Uint8Array)
        || !hasWheelZipHeader(rawPackage.payload)) {
      throw new Error("학습 archive package path 또는 bytes가 유효하지 않습니다.");
    }
    const key = `${name}\u0000${version}\u0000${path}`;
    if (packageKeys.has(key)) throw new Error("학습 archive package가 중복되었습니다.");
    packageKeys.add(key);
    const blobHash = await addBlob(blobs, rawPackage.payload);
    packages.push({ blobHash, integrity: blobHash, mediaType: "application/zip", name, path, version });
  }
  packages.sort((left, right) => unicodeCodePointCompare(
    `${left.name}\u0000${left.version}\u0000${left.path}`,
    `${right.name}\u0000${right.version}\u0000${right.path}`,
  ));

  const evidenceArchive = await normalizeEvidenceArchive(input.evidenceArchive);
  const evidenceBytes = encodeText(stableJson(evidenceArchive));
  const evidenceEventIds = evidenceArchive.events.map((event) => String(event.eventId)).sort(unicodeCodePointCompare);
  const evidence: LearningArchiveEvidenceRef = {
    blobHash: await addBlob(blobs, evidenceBytes),
    eventCount: evidenceArchive.events.length,
    eventIds: evidenceEventIds,
    eventSetHash: evidenceArchive.manifest.eventSetHash,
    mediaType: EVIDENCE_MEDIA_TYPE,
    path: "evidence/archive.json",
  };

  const automationInputs = input.automationDrafts ?? [];
  if (automationInputs.length > MAX_AUTOMATION_DRAFTS) {
    throw new Error("학습 archive automation draft 수가 한도를 초과했습니다.");
  }
  const draftParts: Array<Omit<LearningArchiveAutomationDraft, "confirmation" | "lineageId" | "sideEffectPolicy" | "state" | "taskDefaults">> = [];
  const automationIds = new Set<string>();
  for (const rawDraft of automationInputs) {
    const name = boundedString(rawDraft.name.trim(), "automation draft name", 255);
    const description = boundedString(rawDraft.description ?? "", "automation draft description", 4096, true);
    const recipeBytes = textOrBytes(rawDraft.recipe, "automation recipe");
    if (!recipeBytes.byteLength) throw new Error("학습 archive automation recipe가 비어 있습니다.");
    const sourceBlockIds = normalizeStringSet(rawDraft.sourceBlockIds, "automation sourceBlockIds", MAX_DRAFTS, 255);
    if (!sourceBlockIds.length || sourceBlockIds.some((blockId) => !draftBlockIds.has(blockId))) {
      throw new Error("automation draft sourceBlockIds가 document draft와 일치하지 않습니다.");
    }
    const recipeBlobHash = await addBlob(blobs, recipeBytes);
    const draftId = await automationDraftId({ documentBlobHash, lessonRef, name, recipeBlobHash, sourceBlockIds });
    if (automationIds.has(draftId)) throw new Error("학습 archive automation draft가 중복되었습니다.");
    automationIds.add(draftId);
    draftParts.push({ description, draftId, name, recipeBlobHash, sourceBlockIds });
  }
  draftParts.sort((left, right) => unicodeCodePointCompare(left.draftId, right.draftId));

  const lineageCore = {
    automationDraftIds: draftParts.map((item) => item.draftId),
    documentBlobHash,
    evidenceEventIds,
    lessonRef,
  };
  const lineageId = await buildLineageId(lineageCore);
  const lineage: LearningArchiveLineage[] = [{ lineageId, ...lineageCore }];
  const automationDrafts = await Promise.all(draftParts.map((item) => buildAutomationDraftFromDocument({
    description: item.description,
    documentBlobHash,
    lessonRef,
    lineageId,
    name: item.name,
    recipeBlobHash: item.recipeBlobHash,
    sourceBlockIds: item.sourceBlockIds,
  })));

  const body = {
    automationDrafts,
    blobs: Object.fromEntries([...blobs.entries()].sort(([left], [right]) => unicodeCodePointCompare(left, right))),
    document,
    drafts,
    evidence,
    lineage,
    packages,
    virtualFs,
  };
  const rootHash = await digestBytes(encodeText(stableJson(body)));
  const archive: LearningArchive = {
    ...body,
    kind: LEARNING_ARCHIVE_KIND,
    manifest: {
      archiveId: `learning-archive:${rootHash.slice("sha256-".length)}`,
      automationDraftCount: automationDrafts.length,
      blobCount: blobs.size,
      createdAt: input.createdAt ?? new Date().toISOString(),
      draftCount: drafts.length,
      evidenceEventCount: evidenceArchive.events.length,
      importMode: IMPORT_MODE,
      packageCount: packages.length,
      rootHash,
      runtimeTier: evidenceArchive.manifest.runtimeTier,
      totalByteLength: [...blobs.values()].reduce((total, blob) => total + blob.byteLength, 0),
      virtualFsEntryCount: virtualFs.length,
    },
    schemaVersion: LEARNING_ARCHIVE_SCHEMA_VERSION,
  };
  return validateLearningArchive(archive);
}

export async function buildAutomationDraftFromDocument(input: {
  description: string;
  documentBlobHash: string;
  lessonRef: string;
  lineageId: string;
  name: string;
  recipeBlobHash: string;
  sourceBlockIds: string[];
}): Promise<LearningArchiveAutomationDraft> {
  const documentBlobHash = requireHash(input.documentBlobHash, "automation documentBlobHash");
  const lessonRef = normalizeLessonRef(input.lessonRef);
  if (!/^lineage:[A-Za-z0-9_-]{43}$/.test(input.lineageId)) throw new Error("automation draft lineageId가 유효하지 않습니다.");
  const name = boundedString(input.name.trim(), "automation draft name", 255);
  const description = boundedString(input.description, "automation draft description", 4096, true);
  const recipeBlobHash = requireHash(input.recipeBlobHash, "automation recipeBlobHash");
  const sourceBlockIds = normalizeStringSet(input.sourceBlockIds, "automation sourceBlockIds", MAX_DRAFTS, 255);
  if (!sourceBlockIds.length) throw new Error("automation draft sourceBlockIds가 비어 있습니다.");
  return {
    confirmation: "required",
    description,
    draftId: await automationDraftId({ documentBlobHash, lessonRef, name, recipeBlobHash, sourceBlockIds }),
    lineageId: input.lineageId,
    name,
    recipeBlobHash,
    sideEffectPolicy: "blocked-until-explicit-confirmation",
    sourceBlockIds,
    state: "draft",
    taskDefaults: { enabled: false, schedule: null },
  };
}

export async function confirmAutomationDraft(
  archiveValue: unknown,
  draftId: string,
  confirmationValue: unknown,
): Promise<ConfirmedAutomationTaskRegistration> {
  const archive = await validateLearningArchive(archiveValue);
  const draft = archive.automationDrafts.find((item) => item.draftId === draftId);
  if (!draft) throw new Error("확인할 automation draft를 찾을 수 없습니다.");
  const confirmation = closedRecord(
    confirmationValue,
    ["confirmationId", "confirmedAt", "draftId", "recipeBlobHash"],
    "automation confirmation",
  );
  const confirmationId = boundedString(confirmation.confirmationId, "confirmationId", 255);
  const confirmedAt = timestamp(confirmation.confirmedAt, "confirmedAt");
  if (confirmation.draftId !== draft.draftId || confirmation.recipeBlobHash !== draft.recipeBlobHash) {
    throw new Error("automation confirmation이 draft identity와 일치하지 않습니다.");
  }
  return {
    confirmationId,
    confirmedAt,
    description: draft.description,
    enabled: false,
    kind: "codaro.automation-task-registration",
    lineageId: draft.lineageId,
    name: draft.name,
    recipeBlobHash: draft.recipeBlobHash,
    schedule: null,
    schemaVersion: 1,
    sourceDraftId: draft.draftId,
  };
}

export async function validateLearningArchive(value: unknown): Promise<LearningArchive> {
  const archive = closedRecord(value, [
    "automationDrafts", "blobs", "document", "drafts", "evidence", "kind", "lineage",
    "manifest", "packages", "schemaVersion", "virtualFs",
  ], "learning archive");
  if (archive.kind !== LEARNING_ARCHIVE_KIND || archive.schemaVersion !== LEARNING_ARCHIVE_SCHEMA_VERSION) {
    throw new Error("지원하지 않는 학습 archive입니다.");
  }
  const { normalized: blobs, decoded: decodedBlobs } = await normalizeBlobs(archive.blobs);
  const document = normalizeDocumentRef(archive.document, decodedBlobs);
  const drafts = normalizeDraftRefs(archive.drafts, decodedBlobs);
  const virtualFs = normalizeVirtualFs(archive.virtualFs, decodedBlobs);
  const packages = normalizePackages(archive.packages, decodedBlobs);
  const { evidence, evidenceArchive } = await normalizeEvidenceRef(archive.evidence, decodedBlobs);
  const lineage = await normalizeLineage(archive.lineage, document, evidence);
  const automationDrafts = await normalizeAutomationDrafts(archive.automationDrafts, decodedBlobs, drafts, lineage);
  validateLineageDraftLinks(lineage, automationDrafts);
  const referencedHashes = new Set([
    document.blobHash,
    evidence.blobHash,
    ...drafts.map((item) => item.blobHash),
    ...virtualFs.filter((item): item is Extract<LearningArchiveVirtualFsEntry, { kind: "file" }> => item.kind === "file").map((item) => item.blobHash),
    ...packages.map((item) => item.blobHash),
    ...automationDrafts.map((item) => item.recipeBlobHash),
  ]);
  const blobHashes = Object.keys(blobs);
  if (referencedHashes.size !== blobHashes.length || blobHashes.some((hash) => !referencedHashes.has(hash))) {
    throw new Error("학습 archive blob 참조가 닫혀 있지 않습니다.");
  }
  const body = { automationDrafts, blobs, document, drafts, evidence, lineage, packages, virtualFs };
  const rootHash = await digestBytes(encodeText(stableJson(body)));
  const manifest = normalizeManifest(archive.manifest, {
    automationDraftCount: automationDrafts.length,
    blobCount: blobHashes.length,
    draftCount: drafts.length,
    evidenceEventCount: evidenceArchive.events.length,
    packageCount: packages.length,
    rootHash,
    runtimeTier: evidenceArchive.manifest.runtimeTier,
    totalByteLength: [...decodedBlobs.values()].reduce((total, payload) => total + payload.byteLength, 0),
    virtualFsEntryCount: virtualFs.length,
  });
  return {
    automationDrafts,
    blobs,
    document,
    drafts,
    evidence,
    kind: LEARNING_ARCHIVE_KIND,
    lineage,
    manifest,
    packages,
    schemaVersion: LEARNING_ARCHIVE_SCHEMA_VERSION,
    virtualFs,
  };
}

export async function serializeLearningArchive(value: unknown, pretty = true): Promise<string> {
  const archive = await validateLearningArchive(value);
  return pretty ? `${JSON.stringify(archive, null, 2)}\n` : stableJson(archive);
}

export async function prepareLearningArchiveImport(value: string | unknown): Promise<LearningArchiveImportPlan> {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch (error) {
      throw new Error("학습 archive JSON을 읽을 수 없습니다.", { cause: error });
    }
  }
  const archive = await validateLearningArchive(parsed);
  const { decoded } = await normalizeBlobs(archive.blobs);
  return {
    archiveId: archive.manifest.archiveId,
    blobs: decoded,
    canonicalArchiveBytes: encodeText(stableJson(archive)),
    rootHash: archive.manifest.rootHash,
  };
}

export async function materializeLearningArchive(value: string | unknown): Promise<LearningArchiveMaterialization> {
  const archive = await validateLearningArchive(typeof value === "string" ? parseArchiveJson(value) : value);
  const { decoded } = await normalizeBlobs(archive.blobs);
  const document = normalizeLearningArchiveDocument(
    parseBlobJson(decoded, archive.document.blobHash, "document"),
    archive.document.documentId,
  );
  const evidenceArchive = await normalizeEvidenceArchive(
    parseBlobJson(decoded, archive.evidence.blobHash, "evidence"),
  );
  const drafts = Object.fromEntries(archive.drafts.map((item) => [
    item.blockId,
    decodeText(knownDecodedBlob(decoded, item.blobHash, "draft"), "draft"),
  ]));
  const documentBlockIds = new Set(document.blocks.map((block) => block.id));
  if (Object.keys(drafts).some((blockId) => !documentBlockIds.has(blockId))) {
    throw new Error("학습 archive draft가 document block과 연결되지 않습니다.");
  }
  return {
    archive,
    automationDrafts: archive.automationDrafts.map((item) => ({
      ...item,
      recipe: knownDecodedBlob(decoded, item.recipeBlobHash, "automation recipe"),
    })),
    document,
    drafts,
    evidenceArchive,
    packages: archive.packages.map((item) => ({
      ...item,
      payload: knownDecodedBlob(decoded, item.blobHash, "package"),
    })),
    virtualDirectories: archive.virtualFs
      .filter((item): item is Extract<LearningArchiveVirtualFsEntry, { kind: "directory" }> => item.kind === "directory")
      .map((item) => item.path),
    virtualFiles: archive.virtualFs
      .filter((item): item is Extract<LearningArchiveVirtualFsEntry, { kind: "file" }> => item.kind === "file")
      .map((item) => ({ ...item, payload: knownDecodedBlob(decoded, item.blobHash, "virtual file") })),
  };
}

function normalizeLearningArchiveDocument(value: unknown, documentId: string): CodaroDocument {
  if (!isRecord(value) || value.id !== documentId || typeof value.title !== "string" || !value.title
      || !Array.isArray(value.blocks) || !value.blocks.length) {
    throw new Error("학습 archive document payload가 유효하지 않습니다.");
  }
  const blockIds = new Set<string>();
  for (const block of value.blocks) {
    if (!isRecord(block) || typeof block.id !== "string" || !block.id || blockIds.has(block.id)
        || typeof block.content !== "string" || typeof block.type !== "string"
        || !DOCUMENT_BLOCK_TYPES.has(block.type)) {
      throw new Error("학습 archive document block이 유효하지 않습니다.");
    }
    blockIds.add(block.id);
  }
  return value as CodaroDocument;
}

function parseArchiveJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error("학습 archive JSON을 읽을 수 없습니다.", { cause: error });
  }
}

function parseBlobJson(decoded: ReadonlyMap<string, Uint8Array>, blobHash: string, label: string): unknown {
  const text = decodeText(knownDecodedBlob(decoded, blobHash, label), label);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`학습 archive ${label} payload가 JSON이 아닙니다.`, { cause: error });
  }
}

function knownDecodedBlob(decoded: ReadonlyMap<string, Uint8Array>, blobHash: string, label: string): Uint8Array {
  const payload = decoded.get(blobHash);
  if (!payload) throw new Error(`학습 archive ${label} blob을 찾을 수 없습니다.`);
  return payload;
}

async function normalizeBlobs(value: unknown): Promise<{
  decoded: Map<string, Uint8Array>;
  normalized: Record<string, LearningArchiveBlob>;
}> {
  if (!isRecord(value) || Object.keys(value).length < 2) throw new Error("학습 archive blob store가 유효하지 않습니다.");
  const decoded = new Map<string, Uint8Array>();
  const normalizedEntries: Array<[string, LearningArchiveBlob]> = [];
  let totalBytes = 0;
  for (const [rawHash, rawBlob] of Object.entries(value)) {
    const blobHash = requireHash(rawHash, "blob hash");
    const blob = closedRecord(rawBlob, ["byteLength", "encoding", "mediaType", "payload"], "blob");
    if (blob.encoding !== "base64url" || blob.mediaType !== BLOB_MEDIA_TYPE) {
      throw new Error("학습 archive blob encoding 또는 mediaType이 유효하지 않습니다.");
    }
    const byteLength = boundedInteger(blob.byteLength, "blob byteLength", 0, MAX_BLOB_BYTES);
    if (typeof blob.payload !== "string" || !/^[A-Za-z0-9_-]*$/.test(blob.payload)) {
      throw new Error("학습 archive blob payload가 base64url이 아닙니다.");
    }
    const payload = decodeBase64Url(blob.payload);
    if (payload.byteLength !== byteLength || await digestBytes(payload) !== blobHash) {
      throw new Error(`학습 archive blob hash 또는 byteLength가 일치하지 않습니다: ${blobHash}`);
    }
    totalBytes += byteLength;
    if (totalBytes > MAX_TOTAL_BYTES) throw new Error("학습 archive 전체 bytes가 한도를 초과했습니다.");
    decoded.set(blobHash, payload);
    normalizedEntries.push([blobHash, { byteLength, encoding: "base64url", mediaType: BLOB_MEDIA_TYPE, payload: blob.payload }]);
  }
  normalizedEntries.sort(([left], [right]) => unicodeCodePointCompare(left, right));
  return { decoded, normalized: Object.fromEntries(normalizedEntries) };
}

function normalizeDocumentRef(value: unknown, blobs: ReadonlyMap<string, Uint8Array>): LearningArchiveDocumentRef {
  const item = closedRecord(value, ["blobHash", "documentId", "mediaType", "path"], "document ref");
  const documentId = boundedString(item.documentId, "documentId", 255);
  const blobHash = knownBlob(item.blobHash, blobs, "document blobHash");
  if (item.path !== "document/document.json" || item.mediaType !== DOCUMENT_MEDIA_TYPE) {
    throw new Error("학습 archive document ref가 유효하지 않습니다.");
  }
  const document = parseCanonicalJson(blobs.get(blobHash)!, "document");
  if (!isRecord(document) || document.id !== documentId) {
    throw new Error("학습 archive document bytes의 id가 descriptor와 일치하지 않습니다.");
  }
  return { blobHash, documentId, mediaType: DOCUMENT_MEDIA_TYPE, path: "document/document.json" };
}

function normalizeDraftRefs(value: unknown, blobs: ReadonlyMap<string, Uint8Array>): LearningArchiveDraftRef[] {
  const items = boundedArray(value, "draft refs", 1, MAX_DRAFTS);
  const blockIds = new Set<string>();
  const result = items.map((raw): LearningArchiveDraftRef => {
    const item = closedRecord(raw, ["blobHash", "blockId", "mediaType"], "draft ref");
    const blockId = boundedString(item.blockId, "draft blockId", 255);
    if (blockIds.has(blockId)) throw new Error("학습 archive draft blockId가 중복되었습니다.");
    blockIds.add(blockId);
    const blobHash = knownBlob(item.blobHash, blobs, "draft blobHash");
    if (item.mediaType !== DRAFT_MEDIA_TYPE) throw new Error("학습 archive draft mediaType이 유효하지 않습니다.");
    decodeText(blobs.get(blobHash)!, "draft");
    return { blobHash, blockId, mediaType: DRAFT_MEDIA_TYPE };
  });
  return result.sort((left, right) => unicodeCodePointCompare(left.blockId, right.blockId));
}

function normalizeVirtualFs(value: unknown, blobs: ReadonlyMap<string, Uint8Array>): LearningArchiveVirtualFsEntry[] {
  const items = boundedArray(value, "virtual FS", 0, MAX_VFS_ENTRIES);
  const paths = new Set<string>();
  const directories = new Set<string>();
  const result = items.map((raw): LearningArchiveVirtualFsEntry => {
    if (!isRecord(raw)) throw new Error("학습 archive virtual FS 항목이 객체가 아닙니다.");
    const path = normalizeSafePath(raw.path);
    if (paths.has(path)) throw new Error(`학습 archive virtual FS 경로가 중복되었습니다: ${path}`);
    paths.add(path);
    if (raw.kind === "directory") {
      closedRecord(raw, ["kind", "path"], "virtual directory");
      directories.add(path);
      return { kind: "directory", path };
    }
    const item = closedRecord(raw, ["blobHash", "executable", "kind", "mediaType", "path"], "virtual file");
    if (item.kind !== "file" || typeof item.executable !== "boolean") {
      throw new Error("학습 archive virtual file 계약이 유효하지 않습니다.");
    }
    return {
      blobHash: knownBlob(item.blobHash, blobs, "virtual file blobHash"),
      executable: item.executable,
      kind: "file",
      mediaType: boundedString(item.mediaType, "virtual file mediaType", 255),
      path,
    };
  });
  result.filter((item) => item.kind === "file").forEach((item) => requireParentDirectories(item.path, directories));
  directories.forEach((path) => requireParentDirectories(path, directories));
  return result.sort(comparePathAndKind);
}

function normalizePackages(value: unknown, blobs: ReadonlyMap<string, Uint8Array>): LearningArchivePackageRef[] {
  const items = boundedArray(value, "packages", 0, MAX_PACKAGES);
  const keys = new Set<string>();
  const result = items.map((raw): LearningArchivePackageRef => {
    const item = closedRecord(raw, ["blobHash", "integrity", "mediaType", "name", "path", "version"], "package ref");
    const name = packageName(item.name);
    const version = packageVersion(item.version);
    const path = normalizeSafePath(item.path);
    const blobHash = knownBlob(item.blobHash, blobs, "package blobHash");
    if (item.integrity !== blobHash || item.mediaType !== "application/zip" || !path.toLowerCase().endsWith(".whl")
        || !hasWheelZipHeader(blobs.get(blobHash)!)) {
      throw new Error("학습 archive package descriptor가 실제 bytes와 일치하지 않습니다.");
    }
    const key = `${name}\u0000${version}\u0000${path}`;
    if (keys.has(key)) throw new Error("학습 archive package가 중복되었습니다.");
    keys.add(key);
    return { blobHash, integrity: blobHash, mediaType: "application/zip", name, path, version };
  });
  return result.sort((left, right) => unicodeCodePointCompare(
    `${left.name}\u0000${left.version}\u0000${left.path}`,
    `${right.name}\u0000${right.version}\u0000${right.path}`,
  ));
}

async function normalizeEvidenceRef(value: unknown, blobs: ReadonlyMap<string, Uint8Array>): Promise<{
  evidence: LearningArchiveEvidenceRef;
  evidenceArchive: EvidenceArchive;
}> {
  const item = closedRecord(value, ["blobHash", "eventCount", "eventIds", "eventSetHash", "mediaType", "path"], "evidence ref");
  if (item.path !== "evidence/archive.json" || item.mediaType !== EVIDENCE_MEDIA_TYPE) {
    throw new Error("학습 archive evidence ref가 유효하지 않습니다.");
  }
  const blobHash = knownBlob(item.blobHash, blobs, "evidence blobHash");
  const eventCount = boundedInteger(item.eventCount, "evidence eventCount", 0, 10_000);
  const eventIds = normalizeStringSet(item.eventIds, "evidence eventIds", 10_000, 1024);
  const eventSetHash = requireHash(item.eventSetHash, "evidence eventSetHash");
  const evidenceValue = parseCanonicalJson(blobs.get(blobHash)!, "evidence");
  const evidenceArchive = await normalizeEvidenceArchive(evidenceValue);
  const actualEventIds = evidenceArchive.events.map((event) => String(event.eventId)).sort(unicodeCodePointCompare);
  if (eventCount !== eventIds.length || stableJson(actualEventIds) !== stableJson(eventIds)
      || eventSetHash !== evidenceArchive.manifest.eventSetHash) {
    throw new Error("학습 archive evidence descriptor가 실제 event bytes와 일치하지 않습니다.");
  }
  return {
    evidence: { blobHash, eventCount, eventIds, eventSetHash, mediaType: EVIDENCE_MEDIA_TYPE, path: "evidence/archive.json" },
    evidenceArchive,
  };
}

async function normalizeLineage(
  value: unknown,
  document: LearningArchiveDocumentRef,
  evidence: LearningArchiveEvidenceRef,
): Promise<LearningArchiveLineage[]> {
  const items = boundedArray(value, "lineage", 1, MAX_AUTOMATION_DRAFTS);
  const ids = new Set<string>();
  const evidenceIds = new Set(evidence.eventIds);
  const result: LearningArchiveLineage[] = [];
  for (const raw of items) {
    const item = closedRecord(raw, ["automationDraftIds", "documentBlobHash", "evidenceEventIds", "lessonRef", "lineageId"], "lineage");
    const documentBlobHash = requireHash(item.documentBlobHash, "lineage documentBlobHash");
    if (documentBlobHash !== document.blobHash) throw new Error("학습 archive lineage document가 일치하지 않습니다.");
    const evidenceEventIds = normalizeStringSet(item.evidenceEventIds, "lineage evidenceEventIds", 10_000, 1024);
    if ((evidenceIds.size > 0 && !evidenceEventIds.length)
        || evidenceEventIds.some((eventId) => !evidenceIds.has(eventId))) {
      throw new Error("학습 archive lineage evidence가 archive evidence에 포함되지 않습니다.");
    }
    const automationDraftIds = normalizeStringSet(item.automationDraftIds, "lineage automationDraftIds", MAX_AUTOMATION_DRAFTS, 80);
    if (automationDraftIds.some((draftId) => !AUTOMATION_DRAFT_ID_PATTERN.test(draftId))) {
      throw new Error("학습 archive lineage automationDraftId가 유효하지 않습니다.");
    }
    const lessonRef = normalizeLessonRef(item.lessonRef);
    const core = { automationDraftIds, documentBlobHash, evidenceEventIds, lessonRef };
    const lineageId = await buildLineageId(core);
    if (item.lineageId !== lineageId || ids.has(lineageId)) throw new Error("학습 archive lineageId가 유효하지 않거나 중복되었습니다.");
    ids.add(lineageId);
    result.push({ lineageId, ...core });
  }
  return result.sort((left, right) => unicodeCodePointCompare(left.lineageId, right.lineageId));
}

async function normalizeAutomationDrafts(
  value: unknown,
  blobs: ReadonlyMap<string, Uint8Array>,
  drafts: LearningArchiveDraftRef[],
  lineage: LearningArchiveLineage[],
): Promise<LearningArchiveAutomationDraft[]> {
  const items = boundedArray(value, "automation drafts", 0, MAX_AUTOMATION_DRAFTS);
  const ids = new Set<string>();
  const blockIds = new Set(drafts.map((item) => item.blockId));
  const lineageById = new Map(lineage.map((item) => [item.lineageId, item]));
  const result: LearningArchiveAutomationDraft[] = [];
  for (const raw of items) {
    const item = closedRecord(raw, [
      "confirmation", "description", "draftId", "lineageId", "name", "recipeBlobHash",
      "sideEffectPolicy", "sourceBlockIds", "state", "taskDefaults",
    ], "automation draft");
    if (item.state !== "draft" || item.confirmation !== "required"
        || item.sideEffectPolicy !== "blocked-until-explicit-confirmation") {
      throw new Error("학습 archive automation draft가 side-effect-free 상태가 아닙니다.");
    }
    const defaults = closedRecord(item.taskDefaults, ["enabled", "schedule"], "automation task defaults");
    if (defaults.enabled !== false || defaults.schedule !== null) {
      throw new Error("학습 archive automation draft는 disabled, unscheduled여야 합니다.");
    }
    const lineageItem = typeof item.lineageId === "string" ? lineageById.get(item.lineageId) : undefined;
    if (!lineageItem) throw new Error("학습 archive automation draft lineageId가 유효하지 않습니다.");
    const name = boundedString(item.name, "automation draft name", 255);
    const description = boundedString(item.description, "automation draft description", 4096, true);
    const recipeBlobHash = knownBlob(item.recipeBlobHash, blobs, "automation recipeBlobHash");
    const sourceBlockIds = normalizeStringSet(item.sourceBlockIds, "automation sourceBlockIds", MAX_DRAFTS, 255);
    if (!sourceBlockIds.length || sourceBlockIds.some((blockId) => !blockIds.has(blockId))) {
      throw new Error("학습 archive automation sourceBlockIds가 draft에 포함되지 않습니다.");
    }
    const draftId = await automationDraftId({
      documentBlobHash: lineageItem.documentBlobHash,
      lessonRef: lineageItem.lessonRef,
      name,
      recipeBlobHash,
      sourceBlockIds,
    });
    if (item.draftId !== draftId || ids.has(draftId)) throw new Error("학습 archive automation draftId가 유효하지 않거나 중복되었습니다.");
    ids.add(draftId);
    result.push({
      confirmation: "required",
      description,
      draftId,
      lineageId: lineageItem.lineageId,
      name,
      recipeBlobHash,
      sideEffectPolicy: "blocked-until-explicit-confirmation",
      sourceBlockIds,
      state: "draft",
      taskDefaults: { enabled: false, schedule: null },
    });
  }
  return result.sort((left, right) => unicodeCodePointCompare(left.draftId, right.draftId));
}

function validateLineageDraftLinks(lineage: LearningArchiveLineage[], drafts: LearningArchiveAutomationDraft[]) {
  for (const item of lineage) {
    const expected = drafts
      .filter((draft) => draft.lineageId === item.lineageId)
      .map((draft) => draft.draftId)
      .sort(unicodeCodePointCompare);
    if (stableJson(expected) !== stableJson(item.automationDraftIds)) {
      throw new Error("학습 archive lineage automationDraftIds가 실제 draft와 일치하지 않습니다.");
    }
  }
}

function normalizeManifest(
  value: unknown,
  expected: Omit<LearningArchive["manifest"], "archiveId" | "createdAt" | "importMode">,
): LearningArchive["manifest"] {
  const item = closedRecord(value, [
    "archiveId", "automationDraftCount", "blobCount", "createdAt", "draftCount", "evidenceEventCount",
    "importMode", "packageCount", "rootHash", "runtimeTier", "totalByteLength", "virtualFsEntryCount",
  ], "manifest");
  const archiveId = `learning-archive:${expected.rootHash.slice("sha256-".length)}`;
  if (item.archiveId !== archiveId || item.importMode !== IMPORT_MODE
      || Object.entries(expected).some(([key, expectedValue]) => item[key] !== expectedValue)) {
    throw new Error("학습 archive manifest가 실제 payload와 일치하지 않습니다.");
  }
  return { archiveId, createdAt: timestamp(item.createdAt, "manifest createdAt"), importMode: IMPORT_MODE, ...expected };
}

async function normalizeEvidenceArchive(value: unknown): Promise<EvidenceArchive> {
  const archive = closedRecord(value, ["events", "kind", "manifest", "schemaVersion"], "evidence archive");
  if (archive.kind !== "codaro.learning-evidence-archive" || archive.schemaVersion !== 1) {
    throw new Error("지원하지 않는 학습 evidence archive입니다.");
  }
  const rawEvents = boundedArray(archive.events, "evidence events", 0, 10_000);
  const events: Array<Record<string, unknown>> = [];
  const eventIds = new Set<string>();
  for (const rawEvent of rawEvents) {
    if (!isRecord(rawEvent)) throw new Error("학습 evidence event가 객체가 아닙니다.");
    const eventId = boundedString(rawEvent.eventId, "evidence eventId", 1024);
    const payloadHash = requireHash(rawEvent.payloadHash, "evidence payloadHash");
    const core = Object.fromEntries(Object.entries(rawEvent).filter(([key]) => key !== "payloadHash"));
    if (await digestBytes(encodeText(stableJson(core))) !== payloadHash || eventIds.has(eventId)) {
      throw new Error("학습 evidence event hash가 유효하지 않거나 eventId가 중복되었습니다.");
    }
    eventIds.add(eventId);
    events.push({ ...core, payloadHash });
  }
  events.sort((left, right) => unicodeCodePointCompare(String(left.eventId), String(right.eventId)));
  const canonicalEvents = stableJson(events);
  const eventSetHash = await digestBytes(encodeText(canonicalEvents));
  const manifest = closedRecord(archive.manifest, [
    "archiveId", "createdAt", "eventCount", "eventSetHash", "files", "runtimeTier", "schemaVersion",
  ], "evidence manifest");
  const files = boundedArray(manifest.files, "evidence files", 1, 1);
  const file = closedRecord(files[0], ["byteLength", "contentHash", "mediaType", "path"], "evidence file");
  const runtimeTier = manifest.runtimeTier;
  const acceptedArchiveIds = new Set([
    `learning-evidence:${eventSetHash.slice("sha256-".length)}`,
    `web-evidence:${eventSetHash.slice("sha256-".length)}`,
  ]);
  if ((runtimeTier !== "local" && runtimeTier !== "mixed" && runtimeTier !== "web")
      || manifest.schemaVersion !== 1 || manifest.eventCount !== events.length
      || manifest.eventSetHash !== eventSetHash || !acceptedArchiveIds.has(String(manifest.archiveId))
      || file.path !== "evidence/events.json" || file.mediaType !== "application/json"
      || file.contentHash !== eventSetHash || file.byteLength !== encodeText(canonicalEvents).byteLength) {
    throw new Error("학습 evidence archive manifest가 event bytes와 일치하지 않습니다.");
  }
  return {
    events,
    kind: "codaro.learning-evidence-archive",
    manifest: {
      archiveId: String(manifest.archiveId),
      createdAt: timestamp(manifest.createdAt, "evidence createdAt"),
      eventCount: events.length,
      eventSetHash,
      files: [{
        byteLength: Number(file.byteLength),
        contentHash: eventSetHash,
        mediaType: "application/json",
        path: "evidence/events.json",
      }],
      runtimeTier,
      schemaVersion: 1,
    },
    schemaVersion: 1,
  };
}

async function addBlob(blobs: Map<string, LearningArchiveBlob>, payload: Uint8Array): Promise<string> {
  if (payload.byteLength > MAX_BLOB_BYTES) throw new Error("학습 archive blob이 크기 한도를 초과했습니다.");
  const blobHash = await digestBytes(payload);
  const descriptor: LearningArchiveBlob = {
    byteLength: payload.byteLength,
    encoding: "base64url",
    mediaType: BLOB_MEDIA_TYPE,
    payload: encodeBase64Url(payload),
  };
  const existing = blobs.get(blobHash);
  if (existing && stableJson(existing) !== stableJson(descriptor)) {
    throw new Error("학습 archive content-addressed blob 충돌이 발생했습니다.");
  }
  blobs.set(blobHash, descriptor);
  if ([...blobs.values()].reduce((total, blob) => total + blob.byteLength, 0) > MAX_TOTAL_BYTES) {
    throw new Error("학습 archive 전체 bytes가 한도를 초과했습니다.");
  }
  return blobHash;
}

async function automationDraftId(input: {
  documentBlobHash: string;
  lessonRef: string;
  name: string;
  recipeBlobHash: string;
  sourceBlockIds: string[];
}) {
  const hash = await digestBytes(encodeText(stableJson(input)));
  return `automation-draft:${hash.slice("sha256-".length)}`;
}

async function buildLineageId(core: Omit<LearningArchiveLineage, "lineageId">) {
  const hash = await digestBytes(encodeText(stableJson(core)));
  return `lineage:${hash.slice("sha256-".length)}`;
}

function closedRecord(value: unknown, keys: string[], label: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${label}가 객체가 아닙니다.`);
  const actual = Object.keys(value).sort(unicodeCodePointCompare);
  const expected = [...keys].sort(unicodeCodePointCompare);
  if (stableJson(actual) !== stableJson(expected)) throw new Error(`${label} 필드가 닫힌 계약과 일치하지 않습니다.`);
  return value;
}

function boundedArray(value: unknown, label: string, minimum: number, maximum: number): unknown[] {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
    throw new Error(`${label} 목록 크기가 유효하지 않습니다.`);
  }
  return value;
}

function boundedString(value: unknown, label: string, maximum: number, allowEmpty = false): string {
  if (typeof value !== "string" || value.length > maximum || (!allowEmpty && !value)) {
    throw new Error(`${label} 문자열이 유효하지 않습니다.`);
  }
  return value;
}

function boundedInteger(value: unknown, label: string, minimum: number, maximum: number): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw new Error(`${label} 정수가 유효하지 않습니다.`);
  }
  return value as number;
}

function normalizeStringSet(value: unknown, label: string, maximum: number, itemMaximum: number): string[] {
  const items = boundedArray(value, label, 0, maximum)
    .map((item) => boundedString(item, label, itemMaximum))
    .sort(unicodeCodePointCompare);
  if (new Set(items).size !== items.length) throw new Error(`${label} 항목이 중복되었습니다.`);
  return items;
}

function requireHash(value: unknown, label: string): string {
  if (typeof value !== "string" || !HASH_PATTERN.test(value)) throw new Error(`${label}가 SHA-256 hash가 아닙니다.`);
  return value;
}

function knownBlob(value: unknown, blobs: ReadonlyMap<string, Uint8Array>, label: string): string {
  const blobHash = requireHash(value, label);
  if (!blobs.has(blobHash)) throw new Error(`${label}가 존재하지 않는 blob을 참조합니다.`);
  return blobHash;
}

function normalizeLessonRef(value: unknown): string {
  const lessonRef = boundedString(value, "lessonRef", 1024);
  if (lessonRef.startsWith("/") || lessonRef.endsWith("/") || !lessonRef.includes("/")
      || lessonRef.includes("\\") || lessonRef.split("/").includes("..")) {
    throw new Error("학습 archive lessonRef가 category/contentId 형식이 아닙니다.");
  }
  return lessonRef;
}

function normalizeSafePath(value: unknown): string {
  const path = boundedString(value, "archive path", 1024);
  const parts = path.split("/");
  if (path.startsWith("/") || path.includes("\\") || path.includes(":") || path.includes("\0")
      || parts.some((part) => !part || part === "." || part === ".." || part.trimEnd().replace(/\.+$/, "") !== part)
      || parts.some((part) => WINDOWS_RESERVED_NAMES.has(part.split(".", 1)[0].toUpperCase()))) {
    throw new Error(`학습 archive 상대 경로가 안전하지 않습니다: ${path}`);
  }
  return path;
}

function requireParentDirectories(path: string, directories: ReadonlySet<string>) {
  const parts = path.split("/").slice(0, -1);
  for (let index = 1; index <= parts.length; index += 1) {
    const parent = parts.slice(0, index).join("/");
    if (!directories.has(parent)) throw new Error(`학습 archive virtual FS parent directory가 누락되었습니다: ${parent}`);
  }
}

function packageName(value: unknown) {
  const name = boundedString(value, "package name", 255);
  if (!PACKAGE_NAME_PATTERN.test(name)) throw new Error("학습 archive package name이 유효하지 않습니다.");
  return name;
}

function packageVersion(value: unknown) {
  const version = boundedString(value, "package version", 255);
  if (!PACKAGE_VERSION_PATTERN.test(version)) throw new Error("학습 archive package version이 유효하지 않습니다.");
  return version;
}

function hasWheelZipHeader(value: Uint8Array) {
  return value.byteLength >= 4
    && value[0] === 0x50
    && value[1] === 0x4b
    && value[2] === 0x03
    && value[3] === 0x04;
}

function timestamp(value: unknown, label: string) {
  const text = boundedString(value, label, 64);
  if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(text) || Number.isNaN(Date.parse(text))) {
    throw new Error(`${label}가 timezone이 있는 ISO 8601 timestamp가 아닙니다.`);
  }
  return text;
}

function textOrBytes(value: unknown, label: string): Uint8Array {
  if (typeof value === "string") return encodeText(value);
  if (value instanceof Uint8Array) return value;
  throw new Error(`학습 archive ${label}는 text 또는 bytes여야 합니다.`);
}

function parseCanonicalJson(payload: Uint8Array, label: string): unknown {
  const text = decodeText(payload, label);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`학습 archive ${label} bytes가 JSON이 아닙니다.`, { cause: error });
  }
  if (stableJson(parsed) !== text) throw new Error(`학습 archive ${label} bytes가 canonical JSON이 아닙니다.`);
  return parsed;
}

function encodeText(value: string) {
  return new TextEncoder().encode(value);
}

function decodeText(value: Uint8Array, label: string) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(value);
  } catch (error) {
    throw new Error(`학습 archive ${label} bytes가 UTF-8이 아닙니다.`, { cause: error });
  }
}

async function digestBytes(value: Uint8Array) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", Uint8Array.from(value).buffer));
  return `sha256-${encodeBase64Url(digest)}`;
}

function encodeBase64Url(value: Uint8Array) {
  const chunks: string[] = [];
  const chunkSize = 0x8000;
  for (let offset = 0; offset < value.length; offset += chunkSize) {
    chunks.push(String.fromCharCode(...value.subarray(offset, offset + chunkSize)));
  }
  return btoa(chunks.join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string) {
  const padded = `${value.replace(/-/g, "+").replace(/_/g, "/")}${"=".repeat((4 - value.length % 4) % 4)}`;
  let binary: string;
  try {
    binary = atob(padded);
  } catch (error) {
    throw new Error("학습 archive blob base64url을 decode할 수 없습니다.", { cause: error });
  }
  const result = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  if (encodeBase64Url(result) !== value) throw new Error("학습 archive blob base64url이 canonical encoding이 아닙니다.");
  return result;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value).sort(unicodeCodePointCompare).map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error("학습 archive 값은 JSON으로 직렬화할 수 있어야 합니다.");
  return serialized;
}

function jsonRecord(value: unknown, label: string): Record<string, unknown> {
  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(value);
  } catch (error) {
    throw new Error(`학습 archive ${label}가 JSON으로 직렬화되지 않습니다.`, { cause: error });
  }
  if (serialized === undefined) throw new Error(`학습 archive ${label}가 JSON 값이 아닙니다.`);
  const parsed = JSON.parse(serialized) as unknown;
  if (!isRecord(parsed)) throw new Error(`학습 archive ${label}가 객체가 아닙니다.`);
  return parsed;
}

function comparePathAndKind(left: LearningArchiveVirtualFsEntry, right: LearningArchiveVirtualFsEntry) {
  return unicodeCodePointCompare(`${left.path}\u0000${left.kind}`, `${right.path}\u0000${right.kind}`);
}

function unicodeCodePointCompare(left: string, right: string) {
  const leftPoints = Array.from(left, (value) => value.codePointAt(0)!);
  const rightPoints = Array.from(right, (value) => value.codePointAt(0)!);
  const length = Math.min(leftPoints.length, rightPoints.length);
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index];
  }
  return leftPoints.length - rightPoints.length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
