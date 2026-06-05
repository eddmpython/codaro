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

CORE_SURFACES = (
    SRC / "components" / "notebook" / "notebookPanel.tsx",
    SRC / "components" / "curriculum" / "curriculumSurface.tsx",
    SRC / "components" / "app" / "mainSurface.tsx",
    SRC / "components" / "app" / "productSidebar.tsx",
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
    keywords = ("navigationNetworkFirst", "assetCacheFirst", "networkFirst", "/api/", "/ws/", "SHELL_CACHE", "RUNTIME_CACHE")
    missing = [keyword for keyword in keywords if keyword not in sw]
    return CheckResult(
        name="service-worker-strategies",
        ok=not missing,
        detail="navigation, asset, and API strategies separated" if not missing else f"missing: {', '.join(missing)}",
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
    for path in CORE_SURFACES:
        if not path.exists():
            findings.append(f"{path.name}: missing")
            continue
        source = path.read_text(encoding="utf-8")
        responsive = sum(source.count(prefix) for prefix in RESPONSIVE_PREFIXES)
        usesMobileHook = "useIsMobile" in source or "useMobile" in source or "use-mobile" in source
        if responsive == 0 and not usesMobileHook:
            findings.append(f"{path.name}: no responsive classes or mobile hook")
    return CheckResult(
        name="surface-responsive",
        ok=not findings,
        detail="all core surfaces responsive" if not findings else "; ".join(findings),
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
