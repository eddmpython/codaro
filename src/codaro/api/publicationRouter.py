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
from .requestModels import (
    PublicationBuildRequest,
    PublicationDeployRequest,
    PublicationInspectRequest,
    PublicationOutputRequest,
    PublicationRollbackRequest,
    PublicationStopRequest,
)


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

    @router.post("/api/publication/build")
    def buildPublication(request: PublicationBuildRequest) -> dict[str, Any]:
        sourcePath = _resolveRequiredPath(request.sourcePath, state)
        outputPath = _resolveOutputPath(
            request.outputPath,
            sourcePath.with_name(
                f"{sourcePath.stem}-"
                f"{'server' if request.target == 'server' else 'local' if request.target == 'local' else 'embed' if request.target == 'embed' else 'site'}"
            ),
            state,
        )
        return state.publicationWorkbench.build(
            sourcePath=sourcePath,
            outputPath=outputPath,
            target=request.target,
            entryBlockId=request.entryBlockId,
            packageLock=request.packageLock,
        )

    @router.post("/api/publication/verify")
    def verifyPublication(request: PublicationOutputRequest) -> dict[str, Any]:
        return state.publicationWorkbench.verify(
            outputPath=_resolveRequiredPath(request.outputPath, state),
            target=request.target,
        )

    @router.post("/api/publication/serve")
    def servePublication(request: PublicationOutputRequest) -> dict[str, Any]:
        return state.publicationWorkbench.serve(
            outputPath=_resolveRequiredPath(request.outputPath, state),
            target=request.target,
            approvedPolicyHash=request.approvedPolicyHash,
        )

    @router.post("/api/publication/stop")
    def stopPublication(request: PublicationStopRequest) -> dict[str, Any]:
        return state.publicationWorkbench.stop(request.serverId)

    @router.post("/api/publication/deploy")
    def deployPublication(request: PublicationDeployRequest) -> dict[str, Any]:
        return state.publicationWorkbench.deploy(
            publicationPath=_resolveRequiredPath(request.publicationPath, state),
            outputPath=_resolveRequiredPath(request.outputPath, state),
            target=request.target,
        )

    @router.post("/api/publication/rollback")
    def rollbackPublication(request: PublicationRollbackRequest) -> dict[str, Any]:
        return state.publicationWorkbench.rollback(
            outputPath=_resolveRequiredPath(request.outputPath, state),
            target=request.target,
            versionId=request.versionId,
        )

    @router.get("/api/publication/jobs/{jobId}")
    def getPublicationJob(jobId: str) -> dict[str, Any]:
        job = state.publicationWorkbench.job(jobId)
        if job is None:
            fail(404, "publication_job_not_found", "Publication job을 찾을 수 없습니다.")
        return job

    return router


def _resolveSourcePath(rawPath: str | None, title: str, state: ServerState) -> Path:
    candidate = rawPath or (str(state.documentPath) if state.documentPath else f"{title or 'notebook'}.py")
    try:
        return resolvePath(candidate, state.workspaceRoot)
    except WorkspacePathError:
        fail(403, "publication_path_outside_workspace", "Path must stay within the active workspace.")


def _resolveRequiredPath(rawPath: str, state: ServerState) -> Path:
    try:
        return resolvePath(rawPath, state.workspaceRoot)
    except WorkspacePathError:
        fail(403, "publication_path_outside_workspace", "Path must stay within the active workspace.")


def _resolveOutputPath(rawPath: str | None, fallback: Path, state: ServerState) -> Path:
    return _resolveRequiredPath(rawPath or str(fallback), state)
