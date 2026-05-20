from __future__ import annotations

from ..toolRegistry import ToolDef


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
    description=(
        "Create a legacy targeted concept drill with title, explanation, example code, and fill-in-the-blank exercise. "
        "Prefer write-curriculum-yaml for new structured section-card lessons."
    ),
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
