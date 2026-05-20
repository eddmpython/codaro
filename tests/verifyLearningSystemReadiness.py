from __future__ import annotations

import json
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from codaro.ai.teacher import goldenEvalCases


ROOT = Path(__file__).resolve().parents[1]
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
    "teacher-e2e",
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
                    "sectionContract:snippet",
                    "sectionContract:exercise",
                )),
                ("tests/verifyLearningSectionCardContract.py", (
                    "data-learning-section-card",
                    "data-learning-section-part",
                    "overview",
                    "snippet",
                    "exercise",
                    "result",
                    "check",
                )),
            ),
        ),
        fileCriterion(
            "lesson-overview-browser-contract",
            "Lesson overview direction, benefit, and flow diagram are verified in desktop and mobile browser rendering.",
            (
                ("editor/src/components/curriculum/curriculumSurface.tsx", (
                    "data-learning-overview",
                    "data-learning-flow-diagram",
                    "data-learning-flow-step",
                )),
                ("tests/verifyLearningCardPlaywright.py", (
                    "jsAssertLearningOverview",
                    "desktopOverview",
                    "mobileOverview",
                    "overview content overlaps",
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
                ("tests/verifyTeacherGoldenE2e.py", (
                    "ProviderShouldNotBeCalled",
                    "runClarificationCase",
                    "clarification gate called provider",
                )),
                ("src/codaro/ai/teacher/clarificationPolicy.py", (
                    "questions[:3]",
                    "\"level\"",
                    "\"depth\"",
                    "\"environment\"",
                    "\"balance\"",
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
                ("tests/verifyTeacherGoldenE2e.py", (
                    "observedCalls != [\"packages-check\", \"packages-install\", \"cell-call\"]",
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
                    "[\"uv\", \"pip\", command, \"--python\", str(pythonPath), *arguments]",
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
                ("src/codaro/ai/teacher/traceModel.py", (
                    "provider 오류",
                    "provider 응답 처리 중단",
                    "provider-loop",
                )),
                ("tests/verifyTeacherGoldenE2e.py", (
                    "runProviderErrorCase",
                    "provider-error-promotes-workloop",
                )),
            ),
        ),
        fileCriterion(
            "frontend-workloop-boundary",
            "Frontend workloop promotes trace-only clarification and turn-error events without mixing runtime state.",
            (
                ("editor/src/lib/workLoop.ts", (
                    "normalizeAssistantTrace",
                    "withTraceWorkloopSteps",
                    "shouldPromoteTraceWorkloopEvent",
                    "clarification-gate",
                    "turn-error",
                    "tool-start",
                    "tool-result",
                )),
                ("editor/src/components/assistant/assistantPanel.tsx", (
                    "AssistantTraceDetails",
                    "trace.workloop",
                    "raw trace",
                )),
            ),
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
            ),
            (
                ("tests/verifyTeacherGoldenE2e.py", (
                    "ToolExecutor(NoSessionManager(), documentGetter=getDocument, documentSetter=setDocument)",
                    "structuredLessonYaml",
                    "sectionContract:exercise",
                    "activeDocument.runtime.packages != [\"pandas\"]",
                )),
                ("src/codaro/ai/teacher/evalHarness.py", (
                    "_hasStructuredSectionCardFlow",
                    "_hasLoadedCurriculumDocument",
                    "_missingRuntimePackages",
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
                    "\"learning-card-contract\"",
                    "\"learning-card-browser\"",
                    "\"learning-system-readiness\"",
                )),
                ("docs/skills/ops/foundation/testing-and-gates.md", (
                    "`teacher-eval`",
                    "`teacher-e2e`",
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
    liveChecks: tuple[LiveGateCheck, ...] = (),
    blocking: bool = False,
) -> ReadinessCriterion:
    evidence: list[str] = []
    missing: list[str] = []
    for relPath, needles in fileChecks:
        found, absent = fileNeedleReport(relPath, needles)
        evidence.extend(found)
        missing.extend(absent)
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


if __name__ == "__main__":
    raise SystemExit(main())
