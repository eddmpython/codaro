from __future__ import annotations

import os
from pathlib import Path
import stat
import uuid

from .codaroFormat import parseCodaroDocument, writeCodaroDocument
from .jupyterFormat import parseJupyterDocument, writeJupyterDocument
from .percentFormat import isPercentFormat, parsePercentDocument, writePercentDocument
from .models import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig


def _writeTextAtomically(path: Path, text: str) -> None:
    temporaryPath = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    temporaryCreated = False
    existingMode = stat.S_IMODE(path.stat().st_mode) if path.exists() else None

    try:
        with temporaryPath.open("x", encoding="utf-8") as temporaryFile:
            temporaryCreated = True
            temporaryFile.write(text)
            temporaryFile.flush()
            os.fsync(temporaryFile.fileno())
        if existingMode is not None:
            temporaryPath.chmod(existingMode)
        os.replace(temporaryPath, path)
        temporaryCreated = False
    finally:
        if temporaryCreated:
            temporaryPath.unlink(missing_ok=True)


def createEmptyDocument(title: str = "Untitled") -> CodaroDocument:
    return CodaroDocument(
        id=f"doc-{uuid.uuid4().hex[:10]}",
        title=title,
        blocks=[BlockConfig(id=f"block-{uuid.uuid4().hex[:8]}", type="code", content="")],
        metadata=DocumentMetadata(sourceFormat="percent"),
        runtime=RuntimeConfig(),
        app=AppConfig(title=title),
    )


def loadDocument(pathLike: str) -> CodaroDocument:
    path = Path(pathLike).expanduser().resolve()
    source = path.read_text(encoding="utf-8")
    suffix = path.suffix.lower()

    if suffix == ".ipynb":
        return parseJupyterDocument(source, path)

    if isPercentFormat(source):
        return parsePercentDocument(source, path)

    return parseCodaroDocument(source, path)


def saveDocument(pathLike: str, document: CodaroDocument) -> Path:
    path = Path(pathLike).expanduser().resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = document.model_copy(
        update={
            "title": document.title or path.stem,
            "metadata": document.metadata.model_copy(update={"updatedAt": DocumentMetadata().updatedAt}),
            "app": document.app.model_copy(update={"title": document.title or path.stem}),
        }
    )

    sourceFormat = payload.metadata.sourceFormat
    if sourceFormat == "percent":
        text = writePercentDocument(payload)
    elif sourceFormat == "ipynb":
        text = writeJupyterDocument(payload)
    else:
        text = writeCodaroDocument(payload)
    _writeTextAtomically(path, text)
    return path


def exportDocument(pathLike: str, formatName: str, outputPathLike: str | None = None) -> Path:
    document = loadDocument(pathLike)
    formatName = formatName.lower()
    defaultSuffix = ".py" if formatName in {"codaro", "percent"} else ".ipynb"
    outputPath = (
        Path(outputPathLike).expanduser().resolve()
        if outputPathLike
        else Path(pathLike).expanduser().resolve().with_suffix(defaultSuffix)
    )
    outputPath.parent.mkdir(parents=True, exist_ok=True)

    if formatName == "percent":
        text = writePercentDocument(document)
    elif formatName == "codaro":
        text = writeCodaroDocument(document)
    elif formatName == "ipynb":
        text = writeJupyterDocument(document)
    else:
        raise ValueError(f"Unsupported export format: {formatName}")

    _writeTextAtomically(outputPath, text)
    return outputPath
