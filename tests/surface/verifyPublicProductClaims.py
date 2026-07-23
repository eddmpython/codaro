from __future__ import annotations

import html
import json
import re
import subprocess
import sys
import time
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[2]
BUILD_ROOT = ROOT / "landing" / "build"
CATALOG_PATH = ROOT / "contracts" / "publicLearningCatalog.json"
SEARCH_INDEX_PATH = ROOT / "landing" / "src" / "lib" / "generated" / "searchIndex.js"
LESSON_MODULE_ROOT = ROOT / "landing" / "src" / "lib" / "generated" / "curriculumLessons"
FAQ_PATH = ROOT / "landing" / "src" / "lib" / "faq.js"
REPORT_PATH = ROOT / "output" / "test-runner" / "landing-public" / "public-product-claims-report.json"
EXPECTED_LESSON_COUNT = 472
EXPECTED_RUNTIME_COUNTS = {"browser": 310, "local": 162}
FALSE_CLAIM_PATTERNS = (
    re.compile(r"no browser sandbox", re.IGNORECASE),
    re.compile(r"no WebAssembly fallback", re.IGNORECASE),
    re.compile(r"(?:학습|레슨).{0,30}(?:로컬에서만|Local[- ]only)", re.IGNORECASE),
    re.compile(r"(?:다운로드|설치).{0,20}(?:해야|후에만).{0,30}(?:학습|레슨)"),
    re.compile(
        r"(?:모든|전체\s*472개|472개)\s*(?:레슨|학습)(?:을|이|은)?\s*"
        r"(?:브라우저|Web)[^,.;\n]{0,20}(?:실행|강검증)",
        re.IGNORECASE,
    ),
    re.compile(
        r"all\s+(?:public\s+)?lessons\s+(?:execute|run|receive strong checks)\s+"
        r"(?:in|on)\s+(?:the\s+)?(?:browser|web)",
        re.IGNORECASE,
    ),
)


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    summary: dict[str, Any] = {}
    try:
        catalogRows = loadCatalogRows()
        expectedRoutes = {routeForRef(str(row["lessonRef"])) for row in catalogRows}
        generatedLessons = loadGeneratedLessonPayloads()
        renderedCounts = validateRenderedClaims(generatedLessons, failures)
        searchCounts = validateSearchClaims(expectedRoutes, failures)
        llmsCounts = validateLlmsClaims("llms.txt", expectedRoutes, failures)
        llmsFullCounts = validateLlmsFullClaims(expectedRoutes, failures)
        validateFaqClaims(failures)
        validatePublishedDocsClaims(failures)
        validateForbiddenClaims(failures)
        summary = {
            "catalogLessons": len(catalogRows),
            "renderedRuntimeCounts": renderedCounts,
            "searchRuntimeCounts": searchCounts,
            "llmsRuntimeCounts": llmsCounts,
            "llmsFullRuntimeCounts": llmsFullCounts,
        }
    except (FileNotFoundError, json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
        failures.append(f"claim audit could not load public evidence: {type(exc).__name__}: {exc}")

    payload = {
        "gate": "public-product-claims",
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
        print("FAIL: public product claims are not tier-honest", file=sys.stderr)
        return 1
    print("ok: public Web-complete and Local-extension claims verified")
    return 0


def loadCatalogRows() -> list[dict[str, Any]]:
    payload = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    rows = payload.get("lessons")
    if not isinstance(rows, list) or len(rows) != EXPECTED_LESSON_COUNT:
        raise ValueError("public learning catalog does not contain 472 lessons")
    return rows


def loadGeneratedLessonPayloads() -> dict[str, dict[str, Any]]:
    payloads: dict[str, dict[str, Any]] = {}
    for path in sorted(LESSON_MODULE_ROOT.glob("*.js")):
        text = path.read_text(encoding="utf-8")
        lesson = json.loads(text.split("export default ", 1)[1].rstrip()[:-1])
        payloads[str(lesson["route"])] = lesson
    if len(payloads) != EXPECTED_LESSON_COUNT:
        raise ValueError(f"generated lesson payload count is {len(payloads)}")
    return payloads


def validateRenderedClaims(
    lessons: dict[str, dict[str, Any]],
    failures: list[str],
) -> dict[str, int]:
    homeText = visibleText((BUILD_ROOT / "index.html").read_text(encoding="utf-8"))
    learnText = visibleText((BUILD_ROOT / "learn" / "index.html").read_text(encoding="utf-8"))
    for name, text in (("home", homeText), ("learn", learnText)):
        for token in ("310", "162", "Web", "Local"):
            if token not in text:
                failures.append(f"{name} rendered claim is missing {token}")
    if "472" not in learnText:
        failures.append("Learn rendered claim is missing the complete readable lesson count 472")

    runtimeCounts: Counter[str] = Counter()
    for route, lesson in lessons.items():
        path = BUILD_ROOT.joinpath(*route.strip("/").split("/"), "index.html")
        text = visibleText(path.read_text(encoding="utf-8"))
        runtimeTier = str(lesson.get("runtimeTier", ""))
        runtimeCounts[runtimeTier] += 1
        required = (
            ("Web에서 실행", "Web 자동 강검증", "이 레슨 실행")
            if runtimeTier == "browser"
            else ("Local 런타임 필요", "Local 강검증", "Local에서 실습")
        )
        for token in required:
            if token not in text:
                failures.append(f"{route}: rendered {runtimeTier} boundary is missing {token}")
    counts = dict(runtimeCounts)
    if counts != EXPECTED_RUNTIME_COUNTS:
        failures.append(f"rendered runtime counts are {counts}, expected {EXPECTED_RUNTIME_COUNTS}")
    return counts


def validateSearchClaims(expectedRoutes: set[str], failures: list[str]) -> dict[str, int]:
    entries = parseExportedJson(SEARCH_INDEX_PATH, "export const searchEntries = ")
    lessonEntries = [entry for entry in entries if entry.get("kind") == "lesson"]
    routes = [normalizeSiteRoute(str(entry.get("url", ""))) for entry in lessonEntries]
    refs = [str(entry.get("lessonRef", "")) for entry in lessonEntries]
    runtimeCounts = Counter(str(entry.get("runtimeTier", "")) for entry in lessonEntries)
    if len(lessonEntries) != EXPECTED_LESSON_COUNT or set(routes) != expectedRoutes:
        failures.append(
            f"search lesson population mismatch: entries={len(lessonEntries)}, routes={len(set(routes))}"
        )
    if len(set(refs)) != EXPECTED_LESSON_COUNT or any(not ref for ref in refs):
        failures.append("search lessonRef identity is missing or duplicated")
    if len(routes) != len(set(routes)):
        failures.append("search lesson URLs are duplicated")
    for entry in lessonEntries:
        if (
            entry.get("runtimeTier") not in EXPECTED_RUNTIME_COUNTS
            or not entry.get("eligiblePathIds")
            or not str(entry.get("summary", "")).strip()
        ):
            failures.append(f"search lesson tier/path/summary metadata is incomplete: {entry.get('url')}")
    counts = dict(runtimeCounts)
    if counts != EXPECTED_RUNTIME_COUNTS:
        failures.append(f"search runtime counts are {counts}, expected {EXPECTED_RUNTIME_COUNTS}")
    return counts


def validateLlmsClaims(fileName: str, expectedRoutes: set[str], failures: list[str]) -> dict[str, int]:
    lines = (BUILD_ROOT / fileName).read_text(encoding="utf-8").splitlines()
    lessonLines = [line for line in lines if "/learn/lesson/" in line]
    routes = [routeFromMarkdownLine(line) for line in lessonLines]
    runtimeCounts: Counter[str] = Counter()
    for line in lessonLines:
        if "| Runtime: Web |" in line:
            runtimeCounts["browser"] += 1
        elif "| Runtime: Local |" in line:
            runtimeCounts["local"] += 1
        else:
            failures.append(f"{fileName} lesson line has no exact runtime tier: {line[:120]}")
        if "| Learning paths:" not in line or "| Summary:" not in line:
            failures.append(f"{fileName} lesson line lacks path or summary: {line[:120]}")
    if len(lessonLines) != EXPECTED_LESSON_COUNT or set(routes) != expectedRoutes:
        failures.append(
            f"{fileName} lesson population mismatch: lines={len(lessonLines)}, routes={len(set(routes))}"
        )
    if len(routes) != len(set(routes)):
        failures.append(f"{fileName} contains duplicate lesson URLs")
    counts = dict(runtimeCounts)
    if counts != EXPECTED_RUNTIME_COUNTS:
        failures.append(f"{fileName} runtime counts are {counts}, expected {EXPECTED_RUNTIME_COUNTS}")
    return counts


def validateLlmsFullClaims(expectedRoutes: set[str], failures: list[str]) -> dict[str, int]:
    text = (BUILD_ROOT / "llms-full.txt").read_text(encoding="utf-8")
    blocks = re.findall(r"^## Lesson:.*?(?=^## |\Z)", text, flags=re.MULTILINE | re.DOTALL)
    routes: list[str] = []
    runtimeCounts: Counter[str] = Counter()
    for block in blocks:
        urlMatch = re.search(r"^URL:\s*(\S+)", block, flags=re.MULTILINE)
        if not urlMatch:
            failures.append("llms-full lesson block is missing URL")
            continue
        routes.append(normalizeSiteRoute(urlMatch.group(1)))
        runtimeMatch = re.search(
            r"^Runtime:\s*(Web|Local)(?:\s*\((?:browser|local)\))?\s*$",
            block,
            flags=re.MULTILINE,
        )
        if runtimeMatch:
            runtimeCounts["browser" if runtimeMatch.group(1) == "Web" else "local"] += 1
        else:
            failures.append(f"llms-full lesson block is missing runtime: {urlMatch.group(1)}")
        if not re.search(r"^Learning paths:\s*\S+", block, flags=re.MULTILINE):
            failures.append(f"llms-full lesson block is missing paths: {urlMatch.group(1)}")
        if not re.search(r"^Body summary:\s*\S+", block, flags=re.MULTILINE):
            failures.append(f"llms-full lesson block is missing body summary: {urlMatch.group(1)}")
    if len(blocks) != EXPECTED_LESSON_COUNT or set(routes) != expectedRoutes:
        failures.append(
            f"llms-full lesson population mismatch: blocks={len(blocks)}, routes={len(set(routes))}"
        )
    if len(routes) != len(set(routes)):
        failures.append("llms-full contains duplicate lesson URLs")
    counts = dict(runtimeCounts)
    if counts != EXPECTED_RUNTIME_COUNTS:
        failures.append(f"llms-full runtime counts are {counts}, expected {EXPECTED_RUNTIME_COUNTS}")
    return counts


def validateFaqClaims(failures: list[str]) -> None:
    text = FAQ_PATH.read_text(encoding="utf-8")
    for token in (
        "curriculumLessonCount",
        "curriculumRuntimeCounts.browser",
        "curriculumRuntimeCounts.local",
        "Web",
        "Local",
        "강검증",
    ):
        if token not in text:
            failures.append(f"FAQ is missing the public runtime boundary token {token}")


def validatePublishedDocsClaims(failures: list[str]) -> None:
    entries = parseExportedJson(SEARCH_INDEX_PATH, "export const searchEntries = ")
    docs = [entry for entry in entries if entry.get("kind") == "docs"]
    boundaryDocs = [
        entry
        for entry in docs
        if "브라우저" in str(entry.get("text", ""))
        and "Local" in str(entry.get("text", ""))
        and any(token in str(entry.get("text", "")) for token in ("강검증", "자동 검증"))
        and any(token in str(entry.get("text", "")) for token in ("파일", "운영체제", "스케줄"))
    ]
    if not boundaryDocs:
        failures.append("published docs do not explain the Web-complete and Local-capability boundary")


def validateForbiddenClaims(failures: list[str]) -> None:
    publicTexts = {
        "home": visibleText((BUILD_ROOT / "index.html").read_text(encoding="utf-8")),
        "learn": visibleText((BUILD_ROOT / "learn" / "index.html").read_text(encoding="utf-8")),
        "llms.txt": (BUILD_ROOT / "llms.txt").read_text(encoding="utf-8"),
        "llms-full.txt": (BUILD_ROOT / "llms-full.txt").read_text(encoding="utf-8"),
        "faq.js": FAQ_PATH.read_text(encoding="utf-8"),
    }
    for source, text in publicTexts.items():
        compact = re.sub(r"\s+", " ", text)
        for pattern in FALSE_CLAIM_PATTERNS:
            match = pattern.search(compact)
            if match:
                failures.append(f"{source} contains false runtime claim: {match.group(0)[:140]}")


def parseExportedJson(path: Path, marker: str) -> list[dict[str, Any]]:
    text = path.read_text(encoding="utf-8")
    if marker not in text or not text.rstrip().endswith(";"):
        raise ValueError(f"cannot parse generated module {path.relative_to(ROOT)}")
    payload = json.loads(text.split(marker, 1)[1].rstrip()[:-1])
    if not isinstance(payload, list):
        raise ValueError(f"generated module is not a list: {path.relative_to(ROOT)}")
    return payload


def visibleText(value: str) -> str:
    withoutScripts = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", " ", value, flags=re.IGNORECASE | re.DOTALL)
    withoutTags = re.sub(r"<[^>]+>", " ", withoutScripts)
    return re.sub(r"\s+", " ", html.unescape(withoutTags)).strip()


def routeFromMarkdownLine(line: str) -> str:
    match = re.search(r"\((https?://[^)]+/learn/lesson/[^)]+)\)", line)
    return normalizeSiteRoute(match.group(1)) if match else ""


def routeForRef(lessonRef: str) -> str:
    category, contentId = lessonRef.split("/", 1)
    return f"/learn/lesson/{category}/{contentId}"


def normalizeSiteRoute(value: str) -> str:
    path = unquote(urlsplit(value).path)
    if path.startswith("/codaro/"):
        path = path.removeprefix("/codaro")
    return path.rstrip("/") or "/"


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


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


if __name__ == "__main__":
    raise SystemExit(main())
