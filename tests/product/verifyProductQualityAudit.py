from __future__ import annotations

import json
import subprocess
import sys
import time
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
MINIMUM_SCORE = 9
REPORT_PATH = ROOT / "output" / "test-runner" / "product-quality-audit" / "product-quality-report.json"
PRODUCT_QUALITY_GATES = (
    "root-clean",
    "docs",
    "backend",
    "architecture-boundary",
    "design-system-contract",
    "visual-assets",
    "learning-method",
    "learning-evidence-contract",
    "learning-efficacy-report",
    "learning-system-readiness",
    "dogfood-alpha-audit",
    "product-quality-audit",
    "automation-ide-audit",
    "diagnostic-summary-contract",
    "ai-live-smoke",
    "provider-settings-browser",
    "install-launcher-smoke",
    "runtime-recovery-contract",
    "runtime-recovery-browser",
    "pyproc-assets-browser",
    "pyproc-runtime-fs-browser",
    "pyproc-asgi-browser",
    "curriculum-quality-matrix",
    "curriculum-executability",
    "curriculum-top-tier-audit",
    "playwright-curriculum-runtime",
    "onboarding-browser",
    "web-learning",
    "landing-public",
    "local-studio-browser",
    "product-experience-browser",
    "astryx-journey",
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
                "id: product-quality",
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
            ("docs/skills/ops/README.md", ("product-quality", "잘 만들어진 로컬 제품")),
            ("docs/skills/README.md", ("product-quality", "Ops (15)")),
            ("docs/skills/architecture/ssot-map.md", ("product quality", "`product-quality` 기준 id", "legacy path")),
        ),
    ),
    ProductQualityRequirement(
        requirementId="product-quality-gates-are-named",
        requirement="The product quality gate sequence is wired into the local runner and docs.",
        evidenceChecks=(
            ("tests/run.py", (
                *tuple(f"\"{gateName}\"" for gateName in PRODUCT_QUALITY_GATES),
                "PRODUCT_QUALITY_GATES",
                "\"quality-cycle\"",
                "tests/product/verifyProductQualityAudit.py",
                "writeGateSequenceSummary",
                "gateArtifactSummaries",
                "dogfood-alpha-audit/dogfood-alpha-report.json",
                "sequence-summary.json",
                "gitHead",
                "startedAt",
                "completedAt",
                "summaryPath",
                "fresh",
                "payloadGitHead",
                "gitHeadMatches",
                "payloadStatus",
                "artifactFailure",
                "softExitCodes",
                "softFailure",
                "softFailureCount",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                *tuple(f"`{gateName}`" for gateName in PRODUCT_QUALITY_GATES),
                "`quality-cycle`",
                "`output/test-runner/quality-cycle/sequence-summary.json`",
                "`dogfood-alpha-audit/dogfood-alpha-report.json`",
                "`softFailure: true`",
                "`softFailureCount`",
                "artifact freshness",
                "`payloadGitHead`",
                "`gitHeadMatches`",
                "`payloadStatus`",
                "`gitHead`",
                "`startedAt`/`completedAt`",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "잘 만들어진 로컬 제품",
                "tests/run.py quality-cycle",
                "dogfood-alpha-report.json",
                "`softFailureCount`",
                "`softFailure: true`",
                "`payloadGitHead`/`gitHeadMatches`",
                "artifact failure",
                "실제 provider 실패 exit code 1은 hard failure",
            )),
            ("tests/runtime/testRunEntrypoint.py", (
                *tuple(f"\"{gateName}\"" for gateName in PRODUCT_QUALITY_GATES),
                "PRODUCT_QUALITY_GATES",
                "testGateSequenceRecordsArtifactPayloadMetadata",
                "testGateSequenceFailsWhenArtifactGitHeadDoesNotMatch",
                "testGateSequenceContinuesThroughSoftLiveCredentialMissing",
                "testGateSequenceStillFailsHardLiveProviderFailure",
            )),
        ),
    ),
    ProductQualityRequirement(
        requirementId="architecture-boundary-gate",
        requirement="Architecture direction is enforced by a named gate, not only hidden inside the full backend suite.",
        evidenceChecks=(
            ("tests/run.py", (
                "\"architecture-boundary\"",
                "tests/architecture/testArchitectureLayerContract.py",
                "tests/architecture/testTransportBoundary.py",
                "core→engine→domain→transport→entry",
            )),
            ("tests/architecture/testArchitectureLayerContract.py", (
                "testCodaroPackageImportsFollowLayerDirection",
                "FORBIDDEN_IMPORTS_BY_PACKAGE",
                "`core → engine → domain → transport → entry`",
            )),
            ("tests/architecture/testTransportBoundary.py", (
                "testAiRouterKeepsRuntimeAndCurriculumBehindTeacherBoundary",
                "testTeacherLoopCompatibilityShimStaysThinAndUnusedInternally",
                "testServerStateFactoryLivesOutsideTransportLayer",
                "testDocumentRouterKeepsBlockOperationsBehindDocumentBoundary",
            )),
            ("docs/skills/architecture/overview.md", (
                "`core → engine → domain → transport → entry`",
                "`tests/architecture/testArchitectureLayerContract.py`",
                "`tests/architecture/testTransportBoundary.py`",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "`architecture-boundary`",
                "core→engine→domain→transport→entry",
                "router/domain 경계",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "`architecture-boundary`",
                "core→engine→domain→transport→entry",
                "router/domain 경계",
            )),
        ),
    ),
    ProductQualityRequirement(
        requirementId="automation-ide-audit",
        requirement="Automation IDE product quality is verified as task, schedule, webhook, workflow, E-Stop, audit, and frontend state wiring.",
        evidenceChecks=(
            ("tests/automation/verifyAutomationIdeAudit.py", (
                "automation-ide-report.json",
                "task-runner-safety-and-audit",
                "automation-loop-durability",
                "automation-frontend-surface",
                "automation-api-state-snapshot",
                "automation-tool-and-input-policy",
                "automation-docs-and-objective-scorecard",
                "MINIMUM_SCORE = 9.0",
            )),
            ("tests/run.py", (
                "\"automation-ide-audit\"",
                "tests/automation/verifyAutomationIdeAudit.py",
                "output/test-runner/automation-ide-audit/automation-ide-report.json",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "자동화 IDE 품질",
                "automation-ide-audit",
                "task/schedule/webhook/workflow/E-Stop/audit",
                "taskRun",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "`automation-ide-audit`",
                "automation-ide-audit/automation-ide-report.json",
            )),
        ),
    ),
    ProductQualityRequirement(
        requirementId="runtime-recovery-contract",
        requirement="Runtime recovery gate covers worker crash, package preflight, cell-call, and user-readable errors.",
        evidenceChecks=(
            ("tests/runtime/verifyRuntimeRecoveryContract.py", (
                "Engine worker crashed and was restarted.",
                "testLocalEngineWorkerCrashMessageSaysRestarted",
                "packages-check",
                "packages-install",
                "cell-call",
                "라이브러리 준비 실패",
            )),
            ("tests/run.py", ("tests/runtime/verifyRuntimeRecoveryContract.py", "tests/runtime/verifyEditorRuntimePreflight.py", "tests/runtime/testRuntime.py")),
        ),
    ),
    ProductQualityRequirement(
        requirementId="turn-state-durability",
        requirement="Repeated teacher turns do not reuse stale clarification or prior tool results as current turn state.",
        evidenceChecks=(
            ("docs/skills/ops/product/service-candidate.md", (
                "provider 연결 후 여러 질문을 보내도 stale provider status가 섞이지 않는다",
                "pending clarification은 이어지는 답변에서 한 번만 소비",
                "실패한 tool result가 다음 요청의 성공 경로에 섞이지 않는다",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "turn-state durability",
                "이전 tool result가 다음 turn의 tool policy state를 통과시키면 실패",
                "이전 실패 result가 새 성공 turn의 toolCalls/trace/workloop payload에 섞이면 실패",
            )),
            ("tests/teacher/testTeacherArchitecture.py", (
                "testProviderLoopDoesNotReusePriorToolResultsForNextTurnPolicy",
                "testProviderLoopKeepsRetryTurnTraceSeparateAfterFailedPreflight",
                "call-check-1",
                "call-cell-2",
                "call-check-failed",
                "call-check-retry",
                "kernel offline",
                "dependency-preflight-required",
                "secondExecutor.calls == []",
                "tool-policy-violation",
            )),
            ("tests/teacher/verifyTeacherGoldenE2e.py", (
                "pending clarification was not consumed",
                "stale clarification leaked into a new request",
                "specific new learning request reused stale clarification",
                "specific new learning request did not clear stale pending",
            )),
            ("tests/run.py", ("teacher-eval", "teacher-e2e", "learning-system-readiness")),
        ),
    ),
    ProductQualityRequirement(
        requirementId="launcher-install-smoke",
        requirement="Launcher/install smoke checks doctor diagnostics, health timeout, rollback, and packaging SSOT.",
        evidenceChecks=(
            ("tests/product/verifyInstallLauncherSmoke.py", (
                "INSTALL_LAUNCHER_REPORT_PATH",
                "install-launcher-report.json",
                "Command::Doctor",
                "verifyLauncherCliSmoke",
                "runLauncherJson",
                "launcher-cli-smoke",
                "launcher-cli-root",
                "\"commands\": [\"doctor\", \"state show\"]",
                "HEALTH_TIMEOUT",
                "backendWheel:codaro/webBuild",
                "Verify wheel includes editor frontend",
                "stage_release_can_use_editor_build_bundled_in_backend_wheel",
                "launch_config_uses_bundled_editor_when_archive_editor_is_missing",
                "last-known-good-release.json",
                "rollback-marker.json",
                "exact wheel",
                "제품 품질 검증용 내부 빌드",
                "freshStateNulls",
                "allEvidencePassed",
            )),
            ("tests/run.py", (
                "tests/product/verifyInstallLauncherSmoke.py",
                "cargo",
                "check",
                "output/test-runner/install-launcher-smoke/install-launcher-report.json",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "실제 launcher CLI `doctor`와 `state show`",
                "repo-local `output/test-runner/install-launcher-smoke/launcher-cli-root`",
                "JSON payload",
                "기본 update config",
                "layout directory 생성",
                "install-launcher-report.json",
                "freshStateNulls",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", ("install-launcher-smoke/install-launcher-report.json", "payloadGitHead")),
        ),
    ),
    ProductQualityRequirement(
        requirementId="curriculum-quality-matrix",
        requirement="Representative learning topics are materialized through the structured YAML contract.",
        evidenceChecks=(
            ("tests/curriculum/verifyCurriculumQualityMatrix.py", (
                "CURRICULUM_QUALITY_REPORT_PATH",
                "curriculum-quality-report.json",
                "python-basics",
                "file-handling",
                "data-analysis",
                "visualization",
                "web-automation",
                "sectionContract:exercise",
                "contractGapCount",
                "allRequiredFlowsObserved",
                "allSolutionsCaptured",
                "totalContractGaps",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "Python 기초",
                "파일 처리",
                "데이터 분석",
                "시각화",
                "웹 자동화",
                "curriculum-quality-report.json",
                "allRequiredFlowsObserved",
            )),
            ("tests/run.py", (
                "tests/curriculum/verifyCurriculumQualityMatrix.py",
                "\"curriculum-quality-matrix\"",
                "output/test-runner/curriculum-quality-matrix/curriculum-quality-report.json",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", ("curriculum-quality-matrix/curriculum-quality-report.json", "payloadGitHead")),
        ),
    ),
    ProductQualityRequirement(
        requirementId="curriculum-runtime-and-top-tier-proof",
        requirement="Curriculum quality-cycle includes top-tier design scoring and Playwright lesson runtime execution evidence.",
        evidenceChecks=(
            ("tests/run.py", (
                "\"curriculum-top-tier-audit\"",
                "\"playwright-curriculum-runtime\"",
                "output/test-runner/curriculum-top-tier-audit/curriculum-top-tier-report.json",
                "output/test-runner/playwright-curriculum-runtime/playwright-curriculum-runtime-report.json",
            )),
            ("tests/curriculum/verifyCurriculumTopTierAudit.py", (
                "curriculum-top-tier-report.json",
                "minimumScore",
                "actionableGaps",
                "intro-onboarding-and-outcomes",
            )),
            ("tests/curriculum/verifyPlaywrightCurriculumRuntime.py", (
                "EXPECTED_LESSON_COUNT = 11",
                "samplePassedCount",
                "browserReady",
                "chromium launch ok",
                "exercise.get(\"solution\")",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "`curriculum-top-tier-audit`",
                "`playwright-curriculum-runtime`",
                "curriculum-top-tier-audit/curriculum-top-tier-report.json",
                "playwright-curriculum-runtime/playwright-curriculum-runtime-report.json",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "curriculum-top-tier-audit",
                "playwright-curriculum-runtime",
                "실제 Chromium",
                "예제/정답 코드",
            )),
        ),
    ),
    ProductQualityRequirement(
        requirementId="onboarding-browser-flow",
        requirement="Onboarding browser gate verifies first screen fallback and provider-ready status in the product surface.",
        evidenceChecks=(
            ("tests/surface/verifyOnboardingPlaywright.py", (
                "Codaro로 무엇을 만들까요?",
                "Provider 연결",
                "ONBOARDING_REPORT_PATH",
                "onboarding-report.json",
                "GET /api/system/diagnostics",
                "GET /api/system/diagnostics/export",
                "시작 진단 필요",
                "진단 복사",
                "diagnostic-export-copy-ok",
                "onboarding-provider-connect-ok",
                "기본 안내 모드",
                "provider 연결됨",
                "Pandas 실습",
                "diagnosticExportCopied",
                "providerFallbackBeforeReady",
                "providerReadyAfterValidate",
            )),
            ("tests/run.py", (
                "tests/surface/verifyOnboardingPlaywright.py",
                "\"onboarding-browser\"",
                "output/test-runner/onboarding-browser/onboarding-report.json",
            )),
            ("docs/skills/ops/product/service-candidate.md", ("onboarding-report.json", "providerFallbackBeforeReady")),
            ("docs/skills/ops/foundation/testing-and-gates.md", ("onboarding-browser/onboarding-report.json", "payloadGitHead")),
        ),
    ),
    ProductQualityRequirement(
        requirementId="provider-settings-browser-flow",
        requirement="Provider settings browser gate verifies OAuth login states, provider selection, failure actions, and visual integrity.",
        evidenceChecks=(
            ("tests/surface/verifyProviderSettingsPlaywright.py", (
                "PROVIDER_SETTINGS_REPORT_PATH",
                "provider-settings-report.json",
                "data-provider-fallback-state",
                "GET /api/oauth/authorize",
                "GET /api/oauth/status",
                "state_mismatch",
                "permission_denied",
                "provider_compatibility_error",
                "provider_network_error",
                "provider_base_url_missing",
                "OAuth 호환성 점검",
                "네트워크 문제",
                "Base URL 입력 필요",
                "oauthStateMismatchHandled",
                "oauthPermissionDeniedHandled",
                "oauthLoginSucceeded",
                "openaiSelectedAndLive",
                "desktopVisualIntegrity",
                "mobileVisualIntegrity",
            )),
            ("tests/run.py", (
                "tests/surface/verifyProviderSettingsPlaywright.py",
                "\"provider-settings-browser\"",
                "output/test-runner/provider-settings-browser/provider-settings-report.json",
            )),
            ("docs/skills/ops/product/service-candidate.md", ("provider-settings-report.json", "oauthStateMismatchHandled")),
            ("docs/skills/ops/foundation/testing-and-gates.md", ("provider-settings-browser/provider-settings-report.json", "payloadGitHead")),
        ),
    ),
    ProductQualityRequirement(
        requirementId="runtime-recovery-browser-flow",
        requirement="Runtime recovery browser gate verifies user-facing failure/retry copy near the learning surface.",
        evidenceChecks=(
            ("tests/runtime/verifyRuntimeRecoveryPlaywright.py", (
                "RUNTIME_RECOVERY_REPORT_PATH",
                "runtime-recovery-report.json",
                "라이브러리 준비 실패",
                "셀 실행 실패",
                "data-learning-exercise-input-role=\"student-practice\"",
                "packages-check",
                "packages-install",
                "cellCallBlockedAfterPackageFailure",
                "cellCallExecutedForRuntimeFailure",
                "packageFailureShownNearCell",
                "cellFailureShownNearCell",
            )),
            ("tests/run.py", (
                "tests/runtime/verifyRuntimeRecoveryPlaywright.py",
                "\"runtime-recovery-browser\"",
                "output/test-runner/runtime-recovery-browser/runtime-recovery-report.json",
            )),
            ("docs/skills/ops/product/service-candidate.md", ("runtime-recovery-report.json", "cellCallBlockedAfterPackageFailure")),
            ("docs/skills/ops/foundation/testing-and-gates.md", ("runtime-recovery-browser/runtime-recovery-report.json", "payloadGitHead")),
        ),
    ),
    ProductQualityRequirement(
        requirementId="pyproc-assets-browser-flow",
        requirement="Pyproc asset manifest gate verifies the built editor surface serves same-origin vendor graph files with matching SRI.",
        evidenceChecks=(
            ("tests/surface/verifyPyprocAssetsPlaywright.py", (
                "pyproc-assets.json",
                "pyproc-assets-report.json",
                "vendor-graph-sri",
                "process-worker-payload",
                "crypto.subtle.digest",
                "sameOriginVendorUrls",
                "sriVerified",
            )),
            ("tests/run.py", (
                "\"pyproc-assets-browser\"",
                "tests/surface/verifyPyprocAssetsPlaywright.py",
                "output/test-runner/pyproc-assets-browser/pyproc-assets-report.json",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "pyproc-assets-browser",
                "pyproc-assets-report.json",
                "sameOriginVendorUrls",
                "sriVerified",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "pyproc-assets-browser/pyproc-assets-report.json",
                "payloadGitHead",
            )),
        ),
    ),
    ProductQualityRequirement(
        requirementId="pyproc-runtime-fs-browser-flow",
        requirement="Pyproc browser runtime gate verifies Codaro uses Runtime.fs as a shared browser file world visible to Python open().",
        evidenceChecks=(
            ("editor/src/lib/browserPythonRuntime.ts", (
                "fs: PyRuntimeFileSystem",
                "/home/web/codaro",
                "Runtime.fs",
                "writeBrowserRunRecord",
                "pythonRunRecordMatches",
                "installBrowserPythonRuntimeDiagnostics",
                "browser-runtime-run-record",
            )),
            ("tests/learning/verifyLearningSectionCardContract.py", (
                "learner output hides runtime artifact paths",
                "learner output hides execution counters",
            )),
            ("tests/surface/verifyPyprocRuntimeFsPlaywright.py", (
                "pyproc-runtime-fs-report.json",
                "codaroBrowserRuntimeDiagnostics",
                "diagnostics.executeBlock",
                "diagnostics.readTextFile",
                "Python open",
                "Runtime.fs",
                "pythonOpenShared",
            )),
            ("tests/run.py", (
                "\"pyproc-runtime-fs-browser\"",
                "tests/surface/verifyPyprocRuntimeFsPlaywright.py",
                "output/test-runner/pyproc-runtime-fs-browser/pyproc-runtime-fs-report.json",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "pyproc-runtime-fs-browser",
                "pyproc-runtime-fs-report.json",
                "Runtime.fs",
                "pythonOpenShared",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "pyproc-runtime-fs-browser/pyproc-runtime-fs-report.json",
                "payloadGitHead",
            )),
        ),
    ),
    ProductQualityRequirement(
        requirementId="pyproc-asgi-browser-flow",
        requirement="Pyproc browser server gate verifies Codaro dispatches Python ASGI request and response inside the browser runtime.",
        evidenceChecks=(
            ("editor/src/lib/browserPythonRuntime.ts", (
                "enableAsgiServer",
                "verifyBrowserAsgiServer",
                "pyproc-asgi",
                "x-codaro-runtime",
                "/codaro/pyproc-asgi",
                "browser-os-server",
            )),
            ("tests/surface/verifyPyprocAsgiPlaywright.py", (
                "pyproc-asgi-report.json",
                "codaroBrowserRuntimeDiagnostics",
                "diagnostics.verifyAsgiServer",
                "asgi-request-round-trip",
                "asgi-install-contract",
                "pyproc-asgi-browser",
            )),
            ("tests/run.py", (
                "\"pyproc-asgi-browser\"",
                "tests/surface/verifyPyprocAsgiPlaywright.py",
                "output/test-runner/pyproc-asgi-browser/pyproc-asgi-report.json",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "pyproc-asgi-browser",
                "pyproc-asgi-report.json",
                "AsgiServer",
                "browser-os-server",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "pyproc-asgi-browser/pyproc-asgi-report.json",
                "payloadGitHead",
            )),
        ),
    ),
    ProductQualityRequirement(
        requirementId="frontend-performance-budget",
        requirement="Editor and landing bundle splitting are enforced after build without forcing React into a circular split.",
        evidenceChecks=(
            ("editor/vite.config.ts", ("rolldownOptions", "codeSplitting", "@codemirror", "yaml", "vendor")),
            ("docs/skills/ops/product/service-candidate.md", ("React와 일반 vendor를 억지로 나눠 순환 chunk를 만들지 않는다",)),
            ("docs/skills/ops/product/service-candidate.md", ("docsPages/page*.js", "nav chunk")),
            ("docs/skills/ops/product/service-candidate.md", ("output/test-runner/frontend-performance-budget/performance-report.json", "gitHead")),
            ("docs/skills/ops/foundation/testing-and-gates.md", ("frontend-performance-budget/performance-report.json", "payloadGitHead")),
            ("tests/surface/verifyFrontendPerformanceBudget.py", (
                "MIN_JS_CHUNKS",
                "MAX_SINGLE_JS_BYTES",
                "MAX_TOTAL_JS_BYTES",
                "REQUIRED_CHUNK_LABELS",
                "REPORT_PATH",
                "gitHead",
                "startedAt",
                "completedAt",
                "durationMs",
            )),
            ("tests/surface/verifyLandingDocsBundleSplit.py", (
                "MAX_BUILT_DOCS_NAV_BYTES",
                "generated-docs-freshness",
                "product-quality-audit",
                "docsNav.js still contains",
                "import.meta.glob",
                "docsPagesWithContent",
            )),
            ("tests/run.py", (
                "GATE_ARTIFACTS",
                "frontend-performance-budget/performance-report.json",
                "tests/surface/verifyFrontendPerformanceBudget.py",
                "\"frontend-performance-budget\"",
                "tests/surface/verifyLandingDocsBundleSplit.py",
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
                "buildDiagnosticExport",
                "readableDiagnosticSummaryText",
                "readableDiagnosticAction",
                "providerDiagnosticItem",
                "safeDiagnosticValue",
                "safeDiagnosticText",
                "summaryText",
                "readableActions",
                "codaro-local-diagnostic-export",
            )),
            ("src/codaro/api/systemRouter.py", (
                "/api/system/diagnostics",
                "/api/system/diagnostics/export",
                "buildLocalDiagnosticSummary",
                "buildLocalDiagnosticExport",
            )),
            ("src/codaro/system/localDiagnostics.py", (
                "buildLocalDiagnosticSummary",
                "buildLocalDiagnosticExport",
                "diagnosticExportContext",
                "providerDiagnostics",
                "packageDiagnostics",
                "runtimeDiagnostics",
                "frontendDiagnostics",
                "buildDiagnosticSummary",
                "buildDiagnosticExport",
            )),
            ("tests/teacher/testDiagnosticSummary.py", (
                "testDiagnosticSummarySeparatesFailureCategoriesAndActions",
                "testDiagnosticSummaryRedactsSecretsInTextAndMetadata",
                "testDiagnosticRedactionPreservesSafeSecretConfiguredState",
                "testDiagnosticSummaryProvidesReadableOkState",
                "testDiagnosticExportPackagesRedactedSummaryAndContext",
                "testProviderDiagnosticItemUsesSharedPayloadContract",
                "Bearer [redacted]",
                "summaryText",
                "readableActions",
            )),
            ("tests/runtime/testServerApi.py", (
                "testSystemDiagnosticsEndpointSeparatesFailuresAndRedactsSecrets",
                "testSystemDiagnosticsExportEndpointProvidesShareableRedactedPayload",
                "/api/system/diagnostics",
                "/api/system/diagnostics/export",
                "configure-base-url",
                "Base URL 입력",
                "summaryText",
            )),
            ("tests/teacher/verifyDiagnosticSummaryContract.py", (
                "DIAGNOSTIC_SUMMARY_REPORT_PATH",
                "diagnostic-summary-report.json",
                "local diagnostic summary",
                "local diagnostic export",
                "provider failure, runtime failure, package failure, frontend failure",
                "readableDiagnosticSummaryText",
                "buildDiagnosticExport",
                "summaryText",
                "readableActions",
                "allChecksPassed",
                "categoryContractCovered",
                "providerErrorRedactionCovered",
                "systemEndpointsCovered",
                "frontendNoticeCovered",
                "onboardingExportCovered",
            )),
            ("editor/src/lib/api/systemApi.ts", (
                "systemDiagnostics",
                "/api/system/diagnostics",
                "systemDiagnosticsExport",
                "/api/system/diagnostics/export",
            )),
            ("editor/src/lib/systemDiagnostics.ts", (
                "loadSystemDiagnosticExport",
                "codaroApi.systemDiagnosticsExport",
            )),
            ("editor/src/App.tsx", (
                "<TopControls",
                "loadSystemDiagnosticExport",
                "copyDiagnosticExport",
                "notice={notice}",
                "onCopyDiagnosticExport={copyDiagnosticExport}",
                "writeClipboardText",
            )),
            ("editor/src/lib/appBootstrap.ts", (
                "diagnosticNoticeFromSummary",
                "diagnostic.startRequired.title",
                "summary.summaryText",
                "readableDiagnosticAction",
            )),
            ("editor/src/components/app/topBar.tsx", (
                "showStatusNotice",
                "notice.tone === \"warning\"",
                "data-diagnostic-export-copy",
                "topbar.copyDiagnostic",
            )),
            ("editor/src/lib/localeCopy.ts", (
                "시작 진단 필요",
                "진단 복사",
            )),
            ("editor/src/types/system.ts", (
                "DiagnosticSummary",
                "DiagnosticExportPayload",
                "\"provider\" | \"runtime\" | \"package\" | \"frontend\"",
                "summaryText",
                "readableActions",
            )),
            ("tests/run.py", (
                "\"diagnostic-summary-contract\"",
                "tests/teacher/testDiagnosticSummary.py",
                "tests/teacher/verifyDiagnosticSummaryContract.py",
                "output/test-runner/diagnostic-summary-contract/diagnostic-summary-report.json",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "token/API key/secret은 diagnostic summary/export와 로그에 남기지 않는다",
                "local diagnostic export",
                "`진단 복사`",
                "summaryText",
                "readableActions",
                "raw JSON은 확장 진단",
                "diagnostic-summary-contract",
                "diagnostic-summary-report.json",
                "allChecksPassed",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", ("diagnostic-summary-contract/diagnostic-summary-report.json", "payloadGitHead")),
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
            ("tests/teacher/verifyAiLiveSmoke.py", (
                "providerErrorDiagnostic",
                "liveCredentialDiagnostic",
                "liveProviderExceptionDiagnostic",
                "LIVE_SMOKE_REPORT_PATH",
                "writeLiveSmokeReport",
                "stampLiveSmokePayload",
                "currentGitHead",
                "utcTimestamp",
                "live-smoke-report.json",
                "gitHead",
                "startedAt",
                "completedAt",
                "diagnosticCode",
                "diagnosticAction",
                "workloopSignal",
                "workloopReadable",
                "workloopSamples",
                "resolve-learning-goal",
                "search-curricula",
                "compose-master-plan",
                "goalDiscoveryComplete",
                "composeGapCount",
                "redactSignalText",
            )),
            ("tests/teacher/testAiLiveSmoke.py", (
                "testCredentialMissingPayloadIncludesProviderDiagnostic",
                "testFailedCasePayloadUsesProviderDiagnostic",
                "testWriteLiveSmokeReportPersistsBoundedPayload",
                "testStampLiveSmokePayloadAddsEvidenceMetadata",
                "testWorkloopSignalReportsReadableBoundedSamples",
                "testWorkloopSignalFailsUnreadableEvents",
                "provider_network_error",
                "configure-api-key",
            )),
            ("tests/teacher/testAiProvider.py", (
                "test_oauth_body_bridges_tool_results_as_user_text",
                "[tool_result id=call-check]",
                "previous_response_id",
            )),
            ("tests/teacher/testTeacherArchitecture.py", (
                "testProviderToolResultSerializationGuidesCellCallAfterReadyPackageCheck",
                "codaroToolPolicy",
                "codaroNextRequiredTool",
                "codaroProviderInstruction",
                "nextRequiredTool",
                "Do not call packages-check again",
            )),
            ("src/codaro/ai/providers/oauthChatgptProvider.py", (
                "[tool_result id=",
            )),
            ("src/codaro/ai/teacher/providerLoop.py", (
                "codaroNextRequiredTool",
                "codaroProviderInstruction",
                "codaroToolPolicy",
                "nextRequiredTool",
                "providerToolPolicyHint",
            )),
            ("docs/skills/architecture/live-provider-ops.md", (
                "diagnostic.code",
                "diagnostic.action",
                "liveCredentialDiagnostic",
                "output/test-runner/ai-live-smoke/live-smoke-report.json",
                "workloopReadable",
                "workloopLabels",
                "workloopSamples",
                "gitHead",
                "startedAt",
                "completedAt",
                "resolve-learning-goal → search-curricula → compose-master-plan",
                "gap을 보고할 때만 `packages-check → write-curriculum-yaml`",
                "codaroNextRequiredTool",
                "codaroProviderInstruction",
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
                "UV_CACHE_DIR",
                "UV_LINK_MODE",
                "uvCommandUsesWith",
                "normalizePytestArgs",
                "localGatePytestBaseTemp",
                "--basetemp",
                "normalizeCargoArgs",
                "--target-dir",
                "commandLogPath",
                "logs",
                "subprocess.STDOUT",
                "waitForLogFileStable",
                "timeoutSeconds",
                "terminateProcess",
                "printLogTail",
                "commandLogSummaries",
                "bytes",
                "TMPDIR",
                "scratch",
            )),
            ("tests/runtime/testRunEntrypoint.py", (
                "testUvWithCommandsUseRepoLocalCache",
                "testRunCommandWritesRepoLocalFailureLog",
                "testRunCommandTimesOutWithLog",
                "testGateSequenceSummaryIncludesCommandLogs",
                "command log:",
                "visible stderr",
                "exit: 3",
                "timeout: exceeded 1s",
                "exit: 124",
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
            ("tests/learning/verifyLearningCardPlaywright.py", ("repoLocalPlaywrightWorkspace",)),
            ("tests/surface/verifyOnboardingPlaywright.py", ("repoLocalPlaywrightWorkspace",)),
            ("tests/surface/verifyProviderSettingsPlaywright.py", ("repoLocalPlaywrightWorkspace",)),
            ("tests/runtime/verifyRuntimeRecoveryPlaywright.py", ("repoLocalPlaywrightWorkspace",)),
            ("tests/curriculum/verifyPlaywrightCurriculumRuntime.py", (
                "PYTEST_ADDOPTS",
                "-p no:cacheprovider",
            )),
            ("launcher/codaro-launcher/src/self_update.rs", (
                "use tempfile::tempdir;",
                "let temp_dir = tempdir().unwrap();",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "`output/test-runner/<gate>/`",
                "`uv --no-cache run`",
                "`UV_CACHE_DIR=output/test-runner/<gate>/uv-cache`",
                "`UV_LINK_MODE=copy`",
                "`--basetemp output/test-runner/<gate>/pytest/run-<pid>-<time_ns>`",
                "`--target-dir output/test-runner/<gate>/cargo-target`",
                "`output/test-runner/<gate>/scratch`",
                "`output/test-runner/<gate>/logs`",
                "`exit: 124`",
                "gate별 command log path/size/freshness",
                "브라우저 verifier",
                "`repoLocalPlaywrightWorkspace`",
                "고정 OS temp 이름을 쓰지 않는다",
            )),
            ("docs/skills/ops/product/service-candidate.md", (
                "repo-local `output/test-runner/<gate>/`",
                "브라우저 gate 직접 실행도 repo-local",
                "일반 uv/pytest cache는 비활성화",
                "`output/test-runner/<gate>/uv-cache`",
                "copy link mode",
                "사용자 홈 권한이나 기존 build lock과 충돌하지 않게 한다",
                "`output/test-runner/<gate>/logs`",
                "`exit: 124`",
                "command log path/size/freshness",
                "launcher Rust 테스트는 고정 temp 이름을 쓰지 않는다",
            )),
        ),
        forbiddenChecks=(
            ("tests/learning/verifyLearningCardPlaywright.py", ("tempfile.mkdtemp",)),
            ("tests/surface/verifyOnboardingPlaywright.py", ("tempfile.mkdtemp",)),
            ("tests/surface/verifyProviderSettingsPlaywright.py", ("tempfile.mkdtemp",)),
            ("tests/runtime/verifyRuntimeRecoveryPlaywright.py", ("tempfile.mkdtemp",)),
            ("launcher/codaro-launcher/src/self_update.rs", ("codaro-test-self-update",)),
        ),
    ),
)


def main() -> int:
    startedAt = datetime.now(UTC).isoformat(timespec="seconds")
    started = time.monotonic()
    results = tuple(requirement.evaluate() for requirement in PRODUCT_QUALITY_REQUIREMENTS)
    payload = buildAuditPayload(results)
    payload.update({
        "status": "passed" if payload["passed"] else "failed",
        "gitHead": currentGitHead(),
        "startedAt": startedAt,
        "completedAt": datetime.now(UTC).isoformat(timespec="seconds"),
        "durationMs": round((time.monotonic() - started) * 1000),
        "reportPath": str(REPORT_PATH.relative_to(ROOT)).replace("\\", "/"),
    })
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if payload["requirementFailures"]:
        print("FAIL: product quality audit requirements are incomplete", file=sys.stderr)
        return 1
    print(f"ok: product quality wiring coverage {payload['score']}/{payload['maxScore']}")
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
        "scoreKind": "wiring-coverage",
        "minimumScore": MINIMUM_SCORE,
        "requiredScore": MINIMUM_SCORE,
        "passed": not requirementFailures,
        "completionEligible": False,
        "productQualityScore": None,
        "requirements": results,
        "requirementFailures": requirementFailures,
    }


def currentGitHead() -> str | None:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
    except (FileNotFoundError, OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() or None


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
