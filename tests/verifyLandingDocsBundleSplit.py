from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MAX_DOCS_NAV_BYTES = 80 * 1024
MAX_BUILT_DOCS_NAV_BYTES = 100 * 1024
MIN_DOC_PAGE_MODULES = 30


def main() -> int:
    results = (
        verifyGeneratedDocsNavIsMetadataOnly(),
        verifyDocsPageContentModules(),
        verifyDocsRouteLoadsContentOnDemand(),
        verifyPostbuildLoadsDocsContent(),
        verifyBuiltDocsNavChunk(),
    )
    failures = [result for result in results if not result["passed"]]
    payload = {
        "gate": "landing-docs-bundle-split",
        "passed": not failures,
        "results": results,
        "failures": failures,
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: landing docs bundle split is incomplete", file=sys.stderr)
        return 1
    print("ok: landing docs bundle split verified")
    return 0


def verifyGeneratedDocsNavIsMetadataOnly() -> dict[str, Any]:
    path = ROOT / "landing" / "src" / "lib" / "generated" / "docsNav.js"
    missing: list[str] = []
    if not path.exists():
        missing.append("missing generated docsNav.js")
        return result("generated-docs-nav", missing)
    text = path.read_text(encoding="utf-8")
    if path.stat().st_size > MAX_DOCS_NAV_BYTES:
        missing.append(f"docsNav.js exceeds {MAX_DOCS_NAV_BYTES} bytes")
    for forbidden in ('"html"', '"text"'):
        if forbidden in text:
            missing.append(f"docsNav.js still contains {forbidden}")
    for required in ("contentModule", "docsSections", "docsPages"):
        if required not in text:
            missing.append(f"docsNav.js missing {required}")
    return result("generated-docs-nav", missing, {"bytes": path.stat().st_size})


def verifyDocsPageContentModules() -> dict[str, Any]:
    path = ROOT / "landing" / "src" / "lib" / "generated" / "docsPages"
    missing: list[str] = []
    files = sorted(path.glob("page*.js")) if path.exists() else []
    if len(files) < MIN_DOC_PAGE_MODULES:
        missing.append(f"expected at least {MIN_DOC_PAGE_MODULES} docs page modules, found {len(files)}")
    if files and "export const pageContent" not in files[0].read_text(encoding="utf-8"):
        missing.append("docs page modules do not export pageContent")
    return result("docs-page-content-modules", missing, {"moduleCount": len(files)})


def verifyDocsRouteLoadsContentOnDemand() -> dict[str, Any]:
    path = ROOT / "landing" / "src" / "routes" / "docs" / "[...slug]" / "+page.js"
    return requireNeedles(
        "docs-route-on-demand-content",
        path,
        (
            "import.meta.glob",
            "../../../lib/generated/docsPages/*.js",
            "contentModule",
            "pageContent",
            "await loadContent()",
        ),
    )


def verifyPostbuildLoadsDocsContent() -> dict[str, Any]:
    path = ROOT / "landing" / "scripts" / "postbuild.js"
    return requireNeedles(
        "postbuild-docs-content-loading",
        path,
        (
            "docsPagesWithContent",
            "loadDocsPageContent",
            "docsPagesWithContent.map",
            "pageContent",
        ),
    )


def verifyBuiltDocsNavChunk() -> dict[str, Any]:
    path = ROOT / "landing" / ".svelte-kit" / "output" / "server" / "chunks" / "docsNav.js"
    missing: list[str] = []
    if not path.exists():
        missing.append("missing built docsNav server chunk; run landing build first")
        return result("built-docs-nav-chunk", missing)
    if path.stat().st_size > MAX_BUILT_DOCS_NAV_BYTES:
        missing.append(f"built docsNav chunk exceeds {MAX_BUILT_DOCS_NAV_BYTES} bytes")
    return result("built-docs-nav-chunk", missing, {"bytes": path.stat().st_size})


def requireNeedles(name: str, path: Path, needles: tuple[str, ...]) -> dict[str, Any]:
    missing: list[str] = []
    if not path.exists():
        missing.append(f"missing file {path.relative_to(ROOT)}")
        return result(name, missing)
    text = path.read_text(encoding="utf-8")
    for needle in needles:
        if needle not in text:
            missing.append(f"missing {needle}")
    return result(name, missing)


def result(name: str, missing: list[str], evidence: dict[str, Any] | None = None) -> dict[str, Any]:
    return {
        "id": name,
        "passed": not missing,
        "missing": missing,
        "evidence": evidence or {},
    }


if __name__ == "__main__":
    raise SystemExit(main())
