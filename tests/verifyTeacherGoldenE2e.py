from __future__ import annotations

import asyncio
import json
import sys
from typing import Any

from codaro.ai.teacher import (
    MAXIMUM_TEACHER_EVAL_SCORE,
    MINIMUM_TEACHER_EVAL_SCORE,
    TeacherEvalCase,
    TeacherOrchestrator,
    buildClarificationPlan,
    evaluateToolSequence,
    goldenEvalCases,
    prepareTeacherRuntimeTurn,
    runTeacherGoldenProviderCase,
    scoreTeacherEvalReports,
)
from codaro.ai.conversation import ConversationManager
from codaro.ai.tools import toolSchemas
from codaro.ai.toolExecutor import ToolExecutor
from codaro.ai.types import LLMConfig, ToolCall, ToolResponse
from codaro.document import createEmptyDocument


class ProviderShouldNotBeCalled:
    supportsNativeTools = True

    def __init__(self) -> None:
        self.callCount = 0

    def completeWithTools(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ToolResponse:
        del messages, tools
        self.callCount += 1
        raise AssertionError("provider should not be called")

    def complete(self, messages: list[dict[str, Any]]) -> ToolResponse:
        del messages
        self.callCount += 1
        raise AssertionError("provider should not be called")


class ScriptedProvider:
    supportsNativeTools = True

    def __init__(self, responses: list[ToolResponse]) -> None:
        self._responses = responses
        self.callCount = 0
        self.messagesByCall: list[list[dict[str, Any]]] = []

    def completeWithTools(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ToolResponse:
        del tools
        self.messagesByCall.append(cloneProviderMessages(messages))
        return self._next()

    def complete(self, messages: list[dict[str, Any]]) -> ToolResponse:
        self.messagesByCall.append(cloneProviderMessages(messages))
        return self._next()

    def _next(self) -> ToolResponse:
        self.callCount += 1
        if self._responses:
            return self._responses.pop(0)
        return ToolResponse(answer="완료", provider="fake", model="test", toolCalls=[])


class FailingProvider:
    supportsNativeTools = True
    resolvedModel = "broken-model"
    provider = "fake"

    def __init__(self) -> None:
        self.callCount = 0

    def completeWithTools(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ToolResponse:
        del messages, tools
        self.callCount += 1
        raise RuntimeError("provider broken")

    def complete(self, messages: list[dict[str, Any]]) -> ToolResponse:
        del messages
        self.callCount += 1
        raise RuntimeError("provider broken")


class ScriptedExecutor:
    def __init__(self, results: dict[str, dict[str, Any]]) -> None:
        self._results = results
        self.calls: list[dict[str, Any]] = []

    async def execute(self, toolName: str, arguments: dict[str, Any]) -> dict[str, Any]:
        self.calls.append({"tool": toolName, "arguments": arguments})
        return self._results.get(toolName, {"ok": True, "tool": toolName})


class FakeConversationManager:
    def __init__(self) -> None:
        self.assistantMessages: list[dict[str, Any]] = []
        self.toolResults: list[dict[str, str]] = []

    def addAssistantMessage(
        self,
        conversationId: str,
        content: str,
        toolCalls: list[dict[str, Any]] | None = None,
    ) -> None:
        self.assistantMessages.append({
            "conversationId": conversationId,
            "content": content,
            "toolCalls": toolCalls or [],
        })

    def addToolResult(self, conversationId: str, toolCallId: str, content: str) -> None:
        self.toolResults.append({
            "conversationId": conversationId,
            "toolCallId": toolCallId,
            "content": content,
        })


class NoSessionManager:
    def getSession(self, sessionId: str) -> None:
        del sessionId
        return None


class ContinuationProvider:
    supportsNativeTools = True

    def __init__(self) -> None:
        self.callCount = 0
        self.messages: list[dict[str, Any]] = []

    def completeWithTools(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ToolResponse:
        del tools
        self.callCount += 1
        self.messages = messages
        return ToolResponse(answer="작업 기준을 이어서 진행합니다.", provider="fake", model="test", toolCalls=[])

    def complete(self, messages: list[dict[str, Any]]) -> ToolResponse:
        self.callCount += 1
        self.messages = messages
        return ToolResponse(answer="작업 기준을 이어서 진행합니다.", provider="fake", model="test", toolCalls=[])


class ContinuationProfileManager:
    def resolve(self, provider: str | None = None, *, role: str | None = None) -> dict[str, Any]:
        del provider, role
        return {
            "provider": "custom",
            "model": "continuation-test",
            "apiKey": "test-key",
            "baseUrl": "http://local.test",
            "temperature": 0,
            "maxTokens": 128,
        }


class ContinuationProviderFactory:
    def __init__(self, provider: ContinuationProvider) -> None:
        self.provider = provider
        self.config: LLMConfig | None = None

    def __call__(self, config: LLMConfig) -> ContinuationProvider:
        self.config = config
        return self.provider


async def mainAsync() -> int:
    reports = [
        await runClarificationCase(),
        await runClarificationContinuationCase(),
        await runDependencyPreflightCase(),
        await runDependencyPreflightFailureCase(),
        await runProviderErrorCase(),
        await runCurriculumMaterializationCase(),
    ]
    failures = []
    for report in reports:
        if not report["passed"]:
            failures.append(publicReportPayload(report))
    score = scoreTeacherEvalReports(tuple(report["evaluation"] for report in reports))
    payload = {
        "passed": not failures and score >= MINIMUM_TEACHER_EVAL_SCORE,
        "score": score,
        "maxScore": MAXIMUM_TEACHER_EVAL_SCORE,
        "minimumScore": MINIMUM_TEACHER_EVAL_SCORE,
        "caseCount": len(reports),
        "failureCount": len(failures),
        "reports": [publicReportPayload(report) for report in reports],
    }

    if failures or score < MINIMUM_TEACHER_EVAL_SCORE:
        print("FAIL: teacher golden e2e verification failed", file=sys.stderr)
        print(json.dumps(payload | {"failures": failures}, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1

    print(f"ok: teacher golden e2e score {score}/{MAXIMUM_TEACHER_EVAL_SCORE}")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


async def runClarificationCase() -> dict[str, Any]:
    case = goldenCase("ambiguous-learning-asks-clarification")
    provider = ProviderShouldNotBeCalled()
    plan = buildClarificationPlan(case.prompt)
    report = await runTeacherGoldenProviderCase(
        case,
        provider=provider,
        executor=ScriptedExecutor({}),
        convManager=FakeConversationManager(),
        orchestrator=TeacherOrchestrator.fromContext({}),
        tools=toolSchemas(),
        clarificationPlan=plan,
    )
    extraFailures = []
    if provider.callCount != 0:
        extraFailures.append("clarification gate called provider")
    if report.turnPayload.get("model") != "clarification-gate":
        extraFailures.append("clarification gate did not return clarification model")
    answer = str(report.turnPayload.get("answer", ""))
    if "기본값" in answer or "default" in answer.lower():
        extraFailures.append("clarification answer exposed default wording")
    payload = firstTraceEventPayload(report.tracePayload, "clarification-gate")
    assumptions = payload.get("assumptions") if isinstance(payload, dict) else None
    if not isinstance(assumptions, dict):
        extraFailures.append("clarification payload is missing assumptions")
    else:
        missingKeys = [key for key in case.expectedClarificationAssumptionKeys if key not in assumptions]
        if missingKeys:
            extraFailures.append(f"clarification payload missing assumption keys: {missingKeys}")
    if isinstance(payload, dict) and "defaults" in payload:
        extraFailures.append("clarification payload exposed defaults compatibility alias")
    return reportPayload(report, extraFailures)


async def runClarificationContinuationCase() -> dict[str, Any]:
    caseId = "clarification-continuation-uses-assumptions"
    manager = ConversationManager()
    conversation = manager.create(role="teacher")
    prompt = "데이터 분석 커리큘럼 만들어줘"
    manager.addUserMessage(conversation.conversationId, prompt)
    plan = buildClarificationPlan(prompt)
    await runTeacherGoldenProviderCase(
        goldenCase("ambiguous-learning-asks-clarification"),
        provider=ProviderShouldNotBeCalled(),
        executor=ScriptedExecutor({}),
        convManager=manager,
        orchestrator=TeacherOrchestrator.fromContext({}),
        tools=toolSchemas(),
        conversationId=conversation.conversationId,
        messages=manager.buildMessages(conversation.conversationId),
        clarificationPlan=plan,
    )
    provider = ContinuationProvider()
    runtimeTurn = prepareTeacherRuntimeTurn(
        convManager=manager,
        profileManager=ContinuationProfileManager(),
        sessionManager=NoSessionManager(),
        documentPath=None,
        workspaceRoot=None,
        conversationId=conversation.conversationId,
        message="진행",
        roleOverride="teacher",
        providerOverride="custom",
        providerFactory=ContinuationProviderFactory(provider),
    )
    extraFailures = []
    if runtimeTurn.turn.clarificationPlan is not None:
        extraFailures.append("continuation turn re-opened clarification gate")
    if provider.callCount != 0:
        extraFailures.append("provider was called before continuation loop")
    continuationPayload = await runTeacherGoldenProviderCase(
        TeacherEvalCase(caseId=caseId, prompt="진행", expectedNoTools=True),
        provider=runtimeTurn.turn.provider,
        executor=ScriptedExecutor({}),
        convManager=manager,
        orchestrator=runtimeTurn.orchestrator,
        tools=runtimeTurn.turn.tools,
        conversationId=runtimeTurn.turn.conversationId,
        messages=runtimeTurn.turn.messages,
    )
    userMessages = [message.get("content", "") for message in provider.messages if message.get("role") == "user"]
    continuationContext = userMessages[-1] if userMessages else ""
    if "[Clarification plan]" not in continuationContext:
        extraFailures.append("continuation did not inject clarification plan")
    if "\"assumptions\"" not in continuationContext:
        extraFailures.append("continuation did not inject assumptions payload")
    if "\"defaults\"" in continuationContext:
        extraFailures.append("continuation leaked defaults alias")
    if "초급-중급 사이" not in continuationContext:
        extraFailures.append("continuation lost level assumption")
    if manager.consumePendingClarification(conversation.conversationId) is not None:
        extraFailures.append("pending clarification was not consumed")

    manager.setPendingClarification(conversation.conversationId, plan.payload())
    staleProvider = ContinuationProvider()
    staleFactory = ContinuationProviderFactory(staleProvider)
    staleRuntimeTurn = prepareTeacherRuntimeTurn(
        convManager=manager,
        profileManager=ContinuationProfileManager(),
        sessionManager=NoSessionManager(),
        documentPath=None,
        workspaceRoot=None,
        conversationId=conversation.conversationId,
        message="취소하고 SQL 커리큘럼은 새로 만들어줘",
        roleOverride="teacher",
        providerOverride="custom",
        providerFactory=staleFactory,
    )
    staleUserMessage = staleRuntimeTurn.turn.messages[-1]["content"]
    if "[Clarification plan]" in staleUserMessage:
        extraFailures.append("stale clarification leaked into a new request")
    if "초급-중급 사이" in staleUserMessage:
        extraFailures.append("stale clarification assumptions leaked into a new request")
    if staleRuntimeTurn.turn.provider is not None or staleFactory.config is not None:
        extraFailures.append("ambiguous new request bypassed clarification gate after stale pending reset")
    if manager.consumePendingClarification(conversation.conversationId) is not None:
        extraFailures.append("stale pending clarification was not cleared")

    manager.setPendingClarification(conversation.conversationId, plan.payload())
    specificProvider = ContinuationProvider()
    specificFactory = ContinuationProviderFactory(specificProvider)
    specificRuntimeTurn = prepareTeacherRuntimeTurn(
        convManager=manager,
        profileManager=ContinuationProfileManager(),
        sessionManager=NoSessionManager(),
        documentPath=None,
        workspaceRoot=None,
        conversationId=conversation.conversationId,
        message="초급 pandas 실습 중심 짧은 레슨 만들어줘",
        roleOverride="teacher",
        providerOverride="custom",
        providerFactory=specificFactory,
    )
    specificUserMessage = specificRuntimeTurn.turn.messages[-1]["content"]
    if "[Clarification plan]" in specificUserMessage:
        extraFailures.append("specific new learning request reused stale clarification")
    if "초급-중급 사이" in specificUserMessage:
        extraFailures.append("specific new learning request leaked stale assumptions")
    if specificRuntimeTurn.turn.clarificationPlan is not None:
        extraFailures.append("specific new learning request re-opened clarification gate")
    if specificRuntimeTurn.turn.provider is None or specificFactory.config is None:
        extraFailures.append("specific new learning request did not reach provider setup")
    if manager.consumePendingClarification(conversation.conversationId) is not None:
        extraFailures.append("specific new learning request did not clear stale pending")
    return reportPayload(continuationPayload, extraFailures)


async def runProviderErrorCase() -> dict[str, Any]:
    case = goldenCase("provider-error-promotes-workloop")
    provider = FailingProvider()
    report = await runTeacherGoldenProviderCase(
        case,
        provider=provider,
        executor=ScriptedExecutor({}),
        convManager=FakeConversationManager(),
        orchestrator=TeacherOrchestrator.fromContext({}),
        tools=toolSchemas(),
    )
    extraFailures = []
    if provider.callCount != 1:
        extraFailures.append(f"provider error case call count mismatch: {provider.callCount}")
    if report.turnPayload.get("toolCalls") != []:
        extraFailures.append("provider error case returned tool calls")
    if "provider broken" not in str(report.turnPayload.get("answer", "")):
        extraFailures.append("provider error case did not surface readable answer")
    return reportPayload(report, extraFailures)


async def runDependencyPreflightCase() -> dict[str, Any]:
    case = goldenCase("dependency-preflight-before-install")
    provider = ScriptedProvider([
        ToolResponse(
            answer="",
            provider="fake",
            model="test",
            toolCalls=[ToolCall(id="call-check", name="packages-check", arguments={"names": ["matplotlib"]})],
        ),
        ToolResponse(
            answer="",
            provider="fake",
            model="test",
            toolCalls=[ToolCall(id="call-install", name="packages-install", arguments={"name": "matplotlib"})],
        ),
        ToolResponse(
            answer="",
            provider="fake",
            model="test",
            toolCalls=[ToolCall(id="call-cell", name="cell-call", arguments={"operation": "check", "blockId": "cell-1"})],
        ),
        ToolResponse(answer="검증 완료", provider="fake", model="test", toolCalls=[]),
    ])
    executor = ScriptedExecutor({
        "packages-check": {"missing": ["matplotlib"], "packages": [{"name": "matplotlib", "installed": False}]},
        "packages-install": {
            "success": True,
            "package": "matplotlib",
            "installer": "uv",
            "environment": "project .venv",
            "durationMs": 42,
        },
        "cell-call": {"passed": True, "status": "ok"},
    })
    report = await runTeacherGoldenProviderCase(
        case,
        provider=provider,
        executor=executor,
        convManager=FakeConversationManager(),
        orchestrator=TeacherOrchestrator.fromContext({"dependencyPreflight": {"packages": ["matplotlib"]}}),
        tools=toolSchemas(),
    )
    observedCalls = [call["tool"] for call in executor.calls]
    extraFailures = []
    if observedCalls != ["packages-check", "packages-install", "cell-call"]:
        extraFailures.append(f"unexpected executor sequence: {observedCalls}")
    if provider.callCount != 4:
        extraFailures.append(f"dependency provider loop call count mismatch: {provider.callCount}")
    for callIndex, toolCallId in ((1, "call-check"), (2, "call-install"), (3, "call-cell")):
        if providerCallToolResultPayload(provider, callIndex, toolCallId) is None:
            extraFailures.append(f"provider did not receive tool result before call {callIndex + 1}: {toolCallId}")
    return reportPayload(report, extraFailures)


async def runDependencyPreflightFailureCase() -> dict[str, Any]:
    case = goldenCase("dependency-preflight-failure-blocks-cell-call")
    provider = ScriptedProvider([
        ToolResponse(
            answer="",
            provider="fake",
            model="test",
            toolCalls=[ToolCall(id="call-check", name="packages-check", arguments={"names": ["matplotlib"]})],
        ),
        ToolResponse(
            answer="",
            provider="fake",
            model="test",
            toolCalls=[ToolCall(id="call-cell", name="cell-call", arguments={"operation": "check", "blockId": "cell-1"})],
        ),
        ToolResponse(answer="패키지 확인 실패로 실행을 중단했습니다.", provider="fake", model="test", toolCalls=[]),
    ])
    executor = ScriptedExecutor({
        "packages-check": {"error": "kernel offline"},
        "cell-call": {"passed": True, "status": "should-not-run"},
    })
    report = await runTeacherGoldenProviderCase(
        case,
        provider=provider,
        executor=executor,
        convManager=FakeConversationManager(),
        orchestrator=TeacherOrchestrator.fromContext({"dependencyPreflight": {"packages": ["matplotlib"]}}),
        tools=toolSchemas(),
    )
    observedCalls = [call["tool"] for call in executor.calls]
    extraFailures = []
    if observedCalls != ["packages-check"]:
        extraFailures.append(f"failed preflight should block executor cell-call, observed: {observedCalls}")
    if provider.callCount != 3:
        extraFailures.append(f"failed preflight provider loop call count mismatch: {provider.callCount}")
    checkPayload = providerCallToolResultPayload(provider, 1, "call-check")
    if checkPayload is None or checkPayload.get("error") != "kernel offline":
        extraFailures.append("provider did not receive failed packages-check result")
    cellPayload = providerCallToolResultPayload(provider, 2, "call-cell")
    if cellPayload is None or cellPayload.get("policyCode") != "dependency-preflight-required":
        extraFailures.append("provider did not receive dependency-preflight policy result")
    if not any(
        violation.get("policyCode") == "dependency-preflight-required" and violation.get("toolName") == "cell-call"
        for violation in report.evaluation.policyViolations
    ):
        extraFailures.append("trace did not preserve dependency-preflight policy violation")
    if "kernel offline" not in report.evaluation.observedWorkDetails:
        extraFailures.append("failed packages-check did not expose readable workloop error")
    if "matplotlib 준비됨" in report.evaluation.observedWorkDetails:
        extraFailures.append("failed packages-check was shown as ready")
    return reportPayload(report, extraFailures)


async def runCurriculumMaterializationCase() -> dict[str, Any]:
    case = goldenCase("curriculum-yaml-materialized")
    activeDocument = createEmptyDocument("빈 문서")
    savedDocuments = []

    def getDocument():
        return activeDocument

    def setDocument(document):
        nonlocal activeDocument
        activeDocument = document
        savedDocuments.append(document)

    provider = ScriptedProvider([
        ToolResponse(
            answer="",
            provider="fake",
            model="test",
            toolCalls=[
                ToolCall(
                    id="call-yaml",
                    name="write-curriculum-yaml",
                    arguments={
                        "yamlContent": structuredLessonYaml(),
                        "category": "golden",
                        "contentId": "pandas-real",
                    },
                )
            ],
        ),
        ToolResponse(answer="커리큘럼을 구성했습니다.", provider="fake", model="test", toolCalls=[]),
    ])
    report = await runTeacherGoldenProviderCase(
        case,
        provider=provider,
        executor=ToolExecutor(NoSessionManager(), documentGetter=getDocument, documentSetter=setDocument),
        convManager=FakeConversationManager(),
        orchestrator=TeacherOrchestrator.fromContext({}),
        tools=toolSchemas(),
    )
    extraFailures = []
    if len(savedDocuments) != 1:
        extraFailures.append(f"expected one saved document, found {len(savedDocuments)}")
    if activeDocument.runtime.packages != ["pandas"]:
        extraFailures.append(f"runtime packages not preserved: {activeDocument.runtime.packages}")
    sourceTypes = {block.sourceType for block in activeDocument.blocks}
    if "sectionContract:exercise" not in sourceTypes:
        extraFailures.append("materialized document is missing sectionContract:exercise")
    if provider.callCount != 2:
        extraFailures.append(f"curriculum provider loop call count mismatch: {provider.callCount}")
    yamlResult = providerCallToolResultPayload(provider, 1, "call-yaml")
    if yamlResult is None:
        extraFailures.append("provider did not receive curriculum materialization tool result")
    elif yamlResult.get("loadedInEditor") is not True:
        extraFailures.append("provider received curriculum tool result without loadedInEditor")
    elif yamlResult.get("contractGapCount") != 0:
        extraFailures.append(f"provider received curriculum tool result with contract gaps: {yamlResult.get('contractGaps')}")
    signals = set(report.evaluation.observedResultSignals)
    if "write-curriculum-yaml.sectionCount" not in signals:
        extraFailures.append("curriculum materialization result is missing sectionCount")
    if "write-curriculum-yaml.exerciseCellCount" not in signals:
        extraFailures.append("curriculum materialization result is missing exerciseCellCount")
    if "write-curriculum-yaml.contractGapCount" not in signals:
        extraFailures.append("curriculum materialization result is missing contractGapCount")
    return reportPayload(report, extraFailures)


def reportPayload(report, extraFailures: list[str]) -> dict[str, Any]:
    failures = [*report.evaluation.failures, *extraFailures]
    evaluation = report.evaluation
    if extraFailures:
        evaluation = type(report.evaluation)(
            caseId=report.evaluation.caseId,
            passed=False,
            failures=tuple(failures),
            observedTools=report.evaluation.observedTools,
            observedWorkLabels=report.evaluation.observedWorkLabels,
            observedWorkDetails=report.evaluation.observedWorkDetails,
            workloopEventCount=report.evaluation.workloopEventCount,
            policyViolationCount=report.evaluation.policyViolationCount,
            policyViolations=report.evaluation.policyViolations,
            observedResultSignals=report.evaluation.observedResultSignals,
        )
    return {
        "caseId": report.caseId,
        "passed": report.passed and not extraFailures,
        "failures": failures,
        "evaluation": evaluation,
        "toolSequence": list(report.evaluation.observedTools),
        "workLabels": list(report.evaluation.observedWorkLabels),
        "workDetails": list(report.evaluation.observedWorkDetails),
        "signals": list(report.evaluation.observedResultSignals),
        "policyViolations": list(report.evaluation.policyViolations),
        "clarificationAssumptionKeys": clarificationAssumptionKeys(report.tracePayload),
    }


def publicReportPayload(report: dict[str, Any]) -> dict[str, Any]:
    return {
        "caseId": report["caseId"],
        "passed": report["passed"],
        "failures": report["failures"],
        "toolSequence": report["toolSequence"],
        "workDetails": report["workDetails"],
        "signals": report["signals"],
        "policyViolations": report["policyViolations"],
        "clarificationAssumptionKeys": report["clarificationAssumptionKeys"],
    }


def firstTraceEventPayload(tracePayload: dict[str, Any], eventType: str) -> dict[str, Any] | None:
    events = tracePayload.get("events")
    if not isinstance(events, list):
        return None
    for event in events:
        if not isinstance(event, dict) or event.get("eventType") != eventType:
            continue
        payload = event.get("payload")
        return payload if isinstance(payload, dict) else None
    return None


def cloneProviderMessages(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return json.loads(json.dumps(messages, ensure_ascii=False))


def providerCallToolResultPayload(provider: ScriptedProvider, callIndex: int, toolCallId: str) -> dict[str, Any] | None:
    if callIndex >= len(provider.messagesByCall):
        return None
    for message in provider.messagesByCall[callIndex]:
        if message.get("role") != "tool" or message.get("tool_call_id") != toolCallId:
            continue
        content = message.get("content")
        if not isinstance(content, str):
            return None
        try:
            payload = json.loads(content)
        except json.JSONDecodeError:
            return None
        return payload if isinstance(payload, dict) else None
    return None


def clarificationAssumptionKeys(tracePayload: dict[str, Any]) -> list[str]:
    payload = firstTraceEventPayload(tracePayload, "clarification-gate")
    if not isinstance(payload, dict):
        return []
    assumptions = payload.get("assumptions")
    if not isinstance(assumptions, dict):
        return []
    return sorted(str(key) for key in assumptions.keys())


def goldenCase(caseId: str):
    for case in goldenEvalCases:
        if case.caseId == caseId:
            return case
    raise KeyError(f"unknown golden case: {caseId}")


def structuredLessonYaml() -> str:
    return """
meta:
  title: pandas 기초
  audience: 초급
  difficulty: easy
  packages:
    - pandas
intro:
  direction: DataFrame 생성 흐름을 익힌다.
  benefits:
    - 표 데이터를 코드로 만들 수 있다.
  diagram:
    steps:
      - label: DataFrame 입력 확인
        detail: sales 열과 행 값을 먼저 고정합니다.
      - label: DataFrame 처리 실행
        detail: pandas 생성 코드를 실행해 중간 결과를 확인합니다.
      - label: sales 결과 검증
        detail: 행/열 수와 요약값 기준으로 실행 결과를 비교합니다.
    runtime:
      - label: pandas 환경
        detail: pandas 기준으로 로컬 Python 실행을 준비합니다.
      - label: DataFrame 실행
        detail: 셀을 실행해 출력, 변수, 예외 상태를 확인합니다.
      - label: DataFrame 완료
        detail: 검증된 코드를 데이터 리포트 자동화로 남깁니다.
sections:
  - id: dataframe-basics
    title: DataFrame 만들기
    subtitle: 행과 열의 감각
    goal: dict에서 DataFrame을 만드는 흐름을 익힌다.
    why: 엑셀 표 자동화의 첫 단계다.
    explanation: pandas.DataFrame은 열 이름과 값 목록으로 표를 만든다.
    tips:
      - 모든 열의 길이는 같아야 한다.
    snippet: |
      import pandas as pd
      frame = pd.DataFrame({"sales": [10]})
      frame
    exercise:
      prompt: sales 열을 가진 DataFrame을 직접 만드세요.
      starterCode: |
        import pandas as pd
        frame = ___
      solution: |
        import pandas as pd
        frame = pd.DataFrame({"sales": [10, 20]})
      hints:
        - dict의 key가 열 이름이다.
      check:
        variable: frame
    check:
      noError: 실행 오류가 없어야 한다.
""".strip()


def main() -> int:
    return asyncio.run(mainAsync())


if __name__ == "__main__":
    raise SystemExit(main())
