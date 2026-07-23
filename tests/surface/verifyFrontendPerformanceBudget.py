from __future__ import annotations

from datetime import UTC, datetime
import json
import subprocess
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
APP_DIR = ROOT / "src" / "codaro" / "webBuild" / "_app"
VITE_CONFIG = ROOT / "editor" / "vite.config.ts"
CURRICULA_ROOT = ROOT / "curricula" / "python"
CURRICULA_REGISTRY = ROOT / "editor" / "src" / "lib" / "curriculaRegistry.ts"
CURRICULUM_SELECTION = ROOT / "editor" / "src" / "lib" / "curriculumSelection.ts"
REPORT_PATH = ROOT / "output" / "test-runner" / "frontend-performance-budget" / "performance-report.json"

MIN_JS_CHUNKS = 4
MAX_SINGLE_JS_BYTES = 400_000
# 엔트리 셸은 4개 제품 표면이 모두 lazy인 상태에서 남는 공유 셸(App·사이드바·provider)이다.
# 커리큘럼 홈·카테고리 내비 도입으로 소폭(약 1%) 커졌으나 기능 표면은 여전히 lazy 분리되어 있다.
# 실제 회귀(수십 KB)는 여전히 잡도록 tight하게 유지한다.
MAX_ENTRY_JS_BYTES = 320_000
MAX_TOTAL_JS_BYTES = 7_500_000
MAX_APP_SHELL_JS_BYTES = MAX_TOTAL_JS_BYTES
# Curriculum lessons are independent lazy chunks. Guard the authored corpus, per-lesson transfer,
# and bundling overhead separately so adding a useful lesson does not consume app-shell budget.
MAX_LAZY_CURRICULUM_SOURCE_BYTES = 25_000_000
MAX_AVERAGE_LAZY_CURRICULUM_JS_BYTES = 50_000
MAX_SINGLE_LAZY_CURRICULUM_JS_BYTES = 100_000
MAX_LAZY_CURRICULUM_BUNDLE_RATIO = 1.08
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


def curriculumLessonStems() -> set[str]:
    # 레슨 YAML은 카테고리 트리 하위(curricula/python/<카테고리>/<하위>/<레슨>.yaml)에
    # 임의 깊이로 놓이므로 재귀로 모은다. 비재귀 glob은 트리 재구조화 이후 레슨을 놓쳐
    # lazy 청크를 app shell로 잘못 집계한다.
    return {path.stem for path in CURRICULA_ROOT.glob("**/*.yaml") if path.name != "schema.yaml"}


def curriculumSourceBytes() -> int:
    return sum(
        path.stat().st_size
        for path in CURRICULA_ROOT.glob("**/*.yaml")
        if path.name != "schema.yaml"
    )


def isLazyCurriculumChunk(name: str, lessonStems: set[str]) -> bool:
    return any(name.startswith(f"{stem}-") for stem in lessonStems)


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
    lessonStems = curriculumLessonStems()
    lazyCurriculumChunks = [
        item for item in chunkStats if isLazyCurriculumChunk(str(item["name"]), lessonStems)
    ]
    lazyCurriculumChunkNames = {item["name"] for item in lazyCurriculumChunks}
    appShellChunks = [item for item in chunkStats if item["name"] not in lazyCurriculumChunkNames]
    totalJsBytes = sum(item["bytes"] for item in chunkStats)
    appShellJsBytes = sum(item["bytes"] for item in appShellChunks)
    lazyCurriculumJsBytes = sum(item["bytes"] for item in lazyCurriculumChunks)
    lazyCurriculumAverageBytes = (
        round(lazyCurriculumJsBytes / len(lazyCurriculumChunks)) if lazyCurriculumChunks else 0
    )
    lazyCurriculumBiggestBytes = max((item["bytes"] for item in lazyCurriculumChunks), default=0)
    lazyCurriculumSourceBytes = curriculumSourceBytes()
    lazyCurriculumBundleRatio = (
        lazyCurriculumJsBytes / lazyCurriculumSourceBytes if lazyCurriculumSourceBytes else 0.0
    )
    biggestJs = max((item["bytes"] for item in chunkStats), default=0)
    entryJsBytes = max((item["bytes"] for item in chunkStats if item["name"].startswith("index-")), default=0)
    totalCssBytes = sum(item["bytes"] for item in cssStats)

    if biggestJs > MAX_SINGLE_JS_BYTES:
        failures.append(f"largest JS chunk {biggestJs} exceeds budget {MAX_SINGLE_JS_BYTES}")
    if entryJsBytes > MAX_ENTRY_JS_BYTES:
        failures.append(f"entry JS chunk {entryJsBytes} exceeds budget {MAX_ENTRY_JS_BYTES}")
    if appShellJsBytes > MAX_APP_SHELL_JS_BYTES:
        failures.append(f"app shell JS {appShellJsBytes} exceeds baseline budget {MAX_APP_SHELL_JS_BYTES}")
    if lazyCurriculumSourceBytes > MAX_LAZY_CURRICULUM_SOURCE_BYTES:
        failures.append(
            f"curriculum source {lazyCurriculumSourceBytes} exceeds corpus budget "
            f"{MAX_LAZY_CURRICULUM_SOURCE_BYTES}"
        )
    if lazyCurriculumAverageBytes > MAX_AVERAGE_LAZY_CURRICULUM_JS_BYTES:
        failures.append(
            f"average lazy curriculum JS {lazyCurriculumAverageBytes} exceeds per-lesson budget "
            f"{MAX_AVERAGE_LAZY_CURRICULUM_JS_BYTES}"
        )
    if lazyCurriculumBiggestBytes > MAX_SINGLE_LAZY_CURRICULUM_JS_BYTES:
        failures.append(
            f"largest lazy curriculum JS {lazyCurriculumBiggestBytes} exceeds per-lesson budget "
            f"{MAX_SINGLE_LAZY_CURRICULUM_JS_BYTES}"
        )
    if lazyCurriculumBundleRatio > MAX_LAZY_CURRICULUM_BUNDLE_RATIO:
        failures.append(
            f"lazy curriculum bundle ratio {lazyCurriculumBundleRatio:.3f} exceeds overhead budget "
            f"{MAX_LAZY_CURRICULUM_BUNDLE_RATIO:.3f}"
        )
    if totalCssBytes > MAX_CSS_BYTES:
        failures.append(f"total CSS {totalCssBytes} exceeds budget {MAX_CSS_BYTES}")

    chunkNames = " ".join(path.name for path in jsFiles)
    for label in REQUIRED_CHUNK_LABELS:
        if label not in chunkNames:
            failures.append(f"expected a named {label} chunk in built assets")

    configText = VITE_CONFIG.read_text(encoding="utf-8")
    for token in ("codeSplitting", "@codemirror", "@radix-ui", "vendor"):
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
        "maxAppShellJsBytes": MAX_APP_SHELL_JS_BYTES,
        "maxLazyCurriculumSourceBytes": MAX_LAZY_CURRICULUM_SOURCE_BYTES,
        "maxAverageLazyCurriculumJsBytes": MAX_AVERAGE_LAZY_CURRICULUM_JS_BYTES,
        "maxSingleLazyCurriculumJsBytes": MAX_SINGLE_LAZY_CURRICULUM_JS_BYTES,
        "maxLazyCurriculumBundleRatio": MAX_LAZY_CURRICULUM_BUNDLE_RATIO,
        "totalJsBudgetScope": "app-shell-excluding-lazy-curriculum-chunks",
        "maxCssBytes": MAX_CSS_BYTES,
        "chunkCount": len(jsFiles),
        "totalJsBytes": totalJsBytes,
        "appShellJsBytes": appShellJsBytes,
        "lazyCurriculumJsBytes": lazyCurriculumJsBytes,
        "lazyCurriculumChunkCount": len(lazyCurriculumChunks),
        "lazyCurriculumSourceBytes": lazyCurriculumSourceBytes,
        "lazyCurriculumAverageBytes": lazyCurriculumAverageBytes,
        "lazyCurriculumBiggestBytes": lazyCurriculumBiggestBytes,
        "lazyCurriculumBundleRatio": round(lazyCurriculumBundleRatio, 4),
        "biggestJsBytes": biggestJs,
        "entryJsBytes": entryJsBytes,
        "totalCssBytes": totalCssBytes,
        "appShellChunks": appShellChunks,
        "lazyCurriculumChunks": lazyCurriculumChunks,
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
