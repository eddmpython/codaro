from __future__ import annotations

import json
import os
from pathlib import Path
import re
import shutil
import time
from types import SimpleNamespace
from typing import Any, Mapping
import uuid

from ..document.service import loadDocument
from ..kernel.manager import SessionManager
from ..kernel.session import KernelSession
from ..runtime.executionPolicy import ExecutionSecurityPolicy
from ..runtime.processSupervisor import ResourceLimits
from .serverBuilder import prepareServerPackageEnvironment, verifyServerPublication
from .staticBuilder import PublicationBuildError


PUBLIC_DOCUMENT_PATH = "publication/app.py"
_MAX_UI_VALUE_BYTES = 64 * 1024


class PublishedServerRequestError(ValueError):
    def __init__(self, statusCode: int, code: str, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.code = code
        self.message = message


class PublishedServerRuntime:
    def __init__(
        self,
        outputRoot: str | Path,
        *,
        environment: Mapping[str, str] | None = None,
    ) -> None:
        self.verified = verifyServerPublication(outputRoot)
        runtime = self.verified.manifest["runtime"]
        if runtime.get("kind") != "server":  # type: ignore[union-attr]
            raise PublicationBuildError("server runtime manifest가 아닙니다.")
        self.runtime = runtime
        expectedPython = runtime["pythonVersion"]  # type: ignore[index]
        actualPython = f"{os.sys.version_info.major}.{os.sys.version_info.minor}"
        if expectedPython != actualPython:
            raise PublicationBuildError(f"server Python 버전이 다릅니다. bundle={expectedPython}, runtime={actualPython}")
        self.document = loadDocument(str(self.verified.bundleRoot / self.verified.manifest["documentPath"]))
        self.expectedBlocks = [
            {
                "id": block.id,
                "type": "code" if block.type in {"code", "automation"} else "markdown",
                "content": block.content,
            }
            for block in self.document.blocks
            if block.type in {"code", "automation", "markdown"}
        ]
        self.expectedById = {block["id"]: block for block in self.expectedBlocks}
        self.secretValuesByName = self._resolveSecrets(environment or os.environ)
        self.secretValues = tuple(value for value in self.secretValuesByName.values() if value)
        self.packageRoot = prepareServerPackageEnvironment(self.verified)
        self.sessionRoot = (
            self.verified.outputRoot
            / "runtime"
            / "sessions"
            / self.verified.bundleHash.removeprefix("sha256-")
        )
        self.sessionRoot.mkdir(parents=True, exist_ok=True)
        self._sessionPaths: dict[str, Path] = {}
        self.sessionManager = SessionManager(
            workspaceRoot=self.sessionRoot,
            sessionFactory=self._createSession,
            onSessionDestroyed=self._destroySessionWorkspace,
        )
        self.state = SimpleNamespace(
            mode="app",
            documentPath=Path(PUBLIC_DOCUMENT_PATH),
            workspaceRoot=self.verified.bundleRoot,
            studyRoot=Path(),
            webBuildRoot=self.verified.bundleRoot / "shell",
            sessionManager=self.sessionManager,
        )

    @property
    def bundleHash(self) -> str:
        return self.verified.bundleHash

    @property
    def policyHash(self) -> str:
        return str(self.runtime["policyHash"])  # type: ignore[index]

    def close(self) -> None:
        self.sessionManager.destroyAll()

    def validateBlocks(self, blocks: list[dict[str, Any]]) -> None:
        normalized = [
            {"id": item.get("id"), "type": item.get("type"), "content": item.get("content")}
            for item in blocks
        ]
        if normalized != self.expectedBlocks:
            raise PublishedServerRequestError(
                409,
                "publication_source_mismatch",
                "실행 요청이 immutable publication source와 다릅니다.",
            )

    def validateBlock(self, blockId: str | None, code: str) -> None:
        expected = self.expectedById.get(str(blockId or ""))
        if expected is None or expected["type"] != "code" or expected["content"] != code:
            raise PublishedServerRequestError(
                409,
                "publication_source_mismatch",
                "실행 요청이 immutable publication source와 다릅니다.",
            )

    def validateUiValue(self, value: Any) -> None:
        try:
            encoded = json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        except (TypeError, ValueError) as error:
            raise PublishedServerRequestError(
                400,
                "publication_ui_value_invalid",
                f"위젯 값이 JSON 값이 아닙니다: {error}",
            ) from error
        if len(encoded) > _MAX_UI_VALUE_BYTES:
            raise PublishedServerRequestError(
                413,
                "publication_ui_value_too_large",
                "위젯 값이 64 KiB 제한을 넘었습니다.",
            )

    def redact(self, value: Any) -> Any:
        if isinstance(value, str):
            for secret in self.secretValues:
                value = value.replace(secret, "[redacted]")
            return value
        if isinstance(value, dict):
            return {str(key): self.redact(item) for key, item in value.items()}
        if isinstance(value, list):
            return [self.redact(item) for item in value]
        if isinstance(value, tuple):
            return [self.redact(item) for item in value]
        return value

    def packagePayload(self) -> list[dict[str, str]]:
        requirementsPath = self.verified.bundleRoot / str(self.runtime["requirementsPath"])  # type: ignore[index]
        payload = json.loads(requirementsPath.read_text(encoding="utf-8"))
        return [
            {"name": str(item["name"]), "version": _requirementVersion(str(item["requirement"]))}
            for item in payload.get("packages", [])
        ]

    def _resolveSecrets(self, environment: Mapping[str, str]) -> dict[str, str]:
        resolved: dict[str, str] = {}
        missing: list[str] = []
        for name in self.runtime["secretRefs"]:  # type: ignore[index]
            value = environment.get(name)
            if not value:
                missing.append(name)
            else:
                resolved[name] = value
        if missing:
            raise PublicationBuildError(f"server secret reference가 준비되지 않았습니다: {', '.join(missing)}")
        return resolved

    def _createSession(self, requestedWorkingDirectory: str | None) -> KernelSession:
        if requestedWorkingDirectory:
            raise PublicationBuildError("published server session은 working directory를 선택할 수 없습니다.")
        sessionId = f"session-{uuid.uuid4().hex}"
        sessionPath = (self.sessionRoot / sessionId).resolve()
        if sessionPath.parent != self.sessionRoot.resolve():
            raise PublicationBuildError("published session 경계가 잘못됐습니다.")
        templateRoot = self.verified.bundleRoot / "workspace-template"
        shutil.copytree(templateRoot, sessionPath)
        temporary = sessionPath / ".tmp"
        temporary.mkdir()
        policy = ExecutionSecurityPolicy.create(
            workspaceRoot=sessionPath,
            permissionScopes=list(self.runtime["permissionScopes"]),  # type: ignore[index]
            policyHash=self.policyHash,
            networkOrigins=list(self.runtime["networkOrigins"]),  # type: ignore[index]
        )
        limits = ResourceLimits(
            maxMemoryMb=int(self.runtime["maxMemoryMb"]),  # type: ignore[index]
            maxExecutionSeconds=int(self.runtime["maxExecutionSeconds"]),  # type: ignore[index]
            maxChildProcesses=0,
            heartbeatTimeoutSeconds=max(30.0, float(self.runtime["maxExecutionSeconds"]) * 2),  # type: ignore[index]
        )
        session = KernelSession(
            sessionId=sessionId,
            workingDirectory=str(sessionPath),
            workspaceRoot=str(sessionPath),
            executionPolicy=policy,
            resourceLimits=limits,
            runtimeEnvironment={
                **self.secretValuesByName,
                "TMP": str(temporary),
                "TEMP": str(temporary),
                "TMPDIR": str(temporary),
            },
            clearEnvironment=True,
            pythonPaths=[str(self.packageRoot)] if self.packageRoot is not None else [],
        )
        self._sessionPaths[sessionId] = sessionPath
        return session

    def _destroySessionWorkspace(self, session: KernelSession) -> None:
        path = self._sessionPaths.pop(session.sessionId, None)
        if path is None or not path.exists():
            return
        resolved = path.resolve()
        if resolved.parent != self.sessionRoot.resolve() or not resolved.name.startswith("session-"):
            raise PublicationBuildError("published session 삭제 경계가 잘못됐습니다.")
        lastError: PermissionError | None = None
        for _ in range(20):
            try:
                shutil.rmtree(resolved)
                return
            except PermissionError as error:
                lastError = error
                time.sleep(0.05)
        if lastError is not None:
            raise lastError


def _requirementVersion(requirement: str) -> str:
    match = re.search(r"==\s*([^;\s]+)", requirement)
    return match.group(1) if match else "bundled"
