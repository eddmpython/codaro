from __future__ import annotations

import re
from pathlib import Path

import yaml

from pydantic import BaseModel, Field


class CategoryInfo(BaseModel):
    key: str
    name: str
    description: str = ""
    count: int = 0


class ContentSummary(BaseModel):
    contentId: str
    title: str
    category: str
    sortKey: tuple = (0, "")


class ContentData(BaseModel):
    model_config = {"arbitrary_types_allowed": True}

    meta: dict = Field(default_factory=dict)
    intro: dict = Field(default_factory=dict)
    sections: list = Field(default_factory=list)


CATEGORY_MAPPING = {
    "marimo": "파이썬과마리모",
    "30days": "30일완성",
    "advancedPython": "고급파이썬",
    "excel": "엑셀자동화",
    "numpy": "NumPy 수치연산",
    "pandas": "Pandas 데이터분석",
    "duckdb": "Duckdb 데이터분석",
    "polars": "Polars 데이터분석",
    "matplotlib": "matplotlib 시각화",
    "seaborn": "seaborn 시각화",
    "plotly": "plotly 시각화",
    "altair": "altair 시각화",
    "statsmodels": "statsmodels 통계모델",
    "sklearn": "sklearn 머신러닝",
    "regex": "regex 비정형데이터",
    "pillow": "Pillow 이미지처리",
    "opencv": "OpenCV 컴퓨터비전",
    "marimoUi": "marimo 앱",
    "practical": "실전파이썬",
}

CATEGORY_META = {
    "marimo": {"description": "인터랙티브 Python 노트북으로 시작하는 프로그래밍"},
    "30days": {"description": "30일 만에 완성하는 체계적인 Python 기초"},
    "advancedPython": {"description": "고급 문법과 패턴으로 레벨업"},
    "excel": {"description": "엑셀 반복 작업을 자동화하세요"},
    "numpy": {"description": "고성능 수치 연산의 기초"},
    "pandas": {"description": "데이터 분석의 필수 도구"},
    "matplotlib": {"description": "Python 시각화의 기본"},
    "seaborn": {"description": "통계 시각화를 쉽고 예쁘게"},
    "plotly": {"description": "인터랙티브 차트 만들기"},
    "sklearn": {"description": "머신러닝 입문과 실전"},
    "practical": {"description": "실전 프로젝트로 배우는 Python"},
}

CATEGORY_GROUPS = {
    "기초": ["marimo", "30days", "advancedPython"],
    "데이터분석": ["pandas", "numpy", "polars", "duckdb", "excel"],
    "시각화": ["matplotlib", "seaborn", "plotly", "altair"],
    "수학/통계/ML": ["statsmodels", "sklearn"],
    "이미지": ["pillow", "opencv"],
    "기타": ["regex", "marimoUi", "practical"],
}

LEARNING_PATHS = {
    "초급": {"categories": ["marimo", "30days"], "description": "프로그래밍이 처음이라면"},
    "중급": {"categories": ["advancedPython", "pandas", "numpy"], "description": "기초를 마쳤다면"},
    "고급": {"categories": ["sklearn", "practical", "marimoUi"], "description": "실무에 적용하고 싶다면"},
}


class ContentLoader:
    def __init__(self, contentDir: str | Path):
        self._contentDir = Path(contentDir).resolve()
        self._cache: dict[str, dict] = {}

    @property
    def contentDir(self) -> Path:
        return self._contentDir

    def listCategories(self) -> list[CategoryInfo]:
        result: list[CategoryInfo] = []
        for key, name in CATEGORY_MAPPING.items():
            categoryDir = self._contentDir / key
            if not categoryDir.exists():
                continue
            count = len(self._listContentIds(key))
            meta = CATEGORY_META.get(key, {})
            result.append(CategoryInfo(
                key=key,
                name=name,
                description=meta.get("description", ""),
                count=count,
            ))
        return result

    def listContents(self, category: str) -> list[ContentSummary]:
        contentIds = self._listContentIds(category)
        summaries: list[ContentSummary] = []
        for contentId in contentIds:
            meta = self._loadMetaOnly(category, contentId)
            title = meta.get("title", contentId)
            sortKey = _extractSortKey(contentId)
            summaries.append(ContentSummary(
                contentId=contentId,
                title=_buildMenuTitle(contentId, title),
                category=category,
                sortKey=sortKey,
            ))
        return sorted(summaries, key=lambda s: s.sortKey)

    def loadContent(self, category: str, contentId: str) -> dict:
        cacheKey = f"{category}/{contentId}"
        if cacheKey in self._cache:
            return self._cache[cacheKey]
        filePath = self._getContentPath(category, contentId)
        if not filePath.exists():
            raise FileNotFoundError(f"Content not found: {filePath}")
        with open(filePath, "r", encoding="utf-8") as f:
            content = yaml.safe_load(f)
        self._cache[cacheKey] = content
        return content

    def getPrevNext(self, category: str, contentId: str) -> dict:
        contents = self.listContents(category)
        ids = [c.contentId for c in contents]
        if contentId not in ids:
            return {"prev": None, "next": None}
        idx = ids.index(contentId)
        prev = {"contentId": ids[idx - 1], "title": contents[idx - 1].title} if idx > 0 else None
        nxt = {"contentId": ids[idx + 1], "title": contents[idx + 1].title} if idx < len(ids) - 1 else None
        return {"prev": prev, "next": nxt}

    def _listContentIds(self, category: str) -> list[str]:
        categoryDir = self._contentDir / category
        if not categoryDir.exists():
            return []
        ids: list[str] = []
        for f in categoryDir.glob("*.yaml"):
            if f.stem != "schema" and "_backup" not in f.stem:
                ids.append(f.stem)
        if category == "practical":
            for subDir in categoryDir.iterdir():
                if subDir.is_dir() and (subDir / "study.yaml").exists():
                    ids.append(subDir.name)
        return ids

    def _getContentPath(self, category: str, contentId: str) -> Path:
        if category == "practical":
            subPath = self._contentDir / category / contentId / "study.yaml"
            if subPath.exists():
                return subPath
        return self._contentDir / category / f"{contentId}.yaml"

    def _loadMetaOnly(self, category: str, contentId: str) -> dict:
        try:
            content = self.loadContent(category, contentId)
            return content.get("meta", {})
        except FileNotFoundError:
            return {}


def _extractSortKey(name: str) -> tuple:
    dayMatch = re.match(r"day(\d+)", name)
    if dayMatch:
        dayNum = int(dayMatch.group(1))
        subMatch = re.search(r"day\d+_(\d+)", name)
        subNum = int(subMatch.group(1)) if subMatch else 0
        return (dayNum * 100 + subNum, name)

    numMatch = re.match(r"(\d+)(?:-(\d+))?", name)
    if numMatch:
        num = int(numMatch.group(1))
        subNum = int(numMatch.group(2)) if numMatch.group(2) else 0
        return (num * 100 + subNum, name)

    return (999999, name)


def _buildMenuTitle(contentId: str, metaTitle: str) -> str:
    dayMatch = re.match(r"day(\d+)(?:_(.+))?", contentId)
    if dayMatch:
        dayNum = dayMatch.group(1)
        rest = dayMatch.group(2)
        if rest:
            return f"{dayNum}일차 {rest.replace('_', ' ')}"
        return f"{dayNum}일차 {metaTitle}"

    numMatch = re.match(r"(\d+)(?:_(.+))?", contentId)
    if numMatch:
        num = numMatch.group(1)
        return f"{num}. {metaTitle}"

    return metaTitle
