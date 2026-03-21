from __future__ import annotations

import asyncio
import json
import re
import subprocess
from pathlib import Path

from pydantic import BaseModel


PROJECT_ROOT = Path(__file__).resolve().parents[3]


class PackageInfo(BaseModel):
    name: str
    version: str


class InstallResult(BaseModel):
    package: str
    success: bool
    message: str


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

    raise PackageEnvironmentError(
        "package_environment_missing",
        "Project virtual environment was not found. Expected .venv for Codaro.",
    )


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
            timeout=30,
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
            "Package listing timed out after 30 seconds.",
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
    validatePackageName(name)
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _installSync, name)


def _installSync(name: str) -> InstallResult:
    try:
        pythonPath = getProjectPythonPath()
    except PackageEnvironmentError as error:
        return InstallResult(package=name, success=False, message=error.message)

    try:
        result = runUvPip("install", [name], pythonPath=pythonPath, timeoutSeconds=180)
    except FileNotFoundError:
        return InstallResult(
            package=name,
            success=False,
            message="uv executable was not found.",
        )
    except subprocess.TimeoutExpired:
        return InstallResult(
            package=name,
            success=False,
            message="Installation timed out after 180 seconds.",
        )

    output = (result.stdout + "\n" + result.stderr).strip()
    return InstallResult(
        package=name,
        success=result.returncode == 0,
        message=output,
    )


async def uninstallPackage(name: str) -> InstallResult:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _uninstallSync, name)


def _uninstallSync(name: str) -> InstallResult:
    try:
        pythonPath = getProjectPythonPath()
    except PackageEnvironmentError as error:
        return InstallResult(package=name, success=False, message=error.message)

    try:
        result = runUvPip("uninstall", [name, "-y"], pythonPath=pythonPath, timeoutSeconds=60)
    except FileNotFoundError:
        return InstallResult(
            package=name,
            success=False,
            message="uv executable was not found.",
        )
    except subprocess.TimeoutExpired:
        return InstallResult(
            package=name,
            success=False,
            message="Uninstall timed out.",
        )

    output = (result.stdout + "\n" + result.stderr).strip()
    return InstallResult(
        package=name,
        success=result.returncode == 0,
        message=output,
    )


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
