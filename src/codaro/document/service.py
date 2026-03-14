from __future__ import annotations

from pathlib import Path
import uuid

from .codaroFormat import parseCodaroDocument, writeCodaroDocument
from .jupyterFormat import parseJupyterDocument, writeJupyterDocument
from .marimoFormat import parseMarimoDocument, writeMarimoDocument
from .models import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig


def createEmptyDocument(title: str = "Untitled") -> CodaroDocument:
    return CodaroDocument(
        id=f"doc-{uuid.uuid4().hex[:10]}",
        title=title,
        blocks=[BlockConfig(id=f"block-{uuid.uuid4().hex[:8]}", type="code", content="")],
        metadata=DocumentMetadata(sourceFormat="codaro"),
        runtime=RuntimeConfig(),
        app=AppConfig(title=title),
    )


def loadDocument(pathLike: str) -> CodaroDocument:
    path = Path(pathLike).expanduser().resolve()
    source = path.read_text(encoding="utf-8")
    suffix = path.suffix.lower()

    if suffix == ".ipynb":
        return parseJupyterDocument(source, path)

    if "marimo.App" in source or "@app.cell" in source:
        return parseMarimoDocument(source, path)

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
    path.write_text(writeCodaroDocument(payload), encoding="utf-8")
    return path


def exportDocument(pathLike: str, formatName: str, outputPathLike: str | None = None) -> Path:
    document = loadDocument(pathLike)
    formatName = formatName.lower()
    defaultSuffix = ".py" if formatName in {"codaro", "marimo"} else ".ipynb"
    outputPath = (
        Path(outputPathLike).expanduser().resolve()
        if outputPathLike
        else Path(pathLike).expanduser().resolve().with_suffix(defaultSuffix)
    )
    outputPath.parent.mkdir(parents=True, exist_ok=True)

    if formatName == "codaro":
        payload = writeCodaroDocument(document)
    elif formatName == "marimo":
        payload = writeMarimoDocument(document)
    elif formatName == "ipynb":
        payload = writeJupyterDocument(document)
    else:
        raise ValueError(f"Unsupported export format: {formatName}")

    outputPath.write_text(payload, encoding="utf-8")
    return outputPath
