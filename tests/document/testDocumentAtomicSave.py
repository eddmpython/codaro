from __future__ import annotations

import os
from pathlib import Path

import pytest

from codaro.document import createEmptyDocument, loadDocument, saveDocument
import codaro.document.service as documentService


@pytest.mark.parametrize(
    ("sourceFormat", "suffix"),
    [
        ("codaro", ".py"),
        ("percent", ".py"),
        ("ipynb", ".ipynb"),
    ],
)
def testSaveDocumentAtomicallyWritesEveryFormat(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    sourceFormat: str,
    suffix: str,
) -> None:
    path = tmp_path / f"lesson{suffix}"
    path.write_text("previous content", encoding="utf-8")
    document = createEmptyDocument("Atomic lesson")
    document.metadata.sourceFormat = sourceFormat
    document.blocks[0].content = "value = 42"
    events: list[str] = []
    realFsync = os.fsync
    realReplace = os.replace

    def trackingFsync(fileDescriptor: int) -> None:
        events.append("fsync")
        realFsync(fileDescriptor)

    def trackingReplace(source: str | bytes | Path, destination: str | bytes | Path) -> None:
        sourcePath = Path(source)
        destinationPath = Path(destination)
        assert sourcePath.parent == path.parent
        assert destinationPath == path.resolve()
        assert sourcePath.exists()
        events.append("replace")
        realReplace(source, destination)

    monkeypatch.setattr(documentService.os, "fsync", trackingFsync)
    monkeypatch.setattr(documentService.os, "replace", trackingReplace)

    savedPath = saveDocument(str(path), document)

    loaded = loadDocument(str(savedPath))
    assert savedPath == path.resolve()
    assert loaded.metadata.sourceFormat == sourceFormat
    assert loaded.blocks[0].content == "value = 42"
    assert events == ["fsync", "replace"]
    assert list(tmp_path.glob(f".{path.name}.*.tmp")) == []


@pytest.mark.parametrize("failurePoint", ["fsync", "replace"])
def testSaveDocumentFailurePreservesExistingFileAndCleansTemporaryFile(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    failurePoint: str,
) -> None:
    path = tmp_path / "lesson.py"
    originalBytes = b"original = True\r\n"
    path.write_bytes(originalBytes)
    document = createEmptyDocument("Atomic lesson")
    document.metadata.sourceFormat = "percent"
    document.blocks[0].content = "replacement = True"

    if failurePoint == "fsync":
        def failFsync(_fileDescriptor: int) -> None:
            raise OSError("forced fsync failure")

        monkeypatch.setattr(documentService.os, "fsync", failFsync)
    else:
        def failReplace(
            _source: str | bytes | Path,
            _destination: str | bytes | Path,
        ) -> None:
            raise OSError("forced replace failure")

        monkeypatch.setattr(documentService.os, "replace", failReplace)

    with pytest.raises(OSError, match=f"forced {failurePoint} failure"):
        saveDocument(str(path), document)

    assert path.read_bytes() == originalBytes
    assert list(tmp_path.glob(f".{path.name}.*.tmp")) == []
