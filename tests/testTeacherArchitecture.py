from __future__ import annotations

import asyncio

from codaro.ai.conversation import buildSystemPrompt
from codaro.ai.teacher import (
    TeacherEvalCase,
    TeacherOrchestrator,
    ToolPolicyState,
    executeTeacherToolRound,
    evaluateToolSequence,
    evaluateToolTrace,
    evaluateToolTracePayload,
    goldenEvalCases,
    prepareTeacherTurn,
    runTeacherChatLoop,
    runTeacherChatStream,
    teacherSkills,
    toolCallsToProviderPayloads,
    ToolPolicyViolation,
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
    assert start["traceEventIndex"] == 2
    assert done["traceEventIndex"] == 3
    assert [event.eventType for event in trace.events] == ["turn-start", "tool-start", "tool-result"]
    assert trace.summary()["toolSequence"] == ["read-cells"]


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
    assert report.policyViolationCount == 1
    assert "policy violations observed: 1" in report.failures


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
    assert events[-1]["toolCalls"][0]["name"] == "read-cells"
    assert events[-1]["trace"]["toolSequence"] == ["read-cells"]
    assert [message["role"] for message in messages] == ["user", "assistant", "tool"]


def testTeacherSkillsAndCellSchemaAreVisibleSsot() -> None:
    prompt = buildSystemPrompt(role="teacher")
    summary = schemaSummary()

    assert "Teacher skill registry:" in prompt
    assert {skill.skillId for skill in teacherSkills} >= {"curriculum-authoring", "package-preflight"}
    assert "exercise" in summary["cellRoles"]
    assert "practice" in summary["cellDisplayKinds"]
    assert "python" in summary["executionKinds"]
