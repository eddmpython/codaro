from __future__ import annotations

import json
import subprocess
import sys
import time
from datetime import UTC, datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[2]
BUILD_ROOT = ROOT / "landing" / "build"
CATALOG_PATH = ROOT / "contracts" / "publicLearningCatalog.json"
LESSON_MODULE_ROOT = ROOT / "landing" / "src" / "lib" / "generated" / "curriculumLessons"
REPORT_PATH = ROOT / "output" / "test-runner" / "landing-public" / "landing-seo-report.json"
SITE_ORIGIN = "https://eddmpython.github.io"
EXPECTED_LESSON_COUNT = 472


class SeoDocumentParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.meta: dict[str, str] = {}
        self.links: dict[str, str] = {}
        self.scripts: dict[str, str] = {}
        self.h1: list[str] = []
        self.publicLessonRefs: list[str] = []
        self.rootCount = 0
        self.rootText: list[str] = []
        self._anonymousScriptCount = 0
        self._capture: str | None = None
        self._captureBuffer: list[str] = []
        self._rootDepth = 0
        self._h1Depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key: value or "" for key, value in attrs}
        if tag == "meta":
            key = values.get("property") or values.get("name")
            if key:
                self.meta[key] = values.get("content", "")
        elif tag == "link":
            rel = values.get("rel", "")
            if rel:
                self.links[rel] = values.get("href", "")
        elif tag == "title":
            self._capture = "title"
            self._captureBuffer = []
        elif tag == "script" and values.get("type") == "application/ld+json":
            scriptId = values.get("id") or f"anonymous-jsonld-{self._anonymousScriptCount}"
            self._anonymousScriptCount += 1
            self._capture = f"script:{scriptId}"
            self._captureBuffer = []
        elif tag == "script" and values.get("id"):
            self._capture = f"script:{values['id']}"
            self._captureBuffer = []
        if tag == "div" and values.get("id") == "root":
            self.rootCount += 1
            self._rootDepth = 1
        elif self._rootDepth:
            self._rootDepth += 1
        if tag == "h1":
            self._h1Depth = 1
            self._captureBuffer = []
        elif self._h1Depth:
            self._h1Depth += 1
        lessonRef = values.get("data-public-lesson")
        if lessonRef:
            self.publicLessonRefs.append(lessonRef)

    def handle_endtag(self, tag: str) -> None:
        if tag == "title" and self._capture == "title":
            self.title = "".join(self._captureBuffer).strip()
            self._capture = None
            self._captureBuffer = []
        elif tag == "script" and self._capture and self._capture.startswith("script:"):
            self.scripts[self._capture.removeprefix("script:")] = "".join(self._captureBuffer)
            self._capture = None
            self._captureBuffer = []
        if self._h1Depth:
            self._h1Depth -= 1
            if tag == "h1" and self._h1Depth == 0:
                self.h1.append("".join(self._captureBuffer).strip())
                self._captureBuffer = []
        if self._rootDepth:
            self._rootDepth -= 1

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._captureBuffer.append(data)
        elif self._h1Depth:
            self._captureBuffer.append(data)
        if self._rootDepth and data.strip():
            self.rootText.append(data.strip())


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    checkedPages = 0
    try:
        lessons = loadLessonPayloads()
        if len(lessons) != EXPECTED_LESSON_COUNT:
            failures.append(f"lesson payload count is {len(lessons)}, expected {EXPECTED_LESSON_COUNT}")
        validateCorePage("/", "index.html", failures)
        validateCorePage("/learn", "learn/index.html", failures)
        for lessonRef, lesson in lessons.items():
            validateLessonPage(lessonRef, lesson, failures)
            checkedPages += 1
    except (FileNotFoundError, json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
        failures.append(f"SEO audit could not load build evidence: {type(exc).__name__}: {exc}")

    payload = {
        "gate": "landing-seo",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "summary": {
            "lessonPagesChecked": checkedPages,
            "corePagesChecked": 2,
        },
        "failures": failures[:100],
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: landing SEO contract is incomplete", file=sys.stderr)
        return 1
    print(f"ok: landing SEO verified for {checkedPages} public lessons")
    return 0


def loadLessonPayloads() -> dict[str, dict[str, Any]]:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    expectedRefs = {str(row["lessonRef"]) for row in catalog["lessons"]}
    payloads: dict[str, dict[str, Any]] = {}
    for path in sorted(LESSON_MODULE_ROOT.glob("*.js")):
        text = path.read_text(encoding="utf-8")
        marker = "export default "
        payload = json.loads(text.split(marker, 1)[1].rstrip()[:-1])
        lessonRef = f"{payload['track']}/{payload['id']}"
        if lessonRef in payloads:
            raise ValueError(f"duplicate lesson payload: {lessonRef}")
        payloads[lessonRef] = payload
    if set(payloads) != expectedRefs:
        raise ValueError(
            f"lesson payload identity mismatch: missing={sorted(expectedRefs - set(payloads))[:5]}, "
            f"extra={sorted(set(payloads) - expectedRefs)[:5]}"
        )
    return payloads


def validateCorePage(route: str, relativePath: str, failures: list[str]) -> None:
    path = BUILD_ROOT / relativePath
    document = parseDocument(path)
    validateCommonMetadata(route, document, failures)
    if document.rootCount != 1 or len(" ".join(document.rootText)) < 100:
        failures.append(f"{route}: prerendered root is empty or duplicated")
    if len(document.h1) != 1:
        failures.append(f"{route}: expected one H1, found {len(document.h1)}")
    graphTypes: set[str] = set()
    for scriptId, text in document.scripts.items():
        if not scriptId.startswith("anonymous-jsonld-"):
            continue
        try:
            payload = json.loads(text)
        except json.JSONDecodeError as exc:
            failures.append(f"{route}: anonymous JSON-LD is invalid: {exc}")
            continue
        graph = payload.get("@graph", []) if isinstance(payload, dict) else []
        graphTypes.update(str(item.get("@type", "")) for item in graph if isinstance(item, dict))
    requiredTypes = {"WebSite", "Organization", "WebApplication", "SoftwareApplication"}
    if not requiredTypes <= graphTypes:
        failures.append(f"{route}: base JSON-LD types are incomplete: {sorted(graphTypes)}")
    if route == "/":
        faqJson = parseScriptJson(document, "codaro-route-jsonld", "home", failures)
        if faqJson and (faqJson.get("@type") != "FAQPage" or not faqJson.get("mainEntity")):
            failures.append("/: route JSON-LD is not a populated FAQPage")


def validateLessonPage(lessonRef: str, lesson: dict[str, Any], failures: list[str]) -> None:
    route = str(lesson["route"])
    path = BUILD_ROOT.joinpath(*route.strip("/").split("/"), "index.html")
    document = parseDocument(path)
    validateCommonMetadata(route, document, failures)
    if document.publicLessonRefs != [lessonRef]:
        failures.append(f"{lessonRef}: SSR public lesson marker is {document.publicLessonRefs}")
    if len(document.h1) != 1 or lesson["title"] not in document.h1[0]:
        failures.append(f"{lessonRef}: SSR H1 does not identify the lesson")
    if document.meta.get("og:type") != "article":
        failures.append(f"{lessonRef}: og:type is not article")
    routeJson = parseScriptJson(document, "codaro-route-jsonld", lessonRef, failures)
    if routeJson:
        expectedUrl = f"https://eddmpython.github.io/codaro{route}"
        for key, expected in (
            ("@context", "https://schema.org"),
            ("@type", "LearningResource"),
            ("url", expectedUrl),
            ("timeRequired", f"PT{lesson['estimatedMinutes']}M"),
            ("learningResourceType", "lesson"),
        ):
            if routeJson.get(key) != expected:
                failures.append(f"{lessonRef}: LearningResource {key} mismatch")
        if routeJson.get("teaches") != lesson.get("outcome"):
            failures.append(f"{lessonRef}: LearningResource teaches does not match outcomes")
        if not routeJson.get("provider") or not routeJson.get("isPartOf"):
            failures.append(f"{lessonRef}: LearningResource provider/isPartOf is missing")
    routeData = parseScriptJson(document, "codaro-route-data", lessonRef, failures)
    if routeData:
        hydratedLesson = routeData.get("lesson", {})
        if routeData.get("kind") != "public-lesson":
            failures.append(f"{lessonRef}: route data kind is not public-lesson")
        for key in ("track", "id", "runtimeTier", "route"):
            if hydratedLesson.get(key) != lesson.get(key):
                failures.append(f"{lessonRef}: route data {key} mismatch")
    parseScriptJson(document, "codaro-breadcrumb-jsonld", lessonRef, failures)


def validateCommonMetadata(route: str, document: SeoDocumentParser, failures: list[str]) -> None:
    expectedRoute = route.rstrip("/") or "/"
    canonical = document.links.get("canonical", "")
    canonicalRoute = normalizeSiteRoute(canonical)
    if canonicalRoute != expectedRoute or not canonical.startswith(SITE_ORIGIN):
        failures.append(f"{route}: canonical mismatch {canonical}")
    if not document.title.endswith("- Codaro"):
        failures.append(f"{route}: title is missing Codaro suffix")
    for key in (
        "description",
        "og:title",
        "og:description",
        "og:url",
        "og:image",
        "og:image:alt",
        "twitter:card",
        "twitter:title",
        "twitter:description",
        "twitter:image",
        "twitter:image:alt",
    ):
        if not document.meta.get(key):
            failures.append(f"{route}: metadata {key} is missing")
    if normalizeSiteRoute(document.meta.get("og:url", "")) != expectedRoute:
        failures.append(f"{route}: og:url differs from canonical route")
    if document.meta.get("og:title") != document.title or document.meta.get("twitter:title") != document.title:
        failures.append(f"{route}: social titles differ from the document title")
    description = document.meta.get("description")
    if document.meta.get("og:description") != description or document.meta.get("twitter:description") != description:
        failures.append(f"{route}: social descriptions differ from the document description")
    if document.meta.get("og:image") != document.meta.get("twitter:image"):
        failures.append(f"{route}: OG and Twitter images differ")
    for key in ("og:image", "twitter:image"):
        imageUrl = document.meta.get(key, "")
        if not imageUrl.startswith("https://") or "/codaro/codaro/" in imageUrl:
            failures.append(f"{route}: invalid absolute image URL in {key}")
    if document.rootCount != 1:
        failures.append(f"{route}: expected one SSR root, found {document.rootCount}")


def parseScriptJson(
    document: SeoDocumentParser,
    scriptId: str,
    lessonRef: str,
    failures: list[str],
) -> dict[str, Any] | None:
    text = document.scripts.get(scriptId)
    if not text:
        failures.append(f"{lessonRef}: {scriptId} is missing")
        return None
    try:
        payload = json.loads(text)
    except json.JSONDecodeError as exc:
        failures.append(f"{lessonRef}: {scriptId} is invalid JSON: {exc}")
        return None
    if not isinstance(payload, dict):
        failures.append(f"{lessonRef}: {scriptId} is not a JSON object")
        return None
    return payload


def parseDocument(path: Path) -> SeoDocumentParser:
    parser = SeoDocumentParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()
    return parser


def normalizeSiteRoute(value: str) -> str:
    path = unquote(urlsplit(value).path)
    if path == "/codaro":
        return "/"
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
