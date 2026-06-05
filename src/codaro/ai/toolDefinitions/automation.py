from __future__ import annotations

from ..toolRegistry import ToolDef


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

TOOL_WRITE_AUTOMATION_RECIPE = ToolDef(
    name="write-automation-recipe",
    description=(
        "Create or update a Python percent-format automation recipe and optionally load it as an automation cell."
    ),
    parameters={
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Human-readable title for the automation recipe.",
            },
            "code": {
                "type": "string",
                "description": "Python automation body to place in the automation cell.",
            },
            "description": {
                "type": "string",
                "description": "Short purpose and safety notes for the recipe.",
            },
            "outputPath": {
                "type": "string",
                "description": "Optional recipe path relative to the active workspace.",
            },
            "dryRunFirst": {
                "type": "boolean",
                "description": "Whether the generated recipe should start in dry-run mode (default true).",
            },
            "loadInEditor": {
                "type": "boolean",
                "description": "Whether to append the automation body to the active editor document (default true).",
            },
        },
        "required": ["title", "code"],
    },
    handler="writeAutomationRecipe",
)

TOOL_CREATE_AUTOMATION_TASK = ToolDef(
    name="create-automation-task",
    description="Register a saved dry-run percent-format automation recipe as a runnable task.",
    parameters={
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "Task name shown in the automation surface.",
            },
            "documentPath": {
                "type": "string",
                "description": "Path to a saved recipe or document inside the active workspace.",
            },
            "description": {
                "type": "string",
                "description": "Short task description.",
            },
            "schedule": {
                "type": "string",
                "description": "Optional schedule such as @daily, @every_15m, or @every_1h.",
            },
            "inputs": {
                "type": "object",
                "description": "Optional task input defaults.",
            },
        },
        "required": ["name", "documentPath"],
    },
    handler="createAutomationTask",
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

TOOL_OPEN_AUTOMATION_SESSION = ToolDef(
    name="open-automation-session",
    description=(
        "Open a long-lived browser automation session that survives across steps and turns. "
        "Returns a sessionId handle. Reuse the same sessionId to operate the same live browser later."
    ),
    parameters={
        "type": "object",
        "properties": {
            "kind": {
                "type": "string",
                "enum": ["browser", "desktop"],
                "description": "Session backend: 'browser' (Playwright page) or 'desktop' (resident screen capture + guarded OS input).",
            },
            "name": {"type": "string", "description": "Human-readable label shown in the live session list."},
            "startUrl": {"type": "string", "description": "Optional initial URL to navigate to on open."},
            "headless": {
                "type": "boolean",
                "description": "Run the browser headless (default false so the user can watch).",
            },
            "browserType": {
                "type": "string",
                "enum": ["chromium", "firefox", "webkit"],
                "description": "Browser engine (default chromium).",
            },
        },
    },
    handler="openAutomationSession",
)

TOOL_RUN_AUTOMATION_STEP = ToolDef(
    name="run-automation-step",
    description=(
        "Run ONE step on an existing live automation session by sessionId. The live browser is reused, "
        "not re-opened. Returns the step result and current page state."
    ),
    parameters={
        "type": "object",
        "properties": {
            "sessionId": {"type": "string", "description": "Handle returned by open-automation-session."},
            "action": {
                "type": "string",
                "enum": ["navigate", "click", "type", "press", "waitFor", "extractText", "state"],
                "description": "Step verb against the live page.",
            },
            "parameters": {
                "type": "object",
                "description": "Action params, e.g. {url}, {selector}, {selector,text}, {keys}, {selector,timeoutMs}.",
            },
        },
        "required": ["sessionId", "action"],
    },
    handler="runAutomationStep",
)

TOOL_QUERY_AUTOMATION_SESSION = ToolDef(
    name="query-automation-session",
    description="Read the current state (url, title, recent steps) of a live automation session without mutating it.",
    parameters={
        "type": "object",
        "properties": {
            "sessionId": {"type": "string", "description": "Handle to inspect."},
        },
        "required": ["sessionId"],
    },
    handler="queryAutomationSession",
)

TOOL_LIST_AUTOMATION_SESSIONS = ToolDef(
    name="list-automation-sessions",
    description="List all live automation sessions so you can re-acquire a handle opened in a previous turn.",
    parameters={"type": "object", "properties": {}},
    handler="listAutomationSessions",
)

TOOL_CLOSE_AUTOMATION_SESSION = ToolDef(
    name="close-automation-session",
    description="Close a live automation session and free its handle. Always close sessions you no longer need.",
    parameters={
        "type": "object",
        "properties": {
            "sessionId": {"type": "string", "description": "Handle to close."},
            "reason": {"type": "string", "description": "Optional reason recorded in the audit trail."},
        },
        "required": ["sessionId"],
    },
    handler="closeAutomationSession",
)
