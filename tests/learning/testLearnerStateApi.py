"""Learner state HTTP endpoint 테스트 — Predict-Run-Reconcile-Adapt 루프 HTTP 표면.

`/api/learner/snapshot` 과 `/api/learner/outcome/{outcomeId}` 가 학습자 상태를
JSON으로 노출하는지, 그리고 master-plan 응답에 learner mastery / dynamic gap이
실리는지 검증한다.
"""
from __future__ import annotations

import os
from pathlib import Path

import pytest


@pytest.fixture(autouse=True)
def isolateLearnerDb(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """매 테스트마다 격리된 SQLite path를 사용. ~/.codaro/learnerState.db를 오염시키지 않는다."""
    home = tmp_path / "home"
    home.mkdir()
    monkeypatch.setenv("HOME", str(home))
    monkeypatch.setenv("USERPROFILE", str(home))  # Windows
    yield
    # cleanup automatic via tmp_path


def _client(tmp_path: Path):
    from fastapi.testclient import TestClient

    from codaro.server import createServerApp

    return TestClient(createServerApp(workspaceRoot=tmp_path / "workspace"))


def testLearnerSnapshotEmptyByDefault(tmp_path: Path) -> None:
    client = _client(tmp_path)
    response = client.get("/api/learner/snapshot")
    assert response.status_code == 200
    payload = response.json()
    assert payload["mastery"] == []
    assert payload["misconceptions"] == []
    assert payload["execution"]["totalExecutions"] == 0
    assert payload["repeatedMisconceptionCount"] == 0
    assert payload["doneCriterionViolated"] is False


def testLearnerSnapshotReflectsRecordedAttempt(tmp_path: Path) -> None:
    client = _client(tmp_path)
    # store에 직접 기록한 뒤 snapshot 확인
    from codaro.curriculum.learnerState import LearnerStateStore

    store = LearnerStateStore()  # 같은 HOME 경로의 default DB
    store.recordOutcomeAttempt("python.variables", success=True)

    response = client.get("/api/learner/snapshot")
    payload = response.json()
    assert any(
        item["outcomeId"] == "python.variables" for item in payload["mastery"]
    )


def testLearnerOutcomeReturnsMastery(tmp_path: Path) -> None:
    client = _client(tmp_path)
    from codaro.curriculum.learnerState import LearnerStateStore

    store = LearnerStateStore()
    store.recordOutcomeAttempt("python.variables", success=True)

    response = client.get("/api/learner/outcome/python.variables")
    assert response.status_code == 200
    payload = response.json()
    assert payload["outcomeId"] == "python.variables"
    assert payload["mastery"]["successCount"] == 1


def testLearnerOutcomeRejectsUnknown(tmp_path: Path) -> None:
    client = _client(tmp_path)
    response = client.get("/api/learner/outcome/totally.unknown")
    assert response.status_code == 400


def testLearnerSnapshotFlagsRepeatedMisconception(tmp_path: Path) -> None:
    client = _client(tmp_path)
    from codaro.curriculum.learnerState import LearnerStateStore

    store = LearnerStateStore()
    store.recordMisconception("python.variables.typeConflation", "python.variables")
    store.recordMisconception("python.variables.typeConflation", "python.variables")

    response = client.get("/api/learner/snapshot")
    payload = response.json()
    assert payload["repeatedMisconceptionCount"] == 1
    assert payload["doneCriterionViolated"] is True


def testMasterPlanSurfacesLearnerMasteryAndDynamicGaps(tmp_path: Path) -> None:
    """master-plan 응답에 step.learnerMastery 와 dynamicGaps 가 포함되는지 검증."""
    client = _client(tmp_path)
    from codaro.curriculum.learnerState import LearnerStateStore

    store = LearnerStateStore()
    # pandas.intro 에 약한 mastery 기록
    store.recordOutcomeAttempt("pandas.intro", success=False)

    plan = client.post(
        "/api/curriculum/master-plan",
        json={"domain": "dataReporting", "excludeCompleted": False},
    )
    assert plan.status_code == 200
    payload = plan.json()
    # 최소한 dynamicGaps 키와 droppedSteps 키가 존재해야 한다
    assert "dynamicGaps" in payload
    assert "droppedSteps" in payload
    # step에 learnerMastery 필드가 있어야 한다 (값은 None 또는 float)
    assert all("learnerMastery" in step for step in payload["steps"])
