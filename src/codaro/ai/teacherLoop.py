"""Legacy import shim for context and tool lifecycle helpers.

Internal code must import from codaro.ai.teacher instead. Remove after external
callers move off codaro.ai.teacherLoop and the next minor release documents the
replacement path.
"""

from __future__ import annotations

from .teacher.contextBuilder import injectContext
from .teacher.toolLifecycle import toolCallResult, toolCallStart

__all__ = ["injectContext", "toolCallResult", "toolCallStart"]
