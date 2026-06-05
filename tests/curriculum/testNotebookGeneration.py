from pathlib import Path

from codaro.document.models import BlockConfig
from codaro.document.notebookGeneration import (
    buildGeneratedNotebookDocument,
    buildSplitNotebookDocument,
    safeNotebookFileName,
    saveNotebookDocument,
)
from codaro.document.service import loadDocument


def testBuildGeneratedNotebookDocumentCreatesDocumentFromDrafts() -> None:
    document = buildGeneratedNotebookDocument(
        title="Generated",
        blockDrafts=(
            {"type": "markdown", "content": "# Intro"},
            {"type": "code", "content": "x = 1"},
        ),
    )

    assert document.id.startswith("doc-")
    assert document.title == "Generated"
    assert [block.type for block in document.blocks] == ["markdown", "code"]
    assert [block.content for block in document.blocks] == ["# Intro", "x = 1"]
    assert all(block.id.startswith("gen-") for block in document.blocks)


def testBuildSplitNotebookDocumentClonesSelectedBlockContent() -> None:
    sourceBlocks = [
        BlockConfig(
            id="b1",
            type="code",
            content="x = 1",
            role="exercise",
            payload={"internal": True},
        ),
    ]

    document = buildSplitNotebookDocument(title="Part 1", blocks=sourceBlocks)

    assert document.id.startswith("doc-")
    assert document.title == "Part 1"
    assert len(document.blocks) == 1
    assert document.blocks[0].id == "b1"
    assert document.blocks[0].type == "code"
    assert document.blocks[0].content == "x = 1"
    assert document.blocks[0].role is None
    assert document.blocks[0].payload is None


def testSafeNotebookFileNameKeepsWorkspaceFriendlyName() -> None:
    assert safeNotebookFileName("Pandas: 입문 / 01?") == "Pandas_입문__01"
    assert safeNotebookFileName("///") == "untitled"


def testSaveNotebookDocumentPersistsThroughDocumentService(tmp_path: Path) -> None:
    document = buildGeneratedNotebookDocument(
        title="Persisted",
        blockDrafts=({"type": "code", "content": "print('ok')"},),
    )
    path = tmp_path / "persisted.py"

    saveNotebookDocument(path, document)

    loaded = loadDocument(str(path))
    assert loaded.title == "Persisted"
    assert loaded.blocks[0].content == "print('ok')"
