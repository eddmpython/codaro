from __future__ import annotations

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
REPORT_PATH = ROOT / "output" / "test-runner" / "theme-runtime-browser" / "theme-runtime-report.json"
SCHEMA_VERSION = 1
CANVAS_COLORS = {"light": "#f5f6f8", "dark": "#151619"}
CANVAS_RGB_COLORS = {"light": "rgb(245, 246, 248)", "dark": "rgb(21, 22, 25)"}


@dataclass(frozen=True)
class ThemeRuntimeCase:
    name: str
    product: Literal["landing", "run", "local"]
    route: str
    storedTheme: Literal["light", "dark"] | None
    osTheme: Literal["light", "dark"]
    reducedMotion: bool
    expectedTheme: Literal["light", "dark"]
    expectedDensity: Literal["public", "learningComfortable", "studioDense"]
    expectedAccent: Literal["plum", "blue", "teal"]
    togglePersistence: bool = False
    systemLiveSwitch: bool = False


THEME_RUNTIME_CASES = (
    ThemeRuntimeCase(
        name="landing-stored-light-over-os-dark",
        product="landing",
        route="/codaro/",
        storedTheme="light",
        osTheme="dark",
        reducedMotion=False,
        expectedTheme="light",
        expectedDensity="public",
        expectedAccent="plum",
    ),
    ThemeRuntimeCase(
        name="landing-stored-dark-toggle-reload",
        product="landing",
        route="/codaro/",
        storedTheme="dark",
        osTheme="light",
        reducedMotion=False,
        expectedTheme="dark",
        expectedDensity="public",
        expectedAccent="plum",
        togglePersistence=True,
    ),
    ThemeRuntimeCase(
        name="landing-system-live-switch",
        product="landing",
        route="/codaro/",
        storedTheme=None,
        osTheme="light",
        reducedMotion=False,
        expectedTheme="light",
        expectedDensity="public",
        expectedAccent="plum",
        systemLiveSwitch=True,
    ),
    ThemeRuntimeCase(
        name="landing-learning-reduced-motion",
        product="landing",
        route="/codaro/learn/",
        storedTheme=None,
        osTheme="dark",
        reducedMotion=True,
        expectedTheme="dark",
        expectedDensity="learningComfortable",
        expectedAccent="plum",
    ),
    ThemeRuntimeCase(
        name="run-stored-light-teal-over-os-dark",
        product="run",
        route="/?surface=editor#editor",
        storedTheme="light",
        osTheme="dark",
        reducedMotion=False,
        expectedTheme="light",
        expectedDensity="studioDense",
        expectedAccent="teal",
    ),
    ThemeRuntimeCase(
        name="run-stored-dark-blue-toggle-reload",
        product="run",
        route="/?surface=editor#editor",
        storedTheme="dark",
        osTheme="light",
        reducedMotion=False,
        expectedTheme="dark",
        expectedDensity="studioDense",
        expectedAccent="blue",
        togglePersistence=True,
    ),
    ThemeRuntimeCase(
        name="local-system-live-switch",
        product="local",
        route="/?surface=editor#editor",
        storedTheme=None,
        osTheme="light",
        reducedMotion=False,
        expectedTheme="light",
        expectedDensity="studioDense",
        expectedAccent="plum",
        systemLiveSwitch=True,
    ),
    ThemeRuntimeCase(
        name="local-learning-reduced-motion",
        product="local",
        route="/?surface=curriculum#curriculum",
        storedTheme=None,
        osTheme="dark",
        reducedMotion=True,
        expectedTheme="dark",
        expectedDensity="learningComfortable",
        expectedAccent="plum",
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
    browserVersion: str | None = None
    landingServer: ThreadingHTTPServer | None = None
    landingThread: threading.Thread | None = None
    runServer: StaticAppServer | None = None
    localServer: StaticAppServer | None = None
    workspace = repoLocalPlaywrightWorkspace(ROOT, "theme-runtime-browser")

    try:
        assertBuildsExist()
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
        results, browserVersion, failures = runBrowserAudit(baseUrls, workspace)
    except (FileNotFoundError, OSError, RuntimeError, ValueError) as exc:
        failures.append(f"theme runtime audit could not run: {type(exc).__name__}: {exc}")
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
        browserVersion=browserVersion,
    )
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print(f"FAIL: theme runtime browser matrix has {len(failures)} failure(s)", file=sys.stderr)
        return 1
    print(f"ok: theme runtime verified across {len(results)} Landing/Run/Local cases")
    return 0


def assertBuildsExist() -> None:
    if not (LANDING_BUILD / "index.html").is_file():
        raise FileNotFoundError("landing build is missing; run npm run build in landing first")
    if not (ROOT / "src" / "codaro" / "webBuild" / "index.html").is_file():
        raise FileNotFoundError("editor webBuild is missing; run npm run build in editor first")


def startLandingServer() -> tuple[ThreadingHTTPServer, threading.Thread]:
    handler = partial(QuietLandingHandler, directory=str(LANDING_BUILD))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def runBrowserAudit(
    baseUrls: dict[str, str],
    workspace: Path,
) -> tuple[list[dict[str, Any]], str | None, list[str]]:
    try:
        from playwright.sync_api import Error as PlaywrightError
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise RuntimeError("Playwright is unavailable; run this verifier with uv --with playwright") from exc

    results: list[dict[str, Any]] = []
    failures: list[str] = []
    browserVersion: str | None = None
    with sync_playwright() as playwright:
        browser = None
        try:
            try:
                browser = playwright.chromium.launch(headless=True)
            except PlaywrightError:
                installResult = subprocess.run(
                    (sys.executable, "-m", "playwright", "install", "chromium"),
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
                    raise RuntimeError(f"Chromium install failed: {installResult.stdout[-2000:]}")
                browser = playwright.chromium.launch(headless=True)
            browserVersion = browser.version
            for case in THEME_RUNTIME_CASES:
                result, caseFailures = auditCase(browser, case, baseUrls, workspace)
                results.append(result)
                failures.extend(caseFailures)
        except PlaywrightError as exc:
            raise RuntimeError(f"Chromium theme runtime audit failed: {exc}") from exc
        finally:
            if browser is not None:
                browser.close()
    return results, browserVersion, failures


def auditCase(
    browser: Any,
    case: ThemeRuntimeCase,
    baseUrls: dict[str, str],
    workspace: Path,
) -> tuple[dict[str, Any], list[str]]:
    caseStarted = time.monotonic()
    context = browser.new_context(
        color_scheme=case.osTheme,
        reduced_motion="reduce" if case.reducedMotion else "no-preference",
        locale="ko-KR",
        viewport={"width": 1280, "height": 900},
    )
    context.add_init_script(script=seedPreferencesScript(case))
    page = context.new_page()
    failures: list[str] = []
    url = f"{baseUrls[case.product]}{case.route}"
    result: dict[str, Any] = {
        "case": asdict(case),
        "url": url,
        "passed": False,
        "initial": None,
        "afterSystemSwitch": None,
        "afterToggle": None,
        "afterReload": None,
    }
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=45_000)
        expectedSurface = expectedProductSurface(case)
        waitForRuntimeState(page, case.expectedTheme, case.expectedDensity, expectedSurface)
        initial = runtimeSnapshot(page)
        result["initial"] = initial
        failures.extend(validateSnapshot(case, initial, phase="initial"))

        if case.systemLiveSwitch:
            switchedTheme = oppositeTheme(case.expectedTheme)
            page.emulate_media(color_scheme=switchedTheme)
            waitForRuntimeState(page, switchedTheme, case.expectedDensity, expectedSurface)
            afterSystemSwitch = runtimeSnapshot(page)
            result["afterSystemSwitch"] = afterSystemSwitch
            failures.extend(validateSnapshot(case, afterSystemSwitch, phase="system-switch", expectedTheme=switchedTheme))

        if case.togglePersistence:
            toggledTheme = oppositeTheme(case.expectedTheme)
            toggleLabel = "라이트 모드로" if case.expectedTheme == "dark" else "다크 모드로"
            toggle = page.get_by_role("button", name=toggleLabel, exact=True).first
            toggle.wait_for(state="visible", timeout=20_000)
            toggle.click()
            waitForRuntimeState(page, toggledTheme, case.expectedDensity, expectedSurface)
            afterToggle = runtimeSnapshot(page)
            result["afterToggle"] = afterToggle
            failures.extend(validateSnapshot(case, afterToggle, phase="toggle", expectedTheme=toggledTheme))
            if afterToggle["storedTheme"] != toggledTheme:
                failures.append(
                    f"{case.name} toggle: stored theme {afterToggle['storedTheme']!r} != {toggledTheme!r}"
                )

            page.reload(wait_until="domcontentloaded", timeout=45_000)
            waitForRuntimeState(page, toggledTheme, case.expectedDensity, expectedSurface)
            afterReload = runtimeSnapshot(page)
            result["afterReload"] = afterReload
            failures.extend(validateSnapshot(case, afterReload, phase="reload", expectedTheme=toggledTheme))
            if afterReload["storedTheme"] != toggledTheme:
                failures.append(
                    f"{case.name} reload: stored theme {afterReload['storedTheme']!r} != {toggledTheme!r}"
                )
    except Exception as exc:  # noqa: BLE001 - Playwright errors carry useful locator and page detail
        failures.append(f"{case.name}: {type(exc).__name__}: {exc}")
        screenshotPath = workspace / f"{case.name}.png"
        try:
            page.screenshot(path=str(screenshotPath), full_page=True)
            result["failureScreenshot"] = screenshotPath.relative_to(ROOT).as_posix()
        except Exception as diagnosticError:  # noqa: BLE001 - diagnostics must not mask the original failure
            result["failureScreenshotError"] = f"{type(diagnosticError).__name__}: {diagnosticError}"
    finally:
        result["durationMs"] = round((time.monotonic() - caseStarted) * 1000)
        result["passed"] = not failures
        result["failures"] = failures
        context.close()
    return result, failures


def seedPreferencesScript(case: ThemeRuntimeCase) -> str:
    seed = {
        "theme": case.storedTheme,
        "accent": case.expectedAccent if case.product != "landing" else None,
    }
    return f"""
    (() => {{
      const seed = {json.dumps(seed)};
      const marker = "__codaro_theme_runtime_seeded__";
      if (window.sessionStorage.getItem(marker) !== "1") {{
        if (seed.theme === null) window.localStorage.removeItem("codaro-theme");
        else window.localStorage.setItem("codaro-theme", seed.theme);
        if (seed.accent === null) window.localStorage.removeItem("codaro-accent");
        else window.localStorage.setItem("codaro-accent", seed.accent);
        window.localStorage.removeItem("codaro-run-route-v1:web");
        window.localStorage.removeItem("codaro-run-route-v1:local");
        window.sessionStorage.setItem(marker, "1");
      }}
      window.__codaroThemeTransitions = [];
      const capture = () => {{
        const value = document.documentElement?.dataset?.theme;
        if (value && window.__codaroThemeTransitions.at(-1) !== value) {{
          window.__codaroThemeTransitions.push(value);
        }}
      }};
      const installObserver = () => {{
        if (!document.documentElement || window.__codaroThemeObserverInstalled) return;
        window.__codaroThemeObserverInstalled = true;
        capture();
        new MutationObserver(capture).observe(document.documentElement, {{
          attributes: true,
          attributeFilter: ["data-theme", "data-resolved-theme"],
        }});
        requestAnimationFrame(capture);
      }};
      installObserver();
      if (!window.__codaroThemeObserverInstalled) {{
        document.addEventListener("readystatechange", installObserver, {{ once: true }});
        window.setTimeout(installObserver, 0);
      }}
    }})();
    """


def expectedProductSurface(case: ThemeRuntimeCase) -> str | None:
    if case.product not in {"run", "local"}:
        return None
    return "curriculum" if case.expectedDensity == "learningComfortable" else "editor"


def waitForRuntimeState(
    page: Any,
    expectedTheme: str,
    expectedDensity: str,
    expectedSurface: str | None,
) -> None:
    expectedToggle = "라이트 모드로" if expectedTheme == "dark" else "다크 모드로"
    page.wait_for_function(
        """
        ([theme, density, activeSurface, toggleLabel]) => {
          const root = document.documentElement;
          const scope = document.querySelector('[data-astryx-theme="codaro"]');
          const densityOwner = scope?.matches(`[data-density="${density}"]`)
            ? scope
            : scope?.querySelector(`[data-density="${density}"]`);
          const surfaceReady = activeSurface === null
            || Boolean(document.querySelector(`[data-active-product-surface="${activeSurface}"]`));
          const toggleReady = [...document.querySelectorAll("button[aria-label]")]
            .some((button) => button.getAttribute("aria-label") === toggleLabel);
          return root.dataset.theme === theme
            && root.dataset.resolvedTheme === theme
            && root.dataset.density === density
            && Boolean(scope)
            && Boolean(densityOwner)
            && surfaceReady
            && toggleReady;
        }
        """,
        arg=[expectedTheme, expectedDensity, expectedSurface, expectedToggle],
        timeout=25_000,
    )
    page.evaluate("document.fonts?.ready")


def runtimeSnapshot(page: Any) -> dict[str, Any]:
    return page.evaluate(
        """
        () => {
          const root = document.documentElement;
          const scope = document.querySelector('[data-astryx-theme="codaro"]');
          const densityOwner = scope?.matches("[data-density]") ? scope : scope?.querySelector("[data-density]");
          const accentOwner = scope?.matches("[data-accent]") ? scope : scope?.querySelector("[data-accent]");
          const style = scope ? getComputedStyle(scope) : null;
          const themeColor = document.querySelector('meta[name="theme-color"]')?.getAttribute("content") ?? null;
          return {
            theme: root.dataset.theme ?? null,
            resolvedTheme: root.dataset.resolvedTheme ?? null,
            rootDensity: root.dataset.density ?? null,
            scopeDensity: densityOwner?.getAttribute("data-density") ?? null,
            rootAccent: root.dataset.accent ?? null,
            scopeAccent: accentOwner?.getAttribute("data-accent") ?? null,
            rootColorScheme: root.style.colorScheme || getComputedStyle(root).colorScheme,
            scopeColorScheme: style?.colorScheme ?? null,
            rootBackground: root.style.backgroundColor,
            themeColor,
            darkClass: root.classList.contains("dark"),
            storedTheme: window.localStorage.getItem("codaro-theme"),
            storedAccent: window.localStorage.getItem("codaro-accent"),
            prefersDark: matchMedia("(prefers-color-scheme: dark)").matches,
            reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
            durationFast: style?.getPropertyValue("--duration-fast").trim() ?? null,
            durationMedium: style?.getPropertyValue("--duration-medium").trim() ?? null,
            durationSlow: style?.getPropertyValue("--duration-slow").trim() ?? null,
            themeTransitions: [...(window.__codaroThemeTransitions ?? [])],
            runtimeTier: document.querySelector('meta[name="codaro-runtime-tier"]')?.getAttribute("content") ?? "web",
            activeSurface: document.querySelector("[data-active-product-surface]")?.getAttribute("data-active-product-surface") ?? null,
            themeToggleLabels: [...document.querySelectorAll("button[aria-label]")]
              .map((button) => button.getAttribute("aria-label"))
              .filter((label) => label === "라이트 모드로" || label === "다크 모드로"),
          };
        }
        """
    )


def validateSnapshot(
    case: ThemeRuntimeCase,
    snapshot: dict[str, Any],
    *,
    phase: str,
    expectedTheme: str | None = None,
) -> list[str]:
    theme = expectedTheme or case.expectedTheme
    prefix = f"{case.name} {phase}"
    failures: list[str] = []

    def require(condition: bool, detail: str) -> None:
        if not condition:
            failures.append(f"{prefix}: {detail}")

    require(snapshot["theme"] == theme, f"theme {snapshot['theme']!r} != {theme!r}")
    require(snapshot["resolvedTheme"] == theme, f"resolved theme {snapshot['resolvedTheme']!r} != {theme!r}")
    require(snapshot["rootDensity"] == case.expectedDensity, "root density does not match the surface")
    require(snapshot["scopeDensity"] == case.expectedDensity, "Astryx scope density does not match the root")
    require(snapshot["rootAccent"] == case.expectedAccent, "root accent does not match the product contract")
    require(snapshot["scopeAccent"] == case.expectedAccent, "Astryx scope accent does not match the root")
    require(snapshot["rootColorScheme"] == theme, "root color-scheme does not match the resolved theme")
    require(snapshot["scopeColorScheme"] == theme, "Astryx scope color-scheme does not match the root")
    require(snapshot["rootBackground"] == CANVAS_RGB_COLORS[theme], "root canvas does not match the shared token")
    require(snapshot["themeColor"] == CANVAS_COLORS[theme], "theme-color meta does not match the shared canvas token")
    require(snapshot["darkClass"] is (theme == "dark"), "root dark class does not match the resolved theme")
    require(
        snapshot["themeTransitions"] and snapshot["themeTransitions"][-1] == theme,
        f"theme observer did not finish at {theme!r}: {snapshot['themeTransitions']}",
    )
    expectedToggle = "라이트 모드로" if theme == "dark" else "다크 모드로"
    require(expectedToggle in snapshot["themeToggleLabels"], "accessible theme toggle is absent")
    require(snapshot["reducedMotion"] is case.reducedMotion, "browser reduced-motion preference was not applied")
    if case.reducedMotion:
        require(
            [snapshot["durationFast"], snapshot["durationMedium"], snapshot["durationSlow"]] == ["1ms", "1ms", "1ms"],
            "shared motion duration tokens were not reduced to 1ms",
        )
    if case.product == "local":
        require(snapshot["runtimeTier"] == "local", "Local case did not receive the local runtime tier")
    else:
        require(snapshot["runtimeTier"] == "web", "public/Run case unexpectedly received a local runtime tier")
    if case.product in {"run", "local"}:
        expectedSurface = "curriculum" if case.expectedDensity == "learningComfortable" else "editor"
        require(snapshot["activeSurface"] == expectedSurface, "active product surface does not match the requested route")
    return failures


def buildReport(
    *,
    startedAt: str,
    startedMonotonic: float,
    results: list[dict[str, Any]],
    failures: list[str],
    browserVersion: str | None,
) -> dict[str, Any]:
    products = sorted({case.product for case in THEME_RUNTIME_CASES})
    return {
        "schemaVersion": SCHEMA_VERSION,
        "gate": "theme-runtime-browser",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "gitHead": currentGitHead(),
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - startedMonotonic) * 1000),
        "browser": {"engine": "chromium", "version": browserVersion},
        "matrix": {
            "caseCount": len(THEME_RUNTIME_CASES),
            "products": products,
            "themeModes": ["light", "dark", "system"],
            "reducedMotion": [False, True],
            "densities": ["public", "learningComfortable", "studioDense"],
            "accents": ["plum", "blue", "teal"],
        },
        "cases": results,
        "failureCount": len(failures),
        "failures": failures[:100],
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }


def oppositeTheme(theme: str) -> str:
    return "light" if theme == "dark" else "dark"


def freePort() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


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
    value = result.stdout.strip()
    return value if result.returncode == 0 and value else None


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat()


if __name__ == "__main__":
    raise SystemExit(main())
