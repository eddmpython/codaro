from __future__ import annotations

import ast
import hashlib
import json
from pathlib import Path
import re
import textwrap
import tomllib
import uuid

from .analysis import analyzeCode
from .formatMetadata import (
    FORMAT_METADATA_SCHEMA_VERSION,
    FormatMetadataError,
    canonicalJson,
    parsePersistentDocumentPayload,
    persistentDocumentPayload,
)
from .models import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig


_INLINE_NATIVE = re.compile(
    r"(?m)^# /// codaro-native[ \t]*$\n(?P<content>(?:^#.*\n)*?)^# ///[ \t]*$\n?"
)
_NATIVE_FIELDS = {"schemaVersion", "document", "app", "blocks", "bodyHash"}


class CodaroFormatError(ValueError):
    pass


def isCodaroFormat(source: str) -> bool:
    return _INLINE_NATIVE.search(source) is not None


def parseCodaroDocument(source: str, sourcePath: Path | None = None) -> CodaroDocument:
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        raise CodaroFormatError(f"codaro document is invalid Python: {exc}") from exc

    nativeMatches = list(_INLINE_NATIVE.finditer(source))
    if nativeMatches:
        if len(nativeMatches) != 1:
            raise CodaroFormatError("codaro document must contain exactly one codaro-native metadata block")
        match = nativeMatches[0]
        payload = _parseNativeMetadata(match.group("content"))
        if set(payload) != _NATIVE_FIELDS:
            raise CodaroFormatError("codaro-native metadata fields are invalid")
        body = (source[:match.start()] + source[match.end():]).lstrip("\r\n")
        expectedBodyHash = payload.pop("bodyHash")
        actualBodyHash = _contentHash(body)
        if expectedBodyHash != actualBodyHash:
            raise CodaroFormatError("codaro-native body does not match its lossless metadata")
        try:
            document = parsePersistentDocumentPayload(payload, sourceFormat="codaro")
        except FormatMetadataError as exc:
            raise CodaroFormatError(f"codaro-native metadata is invalid: {exc}") from exc
        if _writeCodaroBody(document) != body:
            raise CodaroFormatError("codaro-native body does not match its lossless metadata")
        return document

    return _parseLegacyCodaroDocument(source, tree, sourcePath)


def writeCodaroDocument(document: CodaroDocument) -> str:
    body = _writeCodaroBody(document)
    payload = {
        **persistentDocumentPayload(document, "codaro"),
        "bodyHash": _contentHash(body),
    }
    return f"{_writeNativeMetadata(payload)}\n\n{body}"


def _parseLegacyCodaroDocument(
    source: str,
    tree: ast.Module,
    sourcePath: Path | None,
) -> CodaroDocument:
    title = sourcePath.stem if sourcePath else "Untitled"
    blocks: list[BlockConfig] = []

    for node in tree.body:
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            if node.targets[0].id == "app" and isinstance(node.value, ast.Call):
                for keyword in node.value.keywords:
                    if keyword.arg == "title":
                        title = _literalString(keyword.value) or title

        if not isinstance(node, ast.FunctionDef):
            continue

        blockKind, blockId = _parseDecorator(node)
        if not blockKind or not blockId:
            continue

        if blockKind == "markdown":
            content = _parseMarkdownContent(node) or ""
        else:
            content = _parseCodeContent(source, node)

        blocks.append(BlockConfig(id=blockId, type=blockKind, content=content))

    if not blocks:
        blocks.append(BlockConfig(id=_blockId(), type="code", content=""))

    return CodaroDocument(
        id=_documentId(),
        title=title,
        blocks=blocks,
        metadata=DocumentMetadata(sourceFormat="codaro"),
        runtime=RuntimeConfig(),
        app=AppConfig(title=title, entryBlockIds=[block.id for block in blocks if block.type == "code"]),
    )


def _writeCodaroBody(document: CodaroDocument) -> str:
    parts = [
        "import codaro",
        "",
        f"app = codaro.App(title={document.title!r})",
        "",
    ]

    for index, block in enumerate(document.blocks, start=1):
        functionName = f"block{index}"
        if block.type == "markdown":
            parts.append(f"@app.block(id={block.id!r}, kind='markdown')")
            parts.append(f"def {functionName}():")
            parts.append(f"    codaro.md({block.content!r})")
            parts.append("")
            continue

        defines, _ = analyzeCode(block.content)
        parts.append(f"@app.block(id={block.id!r}, kind={block.type!r})")
        parts.append(f"def {functionName}():")
        if block.content.strip():
            for line in block.content.split("\n"):
                parts.append(f"    {line}" if line else "")
        else:
            parts.append("    pass")
        if defines:
            joined = ", ".join(defines)
            parts.append(f"    return ({joined},)")
        else:
            parts.append("    return")
        parts.append("")

    parts.extend(
        [
            'if __name__ == "__main__":',
            "    app.run()",
            "",
        ]
    )
    return "\n".join(parts)


def _parseNativeMetadata(content: str) -> dict[str, object]:
    tomlLines: list[str] = []
    for line in content.splitlines():
        if line.startswith("# "):
            tomlLines.append(line[2:])
        elif line == "#":
            tomlLines.append("")
        else:
            raise CodaroFormatError("codaro-native metadata must contain comment-prefixed TOML")
    try:
        wrapper = tomllib.loads("\n".join(tomlLines))
    except tomllib.TOMLDecodeError as exc:
        raise CodaroFormatError(f"codaro-native metadata is invalid TOML: {exc}") from exc
    if (
        set(wrapper) != {"schemaVersion", "payload"}
        or wrapper.get("schemaVersion") != FORMAT_METADATA_SCHEMA_VERSION
    ):
        raise CodaroFormatError(
            f"codaro-native metadata schemaVersion is not supported: {wrapper.get('schemaVersion')!r}"
        )
    encoded = wrapper.get("payload")
    if not isinstance(encoded, str):
        raise CodaroFormatError("codaro-native metadata payload must be a JSON string")
    try:
        payload = json.loads(encoded)
    except json.JSONDecodeError as exc:
        raise CodaroFormatError(f"codaro-native metadata payload is invalid JSON: {exc}") from exc
    if not isinstance(payload, dict) or payload.get("schemaVersion") != wrapper["schemaVersion"]:
        raise CodaroFormatError("codaro-native metadata payload is invalid")
    return payload


def _writeNativeMetadata(payload: dict[str, object]) -> str:
    return "\n".join([
        "# /// codaro-native",
        f"# schemaVersion = {payload['schemaVersion']}",
        f"# payload = {json.dumps(canonicalJson(payload), ensure_ascii=False)}",
        "# ///",
    ])


def _parseDecorator(node: ast.FunctionDef) -> tuple[str | None, str | None]:
    for decorator in node.decorator_list:
        if not isinstance(decorator, ast.Call):
            continue
        if not isinstance(decorator.func, ast.Attribute):
            continue
        if decorator.func.attr != "block":
            continue

        blockId = None
        blockKind = None
        for keyword in decorator.keywords:
            if keyword.arg == "id":
                blockId = _literalString(keyword.value)
            if keyword.arg == "kind":
                blockKind = _literalString(keyword.value)
        return blockKind, blockId

    return None, None


def _parseMarkdownContent(node: ast.FunctionDef) -> str | None:
    for statement in node.body:
        if not isinstance(statement, ast.Expr) or not isinstance(statement.value, ast.Call):
            continue
        call = statement.value
        if isinstance(call.func, ast.Attribute) and call.func.attr == "md" and call.args:
            content = _literalString(call.args[0])
            return textwrap.dedent(content).strip("\n") if content is not None else None
        if isinstance(call.func, ast.Name) and call.func.id == "md" and call.args:
            content = _literalString(call.args[0])
            return textwrap.dedent(content).strip("\n") if content is not None else None
    return None


def _parseCodeContent(source: str, node: ast.FunctionDef) -> str:
    statements = list(node.body)
    if statements and isinstance(statements[-1], ast.Return):
        statements = statements[:-1]
    segments = [ast.get_source_segment(source, statement) or "" for statement in statements]
    joined = "\n".join(segment for segment in segments if segment is not None)
    return textwrap.dedent(joined).rstrip()


def _literalString(node: ast.AST) -> str | None:
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    return None


def _contentHash(value: str) -> str:
    return "sha256-" + hashlib.sha256(value.encode("utf-8")).hexdigest()


def _documentId() -> str:
    return f"doc-{uuid.uuid4().hex[:10]}"


def _blockId() -> str:
    return f"block-{uuid.uuid4().hex[:8]}"
