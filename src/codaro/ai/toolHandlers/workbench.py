from __future__ import annotations

from typing import Any

from ...document.blockOperations import (
    DocumentOperationError,
    insertDocumentBlock,
    removeDocumentBlock,
    updateDocumentBlock,
)


class WorkbenchToolHandlers:
    async def _handle_insertBlock(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        blockType = args["blockType"]
        content = args["content"]
        position = args.get("position", -1)
        result = insertDocumentBlock(
            doc,
            blockType=blockType,
            content=content,
            position=position,
        )
        self._saveDocument(doc)
        assert result.block is not None
        return {"blockId": result.block.id, "position": position, "type": result.block.type}

    async def _handle_updateBlock(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        blockId = args["blockId"]
        content = args["content"]

        try:
            updateDocumentBlock(doc, blockId=blockId, content=content)
        except DocumentOperationError as error:
            return {"error": error.message, "code": error.code}
        self._saveDocument(doc)
        return {"blockId": blockId, "updated": True}

    async def _handle_deleteBlock(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        blockId = args["blockId"]

        try:
            removeDocumentBlock(doc, blockId=blockId)
        except DocumentOperationError as error:
            return {"error": error.message, "code": error.code}
        session = self._getSession()
        session.removeCellDefinitions(blockId)
        self._saveDocument(doc)
        return {"blockId": blockId, "deleted": True}

    async def _handle_getBlocks(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        return {
            "blocks": [
                {
                    "id": b.id,
                    "type": b.type,
                    "content": b.content[:500],
                    "collapsed": b.collapsed,
                }
                for b in doc.blocks
            ]
        }

    async def _handle_readCells(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        blockIds = args.get("blockIds")
        includeContent = args.get("includeContent", True)
        idFilter = set(blockIds) if isinstance(blockIds, list) else None

        blocks = []
        for index, block in enumerate(doc.blocks):
            if idFilter is not None and block.id not in idFilter:
                continue
            item = {
                "id": block.id,
                "index": index,
                "type": block.type,
                "collapsed": block.collapsed,
                "execution": block.execution.model_dump(),
                "guide": block.guide.model_dump() if block.guide else None,
            }
            if includeContent:
                item["content"] = block.content
            else:
                item["preview"] = block.content[:160]
            blocks.append(item)

        return {
            "documentId": doc.id,
            "title": doc.title,
            "blocks": blocks,
            "blockCount": len(blocks),
        }

    async def _handle_writeCell(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        operation = args["operation"]

        if operation == "insert":
            blockType = args.get("blockType", "code")
            content = args.get("content", "")
            position = args.get("position", -1)
            result = insertDocumentBlock(
                doc,
                blockType=blockType,
                content=content,
                position=position,
            )

            self._saveDocument(doc)
            assert result.block is not None
            return {
                "operation": operation,
                "blockId": result.block.id,
                "position": result.toIndex,
                "type": result.block.type,
            }

        if operation == "update":
            blockId = args.get("blockId")
            if not blockId:
                return {"error": "blockId is required for update"}
            content = args.get("content")
            if content is None:
                return {"error": "content is required for update"}

            try:
                updateDocumentBlock(doc, blockId=blockId, content=content)
            except DocumentOperationError as error:
                return {"error": error.message, "code": error.code}
            self._saveDocument(doc)
            return {"operation": operation, "blockId": blockId, "updated": True}

        if operation == "delete":
            blockId = args.get("blockId")
            if not blockId:
                return {"error": "blockId is required for delete"}

            try:
                removeDocumentBlock(doc, blockId=blockId)
            except DocumentOperationError as error:
                return {"error": error.message, "code": error.code}
            if self._activeSessionId:
                session = self._sessionManager.getSession(self._activeSessionId)
                if session is not None:
                    session.removeCellDefinitions(blockId)
            self._saveDocument(doc)
            return {"operation": operation, "blockId": blockId, "deleted": True}

        return {"error": f"Unknown write-cell operation: {operation}"}

    async def _handle_cellCall(self, args: dict[str, Any]) -> dict[str, Any]:
        operation = args["operation"]
        if operation == "run":
            return await self._handle_executeReactive({"blockId": args["blockId"]})
        if operation == "check":
            return await self._handle_checkExercise({
                "blockId": args["blockId"],
                "checkType": args.get("checkType", "noError"),
                "expected": args.get("expected", ""),
            })
        return {"error": f"Unknown cell-call operation: {operation}"}

    async def _handle_writeCurriculumYaml(self, args: dict[str, Any]) -> dict[str, Any]:
        rawContent = args["yamlContent"]

        import yaml

        try:
            payload = yaml.safe_load(rawContent) if isinstance(rawContent, str) else rawContent
        except yaml.YAMLError as exc:
            return {"error": f"Invalid curriculum YAML: {exc}"}

        if payload is None:
            payload = {}
        if not isinstance(payload, dict):
            return {"error": "Curriculum YAML must parse to an object"}

        category = args.get("category") or "ai"
        contentId = args.get("contentId") or "ai-generated"
        loadInEditor = args.get("loadInEditor", True)

        try:
            from codaro.curriculum.converter import yamlToDocument

            document, solutions = yamlToDocument(payload, category, contentId)
        except (KeyError, TypeError, ValueError) as exc:
            return {"error": f"Curriculum YAML conversion failed: {exc}"}

        loadedInEditor = False
        if loadInEditor:
            self._saveDocument(document)
            loadedInEditor = self._documentSetter is not None

        sectionCount = sum(1 for block in document.blocks if block.sourceType == "section")
        exerciseCellCount = sum(1 for block in document.blocks if block.sourceType == "sectionContract:exercise")
        snippetCellCount = sum(1 for block in document.blocks if block.sourceType == "sectionContract:snippet")
        contractGaps = _curriculumContractGaps(document)
        contractGapCount = sum(len(item["missingFields"]) for item in contractGaps)

        return {
            "documentId": document.id,
            "title": document.title,
            "sectionCount": sectionCount,
            "exerciseCellCount": exerciseCellCount,
            "snippetCellCount": snippetCellCount,
            "contractGapCount": contractGapCount,
            "contractGaps": contractGaps,
            "runtimePackageCount": len(document.runtime.packages),
            "blockCount": len(document.blocks),
            "solutionCount": len(solutions),
            "loadedInEditor": loadedInEditor,
            "document": document.model_dump(),
            "solutions": solutions,
        }


def _curriculumContractGaps(document: Any) -> list[dict[str, Any]]:
    gaps: list[dict[str, Any]] = []
    for index, block in enumerate(document.blocks):
        if block.sourceType != "section" or not isinstance(block.payload, dict):
            continue
        sectionContract = block.payload.get("sectionContract")
        if not isinstance(sectionContract, dict):
            continue
        missingFields = sectionContract.get("contractGaps")
        if not isinstance(missingFields, list):
            continue
        normalizedFields = [str(fieldName) for fieldName in missingFields if str(fieldName).strip()]
        if not normalizedFields:
            continue
        gaps.append({
            "sectionIndex": index,
            "sectionId": str(sectionContract.get("id") or block.payload.get("id") or ""),
            "title": str(sectionContract.get("title") or block.title or ""),
            "missingFields": normalizedFields,
        })
    return gaps
