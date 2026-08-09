from __future__ import annotations

from typing import Any, Mapping

from ..uiCallbacks import hasCallback, invokeCallback


class UiCallbackNotFound(LookupError):
    pass


UI_EVENT_CALLBACK_ERRORS = (
    AttributeError,
    KeyError,
    RuntimeError,
    TypeError,
    ValueError,
)


def handleRuntimeUiEvent(request: Mapping[str, Any]) -> dict[str, Any]:
    callbackId = str(request.get("callbackId") or "")
    eventType = str(request.get("eventType") or "invoke")
    if not hasCallback(callbackId):
        raise UiCallbackNotFound(f"UI callback not found: {callbackId}")
    try:
        result = invokeCallback(callbackId, request.get("payload"))
    except UI_EVENT_CALLBACK_ERRORS as error:
        return {
            "status": "error",
            "callbackId": callbackId,
            "eventType": eventType,
            "error": str(error),
            "reactiveTrigger": [],
        }
    safeResult = jsonSafeUiEventResult(result)
    return {
        "status": "ok",
        "callbackId": callbackId,
        "eventType": eventType,
        "result": safeResult,
        "reactiveTrigger": reactiveTriggerFromUiEventResult(safeResult),
    }


def reactiveTriggerFromUiEventResult(result: Any) -> list[str]:
    if not isinstance(result, dict):
        return []
    triggerRaw = result.get("reactiveTrigger")
    if not isinstance(triggerRaw, list):
        return []
    return [str(item) for item in triggerRaw if str(item).strip()]


def jsonSafeUiEventResult(value: Any) -> Any:
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, dict):
        return {str(key): jsonSafeUiEventResult(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [jsonSafeUiEventResult(item) for item in value]
    return repr(value)
