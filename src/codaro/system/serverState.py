from __future__ import annotations

from dataclasses import dataclass
import os
from pathlib import Path

from ..curriculum.analyticsTimeline import AnalyticsTimeline
from ..curriculum.evidenceArchive import LearningEvidenceArchiveStore
from ..curriculum.learnerState import LearnerStateStore
from ..curriculum.osCache import CurriculumOsCache
from ..curriculum.progress import ProgressTracker
from ..curriculum.studyLoader import StudyLoader
from ..kernel.manager import SessionManager
from ..runtime import ExecutionEngine, LocalEngine


@dataclass(slots=True)
class ServerState:
    mode: str
    documentPath: Path | None
    workspaceRoot: Path
    studyRoot: Path
    packageRoot: Path
    editorRoot: Path
    webBuildRoot: Path
    sessionManager: SessionManager
    workspaceEngine: ExecutionEngine
    studyLoader: StudyLoader | None
    progressTracker: ProgressTracker
    curriculumOs: CurriculumOsCache
    learnerStateStore: LearnerStateStore
    analyticsTimeline: AnalyticsTimeline
    learningEvidenceArchiveStore: LearningEvidenceArchiveStore
    learningArchiveRoot: Path


def createServerState(
    mode: str,
    documentPath: Path | None,
    workspaceRoot: Path,
    studyRoot: Path,
    packageRoot: Path,
    editorRoot: Path,
    webBuildRoot: Path,
) -> ServerState:
    studyLoader = StudyLoader(str(studyRoot)) if studyRoot.exists() else None
    codaroHome = Path(os.environ.get("CODARO_HOME", Path.home() / ".codaro")).expanduser().resolve()
    progressPath = codaroHome / "progress.json"
    learnerStatePath = codaroHome / "learnerState.db"
    learningEvidenceArchiveStore = LearningEvidenceArchiveStore(
        codaroHome / "learningEvidence.sqlite3",
        legacyLearnerStatePath=learnerStatePath,
        legacyProgressPath=progressPath,
        lessonRefResolver=studyLoader.resolveLessonRef if studyLoader is not None else None,
    )
    learningEvidenceArchiveStore.initialize()
    return ServerState(
        mode=mode,
        documentPath=documentPath,
        workspaceRoot=workspaceRoot,
        studyRoot=studyRoot,
        packageRoot=packageRoot,
        editorRoot=editorRoot,
        webBuildRoot=webBuildRoot,
        sessionManager=SessionManager(workspaceRoot=workspaceRoot),
        workspaceEngine=LocalEngine(
            workingDirectory=workspaceRoot,
            workspaceRoot=workspaceRoot,
        ),
        studyLoader=studyLoader,
        progressTracker=ProgressTracker(progressPath),
        curriculumOs=CurriculumOsCache(studyLoader),
        learnerStateStore=LearnerStateStore(learnerStatePath),
        analyticsTimeline=AnalyticsTimeline(),
        learningEvidenceArchiveStore=learningEvidenceArchiveStore,
        learningArchiveRoot=codaroHome / "learningArchives",
    )
