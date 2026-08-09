from __future__ import annotations

import json
import re
import tomllib
import uuid
from pathlib import Path

from pydantic import ValidationError

from .models import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, GuideConfig, RuntimeConfig


_CELL_MARKER = re.compile(r"^# %%\s*\[(\w+)\]\s*(.*)$")
_APP_HEADER = re.compile(r"^# codaro:app\s+(.*)$")
_KV_PAIR = re.compile(r'(\w+)=["\']([^"\']*)["\']|(\w+)=(\S+)')
# PEP 723 인라인 스크립트 메타데이터 — `# /// script` ~ `# ///` 사이의 주석 줄이 TOML이다.
_INLINE_SCRIPT = re.compile(r"(?m)^# /// script[ \t]*$\n(?P<content>(?:^#.*\n)*?)^# ///[ \t]*$\n?")
_INLINE_APP = re.compile(r"(?m)^# /// codaro-app[ \t]*$\n(?P<content>(?:^#.*\n)*?)^# ///[ \t]*$\n?")
_APP_SPEC_FIELDS = {
    "schemaVersion",
    "title",
    "layout",
    "hideCode",
    "entryBlockIds",
    "statePolicy",
}


class PercentFormatError(ValueError):
    pass


def parseInlineScriptMetadata(source: str) -> dict | None:
    """PEP 723 `# /// script` 블록을 TOML로 파싱해 반환한다(없으면 None)."""
    match = _INLINE_SCRIPT.search(source)
    if not match:
        return None
    tomlLines: list[str] = []
    for line in match.group("content").splitlines():
        if line.startswith("# "):
            tomlLines.append(line[2:])
        elif line == "#":
            tomlLines.append("")
    try:
        return tomllib.loads("\n".join(tomlLines))
    except tomllib.TOMLDecodeError:
        return None


def _packagesFromInlineMeta(meta: dict | None) -> list[str]:
    if not meta:
        return []
    dependencies = meta.get("dependencies", [])
    return [dep for dep in dependencies if isinstance(dep, str)]


def writeInlineScriptMetadata(packages: list[str], requiresPython: str | None = None) -> str:
    lines = ["# /// script"]
    if requiresPython:
        lines.append(f'# requires-python = "{requiresPython}"')
    lines.append("# dependencies = [")
    for pkg in packages:
        lines.append(f'#     "{pkg}",')
    lines.append("# ]")
    lines.append("# ///")
    return "\n".join(lines)


def parseAppMetadata(source: str) -> AppConfig | None:
    match = _INLINE_APP.search(source)
    if not match:
        return None
    tomlLines: list[str] = []
    for line in match.group("content").splitlines():
        if line.startswith("# "):
            tomlLines.append(line[2:])
        elif line == "#":
            tomlLines.append("")
        else:
            raise PercentFormatError("codaro-app metadata must contain comment-prefixed TOML")
    try:
        payload = tomllib.loads("\n".join(tomlLines))
    except tomllib.TOMLDecodeError as exc:
        raise PercentFormatError(f"codaro-app metadata is invalid TOML: {exc}") from exc
    if set(payload) != _APP_SPEC_FIELDS:
        raise PercentFormatError("codaro-app metadata fields are invalid")
    try:
        return AppConfig.model_validate(payload)
    except ValidationError as exc:
        raise PercentFormatError(f"codaro-app metadata is invalid: {exc}") from exc


def writeAppMetadata(app: AppConfig) -> str:
    entryBlockIds = ", ".join(_tomlString(blockId) for blockId in app.entryBlockIds)
    return "\n".join([
        "# /// codaro-app",
        f"# schemaVersion = {app.schemaVersion}",
        f"# title = {_tomlString(app.title)}",
        f"# layout = {_tomlString(app.layout)}",
        f"# hideCode = {'true' if app.hideCode else 'false'}",
        f"# entryBlockIds = [{entryBlockIds}]",
        f"# statePolicy = {_tomlString(app.statePolicy)}",
        "# ///",
    ])


def parsePercentDocument(source: str, sourcePath: Path | None = None) -> CodaroDocument:
    # PEP 723 인라인 의존성을 먼저 떼어내 packages로 쓰고, 셀 파싱에서는 제외한다.
    inlineMeta = parseInlineScriptMetadata(source)
    if inlineMeta is not None:
        source = _INLINE_SCRIPT.sub("", source, count=1)
    inlinePackages = _packagesFromInlineMeta(inlineMeta)
    appConfig = parseAppMetadata(source)
    if appConfig is not None:
        source = _INLINE_APP.sub("", source, count=1)
    lines = source.splitlines()
    title = sourcePath.stem if sourcePath else "Untitled"

    startLine = 0
    firstContentLine = next((index for index, line in enumerate(lines) if line.strip()), None)
    if firstContentLine is not None and _APP_HEADER.match(lines[firstContentLine]):
        headerKwargs = _parseKeyValues(lines[firstContentLine])
        if appConfig is None:
            title = headerKwargs.get("title", title)
        startLine = firstContentLine + 1

    if appConfig is not None:
        title = appConfig.title

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

    try:
        return CodaroDocument(
            id=f"doc-{uuid.uuid4().hex[:10]}",
            title=title,
            blocks=blocks,
            metadata=DocumentMetadata(sourceFormat="percent"),
            runtime=RuntimeConfig(packages=inlinePackages) if inlinePackages else RuntimeConfig(),
            app=appConfig or AppConfig(title=title),
        )
    except ValidationError as exc:
        raise PercentFormatError(f"percent document app projection is invalid: {exc}") from exc


def writePercentDocument(document: CodaroDocument) -> str:
    _validateWritableAppProjection(document)
    parts: list[str] = []
    if document.runtime.packages:
        # 선언 의존성을 PEP 723 블록으로 직렬화 → `uv run`/다른 도구도 읽을 수 있다(라운드트립).
        parts.append(writeInlineScriptMetadata(list(document.runtime.packages)))
        parts.append("")
    parts.extend([writeAppMetadata(document.app), ""])

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
        elif block.type == "automation":
            parts.append(f'# %% [automation] id={block.id}')
            parts.append(block.content or "")
            parts.append("")
        else:
            parts.append(f'# %% [code] id={block.id}')
            parts.append(block.content or "")
            parts.append("")

    return "\n".join(parts)


def isPercentFormat(source: str) -> bool:
    if _INLINE_APP.search(source):
        return True
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
    elif blockType == "automation":
        content = _stripTrailingBlanks("\n".join(lines))
        return BlockConfig(
            id=blockId or _blockId(),
            type="automation",
            content=content,
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


def _tomlString(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def _validateWritableAppProjection(document: CodaroDocument) -> None:
    try:
        AppConfig.model_validate(document.app.model_dump())
    except ValidationError as exc:
        raise PercentFormatError(f"cannot write invalid codaro-app metadata: {exc}") from exc
    blockIdCounts = {
        blockId: sum(block.id == blockId for block in document.blocks)
        for blockId in document.app.entryBlockIds
    }
    invalid = [blockId for blockId, count in blockIdCounts.items() if count != 1]
    if invalid:
        raise PercentFormatError(f"cannot write missing or ambiguous app entry blocks: {invalid}")


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
