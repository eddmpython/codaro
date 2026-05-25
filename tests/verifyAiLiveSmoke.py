from __future__ import annotations

import asyncio
from datetime import UTC, datetime
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Awaitable, Callable

import yaml

from codaro.ai.conversation import ConversationManager, buildSystemPrompt
from codaro.ai.factory import createProvider
from codaro.ai.oauthToken import TokenRefreshError, loadToken
from codaro.ai.profile import getProfileManager
from codaro.ai.providerErrors import ProviderRuntimeError, providerErrorDiagnostic
from codaro.ai.providerSpec import getProviderSpec, normalizeProvider, publicProviderIds
from codaro.ai.providers.oauthChatgptProvider import ChatGPTOAuthError
from codaro.ai.teacher import TeacherOrchestrator, buildClarificationPlan, runTeacherChatLoop
from codaro.ai.tools import toolSchemas
from codaro.ai.types import LLMConfig


MISSING_CREDENTIAL_EXIT = 2
ROOT = Path(__file__).resolve().parents[1]
LIVE_SMOKE_REPORT_PATH = ROOT / "output" / "test-runner" / "ai-live-smoke" / "live-smoke-report.json"

LIVE_PROVIDER_ERRORS = (
    AttributeError,
    ChatGPTOAuthError,
    ConnectionError,
    FileNotFoundError,
    ImportError,
    OSError,
    PermissionError,
    ProviderRuntimeError,
    RuntimeError,
    TokenRefreshError,
    TypeError,
    ValueError,
)

AsyncLiveCaseRunner = Callable[[LLMConfig], Awaitable["LiveSmokeCase"]]


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
        } | (
            {"diagnostic": liveCredentialDiagnostic(self.provider, self.missingReasons)}
            if self.credentialMissing
            else {}
        )


@dataclass(frozen=True)
class LiveSmokeCase:
    caseId: str
    passed: bool
    status: str
    durationMs: int
    provider: str | None = None
    model: str | None = None
    error: str | None = None
    diagnostic: dict[str, Any] | None = None
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
        if self.diagnostic is not None:
            data["diagnostic"] = self.diagnostic
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
        if self.credentialMissing:
            data["diagnostic"] = liveCredentialDiagnostic(self.selection.provider, self.selection.missingReasons)
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
    startedAt = utcTimestamp()
    startedAtMonotonic = time.monotonic()
    selection = selectLiveProvider()
    run = runLiveProvider(selection)
    payload = stampLiveSmokePayload(singleRunPayload(run), startedAt=startedAt, startedAtMonotonic=startedAtMonotonic)
    writeLiveSmokeReport(payload)
    if run.credentialMissing:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return MISSING_CREDENTIAL_EXIT

    if run.passed:
        print(f"ok: AI live smoke passed for {selection.provider}")
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0
    print("FAIL: AI live smoke failed", file=sys.stderr)
    print(json.dumps(payload, ensure_ascii=False, indent=2), file=sys.stderr)
    return 1


def runProviderMatrix(providerIds: tuple[str, ...]) -> int:
    startedAt = utcTimestamp()
    startedAtMonotonic = time.monotonic()
    runs = tuple(runLiveProvider(selectLiveProvider(providerId)) for providerId in providerIds)
    payload = stampLiveSmokePayload(matrixRunPayload(runs), startedAt=startedAt, startedAtMonotonic=startedAtMonotonic)
    writeLiveSmokeReport(payload)
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

    toolLoopCase = asyncio.run(runAsyncLiveCaseWithNetworkRetry(selection.config, runToolLoopCase))
    cellCallCase = asyncio.run(runAsyncLiveCaseWithNetworkRetry(selection.config, runCellCallLoopCase))
    cases = (
        runProviderAvailabilityCase(selection.config),
        runShortAnswerCase(selection.config),
        runTeacherAnswerCase(selection.config),
        runClarificationGateCase(),
        toolLoopCase,
        cellCallCase,
    )
    passed = all(case.passed for case in cases)
    return LiveProviderRun(
        selection=selection,
        passed=passed,
        status="passed" if passed else "failed",
        cases=cases,
    )


async def runAsyncLiveCaseWithNetworkRetry(
    config: LLMConfig,
    runner: AsyncLiveCaseRunner,
) -> LiveSmokeCase:
    maxAttempts = liveNetworkRetryAttempts()
    networkFailures: list[LiveSmokeCase] = []
    for attempt in range(1, maxAttempts + 1):
        case = await runner(config)
        if case.passed:
            return caseWithNetworkRetrySignals(case, attempt, networkFailures)
        if not isRecoverableNetworkCase(case) or attempt == maxAttempts:
            return caseWithNetworkRetrySignals(case, attempt, networkFailures)
        networkFailures.append(case)
    return caseWithNetworkRetrySignals(case, maxAttempts, networkFailures)


def liveNetworkRetryAttempts() -> int:
    rawValue = os.environ.get("CODARO_AI_LIVE_NETWORK_RETRIES", "2")
    try:
        value = int(rawValue)
    except ValueError:
        value = 2
    return max(1, min(value, 3))


def isRecoverableNetworkCase(case: LiveSmokeCase) -> bool:
    return (
        case.status == "provider_network_error"
        or case.signals.get("diagnosticCode") == "provider_network_error"
        or case.signals.get("failureReason") == "provider-network-error"
    )


def caseWithNetworkRetrySignals(
    case: LiveSmokeCase,
    attempt: int,
    previousFailures: list[LiveSmokeCase],
) -> LiveSmokeCase:
    if attempt == 1 and not previousFailures:
        return case
    retrySignals = {
        "attemptCount": attempt,
        "networkRetryCount": len(previousFailures),
        "previousNetworkFailures": [
            {
                "caseId": failure.caseId,
                "status": failure.status,
                "durationMs": failure.durationMs,
                "diagnosticCode": failure.signals.get("diagnosticCode"),
                "diagnosticAction": failure.signals.get("diagnosticAction"),
            }
            for failure in previousFailures
        ],
    }
    if case.passed and previousFailures:
        retrySignals["recoveredAfterNetworkRetry"] = True
    return LiveSmokeCase(
        caseId=case.caseId,
        passed=case.passed,
        status=case.status,
        durationMs=case.durationMs,
        provider=case.provider,
        model=case.model,
        error=case.error,
        diagnostic=case.diagnostic,
        signals=case.signals | retrySignals,
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


def stampLiveSmokePayload(payload: dict[str, Any], *, startedAt: str, startedAtMonotonic: float) -> dict[str, Any]:
    stamped = dict(payload)
    stamped["startedAt"] = startedAt
    stamped["completedAt"] = utcTimestamp()
    stamped["durationMs"] = elapsedMs(startedAtMonotonic)
    gitHead = currentGitHead()
    if gitHead:
        stamped["gitHead"] = gitHead
    return stamped


def writeLiveSmokeReport(payload: dict[str, Any], reportPath: Path = LIVE_SMOKE_REPORT_PATH) -> Path:
    reportPath.parent.mkdir(parents=True, exist_ok=True)
    reportPayload = dict(payload)
    reportPayload["reportPath"] = reportDisplayPath(reportPath)
    reportPath.write_text(json.dumps(reportPayload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return reportPath


def reportDisplayPath(reportPath: Path) -> str:
    try:
        return str(reportPath.relative_to(ROOT))
    except ValueError:
        return str(reportPath)


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def currentGitHead() -> str | None:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
    except (FileNotFoundError, OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() or None


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


def liveCredentialDiagnostic(provider: str, missingReasons: tuple[str, ...]) -> dict[str, Any]:
    detail = ", ".join(missingReasons) or "live credential missing"
    if any(reason.startswith("unsupported provider") for reason in missingReasons):
        action = "unavailable"
    elif provider == "oauth-chatgpt" or any("oauth token" in reason for reason in missingReasons):
        action = "login"
    elif provider == "custom" and any("BASE_URL" in reason or "base url" in reason.lower() for reason in missingReasons):
        action = "base_url_missing"
    elif any("api key" in reason.lower() or "OPENAI_API_KEY" in reason for reason in missingReasons):
        action = "api_key_missing"
    else:
        action = "unavailable"
    diagnostic = providerErrorDiagnostic(
        ProviderRuntimeError(
            "live provider credential is missing",
            action=action,
            provider=provider,
            detail=detail,
        ),
        provider=provider,
    )
    return diagnostic.payload()


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
    workloopSignals = workloopSignal(trace)
    networkSignals = providerNetworkFailureSignals(trace, payload)
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
        and workloopSignals["workloopReadable"]
    )
    error = None
    failureStatus = "live curriculum quality failed"
    failureSignals: dict[str, Any] = {}
    if not usedCurriculumTool and networkSignals:
        error = "live provider network error interrupted write-curriculum-yaml continuation"
        failureStatus = "provider_network_error"
        failureSignals = networkSignals
    elif not usedCurriculumTool:
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
    elif not workloopSignals["workloopReadable"]:
        error = "live provider tool loop did not expose readable workloop label/detail"
        failureSignals = workloopTuningSignals(
            reason="missing-readable-workloop",
            requiredTools=("write-curriculum-yaml",),
            observedTools=toolNames,
            answer=str(payload.get("answer") or ""),
        )
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
        status="passed" if passed else failureStatus,
        durationMs=elapsedMs(startedAt),
        provider=str(payload.get("provider") or config.provider),
        model=str(payload.get("model") or provider.resolvedModel),
        signals={
            "toolSequence": trace.get("toolSequence") or toolNames,
            "toolCount": len(toolNames),
            "executorCalls": [call["tool"] for call in executor.calls],
            "contractGapCount": contractGapCount,
            "sectionCount": sectionCount,
            "exerciseCellCount": exerciseCellCount,
            "snippetCellCount": snippetCellCount,
            "yamlContractObserved": yamlContractObserved,
            "answerChars": len(str(payload.get("answer") or "")),
        } | workloopSignals | failureSignals,
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
            maxToolRounds=2,
        )
    except LIVE_PROVIDER_ERRORS as exc:
        return failedCase("live-cell-call-loop", startedAt, config, exc)

    toolNames = toolNamesFromPayload(payload)
    trace = traceFromPayload(payload)
    workloopSignals = workloopSignal(trace)
    networkSignals = providerNetworkFailureSignals(trace, payload)
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
        and workloopSignals["workloopReadable"]
    )
    error = None
    failureStatus = "missing live cell-call"
    failureSignals: dict[str, Any] = {}
    if not usedCellCall and networkSignals:
        error = "live provider network error interrupted cell-call continuation"
        failureStatus = "provider_network_error"
        failureSignals = networkSignals
    elif not usedCellCall:
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
    elif not workloopSignals["workloopReadable"]:
        error = "live provider cell-call loop did not expose readable workloop label/detail"
        failureSignals = workloopTuningSignals(
            reason="missing-readable-workloop",
            requiredTools=("packages-check", "cell-call"),
            observedTools=executorCalls,
            answer=str(payload.get("answer") or ""),
        )
    return LiveSmokeCase(
        caseId="live-cell-call-loop",
        passed=passed,
        status="passed" if passed else failureStatus,
        durationMs=elapsedMs(startedAt),
        provider=str(payload.get("provider") or config.provider),
        model=str(payload.get("model") or provider.resolvedModel),
        signals={
            "toolSequence": trace.get("toolSequence") or toolNames,
            "toolCount": len(toolNames),
            "policyViolationCount": policyViolationCount,
            "executorCalls": executorCalls,
            "exactSequence": exactSequence,
            "answerChars": len(str(payload.get("answer") or "")),
        } | workloopSignals | failureSignals,
        error=error,
    )


def toolNamesFromPayload(payload: dict[str, Any]) -> list[str]:
    return [str(call.get("name")) for call in payload.get("toolCalls", []) if isinstance(call, dict)]


def traceFromPayload(payload: dict[str, Any]) -> dict[str, Any]:
    trace = payload.get("trace")
    return trace if isinstance(trace, dict) else {}


def workloopSignal(trace: dict[str, Any]) -> dict[str, Any]:
    rawEvents = trace.get("workloop")
    events = [event for event in rawEvents if isinstance(event, dict)] if isinstance(rawEvents, list) else []
    samples: list[dict[str, str]] = []
    labels: list[str] = []
    readableCount = 0
    for event in events:
        label = boundedSignalText(str(event.get("workLabel") or ""), limit=80)
        detail = boundedSignalText(str(event.get("workDetail") or ""), limit=160)
        toolName = boundedSignalText(str(event.get("toolName") or ""), limit=80)
        status = boundedSignalText(str(event.get("status") or ""), limit=40)
        if label:
            labels.append(label)
        if label and detail:
            readableCount += 1
        if len(samples) < 6:
            sample = {
                key: value
                for key, value in {
                    "toolName": toolName,
                    "status": status,
                    "label": label,
                    "detail": detail,
                }.items()
                if value
            }
            if sample:
                samples.append(sample)
    return {
        "workloopCount": len(events),
        "workloopReadableCount": readableCount,
        "workloopReadable": bool(events) and readableCount == len(events),
        "workloopLabels": labels[:6],
        "workloopSamples": samples,
    }


def providerNetworkFailureSignals(trace: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    answer = str(payload.get("answer") or payload.get("error") or "")
    traceText = json.dumps(trace, ensure_ascii=False)
    diagnostic = payload.get("diagnostic")
    diagnosticCode = diagnostic.get("code") if isinstance(diagnostic, dict) else None
    if diagnosticCode != "provider_network_error" and "provider_network_error" not in traceText:
        return {}
    return {
        "failureReason": "provider-network-error",
        "tuningRequired": False,
        "diagnosticCode": "provider_network_error",
        "diagnosticAction": "check-network",
        "recoverable": True,
        "answerPreview": boundedSignalText(answer),
        "retryable": True,
    }


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
    normalized = " ".join(redactSignalText(text).split())
    if len(normalized) <= limit:
        return normalized
    return f"{normalized[:limit]}...[truncated]"


def redactSignalText(text: str) -> str:
    redacted = text
    for value in (os.environ.get("OPENAI_API_KEY"), os.environ.get("CODARO_LLM_API_KEY")):
        if value:
            redacted = redacted.replace(value, "[redacted]")
    redacted = re.sub(r"sk-[A-Za-z0-9_-]{8,}", "sk-[redacted]", redacted)
    redacted = re.sub(r"Bearer\s+[A-Za-z0-9._~+/-]+", "Bearer [redacted]", redacted)
    return redacted


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
    diagnostic = liveProviderExceptionDiagnostic(exc, provider=config.provider)
    return LiveSmokeCase(
        caseId=caseId,
        passed=False,
        status=str(diagnostic.get("code") or "provider_unavailable"),
        durationMs=elapsedMs(startedAt),
        provider=config.provider,
        model=config.model,
        error=str(diagnostic.get("message") or safeError(exc)),
        diagnostic=diagnostic,
        signals={
            "diagnosticCode": diagnostic.get("code"),
            "diagnosticAction": diagnostic.get("action"),
            "recoverable": diagnostic.get("recoverable"),
        },
    )


def liveProviderExceptionDiagnostic(exc: BaseException, *, provider: str) -> dict[str, Any]:
    if getattr(exc, "action", None) or getattr(exc, "reason", None):
        return providerErrorDiagnostic(exc, provider=provider).payload()
    if isinstance(exc, ConnectionError):
        return providerErrorDiagnostic(
            ProviderRuntimeError(
                "live provider network failure",
                action="network",
                provider=provider,
                detail=str(exc),
            ),
            provider=provider,
        ).payload()
    if isinstance(exc, PermissionError):
        return providerErrorDiagnostic(
            ProviderRuntimeError(
                "live provider permission denied",
                action="permission",
                provider=provider,
                detail=str(exc),
            ),
            provider=provider,
        ).payload()
    return providerErrorDiagnostic(exc, provider=provider).payload()


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
