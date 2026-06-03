from __future__ import annotations

import ast
import base64
from contextlib import redirect_stderr, redirect_stdout
import importlib
import inspect
import io
import os
from pathlib import Path
import sys
import traceback
from typing import Any

# numpy/scipy/scikit-learn이 쓰는 OpenBLAS는 기본적으로 CPU 코어 수만큼 스레드 버퍼를 미리
# 잡는다. spawn으로 만든 worker(특히 여러 세션이 동시에 떠 있을 때)에서는 이 할당이 실패해
# "OpenBLAS error: Memory allocation still failed"로 프로세스가 죽고, 셀이 EOFError로 끝난다.
# 스레드 수를 1로 제한하고 matplotlib을 headless(Agg)로 고정해 데이터 라이브러리가 worker에서
# 안전하게 import되도록 한다. numpy import보다 먼저 설정되어야 하므로 모듈 최상단에 둔다.
# 사용자가 명시한 값은 보존한다(setdefault). spawn 자식은 이 모듈을 다시 import하므로 자식에도,
# 부모 백엔드도 이 모듈을 import하므로 부모에도 동일하게 적용된다.
for _threadVar in ("OPENBLAS_NUM_THREADS", "OMP_NUM_THREADS", "MKL_NUM_THREADS", "NUMEXPR_NUM_THREADS"):
    os.environ.setdefault(_threadVar, "1")
os.environ.setdefault("MPLBACKEND", "Agg")

from ..document.analysis import analyzeCode
from ..errorGuard import safeRepr
from ..outputDescriptor import isDescriptorPayload
from ..uiValue import beginBlock, resetStore


def runLocalWorker(
    connection,
    *,
    workingDirectory: str | None,
    workspaceRoot: str | None,
    interruptFlag=None,
) -> None:
    registry: dict[str, object] = {}
    cellDefinitions: dict[str, set[str]] = {}
    executionCount = 0
    targetCwd = _resolveTargetCwd(workingDirectory, workspaceRoot)

    if interruptFlag is not None:
        _installInterruptTrace(interruptFlag)

    while True:
        try:
            command = connection.recv()
        except (EOFError, OSError):
            _uninstallInterruptTrace(interruptFlag)
            break

        try:
            action = command.get("action")
            if action == "shutdown":
                _workerSend(connection, {"ok": True})
                _uninstallInterruptTrace(interruptFlag)
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

                try:
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
                except KeyboardInterrupt:
                    if interruptFlag is not None:
                        interruptFlag.clear()
                    response = _buildInterruptedResponse(registry, cellDefinitions, executionCount)
                    emitEvent(
                        "display",
                        {
                            "outputType": "error",
                            "data": response["data"],
                        },
                    )
                    emitEvent(
                        "finished",
                        {
                            "status": response["status"],
                            "outputType": response["type"],
                        },
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
                resetStore()
                executionCount = 0
                _workerSend(connection, _buildStateResponse(registry, cellDefinitions, executionCount))
                continue

            if action == "resetVariables":
                import types as _types
                for name in list(registry.keys()):
                    value = registry[name]
                    if callable(value) or isinstance(value, (type, _types.ModuleType)):
                        continue
                    registry.pop(name, None)
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
            _uninstallInterruptTrace(interruptFlag)
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

    # 위젯 위치 카운터 리셋 + 현재 blockId 설정 — 이 블록에서 만드는 ui.* 위젯이
    # {blockId}#{index} 안정 id를 받아 값이 셀 재실행에도 영속한다.
    beginBlock(blockId)

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
        importlib.invalidate_caches()

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
    except Exception:  # noqa: BLE001 — user code execution
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


def _buildInterruptedResponse(
    registry: dict[str, object],
    cellDefinitions: dict[str, set[str]],
    executionCount: int,
) -> dict[str, Any]:
    response = _buildStateResponse(registry, cellDefinitions, executionCount)
    response["stateDelta"] = {
        "added": [],
        "updated": [],
        "removed": [],
    }
    response.update(
        {
            "type": "error",
            "data": "Execution interrupted.",
            "stdout": "",
            "stderr": "",
            "status": "error",
        }
    )
    return response


def _buildRegistryMirror(registry: dict[str, object]) -> dict[str, object]:
    snapshot: dict[str, object] = {}
    for name, value in registry.items():
        if not _isSerializable(value):
            continue
        snapshot[name] = value
    return snapshot


_SERIALIZABLE_PRIMITIVES = (int, float, str, bool, bytes, type(None), complex)


def _isSerializable(value: object) -> bool:
    if isinstance(value, _SERIALIZABLE_PRIMITIVES):
        return True
    if isinstance(value, (list, tuple, set, frozenset, dict)):
        return True
    if inspect.ismodule(value) or inspect.isfunction(value) or inspect.isclass(value):
        return False
    moduleName = type(value).__module__
    if moduleName.startswith("pandas") or moduleName.startswith("numpy"):
        return True
    # Reject instances of classes defined in the cell scope (__main__):
    # they pickle-fail when sent across the multiprocessing boundary because
    # the class object itself isn't importable from the parent process.
    if moduleName == "__main__":
        return False
    if hasattr(value, "__dict__") or hasattr(value, "__slots__"):
        return True
    return False


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

        valueRepr = safeRepr(value)

        size = _estimateSize(value)
        shape, dtype = _introspectShapeDtype(value)

        variables.append(
            {
                "name": name,
                "typeName": type(value).__name__,
                "repr": valueRepr,
                "size": size,
                "shape": shape,
                "dtype": dtype,
            }
        )
    return variables


def _introspectShapeDtype(value: object) -> tuple[str, str]:
    """numpy/pandas/polars 값의 shape/dtype를 문자열로 포착(없으면 빈 문자열).

    Predict-Run-Reconcile 루프의 shape/dtype 차원 입력. getattr만 쓰므로
    임의 사용자 객체에서도 예외 없이 안전하다(shape/dtype 미보유 → "").
    """
    moduleName = type(value).__module__
    if not moduleName.startswith(("numpy", "pandas", "polars")):
        return "", ""
    shape = ""
    rawShape = getattr(value, "shape", None)
    if isinstance(rawShape, tuple):
        shape = str(rawShape)
    dtype = ""
    rawDtype = getattr(value, "dtype", None)
    if rawDtype is not None:
        dtype = str(rawDtype)
    return shape, dtype


def _estimateSize(value: object) -> int | None:
    moduleName = type(value).__module__
    typeName = type(value).__name__
    if moduleName.startswith("numpy") and hasattr(value, "nbytes"):
        return int(value.nbytes)
    if moduleName.startswith("pandas"):
        if hasattr(value, "memory_usage"):
            try:
                usage = value.memory_usage(deep=True)
                return int(usage.sum()) if hasattr(usage, "sum") else int(usage)
            except Exception:  # noqa: BLE001 — user object method
                pass
    try:
        return len(value)
    except TypeError:
        return None


def _mapVariablesByName(variables: list[dict[str, object]]) -> dict[str, dict[str, object]]:
    return {
        str(variable["name"]): {
            "name": str(variable["name"]),
            "typeName": str(variable.get("typeName", "")),
            "repr": str(variable.get("repr", "")),
            "size": variable.get("size"),
            "shape": str(variable.get("shape", "")),
            "dtype": str(variable.get("dtype", "")),
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

    uiValuePayload = _serializeUiValue(value)
    if uiValuePayload is not None:
        return "layout", uiValuePayload

    descriptorPayload = _serializeDescriptor(value)
    if descriptorPayload is not None:
        return "layout", descriptorPayload

    if hasattr(value, "_repr_html_"):
        try:
            return "html", value._repr_html_()
        except Exception:  # noqa: BLE001 — user object method
            return "text", repr(value)

    return "text", repr(value)


def _serializePng(value: object) -> str | None:
    if not hasattr(value, "_repr_png_"):
        return None

    try:
        pngData = value._repr_png_()
    except Exception:  # noqa: BLE001 — user object method
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

    if moduleName.startswith("pandas"):
        frame = value
        if typeName == "Series" and hasattr(value, "to_frame"):
            try:
                frame = value.to_frame()
            except Exception:  # noqa: BLE001 — user object method
                return None
        if not hasattr(frame, "to_dict") or not hasattr(frame, "columns") or not hasattr(frame, "index"):
            return None
        try:
            records = frame.to_dict(orient="records")
            totalRows = len(frame)
            columns = [str(column) for column in list(frame.columns)]
            visibleRows = records[:200]
            indexValues = [str(indexValue) for indexValue in list(frame.index)[: len(visibleRows)]]
        except Exception:  # noqa: BLE001 — user object method
            return None
        return {
            "columns": columns,
            "rows": visibleRows,
            "index": indexValues,
            "totalRows": totalRows,
            "truncated": totalRows > len(visibleRows),
            "typeName": typeName,
        }

    if moduleName.startswith("polars"):
        frame = value
        if typeName == "Series" and hasattr(value, "to_frame"):
            try:
                frame = value.to_frame()
            except Exception:  # noqa: BLE001 — user object method
                return None
        if not hasattr(frame, "to_dicts") or not hasattr(frame, "columns"):
            return None
        try:
            records = frame.to_dicts()
            totalRows = len(frame)
            columns = [str(column) for column in list(frame.columns)]
            visibleRows = records[:200]
            indexValues = [str(rowIndex) for rowIndex in range(len(visibleRows))]
        except Exception:  # noqa: BLE001 — user object method
            return None
        return {
            "columns": columns,
            "rows": visibleRows,
            "index": indexValues,
            "totalRows": totalRows,
            "truncated": totalRows > len(visibleRows),
            "typeName": typeName,
        }

    return None


def _serializeUiValue(value: object) -> dict[str, object] | None:
    """UiValue(리액티브 위젯 값 객체)를 descriptor로 직렬화한다(없으면 None).

    객체의 `codaroDescriptor()`가 기존 ui descriptor 형태({type:ui, component, value, elementId})를
    내고, 그걸 표준 descriptor 직렬화에 태워 프론트 렌더를 불변으로 유지한다.
    """
    builder = getattr(value, "codaroDescriptor", None)
    if not callable(builder):
        return None
    descriptor = builder()
    if not isDescriptorPayload(descriptor):
        return None
    return _sanitizeDescriptor(descriptor)


def _serializeDescriptor(value: object) -> dict[str, object] | None:
    if not isDescriptorPayload(value):
        return None
    return _sanitizeDescriptor(value)


def _sanitizeDescriptor(value: object) -> object:
    # layout(hstack/tabs/...) 안에 중첩된 UiValue(위젯 값 객체)를 descriptor로 변환.
    builder = getattr(value, "codaroDescriptor", None)
    if callable(builder):
        return _sanitizeDescriptor(builder())
    if isinstance(value, dict):
        return {str(key): _sanitizeDescriptor(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_sanitizeDescriptor(item) for item in value]
    if isinstance(value, tuple):
        return [_sanitizeDescriptor(item) for item in value]
    if isinstance(value, set):
        return [_sanitizeDescriptor(item) for item in sorted(value, key=str)]
    return value


def _installInterruptTrace(interruptFlag) -> None:
    def traceCallback(frame, event, arg):
        if frame.f_code.co_filename == "<codaro>" and _interruptFlagIsSet(interruptFlag):
            raise KeyboardInterrupt("Soft interrupt requested")
        return traceCallback
    sys.settrace(traceCallback)


def _uninstallInterruptTrace(interruptFlag) -> None:
    if interruptFlag is not None:
        sys.settrace(None)


def _interruptFlagIsSet(interruptFlag) -> bool:
    try:
        return bool(interruptFlag.is_set())
    except OSError:
        return False


STREAM_BUFFER_MAX_BYTES = 5 * 1024 * 1024


class _StreamingTextBuffer(io.StringIO):
    def __init__(self, eventType: str, emitEvent) -> None:
        super().__init__()
        self._eventType = eventType
        self._emitEvent = emitEvent
        self._totalBytes = 0

    def write(self, text: str) -> int:
        content = str(text)
        contentBytes = len(content.encode("utf-8", errors="replace"))
        if self._totalBytes + contentBytes > STREAM_BUFFER_MAX_BYTES:
            remaining = STREAM_BUFFER_MAX_BYTES - self._totalBytes
            if remaining <= 0:
                return len(content)
            content = content[:remaining]
            contentBytes = remaining
        self._totalBytes += contentBytes
        written = super().write(content)
        if content:
            self._emitEvent(self._eventType, {"text": content})
        return written
