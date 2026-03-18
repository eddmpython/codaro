from __future__ import annotations

import ast
import asyncio
import base64
import ctypes
import inspect
import io
import os
from pathlib import Path
import threading
import traceback
import uuid
from concurrent.futures import ThreadPoolExecutor
from contextlib import redirect_stderr, redirect_stdout
from typing import Sequence

from ..document.analysis import analyzeCode
from ..outputDescriptor import isDescriptorPayload
from ..system import fileOps, packageOps
from .executionEngine import ExecutionBlock, ExecutionEngine, ExecutionResult, VariableState


EXECUTION_LOCK = threading.RLock()


class LocalEngine(ExecutionEngine):
    def __init__(
        self,
        *,
        workingDirectory: str | Path | None = None,
        workspaceRoot: str | Path | None = None,
        engineId: str | None = None,
    ) -> None:
        self.engineId = engineId or f"engine-{uuid.uuid4().hex[:10]}"
        self.executionCount = 0
        self.status = "idle"
        self._executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix=f"engine-{self.engineId[:8]}")
        self._executionThread: threading.Thread | None = None
        self._workspaceRoot = _resolvePath(workspaceRoot) or Path.cwd().resolve()
        self._workingDirectory = _resolvePath(workingDirectory)

        self._registry: dict[str, object] = {}
        self._cellDefinitions: dict[str, set[str]] = {}

    async def initialize(self) -> None:
        return

    async def executeBlock(
        self,
        code: str,
        *,
        blockId: str | None = None,
        injectedVars: list[str] | None = None,
    ) -> ExecutionResult:
        loop = asyncio.get_running_loop()

        def wrapper() -> ExecutionResult:
            self._executionThread = threading.current_thread()
            return self._executeSync(code, blockId=blockId, injectedVars=injectedVars)

        return await loop.run_in_executor(self._executor, wrapper)

    async def executeAll(self, blocks: Sequence[ExecutionBlock]) -> list[ExecutionResult]:
        results: list[ExecutionResult] = []
        for block in blocks:
            result = await self.executeBlock(
                block.code,
                blockId=block.blockId,
                injectedVars=block.injectedVars,
            )
            results.append(result)
            if result.status == "error":
                break
        return results

    def interrupt(self) -> bool:
        thread = self._executionThread
        if thread is None or not thread.is_alive():
            return False
        tid = thread.ident
        if tid is None:
            return False
        result = ctypes.pythonapi.PyThreadState_SetAsyncExc(
            ctypes.c_ulong(tid),
            ctypes.py_object(KeyboardInterrupt),
        )
        return result == 1

    def getVariables(self) -> list[VariableState]:
        variables: list[VariableState] = []
        for name, value in self._registry.items():
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
                VariableState(
                    name=name,
                    typeName=type(value).__name__,
                    repr=valueRepr,
                    size=size,
                )
            )
        return variables

    async def getFiles(self, path: str = ".") -> fileOps.DirectoryListing:
        return await fileOps.listDirectory(path, workspaceRoot=self._workspaceRoot)

    async def readFile(self, path: str, *, encoding: str = "utf-8") -> fileOps.FileContent:
        return await fileOps.readFile(path, encoding=encoding, workspaceRoot=self._workspaceRoot)

    async def writeFile(
        self,
        path: str,
        content: str,
        *,
        encoding: str = "utf-8",
        createDirectories: bool = True,
    ) -> str:
        return await fileOps.writeFile(
            path,
            content,
            encoding=encoding,
            createDirectories=createDirectories,
            workspaceRoot=self._workspaceRoot,
        )

    async def listPackages(self) -> list[packageOps.PackageInfo]:
        return await packageOps.listPackages()

    async def installPackage(self, packageName: str) -> packageOps.InstallResult:
        return await packageOps.installPackage(packageName)

    async def uninstallPackage(self, packageName: str) -> packageOps.InstallResult:
        return await packageOps.uninstallPackage(packageName)

    def removeBlockDefinitions(self, blockId: str) -> None:
        oldDefs = self._cellDefinitions.pop(blockId, set())
        for var in oldDefs:
            if any(var in otherDefs for otherDefs in self._cellDefinitions.values()):
                continue
            self._registry.pop(var, None)

    def reset(self) -> None:
        self._registry.clear()
        self._cellDefinitions.clear()
        self.executionCount = 0
        self.status = "idle"

    def dispose(self) -> None:
        self._registry.clear()
        self._cellDefinitions.clear()
        self._executor.shutdown(wait=False)

    def _executeSync(
        self,
        code: str,
        *,
        blockId: str | None = None,
        injectedVars: list[str] | None = None,
    ) -> ExecutionResult:
        self.executionCount += 1
        self.status = "busy"

        cellScope: dict[str, object] = {
            "__builtins__": __builtins__,
            "__name__": "__main__",
        }

        if injectedVars is not None:
            for var in injectedVars:
                if var in self._registry:
                    cellScope[var] = self._registry[var]
        else:
            cellScope.update(self._registry)

        stdoutBuf = io.StringIO()
        stderrBuf = io.StringIO()
        resultData: object = ""
        resultType = "text"
        resultStatus = "done"

        with EXECUTION_LOCK:
            previousCwd = os.getcwd()
            targetCwd = self._workingDirectory or self._workspaceRoot
            if targetCwd is not None:
                try:
                    os.chdir(targetCwd)
                except OSError:
                    pass

            try:
                tree = ast.parse(code)

                lastExpr = None
                if tree.body and isinstance(tree.body[-1], ast.Expr):
                    lastExpr = tree.body.pop()

                if tree.body:
                    module = ast.copy_location(
                        ast.Module(body=tree.body, type_ignores=[]),
                        tree,
                    )
                    ast.fix_missing_locations(module)
                    compiled = compile(module, "<codaro>", "exec")
                    with redirect_stdout(stdoutBuf), redirect_stderr(stderrBuf):
                        exec(compiled, cellScope)

                if lastExpr:
                    exprAst = ast.Expression(body=lastExpr.value)
                    ast.copy_location(exprAst, lastExpr)
                    ast.fix_missing_locations(exprAst)
                    exprCode = compile(exprAst, "<codaro>", "eval")
                    with redirect_stdout(stdoutBuf), redirect_stderr(stderrBuf):
                        value = eval(exprCode, cellScope)

                    if value is not None:
                        resultType, resultData = _normalizeResult(value)

            except KeyboardInterrupt:
                resultStatus = "error"
                resultType = "error"
                resultData = "Execution interrupted."
            except SyntaxError as syntaxError:
                resultStatus = "error"
                resultType = "error"
                resultData = _formatSyntaxError(syntaxError)
            except Exception:
                resultStatus = "error"
                resultType = "error"
                resultData = traceback.format_exc()
            finally:
                self.status = "idle"
                self._executionThread = None
                try:
                    os.chdir(previousCwd)
                except OSError:
                    pass

        effectiveBlockId = blockId or f"_anon_{self.executionCount}"
        if resultStatus != "error":
            self._updateRegistry(effectiveBlockId, code, cellScope)

        return ExecutionResult(
            type=resultType,
            data=resultData,
            stdout=stdoutBuf.getvalue(),
            stderr=stderrBuf.getvalue(),
            variables=self.getVariables(),
            executionCount=self.executionCount,
            status=resultStatus,
        )

    def _updateRegistry(self, blockId: str, code: str, cellScope: dict[str, object]) -> None:
        defines, _ = analyzeCode(code)

        oldDefs = self._cellDefinitions.get(blockId, set())
        for var in oldDefs:
            ownerStillValid = any(
                var in otherDefs
                for otherId, otherDefs in self._cellDefinitions.items()
                if otherId != blockId
            )
            if ownerStillValid:
                continue
            self._registry.pop(var, None)

        newDefs: set[str] = set()
        for var in defines:
            if var in cellScope and var not in ("__builtins__", "__name__"):
                self._registry[var] = cellScope[var]
                newDefs.add(var)

        self._cellDefinitions[blockId] = newDefs


def _resolvePath(pathLike: str | Path | None) -> Path | None:
    if pathLike is None:
        return None
    return Path(pathLike).expanduser().resolve()


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
