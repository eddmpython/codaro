from __future__ import annotations

from typing import Any

from .protocol import UiEventRequest, UiEventResponse
from ..uiCallbacks import hasCallback, invokeCallback, resetCallbacks


class UiCallbackNotFound(LookupError):
    pass


UI_EVENT_CALLBACK_ERRORS = (
    AttributeError,
    KeyError,
    RuntimeError,
    TypeError,
    ValueError,
)


def handleKernelUiEvent(request: UiEventRequest) -> UiEventResponse:
    callbackId = request.callbackId
    if not hasCallback(callbackId):
        raise UiCallbackNotFound(f"UI callback not found: {callbackId}")

    try:
        result = invokeCallback(callbackId, request.payload)
    except UI_EVENT_CALLBACK_ERRORS as error:
        return UiEventResponse(
            status="error",
            callbackId=callbackId,
            eventType=request.eventType,
            error=str(error),
        )

    safeResult = jsonSafeUiEventResult(result)
    return UiEventResponse(
        status="ok",
        callbackId=callbackId,
        eventType=request.eventType,
        result=safeResult,
        reactiveTrigger=reactiveTriggerFromUiEventResult(safeResult),
    )


def resetKernelUiCallbacks() -> None:
    resetCallbacks()


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
