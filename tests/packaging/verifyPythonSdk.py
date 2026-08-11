from __future__ import annotations

import argparse
from datetime import UTC, datetime
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
from typing import Any
import zipfile


ROOT = Path(__file__).resolve().parents[2]
BUILDER_PATH = ROOT / "docs" / "skills" / "ops" / "tools" / "buildPythonDistribution.py"
GATE_ROOT = ROOT / "output" / "test-runner" / "python-sdk"
DEFAULT_BUILD_ROOT = GATE_ROOT / "build"
DEFAULT_DIST_ROOT = GATE_ROOT / "dist"
SCRATCH_ROOT = GATE_ROOT / "scratch"
REPORT_PATH = GATE_ROOT / "python-sdk-report.json"


class PythonSdkVerificationError(RuntimeError):
    pass


def loadBuilder() -> Any:
    spec = importlib.util.spec_from_file_location("codaro_python_distribution_builder", BUILDER_PATH)
    if spec is None or spec.loader is None:
        raise PythonSdkVerificationError(f"unable to load builder: {BUILDER_PATH}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def resetDirectory(path: Path) -> Path:
    resolved = path.resolve()
    gateRoot = GATE_ROOT.resolve()
    if resolved == gateRoot or not resolved.is_relative_to(gateRoot):
        raise PythonSdkVerificationError(f"scratch reset escapes gate root: {resolved}")
    if resolved.exists():
        if not resolved.is_dir():
            raise PythonSdkVerificationError(f"scratch target is not a directory: {resolved}")
        shutil.rmtree(resolved)
    resolved.mkdir(parents=True, exist_ok=True)
    return resolved


def runRequired(
    arguments: tuple[str, ...],
    *,
    cwd: Path = ROOT,
    timeout: int = 900,
) -> subprocess.CompletedProcess[str]:
    completed = subprocess.run(
        arguments,
        cwd=cwd,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=timeout,
        check=False,
    )
    if completed.returncode != 0:
        detail = (completed.stderr or completed.stdout).strip()
        raise PythonSdkVerificationError(
            f"command failed with exit {completed.returncode}: {' '.join(arguments)}\n{detail}"
        )
    return completed


def venvPython(venvRoot: Path) -> Path:
    candidate = (
        venvRoot / "Scripts" / "python.exe"
        if sys.platform == "win32"
        else venvRoot / "bin" / "python"
    )
    if not candidate.is_file():
        raise PythonSdkVerificationError(f"venv Python is missing: {candidate}")
    return candidate


def venvCommand(venvRoot: Path, name: str) -> Path:
    candidate = (
        venvRoot / "Scripts" / f"{name}.exe"
        if sys.platform == "win32"
        else venvRoot / "bin" / name
    )
    if not candidate.is_file():
        raise PythonSdkVerificationError(f"venv command is missing: {candidate}")
    return candidate


def installedProbeCode(expectedVersion: str, expectedLessonCount: int) -> str:
    return f"""
from fastapi import FastAPI
import asyncio
import hashlib
import importlib.metadata
import json
from pathlib import Path
import tempfile

import codaro
from codaro import App, createServerApp, ui
from codaro.publication import buildBlockEmbed, buildStaticPublication
from codaro.server import createServerApp as serverFactory

async def asgiGetStatus(app, path):
    messages = []
    requestSent = False

    async def receive():
        nonlocal requestSent
        if not requestSent:
            requestSent = True
            return {{'type': 'http.request', 'body': b'', 'more_body': False}}
        await asyncio.sleep(0)
        return {{'type': 'http.disconnect'}}

    async def send(message):
        messages.append(message)

    scope = {{
        'type': 'http',
        'asgi': {{'version': '3.0', 'spec_version': '2.3'}},
        'http_version': '1.1',
        'method': 'GET',
        'scheme': 'http',
        'path': path,
        'raw_path': path.encode('ascii'),
        'root_path': '',
        'query_string': b'',
        'headers': [],
        'client': ('127.0.0.1', 50000),
        'server': ('testserver', 80),
        'state': {{}},
    }}
    await app(scope, receive, send)
    start = next(message for message in messages if message['type'] == 'http.response.start')
    return start['status']

expected = {expectedVersion!r}
assert codaro.__version__ == expected
assert importlib.metadata.version('codaro') == expected
assert createServerApp is serverFactory
assert isinstance(App(), App)
assert callable(ui.number)
assert callable(buildBlockEmbed)
assert callable(buildStaticPublication)
packageRoot = Path(codaro.__file__).resolve().parent
assert (packageRoot / 'webBuild' / 'index.html').is_file()
assert any((packageRoot / 'webBuild' / '_app').iterdir())
assert (packageRoot / 'curricula' / 'python' / '__init__.py').is_file()
lessonCount = sum(
    1
    for path in (packageRoot / 'curricula' / 'python').rglob('*.yaml')
    if path.is_file() and path.name != 'schema.yaml'
)
assert lessonCount == {expectedLessonCount}
assert (packageRoot / 'generatedContracts' / 'artifactOwnership.schema.json').is_file()
with tempfile.TemporaryDirectory(prefix='codaro-sdk-mount-') as directory:
    host = FastAPI()
    host.mount('/codaro', createServerApp(workspaceRoot=Path(directory)))
    mountStatus = asyncio.run(asgiGetStatus(host, '/codaro/api/health'))
    assert mountStatus == 200
print(json.dumps({{
    'version': codaro.__version__,
    'modulePath': str(packageRoot),
    'initHash': hashlib.sha256(Path(codaro.__file__).read_bytes()).hexdigest(),
    'lessonCount': lessonCount,
    'mountStatus': mountStatus,
}}, ensure_ascii=False))
""".strip()


def parseJsonLine(output: str) -> dict[str, Any]:
    for line in reversed(output.splitlines()):
        candidate = line.strip()
        if candidate.startswith("{") and candidate.endswith("}"):
            value = json.loads(candidate)
            if isinstance(value, dict):
                return value
    raise PythonSdkVerificationError(f"probe output has no JSON object: {output[-1000:]}")


def wheelInitHash(wheelPath: Path) -> str:
    with zipfile.ZipFile(wheelPath) as archive:
        return hashlib.sha256(archive.read("codaro/__init__.py")).hexdigest()


def verifyDirectWheelInstall(
    wheelPath: Path,
    *,
    expectedVersion: str,
    expectedLessonCount: int,
) -> dict[str, Any]:
    installRoot = resetDirectory(SCRATCH_ROOT / "direct-wheel")
    venvRoot = installRoot / "venv"
    runRequired(("uv", "venv", str(venvRoot), "--python", sys.executable))
    pythonPath = venvPython(venvRoot)
    runRequired(("uv", "pip", "install", "--python", str(pythonPath), str(wheelPath)), timeout=1200)
    probe = runRequired(
        (str(pythonPath), "-X", "utf8", "-c", installedProbeCode(expectedVersion, expectedLessonCount)),
        cwd=installRoot,
    )
    payload = parseJsonLine(probe.stdout)
    cli = runRequired((str(venvCommand(venvRoot, "codaro")), "--help"), cwd=installRoot)
    if "usage:" not in cli.stdout.lower():
        raise PythonSdkVerificationError("installed codaro --help output is missing usage")

    referencePath = installRoot / "browserCalculator.py"
    shutil.copy2(ROOT / "examples" / "apps" / "browser-calculator" / "app.py", referencePath)
    referenceBefore = referencePath.read_bytes()
    runRequired((str(pythonPath), "-X", "utf8", str(referencePath)), cwd=installRoot)
    if referencePath.read_bytes() != referenceBefore:
        raise PythonSdkVerificationError("plain Python reference source changed during wheel smoke")
    payload["cliHelp"] = True
    payload["plainPythonReference"] = True
    return payload


def verifyUvAddInstall(
    distRoot: Path,
    wheelPath: Path,
    *,
    expectedVersion: str,
    expectedLessonCount: int,
) -> dict[str, Any]:
    with tempfile.TemporaryDirectory(prefix="codaro-sdk-uv-add-") as temporary:
        projectRoot = Path(temporary)
        runRequired(
            ("uv", "init", "--bare", "--no-workspace", "--name", "codaro-sdk-smoke"),
            cwd=projectRoot,
        )
        runRequired(
            (
                "uv",
                "add",
                "--find-links",
                str(distRoot),
                f"codaro=={expectedVersion}",
            ),
            cwd=projectRoot,
            timeout=1200,
        )
        probe = runRequired(
            (
                "uv",
                "run",
                "python",
                "-X",
                "utf8",
                "-c",
                installedProbeCode(expectedVersion, expectedLessonCount),
            ),
            cwd=projectRoot,
            timeout=900,
        )
        payload = parseJsonLine(probe.stdout)
        expectedInitHash = wheelInitHash(wheelPath)
        if payload.get("initHash") != expectedInitHash:
            raise PythonSdkVerificationError(
                "uv add did not install the locally built wheel content"
            )
        lockText = (projectRoot / "uv.lock").read_text(encoding="utf-8")
        if "name = \"codaro\"" not in lockText or expectedVersion not in lockText:
            raise PythonSdkVerificationError("uv add lock does not contain the exact codaro version")
        projectText = (projectRoot / "pyproject.toml").read_text(encoding="utf-8")
        if "workspace = true" in projectText:
            raise PythonSdkVerificationError("uv add project resolved codaro from a source workspace")
        payload["localWheelContent"] = True
        return payload


def verifyUvx(wheelPath: Path) -> dict[str, Any]:
    completed = runRequired(
        (
            "uvx",
            "--isolated",
            "--from",
            str(wheelPath),
            "codaro",
            "--help",
        ),
        cwd=resetDirectory(SCRATCH_ROOT / "uvx"),
        timeout=1200,
    )
    if "usage:" not in completed.stdout.lower():
        raise PythonSdkVerificationError("uvx codaro --help output is missing usage")
    return {"localWheel": True, "cliHelp": True}


def verifyInstalledSdk(
    wheelPath: Path,
    workspaceRoot: Path = ROOT,
) -> dict[str, Any]:
    workspaceMetadataPaths = (
        workspaceRoot / "pyproject.toml",
        workspaceRoot / "uv.lock",
    )
    workspaceMetadataBefore = {
        path: path.read_bytes()
        for path in workspaceMetadataPaths
    }
    builder = loadBuilder()
    distribution = builder.verifyPythonDistribution(wheelPath.parent)
    direct = verifyDirectWheelInstall(
        wheelPath,
        expectedVersion=distribution.version,
        expectedLessonCount=distribution.lessonCount,
    )
    uvAdd = verifyUvAddInstall(
        wheelPath.parent,
        wheelPath,
        expectedVersion=distribution.version,
        expectedLessonCount=distribution.lessonCount,
    )
    uvx = verifyUvx(wheelPath)
    changedMetadata = [
        path.name
        for path, before in workspaceMetadataBefore.items()
        if path.read_bytes() != before
    ]
    if changedMetadata:
        raise PythonSdkVerificationError(
            f"installed SDK verification changed workspace metadata: {changedMetadata}"
        )
    return {"directWheel": direct, "uvAdd": uvAdd, "uvx": uvx}


def currentGitHead() -> str | None:
    completed = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=False,
    )
    return completed.stdout.strip() if completed.returncode == 0 else None


def writeReport(
    *,
    startedAt: str,
    started: float,
    status: str,
    distribution: dict[str, Any] | None,
    installed: dict[str, Any] | None,
    failures: list[str],
) -> None:
    payload = {
        "schemaVersion": 1,
        "gate": "python-sdk",
        "status": status,
        "passed": status == "passed",
        "gitHead": currentGitHead(),
        "startedAt": startedAt,
        "completedAt": datetime.now(UTC).isoformat(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "distribution": distribution,
        "installed": installed,
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, ensure_ascii=False, indent=2))


def parseArgs(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Verify the built Codaro Python SDK in fresh environments.")
    parser.add_argument("--build-root", type=Path, default=DEFAULT_BUILD_ROOT)
    parser.add_argument("--dist-root", type=Path, default=DEFAULT_DIST_ROOT)
    parser.add_argument("--skip-build", action="store_true")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parseArgs(list(sys.argv[1:] if argv is None else argv))
    startedAt = datetime.now(UTC).isoformat()
    started = time.monotonic()
    distributionPayload: dict[str, Any] | None = None
    installedPayload: dict[str, Any] | None = None
    failures: list[str] = []
    try:
        builder = loadBuilder()
        distribution = (
            builder.verifyPythonDistribution(args.dist_root)
            if args.skip_build
            else builder.buildPythonDistribution(args.build_root, args.dist_root)
        )
        distributionPayload = distribution.toJson()
        installedPayload = verifyInstalledSdk(distribution.wheelPath)
    except (
        OSError,
        RuntimeError,
        ValueError,
        json.JSONDecodeError,
        subprocess.SubprocessError,
        zipfile.BadZipFile,
    ) as exc:
        failures.append(f"{type(exc).__name__}: {exc}")
    status = "passed" if not failures else "failed"
    writeReport(
        startedAt=startedAt,
        started=started,
        status=status,
        distribution=distributionPayload,
        installed=installedPayload,
        failures=failures,
    )
    if failures:
        print(f"FAIL: {failures[0]}", file=sys.stderr)
        return 1
    print("ok: built wheel supports public imports, mount, uv add, uvx, CLI, and package data")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
