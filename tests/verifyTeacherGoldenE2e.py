from __future__ import annotations

import asyncio
import json
import sys
from typing import Any

from codaro.ai.teacher import (
    MAXIMUM_TEACHER_EVAL_SCORE,
    MINIMUM_TEACHER_EVAL_SCORE,
    TeacherOrchestrator,
    buildClarificationPlan,
    goldenEvalCases,
    runTeacherGoldenProviderCase,
    scoreTeacherEvalReports,
)
from codaro.ai.tools import toolSchemas
from codaro.ai.toolExecutor import ToolExecutor
from codaro.ai.types import ToolCall, ToolResponse
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

    def completeWithTools(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ToolResponse:
        del messages, tools
        return self._next()

    def complete(self, messages: list[dict[str, Any]]) -> ToolResponse:
        del messages
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


async def mainAsync() -> int:
    reports = [
        await runClarificationCase(),
        await runDependencyPreflightCase(),
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
    return reportPayload(report, extraFailures)


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
        "signals": list(report.evaluation.observedResultSignals),
    }


def publicReportPayload(report: dict[str, Any]) -> dict[str, Any]:
    return {
        "caseId": report["caseId"],
        "passed": report["passed"],
        "failures": report["failures"],
        "toolSequence": report["toolSequence"],
        "signals": report["signals"],
    }


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
