"""recommendLearningPath 결정적 추천 검증 — provider 없이 학습 여정이 닫히는지."""
from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))

from codaro.curriculum.learningPathFlow import recommendLearningPath


PATHS = {
    "초급": {"categories": ["30days"], "description": "처음이라면"},
    "중급": {"categories": ["pandas", "numpy"], "description": "기초를 마쳤다면"},
    "실무": {"categories": ["excel", "regex"], "description": "자동화로 확장"},
}

TOTALS = {"30days": 30, "pandas": 10, "numpy": 5, "excel": 4, "regex": 6}


def _recommend(progress):
    return recommendLearningPath(
        learningPaths=PATHS,
        categoryTotals=TOTALS,
        categoryProgress=progress,
    )


def test_newLearnerStartsAtBeginnerTrack():
    result = _recommend({})
    assert result["recommended"]["track"] == "초급"
    assert result["recommended"]["category"] == "30days"
    assert result["recommended"]["completed"] == 0
    assert result["recommended"]["total"] == 30


def test_beginnerStateIsActiveOthersUpcoming():
    states = {t["track"]: t["state"] for t in _recommend({})["tracks"]}
    assert states == {"초급": "active", "중급": "upcoming", "실무": "upcoming"}


def test_completedBeginnerAdvancesToIntermediate():
    progress = {"30days": {"completed": 30, "accessed": 30}}
    result = _recommend(progress)
    assert result["recommended"]["track"] == "중급"
    assert result["recommended"]["category"] == "pandas"
    states = {t["track"]: t["state"] for t in result["tracks"]}
    assert states["초급"] == "done"
    assert states["중급"] == "active"


def test_nextCategoryIsFirstUnfinishedWithinTrack():
    progress = {
        "30days": {"completed": 30, "accessed": 30},
        "pandas": {"completed": 10, "accessed": 10},
        "numpy": {"completed": 2, "accessed": 3},
    }
    result = _recommend(progress)
    assert result["recommended"]["track"] == "중급"
    assert result["recommended"]["category"] == "numpy"


def test_partialTrackRatioIsAggregatedAcrossCategories():
    progress = {
        "30days": {"completed": 30, "accessed": 30},
        "pandas": {"completed": 5, "accessed": 5},
        "numpy": {"completed": 0, "accessed": 0},
    }
    track = next(t for t in _recommend(progress)["tracks"] if t["track"] == "중급")
    # 5/(10+5) = 0.333
    assert track["completed"] == 5
    assert track["total"] == 15
    assert track["ratio"] == pytest.approx(0.333, abs=0.001)


def test_allTracksCompletedReturnsNoRecommendation():
    progress = {
        "30days": {"completed": 30, "accessed": 30},
        "pandas": {"completed": 10, "accessed": 10},
        "numpy": {"completed": 5, "accessed": 5},
        "excel": {"completed": 4, "accessed": 4},
        "regex": {"completed": 6, "accessed": 6},
    }
    result = _recommend(progress)
    assert result["recommended"] is None
    assert all(t["state"] == "done" for t in result["tracks"])


def test_overCountedProgressIsClampedToTotal():
    # 진행 데이터가 전체보다 많아도 ratio 가 1 을 넘지 않는다.
    progress = {"30days": {"completed": 99, "accessed": 99}}
    track = next(t for t in _recommend(progress)["tracks"] if t["track"] == "초급")
    assert track["completed"] == 30
    assert track["ratio"] == 1.0


def test_trackWithNoLessonsIsNeverActive():
    paths = {"빈트랙": {"categories": ["ghost"], "description": ""}, "초급": {"categories": ["30days"], "description": ""}}
    result = recommendLearningPath(
        learningPaths=paths,
        categoryTotals={"30days": 30},
        categoryProgress={},
    )
    states = {t["track"]: t["state"] for t in result["tracks"]}
    assert states["빈트랙"] == "upcoming"
    assert states["초급"] == "active"
    assert result["recommended"]["track"] == "초급"
