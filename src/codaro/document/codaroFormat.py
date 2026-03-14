from __future__ import annotations

import ast
from pathlib import Path
import textwrap
import uuid

from .analysis import analyzeCode
from .models import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig


def parseCodaroDocument(source: str, sourcePath: Path | None = None) -> CodaroDocument:
    tree = ast.parse(source)
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

        blocks.append(
            BlockConfig(
                id=blockId,
                type=blockKind,
                content=content,
            )
        )

    if not blocks:
        blocks.append(BlockConfig(id=_blockId(), type="code", content=""))

    document = CodaroDocument(
        id=_documentId(),
        title=title,
        blocks=blocks,
        metadata=DocumentMetadata(sourceFormat="codaro"),
        runtime=RuntimeConfig(),
        app=AppConfig(title=title, entryBlockIds=[block.id for block in blocks if block.type == "code"]),
    )
    return document


def writeCodaroDocument(document: CodaroDocument) -> str:
    parts = [
        "import codaro",
        "",
        f'app = codaro.App(title={document.title!r})',
        "",
    ]

    for index, block in enumerate(document.blocks, start=1):
        functionName = f"block{index}"
        if block.type == "markdown":
            parts.append(f'@app.block(id="{block.id}", kind="markdown")')
            parts.append(f"def {functionName}():")
            parts.append("    codaro.md(")
            parts.append('        """')
            if block.content:
                for line in block.content.splitlines():
                    parts.append(f"        {line}")
            parts.append('        """')
            parts.append("    )")
            parts.append("")
            continue

        defines, _ = analyzeCode(block.content)
        parts.append(f'@app.block(id="{block.id}", kind="code")')
        parts.append(f"def {functionName}():")
        if block.content.strip():
            for line in block.content.splitlines():
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


def _documentId() -> str:
    return f"doc-{uuid.uuid4().hex[:10]}"


def _blockId() -> str:
    return f"block-{uuid.uuid4().hex[:8]}"
