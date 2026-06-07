"""결정 정책(DecisionPolicy) 추상 + 결정론 구현.

루프는 *모델을 모른다*. 정책을 Protocol 로 주입받는다.
- 데모/테스트: `ScriptedPolicy` (모델 0, 완전 결정론) — automation 도메인 안에 살아도 OK.
- 프로덕션: LLM 정책(`codaro.ai.agentFlow.LlmAgentPolicy`)은 ai 레이어에 산다(거기서 provider
  와 automation.agent 를 둘 다 본다). 도메인은 Protocol 의 *모양*만 알고 *구현*은 모른다.
"""

from __future__ import annotations

from typing import Any, Protocol, runtime_checkable

from .agentModel import AgentAction, AgentDecision, AgentTurn, PolicyResult


@runtime_checkable
class DecisionPolicy(Protocol):
    """observation + history + goal → 다음 행동(또는 DONE/GIVE_UP). 동기."""

    def decide(
        self,
        goal: str,
        observation: dict[str, Any],
        history: list[AgentTurn],
    ) -> PolicyResult: ...


class ScriptedPolicy:
    """미리 짜인 `PolicyResult` 시퀀스를 순서대로 반환. 모델 의존 0. 소진되면 GIVE_UP."""

    def __init__(self, script: list[PolicyResult]) -> None:
        self._script = list(script)
        self._index = 0

    def decide(
        self,
        goal: str,
        observation: dict[str, Any],
        history: list[AgentTurn],
    ) -> PolicyResult:
        if self._index >= len(self._script):
            return PolicyResult(AgentDecision.GIVE_UP, note="script exhausted")
        result = self._script[self._index]
        self._index += 1
        return result


def act(verb: str, params: dict[str, Any] | None = None, *, label: str = "", why: str = "") -> PolicyResult:
    return PolicyResult(
        AgentDecision.ACT,
        action=AgentAction(verb=verb, params=dict(params or {}), rationale=why, targetLabel=label),
    )


def done(note: str = "") -> PolicyResult:
    return PolicyResult(AgentDecision.DONE, note=note)


def giveUp(note: str = "") -> PolicyResult:
    return PolicyResult(AgentDecision.GIVE_UP, note=note)
