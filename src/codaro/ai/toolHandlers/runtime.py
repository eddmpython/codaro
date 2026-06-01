from __future__ import annotations

from typing import Any

from ...curriculum.exerciseCheck import InvalidExerciseCheck, ToolExerciseCheckInput, runToolExerciseCheck
from ...document.blockOperations import DocumentOperationError, getDocumentBlock
from ...kernel.documentExecution import executeDocumentReactiveBlock


def _documentBlockErrorPayload(exc: DocumentOperationError, blockId: str) -> dict[str, str]:
    if exc.code == "document_block_not_found":
        return {"error": f"Block not found: {blockId}"}
    if exc.code == "document_block_not_code":
        return {"error": f"Block {blockId} is not a code block"}
    return {"error": exc.message}


class RuntimeToolHandlers:
    async def _handle_executeReactive(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        session = self._getSession()
        blockId = args["blockId"]

        try:
            payload = await executeDocumentReactiveBlock(session, doc, blockId=blockId)
        except DocumentOperationError as exc:
            return _documentBlockErrorPayload(exc, blockId)
        return payload.toolPayload()

    async def _handle_getVariables(self, args: dict[str, Any]) -> dict[str, Any]:
        session = self._getSession()
        variables = session.getVariables()
        return {
            "variables": [
                {
                    "name": v.name,
                    "type": v.typeName,
                    "repr": v.repr,
                    "size": v.size,
                }
                for v in variables
            ]
        }

    async def _handle_fsWrite(self, args: dict[str, Any]) -> dict[str, Any]:
        session = self._getSession()
        path = self._validatePath(args["path"])
        content = args["content"]
        result = await session.writeFile(path, content)
        return {"path": result, "written": True}

    async def _handle_packagesCheck(self, args: dict[str, Any]) -> dict[str, Any]:
        session = self._getSession()
        names = args.get("names", [])
        if not isinstance(names, list) or not names:
            return {"error": "names must be a non-empty list"}
        requested = [str(name).strip() for name in names if str(name).strip()]
        installedPackages = await session.listPackages()
        installedByName = {package.name.lower().replace("_", "-"): package for package in installedPackages}
        packageResults = []
        missing = []
        for name in requested:
            normalized = name.lower().replace("_", "-")
            package = installedByName.get(normalized)
            installed = package is not None
            if not installed:
                missing.append(name)
            packageResults.append(
                {
                    "name": name,
                    "installed": installed,
                    "version": package.version if package is not None else None,
                }
            )
        return {
            "packages": packageResults,
            "missing": missing,
            "ready": not missing,
        }

    async def _handle_packagesInstall(self, args: dict[str, Any]) -> dict[str, Any]:
        session = self._getSession()
        name = args["name"]
        result = await session.installPackage(name)
        return {
            "package": name,
            "success": result.success,
            "message": result.message,
            "installer": result.installer,
            "environment": result.environment,
            "durationMs": result.durationMs,
            "skipped": result.skipped,
        }

    async def _handle_checkExercise(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        session = self._getSession()
        blockId = args["blockId"]
        checkType = args["checkType"]
        expected = args.get("expected", "")

        try:
            block = getDocumentBlock(doc, blockId=blockId)
        except DocumentOperationError as exc:
            return _documentBlockErrorPayload(exc, blockId)

        try:
            return await runToolExerciseCheck(
                session,
                ToolExerciseCheckInput(
                    studentCode=block.content,
                    checkType=checkType,
                    expected=expected,
                ),
            )
        except InvalidExerciseCheck as exc:
            return {"error": str(exc)}
