from __future__ import annotations

from codaro.ai.tools import allTools, getTool


def testClickElementToolRegistered() -> None:
    tool = getTool("click-element")
    assert tool is not None
    assert tool.handler == "clickElement"
    props = tool.parameters["properties"]
    assert "x" in props
    assert "y" in props
    assert "text" in props


def testTypeTextToolRegistered() -> None:
    tool = getTool("type-text")
    assert tool is not None
    assert tool.handler == "typeText"
    assert "text" in tool.parameters["properties"]


def testPressHotkeyToolRegistered() -> None:
    tool = getTool("press-hotkey")
    assert tool is not None
    assert tool.handler == "pressHotkey"
    assert "keys" in tool.parameters["properties"]


def testFindElementToolRegistered() -> None:
    tool = getTool("find-element")
    assert tool is not None
    assert tool.handler == "findElement"
    assert "text" in tool.parameters["properties"]


def testWaitForToolRegistered() -> None:
    tool = getTool("wait-for")
    assert tool is not None
    assert tool.handler == "waitFor"
    assert "text" in tool.parameters["properties"]
    assert "timeout" in tool.parameters["properties"]


def testOpenAutomationSessionToolRegistered() -> None:
    tool = getTool("open-automation-session")
    assert tool is not None
    assert tool.handler == "openAutomationSession"
    assert "kind" in tool.parameters["properties"]


def testRunAutomationStepToolRegistered() -> None:
    tool = getTool("run-automation-step")
    assert tool is not None
    assert tool.handler == "runAutomationStep"
    props = tool.parameters["properties"]
    assert "sessionId" in props
    assert "action" in props


def testSessionLifecycleToolsRegistered() -> None:
    for name, handler in (
        ("query-automation-session", "queryAutomationSession"),
        ("list-automation-sessions", "listAutomationSessions"),
        ("close-automation-session", "closeAutomationSession"),
    ):
        tool = getTool(name)
        assert tool is not None, name
        assert tool.handler == handler


def testTotalToolCount() -> None:
    tools = allTools()
    assert len(tools) >= 25


def testAllToolsHaveRequiredFields() -> None:
    for tool in allTools():
        assert tool.name
        assert tool.description
        assert tool.handler
        assert "type" in tool.parameters
