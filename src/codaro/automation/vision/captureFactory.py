from __future__ import annotations

import logging
import sys

from .capture import ScreenCapture

logger = logging.getLogger(__name__)


def createCapture(backend: str = "auto") -> ScreenCapture:
    if backend == "dxcam" or (backend == "auto" and sys.platform == "win32"):
        try:
            from .dxcamCapture import DxcamCapture
            return DxcamCapture()
        except ImportError:
            if backend == "dxcam":
                raise
            logger.debug("dxcam not available, falling back to mss")

    if backend == "mss" or backend == "auto":
        try:
            from .mssCapture import MssCapture
            return MssCapture()
        except ImportError:
            if backend == "mss":
                raise

    raise RuntimeError(
        f"No screen capture backend available (requested: {backend}). "
        "Install 'dxcam' (Windows) or 'mss' (cross-platform)."
    )
