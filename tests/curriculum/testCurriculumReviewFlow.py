from types import SimpleNamespace

from codaro.curriculum.lessonGraph import LessonGraph, LessonNode
from codaro.curriculum.progress import ProgressTracker
from codaro.curriculum.reviewFlow import buildCurriculumReviewsPayload, recordCurriculumReviewResult
from codaro.curriculum.reviewScheduler import initState


def curriculumOs() -> SimpleNamespace:
    graph = LessonGraph(
        lessons=[
            LessonNode(
                category="python",
                contentId="variables",
                title="Variables",
            )
        ]
    )
    return SimpleNamespace(graph=lambda: graph)


def testReviewPayloadUsesGraphMetadataForDueLessons(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")
    progress = tracker.load()
    progress.lessonReviews["python/variables"] = initState(
        "python/variables",
        completedAt="2026-01-01T00:00:00+00:00",
    )
    tracker.save()

    payload = buildCurriculumReviewsPayload(
        curriculumOs=curriculumOs(),
        progressTracker=tracker,
    )

    assert payload["totalDue"] == 1
    assert payload["reviews"][0]["title"] == "Variables"
    assert payload["reviews"][0]["category"] == "python"


def testRecordReviewResultUsesLessonKeyBoundary(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")

    updated = recordCurriculumReviewResult(
        progressTracker=tracker,
        category="python",
        contentId="variables",
        success=True,
    )

    assert updated.lessonKey == "python/variables"
    assert updated.lastResult == "success"
