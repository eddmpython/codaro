from __future__ import annotations

import logging

from .capture import Frame, Region
from .ocr import TextRegion

logger = logging.getLogger(__name__)


class EasyOcrEngine:

    def __init__(self, langs: list[str] | None = None) -> None:
        self._langs = langs or ["en"]
        self._reader = None

    def _ensureReader(self):
        if self._reader is None:
            import easyocr
            self._reader = easyocr.Reader(self._langs, verbose=False)
            logger.info("EasyOCR reader loaded (langs=%s)", self._langs)
        return self._reader

    def readText(self, frame: Frame, region: Region | None = None) -> list[TextRegion]:
        import numpy as np
        reader = self._ensureReader()

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

        results = reader.readtext(array)

        textRegions: list[TextRegion] = []
        for (box, text, confidence) in results:
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
        self._reader = None
