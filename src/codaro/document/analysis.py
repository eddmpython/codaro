from __future__ import annotations

import ast


PYTHON_BUILTINS = {
    "abs",
    "all",
    "any",
    "bool",
    "dict",
    "enumerate",
    "filter",
    "float",
    "input",
    "int",
    "len",
    "list",
    "map",
    "max",
    "min",
    "next",
    "open",
    "print",
    "range",
    "repr",
    "reversed",
    "round",
    "set",
    "sorted",
    "str",
    "sum",
    "tuple",
    "type",
    "zip",
}


class DefinitionVisitor(ast.NodeVisitor):
    def __init__(self) -> None:
        self.defines: list[str] = []
        self.uses: set[str] = set()

    def visit_Name(self, node: ast.Name) -> None:
        if isinstance(node.ctx, ast.Store):
            if node.id not in self.defines:
                self.defines.append(node.id)
            return
        if isinstance(node.ctx, ast.Load) and node.id not in PYTHON_BUILTINS:
            self.uses.add(node.id)

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        if node.name not in self.defines:
            self.defines.append(node.name)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        if node.name not in self.defines:
            self.defines.append(node.name)
        self.generic_visit(node)

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        if node.name not in self.defines:
            self.defines.append(node.name)
        self.generic_visit(node)

    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            name = alias.asname or alias.name.split(".")[0]
            if name not in self.defines:
                self.defines.append(name)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        for alias in node.names:
            if alias.name == "*":
                continue
            name = alias.asname or alias.name
            if name not in self.defines:
                self.defines.append(name)


def analyzeCode(code: str) -> tuple[list[str], list[str]]:
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return [], []

    visitor = DefinitionVisitor()
    visitor.visit(tree)
    uses = [name for name in sorted(visitor.uses) if name not in visitor.defines]
    return visitor.defines, uses
