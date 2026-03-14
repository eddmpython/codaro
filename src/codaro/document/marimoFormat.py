from __future__ import annotations

import ast
from pathlib import Path
import re
import textwrap
import uuid

from .analysis import analyzeCode
from .models import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig


def parseMarimoDocument(source: str, sourcePath: Path | None = None) -> CodaroDocument:
    lines = source.replace("\r\n", "\n").split("\n")
    blocks: list[BlockConfig] = []
    title = sourcePath.stem if sourcePath else "Imported"
    appMatch = re.search(r'marimo\.App\(([^)]*)\)', source)
    if appMatch:
        titleMatch = re.search(r'app_title\s*=\s*["\']([^"\']+)["\']', appMatch.group(1))
        if titleMatch:
            title = titleMatch.group(1)

    index = 0
    while index < len(lines):
        line = lines[index].strip()
        if not line.startswith("@app.cell"):
            index += 1
            continue

        index += 1
        while index < len(lines) and not lines[index].strip():
            index += 1
        if index >= len(lines):
            break

        defLine = lines[index].strip()
        if not defLine.startswith("def "):
            index += 1
            continue
        index += 1

        bodyLines: list[str] = []
        while index < len(lines):
            current = lines[index]
            trimmed = current.strip()
            if trimmed.startswith("@app.cell") or trimmed.startswith("if __name__"):
                break
            bodyLines.append(current)
            index += 1

        body = textwrap.dedent("\n".join(bodyLines)).rstrip()
        bodyWithoutReturn = _stripTrailingReturn(body)
        markdown = _extractMarimoMarkdown(bodyWithoutReturn)
        blockType = "markdown" if markdown is not None else "code"
        content = markdown if markdown is not None else bodyWithoutReturn
        blocks.append(
            BlockConfig(
                id=f"block-{uuid.uuid4().hex[:8]}",
                type=blockType,
                content=content,
            )
        )

    if not blocks:
        blocks.append(BlockConfig(id=f"block-{uuid.uuid4().hex[:8]}", type="code", content=""))
    elif blocks[0].type == "code" and blocks[0].content.strip() == "import marimo as mo":
        blocks = blocks[1:] or [BlockConfig(id=f"block-{uuid.uuid4().hex[:8]}", type="code", content="")]

    return CodaroDocument(
        id=f"doc-{uuid.uuid4().hex[:10]}",
        title=title,
        blocks=blocks,
        metadata=DocumentMetadata(sourceFormat="marimo"),
        runtime=RuntimeConfig(),
        app=AppConfig(title=title, entryBlockIds=[block.id for block in blocks if block.type == "code"]),
    )


def writeMarimoDocument(document: CodaroDocument) -> str:
    parts = ["import marimo", "", f'app = marimo.App(app_title="{document.title}")', ""]
    parts.extend(
        [
            "@app.cell",
            "def _():",
            "    import marimo as mo",
            "    return (mo,)",
            "",
        ]
    )
    for block in document.blocks:
        if block.type == "markdown":
            parts.extend(
                [
                    "@app.cell",
                    "def _(mo):",
                    "    mo.md(",
                    '        """',
                ]
            )
            for line in block.content.splitlines():
                parts.append(f"        {line}")
            parts.extend(['        """', "    )", "    return", ""])
            continue

        defines, uses = analyzeCode(block.content)
        params = ", ".join(sorted(set(uses)))
        parts.append("@app.cell")
        parts.append(f"def _({params}):" if params else "def _():")
        if block.content.strip():
            for line in block.content.splitlines():
                parts.append(f"    {line}" if line else "")
        else:
            parts.append("    pass")
        if defines:
            parts.append(f"    return ({', '.join(defines)},)")
        else:
            parts.append("    return")
        parts.append("")

    parts.extend(['if __name__ == "__main__":', "    app.run()", ""])
    return "\n".join(parts)


def _stripTrailingReturn(code: str) -> str:
    lines = code.splitlines()
    while lines and not lines[-1].strip():
        lines.pop()
    if lines and lines[-1].lstrip().startswith("return"):
        lines.pop()
    return "\n".join(lines).rstrip()


def _extractMarimoMarkdown(code: str) -> str | None:
    tree = ast.parse(code)
    if len(tree.body) != 1:
        return None
    statement = tree.body[0]
    if not isinstance(statement, ast.Expr) or not isinstance(statement.value, ast.Call):
        return None
    call = statement.value
    if not isinstance(call.func, ast.Attribute) or call.func.attr != "md" or not call.args:
        return None
    argument = call.args[0]
    if isinstance(argument, ast.Constant) and isinstance(argument.value, str):
        return argument.value
    return None
