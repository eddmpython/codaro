from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any

from .toolPolicy import normalizeToolPolicyViolations
from .traceModel import TeacherTrace


MAXIMUM_TEACHER_EVAL_SCORE = 10.0
MINIMUM_TEACHER_EVAL_SCORE = 9.0


@dataclass(frozen=True)
class TeacherEvalCase:
    caseId: str
    prompt: str
    expectedTools: tuple[str, ...] = ()
    expectedNoTools: bool = False
    expectedToolSequence: tuple[str, ...] = ()
    orderedBefore: tuple[tuple[str, str], ...] = ()
    forbiddenTools: tuple[str, ...] = ()
    expectedWorkLabels: tuple[str, ...] = ()
    expectedWorkDetails: tuple[str, ...] = ()
    expectedTraceEvents: tuple[str, ...] = ()
    expectedToolResultFields: tuple[tuple[str, str], ...] = ()
    expectedClarificationGate: bool = False
    expectedClarificationQuestionRange: tuple[int, int] | None = None
    expectedClarificationDefaultKeys: tuple[str, ...] = ()
    expectedYamlContract: bool = False
    expectedSectionCardFlow: bool = False
    expectedLoadedInEditor: bool = False
    expectedRuntimePackages: tuple[str, ...] = ()
    allowPolicyViolations: bool = False


@dataclass(frozen=True)
class ToolSequenceReport:
    caseId: str
    passed: bool
    failures: tuple[str, ...] = field(default_factory=tuple)
    observedTools: tuple[str, ...] = field(default_factory=tuple)
    observedWorkLabels: tuple[str, ...] = field(default_factory=tuple)
    observedWorkDetails: tuple[str, ...] = field(default_factory=tuple)
    workloopEventCount: int = 0
    policyViolationCount: int = 0
    policyViolations: tuple[dict[str, str], ...] = field(default_factory=tuple)
    observedResultSignals: tuple[str, ...] = field(default_factory=tuple)


@dataclass(frozen=True)
class TeacherEvalReport:
    passed: bool
    reports: tuple[ToolSequenceReport, ...]
    missingCaseIds: tuple[str, ...] = field(default_factory=tuple)

    @property
    def score(self) -> float:
        return scoreTeacherEvalReports(self.reports)

    def payload(self) -> dict[str, Any]:
        return {
            "passed": self.passed,
            "score": self.score,
            "maxScore": MAXIMUM_TEACHER_EVAL_SCORE,
            "minimumScore": MINIMUM_TEACHER_EVAL_SCORE,
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
                    "observedWorkDetails": list(report.observedWorkDetails),
                    "workloopEventCount": report.workloopEventCount,
                    "policyViolationCount": report.policyViolationCount,
                    "policyViolations": list(report.policyViolations),
                    "observedResultSignals": list(report.observedResultSignals),
                }
                for report in self.reports
            ],
        }


@dataclass(frozen=True)
class TeacherGoldenRunReport:
    caseId: str
    passed: bool
    evaluation: ToolSequenceReport
    turnPayload: Mapping[str, Any]
    tracePayload: Mapping[str, Any]

    def payload(self) -> dict[str, Any]:
        score = scoreTeacherEvalReports((self.evaluation,))
        return {
            "caseId": self.caseId,
            "passed": self.passed,
            "score": score,
            "maxScore": MAXIMUM_TEACHER_EVAL_SCORE,
            "minimumScore": MINIMUM_TEACHER_EVAL_SCORE,
            "evaluation": {
                "passed": self.evaluation.passed,
                "failures": list(self.evaluation.failures),
                "observedTools": list(self.evaluation.observedTools),
                "observedWorkLabels": list(self.evaluation.observedWorkLabels),
                "observedWorkDetails": list(self.evaluation.observedWorkDetails),
                "observedResultSignals": list(self.evaluation.observedResultSignals),
                "policyViolationCount": self.evaluation.policyViolationCount,
                "policyViolations": list(self.evaluation.policyViolations),
            },
            "trace": dict(self.tracePayload),
        }


def scoreTeacherEvalReports(reports: Sequence[ToolSequenceReport]) -> float:
    if not reports:
        return 0.0
    passedCount = sum(1 for report in reports if report.passed)
    return round(MAXIMUM_TEACHER_EVAL_SCORE * passedCount / len(reports), 2)


goldenEvalCases: tuple[TeacherEvalCase, ...] = (
    TeacherEvalCase(
        caseId="ambiguous-learning-asks-clarification",
        prompt="데이터 분석 커리큘럼 만들어줘",
        expectedNoTools=True,
        forbiddenTools=("write-curriculum-yaml", "packages-check", "cell-call"),
        expectedWorkLabels=("작업 전 확인 질문",),
        expectedWorkDetails=("핵심 질문", "현재 가정"),
        expectedTraceEvents=("clarification-gate",),
        expectedClarificationGate=True,
        expectedClarificationQuestionRange=(1, 3),
        expectedClarificationDefaultKeys=("level", "depth", "environment", "balance"),
    ),
    TeacherEvalCase(
        caseId="curriculum-yaml-materialized",
        prompt="pandas 기초 커리큘럼 만들어줘",
        expectedTools=("write-curriculum-yaml",),
        expectedWorkLabels=("커리큘럼 YAML 전개",),
        expectedWorkDetails=("구조화된 YAML을 섹션 카드와 실행 셀로 변환",),
        expectedTraceEvents=("tool-start", "tool-result"),
        expectedToolResultFields=(("write-curriculum-yaml", "document"),),
        expectedYamlContract=True,
        expectedSectionCardFlow=True,
        expectedLoadedInEditor=True,
        expectedRuntimePackages=("pandas",),
    ),
    TeacherEvalCase(
        caseId="dependency-preflight-before-install",
        prompt="matplotlib 그래프 실습 셀을 실행하고 확인해줘",
        expectedTools=("packages-check", "packages-install", "cell-call"),
        expectedToolSequence=("packages-check", "packages-install", "cell-call"),
        orderedBefore=(("packages-check", "packages-install"), ("packages-install", "cell-call")),
        expectedWorkLabels=("라이브러리 확인", "uv 라이브러리 설치", "셀 실행/검증"),
        expectedWorkDetails=("matplotlib 설치 여부 확인", "matplotlib를 uv로 설치", "cell-1 실행 또는 검증"),
        expectedTraceEvents=("tool-start", "tool-result"),
        expectedToolResultFields=(
            ("packages-check", "missing"),
            ("packages-install", "success"),
            ("packages-install", "installer"),
            ("packages-install", "durationMs"),
            ("cell-call", "passed"),
        ),
    ),
    TeacherEvalCase(
        caseId="provider-error-promotes-workloop",
        prompt="요약해줘",
        expectedNoTools=True,
        expectedWorkLabels=("provider 오류",),
        expectedWorkDetails=("provider 응답 처리 중단",),
        expectedTraceEvents=("turn-error",),
    ),
    TeacherEvalCase(
        caseId="answer-check-uses-cell-call",
        prompt="내 답 맞아?",
        expectedTools=("read-cells", "cell-call"),
        expectedToolResultFields=(("cell-call", "passed"),),
    ),
    TeacherEvalCase(
        caseId="cell-run-does-not-skip-package-preflight",
        prompt="seaborn으로 그래프 셀 실행해줘",
        expectedTools=("packages-check", "packages-install", "cell-call"),
        expectedToolSequence=("packages-check", "packages-install", "cell-call"),
        orderedBefore=(("packages-check", "packages-install"), ("packages-install", "cell-call")),
        expectedToolResultFields=(
            ("packages-check", "missing"),
            ("packages-install", "success"),
            ("packages-install", "installer"),
            ("packages-install", "durationMs"),
            ("cell-call", "status"),
        ),
    ),
    TeacherEvalCase(
        caseId="automation-uses-guarded-input-tools",
        prompt="브라우저에서 버튼을 찾아 클릭하는 자동화를 만들어줘",
        expectedTools=("find-element", "click-element"),
        orderedBefore=(("find-element", "click-element"),),
        expectedToolResultFields=(("find-element", "elements"), ("click-element", "success")),
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
    if case.expectedNoTools and toolNames:
        failures.append(f"expected no tools, observed: {', '.join(toolNames)}")
    if case.expectedToolSequence and tuple(toolNames) != case.expectedToolSequence:
        expected = " -> ".join(case.expectedToolSequence)
        observed = " -> ".join(str(toolName) for toolName in toolNames) or "(none)"
        failures.append(f"expected exact tool sequence {expected}, observed {observed}")
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
    workDetails = _workDetailsFromPayload(tracePayload)
    eventTypes = _eventTypesFromPayload(tracePayload)
    for label in case.expectedWorkLabels:
        if label not in workLabels:
            failures.append(f"missing expected work label: {label}")
    for detail in case.expectedWorkDetails:
        if not any(detail in observedDetail for observedDetail in workDetails):
            failures.append(f"missing expected work detail: {detail}")
    for eventType in case.expectedTraceEvents:
        if eventType not in eventTypes:
            failures.append(f"missing expected trace event: {eventType}")
    if case.expectedClarificationGate:
        failures.extend(_clarificationGateFailures(tracePayload, case))
    if case.expectedYamlContract and not _hasYamlContract(tracePayload):
        failures.append("missing structured learning YAML contract")
    if case.expectedSectionCardFlow and not _hasStructuredSectionCardFlow(tracePayload):
        failures.append("missing structured section card flow")
    if case.expectedLoadedInEditor and not _hasLoadedCurriculumDocument(tracePayload):
        failures.append("curriculum document was not loaded in editor")
    missingRuntimePackages = _missingRuntimePackages(tracePayload, case.expectedRuntimePackages)
    if missingRuntimePackages:
        failures.append(f"missing runtime packages: {', '.join(missingRuntimePackages)}")
    for toolName, fieldName in case.expectedToolResultFields:
        if not _toolResultFieldObserved(tracePayload, toolName, fieldName):
            failures.append(f"missing result field for {toolName}: {fieldName}")
    return ToolSequenceReport(
        caseId=baseReport.caseId,
        passed=not failures,
        failures=tuple(failures),
        observedTools=baseReport.observedTools,
        observedWorkLabels=workLabels,
        observedWorkDetails=workDetails,
        workloopEventCount=len(workLabels),
        policyViolationCount=baseReport.policyViolationCount,
        policyViolations=baseReport.policyViolations,
        observedResultSignals=_toolResultSignals(tracePayload),
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


def teacherTurnTracePayload(turnPayload: Mapping[str, Any]) -> dict[str, Any]:
    trace = turnPayload.get("trace")
    tracePayload: dict[str, Any] = dict(trace) if isinstance(trace, Mapping) else {}
    toolCalls = turnPayload.get("toolCalls")
    if isinstance(toolCalls, list):
        tracePayload["toolCalls"] = toolCalls
    return tracePayload


def evaluateTeacherTurnPayload(case: TeacherEvalCase, turnPayload: Mapping[str, Any]) -> ToolSequenceReport:
    return evaluateToolTracePayload(case, teacherTurnTracePayload(turnPayload))


async def runTeacherGoldenProviderCase(
    case: TeacherEvalCase,
    *,
    provider: Any,
    executor: Any,
    convManager: Any,
    orchestrator: Any,
    tools: list[dict[str, Any]] | None = None,
    conversationId: str | None = None,
    messages: list[dict[str, Any]] | None = None,
    maxToolRounds: int = 10,
    clarificationPlan: Any | None = None,
) -> TeacherGoldenRunReport:
    from ..tools import toolSchemas
    from .providerLoop import runTeacherChatLoop

    runConversationId = conversationId or f"golden-{case.caseId}"
    runMessages = list(messages) if messages is not None else [{"role": "user", "content": case.prompt}]
    turnPayload = await runTeacherChatLoop(
        provider=provider,
        convManager=convManager,
        conversationId=runConversationId,
        messages=runMessages,
        tools=tools if tools is not None else toolSchemas(),
        executor=executor,
        orchestrator=orchestrator,
        maxToolRounds=maxToolRounds,
        clarificationPlan=clarificationPlan,
    )
    tracePayload = teacherTurnTracePayload(turnPayload)
    evaluation = evaluateToolTracePayload(case, tracePayload)
    return TeacherGoldenRunReport(
        caseId=case.caseId,
        passed=evaluation.passed,
        evaluation=evaluation,
        turnPayload=turnPayload,
        tracePayload=tracePayload,
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


def _workDetailsFromPayload(tracePayload: Mapping[str, Any]) -> tuple[str, ...]:
    details: list[str] = []
    workloop = tracePayload.get("workloop")
    if isinstance(workloop, list):
        for item in workloop:
            if isinstance(item, Mapping) and item.get("workDetail"):
                details.append(str(item["workDetail"]))

    for item in _iterTraceToolPayloads(tracePayload):
        if item.get("workDetail"):
            details.append(str(item["workDetail"]))
    return tuple(dict.fromkeys(details))


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


def _hasStructuredSectionCardFlow(tracePayload: Mapping[str, Any]) -> bool:
    return any(
        _documentHasStructuredSectionCardFlow(document)
        for document in _iterCurriculumDocuments(tracePayload)
    )


def _clarificationGateFailures(tracePayload: Mapping[str, Any], case: TeacherEvalCase) -> list[str]:
    payloads = _clarificationGatePayloads(tracePayload)
    if not payloads:
        return ["missing clarification gate payload"]

    failures: list[str] = []
    payload = payloads[0]
    questions = payload.get("questions")
    questionCount = len(questions) if isinstance(questions, list) else 0
    if case.expectedClarificationQuestionRange is not None:
        minimum, maximum = case.expectedClarificationQuestionRange
        if not minimum <= questionCount <= maximum:
            failures.append(f"clarification question count out of range: {questionCount}")

    defaults = payload.get("defaults")
    defaultKeys = set(defaults.keys()) if isinstance(defaults, Mapping) else set()
    missingDefaultKeys = [key for key in case.expectedClarificationDefaultKeys if key not in defaultKeys]
    if missingDefaultKeys:
        failures.append(f"missing clarification defaults: {', '.join(missingDefaultKeys)}")

    return failures


def _clarificationGatePayloads(tracePayload: Mapping[str, Any]) -> tuple[Mapping[str, Any], ...]:
    events = tracePayload.get("events")
    if not isinstance(events, list):
        return ()
    payloads: list[Mapping[str, Any]] = []
    for event in events:
        if not isinstance(event, Mapping) or event.get("eventType") != "clarification-gate":
            continue
        payload = event.get("payload")
        if isinstance(payload, Mapping):
            payloads.append(payload)
    return tuple(payloads)


def _hasLoadedCurriculumDocument(tracePayload: Mapping[str, Any]) -> bool:
    return any(
        result.get("loadedInEditor") is True
        for result in _toolResultPayloads(tracePayload, "write-curriculum-yaml")
    )


def _missingRuntimePackages(tracePayload: Mapping[str, Any], expectedPackages: Sequence[str]) -> tuple[str, ...]:
    expected = tuple(normalized for package in expectedPackages if (normalized := _normalizePackageName(package)))
    if not expected:
        return ()
    observed = set[str]()
    for document in _iterCurriculumDocuments(tracePayload):
        runtime = document.get("runtime")
        if not isinstance(runtime, Mapping):
            continue
        packages = runtime.get("packages")
        if not isinstance(packages, list):
            continue
        observed.update(_normalizePackageName(package) for package in packages)
    return tuple(package for package in expected if package not in observed)


def _normalizePackageName(value: Any) -> str:
    return str(value).strip().lower().replace("_", "-") if value is not None else ""


def _iterCurriculumDocuments(tracePayload: Mapping[str, Any]) -> tuple[Mapping[str, Any], ...]:
    documents: list[Mapping[str, Any]] = []
    for result in _toolResultPayloads(tracePayload, "write-curriculum-yaml"):
        for key in ("document", "curriculumDocument"):
            document = result.get(key)
            if isinstance(document, Mapping):
                documents.append(document)
    return tuple(documents)


def _documentHasStructuredSectionCardFlow(document: Mapping[str, Any]) -> bool:
    blocks = document.get("blocks")
    if not isinstance(blocks, list):
        return False

    for index, block in enumerate(blocks):
        if not isinstance(block, Mapping) or block.get("sourceType") != "section":
            continue
        contract = _sectionContractFromBlock(block)
        if not _sectionContractHasCardFields(contract):
            continue
        sectionBlocks = _sectionContractBlocksAfter(blocks, index)
        if _sectionBlocksHaveCardFlow(sectionBlocks):
            return True
    return False


def _sectionContractFromBlock(block: Mapping[str, Any]) -> Mapping[str, Any] | None:
    payload = block.get("payload")
    if not isinstance(payload, Mapping):
        return None
    contract = payload.get("sectionContract")
    return contract if isinstance(contract, Mapping) else None


def _sectionContractHasCardFields(contract: Mapping[str, Any] | None) -> bool:
    if not isinstance(contract, Mapping):
        return False
    requiredTextFields = ("title", "goal", "why", "explanation")
    if any(not _hasText(contract.get(fieldName)) for fieldName in requiredTextFields):
        return False
    tips = contract.get("tips")
    return isinstance(tips, list) and any(_hasText(tip) for tip in tips)


def _sectionContractBlocksAfter(blocks: Sequence[Any], sectionIndex: int) -> tuple[Mapping[str, Any], ...]:
    result: list[Mapping[str, Any]] = []
    for block in blocks[sectionIndex + 1:]:
        if not isinstance(block, Mapping):
            continue
        sourceType = block.get("sourceType")
        if sourceType == "section":
            break
        if isinstance(sourceType, str) and sourceType.startswith("sectionContract:"):
            result.append(block)
    return tuple(result)


def _sectionBlocksHaveCardFlow(blocks: Sequence[Mapping[str, Any]]) -> bool:
    expectedTypes = (
        "sectionContract:explanation",
        "sectionContract:snippet",
        "sectionContract:exercise",
        "sectionContract:check",
    )
    nextExpectedIndex = 0
    for block in blocks:
        expectedType = expectedTypes[nextExpectedIndex]
        if block.get("sourceType") != expectedType:
            continue
        if not _sectionFlowBlockIsValid(block, expectedType):
            return False
        nextExpectedIndex += 1
        if nextExpectedIndex == len(expectedTypes):
            return True
    return False


def _sectionFlowBlockIsValid(block: Mapping[str, Any], sourceType: str) -> bool:
    if sourceType == "sectionContract:explanation":
        return block.get("role") == "learning" and _hasText(block.get("content"))
    if sourceType == "sectionContract:snippet":
        return block.get("type") == "code" and block.get("role") == "snippet" and _hasText(block.get("content"))
    if sourceType == "sectionContract:exercise":
        guide = block.get("guide")
        return (
            block.get("type") == "code"
            and block.get("role") == "exercise"
            and _hasText(block.get("content"))
            and isinstance(guide, Mapping)
        )
    if sourceType == "sectionContract:check":
        return block.get("role") == "check" and _hasText(block.get("content"))
    return False


def _toolResultFieldObserved(tracePayload: Mapping[str, Any], toolName: str, fieldName: str) -> bool:
    for result in _toolResultPayloads(tracePayload, toolName):
        value = _valueAtPath(result, fieldName)
        if value is not None:
            return True
    return False


def _toolResultSignals(tracePayload: Mapping[str, Any]) -> tuple[str, ...]:
    signals: list[str] = []
    for payload in _iterTraceToolPayloads(tracePayload):
        toolName = payload.get("name")
        result = payload.get("result")
        if not toolName or not isinstance(result, Mapping):
            continue
        signals.extend(f"{toolName}.{fieldName}" for fieldName in result.keys())
    return tuple(dict.fromkeys(signals))


def _toolResultPayloads(tracePayload: Mapping[str, Any], toolName: str) -> tuple[Mapping[str, Any], ...]:
    results: list[Mapping[str, Any]] = []
    for payload in _iterTraceToolPayloads(tracePayload):
        if payload.get("name") != toolName:
            continue
        result = payload.get("result")
        if isinstance(result, Mapping):
            results.append(result)
    return tuple(results)


def _valueAtPath(value: Mapping[str, Any], path: str) -> Any:
    current: Any = value
    for part in path.split("."):
        if not isinstance(current, Mapping) or part not in current:
            return None
        current = current[part]
    return current


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


def _hasText(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


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
