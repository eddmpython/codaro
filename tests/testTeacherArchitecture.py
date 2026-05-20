from __future__ import annotations

import asyncio
import copy

from codaro.ai.conversation import ConversationManager, buildSystemPrompt
from codaro.ai.toolExecutor import ToolExecutor
from codaro.ai.teacher import (
    MAXIMUM_TEACHER_EVAL_SCORE,
    MINIMUM_TEACHER_EVAL_SCORE,
    TeacherEvalCase,
    TeacherOrchestrator,
    TeacherRuntimeTurnRequest,
    ToolPolicyState,
    ToolPolicyViolation,
    buildClarificationPlan,
    clarificationAnswer,
    executeTeacherToolRound,
    evaluateGoldenTracePayloads,
    evaluateTeacherTurnPayload,
    evaluateToolSequence,
    evaluateToolTrace,
    evaluateToolTracePayload,
    goldenEvalCases,
    prepareTeacherRuntimeTurn,
    prepareTeacherRuntimeTurnFromRequest,
    prepareTeacherTurn,
    runTeacherChatLoop,
    runTeacherChatStream,
    runTeacherGoldenProviderCase,
    scoreTeacherEvalReports,
    teacherTurnTracePayload,
    teacherSkillToolSummary,
    teacherSkills,
    teacherStreamDoneEvent,
    teacherStreamErrorEvent,
    teacherStreamSseFrame,
    teacherStreamToolResultsEvent,
    toolPolicyViolationPayload,
    normalizeToolPolicyViolation,
    toolCallsToProviderPayloads,
    toolRequiresDependencyPreflight,
    validateTeacherSkills,
)
from codaro.ai.types import LLMConfig, ToolCall, ToolResponse
from codaro.curriculum.learningSpec import AI_TEACHER_INSTRUCTIONS
from codaro.document import createEmptyDocument
from codaro.document.cellSchema import schemaSummary
from codaro.ai.tools import toolSchemas


class _FakeConversation:
    def __init__(self, conversationId: str, role: str) -> None:
        self.conversationId = conversationId
        self.role = role


class _FakeConversationManager:
    def __init__(self) -> None:
        self.assistantMessages: list[dict] = []
        self.toolResults: list[dict] = []
        self.userMessages: list[dict] = []
        self.created: _FakeConversation | None = None
        self.existing: _FakeConversation | None = None

    def create(self, role: str, systemPrompt=None):
        self.created = _FakeConversation("conv-created", role)
        return self.created

    def get(self, conversationId: str):
        if self.existing and self.existing.conversationId == conversationId:
            return self.existing
        return None

    def addUserMessage(self, conversationId: str, content: str):
        self.userMessages.append({"conversationId": conversationId, "content": content})

    def addAssistantMessage(self, conversationId: str, content: str, toolCalls=None):
        self.assistantMessages.append({
            "conversationId": conversationId,
            "content": content,
            "toolCalls": toolCalls,
        })

    def addToolResult(self, conversationId: str, toolCallId: str, result: str):
        self.toolResults.append({
            "conversationId": conversationId,
            "toolCallId": toolCallId,
            "result": result,
        })

    def buildMessages(self, conversationId: str):
        return [
            {"role": "user", "content": item["content"]}
            for item in self.userMessages
            if item["conversationId"] == conversationId
        ]


class _FakeExecutor:
    async def execute(self, toolName: str, arguments: dict):
        return {"ok": True, "tool": toolName, "arguments": arguments}


class _FakeProvider:
    supportsNativeTools = True

    def __init__(self) -> None:
        self.callCount = 0

    def completeWithTools(self, messages: list[dict], tools: list[dict]):
        self.callCount += 1
        if self.callCount == 1:
            return ToolResponse(
                answer="",
                provider="fake",
                model="test",
                toolCalls=[ToolCall(id="call-1", name="read-cells", arguments={})],
            )
        return ToolResponse(answer="완료", provider="fake", model="test", toolCalls=[])

    def complete(self, messages: list[dict]):
        return ToolResponse(answer="완료", provider="fake", model="test", toolCalls=[])


class _ProviderShouldNotBeCalled:
    supportsNativeTools = True

    def __init__(self) -> None:
        self.callCount = 0

    def completeWithTools(self, messages: list[dict], tools: list[dict]):
        self.callCount += 1
        raise AssertionError("provider should not be called")

    def complete(self, messages: list[dict]):
        self.callCount += 1
        raise AssertionError("provider should not be called")


class _ScriptedProvider:
    supportsNativeTools = True

    def __init__(self, responses: list[ToolResponse]) -> None:
        self.responses = responses
        self.callCount = 0

    def completeWithTools(self, messages: list[dict], tools: list[dict]):
        return self._next()

    def complete(self, messages: list[dict]):
        return self._next()

    def _next(self) -> ToolResponse:
        self.callCount += 1
        if self.responses:
            return self.responses.pop(0)
        return ToolResponse(answer="완료", provider="fake", model="test", toolCalls=[])


class _ScriptedExecutor:
    def __init__(self, results: dict[str, dict]) -> None:
        self.results = results
        self.calls: list[dict] = []

    async def execute(self, toolName: str, arguments: dict):
        self.calls.append({"tool": toolName, "arguments": arguments})
        return self.results.get(toolName, {"ok": True, "tool": toolName})


class _NoSessionManager:
    def getSession(self, sessionId: str):
        del sessionId
        return None


class _FailingStreamProvider:
    supportsNativeTools = False

    def stream(self, messages: list[dict]):
        yield "부분 응답"
        raise RuntimeError("stream broken")


class _FailingProvider:
    supportsNativeTools = True
    resolvedModel = "broken-model"
    provider = "fake"

    def __init__(self) -> None:
        self.callCount = 0

    def completeWithTools(self, messages: list[dict], tools: list[dict]):
        del messages, tools
        self.callCount += 1
        raise RuntimeError("provider broken")

    def complete(self, messages: list[dict]):
        del messages
        self.callCount += 1
        raise RuntimeError("provider broken")


class _FailingSecondToolProvider:
    supportsNativeTools = True
    resolvedModel = "broken-model"
    provider = "fake"

    def __init__(self) -> None:
        self.callCount = 0

    def completeWithTools(self, messages: list[dict], tools: list[dict]):
        del tools
        self.callCount += 1
        if self.callCount == 1:
            return ToolResponse(
                answer="",
                provider="fake",
                model="test",
                toolCalls=[ToolCall(id="call-1", name="read-cells", arguments={})],
            )
        assert [message["role"] for message in messages] == ["user", "assistant", "tool"]
        raise RuntimeError("provider broken after tool")

    def complete(self, messages: list[dict]):
        del messages
        self.callCount += 1
        raise RuntimeError("provider broken after tool")


class _FakeProfileManager:
    def __init__(self) -> None:
        self.resolvedRole = ""
        self.resolvedProvider: str | None = None

    def resolve(self, provider: str | None = None, *, role: str | None = None):
        self.resolvedRole = role or ""
        self.resolvedProvider = provider
        return {
            "provider": "custom",
            "model": "fake-model",
            "apiKey": "fake-key",
            "baseUrl": "http://local.test",
            "temperature": 0.2,
            "maxTokens": 128,
        }


class _ProviderFactory:
    def __init__(self) -> None:
        self.config: LLMConfig | None = None

    def __call__(self, config: LLMConfig):
        self.config = config
        return _FakeProvider()


class _FakeSessionManager:
    def __init__(self) -> None:
        self.requestedSessionId: str | None = None

    def getSession(self, sessionId: str):
        self.requestedSessionId = sessionId
        return None


def _structuredSectionContractPayload() -> dict:
    return {
        "id": "dataframe-basics",
        "title": "DataFrame 만들기",
        "subtitle": "행과 열의 감각",
        "goal": "dict에서 DataFrame을 만드는 흐름을 익힌다.",
        "why": "엑셀 표 자동화의 첫 단계다.",
        "explanation": "열 이름과 값 목록으로 표를 만든다.",
        "tips": ["모든 열의 길이는 같아야 한다."],
        "snippet": "import pandas as pd\nframe = pd.DataFrame({'sales': [10]})\nframe",
        "exercise": {
            "prompt": "sales 열을 가진 DataFrame을 직접 만드세요.",
            "starterCode": "import pandas as pd\nframe = ___",
            "solution": "import pandas as pd\nframe = pd.DataFrame({'sales': [10, 20]})",
            "check": {"variable": "frame"},
            "hints": ["dict의 key가 열 이름이다."],
            "difficulty": "easy",
        },
        "check": {"noError": "실행 오류가 없어야 한다."},
        "contractGaps": [],
    }


def _structuredCurriculumDocumentPayload() -> dict:
    sectionContract = _structuredSectionContractPayload()
    return {
        "runtime": {"packages": ["pandas"]},
        "blocks": [
            {
                "sourceType": "intro",
                "payload": {
                    "learningContract": {
                        "meta": {"title": "pandas 기초", "packages": ["pandas"]},
                        "intro": {
                            "direction": "DataFrame 흐름을 익힌다.",
                            "diagram": {
                                "steps": [
                                    {"label": "목표", "detail": "무슨 공부"},
                                    {"label": "스니펫", "detail": "따라 칠 코드"},
                                    {"label": "실행", "detail": "입력과 검증"},
                                ],
                                "runtime": [
                                    {"label": "계약", "detail": "YAML SSOT"},
                                    {"label": "준비", "detail": "uv 사전 확인"},
                                    {"label": "피드백", "detail": "검증 결과"},
                                ],
                            },
                        },
                        "sections": [sectionContract],
                    }
                },
            },
            {
                "sourceType": "section",
                "payload": {"sectionContract": sectionContract},
            },
            {
                "type": "markdown",
                "role": "learning",
                "sourceType": "sectionContract:explanation",
                "content": "### 이번 섹션에서 공부할 것\nDataFrame을 만든다.",
                "payload": {"sectionContract": sectionContract},
            },
            {
                "type": "code",
                "role": "snippet",
                "sourceType": "sectionContract:snippet",
                "content": "import pandas as pd\nframe = pd.DataFrame({'sales': [10]})\nframe",
            },
            {
                "type": "code",
                "role": "exercise",
                "sourceType": "sectionContract:exercise",
                "content": "import pandas as pd\nframe = ___",
                "guide": {
                    "exerciseType": "sectionPractice",
                    "hints": ["dict의 key가 열 이름이다."],
                    "checkConfig": {"variable": "frame"},
                    "difficulty": "easy",
                },
            },
            {
                "type": "markdown",
                "role": "check",
                "sourceType": "sectionContract:check",
                "content": "### 검증/피드백\n- **noError**: 실행 오류가 없어야 한다.",
            },
        ]
    }


async def _collectStreamEvents(stream) -> list[dict]:
    return [event async for event in stream]


def testTeacherContextInjectionIncludesCellMapAndPreflight() -> None:
    orchestrator = TeacherOrchestrator.fromContext({
        "cellMap": [{
            "id": "cell-1",
            "type": "code",
            "role": "exercise",
            "displayKind": "practice",
            "executionKind": "python",
            "title": "변수 연습",
            "purpose": "학습자가 직접 작성하는 실습 셀이다.",
            "canRun": True,
        }],
        "dependencyPreflight": {"packages": ["pandas"]},
    })

    message = orchestrator.injectContext("답 확인해줘")

    assert "[Cell map]" in message
    assert "[Dependency preflight]" in message
    assert "cell-1" in message
    assert "pandas" in message


def testTeacherClarificationPlanStaysFocused() -> None:
    plan = buildClarificationPlan("데이터 분석 커리큘럼 만들어줘")

    assert plan.shouldAsk
    assert 1 <= len(plan.questions) <= 3
    assert "level" in plan.assumptions
    assert plan.payload()["assumptions"] == plan.assumptions
    assert "defaults" not in plan.payload()
    assert any("수준" in question for question in plan.questions)


def testTeacherClarificationAnswerShowsReadableAssumptions() -> None:
    plan = buildClarificationPlan("데이터 분석 커리큘럼 만들어줘")

    answer = clarificationAnswer(plan)

    assert "바로 만들기 전에 결과가 달라지는 부분만 되묻겠습니다." in answer
    assert "답을 주면 그 기준으로 조정하겠습니다." in answer
    assert "작업 기준:" in answer
    assert "기본값으로 진행" not in answer
    assert "- 수준: 초급-중급 사이" in answer
    assert "- 환경: 현재 Codaro 로컬 Python과 uv 패키지 설치" in answer
    assert "level:" not in answer
    assert "기본값" not in buildSystemPrompt(role="teacher")
    assert "explicit defaults" not in buildSystemPrompt(role="teacher")


def testTeacherOrchestratorInjectsClarificationPlanForLearningRequests() -> None:
    orchestrator = TeacherOrchestrator.fromContext({})

    message = orchestrator.injectContext("pandas 커리큘럼 만들어줘")

    assert "[Clarification plan]" in message
    assert "questions" in message


def testTeacherClarificationPlanSkipsWhenRequestIsSpecificEnough() -> None:
    plan = buildClarificationPlan("초급 pandas 실습 중심 짧은 레슨 만들어줘", {"lessonDepth": "brief"})

    assert not plan.shouldAsk
    assert plan.questions == ()


def testToolPolicyRequiresPackageCheckBeforeInstall() -> None:
    policy = ToolPolicyState.fromContext({"dependencyPreflight": {"packages": ["pandas"]}})

    violation = policy.validateStart("packages-install", {"name": "pandas"})
    assert violation is not None
    assert violation.code == "package-check-required"

    policy.recordResult("packages-check", {"names": ["pandas"]}, {"missing": ["pandas"]})
    assert policy.validateStart("packages-install", {"name": "pandas"}) is None


def testToolPolicyRequiresPreflightBeforeExecution() -> None:
    policy = ToolPolicyState.fromContext({"dependencyPreflight": {"packages": ["matplotlib"]}})

    violation = policy.validateStart("cell-call", {"operation": "run", "blockId": "cell-1"})
    assert violation is not None
    assert violation.code == "dependency-preflight-required"

    policy.recordResult("packages-check", {"names": ["matplotlib"]}, {"missing": []})
    assert policy.validateStart("cell-call", {"operation": "run", "blockId": "cell-1"}) is None


def testToolPolicyViolationPayloadOwnsTraceAndResultShape() -> None:
    violation = ToolPolicyViolation("dependency-preflight-required", "packages-check가 필요합니다.", "cell-call")
    payload = toolPolicyViolationPayload(violation)

    assert payload["error"] == "packages-check가 필요합니다."
    assert payload["message"] == "packages-check가 필요합니다."
    assert payload["policy"] == "dependency-preflight-required"
    assert payload["policyCode"] == "dependency-preflight-required"
    assert payload["tool"] == "cell-call"
    assert payload["toolName"] == "cell-call"
    assert normalizeToolPolicyViolation(payload) == {
        "policyCode": "dependency-preflight-required",
        "toolName": "cell-call",
        "message": "packages-check가 필요합니다.",
    }


def testToolPolicyUsesManifestCellCallLaneForPreflight() -> None:
    policy = ToolPolicyState.fromContext({"dependencyPreflight": {"packages": ["numpy"]}})

    for toolName in ("cell-call", "execute-reactive", "check-exercise"):
        assert toolRequiresDependencyPreflight(toolName)
        violation = policy.validateStart(toolName, {"blockId": "cell-1"})
        assert violation is not None
        assert violation.code == "dependency-preflight-required"

    assert not toolRequiresDependencyPreflight("get-variables")
    assert policy.validateStart("get-variables", {}) is None


def testToolPolicyRequiresInstallBeforeExecutionWhenPackageIsMissing() -> None:
    policy = ToolPolicyState.fromContext({"dependencyPreflight": {"packages": ["seaborn"]}})

    policy.recordResult("packages-check", {"names": ["seaborn"]}, {"missing": ["seaborn"]})
    violation = policy.validateStart("cell-call", {"operation": "run", "blockId": "cell-1"})
    assert violation is not None
    assert violation.code == "dependency-install-required"

    policy.recordResult("packages-install", {"name": "seaborn"}, {"success": False})
    violation = policy.validateStart("cell-call", {"operation": "run", "blockId": "cell-1"})
    assert violation is not None
    assert violation.code == "dependency-install-required"

    policy.recordResult("packages-install", {"name": "seaborn"}, {"success": True})
    assert policy.validateStart("cell-call", {"operation": "run", "blockId": "cell-1"}) is None


def testToolSequenceHarnessCapturesCoreExpectations() -> None:
    curriculumCase = next(case for case in goldenEvalCases if case.caseId == "curriculum-yaml-materialized")
    dependencyCase = next(case for case in goldenEvalCases if case.caseId == "dependency-preflight-before-install")

    assert evaluateToolSequence(curriculumCase, ["write-curriculum-yaml"]).passed
    report = evaluateToolSequence(dependencyCase, ["packages-install", "packages-check", "cell-call"])
    assert not report.passed
    assert (
        "expected exact tool sequence packages-check -> packages-install -> cell-call, "
        "observed packages-install -> packages-check -> cell-call"
    ) in report.failures
    assert "packages-check must run before packages-install" in report.failures


def testGoldenEvalCasesReferenceRegisteredTools() -> None:
    registeredTools = {schema["function"]["name"] for schema in toolSchemas()}
    caseIds = [case.caseId for case in goldenEvalCases]

    assert len(caseIds) == len(set(caseIds))
    for case in goldenEvalCases:
        referencedTools = set(case.expectedTools) | set(case.forbiddenTools)
        referencedTools.update(toolName for orderedPair in case.orderedBefore for toolName in orderedPair)
        assert referencedTools <= registeredTools


def testTeacherSkillRegistryReferencesRegisteredManifestTools() -> None:
    assert validateTeacherSkills() == ()

    summary = teacherSkillToolSummary()
    curriculum = next(item for item in summary if item["skillId"] == "curriculum-authoring")
    tools = {tool["name"]: tool for tool in curriculum["tools"]}
    prompt = buildSystemPrompt(role="teacher")

    assert tools["write-curriculum-yaml"]["lane"] == "curriculum"
    assert tools["read-cells"]["target"] == "learning-editor"
    assert "write-curriculum-yaml(lane=curriculum,target=curriculum-yaml,risk=writes)" in prompt
    assert "sections[].blocks는 legacy 변환에만" in prompt
    assert "one learning card" in prompt
    assert "intro.diagram.runtime" in prompt
    assert "create-learning-card: explanation + fill-blank card" not in prompt
    assert "Each new concept lives in one YAML section card" in prompt
    assert "explicit defaults" not in prompt


def testLearningSpecInstructionsPromoteStructuredSectionYaml() -> None:
    assert "sections, and blocks" not in AI_TEACHER_INSTRUCTIONS
    assert "intro(direction,benefits,diagram.steps,diagram.runtime)" in AI_TEACHER_INSTRUCTIONS
    assert "sections(title,subtitle,goal,why,explanation,tips,snippet,exercise,check)" in AI_TEACHER_INSTRUCTIONS
    assert "Treat each section as one learning card" in AI_TEACHER_INSTRUCTIONS
    assert "not several small blocks" in AI_TEACHER_INSTRUCTIONS
    assert "packages-check" in AI_TEACHER_INSTRUCTIONS
    assert "packages-install" in AI_TEACHER_INSTRUCTIONS
    assert "packages/install" not in AI_TEACHER_INSTRUCTIONS
    assert "insert-block" not in AI_TEACHER_INSTRUCTIONS


def testTeacherSkillRegistryReportsMissingRequiredTools() -> None:
    issues = validateTeacherSkills({"read-cells"})
    missing = {issue.toolName: issue for issue in issues if issue.code == "missing-required-tool"}

    assert missing["write-curriculum-yaml"].skillId == "curriculum-authoring"
    assert missing["packages-check"].skillId == "package-preflight"


def testTracePayloadsHaveStableTraceId() -> None:
    toolSchemas()
    orchestrator = TeacherOrchestrator.fromContext({})
    trace = orchestrator.startTrace("conv-1")

    start = orchestrator.toolCallStart(trace, "call-1", "read-cells", {})
    done = orchestrator.toolCallResult(trace, "call-1", "read-cells", {}, {"cells": []})

    assert start["traceId"] == trace.traceId
    assert done["traceId"] == trace.traceId
    assert start["lane"] == "read"
    assert done["target"] == "learning-editor"
    assert start["workLabel"] == "노트북 셀 읽기"
    assert done["workDetail"] == "현재 노트북 구조와 셀 역할 확인"
    assert start["traceEventIndex"] == 2
    assert done["traceEventIndex"] == 3
    assert [event.eventType for event in trace.events] == ["turn-start", "tool-start", "tool-result"]
    assert trace.summary()["toolSequence"] == ["read-cells"]
    assert trace.summary()["workloop"][0]["workLabel"] == "노트북 셀 읽기"
    assert trace.summary()["workloop"][0]["lane"] == "read"


def testToolResultWorkDetailSummarizesCurriculumMaterialization() -> None:
    orchestrator = TeacherOrchestrator.fromContext({})
    trace = orchestrator.startTrace("conv-curriculum-detail")
    document = _structuredCurriculumDocumentPayload()

    done = orchestrator.toolCallResult(
        trace,
        "call-yaml",
        "write-curriculum-yaml",
        {},
        {
            "title": "pandas 기초",
            "document": document,
            "loadedInEditor": True,
        },
    )

    assert "pandas 기초" in done["workDetail"]
    assert "섹션 카드 1개" in done["workDetail"]
    assert "실습 셀 1개" in done["workDetail"]
    assert "실행 패키지 1개" in done["workDetail"]
    assert "에디터 반영" in done["workDetail"]
    assert trace.summary()["workloop"][0]["workDetail"] == done["workDetail"]


def testEvalHarnessCanReadTraceSequence() -> None:
    orchestrator = TeacherOrchestrator.fromContext({})
    trace = orchestrator.startTrace("conv-2")
    orchestrator.toolCallStart(trace, "call-1", "read-cells", {})
    orchestrator.toolCallResult(trace, "call-1", "read-cells", {}, {"blocks": []})
    orchestrator.toolCallStart(trace, "call-2", "cell-call", {"operation": "check"})
    orchestrator.toolCallResult(trace, "call-2", "cell-call", {"operation": "check"}, {"passed": True})

    case = next(case for case in goldenEvalCases if case.caseId == "answer-check-uses-cell-call")
    report = evaluateToolTrace(case, trace)

    assert report.passed
    assert report.observedTools == ("read-cells", "cell-call")


def testEvalHarnessCanReadTracePayload() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "answer-check-uses-cell-call")
    tracePayload = {
        "toolSequence": ["read-cells", "cell-call"],
        "policyViolationCount": 0,
        "toolCalls": [
            {"name": "read-cells", "result": {"blocks": []}},
            {"name": "cell-call", "result": {"passed": True, "feedback": "ok"}},
        ],
    }

    report = evaluateToolTracePayload(case, tracePayload)

    assert report.passed
    assert report.observedTools == ("read-cells", "cell-call")
    assert report.policyViolationCount == 0
    assert report.policyViolations == ()
    assert "cell-call.passed" in report.observedResultSignals


def testEvalHarnessCanReadTeacherTurnPayload() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "answer-check-uses-cell-call")
    turnPayload = {
        "trace": {"toolSequence": ["read-cells", "cell-call"], "policyViolationCount": 0},
        "toolCalls": [
            {"name": "read-cells", "result": {"blocks": []}},
            {"name": "cell-call", "result": {"passed": True}},
        ],
    }

    tracePayload = teacherTurnTracePayload(turnPayload)
    report = evaluateTeacherTurnPayload(case, turnPayload)

    assert tracePayload["toolCalls"] == turnPayload["toolCalls"]
    assert report.passed


def testEvalHarnessCanValidateStructuredCurriculumTrace() -> None:
    orchestrator = TeacherOrchestrator.fromContext({})
    trace = orchestrator.startTrace("conv-curriculum")
    orchestrator.toolCallStart(trace, "call-1", "write-curriculum-yaml", {})
    orchestrator.toolCallResult(
        trace,
        "call-1",
        "write-curriculum-yaml",
        {},
        {
            "document": _structuredCurriculumDocumentPayload(),
            "sectionCount": 1,
            "exerciseCellCount": 1,
            "contractGapCount": 0,
            "loadedInEditor": True,
        },
    )

    case = next(case for case in goldenEvalCases if case.caseId == "curriculum-yaml-materialized")
    report = evaluateToolTrace(case, trace)

    assert report.passed
    assert trace.summary()["yamlContractObserved"]
    assert any("섹션 카드" in detail for detail in report.observedWorkDetails)


def testEvalHarnessValidatesClarificationGateTrace() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "ambiguous-learning-asks-clarification")
    plan = buildClarificationPlan(case.prompt)
    orchestrator = TeacherOrchestrator.fromContext({})
    trace = orchestrator.startTrace("conv-clarification-eval")
    trace.record("clarification-gate", plan.payload())

    report = evaluateToolTrace(case, trace)

    assert report.passed
    assert report.observedTools == ()
    assert report.observedWorkLabels == ("작업 전 확인 질문",)
    assert any("핵심 질문" in detail for detail in report.observedWorkDetails)
    assert any("초급-중급 사이" in detail for detail in report.observedWorkDetails)
    assert any("직접 입력 셀" in detail for detail in report.observedWorkDetails)


def testEvalHarnessFailsWeakClarificationGateTrace() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "ambiguous-learning-asks-clarification")
    tracePayload = {
        "toolSequence": [],
        "workloop": [{"workLabel": "작업 전 확인 질문"}],
        "events": [
            {
                "eventType": "clarification-gate",
                "payload": {
                    "questions": [],
                    "assumptions": {"level": "초급"},
                },
            }
        ],
    }

    report = evaluateToolTracePayload(case, tracePayload)

    assert not report.passed
    assert "clarification question count out of range: 0" in report.failures
    assert "missing clarification assumptions: depth, environment, balance" in report.failures
    assert "missing expected work detail: 핵심 질문" in report.failures


def testEvalHarnessRequiresClarificationAssumptionsPayload() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "ambiguous-learning-asks-clarification")
    tracePayload = {
        "events": [
            {
                "eventType": "clarification-gate",
                "payload": {
                    "questions": ["학습자 수준은 어느 정도로 잡을까요?"],
                    "defaults": {
                        "level": "초급",
                        "depth": "실습 중심",
                        "environment": "uv",
                        "balance": "실습",
                    },
                },
            }
        ],
    }

    report = evaluateToolTracePayload(case, tracePayload)

    assert not report.passed
    assert "missing clarification assumptions payload" in report.failures


def testEvalHarnessChecksWorkloopAndStructuredYamlContract() -> None:
    case = TeacherEvalCase(
        caseId="structured-curriculum",
        prompt="pandas 실습 레슨 만들어줘",
        expectedTools=("write-curriculum-yaml",),
        expectedWorkLabels=("커리큘럼 YAML 전개",),
        expectedWorkDetails=("구조화된 YAML을 섹션 카드와 실행 셀로 변환",),
        expectedTraceEvents=("tool-start", "tool-result"),
        expectedYamlContract=True,
        expectedSectionCardFlow=True,
    )
    tracePayload = {
        "toolSequence": ["write-curriculum-yaml"],
        "workloop": [{
            "workLabel": "커리큘럼 YAML 전개",
            "workDetail": "구조화된 YAML을 섹션 카드와 실행 셀로 변환",
        }],
        "events": [
            {"eventType": "tool-start", "payload": {"name": "write-curriculum-yaml", "workLabel": "커리큘럼 YAML 전개"}},
            {"eventType": "tool-result", "payload": {"name": "write-curriculum-yaml"}},
        ],
        "toolCalls": [
            {
                "name": "write-curriculum-yaml",
                "result": {
                    "document": _structuredCurriculumDocumentPayload(),
                },
            }
        ],
    }

    report = evaluateToolTracePayload(case, tracePayload)

    assert report.passed
    assert report.observedWorkLabels == ("커리큘럼 YAML 전개",)
    assert report.observedWorkDetails == ("구조화된 YAML을 섹션 카드와 실행 셀로 변환",)


def testEvalHarnessFailsMissingStructuredYamlContract() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "curriculum-yaml-materialized")
    report = evaluateToolTracePayload(case, {"toolSequence": ["write-curriculum-yaml"]})

    assert not report.passed
    assert "missing structured learning YAML contract" in report.failures
    assert "missing structured section card flow" in report.failures


def testEvalHarnessFailsMissingStructuredSectionCardFlow() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "curriculum-yaml-materialized")
    tracePayload = {
        "toolSequence": ["write-curriculum-yaml"],
        "toolCalls": [
            {
                "name": "write-curriculum-yaml",
                "result": {
                    "document": {
                        "blocks": [
                            {"payload": {"learningContract": {"meta": {"title": "lesson"}}}},
                            {
                                "sourceType": "section",
                                "payload": {"sectionContract": _structuredSectionContractPayload()},
                            },
                        ]
                    }
                },
            }
        ],
    }

    report = evaluateToolTracePayload(case, tracePayload)

    assert not report.passed
    assert "missing structured section card flow" in report.failures


def testEvalHarnessRequiresLoadedEditorDocumentAndRuntimePackages() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "curriculum-yaml-materialized")
    document = _structuredCurriculumDocumentPayload()
    document["runtime"] = {"packages": []}
    tracePayload = {
        "toolSequence": ["write-curriculum-yaml"],
        "toolCalls": [
            {
                "name": "write-curriculum-yaml",
                "result": {
                    "document": document,
                    "loadedInEditor": False,
                },
            }
        ],
    }

    report = evaluateToolTracePayload(case, tracePayload)

    assert not report.passed
    assert "curriculum document was not loaded in editor" in report.failures
    assert "missing runtime packages: pandas" in report.failures


def testEvalHarnessRequiresDiagramRuntimeContract() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "curriculum-yaml-materialized")
    document = copy.deepcopy(_structuredCurriculumDocumentPayload())
    learningContract = document["blocks"][0]["payload"]["learningContract"]
    learningContract["intro"]["diagram"]["runtime"] = []
    tracePayload = {
        "toolSequence": ["write-curriculum-yaml"],
        "toolCalls": [
            {
                "name": "write-curriculum-yaml",
                "result": {
                    "document": document,
                    "loadedInEditor": True,
                },
            }
        ],
    }

    report = evaluateToolTracePayload(case, tracePayload)

    assert not report.passed
    assert "missing diagram runtime detail: uv 사전 확인, 검증 결과" in report.failures


def testEvalHarnessEvaluatesGoldenTracePayloadSet() -> None:
    tracePayloads = {
        "answer-check-uses-cell-call": {
            "toolSequence": ["read-cells", "cell-call"],
            "policyViolationCount": 0,
            "toolCalls": [
                {"name": "read-cells", "result": {"blocks": []}},
                {"name": "cell-call", "result": {"passed": True}},
            ],
        },
        "dependency-preflight-before-install": {
            "toolSequence": ["packages-check", "packages-install", "cell-call"],
            "policyViolationCount": 0,
            "workloop": [
                {"workLabel": "라이브러리 확인", "workDetail": "matplotlib 설치 여부 확인"},
                {"workLabel": "uv 라이브러리 설치", "workDetail": "matplotlib를 uv로 설치"},
                {"workLabel": "셀 실행/검증", "workDetail": "cell-1 실행 또는 검증"},
            ],
            "events": [
                {"eventType": "tool-start"},
                {"eventType": "tool-result"},
            ],
            "toolCalls": [
                {"name": "packages-check", "result": {"missing": ["matplotlib"]}},
                {"name": "packages-install", "result": {"success": True, "installer": "uv", "durationMs": 42}},
                {"name": "cell-call", "result": {"passed": True}},
            ],
        },
    }
    cases = tuple(
        case
        for case in goldenEvalCases
        if case.caseId in {"answer-check-uses-cell-call", "dependency-preflight-before-install"}
    )

    report = evaluateGoldenTracePayloads(tracePayloads, cases=cases)

    assert report.passed
    assert report.missingCaseIds == ()
    payload = report.payload()
    assert payload["caseCount"] == 2
    assert payload["score"] == MAXIMUM_TEACHER_EVAL_SCORE
    assert payload["maxScore"] == MAXIMUM_TEACHER_EVAL_SCORE
    assert payload["minimumScore"] == MINIMUM_TEACHER_EVAL_SCORE


def testGoldenProviderCaseRunsActualLoopAndValidatesResults() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "dependency-preflight-before-install")
    provider = _ScriptedProvider([
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
    executor = _ScriptedExecutor({
        "packages-check": {"missing": ["matplotlib"], "installed": []},
        "packages-install": {"success": True, "package": "matplotlib", "installer": "uv", "durationMs": 42},
        "cell-call": {"passed": True, "feedback": "정답입니다."},
    })
    orchestrator = TeacherOrchestrator.fromContext({"dependencyPreflight": {"packages": ["matplotlib"]}})

    report = asyncio.run(runTeacherGoldenProviderCase(
        case,
        provider=provider,
        executor=executor,
        convManager=_FakeConversationManager(),
        orchestrator=orchestrator,
        tools=[{"type": "function"}],
    ))

    assert report.passed
    assert report.payload()["score"] == MAXIMUM_TEACHER_EVAL_SCORE
    assert report.evaluation.observedTools == ("packages-check", "packages-install", "cell-call")
    assert report.evaluation.failures == ()
    assert "cell-call.passed" in report.evaluation.observedResultSignals
    assert report.turnPayload["answer"] == "검증 완료"
    assert [call["tool"] for call in executor.calls] == ["packages-check", "packages-install", "cell-call"]


def testGoldenProviderCaseStopsAtClarificationGateWithoutProviderCall() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "ambiguous-learning-asks-clarification")
    provider = _ProviderShouldNotBeCalled()
    plan = buildClarificationPlan(case.prompt)

    report = asyncio.run(runTeacherGoldenProviderCase(
        case,
        provider=provider,
        executor=_FakeExecutor(),
        convManager=_FakeConversationManager(),
        orchestrator=TeacherOrchestrator.fromContext({}),
        tools=toolSchemas(),
        clarificationPlan=plan,
    ))

    assert report.passed
    assert provider.callCount == 0
    assert report.turnPayload["provider"] == "codaro"
    assert report.turnPayload["model"] == "clarification-gate"
    assert report.turnPayload["toolCalls"] == []
    assert "학습자 수준" in report.turnPayload["answer"]
    assert report.tracePayload["workloop"][0]["workLabel"] == "작업 전 확인 질문"


def testGoldenProviderCaseValidatesStructuredYamlMaterialization() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "curriculum-yaml-materialized")
    provider = _ScriptedProvider([
        ToolResponse(
            answer="",
            provider="fake",
            model="test",
            toolCalls=[ToolCall(id="call-yaml", name="write-curriculum-yaml", arguments={"yamlContent": "meta:\n  title: pandas 기초"})],
        ),
        ToolResponse(answer="커리큘럼을 구성했습니다.", provider="fake", model="test", toolCalls=[]),
    ])
    executor = _ScriptedExecutor({
        "write-curriculum-yaml": {
            "document": _structuredCurriculumDocumentPayload(),
            "sectionCount": 1,
            "exerciseCellCount": 1,
            "contractGapCount": 0,
            "loadedInEditor": True,
        },
    })

    report = asyncio.run(runTeacherGoldenProviderCase(
        case,
        provider=provider,
        executor=executor,
        convManager=_FakeConversationManager(),
        orchestrator=TeacherOrchestrator.fromContext({}),
        tools=[{"type": "function"}],
    ))

    assert report.passed
    assert report.tracePayload["yamlContractObserved"]
    assert "write-curriculum-yaml.document" in report.evaluation.observedResultSignals
    assert "write-curriculum-yaml.contractGapCount" in report.evaluation.observedResultSignals


def testEvalHarnessFailsStructuredYamlContractGaps() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "curriculum-yaml-materialized")
    document = copy.deepcopy(_structuredCurriculumDocumentPayload())
    sectionContract = document["blocks"][1]["payload"]["sectionContract"]
    sectionContract["contractGaps"] = ["snippet"]
    tracePayload = {
        "toolSequence": ["write-curriculum-yaml"],
        "toolCalls": [
            {
                "name": "write-curriculum-yaml",
                "result": {
                    "document": document,
                    "sectionCount": 1,
                    "exerciseCellCount": 1,
                    "contractGapCount": 1,
                    "contractGaps": [{"title": "DataFrame 만들기", "missingFields": ["snippet"]}],
                    "loadedInEditor": True,
                },
            }
        ],
    }

    report = evaluateToolTracePayload(case, tracePayload)

    assert not report.passed
    assert any("structured YAML contract gaps observed" in failure for failure in report.failures)


def testGoldenProviderCaseUsesRealCurriculumYamlHandlerToChangeDocument() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "curriculum-yaml-materialized")
    yamlContent = """
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
      - label: 목표
        detail: 무슨 공부
      - label: 스니펫
        detail: 따라 칠 코드
      - label: 실행
        detail: 입력과 검증
    runtime:
      - label: 계약
        detail: YAML SSOT
      - label: 준비
        detail: uv 사전 확인
      - label: 피드백
        detail: 검증 결과
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
    provider = _ScriptedProvider([
        ToolResponse(
            answer="",
            provider="fake",
            model="test",
            toolCalls=[
                ToolCall(
                    id="call-yaml",
                    name="write-curriculum-yaml",
                    arguments={"yamlContent": yamlContent, "category": "golden", "contentId": "pandas-real"},
                )
            ],
        ),
        ToolResponse(answer="커리큘럼을 구성했습니다.", provider="fake", model="test", toolCalls=[]),
    ])
    activeDocument = createEmptyDocument("빈 문서")
    savedDocuments = []

    def getDocument():
        return activeDocument

    def setDocument(document):
        nonlocal activeDocument
        activeDocument = document
        savedDocuments.append(document)

    executor = ToolExecutor(_NoSessionManager(), documentGetter=getDocument, documentSetter=setDocument)

    report = asyncio.run(runTeacherGoldenProviderCase(
        case,
        provider=provider,
        executor=executor,
        convManager=_FakeConversationManager(),
        orchestrator=TeacherOrchestrator.fromContext({}),
        tools=toolSchemas(),
    ))

    assert report.passed
    assert len(savedDocuments) == 1
    assert activeDocument.title == "pandas 기초"
    assert activeDocument.runtime.packages == ["pandas"]
    assert report.turnPayload["toolCalls"][0]["result"]["loadedInEditor"] is True
    assert report.turnPayload["toolCalls"][0]["result"]["contractGapCount"] == 0
    assert "sectionContract:exercise" in {block.sourceType for block in activeDocument.blocks}
    assert "write-curriculum-yaml.document" in report.evaluation.observedResultSignals
    assert "write-curriculum-yaml.loadedInEditor" in report.evaluation.observedResultSignals
    assert "write-curriculum-yaml.contractGapCount" in report.evaluation.observedResultSignals


def testEvalHarnessFailsMissingGoldenTracePayload() -> None:
    report = evaluateGoldenTracePayloads({}, cases=(goldenEvalCases[0],))

    assert not report.passed
    assert report.score == 0.0
    assert report.missingCaseIds == (goldenEvalCases[0].caseId,)
    assert report.reports[0].failures == ("missing trace payload",)


def testEvalHarnessScoresPartialGoldenReports() -> None:
    passedReport = evaluateToolSequence(TeacherEvalCase(caseId="passed", prompt=""), [])
    failedReport = evaluateToolSequence(
        TeacherEvalCase(caseId="failed", prompt="", expectedTools=("cell-call",)),
        [],
    )

    assert passedReport.passed
    assert not failedReport.passed
    assert scoreTeacherEvalReports((passedReport, failedReport)) == 5.0


def testEvalHarnessFailsPolicyViolationsByDefault() -> None:
    orchestrator = TeacherOrchestrator.fromContext({})
    trace = orchestrator.startTrace("conv-policy")
    orchestrator.toolPolicyViolation(
        trace,
        ToolPolicyViolation("dependency-preflight-required", "packages-check가 필요합니다.", "cell-call"),
    )

    case = TeacherEvalCase(caseId="no-policy-violations", prompt="셀 실행해줘")
    report = evaluateToolTrace(case, trace)

    traceSummary = trace.summary()

    assert not report.passed
    assert traceSummary["policyViolations"] == [{
        "policyCode": "dependency-preflight-required",
        "toolName": "cell-call",
        "message": "packages-check가 필요합니다.",
    }]
    assert traceSummary["workloop"][0]["workLabel"] == "도구 정책 확인"
    assert traceSummary["workloop"][0]["target"] == "teacher-tool-policy"
    assert traceSummary["workloop"][0]["toolName"] == "cell-call"
    assert traceSummary["workloop"][0]["status"] == "error"
    assert traceSummary["workloop"][0]["error"] == "packages-check가 필요합니다."
    assert report.policyViolationCount == 1
    assert any("policy violations observed: 1" in failure for failure in report.failures)
    assert report.policyViolations == ({
        "policyCode": "dependency-preflight-required",
        "toolName": "cell-call",
        "message": "packages-check가 필요합니다.",
    },)
    assert "dependency-preflight-required:cell-call" in report.failures[0]


def testProviderLoopOwnsToolRoundRecording() -> None:
    toolCalls = [ToolCall(id="call-1", name="read-cells", arguments={"includeContent": False})]
    providerPayloads = toolCallsToProviderPayloads(toolCalls)

    assert providerPayloads[0]["function"]["name"] == "read-cells"
    assert '"includeContent": false' in providerPayloads[0]["function"]["arguments"]

    convManager = _FakeConversationManager()
    messages: list[dict] = []
    orchestrator = TeacherOrchestrator.fromContext({})
    trace = orchestrator.startTrace("conv-3")

    roundResult = asyncio.run(executeTeacherToolRound(
        toolCalls=toolCalls,
        assistantAnswer="",
        convManager=convManager,
        conversationId="conv-3",
        messages=messages,
        executor=_FakeExecutor(),
        policy=ToolPolicyState(),
        orchestrator=orchestrator,
        trace=trace,
    ))

    assert len(roundResult.toolStarts) == 1
    assert len(roundResult.toolResults) == 1
    assert roundResult.toolResults[0]["status"] == "done"
    assert convManager.assistantMessages[0]["toolCalls"] == providerPayloads
    assert convManager.toolResults[0]["toolCallId"] == "call-1"
    assert [message["role"] for message in messages] == ["assistant", "tool"]
    assert trace.toolSequence() == ["read-cells"]


def testProviderLoopOwnsNonStreamingTurn() -> None:
    convManager = _FakeConversationManager()
    messages: list[dict] = [{"role": "user", "content": "셀 읽어줘"}]
    orchestrator = TeacherOrchestrator.fromContext({})

    payload = asyncio.run(runTeacherChatLoop(
        provider=_FakeProvider(),
        convManager=convManager,
        conversationId="conv-4",
        messages=messages,
        tools=[{"type": "function"}],
        executor=_FakeExecutor(),
        orchestrator=orchestrator,
    ))

    assert payload["answer"] == "완료"
    assert payload["toolCalls"][0]["name"] == "read-cells"
    assert payload["trace"]["toolSequence"] == ["read-cells"]
    assert [message["role"] for message in messages] == ["user", "assistant", "tool"]


def testProviderLoopReportsProviderErrorsInTrace() -> None:
    convManager = _FakeConversationManager()
    provider = _FailingProvider()
    messages: list[dict] = [{"role": "user", "content": "말해줘"}]
    orchestrator = TeacherOrchestrator.fromContext({})

    payload = asyncio.run(runTeacherChatLoop(
        provider=provider,
        convManager=convManager,
        conversationId="conv-provider-error",
        messages=messages,
        tools=[{"type": "function"}],
        executor=_FakeExecutor(),
        orchestrator=orchestrator,
    ))

    case = next(case for case in goldenEvalCases if case.caseId == "provider-error-promotes-workloop")
    report = evaluateTeacherTurnPayload(case, payload)

    assert report.passed
    assert provider.callCount == 1
    assert payload["provider"] == "fake"
    assert payload["model"] == "broken-model"
    assert payload["toolCalls"] == []
    assert "provider 응답 중 오류가 발생했습니다: provider broken" == payload["answer"]
    assert payload["trace"]["errorCount"] == 1
    assert payload["trace"]["toolSequence"] == []
    assert payload["trace"]["workloop"][0]["workLabel"] == "provider 오류"
    assert payload["trace"]["workloop"][0]["workDetail"] == "provider 응답 처리 중단"
    assert payload["trace"]["workloop"][0]["error"] == "provider broken"
    assert convManager.assistantMessages[0]["content"] == payload["answer"]


def testProviderLoopReturnsClarificationWithoutProviderCall() -> None:
    convManager = _FakeConversationManager()
    messages: list[dict] = [{"role": "user", "content": "데이터 분석 커리큘럼 만들어줘"}]
    orchestrator = TeacherOrchestrator.fromContext({})
    plan = buildClarificationPlan("데이터 분석 커리큘럼 만들어줘")

    payload = asyncio.run(runTeacherChatLoop(
        provider=None,
        convManager=convManager,
        conversationId="conv-clarify",
        messages=messages,
        tools=[],
        executor=_FakeExecutor(),
        orchestrator=orchestrator,
        clarificationPlan=plan,
    ))

    assert payload["provider"] == "codaro"
    assert payload["model"] == "clarification-gate"
    assert payload["toolCalls"] == []
    assert payload["trace"]["toolSequence"] == []
    assert payload["trace"]["eventCount"] == 3
    assert payload["trace"]["workloop"][0]["workLabel"] == "작업 전 확인 질문"
    assert payload["trace"]["workloop"][0]["target"] == "clarification-gate"
    assert "학습자 수준" in payload["answer"]
    assert convManager.assistantMessages[0]["content"] == payload["answer"]


def testProviderLoopStoresClarificationForContinuation() -> None:
    convManager = ConversationManager()
    conversation = convManager.create(role="teacher")
    convManager.addUserMessage(conversation.conversationId, "데이터 분석 커리큘럼 만들어줘")
    plan = buildClarificationPlan("데이터 분석 커리큘럼 만들어줘")

    payload = asyncio.run(runTeacherChatLoop(
        provider=None,
        convManager=convManager,
        conversationId=conversation.conversationId,
        messages=convManager.buildMessages(conversation.conversationId),
        tools=[],
        executor=_FakeExecutor(),
        orchestrator=TeacherOrchestrator.fromContext({}),
        clarificationPlan=plan,
    ))

    pending = convManager.consumePendingClarification(conversation.conversationId)
    assert payload["model"] == "clarification-gate"
    assert pending is not None
    assert pending["assumptions"]["level"] == "초급-중급 사이"
    assert "defaults" not in pending


def testPrepareTeacherRuntimeTurnInjectsPendingClarification(tmp_path) -> None:
    convManager = ConversationManager()
    conversation = convManager.create(role="teacher")
    plan = buildClarificationPlan("데이터 분석 커리큘럼 만들어줘")
    convManager.setPendingClarification(conversation.conversationId, plan.payload())
    profileManager = _FakeProfileManager()
    providerFactory = _ProviderFactory()
    sessionManager = _FakeSessionManager()

    runtimeTurn = prepareTeacherRuntimeTurn(
        convManager=convManager,
        profileManager=profileManager,
        sessionManager=sessionManager,
        documentPath=None,
        workspaceRoot=tmp_path,
        conversationId=conversation.conversationId,
        message="진행",
        roleOverride="teacher",
        providerOverride="custom",
        providerFactory=providerFactory,
    )

    finalUserMessage = runtimeTurn.turn.messages[-1]["content"]
    assert runtimeTurn.turn.clarificationPlan is None
    assert isinstance(runtimeTurn.turn.provider, _FakeProvider)
    assert "[Clarification plan]" in finalUserMessage
    assert '"assumptions"' in finalUserMessage
    assert '"defaults"' not in finalUserMessage
    assert "초급-중급 사이" in finalUserMessage
    assert convManager.consumePendingClarification(conversation.conversationId) is None


def testPrepareTeacherRuntimeTurnAppliesPendingClarificationToAxisAnswer(tmp_path) -> None:
    convManager = ConversationManager()
    conversation = convManager.create(role="teacher")
    plan = buildClarificationPlan("데이터 분석 커리큘럼 만들어줘")
    convManager.setPendingClarification(conversation.conversationId, plan.payload())
    profileManager = _FakeProfileManager()
    providerFactory = _ProviderFactory()
    sessionManager = _FakeSessionManager()

    runtimeTurn = prepareTeacherRuntimeTurn(
        convManager=convManager,
        profileManager=profileManager,
        sessionManager=sessionManager,
        documentPath=None,
        workspaceRoot=tmp_path,
        conversationId=conversation.conversationId,
        message="초급 실습 중심으로 pandas까지 진행",
        roleOverride="teacher",
        providerOverride="custom",
        providerFactory=providerFactory,
    )

    finalUserMessage = runtimeTurn.turn.messages[-1]["content"]
    assert runtimeTurn.turn.clarificationPlan is None
    assert isinstance(runtimeTurn.turn.provider, _FakeProvider)
    assert "[Clarification plan]" in finalUserMessage
    assert "초급-중급 사이" in finalUserMessage
    assert convManager.consumePendingClarification(conversation.conversationId) is None


def testPrepareTeacherRuntimeTurnDropsPendingClarificationForNewRequest(tmp_path) -> None:
    convManager = ConversationManager()
    conversation = convManager.create(role="teacher")
    plan = buildClarificationPlan("데이터 분석 커리큘럼 만들어줘")
    convManager.setPendingClarification(conversation.conversationId, plan.payload())
    profileManager = _FakeProfileManager()
    providerFactory = _ProviderFactory()
    sessionManager = _FakeSessionManager()

    runtimeTurn = prepareTeacherRuntimeTurn(
        convManager=convManager,
        profileManager=profileManager,
        sessionManager=sessionManager,
        documentPath=None,
        workspaceRoot=tmp_path,
        conversationId=conversation.conversationId,
        message="취소하고 SQL 커리큘럼은 새로 만들어줘",
        roleOverride="teacher",
        providerOverride="custom",
        providerFactory=providerFactory,
    )

    finalUserMessage = runtimeTurn.turn.messages[-1]["content"]
    assert runtimeTurn.turn.clarificationPlan is not None
    assert runtimeTurn.turn.provider is None
    assert "[Clarification plan]" not in finalUserMessage
    assert "초급-중급 사이" not in finalUserMessage
    assert convManager.consumePendingClarification(conversation.conversationId) is None


def testPrepareTeacherRuntimeTurnDropsPendingClarificationForSpecificNewLearningRequest(tmp_path) -> None:
    convManager = ConversationManager()
    conversation = convManager.create(role="teacher")
    plan = buildClarificationPlan("데이터 분석 커리큘럼 만들어줘")
    convManager.setPendingClarification(conversation.conversationId, plan.payload())
    profileManager = _FakeProfileManager()
    providerFactory = _ProviderFactory()
    sessionManager = _FakeSessionManager()

    runtimeTurn = prepareTeacherRuntimeTurn(
        convManager=convManager,
        profileManager=profileManager,
        sessionManager=sessionManager,
        documentPath=None,
        workspaceRoot=tmp_path,
        conversationId=conversation.conversationId,
        message="초급 pandas 실습 중심 짧은 레슨 만들어줘",
        roleOverride="teacher",
        providerOverride="custom",
        providerFactory=providerFactory,
    )

    finalUserMessage = runtimeTurn.turn.messages[-1]["content"]
    assert runtimeTurn.turn.clarificationPlan is None
    assert isinstance(runtimeTurn.turn.provider, _FakeProvider)
    assert providerFactory.config is not None
    assert "[Clarification plan]" not in finalUserMessage
    assert "초급-중급 사이" not in finalUserMessage
    assert convManager.consumePendingClarification(conversation.conversationId) is None


def testPrepareTeacherTurnOwnsConversationAndProviderSetup() -> None:
    convManager = _FakeConversationManager()
    profileManager = _FakeProfileManager()
    providerFactory = _ProviderFactory()

    turn = prepareTeacherTurn(
        convManager=convManager,
        profileManager=profileManager,
        message="커리큘럼 만들어줘",
        roleOverride="teacher",
        providerOverride="custom",
        providerFactory=providerFactory,
    )

    assert turn.conversationId == "conv-created"
    assert turn.role == "teacher"
    assert turn.messages == [{"role": "user", "content": "커리큘럼 만들어줘"}]
    assert turn.tools
    assert isinstance(turn.provider, _FakeProvider)
    assert profileManager.resolvedRole == "teacher"
    assert profileManager.resolvedProvider == "custom"
    assert providerFactory.config is not None
    assert providerFactory.config.provider == "custom"
    assert providerFactory.config.model == "fake-model"


def testPrepareTeacherRuntimeTurnOwnsContextAndExecutorSetup(tmp_path) -> None:
    convManager = _FakeConversationManager()
    profileManager = _FakeProfileManager()
    providerFactory = _ProviderFactory()
    sessionManager = _FakeSessionManager()

    runtimeTurn = prepareTeacherRuntimeTurn(
        convManager=convManager,
        profileManager=profileManager,
        sessionManager=sessionManager,
        documentPath=None,
        workspaceRoot=tmp_path,
        message="check answer",
        context={
            "cellMap": [{
                "id": "cell-1",
                "type": "code",
                "role": "exercise",
                "displayKind": "practice",
                "executionKind": "python",
            }],
            "dependencyPreflight": {"packages": ["numpy"]},
        },
        sessionId="session-test",
        roleOverride="teacher",
        providerOverride="custom",
        providerFactory=providerFactory,
    )

    assert runtimeTurn.turn.conversationId == "conv-created"
    assert "[Cell map]" in runtimeTurn.turn.messages[0]["content"]
    assert "[Dependency preflight]" in runtimeTurn.turn.messages[0]["content"]
    result = asyncio.run(runtimeTurn.executor.execute("get-variables", {}))
    assert result["error"] == "Session not found: session-test"
    assert sessionManager.requestedSessionId == "session-test"


def testPrepareTeacherRuntimeTurnGatesAmbiguousLearningRequest(tmp_path) -> None:
    convManager = _FakeConversationManager()
    profileManager = _FakeProfileManager()
    providerFactory = _ProviderFactory()
    sessionManager = _FakeSessionManager()

    runtimeTurn = prepareTeacherRuntimeTurn(
        convManager=convManager,
        profileManager=profileManager,
        sessionManager=sessionManager,
        documentPath=None,
        workspaceRoot=tmp_path,
        message="데이터 분석 커리큘럼 만들어줘",
        roleOverride="teacher",
        providerOverride="custom",
        providerFactory=providerFactory,
    )

    assert runtimeTurn.turn.clarificationPlan is not None
    assert runtimeTurn.turn.clarificationPlan.shouldAsk
    assert runtimeTurn.turn.provider is None
    assert runtimeTurn.turn.tools == []
    assert providerFactory.config is None
    assert profileManager.resolvedRole == ""
    assert runtimeTurn.turn.messages == [{"role": "user", "content": "데이터 분석 커리큘럼 만들어줘"}]


def testPrepareTeacherRuntimeTurnDoesNotGateSpecificLearningRequest(tmp_path) -> None:
    convManager = _FakeConversationManager()
    profileManager = _FakeProfileManager()
    providerFactory = _ProviderFactory()
    sessionManager = _FakeSessionManager()

    runtimeTurn = prepareTeacherRuntimeTurn(
        convManager=convManager,
        profileManager=profileManager,
        sessionManager=sessionManager,
        documentPath=None,
        workspaceRoot=tmp_path,
        message="초급 pandas 실습 중심 짧은 레슨 만들어줘",
        roleOverride="teacher",
        providerOverride="custom",
        providerFactory=providerFactory,
    )

    assert runtimeTurn.turn.clarificationPlan is None
    assert isinstance(runtimeTurn.turn.provider, _FakeProvider)
    assert profileManager.resolvedRole == "teacher"


def testTeacherRuntimeTurnRequestOwnsPayloadShape(tmp_path) -> None:
    convManager = _FakeConversationManager()
    profileManager = _FakeProfileManager()
    providerFactory = _ProviderFactory()
    sessionManager = _FakeSessionManager()

    request = TeacherRuntimeTurnRequest.fromPayload({
        "message": "상태 확인",
        "context": {"dependencyPreflight": {"packages": ["pandas"]}},
        "sessionId": "session-payload",
        "provider": "custom",
        "role": "teacher",
    })

    runtimeTurn = prepareTeacherRuntimeTurnFromRequest(
        convManager=convManager,
        profileManager=profileManager,
        sessionManager=sessionManager,
        documentPath=None,
        workspaceRoot=tmp_path,
        request=request,
        providerFactory=providerFactory,
    )

    assert request.message == "상태 확인"
    assert request.sessionId == "session-payload"
    assert runtimeTurn.turn.conversationId == "conv-created"
    assert "[Dependency preflight]" in runtimeTurn.turn.messages[0]["content"]
    assert profileManager.resolvedRole == "teacher"
    assert profileManager.resolvedProvider == "custom"


def testProviderStreamOwnsStreamingToolEvents() -> None:
    convManager = _FakeConversationManager()
    messages: list[dict] = [{"role": "user", "content": "셀 읽어줘"}]
    orchestrator = TeacherOrchestrator.fromContext({})

    events = asyncio.run(_collectStreamEvents(runTeacherChatStream(
        provider=_FakeProvider(),
        convManager=convManager,
        conversationId="conv-5",
        messages=messages,
        tools=[{"type": "function"}],
        executor=_FakeExecutor(),
        orchestrator=orchestrator,
    )))

    assert [event["type"] for event in events] == ["start", "tool_start", "tool_results", "token", "done"]
    assert events[0]["conversationId"] == "conv-5"
    assert events[1]["toolCall"]["name"] == "read-cells"
    assert events[2]["toolCalls"][0]["status"] == "done"
    assert events[-1]["conversationId"] == "conv-5"
    assert events[-1]["toolCalls"][0]["name"] == "read-cells"
    assert events[-1]["trace"]["toolSequence"] == ["read-cells"]
    assert [message["role"] for message in messages] == ["user", "assistant", "tool"]


def testProviderStreamReturnsClarificationWithoutProviderCall() -> None:
    convManager = _FakeConversationManager()
    messages: list[dict] = [{"role": "user", "content": "데이터 분석 커리큘럼 만들어줘"}]
    orchestrator = TeacherOrchestrator.fromContext({})
    plan = buildClarificationPlan("데이터 분석 커리큘럼 만들어줘")

    events = asyncio.run(_collectStreamEvents(runTeacherChatStream(
        provider=None,
        convManager=convManager,
        conversationId="conv-stream-clarify",
        messages=messages,
        tools=[],
        executor=_FakeExecutor(),
        orchestrator=orchestrator,
        clarificationPlan=plan,
    )))

    assert [event["type"] for event in events] == ["start", "token", "done"]
    assert "학습자 수준" in events[1]["content"]
    assert events[-1]["provider"] == "codaro"
    assert events[-1]["toolCalls"] == []
    assert events[-1]["trace"]["toolSequence"] == []
    assert convManager.assistantMessages[0]["content"] == events[-1]["answer"]


def testProviderStreamStoresClarificationForContinuation() -> None:
    convManager = ConversationManager()
    conversation = convManager.create(role="teacher")
    convManager.addUserMessage(conversation.conversationId, "데이터 분석 커리큘럼 만들어줘")
    plan = buildClarificationPlan("데이터 분석 커리큘럼 만들어줘")

    events = asyncio.run(_collectStreamEvents(runTeacherChatStream(
        provider=None,
        convManager=convManager,
        conversationId=conversation.conversationId,
        messages=convManager.buildMessages(conversation.conversationId),
        tools=[],
        executor=_FakeExecutor(),
        orchestrator=TeacherOrchestrator.fromContext({}),
        clarificationPlan=plan,
    )))

    pending = convManager.consumePendingClarification(conversation.conversationId)
    assert events[-1]["model"] == "clarification-gate"
    assert pending is not None
    assert pending["assumptions"]["balance"] == "설명은 짧게, 섹션마다 직접 입력 셀 포함"


def testProviderStreamReportsStreamingErrorsInTrace() -> None:
    convManager = _FakeConversationManager()
    messages: list[dict] = [{"role": "user", "content": "말해줘"}]
    orchestrator = TeacherOrchestrator.fromContext({})

    events = asyncio.run(_collectStreamEvents(runTeacherChatStream(
        provider=_FailingStreamProvider(),
        convManager=convManager,
        conversationId="conv-stream-error",
        messages=messages,
        tools=[],
        executor=_FakeExecutor(),
        orchestrator=orchestrator,
    )))

    assert [event["type"] for event in events] == ["start", "delta", "error"]
    assert events[1]["content"] == "부분 응답"
    assert events[-1]["error"] == "stream broken"
    assert events[-1]["trace"]["conversationId"] == "conv-stream-error"
    assert events[-1]["trace"]["errorCount"] == 1
    assert events[-1]["trace"]["eventCount"] == 2
    assert events[-1]["trace"]["workloop"][0]["workLabel"] == "provider 오류"
    assert events[-1]["trace"]["workloop"][0]["error"] == "stream broken"


def testProviderStreamReportsToolLoopProviderErrorsInTrace() -> None:
    convManager = _FakeConversationManager()
    provider = _FailingSecondToolProvider()
    messages: list[dict] = [{"role": "user", "content": "셀 읽고 이어서 설명해줘"}]
    orchestrator = TeacherOrchestrator.fromContext({})

    events = asyncio.run(_collectStreamEvents(runTeacherChatStream(
        provider=provider,
        convManager=convManager,
        conversationId="conv-stream-tool-error",
        messages=messages,
        tools=[{"type": "function"}],
        executor=_FakeExecutor(),
        orchestrator=orchestrator,
    )))

    assert [event["type"] for event in events] == ["start", "tool_start", "tool_results", "error"]
    assert provider.callCount == 2
    assert events[1]["toolCall"]["name"] == "read-cells"
    assert events[2]["toolCalls"][0]["status"] == "done"
    assert events[-1]["error"] == "provider broken after tool"
    assert events[-1]["trace"]["errorCount"] == 1
    assert events[-1]["trace"]["toolSequence"] == ["read-cells"]
    assert events[-1]["trace"]["workloop"][-1]["workLabel"] == "provider 오류"
    assert events[-1]["trace"]["workloop"][-1]["error"] == "provider broken after tool"
    assert [message["role"] for message in messages] == ["user", "assistant", "tool"]


def testProviderStreamEventHelpersOwnProtocolShape() -> None:
    doneEvent = teacherStreamDoneEvent({
        "conversationId": "conv-event",
        "answer": "완료",
        "provider": "fake",
        "model": "test",
        "usage": None,
        "toolCalls": [],
        "trace": {"traceId": "trace-event"},
    })
    errorEvent = teacherStreamErrorEvent(error="broken", trace={"errorCount": 1})
    resultsEvent = teacherStreamToolResultsEvent([{"toolCallId": "call-1", "status": "done"}])

    assert doneEvent["type"] == "done"
    assert doneEvent["conversationId"] == "conv-event"
    assert errorEvent == {"type": "error", "error": "broken", "trace": {"errorCount": 1}}
    assert resultsEvent["toolCalls"][0]["toolCallId"] == "call-1"
    assert teacherStreamSseFrame(doneEvent).startswith('data: {"type": "done", "conversationId": "conv-event"')


def testTeacherSkillsAndCellSchemaAreVisibleSsot() -> None:
    prompt = buildSystemPrompt(role="teacher")
    summary = schemaSummary()

    assert "Teacher skill registry:" in prompt
    assert {skill.skillId for skill in teacherSkills} >= {"curriculum-authoring", "package-preflight"}
    assert validateTeacherSkills() == ()
    assert "exercise" in summary["cellRoles"]
    assert "practice" in summary["cellDisplayKinds"]
    assert "python" in summary["executionKinds"]
