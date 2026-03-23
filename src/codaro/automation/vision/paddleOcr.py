from __future__ import annotations

import logging

from .capture import Frame, Region
from .ocr import TextRegion

logger = logging.getLogger(__name__)


class PaddleOcrEngine:

    def __init__(self, lang: str = "en") -> None:
        self._lang = lang
        self._engine = None

    def _ensureEngine(self):
        if self._engine is None:
            from paddleocr import PaddleOCR
            self._engine = PaddleOCR(use_angle_cls=True, lang=self._lang, show_log=False)
            logger.info("PaddleOCR engine loaded (lang=%s)", self._lang)
        return self._engine

    def readText(self, frame: Frame, region: Region | None = None) -> list[TextRegion]:
        import numpy as np
        engine = self._ensureEngine()

        if not frame.data:
            return []

        array = np.frombuffer(frame.data, dtype=np.uint8)
        if frame.channels == 4:
            array = array.reshape((frame.height, frame.width, 4))
            array = array[:, :, :3]
        elif frame.channels == 3:
            array = array.reshape((frame.height, frame.width, 3))
        else:
            return []

        if region is not None:
            x2 = min(region.x + region.width, frame.width)
            y2 = min(region.y + region.height, frame.height)
            array = array[region.y:y2, region.x:x2]

        results = engine.ocr(array, cls=True)
        if results is None:
            return []

        textRegions: list[TextRegion] = []
        for page in results:
            if page is None:
                continue
            for line in page:
                box, (text, confidence) = line
                x1 = int(min(pt[0] for pt in box))
                y1 = int(min(pt[1] for pt in box))
                x2 = int(max(pt[0] for pt in box))
                y2 = int(max(pt[1] for pt in box))

                offsetX = region.x if region else 0
                offsetY = region.y if region else 0

                textRegions.append(TextRegion(
                    text=text,
                    confidence=float(confidence),
                    bbox=Region(
                        x=x1 + offsetX,
                        y=y1 + offsetY,
                        width=x2 - x1,
                        height=y2 - y1,
                    ),
                ))
        return textRegions

    def readLines(self, frame: Frame) -> list[str]:
        regions = self.readText(frame)
        return [r.text for r in regions]

    def dispose(self) -> None:
        self._engine = None
