from __future__ import annotations

from pathlib import Path

from codaro.document import createEmptyDocument, parseCodaroDocument, parseJupyterDocument, parseMarimoDocument
from codaro.document import writeCodaroDocument, writeJupyterDocument, writeMarimoDocument
from codaro.document import parsePercentDocument, writePercentDocument, isPercentFormat


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


def testPercentRoundTrip() -> None:
    document = createEmptyDocument("Notebook")
    document.metadata.sourceFormat = "percent"
    document.blocks = [
        document.blocks[0].model_copy(update={"id": "b1", "content": "x = 1\nprint(x)"}),
        document.blocks[0].model_copy(update={"id": "b2", "type": "markdown", "content": "# Results"}),
        document.blocks[0].model_copy(update={"id": "b3", "content": "y = x + 1"}),
    ]

    payload = writePercentDocument(document)
    parsed = parsePercentDocument(payload, Path("notebook.py"))

    assert parsed.title == "Notebook"
    assert parsed.metadata.sourceFormat == "percent"
    assert len(parsed.blocks) == 3
    assert parsed.blocks[0].type == "code"
    assert "x = 1" in parsed.blocks[0].content
    assert parsed.blocks[0].id == "b1"
    assert parsed.blocks[1].type == "markdown"
    assert parsed.blocks[1].content == "# Results"
    assert parsed.blocks[2].type == "code"
    assert "y = x + 1" in parsed.blocks[2].content


def testPercentFormatDetection() -> None:
    percentSource = "# codaro:app title='Test'\n\n# %% [code] id=b1\nx = 1\n"
    assert isPercentFormat(percentSource) is True

    codaroSource = "import codaro\napp = codaro.App(title='Test')\n"
    assert isPercentFormat(codaroSource) is False


def testPercentIsValidPython() -> None:
    document = createEmptyDocument("RunTest")
    document.metadata.sourceFormat = "percent"
    document.blocks = [
        document.blocks[0].model_copy(update={"id": "b1", "content": "result = 2 + 3"}),
        document.blocks[0].model_copy(update={"id": "b2", "type": "markdown", "content": "Done"}),
    ]

    payload = writePercentDocument(document)
    ns: dict = {}
    exec(compile(payload, "<test>", "exec"), ns)
    assert ns["result"] == 5
