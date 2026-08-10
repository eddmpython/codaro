from __future__ import annotations

from typing import Any


class PublicationBuildError(RuntimeError):
    def __init__(self, message: str, *, diagnostics: list[dict[str, Any]] | None = None) -> None:
        super().__init__(message)
        self.diagnostics = diagnostics or []
