import { blockLabel } from "@/lib/cellModel";
import {
  draftsFromBlocks,
  isRecord,
  normalizeDocumentPayload,
  starterDocument,
} from "@/lib/documentModel";
import type { SurfaceMode } from "@/lib/surfaceModel";
import type { AppNotice, BlockConfig, CodaroDocument } from "@/types";

export const CUSTOM_CURRICULUM_CATEGORY = "__custom__";
export const customCurriculaStorageKey = "codaro-custom-curricula";

export type CustomCurriculumEntry = {
  id: string;
  title: string;
  document: CodaroDocument;
  createdAt: number;
};

export type SidebarCustomCurriculum = {
  id: string;
  title: string;
  blockCount: number;
  createdAt: number;
};

export type CustomCurriculumApplication = {
  draftUpdates: Record<string, string>;
  document: CodaroDocument;
  notice: AppNotice | null;
  selectedBlockId: string;
  selectedCategory: string;
  selectedContentId: string;
  selectedCustomCurriculumId: string;
  surfaceToOpen: SurfaceMode;
};

export function loadCustomCurricula(): CustomCurriculumEntry[] {
  try {
    const raw = window.localStorage.getItem(customCurriculaStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isRecord)
      .map((item) => {
        const document = normalizeStoredCurriculumDocument(item.document);
        if (!document) return null;
        return {
          id: String(item.id ?? document.id),
          title: String(item.title ?? document.title),
          document,
          createdAt: Number(item.createdAt ?? Date.now()),
        };
      })
      .filter((item): item is CustomCurriculumEntry => item !== null);
  } catch {
    return [];
  }
}

export function createCustomCurriculumEntry(blocks: BlockConfig[], title?: string): CustomCurriculumEntry {
  const createdAt = Date.now();
  const resolvedTitle = title?.trim() || titleFromBlocks(blocks) || "나만의 커리큘럼";
  const id = `custom-${createdAt}-${slugifyText(resolvedTitle)}`;
  const normalizedBlocks = blocks.map((block, index) => ({
    ...block,
    id: `${id}-${block.id || index}`.replace(/[^a-zA-Z0-9_-]/g, "-"),
  }));
  const document: CodaroDocument = {
    ...starterDocument,
    id: `curriculum-${id}`,
    title: resolvedTitle,
    blocks: normalizedBlocks,
    metadata: {
      sourceFormat: "custom-curriculum",
      tags: ["custom", slugifyText(resolvedTitle)],
      createdAt: new Date(createdAt).toISOString(),
    },
    runtime: {
      defaultEngine: "local",
      reactiveMode: "hybrid",
      packages: [],
    },
    app: {
      title: resolvedTitle,
      layout: "learning",
      hideCode: false,
      entryBlockIds: [],
    },
  };
  return {
    id,
    title: resolvedTitle,
    document,
    createdAt,
  };
}

export function createCustomCurriculumEntryFromDocument(
  sourceDocument: CodaroDocument,
  title?: string,
): CustomCurriculumEntry {
  const createdAt = Date.now();
  const resolvedTitle = title?.trim() || sourceDocument.title || "나만의 커리큘럼";
  const id = `custom-${createdAt}-${slugifyText(resolvedTitle)}`;
  const normalizedBlocks = sourceDocument.blocks.map((block, index) => ({
    ...block,
    id: `${id}-${block.id || index}`.replace(/[^a-zA-Z0-9_-]/g, "-"),
  }));
  const document: CodaroDocument = {
    ...sourceDocument,
    id: `curriculum-${id}`,
    title: resolvedTitle,
    blocks: normalizedBlocks,
    metadata: {
      sourceFormat: sourceDocument.metadata?.sourceFormat ?? "custom-curriculum",
      tags: [...new Set([...(sourceDocument.metadata?.tags ?? []), "custom", slugifyText(resolvedTitle)])],
      createdAt: new Date(createdAt).toISOString(),
      updatedAt: sourceDocument.metadata?.updatedAt,
    },
    app: {
      title: resolvedTitle,
      layout: sourceDocument.app?.layout ?? "learning",
      hideCode: sourceDocument.app?.hideCode ?? false,
      entryBlockIds: sourceDocument.app?.entryBlockIds ?? [],
    },
  };
  return {
    id,
    title: resolvedTitle,
    document,
    createdAt,
  };
}

export function upsertCustomCurriculumEntry(
  current: CustomCurriculumEntry[],
  entry: CustomCurriculumEntry,
) {
  return [entry, ...current.filter((item) => item.id !== entry.id)];
}

export function buildCustomCurriculumApplication(
  entry: CustomCurriculumEntry,
  options: { showNotice?: boolean } = {},
): CustomCurriculumApplication {
  return {
    draftUpdates: draftsFromBlocks(entry.document.blocks, {
      emptyDuplicateSnippetExerciseDraft: true,
      emptySnippetDraft: true,
    }),
    document: entry.document,
    notice: options.showNotice
      ? {
          tone: "success",
          title: "나만의 커리큘럼 저장됨",
          detail: entry.title,
        }
      : null,
    selectedBlockId: entry.document.blocks[0]?.id ?? "",
    selectedCategory: CUSTOM_CURRICULUM_CATEGORY,
    selectedContentId: entry.id,
    selectedCustomCurriculumId: entry.id,
    surfaceToOpen: "curriculum",
  };
}

export function sidebarCustomCurriculumFromEntry(entry: CustomCurriculumEntry): SidebarCustomCurriculum {
  return {
    id: entry.id,
    title: entry.title,
    blockCount: entry.document.blocks.length,
    createdAt: entry.createdAt,
  };
}

function normalizeStoredCurriculumDocument(raw: unknown) {
  const fallbackTitle = isRecord(raw) ? String(raw.title ?? "나만의 커리큘럼") : "나만의 커리큘럼";
  return normalizeDocumentPayload(raw, {
    fallbackIdPrefix: "custom",
    fallbackTitle,
    fallbackMetadata: {
      sourceFormat: "custom-curriculum",
      tags: ["custom"],
    },
    fallbackApp: {
      title: fallbackTitle,
      layout: "learning",
      hideCode: false,
      entryBlockIds: [],
    },
  });
}

function titleFromBlocks(blocks: BlockConfig[]) {
  const first = blocks.find((block) => block.title || block.content.trim());
  if (!first) return "";
  if (first.title) return first.title;
  const heading = first.content.split("\n").find((line) => line.trim().startsWith("#"));
  if (heading) return heading.replace(/^#+\s*/, "").trim();
  return blockLabel(first);
}

function slugifyText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}
