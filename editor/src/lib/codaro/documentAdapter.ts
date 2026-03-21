import type { CodaroBlock, CodaroDocument, EngineExecutionResult } from "./types";

function blockExecution(): CodaroBlock["execution"] {
  return {
    executionCount: 0,
    status: "idle",
    lastRunAt: null,
    lastOutput: null
  };
}

export function createDefaultDocument(title = "Untitled"): CodaroDocument {
  const now = new Date().toISOString();
  return {
    id: `doc-${crypto.randomUUID().slice(0, 8)}`,
    title,
    blocks: [
      {
        id: `block-${crypto.randomUUID().slice(0, 8)}`,
        type: "code",
        content: "",
        execution: blockExecution()
      }
    ],
    metadata: {
      createdAt: now,
      updatedAt: now,
      sourceFormat: "percent",
      tags: []
    },
    runtime: {
      defaultEngine: "server",
      reactiveMode: "hybrid",
      packages: []
    },
    app: {
      title,
      layout: "notebook",
      hideCode: true,
      entryBlockIds: []
    }
  };
}

export function withUpdatedTimestamp(document: CodaroDocument): CodaroDocument {
  return {
    ...document,
    app: { ...document.app, title: document.title },
    metadata: { ...document.metadata, updatedAt: new Date().toISOString() }
  };
}

export function addBlock(
  document: CodaroDocument,
  type: "code" | "markdown",
  anchorBlockId?: string | null,
  direction: "before" | "after" = "after"
): CodaroDocument {
  const nextBlock: CodaroBlock = {
    id: `block-${crypto.randomUUID().slice(0, 8)}`,
    type,
    content: "",
    execution: blockExecution()
  };
  const blocks = [...document.blocks];
  if (!anchorBlockId) {
    blocks.push(nextBlock);
  } else {
    const index = blocks.findIndex((block) => block.id === anchorBlockId);
    const insertionIndex = index < 0 ? blocks.length : direction === "before" ? index : index + 1;
    blocks.splice(insertionIndex, 0, nextBlock);
  }
  return { ...document, blocks };
}

export function removeBlock(document: CodaroDocument, blockId: string): CodaroDocument {
  const blocks = document.blocks.filter((block) => block.id !== blockId);
  if (blocks.length > 0) {
    return { ...document, blocks };
  }
  return addBlock({ ...document, blocks: [] }, "code");
}

export function updateBlockContent(document: CodaroDocument, blockId: string, content: string): CodaroDocument {
  return {
    ...document,
    blocks: document.blocks.map((block) => block.id === blockId ? { ...block, content } : block)
  };
}

export function updateBlockType(document: CodaroDocument, blockId: string, nextType: "code" | "markdown"): CodaroDocument {
  return {
    ...document,
    blocks: document.blocks.map((block) => {
      if (block.id !== blockId) {
        return block;
      }
      return {
        ...block,
        type: nextType,
        execution: nextType === "code" ? block.execution : blockExecution()
      };
    })
  };
}

export function moveBlock(document: CodaroDocument, blockId: string, offset: number): CodaroDocument {
  const blocks = [...document.blocks];
  const index = blocks.findIndex((block) => block.id === blockId);
  const nextIndex = index + offset;
  if (index < 0 || nextIndex < 0 || nextIndex >= blocks.length) {
    return document;
  }
  const [block] = blocks.splice(index, 1);
  blocks.splice(nextIndex, 0, block);
  return { ...document, blocks };
}

export function duplicateBlock(document: CodaroDocument, blockId: string): CodaroDocument {
  const blocks = [...document.blocks];
  const index = blocks.findIndex((block) => block.id === blockId);
  if (index < 0) {
    return document;
  }
  const source = blocks[index];
  const clone: CodaroBlock = {
    ...source,
    id: `block-${crypto.randomUUID().slice(0, 8)}`,
    execution: blockExecution()
  };
  blocks.splice(index + 1, 0, clone);
  return { ...document, blocks };
}

export function applyExecutionResult(document: CodaroDocument, blockId: string, result: EngineExecutionResult): CodaroDocument {
  return {
    ...document,
    blocks: document.blocks.map((block) => {
      if (block.id !== blockId) {
        return block;
      }
      return {
        ...block,
        execution: {
          executionCount: result.executionCount,
          status: result.status,
          lastRunAt: new Date().toISOString(),
          lastOutput: result
        }
      };
    })
  };
}
