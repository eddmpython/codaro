from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from .capture import Frame, Region

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class DetectedElement:
    elementType: str
    x: int
    y: int
    width: int
    height: int
    text: str | None = None
    confidence: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def centerX(self) -> int:
        return self.x + self.width // 2

    @property
    def centerY(self) -> int:
        return self.y + self.height // 2

    @property
    def region(self) -> Region:
        return Region(x=self.x, y=self.y, width=self.width, height=self.height)

    def serialize(self) -> dict[str, Any]:
        return {
            "elementType": self.elementType,
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
            "centerX": self.centerX,
            "centerY": self.centerY,
            "text": self.text,
            "confidence": round(self.confidence, 3),
        }


class ElementDetector:

    def __init__(self) -> None:
        self._cv2 = None
        self._np = None

    def _ensureCv(self):
        if self._cv2 is None:
            import cv2
            import numpy as np
            self._cv2 = cv2
            self._np = np
        return self._cv2, self._np

    def _frameToBgr(self, frame: Frame):
        _, np = self._ensureCv()
        arr = np.frombuffer(frame.data, dtype=np.uint8)
        if frame.channels == 4:
            arr = arr.reshape((frame.height, frame.width, 4))
            return arr[:, :, :3].copy()
        elif frame.channels == 3:
            return arr.reshape((frame.height, frame.width, 3)).copy()
        return arr.reshape((frame.height, frame.width))

    def detectByTemplate(
        self,
        frame: Frame,
        templateData: bytes,
        templateWidth: int,
        templateHeight: int,
        templateChannels: int = 3,
        threshold: float = 0.8,
        maxResults: int = 10,
    ) -> list[DetectedElement]:
        cv2, np = self._ensureCv()
        image = self._frameToBgr(frame)

        tArr = np.frombuffer(templateData, dtype=np.uint8)
        if templateChannels == 4:
            tArr = tArr.reshape((templateHeight, templateWidth, 4))[:, :, :3].copy()
        elif templateChannels == 3:
            tArr = tArr.reshape((templateHeight, templateWidth, 3))
        else:
            tArr = tArr.reshape((templateHeight, templateWidth))

        if len(image.shape) == 3 and len(tArr.shape) == 3:
            imageGray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            tGray = cv2.cvtColor(tArr, cv2.COLOR_BGR2GRAY)
        else:
            imageGray = image
            tGray = tArr

        result = cv2.matchTemplate(imageGray, tGray, cv2.TM_CCOEFF_NORMED)
        locations = np.where(result >= threshold)

        elements: list[DetectedElement] = []
        used: set[tuple[int, int]] = set()

        for pt in zip(*locations[::-1]):
            skip = False
            for ux, uy in used:
                if abs(pt[0] - ux) < templateWidth // 2 and abs(pt[1] - uy) < templateHeight // 2:
                    skip = True
                    break
            if skip:
                continue

            used.add((int(pt[0]), int(pt[1])))
            conf = float(result[pt[1], pt[0]])
            elements.append(DetectedElement(
                elementType="template",
                x=int(pt[0]) + (frame.region.x if frame.region else 0),
                y=int(pt[1]) + (frame.region.y if frame.region else 0),
                width=templateWidth,
                height=templateHeight,
                confidence=conf,
            ))
            if len(elements) >= maxResults:
                break

        elements.sort(key=lambda e: e.confidence, reverse=True)
        return elements

    def detectByOcr(
        self,
        frame: Frame,
        searchText: str | None = None,
    ) -> list[DetectedElement]:
        from .paddleOcr import PaddleOcrEngine

        ocr = PaddleOcrEngine()
        try:
            regions = ocr.readText(frame)
        finally:
            ocr.dispose()

        elements: list[DetectedElement] = []
        for r in regions:
            if searchText and searchText.lower() not in r.text.lower():
                continue
            elements.append(DetectedElement(
                elementType="text",
                x=r.x,
                y=r.y,
                width=r.width,
                height=r.height,
                text=r.text,
                confidence=r.confidence,
            ))

        return elements

    def detectByContour(
        self,
        frame: Frame,
        minArea: int = 500,
        maxArea: int = 100000,
        minAspectRatio: float = 0.2,
        maxAspectRatio: float = 5.0,
    ) -> list[DetectedElement]:
        cv2, np = self._ensureCv()
        image = self._frameToBgr(frame)

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)

        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)

        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        offsetX = frame.region.x if frame.region else 0
        offsetY = frame.region.y if frame.region else 0

        elements: list[DetectedElement] = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area < minArea or area > maxArea:
                continue

            bx, by, bw, bh = cv2.boundingRect(contour)
            aspect = bw / bh if bh > 0 else 0
            if aspect < minAspectRatio or aspect > maxAspectRatio:
                continue

            elementType = _classifyContour(aspect, bw, bh)
            elements.append(DetectedElement(
                elementType=elementType,
                x=bx + offsetX,
                y=by + offsetY,
                width=bw,
                height=bh,
                confidence=min(area / maxArea, 1.0),
            ))

        elements.sort(key=lambda e: e.y * 10000 + e.x)
        return elements

    def detectAll(
        self,
        frame: Frame,
        searchText: str | None = None,
    ) -> list[DetectedElement]:
        ocrElements = self.detectByOcr(frame, searchText=searchText)
        contourElements = self.detectByContour(frame)

        allElements = ocrElements + contourElements
        allElements.sort(key=lambda e: e.confidence, reverse=True)
        return allElements

    def dispose(self) -> None:
        self._cv2 = None
        self._np = None


def _classifyContour(aspect: float, width: int, height: int) -> str:
    if 0.8 <= aspect <= 1.2 and 10 <= width <= 30:
        return "checkbox"
    if aspect > 8.0 and height < 10:
        return "divider"
    if aspect >= 5.0 and 15 <= height <= 50:
        return "input"
    if 2.0 <= aspect < 5.0 and 20 <= height <= 60:
        return "button"
    if aspect > 8.0:
        return "divider"
    return "region"
