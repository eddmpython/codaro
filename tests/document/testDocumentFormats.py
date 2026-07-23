from __future__ import annotations

import json
from pathlib import Path

from codaro.document import createEmptyDocument, loadDocument, parseCodaroDocument, parseJupyterDocument, saveDocument
from codaro.document import writeCodaroDocument, writeJupyterDocument
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


def testSaveDocumentPreservesJupyterFormat(tmp_path: Path) -> None:
    path = tmp_path / "analysis.ipynb"
    document = createEmptyDocument("analysis")
    document.metadata.sourceFormat = "ipynb"
    document.blocks = [
        document.blocks[0].model_copy(update={"content": "total = sum([1, 2, 3])"}),
        document.blocks[0].model_copy(
            update={"id": "block-markdown", "type": "markdown", "content": "## 결과"},
        ),
    ]

    savedPath = saveDocument(str(path), document)
    payload = json.loads(savedPath.read_text(encoding="utf-8"))
    loaded = loadDocument(str(savedPath))

    assert payload["nbformat"] == 4
    assert [cell["cell_type"] for cell in payload["cells"]] == ["code", "markdown"]
    assert loaded.metadata.sourceFormat == "ipynb"
    assert loaded.blocks[0].content == "total = sum([1, 2, 3])"
    assert loaded.blocks[1].content == "## 결과"


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
