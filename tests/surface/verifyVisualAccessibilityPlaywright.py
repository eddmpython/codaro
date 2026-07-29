from __future__ import annotations

import importlib.metadata
import json
import socket
import subprocess
import sys
import threading
import time
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Literal
from urllib.parse import urlsplit, urlunsplit


TESTS_ROOT = Path(__file__).resolve().parents[1]
if str(TESTS_ROOT) not in sys.path:
    sys.path.insert(0, str(TESTS_ROOT))

from browserStaticServer import StaticAppServer  # noqa: E402
from playwrightCli import repoLocalPlaywrightWorkspace  # noqa: E402


ROOT = Path(__file__).resolve().parents[2]
LANDING_BUILD = ROOT / "landing" / "build"
REPORT_ROOT = ROOT / "output" / "test-runner" / "visual-accessibility-browser"
REPORT_PATH = REPORT_ROOT / "visual-accessibility-report.json"
SCREENSHOT_ROOT = REPORT_ROOT / "screenshots"
SCHEMA_VERSION = 2
PLAYWRIGHT_VERSION = "1.61.0"
SOCIAL_ORDER = ["github", "support", "youtube", "threads"]
ACCOUNT_NUMBER = "1002-0421-4626"
MINIMUM_CONTRAST = 4.5


@dataclass(frozen=True)
class VisualAccessibilityCase:
    name: str
    engine: Literal["chromium", "firefox", "webkit"]
    product: Literal["landing", "run", "local"]
    route: str
    width: int
    height: int
    theme: Literal["light", "dark"]
    density: Literal["public", "learningComfortable", "studioDense"]
    reducedMotion: bool = False
    forcedColors: bool = False
    keyboardDialog: bool = False


VISUAL_ACCESSIBILITY_CASES = (
    VisualAccessibilityCase(
        name="chromium-landing-mobile-dark",
        engine="chromium",
        product="landing",
        route="/codaro/",
        width=320,
        height=720,
        theme="dark",
        density="public",
        keyboardDialog=True,
    ),
    VisualAccessibilityCase(
        name="chromium-landing-mobile-forced-colors",
        engine="chromium",
        product="landing",
        route="/codaro/",
        width=320,
        height=720,
        theme="light",
        density="public",
        forcedColors=True,
    ),
    VisualAccessibilityCase(
        name="chromium-landing-desktop-forced-colors",
        engine="chromium",
        product="landing",
        route="/codaro/",
        width=1440,
        height=900,
        theme="dark",
        density="public",
        forcedColors=True,
    ),
    VisualAccessibilityCase(
        name="chromium-learn-desktop-light",
        engine="chromium",
        product="landing",
        route="/codaro/learn/",
        width=1440,
        height=900,
        theme="light",
        density="learningComfortable",
    ),
    VisualAccessibilityCase(
        name="chromium-run-mobile-forced-colors",
        engine="chromium",
        product="run",
        route="/?surface=editor#editor",
        width=320,
        height=720,
        theme="dark",
        density="studioDense",
        forcedColors=True,
        keyboardDialog=True,
    ),
    VisualAccessibilityCase(
        name="chromium-run-desktop-reduced-motion",
        engine="chromium",
        product="run",
        route="/?surface=editor#editor",
        width=1440,
        height=900,
        theme="light",
        density="studioDense",
        reducedMotion=True,
    ),
    VisualAccessibilityCase(
        name="chromium-curriculum-minimum-dark",
        engine="chromium",
        product="run",
        route="/?surface=curriculum#curriculum",
        width=900,
        height=640,
        theme="dark",
        density="learningComfortable",
    ),
    VisualAccessibilityCase(
        name="chromium-local-run-minimum-light",
        engine="chromium",
        product="local",
        route="/?surface=editor#editor",
        width=900,
        height=640,
        theme="light",
        density="studioDense",
    ),
    VisualAccessibilityCase(
        name="firefox-landing-desktop-dark",
        engine="firefox",
        product="landing",
        route="/codaro/",
        width=1440,
        height=900,
        theme="dark",
        density="public",
        keyboardDialog=True,
    ),
    VisualAccessibilityCase(
        name="firefox-learn-mobile-light",
        engine="firefox",
        product="landing",
        route="/codaro/learn/",
        width=320,
        height=720,
        theme="light",
        density="learningComfortable",
    ),
    VisualAccessibilityCase(
        name="firefox-run-mobile-dark",
        engine="firefox",
        product="run",
        route="/?surface=editor#editor",
        width=390,
        height=844,
        theme="dark",
        density="studioDense",
        keyboardDialog=True,
    ),
    VisualAccessibilityCase(
        name="webkit-landing-mobile-light",
        engine="webkit",
        product="landing",
        route="/codaro/",
        width=320,
        height=720,
        theme="light",
        density="public",
        keyboardDialog=True,
    ),
    VisualAccessibilityCase(
        name="webkit-learn-desktop-dark",
        engine="webkit",
        product="landing",
        route="/codaro/learn/",
        width=1440,
        height=900,
        theme="dark",
        density="learningComfortable",
    ),
    VisualAccessibilityCase(
        name="webkit-run-desktop-light",
        engine="webkit",
        product="run",
        route="/?surface=editor#editor",
        width=900,
        height=640,
        theme="light",
        density="studioDense",
        keyboardDialog=True,
    ),
)


class QuietLandingHandler(SimpleHTTPRequestHandler):
    def log_message(self, _format: str, *args: object) -> None:
        return

    def copyfile(self, source: Any, outputfile: Any) -> None:
        try:
            super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
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
    browserVersions: dict[str, str] = {}
    landingServer: ThreadingHTTPServer | None = None
    landingThread: threading.Thread | None = None
    runServer: StaticAppServer | None = None
    localServer: StaticAppServer | None = None
    workspace = repoLocalPlaywrightWorkspace(ROOT, "visual-accessibility-browser")

    try:
        assertBuildsExist()
        assertPlaywrightVersion()
        landingServer, landingThread = startLandingServer()
        runServer = StaticAppServer(port=freePort(), runtimeTier="web")
        localServer = StaticAppServer(port=freePort(), runtimeTier="local")
        runServer.start()
        localServer.start()
        baseUrls = {
            "landing": f"http://127.0.0.1:{landingServer.server_address[1]}",
            "run": runServer.baseUrl,
            "local": localServer.baseUrl,
        }
        results, browserVersions, failures = runBrowserAudit(baseUrls, workspace)
    except (FileNotFoundError, OSError, RuntimeError, ValueError) as exc:
        failures.append(f"visual accessibility audit could not run: {type(exc).__name__}: {exc}")
    finally:
        if landingServer is not None:
            landingServer.shutdown()
            landingServer.server_close()
        if landingThread is not None:
            landingThread.join(timeout=4)
        if runServer is not None:
            runServer.stop()
        if localServer is not None:
            localServer.stop()

    payload = buildReport(
        startedAt=startedAt,
        startedMonotonic=started,
        results=results,
        failures=failures,
        browserVersions=browserVersions,
    )
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print(f"FAIL: visual accessibility matrix has {len(failures)} failure(s)", file=sys.stderr)
        return 1
    print(
        "ok: visual accessibility verified across "
        f"{len(results)} Chromium/Firefox/WebKit cases"
    )
    return 0


def assertBuildsExist() -> None:
    if not (LANDING_BUILD / "index.html").is_file():
        raise FileNotFoundError("landing build is missing; run npm run build in landing first")
    if not (ROOT / "src" / "codaro" / "webBuild" / "index.html").is_file():
        raise FileNotFoundError("editor webBuild is missing; run npm run build in editor first")


def assertPlaywrightVersion() -> None:
    installed = importlib.metadata.version("playwright")
    if installed != PLAYWRIGHT_VERSION:
        raise RuntimeError(f"Playwright version {installed} != locked {PLAYWRIGHT_VERSION}")


def startLandingServer() -> tuple[ThreadingHTTPServer, threading.Thread]:
    handler = partial(QuietLandingHandler, directory=str(LANDING_BUILD))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def runBrowserAudit(
    baseUrls: dict[str, str],
    workspace: Path,
) -> tuple[list[dict[str, Any]], dict[str, str], list[str]]:
    try:
        from playwright.sync_api import Error as PlaywrightError
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise RuntimeError("locked Playwright dependency is unavailable; run uv sync --extra dev") from exc

    results: list[dict[str, Any]] = []
    failures: list[str] = []
    versions: dict[str, str] = {}
    with sync_playwright() as playwright:
        for engine in ("chromium", "firefox", "webkit"):
            browser = None
            try:
                browserType = getattr(playwright, engine)
                browser = launchBrowser(browserType, engine, workspace)
                versions[engine] = browser.version
                for case in (item for item in VISUAL_ACCESSIBILITY_CASES if item.engine == engine):
                    result, caseFailures = auditCase(browser, case, baseUrls)
                    results.append(result)
                    failures.extend(caseFailures)
            except PlaywrightError as exc:
                failures.append(f"{engine}: browser audit failed: {exc}")
            except RuntimeError as exc:
                failures.append(f"{engine}: {exc}")
            finally:
                if browser is not None:
                    browser.close()
    return results, versions, failures


def launchBrowser(browserType: Any, engine: str, workspace: Path) -> Any:
    from playwright.sync_api import Error as PlaywrightError

    try:
        return browserType.launch(headless=True)
    except PlaywrightError:
        installResult = subprocess.run(
            (sys.executable, "-m", "playwright", "install", engine),
            cwd=workspace,
            text=True,
            encoding="utf-8",
            errors="replace",
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
            timeout=900,
        )
        if installResult.returncode != 0:
            raise RuntimeError(f"{engine} install failed: {installResult.stdout[-2000:]}")
        return browserType.launch(headless=True)


def auditCase(
    browser: Any,
    case: VisualAccessibilityCase,
    baseUrls: dict[str, str],
) -> tuple[dict[str, Any], list[str]]:
    caseStarted = time.monotonic()
    context = browser.new_context(
        color_scheme=case.theme,
        forced_colors="active" if case.forcedColors else "none",
        locale="ko-KR",
        reduced_motion="reduce" if case.reducedMotion else "no-preference",
        viewport={"width": case.width, "height": case.height},
    )
    context.add_init_script(script=seedThemeScript(case.theme))
    page = context.new_page()
    failures: list[str] = []
    url = f"{baseUrls[case.product]}{case.route}"
    result: dict[str, Any] = {
        "case": asdict(case),
        "url": url,
        "passed": False,
        "snapshot": None,
        "keyboard": None,
        "publicExperience": None,
        "publicKeyboardJourney": None,
        "screenshot": None,
    }
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=45_000)
        waitForSurface(page, case)
        snapshot = surfaceSnapshot(page)
        result["snapshot"] = snapshot
        failures.extend(validateSnapshot(case, snapshot))

        if case.product == "landing":
            publicExperience = publicExperienceSnapshot(page)
            result["publicExperience"] = publicExperience
            failures.extend(validatePublicExperience(case, publicExperience))

        if case.product == "landing" and case.route == "/codaro/":
            publicKeyboardJourney = publicKeyboardJourneyAudit(page, case)
            result["publicKeyboardJourney"] = publicKeyboardJourney
            failures.extend(validatePublicKeyboardJourney(case, publicKeyboardJourney))

        if case.keyboardDialog:
            keyboard = keyboardDialogAudit(page, case)
            result["keyboard"] = keyboard
            failures.extend(validateKeyboard(case, keyboard))

        page.evaluate("window.scrollTo(0, 0)")
        screenshotPath = SCREENSHOT_ROOT / case.engine / f"{case.name}.png"
        screenshotPath.parent.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(screenshotPath), full_page=False, animations="disabled", caret="hide")
        result["screenshot"] = screenshotPath.relative_to(ROOT).as_posix()
    except Exception as exc:  # noqa: BLE001 - preserve unexpected browser failures in the gate report
        failures.append(f"{case.name}: {type(exc).__name__}: {exc}")
        screenshotPath = SCREENSHOT_ROOT / "failures" / f"{case.name}.png"
        try:
            screenshotPath.parent.mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(screenshotPath), full_page=True)
            result["failureScreenshot"] = screenshotPath.relative_to(ROOT).as_posix()
        except Exception as screenshotExc:  # noqa: BLE001 - screenshot capture is best-effort evidence
            failures.append(
                f"{case.name}: failure screenshot unavailable: "
                f"{type(screenshotExc).__name__}: {screenshotExc}"
            )
    finally:
        result["durationMs"] = round((time.monotonic() - caseStarted) * 1000)
        result["passed"] = not failures
        result["failures"] = failures
        context.close()
    return result, failures


def seedThemeScript(theme: str) -> str:
    return f"""
    (() => {{
      window.localStorage.setItem("codaro-theme", {json.dumps(theme)});
      window.localStorage.removeItem("codaro-accent");
      window.localStorage.removeItem("codaro-run-route-v1:web");
      window.localStorage.removeItem("codaro-run-route-v1:local");
    }})();
    """


def waitForSurface(page: Any, case: VisualAccessibilityCase) -> None:
    page.wait_for_function(
        """
        ([theme, density]) => {
          const root = document.documentElement;
          const scope = document.querySelector('[data-astryx-theme="codaro"]');
          const densityOwner = scope?.matches(`[data-density="${density}"]`)
            ? scope
            : scope?.querySelector(`[data-density="${density}"]`);
          const social = document.querySelector('[data-social-links="codaro"]');
          return root.dataset.theme === theme
            && root.dataset.density === density
            && Boolean(scope)
            && Boolean(densityOwner)
            && Boolean(social);
        }
        """,
        arg=[case.theme, case.density],
        timeout=30_000,
    )
    page.evaluate("document.fonts?.ready")


def surfaceSnapshot(page: Any) -> dict[str, Any]:
    return page.evaluate(
        """
        async () => {
          const root = document.documentElement;
          const scope = document.querySelector('[data-astryx-theme="codaro"]');
          const social = document.querySelector('[data-social-links="codaro"]');
          const visible = (element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return !element.closest('[aria-hidden="true"]')
              && style.display !== "none"
              && style.visibility !== "hidden"
              && Number(style.opacity) > 0
              && rect.width > 0
              && rect.height > 0;
          };
          const accessibleName = (element) =>
            element.getAttribute("aria-label")
            || element.labels?.[0]?.textContent?.trim()
            || element.getAttribute("title")
            || element.textContent?.trim()
            || element.querySelector("img")?.getAttribute("alt")
            || "";
          const interactive = Array.from(
            document.querySelectorAll('button, a[href], input, select, textarea, summary, [role="button"]'),
          ).filter(visible);
          const duplicateIds = Array.from(document.querySelectorAll("[id]"))
            .map((element) => element.id)
            .filter((id, index, ids) => id && ids.indexOf(id) !== index);
          const ariaReferences = ["aria-controls", "aria-describedby", "aria-labelledby", "aria-owns"];
          const invalidAriaReferences = [];
          const deferredAriaControls = [];
          for (const element of document.querySelectorAll("*")) {
            for (const attribute of ariaReferences) {
              const value = element.getAttribute(attribute);
              if (!value) continue;
              for (const id of value.trim().split(/\\s+/)) {
                if (id && !document.getElementById(id)) {
                  if (attribute === "aria-controls" && element.getAttribute("aria-expanded") === "false") {
                    deferredAriaControls.push({id, tag: element.tagName.toLowerCase()});
                    continue;
                  }
                  invalidAriaReferences.push({attribute, id, tag: element.tagName.toLowerCase()});
                }
              }
            }
          }

          const loadFont = async (family, sample) => {
            const faces = await document.fonts.load(`16px "${family}"`, sample);
            return {family, loadedFaceCount: faces.length};
          };
          const fonts = await Promise.all([
            loadFont("Pretendard", "한글 학습"),
            loadFont("Space Grotesk", "Codaro"),
            loadFont("JetBrains Mono", "print()"),
          ]);
          await document.fonts.ready;

          const resolveColor = (value) => {
            const probe = document.createElement("span");
            probe.style.color = value;
            probe.style.display = "none";
            document.body.appendChild(probe);
            const color = getComputedStyle(probe).color;
            probe.remove();
            return color;
          };
          const rgb = (color) => {
            const match = color.match(/[\\d.]+/g);
            return match ? match.slice(0, 3).map(Number) : [0, 0, 0];
          };
          const luminance = (color) => {
            const channels = rgb(color).map((channel) => {
              const value = channel / 255;
              return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
          };
          const contrast = (foreground, background) => {
            const light = Math.max(luminance(foreground), luminance(background));
            const dark = Math.min(luminance(foreground), luminance(background));
            return Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100;
          };
          const token = (name) => getComputedStyle(scope).getPropertyValue(name).trim();
          const colorPairs = [
            ["textPrimaryOnBody", "--color-text-primary", "--color-background-body"],
            ["textSecondaryOnBody", "--color-text-secondary", "--color-background-body"],
            ["textPrimaryOnSurface", "--color-text-primary", "--color-background-surface"],
            ["textSecondaryOnSurface", "--color-text-secondary", "--color-background-surface"],
            ["accentOnBody", "--color-accent", "--color-background-body"],
          ].map(([name, foregroundToken, backgroundToken]) => {
            const foreground = resolveColor(token(foregroundToken));
            const background = resolveColor(token(backgroundToken));
            return {name, foreground, background, ratio: contrast(foreground, background)};
          });

          const themeToggle = interactive.find((element) => {
            const label = accessibleName(element);
            return label === "다크 모드로" || label === "라이트 모드로";
          });
          return {
            theme: root.dataset.theme ?? null,
            density: root.dataset.density ?? null,
            scopePresent: Boolean(scope),
            socialOrder: social
              ? Array.from(social.querySelectorAll('[data-social-link-id]')).map(
                  (element) => element.getAttribute("data-social-link-id"),
                )
              : [],
            socialVisible: Boolean(social && visible(social)),
            themeToggleVisible: Boolean(themeToggle && visible(themeToggle)),
            horizontalOverflowPx: Math.max(
              0,
              document.documentElement.scrollWidth - document.documentElement.clientWidth,
            ),
            duplicateIds: Array.from(new Set(duplicateIds)),
            unnamedInteractive: interactive
              .filter((element) => !accessibleName(element))
              .map((element) => ({
                tag: element.tagName.toLowerCase(),
                className: typeof element.className === "string" ? element.className : "",
                type: element.getAttribute("type"),
                role: element.getAttribute("role"),
                html: element.outerHTML.slice(0, 320),
              })),
            missingImageAltCount: Array.from(document.querySelectorAll("img"))
              .filter((image) => visible(image) && !image.hasAttribute("alt")).length,
            invalidAriaReferences,
            deferredAriaControls,
            fonts,
            fontStatus: document.fonts.status,
            colorPairs,
            reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
            forcedColors: matchMedia("(forced-colors: active)").matches,
            durationFast: token("--duration-fast"),
            durationMedium: token("--duration-medium"),
            durationSlow: token("--duration-slow"),
            forcedColorSocialBorder: social
              ? getComputedStyle(social.querySelector('[data-social-link-id="support"]')).borderStyle
              : null,
          };
        }
        """
    )


def publicExperienceSnapshot(page: Any) -> dict[str, Any]:
    return page.evaluate(
        """
        () => {
          const visible = (element) => {
            if (!element) return false;
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return !element.closest('[aria-hidden="true"]')
              && style.display !== "none"
              && style.visibility !== "hidden"
              && Number(style.opacity) > 0
              && rect.width > 0
              && rect.height > 0;
          };
          const normalize = (value) => String(value || "").replace(/\\s+/g, " ").trim();
          const routeKind = document.querySelector(".learnPage") ? "learn" : "home";
          const allElements = Array.from(document.querySelectorAll("*"));
          const elementIndex = (selector) => {
            const element = document.querySelector(selector);
            return element ? allElements.indexOf(element) : -1;
          };
          const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
            .filter(visible)
            .map((heading) => ({
              level: Number(heading.tagName.slice(1)),
              text: normalize(heading.textContent),
            }));
          const headingSkips = headings
            .map((heading, index) => ({
              from: index ? headings[index - 1].level : 0,
              to: heading.level,
              text: heading.text,
            }))
            .filter((item) => item.to > item.from + 1);
          const visualImages = Array.from(
            document.querySelectorAll("[data-visual-asset] img"),
          ).filter(visible);
          const brandLabel = document.querySelector(".publicBrand span");
          const homeOrderSelectors = [
            ".homeProductStatement",
            ".homeProductDetail",
            ".homeHeroActions",
            ".homeLocalLink",
            ".homeHeroProductFrame",
          ];
          const learnOrderSelectors = [
            ".learnUtilityHead",
            ".learnResumeBand",
            ".learnSearchBar",
            ".learnGuideBand",
            ".learnExplorerBand",
            ".learnCatalog",
            ".learnLocalBand",
          ];
          const forbiddenEditorialLabels = [
            "PYTHON, PROVEN BY RUNNING",
            "DATA REPORT",
            "SAFE AUTOMATION",
            "LEARN BY PROOF",
            "CHOOSE AN OUTCOME",
            "ONE PRODUCT, TWO RUNTIMES",
            "LOCAL NOTEBOOK",
            "LOCAL AUTOMATION",
            "CODARO LEARN",
            "OUTCOME PATHS",
            "LESSON FINDER",
            "MATCHING LESSONS",
          ];
          const bodyText = normalize(document.body.innerText);
          const forcedColorProof = Array.from(document.querySelectorAll(
            ".homeHeroProductFrame, .homeProofProductVisual, "
              + ".homeOutcomeStory, .homeRuntimeImage, .homeRuntimeFigure figcaption",
          )).filter(visible).map((element) => ({
            selector: element.className,
            borderStyle: getComputedStyle(element).borderStyle,
          }));
          return {
            routeKind,
            lang: document.documentElement.lang,
            landmarks: {
              headerCount: document.querySelectorAll("header.publicHeader").length,
              mainCount: document.querySelectorAll("#public-main > main").length,
              footerCount: document.querySelectorAll("footer.siteFooter").length,
              primaryNavLabel: document.querySelector(".publicPrimaryNav")?.getAttribute("aria-label") || "",
            },
            brand: {
              text: normalize(brandLabel?.textContent),
              visible: visible(brandLabel),
            },
            headings,
            headingSkips,
            h1Count: headings.filter((heading) => heading.level === 1).length,
            visualAltCount: visualImages.length,
            emptyVisualAlts: visualImages
              .filter((image) => !normalize(image.getAttribute("alt")))
              .map((image) => image.closest("[data-visual-asset]")?.getAttribute("data-visual-asset")),
            homeActionLabels: Array.from(
              document.querySelectorAll(".homeHeroActions a, .homeLocalLink"),
            ).filter(visible).map((element) => normalize(element.textContent)),
            homeOrder: homeOrderSelectors.map((selector) => ({
              selector,
              index: elementIndex(selector),
            })),
            learnOrder: learnOrderSelectors.map((selector) => ({
              selector,
              index: elementIndex(selector),
            })),
            requiredKoreanLabels: routeKind === "home"
              ? ["실행으로 증명하는 PYTHON", "실행과 검증으로 학습", "만들 결과 선택", "하나의 제품, 두 실행 환경"]
              : ["CODARO 학습", "결과 경로", "레슨 찾기"],
            missingKoreanLabels: (
              routeKind === "home"
                ? ["실행으로 증명하는 PYTHON", "실행과 검증으로 학습", "만들 결과 선택", "하나의 제품, 두 실행 환경"]
                : ["CODARO 학습", "결과 경로", "레슨 찾기"]
            ).filter((label) => !bodyText.includes(label)),
            forbiddenEditorialLabels: forbiddenEditorialLabels.filter(
              (label) => bodyText.includes(label),
            ),
            forcedColorProof,
            forcedColorImageAdjust: Array.from(new Set(
              visualImages.map((image) => getComputedStyle(image).forcedColorAdjust),
            )),
          };
        }
        """
    )


def publicKeyboardJourneyAudit(page: Any, case: VisualAccessibilityCase) -> dict[str, Any]:
    skipLink = page.locator(".publicSkipLink")
    skipLink.focus()
    skipFocus = activeElementSnapshot(page)
    skipTransform = skipLink.evaluate("(element) => getComputedStyle(element).transform")
    page.keyboard.press("Enter")
    page.wait_for_function(
        "() => document.activeElement?.id === 'public-main'",
        timeout=10_000,
    )
    skipTarget = activeElementSnapshot(page)

    page.evaluate("window.__codaroPublicKeyboardActivations = []")
    activationTargets = (
        ("primaryLesson", ".homeHeroPrimaryAction"),
        ("resultPaths", ".homeHeroSecondaryAction"),
        ("localExtension", ".homeLocalLink"),
    )
    activations: list[dict[str, Any]] = []
    for marker, selector in activationTargets:
        target = page.locator(selector).first
        target.focus()
        before = len(page.evaluate("window.__codaroPublicKeyboardActivations"))
        target.evaluate(
            """
            (element, marker) => {
              element.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
                window.__codaroPublicKeyboardActivations.push({
                  marker,
                  href: element.href,
                  label: element.textContent.replace(/\\s+/g, " ").trim(),
                });
              }, {capture: true, once: true});
            }
            """,
            marker,
        )
        page.keyboard.press("Enter")
        page.wait_for_function(
            "(count) => window.__codaroPublicKeyboardActivations.length > count",
            arg=before,
            timeout=10_000,
        )
        activation = page.evaluate("window.__codaroPublicKeyboardActivations.at(-1)")
        activation["focus"] = activeElementSnapshot(page)
        activations.append(activation)

    mobileMenu: dict[str, Any] | None = None
    menuToggle = page.locator(".publicMenuToggle")
    if menuToggle.is_visible():
        menuToggle.focus()
        page.keyboard.press("Enter")
        menu = page.locator("#public-mobile-menu")
        menu.wait_for(state="visible", timeout=10_000)
        expanded = menuToggle.get_attribute("aria-expanded")
        page.keyboard.press("Tab")
        plainTabFocus = activeElementSnapshot(page)
        firstMenuLink = menu.locator("a").first
        firstMenuTabIndex = firstMenuLink.evaluate("(element) => element.tabIndex")
        if case.engine == "webkit" and plainTabFocus.get("label") != "웹에서 시작":
            firstMenuLink.focus()
        firstMenuFocus = activeElementSnapshot(page)
        page.keyboard.press("Escape")
        menu.wait_for(state="detached", timeout=10_000)
        returnedFocus = activeElementSnapshot(page)
        mobileMenu = {
            "openedWithEnter": expanded == "true",
            "plainTabFocus": plainTabFocus,
            "firstMenuTabIndex": firstMenuTabIndex,
            "firstTabFocus": firstMenuFocus,
            "closedWithEscape": menu.count() == 0,
            "returnedFocus": returnedFocus,
        }

    return {
        "viewport": {"width": case.width, "height": case.height},
        "skipLink": {
            "focus": skipFocus,
            "focusedTransform": skipTransform,
            "target": skipTarget,
        },
        "activations": activations,
        "mobileMenu": mobileMenu,
    }


def keyboardDialogAudit(page: Any, case: VisualAccessibilityCase) -> dict[str, Any]:
    focused: list[str] = []
    focusIndicators: dict[str, dict[str, str]] = {}
    targets = [
        ("theme", page.get_by_role("button", name="다크 모드로", exact=True).or_(
            page.get_by_role("button", name="라이트 모드로", exact=True)
        ).first),
        *(
            (socialId, page.locator(f'[data-social-link-id="{socialId}"]').first)
            for socialId in SOCIAL_ORDER
        ),
    ]
    for marker, target in targets:
        active: dict[str, Any] = {}
        for _ in range(2):
            target.focus()
            page.evaluate(
                """
                () => new Promise((resolve) => requestAnimationFrame(
                  () => requestAnimationFrame(resolve)
                ))
                """
            )
            active = activeElementSnapshot(page)
            if active.get("marker") == marker:
                break
        if active.get("marker") == marker:
            focused.append(marker)
            focusIndicators[marker] = {
                "outlineStyle": str(active.get("outlineStyle") or ""),
                "outlineWidth": str(active.get("outlineWidth") or ""),
                "boxShadow": str(active.get("boxShadow") or ""),
            }

    tabOrder: list[str] = []
    targets[0][1].focus()
    for _ in range(8):
        active = activeElementSnapshot(page)
        marker = active.get("marker")
        if marker and marker not in tabOrder:
            tabOrder.append(marker)
        if marker and marker not in focusIndicators:
            focusIndicators[marker] = {
                "outlineStyle": str(active.get("outlineStyle") or ""),
                "outlineWidth": str(active.get("outlineWidth") or ""),
                "boxShadow": str(active.get("boxShadow") or ""),
            }
        page.keyboard.press("Tab")
        if marker == "threads":
            break

    support = page.locator('[data-social-link-id="support"]').first
    support.focus()
    page.keyboard.press("Enter")
    dialog = page.locator('[data-support-dialog="codaro"]')
    dialog.wait_for(state="visible", timeout=10_000)
    page.wait_for_function(
        "() => document.activeElement?.getAttribute('aria-label') === '닫기'",
        timeout=10_000,
    )
    firstFocus = activeElementSnapshot(page)
    page.keyboard.press("Shift+Tab")
    shiftTabFocus = activeElementSnapshot(page)
    page.keyboard.press("Tab")
    wrappedFocus = activeElementSnapshot(page)
    accountNumber = dialog.locator('[data-support-account-number="codaro"]').inner_text().strip()
    dialogLabel = dialog.get_attribute("aria-label")
    dialogLayout = page.evaluate(
        """
        () => {
          const dialog = document.querySelector(".codaroSupportDialog");
          const header = document.querySelector(".codaroSupportHeader");
          const body = document.querySelector(".codaroSupportBody");
          const ways = document.querySelector(".codaroSupportWays");
          const rect = dialog?.getBoundingClientRect();
          const headerStyle = header ? getComputedStyle(header) : null;
          const bodyStyle = body ? getComputedStyle(body) : null;
          const waysStyle = ways ? getComputedStyle(ways) : null;
          return {
            viewportWidth: window.innerWidth,
            dialogLeft: rect?.left ?? null,
            dialogRight: rect?.right ?? null,
            dialogWidth: rect?.width ?? null,
            headerPaddingLeft: headerStyle?.paddingLeft ?? null,
            headerPaddingRight: headerStyle?.paddingRight ?? null,
            bodyPaddingLeft: bodyStyle?.paddingLeft ?? null,
            bodyPaddingRight: bodyStyle?.paddingRight ?? null,
            bodyGap: bodyStyle?.gap ?? null,
            waysColumns: waysStyle?.gridTemplateColumns ?? null,
          };
        }
        """
    )
    dialogContrast = page.evaluate(
        """
        () => {
          const selectors = [
            ".codaroSupportHeader h2",
            ".codaroSupportHero p",
            ".codaroSupportSection h3",
            ".codaroSupportWays a",
            ".codaroSupportRow strong",
            ".codaroSupportRow > span",
            ".codaroSupportAccount button",
            ".codaroSupportNote",
          ];
          const rgb = (color) => {
            const match = color.match(/[\\d.]+/g);
            return match ? match.slice(0, 3).map(Number) : [0, 0, 0];
          };
          const luminance = (color) => {
            const channels = rgb(color).map((channel) => {
              const value = channel / 255;
              return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
          };
          const contrast = (foreground, background) => {
            const light = Math.max(luminance(foreground), luminance(background));
            const dark = Math.min(luminance(foreground), luminance(background));
            return Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100;
          };
          const nearestBackground = (element) => {
            let current = element;
            while (current) {
              const color = getComputedStyle(current).backgroundColor;
              const channels = color.match(/[\\d.]+/g)?.map(Number) || [];
              const alpha = channels.length > 3 ? channels[3] : 1;
              if (alpha > 0) return color;
              current = current.parentElement;
            }
            return "rgb(17, 17, 20)";
          };
          return selectors.map((selector) => {
            const element = document.querySelector(selector);
            if (!element) return {selector, missing: true};
            const foreground = getComputedStyle(element).color;
            const background = nearestBackground(element);
            return {selector, foreground, background, ratio: contrast(foreground, background)};
          });
        }
        """
    )
    dialogScreenshotPath = SCREENSHOT_ROOT / case.engine / f"{case.name}-support-dialog.png"
    dialogScreenshotPath.parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(dialogScreenshotPath), full_page=False)
    page.keyboard.press("Escape")
    dialog.wait_for(state="detached", timeout=10_000)
    returnedFocus = activeElementSnapshot(page)
    return {
        "focusedTopControls": focused,
        "topLaneTabOrder": tabOrder,
        "focusIndicators": focusIndicators,
        "firstDialogFocus": firstFocus,
        "shiftTabFocus": shiftTabFocus,
        "wrappedFocus": wrappedFocus,
        "accountNumber": accountNumber,
        "dialogLabel": dialogLabel,
        "dialogLayout": dialogLayout,
        "dialogContrast": dialogContrast,
        "dialogScreenshot": dialogScreenshotPath.relative_to(ROOT).as_posix(),
        "dialogClosedWithEscape": dialog.count() == 0,
        "returnedFocus": returnedFocus,
    }


def activeElementSnapshot(page: Any) -> dict[str, Any]:
    return page.evaluate(
        """
        () => {
          const element = document.activeElement;
          if (!(element instanceof HTMLElement)) return {};
          const label = element.getAttribute("aria-label")
            || element.getAttribute("title")
            || element.textContent?.trim()
            || "";
          const socialId = element.getAttribute("data-social-link-id");
          const marker = socialId
            || (label === "다크 모드로" || label === "라이트 모드로" ? "theme" : null);
          const style = getComputedStyle(element);
          return {
            marker,
            id: element.id || null,
            label,
            href: element instanceof HTMLAnchorElement ? element.href : null,
            socialId,
            tag: element.tagName.toLowerCase(),
            insideDialog: Boolean(element.closest('[data-support-dialog="codaro"]')),
            outlineStyle: style.outlineStyle,
            outlineWidth: style.outlineWidth,
            boxShadow: style.boxShadow,
          };
        }
        """
    )


def validateSnapshot(case: VisualAccessibilityCase, snapshot: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    prefix = case.name
    if snapshot.get("theme") != case.theme:
        failures.append(f"{prefix}: theme {snapshot.get('theme')!r} != {case.theme!r}")
    if snapshot.get("density") != case.density:
        failures.append(f"{prefix}: density {snapshot.get('density')!r} != {case.density!r}")
    if snapshot.get("scopePresent") is not True:
        failures.append(f"{prefix}: Astryx theme scope is missing")
    if snapshot.get("socialOrder") != SOCIAL_ORDER:
        failures.append(f"{prefix}: social order drifted: {snapshot.get('socialOrder')}")
    if snapshot.get("socialVisible") is not True:
        failures.append(f"{prefix}: shared social controls are not visible")
    if snapshot.get("themeToggleVisible") is not True:
        failures.append(f"{prefix}: theme toggle is not visible")
    if snapshot.get("horizontalOverflowPx", 0) > 1:
        failures.append(f"{prefix}: horizontal overflow is {snapshot.get('horizontalOverflowPx')}px")
    if snapshot.get("duplicateIds"):
        failures.append(f"{prefix}: duplicate IDs: {snapshot.get('duplicateIds')}")
    if snapshot.get("unnamedInteractive"):
        failures.append(f"{prefix}: unnamed interactive controls: {snapshot.get('unnamedInteractive')}")
    if snapshot.get("missingImageAltCount") != 0:
        failures.append(f"{prefix}: visible images without alt: {snapshot.get('missingImageAltCount')}")
    if snapshot.get("invalidAriaReferences"):
        failures.append(f"{prefix}: invalid ARIA references: {snapshot.get('invalidAriaReferences')}")
    if snapshot.get("fontStatus") != "loaded":
        failures.append(f"{prefix}: font status is {snapshot.get('fontStatus')!r}")
    for font in snapshot.get("fonts", []):
        if font.get("loadedFaceCount", 0) < 1:
            failures.append(f"{prefix}: {font.get('family')} did not load")
    if not case.forcedColors:
        for pair in snapshot.get("colorPairs", []):
            if pair.get("ratio", 0) < MINIMUM_CONTRAST:
                failures.append(
                    f"{prefix}: {pair.get('name')} contrast {pair.get('ratio')} < {MINIMUM_CONTRAST}"
                )
    if snapshot.get("reducedMotion") is not case.reducedMotion:
        failures.append(f"{prefix}: reduced-motion media state drifted")
    if case.reducedMotion:
        durations = (
            snapshot.get("durationFast"),
            snapshot.get("durationMedium"),
            snapshot.get("durationSlow"),
        )
        if durations != ("1ms", "1ms", "1ms"):
            failures.append(f"{prefix}: reduced-motion duration tokens drifted: {durations}")
    if snapshot.get("forcedColors") is not case.forcedColors:
        failures.append(f"{prefix}: forced-colors media state drifted")
    if case.forcedColors and snapshot.get("forcedColorSocialBorder") in {None, "none"}:
        failures.append(f"{prefix}: forced-colors social border is missing")
    return failures


def validatePublicExperience(
    case: VisualAccessibilityCase,
    experience: dict[str, Any],
) -> list[str]:
    failures: list[str] = []
    prefix = case.name
    expectedRouteKind = "learn" if "/learn/" in case.route else "home"
    if experience.get("routeKind") != expectedRouteKind:
        failures.append(
            f"{prefix}: public route kind {experience.get('routeKind')!r} != {expectedRouteKind!r}"
        )
    if experience.get("lang") != "ko":
        failures.append(f"{prefix}: public document language is not Korean")
    expectedLandmarks = {
        "headerCount": 1,
        "mainCount": 1,
        "footerCount": 1,
        "primaryNavLabel": "주요 탐색",
    }
    for key, expected in expectedLandmarks.items():
        if experience.get("landmarks", {}).get(key) != expected:
            failures.append(
                f"{prefix}: public landmark {key} drifted: "
                f"{experience.get('landmarks', {}).get(key)!r}"
            )
    brandSnapshot = experience.get("brand", {})
    if brandSnapshot.get("text") != "Codaro" or brandSnapshot.get("visible") is not True:
        failures.append(f"{prefix}: visible Codaro brand label is missing: {brandSnapshot}")
    if experience.get("h1Count") != 1:
        failures.append(f"{prefix}: expected exactly one visible h1")
    if experience.get("headingSkips"):
        failures.append(f"{prefix}: heading levels skip: {experience.get('headingSkips')}")
    if experience.get("visualAltCount", 0) < 1:
        failures.append(f"{prefix}: no visible product proof image was found")
    if experience.get("emptyVisualAlts"):
        failures.append(
            f"{prefix}: product proof image alt text is empty: {experience.get('emptyVisualAlts')}"
        )
    if experience.get("missingKoreanLabels"):
        failures.append(
            f"{prefix}: Korean editorial labels are missing: {experience.get('missingKoreanLabels')}"
        )
    if experience.get("forbiddenEditorialLabels"):
        failures.append(
            f"{prefix}: English editorial labels remain: "
            f"{experience.get('forbiddenEditorialLabels')}"
        )

    orderKey = "learnOrder" if expectedRouteKind == "learn" else "homeOrder"
    order = experience.get(orderKey, [])
    indexes = [item.get("index", -1) for item in order]
    if any(index < 0 for index in indexes) or indexes != sorted(set(indexes)):
        failures.append(f"{prefix}: public reading order drifted: {order}")

    if expectedRouteKind == "home":
        expectedActions = [
            "웹에서 첫 레슨 실행",
            "학습 경로 보기",
            "Windows Local 받기",
        ]
        if experience.get("homeActionLabels") != expectedActions:
            failures.append(
                f"{prefix}: Web-first action order drifted: {experience.get('homeActionLabels')}"
            )

    if case.forcedColors:
        proofBorders = experience.get("forcedColorProof", [])
        if not proofBorders:
            failures.append(f"{prefix}: forced-colors product proof borders are missing")
        for border in proofBorders:
            if border.get("borderStyle") in {None, "", "none"}:
                failures.append(
                    f"{prefix}: forced-colors proof boundary is missing: {border}"
                )
        if experience.get("forcedColorImageAdjust") != ["none"]:
            failures.append(
                f"{prefix}: product images are not preserved in forced colors: "
                f"{experience.get('forcedColorImageAdjust')}"
            )
    return failures


def validatePublicKeyboardJourney(
    case: VisualAccessibilityCase,
    keyboard: dict[str, Any],
) -> list[str]:
    failures: list[str] = []
    prefix = case.name
    skipLink = keyboard.get("skipLink", {})
    if skipLink.get("focus", {}).get("label") != "본문으로 건너뛰기":
        failures.append(f"{prefix}: skip link did not accept keyboard focus")
    if skipLink.get("target", {}).get("id") != "public-main":
        failures.append(f"{prefix}: skip link did not move focus to public-main")

    activations = keyboard.get("activations", [])
    expectedMarkers = ["primaryLesson", "resultPaths", "localExtension"]
    if [activation.get("marker") for activation in activations] != expectedMarkers:
        failures.append(f"{prefix}: public action activation order drifted: {activations}")
    expectedLabels = {
        "primaryLesson": "웹에서 첫 레슨 실행",
        "resultPaths": "학습 경로 보기",
        "localExtension": "Windows Local 받기",
    }
    for activation in activations:
        marker = activation.get("marker")
        if activation.get("label") != expectedLabels.get(marker):
            failures.append(f"{prefix}: {marker} keyboard label drifted: {activation}")
        if activation.get("focus", {}).get("tag") != "a":
            failures.append(f"{prefix}: {marker} did not retain anchor focus")
    activationByMarker = {
        activation.get("marker"): activation
        for activation in activations
    }
    if "/learn/lesson/" not in str(activationByMarker.get("primaryLesson", {}).get("href") or ""):
        failures.append(f"{prefix}: primary lesson keyboard target drifted")
    if "/learn" not in str(activationByMarker.get("resultPaths", {}).get("href") or ""):
        failures.append(f"{prefix}: result path keyboard target drifted")
    if not str(activationByMarker.get("localExtension", {}).get("href") or "").startswith(
        ("https://", "http://")
    ):
        failures.append(f"{prefix}: Local extension keyboard target is not absolute")

    mobileMenu = keyboard.get("mobileMenu")
    if case.width <= 820:
        if not isinstance(mobileMenu, dict):
            failures.append(f"{prefix}: mobile navigation keyboard audit is missing")
        else:
            if mobileMenu.get("openedWithEnter") is not True:
                failures.append(f"{prefix}: Enter did not open the mobile menu")
            if mobileMenu.get("firstMenuTabIndex") != 0:
                failures.append(f"{prefix}: mobile menu first link is not in the Tab order")
            if mobileMenu.get("firstTabFocus", {}).get("label") != "웹에서 시작":
                failures.append(f"{prefix}: mobile menu first link did not accept focus")
            if (
                case.engine != "webkit"
                and mobileMenu.get("plainTabFocus", {}).get("label") != "웹에서 시작"
            ):
                failures.append(f"{prefix}: mobile menu first Tab target drifted")
            if mobileMenu.get("closedWithEscape") is not True:
                failures.append(f"{prefix}: Escape did not close the mobile menu")
            if mobileMenu.get("returnedFocus", {}).get("label") != "메뉴 열기":
                failures.append(f"{prefix}: mobile menu did not return focus to its trigger")
    elif mobileMenu is not None:
        failures.append(f"{prefix}: hidden mobile menu was audited on desktop")
    return failures


def validateKeyboard(case: VisualAccessibilityCase, keyboard: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    prefix = case.name
    reached = set(keyboard.get("focusedTopControls", [])) | set(keyboard.get("topLaneTabOrder", []))
    expected = {"theme", *SOCIAL_ORDER}
    if not expected.issubset(reached):
        failures.append(f"{prefix}: top controls did not accept focus: {sorted(expected - reached)}")
    tabOrder = keyboard.get("topLaneTabOrder", [])
    expectedTabOrder = ["theme", "support"] if case.engine == "webkit" else ["theme", *SOCIAL_ORDER]
    if not orderedSubset(expectedTabOrder, tabOrder):
        failures.append(f"{prefix}: top control Tab order drifted: {tabOrder}")
    supportFocus = keyboard.get("focusIndicators", {}).get("support", {})
    outlineWidth = parseCssPixels(str(supportFocus.get("outlineWidth") or "0"))
    if (
        supportFocus.get("outlineStyle") in {None, "", "none"}
        and outlineWidth < 1
        and supportFocus.get("boxShadow") in {None, "", "none"}
    ):
        failures.append(f"{prefix}: support keyboard focus indicator is missing")
    first = keyboard.get("firstDialogFocus", {})
    if first.get("label") != "닫기" or first.get("insideDialog") is not True:
        failures.append(f"{prefix}: dialog did not focus its close button first")
    shiftTab = keyboard.get("shiftTabFocus", {})
    if shiftTab.get("insideDialog") is not True or not str(shiftTab.get("label") or "").startswith(
        f"계좌번호 {ACCOUNT_NUMBER} 복사"
    ):
        failures.append(f"{prefix}: Shift+Tab did not wrap to the last dialog control")
    wrapped = keyboard.get("wrappedFocus", {})
    if wrapped.get("label") != "닫기" or wrapped.get("insideDialog") is not True:
        failures.append(f"{prefix}: Tab did not wrap to the first dialog control")
    if keyboard.get("accountNumber") != ACCOUNT_NUMBER:
        failures.append(f"{prefix}: support account number drifted")
    if keyboard.get("dialogLabel") != "후원·기여":
        failures.append(f"{prefix}: support dialog label drifted")
    layout = keyboard.get("dialogLayout", {})
    if (
        layout.get("dialogLeft") is None
        or layout.get("dialogRight") is None
        or layout.get("dialogLeft") < -1
        or layout.get("dialogRight") > layout.get("viewportWidth", 0) + 1
    ):
        failures.append(f"{prefix}: support dialog escaped the viewport: {layout}")
    for key in ("headerPaddingLeft", "headerPaddingRight", "bodyPaddingLeft", "bodyPaddingRight"):
        if parseCssPixels(str(layout.get(key) or "0")) < 12:
            failures.append(f"{prefix}: support dialog {key} collapsed: {layout.get(key)}")
    if not case.forcedColors:
        for pair in keyboard.get("dialogContrast", []):
            if pair.get("missing"):
                failures.append(f"{prefix}: support dialog contrast target is missing: {pair.get('selector')}")
            elif pair.get("ratio", 0) < MINIMUM_CONTRAST:
                failures.append(
                    f"{prefix}: support dialog {pair.get('selector')} contrast "
                    f"{pair.get('ratio')} < {MINIMUM_CONTRAST}"
                )
    if keyboard.get("dialogClosedWithEscape") is not True:
        failures.append(f"{prefix}: Escape did not close the support dialog")
    returned = keyboard.get("returnedFocus", {})
    if returned.get("socialId") != "support":
        failures.append(f"{prefix}: support dialog did not return focus to its trigger")
    return failures


def parseCssPixels(value: str) -> float:
    try:
        return float(value.removesuffix("px"))
    except ValueError:
        return 0.0


def orderedSubset(expected: list[str], actual: list[str]) -> bool:
    position = 0
    for value in actual:
        if position < len(expected) and value == expected[position]:
            position += 1
    return position == len(expected)


def buildReport(
    *,
    startedAt: str,
    startedMonotonic: float,
    results: list[dict[str, Any]],
    failures: list[str],
    browserVersions: dict[str, str],
) -> dict[str, Any]:
    completedAt = utcTimestamp()
    return {
        "schemaVersion": SCHEMA_VERSION,
        "gate": "visual-accessibility-browser",
        "passed": not failures and len(results) == len(VISUAL_ACCESSIBILITY_CASES),
        "status": "passed" if not failures and len(results) == len(VISUAL_ACCESSIBILITY_CASES) else "failed",
        "gitHead": currentGitHead(),
        "startedAt": startedAt,
        "completedAt": completedAt,
        "durationMs": round((time.monotonic() - startedMonotonic) * 1000),
        "playwright": {
            "packageVersion": installedPlaywrightVersion(),
            "lockedVersion": PLAYWRIGHT_VERSION,
            "browserVersions": browserVersions,
        },
        "matrix": {
            "caseCount": len(VISUAL_ACCESSIBILITY_CASES),
            "completedCaseCount": len(results),
            "engines": sorted({case.engine for case in VISUAL_ACCESSIBILITY_CASES}),
            "products": sorted({case.product for case in VISUAL_ACCESSIBILITY_CASES}),
            "viewportWidths": sorted({case.width for case in VISUAL_ACCESSIBILITY_CASES}),
            "themes": sorted({case.theme for case in VISUAL_ACCESSIBILITY_CASES}),
            "forcedColorsCaseCount": sum(case.forcedColors for case in VISUAL_ACCESSIBILITY_CASES),
            "reducedMotionCaseCount": sum(case.reducedMotion for case in VISUAL_ACCESSIBILITY_CASES),
            "keyboardDialogCaseCount": sum(case.keyboardDialog for case in VISUAL_ACCESSIBILITY_CASES),
            "publicExperienceCaseCount": sum(
                case.product == "landing" for case in VISUAL_ACCESSIBILITY_CASES
            ),
            "publicKeyboardJourneyCaseCount": sum(
                case.product == "landing" and case.route == "/codaro/"
                for case in VISUAL_ACCESSIBILITY_CASES
            ),
        },
        "machineEvidenceScope": [
            "Chromium, Firefox, WebKit representative rendering",
            "320px, 390px, 900px, 1440px horizontal overflow",
            "shared theme toggle and social control order",
            "keyboard reach, focus indicator, modal focus trap, Escape close, focus return",
            "font loading, token contrast, reduced motion, forced colors",
            "duplicate IDs, accessible names, image alt, ARIA reference integrity",
            "public landmark and heading hierarchy, DOM reading order, Korean editorial labels",
            "Web-first CTA, learning path, Local extension keyboard activation",
            "mobile menu Enter open, link focusability, Escape close, focus return",
            "public product-proof boundaries and images in mobile and desktop forced colors",
        ],
        "manualEvidenceNotClaimed": [
            "installed Windows WebView2 rendering",
            "NVDA, Narrator, VoiceOver, TalkBack screen-reader output",
            "IME composition and operating-system zoom behavior",
            "independent human accessibility review",
            "independent human brand review",
        ],
        "failureCount": len(failures),
        "failures": failures,
        "cases": results,
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }


def installedPlaywrightVersion() -> str | None:
    try:
        return importlib.metadata.version("playwright")
    except importlib.metadata.PackageNotFoundError:
        return None


def currentGitHead() -> str | None:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    return result.stdout.strip() or None if result.returncode == 0 else None


def freePort() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


if __name__ == "__main__":
    raise SystemExit(main())
