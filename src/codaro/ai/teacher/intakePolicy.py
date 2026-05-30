"""학습 의도 intake — 대화를 오고가며 신호를 누적하고, 충분히 쌓이면 행동을 시작한다.

clarification gate 가 "한 번 묻고 진행"이라면, intake 는 "목표가 분명해질 때까지 한 축씩
되묻다가, 충분해지면 추천·조합·작성을 시작"하는 다중 턴 두뇌다. 기존 clarification/pending
기계를 gather 턴의 실행 수단으로 재사용하고, 그 위에 누적 readiness 판단과 진행 표시,
추천·조합 우선 steering 을 얹는다. 완전히 결정적 — 같은 대화 이력이면 같은 결정을 낸다.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .clarificationPolicy import (
    AXIS_QUESTIONS,
    BALANCE_MARKERS,
    CLARIFICATION_PREAMBLE,
    ClarificationPlan,
    DEFAULT_ASSUMPTIONS,
    DEPTH_MARKERS,
    LEARNING_KEYWORDS,
    LEVEL_MARKERS,
)

# 누적 대상 축. environment 는 "라이브러리" 언급이 있을 때만 의미가 있어 intake 핵심 축에서 뺀다.
INTAKE_AXES = ("level", "depth", "balance")

AXIS_LABELS = {
    "level": "수준",
    "depth": "범위",
    "balance": "실습/설명 비중",
}

AXIS_MARKERS = {
    "level": LEVEL_MARKERS,
    "depth": DEPTH_MARKERS,
    "balance": BALANCE_MARKERS,
}

# 축이 이만큼 모이면 더 묻지 않고 시작한다.
READY_MIN_AXES = 2
# 사용자가 축을 안 채워도 이만큼 되물었으면 가정으로 시작한다 (심문이 되지 않게).
GATHER_CAP = 2

MODE_GATHER = "gather"
MODE_ACT = "act"
MODE_SKIP = "skip"

# injectContext 가 사용자 메시지 뒤에 붙이는 컨텍스트 구분선. 저장된 메시지에서 이 뒤를
# 떼지 않으면 [Clarification plan] JSON 안의 "초급"/"실습" 같은 문구를 축 신호로 오탐한다.
_CONTEXT_MARKER = "\n\n---\nContext:\n"


@dataclass(frozen=True)
class IntakePlan:
    mode: str
    isLearning: bool = False
    collected: int = 0
    total: int = len(INTAKE_AXES)
    collectedAxes: tuple[str, ...] = ()
    nextAxis: str | None = None
    nextQuestion: str | None = None
    topic: str = ""
    assumptions: dict[str, str] = field(default_factory=dict)

    @property
    def shouldGather(self) -> bool:
        return self.mode == MODE_GATHER

    @property
    def shouldAct(self) -> bool:
        return self.mode == MODE_ACT

    @property
    def shouldSkip(self) -> bool:
        return self.mode == MODE_SKIP

    def progressPayload(self) -> dict[str, Any]:
        return {
            "collected": self.collected,
            "total": self.total,
            "collectedAxes": list(self.collectedAxes),
            "nextAxis": self.nextAxis,
            "nextAxisLabel": AXIS_LABELS.get(self.nextAxis or "", ""),
            "topic": self.topic,
        }

    def gatherClarificationPlan(self) -> ClarificationPlan:
        questions = (self.nextQuestion,) if self.nextQuestion else ()
        return ClarificationPlan(
            shouldAsk=True,
            questions=questions,
            assumptions=dict(self.assumptions),
            intakeProgress=self.progressPayload(),
        )

    def actionPayload(self) -> dict[str, Any]:
        return {
            "topic": self.topic,
            "collected": self.collected,
            "total": self.total,
            "collectedAxes": list(self.collectedAxes),
        }


def buildIntakePlan(
    message: str,
    *,
    priorUserTexts: tuple[str, ...] | list[str] = (),
    context: dict[str, Any] | None = None,
    priorGatherCount: int = 0,
) -> IntakePlan:
    contextMap = context if isinstance(context, dict) else {}
    currentText = _rawUserText(message)
    priorTexts = [_rawUserText(text) for text in priorUserTexts if isinstance(text, str)]
    allTexts = [*priorTexts, currentText]

    isLearning = any(_looksLikeLearning(text) for text in allTexts)
    collectedAxes = _detectAxes(allTexts)
    collected = len(collectedAxes)
    currentAxes = _detectAxes([currentText])
    topic = _deriveTopic(allTexts)
    assumptions = dict(DEFAULT_ASSUMPTIONS)
    pendingActive = isinstance(contextMap.get("clarificationPlan"), dict)

    if not isLearning:
        return IntakePlan(
            mode=MODE_SKIP,
            isLearning=False,
            collected=collected,
            collectedAxes=tuple(sorted(collectedAxes)),
            topic=topic,
            assumptions=assumptions,
        )

    # 이미 충분히 모였거나, 이번 요청 한 줄이 그 자체로 구체적이면 바로 시작한다.
    currentEnough = len(currentAxes) >= READY_MIN_AXES
    askedEnough = priorGatherCount >= GATHER_CAP
    respondedWithoutSignal = pendingActive and not currentAxes
    missingAxes = [axis for axis in INTAKE_AXES if axis not in collectedAxes]

    if collected >= READY_MIN_AXES or currentEnough or askedEnough or respondedWithoutSignal or not missingAxes:
        return IntakePlan(
            mode=MODE_ACT,
            isLearning=True,
            collected=collected,
            collectedAxes=tuple(sorted(collectedAxes)),
            topic=topic,
            assumptions=assumptions,
        )

    nextAxis = missingAxes[0]
    return IntakePlan(
        mode=MODE_GATHER,
        isLearning=True,
        collected=collected,
        collectedAxes=tuple(sorted(collectedAxes)),
        nextAxis=nextAxis,
        nextQuestion=AXIS_QUESTIONS[nextAxis],
        topic=topic,
        assumptions=assumptions,
    )


def conversationIntakeInputs(convManager: Any, conversationId: str | None) -> tuple[list[str], int]:
    """대화 이력에서 intake 입력(이전 사용자 발화, 되물은 횟수)을 뽑는다.

    현재 턴 메시지는 아직 추가되기 전이므로 포함하지 않는다.
    """
    if not conversationId:
        return [], 0
    getter = getattr(convManager, "get", None)
    if not callable(getter):
        return [], 0
    conversation = getter(conversationId)
    messages = getattr(conversation, "messages", None)
    if not isinstance(messages, list):
        return [], 0

    priorUserTexts: list[str] = []
    gatherCount = 0
    for entry in messages:
        role = getattr(entry, "role", None)
        content = getattr(entry, "content", None)
        if not isinstance(content, str):
            continue
        if role == "user":
            priorUserTexts.append(content)
        elif role == "assistant" and content.startswith(CLARIFICATION_PREAMBLE):
            gatherCount += 1
    return priorUserTexts, gatherCount


def intakeActionDirective(payload: dict[str, Any]) -> str:
    topic = str(payload.get("topic") or "").strip() if isinstance(payload, dict) else ""
    lines = [
        "[Intake]",
        "The learning goal is now clear enough to act. Before authoring a brand-new lesson from "
        "scratch, FIRST recommend or combine what already exists: call resolve-learning-goal to map "
        "the goal to domains, search-curricula to find existing lessons, and compose-master-plan to "
        "assemble an ordered learning path. Only call write-curriculum-yaml for a new lesson when no "
        "existing lesson covers the goal (a real gap). While working, show one concise progress line "
        "about what you are searching for and what you are recommending, combining, or writing.",
    ]
    if topic:
        lines.append(f"Understood goal: {topic}")
    return "\n".join(lines)


def _rawUserText(text: str) -> str:
    if not isinstance(text, str):
        return ""
    marker = text.find(_CONTEXT_MARKER)
    return text[:marker] if marker != -1 else text


def _looksLikeLearning(text: str) -> bool:
    normalized = text.lower()
    return any(keyword in normalized for keyword in LEARNING_KEYWORDS)


def _detectAxes(texts: list[str]) -> set[str]:
    blob = " ".join(text.lower() for text in texts if isinstance(text, str))
    return {
        axis
        for axis, markers in AXIS_MARKERS.items()
        if any(marker in blob for marker in markers)
    }


def _deriveTopic(texts: list[str]) -> str:
    """가장 최근의 학습 요청 발화를 짧은 주제 라벨로 쓴다."""
    for text in reversed(texts):
        if isinstance(text, str) and _looksLikeLearning(text):
            cleaned = " ".join(text.split())
            return cleaned[:48]
    return ""
