from __future__ import annotations

import ast
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PACKAGE_ROOT = ROOT / "src" / "codaro"

PACKAGE_NAMES = {
    "ai",
    "api",
    "automation",
    "curriculum",
    "document",
    "extensions",
    "kernel",
    "runtime",
    "share",
    "system",
    "webBuild",
}

FORBIDDEN_IMPORTS_BY_PACKAGE = {
    "document": {
        "ai",
        "api",
        "automation",
        "curriculum",
        "extensions",
        "kernel",
        "runtime",
        "share",
        "system",
    },
    "runtime": {
        "ai",
        "api",
        "automation",
        "curriculum",
        "extensions",
        "kernel",
        "share",
    },
    "kernel": {
        "ai",
        "api",
        "automation",
        "curriculum",
        "extensions",
        "share",
    },
    "curriculum": {
        "ai",
        "api",
        "automation",
        "extensions",
        "share",
    },
    "automation": {
        "ai",
        "api",
        "curriculum",
        "extensions",
        "share",
    },
    "share": {
        "ai",
        "api",
        "extensions",
    },
    "extensions": {
        "ai",
        "api",
        "automation",
        "curriculum",
        "share",
    },
    "ai": {
        "api",
        "extensions",
        "share",
    },
    "system": {
        "api",
    },
}


def testCodaroPackageImportsFollowLayerDirection() -> None:
    offenders: list[str] = []
    for path in sorted(PACKAGE_ROOT.rglob("*.py")):
        if "__pycache__" in path.parts:
            continue
        sourcePackage = _sourcePackage(path)
        forbiddenImports = FORBIDDEN_IMPORTS_BY_PACKAGE.get(sourcePackage, set())
        if not forbiddenImports:
            continue

        tree = ast.parse(path.read_text(encoding="utf-8"))
        for importedPackage, lineNumber in _codaroPackageImports(path, tree):
            if importedPackage in forbiddenImports:
                relativePath = path.relative_to(ROOT).as_posix()
                offenders.append(f"{relativePath}:{lineNumber} imports {importedPackage}/ from {sourcePackage}/")

    assert offenders == []


def testArchitectureOverviewNamesLayerGateAndCurrentMapping() -> None:
    source = (ROOT / "docs/skills/architecture/overview.md").read_text(encoding="utf-8")
    ssotMap = (ROOT / "docs/skills/architecture/ssot-map.md").read_text(encoding="utf-8")

    for expected in (
        "## 계층 import gate",
        "`core → engine → domain → transport → entry`",
        "`document/`, `runtime/`, `kernel/`",
        "`curriculum/`, `automation/`, `share/`, `extensions/`, `ai/`",
        "`api/`, `webBuild/`",
        "`server.py`, `cli.py`",
        "`system/`은 현재 전환기 composition seam",
        "`tests/testArchitectureLayerContract.py`",
        "`tests/testTransportBoundary.py`",
        "문서·테스트·제거 조건",
    ):
        assert expected in source

    assert "architecture layer contract" in ssotMap
    assert "`docs/skills/architecture/overview.md`, `tests/testArchitectureLayerContract.py`" in ssotMap
    assert "`core → engine → domain → transport → entry`" in ssotMap


def _sourcePackage(path: Path) -> str:
    relative = path.relative_to(PACKAGE_ROOT)
    if len(relative.parts) == 1:
        return "__entry__"
    return relative.parts[0]


def _codaroPackageImports(path: Path, tree: ast.AST) -> list[tuple[str, int]]:
    imports: list[tuple[str, int]] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            importedPackage = _packageFromImportFrom(path, node)
            if importedPackage in PACKAGE_NAMES:
                imports.append((importedPackage, node.lineno))
        elif isinstance(node, ast.Import):
            for alias in node.names:
                importedPackage = _packageFromAbsoluteName(alias.name)
                if importedPackage in PACKAGE_NAMES:
                    imports.append((importedPackage, node.lineno))
    return imports


def _packageFromImportFrom(path: Path, node: ast.ImportFrom) -> str | None:
    if node.level == 0:
        return _packageFromAbsoluteName(node.module or "")

    relative = path.relative_to(PACKAGE_ROOT)
    packageParts = list(relative.parts[:-1])
    parentHops = max(0, node.level - 1)
    if parentHops:
        packageParts = packageParts[:-parentHops]
    if node.module:
        packageParts.extend(node.module.split("."))
    return packageParts[0] if packageParts else None


def _packageFromAbsoluteName(name: str) -> str | None:
    if not name.startswith("codaro."):
        return None
    parts = name.split(".")
    return parts[1] if len(parts) > 1 else None
