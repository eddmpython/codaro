from __future__ import annotations

from pathlib import Path

from codaro.curriculum.contentLoader import ContentLoader
from codaro.curriculum.converter import yamlToDocument
from codaro.curriculum.progress import ProgressTracker


CONTENT_DIR = Path(__file__).resolve().parent.parent / "content" / "studyPython" / "content"


def testListCategories() -> None:
    if not CONTENT_DIR.exists():
        return
    loader = ContentLoader(str(CONTENT_DIR))
    categories = loader.listCategories()

    assert len(categories) > 0
    names = [c.key for c in categories]
    assert "30days" in names


def testListContents() -> None:
    if not CONTENT_DIR.exists():
        return
    loader = ContentLoader(str(CONTENT_DIR))
    contents = loader.listContents("30days")

    assert len(contents) >= 20
    ids = [c.contentId for c in contents]
    assert any("day01" in cid for cid in ids)


def testLoadContent() -> None:
    if not CONTENT_DIR.exists():
        return
    loader = ContentLoader(str(CONTENT_DIR))
    content = loader.loadContent("30days", "day01_헬로월드")

    assert "meta" in content
    assert "sections" in content
    assert content["meta"]["title"] == "헬로월드"


def testYamlToDocument() -> None:
    if not CONTENT_DIR.exists():
        return
    loader = ContentLoader(str(CONTENT_DIR))
    content = loader.loadContent("30days", "day01_헬로월드")
    document, solutions = yamlToDocument(content, "30days", "day01_헬로월드")

    assert document.title == "헬로월드"
    assert len(document.blocks) > 5

    types = [b.type for b in document.blocks]
    assert "markdown" in types
    assert "code" in types

    assert len(solutions) > 0


def testDocumentHasMissions() -> None:
    if not CONTENT_DIR.exists():
        return
    loader = ContentLoader(str(CONTENT_DIR))
    content = loader.loadContent("30days", "day01_헬로월드")
    document, solutions = yamlToDocument(content, "30days", "day01_헬로월드")

    markdownBlocks = [b for b in document.blocks if b.type == "markdown"]
    missionHeaders = [b for b in markdownBlocks if "기본" in (b.content or "") or "심화" in (b.content or "")]
    assert len(missionHeaders) > 0

    missionCells = [b for b in document.blocks if b.id in solutions]
    assert len(missionCells) > 0
    assert all(b.content == "" for b in missionCells)


def testPrevNext() -> None:
    if not CONTENT_DIR.exists():
        return
    loader = ContentLoader(str(CONTENT_DIR))
    prevNext = loader.getPrevNext("30days", "day01_헬로월드")

    assert prevNext["prev"] is None
    assert prevNext["next"] is not None


def testProgressTracker(tmp_path: Path) -> None:
    tracker = ProgressTracker(storagePath=tmp_path / "progress.json")

    tracker.markAccessed("30days", "day01_헬로월드")
    lesson = tracker.getLesson("30days", "day01_헬로월드")
    assert lesson.lastAccessedAt is not None
    assert lesson.completedAt is None

    tracker.completeMission("30days", "day01_헬로월드", "mission1", totalMissions=3)
    tracker.completeMission("30days", "day01_헬로월드", "mission2", totalMissions=3)
    lesson = tracker.getLesson("30days", "day01_헬로월드")
    assert len(lesson.completedMissions) == 2
    assert lesson.completedAt is None

    tracker.completeMission("30days", "day01_헬로월드", "mission3", totalMissions=3)
    lesson = tracker.getLesson("30days", "day01_헬로월드")
    assert lesson.completedAt is not None

    summary = tracker.getSummary()
    assert summary["totalCompleted"] == 1


def testProgressPersistence(tmp_path: Path) -> None:
    storagePath = tmp_path / "progress.json"
    tracker1 = ProgressTracker(storagePath=storagePath)
    tracker1.completeMission("30days", "day01", "m1", totalMissions=1)

    tracker2 = ProgressTracker(storagePath=storagePath)
    lesson = tracker2.getLesson("30days", "day01")
    assert "m1" in lesson.completedMissions
    assert lesson.completedAt is not None
