from __future__ import annotations

import json
import time
import uuid
from pathlib import Path
from typing import Any


class LearningToolHandlers:
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
                    "Look at the example code above for the pattern.",
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
                        "description": "Predict the output of this code:",
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
