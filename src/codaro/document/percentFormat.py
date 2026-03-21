from __future__ import annotations

import json
import re
import uuid
from pathlib import Path

from .models import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, GuideConfig, RuntimeConfig


_CELL_MARKER = re.compile(r"^# %%\s*\[(\w+)\]\s*(.*)$")
_APP_HEADER = re.compile(r"^# codaro:app\s+(.*)$")
_KV_PAIR = re.compile(r'(\w+)=["\']([^"\']*)["\']|(\w+)=(\S+)')


def parsePercentDocument(source: str, sourcePath: Path | None = None) -> CodaroDocument:
    lines = source.splitlines()
    title = sourcePath.stem if sourcePath else "Untitled"

    headerKwargs = {}
    startLine = 0
    if lines and _APP_HEADER.match(lines[0]):
        headerKwargs = _parseKeyValues(lines[0])
        title = headerKwargs.get("title", title)
        startLine = 1

    blocks: list[BlockConfig] = []
    currentType: str | None = None
    currentId: str | None = None
    currentLines: list[str] = []
    preambleLines: list[str] = []

    for lineIndex in range(startLine, len(lines)):
        line = lines[lineIndex]
        match = _CELL_MARKER.match(line)

        if match:
            if currentType is not None:
                blocks.append(_buildBlock(currentType, currentId, currentLines))
            elif preambleLines:
                trimmed = "\n".join(preambleLines).strip()
                if trimmed:
                    blocks.append(BlockConfig(id=_blockId(), type="code", content=trimmed))

            currentType = match.group(1).lower()
            markerMeta = _parseKeyValues(match.group(2))
            currentId = markerMeta.get("id", _blockId())
            currentLines = []
        elif currentType is not None:
            currentLines.append(line)
        else:
            preambleLines.append(line)

    if currentType is not None:
        blocks.append(_buildBlock(currentType, currentId, currentLines))
    elif preambleLines:
        trimmed = "\n".join(preambleLines).strip()
        if trimmed:
            blocks.append(BlockConfig(id=_blockId(), type="code", content=trimmed))

    if not blocks:
        blocks.append(BlockConfig(id=_blockId(), type="code", content=""))

    return CodaroDocument(
        id=f"doc-{uuid.uuid4().hex[:10]}",
        title=title,
        blocks=blocks,
        metadata=DocumentMetadata(sourceFormat="percent"),
        runtime=RuntimeConfig(),
        app=AppConfig(title=title),
    )


def writePercentDocument(document: CodaroDocument) -> str:
    parts: list[str] = [f"# codaro:app title={document.title!r}", ""]

    for block in document.blocks:
        if block.type == "markdown":
            parts.append(f'# %% [markdown] id={block.id}')
            for line in (block.content or "").splitlines():
                parts.append(f"# {line}" if line else "#")
            parts.append("")
        elif block.type == "guide":
            parts.append(f'# %% [guide] id={block.id}')
            parts.append(block.content or "")
            parts.append("")
        else:
            parts.append(f'# %% [code] id={block.id}')
            parts.append(block.content or "")
            parts.append("")

    return "\n".join(parts)


def isPercentFormat(source: str) -> bool:
    for line in source.splitlines()[:20]:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            if _CELL_MARKER.match(stripped) or _APP_HEADER.match(stripped):
                return True
            continue
        break
    return False


def _buildBlock(blockType: str, blockId: str | None, lines: list[str]) -> BlockConfig:
    if blockType == "markdown":
        content = _stripMarkdownComments(lines)
    elif blockType == "guide":
        content = _stripTrailingBlanks("\n".join(lines))
        guide = _parseGuideContent(content)
        return BlockConfig(
            id=blockId or _blockId(),
            type="guide",
            content=content,
            guide=guide,
        )
    else:
        content = _stripTrailingBlanks("\n".join(lines))
    return BlockConfig(
        id=blockId or _blockId(),
        type=blockType,
        content=content,
    )


def _stripMarkdownComments(lines: list[str]) -> str:
    result: list[str] = []
    for line in lines:
        if line.startswith("# "):
            result.append(line[2:])
        elif line == "#":
            result.append("")
        else:
            result.append(line)
    return _stripTrailingBlanks("\n".join(result))


def _stripTrailingBlanks(text: str) -> str:
    return text.strip("\n").rstrip()


def _parseKeyValues(text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for match in _KV_PAIR.finditer(text):
        if match.group(1):
            result[match.group(1)] = match.group(2)
        elif match.group(3):
            result[match.group(3)] = match.group(4)
    return result


def _blockId() -> str:
    return f"block-{uuid.uuid4().hex[:8]}"


def _parseGuideContent(content: str) -> GuideConfig:
    try:
        data = json.loads(content)
        return GuideConfig(
            exerciseType=data.get("exerciseType", "fillBlank"),
            hints=data.get("hints", []),
            checkConfig=data.get("checkConfig", {}),
            difficulty=data.get("difficulty", "easy"),
            solution=data.get("solution", ""),
            description=data.get("description", ""),
            studentAnswer=data.get("studentAnswer", ""),
        )
    except (json.JSONDecodeError, TypeError):
        return GuideConfig()
