from __future__ import annotations

import re
from typing import Any
import uuid

from ..document.models import (
    AppConfig,
    BlockConfig,
    CodaroDocument,
    DocumentMetadata,
    GuideConfig,
    PredictConfig,
    RuntimeConfig,
)
from .sectionContract import (
    LearningPredictContract,
    LearningSectionContract,
    lessonContractFromYaml,
    sectionHasStructuredFields,
)


TITLE_TYPES = {"mainHeader", "sectionHeader", "sectionTitle"}
HERO_TYPES = {"hero", "localWorkbench", "tiobeIndex"}
CARD_TYPES = {"featureCards", "choiceCards", "resourceCards", "threeColumnCards", "stepCard", "practiceCard"}
COMPARE_TYPES = {"compare", "fullWidthComparison"}
MEDIA_TYPES = {"image", "video", "youtube", "videoCarousel", "pdf", "MIME"}
LINK_TYPES = {"link", "links", "linkButtons"}
CALLOUT_TYPES = {"tip", "tipCard", "note", "info", "warning", "codeDescription", "danger", "success", "example", "summary"}
CONCEPT_ROW_TYPES = {"conceptRow"}


def yamlToDocument(content: dict, category: str, contentId: str) -> tuple[CodaroDocument, dict[str, str]]:
    meta = _mapValue(content.get("meta"))
    intro = _mapValue(content.get("intro"))
    sections = _arrayOfMaps(content.get("sections"))

    title = _textValue(meta.get("title")) or contentId
    lessonContract = lessonContractFromYaml(content, fallbackTitle=title)
    contractPayload = lessonContract.model_dump(mode="json")
    title = lessonContract.meta.title or title
    displayIntro = intro or {
        "description": lessonContract.intro.direction,
        "points": lessonContract.intro.benefits,
    }
    blocks: list[BlockConfig] = [
        _markdownBlock(
            _buildIntroMarkdown(title, displayIntro),
            displayKind="hero",
            role="title",
            sourceType="intro",
            title=title,
            payload={"title": title, **displayIntro, "learningContract": contractPayload},
        )
    ]
    solutions: dict[str, str] = {}

    for index, section in enumerate(sections):
        sectionContract = lessonContract.sections[index] if index < len(lessonContract.sections) else None
        sectionTitle = _textValue(section.get("title")) or (sectionContract.title if sectionContract else "")
        sectionSubtitle = _textValue(section.get("subtitle")) or (sectionContract.subtitle if sectionContract else "")
        sourceBlocks = _arrayOfMaps(section.get("blocks"))

        if sectionTitle or sectionSubtitle or sectionHasStructuredFields(section):
            blocks.append(
                _markdownBlock(
                    "\n\n".join(item for item in [f"## {sectionTitle}" if sectionTitle else "", sectionSubtitle] if item),
                    displayKind="title",
                    role="title",
                    sourceType="section",
                    title=sectionTitle or sectionSubtitle,
                    payload={
                        "title": sectionTitle,
                        "subtitle": sectionSubtitle,
                        "id": section.get("id"),
                        "sectionContract": sectionContract.model_dump(mode="json") if sectionContract else None,
                        "sectionContractGaps": sectionContract.contractGaps if sectionContract else [],
                    },
                )
            )

        if sectionContract and sectionHasStructuredFields(section):
            blocks.extend(_convertStructuredSection(sectionContract, solutions))

        for block in sourceBlocks:
            blocks.extend(_convertBlock(block, solutions))

    if not blocks:
        blocks.append(_codeBlock("", role="exercise", sourceType="empty", title="Python cell"))

    return (
        CodaroDocument(
            id=f"doc-{uuid.uuid4().hex[:10]}",
            title=title,
            blocks=blocks,
            metadata=DocumentMetadata(sourceFormat="curriculum", tags=[category, contentId]),
            runtime=RuntimeConfig(defaultEngine="local", reactiveMode="hybrid", packages=lessonContract.meta.packages),
            app=AppConfig(title=title, layout="learning", hideCode=False),
        ),
        solutions,
    )


def _convertStructuredSection(section: LearningSectionContract, solutions: dict[str, str]) -> list[BlockConfig]:
    result: list[BlockConfig] = []
    explanation = _structuredExplanationMarkdown(section)
    if explanation:
        result.append(
            _markdownBlock(
                explanation,
                displayKind="prose",
                role="learning",
                sourceType="sectionContract:explanation",
                title=section.title,
                description=section.goal or section.explanation,
                payload={"sectionContract": section.model_dump(mode="json")},
            )
        )

    if section.snippet:
        result.append(
            _codeBlock(
                _normalizeCode(section.snippet),
                role="snippet",
                executionKind="python",
                sourceType="sectionContract:snippet",
                title=f"{section.title} 스니펫" if section.title else "예제 스니펫",
                description=section.goal,
            )
        )

    exercise = section.exercise
    if _hasStructuredExercise(section):
        starterCode = _normalizeCode(exercise.starterCode)
        solutionCode = _normalizeCode(exercise.solution)
        checkConfig = _structuredCheckConfig(
            checkSource=exercise.check or section.check,
            solutionCode=solutionCode,
            starterCode=starterCode,
        )
        exerciseCell = _codeBlock(
            starterCode,
            role="exercise",
            executionKind="python",
            sourceType="sectionContract:exercise",
            title=f"{section.title} 실습" if section.title else "실습 셀",
            description=exercise.prompt or section.goal,
            guide=GuideConfig(
                exerciseType="sectionPractice",
                hints=exercise.hints or section.tips,
                checkConfig=checkConfig,
                difficulty=exercise.difficulty or "easy",
                solution=solutionCode,
                description=exercise.prompt or section.goal or "직접 코드를 입력하고 실행하세요.",
                predict=_predictConfig(exercise.predict),
            ),
        )
        result.append(exerciseCell)
        if solutionCode:
            solutions[exerciseCell.id] = solutionCode

    # 검증 기준을 학습자용 카드로 덤프하지 않는다 — check 설정(noError/resultCheck)은 내부 채점
    # 메타이지 학습 콘텐츠가 아니다. 채점은 exercise 셀의 checkConfig가 담당하고(위), 학습자는
    # "검증" 버튼 결과(CheckResultPanel)로 피드백을 받는다. 성공 조건이 필요하면 작성자가
    # exercise.prompt/goal에 학습자 언어로 적는다(자동 생성 jargon 금지).
    return result


def _structuredExplanationMarkdown(section: LearningSectionContract) -> str:
    parts = [
        _labeledMarkdown("이번 섹션에서 공부할 것", section.goal),
        _labeledMarkdown("왜 유용한지", section.why),
        _labeledMarkdown("상세 설명", section.explanation),
        _labeledMarkdown("팁", "\n".join(f"- {tip}" for tip in section.tips)),
    ]
    return "\n\n".join(part for part in parts if part)


def _labeledMarkdown(label: str, content: str) -> str:
    return f"### {label}\n{content}" if content else ""


def _hasStructuredExercise(section: LearningSectionContract) -> bool:
    exercise = section.exercise
    return any([
        exercise.prompt,
        exercise.starterCode,
        exercise.solution,
        bool(exercise.check),
        bool(exercise.hints),
    ])


def _convertBlock(block: dict[str, Any], solutions: dict[str, str], parentRole: str | None = None) -> list[BlockConfig]:
    sourceType = _normalizeSourceType(_textValue(block.get("type")) or "text")
    title = _textValue(block.get("title"))
    subtitle = _textValue(block.get("subtitle"))
    description = _textValue(block.get("description"))
    content = _blockContent(block)
    roleFromParent = "exercise" if parentRole == "exercise" else None

    if sourceType in TITLE_TYPES:
        return [
            _markdownBlock(
                "\n\n".join(item for item in [f"## {title}" if title else "", subtitle, description, content] if item),
                displayKind="title",
                role="title",
                sourceType=sourceType,
                title=title or subtitle,
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType in HERO_TYPES:
        if sourceType == "localWorkbench":
            title = title or "Codaro Local Workbench"
            content = content or "Run the adjacent Python cells with the local Codaro kernel."
        return [
            _markdownBlock(
                "\n\n".join(item for item in [f"## {title}" if title else "", subtitle, description, content, _pointLines(block.get("points"))] if item),
                displayKind="hero",
                role="visual",
                sourceType=sourceType,
                title=title or subtitle or sourceType,
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType in CARD_TYPES:
        cards = _firstMaps(block, "cards", "items", "resources", "tips", "steps")
        displayKind = "practice" if sourceType in {"practiceCard", "stepCard"} else ("resource" if sourceType == "resourceCards" else "cardGrid")
        role = "exercise" if displayKind == "practice" else ("explanation" if displayKind == "resource" else "visual")
        return [
            _markdownBlock(
                _formatCardList(cards, title or _blockTypeLabel(sourceType), intro="\n\n".join(item for item in [subtitle, description, content] if item)),
                displayKind=displayKind,
                role=role,
                sourceType=sourceType,
                title=title or _blockTypeLabel(sourceType),
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType in COMPARE_TYPES:
        cards = _arrayOfMaps(block.get("cards"))
        if cards:
            content = _formatCardList(cards, title or _blockTypeLabel(sourceType), intro=subtitle or description)
        else:
            content = _formatCompare(block, title or "Compare")
        return [
            _markdownBlock(
                content,
                displayKind="comparison",
                role="visual",
                sourceType=sourceType,
                title=title or "Compare",
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType == "table":
        return [
            _markdownBlock(
                _formatTable(block, title or "Table"),
                displayKind="table",
                role="visual",
                sourceType=sourceType,
                title=title or "Table",
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType in MEDIA_TYPES:
        src = _textValue(
            block.get("src")
            or block.get("url")
            or block.get("href")
            or block.get("imageUrl")
            or block.get("videoUrl")
            or block.get("buttonLink")
            or block.get("youtubeId")
            or block.get("videoId")
            or block.get("youtube")
        )
        items = _firstMaps(block, "items", "videos")
        if not any([src, items, title, subtitle, description]):
            return []
        return [
            _markdownBlock(
                _formatMedia(block, sourceType, title, subtitle, description),
                displayKind="media",
                role="visual",
                sourceType=sourceType,
                title=title or subtitle or _blockTypeLabel(sourceType),
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType in LINK_TYPES:
        links = _linksFromBlock(block, sourceType, title, description)
        return [
            _markdownBlock(
                _formatLinks(links, title or "Resources"),
                displayKind="resource",
                role="explanation",
                sourceType=sourceType,
                title=title or "Resources",
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType in CALLOUT_TYPES:
        calloutTitle = title or _noteTitle(block, sourceType)
        return [
            _markdownBlock(
                "\n\n".join(item for item in [f"### {calloutTitle}", subtitle, description, _formatCodeDescription(content) if sourceType == "codeDescription" else content] if item),
                displayKind="callout",
                role="check" if sourceType in {"warning", "danger"} else "explanation",
                sourceType=sourceType,
                title=calloutTitle,
                description=description,
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType == "quiz":
        question = _textValue(block.get("question")) or title or "Quiz"
        options = _arrayOfText(block.get("options") or block.get("choices"))
        return [
            _markdownBlock(
                "\n\n".join([f"### {question}", *[f"{index + 1}. {option}" for index, option in enumerate(options)]]),
                displayKind="quiz",
                role="check",
                sourceType=sourceType,
                title=question,
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType == "expansion":
        return _convertExpansionBlock(block, solutions)

    if sourceType == "code":
        return _convertCodeBlock(block, roleFromParent or "snippet", sourceType)

    if sourceType == "list":
        return [
            _markdownBlock(
                _formatList(block),
                displayKind="prose",
                role=roleFromParent or "learning",
                sourceType=sourceType,
                title=title or "List",
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType == "centerText":
        return [
            _markdownBlock(
                "\n\n".join(item for item in [f"## {title}" if title else "", subtitle, description, content] if item),
                displayKind="centerText",
                role="learning",
                sourceType=sourceType,
                title=title or _firstSentence(content or description or subtitle),
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType in CONCEPT_ROW_TYPES:
        rows = _firstMaps(block, "rows", "items", "cards")
        return [
            _markdownBlock(
                _formatConceptRows(rows, title or _blockTypeLabel(sourceType), intro=subtitle or description),
                displayKind="conceptRow",
                role="visual",
                sourceType=sourceType,
                title=title or _blockTypeLabel(sourceType),
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType == "doDont":
        return [
            _markdownBlock(
                _formatDoDont(block, title or "권장 vs 지양"),
                displayKind="doDont",
                role="check",
                sourceType=sourceType,
                title=title or "권장 vs 지양",
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType == "definition":
        rows = _firstMaps(block, "items", "rows", "terms") or ([block] if _textValue(block.get("term")) else [])
        return [
            _markdownBlock(
                _formatDefinitions(rows, title or "정의", intro=subtitle or description),
                displayKind="definition",
                role="explanation",
                sourceType=sourceType,
                title=title or "정의",
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType == "misconception":
        rows = _firstMaps(block, "items", "rows")
        return [
            _markdownBlock(
                _formatMisconceptions(rows, title or "흔한 오해", intro=subtitle or description),
                displayKind="misconception",
                role="check",
                sourceType=sourceType,
                title=title or "흔한 오해",
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType == "timeline":
        rows = _firstMaps(block, "items", "steps", "events")
        return [
            _markdownBlock(
                _formatTimeline(rows, title or "흐름", intro=subtitle or description),
                displayKind="timeline",
                role="visual",
                sourceType=sourceType,
                title=title or "흐름",
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType == "stat":
        rows = _firstMaps(block, "items", "stats", "metrics")
        return [
            _markdownBlock(
                _formatStats(rows, title or "지표", intro=subtitle or description),
                displayKind="stat",
                role="visual",
                sourceType=sourceType,
                title=title or "지표",
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType == "codeCompare":
        return [
            _markdownBlock(
                _formatCodeCompare(block, title or "코드 비교"),
                displayKind="codeCompare",
                role="visual",
                sourceType=sourceType,
                title=title or "코드 비교",
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType == "anatomy":
        return [
            _markdownBlock(
                _formatAnatomy(block, title or "구조 분해", intro=subtitle or description),
                displayKind="anatomy",
                role="visual",
                sourceType=sourceType,
                title=title or "구조 분해",
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType == "terminal":
        return [
            _markdownBlock(
                _formatTerminal(block, title or "터미널", intro=subtitle or description),
                displayKind="terminal",
                role="visual",
                sourceType=sourceType,
                title=title or "터미널",
                payload=_payload(block, sourceType),
            )
        ]

    if sourceType in {"annotatedCode", "codeWalkthrough"}:
        return [
            _markdownBlock(
                _formatAnnotatedCode(block, title or "코드 해설", intro=subtitle or description),
                displayKind="annotatedCode",
                role="visual",
                sourceType=sourceType,
                title=title or "코드 해설",
                payload=_payload(block, sourceType),
            )
        ]

    return [
        _markdownBlock(
            "\n\n".join(item for item in [f"### {title}" if title else "", subtitle, description, content or _textFromUnknownBlock(block)] if item),
            displayKind="prose",
            role=roleFromParent or "learning",
            sourceType=sourceType,
            title=title or _firstSentence(content or description or subtitle or sourceType),
            payload=_payload(block, sourceType),
        )
    ]


def _convertCodeBlock(block: dict[str, Any], role: str, sourceType: str) -> list[BlockConfig]:
    result: list[BlockConfig] = []
    title = _textValue(block.get("title"))
    description = _textValue(block.get("description"))

    if title or description:
        result.append(
            _markdownBlock(
                "\n\n".join(item for item in [f"### {title}" if title else "", description] if item),
                displayKind="prose",
                role="explanation" if role != "exercise" else "exercise",
                sourceType=f"{sourceType}:description",
                title=title or description,
                description=description,
            )
        )

    code = _normalizeCode(_textValue(block.get("content")))
    expectedOutput = _textValue(block.get("output"))
    codeCell = _codeBlock(
        code,
        role=role,
        executionKind=_executionKindFromLanguage(_textValue(block.get("language"))),
        sourceType=sourceType,
        title=title or _firstCodeLine(code),
        description=description,
    )
    if expectedOutput:
        codeCell = codeCell.model_copy(
            update={
                "execution": codeCell.execution.model_copy(
                    update={
                        "lastOutput": expectedOutput.strip(),
                        "status": "idle",
                    }
                )
            }
        )
    result.append(codeCell)
    return result


def _convertExpansionBlock(block: dict[str, Any], solutions: dict[str, str]) -> list[BlockConfig]:
    title = _textValue(block.get("title")) or "Practice"
    subtitle = _textValue(block.get("subtitle"))
    description = _textValue(block.get("description"))
    content = _blockContent(block)
    result = [
        _markdownBlock(
            "\n\n".join(item for item in [f"### {title}", subtitle, description, content] if item),
            displayKind="practice",
            role="exercise",
            sourceType="expansion",
            title=title,
            description=description,
            payload=_payload(block, "expansion"),
        )
    ]

    for nested in _arrayOfMaps(block.get("blocks")):
        nestedSourceType = _normalizeSourceType(_textValue(nested.get("type")) or "text")
        if nestedSourceType == "code":
            result.append(_convertExpansionSolutionCodeBlock(
                nested,
                solutions,
                expansionTitle=title,
                expansionDescription=description or content,
            ))
            continue
        result.extend(_convertBlock(nested, solutions, parentRole="exercise"))

    solutionCode = _normalizeCode(_textValue(block.get("code")))
    if solutionCode or not _arrayOfMaps(block.get("blocks")):
        exerciseCell = _codeBlock(
            "",
            role="exercise",
            executionKind="python",
            sourceType="expansion",
            title=title,
            description=description or content,
            guide=GuideConfig(
                exerciseType=_exerciseTypeFromTitle(title),
                hints=_arrayOfText(block.get("hints")),
                checkConfig=_checkConfig(block),
                difficulty=_difficultyFromTitle(title),
                solution=solutionCode,
                description=description or content or title,
            ),
        )
        result.append(exerciseCell)
        if solutionCode:
            solutions[exerciseCell.id] = solutionCode

    return result


def _convertExpansionSolutionCodeBlock(
    block: dict[str, Any],
    solutions: dict[str, str],
    *,
    expansionTitle: str,
    expansionDescription: str,
) -> BlockConfig:
    title = _textValue(block.get("title")) or expansionTitle
    description = _textValue(block.get("description")) or expansionDescription or title
    solutionCode = _normalizeCode(_textValue(block.get("content") or block.get("code")))
    exerciseCell = _codeBlock(
        "",
        role="exercise",
        executionKind=_executionKindFromLanguage(_textValue(block.get("language"))),
        sourceType="expansion",
        title=title,
        description=description,
        guide=GuideConfig(
            exerciseType=_exerciseTypeFromTitle(expansionTitle or title),
            hints=_arrayOfText(block.get("hints")),
            checkConfig=_checkConfig(block),
            difficulty=_difficultyFromTitle(expansionTitle or title),
            solution=solutionCode,
            description=description,
        ),
    )
    if solutionCode:
        solutions[exerciseCell.id] = solutionCode
    return exerciseCell


def _buildIntroMarkdown(title: str, intro: dict[str, Any]) -> str:
    emoji = _textValue(intro.get("emoji"))
    goal = _textValue(intro.get("goal") or intro.get("direction"))
    description = _textValue(intro.get("description"))
    points = _arrayOfText(intro.get("points") or intro.get("benefits"))
    heading = f"# {emoji} {title}" if emoji else f"# {title}"
    lines = [heading, goal, description, "\n".join(f"- {point}" for point in points)]
    return "\n\n".join(item for item in lines if item)


def _markdownBlock(
    content: str,
    *,
    displayKind: str = "prose",
    role: str = "explanation",
    sourceType: str = "text",
    title: str | None = None,
    description: str | None = None,
    payload: Any = None,
) -> BlockConfig:
    return BlockConfig(
        id=f"block-{uuid.uuid4().hex[:8]}",
        type="markdown",
        content=content,
        role=role,
        displayKind=displayKind,
        sourceType=sourceType,
        payload=payload,
        title=title,
        description=description,
    )


def _codeBlock(
    content: str,
    *,
    role: str,
    executionKind: str = "python",
    sourceType: str = "code",
    title: str | None = None,
    description: str | None = None,
    guide: GuideConfig | None = None,
) -> BlockConfig:
    return BlockConfig(
        id=f"block-{uuid.uuid4().hex[:8]}",
        type="code",
        content=content,
        role=role,
        executionKind=executionKind,
        displayKind="code",
        sourceType=sourceType,
        title=title,
        description=description,
        guide=guide,
    )


def _normalizeSourceType(sourceType: str) -> str:
    return sourceType


def _payload(block: dict[str, Any], sourceType: str) -> dict[str, Any]:
    payload = dict(block)
    payload["type"] = sourceType
    return payload


def _blockContent(block: dict[str, Any]) -> str:
    for key in ("content", "htmlContent", "description"):
        value = _textValue(block.get(key))
        if value:
            return value
    return ""


def _formatList(block: dict[str, Any]) -> str:
    style = _textValue(block.get("style")) or "bullet"
    items = _arrayOfText(block.get("items"))
    lines: list[str] = []
    for index, item in enumerate(items, start=1):
        if style == "number":
            lines.append(f"{index}. {item}")
        elif style == "check":
            lines.append(f"- [ ] {item}")
        else:
            lines.append(f"- {item}")
    return "\n".join(lines)


def _formatTable(block: dict[str, Any], fallbackTitle: str) -> str:
    headers = _arrayOfText(block.get("headers"))
    rawRows = block.get("rows") or block.get("items") or block.get("data")
    rows = rawRows if isinstance(rawRows, list) else []
    lines: list[str] = [f"### {fallbackTitle}"] if fallbackTitle else []

    if headers:
        lines.append("| " + " | ".join(headers) + " |")
        lines.append("| " + " | ".join("---" for _ in headers) + " |")
        for row in rows:
            if isinstance(row, list):
                lines.append("| " + " | ".join(_textValue(cell) for cell in row) + " |")
            elif isinstance(row, dict):
                lines.append("| " + " | ".join(_textValue(row.get(header)) for header in headers) + " |")
        return "\n".join(lines)

    rowMaps = _arrayOfMaps(rows)
    if not rowMaps:
        return "\n".join(lines)
    columns = list(dict.fromkeys(column for row in rowMaps for column in row.keys()))
    lines.append("| " + " | ".join(columns) + " |")
    lines.append("| " + " | ".join("---" for _ in columns) + " |")
    for row in rowMaps:
        lines.append("| " + " | ".join(_textValue(row.get(column)) for column in columns) + " |")
    return "\n".join(lines)


def _formatCardList(cards: list[dict[str, Any]], fallbackTitle: str, *, intro: str = "") -> str:
    lines = [f"### {fallbackTitle}"]
    if intro:
        lines.append(intro)
    for card in cards:
        heading = " ".join(item for item in [_textValue(card.get("emoji") or card.get("icon")), _textValue(card.get("title") or card.get("label") or card.get("text"))] if item)
        bodyParts = [
            _textValue(card.get("subtitle")),
            _textValue(card.get("description") or card.get("content")),
            _pointLines(card.get("items") or card.get("points") or card.get("tips") or card.get("stats")),
            _formatCardCode(card),
            _formatCardFooter(card),
        ]
        lines.append("\n".join(item for item in [f"#### {heading or 'Item'}", *bodyParts] if item))
    return "\n\n".join(lines)


def _formatCardCode(card: dict[str, Any]) -> str:
    code = _textValue(card.get("code") or card.get("snippet"))
    if not code:
        return ""
    return f"```python\n{code}\n```"


def _formatCardFooter(card: dict[str, Any]) -> str:
    footer = _mapValue(card.get("footer"))
    if footer:
        return _textValue(footer.get("text") or footer.get("description") or footer.get("content"))
    return _textValue(card.get("footer"))


def _formatCompare(block: dict[str, Any], fallbackTitle: str) -> str:
    items = _arrayOfMaps(block.get("items"))
    if items:
        lines = [f"### {fallbackTitle}", "", "| Item | Good | Bad |", "| --- | --- | --- |"]
        for item in items:
            lines.append(
                f"| {_textValue(item.get('label'))} | {_textValue(item.get('good'))} | {_textValue(item.get('bad'))} |"
            )
        return "\n".join(lines)

    left = _mapValue(block.get("left"))
    right = _mapValue(block.get("right"))
    sides = []
    for label, side in [("Left", left), ("Right", right)]:
        sideTitle = _textValue(side.get("title")) or label
        sides.append("\n".join(item for item in [f"#### {sideTitle}", _textValue(side.get("subtitle")), _pointLines(side.get("items"))] if item))
    return "\n\n".join([f"### {fallbackTitle}", *sides])


def _formatConceptRows(rows: list[dict[str, Any]], fallbackTitle: str, *, intro: str = "") -> str:
    lines = [f"### {fallbackTitle}"]
    if intro:
        lines.append(intro)
    for row in rows:
        concept = " ".join(
            item
            for item in [
                _textValue(row.get("emoji") or row.get("icon")),
                _textValue(row.get("concept") or row.get("title") or row.get("label") or row.get("term")),
            ]
            if item
        )
        explain = _textValue(row.get("explain") or row.get("explanation") or row.get("description") or row.get("analogy") or row.get("content"))
        lines.append("\n".join(item for item in [f"#### {concept or 'Concept'}", explain] if item))
    return "\n\n".join(lines)


def _formatDoDont(block: dict[str, Any], fallbackTitle: str) -> str:
    def side(value: Any, label: str) -> str:
        side_map = _mapValue(value)
        items = _arrayOfText(side_map.get("items") or side_map.get("points")) or _arrayOfText(value)
        head = _textValue(side_map.get("title")) or label
        return "\n".join([f"#### {head}", *[f"- {item}" for item in items]])

    lines = [f"### {fallbackTitle}"]
    items = _firstMaps(block, "items")
    if items:
        for item in items:
            verdict = _textValue(item.get("verdict") or item.get("kind"))
            mark = "✅" if verdict in {"do", "good", "권장"} else "❌"
            lines.append(f"- {mark} {_textValue(item.get('text') or item.get('title') or item.get('description'))}")
    else:
        lines.append(side(block.get("do") or block.get("good"), "권장(Do)"))
        lines.append(side(block.get("dont") or block.get("bad"), "지양(Don't)"))
    return "\n\n".join(lines)


def _formatDefinitions(rows: list[dict[str, Any]], fallbackTitle: str, *, intro: str = "") -> str:
    lines = [f"### {fallbackTitle}"]
    if intro:
        lines.append(intro)
    for row in rows:
        term = _textValue(row.get("term") or row.get("title"))
        english = _textValue(row.get("english") or row.get("en"))
        head = f"{term} ({english})" if english else term
        meaning = _textValue(row.get("meaning") or row.get("definition") or row.get("description"))
        example = _textValue(row.get("example"))
        body = [meaning]
        if example:
            body.append(f"예: {example}")
        lines.append("\n".join(item for item in [f"#### {head or 'Term'}", *body] if item))
    return "\n\n".join(lines)


def _formatMisconceptions(rows: list[dict[str, Any]], fallbackTitle: str, *, intro: str = "") -> str:
    lines = [f"### {fallbackTitle}"]
    if intro:
        lines.append(intro)
    for row in rows:
        myth = _textValue(row.get("myth") or row.get("wrong") or row.get("misconception"))
        truth = _textValue(row.get("truth") or row.get("right") or row.get("fact") or row.get("reality"))
        lines.append("\n".join(item for item in [f"#### ❌ {myth}" if myth else "", f"✅ {truth}" if truth else ""] if item))
    return "\n\n".join(lines)


def _formatTimeline(rows: list[dict[str, Any]], fallbackTitle: str, *, intro: str = "") -> str:
    lines = [f"### {fallbackTitle}"]
    if intro:
        lines.append(intro)
    for index, row in enumerate(rows, start=1):
        label = _textValue(row.get("step") or row.get("label")) or str(index)
        head = _textValue(row.get("title") or row.get("name"))
        detail = _textValue(row.get("description") or row.get("detail") or row.get("content"))
        lines.append(f"- **{label}. {head}** — {detail}" if detail else f"- **{label}. {head}**")
    return "\n".join(lines)


def _formatStats(rows: list[dict[str, Any]], fallbackTitle: str, *, intro: str = "") -> str:
    lines = [f"### {fallbackTitle}"]
    if intro:
        lines.append(intro)
    for row in rows:
        value = _textValue(row.get("value") or row.get("number") or row.get("stat"))
        label = _textValue(row.get("label") or row.get("title") or row.get("name"))
        delta = _textValue(row.get("delta") or row.get("change"))
        lines.append(f"- **{value}** {label}{f' ({delta})' if delta else ''}")
    return "\n".join(lines)


def _formatCodeCompare(block: dict[str, Any], fallbackTitle: str) -> str:
    def side(value: Any, label: str) -> str:
        side_map = _mapValue(value)
        code = _textValue(side_map.get("code")) or _textValue(value)
        head = _textValue(side_map.get("label") or side_map.get("title")) or label
        return f"#### {head}\n```\n{code}\n```" if code else f"#### {head}"

    return "\n\n".join([
        f"### {fallbackTitle}",
        side(block.get("before") or block.get("bad"), "Before"),
        side(block.get("after") or block.get("good"), "After"),
    ])


def _formatAnatomy(block: dict[str, Any], fallbackTitle: str, *, intro: str = "") -> str:
    lines = [f"### {fallbackTitle}"]
    if intro:
        lines.append(intro)
    code = _textValue(block.get("code") or block.get("line") or block.get("target"))
    if code:
        lines.append(f"```\n{code}\n```")
    parts = _firstMaps(block, "parts", "items", "tokens")
    bullets: list[str] = []
    for index, part in enumerate(parts, start=1):
        token = _textValue(part.get("token") or part.get("text") or part.get("part") or part.get("code"))
        label = _textValue(part.get("label") or part.get("title") or part.get("name") or part.get("role"))
        explain = _textValue(part.get("explain") or part.get("explanation") or part.get("description") or part.get("meaning"))
        head = f"`{token}`" if token else str(index)
        meta = f" — {label}" if label else ""
        bullets.append(f"- {head}{meta}{f': {explain}' if explain else ''}")
    if bullets:
        lines.append("\n".join(bullets))
    return "\n\n".join(lines)


def _formatTerminal(block: dict[str, Any], fallbackTitle: str, *, intro: str = "") -> str:
    lines = [f"### {fallbackTitle}"]
    if intro:
        lines.append(intro)
    rows = _firstMaps(block, "lines", "commands", "session", "steps")
    rendered: list[str] = []
    if rows:
        for row in rows:
            cmd = _textValue(row.get("cmd") or row.get("command") or row.get("input") or row.get("in"))
            out = _textValue(row.get("out") or row.get("output") or row.get("result"))
            if cmd:
                rendered.append(f"$ {cmd}")
            if out:
                rendered.append(out)
    else:
        text = _textValue(block.get("content") or block.get("code"))
        if text:
            rendered.append(text)
    if rendered:
        lines.append("```\n" + "\n".join(rendered) + "\n```")
    return "\n\n".join(lines)


def _formatAnnotatedCode(block: dict[str, Any], fallbackTitle: str, *, intro: str = "") -> str:
    lines = [f"### {fallbackTitle}"]
    if intro:
        lines.append(intro)
    rows = _firstMaps(block, "lines", "items", "rows")
    if rows:
        codeLines: list[str] = []
        notes: list[str] = []
        for row in rows:
            code = _textValue(row.get("code") or row.get("line") or row.get("text"))
            note = _textValue(row.get("note") or row.get("annotation") or row.get("explain") or row.get("description"))
            codeLines.append(code)
            if note:
                notes.append(f"- `{code}` — {note}" if code else f"- {note}")
        if any(codeLines):
            lines.append("```\n" + "\n".join(codeLines) + "\n```")
        if notes:
            lines.append("\n".join(notes))
    else:
        code = _textValue(block.get("code") or block.get("content"))
        if code:
            lines.append(f"```\n{code}\n```")
    return "\n\n".join(lines)


def _formatMedia(block: dict[str, Any], sourceType: str, title: str, subtitle: str, description: str) -> str:
    src = _textValue(
        block.get("src")
        or block.get("url")
        or block.get("href")
        or block.get("imageUrl")
        or block.get("videoUrl")
        or block.get("buttonLink")
        or block.get("youtubeId")
        or block.get("videoId")
        or block.get("youtube")
    )
    if sourceType == "image" and src:
        return f"![{title or subtitle or 'Image'}]({src})"
    items = _firstMaps(block, "items", "videos")
    itemLines = []
    for item in items:
        label = _textValue(item.get("title") or item.get("label") or item.get("url") or item.get("src")) or "Resource"
        url = _textValue(item.get("url") or item.get("src") or item.get("href"))
        itemLines.append(f"- [{label}]({url})" if url else f"- {label}")
    return "\n\n".join(item for item in [f"### {title or _blockTypeLabel(sourceType)}", subtitle, description, f"[Open resource]({src})" if src else "", "\n".join(itemLines)] if item)


def _linksFromBlock(block: dict[str, Any], sourceType: str, title: str, description: str) -> list[dict[str, Any]]:
    if sourceType == "link":
        return [
            {
                "title": title or _textValue(block.get("label") or block.get("url") or block.get("href")),
                "url": _textValue(block.get("url") or block.get("href")),
                "description": description,
            }
        ]
    return _firstMaps(block, "items", "links", "buttons")


def _formatLinks(links: list[dict[str, Any]], fallbackTitle: str) -> str:
    lines = [f"### {fallbackTitle}"]
    for link in links:
        title = _textValue(link.get("title") or link.get("label") or link.get("name") or link.get("text") or link.get("url") or link.get("href")) or "Link"
        url = _textValue(link.get("url") or link.get("href")) or "#"
        description = _textValue(link.get("description"))
        lines.append(f"- [{title}]({url}){f' - {description}' if description else ''}")
    return "\n".join(lines)


def _formatCodeDescription(content: str) -> str:
    if not content:
        return ""
    return f"```python\n{content}\n```"


def _textFromUnknownBlock(block: dict[str, Any]) -> str:
    lines: list[str] = []
    for key, value in block.items():
        if key in {"type", "style"}:
            continue
        if isinstance(value, list):
            lines.append(f"**{key}**\n{_pointLines(value)}")
        elif isinstance(value, dict):
            lines.append(f"**{key}**\n{_textFromUnknownBlock(value)}")
        else:
            lines.append(f"**{key}** {_textValue(value)}")
    return "\n\n".join(line for line in lines if line.strip())


def _pointLines(value: Any) -> str:
    maps = _arrayOfMaps(value)
    if maps:
        return "\n".join(
            "- " + " ".join(item for item in [_textValue(point.get("emoji") or point.get("icon")), _textValue(point.get("title") or point.get("label") or point.get("text")), _textValue(point.get("description") or point.get("content"))] if item)
            for point in maps
        )
    return "\n".join(f"- {item}" for item in _arrayOfText(value))


def _normalizeCode(code: str) -> str:
    if not code:
        return ""
    lines = []
    for line in code.splitlines():
        lines.append(line.rstrip())
    result = "\n".join(lines).strip("\n")
    return result if result.strip() else "pass"


def _executionKindFromLanguage(language: str) -> str:
    normalized = language.lower()
    if "browser" in normalized:
        return "browser"
    if "shell" in normalized or "powershell" in normalized or normalized in {"bash", "sh", "os"}:
        return "os"
    if "mouse" in normalized:
        return "mouse"
    if "image" in normalized:
        return "image"
    if "task" in normalized:
        return "task"
    if "skill" in normalized:
        return "skill"
    return "python"


def _noteTitle(block: dict[str, Any], sourceType: str) -> str:
    if sourceType == "note":
        style = _textValue(block.get("style")) or "info"
        return {
            "info": "Info",
            "tip": "Tip",
            "warning": "Warning",
            "error": "Error",
            "danger": "주의",
            "success": "성공 기준",
            "example": "예시",
            "summary": "핵심 정리",
        }.get(style, "Note")
    return _blockTypeLabel(sourceType)


def _exerciseTypeFromTitle(title: str) -> str:
    if "버그" in title or "오류" in title:
        return "fixBug"
    if "예측" in title:
        return "predict"
    if "수정" in title or "바꿔" in title:
        return "modify"
    if "심화" in title:
        return "writeCode"
    return "fillBlank"


def _difficultyFromTitle(title: str) -> str:
    if "🔴" in title or "심화" in title:
        return "hard"
    if "🟡" in title or "응용" in title:
        return "medium"
    return "easy"


def _checkConfig(block: dict[str, Any]) -> dict[str, str]:
    check = _mapValue(block.get("check") or block.get("checkConfig"))
    return {str(key): _textValue(value) for key, value in check.items()}


def _isPlaceholderPredict(value: str) -> bool:
    """예측 값이 작성 안내 placeholder인지 — "(…적어주세요)" 류. 실제 기대값엔 이런 말이 없다."""
    return "주세요" in value or "적어" in value


def _cleanPredictField(value: str) -> str:
    return "" if _isPlaceholderPredict(value) else value


def _predictConfig(predict: LearningPredictContract | None) -> PredictConfig | None:
    """exercise.predict 를 프론트용으로 정규화한다.

    작성 안내 placeholder("(셀 마지막 출력값을 적어주세요)" 등)는 실제 기대값이 아니라 작성 미완
    표시이므로 빈 값으로 떨군다 — 그래야 카드가 그 차원을 숨기고(grain 정합), placeholder를 hint로
    echo하지 않는다. 정규화 후 실제 예측 대상이 하나도 없으면 None(카드를 아예 안 띄움).
    """
    if predict is None or predict.isEmpty():
        return None
    shape = _cleanPredictField(predict.expectedShape)
    dtype = _cleanPredictField(predict.expectedDtype)
    value = _cleanPredictField(predict.expectedValue)
    error = _cleanPredictField(predict.expectedError)
    if not any([predict.prompt, shape, dtype, value, error]):
        return None
    return PredictConfig(
        prompt=predict.prompt,
        expectedShape=shape,
        expectedDtype=dtype,
        expectedValue=value,
        expectedError=error,
    )


def _structuredCheckConfig(
    *,
    checkSource: Any,
    solutionCode: str,
    starterCode: str,
) -> dict[str, Any]:
    """Build the checkConfig dict for a structured section's exercise.

    Reads YAML check dict and, when type=output but expectedCode missing,
    falls back to the section's solution (provided it differs from the
    starter — otherwise student code would always match expected).
    """
    if isinstance(checkSource, dict):
        config: dict[str, Any] = {str(k): v for k, v in checkSource.items()}
    else:
        config = {}
    if (
        config.get("type") == "output"
        and not config.get("expectedCode")
        and solutionCode
        and solutionCode != starterCode
    ):
        config["expectedCode"] = solutionCode
    return config


def _blockTypeLabel(sourceType: str) -> str:
    labels = {
        "anatomy": "구조 분해",
        "annotatedCode": "코드 해설",
        "codeWalkthrough": "코드 해설",
        "terminal": "터미널",
        "centerText": "Center Text",
        "choiceCards": "Choice Cards",
        "codeCompare": "코드 비교",
        "codeDescription": "Code Description",
        "conceptRow": "개념 설명",
        "danger": "주의",
        "definition": "정의",
        "doDont": "권장 vs 지양",
        "example": "예시",
        "misconception": "흔한 오해",
        "stat": "지표",
        "success": "성공 기준",
        "summary": "핵심 정리",
        "timeline": "흐름",
        "featureCards": "Feature Cards",
        "fullWidthComparison": "Comparison",
        "hero": "Hero",
        "image": "Image",
        "info": "Info",
        "link": "Link",
        "linkButtons": "Links",
        "links": "Links",
        "localWorkbench": "Codaro Local Workbench",
        "MIME": "Media",
        "note": "Note",
        "pdf": "PDF",
        "practiceCard": "Practice",
        "quiz": "Quiz",
        "resourceCards": "Resources",
        "stepCard": "Step",
        "table": "Table",
        "threeColumnCards": "Cards",
        "tiobeIndex": "Index",
        "tip": "Tip",
        "tipCard": "Tip",
        "video": "Video",
        "videoCarousel": "Video",
        "warning": "Warning",
        "youtube": "YouTube",
    }
    return labels.get(sourceType, re.sub(r"([a-z])([A-Z])", r"\1 \2", sourceType))


def _mapValue(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _arrayOfMaps(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, dict)]


def _arrayOfText(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    items: list[str] = []
    for item in value:
        if isinstance(item, str | int | float | bool):
            items.append(str(item))
        elif isinstance(item, dict):
            text = " ".join(
                part
                for part in [
                    _textValue(item.get("emoji") or item.get("icon")),
                    _textValue(item.get("title") or item.get("label") or item.get("name") or item.get("text")),
                    _textValue(item.get("description") or item.get("content")),
                ]
                if part
            )
            if text:
                items.append(text)
    return items


def _firstMaps(block: dict[str, Any], *keys: str) -> list[dict[str, Any]]:
    for key in keys:
        items = _arrayOfMaps(block.get(key))
        if items:
            return items
    return []


def _textValue(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, int | float | bool):
        return str(value)
    return ""


def _firstSentence(value: str) -> str:
    return re.split(r"[.!?。]", re.sub(r"\s+", " ", value))[0][:80] or "Learning"


def _firstCodeLine(value: str) -> str:
    for line in value.splitlines():
        stripped = line.strip()
        if stripped:
            return stripped[:80]
    return "Python cell"
