"""automation/agent — 라인 무관 에이전트 루프 코어(브라우저유즈/컴퓨터유즈 공유).

`SessionRegistry.runStep` 위에 얹는 observe→decide→act→verify 루프 + 주입형 DecisionPolicy
+ SafetyGate. 모델은 모른다(ai 의존 0) — LLM 정책은 ai 레이어(`codaro.ai.agentFlow`)가 주입.
"""

from .agentLoop import AgentLoop, ConfirmCallback, LoopLimits
from .agentModel import (
    AgentAction,
    AgentDecision,
    AgentOutcome,
    AgentRunResult,
    AgentTurn,
    PolicyResult,
)
from .decisionPolicy import DecisionPolicy, ScriptedPolicy, act, done, giveUp
from .lineDefaults import browserUseDefaultPolicy, computerUseDefaultPolicy
from .safetyGate import (
    ExecMode,
    GateDecision,
    GateVerdict,
    RiskTier,
    SafetyGate,
    SafetyPolicy,
)

__all__ = [
    "AgentLoop",
    "ConfirmCallback",
    "LoopLimits",
    "AgentAction",
    "AgentDecision",
    "AgentOutcome",
    "AgentRunResult",
    "AgentTurn",
    "PolicyResult",
    "DecisionPolicy",
    "ScriptedPolicy",
    "act",
    "done",
    "giveUp",
    "browserUseDefaultPolicy",
    "computerUseDefaultPolicy",
    "ExecMode",
    "GateDecision",
    "GateVerdict",
    "RiskTier",
    "SafetyGate",
    "SafetyPolicy",
]
