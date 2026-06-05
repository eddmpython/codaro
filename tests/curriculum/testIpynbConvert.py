"""H6 — jupyter(.ipynb) → CodaroDocument 변환(셀 매핑·출력 버림·magic 처리)."""
from __future__ import annotations

import json

from codaro.document.jupyterFormat import parseJupyterDocument


def _ipynb(*cells: dict) -> str:
    return json.dumps({"nbformat": 4, "nbformat_minor": 5, "metadata": {}, "cells": list(cells)})


def _code(source, outputs=None):
    return {"cell_type": "code", "source": source, "outputs": outputs or [], "execution_count": 1, "metadata": {}}


def _md(source):
    return {"cell_type": "markdown", "source": source, "metadata": {}}


def testMapsCellTypesAndDropsOutputs() -> None:
    document = parseJupyterDocument(
        _ipynb(
            _md("# Title"),
            _code(["import pandas as pd\n", "x = 1\n"], outputs=[{"output_type": "stream", "text": "noise"}]),
        )
    )
    types = [(block.type, block.content) for block in document.blocks]
    assert ("markdown", "# Title") in types
    assert ("code", "import pandas as pd\nx = 1\n") in types
    # 출력은 버려지고 source만 남는다.
    assert all("noise" not in block.content for block in document.blocks)


def testCommentsOutLineMagicAndShell() -> None:
    document = parseJupyterDocument(_ipynb(_code("%matplotlib inline\n!pip install numpy\nx = 1")))
    content = document.blocks[0].content
    assert content == "# %matplotlib inline\n# !pip install numpy\nx = 1"


def testCommentsOutCellMagicWholeCell() -> None:
    document = parseJupyterDocument(_ipynb(_code("%%sql\nSELECT * FROM t")))
    assert document.blocks[0].content == "# %%sql\n# SELECT * FROM t"


def testEmptyNotebookGetsOneCell() -> None:
    document = parseJupyterDocument(_ipynb())
    assert len(document.blocks) == 1 and document.blocks[0].type == "code"


def testSourceFormatIsIpynb() -> None:
    document = parseJupyterDocument(_ipynb(_code("x = 1")))
    assert document.metadata.sourceFormat == "ipynb"
