"""Legacy import shim for server state symbols.

Internal code must import from codaro.system.serverState instead. Remove after
external callers move off codaro.api.appState and the next minor release
documents the replacement path.
"""

from __future__ import annotations

from ..system.serverState import ServerState, createServerState

__all__ = ["ServerState", "createServerState"]
