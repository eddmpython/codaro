from __future__ import annotations

import asyncio
import os
import json
import re
import shutil
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
_STDLIB_MODULE_NAMES = set(getattr(sys, "stdlib_module_names", ()))


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


class PackageEnvironment(BaseModel):
    installer: str = "uv"
    pythonPath: str
    uvPath: str | None
    environment: str
    mode: str
    projectRoot: str
    pathEntries: list[str]
    uvAvailable: bool


class PackageInstallCommand(BaseModel):
    command: str
    environment: PackageEnvironment
    packages: list[str]


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


def getPackageEnvironment(projectRoot: Path | None = None) -> PackageEnvironment:
    root = projectRoot or PROJECT_ROOT
    pythonPath = getProjectPythonPath(root) if projectRoot is not None else getProjectPythonPath()
    uvPath = resolveUvPath(pythonPath=pythonPath, projectRoot=root)
    mode = _environmentModeForPython(pythonPath, root)
    pathEntries = _packagePathEntries(pythonPath, uvPath)
    return PackageEnvironment(
        pythonPath=str(pythonPath),
        uvPath=str(uvPath) if uvPath else None,
        environment=_environmentLabel(mode),
        mode=mode,
        projectRoot=str(root),
        pathEntries=[str(path) for path in pathEntries],
        uvAvailable=uvPath is not None,
    )


def buildPackageInstallCommand(names: list[str]) -> PackageInstallCommand:
    packages = installablePackageNames(names)
    environment = getPackageEnvironment()
    uvExecutable = environment.uvPath or "uv"
    commandParts = [
        uvExecutable,
        "pip",
        "install",
        "--python",
        environment.pythonPath,
        *packages,
    ] if packages else []
    return PackageInstallCommand(
        command=" ".join(_shellToken(part) for part in commandParts),
        environment=environment,
        packages=packages,
    )


def terminalEnvironmentVariables() -> dict[str, str]:
    try:
        environment = getPackageEnvironment()
    except PackageEnvironmentError:
        return {}
    values: dict[str, str] = {
        "CODARO_PACKAGE_PYTHON": environment.pythonPath,
        "CODARO_PACKAGE_ENV": environment.environment,
    }
    if environment.uvPath:
        values["CODARO_UV_EXE"] = environment.uvPath
    if environment.pathEntries:
        currentPath = os.environ.get("PATH", "")
        entries = [*environment.pathEntries]
        if currentPath:
            entries.append(currentPath)
        values["PATH"] = os.pathsep.join(entries)
    return values


def resolveUvPath(*, pythonPath: Path | None = None, projectRoot: Path | None = None) -> Path | None:
    configured = os.environ.get("CODARO_UV_EXE")
    if configured:
        candidate = Path(configured).expanduser()
        if candidate.is_file():
            return candidate

    discovered = shutil.which("uv")
    if discovered:
        return Path(discovered)

    root = projectRoot or PROJECT_ROOT
    pythonExecutable = pythonPath or Path(sys.executable)
    executableName = "uv.exe" if os.name == "nt" else "uv"
    candidates = [
        pythonExecutable.parent / executableName,
        root / ".venv" / ("Scripts" if os.name == "nt" else "bin") / executableName,
        Path(sys.executable).parent / executableName,
    ]
    launcherLogDir = os.environ.get("CODARO_LAUNCHER_LOG_DIR")
    if launcherLogDir:
        launcherRoot = Path(launcherLogDir).expanduser().parent
        candidates.extend(
            [
                launcherRoot / "runtime" / "uv" / executableName,
                launcherRoot / "launcher" / executableName,
            ]
        )
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return None


def _isProjectVenvPython(pythonPath: Path, projectRoot: Path) -> bool:
    return pythonPath in {
        projectRoot / ".venv" / "Scripts" / "python.exe",
        projectRoot / ".venv" / "bin" / "python",
    }


def _environmentLabel(mode: str) -> str:
    if mode == "project":
        return "project .venv"
    return "Codaro managed runtime"


def _environmentModeForPython(pythonPath: Path, projectRoot: Path) -> str:
    if _isProjectVenvPython(pythonPath, projectRoot):
        return "project"
    try:
        if pythonPath.resolve() == Path(sys.executable).resolve() and _runningInterpreterHasCodaro():
            return "managed"
    except OSError:
        pass
    return "project"


def _packagePathEntries(pythonPath: Path, uvPath: Path | None) -> list[Path]:
    entries: list[Path] = []
    if uvPath:
        entries.append(uvPath.parent)
    entries.append(pythonPath.parent)
    deduped: list[Path] = []
    seen: set[str] = set()
    for entry in entries:
        key = str(entry).lower() if os.name == "nt" else str(entry)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(entry)
    return deduped


def _shellToken(value: str) -> str:
    if re.match(r"^[A-Za-z0-9_./\\:=-]+$", value):
        return value
    return f'"{value.replace("\"", "\\\"")}"'


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
            env=_subprocessEnvForPython(pythonPath),
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
PACKAGE_NAME_ALIASES = {
    "bs4": "beautifulsoup4",
    "cv2": "opencv-python",
    "docx": "python-docx",
    "pil": "pillow",
    "pillow": "pillow",
    "skimage": "scikit-image",
    "sklearn": "scikit-learn",
    "yaml": "pyyaml",
}


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


def installablePackageNames(names: list[str]) -> list[str]:
    packages: list[str] = []
    seen: set[str] = set()
    for rawName in names:
        packageName = canonicalPackageName(rawName)
        if not packageName:
            continue
        validatePackageName(packageName)
        if isStandardLibraryPackage(packageName):
            continue
        key = packageName.lower().replace("_", "-")
        if key in seen:
            continue
        seen.add(key)
        packages.append(packageName)
    return packages


def canonicalPackageName(name: str) -> str:
    packageName = name.strip()
    normalized = packageName.lower().replace("_", "-")
    return PACKAGE_NAME_ALIASES.get(normalized, packageName)


def isStandardLibraryPackage(name: str) -> bool:
    packageName = _basePackageName(name)
    if not packageName:
        return False
    return packageName.replace("-", "_") in _STDLIB_MODULE_NAMES


def _basePackageName(name: str) -> str:
    match = re.match(r"^[A-Za-z0-9][A-Za-z0-9._-]*", name.strip())
    if match is None:
        return ""
    return match.group(0)


async def installPackage(name: str) -> InstallResult:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _installSync, name)


def _installSync(name: str) -> InstallResult:
    startedAt = time.monotonic()
    try:
        validatePackageName(name)
    except PackageEnvironmentError as error:
        return _packageResult(name, False, error.message, startedAt)
    if isStandardLibraryPackage(name):
        return _packageResult(
            name,
            True,
            f"{name} is included in the Python standard library.",
            startedAt,
            skipped=True,
        )

    try:
        pythonPath = getProjectPythonPath()
    except PackageEnvironmentError as error:
        return _packageResult(name, False, error.message, startedAt)
    environment = _environmentForPython(pythonPath)

    try:
        installedVersion = installedPackageVersion(name, pythonPath=pythonPath)
    except FileNotFoundError:
        return _packageResult(
            name,
            False,
            "Project virtual environment Python executable was not found.",
            startedAt,
            environment=environment,
        )
    except subprocess.TimeoutExpired:
        installedVersion = None
    if installedVersion:
        return _packageResult(
            name,
            True,
            f"{name} is already installed in {_environmentForPython(pythonPath)} ({installedVersion}).",
            startedAt,
            environment=environment,
            skipped=True,
        )

    try:
        result = runUvPip("install", [name], pythonPath=pythonPath, timeoutSeconds=INSTALL_TIMEOUT_SECONDS)
    except FileNotFoundError:
        return _packageResult(name, False, "uv executable was not found.", startedAt, environment=environment)
    except PackageEnvironmentError as error:
        return _packageResult(name, False, error.message, startedAt, environment=environment)
    except subprocess.TimeoutExpired:
        return _packageResult(
            name,
            False,
            f"Installation timed out after {INSTALL_TIMEOUT_SECONDS} seconds while running uv pip install.",
            startedAt,
            environment=environment,
        )
    except OSError as error:
        return _packageResult(name, False, f"uv pip install failed: {error}", startedAt, environment=environment)

    output = (result.stdout + "\n" + result.stderr).strip()
    return _packageResult(name, result.returncode == 0, output, startedAt, environment=environment)


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
    environment = _environmentForPython(pythonPath)

    try:
        result = runUvPip("uninstall", [name, "-y"], pythonPath=pythonPath, timeoutSeconds=UNINSTALL_TIMEOUT_SECONDS)
    except FileNotFoundError:
        return _packageResult(name, False, "uv executable was not found.", startedAt, environment=environment)
    except subprocess.TimeoutExpired:
        return _packageResult(
            name,
            False,
            f"Uninstall timed out after {UNINSTALL_TIMEOUT_SECONDS} seconds.",
            startedAt,
            environment=environment,
        )

    output = (result.stdout + "\n" + result.stderr).strip()
    return _packageResult(name, result.returncode == 0, output, startedAt, environment=environment)


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
    environment: str | None = None,
    skipped: bool = False,
) -> InstallResult:
    return InstallResult(
        package=name,
        success=success,
        message=message,
        environment=environment or _environmentForCurrentPython(),
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
    packageEnvironment = getPackageEnvironment()
    if not packageEnvironment.uvPath:
        raise FileNotFoundError("uv")
    return subprocess.run(
        [packageEnvironment.uvPath, "pip", command, "--python", str(pythonPath), *arguments],
        capture_output=True,
        text=True,
        timeout=timeoutSeconds,
        cwd=PROJECT_ROOT,
        env=_subprocessEnv(packageEnvironment),
    )


def _environmentForCurrentPython() -> str:
    try:
        return getPackageEnvironment().environment
    except PackageEnvironmentError:
        return "package environment"


def _environmentForPython(pythonPath: Path) -> str:
    root = PROJECT_ROOT
    return _environmentLabel(_environmentModeForPython(pythonPath, root))


def _subprocessEnvForPython(pythonPath: Path) -> dict[str, str]:
    uvPath = resolveUvPath(pythonPath=pythonPath)
    return _subprocessEnv(
        PackageEnvironment(
            pythonPath=str(pythonPath),
            uvPath=str(uvPath) if uvPath else None,
            environment=_environmentForPython(pythonPath),
            mode=_environmentModeForPython(pythonPath, PROJECT_ROOT),
            projectRoot=str(PROJECT_ROOT),
            pathEntries=[str(path) for path in _packagePathEntries(pythonPath, uvPath)],
            uvAvailable=uvPath is not None,
        )
    )


def _subprocessEnv(packageEnvironment: PackageEnvironment) -> dict[str, str]:
    env = dict(os.environ)
    if packageEnvironment.pathEntries:
        existing = env.get("PATH", "")
        entries = [*packageEnvironment.pathEntries]
        if existing:
            entries.append(existing)
        env["PATH"] = os.pathsep.join(entries)
    if packageEnvironment.uvPath:
        env["CODARO_UV_EXE"] = packageEnvironment.uvPath
    env["CODARO_PACKAGE_PYTHON"] = packageEnvironment.pythonPath
    env["CODARO_PACKAGE_ENV"] = packageEnvironment.environment
    return env
