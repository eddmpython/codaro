from __future__ import annotations

import asyncio
import json

import pytest

import codaro.automation.taskRegistry as taskRegistryModule
from codaro.ai.tools import (
    allTools,
    defaultTools,
    getTool,
    registerTool,
    toolSchemas,
    ToolDef,
)
from codaro.ai.toolContract import validateDefaultToolContract
from codaro.ai.toolExecutor import ToolExecutor
from codaro.ai.toolManifest import (
    TOOL_CATEGORIES,
    TOOL_LANES,
    TOOL_METADATA,
    TOOL_RISK,
    TOOL_TARGETS,
    toolDescriptor,
)
from codaro.document.models import BlockConfig, CodaroDocument
from codaro.kernel.session import KernelSession
from codaro.system.packageOps import InstallResult, PackageInfo


EXPECTED_BUILTIN_TOOLS = {
    "insert-block", "update-block", "delete-block",
    "execute-reactive", "get-variables", "get-blocks",
    "read-cells", "write-cell", "cell-call", "write-curriculum-yaml",
    "write-automation-recipe", "create-automation-task",
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


class _PackageSession:
    async def listPackages(self):
        return [PackageInfo(name="numpy", version="2.0.0")]

    async def installPackage(self, packageName: str):
        return InstallResult(
            package=packageName,
            success=True,
            message="already installed",
            durationMs=42,
            skipped=True,
        )


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

    def test_default_tool_list_matches_registry(self):
        defaultNames = {tool.name for tool in defaultTools()}
        registeredNames = {tool.name for tool in allTools()}
        assert defaultNames.issubset(registeredNames)

    def test_default_tool_contract_is_complete(self):
        assert validateDefaultToolContract() == []

    def test_tool_manifest_metadata_is_ssot(self):
        for tool in allTools():
            metadata = TOOL_METADATA[tool.name]
            descriptor = toolDescriptor(tool.name)

            assert TOOL_CATEGORIES[tool.name] == metadata.category
            assert TOOL_LANES[tool.name] == metadata.lane
            assert TOOL_TARGETS[tool.name] == metadata.target
            assert TOOL_RISK[tool.name] == metadata.risk
            assert descriptor["category"] == metadata.category
            assert descriptor["lane"] == metadata.lane
            assert descriptor["target"] == metadata.target
            assert descriptor["risk"] == metadata.risk

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

    def test_curriculum_yaml_tool_schema_promotes_structured_section_contract(self):
        schema = next(schema for schema in toolSchemas() if schema["function"]["name"] == "write-curriculum-yaml")
        function = schema["function"]
        yamlDescription = function["parameters"]["properties"]["yamlContent"]["description"]

        assert "Required structured contract for new lessons" in yamlDescription
        assert "intro(direction,benefits,diagram.steps,diagram.runtime)" in yamlDescription
        assert "sections[].title/subtitle/goal/why/explanation/tips/snippet/exercise/check" in yamlDescription
        assert "Each section becomes one learning card" in yamlDescription
        assert "do not use sections[].blocks unless converting a legacy curriculum" in function["description"]

    def test_legacy_learning_card_tool_does_not_compete_with_section_card_lessons(self):
        schema = next(schema for schema in toolSchemas() if schema["function"]["name"] == "create-learning-card")
        description = schema["function"]["description"]

        assert "legacy targeted concept drill" in description
        assert "Prefer write-curriculum-yaml" in description
        assert "structured section-card lessons" in description

    def test_automation_task_tool_requires_dry_run_percent_format_recipe(self):
        schema = next(schema for schema in toolSchemas() if schema["function"]["name"] == "create-automation-task")
        description = schema["function"]["description"]

        assert "dry-run percent-format automation recipe" in description

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

    def test_read_cells_returns_full_cell_content(self):
        executor, _ = _makeExecutor()
        result = asyncio.run(executor.execute("read-cells", {"blockIds": ["b1"]}))
        assert result["blockCount"] == 1
        assert result["blocks"][0]["content"] == "x = 1"

    def test_write_cell_insert_update_delete(self):
        executor, doc = _makeExecutor()
        inserted = asyncio.run(executor.execute("write-cell", {
            "operation": "insert",
            "blockType": "code",
            "content": "z = 3",
            "position": 1,
        }))
        blockId = inserted["blockId"]
        assert doc.blocks[1].content == "z = 3"

        updated = asyncio.run(executor.execute("write-cell", {
            "operation": "update",
            "blockId": blockId,
            "content": "z = 4",
        }))
        assert updated["updated"] is True
        assert doc.blocks[1].content == "z = 4"

        deleted = asyncio.run(executor.execute("write-cell", {
            "operation": "delete",
            "blockId": blockId,
        }))
        assert deleted["deleted"] is True
        assert all(block.id != blockId for block in doc.blocks)

    def test_unknown_tool_returns_error(self):
        executor, _ = _makeExecutor()
        result = asyncio.run(executor.execute("no-such-tool", {}))
        assert "error" in result

    def test_get_variables_without_session(self):
        executor, _ = _makeExecutor()
        result = asyncio.run(executor.execute("get-variables", {}))
        assert "error" in result

    def test_execute_reactive_uses_current_document_blocks(self):
        session = KernelSession()
        sessionManager = _MockSessionManager()
        sessionManager._sessions[session.sessionId] = session
        doc = _makeDoc([
            BlockConfig(id="b1", type="code", content="x = 10"),
            BlockConfig(id="b2", type="code", content="y = x * 2"),
            BlockConfig(id="b3", type="markdown", content="note"),
        ])
        executor = ToolExecutor(
            sessionManager=sessionManager,
            documentGetter=lambda: doc,
            documentSetter=lambda d: None,
        )
        executor.setActiveSession(session.sessionId)

        result = asyncio.run(executor.execute("execute-reactive", {"blockId": "b1"}))

        assert result["executionOrder"] == ["b1", "b2"]
        assert [item["status"] for item in result["results"]] == ["done", "done"]
        assert session._registry.get("y") == 20
        session.dispose()

    def test_check_exercise_uses_curriculum_check_dispatch(self):
        session = KernelSession()
        sessionManager = _MockSessionManager()
        sessionManager._sessions[session.sessionId] = session
        doc = _makeDoc([BlockConfig(id="answer", type="code", content="print(42)")])
        executor = ToolExecutor(
            sessionManager=sessionManager,
            documentGetter=lambda: doc,
            documentSetter=lambda d: None,
        )
        executor.setActiveSession(session.sessionId)

        result = asyncio.run(executor.execute("check-exercise", {
            "blockId": "answer",
            "checkType": "outputMatch",
            "expected": "42",
        }))

        assert result["passed"] is True
        assert result["actual"] == "42"
        session.dispose()

    def test_packages_install_exposes_uv_metadata(self):
        sessionManager = _MockSessionManager()
        sessionManager._sessions["session-1"] = _PackageSession()
        executor = ToolExecutor(sessionManager=sessionManager, documentGetter=lambda: _makeDoc())
        executor.setActiveSession("session-1")

        result = asyncio.run(executor.execute("packages-install", {"name": "pandas"}))

        assert result == {
            "package": "pandas",
            "success": True,
            "message": "already installed",
            "installer": "uv",
            "environment": "project .venv",
            "durationMs": 42,
            "skipped": True,
        }

    def test_packages_check_treats_standard_library_as_ready(self):
        sessionManager = _MockSessionManager()
        sessionManager._sessions["session-1"] = _PackageSession()
        executor = ToolExecutor(sessionManager=sessionManager, documentGetter=lambda: _makeDoc())
        executor.setActiveSession("session-1")

        result = asyncio.run(executor.execute("packages-check", {"names": ["io", "pandas", "numpy"]}))

        assert result["missing"] == ["pandas"]
        packages = {item["name"]: item for item in result["packages"]}
        assert packages["io"] == {"name": "io", "installed": True, "version": "stdlib"}
        assert packages["numpy"] == {"name": "numpy", "installed": True, "version": "2.0.0"}


class TestAutomationAuthoringTools:

    def test_write_automation_recipe_creates_file_and_automation_cell(self, tmp_path):
        doc = _makeDoc(blocks=[])
        executor, doc = _makeExecutor(doc=doc, workspaceRoot=str(tmp_path))

        result = asyncio.run(executor.execute("write-automation-recipe", {
            "title": "Daily Report",
            "description": "Prepare the recurring report.",
            "code": "print('report ready')",
        }))

        recipePath = tmp_path / "automations" / "daily-report.py"
        assert result["saved"] is True
        assert result["path"] == str(recipePath)
        assert result["loadedInEditor"] is True
        assert result["blockId"] == doc.blocks[0].id
        assert recipePath.exists()

        recipe = recipePath.read_text(encoding="utf-8")
        assert "# %% [markdown]" in recipe
        assert "# %% [automation]" in recipe
        assert "DRY_RUN = True" in recipe
        assert "print('report ready')" in recipe

        block = doc.blocks[0]
        assert block.type == "automation"
        assert block.role == "automation"
        assert block.executionKind == "python"
        assert block.sourceType == "automationAuthoring"
        assert block.payload["recipePath"] == str(recipePath)
        assert "DRY_RUN = True" in block.content

    def test_create_automation_task_registers_dry_run_recipe(self, tmp_path, monkeypatch):
        monkeypatch.setenv("CODARO_HOME", str(tmp_path / "home"))
        taskRegistryModule._registry = None
        recipePath = tmp_path / "recipes" / "report.py"
        recipePath.parent.mkdir()
        recipePath.write_text("# %% [automation]\nDRY_RUN = True\n\nprint('ok')\n", encoding="utf-8")
        executor, _ = _makeExecutor(workspaceRoot=str(tmp_path))

        result = asyncio.run(executor.execute("create-automation-task", {
            "name": "Run report",
            "description": "Daily report task",
            "documentPath": "recipes/report.py",
            "schedule": "@every_15m",
            "inputs": {"dryRun": True},
        }))

        taskRegistryModule._registry = None
        assert result["created"] is True
        assert result["documentPath"] == str(recipePath)
        assert result["task"]["name"] == "Run report"
        assert result["task"]["description"] == "Daily report task"
        assert result["task"]["schedule"] == "@every_15m"
        assert result["task"]["inputs"] == {"dryRun": True}
        assert result["recipeValidation"] == {"percentFormat": True, "dryRunFirst": True}
        assert (tmp_path / "home" / "tasks" / "index.json").exists()

    def test_create_automation_task_rejects_missing_recipe(self, tmp_path, monkeypatch):
        monkeypatch.setenv("CODARO_HOME", str(tmp_path / "home"))
        taskRegistryModule._registry = None
        executor, _ = _makeExecutor(workspaceRoot=str(tmp_path))

        result = asyncio.run(executor.execute("create-automation-task", {
            "name": "Missing",
            "documentPath": "missing.py",
        }))

        taskRegistryModule._registry = None
        assert result["error"] == "Automation recipe not found: missing.py"

    def test_create_automation_task_rejects_recipe_without_dry_run(self, tmp_path, monkeypatch):
        monkeypatch.setenv("CODARO_HOME", str(tmp_path / "home"))
        taskRegistryModule._registry = None
        recipePath = tmp_path / "recipes" / "unsafe.py"
        recipePath.parent.mkdir()
        recipePath.write_text("# %% [automation]\nprint('writes now')\n", encoding="utf-8")
        executor, _ = _makeExecutor(workspaceRoot=str(tmp_path))

        result = asyncio.run(executor.execute("create-automation-task", {
            "name": "Unsafe",
            "documentPath": "recipes/unsafe.py",
        }))

        taskRegistryModule._registry = None
        assert result["error"] == "Automation task requires DRY_RUN = True before registration."


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


class TestCurriculumYaml:

    def test_write_curriculum_yaml_loads_document(self):
        captured = {}
        doc = _makeDoc()
        executor = ToolExecutor(
            sessionManager=_MockSessionManager(),
            documentGetter=lambda: doc,
            documentSetter=lambda d: captured.update(doc=d),
        )

        yamlContent = """
meta:
  title: AI Pandas Starter
intro:
  points:
    - Load data first
sections:
  - title: DataFrame basics
    blocks:
      - type: text
        content: Read the rows, then run the cell.
      - type: code
        content: |
          import pandas as pd
          df = pd.DataFrame({"name": ["A"], "score": [90]})
          print(df)
"""

        result = asyncio.run(executor.execute("write-curriculum-yaml", {
            "yamlContent": yamlContent,
            "contentId": "ai-pandas",
        }))

        assert result["loadedInEditor"] is True
        assert result["title"] == "AI Pandas Starter"
        assert result["blockCount"] >= 3
        assert "document" in result
        assert captured["doc"].title == "AI Pandas Starter"

    def test_write_structured_curriculum_yaml_reports_materialization_counts(self):
        captured = {}
        executor = ToolExecutor(
            sessionManager=_MockSessionManager(),
            documentGetter=lambda: _makeDoc(),
            documentSetter=lambda d: captured.update(doc=d),
        )

        yamlContent = """
meta:
  title: Structured Pandas
  packages:
    - pandas
intro:
  direction: 표 데이터를 직접 만듭니다.
sections:
  - title: DataFrame 만들기
    subtitle: 행과 열의 감각
    goal: dict에서 표를 만듭니다.
    why: 반복 리포트의 출발점입니다.
    explanation: key가 열 이름입니다.
    tips:
      - 열 길이는 같아야 합니다.
    snippet: |
      import pandas as pd
      frame = pd.DataFrame({"sales": [10]})
    exercise:
      prompt: sales 열을 직접 만드세요.
      starterCode: |
        import pandas as pd
        frame = ___
      solution: |
        import pandas as pd
        frame = pd.DataFrame({"sales": [10, 20]})
      hints:
        - dict를 사용합니다.
      check:
        variable: frame
    check:
      noError: 에러 없이 실행되어야 합니다.
"""

        result = asyncio.run(executor.execute("write-curriculum-yaml", {"yamlContent": yamlContent}))

        assert result["sectionCount"] == 1
        assert result["exerciseCellCount"] == 1
        assert result["snippetCellCount"] == 1
        assert result["contractGapCount"] == 0
        assert result["contractGaps"] == []
        assert result["runtimePackageCount"] == 1
        assert result["loadedInEditor"] is True
        assert captured["doc"].runtime.packages == ["pandas"]

    def test_write_structured_curriculum_yaml_reports_contract_gaps(self):
        executor = ToolExecutor(
            sessionManager=_MockSessionManager(),
            documentGetter=lambda: _makeDoc(),
            documentSetter=lambda _doc: None,
        )

        yamlContent = """
meta:
  title: Partial Structured Pandas
sections:
  - title: DataFrame 만들기
    goal: dict에서 표를 만듭니다.
"""

        result = asyncio.run(executor.execute("write-curriculum-yaml", {"yamlContent": yamlContent}))

        assert result["contractGapCount"] == 8
        assert result["contractGaps"][0]["title"] == "DataFrame 만들기"
        assert result["contractGaps"][0]["missingFields"] == [
            "subtitle",
            "why",
            "explanation",
            "tips",
            "snippet",
            "exercise.prompt",
            "exercise.starterCode",
            "check",
        ]


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
