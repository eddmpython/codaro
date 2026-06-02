from codaro.curriculum.progress import ProgressTracker
from codaro.curriculum.progressFlow import (
    CurriculumProgressInput,
    buildCurriculumProgressSummary,
    updateCurriculumProgress,
)


def testProgressSummaryUsesTrackerContract(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")
    tracker.markAccessed("python", "variables")

    summary = buildCurriculumProgressSummary(tracker)

    assert summary["totalAccessed"] == 1


def testProgressSummaryReportsCategoryBreakdownAndResume(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")
    tracker.markAccessed("pandas", "intro")
    tracker.completeMission("pandas", "filtering", "m1", 1)
    tracker.markAccessed("numpy", "arrays")

    summary = buildCurriculumProgressSummary(tracker)

    assert summary["categoryProgress"]["pandas"] == {"completed": 1, "accessed": 2}
    assert summary["categoryProgress"]["numpy"] == {"completed": 0, "accessed": 1}
    # resume = 가장 최근 접근한 미완료 레슨 (완료된 filtering 제외)
    assert summary["resume"] == {"category": "numpy", "contentId": "arrays"}


def testProgressSummaryResumeIsNoneWhenNothingPending(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")
    tracker.completeMission("pandas", "intro", "m1", 1)

    summary = buildCurriculumProgressSummary(tracker)

    assert summary["resume"] is None


def testProgressUpdateRecordsAccessOrMission(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")

    access = updateCurriculumProgress(
        progressTracker=tracker,
        request=CurriculumProgressInput(category="python", contentId="variables"),
    )
    mission = updateCurriculumProgress(
        progressTracker=tracker,
        request=CurriculumProgressInput(
            category="python",
            contentId="variables",
            missionId="m1",
            totalMissions=1,
        ),
    )

    assert access.action == "progress-access"
    assert access.payload == {"status": "accessed"}
    assert mission.action == "progress-mission"
    assert mission.payload["completedAt"]
