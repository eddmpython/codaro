from __future__ import annotations

import json
from pathlib import Path

import pytest

from codaro.document import createEmptyDocument, loadDocument, parseCodaroDocument, parseJupyterDocument, saveDocument
from codaro.document import writeCodaroDocument, writeJupyterDocument
from codaro.document import AppConfig, PercentFormatError, parsePercentDocument, writePercentDocument, isPercentFormat


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


@pytest.mark.parametrize("layout", ["notebook", "learning", "stack", "grid"])
@pytest.mark.parametrize("statePolicy", ["none", "perSession", "shared"])
@pytest.mark.parametrize("title", ["분석 앱", '따옴표 "와 역슬래시 \\', "두 줄\n제목"])
def testPercentAppSpecRoundTripsEveryFieldAndUnicode(
    layout: str,
    statePolicy: str,
    title: str,
) -> None:
    document = createEmptyDocument(title)
    document.metadata.sourceFormat = "percent"
    document.blocks[0].id = "entry-한글"
    document.app = AppConfig(
        title=title,
        layout=layout,
        hideCode=False,
        entryBlockIds=["entry-한글"],
        statePolicy=statePolicy,
    )

    payload = writePercentDocument(document)
    parsed = parsePercentDocument(payload, Path("앱.py"))

    assert parsed.app.model_dump() == document.app.model_dump()
    assert payload.count("# /// codaro-app") == 1
    assert "# codaro:app" not in payload
    compile(payload, "<app-spec>", "exec")


def testLegacyPercentAppHeaderMigratesOnceToCanonicalMetadata() -> None:
    legacy = "# codaro:app title='레거시 앱'\n\n# %% [code] id=entry\nanswer = 42\n"

    parsed = parsePercentDocument(legacy, Path("legacy.py"))
    canonical = writePercentDocument(parsed)
    reparsed = parsePercentDocument(canonical, Path("legacy.py"))

    assert parsed.app.title == "레거시 앱"
    assert parsed.app.schemaVersion == 1
    assert parsed.app.statePolicy == "perSession"
    assert canonical.count("# /// codaro-app") == 1
    assert "# codaro:app" not in canonical
    assert writePercentDocument(reparsed) == canonical


def testLegacyPercentAppHeaderAfterInlineScriptMetadataMigrates() -> None:
    source = """# /// script
# dependencies = [
#     "polars>=1.0",
# ]
# ///

# codaro:app title='레거시 앱'

# %% [code] id=entry
print("ok")
"""

    document = parsePercentDocument(source)

    assert document.title == "레거시 앱"
    assert document.runtime.packages == ["polars>=1.0"]
    canonical = writePercentDocument(document)
    assert "# codaro:app" not in canonical
    assert canonical.count("# /// codaro-app") == 1
    compile(canonical, "legacyApp.py", "exec")


def testPercentAppMetadataRejectsMissingEntryBlock() -> None:
    source = """# /// codaro-app
# schemaVersion = 1
# title = "Broken"
# layout = "notebook"
# hideCode = true
# entryBlockIds = ["deleted-block"]
# statePolicy = "perSession"
# ///

# %% [code] id=actual-block
answer = 42
"""

    with pytest.raises(PercentFormatError, match="entry blocks are missing"):
        parsePercentDocument(source, Path("broken.py"))


def testPercentAppMetadataRejectsUnknownSchemaWithoutOverwritingSource(tmp_path: Path) -> None:
    source = """# /// codaro-app
# schemaVersion = 999
# title = "Future"
# layout = "notebook"
# hideCode = true
# entryBlockIds = []
# statePolicy = "perSession"
# ///

# %% [code] id=entry
answer = 42
"""
    path = tmp_path / "future.py"
    path.write_text(source, encoding="utf-8")

    with pytest.raises(PercentFormatError, match="codaro-app metadata is invalid"):
        loadDocument(str(path))

    assert path.read_text(encoding="utf-8") == source


def testSavePercentDocumentDoesNotOverwriteWhenEntryWasDeleted(tmp_path: Path) -> None:
    path = tmp_path / "safe.py"
    document = createEmptyDocument("Safe")
    document.metadata.sourceFormat = "percent"
    document.blocks[0].id = "entry"
    document.app.entryBlockIds = ["entry"]
    saveDocument(str(path), document)
    original = path.read_text(encoding="utf-8")

    document.blocks = []
    with pytest.raises(PercentFormatError, match="missing or ambiguous"):
        saveDocument(str(path), document)

    assert path.read_text(encoding="utf-8") == original
