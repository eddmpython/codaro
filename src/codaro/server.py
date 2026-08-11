from __future__ import annotations

import asyncio
import hashlib
import json
import mimetypes
import os
import time
from contextlib import asynccontextmanager
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Mapping
from urllib.parse import urlparse

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
    createExtensionRouter,
    createKernelRouter,
    createPublicationRouter,
    createShareRouter,
    createSpaRouter,
    createSystemRouter,
    createTerminalRouter,
    createWorkspaceRouter,
    httpExceptionHandler,
    unhandledExceptionHandler,
    validationExceptionHandler,
)
from .automation.session import getSessionRegistry
from .serverLog import configureServerLogging, formatLogFields, isVerboseLoggingEnabled, setVerboseLogging
from .system.serverState import createServerState


PACKAGE_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = PACKAGE_ROOT.parent.parent
EDITOR_ROOT = PROJECT_ROOT / "editor"


def resolveCurriculaRoot() -> Path:
    """base curriculum 콘텐츠 위치를 해석한다. 개발 체크아웃에서는 repo 루트 curricula/python(SSOT)을
    우선한다. 릴리즈 스테이징이 만드는 로컬 번들 사본(codaro/curricula)이 작업트리에 남아 있어도
    낡은 사본이 원본을 가리면 안 된다. 배포 wheel에는 repo 루트 경로가 없으므로 패키지 번들이 잡힌다.
    (Bundle 전략: base install 기본 포함 = base curriculum)"""
    configured = os.environ.get("CODARO_STUDY_DIR")
    if configured:
        return Path(configured).expanduser().resolve()
    devRoot = PROJECT_ROOT / "curricula" / "python"
    if devRoot.exists():
        return devRoot
    return PACKAGE_ROOT / "curricula" / "python"


CURRICULA_ROOT = resolveCurriculaRoot()


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
    manifestPath: Path
    missingPaths: tuple[Path, ...]
    integrityErrors: tuple[str, ...]


class EditorBuildError(RuntimeError):
    pass


def createServerEventLoop() -> asyncio.AbstractEventLoop:
    if os.name == "nt":
        return asyncio.SelectorEventLoop()
    return asyncio.new_event_loop()


def _displayPath(path: Path) -> str:
    try:
        return path.relative_to(PROJECT_ROOT).as_posix()
    except ValueError:
        return path.as_posix()


class _EditorReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        del tag
        for name, value in attrs:
            if name in {"href", "src"} and value and _isLocalEditorReference(value):
                self.references.append(value)


def _isLocalEditorReference(value: str) -> bool:
    parsed = urlparse(value)
    return not parsed.scheme and not parsed.netloc and not value.startswith(("//", "#"))


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _expectedContentType(path: Path) -> str:
    overrides = {
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".json": "application/json",
        ".webmanifest": "application/manifest+json",
    }
    return overrides.get(path.suffix.lower()) or mimetypes.guess_type(path.name)[0] or "application/octet-stream"


def _editorBuildIntegrityErrors(buildRoot: Path, indexPath: Path, manifestPath: Path) -> tuple[str, ...]:
    errors: list[str] = []
    try:
        payload = json.loads(manifestPath.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        return (f"build-generation.json을 읽을 수 없습니다: {error}",)
    if payload.get("version") != 1:
        errors.append("build-generation.json version은 1이어야 합니다.")
    expectedIndexHash = payload.get("indexSha256")
    if not isinstance(expectedIndexHash, str) or _sha256(indexPath) != expectedIndexHash:
        errors.append("index.html이 기록된 build generation과 일치하지 않습니다.")

    references = payload.get("references")
    if not isinstance(references, list):
        return (*errors, "build-generation.json references가 배열이 아닙니다.")
    parser = _EditorReferenceParser()
    try:
        parser.feed(indexPath.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError) as error:
        return (*errors, f"index.html을 읽을 수 없습니다: {error}")
    manifestUrls = {
        entry.get("url")
        for entry in references
        if isinstance(entry, dict) and isinstance(entry.get("url"), str)
    }
    if manifestUrls != set(parser.references):
        errors.append("index.html의 로컬 참조가 build generation 목록과 일치하지 않습니다.")

    resolvedRoot = buildRoot.resolve()
    for entry in references:
        if not isinstance(entry, dict):
            errors.append("build generation 참조 항목이 객체가 아닙니다.")
            continue
        relativePath = entry.get("path")
        if not isinstance(relativePath, str) or not relativePath:
            errors.append("build generation 참조 경로가 비어 있습니다.")
            continue
        target = (resolvedRoot / relativePath).resolve()
        try:
            target.relative_to(resolvedRoot)
        except ValueError:
            errors.append(f"빌드 루트 밖의 참조입니다: {relativePath}")
            continue
        if not target.is_file():
            errors.append(f"index.html 참조 파일이 없습니다: {relativePath}")
            continue
        if entry.get("sha256") != _sha256(target):
            errors.append(f"참조 파일 해시가 일치하지 않습니다: {relativePath}")
        expectedContentType = _expectedContentType(target)
        if entry.get("contentType") != expectedContentType:
            errors.append(f"참조 파일 content type이 일치하지 않습니다: {relativePath}")
    return tuple(errors)


def getEditorBuildStatus(webBuildRoot: Path | None = None) -> EditorBuildStatus:
    buildRoot = webBuildRoot or WEB_BUILD_ROOT
    indexPath = buildRoot / "index.html"
    assetsPath = buildRoot / "_app"
    manifestPath = buildRoot / "build-generation.json"
    missingPaths = tuple(
        path
        for path, exists in (
            (indexPath, indexPath.is_file()),
            (assetsPath, assetsPath.is_dir()),
            (manifestPath, manifestPath.is_file()),
        )
        if not exists
    )
    integrityErrors = (
        ()
        if missingPaths
        else _editorBuildIntegrityErrors(buildRoot, indexPath, manifestPath)
    )
    return EditorBuildStatus(
        status="missing" if missingPaths else "invalid" if integrityErrors else "ready",
        indexPath=indexPath,
        assetsPath=assetsPath,
        manifestPath=manifestPath,
        missingPaths=missingPaths,
        integrityErrors=integrityErrors,
    )


def buildEditorInstructions(status: EditorBuildStatus) -> str:
    problem = (
        ", ".join(_displayPath(path) for path in status.missingPaths)
        or "; ".join(status.integrityErrors)
        or _displayPath(status.indexPath)
    )
    return "\n".join(
        [
            f"Codaro editor build is {status.status}: {problem}",
            "Run:",
            "  cd editor",
            "  npm install",
            "  npm run build",
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
                status=status.status,
                indexPath=_displayPath(status.indexPath),
                assetsPath=_displayPath(status.assetsPath),
                manifestPath=_displayPath(status.manifestPath),
                integrityErrors=" | ".join(status.integrityErrors) or None,
            ),
        )
    raise EditorBuildError(buildEditorInstructions(status))


def createServerApp(
    mode: str = "edit",
    documentPath: Path | None = None,
    studyDir: Path | None = None,
    workspaceRoot: Path | None = None,
    browserUrl: str | None = None,
    publicationRuntime: Any | None = None,
) -> FastAPI:
    logger = configureServerLogging()
    state = (
        publicationRuntime.state
        if publicationRuntime is not None
        else createServerState(
            mode=mode,
            documentPath=documentPath,
            workspaceRoot=workspaceRoot or Path.cwd().resolve(),
            studyRoot=studyDir or CURRICULA_ROOT,
            packageRoot=PACKAGE_ROOT,
            editorRoot=EDITOR_ROOT,
            webBuildRoot=WEB_BUILD_ROOT,
        )
    )

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        del application
        if publicationRuntime is None:
            try:
                await state.workspaceEngine.initialize()
            except Exception as startupError:  # noqa: BLE001 - lifespan boundary
                logger.exception(
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
                studyRoot=state.studyRoot if publicationRuntime is None and state.studyRoot.exists() else None,
            ),
        )

        async def reapSessionsPeriodically() -> None:
            while True:
                await asyncio.sleep(300)
                try:
                    sessionReaped = state.sessionManager.reapExpired()
                    convManager = None
                    convReaped = 0
                    if publicationRuntime is None:
                        from .ai.conversation import getConversationManager

                        convManager = getConversationManager()
                        convReaped = convManager.reapExpired()
                    if sessionReaped > 0 or convReaped > 0:
                        logger.info(
                            "reaper %s",
                            formatLogFields(
                                status="reaped",
                                sessions=sessionReaped,
                                conversations=convReaped,
                                remainingSessions=state.sessionManager.sessionCount,
                                remainingConversations=convManager.conversationCount if convManager is not None else 0,
                            ),
                        )
                except Exception as reapError:  # noqa: BLE001 — reaper must not crash
                    logger.warning("reaper %s", formatLogFields(status="error", error=str(reapError)))

        def _onBackgroundTaskDone(task: asyncio.Task) -> None:
            if task.cancelled():
                return
            exc = task.exception()
            if exc:
                logger.exception("background task failed: %s", exc)

        reapTask = asyncio.create_task(reapSessionsPeriodically())
        reapTask.add_done_callback(_onBackgroundTaskDone)

        # 재시작 시 schedule 보유 태스크의 주기 실행을 복원(잡은 휘발, schedule은 영속).
        if publicationRuntime is None:
            try:
                from .automation.taskFlow import rehydrateAutomationSchedules

                rehydrated = rehydrateAutomationSchedules(str(state.workspaceRoot))
                if rehydrated["count"]:
                    logger.info("scheduler %s", formatLogFields(status="rehydrated", count=rehydrated["count"]))
            except Exception as scheduleError:  # noqa: BLE001 - schedule restore must not block startup
                logger.warning("scheduler %s", formatLogFields(status="rehydrate-failed", error=str(scheduleError)))

        if browserUrl:
            import webbrowser
            try:
                webbrowser.open(browserUrl)
            except Exception as browserError:  # noqa: BLE001 — browser open is best-effort
                logger.warning("browser %s", formatLogFields(action="error", url=browserUrl, message=str(browserError)))

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
        if publicationRuntime is None:
            try:
                state.workspaceEngine.dispose()
            except Exception as disposeError:  # noqa: BLE001 - shutdown must continue
                logger.exception("lifespan %s", formatLogFields(status="dispose-failed", error=str(disposeError)))
            try:
                await getSessionRegistry().closeAll()
            except Exception as automationCloseError:  # noqa: BLE001 - shutdown must continue
                logger.exception(
                    "lifespan %s",
                    formatLogFields(status="automation-session-close-failed", error=str(automationCloseError)),
                )
            try:
                state.publicationWorkbench.close()
            except Exception as publicationCloseError:  # noqa: BLE001 - shutdown must continue
                logger.exception(
                    "lifespan %s",
                    formatLogFields(status="publication-close-failed", error=str(publicationCloseError)),
                )
        try:
            if publicationRuntime is not None:
                publicationRuntime.close()
            else:
                state.sessionManager.destroyAll()
        except Exception as destroyError:  # noqa: BLE001 — shutdown must continue
            logger.exception("lifespan %s", formatLogFields(status="destroy-failed", error=str(destroyError)))

    app = FastAPI(title="Codaro", lifespan=lifespan)
    app.state.codaro = state
    serverPort = os.environ.get("CODARO_PORT", "8765")
    configuredOrigins = [
        origin.strip().rstrip("/")
        for origin in os.environ.get("CODARO_DEV_ORIGINS", "").split(",")
        if origin.strip()
    ]
    allowedOrigins = [
        f"http://localhost:{serverPort}",
        f"http://127.0.0.1:{serverPort}",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        *configuredOrigins,
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
            (
                "default-src 'self'; base-uri 'none'; script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; "
                "font-src 'self' data:; object-src 'none'; frame-src 'none'; frame-ancestors 'none'"
            )
            if publicationRuntime is not None
            else (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://giscus.app https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: blob:; "
                "connect-src 'self' ws: wss: https://cdn.jsdelivr.net; "
                "font-src 'self' data:; "
                "frame-src https://giscus.app; "
                "frame-ancestors 'none'"
            )
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

    if publicationRuntime is not None:
        from .api.publishedServerRouter import createPublishedServerRouter

        app.include_router(createPublishedServerRouter(publicationRuntime))
    else:
        app.include_router(createAiRouter(state))
        app.include_router(createAutomationRouter(state))
        app.include_router(createBootstrapRouter(state))
        app.include_router(createDocumentRouter(state))
        app.include_router(createExtensionRouter(state))
        from .api.integrationRouter import createIntegrationRouter
        app.include_router(createIntegrationRouter(state))
        app.include_router(createKernelRouter(state))
        app.include_router(createPublicationRouter(state))
        app.include_router(createShareRouter(state))
        app.include_router(createSystemRouter(state))
        app.include_router(createTerminalRouter(state))
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
    browserUrl: str | None = None,
) -> None:
    logger = setVerboseLogging(verbose)
    editorStatus = requireEditorBuildReady(logger=logger)
    workspaceRoot = Path.cwd().resolve()
    app = createServerApp(mode=mode, documentPath=documentPath, workspaceRoot=workspaceRoot, browserUrl=browserUrl)
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
    logger.info(
        "workspace %s",
        formatLogFields(root=workspaceRoot, studyRoot=CURRICULA_ROOT if CURRICULA_ROOT.exists() else None),
    )
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
    resolvedPort = resolveBindablePort(host, port, logger=logger)
    if resolvedPort != port:
        logger.info(
            "startup %s",
            formatLogFields(action="port-fallback", requested=port, bound=resolvedPort, host=host),
        )
    uvicorn.run(
        app,
        host=host,
        port=resolvedPort,
        log_level="warning",
        loop=createServerEventLoop,
    )


def resolveBindablePort(host: str, port: int, *, maxAttempts: int = 10, logger: Any = None) -> int:
    import socket

    candidate = port
    for _ in range(max(1, maxAttempts)):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            try:
                probe.bind((host, candidate))
                probe.listen(1)
                return candidate
            except OSError:
                if logger is not None:
                    logger.debug(
                        "startup %s",
                        formatLogFields(action="port-busy", host=host, port=candidate),
                    )
                candidate += 1
    return port


def createPublishedServerApp(
    outputRoot: str | Path,
    *,
    environment: Mapping[str, str] | None = None,
) -> FastAPI:
    from .publication.serverRuntime import PublishedServerRuntime

    runtime = PublishedServerRuntime(outputRoot, environment=environment)
    app = createServerApp(mode="app", publicationRuntime=runtime)
    app.state.publicationRuntime = runtime
    return app


def createPublishedLocalApp(
    outputRoot: str | Path,
    *,
    approvedPolicyHash: str,
    environment: Mapping[str, str] | None = None,
) -> FastAPI:
    from .publication.localRuntime import PublishedLocalRuntime

    runtime = PublishedLocalRuntime(
        outputRoot,
        approvedPolicyHash=approvedPolicyHash,
        environment=environment,
    )
    app = createServerApp(mode="app", publicationRuntime=runtime)
    app.state.publicationRuntime = runtime
    return app


def serveServerPublication(
    outputRoot: str | Path,
    *,
    host: str = "127.0.0.1",
    port: int = 8766,
    openBrowser: bool = True,
    environment: Mapping[str, str] | None = None,
) -> None:
    import webbrowser

    app = createPublishedServerApp(outputRoot, environment=environment)
    resolvedPort = resolveBindablePort(host, port)
    visibleHost = "127.0.0.1" if host in {"0.0.0.0", "::"} else host
    url = f"http://{visibleHost}:{resolvedPort}/app"
    print(f"Serving server publication at {url}")
    if openBrowser:
        webbrowser.open(url)
    uvicorn.run(app, host=host, port=resolvedPort, log_level="warning", loop=createServerEventLoop)


def serveLocalPublication(
    outputRoot: str | Path,
    *,
    approvedPolicyHash: str,
    host: str = "127.0.0.1",
    port: int = 8766,
    openBrowser: bool = True,
    environment: Mapping[str, str] | None = None,
) -> None:
    import webbrowser

    if host not in {"127.0.0.1", "localhost", "::1"}:
        from .publication import PublicationBuildError

        raise PublicationBuildError("local publication은 localhost에서만 실행할 수 있습니다.")
    app = createPublishedLocalApp(
        outputRoot,
        approvedPolicyHash=approvedPolicyHash,
        environment=environment,
    )
    resolvedPort = resolveBindablePort(host, port)
    visibleHost = "127.0.0.1" if host == "::1" else host
    url = f"http://{visibleHost}:{resolvedPort}/app"
    print(f"Serving local publication at {url}")
    if openBrowser:
        webbrowser.open(url)
    uvicorn.run(app, host=host, port=resolvedPort, log_level="warning", loop=createServerEventLoop)


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
