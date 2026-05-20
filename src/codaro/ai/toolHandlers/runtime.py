from __future__ import annotations

import json
from typing import Any


class RuntimeToolHandlers:
    async def _handle_executeReactive(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        session = self._getSession()
        blockId = args["blockId"]

        block = None
        for b in doc.blocks:
            if b.id == blockId:
                block = b
                break

        if block is None:
            return {"error": f"Block not found: {blockId}"}
        if block.type != "code":
            return {"error": f"Block {blockId} is not a code block"}

        from codaro.kernel.reactive import executeReactive

        blocksData = [
            {"id": b.id, "type": b.type, "content": b.content}
            for b in doc.blocks
        ]

        results, executionOrder = await executeReactive(session, blocksData, blockId)

        outputs = []
        for result in results:
            outputs.append({
                "blockId": result.blockId,
                "status": result.status,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "data": result.data,
            })

        return {
            "executionOrder": executionOrder,
            "results": outputs,
        }

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
        installedByName = {
            package.name.lower().replace("_", "-"): package
            for package in installedPackages
        }
        packageResults = []
        missing = []
        for name in requested:
            normalized = name.lower().replace("_", "-")
            package = installedByName.get(normalized)
            installed = package is not None
            if not installed:
                missing.append(name)
            packageResults.append({
                "name": name,
                "installed": installed,
                "version": package.version if package is not None else None,
            })
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
        }

    async def _handle_checkExercise(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        session = self._getSession()
        blockId = args["blockId"]
        checkType = args["checkType"]
        expected = args.get("expected", "")

        block = None
        for b in doc.blocks:
            if b.id == blockId:
                block = b
                break
        if block is None:
            return {"error": f"Block not found: {blockId}"}

        if checkType == "noError":
            result = await session.execute(block.content, blockId=blockId)
            passed = result.status != "error"
            return {"passed": passed, "status": result.status, "stdout": result.stdout, "stderr": result.stderr}

        if checkType == "outputMatch":
            result = await session.execute(block.content, blockId=blockId)
            actual = (result.stdout or "").strip()
            expectedStripped = expected.strip()
            passed = actual == expectedStripped
            return {"passed": passed, "actual": actual, "expected": expectedStripped}

        if checkType == "outputContains":
            result = await session.execute(block.content, blockId=blockId)
            actual = result.stdout or ""
            passed = expected in actual
            return {"passed": passed, "actual": actual, "pattern": expected}

        if checkType == "variableCheck":
            result = await session.execute(block.content, blockId=blockId)
            variables = session.getVariables()
            varMap = {v.name: v.repr for v in variables}
            passed = expected in json.dumps(varMap, ensure_ascii=False)
            return {"passed": passed, "variables": varMap}

        if checkType == "codeContains":
            passed = expected in block.content
            return {"passed": passed, "pattern": expected}

        return {"error": f"Unknown check type: {checkType}"}
