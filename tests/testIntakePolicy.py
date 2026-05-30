from __future__ import annotations

from typing import Any

from codaro.ai.conversation import ConversationManager
from codaro.ai.teacher import (
    TeacherOrchestrator,
    buildClarificationPlan,
    buildIntakePlan,
    clarificationAnswer,
    conversationIntakeInputs,
    intakeActionDirective,
    prepareTeacherRuntimeTurn,
)
from codaro.ai.teacher.intakePolicy import GATHER_CAP, READY_MIN_AXES
from codaro.ai.types import LLMConfig, ToolResponse


PENDING_CONTEXT = {"clarificationPlan": {"assumptions": {"level": "초급-중급 사이"}}}


def testVagueLearningRequestGathersOneAxisAtATime() -> None:
    plan = buildIntakePlan("데이터 분석 배우고 싶어")

    assert plan.shouldGather
    assert plan.isLearning
    assert plan.nextAxis == "level"
    assert plan.nextQuestion == "학습자 수준은 어느 정도로 잡을까요?"
    assert plan.collected == 0


def testGatherAsksNextAxisAfterAnswer() -> None:
    plan = buildIntakePlan(
        "초급이면 좋겠어",
        priorUserTexts=["데이터 분석 배우고 싶어"],
        context=PENDING_CONTEXT,
        priorGatherCount=1,
    )

    assert plan.shouldGather
    assert plan.collected == 1
    assert plan.nextAxis == "depth"


def testActsWhenEnoughAxesAccumulated() -> None:
    plan = buildIntakePlan(
        "짧게 부탁해",
        priorUserTexts=["데이터 분석 배우고 싶어", "초급이면 좋겠어"],
        context=PENDING_CONTEXT,
        priorGatherCount=2,
    )

    assert plan.shouldAct
    assert plan.collected >= READY_MIN_AXES
    assert plan.nextAxis is None


def testSpecificRequestActsImmediately() -> None:
    plan = buildIntakePlan("초급 pandas 실습 중심 짧은 레슨 만들어줘")

    assert plan.shouldAct
    assert plan.collected == 3


def testProceedMarkerWithoutNewSignalActs() -> None:
    plan = buildIntakePlan(
        "진행",
        priorUserTexts=["데이터 분석 커리큘럼 만들어줘"],
        context=PENDING_CONTEXT,
        priorGatherCount=1,
    )

    assert plan.shouldAct


def testNonLearningRequestSkips() -> None:
    plan = buildIntakePlan("안녕, 오늘 날씨 어때?")

    assert plan.shouldSkip
    assert not plan.isLearning


def testGatherCapStopsAskingAndActs() -> None:
    plan = buildIntakePlan(
        "음 잘 모르겠어",
        priorUserTexts=["파이썬 배우고 싶어"],
        context={},
        priorGatherCount=GATHER_CAP,
    )

    assert plan.shouldAct


def testInjectedContextInPriorMessageIsNotMistakenForAxisSignal() -> None:
    # ACT 턴은 [Clarification plan] JSON(초급/실습/짧은 포함)이 붙은 메시지를 저장한다.
    # intake 가 그 컨텍스트를 축 신호로 오탐하면 누적이 깨진다.
    injected = (
        "진행\n\n---\nContext:\n[Clarification plan]\n"
        '{"assumptions": {"level": "초급-중급 사이", "balance": "설명은 짧게, 섹션마다 직접 입력 셀 포함"}}'
    )
    plan = buildIntakePlan(
        "SQL도 배우고 싶어",
        priorUserTexts=["데이터 분석 커리큘럼 만들어줘", injected],
        context={},
        priorGatherCount=1,
    )

    assert plan.collected == 0
    assert plan.shouldGather


def testGatherClarificationPlanCarriesSingleQuestionAndProgress() -> None:
    plan = buildIntakePlan("파이썬 자동화 배우고 싶어")
    clarification = plan.gatherClarificationPlan()

    assert clarification.shouldAsk
    assert len(clarification.questions) == 1
    assert set(clarification.assumptions) == {"level", "depth", "environment", "balance"}
    progress = clarification.payload()["intakeProgress"]
    assert progress["collected"] == 0
    assert progress["total"] == 3
    assert progress["nextAxis"] == "level"
    assert progress["nextAxisLabel"] == "수준"


def testActionDirectiveSteersTowardRecommendThenCompose() -> None:
    plan = buildIntakePlan("초급 pandas 실습 중심 짧은 레슨 만들어줘")
    directive = intakeActionDirective(plan.actionPayload())

    assert "resolve-learning-goal" in directive
    assert "search-curricula" in directive
    assert "compose-master-plan" in directive
    assert "write-curriculum-yaml" in directive
    assert "Understood goal:" in directive


def testConversationIntakeInputsReadsHistoryAndCountsGathers() -> None:
    manager = ConversationManager()
    conversation = manager.create(role="teacher")
    cid = conversation.conversationId
    manager.addUserMessage(cid, "데이터 분석 배우고 싶어")
    manager.addAssistantMessage(cid, clarificationAnswer(buildClarificationPlan("데이터 분석 배우고 싶어")))
    manager.addUserMessage(cid, "초급")
    manager.addAssistantMessage(cid, "좋아요, 다음 질문입니다.")

    priorUserTexts, gatherCount = conversationIntakeInputs(manager, cid)

    assert priorUserTexts == ["데이터 분석 배우고 싶어", "초급"]
    assert gatherCount == 1


class _IntakeProfileManager:
    def resolve(self, provider: str | None = None, *, role: str | None = None) -> dict[str, Any]:
        del provider, role
        return {
            "provider": "custom",
            "model": "intake-test",
            "apiKey": "test-key",
            "baseUrl": "http://local.test",
            "temperature": 0,
            "maxTokens": 128,
        }


class _IntakeProvider:
    supportsNativeTools = True
    resolvedModel = "intake-test"
    provider = "custom"

    def __init__(self) -> None:
        self.config = LLMConfig(provider="custom", model="intake-test")

    def completeWithTools(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ToolResponse:
        del messages, tools
        return ToolResponse(answer="기존 커리큘럼을 찾아 조합합니다.", provider="custom", model="intake-test", toolCalls=[])

    def complete(self, messages: list[dict[str, Any]]) -> ToolResponse:
        del messages
        return ToolResponse(answer="기존 커리큘럼을 찾아 조합합니다.", provider="custom", model="intake-test", toolCalls=[])


class _IntakeProviderFactory:
    def __init__(self) -> None:
        self.config: LLMConfig | None = None

    def __call__(self, config: LLMConfig) -> _IntakeProvider:
        self.config = config
        return _IntakeProvider()


class _NoSessionManager:
    def getSession(self, sessionId: str) -> None:
        del sessionId
        return None


def _runtimeTurn(manager: ConversationManager, cid: str, message: str, factory: _IntakeProviderFactory):
    return prepareTeacherRuntimeTurn(
        convManager=manager,
        profileManager=_IntakeProfileManager(),
        sessionManager=_NoSessionManager(),
        documentPath=None,
        workspaceRoot=None,
        conversationId=cid,
        message=message,
        roleOverride="teacher",
        providerOverride="custom",
        providerFactory=factory,
    )


def testRuntimeTurnGathersAcrossTurnsThenActsWithRecommendSteering() -> None:
    manager = ConversationManager()
    conversation = manager.create(role="teacher")
    cid = conversation.conversationId

    # turn 1 — vague learning request → gather, no provider
    factory1 = _IntakeProviderFactory()
    turn1 = _runtimeTurn(manager, cid, "파이썬 업무 자동화 배우고 싶어", factory1)
    assert turn1.turn.provider is None
    assert turn1.turn.clarificationPlan is not None
    assert turn1.turn.clarificationPlan.shouldAsk
    assert turn1.turn.clarificationPlan.intakeProgress is not None
    # gather 턴은 clarification gate 와 같은 답변을 저장해 다음 턴 누적 카운트가 가능하다
    manager.addAssistantMessage(cid, clarificationAnswer(turn1.turn.clarificationPlan))

    # turn 2 — only level → still gather
    factory2 = _IntakeProviderFactory()
    turn2 = _runtimeTurn(manager, cid, "초급으로 해줘", factory2)
    assert turn2.turn.provider is None
    assert turn2.turn.clarificationPlan is not None
    manager.addAssistantMessage(cid, clarificationAnswer(turn2.turn.clarificationPlan))

    # turn 3 — depth + balance → act with recommend/compose steering injected
    factory3 = _IntakeProviderFactory()
    turn3 = _runtimeTurn(manager, cid, "짧게 실습 위주로", factory3)
    assert turn3.turn.clarificationPlan is None
    assert isinstance(turn3.turn.provider, _IntakeProvider)
    injectedUserMessage = turn3.turn.messages[-1]["content"]
    assert "[Intake]" in injectedUserMessage
    assert "search-curricula" in injectedUserMessage
    assert "compose-master-plan" in injectedUserMessage


def testRuntimeTurnRecordsIntakeProgressWorkloopLabel() -> None:
    plan = buildIntakePlan("파이썬 자동화 배우고 싶어").gatherClarificationPlan()
    orchestrator = TeacherOrchestrator.fromContext({})
    trace = orchestrator.startTrace("conv-intake")
    trace.record("clarification-gate", plan.payload())

    workloop = trace.summary()["workloop"]
    assert workloop
    row = workloop[0]
    assert row["workLabel"] == "학습 목표 파악"
    assert "목표 0/3 파악" in row["workDetail"]
    assert "다음: 수준" in row["workDetail"]
