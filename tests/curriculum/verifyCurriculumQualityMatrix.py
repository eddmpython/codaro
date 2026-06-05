from __future__ import annotations

from datetime import UTC, datetime
import json
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml

from codaro.ai.toolHandlers.workbench import _curriculumContractGaps
from codaro.curriculum.converter import yamlToDocument


ROOT = Path(__file__).resolve().parents[2]
CURRICULUM_QUALITY_REPORT_PATH = ROOT / "output" / "test-runner" / "curriculum-quality-matrix" / "curriculum-quality-report.json"
REQUIRED_SECTION_FLOW = (
    "section",
    "sectionContract:explanation",
    "sectionContract:snippet",
    "sectionContract:exercise",
)
REQUIRED_CONTRACT_FIELDS = (
    "title",
    "subtitle",
    "goal",
    "why",
    "explanation",
    "tips",
    "snippet",
    "exercise",
    "check",
)


@dataclass(frozen=True)
class CurriculumCase:
    caseId: str
    title: str
    packages: tuple[str, ...]
    sections: tuple[dict[str, Any], ...]


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    results = [evaluateCase(case) for case in curriculumCases()]
    failures = [failure for result in results for failure in result["failures"]]
    payload = {
        "gate": "curriculum-quality-matrix",
        "caseCount": len(results),
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "reportPath": reportDisplayPath(CURRICULUM_QUALITY_REPORT_PATH),
        "summary": matrixSummary(results),
        "results": results,
        "failures": failures,
    }
    writeCurriculumQualityReport(payload)
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: curriculum quality matrix has contract failures", file=sys.stderr)
        return 1
    print("ok: curriculum quality matrix verified")
    return 0


def evaluateCase(case: CurriculumCase) -> dict[str, Any]:
    content = {
        "meta": {
            "title": case.title,
            "audience": "local dogfood learner",
            "difficulty": "beginner-intermediate",
            "packages": list(case.packages),
        },
        "intro": {
            "direction": f"{case.title}를 실습 중심으로 완주한다.",
            "benefits": [
                "개념을 설명으로 끝내지 않고 바로 실행한다.",
                "섹션 단위 카드에서 예제, 실습, 검증까지 이어진다.",
            ],
            "diagram": {
                "nodes": ["목표", "개념", "스니펫", "실습", "검증"],
                "runtime": "packages-check → packages-install → cell-call",
            },
        },
        "sections": list(case.sections),
    }
    document, solutions = yamlToDocument(content, "quality-matrix", case.caseId)
    blocks = tuple(document.blocks)
    sourceTypes = tuple(block.sourceType for block in blocks)
    failures: list[str] = []

    if document.runtime.packages != list(case.packages):
        failures.append(f"{case.caseId}: runtime packages not preserved: {document.runtime.packages}")
    if not solutions:
        failures.append(f"{case.caseId}: section exercise solutions were not captured")

    gaps = _curriculumContractGaps(document)
    gapCount = sum(len(item["missingFields"]) for item in gaps)
    if gapCount:
        failures.append(f"{case.caseId}: contract gaps detected: {gaps}")

    sectionIndexes = [index for index, sourceType in enumerate(sourceTypes) if sourceType == "section"]
    if len(sectionIndexes) != len(case.sections):
        failures.append(f"{case.caseId}: expected {len(case.sections)} section cards, got {len(sectionIndexes)}")

    for sectionNumber, sectionIndex in enumerate(sectionIndexes, start=1):
        observedFlow = sourceTypes[sectionIndex:sectionIndex + len(REQUIRED_SECTION_FLOW)]
        if observedFlow != REQUIRED_SECTION_FLOW:
            failures.append(f"{case.caseId}: section {sectionNumber} flow {observedFlow} != {REQUIRED_SECTION_FLOW}")
        sectionBlock = blocks[sectionIndex]
        contract = sectionBlock.payload.get("sectionContract") if isinstance(sectionBlock.payload, dict) else None
        if not isinstance(contract, dict):
            failures.append(f"{case.caseId}: section {sectionNumber} missing sectionContract payload")
            continue
        for fieldName in REQUIRED_CONTRACT_FIELDS:
            value = contract.get(fieldName)
            if value in ("", [], {}, None):
                failures.append(f"{case.caseId}: section {sectionNumber} empty contract field {fieldName}")

    return {
        "caseId": case.caseId,
        "title": case.title,
        "sectionCount": len(sectionIndexes),
        "snippetCellCount": sourceTypes.count("sectionContract:snippet"),
        "exerciseCellCount": sourceTypes.count("sectionContract:exercise"),
        "checkCellCount": sourceTypes.count("sectionContract:check"),
        "contractGapCount": gapCount,
        "requiredFlowObserved": all(
            sourceTypes[index:index + len(REQUIRED_SECTION_FLOW)] == REQUIRED_SECTION_FLOW
            for index in sectionIndexes
        ),
        "solutionsCaptured": bool(solutions),
        "packages": document.runtime.packages,
        "failures": failures,
    }


def matrixSummary(results: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "caseIds": [str(result["caseId"]) for result in results],
        "totalSections": sum(int(result["sectionCount"]) for result in results),
        "totalSnippetCells": sum(int(result["snippetCellCount"]) for result in results),
        "totalExerciseCells": sum(int(result["exerciseCellCount"]) for result in results),
        "totalCheckCells": sum(int(result["checkCellCount"]) for result in results),
        "totalContractGaps": sum(int(result["contractGapCount"]) for result in results),
        "allRequiredFlowsObserved": all(bool(result["requiredFlowObserved"]) for result in results),
        "allSolutionsCaptured": all(bool(result["solutionsCaptured"]) for result in results),
    }


def writeCurriculumQualityReport(payload: dict[str, Any]) -> Path:
    CURRICULUM_QUALITY_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    CURRICULUM_QUALITY_REPORT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return CURRICULUM_QUALITY_REPORT_PATH


def reportDisplayPath(reportPath: Path) -> str:
    try:
        return str(reportPath.relative_to(ROOT))
    except ValueError:
        return str(reportPath)


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def currentGitHead() -> str | None:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
    except (FileNotFoundError, OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() or None


def curriculumCases() -> tuple[CurriculumCase, ...]:
    return (
        CurriculumCase(
            caseId="python-basics",
            title="Python 기초 실습",
            packages=(),
            sections=(
                section("출력과 변수", "print와 변수로 값 확인", "print('Codaro')", "name = 'Codaro'\nprint(name)"),
                section("조건문", "조건에 따라 다른 메시지 출력", "score = 82\nprint(score >= 80)", "score = 82\nprint('pass' if score >= 80 else 'retry')"),
            ),
        ),
        CurriculumCase(
            caseId="file-handling",
            title="파일 처리 실습",
            packages=(),
            sections=(
                section("텍스트 쓰기", "with open으로 파일 저장", "path = 'note.txt'\nopen(path, 'w', encoding='utf-8').write('hello')", "path = 'note.txt'\nwith open(path, 'w', encoding='utf-8') as f:\n    f.write('hello')"),
                section("텍스트 읽기", "저장한 파일을 다시 읽기", "print(open('note.txt', encoding='utf-8').read())", "text = open('note.txt', encoding='utf-8').read()\nprint(text)"),
            ),
        ),
        CurriculumCase(
            caseId="data-analysis",
            title="데이터 분석 실습",
            packages=("pandas",),
            sections=(
                section("DataFrame 만들기", "표 데이터를 직접 구성", "import pandas as pd\ndf = pd.DataFrame({'sales': [10, 20]})\nprint(df)", "import pandas as pd\ndf = pd.DataFrame({'sales': [10, 20, 30]})\nprint(df['sales'].sum())"),
                section("집계하기", "groupby로 항목별 합계 계산", "import pandas as pd\ndf = pd.DataFrame({'kind': ['a', 'a'], 'value': [1, 2]})\nprint(df.groupby('kind')['value'].sum())", "import pandas as pd\ndf = pd.DataFrame({'kind': ['a', 'b', 'a'], 'value': [1, 4, 2]})\nprint(df.groupby('kind')['value'].sum())"),
            ),
        ),
        CurriculumCase(
            caseId="visualization",
            title="시각화 실습",
            packages=("matplotlib",),
            sections=(
                section("간단한 선 그래프", "matplotlib으로 흐름 확인", "import matplotlib.pyplot as plt\nplt.plot([1, 2, 3])\nprint('ready')", "import matplotlib.pyplot as plt\nplt.plot([1, 2, 3], [2, 5, 4])\nprint('ready')"),
                section("축 제목 붙이기", "그래프 의미를 읽기 좋게 만들기", "import matplotlib.pyplot as plt\nplt.title('sales')\nprint('ready')", "import matplotlib.pyplot as plt\nplt.plot([1, 2], [3, 5])\nplt.title('sales')\nprint('ready')"),
            ),
        ),
        CurriculumCase(
            caseId="web-automation",
            title="웹 자동화 실습",
            packages=("requests",),
            sections=(
                section("HTTP 상태 확인", "requests로 응답 상태 읽기", "import requests\nprint(requests.get('https://example.com').status_code)", "import requests\nresponse = requests.get('https://example.com')\nprint(response.status_code)"),
                section("응답 텍스트 확인", "페이지 일부를 잘라 확인", "import requests\nprint(requests.get('https://example.com').text[:20])", "import requests\ntext = requests.get('https://example.com').text\nprint(text[:20])"),
            ),
        ),
    )


def section(title: str, subtitle: str, snippet: str, starterCode: str) -> dict[str, Any]:
    return {
        "id": title.lower().replace(" ", "-"),
        "title": title,
        "subtitle": subtitle,
        "goal": f"{title}을 직접 실행 가능한 코드로 익힌다.",
        "why": f"{title}은 이후 자동화와 데이터 작업의 기본 흐름을 만든다.",
        "explanation": f"{subtitle}. 먼저 예제를 보고 같은 구조를 직접 입력한 뒤 결과를 확인한다.",
        "tips": [
            "작게 실행하고 결과를 바로 확인한다.",
            "오류가 나면 마지막으로 바꾼 줄부터 확인한다.",
        ],
        "snippet": snippet,
        "exercise": {
            "prompt": f"{title} 실습 코드를 직접 입력하고 실행하세요.",
            "starterCode": starterCode,
            "solution": starterCode,
            "check": {"noError": "실행 오류가 없어야 한다."},
            "hints": ["예제 스니펫과 같은 구조로 시작하세요."],
        },
        "check": {"noError": "실행 오류가 없어야 한다."},
    }


if __name__ == "__main__":
    raise SystemExit(main())
