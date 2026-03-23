from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class ParsedCommand:
    commandType: str
    parameters: dict[str, Any] = field(default_factory=dict)
    rawText: str = ""
    confidence: float = 1.0

    def serialize(self) -> dict[str, Any]:
        return {
            "commandType": self.commandType,
            "parameters": self.parameters,
            "rawText": self.rawText,
            "confidence": round(self.confidence, 3),
        }


_COMMAND_PATTERNS: list[tuple[str, re.Pattern, list[str]]] = [
    ("emergency-stop", re.compile(r"\b(stop|emergency\s*stop|halt|abort)\b", re.IGNORECASE), []),
    ("pause", re.compile(r"\b(pause|wait|hold)\b", re.IGNORECASE), []),
    ("resume", re.compile(r"\b(resume|continue|go)\b", re.IGNORECASE), []),
    ("click", re.compile(r"\bclick\s+(?:on\s+)?(.+)", re.IGNORECASE), ["target"]),
    ("type", re.compile(r"\btype\s+(.+)", re.IGNORECASE), ["text"]),
    ("scroll", re.compile(r"\bscroll\s+(up|down)(?:\s+(\d+))?\b", re.IGNORECASE), ["direction", "amount"]),
    ("open", re.compile(r"\bopen\s+(.+)", re.IGNORECASE), ["target"]),
    ("close", re.compile(r"\bclose\s+(.+)", re.IGNORECASE), ["target"]),
    ("undo", re.compile(r"\bundo\b", re.IGNORECASE), []),
    ("redo", re.compile(r"\bredo\b", re.IGNORECASE), []),
    ("save", re.compile(r"\bsave\b", re.IGNORECASE), []),
    ("copy", re.compile(r"\bcopy\b", re.IGNORECASE), []),
    ("paste", re.compile(r"\bpaste\b", re.IGNORECASE), []),
    ("select-all", re.compile(r"\bselect\s+all\b", re.IGNORECASE), []),
]


class CommandParser:

    def __init__(self, customPatterns: list[tuple[str, str, list[str]]] | None = None) -> None:
        self._patterns = list(_COMMAND_PATTERNS)
        if customPatterns:
            for name, pattern, paramNames in customPatterns:
                self._patterns.append((name, re.compile(pattern, re.IGNORECASE), paramNames))

    def parse(self, text: str) -> ParsedCommand | None:
        text = text.strip()
        if not text:
            return None

        for commandType, pattern, paramNames in self._patterns:
            match = pattern.search(text)
            if match:
                params: dict[str, Any] = {}
                groups = match.groups()
                for i, name in enumerate(paramNames):
                    if i < len(groups) and groups[i] is not None:
                        params[name] = groups[i].strip()

                return ParsedCommand(
                    commandType=commandType,
                    parameters=params,
                    rawText=text,
                )

        return ParsedCommand(
            commandType="unknown",
            parameters={"text": text},
            rawText=text,
            confidence=0.0,
        )

    def parseToAction(self, text: str) -> dict[str, Any] | None:
        cmd = self.parse(text)
        if cmd is None:
            return None

        actionMap: dict[str, dict[str, Any]] = {
            "emergency-stop": {"tool": "emergency-stop", "args": {"reason": f"Voice command: {text}"}},
            "click": {"tool": "click-element", "args": {"text": cmd.parameters.get("target", "")}},
            "type": {"tool": "type-text", "args": {"text": cmd.parameters.get("text", "")}},
            "undo": {"tool": "press-hotkey", "args": {"keys": ["ctrl", "z"]}},
            "redo": {"tool": "press-hotkey", "args": {"keys": ["ctrl", "y"]}},
            "save": {"tool": "press-hotkey", "args": {"keys": ["ctrl", "s"]}},
            "copy": {"tool": "press-hotkey", "args": {"keys": ["ctrl", "c"]}},
            "paste": {"tool": "press-hotkey", "args": {"keys": ["ctrl", "v"]}},
            "select-all": {"tool": "press-hotkey", "args": {"keys": ["ctrl", "a"]}},
        }

        if cmd.commandType == "scroll":
            direction = cmd.parameters.get("direction", "down")
            amount = int(cmd.parameters.get("amount", 3)) if cmd.parameters.get("amount") else 3
            clicks = amount if direction.lower() == "up" else -amount
            return {"tool": "scroll", "args": {"clicks": clicks}}

        return actionMap.get(cmd.commandType)
