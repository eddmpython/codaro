from __future__ import annotations

import json
import subprocess
import sys
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
REPORT_PATH = ROOT / "output" / "test-runner" / "objective-nineplus-audit" / "objective-nineplus-report.json"
MINIMUM_DOMAIN_SCORE = 9.0
PRODUCT_QUALITY_GATES = (
    "root-clean",
    "docs",
    "backend",
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
    "curriculum-quality-matrix",
    "curriculum-top-tier-audit",
    "playwright-curriculum-runtime",
    "onboarding-browser",
    "frontend-performance-budget",
    "landing-build",
    "launcher-test",
)

REFERENCE_SOURCES = {
    "iso25010": "https://webstore.iec.ch/en/publication/90024",
    "wcag22": "https://www.w3.org/TR/WCAG22/",
    "nistAiRmf": "https://www.nist.gov/itl/ai-risk-management-framework",
    "nistTrustworthy": "https://airc.nist.gov/airmf-resources/airmf/3-sec-characteristics/",
    "castUdl": "https://udlguidelines.cast.org/",
    "acmEthics": "https://www.acm.org/code-of-ethics/software-engineering-code",
}


@dataclass(frozen=True)
class CheckResult:
    label: str
    passed: bool
    detail: str


def main() -> int:
    context = AuditContext()
    domains = buildDomains(context)
    failedDomains = [
        domain
        for domain in domains
        if domain["score"] < MINIMUM_DOMAIN_SCORE or domain["requirementFailures"]
    ]
    overallScore = round(sum(domain["score"] for domain in domains) / len(domains), 2) if domains else 0
    payload = {
        "gate": "objective-nineplus-audit",
        "passed": not failedDomains,
        "status": "passed" if not failedDomains else "failed",
        "score": overallScore,
        "maxScore": 10,
        "minimumScore": MINIMUM_DOMAIN_SCORE,
        "requiredScore": MINIMUM_DOMAIN_SCORE,
        "domainCount": len(domains),
        "failedDomains": [domain["id"] for domain in failedDomains],
        "requirementFailures": [
            failure
            for domain in failedDomains
            for failure in domain["requirementFailures"]
        ],
        "referenceSources": REFERENCE_SOURCES,
        "domains": domains,
        "gitHead": context.currentHead,
        "startedAt": context.startedAt,
        "completedAt": utcTimestamp(),
        "reportPath": displayPath(REPORT_PATH),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failedDomains:
        print("FAIL: objective 9+ scorecard has domains below 9.0", file=sys.stderr)
        return 1
    print(f"ok: objective 9+ scorecard {overallScore}/10 across {len(domains)} domains")
    return 0


class AuditContext:
    def __init__(self) -> None:
        self.startedAt = utcTimestamp()
        self.currentHead = currentGitHead()
        self.qualityCycle = readJson("output/test-runner/quality-cycle/sequence-summary.json")
        self.liveSmoke = readJson("output/test-runner/ai-live-smoke/live-smoke-report.json")
        self.automation = readJson("output/test-runner/automation-ide-audit/automation-ide-report.json")
        self.dogfood = readJson("output/test-runner/dogfood-alpha-audit/dogfood-alpha-report.json")
        self.diagnostic = readJson("output/test-runner/diagnostic-summary-contract/diagnostic-summary-report.json")
        self.providerSettings = readJson("output/test-runner/provider-settings-browser/provider-settings-report.json")
        self.installLauncher = readJson("output/test-runner/install-launcher-smoke/install-launcher-report.json")
        self.runtimeRecovery = readJson("output/test-runner/runtime-recovery-browser/runtime-recovery-report.json")
        self.curriculumMatrix = readJson("output/test-runner/curriculum-quality-matrix/curriculum-quality-report.json")
        self.curriculumFlow = readJson("output/test-runner/curriculum-quality-matrix/curriculum-flow-quality-report.json")
        self.curriculumTopTier = readJson("output/test-runner/curriculum-top-tier-audit/curriculum-top-tier-report.json")
        self.playwrightCurriculumRuntime = readJson("output/test-runner/playwright-curriculum-runtime/playwright-curriculum-runtime-report.json")
        self.onboarding = readJson("output/test-runner/onboarding-browser/onboarding-report.json")
        self.frontendPerf = readJson("output/test-runner/frontend-performance-budget/performance-report.json")

    def gate(self, gateName: str) -> dict[str, Any] | None:
        gates = self.qualityCycle.get("gates") if isinstance(self.qualityCycle, dict) else None
        if not isinstance(gates, list):
            return None
        for gate in gates:
            if isinstance(gate, dict) and gate.get("gate") == gateName:
                return gate
        return None


def buildDomains(context: AuditContext) -> list[dict[str, Any]]:
    return [
        domain("software-product-quality", (
            textCheck("ISO/IEC 25010 source mapped", "objectiveNinePlusScorecard.md", "ISO/IEC 25010:2023 product quality model"),
            qualityCycleCheck(context),
            gatePassed(context, "backend"),
            gatePassed(context, "product-quality-audit"),
            gatePassed(context, "runtime-recovery-contract"),
            gatePassed(context, "frontend-performance-budget"),
            gatePassed(context, "install-launcher-smoke"),
            textCheck("product quality SSOT", "docs/skills/ops/product/service-candidate.md", "객관 9점대 Scorecard"),
        )),
        domain("education-ide", (
            textCheck("CAST UDL source mapped", "objectiveNinePlusScorecard.md", "CAST UDL Guidelines 3.0"),
            gatePassed(context, "learning-system-readiness"),
            gatePassed(context, "curriculum-quality-matrix"),
            gatePassed(context, "curriculum-top-tier-audit"),
            gatePassed(context, "playwright-curriculum-runtime"),
            artifactPassed("curriculum matrix report", context.curriculumMatrix),
            artifactPassed("curriculum flow report", context.curriculumFlow),
            artifactPassed("curriculum top-tier report", context.curriculumTopTier),
            artifactPassed("Playwright curriculum runtime report", context.playwrightCurriculumRuntime),
            playwrightRuntimeSamplesPassed(context),
            scoreAtLeast("curriculum top-tier score", context.curriculumTopTier.get("score"), 9.0),
            textCheck("learning YAML section card SSOT", "docs/skills/architecture/learning-yaml-contract.md", "섹션 단위 학습카드"),
            textCheck("browser learning card proof", "tests/verifyLearningCardPlaywright.py", "desktopOverview"),
            textCheck("exercise check dispatch", "src/codaro/curriculum/exerciseCheck.py", "runExerciseCheck"),
        )),
        domain("teacher-model-loop", (
            textCheck("NIST RMF source mapped", "objectiveNinePlusScorecard.md", "NIST AI Risk Management Framework"),
            artifactPassed("live smoke report", context.liveSmoke),
            liveCasePassed(context, "clarification-before-provider"),
            liveCasePassed(context, "live-tool-loop"),
            liveCasePassed(context, "live-cell-call-loop"),
            liveSignal(context, "live-tool-loop", "contractGapCount", 0),
            liveSignal(context, "live-cell-call-loop", "policyViolationCount", 0),
            textCheck("teacher score threshold", "src/codaro/ai/teacher/evalHarness.py", "MINIMUM_TEACHER_EVAL_SCORE = 9.0"),
            textCheck("tool result continuation", "src/codaro/ai/teacher/providerLoop.py", "codaroNextRequiredTool"),
        )),
        domain("automation-ide", (
            artifactPassed("automation IDE report", context.automation),
            scoreAtLeast("automation IDE score", context.automation.get("score"), 9.0),
            gatePassed(context, "automation-ide-audit"),
            textCheck("automation objective docs", "docs/skills/ops/product/service-candidate.md", "자동화 IDE 품질"),
            textCheck("task runner E-Stop guard", "src/codaro/automation/taskRunner.py", "except EmergencyStopActive as exc"),
            textCheck("task runner audit", "src/codaro/automation/taskRunner.py", "\"taskRun\""),
            textCheck("automation frontend surface", "editor/src/components/automation/automationSurface.tsx", "automation.task.standard.title"),
            textCheck("workflow DAG", "src/codaro/automation/workflow.py", "dependsOn"),
        )),
        domain("release-operations", (
            gatePassed(context, "install-launcher-smoke"),
            artifactPassed("install launcher report", context.installLauncher),
            gatePassed(context, "launcher-test"),
            gatePassed(context, "landing-build"),
            gatePassed(context, "docs"),
            textCheck("exact artifact boundary", "tests/verifyInstallLauncherSmoke.py", "exact wheel"),
            textCheck("rollback evidence", "tests/verifyInstallLauncherSmoke.py", "rollback-marker.json"),
            textCheck("release quality docs", "docs/skills/ops/product/service-candidate.md", "설치/실행/런처"),
        )),
        domain("accessibility-ux", (
            textCheck("WCAG 2.2 source mapped", "objectiveNinePlusScorecard.md", "W3C WCAG 2.2 Recommendation"),
            gatePassed(context, "provider-settings-browser"),
            gatePassed(context, "onboarding-browser"),
            gatePassed(context, "runtime-recovery-browser"),
            artifactSignal(context.providerSettings, "desktopVisualIntegrity", True, "provider settings desktop visual integrity"),
            artifactSignal(context.providerSettings, "mobileVisualIntegrity", True, "provider settings mobile visual integrity"),
            artifactSignal(context.onboarding, "providerFallbackBeforeReady", True, "onboarding fallback before ready"),
            textCheck("Korean product locale", "editor/src/lib/localeCopy.ts", "자동화 루틴"),
            textCheck("copy labels", "editor/src/components/app/topBar.tsx", "data-diagnostic-export-copy"),
        )),
        domain("security-privacy-safety", (
            textCheck("ACM ethics source mapped", "objectiveNinePlusScorecard.md", "ACM/IEEE Software Engineering Code of Ethics"),
            artifactPassed("diagnostic summary report", context.diagnostic),
            artifactSignal(context.diagnostic, "providerErrorRedactionCovered", True, "provider redaction covered"),
            artifactSignal(context.diagnostic, "onboardingExportCovered", True, "diagnostic export covered"),
            textCheck("diagnostic redaction", "src/codaro/system/diagnosticSummary.py", "safeDiagnosticValue"),
            textCheck("E-Stop backend", "src/codaro/automation/eStop.py", "EmergencyStopActive"),
            textCheck("input policy", "src/codaro/automation/input/inputGuard.py", "allowedScreenRegion"),
            liveSelectionCredential(context),
        )),
        domain("observability-qa", (
            qualityCycleLogsPresent(context),
            artifactPassed("dogfood report", context.dogfood),
            artifactPassed("diagnostic report", context.diagnostic),
            artifactPassed("frontend performance report", context.frontendPerf),
            liveSignal(context, "live-tool-loop", "workloopReadable", True),
            liveSignal(context, "live-cell-call-loop", "workloopReadable", True),
            textCheck("runner command logs", "tests/run.py", "commandLogSummaries"),
            textCheck("objective verifier output", "tests/verifyObjectiveNinePlusScorecard.py", "objective-nineplus-report.json"),
        )),
        domain("objective-evidence-integrity", (
            trackedWorktreeClean(),
            qualityCycleHeadMatches(context),
            qualityCycleTotalGateCount(context),
            qualityCycleSoftFailureZero(context),
            textCheck("scorecard file exists", "objectiveNinePlusScorecard.md", "모든 분야 `score >= 9.0`"),
            textAbsent("no stale checklist failure line", "goalNinePlusChecklist.md", "최신 목표 감사: `verifyLearningGoalObjectiveAudit.py` 실패"),
            textAbsent("no stale open checklist boxes", "goalNinePlusChecklist.md", "- [ ]"),
            textCheck("goal audit requires scorecard", "tests/verifyLearningGoalObjectiveAudit.py", "objective-nineplus-scorecard"),
        )),
    ]


def domain(domainId: str, checks: tuple[CheckResult, ...]) -> dict[str, Any]:
    passed = sum(1 for check in checks if check.passed)
    score = round((passed / len(checks)) * 10, 2) if checks else 0
    failures = [
        {"label": check.label, "detail": check.detail}
        for check in checks
        if not check.passed
    ]
    return {
        "id": domainId,
        "score": score,
        "maxScore": 10,
        "minimumScore": MINIMUM_DOMAIN_SCORE,
        "passed": score >= MINIMUM_DOMAIN_SCORE and not failures,
        "evidence": [
            {"label": check.label, "detail": check.detail}
            for check in checks
            if check.passed
        ],
        "requirementFailures": failures,
    }


def qualityCycleCheck(context: AuditContext) -> CheckResult:
    payload = context.qualityCycle
    passed = (
        payload.get("sequence") == "quality-cycle"
        and payload.get("passed") is True
        and payload.get("completedGateCount") == len(PRODUCT_QUALITY_GATES)
        and payload.get("totalGateCount") == len(PRODUCT_QUALITY_GATES)
        and payload.get("softFailureCount") == 0
    )
    return CheckResult("quality-cycle summary passed", passed, f"quality-cycle completed {len(PRODUCT_QUALITY_GATES)}/{len(PRODUCT_QUALITY_GATES)} with softFailureCount 0" if passed else "quality-cycle summary missing or not fully passed")


def gatePassed(context: AuditContext, gateName: str) -> CheckResult:
    gate = context.gate(gateName)
    passed = isinstance(gate, dict) and gate.get("returnCode") == 0 and gate.get("commandReturnCode") == 0 and gate.get("artifactFailure") is False
    return CheckResult(f"quality-cycle gate {gateName}", passed, f"{gateName} passed in latest quality-cycle" if passed else f"{gateName} not passed in latest quality-cycle")


def artifactPassed(label: str, payload: dict[str, Any]) -> CheckResult:
    passed = payload.get("passed") is True and payload.get("status") == "passed"
    return CheckResult(label, passed, "artifact status passed" if passed else "artifact missing or not passed")


def scoreAtLeast(label: str, value: Any, minimum: float) -> CheckResult:
    passed = isinstance(value, (int, float)) and value >= minimum
    return CheckResult(label, passed, f"score {value} >= {minimum}" if passed else f"score {value!r} < {minimum}")


def liveCasePassed(context: AuditContext, caseId: str) -> CheckResult:
    case = liveCase(context, caseId)
    passed = isinstance(case, dict) and case.get("passed") is True and case.get("status") == "passed"
    return CheckResult(f"live smoke case {caseId}", passed, f"{caseId} passed" if passed else f"{caseId} missing or failed")


def liveSignal(context: AuditContext, caseId: str, key: str, expected: Any) -> CheckResult:
    case = liveCase(context, caseId)
    signals = case.get("signals") if isinstance(case, dict) else None
    actual = signals.get(key) if isinstance(signals, dict) else None
    passed = actual == expected
    return CheckResult(f"{caseId}.{key}", passed, f"{key}: {expected!r}" if passed else f"{key}: expected {expected!r}, got {actual!r}")


def liveCase(context: AuditContext, caseId: str) -> dict[str, Any] | None:
    cases = context.liveSmoke.get("cases")
    if not isinstance(cases, list):
        return None
    for case in cases:
        if isinstance(case, dict) and case.get("caseId") == caseId:
            return case
    return None


def liveSelectionCredential(context: AuditContext) -> CheckResult:
    selection = context.liveSmoke.get("selection")
    credentialMissing = selection.get("credentialMissing") if isinstance(selection, dict) else None
    provider = selection.get("provider") if isinstance(selection, dict) else None
    passed = credentialMissing is False and isinstance(provider, str) and bool(provider)
    return CheckResult("live provider credential present", passed, f"provider {provider}" if passed else "live credential missing or provider absent")


def artifactSignal(payload: dict[str, Any], key: str, expected: Any, label: str) -> CheckResult:
    signals = payload.get("signals")
    summary = payload.get("summary")
    if isinstance(signals, dict) and key in signals:
        actual = signals.get(key)
    elif isinstance(summary, dict) and key in summary:
        actual = summary.get(key)
    else:
        actual = payload.get(key)
    passed = actual == expected
    return CheckResult(label, passed, f"{key}: {expected!r}" if passed else f"{key}: expected {expected!r}, got {actual!r}")


def playwrightRuntimeSamplesPassed(context: AuditContext) -> CheckResult:
    payload = context.playwrightCurriculumRuntime
    sampleCount = payload.get("sampleCount")
    passedCount = payload.get("samplePassedCount")
    failureCount = payload.get("failureCount")
    passed = (
        isinstance(sampleCount, int)
        and isinstance(passedCount, int)
        and sampleCount >= 88
        and passedCount == sampleCount
        and failureCount == 0
    )
    if passed:
        detail = f"{passedCount}/{sampleCount} Playwright curriculum samples passed"
    else:
        detail = f"samplePassedCount {passedCount!r}, sampleCount {sampleCount!r}, failureCount {failureCount!r}"
    return CheckResult("Playwright curriculum samples executed", passed, detail)


def qualityCycleLogsPresent(context: AuditContext) -> CheckResult:
    gates = context.qualityCycle.get("gates")
    if not isinstance(gates, list):
        return CheckResult("quality-cycle command logs", False, "missing gates array")
    missing = []
    for gate in gates:
        if not isinstance(gate, dict):
            missing.append("invalid gate summary")
            continue
        logs = gate.get("logs")
        if not isinstance(logs, list) or not logs:
            missing.append(str(gate.get("gate")))
            continue
        for log in logs:
            if not isinstance(log, dict) or log.get("exists") is not True or log.get("fresh") is not True or not isinstance(log.get("bytes"), int) or log.get("bytes", 0) <= 0:
                missing.append(str(gate.get("gate")))
                break
    return CheckResult("quality-cycle command logs", not missing, "all gates have fresh non-empty logs" if not missing else "missing/failing logs: " + ", ".join(missing[:8]))


def qualityCycleHeadMatches(context: AuditContext) -> CheckResult:
    artifactHead = context.qualityCycle.get("gitHead")
    passed = isinstance(artifactHead, str) and isinstance(context.currentHead, str) and gitHeadsMatch(artifactHead, context.currentHead)
    return CheckResult("quality-cycle current HEAD", passed, f"{artifactHead}" if passed else f"expected {context.currentHead}, got {artifactHead}")


def qualityCycleTotalGateCount(context: AuditContext) -> CheckResult:
    passed = context.qualityCycle.get("totalGateCount") == len(PRODUCT_QUALITY_GATES)
    return CheckResult("quality-cycle gate count", passed, f"{len(PRODUCT_QUALITY_GATES)} gates" if passed else f"expected {len(PRODUCT_QUALITY_GATES)}, got {context.qualityCycle.get('totalGateCount')!r}")


def qualityCycleSoftFailureZero(context: AuditContext) -> CheckResult:
    passed = context.qualityCycle.get("softFailureCount") == 0
    return CheckResult("quality-cycle soft failure count", passed, "softFailureCount 0" if passed else f"softFailureCount {context.qualityCycle.get('softFailureCount')!r}")


def trackedWorktreeClean() -> CheckResult:
    result = subprocess.run(
        ("git", "status", "--porcelain=v1", "--untracked-files=no"),
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    clean = result.returncode == 0 and not result.stdout.strip()
    return CheckResult("tracked worktree clean", clean, "tracked worktree clean" if clean else result.stdout.strip()[:500])


def textCheck(label: str, relPath: str, needle: str) -> CheckResult:
    path = ROOT / relPath
    if not path.is_file():
        return CheckResult(label, False, f"{relPath} missing")
    text = path.read_text(encoding="utf-8")
    passed = needle in text
    return CheckResult(label, passed, f"{relPath}: {needle}" if passed else f"{relPath}: missing {needle}")


def textAbsent(label: str, relPath: str, needle: str) -> CheckResult:
    path = ROOT / relPath
    if not path.is_file():
        return CheckResult(label, False, f"{relPath} missing")
    text = path.read_text(encoding="utf-8")
    passed = needle not in text
    return CheckResult(label, passed, f"{relPath}: absent {needle}" if passed else f"{relPath}: stale token remains {needle}")


def readJson(relPath: str) -> dict[str, Any]:
    path = ROOT / relPath
    if not path.is_file():
        return {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, UnicodeDecodeError):
        return {}
    return payload if isinstance(payload, dict) else {}


def currentGitHead() -> str | None:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip() if result.returncode == 0 else None


def gitHeadsMatch(actual: str, expected: str) -> bool:
    return actual == expected or actual.startswith(expected) or expected.startswith(actual)


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def displayPath(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


if __name__ == "__main__":
    raise SystemExit(main())
