from __future__ import annotations

import base64
import ctypes
import hashlib
import json
import platform
import re
from pathlib import Path
import statistics
import time
from typing import Any

from playwright.sync_api import sync_playwright


BROWSER_ENGINES = ("chromium", "firefox", "webkit")
PROBE_ITERATIONS = 5
SUPPORTED_WINDOWS_MIN_BUILD = 19045
REQUIRED_NATIVE_GATES = ("launcher-test", "product-browser-webview2-fixed")
FRAME_BOOTSTRAP = r'''(async () => {
  const result = {
    counter: (globalThis.__codaroProbeCounter = (globalThis.__codaroProbeCounter || 0) + 1),
    openerNull: window.opener === null,
  };
  try {
    localStorage.setItem("codaro-probe", "1");
    result.storageBlocked = false;
  } catch (error) {
    result.storageBlocked = error?.name === "SecurityError";
  }
  try {
    await fetch("https://example.invalid/codaro-probe", { mode: "no-cors" });
    result.networkBlocked = false;
  } catch {
    result.networkBlocked = true;
  }
  try {
    top.location.href = "https://example.invalid/codaro-top";
  } catch {}
  result.moduleWorker = await new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob(["postMessage('ready')"], { type: "text/javascript" }));
    const worker = new Worker(url, { type: "module" });
    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(false);
    }, 1500);
    worker.onmessage = () => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(true);
    };
    worker.onerror = () => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(false);
    };
  });
  try {
    await WebAssembly.compile(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]));
    result.wasm = true;
  } catch {
    result.wasm = false;
  }
  parent.postMessage({ type: "codaro-check-sandbox-probe", result }, "*");
})();'''
HOST_PROBE = r'''async (srcdoc) => {
  const before = location.href;
  const message = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("opaque frame probe timeout")), 5000);
    addEventListener("message", function listener(event) {
      if (event.data?.type !== "codaro-check-sandbox-probe") return;
      removeEventListener("message", listener);
      clearTimeout(timer);
      resolve({ origin: event.origin, ...event.data.result });
    });
  });
  const frame = document.createElement("iframe");
  frame.sandbox = "allow-scripts";
  frame.srcdoc = srcdoc;
  document.body.append(frame);
  const value = await message;
  await new Promise((resolve) => setTimeout(resolve, 50));
  value.topNavigationBlocked = location.href === before;
  frame.remove();
  value.frameCleanup = frames.length === 0;
  return value;
}'''


def percentile(values: list[float], fraction: float) -> int:
    if not values:
        raise ValueError("percentile requires at least one value")
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, int((len(ordered) - 1) * fraction + 0.999999)))
    return round(ordered[index])


def frameSource() -> tuple[str, str]:
    digest = base64.b64encode(hashlib.sha256(FRAME_BOOTSTRAP.encode("utf-8")).digest()).decode("ascii")
    csp = (
        "default-src 'none'; connect-src 'none'; worker-src blob:; "
        f"script-src 'sha256-{digest}' blob: 'wasm-unsafe-eval'"
    )
    source = (
        "<!doctype html><meta http-equiv=\"Content-Security-Policy\" "
        f"content=\"{csp}\"><script>{FRAME_BOOTSTRAP}</script>"
    )
    return source, f"sha256-{digest}"


def browserCapabilityMatrix() -> dict[str, Any]:
    srcdoc, bootstrapHash = frameSource()
    engines: list[dict[str, Any]] = []
    with sync_playwright() as playwright:
        for engineName in BROWSER_ENGINES:
            browserType = getattr(playwright, engineName)
            launchStarted = time.monotonic()
            browser = browserType.launch(headless=True)
            launchMs = round((time.monotonic() - launchStarted) * 1000)
            browserVersion = browser.version
            page = browser.new_page()
            page.set_content("<main id=\"root\"></main>")
            samples: list[float] = []
            results: list[dict[str, Any]] = []
            try:
                for _ in range(PROBE_ITERATIONS):
                    started = time.monotonic()
                    result = page.evaluate(HOST_PROBE, srcdoc)
                    samples.append((time.monotonic() - started) * 1000)
                    if not isinstance(result, dict):
                        raise ValueError(f"{engineName} returned a malformed opaque-frame result")
                    results.append(result)
            finally:
                browser.close()
            stable = all(result == results[0] for result in results)
            facts = results[0]
            isolationPassed = (
                stable
                and facts.get("origin") == "null"
                and facts.get("counter") == 1
                and facts.get("openerNull") is True
                and facts.get("storageBlocked") is True
                and facts.get("networkBlocked") is True
                and facts.get("wasm") is True
                and facts.get("topNavigationBlocked") is True
                and facts.get("frameCleanup") is True
            )
            blockers = []
            if facts.get("moduleWorker") is not True:
                blockers.append("opaque-frame-blob-module-worker-unavailable")
            blockers.append("network-first-python-core-blocked-by-required-connect-src-none")
            engines.append({
                "blockers": blockers,
                "browserVersion": browserVersion,
                "candidateAEligible": False,
                "coldBrowserLaunchMs": launchMs,
                "engine": engineName,
                "frameProbe": facts,
                "frameProbeStable": stable,
                "isolationPrimitivesPassed": isolationPassed,
                "warmFrameP50Ms": round(statistics.median(samples)),
                "warmFrameP95Ms": percentile(samples, 0.95),
            })
    return {
        "bootstrapHash": bootstrapHash,
        "candidateAEligible": all(row["candidateAEligible"] for row in engines),
        "engineCount": len(engines),
        "engines": engines,
        "iterationsPerEngine": PROBE_ITERATIONS,
        "pythonBoot": {
            "status": "not-run",
            "reason": "required opaque-frame transport cannot supply the network-first Python core",
        },
    }


def windowsCapabilityProbe(root: Path) -> dict[str, Any]:
    implementationFiles = {
        "broker": root / "launcher/codaro-launcher/src/check_broker.rs",
        "sandbox": root / "launcher/codaro-launcher/src/check_sandbox.rs",
    }
    apiAvailability: dict[str, bool] = {}
    if platform.system() == "Windows":
        apiAvailability = {
            "CreateAppContainerProfile": hasattr(ctypes.windll.userenv, "CreateAppContainerProfile"),
            "CreateJobObjectW": hasattr(ctypes.windll.kernel32, "CreateJobObjectW"),
            "CreateRestrictedToken": hasattr(ctypes.windll.advapi32, "CreateRestrictedToken"),
        }
    version = platform.version()
    versionParts = [int(value) for value in re.findall(r"\d+", version)[:3]]
    while len(versionParts) < 3:
        versionParts.append(0)
    supportedWindowsHost = (
        platform.system() == "Windows"
        and versionParts[0] == 10
        and versionParts[2] >= SUPPORTED_WINDOWS_MIN_BUILD
    )
    implementationPresent = all(path.is_file() for path in implementationFiles.values())
    runnerSource = (root / "tests/run.py").read_text(encoding="utf-8")
    workflowSource = (root / ".github/workflows/release-quality.yml").read_text(encoding="utf-8")
    nativeGateWiringPresent = (
        all(f'"{gate}"' in runnerSource for gate in REQUIRED_NATIVE_GATES)
        and "runs-on: windows-2025" in workflowSource
        and "tests/run.py product-release" in workflowSource
    )
    blockers = []
    if not supportedWindowsHost:
        blockers.append("supported-windows-host-not-present")
    if not implementationPresent:
        blockers.append("appcontainer-job-broker-implementation-absent")
    if not nativeGateWiringPresent:
        blockers.append("required-native-release-gates-not-wired")
    return {
        "apiAvailability": apiAvailability,
        "blockers": blockers,
        "candidateEligible": (
            supportedWindowsHost
            and implementationPresent
            and nativeGateWiringPresent
            and all(apiAvailability.values())
        ),
        "implementationFiles": {
            key: path.relative_to(root).as_posix()
            for key, path in implementationFiles.items()
        },
        "implementationPresent": implementationPresent,
        "nativeGateWiringPresent": nativeGateWiringPresent,
        "os": {
            "platform": platform.system(),
            "release": platform.release(),
            "version": version,
        },
        "requiredNativeGates": list(REQUIRED_NATIVE_GATES),
        "supportPolicyEligible": implementationPresent and nativeGateWiringPresent,
        "target": "Windows NT 10.0 build 19045 or newer",
        "targetPresent": supportedWindowsHost,
    }


def capabilityDecision(browser: dict[str, Any], windows: dict[str, Any]) -> dict[str, Any]:
    if browser.get("candidateAEligible") is True:
        browserDecision = "opaque-frame-supported"
        browserStrongKinds = ["behavior", "output", "variable"]
        browserLocalRequiredKinds: list[str] = []
    else:
        browserDecision = "candidate-b-supported-subset"
        browserStrongKinds = ["output", "variable"]
        browserLocalRequiredKinds = ["behavior"]
    windowsSupported = windows.get(
        "supportPolicyEligible",
        windows.get("candidateEligible"),
    ) is True
    return {
        "browser": {
            "decision": browserDecision,
            "localRequiredKinds": browserLocalRequiredKinds,
            "strongKinds": browserStrongKinds,
        },
        "localWindows": {
            "decision": "supported" if windowsSupported else "unsupported",
            "minimumBuild": SUPPORTED_WINDOWS_MIN_BUILD,
            "nativeExecutorMayGrantStrongCredit": windowsSupported,
            "requiredIsolation": "windows-appcontainer",
            "requiredNativeGates": list(REQUIRED_NATIVE_GATES),
        },
        "offline": {
            "cold": "unsupported",
            "warm": "unsupported",
        },
        "enforcementState": "enforced",
        "policyVersion": 2,
    }
