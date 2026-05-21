from __future__ import annotations

import os
import shutil
import sys
from pathlib import Path
from typing import Any

from fastapi import APIRouter

from ..ai.profile import getProfileManager
from ..serverLog import formatLogFields, getServerLogger
from ..system import packageOps
from ..system.diagnosticSummary import (
    DiagnosticItem,
    buildDiagnosticSummary,
    frontendDiagnosticItem,
    packageDiagnosticItem,
    providerDiagnosticItem,
    runtimeDiagnosticItem,
)
from ..system.fileOps import DirectoryListing, MoveRequest, WorkspacePathError, WriteFileRequest
from ..system.packageOps import PackageEnvironmentError
from .appState import ServerState
from .errors import fail
from .requestModels import PackageRequest, PathRequest


def createSystemRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()
    workspaceEngine = state.workspaceEngine

    def failWorkspaceBoundary(error: WorkspacePathError) -> None:
        fail(403, "workspace_path_forbidden", str(error))

    @router.post("/api/fs/list", response_model=DirectoryListing)
    async def apiListDirectory(request: PathRequest) -> DirectoryListing:
        try:
            result = await workspaceEngine.getFiles(request.path)
            logger.debug("fs %s", formatLogFields(action="list", path=request.path, entryCount=len(result.entries)))
            return result
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)

    @router.post("/api/fs/read")
    async def apiReadFile(request: PathRequest) -> dict[str, Any]:
        try:
            content = await workspaceEngine.readFile(request.path)
            logger.debug(
                "fs %s",
                formatLogFields(action="read", path=request.path, contentLength=len(content.content)),
            )
            return content.model_dump()
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)
        except FileNotFoundError:
            fail(404, "file_not_found", "File not found.")
        except UnicodeDecodeError:
            fail(400, "file_not_text", "File is not a text file or has unsupported encoding.")

    @router.post("/api/fs/write")
    async def apiWriteFile(request: WriteFileRequest) -> dict[str, str]:
        try:
            resultPath = await workspaceEngine.writeFile(
                request.path,
                request.content,
                encoding=request.encoding,
                createDirectories=request.createDirectories,
            )
            logger.debug(
                "fs %s",
                formatLogFields(
                    action="write",
                    path=resultPath,
                    contentLength=len(request.content),
                    createDirectories=request.createDirectories,
                ),
            )
            return {"path": resultPath}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)

    @router.post("/api/fs/delete")
    async def apiDeleteFile(request: PathRequest) -> dict[str, str]:
        try:
            result = await workspaceEngine.deleteEntry(request.path)
            logger.debug("fs %s", formatLogFields(action="delete", path=result))
            return {"deleted": result}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)
        except FileNotFoundError:
            fail(404, "file_not_found", "File not found.")

    @router.post("/api/fs/move")
    async def apiMoveFile(request: MoveRequest) -> dict[str, str]:
        try:
            result = await workspaceEngine.moveEntry(request.source, request.destination)
            logger.debug(
                "fs %s",
                formatLogFields(action="move", source=request.source, destination=request.destination, path=result),
            )
            return {"path": result}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)
        except FileNotFoundError:
            fail(404, "file_source_not_found", "Source not found.")

    @router.post("/api/fs/mkdir")
    async def apiMkdir(request: PathRequest) -> dict[str, str]:
        try:
            result = await workspaceEngine.createDirectory(request.path)
            logger.debug("fs %s", formatLogFields(action="mkdir", path=result))
            return {"path": result}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)

    @router.post("/api/fs/exists")
    async def apiFileExists(request: PathRequest) -> dict[str, bool]:
        try:
            exists = await workspaceEngine.fileExists(request.path)
            logger.debug("fs %s", formatLogFields(action="exists", path=request.path, exists=exists))
            return {"exists": exists}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)

    @router.get("/api/packages/list")
    async def apiListPackages() -> list[dict[str, str]]:
        try:
            packages = await workspaceEngine.listPackages()
            logger.debug("packages %s", formatLogFields(action="list", packageCount=len(packages)))
            return [package.model_dump() for package in packages]
        except PackageEnvironmentError as error:
            fail(error.statusCode, error.code, error.message)

    @router.post("/api/packages/install")
    async def apiInstallPackage(request: PackageRequest) -> dict[str, Any]:
        result = await workspaceEngine.installPackage(request.name)
        logger.info(
            "packages %s",
            formatLogFields(action="install", name=request.name, success=result.success, message=result.message),
        )
        return result.model_dump()

    @router.post("/api/packages/uninstall")
    async def apiUninstallPackage(request: PackageRequest) -> dict[str, Any]:
        result = await workspaceEngine.uninstallPackage(request.name)
        logger.info(
            "packages %s",
            formatLogFields(action="uninstall", name=request.name, success=result.success, message=result.message),
        )
        return result.model_dump()

    @router.get("/api/system/health")
    async def apiSystemHealth() -> dict[str, Any]:
        processMemoryMb: float | None = None
        try:
            import resource as _resource
            processMemoryMb = round(_resource.getrusage(_resource.RUSAGE_SELF).ru_maxrss / 1024, 1)
        except (ImportError, AttributeError):
            pass
        if processMemoryMb is None:
            try:
                import psutil
                processMemoryMb = round(psutil.Process(os.getpid()).memory_info().rss / (1024 * 1024), 1)
            except (ImportError, AttributeError):
                pass

        from ..ai.conversation import getConversationManager

        convManager = getConversationManager()

        return {
            "status": "ok",
            "python": sys.version,
            "pid": os.getpid(),
            "processMemoryMb": processMemoryMb,
            "sessions": {
                "active": state.sessionManager.sessionCount,
            },
            "conversations": {
                "active": convManager.conversationCount,
            },
            "engine": {
                "status": workspaceEngine.status,
                "executionCount": workspaceEngine.executionCount,
                "variableCount": len(workspaceEngine.getVariables()),
            },
        }

    @router.get("/api/system/diagnostics")
    async def apiSystemDiagnostics() -> dict[str, Any]:
        return buildLocalDiagnosticSummary(state)

    return router


def buildLocalDiagnosticSummary(state: ServerState) -> dict[str, Any]:
    items: list[DiagnosticItem] = []
    items.extend(_providerDiagnostics(getProfileManager().serialize()))
    items.extend(_packageDiagnostics())
    items.extend(_runtimeDiagnostics(state))
    items.extend(_frontendDiagnostics(state.webBuildRoot))
    return buildDiagnosticSummary(items)


def _providerDiagnostics(profile: dict[str, Any]) -> list[DiagnosticItem]:
    if profile.get("ready") is True:
        return []

    provider = str(profile.get("activeProvider") or profile.get("defaultProvider") or "provider")
    catalog = _catalogById(profile.get("catalog"))
    providers = profile.get("providers") if isinstance(profile.get("providers"), dict) else {}
    runtime = providers.get(provider) if isinstance(providers.get(provider), dict) else {}
    spec = catalog.get(provider, {})
    authKind = str(spec.get("authKind") or "")

    action = "connect-provider"
    message = "Provider가 아직 실제 응답 사용 상태가 아닙니다."
    if authKind == "api_key":
        action = "configure-api-key"
        if provider == "custom" and not runtime.get("baseUrl"):
            action = "configure-base-url"
            message = "Custom provider Base URL이 필요합니다."
        else:
            message = "Provider API 키가 필요합니다."
    elif authKind == "oauth":
        message = "브라우저 로그인 후 실제 provider 응답을 사용할 수 있습니다."
    elif authKind == "none":
        action = "check-provider"
        message = "Provider 상태를 다시 확인해야 합니다."

    return [
        providerDiagnosticItem(
            code="provider_not_connected",
            message=message,
            action=action,
            metadata={
                "provider": provider,
                "authKind": authKind or None,
                "secretConfigured": runtime.get("secretConfigured"),
            },
        )
    ]


def _catalogById(catalog: Any) -> dict[str, dict[str, Any]]:
    if isinstance(catalog, dict):
        return {
            str(key): value
            for key, value in catalog.items()
            if isinstance(value, dict)
        }
    if isinstance(catalog, list):
        return {
            str(item.get("id")): item
            for item in catalog
            if isinstance(item, dict) and item.get("id")
        }
    return {}


def _packageDiagnostics() -> list[DiagnosticItem]:
    items: list[DiagnosticItem] = []
    if shutil.which("uv") is None:
        items.append(
            packageDiagnosticItem(
                code="uv-missing",
                message="uv 실행 파일을 찾지 못했습니다.",
                action="install-uv",
            )
        )
    try:
        packageOps.getProjectPythonPath()
    except PackageEnvironmentError as error:
        items.append(
            packageDiagnosticItem(
                code=error.code,
                message=error.message,
                action="create-project-venv",
                detail=error.message,
            )
        )
    return items


def _runtimeDiagnostics(state: ServerState) -> list[DiagnosticItem]:
    status = str(getattr(state.workspaceEngine, "status", "unknown"))
    if status in {"idle", "busy", "ready"}:
        return []
    return [
        runtimeDiagnosticItem(
            code="runtime-status-unhealthy",
            message="Runtime engine 상태를 확인해야 합니다.",
            action="restart-runtime",
            metadata={"status": status, "activeSessions": state.sessionManager.sessionCount},
        )
    ]


def _frontendDiagnostics(webBuildRoot: Path) -> list[DiagnosticItem]:
    missing = [
        path
        for path in (webBuildRoot / "index.html", webBuildRoot / "_app")
        if not (path.is_file() if path.name == "index.html" else path.is_dir())
    ]
    if not missing:
        return []
    return [
        frontendDiagnosticItem(
            code="editor-build-missing",
            message="Editor build 산출물이 없습니다.",
            action="build-editor",
            detail=", ".join(path.as_posix() for path in missing),
            metadata={"webBuildRoot": webBuildRoot.as_posix(), "missing": [path.as_posix() for path in missing]},
        )
    ]
