from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from ..curriculum.contentLoader import ContentLoader
from ..curriculum.progress import ProgressTracker
from ..kernel.manager import SessionManager


@dataclass(slots=True)
class ServerState:
    mode: str
    documentPath: Path | None
    workspaceRoot: Path
    contentRoot: Path
    packageRoot: Path
    frontendRoot: Path
    webBuildRoot: Path
    sessionManager: SessionManager
    curriculumLoader: ContentLoader | None
    progressTracker: ProgressTracker


def createServerState(
    mode: str,
    documentPath: Path | None,
    workspaceRoot: Path,
    contentRoot: Path,
    packageRoot: Path,
    frontendRoot: Path,
    webBuildRoot: Path,
) -> ServerState:
    curriculumLoader = ContentLoader(str(contentRoot)) if contentRoot.exists() else None
    return ServerState(
        mode=mode,
        documentPath=documentPath,
        workspaceRoot=workspaceRoot,
        contentRoot=contentRoot,
        packageRoot=packageRoot,
        frontendRoot=frontendRoot,
        webBuildRoot=webBuildRoot,
        sessionManager=SessionManager(workspaceRoot=workspaceRoot),
        curriculumLoader=curriculumLoader,
        progressTracker=ProgressTracker(),
    )
