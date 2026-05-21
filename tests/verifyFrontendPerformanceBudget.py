from __future__ import annotations

from datetime import UTC, datetime
import json
import subprocess
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
APP_DIR = ROOT / "src" / "codaro" / "webBuild" / "_app"
VITE_CONFIG = ROOT / "editor" / "vite.config.ts"
CURRICULA_REGISTRY = ROOT / "editor" / "src" / "lib" / "curriculaRegistry.ts"
CURRICULUM_SELECTION = ROOT / "editor" / "src" / "lib" / "curriculumSelection.ts"
REPORT_PATH = ROOT / "output" / "test-runner" / "frontend-performance-budget" / "performance-report.json"

MIN_JS_CHUNKS = 4
MAX_SINGLE_JS_BYTES = 400_000
MAX_ENTRY_JS_BYTES = 300_000
MAX_TOTAL_JS_BYTES = 7_500_000
MAX_CSS_BYTES = 160_000
REQUIRED_CHUNK_LABELS = ("codemirror", "vendor", "yaml", "curriculumSurface")


def currentGitHead() -> str | None:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip() or None


def main() -> int:
    startedAt = datetime.now(UTC).isoformat()
    started = time.monotonic()
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
    entryJsBytes = max((item["bytes"] for item in chunkStats if item["name"].startswith("index-")), default=0)
    totalCssBytes = sum(item["bytes"] for item in cssStats)

    if biggestJs > MAX_SINGLE_JS_BYTES:
        failures.append(f"largest JS chunk {biggestJs} exceeds budget {MAX_SINGLE_JS_BYTES}")
    if entryJsBytes > MAX_ENTRY_JS_BYTES:
        failures.append(f"entry JS chunk {entryJsBytes} exceeds budget {MAX_ENTRY_JS_BYTES}")
    if totalJsBytes > MAX_TOTAL_JS_BYTES:
        failures.append(f"total JS {totalJsBytes} exceeds baseline budget {MAX_TOTAL_JS_BYTES}")
    if totalCssBytes > MAX_CSS_BYTES:
        failures.append(f"total CSS {totalCssBytes} exceeds budget {MAX_CSS_BYTES}")

    chunkNames = " ".join(path.name for path in jsFiles)
    for label in REQUIRED_CHUNK_LABELS:
        if label not in chunkNames:
            failures.append(f"expected a named {label} chunk in built assets")

    configText = VITE_CONFIG.read_text(encoding="utf-8")
    for token in ("manualChunks", "@codemirror", "@radix-ui", "vendor"):
        if token not in configText:
            failures.append(f"vite config missing performance split token {token}")

    registryText = CURRICULA_REGISTRY.read_text(encoding="utf-8")
    selectionText = CURRICULUM_SELECTION.read_text(encoding="utf-8")
    if "eager: true" in registryText:
        failures.append("curriculum registry still eagerly imports YAML lessons")
    for token in ("loadRaw", "export async function registryLesson"):
        if token not in registryText:
            failures.append(f"curriculum registry missing lazy lesson token {token}")
    if "document: null" not in selectionText:
        failures.append("default curriculum state should not materialize a lesson document at bootstrap")

    payload = {
        "gate": "frontend-performance-budget",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "gitHead": currentGitHead(),
        "startedAt": startedAt,
        "completedAt": datetime.now(UTC).isoformat(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "reportPath": "output/test-runner/frontend-performance-budget/performance-report.json",
        "minJsChunks": MIN_JS_CHUNKS,
        "maxSingleJsBytes": MAX_SINGLE_JS_BYTES,
        "maxEntryJsBytes": MAX_ENTRY_JS_BYTES,
        "maxTotalJsBytes": MAX_TOTAL_JS_BYTES,
        "maxCssBytes": MAX_CSS_BYTES,
        "chunkCount": len(jsFiles),
        "totalJsBytes": totalJsBytes,
        "biggestJsBytes": biggestJs,
        "entryJsBytes": entryJsBytes,
        "totalCssBytes": totalCssBytes,
        "chunks": chunkStats,
        "css": cssStats,
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: frontend performance budget exceeded", file=sys.stderr)
        return 1
    print("ok: frontend performance budget verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
