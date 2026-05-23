import type {
  AssistantMessage,
  AssistantWorkStep,
} from "@/lib/assistantTypes";
import { getActiveLocale } from "@/lib/localeCopy";
import type {
  AiChatResponse,
  AiTraceEvent,
  AiToolCall,
  AiTracePolicyViolation,
  AiTraceSummary,
  AiTraceWorkloopEvent,
} from "@/types";

export type AssistantTraceSummary = AiTraceSummary;

export function createComposeStep(): AssistantWorkStep {
  return { id: "compose", label: localText("Analyze request", "요청 분석"), status: "running", startedAt: Date.now() };
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
  const shouldKeepBaseSteps = response.toolCalls.length > 0 || hasTraceWorkloopSignal(trace);
  const toolSteps = response.toolCalls.length
    ? finishAssistantSteps(steps, response.toolCalls)
    : shouldKeepBaseSteps
      ? finishAssistantSteps(steps, [])
      : undefined;
  const traceSteps = withTraceWorkloopSteps(toolSteps, trace);
  const policySteps = withTracePolicySteps(traceSteps, trace);
  return {
    steps: policySteps ?? traceSteps,
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
  const workloop = normalizeTraceWorkloop(trace.workloop);
  if (workloop.length) normalized.workloop = workloop;
  const events = normalizeTraceEvents(trace.events);
  if (events.length) normalized.events = events;
  if (typeof trace.yamlContractObserved === "boolean") normalized.yamlContractObserved = trace.yamlContractObserved;
  return Object.keys(normalized).length ? normalized : undefined;
}

function normalizeTraceWorkloop(value: unknown): AiTraceWorkloopEvent[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeTraceWorkloopEvent(item))
    .filter((item): item is AiTraceWorkloopEvent => Boolean(item));
}

function normalizeTraceWorkloopEvent(value: unknown): AiTraceWorkloopEvent | undefined {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  const normalized: AiTraceWorkloopEvent = {};
  numberField(item.eventIndex, (value) => { normalized.eventIndex = value; });
  numberField(item.elapsedMs, (value) => { normalized.elapsedMs = value; });
  copyStringField(item, normalized, "eventType");
  copyStringField(item, normalized, "toolCallId");
  copyStringField(item, normalized, "toolName");
  copyStringField(item, normalized, "status");
  copyStringField(item, normalized, "category");
  copyStringField(item, normalized, "lane");
  copyStringField(item, normalized, "target");
  copyStringField(item, normalized, "risk");
  copyStringField(item, normalized, "provider");
  copyStringField(item, normalized, "diagnosticCode");
  copyStringField(item, normalized, "diagnosticAction");
  copyStringField(item, normalized, "workLabel");
  copyStringField(item, normalized, "workDetail");
  if (typeof item.error === "string" || item.error === null) normalized.error = item.error;
  return Object.keys(normalized).length ? normalized : undefined;
}

function normalizeTraceEvents(value: unknown): AiTraceEvent[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeTraceEvent(item))
    .filter((item): item is AiTraceEvent => Boolean(item));
}

function normalizeTraceEvent(value: unknown): AiTraceEvent | undefined {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  const normalized: AiTraceEvent = {};
  numberField(item.eventIndex, (value) => { normalized.eventIndex = value; });
  numberField(item.elapsedMs, (value) => { normalized.elapsedMs = value; });
  copyStringField(item, normalized, "eventType");
  if (item.payload && typeof item.payload === "object" && !Array.isArray(item.payload)) {
    normalized.payload = item.payload as Record<string, unknown>;
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

function copyStringField(source: Record<string, unknown>, target: Record<string, unknown>, key: string) {
  const value = source[key];
  if (typeof value === "string" && value) {
    target[key] = value;
  }
}

function numberField(value: unknown, assign: (value: number) => void) {
  if (typeof value === "number" && Number.isFinite(value)) {
    assign(value);
  }
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

function withTraceWorkloopSteps(
  steps: AssistantWorkStep[] | undefined,
  trace: AssistantTraceSummary | undefined,
): AssistantWorkStep[] | undefined {
  const traceSteps = traceWorkloopSteps(trace);
  if (!traceSteps.length) return steps;

  const next = (steps ?? []).map((step) => (
    step.status === "running" ? { ...step, status: "done" as const, finishedAt: step.finishedAt ?? Date.now() } : step
  ));
  for (const step of traceSteps) {
    const existingIndex = next.findIndex((item) => item.id === step.id);
    if (existingIndex >= 0) {
      next[existingIndex] = { ...next[existingIndex], ...step };
    } else {
      next.push(step);
    }
  }
  return next;
}

function traceWorkloopSteps(trace: AssistantTraceSummary | undefined): AssistantWorkStep[] {
  const workloop = trace?.workloop ?? [];
  return workloop
    .map((event, index) => traceWorkloopStep(event, index))
    .filter((step): step is AssistantWorkStep => Boolean(step));
}

function traceWorkloopStep(event: AiTraceWorkloopEvent, index: number): AssistantWorkStep | undefined {
  if (!shouldPromoteTraceWorkloopEvent(event)) return undefined;
  const now = Date.now();
  return {
    id: `trace-${event.eventIndex ?? index}-${policyStepIdPart(event.eventType || event.target || event.workLabel || "work")}`,
    label: event.workLabel || event.eventType || localText("Work", "작업"),
    status: traceWorkloopStatus(event),
    detail: traceWorkloopDetail(event),
    error: event.error,
    toolName: event.toolName,
    traceEventIndex: event.eventIndex,
    turnElapsedMs: event.elapsedMs,
    category: event.category,
    lane: event.lane,
    target: event.target,
    risk: event.risk,
    startedAt: now,
    finishedAt: now,
  };
}

function shouldPromoteTraceWorkloopEvent(event: AiTraceWorkloopEvent) {
  if (event.eventType === "tool-start" || event.eventType === "tool-result") return false;
  if (event.eventType === "tool-policy-violation") return false;
  if (event.toolCallId) return false;
  return Boolean(event.workLabel || event.eventType === "clarification-gate" || event.eventType === "turn-error");
}

function traceWorkloopStatus(event: AiTraceWorkloopEvent): AssistantWorkStep["status"] {
  if (event.error || event.status === "error") return "error";
  return "done";
}

function traceWorkloopDetail(event: AiTraceWorkloopEvent) {
  if (event.error && event.workDetail && event.error !== event.workDetail) {
    return `${event.workDetail} · ${event.error}`;
  }
  return event.error || event.workDetail;
}

function hasTraceWorkloopSignal(trace: AssistantTraceSummary | undefined) {
  if (!trace) return false;
  if ((trace.errorCount ?? 0) > 0) return true;
  if ((trace.policyViolationCount ?? 0) > 0 || Boolean(trace.policyViolations?.length)) return true;
  return (trace.workloop ?? []).some((event) => shouldPromoteTraceWorkloopEvent(event));
}

function policyViolationStep(violation: AiTracePolicyViolation, index: number): AssistantWorkStep {
  const now = Date.now();
  return {
    id: `policy-${index}-${policyStepIdPart(violation.policyCode || violation.toolName || "violation")}`,
    label: localText("Check tool policy", "도구 정책 확인"),
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
      message: localText(`Tool policy needs review: ${count}`, `도구 정책 확인 필요 ${count}건`),
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
    detail: toolCallDetail(toolCall, name) || stringField(toolCall.workDetail),
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
      return localText("Expand curriculum YAML", "커리큘럼 YAML 전개");
    case "packages-check":
      return localText("Check libraries", "라이브러리 확인");
    case "packages-install":
      return localText("Install uv libraries", "uv 라이브러리 설치");
    case "create-notebook-exercise":
      return localText("Build practice", "실습 구성");
    case "insert-block":
    case "write-cell":
      return localText("Write notebook cell", "노트북 셀 작성");
    case "read-cells":
      return localText("Read notebook cells", "노트북 셀 읽기");
    case "cell-call":
      return localText("Run/check cell", "셀 실행/검증");
    case "execute-reactive":
      return localText("Run cell", "셀 실행");
    case "get-variables":
      return localText("Inspect variables", "변수 확인");
    case "write-automation-recipe":
      return localText("Write automation recipe", "자동화 recipe 작성");
    case "create-automation-task":
      return localText("Register automation task", "자동화 태스크 등록");
    case "click-element":
    case "type-text":
      return localText("Screen automation", "화면 자동화");
  }
  switch (toolCall.lane) {
    case "curriculum":
      return localText("Build curriculum", "커리큘럼 구성");
    case "read":
      return localText("Check state", "상태 확인");
    case "write":
      return localText("Apply content", "내용 반영");
    case "cell-call":
      return localText("Cell request", "셀 요청");
    case "progress":
      return localText("Record progress", "진도 기록");
    case "automation":
      return localText("Handle automation", "자동화 처리");
    case "safety":
      return localText("Safety check", "안전 확인");
    default:
      return localText("Work result", "작업 결과");
  }
}

function toolCallDetail(toolCall: AiToolCall, name: string) {
  const args = toolCallArguments(toolCall);
  const resultDetail = toolResultDetail(toolCall.result, name, args);
  if (resultDetail) return resultDetail;
  const specific = toolSpecificDetail(name, args);
  return [specific, toolCall.target, toolCall.risk && toolCall.risk !== "normal" ? toolCall.risk : null]
    .filter(Boolean)
    .join(" · ");
}

function toolResultDetail(result: unknown, name: string, args: Record<string, unknown>) {
  if (!result || typeof result !== "object") return "";
  const payload = result as Record<string, unknown>;
  switch (name) {
    case "packages-check": {
      const missing = listArg(payload, "missing");
      if (missing.length) return localText(`Missing: ${missing.join(", ")}`, `${missing.join(", ")} 누락 확인`);
      const checked = listArg(args, "names");
      return checked.length
        ? localText(`${checked.join(", ")} ready`, `${checked.join(", ")} 준비됨`)
        : localText("Required packages ready", "필요 패키지 준비됨");
    }
    case "packages-install": {
      const packageName = textArg(payload, "package") || textArg(args, "name") || localText("package", "패키지");
      if (payload.success === false) {
        const message = firstLine(textArg(payload, "message") || textArg(payload, "error"));
        return message || localText(`${packageName} install failed`, `${packageName} 설치 실패`);
      }
      const environment = textArg(payload, "environment") || "project .venv";
      const installer = textArg(payload, "installer") || "uv";
      if (payload.skipped === true) return localText(`${packageName} already ready · ${environment}`, `${packageName} 이미 준비됨 · ${environment}`);
      if (payload.success === true) {
        const duration = typeof payload.durationMs === "number" ? ` · ${formatDuration(payload.durationMs)}` : "";
        return localText(`${packageName} installed · ${installer} · ${environment}${duration}`, `${packageName} 설치 완료 · ${installer} · ${environment}${duration}`);
      }
      return "";
    }
    case "cell-call": {
      const blockId = textArg(args, "blockId");
      if (payload.passed === true) return blockId ? localText(`${blockId} check passed`, `${blockId} 검증 통과`) : localText("Cell check passed", "셀 검증 통과");
      if (payload.passed === false) return blockId ? localText(`${blockId} check failed`, `${blockId} 검증 실패`) : localText("Cell check failed", "셀 검증 실패");
      const status = textArg(payload, "status");
      return status && blockId ? localText(`${blockId} run result · ${status}`, `${blockId} 실행 결과 · ${status}`) : "";
    }
    case "write-curriculum-yaml": {
      const title = textArg(payload, "title");
      const sectionCount = numberArg(payload, "sectionCount");
      const exerciseCellCount = numberArg(payload, "exerciseCellCount");
      const blockCount = numberArg(payload, "blockCount");
      const runtimePackageCount = numberArg(payload, "runtimePackageCount");
      const contractGapCount = numberArg(payload, "contractGapCount");
      const parts = [
        title,
        sectionCount !== undefined ? localText(`${sectionCount} section cards`, `섹션 카드 ${sectionCount}개`) : "",
        exerciseCellCount !== undefined ? localText(`${exerciseCellCount} practice cells`, `실습 셀 ${exerciseCellCount}개`) : "",
        exerciseCellCount === undefined && blockCount !== undefined ? localText(`${blockCount} learning cells`, `학습 셀 ${blockCount}개`) : "",
        runtimePackageCount !== undefined ? localText(`${runtimePackageCount} runtime packages`, `실행 패키지 ${runtimePackageCount}개`) : "",
        contractGapCount !== undefined && contractGapCount > 0 ? localText(`${contractGapCount} contract gaps`, `계약 gap ${contractGapCount}개`) : "",
        payload.loadedInEditor === true ? localText("Loaded in editor", "에디터 반영") : "",
      ].filter(Boolean);
      return parts.join(" · ");
    }
    case "write-automation-recipe": {
      const path = textArg(payload, "path");
      const blockId = textArg(payload, "blockId");
      const parts = [
        payload.saved === true && path ? localText(`Saved ${path}`, `${path} 저장`) : "",
        payload.saved !== true && payload.recipe ? localText("Recipe draft created", "recipe 초안 생성") : "",
        payload.loadedInEditor === true ? (blockId ? localText(`Loaded ${blockId} cell`, `${blockId} 셀 반영`) : localText("Loaded automation cell", "automation 셀 반영")) : "",
        payload.dryRunFirst === true ? localText("dry-run first", "dry-run 우선") : "",
      ].filter(Boolean);
      return parts.join(" · ");
    }
    case "create-automation-task": {
      const task = payload.task && typeof payload.task === "object" && !Array.isArray(payload.task)
        ? payload.task as Record<string, unknown>
        : {};
      const taskName = textArg(task, "name") || textArg(args, "name");
      const schedule = textArg(task, "schedule") || textArg(args, "schedule");
      const documentPath = textArg(payload, "documentPath") || textArg(task, "documentPath");
      return [
        taskName ? localText(`${taskName} registered`, `${taskName} 등록`) : localText("Task registered", "태스크 등록"),
        schedule,
        documentPath,
      ].filter(Boolean).join(" · ");
    }
    default:
      return "";
  }
}

function toolSpecificDetail(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "write-curriculum-yaml":
      return textArg(args, "title") || localText("Convert YAML into section cards and executable cells", "YAML을 섹션 카드와 실행 셀로 변환");
    case "packages-check":
      return listArg(args, "names").length
        ? localText(`Check whether ${listArg(args, "names").join(", ")} is installed`, `${listArg(args, "names").join(", ")} 설치 여부 확인`)
        : localText("Check required package installation", "필요한 패키지 설치 여부 확인");
    case "packages-install":
      return textArg(args, "name")
        ? localText(`Install ${textArg(args, "name")} with uv`, `${textArg(args, "name")}를 uv로 설치`)
        : localText("Install missing packages with uv", "누락 패키지를 uv로 설치");
    case "write-cell":
      return textArg(args, "blockId")
        ? localText(`Apply content to ${textArg(args, "blockId")}`, `${textArg(args, "blockId")} 셀 내용 반영`)
        : localText("Apply cell content", "셀 내용 반영");
    case "insert-block":
      return textArg(args, "anchorBlockId")
        ? localText(`Add cells near ${textArg(args, "anchorBlockId")}`, `${textArg(args, "anchorBlockId")} 주변에 셀 추가`)
        : localText("Add new cell", "새 셀 추가");
    case "read-cells":
      return localText("Check the current notebook structure and cell roles", "현재 노트북 구조와 셀 역할 확인");
    case "cell-call":
      return textArg(args, "blockId")
        ? localText(`Run or check ${textArg(args, "blockId")}`, `${textArg(args, "blockId")} 실행 또는 검증`)
        : localText("Run or check cell", "셀 실행 또는 검증");
    case "execute-reactive":
      return textArg(args, "blockId")
        ? localText(`Rerun dependent cells from ${textArg(args, "blockId")}`, `${textArg(args, "blockId")}부터 의존 셀 재실행`)
        : localText("Rerun dependent cells", "의존 셀 재실행");
    case "get-variables":
      return localText("Inspect current runtime variables", "현재 런타임 변수 확인");
    case "write-automation-recipe": {
      const title = textArg(args, "title");
      return title
        ? localText(`Write ${title} recipe and automation cell`, `${title} recipe와 automation 셀 작성`)
        : localText("Write percent-format recipe and automation cell", "percent-format recipe와 automation 셀 작성");
    }
    case "create-automation-task": {
      const taskName = textArg(args, "name");
      return taskName
        ? localText(`Register ${taskName} task`, `${taskName} 태스크 등록`)
        : localText("Register verified recipe as task", "검증된 recipe를 태스크로 등록");
    }
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

function numberArg(args: Record<string, unknown>, key: string) {
  const value = args[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function firstLine(value: string) {
  return value.split(/\r?\n/)[0]?.trim() ?? "";
}

function formatDuration(value: number) {
  if (!Number.isFinite(value)) return "";
  if (value < 1000) return `${Math.max(0, Math.round(value))}ms`;
  return `${(value / 1000).toFixed(value < 10000 ? 1 : 0)}s`;
}

function localText(en: string, ko: string) {
  return getActiveLocale() === "en" ? en : ko;
}
