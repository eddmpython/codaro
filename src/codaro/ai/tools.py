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


def _registerDefaultTools() -> None:
    for tool in [
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
        TOOL_CREATE_LEARNING_CARD,
        TOOL_CREATE_QUIZ,
        TOOL_CREATE_NOTEBOOK_EXERCISE,
        TOOL_TRACK_ACHIEVEMENT,
    ]:
        registerTool(tool)


_registerDefaultTools()
