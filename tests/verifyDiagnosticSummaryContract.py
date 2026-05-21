from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


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
        "docs/skills/ops/product/service-candidate.md",
        (
            "local diagnostic summary",
            "local diagnostic export",
            "부트스트랩은 `/api/system/diagnostics`를 읽어 시작 진단 안내를 제품 상단 상태로 보여준다",
            "`/api/system/diagnostics/export`",
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
    for relPath, needles in CHECKS:
        path = ROOT / relPath
        if not path.exists():
            missing.append(f"{relPath}: missing file")
            continue
        text = path.read_text(encoding="utf-8")
        for needle in needles:
            if needle not in text:
                missing.append(f"{relPath}: missing {needle}")
    if missing:
        for item in missing:
            print(f"FAIL: {item}", file=sys.stderr)
        return 1
    print("ok: diagnostic summary contract is aligned")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
