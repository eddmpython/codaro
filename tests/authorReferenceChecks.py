"""레퍼런스-솔루션 러너 — 약한 체크를 강한 체크로 올리는 *작성 보조*(dev tooling).

각 레슨의 `exercise.solution`을 engine 포착 primitive(captureDocument)로 실행해
관찰된 사실(stdout/명명 변수/shape/dtype)으로 brittleness를 인지한 강한 체크
후보를 제안한다.

**제안만 출력한다. YAML을 절대 수정하지 않는다. endpoint가 아니다.**
커리큘럼은 사람이 한 강의씩 작성하므로(CLAUDE.md), 이 도구는 사람이 검수·패치할
초안을 stdout으로 낼 뿐이다. 측정 정직성: value-equality(strength 1.0) 자동 승격은
금지하고, 항상 "대안 정답 프로그램으로 검증 후 승격" 캐비엇을 단다.

실행:  uv run python -X utf8 tests/authorReferenceChecks.py <category> [contentId]
"""
from __future__ import annotations

import argparse
import asyncio
from dataclasses import dataclass, field
from typing import Any


STRONG_CHECK_TYPES = ("output", "variable", "contains")
PROPOSAL_CONFIDENCE = 0.6  # 기본 제안 신뢰도 — brittleness 인지. 1.0은 사람이 대안검증 후.


@dataclass(frozen=True, slots=True)
class CheckProposal:
    checkType: str  # "variable" | "output" | "noError"
    variableName: str = ""
    confidence: float = PROPOSAL_CONFIDENCE
    requiresAlternative: bool = False
    rationale: str = ""


@dataclass(frozen=True, slots=True)
class SectionProposal:
    sectionId: str
    currentCheckType: str
    check: CheckProposal
    notes: list[str] = field(default_factory=list)


def pickPrimaryVariable(variables: list[Any]) -> Any | None:
    """솔루션 실행 후 '결과'로 볼 가장 그럴듯한 변수 — 마지막 사용자 변수.

    import 별칭(np/pd 등 짧은 모듈성 이름)·언더스코어 시작은 제외. 휴리스틱이므로
    제안일 뿐이고, 사람이 실제 학습 목표 변수로 바꿀 수 있다.
    """
    candidates = [
        variable for variable in variables
        if not variable.name.startswith("_") and variable.typeName != "module"
    ]
    return candidates[-1] if candidates else None


def proposeCheck(capture: Any, currentCheckType: str) -> CheckProposal:
    """포착된 사실로부터 강한 체크 후보를 제안한다(brittleness 인지)."""
    if capture.status == "error":
        return CheckProposal(
            checkType="noError",
            confidence=PROPOSAL_CONFIDENCE,
            rationale="솔루션이 이 환경에서 실행 실패 — 데이터/패키지/키 의존일 수 있음. 강한 체크 제안 보류.",
        )
    primary = pickPrimaryVariable(list(capture.variables))
    if primary is not None:
        return CheckProposal(
            checkType="variable",
            variableName=primary.name,
            confidence=PROPOSAL_CONFIDENCE,
            requiresAlternative=True,
            rationale=f"명명 변수 '{primary.name}'를 직접 검사 — stdout 포맷에 덜 취약. "
            "정답이 여러 형태일 수 있으니 대안 정답 프로그램으로 검증 후 strength 1.0 승격.",
        )
    if capture.stdout.strip():
        return CheckProposal(
            checkType="output",
            confidence=PROPOSAL_CONFIDENCE,
            requiresAlternative=True,
            rationale="결과 변수가 또렷하지 않아 stdout 비교 제안 — float/dict 순서 등으로 brittle할 수 있음. "
            "정규화·대안 정답 검증 후에만 승격.",
        )
    return CheckProposal(
        checkType="noError",
        rationale="관찰 가능한 출력/변수가 없음(부수효과형) — noError 유지 또는 self-explanation 권장.",
    )


def proposeSection(sectionId: str, capture: Any, currentCheckType: str) -> SectionProposal:
    primary = pickPrimaryVariable(list(capture.variables))
    check = proposeCheck(capture, currentCheckType)
    notes: list[str] = []
    if currentCheckType in STRONG_CHECK_TYPES:
        notes.append(f"이미 강한 체크({currentCheckType}) — 제안은 교차검증용.")
    if check.requiresAlternative:
        notes.append("승격 전 대안 정답 프로그램 통과 필수(false-negative 방지).")
    return SectionProposal(
        sectionId=sectionId,
        currentCheckType=currentCheckType or "(없음)",
        check=check,
        notes=notes,
    )


def _clip(text: str, limit: int = 200) -> str:
    text = text.strip()
    return text if len(text) <= limit else text[:limit] + "…"


def formatProposal(lessonKey: str, proposal: SectionProposal) -> str:
    lines = [
        f"[{lessonKey}#{proposal.sectionId}] 현재 체크: {proposal.currentCheckType}",
        f"  제안 체크: type={proposal.check.checkType}"
        + (f" variableName={proposal.check.variableName}" if proposal.check.variableName else "")
        + f" (confidence={proposal.check.confidence})",
        f"    근거: {proposal.check.rationale}",
    ]
    for note in proposal.notes:
        lines.append(f"  · {note}")
    return "\n".join(lines)


async def _runCumulative(solutions: list[str]) -> Any:
    """섹션 솔루션들을 누적 실행한다 — 한 레슨의 섹션은 앞 섹션의 import/상태에 의존하므로,
    현재 섹션까지의 모든 솔루션을 한 문서로 실행한 뒤의 상태를 포착한다(격리 실행은 NameError)."""
    from codaro.document.models import BlockConfig, CodaroDocument
    from codaro.kernel.documentExecution import captureDocument
    from codaro.kernel.manager import SessionManager

    blocks = [
        BlockConfig(id=f"s{index}", type="code", content=content)
        for index, content in enumerate(solutions)
    ]
    document = CodaroDocument(id="ref", title="reference", blocks=blocks)
    return await captureDocument(document, manager=SessionManager())


async def _proposeForCategory(category: str, contentId: str | None) -> int:
    from codaro.curriculum.sectionContract import lessonContractFromYaml
    from codaro.curriculum.studyLoader import StudyLoader, _curriculaPythonRoot

    loader = StudyLoader(str(_curriculaPythonRoot()))
    summaries = loader.listContents(category)
    if contentId:
        summaries = [summary for summary in summaries if summary.contentId == contentId]
    if not summaries:
        print(f"카테고리/콘텐츠를 찾을 수 없음: {category}/{contentId or '*'}")
        return 1

    proposed = 0
    for summary in summaries:
        study = loader.loadStudy(category, summary.contentId)
        lesson = lessonContractFromYaml(study, fallbackTitle=summary.contentId)
        lessonKey = f"{category}/{summary.contentId}"
        withSolution = [section for section in lesson.sections if section.exercise.solution.strip()]
        solutions = [section.exercise.solution for section in withSolution]
        for index, section in enumerate(withSolution):
            # 현재 섹션까지 누적 실행한 상태를 포착(앞 섹션 의존성 충족).
            capture = await _runCumulative(solutions[: index + 1])
            currentCheckType = str((section.exercise.check or section.check or {}).get("type") or "")
            proposal = proposeSection(section.id or "(이름없음)", capture, currentCheckType)
            print(formatProposal(lessonKey, proposal))
            print()
            proposed += 1
    print(f"총 {proposed}개 섹션 제안 출력(YAML 미수정).")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="레퍼런스-솔루션 강한-체크 제안기(출력 전용).")
    parser.add_argument("category", help="커리큘럼 카테고리 키(예: numpy)")
    parser.add_argument("contentId", nargs="?", default=None, help="특정 레슨 id(생략 시 카테고리 전체)")
    args = parser.parse_args()
    return asyncio.run(_proposeForCategory(args.category, args.contentId))


if __name__ == "__main__":
    raise SystemExit(main())
