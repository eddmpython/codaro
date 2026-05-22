import { teacherScopeLabel, type TeacherScope } from "@/lib/teacherScope";
import { stringifyData } from "@/lib/displayFormat";
import { getActiveLocale, translate } from "@/lib/localeCopy";
import type { AppNotice, BlockConfig, ExecutionResult, VariableInfo } from "@/types";

export type LocalAssistantDraft = {
  clearPendingBlocks: boolean;
  generatedBlocks: BlockConfig[];
  shouldSaveCurriculum: boolean;
};

export function buildLocalAssistantDraft(message: string, scope: TeacherScope): LocalAssistantDraft {
  const generatedBlocks = scope === "cell" ? [] : buildLocalBlocksFromPrompt(message, scope);
  return {
    clearPendingBlocks: generatedBlocks.length > 0 && scope !== "cell",
    generatedBlocks,
    shouldSaveCurriculum: generatedBlocks.length > 0 && scope !== "cell",
  };
}

export function completeLocalAssistantDraft({
  draft,
  message,
  now = Date.now(),
  savedTitle,
  scope,
}: {
  draft: LocalAssistantDraft;
  message: string;
  now?: number;
  savedTitle?: string;
  scope: TeacherScope;
}): {
  assistantMessage: {
    id: string;
    role: "assistant";
    content: string;
    provider: string;
    model: string;
  };
  notice: AppNotice;
} {
  const blockCount = draft.generatedBlocks.length;
  const saved = Boolean(savedTitle);
  return {
    assistantMessage: {
      id: `assistant-preview-${now}`,
      role: "assistant",
      content: buildLocalAssistantAnswer(message, scope, blockCount, saved),
      provider: translate("provider.fallbackMode"),
      model: translate("provider.fallbackMode"),
    },
    notice: {
      tone: blockCount ? "success" : "default",
      title: saved ? translate("local.curriculumSaved") : blockCount ? translate("local.curriculumDraftReady") : translate("local.aiAnswerDone"),
      detail: savedTitle ?? (blockCount ? translate("local.cellsGenerated", { count: blockCount }) : translate("local.cellGuideReady")),
    },
  };
}

export function buildLocalBlocksFromPrompt(message: string, scope: TeacherScope): BlockConfig[] {
  const topic = inferLocalTopic(message);
  const seed = `${Date.now()}-${slugifyText(topic)}`;
  const scopeLine = scope === "cell"
    ? "선택한 셀에서 시작해 작은 실습 단계로 확장합니다."
    : scope === "lesson"
      ? "현재 레슨을 집중 학습 흐름으로 다시 구성합니다."
      : "셀로 전개할 수 있는 커리큘럼 개요를 초안화합니다.";

  return [
    {
      id: `local-${seed}-goal`,
      type: "markdown",
      content: `# ${topic}\n\n${scopeLine}\n\nCodaro는 먼저 학습 흐름을 설계하고, 검토 가능한 학습 셀로 전개합니다.`,
      displayKind: "hero",
      role: "title",
      sourceType: "intro",
      title: topic,
      payload: {
        title: topic,
        description: scopeLine,
        points: [
          "학습 목표를 먼저 잡습니다.",
          "실행 가능한 실습 셀을 만듭니다.",
          "검증 셀로 답을 확인합니다.",
        ],
      },
    },
    {
      id: `local-${seed}-concept`,
      type: "markdown",
      content: "## 개념\n\n- 학습자 목표를 정의합니다.\n- 실행 가능한 예제 하나를 만듭니다.\n- 학습자가 답을 확인할 수 있도록 검증 셀을 추가합니다.",
      displayKind: "cardGrid",
      role: "learning",
      sourceType: "featureCards",
      title: "학습 흐름",
      payload: {
        title: "학습 흐름",
        cards: [
          { title: "목표", description: "무엇을 익힐지 한 문장으로 고정합니다." },
          { title: "실습", description: "작은 코드를 직접 수정하고 실행합니다." },
          { title: "검증", description: "출력과 상태를 기준으로 답을 확인합니다." },
        ],
      },
    },
    {
      id: `local-${seed}-practice`,
      type: "code",
      content: `topic = "${topic}"\nprint(f"실습: {topic}")\n# 이 줄을 바꾼 뒤 셀을 다시 실행하세요.`,
      displayKind: "code",
      role: "exercise",
      sourceType: "expansion",
      title: "직접 실습",
      guide: {
        exerciseType: "practice",
        hints: ["먼저 셀을 실행하세요.", "topic 텍스트를 바꿔 보세요.", "수정 후 검증 셀을 사용하세요."],
        checkConfig: {},
        difficulty: "easy",
        solution: `topic = "${topic}"\nprint(f"실습: {topic}")`,
        description: "생성된 실습 셀을 편집하고 실행합니다.",
        studentAnswer: "",
      },
    },
    {
      id: `local-${seed}-check`,
      type: "code",
      content: "assert topic\nprint(\"검증 통과\")",
      displayKind: "code",
      role: "check",
      sourceType: "quiz",
      title: "답 확인",
      guide: {
        exerciseType: "check",
        hints: ["topic 변수는 비어 있으면 안 됩니다."],
        checkConfig: {},
        difficulty: "easy",
        solution: "assert topic\nprint(\"검증 통과\")",
        description: "실습 상태를 검증합니다.",
        studentAnswer: "",
      },
    },
  ];
}

export function buildLocalAssistantAnswer(message: string, scope: TeacherScope, blockCount: number, saved = false) {
  const locale = getActiveLocale();
  const topic = inferLocalTopic(message);
  const scopeLabel = teacherScopeLabel(scope);
  if (locale === "en") {
    if (scope === "cell") {
      const cellSubject = /선택한|셀 내용|cell/i.test(message) ? "the selected cell" : topic;
      return [
        "Local guide mode is active, so I can only show a short learning direction.",
        `This is cell-level guidance for ${cellSubject}.`,
        "Read and run the selected cell, then compare its output against the expected learning goal.",
        "Connect a provider to continue with explanations, hints, and validation based on the current cell and execution result.",
      ].join("\n\n");
    }
    return [
      "Local guide mode is active, so I can only prepare a compact curriculum draft.",
      `I drafted a ${scope} notebook for ${topic}.`,
      saved
        ? `Saved ${blockCount} learning cells to My Curriculum and opened the curriculum surface.`
        : `${blockCount} learning cells are ready for review. Apply them to save them to My Curriculum and open the curriculum surface.`,
      "Connect a provider to adjust the draft through chat and continue by reading or editing only the cells that matter.",
    ].join("\n\n");
  }
  if (scope === "cell") {
    const cellSubject = /선택한|셀 내용|cell/i.test(message) ? "선택한 셀" : topic;
    return [
      "기본 안내 모드라 간단한 학습 방향만 표시합니다.",
      `${cellSubject}에 대한 ${scopeLabel} 안내입니다.`,
      "선택한 셀을 읽고 실행한 뒤, 출력을 기대 학습 목표와 비교하세요.",
      "provider를 연결하면 현재 셀과 실행 결과를 바탕으로 설명, 힌트, 검증을 이어갑니다.",
    ].join("\n\n");
  }
  return [
    "기본 안내 모드라 간단한 커리큘럼 초안만 표시합니다.",
    `${topic}용 ${scopeLabel} 노트북을 초안화했습니다.`,
    saved
      ? `${blockCount}개 학습 셀을 나만의 커리큘럼에 저장했고 커리큘럼 화면에서 열었습니다.`
      : `${blockCount}개 학습 셀을 검토할 수 있습니다. 적용하면 나만의 커리큘럼에 저장되고 커리큘럼 화면에서 열립니다.`,
    "provider를 연결하면 커리큘럼 초안을 대화로 조정하고, 필요한 셀만 읽고 고치며 학습 흐름을 이어갑니다.",
  ].join("\n\n");
}

export function buildLocalExecutionResult(block: BlockConfig, code: string, executionCount: number): ExecutionResult {
  const assignmentMap = collectAssignments(code);
  const stdout = extractStdout(code, assignmentMap);
  const variables = extractVariables(code);
  return {
    type: "text",
    blockId: block.id,
    data: stdout,
    stdout,
    stderr: "",
    variables,
    stateDelta: {
      added: variables,
      updated: [],
      removed: [],
    },
    executionCount,
    status: "success",
  };
}

export function firstOutputLine(result: ExecutionResult) {
  return (result.stderr || result.stdout || stringifyData(result.data)).split("\n").find(Boolean) ?? "";
}

function extractStdout(code: string, assignmentMap: Record<string, string>) {
  const printMatches = [...code.matchAll(/print\(([^)]*)\)/g)];
  if (!printMatches.length) return translate("runtime.localDone");
  return printMatches
    .map((match) => {
      const raw = match[1].trim();
      const text = raw.replace(/^f?["']|["']$/g, "");
      return text.replace(/\{([A-Za-z_]\w*)\}/g, (_, name: string) => assignmentMap[name] ?? name).trim();
    })
    .filter(Boolean)
    .join("\n");
}

function collectAssignments(code: string) {
  return Object.fromEntries(
    [...code.matchAll(/^\s*([A-Za-z_]\w*)\s*=\s*(.+)$/gm)].map((match) => [
      match[1],
      match[2].trim().replace(/^["']|["']$/g, ""),
    ]),
  );
}

function extractVariables(code: string): VariableInfo[] {
  return [...code.matchAll(/^\s*([A-Za-z_]\w*)\s*=\s*(.+)$/gm)]
    .slice(0, 12)
    .map((match) => ({
      name: match[1],
      typeName: inferTypeName(match[2]),
      repr: match[2].trim().slice(0, 80),
    }));
}

function inferTypeName(value: string) {
  const trimmed = value.trim();
  if (/^["']/.test(trimmed)) return "str";
  if (/^\d+(\.\d+)?$/.test(trimmed)) return trimmed.includes(".") ? "float" : "int";
  if (/^\[/.test(trimmed)) return "list";
  if (/^\{/.test(trimmed)) return "dict";
  return "object";
}

function inferLocalTopic(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();
  if (/아무거나|해보자|시작|처음|입문/i.test(normalized)) return "파이썬 print와 변수";
  if (/browser|브라우저/i.test(normalized)) return "브라우저 자동화 루틴";
  if (/pandas/i.test(normalized)) return "Pandas 실습 레슨";
  if (/automation|routine|task|workflow|자동화|루틴|태스크|업무/i.test(normalized)) return "자동화 노트북";
  if (/curriculum|커리큘럼/i.test(normalized)) return "학습 커리큘럼";
  return normalized.slice(0, 48) || "Codaro 노트북";
}

function slugifyText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}
