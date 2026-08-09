from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import APIRouter

from ..document.percentFormat import writePercentDocument
from ..publication import compileDocument
from ..serverLog import formatLogFields, getServerLogger
from ..system.fileOps import WorkspacePathError, resolvePath
from ..system.serverState import ServerState
from .errors import fail
from .requestModels import PublicationInspectRequest


def createPublicationRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()

    @router.post("/api/publication/inspect")
    def inspectPublication(request: PublicationInspectRequest) -> dict[str, Any]:
        sourcePath = _resolveSourcePath(request.sourcePath, request.document.title, state)
        try:
            report = compileDocument(
                request.document,
                sourcePath=sourcePath,
                sourceText=writePercentDocument(request.document),
                workspaceRoot=state.workspaceRoot,
                packageLock=request.packageLock,
            )
        except ValueError as exc:
            fail(400, "publication_compile_invalid", str(exc))
        logger.debug(
            "publication-inspect %s",
            formatLogFields(
                path=sourcePath,
                runtimeTarget=report.runtimeTarget,
                unitCount=len(report.units),
                diagnosticCount=len(report.diagnostics),
            ),
        )
        return report.payload()

    return router


def _resolveSourcePath(rawPath: str | None, title: str, state: ServerState) -> Path:
    candidate = rawPath or (str(state.documentPath) if state.documentPath else f"{title or 'notebook'}.py")
    try:
        return resolvePath(candidate, state.workspaceRoot)
    except WorkspacePathError:
        fail(403, "publication_path_outside_workspace", "Path must stay within the active workspace.")
