from __future__ import annotations

import asyncio
import enum
import logging
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Awaitable

from ..eStop import getEmergencyStop
from ..audit import getAuditTrail
from ..vision.capture import Region

logger = logging.getLogger(__name__)


class LoopStatus(enum.Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass(slots=True)
class LoopStep:
    id: str
    action: str
    parameters: dict[str, Any] = field(default_factory=dict)
    verification: str | None = None
    verificationParams: dict[str, Any] = field(default_factory=dict)
    retryCount: int = 0
    maxRetries: int = 2
    status: str = "pending"
    result: dict[str, Any] | None = None
    error: str | None = None

    def serialize(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "action": self.action,
            "parameters": self.parameters,
            "verification": self.verification,
            "status": self.status,
            "retryCount": self.retryCount,
            "result": self.result,
            "error": self.error,
        }


@dataclass(slots=True)
class LoopConfig:
    maxSteps: int = 100
    stepTimeoutSeconds: float = 30.0
    verificationDelaySeconds: float = 0.5
    maxConsecutiveFailures: int = 3
    captureOnVerification: bool = True


ActionHandler = Callable[[str, dict[str, Any]], Awaitable[dict[str, Any]]]
VerificationHandler = Callable[[str, dict[str, Any]], Awaitable[bool]]


class AutomationLoop:

    def __init__(
        self,
        actionHandler: ActionHandler,
        verificationHandler: VerificationHandler | None = None,
        config: LoopConfig | None = None,
    ) -> None:
        self._actionHandler = actionHandler
        self._verificationHandler = verificationHandler
        self._config = config or LoopConfig()
        self._steps: list[LoopStep] = []
        self._status = LoopStatus.IDLE
        self._currentStepIndex = 0
        self._planId = f"plan-{uuid.uuid4().hex[:10]}"
        self._pauseEvent = asyncio.Event()
        self._pauseEvent.set()
        self._consecutiveFailures = 0
        self._startTime: float | None = None
        self._endTime: float | None = None

    @property
    def planId(self) -> str:
        return self._planId

    @property
    def status(self) -> LoopStatus:
        return self._status

    @property
    def steps(self) -> list[LoopStep]:
        return list(self._steps)

    @property
    def progress(self) -> dict[str, Any]:
        completed = sum(1 for s in self._steps if s.status == "completed")
        failed = sum(1 for s in self._steps if s.status == "failed")
        return {
            "planId": self._planId,
            "status": self._status.value,
            "totalSteps": len(self._steps),
            "completedSteps": completed,
            "failedSteps": failed,
            "currentStep": self._currentStepIndex,
            "elapsed": round(time.monotonic() - self._startTime, 1) if self._startTime else 0,
        }

    def addStep(
        self,
        action: str,
        parameters: dict[str, Any] | None = None,
        verification: str | None = None,
        verificationParams: dict[str, Any] | None = None,
        maxRetries: int = 2,
    ) -> LoopStep:
        step = LoopStep(
            id=f"step-{len(self._steps)}",
            action=action,
            parameters=parameters or {},
            verification=verification,
            verificationParams=verificationParams or {},
            maxRetries=maxRetries,
        )
        self._steps.append(step)
        return step

    def addSteps(self, steps: list[dict[str, Any]]) -> list[LoopStep]:
        result = []
        for s in steps:
            result.append(self.addStep(
                action=s["action"],
                parameters=s.get("parameters", {}),
                verification=s.get("verification"),
                verificationParams=s.get("verificationParams", {}),
                maxRetries=s.get("maxRetries", 2),
            ))
        return result

    async def run(self) -> dict[str, Any]:
        if not self._steps:
            return {"error": "No steps to execute", "planId": self._planId}

        self._status = LoopStatus.RUNNING
        self._startTime = time.monotonic()
        self._consecutiveFailures = 0
        audit = getAuditTrail()

        try:
            while self._currentStepIndex < len(self._steps):
                getEmergencyStop().check()
                await self._pauseEvent.wait()

                if self._status == LoopStatus.CANCELLED:
                    break

                step = self._steps[self._currentStepIndex]
                step.status = "running"

                success = await self._executeStep(step)

                if success:
                    step.status = "completed"
                    self._consecutiveFailures = 0
                    audit.record(
                        "automationStep",
                        "loop",
                        {"planId": self._planId, "stepId": step.id, "action": step.action},
                    )
                else:
                    step.status = "failed"
                    self._consecutiveFailures += 1

                    if self._consecutiveFailures >= self._config.maxConsecutiveFailures:
                        self._status = LoopStatus.FAILED
                        logger.warning("Automation loop aborted: %d consecutive failures", self._consecutiveFailures)
                        break

                self._currentStepIndex += 1

            if self._status == LoopStatus.RUNNING:
                self._status = LoopStatus.COMPLETED

        except Exception as exc:  # noqa: BLE001 — top-level loop error boundary
            self._status = LoopStatus.FAILED
            logger.exception("Automation loop error: %s", exc)

        self._endTime = time.monotonic()
        return self.progress

    async def _executeStep(self, step: LoopStep) -> bool:
        for attempt in range(step.maxRetries + 1):
            step.retryCount = attempt
            try:
                result = await asyncio.wait_for(
                    self._actionHandler(step.action, step.parameters),
                    timeout=self._config.stepTimeoutSeconds,
                )
                step.result = result

                if result.get("error"):
                    step.error = result["error"]
                    continue

                if step.verification and self._verificationHandler:
                    await asyncio.sleep(self._config.verificationDelaySeconds)
                    verified = await self._verificationHandler(
                        step.verification, step.verificationParams
                    )
                    if not verified:
                        step.error = "Verification failed"
                        continue

                return True

            except asyncio.TimeoutError:
                step.error = f"Step timed out after {self._config.stepTimeoutSeconds}s"
            except Exception as exc:  # noqa: BLE001 — step action handler
                step.error = str(exc)

        return False

    def pause(self) -> bool:
        if self._status != LoopStatus.RUNNING:
            return False
        self._status = LoopStatus.PAUSED
        self._pauseEvent.clear()
        return True

    def resume(self) -> bool:
        if self._status != LoopStatus.PAUSED:
            return False
        self._status = LoopStatus.RUNNING
        self._pauseEvent.set()
        return True

    def cancel(self) -> bool:
        if self._status not in (LoopStatus.RUNNING, LoopStatus.PAUSED):
            return False
        self._status = LoopStatus.CANCELLED
        self._pauseEvent.set()
        return True

    def serialize(self) -> dict[str, Any]:
        return {
            **self.progress,
            "steps": [s.serialize() for s in self._steps],
        }
