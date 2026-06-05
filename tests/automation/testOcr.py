from __future__ import annotations

import pytest
from codaro.automation.vision.capture import Frame, Region
from codaro.automation.vision.ocr import TextRegion


class TestTextRegion:

    def test_serialize(self):
        region = TextRegion(
            text="Hello",
            confidence=0.95432,
            bbox=Region(x=10, y=20, width=100, height=30),
        )
        data = region.serialize()
        assert data["text"] == "Hello"
        assert data["confidence"] == 0.954
        assert data["bbox"]["x"] == 10
        assert data["bbox"]["width"] == 100

    def test_serializeRoundsConfidence(self):
        region = TextRegion(
            text="Test",
            confidence=0.123456789,
            bbox=Region(x=0, y=0, width=10, height=10),
        )
        assert region.serialize()["confidence"] == 0.123


class TestOcrProtocol:

    def test_ocrEngineIsProtocol(self):
        from codaro.automation.vision.ocr import OcrEngine
        assert hasattr(OcrEngine, "readText")
        assert hasattr(OcrEngine, "readLines")
        assert hasattr(OcrEngine, "dispose")


class TestPaddleOcrEngine:

    def test_emptyFrameReturnsEmpty(self):
        pytest.importorskip("numpy")
        pytest.importorskip("paddleocr")
        from codaro.automation.vision.paddleOcr import PaddleOcrEngine

        engine = PaddleOcrEngine()
        frame = Frame(data=b"", width=0, height=0, channels=3)
        result = engine.readText(frame)
        assert result == []
        engine.dispose()

    def test_disposeIdempotent(self):
        pytest.importorskip("paddleocr")
        from codaro.automation.vision.paddleOcr import PaddleOcrEngine

        engine = PaddleOcrEngine()
        engine.dispose()
        engine.dispose()


class TestEasyOcrEngine:

    def test_emptyFrameReturnsEmpty(self):
        pytest.importorskip("numpy")
        pytest.importorskip("easyocr")
        from codaro.automation.vision.easyOcr import EasyOcrEngine

        engine = EasyOcrEngine()
        frame = Frame(data=b"", width=0, height=0, channels=3)
        result = engine.readText(frame)
        assert result == []
        engine.dispose()

    def test_disposeIdempotent(self):
        pytest.importorskip("easyocr")
        from codaro.automation.vision.easyOcr import EasyOcrEngine

        engine = EasyOcrEngine()
        engine.dispose()
        engine.dispose()
