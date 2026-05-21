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
            "safeDiagnosticValue",
            "safeDiagnosticText",
            "itemFromProviderDiagnostic",
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
        "tests/testDiagnosticSummary.py",
        (
            "testDiagnosticSummarySeparatesFailureCategoriesAndActions",
            "testDiagnosticSummaryRedactsSecretsInTextAndMetadata",
            "testProviderDetailUsesSharedDiagnosticRedaction",
            "Bearer [redacted]",
            "\"access_token\":\"[redacted]\"",
        ),
    ),
    (
        "docs/skills/ops/product/service-candidate.md",
        (
            "local diagnostic summary",
            "provider failure, runtime failure, package failure, frontend failure",
            "token/API key/secret은 diagnostic summary와 로그에 남기지 않는다",
        ),
    ),
    (
        "docs/skills/architecture/ssot-map.md",
        (
            "diagnostic summary",
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
