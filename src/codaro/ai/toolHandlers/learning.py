from __future__ import annotations

import json
import time
import uuid
from pathlib import Path
from typing import Any

from ...document.blockOperations import insertDocumentBlock
from ...document.notebookGeneration import (
    buildGeneratedNotebookDocument,
    buildSplitNotebookDocument,
    safeNotebookFileName,
    saveNotebookDocument,
)


class LearningToolHandlers:
    async def _handle_createLearningCard(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        topic = args["topic"]
        explanation = args["explanation"]
        exampleCode = args["exampleCode"]
        fillBlankCode = args["fillBlankCode"]
        blanks = args["blanks"]
        tags = args.get("tags", [])

        blockIds: list[str] = []
        blockIds.append(_insertToolDocumentBlock(
            doc,
            idPrefix="card-md",
            blockType="markdown",
            content=f"## {topic}\n\n{explanation}",
        ))
        blockIds.append(_insertToolDocumentBlock(
            doc,
            idPrefix="card-ex",
            blockType="code",
            content=exampleCode,
        ))
        blockIds.append(_insertToolDocumentBlock(
            doc,
            idPrefix="card-guide",
            blockType="guide",
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

        self._saveDocument(doc)

        return {
            "topic": topic,
            "blockIds": blockIds,
            "tags": tags,
        }

    async def _handle_createQuiz(self, args: dict[str, Any]) -> dict[str, Any]:
        doc = self._getDocument()
        topic = args["topic"]
        questions = args["questions"]
        difficulty = args.get("difficulty", "medium")

        headerId = _insertToolDocumentBlock(
            doc,
            idPrefix="quiz-hdr",
            blockType="markdown",
            content=f"## Quiz: {topic}\n\nDifficulty: **{difficulty}** | {len(questions)} questions",
        )

        questionIds = []
        for i, q in enumerate(questions):
            qType = q["type"]
            qId = ""

            if qType == "multiple-choice":
                choiceLines = "\n".join(f"- {c}" for c in q.get("choices", []))
                qId = _insertToolDocumentBlock(
                    doc,
                    idPrefix=f"quiz-q{i}",
                    blockType="guide",
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
                )
            elif qType == "coding":
                qId = _insertToolDocumentBlock(
                    doc,
                    idPrefix=f"quiz-q{i}",
                    blockType="guide",
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
                )
            elif qType == "predict-output":
                qId = _insertToolDocumentBlock(
                    doc,
                    idPrefix=f"quiz-q{i}",
                    blockType="guide",
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
                )
            if qId:
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

        headerId = _insertToolDocumentBlock(
            doc,
            idPrefix="exnb-hdr",
            blockType="markdown",
            content=f"## Exercise: {title}\n\nThis exercise has **{len(stages)} stages**: fill-blank → modify → write from scratch.",
        )

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
            mdId = _insertToolDocumentBlock(
                doc,
                idPrefix=f"exnb-md{i}",
                blockType="markdown",
                content=f"### {stageLabel}\n\n{stage['instruction']}",
            )

            guideId = _insertToolDocumentBlock(
                doc,
                idPrefix=f"exnb-g{i}",
                blockType="guide",
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
            )
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

        guideContent = json.dumps({
            "exerciseType": exerciseType,
            "description": description,
            "content": content,
            "hints": hints,
            "solution": solution,
            "difficulty": difficulty,
        }, ensure_ascii=False)

        blockId = _insertToolDocumentBlock(
            doc,
            idPrefix="guide",
            blockType="guide",
            content=guideContent,
            position=position,
        )

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

            newDoc = buildSplitNotebookDocument(title=title, blocks=blocks)
            filePath = self._validatePath(f"{outputDir}/{safeNotebookFileName(title)}.py")
            saveNotebookDocument(filePath, newDoc)
            results.append({"title": title, "path": filePath, "blockCount": len(blocks)})

        return {"notebooks": results, "splitCount": len(results)}

    async def _handle_generateNotebook(self, args: dict[str, Any]) -> dict[str, Any]:
        title = args["title"]
        blocks = args["blocks"]
        outputPath = args.get("outputPath")

        newDoc = buildGeneratedNotebookDocument(title=title, blockDrafts=blocks)
        blockCount = len(newDoc.blocks)

        if outputPath and self._workspaceRoot:
            filePath = self._validatePath(outputPath)
            saveNotebookDocument(filePath, newDoc)
            return {
                "title": title,
                "blockCount": blockCount,
                "path": filePath,
                "saved": True,
            }

        if self._documentSetter is not None:
            self._documentSetter(newDoc)

        return {
            "title": title,
            "blockCount": blockCount,
            "saved": False,
            "loadedInEditor": self._documentSetter is not None,
        }


def _insertToolDocumentBlock(
    document: Any,
    *,
    idPrefix: str,
    blockType: str,
    content: str,
    position: int = -1,
) -> str:
    result = insertDocumentBlock(
        document,
        idPrefix=idPrefix,
        blockType=blockType,
        content=content,
        position=position,
    )
    assert result.block is not None
    return result.block.id
