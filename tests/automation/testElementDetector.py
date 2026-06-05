from __future__ import annotations

from codaro.automation.vision.capture import Frame, Region
from codaro.automation.vision.elementDetector import DetectedElement, _classifyContour


def testDetectedElementSerialize() -> None:
    el = DetectedElement(
        elementType="button",
        x=100,
        y=200,
        width=80,
        height=30,
        text="Save",
        confidence=0.95,
    )
    data = el.serialize()
    assert data["elementType"] == "button"
    assert data["centerX"] == 140
    assert data["centerY"] == 215
    assert data["text"] == "Save"
    assert data["confidence"] == 0.95


def testDetectedElementRegion() -> None:
    el = DetectedElement(elementType="input", x=10, y=20, width=200, height=30)
    r = el.region
    assert r.x == 10
    assert r.width == 200


def testClassifyContourButton() -> None:
    assert _classifyContour(4.0, 120, 30) == "button"


def testClassifyContourInput() -> None:
    assert _classifyContour(8.0, 240, 30) == "input"


def testClassifyContourCheckbox() -> None:
    assert _classifyContour(1.0, 20, 20) == "checkbox"


def testClassifyContourDivider() -> None:
    assert _classifyContour(10.0, 500, 2) == "divider"


def testClassifyContourRegion() -> None:
    assert _classifyContour(1.5, 200, 200) == "region"
