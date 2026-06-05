from __future__ import annotations

import json
import shlex
from dataclasses import dataclass, field
from typing import Any

from .session.sessionModel import SessionKind, SessionStatus
from .session.sessionRegistry import getSessionRegistry
from .sessionFlow import (
    AutomationSessionFlowError,
    closeAutomationSessionPayload,
    getAutomationSessionStatePayload,
    openAutomationSessionPayload,
    runAutomationSessionStepPayload,
)

_SESSION_OPTIONS = {"headless", "startUrl", "browserType"}
_SESSION_OPS = {"open", "step", "query", "close"}
_CONTROL_KEYS = {
    "action",
    "kind",
    "op",
    "openIfMissing",
    "options",
    "session",
    "sessionName",
    "name",
    "reason",
    "params",
    *_SESSION_OPTIONS,
}


@dataclass(frozen=True, slots=True)
class AutomationSessionCell:
    kind: str
    sessionName: str
    op: str
    action: str
    params: dict[str, Any] = field(default_factory=dict)
    options: dict[str, Any] = field(default_factory=dict)
    openIfMissing: bool = False
    reason: str = "cell-close"

    @property
    def sessionKey(self) -> str:
        return f"{self.kind}:{self.sessionName}"


async def runAutomationSessionCellPayload(
    *,
    blockId: str,
    content: str,
    executionKind: str | None = None,
    sessionId: str | None = None,
) -> dict[str, Any]:
    cell = parseAutomationSessionCell(blockId=blockId, content=content, executionKind=executionKind)
    resolvedSessionId = sessionId or _findLiveSessionId(cell)

    if cell.op == "close":
        if not resolvedSessionId:
            return {
                "sessionKey": cell.sessionKey,
                "sessionId": None,
                "kind": cell.kind,
                "op": cell.op,
                "action": cell.action,
                "status": "closed",
                "closed": False,
            }
        result = await closeAutomationSessionPayload(resolvedSessionId, reason=cell.reason)
        return {
            "sessionKey": cell.sessionKey,
            "sessionId": resolvedSessionId,
            "kind": cell.kind,
            "op": cell.op,
            "action": cell.action,
            "status": "closed",
            "closed": True,
            "result": result,
        }

    if cell.op == "query":
        if not resolvedSessionId:
            return {
                "sessionKey": cell.sessionKey,
                "sessionId": None,
                "kind": cell.kind,
                "op": cell.op,
                "action": cell.action,
                "status": "missing",
                "state": None,
                "opened": False,
            }
        state = await getAutomationSessionStatePayload(resolvedSessionId)
        return {
            "sessionKey": cell.sessionKey,
            "sessionId": resolvedSessionId,
            "kind": cell.kind,
            "op": cell.op,
            "action": cell.action,
            "status": "success",
            "result": state,
            "state": state.get("state"),
            "opened": False,
        }

    opened = None
    if not resolvedSessionId:
        if cell.op == "step" and not cell.openIfMissing:
            raise AutomationSessionFlowError(404, f"Automation session not open: {cell.sessionKey}")
        opened = await openAutomationSessionPayload(
            kind=cell.kind,
            name=cell.sessionName,
            options=cell.options,
        )
        resolvedSessionId = str(opened["sessionId"])

    if cell.op == "open":
        state = opened if opened is not None else await getAutomationSessionStatePayload(resolvedSessionId)
        return {
            "sessionKey": cell.sessionKey,
            "sessionId": resolvedSessionId,
            "kind": cell.kind,
            "op": cell.op,
            "action": cell.action,
            "status": "success",
            "result": state,
            "opened": opened is not None,
        }

    record = await runAutomationSessionStepPayload(resolvedSessionId, action=cell.action, params=cell.params)
    state = await getAutomationSessionStatePayload(resolvedSessionId)
    return {
        "sessionKey": cell.sessionKey,
        "sessionId": resolvedSessionId,
        "kind": cell.kind,
        "op": cell.op,
        "action": cell.action,
        "status": record["status"],
        "result": record.get("result", {}),
        "step": record,
        "state": state.get("state"),
        "opened": opened is not None,
    }


def parseAutomationSessionCell(
    *,
    blockId: str,
    content: str,
    executionKind: str | None = None,
) -> AutomationSessionCell:
    raw = _parseContent(content)
    kind = _sessionKind(str(raw.get("kind") or executionKind or "browser"))
    sessionName = str(raw.get("session") or raw.get("sessionName") or raw.get("name") or blockId)
    rawAction = raw.get("action")
    op = _sessionOp(raw.get("op"), str(rawAction or "state"))
    action = _sessionAction(op, rawAction)
    params = _paramsFor(kind, action, raw)
    rawOptions = raw.get("options")
    options = dict(rawOptions) if isinstance(rawOptions, dict) else {}
    options.update({key: raw[key] for key in _SESSION_OPTIONS if key in raw})
    openIfMissing = bool(raw.get("openIfMissing", False))
    reason = str(raw.get("reason") or "cell-close")
    return AutomationSessionCell(
        kind=kind,
        sessionName=sessionName,
        op=op,
        action=action,
        params=params,
        options=options,
        openIfMissing=openIfMissing,
        reason=reason,
    )


def _findLiveSessionId(cell: AutomationSessionCell) -> str | None:
    registry = getSessionRegistry()
    targetKind = SessionKind(cell.kind)
    for handle in registry.listSessions():
        if handle.status is not SessionStatus.LIVE:
            continue
        if handle.definition.kind is targetKind and handle.definition.name == cell.sessionName:
            return handle.definition.id
    return None


def _sessionKind(kind: str) -> str:
    normalized = kind.strip().lower()
    if normalized == "browser":
        return SessionKind.BROWSER.value
    if normalized in {"desktop", "os", "mouse"}:
        return SessionKind.DESKTOP.value
    raise AutomationSessionFlowError(400, f"지원하지 않는 automation cell executionKind: {kind}")


def _sessionOp(rawOp: Any, action: str) -> str:
    if rawOp is not None:
        normalized = str(rawOp).strip().lower()
        if normalized in _SESSION_OPS:
            return normalized
        raise AutomationSessionFlowError(400, f"지원하지 않는 automation cell op: {rawOp}")
    normalizedAction = action.strip().lower()
    if normalizedAction == "open":
        return "open"
    if normalizedAction in {"query", "state"}:
        return "query"
    if normalizedAction == "close":
        return "close"
    return "step"


def _sessionAction(op: str, rawAction: Any) -> str:
    if rawAction is not None:
        return str(rawAction)
    if op == "step":
        raise AutomationSessionFlowError(400, "automation cell step op 은 action 이 필요합니다")
    if op == "query":
        return "query"
    return op


def _parseContent(content: str) -> dict[str, Any]:
    stripped = content.strip()
    if not stripped:
        return {"action": "state"}
    if stripped.startswith("{"):
        try:
            payload = json.loads(stripped)
        except json.JSONDecodeError as exc:
            raise AutomationSessionFlowError(400, f"automation cell JSON parse 실패: {exc.msg}") from exc
        if not isinstance(payload, dict):
            raise AutomationSessionFlowError(400, "automation cell JSON 은 object 여야 합니다")
        return dict(payload)

    lines = [
        line.strip()
        for line in stripped.splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]
    values: dict[str, Any] = {}
    commandLine: str | None = None
    for line in lines:
        if ":" in line and not line.split(":", 1)[0].strip().startswith(("http", "https")):
            key, value = line.split(":", 1)
            values[key.strip()] = _parseScalar(value.strip())
        elif commandLine is None:
            commandLine = line

    if commandLine and "action" not in values:
        values.update(_parseCommandLine(commandLine))
    return values


def _parseCommandLine(line: str) -> dict[str, Any]:
    try:
        parts = shlex.split(line)
    except ValueError as exc:
        raise AutomationSessionFlowError(400, f"automation command parse 실패: {exc}") from exc
    if not parts:
        return {"action": "state"}
    action = parts[0]
    args = parts[1:]
    result: dict[str, Any] = {"action": action}
    if action == "navigate" and args:
        result["url"] = args[0]
    elif action in {"click", "waitFor", "extractText"} and args:
        result["selector"] = args[0]
    elif action == "type" and len(args) >= 2:
        result["selector"] = args[0]
        result["text"] = " ".join(args[1:])
    elif action == "press" and args:
        result["keys"] = " ".join(args)
    elif action == "readText":
        result["action"] = "readText"
    elif action == "capture":
        result["action"] = "capture"
    return result


def _paramsFor(kind: str, action: str, raw: dict[str, Any]) -> dict[str, Any]:
    explicit = raw.get("params")
    if isinstance(explicit, dict):
        return dict(explicit)

    params = {key: value for key, value in raw.items() if key not in _CONTROL_KEYS}
    if kind == SessionKind.DESKTOP.value:
        if action == "click" and "x" not in params and "selector" in params:
            coords = str(params.pop("selector")).replace(",", " ").split()
            if len(coords) >= 2:
                params["x"] = _parseScalar(coords[0])
                params["y"] = _parseScalar(coords[1])
        if action == "type" and "selector" in params and "text" not in params:
            params["text"] = params.pop("selector")
        if action == "press" and isinstance(params.get("keys"), str):
            params["keys"] = str(params["keys"]).replace("+", " ").replace(",", " ").split()
    return params


def _parseScalar(value: str) -> Any:
    if not value:
        return ""
    lowered = value.lower()
    if lowered == "true":
        return True
    if lowered == "false":
        return False
    if lowered in {"null", "none"}:
        return None
    if value[0] in "[{":
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    try:
        return int(value)
    except ValueError:
        pass
    try:
        return float(value)
    except ValueError:
        return value.strip("\"'")
