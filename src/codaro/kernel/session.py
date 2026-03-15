from __future__ import annotations

import ast
import asyncio
import ctypes
import inspect
import io
import os
import threading
import traceback
import uuid
from concurrent.futures import ThreadPoolExecutor
from contextlib import redirect_stderr, redirect_stdout

from ..document.analysis import analyzeCode
from .protocol import ExecutionOutput, VariableInfo


class KernelSession:
    def __init__(self, sessionId: str | None = None, workingDirectory: str | None = None):
        self.sessionId = sessionId or f"session-{uuid.uuid4().hex[:10]}"
        self.executionCount = 0
        self.status = "idle"
        self._executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix=f"kernel-{self.sessionId[:8]}")
        self._executionThread: threading.Thread | None = None
        self._workingDirectory = workingDirectory

        self._registry: dict[str, object] = {}
        self._cellDefinitions: dict[str, set[str]] = {}

    async def execute(
        self,
        code: str,
        blockId: str | None = None,
        injectedVars: list[str] | None = None,
    ) -> ExecutionOutput:
        loop = asyncio.get_event_loop()

        def wrapper():
            self._executionThread = threading.current_thread()
            return self._executeSync(code, blockId, injectedVars)

        return await loop.run_in_executor(self._executor, wrapper)

    def _executeSync(
        self,
        code: str,
        blockId: str | None = None,
        injectedVars: list[str] | None = None,
    ) -> ExecutionOutput:
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
        resultData = ""
        resultType = "text"
        resultStatus = "done"

        previousCwd = os.getcwd()
        if self._workingDirectory:
            try:
                os.chdir(self._workingDirectory)
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
                    if hasattr(value, "_repr_html_"):
                        try:
                            resultData = value._repr_html_()
                            resultType = "html"
                        except Exception:
                            resultData = repr(value)
                    else:
                        resultData = repr(value)

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

        return ExecutionOutput(
            type=resultType,
            blockId=blockId,
            data=resultData,
            stdout=stdoutBuf.getvalue(),
            stderr=stderrBuf.getvalue(),
            variables=self._collectVariables(),
            executionCount=self.executionCount,
            status=resultStatus,
        )

    def _updateRegistry(self, blockId: str, code: str, cellScope: dict) -> None:
        defines, _ = analyzeCode(code)

        oldDefs = self._cellDefinitions.get(blockId, set())
        for var in oldDefs:
            if self._registry.get(var) is not None:
                ownerStillValid = False
                for otherId, otherDefs in self._cellDefinitions.items():
                    if otherId != blockId and var in otherDefs:
                        ownerStillValid = True
                        break
                if not ownerStillValid:
                    self._registry.pop(var, None)

        newDefs: set[str] = set()
        for var in defines:
            if var in cellScope and var not in ("__builtins__", "__name__"):
                self._registry[var] = cellScope[var]
                newDefs.add(var)

        self._cellDefinitions[blockId] = newDefs

    def removeCellDefinitions(self, blockId: str) -> None:
        oldDefs = self._cellDefinitions.pop(blockId, set())
        for var in oldDefs:
            otherOwner = False
            for otherId, otherDefs in self._cellDefinitions.items():
                if var in otherDefs:
                    otherOwner = True
                    break
            if not otherOwner:
                self._registry.pop(var, None)

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

    def getVariables(self) -> list[VariableInfo]:
        return self._collectVariables()

    def _collectVariables(self) -> list[VariableInfo]:
        variables: list[VariableInfo] = []
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
                VariableInfo(
                    name=name,
                    typeName=type(value).__name__,
                    repr=valueRepr,
                    size=size,
                )
            )
        return variables

    def reset(self) -> None:
        self._registry.clear()
        self._cellDefinitions.clear()
        self.executionCount = 0
        self.status = "idle"

    def dispose(self) -> None:
        self._registry.clear()
        self._cellDefinitions.clear()
        self._executor.shutdown(wait=False)


def _formatSyntaxError(error: SyntaxError) -> str:
    parts = [f"SyntaxError: {error.msg}"]
    if error.filename and error.lineno:
        parts.append(f"  File \"{error.filename}\", line {error.lineno}")
    if error.text:
        parts.append(f"    {error.text.rstrip()}")
        if error.offset:
            parts.append(f"    {' ' * (error.offset - 1)}^")
    return "\n".join(parts)
