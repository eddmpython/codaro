"""레슨 단위 약점 audit — Curriculum OS 위에서 돌아가는 영구 게이트.

기존 quality-matrix는 구조 완결성을 본다(모든 레슨이 structured 됐는지,
solutions가 있는지). 이 audit은 한 단계 더 들어가서 plan 가시성과 학습 흐름
약점을 본다.

체크 (정적):
1. **orphanInPlan**: lessonOutcomes에 등록되지 않은 레슨 (plan에서 안 보임)
2. **noExercise**: 모든 섹션에 exercise가 없음
3. **exerciseWithoutCheck**: exercise는 있는데 check 블록이 없음
4. **shortGoal**: section.goal이 20자 미만
5. **noHint**: exercise.hints가 비어 있음
6. **sectionIdMissing**: taxonomy.sectionOutcomes 에 매핑된 section id 가 YAML 의
   실제 section id 와 불일치 — credit 흐름이 무효 section id 를 신뢰하는 위험.

체크 (신호 강도, 정보성 + 회귀 차단):
8. **weakCheckSignal**(정보성): exercise+check는 있으나 강한 체크(output/variable/
   contains)가 0개 — noError-only 레슨. 약한 신호의 규모를 가시화한다.
9. **placeholderPredict**(정보성): predict 기대값이 placeholder("직접 …주세요").
10. **weakSignalRegression**(임계 0): `tests/_strongSignalCategories.txt` allowlist에
   등록된(정리 완료) 카테고리에서 약한 신호가 재등장하면 차단. 콘텐츠는 사람이 강화하고,
   정리된 카테고리는 회귀하지 못하게 막는다(엔진은 측정, 작성은 사람).

체크 (카테고리 단위):
7. **categoryWithoutProject**: deliverable-driven plan 합성을 위한 project lesson
   이 카테고리 내에 0 개. 단, 명시적 유틸 모듈 카테고리는 면제.

체크 (runtime, 정보성):
6. **runtimeWeakOutcomes**: 학습자 학습자 상태(`learnerState.db`)에서 mastery<0.3 또는
   confidence<0.2인 outcome — 사람이 강의를 보강해야 할 신호.
7. **runtimeRepeatedMisconceptions**: 같은 misconception을 두 번 이상 hit한 학습자 기록 —
   강의가 그 오개념을 충분히 다루지 못했다는 신호.

runtime 신호는 임계치를 깨지 않는다 (informational only). 게이트 통과/실패는 정적 체크만 결정한다.

생성하는 리포트: output/test-runner/curriculum-weakness-audit/curriculum-weakness-report.json

종료 코드:
- 0: 임계치 미만의 약점 (passed)
- 1: 약점이 임계치 초과 (failed)
"""
from __future__ import annotations

import json
import os
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT / "src") not in sys.path:
    sys.path.insert(0, str(ROOT / "src"))


REPORT_PATH = ROOT / "output" / "test-runner" / "curriculum-weakness-audit" / "curriculum-weakness-report.json"

# 임계치 — orphan 0개, noExercise 0개, exerciseWithoutCheck 0개, noHint 0개 유지.
# weakSignalRegression: strong-signal allowlist에 등록된 카테고리는 약한 신호 0개 강제
# (정리된 카테고리의 회귀 차단). weakCheckSignal/placeholderPredict 자체는 정보성(아래).
THRESHOLDS: dict[str, int] = {
    "orphanInPlan": 0,
    "noExercise": 0,
    "exerciseWithoutCheck": 0,
    "noHint": 0,
    "sectionIdMissing": 0,
    "categoryWithoutProject": 0,
    "weakSignalRegression": 0,
}

# 강한 신호 체크 타입 — noError 는 "예외 안 남"이라 약한 신호로 분류.
STRONG_CHECK_TYPES: frozenset[str] = frozenset({"output", "variable", "contains"})
# predict 기대값 placeholder 마커 — "(직접 실행해 본 값을 적어주세요)" 류.
PLACEHOLDER_MARKERS: tuple[str, ...] = ("직접", "주세요")
# 강한 신호로 정리 완료된 카테고리(회귀 차단). tests/_strongSignalCategories.txt.
STRONG_SIGNAL_ALLOWLIST_PATH = ROOT / "tests" / "_strongSignalCategories.txt"


def _loadStrongSignalCategories() -> frozenset[str]:
    if not STRONG_SIGNAL_ALLOWLIST_PATH.exists():
        return frozenset()
    lines = STRONG_SIGNAL_ALLOWLIST_PATH.read_text(encoding="utf-8").splitlines()
    return frozenset(
        stripped for line in lines
        if (stripped := line.strip()) and not stripped.startswith("#")
    )


def _sectionCheckTypes(section: dict[str, Any]) -> list[str]:
    types: list[str] = []
    for blockKey in ("check", "checks"):
        block = section.get(blockKey)
        if isinstance(block, dict) and isinstance(block.get("type"), str):
            types.append(block["type"])
        elif isinstance(block, list):
            types.extend(c["type"] for c in block if isinstance(c, dict) and isinstance(c.get("type"), str))
    return types


def _sectionHasPlaceholderPredict(section: dict[str, Any]) -> bool:
    exercise = section.get("exercise")
    if not isinstance(exercise, dict):
        return False
    predict = exercise.get("predict")
    if not isinstance(predict, dict):
        return False
    for field in ("expectedValue", "expectedShape", "expectedDtype", "expectedError"):
        value = predict.get(field)
        if isinstance(value, str) and all(marker in value for marker in PLACEHOLDER_MARKERS):
            return True
    return False

# 명시적으로 project lesson 면제되는 카테고리.
# - builtins: 표준라이브러리 유틸 단원 모음. 별도 deliverable 없음.
# - excel: deprecated 스텁 (실제 xlwings 트랙은 xlwings 카테고리).
# - practical: intro 전용 카테고리.
PROJECT_EXEMPT_CATEGORIES: frozenset[str] = frozenset({"builtins", "excel", "practical"})

# runtime mastery 임계 — Predict-Run-Reconcile-Adapt 루프와 동일.
RUNTIME_MASTERY_THRESHOLD = 0.3
RUNTIME_CONFIDENCE_THRESHOLD = 0.2

# 환경변수로 학습자 상태 DB 경로를 주입할 수 있다 (CI/감사에서 익명 aggregate DB 사용).
RUNTIME_STATE_ENV = "CODARO_LEARNER_STATE_DB"


def _runGitHead() -> str | None:
    headPath = ROOT / ".git" / "HEAD"
    if not headPath.exists():
        return None
    head = headPath.read_text(encoding="utf-8").strip()
    if head.startswith("ref: "):
        refPath = ROOT / ".git" / head.removeprefix("ref: ").strip()
        if refPath.exists():
            return refPath.read_text(encoding="utf-8").strip()
    return head or None


def auditCurriculum() -> dict[str, Any]:
    from codaro.curriculum.studyLoader import StudyLoader
    from codaro.curriculum.taxonomy import loadTaxonomy

    loader = StudyLoader(str(ROOT / "curricula" / "python"))
    taxonomy = loadTaxonomy()
    taxonomyKeys = set(taxonomy.lessonOutcomes.keys())
    strongSignalCategories = _loadStrongSignalCategories()

    lessonReports: list[dict[str, Any]] = []
    flagCounts: dict[str, int] = {}
    # 정보성 집계(게이트 미차단) — 약한 신호의 가시화.
    weakCheckSignalCount = 0
    placeholderPredictCount = 0
    for category in loader.listCategories():
        for summary in loader.listContents(category.key):
            key = f"{category.key}/{summary.contentId}"
            try:
                data = loader.loadStudy(category.key, summary.contentId)
            except FileNotFoundError:
                continue
            flags: list[str] = []

            # 1. orphan: lessonOutcomes에 등록 안 됨 + meta에도 outcomes 없음
            metaOutcomes = data.get("meta", {}).get("outcomes") if isinstance(data.get("meta"), dict) else None
            if key not in taxonomyKeys and not metaOutcomes:
                flags.append("orphanInPlan")

            sections = data.get("sections") or []
            exerciseSections = 0
            checkSections = 0
            hintMissing = 0
            shortGoals = 0
            sectionIds: set[str] = set()
            lessonCheckTypes: list[str] = []
            lessonHasPlaceholder = False
            for section in sections:
                if not isinstance(section, dict):
                    continue
                sectionId = section.get("id")
                if isinstance(sectionId, str) and sectionId:
                    sectionIds.add(sectionId)
                goal = (section.get("goal") or "").strip()
                if goal and len(goal) < 20:
                    shortGoals += 1
                exercise = section.get("exercise")
                if isinstance(exercise, dict):
                    exerciseSections += 1
                    hints = exercise.get("hints") or []
                    if not hints:
                        hintMissing += 1
                if section.get("check") or section.get("checks"):
                    checkSections += 1
                lessonCheckTypes.extend(_sectionCheckTypes(section))
                if _sectionHasPlaceholderPredict(section):
                    lessonHasPlaceholder = True

            taxonomyRecord = taxonomy.lessonOutcomes.get(key)
            if taxonomyRecord and taxonomyRecord.sectionOutcomes:
                unknownSectionIds = [
                    sid for sid in taxonomyRecord.sectionOutcomes.keys()
                    if sid not in sectionIds
                ]
                if unknownSectionIds:
                    flags.append("sectionIdMissing")

            # 2. noExercise: section은 있는데 exercise가 하나도 없음
            #    (intro convention `00_*` 는 개념 소개 전용으로 exercise 가 없는 게 정상)
            isIntroLesson = summary.contentId.startswith("00_")
            if sections and exerciseSections == 0 and not isIntroLesson:
                flags.append("noExercise")

            # 3. exerciseWithoutCheck: exercise는 있는데 check가 하나도 없음
            if exerciseSections > 0 and checkSections == 0:
                flags.append("exerciseWithoutCheck")

            # 4. noHint: 모든 exercise에 hints가 비어 있음
            if exerciseSections > 0 and hintMissing == exerciseSections:
                flags.append("noHint")

            # 5. shortGoal: 비중 50% 이상이 짧은 목표면 신호
            if sections and shortGoals * 2 > len(sections):
                flags.append("shortGoal")

            # 약한 신호(정보성) — 강한 체크가 0개이거나 predict가 placeholder.
            isWeakCheck = (
                exerciseSections > 0
                and checkSections > 0
                and not any(t in STRONG_CHECK_TYPES for t in lessonCheckTypes)
            )
            if isWeakCheck:
                weakCheckSignalCount += 1
            if lessonHasPlaceholder:
                placeholderPredictCount += 1
            # 회귀 차단 — 정리 완료(allowlist) 카테고리는 약한 신호 0개여야 한다.
            if category.key in strongSignalCategories and (isWeakCheck or lessonHasPlaceholder):
                flags.append("weakSignalRegression")

            for flag in flags:
                flagCounts[flag] = flagCounts.get(flag, 0) + 1

            if flags:
                lessonReports.append({
                    "key": key,
                    "title": summary.title,
                    "sections": len(sections),
                    "exercises": exerciseSections,
                    "checks": checkSections,
                    "flags": flags,
                })

    # category-level project gate.
    categoryProjects: dict[str, int] = {}
    for cat in loader.listCategories():
        categoryProjects.setdefault(cat.key, 0)
    for key, record in taxonomy.lessonOutcomes.items():
        if record.lessonRole == "project":
            cat = key.split("/")[0]
            categoryProjects[cat] = categoryProjects.get(cat, 0) + 1
    missingProjectCategories = [
        cat for cat, count in categoryProjects.items()
        if count == 0 and cat not in PROJECT_EXEMPT_CATEGORIES
    ]
    flagCounts["categoryWithoutProject"] = len(missingProjectCategories)
    # 정보성(미차단) — 약한 신호의 규모를 가시화한다. 사람-작성 강화의 측정 지표.
    flagCounts["weakCheckSignal"] = weakCheckSignalCount
    flagCounts["placeholderPredict"] = placeholderPredictCount

    breaches = []
    for flag, threshold in THRESHOLDS.items():
        count = flagCounts.get(flag, 0)
        if count > threshold:
            breaches.append({"flag": flag, "count": count, "threshold": threshold})

    return {
        "lessonReports": lessonReports,
        "missingProjectCategories": missingProjectCategories,
        "categoryProjects": dict(sorted(categoryProjects.items())),
        "flagCounts": flagCounts,
        "thresholds": THRESHOLDS,
        "breaches": breaches,
        "lessonsWithFlags": len(lessonReports),
    }


def _resolveLearnerStatePath() -> Path | None:
    """학습자 상태 DB 경로를 결정한다 (환경변수 > 기본 경로)."""
    envPath = os.environ.get(RUNTIME_STATE_ENV)
    if envPath:
        candidate = Path(envPath)
        return candidate if candidate.exists() else None
    default = Path.home() / ".codaro" / "learnerState.db"
    return default if default.exists() else None


def auditRuntimeWeakness(dbPath: Path | None) -> dict[str, Any]:
    """학습자 상태에서 보강이 필요한 outcome과 반복 misconception을 추출한다.

    DB가 없으면 빈 결과 반환 — gate를 깨지 않는다. 정보성 신호이며,
    사람이 강의를 보강하는 데 사용한다 (bulk regeneration 금지).
    """
    if dbPath is None:
        return {
            "available": False,
            "weakOutcomes": [],
            "repeatedMisconceptions": [],
            "perOutcomeHitCounts": {},
            "thresholds": {
                "mastery": RUNTIME_MASTERY_THRESHOLD,
                "confidence": RUNTIME_CONFIDENCE_THRESHOLD,
            },
        }

    from codaro.curriculum.learnerState import LearnerStateStore

    store = LearnerStateStore(dbPath)

    weakOutcomes: list[dict[str, Any]] = []
    for mastery in store.listMastery():
        if (
            mastery.score < RUNTIME_MASTERY_THRESHOLD
            or mastery.confidence < RUNTIME_CONFIDENCE_THRESHOLD
        ):
            weakOutcomes.append({
                "outcomeId": mastery.outcomeId,
                "score": round(mastery.score, 4),
                "confidence": round(mastery.confidence, 4),
                "successCount": mastery.successCount,
                "failureCount": mastery.failureCount,
            })

    repeats = store.listRepeatedMisconceptions()
    repeatedMisconceptions = [
        {
            "misconceptionId": hit.misconceptionId,
            "outcomeId": hit.outcomeId,
            "hitCount": hit.hitCount,
            "firstSeenAt": hit.firstSeenAt,
            "lastSeenAt": hit.lastSeenAt,
        }
        for hit in repeats
    ]

    perOutcome: dict[str, int] = {}
    for hit in store.listMisconceptionHits():
        perOutcome[hit.outcomeId] = perOutcome.get(hit.outcomeId, 0) + hit.hitCount

    return {
        "available": True,
        "dbPath": str(dbPath),
        "weakOutcomes": sorted(weakOutcomes, key=lambda item: item["outcomeId"]),
        "repeatedMisconceptions": sorted(
            repeatedMisconceptions, key=lambda item: item["misconceptionId"]
        ),
        "perOutcomeHitCounts": dict(sorted(perOutcome.items())),
        "thresholds": {
            "mastery": RUNTIME_MASTERY_THRESHOLD,
            "confidence": RUNTIME_CONFIDENCE_THRESHOLD,
        },
    }


def main() -> int:
    startedAt = datetime.now(UTC).isoformat()
    startedAtNs = int(datetime.now(UTC).timestamp() * 1_000_000_000)
    audit = auditCurriculum()
    runtime = auditRuntimeWeakness(_resolveLearnerStatePath())
    completedAt = datetime.now(UTC).isoformat()

    passed = not audit["breaches"]
    report = {
        "gate": "curriculum-weakness-audit",
        "passed": passed,
        "status": "passed" if passed else "failed",
        "startedAt": startedAt,
        "completedAt": completedAt,
        "gitHead": _runGitHead(),
        "reportPath": str(REPORT_PATH.relative_to(ROOT)),
        "summary": {
            "lessonsWithFlags": audit["lessonsWithFlags"],
            "flagCounts": audit["flagCounts"],
            "thresholds": audit["thresholds"],
            "breaches": audit["breaches"],
            "missingProjectCategories": audit["missingProjectCategories"],
            "categoryProjects": audit["categoryProjects"],
            "runtime": {
                "available": runtime["available"],
                "weakOutcomeCount": len(runtime["weakOutcomes"]),
                "repeatedMisconceptionCount": len(runtime["repeatedMisconceptions"]),
            },
        },
        "lessonReports": audit["lessonReports"],
        "missingProjectCategories": audit["missingProjectCategories"],
        "categoryProjects": audit["categoryProjects"],
        "runtime": runtime,
    }

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    if passed:
        runtimeNote = ""
        if runtime["available"]:
            runtimeNote = (
                f" · runtime: {len(runtime['weakOutcomes'])} weak outcomes, "
                f"{len(runtime['repeatedMisconceptions'])} repeated misconceptions"
            )
        signalNote = (
            f" · signal: {audit['flagCounts'].get('weakCheckSignal', 0)} weak-check lessons, "
            f"{audit['flagCounts'].get('placeholderPredict', 0)} placeholder-predict lessons"
        )
        print(
            "ok: curriculum weakness audit passed "
            f"({audit['lessonsWithFlags']} lessons with at least one informational flag)"
            f"{signalNote}{runtimeNote}"
        )
        return 0
    else:
        print("FAIL: curriculum weakness audit breached thresholds:")
        for breach in audit["breaches"]:
            print(f"  - {breach['flag']}: {breach['count']} lessons (threshold {breach['threshold']})")
        return 1


if __name__ == "__main__":
    sys.exit(main())
