from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

from ..automation.inputPolicyFlow import (
    AutomationInputPolicyFlowError,
    getAutomationInputPolicyPayload,
    updateAutomationInputPolicyPayload,
)
from ..automation.monitoringFlow import (
    automationAuditLogPayload,
    automationResourceUsagePayload,
)
from ..automation.notificationFlow import (
    AutomationNotificationFlowError,
    addAutomationChannelPayload,
    listAutomationChannelsPayload,
    removeAutomationChannelPayload,
    sendAutomationNotificationPayload,
)
from ..automation.planFlow import (
    AutomationPlanFlowError,
    executeAutomationPlanPayload,
    getAutomationPlanStatusPayload,
    pauseAutomationPlanPayload,
    resumeAutomationPlanPayload,
)
from ..automation.recordingFlow import (
    AutomationRecordingFlowError,
    getAutomationRecordingStatusPayload,
    startAutomationRecordingPayload,
    stopAutomationRecordingPayload,
)
from ..automation.taskFlow import (
    AutomationTaskFlowError,
    automationSchedulerStatusPayload,
    cancelAutomationTaskSchedulePayload,
    clearAutomationStopPayload,
    createAutomationTaskPayload,
    deleteAutomationTaskPayload,
    getAutomationStopPayload,
    getAutomationTaskPayload,
    listAutomationTaskRunsPayload,
    listAutomationTasksPayload,
    runAutomationTaskPayload,
    setAutomationTaskSchedulePayload,
    triggerAutomationStopPayload,
    triggerAutomationWebhookPayload,
    updateAutomationTaskPayload,
)
from ..automation.voiceFlow import (
    listenAutomationVoicePayload,
    parseAutomationVoiceCommandPayload,
    speakAutomationVoicePayload,
)
from ..automation.workflowFlow import (
    AutomationWorkflowFlowError,
    createAutomationWorkflowPayload,
    deleteAutomationWorkflowPayload,
    getAutomationWorkflowPayload,
    listAutomationWorkflowRunsPayload,
    listAutomationWorkflowsPayload,
    runAutomationWorkflowPayload,
)

logger = logging.getLogger(__name__)


class CreateTaskRequest(BaseModel):
    name: str
    documentPath: str
    description: str = ""
    schedule: str | None = None
    inputs: dict[str, Any] | None = None


class UpdateTaskRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    schedule: str | None = None
    enabled: bool | None = None


class ScheduleRequest(BaseModel):
    schedule: str


class CreateWorkflowRequest(BaseModel):
    name: str
    description: str = ""
    steps: list[dict[str, Any]]


def createAutomationRouter(state: Any) -> APIRouter:
    router = APIRouter()

    def failAutomationTaskFlow(error: AutomationTaskFlowError) -> None:
        raise HTTPException(status_code=error.statusCode, detail=error.message)

    def failAutomationPlanFlow(error: AutomationPlanFlowError) -> None:
        raise HTTPException(status_code=error.statusCode, detail=error.message)

    def failAutomationWorkflowFlow(error: AutomationWorkflowFlowError) -> None:
        raise HTTPException(status_code=error.statusCode, detail=error.message)

    def failAutomationInputPolicyFlow(error: AutomationInputPolicyFlowError) -> None:
        raise HTTPException(status_code=error.statusCode, detail=error.message)

    def failAutomationRecordingFlow(error: AutomationRecordingFlowError) -> None:
        raise HTTPException(status_code=error.statusCode, detail=error.message)

    def failAutomationNotificationFlow(error: AutomationNotificationFlowError) -> None:
        raise HTTPException(status_code=error.statusCode, detail=error.message)

    @router.get("/api/tasks")
    def apiListTasks():
        return listAutomationTasksPayload()

    @router.post("/api/tasks")
    def apiCreateTask(req: CreateTaskRequest):
        return createAutomationTaskPayload(
            name=req.name,
            documentPath=req.documentPath,
            description=req.description,
            schedule=req.schedule,
            inputs=req.inputs,
        )

    @router.get("/api/tasks/{taskId}")
    def apiGetTask(taskId: str):
        try:
            return getAutomationTaskPayload(taskId)
        except AutomationTaskFlowError as error:
            failAutomationTaskFlow(error)

    @router.put("/api/tasks/{taskId}")
    def apiUpdateTask(taskId: str, req: UpdateTaskRequest):
        try:
            return updateAutomationTaskPayload(
                taskId,
                name=req.name,
                description=req.description,
                schedule=req.schedule,
                enabled=req.enabled,
            )
        except AutomationTaskFlowError as error:
            failAutomationTaskFlow(error)

    @router.delete("/api/tasks/{taskId}")
    def apiDeleteTask(taskId: str):
        try:
            return deleteAutomationTaskPayload(taskId)
        except AutomationTaskFlowError as error:
            failAutomationTaskFlow(error)

    @router.post("/api/tasks/{taskId}/run")
    async def apiRunTask(taskId: str):
        try:
            return await runAutomationTaskPayload(
                taskId,
                workspaceRoot=str(getattr(state, "workspaceRoot", ".")),
            )
        except AutomationTaskFlowError as error:
            failAutomationTaskFlow(error)

    @router.get("/api/tasks/{taskId}/runs")
    def apiGetRuns(taskId: str, limit: int = Query(20)):
        try:
            return listAutomationTaskRunsPayload(taskId, limit=limit)
        except AutomationTaskFlowError as error:
            failAutomationTaskFlow(error)

    @router.put("/api/tasks/{taskId}/schedule")
    async def apiSetSchedule(taskId: str, req: ScheduleRequest):
        try:
            return setAutomationTaskSchedulePayload(
                taskId,
                schedule=req.schedule,
                workspaceRoot=str(getattr(state, "workspaceRoot", ".")),
            )
        except AutomationTaskFlowError as error:
            failAutomationTaskFlow(error)

    @router.delete("/api/tasks/{taskId}/schedule")
    def apiCancelSchedule(taskId: str):
        try:
            return cancelAutomationTaskSchedulePayload(taskId)
        except AutomationTaskFlowError as error:
            failAutomationTaskFlow(error)

    @router.get("/api/scheduler/status")
    def apiSchedulerStatus():
        return automationSchedulerStatusPayload()

    @router.post("/api/webhooks/trigger/{taskId}")
    async def apiWebhookTrigger(taskId: str, request: Request):
        try:
            await request.json()
        except (json.JSONDecodeError, ValueError) as exc:
            logger.warning("webhook body parse failed for task %s: %s", taskId, exc)
        try:
            return await triggerAutomationWebhookPayload(
                taskId,
                workspaceRoot=str(getattr(state, "workspaceRoot", ".")),
            )
        except AutomationTaskFlowError as error:
            failAutomationTaskFlow(error)

    @router.get("/api/automation/e-stop")
    def apiGetEStop():
        return getAutomationStopPayload()

    @router.post("/api/automation/e-stop")
    async def apiTriggerEStop(request: Request):
        body = {}
        try:
            body = await request.json()
        except (json.JSONDecodeError, ValueError) as exc:
            logger.debug("e-stop body parse: %s", exc)
        reason = body.get("reason", "Manual trigger via API")
        try:
            return triggerAutomationStopPayload(reason)
        except AutomationTaskFlowError as error:
            failAutomationTaskFlow(error)

    @router.delete("/api/automation/e-stop")
    def apiClearEStop():
        try:
            return clearAutomationStopPayload()
        except AutomationTaskFlowError as error:
            failAutomationTaskFlow(error)

    @router.get("/api/automation/resource-usage")
    def apiResourceUsage():
        return automationResourceUsagePayload(getattr(state, "sessionManager", None))

    @router.get("/api/automation/audit")
    def apiGetAuditLog(
        actionType: str | None = Query(None),
        date: str | None = Query(None),
        limit: int = Query(100),
    ):
        return automationAuditLogPayload(actionType=actionType, date=date, limit=limit)

    @router.get("/api/automation/input-policy")
    def apiGetInputPolicy():
        return getAutomationInputPolicyPayload()

    @router.put("/api/automation/input-policy")
    async def apiUpdateInputPolicy(request: Request):
        body = await request.json()
        try:
            return updateAutomationInputPolicyPayload(body)
        except AutomationInputPolicyFlowError as error:
            failAutomationInputPolicyFlow(error)

    @router.post("/api/automation/recording/start")
    def apiStartRecording():
        try:
            return startAutomationRecordingPayload()
        except AutomationRecordingFlowError as error:
            failAutomationRecordingFlow(error)

    @router.post("/api/automation/recording/stop")
    async def apiStopRecording(request: Request):
        body = {}
        try:
            body = await request.json()
        except (json.JSONDecodeError, ValueError) as exc:
            logger.debug("recording stop body: %s", exc)
        title = body.get("title", "Recorded Automation")
        try:
            return stopAutomationRecordingPayload(title=title)
        except AutomationRecordingFlowError as error:
            failAutomationRecordingFlow(error)

    @router.get("/api/automation/recording/status")
    def apiRecordingStatus():
        return getAutomationRecordingStatusPayload()

    @router.post("/api/automation/plan/execute")
    async def apiExecutePlan(request: Request):
        body = await request.json()
        try:
            return await executeAutomationPlanPayload(
                steps=body.get("steps", []),
                maxConsecutiveFailures=body.get("maxConsecutiveFailures", 3),
            )
        except AutomationPlanFlowError as error:
            failAutomationPlanFlow(error)

    @router.get("/api/automation/plan/{planId}/status")
    def apiGetPlanStatus(planId: str):
        try:
            return getAutomationPlanStatusPayload(planId)
        except AutomationPlanFlowError as error:
            failAutomationPlanFlow(error)

    @router.post("/api/automation/plan/{planId}/pause")
    def apiPausePlan(planId: str):
        try:
            return pauseAutomationPlanPayload(planId)
        except AutomationPlanFlowError as error:
            failAutomationPlanFlow(error)

    @router.post("/api/automation/plan/{planId}/resume")
    def apiResumePlan(planId: str):
        try:
            return resumeAutomationPlanPayload(planId)
        except AutomationPlanFlowError as error:
            failAutomationPlanFlow(error)

    @router.post("/api/automation/voice/listen")
    async def apiVoiceListen(request: Request):
        body = {}
        try:
            body = await request.json()
        except (json.JSONDecodeError, ValueError) as exc:
            logger.debug("voice body: %s", exc)
        return await listenAutomationVoicePayload(
            duration=body.get("duration", 5),
            language=body.get("language", "en"),
        )

    @router.post("/api/automation/voice/speak")
    async def apiVoiceSpeak(request: Request):
        body = await request.json()
        return speakAutomationVoicePayload(
            text=body.get("text", ""),
            rate=body.get("rate", 150),
        )

    @router.post("/api/automation/voice/command")
    async def apiVoiceCommand(request: Request):
        body = await request.json()
        return parseAutomationVoiceCommandPayload(body.get("text", ""))

    @router.get("/api/automation/channels")
    def apiListChannels():
        return listAutomationChannelsPayload()

    @router.post("/api/automation/channels")
    async def apiAddChannel(request: Request):
        body = await request.json()
        try:
            return addAutomationChannelPayload(body)
        except AutomationNotificationFlowError as error:
            failAutomationNotificationFlow(error)

    @router.delete("/api/automation/channels/{channelName}")
    def apiRemoveChannel(channelName: str):
        try:
            return removeAutomationChannelPayload(channelName)
        except AutomationNotificationFlowError as error:
            failAutomationNotificationFlow(error)

    @router.post("/api/automation/notify")
    async def apiSendNotification(request: Request):
        body = await request.json()
        channel = body.get("channel", "all")
        message = body.get("message", "")
        return sendAutomationNotificationPayload(channel=channel, message=message)

    @router.get("/api/workflows")
    def apiListWorkflows():
        return listAutomationWorkflowsPayload(
            workspaceRoot=str(getattr(state, "workspaceRoot", ".")),
        )

    @router.post("/api/workflows")
    def apiCreateWorkflow(req: CreateWorkflowRequest):
        return createAutomationWorkflowPayload(
            workspaceRoot=str(getattr(state, "workspaceRoot", ".")),
            name=req.name,
            steps=req.steps,
            description=req.description,
        )

    @router.get("/api/workflows/{workflowId}")
    def apiGetWorkflow(workflowId: str):
        try:
            return getAutomationWorkflowPayload(workflowId)
        except AutomationWorkflowFlowError as error:
            failAutomationWorkflowFlow(error)

    @router.delete("/api/workflows/{workflowId}")
    def apiDeleteWorkflow(workflowId: str):
        try:
            return deleteAutomationWorkflowPayload(workflowId)
        except AutomationWorkflowFlowError as error:
            failAutomationWorkflowFlow(error)

    @router.post("/api/workflows/{workflowId}/run")
    async def apiRunWorkflow(workflowId: str):
        try:
            return await runAutomationWorkflowPayload(
                workflowId,
                workspaceRoot=str(getattr(state, "workspaceRoot", ".")),
            )
        except AutomationWorkflowFlowError as error:
            failAutomationWorkflowFlow(error)

    @router.get("/api/workflows/{workflowId}/runs")
    def apiGetWorkflowRuns(workflowId: str, limit: int = Query(20)):
        return listAutomationWorkflowRunsPayload(workflowId, limit=limit)

    return router
