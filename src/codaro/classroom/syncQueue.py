from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .assignmentModel import utcNow


class AssignmentSyncQueue:
    def __init__(self, path: str | Path) -> None:
        self.path = Path(path).resolve()

    def enqueue(self, eventPayload: dict[str, Any]) -> dict[str, Any]:
        item = {
            "queuedAt": utcNow(),
            "deliveredAt": None,
            "attemptCount": 0,
            "event": dict(eventPayload),
        }
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("a", encoding="utf-8") as file:
            file.write(json.dumps(item, ensure_ascii=False) + "\n")
        return item

    def listPending(self) -> list[dict[str, Any]]:
        return [item for item in self._readAll() if not item.get("deliveredAt")]

    def markDelivered(self, eventId: str) -> None:
        items = self._readAll()
        for item in items:
            event = item.get("event")
            if isinstance(event, dict) and event.get("eventId") == eventId:
                item["deliveredAt"] = utcNow()
        self._writeAll(items)

    def recordAttempt(self, eventId: str) -> None:
        items = self._readAll()
        for item in items:
            event = item.get("event")
            if isinstance(event, dict) and event.get("eventId") == eventId:
                item["attemptCount"] = int(item.get("attemptCount") or 0) + 1
        self._writeAll(items)

    def _readAll(self) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []
        items: list[dict[str, Any]] = []
        for line in self.path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                payload = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(payload, dict):
                items.append(payload)
        return items

    def _writeAll(self, items: list[dict[str, Any]]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(
            "".join(json.dumps(item, ensure_ascii=False) + "\n" for item in items),
            encoding="utf-8",
        )
