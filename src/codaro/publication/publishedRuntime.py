from __future__ import annotations

from abc import ABC, abstractmethod
import json
from pathlib import Path
import secrets
import shutil
import tempfile
import threading
import time
from types import SimpleNamespace
from typing import Any, Mapping
import uuid

from ..document.service import loadDocument
from ..kernel.manager import SessionCapacityError, SessionManager
from ..kernel.session import KernelSession
from ..runtime.executionPolicy import ExecutionSecurityPolicy
from ..runtime.processSupervisor import ResourceLimits
from .errors import PublicationBuildError


PUBLIC_DOCUMENT_PATH = "publication/app.py"
MAX_PUBLISHED_SESSIONS = 10
MAX_PUBLISHED_SESSIONS_PER_OWNER = 3
_MAX_UI_VALUE_BYTES = 64 * 1024


class PublishedAppRequestError(ValueError):
    def __init__(self, statusCode: int, code: str, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.code = code
        self.message = message


class PublishedAppRuntime(ABC):
    publicationTarget: str

    def __init__(
        self,
        *,
        verified: Any,
        packageRoot: Path | None,
        secretValuesByName: Mapping[str, str],
    ) -> None:
        self.verified = verified
        self.runtime = verified.manifest["runtime"]
        self.document = loadDocument(str(verified.bundleRoot / verified.manifest["documentPath"]))
        executionBlockIds = [
            block.id
            for block in self.document.blocks
            if block.type in {"code", "automation", "markdown"}
        ]
        if executionBlockIds != verified.manifest["executionBlockIds"]:
            raise PublicationBuildError(
                f"{self.publicationTarget} publication execution projection이 bundle 문서와 다릅니다."
            )
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
        self.packageRoot = packageRoot
        self.secretValuesByName = dict(secretValuesByName)
        self.secretValues = tuple(value for value in self.secretValuesByName.values() if value)
        self._sessionTemporaryRoot = tempfile.TemporaryDirectory(
            prefix=(
                "codaro-published-session-"
                f"{verified.bundleHash.removeprefix('sha256-')[:12]}-"
            )
        )
        self.sessionRoot = Path(self._sessionTemporaryRoot.name).resolve()
        self._closed = False
        self._sessionPaths: dict[str, Path] = {}
        self._sessionOwners: dict[str, str] = {}
        self._ownerLock = threading.RLock()
        self.sessionManager = SessionManager(
            workspaceRoot=self.sessionRoot,
            sessionFactory=self._createSession,
            onSessionDestroyed=self._destroySessionWorkspace,
            maxSessions=MAX_PUBLISHED_SESSIONS,
            rejectWhenFull=True,
        )
        self.state = SimpleNamespace(
            mode="app",
            documentPath=Path(PUBLIC_DOCUMENT_PATH),
            workspaceRoot=verified.bundleRoot,
            studyRoot=Path(),
            webBuildRoot=verified.bundleRoot / "shell",
            sessionManager=self.sessionManager,
        )

    @property
    def bundleHash(self) -> str:
        return self.verified.bundleHash

    @property
    def policyHash(self) -> str:
        return str(self.runtime["policyHash"])

    @property
    def approvalHash(self) -> str | None:
        return None

    def close(self) -> None:
        if self._closed:
            return
        self._closed = True
        try:
            self.sessionManager.destroyAll()
        finally:
            try:
                self._sessionTemporaryRoot.cleanup()
            finally:
                self._closeRuntimeResources()

    def newOwnerToken(self) -> str:
        return secrets.token_urlsafe(32)

    def createOwnedSession(self, ownerToken: str) -> KernelSession:
        with self._ownerLock:
            owned = sum(owner == ownerToken for owner in self._sessionOwners.values())
            if owned >= MAX_PUBLISHED_SESSIONS_PER_OWNER:
                raise PublishedAppRequestError(
                    429,
                    "publication_owner_session_limit",
                    "This browser already has the maximum number of published sessions.",
                )
            try:
                session = self.sessionManager.createSession()
            except SessionCapacityError as error:
                raise PublishedAppRequestError(
                    429,
                    "publication_session_capacity",
                    "Published session capacity is full. Try again after an idle session expires.",
                ) from error
            self._sessionOwners[session.sessionId] = ownerToken
            return session

    def requireOwnedSession(self, sessionId: str, ownerToken: str | None) -> KernelSession:
        session = self.sessionManager.getSession(sessionId)
        if session is None:
            raise PublishedAppRequestError(404, "session_not_found", "Session not found.")
        with self._ownerLock:
            expectedOwner = self._sessionOwners.get(sessionId)
        if not ownerToken or expectedOwner != ownerToken:
            raise PublishedAppRequestError(
                403,
                "publication_session_forbidden",
                "Session belongs to another browser.",
            )
        return session

    def destroyOwnedSession(self, sessionId: str, ownerToken: str | None) -> bool:
        self.requireOwnedSession(sessionId, ownerToken)
        return self.sessionManager.destroySession(sessionId)

    def validateBlocks(self, blocks: list[dict[str, Any]]) -> None:
        normalized = [
            {"id": item.get("id"), "type": item.get("type"), "content": item.get("content")}
            for item in blocks
        ]
        if normalized != self.expectedBlocks:
            raise PublishedAppRequestError(
                409,
                "publication_source_mismatch",
                "실행 요청이 immutable publication source와 다릅니다.",
            )

    def validateBlock(self, blockId: str | None, code: str) -> None:
        expected = self.expectedById.get(str(blockId or ""))
        if expected is None or expected["type"] != "code" or expected["content"] != code:
            raise PublishedAppRequestError(
                409,
                "publication_source_mismatch",
                "실행 요청이 immutable publication source와 다릅니다.",
            )

    def validateUiValue(self, value: Any) -> None:
        try:
            encoded = json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        except (TypeError, ValueError) as error:
            raise PublishedAppRequestError(
                400,
                "publication_ui_value_invalid",
                f"위젯 값이 JSON 값이 아닙니다: {error}",
            ) from error
        if len(encoded) > _MAX_UI_VALUE_BYTES:
            raise PublishedAppRequestError(
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
        requirementsPath = self.verified.bundleRoot / str(self.runtime["requirementsPath"])
        payload = json.loads(requirementsPath.read_text(encoding="utf-8"))
        return [
            {"name": str(item["name"]), "version": _requirementVersion(str(item["requirement"]))}
            for item in payload.get("packages", [])
        ]

    def _createSession(self, requestedWorkingDirectory: str | None) -> KernelSession:
        if requestedWorkingDirectory:
            raise PublicationBuildError("published session은 working directory를 선택할 수 없습니다.")
        sessionId = f"session-{uuid.uuid4().hex}"
        sessionPath = (self.sessionRoot / sessionId).resolve()
        if sessionPath.parent != self.sessionRoot.resolve():
            raise PublicationBuildError("published session 경계가 잘못됐습니다.")
        shutil.copytree(self.verified.bundleRoot / "workspace-template", sessionPath)
        temporary = sessionPath / ".tmp"
        temporary.mkdir()
        session = KernelSession(
            sessionId=sessionId,
            workingDirectory=str(sessionPath),
            workspaceRoot=str(sessionPath),
            executionPolicy=self._executionPolicy(sessionPath),
            resourceLimits=self._resourceLimits(),
            runtimeEnvironment=self._runtimeEnvironment(temporary),
            clearEnvironment=self._clearEnvironment(),
            pythonPaths=[str(self.packageRoot)] if self.packageRoot is not None else [],
        )
        self._sessionPaths[sessionId] = sessionPath
        return session

    def _destroySessionWorkspace(self, session: KernelSession) -> None:
        with self._ownerLock:
            self._sessionOwners.pop(session.sessionId, None)
        path = self._sessionPaths.pop(session.sessionId, None)
        if path is None or not path.exists():
            return
        resolved = path.resolve()
        if resolved.parent != self.sessionRoot.resolve() or not resolved.name.startswith("session-"):
            raise PublicationBuildError("published session 삭제 경계가 잘못됐습니다.")
        lastError: PermissionError | None = None
        for attempt in range(100):
            try:
                shutil.rmtree(resolved)
                return
            except PermissionError as error:
                lastError = error
                time.sleep(min(0.02 * (attempt + 1), 0.1))
        if lastError is not None:
            raise lastError

    @abstractmethod
    def _executionPolicy(self, sessionPath: Path) -> ExecutionSecurityPolicy:
        raise NotImplementedError

    @abstractmethod
    def _resourceLimits(self) -> ResourceLimits:
        raise NotImplementedError

    @abstractmethod
    def _runtimeEnvironment(self, temporary: Path) -> dict[str, str]:
        raise NotImplementedError

    @abstractmethod
    def _clearEnvironment(self) -> bool:
        raise NotImplementedError

    def _closeRuntimeResources(self) -> None:
        return


def _requirementVersion(requirement: str) -> str:
    import re

    match = re.search(r"==\s*([^;\s]+)", requirement)
    return match.group(1) if match else "bundled"
