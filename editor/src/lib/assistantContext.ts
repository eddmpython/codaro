import { blockLabel, executionKindLabel } from "@/lib/cellModel";
import { inferAssistantPackages } from "@/lib/packageInference";
import type { BlockConfig, CodaroDocument, ExecutionResult } from "@/types";

export type ResultMap = Record<string, ExecutionResult>;

export function buildAssistantContext({
  activeScope,
  currentResult,
  document,
  drafts,
  message,
  results,
  selectedBlock,
  surface,
  tools,
  variables,
}: {
  activeScope: string;
  currentResult: ExecutionResult | null;
  document: CodaroDocument;
  drafts: Record<string, string>;
  message: string;
  results: ResultMap;
  selectedBlock: BlockConfig | null;
  surface: string;
  tools: Array<{ name: string; category: string; lane?: string; target?: string; risk: string }>;
  variables: unknown[];
}) {
  return {
    surface,
    teacherScope: activeScope,
    document: {
      id: document.id,
      title: document.title,
      blocks: document.blocks.slice(0, 24).map((block) => ({
        id: block.id,
        type: block.type,
        role: block.role,
        displayKind: block.displayKind,
        executionKind: block.executionKind,
        title: blockLabel(block),
        content: block.content,
      })),
    },
    selectedBlock: selectedBlock
      ? {
          id: selectedBlock.id,
          type: selectedBlock.type,
          content: drafts[selectedBlock.id] ?? selectedBlock.content,
          result: currentResult
            ? {
                status: currentResult.status,
                stdout: currentResult.stdout,
                stderr: currentResult.stderr,
                data: currentResult.data,
              }
            : null,
        }
      : null,
    variables: variables.slice(0, 24),
    cellMap: buildCellMap(document, drafts, results),
    dependencyPreflight: buildDependencyPreflight(message, document),
    tools,
    instruction:
      `채팅 우선 노트북 생성을 기본으로 한다. 현재 판단 범위는 ${activeScope}이다. 학습 요청은 커리큘럼 YAML을 먼저 초안화하고 write-curriculum-yaml로 셀을 전개한 뒤 read-cells, write-cell, cell-call로 셀 단위 작업을 수행한다. 외부 패키지가 필요한 셀은 packages-check로 확인한 뒤 없으면 packages-install을 먼저 호출한다. 셀 수정 전에는 cellMap의 role/displayKind/executionKind/purpose를 보고 설명/스니펫/실습/검증 셀 중 올바른 대상만 수정한다.`,
  };
}

export function buildCellMap(document: CodaroDocument, drafts: Record<string, string>, results: ResultMap) {
  return document.blocks.map((block, index) => {
    const content = drafts[block.id] ?? block.content;
    return {
      index: index + 1,
      id: block.id,
      type: block.type,
      role: block.role ?? (block.type === "code" ? "snippet" : "explanation"),
      displayKind: block.displayKind ?? (block.type === "code" ? "code" : "prose"),
      executionKind: block.type === "code" ? executionKindLabel(block.executionKind) : null,
      title: blockLabel(block),
      sourceType: block.sourceType ?? null,
      purpose: cellPurpose(block),
      canRun: block.type === "code",
      draftEmpty: block.type === "code" ? !content.trim() : false,
      resultStatus: results[block.id]?.status ?? null,
      lineCount: content.split("\n").filter((line) => line.trim()).length,
    };
  });
}

export function cellPurpose(block: BlockConfig) {
  if (block.role === "title" || block.displayKind === "hero" || block.displayKind === "title") return "학습 흐름의 제목과 목표를 보여준다.";
  if (block.role === "snippet") return "학습자가 따라 칠 예제 스니펫을 보여준다.";
  if (block.role === "exercise" || block.displayKind === "practice") return "학습자가 직접 수정하거나 작성하는 실습 셀이다.";
  if (block.role === "check" || block.displayKind === "quiz") return "학습자의 답이나 실행 결과를 검증하는 셀이다.";
  if (block.role === "visual" || block.displayKind === "media" || block.displayKind === "cardGrid") return "개념을 시각적으로 정리하는 학습 카드다.";
  if (block.role === "automation" || block.executionKind === "browser" || block.executionKind === "os") return "자동화 작업을 실행하거나 준비하는 셀이다.";
  if (block.type === "code") return "실행 가능한 코드 셀이다.";
  return "설명과 개념을 읽기 좋게 정리하는 셀이다.";
}

export function buildDependencyPreflight(message: string, document: CodaroDocument) {
  const packages = inferRequiredPackages(message, document);
  return {
    policy: "필요한 외부 라이브러리는 실행 셀 작성 또는 실행 전에 packages-check로 확인하고, missing이면 packages-install을 먼저 호출한다.",
    packages,
    checkTool: "packages-check",
    installTool: "packages-install",
    beginnerCopy: "학습자에게는 패키지 설치 대신 필요한 도구를 준비 중이라고 설명한다.",
  };
}

export function inferRequiredPackages(message: string, document: CodaroDocument) {
  return inferAssistantPackages(message, document);
}
