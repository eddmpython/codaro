from __future__ import annotations

import os
from pathlib import Path
from typing import Mapping

from ..runtime.executionPolicy import ExecutionSecurityPolicy
from ..runtime.processSupervisor import ResourceLimits
from .publishedRuntime import (
    MAX_PUBLISHED_SESSIONS,
    MAX_PUBLISHED_SESSIONS_PER_OWNER,
    PUBLIC_DOCUMENT_PATH,
    PublishedAppRequestError,
    PublishedAppRuntime,
)
from .serverBuilder import prepareServerPackageEnvironment, verifyServerPublication
from .staticBuilder import PublicationBuildError


PublishedServerRequestError = PublishedAppRequestError


class PublishedServerRuntime(PublishedAppRuntime):
    publicationTarget = "server"

    def __init__(
        self,
        outputRoot: str | Path,
        *,
        environment: Mapping[str, str] | None = None,
    ) -> None:
        verified = verifyServerPublication(outputRoot)
        runtime = verified.manifest["runtime"]
        if runtime.get("kind") != "server":  # type: ignore[union-attr]
            raise PublicationBuildError("server runtime manifest가 아닙니다.")
        expectedPython = runtime["pythonVersion"]  # type: ignore[index]
        actualPython = f"{os.sys.version_info.major}.{os.sys.version_info.minor}"
        if expectedPython != actualPython:
            raise PublicationBuildError(
                f"server Python 버전이 다릅니다. bundle={expectedPython}, runtime={actualPython}"
            )
        secretValues = _resolveSecrets(runtime["secretRefs"], environment or os.environ)  # type: ignore[index]
        super().__init__(
            verified=verified,
            packageRoot=prepareServerPackageEnvironment(verified),
            secretValuesByName=secretValues,
        )

    def _executionPolicy(self, sessionPath: Path) -> ExecutionSecurityPolicy:
        return ExecutionSecurityPolicy.createProofEligible(
            workspaceRoot=sessionPath,
            permissionScopes=list(self.runtime["permissionScopes"]),  # type: ignore[index]
            policyHash=self.policyHash,
            networkOrigins=list(self.runtime["networkOrigins"]),  # type: ignore[index]
        )

    def _resourceLimits(self) -> ResourceLimits:
        maxExecutionSeconds = int(self.runtime["maxExecutionSeconds"])  # type: ignore[index]
        return ResourceLimits(
            maxMemoryMb=int(self.runtime["maxMemoryMb"]),  # type: ignore[index]
            maxExecutionSeconds=maxExecutionSeconds,
            maxChildProcesses=0,
            heartbeatTimeoutSeconds=max(30.0, float(maxExecutionSeconds) * 2),
        )

    def _runtimeEnvironment(self, temporary: Path) -> dict[str, str]:
        return {
            **self.secretValuesByName,
            "TMP": str(temporary),
            "TEMP": str(temporary),
            "TMPDIR": str(temporary),
        }

    def _clearEnvironment(self) -> bool:
        return True


def _resolveSecrets(names: list[str], environment: Mapping[str, str]) -> dict[str, str]:
    resolved: dict[str, str] = {}
    missing: list[str] = []
    for name in names:
        value = environment.get(name)
        if not value:
            missing.append(name)
        else:
            resolved[name] = value
    if missing:
        raise PublicationBuildError(
            f"server secret reference가 준비되지 않았습니다: {', '.join(missing)}"
        )
    return resolved
