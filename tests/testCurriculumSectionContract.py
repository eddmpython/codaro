from __future__ import annotations

import ast
import re
from pathlib import Path
from typing import Any

import yaml

from codaro.curriculum.converter import yamlToDocument
from codaro.curriculum.sectionContract import lessonContractFromYaml, sectionContractGaps


ROOT = Path(__file__).resolve().parents[1]
CURRICULA_DIR = ROOT / "curricula" / "python"
INSTALL_STAGE_PHRASES = (
    "설치 예제",
    "설치 실습",
    "설치 스니펫",
    "설치 입력",
    "설치 확인",
    "설치에서",
    "설치 다음",
    "설치의 import",
    "패키지 설치",
)
INSTALL_STAGE_HEADING_FIELDS = {"title", "subtitle"}
INSTALL_COMMAND_MARKERS = ("uv add", "uv pip", "pip install", "%pip", "!pip", "python -m pip")
EXTERNAL_STDLIB_LABELS = (
    "Python 데이터 검증의 표준 라이브러리",
    "Python 머신러닝의 표준 라이브러리",
    "Python 통계 분석의 표준 라이브러리",
    "20년 검증된 표준 라이브러리",
)
CANONICAL_PACKAGE_NAMES = {
    "bs4": "beautifulsoup4",
    "cv2": "opencv-python",
    "docx": "python-docx",
    "pil": "pillow",
    "pillow": "pillow",
    "skimage": "scikit-image",
    "sklearn": "scikit-learn",
    "yaml": "pyyaml",
}
STALE_INSTALL_STAGE_PATTERN = re.compile(r"(?m)^\s*(id:\s*step\d*_install|id:\s*installation|title:\s*\d+단계\.[^\n]*설치)")


def testLessonContractExtractsStructuredSectionFields() -> None:
    content = {
        "meta": {
            "title": "pandas section contract",
            "audience": "beginner",
            "difficulty": "easy",
            "packages": ["pandas"],
        },
        "intro": {
            "direction": "DataFrame을 직접 만들고 확인합니다.",
            "benefits": ["표 데이터를 코드로 다룹니다."],
            "diagram": {
                "steps": [{"label": "개념"}, {"label": "실습"}],
                "runtime": [{"label": "환경", "detail": "uv 패키지"}],
            },
        },
        "sections": [
            {
                "id": "dataframe-basics",
                "title": "DataFrame 만들기",
                "subtitle": "행과 열의 감각",
                "goal": "dict에서 DataFrame을 만드는 흐름을 익힙니다.",
                "why": "엑셀 표를 코드로 자동화하는 첫 단계입니다.",
                "explanation": "pandas.DataFrame은 열 이름과 값 목록으로 표를 만듭니다.",
                "tips": ["열 길이는 같아야 합니다."],
                "snippet": "import pandas as pd\npd.DataFrame({'name': ['A']})",
                "exercise": {
                    "prompt": "sales 열을 가진 DataFrame을 만드세요.",
                    "starterCode": "import pandas as pd\nsales = ___",
                    "solution": "import pandas as pd\nsales = pd.DataFrame({'sales': [10]})",
                    "hints": ["dict를 먼저 만드세요."],
                    "check": {"contains": "DataFrame"},
                },
                "check": {"variable": "sales"},
            }
        ],
    }

    contract = lessonContractFromYaml(content)

    assert contract.meta.title == "pandas section contract"
    assert contract.meta.packages == ["pandas"]
    assert contract.intro.direction == "DataFrame을 직접 만들고 확인합니다."
    assert contract.intro.benefits == ["표 데이터를 코드로 다룹니다."]
    assert contract.intro.diagram["steps"][0]["label"] == "개념"
    assert contract.intro.diagram["runtime"][0]["detail"] == "uv 패키지"
    section = contract.sections[0]
    assert section.id == "dataframe-basics"
    assert section.goal.startswith("dict에서")
    assert section.why.startswith("엑셀")
    assert section.tips == ["열 길이는 같아야 합니다."]
    assert "pd.DataFrame" in section.snippet
    assert section.exercise.prompt.startswith("sales")
    assert section.exercise.check == {"contains": "DataFrame"}
    assert section.check == {"variable": "sales"}
    assert section.contractGaps == []
    assert sectionContractGaps(section) == []


def testYamlToDocumentMaterializesStructuredSectionContract() -> None:
    content = {
        "meta": {"title": "Structured lesson", "packages": ["pandas"]},
        "intro": {"goal": "계약 기반 레슨입니다.", "benefits": ["렌더러가 의미를 추측하지 않습니다."]},
        "sections": [
            {
                "title": "섹션 카드",
                "subtitle": "계약 흐름",
                "goal": "섹션 하나를 카드 하나로 봅니다.",
                "why": "학습 흐름이 한곳에 모입니다.",
                "explanation": "설명, 스니펫, 실습, 검증이 한 카드 안에서 이어집니다.",
                "tips": ["카드 안에 카드를 과도하게 넣지 않습니다."],
                "snippet": "import pandas as pd",
                "exercise": {
                    "prompt": "직접 DataFrame을 입력하세요.",
                    "starterCode": "import pandas as pd\nframe = ___",
                    "solution": "import pandas as pd\nframe = pd.DataFrame({'x': [1]})",
                    "hints": ["pd.DataFrame을 사용하세요."],
                },
                "check": {"variable": "frame"},
            }
        ],
    }

    document, solutions = yamlToDocument(content, "ai", "structured")

    assert document.runtime.packages == ["pandas"]
    introPayload = document.blocks[0].payload
    assert introPayload["learningContract"]["meta"]["packages"] == ["pandas"]

    sectionTitle = next(block for block in document.blocks if block.sourceType == "section")
    assert sectionTitle.payload["sectionContract"]["goal"] == "섹션 하나를 카드 하나로 봅니다."
    assert sectionTitle.payload["sectionContractGaps"] == []

    snippet = next(block for block in document.blocks if block.sourceType == "sectionContract:snippet")
    exercise = next(block for block in document.blocks if block.sourceType == "sectionContract:exercise")
    # 검증 기준은 더 이상 학습자용 카드로 생성하지 않는다(내부 채점 메타). 채점은 exercise.checkConfig가 담당.
    assert not any(block.sourceType == "sectionContract:check" for block in document.blocks)

    assert snippet.role == "snippet"
    assert snippet.content == "import pandas as pd"
    assert exercise.role == "exercise"
    assert exercise.content == "import pandas as pd\nframe = ___"
    assert exercise.guide is not None
    assert exercise.guide.solution == "import pandas as pd\nframe = pd.DataFrame({'x': [1]})"
    assert exercise.guide.checkConfig == {"variable": "frame"}
    assert solutions[exercise.id] == "import pandas as pd\nframe = pd.DataFrame({'x': [1]})"


def testLessonRuntimePackagesNormalizeAliasesAndDropStdlib() -> None:
    content = {
        "meta": {"title": "Package normalization", "packages": ["io", "docx", "sklearn", "PIL", "zipfile"]},
        "sections": [],
    }

    contract = lessonContractFromYaml(content)
    document, _solutions = yamlToDocument(content, "packages", "normalization")

    assert contract.meta.packages == ["python-docx", "scikit-learn", "pillow"]
    assert document.runtime.packages == ["python-docx", "scikit-learn", "pillow"]


def testStructuredSectionMaterializesSingleCardFlowBlocks() -> None:
    content = {
        "meta": {"title": "Single card flow"},
        "sections": [
            {
                "id": "one-card",
                "title": "한 섹션 카드",
                "subtitle": "설명에서 검증까지 한 흐름",
                "goal": "스니펫을 보고 직접 입력합니다.",
                "why": "작은 카드 반복 없이 학습 맥락을 유지합니다.",
                "explanation": "섹션 카드 안에서 설명, 팁, 예제, 실습, 검증이 이어집니다.",
                "tips": ["먼저 예제를 읽고, 다음 입력 셀만 수정합니다."],
                "snippet": "value = 1\nvalue",
                "exercise": {
                    "prompt": "value를 2로 바꾸세요.",
                    "starterCode": "value = ___",
                    "solution": "value = 2",
                    "check": {"variable": "value"},
                },
                "check": {"expected": "value == 2"},
            }
        ],
    }

    document, _solutions = yamlToDocument(content, "ai", "single-card")

    sourceTypes = [block.sourceType for block in document.blocks]
    assert sourceTypes.count("section") == 1
    # 검증 기준 카드는 제거됨 — 설명→스니펫→실습 3블록 흐름.
    assert sourceTypes[sourceTypes.index("section") + 1:sourceTypes.index("section") + 4] == [
        "sectionContract:explanation",
        "sectionContract:snippet",
        "sectionContract:exercise",
    ]
    assert "sectionContract:check" not in sourceTypes

    sectionBlock = next(block for block in document.blocks if block.sourceType == "section")
    contract = sectionBlock.payload["sectionContract"]
    assert contract["title"] == "한 섹션 카드"
    assert contract["subtitle"] == "설명에서 검증까지 한 흐름"
    assert contract["goal"] == "스니펫을 보고 직접 입력합니다."
    assert contract["contractGaps"] == []


def testStructuredSectionContractReportsMissingFields() -> None:
    content = {
        "meta": {"title": "Incomplete structured lesson"},
        "sections": [
            {
                "id": "partial",
                "title": "부분 구조화 섹션",
                "goal": "goal 하나만 있는 새 계약 초안입니다.",
            }
        ],
    }

    contract = lessonContractFromYaml(content)
    section = contract.sections[0]

    assert section.contractGaps == [
        "subtitle",
        "why",
        "explanation",
        "tips",
        "snippet",
        "exercise.prompt",
        "exercise.starterCode",
        "check",
    ]

    document, _solutions = yamlToDocument(content, "ai", "partial")
    sectionBlock = next(block for block in document.blocks if block.sourceType == "section")
    assert sectionBlock.payload["sectionContractGaps"] == section.contractGaps
    assert sectionBlock.payload["sectionContract"]["contractGaps"] == section.contractGaps


def testCurriculumPackageReadinessCopyDoesNotPretendToInstall() -> None:
    failures: list[str] = []
    for path in sorted(CURRICULA_DIR.rglob("*.yaml")):
        if path.name == "schema.yaml":
            continue
        content = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        if not isinstance(content, dict):
            continue
        for index, section in enumerate(content.get("sections") or [], start=1):
            if not isinstance(section, dict):
                continue
            code = sectionCode(section)
            if not codeLooksLikePackageReadinessCheck(code):
                continue
            if codeHasInstallCommand(code):
                continue
            for field, text in sectionCopyFields(section).items():
                matched = [phrase for phrase in INSTALL_STAGE_PHRASES if phrase in text]
                if field in INSTALL_STAGE_HEADING_FIELDS and "설치" in text:
                    matched.append("설치 heading")
                if matched:
                    rel = path.relative_to(ROOT).as_posix()
                    failures.append(f"{rel} section {index} {field} uses install-stage copy for import readiness: {', '.join(matched)}")

    assert not failures


def testCurriculumPackageCopyUsesCanonicalNames() -> None:
    failures: list[str] = []
    for path in sorted(CURRICULA_DIR.rglob("*")):
        if not path.is_file() or path.suffix not in {".yaml", ".yml", ".md", ".json"}:
            continue
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(ROOT).as_posix()
        if "scikitlearn" in text.lower():
            failures.append(f"{rel}: use scikit-learn for display text or sklearn for import code")
        for phrase in EXTERNAL_STDLIB_LABELS:
            if phrase in text:
                failures.append(f"{rel}: external package is described as stdlib: {phrase}")

    assert not failures


def testCurriculumCopyDoesNotEmbedInstallCommands() -> None:
    failures: list[str] = []
    for path in sorted(CURRICULA_DIR.rglob("*")):
        if not path.is_file() or path.suffix not in {".yaml", ".yml", ".md", ".json"}:
            continue
        text = path.read_text(encoding="utf-8").lower()
        matched = [marker for marker in INSTALL_COMMAND_MARKERS if marker in text]
        if matched:
            rel = path.relative_to(ROOT).as_posix()
            failures.append(f"{rel}: use the library panel, not embedded install commands: {', '.join(matched)}")

    assert not failures


def testCurriculumCopyDoesNotKeepStaleInstallStageNames() -> None:
    failures: list[str] = []
    for path in sorted(CURRICULA_DIR.rglob("*")):
        if not path.is_file() or path.suffix not in {".yaml", ".yml", ".md", ".json"}:
            continue
        text = path.read_text(encoding="utf-8")
        matched = [match.group(0).strip() for match in STALE_INSTALL_STAGE_PATTERN.finditer(text)]
        if matched:
            rel = path.relative_to(ROOT).as_posix()
            failures.append(f"{rel}: package readiness/import checks must not be named install stages: {matched}")

    assert not failures


def testCurriculumMetaPackagesUseInstallableDistributionNames() -> None:
    failures: list[str] = []
    for path in sorted(CURRICULA_DIR.rglob("*.yaml")):
        if path.name == "schema.yaml":
            continue
        content = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        if not isinstance(content, dict):
            continue
        meta = content.get("meta") if isinstance(content.get("meta"), dict) else {}
        packages = meta.get("packages") if isinstance(meta, dict) else []
        if not isinstance(packages, list):
            continue
        for packageName in packages:
            normalized = str(packageName).strip().lower().replace("_", "-")
            replacement = CANONICAL_PACKAGE_NAMES.get(normalized)
            if replacement and str(packageName).strip() != replacement:
                rel = path.relative_to(ROOT).as_posix()
                failures.append(f"{rel}: use {replacement} in meta.packages instead of {packageName!r}")

    assert not failures


def sectionCopyFields(section: dict[str, Any]) -> dict[str, str]:
    exercise = section.get("exercise") if isinstance(section.get("exercise"), dict) else {}
    check = section.get("check") if isinstance(section.get("check"), dict) else {}
    return {
        "id": textValue(section.get("id")),
        "title": textValue(section.get("title")),
        "subtitle": textValue(section.get("subtitle")),
        "goal": textValue(section.get("goal")),
        "explanation": textValue(section.get("explanation")),
        "exercise.prompt": textValue(exercise.get("prompt")),
        "check.noError": textValue(check.get("noError")),
        "check.resultCheck": textValue(check.get("resultCheck")),
    }


def sectionCode(section: dict[str, Any]) -> str:
    exercise = section.get("exercise") if isinstance(section.get("exercise"), dict) else {}
    return "\n".join((textValue(section.get("snippet")), textValue(exercise.get("starterCode"))))


def codeLooksLikePackageReadinessCheck(code: str) -> bool:
    source = code.strip()
    if not source:
        return False
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return False
    executableNodes = [
        node
        for node in tree.body
        if not (isinstance(node, ast.Expr) and isinstance(node.value, ast.Constant) and isinstance(node.value.value, str))
    ]
    if not executableNodes:
        return False
    if all(isinstance(node, (ast.Import, ast.ImportFrom)) for node in executableNodes):
        return True
    return isinstance(executableNodes[0], (ast.Import, ast.ImportFrom))


def codeHasInstallCommand(code: str) -> bool:
    lowered = code.lower()
    return any(marker in lowered for marker in INSTALL_COMMAND_MARKERS)


def textValue(value: Any) -> str:
    return value if isinstance(value, str) else ""
