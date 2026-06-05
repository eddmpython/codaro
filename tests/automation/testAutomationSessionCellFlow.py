import asyncio

import pytest

from codaro.automation.eStop import getEmergencyStop
from codaro.automation.session import getSessionRegistry, resetSessionRegistry
from codaro.automation.session import sessionRegistry as sessionRegistryModule
from codaro.automation.sessionCellFlow import (
    AutomationSessionFlowError,
    parseAutomationSessionCell,
    runAutomationSessionCellPayload,
)


class StubBrowser:
    instances = 0

    def __init__(self) -> None:
        type(self).instances += 1
        self.actions: list[str] = []
        self._url = "about:blank"
        self.closed = False

    async def close(self) -> None:
        self.closed = True


async def stubFactory() -> StubBrowser:
    return StubBrowser()


def stubStepBuilder(action, params):
    async def step(driver: StubBrowser):
        if action == "slow":
            await asyncio.sleep(0.05)
        driver.actions.append(action)
        if action == "navigate":
            driver._url = str(params["url"])
        return {"action": action, "url": driver._url}

    return step


async def stubStateFn(driver: StubBrowser):
    return {"url": driver._url, "title": "stub"}


@pytest.fixture(autouse=True)
def cleanState(monkeypatch):
    getEmergencyStop().clear()
    resetSessionRegistry()
    StubBrowser.instances = 0
    monkeypatch.setattr(sessionRegistryModule, "createBrowserDriver", lambda options: stubFactory())
    monkeypatch.setattr(sessionRegistryModule, "buildBrowserStep", stubStepBuilder)
    monkeypatch.setattr(sessionRegistryModule, "browserState", stubStateFn)
    yield
    getEmergencyStop().clear()
    resetSessionRegistry()


def testParseBrowserCellKeyValueContract() -> None:
    cell = parseAutomationSessionCell(
        blockId="cell-1",
        executionKind="browser",
        content="\n".join([
            "session: orders",
            "action: navigate",
            "url: https://example.test",
            "headless: true",
        ]),
    )

    assert cell.kind == "browser"
    assert cell.sessionName == "orders"
    assert cell.sessionKey == "browser:orders"
    assert cell.op == "step"
    assert cell.action == "navigate"
    assert cell.params == {"url": "https://example.test"}
    assert cell.options == {"headless": True}
    assert cell.openIfMissing is False


def testParseCanonicalJsonContract() -> None:
    cell = parseAutomationSessionCell(
        blockId="cell-1",
        executionKind="browser",
        content='{"op": "step", "session": "orders", "action": "navigate", "openIfMissing": true, "params": {"url": "https://example.test"}, "options": {"headless": true}}',
    )

    assert cell.op == "step"
    assert cell.action == "navigate"
    assert cell.params == {"url": "https://example.test"}
    assert cell.options == {"headless": True}
    assert cell.openIfMissing is True


def testQueryDoesNotOpenMissingSession() -> None:
    state = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-1",
            executionKind="browser",
            content="session: orders\naction: query",
        )
    )

    assert state["status"] == "missing"
    assert state["sessionId"] is None
    assert StubBrowser.instances == 0


def testStepRequiresLiveSessionUnlessOpenIfMissing() -> None:
    with pytest.raises(AutomationSessionFlowError) as error:
        asyncio.run(
            runAutomationSessionCellPayload(
                blockId="cell-1",
                executionKind="browser",
                content="session: orders\naction: navigate\nurl: https://one.test",
            )
        )

    assert "Automation session not open" in str(error.value)
    assert StubBrowser.instances == 0


def testAutomationCellReusesLiveSessionAcrossRepeatedRuns() -> None:
    first = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-1",
            executionKind="browser",
            content="session: orders\naction: navigate\nopenIfMissing: true\nurl: https://one.test",
        )
    )
    second = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-1",
            executionKind="browser",
            sessionId=first["sessionId"],
            content="session: orders\naction: navigate\nurl: https://two.test",
        )
    )

    assert first["opened"] is True
    assert second["opened"] is False
    assert first["sessionId"] == second["sessionId"]
    assert second["result"]["url"] == "https://two.test"
    assert StubBrowser.instances == 1
    handle = getSessionRegistry().get(first["sessionId"])
    assert handle is not None
    assert handle.stepCount == 2


def testAutomationCellOpenIsIdempotentBySessionName() -> None:
    first = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-1",
            executionKind="browser",
            content="session: orders\naction: open",
        )
    )
    second = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-2",
            executionKind="browser",
            content="session: orders\naction: open",
        )
    )

    assert first["sessionId"] == second["sessionId"]
    assert first["opened"] is True
    assert second["opened"] is False
    assert StubBrowser.instances == 1


def testAutomationCellFindsSessionByNameWithoutFrontendHandle() -> None:
    first = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-a",
            executionKind="browser",
            content='{"session": "shared", "action": "navigate", "url": "https://one.test", "openIfMissing": true}',
        )
    )
    second = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-b",
            executionKind="browser",
            content='{"session": "shared", "action": "navigate", "url": "https://two.test"}',
        )
    )

    assert first["sessionId"] == second["sessionId"]
    assert second["opened"] is False
    assert StubBrowser.instances == 1


def testDesktopExecutionKindMapsToDesktopSession() -> None:
    cell = parseAutomationSessionCell(
        blockId="cell-1",
        executionKind="mouse",
        content="session: screen\naction: click\nselector: 10, 20",
    )

    assert cell.kind == "desktop"
    assert cell.params == {"x": 10, "y": 20}


def testAutomationCellCloseIsExplicitEnd() -> None:
    opened = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-1",
            executionKind="browser",
            content="session: orders\naction: open",
        )
    )
    closed = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-1",
            executionKind="browser",
            sessionId=opened["sessionId"],
            content="session: orders\naction: close\nreason: test",
        )
    )

    assert closed["closed"] is True
    assert getSessionRegistry().get(opened["sessionId"]).status.value == "closed"


def testCloseIsAllowedWhenEmergencyStopIsActive() -> None:
    opened = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-1",
            executionKind="browser",
            content="session: orders\naction: open",
        )
    )
    getEmergencyStop().trigger("test")

    closed = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-1",
            executionKind="browser",
            sessionId=opened["sessionId"],
            content="session: orders\naction: close\nreason: test",
        )
    )

    assert closed["closed"] is True


def testEmergencyStopBlocksOpenAndStepButKeepsHandleLive() -> None:
    opened = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-1",
            executionKind="browser",
            content="session: orders\naction: open",
        )
    )
    getEmergencyStop().trigger("test")

    with pytest.raises(AutomationSessionFlowError) as openError:
        asyncio.run(
            runAutomationSessionCellPayload(
                blockId="cell-2",
                executionKind="browser",
                content="session: blocked\naction: open",
            )
        )
    with pytest.raises(AutomationSessionFlowError) as stepError:
        asyncio.run(
            runAutomationSessionCellPayload(
                blockId="cell-1",
                executionKind="browser",
                sessionId=opened["sessionId"],
                content="session: orders\naction: navigate\nurl: https://blocked.test",
            )
        )

    assert "Emergency stop is active" in str(openError.value)
    assert "Emergency stop is active" in str(stepError.value)
    assert getSessionRegistry().get(opened["sessionId"]).status.value == "live"


def testConcurrentStepsKeepSingleWriterGuard() -> None:
    opened = asyncio.run(
        runAutomationSessionCellPayload(
            blockId="cell-1",
            executionKind="browser",
            content="session: orders\naction: open",
        )
    )

    async def runBoth():
        first = asyncio.create_task(
            runAutomationSessionCellPayload(
                blockId="cell-1",
                executionKind="browser",
                sessionId=opened["sessionId"],
                content="session: orders\naction: slow",
            )
        )
        await asyncio.sleep(0.01)
        with pytest.raises(AutomationSessionFlowError) as busyError:
            await runAutomationSessionCellPayload(
                blockId="cell-1",
                executionKind="browser",
                sessionId=opened["sessionId"],
                content="session: orders\naction: navigate\nurl: https://busy.test",
            )
        await first
        return busyError

    busyError = asyncio.run(runBoth())

    assert "session busy" in str(busyError.value)
