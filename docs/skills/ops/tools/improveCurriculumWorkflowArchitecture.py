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
        "objective": "입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결",
        "source": "문제에 필요한 값",
        "operation": "문법 요소",
        "verification": "출력과 변수 상태",
        "reuse": "반복 업무 스크립트",
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
    args = parser.parse_args()

    changed: list[Path] = []
    for path in curriculumYamlPaths():
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


def curriculumYamlPaths() -> list[Path]:
    return sorted(
        path
        for path in CURRICULA_ROOT.glob("**/*.yaml")
        if "_backup" not in path.parts and path.name != "schema.yaml"
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
    snippet = cleanText(section.get("snippet"))
    focus = practiceFocus(snippet)

    if normalizeCopy(section.get("goal")) in GENERIC_SECTION_GOALS:
        section["goal"] = f"{title}에서 {context['operation']} 흐름을 코드로 실행하고 결과를 확인한다."
    if normalizeCopy(section.get("why")) in GENERIC_SECTION_WHY:
        section["why"] = context["why"]

    exercise = section.get("exercise")
    if isinstance(exercise, dict):
        if normalizeCopy(exercise.get("prompt")) in GENERIC_EXERCISE_PROMPTS:
            exercise["prompt"] = f"{title} 예제에서 {focus}을 바꿔 실행하고, {context['verification']} 기준으로 달라진 결과를 확인하세요."
        hints = exercise.get("hints")
        if isinstance(hints, list):
            filtered = [hint for hint in hints if normalizeCopy(hint) not in GENERIC_HINTS]
            generatedParticleIssue = any("이 바뀐 입력을 반영" in normalizeCopy(hint) for hint in filtered)
            if len(filtered) != len(hints) or not filtered or generatedParticleIssue:
                filtered = [
                    f"{title} 코드에서 먼저 {focus} 위치를 찾으세요.",
                    f"실행 후 {context['verification']} 기준이 바뀐 입력을 반영하는지 확인하세요.",
                ]
            exercise["hints"] = filtered

    check = section.get("check")
    if isinstance(check, dict):
        if normalizeCopy(check.get("noError")) in GENERIC_CHECK_VALUES:
            check["noError"] = f"{title} 코드가 예외 없이 끝나야 합니다."
        if normalizeCopy(check.get("resultCheck")) in GENERIC_CHECK_VALUES:
            check["resultCheck"] = f"{title}에서 바꾼 {focus}이 결과에 반영되어야 합니다."


def lessonBenefits(title: str, context: dict[str, str]) -> list[str]:
    return [
        f"{context['source']} 확인 후 {context['operation']}에 맞는 코드 입력을 고릅니다.",
        f"{title} 결과를 {context['verification']} 기준으로 즉시 점검합니다.",
        f"완료한 코드를 {context['reuse']}에 다시 사용할 수 있습니다.",
    ]


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
            "detail": "셀을 실행해 출력, 변수, 예외 상태를 확인합니다.",
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
    if "print(" in lowered:
        return "출력 문자열"
    if "[" in snippet and "]" in snippet:
        return "리스트 값"
    return "입력값"


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
