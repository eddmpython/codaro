from __future__ import annotations

import json
import subprocess
import sys
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
REPORT_PATH = ROOT / "output" / "test-runner" / "public-readiness-audit" / "public-readiness-report.json"
MINIMUM_DOMAIN_SCORE = 9.0
PRODUCT_QUALITY_GATE_COUNT = 20

REFERENCE_SOURCES = {
    "nistSsdf": "https://csrc.nist.gov/pubs/sp/800/218/final",
    "owaspAsvs": "https://owasp.org/www-project-application-security-verification-standard/",
    "cisaSecureByDesign": "https://www.cisa.gov/securebydesign",
    "openssfScorecard": "https://openssf.org/scorecard/",
    "slsa": "https://slsa.dev/",
    "spdxSbom": "https://spdx.dev/about/overview/",
    "wcag22": "https://www.w3.org/TR/WCAG22/",
    "githubSecurityPolicy": "https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository",
}


@dataclass(frozen=True)
class CheckResult:
    label: str
    passed: bool
    detail: str


class AuditContext:
    def __init__(self) -> None:
        self.startedAt = utcTimestamp()
        self.currentHead = currentGitHead()
        self.qualityCycle = readJson("output/test-runner/quality-cycle/sequence-summary.json")
        self.objectiveNineplus = readJson("output/test-runner/objective-nineplus-audit/objective-nineplus-report.json")
        self.diagnostic = readJson("output/test-runner/diagnostic-summary-contract/diagnostic-summary-report.json")
        self.automation = readJson("output/test-runner/automation-ide-audit/automation-ide-report.json")
        self.providerSettings = readJson("output/test-runner/provider-settings-browser/provider-settings-report.json")
        self.onboarding = readJson("output/test-runner/onboarding-browser/onboarding-report.json")
        self.installLauncher = readJson("output/test-runner/install-launcher-smoke/install-launcher-report.json")
        self.runtimeRecovery = readJson("output/test-runner/runtime-recovery-browser/runtime-recovery-report.json")

    def gate(self, gateName: str) -> dict[str, Any] | None:
        gates = self.qualityCycle.get("gates")
        if not isinstance(gates, list):
            return None
        for gate in gates:
            if isinstance(gate, dict) and gate.get("gate") == gateName:
                return gate
        return None


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
        "gate": "public-readiness-audit",
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
        print("FAIL: public readiness scorecard has domains below 9.0", file=sys.stderr)
        return 1
    print(f"ok: public readiness scorecard {overallScore}/10 across {len(domains)} domains")
    return 0


def buildDomains(context: AuditContext) -> list[dict[str, Any]]:
    return [
        domain("public-security", (
            textCheck("security policy reporting path", "SECURITY.md", "Reporting a Vulnerability"),
            textCheck("security policy safe harbor", "SECURITY.md", "Safe Harbor"),
            textCheck("security policy response targets", "SECURITY.md", "Response Targets"),
            textCheck("NIST SSDF baseline", "SECURITY.md", REFERENCE_SOURCES["nistSsdf"]),
            textCheck("OWASP ASVS baseline", "SECURITY.md", REFERENCE_SOURCES["owaspAsvs"]),
            textCheck("CISA secure by design baseline", "SECURITY.md", REFERENCE_SOURCES["cisaSecureByDesign"]),
            textCheck("CodeQL workflow", ".github/workflows/security.yml", "github/codeql-action"),
            textCheck("dependency review workflow", ".github/workflows/security.yml", "actions/dependency-review-action"),
            textCheck("OpenSSF Scorecard workflow", ".github/workflows/security.yml", "ossf/scorecard-action"),
            textCheck("diagnostic redaction implementation", "src/codaro/system/diagnosticSummary.py", "safeDiagnosticValue"),
        )),
        domain("privacy-data-boundary", (
            textCheck("privacy local-first", "PRIVACY.md", "local-first"),
            textCheck("privacy telemetry default", "PRIVACY.md", "Telemetry"),
            textCheck("privacy provider boundary", "PRIVACY.md", "Provider"),
            textCheck("privacy diagnostic export", "PRIVACY.md", "Diagnostic export"),
            textCheck("secret store implementation", "src/codaro/ai/secrets.py", "SecretStore"),
            artifactPassed("diagnostic summary report", context.diagnostic),
            artifactSignal(context.diagnostic, "providerErrorRedactionCovered", True, "provider redaction covered"),
            artifactSignal(context.diagnostic, "onboardingExportCovered", True, "diagnostic export covered"),
            textCheck("diagnostic redaction tests", "tests/testDiagnosticSummary.py", "sk-directsecret123456"),
            textCheck("diagnostic export type", "editor/src/types.ts", "codaro-local-diagnostic-export"),
        )),
        domain("supply-chain-release", (
            textCheck("Dependabot config", ".github/dependabot.yml", "github-actions"),
            textCheck("Dependabot Python", ".github/dependabot.yml", "package-ecosystem: \"pip\""),
            textCheck("Dependabot editor npm", ".github/dependabot.yml", "directory: \"/editor\""),
            textCheck("Dependabot landing npm", ".github/dependabot.yml", "directory: \"/landing\""),
            textCheck("Dependabot cargo", ".github/dependabot.yml", "directory: \"/launcher/codaro-launcher\""),
            textCheck("Product release workflow", ".github/workflows/product-release.yml", "Product Release"),
            textCheck("Product release exact wheel", ".github/workflows/product-release.yml", "release-assets/codaro-*.whl"),
            textCheck("Product release SPDX SBOM", ".github/workflows/product-release.yml", "codaro.spdx.json"),
            textCheck("Launcher checksum", ".github/workflows/launcher-release.yml", "CodaroLauncher.exe.sha256"),
            textCheck("Launcher SPDX SBOM", ".github/workflows/launcher-release.yml", "CodaroLauncher.spdx.json"),
            artifactPassed("install launcher report", context.installLauncher),
        )),
        domain("support-incident-response", (
            textCheck("support doc exists", "SUPPORT.md", "Where to Ask"),
            textCheck("support separates security", "SUPPORT.md", "Security Policy"),
            textCheck("support diagnostic command", "SUPPORT.md", "diagnostic-summary-contract"),
            textCheck("security incident response target", "SECURITY.md", "Triage decision"),
            textCheck("public release incident response", "docs/skills/ops/release/public-release.md", "Support and Incident Response"),
            textCheck("bug issue template", ".github/ISSUE_TEMPLATE/bug_report.yml", "Diagnostic context"),
            textCheck("bug template redaction", ".github/ISSUE_TEMPLATE/bug_report.yml", "I removed tokens"),
            artifactPassed("runtime recovery report", context.runtimeRecovery),
            artifactSignal(context.runtimeRecovery, "packageFailureShownNearCell", True, "package failure recovery visible"),
            artifactSignal(context.runtimeRecovery, "cellFailureShownNearCell", True, "cell failure recovery visible"),
        )),
        domain("public-docs-onboarding", (
            textCheck("README security link", "README.md", "SECURITY.md"),
            textCheck("README privacy link", "README.md", "PRIVACY.md"),
            textCheck("README support link", "README.md", "SUPPORT.md"),
            textCheck("README public checklist link", "README.md", "publicReadinessChecklist.md"),
            textCheck("README launch kit link", "README.md", "launchKit.md"),
            textCheck("public checklist completion rule", "publicReadinessChecklist.md", "Completion Rule"),
            textAbsent("public checklist has no open boxes", "publicReadinessChecklist.md", "- [ ]"),
            textCheck("contributing public readiness gate", "CONTRIBUTING.md", "public-readiness-audit"),
            textCheck("conduct enforcement", "CODE_OF_CONDUCT.md", "Enforcement"),
            textCheck("skills index includes public release", "docs/skills/README.md", "public-release"),
            textCheck("ops index includes public release", "docs/skills/ops/README.md", "release/public-release.md"),
            textCheck("launch kit positioning", "launchKit.md", "First Five Minutes"),
            textCheck("launch playbook exists", "docs/skills/ops/release/launch-playbook.md", "Required Launch Assets"),
            textCheck("quickstart exists", "demos/publicLaunch/fiveMinuteQuickstart.md", "Five Minute Quickstart"),
            textCheck("video storyboard exists", "demos/publicLaunch/videoStoryboard.md", "Video Storyboard"),
            scriptOutputContains("expense summary demo runs", "demos/publicLaunch/expenseSummaryDemo.py", ("expense summary", "top category")),
            scriptOutputContains("file organizer demo runs", "demos/publicLaunch/fileOrganizerDemo.py", ("safe file organizer", "mode: dry-run")),
        )),
        domain("accessibility-user-safety", (
            textCheck("WCAG 2.2 baseline", "docs/skills/ops/release/public-release.md", REFERENCE_SOURCES["wcag22"]),
            gatePassed(context, "provider-settings-browser"),
            gatePassed(context, "onboarding-browser"),
            gatePassed(context, "runtime-recovery-browser"),
            artifactSignal(context.providerSettings, "desktopVisualIntegrity", True, "provider settings desktop visual integrity"),
            artifactSignal(context.providerSettings, "mobileVisualIntegrity", True, "provider settings mobile visual integrity"),
            artifactSignal(context.onboarding, "providerFallbackBeforeReady", True, "onboarding fallback before ready"),
            artifactPassed("automation report", context.automation),
            textCheck("automation E-Stop", "src/codaro/automation/eStop.py", "EmergencyStopActive"),
            textCheck("automation input guard", "src/codaro/automation/input/inputGuard.py", "allowedScreenRegion"),
        )),
        domain("objective-evidence-integrity", (
            trackedWorktreeClean(),
            qualityCyclePassed(context),
            qualityCycleHeadMatches(context),
            qualityCycleSoftFailureZero(context),
            objectiveNineplusPassed(context),
            objectiveNineplusHeadMatches(context),
            textCheck("public release stop rule", "docs/skills/ops/release/public-release.md", "Release Stop Rule"),
            textCheck("gate docs mention public readiness", "docs/skills/ops/foundation/testing-and-gates.md", "`public-readiness-audit`"),
            textCheck("runner exposes public readiness", "tests/run.py", "public-readiness-audit"),
            textCheck("checklist references report", "publicReadinessChecklist.md", "public-readiness-report.json"),
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


def qualityCyclePassed(context: AuditContext) -> CheckResult:
    payload = context.qualityCycle
    passed = (
        payload.get("sequence") == "quality-cycle"
        and payload.get("passed") is True
        and payload.get("completedGateCount") == PRODUCT_QUALITY_GATE_COUNT
        and payload.get("totalGateCount") == PRODUCT_QUALITY_GATE_COUNT
    )
    return CheckResult("quality-cycle passed", passed, f"quality-cycle {PRODUCT_QUALITY_GATE_COUNT}/{PRODUCT_QUALITY_GATE_COUNT} passed" if passed else "quality-cycle missing, stale, or incomplete")


def qualityCycleHeadMatches(context: AuditContext) -> CheckResult:
    artifactHead = context.qualityCycle.get("gitHead")
    passed = isinstance(artifactHead, str) and isinstance(context.currentHead, str) and gitHeadsMatch(artifactHead, context.currentHead)
    return CheckResult("quality-cycle current HEAD", passed, f"{artifactHead}" if passed else f"expected {context.currentHead}, got {artifactHead}")


def qualityCycleSoftFailureZero(context: AuditContext) -> CheckResult:
    passed = context.qualityCycle.get("softFailureCount") == 0
    return CheckResult("quality-cycle soft failure count", passed, "softFailureCount 0" if passed else f"softFailureCount {context.qualityCycle.get('softFailureCount')!r}")


def objectiveNineplusPassed(context: AuditContext) -> CheckResult:
    payload = context.objectiveNineplus
    passed = (
        payload.get("gate") == "objective-nineplus-audit"
        and payload.get("passed") is True
        and payload.get("status") == "passed"
        and isinstance(payload.get("score"), (int, float))
        and payload.get("score") >= MINIMUM_DOMAIN_SCORE
        and payload.get("failedDomains") == []
    )
    return CheckResult("objective-nineplus passed", passed, "objective-nineplus-audit passed" if passed else "objective-nineplus-audit missing or failed")


def objectiveNineplusHeadMatches(context: AuditContext) -> CheckResult:
    artifactHead = context.objectiveNineplus.get("gitHead")
    passed = isinstance(artifactHead, str) and isinstance(context.currentHead, str) and gitHeadsMatch(artifactHead, context.currentHead)
    return CheckResult("objective-nineplus current HEAD", passed, f"{artifactHead}" if passed else f"expected {context.currentHead}, got {artifactHead}")


def gatePassed(context: AuditContext, gateName: str) -> CheckResult:
    gate = context.gate(gateName)
    passed = isinstance(gate, dict) and gate.get("returnCode") == 0 and gate.get("commandReturnCode") == 0 and gate.get("artifactFailure") is False
    return CheckResult(f"quality-cycle gate {gateName}", passed, f"{gateName} passed in latest quality-cycle" if passed else f"{gateName} not passed in latest quality-cycle")


def artifactPassed(label: str, payload: dict[str, Any]) -> CheckResult:
    passed = payload.get("passed") is True and payload.get("status") == "passed"
    return CheckResult(label, passed, "artifact status passed" if passed else "artifact missing or not passed")


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
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as exc:
        return CheckResult(label, False, f"{relPath}: {exc}")
    passed = needle in text
    return CheckResult(label, passed, f"{relPath}: {needle}" if passed else f"{relPath}: missing {needle}")


def textAbsent(label: str, relPath: str, needle: str) -> CheckResult:
    path = ROOT / relPath
    if not path.is_file():
        return CheckResult(label, False, f"{relPath} missing")
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as exc:
        return CheckResult(label, False, f"{relPath}: {exc}")
    passed = needle not in text
    return CheckResult(label, passed, f"{relPath}: absent {needle}" if passed else f"{relPath}: stale token remains {needle}")


def scriptOutputContains(label: str, relPath: str, needles: tuple[str, ...]) -> CheckResult:
    path = ROOT / relPath
    if not path.is_file():
        return CheckResult(label, False, f"{relPath} missing")
    result = subprocess.run(
        (sys.executable, "-X", "utf8", str(path)),
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    output = f"{result.stdout}\n{result.stderr}"
    missing = [needle for needle in needles if needle not in output]
    passed = result.returncode == 0 and not missing
    detail = f"{relPath} output contains {', '.join(needles)}" if passed else f"exit {result.returncode}, missing: {', '.join(missing)}"
    return CheckResult(label, passed, detail)


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
