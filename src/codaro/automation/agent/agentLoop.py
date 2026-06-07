"""AgentLoop — 목표 주도 observe→decide→act→verify 오케스트레이터.

새 런타임을 짓지 않는다. `SessionRegistry.runStep` 이 이미 단일-writer BUSY 래치 · E-Stop
체크 · 감사(audit) · per-step timeout · ring-buffer step 기록을 준다. 루프는 그 위에 *목표
의미론*(언제 멈추나)과 *안전 집행*(SafetyGate)만 얹는다.

verify 는 별도 호출이 아니라 *다음 turn 의 observe* 다(관찰 기반 검증). 진전(progress)은
observation 의 `progressKey` 변화로 측정한다.

도메인 내부(session/eStop/audit/taskModel)만 import → 5층 경계 위반 0. 모델은 모른다(정책 주입).
"""

from __future__ import annotations

import inspect
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from codaro.automation.audit import getAuditTrail
from codaro.automation.eStop import EmergencyStopActive
from codaro.automation.session import SessionRegistry
from codaro.automation.taskModel import TaskStatus

from .agentModel import (
    AgentAction,
    AgentDecision,
    AgentOutcome,
    AgentRunResult,
    AgentTurn,
)
from .decisionPolicy import DecisionPolicy
from .safetyGate import GateVerdict, SafetyGate

# observation + action → 사람 승인 여부. 기본은 fail-closed(거부).
ConfirmCallback = Callable[[AgentAction, dict[str, Any]], bool]


def _denyAll(action: AgentAction, observation: dict[str, Any]) -> bool:
    return False


@dataclass(slots=True)
class LoopLimits:
    maxSteps: int = 20
    perStepTimeoutSeconds: float = 60.0
    noProgressLimit: int = 3
    repeatActionLimit: int = 3
    maxConsecutiveFailures: int = 3  # 연속 실패 step 한계 → ERROR 종료


class AgentLoop:
    """목표 주도 에이전트 루프. `SessionRegistry.runStep` 위에 얹는 순수 오케스트레이터."""

    def __init__(
        self,
        registry: SessionRegistry,
        gate: SafetyGate,
        *,
        limits: LoopLimits | None = None,
        confirm: ConfirmCallback = _denyAll,
        observeVerb: str = "observe",
        source: str = "agent",
        auditTrail: Any | None = None,
        pauseGate: Callable[[], Any] | None = None,
    ) -> None:
        self._registry = registry
        self._gate = gate
        self._limits = limits or LoopLimits()
        self._confirm = confirm
        self._observeVerb = observeVerb
        self._source = source
        self._audit = auditTrail if auditTrail is not None else getAuditTrail()
        self._pauseGate = pauseGate

    async def run(
        self,
        sessionId: str,
        goal: str,
        policy: DecisionPolicy,
        *,
        turnSink: list[AgentTurn] | None = None,
    ) -> AgentRunResult:
        # turnSink 가 주어지면 그 리스트에 turn 을 append → 호출자가 실시간으로 진행을 본다.
        turns: list[AgentTurn] = turnSink if turnSink is not None else []
        lastObservation: dict[str, Any] | None = None
        progressKeys: list[Any] = []
        actionKeys: list[tuple] = []
        consecutiveFailures = 0

        for index in range(self._limits.maxSteps):
            # ── PAUSE GATE (run-level 일시정지) ───────────────────────
            if self._pauseGate is not None:
                maybe = self._pauseGate()
                if inspect.isawaitable(maybe):
                    await maybe
            # ── OBSERVE ──────────────────────────────────────────────
            try:
                obsRecord = await self._registry.runStep(
                    sessionId, self._observeVerb, {}, timeoutSeconds=self._limits.perStepTimeoutSeconds
                )
            except EmergencyStopActive as exc:
                return self._finish(AgentOutcome.ESTOP, goal, turns, lastObservation, str(exc))
            if obsRecord.status is TaskStatus.CANCELLED:
                return self._finish(AgentOutcome.ESTOP, goal, turns, lastObservation, obsRecord.error or "")
            if obsRecord.status is not TaskStatus.SUCCESS:
                return self._finish(
                    AgentOutcome.ERROR, goal, turns, lastObservation, f"observe failed: {obsRecord.error}"
                )
            observation = obsRecord.result
            lastObservation = observation
            progressKeys.append(observation.get("progressKey"))

            # ── DECIDE ───────────────────────────────────────────────
            result = policy.decide(goal, observation, list(turns))

            if result.decision is AgentDecision.DONE:
                turns.append(AgentTurn(index, observation, AgentDecision.DONE))
                return self._finish(AgentOutcome.DONE, goal, turns, observation, result.note)
            if result.decision is AgentDecision.GIVE_UP:
                turns.append(AgentTurn(index, observation, AgentDecision.GIVE_UP))
                return self._finish(AgentOutcome.GIVE_UP, goal, turns, observation, result.note)

            action = result.action
            if action is None:
                return self._finish(AgentOutcome.ERROR, goal, turns, observation, "ACT without action")

            # ── 루프 가드(무진전 / 반복 액션) ────────────────────────
            actionKeys.append(action.key())
            if self._repeatedAction(actionKeys):
                turns.append(AgentTurn(index, observation, AgentDecision.ACT, action, gateVerdict="loopGuard"))
                return self._finish(AgentOutcome.LOOP_GUARD, goal, turns, observation, "repeated action")
            if self._noProgress(progressKeys):
                turns.append(AgentTurn(index, observation, AgentDecision.ACT, action, gateVerdict="loopGuard"))
                return self._finish(AgentOutcome.LOOP_GUARD, goal, turns, observation, "no progress")

            # ── 안전 게이트 ──────────────────────────────────────────
            decision = self._gate.evaluate(action, confirmed=False)
            verdict = decision.verdict

            if verdict is GateVerdict.BLOCKED:
                self._record(sessionId, goal, observation, action, decision, success=False, error=decision.reason)
                turns.append(AgentTurn(index, observation, AgentDecision.ACT, action, gateVerdict="blocked"))
                return self._finish(AgentOutcome.BLOCKED, goal, turns, observation, decision.reason)

            if verdict is GateVerdict.CONFIRM_REQUIRED:
                approved = self._confirm(action, observation)
                if inspect.isawaitable(approved):  # ai 레이어가 HTTP confirm 대기용 async 콜백 주입 가능
                    approved = await approved
                if not approved:
                    self._record(sessionId, goal, observation, action, decision, success=False, error="denied")
                    turns.append(AgentTurn(index, observation, AgentDecision.ACT, action, gateVerdict="denied"))
                    continue  # 건너뛰기 — 재관찰(반복/무진전 가드가 헛바퀴를 잡는다)
                decision = self._gate.evaluate(action, confirmed=True)
                verdict = decision.verdict

            if verdict is GateVerdict.DRY_RUN:
                self._record(sessionId, goal, observation, action, decision, success=True, dryRun=True)
                turns.append(
                    AgentTurn(
                        index, observation, AgentDecision.ACT, action,
                        gateVerdict="dryRun", stepStatus="dryRun",
                        stepResult={"dryRun": True, "wouldDo": {"verb": action.verb, "params": action.params}},
                    )
                )
                continue  # 부작용 verb 를 runStep 에 보내지 않는다 — driver 미호출

            # ── ACT (ALLOW) ──────────────────────────────────────────
            try:
                actRecord = await self._registry.runStep(
                    sessionId, action.verb, action.params, timeoutSeconds=self._limits.perStepTimeoutSeconds
                )
            except EmergencyStopActive as exc:
                return self._finish(AgentOutcome.ESTOP, goal, turns, observation, str(exc))
            if actRecord.status is TaskStatus.CANCELLED:
                turns.append(
                    AgentTurn(index, observation, AgentDecision.ACT, action, gateVerdict="allow", stepStatus="cancelled")
                )
                return self._finish(AgentOutcome.ESTOP, goal, turns, observation, actRecord.error or "")

            self._gate.recordExecuted()  # rate-limit 윈도에 적립
            self._record(
                sessionId, goal, observation, action, decision,
                success=actRecord.status is TaskStatus.SUCCESS, error=actRecord.error,
            )
            turns.append(
                AgentTurn(
                    index, observation, AgentDecision.ACT, action,
                    gateVerdict="allow", stepStatus=actRecord.status.value,
                    stepResult=actRecord.result, stepError=actRecord.error,
                )
            )
            if actRecord.status is TaskStatus.FAILED:
                consecutiveFailures += 1
                if consecutiveFailures >= self._limits.maxConsecutiveFailures:
                    return self._finish(
                        AgentOutcome.ERROR, goal, turns, observation,
                        f"{consecutiveFailures} consecutive failures",
                    )
            else:
                consecutiveFailures = 0

        return self._finish(AgentOutcome.MAX_STEPS, goal, turns, lastObservation, "max steps reached")

    # ── 가드 헬퍼 ────────────────────────────────────────────────────
    def _repeatedAction(self, actionKeys: list[tuple]) -> bool:
        limit = self._limits.repeatActionLimit
        if limit <= 0 or len(actionKeys) < limit:
            return False
        tail = actionKeys[-limit:]
        return all(key == tail[0] for key in tail)

    def _noProgress(self, progressKeys: list[Any]) -> bool:
        limit = self._limits.noProgressLimit
        if limit <= 0 or len(progressKeys) < limit + 1:
            return False
        tail = progressKeys[-(limit + 1):]
        first = tail[0]
        return first is not None and all(key == first for key in tail)

    # ── 감사 기록(WHY 포함) ──────────────────────────────────────────
    def _record(
        self,
        sessionId: str,
        goal: str,
        observation: dict[str, Any],
        action: AgentAction,
        decision: Any,
        *,
        success: bool,
        error: str | None = None,
        dryRun: bool = False,
    ) -> None:
        self._audit.record(
            f"agentStep:{action.verb}",
            self._source,
            {
                "goal": goal,
                "observation": _summarizeObservation(observation),
                "decision": {"verb": action.verb, "params": action.params, "label": action.targetLabel},
                "rationale": action.rationale,
                "tier": decision.tier.value,
                "gate": {"verdict": decision.verdict.value, "reason": decision.reason},
                "dryRun": dryRun,
            },
            sessionId=sessionId,
            success=success,
            error=error,
        )

    def _finish(
        self,
        outcome: AgentOutcome,
        goal: str,
        turns: list[AgentTurn],
        finalObservation: dict[str, Any] | None,
        note: str,
    ) -> AgentRunResult:
        return AgentRunResult(
            outcome=outcome, goal=goal, turns=turns, finalObservation=finalObservation, note=note
        )


def _summarizeObservation(observation: dict[str, Any]) -> str:
    kind = observation.get("kind", "?")
    if kind == "browser":
        return f"browser url={observation.get('url')} title={observation.get('title')} elements={len(observation.get('elements', []))}"
    if kind == "desktop":
        screen = observation.get("screen", {})
        return f"desktop {screen.get('width')}x{screen.get('height')} elements={len(observation.get('elements', []))}"
    return f"{kind} progressKey={observation.get('progressKey')}"
