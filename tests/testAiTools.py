from __future__ import annotations

import asyncio
import json

import pytest

from codaro.ai.tools import (
    allTools,
    getTool,
    registerTool,
    toolSchemas,
    ToolDef,
)
from codaro.ai.toolExecutor import ToolExecutor
from codaro.document.models import BlockConfig, CodaroDocument


EXPECTED_BUILTIN_TOOLS = {
    "insert-block", "update-block", "delete-block",
    "execute-reactive", "get-variables", "get-blocks",
    "fs-write", "packages-install", "check-exercise", "create-guide",
    "create-learning-card", "create-quiz",
    "create-notebook-exercise", "track-achievement",
}


def _makeDoc(blocks=None) -> CodaroDocument:
    if blocks is None:
        blocks = [
            BlockConfig(id="b1", type="code", content="x = 1"),
            BlockConfig(id="b2", type="markdown", content="# Hello"),
            BlockConfig(id="b3", type="code", content="y = x + 1"),
        ]
    return CodaroDocument(id="test-doc", title="Test", blocks=blocks)


class _MockSessionManager:
    def __init__(self):
        self._sessions = {}

    def getSession(self, sessionId):
        return self._sessions.get(sessionId)


def _makeExecutor(doc=None, workspaceRoot=None):
    if doc is None:
        doc = _makeDoc()
    return ToolExecutor(
        sessionManager=_MockSessionManager(),
        documentGetter=lambda: doc,
        documentSetter=lambda d: None,
        workspaceRoot=workspaceRoot,
    ), doc


class TestToolRegistry:

    def test_all_builtin_tools_registered(self):
        names = {t.name for t in allTools()}
        assert EXPECTED_BUILTIN_TOOLS.issubset(names)

    def test_get_returns_none_for_unknown(self):
        assert getTool("nonexistent-xyz") is None

    def test_register_custom_tool(self):
        registerTool(ToolDef(
            name="test-custom-001",
            description="temp",
            parameters={"type": "object", "properties": {}},
            handler="noop",
        ))
        assert getTool("test-custom-001") is not None

    def test_schemas_are_openai_compatible(self):
        for schema in toolSchemas():
            assert schema["type"] == "function"
            func = schema["function"]
            assert isinstance(func["name"], str)
            assert isinstance(func["description"], str)
            assert "properties" in func["parameters"]

    def test_every_tool_has_required_fields(self):
        for tool in allTools():
            assert tool.name
            assert tool.description
            assert tool.handler
            assert tool.parameters.get("type") == "object"


class TestDocumentTools:

    def test_insert_at_position(self):
        executor, doc = _makeExecutor()
        result = asyncio.run(executor.execute("insert-block", {
            "blockType": "code", "content": "z = 3", "position": 1,
        }))
        assert "blockId" in result
        assert len(doc.blocks) == 4
        assert doc.blocks[1].content == "z = 3"

    def test_insert_append(self):
        executor, doc = _makeExecutor()
        asyncio.run(executor.execute("insert-block", {
            "blockType": "markdown", "content": "# End", "position": -1,
        }))
        assert doc.blocks[-1].content == "# End"

    def test_update_existing(self):
        executor, doc = _makeExecutor()
        result = asyncio.run(executor.execute("update-block", {
            "blockId": "b1", "content": "x = 100",
        }))
        assert result["updated"] is True
        assert doc.blocks[0].content == "x = 100"

    def test_update_missing_returns_error(self):
        executor, _ = _makeExecutor()
        result = asyncio.run(executor.execute("update-block", {
            "blockId": "missing", "content": "test",
        }))
        assert "error" in result

    def test_get_blocks_returns_all(self):
        executor, doc = _makeExecutor()
        result = asyncio.run(executor.execute("get-blocks", {}))
        assert len(result["blocks"]) == len(doc.blocks)

    def test_unknown_tool_returns_error(self):
        executor, _ = _makeExecutor()
        result = asyncio.run(executor.execute("no-such-tool", {}))
        assert "error" in result

    def test_get_variables_without_session(self):
        executor, _ = _makeExecutor()
        result = asyncio.run(executor.execute("get-variables", {}))
        assert "error" in result


class TestGuide:

    def test_create_guide_adds_block(self):
        executor, doc = _makeExecutor()
        before = len(doc.blocks)
        result = asyncio.run(executor.execute("create-guide", {
            "exerciseType": "fillBlank",
            "content": "x = ___",
            "hints": ["concept", "structure", "answer"],
            "solution": "x = 1",
        }))
        assert len(doc.blocks) == before + 1
        assert doc.blocks[-1].type == "guide"
        data = json.loads(doc.blocks[-1].content)
        assert data["exerciseType"] == "fillBlank"
        assert len(data["hints"]) == 3


class TestLearningCard:

    def test_creates_three_blocks(self):
        executor, doc = _makeExecutor()
        before = len(doc.blocks)
        result = asyncio.run(executor.execute("create-learning-card", {
            "topic": "List Comprehension",
            "explanation": "A concise way to create lists.",
            "exampleCode": "squares = [x**2 for x in range(5)]",
            "fillBlankCode": "evens = [x for x in range(10) if x % ___ == 0]",
            "blanks": ["2"],
            "tags": ["python", "beginner"],
        }))
        assert len(doc.blocks) == before + 3
        assert doc.blocks[before].type == "markdown"
        assert doc.blocks[before + 1].type == "code"
        assert doc.blocks[before + 2].type == "guide"
        assert result["topic"] == "List Comprehension"
        assert len(result["blockIds"]) == 3

    def test_guide_contains_fill_blank(self):
        executor, doc = _makeExecutor()
        asyncio.run(executor.execute("create-learning-card", {
            "topic": "F-strings",
            "explanation": "Python formatted string literals.",
            "exampleCode": 'name = "World"\nprint(f"Hello {name}")',
            "fillBlankCode": 'x = 42\nresult = f"Value is {___}"',
            "blanks": ["x"],
        }))
        guideData = json.loads(doc.blocks[-1].content)
        assert guideData["exerciseType"] == "fillBlank"
        assert "x" in guideData["solution"]


class TestQuiz:

    def test_multiple_choice_quiz(self):
        executor, doc = _makeExecutor()
        before = len(doc.blocks)
        result = asyncio.run(executor.execute("create-quiz", {
            "topic": "Python Basics",
            "questions": [
                {
                    "type": "multiple-choice",
                    "question": "What is 1+1?",
                    "choices": ["1", "2", "3"],
                    "correctAnswer": "2",
                },
            ],
            "difficulty": "easy",
        }))
        assert result["questionCount"] == 1
        assert len(doc.blocks) == before + 2
        header = doc.blocks[before]
        assert "Quiz: Python Basics" in header.content

    def test_predict_output_quiz(self):
        executor, doc = _makeExecutor()
        result = asyncio.run(executor.execute("create-quiz", {
            "topic": "Strings",
            "questions": [
                {
                    "type": "predict-output",
                    "question": 'print("ab" * 3)',
                    "correctAnswer": "ababab",
                },
            ],
        }))
        guideData = json.loads(doc.blocks[-1].content)
        assert guideData["exerciseType"] == "predict"
        assert guideData["solution"] == "ababab"

    def test_coding_quiz(self):
        executor, doc = _makeExecutor()
        asyncio.run(executor.execute("create-quiz", {
            "topic": "Functions",
            "questions": [
                {
                    "type": "coding",
                    "question": "Write a function that returns the sum of two numbers.",
                    "correctAnswer": "def add(a, b): return a + b",
                },
            ],
        }))
        guideData = json.loads(doc.blocks[-1].content)
        assert guideData["exerciseType"] == "writeCode"


class TestNotebookExercise:

    def test_multi_stage_structure(self):
        executor, doc = _makeExecutor()
        before = len(doc.blocks)
        result = asyncio.run(executor.execute("create-notebook-exercise", {
            "title": "Variables",
            "stages": [
                {
                    "stage": "fill-blank",
                    "instruction": "Fill in the variable name.",
                    "starterCode": "___ = 10",
                    "solution": "x = 10",
                },
                {
                    "stage": "modify",
                    "instruction": "Change the value to 20.",
                    "starterCode": "x = 10",
                    "solution": "x = 20",
                },
            ],
        }))
        assert result["stageCount"] == 2
        assert len(doc.blocks) == before + 5
        assert "Exercise: Variables" in doc.blocks[before].content

    def test_stage_types_mapped_correctly(self):
        executor, doc = _makeExecutor()
        asyncio.run(executor.execute("create-notebook-exercise", {
            "title": "Test",
            "stages": [
                {"stage": "fill-blank", "instruction": "a", "starterCode": "a", "solution": "a"},
                {"stage": "write", "instruction": "b", "starterCode": "", "solution": "b"},
            ],
        }))
        guides = [b for b in doc.blocks if b.type == "guide"]
        assert json.loads(guides[-2].content)["exerciseType"] == "fillBlank"
        assert json.loads(guides[-1].content)["exerciseType"] == "writeCode"


class TestGenerateNotebook:

    def test_generate_with_output_path(self, tmp_path):
        executor, _ = _makeExecutor(workspaceRoot=str(tmp_path))
        result = asyncio.run(executor.execute("generate-notebook", {
            "title": "My Notebook",
            "blocks": [
                {"type": "markdown", "content": "# Hello"},
                {"type": "code", "content": "x = 1"},
            ],
            "outputPath": "generated.py",
        }))
        assert result["saved"] is True
        assert result["blockCount"] == 2
        assert (tmp_path / "generated.py").exists()

    def test_generate_without_output_loads_in_editor(self):
        captured = {}
        doc = _makeDoc()
        executor = ToolExecutor(
            sessionManager=_MockSessionManager(),
            documentGetter=lambda: doc,
            documentSetter=lambda d: captured.update(doc=d),
        )
        result = asyncio.run(executor.execute("generate-notebook", {
            "title": "Inline",
            "blocks": [{"type": "code", "content": "y = 2"}],
        }))
        assert result["saved"] is False
        assert result["loadedInEditor"] is True
        assert "doc" in captured


class TestSplitNotebook:

    def test_split_creates_files(self, tmp_path):
        doc = _makeDoc()
        executor, _ = _makeExecutor(doc=doc, workspaceRoot=str(tmp_path))
        result = asyncio.run(executor.execute("split-notebook", {
            "splits": [
                {"title": "Part A", "blockIds": ["b1"]},
                {"title": "Part B", "blockIds": ["b2", "b3"]},
            ],
            "outputDir": ".",
        }))
        assert result["splitCount"] == 2
        assert (tmp_path / "Part_A.py").exists()
        assert (tmp_path / "Part_B.py").exists()

    def test_split_missing_blocks_returns_error(self, tmp_path):
        doc = _makeDoc()
        executor, _ = _makeExecutor(doc=doc, workspaceRoot=str(tmp_path))
        result = asyncio.run(executor.execute("split-notebook", {
            "splits": [
                {"title": "Empty", "blockIds": ["nonexistent"]},
            ],
        }))
        assert result["notebooks"][0]["error"] == "No matching blocks"


class TestTrackAchievement:

    def test_records_to_file(self, tmp_path):
        executor, _ = _makeExecutor(workspaceRoot=str(tmp_path))
        result = asyncio.run(executor.execute("track-achievement", {
            "type": "exercise-complete",
            "topic": "loops",
            "score": 85,
        }))
        assert result["recorded"] is True
        assert result["topicTotal"] == 1

        achFile = tmp_path / ".codaro" / "achievements.json"
        assert achFile.exists()
        data = json.loads(achFile.read_text(encoding="utf-8"))
        assert len(data) == 1
        assert data[0]["topic"] == "loops"
        assert data[0]["score"] == 85

    def test_appends_to_existing(self, tmp_path):
        executor, _ = _makeExecutor(workspaceRoot=str(tmp_path))
        asyncio.run(executor.execute("track-achievement", {
            "type": "quiz-score", "topic": "loops", "score": 70,
        }))
        result = asyncio.run(executor.execute("track-achievement", {
            "type": "quiz-score", "topic": "loops", "score": 90,
        }))
        assert result["topicTotal"] == 2

    def test_no_workspace_returns_not_recorded(self):
        executor, _ = _makeExecutor(workspaceRoot=None)
        result = asyncio.run(executor.execute("track-achievement", {
            "type": "topic-mastery", "topic": "dicts",
        }))
        assert result["recorded"] is False
