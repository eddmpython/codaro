from __future__ import annotations

from datetime import UTC, datetime
import ctypes
from ctypes import wintypes
import json
import os
import platform
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen

from playwright.sync_api import Page, sync_playwright


ROOT = Path(__file__).resolve().parents[2]
WORK_ROOT = ROOT / "output" / "test-runner" / "product-browser-webview2-evergreen"
LAUNCHER_ROOT = WORK_ROOT / "launcher-root"
WORKSPACE_ROOT = WORK_ROOT / "workspace"
DIST_ROOT = WORK_ROOT / "dist"
SCREENSHOT_ROOT = WORK_ROOT / "screenshots"
REPORT_PATH = WORK_ROOT / "webview2-product-smoke-report.json"
CARGO_TARGET_ROOT = WORK_ROOT / "cargo-target"
LAUNCHER_EXE = CARGO_TARGET_ROOT / "debug" / "codaro-launcher.exe"
PYTHON_EXE = ROOT / ".venv" / "Scripts" / "python.exe"
EXPECTED_SOCIAL_ORDER = ["github", "support", "youtube", "threads"]
EXPECTED_ACCOUNT_NUMBER = "1002-0421-4626"
CREATE_NO_WINDOW = 0x08000000


class VerificationError(RuntimeError):
    pass


def main() -> int:
    started_at = utc_timestamp()
    started = time.monotonic()
    failures: list[str] = []
    cases: list[dict[str, Any]] = []
    runtime: dict[str, Any] = {}
    launcher_process: subprocess.Popen[str] | None = None
    launcher_log = None
    app_port: int | None = None
    cdp_port: int | None = None

    try:
        require_windows()
        prepare_product_install()
        app_port = free_tcp_port()
        cdp_port = free_tcp_port(exclude={app_port})
        launcher_process, launcher_log = launch_native_product(app_port, cdp_port)
        hwnd = wait_for_launcher_window(launcher_process.pid)
        cdp_version = wait_for_json(f"http://127.0.0.1:{cdp_port}/json/version", timeout_seconds=45)
        wait_for_json(f"http://127.0.0.1:{app_port}/api/health", timeout_seconds=45)
        runtime = runtime_evidence(cdp_version, hwnd, launcher_process.pid)

        with sync_playwright() as playwright:
            browser = playwright.chromium.connect_over_cdp(f"http://127.0.0.1:{cdp_port}")
            try:
                page = webview_page(browser.contexts)
                page.wait_for_load_state("domcontentloaded")
                page.wait_for_selector("[data-active-product-surface]", timeout=45_000)
                console_errors: list[str] = []
                page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
                page.on("pageerror", lambda error: console_errors.append(str(error)))

                case_specs = (
                    ("local-home-900x640", "home", 900, 640, "[data-local-home-surface='true']"),
                    ("local-notebook-1024x768", "editor", 1024, 768, "[data-notebook-studio='true']"),
                    ("local-automation-1440x900", "automation", 1440, 900, "[data-automation-studio-layout='true']"),
                )
                for case_id, surface, width, height, selector in case_specs:
                    cases.append(
                        verify_surface_case(
                            page,
                            hwnd=hwnd,
                            app_port=app_port,
                            case_id=case_id,
                            surface=surface,
                            width=width,
                            height=height,
                            ready_selector=selector,
                        )
                    )

                support_case = verify_support_dialog(page)
                cases.append(support_case)
                if console_errors:
                    failures.extend(f"WebView2 console: {message}" for message in console_errors)
            finally:
                browser.close()
    except Exception as exc:
        failures.append(str(exc))
    finally:
        if launcher_process is not None:
            terminate_process_tree(launcher_process.pid)
            try:
                launcher_process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                pass
        if launcher_log is not None:
            launcher_log.close()
        for port, label in ((app_port, "backend"), (cdp_port, "CDP")):
            if port is not None and not wait_for_port_release(port):
                failures.append(f"{label} port {port} remained open after launcher cleanup")

    failures.extend(
        f"{case['id']}: {failure}"
        for case in cases
        for failure in case.get("failures", [])
    )
    payload = {
        "gate": "product-browser-webview2-evergreen",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "startedAt": started_at,
        "completedAt": utc_timestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": current_git_head(),
        "reportPath": display_path(REPORT_PATH),
        "runtime": runtime,
        "install": {
            "launcherExe": display_path(LAUNCHER_EXE),
            "launcherRoot": display_path(LAUNCHER_ROOT),
            "packagedWheel": packaged_wheel_evidence(),
            "runtimePython": str(PYTHON_EXE),
        },
        "caseCount": len(cases),
        "cases": cases,
        "failures": failures,
        "claimScope": {
            "covered": [
                "current Windows session",
                "installed current-commit wheel",
                "native launcher window",
                "WebView2 Evergreen runtime",
                "900x640 Local Home",
                "1024x768 Local Notebook",
                "1440x900 Local Automation",
                "shared theme and social controls",
                "shared support dialog account structure",
            ],
            "notCovered": [
                "Windows 10 22H2 self-hosted image",
                "WebView2 Fixed Version lock",
                "manual assistive technology",
                "IME composition",
                "200% and 400% zoom",
            ],
        },
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: native WebView2 product smoke failed", file=sys.stderr)
        return 1
    print("ok: native WebView2 product smoke verified")
    return 0


def require_windows() -> None:
    if sys.platform != "win32":
        raise VerificationError("product-browser-webview2-evergreen requires Windows")
    if not PYTHON_EXE.is_file():
        raise VerificationError(f"project Python is missing: {PYTHON_EXE}")
    if not LAUNCHER_EXE.is_file():
        raise VerificationError(f"built launcher is missing: {LAUNCHER_EXE}")


def prepare_product_install() -> None:
    reset_work_paths()
    DIST_ROOT.mkdir(parents=True, exist_ok=True)
    SCREENSHOT_ROOT.mkdir(parents=True, exist_ok=True)
    WORKSPACE_ROOT.mkdir(parents=True, exist_ok=True)
    packaged_curricula = ROOT / "src" / "codaro" / "curricula"
    if packaged_curricula.exists():
        raise VerificationError(
            f"ignored package staging path already exists; refusing to overwrite it: {packaged_curricula}"
        )
    shutil.copytree(ROOT / "curricula", packaged_curricula)
    try:
        build = run_checked(
            ("uv", "build", "--wheel", "--out-dir", str(DIST_ROOT)),
            timeout_seconds=240,
        )
    finally:
        remove_tree(packaged_curricula)
    wheels = sorted(DIST_ROOT.glob("codaro-*.whl"))
    if len(wheels) != 1:
        raise VerificationError(f"expected one current wheel, found {len(wheels)}: {build[-800:]}")

    release_id = f"webview2-{(current_git_head() or 'worktree')[:12]}"
    runtime_version = "product-smoke-3.12"
    release_root = LAUNCHER_ROOT / "installs" / release_id
    site_packages = release_root / "backend" / "site-packages"
    runtime_root = LAUNCHER_ROOT / "installs" / "_runtimes" / runtime_version
    state_root = LAUNCHER_ROOT / "state"
    site_packages.mkdir(parents=True, exist_ok=True)
    runtime_root.mkdir(parents=True, exist_ok=True)
    state_root.mkdir(parents=True, exist_ok=True)
    run_checked(
        ("uv", "pip", "install", "--target", str(site_packages), "--no-deps", str(wheels[0])),
        timeout_seconds=240,
    )
    web_build_root = site_packages / "codaro" / "webBuild"
    if not (web_build_root / "index.html").is_file() or not (web_build_root / "_app").is_dir():
        raise VerificationError("current wheel does not contain the built editor frontend")

    python_wrapper = runtime_root / "python.cmd"
    python_wrapper.write_text(f'@echo off\r\n"{PYTHON_EXE}" %*\r\n', encoding="utf-8")
    active_release = {
        "releaseId": release_id,
        "channel": "internal",
        "launcherVersion": "0.0.12",
        "backendPackageName": "codaro",
        "backendVersion": "0.0.12",
        "backendEntryModule": "codaro.cli",
        "backendConsoleScript": "codaro",
        "editorVersion": "0.0.12",
        "learningEvidenceReaderVersion": 1,
        "runtimeVersion": runtime_version,
        "installedAtUnixSeconds": int(time.time()),
    }
    update_config = {
        "channel": "stable",
        "autoUpdateOnLaunch": False,
        "manifestSource": None,
        "githubRepo": "eddmpython/codaro",
        "githubManifestAssetName": "release-manifest.json",
        "autoStartOnBoot": False,
    }
    write_json(state_root / "active-release.json", active_release)
    write_json(state_root / "update-config.json", update_config)


def reset_work_paths() -> None:
    work_root = WORK_ROOT.resolve()
    for path in (LAUNCHER_ROOT, WORKSPACE_ROOT, DIST_ROOT, SCREENSHOT_ROOT):
        resolved = path.resolve()
        if work_root != resolved and work_root not in resolved.parents:
            raise VerificationError(f"unsafe WebView2 work path: {resolved}")
        if path.exists():
            remove_tree(path)


def remove_tree(path: Path) -> None:
    resolved = str(path.resolve())
    extended = resolved if resolved.startswith("\\\\?\\") else f"\\\\?\\{resolved}"
    shutil.rmtree(extended)


def launch_native_product(app_port: int, cdp_port: int) -> tuple[subprocess.Popen[str], Any]:
    log_path = WORK_ROOT / "launcher.log"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    log_handle = log_path.open("w", encoding="utf-8")
    env = os.environ.copy()
    env["WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS"] = (
        f"--remote-debugging-port={cdp_port} --remote-allow-origins=*"
    )
    command = (
        str(LAUNCHER_EXE),
        "--root",
        str(LAUNCHER_ROOT),
        "launch",
        "--host",
        "127.0.0.1",
        "--port",
        str(app_port),
        "--workspace-root",
        str(WORKSPACE_ROOT),
    )
    process = subprocess.Popen(
        command,
        cwd=ROOT,
        env=env,
        stdout=log_handle,
        stderr=subprocess.STDOUT,
        text=True,
        creationflags=CREATE_NO_WINDOW,
    )
    return process, log_handle


def verify_surface_case(
    page: Page,
    *,
    hwnd: int,
    app_port: int,
    case_id: str,
    surface: str,
    width: int,
    height: int,
    ready_selector: str,
) -> dict[str, Any]:
    url = f"http://127.0.0.1:{app_port}/?surface={surface}&runtime=local#{surface}"
    response = page.goto(url, wait_until="domcontentloaded", timeout=45_000)
    if response is not None and response.status >= 400:
        raise VerificationError(f"{case_id} returned HTTP {response.status}")
    page.wait_for_selector(ready_selector, state="visible", timeout=45_000)
    page.wait_for_function(
        "surface => document.querySelector('[data-active-product-surface]')?.getAttribute('data-active-product-surface') === surface",
        arg=surface,
        timeout=45_000,
    )
    dpr = float(page.evaluate("window.devicePixelRatio"))
    resize_native_client(hwnd, width, height, dpr)
    page.wait_for_timeout(500)
    snapshot = page.evaluate(
        """({surface, expectedSocialOrder}) => {
          const visible = (element) => {
            if (!(element instanceof HTMLElement)) return false;
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
          };
          const social = [...document.querySelectorAll("[data-social-link-id]")]
            .filter(visible)
            .map((element) => element.getAttribute("data-social-link-id"));
          const controls = [...document.querySelectorAll("[data-topbar-controls] button, [data-topbar-controls] a")]
            .filter(visible)
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                label: element.getAttribute("aria-label") || element.getAttribute("title") || "",
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
              };
            });
          const overlaps = [];
          for (let index = 0; index < controls.length; index += 1) {
            for (let candidate = index + 1; candidate < controls.length; candidate += 1) {
              const a = controls[index];
              const b = controls[candidate];
              if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
                && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) {
                overlaps.push([a.label, b.label]);
              }
            }
          }
          return {
            activeSurface: document.querySelector("[data-active-product-surface]")
              ?.getAttribute("data-active-product-surface"),
            runtimeTier: document.querySelector('meta[name="codaro-runtime-tier"]')?.getAttribute("content"),
            theme: document.documentElement.dataset.theme,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
            scrollWidth: document.documentElement.scrollWidth,
            scrollHeight: document.documentElement.scrollHeight,
            horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
            verticalOverflow: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
            themeToggleVisible: [...document.querySelectorAll("[data-topbar-controls] button")]
              .some((element) => visible(element) && /모드로/.test(element.getAttribute("aria-label") || "")),
            socialOrder: social,
            socialMatches: JSON.stringify(social) === JSON.stringify(expectedSocialOrder),
            controlOverlaps: overlaps,
            readySurfaceVisible: [...document.querySelectorAll(
              surface === "home"
                ? "[data-local-home-surface='true']"
                : surface === "editor"
                  ? "[data-notebook-studio='true']"
                  : "[data-automation-studio-layout='true']",
            )].some(visible),
          };
        }""",
        {"surface": surface, "expectedSocialOrder": EXPECTED_SOCIAL_ORDER},
    )
    native_client = native_client_size(hwnd)
    screenshot_path = SCREENSHOT_ROOT / f"{case_id}.png"
    page.screenshot(path=str(screenshot_path))
    case_failures: list[str] = []
    checks = {
        "surface": snapshot["activeSurface"] == surface,
        "runtimeTier": snapshot["runtimeTier"] == "local",
        "viewportWidth": abs(snapshot["innerWidth"] - width) <= 2,
        "viewportHeight": abs(snapshot["innerHeight"] - height) <= 2,
        "nativeWidth": abs(native_client["width"] - round(snapshot["innerWidth"] * snapshot["devicePixelRatio"])) <= 4,
        "nativeHeight": abs(native_client["height"] - round(snapshot["innerHeight"] * snapshot["devicePixelRatio"])) <= 4,
        "horizontalOverflow": snapshot["horizontalOverflow"] == 0,
        "themeToggle": bool(snapshot["themeToggleVisible"]),
        "socialOrder": bool(snapshot["socialMatches"]),
        "controlOverlap": not snapshot["controlOverlaps"],
        "surfaceVisible": bool(snapshot["readySurfaceVisible"]),
    }
    for check, passed in checks.items():
        if not passed:
            case_failures.append(f"{check} check failed")
    return {
        "id": case_id,
        "surface": surface,
        "requestedCssViewport": {"width": width, "height": height},
        "nativeClientPhysical": native_client,
        "snapshot": snapshot,
        "screenshot": display_path(screenshot_path),
        "checks": checks,
        "passed": not case_failures,
        "failures": case_failures,
    }


def verify_support_dialog(page: Page) -> dict[str, Any]:
    trigger = page.locator("[data-social-link-id='support']").first
    trigger.click()
    dialog = page.locator("[data-support-dialog='codaro']")
    dialog.wait_for(state="visible", timeout=5_000)
    screenshot_path = SCREENSHOT_ROOT / "shared-support-dialog.png"
    page.screenshot(path=str(screenshot_path))
    snapshot = {
        "accountNumber": page.locator("[data-support-account-number='codaro']").inner_text(),
        "copyControlVisible": page.locator("[data-support-account-copy='codaro']").is_visible(),
        "role": dialog.get_attribute("role"),
        "ariaModal": dialog.get_attribute("aria-modal"),
    }
    page.keyboard.press("Escape")
    dialog.wait_for(state="hidden", timeout=5_000)
    checks = {
        "accountNumber": snapshot["accountNumber"] == EXPECTED_ACCOUNT_NUMBER,
        "copyControl": snapshot["copyControlVisible"],
        "dialogSemantics": snapshot["role"] == "dialog" and snapshot["ariaModal"] == "true",
        "escapeClose": not dialog.is_visible(),
    }
    failures = [f"{check} check failed" for check, passed in checks.items() if not passed]
    return {
        "id": "shared-support-dialog",
        "snapshot": snapshot,
        "screenshot": display_path(screenshot_path),
        "checks": checks,
        "passed": not failures,
        "failures": failures,
    }


def webview_page(contexts: list[Any]) -> Page:
    deadline = time.monotonic() + 30
    while time.monotonic() < deadline:
        pages = [page for context in contexts for page in context.pages]
        if pages:
            return pages[0]
        time.sleep(0.1)
    raise VerificationError("WebView2 CDP exposed no page")


def resize_native_client(hwnd: int, css_width: int, css_height: int, dpr: float) -> None:
    configure_dpi_awareness()
    user32 = ctypes.windll.user32
    outer = window_rect(hwnd)
    client = native_client_size(hwnd)
    frame_width = outer["width"] - client["width"]
    frame_height = outer["height"] - client["height"]
    target_client_width = round(css_width * dpr)
    target_client_height = round(css_height * dpr)
    outer_width = target_client_width + frame_width
    outer_height = target_client_height + frame_height
    flags = 0x0004 | 0x0010
    if not user32.SetWindowPos(hwnd, 0, outer["left"], outer["top"], outer_width, outer_height, flags):
        raise VerificationError(f"SetWindowPos failed for {css_width}x{css_height}")
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        current = native_client_size(hwnd)
        if abs(current["width"] - target_client_width) <= 2 and abs(current["height"] - target_client_height) <= 2:
            return
        time.sleep(0.05)
    current = native_client_size(hwnd)
    raise VerificationError(
        f"native client resize timed out: wanted {target_client_width}x{target_client_height}, "
        f"got {current['width']}x{current['height']}"
    )


def wait_for_launcher_window(pid: int) -> int:
    configure_dpi_awareness()
    deadline = time.monotonic() + 30
    while time.monotonic() < deadline:
        hwnd = find_window_for_pid(pid)
        if hwnd:
            return hwnd
        time.sleep(0.1)
    raise VerificationError(f"visible Codaro window was not found for launcher PID {pid}")


def find_window_for_pid(pid: int) -> int | None:
    user32 = ctypes.windll.user32
    matches: list[int] = []
    callback_type = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)

    def callback(hwnd: int, _lparam: int) -> bool:
        process_id = wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, ctypes.byref(process_id))
        if process_id.value != pid or not user32.IsWindowVisible(hwnd):
            return True
        length = user32.GetWindowTextLengthW(hwnd)
        title = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, title, length + 1)
        if title.value == "Codaro":
            matches.append(hwnd)
        return True

    user32.EnumWindows(callback_type(callback), 0)
    return matches[0] if matches else None


def native_client_size(hwnd: int) -> dict[str, int]:
    rect = wintypes.RECT()
    if not ctypes.windll.user32.GetClientRect(hwnd, ctypes.byref(rect)):
        raise VerificationError("GetClientRect failed")
    return {"width": rect.right - rect.left, "height": rect.bottom - rect.top}


def window_rect(hwnd: int) -> dict[str, int]:
    rect = wintypes.RECT()
    if not ctypes.windll.user32.GetWindowRect(hwnd, ctypes.byref(rect)):
        raise VerificationError("GetWindowRect failed")
    return {
        "left": rect.left,
        "top": rect.top,
        "width": rect.right - rect.left,
        "height": rect.bottom - rect.top,
    }


def configure_dpi_awareness() -> None:
    try:
        ctypes.windll.user32.SetProcessDpiAwarenessContext(ctypes.c_void_p(-4))
    except (AttributeError, OSError):
        pass


def runtime_evidence(cdp_version: dict[str, Any], hwnd: int, pid: int) -> dict[str, Any]:
    windows_version = sys.getwindowsversion()
    return {
        "platform": platform.platform(),
        "windowsBuild": windows_version.build,
        "windowsVersion": f"{windows_version.major}.{windows_version.minor}.{windows_version.build}",
        "sessionName": os.environ.get("SESSIONNAME"),
        "launcherPid": pid,
        "nativeWindowHandle": hwnd,
        "browser": cdp_version.get("Browser"),
        "userAgent": cdp_version.get("User-Agent"),
        "protocolVersion": cdp_version.get("Protocol-Version"),
        "webSocketDebuggerUrlPresent": bool(cdp_version.get("webSocketDebuggerUrl")),
    }


def packaged_wheel_evidence() -> dict[str, Any] | None:
    wheels = sorted(DIST_ROOT.glob("codaro-*.whl"))
    if len(wheels) != 1:
        return None
    wheel = wheels[0]
    return {"path": display_path(wheel), "bytes": wheel.stat().st_size}


def free_tcp_port(*, exclude: set[int] | None = None) -> int:
    excluded = exclude or set()
    for _ in range(20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.bind(("127.0.0.1", 0))
            port = int(sock.getsockname()[1])
        if port not in excluded:
            return port
    raise VerificationError("failed to reserve distinct loopback ports")


def wait_for_json(url: str, *, timeout_seconds: float) -> dict[str, Any]:
    deadline = time.monotonic() + timeout_seconds
    last_error = ""
    while time.monotonic() < deadline:
        try:
            request = Request(url, headers={"Cache-Control": "no-cache"})
            with urlopen(request, timeout=1) as response:
                payload = json.loads(response.read().decode("utf-8"))
            if isinstance(payload, dict):
                return payload
        except (OSError, URLError, TimeoutError, json.JSONDecodeError) as exc:
            last_error = str(exc)
        time.sleep(0.2)
    launcher_tail = ""
    log_path = WORK_ROOT / "launcher.log"
    if log_path.is_file():
        launcher_tail = log_path.read_text(encoding="utf-8", errors="replace")[-1600:]
    raise VerificationError(f"timed out waiting for {url}: {last_error}\n{launcher_tail}")


def wait_for_port_release(port: int) -> bool:
    deadline = time.monotonic() + 10
    while time.monotonic() < deadline:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(0.2)
            if sock.connect_ex(("127.0.0.1", port)) != 0:
                return True
        time.sleep(0.1)
    return False


def terminate_process_tree(pid: int) -> None:
    subprocess.run(
        ("taskkill", "/PID", str(pid), "/T", "/F"),
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="mbcs",
        errors="replace",
        timeout=20,
        check=False,
        creationflags=CREATE_NO_WINDOW,
    )


def run_checked(command: tuple[str, ...], *, timeout_seconds: int) -> str:
    result = subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=timeout_seconds,
        check=False,
        encoding="utf-8",
        errors="replace",
    )
    output = f"{result.stdout}\n{result.stderr}".strip()
    if result.returncode != 0:
        raise VerificationError(f"{' '.join(command)} failed with {result.returncode}: {output[-1600:]}")
    return output


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def current_git_head() -> str | None:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=5,
        check=False,
    )
    return result.stdout.strip() or None


def display_path(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(path)


def utc_timestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


if __name__ == "__main__":
    raise SystemExit(main())
