from __future__ import annotations

import logging
from typing import Any

from .actionRecorder import RecordedAction

logger = logging.getLogger(__name__)


class RecipeGenerator:

    def generate(self, actions: list[RecordedAction], title: str = "Recorded Automation") -> str:
        lines: list[str] = []
        lines.append(f"# codaro:app title={title!r}")
        lines.append("")
        lines.append("# %% [markdown]")
        lines.append(f"# # {title}")
        lines.append(f"# Recorded automation with {len(actions)} steps.")
        lines.append(f"# Review and modify the code below to customize the behavior.")
        lines.append("")
        lines.append("# %% [code]")
        lines.append("import time")
        lines.append("from codaro.automation.input.pyautoguiController import PyAutoGuiController")
        lines.append("from codaro.automation.input.inputGuard import InputGuard, InputPolicy")
        lines.append("")
        lines.append("controller = PyAutoGuiController()")
        lines.append("guard = InputGuard(controller, InputPolicy(humanDelay=True))")
        lines.append("")

        prevTimestamp = 0.0
        for i, action in enumerate(actions):
            delay = action.timestamp - prevTimestamp
            if delay > 0.1 and i > 0:
                lines.append(f"time.sleep({delay:.2f})")
                lines.append("")

            lines.append(f"# %% [automation]")
            lines.append(f"# Step {i + 1}: {action.actionType}")
            code = self._actionToCode(action)
            lines.append(code)
            lines.append("")

            prevTimestamp = action.timestamp

        lines.append("# %% [code]")
        lines.append("guard.dispose()")
        lines.append('print("Automation complete!")')
        lines.append("")

        return "\n".join(lines)

    def generateDict(self, actions: list[RecordedAction], title: str = "Recorded Automation") -> dict[str, Any]:
        steps: list[dict[str, Any]] = []
        for action in actions:
            steps.append({
                "action": action.actionType,
                "parameters": action.parameters,
                "timestamp": action.timestamp,
            })
        return {
            "title": title,
            "stepCount": len(steps),
            "steps": steps,
        }

    def _actionToCode(self, action: RecordedAction) -> str:
        p = action.parameters
        at = action.actionType

        if at == "click":
            x = p.get("x", 0)
            y = p.get("y", 0)
            button = p.get("button", "left")
            clicks = p.get("clicks", 1)
            if button == "left" and clicks == 1:
                return f"guard.click({x}, {y})"
            return f"guard.click({x}, {y}, button={button!r}, clicks={clicks})"

        if at == "moveTo":
            return f"guard.moveTo({p.get('x', 0)}, {p.get('y', 0)})"

        if at == "typeText":
            text = p.get("text", "")
            return f"guard.typeText({text!r})"

        if at == "hotkey":
            keys = p.get("keys", [])
            args = ", ".join(f"{k!r}" for k in keys)
            return f"guard.hotkey({args})"

        if at == "scroll":
            clicks = p.get("clicks", 0)
            x = p.get("x")
            y = p.get("y")
            if x is not None and y is not None:
                return f"guard.scroll({clicks}, x={x}, y={y})"
            return f"guard.scroll({clicks})"

        if at == "dragTo":
            return f"guard.dragTo({p.get('x', 0)}, {p.get('y', 0)})"

        return f"# Unknown action: {at} {p}"
