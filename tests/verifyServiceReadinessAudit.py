from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MINIMUM_SCORE = 9
NEW_SERVICE_GATES = (
    "service-readiness-audit",
    "install-launcher-smoke",
    "runtime-recovery-contract",
    "runtime-recovery-browser",
    "curriculum-quality-matrix",
    "onboarding-browser",
    "frontend-performance-budget",
)


@dataclass(frozen=True)
class ServiceRequirement:
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


SERVICE_REQUIREMENTS = (
    ServiceRequirement(
        requirementId="service-candidate-ssot",
        requirement="Private beta/service-ready candidate criteria are documented as an ops/product SSOT.",
        evidenceChecks=(
            ("docs/skills/ops/product/service-candidate.md", (
                "service-ready candidate",
                "반복 사용 내구성",
                "설치/실행/런처",
                "Runtime 복구",
                "Provider/Teacher Loop",
                "학습 품질 Matrix",
                "온보딩/첫 화면",
                "Frontend 성능",
                "Diagnostic",
                "Gate",
            )),
            ("docs/skills/ops/README.md", ("service-candidate", "private beta")),
            ("docs/skills/README.md", ("service-candidate", "Ops (12)")),
            ("docs/skills/architecture/ssot-map.md", ("service candidate", "docs/skills/ops/product/service-candidate.md")),
        ),
    ),
    ServiceRequirement(
        requirementId="service-gates-are-named",
        requirement="The service candidate gate names are wired into the local runner and docs.",
        evidenceChecks=(
            ("tests/run.py", tuple(f"\"{gateName}\"" for gateName in NEW_SERVICE_GATES)),
            ("docs/skills/ops/foundation/testing-and-gates.md", tuple(f"`{gateName}`" for gateName in NEW_SERVICE_GATES)),
            ("tests/testRunEntrypoint.py", tuple(f"\"{gateName}\"" for gateName in NEW_SERVICE_GATES)),
        ),
    ),
    ServiceRequirement(
        requirementId="runtime-recovery-contract",
        requirement="Runtime recovery gate covers worker crash, package preflight, cell-call, and user-readable errors.",
        evidenceChecks=(
            ("tests/verifyRuntimeRecoveryContract.py", (
                "Engine worker crashed and was restarted.",
                "testLocalEngineWorkerCrashMessageSaysRestarted",
                "packages-check",
                "packages-install",
                "cell-call",
                "라이브러리 준비 실패",
            )),
            ("tests/run.py", ("tests/verifyRuntimeRecoveryContract.py", "tests/verifyEditorRuntimePreflight.py", "tests/testRuntime.py")),
        ),
    ),
    ServiceRequirement(
        requirementId="launcher-install-smoke",
        requirement="Launcher/install smoke checks doctor diagnostics, health timeout, rollback, and packaging SSOT.",
        evidenceChecks=(
            ("tests/verifyInstallLauncherSmoke.py", (
                "Command::Doctor",
                "HEALTH_TIMEOUT",
                "last-known-good-release.json",
                "rollback-marker.json",
                "exact wheel",
                "private beta",
            )),
            ("tests/run.py", ("tests/verifyInstallLauncherSmoke.py", "cargo", "check")),
        ),
    ),
    ServiceRequirement(
        requirementId="curriculum-quality-matrix",
        requirement="Representative learning topics are materialized through the structured YAML contract.",
        evidenceChecks=(
            ("tests/verifyCurriculumQualityMatrix.py", (
                "python-basics",
                "file-handling",
                "data-analysis",
                "visualization",
                "web-automation",
                "sectionContract:exercise",
                "contractGapCount",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "Python 기초",
                "파일 처리",
                "데이터 분석",
                "시각화",
                "웹 자동화",
            )),
        ),
    ),
    ServiceRequirement(
        requirementId="onboarding-browser-flow",
        requirement="Onboarding browser gate verifies first screen fallback and provider-ready status in the product surface.",
        evidenceChecks=(
            ("tests/verifyOnboardingPlaywright.py", (
                "Codaro로 무엇을 만들까요?",
                "Provider 연결",
                "기본 안내 모드",
                "provider 연결됨",
                "Pandas 레슨",
            )),
            ("tests/run.py", ("tests/verifyOnboardingPlaywright.py", "\"onboarding-browser\"")),
        ),
    ),
    ServiceRequirement(
        requirementId="runtime-recovery-browser-flow",
        requirement="Runtime recovery browser gate verifies user-facing failure/retry copy near the learning surface.",
        evidenceChecks=(
            ("tests/verifyRuntimeRecoveryPlaywright.py", (
                "라이브러리 준비 실패",
                "셀 실행 실패",
                "셀을 실행하면 결과와 오류가 여기에 표시됩니다.",
                "packages-check",
                "packages-install",
            )),
            ("tests/run.py", ("tests/verifyRuntimeRecoveryPlaywright.py", "\"runtime-recovery-browser\"")),
        ),
    ),
    ServiceRequirement(
        requirementId="frontend-performance-budget",
        requirement="Editor bundle splitting and asset budgets are enforced after build.",
        evidenceChecks=(
            ("editor/vite.config.ts", ("manualChunks", "@codemirror", "react-dom", "vendor")),
            ("tests/verifyFrontendPerformanceBudget.py", (
                "MIN_JS_CHUNKS",
                "MAX_SINGLE_JS_BYTES",
                "MAX_TOTAL_JS_BYTES",
                "REQUIRED_CHUNK_LABELS",
            )),
            ("tests/run.py", ("tests/verifyFrontendPerformanceBudget.py", "\"frontend-performance-budget\"")),
        ),
    ),
    ServiceRequirement(
        requirementId="no-secret-diagnostics",
        requirement="Service candidate diagnostics keep secrets out of logs and outputs.",
        evidenceChecks=(
            ("docs/skills/ops/product/service-candidate.md", (
                "token/API key/secret은 diagnostic summary와 로그에 남기지 않는다",
                "raw JSON은 확장 진단",
            )),
            ("docs/skills/architecture/live-provider-ops.md", (
                "실제 token과 API key는 저장소에 남기지 않는다",
                "raw detail은 기본 UI에 노출하지 않는다",
            )),
        ),
    ),
)


def main() -> int:
    results = tuple(requirement.evaluate() for requirement in SERVICE_REQUIREMENTS)
    payload = buildAuditPayload(results)
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if payload["requirementFailures"]:
        print("FAIL: service readiness audit requirements are incomplete", file=sys.stderr)
        return 1
    print(f"ok: service readiness audit score {payload['score']}/{payload['maxScore']}")
    return 0


def buildAuditPayload(results: tuple[dict[str, Any], ...]) -> dict[str, Any]:
    passed = sum(1 for result in results if result["passed"])
    maxScore = len(results)
    score = round((passed / maxScore) * 10, 2) if maxScore else 0
    requirementFailures = [result for result in results if not result["passed"]]
    if score < MINIMUM_SCORE and not requirementFailures:
        requirementFailures.append({
            "id": "minimum-score",
            "passed": False,
            "requirement": f"service readiness audit score must be at least {MINIMUM_SCORE}",
            "evidence": [],
            "missing": [f"score {score} < {MINIMUM_SCORE}"],
        })
    return {
        "gate": "service-readiness-audit",
        "score": score,
        "maxScore": 10,
        "minimumScore": MINIMUM_SCORE,
        "requiredScore": MINIMUM_SCORE,
        "passed": not requirementFailures,
        "requirements": results,
        "requirementFailures": requirementFailures,
    }


def fileNeedleReport(relPath: str, needles: tuple[str, ...]) -> tuple[list[str], list[str]]:
    path = ROOT / relPath
    if not path.exists():
        return [], [f"{relPath}: missing file"]
    text = path.read_text(encoding="utf-8")
    found = [f"{relPath}: {needle}" for needle in needles if needle in text]
    absent = [f"{relPath}: missing {needle}" for needle in needles if needle not in text]
    return found, absent


def fileForbiddenNeedleReport(relPath: str, needles: tuple[str, ...]) -> tuple[list[str], list[str]]:
    path = ROOT / relPath
    if not path.exists():
        return [], [f"{relPath}: missing file"]
    text = path.read_text(encoding="utf-8")
    absent = [f"{relPath}: forbidden {needle} absent" for needle in needles if needle not in text]
    present = [f"{relPath}: forbidden token remains {needle}" for needle in needles if needle in text]
    return absent, present


if __name__ == "__main__":
    raise SystemExit(main())
