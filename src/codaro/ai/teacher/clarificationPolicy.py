from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


DEFAULT_LABELS = {
    "level": "수준",
    "depth": "깊이",
    "environment": "환경",
    "balance": "학습 비중",
}


@dataclass(frozen=True)
class ClarificationPlan:
    shouldAsk: bool
    questions: tuple[str, ...] = ()
    defaults: dict[str, str] = field(default_factory=dict)

    def payload(self) -> dict[str, Any]:
        return {
            "shouldAsk": self.shouldAsk,
            "questions": list(self.questions),
            "defaults": self.defaults,
        }


def clarificationAnswer(plan: ClarificationPlan) -> str:
    if not plan.shouldAsk:
        return ""
    questionLines = "\n".join(
        f"{index}. {question}"
        for index, question in enumerate(plan.questions, start=1)
    )
    defaultLines = "\n".join(
        f"- {DEFAULT_LABELS.get(key, key)}: {value}"
        for key, value in plan.defaults.items()
    )
    return "\n\n".join(
        part
        for part in [
            "바로 만들기 전에 결과가 달라지는 부분만 되묻겠습니다.",
            questionLines,
            "답을 주면 그 기준으로 만들겠습니다. 지금 기준이 맞으면 그대로 진행해도 됩니다.",
            "현재 가정:",
            defaultLines,
        ]
        if part
    )


LEARNING_KEYWORDS = (
    "학습",
    "배우",
    "공부",
    "커리큘럼",
    "레슨",
    "실습",
    "teach",
    "learn",
    "lesson",
    "curriculum",
    "practice",
)

LEVEL_MARKERS = ("입문", "초급", "기초", "중급", "고급", "beginner", "intermediate", "advanced")
DEPTH_MARKERS = ("간단", "짧게", "짧은", "깊게", "상세", "프로젝트", "실전", "deep", "brief", "project")
BALANCE_MARKERS = ("실습", "설명", "예제", "문제", "practice", "explain", "example")
ENVIRONMENT_MARKERS = ("pandas", "numpy", "matplotlib", "seaborn", "duckdb", "polars", "sklearn", "uv")


def buildClarificationPlan(message: str, context: dict[str, Any] | None = None) -> ClarificationPlan:
    normalized = message.lower()
    if not _looksLikeLearningRequest(normalized):
        return ClarificationPlan(shouldAsk=False)

    contextMap = context if isinstance(context, dict) else {}
    questions: list[str] = []
    defaults = {
        "level": "초급-중급 사이",
        "depth": "한 레슨 안에서 바로 실행 가능한 실습 중심",
        "environment": "현재 Codaro 로컬 Python과 uv 패키지 설치",
        "balance": "설명은 짧게, 섹션마다 직접 입력 셀 포함",
    }

    if not _hasAny(normalized, LEVEL_MARKERS) and not contextMap.get("learnerLevel"):
        questions.append("학습자 수준은 어느 정도로 잡을까요?")
    if not _hasAny(normalized, DEPTH_MARKERS) and not contextMap.get("lessonDepth"):
        questions.append("결과물은 짧은 실습 레슨이면 될까요, 아니면 프로젝트 수준까지 갈까요?")
    if not _hasAny(normalized, BALANCE_MARKERS) and not contextMap.get("lessonBalance"):
        questions.append("실습 중심으로 갈까요, 개념 설명 비중을 더 둘까요?")
    if "라이브러리" in message and not _hasAny(normalized, ENVIRONMENT_MARKERS) and not contextMap.get("dependencyPreflight"):
        questions.append("사용할 라이브러리나 실행 환경 제한이 있나요?")

    return ClarificationPlan(
        shouldAsk=bool(questions),
        questions=tuple(questions[:3]),
        defaults=defaults,
    )


def _looksLikeLearningRequest(normalizedMessage: str) -> bool:
    return any(keyword in normalizedMessage for keyword in LEARNING_KEYWORDS)


def _hasAny(normalizedMessage: str, markers: tuple[str, ...]) -> bool:
    return any(marker in normalizedMessage for marker in markers)
