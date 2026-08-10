from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import tempfile
from typing import Mapping

from ..runtime.executionPolicy import ExecutionSecurityPolicy
from ..runtime.processSupervisor import ResourceLimits
from .errors import PublicationBuildError
from .localBuilder import prepareLocalPackageEnvironment, verifyLocalPublication
from .publishedRuntime import PublishedAppRuntime


class PublishedLocalRuntime(PublishedAppRuntime):
    publicationTarget = "local"

    def __init__(
        self,
        outputRoot: str | Path,
        *,
        approvedPolicyHash: str,
        environment: Mapping[str, str] | None = None,
    ) -> None:
        verified = verifyLocalPublication(outputRoot)
        runtime = verified.manifest["runtime"]
        if runtime.get("kind") != "local":  # type: ignore[union-attr]
            raise PublicationBuildError("local runtime manifest가 아닙니다.")
        policyHash = str(runtime["policyHash"])  # type: ignore[index]
        if approvedPolicyHash != policyHash:
            raise PublicationBuildError(
                "local publication 실행에는 manifest policyHash와 일치하는 launch-time 승인이 필요합니다."
            )
        expectedPython = runtime["pythonVersion"]  # type: ignore[index]
        actualPython = f"{os.sys.version_info.major}.{os.sys.version_info.minor}"
        if expectedPython != actualPython:
            raise PublicationBuildError(
                f"local Python 버전이 다릅니다. bundle={expectedPython}, runtime={actualPython}"
            )
        secretValues = _resolveSecrets(runtime["secretRefs"], environment or os.environ)  # type: ignore[index]
        self._packageTemporaryRoot = tempfile.TemporaryDirectory(
            prefix=f"codaro-local-package-{verified.bundleHash.removeprefix('sha256-')[:12]}-"
        )
        try:
            packageRoot = prepareLocalPackageEnvironment(
                verified,
                Path(self._packageTemporaryRoot.name).resolve(),
            )
            self._approvalHash = _contentHash({
                "schemaVersion": 1,
                "bundleHash": verified.bundleHash,
                "policyHash": policyHash,
                "permissionScopes": runtime["permissionScopes"],  # type: ignore[index]
            })
            super().__init__(
                verified=verified,
                packageRoot=packageRoot,
                secretValuesByName=secretValues,
            )
        except BaseException:
            self._packageTemporaryRoot.cleanup()
            raise

    @property
    def approvalHash(self) -> str:
        return self._approvalHash

    def _executionPolicy(self, sessionPath: Path) -> ExecutionSecurityPolicy:
        return ExecutionSecurityPolicy.create(
            workspaceRoot=sessionPath,
            permissionScopes=list(self.runtime["permissionScopes"]),  # type: ignore[index]
            policyHash=self.policyHash,
            networkOrigins=list(self.runtime["networkOrigins"]),  # type: ignore[index]
            isolationProfile="local-publication-approved-v1",
            environmentMode="minimal-declared",
            childProcessMode="scope",
            nativeInteropMode="allow",
            destroyMode="interrupt-then-dispose",
        )

    def _resourceLimits(self) -> ResourceLimits:
        maxExecutionSeconds = int(self.runtime["maxExecutionSeconds"])  # type: ignore[index]
        return ResourceLimits(
            maxMemoryMb=int(self.runtime["maxMemoryMb"]),  # type: ignore[index]
            maxExecutionSeconds=maxExecutionSeconds,
            maxChildProcesses=int(self.runtime["maxChildProcesses"]),  # type: ignore[index]
            heartbeatTimeoutSeconds=max(30.0, float(maxExecutionSeconds) * 2),
        )

    def _runtimeEnvironment(self, temporary: Path) -> dict[str, str]:
        inherited = {
            name: value
            for name in ("PATH", "PATHEXT", "SYSTEMROOT", "WINDIR", "COMSPEC")
            if (value := os.environ.get(name))
        }
        return {
            **inherited,
            **self.secretValuesByName,
            "TMP": str(temporary),
            "TEMP": str(temporary),
            "TMPDIR": str(temporary),
            "PYTHONUTF8": "1",
            "PYTHONIOENCODING": "utf-8",
        }

    def _clearEnvironment(self) -> bool:
        return True

    def _closeRuntimeResources(self) -> None:
        self._packageTemporaryRoot.cleanup()


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
            f"local secret reference가 준비되지 않았습니다: {', '.join(missing)}"
        )
    return resolved


def _contentHash(payload: object) -> str:
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return "sha256-" + hashlib.sha256(encoded).hexdigest()
