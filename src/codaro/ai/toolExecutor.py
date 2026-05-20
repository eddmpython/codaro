from __future__ import annotations

from pathlib import Path
from typing import Any

from .toolHandlers.automation import AutomationToolHandlers
from .toolHandlers.learning import LearningToolHandlers
from .toolHandlers.runtime import RuntimeToolHandlers
from .toolHandlers.workbench import WorkbenchToolHandlers
from .tools import getTool


class ToolExecutionError(RuntimeError):
    pass


class ToolExecutor(
    AutomationToolHandlers,
    LearningToolHandlers,
    RuntimeToolHandlers,
    WorkbenchToolHandlers,
):
    def __init__(
        self,
        sessionManager: Any,
        documentGetter: Any = None,
        documentSetter: Any = None,
        workspaceRoot: str | None = None,
    ) -> None:
        self._sessionManager = sessionManager
        self._documentGetter = documentGetter
        self._documentSetter = documentSetter
        self._workspaceRoot = workspaceRoot
        self._activeSessionId: str | None = None

    def setActiveSession(self, sessionId: str) -> None:
        self._activeSessionId = sessionId

    def _getSession(self):
        if not self._activeSessionId:
            raise ToolExecutionError("No active kernel session")
        session = self._sessionManager.getSession(self._activeSessionId)
        if session is None:
            raise ToolExecutionError(f"Session not found: {self._activeSessionId}")
        return session

    def _getDocument(self):
        if self._documentGetter is None:
            raise ToolExecutionError("No document loaded")
        doc = self._documentGetter()
        if doc is None:
            raise ToolExecutionError("No document loaded")
        return doc

    def _saveDocument(self, doc) -> None:
        if self._documentSetter is not None:
            self._documentSetter(doc)

    async def execute(self, toolName: str, arguments: dict[str, Any]) -> dict[str, Any]:
        tool = getTool(toolName)
        if tool is None:
            return {"error": f"Unknown tool: {toolName}"}

        handlerName = tool.handler
        handler = getattr(self, f"_handle_{handlerName}", None)

        if handler is None:
            from ..customTool import getCustomToolHandler

            customHandler = getCustomToolHandler(handlerName)
            if customHandler is not None:
                try:
                    import asyncio

                    if asyncio.iscoroutinefunction(customHandler):
                        result = await customHandler(**arguments)
                    else:
                        result = customHandler(**arguments)
                    if isinstance(result, dict):
                        return result
                    return {"result": result}
                except TypeError as exc:
                    return {"error": f"Custom tool argument error: {exc}"}
                except ToolExecutionError as exc:
                    return {"error": str(exc)}

        if handler is None:
            return {"error": f"No handler for tool: {toolName}"}

        try:
            return await handler(arguments)
        except ToolExecutionError as exc:
            return {"error": str(exc)}

    def _validatePath(self, rawPath: str) -> str:
        if self._workspaceRoot is None:
            return rawPath
        root = Path(self._workspaceRoot).resolve()
        target = Path(rawPath).expanduser()
        if not target.is_absolute():
            target = root / target
        target = target.resolve()
        if not target.is_relative_to(root):
            raise ToolExecutionError("Path must stay within the active workspace.")
        return str(target)
