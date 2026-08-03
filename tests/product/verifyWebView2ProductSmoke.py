from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime
import ctypes
from ctypes import wintypes
import hashlib
import json
import os
import platform
import re
import shutil
import socket
import struct
import subprocess
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from playwright.sync_api import Locator, Page, sync_playwright
import yaml

from webview2RuntimeLock import (
    RuntimeLockError,
    loadRuntimeLock,
    runtimeExecutable,
    runtimeInstallRoot,
    runtimeLockSha256,
    verifyInstalledRuntime,
)


ROOT = Path(__file__).resolve().parents[2]
GATE_ID = os.environ.get(
    "CODARO_WEBVIEW2_GATE_ID",
    "product-browser-webview2-evergreen",
).strip()
RUNTIME_MODE = os.environ.get("CODARO_WEBVIEW2_RUNTIME_MODE", "evergreen").strip()
REQUIRE_SUPPORTED_WINDOWS = (
    os.environ.get("CODARO_WEBVIEW2_REQUIRE_SUPPORTED_WINDOWS", "0") == "1"
)
WORK_ROOT = ROOT / "output" / "test-runner" / GATE_ID
LAUNCHER_ROOT = WORK_ROOT / "launcher-root"
PRODUCT_HOME = LAUNCHER_ROOT / "user-data"
WORKSPACE_ROOT = WORK_ROOT / "workspace"
DIST_ROOT = WORK_ROOT / "dist"
SCREENSHOT_ROOT = WORK_ROOT / "screenshots"
REPORT_PATH = WORK_ROOT / "webview2-product-smoke-report.json"
WEB_ARCHIVE_PATH = WORK_ROOT / "web-origin-learning-archive.json"
DEPLOYED_WEB_ARCHIVE_PATH = WORK_ROOT / "deployed-web-learning-archive.json"
DEPLOYED_LOCAL_REEXPORT_PATH = WORK_ROOT / "deployed-local-reexport-learning-archive.json"
CARGO_TARGET_ROOT = WORK_ROOT / "cargo-target"
LAUNCHER_EXE = CARGO_TARGET_ROOT / "debug" / "codaro-launcher.exe"
ZOOM_CONTROL_PATH = WORK_ROOT / "zoom-control.txt"
PYTHON_EXE = ROOT / ".venv" / "Scripts" / "python.exe"
RUNTIME_VERSION = "product-smoke-3.12"
DEPLOYED_WEB_URL = os.environ.get("CODARO_DEPLOYED_WEB_URL", "").strip().rstrip("/")
EXPECTED_SOCIAL_ORDER = ["github", "support", "youtube", "threads"]
EXPECTED_ACCOUNT_NUMBER = "1002-0421-4626"
COLD_CHECK_REQUEST_TIMEOUT_SECONDS = 180
CREATE_NO_WINDOW = 0x08000000
KEYEVENTF_KEYUP = 0x0002
VK_BACK = 0x08
VK_DOWN = 0x28
VK_ESCAPE = 0x1B
VK_HANGUL = 0x15
VK_SPACE = 0x20


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
    deployed_archive: dict[str, Any] | None = None
    resource_failures: list[dict[str, Any]] = []
    runtime_lock: dict[str, Any] | None = None

    try:
        runtime_lock = load_runtime_profile()
        require_windows(runtime_lock)
        prepare_product_install()
        app_port = free_tcp_port()
        cdp_port = free_tcp_port(exclude={app_port})
        launcher_process, launcher_log = launch_native_product(
            app_port,
            cdp_port,
            runtime_lock=runtime_lock,
        )
        hwnd = wait_for_launcher_window(launcher_process.pid)
        cdp_version = wait_for_json(f"http://127.0.0.1:{cdp_port}/json/version", timeout_seconds=45)
        wait_for_json(f"http://127.0.0.1:{app_port}/api/health", timeout_seconds=45)
        runtime = runtime_evidence(
            cdp_version,
            hwnd,
            launcher_process.pid,
            runtime_lock=runtime_lock,
        )
        assert_runtime_profile(runtime, runtime_lock)

        with sync_playwright() as playwright:
            if DEPLOYED_WEB_URL:
                deployed_archive = capture_deployed_web_learning_archive(playwright)
            browser = playwright.chromium.connect_over_cdp(f"http://127.0.0.1:{cdp_port}")
            try:
                page = webview_page(browser.contexts)
                page.wait_for_load_state("domcontentloaded")
                page.wait_for_selector("[data-active-product-surface]", timeout=45_000)
                console_errors: list[str] = []
                page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
                page.on("pageerror", lambda error: console_errors.append(str(error)))
                page.on(
                    "response",
                    lambda response: resource_failures.append({
                        "kind": "http",
                        "method": response.request.method,
                        "resourceType": response.request.resource_type,
                        "status": response.status,
                        "url": response.url,
                    }) if response.status >= 400 else None,
                )
                page.on(
                    "requestfailed",
                    lambda request: resource_failures.append({
                        "error": request.failure,
                        "kind": "network",
                        "method": request.method,
                        "resourceType": request.resource_type,
                        "url": request.url,
                    }) if request.resource_type in {
                        "document", "font", "image", "manifest", "script", "stylesheet"
                    } else None,
                )

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

                cases.append(
                    verify_native_zoom_matrix(
                        page,
                        hwnd=hwnd,
                        app_port=app_port,
                    )
                )
                cases.append(verify_installed_schedule_cold_concurrency(app_port))
                cases.append(
                    verify_native_automation_state_matrix(
                        page,
                        hwnd=hwnd,
                        app_port=app_port,
                        console_errors=console_errors,
                    )
                )
                cases.append(
                    verify_long_notebook_keyboard_navigation(
                        page,
                        hwnd=hwnd,
                        app_port=app_port,
                    )
                )
                support_case = verify_support_dialog(page)
                cases.append(support_case)
                cases.append(
                    verify_native_shell_keyboard_and_forced_colors(
                        page,
                        hwnd=hwnd,
                        app_port=app_port,
                    )
                )
                cases.append(
                    verify_web_to_local_roundtrip(
                        page,
                        hwnd=hwnd,
                        app_port=app_port,
                    )
                )
                if deployed_archive is not None:
                    cases.append(
                        verify_deployed_web_to_local_roundtrip(
                            page,
                            hwnd=hwnd,
                            app_port=app_port,
                            deployed_archive=deployed_archive,
                        )
                    )
                    cases.append(
                        verify_local_reexport_to_deployed_web_roundtrip(
                            playwright,
                            deployed_archive=deployed_archive,
                        )
                    )
                cases.append(
                    verify_installed_local_learning_strong_credit(
                        page,
                        hwnd=hwnd,
                        app_port=app_port,
                    )
                )
                if console_errors:
                    failures.extend(f"WebView2 console: {message}" for message in console_errors)
                if resource_failures:
                    failures.extend(
                        "WebView2 resource: "
                        + json.dumps(failure, ensure_ascii=False, sort_keys=True)
                        for failure in resource_failures
                    )
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
        "gate": GATE_ID,
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
            "productHome": display_path(PRODUCT_HOME),
            "packagedWheel": packaged_wheel_evidence(),
            "runtimePython": display_path(
                LAUNCHER_ROOT / "installs" / "_runtimes" / RUNTIME_VERSION / "python.exe"
            ),
            "webView2Runtime": runtime_install_evidence(runtime_lock),
        },
        "caseCount": len(cases),
        "cases": cases,
        "resourceFailures": resource_failures,
        "failures": failures,
        "claimScope": {
            "covered": [
                "current Windows session",
                "installed current-commit wheel",
                "native launcher window",
                (
                    f"WebView2 Fixed Version {runtime_lock['version']} runtime"
                    if runtime_lock is not None
                    else "WebView2 Evergreen runtime"
                ),
                "900x640 Local Home",
                "1024x768 Local Notebook",
                "1440x900 Local Automation",
                "1440x900 Local Automation scheduled, running, succeeded, failed, paused, and disconnected state matrix",
                "Local Automation E-stop and failure artifact evidence",
                "Local Automation visible-text redaction scan",
                "shared theme and social controls",
                "shared support dialog account structure",
                "12-cell Code and Markdown keyboard boundary navigation with focus scrolling",
                "12-cell input, execution output, and action names include the current cell position",
                "WebView2 Chromium accessibility-tree input, execution output, cell-action, and document-control reading order",
                "Code and Markdown composition-event shortcut guards",
                "Code and Markdown native Korean IME input and composition-boundary arrow guards",
                "WebView2 forced-colors control boundaries and keyboard focus order",
                "native 200% browser zoom at the 900x640 Local minimum",
                "400% text-only fixture at the 900x640 Local minimum",
                "isolated installed-product user data",
                "concurrent installed AppContainer checks using the unchanged pinned schedule wheel",
                "Web-origin learning archive Local import, reload, re-export, and disabled automation adoption",
            ] + ([
                "public deployed Web edit, strong verification, archive export, and installed Local roundtrip",
                "installed Local re-export imported back into a clean public Web workspace",
            ] if deployed_archive is not None else []),
            "notCovered": [
                *([] if runtime_lock is not None else ["WebView2 Fixed Version lock"]),
                "manual NVDA or Narrator speech-output review",
                *([] if deployed_archive is not None else ["public deployed Web archive export"]),
            ],
        },
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print(f"FAIL: {GATE_ID} native WebView2 product smoke failed", file=sys.stderr)
        return 1
    print(f"ok: {GATE_ID} native WebView2 product smoke verified")
    return 0


def load_runtime_profile() -> dict[str, Any] | None:
    if RUNTIME_MODE == "evergreen":
        if REQUIRE_SUPPORTED_WINDOWS:
            raise VerificationError("Fixed release profile cannot use the Evergreen runtime")
        return None
    if RUNTIME_MODE != "fixed":
        raise VerificationError(f"unsupported WebView2 runtime mode: {RUNTIME_MODE}")
    try:
        return loadRuntimeLock()
    except RuntimeLockError as exc:
        raise VerificationError(str(exc)) from exc


def require_windows(runtime_lock: dict[str, Any] | None) -> None:
    if sys.platform != "win32":
        raise VerificationError(f"{GATE_ID} requires Windows")
    if not PYTHON_EXE.is_file():
        raise VerificationError(f"project Python is missing: {PYTHON_EXE}")
    if not LAUNCHER_EXE.is_file():
        raise VerificationError(f"built launcher is missing: {LAUNCHER_EXE}")
    if runtime_lock is not None:
        try:
            verifyInstalledRuntime(runtime_lock)
        except RuntimeLockError as exc:
            raise VerificationError(str(exc)) from exc
    if REQUIRE_SUPPORTED_WINDOWS:
        windows_version = sys.getwindowsversion()
        if windows_version.major != 10 or windows_version.build < 19045:
            raise VerificationError(
                "product-browser-webview2-fixed requires Windows NT 10.0 build 19045 or newer; "
                f"actual={windows_version.major}.{windows_version.minor}.{windows_version.build}"
            )


def verify_installed_schedule_cold_concurrency(app_port: int) -> dict[str, Any]:
    lesson_path = ROOT / "curricula/python/automation/os/watchSched/05_schedule간단스케줄.yaml"
    lesson = yaml.safe_load(lesson_path.read_text(encoding="utf-8"))
    sections = lesson.get("sections") if isinstance(lesson, dict) else None
    section = next(
        (
            item
            for item in sections or []
            if isinstance(item, dict) and item.get("id") == "schedule-register"
        ),
        None,
    )
    if not isinstance(section, dict):
        raise VerificationError("installed schedule cold check fixture is missing")
    check = section.get("check")
    exercise = section.get("exercise")
    if not isinstance(check, dict) or not isinstance(exercise, dict):
        raise VerificationError("installed schedule cold check fixture is incomplete")
    source = exercise.get("solution")
    if not isinstance(source, str) or not source.strip():
        raise VerificationError("installed schedule cold check solution is missing")

    wheel_paths = sorted(
        LAUNCHER_ROOT.rglob("check-packages/schedule-1.2.2-py3-none-any.whl")
    )
    before = {
        display_path(path): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in wheel_paths
    }
    before_package_files = {
        display_path(path): hashlib.sha256(path.read_bytes()).hexdigest()
        for wheel in wheel_paths
        for path in wheel.parent.rglob("*")
        if path.is_file()
    }
    payload = {"checkSpec": check, "source": source}
    url = f"http://127.0.0.1:{app_port}/api/curriculum/check/strong/local"
    with ThreadPoolExecutor(max_workers=2) as executor:
        results = list(executor.map(lambda _index: post_json(url, payload), range(2)))
    after_paths = sorted(
        LAUNCHER_ROOT.rglob("check-packages/schedule-1.2.2-py3-none-any.whl")
    )
    after = {
        display_path(path): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in after_paths
    }
    after_package_files = {
        display_path(path): hashlib.sha256(path.read_bytes()).hexdigest()
        for wheel in after_paths
        for path in wheel.parent.rglob("*")
        if path.is_file()
    }
    checks = {
        "installedWheelUnique": len(before) == 1,
        "concurrentPass": len(results) == 2
        and all(result.get("passed") is True for result in results),
        "appContainerIsolation": all(
            result.get("executor") == "local-sandbox"
            and result.get("isolation") == "windows-appcontainer"
            for result in results
        ),
        "wheelUnchanged": before == after,
        "noPackageCacheWrites": before_package_files == after_package_files,
    }
    failures = [f"{check_name} check failed" for check_name, passed in checks.items() if not passed]
    return {
        "id": "local-installed-schedule-cold-concurrency",
        "surface": "curriculum-api",
        "snapshot": {
            "requestCount": len(results),
            "executors": sorted({str(result.get("executor")) for result in results}),
            "isolations": sorted({str(result.get("isolation")) for result in results}),
            "installedWheels": before,
            "packageFiles": after_package_files,
            "results": results,
        },
        "checks": checks,
        "passed": not failures,
        "failures": failures,
    }


def verify_installed_local_learning_strong_credit(
    page: Page,
    *,
    hwnd: int,
    app_port: int,
) -> dict[str, Any]:
    case_id = "local-installed-learning-strong-credit"
    url = (
        f"http://127.0.0.1:{app_port}/?surface=curriculum"
        "&category=30days&lesson=day01&runtime=local#curriculum"
    )
    response = page.goto(url, wait_until="domcontentloaded", timeout=45_000)
    if response is not None and response.status >= 400:
        raise VerificationError(f"{case_id} returned HTTP {response.status}")
    page.wait_for_selector("[data-learning-section-part='exercise']", state="visible", timeout=45_000)
    dpr = float(page.evaluate("window.devicePixelRatio"))
    resize_native_client(hwnd, 900, 760, dpr)
    page.wait_for_timeout(500)
    before_evidence = page.evaluate(
        """
        async () => {
          const response = await fetch('/api/curriculum/evidence/archive');
          if (!response.ok) throw new Error(`evidence archive failed: ${response.status}`);
          return await response.json();
        }
        """
    )
    before_events = before_evidence.get("events") if isinstance(before_evidence, dict) else None
    before_event_ids = {
        str(event.get("eventId"))
        for event in before_events or []
        if isinstance(event, dict) and event.get("eventId")
    }

    exercise = page.locator("[data-learning-section-part='exercise']").first
    editor = exercise.locator(".cm-content").first
    run_button = exercise.locator("button[aria-label='셀 실행']").first
    local_check_responses: list[Any] = []
    local_check_request_failures: list[str] = []
    page.on(
        "response",
        lambda candidate: local_check_responses.append(candidate)
        if "/api/curriculum/check/strong/local" in candidate.url
        else None,
    )
    page.on(
        "requestfailed",
        lambda candidate: local_check_request_failures.append(str(candidate.failure))
        if "/api/curriculum/check/strong/local" in candidate.url
        else None,
    )
    before_execution_count = int(
        exercise.get_attribute("data-learning-execution-count") or "0"
    )
    editor.fill("name = 'Codaro'\nprint('Hello', name)", timeout=20_000)
    run_button.click(timeout=20_000)
    page.wait_for_function(
        """
        (before) => Number(
          document.querySelector("[data-learning-section-part='exercise']")
            ?.getAttribute('data-learning-execution-count') || '0'
        ) > before
        """,
        arg=before_execution_count,
        timeout=120_000,
    )
    check_result = exercise.locator("[data-learning-check-result]")
    check_result.wait_for(state="visible", timeout=120_000)
    page.wait_for_function(
        """
        () => ['verified', 'error', 'mismatch', 'unsupported'].includes(
          document.querySelector("[data-learning-section-part='exercise'] [data-learning-check-result]")
            ?.getAttribute('data-learning-check-result') || ''
        )
        """,
        timeout=120_000,
    )
    check_state = check_result.get_attribute("data-learning-check-result")
    check_detail = check_result.inner_text()[:1_000]
    if check_state != "verified":
        raise VerificationError(
            f"{case_id} did not verify: state={check_state}, detail={check_detail!r}, "
            f"requestFailures={local_check_request_failures}"
        )
    if not local_check_responses:
        raise VerificationError(
            f"{case_id} emitted no Local strong-check response; "
            f"state={check_state}, detail={check_detail!r}, "
            f"requestFailures={local_check_request_failures}"
        )
    check_response = local_check_responses[-1].json()
    if not isinstance(check_response, dict):
        raise VerificationError(f"{case_id} returned a non-object Local strong-check response")
    verified = check_result
    stored = exercise.locator("[data-learning-evidence-state='stored']")
    stored.wait_for(state="visible", timeout=20_000)

    evidence = page.evaluate(
        """
        async () => {
          const response = await fetch('/api/curriculum/evidence/archive');
          if (!response.ok) throw new Error(`evidence archive failed: ${response.status}`);
          return await response.json();
        }
        """
    )
    events = evidence.get("events") if isinstance(evidence, dict) else None
    added_events = [
        event
        for event in events or []
        if isinstance(event, dict) and str(event.get("eventId")) not in before_event_ids
    ]
    event = added_events[0] if len(added_events) == 1 else None
    snapshot = {
        "checkResponseIsolation": check_response.get("isolation"),
        "checkResponseWindowsBuild": check_response.get("windowsBuild"),
        "evidence": verified.get_attribute("data-learning-check-evidence"),
        "evidenceState": stored.get_attribute("data-learning-evidence-state"),
        "eventCountBefore": len(before_event_ids),
        "eventCount": len(events) if isinstance(events, list) else -1,
        "eventDeltaCount": len(added_events),
        "eventId": event.get("eventId") if isinstance(event, dict) else None,
        "manifestRuntimeTier": evidence.get("manifest", {}).get("runtimeTier")
        if isinstance(evidence, dict)
        else None,
        "runtimeTier": event.get("runtimeTier") if isinstance(event, dict) else None,
    }
    checks = {
        "nativeAppContainerResponse": (
            check_response.get("passed") is True
            and check_response.get("isolation") == "windows-appcontainer"
            and int(check_response.get("windowsBuild") or 0) >= 19045
        ),
        "strongEvidencePresented": snapshot["evidence"] == "strong",
        "strongEvidenceStored": snapshot["evidenceState"] == "stored",
        "singleNativeEventAdded": (
            snapshot["eventCount"] == snapshot["eventCountBefore"] + 1
            and snapshot["eventDeltaCount"] == 1
            and str(snapshot["eventId"] or "").startswith("local-strong:")
            and snapshot["runtimeTier"] == "local"
            and snapshot["manifestRuntimeTier"] == (
                "mixed" if snapshot["eventCountBefore"] else "local"
            )
        ),
    }
    failures = [f"{name} check failed" for name, passed in checks.items() if not passed]
    screenshot_path = SCREENSHOT_ROOT / f"{case_id}.png"
    screenshot_path.parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(screenshot_path), full_page=False)
    return {
        "id": case_id,
        "surface": "local-learning",
        "viewport": {"width": 900, "height": 760},
        "snapshot": snapshot,
        "checks": checks,
        "screenshot": display_path(screenshot_path),
        "passed": not failures,
        "failures": failures,
    }


def post_json(url: str, payload: dict[str, Any]) -> dict[str, Any]:
    request = Request(
        url,
        data=json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(request, timeout=COLD_CHECK_REQUEST_TIMEOUT_SECONDS) as response:
        value = json.loads(response.read().decode("utf-8"))
    if not isinstance(value, dict):
        raise VerificationError(f"installed product returned non-object JSON from {url}")
    return value


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
    runtime_version = RUNTIME_VERSION
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

    runtime_python, runtime_archive_sha, runtime_tree_sha = stage_managed_runtime(runtime_root)
    wheel_sha = hashlib.sha256(wheels[0].read_bytes()).hexdigest()
    install_record = {
        "releaseId": release_id,
        "backend": {
            "name": "codaro",
            "version": "0.0.12",
            "sha256": wheel_sha,
            "source": wheels[0].resolve().as_uri(),
            "stagedPath": str(wheels[0].resolve()),
        },
        "editor": {
            "name": "editor",
            "version": "0.0.12",
            "sha256": wheel_sha,
            "source": "backendWheel:codaro/webBuild",
            "stagedPath": str(web_build_root.resolve()),
        },
        "pythonRuntime": {
            "name": "python-runtime",
            "version": runtime_version,
            "sha256": runtime_archive_sha,
            "treeSha256": runtime_tree_sha,
            "source": runtime_python.resolve().as_uri(),
            "stagedPath": str(runtime_root.resolve()),
        },
        "bundles": [],
    }
    write_json(release_root / "backend" / "install-record.json", install_record)
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
    seed_native_automation_fixture()


def stage_managed_runtime(runtime_root: Path) -> tuple[Path, str, str]:
    probe = run_checked(
        (
            str(PYTHON_EXE),
            "-I",
            "-c",
            "import sys; print(sys.base_prefix)",
        ),
        timeout_seconds=30,
    ).strip()
    base_runtime = Path(probe).resolve()
    base_python = base_runtime / "python.exe"
    source_site_packages = ROOT / ".venv" / "Lib" / "site-packages"
    if not base_python.is_file() or not source_site_packages.is_dir():
        raise VerificationError("managed runtime source is incomplete")

    shutil.copytree(base_runtime, runtime_root, dirs_exist_ok=True)
    shutil.copytree(
        windows_extended_path(source_site_packages),
        windows_extended_path(runtime_root / "Lib" / "site-packages"),
        dirs_exist_ok=True,
        ignore=shutil.ignore_patterns("codaro.pth", "codaro-*.dist-info"),
    )
    runtime_python = runtime_root / "python.exe"
    runtime_archive_sha = hashlib.sha256(
        runtime_python.read_bytes() + (ROOT / "uv.lock").read_bytes()
    ).hexdigest()
    (runtime_root / ".runtime-sha256").write_text(runtime_archive_sha, encoding="utf-8")
    runtime_tree_sha = runtime_tree_sha256(runtime_root)
    (runtime_root / ".runtime-tree-sha256").write_text(runtime_tree_sha, encoding="utf-8")
    return runtime_python, runtime_archive_sha, runtime_tree_sha


def runtime_tree_sha256(root: Path) -> str:
    digest = hashlib.sha256()
    hash_root = windows_extended_path(root)

    def collect(directory: Path) -> None:
        for path in sorted(directory.iterdir(), key=lambda item: item.name):
            relative = path.relative_to(hash_root).as_posix()
            if relative == ".runtime-tree-sha256":
                continue
            if path.is_symlink() or (hasattr(path, "is_junction") and path.is_junction()):
                raise VerificationError(f"managed runtime contains a link: {path}")
            encoded = relative.encode("utf-8")
            if path.is_dir():
                digest.update(b"d")
                digest.update(struct.pack("<Q", len(encoded)))
                digest.update(encoded)
                collect(path)
                continue
            if not path.is_file():
                raise VerificationError(f"managed runtime contains an unsupported entry: {path}")
            digest.update(b"f")
            digest.update(struct.pack("<Q", len(encoded)))
            digest.update(encoded)
            digest.update(struct.pack("<Q", path.stat().st_size))
            with path.open("rb") as stream:
                while chunk := stream.read(64 * 1024):
                    digest.update(chunk)

    collect(hash_root)
    return digest.hexdigest()


def windows_extended_path(path: Path) -> Path:
    resolved = str(path.resolve())
    return Path(resolved if resolved.startswith("\\\\?\\") else f"\\\\?\\{resolved}")


def seed_native_automation_fixture() -> None:
    task_root = PRODUCT_HOME / "tasks"
    runs_root = task_root / "runs"
    automation_root = WORKSPACE_ROOT / "automation"
    runs_root.mkdir(parents=True, exist_ok=True)
    automation_root.mkdir(parents=True, exist_ok=True)
    timestamp = "2026-07-29T09:00:00+00:00"
    approved = {
        "schemaVersion": 1,
        "fingerprint": "fixture-approved",
        "confirmedAt": timestamp,
        "riskLevel": "destructive",
        "permissionScopes": [
            "filesystem.read",
            "filesystem.write",
            "network",
            "process.execute",
        ],
    }
    task_specs = (
        ("task-scheduled", "매일 학습 요약 예약", "0 9 * * *"),
        ("task-running", "실행 중인 리포트", None),
        ("task-succeeded", "완료된 학습 리포트", None),
        ("task-failed", "실패한 워크북 점검", None),
    )
    tasks: list[dict[str, Any]] = []
    for task_id, name, schedule in task_specs:
        document_path = f"automation/{task_id.removeprefix('task-')}.py"
        (WORKSPACE_ROOT / document_path).write_text(
            f'print("{name}")\n',
            encoding="utf-8",
        )
        tasks.append({
            "id": task_id,
            "name": name,
            "description": "격리된 제품 검증 작업공간의 자동화 상태 증빙입니다.",
            "documentPath": document_path,
            "schedule": schedule,
            "inputs": {"workspace": "fixture"},
            "outputs": ["summary.json"],
            "permissionScopes": list(approved["permissionScopes"]),
            "riskLevel": "destructive",
            "safetyApproval": approved,
            "createdAt": timestamp,
            "updatedAt": timestamp,
            "enabled": False,
        })
    write_json(task_root / "index.json", {"tasks": tasks})
    run_specs = {
        "task-running": {
            "id": "run-running",
            "taskId": "task-running",
            "status": "running",
            "startedAt": "2026-07-29T09:01:00+00:00",
            "finishedAt": None,
            "durationMs": None,
            "output": "리포트 데이터 3개를 읽는 중입니다.",
            "error": None,
            "variables": {"processed": 2, "total": 3},
        },
        "task-succeeded": {
            "id": "run-succeeded",
            "taskId": "task-succeeded",
            "status": "success",
            "startedAt": "2026-07-29T09:02:00+00:00",
            "finishedAt": "2026-07-29T09:02:01+00:00",
            "durationMs": 842,
            "output": "학습 리포트 3개를 summary.json에 저장했습니다.",
            "error": None,
            "variables": {"artifacts": ["summary.json"], "verified": True},
        },
        "task-failed": {
            "id": "run-failed",
            "taskId": "task-failed",
            "status": "failed",
            "startedAt": "2026-07-29T09:03:00+00:00",
            "finishedAt": "2026-07-29T09:03:00+00:00",
            "durationMs": 219,
            "output": "",
            "error": "입력 워크북이 없어 실행을 중단했습니다.",
            "variables": {"artifact": "summary.json", "retryable": True},
        },
    }
    for task_id, run in run_specs.items():
        write_json(runs_root / f"{task_id}.json", {"runs": [run]})


def reset_work_paths() -> None:
    work_root = WORK_ROOT.resolve()
    for path in (
        LAUNCHER_ROOT,
        WORKSPACE_ROOT,
        DIST_ROOT,
        SCREENSHOT_ROOT,
        ZOOM_CONTROL_PATH,
    ):
        resolved = path.resolve()
        if work_root != resolved and work_root not in resolved.parents:
            raise VerificationError(f"unsafe WebView2 work path: {resolved}")
        if path.is_dir():
            remove_tree(path)
        elif path.exists():
            path.unlink()


def remove_tree(path: Path) -> None:
    resolved = str(path.resolve())
    extended = resolved if resolved.startswith("\\\\?\\") else f"\\\\?\\{resolved}"
    shutil.rmtree(extended)


def launch_native_product(
    app_port: int,
    cdp_port: int,
    *,
    runtime_lock: dict[str, Any] | None,
) -> tuple[subprocess.Popen[str], Any]:
    log_path = WORK_ROOT / "launcher.log"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    log_handle = log_path.open("w", encoding="utf-8")
    env = os.environ.copy()
    env["CODARO_HOME"] = str(PRODUCT_HOME)
    env["CODARO_WEBVIEW2_TEST_BROWSER_ARGUMENTS"] = (
        "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection "
        f"--remote-debugging-port={cdp_port} --remote-allow-origins=*"
    )
    env["CODARO_WEBVIEW2_TEST_ZOOM_CONTROL_FILE"] = str(ZOOM_CONTROL_PATH)
    if runtime_lock is not None:
        env["WEBVIEW2_BROWSER_EXECUTABLE_FOLDER"] = str(runtimeInstallRoot(runtime_lock))
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
          const collapsedSidebarVisibleTextFragments = document.querySelector(
            '[data-slot="sidebar"][data-state="collapsed"]'
          )
            ? [...document.querySelectorAll('[data-sidebar="menu-button"] > span')]
                .filter(visible)
                .map((element) => {
                  const rect = element.getBoundingClientRect();
                  return {
                    text: (element.textContent || "").replace(/\\s+/g, " ").trim(),
                    left: rect.left,
                    right: rect.right,
                    top: rect.top,
                    bottom: rect.bottom,
                  };
                })
            : [];
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
            collapsedSidebarVisibleTextFragments,
            visibleProviderReconnectVariants: [
              ...document.querySelectorAll("[data-provider-reconnect-bar]")
            ].filter(visible).map(
              (element) => element.getAttribute("data-provider-reconnect-bar")
            ),
            notebookToolsPanelCount: document.querySelectorAll(
              '[data-notebook-tools-panel="desktop"]'
            ).length,
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
        "collapsedSidebarClean": (
            surface != "editor"
            or not snapshot["collapsedSidebarVisibleTextFragments"]
        ),
        "reconnectPromptClean": not snapshot["visibleProviderReconnectVariants"],
        "notebookToolsQuiet": (
            surface != "editor"
            or snapshot["notebookToolsPanelCount"] == 0
        ),
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


def verify_native_zoom_matrix(
    page: Page,
    *,
    hwnd: int,
    app_port: int,
) -> dict[str, Any]:
    surface_specs = (
        ("home", "[data-local-home-surface='true']"),
        ("editor", "[data-notebook-studio='true']"),
        ("automation", "[data-automation-studio-layout='true']"),
    )
    snapshots: list[dict[str, Any]] = []
    failures: list[str] = []
    baseline_dpr = 0.0
    try:
        first_url = f"http://127.0.0.1:{app_port}/?surface=home&runtime=local#home"
        page.goto(first_url, wait_until="domcontentloaded", timeout=45_000)
        page.wait_for_selector(surface_specs[0][1], state="visible", timeout=45_000)
        reset_native_browser_zoom(page)
        baseline_dpr = float(page.evaluate("window.devicePixelRatio"))
        resize_native_client(hwnd, 900, 640, baseline_dpr)
        set_native_browser_zoom(page, baseline_dpr=baseline_dpr, percent=200)

        for surface, ready_selector in surface_specs:
            navigate_zoom_surface(page, app_port, surface, ready_selector)
            snapshot = capture_zoom_snapshot(
                page,
                mode="browser",
                percent=200,
                surface=surface,
                baseline_dpr=baseline_dpr,
            )
            screenshot_path = SCREENSHOT_ROOT / f"local-{surface}-browser-zoom-200-900x640.png"
            page.screenshot(path=str(screenshot_path), full_page=False)
            snapshot["screenshot"] = display_path(screenshot_path)
            snapshots.append(snapshot)
            failures.extend(
                f"browser-zoom-200/{surface}: {message}"
                for message in snapshot["failures"]
            )

        reset_native_browser_zoom(page)
        resize_native_client(hwnd, 900, 640, baseline_dpr)
        for surface, ready_selector in surface_specs:
            navigate_zoom_surface(page, app_port, surface, ready_selector)
            apply_text_only_zoom_fixture(page, factor=4.0)
            page.wait_for_timeout(250)
            snapshot = capture_zoom_snapshot(
                page,
                mode="text-only-fixture",
                percent=400,
                surface=surface,
                baseline_dpr=baseline_dpr,
            )
            screenshot_path = SCREENSHOT_ROOT / f"local-{surface}-text-zoom-400-900x640.png"
            page.screenshot(path=str(screenshot_path), full_page=False)
            snapshot["screenshot"] = display_path(screenshot_path)
            snapshots.append(snapshot)
            failures.extend(
                f"text-zoom-400/{surface}: {message}"
                for message in snapshot["failures"]
            )
            remove_text_only_zoom_fixture(page)
    finally:
        if baseline_dpr > 0:
            reset_native_browser_zoom(page)
            resize_native_client(hwnd, 900, 640, baseline_dpr)
        remove_text_only_zoom_fixture(page)
    return {
        "id": "local-native-zoom-matrix",
        "surface": "home-editor-automation",
        "actualMinimumClientCssAt100Percent": {"width": 900, "height": 640},
        "baselineDevicePixelRatio": baseline_dpr,
        "snapshots": snapshots,
        "checks": {
            "browserZoom200AllSurfaces": all(
                snapshot["passed"]
                for snapshot in snapshots
                if snapshot["mode"] == "browser"
            ) and len([snapshot for snapshot in snapshots if snapshot["mode"] == "browser"]) == 3,
            "textOnly400AllSurfaces": all(
                snapshot["passed"]
                for snapshot in snapshots
                if snapshot["mode"] == "text-only-fixture"
            ) and len([
                snapshot for snapshot in snapshots
                if snapshot["mode"] == "text-only-fixture"
            ]) == 3,
        },
        "passed": not failures,
        "failures": failures,
    }


def navigate_zoom_surface(
    page: Page,
    app_port: int,
    surface: str,
    ready_selector: str,
) -> None:
    url = f"http://127.0.0.1:{app_port}/?surface={surface}&runtime=local#{surface}"
    response = page.goto(url, wait_until="domcontentloaded", timeout=45_000)
    if response is not None and response.status >= 400:
        raise VerificationError(f"zoom matrix {surface} returned HTTP {response.status}")
    page.wait_for_selector(ready_selector, state="visible", timeout=45_000)
    page.wait_for_function(
        "surface => document.querySelector('[data-active-product-surface]')?.getAttribute('data-active-product-surface') === surface",
        arg=surface,
        timeout=45_000,
    )
    page.wait_for_timeout(250)


def apply_text_only_zoom_fixture(page: Page, *, factor: float) -> None:
    if factor != 4.0:
        raise VerificationError(f"unsupported text-only zoom factor: {factor}")
    applied = page.evaluate(
        """factor => {
          document.documentElement.setAttribute(
            "data-codaro-text-zoom-fixture",
            String(Math.round(factor * 100)),
          );
          const excluded = new Set(["SCRIPT", "STYLE", "SVG", "PATH"]);
          const candidates = [...document.body.querySelectorAll("*")];
          let count = 0;
          for (const element of candidates) {
            if (!(element instanceof HTMLElement) || excluded.has(element.tagName)) continue;
            const hasDirectText = [...element.childNodes].some(
              (node) => node.nodeType === Node.TEXT_NODE && (node.textContent || "").trim(),
            );
            const hasFormText = element.matches("input, textarea, select");
            if (!hasDirectText && !hasFormText) continue;
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            if (style.display === "none" || style.visibility === "hidden"
              || rect.width <= 0 || rect.height <= 0) continue;
            if (element.classList.contains("sr-only")
              || style.clip === "rect(0px, 0px, 0px, 0px)"
              || style.clipPath === "inset(50%)") continue;
            const baselineFontSize = Number.parseFloat(style.fontSize);
            if (!Number.isFinite(baselineFontSize) || baselineFontSize <= 0) continue;
            element.dataset.codaroTextZoomBaselineFontSize = String(baselineFontSize);
            element.dataset.codaroTextZoomOriginalFontSize = element.style.getPropertyValue("font-size");
            element.dataset.codaroTextZoomOriginalFontSizePriority = element.style.getPropertyPriority("font-size");
            element.dataset.codaroTextZoomOriginalLineHeight = element.style.getPropertyValue("line-height");
            element.dataset.codaroTextZoomOriginalLineHeightPriority = element.style.getPropertyPriority("line-height");
            element.style.setProperty(
              "font-size",
              `${baselineFontSize * factor}px`,
              "important",
            );
            const baselineLineHeight = Number.parseFloat(style.lineHeight);
            if (Number.isFinite(baselineLineHeight) && baselineLineHeight > 0) {
              element.style.setProperty(
                "line-height",
                `${baselineLineHeight * factor}px`,
                "important",
              );
            }
            count += 1;
          }
          return count;
        }""",
        factor,
    )
    if not isinstance(applied, int) or applied < 1:
        raise VerificationError("text-only zoom fixture did not find visible text")


def remove_text_only_zoom_fixture(page: Page) -> None:
    page.evaluate(
        """() => {
          const elements = [...document.querySelectorAll(
            "[data-codaro-text-zoom-baseline-font-size]"
          )];
          for (const element of elements) {
            const fontSize = element.dataset.codaroTextZoomOriginalFontSize || "";
            const fontPriority = element.dataset.codaroTextZoomOriginalFontSizePriority || "";
            const lineHeight = element.dataset.codaroTextZoomOriginalLineHeight || "";
            const linePriority = element.dataset.codaroTextZoomOriginalLineHeightPriority || "";
            if (fontSize) element.style.setProperty("font-size", fontSize, fontPriority);
            else element.style.removeProperty("font-size");
            if (lineHeight) element.style.setProperty("line-height", lineHeight, linePriority);
            else element.style.removeProperty("line-height");
            delete element.dataset.codaroTextZoomBaselineFontSize;
            delete element.dataset.codaroTextZoomOriginalFontSize;
            delete element.dataset.codaroTextZoomOriginalFontSizePriority;
            delete element.dataset.codaroTextZoomOriginalLineHeight;
            delete element.dataset.codaroTextZoomOriginalLineHeightPriority;
          }
          document.documentElement.removeAttribute("data-codaro-text-zoom-fixture");
        }"""
    )


def capture_zoom_snapshot(
    page: Page,
    *,
    mode: str,
    percent: int,
    surface: str,
    baseline_dpr: float,
) -> dict[str, Any]:
    snapshot = page.evaluate(
        """({mode, percent, surface, baselineDpr}) => {
          const visible = (element) => {
            if (!(element instanceof HTMLElement)) return false;
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none"
              && style.visibility !== "hidden"
              && rect.width > 0
              && rect.height > 0;
          };
          const controls = [...document.querySelectorAll("button, a[href], input, textarea, select")]
            .filter(visible)
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                label: element.getAttribute("aria-label")
                  || element.getAttribute("title")
                  || (element.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 80),
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
              };
            });
          const horizontallyClippedControls = controls.filter((control) => (
            control.bottom > 0
            && control.top < window.innerHeight
            && (control.left < -1 || control.right > window.innerWidth + 1)
          ));
          const topControls = [...document.querySelectorAll(
            "[data-topbar-controls] button, [data-topbar-controls] a"
          )].filter(visible).map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              label: element.getAttribute("aria-label") || element.getAttribute("title") || "",
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
            };
          });
          const topControlOverlaps = [];
          for (let index = 0; index < topControls.length; index += 1) {
            for (let candidate = index + 1; candidate < topControls.length; candidate += 1) {
              const a = topControls[index];
              const b = topControls[candidate];
              if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
                && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) {
                topControlOverlaps.push([a.label, b.label]);
              }
            }
          }
          const root = document.documentElement;
          const textZoomElements = [...document.querySelectorAll(
            "[data-codaro-text-zoom-baseline-font-size]"
          )].filter(visible);
          const textZoomRatios = textZoomElements.map((element) => {
            const baseline = Number.parseFloat(
              element.getAttribute("data-codaro-text-zoom-baseline-font-size") || "0"
            );
            return baseline > 0 ? Number.parseFloat(getComputedStyle(element).fontSize) / baseline : 0;
          }).filter((ratio) => Number.isFinite(ratio) && ratio > 0);
          const clippedTextElements = textZoomElements.filter((element) => {
            const style = getComputedStyle(element);
            const clipsX = ["auto", "clip", "hidden", "scroll"].includes(style.overflowX);
            const clipsY = ["auto", "clip", "hidden", "scroll"].includes(style.overflowY);
            return (clipsX && element.scrollWidth > element.clientWidth + 1)
              || (clipsY && element.scrollHeight > element.clientHeight + 1);
          }).map((element) => ({
            text: (element.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 80),
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            clientHeight: element.clientHeight,
            scrollHeight: element.scrollHeight,
          })).slice(0, 25);
          const visibleTextRects = textZoomElements.map((element) => ({
            element,
            rect: element.getBoundingClientRect(),
            text: (element.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 60),
          })).filter(({rect}) => rect.bottom > 0 && rect.top < window.innerHeight
            && rect.right > 0 && rect.left < window.innerWidth);
          const textOverlaps = [];
          for (let index = 0; index < visibleTextRects.length; index += 1) {
            for (let candidate = index + 1; candidate < visibleTextRects.length; candidate += 1) {
              const a = visibleTextRects[index];
              const b = visibleTextRects[candidate];
              if (a.element.contains(b.element) || b.element.contains(a.element)) continue;
              if (Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left) > 2
                && Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top) > 2) {
                textOverlaps.push([a.text, b.text]);
                if (textOverlaps.length >= 25) break;
              }
            }
            if (textOverlaps.length >= 25) break;
          }
          return {
            mode,
            percent,
            surface,
            activeSurface: document.querySelector("[data-active-product-surface]")
              ?.getAttribute("data-active-product-surface"),
            runtimeTier: document.querySelector('meta[name="codaro-runtime-tier"]')
              ?.getAttribute("content"),
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
            zoomRatio: window.devicePixelRatio / baselineDpr,
            rootFontSize: Number.parseFloat(getComputedStyle(root).fontSize),
            textZoomElementCount: textZoomRatios.length,
            minimumTextZoomRatio: textZoomRatios.length ? Math.min(...textZoomRatios) : 0,
            maximumTextZoomRatio: textZoomRatios.length ? Math.max(...textZoomRatios) : 0,
            clippedTextElements,
            textOverlaps,
            horizontalOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
            horizontallyClippedControls,
            topControlOverlaps,
          };
        }""",
        {
            "mode": mode,
            "percent": percent,
            "surface": surface,
            "baselineDpr": baseline_dpr,
        },
    )
    checks = {
        "surface": snapshot["activeSurface"] == surface,
        "runtimeTier": snapshot["runtimeTier"] == "local",
        "actualMinimumClient": (
            abs(snapshot["innerWidth"] - 450) <= 4
            if mode == "browser"
            else abs(snapshot["innerWidth"] - 900) <= 2
        ),
        "zoomFactor": (
            abs(snapshot["zoomRatio"] - 2.0) <= 0.08
            if mode == "browser"
            else (
                snapshot["textZoomElementCount"] > 0
                and abs(snapshot["minimumTextZoomRatio"] - 4.0) <= 0.02
                and abs(snapshot["maximumTextZoomRatio"] - 4.0) <= 0.02
                and abs(snapshot["rootFontSize"] - 16.0) <= 1.0
            )
        ),
        "horizontalOverflow": snapshot["horizontalOverflow"] == 0,
        "controlClipping": not snapshot["horizontallyClippedControls"],
        "topControlOverlap": not snapshot["topControlOverlaps"],
        "textClipping": mode == "browser" or not snapshot["clippedTextElements"],
        "textOverlap": mode == "browser" or not snapshot["textOverlaps"],
    }
    failures = [f"{name} check failed" for name, passed in checks.items() if not passed]
    return {
        **snapshot,
        "checks": checks,
        "passed": not failures,
        "failures": failures,
    }


def reset_native_browser_zoom(page: Page) -> None:
    request_native_browser_zoom(1.0)
    page.wait_for_timeout(300)


def set_native_browser_zoom(
    page: Page,
    *,
    baseline_dpr: float,
    percent: int,
) -> None:
    if percent != 200:
        raise VerificationError(f"unsupported native browser zoom target: {percent}")
    request_native_browser_zoom(2.0)
    page.wait_for_function(
        "baseline => Math.abs((window.devicePixelRatio / baseline) - 2) <= 0.08",
        arg=baseline_dpr,
        timeout=10_000,
    )


def request_native_browser_zoom(scale_factor: float) -> None:
    ZOOM_CONTROL_PATH.parent.mkdir(parents=True, exist_ok=True)
    pending = ZOOM_CONTROL_PATH.with_suffix(".pending")
    pending.write_text(f"{scale_factor:.2f}\n", encoding="utf-8")
    os.replace(pending, ZOOM_CONTROL_PATH)


def verify_native_automation_state_matrix(
    page: Page,
    *,
    hwnd: int,
    app_port: int,
    console_errors: list[str],
) -> dict[str, Any]:
    case_id = "local-automation-state-matrix-1440x900"
    response = page.goto(
        f"http://127.0.0.1:{app_port}/?surface=automation&runtime=local#automation",
        wait_until="domcontentloaded",
        timeout=45_000,
    )
    if response is not None and response.status >= 400:
        raise VerificationError(f"{case_id} returned HTTP {response.status}")
    page.wait_for_selector("[data-automation-studio-layout='true']", state="visible", timeout=45_000)
    page.wait_for_selector(
        "[data-automation-capability-state='operational']",
        state="visible",
        timeout=45_000,
    )
    page.wait_for_function(
        "() => document.querySelectorAll('[data-automation-task-selector]').length === 4",
        timeout=45_000,
    )
    dpr = float(page.evaluate("window.devicePixelRatio"))
    resize_native_client(hwnd, 1440, 900, dpr)
    page.wait_for_timeout(400)

    captures: dict[str, dict[str, Any]] = {}
    expected_tasks = {
        "scheduled": ("task-scheduled", "idle"),
        "running": ("task-running", "running"),
        "succeeded": ("task-succeeded", "success"),
    }
    for state_name, (task_id, run_status) in expected_tasks.items():
        select_native_automation_task(page, task_id, run_status)
        captures[state_name] = capture_native_automation_state(page, state_name)

    select_native_automation_task(page, "task-failed", "failed")
    page.locator("[data-automation-estop-control='true']").click()
    page.wait_for_selector(
        "[data-automation-estop-state='active']",
        state="visible",
        timeout=20_000,
    )
    page.wait_for_selector(
        "[data-automation-estop-reason='true']",
        state="visible",
        timeout=20_000,
    )
    page.locator("[data-automation-run-variables='true']").scroll_into_view_if_needed()
    page.wait_for_timeout(200)
    captures["failed"] = capture_native_automation_state(page, "failed")
    page.locator("[data-automation-estop-control='true']").click()
    page.wait_for_selector(
        "[data-automation-estop-state='clear']",
        state="visible",
        timeout=20_000,
    )

    paused_payload = {
        "runId": "agent-run-paused",
        "kind": "browserUse",
        "goal": "학습 결과 페이지를 열어 요약을 확인합니다.",
        "status": "paused",
        "outcome": None,
        "error": None,
        "steps": [{
            "id": "step-open-summary",
            "index": 0,
            "decision": "act",
            "verb": "navigate",
            "params": {"url": "https://example.com/learning-summary"},
            "rationale": "검증된 요약 페이지를 확인합니다.",
            "label": "학습 요약 열기",
            "gateVerdict": "allow",
            "stepStatus": "success",
            "stepError": None,
            "observationSummary": "요약 화면을 열었습니다.",
        }],
        "pending": None,
    }

    def handle_paused_agent(route: Any) -> None:
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(paused_payload, ensure_ascii=False),
        )

    page.route("**/api/automation/agent/**", handle_paused_agent)
    try:
        page.get_by_role("button", name="브라우저유즈", exact=True).click()
        page.wait_for_selector(
            "[data-automation-live-kind='browserUse'][data-automation-live-status='idle']",
            state="visible",
            timeout=20_000,
        )
        page.locator("[data-automation-live-kind='browserUse'] textarea").fill(
            "학습 결과 페이지를 열어 요약을 확인해 줘"
        )
        page.get_by_role("button", name="맡기기", exact=True).click()
        page.wait_for_selector(
            "[data-automation-live-kind='browserUse'][data-automation-live-status='paused']",
            state="visible",
            timeout=20_000,
        )
        captures["paused"] = capture_native_automation_state(page, "paused")
    finally:
        page.unroute("**/api/automation/agent/**", handle_paused_agent)

    def handle_disconnected_health(route: Any) -> None:
        route.abort("connectionfailed")

    disconnect_console_start = len(console_errors)
    disconnect_console_errors: list[str] = []
    page.route("**/api/health", handle_disconnected_health)
    try:
        page.reload(wait_until="domcontentloaded", timeout=45_000)
        page.wait_for_selector(
            "[data-automation-capability-state='connection-required']",
            state="visible",
            timeout=45_000,
        )
        resize_native_client(hwnd, 1440, 900, float(page.evaluate("window.devicePixelRatio")))
        page.wait_for_timeout(300)
        captures["disconnected"] = capture_native_automation_state(page, "disconnected")
    finally:
        page.unroute("**/api/health", handle_disconnected_health)
        page.reload(wait_until="domcontentloaded", timeout=45_000)
        page.wait_for_selector("[data-automation-studio-layout='true']", state="visible", timeout=45_000)
        page.wait_for_timeout(200)
        disconnect_console_errors = console_errors[disconnect_console_start:]
        unexpected_disconnect_errors = [
            message
            for message in disconnect_console_errors
            if message != "Failed to load resource: net::ERR_CONNECTION_FAILED"
        ]
        del console_errors[disconnect_console_start:]
        console_errors.extend(unexpected_disconnect_errors)

    state_checks = {
        "scheduled": (
            captures["scheduled"]["snapshot"]["selectedTask"] == "task-scheduled"
            and captures["scheduled"]["snapshot"]["runStatus"] == "idle"
            and captures["scheduled"]["snapshot"]["hasSchedule"]
        ),
        "running": captures["running"]["snapshot"]["runStatus"] == "running",
        "succeeded": captures["succeeded"]["snapshot"]["runStatus"] == "success",
        "failed": (
            captures["failed"]["snapshot"]["runStatus"] == "failed"
            and captures["failed"]["snapshot"]["eStopState"] == "active"
            and captures["failed"]["snapshot"]["hasEStopReason"]
            and captures["failed"]["snapshot"]["hasFailureCause"]
            and captures["failed"]["snapshot"]["hasArtifact"]
        ),
        "paused": (
            captures["paused"]["snapshot"]["liveKind"] == "browserUse"
            and captures["paused"]["snapshot"]["liveStatus"] == "paused"
        ),
        "disconnected": (
            captures["disconnected"]["snapshot"]["capabilityState"] == "connection-required"
        ),
        "viewport": all(
            abs(capture["snapshot"]["viewportWidth"] - 1440) <= 2
            and abs(capture["snapshot"]["viewportHeight"] - 900) <= 2
            for capture in captures.values()
        ),
        "screenshots": all(capture["bytes"] > 1024 for capture in captures.values()),
        "redaction": all(
            not any(capture["snapshot"]["redactionSignals"].values())
            for capture in captures.values()
        ),
        "disconnectConsoleSignal": any(
            message == "Failed to load resource: net::ERR_CONNECTION_FAILED"
            for message in disconnect_console_errors
        ),
    }
    failures = [
        f"{check} check failed"
        for check, passed in state_checks.items()
        if not passed
    ]
    return {
        "id": case_id,
        "surface": "automation",
        "requestedCssViewport": {"width": 1440, "height": 900},
        "stateOrder": [
            "scheduled",
            "running",
            "succeeded",
            "failed",
            "paused",
            "disconnected",
        ],
        "states": captures,
        "expectedDisconnectConsoleErrors": disconnect_console_errors,
        "checks": state_checks,
        "passed": not failures,
        "failures": failures,
    }


def select_native_automation_task(page: Page, task_id: str, run_status: str) -> None:
    page.locator(f"[data-automation-task-selector='{task_id}']").click()
    page.wait_for_selector(
        f"[data-automation-run-inspector='true'][data-automation-selected-task='{task_id}']",
        state="visible",
        timeout=20_000,
    )
    page.wait_for_selector(
        f"[data-automation-run-status='{run_status}']",
        state="visible",
        timeout=20_000,
    )


def capture_native_automation_state(page: Page, state_name: str) -> dict[str, Any]:
    snapshot = page.evaluate(
        """() => {
          const visibleText = document.body.innerText || "";
          const isVisibleInViewport = (element) => {
            if (!(element instanceof HTMLElement)) return false;
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return rect.width > 0
              && rect.height > 0
              && rect.bottom > 0
              && rect.top < window.innerHeight
              && rect.right > 0
              && rect.left < window.innerWidth
              && style.display !== "none"
              && style.visibility !== "hidden";
          };
          const visibleEmailAddresses = visibleText.match(
            /\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b/gi
          ) || [];
          const nonExampleEmailAddresses = visibleEmailAddresses.filter((address) => {
            const domain = address.split("@").at(-1)?.toLowerCase();
            return !["example.com", "example.org", "example.net"].includes(domain || "");
          });
          return {
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            horizontalOverflow: Math.max(
              0,
              document.documentElement.scrollWidth - window.innerWidth
            ),
            capabilityState: document.querySelector("[data-automation-capability-state]")
              ?.getAttribute("data-automation-capability-state") ?? null,
            selectedTask: document.querySelector("[data-automation-run-inspector]")
              ?.getAttribute("data-automation-selected-task") ?? null,
            runStatus: document.querySelector("[data-automation-run-status]")
              ?.getAttribute("data-automation-run-status") ?? null,
            liveKind: document.querySelector("[data-automation-live-kind]")
              ?.getAttribute("data-automation-live-kind") ?? null,
            liveStatus: document.querySelector("[data-automation-live-status]")
              ?.getAttribute("data-automation-live-status") ?? null,
            eStopState: document.querySelector("[data-automation-estop-state]")
              ?.getAttribute("data-automation-estop-state") ?? null,
            hasEStopReason: Boolean(
              document.querySelector("[data-automation-estop-reason]")?.textContent?.trim()
            ),
            hasSchedule: visibleText.includes("0 9 * * *") && visibleText.includes("예약"),
            hasFailureCause: [...document.querySelectorAll("[data-automation-run-stream='stderr']")]
              .some((element) => isVisibleInViewport(element)
                && (element.textContent || "").includes("입력 워크북이 없어 실행을 중단했습니다.")),
            hasArtifact: [...document.querySelectorAll("[data-automation-run-variables]")]
              .some((element) => isVisibleInViewport(element)
                && (element.textContent || "").includes("summary.json")),
            redactionSignals: {
              windowsUserPath: /[A-Za-z]:\\\\Users\\\\[^\\s\\\\]+/i.test(visibleText),
              macUserPath: /\\/Users\\/[^\\s/]+/i.test(visibleText),
              linuxUserPath: /\\/home\\/[^\\s/]+/i.test(visibleText),
              emailAddress: nonExampleEmailAddresses.length > 0,
              accessCredential: /\\b(?:sk-[A-Za-z0-9_-]{12,}|ghp_[A-Za-z0-9]{12,}|github_pat_[A-Za-z0-9_]{12,}|Bearer\\s+[A-Za-z0-9._~-]{12,})\\b/i.test(visibleText),
            },
          };
        }"""
    )
    screenshot_path = SCREENSHOT_ROOT / f"local-automation-{state_name}-1440x900.png"
    page.screenshot(path=str(screenshot_path))
    return {
        "state": state_name,
        "screenshot": display_path(screenshot_path),
        "bytes": screenshot_path.stat().st_size,
        "snapshot": snapshot,
    }


def verify_long_notebook_keyboard_navigation(
    page: Page,
    *,
    hwnd: int,
    app_port: int,
) -> dict[str, Any]:
    case_id = "local-notebook-keyboard-12-cells"
    response = page.goto(
        f"http://127.0.0.1:{app_port}/?surface=editor&runtime=local#editor",
        wait_until="domcontentloaded",
        timeout=45_000,
    )
    if response is not None and response.status >= 400:
        raise VerificationError(f"{case_id} returned HTTP {response.status}")
    page.wait_for_selector("[data-notebook-studio='true']", state="visible", timeout=45_000)
    dpr = float(page.evaluate("window.devicePixelRatio"))
    resize_native_client(hwnd, 1024, 768, dpr)
    page.wait_for_timeout(300)

    cells = page.locator("[data-notebook-cell]")
    append_toolbar = page.get_by_role("toolbar", name="노트북 셀 추가")
    append_code = append_toolbar.get_by_role("button", name="+ Code")
    append_markdown = append_toolbar.get_by_role("button", name="+ Markdown")
    target_count = 12
    if cells.count() > target_count:
        raise VerificationError(
            f"{case_id} expected at most {target_count} cells, found {cells.count()}"
        )
    while cells.count() < 8:
        append_code.click()
    if not page.locator('[data-notebook-cell="markdown"]').count():
        append_markdown.click()
    while cells.count() < target_count:
        append_code.click()

    page.wait_for_function(
        """
        (expectedIndex) => {
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          return selected === cells[expectedIndex]
            && selected?.contains(document.activeElement);
        }
        """,
        arg=target_count - 1,
        timeout=20_000,
    )
    initial_scroll = page.evaluate(
        """() => {
          const viewport = document.querySelector(
            '.notebookViewport [data-slot="scroll-area-viewport"]'
          );
          if (!(viewport instanceof HTMLElement)) {
            throw new Error('notebook scroll viewport is missing');
          }
          return {
            scrollHeight: viewport.scrollHeight,
            clientHeight: viewport.clientHeight,
            scrollTop: viewport.scrollTop,
          };
        }"""
    )
    if initial_scroll["scrollHeight"] <= initial_scroll["clientHeight"]:
        raise VerificationError(f"{case_id} did not create a long scrollable notebook")

    markdown_up = False
    for expected_index in range(target_count - 2, -1, -1):
        page.keyboard.press("Control+Home")
        page.keyboard.press("ArrowUp")
        page.wait_for_function(
            """
            (expectedIndex) => {
              const cells = [...document.querySelectorAll('[data-notebook-cell]')];
              const selected = document.querySelector('[data-notebook-cell-selected="true"]');
              return selected === cells[expectedIndex]
                && selected?.contains(document.activeElement);
            }
            """,
            arg=expected_index,
            timeout=20_000,
        )
        if cells.nth(expected_index).get_attribute("data-notebook-cell") == "markdown":
            markdown_up = page.evaluate("document.activeElement?.tagName") == "TEXTAREA"

    top_state = notebook_navigation_viewport_state(page)
    markdown_down = False
    for expected_index in range(1, target_count):
        page.keyboard.press("Control+End")
        page.keyboard.press("ArrowDown")
        page.wait_for_function(
            """
            (expectedIndex) => {
              const cells = [...document.querySelectorAll('[data-notebook-cell]')];
              const selected = document.querySelector('[data-notebook-cell-selected="true"]');
              return selected === cells[expectedIndex]
                && selected?.contains(document.activeElement);
            }
            """,
            arg=expected_index,
            timeout=20_000,
        )
        if cells.nth(expected_index).get_attribute("data-notebook-cell") == "markdown":
            markdown_down = page.evaluate("document.activeElement?.tagName") == "TEXTAREA"

    bottom_state = notebook_navigation_viewport_state(page)
    output_marker = "screen-reader-output-order"
    first_editor = cells.nth(0).locator(".cm-content")
    first_editor.fill(f"print('{output_marker}')")
    first_editor.press("Control+Enter")
    page.wait_for_function(
        """
        ({ marker, element }) => {
          const status = element.getAttribute('data-notebook-cell-status');
          const output = element.querySelector('[data-execution-output="true"]');
          return ['success', 'done'].includes(status)
            && (output?.textContent || '').includes(marker);
        }
        """,
        arg={
            "element": cells.nth(0).element_handle(),
            "marker": output_marker,
        },
        timeout=120_000,
    )
    composition_evidence = verify_notebook_composition_guards(page, cells)
    native_ime_evidence = verify_native_korean_ime(page, hwnd=hwnd, cells=cells)
    accessible_name_evidence = notebook_accessible_name_state(page)
    accessibility_tree_evidence = notebook_accessibility_tree_state(
        page,
        expected_cell_count=target_count,
    )
    screenshot_path = SCREENSHOT_ROOT / f"{case_id}.png"
    page.screenshot(path=str(screenshot_path))
    checks = {
        "cellCount": cells.count() == target_count,
        "longDocument": initial_scroll["scrollHeight"] > initial_scroll["clientHeight"],
        "firstCellReached": top_state["selectedIndex"] == 0,
        "firstCellVisible": bool(top_state["selectedVisible"]),
        "firstCellUnobscured": not top_state["controlOverlaps"],
        "lastCellReached": bottom_state["selectedIndex"] == target_count - 1,
        "lastCellVisible": bool(bottom_state["selectedVisible"]),
        "lastCellUnobscured": not bottom_state["controlOverlaps"],
        "executionOutputPresent": (
            accessible_name_evidence["outputCount"] >= 1
            and output_marker in accessible_name_evidence["outputText"]
        ),
        "markdownFocusedUp": markdown_up,
        "markdownFocusedDown": markdown_down,
        "positionedAccessibleNames": accessible_name_evidence["valid"],
        "accessibilityTreeReadingOrder": accessibility_tree_evidence["valid"],
        "nativeKoreanIme": native_ime_evidence["valid"],
    }
    case_failures = [
        f"{check} check failed"
        for check, passed in checks.items()
        if not passed
    ]
    return {
        "id": case_id,
        "surface": "editor",
        "requestedCssViewport": {"width": 1024, "height": 768},
        "snapshot": {
            "cellCount": cells.count(),
            "executionOutputMarker": output_marker,
            "scrollHeight": initial_scroll["scrollHeight"],
            "viewportHeight": initial_scroll["clientHeight"],
            "topScrollTop": top_state["scrollTop"],
            "bottomScrollTop": bottom_state["scrollTop"],
            "accessibleNames": accessible_name_evidence,
            "accessibilityTree": accessibility_tree_evidence,
            "compositionGuards": composition_evidence,
            "nativeKoreanIme": native_ime_evidence,
        },
        "screenshot": display_path(screenshot_path),
        "checks": checks,
        "passed": not case_failures,
        "failures": case_failures,
    }


def verify_notebook_composition_guards(page: Page, cells: Locator) -> dict[str, Any]:
    cell_types = [
        cells.nth(index).get_attribute("data-notebook-cell")
        for index in range(cells.count())
    ]
    markdown_index = next(
        (
            index
            for index, cell_type in enumerate(cell_types)
            if cell_type == "markdown" and 0 < index < len(cell_types) - 1
        ),
        None,
    )
    if markdown_index is None or cell_types[markdown_index - 1] != "code":
        raise VerificationError(
            "notebook composition guard needs a code, Markdown, code sequence"
        )

    code_index = markdown_index - 1
    code_editor = cells.nth(code_index).locator(".cm-content")
    code_editor.click()
    page.keyboard.press("Control+A")
    page.keyboard.insert_text("# 한글 조합")
    page.keyboard.press("Control+End")
    code_editor.dispatch_event("compositionstart", {"data": ""})
    code_editor.dispatch_event("compositionupdate", {"data": "한글"})
    page.keyboard.press("ArrowDown")
    page.evaluate(
        """
        (element) => {
          const event = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            code: 'Enter',
            composed: true,
            key: 'Enter',
            shiftKey: true,
          });
          Object.defineProperty(event, 'isComposing', { value: true });
          element.dispatchEvent(event);
        }
        """,
        code_editor.element_handle(),
    )
    code_during_composition = page.evaluate(
        """
        (expectedIndex) => {
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          return {
            cellCount: cells.length,
            focused: cells[expectedIndex]?.contains(document.activeElement) ?? false,
            selectedIndex: cells.indexOf(selected),
            status: cells[expectedIndex]?.getAttribute('data-notebook-cell-status'),
          };
        }
        """,
        code_index,
    )
    if (
        code_during_composition["cellCount"] != len(cell_types)
        or not code_during_composition["focused"]
        or code_during_composition["selectedIndex"] != code_index
        or code_during_composition["status"] != "idle"
    ):
        raise VerificationError(
            "CodeMirror composition triggered cell execution or boundary navigation: "
            f"{code_during_composition}"
        )
    code_editor.dispatch_event("compositionend", {"data": "한글"})
    page.wait_for_timeout(550)
    page.keyboard.press("Control+End")
    page.keyboard.press("ArrowDown")
    page.wait_for_function(
        """
        (expectedIndex) => {
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          return selected === cells[expectedIndex]
            && selected?.contains(document.activeElement);
        }
        """,
        arg=markdown_index,
        timeout=20_000,
    )

    markdown_editor = cells.nth(markdown_index).locator(".notebookMarkdownEditor")
    markdown_editor.fill("# 한글 조합")
    markdown_editor.evaluate(
        "(element) => element.setSelectionRange(element.value.length, element.value.length)"
    )
    markdown_editor.dispatch_event("compositionstart", {"data": ""})
    markdown_editor.dispatch_event("compositionupdate", {"data": "한글"})
    page.keyboard.press("ArrowDown")
    markdown_during_composition = page.evaluate(
        """
        (expectedIndex) => {
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          const editor = cells[expectedIndex]?.querySelector('.notebookMarkdownEditor');
          return {
            focused: document.activeElement === editor,
            selectedIndex: cells.indexOf(selected),
            value: editor?.value ?? null,
          };
        }
        """,
        markdown_index,
    )
    if (
        not markdown_during_composition["focused"]
        or markdown_during_composition["selectedIndex"] != markdown_index
        or markdown_during_composition["value"] != "# 한글 조합"
    ):
        raise VerificationError(
            "Markdown composition triggered boundary navigation or text loss: "
            f"{markdown_during_composition}"
        )
    markdown_editor.dispatch_event("compositionend", {"data": "한글"})
    page.wait_for_timeout(550)
    page.keyboard.press("ArrowDown")
    page.wait_for_function(
        """
        (expectedIndex) => {
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          return selected === cells[expectedIndex]
            && selected?.contains(document.activeElement);
        }
        """,
        arg=markdown_index + 1,
        timeout=20_000,
    )
    return {
        "codeCellIndex": code_index,
        "codeCompositionPreservedFocus": True,
        "codeCompositionPreventedRunAndAdvance": True,
        "codePostCompositionBoundaryMoved": True,
        "markdownCellIndex": markdown_index,
        "markdownCompositionPreservedTextAndFocus": True,
        "markdownPostCompositionBoundaryMoved": True,
    }


def verify_native_korean_ime(
    page: Page,
    *,
    hwnd: int,
    cells: Locator,
) -> dict[str, Any]:
    cell_types = [
        cells.nth(index).get_attribute("data-notebook-cell")
        for index in range(cells.count())
    ]
    markdown_index = next(
        (
            index
            for index, cell_type in enumerate(cell_types)
            if cell_type == "markdown" and 0 < index < len(cell_types) - 1
        ),
        None,
    )
    if markdown_index is None or cell_types[markdown_index - 1] != "code":
        raise VerificationError(
            "native Korean IME check needs a code, Markdown, code sequence"
        )

    code_index = markdown_index - 1
    code_editor = cells.nth(code_index).locator(".cm-content")
    markdown_editor = cells.nth(markdown_index).locator(".notebookMarkdownEditor")
    toggled_to_korean = False

    def reset_editor(editor: Locator, *, textarea: bool) -> None:
        if textarea:
            editor.fill("")
        else:
            editor.click()
            page.keyboard.press("Control+A")
            page.keyboard.press("Backspace")
        editor.evaluate(
            """
            (element) => {
              element.__codaroNativeImeEvents = [];
              if (!element.__codaroNativeImeListenerInstalled) {
                for (const type of ['compositionstart', 'compositionupdate', 'compositionend']) {
                  element.addEventListener(type, (event) => {
                    element.__codaroNativeImeEvents.push({
                      data: event.data ?? '',
                      type: event.type,
                    });
                  });
                }
                element.__codaroNativeImeListenerInstalled = true;
              }
            }
            """
        )

    def editor_value(editor: Locator, *, textarea: bool) -> str:
        if textarea:
            return editor.input_value()
        return editor.evaluate(
            "(element) => (element.innerText || '').replace(/\\r/g, '')"
        )

    def ime_events(editor: Locator) -> list[dict[str, str]]:
        return editor.evaluate(
            "(element) => element.__codaroNativeImeEvents || []"
        )

    def type_hangeul(editor: Locator, *, textarea: bool) -> tuple[str, list[dict[str, str]]]:
        activate_native_window(hwnd)
        for key in "GKSRMF":
            native_key_tap(ord(key))
        native_key_tap(VK_SPACE)
        native_key_tap(VK_BACK)
        page.wait_for_timeout(350)
        return editor_value(editor, textarea=textarea), ime_events(editor)

    try:
        reset_editor(code_editor, textarea=False)
        code_value, code_events = type_hangeul(code_editor, textarea=False)
        if "한글" not in code_value:
            native_key_tap(VK_HANGUL)
            toggled_to_korean = True
            reset_editor(code_editor, textarea=False)
            code_value, code_events = type_hangeul(code_editor, textarea=False)

        reset_editor(code_editor, textarea=False)
        activate_native_window(hwnd)
        native_key_tap(ord("G"))
        page.wait_for_timeout(180)
        code_composing_events = ime_events(code_editor)
        native_key_tap(VK_DOWN)
        page.wait_for_timeout(250)
        code_arrow_state = notebook_selected_cell_state(page)
        code_arrow_value = editor_value(code_editor, textarea=False)
        native_key_tap(VK_ESCAPE)

        reset_editor(markdown_editor, textarea=True)
        markdown_value, markdown_events = type_hangeul(
            markdown_editor,
            textarea=True,
        )

        reset_editor(markdown_editor, textarea=True)
        activate_native_window(hwnd)
        native_key_tap(ord("G"))
        page.wait_for_timeout(180)
        markdown_composing_events = ime_events(markdown_editor)
        native_key_tap(VK_DOWN)
        page.wait_for_timeout(250)
        markdown_arrow_state = notebook_selected_cell_state(page)
        markdown_arrow_value = editor_value(markdown_editor, textarea=True)
        native_key_tap(VK_ESCAPE)
    finally:
        if toggled_to_korean:
            activate_native_window(hwnd)
            native_key_tap(VK_HANGUL)

    code_event_types = [event["type"] for event in code_events]
    markdown_event_types = [event["type"] for event in markdown_events]
    code_composing_types = [event["type"] for event in code_composing_events]
    markdown_composing_types = [
        event["type"] for event in markdown_composing_events
    ]
    checks = {
        "foregroundWindow": ctypes.windll.user32.GetForegroundWindow() == hwnd,
        "codeText": "한글" in code_value,
        "codeCompositionLifecycle": (
            "compositionstart" in code_event_types
            and "compositionupdate" in code_event_types
            and "compositionend" in code_event_types
        ),
        "codeComposingArrowStayed": (
            "compositionstart" in code_composing_types
            and code_arrow_state["selectedIndex"] == code_index
            and code_arrow_state["focused"]
            and bool(code_arrow_value)
        ),
        "markdownText": "한글" in markdown_value,
        "markdownCompositionLifecycle": (
            "compositionstart" in markdown_event_types
            and "compositionupdate" in markdown_event_types
            and "compositionend" in markdown_event_types
        ),
        "markdownComposingArrowStayed": (
            "compositionstart" in markdown_composing_types
            and markdown_arrow_state["selectedIndex"] == markdown_index
            and markdown_arrow_state["focused"]
            and bool(markdown_arrow_value)
        ),
    }
    return {
        "inputMethod": "Windows Korean IME via native virtual-key input",
        "keyboardLayout": "Korean 2-set",
        "codeCellIndex": code_index,
        "codeValue": code_value,
        "codeEvents": code_events,
        "codeComposingArrowEvents": code_composing_events,
        "codeComposingArrowState": code_arrow_state,
        "markdownCellIndex": markdown_index,
        "markdownValue": markdown_value,
        "markdownEvents": markdown_events,
        "markdownComposingArrowEvents": markdown_composing_events,
        "markdownComposingArrowState": markdown_arrow_state,
        "checks": checks,
        "valid": all(checks.values()),
    }


def notebook_selected_cell_state(page: Page) -> dict[str, Any]:
    return page.evaluate(
        """
        () => {
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const selected = document.querySelector(
            '[data-notebook-cell-selected="true"]'
          );
          return {
            focused: Boolean(selected?.contains(document.activeElement)),
            selectedIndex: cells.indexOf(selected),
          };
        }
        """
    )


def notebook_accessibility_tree_state(
    page: Page,
    *,
    expected_cell_count: int,
) -> dict[str, Any]:
    session = page.context.new_cdp_session(page)
    try:
        payload = session.send("Accessibility.getFullAXTree")
    finally:
        session.detach()

    raw_nodes = payload.get("nodes", [])
    node_by_id = {
        node["nodeId"]: node
        for node in raw_nodes
        if isinstance(node.get("nodeId"), str)
    }
    roots = [
        node for node in raw_nodes
        if node.get("role", {}).get("value") == "RootWebArea"
    ]
    ordered_nodes: list[dict[str, Any]] = []
    visited: set[str] = set()

    def visit(node: dict[str, Any]) -> None:
        node_id = node.get("nodeId")
        if not isinstance(node_id, str) or node_id in visited:
            return
        visited.add(node_id)
        ordered_nodes.append(node)
        for child_id in node.get("childIds", []):
            child = node_by_id.get(child_id)
            if child is not None:
                visit(child)

    for root in roots:
        visit(root)
    for node in raw_nodes:
        visit(node)

    semantic_nodes: list[dict[str, Any]] = []
    for tree_index, node in enumerate(ordered_nodes):
        if node.get("ignored"):
            continue
        role = ax_value(node.get("role"))
        name = ax_value(node.get("name"))
        semantic_nodes.append({
            "treeIndex": tree_index,
            "role": role,
            "name": name,
        })

    cell_pattern = re.compile(r"(?:Python|Markdown|Automation).*셀 (\d+) / (\d+)")
    positioned_nodes: list[dict[str, Any]] = []
    for node in semantic_nodes:
        match = cell_pattern.search(node["name"])
        if not match:
            continue
        positioned_nodes.append({
            **node,
            "position": int(match.group(1)),
            "setSize": int(match.group(2)),
        })

    list_items = [
        node for node in positioned_nodes
        if node["role"] == "listitem"
    ]
    editors = [
        node for node in positioned_nodes
        if node["role"] in {"textbox", "TextField"}
    ]
    cell_actions = [
        node for node in positioned_nodes
        if node["role"] == "button"
    ]
    outputs = [
        node for node in positioned_nodes
        if node["role"] in {"alert", "status"}
    ]
    notebook_list = next(
        (
            node for node in semantic_nodes
            if node["role"] == "list" and node["name"] == "노트북 셀"
        ),
        None,
    )
    bottom_toolbar = next(
        (
            node for node in semantic_nodes
            if node["role"] == "toolbar" and node["name"] == "노트북 셀 추가"
        ),
        None,
    )
    expected_positions = list(range(1, expected_cell_count + 1))
    cell_positions = [node["position"] for node in list_items]
    editor_positions = [node["position"] for node in editors]
    output_positions = [node["position"] for node in outputs]
    output_order_valid = all(
        next(
            (
                editor["treeIndex"]
                for editor in editors
                if editor["position"] == output["position"]
            ),
            output["treeIndex"],
        )
        < output["treeIndex"]
        < min(
            (
                action["treeIndex"]
                for action in cell_actions
                if action["position"] == output["position"]
            ),
            default=output["treeIndex"],
        )
        for output in outputs
    )
    checks = {
        "notebookList": notebook_list is not None,
        "cellOrder": cell_positions == expected_positions,
        "cellSetSize": all(
            node["setSize"] == expected_cell_count for node in list_items
        ),
        "editorOrder": editor_positions == expected_positions,
        "executionOutput": bool(outputs),
        "executionOutputOrder": output_order_valid,
        "positionedCellActions": bool(cell_actions),
        "bottomControlAfterDocument": (
            bottom_toolbar is not None
            and bool(list_items)
            and bottom_toolbar["treeIndex"] > list_items[-1]["treeIndex"]
        ),
    }
    return {
        "source": "WebView2 Chromium Accessibility.getFullAXTree",
        "notebookList": notebook_list,
        "cellItems": list_items,
        "editors": editors,
        "executionOutputs": outputs,
        "executionOutputPositions": output_positions,
        "positionedActionCount": len(cell_actions),
        "bottomToolbar": bottom_toolbar,
        "checks": checks,
        "valid": all(checks.values()),
    }


def ax_value(value: Any) -> str:
    if isinstance(value, dict):
        raw = value.get("value")
        return raw if isinstance(raw, str) else str(raw or "")
    return value if isinstance(value, str) else ""


def notebook_accessible_name_state(page: Page) -> dict[str, Any]:
    return page.evaluate(
        """() => {
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const items = cells.map((cell) => {
            const position = cell.getAttribute('aria-posinset');
            const setSize = cell.getAttribute('aria-setsize');
            const positionLabel = `셀 ${position} / ${setSize}`;
            const content = cell.querySelector(
              "[data-notebook-input='code'] .cm-content, .notebookMarkdownEditor"
            );
            const menu = cell.querySelector('.notebookCellMoreTrigger');
            const run = cell.querySelector('.notebookCellRunButton');
            const output = cell.querySelector(
              ".notebookCellOutput [data-execution-output='true']"
            );
            return {
              contentLabel: content?.getAttribute('aria-label') || null,
              menuLabel: menu?.getAttribute('aria-label') || null,
              outputLabel: output?.getAttribute('aria-label') || null,
              outputText: output?.textContent || null,
              positionLabel,
              runLabel: run?.getAttribute('aria-label') || null,
            };
          });
          const outputs = items.filter((item) => item.outputLabel);
          return {
            items,
            outputCount: outputs.length,
            outputText: outputs.map((item) => item.outputText || "").join("\\n"),
            valid: outputs.length > 0 && items.every((item) => (
              item.contentLabel?.includes(item.positionLabel)
              && item.menuLabel?.includes(item.positionLabel)
              && (!item.runLabel || item.runLabel.includes(item.positionLabel))
              && (!item.outputLabel || item.outputLabel.includes(item.positionLabel))
            )),
          };
        }"""
    )


def notebook_navigation_viewport_state(page: Page) -> dict[str, Any]:
    return page.evaluate(
        """() => {
          const viewport = document.querySelector(
            '.notebookViewport [data-slot="scroll-area-viewport"]'
          );
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          if (!(viewport instanceof HTMLElement) || !(selected instanceof HTMLElement)) {
            throw new Error('notebook navigation target is missing');
          }
          const viewportRect = viewport.getBoundingClientRect();
          const selectedRect = selected.getBoundingClientRect();
          const visible = (element) => {
            if (!(element instanceof HTMLElement)) return false;
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return rect.width > 0
              && rect.height > 0
              && style.visibility !== 'hidden'
              && style.display !== 'none';
          };
          const controlOverlaps = [
            ...document.querySelectorAll('.notebookFloatingTools, .notebookWidthTools')
          ]
            .filter(visible)
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return Math.min(selectedRect.right, rect.right)
                  - Math.max(selectedRect.left, rect.left) > 1
                && Math.min(selectedRect.bottom, rect.bottom)
                  - Math.max(selectedRect.top, rect.top) > 1;
            })
            .map((element) => element.getAttribute('aria-label') || element.className);
          return {
            controlRects: [
              ...document.querySelectorAll('.notebookFloatingTools, .notebookWidthTools')
            ].filter(visible).map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                label: element.getAttribute('aria-label') || element.className,
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
              };
            }),
            selectedRect: {
              top: selectedRect.top,
              bottom: selectedRect.bottom,
              left: selectedRect.left,
              right: selectedRect.right,
            },
            selectedIndex: cells.indexOf(selected),
            selectedVisible: selectedRect.top < viewportRect.bottom
              && selectedRect.bottom > viewportRect.top,
            controlOverlaps,
            scrollTop: viewport.scrollTop,
          };
        }"""
    )


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


def verify_native_shell_keyboard_and_forced_colors(
    page: Page,
    *,
    hwnd: int,
    app_port: int,
) -> dict[str, Any]:
    case_id = "local-shell-keyboard-forced-colors-900x640"
    response = page.goto(
        f"http://127.0.0.1:{app_port}/?surface=home&runtime=local#home",
        wait_until="domcontentloaded",
        timeout=45_000,
    )
    if response is not None and response.status >= 400:
        raise VerificationError(f"{case_id} returned HTTP {response.status}")
    page.wait_for_selector(
        "[data-local-home-surface='true']",
        state="visible",
        timeout=45_000,
    )
    resize_native_client(
        hwnd,
        900,
        640,
        float(page.evaluate("window.devicePixelRatio")),
    )
    page.wait_for_timeout(250)

    page.evaluate(
        """
        () => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          document.body.tabIndex = -1;
          document.body.focus();
        }
        """
    )
    tab_order: list[dict[str, Any]] = []
    for _ in range(18):
        page.keyboard.press("Tab")
        focus = active_element_state(page)
        marker = (
            focus.get("ariaLabel")
            or focus.get("title")
            or focus.get("text")
            or focus.get("tag")
        )
        if marker and not any(item["marker"] == marker for item in tab_order):
            tab_order.append({"marker": marker, **focus})

    session = page.context.new_cdp_session(page)
    try:
        session.send(
            "Emulation.setEmulatedMedia",
            {
                "features": [
                    {"name": "forced-colors", "value": "active"},
                    {"name": "prefers-color-scheme", "value": "light"},
                ]
            },
        )
        page.wait_for_function(
            "() => matchMedia('(forced-colors: active)').matches",
            timeout=5_000,
        )
        support_control = page.locator("[data-social-link-id='support']").first
        support_control.focus()
        page.wait_for_timeout(100)
        forced_color_state = support_control.evaluate(
            """
            (element) => {
              const style = getComputedStyle(element);
              return {
                borderStyle: style.borderStyle,
                borderWidth: style.borderWidth,
                forcedColors: matchMedia('(forced-colors: active)').matches,
                outlineStyle: style.outlineStyle,
                outlineWidth: style.outlineWidth,
              };
            }
            """
        )
        screenshot_path = SCREENSHOT_ROOT / f"{case_id}.png"
        page.screenshot(path=str(screenshot_path))
    finally:
        session.send("Emulation.setEmulatedMedia", {"features": []})
        session.detach()

    markers = [item["marker"] for item in tab_order]
    required_focus_names = (
        "Codaro 홈으로 이동",
        "홈",
        "학습",
        "노트북",
        "자동화",
    )
    checks = {
        "keyboardOrderNamed": (
            len(tab_order) >= 8
            and all(item["visible"] and item["marker"] for item in tab_order)
        ),
        "primaryNavigationReached": all(
            any(required in marker for marker in markers)
            for required in required_focus_names
        ),
        "forcedColorsActive": forced_color_state["forcedColors"],
        "forcedColorBoundary": (
            forced_color_state["borderStyle"] not in {"", "none"}
            and forced_color_state["borderWidth"] != "0px"
        ),
        "forcedColorFocus": (
            forced_color_state["outlineStyle"] not in {"", "none"}
            and forced_color_state["outlineWidth"] != "0px"
        ),
    }
    failures = [
        f"{check} check failed"
        for check, passed in checks.items()
        if not passed
    ]
    return {
        "id": case_id,
        "surface": "home",
        "requestedCssViewport": {"width": 900, "height": 640},
        "keyboardTabOrder": tab_order,
        "forcedColors": forced_color_state,
        "screenshot": display_path(screenshot_path),
        "checks": checks,
        "passed": not failures,
        "failures": failures,
    }


def active_element_state(page: Page) -> dict[str, Any]:
    return page.evaluate(
        """
        () => {
          const element = document.activeElement;
          if (!(element instanceof HTMLElement)) {
            return {
              ariaLabel: '',
              tag: '',
              text: '',
              title: '',
              visible: false,
            };
          }
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            ariaLabel: element.getAttribute('aria-label') || '',
            tag: element.tagName.toLowerCase(),
            text: (element.innerText || element.textContent || '')
              .replace(/\\s+/g, ' ')
              .trim()
              .slice(0, 120),
            title: element.getAttribute('title') || '',
            visible: rect.width > 0
              && rect.height > 0
              && style.display !== 'none'
              && style.visibility !== 'hidden',
          };
        }
        """
    )


def capture_deployed_web_learning_archive(playwright: Any) -> dict[str, Any]:
    browser = playwright.chromium.launch(channel="msedge", headless=True)
    console_errors: list[str] = []
    try:
        context = browser.new_context(
            accept_downloads=True,
            color_scheme="dark",
            viewport={"width": 1440, "height": 900},
        )
        page = context.new_page()
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: console_errors.append(str(error)))
        lesson_url = (
            f"{DEPLOYED_WEB_URL}/learn/lesson/30days/"
            f"{quote('day01_헬로월드')}/"
        )
        response = page.goto(lesson_url, wait_until="domcontentloaded", timeout=45_000)
        if response is not None and response.status >= 400:
            raise VerificationError(f"deployed lesson returned HTTP {response.status}: {lesson_url}")
        lesson_surface = page.locator(
            "[data-learning-lesson-ref='30days/day01_헬로월드']"
        )
        page.wait_for_function(
            """() => Boolean(
              document.querySelector("[data-public-lesson='30days/day01_헬로월드']")
              || document.querySelector("[data-learning-lesson-ref='30days/day01_헬로월드']")
            )""",
            timeout=45_000,
        )
        if page.locator("[data-public-lesson='30days/day01_헬로월드']:visible").count():
            page.get_by_role("link", name="이 레슨 실행").click(timeout=20_000)
        lesson_surface.wait_for(state="visible", timeout=45_000)

        draft_source = "# deployed public roundtrip\nprint('Hello Codaro')\n"
        exercise = page.locator("[data-learning-section-part='exercise']").first
        exercise.locator(".cm-content").first.fill(draft_source, timeout=20_000)
        exercise.locator("button[aria-label='셀 실행']").first.click(timeout=20_000)
        exercise.locator("[data-learning-check-result='verified']").wait_for(
            state="visible",
            timeout=120_000,
        )
        exercise.locator("[data-learning-evidence-state='stored']").wait_for(
            state="visible",
            timeout=20_000,
        )

        page.locator("[data-product-brand='escape']:visible").click(timeout=20_000)
        page.wait_for_function(
            """() => new URL(window.location.href).searchParams.get("surface") !== "curriculum" """,
            timeout=20_000,
        )
        page.locator("[data-product-surface-view='editor']:visible").wait_for(
            state="visible",
            timeout=20_000,
        )
        learning_data = open_learning_data_settings(page)
        with page.expect_download(timeout=20_000) as download_info:
            learning_archive_export_control(learning_data).click()
        download = download_info.value
        download.save_as(str(DEPLOYED_WEB_ARCHIVE_PATH))
        if not DEPLOYED_WEB_ARCHIVE_PATH.is_file():
            raise VerificationError("deployed Web learning archive download was not saved")

        from codaro.curriculum.learningArchive import materializeLearningArchive

        archive = json.loads(DEPLOYED_WEB_ARCHIVE_PATH.read_text(encoding="utf-8"))
        materialized = materializeLearningArchive(archive)
        lineage = archive.get("lineage", [])
        lesson_ref = lineage[0].get("lessonRef") if lineage and isinstance(lineage[0], dict) else None
        root_hash = archive.get("manifest", {}).get("rootHash")
        if lesson_ref != "30days/day01_헬로월드" or not isinstance(root_hash, str):
            raise VerificationError("deployed Web archive identity is invalid")
        if draft_source not in materialized.drafts.values():
            raise VerificationError("deployed Web archive did not preserve the edited exercise draft")
        evidence_events = materialized.evidenceArchive.get("events", [])
        if not any(
            isinstance(event, dict)
            and event.get("kind") == "StrongCheckVerified"
            and event.get("runtimeTier") == "web"
            for event in evidence_events
        ):
            raise VerificationError("deployed Web archive has no stored Web strong-check evidence")
        screenshot_path = SCREENSHOT_ROOT / "deployed-web-learning-export.png"
        page.screenshot(path=str(screenshot_path))
        if console_errors:
            raise VerificationError(f"deployed Web console errors: {console_errors}")
        return {
            "archivePath": display_path(DEPLOYED_WEB_ARCHIVE_PATH),
            "draftSource": draft_source,
            "evidenceEvents": len(evidence_events),
            "lessonRef": lesson_ref,
            "productUrl": page.url,
            "rootHash": root_hash,
            "screenshot": display_path(screenshot_path),
            "sourceUrl": lesson_url,
        }
    finally:
        browser.close()


def verify_web_to_local_roundtrip(
    page: Page,
    *,
    hwnd: int,
    app_port: int,
) -> dict[str, Any]:
    archive = build_web_origin_learning_archive(app_port)
    lesson_ref = archive["lessonRef"]
    draft_source = archive["draftSource"]
    draft_id = archive["automationDraftId"]
    root_hash = archive["rootHash"]
    url = (
        f"http://127.0.0.1:{app_port}/?surface=curriculum"
        f"&category=30days&lesson={quote('day01_헬로월드')}&runtime=local#curriculum"
    )
    response = page.goto(url, wait_until="domcontentloaded", timeout=45_000)
    if response is not None and response.status >= 400:
        raise VerificationError(f"local-learning-web-archive-roundtrip returned HTTP {response.status}")
    page.wait_for_selector(
        f"[data-learning-lesson-ref='{lesson_ref}']",
        state="visible",
        timeout=45_000,
    )
    dpr = float(page.evaluate("window.devicePixelRatio"))
    resize_native_client(hwnd, 1024, 768, dpr)
    page.locator("[data-product-brand='escape']:visible").click()
    page.wait_for_selector("[data-local-home-surface='true']", state="visible", timeout=20_000)
    learning_data = open_learning_data_settings(page)
    learning_data.locator("[data-learning-archive-import-input='true']").set_input_files(
        str(WEB_ARCHIVE_PATH)
    )
    page.wait_for_selector(
        f"[data-learning-lesson-ref='{lesson_ref}']",
        state="visible",
        timeout=45_000,
    )
    wait_for_editor_source(page, draft_source)
    imported = page.evaluate(
        """async () => {
          const [archiveResponse, evidenceResponse] = await Promise.all([
            fetch("/api/curriculum/learning-archive/current"),
            fetch("/api/curriculum/evidence/summary"),
          ]);
          if (!archiveResponse.ok || !evidenceResponse.ok) {
            throw new Error(`archive APIs failed: ${archiveResponse.status}/${evidenceResponse.status}`);
          }
          const archive = await archiveResponse.json();
          const evidence = await evidenceResponse.json();
          return {
            archiveId: archive?.manifest?.archiveId ?? null,
            rootHash: archive?.manifest?.rootHash ?? null,
            runtimeTier: archive?.manifest?.runtimeTier ?? null,
            evidenceEvents: evidence?.events ?? null,
            evidenceConflicts: evidence?.conflicts ?? null,
          };
        }"""
    )
    page.reload(wait_until="domcontentloaded", timeout=45_000)
    page.wait_for_selector(
        f"[data-learning-lesson-ref='{lesson_ref}']",
        state="visible",
        timeout=45_000,
    )
    wait_for_editor_source(page, draft_source)
    draft_restored_after_reload = page.evaluate(
        r"""expected => {
          const normalized = expected.replace(/\s+/g, "");
          return [...document.querySelectorAll(".cm-content")]
            .some((editor) => (editor.textContent ?? "").replace(/\s+/g, "").includes(normalized));
        }""",
        draft_source,
    )
    page.locator("[data-product-brand='escape']:visible").click()
    page.wait_for_selector("[data-local-home-surface='true']", state="visible", timeout=20_000)
    learning_data = open_learning_data_settings(page)
    learning_data.locator("[data-learning-automation-drafts='true']").wait_for(
        state="visible",
        timeout=20_000,
    )
    learning_data.get_by_role("button", name="자동화로 옮기기").click()
    learning_data.get_by_text("작업 메뉴에 추가됨", exact=True).wait_for(timeout=20_000)
    task_snapshot = page.evaluate(
        """async (draftId) => {
          const response = await fetch("/api/tasks");
          if (!response.ok) throw new Error(`task list failed: ${response.status}`);
          const payload = await response.json();
          const task = (payload.tasks || []).find((item) => item?.inputs?.sourceDraftId === draftId);
          return task ? {
            documentPath: task.documentPath ?? null,
            enabled: task.enabled,
            schedule: task.schedule ?? null,
            sourceDraftId: task.inputs?.sourceDraftId ?? null,
          } : null;
        }""",
        draft_id,
    )
    with page.expect_download(timeout=20_000) as download_info:
        learning_archive_export_control(learning_data).click()
    download_path = download_info.value.path()
    if download_path is None:
        raise VerificationError("installed Local learning archive re-export has no path")
    reexported = json.loads(Path(download_path).read_text(encoding="utf-8"))
    from codaro.curriculum.learningArchive import materializeLearningArchive

    source_materialized = materializeLearningArchive(WEB_ARCHIVE_PATH.read_text(encoding="utf-8"))
    reexport_materialized = materializeLearningArchive(reexported)
    portable_payload = (
        source_materialized.document == reexport_materialized.document
        and source_materialized.drafts == reexport_materialized.drafts
        and source_materialized.virtualDirectories == reexport_materialized.virtualDirectories
        and source_materialized.virtualFiles == reexport_materialized.virtualFiles
        and source_materialized.packages == reexport_materialized.packages
        and source_materialized.automationDrafts == reexport_materialized.automationDrafts
        and source_materialized.evidenceArchive.get("events")
        == reexport_materialized.evidenceArchive.get("events")
    )
    screenshot_path = SCREENSHOT_ROOT / "local-learning-web-archive-roundtrip.png"
    page.screenshot(path=str(screenshot_path))
    task_document = (
        (WORKSPACE_ROOT / str(task_snapshot.get("documentPath", ""))).resolve()
        if isinstance(task_snapshot, dict)
        else None
    )
    task_document_inside_workspace = False
    if task_document is not None:
        try:
            task_document.relative_to(WORKSPACE_ROOT.resolve())
            task_document_inside_workspace = task_document.is_file()
        except ValueError:
            task_document_inside_workspace = False
    snapshot = {
        "lessonRef": lesson_ref,
        "draftRestoredAfterReload": draft_restored_after_reload,
        "imported": imported,
        "task": task_snapshot,
        "taskDocumentInsideWorkspace": task_document_inside_workspace,
        "reexportRootHash": reexported.get("manifest", {}).get("rootHash"),
        "reexportRuntimeTier": reexported.get("manifest", {}).get("runtimeTier"),
        "portablePayload": portable_payload,
        "productHome": display_path(PRODUCT_HOME),
        "productHomeExists": PRODUCT_HOME.is_dir(),
    }
    checks = {
        "isolatedProductHome": PRODUCT_HOME.is_dir(),
        "archiveCommitted": imported.get("rootHash") == root_hash,
        "webRuntimeIdentity": imported.get("runtimeTier") == "web",
        "evidenceImported": imported.get("evidenceEvents") == 1 and imported.get("evidenceConflicts") == 0,
        "draftReload": bool(snapshot["draftRestoredAfterReload"]),
        "automationDraftAdopted": isinstance(task_snapshot, dict)
        and task_snapshot.get("sourceDraftId") == draft_id,
        "automationDisabled": isinstance(task_snapshot, dict)
        and task_snapshot.get("enabled") is False
        and task_snapshot.get("schedule") is None,
        "automationWorkspaceBoundary": task_document_inside_workspace,
        "portableReexport": snapshot["portablePayload"]
        and snapshot["reexportRuntimeTier"] == "web",
    }
    failures = [f"{check} check failed" for check, passed in checks.items() if not passed]
    return {
        "id": "local-learning-web-archive-roundtrip",
        "surface": "curriculum",
        "snapshot": snapshot,
        "screenshot": display_path(screenshot_path),
        "checks": checks,
        "passed": not failures,
        "failures": failures,
    }


def verify_deployed_web_to_local_roundtrip(
    page: Page,
    *,
    hwnd: int,
    app_port: int,
    deployed_archive: dict[str, Any],
) -> dict[str, Any]:
    from codaro.curriculum.learningArchive import materializeLearningArchive

    source_archive = json.loads(DEPLOYED_WEB_ARCHIVE_PATH.read_text(encoding="utf-8"))
    source_materialized = materializeLearningArchive(source_archive)
    lesson_ref = str(deployed_archive["lessonRef"])
    draft_source = str(deployed_archive["draftSource"])
    root_hash = str(deployed_archive["rootHash"])
    category, content_id = lesson_ref.split("/", 1)
    url = (
        f"http://127.0.0.1:{app_port}/?surface=curriculum"
        f"&category={quote(category)}&lesson={quote(content_id)}&runtime=local#curriculum"
    )
    response = page.goto(url, wait_until="domcontentloaded", timeout=45_000)
    if response is not None and response.status >= 400:
        raise VerificationError(f"deployed-web-to-local-roundtrip returned HTTP {response.status}")
    page.wait_for_selector(
        f"[data-learning-lesson-ref='{lesson_ref}']",
        state="visible",
        timeout=45_000,
    )
    dpr = float(page.evaluate("window.devicePixelRatio"))
    resize_native_client(hwnd, 1024, 768, dpr)
    page.locator("[data-product-brand='escape']:visible").click()
    page.wait_for_selector("[data-local-home-surface='true']", state="visible", timeout=20_000)
    learning_data = open_learning_data_settings(page)
    learning_data.locator("[data-learning-archive-import-input='true']").set_input_files(
        str(DEPLOYED_WEB_ARCHIVE_PATH)
    )
    page.wait_for_selector(
        f"[data-learning-lesson-ref='{lesson_ref}']",
        state="visible",
        timeout=45_000,
    )
    wait_for_editor_source(page, draft_source)
    imported = page.evaluate(
        """async () => {
          const [archiveResponse, evidenceResponse] = await Promise.all([
            fetch("/api/curriculum/learning-archive/current"),
            fetch("/api/curriculum/evidence/archive"),
          ]);
          if (!archiveResponse.ok || !evidenceResponse.ok) {
            throw new Error(`archive APIs failed: ${archiveResponse.status}/${evidenceResponse.status}`);
          }
          const archive = await archiveResponse.json();
          const evidence = await evidenceResponse.json();
          return {
            rootHash: archive?.manifest?.rootHash ?? null,
            runtimeTier: archive?.manifest?.runtimeTier ?? null,
            evidenceEvents: evidence?.events ?? [],
          };
        }"""
    )
    page.reload(wait_until="domcontentloaded", timeout=45_000)
    page.wait_for_selector(
        f"[data-learning-lesson-ref='{lesson_ref}']",
        state="visible",
        timeout=45_000,
    )
    wait_for_editor_source(page, draft_source)
    draft_restored_after_reload = page.evaluate(
        r"""expected => {
          const normalized = expected.replace(/\s+/g, "");
          return [...document.querySelectorAll(".cm-content")]
            .some((editor) => (editor.textContent ?? "").replace(/\s+/g, "").includes(normalized));
        }""",
        draft_source,
    )
    page.locator("[data-product-brand='escape']:visible").click()
    page.wait_for_selector("[data-local-home-surface='true']", state="visible", timeout=20_000)
    learning_data = open_learning_data_settings(page)
    with page.expect_download(timeout=20_000) as download_info:
        learning_archive_export_control(learning_data).click()
    download_path = download_info.value.path()
    if download_path is None:
        raise VerificationError("deployed Web archive Local re-export has no path")
    shutil.copy2(download_path, DEPLOYED_LOCAL_REEXPORT_PATH)
    reexported = json.loads(DEPLOYED_LOCAL_REEXPORT_PATH.read_text(encoding="utf-8"))
    reexport_materialized = materializeLearningArchive(reexported)
    source_events = {
        str(event.get("eventId")): event
        for event in source_materialized.evidenceArchive.get("events", [])
        if isinstance(event, dict) and event.get("eventId")
    }
    reexport_events = {
        str(event.get("eventId")): event
        for event in reexport_materialized.evidenceArchive.get("events", [])
        if isinstance(event, dict) and event.get("eventId")
    }
    source_evidence_preserved = all(
        reexport_events.get(event_id) == event
        for event_id, event in source_events.items()
    )
    portable_payload = (
        source_materialized.document == reexport_materialized.document
        and source_materialized.drafts == reexport_materialized.drafts
        and source_materialized.virtualDirectories == reexport_materialized.virtualDirectories
        and source_materialized.virtualFiles == reexport_materialized.virtualFiles
        and source_materialized.packages == reexport_materialized.packages
        and source_materialized.automationDrafts == reexport_materialized.automationDrafts
        and source_evidence_preserved
    )
    screenshot_path = SCREENSHOT_ROOT / "deployed-web-to-local-learning-roundtrip.png"
    page.screenshot(path=str(screenshot_path))
    imported_events = {
        str(event.get("eventId")): event
        for event in imported.get("evidenceEvents", [])
        if isinstance(event, dict) and event.get("eventId")
    }
    snapshot = {
        "archivePath": deployed_archive["archivePath"],
        "draftRestoredAfterReload": draft_restored_after_reload,
        "importedRootHash": imported.get("rootHash"),
        "importedRuntimeTier": imported.get("runtimeTier"),
        "lessonRef": lesson_ref,
        "portablePayload": portable_payload,
        "publicEvidenceEvents": len(source_events),
        "publicProductUrl": deployed_archive["productUrl"],
        "publicScreenshot": deployed_archive["screenshot"],
        "publicSourceUrl": deployed_archive["sourceUrl"],
        "reexportEvidenceEvents": len(reexport_events),
        "reexportPath": display_path(DEPLOYED_LOCAL_REEXPORT_PATH),
        "reexportRuntimeTier": reexported.get("manifest", {}).get("runtimeTier"),
    }
    checks = {
        "deployedArchiveSaved": DEPLOYED_WEB_ARCHIVE_PATH.is_file(),
        "archiveCommitted": imported.get("rootHash") == root_hash,
        "webRuntimeIdentity": imported.get("runtimeTier") == "web",
        "publicEvidenceImported": all(
            imported_events.get(event_id) == event
            for event_id, event in source_events.items()
        ),
        "draftReload": bool(draft_restored_after_reload),
        "portableReexport": portable_payload
        and reexported.get("manifest", {}).get("runtimeTier") == "web",
    }
    failures = [f"{check} check failed" for check, passed in checks.items() if not passed]
    return {
        "id": "deployed-web-to-local-learning-roundtrip",
        "surface": "curriculum",
        "snapshot": snapshot,
        "screenshot": display_path(screenshot_path),
        "checks": checks,
        "passed": not failures,
        "failures": failures,
    }


def verify_local_reexport_to_deployed_web_roundtrip(
    playwright: Any,
    *,
    deployed_archive: dict[str, Any],
) -> dict[str, Any]:
    from codaro.curriculum.learningArchive import materializeLearningArchive

    if not DEPLOYED_LOCAL_REEXPORT_PATH.is_file():
        raise VerificationError("installed Local re-export was not saved for the public Web return trip")
    source_archive = json.loads(DEPLOYED_LOCAL_REEXPORT_PATH.read_text(encoding="utf-8"))
    source_materialized = materializeLearningArchive(source_archive)
    lesson_ref = str(deployed_archive["lessonRef"])
    draft_source = str(deployed_archive["draftSource"])
    browser = playwright.chromium.launch(channel="msedge", headless=True)
    console_errors: list[str] = []
    try:
        context = browser.new_context(
            accept_downloads=True,
            color_scheme="light",
            viewport={"width": 1440, "height": 900},
        )
        page = context.new_page()
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: console_errors.append(str(error)))
        lesson_url = str(deployed_archive["sourceUrl"])
        response = page.goto(lesson_url, wait_until="domcontentloaded", timeout=45_000)
        if response is not None and response.status >= 400:
            raise VerificationError(f"public Web return lesson returned HTTP {response.status}: {lesson_url}")
        page.wait_for_function(
            """lessonRef => Boolean(
              document.querySelector(`[data-public-lesson="${lessonRef}"]`)
              || document.querySelector(`[data-learning-lesson-ref="${lessonRef}"]`)
            )""",
            arg=lesson_ref,
            timeout=45_000,
        )
        if page.locator(f"[data-public-lesson='{lesson_ref}']:visible").count():
            page.get_by_role("link", name="이 레슨 실행").click(timeout=20_000)
        page.locator(f"[data-learning-lesson-ref='{lesson_ref}']").wait_for(
            state="visible",
            timeout=45_000,
        )
        page.locator("[data-product-brand='escape']:visible").click(timeout=20_000)
        page.wait_for_function(
            """() => new URL(window.location.href).searchParams.get("surface") !== "curriculum" """,
            timeout=20_000,
        )
        page.locator("[data-product-surface-view='editor']:visible").wait_for(
            state="visible",
            timeout=20_000,
        )
        learning_data = open_learning_data_settings(page)
        learning_data.locator("[data-learning-archive-import-input='true']").set_input_files(
            str(DEPLOYED_LOCAL_REEXPORT_PATH)
        )
        page.wait_for_selector(
            f"[data-learning-lesson-ref='{lesson_ref}']",
            state="visible",
            timeout=45_000,
        )
        wait_for_editor_source(page, draft_source)
        page.reload(wait_until="domcontentloaded", timeout=45_000)
        page.wait_for_selector(
            f"[data-learning-lesson-ref='{lesson_ref}']",
            state="visible",
            timeout=45_000,
        )
        wait_for_editor_source(page, draft_source)

        page.locator("[data-product-brand='escape']:visible").click(timeout=20_000)
        page.locator("[data-product-surface-view='editor']:visible").wait_for(
            state="visible",
            timeout=20_000,
        )
        learning_data = open_learning_data_settings(page)
        workspace_summary = learning_data.locator("[data-learning-archive-workspace-summary='true']")
        workspace_summary.wait_for(state="visible", timeout=20_000)
        with page.expect_download(timeout=20_000) as download_info:
            learning_archive_export_control(learning_data).click()
        download_path = download_info.value.path()
        if download_path is None:
            raise VerificationError("public Web return-trip archive export has no path")
        returned_archive = json.loads(Path(download_path).read_text(encoding="utf-8"))
        returned_materialized = materializeLearningArchive(returned_archive)
        source_events = {
            str(event.get("eventId")): event
            for event in source_materialized.evidenceArchive.get("events", [])
            if isinstance(event, dict) and event.get("eventId")
        }
        returned_events = {
            str(event.get("eventId")): event
            for event in returned_materialized.evidenceArchive.get("events", [])
            if isinstance(event, dict) and event.get("eventId")
        }
        portable_payload = (
            source_materialized.document == returned_materialized.document
            and source_materialized.drafts == returned_materialized.drafts
            and source_materialized.virtualDirectories == returned_materialized.virtualDirectories
            and source_materialized.virtualFiles == returned_materialized.virtualFiles
            and source_materialized.packages == returned_materialized.packages
            and source_materialized.automationDrafts == returned_materialized.automationDrafts
            and all(returned_events.get(event_id) == event for event_id, event in source_events.items())
        )
        summary_text = workspace_summary.inner_text()
        screenshot_path = SCREENSHOT_ROOT / "deployed-local-reexport-to-web-learning-roundtrip.png"
        page.screenshot(path=str(screenshot_path))
        checks = {
            "draftReload": draft_source in returned_materialized.drafts.values(),
            "portablePayload": portable_payload,
            "runtimeIdentity": returned_archive.get("manifest", {}).get("runtimeTier") == "web",
            "workspaceSummary": "원본" in summary_text and "Web" in summary_text,
            "consoleClean": not console_errors,
        }
        failures = [f"{check} check failed" for check, passed in checks.items() if not passed]
        return {
            "id": "deployed-local-reexport-to-web-learning-roundtrip",
            "surface": "curriculum",
            "snapshot": {
                "lessonRef": lesson_ref,
                "portablePayload": portable_payload,
                "returnedEvidenceEvents": len(returned_events),
                "returnedRuntimeTier": returned_archive.get("manifest", {}).get("runtimeTier"),
                "sourceEvidenceEvents": len(source_events),
                "sourcePath": display_path(DEPLOYED_LOCAL_REEXPORT_PATH),
                "workspaceSummary": summary_text,
            },
            "screenshot": display_path(screenshot_path),
            "checks": checks,
            "passed": not failures,
            "failures": failures,
        }
    finally:
        browser.close()


def build_web_origin_learning_archive(app_port: int) -> dict[str, str]:
    from codaro.curriculum.evidenceArchive import (
        buildLearningEvidenceArchive,
        digestText,
        sealEvidenceEvent,
    )
    from codaro.curriculum.learningArchive import (
        LearningArchiveAutomationDraftInput,
        LearningArchivePackage,
        LearningArchiveVirtualFile,
        buildLearningArchive,
        serializeLearningArchive,
    )

    lesson_ref = "30days/day01_헬로월드"
    content_url = (
        f"http://127.0.0.1:{app_port}/api/curriculum/content/30days/"
        f"{quote('day01_헬로월드')}"
    )
    content = wait_for_json(content_url, timeout_seconds=30)
    document = content.get("document")
    if not isinstance(document, dict) or not isinstance(document.get("blocks"), list):
        raise VerificationError("installed Local lesson API returned no document")
    block = next(
        (
            item
            for item in document["blocks"]
            if isinstance(item, dict)
            and item.get("type") in {"automation", "code"}
            and isinstance(item.get("id"), str)
            and (
                item.get("role") == "exercise"
                or item.get("sourceType") == "sectionContract:exercise"
            )
        ),
        None,
    )
    if block is None:
        raise VerificationError("installed Local lesson has no executable archive block")
    block_id = str(block["id"])
    draft_source = "print('Web에서 만든 학습 작업을 Local에서 복원했습니다')\n"
    attempt_fingerprint = digestText("installed-web-to-local-roundtrip")
    event = sealEvidenceEvent({
        "attemptFingerprint": attempt_fingerprint,
        "blockId": block_id,
        "checkId": "lesson:30days/day01_헬로월드:installed-roundtrip:v1",
        "eventId": f"web-strong:{attempt_fingerprint}",
        "executionCount": 1,
        "expectedHash": digestText("Web to Local\n"),
        "fixtureHash": digestText("installed-web-to-local-fixture"),
        "kind": "StrongCheckVerified",
        "lessonRef": lesson_ref,
        "occurredAt": "2026-07-27T00:00:00+00:00",
        "resultHash": digestText("Web to Local\n"),
        "runtimeTier": "web",
        "schemaVersion": 1,
        "sourceHash": digestText(draft_source),
        "strength": "strong",
    })
    archive = buildLearningArchive(
        document=document,
        drafts={block_id: draft_source},
        evidenceArchive=buildLearningEvidenceArchive([event]),
        lessonRef=lesson_ref,
        virtualDirectories=("workspace",),
        virtualFiles=(
            LearningArchiveVirtualFile(
                path="workspace/web-learning-note.txt",
                payload=b"installed Web-to-Local roundtrip\n",
                mediaType="text/plain",
            ),
        ),
        packages=(
            LearningArchivePackage(
                name="portable-demo",
                version="1.0.0",
                path="packages/portable_demo-1.0.0-py3-none-any.whl",
                payload=b"PK\x03\x04installed-roundtrip-wheel",
            ),
        ),
        automationDrafts=(
            LearningArchiveAutomationDraftInput(
                name="Web 학습 작업 초안",
                description="Local에서 확인 뒤 직접 활성화하는 설치본 검증 초안",
                recipe="DRY_RUN = True\nprint('installed roundtrip')\n",
                sourceBlockIds=(block_id,),
            ),
        ),
        createdAt="2026-07-27T00:01:00+00:00",
    )
    WEB_ARCHIVE_PATH.write_text(serializeLearningArchive(archive), encoding="utf-8")
    return {
        "automationDraftId": str(archive["automationDrafts"][0]["draftId"]),
        "draftSource": draft_source,
        "lessonRef": lesson_ref,
        "rootHash": str(archive["manifest"]["rootHash"]),
    }


def open_learning_data_settings(page: Page) -> Any:
    settings = page.locator("[data-product-appearance-settings='true']:visible")
    if not settings.count():
        sidebar_trigger = page.locator("[data-sidebar='trigger']:visible").first
        sidebar_trigger.wait_for(state="visible", timeout=20_000)
        sidebar_trigger.click()
        settings = page.locator("[data-product-appearance-settings='true']:visible")
    settings.wait_for(state="visible", timeout=20_000)
    learning_data = page.locator("[data-product-learning-data-settings='true']:visible")
    for attempt in range(3):
        settings.click()
        opened_stably = page.evaluate(
            """async () => {
              const trigger = document.querySelector(
                "[data-product-appearance-settings='true'][aria-expanded='true']",
              );
              if (!(trigger instanceof HTMLElement)) return false;
              for (let frame = 0; frame < 12; frame += 1) {
                await new Promise(requestAnimationFrame);
                if (
                  !trigger.isConnected
                  || trigger.getAttribute("aria-expanded") !== "true"
                  || !document.querySelector("[data-product-learning-data-settings='true']")
                ) return false;
              }
              return true;
            }"""
        )
        if opened_stably:
            break
        if attempt == 2:
            raise VerificationError("product settings did not remain open after the surface transition")
        settings = page.locator("[data-product-appearance-settings='true']:visible")
        settings.wait_for(state="visible", timeout=20_000)
    learning_data.wait_for(state="visible", timeout=20_000)
    menu = learning_data.locator("[data-learning-archive-menu='true']")
    if menu.get_attribute("open") is None:
        menu.locator("summary").click()
    learning_data.locator("[data-learning-archive-summary='true']").wait_for(
        state="visible",
        timeout=20_000,
    )
    return learning_data


def learning_archive_export_control(learning_data: Any) -> Any:
    return learning_data.locator(
        "[data-learning-archive-export='true'], "
        "button[aria-label^='학습 작업 내보내기']"
    )


def wait_for_editor_source(page: Page, expected: str) -> None:
    try:
        page.wait_for_function(
            r"""expected => {
              const normalized = expected.replace(/\s+/g, "");
              return [...document.querySelectorAll(".cm-content")]
                .some((editor) => (editor.textContent ?? "").replace(/\s+/g, "").includes(normalized));
            }""",
            arg=expected,
            timeout=30_000,
        )
    except Exception as error:
        state = page.evaluate(
            """() => ({
              activeSurface: document.querySelector("[data-active-product-surface]")
                ?.getAttribute("data-active-product-surface") ?? null,
              archiveError: document.querySelector("[data-learning-archive-error]")?.textContent ?? null,
              editors: [...document.querySelectorAll(".cm-content")]
                .map((editor) => editor.textContent?.slice(0, 240) ?? ""),
              lessonRef: document.querySelector("[data-learning-lesson-ref]")
                ?.getAttribute("data-learning-lesson-ref") ?? null,
              referenceLoading: document.querySelector("[data-learning-reference-loading]")
                ?.getAttribute("data-learning-reference-loading") ?? null,
              url: window.location.href,
            })"""
        )
        raise VerificationError(f"imported learning draft did not render: {state}") from error


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


def activate_native_window(hwnd: int) -> None:
    user32 = ctypes.windll.user32
    kernel32 = ctypes.windll.kernel32
    target_pid = wintypes.DWORD()
    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(target_pid))
    user32.ShowWindow(hwnd, 5)
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        foreground = user32.GetForegroundWindow()
        foreground_thread = (
            user32.GetWindowThreadProcessId(foreground, None)
            if foreground
            else 0
        )
        current_thread = kernel32.GetCurrentThreadId()
        attached = bool(
            foreground_thread
            and foreground_thread != current_thread
            and user32.AttachThreadInput(current_thread, foreground_thread, True)
        )
        user32.BringWindowToTop(hwnd)
        user32.SetForegroundWindow(hwnd)
        user32.SetActiveWindow(hwnd)
        user32.SetFocus(hwnd)
        if attached:
            user32.AttachThreadInput(current_thread, foreground_thread, False)
        active_hwnd = user32.GetForegroundWindow()
        active_pid = wintypes.DWORD()
        if active_hwnd:
            user32.GetWindowThreadProcessId(active_hwnd, ctypes.byref(active_pid))
        if active_hwnd == hwnd or user32.GetAncestor(active_hwnd, 2) == hwnd or (
            target_pid.value != 0 and active_pid.value == target_pid.value
        ):
            return
        time.sleep(0.1)
    raise VerificationError(
        f"native launcher window {hwnd} (pid={target_pid.value}) did not become foreground"
    )


def native_key_tap(virtual_key: int) -> None:
    user32 = ctypes.windll.user32
    user32.keybd_event(virtual_key, 0, 0, 0)
    time.sleep(0.035)
    user32.keybd_event(virtual_key, 0, KEYEVENTF_KEYUP, 0)
    time.sleep(0.06)


def windows_session_evidence() -> dict[str, Any]:
    kernel32 = ctypes.windll.kernel32
    user32 = ctypes.windll.user32
    session_id = wintypes.DWORD()
    success = kernel32.ProcessIdToSessionId(os.getpid(), ctypes.byref(session_id))
    foreground_window = int(user32.GetForegroundWindow())
    shell_window = int(user32.GetShellWindow())
    return {
        "sessionId": int(session_id.value) if success else None,
        "sessionName": os.environ.get("SESSIONNAME"),
        "foregroundWindowPresent": foreground_window != 0,
        "shellWindowPresent": shell_window != 0,
        "interactive": bool(
            success
            and session_id.value > 0
            and foreground_window != 0
            and shell_window != 0
        ),
    }


def runtime_evidence(
    cdp_version: dict[str, Any],
    hwnd: int,
    pid: int,
    *,
    runtime_lock: dict[str, Any] | None,
) -> dict[str, Any]:
    windows_version = sys.getwindowsversion()
    browser = str(cdp_version.get("Browser") or "")
    evidence = {
        "platform": platform.platform(),
        "windowsBuild": windows_version.build,
        "windowsVersion": f"{windows_version.major}.{windows_version.minor}.{windows_version.build}",
        "session": windows_session_evidence(),
        "launcherPid": pid,
        "nativeWindowHandle": hwnd,
        "distributionMode": "fixed" if runtime_lock is not None else "evergreen",
        "browser": browser,
        "userAgent": cdp_version.get("User-Agent"),
        "protocolVersion": cdp_version.get("Protocol-Version"),
        "webSocketDebuggerUrlPresent": bool(cdp_version.get("webSocketDebuggerUrl")),
    }
    if runtime_lock is not None:
        expected_version = str(runtime_lock["version"])
        executable = runtimeExecutable(runtime_lock)
        evidence["fixedVersion"] = {
            "expectedVersion": expected_version,
            "browserVersionMatches": browser == f"Edg/{expected_version}",
            "browserExecutableFolder": display_path(runtimeInstallRoot(runtime_lock)),
            "browserExecutable": display_path(executable),
            "executableSha256": hashlib.sha256(executable.read_bytes()).hexdigest(),
            "lockSha256": runtimeLockSha256(),
        }
    return evidence


def assert_runtime_profile(
    runtime: dict[str, Any],
    runtime_lock: dict[str, Any] | None,
) -> None:
    if runtime_lock is None:
        if runtime.get("distributionMode") != "evergreen":
            raise VerificationError("Evergreen WebView2 runtime profile was not preserved")
        return
    fixed = runtime.get("fixedVersion")
    if not isinstance(fixed, dict) or fixed.get("browserVersionMatches") is not True:
        raise VerificationError(
            "native launcher did not use the locked WebView2 Fixed Version runtime: "
            f"runtime={runtime}"
        )


def runtime_install_evidence(runtime_lock: dict[str, Any] | None) -> dict[str, Any]:
    if runtime_lock is None:
        return {"distributionMode": "evergreen"}
    try:
        return verifyInstalledRuntime(runtime_lock)
    except RuntimeLockError as exc:
        return {
            "distributionMode": "fixed",
            "status": "failed",
            "failure": str(exc),
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
