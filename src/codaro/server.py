from __future__ import annotations

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
FRONTEND_ROOT = PROJECT_ROOT / "frontend"
CONTENT_ROOT = PROJECT_ROOT / "content" / "studyPython" / "content"


def resolveWebBuildRoot() -> Path:
    configuredPath = os.environ.get("CODARO_WEB_BUILD_ROOT")
    if configuredPath:
        return Path(configuredPath).expanduser().resolve()
    return PACKAGE_ROOT / "webBuild"


WEB_BUILD_ROOT = resolveWebBuildRoot()


@dataclass(slots=True)
class FrontendBuildStatus:
    status: str
    indexPath: Path
    assetsPath: Path
    missingPaths: tuple[Path, ...]


class FrontendBuildError(RuntimeError):
    pass


def _displayPath(path: Path) -> str:
    try:
        return path.relative_to(PROJECT_ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def getFrontendBuildStatus(webBuildRoot: Path | None = None) -> FrontendBuildStatus:
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
    return FrontendBuildStatus(
        status="ready" if not missingPaths else "missing",
        indexPath=indexPath,
        assetsPath=assetsPath,
        missingPaths=missingPaths,
    )


def buildFrontendInstructions(status: FrontendBuildStatus) -> str:
    missing = ", ".join(_displayPath(path) for path in status.missingPaths) or _displayPath(status.indexPath)
    return "\n".join(
        [
            f"Codaro frontend build is missing: {missing}",
            "Run:",
            "  cd frontend",
            "  npm install",
            "  npm run build",
            "For iterative frontend work:",
            "  npm run build:watch",
        ]
    )


def requireFrontendBuildReady(
    logger=None,
    webBuildRoot: Path | None = None,
) -> FrontendBuildStatus:
    status = getFrontendBuildStatus(webBuildRoot)
    if status.status == "ready":
        return status

    if logger is not None:
        logger.error(
            "frontend %s",
            formatLogFields(
                status="missing",
                indexPath=_displayPath(status.indexPath),
                assetsPath=_displayPath(status.assetsPath),
            ),
        )
    raise FrontendBuildError(buildFrontendInstructions(status))


def createServerApp(
    mode: str = "edit",
    documentPath: Path | None = None,
    contentDir: Path | None = None,
    workspaceRoot: Path | None = None,
) -> FastAPI:
    logger = configureServerLogging()
    state = createServerState(
        mode=mode,
        documentPath=documentPath,
        workspaceRoot=workspaceRoot or Path.cwd().resolve(),
        contentRoot=contentDir or CONTENT_ROOT,
        packageRoot=PACKAGE_ROOT,
        frontendRoot=FRONTEND_ROOT,
        webBuildRoot=WEB_BUILD_ROOT,
    )

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        del application
        await state.workspaceEngine.initialize()
        logger.info(
            "lifespan %s",
            formatLogFields(
                status="startup",
                mode=state.mode,
                workspaceRoot=state.workspaceRoot,
                contentRoot=state.contentRoot if state.contentRoot.exists() else None,
            ),
        )
        yield
        logger.info(
            "lifespan %s",
            formatLogFields(status="shutdown", activeSessions=state.sessionManager.sessionCount),
        )
        state.workspaceEngine.dispose()
        state.sessionManager.destroyAll()

    app = FastAPI(title="Codaro", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_exception_handler(ApiError, apiErrorHandler)
    app.add_exception_handler(HTTPException, httpExceptionHandler)
    app.add_exception_handler(RequestValidationError, validationExceptionHandler)
    app.add_exception_handler(Exception, unhandledExceptionHandler)

    @app.middleware("http")
    async def disableFrontendCache(request: Request, callNext) -> Response:
        startedAt = time.perf_counter()
        response = await callNext(request)
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
    frontendStatus = requireFrontendBuildReady(logger=logger)
    workspaceRoot = Path.cwd().resolve()
    app = createServerApp(mode=mode, documentPath=documentPath, workspaceRoot=workspaceRoot)
    routePath = "/app" if mode == "app" else "/"
    baseUrl = f"http://{host}:{port}{routePath}"
    logger.info(
        "frontend %s",
        formatLogFields(
            status=frontendStatus.status,
            indexPath=_displayPath(frontendStatus.indexPath),
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
    logger.info("workspace %s", formatLogFields(root=workspaceRoot, contentRoot=CONTENT_ROOT if CONTENT_ROOT.exists() else None))
    if documentPath is not None:
        logger.info("document %s", formatLogFields(path=documentPath))
    logger.info(
        "ready %s",
        formatLogFields(
            status="serving",
            url=baseUrl,
            frontend=frontendStatus.status,
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
                frontendRoot=FRONTEND_ROOT,
                webBuildRoot=WEB_BUILD_ROOT,
                workspaceRoot=workspaceRoot,
                frontendIndexPath=_displayPath(frontendStatus.indexPath),
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
