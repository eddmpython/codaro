from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Awaitable, Callable
import json
from typing import Any


PROFILE_CHANGED_EVENT = "profile_changed"


def profileEventFrame(eventName: str, payload: dict[str, Any]) -> str:
    return f"event: {eventName}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"


async def streamProfileChangeEvents(
    *,
    manager: Any,
    isDisconnected: Callable[[], Awaitable[bool]],
    pollInterval: float = 1.0,
    sleeper: Callable[[float], Awaitable[None]] = asyncio.sleep,
) -> AsyncIterator[str]:
    lastFingerprint = ""
    while True:
        if await isDisconnected():
            break
        payload = manager.serialize()
        fingerprint = manager.fingerprint()
        if fingerprint != lastFingerprint:
            lastFingerprint = fingerprint
            yield profileEventFrame(PROFILE_CHANGED_EVENT, payload)
        await sleeper(pollInterval)
