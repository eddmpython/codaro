from __future__ import annotations

import asyncio

import pytest

from codaro.automation.workflowFlow import (
    AutomationWorkflowFlowError,
    createAutomationWorkflowPayload,
    deleteAutomationWorkflowPayload,
    getAutomationWorkflowPayload,
    listAutomationWorkflowRunsPayload,
    listAutomationWorkflowsPayload,
    resetAutomationWorkflowFlowState,
    runAutomationWorkflowPayload,
)


@pytest.fixture(autouse=True)
def isolatedWorkflowFlow():
    resetAutomationWorkflowFlowState()
    yield
    resetAutomationWorkflowFlowState()


def testWorkflowFlowCreatesAndListsWorkflow(tmp_path) -> None:
    workflow = createAutomationWorkflowPayload(
        workspaceRoot=str(tmp_path),
        name="Daily report",
        description="Build a daily report",
        steps=[
            {"taskId": "extract"},
            {"taskId": "publish", "dependsOn": ["extract"]},
        ],
    )

    assert workflow["name"] == "Daily report"
    assert workflow["steps"][1]["dependsOn"] == ["extract"]

    listed = listAutomationWorkflowsPayload(workspaceRoot=str(tmp_path))
    assert listed["total"] == 1
    assert listed["workflows"][0]["id"] == workflow["id"]
    assert getAutomationWorkflowPayload(workflow["id"])["description"] == "Build a daily report"


def testWorkflowFlowReportsMissingWorkflow() -> None:
    with pytest.raises(AutomationWorkflowFlowError) as getInfo:
        getAutomationWorkflowPayload("missing")

    assert getInfo.value.statusCode == 404
    assert getInfo.value.message == "Workflow not found"

    with pytest.raises(AutomationWorkflowFlowError) as deleteInfo:
        deleteAutomationWorkflowPayload("missing")

    assert deleteInfo.value.statusCode == 404


def testWorkflowFlowConvertsRunMissingToFlowError(tmp_path) -> None:
    with pytest.raises(AutomationWorkflowFlowError) as runInfo:
        asyncio.run(runAutomationWorkflowPayload("missing", workspaceRoot=str(tmp_path)))

    assert runInfo.value.statusCode == 404
    assert "Workflow not found" in runInfo.value.message


def testWorkflowFlowDeletesRunsWithWorkflow(tmp_path) -> None:
    workflow = createAutomationWorkflowPayload(
        workspaceRoot=str(tmp_path),
        name="One shot",
        steps=[{"taskId": "extract"}],
    )

    assert deleteAutomationWorkflowPayload(workflow["id"]) == {"ok": True}
    assert listAutomationWorkflowRunsPayload(workflow["id"], limit=20) == {"runs": []}
