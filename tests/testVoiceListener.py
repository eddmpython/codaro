from __future__ import annotations

from codaro.automation.voice.listener import TranscriptionResult


def testTranscriptionResultSerialize() -> None:
    result = TranscriptionResult(
        text="hello world",
        language="en",
        confidence=0.95,
        duration=2.5,
        segments=[{"start": 0.0, "end": 2.5, "text": "hello world"}],
    )
    data = result.serialize()
    assert data["text"] == "hello world"
    assert data["language"] == "en"
    assert data["confidence"] == 0.95
    assert data["duration"] == 2.5
    assert data["segmentCount"] == 1


def testTranscriptionResultDefaults() -> None:
    result = TranscriptionResult(text="test")
    assert result.language == "en"
    assert result.confidence == 0.0
    assert result.duration == 0.0
    assert result.segments == []


def testTranscriptionResultEmptyText() -> None:
    result = TranscriptionResult(text="")
    data = result.serialize()
    assert data["text"] == ""
    assert data["segmentCount"] == 0
