from __future__ import annotations

import asyncio

from codaro.ai.conversation import buildSystemPrompt
from codaro.ai.teacher import (
    TeacherEvalCase,
    TeacherOrchestrator,
    TeacherRuntimeTurnRequest,
    ToolPolicyState,
    ToolPolicyViolation,
    buildClarificationPlan,
    executeTeacherToolRound,
    evaluateGoldenTracePayloads,
    evaluateToolSequence,
    evaluateToolTrace,
    evaluateToolTracePayload,
    goldenEvalCases,
    prepareTeacherRuntimeTurn,
    prepareTeacherRuntimeTurnFromRequest,
    prepareTeacherTurn,
    runTeacherChatLoop,
    runTeacherChatStream,
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


class _FailingStreamProvider:
    supportsNativeTools = False

    def stream(self, messages: list[dict]):
        yield "부분 응답"
        raise RuntimeError("stream broken")


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
    assert "level" in plan.defaults
    assert any("수준" in question for question in plan.questions)


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
    report = evaluateToolSequence(dependencyCase, ["packages-install", "packages-check"])
    assert not report.passed
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
    }

    report = evaluateToolTracePayload(case, tracePayload)

    assert report.passed
    assert report.observedTools == ("read-cells", "cell-call")
    assert report.policyViolationCount == 0
    assert report.policyViolations == ()


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
            "document": {
                "blocks": [
                    {"payload": {"learningContract": {"meta": {"title": "lesson"}}}},
                ]
            }
        },
    )

    case = next(case for case in goldenEvalCases if case.caseId == "curriculum-yaml-materialized")
    report = evaluateToolTrace(case, trace)

    assert report.passed
    assert trace.summary()["yamlContractObserved"]


def testEvalHarnessChecksWorkloopAndStructuredYamlContract() -> None:
    case = TeacherEvalCase(
        caseId="structured-curriculum",
        prompt="pandas 실습 레슨 만들어줘",
        expectedTools=("write-curriculum-yaml",),
        expectedWorkLabels=("커리큘럼 YAML 전개",),
        expectedTraceEvents=("tool-start", "tool-result"),
        expectedYamlContract=True,
    )
    tracePayload = {
        "toolSequence": ["write-curriculum-yaml"],
        "workloop": [{"workLabel": "커리큘럼 YAML 전개"}],
        "events": [
            {"eventType": "tool-start", "payload": {"name": "write-curriculum-yaml", "workLabel": "커리큘럼 YAML 전개"}},
            {"eventType": "tool-result", "payload": {"name": "write-curriculum-yaml"}},
        ],
        "toolCalls": [
            {
                "name": "write-curriculum-yaml",
                "result": {
                    "document": {
                        "blocks": [
                            {"payload": {"learningContract": {"meta": {"title": "lesson"}}}},
                            {"payload": {"sectionContract": {"title": "section"}}},
                        ]
                    }
                },
            }
        ],
    }

    report = evaluateToolTracePayload(case, tracePayload)

    assert report.passed
    assert report.observedWorkLabels == ("커리큘럼 YAML 전개",)


def testEvalHarnessFailsMissingStructuredYamlContract() -> None:
    case = next(case for case in goldenEvalCases if case.caseId == "curriculum-yaml-materialized")
    report = evaluateToolTracePayload(case, {"toolSequence": ["write-curriculum-yaml"]})

    assert not report.passed
    assert "missing structured learning YAML contract" in report.failures


def testEvalHarnessEvaluatesGoldenTracePayloadSet() -> None:
    tracePayloads = {
        "answer-check-uses-cell-call": {
            "toolSequence": ["read-cells", "cell-call"],
            "policyViolationCount": 0,
        },
        "dependency-preflight-before-install": {
            "toolSequence": ["packages-check", "packages-install"],
            "policyViolationCount": 0,
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
    assert report.payload()["caseCount"] == 2


def testEvalHarnessFailsMissingGoldenTracePayload() -> None:
    report = evaluateGoldenTracePayloads({}, cases=(goldenEvalCases[0],))

    assert not report.passed
    assert report.missingCaseIds == (goldenEvalCases[0].caseId,)
    assert report.reports[0].failures == ("missing trace payload",)


def testEvalHarnessFailsPolicyViolationsByDefault() -> None:
    orchestrator = TeacherOrchestrator.fromContext({})
    trace = orchestrator.startTrace("conv-policy")
    orchestrator.toolPolicyViolation(
        trace,
        ToolPolicyViolation("dependency-preflight-required", "packages-check가 필요합니다.", "cell-call"),
    )

    case = TeacherEvalCase(caseId="no-policy-violations", prompt="셀 실행해줘")
    report = evaluateToolTrace(case, trace)

    assert not report.passed
    assert trace.summary()["policyViolations"] == [{
        "policyCode": "dependency-preflight-required",
        "toolName": "cell-call",
        "message": "packages-check가 필요합니다.",
    }]
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
    assert "학습자 수준" in payload["answer"]
    assert convManager.assistantMessages[0]["content"] == payload["answer"]


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
