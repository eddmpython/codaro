from pathlib import Path
from datetime import datetime
import yaml
import re
import os
import importlib
from concurrent.futures import ThreadPoolExecutor

contentDir = Path(__file__).parent
BASE_URL = "https://eddmpython.com"
DEFAULT_OG_IMAGE = f"{BASE_URL}/assets/og/eddmpythonOg.png"

categoryMapping = {
    '30days': '30일완성',
    'advancedPython': '고급파이썬',
    'excel': '엑셀자동화',
    'numpy': 'NumPy 수치연산',
    'sympy': 'SymPy 기호수학',
    'pandas': 'Pandas 데이터분석',
    'duckdb': 'Duckdb 데이터분석',
    'polars': 'Polars 데이터분석',
    'matplotlib': 'matplotlib 시각화',
    'seaborn': 'seaborn 시각화',
    'plotly': 'plotly 시각화',
    'altair': 'altair 시각화',
    'statsmodels': 'statsmodels 통계모델',
    'sklearn': 'sklearn 머신러닝',
    'regex': 'regex 비정형데이터',
    'pillow': 'Pillow 이미지처리',
    'opencv': 'OpenCV 컴퓨터비전',
    'practical': '실전파이썬',
}

categoryMeta = {
    '30days': {
        'icon': 'calendar_month',
        'color': 'blue',
        'description': '30일 만에 완성하는 체계적인 Python 기초',
        'imageUrl': None,
    },
    'advancedPython': {
        'icon': 'bolt',
        'color': 'purple',
        'description': '고급 문법과 패턴으로 레벨업',
        'imageUrl': None,
    },
    'excel': {
        'icon': 'table_chart',
        'color': 'green',
        'description': '엑셀 반복 작업을 자동화하세요',
        'imageUrl': None,
    },
    'numpy': {
        'icon': 'grid_on',
        'color': 'cyan',
        'description': '고성능 수치 연산의 기초',
        'imageUrl': None,
    },
    'sympy': {
        'icon': 'functions',
        'color': 'amber',
        'description': '기호 수학과 방정식 풀이',
        'imageUrl': None,
    },
    'pandas': {
        'icon': 'analytics',
        'color': 'indigo',
        'description': '데이터 분석의 필수 도구',
        'imageUrl': None,
    },
    'duckdb': {
        'icon': 'storage',
        'color': 'yellow',
        'description': '빠른 SQL 기반 데이터 분석',
        'imageUrl': None,
    },
    'polars': {
        'icon': 'speed',
        'color': 'orange',
        'description': '초고속 데이터프레임 처리',
        'imageUrl': None,
    },
    'matplotlib': {
        'icon': 'show_chart',
        'color': 'blue',
        'description': 'Python 시각화의 기본',
        'imageUrl': None,
    },
    'seaborn': {
        'icon': 'bar_chart',
        'color': 'teal',
        'description': '통계 시각화를 쉽고 예쁘게',
        'imageUrl': None,
    },
    'plotly': {
        'icon': 'insights',
        'color': 'violet',
        'description': '인터랙티브 차트 만들기',
        'imageUrl': None,
    },
    'altair': {
        'icon': 'auto_graph',
        'color': 'sky',
        'description': '선언적 시각화 문법',
        'imageUrl': None,
    },
    'statsmodels': {
        'icon': 'query_stats',
        'color': 'slate',
        'description': '통계 모델링과 검정',
        'imageUrl': None,
    },
    'sklearn': {
        'icon': 'model_training',
        'color': 'rose',
        'description': '머신러닝 입문과 실전',
        'imageUrl': None,
    },
    'regex': {
        'icon': 'text_fields',
        'color': 'lime',
        'description': '정규표현식으로 텍스트 처리',
        'imageUrl': None,
    },
    'pillow': {
        'icon': 'image',
        'color': 'pink',
        'description': '이미지 편집과 처리',
        'imageUrl': None,
    },
    'opencv': {
        'icon': 'visibility',
        'color': 'red',
        'description': '컴퓨터 비전의 세계',
        'imageUrl': None,
    },
    'practical': {
        'icon': 'rocket_launch',
        'color': 'fuchsia',
        'description': '실전 프로젝트로 배우는 Python',
        'imageUrl': None,
    },
}

categoryGroups = {
    '전체': None,
    '기초': ['30days', 'advancedPython'],
    '데이터분석': ['pandas', 'numpy', 'polars', 'duckdb', 'excel'],
    '시각화': ['matplotlib', 'seaborn', 'plotly', 'altair'],
    '수학/통계/ML': ['sympy', 'statsmodels', 'sklearn'],
    '이미지': ['pillow', 'opencv'],
    '기타': ['regex', 'practical'],
}

featuredCategories = ['30days', 'pandas', 'advancedPython', 'matplotlib']

learningPaths = {
    '초급': {
        'icon': 'school',
        'color': 'emerald',
        'categories': ['30days'],
        'description': '프로그래밍이 처음이라면',
    },
    '중급': {
        'icon': 'trending_up',
        'color': 'blue',
        'categories': ['advancedPython', 'pandas', 'numpy'],
        'description': '기초를 마쳤다면',
    },
    '고급': {
        'icon': 'rocket_launch',
        'color': 'purple',
        'categories': ['sklearn', 'practical'],
        'description': '실무에 적용하고 싶다면',
    },
}

categoryUrlMapping = {v: k for k, v in categoryMapping.items()}
categoryOrder = list(categoryMapping.values())

_menuCache = None
_contentMetaCache = {}
_contentCache = {}


def initMenuCache():
    global _menuCache
    if _menuCache is None:
        buildMenuStructure()


def warmupAllCaches():
    print("[StudyPython] 캐시 워밍업 시작...")
    buildMenuStructure()
    categories = getAllCategories()
    contentCount = 0
    errors = []
    for category in categories:
        getCategoryIllustration(category)
        getCategoryFullMeta(category)
        for contentId in listContents(category):
            try:
                loadContent(category, contentId)
                contentCount += 1
            except Exception as e:
                errors.append(f"{category}/{contentId}")
                print(f"[StudyPython] 캐시 실패: {category}/{contentId} - {e}")
    print(f"[StudyPython] 캐시 워밍업 완료 ({len(categories)}개 카테고리, {contentCount}개 콘텐츠, {len(errors)}개 오류)")


def clearMenuCache():
    global _menuCache, _contentMetaCache, _contentCache
    _menuCache = None
    _contentMetaCache = {}
    _contentCache = {}


def loadContent(category: str, contentId: str, noCache: bool = False) -> dict:
    cacheKey = f"{category}/{contentId}"
    if not noCache and cacheKey in _contentCache:
        return _contentCache[cacheKey]
    filePath = getContentPath(category, contentId)
    if not filePath.exists():
        raise FileNotFoundError(f"Content not found: {filePath}")
    with open(filePath, 'r', encoding='utf-8') as f:
        content = yaml.safe_load(f)
    _contentCache[cacheKey] = content
    return content

def listContents(category: str) -> list:
    categoryDir = contentDir / category
    if not categoryDir.exists():
        return []
    contents = []
    for f in categoryDir.glob("*.yaml"):
        if f.stem != "schema" and "_backup" not in f.stem:
            contents.append(f.stem)
    if category == 'practical':
        for subDir in categoryDir.iterdir():
            if subDir.is_dir() and (subDir / "study.yaml").exists():
                contents.append(subDir.name)
    return contents

def getContentPath(category: str, contentId: str) -> Path:
    if category == 'practical':
        subDirPath = contentDir / category / contentId / "study.yaml"
        if subDirPath.exists():
            return subDirPath
    return contentDir / category / f"{contentId}.yaml"

def getAllCategories() -> list:
    return [d.name for d in contentDir.iterdir() if d.is_dir() and d.name != 'renderers' and d.name != '__pycache__']

def buildMenuTitle(contentId: str, metaTitle: str) -> str:
    dayMatch = re.match(r'day(\d+)(?:_(\d+))?(?:_(.+))?', contentId)
    if dayMatch:
        dayNum = dayMatch.group(1)
        subNum = dayMatch.group(2)
        rest = dayMatch.group(3)

        if subNum and rest:
            return f"{dayNum}일차-{subNum} {rest.replace('_', ' ')}"
        elif subNum:
            return f"{dayNum}일차-{subNum} {metaTitle}"
        elif rest:
            return f"{dayNum}일차 {rest.replace('_', ' ')}"
        else:
            return f"{dayNum}일차 {metaTitle}"

    numMatch = re.match(r'(\d+)(?:-(\d+))?(?:_(.+))?', contentId)
    if numMatch:
        num = numMatch.group(1)
        subNum = numMatch.group(2)
        if subNum:
            return f"{num}-{subNum}. {metaTitle}"
        return f"{num}. {metaTitle}"

    return metaTitle


def loadMetaOnly(category: str, contentId: str) -> dict:
    cacheKey = f"{category}/{contentId}"
    if cacheKey in _contentMetaCache:
        return _contentMetaCache[cacheKey]
    filePath = getContentPath(category, contentId)
    if not filePath.exists():
        return {}
    with open(filePath, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip() == 'meta:':
                break
        metaLines = ['meta:\n']
        for line in f:
            if line and not line[0].isspace() and line.strip():
                break
            metaLines.append(line)
        try:
            data = yaml.safe_load(''.join(metaLines))
            meta = data.get('meta', {}) if data else {}
        except:
            meta = {}
    _contentMetaCache[cacheKey] = meta
    return meta


def loadMetaTask(args):
    category, contentId, displayName = args
    meta = loadMetaOnly(category, contentId)
    metaTitle = meta.get('title', contentId)
    badge = meta.get('badge', '')
    title = buildMenuTitle(contentId, metaTitle)
    urlPath = f"/study/{displayName}/{contentId}"
    return (title, {'url': urlPath, 'badge': badge})


def buildMenuStructure() -> dict:
    global _menuCache
    if _menuCache is not None:
        return _menuCache

    menu = {}
    tasks = []
    categoryContents = {}

    for category in getAllCategories():
        if category not in categoryMapping:
            continue
        displayName = categoryMapping[category]
        contents = listContents(category)
        sortedContents = sorted(contents, key=lambda x: extractSortKey(x))
        categoryContents[displayName] = sortedContents
        for contentId in sortedContents:
            tasks.append((category, contentId, displayName))

    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(loadMetaTask, tasks))

    idx = 0
    for category in getAllCategories():
        if category not in categoryMapping:
            continue
        displayName = categoryMapping[category]
        sortedContents = categoryContents.get(displayName, [])
        items = {}
        for _ in sortedContents:
            title, data = results[idx]
            items[title] = data
            idx += 1
        if items:
            menu[displayName] = items

    _menuCache = menu
    return menu

def extractSortKey(name: str):
    dayMatch = re.match(r'day(\d+)', name)
    if dayMatch:
        dayNum = int(dayMatch.group(1))
        subMatch = re.search(r'day\d+_(\d+)', name)
        subNum = int(subMatch.group(1)) if subMatch else 0
        return (dayNum * 100 + subNum, name)

    numMatch = re.match(r'(\d+)(?:-(\d+))?', name)
    if numMatch:
        num = int(numMatch.group(1))
        subNum = int(numMatch.group(2)) if numMatch.group(2) else 0
        return (num * 100 + subNum, name)

    return (999999, name)

def findContentByUrl(categoryUrl: str, contentUrl: str) -> tuple:
    category = categoryUrlMapping.get(categoryUrl, categoryUrl)
    filePath = getContentPath(category, contentUrl)
    if filePath.exists():
        return (category, contentUrl)
    return (None, None)


def validatePrerequisiteUrl(url: str) -> bool:
    if not url or not url.startswith('/study/'):
        return False
    parts = url.split('/')
    if len(parts) < 4:
        return False
    categoryUrl = parts[2]
    contentId = parts[3]
    category = categoryUrlMapping.get(categoryUrl, categoryUrl)
    filePath = getContentPath(category, contentId)
    return filePath.exists()


def buildPageUrl(category: str, contentId: str) -> str:
    displayName = categoryMapping.get(category, category)
    return f"{BASE_URL}/study/{displayName}/{contentId}"


def buildSeoMeta(content: dict, category: str, contentId: str) -> dict:
    meta = content.get('meta', {})
    intro = content.get('intro', {})
    seo = meta.get('seo', {})

    categoryDisplay = categoryMapping.get(category, category)
    metaTitle = meta.get('title', contentId)

    seoTitle = seo.get('title', f"{metaTitle} | {categoryDisplay} | FinJang 파이썬")
    seoDescription = seo.get('description', intro.get('description', intro.get('goal', f'{metaTitle} - 파이썬 학습')))
    seoKeywords = seo.get('keywords', meta.get('tags', []))
    if isinstance(seoKeywords, list):
        seoKeywords = ', '.join(seoKeywords + ['파이썬', '프로그래밍', 'Python'])

    ogImage = seo.get('ogImage')
    if ogImage and not ogImage.startswith('http'):
        ogImage = f"{BASE_URL}/assets/og/{ogImage}"
    elif not ogImage:
        ogImage = DEFAULT_OG_IMAGE

    pageUrl = buildPageUrl(category, contentId)

    return {
        'title': seoTitle,
        'description': seoDescription[:160] if len(seoDescription) > 160 else seoDescription,
        'keywords': seoKeywords,
        'ogImage': ogImage,
        'pageUrl': pageUrl,
        'emoji': intro.get('emoji', '📚'),
        'category': categoryDisplay,
    }


def getContentMeta(category: str, contentId: str) -> dict:
    return loadMetaOnly(category, contentId)


def getPrevNextContent(category: str, contentId: str) -> dict:
    contents = listContents(category)
    sortedContents = sorted(contents, key=lambda x: extractSortKey(x))

    if contentId not in sortedContents:
        return {'prev': None, 'next': None}

    currentIdx = sortedContents.index(contentId)
    displayName = categoryMapping.get(category, category)

    prevContent = None
    nextContent = None

    if currentIdx > 0:
        prevId = sortedContents[currentIdx - 1]
        prevTitle = getContentMeta(category, prevId).get('title', prevId)
        prevContent = {
            'id': prevId,
            'title': prevTitle,
            'url': f"/study/{displayName}/{prevId}"
        }

    if currentIdx < len(sortedContents) - 1:
        nextId = sortedContents[currentIdx + 1]
        nextTitle = getContentMeta(category, nextId).get('title', nextId)
        nextContent = {
            'id': nextId,
            'title': nextTitle,
            'url': f"/study/{displayName}/{nextId}"
        }

    return {'prev': prevContent, 'next': nextContent}


def getAllContentForSitemap() -> list:
    sitemapItems = []

    for category in getAllCategories():
        if category == 'main':
            continue
        contents = listContents(category)

        for contentId in contents:
            try:
                content = loadContent(category, contentId)
                meta = content.get('meta', {})
                filePath = getContentPath(category, contentId)
                lastMod = datetime.fromtimestamp(os.path.getmtime(filePath)).strftime('%Y-%m-%d')

                priority = '0.8'
                if meta.get('order', 99) <= 3:
                    priority = '0.9'

                sitemapItems.append({
                    'loc': buildPageUrl(category, contentId),
                    'lastmod': lastMod,
                    'changefreq': 'weekly',
                    'priority': priority,
                    'title': meta.get('title', contentId),
                    'category': category,
                })
            except Exception:
                continue

    return sorted(sitemapItems, key=lambda x: (x['category'], x.get('title', '')))


_illustrationCache = {}


def getCategoryIllustration(category: str) -> str:
    if category in _illustrationCache:
        return _illustrationCache[category]
    try:
        module = importlib.import_module(f'.{category}.illustration', 'core.studyPython.content')
        svg = getattr(module, 'SVG', None)
        _illustrationCache[category] = svg
        return svg
    except:
        _illustrationCache[category] = None
        return None


def getCategoryCodePreview(category: str) -> str:
    try:
        module = importlib.import_module(f'.{category}.illustration', 'core.studyPython.content')
        return getattr(module, 'CODE_PREVIEW', '')
    except:
        return ''


def getCategoryContentCount(category: str) -> int:
    return len(listContents(category))


def getCategoryFullMeta(category: str) -> dict:
    name = categoryMapping.get(category, category)
    meta = categoryMeta.get(category, {})
    count = getCategoryContentCount(category)
    return {
        'key': category,
        'name': name,
        'icon': meta.get('icon', 'school'),
        'color': meta.get('color', 'blue'),
        'description': meta.get('description', ''),
        'imageUrl': meta.get('imageUrl'),
        'count': count,
    }


def getCategoryFirstContentUrl(category: str) -> str:
    contents = listContents(category)
    if not contents:
        return f'/studypython'
    sortedContents = sorted(contents, key=lambda x: extractSortKey(x))
    firstContentId = sortedContents[0]
    displayName = categoryMapping.get(category, category)
    return f'/study/{displayName}/{firstContentId}'
