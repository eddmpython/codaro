from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

from pydantic import BaseModel, Field


class CategoryInfo(BaseModel):
    key: str
    name: str
    description: str = ""
    count: int = 0


class StudySummary(BaseModel):
    contentId: str
    title: str
    category: str
    sortKey: tuple = (0, "")


class StudyData(BaseModel):
    model_config = {"arbitrary_types_allowed": True}

    meta: dict = Field(default_factory=dict)
    intro: dict = Field(default_factory=dict)
    sections: list = Field(default_factory=list)


CATEGORY_MAPPING = {
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
    "practical": "실전파이썬",
}

CATEGORY_META = {
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
    "기초": ["30days", "advancedPython"],
    "데이터분석": ["pandas", "numpy", "polars", "duckdb", "excel"],
    "시각화": ["matplotlib", "seaborn", "plotly", "altair"],
    "수학/통계/ML": ["statsmodels", "sklearn"],
    "이미지": ["pillow", "opencv"],
    "기타": ["regex", "practical"],
}

LEARNING_PATHS = {
    "초급": {"categories": ["30days"], "description": "프로그래밍이 처음이라면"},
    "중급": {"categories": ["advancedPython", "pandas", "numpy"], "description": "기초를 마쳤다면"},
    "고급": {"categories": ["sklearn", "practical"], "description": "실무에 적용하고 싶다면"},
}


class StudyLoader:
    def __init__(self, studyDir: str | Path):
        self._studyDir = Path(studyDir).resolve()
        self._cache: dict[str, dict] = {}
        self._contentIdCache: dict[str, list[str]] = {}
        self._metaCache: dict[str, dict] = {}
        self._categoryIndexCache: dict[str, list[dict] | None] = {}
        self._summaryCache: dict[str, list[StudySummary]] = {}
        self._prevNextCache: dict[str, dict] = {}

    @property
    def studyDir(self) -> Path:
        return self._studyDir

    def listCategories(self) -> list[CategoryInfo]:
        result: list[CategoryInfo] = []
        for key, name in CATEGORY_MAPPING.items():
            categoryDir = self._studyDir / key
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

    def listContents(self, category: str) -> list[StudySummary]:
        if category in self._summaryCache:
            return list(self._summaryCache[category])
        summaries: list[StudySummary] = []
        categoryIndex = self._loadCategoryIndex(category)
        if categoryIndex:
            for item in categoryIndex:
                contentId = item["contentId"]
                title = item["title"]
                sortKey = _extractSortKey(contentId)
                summaries.append(StudySummary(
                    contentId=contentId,
                    title=_buildMenuTitle(contentId, title),
                    category=category,
                    sortKey=sortKey,
                ))
        else:
            contentIds = self._listContentIds(category)
            for contentId in contentIds:
                meta = self._loadMetaOnly(category, contentId)
                title = meta.get("title", contentId)
                sortKey = _extractSortKey(contentId)
                summaries.append(StudySummary(
                    contentId=contentId,
                    title=_buildMenuTitle(contentId, title),
                    category=category,
                    sortKey=sortKey,
                ))
        self._summaryCache[category] = sorted(summaries, key=lambda s: s.sortKey)
        return list(self._summaryCache[category])

    def loadStudy(self, category: str, contentId: str) -> dict:
        cacheKey = f"{category}/{contentId}"
        if cacheKey in self._cache:
            return self._cache[cacheKey]
        filePath = self._getStudyPath(category, contentId)
        if not filePath.exists():
            raise FileNotFoundError(f"Study not found: {filePath}")
        with open(filePath, "r", encoding="utf-8") as f:
            content = yaml.safe_load(f)
        self._cache[cacheKey] = content
        return content

    def getPrevNext(self, category: str, contentId: str) -> dict:
        cacheKey = f"{category}/{contentId}"
        if cacheKey in self._prevNextCache:
            return dict(self._prevNextCache[cacheKey])
        contents = self.listContents(category)
        ids = [c.contentId for c in contents]
        if contentId not in ids:
            return {"prev": None, "next": None}
        idx = ids.index(contentId)
        prev = {"contentId": ids[idx - 1], "title": contents[idx - 1].title} if idx > 0 else None
        nxt = {"contentId": ids[idx + 1], "title": contents[idx + 1].title} if idx < len(ids) - 1 else None
        self._prevNextCache[cacheKey] = {"prev": prev, "next": nxt}
        return dict(self._prevNextCache[cacheKey])

    def _listContentIds(self, category: str) -> list[str]:
        if category in self._contentIdCache:
            return list(self._contentIdCache[category])
        categoryIndex = self._loadCategoryIndex(category)
        if categoryIndex:
            ids = [item["contentId"] for item in categoryIndex]
            self._contentIdCache[category] = ids
            return list(ids)
        categoryDir = self._studyDir / category
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
        self._contentIdCache[category] = ids
        return list(ids)

    def _getStudyPath(self, category: str, contentId: str) -> Path:
        if category == "practical":
            subPath = self._studyDir / category / contentId / "study.yaml"
            if subPath.exists():
                return subPath
        return self._studyDir / category / f"{contentId}.yaml"

    def _loadMetaOnly(self, category: str, contentId: str) -> dict:
        cacheKey = f"{category}/{contentId}"
        if cacheKey in self._metaCache:
            return dict(self._metaCache[cacheKey])
        categoryIndex = self._loadCategoryIndex(category)
        if categoryIndex:
            for item in categoryIndex:
                if item["contentId"] == contentId:
                    meta = {"title": item["title"]}
                    self._metaCache[cacheKey] = meta
                    return dict(meta)
        try:
            filePath = self._getStudyPath(category, contentId)
            meta = _readMetaHeader(filePath)
            self._metaCache[cacheKey] = meta
            return dict(meta)
        except FileNotFoundError:
            return {}

    def _loadCategoryIndex(self, category: str) -> list[dict] | None:
        if category in self._categoryIndexCache:
            cached = self._categoryIndexCache[category]
            return list(cached) if cached else None
        indexPath = self._studyDir / category / "curriculum.json"
        if not indexPath.exists():
            self._categoryIndexCache[category] = None
            return None
        with open(indexPath, "r", encoding="utf-8") as file:
            payload = json.load(file)
        entries = _extractIndexEntries(payload)
        self._categoryIndexCache[category] = entries
        return list(entries)


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


def _extractIndexEntries(payload: dict) -> list[dict]:
    for key in ("days", "modules", "lessons", "items"):
        items = payload.get(key)
        if not isinstance(items, list):
            continue
        entries: list[dict] = []
        for item in items:
            if not isinstance(item, dict):
                continue
            fileName = item.get("file")
            if not isinstance(fileName, str) or not fileName.endswith(".yaml"):
                continue
            contentId = Path(fileName).stem
            title = item.get("title", contentId)
            entries.append({"contentId": contentId, "title": title})
        if entries:
            return entries
    return []


def _readMetaHeader(filePath: Path) -> dict:
    with open(filePath, "r", encoding="utf-8") as file:
        lines = file.readlines()
    metaLines: list[str] = []
    isMetaSection = False
    for line in lines:
        if not isMetaSection:
            if line.startswith("meta:"):
                isMetaSection = True
                metaLines.append(line)
            continue
        if line.strip() and not line.startswith((" ", "\t")):
            break
        metaLines.append(line)
    if not metaLines:
        return {}
    metaPayload = yaml.safe_load("".join(metaLines)) or {}
    if not isinstance(metaPayload, dict):
        return {}
    meta = metaPayload.get("meta", {})
    return meta if isinstance(meta, dict) else {}
