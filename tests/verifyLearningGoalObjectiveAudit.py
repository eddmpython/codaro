from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MINIMUM_SCORE = 9


@dataclass(frozen=True)
class ObjectiveRequirement:
    requirementId: str
    requirement: str
    evidenceChecks: tuple[tuple[str, tuple[str, ...]], ...]

    def evaluate(self) -> dict[str, Any]:
        evidence: list[str] = []
        missing: list[str] = []
        for relPath, needles in self.evidenceChecks:
            found, absent = fileNeedleReport(relPath, needles)
            evidence.extend(found)
            missing.extend(absent)
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
                "\"assumptions\": dict(self.defaults)",
                "작업 기준:",
                "questions[:3]",
                "\"level\"",
                "\"depth\"",
                "\"environment\"",
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
                "expectedToolSequence=(\"packages-check\", \"packages-install\", \"cell-call\")",
            )),
            ("src/codaro/ai/teacher/toolPolicy.py", (
                "package-check-required",
                "dependency-preflight-required",
                "dependency-install-required",
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
            )),
            ("tests/verifyTeacherGoldenE2e.py", (
                "teacher golden e2e score",
                "\"score\": score",
                "\"minimumScore\": MINIMUM_TEACHER_EVAL_SCORE",
                "write-curriculum-yaml.sectionCount",
                "write-curriculum-yaml.exerciseCellCount",
                "uv 사전 확인",
                "검증 결과",
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
                "data-learning-flow-canvas",
                "data-learning-flow-blueprint",
                "data-learning-flow-runtime-node",
                "data-learning-flow-track",
                "uv 사전 확인",
                "검증 결과",
            )),
        ),
    ),
    ObjectiveRequirement(
        requirementId="goal-audit-gate-covers-builds-and-tests",
        requirement="The final goal audit gate ties objective audit, readiness, backend tests, and landing build together.",
        evidenceChecks=(
            ("tests/run.py", (
                "\"learning-goal-audit\"",
                "tests/verifyLearningGoalObjectiveAudit.py",
                "tests/verifyLearningSystemReadiness.py",
                "\"pytest\", \"tests/\"",
                "\"npm\", \"run\", \"build\"",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "`learning-goal-audit`",
                "명시 요구사항 audit",
                "전체 backend",
                "landing build",
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
    results = tuple(requirement.evaluate() for requirement in OBJECTIVE_REQUIREMENTS)
    score = sum(1 for result in results if result["passed"])
    payload = {
        "score": score,
        "maxScore": len(results),
        "minimumScore": MINIMUM_SCORE,
        "passed": score >= MINIMUM_SCORE,
        "requirements": list(results),
    }
    if score < MINIMUM_SCORE:
        print("FAIL: learning goal objective audit score is below threshold", file=sys.stderr)
        print(json.dumps(payload, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1

    print(f"ok: learning goal objective audit score {score}/{len(results)}")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


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


if __name__ == "__main__":
    raise SystemExit(main())
