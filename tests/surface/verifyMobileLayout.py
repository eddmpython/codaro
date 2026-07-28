from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EDITOR = ROOT / "editor"
PUBLIC = EDITOR / "public"
SRC = EDITOR / "src"
INDEX = EDITOR / "index.html"
USE_MOBILE = SRC / "hooks" / "use-mobile.ts"

CORE_SURFACE_GROUPS = (
    ("notebook", (SRC / "components" / "notebook" / "notebookPanel.tsx",)),
    (
        "curriculum",
        (
            SRC / "components" / "curriculum" / "curriculumSurface.tsx",
            SRC / "components" / "curriculum" / "curriculumHome.tsx",
            SRC / "components" / "curriculum" / "curriculumOverview.tsx",
            SRC / "components" / "curriculum" / "curriculumSectionRenderer.tsx",
        ),
    ),
    ("main", (SRC / "components" / "app" / "mainSurface.tsx",)),
    ("sidebar", (SRC / "components" / "app" / "productSidebar.tsx",)),
)

RESPONSIVE_PREFIXES = ("sm:", "md:", "lg:", "xl:")


@dataclass
class CheckResult:
    name: str
    ok: bool
    detail: str


def runChecks() -> list[CheckResult]:
    results: list[CheckResult] = []
    results.append(checkIndexMeta())
    results.append(checkManifest())
    results.append(checkServiceWorker())
    results.append(checkUseMobileBreakpoint())
    results.append(checkResponsiveCoverage())
    results.append(checkNotebookInsertControls())
    results.append(checkNotebookSurfaceSsot())
    results.append(checkViewportInsetsHook())
    results.append(checkPrefersDarkHook())
    results.append(checkVitePwaConfig())
    return results


def checkIndexMeta() -> CheckResult:
    html = INDEX.read_text(encoding="utf-8")
    required = (
        'name="viewport"',
        "viewport-fit=cover",
        'name="theme-color"',
        'rel="manifest"',
        "apple-mobile-web-app-capable",
        "mobile-web-app-capable",
        "serviceWorker.register",
    )
    missing = [fragment for fragment in required if fragment not in html]
    return CheckResult(
        name="index-mobile-meta",
        ok=not missing,
        detail="all present" if not missing else f"missing: {', '.join(missing)}",
    )


def checkManifest() -> CheckResult:
    data = json.loads((PUBLIC / "manifest.json").read_text(encoding="utf-8"))
    required = ("name", "short_name", "start_url", "display", "icons", "theme_color")
    missing = [key for key in required if key not in data]
    iconsOk = bool(data.get("icons")) and any(
        icon.get("sizes") for icon in data.get("icons", []) if isinstance(icon, dict)
    )
    if not iconsOk:
        missing.append("icons[].sizes")
    return CheckResult(
        name="manifest-shape",
        ok=not missing,
        detail="ok" if not missing else f"missing: {', '.join(missing)}",
    )


def checkServiceWorker() -> CheckResult:
    sw = (PUBLIC / "serviceWorker.js").read_text(encoding="utf-8")
    legacyManifest = json.loads((PUBLIC / "serviceWorkerLegacyCaches.json").read_text(encoding="utf-8"))
    keywords = (
        "navigationNetworkFirst",
        "assetCacheFirst",
        "networkFirst",
        'scopedPath("api/")',
        'scopedPath("ws/")',
        "SHELL_CACHE",
        "RUNTIME_CACHE",
        "SCOPE_PATH",
        "migrateOwnedLegacyCaches",
        "writeMigrationReceipt",
        "ownedCacheKeys.has(key)",
    )
    missing = [keyword for keyword in keywords if keyword not in sw]
    if "LEGACY_CACHE_PREFIXES" in sw or "startsWith(prefix)" in sw:
        missing.append("exact owned-cache deletion")
    expectedLegacyKeys = {
        "codaro-curriculum",
        "codaro-runtime-v1",
        "codaro-runtime-v2",
        "codaro-shell-v2",
        "codaro-static-v1",
    }
    if (
        legacyManifest.get("schemaVersion") != 1
        or set(legacyManifest.get("ownedCacheKeys", [])) != expectedLegacyKeys
    ):
        missing.append("legacy cache manifest")
    return CheckResult(
        name="service-worker-strategies",
        ok=not missing,
        detail="navigation, asset, API, and exact owned-cache migration strategies separated"
        if not missing
        else f"missing: {', '.join(missing)}",
    )


def checkUseMobileBreakpoint() -> CheckResult:
    if not USE_MOBILE.exists():
        return CheckResult(name="use-mobile-hook", ok=False, detail="hook not found")
    source = USE_MOBILE.read_text(encoding="utf-8")
    match = re.search(r"MOBILE_BREAKPOINT\s*=\s*(\d+)", source)
    breakpoint_ok = match is not None
    return CheckResult(
        name="use-mobile-hook",
        ok=breakpoint_ok,
        detail=f"breakpoint detected px={match.group(1) if match else 'unknown'}",
    )


def checkResponsiveCoverage() -> CheckResult:
    findings: list[str] = []
    for label, paths in CORE_SURFACE_GROUPS:
        missingPaths = [path for path in paths if not path.exists()]
        if missingPaths:
            findings.append(f"{label}: missing {', '.join(path.name for path in missingPaths)}")
            continue
        source = "\n".join(path.read_text(encoding="utf-8") for path in paths)
        responsive = sum(source.count(prefix) for prefix in RESPONSIVE_PREFIXES)
        usesMobileHook = "useIsMobile" in source or "useMobile" in source or "use-mobile" in source
        if responsive == 0 and not usesMobileHook:
            findings.append(f"{label}: no responsive classes or mobile hook in responsibility modules")
    return CheckResult(
        name="surface-responsive",
        ok=not findings,
        detail="all core surfaces responsive" if not findings else "; ".join(findings),
    )


def checkNotebookInsertControls() -> CheckResult:
    path = SRC / "components" / "notebook" / "notebookPanel.tsx"
    source = path.read_text(encoding="utf-8")
    stylePath = SRC / "components" / "notebook" / "notebookPanel.css"
    styles = stylePath.read_text(encoding="utf-8")
    required = (
        "document.blocks.map((block, blockIndex)",
        "showInsertBefore={blockIndex === 0}",
        'className="notebookCellBody"',
        '"notebookInsertControl group/insert"',
        'className="notebookInsertPrimary"',
        'className="notebookInsertMenu"',
        'className="notebookAppendActions"',
        'data-notebook-cell-menu="true"',
        'key: "Shift-Enter"',
        "onRunAndAdvance",
    )
    missing = [fragment for fragment in required if fragment not in source]
    styleRequired = (
        ".notebookCellBody {",
        ".notebookFloatingTools {",
        ".notebookDocument {",
        ".notebookCellMeta {",
        ".notebookCellMoreMenu {",
        ".notebookInsertControl {",
        "min-height: 40px;",
    )
    missing.extend(fragment for fragment in styleRequired if fragment not in styles)
    forbidden = (
        "min-height: 120px;",
        ".notebookRuntimeRail",
        "SCRATCH_STARTER_CODE",
    )
    present = [fragment for fragment in forbidden if fragment in f"{source}\n{styles}"]
    missing.extend(f"forbidden legacy contract: {fragment}" for fragment in present)
    stableFrames = source.count('className="notebookCellBody"') >= 2
    if not stableFrames:
        missing.append("stable code and markdown insert frames")
    return CheckResult(
        name="notebook-insert-controls",
        ok=not missing,
        detail="contextual insert controls, compact cells, and run-advance keyboard flow"
        if not missing
        else f"missing: {', '.join(missing)}",
    )


def checkNotebookSurfaceSsot() -> CheckResult:
    notebookPanel = (SRC / "components" / "notebook" / "notebookPanel.tsx").read_text(encoding="utf-8")
    commandBar = (SRC / "components" / "notebook" / "notebookCommandBar.tsx").read_text(encoding="utf-8")
    notebookSurface = (SRC / "components" / "app" / "notebookSurface.tsx").read_text(encoding="utf-8")
    learningCell = (SRC / "components" / "curriculum" / "curriculumLearningCell.tsx").read_text(encoding="utf-8")
    workCell = (SRC / "components" / "app" / "workCell.css").read_text(encoding="utf-8")
    required = (
        ("notebook shared work-cell import", notebookPanel, 'import "@/components/app/workCell.css"'),
        ("learning shared work-cell import", learningCell, 'import "@/components/app/workCell.css"'),
        ("notebook shared frame", notebookPanel, "astryxWorkCellFrame notebookCodeFrame"),
        ("learning shared frame", learningCell, 'className="astryxWorkCellFrame"'),
        ("shared output primitive", workCell, ".astryxWorkCellOutput"),
        ("single notebook panel tree", notebookSurface, "<NotebookPanel"),
        ("runtime is capability data", commandBar, "data-notebook-runtime={apiOnline ? \"local\" : \"web\"}"),
        ("quiet persistence disclosure", commandBar, 'const showPersistence = persistence.phase === "saving"'),
    )
    missing = [label for label, source, fragment in required if fragment not in source]
    notebookPanelCount = notebookSurface.count("<NotebookPanel")
    if notebookPanelCount != 1:
        missing.append(f"expected one NotebookPanel tree, found {notebookPanelCount}")
    return CheckResult(
        name="notebook-surface-ssot",
        ok=not missing,
        detail="Web and Local share one notebook tree and one work-cell visual primitive"
        if not missing
        else f"missing: {', '.join(missing)}",
    )


def checkViewportInsetsHook() -> CheckResult:
    path = SRC / "hooks" / "useViewportInsets.ts"
    if not path.exists():
        return CheckResult(name="viewport-insets-hook", ok=False, detail="missing")
    source = path.read_text(encoding="utf-8")
    ok = "visualViewport" in source and "isKeyboardOpen" in source
    return CheckResult(
        name="viewport-insets-hook",
        ok=ok,
        detail="visualViewport hook present" if ok else "missing visualViewport handling",
    )


def checkPrefersDarkHook() -> CheckResult:
    path = SRC / "hooks" / "usePrefersDark.ts"
    if not path.exists():
        return CheckResult(name="prefers-dark-hook", ok=False, detail="missing")
    source = path.read_text(encoding="utf-8")
    ok = "prefers-color-scheme: dark" in source
    return CheckResult(
        name="prefers-dark-hook",
        ok=ok,
        detail="ok" if ok else "missing prefers-color-scheme query",
    )


def checkVitePwaConfig() -> CheckResult:
    config = (EDITOR / "vite.config.ts").read_text(encoding="utf-8")
    forbidden = ("VitePWA", "vite-plugin-pwa", "navigateFallback")
    present = [token for token in forbidden if token in config]
    return CheckResult(
        name="service-worker-ssot",
        ok=not present,
        detail="custom service worker is the only PWA worker" if not present else f"unexpected duplicate worker config: {', '.join(present)}",
    )


def main() -> int:
    results = runChecks()
    failures = [r for r in results if not r.ok]
    for result in results:
        marker = "ok" if result.ok else "FAIL"
        print(f"[{marker}] {result.name}: {result.detail}")
    if failures:
        print(f"\n{len(failures)} mobile layout check(s) failed")
        return 1
    print(f"\nall {len(results)} mobile layout checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
