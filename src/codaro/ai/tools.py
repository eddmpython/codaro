from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass(frozen=True)
class ToolDef:
    name: str
    description: str
    parameters: dict[str, Any]
    handler: str


_TOOL_REGISTRY: dict[str, ToolDef] = {}


def registerTool(tool: ToolDef) -> None:
    _TOOL_REGISTRY[tool.name] = tool


def getTool(name: str) -> ToolDef | None:
    return _TOOL_REGISTRY.get(name)


def allTools() -> list[ToolDef]:
    return list(_TOOL_REGISTRY.values())


def toolSchemas() -> list[dict[str, Any]]:
    return [
        {
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters,
            },
        }
        for tool in _TOOL_REGISTRY.values()
    ]


TOOL_GROUPS: dict[str, dict[str, str]] = {
    "workbench": {
        "label": "Workbench",
        "description": "Create and edit the live notebook surface.",
    },
    "runtime": {
        "label": "Runtime",
        "description": "Run code, inspect state, and validate student work.",
    },
    "learning": {
        "label": "Learning",
        "description": "Generate curriculum, exercises, quizzes, and progress events.",
    },
    "files": {
        "label": "Files",
        "description": "Write files, install packages, and create notebooks.",
    },
    "automation": {
        "label": "Automation",
        "description": "Record, execute, and monitor desktop or workflow automation.",
    },
    "sensory": {
        "label": "Sensory",
        "description": "Read screen, voice, UI state, and external channels.",
    },
    "safety": {
        "label": "Safety",
        "description": "Control emergency stop and guarded external actions.",
    },
}


TOOL_LANE_GROUPS: dict[str, dict[str, str]] = {
    "curriculum": {
        "label": "Curriculum",
        "description": "Author YAML learning specs and materialize them as editor cells.",
    },
    "read": {
        "label": "Read",
        "description": "Inspect learning cells, runtime state, files, or visible UI state.",
    },
    "write": {
        "label": "Write",
        "description": "Create, update, delete, or stage editor/workspace content.",
    },
    "cell-call": {
        "label": "Cell Call",
        "description": "Run, check, or inspect a specific learning cell.",
    },
    "progress": {
        "label": "Progress",
        "description": "Record completion, mastery, and learner state.",
    },
    "automation": {
        "label": "Automation",
        "description": "Record or execute multi-step external workflows.",
    },
    "safety": {
        "label": "Safety",
        "description": "Guard input actions and stop unsafe automation.",
    },
}


_TOOL_CATEGORIES: dict[str, str] = {
    "read-cells": "workbench",
    "write-cell": "workbench",
    "cell-call": "runtime",
    "write-curriculum-yaml": "learning",
    "insert-block": "workbench",
    "update-block": "workbench",
    "delete-block": "workbench",
    "get-blocks": "workbench",
    "execute-reactive": "runtime",
    "get-variables": "runtime",
    "check-exercise": "runtime",
    "create-guide": "learning",
    "create-learning-card": "learning",
    "create-quiz": "learning",
    "create-notebook-exercise": "learning",
    "track-achievement": "learning",
    "split-notebook": "files",
    "generate-notebook": "files",
    "fs-write": "files",
    "packages-check": "files",
    "packages-install": "files",
    "http-request": "automation",
    "start-recording": "automation",
    "stop-recording": "automation",
    "run-automation": "automation",
    "capture-screen": "sensory",
    "read-screen-text": "sensory",
    "find-element": "sensory",
    "detect-elements": "sensory",
    "voice-listen": "sensory",
    "voice-speak": "sensory",
    "send-notification": "sensory",
    "click-element": "safety",
    "type-text": "safety",
    "press-hotkey": "safety",
    "wait-for": "safety",
    "emergency-stop": "safety",
}


_TOOL_LANES: dict[str, str] = {
    "read-cells": "read",
    "write-cell": "write",
    "cell-call": "cell-call",
    "write-curriculum-yaml": "curriculum",
    "get-blocks": "read",
    "get-variables": "read",
    "insert-block": "write",
    "update-block": "write",
    "delete-block": "write",
    "execute-reactive": "cell-call",
    "check-exercise": "cell-call",
    "create-guide": "write",
    "create-learning-card": "write",
    "create-quiz": "write",
    "create-notebook-exercise": "write",
    "track-achievement": "progress",
    "split-notebook": "write",
    "generate-notebook": "write",
    "fs-write": "write",
    "packages-check": "read",
    "packages-install": "write",
    "http-request": "automation",
    "start-recording": "automation",
    "stop-recording": "automation",
    "run-automation": "automation",
    "capture-screen": "read",
    "read-screen-text": "read",
    "find-element": "read",
    "detect-elements": "read",
    "voice-listen": "read",
    "voice-speak": "automation",
    "send-notification": "automation",
    "click-element": "safety",
    "type-text": "safety",
    "press-hotkey": "safety",
    "wait-for": "safety",
    "emergency-stop": "safety",
}


_TOOL_TARGETS: dict[str, str] = {
    "read-cells": "learning-editor",
    "write-cell": "learning-editor",
    "cell-call": "learning-editor",
    "write-curriculum-yaml": "curriculum-yaml",
    "get-blocks": "learning-editor",
    "insert-block": "learning-editor",
    "update-block": "learning-editor",
    "delete-block": "learning-editor",
    "execute-reactive": "kernel-runtime",
    "get-variables": "kernel-runtime",
    "check-exercise": "kernel-runtime",
    "create-guide": "learning-editor",
    "create-learning-card": "learning-editor",
    "create-quiz": "learning-editor",
    "create-notebook-exercise": "learning-editor",
    "track-achievement": "learner-progress",
    "split-notebook": "file-system",
    "generate-notebook": "learning-editor",
    "fs-write": "file-system",
    "packages-check": "kernel-runtime",
    "packages-install": "kernel-runtime",
    "http-request": "external-api",
    "start-recording": "desktop-automation",
    "stop-recording": "desktop-automation",
    "run-automation": "desktop-automation",
    "capture-screen": "screen",
    "read-screen-text": "screen",
    "find-element": "screen",
    "detect-elements": "screen",
    "voice-listen": "voice",
    "voice-speak": "voice",
    "send-notification": "external-channel",
    "click-element": "guarded-input",
    "type-text": "guarded-input",
    "press-hotkey": "guarded-input",
    "wait-for": "guarded-input",
    "emergency-stop": "automation-safety",
}


_TOOL_RISK: dict[str, str] = {
    "write-cell": "writes",
    "delete-block": "destructive",
    "write-curriculum-yaml": "writes",
    "fs-write": "writes",
    "packages-install": "writes",
    "http-request": "external",
    "click-element": "input",
    "type-text": "input",
    "press-hotkey": "input",
    "run-automation": "input",
    "emergency-stop": "safety",
}


def toolManifest() -> dict[str, Any]:
    tools = [_toolManifestItem(tool) for tool in allTools()]
    grouped: dict[str, list[str]] = {group: [] for group in TOOL_GROUPS}
    byLane: dict[str, list[str]] = {lane: [] for lane in TOOL_LANE_GROUPS}
    for tool in tools:
        grouped.setdefault(tool["category"], []).append(tool["name"])
        byLane.setdefault(tool["lane"], []).append(tool["name"])
    return {
        "groups": [
            {"id": groupId, **group}
            for groupId, group in TOOL_GROUPS.items()
        ],
        "lanes": [
            {"id": laneId, **lane}
            for laneId, lane in TOOL_LANE_GROUPS.items()
        ],
        "tools": tools,
        "grouped": grouped,
        "byLane": byLane,
    }


def _toolManifestItem(tool: ToolDef) -> dict[str, Any]:
    required = tool.parameters.get("required", [])
    properties = tool.parameters.get("properties", {})
    return {
        "name": tool.name,
        "description": tool.description,
        "handler": tool.handler,
        "category": _TOOL_CATEGORIES.get(tool.name, "workbench"),
        "lane": _TOOL_LANES.get(tool.name, "write"),
        "target": _TOOL_TARGETS.get(tool.name, "learning-editor"),
        "risk": _TOOL_RISK.get(tool.name, "normal"),
        "required": required if isinstance(required, list) else [],
        "parameters": list(properties.keys()) if isinstance(properties, dict) else [],
    }


TOOL_INSERT_BLOCK = ToolDef(
    name="insert-block",
    description="Insert a new code, markdown, or guide block into the notebook at the specified position.",
    parameters={
        "type": "object",
        "properties": {
            "position": {
                "type": "integer",
                "description": "Zero-based index where the block will be inserted. -1 means append at end.",
            },
            "blockType": {
                "type": "string",
                "enum": ["code", "markdown", "guide"],
                "description": "Type of block to insert.",
            },
            "content": {
                "type": "string",
                "description": "Initial content of the block.",
            },
        },
        "required": ["blockType", "content"],
    },
    handler="insertBlock",
)

TOOL_UPDATE_BLOCK = ToolDef(
    name="update-block",
    description="Update the content of an existing block by its ID.",
    parameters={
        "type": "object",
        "properties": {
            "blockId": {
                "type": "string",
                "description": "The ID of the block to update.",
            },
            "content": {
                "type": "string",
                "description": "New content for the block.",
            },
        },
        "required": ["blockId", "content"],
    },
    handler="updateBlock",
)

TOOL_DELETE_BLOCK = ToolDef(
    name="delete-block",
    description="Delete a block from the notebook by its ID.",
    parameters={
        "type": "object",
        "properties": {
            "blockId": {
                "type": "string",
                "description": "The ID of the block to delete.",
            },
        },
        "required": ["blockId"],
    },
    handler="deleteBlock",
)

TOOL_EXECUTE_REACTIVE = ToolDef(
    name="execute-reactive",
    description="Execute a code block and reactively re-execute all dependent blocks.",
    parameters={
        "type": "object",
        "properties": {
            "blockId": {
                "type": "string",
                "description": "The ID of the code block to execute.",
            },
        },
        "required": ["blockId"],
    },
    handler="executeReactive",
)

TOOL_GET_VARIABLES = ToolDef(
    name="get-variables",
    description="Get the current variable registry from the active kernel session.",
    parameters={
        "type": "object",
        "properties": {},
    },
    handler="getVariables",
)

TOOL_GET_BLOCKS = ToolDef(
    name="get-blocks",
    description="Get the list of all blocks in the current document with their IDs, types, and content.",
    parameters={
        "type": "object",
        "properties": {},
    },
    handler="getBlocks",
)

TOOL_READ_CELLS = ToolDef(
    name="read-cells",
    description="Read learning editor cells by ID, including content, type, execution status, and order.",
    parameters={
        "type": "object",
        "properties": {
            "blockIds": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Optional list of cell/block IDs to read. Omit to read every cell.",
            },
            "includeContent": {
                "type": "boolean",
                "description": "Include full cell content in the response. Defaults to true.",
            },
        },
    },
    handler="readCells",
)

TOOL_WRITE_CELL = ToolDef(
    name="write-cell",
    description="Insert, update, or delete one learning editor cell. Use this for cell-level writes.",
    parameters={
        "type": "object",
        "properties": {
            "operation": {
                "type": "string",
                "enum": ["insert", "update", "delete"],
                "description": "Cell write operation.",
            },
            "blockId": {
                "type": "string",
                "description": "Existing cell ID for update/delete.",
            },
            "position": {
                "type": "integer",
                "description": "Zero-based insertion index. -1 appends.",
            },
            "blockType": {
                "type": "string",
                "enum": ["code", "markdown", "guide", "automation"],
                "description": "New cell type for insert.",
            },
            "content": {
                "type": "string",
                "description": "Cell content for insert/update.",
            },
        },
        "required": ["operation"],
    },
    handler="writeCell",
)

TOOL_CELL_CALL = ToolDef(
    name="cell-call",
    description="Run or check a specific learning cell by ID. Use this for execution/check calls.",
    parameters={
        "type": "object",
        "properties": {
            "operation": {
                "type": "string",
                "enum": ["run", "check"],
                "description": "Run the cell or check it against an expected result.",
            },
            "blockId": {
                "type": "string",
                "description": "Cell/block ID to run or check.",
            },
            "checkType": {
                "type": "string",
                "enum": ["outputMatch", "outputContains", "variableCheck", "codeContains", "noError"],
                "description": "Check strategy when operation is check.",
            },
            "expected": {
                "type": "string",
                "description": "Expected output, variable payload, or required code pattern.",
            },
        },
        "required": ["operation", "blockId"],
    },
    handler="cellCall",
)

TOOL_WRITE_CURRICULUM_YAML = ToolDef(
    name="write-curriculum-yaml",
    description="Convert a YAML curriculum draft into runnable learning editor cells and load it into the editor.",
    parameters={
        "type": "object",
        "properties": {
            "yamlContent": {
                "type": "string",
                "description": "Curriculum YAML with meta, intro, sections, and blocks.",
            },
            "category": {
                "type": "string",
                "description": "Curriculum category label for metadata. Defaults to ai.",
            },
            "contentId": {
                "type": "string",
                "description": "Stable curriculum content ID. Defaults to ai-generated.",
            },
            "loadInEditor": {
                "type": "boolean",
                "description": "Load the converted document into the active learning editor. Defaults to true.",
            },
        },
        "required": ["yamlContent"],
    },
    handler="writeCurriculumYaml",
)

TOOL_FS_WRITE = ToolDef(
    name="fs-write",
    description="Create or overwrite a file in the workspace. Useful for creating exercise data files.",
    parameters={
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "Relative path within the workspace.",
            },
            "content": {
                "type": "string",
                "description": "File content to write.",
            },
        },
        "required": ["path", "content"],
    },
    handler="fsWrite",
)

TOOL_PACKAGES_CHECK = ToolDef(
    name="packages-check",
    description="Check whether Python packages are already installed in the workspace environment before installing or running dependent cells.",
    parameters={
        "type": "object",
        "properties": {
            "names": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Package names to check, e.g. ['pandas', 'matplotlib'].",
            },
        },
        "required": ["names"],
    },
    handler="packagesCheck",
)

TOOL_PACKAGES_INSTALL = ToolDef(
    name="packages-install",
    description="Install a Python package in the workspace environment.",
    parameters={
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "Package name to install (e.g., 'pandas', 'matplotlib').",
            },
        },
        "required": ["name"],
    },
    handler="packagesInstall",
)

TOOL_CHECK_EXERCISE = ToolDef(
    name="check-exercise",
    description="Check if a student's code block output matches the expected answer.",
    parameters={
        "type": "object",
        "properties": {
            "blockId": {
                "type": "string",
                "description": "The ID of the block containing the student's answer.",
            },
            "checkType": {
                "type": "string",
                "enum": ["outputMatch", "outputContains", "variableCheck", "codeContains", "noError"],
                "description": "Type of check to perform.",
            },
            "expected": {
                "type": "string",
                "description": "Expected value or pattern to match against.",
            },
        },
        "required": ["blockId", "checkType"],
    },
    handler="checkExercise",
)

TOOL_CREATE_GUIDE = ToolDef(
    name="create-guide",
    description="Create an educational guide card block with exercise, hints, and solution.",
    parameters={
        "type": "object",
        "properties": {
            "position": {
                "type": "integer",
                "description": "Zero-based index where the guide block will be inserted. -1 means append.",
            },
            "exerciseType": {
                "type": "string",
                "enum": ["fillBlank", "predict", "fixBug", "modify", "writeCode", "buildUp"],
                "description": "Type of exercise.",
            },
            "content": {
                "type": "string",
                "description": "The exercise code or prompt.",
            },
            "description": {
                "type": "string",
                "description": "Brief description of the exercise goal.",
            },
            "hints": {
                "type": "array",
                "items": {"type": "string"},
                "description": "3-level hints: [concept hint, structure hint, answer].",
            },
            "solution": {
                "type": "string",
                "description": "The full solution code.",
            },
            "difficulty": {
                "type": "string",
                "enum": ["easy", "medium", "hard"],
                "description": "Difficulty level of the exercise.",
            },
        },
        "required": ["exerciseType", "content", "hints", "solution"],
    },
    handler="createGuide",
)


TOOL_CREATE_LEARNING_CARD = ToolDef(
    name="create-learning-card",
    description="Create a concept learning card with title, explanation, example code, and fill-in-the-blank exercise.",
    parameters={
        "type": "object",
        "properties": {
            "topic": {
                "type": "string",
                "description": "The concept or topic name (e.g., 'list comprehension', 'decorators').",
            },
            "explanation": {
                "type": "string",
                "description": "Brief explanation of the concept (2-3 sentences max, minimal text, maximum clarity).",
            },
            "exampleCode": {
                "type": "string",
                "description": "Working example code demonstrating the concept.",
            },
            "fillBlankCode": {
                "type": "string",
                "description": "Nearly-complete code with ___ blanks for the student to fill in.",
            },
            "blanks": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Answers for each ___ blank in order.",
            },
            "tags": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Category tags (e.g., ['python', 'data-structures', 'beginner']).",
            },
        },
        "required": ["topic", "explanation", "exampleCode", "fillBlankCode", "blanks"],
    },
    handler="createLearningCard",
)

TOOL_CREATE_QUIZ = ToolDef(
    name="create-quiz",
    description="Generate a quiz with multiple-choice and/or coding questions on a given topic.",
    parameters={
        "type": "object",
        "properties": {
            "topic": {
                "type": "string",
                "description": "Topic for the quiz.",
            },
            "questions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["multiple-choice", "coding", "predict-output"],
                            "description": "Question type.",
                        },
                        "question": {
                            "type": "string",
                            "description": "The question text or code to evaluate.",
                        },
                        "choices": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Answer choices (for multiple-choice only).",
                        },
                        "correctAnswer": {
                            "type": "string",
                            "description": "Correct answer (choice letter, expected output, or solution code).",
                        },
                        "explanation": {
                            "type": "string",
                            "description": "Brief explanation of why this is correct.",
                        },
                    },
                    "required": ["type", "question", "correctAnswer"],
                },
                "description": "List of quiz questions.",
            },
            "difficulty": {
                "type": "string",
                "enum": ["easy", "medium", "hard"],
                "description": "Overall quiz difficulty.",
            },
        },
        "required": ["topic", "questions"],
    },
    handler="createQuiz",
)

TOOL_CREATE_NOTEBOOK_EXERCISE = ToolDef(
    name="create-notebook-exercise",
    description="Create a multi-stage notebook exercise following fill-blank → modify → write-from-scratch progression.",
    parameters={
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Exercise title.",
            },
            "stages": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "stage": {
                            "type": "string",
                            "enum": ["fill-blank", "modify", "write"],
                            "description": "Exercise stage type.",
                        },
                        "instruction": {
                            "type": "string",
                            "description": "What the student should do.",
                        },
                        "starterCode": {
                            "type": "string",
                            "description": "Code template for the student.",
                        },
                        "solution": {
                            "type": "string",
                            "description": "Complete solution code.",
                        },
                        "checkType": {
                            "type": "string",
                            "enum": ["outputMatch", "outputContains", "variableCheck", "codeContains", "noError"],
                            "description": "How to verify the student's answer.",
                        },
                        "expected": {
                            "type": "string",
                            "description": "Expected value for the check.",
                        },
                        "hints": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "3-level hints: concept → structure → answer.",
                        },
                    },
                    "required": ["stage", "instruction", "starterCode", "solution"],
                },
                "description": "Exercise stages in progression order.",
            },
        },
        "required": ["title", "stages"],
    },
    handler="createNotebookExercise",
)

TOOL_TRACK_ACHIEVEMENT = ToolDef(
    name="track-achievement",
    description="Record a learning achievement: exercise completion, quiz score, or topic mastery.",
    parameters={
        "type": "object",
        "properties": {
            "type": {
                "type": "string",
                "enum": ["exercise-complete", "quiz-score", "topic-mastery", "streak"],
                "description": "Type of achievement to record.",
            },
            "topic": {
                "type": "string",
                "description": "Topic or concept name.",
            },
            "score": {
                "type": "number",
                "description": "Score or completion percentage (0-100).",
            },
            "details": {
                "type": "object",
                "description": "Additional details (mistakes, time spent, weak areas).",
            },
        },
        "required": ["type", "topic"],
    },
    handler="trackAchievement",
)


TOOL_SPLIT_NOTEBOOK = ToolDef(
    name="split-notebook",
    description="Split the current document into multiple notebooks by topic groupings.",
    parameters={
        "type": "object",
        "properties": {
            "splits": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "Title for the new notebook.",
                        },
                        "blockIds": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "IDs of blocks to include in this notebook.",
                        },
                    },
                    "required": ["title", "blockIds"],
                },
                "description": "List of split groups, each with a title and block IDs.",
            },
            "outputDir": {
                "type": "string",
                "description": "Directory to save split notebooks (relative to workspace root).",
            },
        },
        "required": ["splits"],
    },
    handler="splitNotebook",
)

TOOL_GENERATE_NOTEBOOK = ToolDef(
    name="generate-notebook",
    description="Generate a new notebook with code and markdown blocks for a given topic or task.",
    parameters={
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Title for the generated notebook.",
            },
            "blocks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["code", "markdown", "guide"],
                            "description": "Block type.",
                        },
                        "content": {
                            "type": "string",
                            "description": "Block content.",
                        },
                    },
                    "required": ["type", "content"],
                },
                "description": "Ordered list of blocks for the notebook.",
            },
            "outputPath": {
                "type": "string",
                "description": "File path for the notebook (relative to workspace root).",
            },
        },
        "required": ["title", "blocks"],
    },
    handler="generateNotebook",
)


TOOL_HTTP_REQUEST = ToolDef(
    name="http-request",
    description="Make an HTTP request to an external API and return the response.",
    parameters={
        "type": "object",
        "properties": {
            "method": {
                "type": "string",
                "enum": ["GET", "POST", "PUT", "PATCH", "DELETE"],
                "description": "HTTP method.",
            },
            "url": {
                "type": "string",
                "description": "Target URL.",
            },
            "headers": {
                "type": "object",
                "description": "Request headers as key-value pairs.",
            },
            "body": {
                "type": "string",
                "description": "Request body (for POST/PUT/PATCH).",
            },
            "timeout": {
                "type": "integer",
                "description": "Timeout in seconds (default 30).",
            },
        },
        "required": ["method", "url"],
    },
    handler="httpRequest",
)


TOOL_CAPTURE_SCREEN = ToolDef(
    name="capture-screen",
    description="Capture the current screen or a specific region. Returns base64 PNG image and dimensions.",
    parameters={
        "type": "object",
        "properties": {
            "region": {
                "type": "object",
                "properties": {
                    "x": {"type": "integer"},
                    "y": {"type": "integer"},
                    "width": {"type": "integer"},
                    "height": {"type": "integer"},
                },
                "description": "Optional screen region to capture. Omit for full screen.",
            },
            "format": {
                "type": "string",
                "enum": ["png", "jpeg"],
                "description": "Image format (default: png).",
            },
        },
    },
    handler="captureScreen",
)

TOOL_READ_SCREEN_TEXT = ToolDef(
    name="read-screen-text",
    description="Read text from the screen using OCR. Captures screen and extracts text with positions and confidence.",
    parameters={
        "type": "object",
        "properties": {
            "region": {
                "type": "object",
                "properties": {
                    "x": {"type": "integer"},
                    "y": {"type": "integer"},
                    "width": {"type": "integer"},
                    "height": {"type": "integer"},
                },
                "description": "Optional screen region to read. Omit for full screen.",
            },
            "backend": {
                "type": "string",
                "enum": ["paddle", "easyocr"],
                "description": "OCR backend to use (default: paddle).",
            },
        },
    },
    handler="readScreenText",
)

TOOL_CLICK_ELEMENT = ToolDef(
    name="click-element",
    description="Click at screen coordinates or on a UI element found by text/name. Respects input safety policy.",
    parameters={
        "type": "object",
        "properties": {
            "x": {"type": "integer", "description": "Screen X coordinate."},
            "y": {"type": "integer", "description": "Screen Y coordinate."},
            "text": {
                "type": "string",
                "description": "Find and click element containing this text (uses OCR). Overrides x/y.",
            },
            "button": {
                "type": "string",
                "enum": ["left", "right", "middle"],
                "description": "Mouse button (default: left).",
            },
            "clicks": {
                "type": "integer",
                "description": "Number of clicks (default: 1, use 2 for double-click).",
            },
        },
    },
    handler="clickElement",
)

TOOL_TYPE_TEXT = ToolDef(
    name="type-text",
    description="Type text using keyboard input. Respects input safety policy rate limits.",
    parameters={
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "Text to type.",
            },
            "interval": {
                "type": "number",
                "description": "Delay between keystrokes in seconds (default: 0.02).",
            },
        },
        "required": ["text"],
    },
    handler="typeText",
)

TOOL_PRESS_HOTKEY = ToolDef(
    name="press-hotkey",
    description="Press a keyboard shortcut (e.g., ctrl+c, alt+tab). Respects input safety policy.",
    parameters={
        "type": "object",
        "properties": {
            "keys": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Keys to press simultaneously (e.g., ['ctrl', 'c']).",
            },
        },
        "required": ["keys"],
    },
    handler="pressHotkey",
)

TOOL_FIND_ELEMENT = ToolDef(
    name="find-element",
    description="Find a UI element on screen by text (OCR), template image, or accessibility name.",
    parameters={
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "Text to search for on screen using OCR.",
            },
            "region": {
                "type": "object",
                "properties": {
                    "x": {"type": "integer"},
                    "y": {"type": "integer"},
                    "width": {"type": "integer"},
                    "height": {"type": "integer"},
                },
                "description": "Limit search to a screen region.",
            },
        },
        "required": ["text"],
    },
    handler="findElement",
)

TOOL_WAIT_FOR = ToolDef(
    name="wait-for",
    description="Wait until a condition is met on screen: text appears, element found, or timeout.",
    parameters={
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "Text to wait for on screen.",
            },
            "timeout": {
                "type": "number",
                "description": "Maximum wait time in seconds (default: 10, max: 60).",
            },
            "interval": {
                "type": "number",
                "description": "Polling interval in seconds (default: 0.5).",
            },
            "region": {
                "type": "object",
                "properties": {
                    "x": {"type": "integer"},
                    "y": {"type": "integer"},
                    "width": {"type": "integer"},
                    "height": {"type": "integer"},
                },
                "description": "Limit wait area to a screen region.",
            },
        },
        "required": ["text"],
    },
    handler="waitFor",
)

TOOL_START_RECORDING = ToolDef(
    name="start-recording",
    description="Start recording user automation actions. Returns a recording ID to use with stop-recording.",
    parameters={
        "type": "object",
        "properties": {
            "captureScreenshots": {
                "type": "boolean",
                "description": "Capture screenshots at each step (default: false).",
            },
        },
    },
    handler="startRecording",
)

TOOL_STOP_RECORDING = ToolDef(
    name="stop-recording",
    description="Stop the active recording and generate a Python automation recipe (.py percent format).",
    parameters={
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Title for the generated recipe (default: 'Recorded Automation').",
            },
            "outputPath": {
                "type": "string",
                "description": "File path to save the recipe (relative to workspace root).",
            },
        },
    },
    handler="stopRecording",
)

TOOL_RUN_AUTOMATION = ToolDef(
    name="run-automation",
    description="Execute a multi-step automation plan with vision verification at each step.",
    parameters={
        "type": "object",
        "properties": {
            "steps": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "action": {
                            "type": "string",
                            "description": "Tool name to execute (click-element, type-text, press-hotkey, etc.).",
                        },
                        "parameters": {
                            "type": "object",
                            "description": "Parameters for the action tool.",
                        },
                        "verification": {
                            "type": "string",
                            "description": "Optional text to verify on screen after action.",
                        },
                        "maxRetries": {
                            "type": "integer",
                            "description": "Max retries on failure (default: 2).",
                        },
                    },
                    "required": ["action"],
                },
                "description": "Ordered list of automation steps.",
            },
            "maxConsecutiveFailures": {
                "type": "integer",
                "description": "Abort after N consecutive failures (default: 3).",
            },
        },
        "required": ["steps"],
    },
    handler="runAutomation",
)

TOOL_DETECT_ELEMENTS = ToolDef(
    name="detect-elements",
    description="Detect UI elements on screen using OCR text search and contour analysis (no AGPL dependencies).",
    parameters={
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "Optional text to filter elements by (OCR-based).",
            },
            "region": {
                "type": "object",
                "properties": {
                    "x": {"type": "integer"},
                    "y": {"type": "integer"},
                    "width": {"type": "integer"},
                    "height": {"type": "integer"},
                },
                "description": "Limit detection to a screen region.",
            },
            "methods": {
                "type": "array",
                "items": {"type": "string", "enum": ["ocr", "contour", "all"]},
                "description": "Detection methods to use (default: ['all']).",
            },
        },
    },
    handler="detectElements",
)

TOOL_VOICE_LISTEN = ToolDef(
    name="voice-listen",
    description="Listen for voice input using the microphone, transcribe speech to text using faster-whisper.",
    parameters={
        "type": "object",
        "properties": {
            "duration": {
                "type": "number",
                "description": "Max listening duration in seconds (default: 5, max: 30).",
            },
            "language": {
                "type": "string",
                "description": "Language code for recognition (default: 'en'). Use 'ko' for Korean.",
            },
        },
    },
    handler="voiceListen",
)

TOOL_VOICE_SPEAK = ToolDef(
    name="voice-speak",
    description="Speak text aloud using text-to-speech (pyttsx3, offline).",
    parameters={
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "Text to speak aloud.",
            },
            "rate": {
                "type": "integer",
                "description": "Speech rate in words per minute (default: 150).",
            },
        },
        "required": ["text"],
    },
    handler="voiceSpeak",
)

TOOL_SEND_NOTIFICATION = ToolDef(
    name="send-notification",
    description="Send a notification message to an external channel (Slack, Discord, or custom webhook).",
    parameters={
        "type": "object",
        "properties": {
            "channel": {
                "type": "string",
                "description": "Channel name (must be registered) or 'all' for broadcast.",
            },
            "message": {
                "type": "string",
                "description": "Notification message text.",
            },
        },
        "required": ["channel", "message"],
    },
    handler="sendNotification",
)

TOOL_EMERGENCY_STOP = ToolDef(
    name="emergency-stop",
    description="Immediately stop all automation, cancel all scheduled tasks, and disable automation tools. Use when something goes wrong.",
    parameters={
        "type": "object",
        "properties": {
            "reason": {
                "type": "string",
                "description": "Reason for triggering the emergency stop.",
            },
        },
        "required": ["reason"],
    },
    handler="emergencyStop",
)


def _registerDefaultTools() -> None:
    for tool in [
        TOOL_INSERT_BLOCK,
        TOOL_UPDATE_BLOCK,
        TOOL_DELETE_BLOCK,
        TOOL_EXECUTE_REACTIVE,
        TOOL_GET_VARIABLES,
        TOOL_GET_BLOCKS,
        TOOL_READ_CELLS,
        TOOL_WRITE_CELL,
        TOOL_CELL_CALL,
        TOOL_WRITE_CURRICULUM_YAML,
        TOOL_FS_WRITE,
        TOOL_PACKAGES_CHECK,
        TOOL_PACKAGES_INSTALL,
        TOOL_CHECK_EXERCISE,
        TOOL_CREATE_GUIDE,
        TOOL_CREATE_LEARNING_CARD,
        TOOL_CREATE_QUIZ,
        TOOL_CREATE_NOTEBOOK_EXERCISE,
        TOOL_TRACK_ACHIEVEMENT,
        TOOL_SPLIT_NOTEBOOK,
        TOOL_GENERATE_NOTEBOOK,
        TOOL_HTTP_REQUEST,
        TOOL_CAPTURE_SCREEN,
        TOOL_READ_SCREEN_TEXT,
        TOOL_CLICK_ELEMENT,
        TOOL_TYPE_TEXT,
        TOOL_PRESS_HOTKEY,
        TOOL_FIND_ELEMENT,
        TOOL_WAIT_FOR,
        TOOL_START_RECORDING,
        TOOL_STOP_RECORDING,
        TOOL_RUN_AUTOMATION,
        TOOL_DETECT_ELEMENTS,
        TOOL_VOICE_LISTEN,
        TOOL_VOICE_SPEAK,
        TOOL_SEND_NOTIFICATION,
        TOOL_EMERGENCY_STOP,
    ]:
        registerTool(tool)


_registerDefaultTools()
