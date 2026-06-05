"""Predict-Run-Reconcile-Adapt 루프 golden case 평가.

학습자가 실수한 코드를 들고 오면 provider가
`read-cells → match-misconception → suggest-next-step` 순서로 도구를 부르고,
match-misconception 결과의 doneCriterionViolated 와 suggest-next-step 의
action 신호가 trace에 보존되는지 검증한다.

real provider 호출이 아니라 결정적 trace 시뮬레이션으로 case 정의의 무결성을
검증한다. real provider 평가는 verifyTeacherGoldenE2e.py 가 별도로 돌린다.
"""
from __future__ import annotations

from codaro.ai.teacher import TeacherOrchestrator
from codaro.ai.teacher.evalHarness import (
    evaluateToolTrace,
    evaluateToolTracePayload,
    goldenEvalCases,
)


def _learnerDiagnosticsCase():
    return next(
        case for case in goldenEvalCases if case.caseId == "learner-diagnostics-loop-on-error"
    )


def testLearnerDiagnosticsCaseExists() -> None:
    case = _learnerDiagnosticsCase()
    assert case.expectedTools == (
        "read-cells",
        "match-misconception",
        "suggest-next-step",
    )
    assert ("match-misconception", "suggest-next-step") in case.orderedBefore


def testLearnerDiagnosticsCasePassesOnSimulatedTrace() -> None:
    orchestrator = TeacherOrchestrator.fromContext({})
    trace = orchestrator.startTrace("conv-prra-loop")

    orchestrator.toolCallStart(trace, "call-1", "read-cells", {})
    orchestrator.toolCallResult(
        trace,
        "call-1",
        "read-cells",
        {},
        {"blocks": [{"id": "cell-1", "content": "5 = x"}]},
    )

    orchestrator.toolCallStart(
        trace,
        "call-2",
        "match-misconception",
        {"outcomeIds": ["python.variables"], "code": "5 = x"},
    )
    orchestrator.toolCallResult(
        trace,
        "call-2",
        "match-misconception",
        {"outcomeIds": ["python.variables"], "code": "5 = x"},
        {
            "matches": [
                {
                    "misconceptionId": "python.variables.assignmentReversal",
                    "outcomeId": "python.variables",
                    "repeatStatus": "new",
                    "hitCount": 1,
                }
            ],
            "repeatCount": 0,
            "doneCriterionViolated": False,
        },
    )

    orchestrator.toolCallStart(
        trace,
        "call-3",
        "suggest-next-step",
        {"currentOutcomeId": "python.variables"},
    )
    orchestrator.toolCallResult(
        trace,
        "call-3",
        "suggest-next-step",
        {"currentOutcomeId": "python.variables"},
        {
            "action": "applyCorrection",
            "reason": "misconception 'python.variables.assignmentReversal' first hit",
            "outcomeId": "python.variables",
            "misconceptionId": "python.variables.assignmentReversal",
        },
    )

    case = _learnerDiagnosticsCase()
    report = evaluateToolTrace(case, trace)

    assert report.passed, f"golden case failed: {report.failures}"
    assert report.observedTools == (
        "read-cells",
        "match-misconception",
        "suggest-next-step",
    )
    # result signal 확인 — provider에게 의미 있는 신호가 trace에 살아있어야 한다
    assert "match-misconception.matches" in report.observedResultSignals
    assert "match-misconception.doneCriterionViolated" in report.observedResultSignals
    assert "suggest-next-step.action" in report.observedResultSignals


def testLearnerDiagnosticsCaseFailsWhenOrderInverted() -> None:
    """suggest-next-step 이 match-misconception 보다 먼저 오면 실패해야 한다."""
    case = _learnerDiagnosticsCase()
    tracePayload = {
        "toolSequence": ["read-cells", "suggest-next-step", "match-misconception"],
        "policyViolationCount": 0,
        "toolCalls": [
            {"name": "read-cells", "result": {"blocks": []}},
            {"name": "suggest-next-step", "result": {"action": "applyCorrection"}},
            {
                "name": "match-misconception",
                "result": {"matches": [], "doneCriterionViolated": False},
            },
        ],
    }
    report = evaluateToolTracePayload(case, tracePayload)
    assert not report.passed
    assert any(
        "match-misconception must run before suggest-next-step" in failure
        for failure in report.failures
    )


def testLearnerDiagnosticsCaseFlagsMissingReadCells() -> None:
    case = _learnerDiagnosticsCase()
    tracePayload = {
        "toolSequence": ["match-misconception", "suggest-next-step"],
        "policyViolationCount": 0,
        "toolCalls": [
            {
                "name": "match-misconception",
                "result": {"matches": [], "doneCriterionViolated": False},
            },
            {"name": "suggest-next-step", "result": {"action": "continuePractice"}},
        ],
    }
    report = evaluateToolTracePayload(case, tracePayload)
    assert not report.passed
    assert any("missing expected tool: read-cells" in failure for failure in report.failures)


def testGoldenCaseToolsAreAllRegistered() -> None:
    """case가 참조하는 도구는 전부 registered toolSchemas에 있어야 한다 (회귀 게이트)."""
    from codaro.ai.toolRegistry import toolSchemas

    case = _learnerDiagnosticsCase()
    registeredNames = {schema["function"]["name"] for schema in toolSchemas()}
    referenced = (
        set(case.expectedTools)
        | set(case.forbiddenTools)
        | {tool for pair in case.orderedBefore for tool in pair}
    )
    missing = referenced - registeredNames
    assert not missing, f"learner-diagnostics case references unregistered tools: {missing}"
