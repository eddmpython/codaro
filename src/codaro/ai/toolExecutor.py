from __future__ import annotations

import json
import uuid
from typing import Any

from .tools import getTool, ToolDef


class ToolExecutionError(RuntimeError):
    pass


class ToolExecutor:

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
            return {"error": f"No handler for tool: {toolName}"}

        try:
            return await handler(arguments)
        except ToolExecutionError as exc:
            return {"error": str(exc)}

    async def _handle_insertBlock(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        blockType = args["blockType"]
        content = args["content"]
        position = args.get("position", -1)

        from codaro.document.models import BlockConfig

        blockId = f"block-{uuid.uuid4().hex[:8]}"
        newBlock = BlockConfig(id=blockId, type=blockType, content=content)

        if position < 0 or position >= len(doc.blocks):
            doc.blocks.append(newBlock)
        else:
            doc.blocks.insert(position, newBlock)

        self._saveDocument(doc)
        return {"blockId": blockId, "position": position, "type": blockType}

    async def _handle_updateBlock(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        blockId = args["blockId"]
        content = args["content"]

        for block in doc.blocks:
            if block.id == blockId:
                block.content = content
                self._saveDocument(doc)
                return {"blockId": blockId, "updated": True}

        return {"error": f"Block not found: {blockId}"}

    async def _handle_deleteBlock(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        blockId = args["blockId"]

        for i, block in enumerate(doc.blocks):
            if block.id == blockId:
                doc.blocks.pop(i)
                session = self._getSession()
                session.removeCellDefinitions(blockId)
                self._saveDocument(doc)
                return {"blockId": blockId, "deleted": True}

        return {"error": f"Block not found: {blockId}"}

    async def _handle_executeReactive(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        session = self._getSession()
        blockId = args["blockId"]

        block = None
        for b in doc.blocks:
            if b.id == blockId:
                block = b
                break

        if block is None:
            return {"error": f"Block not found: {blockId}"}
        if block.type != "code":
            return {"error": f"Block {blockId} is not a code block"}

        from codaro.kernel.reactive import executeReactive

        blocksData = [
            {"id": b.id, "type": b.type, "content": b.content}
            for b in doc.blocks
        ]

        results, executionOrder = await executeReactive(session, blocksData, blockId)

        outputs = []
        for result in results:
            outputs.append({
                "blockId": result.blockId,
                "status": result.status,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "data": result.data,
            })

        return {
            "executionOrder": executionOrder,
            "results": outputs,
        }

    async def _handle_getVariables(self, args: dict[str, Any]) -> dict[str, Any]:
        session = self._getSession()
        variables = session.getVariables()
        return {
            "variables": [
                {
                    "name": v.name,
                    "type": v.typeName,
                    "repr": v.repr,
                    "size": v.size,
                }
                for v in variables
            ]
        }

    async def _handle_getBlocks(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        return {
            "blocks": [
                {
                    "id": b.id,
                    "type": b.type,
                    "content": b.content[:500],
                    "collapsed": b.collapsed,
                }
                for b in doc.blocks
            ]
        }

    async def _handle_fsWrite(self, args: dict[str, Any]) -> dict[str, Any]:
        session = self._getSession()
        path = args["path"]
        content = args["content"]
        result = await session.writeFile(path, content)
        return {"path": result, "written": True}

    async def _handle_packagesInstall(self, args: dict[str, Any]) -> dict[str, Any]:
        session = self._getSession()
        name = args["name"]
        result = await session.installPackage(name)
        return {
            "package": name,
            "success": result.success,
            "message": result.message,
        }

    async def _handle_checkExercise(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        session = self._getSession()
        blockId = args["blockId"]
        checkType = args["checkType"]
        expected = args.get("expected", "")

        block = None
        for b in doc.blocks:
            if b.id == blockId:
                block = b
                break
        if block is None:
            return {"error": f"Block not found: {blockId}"}

        if checkType == "noError":
            result = await session.execute(block.content, blockId=blockId)
            passed = result.status != "error"
            return {"passed": passed, "status": result.status, "stdout": result.stdout, "stderr": result.stderr}

        if checkType == "outputMatch":
            result = await session.execute(block.content, blockId=blockId)
            actual = (result.stdout or "").strip()
            expectedStripped = expected.strip()
            passed = actual == expectedStripped
            return {"passed": passed, "actual": actual, "expected": expectedStripped}

        if checkType == "outputContains":
            result = await session.execute(block.content, blockId=blockId)
            actual = result.stdout or ""
            passed = expected in actual
            return {"passed": passed, "actual": actual, "pattern": expected}

        if checkType == "variableCheck":
            result = await session.execute(block.content, blockId=blockId)
            variables = session.getVariables()
            varMap = {v.name: v.repr for v in variables}
            passed = expected in json.dumps(varMap, ensure_ascii=False)
            return {"passed": passed, "variables": varMap}

        if checkType == "codeContains":
            passed = expected in block.content
            return {"passed": passed, "pattern": expected}

        return {"error": f"Unknown check type: {checkType}"}

    async def _handle_createGuide(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        exerciseType = args["exerciseType"]
        content = args["content"]
        hints = args.get("hints", [])
        solution = args.get("solution", "")
        description = args.get("description", "")
        difficulty = args.get("difficulty", "medium")
        position = args.get("position", -1)

        from codaro.document.models import BlockConfig

        blockId = f"guide-{uuid.uuid4().hex[:8]}"

        guideContent = json.dumps({
            "exerciseType": exerciseType,
            "description": description,
            "content": content,
            "hints": hints,
            "solution": solution,
            "difficulty": difficulty,
        }, ensure_ascii=False)

        newBlock = BlockConfig(id=blockId, type="guide", content=guideContent)

        if position < 0 or position >= len(doc.blocks):
            doc.blocks.append(newBlock)
        else:
            doc.blocks.insert(position, newBlock)

        self._saveDocument(doc)
        return {
            "blockId": blockId,
            "exerciseType": exerciseType,
            "position": position,
        }
