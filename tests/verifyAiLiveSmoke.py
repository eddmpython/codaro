from __future__ import annotations

import asyncio
import json
import os
import re
import sys
import time
from dataclasses import dataclass, field
from typing import Any

import yaml

from codaro.ai.conversation import ConversationManager, buildSystemPrompt
from codaro.ai.factory import createProvider
from codaro.ai.oauthToken import TokenRefreshError, loadToken
from codaro.ai.profile import getProfileManager
from codaro.ai.providerSpec import getProviderSpec, normalizeProvider, publicProviderIds
from codaro.ai.providers.oauthChatgptProvider import ChatGPTOAuthError
from codaro.ai.teacher import TeacherOrchestrator, buildClarificationPlan, runTeacherChatLoop
from codaro.ai.tools import toolSchemas
from codaro.ai.types import LLMConfig


MISSING_CREDENTIAL_EXIT = 2

LIVE_PROVIDER_ERRORS = (
    AttributeError,
    ChatGPTOAuthError,
    ConnectionError,
    FileNotFoundError,
    ImportError,
    OSError,
    PermissionError,
    RuntimeError,
    TokenRefreshError,
    TypeError,
    ValueError,
)


@dataclass(frozen=True)
class LiveProviderSelection:
    provider: str
    config: LLMConfig
    missingReasons: tuple[str, ...] = ()

    @property
    def credentialMissing(self) -> bool:
        return bool(self.missingReasons)

    def payload(self) -> dict[str, Any]:
        return {
            "provider": self.provider,
            "model": self.config.model,
            "baseUrlConfigured": bool(self.config.baseUrl),
            "apiKeyConfigured": bool(self.config.apiKey),
            "credentialMissing": self.credentialMissing,
            "missingReasons": list(self.missingReasons),
        }


@dataclass(frozen=True)
class LiveSmokeCase:
    caseId: str
    passed: bool
    status: str
    durationMs: int
    provider: str | None = None
    model: str | None = None
    error: str | None = None
    signals: dict[str, Any] = field(default_factory=dict)

    def payload(self) -> dict[str, Any]:
        data: dict[str, Any] = {
            "caseId": self.caseId,
            "passed": self.passed,
            "status": self.status,
            "durationMs": self.durationMs,
            "signals": self.signals,
        }
        if self.provider is not None:
            data["provider"] = self.provider
        if self.model is not None:
            data["model"] = self.model
        if self.error is not None:
            data["error"] = self.error
        return data


@dataclass(frozen=True)
class LiveProviderRun:
    selection: LiveProviderSelection
    passed: bool
    status: str
    cases: tuple[LiveSmokeCase, ...] = ()
    nextAction: str | None = None

    @property
    def credentialMissing(self) -> bool:
        return self.status == "live credential missing"

    def payload(self) -> dict[str, Any]:
        data: dict[str, Any] = {
            "provider": self.selection.provider,
            "passed": self.passed,
            "status": self.status,
            "selection": self.selection.payload(),
            "cases": [case.payload() for case in self.cases],
        }
        if self.nextAction is not None:
            data["nextAction"] = self.nextAction
        return data


class LiveSmokeExecutor:
    def __init__(self) -> None:
        self.calls: list[dict[str, Any]] = []
        self.results: list[dict[str, Any]] = []

    async def execute(self, toolName: str, arguments: dict[str, Any]) -> dict[str, Any]:
        self.calls.append({"tool": toolName, "arguments": arguments})
        if toolName == "write-curriculum-yaml":
            result = materializeLiveSmokeYaml(arguments)
            self.results.append({"tool": toolName, "result": result})
            return result
        if toolName == "packages-check":
            result = {"missing": [], "packages": [], "ready": True}
            self.results.append({"tool": toolName, "result": result})
            return result
        if toolName == "packages-install":
            result = {
                "success": True,
                "package": str(arguments.get("name") or "package"),
                "installer": "uv",
                "environment": "live smoke simulated",
                "durationMs": 0,
                "skipped": True,
            }
            self.results.append({"tool": toolName, "result": result})
            return result
        if toolName == "cell-call":
            result = {"passed": True, "status": "live-smoke-simulated"}
            self.results.append({"tool": toolName, "result": result})
            return result
        if toolName == "read-cells":
            result = {"blocks": []}
            self.results.append({"tool": toolName, "result": result})
            return result
        if toolName == "get-variables":
            result = {"variables": []}
            self.results.append({"tool": toolName, "result": result})
            return result
        if toolName == "write-cell":
            result = {"ok": True, "updated": True}
            self.results.append({"tool": toolName, "result": result})
            return result
        result = {"ok": True, "tool": toolName}
        self.results.append({"tool": toolName, "result": result})
        return result


def main() -> int:
    matrixProviderIds = liveProviderIdsFromEnv()
    if matrixProviderIds:
        return runProviderMatrix(matrixProviderIds)
    return runSingleProvider()


def runSingleProvider() -> int:
    selection = selectLiveProvider()
    run = runLiveProvider(selection)
    if run.credentialMissing:
        payload = singleRunPayload(run)
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return MISSING_CREDENTIAL_EXIT

    payload = singleRunPayload(run)
    if run.passed:
        print(f"ok: AI live smoke passed for {selection.provider}")
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0
    print("FAIL: AI live smoke failed", file=sys.stderr)
    print(json.dumps(payload, ensure_ascii=False, indent=2), file=sys.stderr)
    return 1


def runProviderMatrix(providerIds: tuple[str, ...]) -> int:
    runs = tuple(runLiveProvider(selectLiveProvider(providerId)) for providerId in providerIds)
    payload = matrixRunPayload(runs)
    exitCode = matrixExitCode(runs)
    if exitCode == 0:
        print(f"ok: AI live smoke matrix passed for {len(runs)} provider(s)")
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0
    target = sys.stderr if any(run.status == "failed" for run in runs) else sys.stdout
    print("FAIL: AI live smoke matrix did not fully pass", file=target)
    print(json.dumps(payload, ensure_ascii=False, indent=2), file=target)
    return exitCode


def runLiveProvider(selection: LiveProviderSelection) -> LiveProviderRun:
    if selection.credentialMissing:
        return LiveProviderRun(
            selection=selection,
            passed=False,
            status="live credential missing",
            nextAction=liveCredentialNextAction(selection.provider),
        )

    cases = (
        runProviderAvailabilityCase(selection.config),
        runShortAnswerCase(selection.config),
        runTeacherAnswerCase(selection.config),
        runClarificationGateCase(),
        asyncio.run(runToolLoopCase(selection.config)),
        asyncio.run(runCellCallLoopCase(selection.config)),
    )
    passed = all(case.passed for case in cases)
    return LiveProviderRun(
        selection=selection,
        passed=passed,
        status="passed" if passed else "failed",
        cases=cases,
    )


def liveProviderIdsFromEnv() -> tuple[str, ...]:
    return parseLiveProviderIds(os.environ.get("CODARO_AI_LIVE_PROVIDERS"))


def parseLiveProviderIds(raw: str | None) -> tuple[str, ...]:
    if raw is None or not raw.strip():
        return ()
    providerIds: list[str] = []
    seen: set[str] = set()
    for token in re.split(r"[\s,;]+", raw.strip()):
        if token in {"*", "all"}:
            expanded = publicProviderIds()
        else:
            expanded = (normalizeProvider(token) or token,)
        for providerId in expanded:
            if providerId not in seen:
                providerIds.append(providerId)
                seen.add(providerId)
    return tuple(providerIds)


def singleRunPayload(run: LiveProviderRun) -> dict[str, Any]:
    payload = {
        "passed": run.passed,
        "status": run.status,
        "selection": run.selection.payload(),
    }
    if run.cases:
        payload["cases"] = [case.payload() for case in run.cases]
    if run.nextAction is not None:
        payload["nextAction"] = run.nextAction
    return payload


def matrixRunPayload(runs: tuple[LiveProviderRun, ...]) -> dict[str, Any]:
    summary = {
        "passed": sum(1 for run in runs if run.passed),
        "failed": sum(1 for run in runs if run.status == "failed"),
        "credentialMissing": sum(1 for run in runs if run.credentialMissing),
        "total": len(runs),
    }
    return {
        "passed": matrixExitCode(runs) == 0,
        "status": matrixStatus(runs),
        "matrix": True,
        "summary": summary,
        "providers": [run.payload() for run in runs],
    }


def matrixStatus(runs: tuple[LiveProviderRun, ...]) -> str:
    if any(run.status == "failed" for run in runs):
        return "failed"
    if any(run.credentialMissing for run in runs):
        if any(run.passed for run in runs):
            return "partial credential missing"
        return "live credential missing"
    return "passed"


def matrixExitCode(runs: tuple[LiveProviderRun, ...]) -> int:
    if any(run.status == "failed" for run in runs):
        return 1
    if any(run.credentialMissing for run in runs):
        return MISSING_CREDENTIAL_EXIT
    return 0


def selectLiveProvider(providerOverride: str | None = None) -> LiveProviderSelection:
    profileManager = getProfileManager()
    profileProvider = profileManager.load().defaultProvider
    provider = providerOverride or normalizeProvider(os.environ.get("CODARO_AI_LIVE_PROVIDER")) or profileProvider
    spec = getProviderSpec(provider)
    if spec is None:
        return LiveProviderSelection(
            provider=provider,
            config=LLMConfig(provider="custom"),
            missingReasons=(f"unsupported provider: {provider}",),
        )

    resolved = profileManager.resolve(provider=provider)
    apiKey = resolved.get("apiKey")
    if not apiKey and spec.envKey:
        apiKey = os.environ.get(spec.envKey)
    if not apiKey and provider == "custom":
        apiKey = os.environ.get("CODARO_LLM_API_KEY")

    baseUrl = resolved.get("baseUrl") or os.environ.get("CODARO_LLM_BASE_URL")
    config = LLMConfig(
        provider=provider,
        model=os.environ.get("CODARO_AI_LIVE_MODEL") or resolved.get("model"),
        apiKey=apiKey,
        baseUrl=baseUrl,
        temperature=0,
        maxTokens=int(os.environ.get("CODARO_AI_LIVE_MAX_TOKENS", "1200")),
    )
    return LiveProviderSelection(
        provider=provider,
        config=config,
        missingReasons=credentialMissingReasons(provider, config),
    )


def credentialMissingReasons(provider: str, config: LLMConfig) -> tuple[str, ...]:
    spec = getProviderSpec(provider)
    if spec is None:
        return (f"unsupported provider: {provider}",)
    if spec.authKind == "oauth":
        if loadToken() is None:
            return ("oauth token missing",)
        return ()
    if provider == "ollama":
        return ()
    if spec.authKind == "api_key":
        reasons: list[str] = []
        if not config.apiKey:
            reasons.append(f"{spec.envKey or 'api key'} missing")
        if provider == "custom" and not config.baseUrl:
            reasons.append("CODARO_LLM_BASE_URL missing")
        return tuple(reasons)
    return ()


def liveCredentialNextAction(provider: str) -> str:
    if provider == "oauth-chatgpt":
        return "Open Provider 설정에서 ChatGPT OAuth login을 완료한 뒤 다시 실행하세요."
    if provider == "openai":
        return "OPENAI_API_KEY 또는 Codaro provider secret을 설정한 뒤 다시 실행하세요."
    if provider == "custom":
        return "CODARO_LLM_BASE_URL과 custom provider API key를 설정한 뒤 다시 실행하세요."
    if provider == "ollama":
        return "Ollama 서버를 실행하고 필요한 모델을 설치한 뒤 다시 실행하세요."
    return "지원 provider를 CODARO_AI_LIVE_PROVIDER에 지정하세요."


def runProviderAvailabilityCase(config: LLMConfig) -> LiveSmokeCase:
    startedAt = time.monotonic()
    try:
        provider = createProvider(config)
        available = bool(provider.checkAvailable())
        return LiveSmokeCase(
            caseId="provider-availability",
            passed=available,
            status="passed" if available else "provider unavailable",
            durationMs=elapsedMs(startedAt),
            provider=config.provider,
            model=provider.resolvedModel,
            signals={"supportsNativeTools": bool(provider.supportsNativeTools)},
            error=None if available else "provider checkAvailable returned false",
        )
    except LIVE_PROVIDER_ERRORS as exc:
        return failedCase("provider-availability", startedAt, config, exc)


def runShortAnswerCase(config: LLMConfig) -> LiveSmokeCase:
    startedAt = time.monotonic()
    try:
        provider = createProvider(config)
        response = provider.complete([
            {
                "role": "system",
                "content": "You are Codaro live smoke checker. Reply with one short Korean sentence.",
            },
            {
                "role": "user",
                "content": "Codaro live smoke 확인입니다. 한국어 한 문장으로만 답하세요.",
            }
        ])
        answer = response.answer.strip()
        return LiveSmokeCase(
            caseId="short-answer",
            passed=bool(answer),
            status="passed" if answer else "empty answer",
            durationMs=elapsedMs(startedAt),
            provider=response.provider,
            model=response.model,
            signals={"answerChars": len(answer), "usage": response.usage or {}},
            error=None if answer else "provider returned empty answer",
        )
    except LIVE_PROVIDER_ERRORS as exc:
        return failedCase("short-answer", startedAt, config, exc)


def runTeacherAnswerCase(config: LLMConfig) -> LiveSmokeCase:
    startedAt = time.monotonic()
    try:
        provider = createProvider(config)
        response = provider.complete([
            {"role": "system", "content": buildSystemPrompt(role="teacher")},
            {"role": "user", "content": "파이썬 리스트를 초보자에게 한 문장으로 설명해줘."},
        ])
        answer = response.answer.strip()
        conciseEnough = len(answer) <= 500
        passed = bool(answer) and conciseEnough
        return LiveSmokeCase(
            caseId="teacher-answer",
            passed=passed,
            status="passed" if passed else "teacher answer quality failed",
            durationMs=elapsedMs(startedAt),
            provider=response.provider,
            model=response.model,
            signals={"answerChars": len(answer), "usage": response.usage or {}},
            error=None if passed else "teacher answer empty or too verbose",
        )
    except LIVE_PROVIDER_ERRORS as exc:
        return failedCase("teacher-answer", startedAt, config, exc)


def runClarificationGateCase() -> LiveSmokeCase:
    startedAt = time.monotonic()
    plan = buildClarificationPlan("데이터 분석 커리큘럼 만들어줘")
    questionCount = len(plan.questions)
    passed = plan.shouldAsk and 1 <= questionCount <= 3
    return LiveSmokeCase(
        caseId="clarification-before-provider",
        passed=passed,
        status="passed" if passed else "clarification gate failed",
        durationMs=elapsedMs(startedAt),
        provider="codaro",
        model="clarification-gate",
        signals={
            "questionCount": questionCount,
            "assumptionKeys": sorted(plan.assumptions.keys()),
            "providerCalled": False,
        },
        error=None if passed else "ambiguous learning request did not stop before provider",
    )


async def runToolLoopCase(config: LLMConfig) -> LiveSmokeCase:
    startedAt = time.monotonic()
    executor = LiveSmokeExecutor()
    convManager = ConversationManager()
    conversation = convManager.create(role="teacher")
    orchestrator = TeacherOrchestrator.fromContext({})
    provider = createProvider(config)
    messages = [
        {"role": "system", "content": buildSystemPrompt(role="teacher")},
        {
            "role": "user",
            "content": (
                "초급 pandas 실습 중심 아주 짧은 레슨을 만들어줘. "
                "반드시 structured Codaro YAML 계약으로 작성하세요: meta, intro.direction, intro.benefits, "
                "intro.diagram.steps, intro.diagram.runtime, sections[0].title/subtitle/goal/why/explanation/"
                "tips/snippet/exercise.prompt/exercise.starterCode/exercise.hints/exercise.check/check. "
                "섹션은 1개만 만들고, 답변만 하지 말고 write-curriculum-yaml tool을 호출해 반영하세요."
            ),
        },
    ]
    try:
        payload = await runTeacherChatLoop(
            provider=provider,
            convManager=convManager,
            conversationId=conversation.conversationId,
            messages=messages,
            tools=toolSchemas(),
            executor=executor,
            orchestrator=orchestrator,
            maxToolRounds=3,
        )
    except LIVE_PROVIDER_ERRORS as exc:
        return failedCase("live-tool-loop", startedAt, config, exc)

    toolNames = toolNamesFromPayload(payload)
    trace = traceFromPayload(payload)
    yamlResults = toolResultsByName(executor.results, "write-curriculum-yaml")
    yamlResult = yamlResults[-1] if yamlResults else {}
    contractGapCount = intSignal(yamlResult, "contractGapCount")
    sectionCount = intSignal(yamlResult, "sectionCount")
    exerciseCellCount = intSignal(yamlResult, "exerciseCellCount")
    snippetCellCount = intSignal(yamlResult, "snippetCellCount")
    yamlContractObserved = bool(trace.get("yamlContractObserved"))
    usedCurriculumTool = "write-curriculum-yaml" in toolNames
    passed = (
        usedCurriculumTool
        and str(payload.get("provider") or "") != ""
        and contractGapCount == 0
        and sectionCount >= 1
        and exerciseCellCount >= 1
        and snippetCellCount >= 1
        and yamlContractObserved
    )
    error = None
    failureSignals: dict[str, Any] = {}
    if not usedCurriculumTool:
        error = "live provider did not call write-curriculum-yaml; prompt/tool schema tuning required"
        failureSignals = toolLoopTuningSignals(
            reason="missing-required-tool",
            requiredTools=("write-curriculum-yaml",),
            observedTools=toolNames,
            answer=str(payload.get("answer") or ""),
        )
    elif contractGapCount != 0:
        error = f"live provider YAML has contract gaps: {yamlResult.get('contractGaps')}"
        failureSignals = {
            "failureReason": "yaml-contract-gaps",
            "contractGaps": yamlResult.get("contractGaps"),
            "tuningRequired": True,
            "tuningHints": [
                "strengthen curriculum YAML prompt with required section contract fields",
                "inspect write-curriculum-yaml schema examples and materializer contract gaps",
            ],
        }
    elif not yamlContractObserved:
        error = "live provider YAML materialization did not expose learning/section contract"
        failureSignals = {
            "failureReason": "yaml-contract-not-observed",
            "tuningRequired": True,
            "tuningHints": [
                "check write-curriculum-yaml result mapping into structured section cards",
                "inspect materializer trace for yamlContractObserved signal",
            ],
        }
    elif sectionCount < 1 or exerciseCellCount < 1 or snippetCellCount < 1:
        error = "live provider YAML did not materialize section, snippet, and exercise cells"
        failureSignals = {
            "failureReason": "missing-structured-section-cells",
            "sectionCount": sectionCount,
            "exerciseCellCount": exerciseCellCount,
            "snippetCellCount": snippetCellCount,
            "tuningRequired": True,
            "tuningHints": [
                "tighten prompt to require section, snippet, and exercise cell fields",
                "inspect converter mapping from section contract to editor blocks",
            ],
        }
    return LiveSmokeCase(
        caseId="live-tool-loop",
        passed=passed,
        status="passed" if passed else "live curriculum quality failed",
        durationMs=elapsedMs(startedAt),
        provider=str(payload.get("provider") or config.provider),
        model=str(payload.get("model") or provider.resolvedModel),
        signals={
            "toolSequence": trace.get("toolSequence") or toolNames,
            "toolCount": len(toolNames),
            "workloopCount": len(trace.get("workloop") or []),
            "executorCalls": [call["tool"] for call in executor.calls],
            "contractGapCount": contractGapCount,
            "sectionCount": sectionCount,
            "exerciseCellCount": exerciseCellCount,
            "snippetCellCount": snippetCellCount,
            "yamlContractObserved": yamlContractObserved,
            "answerChars": len(str(payload.get("answer") or "")),
        } | failureSignals,
        error=error,
    )


async def runCellCallLoopCase(config: LLMConfig) -> LiveSmokeCase:
    startedAt = time.monotonic()
    executor = LiveSmokeExecutor()
    convManager = ConversationManager()
    conversation = convManager.create(role="teacher")
    orchestrator = TeacherOrchestrator.fromContext({"dependencyPreflight": {"packages": ["numpy"]}})
    provider = createProvider(config)
    messages = [
        {
            "role": "system",
            "content": buildSystemPrompt(
                role="teacher",
                documentContext=(
                    "현재 학습 셀: id=live-smoke-cell, role=exercise, executionKind=code, "
                    "content=`numbers = [1, 2, 3]\\nprint(sum(numbers))`"
                ),
            ),
        },
        {
            "role": "user",
            "content": (
                "실제 실행 도구 smoke입니다. 대상 셀 id는 live-smoke-cell입니다. "
                "정확히 두 개의 tool call만 사용하세요. "
                "1) packages-check tool을 names=[\"numpy\"]로 한 번만 호출합니다. "
                "2) 그 결과가 ready이면 cell-call tool을 operation=\"run\", blockId=\"live-smoke-cell\"로 한 번만 호출합니다. "
                "packages-check를 반복 호출하거나 read-cells/write-cell/write-curriculum-yaml을 호출하지 마세요. "
                "답변만 하지 말고 반드시 도구 호출로 확인하세요."
            ),
        },
    ]
    try:
        payload = await runTeacherChatLoop(
            provider=provider,
            convManager=convManager,
            conversationId=conversation.conversationId,
            messages=messages,
            tools=toolSchemas(),
            executor=executor,
            orchestrator=orchestrator,
            maxToolRounds=4,
        )
    except LIVE_PROVIDER_ERRORS as exc:
        return failedCase("live-cell-call-loop", startedAt, config, exc)

    toolNames = toolNamesFromPayload(payload)
    trace = traceFromPayload(payload)
    executorCalls = [call["tool"] for call in executor.calls]
    usedPackageCheck = "packages-check" in executorCalls
    usedCellCall = "cell-call" in executorCalls
    ordered = toolsInOrder(executorCalls, "packages-check", "cell-call")
    exactSequence = executorCalls == ["packages-check", "cell-call"]
    policyViolationCount = int(trace.get("policyViolationCount") or 0)
    passed = (
        usedPackageCheck
        and usedCellCall
        and ordered
        and exactSequence
        and policyViolationCount == 0
        and str(payload.get("provider") or "") != ""
    )
    error = None
    failureSignals: dict[str, Any] = {}
    if not usedCellCall:
        error = "live provider did not call cell-call; prompt/tool schema tuning required"
        failureSignals = toolLoopTuningSignals(
            reason="missing-required-tool",
            requiredTools=("packages-check", "cell-call"),
            observedTools=executorCalls,
            answer=str(payload.get("answer") or ""),
        )
    elif not usedPackageCheck:
        error = "live provider did not call packages-check before cell-call"
        failureSignals = toolLoopTuningSignals(
            reason="missing-preflight-tool",
            requiredTools=("packages-check", "cell-call"),
            observedTools=executorCalls,
            answer=str(payload.get("answer") or ""),
        )
    elif not ordered:
        error = "live provider called cell-call before packages-check"
        failureSignals = toolLoopTuningSignals(
            reason="tool-order-violation",
            requiredTools=("packages-check", "cell-call"),
            observedTools=executorCalls,
            answer=str(payload.get("answer") or ""),
        )
    elif not exactSequence:
        error = f"live provider made unnecessary tool calls: {executorCalls}"
        failureSignals = toolLoopTuningSignals(
            reason="unnecessary-tool-calls",
            requiredTools=("packages-check", "cell-call"),
            observedTools=executorCalls,
            answer=str(payload.get("answer") or ""),
        )
    elif policyViolationCount:
        error = "live provider cell-call triggered tool policy violation"
        failureSignals = {
            "failureReason": "tool-policy-violation",
            "tuningRequired": True,
            "tuningHints": [
                "inspect tool policy violation before changing provider prompt",
                "ensure packages-check result is passed back before cell-call",
            ],
        }
    return LiveSmokeCase(
        caseId="live-cell-call-loop",
        passed=passed,
        status="passed" if passed else "missing live cell-call",
        durationMs=elapsedMs(startedAt),
        provider=str(payload.get("provider") or config.provider),
        model=str(payload.get("model") or provider.resolvedModel),
        signals={
            "toolSequence": trace.get("toolSequence") or toolNames,
            "toolCount": len(toolNames),
            "workloopCount": len(trace.get("workloop") or []),
            "policyViolationCount": policyViolationCount,
            "executorCalls": executorCalls,
            "exactSequence": exactSequence,
            "answerChars": len(str(payload.get("answer") or "")),
        } | failureSignals,
        error=error,
    )


def toolNamesFromPayload(payload: dict[str, Any]) -> list[str]:
    return [str(call.get("name")) for call in payload.get("toolCalls", []) if isinstance(call, dict)]


def traceFromPayload(payload: dict[str, Any]) -> dict[str, Any]:
    trace = payload.get("trace")
    return trace if isinstance(trace, dict) else {}


def toolsInOrder(toolNames: list[str], before: str, after: str) -> bool:
    try:
        return toolNames.index(before) < toolNames.index(after)
    except ValueError:
        return False


def toolLoopTuningSignals(
    *,
    reason: str,
    requiredTools: tuple[str, ...],
    observedTools: list[str],
    answer: str,
) -> dict[str, Any]:
    return {
        "failureReason": reason,
        "tuningRequired": True,
        "expectedTools": list(requiredTools),
        "observedTools": observedTools,
        "answerPreview": boundedSignalText(answer),
        "tuningHints": [
            "verify the provider supports native tool calls for this model",
            f"tighten the prompt to require these tools before final answer: {', '.join(requiredTools)}",
            "inspect the exposed tool schema names and response tool-call parser",
        ],
    }


def boundedSignalText(text: str, *, limit: int = 240) -> str:
    normalized = " ".join(text.split())
    if len(normalized) <= limit:
        return normalized
    return f"{normalized[:limit]}...[truncated]"


def materializeLiveSmokeYaml(arguments: dict[str, Any]) -> dict[str, Any]:
    rawContent = arguments.get("yamlContent")
    try:
        from codaro.ai.toolHandlers.workbench import _curriculumContractGaps
        from codaro.curriculum.converter import yamlToDocument

        payload = yaml.safe_load(rawContent) if isinstance(rawContent, str) else rawContent
    except yaml.YAMLError as exc:
        return {"error": f"Invalid curriculum YAML: {safeError(exc)}"}

    if payload is None:
        payload = {}
    if not isinstance(payload, dict):
        return {"error": "Curriculum YAML must parse to an object"}

    try:
        document, solutions = yamlToDocument(payload, "live-smoke", "live-provider")
    except (KeyError, TypeError, ValueError) as exc:
        return {"error": f"Curriculum YAML conversion failed: {safeError(exc)}"}

    contractGaps = _curriculumContractGaps(document)
    contractGapCount = sum(len(item["missingFields"]) for item in contractGaps)
    return {
        "ok": True,
        "loadedInEditor": True,
        "documentId": document.id,
        "title": document.title,
        "sectionCount": sum(1 for block in document.blocks if block.sourceType == "section"),
        "exerciseCellCount": sum(1 for block in document.blocks if block.sourceType == "sectionContract:exercise"),
        "snippetCellCount": sum(1 for block in document.blocks if block.sourceType == "sectionContract:snippet"),
        "contractGapCount": contractGapCount,
        "contractGaps": contractGaps,
        "runtimePackageCount": len(document.runtime.packages),
        "blockCount": len(document.blocks),
        "solutionCount": len(solutions),
        "document": document.model_dump(),
    }


def toolResultsByName(results: list[dict[str, Any]], toolName: str) -> list[dict[str, Any]]:
    return [
        item["result"]
        for item in results
        if item.get("tool") == toolName and isinstance(item.get("result"), dict)
    ]


def intSignal(payload: dict[str, Any], key: str) -> int:
    value = payload.get(key)
    if isinstance(value, int) and not isinstance(value, bool):
        return value
    return -1


def failedCase(caseId: str, startedAt: float, config: LLMConfig, exc: BaseException) -> LiveSmokeCase:
    return LiveSmokeCase(
        caseId=caseId,
        passed=False,
        status="provider error",
        durationMs=elapsedMs(startedAt),
        provider=config.provider,
        model=config.model,
        error=safeError(exc),
    )


def safeError(exc: BaseException) -> str:
    text = str(exc) or exc.__class__.__name__
    for value in (os.environ.get("OPENAI_API_KEY"), os.environ.get("CODARO_LLM_API_KEY")):
        if value:
            text = text.replace(value, "[redacted]")
    return text[:500]


def elapsedMs(startedAt: float) -> int:
    return int((time.monotonic() - startedAt) * 1000)


if __name__ == "__main__":
    raise SystemExit(main())
