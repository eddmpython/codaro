import type {
  AssistantMessage,
  AssistantWorkStep,
} from "@/lib/assistantTypes";
import type {
  AiChatResponse,
  AiToolCall,
  AiTracePolicyViolation,
  AiTraceSummary,
} from "@/types";

export type AssistantTraceSummary = AiTraceSummary;

export function createComposeStep(): AssistantWorkStep {
  return { id: "compose", label: "요청 분석", status: "running", startedAt: Date.now() };
}

export function withToolStartStep(steps: AssistantWorkStep[] | undefined, toolCall: AiToolCall): AssistantWorkStep[] {
  const base = steps?.length ? steps : [createComposeStep()];
  const toolStep = assistantWorkStepFromToolCall(toolCall, "running");
  return [
    ...base
      .filter((step) => step.id !== toolStep.id)
      .map((step) => step.status === "running" ? { ...step, status: "done" as const, finishedAt: step.finishedAt ?? Date.now() } : step),
    toolStep,
  ];
}

export function withToolWorkStep(steps: AssistantWorkStep[] | undefined, toolCalls: NonNullable<AssistantMessage["toolCalls"]>): AssistantWorkStep[] {
  const base = steps?.length ? steps : [createComposeStep()];
  const next = [...base];
  for (const toolCall of toolCalls) {
    const toolStep = assistantWorkStepFromToolCall(toolCall, toolCall.status === "error" ? "error" : "done");
    const existingIndex = next.findIndex((step) => step.id === toolStep.id);
    if (existingIndex >= 0) {
      next[existingIndex] = {
        ...next[existingIndex],
        ...toolStep,
        startedAt: next[existingIndex].startedAt ?? toolStep.startedAt,
      };
    } else {
      next.push(toolStep);
    }
  }
  return next.map((step) => (
    step.status === "running" && step.id === "compose"
      ? { ...step, status: "done" as const, finishedAt: step.finishedAt ?? Date.now() }
      : step
  ));
}

export function finishAssistantSteps(steps: AssistantWorkStep[] | undefined, toolCalls: NonNullable<AssistantMessage["toolCalls"]>): AssistantWorkStep[] {
  return withToolWorkStep(steps, toolCalls).map((step) => (
    step.status === "running" ? { ...step, status: "done" as const } : step
  ));
}

export function finishAssistantWorkLoop({
  response,
  steps,
}: {
  response: AiChatResponse;
  steps: AssistantWorkStep[] | undefined;
}): {
  steps?: AssistantWorkStep[];
  trace?: AssistantTraceSummary;
} {
  const trace = normalizeAssistantTrace(response.trace);
  const toolSteps = response.toolCalls.length ? finishAssistantSteps(steps, response.toolCalls) : undefined;
  return {
    steps: withTracePolicySteps(toolSteps ?? steps, trace) ?? toolSteps,
    trace,
  };
}

export function markAssistantStepsError(steps: AssistantWorkStep[] | undefined): AssistantWorkStep[] {
  const base = steps?.length ? steps : [createComposeStep()];
  return base.map((step) => step.status === "running" ? { ...step, status: "error" as const } : step);
}

export function normalizeAssistantTrace(trace: AiChatResponse["trace"]): AssistantTraceSummary | undefined {
  if (!trace) return undefined;
  const normalized: AssistantTraceSummary = {};
  if (typeof trace.traceId === "string" && trace.traceId) normalized.traceId = trace.traceId;
  if (typeof trace.conversationId === "string" && trace.conversationId) normalized.conversationId = trace.conversationId;
  if (typeof trace.elapsedMs === "number") normalized.elapsedMs = trace.elapsedMs;
  if (typeof trace.eventCount === "number") normalized.eventCount = trace.eventCount;
  if (typeof trace.toolCount === "number") normalized.toolCount = trace.toolCount;
  if (typeof trace.errorCount === "number") normalized.errorCount = trace.errorCount;
  if (typeof trace.policyViolationCount === "number") normalized.policyViolationCount = trace.policyViolationCount;
  const policyViolations = normalizeTracePolicyViolations(trace.policyViolations);
  if (policyViolations.length) normalized.policyViolations = policyViolations;
  if (Array.isArray(trace.toolSequence)) {
    const toolSequence = trace.toolSequence.filter((item): item is string => typeof item === "string");
    if (toolSequence.length) normalized.toolSequence = toolSequence;
  }
  return Object.keys(normalized).length ? normalized : undefined;
}

function normalizeTracePolicyViolations(value: unknown): AiTracePolicyViolation[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeTracePolicyViolation(item))
    .filter((item): item is AiTracePolicyViolation => Boolean(item));
}

function normalizeTracePolicyViolation(value: unknown): AiTracePolicyViolation | undefined {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  const policyCode = stringField(item.policyCode) || stringField(item.policy);
  const toolName = stringField(item.toolName) || stringField(item.tool);
  const message = stringField(item.message) || stringField(item.error);
  if (!policyCode && !toolName && !message) return undefined;
  return { policyCode, toolName, message };
}

function stringField(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function withTracePolicySteps(
  steps: AssistantWorkStep[] | undefined,
  trace: AssistantTraceSummary | undefined,
): AssistantWorkStep[] | undefined {
  const policyViolations = tracePolicyViolations(trace);
  if (!policyViolations.length) return undefined;

  const next = (steps ?? []).map((step) => (
    step.status === "running" ? { ...step, status: "done" as const, finishedAt: step.finishedAt ?? Date.now() } : step
  ));
  policyViolations.forEach((violation, index) => {
    const matchingToolIndex = next.findIndex((step) => step.toolName === violation.toolName);
    if (matchingToolIndex >= 0) {
      next[matchingToolIndex] = {
        ...next[matchingToolIndex],
        status: "error",
        detail: policyViolationDetail(violation, next[matchingToolIndex].detail),
        error: violation.message || next[matchingToolIndex].error,
        policyCode: violation.policyCode,
        finishedAt: next[matchingToolIndex].finishedAt ?? Date.now(),
      };
      return;
    }
    next.push(policyViolationStep(violation, index));
  });
  return next;
}

function policyViolationStep(violation: AiTracePolicyViolation, index: number): AssistantWorkStep {
  const now = Date.now();
  return {
    id: `policy-${index}-${policyStepIdPart(violation.policyCode || violation.toolName || "violation")}`,
    label: "도구 정책 확인",
    status: "error",
    detail: policyViolationDetail(violation),
    error: violation.message,
    policyCode: violation.policyCode,
    startedAt: now,
    finishedAt: now,
  };
}

function policyViolationDetail(violation: AiTracePolicyViolation, existingDetail?: string) {
  const details = existingDetail
    ? [existingDetail, violation.policyCode, violation.message]
    : [violation.toolName, violation.policyCode, violation.message];
  return details.filter(Boolean).join(" · ");
}

function tracePolicyViolations(trace: AssistantTraceSummary | undefined): AiTracePolicyViolation[] {
  if (!trace) return [];
  if (trace.policyViolations?.length) return trace.policyViolations;
  const count = trace.policyViolationCount ?? 0;
  if (count < 1) return [];
  return [
    {
      policyCode: "policy-violation",
      toolName: "",
      message: `도구 정책 확인 필요 ${count}건`,
    },
  ];
}

function policyStepIdPart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "violation";
}

function assistantWorkStepFromToolCall(toolCall: AiToolCall, status: AssistantWorkStep["status"]): AssistantWorkStep {
  const name = toolCallName(toolCall);
  return {
    id: toolStepId(toolCall),
    label: stringField(toolCall.workLabel) || workLabelFromToolCall(toolCall, name),
    status,
    detail: stringField(toolCall.workDetail) || toolCallDetail(toolCall, name),
    toolName: name,
    arguments: toolCallArguments(toolCall),
    result: toolCall.result,
    error: toolCall.error,
    traceId: toolCall.traceId,
    traceEventIndex: toolCall.traceEventIndex,
    turnElapsedMs: toolCall.turnElapsedMs,
    category: toolCall.category,
    lane: toolCall.lane,
    target: toolCall.target,
    risk: toolCall.risk,
    startedAt: Date.now(),
    finishedAt: status === "running" ? undefined : Date.now(),
  };
}

function toolStepId(toolCall: AiToolCall) {
  return `tool-${toolCall.toolCallId ?? toolCall.id ?? toolCallName(toolCall)}`;
}

function toolCallName(toolCall: AiToolCall) {
  return toolCall.name ?? toolCall.function?.name ?? String(toolCall.toolCallId ?? toolCall.id ?? "tool-call");
}

function toolCallArguments(toolCall: AiToolCall) {
  if (toolCall.arguments) return toolCall.arguments;
  const raw = toolCall.function?.arguments;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { raw };
  }
}

function workLabelFromToolCall(toolCall: AiToolCall, name: string) {
  switch (name) {
    case "write-curriculum-yaml":
      return "커리큘럼 YAML 전개";
    case "packages-check":
      return "라이브러리 확인";
    case "packages-install":
      return "uv 라이브러리 설치";
    case "create-notebook-exercise":
      return "실습 구성";
    case "insert-block":
    case "write-cell":
      return "노트북 셀 작성";
    case "read-cells":
      return "노트북 셀 읽기";
    case "cell-call":
      return "셀 실행/검증";
    case "execute-reactive":
      return "셀 실행";
    case "get-variables":
      return "변수 확인";
    case "click-element":
    case "type-text":
      return "화면 자동화";
  }
  switch (toolCall.lane) {
    case "curriculum":
      return "커리큘럼 구성";
    case "read":
      return "상태 확인";
    case "write":
      return "내용 반영";
    case "cell-call":
      return "셀 요청";
    case "progress":
      return "진도 기록";
    case "automation":
      return "자동화 처리";
    case "safety":
      return "안전 확인";
    default:
      return "작업 결과";
  }
}

function toolCallDetail(toolCall: AiToolCall, name: string) {
  const args = toolCallArguments(toolCall);
  const specific = toolSpecificDetail(name, args);
  return [specific, toolCall.target, toolCall.risk && toolCall.risk !== "normal" ? toolCall.risk : null]
    .filter(Boolean)
    .join(" · ");
}

function toolSpecificDetail(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "write-curriculum-yaml":
      return textArg(args, "title") || "YAML을 섹션 카드와 실행 셀로 변환";
    case "packages-check":
      return listArg(args, "names").length
        ? `${listArg(args, "names").join(", ")} 설치 여부 확인`
        : "필요한 패키지 설치 여부 확인";
    case "packages-install":
      return textArg(args, "name") ? `${textArg(args, "name")}를 uv로 설치` : "누락 패키지를 uv로 설치";
    case "write-cell":
      return textArg(args, "blockId") ? `${textArg(args, "blockId")} 셀 내용 반영` : "셀 내용 반영";
    case "insert-block":
      return textArg(args, "anchorBlockId") ? `${textArg(args, "anchorBlockId")} 주변에 셀 추가` : "새 셀 추가";
    case "read-cells":
      return "현재 노트북 구조와 셀 역할 확인";
    case "cell-call":
      return textArg(args, "blockId") ? `${textArg(args, "blockId")} 실행 또는 검증` : "셀 실행 또는 검증";
    case "execute-reactive":
      return textArg(args, "blockId") ? `${textArg(args, "blockId")}부터 의존 셀 재실행` : "의존 셀 재실행";
    case "get-variables":
      return "현재 런타임 변수 확인";
    default:
      return name;
  }
}

function textArg(args: Record<string, unknown>, key: string) {
  const value = args[key];
  return typeof value === "string" ? value : "";
}

function listArg(args: Record<string, unknown>, key: string) {
  const value = args[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
