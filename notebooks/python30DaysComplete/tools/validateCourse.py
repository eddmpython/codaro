from __future__ import annotations

import ast
import contextlib
import io
import json
import logging
import os
import tempfile
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[3]
SOURCE_ROOT = REPO_ROOT / "study" / "python" / "30days"
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
LEGACY_TEXT = [
    "예상 결과 확인",
    "자동 확인",
    "값 바꿔보기",
    "오류 고쳐보기",
    "틀린 이유 적기",
    "비슷한 문제 3단계",
    "Marimo 환경",
    "Marimo에서 자동 출력",
    "Marimo로 계산",
    "assert ",
    "print() 함수",
    "유니코드(Unicode)",
    "표현식(Expression)",
]
REQUIRED_DESIGN_TEXT_KEYS = [
    "objective",
    "whyItMatters",
    "mentalModel",
    "beforeCoding",
    "duringCoding",
    "practiceFocus",
    "debugRoutine",
]
REQUIRED_DESIGN_LIST_KEYS = ["exitTicket", "commonMistakes"]
REQUIRED_NOTEBOOK_SECTIONS = [
    "## 오늘의 목표",
    "## 왜 중요한가",
    "## 생각 모델",
    "## 오늘의 학습 전략",
    "## 오늘의 범위",
    "## 완료 기준",
    "## 흔한 막힘",
]


def assertCondition(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def loadJson(path: Path) -> dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def loadNotebook(path: Path) -> dict[str, object]:
    return loadJson(path)


def readCellSource(cell: dict[str, object]) -> str:
    source = cell.get("source", "")
    if isinstance(source, list):
        return "".join(str(part) for part in source)
    return str(source)


def loadCurriculum() -> dict[str, object]:
    return loadJson(SOURCE_ROOT / "curriculum.json")


def loadYaml(path: Path) -> dict[str, object]:
    content = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(content, dict):
        raise TypeError(f"Invalid YAML content: {path}")
    return content


def validateDocs() -> None:
    for name in ["readme.md", "courseGuide.md", "manifest.json"]:
        assertCondition((ROOT / name).exists(), f"missing doc: {name}")


def collectConcepts(curriculum: dict[str, object]) -> set[str]:
    concepts: set[str] = set()
    dayEntries = curriculum.get("days", [])
    assertCondition(isinstance(dayEntries, list), "curriculum days must be a list")
    for dayEntry in dayEntries:
        assertCondition(isinstance(dayEntry, dict), "curriculum day must be an object")
        for key in ["allowedConcepts", "newConcepts", "forbidden"]:
            values = dayEntry.get(key, [])
            assertCondition(isinstance(values, list), f"{key} must be a list")
            concepts.update(str(item) for item in values)
    return concepts


def validateConceptLabels(curriculum: dict[str, object]) -> None:
    labels = curriculum.get("conceptLabels", {})
    assertCondition(isinstance(labels, dict), "curriculum conceptLabels must be an object")
    missing = sorted(concept for concept in collectConcepts(curriculum) if concept not in labels)
    assertCondition(not missing, f"missing concept labels: {missing}")
    docsText = "\n".join((ROOT / name).read_text(encoding="utf-8") for name in ["readme.md", "courseGuide.md"])
    internalConcepts = [
        concept
        for concept in collectConcepts(curriculum)
        if "_" in concept and not (concept.startswith("__") and concept.endswith("__"))
    ]
    leaked = sorted(concept for concept in internalConcepts if concept in docsText)
    assertCondition(not leaked, f"learner docs expose internal concept tokens: {leaked}")


def validatePedagogy(curriculum: dict[str, object]) -> None:
    pedagogy = curriculum.get("pedagogy", {})
    assertCondition(isinstance(pedagogy, dict), "curriculum pedagogy must be an object")
    promise = pedagogy.get("promise", "")
    assertCondition(isinstance(promise, str) and len(promise.strip()) >= 20, "pedagogy promise is too thin")
    for key in ["learningCycle", "qualityBars"]:
        values = pedagogy.get(key, [])
        assertCondition(isinstance(values, list) and len(values) >= 4, f"pedagogy {key} must have enough items")
        for value in values:
            assertCondition(isinstance(value, str) and value.strip(), f"pedagogy {key} has an empty item")


def validateLearningDesign(dayEntry: dict[str, object]) -> dict[str, object]:
    design = dayEntry.get("learningDesign", {})
    day = dayEntry.get("day", "?")
    assertCondition(isinstance(design, dict), f"day {day} learningDesign must be an object")
    for key in REQUIRED_DESIGN_TEXT_KEYS:
        value = design.get(key, "")
        assertCondition(isinstance(value, str) and len(value.strip()) >= 12, f"day {day} {key} is too thin")
    for key in REQUIRED_DESIGN_LIST_KEYS:
        values = design.get(key, [])
        assertCondition(isinstance(values, list) and len(values) >= 3, f"day {day} {key} needs at least 3 items")
        for value in values:
            assertCondition(isinstance(value, str) and value.strip(), f"day {day} {key} has an empty item")
    return design


def validateCurriculumDesign(curriculum: dict[str, object]) -> None:
    validatePedagogy(curriculum)
    dayEntries = curriculum.get("days", [])
    assertCondition(isinstance(dayEntries, list), "curriculum days must be a list")
    for dayEntry in dayEntries:
        assertCondition(isinstance(dayEntry, dict), "curriculum day must be an object")
        validateLearningDesign(dayEntry)


def validateManifest(curriculum: dict[str, object]) -> None:
    manifest = loadJson(ROOT / "manifest.json")
    assertCondition(manifest.get("source") == "study/python/30days/curriculum.json", "manifest source mismatch")
    days = manifest.get("days", [])
    assertCondition(isinstance(days, list), "manifest days must be a list")
    assertCondition(len(days) == 30, "manifest must list exactly 30 days")
    curriculumDays = curriculum.get("days", [])
    assertCondition(isinstance(curriculumDays, list), "curriculum days must be a list")
    for manifestDay, sourceDay in zip(days, curriculumDays, strict=True):
        assertCondition(manifestDay.get("day") == sourceDay.get("day"), "manifest day order mismatch")
        assertCondition(manifestDay.get("title") == sourceDay.get("title"), "manifest title mismatch")
        assertCondition(
            manifestDay.get("sourceYaml") == f"study/python/30days/{sourceDay['file']}",
            "manifest source YAML mismatch",
        )
        assertCondition((ROOT / str(manifestDay["colab"])).exists(), f"missing colab: {manifestDay['colab']}")
        assertCondition((ROOT / str(manifestDay["marimo"])).exists(), f"missing marimo: {manifestDay['marimo']}")
    reviews = manifest.get("reviews", [])
    assertCondition(isinstance(reviews, list), "manifest reviews must be a list")
    assertCondition(len(reviews) == 6, "manifest must list exactly 6 review notebooks")


def validateNoLegacyText(path: Path, text: str) -> None:
    hits = [item for item in LEGACY_TEXT if item in text]
    assertCondition(not hits, f"{path.name} contains legacy notebook text: {hits}")


def validateNotebookAgainstYaml(path: Path, sourceYaml: Path, dayEntry: dict[str, object]) -> None:
    notebook = loadNotebook(path)
    cells = notebook.get("cells", [])
    assertCondition(isinstance(cells, list), f"{path.name} cells must be a list")
    assertCondition(len(cells) >= 20, f"{path.name} has too few cells")
    yamlContent = loadYaml(sourceYaml)
    markdownText = "\n".join(readCellSource(cell) for cell in cells if cell.get("cell_type") == "markdown")
    codeText = "\n".join(readCellSource(cell) for cell in cells if cell.get("cell_type") == "code")
    design = validateLearningDesign(dayEntry)
    validateNoLegacyText(path, markdownText + "\n" + codeText)
    assertCondition(
        str(sourceYaml.relative_to(REPO_ROOT)).replace("\\", "/") in markdownText, f"{path.name} missing YAML source"
    )
    for sectionName in REQUIRED_NOTEBOOK_SECTIONS:
        assertCondition(sectionName in markdownText, f"{path.name} missing section: {sectionName}")
    for key in REQUIRED_DESIGN_TEXT_KEYS:
        assertCondition(str(design[key]) in markdownText, f"{path.name} missing learning design text: {key}")
    for key in REQUIRED_DESIGN_LIST_KEYS:
        for item in design[key]:
            assertCondition(str(item) in markdownText, f"{path.name} missing learning design item: {item}")
    codeBlockCount = countBlocks(yamlContent, "code")
    assertCondition(markdownText.count("**실행 전**") >= codeBlockCount, f"{path.name} missing pre-run prompts")
    assertCondition(markdownText.count("**실행 후**") >= codeBlockCount, f"{path.name} missing post-run prompts")
    assertCondition("**막히면**" in markdownText, f"{path.name} missing practice recovery prompt")
    for section in yamlContent.get("sections", []):
        title = str(section.get("title", "")).strip()
        if title:
            assertCondition(title in markdownText, f"{path.name} missing section title: {title}")
    validateCodeCells(path, cells)


def validateCodeCells(path: Path, cells: list[object]) -> None:
    namespace: dict[str, object] = {}
    with tempfile.TemporaryDirectory() as tempDir:
        currentDir = os.getcwd()
        os.chdir(tempDir)
        try:
            for index, rawCell in enumerate(cells):
                if not isinstance(rawCell, dict) or rawCell.get("cell_type") != "code":
                    continue
                source = readCellSource(rawCell)
                try:
                    ast.parse(source)
                except SyntaxError as exc:
                    raise AssertionError(f"{path.name} cell {index} syntax error: {exc.msg}") from exc
                try:
                    with (
                        contextlib.redirect_stdout(io.StringIO()),
                        contextlib.redirect_stderr(io.StringIO()),
                    ):
                        exec(source, namespace)
                except SAFE_EXEC_ERRORS as exc:
                    LOGGER.debug("safe execution failure in %s cell %s", path.name, index, exc_info=True)
                    raise AssertionError(
                        f"{path.name} cell {index} should run safely but raised {type(exc).__name__}: {exc}"
                    ) from exc
        finally:
            os.chdir(currentDir)


def validateReviewNotebook(path: Path) -> None:
    notebook = loadNotebook(path)
    cells = notebook.get("cells", [])
    assertCondition(isinstance(cells, list), f"{path.name} cells must be a list")
    markdownText = "\n".join(readCellSource(cell) for cell in cells if isinstance(cell, dict))
    validateNoLegacyText(path, markdownText)
    assertCondition("Review Day" in markdownText, f"{path.name} missing review title")
    validateCodeCells(path, cells)


def validateMarimoNotebook(path: Path, sourceYaml: Path | None) -> None:
    content = path.read_text(encoding="utf-8")
    validateNoLegacyText(path, content)
    requiredText = ["import marimo", "app = marimo.App", "@app.cell", "app.run()"]
    missing = [text for text in requiredText if text not in content]
    assertCondition(not missing, f"{path.name} missing marimo markers: {missing}")
    assertCondition("# %%" not in content, f"{path.name} still uses percent markers")
    assertCondition("runCell(" not in content, f"{path.name} must not wrap code in runCell strings")
    if sourceYaml is not None:
        sourceText = str(sourceYaml.relative_to(REPO_ROOT)).replace("\\", "/")
        assertCondition(sourceText in content, f"{path.name} missing YAML source")
        yamlContent = loadYaml(sourceYaml)
        codeBlockCount = countBlocks(yamlContent, "code")
        expansionCount = countBlocks(yamlContent, "expansion")
        assertCondition(content.count("```python") >= codeBlockCount, f"{path.name} missing visible code previews")
        if expansionCount:
            assertCondition(
                content.count("직접 작성하세요.") >= expansionCount,
                f"{path.name} missing editable learner cells",
            )
        assertCondition("@app.cell(hide_code=True)" in content, f"{path.name} must hide generated runner cells")
    try:
        ast.parse(content)
    except SyntaxError as exc:
        raise AssertionError(f"{path.name} syntax error: {exc.msg}") from exc


def countBlocks(yamlContent: dict[str, object], blockType: str) -> int:
    count = 0
    sections = yamlContent.get("sections", [])
    assertCondition(isinstance(sections, list), "YAML sections must be a list")
    for section in sections:
        if not isinstance(section, dict):
            continue
        blocks = section.get("blocks", [])
        if not isinstance(blocks, list):
            continue
        for block in blocks:
            if isinstance(block, dict) and block.get("type") == blockType:
                count += 1
    return count


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    curriculum = loadCurriculum()
    dayEntries = curriculum.get("days", [])
    assertCondition(isinstance(dayEntries, list), "curriculum days must be a list")
    assertCondition(len(dayEntries) == 30, "curriculum must list exactly 30 days")
    validateDocs()
    validateCurriculumDesign(curriculum)
    validateConceptLabels(curriculum)
    validateManifest(curriculum)
    for dayEntry in dayEntries:
        day = int(dayEntry["day"])
        sourceYaml = SOURCE_ROOT / str(dayEntry["file"])
        colabPath = ROOT / "manifest.json"
        manifestDays = loadJson(ROOT / "manifest.json")["days"]
        manifestDay = manifestDays[day - 1]
        colabPath = ROOT / str(manifestDay["colab"])
        marimoPath = ROOT / str(manifestDay["marimo"])
        validateNotebookAgainstYaml(colabPath, sourceYaml, dayEntry)
        validateMarimoNotebook(marimoPath, sourceYaml)
    reviewNotebooks = sorted(COLAB_DIR.glob("review*.ipynb"))
    assertCondition(len(reviewNotebooks) == 6, "notebooks directory must contain exactly 6 review notebooks")
    for path in reviewNotebooks:
        validateReviewNotebook(path)
    marimoReviews = sorted(MARIMO_DIR.glob("review*.py"))
    assertCondition(len(marimoReviews) == 6, "marimo directory must contain exactly 6 review notebooks")
    for path in marimoReviews:
        validateMarimoNotebook(path, None)
    print("course validation ok")


if __name__ == "__main__":
    main()
