from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import threading
import time
from datetime import UTC, datetime
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import quote, urlsplit, urlunsplit


ROOT = Path(__file__).resolve().parents[2]
BUILD_ROOT = ROOT / "landing" / "build"
LESSON_MODULE_ROOT = ROOT / "landing" / "src" / "lib" / "generated" / "curriculumLessons"
REPORT_PATH = ROOT / "output" / "test-runner" / "landing-public" / "landing-hydration-report.json"
MAX_CLS = 0.1
HYDRATION_ERROR_TOKENS = (
    "hydration failed",
    "hydration mismatch",
    "did not match",
    "server rendered html",
    "server-rendered html",
    "error while hydrating",
)


class QuietLandingHandler(SimpleHTTPRequestHandler):
    def log_message(self, _format: str, *args: object) -> None:
        return

    def do_GET(self) -> None:
        parsed = urlsplit(self.path)
        path = parsed.path
        if path == "/codaro":
            path = "/"
        elif path.startswith("/codaro/"):
            path = path.removeprefix("/codaro")
        self.path = urlunsplit((parsed.scheme, parsed.netloc, path, parsed.query, parsed.fragment))
        super().do_GET()


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    results: list[dict[str, Any]] = []
    server: ThreadingHTTPServer | None = None
    thread: threading.Thread | None = None
    try:
        if not (BUILD_ROOT / "index.html").is_file():
            raise FileNotFoundError("landing build is missing; run npm run build in landing first")
        cases = hydrationCases()
        server, thread, port = startStaticServer()
        results, browserFailures = runBrowserAudit(cases, port)
        failures.extend(browserFailures)
    except (FileNotFoundError, json.JSONDecodeError, KeyError, OSError, RuntimeError, ValueError) as exc:
        failures.append(f"hydration audit could not run: {type(exc).__name__}: {exc}")
    finally:
        if server is not None:
            server.shutdown()
            server.server_close()
        if thread is not None:
            thread.join(timeout=4)

    payload = {
        "gate": "landing-hydration",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "maxCls": MAX_CLS,
        "cases": results,
        "failures": failures[:100],
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: landing hydration is not SSR-stable", file=sys.stderr)
        return 1
    print(f"ok: landing hydration verified across {len(results)} public routes")
    return 0


def hydrationCases() -> list[dict[str, Any]]:
    lessons: list[dict[str, Any]] = []
    for path in sorted(LESSON_MODULE_ROOT.glob("*.js")):
        text = path.read_text(encoding="utf-8")
        lessons.append(json.loads(text.split("export default ", 1)[1].rstrip()[:-1]))
    browserLesson = next((lesson for lesson in lessons if lesson.get("runtimeTier") == "browser"), None)
    localLesson = next((lesson for lesson in lessons if lesson.get("runtimeTier") == "local"), None)
    if browserLesson is None or localLesson is None:
        raise ValueError("representative browser and local lesson routes are required")
    return [
        {"name": "home", "route": "/", "lessonRef": None},
        {"name": "learn", "route": "/learn", "lessonRef": None},
        {"name": "home-light", "route": "/", "lessonRef": None, "storedTheme": "light"},
        {"name": "home-dark", "route": "/", "lessonRef": None, "storedTheme": "dark"},
        {
            "name": "home-system-dark",
            "route": "/",
            "lessonRef": None,
            "colorScheme": "dark",
            "expectedTheme": "dark",
        },
        {"name": "learn-light", "route": "/learn", "lessonRef": None, "storedTheme": "light"},
        {"name": "learn-dark", "route": "/learn", "lessonRef": None, "storedTheme": "dark"},
        {
            "name": "learn-system-dark-mobile",
            "route": "/learn",
            "lessonRef": None,
            "colorScheme": "dark",
            "expectedTheme": "dark",
            "viewport": {"width": 390, "height": 844},
        },
        {
            "name": "learn-path-query",
            "route": "/learn",
            "query": "?path=dataReporting",
            "lessonRef": None,
            "expectedPath": "dataReporting",
            "delayClientMs": 350,
        },
        {
            "name": "search-query",
            "route": "/search",
            "query": "?q=python",
            "lessonRef": None,
            "expectedQuery": "python",
            "delayClientMs": 350,
        },
        {
            "name": "search-empty-mobile",
            "route": "/search",
            "query": "?q=__codaro_no_result__",
            "lessonRef": None,
            "expectedQuery": "__codaro_no_result__",
            "expectedSearchState": "empty",
            "viewport": {"width": 390, "height": 844},
        },
        {
            "name": "search-index-failure",
            "route": "/search",
            "query": "?q=python",
            "lessonRef": None,
            "expectedQuery": "python",
            "expectedSearchState": "error",
            "failSearchIndex": True,
        },
        {
            "name": "browser-lesson",
            "route": str(browserLesson["route"]),
            "lessonRef": f"{browserLesson['track']}/{browserLesson['id']}",
        },
        {
            "name": "local-lesson",
            "route": str(localLesson["route"]),
            "lessonRef": f"{localLesson['track']}/{localLesson['id']}",
        },
    ]


def startStaticServer() -> tuple[ThreadingHTTPServer, threading.Thread, int]:
    handler = partial(QuietLandingHandler, directory=str(BUILD_ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread, int(server.server_address[1])


def runBrowserAudit(
    cases: list[dict[str, Any]],
    port: int,
) -> tuple[list[dict[str, Any]], list[str]]:
    try:
        from playwright.sync_api import Error as PlaywrightError
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise RuntimeError("Playwright is unavailable; run this verifier with uv --with playwright") from exc

    results: list[dict[str, Any]] = []
    failures: list[str] = []
    with sync_playwright() as playwright:
        browser = None
        try:
            try:
                browser = playwright.chromium.launch(headless=True)
            except PlaywrightError:
                installed, installError = installChromium()
                if not installed:
                    raise RuntimeError(f"Chromium install failed: {installError}")
                browser = playwright.chromium.launch(headless=True)
            for case in cases:
                result, caseFailures = auditCase(browser, case, port)
                results.append(result)
                failures.extend(caseFailures)
        except PlaywrightError as exc:
            raise RuntimeError(f"Chromium hydration audit failed: {exc}") from exc
        finally:
            if browser is not None:
                browser.close()
    return results, failures


def auditCase(browser: Any, case: dict[str, Any], port: int) -> tuple[dict[str, Any], list[str]]:
    route = str(case["route"])
    routeQuery = str(case.get("query") or "")
    url = f"http://127.0.0.1:{port}/codaro{encodedRoute(route)}{routeQuery}"
    viewport = case.get("viewport") or {"width": 1280, "height": 900}
    colorScheme = str(case.get("colorScheme") or "light")
    ssrContext = browser.new_context(
        java_script_enabled=False,
        viewport=viewport,
        color_scheme=colorScheme,
    )
    hydratedContext = browser.new_context(viewport=viewport, color_scheme=colorScheme)
    failures: list[str] = []
    consoleMessages: list[dict[str, str]] = []
    storedTheme = case.get("storedTheme")
    expectedPath = case.get("expectedPath")
    expectedQuery = case.get("expectedQuery")
    expectedTheme = case.get("expectedTheme")
    expectedSearchState = case.get("expectedSearchState")
    failSearchIndex = bool(case.get("failSearchIndex"))
    delayClientMs = int(case.get("delayClientMs") or 0)
    try:
        ssrPage = ssrContext.new_page()
        ssrPage.goto(url, wait_until="networkidle", timeout=45_000)
        ssrSnapshot = pageSnapshot(ssrPage)

        if storedTheme:
            hydratedContext.add_init_script(
                f"""
                window.localStorage.setItem("codaro-theme", {json.dumps(storedTheme)})
                """
            )
        hydratedContext.add_init_script(
            """
            window.__codaroCls = 0;
            window.__codaroThemeTransitions = [];
            window.__codaroFirstVisualState = null;
            const elementVisible = (element) => {
              if (!element) return false;
              const style = window.getComputedStyle(element);
              const rect = element.getBoundingClientRect();
              return style.display !== "none"
                && style.visibility !== "hidden"
                && Number(style.opacity || 1) > 0
                && rect.width > 0
                && rect.height > 0;
            };
            const captureFirstVisualState = () => {
              const pathSelect = document.querySelector(".learnPathSelect select");
              const searchInput = document.querySelector(".searchBox input");
              return {
                routeQueryPending:
                  document.documentElement.getAttribute("data-route-query-pending"),
                selectedPath: pathSelect?.value || null,
                selectedPathPresent: Boolean(pathSelect),
                selectedPathVisible: elementVisible(pathSelect),
                searchQuery: searchInput?.value || null,
                searchQueryPresent: Boolean(searchInput),
                searchQueryVisible: elementVisible(searchInput),
              };
            };
            try {
              const paintObserver = new PerformanceObserver((list, observer) => {
                if (list.getEntries().some((entry) => entry.name === "first-contentful-paint")) {
                  window.__codaroFirstVisualState = captureFirstVisualState();
                  observer.disconnect();
                }
              });
              paintObserver.observe({ type: "paint", buffered: true });
            } catch (error) {
              window.__codaroFirstVisualStateError = String(error);
            }
            const installThemeObserver = () => {
              const themeRoot = document.documentElement;
              if (!themeRoot || window.__codaroThemeObserver) return false;
              const recordTheme = () => {
                const value = themeRoot.getAttribute("data-theme");
                const transitions = window.__codaroThemeTransitions;
                if (value && transitions.at(-1) !== value) transitions.push(value);
              };
              window.__codaroThemeObserver = new MutationObserver(recordTheme);
              window.__codaroThemeObserver.observe(themeRoot, {
                attributes: true,
                attributeFilter: ["data-theme"],
              });
              recordTheme();
              return true;
            };
            if (!installThemeObserver()) {
              const themeObserverTimer = window.setInterval(() => {
                if (installThemeObserver()) window.clearInterval(themeObserverTimer);
              }, 0);
            }
            try {
              new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  if (!entry.hadRecentInput) window.__codaroCls += entry.value;
                }
              }).observe({ type: "layout-shift", buffered: true });
            } catch (error) {
              window.__codaroClsObserverError = String(error);
            }
            """
        )
        page = hydratedContext.new_page()
        if delayClientMs:
            def delayClientBundle(route: Any) -> None:
                time.sleep(delayClientMs / 1000)
                route.continue_()

            page.route("**/assets/index-*.js", delayClientBundle)
        if failSearchIndex:
            page.route(
                "**/assets/data-search-*.js",
                lambda route: route.fulfill(
                    status=200,
                    content_type="application/javascript",
                    body="throw new Error('simulated search index failure');",
                ),
            )
        page.on(
            "console",
            lambda message: consoleMessages.append(
                {"type": message.type, "text": message.text[:500]}
            ) if message.type in {"error", "warning"} else None,
        )
        page.on(
            "pageerror",
            lambda error: consoleMessages.append({"type": "pageerror", "text": str(error)[:500]}),
        )
        page.goto(url, wait_until="networkidle", timeout=45_000)
        page.evaluate("document.fonts ? document.fonts.ready : Promise.resolve()")
        page.wait_for_timeout(300)
        hydratedSnapshot = pageSnapshot(page)
        cls = float(page.evaluate("window.__codaroCls || 0"))
        observerError = page.evaluate("window.__codaroClsObserverError || null")
        firstVisualStateError = page.evaluate(
            "window.__codaroFirstVisualStateError || null"
        )
        lessonRef = case.get("lessonRef")

        if lessonRef:
            if ssrSnapshot["lessonCount"] != 1 or ssrSnapshot["lessonRef"] != lessonRef:
                failures.append(f"{case['name']}: SSR lesson identity is incomplete")
            if hydratedSnapshot["editorLessonCount"] != 1:
                failures.append(
                    f"{case['name']}: expected one interactive lesson workspace, "
                    f"found {hydratedSnapshot['editorLessonCount']}"
                )
            if hydratedSnapshot["editorLessonRef"] != lessonRef:
                failures.append(f"{case['name']}: interactive lesson identity changed")
        else:
            expectsClientStateChange = bool(storedTheme or expectedTheme or expectedPath or expectedQuery)
            if not expectsClientStateChange and ssrSnapshot["rootHtmlHash"] != hydratedSnapshot["rootHtmlHash"]:
                failures.append(f"{case['name']}: hydrated root differs from server markup")
            if not expectsClientStateChange and ssrSnapshot["rootText"] != hydratedSnapshot["rootText"]:
                failures.append(f"{case['name']}: hydrated visible text differs from server text")
        if storedTheme and hydratedSnapshot["resolvedTheme"] != storedTheme:
            failures.append(
                f"{case['name']}: stored theme {storedTheme} resolved as "
                f"{hydratedSnapshot['resolvedTheme']}"
            )
        if expectedTheme and hydratedSnapshot["resolvedTheme"] != expectedTheme:
            failures.append(
                f"{case['name']}: expected system theme {expectedTheme}, got "
                f"{hydratedSnapshot['resolvedTheme']}"
            )
        if expectedTheme and any(
            theme != expectedTheme for theme in hydratedSnapshot["themeTransitions"]
        ):
            failures.append(
                f"{case['name']}: system theme changed during hydration: "
                f"{hydratedSnapshot['themeTransitions']}"
            )
        if expectedPath and hydratedSnapshot["selectedPath"] != expectedPath:
            failures.append(
                f"{case['name']}: expected path {expectedPath}, got "
                f"{hydratedSnapshot['selectedPath']}"
            )
        if expectedPath:
            firstVisualState = hydratedSnapshot["firstVisualState"]
            if not firstVisualState:
                failures.append(f"{case['name']}: first visual state was not captured")
            elif not firstVisualState["selectedPathPresent"]:
                failures.append(f"{case['name']}: path filter was absent at first paint")
            elif (
                firstVisualState["selectedPathVisible"]
                and firstVisualState["selectedPath"] != expectedPath
            ):
                failures.append(
                    f"{case['name']}: wrong path was visible at first paint: "
                    f"{firstVisualState['selectedPath']}"
                )
            if (
                delayClientMs
                and firstVisualState
                and firstVisualState["routeQueryPending"] != "true"
            ):
                failures.append(
                    f"{case['name']}: delayed hydration did not retain the query guard at first paint"
                )
        if expectedQuery and hydratedSnapshot["searchQuery"] != expectedQuery:
            failures.append(
                f"{case['name']}: expected query {expectedQuery}, got "
                f"{hydratedSnapshot['searchQuery']}"
            )
        if expectedQuery:
            firstVisualState = hydratedSnapshot["firstVisualState"]
            if not firstVisualState:
                failures.append(f"{case['name']}: first visual state was not captured")
            elif not firstVisualState["searchQueryPresent"]:
                failures.append(f"{case['name']}: search input was absent at first paint")
            elif (
                firstVisualState["searchQueryVisible"]
                and firstVisualState["searchQuery"] != expectedQuery
            ):
                failures.append(
                    f"{case['name']}: wrong query was visible at first paint: "
                    f"{firstVisualState['searchQuery']}"
                )
            if (
                delayClientMs
                and firstVisualState
                and firstVisualState["routeQueryPending"] != "true"
            ):
                failures.append(
                    f"{case['name']}: delayed hydration did not retain the query guard at first paint"
                )
        if expectedSearchState and hydratedSnapshot["searchState"] != expectedSearchState:
            failures.append(
                f"{case['name']}: expected search state {expectedSearchState}, got "
                f"{hydratedSnapshot['searchState']}"
            )
        if expectedSearchState == "empty" and hydratedSnapshot["searchEmptyText"] != "검색 결과가 없습니다.":
            failures.append(f"{case['name']}: empty search guidance is not visible")
        if expectedSearchState == "error":
            if hydratedSnapshot["searchErrorText"] != "학습 검색을 불러오지 못했습니다.":
                failures.append(f"{case['name']}: search failure guidance is not visible")
            if not hydratedSnapshot["searchRetryVisible"]:
                failures.append(f"{case['name']}: search retry command is not visible")
        if (expectedPath or expectedQuery) and hydratedSnapshot["routeQueryPending"]:
            failures.append(f"{case['name']}: route query stayed pending after hydration")
        if ssrSnapshot["metadata"] != hydratedSnapshot["metadata"]:
            failures.append(f"{case['name']}: hydrated metadata differs from SSR metadata")
        if ssrSnapshot["structuredData"] != hydratedSnapshot["structuredData"]:
            failures.append(f"{case['name']}: hydrated structured data differs from SSR structured data")
        expectedAppFrameCount = 0 if lessonRef else 1
        if (
            hydratedSnapshot["rootCount"] != 1
            or hydratedSnapshot["appFrameCount"] != expectedAppFrameCount
        ):
            failures.append(f"{case['name']}: hydration duplicated the application root")
        expectedLessonCount = 0
        if hydratedSnapshot["lessonCount"] != expectedLessonCount:
            failures.append(
                f"{case['name']}: expected {expectedLessonCount} public lesson document, "
                f"found {hydratedSnapshot['lessonCount']}"
            )
        if observerError:
            failures.append(f"{case['name']}: layout shift observer failed: {observerError}")
        if firstVisualStateError:
            failures.append(
                f"{case['name']}: first visual state observer failed: "
                f"{firstVisualStateError}"
            )
        if cls > MAX_CLS:
            failures.append(f"{case['name']}: CLS {cls:.4f} exceeds {MAX_CLS:.2f}")
        for message in consoleMessages:
            lowered = message["text"].lower()
            if message["type"] in {"error", "pageerror"} or any(token in lowered for token in HYDRATION_ERROR_TOKENS):
                failures.append(
                    f"{case['name']}: browser {message['type']}: {message['text'][:240]}"
                )

        result = {
            "name": case["name"],
            "route": route,
            "lessonRef": lessonRef,
            "query": routeQuery,
            "delayClientMs": delayClientMs,
            "storedTheme": storedTheme,
            "colorScheme": colorScheme,
            "resolvedTheme": hydratedSnapshot["resolvedTheme"],
            "themeTransitions": hydratedSnapshot["themeTransitions"],
            "selectedPath": hydratedSnapshot["selectedPath"],
            "searchQuery": hydratedSnapshot["searchQuery"],
            "searchState": hydratedSnapshot["searchState"],
            "firstVisualState": hydratedSnapshot["firstVisualState"],
            "routeQueryPending": hydratedSnapshot["routeQueryPending"],
            "rootHtmlStable": ssrSnapshot["rootHtmlHash"] == hydratedSnapshot["rootHtmlHash"],
            "rootTextStable": ssrSnapshot["rootText"] == hydratedSnapshot["rootText"],
            "rootTransitionedToEditor": bool(
                lessonRef
                and ssrSnapshot["rootHtmlHash"] != hydratedSnapshot["rootHtmlHash"]
                and hydratedSnapshot["editorLessonRef"] == lessonRef
            ),
            "metadataStable": ssrSnapshot["metadata"] == hydratedSnapshot["metadata"],
            "metadataChanges": changedValues(ssrSnapshot["metadata"], hydratedSnapshot["metadata"]),
            "structuredDataStable": ssrSnapshot["structuredData"] == hydratedSnapshot["structuredData"],
            "rootCount": hydratedSnapshot["rootCount"],
            "appFrameCount": hydratedSnapshot["appFrameCount"],
            "lessonCount": hydratedSnapshot["lessonCount"],
            "editorLessonCount": hydratedSnapshot["editorLessonCount"],
            "editorLessonRef": hydratedSnapshot["editorLessonRef"],
            "cls": round(cls, 4),
            "consoleMessages": consoleMessages[:10],
            "passed": not failures,
        }
        return result, failures
    finally:
        ssrContext.close()
        hydratedContext.close()


def pageSnapshot(page: Any) -> dict[str, Any]:
    rootHtml = page.locator("#root").inner_html()
    rootText = " ".join(page.locator("#root").inner_text().split())
    metadata = page.evaluate(
        """
        () => ({
          title: document.title,
          canonical: document.querySelector('link[rel="canonical"]')?.href || null,
          description: document.querySelector('meta[name="description"]')?.content || null,
          ogType: document.querySelector('meta[property="og:type"]')?.content || null,
          ogTitle: document.querySelector('meta[property="og:title"]')?.content || null,
          ogDescription: document.querySelector('meta[property="og:description"]')?.content || null,
          ogUrl: document.querySelector('meta[property="og:url"]')?.content || null,
          ogImage: document.querySelector('meta[property="og:image"]')?.content || null,
          twitterCard: document.querySelector('meta[name="twitter:card"]')?.content || null,
          twitterTitle: document.querySelector('meta[name="twitter:title"]')?.content || null,
          twitterDescription: document.querySelector('meta[name="twitter:description"]')?.content || null,
          twitterImage: document.querySelector('meta[name="twitter:image"]')?.content || null,
        })
        """
    )
    structuredData = page.evaluate(
        """
        () => ['codaro-breadcrumb-jsonld', 'codaro-route-jsonld'].map((id) => {
          const element = document.getElementById(id);
          if (!element) return null;
          try { return JSON.parse(element.textContent); }
          catch (error) { return { invalid: String(error) }; }
        })
        """
    )
    lessonLocator = page.locator("[data-public-lesson]")
    lessonCount = lessonLocator.count()
    editorLessonLocator = page.locator("[data-learning-lesson-ref]")
    editorLessonCount = editorLessonLocator.count()
    selectedPathLocator = page.get_by_role("combobox", name="목표 경로")
    selectedPathCount = selectedPathLocator.count()
    return {
        "rootHtmlHash": hashlib.sha256(rootHtml.encode("utf-8")).hexdigest(),
        "rootText": rootText,
        "metadata": metadata,
        "structuredData": structuredData,
        "rootCount": page.locator("#root").count(),
        "appFrameCount": page.locator("#root .appFrame").count(),
        "lessonCount": lessonCount,
        "lessonRef": lessonLocator.first.get_attribute("data-public-lesson") if lessonCount else None,
        "editorLessonCount": editorLessonCount,
        "editorLessonRef": (
            editorLessonLocator.first.get_attribute("data-learning-lesson-ref")
            if editorLessonCount
            else None
        ),
        "resolvedTheme": page.evaluate(
            "document.documentElement.getAttribute('data-theme')"
        ),
        "themeTransitions": page.evaluate(
            "window.__codaroThemeTransitions || []"
        ),
        "selectedPath": (
            selectedPathLocator.evaluate("element => element.value || null")
            if selectedPathCount == 1
            else None
        ),
        "searchQuery": page.evaluate(
            "document.querySelector('.searchBox input')?.value || null"
        ),
        "searchState": page.evaluate(
            "document.querySelector('.searchResults')?.getAttribute('data-search-state') || null"
        ),
        "searchEmptyText": page.evaluate(
            "document.querySelector('[data-search-state=\"empty\"] .searchState strong')?.textContent || null"
        ),
        "searchErrorText": page.evaluate(
            "document.querySelector('[data-search-state=\"error\"] .searchState strong')?.textContent || null"
        ),
        "searchRetryVisible": page.evaluate(
            "Boolean(document.querySelector('[data-search-state=\"error\"] .searchRetry'))"
        ),
        "routeQueryPending": page.evaluate(
            "document.documentElement.getAttribute('data-route-query-pending')"
        ),
        "firstVisualState": page.evaluate(
            "window.__codaroFirstVisualState || null"
        ),
    }


def encodedRoute(route: str) -> str:
    if route == "/":
        return "/"
    return "/" + "/".join(quote(segment, safe="") for segment in route.strip("/").split("/"))


def changedValues(before: dict[str, Any], after: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        key: {"ssr": before.get(key), "hydrated": after.get(key)}
        for key in sorted(set(before) | set(after))
        if before.get(key) != after.get(key)
    }


def installChromium() -> tuple[bool, str]:
    try:
        result = subprocess.run(
            (sys.executable, "-m", "playwright", "install", "chromium", "--with-deps=false"),
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=600,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return False, str(exc)
    if result.returncode == 0:
        return True, ""
    return False, (result.stderr or result.stdout).strip()[-600:]


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
