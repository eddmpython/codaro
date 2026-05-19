import {
  isRecord,
  normalizeBlockType,
  normalizeDocumentPayload,
} from "@/lib/documentModel";
import type { AiToolCall, BlockConfig, CodaroDocument } from "@/types";

export function documentFromToolCalls(toolCalls: AiToolCall[]): CodaroDocument | null {
  for (const toolCall of toolCalls) {
    const result = toolCall.result;
    if (!isRecord(result)) continue;
    const document = normalizeDocumentPayload(result.document, {
      fallbackIdPrefix: "tool",
      fallbackTitle: "Codaro 노트북",
    });
    if (document) return document;
  }
  return null;
}

export function collectBlocksFromToolCalls(toolCalls: AiToolCall[]): BlockConfig[] {
  const generatedBlocks = toolCalls.flatMap((toolCall, index) => blocksFromToolCall(toolCall, index));
  const seenIds = new Set<string>();
  return generatedBlocks.filter((block) => {
    if (seenIds.has(block.id)) return false;
    seenIds.add(block.id);
    return true;
  });
}

function blocksFromToolCall(toolCall: AiToolCall, index: number): BlockConfig[] {
  const name = toolCallName(toolCall);
  const args = toolCallArguments(toolCall);
  if (!isRecord(args)) return [];

  if (name === "generate-notebook" && Array.isArray(args.blocks)) {
    return args.blocks
      .filter(isRecord)
      .map((block, blockIndex) =>
        createBlock(
          normalizeBlockType(String(block.type ?? "markdown")),
          String(block.content ?? ""),
          `gen-${index}-${blockIndex}`,
        ),
      );
  }

  if (name === "create-notebook-exercise" && Array.isArray(args.stages)) {
    const title = String(args.title ?? "생성된 연습");
    const blocks: BlockConfig[] = [createBlock("markdown", `## ${title}`, `exercise-${index}-title`)];
    args.stages.filter(isRecord).forEach((stage, stageIndex) => {
      blocks.push(createBlock("markdown", `### ${stage.stage ?? "단계"}\n\n${stage.instruction ?? ""}`, `exercise-${index}-${stageIndex}-guide`));
      blocks.push(createBlock("code", String(stage.starterCode ?? ""), `exercise-${index}-${stageIndex}-code`));
    });
    return blocks;
  }

  if (name === "create-learning-card") {
    return [
      createBlock("markdown", `## ${args.topic ?? "학습 카드"}\n\n${args.explanation ?? ""}`, `card-${index}-md`),
      createBlock("code", String(args.exampleCode ?? ""), `card-${index}-example`),
      createBlock("code", String(args.fillBlankCode ?? ""), `card-${index}-practice`),
    ];
  }

  if (name === "create-guide") {
    return [
      createBlock("markdown", `## 실습\n\n${args.description ?? ""}`, `guide-${index}-md`),
      createBlock("code", String(args.content ?? ""), `guide-${index}-code`),
    ];
  }

  if (name === "insert-block") {
    return [
      createBlock(
        normalizeBlockType(String(args.blockType ?? "markdown")),
        String(args.content ?? ""),
        `insert-${index}`,
      ),
    ];
  }

  return [];
}

function createBlock(type: BlockConfig["type"], content: string, prefix: string): BlockConfig {
  return {
    id: `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type,
    content,
  };
}

function toolCallName(toolCall: AiToolCall) {
  return toolCall.name ?? toolCall.function?.name ?? String(toolCall.toolCallId ?? toolCall.id ?? "tool-call");
}

function toolCallArguments(toolCall: AiToolCall): unknown {
  if (toolCall.arguments) return toolCall.arguments;
  const raw = toolCall.function?.arguments;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}
