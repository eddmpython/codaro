from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OVERVIEW = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumOverview.tsx"
LOCALE_COPY = ROOT / "editor" / "src" / "lib" / "localeCopy.ts"


def testEvidenceStatusLeadsWithAutomaticLearningFeedback() -> None:
    overview = OVERVIEW.read_text(encoding="utf-8")
    locale = LOCALE_COPY.read_text(encoding="utf-8")

    assert 't("learning.evidence.autoRecord")' in overview
    assert '"learning.evidence.autoRecord": "풀이 검증 결과는 자동으로 기록됩니다."' in locale
    assert (
        '"learning.evidence.autoRecord": '
        '"Verified practice results are recorded automatically."'
    ) in locale

    assert "강한 검증 {summary.events}건" not in overview
    assert "격리된 충돌 {summary.conflicts}건" not in overview


def testEvidenceCountsRemainAvailableWithoutLeadingTheLesson() -> None:
    overview = OVERVIEW.read_text(encoding="utf-8")
    locale = LOCALE_COPY.read_text(encoding="utf-8")

    assert "data-learning-evidence-events={summary.events}" in overview
    assert "data-learning-evidence-conflicts={summary.conflicts}" in overview
    assert 'label={t("learning.evidence.export", { count: summary.events })}' in overview
    assert (
        '"learning.evidence.export": "학습 작업 내보내기 · 검증 기록 {count}건 포함"'
        in locale
    )
    assert (
        '"learning.evidence.export": '
        '"Export learning work · includes {count} verification records"'
    ) in locale

