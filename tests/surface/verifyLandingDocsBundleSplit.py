from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
MAX_DOCS_NAV_BYTES = 80 * 1024
MAX_BUILT_DOCS_NAV_BYTES = 100 * 1024
MIN_DOC_PAGE_MODULES = 30


def main() -> int:
    results = (
        verifyGeneratedDocsNavIsMetadataOnly(),
        verifyDocsPageContentModules(),
        verifyGeneratedDocsFreshness(),
        verifyDocsRouteLoadsContentOnDemand(),
        verifyLandingHomeProductSeo(),
        verifyPostbuildLoadsDocsContent(),
        verifyBuiltDocsNavChunk(),
        verifyBuiltHomeSeoAndDownload(),
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


def verifyGeneratedDocsFreshness() -> dict[str, Any]:
    checks = (
        (
            "docs/skills/ops/foundation/testing-and-gates.md",
            ("product-quality-audit",),
            ("product-quality-audit",),
        ),
        (
            "docs/skills/ops/product/service-candidate.md",
            ("product-quality-audit", "시작 진단 안내"),
            ("product-quality-audit", "부트스트랩은 <code>/api/system/diagnostics</code>를 읽어 시작 진단 안내"),
        ),
    )
    generatedText = generatedDocsPageText()
    missing: list[str] = []
    for relPath, sourceNeedles, generatedNeedles in checks:
        sourcePath = ROOT / relPath
        if not sourcePath.exists():
            missing.append(f"missing source doc {relPath}")
            continue
        sourceText = sourcePath.read_text(encoding="utf-8")
        for needle in sourceNeedles:
            if needle not in sourceText:
                missing.append(f"{relPath} missing source needle {needle}")
        for needle in generatedNeedles:
            if needle not in generatedText:
                missing.append(f"generated docs missing {needle}")
    return result("generated-docs-freshness", missing)


def generatedDocsPageText() -> str:
    path = ROOT / "landing" / "src" / "lib" / "generated" / "docsPages"
    if not path.exists():
        return ""
    return "\n".join(file.read_text(encoding="utf-8") for file in sorted(path.glob("page*.js")))


def verifyDocsRouteLoadsContentOnDemand() -> dict[str, Any]:
    path = ROOT / "landing" / "src" / "routes" / "docsRoutes.jsx"
    return requireNeedles(
        "docs-route-on-demand-content",
        path,
        (
            "import.meta.glob",
            "../lib/generated/docsPages/*.js",
            "contentModule",
            "pageContent",
            "setContent(module.pageContent)",
        ),
    )


def verifyLandingHomeProductSeo() -> dict[str, Any]:
    checks = (
        (
            "landing/src/components/publicShell.jsx",
            (
                "brand.launcherDownloadUrl",
                "brand.launcherChecksumUrl",
                "brand.launcherSbomUrl",
                "brand.releaseUrl",
            ),
        ),
        (
            "landing/src/pages/home.jsx",
            (
                "Windows 로컬 앱 다운로드",
                "브라우저에서 시작",
                "brand.launcherDownloadUrl",
                "releaseLinks",
            ),
        ),
        (
            "landing/src/lib/brand.js",
            (
                "launcherDownloadUrl",
                "releases/latest/download/Codaro.exe",
                "launcherChecksumUrl",
                "launcherSbomUrl",
                "toSiteUrl",
            ),
        ),
        (
            "landing/index.html",
            (
                '"@type": "WebApplication"',
                '"name": "Codaro Web"',
                '"operatingSystem": "Any"',
                '"url": "https://eddmpython.github.io/codaro/run/"',
                '"@type": "SoftwareApplication"',
                '"name": "Codaro Local"',
                '"operatingSystem": "Windows 10, Windows 11"',
                '"downloadUrl": "https://github.com/eddmpython/codaro/releases/latest/download/Codaro.exe"',
            ),
        ),
        (
            "landing/src/styles.css",
            (
                ".pageShell",
                ".proseArticle",
                ".siteFooter",
            ),
        ),
        (
            "landing/src/styles/homeAstryx.css",
            (
                ".homeShell",
                ".homeProductHero",
                ".homeHeroActions",
                ".homeReleaseLinks",
            ),
        ),
        (
            "landing/src/main.jsx",
            ("./styles/homeAstryx.css",),
        ),
        (
            ".github/workflows/launcher-release.yml",
            (
                "workflow_dispatch",
                "Codaro.exe",
                "Codaro.exe.sha256",
                "Codaro.spdx.json",
                "launcher/target/release/Codaro.exe",
                "launcher/target/release/Codaro.exe.sha256",
                "launcher/target/release/Codaro.spdx.json",
                "fail_on_unmatched_files: true",
            ),
        ),
    )
    missing: list[str] = []
    for relPath, needles in checks:
        path = ROOT / relPath
        if not path.exists():
            missing.append(f"missing file {relPath}")
            continue
        text = path.read_text(encoding="utf-8")
        for needle in needles:
            if needle not in text:
                missing.append(f"{relPath} missing {needle}")
    workflowText = (ROOT / ".github/workflows/launcher-release.yml").read_text(encoding="utf-8")
    if "launcher/codaro-launcher/target/release" in workflowText:
        missing.append("launcher release workflow uses crate-local target path instead of workspace target path")
    sourceText = "\n".join(
        path.read_text(encoding="utf-8")
        for path in (ROOT / "landing" / "src").rglob("*")
        if path.suffix in {".css", ".jsx"} and path.is_file()
    )
    if "var(--accent)" in sourceText:
        missing.append("landing source still uses shadcn accent token as the brand emphasis color")
    return result("landing-home-product-seo", missing)


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


def verifyBuiltHomeSeoAndDownload() -> dict[str, Any]:
    path = ROOT / "landing" / "build" / "index.html"
    missing: list[str] = []
    if not path.exists():
        missing.append("missing built home page; run landing build first")
        return result("built-home-seo-download", missing)
    text = path.read_text(encoding="utf-8")
    for needle in (
        '"@type": "WebApplication"',
        '"url": "https://eddmpython.github.io/codaro/run/"',
        "https://github.com/eddmpython/codaro/releases/latest/download/Codaro.exe",
        "https://github.com/eddmpython/codaro/releases/latest/download/Codaro.exe.sha256",
        "https://github.com/eddmpython/codaro/releases/latest/download/codaro.spdx.json",
        "Python 학습과 개인 자동화 스튜디오 - Codaro",
        'rel="canonical" href="https://eddmpython.github.io/codaro/"',
    ):
        if needle not in text:
            missing.append(f"built index missing {needle}")
    if "https://eddmpython.github.io/codaro/codaro" in text:
        missing.append("built index contains duplicated GitHub Pages base path")
    return result("built-home-seo-download", missing, {"bytes": path.stat().st_size})


def verifyBuiltDocsNavChunk() -> dict[str, Any]:
    path = ROOT / "landing" / "build" / "assets"
    missing: list[str] = []
    files = sorted(path.glob("page*.js")) if path.exists() else []
    if len(files) < MIN_DOC_PAGE_MODULES:
        missing.append(f"expected at least {MIN_DOC_PAGE_MODULES} built docs page chunks, found {len(files)}")
        return result("built-docs-nav-chunk", missing)
    largest = max((file.stat().st_size for file in files), default=0)
    if largest > MAX_BUILT_DOCS_NAV_BYTES:
        missing.append(f"largest built docs page chunk exceeds {MAX_BUILT_DOCS_NAV_BYTES} bytes")
    return result("built-docs-nav-chunk", missing, {"moduleCount": len(files), "largestBytes": largest})


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
