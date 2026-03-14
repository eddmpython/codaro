from __future__ import annotations

from pathlib import Path

from codaro.document import createEmptyDocument, parseCodaroDocument, parseJupyterDocument, parseMarimoDocument
from codaro.document import writeCodaroDocument, writeJupyterDocument, writeMarimoDocument


def testCodaroRoundTrip() -> None:
    document = createEmptyDocument("Notebook")
    document.blocks = [
        document.blocks[0].model_copy(update={"content": "value = 3\nprint(value)"}),
        document.blocks[0].model_copy(update={"id": "block-markdown", "type": "markdown", "content": "# Title"}),
    ]

    payload = writeCodaroDocument(document)
    parsed = parseCodaroDocument(payload, Path("notebook.py"))

    assert parsed.title == "Notebook"
    assert parsed.blocks[0].type == "code"
    assert "value = 3" in parsed.blocks[0].content
    assert parsed.blocks[1].type == "markdown"
    assert parsed.blocks[1].content == "# Title"


def testMarimoRoundTrip() -> None:
    document = createEmptyDocument("Notebook")
    document.blocks[0] = document.blocks[0].model_copy(update={"content": "sales = 10\nsales"})
    payload = writeMarimoDocument(document)
    parsed = parseMarimoDocument(payload, Path("notebook.py"))

    assert parsed.title == "Notebook"
    assert parsed.blocks[0].type == "code"
    assert "sales = 10" in parsed.blocks[0].content


def testJupyterRoundTrip() -> None:
    document = createEmptyDocument("Notebook")
    document.blocks = [
        document.blocks[0].model_copy(update={"content": "items = [1, 2, 3]\nsum(items)"}),
        document.blocks[0].model_copy(update={"id": "block-markdown", "type": "markdown", "content": "## Heading"}),
    ]
    payload = writeJupyterDocument(document)
    parsed = parseJupyterDocument(payload, Path("notebook.ipynb"))

    assert parsed.blocks[0].type == "code"
    assert "sum(items)" in parsed.blocks[0].content
    assert parsed.blocks[1].type == "markdown"
    assert parsed.blocks[1].content == "## Heading"
