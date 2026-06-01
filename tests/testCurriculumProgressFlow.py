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
