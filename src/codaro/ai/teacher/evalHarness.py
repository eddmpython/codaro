from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any

from .traceModel import TeacherTrace


@dataclass(frozen=True)
class TeacherEvalCase:
    caseId: str
    prompt: str
    expectedTools: tuple[str, ...] = ()
    orderedBefore: tuple[tuple[str, str], ...] = ()
    forbiddenTools: tuple[str, ...] = ()
    allowPolicyViolations: bool = False


@dataclass(frozen=True)
class ToolSequenceReport:
    caseId: str
    passed: bool
    failures: tuple[str, ...] = field(default_factory=tuple)
    observedTools: tuple[str, ...] = field(default_factory=tuple)
    policyViolationCount: int = 0


goldenEvalCases: tuple[TeacherEvalCase, ...] = (
    TeacherEvalCase(
        caseId="curriculum-yaml-materialized",
        prompt="pandas 기초 커리큘럼 만들어줘",
        expectedTools=("write-curriculum-yaml",),
    ),
    TeacherEvalCase(
        caseId="dependency-preflight-before-install",
        prompt="matplotlib 그래프 실습 만들어줘",
        expectedTools=("packages-check",),
        orderedBefore=(("packages-check", "packages-install"),),
    ),
    TeacherEvalCase(
        caseId="answer-check-uses-cell-call",
        prompt="내 답 맞아?",
        expectedTools=("read-cells", "cell-call"),
    ),
    TeacherEvalCase(
        caseId="cell-run-does-not-skip-package-preflight",
        prompt="seaborn으로 그래프 셀 실행해줘",
        expectedTools=("packages-check", "cell-call"),
        orderedBefore=(("packages-check", "cell-call"),),
    ),
    TeacherEvalCase(
        caseId="automation-uses-guarded-input-tools",
        prompt="브라우저에서 버튼을 찾아 클릭하는 자동화를 만들어줘",
        expectedTools=("find-element", "click-element"),
        orderedBefore=(("find-element", "click-element"),),
    ),
)


def evaluateToolSequence(
    case: TeacherEvalCase,
    toolNames: Sequence[str],
    *,
    policyViolationCount: int = 0,
) -> ToolSequenceReport:
    failures: list[str] = []
    for toolName in case.expectedTools:
        if toolName not in toolNames:
            failures.append(f"missing expected tool: {toolName}")
    for toolName in case.forbiddenTools:
        if toolName in toolNames:
            failures.append(f"forbidden tool used: {toolName}")
    for before, after in case.orderedBefore:
        if before not in toolNames or after not in toolNames:
            continue
        if toolNames.index(before) > toolNames.index(after):
            failures.append(f"{before} must run before {after}")
    if policyViolationCount and not case.allowPolicyViolations:
        failures.append(f"policy violations observed: {policyViolationCount}")
    return ToolSequenceReport(
        caseId=case.caseId,
        passed=not failures,
        failures=tuple(failures),
        observedTools=tuple(toolNames),
        policyViolationCount=policyViolationCount,
    )


def evaluateToolTrace(case: TeacherEvalCase, trace: TeacherTrace) -> ToolSequenceReport:
    return evaluateToolTracePayload(case, trace.summary())


def evaluateToolTracePayload(case: TeacherEvalCase, tracePayload: Mapping[str, Any]) -> ToolSequenceReport:
    return evaluateToolSequence(
        case,
        _toolSequenceFromPayload(tracePayload),
        policyViolationCount=_policyViolationCountFromPayload(tracePayload),
    )


def _toolSequenceFromPayload(tracePayload: Mapping[str, Any]) -> tuple[str, ...]:
    sequence = tracePayload.get("toolSequence")
    if isinstance(sequence, list | tuple):
        return tuple(str(toolName) for toolName in sequence if toolName)

    events = tracePayload.get("events")
    if not isinstance(events, list):
        return ()

    toolNames: list[str] = []
    for event in events:
        if not isinstance(event, dict) or event.get("eventType") != "tool-result":
            continue
        payload = event.get("payload")
        if isinstance(payload, dict) and payload.get("name"):
            toolNames.append(str(payload["name"]))
    return tuple(toolNames)


def _policyViolationCountFromPayload(tracePayload: Mapping[str, Any]) -> int:
    count = tracePayload.get("policyViolationCount")
    if isinstance(count, int):
        return max(count, 0)

    events = tracePayload.get("events")
    if not isinstance(events, list):
        return 0
    return sum(
        1
        for event in events
        if isinstance(event, dict) and event.get("eventType") == "tool-policy-violation"
    )
