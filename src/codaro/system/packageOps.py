from __future__ import annotations

import asyncio
import json
import re
import subprocess
import sys
import time
from pathlib import Path

from pydantic import BaseModel


PROJECT_ROOT = Path(__file__).resolve().parents[3]
PACKAGE_LIST_TIMEOUT_SECONDS = 30
PACKAGE_VERSION_TIMEOUT_SECONDS = 10
INSTALL_TIMEOUT_SECONDS = 600
UNINSTALL_TIMEOUT_SECONDS = 120


class PackageInfo(BaseModel):
    name: str
    version: str


class InstallResult(BaseModel):
    package: str
    success: bool
    message: str
    installer: str = "uv"
    environment: str = "project .venv"
    durationMs: int | None = None
    skipped: bool = False


class PackageEnvironmentError(RuntimeError):
    def __init__(self, code: str, message: str, statusCode: int = 503):
        super().__init__(message)
        self.code = code
        self.message = message
        self.statusCode = statusCode


def getProjectPythonPath(projectRoot: Path | None = None) -> Path:
    root = projectRoot or PROJECT_ROOT
    candidates = (
        root / ".venv" / "Scripts" / "python.exe",
        root / ".venv" / "bin" / "python",
    )
    for candidate in candidates:
        if candidate.is_file():
            return candidate

    # 프로젝트 `.venv`가 없으면 현재 실행 중인 인터프리터가 곧 패키지 환경이다.
    # 런처가 제공하는 managed runtime(standalone Python)이 이 경로에 해당하며,
    # 셀도 이 인터프리터에서 in-process로 실행되므로 패키지 설치/조회 대상이 일치한다.
    # codaro가 그 인터프리터에서 import 가능할 때만(=정상 런타임) fallback 한다.
    if Path(sys.executable).is_file() and _runningInterpreterHasCodaro():
        return Path(sys.executable)

    raise PackageEnvironmentError(
        "package_environment_missing",
        "Project virtual environment was not found. Expected .venv for Codaro.",
    )


def _runningInterpreterHasCodaro() -> bool:
    try:
        import importlib.util

        return importlib.util.find_spec("codaro") is not None
    except (ImportError, ValueError):
        return False


async def listPackages() -> list[PackageInfo]:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _listSync)


def _listSync() -> list[PackageInfo]:
    pythonPath = getProjectPythonPath()
    script = """
import importlib.metadata as metadata
import json

seen = {}
for dist in metadata.distributions():
    name = dist.metadata.get("Name") or dist.metadata.get("Summary") or dist.name
    if not name:
        continue
    if name in seen:
        continue
    seen[name] = {
        "name": name,
        "version": dist.metadata.get("Version") or "unknown",
    }

print(json.dumps(sorted(seen.values(), key=lambda item: item["name"].lower())))
""".strip()
    try:
        result = subprocess.run(
            [str(pythonPath), "-X", "utf8", "-c", script],
            capture_output=True,
            text=True,
            timeout=PACKAGE_LIST_TIMEOUT_SECONDS,
            cwd=PROJECT_ROOT,
            check=False,
        )
    except FileNotFoundError as error:
        raise PackageEnvironmentError(
            "package_environment_missing",
            "Project virtual environment Python executable was not found.",
        ) from error
    except subprocess.TimeoutExpired as error:
        raise PackageEnvironmentError(
            "package_list_timeout",
            f"Package listing timed out after {PACKAGE_LIST_TIMEOUT_SECONDS} seconds.",
        ) from error

    if result.returncode != 0:
        output = (result.stdout + "\n" + result.stderr).strip()
        raise PackageEnvironmentError(
            "package_list_failed",
            output or "Package listing failed for the project environment.",
        )

    try:
        payload = json.loads(result.stdout or "[]")
    except json.JSONDecodeError as error:
        raise PackageEnvironmentError(
            "package_list_failed",
            "Package listing returned invalid data.",
        ) from error

    return [PackageInfo.model_validate(item) for item in payload]


_VALID_PACKAGE_NAME = re.compile(r"^[A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?(\[.*\])?(([<>=!~]+)[\d.*]+)?$")
_PLAIN_PACKAGE_NAME = re.compile(r"^[A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?$")


def validatePackageName(name: str) -> None:
    if not name or not _VALID_PACKAGE_NAME.match(name):
        raise PackageEnvironmentError(
            "package_name_invalid",
            f"Invalid package name: {name!r}. Names must match PEP 508.",
            statusCode=400,
        )
    if ".." in name or "/" in name or "\\" in name:
        raise PackageEnvironmentError(
            "package_name_invalid",
            f"Suspicious package name: {name!r}.",
            statusCode=400,
        )


async def installPackage(name: str) -> InstallResult:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _installSync, name)


def _installSync(name: str) -> InstallResult:
    startedAt = time.monotonic()
    try:
        validatePackageName(name)
    except PackageEnvironmentError as error:
        return _packageResult(name, False, error.message, startedAt)

    try:
        pythonPath = getProjectPythonPath()
    except PackageEnvironmentError as error:
        return _packageResult(name, False, error.message, startedAt)

    try:
        installedVersion = installedPackageVersion(name, pythonPath=pythonPath)
    except FileNotFoundError:
        return _packageResult(name, False, "Project virtual environment Python executable was not found.", startedAt)
    except subprocess.TimeoutExpired:
        installedVersion = None
    if installedVersion:
        return _packageResult(
            name,
            True,
            f"{name} is already installed in the project .venv ({installedVersion}).",
            startedAt,
            skipped=True,
        )

    try:
        result = runUvPip("install", [name], pythonPath=pythonPath, timeoutSeconds=INSTALL_TIMEOUT_SECONDS)
    except FileNotFoundError:
        return _packageResult(name, False, "uv executable was not found.", startedAt)
    except subprocess.TimeoutExpired:
        return _packageResult(
            name,
            False,
            f"Installation timed out after {INSTALL_TIMEOUT_SECONDS} seconds while running uv pip install.",
            startedAt,
        )

    output = (result.stdout + "\n" + result.stderr).strip()
    return _packageResult(name, result.returncode == 0, output, startedAt)


async def uninstallPackage(name: str) -> InstallResult:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _uninstallSync, name)


def _uninstallSync(name: str) -> InstallResult:
    startedAt = time.monotonic()
    try:
        validatePackageName(name)
    except PackageEnvironmentError as error:
        return _packageResult(name, False, error.message, startedAt)

    try:
        pythonPath = getProjectPythonPath()
    except PackageEnvironmentError as error:
        return _packageResult(name, False, error.message, startedAt)

    try:
        result = runUvPip("uninstall", [name, "-y"], pythonPath=pythonPath, timeoutSeconds=UNINSTALL_TIMEOUT_SECONDS)
    except FileNotFoundError:
        return _packageResult(name, False, "uv executable was not found.", startedAt)
    except subprocess.TimeoutExpired:
        return _packageResult(name, False, f"Uninstall timed out after {UNINSTALL_TIMEOUT_SECONDS} seconds.", startedAt)

    output = (result.stdout + "\n" + result.stderr).strip()
    return _packageResult(name, result.returncode == 0, output, startedAt)


def installedPackageVersion(name: str, *, pythonPath: Path) -> str | None:
    if not _PLAIN_PACKAGE_NAME.match(name):
        return None

    script = """
import importlib.metadata as metadata
import sys

try:
    dist = metadata.distribution(sys.argv[1])
except metadata.PackageNotFoundError:
    raise SystemExit(1)

print(dist.version)
""".strip()
    result = subprocess.run(
        [str(pythonPath), "-X", "utf8", "-c", script, name],
        capture_output=True,
        text=True,
        timeout=PACKAGE_VERSION_TIMEOUT_SECONDS,
        cwd=PROJECT_ROOT,
        check=False,
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip() or None


def _packageResult(
    name: str,
    success: bool,
    message: str,
    startedAt: float,
    *,
    skipped: bool = False,
) -> InstallResult:
    return InstallResult(
        package=name,
        success=success,
        message=message,
        durationMs=_elapsedMs(startedAt),
        skipped=skipped,
    )


def _elapsedMs(startedAt: float) -> int:
    return max(0, int((time.monotonic() - startedAt) * 1000))


def runUvPip(
    command: str,
    arguments: list[str],
    *,
    pythonPath: Path,
    timeoutSeconds: int,
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["uv", "pip", command, "--python", str(pythonPath), *arguments],
        capture_output=True,
        text=True,
        timeout=timeoutSeconds,
        cwd=PROJECT_ROOT,
    )
