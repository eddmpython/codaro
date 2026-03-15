from __future__ import annotations

import uuid

from ..document.models import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig


def yamlToDocument(content: dict, category: str, contentId: str) -> tuple[CodaroDocument, dict[str, str]]:
    meta = content.get("meta", {})
    intro = content.get("intro", {})
    sections = content.get("sections", [])

    title = meta.get("title", contentId)
    blocks: list[BlockConfig] = []
    solutions: dict[str, str] = {}

    blocks.append(_markdownBlock(_buildIntroMarkdown(title, intro)))

    for section in sections:
        sectionTitle = section.get("title", "")
        sectionSubtitle = section.get("subtitle", "")

        if sectionTitle:
            header = f"## {sectionTitle}"
            if sectionSubtitle:
                header += f"\n*{sectionSubtitle}*"
            blocks.append(_markdownBlock(header))

        for block in section.get("blocks", []):
            if block.get("type") == "expansion":
                converted = _convertExpansionBlock(block)
                if converted:
                    for cell in converted:
                        blocks.append(cell)
                    exerciseCell = converted[-1]
                    solutionCode = block.get("code", "")
                    if solutionCode:
                        solutions[exerciseCell.id] = solutionCode
            else:
                converted = _convertBlock(block)
                if converted:
                    blocks.extend(converted) if isinstance(converted, list) else blocks.append(converted)

    if not blocks:
        blocks.append(_codeBlock(""))

    return (CodaroDocument(
        id=f"doc-{uuid.uuid4().hex[:10]}",
        title=title,
        blocks=blocks,
        metadata=DocumentMetadata(sourceFormat="curriculum"),
        runtime=RuntimeConfig(),
        app=AppConfig(title=title),
    ), solutions)


def _convertBlock(block: dict) -> BlockConfig | list[BlockConfig] | None:
    blockType = block.get("type", "")

    if blockType == "text":
        return _markdownBlock(block.get("content", ""))

    if blockType == "code":
        return _convertCodeBlock(block)

    if blockType == "list":
        return _convertListBlock(block)

    if blockType == "tip":
        content = block.get("content", "")
        return _markdownBlock(f"**Tip:** {content}")

    if blockType == "note":
        style = block.get("style", "info")
        titleMap = {"info": "Info", "tip": "Tip", "warning": "Warning", "error": "Error"}
        prefix = titleMap.get(style, "Note")
        noteTitle = block.get("title", prefix)
        content = block.get("content", "")
        return _markdownBlock(f"**{noteTitle}:** {content}")

    if blockType == "table":
        return _convertTableBlock(block)

    if blockType == "expansion":
        return _convertExpansionBlock(block)

    if blockType == "compare":
        return _convertCompareBlock(block)

    if blockType == "quiz":
        return _convertQuizBlock(block)

    return None


def _convertCodeBlock(block: dict) -> list[BlockConfig]:
    result: list[BlockConfig] = []
    blockTitle = block.get("title", "")
    description = block.get("description", "")

    if blockTitle or description:
        header = ""
        if blockTitle:
            header += f"### {blockTitle}"
        if description:
            header += f"\n{description}" if header else description
        result.append(_markdownBlock(header))

    code = block.get("content", "")
    expectedOutput = block.get("output", "")

    codeCell = _codeBlock(code)
    if expectedOutput:
        codeCell = codeCell.model_copy(update={
            "execution": codeCell.execution.model_copy(update={
                "lastOutput": expectedOutput.strip(),
                "status": "idle",
            })
        })
    result.append(codeCell)

    return result


def _convertListBlock(block: dict) -> BlockConfig:
    style = block.get("style", "bullet")
    items = block.get("items", [])
    lines: list[str] = []
    for index, item in enumerate(items, start=1):
        if style == "number":
            lines.append(f"{index}. {item}")
        elif style == "check":
            lines.append(f"- [ ] {item}")
        else:
            lines.append(f"- {item}")
    return _markdownBlock("\n".join(lines))


def _convertTableBlock(block: dict) -> BlockConfig:
    headers = block.get("headers", [])
    rows = block.get("rows", [])
    lines: list[str] = []
    if headers:
        lines.append("| " + " | ".join(str(h) for h in headers) + " |")
        lines.append("| " + " | ".join("---" for _ in headers) + " |")
    for row in rows:
        lines.append("| " + " | ".join(str(c) for c in row) + " |")
    return _markdownBlock("\n".join(lines))


def _convertExpansionBlock(block: dict) -> list[BlockConfig]:
    result: list[BlockConfig] = []
    expansionTitle = block.get("title", "Mission")
    result.append(_markdownBlock(f"### {expansionTitle}"))

    missionCell = _codeBlock("")
    result.append(missionCell)

    return result


def _convertCompareBlock(block: dict) -> BlockConfig:
    compareTitle = block.get("title", "Compare")
    items = block.get("items", [])
    lines = [f"### {compareTitle}", ""]
    lines.append("| | Good | Bad |")
    lines.append("| --- | --- | --- |")
    for item in items:
        label = item.get("label", "")
        good = item.get("good", "")
        bad = item.get("bad", "")
        lines.append(f"| {label} | {good} | {bad} |")
    return _markdownBlock("\n".join(lines))


def _convertQuizBlock(block: dict) -> BlockConfig:
    question = block.get("question", "")
    options = block.get("options", [])
    lines = [f"**Quiz:** {question}", ""]
    for index, option in enumerate(options):
        lines.append(f"{index + 1}. {option}")
    return _markdownBlock("\n".join(lines))


def _buildIntroMarkdown(title: str, intro: dict) -> str:
    emoji = intro.get("emoji", "")
    points = intro.get("points", [])
    lines = [f"# {emoji} {title}" if emoji else f"# {title}"]
    if points:
        lines.append("")
        for point in points:
            lines.append(f"- {point}")
    return "\n".join(lines)


def _markdownBlock(content: str) -> BlockConfig:
    return BlockConfig(
        id=f"block-{uuid.uuid4().hex[:8]}",
        type="markdown",
        content=content,
    )


def _codeBlock(content: str) -> BlockConfig:
    return BlockConfig(
        id=f"block-{uuid.uuid4().hex[:8]}",
        type="code",
        content=content,
    )
