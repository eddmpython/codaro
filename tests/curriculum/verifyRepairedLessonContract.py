"""정비된 연습 섹션의 채점 계약을 기계로 판정하는 래칫 게이트.

`auditCurriculumExecutability` 는 코드가 도는지를 본다. 이 게이트는 그 위에서
**채점이 실제로 학습을 요구하는지**를 본다. 두 질문은 다르다. 정답 코드가 돌고
기대값과 맞아도, 학습자가 아무것도 고치지 않은 starterCode 가 같은 기대값을
내면 그 연습은 채점하는 척만 하는 것이다.

검사 단위는 레슨이 아니라 **섹션**이다. `exercise.solution` 과
`check.type == outputExact` 를 둘 다 갖춘 섹션을 "정비된 섹션"으로 보고 그
섹션에만 엄격 계약을 적용한다. 아직 정비 전인 섹션은 실패로 세지 않는다.
캠페인이 진행될수록 검사 대상이 늘어나는 래칫이며, 이미 정비한 것이 뒤로
미끄러지는 것을 막는 것이 이 게이트의 존재 이유다.

계약 5조 (정비된 섹션에 한함):
- C1 solutionMatch    : solution 실행 출력이 outputExact 와 일치한다.
- C2 starterDistinct  : starterCode 를 그대로 실행하면 outputExact 와 다르다.
- C3 stableRerun      : solution 을 두 번 실행하면 같은 출력이 나온다.
- C4a clockBound      : 오늘 안에는 같아 보여 C3 가 못 잡지만 날짜·기계가 바뀌면 깨지는
                        시각·환경 호출을 결과 경로에 쓰지 않는다.
- C4b randomLeak      : 난수 상태를 바꿔 두 번 실행해도 결과가 같다. 난수를 부르는 것은
                        되고, 뽑힌 값이 기대값에 흘러드는 것이 안 된다.
- C5 distinctPhrasing : 같은 레슨 안에서 goal / why / prompt 를 복사해 쓰지 않는다.

실행:
    uv run python -X utf8 tests/curriculum/verifyRepairedLessonContract.py
    uv run python -X utf8 tests/curriculum/verifyRepairedLessonContract.py --root curricula/python/basics/builtins
    uv run python -X utf8 tests/curriculum/verifyRepairedLessonContract.py --root curricula/python/basics/builtins/03_datetime.yaml
"""
from __future__ import annotations

import argparse
import ast
import json
import os
import sys
import tempfile
from collections import Counter, defaultdict
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

from auditCurriculumExecutability import (  # noqa: E402
    ROOT,
    _BLANK_MARKER,
    _configureHeadless,
    execCodeCapturingOutput,
    loadYaml,
)
from codaro.curriculum.outputMatch import matchLearningOutput  # noqa: E402

CURRICULA_DIR = ROOT / "curricula" / "python"
REPORT_PATH = (
    ROOT / "output" / "test-runner" / "repaired-lesson-contract" / "repaired-lesson-contract-report.json"
)

# C4 는 C3(두 번 실행 비교)의 **사각지대만** 메운다. 이 구분이 이 게이트의 핵심이다.
#
# 난수를 부르는 것 자체는 결함이 아니다. `dice = randint(1, 6)` 뒤에 `1 <= dice <= 6` 을 두면
# 뽑힌 값이 무엇이든 결과는 늘 True 이고, 이것이 난수를 다루는 올바른 설계다. 결함은 난수를
# 부르는 것이 아니라 **뽑힌 값이 기대값에 흘러드는 것**이다. 그래서 C4a 는 이름을 세지 않고
# 난수 상태를 서로 다르게 준 채 두 번 실행해 결과가 흔들리는지 본다.
#
# 마찬가지로 time.time() / perf_counter() / uuid4() 는 값이 결과에 흐르면 C3 가 이미 잡는다
# (해상도가 높아 두 번 실행하면 반드시 다르다). 정적 목록에 넣으면 오검출만 만든다.
#
# 정적 목록에 남길 값은 "오늘 안에는 두 번 실행해도 같아서 C3 가 구조적으로 못 잡고, 날짜나
# 기계가 바뀌면 반드시 깨지는 것"뿐이다.
CLOCK_BOUND_CALLS = {
    "today": "date.today() 는 오늘 안에는 늘 같아서 재실행 검사로 잡히지 않고, 날짜가 바뀌는 순간 깨진다. 기준 날짜를 코드에 고정한다.",
    "now": "now() 는 실행하는 날에 묶인다. 날짜 부분이 결과에 흐르면 내일 깨진다. 고정 datetime 을 쓴다.",
    "utcnow": "utcnow() 는 실행하는 날에 묶인다. 고정 datetime 을 쓴다.",
    "getcwd": "getcwd() 는 실행 위치에 묶인다. 기계가 바뀌면 깨진다.",
    "gethostname": "gethostname() 은 실행 기계에 묶인다.",
    "getpid": "getpid() 는 한 프로세스 안에서는 같아서 재실행 검사로 잡히지 않고, 다음 실행에서 달라진다.",
}

# localtime() / gmtime() 은 인자를 주면 결정적이다. 인자 없이 부를 때만 현재 시각에 묶인다.
CLOCK_BOUND_WHEN_NO_ARGS = {
    "localtime": "인자 없는 localtime() 은 현재 시각과 시간대에 묶인다. 고정 타임스탬프를 넘긴다.",
    "gmtime": "인자 없는 gmtime() 은 현재 시각에 묶인다. 고정 타임스탬프를 넘긴다.",
}

# 값 자체를 결과로 쓰지 않아 안전한 경우를 위한 예외 표식.
# 섹션이 check.nonDeterministicReason 을 명시하면 C4 를 면제하되 근거를 리포트에 남긴다.
EXEMPT_KEY = "nonDeterministicReason"

# C4a: 난수 상태를 서로 다르게 주고 두 번 실행할 때 쓰는 씨앗. 값 자체에 의미는 없고
# 서로 충분히 다르기만 하면 된다.
RANDOM_PROBE_SEEDS = (11, 977)


def sectionExercise(section: dict[str, Any]) -> dict[str, Any]:
    exercise = section.get("exercise")
    return exercise if isinstance(exercise, dict) else {}


def sectionCheck(section: dict[str, Any]) -> dict[str, Any]:
    check = section.get("check")
    return check if isinstance(check, dict) else {}


def textOf(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def isRepairedSection(section: dict[str, Any]) -> bool:
    """정비된 섹션 = 정답 코드와 정확 일치 기대값을 둘 다 가진 섹션."""
    exercise = sectionExercise(section)
    check = sectionCheck(section)
    return bool(
        textOf(exercise.get("solution"))
        and check.get("type") == "outputExact"
        and textOf(check.get("outputExact"))
    )


def clockBoundCalls(code: str) -> list[tuple[str, str]]:
    """C3 가 구조적으로 못 잡는 시각·환경 의존 호출만 모은다.

    호출 형태(`x()` / `mod.x()`)만 본다. 변수명이 우연히 같은 것은 세지 않는다.
    `localtime(고정값)` 처럼 인자를 받아 결정적으로 바뀌는 호출은 세지 않는다."""
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return []
    found: dict[str, str] = {}
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        func = node.func
        if isinstance(func, ast.Attribute):
            name = func.attr
        elif isinstance(func, ast.Name):
            name = func.id
        else:
            continue
        if name in CLOCK_BOUND_CALLS:
            found[name] = CLOCK_BOUND_CALLS[name]
        elif name in CLOCK_BOUND_WHEN_NO_ARGS and not node.args and not node.keywords:
            found[name] = CLOCK_BOUND_WHEN_NO_ARGS[name]
    return sorted(found.items())


def runSolution(code: str, namespace: dict[str, Any], label: str) -> tuple[bool, str, str]:
    category, detail, output = execCodeCapturingOutput(code, dict(namespace), label)
    return category == "ok", detail, output


def randomSensitiveOutputs(code: str, namespace: dict[str, Any], label: str) -> tuple[str, str] | None:
    """난수 상태를 서로 다르게 준 채 두 번 실행해 뽑힌 값이 결과에 흘러드는지 본다.

    학습 코드가 `random.seed(42)` 로 시드를 고정하더라도 그 호출을 무력화한다. 시드를 박아
    두면 오늘은 통과하지만 파이썬 버전이 난수열을 바꾸는 날 콘텐츠가 통째로 깨지기 때문이다.
    난수를 쓰지 않는 코드는 두 실행이 같으므로 None 을 돌려준다."""
    if "random" not in code and "Random" not in code:
        return None
    import random as randomModule

    savedState = randomModule.getstate()
    originalSeed = randomModule.seed
    outputs: list[str] = []
    try:
        randomModule.seed = lambda *args, **kwargs: None
        for seedValue in RANDOM_PROBE_SEEDS:
            originalSeed(seedValue)
            _ok, _detail, output = runSolution(code, namespace, f"{label}#seed{seedValue}")
            outputs.append(output)
    finally:
        randomModule.seed = originalSeed
        randomModule.setstate(savedState)
    if outputs[0] == outputs[1]:
        return None
    return outputs[0], outputs[1]


def checkLesson(path: Path) -> dict[str, Any]:
    """레슨 하나를 노트북처럼 누적 실행하며 정비된 섹션의 계약을 판정한다."""
    relPath = path.relative_to(ROOT).as_posix()
    data = loadYaml(path)
    if data is None or not isinstance(data, dict):
        return {"path": relPath, "skipped": "not-a-lesson", "violations": [], "sections": []}
    if "_loadError" in data:
        return {
            "path": relPath,
            "violations": [{"section": "<file>", "rule": "load", "detail": data["_loadError"]}],
            "sections": [],
        }
    sections = data.get("sections")
    if not isinstance(sections, list):
        return {"path": relPath, "skipped": "no-sections", "violations": [], "sections": []}

    violations: list[dict[str, str]] = []
    repairedIds: list[str] = []
    totalExercises = 0
    phrasing: dict[str, dict[str, str]] = defaultdict(dict)
    namespace: dict[str, Any] = {"__name__": "__main__"}

    for section in sections:
        if not isinstance(section, dict):
            continue
        sectionId = str(section.get("id") or "<no-id>")
        snippet = section.get("snippet")
        if isinstance(snippet, str) and snippet.strip():
            # 누적 namespace 는 audit 과 같은 모델이다. snippet 실패 자체는 audit 이 소유하므로
            # 여기서는 이어지는 정답 실행이 참조할 상태만 만든다.
            execCodeCapturingOutput(snippet, namespace, f"{relPath}::{sectionId}.snippet")

        exercise = sectionExercise(section)
        if exercise:
            totalExercises += 1
        if not isRepairedSection(section):
            continue

        repairedIds.append(sectionId)
        check = sectionCheck(section)
        expected = textOf(check.get("outputExact"))
        caseInsensitive = check.get("caseInsensitive") is True
        solution = str(exercise.get("solution"))

        ok, detail, output = runSolution(solution, namespace, f"{relPath}::{sectionId}.solution")
        if not ok:
            violations.append(
                {"section": sectionId, "rule": "C1 solutionMatch", "detail": f"정답 실행 실패: {detail}"}
            )
            continue

        verdict = matchLearningOutput(expected, output, caseInsensitive=caseInsensitive)
        if not verdict.passed:
            violations.append(
                {
                    "section": sectionId,
                    "rule": "C1 solutionMatch",
                    "detail": f"기대 {expected!r} != 정답 출력 {output!r} ({verdict.tier})",
                }
            )

        starterCode = exercise.get("starterCode")
        if isinstance(starterCode, str) and starterCode.strip() and _BLANK_MARKER not in starterCode:
            starterOk, _starterDetail, starterOutput = runSolution(
                starterCode, namespace, f"{relPath}::{sectionId}.starterCode"
            )
            if starterOk:
                starterVerdict = matchLearningOutput(expected, starterOutput, caseInsensitive=caseInsensitive)
                if starterVerdict.passed:
                    violations.append(
                        {
                            "section": sectionId,
                            "rule": "C2 starterDistinct",
                            "detail": (
                                "학습자가 한 글자도 고치지 않은 starterCode 가 기대값과 일치한다. "
                                f"기대 {expected!r}. 이 연습은 채점하는 척만 한다."
                            ),
                        }
                    )

        _rerunOk, _rerunDetail, rerunOutput = runSolution(
            solution, namespace, f"{relPath}::{sectionId}.solution#2"
        )
        if rerunOutput != output:
            violations.append(
                {
                    "section": sectionId,
                    "rule": "C3 stableRerun",
                    "detail": f"같은 정답을 두 번 실행했는데 출력이 다르다: {output!r} -> {rerunOutput!r}",
                }
            )

        if not textOf(check.get(EXEMPT_KEY)):
            for name, reason in clockBoundCalls(solution):
                violations.append(
                    {
                        "section": sectionId,
                        "rule": "C4a clockBound",
                        "detail": f"정답이 {name}() 을 부른다. {reason}",
                    }
                )
            drift = randomSensitiveOutputs(solution, namespace, f"{relPath}::{sectionId}.solution")
            if drift is not None:
                violations.append(
                    {
                        "section": sectionId,
                        "rule": "C4b randomLeak",
                        "detail": (
                            "난수 상태를 바꾸면 결과가 달라진다. 뽑힌 값이 기대값에 흘러들었다는 뜻이다. "
                            f"{drift[0]!r} vs {drift[1]!r}. 범위·개수·소속·타입처럼 난수와 무관하게 "
                            "확정되는 성질을 결과로 삼는다."
                        ),
                    }
                )

        for field in ("goal", "why"):
            value = textOf(section.get(field))
            if value:
                phrasing[field][sectionId] = value
        promptText = textOf(exercise.get("prompt"))
        if promptText:
            phrasing["prompt"][sectionId] = promptText

    for field, bySection in phrasing.items():
        counts = Counter(bySection.values())
        for value, count in counts.items():
            if count < 2:
                continue
            owners = sorted(sid for sid, text in bySection.items() if text == value)
            violations.append(
                {
                    "section": ", ".join(owners),
                    "rule": "C5 distinctPhrasing",
                    "detail": f"{field} 문구가 {count}개 섹션에 똑같이 쓰였다: {value[:70]!r}",
                }
            )

    return {
        "path": relPath,
        "violations": violations,
        "sections": repairedIds,
        "repairedCount": len(repairedIds),
        "exerciseCount": totalExercises,
        "fullyRepaired": bool(totalExercises) and len(repairedIds) == totalExercises,
    }


def iterLessonPaths(root: Path) -> list[Path]:
    if root.is_file():
        return [root]
    return [
        path
        for path in sorted(root.rglob("*.yaml"))
        if not path.name.startswith("_") and path.name != "schema.yaml"
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=str(CURRICULA_DIR), help="레슨 파일 또는 디렉터리")
    parser.add_argument("--no-report", action="store_true", help="JSON 리포트를 쓰지 않는다")
    parser.add_argument("--quiet", action="store_true", help="위반만 출력한다")
    args = parser.parse_args()

    _configureHeadless()
    root = Path(args.root).resolve()
    if not root.exists():
        print(f"error: 경로가 없다: {root}", file=sys.stderr)
        return 2

    startedAt = datetime.now(UTC).isoformat()
    # 레슨 코드에는 파일 I/O 실습이 있어 CWD에 hello.txt 같은 산출물을 쓴다.
    # audit 게이트(runAudit)와 같은 방식으로 임시 스크래치 디렉터리로 chdir 해
    # 실행하고, 실습 산출물이 저장소 루트에 남아 root-clean 게이트를 깨뜨리지
    # 않게 한다.
    lessonPaths = iterLessonPaths(root)
    originalCwd = Path.cwd()
    with tempfile.TemporaryDirectory(prefix="codaroRepairedContract-") as scratchDir:
        os.chdir(scratchDir)
        try:
            lessons = [checkLesson(path) for path in lessonPaths]
        finally:
            os.chdir(originalCwd)
    graded = [lesson for lesson in lessons if not lesson.get("skipped")]
    violations = [
        {**violation, "path": lesson["path"]} for lesson in graded for violation in lesson["violations"]
    ]
    repairedSections = sum(lesson.get("repairedCount", 0) for lesson in graded)
    totalExercises = sum(lesson.get("exerciseCount", 0) for lesson in graded)
    fullyRepaired = sum(1 for lesson in graded if lesson.get("fullyRepaired"))

    byRule = Counter(violation["rule"] for violation in violations)

    if not args.quiet:
        print(f"repaired-lesson-contract: {len(graded)}개 레슨")
        print(f"  정비된 섹션      {repairedSections} / 연습 {totalExercises}")
        print(f"  전부 정비된 레슨 {fullyRepaired} / {len(graded)}")

    if violations:
        print(f"\n위반 {len(violations)}건:")
        for rule, count in byRule.most_common():
            print(f"  {rule:24s} {count}")
        print()
        for violation in violations:
            print(f"  {violation['path']}::{violation['section']}")
            print(f"    [{violation['rule']}] {violation['detail']}")
    elif not args.quiet:
        print("\nok: 정비된 섹션이 모두 채점 계약을 지킨다.")

    if not args.no_report:
        REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
        REPORT_PATH.write_text(
            json.dumps(
                {
                    "gate": "repaired-lesson-contract",
                    "passed": not violations,
                    "startedAt": startedAt,
                    "completedAt": datetime.now(UTC).isoformat(),
                    "lessonCount": len(graded),
                    "repairedSections": repairedSections,
                    "totalExercises": totalExercises,
                    "fullyRepairedLessons": fullyRepaired,
                    "violationCount": len(violations),
                    "violationsByRule": dict(byRule),
                    "violations": violations,
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        if not args.quiet:
            print(f"\nreport: {REPORT_PATH.relative_to(ROOT).as_posix()}")

    return 1 if violations else 0


if __name__ == "__main__":
    raise SystemExit(main())
