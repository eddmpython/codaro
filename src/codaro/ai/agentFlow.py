"""에이전트 라인 오케스트레이션 — 브라우저유즈/컴퓨터유즈 제품 실행 파사드.

레이어: 이 모듈은 `ai` 에 산다(ai → automation import 허용). 따라서 여기서만 LLM provider 와
`automation.agent`(AgentLoop) + `automation.session`(registry) 를 함께 본다. automation 도메인은
ai 를 절대 import 하지 않는다(5층 경계).

라우터는 이 파일의 `*Payload` 함수만 부른다(transport-boundary). 이 파일은 transport(api) 를
import 하지 않고, 에러는 `AgentRunFlowError(statusCode, message)` 로 던져 라우터가 HTTPException
으로 매핑한다(sessionFlow 패턴 동일).

실행 모델: 각 run 은 백그라운드 asyncio task 에서 `AgentLoop.run` 을 돌린다. step-approval 모드의
confirm 은 async 콜백이 `confirmEvent` 를 기다려 HTTP `/confirm` 응답까지 일시정지한다. pause/resume/
cancel 은 run-level 제어다. 모든 step 은 SessionRegistry(BUSY/E-Stop/audit) + SafetyGate 를 통과한다.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import uuid
from dataclasses import dataclass, field
from typing import Any

from codaro.automation.agent import (
    AgentAction,
    AgentDecision,
    AgentLoop,
    AgentOutcome,
    AgentRunResult,
    AgentTurn,
    LoopLimits,
    PolicyResult,
    SafetyGate,
    browserUseDefaultPolicy,
    computerUseDefaultPolicy,
)
from codaro.automation.session import (
    SessionDefinition,
    SessionKind,
    getSessionRegistry,
)

logger = logging.getLogger(__name__)

AGENT_KINDS = ("browserUse", "computerUse")
DEFAULT_MAX_STEPS = 20


class AgentRunFlowError(Exception):
    """파사드 경계 에러 — 라우터가 statusCode 로 HTTPException 매핑."""

    def __init__(self, statusCode: int, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.message = message


# ────────────────────────────────────────────────────────────────────
# LLM 결정 정책 (ai 레이어 거주 — provider 를 본다)
# ────────────────────────────────────────────────────────────────────

BROWSER_VERB_CATALOG = {
    "clickIndex": "관찰의 index 요소를 클릭 {index}",
    "typeIndex": "index 요소에 텍스트 입력 {index, text}",
    "navigate": "URL 이동 {url}",
    "scroll": "스크롤 {dy}",
    "extractText": "index 요소 텍스트 추출 {index}",
}
DESKTOP_VERB_CATALOG = {
    "clickIndex": "감지된 index 요소를 좌표 클릭 {index}",
    "type": "텍스트 입력 {text}",
    "scroll": "스크롤 {clicks}",
    "moveTo": "마우스 이동 {x, y}",
}


def renderAgentPrompt(
    goal: str,
    observation: dict[str, Any],
    history: list[AgentTurn],
    verbCatalog: dict[str, str],
) -> str:
    elements = observation.get("elements", [])
    elementLines = [
        f"  [{e.get('index')}] {e.get('role', e.get('elementType', ''))} \"{e.get('name', e.get('text', ''))}\""
        for e in elements
    ]
    verbLines = [f"  - {name}: {desc}" for name, desc in verbCatalog.items()]
    past = [f"  {t.index}. {t.action.verb if t.action else t.decision.value}" for t in history[-5:]]
    return (
        f"목표: {goal}\n"
        f"현재 화면({observation.get('kind')}): url={observation.get('url', '')} "
        f"title={observation.get('title', '')}\n"
        "요소:\n" + ("\n".join(elementLines) or "  (없음)") + "\n"
        "사용 가능한 행동:\n" + "\n".join(verbLines) + "\n"
        "지금까지:\n" + ("\n".join(past) or "  (시작)") + "\n"
        "다음 한 행동을 JSON 으로만 답하라. 형식: "
        '{"decision":"act|done|giveUp","verb":"...","params":{...},"rationale":"..."}\n'
        "목표가 이미 달성됐으면 decision=done."
    )


_JSON_FENCE = re.compile(r"```(?:json)?\s*(\{.*?\})\s*```", re.DOTALL)
_JSON_OBJ = re.compile(r"\{.*\}", re.DOTALL)


def parseAgentAction(rawText: str) -> PolicyResult | None:
    """모델 출력에서 행동 JSON 추출 → PolicyResult. 파싱 불가면 None."""
    text = rawText.strip()
    fence = _JSON_FENCE.search(text)
    payload = fence.group(1) if fence else None
    if payload is None:
        obj = _JSON_OBJ.search(text)
        payload = obj.group(0) if obj else None
    if payload is None:
        return None
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        return None
    decision = str(data.get("decision", "")).lower()
    if decision == "done":
        return PolicyResult(AgentDecision.DONE, note=str(data.get("rationale", "")))
    if decision in ("giveup", "give_up"):
        return PolicyResult(AgentDecision.GIVE_UP, note=str(data.get("rationale", "")))
    verb = data.get("verb")
    if not verb:
        return None
    return PolicyResult(
        AgentDecision.ACT,
        action=AgentAction(
            verb=str(verb),
            params=dict(data.get("params") or {}),
            rationale=str(data.get("rationale", "")),
            targetLabel=str(data.get("label", "") or ""),
        ),
    )


def runTextCompletion(prompt: str, *, role: str = "copilot") -> str:
    """설정된 provider 로 1-shot 텍스트 완성(teacher 와 동일 config). 동기."""
    from codaro.ai.factory import createProvider
    from codaro.ai.profile import getProfileManager
    from codaro.ai.providerErrors import ProviderRuntimeError
    from codaro.ai.types import LLMConfig

    resolved = getProfileManager().resolve(role=role)
    config = LLMConfig(
        provider=resolved["provider"],
        model=resolved.get("model"),
        apiKey=resolved.get("apiKey"),
        baseUrl=resolved.get("baseUrl"),
        temperature=resolved.get("temperature", 0.3),
        maxTokens=resolved.get("maxTokens", 4096),
    )
    provider = createProvider(config)
    try:
        response = provider.complete([{"role": "user", "content": prompt}])
    except ProviderRuntimeError as exc:
        raise AgentRunFlowError(502, f"LLM provider 호출 실패: {exc}") from exc
    return response.answer


class LlmAgentPolicy:
    """설정된 provider 로 observation→prompt→파싱→action 을 수행하는 DecisionPolicy."""

    def __init__(self, verbCatalog: dict[str, str], *, complete=None) -> None:
        self._verbCatalog = verbCatalog
        self._complete = complete if complete is not None else runTextCompletion

    def decide(self, goal: str, observation: dict[str, Any], history: list[AgentTurn]) -> PolicyResult:
        prompt = renderAgentPrompt(goal, observation, history, self._verbCatalog)
        result = parseAgentAction(self._complete(prompt))
        if result is not None:
            return result
        retry = self._complete(prompt + "\n반드시 유효한 JSON 한 개만 출력하라.")
        result = parseAgentAction(retry)
        if result is not None:
            return result
        return PolicyResult(AgentDecision.GIVE_UP, note="unparseable model output")


# ────────────────────────────────────────────────────────────────────
# Run controller + registry
# ────────────────────────────────────────────────────────────────────

_KIND_CONFIG = {
    "browserUse": (SessionKind.BROWSER, browserUseDefaultPolicy, BROWSER_VERB_CATALOG),
    "computerUse": (SessionKind.DESKTOP, computerUseDefaultPolicy, DESKTOP_VERB_CATALOG),
}


@dataclass
class AgentRun:
    runId: str
    kind: str
    goal: str
    status: str = "running"  # running | awaiting-confirm | paused | done | stopped | error
    sessionId: str | None = None
    error: str | None = None
    outcome: str | None = None
    turns: list[AgentTurn] = field(default_factory=list)
    pendingAction: AgentAction | None = None
    task: asyncio.Task | None = None
    confirmEvent: asyncio.Event = field(default_factory=asyncio.Event)
    confirmResult: bool = False
    resumeEvent: asyncio.Event = field(default_factory=asyncio.Event)

    def serialize(self) -> dict[str, Any]:
        steps = []
        for turn in self.turns:
            data = turn.serialize()
            data["id"] = f"{self.runId}:{turn.index}"
            steps.append(data)
        pending = None
        if self.pendingAction is not None:
            pending = {
                "id": f"{self.runId}:pending",
                "verb": self.pendingAction.verb,
                "params": self.pendingAction.params,
                "label": self.pendingAction.targetLabel,
                "rationale": self.pendingAction.rationale,
            }
        return {
            "runId": self.runId,
            "kind": self.kind,
            "goal": self.goal,
            "status": self.status,
            "outcome": self.outcome,
            "error": self.error,
            "steps": steps,
            "pending": pending,
        }


class AgentRunRegistry:
    """프로세스-전역 에이전트 run 보관소(=getTaskRegistry/getSessionRegistry 컨벤션)."""

    def __init__(self) -> None:
        self._runs: dict[str, AgentRun] = {}

    def get(self, runId: str) -> AgentRun | None:
        return self._runs.get(runId)

    def list(self) -> list[AgentRun]:
        return list(self._runs.values())

    async def start(
        self,
        kind: str,
        goal: str,
        options: dict[str, Any] | None = None,
        *,
        policy=None,
        gate=None,
        sessionInjection: dict[str, Any] | None = None,
    ) -> AgentRun:
        if kind not in _KIND_CONFIG:
            raise AgentRunFlowError(400, f"지원하지 않는 agent kind: {kind}")
        if not goal.strip():
            raise AgentRunFlowError(400, "goal(작업 지시)이 비었습니다")
        sessionKind, policyFactory, verbCatalog = _KIND_CONFIG[kind]
        runId = f"agentrun-{uuid.uuid4().hex[:10]}"
        run = AgentRun(runId=runId, kind=kind, goal=goal)
        run.resumeEvent.set()  # 시작은 not-paused
        self._runs[runId] = run
        # policy/gate/sessionInjection 은 결정론 테스트 주입 시점(production 은 None → 실 provider/driver).
        gate = gate if gate is not None else SafetyGate(policyFactory())
        policy = policy if policy is not None else LlmAgentPolicy(verbCatalog)
        run.task = asyncio.create_task(
            self._drive(run, sessionKind, gate, policy, dict(options or {}), sessionInjection)
        )
        return run

    async def _drive(self, run, sessionKind, gate, policy, options, sessionInjection=None) -> None:
        registry = getSessionRegistry()
        try:
            definition = SessionDefinition(name=f"agent:{run.kind}", kind=sessionKind, options=options)
            if sessionInjection is not None:
                handle = await registry.open(definition, **sessionInjection)
            else:
                handle = await registry.open(definition)
            run.sessionId = handle.definition.id
            loop = AgentLoop(
                registry,
                gate,
                limits=LoopLimits(maxSteps=int(options.get("maxSteps", DEFAULT_MAX_STEPS))),
                confirm=lambda action, observation: self._confirm(run, action, observation),
                source=f"agent:{run.kind}",
                pauseGate=lambda: run.resumeEvent.wait(),
            )
            result: AgentRunResult = await loop.run(run.sessionId, run.goal, policy, turnSink=run.turns)
            run.outcome = result.outcome.value
            run.status = "stopped" if result.outcome is AgentOutcome.CANCELLED else "done"
        except asyncio.CancelledError:
            run.status = "stopped"
            run.outcome = AgentOutcome.CANCELLED.value
            raise
        except AgentRunFlowError as exc:
            run.status = "error"
            run.error = exc.message
        except Exception as exc:  # noqa: BLE001 — run boundary; 원인 로깅 후 run 에 표면화
            logger.warning("agent run %s 실패: %s", run.runId, exc)
            run.status = "error"
            run.error = str(exc)
        finally:
            run.pendingAction = None
            if run.sessionId is not None:
                try:
                    await registry.close(run.sessionId, reason="agent-run-end")
                except Exception as exc:  # noqa: BLE001 — teardown best-effort
                    logger.warning("agent run %s 세션 close 실패: %s", run.runId, exc)

    async def _confirm(self, run: AgentRun, action: AgentAction, observation: dict[str, Any]) -> bool:
        """step-approval async 콜백 — HTTP /confirm 응답까지 일시정지."""
        run.pendingAction = action
        run.status = "awaiting-confirm"
        run.confirmResult = False
        run.confirmEvent.clear()
        await run.confirmEvent.wait()
        run.pendingAction = None
        run.status = "running"
        return run.confirmResult

    def confirm(self, runId: str, approved: bool) -> AgentRun:
        run = self._require(runId)
        if run.status != "awaiting-confirm":
            raise AgentRunFlowError(409, "승인 대기 중인 단계가 없습니다")
        run.confirmResult = approved
        run.confirmEvent.set()
        return run

    def pause(self, runId: str) -> AgentRun:
        run = self._require(runId)
        run.resumeEvent.clear()
        if run.status == "running":
            run.status = "paused"
        return run

    def resume(self, runId: str) -> AgentRun:
        run = self._require(runId)
        run.resumeEvent.set()
        if run.status == "paused":
            run.status = "running"
        return run

    def cancel(self, runId: str) -> AgentRun:
        run = self._require(runId)
        if run.task is not None and not run.task.done():
            run.task.cancel()
        run.resumeEvent.set()  # cancel 대기 해제
        run.confirmEvent.set()
        run.status = "stopped"
        return run

    def _require(self, runId: str) -> AgentRun:
        run = self._runs.get(runId)
        if run is None:
            raise AgentRunFlowError(404, "agent run not found")
        return run


_registry: AgentRunRegistry | None = None


def getAgentRunRegistry() -> AgentRunRegistry:
    global _registry
    if _registry is None:
        _registry = AgentRunRegistry()
    return _registry


def resetAgentRunRegistry() -> None:
    global _registry
    _registry = None


# ────────────────────────────────────────────────────────────────────
# Payload 파사드 (라우터 진입점)
# ────────────────────────────────────────────────────────────────────

async def runBrowserAgentPayload(*, instruction: str, startUrl: str | None = None) -> dict[str, Any]:
    options: dict[str, Any] = {"headless": True}
    if startUrl:
        options["startUrl"] = startUrl
    run = await getAgentRunRegistry().start("browserUse", instruction, options)
    return run.serialize()


async def runComputerAgentPayload(*, instruction: str) -> dict[str, Any]:
    run = await getAgentRunRegistry().start("computerUse", instruction, {})
    return run.serialize()


def getAgentRunPayload(runId: str) -> dict[str, Any]:
    run = getAgentRunRegistry().get(runId)
    if run is None:
        raise AgentRunFlowError(404, "agent run not found")
    return run.serialize()


def confirmAgentStepPayload(runId: str, *, approved: bool) -> dict[str, Any]:
    return getAgentRunRegistry().confirm(runId, approved).serialize()


def pauseAgentRunPayload(runId: str) -> dict[str, Any]:
    return getAgentRunRegistry().pause(runId).serialize()


def resumeAgentRunPayload(runId: str) -> dict[str, Any]:
    return getAgentRunRegistry().resume(runId).serialize()


def stopAgentRunPayload(runId: str) -> dict[str, Any]:
    return getAgentRunRegistry().cancel(runId).serialize()
