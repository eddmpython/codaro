from __future__ import annotations

import ast
from dataclasses import dataclass, field


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

SCOPE_MODULE = "module"
SCOPE_FUNCTION = "function"
SCOPE_CLASS = "class"
SCOPE_LAMBDA = "lambda"
SCOPE_COMPREHENSION = "comprehension"


@dataclass(slots=True)
class ScopeBindings:
    orderedNames: list[str] = field(default_factory=list)
    candidateNames: set[str] = field(default_factory=set)
    globalNames: set[str] = field(default_factory=set)
    nonlocalNames: set[str] = field(default_factory=set)

    def addCandidate(self, name: str) -> None:
        if not name or name in self.candidateNames:
            return
        self.candidateNames.add(name)
        self.orderedNames.append(name)

    @property
    def names(self) -> set[str]:
        return {
            name
            for name in self.orderedNames
            if name not in self.globalNames and name not in self.nonlocalNames
        }

    @property
    def orderedResolvedNames(self) -> list[str]:
        return [
            name
            for name in self.orderedNames
            if name not in self.globalNames and name not in self.nonlocalNames
        ]


@dataclass(slots=True)
class ScopeState:
    kind: str
    bindings: set[str]
    parent: ScopeState | None = None
    globalNames: set[str] = field(default_factory=set)
    nonlocalNames: set[str] = field(default_factory=set)


class BindingCollector(ast.NodeVisitor):
    def __init__(self, parameterNames: list[str] | None = None) -> None:
        self.scopeBindings = ScopeBindings()
        for name in parameterNames or []:
            self.scopeBindings.addCandidate(name)

    def visit_Name(self, node: ast.Name) -> None:
        if isinstance(node.ctx, ast.Store):
            self.scopeBindings.addCandidate(node.id)

    def visit_Global(self, node: ast.Global) -> None:
        self.scopeBindings.globalNames.update(node.names)

    def visit_Nonlocal(self, node: ast.Nonlocal) -> None:
        self.scopeBindings.nonlocalNames.update(node.names)

    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            self.scopeBindings.addCandidate(alias.asname or alias.name.split(".")[0])

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        for alias in node.names:
            if alias.name == "*":
                continue
            self.scopeBindings.addCandidate(alias.asname or alias.name)

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self.scopeBindings.addCandidate(node.name)
        self._visitFunctionHeader(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        self.scopeBindings.addCandidate(node.name)
        self._visitFunctionHeader(node)

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        self.scopeBindings.addCandidate(node.name)
        for decorator in node.decorator_list:
            self.visit(decorator)
        for base in node.bases:
            self.visit(base)
        for keyword in node.keywords:
            self.visit(keyword.value)

    def visit_Lambda(self, node: ast.Lambda) -> None:
        self._visitArguments(node.args)

    def visit_ExceptHandler(self, node: ast.ExceptHandler) -> None:
        if node.type is not None:
            self.visit(node.type)
        if node.name:
            self.scopeBindings.addCandidate(node.name)
        for statement in node.body:
            self.visit(statement)

    def visit_ListComp(self, node: ast.ListComp) -> None:
        return

    def visit_SetComp(self, node: ast.SetComp) -> None:
        return

    def visit_DictComp(self, node: ast.DictComp) -> None:
        return

    def visit_GeneratorExp(self, node: ast.GeneratorExp) -> None:
        return

    def _visitFunctionHeader(self, node: ast.FunctionDef | ast.AsyncFunctionDef) -> None:
        for decorator in node.decorator_list:
            self.visit(decorator)
        self._visitArguments(node.args)
        if node.returns is not None:
            self.visit(node.returns)

    def _visitArguments(self, arguments: ast.arguments) -> None:
        for default in arguments.defaults:
            self.visit(default)
        for default in arguments.kw_defaults:
            if default is not None:
                self.visit(default)
        for argument in _iterArguments(arguments):
            if argument.annotation is not None:
                self.visit(argument.annotation)


class UseCollector(ast.NodeVisitor):
    def __init__(self, moduleScope: ScopeState) -> None:
        self.moduleScope = moduleScope
        self.scopeStack = [moduleScope]
        self.moduleUses: set[str] = set()
        # 모듈 스코프에서 외부 정의 변수를 제자리 변경(x[0]=v / obj.a=v)하는 base 이름.
        # 의존 엣지(use)는 base의 Load ctx로 이미 기록되므로 여기선 "변경"이라는 신호만 모은다.
        self.mutatedFreeNames: set[str] = set()
        # 같은 셀에서 정의되면서도 외부 값을 읽는 이름(total = total + 5, df = df.dropna()).
        # 정의에 가려 moduleUses 필터에서 빠지므로 별도로 모아 use로 살린다(주입 + 의존 엣지).
        self.selfReferentialUses: set[str] = set()
        self._pendingReassignTargets: set[str] = set()

    @property
    def currentScope(self) -> ScopeState:
        return self.scopeStack[-1]

    def visit_Name(self, node: ast.Name) -> None:
        if isinstance(node.ctx, ast.Load):
            self._recordLoad(node.id)

    def visit_Assign(self, node: ast.Assign) -> None:
        if self.currentScope.kind != SCOPE_MODULE:
            self.generic_visit(node)
            return
        # 모듈 스코프 — Python은 RHS를 평가한 뒤 target을 바인딩한다. 그래서 RHS에서 읽힌
        # target 이름은 "이번 셀이 정의하기 전의 외부 값"을 읽는 것 = self-referential use.
        targets: set[str] = set()
        for target in node.targets:
            targets.update(_collectAssignedNames(target))
        previous = self._pendingReassignTargets
        self._pendingReassignTargets = previous | targets
        self.visit(node.value)
        self._pendingReassignTargets = previous
        for target in node.targets:
            self.visit(target)

    def visit_AugAssign(self, node: ast.AugAssign) -> None:
        if isinstance(node.target, ast.Name):
            # x += 1 은 항상 x의 외부 값을 읽는다. 모듈 스코프면 self-referential use로 살린다.
            if self.currentScope.kind == SCOPE_MODULE:
                self.selfReferentialUses.add(node.target.id)
            else:
                self._recordLoad(node.target.id)
        else:
            # x[0] += 1 / obj.a += 1 → target(Subscript/Attribute)이 visit_Subscript/Attribute로
            # 라우팅되어 base를 변경으로 기록한다.
            self.visit(node.target)
        self.visit(node.value)

    def visit_Subscript(self, node: ast.Subscript) -> None:
        if isinstance(node.ctx, (ast.Store, ast.Del)) and isinstance(node.value, ast.Name):
            self._recordMutationBase(node.value.id)
        self.generic_visit(node)

    def visit_Attribute(self, node: ast.Attribute) -> None:
        if isinstance(node.ctx, (ast.Store, ast.Del)) and isinstance(node.value, ast.Name):
            self._recordMutationBase(node.value.id)
        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        for decorator in node.decorator_list:
            self.visit(decorator)
        self._visitArguments(node.args)
        if node.returns is not None:
            self.visit(node.returns)
        self._visitChildScope(
            SCOPE_FUNCTION,
            node.body,
            parameterNames=_extractParameterNames(node.args),
        )

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        for decorator in node.decorator_list:
            self.visit(decorator)
        self._visitArguments(node.args)
        if node.returns is not None:
            self.visit(node.returns)
        self._visitChildScope(
            SCOPE_FUNCTION,
            node.body,
            parameterNames=_extractParameterNames(node.args),
        )

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        for decorator in node.decorator_list:
            self.visit(decorator)
        for base in node.bases:
            self.visit(base)
        for keyword in node.keywords:
            self.visit(keyword.value)
        self._visitChildScope(SCOPE_CLASS, node.body)

    def visit_Lambda(self, node: ast.Lambda) -> None:
        self._visitArguments(node.args)
        self._visitChildScope(
            SCOPE_LAMBDA,
            [node.body],
            parameterNames=_extractParameterNames(node.args),
        )

    def visit_ListComp(self, node: ast.ListComp) -> None:
        self._visitComprehension([node.elt], node.generators)

    def visit_SetComp(self, node: ast.SetComp) -> None:
        self._visitComprehension([node.elt], node.generators)

    def visit_GeneratorExp(self, node: ast.GeneratorExp) -> None:
        self._visitComprehension([node.elt], node.generators)

    def visit_DictComp(self, node: ast.DictComp) -> None:
        self._visitComprehension([node.key, node.value], node.generators)

    def visit_Global(self, node: ast.Global) -> None:
        return

    def visit_Nonlocal(self, node: ast.Nonlocal) -> None:
        return

    def _visitArguments(self, arguments: ast.arguments) -> None:
        for default in arguments.defaults:
            self.visit(default)
        for default in arguments.kw_defaults:
            if default is not None:
                self.visit(default)
        for argument in _iterArguments(arguments):
            if argument.annotation is not None:
                self.visit(argument.annotation)

    def _visitChildScope(
        self,
        kind: str,
        nodes: list[ast.stmt] | list[ast.expr],
        parameterNames: list[str] | None = None,
    ) -> None:
        childScope = buildScopeState(
            nodes,
            kind=kind,
            parent=self.currentScope,
            parameterNames=parameterNames,
        )
        self.scopeStack.append(childScope)
        for node in nodes:
            self.visit(node)
        self.scopeStack.pop()

    def _visitComprehension(
        self,
        valueNodes: list[ast.expr],
        generators: list[ast.comprehension],
    ) -> None:
        if not generators:
            for valueNode in valueNodes:
                self.visit(valueNode)
            return

        self.visit(generators[0].iter)
        comprehensionScope = buildComprehensionScope(generators, parent=self.currentScope)
        self.scopeStack.append(comprehensionScope)
        for generator in generators:
            self.visit(generator.target)
            if generator is not generators[0]:
                self.visit(generator.iter)
            for ifNode in generator.ifs:
                self.visit(ifNode)
        for valueNode in valueNodes:
            self.visit(valueNode)
        self.scopeStack.pop()

    def _recordLoad(self, name: str) -> None:
        if name in PYTHON_BUILTINS:
            return
        # 모듈 스코프에서 재할당 target을 그 RHS가 읽으면(total = total + 5) 외부 값을 읽는 것.
        if self.currentScope.kind == SCOPE_MODULE and name in self._pendingReassignTargets:
            self.selfReferentialUses.add(name)
            return
        if self._resolvesInScope(name, self.currentScope):
            return
        self.moduleUses.add(name)

    def _recordMutationBase(self, name: str) -> None:
        # 모듈 스코프에서만 판정한다(함수/comprehension 내부 변경은 호출 시점 의존이라 오탐 방지).
        if self.currentScope.kind != SCOPE_MODULE:
            return
        if name in PYTHON_BUILTINS:
            return
        if self._resolvesInScope(name, self.currentScope):
            return
        self.mutatedFreeNames.add(name)

    def _resolvesInScope(self, name: str, scope: ScopeState) -> bool:
        if scope.kind == SCOPE_MODULE:
            return name in self.moduleScope.bindings

        if name in scope.globalNames:
            return name in self.moduleScope.bindings

        if name in scope.nonlocalNames:
            return self._findBindingScope(name, scope.parent, allowModule=False) is not None

        if name in scope.bindings:
            return True

        return self._findBindingScope(name, scope.parent, allowModule=True) is not None

    def _findBindingScope(
        self,
        name: str,
        scope: ScopeState | None,
        *,
        allowModule: bool,
    ) -> ScopeState | None:
        current = scope
        while current is not None:
            if current.kind == SCOPE_CLASS:
                current = current.parent
                continue
            if current.kind != SCOPE_MODULE and name in current.globalNames:
                return self.moduleScope if allowModule and name in self.moduleScope.bindings else None
            if name in current.bindings:
                if current.kind == SCOPE_MODULE and not allowModule:
                    return None
                return current
            current = current.parent
        return self.moduleScope if allowModule and name in self.moduleScope.bindings else None


# 로컬-우선 학습 노트북에서 진짜 footgun인 호출만 advisory로 잡는다(차단 아님).
# subprocess 등 로컬에서 정상 동작하는 건 제외 — marimo의 WASM 전용 목록은 따르지 않는다.
_UNSAFE_ATTR_CALLS = {
    "os": {"system", "popen", "fork", "kill", "remove", "rmdir", "unlink", "removedirs"},
    "shutil": {"rmtree"},
}
_UNSAFE_ATTR_PREFIXES = {"os": ("exec", "spawn")}
_UNSAFE_BUILTINS = {"eval", "exec", "__import__", "breakpoint"}


def _collectImportsAndUnsafe(tree: ast.Module) -> tuple[list[str], list[str]]:
    imports: list[str] = []
    unsafe: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports.extend(alias.name.split(".")[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom):
            if node.module and not node.level:
                imports.append(node.module.split(".")[0])
        elif isinstance(node, ast.Call):
            func = node.func
            if isinstance(func, ast.Attribute) and isinstance(func.value, ast.Name):
                module, attr = func.value.id, func.attr
                allowed = _UNSAFE_ATTR_CALLS.get(module)
                prefixes = _UNSAFE_ATTR_PREFIXES.get(module)
                if (allowed and attr in allowed) or (prefixes and attr.startswith(prefixes)):
                    unsafe.append(f"{module}.{attr}")
            elif isinstance(func, ast.Name) and func.id in _UNSAFE_BUILTINS:
                unsafe.append(func.id)
    return list(dict.fromkeys(imports)), list(dict.fromkeys(unsafe))


def _isEmptyBody(tree: ast.Module) -> bool:
    return not tree.body or all(isinstance(node, ast.Pass) for node in tree.body)


@dataclass(slots=True)
class CellBindings:
    defines: list[str]
    uses: list[str]
    mutatedFreeNames: list[str]
    imports: list[str] = field(default_factory=list)
    unsafeCalls: list[str] = field(default_factory=list)
    isEmpty: bool = False


def analyzeCellBindings(code: str) -> CellBindings:
    try:
        tree = ast.parse(code)
    except SyntaxError:
        # 파싱 불가 = 깨진 코드가 있다는 뜻이라 빈 셀이 아니다.
        return CellBindings(defines=[], uses=[], mutatedFreeNames=[], isEmpty=False)

    moduleBindings = collectScopeBindings(tree.body)
    moduleScope = ScopeState(
        kind=SCOPE_MODULE,
        bindings=moduleBindings.names,
        globalNames=moduleBindings.globalNames,
        nonlocalNames=moduleBindings.nonlocalNames,
    )
    useCollector = UseCollector(moduleScope)
    for statement in tree.body:
        useCollector.visit(statement)

    useSet = {
        name
        for name in useCollector.moduleUses
        if name not in moduleBindings.names and name not in PYTHON_BUILTINS
    }
    # self-referential use는 정의(moduleBindings)에 가려도 살린다 — 외부 값을 읽으므로 주입 필요.
    useSet |= {name for name in useCollector.selfReferentialUses if name not in PYTHON_BUILTINS}
    uses = sorted(useSet)
    mutatedFreeNames = [
        name
        for name in sorted(useCollector.mutatedFreeNames)
        if name not in moduleBindings.names and name not in PYTHON_BUILTINS
    ]
    imports, unsafeCalls = _collectImportsAndUnsafe(tree)
    return CellBindings(
        defines=moduleBindings.orderedResolvedNames,
        uses=uses,
        mutatedFreeNames=mutatedFreeNames,
        imports=imports,
        unsafeCalls=unsafeCalls,
        isEmpty=_isEmptyBody(tree),
    )


def analyzeCode(code: str) -> tuple[list[str], list[str]]:
    # 하위호환 래퍼 — 기존 호출자(reactive.buildReactiveGraph, localWorker)는 (defines, uses)만 쓴다.
    binding = analyzeCellBindings(code)
    return binding.defines, binding.uses


def collectScopeBindings(
    nodes: list[ast.stmt] | list[ast.expr],
    parameterNames: list[str] | None = None,
) -> ScopeBindings:
    collector = BindingCollector(parameterNames=parameterNames)
    for node in nodes:
        collector.visit(node)
    return collector.scopeBindings


def buildScopeState(
    nodes: list[ast.stmt] | list[ast.expr],
    *,
    kind: str,
    parent: ScopeState,
    parameterNames: list[str] | None = None,
) -> ScopeState:
    bindings = collectScopeBindings(nodes, parameterNames=parameterNames)
    return ScopeState(
        kind=kind,
        bindings=bindings.names,
        parent=parent,
        globalNames=bindings.globalNames,
        nonlocalNames=bindings.nonlocalNames,
    )


def buildComprehensionScope(
    generators: list[ast.comprehension],
    *,
    parent: ScopeState,
) -> ScopeState:
    bindings = ScopeBindings()
    for generator in generators:
        for name in _collectAssignedNames(generator.target):
            bindings.addCandidate(name)
    return ScopeState(kind=SCOPE_COMPREHENSION, bindings=bindings.names, parent=parent)


def _extractParameterNames(arguments: ast.arguments) -> list[str]:
    return [argument.arg for argument in _iterArguments(arguments)]


def _iterArguments(arguments: ast.arguments) -> list[ast.arg]:
    values = list(arguments.posonlyargs)
    values.extend(arguments.args)
    if arguments.vararg is not None:
        values.append(arguments.vararg)
    values.extend(arguments.kwonlyargs)
    if arguments.kwarg is not None:
        values.append(arguments.kwarg)
    return values


def _collectAssignedNames(node: ast.AST) -> list[str]:
    if isinstance(node, ast.Name):
        return [node.id]
    if isinstance(node, (ast.Tuple, ast.List)):
        names: list[str] = []
        for item in node.elts:
            names.extend(_collectAssignedNames(item))
        return names
    if isinstance(node, ast.Starred):
        return _collectAssignedNames(node.value)
    return []
