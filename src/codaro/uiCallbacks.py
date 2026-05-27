from __future__ import annotations

import inspect
import uuid
from typing import Any, Callable


_callbackRegistry: dict[str, Callable[..., Any]] = {}


def registerCallback(fn: Callable[..., Any]) -> str:
    callbackId = f"cb_{uuid.uuid4().hex[:12]}"
    _callbackRegistry[callbackId] = fn
    return callbackId


def invokeCallback(callbackId: str, payload: object = None) -> Any:
    fn = _callbackRegistry.get(callbackId)
    if fn is None:
        raise KeyError(f"Unknown callback id: {callbackId}")
    parameters = inspect.signature(fn).parameters
    if not parameters:
        return fn()
    return fn(payload)


def hasCallback(callbackId: str) -> bool:
    return callbackId in _callbackRegistry


def resetCallbacks() -> None:
    _callbackRegistry.clear()


def callbackCount() -> int:
    return len(_callbackRegistry)
