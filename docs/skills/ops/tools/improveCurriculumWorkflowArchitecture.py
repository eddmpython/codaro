from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[4]
CURRICULA_ROOT = ROOT / "curricula" / "python"

GENERIC_SECTION_GOALS = {
    "예제를 실행하고 핵심 동작을 직접 변형한다.",
}
GENERIC_SECTION_WHY = {
    "작은 실행과 검증 흐름이 실무 코드의 기본이다.",
}
GENERIC_EXERCISE_PROMPTS = {
    "예제를 실행한 뒤 값 하나를 바꿔 결과를 비교하세요.",
}
GENERIC_HINTS = {
    "기준 실행 후 값 하나를 바꿔 결과를 비교하세요.",
}
GENERIC_CHECK_VALUES = {
    "오류 없이 실행",
    "출력 또는 assert 확인",
}
GENERIC_WORKFLOW_LABELS = {
    "목표",
    "준비",
    "개념",
    "스니펫",
    "실습",
    "실행",
    "검증",
    "완료",
    "패키지",
    "첫실행",
    "환경",
}
GENERIC_WORKFLOW_PHRASES = (
    "무슨 공부",
    "설명과 팁",
    "따라 칠 코드",
    "입력과 검증",
    "YAML SSOT",
    "uv 준비",
    "assert와 결과 비교",
    "완료 판단",
)

CATEGORY_CONTEXTS: dict[str, dict[str, str]] = {
    "30days": {
        "label": "기초 자동화",
        "objective": "작은 파이썬 코드를 실행하고 출력과 값을 확인",
        "source": "문자열, 숫자, 변수 같은 예제 값",
        "operation": "기초 문법",
        "verification": "출력 또는 마지막 표현식 결과",
        "reuse": "작은 자동화 스크립트",
        "why": "기초 문법은 나중에 자동화 스크립트의 입력과 결과를 안정적으로 다루는 기준이 됩니다.",
    },
    "advancedPython": {
        "label": "고급 설계",
        "objective": "재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증",
        "source": "작은 함수와 상태",
        "operation": "추상화 패턴",
        "verification": "호출 결과와 예외 경계",
        "reuse": "라이브러리성 유틸리티",
        "why": "고급 문법은 복잡한 코드를 더 작고 검증 가능한 단위로 나누는 데 필요합니다.",
    },
    "pandas": {
        "label": "표 데이터",
        "objective": "표 데이터를 불러오고 정제, 집계, 검증 결과까지 연결",
        "source": "DataFrame 입력",
        "operation": "정제와 집계",
        "verification": "행/열 수와 요약값",
        "reuse": "데이터 리포트 자동화",
        "why": "표 데이터 처리는 리포트, 정산, 운영 지표 자동화의 기본 흐름입니다.",
    },
    "numpy": {
        "label": "배열 계산",
        "objective": "배열 입력을 만들고 벡터 연산 결과를 수치로 검증",
        "source": "배열 입력",
        "operation": "벡터화 계산",
        "verification": "shape와 수치 결과",
        "reuse": "계산 파이프라인",
        "why": "배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.",
    },
    "matplotlib": {
        "label": "시각 리포트",
        "objective": "분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증",
        "source": "시각화할 데이터",
        "operation": "차트 구성",
        "verification": "축/범례/파일 출력",
        "reuse": "보고서 차트",
        "why": "시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.",
    },
    "seaborn": {
        "label": "통계 시각화",
        "objective": "정리된 데이터를 통계 차트로 보고 분포와 관계를 검증",
        "source": "분석용 테이블",
        "operation": "통계 차트 구성",
        "verification": "분포, 그룹, 관계 패턴",
        "reuse": "탐색 리포트",
        "why": "통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.",
    },
    "plotly": {
        "label": "인터랙티브 차트",
        "objective": "데이터를 상호작용 차트로 구성하고 필터와 표시 상태를 검증",
        "source": "대시보드 데이터",
        "operation": "인터랙티브 시각화",
        "verification": "툴팁과 선택 상태",
        "reuse": "공유 대시보드",
        "why": "인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.",
    },
    "altair": {
        "label": "선언형 차트",
        "objective": "데이터와 인코딩 규칙을 분리해 재사용 가능한 차트를 구성",
        "source": "정리된 테이블",
        "operation": "채널 인코딩",
        "verification": "스케일과 마크 매핑",
        "reuse": "선언형 대시보드",
        "why": "선언형 차트는 데이터 필드와 시각 표현의 관계를 명확하게 관리하게 해줍니다.",
    },
    "excel": {
        "label": "엑셀 자동화",
        "objective": "엑셀 파일과 셀 범위를 읽고 쓰며 결과 파일을 검증",
        "source": "워크북과 시트",
        "operation": "셀/범위 조작",
        "verification": "저장 파일과 셀 값",
        "reuse": "업무 파일 자동화",
        "why": "엑셀 자동화는 반복 보고서와 정산 파일을 코드로 재현하는 실무 흐름입니다.",
    },
    "networkx": {
        "label": "그래프 분석",
        "objective": "노드와 엣지를 모델링하고 경로, 중심성, 연결 구조를 검증",
        "source": "관계 데이터",
        "operation": "그래프 알고리즘",
        "verification": "노드/엣지와 지표 값",
        "reuse": "관계 분석 리포트",
        "why": "그래프 분석은 사람, 장소, 시스템 사이의 관계와 흐름을 수치로 확인합니다.",
    },
    "folium": {
        "label": "지도 시각화",
        "objective": "위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증",
        "source": "위도/경도 데이터",
        "operation": "지도 레이어 구성",
        "verification": "마커와 저장 HTML",
        "reuse": "위치 기반 리포트",
        "why": "지도 시각화는 위치가 중요한 데이터를 실제 공간 맥락으로 검토하게 해줍니다.",
    },
    "scipy": {
        "label": "과학 계산",
        "objective": "수치 데이터를 모델에 넣고 계산 결과와 오차를 검증",
        "source": "수치 입력",
        "operation": "최적화/적분/신호 처리",
        "verification": "오차와 결과 범위",
        "reuse": "과학 계산 루틴",
        "why": "과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.",
    },
    "pydantic": {
        "label": "데이터 계약",
        "objective": "입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김",
        "source": "외부 입력",
        "operation": "스키마 검증",
        "verification": "성공 모델과 오류 메시지",
        "reuse": "API/자동화 입력 계약",
        "why": "데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.",
    },
    "polars": {
        "label": "컬럼형 표 분석",
        "objective": "컬럼형 데이터를 읽고 필터, 집계, 정렬 결과를 검증",
        "source": "Polars DataFrame",
        "operation": "컬럼 선택/필터/집계",
        "verification": "행 수, 컬럼 값, 집계 결과",
        "reuse": "대용량 데이터 분석 파이프라인",
        "why": "Polars는 큰 표 데이터를 빠르게 필터링하고 집계하는 분석 업무에 적합합니다.",
    },
    "duckdb": {
        "label": "SQL 분석",
        "objective": "테이블을 SQL로 조회하고 조건, 집계, 조인 결과를 검증",
        "source": "테이블과 SQL 쿼리",
        "operation": "SELECT/WHERE/GROUP BY/CTE",
        "verification": "쿼리 결과 행, 컬럼, 집계값",
        "reuse": "로컬 분석 SQL 리포트",
        "why": "DuckDB는 파일과 DataFrame을 SQL로 바로 분석해 반복 리포트를 빠르게 만들 수 있습니다.",
    },
    "regex": {
        "label": "텍스트 정제",
        "objective": "샘플 문자열에 패턴을 적용하고 추출/치환 결과를 검증",
        "source": "샘플 문자열",
        "operation": "패턴 매칭과 치환",
        "verification": "매치 그룹, 추출 목록, 치환 결과",
        "reuse": "로그/문서 정제 자동화",
        "why": "정규표현식은 로그, 연락처, 문서 텍스트에서 필요한 값을 정확히 뽑고 정리하는 기본 도구입니다.",
    },
    "builtins": {
        "label": "표준 라이브러리",
        "objective": "표준 라이브러리 함수를 호출하고 반환값, 출력, 객체 상태를 검증",
        "source": "작은 샘플 입력",
        "operation": "모듈 함수 호출",
        "verification": "반환값, stdout, 객체 상태",
        "reuse": "표준 라이브러리 유틸리티",
        "why": "표준 라이브러리는 외부 의존성 없이 파일, 시간, 문자열, 직렬화 같은 업무 코드를 구성하는 기반입니다.",
    },
    "pillow": {
        "label": "이미지 처리",
        "objective": "이미지를 열고 변환한 뒤 크기, 모드, 저장 결과를 검증",
        "source": "이미지 파일과 픽셀 값",
        "operation": "이미지 변환/합성/저장",
        "verification": "이미지 크기, 모드, 채널, 저장 파일",
        "reuse": "이미지 일괄 처리 자동화",
        "why": "이미지 처리는 반복 편집, 썸네일, 워터마크, 리포트용 시각 자료를 코드로 재현하게 해줍니다.",
    },
    "opencv": {
        "label": "컴퓨터 비전",
        "objective": "이미지 배열을 변환하고 shape, 채널, 검출 결과를 검증",
        "source": "이미지 배열과 픽셀 값",
        "operation": "색공간/필터/검출 처리",
        "verification": "shape, dtype, 채널, 검출 개수",
        "reuse": "비전 처리 파이프라인",
        "why": "OpenCV는 이미지와 영상에서 구조를 찾고 반복 처리하는 비전 자동화의 기본 도구입니다.",
    },
    "sympy": {
        "label": "기호 계산",
        "objective": "수식과 기호를 정의하고 전개, 미분, 적분, 풀이 결과를 검증",
        "source": "수식과 기호",
        "operation": "기호 계산",
        "verification": "간소화식, 해, 미분/적분 결과",
        "reuse": "수학 계산 검증 루틴",
        "why": "기호 계산은 수식을 코드로 검증하고 수학적 변환 과정을 재현 가능하게 만듭니다.",
    },
}

DEFAULT_CONTEXT = {
    "label": "업무 코드",
    "objective": "입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결",
    "source": "입력 데이터",
    "operation": "핵심 처리",
    "verification": "출력과 상태",
    "reuse": "업무 자동화 조각",
    "why": "작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.",
}


class LiteralString(str):
    pass


class CurriculumDumper(yaml.SafeDumper):
    pass


def representLiteralString(dumper: yaml.Dumper, value: LiteralString) -> yaml.nodes.ScalarNode:
    return dumper.represent_scalar("tag:yaml.org,2002:str", value, style="|")


CurriculumDumper.add_representer(LiteralString, representLiteralString)


def main() -> int:
    parser = argparse.ArgumentParser(description="Improve curriculum workflow architecture metadata.")
    parser.add_argument("--check", action="store_true", help="only verify that no changes are needed")
    parser.add_argument("--category", help="only update one curriculum category directory, for example 30days")
    args = parser.parse_args()

    changed: list[Path] = []
    for path in curriculumYamlPaths(category=args.category):
        original = path.read_text(encoding="utf-8")
        data = yaml.safe_load(original)
        if not isinstance(data, dict):
            continue
        updated = improveCurriculum(data, path)
        rendered = dumpYaml(updated)
        if rendered != original:
            changed.append(path)
            if not args.check:
                path.write_text(rendered, encoding="utf-8")

    if args.check and changed:
        for path in changed[:20]:
            print(f"needs update: {path.relative_to(ROOT).as_posix()}")
        if len(changed) > 20:
            print(f"... and {len(changed) - 20} more")
        return 1

    print(f"ok: curriculum workflow architecture {'checked' if args.check else 'updated'} ({len(changed)} changed)")
    return 0


def curriculumYamlPaths(category: str | None = None) -> list[Path]:
    root = CURRICULA_ROOT / category if category else CURRICULA_ROOT
    return sorted(
        path
        for path in root.glob("**/*.yaml")
        if path.name != "schema.yaml"
    )


def improveCurriculum(data: dict[str, Any], path: Path) -> dict[str, Any]:
    meta = ensureDict(data, "meta")
    intro = ensureDict(data, "intro")
    category = cleanText(meta.get("category")) or path.parent.name
    title = cleanText(meta.get("title")) or titleFromPath(path)
    context = CATEGORY_CONTEXTS.get(category, DEFAULT_CONTEXT)
    sections = sectionRecords(data)

    if needsIntroDirection(intro.get("direction")):
        intro["direction"] = f"{title}에서 {context['objective']}합니다."
    intro["benefits"] = lessonBenefits(title, context)
    intro["diagram"] = {
        "steps": workflowSteps(title, sections, context),
        "runtime": runtimeNodes(title, meta, context),
    }

    for section in sections:
        improveSection(section, context)

    return data


def ensureDict(data: dict[str, Any], key: str) -> dict[str, Any]:
    value = data.get(key)
    if isinstance(value, dict):
        return value
    replacement: dict[str, Any] = {}
    data[key] = replacement
    return replacement


def sectionRecords(data: dict[str, Any]) -> list[dict[str, Any]]:
    sections = data.get("sections")
    if not isinstance(sections, list):
        return []
    return [section for section in sections if isinstance(section, dict)]


def improveSection(section: dict[str, Any], context: dict[str, str]) -> None:
    title = sectionTitle(section)
    code = sectionCode(section) or cleanText(section.get("snippet"))
    focus = practiceFocus(code)

    if shouldRefreshSectionGoal(section.get("goal")):
        section["goal"] = sectionGoalCopy(title, code, context)
    if shouldRefreshSectionWhy(section.get("why")):
        section["why"] = sectionWhyCopy(code, context)

    exercise = section.get("exercise")
    if isinstance(exercise, dict):
        if shouldRefreshPracticePrompt(exercise.get("prompt"), title):
            prompt, generatedHints = practiceCopy(title, code, focus, context)
            exercise["prompt"] = prompt
        else:
            _, generatedHints = practiceCopy(title, code, focus, context)
        hints = exercise.get("hints")
        if isinstance(hints, list):
            filtered = [hint for hint in hints if normalizeCopy(hint) not in GENERIC_HINTS]
            generatedCopy = any(isGeneratedPracticeHint(hint) for hint in filtered)
            if len(filtered) != len(hints) or not filtered or generatedCopy:
                filtered = generatedHints
            exercise["hints"] = filtered

    check = section.get("check")
    if isinstance(check, dict):
        noError, resultCheck = validationCopy(section, title, focus, context)
        if shouldRefreshValidation(check.get("noError"), title):
            check["noError"] = noError
        if shouldRefreshValidation(check.get("resultCheck"), title):
            check["resultCheck"] = resultCheck


def lessonBenefits(title: str, context: dict[str, str]) -> list[str]:
    return [
        f"{context['source']} 확인 후 {context['operation']}에 맞는 코드 입력을 고릅니다.",
        f"{title} 결과를 {context['verification']} 기준으로 즉시 점검합니다.",
        f"완료한 코드를 {context['reuse']}에 다시 사용할 수 있습니다.",
    ]


def shouldRefreshSectionGoal(value: Any) -> bool:
    text = normalizeCopy(value)
    return (
        not text
        or text in GENERIC_SECTION_GOALS
        or "에서 문법 요소 흐름을 코드로 실행하고 결과를 확인한다" in text
    )


def shouldRefreshSectionWhy(value: Any) -> bool:
    text = normalizeCopy(value)
    generatedContextWhys = {context["why"] for context in CATEGORY_CONTEXTS.values()} | {DEFAULT_CONTEXT["why"]}
    return not text or text in GENERIC_SECTION_WHY or text in generatedContextWhys


def sectionGoalCopy(title: str, code: str, context: dict[str, str]) -> str:
    lowered = code.lower()
    variables = assignedVariables(code)
    printCount = lowered.count("print(")
    if "assert" in lowered or "redirect_stdout" in lowered:
        return f"{title}에서 예상값과 실제 실행 결과를 비교하는 검증 흐름을 확인한다."
    if isImportOnly(code):
        return f"{title}에서 import한 이름이 다음 코드에서 바로 쓰일 수 있는지 확인한다."
    if "duckdb" in lowered or "select " in lowered or context["label"] == "SQL 분석":
        return f"{title}에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다."
    if "dataframe" in lowered or "pd." in lowered or "loadlocaldataset" in lowered or context["label"] in {"표 데이터", "컬럼형 표 분석"}:
        return f"{title}에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다."
    if "cv2" in lowered or "image" in lowered or "pil" in lowered or context["label"] in {"이미지 처리", "컴퓨터 비전"}:
        return f"{title}에서 이미지 입력과 처리 인자가 결과 배열에 어떻게 반영되는지 확인한다."
    if "sympy" in lowered or " sp." in lowered or context["label"] == "기호 계산":
        return f"{title}에서 기호식 입력과 계산 결과가 어떻게 달라지는지 확인한다."
    if "plt." in lowered or "fig" in lowered or "sns." in lowered or "alt." in lowered:
        return f"{title}에서 데이터와 축 설정이 차트 결과에 어떻게 반영되는지 확인한다."
    if "re." in lowered or "regex" in lowered or "pattern" in lowered or context["label"] == "텍스트 정제":
        return f"{title}에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다."
    if "def " in lowered:
        return f"{title}에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다."
    if "for " in lowered:
        return f"{title}에서 반복 대상과 반복 결과의 개수나 값 변화를 확인한다."
    if "if " in lowered:
        return f"{title}에서 조건값이 선택되는 분기와 결과를 어떻게 바꾸는지 확인한다."
    if printCount >= 2:
        return f"{title}에서 여러 print() 호출의 출력 순서와 줄 수를 확인한다."
    if printCount == 1:
        return f"{title}에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다."
    if isLiteralExpression(code):
        return f"{title}에서 셀 마지막 표현식이 결과로 표시되는 흐름을 확인한다."
    if variables:
        primary = variables[0]
        return f"{title}에서 `{primary}` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다."
    if "[" in code and "]" in code:
        return f"{title}에서 시퀀스 값과 인덱스 선택 결과를 확인한다."
    return f"{title}에서 {context['source']}을 바꿨을 때 {context['verification']}가 어떻게 달라지는지 확인한다."


def sectionWhyCopy(code: str, context: dict[str, str]) -> str:
    lowered = code.lower()
    if "assert" in lowered or "redirect_stdout" in lowered:
        return "예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다."
    if isImportOnly(code):
        return "import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다."
    if "duckdb" in lowered or "select " in lowered or context["label"] == "SQL 분석":
        return "쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다."
    if "dataframe" in lowered or "pd." in lowered or "loadlocaldataset" in lowered or context["label"] in {"표 데이터", "컬럼형 표 분석"}:
        return "표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다."
    if "cv2" in lowered or "image" in lowered or "pil" in lowered or context["label"] in {"이미지 처리", "컴퓨터 비전"}:
        return "이미지 처리는 크기, 채널, 저장 결과를 바로 확인해야 잘못된 변환을 빨리 찾을 수 있습니다."
    if "sympy" in lowered or " sp." in lowered or context["label"] == "기호 계산":
        return "기호 계산은 입력식과 결과식이 직접 연결되므로 중간 결과를 확인하는 습관이 중요합니다."
    if "plt." in lowered or "fig" in lowered or "sns." in lowered or "alt." in lowered:
        return "차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다."
    if "re." in lowered or "regex" in lowered or "pattern" in lowered or context["label"] == "텍스트 정제":
        return "패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다."
    if "def " in lowered:
        return "함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다."
    if "for " in lowered:
        return "반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다."
    if "if " in lowered:
        return "조건 분기는 입력값에 따라 실행 경로가 바뀌므로 결과를 바로 확인해야 합니다."
    if "print(" in lowered:
        return "출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다."
    if isLiteralExpression(code):
        return "마지막 표현식 결과를 이해하면 노트북에서 작은 값을 빠르게 확인할 수 있습니다."
    if assignedVariables(code):
        return "변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다."
    return context["why"]


def workflowSteps(title: str, sections: list[dict[str, Any]], context: dict[str, str]) -> list[dict[str, str]]:
    sectionTitles = [
        shortLabel(cleanText(section.get("title")))
        for section in sections
        if cleanText(section.get("title"))
    ]
    seeds = dedupe(sectionTitles)
    while len(seeds) < 3:
        fallbackSeeds = [shortLabel(title), shortLabel(context["operation"]), shortLabel(context["verification"])]
        seeds.append(fallbackSeeds[len(seeds) % len(fallbackSeeds)])

    return [
        {
            "label": f"{seeds[0]} 입력 확인",
            "detail": f"입력 기준({context['source']})과 필요한 조건을 먼저 고정합니다.",
        },
        {
            "label": f"{seeds[1]} 처리 실행",
            "detail": f"{context['operation']} 코드를 실행해 중간 결과를 확인합니다.",
        },
        {
            "label": f"{seeds[2]} 결과 검증",
            "detail": f"{context['verification']} 기준으로 실행 결과를 비교합니다.",
        },
        {
            "label": f"{shortLabel(title)} 재사용",
            "detail": f"완성 코드를 {context['reuse']}에 붙일 수 있게 정리합니다.",
        },
    ]


def runtimeNodes(title: str, meta: dict[str, Any], context: dict[str, str]) -> list[dict[str, str]]:
    packages = meta.get("packages")
    if isinstance(packages, list) and packages:
        packageText = ", ".join(cleanText(item) for item in packages[:4] if cleanText(item))
    else:
        packageText = "표준 라이브러리"
    return [
        {
            "label": f"{context['label']} 환경",
            "detail": f"{packageText} 기준으로 로컬 Python 실행을 준비합니다.",
        },
        {
            "label": f"{shortLabel(title)} 실행",
            "detail": f"셀을 실행해 {context['verification']}와 예외 상태를 확인합니다.",
        },
        {
            "label": f"{shortLabel(title)} 완료",
            "detail": f"검증된 코드를 {context['reuse']}로 남깁니다.",
        },
    ]


def needsIntroDirection(value: Any) -> bool:
    text = normalizeCopy(value)
    if not text:
        return True
    return "실제 코드 흐름을 작게 실행하고 검증" in text


def sectionTitle(section: dict[str, Any]) -> str:
    direct = cleanText(section.get("title"))
    if direct:
        return direct
    blocks = section.get("blocks")
    if isinstance(blocks, list):
        for block in blocks:
            if isinstance(block, dict):
                title = cleanText(block.get("title"))
                if title:
                    return title
    return cleanText(section.get("id")) or "섹션"


def practiceFocus(snippet: str) -> str:
    lowered = snippet.lower()
    if "dataframe" in lowered or "pd." in lowered:
        return "열 이름이나 행 값"
    if "plt." in lowered or "fig" in lowered:
        return "데이터 값이나 축 설정"
    if "def " in lowered:
        return "인자나 반환값"
    if "for " in lowered:
        return "반복 대상이나 범위"
    if "if " in lowered:
        return "조건값"
    if "print(" in lowered and containsNumericExpression(snippet):
        return "계산식"
    if "print(" in lowered and containsStandaloneNumberPrint(snippet):
        return "출력 숫자"
    if "print(" in lowered:
        return "출력 문자열"
    if isLiteralExpression(snippet):
        return "마지막 표현식 값"
    if "[" in snippet and "]" in snippet:
        return "리스트 값"
    return "입력값"


def practiceCopy(
    title: str,
    code: str,
    focus: str,
    context: dict[str, str],
) -> tuple[str, list[str]]:
    lowered = code.lower()
    printCount = lowered.count("print(")
    variables = assignedVariables(code)

    if isImportOnly(code):
        return (
            f"{title} 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.",
            [
                "바꿀 지점은 import 줄의 모듈명, 별칭, 또는 그 아래에 추가할 작은 확인 호출입니다.",
                "실행 뒤 ImportError가 없는지와 다음 셀에서 그 별칭을 사용할 수 있는지 보세요.",
            ],
        )
    if "duckdb" in lowered or "select " in lowered or context["label"] == "SQL 분석":
        return (
            f"{title} 예제에서 SQL 컬럼, WHERE 조건, 집계 기준 중 하나를 바꾸고 쿼리 결과를 확인하세요.",
            [
                "바꿀 지점은 SELECT 컬럼, WHERE 비교값, GROUP BY/HAVING 기준입니다.",
                "실행 뒤 결과 행 수, 컬럼명, 집계값이 바꾼 쿼리 조건과 맞는지 보세요.",
            ],
        )
    if "dataframe" in lowered or "pd." in lowered or "loadlocaldataset" in lowered or context["label"] in {"표 데이터", "컬럼형 표 분석"}:
        return (
            f"{title} 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.",
            [
                "바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.",
                "실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.",
            ],
        )
    if "cv2" in lowered or "image" in lowered or "pil" in lowered or context["label"] in {"이미지 처리", "컴퓨터 비전"}:
        return (
            f"{title} 예제에서 이미지 크기, 색상, 임계값, 필터 설정 중 하나를 바꾸고 결과 배열을 확인하세요.",
            [
                "바꿀 지점은 이미지 로드, resize, 색공간 변환, threshold/filter 인자입니다.",
                "실행 뒤 shape, dtype, 채널 수, 검출 개수, 저장 파일이 바뀐 설정을 반영하는지 보세요.",
            ],
        )
    if "sympy" in lowered or " sp." in lowered or context["label"] == "기호 계산":
        return (
            f"{title} 예제에서 기호, 수식, 대입값 중 하나를 바꾸고 계산 결과가 달라지는지 확인하세요.",
            [
                "바꿀 지점은 symbols(), 수식 정의, solve/simplify/diff/integrate 인자입니다.",
                "실행 뒤 간소화식, 해, 미분/적분 결과가 바꾼 수식과 맞는지 보세요.",
            ],
        )
    if "plt." in lowered or "fig" in lowered or "sns." in lowered or "alt." in lowered:
        return (
            f"{title} 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.",
            [
                "바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.",
                "실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.",
            ],
        )
    if "re." in lowered or "regex" in lowered or "pattern" in lowered or context["label"] == "텍스트 정제":
        return (
            f"{title} 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.",
            [
                "바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.",
                "실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.",
            ],
        )
    if "assert" in lowered or "redirect_stdout" in lowered:
        return (
            f"{title} 예제에서 기대 문자열이나 실제 출력 문구를 바꾸고 assert 비교가 맞는지 확인하세요.",
            [
                "바꿀 지점은 expected 값과 실제 print()/계산 호출입니다.",
                "실행 뒤 기대값과 실제 결과가 같을 때만 검증이 통과하는지 보세요.",
            ],
        )
    if "def " in lowered:
        return (
            f"{title} 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.",
            [
                "바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.",
                "실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.",
            ],
        )
    if "for " in lowered:
        return (
            f"{title} 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.",
            [
                "바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.",
                "실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.",
            ],
        )
    if "if " in lowered:
        return (
            f"{title} 예제에서 조건값을 바꾸고 선택되는 분기와 결과가 달라지는지 확인하세요.",
            [
                "바꿀 지점은 if 조건식에 들어가는 비교값이나 boolean 값에서 찾으세요.",
                "실행 뒤 true/false 분기 중 어떤 코드가 평가됐는지 출력이나 변수값으로 확인하세요.",
            ],
        )
    if printCount >= 2:
        return (
            f"{title} 예제에서 출력 문장 하나를 바꾸고 출력 줄 순서와 바뀐 줄을 확인하세요.",
            [
                "바꿀 지점은 각 print()의 따옴표 안 문구나 출력 변수에서 찾으세요.",
                "실행 뒤 줄 수와 순서가 유지되고, 수정한 줄만 의도대로 바뀌었는지 보세요.",
            ],
        )
    if printCount == 1 and containsNumericExpression(code):
        return (
            f"{title} 예제에서 계산식의 숫자나 연산자를 바꾸고 출력 숫자가 새 계산 결과와 맞는지 확인하세요.",
            [
                "바꿀 지점은 print() 안의 숫자, 연산자, 괄호 위치에서 찾으세요.",
                "실행 뒤 출력 숫자를 직접 계산한 값과 비교하세요.",
            ],
        )
    if printCount == 1 and containsStandaloneNumberPrint(code):
        return (
            f"{title} 예제에서 출력 숫자를 바꾸고 출력 영역 숫자가 그대로 바뀌는지 확인하세요.",
            [
                "바꿀 지점은 print() 괄호 안의 숫자 리터럴입니다.",
                "실행 뒤 출력된 숫자가 입력한 숫자와 정확히 같은지 보세요.",
            ],
        )
    if printCount == 1:
        return (
            f"{title} 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.",
            [
                "바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.",
                "실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.",
            ],
        )
    if isLiteralExpression(code):
        return (
            f"{title} 예제에서 마지막 표현식 값을 바꾸고 셀 결과가 새 값으로 표시되는지 확인하세요.",
            [
                "바꿀 지점은 셀 마지막 줄의 문자열, 숫자, 계산식입니다.",
                "실행 뒤 출력 영역의 마지막 값이 직접 입력한 표현식 결과와 맞는지 보세요.",
            ],
        )
    if "[" in code and "]" in code:
        return (
            f"{title} 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.",
            [
                "바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.",
                "실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.",
            ],
        )
    if variables:
        if len(variables) >= 2:
            joined = ", ".join(f"`{name}`" for name in variables[:3])
            return (
                f"{title} 예제에서 {joined} 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.",
                [
                    "바꿀 지점은 = 오른쪽 값들의 순서와 개수입니다.",
                    "실행 뒤 각 변수와 마지막 표시값이 같은 순서로 바뀌었는지 보세요.",
                ],
            )
        primary = variables[0]
        return (
            f"{title} 예제에서 `{primary}` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.",
            [
                f"바꿀 지점은 `{primary} = ...` 오른쪽 값입니다.",
                f"실행 뒤 `{primary}` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.",
            ],
        )
    return (
        f"{title} 예제에서 {objectPhrase(focus)} 바꾸고 마지막 확인 값이 달라지는지 확인하세요.",
        [
            f"바꿀 지점은 {context['source']}을 만드는 첫 줄과 {context['operation']} 줄에서 찾으세요.",
            f"실행 뒤 {context['verification']} 중 하나가 바꾼 값을 반영하는지 보세요.",
        ],
    )


def validationCopy(
    section: dict[str, Any],
    title: str,
    focus: str,
    context: dict[str, str],
) -> tuple[str, str]:
    code = sectionCode(section)
    lowered = code.lower()
    printCount = lowered.count("print(")
    variables = assignedVariables(code)

    if isImportOnly(code):
        return (
            f"{title}의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.",
            f"{title} 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.",
        )
    if "duckdb" in lowered or "select " in lowered or context["label"] == "SQL 분석":
        return (
            f"{title}의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.",
            f"{title} 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.",
        )
    if "dataframe" in lowered or "pd." in lowered or "loadlocaldataset" in lowered or context["label"] in {"표 데이터", "컬럼형 표 분석"}:
        return (
            f"{title}의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.",
            f"{title}의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.",
        )
    if "cv2" in lowered or "image" in lowered or "pil" in lowered or context["label"] in {"이미지 처리", "컴퓨터 비전"}:
        return (
            f"{title}의 이미지 입력, 배열 shape, 처리 인자가 변환 단계까지 도달해야 합니다.",
            f"{title} 결과의 크기, 모드, 채널, 검출 개수, 저장 파일이 바꾼 설정을 반영해야 합니다.",
        )
    if "sympy" in lowered or " sp." in lowered or context["label"] == "기호 계산":
        return (
            f"{title}의 기호, 수식, 대입값이 SymPy 계산 단계까지 도달해야 합니다.",
            f"{title} 결과식, 해, 미분/적분 값이 바꾼 수식 기준과 맞아야 합니다.",
        )
    if "plt." in lowered or "fig" in lowered or "sns." in lowered or "alt." in lowered:
        return (
            f"{title}의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.",
            f"{title}의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.",
        )
    if "re." in lowered or "regex" in lowered or "pattern" in lowered or context["label"] == "텍스트 정제":
        return (
            f"{title}의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.",
            f"{title}의 match/search/sub 결과가 바꾼 패턴이나 샘플 문자열 기준과 맞아야 합니다.",
        )
    if "assert" in lowered or "redirect_stdout" in lowered:
        return (
            f"{title}의 기대값, 실제 실행 결과, assert 비교식이 같은 기준을 바라봐야 합니다.",
            f"{title}에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.",
        )
    if "def " in lowered:
        return (
            f"{title}의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.",
            f"{title} 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.",
        )
    if "for " in lowered:
        return (
            f"{title}의 반복 대상과 들여쓰기가 맞아 루프 본문이 끝까지 평가되어야 합니다.",
            f"{title} 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.",
        )
    if "if " in lowered:
        return (
            f"{title}의 조건식과 들여쓰기가 맞아 선택한 분기 본문이 평가되어야 합니다.",
            f"{title} 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.",
        )
    if printCount >= 2:
        return (
            f"{title}의 각 print() 호출이 따옴표와 괄호 조건을 만족하고 순서대로 출력되어야 합니다.",
            f"{title} 출력 줄 수와 순서가 유지되고, 바꾼 줄의 문구가 출력 영역에 나타나야 합니다.",
        )
    if printCount == 1 and containsNumericExpression(code):
        return (
            f"{title}의 계산식이 SyntaxError 없이 print() 호출까지 평가되어야 합니다.",
            f"{title} 출력 숫자가 수정한 계산식의 실제 결과와 일치해야 합니다.",
        )
    if printCount == 1 and containsStandaloneNumberPrint(code):
        return (
            f"{title}의 숫자 print() 호출이 SyntaxError 없이 출력되어야 합니다.",
            f"{title} 출력 값이 직접 바꾼 숫자와 정확히 일치해야 합니다.",
        )
    if printCount == 1:
        return (
            f"{title}의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.",
            f"{title} 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.",
        )
    if isLiteralExpression(code):
        return (
            f"{title}의 마지막 표현식이 SyntaxError 없이 평가되어야 합니다.",
            f"{title} 실행 결과에 직접 바꾼 마지막 표현식 값이 표시되어야 합니다.",
        )
    if variables:
        if len(variables) >= 2:
            joined = ", ".join(f"`{name}`" for name in variables[:3])
            return (
                f"{title}에서 {joined} 할당 개수와 값 순서가 맞아야 합니다.",
                f"{title} 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.",
            )
        primary = variables[0]
        return (
            f"{title}에서 `{primary}` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.",
            f"{title} 실행 뒤 `{primary}` 값, 출력, 또는 type() 확인이 바꾼 {focus}을 반영해야 합니다.",
        )
    if "[" in code and "]" in code:
        return (
            f"{title}의 시퀀스 접근이 IndexError 조건을 피해야 합니다.",
            f"{title} 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.",
        )
    return (
        f"{title}의 수정 코드가 {context['operation']} 단계의 마지막 확인 값까지 도달해야 합니다.",
        f"{title} 실행 결과가 {context['verification']} 기준으로 바꾼 {focus}을 반영해야 합니다.",
    )


def sectionCode(section: dict[str, Any]) -> str:
    exercise = section.get("exercise")
    if isinstance(exercise, dict):
        starter = cleanTextPreserveCode(exercise.get("starterCode"))
        if starter:
            return starter
    return cleanTextPreserveCode(section.get("snippet"))


def cleanTextPreserveCode(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def assignedVariables(code: str) -> list[str]:
    variables: list[str] = []
    for line in code.splitlines():
        match = re.match(r"\s*([A-Za-z_][\w\s,]*)\s*=", line)
        if match:
            targets = [target.strip() for target in match.group(1).split(",")]
            variables.extend(target for target in targets if re.fullmatch(r"[A-Za-z_]\w*", target))
    return dedupe(variables)


def containsNumericExpression(code: str) -> bool:
    return bool(re.search(r"print\([^)]*\d+\s*[-+*/%]", code) or re.search(r"print\([^)]*[-+*/%]\s*\d+", code))


def isImportOnly(code: str) -> bool:
    lines = [
        line.strip()
        for line in code.splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]
    return bool(lines) and all(line.startswith("import ") or line.startswith("from ") for line in lines)


def shouldRefreshPracticePrompt(value: Any, title: str) -> bool:
    text = normalizeCopy(value)
    if text in GENERIC_EXERCISE_PROMPTS:
        return True
    generatedFragments = (
        "예제에서",
        "달라진 결과를 확인하세요",
        "출력과 변수 상태",
        "출력과 상태",
        "행/열 수와 요약값 기준",
        "shape와 수치 결과 기준",
        "호출 결과와 예외 경계 기준",
        "마지막 확인 값",
        "stdout",
        "stdout이 그대로",
        "type 결과",
        "변수 값이나 타입",
        "반복 결과가 같이",
    )
    return title in text and sum(fragment in text for fragment in generatedFragments) >= 2


def isGeneratedPracticeHint(value: Any) -> bool:
    text = normalizeCopy(value)
    generatedFragments = (
        "코드에서 먼저",
        "위치를 찾으세요",
        "실행 후",
        "실행 뒤",
        "stdout",
        "type 결과",
        "문법 요소",
        "문제에 필요한 값",
        "출력과 변수 상태",
        "기준이 바뀐 입력을 반영",
        "바꾼 입력을 반영하는지",
    )
    return sum(fragment in text for fragment in generatedFragments) >= 2


def containsStandaloneNumberPrint(code: str) -> bool:
    return bool(re.search(r"print\(\s*[-+]?\d+(?:\.\d+)?\s*\)", code))


def isLiteralExpression(code: str) -> bool:
    stripped = code.strip()
    return bool(re.match(r"""^(['"]).*\1$""", stripped) or re.match(r"""^(['"]{3}).*\1$""", stripped, re.DOTALL))


def shouldRefreshValidation(value: Any, title: str) -> bool:
    text = normalizeCopy(value)
    if not text:
        return True
    if text in GENERIC_CHECK_VALUES:
        return True
    genericFragments = (
        "코드가 예외 없이 끝나야 합니다",
        "실습 코드가 예외 없이 끝나야 합니다",
        "결과에 반영되어야 합니다",
        "출력 또는 assert 확인",
        "오류 없이",
        "print() 호출이 따옴표와 괄호 오류 없이 실행되어야 합니다",
        "각 print() 호출이 따옴표와 괄호 오류 없이",
        "문법 오류 없이 실행되어야 합니다",
        "함수 정의와 호출부가 NameError나 TypeError 없이 실행되어야 합니다",
        "변수 할당문이 SyntaxError 없이 평가되어야 합니다",
        "실행 결과가 출력과 변수 상태 기준으로 바꾼 입력값을 반영해야 합니다",
        "실행 뒤 `",
        "stdout",
        "type 결과",
        "값이나 타입",
        "문법 요소",
        "stdout에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다",
        "수정 코드가 문법 요소 단계에서 중단 없이 실행되어야 합니다",
        "중단 없이 실행되어야 합니다",
        "마지막 확인 값까지 도달해야 합니다",
        "출력과 변수 상태 기준으로 바꾼 입력값을 반영해야 합니다",
        "출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다",
        "행/열 수와 요약값 기준으로 바꾼 입력값을 반영해야 합니다",
    )
    return any(fragment in text for fragment in genericFragments) and title in text


def objectPhrase(value: str) -> str:
    return f"{value}{objectParticle(value)}"


def objectParticle(value: str) -> str:
    text = value.strip()
    if not text:
        return "을"
    code = ord(text[-1])
    if 0xAC00 <= code <= 0xD7A3:
        return "을" if (code - 0xAC00) % 28 else "를"
    return "을"


def dumpYaml(data: dict[str, Any]) -> str:
    literalized = literalizeMultiline(data)
    return yaml.dump(
        literalized,
        Dumper=CurriculumDumper,
        allow_unicode=True,
        sort_keys=False,
        default_flow_style=False,
        width=100,
    )


def literalizeMultiline(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: literalizeMultiline(item) for key, item in value.items()}
    if isinstance(value, list):
        return [literalizeMultiline(item) for item in value]
    if isinstance(value, str) and "\n" in value:
        return LiteralString(value)
    return value


def titleFromPath(path: Path) -> str:
    return re.sub(r"^\d+[_-]?", "", path.stem)


def shortLabel(value: str) -> str:
    cleaned = re.sub(r"^[^\w가-힣]+", "", cleanText(value))
    if ":" in cleaned:
        cleaned = cleaned.split(":", 1)[1].strip()
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned[:16].strip() or "섹션"


def dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def cleanText(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    text = re.sub(r"[*_`#>-]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def normalizeCopy(value: Any) -> str:
    return cleanText(value)


if __name__ == "__main__":
    raise SystemExit(main())
