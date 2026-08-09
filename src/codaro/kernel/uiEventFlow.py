from __future__ import annotations

from collections.abc import Callable

from .protocol import UiEventRequest, UiEventResponse
from ..runtime.uiEventRuntime import (
    UiCallbackNotFound,
    handleRuntimeUiEvent,
    jsonSafeUiEventResult,
    reactiveTriggerFromUiEventResult,
)
from ..uiCallbacks import resetCallbacks


def handleKernelUiEvent(
    request: UiEventRequest,
    *,
    invoke: Callable[[UiEventRequest], UiEventResponse] | None = None,
) -> UiEventResponse:
    if invoke is not None:
        return invoke(request)
    return UiEventResponse.model_validate(handleRuntimeUiEvent(request.model_dump(mode="json")))


def resetKernelUiCallbacks() -> None:
    resetCallbacks()
