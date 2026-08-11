from importlib.metadata import PackageNotFoundError, version

from .appRuntime import (
    App,
    accordion,
    callout,
    hstack,
    html,
    md,
    markdown,
    plain,
    sidebar,
    stat,
    state,
    stop,
    tabs,
    text,
    ui,
    vstack,
)
from .cli import main
from .customTool import tool
from .server import createServerApp

try:
    __version__ = version("codaro")
except PackageNotFoundError:
    __version__ = "0.0.0+source"

__all__ = [
    "__version__",
    "accordion",
    "App",
    "callout",
    "createServerApp",
    "hstack",
    "html",
    "main",
    "md",
    "markdown",
    "plain",
    "sidebar",
    "stat",
    "state",
    "stop",
    "tabs",
    "text",
    "tool",
    "ui",
    "vstack",
]
