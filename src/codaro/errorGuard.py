from __future__ import annotations

import logging


def safeDispose(resource: object, methodName: str, logger: logging.Logger) -> None:
    method = getattr(resource, methodName, None)
    if method is None:
        return
    try:
        method()
    except Exception as exc:  # noqa: BLE001 — dispose must catch all
        logger.debug(
            "dispose %s.%s failed: %s", type(resource).__name__, methodName, exc,
        )


def safeRepr(value: object, maxLen: int = 300) -> str:
    try:
        r = repr(value)
        return r[:maxLen] + "..." if len(r) > maxLen else r
    except Exception:  # noqa: BLE001 — repr must catch all
        return f"<{type(value).__name__}>"
