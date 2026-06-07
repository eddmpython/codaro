"""에이전트 루프 데이터 모델 — observe→decide→act→verify 사이클의 값 타입.

순수 dataclass/enum 만 둔다(드라이버·모델·세션 의존 0). 브라우저유즈/컴퓨터유즈 라인이 공유.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class AgentDecision(str, Enum):
    """정책(policy)이 한 turn 에서 내리는 결정."""

    ACT = "act"
    DONE = "done"
    GIVE_UP = "giveUp"


@dataclass(slots=True)
class AgentAction:
    """정책이 고른 다음 행동. `verb`/`params` 는 `SessionRegistry.runStep` 으로 그대로 전달된다."""

    verb: str
    params: dict[str, Any] = field(default_factory=dict)
    rationale: str = ""
    targetLabel: str = ""  # 위험 분류용(destructive lexicon 매칭). 예: 버튼 텍스트 "삭제"

    def key(self) -> tuple[str, tuple[tuple[str, Any], ...]]:
        """반복-액션 가드용 결정론 키."""
        items = tuple(sorted((str(k), repr(v)) for k, v in self.params.items()))
        return (self.verb, items)


@dataclass(slots=True)
class PolicyResult:
    """정책의 한 turn 산출물."""

    decision: AgentDecision
    action: AgentAction | None = None  # decision == ACT 일 때만 의미 있음
    note: str = ""


@dataclass(slots=True)
class AgentTurn:
    """루프 한 turn 의 감사 가능한 기록."""

    index: int
    observation: dict[str, Any]
    decision: AgentDecision
    action: AgentAction | None = None
    gateVerdict: str | None = None  # allow | dryRun | confirmRequired | denied | blocked
    stepStatus: str | None = None  # TaskStatus.value (실제 act 한 경우)
    stepResult: dict[str, Any] | None = None
    stepError: str | None = None

    def serialize(self) -> dict[str, Any]:
        return {
            "index": self.index,
            "decision": self.decision.value,
            "verb": self.action.verb if self.action else None,
            "params": self.action.params if self.action else None,
            "rationale": self.action.rationale if self.action else "",
            "label": self.action.targetLabel if self.action else "",
            "gateVerdict": self.gateVerdict,
            "stepStatus": self.stepStatus,
            "stepResult": self.stepResult,
            "stepError": self.stepError,
            "observationSummary": _observationSummary(self.observation),
        }


class AgentOutcome(str, Enum):
    """루프 종료 사유."""

    DONE = "done"  # 정책이 목표 달성 선언
    MAX_STEPS = "maxSteps"  # step 예산 소진
    GIVE_UP = "giveUp"  # 정책이 포기 선언
    LOOP_GUARD = "loopGuard"  # 무진전 / 반복 액션 차단
    BLOCKED = "blocked"  # 안전 게이트가 행동을 차단(fail-closed)
    ERROR = "error"  # 복구 불가 step 실패
    ESTOP = "estop"  # 긴급정지(E-Stop)
    CANCELLED = "cancelled"  # 사용자 취소


@dataclass(slots=True)
class AgentRunResult:
    """루프 1회 실행 결과 — 전체 turn trace 포함."""

    outcome: AgentOutcome
    goal: str
    turns: list[AgentTurn] = field(default_factory=list)
    finalObservation: dict[str, Any] | None = None
    note: str = ""

    @property
    def actCount(self) -> int:
        return sum(1 for t in self.turns if t.decision is AgentDecision.ACT)

    def serialize(self) -> dict[str, Any]:
        return {
            "outcome": self.outcome.value,
            "goal": self.goal,
            "note": self.note,
            "turnCount": len(self.turns),
            "actCount": self.actCount,
            "turns": [t.serialize() for t in self.turns],
            "finalObservation": self.finalObservation,
        }


def _observationSummary(observation: dict[str, Any]) -> str:
    kind = observation.get("kind", "?")
    if kind == "browser":
        return f"browser url={observation.get('url')} title={observation.get('title')} elements={len(observation.get('elements', []))}"
    if kind == "desktop":
        screen = observation.get("screen", {})
        return f"desktop {screen.get('width')}x{screen.get('height')} elements={len(observation.get('elements', []))}"
    return f"{kind} progressKey={observation.get('progressKey')}"
