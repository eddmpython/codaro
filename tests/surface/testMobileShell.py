from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "editor" / "public"
HOOKS = ROOT / "editor" / "src" / "hooks"
INDEX = ROOT / "editor" / "index.html"


def testManifestExistsAndHasCoreFields() -> None:
    manifest = json.loads((PUBLIC / "manifest.json").read_text(encoding="utf-8"))
    for key in ("name", "short_name", "start_url", "display", "icons"):
        assert key in manifest, f"manifest missing key: {key}"
    assert manifest["display"] in ("standalone", "minimal-ui", "fullscreen")
    assert manifest["icons"], "manifest must declare at least one icon"


def testServiceWorkerImplementsBothStrategies() -> None:
    source = (PUBLIC / "serviceWorker.js").read_text(encoding="utf-8")
    assert "navigationNetworkFirst" in source
    assert "assetCacheFirst" in source
    assert "networkFirst" in source
    assert 'scopedPath("api/")' in source
    assert 'scopedPath("ws/")' in source
    assert 'caches.match(scopedPath("index.html"))' in source
    assert 'url.pathname.startsWith(scopedPath("_app/"))' in source
    assert "codaro-shell-v3:${SCOPE_PATH}" in source
    assert "codaro-runtime-v3:${SCOPE_PATH}" in source


def testIndexHasMobileMetaTags() -> None:
    html = INDEX.read_text(encoding="utf-8")
    for fragment in (
        'name="viewport"',
        "viewport-fit=cover",
        'name="theme-color"',
        'rel="manifest"',
        'apple-mobile-web-app-capable',
        "serviceWorker.register",
        "scope: serviceWorkerBase",
    ):
        assert fragment in html, f"index.html missing mobile fragment: {fragment}"


def testViewportInsetsHookExists() -> None:
    source = (HOOKS / "useViewportInsets.ts").read_text(encoding="utf-8")
    assert "visualViewport" in source
    assert "isKeyboardOpen" in source


def testPrefersDarkHookExists() -> None:
    source = (HOOKS / "usePrefersDark.ts").read_text(encoding="utf-8")
    assert "prefers-color-scheme: dark" in source
    assert "matchMedia" in source


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test") and callable(fn):
            fn()
            print(f"ok {name}")
