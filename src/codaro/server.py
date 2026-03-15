from __future__ import annotations

import platform
import subprocess
import sys
import uuid
from pathlib import Path
from typing import Any

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

from .document.models import (
    BlockConfig,
    BootstrapResponse,
    CodaroDocument,
    ExportRequest,
    ExportResponse,
    LoadRequest,
    SaveRequest,
)
from .document.service import createEmptyDocument, exportDocument, loadDocument, saveDocument
from .kernel.manager import SessionManager
from .kernel.protocol import (
    CreateSessionRequest,
    CreateSessionResponse,
    ExecuteRequest,
    ExecutionOutput,
    WsErrorMessage,
    WsResultMessage,
    WsStatusMessage,
)
from .kernel.reactive import executeReactive
from .system import fileOps, packageOps
from .system.fileOps import DirectoryListing, FileContent, MoveRequest, WriteFileRequest
from .system.packageOps import InstallResult, PackageInfo


PACKAGE_ROOT = Path(__file__).resolve().parent
FRONTEND_ROOT = PACKAGE_ROOT.parent.parent.parent / "frontend"
WEB_BUILD_ROOT = PACKAGE_ROOT / "webBuild"


class BlockPatch(BaseModel):
    blockId: str
    content: str | None = None
    type: str | None = None


class InsertBlockRequest(BaseModel):
    path: str
    anchorBlockId: str | None = None
    direction: str = "after"
    type: str = "code"
    content: str = ""


class RemoveBlockRequest(BaseModel):
    path: str
    blockId: str


class MoveBlockRequest(BaseModel):
    path: str
    blockId: str
    offset: int


class UpdateBlockRequest(BaseModel):
    path: str
    blockId: str
    content: str | None = None
    type: str | None = None


class RunBlockRequest(BaseModel):
    sessionId: str
    path: str
    blockId: str


class ReactiveExecuteRequest(BaseModel):
    blockId: str
    blocks: list[dict[str, Any]]


class PackageRequest(BaseModel):
    name: str


class PathRequest(BaseModel):
    path: str


class EnvironmentInfo(BaseModel):
    pythonVersion: str
    platform: str
    cwd: str
    executable: str


def createServerApp(mode: str = "edit", documentPath: Path | None = None) -> FastAPI:
    sessionManager = SessionManager()

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        yield
        sessionManager.destroyAll()

    app = FastAPI(title="Codaro", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/bootstrap")
    def bootstrap(request: Request) -> dict[str, Any]:
        rootPath = request.scope.get("root_path", "")
        return {
            "appMode": mode == "app",
            "documentPath": str(documentPath) if documentPath else None,
            "rootPath": rootPath,
        }

    @app.get("/api/env/info", response_model=EnvironmentInfo)
    def envInfo() -> EnvironmentInfo:
        return EnvironmentInfo(
            pythonVersion=sys.version,
            platform=platform.platform(),
            cwd=str(Path.cwd()),
            executable=sys.executable,
        )

    @app.post("/api/document/load")
    def apiLoadDocument(request: LoadRequest) -> dict[str, Any]:
        path = Path(request.path).expanduser()
        if not path.exists():
            return {
                "path": str(path.resolve()),
                "document": createEmptyDocument(title=path.stem or "Untitled").model_dump(),
                "exists": False,
            }
        document = loadDocument(str(path))
        return {"path": str(path.resolve()), "document": document.model_dump(), "exists": True}

    @app.post("/api/document/save")
    def apiSaveDocument(request: SaveRequest) -> dict[str, str]:
        if not request.path:
            raise HTTPException(status_code=400, detail="Path is required for save.")
        savedPath = saveDocument(request.path, request.document)
        return {"path": str(savedPath)}

    @app.post("/api/document/export", response_model=ExportResponse)
    def apiExportDocument(request: ExportRequest) -> ExportResponse:
        try:
            outputPath = exportDocument(request.path, request.format, request.outputPath)
        except ValueError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error
        return ExportResponse(path=request.path, outputPath=str(outputPath), format=request.format)

    @app.post("/api/document/insert-block")
    def apiInsertBlock(request: InsertBlockRequest) -> dict[str, Any]:
        path = Path(request.path).expanduser().resolve()
        if not path.exists():
            raise HTTPException(status_code=404, detail="Document not found.")
        document = loadDocument(str(path))
        newBlock = BlockConfig(
            id=f"block-{uuid.uuid4().hex[:8]}",
            type=request.type,
            content=request.content,
        )
        if not request.anchorBlockId:
            document.blocks.append(newBlock)
        else:
            anchorIndex = _findBlockIndex(document, request.anchorBlockId)
            insertionIndex = anchorIndex if request.direction == "before" else anchorIndex + 1
            document.blocks.insert(insertionIndex, newBlock)
        saveDocument(str(path), document)
        return {"blockId": newBlock.id, "document": document.model_dump()}

    @app.post("/api/document/remove-block")
    def apiRemoveBlock(request: RemoveBlockRequest) -> dict[str, Any]:
        path = Path(request.path).expanduser().resolve()
        if not path.exists():
            raise HTTPException(status_code=404, detail="Document not found.")
        document = loadDocument(str(path))
        document.blocks = [b for b in document.blocks if b.id != request.blockId]
        saveDocument(str(path), document)
        return {"document": document.model_dump()}

    @app.post("/api/document/move-block")
    def apiMoveBlock(request: MoveBlockRequest) -> dict[str, Any]:
        path = Path(request.path).expanduser().resolve()
        if not path.exists():
            raise HTTPException(status_code=404, detail="Document not found.")
        document = loadDocument(str(path))
        index = _findBlockIndex(document, request.blockId)
        nextIndex = index + request.offset
        if nextIndex < 0 or nextIndex >= len(document.blocks):
            raise HTTPException(status_code=400, detail="Move out of range.")
        block = document.blocks.pop(index)
        document.blocks.insert(nextIndex, block)
        saveDocument(str(path), document)
        return {"document": document.model_dump()}

    @app.post("/api/document/update-block")
    def apiUpdateBlock(request: UpdateBlockRequest) -> dict[str, Any]:
        path = Path(request.path).expanduser().resolve()
        if not path.exists():
            raise HTTPException(status_code=404, detail="Document not found.")
        document = loadDocument(str(path))
        index = _findBlockIndex(document, request.blockId)
        block = document.blocks[index]
        if request.content is not None:
            block = block.model_copy(update={"content": request.content})
        if request.type is not None:
            block = block.model_copy(update={"type": request.type})
        document.blocks[index] = block
        saveDocument(str(path), document)
        return {"block": block.model_dump(), "document": document.model_dump()}

    @app.post("/api/document/run-block")
    async def apiRunBlock(request: RunBlockRequest) -> dict[str, Any]:
        session = sessionManager.getSession(request.sessionId)
        if session is None:
            raise HTTPException(status_code=404, detail="Session not found.")
        path = Path(request.path).expanduser().resolve()
        if not path.exists():
            raise HTTPException(status_code=404, detail="Document not found.")
        document = loadDocument(str(path))
        index = _findBlockIndex(document, request.blockId)
        block = document.blocks[index]
        if block.type != "code":
            raise HTTPException(status_code=400, detail="Block is not a code block.")
        result = await session.execute(block.content, blockId=block.id)
        return {"result": result.model_dump(), "blockId": block.id}

    @app.post("/api/kernel/create", response_model=CreateSessionResponse)
    def apiCreateSession(request: CreateSessionRequest | None = None) -> CreateSessionResponse:
        wd = request.workingDirectory if request else None
        session = sessionManager.createSession(workingDirectory=wd)
        return CreateSessionResponse(sessionId=session.sessionId, status=session.status)

    @app.get("/api/kernel/sessions")
    def apiListSessions() -> list[dict[str, Any]]:
        return [s.model_dump() for s in sessionManager.listSessions()]

    @app.post("/api/kernel/{sessionId}/execute")
    async def apiExecute(sessionId: str, request: ExecuteRequest) -> dict[str, Any]:
        session = sessionManager.getSession(sessionId)
        if session is None:
            raise HTTPException(status_code=404, detail="Session not found.")
        result = await session.execute(request.code, blockId=request.blockId)
        return result.model_dump()

    @app.post("/api/kernel/{sessionId}/interrupt")
    def apiInterrupt(sessionId: str) -> dict[str, bool]:
        session = sessionManager.getSession(sessionId)
        if session is None:
            raise HTTPException(status_code=404, detail="Session not found.")
        success = session.interrupt()
        return {"interrupted": success}

    @app.get("/api/kernel/{sessionId}/variables")
    def apiGetVariables(sessionId: str) -> list[dict[str, Any]]:
        session = sessionManager.getSession(sessionId)
        if session is None:
            raise HTTPException(status_code=404, detail="Session not found.")
        return [v.model_dump() for v in session.getVariables()]

    @app.post("/api/kernel/{sessionId}/reset")
    def apiResetSession(sessionId: str) -> dict[str, str]:
        session = sessionManager.getSession(sessionId)
        if session is None:
            raise HTTPException(status_code=404, detail="Session not found.")
        session.reset()
        return {"status": "reset"}

    @app.delete("/api/kernel/{sessionId}")
    def apiDestroySession(sessionId: str) -> dict[str, bool]:
        success = sessionManager.destroySession(sessionId)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found.")
        return {"destroyed": True}

    @app.post("/api/kernel/{sessionId}/execute-reactive")
    async def apiExecuteReactive(sessionId: str, request: ReactiveExecuteRequest) -> dict[str, Any]:
        session = sessionManager.getSession(sessionId)
        if session is None:
            raise HTTPException(status_code=404, detail="Session not found.")
        results, executionOrder = await executeReactive(session, request.blocks, request.blockId)
        return {
            "results": [r.model_dump() for r in results],
            "executionOrder": executionOrder,
        }

    @app.post("/api/kernel/{sessionId}/remove-cell")
    def apiRemoveCellDefinitions(sessionId: str, request: ExecuteRequest) -> dict[str, str]:
        session = sessionManager.getSession(sessionId)
        if session is None:
            raise HTTPException(status_code=404, detail="Session not found.")
        session.removeCellDefinitions(request.blockId or "")
        return {"status": "removed"}

    @app.websocket("/ws/kernel/{sessionId}")
    async def kernelWebSocket(websocket: WebSocket, sessionId: str) -> None:
        session = sessionManager.getSession(sessionId)
        if session is None:
            await websocket.close(code=4004, reason="Session not found.")
            return

        await websocket.accept()
        await websocket.send_json(
            WsStatusMessage(type="status", engineStatus="ready").model_dump()
        )

        try:
            while True:
                message = await websocket.receive_json()
                messageType = message.get("type", "")

                if messageType == "execute":
                    requestId = message.get("requestId", "")
                    code = message.get("code", "")
                    blockId = message.get("blockId")

                    await websocket.send_json(
                        WsStatusMessage(type="status", engineStatus="busy").model_dump()
                    )

                    result = await session.execute(code, blockId=blockId)

                    await websocket.send_json(
                        WsResultMessage(
                            type="result",
                            requestId=requestId,
                            blockId=blockId,
                            status=result.status,
                            data=result.data,
                            stdout=result.stdout,
                            stderr=result.stderr,
                            variables=result.variables,
                            executionCount=result.executionCount,
                        ).model_dump()
                    )

                    await websocket.send_json(
                        WsStatusMessage(type="status", engineStatus="ready").model_dump()
                    )

                elif messageType == "interrupt":
                    session.interrupt()

                elif messageType == "getVariables":
                    variables = session.getVariables()
                    await websocket.send_json(
                        {"type": "variables", "variables": [v.model_dump() for v in variables]}
                    )

                elif messageType == "executeReactive":
                    requestId = message.get("requestId", "")
                    changedBlockId = message.get("blockId", "")
                    blocks = message.get("blocks", [])

                    await websocket.send_json(
                        WsStatusMessage(type="status", engineStatus="busy").model_dump()
                    )

                    results, executionOrder = await executeReactive(session, blocks, changedBlockId)

                    for result in results:
                        await websocket.send_json(
                            WsResultMessage(
                                type="result",
                                requestId=requestId,
                                blockId=result.blockId,
                                status=result.status,
                                data=result.data,
                                stdout=result.stdout,
                                stderr=result.stderr,
                                variables=result.variables,
                                executionCount=result.executionCount,
                            ).model_dump()
                        )

                    await websocket.send_json({
                        "type": "reactiveComplete",
                        "requestId": requestId,
                        "executionOrder": executionOrder,
                    })

                    await websocket.send_json(
                        WsStatusMessage(type="status", engineStatus="ready").model_dump()
                    )

                elif messageType == "reset":
                    session.reset()
                    await websocket.send_json(
                        WsStatusMessage(type="status", engineStatus="ready").model_dump()
                    )

        except WebSocketDisconnect:
            pass
        except Exception as error:
            try:
                await websocket.send_json(
                    WsErrorMessage(type="error", message=str(error)).model_dump()
                )
            except Exception:
                pass

    @app.post("/api/fs/list", response_model=DirectoryListing)
    async def apiListDirectory(request: PathRequest) -> DirectoryListing:
        return await fileOps.listDirectory(request.path)

    @app.post("/api/fs/read")
    async def apiReadFile(request: PathRequest) -> dict[str, Any]:
        try:
            content = await fileOps.readFile(request.path)
            return content.model_dump()
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="File not found.")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="File is not a text file or has unsupported encoding.")

    @app.post("/api/fs/write")
    async def apiWriteFile(request: WriteFileRequest) -> dict[str, str]:
        resultPath = await fileOps.writeFile(
            request.path,
            request.content,
            encoding=request.encoding,
            createDirectories=request.createDirectories,
        )
        return {"path": resultPath}

    @app.post("/api/fs/delete")
    async def apiDeleteFile(request: PathRequest) -> dict[str, str]:
        try:
            result = await fileOps.deleteEntry(request.path)
            return {"deleted": result}
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="File not found.")

    @app.post("/api/fs/move")
    async def apiMoveFile(request: MoveRequest) -> dict[str, str]:
        try:
            result = await fileOps.moveEntry(request.source, request.destination)
            return {"path": result}
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Source not found.")

    @app.post("/api/fs/mkdir")
    async def apiMkdir(request: PathRequest) -> dict[str, str]:
        result = await fileOps.createDirectory(request.path)
        return {"path": result}

    @app.post("/api/fs/exists")
    async def apiFileExists(request: PathRequest) -> dict[str, bool]:
        exists = await fileOps.fileExists(request.path)
        return {"exists": exists}

    @app.get("/api/packages/list")
    async def apiListPackages() -> list[dict[str, str]]:
        packages = await packageOps.listPackages()
        return [p.model_dump() for p in packages]

    @app.post("/api/packages/install")
    async def apiInstallPackage(request: PackageRequest) -> dict[str, Any]:
        result = await packageOps.installPackage(request.name)
        return result.model_dump()

    @app.post("/api/packages/uninstall")
    async def apiUninstallPackage(request: PackageRequest) -> dict[str, Any]:
        result = await packageOps.uninstallPackage(request.name)
        return result.model_dump()

    if WEB_BUILD_ROOT.exists():
        _indexHtml = (WEB_BUILD_ROOT / "index.html").read_text(encoding="utf-8")

        assetsPath = WEB_BUILD_ROOT / "_app"
        if assetsPath.exists():
            app.mount("/_app", StaticFiles(directory=assetsPath), name="app-assets")

        @app.get("/{fullPath:path}", response_model=None)
        def spa(fullPath: str, request: Request) -> FileResponse | HTMLResponse:
            filePath = WEB_BUILD_ROOT / fullPath
            if fullPath and filePath.exists() and filePath.is_file():
                return FileResponse(filePath)
            rootPath = request.scope.get("root_path", "")
            injected = _indexHtml.replace(
                "</head>",
                f'<meta name="codaro-base" content="{rootPath}">\n  </head>',
            )
            return HTMLResponse(injected)
    else:

        @app.get("/{fullPath:path}")
        def missingBuild(fullPath: str) -> dict[str, str]:
            return {
                "detail": "Codaro frontend build not found. Run `npm install` and `npm run build` in frontend/."
            }

    return app


def _findBlockIndex(document: CodaroDocument, blockId: str) -> int:
    for index, block in enumerate(document.blocks):
        if block.id == blockId:
            return index
    raise HTTPException(status_code=404, detail=f"Block {blockId} not found.")


def runServer(
    host: str = "127.0.0.1",
    port: int = 8765,
    mode: str = "edit",
    documentPath: Path | None = None,
) -> None:
    _ensureFrontendBuild()
    app = createServerApp(mode=mode, documentPath=documentPath)
    uvicorn.run(app, host=host, port=port, log_level="warning")


def _ensureFrontendBuild() -> None:
    if WEB_BUILD_ROOT.exists():
        return
    packageJson = FRONTEND_ROOT / "package.json"
    if not packageJson.exists():
        return
    subprocess.run(["npm", "install"], cwd=FRONTEND_ROOT, check=True)
    subprocess.run(["npm", "run", "build"], cwd=FRONTEND_ROOT, check=True)
