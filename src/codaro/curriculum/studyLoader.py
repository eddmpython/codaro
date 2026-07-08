from __future__ import annotations

import importlib.util
import json
import re
from copy import deepcopy
from pathlib import Path
from typing import Any

import yaml

from pydantic import BaseModel, Field


class CategoryInfo(BaseModel):
    key: str
    name: str
    description: str = ""
    count: int = 0
    track: str = ""
    path: list[str] = Field(default_factory=list)


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


def _curriculaPythonRoot() -> Path:
    """server.resolveCurriculaRoot와 같은 규칙으로 base curriculum 루트를 찾는다:
    CODARO_STUDY_DIR 환경변수 → 개발 repo 루트(curricula/python, SSOT) → 패키지 번들 폴백.
    개발 체크아웃에 릴리즈 스테이징 사본(codaro/curricula)이 남아 있어도 원본을 가리지 않는다."""
    import os

    configured = os.environ.get("CODARO_STUDY_DIR")
    if configured:
        return Path(configured).expanduser().resolve()
    devRoot = Path(__file__).resolve().parents[3] / "curricula" / "python"
    if devRoot.exists():
        return devRoot
    packageRoot = Path(__file__).resolve().parent.parent  # src/codaro/
    return packageRoot / "curricula" / "python"


def _loadCurriculaRegistry() -> Any:
    registryPath = _curriculaPythonRoot() / "__init__.py"
    spec = importlib.util.spec_from_file_location("_codaroCurriculaPythonRegistry", registryPath)
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load curriculum registry: {registryPath}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_CURRICULA_REGISTRY = _loadCurriculaRegistry()
_CURRICULA_CATEGORY_MAPPING = getattr(_CURRICULA_REGISTRY, "categoryMapping", {})
_CURRICULA_CATEGORY_META = getattr(_CURRICULA_REGISTRY, "categoryMeta", {})
_CURRICULA_CATEGORY_GROUPS = getattr(_CURRICULA_REGISTRY, "categoryGroups", {})
_CURRICULA_CATEGORY_TREE = getattr(_CURRICULA_REGISTRY, "categoryTree", [])
_CURRICULA_LEARNING_PATHS = getattr(_CURRICULA_REGISTRY, "learningPaths", {})
_CURRICULA_CATEGORY_FOLDER_MAP = getattr(_CURRICULA_REGISTRY, "categoryFolderMap", {})


CATEGORY_MAPPING = {str(key): str(value) for key, value in _CURRICULA_CATEGORY_MAPPING.items()}
CATEGORY_FOLDER_MAP = {
    str(key): str(value)
    for key, value in _CURRICULA_CATEGORY_FOLDER_MAP.items()
    if isinstance(value, str) and value
}
CATEGORY_META = {
    str(key): {"description": str(value.get("description") or "")}
    for key, value in _CURRICULA_CATEGORY_META.items()
    if isinstance(value, dict)
}
CATEGORY_GROUPS = {
    str(groupName): [category for category in categories if isinstance(category, str) and category]
    for groupName, categories in _CURRICULA_CATEGORY_GROUPS.items()
    if isinstance(categories, list)
}
CATEGORY_TREE = deepcopy(_CURRICULA_CATEGORY_TREE) if isinstance(_CURRICULA_CATEGORY_TREE, list) else []
LEARNING_PATHS = {
    str(pathName): {
        "categories": [
            category
            for category in pathPayload.get("categories", [])
            if isinstance(category, str) and category
        ],
        "description": str(pathPayload.get("description") or ""),
    }
    for pathName, pathPayload in _CURRICULA_LEARNING_PATHS.items()
    if isinstance(pathPayload, dict)
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
            categoryDir = self._categoryDir(key)
            if not categoryDir.exists():
                continue
            count = len(self._listContentIds(key))
            meta = CATEGORY_META.get(key, {})
            path = _categoryPath(key)
            result.append(CategoryInfo(
                key=key,
                name=name,
                description=meta.get("description", ""),
                count=count,
                track=path[0] if path else _categoryTrack(key),
                path=path,
            ))
        return result

    def _categoryDir(self, category: str) -> Path:
        relative = CATEGORY_FOLDER_MAP.get(category, category)
        return self._studyDir / relative

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
        categoryDir = self._categoryDir(category)
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
        categoryDir = self._categoryDir(category)
        if category == "practical":
            subPath = categoryDir / contentId / "study.yaml"
            if subPath.exists():
                return subPath
        return categoryDir / f"{contentId}.yaml"

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
        indexPath = self._categoryDir(category) / "curriculum.json"
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


def _categoryTrack(category: str) -> str:
    for groupName, categories in CATEGORY_GROUPS.items():
        if category in categories:
            return groupName
    return "기타"


def curriculumCategoryTree() -> list[dict[str, Any]]:
    return _pruneCategoryTree(CATEGORY_TREE, set(CATEGORY_MAPPING))


def _pruneCategoryTree(nodes: list[dict[str, Any]], knownCategories: set[str]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for node in nodes:
        categories = [
            category
            for category in _textList(node.get("categories"))
            if category in knownCategories
        ]
        children = _pruneCategoryTree(_nodeChildren(node), knownCategories)
        result.append({
            "id": str(node.get("id") or node.get("name") or ""),
            "name": str(node.get("name") or node.get("id") or ""),
            "description": str(node.get("description") or ""),
            "categories": categories,
            "children": children,
        })
    return result


def _categoryPath(category: str) -> list[str]:
    path = _findCategoryPath(CATEGORY_TREE, category)
    return path if path else []


def _findCategoryPath(nodes: list[dict[str, Any]], category: str) -> list[str] | None:
    for node in nodes:
        nodeName = str(node.get("name") or node.get("id") or "")
        if category in _textList(node.get("categories")):
            return [nodeName]
        childPath = _findCategoryPath(_nodeChildren(node), category)
        if childPath:
            return [nodeName, *childPath]
    return None


def _nodeChildren(node: dict[str, Any]) -> list[dict[str, Any]]:
    children = node.get("children")
    if not isinstance(children, list):
        return []
    return [child for child in children if isinstance(child, dict)]


def _textList(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, str) and item]


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
