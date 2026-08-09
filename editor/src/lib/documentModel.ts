import type { BlockConfig, CodaroDocument } from "@/types";
import { isExecutableBlock } from "@/lib/cellModel";
import {
  APP_LAYOUTS,
  APP_STATE_POLICIES,
  type AppSpec,
} from "@/lib/generatedContracts/appSpec";

export const starterDocument: CodaroDocument = {
  id: "new-notebook",
  title: "Untitled",
  blocks: [
    {
      id: "cell-1",
      type: "code",
      content: "",
    },
  ],
  metadata: {
    sourceFormat: "codaro",
    tags: ["notebook"],
  },
  runtime: {
    defaultEngine: "local",
    reactiveMode: "hybrid",
    packages: [],
  },
};

export function draftsFromDocument(document: CodaroDocument) {
  return draftsFromBlocks(document.blocks, { includeMarkdown: true });
}

export function draftsFromBlocks(
  blocks: BlockConfig[],
  options: { emptyDuplicateSnippetExerciseDraft?: boolean; emptySnippetDraft?: boolean; includeMarkdown?: boolean } = {},
) {
  const duplicateExerciseBlockIds = options.emptyDuplicateSnippetExerciseDraft
    ? duplicateSnippetExerciseBlockIds(blocks)
    : new Set<string>();

  return Object.fromEntries(
    blocks
      .filter((block) => isExecutableBlock(block) || (options.includeMarkdown && block.type === "markdown"))
      .map((block) => [
        block.id,
        draftValueForBlock(block, options, duplicateExerciseBlockIds),
      ]),
  );
}

function draftValueForBlock(
  block: BlockConfig,
  options: { emptyDuplicateSnippetExerciseDraft?: boolean; emptySnippetDraft?: boolean },
  duplicateExerciseBlockIds: Set<string>,
) {
  if (options.emptySnippetDraft && block.role === "snippet") return "";
  if (
    options.emptyDuplicateSnippetExerciseDraft
    && duplicateExerciseBlockIds.has(block.id)
  ) {
    return "";
  }
  return block.content;
}

function duplicateSnippetExerciseBlockIds(blocks: BlockConfig[]) {
  const result = new Set<string>();
  let activeSnippetContent = "";
  blocks.forEach((block) => {
    if (block.sourceType === "section") {
      activeSnippetContent = "";
    }
    if (!isExecutableBlock(block)) return;
    const content = normalizeDraftCode(block.content);
    if (block.role === "snippet") {
      activeSnippetContent = content;
      return;
    }
    if (block.role === "exercise" && content && content === activeSnippetContent) {
      result.add(block.id);
    }
  });
  return result;
}

function normalizeDraftCode(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

export function appendUniqueBlocks(
  document: CodaroDocument,
  blocks: BlockConfig[],
  options: { generatedTitle?: string } = {},
) {
  const existingIds = new Set(document.blocks.map((block) => block.id));
  const nextBlocks = blocks.filter((block) => !existingIds.has(block.id));
  if (!nextBlocks.length) {
    return {
      addedBlocks: [],
      document,
    };
  }

  return {
    addedBlocks: nextBlocks,
    document: {
      ...document,
      title: shouldUseGeneratedTitle(document.title) && options.generatedTitle ? options.generatedTitle : document.title,
      blocks: [...document.blocks, ...nextBlocks],
    },
  };
}

export function firstCodeBlockId(blocks: BlockConfig[]) {
  return blocks.find((block) => isExecutableBlock(block))?.id ?? "";
}

export function materializeDrafts(document: CodaroDocument, drafts: Record<string, string>): CodaroDocument {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      isExecutableBlock(block) || block.type === "markdown"
        ? { ...block, content: drafts[block.id] ?? block.content }
        : block,
    ),
  };
}

export function normalizeDocumentPayload(
  raw: unknown,
  options: {
    fallbackApp?: CodaroDocument["app"];
    fallbackIdPrefix?: string;
    fallbackMetadata?: CodaroDocument["metadata"];
    fallbackTitle?: string;
  } = {},
): CodaroDocument | null {
  if (!isRecord(raw) || !Array.isArray(raw.blocks)) return null;

  const blocks = raw.blocks
    .filter(isRecord)
    .map((block, index) => normalizeBlockPayload(block, index))
    .filter((block): block is BlockConfig => block !== null);

  if (!blocks.length) return null;

  const fallbackTitle = options.fallbackTitle ?? "Codaro 노트북";
  const title = String(raw.title ?? fallbackTitle);
  const rawApp = isRecord(raw.app) ? raw.app : options.fallbackApp;
  const app = normalizeAppSpec(rawApp, title, blocks);
  if (app === null) return null;

  return {
    ...starterDocument,
    id: String(raw.id ?? `${options.fallbackIdPrefix ?? "document"}-${Date.now()}`),
    title,
    blocks,
    metadata: isRecord(raw.metadata)
      ? (raw.metadata as CodaroDocument["metadata"])
      : options.fallbackMetadata ?? starterDocument.metadata,
    runtime: isRecord(raw.runtime) ? (raw.runtime as CodaroDocument["runtime"]) : starterDocument.runtime,
    app,
  };
}

function normalizeAppSpec(
  raw: unknown,
  title: string,
  blocks: BlockConfig[],
): AppSpec | null {
  const value = isRecord(raw) ? raw : {};
  const schemaVersion = value.schemaVersion ?? 1;
  const layout = value.layout ?? "notebook";
  const statePolicy = value.statePolicy ?? "perSession";
  const entryBlockIds = value.entryBlockIds ?? [];
  if (schemaVersion !== 1) return null;
  if (typeof layout !== "string" || !APP_LAYOUTS.includes(layout as AppSpec["layout"])) return null;
  if (
    typeof statePolicy !== "string"
    || !APP_STATE_POLICIES.includes(statePolicy as AppSpec["statePolicy"])
  ) return null;
  if (!Array.isArray(entryBlockIds) || !entryBlockIds.every((blockId) => typeof blockId === "string")) {
    return null;
  }
  if (new Set(entryBlockIds).size !== entryBlockIds.length) return null;
  const blockIds = new Set(blocks.map((block) => block.id));
  if (entryBlockIds.some((blockId) => !blockIds.has(blockId))) return null;
  return {
    schemaVersion: 1,
    title: String(value.title ?? title),
    layout: layout as AppSpec["layout"],
    hideCode: value.hideCode === undefined ? false : value.hideCode === true,
    entryBlockIds: [...entryBlockIds],
    statePolicy: statePolicy as AppSpec["statePolicy"],
  };
}

export function normalizeBlockPayload(raw: Record<string, unknown>, index: number): BlockConfig | null {
  const content = raw.content;
  if (content === undefined || content === null) return null;

  return {
    id: String(raw.id ?? `cell-${index}-${Date.now()}`),
    type: normalizeBlockType(String(raw.type ?? "markdown")),
    content: String(content),
    role: typeof raw.role === "string" ? (raw.role as BlockConfig["role"]) : undefined,
    executionKind: typeof raw.executionKind === "string" ? (raw.executionKind as BlockConfig["executionKind"]) : undefined,
    displayKind: typeof raw.displayKind === "string" ? (raw.displayKind as BlockConfig["displayKind"]) : undefined,
    sourceType: typeof raw.sourceType === "string" ? raw.sourceType : undefined,
    payload: raw.payload,
    title: typeof raw.title === "string" ? raw.title : undefined,
    description: typeof raw.description === "string" ? raw.description : undefined,
    collapsed: Boolean(raw.collapsed),
    execution: isRecord(raw.execution) ? (raw.execution as BlockConfig["execution"]) : undefined,
    guide: isRecord(raw.guide) ? (raw.guide as BlockConfig["guide"]) : null,
  };
}

export function normalizeBlockType(type: string): BlockConfig["type"] {
  if (type === "code") return "code";
  if (type === "automation") return "automation";
  return "markdown";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function shouldUseGeneratedTitle(title: string) {
  return title === "Untitled" || title === "새 노트북" || title === "새노트북.py" || title === "생성 노트북";
}
