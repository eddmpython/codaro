from __future__ import annotations

import argparse
from datetime import UTC, datetime
import json
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

_TESTS_ROOT = Path(__file__).resolve().parents[1]
if str(_TESTS_ROOT) not in sys.path:
    sys.path.insert(0, str(_TESTS_ROOT))

from browserStaticServer import StaticAppServer  # noqa: E402
from playwrightCli import (  # noqa: E402
    PlaywrightCli,
    PlaywrightCliError,
    repoLocalPlaywrightWorkspace,
    resolvePlaywrightCli,
    uniquePlaywrightSessionName,
)


ROOT = Path(__file__).resolve().parents[2]
REPORT_PATH = ROOT / "output" / "test-runner" / "pyproc-assets-browser" / "pyproc-assets-report.json"
EXPECTED_ROLES = (
    "machineWorker",
    "processWorker",
    "pyprocServiceWorker",
    "sharedKernelHost",
    "wasiWorker",
)


def main(argv: list[str] | None = None) -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    args = buildParser().parse_args(argv)
    checks: list[dict[str, Any]] = []
    try:
        cliPath = resolvePlaywrightCli(ROOT)
    except PlaywrightCliError as exc:
        writeReport(
            {"passed": False, "status": "failed", "checks": checks, "error": str(exc)},
            startedAt=startedAt,
            startedAtMonotonic=started,
        )
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1

    appPort = args.port or freeAppPort()
    url = f"http://127.0.0.1:{appPort}/"
    workspace = repoLocalPlaywrightWorkspace(ROOT, "pyproc-assets-browser")
    session = uniquePlaywrightSessionName("codaro-pyproc-assets")
    server = StaticAppServer(port=appPort)
    server.start()
    cli: PlaywrightCli | None = None

    try:
        waitForHttp(url)
        cli = PlaywrightCli(cliPath=cliPath, cwd=workspace, session=session)
        cli.run("open", url)
        cli.run("resize", "1280", "800")
        output = cli.eval(jsVerifyPyprocAssets())
        payload = parseJsonObject(output)
        checks.extend(payload["checks"])
        writeReport(
            {
                "passed": True,
                "status": "passed",
                "checks": checks,
                "signals": payload["signals"],
            },
            startedAt=startedAt,
            startedAtMonotonic=started,
        )
        print(
            "ok: pyproc asset browser verified "
            f"{payload['signals']['fileCount']} files, {payload['signals']['verifiedBytes']} bytes"
        )
        return 0
    except (json.JSONDecodeError, KeyError, TypeError, VerificationError, PlaywrightCliError) as exc:
        debugText = debugPageState(cli) if cli is not None else ""
        writeReport(
            {
                "passed": False,
                "status": "failed",
                "checks": checks,
                "error": str(exc),
                "debugText": debugText[:2000],
            },
            startedAt=startedAt,
            startedAtMonotonic=started,
        )
        print(f"FAIL: {exc}", file=sys.stderr)
        if debugText:
            print(debugText, file=sys.stderr)
        return 1
    finally:
        if cli is not None:
            cli.close()
        server.stop()


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Verify pyproc asset manifest in the built editor browser surface")
    parser.add_argument("--port", type=int, default=0)
    return parser


class VerificationError(RuntimeError):
    pass


def writeReport(payload: dict[str, Any], *, startedAt: str, startedAtMonotonic: float) -> Path:
    report = dict(payload)
    report["gate"] = "pyproc-assets-browser"
    report["startedAt"] = startedAt
    report["completedAt"] = utcTimestamp()
    report["durationMs"] = round((time.monotonic() - startedAtMonotonic) * 1000)
    gitHead = currentGitHead()
    if gitHead:
        report["gitHead"] = gitHead
    report["reportPath"] = reportDisplayPath(REPORT_PATH)
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return REPORT_PATH


def reportDisplayPath(reportPath: Path) -> str:
    try:
        return str(reportPath.relative_to(ROOT))
    except ValueError:
        return str(reportPath)


def parseJsonObject(output: str) -> dict[str, Any]:
    payload: Any = json.loads(output)
    if isinstance(payload, str):
        payload = json.loads(payload)
    if not isinstance(payload, dict):
        raise VerificationError(f"expected JSON object from Playwright eval, got {type(payload).__name__}")
    return payload


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def currentGitHead() -> str | None:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
    except (FileNotFoundError, OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() or None


def waitForHttp(url: str, timeout: float = 30.0) -> None:
    deadline = time.monotonic() + timeout
    lastError = ""
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=1.0) as response:
                if 200 <= response.status < 500:
                    return
        except (OSError, urllib.error.URLError) as exc:
            lastError = str(exc)
        time.sleep(0.25)
    raise VerificationError(f"static app server did not become ready: {lastError}")


def freePort() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def freeAppPort() -> int:
    for _attempt in range(40):
        port = freePort()
        if not 5170 <= port <= 5179:
            return port
    raise VerificationError("could not find a non-517x app port")


def debugPageState(cli: PlaywrightCli | None) -> str:
    if cli is None:
        return ""
    try:
        return cli.eval("document.body.innerText.slice(0, 2000)")
    except PlaywrightCliError as exc:
        return f"debug unavailable: {exc}"


def jsVerifyPyprocAssets() -> str:
    expectedRoles = json.dumps(EXPECTED_ROLES, ensure_ascii=False)
    return compactJs(f"""
(async () => {{
  const expectedRoles = {expectedRoles};
  const checks = [];
  const manifestResponse = await fetch('/pyproc-assets.json', {{ cache: 'no-store' }});
  if (!manifestResponse.ok) throw new Error('pyproc-assets.json fetch failed: ' + manifestResponse.status);
  const manifest = await manifestResponse.json();
  checks.push({{ caseId: 'manifest-fetch', passed: true, status: 'passed' }});
  const roles = [...manifest.entrypoints.map((entrypoint) => entrypoint.role)].sort();
  if (JSON.stringify(roles) !== JSON.stringify(expectedRoles)) {{
    throw new Error('entrypoint roles mismatch: ' + JSON.stringify(roles));
  }}
  checks.push({{ caseId: 'entrypoint-roles', passed: true, status: 'passed', roles }});
  if (!manifest.packageRoot || !manifest.packageRoot.endsWith('/vendor/pyproc/')) {{
    throw new Error('packageRoot should point at /vendor/pyproc/: ' + manifest.packageRoot);
  }}
  if (!manifest.policy || manifest.policy.sameOriginRequired !== true || manifest.policy.preserveRelativeImports !== true) {{
    throw new Error('manifest policy missing same-origin relative import contract');
  }}
  const files = manifest.files || [];
  if (files.length < expectedRoles.length) throw new Error('manifest files graph is too small: ' + files.length);
  const base64FromBytes = (bytes) => {{
    let text = '';
    for (let index = 0; index < bytes.length; index += 0x8000) {{
      text += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    }}
    return btoa(text);
  }};
  const sha256Sri = async (buffer) => {{
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return 'sha256-' + base64FromBytes(new Uint8Array(digest));
  }};
  let verifiedBytes = 0;
  const verifiedPaths = [];
  for (const file of files) {{
    if (!file.path || !file.url || !file.integrity) throw new Error('manifest file entry incomplete');
    if (!file.url.startsWith('/vendor/pyproc/')) throw new Error('file URL is not same-origin vendor path: ' + file.url);
    if (!file.integrity.startsWith('sha256-')) throw new Error('file SRI is not sha256: ' + file.path);
    const response = await fetch(file.url, {{ cache: 'no-store' }});
    if (!response.ok) throw new Error('vendor file fetch failed: ' + file.path + ' ' + response.status);
    const buffer = await response.arrayBuffer();
    const actual = await sha256Sri(buffer);
    if (actual !== file.integrity) {{
      throw new Error('SRI mismatch for ' + file.path + ': ' + actual + ' !== ' + file.integrity);
    }}
    verifiedBytes += buffer.byteLength;
    verifiedPaths.push(file.path);
  }}
  checks.push({{ caseId: 'vendor-graph-sri', passed: true, status: 'passed', fileCount: files.length }});
  const workerEntry = files.find((file) => file.path === 'src/processOs/worker.js');
  if (!workerEntry) throw new Error('process worker file missing from manifest');
  const workerText = await fetch(workerEntry.url, {{ cache: 'no-store' }}).then((response) => response.text());
  if (!workerText.includes('parentPort') && !workerText.includes('import')) {{
    throw new Error('process worker payload does not look like an executable module');
  }}
  checks.push({{ caseId: 'process-worker-payload', passed: true, status: 'passed' }});
  const signals = {{
    manifestUrl: new URL('/pyproc-assets.json', location.href).href,
    packageRoot: manifest.packageRoot,
    roles,
    fileCount: files.length,
    verifiedBytes,
    verifiedPaths,
    sameOriginVendorUrls: files.every((file) => file.url.startsWith('/vendor/pyproc/')),
    sriVerified: verifiedPaths.length === files.length,
  }};
  return JSON.stringify({{ checks, signals }});
}})()
""")


def compactJs(source: str) -> str:
    return " ".join(line.strip() for line in source.strip().splitlines() if line.strip())


if __name__ == "__main__":
    raise SystemExit(main())
