from __future__ import annotations

import re
from typing import Any

from .sectionContract import LearningSectionContract, lessonContractFromYaml
from .studyLoader import StudyLoader


class CurriculumAuthoringProposalError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def buildVariationProposalPayload(
    *,
    studyLoader: StudyLoader | None,
    category: str,
    contentId: str,
    sectionId: str,
    count: int = 2,
) -> dict[str, object]:
    if not category or not contentId or not sectionId:
        raise CurriculumAuthoringProposalError(
            "curriculum_section_required",
            "category, contentId, and sectionId are required",
        )
    if studyLoader is None:
        raise CurriculumAuthoringProposalError(
            "curriculum_loader_unavailable",
            "study loader unavailable",
        )
    lesson = _loadLessonContract(studyLoader, category, contentId)
    section = next((candidate for candidate in lesson.sections if candidate.id == sectionId), None)
    if section is None:
        raise CurriculumAuthoringProposalError(
            "curriculum_section_not_found",
            f"section not found: {sectionId}",
        )
    exercise = section.exercise
    if not (exercise.solution or exercise.starterCode):
        raise CurriculumAuthoringProposalError(
            "curriculum_exercise_code_missing",
            "section has no exercise code to base a variation on",
        )
    baseCode = exercise.solution or exercise.starterCode
    return {
        "category": category,
        "contentId": contentId,
        "sectionId": sectionId,
        "baseSnippet": baseCode,
        "drafts": generateVariationDrafts(baseCode, count),
        "next": (
            "사람이 각 draft 의 입력값/예상결과를 검토해 section.exercise.variations 배열에 채워주세요. "
            "draft 의 parameterization 은 변형 차원을 짧게 묘사한 메모입니다."
        ),
    }


def generateVariationDrafts(baseCode: str, count: int) -> list[dict[str, object]]:
    drafts: list[dict[str, object]] = []
    targetCount = max(1, min(count, 4))
    numberLiterals = re.findall(r"\b\d+(?:\.\d+)?\b", baseCode)
    stringLiterals = re.findall(r"'([^'\n]*)'|\"([^\"\n]*)\"", baseCode)
    stringFlat = [value for pair in stringLiterals for value in pair if value]

    if numberLiterals:
        original = numberLiterals[0]
        try:
            doubled = str(int(original) * 2) if "." not in original else str(round(float(original) * 2, 4))
            zero = "0"
            negative = "-" + original
            drafts.append({
                "parameterization": f"수치 리터럴 {original} → {doubled} (두 배)",
                "starterCode": baseCode.replace(original, doubled, 1),
                "solution": "(작성자 확정 필요)",
                "promptHint": "두 배 입력에서 결과가 어떻게 변하는지 예측하고 비교하세요.",
            })
            if len(drafts) < targetCount:
                drafts.append({
                    "parameterization": f"경계값 {original} → {zero}",
                    "starterCode": baseCode.replace(original, zero, 1),
                    "solution": "(작성자 확정 필요)",
                    "promptHint": "0 입력에서 흐름이 어떻게 분기하는지 확인하세요.",
                })
            if len(drafts) < targetCount:
                drafts.append({
                    "parameterization": f"부호 반전 {original} → {negative}",
                    "starterCode": baseCode.replace(original, negative, 1),
                    "solution": "(작성자 확정 필요)",
                    "promptHint": "음수 입력에서 같은 코드가 어떻게 동작하는지 비교하세요.",
                })
        except ValueError:
            pass

    if stringFlat and len(drafts) < targetCount:
        original = stringFlat[0]
        replacement = original.upper() if original.lower() == original else original.lower()
        if replacement and replacement != original:
            drafts.append({
                "parameterization": f"문자열 '{original}' → '{replacement}' (대소문자)",
                "starterCode": baseCode.replace(original, replacement, 1),
                "solution": "(작성자 확정 필요)",
                "promptHint": "대소문자 변경이 비교/검색 결과를 어떻게 바꾸는지 확인하세요.",
            })

    if not drafts:
        drafts.append({
            "parameterization": "동일 흐름 재호출 (입력값 변경 미감지)",
            "starterCode": baseCode,
            "solution": "(작성자가 새 입력/예상결과를 정의)",
            "promptHint": "이 코드를 다른 입력으로 실행한 결과를 비교하세요.",
        })

    return drafts[:targetCount]


def _loadLessonContract(studyLoader: StudyLoader, category: str, contentId: str):
    try:
        rawDict = studyLoader.loadStudy(category, contentId)
    except FileNotFoundError as exc:
        raise CurriculumAuthoringProposalError(
            "curriculum_lesson_not_found",
            f"lesson not found: {category}/{contentId}",
        ) from exc
    return lessonContractFromYaml(rawDict or {}, fallbackTitle=contentId)
