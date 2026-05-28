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
    'builtins': '표준라이브러리',
    'excel': '엑셀자동화',
    'openpyxl': 'openpyxl 엑셀파일자동화',
    'xlwings': 'xlwings 라이브 자동화',
    'pdf': 'PDF 자동화',
    'email': '이메일 자동화',
    'word': 'Word 문서자동화',
    'numpy': 'NumPy 수치연산',
    'sympy': 'SymPy 기호수학',
    'pandas': 'Pandas 데이터분석',
    'duckdb': 'Duckdb 데이터분석',
    'polars': 'Polars 데이터분석',
    'matplotlib': 'matplotlib 시각화',
    'seaborn': 'seaborn 시각화',
    'plotly': 'plotly 시각화',
    'altair': 'altair 시각화',
    'folium': 'folium 지도시각화',
    'scipy': 'SciPy 과학계산',
    'statsmodels': 'statsmodels 통계모델',
    'sklearn': 'sklearn 머신러닝',
    'networkx': 'NetworkX 그래프분석',
    'regex': 'regex 비정형데이터',
    'pillow': 'Pillow 이미지처리',
    'opencv': 'OpenCV 컴퓨터비전',
    'visionBasics': '이미지비전 기초',
    'visionFeatures': '이미지비전 특징점',
    'deepVision': '딥러닝 비전',
    'visionApps': '이미지비전 응용',
    'pydantic': 'Pydantic 데이터검증',
    'practical': '실전파이썬',
    'playwright': 'Playwright 브라우저자동화',
    'fileOps': '파일자동화',
    'procCtl': '프로세스자동화',
    'watchSched': '감시·스케줄',
    'inputCtl': '입력·GUI자동화',
    'llmBasics': 'LLM 통합 기초',
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
    'builtins': {
        'icon': 'library_books',
        'color': 'zinc',
        'description': 'Python 표준 라이브러리를 로컬 환경에서 익히는 경로',
        'imageUrl': None,
    },
    'excel': {
        'icon': 'table_chart',
        'color': 'green',
        'description': '엑셀 반복 작업을 자동화하세요',
        'imageUrl': None,
    },
    'openpyxl': {
        'icon': 'description',
        'color': 'emerald',
        'description': 'Excel 앱 없이 .xlsx 파일 자체를 코드로 생성·서식·수식·차트까지 다룬다',
        'imageUrl': None,
    },
    'xlwings': {
        'icon': 'sync_alt',
        'color': 'teal',
        'description': '실행 중인 Excel을 Python으로 라이브 제어 — 셀, 차트, VBA, UDF까지',
        'imageUrl': None,
    },
    'pdf': {
        'icon': 'picture_as_pdf',
        'color': 'red',
        'description': 'pypdf로 읽고 pdfplumber로 추출하고 reportlab으로 한글 PDF를 생성한다',
        'imageUrl': None,
    },
    'email': {
        'icon': 'mail',
        'color': 'sky',
        'description': '표준 라이브러리로 메일 발송·수신·분류·알림 자동화',
        'imageUrl': None,
    },
    'word': {
        'icon': 'article',
        'color': 'blue',
        'description': 'python-docx로 보고서·계약서·회의록 자동 생성과 mail merge',
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
    'folium': {
        'icon': 'map',
        'color': 'emerald',
        'description': '지도와 위치 데이터를 Python으로 시각화',
        'imageUrl': None,
    },
    'scipy': {
        'icon': 'science',
        'color': 'cyan',
        'description': '과학 계산과 최적화',
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
    'networkx': {
        'icon': 'hub',
        'color': 'violet',
        'description': '그래프와 네트워크 분석',
        'imageUrl': None,
    },
    'regex': {
        'icon': 'text_fields',
        'color': 'lime',
        'description': '정규표현식으로 텍스트 처리',
        'imageUrl': None,
    },
    'pydantic': {
        'icon': 'verified',
        'color': 'indigo',
        'description': '타입 기반 데이터 검증',
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
    'visionBasics': {
        'icon': 'grid_view',
        'color': 'orange',
        'description': '픽셀, 좌표, 색공간, 통계로 이미지 비전의 직관을 만드는 기초 트랙',
        'imageUrl': None,
    },
    'visionFeatures': {
        'icon': 'scatter_plot',
        'color': 'amber',
        'description': '특징점, 매칭, 호모그래피, 비디오, 트래킹으로 시간/공간 매칭 학습',
        'imageUrl': None,
    },
    'deepVision': {
        'icon': 'psychology',
        'color': 'violet',
        'description': 'torchvision 사전학습 모델로 분류, 탐지, 세그멘테이션, 포즈 추론',
        'imageUrl': None,
    },
    'visionApps': {
        'icon': 'apps',
        'color': 'pink',
        'description': '문서 스캐너, OCR, 모자이크, 중복 검출 등 실전 비전 응용',
        'imageUrl': None,
    },
    'practical': {
        'icon': 'rocket_launch',
        'color': 'fuchsia',
        'description': '실전 프로젝트로 배우는 Python',
        'imageUrl': None,
    },
    'playwright': {
        'icon': 'web_asset',
        'color': 'emerald',
        'description': '브라우저 화면 점검과 웹 자동화',
        'imageUrl': None,
    },
    'fileOps': {
        'icon': 'folder_zip',
        'color': 'amber',
        'description': '파일·폴더·아카이브 작업을 로컬 Python으로 자동화한다',
        'imageUrl': None,
    },
    'procCtl': {
        'icon': 'terminal',
        'color': 'slate',
        'description': '외부 명령과 프로세스를 안전하게 실행하고 감시한다',
        'imageUrl': None,
    },
    'watchSched': {
        'icon': 'schedule',
        'color': 'cyan',
        'description': '폴더 이벤트 감시와 시간 기반 자동 실행을 배운다',
        'imageUrl': None,
    },
    'inputCtl': {
        'icon': 'mouse',
        'color': 'rose',
        'description': '키보드·마우스·화면 입력으로 GUI 작업을 자동화한다',
        'imageUrl': None,
    },
    'llmBasics': {
        'icon': 'auto_awesome',
        'color': 'violet',
        'description': 'Claude API로 대화·도구·캐싱·구조화 출력을 실무 자동화에 붙인다',
        'imageUrl': None,
    },
}

categoryGroups = {
    '전체': None,
    'Python 기초': ['30days', 'advancedPython', 'builtins'],
    '데이터 분석': ['pandas', 'numpy', 'polars', 'duckdb', 'pydantic'],
    '시각화': ['matplotlib', 'seaborn', 'plotly', 'altair', 'folium'],
    '수학·통계·ML': ['sympy', 'scipy', 'statsmodels', 'sklearn', 'networkx'],
    '자동화': ['playwright', 'excel', 'openpyxl', 'xlwings', 'pdf', 'email', 'word', 'regex', 'practical', 'fileOps', 'procCtl', 'watchSched', 'inputCtl'],
    '이미지·비전': ['visionBasics', 'pillow', 'opencv', 'visionFeatures', 'deepVision', 'visionApps'],
    'AI 통합': ['llmBasics'],
}

categoryTree = [
    {
        'id': 'python-basics',
        'name': 'Python 기초',
        'description': '언어 기본기와 표준 라이브러리로 로컬 Python 감각을 만든다.',
        'folder': 'basics',
        'categories': ['30days', 'advancedPython', 'builtins'],
    },
    {
        'id': 'data-analysis',
        'name': '데이터 분석',
        'description': '표 데이터, SQL, 데이터 계약을 다루는 분석 경로다.',
        'folder': 'dataAnalysis',
        'categories': ['pandas', 'numpy', 'polars', 'duckdb', 'pydantic'],
    },
    {
        'id': 'visualization',
        'name': '시각화',
        'description': '정적·통계·인터랙티브·지도 시각화를 구분한다.',
        'folder': 'visualization',
        'categories': ['matplotlib', 'seaborn', 'plotly', 'altair', 'folium'],
    },
    {
        'id': 'math-stat-ml',
        'name': '수학·통계·ML',
        'description': '수학 계산, 통계 모델, 머신러닝과 그래프 분석 경로다.',
        'folder': 'mathStatsMl',
        'categories': ['sympy', 'scipy', 'statsmodels', 'sklearn', 'networkx'],
    },
    {
        'id': 'automation',
        'name': '자동화',
        'description': '반복 작업을 로컬 실행, 브라우저, 업무 도구 단위로 나눈다.',
        'folder': 'automation',
        'children': [
            {
                'id': 'browser-automation',
                'name': '브라우저 자동화',
                'description': '화면 점검, 폼 입력, 증거 저장, E2E 흐름을 다룬다.',
                'folder': 'browser',
                'categories': ['playwright'],
            },
            {
                'id': 'office-automation',
                'name': '업무 자동화',
                'description': '워크북, 작은 도구, 반복 업무를 실행 가능한 Python으로 만든다.',
                'folder': 'office',
                'categories': ['excel', 'openpyxl', 'xlwings', 'pdf', 'email', 'word', 'practical'],
            },
            {
                'id': 'text-automation',
                'name': '텍스트 자동화',
                'description': '비정형 문자열 추출과 변환을 자동화한다.',
                'folder': 'text',
                'categories': ['regex'],
            },
            {
                'id': 'os-automation',
                'name': 'OS 자동화',
                'description': '파일, 프로세스, 이벤트, 입력을 로컬 Python으로 다룬다.',
                'folder': 'os',
                'categories': ['fileOps', 'procCtl', 'watchSched', 'inputCtl'],
            },
            {
                'id': 'test-automation',
                'name': '테스트 자동화',
                'description': '단위, 통합, E2E, 회귀 테스트 트랙을 위한 자리다.',
                'folder': 'test',
                'categories': [],
            },
        ],
    },
    {
        'id': 'image-vision',
        'name': '이미지·비전',
        'description': '픽셀 기초부터 사전학습 딥러닝 모델, 실전 응용까지 이미지 비전 전 영역을 다룬다.',
        'folder': 'imageVision',
        'categories': ['visionBasics', 'pillow', 'opencv', 'visionFeatures', 'deepVision', 'visionApps'],
    },
    {
        'id': 'ai-integration',
        'name': 'AI 통합',
        'description': 'Claude API로 대화·도구·캐싱·구조화 출력을 실무 자동화 흐름에 붙인다.',
        'folder': 'aiIntegration',
        'categories': ['llmBasics'],
    },
]


def _buildCategoryFolderMap(nodes, prefix=''):
    mapping = {}
    for node in nodes:
        nodeFolder = node.get('folder') or node.get('id') or ''
        currentPrefix = f"{prefix}/{nodeFolder}" if prefix else nodeFolder
        for category in node.get('categories', []) or []:
            mapping[category] = f"{currentPrefix}/{category}" if currentPrefix else category
        children = node.get('children')
        if isinstance(children, list):
            mapping.update(_buildCategoryFolderMap(children, currentPrefix))
    return mapping


categoryFolderMap = _buildCategoryFolderMap(categoryTree)


def categoryDirRelative(category: str) -> str:
    return categoryFolderMap.get(category, category)


def getCategoryDir(category: str) -> Path:
    return contentDir / categoryDirRelative(category)

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
        'categories': ['advancedPython', 'builtins', 'pandas', 'numpy'],
        'description': '기초를 마쳤다면',
    },
    '실무': {
        'icon': 'construction',
        'color': 'orange',
        'categories': ['duckdb', 'pydantic', 'excel', 'openpyxl', 'xlwings', 'pdf', 'email', 'word', 'regex', 'practical', 'playwright', 'fileOps', 'procCtl', 'watchSched', 'inputCtl', 'llmBasics'],
        'description': '로컬 자동화와 데이터 작업으로 확장',
    },
    '고급': {
        'icon': 'rocket_launch',
        'color': 'purple',
        'categories': ['scipy', 'statsmodels', 'sklearn', 'networkx'],
        'description': '모델링과 분석을 깊게 다룬다면',
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
    categoryDir = getCategoryDir(category)
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
    categoryDir = getCategoryDir(category)
    if category == 'practical':
        subDirPath = categoryDir / contentId / "study.yaml"
        if subDirPath.exists():
            return subDirPath
    return categoryDir / f"{contentId}.yaml"

def getAllCategories() -> list:
    return [category for category in categoryFolderMap if getCategoryDir(category).exists()]

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
