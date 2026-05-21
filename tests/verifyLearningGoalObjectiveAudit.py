from __future__ import annotations

import json
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MINIMUM_SCORE = 9
PRODUCT_QUALITY_GATES = (
    "docs",
    "backend",
    "learning-system-readiness",
    "dogfood-alpha-audit",
    "product-quality-audit",
    "diagnostic-summary-contract",
    "ai-live-smoke",
    "provider-settings-browser",
    "install-launcher-smoke",
    "runtime-recovery-contract",
    "runtime-recovery-browser",
    "curriculum-quality-matrix",
    "onboarding-browser",
    "frontend-performance-budget",
    "landing-build",
    "launcher-test",
)
REQUIRED_LIVE_CASES = (
    "provider-availability",
    "short-answer",
    "teacher-answer",
    "clarification-before-provider",
    "live-tool-loop",
    "live-cell-call-loop",
)


@dataclass(frozen=True)
class ObjectiveRequirement:
    requirementId: str
    requirement: str
    evidenceChecks: tuple[tuple[str, tuple[str, ...]], ...]
    forbiddenChecks: tuple[tuple[str, tuple[str, ...]], ...] = field(default_factory=tuple)

    def evaluate(self) -> dict[str, Any]:
        evidence: list[str] = []
        missing: list[str] = []
        for relPath, needles in self.evidenceChecks:
            found, absent = fileNeedleReport(relPath, needles)
            evidence.extend(found)
            missing.extend(absent)
        for relPath, needles in self.forbiddenChecks:
            absent, present = fileForbiddenNeedleReport(relPath, needles)
            evidence.extend(absent)
            missing.extend(present)
        return {
            "id": self.requirementId,
            "passed": not missing,
            "requirement": self.requirement,
            "evidence": evidence,
            "missing": missing,
        }


OBJECTIVE_REQUIREMENTS = (
    ObjectiveRequirement(
        requirementId="structured-yaml-and-section-card-ssot",
        requirement="Structured YAML contract and one-section-one-card learning model are the SSOT.",
        evidenceChecks=(
            ("docs/skills/architecture/learning-yaml-contract.md", (
                "YAML은 lesson SSOT다",
                "sections:",
                "title → subtitle → goal → why → explanation → tips → snippet → exercise → result → check",
                "sectionContract:*",
                "contractGapCount: 0",
            )),
            ("tests/verifyLearningSystemReadiness.py", (
                "learning-yaml-contract-ssot",
                "teacher-prompt-contract-alignment",
                "section-card-render-contract",
            )),
            ("src/codaro/ai/conversation.py", (
                "Each new concept lives in one YAML section card",
                "legacy or targeted practice helpers",
            )),
            ("src/codaro/curriculum/learningSpec.py", (
                "Treat each section as one learning card",
                "not several small blocks",
            )),
            ("src/codaro/ai/toolDefinitions/learning.py", (
                "legacy targeted concept drill",
                "Prefer write-curriculum-yaml",
            )),
            ("docs/skills/identity/ai-integration.md", (
                "`write-curriculum-yaml`: structured YAML을 섹션 카드와 실행 셀로 전개",
                "`packages-check`, `packages-install`: 실행 전 라이브러리 확인과 uv 설치",
                "`sections[].blocks[]`는 기존 curriculum 변환용이다",
            )),
        ),
    ),
    ObjectiveRequirement(
        requirementId="learning-card-product-surface",
        requirement="Section learning cards render as polished cards with direct exercise input and snippet affordances.",
        evidenceChecks=(
            ("editor/src/components/curriculum/curriculumSurface.tsx", (
                "data-learning-section-card",
                "data-learning-section-heading",
                "data-learning-code-input",
                "data-learning-exercise-input",
                "data-learning-exercise-input-role",
                "data-learning-section-contract-gaps",
                "data-learning-flow-canvas",
                "data-learning-flow-blueprint",
                "data-learning-flow-runtime-node",
                "data-learning-flow-track",
                "diagramRuntimeNodes",
                "diagram.runtime",
            )),
            ("editor/src/components/app/appPrimitives.tsx", (
                "data-code-payload=\"snippet\"",
                "data-code-payload-copy=\"true\"",
            )),
            ("tests/verifyLearningSectionCardContract.py", (
                "structured exercise direct editor",
                "data-code-payload-copy",
            )),
        ),
    ),
    ObjectiveRequirement(
        requirementId="inline-help-and-codaro-identity-surface",
        requirement="Learning cells expose local help in place and the assistant surface uses Codaro identity instead of robot/bot framing.",
        evidenceChecks=(
            ("editor/src/components/app/cellAiActions.tsx", (
                "data-cell-ai-popover=\"true\"",
                "data-cell-ai-question=\"true\"",
                "data-cell-ai-answer=\"true\"",
                "data-cell-ai-help-trigger=\"always-visible\"",
                "이 셀에서 바로 질문",
                "이 셀 답변",
                "onAsk(action, question)",
            )),
            ("editor/src/components/assistant/assistantPanel.tsx", (
                "Codaro AI",
                "/brand/avatar-small.png",
            )),
            ("docs/skills/architecture/frontend-product-surface.md", (
                "해당 셀 안의 도움 요청 팝오버에서 바로 질문",
                "로봇 아이콘을 쓰지 않고 브랜드 아바타를 쓴다",
                "셀 도움 요청 버튼은 호버 때만 나타나지 않고 기본 상태에서도 항상 보인다",
            )),
            ("tests/verifyLearningSectionCardContract.py", (
                "data-cell-ai-popover",
                "data-cell-ai-help-trigger=\"always-visible\"",
                "Codaro avatar",
                "forbidden token remains",
            )),
        ),
        forbiddenChecks=(
            ("editor/src/components/assistant/assistantPanel.tsx", (
                "Codaro 어시스턴트",
                "Bot,",
                "Robot",
                "robot",
            )),
            ("editor/src/components/app/cellAiActions.tsx", (
                "group-hover:opacity-100",
                "lg:opacity-0",
                "tabIndex={selected ? 0 : -1}",
            )),
            ("editor/src/components/curriculum/curriculumSurface.tsx", (
                "클릭해서 직접 입력하세요.",
                "클릭해서 코드를 편집하세요.",
                "absolute right-full",
            )),
        ),
    ),
    ObjectiveRequirement(
        requirementId="deterministic-clarification-gate",
        requirement="Ambiguous learning requests stop at a deterministic 1-3 question clarification gate.",
        evidenceChecks=(
            ("src/codaro/ai/teacher/evalHarness.py", (
                "ambiguous-learning-asks-clarification",
                "expectedNoTools=True",
                "expectedClarificationQuestionRange=(1, 3)",
                "expectedClarificationAssumptionKeys",
                "missing clarification assumptions payload",
            )),
            ("tests/verifyTeacherGoldenE2e.py", (
                "ProviderShouldNotBeCalled",
                "clarification-continuation-uses-assumptions",
                "runClarificationCase",
                "runClarificationContinuationCase",
                "clarification gate called provider",
                "clarification payload exposed defaults compatibility alias",
                "clarificationAssumptionKeys",
                "pending clarification was not consumed",
                "stale clarification leaked into a new request",
                "specific new learning request reused stale clarification",
            )),
            ("src/codaro/ai/conversation.py", (
                "pendingClarification",
                "setPendingClarification",
                "consumePendingClarification",
            )),
            ("src/codaro/ai/teacher/clarificationPolicy.py", (
                "assumptions: dict[str, str]",
                "\"assumptions\": dict(self.assumptions)",
                "작업 기준:",
                "questions[:3]",
                "\"level\"",
                "\"depth\"",
                "\"environment\"",
            )),
            ("src/codaro/ai/conversation.py", (
                "clarification assumptions recorded in the workloop",
            )),
            ("src/codaro/ai/teacher/turnRuntime.py", (
                "shouldApplyPendingClarification",
                "STALE_CLARIFICATION_RESET_MARKERS",
                "NEW_LEARNING_REQUEST_MARKERS",
            )),
        ),
    ),
    ObjectiveRequirement(
        requirementId="uv-package-tool-policy",
        requirement="Tool policy enforces packages-check, uv install, then cell execution.",
        evidenceChecks=(
            ("src/codaro/ai/teacher/evalHarness.py", (
                "dependency-preflight-before-install",
                "dependency-preflight-failure-blocks-cell-call",
                "expectedToolSequence=(\"packages-check\", \"packages-install\", \"cell-call\")",
                "allowPolicyViolations=True",
            )),
            ("src/codaro/ai/teacher/toolPolicy.py", (
                "package-check-required",
                "dependency-preflight-required",
                "dependency-install-required",
            )),
            ("tests/verifyTeacherGoldenE2e.py", (
                "failed preflight should block executor cell-call",
                "provider did not receive dependency-preflight policy result",
                "failed packages-check did not expose readable workloop error",
            )),
            ("src/codaro/system/packageOps.py", (
                "installer: str = \"uv\"",
                "environment: str = \"project .venv\"",
                "runUvPip(\"install\"",
            )),
        ),
    ),
    ObjectiveRequirement(
        requirementId="workloop-and-trace-visibility",
        requirement="Teacher trace and frontend workloop expose readable progress and failures.",
        evidenceChecks=(
            ("src/codaro/ai/teacher/traceModel.py", (
                "provider 오류",
                "provider 응답 처리 중단",
                "workDetail",
            )),
            ("src/codaro/ai/teacher/providerLoop.py", (
                "trace.record(\"turn-error\"",
                "finishTeacherTurnErrorPayload",
            )),
            ("src/codaro/ai/teacher/providerStream.py", (
                "provider stream tool loop failed",
                "providerStreamErrorEvent",
            )),
            ("editor/src/lib/workLoop.ts", (
                "traceWorkloopDetail",
                "toolResultDetail",
                "sectionCount",
                "exerciseCellCount",
                "shouldPromoteTraceWorkloopEvent",
                "clarification-gate",
                "turn-error",
                "durationMs",
                "skipped",
                "contractGapCount",
            )),
            ("tests/verifyAssistantWorkloopContract.py", (
                "작업 전 확인 질문",
                "작업 기준",
                "섹션 카드 2개",
                "실습 셀 2개",
                "provider 응답 처리 중단",
                "packages-check",
                "packages-install",
                "cell-call",
                "project .venv",
                "pandas 이미 준비됨",
                "계약 gap 2개",
            )),
            ("tests/testTeacherArchitecture.py", (
                "testProviderStreamReportsToolLoopProviderErrorsInTrace",
                "provider broken after tool",
            )),
        ),
    ),
    ObjectiveRequirement(
        requirementId="real-provider-golden-e2e-score",
        requirement="Teacher/provider golden e2e uses real loop payloads and reports a 9.0 score threshold.",
        evidenceChecks=(
            ("src/codaro/ai/teacher/evalHarness.py", (
                "runTeacherGoldenProviderCase",
                "TeacherGoldenRunReport",
                "MINIMUM_TEACHER_EVAL_SCORE = 9.0",
                "scoreTeacherEvalReports",
                "expectedDiagramRuntimeDetails",
                "_missingDiagramRuntimeDetails",
                "(\"write-curriculum-yaml\", \"sectionCount\")",
                "(\"write-curriculum-yaml\", \"exerciseCellCount\")",
                "(\"write-curriculum-yaml\", \"contractGapCount\")",
                "expectedNoContractGaps",
            )),
            ("src/codaro/ai/teacher/providerLoop.py", (
                "serializeToolResultForProvider",
                "provider-tool-result-max-chars",
                "PROVIDER_TOOL_RESULT_SIGNAL_KEYS",
            )),
            ("tests/testTeacherArchitecture.py", (
                "testProviderLoopBoundsLargeToolResultMessages",
                "roundResult.toolResults[0][\"result\"]",
                "\"truncatedReason\"",
            )),
            ("tests/verifyTeacherGoldenE2e.py", (
                "teacher golden e2e score",
                "\"score\": score",
                "\"minimumScore\": MINIMUM_TEACHER_EVAL_SCORE",
                "messagesByCall",
                "providerCallToolResultPayload",
                "provider did not receive tool result",
                "write-curriculum-yaml.sectionCount",
                "write-curriculum-yaml.exerciseCellCount",
                "write-curriculum-yaml.contractGapCount",
                "provider received curriculum tool result with contract gaps",
                "uv 사전 확인",
                "검증 결과",
            )),
            ("docs/skills/architecture/teacher-tool-loop.md", (
                "role: tool",
                "tool sequence만 맞고 provider가 결과를 보지 못한 채 다음 응답으로 넘어가면 실패",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "provider가 tool result를 보지 못하면 실패",
            )),
            ("tests/run.py", (
                "\"teacher-eval\"",
                "\"teacher-e2e\"",
            )),
        ),
    ),
    ObjectiveRequirement(
        requirementId="docs-skills-ssot",
        requirement="docs/skills remains the operational SSOT for architecture, gates, and learning contracts.",
        evidenceChecks=(
            ("CLAUDE.md", (
                "상세 규칙은 [docs/skills/]",
                "Teacher tool loop",
                "SSOT map",
            )),
            ("docs/skills/architecture/ssot-map.md", (
                "learning YAML contract",
                "provider loop",
                "eval harness",
                "workloop state",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "`learning-system-readiness`",
                "`learning-goal-audit`",
                "`score`, `maxScore`, `minimumScore`",
            )),
        ),
    ),
    ObjectiveRequirement(
        requirementId="playwright-product-verification",
        requirement="Playwright verifies desktop/mobile learning card rendering from real materialized YAML output.",
        evidenceChecks=(
            ("tests/run.py", (
                "\"learning-card-browser\"",
                "tests/verifyLearningCardPlaywright.py",
            )),
            ("tests/verifyLearningCardPlaywright.py", (
                "yamlToDocument",
                "materializedStructuredLessonDocument",
                "desktopOverview",
                "mobileOverview",
                "jsAssertLearningVisualIntegrity",
                "visualIntegrity",
                "data-learning-flow-canvas",
                "data-learning-flow-blueprint",
                "data-learning-flow-runtime-node",
                "data-learning-flow-track",
                "uv 사전 확인",
                "검증 결과",
                "jsAssertContractGapWarning",
                "부분 구조화 섹션",
                "data-learning-section-contract-gaps",
            )),
            ("tests/playwrightCli.py", (
                "isPlaywrightEvalError",
                "PlaywrightCliError",
                "repoLocalPlaywrightWorkspace",
            )),
        ),
    ),
    ObjectiveRequirement(
        requirementId="goal-audit-gate-covers-builds-and-tests",
        requirement="The final goal audit gate ties objective audit, product quality audit, readiness, backend tests, and landing build together.",
        evidenceChecks=(
            ("tests/run.py", (
                "\"learning-goal-audit\"",
                "tests/verifyProductQualityAudit.py",
                "\"product-quality-audit\"",
                "tests/verifyLearningGoalObjectiveAudit.py",
                "tests/verifyLearningSystemReadiness.py",
                "\"pytest\", \"tests/\"",
                "\"npm\", \"run\", \"build\"",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "`learning-goal-audit`",
                "명시 요구사항 audit",
                "`product-quality-audit`",
                "전체 backend",
                "landing build",
                "`requiredScore`",
                "`requirementFailures`",
            )),
        ),
    ),
    ObjectiveRequirement(
        requirementId="well-built-product-quality-gates",
        requirement="The current goal is judged as a well-built local product by product-quality gates, not a service-ready label.",
        evidenceChecks=(
            ("tests/run.py", (
                "\"quality-cycle\"",
                "PRODUCT_QUALITY_GATES",
                "\"product-quality-audit\"",
                "\"diagnostic-summary-contract\"",
                "\"install-launcher-smoke\"",
                "\"runtime-recovery-contract\"",
                "\"runtime-recovery-browser\"",
                "\"curriculum-quality-matrix\"",
                "\"onboarding-browser\"",
                "\"frontend-performance-budget\"",
                "\"landing-build\"",
                "\"launcher-test\"",
            )),
            ("tests/verifyProductQualityAudit.py", (
                "\"gate\": \"product-quality-audit\"",
                "ProductQualityRequirement",
                "generated-docs-freshness",
                "repo-local-gate-isolation",
                "live-provider-diagnostics",
                "no-secret-diagnostics",
                "frontend-performance-budget",
                "runtime-recovery-browser-flow",
                "onboarding-browser-flow",
            )),
            ("tests/verifyLandingDocsBundleSplit.py", (
                "generated-docs-freshness",
                "product-quality-audit",
                "부트스트랩은 <code>/api/system/diagnostics</code>를 읽어 시작 진단 안내",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "잘 만들어진 로컬 제품",
                "`quality-cycle`",
                "`product-quality-audit`",
                "`landing-build`는 `docs/skills` 핵심 SSOT 문구가 generated docs에 반영된 상태인지도 확인한다",
                "`service-readiness-audit`는 이전 자동화를 위한 호환 alias",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "`quality-cycle`",
                "`product-quality-audit`",
                "`diagnostic-summary-contract`",
                "`install-launcher-smoke`",
                "`runtime-recovery-browser`",
                "`curriculum-quality-matrix`",
                "`onboarding-browser`",
                "`frontend-performance-budget`",
                "`landing-build`",
                "stale 상태도 실패",
            )),
        ),
    ),
    ObjectiveRequirement(
        requirementId="objective-audit-is-versioned",
        requirement="The explicit objective audit is versioned as a named verifier with a 9 point minimum.",
        evidenceChecks=(
            ("tests/verifyLearningGoalObjectiveAudit.py", (
                "OBJECTIVE_REQUIREMENTS",
                "MINIMUM_SCORE = 9",
                "requiredScore",
                "requirementFailures",
                "buildAuditPayload",
                "learning goal objective audit score",
            )),
            ("tests/verifyLearningSystemReadiness.py", (
                "goal-objective-audit-contract",
                "tests/verifyLearningGoalObjectiveAudit.py",
            )),
        ),
    ),
)


def main() -> int:
    results = (
        *(requirement.evaluate() for requirement in OBJECTIVE_REQUIREMENTS),
        evaluateLatestQualityCycleArtifacts(),
    )
    payload = buildAuditPayload(results)

    if not payload["passed"]:
        print("FAIL: learning goal objective audit score is below threshold or explicit requirements failed", file=sys.stderr)
        print(json.dumps(payload, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1

    print(f"ok: learning goal objective audit score {payload['score']}/{payload['maxScore']}")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


def evaluateLatestQualityCycleArtifacts() -> dict[str, Any]:
    evidence: list[str] = []
    missing: list[str] = []
    currentHead = currentGitHead()
    if currentHead:
        evidence.append(f"current git head: {currentHead[:12]}")
    else:
        missing.append("git: unable to resolve current HEAD")
    trackedChanges = currentTrackedWorktreeChanges()
    if trackedChanges is None:
        missing.append("git: unable to inspect tracked working tree changes")
    elif trackedChanges:
        preview = ", ".join(trackedChanges[:5])
        missing.append(f"git: tracked working tree changes remain before final audit ({preview})")
    else:
        evidence.append("git tracked working tree: clean")

    qualitySummary = readJsonArtifact("output/test-runner/quality-cycle/sequence-summary.json", missing)
    if isinstance(qualitySummary, dict):
        evaluateQualityCycleSummary(qualitySummary, currentHead, evidence, missing)

    liveReport = readJsonArtifact("output/test-runner/ai-live-smoke/live-smoke-report.json", missing)
    if isinstance(liveReport, dict):
        evaluateLiveSmokeReport(liveReport, currentHead, evidence, missing)

    return {
        "id": "latest-quality-cycle-artifacts",
        "passed": not missing,
        "requirement": "Latest quality-cycle and ai-live-smoke artifacts prove the current HEAD, not a stale or text-only audit.",
        "evidence": evidence,
        "missing": missing,
    }


def evaluateQualityCycleSummary(
    payload: dict[str, Any],
    currentHead: str | None,
    evidence: list[str],
    missing: list[str],
) -> None:
    checkEqual(evidence, missing, payload.get("sequence"), "quality-cycle", "quality-cycle sequence")
    checkEqual(evidence, missing, payload.get("passed"), True, "quality-cycle passed")
    checkEqual(evidence, missing, payload.get("completedGateCount"), len(PRODUCT_QUALITY_GATES), "quality-cycle completed gate count")
    checkEqual(evidence, missing, payload.get("totalGateCount"), len(PRODUCT_QUALITY_GATES), "quality-cycle total gate count")
    checkEqual(evidence, missing, payload.get("softFailureCount"), 0, "quality-cycle soft failure count")
    checkGitHead(evidence, missing, payload.get("gitHead"), currentHead, "quality-cycle gitHead")

    gates = payload.get("gates")
    if not isinstance(gates, list):
        missing.append("quality-cycle: missing gates array")
        return

    gatesByName = {
        gate.get("gate"): gate
        for gate in gates
        if isinstance(gate, dict) and isinstance(gate.get("gate"), str)
    }
    for gateName in PRODUCT_QUALITY_GATES:
        gate = gatesByName.get(gateName)
        if not isinstance(gate, dict):
            missing.append(f"quality-cycle: missing gate {gateName}")
            continue
        checkEqual(evidence, missing, gate.get("returnCode"), 0, f"quality-cycle {gateName} returnCode")
        checkEqual(evidence, missing, gate.get("commandReturnCode"), 0, f"quality-cycle {gateName} commandReturnCode")
        checkEqual(evidence, missing, gate.get("artifactFailure"), False, f"quality-cycle {gateName} artifactFailure")

    liveGate = gatesByName.get("ai-live-smoke")
    if isinstance(liveGate, dict):
        evaluateLiveSmokeArtifactSummary(liveGate, evidence, missing)


def evaluateLiveSmokeArtifactSummary(
    liveGate: dict[str, Any],
    evidence: list[str],
    missing: list[str],
) -> None:
    artifacts = liveGate.get("artifacts")
    if not isinstance(artifacts, list):
        missing.append("quality-cycle ai-live-smoke: missing artifact summary")
        return
    artifact = next(
        (
            item
            for item in artifacts
            if isinstance(item, dict)
            and item.get("path") == "output/test-runner/ai-live-smoke/live-smoke-report.json"
        ),
        None,
    )
    if not isinstance(artifact, dict):
        missing.append("quality-cycle ai-live-smoke: live-smoke-report artifact missing")
        return
    for key, expected in (
        ("exists", True),
        ("fresh", True),
        ("payloadReadable", True),
        ("payloadPassed", True),
        ("payloadStatus", "passed"),
        ("gitHeadMatches", True),
    ):
        checkEqual(evidence, missing, artifact.get(key), expected, f"quality-cycle ai-live-smoke artifact {key}")


def evaluateLiveSmokeReport(
    payload: dict[str, Any],
    currentHead: str | None,
    evidence: list[str],
    missing: list[str],
) -> None:
    checkEqual(evidence, missing, payload.get("passed"), True, "ai-live-smoke passed")
    checkEqual(evidence, missing, payload.get("status"), "passed", "ai-live-smoke status")
    checkGitHead(evidence, missing, payload.get("gitHead"), currentHead, "ai-live-smoke gitHead")

    selection = payload.get("selection")
    if isinstance(selection, dict):
        checkEqual(evidence, missing, selection.get("credentialMissing"), False, "ai-live-smoke credentialMissing")
        requireNonEmptyString(evidence, missing, selection.get("provider"), "ai-live-smoke provider")
        requireNonEmptyString(evidence, missing, selection.get("model"), "ai-live-smoke model")
    else:
        missing.append("ai-live-smoke: missing selection")

    cases = payload.get("cases")
    if not isinstance(cases, list):
        missing.append("ai-live-smoke: missing cases array")
        return

    casesById = {
        case.get("caseId"): case
        for case in cases
        if isinstance(case, dict) and isinstance(case.get("caseId"), str)
    }
    for caseId in REQUIRED_LIVE_CASES:
        case = casesById.get(caseId)
        if not isinstance(case, dict):
            missing.append(f"ai-live-smoke: missing case {caseId}")
            continue
        checkEqual(evidence, missing, case.get("passed"), True, f"ai-live-smoke {caseId} passed")
        checkEqual(evidence, missing, case.get("status"), "passed", f"ai-live-smoke {caseId} status")

    evaluateClarificationLiveCase(casesById.get("clarification-before-provider"), evidence, missing)
    evaluateLiveToolLoopCase(casesById.get("live-tool-loop"), evidence, missing)
    evaluateLiveCellCallCase(casesById.get("live-cell-call-loop"), evidence, missing)


def evaluateClarificationLiveCase(
    case: Any,
    evidence: list[str],
    missing: list[str],
) -> None:
    if not isinstance(case, dict):
        return
    signals = case.get("signals")
    if not isinstance(signals, dict):
        missing.append("ai-live-smoke clarification-before-provider: missing signals")
        return
    providerCalled = signals.get("providerCalled")
    if providerCalled is False:
        evidence.append("ai-live-smoke clarification-before-provider providerCalled: false")
    else:
        missing.append(f"ai-live-smoke clarification-before-provider providerCalled expected false, got {providerCalled!r}")
    questionCount = signals.get("questionCount")
    if isinstance(questionCount, int) and 1 <= questionCount <= 3:
        evidence.append(f"ai-live-smoke clarification-before-provider questionCount: {questionCount}")
    else:
        missing.append(f"ai-live-smoke clarification-before-provider questionCount expected 1-3, got {questionCount!r}")


def evaluateLiveToolLoopCase(
    case: Any,
    evidence: list[str],
    missing: list[str],
) -> None:
    if not isinstance(case, dict):
        return
    signals = case.get("signals")
    if not isinstance(signals, dict):
        missing.append("ai-live-smoke live-tool-loop: missing signals")
        return
    requireToolSequencePrefix(
        evidence,
        missing,
        signals.get("toolSequence"),
        ("packages-check", "write-curriculum-yaml"),
        ("read-cells",),
        "ai-live-smoke live-tool-loop toolSequence",
    )
    checkEqual(evidence, missing, signals.get("contractGapCount"), 0, "ai-live-smoke live-tool-loop contractGapCount")
    checkEqual(evidence, missing, signals.get("yamlContractObserved"), True, "ai-live-smoke live-tool-loop yamlContractObserved")
    checkPositiveInt(evidence, missing, signals.get("sectionCount"), "ai-live-smoke live-tool-loop sectionCount")
    checkPositiveInt(evidence, missing, signals.get("exerciseCellCount"), "ai-live-smoke live-tool-loop exerciseCellCount")
    checkPositiveInt(evidence, missing, signals.get("snippetCellCount"), "ai-live-smoke live-tool-loop snippetCellCount")
    checkEqual(evidence, missing, signals.get("workloopReadable"), True, "ai-live-smoke live-tool-loop workloopReadable")


def evaluateLiveCellCallCase(
    case: Any,
    evidence: list[str],
    missing: list[str],
) -> None:
    if not isinstance(case, dict):
        return
    signals = case.get("signals")
    if not isinstance(signals, dict):
        missing.append("ai-live-smoke live-cell-call-loop: missing signals")
        return
    requireToolSequence(
        evidence,
        missing,
        signals.get("toolSequence"),
        ("packages-check", "cell-call"),
        "ai-live-smoke live-cell-call-loop toolSequence",
    )
    checkEqual(evidence, missing, signals.get("exactSequence"), True, "ai-live-smoke live-cell-call-loop exactSequence")
    checkEqual(evidence, missing, signals.get("policyViolationCount"), 0, "ai-live-smoke live-cell-call-loop policyViolationCount")
    checkEqual(evidence, missing, signals.get("workloopReadable"), True, "ai-live-smoke live-cell-call-loop workloopReadable")


def readJsonArtifact(relPath: str, missing: list[str]) -> dict[str, Any] | None:
    path = ROOT / relPath
    if not path.is_file():
        missing.append(f"{relPath}: missing artifact")
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        missing.append(f"{relPath}: unreadable JSON ({type(exc).__name__})")
        return None
    if not isinstance(payload, dict):
        missing.append(f"{relPath}: JSON root must be object")
        return None
    return payload


def currentGitHead() -> str | None:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return None
    head = result.stdout.strip()
    return head or None


def currentTrackedWorktreeChanges() -> tuple[str, ...] | None:
    result = subprocess.run(
        ("git", "status", "--short", "--untracked-files=no"),
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return None
    return tuple(line for line in result.stdout.splitlines() if line.strip())


def checkEqual(
    evidence: list[str],
    missing: list[str],
    actual: Any,
    expected: Any,
    label: str,
) -> None:
    if actual == expected:
        evidence.append(f"{label}: {expected!r}")
    else:
        missing.append(f"{label}: expected {expected!r}, got {actual!r}")


def checkGitHead(
    evidence: list[str],
    missing: list[str],
    artifactHead: Any,
    currentHead: str | None,
    label: str,
) -> None:
    if not isinstance(artifactHead, str) or not artifactHead:
        missing.append(f"{label}: missing git head")
        return
    if currentHead and gitHeadsMatch(artifactHead, currentHead):
        evidence.append(f"{label}: {artifactHead}")
    else:
        missing.append(f"{label}: expected current HEAD {currentHead!r}, got {artifactHead!r}")


def gitHeadsMatch(artifactHead: str, expectedHead: str) -> bool:
    artifact = artifactHead.strip()
    expected = expectedHead.strip()
    return bool(artifact and expected) and (artifact == expected or artifact.startswith(expected) or expected.startswith(artifact))


def requireNonEmptyString(
    evidence: list[str],
    missing: list[str],
    value: Any,
    label: str,
) -> None:
    if isinstance(value, str) and value.strip():
        evidence.append(f"{label}: {value}")
    else:
        missing.append(f"{label}: missing non-empty string")


def checkPositiveInt(
    evidence: list[str],
    missing: list[str],
    value: Any,
    label: str,
) -> None:
    if isinstance(value, int) and value > 0:
        evidence.append(f"{label}: {value}")
    else:
        missing.append(f"{label}: expected positive int, got {value!r}")


def requireToolSequence(
    evidence: list[str],
    missing: list[str],
    value: Any,
    expected: tuple[str, ...],
    label: str,
) -> None:
    if value == list(expected):
        evidence.append(f"{label}: {' -> '.join(expected)}")
    else:
        missing.append(f"{label}: expected {list(expected)!r}, got {value!r}")


def requireToolSequencePrefix(
    evidence: list[str],
    missing: list[str],
    value: Any,
    requiredPrefix: tuple[str, ...],
    allowedTrailing: tuple[str, ...],
    label: str,
) -> None:
    if not isinstance(value, list):
        missing.append(f"{label}: expected list with prefix {list(requiredPrefix)!r}, got {value!r}")
        return
    if value[:len(requiredPrefix)] != list(requiredPrefix):
        missing.append(f"{label}: expected prefix {list(requiredPrefix)!r}, got {value!r}")
        return
    trailing = value[len(requiredPrefix):]
    unexpected = [tool for tool in trailing if tool not in allowedTrailing]
    if unexpected:
        missing.append(f"{label}: unexpected trailing tools {unexpected!r}; got {value!r}")
        return
    suffix = f" (+ {' -> '.join(trailing)})" if trailing else ""
    evidence.append(f"{label}: {' -> '.join(requiredPrefix)}{suffix}")


def buildAuditPayload(results: tuple[dict[str, Any], ...]) -> dict[str, Any]:
    score = sum(1 for result in results if result["passed"])
    requirementFailures = [result["id"] for result in results if not result["passed"]]
    payload = {
        "score": score,
        "maxScore": len(results),
        "minimumScore": MINIMUM_SCORE,
        "requiredScore": len(results),
        "requirementFailures": requirementFailures,
        "passed": score >= MINIMUM_SCORE and not requirementFailures,
        "requirements": list(results),
    }
    return payload


def fileNeedleReport(relPath: str, needles: tuple[str, ...]) -> tuple[list[str], list[str]]:
    path = ROOT / relPath
    if not path.is_file():
        return [], [f"{relPath}: missing file"]
    text = path.read_text(encoding="utf-8")
    evidence: list[str] = []
    missing: list[str] = []
    for needle in needles:
        if needle in text:
            evidence.append(f"{relPath}: {needle}")
        else:
            missing.append(f"{relPath}: missing {needle}")
    return evidence, missing


def fileForbiddenNeedleReport(relPath: str, needles: tuple[str, ...]) -> tuple[list[str], list[str]]:
    path = ROOT / relPath
    if not path.is_file():
        return [], [f"{relPath}: missing file"]
    text = path.read_text(encoding="utf-8")
    evidence: list[str] = []
    failures: list[str] = []
    for needle in needles:
        if needle in text:
            failures.append(f"{relPath}: forbidden {needle}")
        else:
            evidence.append(f"{relPath}: absent forbidden {needle}")
    return evidence, failures


if __name__ == "__main__":
    raise SystemExit(main())
