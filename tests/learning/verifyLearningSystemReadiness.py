from __future__ import annotations

import json
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from codaro.ai.teacher import goldenEvalCases


ROOT = Path(__file__).resolve().parents[2]
MINIMUM_SCORE = 9


@dataclass(frozen=True)
class ReadinessCriterion:
    criterionId: str
    requirement: str
    evidence: tuple[str, ...]
    missing: tuple[str, ...]
    blocking: bool = False

    @property
    def passed(self) -> bool:
        return not self.missing

    def payload(self) -> dict[str, Any]:
        return {
            "id": self.criterionId,
            "passed": self.passed,
            "requirement": self.requirement,
            "evidence": list(self.evidence),
            "missing": list(self.missing),
            "blocking": self.blocking,
        }


def main() -> int:
    liveChecks = runLiveGateChecks()
    criteria = readinessCriteria(liveChecks)
    score = sum(1 for criterion in criteria if criterion.passed)
    blockingFailures = [criterion.criterionId for criterion in criteria if criterion.blocking and not criterion.passed]
    payload = {
        "score": score,
        "maxScore": len(criteria),
        "minimumScore": MINIMUM_SCORE,
        "passed": score >= MINIMUM_SCORE and not blockingFailures,
        "blockingFailures": blockingFailures,
        "criteria": [criterion.payload() for criterion in criteria],
    }

    if score < MINIMUM_SCORE or blockingFailures:
        print("FAIL: learning system readiness score is below threshold or blocking checks failed", file=sys.stderr)
        print(json.dumps(payload, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1

    print(f"ok: learning system readiness score {score}/{len(criteria)}")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


@dataclass(frozen=True)
class LiveGateCheck:
    name: str
    returnCode: int
    output: str

    @property
    def passed(self) -> bool:
        return self.returnCode == 0


LIVE_GATE_NAMES = (
    "teacher-eval",
    "teacher-e2e",
    "assistant-workloop-contract",
    "editor-runtime-preflight",
    "learning-card-contract",
    "learning-card-browser",
)


def readinessCriteria(liveChecks: dict[str, LiveGateCheck]) -> tuple[ReadinessCriterion, ...]:
    casesById = {case.caseId: case for case in goldenEvalCases}
    return (
        fileCriterion(
            "learning-yaml-contract-ssot",
            "Structured learning YAML contract is documented as the lesson SSOT.",
            (
                ("docs/skills/architecture/learning-yaml-contract.md", (
                    "meta:",
                    "intro:",
                    "sections:",
                    "title → subtitle → goal → why → explanation → tips → snippet → exercise → result → check",
                    "sectionContract:*",
                    "contractGapCount: 0",
                )),
            ),
        ),
        fileCriterion(
            "teacher-prompt-contract-alignment",
            "Teacher prompts, frontend context, and legacy practice tools steer learning through goal discovery before structured section-card YAML.",
            (
                ("src/codaro/ai/conversation.py", (
                    "intro(direction,benefits,diagram.steps,diagram.runtime)",
                    "Each new concept lives in one YAML section card",
                    "legacy or targeted practice helpers",
                    "call resolve-learning-goal to map the goal to domains",
                    "search-curricula to find lessons that already cover it",
                    "compose-master-plan to assemble an ordered learning path",
                    "Only call write-curriculum-yaml to author a new lesson when no existing lesson covers the goal",
                )),
                ("editor/src/lib/assistantContext.ts", (
                    "For learning requests, first call resolve-learning-goal",
                    "then search-curricula",
                    "then compose-master-plan",
                    "Only call write-curriculum-yaml when compose-master-plan shows a real gap",
                )),
                ("src/codaro/curriculum/learningSpec.py", (
                    "sections(title,subtitle,goal,why,explanation,tips,snippet,exercise,check)",
                    "Treat each section as one learning card",
                    "not several small blocks",
                    "packages-check",
                    "packages-install",
                )),
                ("src/codaro/ai/toolDefinitions/learning.py", (
                    "legacy targeted concept drill",
                    "Prefer write-curriculum-yaml",
                    "structured section-card lessons",
                )),
                ("docs/skills/architecture/teacher-tool-loop.md", (
                    "`create-guide`, `create-learning-card`, `create-quiz`, `create-notebook-exercise`",
                    "신규 전체 레슨은 이 도구들로 작은 카드 묶음을 만들지 않고 `write-curriculum-yaml`을 쓴다",
                )),
                ("docs/skills/identity/ai-integration.md", (
                    "`write-curriculum-yaml`: structured YAML을 섹션 카드와 실행 셀로 전개",
                    "`packages-check`, `packages-install`: 실행 전 라이브러리 확인과 uv 설치",
                    "`sections[].blocks[]`는 기존 curriculum 변환용이다",
                )),
                ("tests/teacher/testTeacherArchitecture.py", (
                    "testLearningSpecInstructionsPromoteStructuredSectionYaml",
                    "create-learning-card: explanation + fill-blank card",
                    "sections, and blocks",
                )),
                ("tests/teacher/testAiTools.py", (
                    "test_legacy_learning_card_tool_does_not_compete_with_section_card_lessons",
                )),
            ),
        ),
        fileCriterion(
            "section-card-render-contract",
            "Section learning cards render as one structured card with stable marker parts.",
            (
                ("editor/src/components/curriculum/curriculumSurface.tsx", (
                    "data-learning-section-card",
                    "data-learning-section-structured",
                    "data-learning-section-part",
                    "data-learning-section-index",
                    "data-learning-section-heading",
                    "data-learning-toc=\"push\"",
                    "data-learning-exercise-input",
                    "data-learning-exercise-input-role",
                    "data-learning-code-input",
                    "data-learning-code-input-role",
                    "sectionContract:snippet",
                    "sectionContract:exercise",
                    "function SectionNarrative",
                    "function StructuredSectionLearningBody",
                )),
                ("editor/src/components/curriculum/curriculumDependencyPanel.tsx", (
                    "data-learning-package-command-row",
                    "data-learning-package-terminal-open",
                    "data-learning-package-status",
                    "data-learning-package-item",
                )),
                ("editor/src/components/curriculum/curriculumMarkdownBody.tsx", (
                    "function SectionLead",
                    "function ProseLearningCell",
                    "function PracticePromptCell",
                    "function MarkdownBlock",
                )),
                ("editor/src/components/app/appPrimitives.tsx", (
                    "data-code-payload=\"snippet\"",
                    "data-code-payload-copy=\"true\"",
                    "system.copySnippet",
                    "common.copy",
                )),
                ("editor/src/lib/localeCopy.ts", (
                    "스니펫 복사",
                    "복사",
                )),
                ("editor/src/components/app/cellAiActions.tsx", (
                    "data-cell-ai-popover",
                    "data-cell-ai-question",
                    "data-cell-ai-answer",
                    "data-cell-ai-help-trigger=\"always-visible\"",
                    "이 셀에서 바로 질문",
                    "이 셀 답변",
                    "onAsk(action, question)",
                )),
                ("editor/src/components/assistant/assistantPanel.tsx", (
                    "Codaro AI",
                    "/brand/avatar-small.png",
                )),
                ("tests/learning/verifyLearningSectionCardContract.py", (
                    "data-learning-section-card",
                    "data-learning-section-part",
                    "data-cell-ai-popover",
                    "data-cell-ai-help-trigger",
                    "data-learning-toc",
                    "data-learning-code-input",
                    "data-learning-exercise-input-role",
                    "data-code-payload-copy",
                    "data-learning-cell",
                    "overview",
                    "snippet",
                    "exercise",
                    "result",
                    "check",
                    "structured exercise direct editor",
                )),
            ),
        ),
        fileCriterion(
            "inline-help-and-codaro-identity-surface",
            "Cell help stays local to the cell and Codaro identity avoids robot/bot framing.",
            (
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
                ("tests/learning/verifyLearningSectionCardContract.py", (
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
        fileCriterion(
            "lesson-overview-browser-contract",
            "Lesson overview title, direction, and learn list flow directly into the lesson in desktop and mobile browser rendering.",
            (
                ("editor/src/components/curriculum/curriculumSurface.tsx", (
                    "data-learning-overview",
                    "data-learning-overview-part=\"learn-list\"",
                    "오늘 배우는 것",
                    "SectionNarrative",
                )),
                ("tests/learning/verifyLearningCardPlaywright.py", (
                    "yamlToDocument",
                    "materializedStructuredLessonDocument",
                    "assertMaterializedContract",
                    "jsAssertLearningOverview",
                    "jsAssertLearningVisualIntegrity",
                    "data-learning-overview-part=\"learn-list\"",
                    "오늘 배우는 것",
                    "jsAssertContractGapSignalHidden",
                    "부분 구조화 섹션",
                    "contractGapSignal",
                    "jsAssertTocPushRail",
                    "desktopOverview",
                    "mobileOverview",
                    "directEditor",
                    "data-cell-ai-popover",
                    "visibleBands",
                    "visualIntegrity",
                )),
                ("tests/playwrightCli.py", (
                    "isPlaywrightEvalError",
                    "PlaywrightCliError",
                    "repoLocalPlaywrightWorkspace",
                )),
            ),
        ),
        goldenCaseCriterion(
            "clarification-gate-golden",
            "Ambiguous learning requests stop at deterministic clarification with no provider call and 1-3 questions.",
            casesById,
            "ambiguous-learning-asks-clarification",
            (
                ("expectedNoTools", True),
                ("expectedClarificationGate", True),
                ("expectedClarificationQuestionRange", (1, 3)),
            ),
            (
                ("tests/teacher/verifyTeacherGoldenE2e.py", (
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
                ("src/codaro/ai/teacher/clarificationPolicy.py", (
                    "assumptions: dict[str, str]",
                    "\"assumptions\": dict(self.assumptions)",
                    "작업 기준:",
                    "questions[:3]",
                    "\"level\"",
                    "\"depth\"",
                    "\"environment\"",
                    "\"balance\"",
                )),
                ("src/codaro/ai/teacher/evalHarness.py", (
                    "expectedClarificationAssumptionKeys",
                    "missing clarification assumptions payload",
                    "missing clarification assumptions",
                    "작업 기준",
                )),
                ("src/codaro/ai/conversation.py", (
                    "clarification assumptions recorded in the workloop",
                )),
                ("src/codaro/ai/conversation.py", (
                    "pendingClarification",
                    "setPendingClarification",
                    "consumePendingClarification",
                )),
                ("src/codaro/ai/teacher/turnRuntime.py", (
                    "consumePendingClarification",
                    "shouldApplyPendingClarification",
                    "STALE_CLARIFICATION_RESET_MARKERS",
                    "NEW_LEARNING_REQUEST_MARKERS",
                    "contextMap[\"clarificationPlan\"] = pendingClarification",
                )),
            ),
        ),
        goldenCaseCriterion(
            "dependency-preflight-policy",
            "Runtime execution requires packages-check, uv install when missing, then cell-call in exact order.",
            casesById,
            "dependency-preflight-before-install",
            (
                ("expectedToolSequence", ("packages-check", "packages-install", "cell-call")),
            ),
            (
                ("src/codaro/ai/teacher/toolPolicy.py", (
                    "package-check-required",
                    "dependency-preflight-required",
                    "dependency-install-required",
                    "toolRequiresDependencyPreflight",
                )),
                ("src/codaro/ai/teacher/evalHarness.py", (
                    "dependency-preflight-failure-blocks-cell-call",
                    "allowPolicyViolations=True",
                    "(\"cell-call\", \"policyCode\")",
                )),
                ("tests/teacher/verifyTeacherGoldenE2e.py", (
                    "observedCalls != [\"packages-check\", \"packages-install\", \"cell-call\"]",
                    "failed preflight should block executor cell-call",
                    "provider did not receive dependency-preflight policy result",
                    "failed packages-check did not expose readable workloop error",
                    "\"packages-install\": {",
                    "\"installer\": \"uv\"",
                    "\"cell-call\": {\"passed\": True",
                )),
            ),
        ),
        fileCriterion(
            "uv-package-ops",
            "Package installation uses project .venv and uv metadata instead of direct pip.",
            (
                ("src/codaro/system/packageOps.py", (
                    "installer: str = \"uv\"",
                    "environment: str = \"project .venv\"",
                    "runUvPip(\"install\"",
                    "packageEnvironment = getPackageEnvironment()",
                    "if not packageEnvironment.uvPath:",
                    "[packageEnvironment.uvPath, \"pip\", command, \"--python\", str(pythonPath), *arguments]",
                    "durationMs",
                    "skipped",
                )),
                ("docs/skills/ops/foundation/environment.md", (
                    "packages-check",
                    "packages-install",
                    "installer: uv",
                    "project .venv",
                )),
            ),
        ),
        fileCriterion(
            "editor-runtime-preflight",
            "Editor direct run paths check session packages, install missing packages with uv, then execute cells.",
            (
                ("editor/src/lib/notebookRuntime.ts", (
                    "preflightRuntimePackages",
                    "sessionPackagesList",
                    "sessionPackageInstall",
                    "executeCode",
                    "executeReactive",
                    "runtime.uvPrepared",
                )),
                ("editor/src/lib/localeCopy.ts", (
                    "uv로 준비한 뒤 실행했습니다",
                    "라이브러리 준비 실패",
                )),
                ("editor/src/lib/packageInference.ts", (
                    "inferCodePackages",
                    "inferDocumentPackages",
                    "inferAssistantPackages",
                    "normalizePackageName",
                )),
                ("tests/runtime/verifyEditorRuntimePreflight.py", (
                    "packages-check",
                    "packages-install",
                    "cell-call",
                    "cell-call-reactive",
                    "라이브러리 준비 실패",
                )),
            ),
            liveChecks=(liveChecks["editor-runtime-preflight"],),
            blocking=True,
        ),
        goldenCaseCriterion(
            "provider-error-workloop",
            "Provider failures are returned as trace/workloop rows that the user can read.",
            casesById,
            "provider-error-promotes-workloop",
            (
                ("expectedNoTools", True),
                ("expectedTraceEvents", ("turn-error",)),
                ("expectedWorkLabels", ("provider 오류",)),
            ),
            (
                ("src/codaro/ai/teacher/providerLoop.py", (
                    "finishTeacherTurnErrorPayload",
                    "trace.record(\"turn-error\"",
                    "provider 응답 중 오류가 발생했습니다",
                )),
                ("src/codaro/ai/teacher/providerStream.py", (
                    "provider stream tool loop failed",
                    "providerStreamErrorEvent",
                )),
                ("src/codaro/ai/teacher/traceModel.py", (
                    "provider 오류",
                    "provider 응답 처리 중단",
                    "provider-loop",
                )),
                ("tests/teacher/testTeacherArchitecture.py", (
                    "testProviderStreamReportsToolLoopProviderErrorsInTrace",
                    "provider broken after tool",
                )),
                ("tests/teacher/verifyTeacherGoldenE2e.py", (
                    "runProviderErrorCase",
                    "provider-error-promotes-workloop",
                )),
            ),
        ),
        fileCriterion(
            "frontend-workloop-boundary",
            "Frontend workloop promotes trace-only clarification and turn-error events while preserving user-readable detail.",
            (
                ("editor/src/lib/workLoop.ts", (
                    "normalizeAssistantTrace",
                    "withTraceWorkloopSteps",
                    "traceWorkloopDetail",
                    "toolResultDetail",
                    "sectionCount",
                    "exerciseCellCount",
                    "contractGapCount",
                    "shouldPromoteTraceWorkloopEvent",
                    "clarification-gate",
                    "turn-error",
                    "tool-start",
                    "tool-result",
                    "durationMs",
                    "skipped",
                )),
                ("editor/src/components/assistant/assistantPanel.tsx", (
                    "AssistantTraceDetails",
                    "trace.workloop",
                    "traceWorkloopRowDetail",
                    "raw trace",
                )),
                ("tests/teacher/verifyAssistantWorkloopContract.py", (
                    "finishAssistantWorkLoop",
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
            ),
            liveChecks=(liveChecks["assistant-workloop-contract"],),
            blocking=True,
        ),
        goldenCaseCriterion(
            "curriculum-materialization-golden",
            "Golden provider run uses the real curriculum YAML handler and preserves structured section cards in the editor document.",
            casesById,
            "curriculum-yaml-materialized",
            (
                ("expectedYamlContract", True),
                ("expectedSectionCardFlow", True),
                ("expectedLoadedInEditor", True),
                ("expectedRuntimePackages", ("pandas",)),
                ("expectedDiagramRuntimeDetails", ("pandas 환경", "DataFrame 완료")),
            ),
            (
                ("tests/teacher/verifyTeacherGoldenE2e.py", (
                    "ToolExecutor(NoSessionManager(), documentGetter=getDocument, documentSetter=setDocument)",
                    "structuredLessonYaml",
                    "sectionContract:exercise",
                    "sectionCount",
                    "exerciseCellCount",
                    "contractGapCount",
                    "pandas 환경",
                    "DataFrame 완료",
                    "provider received curriculum tool result with contract gaps",
                    "activeDocument.runtime.packages != [\"pandas\"]",
                )),
                ("src/codaro/ai/teacher/evalHarness.py", (
                    "_hasStructuredSectionCardFlow",
                    "expectedNoContractGaps",
                    "_contractGapFailures",
                    "_hasLoadedCurriculumDocument",
                    "_missingRuntimePackages",
                    "_missingDiagramRuntimeDetails",
                    "(\"write-curriculum-yaml\", \"sectionCount\")",
                    "(\"write-curriculum-yaml\", \"exerciseCellCount\")",
                    "(\"write-curriculum-yaml\", \"contractGapCount\")",
                )),
            ),
        ),
        fileCriterion(
            "ops-gates-and-ssot",
            "Operational docs, named gates, and live targeted gates expose the required verification surface.",
            (
                ("tests/run.py", (
                    "\"teacher-eval\"",
                    "\"teacher-e2e\"",
                    "\"assistant-workloop-contract\"",
                    "\"editor-runtime-preflight\"",
                    "\"learning-card-contract\"",
                    "\"learning-card-browser\"",
                    "\"learning-system-readiness\"",
                )),
                ("docs/skills/ops/foundation/testing-and-gates.md", (
                    "`teacher-eval`",
                    "`teacher-e2e`",
                    "`assistant-workloop-contract`",
                    "`editor-runtime-preflight`",
                    "`learning-card-contract`",
                    "`learning-card-browser`",
                    "`learning-system-readiness`",
                )),
                ("docs/skills/architecture/ssot-map.md", (
                    "teacher/provider loop",
                    "eval harness",
                    "workloop state",
                    "learning YAML contract",
                )),
            ),
            liveChecks=tuple(liveChecks[name] for name in LIVE_GATE_NAMES),
            blocking=True,
        ),
        fileCriterion(
            "teacher-eval-score-contract",
            "Teacher/provider evaluation harness exposes an objective score and 9.0 minimum threshold.",
            (
                ("src/codaro/ai/teacher/evalHarness.py", (
                    "MINIMUM_TEACHER_EVAL_SCORE = 9.0",
                    "MAXIMUM_TEACHER_EVAL_SCORE = 10.0",
                    "scoreTeacherEvalReports",
                    "\"score\": self.score",
                    "\"maxScore\": MAXIMUM_TEACHER_EVAL_SCORE",
                    "\"minimumScore\": MINIMUM_TEACHER_EVAL_SCORE",
                )),
                ("src/codaro/ai/teacher/providerLoop.py", (
                    "serializeToolResultForProvider",
                    "provider-tool-result-max-chars",
                    "PROVIDER_TOOL_RESULT_SIGNAL_KEYS",
                )),
                ("tests/teacher/testTeacherArchitecture.py", (
                    "testProviderLoopBoundsLargeToolResultMessages",
                    "roundResult.toolResults[0][\"result\"]",
                    "\"truncatedReason\"",
                )),
                ("tests/teacher/verifyTeacherGoldenE2e.py", (
                    "teacher golden e2e score",
                    "\"score\": score",
                    "\"maxScore\": MAXIMUM_TEACHER_EVAL_SCORE",
                    "\"minimumScore\": MINIMUM_TEACHER_EVAL_SCORE",
                    "messagesByCall",
                    "providerCallToolResultPayload",
                    "provider did not receive tool result",
                )),
                ("docs/skills/architecture/teacher-tool-loop.md", (
                    "`score`, `maxScore`, `minimumScore`",
                    "`minimumScore: 9.0`",
                    "teacher golden e2e score",
                    "role: tool",
                )),
                ("docs/skills/ops/foundation/testing-and-gates.md", (
                    "`score`, `maxScore`, `minimumScore`",
                    "`minimumScore`는 9.0",
                    "teacher golden e2e score",
                    "provider가 tool result를 보지 못하면 실패",
                )),
            ),
            liveChecks=(liveChecks["teacher-eval"], liveChecks["teacher-e2e"]),
            blocking=True,
        ),
    )


def runLiveGateChecks() -> dict[str, LiveGateCheck]:
    return {name: runGateCheck(name) for name in LIVE_GATE_NAMES}


def runGateCheck(name: str) -> LiveGateCheck:
    result = subprocess.run(
        [sys.executable, "-X", "utf8", str(ROOT / "tests" / "run.py"), "gate", name],
        capture_output=True,
        text=True,
        cwd=ROOT,
        check=False,
    )
    output = (result.stdout + "\n" + result.stderr).strip()
    return LiveGateCheck(name=name, returnCode=result.returncode, output=output)


def fileCriterion(
    criterionId: str,
    requirement: str,
    fileChecks: tuple[tuple[str, tuple[str, ...]], ...],
    *,
    forbiddenChecks: tuple[tuple[str, tuple[str, ...]], ...] = (),
    liveChecks: tuple[LiveGateCheck, ...] = (),
    blocking: bool = False,
) -> ReadinessCriterion:
    evidence: list[str] = []
    missing: list[str] = []
    for relPath, needles in fileChecks:
        found, absent = fileNeedleReport(relPath, needles)
        evidence.extend(found)
        missing.extend(absent)
    for relPath, needles in forbiddenChecks:
        absent, present = fileForbiddenNeedleReport(relPath, needles)
        evidence.extend(absent)
        missing.extend(present)
    for check in liveChecks:
        if check.passed:
            evidence.append(f"gate {check.name}: passed")
        else:
            missing.append(f"gate {check.name}: failed with exit {check.returnCode}\n{check.output}")
    return ReadinessCriterion(
        criterionId=criterionId,
        requirement=requirement,
        evidence=tuple(evidence),
        missing=tuple(missing),
        blocking=blocking,
    )


def goldenCaseCriterion(
    criterionId: str,
    requirement: str,
    casesById: dict[str, Any],
    caseId: str,
    expectedAttrs: tuple[tuple[str, Any], ...],
    fileChecks: tuple[tuple[str, tuple[str, ...]], ...],
) -> ReadinessCriterion:
    base = fileCriterion(criterionId, requirement, fileChecks)
    evidence = list(base.evidence)
    missing = list(base.missing)
    case = casesById.get(caseId)
    if case is None:
        missing.append(f"src/codaro/ai/teacher/evalHarness.py: missing golden case {caseId}")
    else:
        evidence.append(f"src/codaro/ai/teacher/evalHarness.py: golden case {caseId}")
        for attrName, expectedValue in expectedAttrs:
            actualValue = getattr(case, attrName)
            if actualValue == expectedValue:
                evidence.append(f"{caseId}.{attrName}={expectedValue!r}")
            else:
                missing.append(f"{caseId}.{attrName}: expected {expectedValue!r}, observed {actualValue!r}")
    return ReadinessCriterion(
        criterionId=criterionId,
        requirement=requirement,
        evidence=tuple(evidence),
        missing=tuple(missing),
    )


def fileNeedleReport(relPath: str, needles: tuple[str, ...]) -> tuple[list[str], list[str]]:
    path = ROOT / relPath
    if not path.is_file():
        return [], [f"{relPath}: missing file"]
    text = path.read_text(encoding="utf-8")
    found = []
    missing = []
    for needle in needles:
        if needle in text:
            found.append(f"{relPath}: {needle}")
        else:
            missing.append(f"{relPath}: missing {needle}")
    return found, missing


def fileForbiddenNeedleReport(relPath: str, needles: tuple[str, ...]) -> tuple[list[str], list[str]]:
    path = ROOT / relPath
    if not path.is_file():
        return [], [f"{relPath}: missing file"]
    text = path.read_text(encoding="utf-8")
    absent = []
    present = []
    for needle in needles:
        if needle in text:
            present.append(f"{relPath}: forbidden {needle}")
        else:
            absent.append(f"{relPath}: absent forbidden {needle}")
    return absent, present


if __name__ == "__main__":
    raise SystemExit(main())
