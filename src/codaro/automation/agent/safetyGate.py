"""안전 게이트 — 자율 에이전트의 부작용을 driver 경계 *앞*에서 집행한다.

prompt 지시는 안전 장치로 계산하지 않는다. 게이트는 정책(proposer)이 고른 행동을
*집행(enforcer)* 한다 — dry-run·navigation denylist·rate-limit·destructive confirm·critical
forbidden 을 verb/label 로 기계적으로 판정한다. 루프는 이 판정에 따라 `runStep` 을 호출하거나
(ALLOW) 시뮬레이션만 하거나(DRY_RUN) 멈춘다(BLOCKED/CONFIRM).
"""

from __future__ import annotations

import time
from collections.abc import Callable
from dataclasses import dataclass, field
from enum import Enum

from .agentModel import AgentAction


class RiskTier(str, Enum):
    NONE = "none"  # 읽기 전용 — 항상 실행
    LOW = "low"  # 부작용 있으나 멱등에 가까움
    HIGH = "high"  # 비가역 가능(submit/destructive 클릭/다운로드)
    CRITICAL = "critical"  # 금전/시스템(결제·시스템 hotkey) — 기본 금지


class GateVerdict(str, Enum):
    ALLOW = "allow"
    DRY_RUN = "dryRun"
    CONFIRM_REQUIRED = "confirmRequired"
    BLOCKED = "blocked"


class ExecMode(str, Enum):
    DRY_RUN = "dryRun"  # 보기만 — 부작용 0
    STEP_APPROVAL = "stepApproval"  # 한 단계씩 확인
    AUTONOMOUS = "autonomous"  # 끝까지 알아서 — 저위험 auto, 고위험 confirm


READ_VERBS = frozenset(
    {"observe", "snapshot", "state", "extractText", "screenshot", "detect", "ocrRegions", "query"}
)
DESTRUCTIVE_VERBS = frozenset({"submit", "download", "upload"})
CRITICAL_HOTKEYS = (
    frozenset({"win", "r"}),
    frozenset({"alt", "f4"}),
    frozenset({"ctrl", "w"}),
    frozenset({"win", "l"}),
    frozenset({"ctrl", "alt", "delete"}),
)
DEFAULT_DESTRUCTIVE_LEXICON = (
    "삭제", "제거", "탈퇴", "결제", "구매", "송금", "전송", "주문", "결정",
    "delete", "remove", "submit", "buy", "pay", "send", "transfer", "purchase", "checkout", "order",
)
DEFAULT_CRITICAL_LEXICON = ("결제", "송금", "구매", "pay", "payment", "checkout", "transfer", "purchase")


@dataclass(slots=True)
class SafetyPolicy:
    mode: ExecMode = ExecMode.STEP_APPROVAL
    navigationDenylist: tuple[str, ...] = ()
    navigationAllowlist: tuple[str, ...] = ()
    destructiveLexicon: tuple[str, ...] = DEFAULT_DESTRUCTIVE_LEXICON
    criticalLexicon: tuple[str, ...] = DEFAULT_CRITICAL_LEXICON
    confirmEachClick: bool = False  # computer-use 기본 True — 무인 클릭 금지
    criticalForbidden: bool = True
    maxActionsPerSecond: float | None = None
    maxActionsPerMinute: float | None = None


@dataclass(slots=True)
class GateDecision:
    verdict: GateVerdict
    tier: RiskTier
    reason: str = ""


def _matches(value: str, patterns: tuple[str, ...]) -> bool:
    value = value.lower()
    for raw in patterns:
        pat = raw.lower()
        if pat.startswith("*") and pat.endswith("*"):
            if pat.strip("*") in value:
                return True
        elif pat.startswith("*"):
            if value.endswith(pat[1:]):
                return True
        elif pat.endswith("*"):
            if value.startswith(pat[:-1]):
                return True
        elif pat in value:
            return True
    return False


def _hotkeyKeys(action: AgentAction) -> frozenset[str]:
    keys = action.params.get("keys")
    if isinstance(keys, str):
        parts = [keys]
    elif isinstance(keys, (list, tuple)):
        parts = [str(k) for k in keys]
    else:
        parts = []
    return frozenset(p.strip().lower() for p in parts if str(p).strip())


class SafetyGate:
    """정책이 고른 행동의 위험을 분류하고, 모드·정책에 따라 집행 판정을 낸다."""

    def __init__(self, policy: SafetyPolicy | None = None, *, clock: Callable[[], float] | None = None) -> None:
        self._policy = policy or SafetyPolicy()
        self._clock = clock or time.monotonic
        self._executed: list[float] = []

    @property
    def policy(self) -> SafetyPolicy:
        return self._policy

    def recordExecuted(self) -> None:
        """루프가 실제 부작용 액션 실행 직후 호출 — rate-limit 윈도에 타임스탬프 적립."""
        self._executed.append(self._clock())

    def _rateExceeded(self) -> bool:
        perSec = self._policy.maxActionsPerSecond
        perMin = self._policy.maxActionsPerMinute
        if perSec is None and perMin is None:
            return False
        now = self._clock()
        if perSec is not None and sum(1 for t in self._executed if now - t < 1.0) >= perSec:
            return True
        if perMin is not None and sum(1 for t in self._executed if now - t < 60.0) >= perMin:
            return True
        return False

    def classify(self, action: AgentAction) -> RiskTier:
        verb = action.verb
        if verb in READ_VERBS:
            return RiskTier.NONE
        label = action.targetLabel or ""
        if verb == "navigate":
            url = str(action.params.get("url", ""))
            if self._policy.navigationDenylist and _matches(url, self._policy.navigationDenylist):
                return RiskTier.CRITICAL
            if self._policy.navigationAllowlist and not _matches(url, self._policy.navigationAllowlist):
                return RiskTier.HIGH
            return RiskTier.LOW
        if verb in ("press", "hotkey"):
            keys = _hotkeyKeys(action)
            if any(combo <= keys for combo in CRITICAL_HOTKEYS):
                return RiskTier.CRITICAL
            return RiskTier.HIGH
        if verb in DESTRUCTIVE_VERBS:
            return RiskTier.HIGH
        if label and _matches(label, self._policy.criticalLexicon):
            return RiskTier.CRITICAL
        if label and _matches(label, self._policy.destructiveLexicon):
            return RiskTier.HIGH
        return RiskTier.LOW

    def evaluate(self, action: AgentAction, *, confirmed: bool = False) -> GateDecision:
        tier = self.classify(action)

        if tier is RiskTier.NONE:
            return GateDecision(GateVerdict.ALLOW, tier, "read")

        if action.verb == "navigate" and self._policy.navigationDenylist and _matches(
            str(action.params.get("url", "")), self._policy.navigationDenylist
        ):
            return GateDecision(GateVerdict.BLOCKED, tier, "navigation denylist")

        if tier is RiskTier.CRITICAL and self._policy.criticalForbidden and not confirmed:
            return GateDecision(GateVerdict.BLOCKED, tier, "critical action forbidden by default")

        if self._policy.mode is not ExecMode.DRY_RUN and self._rateExceeded():
            return GateDecision(GateVerdict.BLOCKED, tier, "rate limit exceeded")

        if self._policy.mode is ExecMode.DRY_RUN:
            return GateDecision(GateVerdict.DRY_RUN, tier, "dry-run mode")

        if self._policy.mode is ExecMode.STEP_APPROVAL:
            if confirmed:
                return GateDecision(GateVerdict.ALLOW, tier, "step approved")
            return GateDecision(GateVerdict.CONFIRM_REQUIRED, tier, "step-approval requires confirm")

        if confirmed:
            return GateDecision(GateVerdict.ALLOW, tier, "confirmed")
        needsConfirm = tier in (RiskTier.HIGH, RiskTier.CRITICAL) or (
            self._policy.confirmEachClick and action.verb in ("click", "clickIndex")
        )
        if needsConfirm:
            return GateDecision(GateVerdict.CONFIRM_REQUIRED, tier, "high-risk requires confirm")
        return GateDecision(GateVerdict.ALLOW, tier, "low-risk autonomous")
