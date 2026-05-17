from __future__ import annotations

import ast
import json
import logging
import os
import re
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
COLAB_DIR = ROOT / "colab"
MARIMO_DIR = ROOT / "marimo"
LOGGER = logging.getLogger(__name__)
SAFE_EXEC_ERRORS = (
    ArithmeticError,
    AssertionError,
    AttributeError,
    ImportError,
    LookupError,
    NameError,
    OSError,
    RuntimeError,
    TypeError,
    ValueError,
)
PYTHON_FENCE_RE = re.compile(r"```python\n(?P<source>[\s\S]*?)\n```")
MARIMO_CELL_RE = re.compile(r"(?P<kind>mo\.md|runCell)\(\s*r\"\"\"(?P<source>[\s\S]*?)\"\"\"\s*\)")


def loadNotebook(path: Path) -> dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def readCellSource(cell: dict[str, object]) -> str:
    source = cell.get("source", "")
    if isinstance(source, list):
        return "".join(str(part) for part in source)
    return str(source)


def assertCondition(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def validateManifest() -> None:
    manifestPath = ROOT / "manifest.json"
    assertCondition(manifestPath.exists(), "manifest.json is missing")
    manifest = json.loads(manifestPath.read_text(encoding="utf-8"))
    days = manifest.get("days", [])
    assertCondition(len(days) == 30, "manifest must list exactly 30 days")
    missing = [day["colab"] for day in days if not (ROOT / day["colab"]).exists()]
    assertCondition(not missing, f"missing notebooks: {missing}")
    missingMarimo = [day["marimo"] for day in days if not (ROOT / day["marimo"]).exists()]
    assertCondition(not missingMarimo, f"missing marimo notebooks: {missingMarimo}")
    reviews = manifest.get("reviews", [])
    assertCondition(len(reviews) == 6, "manifest must list exactly 6 review notebooks")
    missingReviews = [review["colab"] for review in reviews if not (ROOT / review["colab"]).exists()]
    assertCondition(not missingReviews, f"missing review notebooks: {missingReviews}")
    missingMarimoReviews = [review["marimo"] for review in reviews if not (ROOT / review["marimo"]).exists()]
    assertCondition(not missingMarimoReviews, f"missing marimo review notebooks: {missingMarimoReviews}")


def validateNotebookStructure(path: Path) -> None:
    notebook = loadNotebook(path)
    cells = notebook.get("cells", [])
    assertCondition(len(cells) >= 30, f"{path.name} has too few cells")
    markdownText = "\n".join(readCellSource(cell) for cell in cells if cell.get("cell_type") == "markdown")
    requiredSections = [
        "시작 전 떠올리기",
        "코드가 실행되는 순서",
        "값 바꿔보기",
        "오류 고쳐보기",
        "틀린 이유 적기",
        "비슷한 문제 풀기",
        "자동 확인",
        "30일 프로젝트",
        "마무리 체크",
    ]
    missingSections = [section for section in requiredSections if section not in markdownText]
    assertCondition(not missingSections, f"{path.name} missing sections: {missingSections}")


def validateCodeSyntax(path: Path) -> None:
    notebook = loadNotebook(path)
    for index, cell in enumerate(notebook.get("cells", [])):
        if cell.get("cell_type") == "code":
            source = readCellSource(cell)
            assertCondition("..." not in source, f"{path.name} cell {index} still has placeholder ellipsis")
            try:
                ast.parse(source)
            except SyntaxError as exc:
                raise AssertionError(f"{path.name} cell {index} syntax error: {exc.msg}") from exc


def shouldRunCell(previousMarkdown: str, code: str) -> bool:
    return True


def validateSafeExecution(path: Path) -> None:
    notebook = loadNotebook(path)
    previousMarkdown = ""
    namespace: dict[str, object] = {}
    with tempfile.TemporaryDirectory() as tempDir:
        currentDir = os.getcwd()
        os.chdir(tempDir)
        try:
            for index, cell in enumerate(notebook.get("cells", [])):
                cellType = cell.get("cell_type")
                source = readCellSource(cell)
                if cellType == "markdown":
                    previousMarkdown = source
                elif cellType == "code" and shouldRunCell(previousMarkdown, source):
                    try:
                        exec(source, namespace)
                    except SAFE_EXEC_ERRORS as exc:
                        LOGGER.debug("safe execution failure in %s cell %s", path.name, index, exc_info=True)
                        raise AssertionError(
                            f"{path.name} cell {index} should run safely but raised {type(exc).__name__}: {exc}"
                        ) from exc
        finally:
            os.chdir(currentDir)


def validateMarkdownPythonBlocks(path: Path) -> None:
    notebook = loadNotebook(path)
    for cellIndex, cell in enumerate(notebook.get("cells", [])):
        if cell.get("cell_type") != "markdown":
            continue
        markdown = readCellSource(cell)
        for blockIndex, match in enumerate(PYTHON_FENCE_RE.finditer(markdown)):
            source = match.group("source").strip()
            if not source:
                continue
            try:
                ast.parse(source)
            except SyntaxError as exc:
                raise AssertionError(
                    f"{path.name} markdown cell {cellIndex} python block {blockIndex} syntax error: {exc.msg}"
                ) from exc
            with tempfile.TemporaryDirectory() as tempDir:
                currentDir = os.getcwd()
                os.chdir(tempDir)
                try:
                    exec(source, {})
                except SAFE_EXEC_ERRORS as exc:
                    raise AssertionError(
                        f"{path.name} markdown cell {cellIndex} python block {blockIndex} "
                        f"raised {type(exc).__name__}: {exc}"
                    ) from exc
                finally:
                    os.chdir(currentDir)


def validateDocs() -> None:
    requiredDocs = [
        "readme.md",
        "courseGuide.md",
        "progressTracker.csv",
    ]
    missing = [name for name in requiredDocs if not (ROOT / name).exists()]
    assertCondition(not missing, f"missing docs: {missing}")


def validateMarimoNotebook(path: Path) -> None:
    content = path.read_text(encoding="utf-8")
    requiredText = ["import marimo", "app = marimo.App", "@app.cell", "app.run()"]
    if path.name.startswith("day"):
        requiredText.append("자동 확인")
    else:
        requiredText.append("리뷰 프로젝트")
    missing = [text for text in requiredText if text not in content]
    assertCondition(not missing, f"{path.name} missing marimo markers: {missing}")
    assertCondition("# %%" not in content, f"{path.name} still uses percent markers")
    cellCount = content.count("@app.cell")
    minimumCells = 20 if path.name.startswith("day") else 5
    assertCondition(cellCount >= minimumCells, f"{path.name} has too few marimo cells")
    try:
        ast.parse(content)
    except SyntaxError as exc:
        raise AssertionError(f"{path.name} syntax error: {exc.msg}") from exc
    validateMarimoEmbeddedCode(path, content)


def validateMarimoEmbeddedCode(path: Path, content: str) -> None:
    previousMarkdown = ""
    namespace: dict[str, object] = {}
    with tempfile.TemporaryDirectory() as tempDir:
        currentDir = os.getcwd()
        os.chdir(tempDir)
        try:
            for index, match in enumerate(MARIMO_CELL_RE.finditer(content)):
                source = match.group("source")
                if match.group("kind") == "mo.md":
                    previousMarkdown = source
                    continue
                try:
                    ast.parse(source)
                except SyntaxError as exc:
                    raise AssertionError(f"{path.name} embedded cell {index} syntax error: {exc.msg}") from exc
                if shouldRunCell(previousMarkdown, source):
                    try:
                        exec(source, namespace)
                    except SAFE_EXEC_ERRORS as exc:
                        raise AssertionError(
                            f"{path.name} embedded cell {index} should run safely but raised "
                            f"{type(exc).__name__}: {exc}"
                        ) from exc
        finally:
            os.chdir(currentDir)


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    validateDocs()
    validateManifest()
    notebooks = sorted(COLAB_DIR.glob("day*.ipynb"))
    assertCondition(len(notebooks) == 30, "notebooks directory must contain exactly 30 day notebooks")
    for path in notebooks:
        validateNotebookStructure(path)
        validateCodeSyntax(path)
        validateMarkdownPythonBlocks(path)
        validateSafeExecution(path)
    reviewNotebooks = sorted(COLAB_DIR.glob("review*.ipynb"))
    assertCondition(len(reviewNotebooks) == 6, "notebooks directory must contain exactly 6 review notebooks")
    for path in reviewNotebooks:
        validateCodeSyntax(path)
        validateMarkdownPythonBlocks(path)
        validateSafeExecution(path)
    marimoNotebooks = sorted(MARIMO_DIR.glob("day*.py"))
    assertCondition(len(marimoNotebooks) == 30, "marimo directory must contain exactly 30 day notebooks")
    for path in marimoNotebooks:
        validateMarimoNotebook(path)
    marimoReviews = sorted(MARIMO_DIR.glob("review*.py"))
    assertCondition(len(marimoReviews) == 6, "marimo directory must contain exactly 6 review notebooks")
    for path in marimoReviews:
        validateMarimoNotebook(path)
    print("course validation ok")


if __name__ == "__main__":
    main()
