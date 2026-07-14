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
REPORT_PATH = ROOT / "output" / "test-runner" / "pyproc-runtime-fs-browser" / "pyproc-runtime-fs-report.json"


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
    workspace = repoLocalPlaywrightWorkspace(ROOT, "pyproc-runtime-fs-browser")
    session = uniquePlaywrightSessionName("codaro-pyproc-runtime-fs")
    server = StaticAppServer(port=appPort)
    server.start()
    cli: PlaywrightCli | None = None

    try:
        waitForHttp(url)
        cli = PlaywrightCli(cliPath=cliPath, cwd=workspace, session=session)
        cli.run("open", url)
        cli.run("resize", "1280", "900")
        cli.waitEval("typeof window.__codaroBrowserPythonDiagnostics === 'object'", "browser runtime diagnostics", timeout=30)
        output = cli.eval(jsVerifyPyprocRuntimeFs())
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
            "ok: pyproc runtime fs browser verified "
            f"{payload['signals']['sourcePath']} {payload['signals']['runRecordPath']}"
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
    parser = argparse.ArgumentParser(description="Verify pyproc Runtime.fs in the built editor browser runtime")
    parser.add_argument("--port", type=int, default=0)
    return parser


class VerificationError(RuntimeError):
    pass


def writeReport(payload: dict[str, Any], *, startedAt: str, startedAtMonotonic: float) -> Path:
    report = dict(payload)
    report["gate"] = "pyproc-runtime-fs-browser"
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


def jsVerifyPyprocRuntimeFs() -> str:
    return compactJs("""
(async () => {
  const checks = [];
  const diagnostics = window.__codaroBrowserPythonDiagnostics;
  if (!diagnostics) throw new Error('browser runtime diagnostics not installed');
  const firstCode = "value = 41\\nvalue + 1";
  const first = await diagnostics.executeBlock('cell-fs-source', firstCode, 1, []);
  if (first.status !== 'success') throw new Error('first browser cell failed: ' + first.stderr);
  const sourceArtifact = (first.artifacts || []).find((artifact) => artifact.kind === 'browser-runtime-source-file');
  const runArtifact = (first.artifacts || []).find((artifact) => artifact.kind === 'browser-runtime-run-record');
  if (!sourceArtifact || !runArtifact) throw new Error('browser Runtime.fs artifacts missing');
  checks.push({ caseId: 'runtime-fs-artifacts', passed: true, status: 'passed', artifacts: first.artifacts });
  const record = JSON.parse(await diagnostics.readTextFile(runArtifact.path));
  if (record.blockId !== 'cell-fs-source' || record.status !== 'success') {
    throw new Error('run record mismatch: ' + JSON.stringify(record));
  }
  if (record.runtime?.fileSystem !== 'Runtime.fs' || record.runtime?.pythonOpenShared !== true) {
    throw new Error('run record does not prove Runtime.fs shared Python open');
  }
  checks.push({ caseId: 'runtime-fs-js-readback', passed: true, status: 'passed', path: runArtifact.path });
  const readerCode = [
    "import json",
    "record = json.load(open('/home/web/codaro/runs/cell-fs-source.json', encoding='utf-8'))",
    "print(record['runtime']['fileSystem'])",
    "record['blockId'] + ':' + record['status']",
  ].join("\\n");
  const second = await diagnostics.executeBlock('cell-fs-reader', readerCode, 2, []);
  if (second.status !== 'success') throw new Error('second browser cell failed: ' + second.stderr);
  if (!second.stdout.includes('Runtime.fs') || !second.stdout.includes('cell-fs-source:success')) {
    throw new Error('Python open did not read Runtime.fs run record: ' + second.stdout);
  }
  checks.push({ caseId: 'python-open-shared-fs', passed: true, status: 'passed', stdout: second.stdout });
  const latest = JSON.parse(await diagnostics.readTextFile('/home/web/codaro/runs/latest.json'));
  if (latest.blockId !== 'cell-fs-reader' || latest.status !== 'success') {
    throw new Error('latest run record was not updated by second cell: ' + JSON.stringify(latest));
  }
  checks.push({ caseId: 'runtime-fs-latest-record', passed: true, status: 'passed' });
  const signals = {
    booted: diagnostics.isBooted(),
    sourcePath: sourceArtifact.path,
    runRecordPath: runArtifact.path,
    latestRecordPath: '/home/web/codaro/runs/latest.json',
    firstStatus: first.status,
    secondStatus: second.status,
    pythonOpenShared: true,
    runtimeFileSystem: record.runtime.fileSystem,
  };
  return JSON.stringify({ checks, signals });
})()
""")


def compactJs(source: str) -> str:
    return " ".join(line.strip() for line in source.strip().splitlines() if line.strip())


if __name__ == "__main__":
    raise SystemExit(main())
