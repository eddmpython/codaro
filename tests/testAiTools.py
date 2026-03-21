from __future__ import annotations

import asyncio
import json
import uuid

import pytest

from codaro.ai.tools import (
    allTools,
    getTool,
    registerTool,
    toolSchemas,
    ToolDef,
    TOOL_INSERT_BLOCK,
    TOOL_UPDATE_BLOCK,
    TOOL_DELETE_BLOCK,
    TOOL_EXECUTE_REACTIVE,
    TOOL_GET_VARIABLES,
    TOOL_GET_BLOCKS,
    TOOL_FS_WRITE,
    TOOL_PACKAGES_INSTALL,
    TOOL_CHECK_EXERCISE,
    TOOL_CREATE_GUIDE,
)
from codaro.ai.toolExecutor import ToolExecutor, ToolExecutionError
from codaro.document.models import BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig, AppConfig


class TestToolRegistry:
    def test_default_tools_registered(self):
        tools = allTools()
        names = {t.name for t in tools}
        assert "insert-block" in names
        assert "update-block" in names
        assert "delete-block" in names
        assert "execute-reactive" in names
        assert "get-variables" in names
        assert "get-blocks" in names
        assert "fs-write" in names
        assert "packages-install" in names
        assert "check-exercise" in names
        assert "create-guide" in names

    def test_get_tool(self):
        tool = getTool("insert-block")
        assert tool is not None
        assert tool.name == "insert-block"
        assert tool.handler == "insertBlock"

    def test_get_unknown_tool(self):
        assert getTool("nonexistent") is None

    def test_tool_schemas_format(self):
        schemas = toolSchemas()
        assert isinstance(schemas, list)
        assert len(schemas) >= 10
        for schema in schemas:
            assert schema["type"] == "function"
            assert "function" in schema
            func = schema["function"]
            assert "name" in func
            assert "description" in func
            assert "parameters" in func

    def test_register_custom_tool(self):
        custom = ToolDef(
            name="test-custom",
            description="A test tool",
            parameters={"type": "object", "properties": {}},
            handler="testCustom",
        )
        registerTool(custom)
        assert getTool("test-custom") is not None

    def test_insert_block_schema(self):
        tool = TOOL_INSERT_BLOCK
        assert "blockType" in tool.parameters["properties"]
        assert "content" in tool.parameters["properties"]
        assert "blockType" in tool.parameters["required"]
        assert "content" in tool.parameters["required"]

    def test_create_guide_schema(self):
        tool = TOOL_CREATE_GUIDE
        props = tool.parameters["properties"]
        assert "exerciseType" in props
        assert "hints" in props
        assert "solution" in props
        assert props["exerciseType"]["enum"] == ["fillBlank", "predict", "fixBug", "modify", "writeCode", "buildUp"]

    def test_check_exercise_schema(self):
        tool = TOOL_CHECK_EXERCISE
        props = tool.parameters["properties"]
        assert "checkType" in props
        assert props["checkType"]["enum"] == ["outputMatch", "outputContains", "variableCheck", "codeContains", "noError"]


def _makeDoc(blocks=None) -> CodaroDocument:
    if blocks is None:
        blocks = [
            BlockConfig(id="b1", type="code", content="x = 1"),
            BlockConfig(id="b2", type="markdown", content="# Hello"),
            BlockConfig(id="b3", type="code", content="y = x + 1"),
        ]
    return CodaroDocument(
        id="test-doc",
        title="Test",
        blocks=blocks,
    )


class _MockSessionManager:
    def __init__(self):
        self._sessions = {}

    def getSession(self, sessionId):
        return self._sessions.get(sessionId)


class TestToolExecutor:
    def _makeExecutor(self, doc=None):
        if doc is None:
            doc = _makeDoc()
        sessionManager = _MockSessionManager()
        return ToolExecutor(
            sessionManager=sessionManager,
            documentGetter=lambda: doc,
            documentSetter=lambda d: None,
        ), doc

    def test_insert_block(self):
        executor, doc = self._makeExecutor()
        result = asyncio.run(executor.execute("insert-block", {
            "blockType": "code",
            "content": "z = 3",
            "position": 1,
        }))
        assert "blockId" in result
        assert len(doc.blocks) == 4
        assert doc.blocks[1].content == "z = 3"

    def test_insert_block_append(self):
        executor, doc = self._makeExecutor()
        result = asyncio.run(executor.execute("insert-block", {
            "blockType": "markdown",
            "content": "# Appended",
            "position": -1,
        }))
        assert doc.blocks[-1].content == "# Appended"

    def test_update_block(self):
        executor, doc = self._makeExecutor()
        result = asyncio.run(executor.execute("update-block", {
            "blockId": "b1",
            "content": "x = 100",
        }))
        assert result["updated"] is True
        assert doc.blocks[0].content == "x = 100"

    def test_update_nonexistent_block(self):
        executor, doc = self._makeExecutor()
        result = asyncio.run(executor.execute("update-block", {
            "blockId": "nonexistent",
            "content": "test",
        }))
        assert "error" in result

    def test_get_blocks(self):
        executor, doc = self._makeExecutor()
        result = asyncio.run(executor.execute("get-blocks", {}))
        assert "blocks" in result
        assert len(result["blocks"]) == 3
        assert result["blocks"][0]["id"] == "b1"

    def test_unknown_tool(self):
        executor, doc = self._makeExecutor()
        result = asyncio.run(executor.execute("nonexistent-tool", {}))
        assert "error" in result

    def test_no_session_error(self):
        executor, doc = self._makeExecutor()
        result = asyncio.run(executor.execute("get-variables", {}))
        assert "error" in result
        assert "No active kernel session" in result["error"]

    def test_create_guide(self):
        executor, doc = self._makeExecutor()
        result = asyncio.run(executor.execute("create-guide", {
            "exerciseType": "fillBlank",
            "content": "x = ___",
            "hints": ["Think about assignment", "x = <value>", "x = 1"],
            "solution": "x = 1",
            "description": "Fill in the blank",
            "difficulty": "easy",
        }))
        assert "blockId" in result
        assert result["exerciseType"] == "fillBlank"
        guideBlock = doc.blocks[-1]
        assert guideBlock.type == "guide"
        data = json.loads(guideBlock.content)
        assert data["exerciseType"] == "fillBlank"
        assert len(data["hints"]) == 3
