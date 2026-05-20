from __future__ import annotations

from codaro.curriculum.converter import yamlToDocument
from codaro.curriculum.sectionContract import lessonContractFromYaml


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
            "diagram": {"steps": [{"label": "개념"}, {"label": "실습"}]},
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
    section = contract.sections[0]
    assert section.id == "dataframe-basics"
    assert section.goal.startswith("dict에서")
    assert section.why.startswith("엑셀")
    assert section.tips == ["열 길이는 같아야 합니다."]
    assert "pd.DataFrame" in section.snippet
    assert section.exercise.prompt.startswith("sales")
    assert section.exercise.check == {"contains": "DataFrame"}
    assert section.check == {"variable": "sales"}


def testYamlToDocumentMaterializesStructuredSectionContract() -> None:
    content = {
        "meta": {"title": "Structured lesson", "packages": ["pandas"]},
        "intro": {"goal": "계약 기반 레슨입니다.", "benefits": ["렌더러가 의미를 추측하지 않습니다."]},
        "sections": [
            {
                "title": "섹션 카드",
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

    snippet = next(block for block in document.blocks if block.sourceType == "sectionContract:snippet")
    exercise = next(block for block in document.blocks if block.sourceType == "sectionContract:exercise")
    check = next(block for block in document.blocks if block.sourceType == "sectionContract:check")

    assert snippet.role == "snippet"
    assert snippet.content == "import pandas as pd"
    assert exercise.role == "exercise"
    assert exercise.content == "import pandas as pd\nframe = ___"
    assert exercise.guide is not None
    assert exercise.guide.solution == "import pandas as pd\nframe = pd.DataFrame({'x': [1]})"
    assert exercise.guide.checkConfig == {"variable": "frame"}
    assert solutions[exercise.id] == "import pandas as pd\nframe = pd.DataFrame({'x': [1]})"
    assert check.role == "check"


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
    assert sourceTypes[sourceTypes.index("section") + 1:sourceTypes.index("section") + 5] == [
        "sectionContract:explanation",
        "sectionContract:snippet",
        "sectionContract:exercise",
        "sectionContract:check",
    ]

    sectionBlock = next(block for block in document.blocks if block.sourceType == "section")
    contract = sectionBlock.payload["sectionContract"]
    assert contract["title"] == "한 섹션 카드"
    assert contract["subtitle"] == "설명에서 검증까지 한 흐름"
    assert contract["goal"] == "스니펫을 보고 직접 입력합니다."
