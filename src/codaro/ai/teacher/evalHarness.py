from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any

from .toolPolicy import normalizeToolPolicyViolations
from .traceModel import TeacherTrace


@dataclass(frozen=True)
class TeacherEvalCase:
    caseId: str
    prompt: str
    expectedTools: tuple[str, ...] = ()
    orderedBefore: tuple[tuple[str, str], ...] = ()
    forbiddenTools: tuple[str, ...] = ()
    expectedWorkLabels: tuple[str, ...] = ()
    expectedTraceEvents: tuple[str, ...] = ()
    expectedYamlContract: bool = False
    allowPolicyViolations: bool = False


@dataclass(frozen=True)
class ToolSequenceReport:
    caseId: str
    passed: bool
    failures: tuple[str, ...] = field(default_factory=tuple)
    observedTools: tuple[str, ...] = field(default_factory=tuple)
    observedWorkLabels: tuple[str, ...] = field(default_factory=tuple)
    workloopEventCount: int = 0
    policyViolationCount: int = 0
    policyViolations: tuple[dict[str, str], ...] = field(default_factory=tuple)


@dataclass(frozen=True)
class TeacherEvalReport:
    passed: bool
    reports: tuple[ToolSequenceReport, ...]
    missingCaseIds: tuple[str, ...] = field(default_factory=tuple)

    def payload(self) -> dict[str, Any]:
        return {
            "passed": self.passed,
            "caseCount": len(self.reports),
            "failureCount": sum(1 for report in self.reports if not report.passed),
            "missingCaseIds": list(self.missingCaseIds),
            "reports": [
                {
                    "caseId": report.caseId,
                    "passed": report.passed,
                    "failures": list(report.failures),
                    "observedTools": list(report.observedTools),
                    "observedWorkLabels": list(report.observedWorkLabels),
                    "workloopEventCount": report.workloopEventCount,
                    "policyViolationCount": report.policyViolationCount,
                    "policyViolations": list(report.policyViolations),
                }
                for report in self.reports
            ],
        }


goldenEvalCases: tuple[TeacherEvalCase, ...] = (
    TeacherEvalCase(
        caseId="curriculum-yaml-materialized",
        prompt="pandas 기초 커리큘럼 만들어줘",
        expectedTools=("write-curriculum-yaml",),
        expectedWorkLabels=("커리큘럼 YAML 전개",),
        expectedTraceEvents=("tool-start", "tool-result"),
        expectedYamlContract=True,
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
    policyViolations: Sequence[Mapping[str, Any]] = (),
) -> ToolSequenceReport:
    failures: list[str] = []
    normalizedPolicyViolations = _normalizePolicyViolations(policyViolations)
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
        details = _policyViolationDetails(normalizedPolicyViolations)
        suffix = f" ({details})" if details else ""
        failures.append(f"policy violations observed: {policyViolationCount}{suffix}")
    return ToolSequenceReport(
        caseId=case.caseId,
        passed=not failures,
        failures=tuple(failures),
        observedTools=tuple(toolNames),
        policyViolationCount=policyViolationCount,
        policyViolations=normalizedPolicyViolations,
    )


def evaluateToolTrace(case: TeacherEvalCase, trace: TeacherTrace) -> ToolSequenceReport:
    return evaluateToolTracePayload(case, trace.summary(includeEvents=True))


def evaluateToolTracePayload(case: TeacherEvalCase, tracePayload: Mapping[str, Any]) -> ToolSequenceReport:
    baseReport = evaluateToolSequence(
        case,
        _toolSequenceFromPayload(tracePayload),
        policyViolationCount=_policyViolationCountFromPayload(tracePayload),
        policyViolations=_policyViolationsFromPayload(tracePayload),
    )
    failures = list(baseReport.failures)
    workLabels = _workLabelsFromPayload(tracePayload)
    eventTypes = _eventTypesFromPayload(tracePayload)
    for label in case.expectedWorkLabels:
        if label not in workLabels:
            failures.append(f"missing expected work label: {label}")
    for eventType in case.expectedTraceEvents:
        if eventType not in eventTypes:
            failures.append(f"missing expected trace event: {eventType}")
    if case.expectedYamlContract and not _hasYamlContract(tracePayload):
        failures.append("missing structured learning YAML contract")
    return ToolSequenceReport(
        caseId=baseReport.caseId,
        passed=not failures,
        failures=tuple(failures),
        observedTools=baseReport.observedTools,
        observedWorkLabels=workLabels,
        workloopEventCount=len(workLabels),
        policyViolationCount=baseReport.policyViolationCount,
        policyViolations=baseReport.policyViolations,
    )


def evaluateGoldenTracePayloads(
    tracePayloadsByCaseId: Mapping[str, Mapping[str, Any]],
    cases: Sequence[TeacherEvalCase] = goldenEvalCases,
) -> TeacherEvalReport:
    reports: list[ToolSequenceReport] = []
    missingCaseIds: list[str] = []
    for case in cases:
        tracePayload = tracePayloadsByCaseId.get(case.caseId)
        if tracePayload is None:
            missingCaseIds.append(case.caseId)
            reports.append(
                ToolSequenceReport(
                    caseId=case.caseId,
                    passed=False,
                    failures=("missing trace payload",),
                )
            )
            continue
        reports.append(evaluateToolTracePayload(case, tracePayload))
    return TeacherEvalReport(
        passed=all(report.passed for report in reports),
        reports=tuple(reports),
        missingCaseIds=tuple(missingCaseIds),
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


def _workLabelsFromPayload(tracePayload: Mapping[str, Any]) -> tuple[str, ...]:
    labels: list[str] = []
    workloop = tracePayload.get("workloop")
    if isinstance(workloop, list):
        for item in workloop:
            if isinstance(item, Mapping) and item.get("workLabel"):
                labels.append(str(item["workLabel"]))

    for item in _iterTraceToolPayloads(tracePayload):
        if item.get("workLabel"):
            labels.append(str(item["workLabel"]))
    return tuple(dict.fromkeys(labels))


def _eventTypesFromPayload(tracePayload: Mapping[str, Any]) -> tuple[str, ...]:
    events = tracePayload.get("events")
    if not isinstance(events, list):
        return ()
    return tuple(
        str(event.get("eventType"))
        for event in events
        if isinstance(event, Mapping) and event.get("eventType")
    )


def _hasYamlContract(tracePayload: Mapping[str, Any]) -> bool:
    if tracePayload.get("yamlContractObserved") is True:
        return True
    for payload in _iterTraceToolPayloads(tracePayload):
        if payload.get("name") != "write-curriculum-yaml":
            continue
        result = payload.get("result")
        if not isinstance(result, Mapping):
            continue
        if _documentHasLearningContract(result.get("document")):
            return True
        if _documentHasLearningContract(result.get("curriculumDocument")):
            return True
    return False


def _documentHasLearningContract(value: Any) -> bool:
    if not isinstance(value, Mapping):
        return False
    blocks = value.get("blocks")
    if not isinstance(blocks, list):
        return False
    for block in blocks:
        if not isinstance(block, Mapping):
            continue
        payload = block.get("payload")
        if not isinstance(payload, Mapping):
            continue
        if isinstance(payload.get("learningContract"), Mapping):
            return True
        if isinstance(payload.get("sectionContract"), Mapping):
            return True
    return False


def _iterTraceToolPayloads(tracePayload: Mapping[str, Any]) -> tuple[Mapping[str, Any], ...]:
    payloads: list[Mapping[str, Any]] = []
    toolCalls = tracePayload.get("toolCalls")
    if isinstance(toolCalls, list):
        payloads.extend(item for item in toolCalls if isinstance(item, Mapping))

    events = tracePayload.get("events")
    if isinstance(events, list):
        for event in events:
            if not isinstance(event, Mapping):
                continue
            payload = event.get("payload")
            if isinstance(payload, Mapping):
                payloads.append(payload)
    return tuple(payloads)


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


def _policyViolationsFromPayload(tracePayload: Mapping[str, Any]) -> tuple[dict[str, str], ...]:
    explicit = tracePayload.get("policyViolations")
    if isinstance(explicit, list | tuple):
        return _normalizePolicyViolations(item for item in explicit if isinstance(item, Mapping))

    events = tracePayload.get("events")
    if not isinstance(events, list):
        return ()
    return _normalizePolicyViolations(
        event.get("payload")
        for event in events
        if isinstance(event, dict)
        and event.get("eventType") == "tool-policy-violation"
        and isinstance(event.get("payload"), Mapping)
    )


def _normalizePolicyViolations(violations: Sequence[Mapping[str, Any]] | Any) -> tuple[dict[str, str], ...]:
    return normalizeToolPolicyViolations(violation for violation in violations if isinstance(violation, Mapping))


def _policyViolationDetails(violations: Sequence[Mapping[str, str]]) -> str:
    return ", ".join(
        ":".join(part for part in (violation.get("policyCode"), violation.get("toolName")) if part)
        for violation in violations
    )
