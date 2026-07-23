"""editor 빌드 산출물의 PWA 자산 정적 검증.

Lighthouse v12+ 에서 PWA category가 제거되어, 같은 신호를 정적 검증으로 대체한다.
manifest 필수 필드, 서비스 워커 등록, navigation/API/asset 캐시 전략 분리 여부를 본다.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUILD = ROOT / "src" / "codaro" / "webBuild"


def main() -> int:
    failures: list[str] = []

    indexHtml = BUILD / "index.html"
    if not indexHtml.is_file():
        # webBuild는 editor 빌드 산출물(gitignore)이라, editor를 빌드하지 않는 환경(예: CI의
        # backend job)에는 검증 대상이 존재하지 않는다. Playwright 게이트와 동일하게 graceful
        # skip 한다. webBuild가 있는 환경(로컬 preflight, editor 빌드 후)에서는 아래 전체 PWA
        # 자산 검증을 그대로 수행한다.
        print("SKIP: webBuild/index.html 없음 — editor 빌드 산출물이 없어 PWA 자산 검증을 건너뜀")
        return 0

    html = indexHtml.read_text(encoding="utf-8")
    if "manifest.webmanifest" not in html and "manifest.json" not in html:
        failures.append("index.html missing manifest link")
    for fragment in ('"theme-color"', "viewport-fit=cover"):
        if fragment not in html and fragment.replace('"', "") not in html:
            failures.append(f"index.html missing {fragment}")
    if "serviceWorker" not in html and "registerSW" not in html:
        failures.append("index.html missing service worker registration")

    manifestPath = BUILD / "manifest.webmanifest"
    if not manifestPath.is_file():
        manifestPath = BUILD / "manifest.json"
    if not manifestPath.is_file():
        failures.append("manifest.webmanifest/json missing in build output")
    else:
        manifest = json.loads(manifestPath.read_text(encoding="utf-8"))
        for key in ("name", "short_name", "start_url", "display", "icons", "theme_color"):
            if key not in manifest:
                failures.append(f"manifest missing key: {key}")
        if manifest.get("display") not in ("standalone", "minimal-ui", "fullscreen"):
            failures.append(f"manifest display must be installable; got {manifest.get('display')!r}")
        if not manifest.get("icons"):
            failures.append("manifest icons[] empty")

    swCandidates = list(BUILD.glob("serviceWorker.js"))
    if not swCandidates:
        failures.append("serviceWorker.js missing in build output")

    if swCandidates:
        swText = swCandidates[0].read_text(encoding="utf-8", errors="replace")
        required = (
            "navigationNetworkFirst",
            "assetCacheFirst",
            "networkFirst",
            'pathname.startsWith(scopedPath("_app/"))',
            "SCOPE_PATH",
        )
        for token in required:
            if token not in swText:
                failures.append(f"serviceWorker.js missing {token}")
        if 'caches.match(scopedPath("index.html"))' not in swText:
            failures.append("serviceWorker.js missing navigation-only offline fallback")
        for fnName in ("shellCacheFirst", "assetCacheFirst"):
            fnMatch = re.search(rf"async function {fnName}\([^)]*\) \{{(?P<body>.*?)\n\}}", swText, flags=re.S)
            if not fnMatch:
                failures.append(f"serviceWorker.js missing {fnName} function body")
            elif 'caches.match(scopedPath("index.html"))' in fnMatch.group("body"):
                failures.append(f"serviceWorker.js must not use index.html fallback in {fnName}")

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print(f"ok: PWA artifacts valid ({manifestPath.name}, sw={swCandidates[0].name})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
