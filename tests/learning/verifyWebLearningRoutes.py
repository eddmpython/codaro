from __future__ import annotations

import json
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = ROOT / "contracts" / "publicLearningCatalog.json"
GENERATED_ROOT = ROOT / "landing" / "src" / "lib" / "generated"
CURRICULUM_INDEX_PATH = GENERATED_ROOT / "curriculum.js"
LESSON_MODULE_ROOT = GENERATED_ROOT / "curriculumLessons"
SEARCH_INDEX_PATH = GENERATED_ROOT / "searchIndex.js"
BUILD_ROOT = ROOT / "landing" / "build"
REPORT_PATH = ROOT / "output" / "test-runner" / "web-learning" / "web-learning-routes-report.json"
EXPECTED_LESSON_COUNT = 472
EXPECTED_RUNTIME_COUNTS = {"browser": 310, "local": 162}
FEATURED_PATH_IDS = {
    "pythonFoundation",
    "dataReporting",
    "dataVisualization",
    "fileAutomation",
    "officeAutomation",
    "webMonitoring",
}


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    summary: dict[str, Any] = {}
    try:
        contractRows = loadCatalogRows()
        lessons = loadGeneratedLessons()
        payloads = loadLessonPayloads(lessons)
        expectedRoutes = {routeForRef(str(row["lessonRef"])) for row in contractRows}
        actualRoutes = {str(lesson.get("route", "")) for lesson in lessons}
        contractByRef = {str(row["lessonRef"]): row for row in contractRows}

        requireExactSet("generated canonical routes", actualRoutes, expectedRoutes, failures)
        if len(lessons) != EXPECTED_LESSON_COUNT:
            failures.append(f"generated lesson count is {len(lessons)}, expected {EXPECTED_LESSON_COUNT}")
        if len(payloads) != EXPECTED_LESSON_COUNT:
            failures.append(f"lazy lesson payload count is {len(payloads)}, expected {EXPECTED_LESSON_COUNT}")

        runtimeCounts = Counter(str(lesson.get("runtimeTier", "")) for lesson in lessons)
        if dict(runtimeCounts) != EXPECTED_RUNTIME_COUNTS:
            failures.append(f"runtime counts are {dict(runtimeCounts)}, expected {EXPECTED_RUNTIME_COUNTS}")

        validateLessonMetadata(lessons, payloads, contractByRef, failures)
        validateLazyIndex(lessons, failures)
        buildRoutes = builtLessonRoutes()
        requireExactSet("prerendered lesson routes", buildRoutes, expectedRoutes, failures)
        sitemapRoutes = lessonSitemapRoutes(failures)
        requireExactSet("sitemap lesson routes", sitemapRoutes, expectedRoutes, failures)
        searchRoutes, searchRuntimeCounts = lessonSearchRoutes(failures)
        requireExactSet("search lesson routes", searchRoutes, expectedRoutes, failures)
        if searchRuntimeCounts != EXPECTED_RUNTIME_COUNTS:
            failures.append(
                f"search runtime counts are {searchRuntimeCounts}, expected {EXPECTED_RUNTIME_COUNTS}"
            )
        validatePathContext(failures)
        summary = {
            "contractLessons": len(contractRows),
            "generatedLessons": len(lessons),
            "lazyPayloads": len(payloads),
            "prerenderedRoutes": len(buildRoutes),
            "sitemapRoutes": len(sitemapRoutes),
            "searchRoutes": len(searchRoutes),
            "runtimeCounts": dict(runtimeCounts),
            "searchRuntimeCounts": searchRuntimeCounts,
        }
    except (FileNotFoundError, json.JSONDecodeError, KeyError, TypeError, ValueError, ET.ParseError) as exc:
        failures.append(f"route audit could not load build evidence: {type(exc).__name__}: {exc}")

    payload = {
        "gate": "web-learning-routes",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "summary": summary,
        "failures": failures[:100],
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: public Web learning routes are incomplete", file=sys.stderr)
        return 1
    print("ok: 472 canonical public lesson routes verified")
    return 0


def loadCatalogRows() -> list[dict[str, Any]]:
    payload = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    rows = payload.get("lessons")
    if payload.get("schemaVersion") != 1 or not isinstance(rows, list):
        raise ValueError("public learning catalog header is invalid")
    return rows


def loadGeneratedLessons() -> list[dict[str, Any]]:
    text = CURRICULUM_INDEX_PATH.read_text(encoding="utf-8")
    prefix = "export const curriculumTree = "
    suffix = ";\nexport const curriculumLessons ="
    if prefix not in text or suffix not in text:
        raise ValueError("generated curriculum index cannot be parsed")
    treeText = text.split(prefix, 1)[1].split(suffix, 1)[0]
    tree = json.loads(treeText)
    return [
        {**lesson, "domain": domain["domain"], "domainLabel": domain["label"]}
        for domain in tree
        for track in domain.get("tracks", [])
        for lesson in track.get("lessons", [])
    ]


def loadLessonPayloads(lessons: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    moduleFiles = sorted(LESSON_MODULE_ROOT.glob("*.js"))
    expectedModules = {str(lesson.get("contentModule", "")) for lesson in lessons}
    actualModules = {path.stem for path in moduleFiles}
    if actualModules != expectedModules:
        missing = sorted(expectedModules - actualModules)[:5]
        extra = sorted(actualModules - expectedModules)[:5]
        raise ValueError(f"lazy module set mismatch: missing={missing}, extra={extra}")
    payloads: dict[str, dict[str, Any]] = {}
    for path in moduleFiles:
        text = path.read_text(encoding="utf-8")
        marker = "export default "
        if marker not in text or not text.rstrip().endswith(";"):
            raise ValueError(f"invalid lazy lesson module: {path.name}")
        payload = json.loads(text.split(marker, 1)[1].rstrip()[:-1])
        payloads[path.stem] = payload
    return payloads


def validateLessonMetadata(
    lessons: list[dict[str, Any]],
    payloads: dict[str, dict[str, Any]],
    contractByRef: dict[str, dict[str, Any]],
    failures: list[str],
) -> None:
    seenModules: set[str] = set()
    for lesson in lessons:
        lessonRef = f"{lesson.get('track', '')}/{lesson.get('id', '')}"
        contract = contractByRef.get(lessonRef)
        moduleName = str(lesson.get("contentModule", ""))
        payload = payloads.get(moduleName)
        if contract is None or payload is None:
            failures.append(f"missing generated contract or payload: {lessonRef}")
            continue
        if moduleName in seenModules:
            failures.append(f"duplicate lazy content module: {moduleName}")
        seenModules.add(moduleName)
        expectedRoute = routeForRef(lessonRef)
        if lesson.get("route") != expectedRoute or payload.get("route") != expectedRoute:
            failures.append(f"canonical route mismatch: {lessonRef}")
        for key in ("runtimeTier", "eligiblePathIds"):
            if lesson.get(key) != contract.get(key) or payload.get(key) != contract.get(key):
                failures.append(f"{key} differs from public catalog: {lessonRef}")
        if payload.get("checkSpecId") != contract.get("checkSpecId"):
            failures.append(f"checkSpecId differs from public catalog: {lessonRef}")
        if not payload.get("outcome") or not payload.get("estimatedMinutes"):
            failures.append(f"outcome/time metadata missing: {lessonRef}")
        if not payload.get("visualAssetId") or not payload.get("sections"):
            failures.append(f"visual or lesson sections missing: {lessonRef}")


def validateLazyIndex(lessons: list[dict[str, Any]], failures: list[str]) -> None:
    forbiddenFields = {"sections", "snippet", "starterCode", "explanation"}
    for lesson in lessons:
        eagerFields = sorted(forbiddenFields & set(lesson))
        if eagerFields:
            failures.append(
                f"curriculum index eagerly embeds {eagerFields}: {lesson.get('track')}/{lesson.get('id')}"
            )
    if CURRICULUM_INDEX_PATH.stat().st_size > 1_000_000:
        failures.append("curriculum metadata index exceeds 1,000,000 bytes")


def builtLessonRoutes() -> set[str]:
    routeRoot = BUILD_ROOT / "learn" / "lesson"
    routes: set[str] = set()
    for path in routeRoot.rglob("index.html") if routeRoot.exists() else ():
        relative = path.parent.relative_to(BUILD_ROOT).as_posix()
        routes.add(f"/{relative}")
    return routes


def lessonSitemapRoutes(failures: list[str]) -> set[str]:
    path = BUILD_ROOT / "sitemap.xml"
    root = ET.fromstring(path.read_text(encoding="utf-8"))
    namespace = {"site": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    routes: list[str] = []
    for element in root.findall("site:url/site:loc", namespace):
        route = normalizeSiteRoute(element.text or "")
        if route.startswith("/learn/lesson/"):
            routes.append(route)
    if len(routes) != len(set(routes)):
        failures.append("sitemap contains duplicate lesson URLs")
    return set(routes)


def lessonSearchRoutes(failures: list[str]) -> tuple[set[str], dict[str, int]]:
    text = SEARCH_INDEX_PATH.read_text(encoding="utf-8")
    marker = "export const searchEntries = "
    if marker not in text or not text.rstrip().endswith(";"):
        raise ValueError("generated search index cannot be parsed")
    entries = json.loads(text.split(marker, 1)[1].rstrip()[:-1])
    lessonEntries = [entry for entry in entries if entry.get("kind") == "lesson"]
    routes = [normalizeSiteRoute(str(entry.get("url", ""))) for entry in lessonEntries]
    lessonRefs = [str(entry.get("lessonRef", "")) for entry in lessonEntries]
    if len(routes) != len(set(routes)):
        failures.append("search index contains duplicate lesson URLs")
    if len(lessonRefs) != len(set(lessonRefs)) or any(not lessonRef for lessonRef in lessonRefs):
        failures.append("search index contains missing or duplicate lessonRef identities")
    runtimeCounts = Counter(str(entry.get("runtimeTier", "")) for entry in lessonEntries)
    for entry in lessonEntries:
        if (
            not entry.get("title")
            or not str(entry.get("summary", "")).strip()
            or not entry.get("eligiblePathIds")
        ):
            failures.append(f"search lesson entry lacks title, summary, or path context: {entry.get('url')}")
    return set(routes), dict(runtimeCounts)


def validatePathContext(failures: list[str]) -> None:
    learnPath = BUILD_ROOT / "learn" / "index.html"
    text = learnPath.read_text(encoding="utf-8")
    for pathId in FEATURED_PATH_IDS:
        if f"?path={pathId}" not in text:
            failures.append(f"Learn prerender is missing featured path context: {pathId}")
    routeSource = (ROOT / "landing" / "src" / "routes" / "resolvePublicRoute.jsx").read_text(encoding="utf-8")
    lessonSource = (ROOT / "landing" / "src" / "pages" / "lesson.jsx").read_text(encoding="utf-8")
    for token in (
        'new URLSearchParams(search).get("path")',
        "lesson.eligiblePathIds.includes(requestedPathId)",
        "pathId={pathId}",
    ):
        if token not in routeSource:
            failures.append(f"public route path-context validation missing: {token}")
    for token in ("data-learning-path-context", "pathId: activePathId"):
        if token not in lessonSource:
            failures.append(f"lesson Run handoff path context missing: {token}")


def routeForRef(lessonRef: str) -> str:
    category, contentId = lessonRef.split("/", 1)
    return f"/learn/lesson/{category}/{contentId}"


def normalizeSiteRoute(value: str) -> str:
    path = unquote(urlsplit(value).path)
    if path == "/codaro":
        return "/"
    if path.startswith("/codaro/"):
        return path.removeprefix("/codaro")
    return path.rstrip("/") or "/"


def requireExactSet(name: str, actual: set[str], expected: set[str], failures: list[str]) -> None:
    if actual == expected:
        return
    failures.append(
        f"{name} mismatch: actual={len(actual)}, expected={len(expected)}, "
        f"missing={sorted(expected - actual)[:5]}, extra={sorted(actual - expected)[:5]}"
    )


def currentGitHead() -> str | None:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout.strip() or None if result.returncode == 0 else None


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


if __name__ == "__main__":
    raise SystemExit(main())
