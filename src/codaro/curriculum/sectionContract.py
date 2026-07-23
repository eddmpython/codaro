from __future__ import annotations

import re
import sys
from typing import Any

from pydantic import BaseModel, Field

from .taxonomy import LessonOutcomeRecord, mergeLessonRecord


STRUCTURED_SECTION_FIELDS = {
    "goal",
    "why",
    "explanation",
    "tips",
    "snippet",
    "exercise",
    "check",
}

REQUIRED_STRUCTURED_SECTION_FIELDS = (
    "subtitle",
    "goal",
    "why",
    "explanation",
    "tips",
    "snippet",
    "exercise.prompt",
    "exercise.starterCode",
    "check",
)

_STDLIB_MODULE_NAMES = set(getattr(sys, "stdlib_module_names", ()))
PACKAGE_NAME_ALIASES = {
    "bs4": "beautifulsoup4",
    "cv2": "opencv-python",
    "docx": "python-docx",
    "pil": "pillow",
    "pillow": "pillow",
    "skimage": "scikit-image",
    "sklearn": "scikit-learn",
    "yaml": "pyyaml",
}


class LessonMetaContract(BaseModel):
    title: str = ""
    audience: str = ""
    difficulty: str = ""
    packages: list[str] = Field(default_factory=list)


class LessonIntroContract(BaseModel):
    direction: str = ""
    benefits: list[str] = Field(default_factory=list)
    diagram: dict[str, Any] = Field(default_factory=dict)


class LearningExerciseContract(BaseModel):
    prompt: str = ""
    starterCode: str = ""
    solution: str = ""
    check: dict[str, Any] = Field(default_factory=dict)
    hints: list[str] = Field(default_factory=list)
    difficulty: str = "easy"
    variations: list[LearningVariationContract] = Field(default_factory=list)


class LearningVariationContract(BaseModel):
    """같은 outcome을 다른 입력과 맥락에서 다시 검증하는 변주 문제.

    학습자가 메인 exercise 통과 후 "한 번 더 확인" 으로 호출. parameterization 은 수치/
    타입/순서 변형 메타로, AI 도구 propose-variation 이 채우는 슬롯이다.
    """
    prompt: str = ""
    starterCode: str = ""
    solution: str = ""
    check: dict[str, Any] = Field(default_factory=dict)
    parameterization: str = ""

    def isEmpty(self) -> bool:
        return not any([self.prompt, self.starterCode, self.solution, bool(self.check)])


class LearningReflectionContract(BaseModel):
    """강의 끝에서 기억을 굳히는 선택적 회고 셀.

    학습자가 "방금 배운 것" 을 자기 표현으로 적게 한다. expectedKeywords 가 있으면
    auto-grade 가능 (포함 여부 검사). aiFollowup 는 채워진 답을 (있다면 teacher) 가
    한 줄로 코멘트 — 강제는 아니다.
    """
    prompt: str = ""
    expectedKeywords: list[str] = Field(default_factory=list)
    aiFollowup: str = ""

    def isEmpty(self) -> bool:
        return not any([self.prompt, self.expectedKeywords, self.aiFollowup])


class LearningSectionContract(BaseModel):
    id: str = ""
    title: str = ""
    subtitle: str = ""
    goal: str = ""
    why: str = ""
    explanation: str = ""
    tips: list[str] = Field(default_factory=list)
    snippet: str = ""
    exercise: LearningExerciseContract = Field(default_factory=LearningExerciseContract)
    check: dict[str, Any] = Field(default_factory=dict)
    reflection: LearningReflectionContract = Field(default_factory=LearningReflectionContract)
    rawBlocks: list[dict[str, Any]] = Field(default_factory=list)
    contractGaps: list[str] = Field(default_factory=list)
    assessmentMode: str = ""
    sourceSectionIds: list[str] = Field(default_factory=list)
    unseen: bool = False
    minimumDelayHours: int = 0
    outcomeIds: list[str] = Field(default_factory=list)


class LearningLessonContract(BaseModel):
    meta: LessonMetaContract = Field(default_factory=LessonMetaContract)
    intro: LessonIntroContract = Field(default_factory=LessonIntroContract)
    sections: list[LearningSectionContract] = Field(default_factory=list)


def lessonContractFromYaml(
    content: dict[str, Any],
    *,
    fallbackTitle: str = "",
    taxonomyRecord: LessonOutcomeRecord | None = None,
) -> LearningLessonContract:
    meta = _mapValue(content.get("meta"))
    intro = _mapValue(content.get("intro"))
    runtime = _mapValue(content.get("runtime"))
    seo = _mapValue(meta.get("seo"))
    title = _textValue(meta.get("title") or content.get("title")) or fallbackTitle
    outcomeRecord = mergeLessonRecord(meta, taxonomyRecord)
    sections = [
        _sectionContract(
            section,
            index,
            lessonOutcomeIds=outcomeRecord.outcomes,
            sectionOutcomeIds=outcomeRecord.sectionOutcomes,
        )
        for index, section in enumerate(_arrayOfMaps(content.get("sections")), start=1)
    ]
    return LearningLessonContract(
        meta=LessonMetaContract(
            title=title,
            audience=_textValue(meta.get("audience") or meta.get("target") or meta.get("level")),
            difficulty=_textValue(meta.get("difficulty")),
            packages=_installablePackageList(meta.get("packages") or runtime.get("packages") or content.get("packages")),
        ),
        intro=LessonIntroContract(
            direction=_textValue(
                intro.get("direction")
                or intro.get("goal")
                or intro.get("description")
                or meta.get("description")
                or seo.get("description")
            ),
            benefits=_uniqueTextList(intro.get("benefits") or intro.get("points") or intro.get("outcomes")),
            diagram=_diagramValue(intro.get("diagram") or intro.get("flow") or intro.get("architecture")),
        ),
        sections=sections,
    )


def sectionHasStructuredFields(section: dict[str, Any]) -> bool:
    return any(fieldName in section for fieldName in STRUCTURED_SECTION_FIELDS)


def sectionContractGaps(section: LearningSectionContract) -> list[str]:
    gaps: list[str] = []
    if not section.subtitle:
        gaps.append("subtitle")
    if not section.goal:
        gaps.append("goal")
    if not section.why:
        gaps.append("why")
    if not section.explanation:
        gaps.append("explanation")
    if not section.tips:
        gaps.append("tips")
    if not section.snippet and section.assessmentMode not in {"mastery", "transfer", "retrieval"}:
        gaps.append("snippet")
    if not section.exercise.prompt:
        gaps.append("exercise.prompt")
    if not section.exercise.starterCode:
        gaps.append("exercise.starterCode")
    if not (section.check or section.exercise.check):
        gaps.append("check")
    return gaps


def _sectionContract(
    section: dict[str, Any],
    index: int,
    *,
    lessonOutcomeIds: list[str] | None = None,
    sectionOutcomeIds: dict[str, list[str]] | None = None,
) -> LearningSectionContract:
    blocks = _arrayOfMaps(section.get("blocks"))
    directExercise = _exerciseContract(section.get("exercise"))
    inferredExercise = _firstExerciseFromBlocks(blocks)
    exercise = directExercise if _hasExerciseData(directExercise) else inferredExercise
    if exercise.starterCode and not exercise.solution:
        exercise = exercise.model_copy(update={"solution": exercise.starterCode})
    check = _checkMap(section.get("check")) or exercise.check
    reflection = _reflectionContract(section.get("reflection"))
    sectionId = _textValue(section.get("id")) or f"section-{index}"
    directOutcomeIds = _uniqueTextList(section.get("outcomeIds") or section.get("outcomes"))
    mappedOutcomeIds = (sectionOutcomeIds or {}).get(sectionId, [])
    contract = LearningSectionContract(
        id=sectionId,
        title=_textValue(section.get("title")) or f"{index}단계",
        subtitle=_textValue(section.get("subtitle")),
        goal=_textValue(section.get("goal") or section.get("study") or section.get("objective")),
        why=_textValue(section.get("why") or section.get("benefit") or section.get("value")),
        explanation=_textValue(section.get("explanation") or section.get("description") or section.get("content"))
        or _firstBlockText(blocks, {"text", "prose", "centerText", "info"}),
        tips=_uniqueTextList(section.get("tips")) or _tipsFromBlocks(blocks),
        snippet=_snippetText(section.get("snippet")) or _firstCodeFromBlocks(blocks),
        exercise=exercise,
        check=check,
        reflection=reflection,
        rawBlocks=blocks,
        assessmentMode=_textValue(section.get("assessmentMode") or section.get("mode")),
        sourceSectionIds=_uniqueTextList(section.get("sourceSectionIds")),
        unseen=section.get("unseen") is True,
        minimumDelayHours=_nonNegativeInteger(section.get("minimumDelayHours")),
        outcomeIds=directOutcomeIds or mappedOutcomeIds or list(lessonOutcomeIds or []),
    )
    if not sectionHasStructuredFields(section):
        return contract
    return contract.model_copy(update={"contractGaps": sectionContractGaps(contract)})


def _exerciseContract(value: Any) -> LearningExerciseContract:
    if not isinstance(value, dict):
        return LearningExerciseContract(prompt=_textValue(value))
    check = _checkMap(value.get("check") or value.get("checkConfig"))
    return LearningExerciseContract(
        prompt=_textValue(value.get("prompt") or value.get("title") or value.get("description") or value.get("content")),
        starterCode=_textValue(value.get("starterCode") or value.get("starter") or value.get("template") or value.get("content")),
        solution=_textValue(value.get("solution") or value.get("answer") or value.get("code")),
        check=check,
        hints=_uniqueTextList(value.get("hints") or value.get("tips")),
        difficulty=_textValue(value.get("difficulty")) or "easy",
        variations=_variationsContract(value.get("variations")),
    )


def _variationsContract(value: Any) -> list[LearningVariationContract]:
    if not isinstance(value, list):
        return []
    result: list[LearningVariationContract] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        result.append(LearningVariationContract(
            prompt=_textValue(item.get("prompt") or item.get("question")),
            starterCode=_textValue(item.get("starterCode") or item.get("starter")),
            solution=_textValue(item.get("solution") or item.get("answer")),
            check=_checkMap(item.get("check")),
            parameterization=_textValue(item.get("parameterization") or item.get("varying")),
        ))
    return result


def _reflectionContract(value: Any) -> LearningReflectionContract:
    if not isinstance(value, dict):
        return LearningReflectionContract()
    return LearningReflectionContract(
        prompt=_textValue(value.get("prompt") or value.get("question")),
        expectedKeywords=_uniqueTextList(value.get("expectedKeywords") or value.get("keywords")),
        aiFollowup=_textValue(value.get("aiFollowup") or value.get("followup")),
    )


def _firstExerciseFromBlocks(blocks: list[dict[str, Any]]) -> LearningExerciseContract:
    for block in blocks:
        sourceType = _textValue(block.get("type"))
        if sourceType not in {"expansion", "practiceCard", "stepCard"}:
            continue
        prompt = _textValue(block.get("title") or block.get("description") or block.get("content"))
        return LearningExerciseContract(
            prompt=prompt,
            starterCode=_textValue(block.get("starterCode") or block.get("starter")),
            solution=_textValue(block.get("solution") or block.get("code")),
            check=_checkMap(block.get("check") or block.get("checkConfig")),
            hints=_uniqueTextList(block.get("hints") or block.get("tips")),
            difficulty=_textValue(block.get("difficulty")) or "easy",
        )
    return LearningExerciseContract()


def _hasExerciseData(exercise: LearningExerciseContract) -> bool:
    return any([
        exercise.prompt,
        exercise.starterCode,
        exercise.solution,
        bool(exercise.check),
        bool(exercise.hints),
    ])


def _snippetText(value: Any) -> str:
    if isinstance(value, dict):
        return _textValue(value.get("code") or value.get("content") or value.get("text"))
    return _textValue(value)


def _firstCodeFromBlocks(blocks: list[dict[str, Any]]) -> str:
    for block in blocks:
        if _textValue(block.get("type")) == "code":
            return _textValue(block.get("content") or block.get("code"))
    return ""


def _firstBlockText(blocks: list[dict[str, Any]], sourceTypes: set[str]) -> str:
    for block in blocks:
        if _textValue(block.get("type") or "text") not in sourceTypes:
            continue
        text = _textValue(block.get("content") or block.get("description") or block.get("text"))
        if text:
            return text
    return ""


def _tipsFromBlocks(blocks: list[dict[str, Any]]) -> list[str]:
    tips: list[str] = []
    for block in blocks:
        if _textValue(block.get("type")) not in {"tip", "tipCard", "note", "info"}:
            continue
        tips.extend(_uniqueTextList(block.get("tips") or block.get("items")))
        tipText = _textValue(block.get("content") or block.get("description") or block.get("text"))
        if tipText:
            tips.append(tipText)
    return _unique(tips)


_CHECK_PRESERVE_KEYS = frozenset({
    "type",
    "expectedCode",
    "variableName",
    "expectedValue",
    "requiredPatterns",
    "hints",
})


def _checkMap(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        if value.get("version") == 1 and value.get("kind") and value.get("strength"):
            return {str(key): item for key, item in value.items() if item is not None}
        result: dict[str, Any] = {}
        for key, item in value.items():
            keyStr = str(key)
            if keyStr in _CHECK_PRESERVE_KEYS:
                if item is None:
                    continue
                result[keyStr] = item
            else:
                text = _textValue(item)
                if text:
                    result[keyStr] = text
        return result
    text = _textValue(value)
    return {"description": text} if text else {}


def _diagramValue(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    if isinstance(value, list):
        return {"steps": value}
    text = _textValue(value)
    return {"description": text} if text else {}


def _mapValue(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _arrayOfMaps(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, dict)]


def _uniqueTextList(value: Any) -> list[str]:
    if isinstance(value, str | int | float | bool):
        return [str(value)]
    if not isinstance(value, list):
        return []
    items: list[str] = []
    for item in value:
        if isinstance(item, str | int | float | bool):
            items.append(str(item))
        elif isinstance(item, dict):
            text = " ".join(
                part
                for part in [
                    _textValue(item.get("title") or item.get("label") or item.get("name") or item.get("text")),
                    _textValue(item.get("description") or item.get("content")),
                ]
                if part
            )
            if text:
                items.append(text)
    return _unique(items)


def _installablePackageList(value: Any) -> list[str]:
    return _unique([
        package
        for item in _uniqueTextList(value)
        if (package := _installablePackageName(item))
    ])


def _installablePackageName(name: str) -> str:
    packageName = name.strip()
    if not packageName:
        return ""
    normalized = packageName.lower().replace("_", "-")
    canonical = PACKAGE_NAME_ALIASES.get(normalized, packageName)
    if _isStandardLibraryPackage(canonical):
        return ""
    return canonical


def _isStandardLibraryPackage(name: str) -> bool:
    match = re.match(r"^[A-Za-z0-9][A-Za-z0-9_.-]*", name.strip())
    if match is None:
        return False
    return match.group(0).replace("-", "_") in _STDLIB_MODULE_NAMES


def _unique(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        normalized = item.strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        result.append(normalized)
    return result


def _textValue(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, int | float | bool):
        return str(value)
    return ""


def _nonNegativeInteger(value: Any) -> int:
    try:
        return max(0, int(value or 0))
    except (TypeError, ValueError):
        return 0
