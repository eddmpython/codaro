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
REPORT_PATH = ROOT / "output" / "test-runner" / "pyproc-asgi-browser" / "pyproc-asgi-report.json"


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
    url = f"http://127.0.0.1:{appPort}/?codaroBrowserRuntimeDiagnostics=1#editor"
    workspace = repoLocalPlaywrightWorkspace(ROOT, "pyproc-asgi-browser")
    session = uniquePlaywrightSessionName("codaro-pyproc-asgi")
    server = StaticAppServer(port=appPort)
    server.start()
    cli: PlaywrightCli | None = None

    try:
        waitForHttp(url)
        cli = PlaywrightCli(cliPath=cliPath, cwd=workspace, session=session)
        cli.run("open", url)
        cli.run("resize", "1280", "900")
        cli.waitEval("typeof window.__codaroBrowserPythonDiagnostics === 'object'", "browser runtime diagnostics", timeout=30)
        output = cli.eval(jsVerifyPyprocAsgi())
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
            "ok: pyproc asgi browser verified "
            f"{payload['signals']['status']} {payload['signals']['path']}"
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
    parser = argparse.ArgumentParser(description="Verify pyproc AsgiServer in the built editor browser runtime")
    parser.add_argument("--port", type=int, default=0)
    return parser


class VerificationError(RuntimeError):
    pass


def writeReport(payload: dict[str, Any], *, startedAt: str, startedAtMonotonic: float) -> Path:
    report = dict(payload)
    report["gate"] = "pyproc-asgi-browser"
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


def jsVerifyPyprocAsgi() -> str:
    return compactJs("""
(async () => {
  const checks = [];
  const diagnostics = window.__codaroBrowserPythonDiagnostics;
  if (!diagnostics) throw new Error('browser runtime diagnostics not installed');
  if (typeof diagnostics.verifyAsgiServer !== 'function') throw new Error('verifyAsgiServer missing');
  const result = await diagnostics.verifyAsgiServer();
  if (result.status !== 207) throw new Error('unexpected ASGI status: ' + result.status);
  checks.push({ caseId: 'asgi-status', passed: true, status: 'passed', responseStatus: result.status });
  if (result.headers['x-codaro-runtime'] !== 'pyproc-asgi') {
    throw new Error('ASGI response header mismatch: ' + JSON.stringify(result.headers));
  }
  if (result.body.runtime !== 'pyproc-asgi') throw new Error('ASGI runtime body mismatch');
  if (result.body.method !== 'POST') throw new Error('ASGI method mismatch: ' + result.body.method);
  if (result.body.path !== '/codaro/pyproc-asgi') throw new Error('ASGI path mismatch: ' + result.body.path);
  if (result.body.query !== 'value=41') throw new Error('ASGI query mismatch: ' + result.body.query);
  if (result.body.header !== 'browser-os-server') throw new Error('ASGI request header mismatch: ' + result.body.header);
  if (!String(result.body.requestBody || '').includes('codaro-product-gate')) {
    throw new Error('ASGI request body was not delivered: ' + result.body.requestBody);
  }
  checks.push({ caseId: 'asgi-request-round-trip', passed: true, status: 'passed', body: result.body });
  if (!result.installed || !String(result.installed.transport || '').includes('asgi-dispatch')) {
    throw new Error('ASGI install transport mismatch: ' + JSON.stringify(result.installed));
  }
  checks.push({ caseId: 'asgi-install-contract', passed: true, status: 'passed', installed: result.installed });
  const signals = {
    booted: diagnostics.isBooted(),
    appName: result.appName,
    status: result.status,
    path: result.body.path,
    query: result.body.query,
    requestHeader: result.body.header,
    responseHeader: result.headers['x-codaro-runtime'],
    bodyByteLength: result.bodyByteLength,
    transport: result.installed.transport,
  };
  return JSON.stringify({ checks, signals });
})()
""")


def compactJs(source: str) -> str:
    return " ".join(line.strip() for line in source.strip().splitlines() if line.strip())


if __name__ == "__main__":
    raise SystemExit(main())
