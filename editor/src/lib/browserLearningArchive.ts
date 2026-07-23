import { codaroApi, shouldUseApi } from "@/lib/api";
import {
  exportLearningEvidenceArchive,
  importLearningEvidenceArchive,
} from "@/lib/learningEvidenceOperations";
import {
  buildLearningArchive,
  materializeLearningArchive,
  serializeLearningArchive,
  type LearningArchive,
  type LearningArchiveAutomationDraftInput,
  type LearningArchiveMaterialization,
  type LearningArchivePackageInput,
  type LearningArchiveVirtualFileInput,
} from "@/lib/learningArchive";
import type { CodaroDocument } from "@/types";
import { resolveRegistryContentId } from "@/lib/curriculaRegistry";
import {
  commitStoredBrowserLearningArchiveImport,
  readStoredBrowserLearningArchiveState,
  reserveStoredBrowserLearningArchiveWrite,
  rollbackStoredBrowserLearningArchiveImport,
  stageStoredBrowserLearningArchiveImport,
  writeStoredBrowserLearningArchive,
} from "@/lib/browserLearningArchiveStore";

const workspaceWriteTails = new Map<string, Promise<void>>();
const workspaceImportGenerations = new Map<string, number>();

export type BrowserLearningArchiveExportInput = {
  automationDrafts?: LearningArchiveAutomationDraftInput[];
  document: CodaroDocument;
  drafts: Record<string, string>;
  lessonRef: string;
  packages?: LearningArchivePackageInput[];
  virtualDirectories?: string[];
  virtualFiles?: LearningArchiveVirtualFileInput[];
};

export type BrowserLearningWorkspaceAutosaveInput = BrowserLearningArchiveExportInput & {
  importGeneration: number;
};

export type BrowserLearningArchiveImportReceipt = {
  evidence: {
    conflicted: number;
    inserted: number;
    migrated: number;
    skipped: number;
  };
  localArchiveId: string | null;
  materialized: LearningArchiveMaterialization;
};

export async function readAdoptedLearningArchiveAutomationDraftIds(): Promise<string[]> {
  const tasks = await codaroApi.tasks();
  return tasks.tasks
    .map((task) => task.inputs?.sourceDraftId)
    .filter((draftId): draftId is string => typeof draftId === "string");
}

export function captureBrowserLearningWorkspaceAutosave(
  input: BrowserLearningArchiveExportInput,
): BrowserLearningWorkspaceAutosaveInput {
  return {
    ...input,
    importGeneration: workspaceImportGeneration(input.lessonRef),
  };
}

export function adoptLearningArchiveAutomationDraft(draftId: string) {
  return codaroApi.adoptLearningArchiveAutomationDraft(draftId);
}

export async function exportBrowserLearningArchive(input: BrowserLearningArchiveExportInput): Promise<string> {
  const evidenceArchive = JSON.parse(await exportLearningEvidenceArchive()) as unknown;
  const persisted = await readPersistedLearningArchive(input.lessonRef);
  return buildSerializedBrowserLearningArchive(input, evidenceArchive, persisted);
}

async function buildSerializedBrowserLearningArchive(
  input: BrowserLearningArchiveExportInput,
  evidenceArchive: unknown,
  persisted: LearningArchiveMaterialization | null,
): Promise<string> {
  const documentBlockIds = new Set(input.document.blocks.map((block) => block.id));
  const drafts = Object.fromEntries(
    Object.entries(input.drafts).filter(([blockId]) => documentBlockIds.has(blockId)),
  );
  if (!Object.keys(drafts).length) {
    throw new Error("내보낼 학습 문서 수정본이 없습니다.");
  }
  const archive = await buildLearningArchive({
    automationDrafts: input.automationDrafts ?? persisted?.automationDrafts.map((draft) => ({
      description: draft.description,
      name: draft.name,
      recipe: draft.recipe,
      sourceBlockIds: draft.sourceBlockIds,
    })),
    document: input.document,
    drafts,
    evidenceArchive,
    lessonRef: input.lessonRef,
    packages: input.packages ?? persisted?.packages.map((item) => ({
      name: item.name,
      path: item.path,
      payload: item.payload,
      version: item.version,
    })),
    virtualDirectories: input.virtualDirectories ?? persisted?.virtualDirectories,
    virtualFiles: input.virtualFiles ?? persisted?.virtualFiles.map((item) => ({
      executable: item.executable,
      mediaType: item.mediaType,
      path: item.path,
      payload: item.payload,
    })),
  });
  return serializeLearningArchive(archive);
}

export async function importBrowserLearningArchive(rawArchive: string): Promise<BrowserLearningArchiveImportReceipt> {
  return importBrowserLearningArchiveInternal(rawArchive);
}

async function importBrowserLearningArchiveInternal(rawArchive: string): Promise<BrowserLearningArchiveImportReceipt> {
  const materialized = await materializeLearningArchive(rawArchive);
  const lessonRef = await canonicalLearningArchiveLessonRef(materialized);
  if (shouldUseApi()) {
    const localReceipt = await codaroApi.importLearningArchive(materialized.archive as unknown as Record<string, unknown>);
    return {
      evidence: localReceipt.evidence,
      localArchiveId: localReceipt.archiveId,
      materialized,
    };
  }
  return enqueueWorkspaceWrite(lessonRef, async () => {
    await recoverPendingBrowserLearningArchive(lessonRef);
    const revision = await stageStoredBrowserLearningArchiveImport(lessonRef, materialized.archive);
    if (revision === null) {
      throw new Error("다른 창에서 학습 작업을 가져오는 중입니다. 잠시 후 다시 시도하세요.");
    }
    try {
      const evidence = await importLearningEvidenceArchive(JSON.stringify(materialized.evidenceArchive));
      const committed = await commitStoredBrowserLearningArchiveImport(
        lessonRef,
        revision,
        materialized.archive.manifest.rootHash,
      );
      if (!committed) {
        throw new Error("다른 창에서 더 최신 학습 작업을 저장했습니다. 다시 가져오세요.");
      }
      markWorkspaceImportCommitted(lessonRef);
      return {
        evidence: {
          conflicted: evidence.conflicted,
          inserted: evidence.inserted,
          migrated: evidence.migrated,
          skipped: evidence.skipped,
        },
        localArchiveId: null,
        materialized,
      };
    } catch (error) {
      await rollbackStoredBrowserLearningArchiveImport(lessonRef, revision);
      throw error;
    }
  });
}

export async function readPersistedLearningArchive(
  lessonRef: string,
): Promise<LearningArchiveMaterialization | null> {
  let archive: unknown;
  if (shouldUseApi()) {
    archive = await codaroApi.currentLearningArchive();
    if (archive === null) return null;
  } else {
    archive = await recoverPendingBrowserLearningArchive(lessonRef);
    if (!archive) return null;
  }
  const materialized = await materializeLearningArchive(archive);
  return await canonicalLearningArchiveLessonRef(materialized) === lessonRef ? materialized : null;
}

export async function persistBrowserLearningWorkspace(input: BrowserLearningWorkspaceAutosaveInput): Promise<void> {
  if (shouldUseApi()) return;
  const importGeneration = input.importGeneration;
  await enqueueWorkspaceWrite(input.lessonRef, async () => {
    if (workspaceImportGeneration(input.lessonRef) !== importGeneration) return;
    await recoverPendingBrowserLearningArchive(input.lessonRef);
    if (workspaceImportGeneration(input.lessonRef) !== importGeneration) return;
    const reservation = await reserveStoredBrowserLearningArchiveWrite(input.lessonRef);
    if (!reservation) {
      throw new Error("다른 창에서 학습 작업을 가져오는 중이라 자동 저장을 미뤘습니다.");
    }
    const persisted = await learningArchiveAutosaveStage(
      "기존 Web 학습 작업 검증",
      () => materializeStoredBrowserLearningArchive(reservation.archive, input.lessonRef),
    );
    const evidenceArchive = await learningArchiveAutosaveStage(
      "현재 학습 증거 내보내기",
      async () => JSON.parse(await exportLearningEvidenceArchive()) as unknown,
    );
    const serialized = await learningArchiveAutosaveStage(
      "새 Web 학습 작업 구성",
      () => buildSerializedBrowserLearningArchive(input, evidenceArchive, persisted),
    );
    const materialized = await learningArchiveAutosaveStage(
      "새 Web 학습 작업 검증",
      () => materializeLearningArchive(serialized),
    );
    const lessonRef = await canonicalLearningArchiveLessonRef(materialized);
    if (lessonRef !== input.lessonRef) throw new Error("저장할 학습 작업의 레슨 주소가 현재 레슨과 다릅니다.");
    const written = await writeStoredBrowserLearningArchive(
      lessonRef,
      materialized.archive,
      reservation.revision,
    );
    if (!written) throw new Error("다른 창에서 더 최신 학습 작업을 저장했습니다.");
  });
}

async function recoverPendingBrowserLearningArchive(lessonRef: string): Promise<LearningArchive | null> {
  const state = await readStoredBrowserLearningArchiveState(lessonRef);
  const pending = state.pendingImport;
  if (!pending) return state.archive;

  let materialized: LearningArchiveMaterialization;
  try {
    materialized = await materializeLearningArchive(pending.archive);
    if (await canonicalLearningArchiveLessonRef(materialized) !== lessonRef) {
      throw new Error("복구할 학습 작업의 레슨 주소가 저장 위치와 다릅니다.");
    }
  } catch (error) {
    const rolledBack = await rollbackStoredBrowserLearningArchiveImport(lessonRef, state.revision);
    console.error("중단된 Web 학습 작업을 검증하지 못해 이전 저장으로 복구했습니다.", error);
    return rolledBack ? state.archive : (await readStoredBrowserLearningArchiveState(lessonRef)).archive;
  }

  try {
    await importLearningEvidenceArchive(JSON.stringify(materialized.evidenceArchive));
  } catch (error) {
    console.error("중단된 Web 학습 작업의 검증 기록 복구를 다음 진입까지 미뤘습니다.", error);
    return (await readStoredBrowserLearningArchiveState(lessonRef)).archive;
  }

  const committed = await commitStoredBrowserLearningArchiveImport(
    lessonRef,
    state.revision,
    pending.archive.manifest.rootHash,
  );
  if (!committed) return (await readStoredBrowserLearningArchiveState(lessonRef)).archive;
  markWorkspaceImportCommitted(lessonRef);
  return pending.archive;
}

async function materializeStoredBrowserLearningArchive(
  archive: LearningArchive | null,
  lessonRef: string,
): Promise<LearningArchiveMaterialization | null> {
  if (!archive) return null;
  const materialized = await materializeLearningArchive(archive);
  return await canonicalLearningArchiveLessonRef(materialized) === lessonRef ? materialized : null;
}

function workspaceImportGeneration(lessonRef: string): number {
  return workspaceImportGenerations.get(lessonRef) ?? 0;
}

function markWorkspaceImportCommitted(lessonRef: string): void {
  workspaceImportGenerations.set(lessonRef, workspaceImportGeneration(lessonRef) + 1);
}

async function learningArchiveAutosaveStage<T>(label: string, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} 실패: ${detail}`, { cause: error });
  }
}

export function learningArchiveLessonRef(materialized: LearningArchiveMaterialization): string {
  const lineage = materialized.archive.lineage.find(
    (item) => item.documentBlobHash === materialized.archive.document.blobHash,
  ) ?? materialized.archive.lineage[0];
  const lessonRef = lineage?.lessonRef ?? "";
  const separator = lessonRef.indexOf("/");
  if (separator < 1 || separator !== lessonRef.lastIndexOf("/") || separator === lessonRef.length - 1) {
    throw new Error("학습 archive의 레슨 주소를 복원할 수 없습니다.");
  }
  return lessonRef;
}

export async function canonicalLearningArchiveLessonRef(
  materialized: LearningArchiveMaterialization,
): Promise<string> {
  const lessonRef = learningArchiveLessonRef(materialized);
  const separator = lessonRef.indexOf("/");
  const category = lessonRef.slice(0, separator);
  const contentId = lessonRef.slice(separator + 1);
  const canonicalContentId = await resolveRegistryContentId(category, contentId);
  return `${category}/${canonicalContentId ?? contentId}`;
}

async function enqueueWorkspaceWrite<T>(lessonRef: string, operation: () => Promise<T>): Promise<T> {
  const previous = workspaceWriteTails.get(lessonRef) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(operation);
  const tail = current.then(() => undefined, () => undefined);
  workspaceWriteTails.set(lessonRef, tail);
  try {
    return await current;
  } finally {
    if (workspaceWriteTails.get(lessonRef) === tail) workspaceWriteTails.delete(lessonRef);
  }
}
