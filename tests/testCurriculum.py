from __future__ import annotations

from pathlib import Path

import yaml

from codaro.curriculum.studyLoader import StudyLoader
from codaro.curriculum.converter import yamlToDocument
from codaro.curriculum.progress import ProgressTracker


CURRICULA_DIR = Path(__file__).resolve().parent.parent / "curricula" / "python"


def testListCategories() -> None:
    if not CURRICULA_DIR.exists():
        return
    loader = StudyLoader(str(CURRICULA_DIR))
    categories = loader.listCategories()

    assert len(categories) > 0
    names = [c.key for c in categories]
    assert "30days" in names


def testListContents() -> None:
    if not CURRICULA_DIR.exists():
        return
    loader = StudyLoader(str(CURRICULA_DIR))
    contents = loader.listContents("30days")

    assert len(contents) >= 20
    ids = [c.contentId for c in contents]
    assert any("day01" in cid for cid in ids)


def testLoadStudy() -> None:
    if not CURRICULA_DIR.exists():
        return
    loader = StudyLoader(str(CURRICULA_DIR))
    content = loader.loadStudy("30days", "day01_헬로월드")

    assert "meta" in content
    assert "sections" in content
    assert content["meta"]["title"] == "헬로월드"


def testYamlToDocument() -> None:
    if not CURRICULA_DIR.exists():
        return
    loader = StudyLoader(str(CURRICULA_DIR))
    content = loader.loadStudy("30days", "day01_헬로월드")
    document, solutions = yamlToDocument(content, "30days", "day01_헬로월드")

    assert document.title == "헬로월드"
    assert len(document.blocks) > 5
    assert document.runtime.defaultEngine == "local"
    assert document.app.layout == "learning"

    types = [b.type for b in document.blocks]
    assert "markdown" in types
    assert "code" in types
    assert any(b.sourceType for b in document.blocks)
    assert all(b.sourceType != "marimoIDE" for b in document.blocks)

    assert len(solutions) > 0


def testYamlBlockTypesDriveCellMetadata() -> None:
    content = {
        "meta": {"title": "Type contract"},
        "intro": {"goal": "Validate type-driven cells"},
        "sections": [
            {
                "id": "types",
                "title": "Types",
                "blocks": [
                    {"type": "marimoIDE", "title": "Legacy workbench"},
                    {
                        "type": "code",
                        "title": "Folium display",
                        "content": "import marimo as mo\nm = make_map()\nmo.iframe(m._repr_html_())",
                    },
                    {
                        "type": "expansion",
                        "title": "기본 연습",
                        "description": "빈 셀에 답을 작성합니다.",
                        "code": "print('solution')",
                    },
                ],
            }
        ],
    }

    document, solutions = yamlToDocument(content, "test", "type-contract")

    workbench = next(block for block in document.blocks if block.sourceType == "localWorkbench")
    snippet = next(block for block in document.blocks if block.title == "Folium display" and block.type == "code")
    exercise = next(block for block in document.blocks if block.sourceType == "expansion" and block.type == "code")

    assert workbench.displayKind == "hero"
    assert workbench.role == "visual"
    assert snippet.role == "snippet"
    assert snippet.content == "m = make_map()\nm"
    assert exercise.role == "exercise"
    assert exercise.content == ""
    assert solutions[exercise.id] == "print('solution')"


def testAllCurriculaConvertToLocalDocuments() -> None:
    if not CURRICULA_DIR.exists():
        return

    converted = 0
    failures: list[str] = []
    for path in CURRICULA_DIR.rglob("*.yaml"):
        if path.name == "schema.yaml":
            continue
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict) or not isinstance(raw.get("sections"), list):
            continue
        try:
            document, _ = yamlToDocument(raw, path.parent.name, path.stem)
        except Exception as exc:  # pragma: no cover - assertion reports the failing path
            failures.append(f"{path}: {exc}")
            continue
        converted += 1
        assert document.runtime.defaultEngine == "local"
        assert document.blocks
        assert all(block.sourceType != "marimoIDE" for block in document.blocks)

    assert not failures
    assert converted > 0


def testDocumentHasMissions() -> None:
    if not CURRICULA_DIR.exists():
        return
    loader = StudyLoader(str(CURRICULA_DIR))
    content = loader.loadStudy("30days", "day01_헬로월드")
    document, solutions = yamlToDocument(content, "30days", "day01_헬로월드")

    markdownBlocks = [b for b in document.blocks if b.type == "markdown"]
    missionHeaders = [b for b in markdownBlocks if "기본" in (b.content or "") or "심화" in (b.content or "")]
    assert len(missionHeaders) > 0

    missionCells = [b for b in document.blocks if b.id in solutions]
    assert len(missionCells) > 0
    assert all(b.content == "" for b in missionCells)


def testPrevNext() -> None:
    if not CURRICULA_DIR.exists():
        return
    loader = StudyLoader(str(CURRICULA_DIR))
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
