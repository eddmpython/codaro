from __future__ import annotations

import ast
from dataclasses import asdict, dataclass, field
import hashlib
import json
from pathlib import Path
import re
import sys
from typing import Any, Literal, Mapping
from urllib.parse import urlsplit

from ..document.analysis import analyzeCellBindings, analyzeMarkdownRefs
from ..document.models import BlockConfig, CodaroDocument
from ..document.percentFormat import percentBlockSourceSpans, writePercentDocument
from ..generatedContracts import CapabilityDiagnostic, EffectSpec, ExecutableUnitSpec, RuntimeTarget, SourceSpan
from ..kernel.reactivePlan import buildReactiveGraph, dependencyClosure, diagnosticsFromGraph


_HASH_PREFIX = "sha256-"
_IMPORT_ALIASES = {
    "cv2": "opencv-python",
    "docx": "python-docx",
    "pil": "pillow",
    "sklearn": "scikit-learn",
    "yaml": "pyyaml",
}
_BROWSER_RUNTIME_MODULES = {"codaro", "pyodide", "js"}
_GUI_MODULES = {"pyautogui", "pynput", "tkinter", "win32api", "win32gui"}
_LOCAL_MODULES = {"ctypes", "fcntl", "msvcrt", "resource", "termios", "winreg"}
_NETWORK_MODULES = {"aiohttp", "http.client", "httpx", "requests", "socket", "urllib"}
_PROCESS_PREFIXES = (
    "asyncio.create_subprocess",
    "os.exec",
    "os.fork",
    "os.popen",
    "os.spawn",
    "os.system",
    "subprocess.",
)
_READ_METHODS = {"read_bytes", "read_csv", "read_excel", "read_json", "read_parquet", "read_text"}
_WRITE_METHODS = {
    "mkdir",
    "remove",
    "rename",
    "replace",
    "rmdir",
    "to_csv",
    "to_excel",
    "to_json",
    "to_parquet",
    "unlink",
    "write_bytes",
    "write_text",
}
_SENSITIVE_ASSET_NAMES = {".env", ".netrc", "credentials", "credentials.json", "id_dsa", "id_ed25519", "id_rsa"}
_MAX_ASSET_BYTES = 50 * 1024 * 1024
_SECRET_NAMES = re.compile(r"(?:TOKEN|SECRET|PASSWORD|API_KEY|PRIVATE_KEY|CREDENTIAL)", re.IGNORECASE)
_TARGET_ORDER: dict[RuntimeTarget, int] = {"browser": 0, "server": 1, "local": 2, "blocked": 3}


@dataclass(frozen=True, slots=True)
class SourceRevision:
    schemaVersion: Literal[1]
    path: str
    sourceHash: str
    blockHashes: dict[str, str]
    packageLockHash: str
    revisionHash: str

    def payload(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True, slots=True)
class TargetCandidate:
    available: bool
    reasonCodes: tuple[str, ...] = ()

    def payload(self) -> dict[str, Any]:
        return {"available": self.available, "reasonCodes": list(self.reasonCodes)}


@dataclass(frozen=True, slots=True)
class TargetDecision:
    selected: RuntimeTarget
    browser: TargetCandidate
    server: TargetCandidate
    local: TargetCandidate

    def payload(self) -> dict[str, Any]:
        return {
            "selected": self.selected,
            "candidates": {
                "browser": self.browser.payload(),
                "server": self.server.payload(),
                "local": self.local.payload(),
            },
        }


@dataclass(frozen=True, slots=True)
class CompilationResult:
    unit: ExecutableUnitSpec
    sourceRevision: SourceRevision
    targetDecision: TargetDecision
    packages: tuple[str, ...]
    manifestHash: str

    def payload(self) -> dict[str, Any]:
        return {
            "unit": self.unit,
            "sourceRevision": self.sourceRevision.payload(),
            "targetDecision": self.targetDecision.payload(),
            "packages": list(self.packages),
            "manifestHash": self.manifestHash,
        }


@dataclass(frozen=True, slots=True)
class CompilationReport:
    schemaVersion: Literal[1]
    runtimeTarget: RuntimeTarget
    entryBlockIds: tuple[str, ...]
    units: tuple[CompilationResult, ...]
    diagnostics: tuple[CapabilityDiagnostic, ...]
    sourceRevision: SourceRevision
    manifestHash: str

    def payload(self) -> dict[str, Any]:
        return {
            "schemaVersion": self.schemaVersion,
            "runtimeTarget": self.runtimeTarget,
            "entryBlockIds": list(self.entryBlockIds),
            "units": [unit.payload() for unit in self.units],
            "diagnostics": list(self.diagnostics),
            "sourceRevision": self.sourceRevision.payload(),
            "manifestHash": self.manifestHash,
        }


@dataclass(slots=True)
class _BlockAnalysis:
    effects: EffectSpec = field(
        default_factory=lambda: {
            "filesystemRead": [],
            "filesystemWrite": [],
            "networkOrigins": [],
            "process": False,
            "gui": False,
            "secretRefs": [],
        }
    )
    diagnostics: list[CapabilityDiagnostic] = field(default_factory=list)
    requiredTarget: RuntimeTarget = "browser"
    assets: dict[str, str] = field(default_factory=dict)


def compileDocument(
    document: CodaroDocument,
    *,
    sourcePath: str | Path | None = None,
    sourceText: str | None = None,
    workspaceRoot: str | Path | None = None,
    packageLock: Mapping[str, Any] | None = None,
) -> CompilationReport:
    resolvedSource, displayPath, resolvedRoot = _sourceContext(document, sourcePath, sourceText, workspaceRoot)
    sourceRevision = _sourceRevision(document, resolvedSource, displayPath, packageLock)
    entryBlockIds = tuple(
        document.app.entryBlockIds
        or [
            block.id
            for block in document.blocks
            if block.type in {"code", "markdown", "automation"}
        ]
    )
    results = tuple(
        compileExecutableUnit(
            document,
            entryBlockId,
            sourcePath=displayPath,
            sourceText=resolvedSource,
            workspaceRoot=resolvedRoot,
            packageLock=packageLock,
            sourceRevision=sourceRevision,
        )
        for entryBlockId in entryBlockIds
    )
    diagnostics = tuple(
        _dedupeDiagnostics([diagnostic for result in results for diagnostic in result.unit["diagnostics"]])
    )
    runtimeTarget: RuntimeTarget = max(
        (result.targetDecision.selected for result in results),
        key=lambda target: _TARGET_ORDER[target],
        default="blocked",
    )
    manifestPayload = {
        "schemaVersion": 1,
        "sourceRevision": sourceRevision.payload(),
        "entryBlockIds": entryBlockIds,
        "unitManifestHashes": [result.manifestHash for result in results],
        "runtimeTarget": runtimeTarget,
    }
    return CompilationReport(
        schemaVersion=1,
        runtimeTarget=runtimeTarget,
        entryBlockIds=entryBlockIds,
        units=results,
        diagnostics=diagnostics,
        sourceRevision=sourceRevision,
        manifestHash=_contentHash(_canonicalBytes(manifestPayload)),
    )


def compileExecutableUnit(
    document: CodaroDocument,
    entryBlockId: str,
    *,
    sourcePath: str | Path | None = None,
    sourceText: str | None = None,
    workspaceRoot: str | Path | None = None,
    packageLock: Mapping[str, Any] | None = None,
    checkScenarioIds: list[str] | None = None,
    evidenceReceiptIds: list[str] | None = None,
    sourceRevision: SourceRevision | None = None,
) -> CompilationResult:
    resolvedSource, displayPath, resolvedRoot = _sourceContext(document, sourcePath, sourceText, workspaceRoot)
    revision = sourceRevision or _sourceRevision(document, resolvedSource, displayPath, packageLock)
    blockById = {block.id: block for block in document.blocks}
    if entryBlockId not in blockById:
        raise ValueError(f"entry block does not exist: {entryBlockId}")
    graph = buildReactiveGraph(
        [
            {
                **block.model_dump(),
                "type": "code" if block.type == "automation" else block.type,
            }
            for block in document.blocks
        ],
        analyzeCellBindings,
        analyzeMarkdownRefs,
    )
    try:
        closureIds = dependencyClosure(graph, entryBlockId)
    except KeyError as exc:
        raise ValueError(f"entry block is not executable: {entryBlockId}") from exc
    codeBlocks = [blockById[blockId] for blockId in closureIds if blockById[blockId].type in {"code", "automation"}]
    spans = percentBlockSourceSpans(resolvedSource, displayPath)
    fallbackSpans = _fallbackSpans(document, displayPath)
    analyses = [
        _analyzeBlock(
            block, spans.get(block.id, fallbackSpans[block.id]), resolvedRoot, packageLock, document.runtime.packages
        )
        for block in codeBlocks
    ]
    diagnostics = [diagnostic for analysis in analyses for diagnostic in analysis.diagnostics]
    diagnostics.extend(_graphDiagnostics(graph, closureIds, spans, fallbackSpans, displayPath))
    effects = _mergeEffects([analysis.effects for analysis in analyses])
    assets = dict(
        sorted(
            (item for analysis in analyses for item in analysis.assets.items()),
            key=lambda item: item[0],
        )
    )
    requiredTarget = max(
        (analysis.requiredTarget for analysis in analyses),
        key=lambda target: _TARGET_ORDER[target],
        default="browser",
    )
    if document.app.statePolicy == "shared":
        diagnostics.append(
            _diagnostic(
                entryBlockId,
                "SHARED_STATE_REQUIRES_SERVER",
                "공유 상태는 격리된 서버 세션이 필요합니다.",
                "warning",
                spans.get(entryBlockId, fallbackSpans[entryBlockId]),
            )
        )
        requiredTarget = max(requiredTarget, "server", key=lambda target: _TARGET_ORDER[target])
    if any(diagnostic["code"] == "CROSS_CELL_MUTATION_REQUIRES_LOCAL" for diagnostic in diagnostics):
        requiredTarget = max(requiredTarget, "local", key=lambda target: _TARGET_ORDER[target])
    if any(diagnostic["severity"] == "blocked" for diagnostic in diagnostics):
        requiredTarget = "blocked"
    diagnostics = _dedupeDiagnostics(diagnostics)
    decision = _targetDecision(requiredTarget, diagnostics)
    dependencyIds = [blockId for blockId in closureIds if blockId != entryBlockId]
    unresolvedUses = sorted(
        {name for blockId in closureIds for name in graph.nodes[blockId].uses if not graph.definedBy.get(name)}
    )
    entryDefines = graph.nodes[entryBlockId].defines
    dependencyPayload = [{"blockId": blockId, "contentHash": revision.blockHashes[blockId]} for blockId in closureIds]
    sourceSpan = spans.get(entryBlockId, fallbackSpans[entryBlockId])
    unit: ExecutableUnitSpec = {
        "schemaVersion": 1,
        "unitId": "unit:"
        + hashlib.sha256(
            _canonicalBytes({"path": displayPath, "entryBlockId": entryBlockId})
        ).hexdigest(),
        "entryBlockId": entryBlockId,
        "dependencyBlockIds": dependencyIds,
        "inputSchema": {
            "type": "object",
            "properties": {name: {} for name in unresolvedUses},
            "required": unresolvedUses,
            "additionalProperties": False,
        },
        "outputSchema": {
            "type": "object",
            "properties": {name: {} for name in entryDefines},
            "required": entryDefines,
        },
        "effects": effects,
        "statePolicy": document.app.statePolicy,
        "runtimeTarget": decision.selected,
        "sourceSpan": sourceSpan,
        "sourceHash": revision.sourceHash,
        "dependencyHash": _contentHash(_canonicalBytes(dependencyPayload)),
        "assetHashes": assets,
        "checkScenarioIds": sorted(set(checkScenarioIds or [])),
        "evidenceReceiptIds": sorted(set(evidenceReceiptIds or [])),
        "diagnostics": diagnostics,
    }
    manifestPayload = {
        "unit": unit,
        "sourceRevision": revision.payload(),
        "packages": sorted(document.runtime.packages),
        "packageLock": _canonicalPackageLock(packageLock),
        "targetDecision": decision.payload(),
    }
    return CompilationResult(
        unit=unit,
        sourceRevision=revision,
        targetDecision=decision,
        packages=tuple(sorted(document.runtime.packages)),
        manifestHash=_contentHash(_canonicalBytes(manifestPayload)),
    )


def _sourceContext(
    document: CodaroDocument,
    sourcePath: str | Path | None,
    sourceText: str | None,
    workspaceRoot: str | Path | None,
) -> tuple[str, str, Path]:
    root = Path(workspaceRoot or Path.cwd()).expanduser().resolve()
    path = Path(sourcePath).expanduser() if sourcePath is not None else Path(f"{document.title or 'notebook'}.py")
    absolute = path.resolve() if path.is_absolute() else (root / path).resolve()
    try:
        displayPath = absolute.relative_to(root).as_posix()
    except ValueError:
        displayPath = path.name
    source = sourceText if sourceText is not None else writePercentDocument(document)
    return source, displayPath or "notebook.py", root


def _sourceRevision(
    document: CodaroDocument,
    source: str,
    displayPath: str,
    packageLock: Mapping[str, Any] | None,
) -> SourceRevision:
    blockHashes = {block.id: _contentHash(block.content.encode("utf-8")) for block in document.blocks}
    packageLockHash = _contentHash(_canonicalBytes(_canonicalPackageLock(packageLock)))
    sourceHash = _contentHash(source.encode("utf-8"))
    revisionPayload = {
        "schemaVersion": 1,
        "path": displayPath,
        "sourceHash": sourceHash,
        "blockHashes": blockHashes,
        "packageLockHash": packageLockHash,
    }
    return SourceRevision(
        schemaVersion=1,
        path=displayPath,
        sourceHash=sourceHash,
        blockHashes=blockHashes,
        packageLockHash=packageLockHash,
        revisionHash=_contentHash(_canonicalBytes(revisionPayload)),
    )


def _analyzeBlock(
    block: BlockConfig,
    blockSpan: SourceSpan,
    workspaceRoot: Path,
    packageLock: Mapping[str, Any] | None,
    declaredPackages: list[str],
) -> _BlockAnalysis:
    result = _BlockAnalysis()
    try:
        tree = ast.parse(block.content)
    except SyntaxError as exc:
        result.requiredTarget = "blocked"
        result.diagnostics.append(
            _diagnostic(
                block.id,
                "PYTHON_SYNTAX_ERROR",
                exc.msg,
                "blocked",
                _nodeSpan(blockSpan, exc.lineno, exc.end_lineno),
            )
        )
        return result

    collector = _EffectCollector(block.id, blockSpan, workspaceRoot)
    collector.visit(tree)
    result.effects = collector.effects()
    result.diagnostics.extend(collector.diagnostics)
    result.assets.update(collector.assets)
    result.requiredTarget = collector.requiredTarget
    packageTarget, packageDiagnostics = _packageDecision(
        block,
        tree,
        blockSpan,
        declaredPackages,
        packageLock,
    )
    result.requiredTarget = max(result.requiredTarget, packageTarget, key=lambda target: _TARGET_ORDER[target])
    result.diagnostics.extend(packageDiagnostics)
    return result


class _EffectCollector(ast.NodeVisitor):
    def __init__(self, blockId: str, blockSpan: SourceSpan, workspaceRoot: Path) -> None:
        self.blockId = blockId
        self.blockSpan = blockSpan
        self.workspaceRoot = workspaceRoot
        self.filesystemRead: set[str] = set()
        self.filesystemWrite: set[str] = set()
        self.networkOrigins: set[str] = set()
        self.process = False
        self.gui = False
        self.secretRefs: set[str] = set()
        self.assets: dict[str, str] = {}
        self.diagnostics: list[CapabilityDiagnostic] = []
        self.requiredTarget: RuntimeTarget = "browser"

    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            self._classifyModule(alias.name, node)
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        self._classifyModule(node.module or "", node)
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> None:
        name = _qualifiedName(node.func)
        lowered = name.lower()
        if name in {"eval", "exec", "__import__", "importlib.import_module"}:
            self._raiseTarget(
                "blocked", "DYNAMIC_CODE_BLOCKED", f"동적 코드 호출 {name}은 안전하게 분석할 수 없습니다.", node
            )
        if any(name.startswith(prefix) for prefix in _PROCESS_PREFIXES):
            self.process = True
            self._raiseTarget(
                "local", "PROCESS_REQUIRES_LOCAL", f"프로세스 호출 {name}은 로컬 실행이 필요합니다.", node
            )
        if name == "open":
            mode = _literalString(node.args[1]) if len(node.args) > 1 else _keywordString(node, "mode") or "r"
            self._recordFile(node.args[0] if node.args else None, write=any(flag in mode for flag in "wax+"), node=node)
        method = lowered.rsplit(".", 1)[-1]
        if method in _READ_METHODS:
            self._recordFile(_pathReceiver(node.func, node.args), write=False, node=node)
        if method in _WRITE_METHODS:
            self._recordFile(_pathReceiver(node.func, node.args), write=True, node=node)
        if any(lowered.startswith(prefix) for prefix in ("requests.", "httpx.", "aiohttp.", "urllib.", "socket.")):
            url = _literalString(node.args[0]) if node.args else None
            origin = _urlOrigin(url) if url else "dynamic"
            self.networkOrigins.add(origin)
            self._raiseTarget(
                "server", "NETWORK_REQUIRES_SERVER", f"네트워크 접근 {origin}은 서버 실행이 필요합니다.", node
            )
        if name in {"os.getenv", "os.environ.get", "get_secret", "secrets.get"}:
            secret = _literalString(node.args[0]) if node.args else None
            self.secretRefs.add(secret or "dynamic")
            self._raiseTarget(
                "server", "SECRET_REQUIRES_SERVER", "secret 참조는 브라우저 번들에 포함할 수 없습니다.", node
            )
        self.generic_visit(node)

    def visit_Subscript(self, node: ast.Subscript) -> None:
        if _qualifiedName(node.value) == "os.environ":
            secret = _literalString(node.slice)
            self.secretRefs.add(secret or "dynamic")
            self._raiseTarget(
                "server", "SECRET_REQUIRES_SERVER", "환경 변수 참조는 브라우저 번들에 포함할 수 없습니다.", node
            )
        self.generic_visit(node)

    def effects(self) -> EffectSpec:
        return {
            "filesystemRead": sorted(self.filesystemRead),
            "filesystemWrite": sorted(self.filesystemWrite),
            "networkOrigins": sorted(self.networkOrigins),
            "process": self.process,
            "gui": self.gui,
            "secretRefs": sorted(self.secretRefs),
        }

    def _classifyModule(self, module: str, node: ast.AST) -> None:
        root = module.split(".", 1)[0].lower()
        if root in _GUI_MODULES:
            self.gui = True
            self._raiseTarget("local", "GUI_REQUIRES_LOCAL", f"GUI 모듈 {module}은 로컬 실행이 필요합니다.", node)
        elif root in _LOCAL_MODULES:
            self._raiseTarget(
                "local", "OS_API_REQUIRES_LOCAL", f"운영체제 API {module}은 로컬 실행이 필요합니다.", node
            )
        elif root in {item.split(".", 1)[0] for item in _NETWORK_MODULES}:
            self.networkOrigins.add("dynamic")
            self._raiseTarget(
                "server", "NETWORK_REQUIRES_SERVER", f"네트워크 모듈 {module}은 서버 실행이 필요합니다.", node
            )
        if root == "subprocess":
            self.process = True
            self._raiseTarget("local", "PROCESS_REQUIRES_LOCAL", "프로세스 실행은 로컬 실행이 필요합니다.", node)

    def _recordFile(self, expression: ast.AST | None, *, write: bool, node: ast.AST) -> None:
        rawPath = _literalPath(expression)
        target = self.filesystemWrite if write else self.filesystemRead
        target.add(rawPath or "dynamic")
        if write:
            self._raiseTarget(
                "server",
                "FILESYSTEM_WRITE_REQUIRES_SERVER",
                "파일 쓰기는 브라우저 밖의 선언된 저장소가 필요합니다.",
                node,
            )
            return
        if rawPath is None:
            self._raiseTarget(
                "server", "DYNAMIC_FILE_REQUIRES_SERVER", "동적 파일 경로는 빌드 시 자산으로 고정할 수 없습니다.", node
            )
            return
        path = Path(rawPath).expanduser()
        if path.is_absolute():
            self._raiseTarget(
                "local", "ABSOLUTE_PATH_REQUIRES_LOCAL", f"절대 경로 {rawPath}는 로컬 실행이 필요합니다.", node
            )
            return
        resolved = (self.workspaceRoot / path).resolve()
        try:
            relative = resolved.relative_to(self.workspaceRoot).as_posix()
        except ValueError:
            self._raiseTarget(
                "local",
                "OUTSIDE_WORKSPACE_REQUIRES_LOCAL",
                f"작업공간 밖 경로 {rawPath}는 로컬 실행이 필요합니다.",
                node,
            )
            return
        if not resolved.is_file():
            self._raiseTarget("blocked", "ASSET_MISSING", f"읽을 자산 {relative}이 없습니다.", node)
            return
        if resolved.name.lower() in _SENSITIVE_ASSET_NAMES or resolved.suffix.lower() in {
            ".key",
            ".pem",
            ".pfx",
            ".p12",
        }:
            self._raiseTarget(
                "blocked",
                "SENSITIVE_ASSET_BLOCKED",
                f"민감한 파일 {relative}은 publication 자산으로 수집할 수 없습니다.",
                node,
            )
            return
        if resolved.stat().st_size > _MAX_ASSET_BYTES:
            self._raiseTarget("blocked", "ASSET_TOO_LARGE", f"자산 {relative}이 50 MiB 제한을 넘습니다.", node)
            return
        self.assets[relative] = _contentHash(resolved.read_bytes())

    def _raiseTarget(self, target: RuntimeTarget, code: str, message: str, node: ast.AST) -> None:
        if _TARGET_ORDER[target] > _TARGET_ORDER[self.requiredTarget]:
            self.requiredTarget = target
        severity: Literal["info", "warning", "blocked"] = "blocked" if target == "blocked" else "warning"
        self.diagnostics.append(
            _diagnostic(
                self.blockId,
                code,
                message,
                severity,
                _nodeSpan(self.blockSpan, getattr(node, "lineno", None), getattr(node, "end_lineno", None)),
            )
        )


def _packageDecision(
    block: BlockConfig,
    tree: ast.Module,
    blockSpan: SourceSpan,
    declaredPackages: list[str],
    packageLock: Mapping[str, Any] | None,
) -> tuple[RuntimeTarget, list[CapabilityDiagnostic]]:
    declared = {_packageName(item): item for item in declaredPackages}
    lock = {_packageName(key): value for key, value in (packageLock or {}).items()}
    target: RuntimeTarget = "browser"
    diagnostics: list[CapabilityDiagnostic] = []
    imports = [(alias.name, node) for node in ast.walk(tree) if isinstance(node, ast.Import) for alias in node.names]
    imports.extend((node.module or "", node) for node in ast.walk(tree) if isinstance(node, ast.ImportFrom))
    for imported, importNode in sorted(imports, key=lambda item: (item[0], item[1].lineno)):
        root = imported.split(".", 1)[0]
        normalized = _IMPORT_ALIASES.get(root.lower(), root.lower().replace("_", "-"))
        if root in sys.stdlib_module_names or root in _BROWSER_RUNTIME_MODULES:
            continue
        importSpan = _nodeSpan(blockSpan, importNode.lineno, importNode.end_lineno)
        if normalized not in declared:
            target = max(target, "server", key=lambda value: _TARGET_ORDER[value])
            diagnostics.append(
                _diagnostic(
                    block.id,
                    "PACKAGE_UNDECLARED",
                    f"패키지 {normalized}이 문서 의존성에 선언되지 않아 브라우저 호환성을 증명할 수 없습니다.",
                    "warning",
                    importSpan,
                )
            )
            continue
        locked = lock.get(normalized)
        if not isinstance(locked, Mapping):
            target = max(target, "server", key=lambda value: _TARGET_ORDER[value])
            diagnostics.append(
                _diagnostic(
                    block.id,
                    "PACKAGE_UNLOCKED",
                    f"패키지 {normalized}의 고정된 wheel 검증 정보가 없습니다.",
                    "warning",
                    importSpan,
                )
            )
            continue
        wheelHash = locked.get("wheelHash")
        tags = locked.get("tags", [])
        if not isinstance(wheelHash, str) or not re.fullmatch(r"sha256-[0-9a-f]{64}", wheelHash):
            target = "blocked"
            diagnostics.append(
                _diagnostic(
                    block.id,
                    "PACKAGE_LOCK_INVALID",
                    f"패키지 {normalized} lock의 wheelHash가 잘못됐습니다.",
                    "blocked",
                    importSpan,
                )
            )
            continue
        tagValues = [str(value) for value in tags] if isinstance(tags, list) else []
        if locked.get("browserSmoke") is True and any(
            "none-any" in tag or "emscripten" in tag or "wasm32" in tag
            for tag in tagValues
        ):
            continue
        if locked.get("serverSmoke") is True:
            target = max(target, "server", key=lambda value: _TARGET_ORDER[value])
            diagnostics.append(
                _diagnostic(
                    block.id,
                    "PACKAGE_REQUIRES_SERVER",
                    f"패키지 {normalized}은 서버 wheel로 검증됐습니다.",
                    "warning",
                    importSpan,
                )
            )
            continue
        target = max(target, "local", key=lambda value: _TARGET_ORDER[value])
        diagnostics.append(
            _diagnostic(
                block.id,
                "NATIVE_WHEEL_REQUIRES_LOCAL",
                f"패키지 {normalized}의 native wheel은 로컬 실행이 필요합니다.",
                "warning",
                importSpan,
            )
        )
    return target, diagnostics


def _graphDiagnostics(
    graph: Any,
    closureIds: list[str],
    spans: dict[str, SourceSpan],
    fallbackSpans: dict[str, SourceSpan],
    displayPath: str,
) -> list[CapabilityDiagnostic]:
    result: list[CapabilityDiagnostic] = []
    closure = set(closureIds)
    graphDiagnostics = diagnosticsFromGraph(graph, displayPath)
    for cycle in graphDiagnostics.cycles:
        if not closure.intersection(cycle):
            continue
        for blockId in cycle:
            if blockId in closure:
                result.append(
                    _diagnostic(
                        blockId,
                        "REACTIVE_CYCLE_BLOCKED",
                        "순환 의존은 결정적인 실행 순서를 만들 수 없습니다.",
                        "blocked",
                        spans.get(blockId, fallbackSpans[blockId]),
                    )
                )
    for variable, blockIds in graphDiagnostics.multipleDefinitions:
        if not closure.intersection(blockIds):
            continue
        for blockId in blockIds:
            if blockId in closure:
                result.append(
                    _diagnostic(
                        blockId,
                        "MULTIPLE_DEFINITION_BLOCKED",
                        f"{variable}의 정의가 여러 셀에 있어 provider를 결정할 수 없습니다.",
                        "blocked",
                        spans.get(blockId, fallbackSpans[blockId]),
                    )
                )
    for variable, mutator, _provider in graphDiagnostics.crossCellMutations:
        if mutator in closure:
            result.append(
                _diagnostic(
                    mutator,
                    "CROSS_CELL_MUTATION_REQUIRES_LOCAL",
                    f"{variable}을 다른 셀에서 제자리 변경하므로 로컬 상태가 필요합니다.",
                    "warning",
                    spans.get(mutator, fallbackSpans[mutator]),
                )
            )
    for blockId, module in graphDiagnostics.selfImports:
        if blockId in closure:
            result.append(
                _diagnostic(
                    blockId,
                    "SELF_IMPORT_BLOCKED",
                    f"문서가 자기 모듈 {module}을 import합니다.",
                    "blocked",
                    spans.get(blockId, fallbackSpans[blockId]),
                )
            )
    for variable, consumer, _provider in graphDiagnostics.definitionOrder:
        if consumer in closure:
            result.append(
                _diagnostic(
                    consumer,
                    "DEFINITION_ORDER_BLOCKED",
                    f"{variable}을 정의 셀보다 먼저 사용해 실행 순서를 보장할 수 없습니다.",
                    "blocked",
                    spans.get(consumer, fallbackSpans[consumer]),
                )
            )
    return result


def _targetDecision(requiredTarget: RuntimeTarget, diagnostics: list[CapabilityDiagnostic]) -> TargetDecision:
    codes = tuple(sorted({diagnostic["code"] for diagnostic in diagnostics}))
    if requiredTarget == "blocked":
        return TargetDecision(
            selected="blocked",
            browser=TargetCandidate(False, codes),
            server=TargetCandidate(False, codes),
            local=TargetCandidate(False, codes),
        )
    browser = TargetCandidate(requiredTarget == "browser", () if requiredTarget == "browser" else codes)
    serverAvailable = _TARGET_ORDER[requiredTarget] <= _TARGET_ORDER["server"]
    server = TargetCandidate(serverAvailable, () if serverAvailable else codes)
    return TargetDecision(
        selected=requiredTarget,
        browser=browser,
        server=server,
        local=TargetCandidate(True, ()),
    )


def _mergeEffects(effects: list[EffectSpec]) -> EffectSpec:
    return {
        "filesystemRead": sorted({item for effect in effects for item in effect["filesystemRead"]}),
        "filesystemWrite": sorted({item for effect in effects for item in effect["filesystemWrite"]}),
        "networkOrigins": sorted({item for effect in effects for item in effect["networkOrigins"]}),
        "process": any(effect["process"] for effect in effects),
        "gui": any(effect["gui"] for effect in effects),
        "secretRefs": sorted({item for effect in effects for item in effect["secretRefs"]}),
    }


def _fallbackSpans(document: CodaroDocument, displayPath: str) -> dict[str, SourceSpan]:
    return {
        block.id: {"path": displayPath, "startLine": index + 1, "endLine": index + 1}
        for index, block in enumerate(document.blocks)
    }


def _nodeSpan(blockSpan: SourceSpan, line: int | None, endLine: int | None) -> SourceSpan:
    if line is None:
        return dict(blockSpan)
    start = blockSpan["startLine"] + max(0, line - 1)
    end = blockSpan["startLine"] + max(0, (endLine or line) - 1)
    return {"path": blockSpan["path"], "startLine": start, "endLine": max(start, end)}


def _diagnostic(
    blockId: str,
    code: str,
    message: str,
    severity: Literal["info", "warning", "blocked"],
    sourceSpan: SourceSpan,
) -> CapabilityDiagnostic:
    return {
        "blockId": blockId,
        "code": code,
        "message": message,
        "severity": severity,
        "sourceSpan": sourceSpan,
    }


def _dedupeDiagnostics(diagnostics: list[CapabilityDiagnostic]) -> list[CapabilityDiagnostic]:
    unique = {
        (
            diagnostic["blockId"],
            diagnostic["code"],
            diagnostic["message"],
            diagnostic["severity"],
            diagnostic["sourceSpan"]["path"],
            diagnostic["sourceSpan"]["startLine"],
            diagnostic["sourceSpan"]["endLine"],
        ): diagnostic
        for diagnostic in diagnostics
    }
    return [unique[key] for key in sorted(unique)]


def _qualifiedName(node: ast.AST) -> str:
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        prefix = _qualifiedName(node.value)
        return f"{prefix}.{node.attr}" if prefix else node.attr
    if isinstance(node, ast.Call):
        return _qualifiedName(node.func)
    return ""


def _literalString(node: ast.AST | None) -> str | None:
    return node.value if isinstance(node, ast.Constant) and isinstance(node.value, str) else None


def _literalPath(node: ast.AST | None) -> str | None:
    direct = _literalString(node)
    if direct is not None:
        return direct
    if isinstance(node, ast.Call) and _qualifiedName(node.func) in {"Path", "pathlib.Path"} and node.args:
        return _literalString(node.args[0])
    return None


def _pathReceiver(function: ast.AST, args: list[ast.AST]) -> ast.AST | None:
    if isinstance(function, ast.Attribute):
        receiver = function.value
        if isinstance(receiver, ast.Call) and _qualifiedName(receiver.func) in {"Path", "pathlib.Path"}:
            return receiver
    return args[0] if args else None


def _keywordString(node: ast.Call, name: str) -> str | None:
    return next((_literalString(keyword.value) for keyword in node.keywords if keyword.arg == name), None)


def _urlOrigin(value: str | None) -> str:
    if not value:
        return "dynamic"
    parsed = urlsplit(value)
    return f"{parsed.scheme}://{parsed.netloc}" if parsed.scheme and parsed.netloc else "dynamic"


def _packageName(requirement: str) -> str:
    raw = re.split(r"[<>=!~\[; ]", requirement.strip(), maxsplit=1)[0]
    return raw.lower().replace("_", "-")


def _canonicalPackageLock(packageLock: Mapping[str, Any] | None) -> dict[str, Any]:
    return {
        _packageName(str(key)): value
        for key, value in sorted((packageLock or {}).items(), key=lambda item: str(item[0]).lower())
    }


def _canonicalBytes(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _contentHash(payload: bytes) -> str:
    return f"{_HASH_PREFIX}{hashlib.sha256(payload).hexdigest()}"
