from __future__ import annotations

import asyncio

from codaro.automation.loop.automationLoop import AutomationLoop, LoopConfig, LoopStatus, LoopStep


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def _makeLoop(
    failAction: str | None = None,
    config: LoopConfig | None = None,
):
    calls: list[tuple[str, dict]] = []

    async def actionHandler(action, params):
        calls.append((action, params))
        if action == failAction:
            return {"error": "Simulated failure"}
        return {"ok": True}

    async def verificationHandler(text, params):
        return text != "fail-verify"

    loop = AutomationLoop(
        actionHandler=actionHandler,
        verificationHandler=verificationHandler,
        config=config or LoopConfig(),
    )
    return loop, calls


def testLoopStepSerialize() -> None:
    step = LoopStep(id="s0", action="click", parameters={"x": 10})
    data = step.serialize()
    assert data["id"] == "s0"
    assert data["action"] == "click"
    assert data["status"] == "pending"


def testLoopRunsAllSteps() -> None:
    loop, calls = _makeLoop()
    loop.addStep("click-element", {"x": 100, "y": 200})
    loop.addStep("type-text", {"text": "hello"})
    loop.addStep("press-hotkey", {"keys": ["ctrl", "s"]})

    result = _run(loop.run())
    assert result["status"] == "completed"
    assert result["completedSteps"] == 3
    assert len(calls) == 3


def testLoopEmptySteps() -> None:
    loop, _ = _makeLoop()
    result = _run(loop.run())
    assert "error" in result


def testLoopRetryOnFailure() -> None:
    loop, calls = _makeLoop(failAction="bad-action")
    loop.addStep("bad-action", {}, maxRetries=2)

    result = _run(loop.run())
    assert result["failedSteps"] == 1
    assert len(calls) == 3


def testLoopAbortOnConsecutiveFailures() -> None:
    loop, _ = _makeLoop(
        failAction="bad",
        config=LoopConfig(maxConsecutiveFailures=2),
    )
    loop.addStep("bad", {}, maxRetries=0)
    loop.addStep("bad", {}, maxRetries=0)
    loop.addStep("click-element", {})

    result = _run(loop.run())
    assert result["status"] == "failed"
    assert result["completedSteps"] == 0


def testLoopVerification() -> None:
    loop, _ = _makeLoop()
    loop.addStep("click-element", {}, verification="fail-verify", maxRetries=1)

    result = _run(loop.run())
    assert result["failedSteps"] == 1


def testLoopProgress() -> None:
    loop, _ = _makeLoop()
    loop.addStep("click", {})
    loop.addStep("type", {})

    assert loop.progress["status"] == "idle"
    assert loop.progress["totalSteps"] == 2

    _run(loop.run())
    assert loop.progress["status"] == "completed"
    assert loop.progress["completedSteps"] == 2


def testLoopAddStepsBatch() -> None:
    loop, _ = _makeLoop()
    steps = loop.addSteps([
        {"action": "click", "parameters": {"x": 1}},
        {"action": "type", "parameters": {"text": "hi"}},
    ])
    assert len(steps) == 2
    assert steps[0].action == "click"
    assert steps[1].action == "type"


def testLoopCancel() -> None:
    loop, _ = _makeLoop()
    loop.addStep("click", {})

    assert loop.cancel() is False

    loop._status = LoopStatus.RUNNING
    assert loop.cancel() is True
    assert loop.status == LoopStatus.CANCELLED


def testLoopPauseResume() -> None:
    loop, _ = _makeLoop()
    assert loop.pause() is False

    loop._status = LoopStatus.RUNNING
    assert loop.pause() is True
    assert loop.status == LoopStatus.PAUSED
    assert loop.resume() is True
    assert loop.status == LoopStatus.RUNNING


def testLoopSerialize() -> None:
    loop, _ = _makeLoop()
    loop.addStep("click", {"x": 10})
    data = loop.serialize()
    assert "planId" in data
    assert data["totalSteps"] == 1
    assert len(data["steps"]) == 1
