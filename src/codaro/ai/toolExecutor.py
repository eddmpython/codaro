from __future__ import annotations

import json
import time
import uuid
from pathlib import Path
from typing import Any

from .tools import getTool, ToolDef


class ToolExecutionError(RuntimeError):
    pass


class ToolExecutor:

    def __init__(
        self,
        sessionManager: Any,
        documentGetter: Any = None,
        documentSetter: Any = None,
        workspaceRoot: str | None = None,
    ) -> None:
        self._sessionManager = sessionManager
        self._documentGetter = documentGetter
        self._documentSetter = documentSetter
        self._workspaceRoot = workspaceRoot
        self._activeSessionId: str | None = None

    def setActiveSession(self, sessionId: str) -> None:
        self._activeSessionId = sessionId

    def _getSession(self):
        if not self._activeSessionId:
            raise ToolExecutionError("No active kernel session")
        session = self._sessionManager.getSession(self._activeSessionId)
        if session is None:
            raise ToolExecutionError(f"Session not found: {self._activeSessionId}")
        return session

    def _getDocument(self):
        if self._documentGetter is None:
            raise ToolExecutionError("No document loaded")
        doc = self._documentGetter()
        if doc is None:
            raise ToolExecutionError("No document loaded")
        return doc

    def _saveDocument(self, doc) -> None:
        if self._documentSetter is not None:
            self._documentSetter(doc)

    async def execute(self, toolName: str, arguments: dict[str, Any]) -> dict[str, Any]:
        tool = getTool(toolName)
        if tool is None:
            return {"error": f"Unknown tool: {toolName}"}

        handlerName = tool.handler
        handler = getattr(self, f"_handle_{handlerName}", None)
        if handler is None:
            return {"error": f"No handler for tool: {toolName}"}

        try:
            return await handler(arguments)
        except ToolExecutionError as exc:
            return {"error": str(exc)}

    async def _handle_insertBlock(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        blockType = args["blockType"]
        content = args["content"]
        position = args.get("position", -1)

        from codaro.document.models import BlockConfig

        blockId = f"block-{uuid.uuid4().hex[:8]}"
        newBlock = BlockConfig(id=blockId, type=blockType, content=content)

        if position < 0 or position >= len(doc.blocks):
            doc.blocks.append(newBlock)
        else:
            doc.blocks.insert(position, newBlock)

        self._saveDocument(doc)
        return {"blockId": blockId, "position": position, "type": blockType}

    async def _handle_updateBlock(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        blockId = args["blockId"]
        content = args["content"]

        for block in doc.blocks:
            if block.id == blockId:
                block.content = content
                self._saveDocument(doc)
                return {"blockId": blockId, "updated": True}

        return {"error": f"Block not found: {blockId}"}

    async def _handle_deleteBlock(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        blockId = args["blockId"]

        for i, block in enumerate(doc.blocks):
            if block.id == blockId:
                doc.blocks.pop(i)
                session = self._getSession()
                session.removeCellDefinitions(blockId)
                self._saveDocument(doc)
                return {"blockId": blockId, "deleted": True}

        return {"error": f"Block not found: {blockId}"}

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

    def _validatePath(self, rawPath: str) -> str:
        if self._workspaceRoot is None:
            return rawPath
        root = Path(self._workspaceRoot).resolve()
        target = Path(rawPath).expanduser()
        if not target.is_absolute():
            target = root / target
        target = target.resolve()
        if not target.is_relative_to(root):
            raise ToolExecutionError("Path must stay within the active workspace.")
        return str(target)

    async def _handle_fsWrite(self, args: dict[str, Any]) -> dict[str, Any]:
        session = self._getSession()
        path = self._validatePath(args["path"])
        content = args["content"]
        result = await session.writeFile(path, content)
        return {"path": result, "written": True}

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

    async def _handle_createLearningCard(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        topic = args["topic"]
        explanation = args["explanation"]
        exampleCode = args["exampleCode"]
        fillBlankCode = args["fillBlankCode"]
        blanks = args["blanks"]
        tags = args.get("tags", [])

        from codaro.document.models import BlockConfig

        blocks: list[Any] = []

        mdId = f"card-md-{uuid.uuid4().hex[:8]}"
        blocks.append(BlockConfig(
            id=mdId, type="markdown",
            content=f"## {topic}\n\n{explanation}",
        ))

        exId = f"card-ex-{uuid.uuid4().hex[:8]}"
        blocks.append(BlockConfig(id=exId, type="code", content=exampleCode))

        guideId = f"card-guide-{uuid.uuid4().hex[:8]}"
        blocks.append(BlockConfig(
            id=guideId, type="guide",
            content=json.dumps({
                "exerciseType": "fillBlank",
                "description": f"Fill in the blanks to complete the {topic} example.",
                "content": fillBlankCode,
                "hints": [
                    f"This exercise is about {topic}.",
                    f"Look at the example code above for the pattern.",
                    f"The blanks are: {', '.join(blanks)}",
                ],
                "solution": fillBlankCode.replace("___", "{}").format(*blanks) if blanks else fillBlankCode,
                "difficulty": "easy",
            }, ensure_ascii=False),
        ))

        for block in blocks:
            doc.blocks.append(block)
        self._saveDocument(doc)

        return {
            "topic": topic,
            "blockIds": [b.id for b in blocks],
            "tags": tags,
        }

    async def _handle_createQuiz(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        topic = args["topic"]
        questions = args["questions"]
        difficulty = args.get("difficulty", "medium")

        from codaro.document.models import BlockConfig

        headerId = f"quiz-hdr-{uuid.uuid4().hex[:8]}"
        doc.blocks.append(BlockConfig(
            id=headerId, type="markdown",
            content=f"## Quiz: {topic}\n\nDifficulty: **{difficulty}** | {len(questions)} questions",
        ))

        questionIds = []
        for i, q in enumerate(questions):
            qType = q["type"]
            qId = f"quiz-q{i}-{uuid.uuid4().hex[:8]}"

            if qType == "multiple-choice":
                choiceLines = "\n".join(f"- {c}" for c in q.get("choices", []))
                doc.blocks.append(BlockConfig(
                    id=qId, type="guide",
                    content=json.dumps({
                        "exerciseType": "fillBlank",
                        "description": q["question"],
                        "content": f"# Question {i + 1}: {q['question']}\n{choiceLines}\n\nanswer = ___",
                        "hints": [
                            q.get("explanation", "Think about the concept carefully."),
                            f"The answer is one of: {', '.join(q.get('choices', []))}",
                            f"Correct answer: {q['correctAnswer']}",
                        ],
                        "solution": f"answer = \"{q['correctAnswer']}\"",
                        "difficulty": difficulty,
                    }, ensure_ascii=False),
                ))
            elif qType == "coding":
                doc.blocks.append(BlockConfig(
                    id=qId, type="guide",
                    content=json.dumps({
                        "exerciseType": "writeCode",
                        "description": q["question"],
                        "content": q.get("question", ""),
                        "hints": [
                            q.get("explanation", "Think about the approach."),
                            "Review the concepts covered in this topic.",
                            f"Solution:\n{q['correctAnswer']}",
                        ],
                        "solution": q["correctAnswer"],
                        "difficulty": difficulty,
                    }, ensure_ascii=False),
                ))
            elif qType == "predict-output":
                doc.blocks.append(BlockConfig(
                    id=qId, type="guide",
                    content=json.dumps({
                        "exerciseType": "predict",
                        "description": f"Predict the output of this code:",
                        "content": q["question"],
                        "hints": [
                            "Read the code line by line and trace the values.",
                            q.get("explanation", "Think about what each line does."),
                            f"Expected output: {q['correctAnswer']}",
                        ],
                        "solution": q["correctAnswer"],
                        "difficulty": difficulty,
                    }, ensure_ascii=False),
                ))
            questionIds.append(qId)

        self._saveDocument(doc)
        return {
            "topic": topic,
            "headerId": headerId,
            "questionIds": questionIds,
            "questionCount": len(questions),
        }

    async def _handle_createNotebookExercise(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        title = args["title"]
        stages = args["stages"]

        from codaro.document.models import BlockConfig

        headerId = f"exnb-hdr-{uuid.uuid4().hex[:8]}"
        doc.blocks.append(BlockConfig(
            id=headerId, type="markdown",
            content=f"## Exercise: {title}\n\nThis exercise has **{len(stages)} stages**: fill-blank → modify → write from scratch.",
        ))

        stageIds = []
        for i, stage in enumerate(stages):
            stageType = stage["stage"]
            exerciseTypeMap = {
                "fill-blank": "fillBlank",
                "modify": "modify",
                "write": "writeCode",
            }
            exerciseType = exerciseTypeMap.get(stageType, "writeCode")

            stageLabel = f"Stage {i + 1}: {stageType.replace('-', ' ').title()}"
            mdId = f"exnb-md{i}-{uuid.uuid4().hex[:8]}"
            doc.blocks.append(BlockConfig(
                id=mdId, type="markdown",
                content=f"### {stageLabel}\n\n{stage['instruction']}",
            ))

            guideId = f"exnb-g{i}-{uuid.uuid4().hex[:8]}"
            doc.blocks.append(BlockConfig(
                id=guideId, type="guide",
                content=json.dumps({
                    "exerciseType": exerciseType,
                    "description": stage["instruction"],
                    "content": stage["starterCode"],
                    "hints": stage.get("hints", [
                        "Think about what the code should do.",
                        "Look at the previous stages for patterns.",
                        f"Solution:\n{stage['solution']}",
                    ]),
                    "solution": stage["solution"],
                    "difficulty": "medium",
                }, ensure_ascii=False),
            ))
            stageIds.append({"markdownId": mdId, "guideId": guideId, "stage": stageType})

        self._saveDocument(doc)
        return {
            "title": title,
            "headerId": headerId,
            "stages": stageIds,
            "stageCount": len(stages),
        }

    async def _handle_trackAchievement(self, args: dict[str, Any]) -> dict[str, Any]:
        achievementType = args["type"]
        topic = args["topic"]
        score = args.get("score")
        details = args.get("details", {})

        achievementsPath = None
        if self._workspaceRoot:
            achievementsPath = Path(self._workspaceRoot) / ".codaro" / "achievements.json"
            achievementsPath.parent.mkdir(parents=True, exist_ok=True)

            achievements: list[dict[str, Any]] = []
            if achievementsPath.exists():
                try:
                    achievements = json.loads(achievementsPath.read_text(encoding="utf-8"))
                except (json.JSONDecodeError, OSError):
                    achievements = []

            entry = {
                "id": f"ach-{uuid.uuid4().hex[:8]}",
                "type": achievementType,
                "topic": topic,
                "score": score,
                "details": details,
                "timestamp": time.time(),
            }
            achievements.append(entry)
            achievementsPath.write_text(
                json.dumps(achievements, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )

            topicStats = [a for a in achievements if a["topic"] == topic]
            return {
                "recorded": True,
                "achievementId": entry["id"],
                "topicTotal": len(topicStats),
                "latestScore": score,
            }

        return {
            "recorded": False,
            "reason": "No workspace root configured for persistent storage.",
            "achievementId": None,
        }

    async def _handle_createGuide(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        exerciseType = args["exerciseType"]
        content = args["content"]
        hints = args.get("hints", [])
        solution = args.get("solution", "")
        description = args.get("description", "")
        difficulty = args.get("difficulty", "medium")
        position = args.get("position", -1)

        from codaro.document.models import BlockConfig

        blockId = f"guide-{uuid.uuid4().hex[:8]}"

        guideContent = json.dumps({
            "exerciseType": exerciseType,
            "description": description,
            "content": content,
            "hints": hints,
            "solution": solution,
            "difficulty": difficulty,
        }, ensure_ascii=False)

        newBlock = BlockConfig(id=blockId, type="guide", content=guideContent)

        if position < 0 or position >= len(doc.blocks):
            doc.blocks.append(newBlock)
        else:
            doc.blocks.insert(position, newBlock)

        self._saveDocument(doc)
        return {
            "blockId": blockId,
            "exerciseType": exerciseType,
            "position": position,
        }

    async def _handle_splitNotebook(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        splits = args["splits"]
        outputDir = args.get("outputDir", ".")

        from codaro.document.models import BlockConfig, CodaroDocument
        from codaro.document.service import saveDocument

        if not self._workspaceRoot:
            return {"error": "No workspace root configured"}

        blockMap = {b.id: b for b in doc.blocks}
        results = []

        for split in splits:
            title = split["title"]
            blockIds = split["blockIds"]
            blocks = [blockMap[bid] for bid in blockIds if bid in blockMap]

            if not blocks:
                results.append({"title": title, "error": "No matching blocks"})
                continue

            newDoc = CodaroDocument(
                id=f"doc-{uuid.uuid4().hex[:10]}",
                title=title,
                blocks=[
                    BlockConfig(id=b.id, type=b.type, content=b.content)
                    for b in blocks
                ],
            )

            safeName = "".join(c if c.isalnum() or c in "-_ " else "" for c in title)
            safeName = safeName.strip().replace(" ", "_")[:60] or "untitled"
            filePath = self._validatePath(f"{outputDir}/{safeName}.py")
            saveDocument(filePath, newDoc)
            results.append({"title": title, "path": filePath, "blockCount": len(blocks)})

        return {"notebooks": results, "splitCount": len(results)}

    async def _handle_generateNotebook(self, args: dict[str, Any]) -> dict[str, Any]:
        title = args["title"]
        blocks = args["blocks"]
        outputPath = args.get("outputPath")

        from codaro.document.models import BlockConfig, CodaroDocument
        from codaro.document.service import saveDocument

        docBlocks = []
        for i, b in enumerate(blocks):
            blockId = f"gen-{uuid.uuid4().hex[:8]}"
            docBlocks.append(BlockConfig(id=blockId, type=b["type"], content=b["content"]))

        newDoc = CodaroDocument(
            id=f"doc-{uuid.uuid4().hex[:10]}",
            title=title,
            blocks=docBlocks,
        )

        if outputPath and self._workspaceRoot:
            filePath = self._validatePath(outputPath)
            saveDocument(filePath, newDoc)
            return {
                "title": title,
                "blockCount": len(docBlocks),
                "path": filePath,
                "saved": True,
            }

        if self._documentSetter is not None:
            self._documentSetter(newDoc)

        return {
            "title": title,
            "blockCount": len(docBlocks),
            "saved": False,
            "loadedInEditor": self._documentSetter is not None,
        }

    async def _handle_httpRequest(self, args: dict[str, Any]) -> dict[str, Any]:
        import urllib.request
        import urllib.error

        method = args["method"]
        url = args["url"]
        headers = args.get("headers", {})
        body = args.get("body")
        timeout = min(args.get("timeout", 30), 60)

        BLOCKED_PREFIXES = ("file://", "ftp://", "data:")
        if any(url.lower().startswith(p) for p in BLOCKED_PREFIXES):
            return {"error": f"URL scheme not allowed: {url.split(':')[0]}"}

        try:
            data = body.encode("utf-8") if body else None
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                respBody = resp.read(1024 * 512).decode("utf-8", errors="replace")
                return {
                    "status": resp.status,
                    "headers": dict(resp.headers),
                    "body": respBody,
                    "url": resp.url,
                }
        except urllib.error.HTTPError as exc:
            return {
                "status": exc.code,
                "error": str(exc.reason),
                "body": exc.read(1024 * 64).decode("utf-8", errors="replace"),
            }
        except urllib.error.URLError as exc:
            return {"error": f"Connection failed: {exc.reason}"}
        except TimeoutError:
            return {"error": f"Request timed out after {timeout}s"}
