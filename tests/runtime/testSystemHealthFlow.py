from __future__ import annotations

from types import SimpleNamespace

from codaro.system.healthFlow import buildSystemHealthPayload


class FakeWorkspaceEngine:
    status = "ready"
    executionCount = 7

    def getVariables(self) -> list[object]:
        return [object(), object()]


def testSystemHealthPayloadKeepsRuntimeSummaryBehindSystemBoundary() -> None:
    state = SimpleNamespace(
        sessionManager=SimpleNamespace(sessionCount=3),
        workspaceEngine=FakeWorkspaceEngine(),
    )
    conversationManager = SimpleNamespace(conversationCount=5)

    payload = buildSystemHealthPayload(
        state,
        processMemoryMb=12.3,
        pid=1234,
        pythonVersion="Python test",
        conversationManager=conversationManager,
    )

    assert payload == {
        "status": "ok",
        "python": "Python test",
        "pid": 1234,
        "processMemoryMb": 12.3,
        "sessions": {"active": 3},
        "conversations": {"active": 5},
        "engine": {
            "status": "ready",
            "executionCount": 7,
            "variableCount": 2,
        },
    }
