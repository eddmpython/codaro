from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys

import pytest

from codaro.document import (
    AppConfig,
    BlockConfig,
    CodaroDocument,
    CodaroFormatError,
    DocumentMetadata,
    JupyterFormatError,
    PercentFormatError,
    RuntimeConfig,
    exportDocument,
    loadDocument,
    parseCodaroDocument,
    parseJupyterDocument,
    parsePercentDocument,
    saveDocument,
    writeCodaroDocument,
    writeJupyterDocument,
    writePercentDocument,
)
from codaro.document.models import BlockExecution, GuideConfig


def _document(sourceFormat: str) -> CodaroDocument:
    return CodaroDocument(
        id="doc-stable-한글_01",
        title="문서 제목과 앱 제목은 다름",
        blocks=[
            BlockConfig(
                id="source_block_한글",
                type="code",
                content="base = 40\n",
                role="snippet",
                executionKind="python",
                displayKind="code",
                sourceType="learner",
                payload={"origin": "직접 작성", "values": [1, None, True]},
                title="원본 코드",
                description="공급자 블록",
                collapsed=True,
                execution=BlockExecution(
                    executionCount=7,
                    status="success",
                    lastRunAt="2026-08-10T00:00:00+00:00",
                    lastOutput="ephemeral output",
                ),
            ),
            BlockConfig(
                id="markdown_block",
                type="markdown",
                content="## 결과\n\n공백도 보존\n",
                role="explanation",
                displayKind="prose",
                sourceType="curriculum",
                payload={"links": ["source_block_한글"]},
                title="설명",
                description="마크다운 블록",
                collapsed=False,
            ),
            BlockConfig(
                id="automation_block",
                type="automation",
                content="result = base + 2\nprint(result)",
                role="automation",
                executionKind="task",
                displayKind="cardGrid",
                sourceType="promoted",
                payload={
                    "inputSchema": {"count": {"type": "integer"}},
                    "output": {"path": "artifacts/report.json"},
                },
                title="보고서 자동화",
                description="검증된 결과를 다시 실행",
                collapsed=True,
                guide=GuideConfig(
                    exerciseType="build",
                    hints=["입력 계약 확인"],
                    checkConfig={"requiredFields": ["count"]},
                    difficulty="hard",
                    solution="result = base + 2",
                    description="자동화 검증",
                    studentAnswer="result = base + 2",
                ),
            ),
        ],
        metadata=DocumentMetadata(
            createdAt="2026-08-09T10:00:00+00:00",
            updatedAt="2026-08-10T10:00:00+00:00",
            sourceFormat=sourceFormat,
            tags=["python", "자동화", "roundtrip"],
        ),
        runtime=RuntimeConfig(
            defaultEngine="browser",
            reactiveMode="automatic",
            packages=["polars==1.33.0", "typing-extensions>=4.12"],
        ),
        app=AppConfig(
            title="배포 앱 제목",
            layout="grid",
            hideCode=False,
            entryBlockIds=["automation_block"],
            statePolicy="shared",
        ),
    )


def _persistentProjection(document: CodaroDocument) -> dict[str, object]:
    payload = document.model_dump(mode="json")
    for block in payload["blocks"]:
        block.pop("execution")
    return payload


def _formatIndependentProjection(document: CodaroDocument) -> dict[str, object]:
    payload = _persistentProjection(document)
    payload["metadata"]["sourceFormat"] = "target-format"
    return payload


@pytest.mark.parametrize(
    ("sourceFormat", "writer", "parser", "path"),
    [
        ("percent", writePercentDocument, parsePercentDocument, Path("roundtrip.py")),
        ("ipynb", writeJupyterDocument, parseJupyterDocument, Path("roundtrip.ipynb")),
        ("codaro", writeCodaroDocument, parseCodaroDocument, Path("roundtrip.py")),
    ],
)
def testEverySupportedFormatPreservesAllPersistentDocumentMeaning(
    sourceFormat: str,
    writer,
    parser,
    path: Path,
) -> None:
    document = _document(sourceFormat)

    encoded = writer(document)
    parsed = parser(encoded, path)

    assert _persistentProjection(parsed) == _persistentProjection(document)
    assert all(block.execution == BlockExecution() for block in parsed.blocks)
    assert writer(parsed) == encoded


def testPercentMetadataRemainsExecutableAsPlainPython(tmp_path: Path) -> None:
    document = _document("percent")
    path = tmp_path / "roundtrip.py"
    path.write_text(writePercentDocument(document), encoding="utf-8")

    completed = subprocess.run(
        [sys.executable, str(path)],
        cwd=tmp_path,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )

    assert completed.returncode == 0, completed.stderr
    assert completed.stdout.strip() == "42"


def testCrossFormatConversionPreservesStableIdentityAndPersistentMeaning() -> None:
    original = _document("percent")

    asJupyter = parseJupyterDocument(writeJupyterDocument(original), Path("converted.ipynb"))
    asCodaro = parseCodaroDocument(writeCodaroDocument(asJupyter), Path("converted.py"))
    backToPercent = parsePercentDocument(writePercentDocument(asCodaro), Path("converted.py"))

    expected = _formatIndependentProjection(original)
    assert _formatIndependentProjection(asJupyter) == expected
    assert _formatIndependentProjection(asCodaro) == expected
    assert _formatIndependentProjection(backToPercent) == expected


def testPublicExportSurfacePreservesPersistentMeaningAcrossAllFormats(tmp_path: Path) -> None:
    sourcePath = tmp_path / "source.py"
    saveDocument(str(sourcePath), _document("percent"))
    sourceDocument = loadDocument(str(sourcePath))

    for formatName, suffix in (("percent", ".py"), ("ipynb", ".ipynb"), ("codaro", ".py")):
        outputPath = tmp_path / f"exported-{formatName}{suffix}"
        exportDocument(str(sourcePath), formatName, str(outputPath))
        exported = loadDocument(str(outputPath))

        assert _formatIndependentProjection(exported) == _formatIndependentProjection(sourceDocument)


@pytest.mark.parametrize(("sourceFormat", "suffix"), [("percent", ".py"), ("ipynb", ".ipynb"), ("codaro", ".py")])
def testSaveAndReloadPreservesAppConfigInsteadOfReplacingItsTitle(
    tmp_path: Path,
    sourceFormat: str,
    suffix: str,
) -> None:
    document = _document(sourceFormat)
    path = tmp_path / f"saved{suffix}"

    saveDocument(str(path), document)
    loaded = loadDocument(str(path))

    assert loaded.app.model_dump() == document.app.model_dump()


def testJupyterUsesVersionedNotebookAndCellNamespacesAndDropsOutputs() -> None:
    document = _document("ipynb")
    payload = json.loads(writeJupyterDocument(document))

    assert payload["metadata"]["codaro"]["schemaVersion"] == 1
    assert all(cell["metadata"]["codaro"]["schemaVersion"] == 1 for cell in payload["cells"])
    assert payload["cells"][0]["id"] != document.blocks[0].id
    assert payload["cells"][0]["metadata"]["codaro"]["id"] == document.blocks[0].id
    assert all(cell.get("outputs", []) == [] for cell in payload["cells"])
    assert all(cell.get("execution_count") is None for cell in payload["cells"] if cell["cell_type"] == "code")


@pytest.mark.parametrize("formatName", ["percent", "ipynb", "codaro"])
def testUnknownMetadataVersionFailsClosedWithoutChangingSource(tmp_path: Path, formatName: str) -> None:
    document = _document(formatName)
    if formatName == "percent":
        source = writePercentDocument(document).replace("# schemaVersion = 1", "# schemaVersion = 999", 1)
        path = tmp_path / "future.py"
        error = PercentFormatError
    elif formatName == "ipynb":
        payload = json.loads(writeJupyterDocument(document))
        payload["metadata"]["codaro"]["schemaVersion"] = 999
        source = json.dumps(payload, ensure_ascii=False)
        path = tmp_path / "future.ipynb"
        error = JupyterFormatError
    else:
        source = writeCodaroDocument(document).replace("# schemaVersion = 1", "# schemaVersion = 999", 1)
        path = tmp_path / "future.py"
        error = CodaroFormatError
    path.write_text(source, encoding="utf-8")

    with pytest.raises(error, match="schemaVersion"):
        loadDocument(str(path))

    assert path.read_text(encoding="utf-8") == source


def testUnknownJupyterCellMetadataVersionFailsClosed() -> None:
    payload = json.loads(writeJupyterDocument(_document("ipynb")))
    payload["cells"][1]["metadata"]["codaro"]["schemaVersion"] = 999

    with pytest.raises(JupyterFormatError, match="schemaVersion"):
        parseJupyterDocument(json.dumps(payload, ensure_ascii=False))


def testUnknownPercentBlockMetadataVersionFailsClosed() -> None:
    source = writePercentDocument(_document("percent"))
    futureBlock = source.replace(
        "# /// codaro-block\n# schemaVersion = 1",
        "# /// codaro-block\n# schemaVersion = 999",
        1,
    )

    with pytest.raises(PercentFormatError, match="schemaVersion"):
        parsePercentDocument(futureBlock)


def testPercentRejectsStaleMarkerIdentityAndDependencyMetadata() -> None:
    source = writePercentDocument(_document("percent"))
    staleMarker = source.replace(
        '# %% [code] id="source_block_한글"',
        '# %% [code] id="different-block"',
        1,
    )
    staleDependencies = source.replace('"polars==1.33.0",', '"polars==9.99.0",', 1)

    with pytest.raises(PercentFormatError, match="id does not match"):
        parsePercentDocument(staleMarker)
    with pytest.raises(PercentFormatError, match="packages do not match"):
        parsePercentDocument(staleDependencies)


def testLegacyJupyterMigrationIsStableAndIdempotent() -> None:
    legacy = json.dumps({
        "nbformat": 4,
        "nbformat_minor": 5,
        "metadata": {},
        "cells": [
            {
                "cell_type": "code",
                "id": "legacy_cell",
                "metadata": {},
                "source": ["%matplotlib inline\n", "value = 42"],
                "execution_count": 3,
                "outputs": [{"output_type": "stream", "text": "discard me"}],
            }
        ],
    })

    parsed = parseJupyterDocument(legacy, Path("legacy.ipynb"))
    canonical = writeJupyterDocument(parsed)
    reparsed = parseJupyterDocument(canonical, Path("legacy.ipynb"))

    assert parsed.blocks[0].id == "legacy_cell"
    assert parsed.blocks[0].content == "# %matplotlib inline\nvalue = 42"
    assert writeJupyterDocument(reparsed) == canonical


def testLegacyCodaroMigrationIsStableAndIdempotent() -> None:
    legacy = '''import codaro

app = codaro.App(title="Legacy")

@app.block(id="legacy_code", kind="code")
def block1():
    value = 42
    return (value,)

if __name__ == "__main__":
    app.run()
'''

    parsed = parseCodaroDocument(legacy, Path("legacy.py"))
    canonical = writeCodaroDocument(parsed)
    reparsed = parseCodaroDocument(canonical, Path("legacy.py"))

    assert parsed.blocks[0].id == "legacy_code"
    assert writeCodaroDocument(reparsed) == canonical


def testCodaroNativeRejectsBodyDriftInsteadOfSilentlyLosingMetadata() -> None:
    source = writeCodaroDocument(_document("codaro"))
    changed = source.replace("base = 40", "base = 41", 1)

    with pytest.raises(CodaroFormatError, match="body does not match"):
        parseCodaroDocument(changed)
