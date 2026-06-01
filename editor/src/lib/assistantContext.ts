import { blockLabel, executionKindLabel } from "@/lib/cellModel";
import { aiLanguageInstruction, type AppLocale } from "@/lib/localeCopy";
import { inferAssistantPackages } from "@/lib/packageInference";
import type { BlockConfig, CodaroDocument, ExecutionResult } from "@/types";

export type ResultMap = Record<string, ExecutionResult>;

export function buildAssistantContext({
  activeScope,
  currentResult,
  displayLocale,
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
  displayLocale: AppLocale;
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
    displayLocale,
    responseLanguage: displayLocale === "en" ? "English" : "Korean",
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
    cellMap: buildCellMap(document, drafts, results, displayLocale),
    dependencyPreflight: buildDependencyPreflight(message, document, displayLocale),
    tools,
    instruction: assistantProcedureInstruction(activeScope, displayLocale),
  };
}

function assistantProcedureInstruction(activeScope: string, locale: AppLocale) {
  if (activeScope === "automation") {
    if (locale === "en") {
      return `${aiLanguageInstruction(locale)} Prefer a chat-first automation authoring workflow. Current decision scope: automation. Inspect the current document with read-cells, then create a percent-format recipe with write-automation-recipe and an automation cell. Keep the first execution in dry-run mode, use packages-check before running code that needs external packages, validate with cell-call, and only register a task after the recipe is validated. Do not turn automation authoring requests into curriculum YAML.`;
    }
    return `${aiLanguageInstruction(locale)} 채팅 우선 자동화 작성 흐름을 기본으로 한다. 현재 판단 범위는 automation이다. read-cells로 현재 문서를 확인한 뒤 write-automation-recipe로 percent-format recipe와 automation 셀을 만든다. 첫 실행은 dry-run으로 두고, 외부 패키지가 필요하면 packages-check를 먼저 호출하며, cell-call로 검증한 뒤 검증된 recipe만 task로 등록한다. 자동화 작성 요청을 커리큘럼 YAML로 바꾸지 않는다.`;
  }
  if (locale === "en") {
    return `${aiLanguageInstruction(locale)} Prefer a chat-first learning workflow. Current decision scope: ${activeScope}. For learning requests, first call resolve-learning-goal, then search-curricula, then compose-master-plan to recommend or combine existing lessons. Only call write-curriculum-yaml when compose-master-plan shows a real gap that existing lessons do not cover; materialize that gap into Current Learning before working cell-by-cell with read-cells, write-cell, and cell-call. Before writing or running cells that need external packages, use packages-check and call packages-install first when any package is missing. Before editing cells, use cellMap role/displayKind/executionKind/purpose and edit only the right explanation, snippet, practice, or check cell.`;
  }
  return `${aiLanguageInstruction(locale)} 채팅 우선 학습 흐름을 기본으로 한다. 현재 판단 범위는 ${activeScope}이다. 학습 요청은 먼저 resolve-learning-goal, search-curricula, compose-master-plan 순서로 기존 레슨을 추천하거나 조합한다. compose-master-plan이 기존 레슨으로 덮지 못하는 실제 gap을 보여줄 때만 write-curriculum-yaml로 그 gap을 현재 학습에 전개한 뒤 read-cells, write-cell, cell-call로 셀 단위 작업을 수행한다. 외부 패키지가 필요한 셀은 packages-check로 확인한 뒤 없으면 packages-install을 먼저 호출한다. 셀 수정 전에는 cellMap의 role/displayKind/executionKind/purpose를 보고 설명/스니펫/실습/검증 셀 중 올바른 대상만 수정한다.`;
}

export function buildCellMap(
  document: CodaroDocument,
  drafts: Record<string, string>,
  results: ResultMap,
  locale: AppLocale = "ko",
) {
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
      purpose: cellPurpose(block, locale),
      canRun: block.type === "code",
      draftEmpty: block.type === "code" ? !content.trim() : false,
      resultStatus: results[block.id]?.status ?? null,
      lineCount: content.split("\n").filter((line) => line.trim()).length,
    };
  });
}

export function cellPurpose(block: BlockConfig, locale: AppLocale = "ko") {
  const en = locale === "en";
  if (block.role === "title" || block.displayKind === "hero" || block.displayKind === "title") return en ? "Shows the title and goal of the learning flow." : "학습 흐름의 제목과 목표를 보여준다.";
  if (block.role === "snippet") return en ? "Shows an example snippet the learner can type and adapt." : "학습자가 따라 칠 예제 스니펫을 보여준다.";
  if (block.role === "exercise" || block.displayKind === "practice") return en ? "An editable practice cell for the learner to modify or write." : "학습자가 직접 수정하거나 작성하는 실습 셀이다.";
  if (block.role === "check" || block.displayKind === "quiz") return en ? "Checks the learner's answer or execution result." : "학습자의 답이나 실행 결과를 검증하는 셀이다.";
  if (block.role === "visual" || block.displayKind === "media" || block.displayKind === "cardGrid") return en ? "Organizes the concept visually as a learning card or media block." : "개념을 시각적으로 정리하는 학습 카드다.";
  if (block.role === "automation" || block.executionKind === "browser" || block.executionKind === "os") return en ? "Runs or prepares automation work." : "자동화 작업을 실행하거나 준비하는 셀이다.";
  if (block.type === "code") return en ? "An executable code cell." : "실행 가능한 코드 셀이다.";
  return en ? "A prose cell that explains concepts in context." : "설명과 개념을 읽기 좋게 정리하는 셀이다.";
}

export function buildDependencyPreflight(message: string, document: CodaroDocument, locale: AppLocale = "ko") {
  const packages = inferRequiredPackages(message, document);
  const en = locale === "en";
  return {
    policy: en
      ? "Before writing or running cells that require external libraries, use packages-check and call packages-install first when any package is missing."
      : "필요한 외부 라이브러리는 실행 셀 작성 또는 실행 전에 packages-check로 확인하고, missing이면 packages-install을 먼저 호출한다.",
    packages,
    checkTool: "packages-check",
    installTool: "packages-install",
    beginnerCopy: en
      ? "Tell the learner that Codaro is preparing the required tools instead of focusing on package installation details."
      : "학습자에게는 패키지 설치 대신 필요한 도구를 준비 중이라고 설명한다.",
  };
}

export function inferRequiredPackages(message: string, document: CodaroDocument) {
  return inferAssistantPackages(message, document);
}
