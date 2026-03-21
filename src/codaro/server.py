from __future__ import annotations

import asyncio
import os
import time
from contextlib import asynccontextmanager
from dataclasses import dataclass
from pathlib import Path

from fastapi import HTTPException
from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .api import (
    ApiError,
    apiErrorHandler,
    createAiRouter,
    createAutomationRouter,
    createBootstrapRouter,
    createCurriculumRouter,
    createDocumentRouter,
    createKernelRouter,
    createServerState,
    createSpaRouter,
    createSystemRouter,
    createWorkspaceRouter,
    httpExceptionHandler,
    unhandledExceptionHandler,
    validationExceptionHandler,
)
from .serverLog import configureServerLogging, formatLogFields, isVerboseLoggingEnabled, setVerboseLogging


PACKAGE_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = PACKAGE_ROOT.parent.parent.parent
EDITOR_ROOT = PROJECT_ROOT / "editor"
STUDY_ROOT = PROJECT_ROOT / "study" / "python"


def resolveWebBuildRoot() -> Path:
    configuredPath = os.environ.get("CODARO_WEB_BUILD_ROOT")
    if configuredPath:
        return Path(configuredPath).expanduser().resolve()
    return PACKAGE_ROOT / "webBuild"


WEB_BUILD_ROOT = resolveWebBuildRoot()


@dataclass(slots=True)
class EditorBuildStatus:
    status: str
    indexPath: Path
    assetsPath: Path
    missingPaths: tuple[Path, ...]


class EditorBuildError(RuntimeError):
    pass


def _displayPath(path: Path) -> str:
    try:
        return path.relative_to(PROJECT_ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def getEditorBuildStatus(webBuildRoot: Path | None = None) -> EditorBuildStatus:
    buildRoot = webBuildRoot or WEB_BUILD_ROOT
    indexPath = buildRoot / "index.html"
    assetsPath = buildRoot / "_app"
    missingPaths = tuple(
        path
        for path, exists in (
            (indexPath, indexPath.is_file()),
            (assetsPath, assetsPath.is_dir()),
        )
        if not exists
    )
    return EditorBuildStatus(
        status="ready" if not missingPaths else "missing",
        indexPath=indexPath,
        assetsPath=assetsPath,
        missingPaths=missingPaths,
    )


def buildEditorInstructions(status: EditorBuildStatus) -> str:
    missing = ", ".join(_displayPath(path) for path in status.missingPaths) or _displayPath(status.indexPath)
    return "\n".join(
        [
            f"Codaro editor build is missing: {missing}",
            "Run:",
            "  cd editor",
            "  npm install",
            "  npm run build",
            "For iterative editor work:",
            "  npm run build:watch",
        ]
    )


def requireEditorBuildReady(
    logger=None,
    webBuildRoot: Path | None = None,
) -> EditorBuildStatus:
    status = getEditorBuildStatus(webBuildRoot)
    if status.status == "ready":
        return status

    if logger is not None:
        logger.error(
            "editor %s",
            formatLogFields(
                status="missing",
                indexPath=_displayPath(status.indexPath),
                assetsPath=_displayPath(status.assetsPath),
            ),
        )
    raise EditorBuildError(buildEditorInstructions(status))


def createServerApp(
    mode: str = "edit",
    documentPath: Path | None = None,
    studyDir: Path | None = None,
    workspaceRoot: Path | None = None,
) -> FastAPI:
    logger = configureServerLogging()
    state = createServerState(
        mode=mode,
        documentPath=documentPath,
        workspaceRoot=workspaceRoot or Path.cwd().resolve(),
        studyRoot=studyDir or STUDY_ROOT,
        packageRoot=PACKAGE_ROOT,
        editorRoot=EDITOR_ROOT,
        webBuildRoot=WEB_BUILD_ROOT,
    )

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        del application
        try:
            await state.workspaceEngine.initialize()
        except Exception as startupError:
            logger.error(
                "lifespan %s",
                formatLogFields(status="startup-failed", error=str(startupError)),
            )
            raise
        logger.info(
            "lifespan %s",
            formatLogFields(
                status="startup",
                mode=state.mode,
                workspaceRoot=state.workspaceRoot,
                studyRoot=state.studyRoot if state.studyRoot.exists() else None,
            ),
        )

        async def reapSessionsPeriodically() -> None:
            from .api.aiRouter import _getConversationManager
            while True:
                await asyncio.sleep(300)
                try:
                    sessionReaped = state.sessionManager.reapExpired()
                    convManager = _getConversationManager()
                    convReaped = convManager.reapExpired()
                    if sessionReaped > 0 or convReaped > 0:
                        logger.info(
                            "reaper %s",
                            formatLogFields(
                                status="reaped",
                                sessions=sessionReaped,
                                conversations=convReaped,
                                remainingSessions=state.sessionManager.sessionCount,
                                remainingConversations=convManager.conversationCount,
                            ),
                        )
                except Exception as reapError:
                    logger.warning("reaper %s", formatLogFields(status="error", error=str(reapError)))

        reapTask = asyncio.create_task(reapSessionsPeriodically())

        yield

        reapTask.cancel()
        try:
            await reapTask
        except asyncio.CancelledError:
            pass
        logger.info(
            "lifespan %s",
            formatLogFields(status="shutdown", activeSessions=state.sessionManager.sessionCount),
        )
        try:
            state.workspaceEngine.dispose()
        except Exception as disposeError:
            logger.error("lifespan %s", formatLogFields(status="dispose-failed", error=str(disposeError)))
        try:
            state.sessionManager.destroyAll()
        except Exception as destroyError:
            logger.error("lifespan %s", formatLogFields(status="destroy-failed", error=str(destroyError)))

    app = FastAPI(title="Codaro", lifespan=lifespan)
    serverPort = os.environ.get("CODARO_PORT", "8765")
    allowedOrigins = [
        f"http://localhost:{serverPort}",
        f"http://127.0.0.1:{serverPort}",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowedOrigins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type", "Authorization"],
    )
    app.add_exception_handler(ApiError, apiErrorHandler)
    app.add_exception_handler(HTTPException, httpExceptionHandler)
    app.add_exception_handler(RequestValidationError, validationExceptionHandler)
    app.add_exception_handler(Exception, unhandledExceptionHandler)

    @app.middleware("http")
    async def disableEditorCache(request: Request, callNext) -> Response:
        startedAt = time.perf_counter()
        response = await callNext(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'wasm-unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob:; "
            "connect-src 'self' ws: wss:; "
            "font-src 'self' data:; "
            "frame-ancestors 'none'"
        )
        if request.url.path == "/" or request.url.path.startswith("/_app"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        if shouldLogRequest(request, response.status_code):
            durationMs = round((time.perf_counter() - startedAt) * 1000, 1)
            logMethod = logger.info
            if response.status_code >= 500:
                logMethod = logger.error
            elif response.status_code >= 400:
                logMethod = logger.warning
            logMethod(
                "request %s",
                formatLogFields(
                    method=request.method,
                    path=buildRequestTarget(request),
                    status=response.status_code,
                    durationMs=durationMs,
                    client=request.client.host if request.client else None,
                ),
            )
        return response

    app.include_router(createAiRouter(state))
    app.include_router(createAutomationRouter(state))
    app.include_router(createBootstrapRouter(state))
    app.include_router(createDocumentRouter(state))
    app.include_router(createKernelRouter(state))
    app.include_router(createSystemRouter(state))
    app.include_router(createWorkspaceRouter(state))
    app.include_router(createCurriculumRouter(state))
    app.include_router(createSpaRouter(state))
    return app


def runServer(
    host: str = "127.0.0.1",
    port: int = 8765,
    mode: str = "edit",
    documentPath: Path | None = None,
    verbose: bool = False,
) -> None:
    logger = setVerboseLogging(verbose)
    editorStatus = requireEditorBuildReady(logger=logger)
    workspaceRoot = Path.cwd().resolve()
    app = createServerApp(mode=mode, documentPath=documentPath, workspaceRoot=workspaceRoot)
    routePath = "/app" if mode == "app" else "/"
    baseUrl = f"http://{host}:{port}{routePath}"
    logger.info(
        "editor %s",
        formatLogFields(
            status=editorStatus.status,
            indexPath=_displayPath(editorStatus.indexPath),
        ),
    )
    logger.info(
        "startup %s",
        formatLogFields(
            action="launch",
            mode=mode,
            url=baseUrl,
            browser="enabled",
            verbose=verbose,
        ),
    )
    logger.info("workspace %s", formatLogFields(root=workspaceRoot, studyRoot=STUDY_ROOT if STUDY_ROOT.exists() else None))
    if documentPath is not None:
        logger.info("document %s", formatLogFields(path=documentPath))
    logger.info(
        "ready %s",
        formatLogFields(
            status="serving",
            url=baseUrl,
            editor=editorStatus.status,
            document=documentPath.name if documentPath else None,
        ),
    )
    if isVerboseLoggingEnabled():
        logger.debug(
            "startup %s",
            formatLogFields(
                host=host,
                port=port,
                route=routePath,
                editorRoot=EDITOR_ROOT,
                webBuildRoot=WEB_BUILD_ROOT,
                workspaceRoot=workspaceRoot,
                editorIndexPath=_displayPath(editorStatus.indexPath),
            ),
        )
    uvicorn.run(app, host=host, port=port, log_level="warning")


def shouldLogRequest(request: Request, statusCode: int) -> bool:
    path = request.url.path
    if path == "/api/health":
        return False
    if statusCode >= 400:
        return True
    if isVerboseLoggingEnabled():
        if path == "/" or path == "/app":
            return True
        if path.startswith("/api/"):
            return True
    return False


def buildRequestTarget(request: Request) -> str:
    path = request.url.path
    query = request.url.query
    if not query:
        return path
    return f"{path}?{query}"
