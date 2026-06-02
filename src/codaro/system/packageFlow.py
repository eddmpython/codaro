from __future__ import annotations

from typing import Any

from .packageOps import PackageEnvironmentError, buildPackageInstallCommand, getPackageEnvironment


def buildPackageEnvironmentPayload() -> dict[str, Any]:
    return getPackageEnvironment().model_dump()


def buildPackageInstallCommandPayload(names: list[str]) -> dict[str, Any]:
    return buildPackageInstallCommand(names).model_dump()
