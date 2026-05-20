from __future__ import annotations

from .toolDefinitions.runtime import (
    TOOL_CHECK_EXERCISE,
    TOOL_EXECUTE_REACTIVE,
    TOOL_FS_WRITE,
    TOOL_GET_VARIABLES,
    TOOL_PACKAGES_CHECK,
    TOOL_PACKAGES_INSTALL,
)
from .toolDefinitions.workbench import (
    TOOL_CELL_CALL,
    TOOL_DELETE_BLOCK,
    TOOL_GET_BLOCKS,
    TOOL_INSERT_BLOCK,
    TOOL_READ_CELLS,
    TOOL_UPDATE_BLOCK,
    TOOL_WRITE_CELL,
    TOOL_WRITE_CURRICULUM_YAML,
)
from .toolManifest import toolManifest
from .toolRegistry import ToolDef, allTools, getTool, registerTool, toolSchemas


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


DEFAULT_TOOLS: tuple[ToolDef, ...] = (
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
)


def defaultTools() -> tuple[ToolDef, ...]:
    return DEFAULT_TOOLS


def _registerDefaultTools() -> None:
    for tool in defaultTools():
        registerTool(tool)


_registerDefaultTools()
