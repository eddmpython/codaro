from __future__ import annotations

import asyncio
import subprocess
import sys
from importlib.metadata import distributions

from pydantic import BaseModel


class PackageInfo(BaseModel):
    name: str
    version: str


class InstallResult(BaseModel):
    package: str
    success: bool
    message: str


async def listPackages() -> list[PackageInfo]:
    packages: list[PackageInfo] = []
    seen: set[str] = set()
    for dist in distributions():
        name = dist.metadata["Name"]
        if name in seen:
            continue
        seen.add(name)
        packages.append(
            PackageInfo(
                name=name,
                version=dist.metadata["Version"] or "unknown",
            )
        )
    return sorted(packages, key=lambda p: p.name.lower())


async def installPackage(name: str) -> InstallResult:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _installSync, name)


def _installSync(name: str) -> InstallResult:
    try:
        result = subprocess.run(
            ["uv", "pip", "install", name],
            capture_output=True,
            text=True,
            timeout=180,
        )
    except FileNotFoundError:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", name],
            capture_output=True,
            text=True,
            timeout=180,
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
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _uninstallSync, name)


def _uninstallSync(name: str) -> InstallResult:
    try:
        result = subprocess.run(
            ["uv", "pip", "uninstall", name],
            capture_output=True,
            text=True,
            timeout=60,
        )
    except FileNotFoundError:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "uninstall", name, "-y"],
            capture_output=True,
            text=True,
            timeout=60,
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
