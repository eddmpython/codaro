from __future__ import annotations

from datetime import UTC, datetime
import json
import subprocess
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DIAGNOSTIC_SUMMARY_REPORT_PATH = ROOT / "output" / "test-runner" / "diagnostic-summary-contract" / "diagnostic-summary-report.json"


CHECKS = (
    (
        "src/codaro/system/diagnosticSummary.py",
        (
            "DIAGNOSTIC_CATEGORIES",
            "\"provider\", \"runtime\", \"package\", \"frontend\"",
            "buildDiagnosticSummary",
            "buildDiagnosticExport",
            "safeDiagnosticValue",
            "safeDiagnosticText",
            "readableDiagnosticAction",
            "readableDiagnosticSummaryText",
            "summaryText",
            "readableActions",
            "codaro-local-diagnostic-export",
            "itemFromProviderDiagnostic",
            "providerDiagnosticItem",
            "runtimeDiagnosticItem",
            "packageDiagnosticItem",
            "frontendDiagnosticItem",
            "SECRET_KEYS",
        ),
    ),
    (
        "src/codaro/ai/providerErrors.py",
        (
            "safeDiagnosticText",
            "safeProviderDetail",
        ),
    ),
    (
        "src/codaro/api/systemRouter.py",
        (
            "/api/system/diagnostics",
            "/api/system/diagnostics/export",
            "buildLocalDiagnosticSummary",
            "buildLocalDiagnosticExport",
            "_diagnosticExportContext",
            "_providerDiagnostics",
            "_packageDiagnostics",
            "_runtimeDiagnostics",
            "_frontendDiagnostics",
        ),
    ),
    (
        "editor/src/lib/api.ts",
        (
            "systemDiagnostics",
            "/api/system/diagnostics",
            "systemDiagnosticsExport",
            "/api/system/diagnostics/export",
            "DiagnosticSummary",
            "DiagnosticExportPayload",
        ),
    ),
    (
        "editor/src/App.tsx",
        (
            "systemDiagnosticsExport",
            "copyDiagnosticExport",
            "writeClipboardText",
        ),
    ),
    (
        "editor/src/lib/appBootstrap.ts",
        (
            "systemDiagnostics",
            "diagnosticNoticeFromSummary",
            "시작 진단 필요",
            "summary.summaryText",
            "readableDiagnosticAction",
            "connect-provider",
        ),
    ),
    (
        "editor/src/components/app/topBar.tsx",
        (
            "showStatusNotice",
            "notice.tone === \"warning\"",
            "text-amber-500",
            "data-diagnostic-export-copy",
            "진단 복사",
        ),
    ),
    (
        "editor/src/types.ts",
        (
            "DiagnosticSummary",
            "DiagnosticExportPayload",
            "DiagnosticCategory",
            "\"provider\" | \"runtime\" | \"package\" | \"frontend\"",
            "codaro-local-diagnostic-export",
        ),
    ),
    (
        "tests/testDiagnosticSummary.py",
        (
            "testDiagnosticSummarySeparatesFailureCategoriesAndActions",
            "testDiagnosticSummaryRedactsSecretsInTextAndMetadata",
            "testDiagnosticRedactionPreservesSafeSecretConfiguredState",
            "testDiagnosticSummaryProvidesReadableOkState",
            "testDiagnosticExportPackagesRedactedSummaryAndContext",
            "testProviderDetailUsesSharedDiagnosticRedaction",
            "testProviderDiagnosticItemUsesSharedPayloadContract",
            "Bearer [redacted]",
            "\"access_token\":\"[redacted]\"",
            "summaryText",
            "readableActions",
        ),
    ),
    (
        "tests/testServerApi.py",
        (
            "testSystemDiagnosticsEndpointSeparatesFailuresAndRedactsSecrets",
            "testSystemDiagnosticsExportEndpointProvidesShareableRedactedPayload",
            "/api/system/diagnostics",
            "/api/system/diagnostics/export",
            "configure-base-url",
        ),
    ),
    (
        "tests/verifyOnboardingPlaywright.py",
        (
            "진단 복사",
            "diagnostic-export-copy-ok",
            "GET /api/system/diagnostics/export",
            "codaro-local-diagnostic-export",
        ),
    ),
    (
        "docs/skills/ops/product/service-candidate.md",
        (
            "local diagnostic summary",
            "local diagnostic export",
            "부트스트랩은 `/api/system/diagnostics`를 읽어 시작 진단 안내를 제품 상단 상태로 보여준다",
            "`/api/system/diagnostics/export`",
            "`진단 복사`",
            "provider failure, runtime failure, package failure, frontend failure",
            "token/API key/secret은 diagnostic summary/export와 로그에 남기지 않는다",
        ),
    ),
    (
        "docs/skills/architecture/ssot-map.md",
        (
            "diagnostic summary",
            "diagnostic export",
            "src/codaro/system/diagnosticSummary.py",
        ),
    ),
)


def main() -> int:
    missing: list[str] = []
    startedAt = utcTimestamp()
    started = time.monotonic()
    results: list[dict[str, object]] = []
    for relPath, needles in CHECKS:
        path = ROOT / relPath
        if not path.exists():
            missing.append(f"{relPath}: missing file")
            results.append({
                "path": relPath,
                "passed": False,
                "foundCount": 0,
                "missing": [f"missing file {relPath}"],
            })
            continue
        text = path.read_text(encoding="utf-8")
        fileMissing: list[str] = []
        for needle in needles:
            if needle not in text:
                fileMissing.append(needle)
                missing.append(f"{relPath}: missing {needle}")
        results.append({
            "path": relPath,
            "passed": not fileMissing,
            "foundCount": len(needles) - len(fileMissing),
            "missing": fileMissing,
        })
    payload = {
        "gate": "diagnostic-summary-contract",
        "passed": not missing,
        "status": "passed" if not missing else "failed",
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "reportPath": reportDisplayPath(DIAGNOSTIC_SUMMARY_REPORT_PATH),
        "summary": diagnosticContractSummary(results),
        "results": results,
        "failures": missing,
    }
    writeDiagnosticSummaryReport(payload)
    if missing:
        for item in missing:
            print(f"FAIL: {item}", file=sys.stderr)
        return 1
    print("ok: diagnostic summary contract is aligned")
    return 0


def diagnosticContractSummary(results: list[dict[str, object]]) -> dict[str, object]:
    paths = [str(result["path"]) for result in results]
    return {
        "allChecksPassed": all(bool(result["passed"]) for result in results),
        "checkedFileCount": len(results),
        "checkedPaths": paths,
        "categoryContractCovered": "src/codaro/system/diagnosticSummary.py" in paths,
        "providerErrorRedactionCovered": "src/codaro/ai/providerErrors.py" in paths,
        "systemEndpointsCovered": "src/codaro/api/systemRouter.py" in paths,
        "frontendNoticeCovered": "editor/src/components/app/topBar.tsx" in paths,
        "onboardingExportCovered": "tests/verifyOnboardingPlaywright.py" in paths,
        "docsCovered": "docs/skills/ops/product/service-candidate.md" in paths,
    }


def writeDiagnosticSummaryReport(payload: dict[str, object]) -> Path:
    DIAGNOSTIC_SUMMARY_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    DIAGNOSTIC_SUMMARY_REPORT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return DIAGNOSTIC_SUMMARY_REPORT_PATH


def reportDisplayPath(reportPath: Path) -> str:
    try:
        return str(reportPath.relative_to(ROOT))
    except ValueError:
        return str(reportPath)


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


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


if __name__ == "__main__":
    raise SystemExit(main())
