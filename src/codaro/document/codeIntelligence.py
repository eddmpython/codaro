from __future__ import annotations

import keyword
from pathlib import Path, PurePosixPath
from tempfile import TemporaryDirectory
from threading import RLock
from typing import Any, Literal, NotRequired, TypedDict, get_args

import jedi

analysisLock = RLock()

AnalysisOperation = Literal["complete", "definition", "references", "rename", "hover", "signature", "diagnostics"]


class EditorFile(TypedDict):
    path: str
    source: str


EditorLocation = TypedDict("EditorLocation", {"path": str, "line": int, "from": int, "to": int, "name": str})
EditorEdit = TypedDict("EditorEdit", {**EditorLocation.__annotations__, "text": str})


class AnalysisItem(TypedDict, total=False):
    label: str
    insertText: str
    kind: str
    detail: str
    name: str
    description: str
    documentation: str


class AnalysisSignature(TypedDict):
    label: str
    activeParameter: int | None
    parameters: list[str]


AnalysisDiagnostic = TypedDict("AnalysisDiagnostic", {"line": int, "from": int, "message": str, "severity": Literal["error"]})


class AnalysisResponse(TypedDict):
    version: str
    operation: AnalysisOperation
    locations: NotRequired[list[EditorLocation]]
    edits: NotRequired[list[EditorEdit]]
    items: NotRequired[list[AnalysisItem]]
    signatures: NotRequired[list[AnalysisSignature]]
    diagnostics: NotRequired[list[AnalysisDiagnostic]]


RepairChange = TypedDict("RepairChange", {"from": int, "to": int, "before": str, "after": str})


class RepairProposal(TypedDict):
    version: str
    blockId: str
    source: str
    changes: list[RepairChange]
    explanation: str
    provider: str
    model: str


EDITOR_CONTRACT_TYPES = {"AnalysisOperation": AnalysisOperation, **{
    value.__name__: value for value in (
        EditorFile, EditorLocation, EditorEdit, AnalysisItem, AnalysisSignature,
        AnalysisDiagnostic, AnalysisResponse, RepairChange, RepairProposal,
    )
}}


class CodeIntelligenceError(ValueError):
    pass


def codePointColumn(text: str, utf16Column: int) -> int:
    if utf16Column < 0:
        raise CodeIntelligenceError("커서 위치가 올바르지 않습니다.")
    units = 0
    for index, character in enumerate(text):
        if units == utf16Column:
            return index
        units += 2 if ord(character) > 0xFFFF else 1
        if units > utf16Column:
            raise CodeIntelligenceError("커서가 문자 중간을 가리킵니다.")
    if units != utf16Column:
        raise CodeIntelligenceError("커서가 줄 길이를 벗어났습니다.")
    return len(text)


def utf16Column(text: str, column: int) -> int:
    return len(text[:column].encode("utf-16-le")) // 2


def safeSourcePath(value: Any) -> str:
    if not isinstance(value, str) or not value or "\\" in value or ":" in value or any(ord(character) < 32 for character in value):
        raise CodeIntelligenceError("분석 파일 경로가 올바르지 않습니다.")
    path = PurePosixPath(value)
    if path.is_absolute() or any(part in {".", ".."} for part in value.split("/")):
        raise CodeIntelligenceError("분석 파일은 작업 공간 안에 있어야 합니다.")
    if path.suffix != ".py":
        raise CodeIntelligenceError("Python 파일만 분석할 수 있습니다.")
    return path.as_posix()


def analyzeCode(request: dict[str, Any]) -> dict[str, Any]:
    with analysisLock:
        return analyzeDocument(request)


def analyzeDocument(request: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(request.get("version"), str):
        raise CodeIntelligenceError("분석할 문서 버전이 필요합니다.")
    files = request.get("files")
    if not isinstance(files, list) or not 1 <= len(files) <= 200:
        raise CodeIntelligenceError("분석할 Python 파일이 필요합니다.")
    sources: dict[str, str] = {}
    for file in files:
        if not isinstance(file, dict) or not isinstance(file.get("source"), str):
            raise CodeIntelligenceError("분석 문서 형식이 올바르지 않습니다.")
        path = safeSourcePath(file.get("path"))
        if path.casefold() in {existing.casefold() for existing in sources}:
            raise CodeIntelligenceError("분석 파일 경로가 중복되었습니다.")
        sources[path] = file["source"]
    try:
        sourceBytes = sum(len(source.encode("utf-8")) for source in sources.values())
    except UnicodeEncodeError as exc:
        raise CodeIntelligenceError("분석 코드에 올바르지 않은 문자가 있습니다.") from exc
    if sourceBytes > 2_000_000:
        raise CodeIntelligenceError("한 번에 분석할 코드 크기를 초과했습니다.")
    path = safeSourcePath(request.get("path"))
    if path not in sources:
        raise CodeIntelligenceError("현재 파일이 분석 문서에 없습니다.")
    source = sources[path]
    lines = source.split("\n")
    line = request.get("line", 1)
    character = request.get("character", 0)
    if type(line) is not int or type(character) is not int or not 1 <= line <= len(lines):
        raise CodeIntelligenceError("커서 위치가 올바르지 않습니다.")
    column = codePointColumn(lines[line - 1], character)
    operation = request.get("operation")
    if operation not in get_args(AnalysisOperation):
        raise CodeIntelligenceError("지원하지 않는 코드 분석 요청입니다.")
    with TemporaryDirectory(prefix="codaro-analysis-") as temporary:
        root = Path(temporary)
        for relativePath, content in sources.items():
            target = root / relativePath
            try:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(content, encoding="utf-8")
            except (OSError, ValueError) as exc:
                raise CodeIntelligenceError("분석 파일을 준비하지 못했습니다. 파일 경로를 확인하세요.") from exc
        project = jedi.Project(root, added_sys_path=[str(root)], smart_sys_path=False)
        script = jedi.Script(source, path=root / path, project=project)
        result = analyzeScript(script, operation, line, column, request, root, sources)
    return {"version": request.get("version"), "operation": operation, **result}


def analyzeScript(script, operation, line, column, request, root, sources) -> dict[str, Any]:
    def location(name):
        if name.module_path is None or name.line is None or name.column is None:
            return None
        try:
            path = Path(name.module_path).relative_to(root).as_posix()
        except ValueError:
            return None
        if path not in sources:
            return None
        text = sources[path].split("\n")[name.line - 1]
        return {
            "path": path,
            "line": name.line,
            "from": utf16Column(text, name.column),
            "to": utf16Column(text, name.column + len(name.name)),
            "name": name.name,
        }

    if operation == "complete":
        return {"items": [{
            "label": item.name,
            "insertText": item.complete,
            "kind": item.type,
            "detail": item.description,
        } for item in script.complete(line, column)[:80]]}
    if operation in {"definition", "references", "rename"}:
        if operation == "definition":
            names = script.goto(line, column, follow_imports=True)
        else:
            names = script.get_references(line, column, scope="project")
        locations = [value for name in names if (value := location(name)) is not None]
        if operation == "rename":
            newName = request.get("newName")
            if not isinstance(newName, str) or not newName.isidentifier() or keyword.iskeyword(newName):
                raise CodeIntelligenceError("새 이름은 Python 식별자여야 합니다.")
            definitions = script.goto(line, column, follow_imports=True)
            if not locations or not any(location(name) is not None for name in definitions):
                raise CodeIntelligenceError("변경할 이름의 정의를 찾지 못했습니다.")
            return {"edits": [{**item, "text": newName} for item in locations]}
        return {"locations": locations}
    if operation == "signature":
        return {"signatures": [{
            "label": item.to_string(),
            "activeParameter": item.index,
            "parameters": [parameter.description for parameter in item.params],
        } for item in script.get_signatures(line, column)]}
    if operation == "hover":
        return {"items": [{
            "name": item.name,
            "kind": item.type,
            "description": item.description,
            "documentation": item.docstring(raw=True)[:4000],
        } for item in script.infer(line, column)]}
    return {"diagnostics": [{
        "line": error.line,
        "from": utf16Column(sources[safeSourcePath(request["path"])].split("\n")[error.line - 1], error.column),
        "message": error.get_message(),
        "severity": "error",
    } for error in script.get_syntax_errors()]}
