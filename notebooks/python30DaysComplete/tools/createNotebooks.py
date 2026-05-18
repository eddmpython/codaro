from __future__ import annotations

import ast
import json
from pathlib import Path
from textwrap import dedent
from urllib.parse import quote

import yaml


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[3]
SOURCE_ROOT = REPO_ROOT / "study" / "python" / "30days"
COLAB_DIR = ROOT / "colab"
MARIMO_DIR = ROOT / "marimo"
REPOSITORY = "eddmpython/codaro"
BRANCH = "main"
COURSE_PATH = "notebooks/python30DaysComplete"
REVIEW_RANGES = [(1, 5), (6, 10), (11, 15), (16, 20), (21, 25), (26, 30)]
CONCEPT_LABELS: dict[str, str] = {}

OUTPUT_STEMS = {
    1: "day01Helloworld",
    2: "day02Variablestypes",
    3: "day03Operators",
    4: "day04Stringbasics",
    5: "day05Stringindexingslicing",
    6: "day06Stringmethods",
    7: "day07Listbasics",
    8: "day08Listmethods",
    9: "day09Tuples",
    10: "day10Sets",
    11: "day11Dictbasics",
    12: "day12Dictmethods",
    13: "day13Conditionals",
    14: "day14Loops",
    15: "day15Functionbasics",
    16: "day16Functionadvanced",
    17: "day17Scopeclosure",
    18: "day18Modulesimport",
    19: "day19Fileio",
    20: "day20Exceptionhandling",
    21: "day21Midreview",
    22: "day22Classbasics",
    23: "day23Classadvanced",
    24: "day24Specialmethods",
    25: "day25Propertydecorator",
    26: "day26Comprehensions",
    27: "day27Generatorsiterators",
    28: "day28Advancedsyntaxreview",
    29: "day29Algorithmpractice",
    30: "day30Finalproject",
}


def cleanMarkdown(source: str) -> str:
    text = dedent(source).strip()
    return "\n".join(line.strip() if line.strip() else "" for line in text.splitlines()).strip()


def cleanCode(source: str) -> str:
    return dedent(source).strip() + "\n"


def makeMarkdownCell(source: str) -> dict[str, object]:
    return {"cell_type": "markdown", "metadata": {}, "source": cleanMarkdown(source)}


def makeCodeCell(source: str) -> dict[str, object]:
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": cleanCode(source),
    }


def loadCurriculum() -> dict[str, object]:
    path = SOURCE_ROOT / "curriculum.json"
    return json.loads(path.read_text(encoding="utf-8"))


def setConceptLabels(curriculum: dict[str, object]) -> None:
    global CONCEPT_LABELS
    rawLabels = curriculum.get("conceptLabels", {})
    if not isinstance(rawLabels, dict):
        raise TypeError("curriculum conceptLabels must be an object")
    CONCEPT_LABELS = {str(key): str(value) for key, value in rawLabels.items()}


def conceptLabel(concept: object) -> str:
    token = str(concept)
    return CONCEPT_LABELS.get(token, token.replace("_", " "))


def formatConcepts(concepts: object) -> str:
    if not isinstance(concepts, list) or not concepts:
        return "복습"
    return ", ".join(conceptLabel(item) for item in concepts)


def loadDayContent(dayEntry: dict[str, object]) -> dict[str, object]:
    fileName = str(dayEntry["file"])
    path = SOURCE_ROOT / fileName
    content = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(content, dict):
        raise TypeError(f"Invalid YAML content: {path}")
    return content


def colabName(day: int) -> str:
    return f"{OUTPUT_STEMS[day]}.ipynb"


def marimoName(day: int) -> str:
    return f"{OUTPUT_STEMS[day]}.py"


def reviewNotebookName(startDay: int, endDay: int) -> str:
    return f"reviewDay{startDay:02d}To{endDay:02d}.ipynb"


def encodeCoursePath(relativePath: str) -> str:
    return quote(f"{COURSE_PATH}/{relativePath}", safe="/")


def colabUrl(relativePath: str) -> str:
    path = encodeCoursePath(relativePath)
    return f"https://colab.research.google.com/github/{REPOSITORY}/blob/{BRANCH}/{path}"


def molabUrl(relativePath: str) -> str:
    path = encodeCoursePath(relativePath)
    return f"https://molab.marimo.io/github/{REPOSITORY}/blob/{BRANCH}/{path}"


def codeFence(source: str) -> str:
    return f"```python\n{cleanCode(source).rstrip()}\n```"


def makeIntroMarkdown(dayEntry: dict[str, object], content: dict[str, object]) -> str:
    meta = content.get("meta", {})
    intro = content.get("intro", {})
    title = str(meta.get("title", dayEntry.get("title", "")))
    points = intro.get("points", [])
    pointLines = "\n".join(f"- {point}" for point in points)
    return cleanMarkdown(
        f"""
        # Day {int(dayEntry["day"]):02d}. {title}

        이 노트북은 `study/python/30days/{dayEntry["file"]}` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

        ## 오늘 배우는 것

        {pointLines}

        ## 학습 방법

        1. 설명을 먼저 읽습니다.
        2. 바로 아래 코드 셀을 실행합니다.
        3. 출력이 설명과 어떻게 연결되는지 한 문장으로 말합니다.
        4. 연습 셀에는 예제를 보지 않고 직접 다시 작성합니다.
        """
    )


def makeConceptPolicyMarkdown(dayEntry: dict[str, object]) -> str:
    allowed = formatConcepts(dayEntry.get("allowedConcepts", []))
    new = formatConcepts(dayEntry.get("newConcepts", []))
    forbidden = formatConcepts(dayEntry.get("forbidden", []))
    if allowed == "복습":
        allowed = "없음"
    if forbidden == "복습":
        forbidden = "없음"
    return cleanMarkdown(
        f"""
        ## 오늘의 범위

        - 오늘 새로 배우는 개념: {new}
        - 이미 써도 되는 개념: {allowed}
        - 오늘은 일부러 쓰지 않는 개념: {forbidden}

        범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
        """
    )


def appendBlockCells(cells: list[dict[str, object]], block: dict[str, object]) -> None:
    blockType = block.get("type")
    if blockType == "text":
        cells.append(makeMarkdownCell(str(block.get("content", ""))))
        return
    if blockType == "list":
        items = block.get("items", [])
        cells.append(makeMarkdownCell("\n".join(f"- {item}" for item in items)))
        return
    if blockType == "tip":
        cells.append(makeMarkdownCell(f"> **팁**\n>\n> {block.get('content', '')}"))
        return
    if blockType == "code":
        appendCodeBlock(cells, block)
        return
    if blockType == "expansion":
        appendExpansionBlock(cells, block)


def appendCodeBlock(cells: list[dict[str, object]], block: dict[str, object]) -> None:
    title = str(block.get("title", "")).strip()
    description = str(block.get("description", "")).strip()
    parts = []
    if title:
        parts.append(f"### {title}")
    if description:
        parts.append(description)
    if parts:
        cells.append(makeMarkdownCell("\n\n".join(parts)))
    cells.append(makeCodeCell(str(block.get("content", ""))))


def appendExpansionBlock(cells: list[dict[str, object]], block: dict[str, object]) -> None:
    title = str(block.get("title", "연습")).strip()
    cells.append(
        makeMarkdownCell(
            f"""
            ### 연습: {title}

            아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
            """
        )
    )
    nestedBlocks = block.get("blocks", [])
    if nestedBlocks:
        for nested in nestedBlocks:
            nestedTitle = str(nested.get("title", "단계")).strip()
            nestedDescription = str(nested.get("description", "")).strip()
            label = f"#### {nestedTitle}"
            if nestedDescription:
                label += f"\n\n{nestedDescription}"
            cells.append(makeMarkdownCell(label))
            cells.append(makeCodeCell("# 여기에 직접 작성하세요."))
        return
    cells.append(makeCodeCell("# 여기에 직접 작성하세요."))


def makeNotebook(dayEntry: dict[str, object], content: dict[str, object]) -> dict[str, object]:
    cells = [
        makeMarkdownCell(makeIntroMarkdown(dayEntry, content)),
        makeMarkdownCell(makeConceptPolicyMarkdown(dayEntry)),
    ]
    for section in content.get("sections", []):
        title = str(section.get("title", "")).strip()
        subtitle = str(section.get("subtitle", "")).strip()
        sectionLines = [f"## {title}"] if title else []
        if subtitle:
            sectionLines.append(f"*{subtitle}*")
        if sectionLines:
            cells.append(makeMarkdownCell("\n\n".join(sectionLines)))
        for block in section.get("blocks", []):
            appendBlockCells(cells, block)
    cells.append(
        makeMarkdownCell(
            """
            ## 마무리

            오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
            """
        )
    )
    return {
        "cells": cells,
        "metadata": {
            "colab": {"provenance": [], "toc_visible": True},
            "kernelspec": {"display_name": "Python 3", "name": "python3"},
            "language_info": {"name": "python"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }


def makeReviewNotebook(startDay: int, endDay: int, dayEntries: list[dict[str, object]]) -> dict[str, object]:
    rows = []
    for entry in dayEntries:
        day = int(entry["day"])
        if startDay <= day <= endDay:
            newConcepts = formatConcepts(entry.get("newConcepts", []))
            rows.append(f"| Day {day:02d} | {entry['title']} | {newConcepts} |")
    conceptRows = "\n".join(rows)
    cells = [
        makeMarkdownCell(
            f"""
            # Review Day {startDay:02d}-{endDay:02d}

            이 노트북은 진도용이 아니라 회상용입니다. 이전 Day를 다시 열기 전에, 먼저 기억나는 개념과 코드를 직접 꺼내봅니다.
            """
        ),
        makeMarkdownCell(
            f"""
            ## 복습 범위

            | Day | 제목 | 핵심 개념 |
            |---|---|---|
            {conceptRows}
            """
        ),
        makeMarkdownCell(
            """
            ## 직접 작성

            아래 셀에 이번 범위에서 기억나는 예제를 3개 이상 다시 작성하세요.
            """
        ),
        makeCodeCell("# 예제 1\n\n# 예제 2\n\n# 예제 3"),
        makeMarkdownCell(
            """
            ## 점검 질문

            - 설명을 보지 않고 가장 쉬운 예제를 다시 쓸 수 있는가?
            - 가장 헷갈린 개념 하나를 말로 설명할 수 있는가?
            - 같은 코드를 다른 값으로 바꿔도 결과를 예상할 수 있는가?
            """
        ),
    ]
    return {
        "cells": cells,
        "metadata": {
            "colab": {"provenance": [], "toc_visible": True},
            "kernelspec": {"display_name": "Python 3", "name": "python3"},
            "language_info": {"name": "python"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }


def indentCode(source: str, spaces: int = 4) -> list[str]:
    prefix = " " * spaces
    lines = cleanCode(source).rstrip("\n").splitlines()
    if not lines:
        return [f"{prefix}pass"]
    return [f"{prefix}{line}" if line else prefix.rstrip() for line in lines]


def escapeTripleQuotes(source: str) -> str:
    return source.replace('"""', '\\"\\"\\"')


def escapeMarkdownString(source: str) -> str:
    return escapeTripleQuotes(cleanMarkdown(source)).replace('""', '\\"\\"')


def appendMarimoMarkdown(chunks: list[str], source: str) -> None:
    escaped = escapeMarkdownString(source)
    chunks.extend(
        [
            "",
            "@app.cell",
            "def _(mo):",
            '    mo.md(r"""',
            *[f"    {line}" if line else "" for line in escaped.splitlines()],
            '    """)',
            "    return",
        ]
    )


def isLearnerPlaceholder(source: str) -> bool:
    lines = [line.strip() for line in source.splitlines() if line.strip()]
    return bool(lines) and all(line.startswith("#") for line in lines)


def appendMarimoCodePreview(chunks: list[str], source: str) -> None:
    appendMarimoMarkdown(chunks, codeFence(source))


def appendMarimoLearnerCode(chunks: list[str]) -> None:
    chunks.extend(
        [
            "",
            "@app.cell",
            "def _():",
            "    # 아래 두 줄을 지우고 직접 작성하세요.",
            "    _result = None",
            "    _result",
            "    return",
        ]
    )


def sourceHasGlobalStatement(source: str) -> bool:
    tree = ast.parse(source)
    return any(isinstance(node, ast.Global) for node in ast.walk(tree))


def sourceWithReturnValue(source: str) -> str:
    cleanSource = cleanCode(source).rstrip()
    tree = ast.parse(cleanSource)
    if not tree.body or not isinstance(tree.body[-1], ast.Expr):
        return cleanSource
    lastExpr = tree.body[-1]
    lines = cleanSource.splitlines()
    start = lastExpr.lineno - 1
    end = lastExpr.end_lineno or lastExpr.lineno
    lines[start:end] = [f"return {ast.unparse(lastExpr.value)}"]
    return "\n".join(lines)


def appendMarimoLocalCode(chunks: list[str], source: str, cellIndex: int) -> None:
    functionName = f"_snippet_{cellIndex:04d}"
    transformed = sourceWithReturnValue(source)
    chunks.extend(
        [
            "",
            "@app.cell(hide_code=True)",
            "def _():",
            f"    def {functionName}():",
            *indentCode(transformed, spaces=8),
            f"    {functionName}()",
            "    return",
        ]
    )


def appendMarimoRunnerCode(chunks: list[str], source: str) -> None:
    escaped = escapeTripleQuotes(cleanCode(source).rstrip())
    chunks.extend(
        [
            "",
            "@app.cell(hide_code=True)",
            "def _(_runSnippet):",
            '    _runSnippet(r"""',
            *escaped.splitlines(),
            '    """)',
            "    return",
        ]
    )


def appendMarimoCode(chunks: list[str], source: str, cellIndex: int) -> None:
    if isLearnerPlaceholder(source):
        appendMarimoLearnerCode(chunks)
        return
    appendMarimoCodePreview(chunks, source)
    if sourceHasGlobalStatement(source):
        appendMarimoRunnerCode(chunks, source)
        return
    appendMarimoLocalCode(chunks, source, cellIndex)


def notebookToMarimoPython(notebook: dict[str, object], title: str) -> str:
    appTitle = title.replace("\\", "\\\\").replace('"', '\\"')
    chunks = [
        "import marimo",
        "",
        '__generated_with = "0.23.6"',
        "",
        f'app = marimo.App(app_title="{appTitle}")',
        "",
        "",
        "@app.cell",
        "def _():",
        "    import marimo as mo",
        "    return (mo,)",
        "",
        "@app.cell(hide_code=True)",
        "def _():",
        "    import ast",
        "",
        "    def _runSnippet(source):",
        '        namespace = {"__builtins__": __builtins__}',
        '        tree = ast.parse(source, mode="exec")',
        "        if tree.body and isinstance(tree.body[-1], ast.Expr):",
        "            lastExpr = ast.Expression(tree.body.pop().value)",
        "            ast.fix_missing_locations(tree)",
        "            ast.fix_missing_locations(lastExpr)",
        '            exec(compile(tree, "<marimo-snippet>", "exec"), namespace)',
        '            return eval(compile(lastExpr, "<marimo-snippet>", "eval"), namespace)',
        "        ast.fix_missing_locations(tree)",
        '        exec(compile(tree, "<marimo-snippet>", "exec"), namespace)',
        "        return None",
        "",
        "    return (_runSnippet,)",
    ]
    for cellIndex, cell in enumerate(notebook["cells"], start=1):
        source = str(cell.get("source", ""))
        if cell.get("cell_type") == "markdown":
            appendMarimoMarkdown(chunks, source)
        elif cell.get("cell_type") == "code":
            appendMarimoCode(chunks, source, cellIndex)
    chunks.extend(["", "", 'if __name__ == "__main__":', "    app.run()", ""])
    return "\n".join(chunks)


def writeDayNotebooks(dayEntries: list[dict[str, object]]) -> None:
    COLAB_DIR.mkdir(parents=True, exist_ok=True)
    MARIMO_DIR.mkdir(parents=True, exist_ok=True)
    for dayEntry in dayEntries:
        day = int(dayEntry["day"])
        content = loadDayContent(dayEntry)
        notebook = makeNotebook(dayEntry, content)
        (COLAB_DIR / colabName(day)).write_text(json.dumps(notebook, ensure_ascii=False, indent=2), encoding="utf-8")
        title = f"Day {day:02d}. {content.get('meta', {}).get('title', dayEntry['title'])}"
        (MARIMO_DIR / marimoName(day)).write_text(notebookToMarimoPython(notebook, title), encoding="utf-8")


def writeReviewNotebooks(dayEntries: list[dict[str, object]]) -> None:
    for startDay, endDay in REVIEW_RANGES:
        notebook = makeReviewNotebook(startDay, endDay, dayEntries)
        colabPath = COLAB_DIR / reviewNotebookName(startDay, endDay)
        marimoPath = MARIMO_DIR / reviewNotebookName(startDay, endDay).replace(".ipynb", ".py")
        colabPath.write_text(json.dumps(notebook, ensure_ascii=False, indent=2), encoding="utf-8")
        marimoPath.write_text(
            notebookToMarimoPython(notebook, f"Review Day {startDay:02d}-{endDay:02d}"), encoding="utf-8"
        )


def writeManifest(dayEntries: list[dict[str, object]]) -> None:
    reviews = [
        {
            "range": f"Day {startDay:02d}-{endDay:02d}",
            "colab": f"colab/{reviewNotebookName(startDay, endDay)}",
            "marimo": f"marimo/{reviewNotebookName(startDay, endDay).replace('.ipynb', '.py')}",
        }
        for startDay, endDay in REVIEW_RANGES
    ]
    manifest = {
        "title": "Python 30일 완성",
        "source": "study/python/30days/curriculum.json",
        "description": "study/python/30days YAML을 원본으로 생성한 Colab 및 marimo 학습 노트북",
        "days": [
            {
                "day": int(entry["day"]),
                "title": entry["title"],
                "sourceYaml": f"study/python/30days/{entry['file']}",
                "allowedConcepts": entry.get("allowedConcepts", []),
                "allowedConceptLabels": [
                    conceptLabel(item) for item in entry.get("allowedConcepts", []) if isinstance(item, str)
                ],
                "newConcepts": entry.get("newConcepts", []),
                "newConceptLabels": [
                    conceptLabel(item) for item in entry.get("newConcepts", []) if isinstance(item, str)
                ],
                "forbidden": entry.get("forbidden", []),
                "forbiddenLabels": [conceptLabel(item) for item in entry.get("forbidden", []) if isinstance(item, str)],
                "colab": f"colab/{colabName(int(entry['day']))}",
                "marimo": f"marimo/{marimoName(int(entry['day']))}",
            }
            for entry in dayEntries
        ],
        "reviews": reviews,
    }
    (ROOT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def writeReadme(dayEntries: list[dict[str, object]]) -> None:
    rows = []
    for entry in dayEntries:
        day = int(entry["day"])
        newConcepts = formatConcepts(entry.get("newConcepts", []))
        rows.append(
            f"| {day:02d} | {entry['title']} | {newConcepts} | "
            f"[Colab 열기]({colabUrl('colab/' + colabName(day))}) | "
            f"[molab 열기]({molabUrl('marimo/' + marimoName(day))}) |"
        )
    reviewRows = []
    for startDay, endDay in REVIEW_RANGES:
        reviewRows.append(
            f"| Day {startDay:02d}-{endDay:02d} | 누적 복습 | "
            f"[Colab 열기]({colabUrl('colab/' + reviewNotebookName(startDay, endDay))}) | "
            f"[molab 열기]({molabUrl('marimo/' + reviewNotebookName(startDay, endDay).replace('.ipynb', '.py'))}) |"
        )
    content = f"""
    # Python 30일 완성

    이 폴더의 노트북은 `study/python/30days` YAML 커리큘럼을 원본으로 생성한 배포용 산출물입니다. 노트북 안에는 원본 YAML의 설명, 예제 코드, 연습 미션이 순서대로 들어 있습니다.

    [![Open Day 01 in Colab](https://colab.research.google.com/assets/colab-badge.svg)]({colabUrl("colab/day01Helloworld.ipynb")})
    [![Open Day 01 in molab](https://img.shields.io/badge/Day_01-open_in_molab-ff5a5f)]({molabUrl("marimo/day01Helloworld.py")})

    ## 학습 방식

    1. 설명을 읽고 바로 아래 예제 코드를 실행합니다.
    2. 출력이 왜 그렇게 나오는지 말로 설명합니다.
    3. 연습 셀은 비워져 있으므로 직접 다시 작성합니다.
    4. 다음 Day로 넘어가기 전에 같은 예제를 다른 값으로 한 번 바꿔봅니다.

    ## 전체 Day

    | Day | 제목 | 새 개념 | Colab | marimo |
    |---|---|---|---|---|
    {chr(10).join(rows)}

    ## 리뷰

    | 범위 | 목적 | Colab | marimo |
    |---|---|---|---|
    {chr(10).join(reviewRows)}
    """
    (ROOT / "readme.md").write_text(cleanMarkdown(content) + "\n", encoding="utf-8")


def writeCourseGuide(dayEntries: list[dict[str, object]]) -> None:
    dayRows = []
    for entry in dayEntries:
        day = int(entry["day"])
        forbidden = formatConcepts(entry.get("forbidden", []))
        if forbidden == "복습":
            forbidden = "없음"
        dayRows.append(f"| {day:02d} | {entry['title']} | `{entry['file']}` | {forbidden} |")
    content = f"""
    # Python 30일 완성 코스 가이드

    ## 원본과 산출물

    - 원본: `study/python/30days/curriculum.json` 및 Day별 YAML
    - 산출물: `notebooks/python30DaysComplete/colab`, `notebooks/python30DaysComplete/marimo`
    - 생성기: `notebooks/python30DaysComplete/tools/createNotebooks.py`
    - 검증기: `notebooks/python30DaysComplete/tools/validateCourse.py`

    노트북은 원본 커리큘럼을 복사한 별도 과정이 아니라, YAML에서 파생된 실행 형식입니다.

    ## 설계 기준

    - Day별 학습 범위를 SSOT의 개념 라벨로 노트북 상단에 표시한다.
    - 예제 코드는 원본 YAML의 `code` 블록을 그대로 사용한다.
    - 연습 미션은 원본 YAML의 `expansion` 블록에서 오며, 노트북에서는 학습자가 직접 작성하도록 빈 셀로 둔다.
    - 초보자에게 불필요한 채점형 장치나 숨은 예상 답변 확인 흐름을 넣지 않는다.

    ## Day 목록

    | Day | 제목 | 원본 YAML | 오늘 쓰지 않는 개념 |
    |---|---|---|---|
    {chr(10).join(dayRows)}
    """
    (ROOT / "courseGuide.md").write_text(cleanMarkdown(content) + "\n", encoding="utf-8")


def main() -> None:
    curriculum = loadCurriculum()
    setConceptLabels(curriculum)
    dayEntries = list(curriculum.get("days", []))
    writeDayNotebooks(dayEntries)
    writeReviewNotebooks(dayEntries)
    writeManifest(dayEntries)
    writeReadme(dayEntries)
    writeCourseGuide(dayEntries)


if __name__ == "__main__":
    main()
