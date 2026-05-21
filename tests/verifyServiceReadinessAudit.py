from __future__ import annotations

import json
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


@dataclass(frozen=True)
class ProductQualityRequirement:
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


PRODUCT_QUALITY_REQUIREMENTS = (
    ProductQualityRequirement(
        requirementId="product-quality-ssot",
        requirement="Product quality criteria are documented as an ops/product SSOT.",
        evidenceChecks=(
            ("docs/skills/ops/product/service-candidate.md", (
                "잘 만들어진 로컬 제품",
                "quality-cycle",
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
            ("docs/skills/ops/README.md", ("service-candidate", "잘 만들어진 로컬 제품")),
            ("docs/skills/README.md", ("service-candidate", "Ops (12)")),
            ("docs/skills/architecture/ssot-map.md", ("product quality", "docs/skills/ops/product/service-candidate.md")),
        ),
    ),
    ProductQualityRequirement(
        requirementId="product-quality-gates-are-named",
        requirement="The product quality gate sequence is wired into the local runner and docs.",
        evidenceChecks=(
            ("tests/run.py", (*tuple(f"\"{gateName}\"" for gateName in PRODUCT_QUALITY_GATES), "PRODUCT_QUALITY_GATES", "\"quality-cycle\"")),
            ("docs/skills/ops/foundation/testing-and-gates.md", (*tuple(f"`{gateName}`" for gateName in PRODUCT_QUALITY_GATES), "`quality-cycle`")),
            ("docs/skills/ops/product/service-candidate.md", ("잘 만들어진 로컬 제품", "tests/run.py quality-cycle")),
            ("tests/testRunEntrypoint.py", (*tuple(f"\"{gateName}\"" for gateName in PRODUCT_QUALITY_GATES), "PRODUCT_QUALITY_GATES")),
        ),
    ),
    ProductQualityRequirement(
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
    ProductQualityRequirement(
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
    ProductQualityRequirement(
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
    ProductQualityRequirement(
        requirementId="onboarding-browser-flow",
        requirement="Onboarding browser gate verifies first screen fallback and provider-ready status in the product surface.",
        evidenceChecks=(
            ("tests/verifyOnboardingPlaywright.py", (
                "Codaro로 무엇을 만들까요?",
                "Provider 연결",
                "GET /api/system/diagnostics",
                "시작 진단 필요",
                "기본 안내 모드",
                "provider 연결됨",
                "Pandas 레슨",
            )),
            ("tests/run.py", ("tests/verifyOnboardingPlaywright.py", "\"onboarding-browser\"")),
        ),
    ),
    ProductQualityRequirement(
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
    ProductQualityRequirement(
        requirementId="frontend-performance-budget",
        requirement="Editor and landing bundle splitting are enforced after build without forcing React into a circular split.",
        evidenceChecks=(
            ("editor/vite.config.ts", ("manualChunks", "@codemirror", "yaml", "vendor")),
            ("docs/skills/ops/product/service-candidate.md", ("React와 일반 vendor를 억지로 나눠 순환 chunk를 만들지 않는다",)),
            ("docs/skills/ops/product/service-candidate.md", ("docsPages/page*.js", "nav chunk")),
            ("tests/verifyFrontendPerformanceBudget.py", (
                "MIN_JS_CHUNKS",
                "MAX_SINGLE_JS_BYTES",
                "MAX_TOTAL_JS_BYTES",
                "REQUIRED_CHUNK_LABELS",
            )),
            ("tests/verifyLandingDocsBundleSplit.py", (
                "MAX_BUILT_DOCS_NAV_BYTES",
                "generated-docs-freshness",
                "product-quality-audit",
                "docsNav.js still contains",
                "import.meta.glob",
                "docsPagesWithContent",
            )),
            ("tests/run.py", (
                "tests/verifyFrontendPerformanceBudget.py",
                "\"frontend-performance-budget\"",
                "tests/verifyLandingDocsBundleSplit.py",
                "\"landing-build\"",
            )),
        ),
        forbiddenChecks=(
            ("editor/vite.config.ts", ("react-dom",)),
        ),
    ),
    ProductQualityRequirement(
        requirementId="no-secret-diagnostics",
        requirement="Product quality diagnostics separate failure categories and keep secrets out of logs and outputs.",
        evidenceChecks=(
            ("src/codaro/system/diagnosticSummary.py", (
                "DIAGNOSTIC_CATEGORIES",
                "\"provider\", \"runtime\", \"package\", \"frontend\"",
                "buildDiagnosticSummary",
                "providerDiagnosticItem",
                "safeDiagnosticValue",
                "safeDiagnosticText",
            )),
            ("src/codaro/api/systemRouter.py", (
                "/api/system/diagnostics",
                "buildLocalDiagnosticSummary",
                "_providerDiagnostics",
                "_packageDiagnostics",
                "_runtimeDiagnostics",
                "_frontendDiagnostics",
            )),
            ("tests/testDiagnosticSummary.py", (
                "testDiagnosticSummarySeparatesFailureCategoriesAndActions",
                "testDiagnosticSummaryRedactsSecretsInTextAndMetadata",
                "testProviderDiagnosticItemUsesSharedPayloadContract",
                "Bearer [redacted]",
            )),
            ("tests/testServerApi.py", (
                "testSystemDiagnosticsEndpointSeparatesFailuresAndRedactsSecrets",
                "/api/system/diagnostics",
                "configure-base-url",
            )),
            ("tests/verifyDiagnosticSummaryContract.py", (
                "local diagnostic summary",
                "provider failure, runtime failure, package failure, frontend failure",
            )),
            ("editor/src/lib/api.ts", (
                "systemDiagnostics",
                "/api/system/diagnostics",
            )),
            ("editor/src/lib/appBootstrap.ts", (
                "diagnosticNoticeFromSummary",
                "시작 진단 필요",
                "readableDiagnosticAction",
            )),
            ("editor/src/components/app/topBar.tsx", (
                "showStatusNotice",
                "notice.tone === \"warning\"",
            )),
            ("editor/src/types.ts", (
                "DiagnosticSummary",
                "\"provider\" | \"runtime\" | \"package\" | \"frontend\"",
            )),
            ("tests/run.py", (
                "\"diagnostic-summary-contract\"",
                "tests/testDiagnosticSummary.py",
                "tests/verifyDiagnosticSummaryContract.py",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "token/API key/secret은 diagnostic summary와 로그에 남기지 않는다",
                "raw JSON은 확장 진단",
                "diagnostic-summary-contract",
            )),
            ("docs/skills/architecture/live-provider-ops.md", (
                "실제 token과 API key는 저장소에 남기지 않는다",
                "raw detail은 기본 UI에 노출하지 않는다",
            )),
            ("docs/skills/architecture/ssot-map.md", (
                "diagnostic summary",
                "src/codaro/system/diagnosticSummary.py",
            )),
        ),
    ),
    ProductQualityRequirement(
        requirementId="live-provider-diagnostics",
        requirement="AI live smoke reports provider failure categories and keeps OAuth tool-result continuation explicit.",
        evidenceChecks=(
            ("tests/verifyAiLiveSmoke.py", (
                "providerErrorDiagnostic",
                "liveCredentialDiagnostic",
                "liveProviderExceptionDiagnostic",
                "diagnosticCode",
                "diagnosticAction",
            )),
            ("tests/testAiLiveSmoke.py", (
                "testCredentialMissingPayloadIncludesProviderDiagnostic",
                "testFailedCasePayloadUsesProviderDiagnostic",
                "provider_network_error",
                "configure-api-key",
            )),
            ("tests/testAiProvider.py", (
                "test_oauth_body_bridges_tool_results_as_user_text",
                "[tool_result id=call-check]",
                "previous_response_id",
            )),
            ("tests/testTeacherArchitecture.py", (
                "testProviderToolResultSerializationGuidesCellCallAfterReadyPackageCheck",
                "codaroToolPolicy",
                "nextRequiredTool",
                "Do not call packages-check again",
            )),
            ("src/codaro/ai/providers/oauthChatgptProvider.py", (
                "[tool_result id=",
            )),
            ("src/codaro/ai/teacher/providerLoop.py", (
                "codaroToolPolicy",
                "nextRequiredTool",
                "providerToolPolicyHint",
            )),
            ("docs/skills/architecture/live-provider-ops.md", (
                "diagnostic.code",
                "diagnostic.action",
                "liveCredentialDiagnostic",
                "text bridge",
                "codaroToolPolicy.nextRequiredTool",
            )),
        ),
    ),
    ProductQualityRequirement(
        requirementId="repo-local-gate-isolation",
        requirement="The local gate runner disables caches and isolates required tool scratch work inside repo-local disposable paths.",
        evidenceChecks=(
            ("tests/run.py", (
                "GATE_WORK_ROOT",
                "UV_NO_CACHE",
                "normalizePytestArgs",
                "--basetemp",
                "normalizeCargoArgs",
                "--target-dir",
                "TMPDIR",
                "scratch",
            )),
            ("tests/playwrightCli.py", (
                "repoLocalPlaywrightWorkspace",
                "PLAYWRIGHT_DAEMON_SESSION_DIR",
                "PLAYWRIGHT_SERVER_REGISTRY",
                "output",
                "test-runner",
                "TMPDIR",
                "playwright",
            )),
            ("tests/verifyLearningCardPlaywright.py", ("repoLocalPlaywrightWorkspace",)),
            ("tests/verifyOnboardingPlaywright.py", ("repoLocalPlaywrightWorkspace",)),
            ("tests/verifyProviderSettingsPlaywright.py", ("repoLocalPlaywrightWorkspace",)),
            ("tests/verifyRuntimeRecoveryPlaywright.py", ("repoLocalPlaywrightWorkspace",)),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "`output/test-runner/<gate>/`",
                "`uv --no-cache run`",
                "`--basetemp output/test-runner/<gate>/pytest`",
                "`--target-dir output/test-runner/<gate>/cargo-target`",
                "`output/test-runner/<gate>/scratch`",
                "브라우저 verifier",
                "`repoLocalPlaywrightWorkspace`",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "repo-local `output/test-runner/<gate>/`",
                "브라우저 gate 직접 실행도 repo-local",
                "uv/pytest cache는 비활성화",
                "사용자 홈 권한이나 기존 build lock과 충돌하지 않게 한다",
            )),
        ),
        forbiddenChecks=(
            ("tests/verifyLearningCardPlaywright.py", ("tempfile.mkdtemp",)),
            ("tests/verifyOnboardingPlaywright.py", ("tempfile.mkdtemp",)),
            ("tests/verifyProviderSettingsPlaywright.py", ("tempfile.mkdtemp",)),
            ("tests/verifyRuntimeRecoveryPlaywright.py", ("tempfile.mkdtemp",)),
        ),
    ),
)


def main() -> int:
    results = tuple(requirement.evaluate() for requirement in PRODUCT_QUALITY_REQUIREMENTS)
    payload = buildAuditPayload(results)
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if payload["requirementFailures"]:
        print("FAIL: product quality audit requirements are incomplete", file=sys.stderr)
        return 1
    print(f"ok: product quality audit score {payload['score']}/{payload['maxScore']}")
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
            "requirement": f"product quality audit score must be at least {MINIMUM_SCORE}",
            "evidence": [],
            "missing": [f"score {score} < {MINIMUM_SCORE}"],
        })
    return {
        "gate": "product-quality-audit",
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
