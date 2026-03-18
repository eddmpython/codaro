from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from ..serverLog import formatLogFields, getServerLogger
from ..system import fileOps, packageOps
from ..system.fileOps import DirectoryListing, MoveRequest, WorkspacePathError, WriteFileRequest
from ..system.packageOps import PackageEnvironmentError
from .appState import ServerState
from .errors import fail
from .requestModels import PackageRequest, PathRequest


def createSystemRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()
    workspaceRoot = state.workspaceRoot

    def failWorkspaceBoundary(error: WorkspacePathError) -> None:
        fail(403, "workspace_path_forbidden", str(error))

    @router.post("/api/fs/list", response_model=DirectoryListing)
    async def apiListDirectory(request: PathRequest) -> DirectoryListing:
        try:
            result = await fileOps.listDirectory(request.path, workspaceRoot=workspaceRoot)
            logger.debug("fs %s", formatLogFields(action="list", path=request.path, entryCount=len(result.entries)))
            return result
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)

    @router.post("/api/fs/read")
    async def apiReadFile(request: PathRequest) -> dict[str, Any]:
        try:
            content = await fileOps.readFile(request.path, workspaceRoot=workspaceRoot)
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
            resultPath = await fileOps.writeFile(
                request.path,
                request.content,
                encoding=request.encoding,
                createDirectories=request.createDirectories,
                workspaceRoot=workspaceRoot,
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
            result = await fileOps.deleteEntry(request.path, workspaceRoot=workspaceRoot)
            logger.debug("fs %s", formatLogFields(action="delete", path=result))
            return {"deleted": result}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)
        except FileNotFoundError:
            fail(404, "file_not_found", "File not found.")

    @router.post("/api/fs/move")
    async def apiMoveFile(request: MoveRequest) -> dict[str, str]:
        try:
            result = await fileOps.moveEntry(request.source, request.destination, workspaceRoot=workspaceRoot)
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
            result = await fileOps.createDirectory(request.path, workspaceRoot=workspaceRoot)
            logger.debug("fs %s", formatLogFields(action="mkdir", path=result))
            return {"path": result}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)

    @router.post("/api/fs/exists")
    async def apiFileExists(request: PathRequest) -> dict[str, bool]:
        try:
            exists = await fileOps.fileExists(request.path, workspaceRoot=workspaceRoot)
            logger.debug("fs %s", formatLogFields(action="exists", path=request.path, exists=exists))
            return {"exists": exists}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)

    @router.get("/api/packages/list")
    async def apiListPackages() -> list[dict[str, str]]:
        try:
            packages = await packageOps.listPackages()
            logger.debug("packages %s", formatLogFields(action="list", packageCount=len(packages)))
            return [package.model_dump() for package in packages]
        except PackageEnvironmentError as error:
            fail(error.statusCode, error.code, error.message)

    @router.post("/api/packages/install")
    async def apiInstallPackage(request: PackageRequest) -> dict[str, Any]:
        result = await packageOps.installPackage(request.name)
        logger.info(
            "packages %s",
            formatLogFields(action="install", name=request.name, success=result.success, message=result.message),
        )
        return result.model_dump()

    @router.post("/api/packages/uninstall")
    async def apiUninstallPackage(request: PackageRequest) -> dict[str, Any]:
        result = await packageOps.uninstallPackage(request.name)
        logger.info(
            "packages %s",
            formatLogFields(action="uninstall", name=request.name, success=result.success, message=result.message),
        )
        return result.model_dump()

    return router
