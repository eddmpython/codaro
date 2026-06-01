from __future__ import annotations

import os
import sys
from typing import Any

from ..ai.conversation import getConversationManager


def buildSystemHealthPayload(
    state: Any,
    *,
    processMemoryMb: float | None = None,
    pid: int | None = None,
    pythonVersion: str | None = None,
    conversationManager: Any | None = None,
) -> dict[str, Any]:
    workspaceEngine = state.workspaceEngine
    convManager = conversationManager or getConversationManager()
    return {
        "status": "ok",
        "python": pythonVersion or sys.version,
        "pid": pid if pid is not None else os.getpid(),
        "processMemoryMb": processMemoryMb if processMemoryMb is not None else currentProcessMemoryMb(),
        "sessions": {
            "active": state.sessionManager.sessionCount,
        },
        "conversations": {
            "active": convManager.conversationCount,
        },
        "engine": {
            "status": workspaceEngine.status,
            "executionCount": workspaceEngine.executionCount,
            "variableCount": len(workspaceEngine.getVariables()),
        },
    }


def currentProcessMemoryMb() -> float | None:
    try:
        import resource as _resource

        return round(_resource.getrusage(_resource.RUSAGE_SELF).ru_maxrss / 1024, 1)
    except (ImportError, AttributeError):
        pass

    try:
        import psutil

        return round(psutil.Process(os.getpid()).memory_info().rss / (1024 * 1024), 1)
    except (ImportError, AttributeError):
        return None
