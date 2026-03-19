from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from ..curriculum.studyLoader import StudyLoader
from ..curriculum.progress import ProgressTracker
from ..kernel.manager import SessionManager
from ..runtime import ExecutionEngine, LocalEngine


@dataclass(slots=True)
class ServerState:
    mode: str
    documentPath: Path | None
    workspaceRoot: Path
    studyRoot: Path
    packageRoot: Path
    frontendRoot: Path
    webBuildRoot: Path
    sessionManager: SessionManager
    workspaceEngine: ExecutionEngine
    studyLoader: StudyLoader | None
    progressTracker: ProgressTracker


def createServerState(
    mode: str,
    documentPath: Path | None,
    workspaceRoot: Path,
    studyRoot: Path,
    packageRoot: Path,
    frontendRoot: Path,
    webBuildRoot: Path,
) -> ServerState:
    studyLoader = StudyLoader(str(studyRoot)) if studyRoot.exists() else None
    return ServerState(
        mode=mode,
        documentPath=documentPath,
        workspaceRoot=workspaceRoot,
        studyRoot=studyRoot,
        packageRoot=packageRoot,
        frontendRoot=frontendRoot,
        webBuildRoot=webBuildRoot,
        sessionManager=SessionManager(workspaceRoot=workspaceRoot),
        workspaceEngine=LocalEngine(
            workingDirectory=workspaceRoot,
            workspaceRoot=workspaceRoot,
        ),
        studyLoader=studyLoader,
        progressTracker=ProgressTracker(),
    )
