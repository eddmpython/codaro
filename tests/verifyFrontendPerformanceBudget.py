from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
APP_DIR = ROOT / "src" / "codaro" / "webBuild" / "_app"
VITE_CONFIG = ROOT / "editor" / "vite.config.ts"

MIN_JS_CHUNKS = 4
MAX_SINGLE_JS_BYTES = 6_000_000
MAX_TOTAL_JS_BYTES = 7_500_000
MAX_CSS_BYTES = 160_000
REQUIRED_CHUNK_LABELS = ("codemirror", "react", "vendor")


def main() -> int:
    failures: list[str] = []
    jsFiles = sorted(APP_DIR.glob("*.js"))
    cssFiles = sorted(APP_DIR.glob("*.css"))

    if not jsFiles:
        failures.append("web build has no JavaScript chunks; run editor build before this gate")
    if len(jsFiles) < MIN_JS_CHUNKS:
        failures.append(f"expected at least {MIN_JS_CHUNKS} JavaScript chunks, found {len(jsFiles)}")

    chunkStats = [{"name": path.name, "bytes": path.stat().st_size} for path in jsFiles]
    cssStats = [{"name": path.name, "bytes": path.stat().st_size} for path in cssFiles]
    totalJsBytes = sum(item["bytes"] for item in chunkStats)
    biggestJs = max((item["bytes"] for item in chunkStats), default=0)
    totalCssBytes = sum(item["bytes"] for item in cssStats)

    if biggestJs > MAX_SINGLE_JS_BYTES:
        failures.append(f"largest JS chunk {biggestJs} exceeds budget {MAX_SINGLE_JS_BYTES}")
    if totalJsBytes > MAX_TOTAL_JS_BYTES:
        failures.append(f"total JS {totalJsBytes} exceeds baseline budget {MAX_TOTAL_JS_BYTES}")
    if totalCssBytes > MAX_CSS_BYTES:
        failures.append(f"total CSS {totalCssBytes} exceeds budget {MAX_CSS_BYTES}")

    chunkNames = " ".join(path.name for path in jsFiles)
    for label in REQUIRED_CHUNK_LABELS:
        if label not in chunkNames:
            failures.append(f"expected a named {label} chunk in built assets")

    configText = VITE_CONFIG.read_text(encoding="utf-8")
    for token in ("manualChunks", "@codemirror", "@radix-ui", "react-dom", "vendor"):
        if token not in configText:
            failures.append(f"vite config missing performance split token {token}")

    payload = {
        "gate": "frontend-performance-budget",
        "passed": not failures,
        "minJsChunks": MIN_JS_CHUNKS,
        "maxSingleJsBytes": MAX_SINGLE_JS_BYTES,
        "maxTotalJsBytes": MAX_TOTAL_JS_BYTES,
        "maxCssBytes": MAX_CSS_BYTES,
        "chunkCount": len(jsFiles),
        "totalJsBytes": totalJsBytes,
        "biggestJsBytes": biggestJs,
        "totalCssBytes": totalCssBytes,
        "chunks": chunkStats,
        "css": cssStats,
        "failures": failures,
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: frontend performance budget exceeded", file=sys.stderr)
        return 1
    print("ok: frontend performance budget verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
