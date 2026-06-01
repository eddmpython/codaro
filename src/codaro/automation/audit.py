from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

_DEFAULT_AUDIT_DIR = Path.home() / ".codaro" / "audit"


@dataclass(slots=True)
class AuditEntry:
    timestamp: float
    actionType: str
    source: str
    parameters: dict[str, Any] = field(default_factory=dict)
    sessionId: str | None = None
    success: bool = True
    error: str | None = None

    def serialize(self) -> dict[str, Any]:
        result: dict[str, Any] = {
            "timestamp": self.timestamp,
            "iso": datetime.fromtimestamp(self.timestamp, tz=timezone.utc).isoformat(),
            "actionType": self.actionType,
            "source": self.source,
            "parameters": self.parameters,
            "success": self.success,
        }
        if self.sessionId:
            result["sessionId"] = self.sessionId
        if self.error:
            result["error"] = self.error
        return result


class AuditTrail:

    def __init__(self, auditDir: Path | None = None) -> None:
        self._auditDir = auditDir or _DEFAULT_AUDIT_DIR
        self._auditDir.mkdir(parents=True, exist_ok=True)
        self._entries: list[AuditEntry] = []
        self._currentDate: str | None = None
        self._fileHandle = None

    def _getLogFile(self) -> Path:
        today = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")
        return self._auditDir / f"audit-{today}.jsonl"

    def _ensureFileHandle(self):
        today = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")
        if self._currentDate == today and self._fileHandle is not None:
            return self._fileHandle
        if self._fileHandle:
            self._fileHandle.close()
        fileHandle = open(self._getLogFile(), "a", encoding="utf-8")
        self._currentDate = today
        self._fileHandle = fileHandle
        return self._fileHandle

    def record(
        self,
        actionType: str,
        source: str,
        parameters: dict[str, Any] | None = None,
        sessionId: str | None = None,
        success: bool = True,
        error: str | None = None,
    ) -> AuditEntry:
        entry = AuditEntry(
            timestamp=time.time(),
            actionType=actionType,
            source=source,
            parameters=parameters or {},
            sessionId=sessionId,
            success=success,
            error=error,
        )
        self._entries.append(entry)

        try:
            fh = self._ensureFileHandle()
            fh.write(json.dumps(entry.serialize(), ensure_ascii=False) + "\n")
            fh.flush()
        except OSError:
            logger.warning("Failed to write audit entry to disk", exc_info=True)

        return entry

    def query(
        self,
        actionType: str | None = None,
        source: str | None = None,
        limit: int = 100,
        since: float | None = None,
    ) -> list[AuditEntry]:
        results: list[AuditEntry] = []
        for entry in reversed(self._entries):
            if actionType and entry.actionType != actionType:
                continue
            if source and entry.source != source:
                continue
            if since and entry.timestamp < since:
                continue
            results.append(entry)
            if len(results) >= limit:
                break
        return results

    def queryFromDisk(
        self,
        date: str | None = None,
        actionType: str | None = None,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        if date:
            files = [self._auditDir / f"audit-{date}.jsonl"]
        else:
            files = sorted(self._auditDir.glob("audit-*.jsonl"), reverse=True)

        results: list[dict[str, Any]] = []
        for f in files:
            if not f.exists():
                continue
            for line in reversed(f.read_text(encoding="utf-8").strip().splitlines()):
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if actionType and entry.get("actionType") != actionType:
                    continue
                results.append(entry)
                if len(results) >= limit:
                    return results
        return results

    def clear(self) -> None:
        self._entries.clear()

    def dispose(self) -> None:
        if self._fileHandle:
            self._fileHandle.close()
            self._fileHandle = None
        self._currentDate = None
        self._entries.clear()


_globalAuditTrail: AuditTrail | None = None


def getAuditTrail() -> AuditTrail:
    global _globalAuditTrail
    if _globalAuditTrail is None:
        _globalAuditTrail = AuditTrail()
    return _globalAuditTrail
