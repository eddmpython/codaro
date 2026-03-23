from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

from ..automation.audit import getAuditTrail
from ..automation.eStop import getEmergencyStop
from ..automation.taskModel import TaskDefinition
from ..automation.taskRegistry import getTaskRegistry
from ..automation.taskRunner import TaskRunner
from ..automation.workflow import getWorkflowEngine

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

    @router.get("/api/tasks")
    def apiListTasks():
        registry = getTaskRegistry()
        tasks = registry.listTasks()
        return {
            "tasks": [t.serialize() for t in tasks],
            "total": len(tasks),
        }

    @router.post("/api/tasks")
    def apiCreateTask(req: CreateTaskRequest):
        registry = getTaskRegistry()
        task = registry.create(
            name=req.name,
            documentPath=req.documentPath,
            description=req.description,
            schedule=req.schedule,
            inputs=req.inputs,
        )
        return task.serialize()

    @router.get("/api/tasks/{taskId}")
    def apiGetTask(taskId: str):
        registry = getTaskRegistry()
        task = registry.get(taskId)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        lastRun = registry.getLastRun(taskId)
        result = task.serialize()
        if lastRun:
            result["lastRun"] = lastRun.serialize()
        return result

    @router.put("/api/tasks/{taskId}")
    def apiUpdateTask(taskId: str, req: UpdateTaskRequest):
        registry = getTaskRegistry()
        task = registry.update(
            taskId,
            name=req.name,
            description=req.description,
            schedule=req.schedule,
            enabled=req.enabled,
        )
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return task.serialize()

    @router.delete("/api/tasks/{taskId}")
    def apiDeleteTask(taskId: str):
        registry = getTaskRegistry()
        deleted = registry.delete(taskId)
        if not deleted:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"ok": True}

    @router.post("/api/tasks/{taskId}/run")
    async def apiRunTask(taskId: str):
        registry = getTaskRegistry()
        task = registry.get(taskId)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")

        workspaceRoot = str(getattr(state, "workspaceRoot", "."))
        runner = TaskRunner(workspaceRoot=workspaceRoot)
        run = await runner.run(task)
        registry.addRun(run)
        return run.serialize()

    @router.get("/api/tasks/{taskId}/runs")
    def apiGetRuns(taskId: str, limit: int = Query(20)):
        registry = getTaskRegistry()
        task = registry.get(taskId)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        runs = registry.getRuns(taskId, limit=limit)
        return {"runs": [r.serialize() for r in runs]}

    @router.put("/api/tasks/{taskId}/schedule")
    def apiSetSchedule(taskId: str, req: ScheduleRequest):
        registry = getTaskRegistry()
        task = registry.update(taskId, schedule=req.schedule)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")

        from ..automation.scheduler import parseScheduleSeconds

        if parseScheduleSeconds(req.schedule) is None:
            raise HTTPException(status_code=400, detail=f"Invalid schedule: {req.schedule}")

        scheduler = _getScheduler()
        workspaceRoot = str(getattr(state, "workspaceRoot", "."))

        async def _runScheduled():
            fresh = registry.get(taskId)
            if fresh is None or not fresh.enabled:
                scheduler.cancel(taskId)
                return
            runner = TaskRunner(workspaceRoot=workspaceRoot)
            run = await runner.run(fresh)
            registry.addRun(run)

        scheduler.schedule(taskId, req.schedule, _runScheduled)
        return {"ok": True, "schedule": req.schedule}

    @router.delete("/api/tasks/{taskId}/schedule")
    def apiCancelSchedule(taskId: str):
        scheduler = _getScheduler()
        cancelled = scheduler.cancel(taskId)
        if not cancelled:
            raise HTTPException(status_code=404, detail="No active schedule for this task")
        registry = getTaskRegistry()
        registry.update(taskId, schedule=None)
        return {"ok": True}

    @router.get("/api/scheduler/status")
    def apiSchedulerStatus():
        scheduler = _getScheduler()
        return {
            "activeJobs": scheduler.listScheduled(),
            "jobCount": scheduler.jobCount,
        }

    @router.post("/api/webhooks/trigger/{taskId}")
    async def apiWebhookTrigger(taskId: str, request: Request):
        registry = getTaskRegistry()
        task = registry.get(taskId)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        if not task.enabled:
            raise HTTPException(status_code=403, detail="Task is disabled")

        try:
            payload = await request.json()
        except (json.JSONDecodeError, ValueError) as exc:
            logger.warning("webhook body parse failed for task %s: %s", taskId, exc)
            payload = {}

        workspaceRoot = str(getattr(state, "workspaceRoot", "."))
        runner = TaskRunner(workspaceRoot=workspaceRoot)
        run = await runner.run(task)
        registry.addRun(run)
        return {
            "triggered": True,
            "taskId": taskId,
            "runId": run.id,
            "status": run.status.value,
        }

    @router.get("/api/automation/e-stop")
    def apiGetEStop():
        return getEmergencyStop().serialize()

    @router.post("/api/automation/e-stop")
    async def apiTriggerEStop(request: Request):
        body = {}
        try:
            body = await request.json()
        except (json.JSONDecodeError, ValueError) as exc:
            logger.debug("e-stop body parse: %s", exc)
        reason = body.get("reason", "Manual trigger via API")
        eStop = getEmergencyStop()
        triggered = eStop.trigger(reason)
        if not triggered:
            raise HTTPException(status_code=409, detail="E-Stop already active")

        scheduler = _getScheduler()
        scheduler.cancelAll()

        return eStop.serialize()

    @router.delete("/api/automation/e-stop")
    def apiClearEStop():
        eStop = getEmergencyStop()
        cleared = eStop.clear()
        if not cleared:
            raise HTTPException(status_code=409, detail="E-Stop is not active")
        return eStop.serialize()

    @router.get("/api/automation/resource-usage")
    def apiResourceUsage():
        sessionMgr = getattr(state, "sessionManager", None)
        if sessionMgr is None:
            return {"sessions": []}
        snapshots = []
        for session in sessionMgr.listSessions():
            engine = getattr(session, "engine", None)
            if engine is not None and hasattr(engine, "getResourceUsage"):
                snap = engine.getResourceUsage()
                snapshots.append({
                    "sessionId": session.id,
                    "memoryMb": round(snap.memoryMb, 1),
                    "cpuPercent": round(snap.cpuPercent, 1),
                    "uptime": round(snap.uptime, 1),
                    "alive": snap.alive,
                })
        return {"sessions": snapshots}

    @router.get("/api/automation/audit")
    def apiGetAuditLog(
        actionType: str | None = Query(None),
        date: str | None = Query(None),
        limit: int = Query(100),
    ):
        trail = getAuditTrail()
        if date:
            entries = trail.queryFromDisk(date=date, actionType=actionType, limit=limit)
        else:
            entries = [e.serialize() for e in trail.query(actionType=actionType, limit=limit)]
        return {"entries": entries, "count": len(entries)}

    @router.get("/api/automation/input-policy")
    def apiGetInputPolicy():
        guard = _getInputGuard()
        return guard.policy.serialize()

    @router.put("/api/automation/input-policy")
    async def apiUpdateInputPolicy(request: Request):
        body = await request.json()
        guard = _getInputGuard()
        policy = guard.policy
        if "maxActionsPerSecond" in body:
            policy.maxActionsPerSecond = int(body["maxActionsPerSecond"])
        if "maxActionsPerMinute" in body:
            policy.maxActionsPerMinute = int(body["maxActionsPerMinute"])
        if "humanDelay" in body:
            policy.humanDelay = bool(body["humanDelay"])
        if "enabled" in body:
            policy.enabled = bool(body["enabled"])
        if "allowedScreenRegion" in body:
            r = body["allowedScreenRegion"]
            if r is None:
                policy.allowedScreenRegion = None
            else:
                from ..automation.vision.capture import Region
                policy.allowedScreenRegion = Region(x=r["x"], y=r["y"], width=r["width"], height=r["height"])
        return policy.serialize()

    @router.post("/api/automation/recording/start")
    def apiStartRecording():
        recorder = _getRecorder()
        recordingId = recorder.start()
        return {"recordingId": recordingId, "status": "recording"}

    @router.post("/api/automation/recording/stop")
    async def apiStopRecording(request: Request):
        from ..automation.recorder.recipeGenerator import RecipeGenerator
        body = {}
        try:
            body = await request.json()
        except (json.JSONDecodeError, ValueError) as exc:
            logger.debug("recording stop body: %s", exc)
        recorder = _getRecorder()
        actions = recorder.stop()
        title = body.get("title", "Recorded Automation")

        generator = RecipeGenerator()
        recipe = generator.generate(actions, title=title)
        summary = generator.generateDict(actions, title=title)
        recorder.reset()
        return {"recipe": recipe, "summary": summary}

    @router.get("/api/automation/recording/status")
    def apiRecordingStatus():
        recorder = _getRecorder()
        return recorder.serialize()

    @router.post("/api/automation/plan/execute")
    async def apiExecutePlan(request: Request):
        from ..automation.loop.automationLoop import AutomationLoop, LoopConfig
        body = await request.json()
        steps = body.get("steps", [])

        if not steps:
            raise HTTPException(status_code=400, detail="No steps provided")

        config = LoopConfig(
            maxConsecutiveFailures=body.get("maxConsecutiveFailures", 3),
        )

        async def actionHandler(action: str, params: dict[str, Any]) -> dict[str, Any]:
            return {"status": "simulated", "action": action}

        loop = AutomationLoop(actionHandler=actionHandler, config=config)
        loop.addSteps(steps)
        _activePlans[loop.planId] = loop

        result = await loop.run()
        return result

    @router.get("/api/automation/plan/{planId}/status")
    def apiGetPlanStatus(planId: str):
        loop = _activePlans.get(planId)
        if loop is None:
            raise HTTPException(status_code=404, detail="Plan not found")
        return loop.serialize()

    @router.post("/api/automation/plan/{planId}/pause")
    def apiPausePlan(planId: str):
        loop = _activePlans.get(planId)
        if loop is None:
            raise HTTPException(status_code=404, detail="Plan not found")
        paused = loop.pause()
        if not paused:
            raise HTTPException(status_code=409, detail="Cannot pause plan in current state")
        return loop.progress

    @router.post("/api/automation/plan/{planId}/resume")
    def apiResumePlan(planId: str):
        loop = _activePlans.get(planId)
        if loop is None:
            raise HTTPException(status_code=404, detail="Plan not found")
        resumed = loop.resume()
        if not resumed:
            raise HTTPException(status_code=409, detail="Cannot resume plan in current state")
        return loop.progress

    @router.post("/api/automation/voice/listen")
    async def apiVoiceListen(request: Request):
        import asyncio
        body = {}
        try:
            body = await request.json()
        except (json.JSONDecodeError, ValueError) as exc:
            logger.debug("voice body: %s", exc)
        duration = min(body.get("duration", 5), 30)
        language = body.get("language", "en")

        from ..automation.voice.whisperEngine import WhisperEngine
        engine = WhisperEngine()
        try:
            engine.startListening(language=language)
            await asyncio.sleep(duration)
            result = engine.stopListening()
        except ImportError as exc:
            return {"error": f"Voice dependencies not installed: {exc}"}
        finally:
            engine.dispose()

        if result is None:
            return {"error": "No audio captured"}
        return result.serialize()

    @router.post("/api/automation/voice/speak")
    async def apiVoiceSpeak(request: Request):
        body = await request.json()
        text = body.get("text", "")
        rate = body.get("rate", 150)

        from ..automation.voice.pyttsx3Speaker import Pyttsx3Speaker
        speaker = Pyttsx3Speaker()
        try:
            speaker.speak(text, rate=rate)
        except ImportError as exc:
            return {"error": f"Voice dependencies not installed: {exc}"}
        finally:
            speaker.dispose()

        return {"spoken": True, "text": text}

    @router.post("/api/automation/voice/command")
    async def apiVoiceCommand(request: Request):
        body = await request.json()
        text = body.get("text", "")

        from ..automation.voice.commandParser import CommandParser
        parser = CommandParser()
        cmd = parser.parse(text)
        if cmd is None:
            return {"error": "Empty text"}

        action = parser.parseToAction(text)
        return {
            "command": cmd.serialize(),
            "action": action,
        }

    @router.get("/api/automation/channels")
    def apiListChannels():
        bridge = _getMessageBridgeApi()
        channels = bridge.listChannels()
        return {"channels": [c.serialize() for c in channels]}

    @router.post("/api/automation/channels")
    async def apiAddChannel(request: Request):
        body = await request.json()
        from ..automation.integrations.messageBridge import MessageChannel
        channel = MessageChannel(
            name=body["name"],
            channelType=body["channelType"],
            webhookUrl=body["webhookUrl"],
            enabled=body.get("enabled", True),
        )
        bridge = _getMessageBridgeApi()
        bridge.addChannel(channel)
        return channel.serialize()

    @router.delete("/api/automation/channels/{channelName}")
    def apiRemoveChannel(channelName: str):
        bridge = _getMessageBridgeApi()
        removed = bridge.removeChannel(channelName)
        if not removed:
            raise HTTPException(status_code=404, detail="Channel not found")
        return {"ok": True}

    @router.post("/api/automation/notify")
    async def apiSendNotification(request: Request):
        body = await request.json()
        channel = body.get("channel", "all")
        message = body.get("message", "")

        bridge = _getMessageBridgeApi()
        if channel == "all":
            results = bridge.broadcast(message)
            return {"results": [r.serialize() for r in results]}

        result = bridge.send(channel, message)
        return result.serialize()

    @router.get("/api/workflows")
    def apiListWorkflows():
        engine = getWorkflowEngine(str(getattr(state, "workspaceRoot", ".")))
        workflows = engine.listWorkflows()
        return {"workflows": [w.serialize() for w in workflows], "total": len(workflows)}

    @router.post("/api/workflows")
    def apiCreateWorkflow(req: CreateWorkflowRequest):
        engine = getWorkflowEngine(str(getattr(state, "workspaceRoot", ".")))
        workflow = engine.create(name=req.name, steps=req.steps, description=req.description)
        return workflow.serialize()

    @router.get("/api/workflows/{workflowId}")
    def apiGetWorkflow(workflowId: str):
        engine = getWorkflowEngine()
        workflow = engine.get(workflowId)
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return workflow.serialize()

    @router.delete("/api/workflows/{workflowId}")
    def apiDeleteWorkflow(workflowId: str):
        engine = getWorkflowEngine()
        deleted = engine.delete(workflowId)
        if not deleted:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return {"ok": True}

    @router.post("/api/workflows/{workflowId}/run")
    async def apiRunWorkflow(workflowId: str):
        engine = getWorkflowEngine(str(getattr(state, "workspaceRoot", ".")))
        try:
            wfRun = await engine.run(workflowId)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=str(exc))
        return wfRun.serialize()

    @router.get("/api/workflows/{workflowId}/runs")
    def apiGetWorkflowRuns(workflowId: str, limit: int = Query(20)):
        engine = getWorkflowEngine()
        runs = engine.getRuns(workflowId, limit=limit)
        return {"runs": [r.serialize() for r in runs]}

    return router


_scheduler = None
_activePlans: dict[str, Any] = {}


def _getMessageBridgeApi():
    from ..automation.shared import getSharedMessageBridge
    return getSharedMessageBridge()


def _getRecorder():
    from ..automation.shared import getSharedRecorder
    return getSharedRecorder()


def _getInputGuard():
    from ..automation.shared import getSharedInputGuard
    return getSharedInputGuard()


def _getScheduler():
    global _scheduler
    if _scheduler is None:
        from ..automation.scheduler import TaskScheduler
        _scheduler = TaskScheduler()
    return _scheduler
