from __future__ import annotations

from dataclasses import dataclass, field
import inspect
from pathlib import Path
from typing import Any, Callable


@dataclass(slots=True)
class RuntimeBlock:
    id: str
    kind: str
    funcName: str
    function: Callable[..., Any]


@dataclass(slots=True)
class App:
    title: str | None = None
    blocks: list[RuntimeBlock] = field(default_factory=list)

    def block(self, id: str, kind: str) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        def decorator(function: Callable[..., Any]) -> Callable[..., Any]:
            self.blocks.append(
                RuntimeBlock(
                    id=id,
                    kind=kind,
                    funcName=function.__name__,
                    function=function,
                )
            )
            return function

        return decorator

    def run(self) -> None:
        frame = inspect.currentframe()
        caller = frame.f_back if frame else None
        filePath = Path(caller.f_globals["__file__"]).resolve() if caller else Path.cwd()
        from .server import runServer

        runServer(mode="app", documentPath=filePath)


def md(content: str) -> str:
    return content
