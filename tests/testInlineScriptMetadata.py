"""PEP 723 인라인 스크립트 의존성 파싱/직렬화/라운드트립 테스트."""
from __future__ import annotations

from codaro.document.percentFormat import (
    parseInlineScriptMetadata,
    parsePercentDocument,
    writeInlineScriptMetadata,
    writePercentDocument,
)


_SCRIPT = """# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "numpy>=1.20",
#     "pandas",
# ]
# ///

# %% [code] id=cell-1
x = 1
"""


def testParseInlineScriptMetadata() -> None:
    meta = parseInlineScriptMetadata(_SCRIPT)
    assert meta is not None
    assert meta["dependencies"] == ["numpy>=1.20", "pandas"]
    assert meta["requires-python"] == ">=3.12"


def testParseDocumentMergesInlineDependenciesIntoPackages() -> None:
    document = parsePercentDocument(_SCRIPT)
    assert document.runtime.packages == ["numpy>=1.20", "pandas"]
    # PEP723 블록은 셀로 들어오지 않는다(주석 코드 셀로 오염 X).
    assert all("/// script" not in block.content for block in document.blocks)
    assert any(block.content.strip() == "x = 1" for block in document.blocks)


def testNoInlineMetadataReturnsNone() -> None:
    assert parseInlineScriptMetadata("# %% [code] id=a\nx = 1\n") is None


def testWriteInlineScriptMetadataRoundTrips() -> None:
    block = writeInlineScriptMetadata(["numpy>=1.20", "pandas"])
    meta = parseInlineScriptMetadata(block + "\n")
    assert meta is not None and meta["dependencies"] == ["numpy>=1.20", "pandas"]


def testDocumentRoundTripPreservesPackages() -> None:
    document = parsePercentDocument(_SCRIPT)
    written = writePercentDocument(document)
    reparsed = parsePercentDocument(written)
    assert reparsed.runtime.packages == ["numpy>=1.20", "pandas"]
