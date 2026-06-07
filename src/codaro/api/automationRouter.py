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
    createAutomationTaskFromCodePayload,
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
from ..ai.agentFlow import (
    AgentRunFlowError,
    confirmAgentStepPayload,
    getAgentRunPayload,
    pauseAgentRunPayload,
    resumeAgentRunPayload,
    runBrowserAgentPayload,
    runComputerAgentPayload,
    stopAgentRunPayload,
)
from ..automation.sessionFlow import (
    AutomationSessionFlowError,
    closeAutomationSessionPayload,
    getAutomationSessionStatePayload,
    listAutomationSessionsPayload,
    openAutomationSessionPayload,
    runAutomationSessionStepPayload,
)
from ..automation.sessionCellFlow import runAutomationSessionCellPayload
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


class HarvestCodeRequest(BaseModel):
    code: str
    name: str
    description: str = ""
    schedule: str | None = None
    inputs: dict[str, Any] | None = None
    outcomeId: str | None = None  # 주면 그 outcome 숙달을 요구(졸업 게이트). 없으면 게이트 없음.


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


class OpenSessionRequest(BaseModel):
    kind: str = "browser"
    name: str = ""
    options: dict[str, Any] | None = None


class RunSessionStepRequest(BaseModel):
    action: str
    params: dict[str, Any] | None = None


class RunSessionCellRequest(BaseModel):
    blockId: str
    content: str
    executionKind: str | None = None
    sessionId: str | None = None


class RunBrowserAgentRequest(BaseModel):
    instruction: str
    startUrl: str | None = None


class RunComputerAgentRequest(BaseModel):
    instruction: str


class ConfirmAgentStepRequest(BaseModel):
    stepId: str | None = None
    approved: bool


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

    def failAutomationSessionFlow(error: AutomationSessionFlowError) -> None:
        raise HTTPException(status_code=error.statusCode, detail=error.message)

    def failAgentRunFlow(error: AgentRunFlowError) -> None:
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

    @router.post("/api/tasks/from-code")
    def apiHarvestCode(req: HarvestCodeRequest):
        # 졸업 게이트(H4.b) — outcomeId가 주어지면 그 개념을 숙달했을 때만 Harvest 허용.
        # 마스터하지 않은 코드를 자동화로 굳히는 cargo-cult를 막는다(transfer 평가로서의 Harvest).
        if req.outcomeId:
            mastery = state.learnerStateStore.getMastery(req.outcomeId)
            if not mastery.mastered:
                raise HTTPException(
                    status_code=403,
                    detail=f"아직 '{req.outcomeId}' 개념을 충분히 숙달하지 않았어요 — 조금 더 연습한 뒤 자동화로 가져가요.",
                )
        try:
            return createAutomationTaskFromCodePayload(
                code=req.code,
                name=req.name,
                description=req.description,
                schedule=req.schedule,
                inputs=req.inputs,
                workspaceRoot=str(getattr(state, "workspaceRoot", ".")),
            )
        except AutomationTaskFlowError as error:
            failAutomationTaskFlow(error)

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

    @router.get("/api/automation/sessions")
    def apiListSessions():
        return listAutomationSessionsPayload()

    @router.post("/api/automation/sessions")
    async def apiOpenSession(req: OpenSessionRequest):
        try:
            return await openAutomationSessionPayload(kind=req.kind, name=req.name, options=req.options)
        except AutomationSessionFlowError as error:
            failAutomationSessionFlow(error)

    @router.get("/api/automation/sessions/{sessionId}")
    async def apiGetSession(sessionId: str):
        try:
            return await getAutomationSessionStatePayload(sessionId)
        except AutomationSessionFlowError as error:
            failAutomationSessionFlow(error)

    @router.post("/api/automation/sessions/{sessionId}/step")
    async def apiRunSessionStep(sessionId: str, req: RunSessionStepRequest):
        try:
            return await runAutomationSessionStepPayload(sessionId, action=req.action, params=req.params)
        except AutomationSessionFlowError as error:
            failAutomationSessionFlow(error)

    @router.post("/api/automation/session-cell")
    async def apiRunSessionCell(req: RunSessionCellRequest):
        try:
            return await runAutomationSessionCellPayload(
                blockId=req.blockId,
                content=req.content,
                executionKind=req.executionKind,
                sessionId=req.sessionId,
            )
        except AutomationSessionFlowError as error:
            failAutomationSessionFlow(error)

    @router.delete("/api/automation/sessions/{sessionId}")
    async def apiCloseSession(sessionId: str):
        try:
            return await closeAutomationSessionPayload(sessionId)
        except AutomationSessionFlowError as error:
            failAutomationSessionFlow(error)

    # ── 에이전트 라인(브라우저유즈/컴퓨터유즈) 실행 ──
    @router.post("/api/automation/agent/browser/run")
    async def apiRunBrowserAgent(req: RunBrowserAgentRequest):
        try:
            return await runBrowserAgentPayload(instruction=req.instruction, startUrl=req.startUrl)
        except AgentRunFlowError as error:
            failAgentRunFlow(error)

    @router.post("/api/automation/agent/computer/run")
    async def apiRunComputerAgent(req: RunComputerAgentRequest):
        try:
            return await runComputerAgentPayload(instruction=req.instruction)
        except AgentRunFlowError as error:
            failAgentRunFlow(error)

    @router.get("/api/automation/agent/run/{runId}")
    def apiGetAgentRun(runId: str):
        try:
            return getAgentRunPayload(runId)
        except AgentRunFlowError as error:
            failAgentRunFlow(error)

    @router.post("/api/automation/agent/run/{runId}/confirm")
    def apiConfirmAgentStep(runId: str, req: ConfirmAgentStepRequest):
        try:
            return confirmAgentStepPayload(runId, approved=req.approved)
        except AgentRunFlowError as error:
            failAgentRunFlow(error)

    @router.post("/api/automation/agent/run/{runId}/pause")
    def apiPauseAgentRun(runId: str):
        try:
            return pauseAgentRunPayload(runId)
        except AgentRunFlowError as error:
            failAgentRunFlow(error)

    @router.post("/api/automation/agent/run/{runId}/resume")
    def apiResumeAgentRun(runId: str):
        try:
            return resumeAgentRunPayload(runId)
        except AgentRunFlowError as error:
            failAgentRunFlow(error)

    @router.post("/api/automation/agent/run/{runId}/stop")
    def apiStopAgentRun(runId: str):
        try:
            return stopAgentRunPayload(runId)
        except AgentRunFlowError as error:
            failAgentRunFlow(error)

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
