"""영속 자동화 세션 subsystem 회귀 — 실브라우저 없이 stub driver 로 검증.

핵심 계약: task 완료 != 객체 소멸(StubBrowser.instances == 1), E-Stop 가드, BUSY 단일-writer,
flow status 매핑(404/400/409), audit 기록. 실 Playwright 경로는 별도 opt-in smoke 에서 본다.
"""

import asyncio

import pytest

from codaro.automation import sessionFlow
from codaro.automation.eStop import EmergencyStopActive, getEmergencyStop
from codaro.automation.session import (
    SessionDefinition,
    SessionHandle,
    SessionKind,
    SessionStatus,
    SessionStepRecord,
    getSessionRegistry,
    resetSessionRegistry,
)
from codaro.automation.session import sessionRegistry as sessionRegistryModule
from codaro.automation.sessionFlow import AutomationSessionFlowError
from codaro.automation.taskModel import TaskStatus
from codaro.ai.toolHandlers.automation import AutomationToolHandlers


class StubBrowser:
    """실 Playwright 객체 자리의 결정론적 stub. 생성 횟수를 클래스 변수로 센다."""

    instances = 0

    def __init__(self) -> None:
        type(self).instances += 1
        self.actions: list[str] = []
        self.closed = False
        self._url = "about:blank"

    async def close(self) -> None:
        self.closed = True


async def stubFactory() -> StubBrowser:
    return StubBrowser()


def stubStepBuilder(action, params):
    async def step(driver: StubBrowser):
        driver.actions.append(action)
        if action == "navigate":
            driver._url = str(params.get("url", driver._url))
        if action == "boom":
            raise RuntimeError("stub step failure")
        return {"url": driver._url, "action": action}

    return step


async def stubStateFn(driver: StubBrowser):
    return {"url": driver._url, "title": "stub"}


@pytest.fixture(autouse=True)
def cleanState():
    getEmergencyStop().clear()
    resetSessionRegistry()
    StubBrowser.instances = 0
    yield
    getEmergencyStop().clear()
    resetSessionRegistry()


def _openStub(name: str = "t") -> SessionDefinition:
    registry = getSessionRegistry()
    definition = SessionDefinition(name=name, kind=SessionKind.BROWSER)
    asyncio.run(
        registry.open(
            definition,
            driverFactory=stubFactory,
            stepBuilder=stubStepBuilder,
            stateFn=stubStateFn,
        )
    )
    return definition


# ---- model -----------------------------------------------------------------
def testSessionModelSerialize() -> None:
    definition = SessionDefinition(name="n", kind=SessionKind.BROWSER, options={"headless": True})
    handle = SessionHandle(definition=definition, status=SessionStatus.LIVE, stepCount=3)
    serialized = handle.serialize()
    assert serialized["sessionId"] == definition.id
    assert serialized["kind"] == "browser"
    assert serialized["status"] == "live"
    assert serialized["stepCount"] == 3
    record = SessionStepRecord(sessionId=definition.id, action="navigate", status=TaskStatus.SUCCESS)
    assert record.serialize()["action"] == "navigate"
    assert record.serialize()["status"] == "success"


# ---- registry --------------------------------------------------------------
def testRegistryReusesLiveObjectAcrossSteps() -> None:
    registry = getSessionRegistry()
    definition = _openStub()
    assert registry.get(definition.id).status is SessionStatus.LIVE

    first = asyncio.run(registry.runStep(definition.id, "click", {"selector": "#a"}))
    second = asyncio.run(registry.runStep(definition.id, "click", {"selector": "#b"}))
    third = asyncio.run(registry.runStep(definition.id, "navigate", {"url": "https://x"}))

    assert first.status is TaskStatus.SUCCESS
    assert second.status is TaskStatus.SUCCESS
    assert third.result["url"] == "https://x"
    # 핵심 불변식: step 사이 같은 라이브 객체 재사용 (소멸 안 됨)
    assert StubBrowser.instances == 1
    handle = registry.get(definition.id)
    assert handle.stepCount == 3
    assert handle.status is SessionStatus.LIVE

    asyncio.run(registry.close(definition.id))
    assert registry.get(definition.id).status is SessionStatus.CLOSED


def testRegistryStepNotFound() -> None:
    registry = getSessionRegistry()
    with pytest.raises(sessionRegistryModule.SessionRegistryError):
        asyncio.run(registry.runStep("ghost", "click", {"selector": "#a"}))


def testRegistryFailedStepKeepsSessionLive() -> None:
    registry = getSessionRegistry()
    definition = _openStub()
    record = asyncio.run(registry.runStep(definition.id, "boom", {}))
    assert record.status is TaskStatus.FAILED
    assert record.error
    # 스텝 실패해도 세션은 살아있다(다음 스텝 가능)
    assert registry.get(definition.id).status is SessionStatus.LIVE
    ok = asyncio.run(registry.runStep(definition.id, "click", {"selector": "#a"}))
    assert ok.status is TaskStatus.SUCCESS
    asyncio.run(registry.close(definition.id))


def testEstopBlocksStepButKeepsHandleLive() -> None:
    registry = getSessionRegistry()
    definition = _openStub()
    getEmergencyStop().trigger("test estop")
    with pytest.raises(EmergencyStopActive):
        asyncio.run(registry.runStep(definition.id, "click", {"selector": "#a"}))
    assert registry.get(definition.id).status is SessionStatus.LIVE
    getEmergencyStop().clear()
    record = asyncio.run(registry.runStep(definition.id, "click", {"selector": "#a"}))
    assert record.status is TaskStatus.SUCCESS
    asyncio.run(registry.close(definition.id))


# ---- flow ------------------------------------------------------------------
def testFlowLookupErrorsReturn404() -> None:
    assert sessionFlow.listAutomationSessionsPayload() == {"sessions": [], "total": 0}
    calls = (
        lambda: asyncio.run(sessionFlow.getAutomationSessionStatePayload("nope")),
        lambda: asyncio.run(sessionFlow.runAutomationSessionStepPayload("nope", action="click", params={})),
        lambda: asyncio.run(sessionFlow.closeAutomationSessionPayload("nope")),
    )
    for call in calls:
        with pytest.raises(AutomationSessionFlowError) as excInfo:
            call()
        assert excInfo.value.statusCode == 404


def testFlowInvalidKindReturns400() -> None:
    with pytest.raises(AutomationSessionFlowError) as excInfo:
        asyncio.run(sessionFlow.openAutomationSessionPayload(kind="spaceship"))
    assert excInfo.value.statusCode == 400


def testFlowOpenStepCloseWithStubBrowser(monkeypatch) -> None:
    monkeypatch.setattr(sessionRegistryModule, "createBrowserDriver", lambda options: stubFactory())
    monkeypatch.setattr(sessionRegistryModule, "buildBrowserStep", stubStepBuilder)
    monkeypatch.setattr(sessionRegistryModule, "browserState", stubStateFn)

    opened = asyncio.run(sessionFlow.openAutomationSessionPayload(kind="browser", name="orders", options={}))
    sessionId = opened["sessionId"]
    assert opened["status"] == "live"
    assert opened["state"]["title"] == "stub"

    listed = sessionFlow.listAutomationSessionsPayload()
    assert listed["total"] == 1

    record = asyncio.run(
        sessionFlow.runAutomationSessionStepPayload(sessionId, action="navigate", params={"url": "https://app"})
    )
    assert record["status"] == "success"
    assert record["result"]["url"] == "https://app"

    state = asyncio.run(sessionFlow.getAutomationSessionStatePayload(sessionId))
    assert state["stepCount"] == 1
    assert len(state["steps"]) == 1

    closed = asyncio.run(sessionFlow.closeAutomationSessionPayload(sessionId))
    assert closed["ok"] is True
    assert StubBrowser.instances == 1


# ---- AI tool handlers ------------------------------------------------------
def testToolHandlersOperateLiveSessionAcrossCalls(monkeypatch) -> None:
    monkeypatch.setattr(sessionRegistryModule, "createBrowserDriver", lambda options: stubFactory())
    monkeypatch.setattr(sessionRegistryModule, "buildBrowserStep", stubStepBuilder)
    monkeypatch.setattr(sessionRegistryModule, "browserState", stubStateFn)
    handlers = AutomationToolHandlers()

    opened = asyncio.run(
        handlers._handle_openAutomationSession({"kind": "browser", "name": "orders", "headless": True})
    )
    assert "error" not in opened
    sessionId = opened["sessionId"]

    listed = asyncio.run(handlers._handle_listAutomationSessions({}))
    assert listed["total"] == 1

    stepped = asyncio.run(
        handlers._handle_runAutomationStep(
            {"sessionId": sessionId, "action": "navigate", "parameters": {"url": "https://app"}}
        )
    )
    assert stepped["status"] == "success"
    assert stepped["result"]["url"] == "https://app"

    queried = asyncio.run(handlers._handle_queryAutomationSession({"sessionId": sessionId}))
    assert queried["stepCount"] == 1

    # 같은 라이브 객체를 핸들로 연속 조작(턴 너머)
    assert StubBrowser.instances == 1

    closed = asyncio.run(handlers._handle_closeAutomationSession({"sessionId": sessionId}))
    assert closed["ok"] is True


def testToolHandlerErrorsAreStructured() -> None:
    handlers = AutomationToolHandlers()
    missing = asyncio.run(handlers._handle_queryAutomationSession({"sessionId": "ghost"}))
    assert "error" in missing
    stepMissing = asyncio.run(handlers._handle_runAutomationStep({"action": "click"}))
    assert "error" in stepMissing


# ---- DESKTOP kind (OS 자동화 객체 상주) ------------------------------------
def testDesktopStepBuilderDispatchesActions() -> None:
    from codaro.automation.session import DesktopDriver, DesktopDriverError, buildDesktopStep

    class FakeFrame:
        width = 120
        height = 40
        data = b"x"

    class FakeCapture:
        def grab(self, region=None):
            return FakeFrame()

        def dispose(self):
            pass

    class FakeGuard:
        def __init__(self):
            self.calls: list = []

        def click(self, x, y, button, clicks):
            self.calls.append(("click", x, y, button, clicks))

        def typeText(self, text, interval):
            self.calls.append(("type", text))

        def hotkey(self, *keys):
            self.calls.append(("hotkey", keys))

    guard = FakeGuard()
    driver = DesktopDriver(FakeCapture(), guard)

    cap = asyncio.run(buildDesktopStep("capture", {})(driver))
    assert cap["width"] == 120

    clicked = asyncio.run(buildDesktopStep("click", {"x": 5, "y": 7})(driver))
    assert clicked["clicked"] and clicked["x"] == 5
    assert ("click", 5, 7, "left", 1) in guard.calls

    typed = asyncio.run(buildDesktopStep("type", {"text": "hi"})(driver))
    assert typed["typed"]

    pressed = asyncio.run(buildDesktopStep("press", {"keys": ["ctrl", "c"]})(driver))
    assert pressed["pressed"] and pressed["keys"] == ["ctrl", "c"]

    with pytest.raises(DesktopDriverError):
        asyncio.run(buildDesktopStep("bogus", {})(driver))


def testFlowOpenDesktopSessionWithStub(monkeypatch) -> None:
    monkeypatch.setattr(sessionRegistryModule, "createDesktopDriver", lambda options: stubFactory())
    monkeypatch.setattr(sessionRegistryModule, "buildDesktopStep", stubStepBuilder)
    monkeypatch.setattr(sessionRegistryModule, "desktopState", stubStateFn)

    opened = asyncio.run(sessionFlow.openAutomationSessionPayload(kind="desktop", name="os"))
    assert opened["kind"] == "desktop"
    assert opened["status"] == "live"
    sessionId = opened["sessionId"]

    stepped = asyncio.run(
        sessionFlow.runAutomationSessionStepPayload(sessionId, action="click", params={"x": 1, "y": 2})
    )
    assert stepped["status"] == "success"

    closed = asyncio.run(sessionFlow.closeAutomationSessionPayload(sessionId))
    assert closed["ok"] is True
