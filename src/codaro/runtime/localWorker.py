from __future__ import annotations

import ast
import base64
from contextlib import redirect_stderr, redirect_stdout
import inspect
import io
import os
import pickle
from pathlib import Path
import traceback
from typing import Any

from ..document.analysis import analyzeCode
from ..outputDescriptor import isDescriptorPayload


def runLocalWorker(connection, *, workingDirectory: str | None, workspaceRoot: str | None) -> None:
    registry: dict[str, object] = {}
    cellDefinitions: dict[str, set[str]] = {}
    executionCount = 0
    targetCwd = _resolveTargetCwd(workingDirectory, workspaceRoot)

    while True:
        try:
            command = connection.recv()
        except (EOFError, OSError):
            break

        try:
            action = command.get("action")
            if action == "shutdown":
                _workerSend(connection, {"ok": True})
                break

            if action == "execute":
                executionCount += 1
                blockId = command.get("blockId")
                sequence = 0

                def emitEvent(eventType: str, payload: Any = None) -> None:
                    nonlocal sequence
                    sequence += 1
                    _workerSend(
                        connection,
                        {
                            "kind": "event",
                            "event": {
                                "sequence": sequence,
                                "eventType": eventType,
                                "blockId": blockId,
                                "executionCount": executionCount,
                                "payload": payload,
                            },
                        },
                    )

                response = _executeCommand(
                    code=command["code"],
                    blockId=blockId,
                    injectedVars=command.get("injectedVars"),
                    registry=registry,
                    cellDefinitions=cellDefinitions,
                    executionCount=executionCount,
                    targetCwd=targetCwd,
                    emitEvent=emitEvent,
                )
                _workerSend(connection, {"kind": "response", "response": response})
                continue

            if action == "removeDefinitions":
                _removeBlockDefinitions(command["blockId"], registry, cellDefinitions)
                _workerSend(connection, _buildStateResponse(registry, cellDefinitions, executionCount))
                continue

            if action == "reset":
                registry.clear()
                cellDefinitions.clear()
                executionCount = 0
                _workerSend(connection, _buildStateResponse(registry, cellDefinitions, executionCount))
                continue

            if action == "getVariables":
                _workerSend(
                    connection,
                    {
                        "variables": _collectVariables(registry),
                        "executionCount": executionCount,
                    },
                )
                continue

            _workerSend(connection, {"error": f"Unsupported worker action: {action}"})
        except (BrokenPipeError, EOFError, OSError):
            break


def _workerSend(connection, data: Any) -> None:
    try:
        connection.send(data)
    except (BrokenPipeError, EOFError, OSError):
        raise


def _executeCommand(
    *,
    code: str,
    blockId: str | None,
    injectedVars: list[str] | None,
    registry: dict[str, object],
    cellDefinitions: dict[str, set[str]],
    executionCount: int,
    targetCwd: Path | None,
    emitEvent,
) -> dict[str, Any]:
    cellScope: dict[str, object] = {
        "__builtins__": __builtins__,
        "__name__": "__main__",
    }

    if injectedVars is not None:
        for var in injectedVars:
            if var in registry:
                cellScope[var] = registry[var]
    else:
        cellScope.update(registry)

    emitEvent("started", {"status": "running"})

    beforeVariables = _mapVariablesByName(_collectVariables(registry))
    stdoutBuf = _StreamingTextBuffer("stdout", emitEvent)
    stderrBuf = _StreamingTextBuffer("stderr", emitEvent)
    resultData: object = ""
    resultType = "text"
    resultStatus = "done"
    hasDisplay = False

    try:
        if targetCwd is not None:
            os.chdir(targetCwd)

        tree = ast.parse(code)
        lastExpr = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            lastExpr = tree.body.pop()

        if tree.body:
            module = ast.copy_location(ast.Module(body=tree.body, type_ignores=[]), tree)
            ast.fix_missing_locations(module)
            compiled = compile(module, "<codaro>", "exec")
            with redirect_stdout(stdoutBuf), redirect_stderr(stderrBuf):
                exec(compiled, cellScope)

        if lastExpr is not None:
            exprAst = ast.Expression(body=lastExpr.value)
            ast.copy_location(exprAst, lastExpr)
            ast.fix_missing_locations(exprAst)
            exprCode = compile(exprAst, "<codaro>", "eval")
            with redirect_stdout(stdoutBuf), redirect_stderr(stderrBuf):
                value = eval(exprCode, cellScope)

            if value is not None:
                resultType, resultData = _normalizeResult(value)
                hasDisplay = True
    except SyntaxError as syntaxError:
        resultStatus = "error"
        resultType = "error"
        resultData = _formatSyntaxError(syntaxError)
        hasDisplay = True
    except Exception:
        resultStatus = "error"
        resultType = "error"
        resultData = traceback.format_exc()
        hasDisplay = True

    effectiveBlockId = blockId or f"_anon_{executionCount}"
    if resultStatus != "error":
        _updateRegistry(
            blockId=effectiveBlockId,
            code=code,
            cellScope=cellScope,
            registry=registry,
            cellDefinitions=cellDefinitions,
        )

    response = _buildStateResponse(registry, cellDefinitions, executionCount)
    stateDelta = _buildVariableDelta(beforeVariables, response["variables"])
    response["stateDelta"] = stateDelta
    response.update(
        {
            "type": resultType,
            "data": resultData,
            "stdout": stdoutBuf.getvalue(),
            "stderr": stderrBuf.getvalue(),
            "status": resultStatus,
        }
    )

    if hasDisplay:
        emitEvent(
            "display",
            {
                "outputType": resultType,
                "data": resultData,
            },
        )
    if _hasVariableDelta(stateDelta):
        emitEvent("stateDelta", stateDelta)
    emitEvent(
        "finished",
        {
            "status": resultStatus,
            "outputType": resultType,
        },
    )
    return response


def _buildStateResponse(
    registry: dict[str, object],
    cellDefinitions: dict[str, set[str]],
    executionCount: int,
) -> dict[str, Any]:
    return {
        "variables": _collectVariables(registry),
        "registryMirror": _buildRegistryMirror(registry),
        "cellDefinitions": {blockId: sorted(defines) for blockId, defines in cellDefinitions.items()},
        "executionCount": executionCount,
    }


def _buildRegistryMirror(registry: dict[str, object]) -> dict[str, object]:
    snapshot: dict[str, object] = {}
    for name, value in registry.items():
        if not _isPickleable(value):
            continue
        snapshot[name] = value
    return snapshot


def _isPickleable(value: object) -> bool:
    try:
        pickle.dumps(value)
    except Exception:
        return False
    return True


def _removeBlockDefinitions(
    blockId: str,
    registry: dict[str, object],
    cellDefinitions: dict[str, set[str]],
) -> None:
    oldDefs = cellDefinitions.pop(blockId, set())
    for var in oldDefs:
        if any(var in otherDefs for otherDefs in cellDefinitions.values()):
            continue
        registry.pop(var, None)


def _updateRegistry(
    *,
    blockId: str,
    code: str,
    cellScope: dict[str, object],
    registry: dict[str, object],
    cellDefinitions: dict[str, set[str]],
) -> None:
    defines, _ = analyzeCode(code)
    oldDefs = cellDefinitions.get(blockId, set())

    for var in oldDefs:
        ownerStillValid = any(
            var in otherDefs
            for otherId, otherDefs in cellDefinitions.items()
            if otherId != blockId
        )
        if ownerStillValid:
            continue
        registry.pop(var, None)

    newDefs: set[str] = set()
    for var in defines:
        if var in cellScope and var not in ("__builtins__", "__name__"):
            registry[var] = cellScope[var]
            newDefs.add(var)

    cellDefinitions[blockId] = newDefs


def _resolveTargetCwd(workingDirectory: str | None, workspaceRoot: str | None) -> Path | None:
    target = workingDirectory or workspaceRoot
    if target is None:
        return None
    return Path(target).expanduser().resolve()


def _collectVariables(registry: dict[str, object]) -> list[dict[str, object]]:
    variables: list[dict[str, object]] = []
    for name, value in registry.items():
        if name.startswith("_"):
            continue
        if inspect.ismodule(value):
            continue

        try:
            valueRepr = repr(value)
            if len(valueRepr) > 300:
                valueRepr = valueRepr[:300] + "..."
        except Exception:
            valueRepr = f"<{type(value).__name__}>"

        size = None
        try:
            size = len(value)
        except TypeError:
            pass

        variables.append(
            {
                "name": name,
                "typeName": type(value).__name__,
                "repr": valueRepr,
                "size": size,
            }
        )
    return variables


def _mapVariablesByName(variables: list[dict[str, object]]) -> dict[str, dict[str, object]]:
    return {
        str(variable["name"]): {
            "name": str(variable["name"]),
            "typeName": str(variable.get("typeName", "")),
            "repr": str(variable.get("repr", "")),
            "size": variable.get("size"),
        }
        for variable in variables
    }


def _buildVariableDelta(
    beforeVariables: dict[str, dict[str, object]],
    afterVariables: list[dict[str, object]],
) -> dict[str, object]:
    afterMap = _mapVariablesByName(afterVariables)
    added: list[dict[str, object]] = []
    updated: list[dict[str, object]] = []
    removed: list[str] = []

    for name, variable in afterMap.items():
        before = beforeVariables.get(name)
        if before is None:
            added.append(variable)
            continue
        if before != variable:
            updated.append(variable)

    for name in beforeVariables:
        if name not in afterMap:
            removed.append(name)

    return {
        "added": added,
        "updated": updated,
        "removed": removed,
    }


def _hasVariableDelta(stateDelta: dict[str, object]) -> bool:
    added = stateDelta.get("added", [])
    updated = stateDelta.get("updated", [])
    removed = stateDelta.get("removed", [])
    return bool(added or updated or removed)


def _formatSyntaxError(error: SyntaxError) -> str:
    parts = [f"SyntaxError: {error.msg}"]
    if error.filename and error.lineno:
        parts.append(f"  File \"{error.filename}\", line {error.lineno}")
    if error.text:
        parts.append(f"    {error.text.rstrip()}")
        if error.offset:
            parts.append(f"    {' ' * (error.offset - 1)}^")
    return "\n".join(parts)


def _normalizeResult(value: object) -> tuple[str, object]:
    imagePayload = _serializePng(value)
    if imagePayload is not None:
        return "image", imagePayload

    dataframePayload = _serializeDataFrame(value)
    if dataframePayload is not None:
        return "dataframe", dataframePayload

    descriptorPayload = _serializeDescriptor(value)
    if descriptorPayload is not None:
        return "layout", descriptorPayload

    if hasattr(value, "_repr_html_"):
        try:
            return "html", value._repr_html_()
        except Exception:
            return "text", repr(value)

    return "text", repr(value)


def _serializePng(value: object) -> str | None:
    if not hasattr(value, "_repr_png_"):
        return None

    try:
        pngData = value._repr_png_()
    except Exception:
        return None

    if pngData is None:
        return None

    if isinstance(pngData, str):
        if pngData.startswith("data:image/png;base64,"):
            return pngData
        pngBytes = pngData.encode("utf-8")
    elif isinstance(pngData, bytes):
        pngBytes = pngData
    else:
        return None

    encoded = base64.b64encode(pngBytes).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def _serializeDataFrame(value: object) -> dict[str, object] | None:
    valueType = type(value)
    moduleName = valueType.__module__
    typeName = valueType.__name__
    if not moduleName.startswith("pandas"):
        return None

    frame = value
    if typeName == "Series" and hasattr(value, "to_frame"):
        try:
            frame = value.to_frame()
        except Exception:
            return None

    if not hasattr(frame, "to_dict") or not hasattr(frame, "columns") or not hasattr(frame, "index"):
        return None

    try:
        records = frame.to_dict(orient="records")
        totalRows = len(frame)
        columns = [str(column) for column in list(frame.columns)]
        visibleRows = records[:200]
        indexValues = [str(indexValue) for indexValue in list(frame.index)[: len(visibleRows)]]
    except Exception:
        return None

    return {
        "columns": columns,
        "rows": visibleRows,
        "index": indexValues,
        "totalRows": totalRows,
        "truncated": totalRows > len(visibleRows),
        "typeName": typeName,
    }


def _serializeDescriptor(value: object) -> dict[str, object] | None:
    if not isDescriptorPayload(value):
        return None
    return _sanitizeDescriptor(value)


def _sanitizeDescriptor(value: object) -> object:
    if isinstance(value, dict):
        return {str(key): _sanitizeDescriptor(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_sanitizeDescriptor(item) for item in value]
    if isinstance(value, tuple):
        return [_sanitizeDescriptor(item) for item in value]
    if isinstance(value, set):
        return [_sanitizeDescriptor(item) for item in sorted(value, key=str)]
    return value


class _StreamingTextBuffer(io.StringIO):
    def __init__(self, eventType: str, emitEvent) -> None:
        super().__init__()
        self._eventType = eventType
        self._emitEvent = emitEvent

    def write(self, text: str) -> int:
        content = str(text)
        written = super().write(content)
        if content:
            self._emitEvent(self._eventType, {"text": content})
        return written
