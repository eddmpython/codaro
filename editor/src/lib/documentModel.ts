import type { BlockConfig, CodaroDocument } from "@/types";

export const starterDocument: CodaroDocument = {
  id: "new-notebook",
  title: "새 노트북",
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
  options: { emptySnippetDraft?: boolean; includeMarkdown?: boolean } = {},
) {
  return Object.fromEntries(
    blocks
      .filter((block) => block.type === "code" || (options.includeMarkdown && block.type === "markdown"))
      .map((block) => [
        block.id,
        options.emptySnippetDraft && block.role === "snippet" ? "" : block.content,
      ]),
  );
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
  return blocks.find((block) => block.type === "code")?.id ?? "";
}

export function materializeDrafts(document: CodaroDocument, drafts: Record<string, string>): CodaroDocument {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      block.type === "code" || block.type === "markdown"
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

  return {
    ...starterDocument,
    id: String(raw.id ?? `${options.fallbackIdPrefix ?? "document"}-${Date.now()}`),
    title,
    blocks,
    metadata: isRecord(raw.metadata)
      ? (raw.metadata as CodaroDocument["metadata"])
      : options.fallbackMetadata ?? starterDocument.metadata,
    runtime: isRecord(raw.runtime) ? (raw.runtime as CodaroDocument["runtime"]) : starterDocument.runtime,
    app: isRecord(raw.app)
      ? (raw.app as CodaroDocument["app"])
      : options.fallbackApp ?? {
        title,
        layout: "notebook",
        hideCode: false,
        entryBlockIds: [],
      },
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
  return title === "새 노트북" || title === "생성 노트북";
}
