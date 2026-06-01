from __future__ import annotations

from typing import Any

from . import workflow as workflowModule


class AutomationWorkflowFlowError(Exception):
    def __init__(self, statusCode: int, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.message = message


def listAutomationWorkflowsPayload(*, workspaceRoot: str) -> dict[str, Any]:
    engine = workflowModule.getWorkflowEngine(workspaceRoot)
    workflows = engine.listWorkflows()
    return {
        "workflows": [workflow.serialize() for workflow in workflows],
        "total": len(workflows),
    }


def createAutomationWorkflowPayload(
    *,
    workspaceRoot: str,
    name: str,
    steps: list[dict[str, Any]],
    description: str = "",
) -> dict[str, Any]:
    workflow = workflowModule.getWorkflowEngine(workspaceRoot).create(
        name=name,
        steps=steps,
        description=description,
    )
    return workflow.serialize()


def getAutomationWorkflowPayload(workflowId: str) -> dict[str, Any]:
    workflow = workflowModule.getWorkflowEngine().get(workflowId)
    if workflow is None:
        raise AutomationWorkflowFlowError(404, "Workflow not found")
    return workflow.serialize()


def deleteAutomationWorkflowPayload(workflowId: str) -> dict[str, bool]:
    deleted = workflowModule.getWorkflowEngine().delete(workflowId)
    if not deleted:
        raise AutomationWorkflowFlowError(404, "Workflow not found")
    return {"ok": True}


async def runAutomationWorkflowPayload(
    workflowId: str,
    *,
    workspaceRoot: str,
) -> dict[str, Any]:
    try:
        run = await workflowModule.getWorkflowEngine(workspaceRoot).run(workflowId)
    except ValueError as exc:
        raise AutomationWorkflowFlowError(404, str(exc)) from exc
    return run.serialize()


def listAutomationWorkflowRunsPayload(
    workflowId: str,
    *,
    limit: int,
) -> dict[str, Any]:
    runs = workflowModule.getWorkflowEngine().getRuns(workflowId, limit=limit)
    return {"runs": [run.serialize() for run in runs]}


def resetAutomationWorkflowFlowState() -> None:
    workflowModule.resetWorkflowEngine()
