var e=`# Curriculum OS 분류 체계 (controlled vocabulary)\r
#\r
# - outcomes: 학생이 한 레슨을 마치고 얻는 능력 단위 (atomic capability).\r
#   ID 규칙: <도메인 prefix>.<능력명>, lowerCamelCase.\r
# - domains: 사용자가 실제로 달성하고자 하는 실무 목표.\r
#   targetOutcomes: 그 목표를 충족하기 위해 필요한 outcome 집합.\r
# - lessonOutcomes: <category>/<contentId> -> { outcomes, prerequisites, estimatedMinutes, practicalDomain }\r
#   레슨 YAML의 meta.outcomes/meta.prerequisites가 있으면 그쪽이 우선이고, 여기는 backfill 용도다.\r
#\r
# 새 레슨을 만들 때:\r
# 1) outcomes/domains에 없는 능력/목표가 필요하면 여기에 먼저 등록.\r
# 2) 레슨 meta에 outcomes/prerequisites/estimatedMinutes 등록(권장) 또는 lessonOutcomes에 등록.\r
# 3) tests/curriculum/testCurriculumOs.py가 그래프 무결성을 검증한다.\r
\r
outcomes:\r
  # === Python 기초 ===\r
  - id: python.intro\r
    label: Python 첫걸음\r
    description: Python 실행, print, 주석, REPL 감각\r
  - id: python.variables\r
    label: 변수와 데이터 타입\r
    description: 변수 선언, int/float/str/bool, 형변환\r
  - id: python.operators\r
    label: 연산자\r
    description: 산술, 비교, 논리, 대입 연산자 사용\r
  - id: python.strings\r
    label: 문자열 다루기\r
    description: 인덱싱, 슬라이싱, 메서드, f-string\r
  - id: python.lists\r
    label: 리스트와 튜플\r
    description: 시퀀스 자료형 생성, 인덱싱, 메서드\r
  - id: python.dictsAndSets\r
    label: 딕셔너리와 집합\r
    description: 키-값 매핑과 집합 연산\r
  - id: python.controlFlow\r
    label: 조건문과 반복문\r
    description: if/elif/else, for, while, break/continue\r
  - id: python.functions\r
    label: 함수\r
    description: def, 인자, 반환, 스코프\r
  - id: python.modulesAndIo\r
    label: 모듈과 파일 입출력\r
    description: import, open, read/write\r
  - id: python.errorHandling\r
    label: 예외 처리\r
    description: try/except/else/finally, raise, 사용자 정의 예외\r
  - id: python.oop\r
    label: 객체지향 기초\r
    description: 클래스, 인스턴스, 상속, 메서드\r
  - id: python.advancedSyntax
    label: 고급 문법
    description: 컴프리헨션, 제너레이터, 데코레이터, 클로저
  - id: python.projectDelivery
    label: Python 프로젝트 완성
    description: 입력 계약, 처리, 오류 경계, 재사용 가능한 산출물을 하나의 프로젝트로 완성
  - id: python.practicalWorkflow
    label: 실전 Python 작업 흐름
    description: 문제를 입력, 처리, 검증, 산출물 단계로 나누어 실행 가능한 Python 작업으로 설계
\r
  # === 표준 라이브러리/고급 ===\r
  - id: python.functools\r
    label: functools 활용\r
    description: partial, reduce, lru_cache, wraps\r
  - id: python.itertools\r
    label: itertools 활용\r
    description: chain, combinations, groupby\r
  - id: python.dataclasses\r
    label: dataclasses\r
    description: "@dataclass, field, frozen"\r
  - id: python.typing\r
    label: 타입 힌팅\r
    description: Optional, Union, Generic, Protocol\r
  - id: python.designPatterns\r
    label: 디자인 패턴\r
    description: Strategy, Factory, Singleton 등\r
\r
  # === 표준 라이브러리 ===\r
  - id: builtins.numericMath\r
    label: math와 random\r
    description: 수학 함수, 난수 생성, 통계 보조\r
  - id: builtins.datetime\r
    label: 날짜와 시간\r
    description: datetime, time, timedelta로 시간 계산\r
  - id: builtins.collections\r
    label: collections·itertools\r
    description: defaultdict, Counter, deque, chain, groupby\r
  - id: builtins.fileSystem\r
    label: 파일 시스템\r
    description: os, pathlib, glob, shutil로 경로/파일 다루기\r
  - id: builtins.dataFormats\r
    label: 데이터 직렬화\r
    description: json, csv, pickle, struct로 데이터 입출력\r
  - id: builtins.textProcessing\r
    label: 텍스트 처리 보조\r
    description: string, textwrap, difflib, base64\r
  - id: builtins.cli\r
    label: 명령행 도구\r
    description: argparse, sys.argv, 환경 통합\r
  - id: builtins.async\r
    label: asyncio 기초\r
    description: async/await, 이벤트 루프\r
  - id: builtins.logging\r
    label: 로깅과 디버깅\r
    description: logging, pprint, inspect, timeit\r
  - id: builtins.testing\r
    label: 표준 테스트 라이브러리\r
    description: unittest, 표준 테스트 패턴\r
  - id: builtins.subprocess\r
    label: 외부 명령 실행\r
    description: subprocess로 외부 도구 호출\r
  - id: builtins.contextManagers\r
    label: 컨텍스트 매니저\r
    description: contextlib, with 문 활용\r
  - id: builtins.networking
    label: 표준 네트워크
    description: urllib, email
  - id: builtins.tempFiles
    label: 임시 파일과 격리
    description: tempfile로 임시 자원을 생성하고 수명 주기 안에서 정리
  - id: builtins.hashing
    label: 해시와 무결성
    description: hashlib, hmac, secrets로 데이터 무결성과 안전한 토큰 처리
  - id: builtins.archives
    label: 아카이브 처리
    description: zipfile과 tarfile로 압축 파일을 생성, 검사, 안전하게 추출
\r
  # === 수치/심볼릭 ===\r
  - id: numpy.intro\r
    label: NumPy 소개\r
    description: ndarray 개념, 기본 생성/속성\r
  - id: numpy.arrayOps\r
    label: NumPy 배열 연산\r
    description: 인덱싱, 슬라이싱, 브로드캐스팅\r
  - id: numpy.statistics\r
    label: NumPy 통계\r
    description: mean, std, percentile, axis 집계\r
  - id: numpy.linearAlgebra\r
    label: NumPy 선형대수\r
    description: dot, solve, eig, 행렬 분해\r
\r
  - id: sympy.symbolic\r
    label: 기호 수식\r
    description: Symbol, 식 단순화, substitution\r
  - id: sympy.equations\r
    label: 방정식 풀이\r
    description: solve, equation systems\r
  - id: sympy.calculus\r
    label: 미적분\r
    description: 미분, 적분, 극한, 급수\r
  - id: sympy.matrices\r
    label: 기호 행렬\r
    description: Matrix, 행렬 연산, 고유값\r
\r
  # === 데이터 엔진 ===\r
  - id: duckdb.intro\r
    label: DuckDB 소개\r
    description: 임베디드 OLAP 엔진, Python 통합\r
  - id: duckdb.basicQueries\r
    label: SQL 기본\r
    description: SELECT, WHERE, JOIN\r
  - id: duckdb.aggregation\r
    label: 집계 분석\r
    description: GROUP BY, HAVING, 집계 함수\r
  - id: duckdb.window\r
    label: 윈도우 함수\r
    description: OVER, PARTITION BY, CTE, 서브쿼리\r
\r
  - id: polars.intro\r
    label: Polars 소개\r
    description: 컬럼 기반 DataFrame, lazy/eager\r
  - id: polars.transform\r
    label: Polars 변환\r
    description: select, filter, with_columns\r
  - id: polars.aggregate\r
    label: Polars 집계\r
    description: group_by, agg, 윈도우\r
  - id: polars.bigData\r
    label: Polars 대용량\r
    description: lazy, streaming, 메모리 효율\r
\r
  - id: pydantic.intro\r
    label: Pydantic 소개\r
    description: BaseModel, 타입 안전 데이터\r
  - id: pydantic.validation\r
    label: Pydantic 검증\r
    description: 필드 검증기, 사용자 정의 validator\r
  - id: pydantic.schemas\r
    label: Pydantic 스키마\r
    description: 중첩 모델, JSON Schema, 커스텀 타입\r
  - id: pydantic.integration\r
    label: Pydantic 통합\r
    description: 설정 관리, FastAPI, 파이프라인\r
\r
  # === 데이터 분석 ===\r
  - id: pandas.intro\r
    label: pandas 소개\r
    description: Series, DataFrame 개념\r
  - id: pandas.loadFrame\r
    label: 데이터프레임 로딩\r
    description: read_csv, read_excel, 기본 탐색\r
  - id: pandas.readContract\r
    label: 읽기 계약과 타입\r
    description: dtype 지정으로 식별자 선행 0 보존, 타입 손상 방지\r
  - id: pandas.filterSelect\r
    label: 필터링과 선택\r
    description: loc, iloc, 불리언 마스킹\r
  - id: pandas.aggregate\r
    label: 집계와 그룹화\r
    description: groupby, agg, pivot\r
  - id: pandas.merge\r
    label: 데이터 결합\r
    description: merge, join, concat\r
  - id: pandas.timeSeries\r
    label: 시계열 분석\r
    description: datetime, resample, rolling\r
  - id: pandas.report\r
    label: 분석 보고서 작성\r
    description: 분석 결과를 표/그래프/요약으로 정리\r
\r
  # === 시각화 ===\r
  - id: matplotlib.basics\r
    label: matplotlib 기본 차트\r
    description: pyplot, figure, axes, 기본 차트 종류\r
  - id: matplotlib.advanced\r
    label: matplotlib 고급 차트\r
    description: 다중 축, 주석, 대시보드 패널\r
  - id: viz.statistical\r
    label: 통계 시각화\r
    description: 분포, 박스플롯, 회귀선\r
  - id: viz.distribution\r
    label: 분포 시각화\r
    description: 히스토그램, KDE, violin, boxen\r
  - id: viz.regression\r
    label: 회귀/관계 시각화\r
    description: regplot, residual, lmplot\r
  - id: viz.heatmap
    label: 히트맵·상관관계
    description: heatmap, clustermap, 매트릭스
  - id: viz.edaReport
    label: EDA 증거 리포트
    description: 분석 분모, 제외 행, 그룹, 축 범위와 저장된 시각 증거를 함께 구성
  - id: viz.interactive\r
    label: 인터랙티브 시각화\r
    description: 줌, 호버, 인터랙티브 대시보드 요소\r
  - id: viz.interactiveAdvanced\r
    label: 인터랙티브 대시보드\r
    description: 멀티뷰 연결, 동적 필터, dashboard 합성\r
  - id: viz.declarative\r
    label: 선언적 시각화 (Vega)\r
    description: Altair 인코딩, 차트 합성\r
  - id: viz.geoMaps\r
    label: 지도 시각화\r
    description: 마커, 폴리곤, choropleth, heatmap, 클러스터\r
\r
  # === 과학·통계·ML ===\r
  - id: scipy.intro\r
    label: SciPy 소개\r
    description: scipy 패키지 구조와 진입점\r
  - id: scipy.statistics\r
    label: 확률·검정\r
    description: 분포, AB 테스트, 정규성 검정\r
  - id: scipy.optimization\r
    label: 최적화·피팅\r
    description: curve_fit, minimize, 보간\r
  - id: scipy.signal\r
    label: 신호 처리\r
    description: 필터, 스펙트럼, 변환\r
  - id: scipy.integration\r
    label: 수치 적분\r
    description: quad, dblquad, 수치 계산\r
\r
  - id: stats.regression\r
    label: 회귀 분석\r
    description: OLS, 다중 회귀, 가정 진단\r
  - id: stats.timeSeries\r
    label: 시계열 모델\r
    description: ARIMA, 계절성, 예측\r
  - id: stats.diagnostics\r
    label: 모델 진단\r
    description: 잔차, 영향력, 검정\r
\r
  - id: ml.intro\r
    label: 머신러닝 입문\r
    description: train/test split, 평가 지표\r
  - id: ml.classification\r
    label: 분류\r
    description: 로지스틱, 트리, SVM, 평가 지표\r
  - id: ml.regression\r
    label: ML 회귀\r
    description: 선형, 트리 기반 회귀, 평가\r
  - id: ml.clustering\r
    label: 군집화\r
    description: K-means, 계층, 차원 축소\r
  - id: ml.pipeline\r
    label: ML 파이프라인\r
    description: Pipeline, GridSearch, cross_val\r
\r
  - id: graph.intro\r
    label: 그래프 분석 소개\r
    description: NetworkX 노드/엣지, 방향/가중치\r
  - id: graph.paths\r
    label: 경로·중심성\r
    description: 최단경로, degree/betweenness 중심성\r
  - id: graph.community\r
    label: 커뮤니티 탐지\r
    description: modularity, 클러스터링\r
  - id: graph.algorithms\r
    label: 그래프 알고리즘\r
    description: 연결성, 랜덤 모델, 고급 알고리즘\r
\r
  # === 이미지·비전 ===\r
  - id: image.pillowBasics\r
    label: Pillow 기본\r
    description: 이미지 열기, 저장, 회전, 리사이즈\r
  - id: image.filters\r
    label: 이미지 필터\r
    description: 블러, 샤픈, 흑백, 채널 분리\r
  - id: image.composition\r
    label: 이미지 합성·생성\r
    description: 도형 그리기, 워터마크, 콜라주\r
\r
  - id: vision.opencvBasics\r
    label: OpenCV 기본\r
    description: 이미지 구조, 색공간, 기하 변환\r
  - id: vision.filters\r
    label: 비전 필터\r
    description: 블러, 에지, 이진화, 모폴로지\r
  - id: vision.features\r
    label: 비전 특징\r
    description: 히스토그램, 컨투어, 키포인트\r
  - id: vision.pixelFoundations\r
    label: 픽셀 기초\r
    description: 좌표계, 채널, 슬라이싱, 룩업, 마스크, ROI\r
  - id: vision.featureMatching\r
    label: 특징점 매칭\r
    description: 코너, ORB, 매칭, 호모그래피, 스티칭\r
  - id: vision.video\r
    label: 비디오 처리\r
    description: 비디오 입출력, 배경차분, 광학흐름, 트래커\r
  - id: deepVision.classification\r
    label: 사전학습 분류\r
    description: torchvision, ResNet, 임베딩, 유사도검색, 전이학습\r
  - id: deepVision.detection\r
    label: 객체 탐지·세그멘테이션\r
    description: 객체 탐지, 세그멘테이션, 포즈 추정\r
  - id: visionApps.documents\r
    label: 문서·코드 인식\r
    description: 문서 스캐너, QR/바코드, OCR\r
  - id: visionApps.faceMedia\r
    label: 얼굴·미디어 자동화\r
    description: 얼굴 검출/모자이크/임베딩, 영상 썸네일, 화면 캡처, 사진 정리\r
\r
  # === 자동화 ===\r
  - id: automation.browser.basics\r
    label: 브라우저 자동화 기초\r
    description: Playwright로 페이지 열고 요소 클릭\r
  - id: automation.browser.formInput\r
    label: 폼 입력과 검증\r
    description: locator로 input 채우고 결과 검증\r
  - id: automation.browser.evidence
    label: 스크린샷/증거 캡처
    description: 자동화 산출물로 스크린샷, HTML 저장
  - id: automation.browser.audit
    label: 브라우저 점검 감사
    description: 시나리오, viewport, 접근성, network 증거를 release 판단으로 통합
  - id: automation.browser.session\r
    label: 로그인 세션 관리\r
    description: storage_state 저장/복원\r
  - id: automation.browser.testFlow\r
    label: pytest로 브라우저 흐름\r
    description: pytest fixture로 E2E 테스트 구성\r
\r
  - id: automation.excel.intro\r
    label: 엑셀 자동화 입문\r
    description: 워크북 열기, 셀 읽기/쓰기 기본\r
  - id: automation.excel.workbook\r
    label: 워크북 조작\r
    description: 시트, 범위, 수식 다루기\r
  - id: automation.excel.formulas\r
    label: 엑셀 수식과 이름 영역\r
    description: SUM/IF/VLOOKUP 수식 입력과 DefinedName 활용\r
  - id: automation.excel.styles\r
    label: 셀 서식과 숫자 포맷\r
    description: Font/Fill/Border/Alignment, number_format, NamedStyle 재사용\r
  - id: automation.excel.conditional\r
    label: 조건부 서식\r
    description: ColorScale, DataBar, CellIs, FormulaRule\r
  - id: automation.excel.charts\r
    label: 엑셀 차트 삽입\r
    description: BarChart/LineChart/PieChart, Reference, anchor 배치\r
  - id: automation.excel.images\r
    label: 이미지와 하이퍼링크\r
    description: add_image, cell.hyperlink, Comment\r
  - id: automation.excel.tables\r
    label: 표와 데이터 검증\r
    description: Table/TableStyleInfo, DataValidation, freeze_panes\r
  - id: automation.excel.report\r
    label: 엑셀 리포트 생성기\r
    description: 다중 시트 + 수식 + 서식 + 차트 결합 자동 보고서\r
\r
  - id: automation.pdf.intro\r
    label: PDF 자동화 입문\r
    description: pypdf, pdfplumber, reportlab의 역할 구분\r
  - id: automation.pdf.read\r
    label: PDF 읽기와 메타데이터\r
    description: PdfReader, pages, metadata, 텍스트 추출\r
  - id: automation.pdf.merge\r
    label: PDF 병합·분할\r
    description: PdfWriter로 페이지 합치고 자르기\r
  - id: automation.pdf.extract\r
    label: 표·텍스트 추출\r
    description: pdfplumber로 구조 추출\r
  - id: automation.pdf.create\r
    label: PDF 생성 기초\r
    description: reportlab Canvas, 한글 폰트 등록\r
  - id: automation.pdf.layout\r
    label: 표·이미지 레이아웃\r
    description: Platypus, SimpleDocTemplate\r
  - id: automation.pdf.security\r
    label: 워터마크·암호화\r
    description: encrypt, overlay 워터마크\r
  - id: automation.pdf.forms\r
    label: 양식 채우기\r
    description: AcroForm 필드 조작\r
  - id: automation.pdf.report\r
    label: PDF 리포트 생성기\r
    description: 데이터 → 다중 페이지 한글 보고서\r
\r
  - id: automation.email.intro\r
    label: 이메일 자동화 입문\r
    description: SMTP/IMAP, 앱 비밀번호 모델\r
  - id: automation.email.send\r
    label: 메일 발송 기초\r
    description: smtplib, EmailMessage\r
  - id: automation.email.attachments\r
    label: HTML·첨부·인라인 이미지\r
    description: MIMEMultipart, Content-ID\r
  - id: automation.email.bulk\r
    label: 다수 수신자·개인화\r
    description: 템플릿 치환, CSV 기반 발송\r
  - id: automation.email.receive\r
    label: IMAP 수신·검색\r
    description: imaplib search, fetch\r
  - id: automation.email.classify\r
    label: 규칙 기반 분류·이동\r
    description: 발신자/제목 기반 폴더 룰\r
  - id: automation.email.notify\r
    label: 스크립트 알림 봇\r
    description: 예외 발생 시 메일 알림\r
  - id: automation.email.credentials\r
    label: 안전한 자격증명\r
    description: 환경변수, dry-run\r
  - id: automation.email.report\r
    label: 주간 보고서 발송기\r
    description: 데이터 + PDF + 다수 발송 통합\r
\r
  - id: automation.word.intro\r
    label: Word 자동화 입문\r
    description: python-docx vs docxtpl 경계\r
  - id: automation.word.paragraphs\r
    label: 단락·제목·목록\r
    description: Document, add_paragraph, add_heading\r
  - id: automation.word.runs\r
    label: 텍스트 스타일링\r
    description: Run 단위 font·color·bold\r
  - id: automation.word.tables\r
    label: 표 작성·셀 병합\r
    description: add_table, merge_cells\r
  - id: automation.word.media\r
    label: 이미지·머리말·꼬리말\r
    description: add_picture, sections, header\r
  - id: automation.word.styles\r
    label: 스타일과 페이지 설정\r
    description: styles, page_margins\r
  - id: automation.word.edit\r
    label: 기존 문서 수정\r
    description: 자리표시자 치환\r
  - id: automation.word.mailMerge\r
    label: CSV 기반 mail merge\r
    description: 다수 docx 생성\r
  - id: automation.word.template\r
    label: docxtpl 템플릿 엔진\r
    description: Jinja2 기반 채우기\r
  - id: automation.word.report\r
    label: 양식 문서 자동 생성기\r
    description: 데이터 → 회의록·계약서 docx\r
\r
  - id: automation.fileOps\r
    label: 파일 자동화\r
    description: pathlib, glob, 파일 이동/복사/정리\r
  - id: automation.fileBackup\r
    label: 백업·동기화\r
    description: zip, 백업 정책, 폴더 정리\r
  - id: automation.procCtl\r
    label: 프로세스 자동화\r
    description: subprocess, 외부 명령 실행\r
  - id: automation.procMonitoring\r
    label: 시스템 자원 감시\r
    description: psutil로 프로세스/리소스 조회\r
  - id: automation.watchSched\r
    label: 감시·스케줄\r
    description: watchdog, schedule, 주기 실행\r
  - id: automation.scheduling\r
    label: 스케줄 운영\r
    description: APScheduler, cron, 영속·재시도\r
  - id: automation.resilience.idempotency\r
    label: 멱등성과 처리 원장\r
    description: 영속 처리 원장으로 재실행을 안전하게 만드는 멱등성\r
  - id: automation.resilience.checkpoint\r
    label: 재개 가능한 체크포인트\r
    description: 진행 위치를 영속해 중단 지점부터 재개하는 장기 배치\r
  - id: automation.resilience.atomicWrite\r
    label: 원자적 쓰기\r
    description: 임시 파일과 os.replace로 반쪽 파일 없이 안전하게 교체\r
  - id: automation.inputCtl\r
    label: GUI/입력 자동화\r
    description: 키보드, 마우스, OS 입력 제어\r
  - id: automation.screenInteraction\r
    label: 화면 상호작용\r
    description: 스크린샷, 클립보드, 이미지 매치\r
\r
  - id: automation.regex\r
    label: 정규표현식\r
    description: 비정형 문자열에서 패턴 추출\r
  - id: automation.textExtraction\r
    label: 텍스트 추출·변환\r
    description: 이메일/URL/날짜/HTML 정제\r
  - id: automation.llmPreprocess\r
    label: LLM 전처리\r
    description: 토큰화, 마스킹, 정제 파이프라인\r
\r
  - id: automation.webApi.intro\r
    label: requests/API 자동화 입문\r
    description: HTTP/REST/JSON 감각, status code, 안전 정책\r
  - id: automation.webApi.get\r
    label: 첫 GET 요청\r
    description: requests.get, status_code, raise_for_status, .json() 파싱\r
  - id: automation.webApi.businessStatus\r
    label: 사업자등록 상태조회 자동화\r
    description: 국세청 공식 Open API(requests.post)로 휴폐업·과세유형 분류, 세금계산서 발행 차단 리스트 산출\r
  - id: automation.webApi.businessDays\r
    label: 공휴일·영업일 계산 자동화\r
    description: 공공데이터 특일정보 Open API로 그 해 공휴일을 받아 datetime으로 영업일 판정·D+N 영업일·마감일 순연 계산\r
  - id: automation.webApi.exchangeRate\r
    label: 환율 조회·환산 자동화\r
    description: 한국수출입은행 환율 Open API의 매매기준율을 받아 decimal로 100단위 통화 보정·ROUND_HALF_UP 원화 환산\r
\r
  # === LLM API 통합 ===\r
  - id: llm.intro\r
    label: LLM API 첫 호출\r
    description: anthropic SDK 초기화, Messages API 기본 호출, 응답 파싱\r
  - id: llm.conversations\r
    label: 대화와 비용 추적\r
    description: 시스템 프롬프트, 멀티턴 히스토리, usage 토큰 추적\r
  - id: llm.streaming\r
    label: 스트리밍 응답\r
    description: 스트림 이벤트 처리, 점진적 출력, 부분 응답 누적\r
  - id: llm.structuredOutput\r
    label: 구조화 출력\r
    description: JSON 강제, 스키마 지시, 파싱 검증과 재시도\r
  - id: llm.caching\r
    label: 프롬프트 캐싱\r
    description: cache_control, 시스템 프롬프트 캐시, 비용 절감 측정\r
  - id: llm.toolUse\r
    label: 도구 사용\r
    description: 도구 정의, tool_use 루프, 결과 전달, 멀티 도구 라우팅\r
\r
  # === 개발 교양(읽기) ===\r
  - id: devLiteracy.git\r
    label: Git과 버전 관리 개념\r
    description: 버전 관리가 푸는 문제, 커밋·브랜치 모델을 그림과 비유로 이해(읽기)\r
  - id: devLiteracy.github\r
    label: GitHub 플랫폼 개념\r
    description: 원격 저장소·협업·PR 등 GitHub이 무엇이고 왜 쓰는지 이해(읽기)\r
  - id: devLiteracy.commandLine\r
    label: 명령줄·터미널 기초 개념\r
    description: 터미널이 무엇인지, 명령=프로그램+인자+플래그 구조, 현재 작업 디렉터리·경로를 그림과 세션 예시로 이해(읽기)\r
  - id: devLiteracy.gitBasics\r
    label: Git 기본 사이클 개념\r
    description: init→add→commit→log 한 사이클과 작업트리·스테이징·이력 3영역을 명령 분해와 터미널 출력 예시로 이해(읽기)\r
\r
# 사용자가 직접 고르는 실무 목표. AI도 freeText를 이 중 하나로 매핑한다.\r
domains:\r
  - id: dataReporting
    label: 데이터 분석 보고서
    description: 표 데이터를 불러와 가공·요약하고 분석 보고서로 정리한다.
    capstoneLessonRef: pandas/10_실전종합프로젝트
    targetOutcomes:\r
      - python.variables\r
      - python.controlFlow\r
      - python.functions\r
      - pandas.intro\r
      - pandas.loadFrame\r
      - pandas.filterSelect\r
      - pandas.aggregate\r
      - pandas.report\r
\r
  - id: officeAutomation
    label: 사무 자동화 (엑셀/문서)
    description: 엑셀 반복 작업을 Python으로 자동화하고 보고서를 만든다.
    capstoneLessonRef: openpyxl/10_월간매출리포트생성기
    targetOutcomes:\r
      - python.variables\r
      - python.controlFlow\r
      - python.functions\r
      - python.modulesAndIo\r
      - automation.excel.intro\r
      - automation.excel.workbook\r
      - automation.excel.formulas\r
      - automation.excel.styles\r
      - automation.excel.conditional\r
      - automation.excel.charts\r
      - automation.excel.tables\r
      - automation.excel.report\r
      - pandas.loadFrame\r
      - pandas.aggregate\r
\r
  - id: pdfAutomation\r
    label: PDF 자동화\r
    description: PDF 읽기·생성·병합·보안·리포트 자동화\r
    targetOutcomes:\r
      - python.functions\r
      - python.errorHandling\r
      - python.modulesAndIo\r
      - automation.pdf.intro\r
      - automation.pdf.read\r
      - automation.pdf.merge\r
      - automation.pdf.extract\r
      - automation.pdf.create\r
      - automation.pdf.layout\r
      - automation.pdf.security\r
      - automation.pdf.forms\r
      - automation.pdf.report\r
\r
  - id: emailAutomation\r
    label: 이메일 자동화\r
    description: SMTP/IMAP으로 메일 발송·수신·분류·알림을 자동화\r
    targetOutcomes:\r
      - python.functions\r
      - python.errorHandling\r
      - python.modulesAndIo\r
      - automation.email.intro\r
      - automation.email.send\r
      - automation.email.attachments\r
      - automation.email.bulk\r
      - automation.email.receive\r
      - automation.email.classify\r
      - automation.email.notify\r
      - automation.email.credentials\r
      - automation.email.report\r
\r
  - id: documentAutomation\r
    label: 문서 자동화 (Word)\r
    description: python-docx로 보고서·계약서·회의록을 자동 생성\r
    targetOutcomes:\r
      - python.functions\r
      - python.modulesAndIo\r
      - automation.word.intro\r
      - automation.word.paragraphs\r
      - automation.word.runs\r
      - automation.word.tables\r
      - automation.word.media\r
      - automation.word.styles\r
      - automation.word.edit\r
      - automation.word.mailMerge\r
      - automation.word.template\r
      - automation.word.report\r
\r
  - id: webMonitoring
    label: 웹 자동화·모니터링
    description: 브라우저로 사이트를 점검하고 스크린샷·결과를 저장한다.
    capstoneLessonRef: playwright/10_종합브라우저점검프로젝트
    targetOutcomes:\r
      - python.variables\r
      - python.controlFlow\r
      - python.functions\r
      - automation.browser.basics\r
      - automation.browser.formInput
      - automation.browser.evidence
      - automation.browser.audit
\r
  - id: scriptingAutomation\r
    label: OS·파일·프로세스 자동화\r
    description: 로컬 파일과 외부 프로그램을 묶어 반복 작업을 자동화한다.\r
    targetOutcomes:\r
      - python.variables\r
      - python.controlFlow\r
      - python.functions\r
      - python.modulesAndIo\r
      - python.errorHandling\r
      - automation.fileOps\r
      - automation.procCtl\r
\r
  - id: pythonFoundation
    label: Python 기초 완주
    description: 30일 커리큘럼으로 Python 기본기를 끝까지 다진다.
    capstoneLessonRef: 30days/day30_최종프로젝트
    targetOutcomes:\r
      - python.intro\r
      - python.variables\r
      - python.operators\r
      - python.strings\r
      - python.lists\r
      - python.dictsAndSets\r
      - python.controlFlow\r
      - python.functions\r
      - python.modulesAndIo\r
      - python.errorHandling\r
      - python.oop
      - python.advancedSyntax
      - python.projectDelivery
\r
  - id: timeSeriesAnalysis\r
    label: 시계열 데이터 분석\r
    description: 시간 흐름을 가진 데이터를 분석하고 시각화한다.\r
    targetOutcomes:\r
      - pandas.loadFrame\r
      - pandas.filterSelect\r
      - pandas.aggregate\r
      - pandas.timeSeries\r
      - matplotlib.basics\r
\r
  - id: dataVisualization
    label: 데이터 시각화
    description: 정적·통계·관계 그래프로 데이터 인사이트를 시각화한다.
    capstoneLessonRef: seaborn/10_종합EDA리포트
    targetOutcomes:\r
      - python.variables\r
      - python.controlFlow\r
      - pandas.loadFrame\r
      - matplotlib.basics\r
      - matplotlib.advanced\r
      - viz.statistical\r
      - viz.distribution\r
      - viz.regression
      - viz.heatmap
      - viz.edaReport
\r
  - id: interactiveDashboards\r
    label: 인터랙티브 대시보드\r
    description: 호버·필터 가능한 인터랙티브 차트와 대시보드를 만든다.\r
    targetOutcomes:\r
      - pandas.loadFrame\r
      - pandas.aggregate\r
      - viz.interactive\r
      - viz.interactiveAdvanced\r
      - viz.declarative\r
\r
  - id: geoVisualization\r
    label: 지도 시각화\r
    description: 지도에 데이터를 마커, 폴리곤, 히트맵으로 표시한다.\r
    targetOutcomes:\r
      - python.variables\r
      - pandas.loadFrame\r
      - viz.geoMaps\r
\r
  - id: statisticalAnalysis\r
    label: 통계 분석·검정\r
    description: 분포·검정·회귀로 데이터의 통계적 의미를 끌어낸다.\r
    targetOutcomes:\r
      - numpy.intro\r
      - numpy.statistics\r
      - pandas.loadFrame\r
      - scipy.intro\r
      - scipy.statistics\r
      - stats.regression\r
      - stats.diagnostics\r
\r
  - id: machineLearning\r
    label: 머신러닝 (분류·회귀·군집)\r
    description: 학습/평가 흐름으로 분류·회귀·군집 모델을 만든다.\r
    targetOutcomes:\r
      - python.functions\r
      - pandas.loadFrame\r
      - pandas.filterSelect\r
      - numpy.intro\r
      - numpy.arrayOps\r
      - ml.intro\r
      - ml.classification\r
      - ml.regression\r
      - ml.clustering\r
      - ml.pipeline\r
\r
  - id: timeSeriesForecasting\r
    label: 시계열 예측\r
    description: ARIMA·계절성으로 시계열 예측 모델을 만든다.\r
    targetOutcomes:\r
      - pandas.timeSeries\r
      - matplotlib.basics\r
      - stats.timeSeries\r
      - scipy.statistics\r
\r
  - id: graphAnalysis\r
    label: 그래프·네트워크 분석\r
    description: 노드/엣지 데이터를 그래프 알고리즘으로 분석한다.\r
    targetOutcomes:\r
      - python.functions\r
      - graph.intro\r
      - graph.paths\r
      - graph.community\r
      - graph.algorithms\r
\r
  - id: imageProcessing\r
    label: 이미지 처리\r
    description: Pillow로 이미지 편집·필터·합성한다.\r
    targetOutcomes:\r
      - python.variables\r
      - python.modulesAndIo\r
      - image.pillowBasics\r
      - image.filters\r
      - image.composition\r
\r
  - id: computerVision\r
    label: 컴퓨터 비전\r
    description: OpenCV로 이미지 분석·특징 추출한다.\r
    targetOutcomes:\r
      - python.variables\r
      - numpy.arrayOps\r
      - vision.opencvBasics\r
      - vision.filters\r
      - vision.features\r
\r
  - id: visionAdvanced\r
    label: 고급 비전 (매칭·비디오)\r
    description: 특징점 매칭, 호모그래피, 비디오 처리까지 다룬다.\r
    targetOutcomes:\r
      - vision.pixelFoundations\r
      - vision.opencvBasics\r
      - vision.features\r
      - vision.featureMatching\r
      - vision.video\r
\r
  - id: deepLearningVision\r
    label: 딥러닝 비전\r
    description: 사전학습 모델로 분류·탐지·세그멘테이션을 다룬다.\r
    targetOutcomes:\r
      - numpy.arrayOps\r
      - vision.opencvBasics\r
      - deepVision.classification\r
      - deepVision.detection\r
\r
  - id: visionAutomation\r
    label: 비전 응용 자동화\r
    description: OCR·얼굴·화면 인식을 묶어 실무 자동화에 활용한다.\r
    targetOutcomes:\r
      - vision.opencvBasics\r
      - vision.features\r
      - visionApps.documents\r
      - visionApps.faceMedia\r
\r
  - id: textProcessing\r
    label: 비정형 텍스트 처리\r
    description: 정규표현식과 텍스트 도구로 데이터를 정제한다.\r
    targetOutcomes:\r
      - python.strings\r
      - automation.regex\r
      - automation.textExtraction\r
      - automation.llmPreprocess\r
      - builtins.textProcessing\r
\r
  - id: scientificComputing\r
    label: 과학·수치 계산\r
    description: NumPy/SciPy/SymPy로 수치·기호 계산을 다룬다.\r
    targetOutcomes:\r
      - numpy.intro\r
      - numpy.arrayOps\r
      - numpy.statistics\r
      - numpy.linearAlgebra\r
      - sympy.symbolic\r
      - sympy.equations\r
      - sympy.calculus\r
\r
  - id: sqlAnalysis\r
    label: SQL 기반 데이터 분석\r
    description: DuckDB로 SQL을 활용해 표 데이터를 분석한다.\r
    targetOutcomes:\r
      - python.variables\r
      - duckdb.intro\r
      - duckdb.basicQueries\r
      - duckdb.aggregation\r
      - duckdb.window\r
\r
  - id: bigDataPipelines\r
    label: 대용량 데이터 처리\r
    description: Polars로 메모리 효율적인 데이터 파이프라인을 만든다.\r
    targetOutcomes:\r
      - pandas.intro\r
      - polars.intro\r
      - polars.transform\r
      - polars.aggregate\r
      - polars.bigData\r
\r
  - id: dataContracts\r
    label: 데이터 계약·검증\r
    description: Pydantic으로 타입 안전한 데이터 모델을 정의한다.\r
    targetOutcomes:\r
      - python.oop\r
      - python.typing\r
      - pydantic.intro\r
      - pydantic.validation\r
      - pydantic.schemas\r
      - pydantic.integration\r
\r
  - id: desktopAutomation\r
    label: 데스크톱·GUI 자동화\r
    description: 키보드/마우스/화면 자동화로 반복 GUI 작업을 처리한다.\r
    targetOutcomes:\r
      - python.functions\r
      - python.errorHandling\r
      - automation.inputCtl\r
      - automation.screenInteraction\r
\r
  - id: fileAutomation
    label: 파일·폴더 자동화
    description: 파일 시스템과 감시·스케줄로 폴더 작업을 자동화한다.
    capstoneLessonRef: fileOps/10_종합다운로드폴더정리
    targetOutcomes:\r
      - python.modulesAndIo\r
      - builtins.fileSystem
      - builtins.tempFiles
      - builtins.archives
      - automation.fileOps\r
      - automation.fileBackup\r
      - automation.watchSched\r
      - automation.scheduling\r
\r
  - id: systemMonitoring\r
    label: 시스템 감시·운영\r
    description: 프로세스·리소스를 감시하고 운영 자동화를 만든다.\r
    targetOutcomes:\r
      - python.errorHandling\r
      - automation.procCtl\r
      - automation.procMonitoring\r
      - automation.watchSched\r
      - builtins.logging\r
\r
  - id: standardLibraryMastery\r
    label: 표준 라이브러리 마스터\r
    description: 외부 의존 없이 표준 라이브러리로 실무 도구를 만든다.\r
    targetOutcomes:\r
      - python.functions\r
      - python.modulesAndIo\r
      - builtins.datetime\r
      - builtins.collections\r
      - builtins.fileSystem\r
      - builtins.dataFormats\r
      - builtins.cli\r
      - builtins.logging\r
      - builtins.subprocess
      - builtins.tempFiles
      - builtins.hashing
      - builtins.archives
\r
  - id: aiIntegration\r
    label: AI/LLM 통합\r
    description: Claude API로 대화·도구·캐싱·구조화 출력을 묶어 자동화 흐름에 LLM을 붙인다.\r
    targetOutcomes:\r
      - python.functions\r
      - python.errorHandling\r
      - python.modulesAndIo\r
      - llm.intro\r
      - llm.conversations\r
      - llm.streaming\r
      - llm.structuredOutput\r
      - llm.caching\r
      - llm.toolUse\r
\r
# 기존 레슨 backfill. 레슨 YAML meta.outcomes/prerequisites가 있으면 그쪽이 우선.\r
lessonOutcomes:\r
  # 30days 기본기 트랙\r
  "30days/day01_헬로월드":\r
    outcomes: [python.intro]\r
    prerequisites: []\r
    estimatedMinutes: 25\r
  "30days/day02_변수와데이터타입":\r
    outcomes: [python.variables]\r
    prerequisites: [python.intro]\r
    estimatedMinutes: 40\r
  "30days/day03_연산자":\r
    outcomes: [python.operators]\r
    prerequisites: [python.variables]\r
    estimatedMinutes: 35\r
  "30days/day04_문자열기초":\r
    outcomes: [python.strings]\r
    prerequisites: [python.variables]\r
    estimatedMinutes: 35\r
  "30days/day05_문자열인덱싱슬라이싱":\r
    outcomes: [python.strings]\r
    prerequisites: [python.strings]\r
    estimatedMinutes: 35\r
  "30days/day06_문자열메서드":\r
    outcomes: [python.strings]\r
    prerequisites: [python.strings]\r
    estimatedMinutes: 40\r
  "30days/day07_리스트기초":\r
    outcomes: [python.lists]\r
    prerequisites: [python.variables]\r
    estimatedMinutes: 40\r
  "30days/day08_리스트메서드":\r
    outcomes: [python.lists]\r
    prerequisites: [python.lists]\r
    estimatedMinutes: 35\r
  "30days/day09_튜플":\r
    outcomes: [python.lists]\r
    prerequisites: [python.lists]\r
    estimatedMinutes: 25\r
  "30days/day10_집합":\r
    outcomes: [python.dictsAndSets]\r
    prerequisites: [python.lists]\r
    estimatedMinutes: 30\r
  "30days/day11_딕셔너리기초":\r
    outcomes: [python.dictsAndSets]\r
    prerequisites: [python.lists]\r
    estimatedMinutes: 35\r
  "30days/day12_딕셔너리메서드":\r
    outcomes: [python.dictsAndSets]\r
    prerequisites: [python.dictsAndSets]\r
    estimatedMinutes: 35\r
  "30days/day13_조건문":\r
    outcomes: [python.controlFlow]\r
    prerequisites: [python.operators]\r
    estimatedMinutes: 40\r
  "30days/day14_반복문":\r
    outcomes: [python.controlFlow]\r
    prerequisites: [python.controlFlow, python.lists]\r
    estimatedMinutes: 45\r
  "30days/day15_함수기초":\r
    outcomes: [python.functions]\r
    prerequisites: [python.controlFlow]\r
    estimatedMinutes: 45\r
  "30days/day16_함수고급":\r
    outcomes: [python.functions]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 40\r
  "30days/day17_스코프와클로저":\r
    outcomes: [python.functions]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 40\r
  "30days/day18_모듈과import":\r
    outcomes: [python.modulesAndIo]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 35\r
  "30days/day19_파일입출력":\r
    outcomes: [python.modulesAndIo]\r
    prerequisites: [python.modulesAndIo, python.strings]\r
    estimatedMinutes: 45\r
  "30days/day20_예외처리":\r
    outcomes: [python.errorHandling]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 40\r
  "30days/day21_중간종합복습":
    outcomes: [python.controlFlow, python.functions, python.modulesAndIo, python.errorHandling]
    prerequisites:\r
      - python.controlFlow\r
      - python.functions\r
      - python.modulesAndIo\r
      - python.errorHandling\r
    estimatedMinutes: 60\r
  "30days/day22_클래스기초":\r
    outcomes: [python.oop]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 45\r
  "30days/day23_클래스고급":\r
    outcomes: [python.oop]\r
    prerequisites: [python.oop]\r
    estimatedMinutes: 45\r
  "30days/day24_특수메서드":\r
    outcomes: [python.oop]\r
    prerequisites: [python.oop]\r
    estimatedMinutes: 40\r
  "30days/day25_프로퍼티와데코레이터":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.oop]\r
    estimatedMinutes: 45\r
  "30days/day26_컴프리헨션":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.lists, python.controlFlow]\r
    estimatedMinutes: 35\r
  "30days/day27_제너레이터와이터레이터":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 45\r
  "30days/day28_고급문법종합":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 50\r
  "30days/day29_알고리즘연습":
    outcomes: [python.advancedSyntax]
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 60\r
  "30days/day30_최종프로젝트":
    outcomes: [python.projectDelivery]
    prerequisites: [python.advancedSyntax, python.oop, python.errorHandling]\r
    estimatedMinutes: 90\r
    lessonRole: project\r
\r
  # advancedPython 트랙 (선택적 보강)\r
  "advancedPython/01_람다와고차함수":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 35\r
  "advancedPython/02_함수데코레이터심화":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 45\r
  "advancedPython/04_functools완벽가이드":\r
    outcomes: [python.functools]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 40\r
  "advancedPython/05_itertools마스터":\r
    outcomes: [python.itertools]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 40\r
  "advancedPython/11_타입힌팅심화":\r
    outcomes: [python.typing]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 40\r
  "advancedPython/12_dataclasses마스터":\r
    outcomes: [python.dataclasses]\r
    prerequisites: [python.oop, python.typing]\r
    estimatedMinutes: 35\r
  "advancedPython/21_디자인패턴1":\r
    outcomes: [python.designPatterns]\r
    prerequisites: [python.oop]\r
    estimatedMinutes: 50\r
  "advancedPython/22_디자인패턴2":\r
    outcomes: [python.designPatterns]\r
    prerequisites: [python.designPatterns]\r
    estimatedMinutes: 50\r
\r
  # pandas 트랙\r
  "pandas/00_판다스소개":\r
    outcomes: [pandas.intro]\r
    prerequisites: [python.lists, python.functions]\r
    estimatedMinutes: 30\r
  "pandas/01_레스토랑팁분석":\r
    outcomes: [pandas.loadFrame, pandas.filterSelect]\r
    prerequisites: [pandas.intro]\r
    estimatedMinutes: 50\r
    sectionOutcomes:\r
      step1_import: [pandas.loadFrame]\r
      step2_load: [pandas.loadFrame]\r
      step3_preview: [pandas.loadFrame]\r
      step4_shape: [pandas.loadFrame]\r
      step5_head: [pandas.loadFrame]\r
      step6_columns: [pandas.loadFrame]\r
      step7_select: [pandas.filterSelect]\r
      step8_mean: [pandas.filterSelect]\r
      step9_maxmin: [pandas.filterSelect]\r
      step10_describe: [pandas.filterSelect]\r
      workflow_validation: [pandas.loadFrame, pandas.filterSelect]\r
  "pandas/02_타이타닉생존분석":\r
    outcomes: [pandas.filterSelect, pandas.aggregate]\r
    prerequisites: [pandas.loadFrame]\r
    estimatedMinutes: 60\r
    sectionOutcomes:\r
      step1_load: [pandas.filterSelect]\r
      step2_head: [pandas.filterSelect]\r
      step3_single: [pandas.filterSelect]\r
      step4_multi: [pandas.filterSelect]\r
      step5_condition: [pandas.filterSelect]\r
      step6_filter: [pandas.filterSelect]\r
      step7_firstclass: [pandas.filterSelect]\r
      step8_value_counts: [pandas.aggregate]\r
      step8_5_describe: [pandas.aggregate]\r
      step9_normalize: [pandas.aggregate]\r
      step10_survival_rate: [pandas.aggregate]\r
      step11_female: [pandas.aggregate]\r
      step12_loc: [pandas.filterSelect]\r
      step13_iloc: [pandas.filterSelect]\r
      step14_iloc_range: [pandas.filterSelect]\r
      workflow_validation: [pandas.filterSelect, pandas.aggregate]\r
  "pandas/03_펭귄종비교분석":\r
    outcomes: [pandas.aggregate]\r
    prerequisites: [pandas.filterSelect]\r
    estimatedMinutes: 50\r
  "pandas/05_자동차연비분석":\r
    outcomes: [pandas.aggregate, pandas.report]\r
    prerequisites: [pandas.aggregate]\r
    estimatedMinutes: 60\r
    sectionOutcomes:\r
      step1_load: [pandas.aggregate]\r
      step2_head: [pandas.aggregate]\r
      step3_value_counts: [pandas.aggregate]\r
      step4_sort_asc: [pandas.aggregate]\r
      step5_sort_desc: [pandas.aggregate]\r
      step6_nlargest: [pandas.aggregate]\r
      step7_nsmallest: [pandas.aggregate]\r
      step7_5_assign_grade: [pandas.aggregate]\r
      step8_groupby_year: [pandas.aggregate]\r
      step9_groupby_origin: [pandas.aggregate]\r
      step10_pivot: [pandas.aggregate]\r
      step11_pivot_year: [pandas.aggregate]\r
      step12_filter_groupby: [pandas.aggregate]\r
      step13_complex: [pandas.aggregate]\r
      workflow_validation: [pandas.report]\r
  "pandas/06_항공편시계열분석":\r
    outcomes: [pandas.timeSeries]\r
    prerequisites: [pandas.loadFrame, pandas.aggregate]\r
    estimatedMinutes: 65\r
  "pandas/09_두데이터합치기":\r
    outcomes: [pandas.merge]\r
    prerequisites: [pandas.loadFrame]\r
    estimatedMinutes: 45\r
  "pandas/10_실전종합프로젝트":\r
    outcomes: [pandas.report]\r
    prerequisites: [pandas.aggregate, pandas.merge]\r
    estimatedMinutes: 90\r
    lessonRole: project\r
  "pandas/11_읽기계약과타입손상":\r
    outcomes: [pandas.readContract]\r
    prerequisites: [pandas.loadFrame]\r
    estimatedMinutes: 40\r
\r
  # playwright 트랙\r
  "playwright/00_playwright소개":\r
    outcomes: [automation.browser.basics]\r
    prerequisites: [python.functions, python.modulesAndIo]\r
    estimatedMinutes: 35\r
  "playwright/01_첫브라우저실행":\r
    outcomes: [automation.browser.basics]\r
    prerequisites: [automation.browser.basics]\r
    estimatedMinutes: 40\r
  "playwright/02_locator와폼입력":\r
    outcomes: [automation.browser.formInput]\r
    prerequisites: [automation.browser.basics]\r
    estimatedMinutes: 45\r
  "playwright/03_기다림과검증":\r
    outcomes: [automation.browser.formInput]\r
    prerequisites: [automation.browser.formInput]\r
    estimatedMinutes: 45\r
  "playwright/04_스크린샷과증거":\r
    outcomes: [automation.browser.evidence]\r
    prerequisites: [automation.browser.basics]\r
    estimatedMinutes: 40\r
  "playwright/06_로그인상태와스토리지":\r
    outcomes: [automation.browser.session]\r
    prerequisites: [automation.browser.formInput]\r
    estimatedMinutes: 45\r
  "playwright/08_pytest흐름":\r
    outcomes: [automation.browser.testFlow]\r
    prerequisites: [automation.browser.formInput, automation.browser.evidence]\r
    estimatedMinutes: 55\r
\r
  # excel 트랙\r
  "excel/01_xlwings란":\r
    outcomes: [automation.excel.intro]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 30\r
  "excel/02_xlwings설치":\r
    outcomes: [automation.excel.intro]\r
    prerequisites: [automation.excel.intro]\r
    estimatedMinutes: 25\r
  "excel/03_xlwingsLite":\r
    outcomes: [automation.excel.workbook]\r
    prerequisites: [automation.excel.intro]\r
    estimatedMinutes: 45\r
\r
  # xlwings 트랙 (라이브 Excel 제어, Excel 본체 필요)\r
  "xlwings/00_xlwings소개":
    outcomes: [automation.excel.intro]
    prerequisites: [python.functions, python.modulesAndIo]
    estimatedMinutes: 25
  "xlwings/01_첫엑셀연결":
    outcomes: [automation.excel.intro, automation.excel.workbook]
    prerequisites: [automation.excel.intro]
    estimatedMinutes: 40
    sectionOutcomes:
      lesson-contract: [automation.excel.intro]
      open-and-write: [automation.excel.workbook]
      save-and-reopen: [automation.excel.workbook]
  "xlwings/02_가격표일괄입력":
    outcomes: [automation.excel.workbook]
    prerequisites: [automation.excel.workbook]
    estimatedMinutes: 45
  "xlwings/03_시트탐색과확장":
    outcomes: [automation.excel.workbook]
    prerequisites: [automation.excel.workbook]
    estimatedMinutes: 50
  "xlwings/04_DataFrame왕복":
    outcomes: [automation.excel.workbook]
    prerequisites: [automation.excel.workbook, pandas.loadFrame]
    estimatedMinutes: 55
  "xlwings/05_수식과서식":
    outcomes: [automation.excel.formulas, automation.excel.styles]
    prerequisites: [automation.excel.workbook]
    estimatedMinutes: 55
    sectionOutcomes:
      formula-write: [automation.excel.formulas]
      number-format: [automation.excel.styles]
      color-and-autofit: [automation.excel.styles]
  "xlwings/06_막대차트자동생성":
    outcomes: [automation.excel.charts]
    prerequisites: [automation.excel.workbook]
    estimatedMinutes: 55
  "xlwings/07_표와동적합계":
    outcomes: [automation.excel.tables]
    prerequisites: [automation.excel.workbook, automation.excel.formulas]
    estimatedMinutes: 60
  "xlwings/08_월별파일분기합치기":
    outcomes: [automation.excel.report]
    prerequisites: [automation.excel.workbook, automation.excel.tables]
    estimatedMinutes: 70
  "xlwings/09_VBA매크로호출":
    outcomes: [automation.excel.workbook]
    prerequisites: [automation.excel.workbook]
    estimatedMinutes: 55
  "xlwings/10_UDF가격계산기":\r
    outcomes: [automation.excel.workbook]\r
    prerequisites: [automation.excel.workbook]\r
    estimatedMinutes: 90\r
    lessonRole: project\r
\r
  # builtins 트랙\r
  "builtins/01_math":\r
    outcomes: [builtins.numericMath]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 30\r
  "builtins/02_random":\r
    outcomes: [builtins.numericMath]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 30\r
  "builtins/03_datetime":\r
    outcomes: [builtins.datetime]\r
    prerequisites: [python.oop]\r
    estimatedMinutes: 40\r
  "builtins/04_time":\r
    outcomes: [builtins.datetime]\r
    prerequisites: [builtins.datetime]\r
    estimatedMinutes: 30\r
  "builtins/05_collections":\r
    outcomes: [builtins.collections]\r
    prerequisites: [python.dictsAndSets]\r
    estimatedMinutes: 40\r
  "builtins/06_itertools":\r
    outcomes: [builtins.collections]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 40\r
  "builtins/07_functools":\r
    outcomes: [python.functools]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 35\r
  "builtins/08_os":\r
    outcomes: [builtins.fileSystem]\r
    prerequisites: [python.modulesAndIo]\r
    estimatedMinutes: 35\r
  "builtins/09_pathlib":\r
    outcomes: [builtins.fileSystem]\r
    prerequisites: [python.modulesAndIo]\r
    estimatedMinutes: 40\r
  "builtins/10_sys":\r
    outcomes: [builtins.cli]\r
    prerequisites: [python.modulesAndIo]\r
    estimatedMinutes: 30\r
  "builtins/11_glob":\r
    outcomes: [builtins.fileSystem]\r
    prerequisites: [builtins.fileSystem]\r
    estimatedMinutes: 30\r
  "builtins/12_shutil":\r
    outcomes: [builtins.fileSystem]\r
    prerequisites: [builtins.fileSystem]\r
    estimatedMinutes: 35\r
  "builtins/13_json":\r
    outcomes: [builtins.dataFormats]\r
    prerequisites: [python.dictsAndSets]\r
    estimatedMinutes: 35\r
  "builtins/14_csv":\r
    outcomes: [builtins.dataFormats]\r
    prerequisites: [python.modulesAndIo]\r
    estimatedMinutes: 35\r
  "builtins/15_pickle":\r
    outcomes: [builtins.dataFormats]\r
    prerequisites: [python.modulesAndIo]\r
    estimatedMinutes: 30\r
  "builtins/16_struct":\r
    outcomes: [builtins.dataFormats]\r
    prerequisites: [python.modulesAndIo]\r
    estimatedMinutes: 30\r
  "builtins/17_string":\r
    outcomes: [builtins.textProcessing]\r
    prerequisites: [python.strings]\r
    estimatedMinutes: 30\r
  "builtins/18_textwrap":\r
    outcomes: [builtins.textProcessing]\r
    prerequisites: [python.strings]\r
    estimatedMinutes: 25\r
  "builtins/19_difflib":\r
    outcomes: [builtins.textProcessing]\r
    prerequisites: [python.strings]\r
    estimatedMinutes: 30\r
  "builtins/20_base64":\r
    outcomes: [builtins.textProcessing]\r
    prerequisites: [python.strings]\r
    estimatedMinutes: 25\r
  "builtins/21_urllib":\r
    outcomes: [builtins.networking]\r
    prerequisites: [python.modulesAndIo]\r
    estimatedMinutes: 35\r
  "builtins/22_email":\r
    outcomes: [builtins.networking]\r
    prerequisites: [python.modulesAndIo]\r
    estimatedMinutes: 35\r
  "builtins/23_asyncio":\r
    outcomes: [builtins.async]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 50\r
  "builtins/24_argparse":\r
    outcomes: [builtins.cli]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 35\r
  "builtins/25_logging":\r
    outcomes: [builtins.logging]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 35\r
  "builtins/26_unittest":\r
    outcomes: [builtins.testing]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 40\r
  "builtins/27_timeit":\r
    outcomes: [builtins.logging]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 25\r
  "builtins/28_copy":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.oop]\r
    estimatedMinutes: 25\r
  "builtins/29_pprint":\r
    outcomes: [builtins.logging]\r
    prerequisites: [python.dictsAndSets]\r
    estimatedMinutes: 20\r
  "builtins/30_inspect":\r
    outcomes: [builtins.logging]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 30\r
  "builtins/31_subprocess":\r
    outcomes: [builtins.subprocess]\r
    prerequisites: [python.modulesAndIo]\r
    estimatedMinutes: 40\r
  "builtins/32_contextlib":
    outcomes: [builtins.contextManagers]
    prerequisites: [python.advancedSyntax]
    estimatedMinutes: 35
  "builtins/33_tempfile":
    outcomes: [builtins.tempFiles]
    prerequisites: [builtins.fileSystem, builtins.contextManagers]
    estimatedMinutes: 40
  "builtins/34_hashlib":
    outcomes: [builtins.hashing]
    prerequisites: [python.strings, builtins.fileSystem]
    estimatedMinutes: 40
  "builtins/35_zipfile":
    outcomes: [builtins.archives]
    prerequisites: [builtins.fileSystem, builtins.contextManagers]
    estimatedMinutes: 45

  # numpy 트랙
  "numpy/00_NumPy소개":\r
    outcomes: [numpy.intro]\r
    prerequisites: [python.lists, python.functions]\r
    estimatedMinutes: 35\r
  "numpy/01_포켓몬스탯분석":\r
    outcomes: [numpy.arrayOps]\r
    prerequisites: [numpy.intro]\r
    estimatedMinutes: 50\r
  "numpy/02_기온데이터탐색":\r
    outcomes: [numpy.statistics]\r
    prerequisites: [numpy.arrayOps]\r
    estimatedMinutes: 50\r
  "numpy/03_지진발생패턴":\r
    outcomes: [numpy.statistics]\r
    prerequisites: [numpy.statistics]\r
    estimatedMinutes: 50\r
  "numpy/04_음악특성분석":\r
    outcomes: [numpy.arrayOps, numpy.statistics]\r
    sectionOutcomes:\r
      step1_import: [numpy.arrayOps]\r
      step2_data: [numpy.arrayOps]\r
      step3_extract: [numpy.arrayOps]\r
      step4_stats: [numpy.statistics]\r
      step5_nan_check: [numpy.arrayOps]\r
      step6_nan_remove: [numpy.arrayOps]\r
      step7_minmax: [numpy.arrayOps]\r
      step8_norm_verify: [numpy.arrayOps]\r
      step9_zscore: [numpy.statistics]\r
      step10_zscore_verify: [numpy.statistics]\r
      step11_corr_two: [numpy.statistics]\r
      step12_corr_value: [numpy.statistics]\r
      step13_corr_all: [numpy.statistics]\r
      step14_corr_display: [numpy.statistics]\r
      step15_corr_extreme: [numpy.statistics]\r
      workflow_validation: [numpy.arrayOps, numpy.statistics]\r
    prerequisites: [numpy.statistics]\r
    estimatedMinutes: 55\r
  "numpy/05_BMI계산기":\r
    outcomes: [numpy.arrayOps]\r
    prerequisites: [numpy.intro]\r
    estimatedMinutes: 40\r
  "numpy/06_심장병위험분석":\r
    outcomes: [numpy.statistics]\r
    prerequisites: [numpy.statistics]\r
    estimatedMinutes: 55\r
  "numpy/07_대기질시계열":\r
    outcomes: [numpy.statistics]\r
    prerequisites: [numpy.statistics]\r
    estimatedMinutes: 55\r
  "numpy/08_행복지수국가비교":\r
    outcomes: [numpy.statistics]\r
    prerequisites: [numpy.statistics]\r
    estimatedMinutes: 50\r
  "numpy/09_전복나이예측":\r
    outcomes: [numpy.linearAlgebra]\r
    prerequisites: [numpy.arrayOps]\r
    estimatedMinutes: 60\r
  "numpy/10_당뇨병종합분석":\r
    outcomes: [numpy.linearAlgebra, numpy.statistics]\r
    sectionOutcomes:\r
      step1_import: [numpy.statistics]\r
      step2_data: [numpy.statistics]\r
      step3_extract: [numpy.statistics]\r
      step4_zero_check: [numpy.statistics]\r
      step5_replace_nan: [numpy.statistics]\r
      step6_impute: [numpy.statistics]\r
      step7_histogram: [numpy.statistics]\r
      step8_bincount: [numpy.statistics]\r
      step9_cov: [numpy.linearAlgebra]\r
      step10_corr_target: [numpy.statistics]\r
      step11_group_stats: [numpy.statistics]\r
      step12_standardize: [numpy.statistics]\r
      step13_eig: [numpy.linearAlgebra]\r
      step14_apply_along: [numpy.statistics]\r
      step15_risk_score: [numpy.statistics]\r
      workflow_validation: [numpy.linearAlgebra, numpy.statistics]\r
    prerequisites: [numpy.linearAlgebra]\r
    estimatedMinutes: 70\r
    lessonRole: project\r
\r
  # sympy 트랙\r
  "sympy/00_sympy소개":\r
    outcomes: [sympy.symbolic]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 30\r
  "sympy/01_기초수식계산":\r
    outcomes: [sympy.symbolic]\r
    prerequisites: [sympy.symbolic]\r
    estimatedMinutes: 35\r
  "sympy/02_대입과계산":\r
    outcomes: [sympy.symbolic]\r
    prerequisites: [sympy.symbolic]\r
    estimatedMinutes: 35\r
  "sympy/03_방정식풀이":\r
    outcomes: [sympy.equations]\r
    prerequisites: [sympy.symbolic]\r
    estimatedMinutes: 45\r
  "sympy/04_미분기초":\r
    outcomes: [sympy.calculus]\r
    prerequisites: [sympy.symbolic]\r
    estimatedMinutes: 40\r
  "sympy/05_적분기초":\r
    outcomes: [sympy.calculus]\r
    prerequisites: [sympy.calculus]\r
    estimatedMinutes: 40\r
  "sympy/06_극한과급수":\r
    outcomes: [sympy.calculus]\r
    prerequisites: [sympy.calculus]\r
    estimatedMinutes: 40\r
  "sympy/07_삼각함수활용":\r
    outcomes: [sympy.symbolic]\r
    prerequisites: [sympy.calculus]\r
    estimatedMinutes: 40\r
  "sympy/08_행렬연산":\r
    outcomes: [sympy.matrices]\r
    prerequisites: [sympy.symbolic]\r
    estimatedMinutes: 45\r
  "sympy/09_수식시각화":\r
    outcomes: [sympy.symbolic]\r
    prerequisites: [sympy.calculus, matplotlib.basics]\r
    estimatedMinutes: 45\r
  "sympy/10_종합수학문제":
    outcomes: [sympy.equations, sympy.calculus, sympy.matrices]
    prerequisites: [sympy.equations, sympy.calculus, sympy.matrices]\r
    estimatedMinutes: 70\r
    lessonRole: project\r
\r
  # duckdb 트랙\r
  "duckdb/00_DuckDB소개":\r
    outcomes: [duckdb.intro]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 30\r
  "duckdb/01_레스토랑팁기초":\r
    outcomes: [duckdb.basicQueries]\r
    prerequisites: [duckdb.intro]\r
    estimatedMinutes: 45\r
  "duckdb/02_타이타닉생존통계":\r
    outcomes: [duckdb.basicQueries, duckdb.aggregation]\r
    sectionOutcomes:\r
      step1_load: [duckdb.basicQueries]\r
      step2_explore: [duckdb.basicQueries]\r
      step3_count_basic: [duckdb.basicQueries]\r
      step4_count_column: [duckdb.basicQueries]\r
      step5_distinct: [duckdb.basicQueries]\r
      step6_groupby_basic: [duckdb.aggregation]\r
      step7_sum: [duckdb.aggregation]\r
      step8_avg: [duckdb.aggregation]\r
      step9_minmax: [duckdb.aggregation]\r
      step10_orderby: [duckdb.aggregation]\r
      step11_desc: [duckdb.aggregation]\r
      step12_groupby_multi: [duckdb.aggregation]\r
      step13_final: [duckdb.aggregation]\r
      workflow_validation: [duckdb.basicQueries, duckdb.aggregation]\r
    prerequisites: [duckdb.basicQueries]\r
    estimatedMinutes: 50\r
  "duckdb/03_팁패턴분석":\r
    outcomes: [duckdb.aggregation]\r
    prerequisites: [duckdb.basicQueries]\r
    estimatedMinutes: 50\r
  "duckdb/04_타이타닉심층분석":\r
    outcomes: [duckdb.aggregation]\r
    prerequisites: [duckdb.aggregation]\r
    estimatedMinutes: 55\r
  "duckdb/05_팁서브쿼리분석":\r
    outcomes: [duckdb.window]\r
    prerequisites: [duckdb.aggregation]\r
    estimatedMinutes: 55\r
  "duckdb/06_CTE단계별분석":\r
    outcomes: [duckdb.window]\r
    prerequisites: [duckdb.window]\r
    estimatedMinutes: 55\r
  "duckdb/07_윈도우함수기초":\r
    outcomes: [duckdb.window]\r
    prerequisites: [duckdb.aggregation]\r
    estimatedMinutes: 55\r
  "duckdb/08_고급윈도우분석":\r
    outcomes: [duckdb.window]\r
    prerequisites: [duckdb.window]\r
    estimatedMinutes: 60\r
  "duckdb/09_문자열과패턴":\r
    outcomes: [duckdb.basicQueries]\r
    prerequisites: [duckdb.basicQueries]\r
    estimatedMinutes: 45\r
  "duckdb/10_종합프로젝트":
    outcomes: [duckdb.basicQueries, duckdb.aggregation, duckdb.window]
    prerequisites: [duckdb.window]\r
    estimatedMinutes: 80\r
    lessonRole: project\r
\r
  # polars 트랙\r
  "polars/00_Polars소개":\r
    outcomes: [polars.intro]\r
    prerequisites: [pandas.intro]\r
    estimatedMinutes: 35\r
  "polars/01_영화평점분석":\r
    outcomes: [polars.transform]\r
    prerequisites: [polars.intro]\r
    estimatedMinutes: 50\r
  "polars/02_날씨데이터분석":\r
    outcomes: [polars.transform]\r
    prerequisites: [polars.transform]\r
    estimatedMinutes: 50\r
  "polars/03_게임판매분석":\r
    outcomes: [polars.aggregate]\r
    prerequisites: [polars.transform]\r
    estimatedMinutes: 55\r
  "polars/04_주식데이터분석":\r
    outcomes: [polars.aggregate]\r
    prerequisites: [polars.aggregate]\r
    estimatedMinutes: 55\r
  "polars/05_음악스트리밍분석":\r
    outcomes: [polars.aggregate]\r
    prerequisites: [polars.aggregate]\r
    estimatedMinutes: 60\r
  "polars/06_부동산가격분석":\r
    outcomes: [polars.aggregate]\r
    prerequisites: [polars.aggregate]\r
    estimatedMinutes: 55\r
  "polars/07_스포츠통계분석":\r
    outcomes: [polars.aggregate]\r
    prerequisites: [polars.aggregate]\r
    estimatedMinutes: 60\r
  "polars/08_소셜미디어분석":\r
    outcomes: [polars.aggregate]\r
    prerequisites: [polars.aggregate]\r
    estimatedMinutes: 60\r
  "polars/09_대용량로그분석":\r
    outcomes: [polars.bigData]\r
    prerequisites: [polars.aggregate]\r
    estimatedMinutes: 70\r
  "polars/10_실전종합프로젝트":\r
    outcomes: [polars.bigData]\r
    prerequisites: [polars.bigData]\r
    estimatedMinutes: 90\r
    lessonRole: project\r
\r
  # pydantic 트랙\r
  "pydantic/00_pydantic소개":\r
    outcomes: [pydantic.intro]\r
    prerequisites: [python.oop, python.typing]\r
    estimatedMinutes: 35\r
  "pydantic/01_사용자모델만들기":\r
    outcomes: [pydantic.intro]\r
    prerequisites: [pydantic.intro]\r
    estimatedMinutes: 40\r
  "pydantic/02_필드검증기":\r
    outcomes: [pydantic.validation]\r
    prerequisites: [pydantic.intro]\r
    estimatedMinutes: 50\r
  "pydantic/03_중첩모델설계":\r
    outcomes: [pydantic.schemas]\r
    prerequisites: [pydantic.intro]\r
    estimatedMinutes: 45\r
  "pydantic/04_타입변환기":\r
    outcomes: [pydantic.validation]\r
    prerequisites: [pydantic.validation]\r
    estimatedMinutes: 45\r
  "pydantic/05_설정관리기":\r
    outcomes: [pydantic.integration]\r
    prerequisites: [pydantic.intro]\r
    estimatedMinutes: 45\r
  "pydantic/06_JSON스키마생성":\r
    outcomes: [pydantic.schemas]\r
    prerequisites: [pydantic.schemas]\r
    estimatedMinutes: 40\r
  "pydantic/07_커스텀타입정의":\r
    outcomes: [pydantic.schemas]\r
    prerequisites: [pydantic.schemas]\r
    estimatedMinutes: 50\r
  "pydantic/08_에러처리기법":\r
    outcomes: [pydantic.validation]\r
    prerequisites: [pydantic.validation]\r
    estimatedMinutes: 40\r
  "pydantic/09_FastAPI통합":\r
    outcomes: [pydantic.integration]\r
    prerequisites: [pydantic.integration]\r
    estimatedMinutes: 60\r
  "pydantic/10_종합데이터파이프라인":\r
    outcomes: [pydantic.integration]\r
    prerequisites: [pydantic.integration]\r
    estimatedMinutes: 80\r
    lessonRole: project\r
\r
  # matplotlib 트랙\r
  "matplotlib/00_Matplotlib소개":\r
    outcomes: [matplotlib.basics]\r
    prerequisites: [pandas.loadFrame]\r
    estimatedMinutes: 35\r
  "matplotlib/01_주가추세분석":\r
    outcomes: [matplotlib.basics]\r
    prerequisites: [matplotlib.basics]\r
    estimatedMinutes: 50\r
  "matplotlib/02_팁데이터분포탐색":\r
    outcomes: [matplotlib.basics, viz.distribution]\r
    sectionOutcomes:\r
      step1_import: [matplotlib.basics]\r
      step1_font: [matplotlib.basics]\r
      step2_data: [matplotlib.basics]\r
      step3_explore: [matplotlib.basics]\r
      step4_hist: [viz.distribution]\r
      step5_hist_color: [viz.distribution]\r
      step6_boxplot: [viz.distribution]\r
      step7_subplots: [viz.distribution]\r
      step8_bill_hist: [viz.distribution]\r
      step9_xlim: [matplotlib.basics]\r
      step10_final: [viz.distribution]\r
      workflow_validation: [matplotlib.basics, viz.distribution]\r
    prerequisites: [matplotlib.basics]\r
    estimatedMinutes: 50\r
  "matplotlib/03_붓꽃품종산점도":\r
    outcomes: [matplotlib.basics]\r
    prerequisites: [matplotlib.basics]\r
    estimatedMinutes: 50\r
  "matplotlib/04_대륙별인구비교":\r
    outcomes: [matplotlib.basics]\r
    prerequisites: [matplotlib.basics]\r
    estimatedMinutes: 50\r
  "matplotlib/05_펭귄체중분석":\r
    outcomes: [viz.distribution]\r
    prerequisites: [matplotlib.basics]\r
    estimatedMinutes: 55\r
  "matplotlib/06_상관관계히트맵":\r
    outcomes: [viz.heatmap]\r
    prerequisites: [matplotlib.basics, pandas.aggregate]\r
    estimatedMinutes: 55\r
  "matplotlib/07_시계열다중축차트":\r
    outcomes: [matplotlib.advanced]\r
    prerequisites: [matplotlib.basics]\r
    estimatedMinutes: 55\r
  "matplotlib/08_다중패널대시보드":\r
    outcomes: [matplotlib.advanced]\r
    prerequisites: [matplotlib.advanced]\r
    estimatedMinutes: 60\r
  "matplotlib/09_고급주석차트":\r
    outcomes: [matplotlib.advanced]\r
    prerequisites: [matplotlib.advanced]\r
    estimatedMinutes: 55\r
  "matplotlib/10_종합분석리포트":\r
    outcomes: [matplotlib.advanced]\r
    prerequisites: [matplotlib.advanced]\r
    estimatedMinutes: 80\r
    lessonRole: project\r
\r
  # seaborn 트랙\r
  "seaborn/00_Seaborn소개":\r
    outcomes: [viz.statistical]\r
    prerequisites: [matplotlib.basics]\r
    estimatedMinutes: 35\r
  "seaborn/01_붓꽃품종산점도":\r
    outcomes: [viz.statistical]\r
    prerequisites: [viz.statistical]\r
    estimatedMinutes: 50\r
  "seaborn/02_팁데이터분포탐색":\r
    outcomes: [viz.distribution]\r
    prerequisites: [viz.statistical]\r
    estimatedMinutes: 50\r
  "seaborn/03_펭귄체중분포비교":\r
    outcomes: [viz.distribution]\r
    prerequisites: [viz.distribution]\r
    estimatedMinutes: 50\r
  "seaborn/04_광고비판매액회귀":\r
    outcomes: [viz.regression]\r
    prerequisites: [viz.statistical]\r
    estimatedMinutes: 55\r
  "seaborn/05_타이타닉생존분석":\r
    outcomes: [viz.distribution, viz.statistical]\r
    sectionOutcomes:\r
      step1_import: [viz.distribution]\r
      step2_data: [viz.distribution]\r
      step3_countplot: [viz.distribution]\r
      step4_countplot_hue: [viz.distribution]\r
      step5_barplot: [viz.distribution]\r
      step6_barplot_hue: [viz.distribution]\r
      step7_estimator: [viz.statistical]\r
      step8_pointplot: [viz.statistical]\r
      step9_catplot: [viz.statistical]\r
      step10_catplot_count: [viz.statistical]\r
      step11_final: [viz.distribution, viz.statistical]\r
      workflow_validation: [viz.distribution, viz.statistical]\r
    prerequisites: [viz.statistical]\r
    estimatedMinutes: 55\r
  "seaborn/06_항공편승객시계열":\r
    outcomes: [viz.statistical]\r
    prerequisites: [viz.statistical, pandas.timeSeries]\r
    estimatedMinutes: 55\r
  "seaborn/07_세계기대수명분석":\r
    outcomes: [viz.regression]\r
    prerequisites: [viz.regression]\r
    estimatedMinutes: 60\r
  "seaborn/08_다이아몬드가격분석":\r
    outcomes: [viz.heatmap, viz.distribution]\r
    sectionOutcomes:\r
      step1_import: [viz.distribution]\r
      step2_histplot_basic: [viz.distribution]\r
      step3_histplot_hue: [viz.distribution]\r
      step4_multiple: [viz.distribution]\r
      step5_kdeplot: [viz.distribution]\r
      step6_kdeplot_fill: [viz.distribution]\r
      step7_displot: [viz.distribution]\r
      step8_displot_col: [viz.distribution]\r
      step9_2d_kde: [viz.heatmap]\r
      step10_2d_hist: [viz.heatmap]\r
      step11_ecdf: [viz.distribution]\r
      step12_col_row: [viz.distribution]\r
      workflow_validation: [viz.heatmap, viz.distribution]\r
    prerequisites: [viz.distribution]\r
    estimatedMinutes: 60\r
  "seaborn/09_자동차연비종합분석":\r
    outcomes: [viz.regression, viz.heatmap]\r
    sectionOutcomes:\r
      step1_import: [viz.regression]\r
      step2_pairplot_basic: [viz.regression]\r
      step3_pairplot_hue: [viz.regression]\r
      step4_pairplot_reg: [viz.regression]\r
      step5_jointplot_basic: [viz.regression]\r
      step6_jointplot_reg: [viz.regression]\r
      step7_jointplot_kde: [viz.regression]\r
      step8_jointplot_hue: [viz.regression]\r
      step9_lmplot_basic: [viz.regression]\r
      step10_lmplot_col: [viz.regression]\r
      step11_lmplot_poly: [viz.regression]\r
      step12_lmplot_grid: [viz.regression]\r
      step13_corr_heatmap: [viz.heatmap]\r
      workflow_validation: [viz.regression, viz.heatmap]\r
    prerequisites: [viz.regression]\r
    estimatedMinutes: 65\r
  "seaborn/10_종합EDA리포트":
    outcomes: [viz.edaReport]
    prerequisites: [viz.regression, viz.heatmap, viz.distribution]\r
    estimatedMinutes: 90\r
    lessonRole: project\r
\r
  # plotly 트랙\r
  "plotly/00_Plotly소개":\r
    outcomes: [viz.interactive]\r
    prerequisites: [matplotlib.basics]\r
    estimatedMinutes: 35\r
  "plotly/01_세계기대수명비교":\r
    outcomes: [viz.interactive]\r
    prerequisites: [viz.interactive]\r
    estimatedMinutes: 50\r
  "plotly/02_팁데이터분포분석":\r
    outcomes: [viz.interactive]\r
    prerequisites: [viz.interactive]\r
    estimatedMinutes: 50\r
  "plotly/03_붓꽃품종분류":\r
    outcomes: [viz.interactive]\r
    prerequisites: [viz.interactive]\r
    estimatedMinutes: 50\r
  "plotly/04_GDP기대수명관계":\r
    outcomes: [viz.interactive]\r
    prerequisites: [viz.interactive]\r
    estimatedMinutes: 55\r
  "plotly/05_세계인구지도":\r
    outcomes: [viz.geoMaps]\r
    prerequisites: [viz.interactive]\r
    estimatedMinutes: 55\r
  "plotly/06_시간에따른세계변화":\r
    outcomes: [viz.interactive]\r
    prerequisites: [viz.interactive]\r
    estimatedMinutes: 55\r
  "plotly/07_레스토랑매출분석":\r
    outcomes: [viz.interactive]\r
    prerequisites: [viz.interactive]\r
    estimatedMinutes: 55\r
  "plotly/08_대륙별계층구조":\r
    outcomes: [viz.interactive]\r
    prerequisites: [viz.interactive]\r
    estimatedMinutes: 55\r
  "plotly/09_주식시계열분석":\r
    outcomes: [viz.interactive, viz.interactiveAdvanced]\r
    sectionOutcomes:\r
      step1_import: [viz.interactive]\r
      step2_head: [viz.interactive]\r
      step3_basic_line: [viz.interactive]\r
      step4_multi_line: [viz.interactive]\r
      step5_facet: [viz.interactive]\r
      step6_update_layout: [viz.interactive]\r
      step7_update_traces: [viz.interactive]\r
      step8_template: [viz.interactiveAdvanced]\r
      step9_subplots: [viz.interactiveAdvanced]\r
      step10_subplots_styled: [viz.interactiveAdvanced]\r
      step11_result: [viz.interactiveAdvanced]\r
      workflow_validation: [viz.interactive, viz.interactiveAdvanced]\r
    prerequisites: [viz.interactive]\r
    estimatedMinutes: 60\r
  "plotly/10_종합대시보드":\r
    outcomes: [viz.interactiveAdvanced]\r
    prerequisites: [viz.interactiveAdvanced]\r
    estimatedMinutes: 80\r
    lessonRole: project\r
\r
  # altair 트랙\r
  "altair/00_Altair소개":\r
    outcomes: [viz.declarative]\r
    prerequisites: [matplotlib.basics]\r
    estimatedMinutes: 35\r
  "altair/01_자동차연비탐색":\r
    outcomes: [viz.declarative]\r
    prerequisites: [viz.declarative]\r
    estimatedMinutes: 50\r
  "altair/02_붓꽃품종구분":\r
    outcomes: [viz.declarative]\r
    prerequisites: [viz.declarative]\r
    estimatedMinutes: 50\r
  "altair/07_인터랙티브필터":\r
    outcomes: [viz.interactiveAdvanced]\r
    prerequisites: [viz.declarative]\r
    estimatedMinutes: 55\r
  "altair/08_다중뷰연결":\r
    outcomes: [viz.interactiveAdvanced]\r
    prerequisites: [viz.interactiveAdvanced]\r
    estimatedMinutes: 60\r
  "altair/09_고급데이터변환":\r
    outcomes: [viz.declarative]\r
    prerequisites: [viz.declarative]\r
    estimatedMinutes: 55\r
  "altair/10_종합대시보드":\r
    outcomes: [viz.interactiveAdvanced]\r
    prerequisites: [viz.interactiveAdvanced]\r
    estimatedMinutes: 80\r
    lessonRole: project\r
\r
  # folium 트랙\r
  "folium/00_folium소개":\r
    outcomes: [viz.geoMaps]\r
    prerequisites: [pandas.loadFrame]\r
    estimatedMinutes: 30\r
  "folium/01_첫지도만들기":\r
    outcomes: [viz.geoMaps]\r
    prerequisites: [viz.geoMaps]\r
    estimatedMinutes: 35\r
  "folium/02_다양한마커표현":\r
    outcomes: [viz.geoMaps]\r
    prerequisites: [viz.geoMaps]\r
    estimatedMinutes: 40\r
  "folium/07_단계구분도":\r
    outcomes: [viz.geoMaps]\r
    prerequisites: [viz.geoMaps]\r
    estimatedMinutes: 50\r
  "folium/08_히트맵":\r
    outcomes: [viz.geoMaps]\r
    prerequisites: [viz.geoMaps]\r
    estimatedMinutes: 45\r
  "folium/10_종합지도프로젝트":\r
    outcomes: [viz.geoMaps]\r
    prerequisites: [viz.geoMaps]\r
    estimatedMinutes: 80\r
    lessonRole: project\r
\r
  # scipy 트랙\r
  "scipy/00_scipy소개":\r
    outcomes: [scipy.intro]\r
    prerequisites: [numpy.arrayOps]\r
    estimatedMinutes: 35\r
  "scipy/01_확률분포탐색기":\r
    outcomes: [scipy.statistics]\r
    prerequisites: [scipy.intro]\r
    estimatedMinutes: 50\r
  "scipy/02_AB테스트분석":\r
    outcomes: [scipy.statistics]\r
    prerequisites: [scipy.statistics]\r
    estimatedMinutes: 55\r
  "scipy/03_데이터보간기":\r
    outcomes: [scipy.optimization]\r
    prerequisites: [scipy.intro]\r
    estimatedMinutes: 45\r
  "scipy/04_곡선피팅마스터":\r
    outcomes: [scipy.optimization]\r
    prerequisites: [scipy.optimization]\r
    estimatedMinutes: 55\r
  "scipy/05_정규성검정기":\r
    outcomes: [scipy.statistics]\r
    prerequisites: [scipy.statistics]\r
    estimatedMinutes: 50\r
  "scipy/06_포트폴리오최적화":\r
    outcomes: [scipy.optimization]\r
    prerequisites: [scipy.optimization]\r
    estimatedMinutes: 60\r
  "scipy/07_신호필터링":\r
    outcomes: [scipy.signal]\r
    prerequisites: [scipy.intro]\r
    estimatedMinutes: 55\r
  "scipy/08_수치적분기":\r
    outcomes: [scipy.integration]\r
    prerequisites: [scipy.intro]\r
    estimatedMinutes: 45\r
  "scipy/09_스펙트럼분석기":\r
    outcomes: [scipy.signal]\r
    prerequisites: [scipy.signal]\r
    estimatedMinutes: 60\r
  "scipy/10_종합과학프로젝트":
    outcomes: [scipy.statistics, scipy.optimization, scipy.signal, scipy.integration]
    prerequisites: [scipy.statistics, scipy.optimization, scipy.signal]\r
    estimatedMinutes: 90\r
    lessonRole: project\r
\r
  # statsmodels 트랙\r
  "statsmodels/00_statsmodels소개":\r
    outcomes: [stats.regression]\r
    prerequisites: [pandas.loadFrame, numpy.intro]\r
    estimatedMinutes: 40\r
  "statsmodels/01_광고비매출예측":\r
    outcomes: [stats.regression]\r
    prerequisites: [stats.regression]\r
    estimatedMinutes: 55\r
  "statsmodels/02_부동산가격예측":\r
    outcomes: [stats.regression]\r
    prerequisites: [stats.regression]\r
    estimatedMinutes: 60\r
  "statsmodels/03_의료보험비용예측":\r
    outcomes: [stats.regression]\r
    prerequisites: [stats.regression]\r
    estimatedMinutes: 55\r
  "statsmodels/04_항공수요예측":\r
    outcomes: [stats.timeSeries]\r
    prerequisites: [stats.regression, pandas.timeSeries]\r
    estimatedMinutes: 65\r
  "statsmodels/05_고객이탈예측":\r
    outcomes: [stats.regression]\r
    prerequisites: [stats.regression]\r
    estimatedMinutes: 55\r
  "statsmodels/06_다중회귀심화":\r
    outcomes: [stats.regression, stats.diagnostics]\r
    sectionOutcomes:\r
      step1_load: [stats.regression]\r
      step2_correlation: [stats.regression]\r
      step3_multiple_regression: [stats.regression]\r
      step4_interpret_coefficients: [stats.regression]\r
      step5_rsquared_comparison: [stats.regression]\r
      step6_vif: [stats.diagnostics]\r
      step7_vif_viz: [stats.diagnostics]\r
      step8_pvalues: [stats.diagnostics]\r
      step9_remove_newspaper: [stats.diagnostics]\r
      step10_interaction: [stats.regression]\r
      step11_coef_comparison: [stats.regression]\r
      step12_predict: [stats.regression]\r
      workflow_validation: [stats.regression, stats.diagnostics]\r
    prerequisites: [stats.regression]\r
    estimatedMinutes: 60\r
  "statsmodels/07_경제지표회귀분석":\r
    outcomes: [stats.regression]\r
    prerequisites: [stats.regression]\r
    estimatedMinutes: 55\r
  "statsmodels/08_직원퇴사예측":\r
    outcomes: [stats.diagnostics]\r
    prerequisites: [stats.diagnostics]\r
    estimatedMinutes: 55\r
  "statsmodels/09_자전거수요예측":\r
    outcomes: [stats.timeSeries]\r
    prerequisites: [stats.timeSeries]\r
    estimatedMinutes: 60\r
  "statsmodels/10_종합프로젝트":
    outcomes: [stats.regression, stats.diagnostics, stats.timeSeries]
    prerequisites: [stats.regression, stats.diagnostics, stats.timeSeries]\r
    estimatedMinutes: 90\r
    lessonRole: project\r
\r
  # sklearn 트랙\r
  "sklearn/00_sklearn소개":\r
    outcomes: [ml.intro]\r
    prerequisites: [pandas.loadFrame, numpy.arrayOps]\r
    estimatedMinutes: 40\r
  "sklearn/01_와인품질분류":\r
    outcomes: [ml.classification]\r
    prerequisites: [ml.intro]\r
    estimatedMinutes: 55\r
  "sklearn/02_유방암진단":\r
    outcomes: [ml.classification]\r
    prerequisites: [ml.classification]\r
    estimatedMinutes: 55\r
  "sklearn/03_당뇨병진행도예측":\r
    outcomes: [ml.regression]\r
    prerequisites: [ml.intro]\r
    estimatedMinutes: 55\r
  "sklearn/04_주택가격예측":\r
    outcomes: [ml.regression]\r
    prerequisites: [ml.regression]\r
    estimatedMinutes: 55\r
  "sklearn/05_손글씨숫자인식":\r
    outcomes: [ml.classification]\r
    prerequisites: [ml.classification]\r
    estimatedMinutes: 60\r
  "sklearn/06_고객세분화":\r
    outcomes: [ml.clustering]\r
    prerequisites: [ml.intro]\r
    estimatedMinutes: 60\r
  "sklearn/07_소나신호분류":\r
    outcomes: [ml.classification]\r
    prerequisites: [ml.classification]\r
    estimatedMinutes: 55\r
  "sklearn/08_심장병예측":\r
    outcomes: [ml.classification]\r
    prerequisites: [ml.classification]\r
    estimatedMinutes: 55\r
  "sklearn/09_신호탐지최적화":\r
    outcomes: [ml.pipeline]\r
    prerequisites: [ml.classification]\r
    estimatedMinutes: 65\r
  "sklearn/10_종합ML파이프라인":\r
    outcomes: [ml.pipeline]\r
    prerequisites: [ml.pipeline]\r
    estimatedMinutes: 90\r
    lessonRole: project\r
\r
  # networkx 트랙\r
  "networkx/00_networkx소개":\r
    outcomes: [graph.intro]\r
    prerequisites: [python.dictsAndSets]\r
    estimatedMinutes: 35\r
  "networkx/01_첫그래프만들기":\r
    outcomes: [graph.intro]\r
    prerequisites: [graph.intro]\r
    estimatedMinutes: 40\r
  "networkx/02_방향그래프와가중치":\r
    outcomes: [graph.intro]\r
    prerequisites: [graph.intro]\r
    estimatedMinutes: 40\r
  "networkx/03_최단경로찾기":\r
    outcomes: [graph.paths]\r
    prerequisites: [graph.intro]\r
    estimatedMinutes: 50\r
  "networkx/04_중심성분석":\r
    outcomes: [graph.paths]\r
    prerequisites: [graph.paths]\r
    estimatedMinutes: 50\r
  "networkx/05_소셜네트워크분석":\r
    outcomes: [graph.paths, graph.community]\r
    sectionOutcomes:\r
      step1_import: [graph.paths]\r
      step2_karate: [graph.paths]\r
      step3_visualize: [graph.paths]\r
      step4_basic_stats: [graph.paths]\r
      step5_clustering: [graph.community]\r
      step6_triangles: [graph.community]\r
      step7_centrality: [graph.paths]\r
      step8_path_analysis: [graph.paths]\r
      step9_group_analysis: [graph.community]\r
      step10_clustering_viz: [graph.community]\r
      workflow_validation: [graph.paths, graph.community]\r
    prerequisites: [graph.paths]\r
    estimatedMinutes: 60\r
  "networkx/06_연결성분석":\r
    outcomes: [graph.algorithms]\r
    prerequisites: [graph.paths]\r
    estimatedMinutes: 50\r
  "networkx/07_커뮤니티탐지":\r
    outcomes: [graph.community]\r
    prerequisites: [graph.paths]\r
    estimatedMinutes: 55\r
  "networkx/08_그래프알고리즘":\r
    outcomes: [graph.algorithms]\r
    prerequisites: [graph.algorithms]\r
    estimatedMinutes: 55\r
  "networkx/09_랜덤그래프모델":\r
    outcomes: [graph.algorithms]\r
    prerequisites: [graph.algorithms]\r
    estimatedMinutes: 50\r
  "networkx/10_종합네트워크프로젝트":
    outcomes: [graph.paths, graph.community, graph.algorithms]
    prerequisites: [graph.community, graph.algorithms]\r
    estimatedMinutes: 80\r
    lessonRole: project\r
\r
  # regex 트랙\r
  "regex/00_정규표현식소개":\r
    outcomes: [automation.regex]\r
    prerequisites: [python.strings]\r
    estimatedMinutes: 35\r
  "regex/01_이메일주소추출":\r
    outcomes: [automation.regex, automation.textExtraction]\r
    sectionOutcomes:\r
      step1_import: [automation.regex]\r
      step2_load: [automation.textExtraction]\r
      step3_explore: [automation.textExtraction]\r
      step4_pattern_basic: [automation.regex]\r
      step5_pattern_improved: [automation.regex]\r
      step6_extract_all: [automation.textExtraction]\r
      step7_result: [automation.textExtraction]\r
      step8_workflow: [automation.textExtraction]\r
      workflow_validation: [automation.regex, automation.textExtraction]\r
    prerequisites: [automation.regex]\r
    estimatedMinutes: 45\r
  "regex/02_전화번호형식통일":\r
    outcomes: [automation.textExtraction]\r
    prerequisites: [automation.regex]\r
    estimatedMinutes: 45\r
  "regex/03_URL구조분해":\r
    outcomes: [automation.textExtraction]\r
    prerequisites: [automation.textExtraction]\r
    estimatedMinutes: 45\r
  "regex/04_HTML태그제거":\r
    outcomes: [automation.textExtraction]\r
    prerequisites: [automation.textExtraction]\r
    estimatedMinutes: 40\r
  "regex/05_로그파일분석":\r
    outcomes: [automation.textExtraction]\r
    prerequisites: [automation.textExtraction]\r
    estimatedMinutes: 55\r
  "regex/06_날짜형식변환":\r
    outcomes: [automation.textExtraction]\r
    prerequisites: [automation.textExtraction]\r
    estimatedMinutes: 45\r
  "regex/07_개인정보마스킹":\r
    outcomes: [automation.llmPreprocess]\r
    prerequisites: [automation.textExtraction]\r
    estimatedMinutes: 50\r
  "regex/08_텍스트정제토큰화":\r
    outcomes: [automation.llmPreprocess]\r
    prerequisites: [automation.llmPreprocess]\r
    estimatedMinutes: 55\r
  "regex/09_고급패턴매칭":\r
    outcomes: [automation.regex]\r
    prerequisites: [automation.textExtraction]\r
    estimatedMinutes: 60\r
  "regex/10_LLM전처리파이프라인":\r
    outcomes: [automation.llmPreprocess]\r
    prerequisites: [automation.llmPreprocess]\r
    estimatedMinutes: 80\r
    lessonRole: project\r
\r
  # fileOps 트랙\r
  "fileOps/01_pathlib경로감각":\r
    outcomes: [automation.fileOps]\r
    prerequisites: [builtins.fileSystem]\r
    estimatedMinutes: 35\r
  "fileOps/02_파일읽고쓰기":\r
    outcomes: [automation.fileOps]\r
    prerequisites: [automation.fileOps]\r
    estimatedMinutes: 35\r
  "fileOps/03_디렉터리탐색":\r
    outcomes: [automation.fileOps]\r
    prerequisites: [automation.fileOps]\r
    estimatedMinutes: 40\r
  "fileOps/04_복사이동이름변경":\r
    outcomes: [automation.fileOps]\r
    prerequisites: [automation.fileOps]\r
    estimatedMinutes: 40\r
  "fileOps/05_안전삭제":\r
    outcomes: [automation.fileOps]\r
    prerequisites: [automation.fileOps]\r
    estimatedMinutes: 35\r
  "fileOps/06_zip압축":\r
    outcomes: [automation.fileBackup]\r
    prerequisites: [automation.fileOps]\r
    estimatedMinutes: 40\r
  "fileOps/07_백업과동기화":\r
    outcomes: [automation.fileBackup]\r
    prerequisites: [automation.fileBackup]\r
    estimatedMinutes: 50\r
  "fileOps/08_디렉터리정리":\r
    outcomes: [automation.fileBackup]\r
    prerequisites: [automation.fileBackup]\r
    estimatedMinutes: 50\r
  "fileOps/09_파일메타데이터":\r
    outcomes: [automation.fileOps]\r
    prerequisites: [automation.fileOps]\r
    estimatedMinutes: 35\r
  "fileOps/10_종합다운로드폴더정리":\r
    outcomes: [automation.fileBackup]\r
    prerequisites: [automation.fileBackup]\r
    estimatedMinutes: 70\r
    lessonRole: project\r
\r
  # procCtl 트랙\r
  "procCtl/01_subprocess기초":\r
    outcomes: [automation.procCtl]\r
    prerequisites: [builtins.subprocess]\r
    estimatedMinutes: 35\r
  "procCtl/02_인자전달과인용":\r
    outcomes: [automation.procCtl]\r
    prerequisites: [automation.procCtl]\r
    estimatedMinutes: 35\r
  "procCtl/03_타임아웃과예외":\r
    outcomes: [automation.procCtl]\r
    prerequisites: [automation.procCtl]\r
    estimatedMinutes: 40\r
  "procCtl/04_파이프와스트리밍":\r
    outcomes: [automation.procCtl]\r
    prerequisites: [automation.procCtl]\r
    estimatedMinutes: 45\r
  "procCtl/05_환경변수와CWD":\r
    outcomes: [automation.procCtl]\r
    prerequisites: [automation.procCtl]\r
    estimatedMinutes: 35\r
  "procCtl/06_외부도구래퍼":\r
    outcomes: [automation.procCtl]\r
    prerequisites: [automation.procCtl]\r
    estimatedMinutes: 45\r
  "procCtl/07_psutil프로세스조회":\r
    outcomes: [automation.procMonitoring]\r
    prerequisites: [automation.procCtl]\r
    estimatedMinutes: 40\r
  "procCtl/08_시스템자원모니터링":\r
    outcomes: [automation.procMonitoring]\r
    prerequisites: [automation.procMonitoring]\r
    estimatedMinutes: 45\r
  "procCtl/09_프로세스종료와시그널":\r
    outcomes: [automation.procMonitoring]\r
    prerequisites: [automation.procMonitoring]\r
    estimatedMinutes: 45\r
  "procCtl/10_종합빌드러너":
    outcomes: [automation.procCtl, automation.procMonitoring]
    prerequisites: [automation.procCtl, automation.procMonitoring]\r
    estimatedMinutes: 75\r
    lessonRole: project\r
\r
  # watchSched 트랙\r
  "watchSched/01_watchdog첫감시":\r
    outcomes: [automation.watchSched]\r
    prerequisites: [python.functions, builtins.fileSystem]\r
    estimatedMinutes: 40\r
  "watchSched/02_이벤트타입구분":\r
    outcomes: [automation.watchSched]\r
    prerequisites: [automation.watchSched]\r
    estimatedMinutes: 35\r
  "watchSched/03_디바운스와안정화":\r
    outcomes: [automation.watchSched]\r
    prerequisites: [automation.watchSched]\r
    estimatedMinutes: 40\r
  "watchSched/04_재귀감시와필터":\r
    outcomes: [automation.watchSched]\r
    prerequisites: [automation.watchSched]\r
    estimatedMinutes: 40\r
  "watchSched/05_schedule간단스케줄":\r
    outcomes: [automation.scheduling]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 35\r
  "watchSched/06_APScheduler소개":\r
    outcomes: [automation.scheduling]\r
    prerequisites: [automation.scheduling]\r
    estimatedMinutes: 40\r
  "watchSched/07_cron표현식":\r
    outcomes: [automation.scheduling]\r
    prerequisites: [automation.scheduling]\r
    estimatedMinutes: 35\r
  "watchSched/08_영속스케줄":\r
    outcomes: [automation.scheduling]\r
    prerequisites: [automation.scheduling]\r
    estimatedMinutes: 40\r
  "watchSched/09_실패와재시도":\r
    outcomes: [automation.scheduling]\r
    prerequisites: [automation.scheduling]\r
    estimatedMinutes: 40\r
  "watchSched/10_종합폴더감시리포터":
    outcomes: [automation.watchSched, automation.scheduling]
    prerequisites: [automation.watchSched, automation.scheduling]\r
    estimatedMinutes: 75\r
    lessonRole: project\r
  "resilience/01_멱등성과처리원장":\r
    outcomes: [automation.resilience.idempotency]\r
    prerequisites: [automation.fileOps]\r
    estimatedMinutes: 40\r
  "resilience/02_재개가능체크포인트":\r
    outcomes: [automation.resilience.checkpoint]\r
    prerequisites: [automation.resilience.idempotency]\r
    estimatedMinutes: 40\r
  "resilience/03_원자적쓰기":\r
    outcomes: [automation.resilience.atomicWrite]\r
    prerequisites: [automation.fileOps]\r
    estimatedMinutes: 40\r
\r
  # inputCtl 트랙\r
  "inputCtl/01_pyautogui안전장치":\r
    outcomes: [automation.inputCtl]\r
    prerequisites: [python.errorHandling]\r
    estimatedMinutes: 35\r
  "inputCtl/02_화면크기와좌표":\r
    outcomes: [automation.inputCtl]\r
    prerequisites: [automation.inputCtl]\r
    estimatedMinutes: 30\r
  "inputCtl/03_마우스이동과클릭":\r
    outcomes: [automation.inputCtl]\r
    prerequisites: [automation.inputCtl]\r
    estimatedMinutes: 40\r
  "inputCtl/04_키보드입력":\r
    outcomes: [automation.inputCtl]\r
    prerequisites: [automation.inputCtl]\r
    estimatedMinutes: 40\r
  "inputCtl/05_스크린샷영역":\r
    outcomes: [automation.screenInteraction]\r
    prerequisites: [automation.inputCtl]\r
    estimatedMinutes: 35\r
  "inputCtl/06_이미지매치":\r
    outcomes: [automation.screenInteraction]\r
    prerequisites: [automation.screenInteraction]\r
    estimatedMinutes: 50\r
  "inputCtl/07_클립보드":\r
    outcomes: [automation.screenInteraction]\r
    prerequisites: [automation.inputCtl]\r
    estimatedMinutes: 25\r
  "inputCtl/08_pynput리스너":\r
    outcomes: [automation.inputCtl]\r
    prerequisites: [automation.inputCtl]\r
    estimatedMinutes: 45\r
  "inputCtl/09_상태기반자동화":\r
    outcomes: [automation.screenInteraction]\r
    prerequisites: [automation.screenInteraction]\r
    estimatedMinutes: 55\r
  "inputCtl/10_종합화면점검":
    outcomes: [automation.inputCtl, automation.screenInteraction]
    prerequisites: [automation.inputCtl, automation.screenInteraction]\r
    estimatedMinutes: 75\r
    lessonRole: project\r
\r
  # pillow 트랙\r
  "pillow/00_Pillow소개":\r
    outcomes: [image.pillowBasics]\r
    prerequisites: [python.modulesAndIo]\r
    estimatedMinutes: 30\r
  "pillow/01_꽃사진탐색기":\r
    outcomes: [image.pillowBasics]\r
    prerequisites: [image.pillowBasics]\r
    estimatedMinutes: 40\r
  "pillow/02_중국풍경편집기":\r
    outcomes: [image.pillowBasics]\r
    prerequisites: [image.pillowBasics]\r
    estimatedMinutes: 45\r
  "pillow/03_흑백사진변환기":\r
    outcomes: [image.filters]\r
    prerequisites: [image.pillowBasics]\r
    estimatedMinutes: 40\r
  "pillow/04_사진필터스튜디오":\r
    outcomes: [image.filters]\r
    prerequisites: [image.filters]\r
    estimatedMinutes: 50\r
  "pillow/05_밝기대비조절기":\r
    outcomes: [image.filters]\r
    prerequisites: [image.filters]\r
    estimatedMinutes: 45\r
  "pillow/06_RGB채널분석기":\r
    outcomes: [image.filters]\r
    prerequisites: [image.filters]\r
    estimatedMinutes: 45\r
  "pillow/07_워터마크생성기":\r
    outcomes: [image.composition]\r
    prerequisites: [image.pillowBasics]\r
    estimatedMinutes: 50\r
  "pillow/08_도형아트생성기":\r
    outcomes: [image.composition]\r
    prerequisites: [image.composition]\r
    estimatedMinutes: 50\r
  "pillow/09_포토콜라주메이커":\r
    outcomes: [image.composition]\r
    prerequisites: [image.composition]\r
    estimatedMinutes: 55\r
  "pillow/10_종합이미지에디터":
    outcomes: [image.filters, image.composition]
    prerequisites: [image.filters, image.composition]\r
    estimatedMinutes: 80\r
    lessonRole: project\r
\r
  # opencv 트랙\r
  "opencv/00_OpenCV소개":\r
    outcomes: [vision.opencvBasics]\r
    prerequisites: [numpy.arrayOps]\r
    estimatedMinutes: 35\r
  "opencv/01_이미지구조탐색기":\r
    outcomes: [vision.opencvBasics]\r
    prerequisites: [vision.opencvBasics]\r
    estimatedMinutes: 45\r
  "opencv/02_색공간변환기":\r
    outcomes: [vision.opencvBasics]\r
    prerequisites: [vision.opencvBasics]\r
    estimatedMinutes: 45\r
  "opencv/03_기하학적변환기":\r
    outcomes: [vision.opencvBasics]\r
    prerequisites: [vision.opencvBasics]\r
    estimatedMinutes: 45\r
  "opencv/04_이미지필터랩":\r
    outcomes: [vision.filters]\r
    prerequisites: [vision.opencvBasics]\r
    estimatedMinutes: 50\r
  "opencv/05_에지검출기":\r
    outcomes: [vision.filters]\r
    prerequisites: [vision.filters]\r
    estimatedMinutes: 50\r
  "opencv/06_이진화스튜디오":\r
    outcomes: [vision.filters]\r
    prerequisites: [vision.filters]\r
    estimatedMinutes: 45\r
  "opencv/07_모폴로지연산기":\r
    outcomes: [vision.filters]\r
    prerequisites: [vision.filters]\r
    estimatedMinutes: 50\r
  "opencv/08_히스토그램분석기":\r
    outcomes: [vision.features]\r
    prerequisites: [vision.opencvBasics]\r
    estimatedMinutes: 50\r
  "opencv/09_컨투어탐지기":\r
    outcomes: [vision.features]\r
    prerequisites: [vision.filters]\r
    estimatedMinutes: 55\r
  "opencv/10_종합비전프로젝트":
    outcomes: [vision.filters, vision.features]
    prerequisites: [vision.features, vision.filters]\r
    estimatedMinutes: 90\r
    lessonRole: project\r
\r
  # visionBasics 트랙\r
  "visionBasics/01_픽셀과ndarray":\r
    outcomes: [vision.pixelFoundations]\r
    prerequisites: [numpy.arrayOps]\r
    estimatedMinutes: 35\r
  "visionBasics/02_좌표계함정":\r
    outcomes: [vision.pixelFoundations]\r
    prerequisites: [vision.pixelFoundations]\r
    estimatedMinutes: 35\r
  "visionBasics/03_채널구조분해":\r
    outcomes: [vision.pixelFoundations]\r
    prerequisites: [vision.pixelFoundations]\r
    estimatedMinutes: 40\r
  "visionBasics/04_색공간직관":\r
    outcomes: [vision.pixelFoundations]\r
    prerequisites: [vision.pixelFoundations]\r
    estimatedMinutes: 40\r
  "visionBasics/05_슬라이싱과ROI":\r
    outcomes: [vision.pixelFoundations]\r
    prerequisites: [vision.pixelFoundations]\r
    estimatedMinutes: 35\r
  "visionBasics/06_픽셀산술":\r
    outcomes: [vision.pixelFoundations]\r
    prerequisites: [vision.pixelFoundations]\r
    estimatedMinutes: 40\r
  "visionBasics/07_룩업테이블":\r
    outcomes: [vision.pixelFoundations]\r
    prerequisites: [vision.pixelFoundations]\r
    estimatedMinutes: 40\r
  "visionBasics/08_마스크사고":\r
    outcomes: [vision.pixelFoundations]\r
    prerequisites: [vision.pixelFoundations]\r
    estimatedMinutes: 45\r
  "visionBasics/09_이미지통계":\r
    outcomes: [vision.pixelFoundations]\r
    prerequisites: [vision.pixelFoundations]\r
    estimatedMinutes: 40\r
  "visionBasics/10_종합미니보정기":
    outcomes: [vision.pixelFoundations]
    prerequisites: [vision.pixelFoundations]\r
    estimatedMinutes: 70\r
    lessonRole: project\r
\r
  # visionFeatures 트랙\r
  "visionFeatures/01_코너검출":\r
    outcomes: [vision.featureMatching]\r
    prerequisites: [vision.opencvBasics, vision.features]\r
    estimatedMinutes: 45\r
  "visionFeatures/02_ORB특징점":\r
    outcomes: [vision.featureMatching]\r
    prerequisites: [vision.featureMatching]\r
    estimatedMinutes: 50\r
  "visionFeatures/03_특징점매칭":\r
    outcomes: [vision.featureMatching]\r
    prerequisites: [vision.featureMatching]\r
    estimatedMinutes: 55\r
  "visionFeatures/04_호모그래피정렬":\r
    outcomes: [vision.featureMatching]\r
    prerequisites: [vision.featureMatching]\r
    estimatedMinutes: 55\r
  "visionFeatures/05_파노라마스티칭":\r
    outcomes: [vision.featureMatching]\r
    prerequisites: [vision.featureMatching]\r
    estimatedMinutes: 60\r
  "visionFeatures/06_비디오입출력":\r
    outcomes: [vision.video]\r
    prerequisites: [vision.opencvBasics]\r
    estimatedMinutes: 45\r
  "visionFeatures/07_배경차분":\r
    outcomes: [vision.video]\r
    prerequisites: [vision.video]\r
    estimatedMinutes: 50\r
  "visionFeatures/08_광학흐름":\r
    outcomes: [vision.video]\r
    prerequisites: [vision.video]\r
    estimatedMinutes: 55\r
  "visionFeatures/09_객체트래커":\r
    outcomes: [vision.video]\r
    prerequisites: [vision.video]\r
    estimatedMinutes: 55\r
  "visionFeatures/10_종합영상ROI추적기":
    outcomes: [vision.featureMatching, vision.video]
    prerequisites: [vision.video, vision.featureMatching]\r
    estimatedMinutes: 80\r
    lessonRole: project\r
\r
  # deepVision 트랙\r
  "deepVision/01_torchvision입문":\r
    outcomes: [deepVision.classification]\r
    prerequisites: [numpy.arrayOps, vision.opencvBasics]\r
    estimatedMinutes: 45\r
  "deepVision/02_ResNet분류":\r
    outcomes: [deepVision.classification]\r
    prerequisites: [deepVision.classification]\r
    estimatedMinutes: 55\r
  "deepVision/03_임베딩벡터":\r
    outcomes: [deepVision.classification]\r
    prerequisites: [deepVision.classification]\r
    estimatedMinutes: 50\r
  "deepVision/04_유사도검색":\r
    outcomes: [deepVision.classification]\r
    prerequisites: [deepVision.classification]\r
    estimatedMinutes: 50\r
  "deepVision/05_객체탐지":\r
    outcomes: [deepVision.detection]\r
    prerequisites: [deepVision.classification]\r
    estimatedMinutes: 60\r
  "deepVision/06_세그멘테이션":\r
    outcomes: [deepVision.detection]\r
    prerequisites: [deepVision.detection]\r
    estimatedMinutes: 60\r
  "deepVision/07_포즈추정":\r
    outcomes: [deepVision.detection]\r
    prerequisites: [deepVision.detection]\r
    estimatedMinutes: 55\r
  "deepVision/08_전이학습":\r
    outcomes: [deepVision.classification]\r
    prerequisites: [deepVision.classification, ml.intro]\r
    estimatedMinutes: 65\r
  "deepVision/09_모델비교":\r
    outcomes: [deepVision.classification]\r
    prerequisites: [deepVision.classification]\r
    estimatedMinutes: 50\r
  "deepVision/10_종합사진태깅기":
    outcomes: [deepVision.classification, deepVision.detection]
    prerequisites: [deepVision.detection]\r
    estimatedMinutes: 90\r
    lessonRole: project\r
\r
  # visionApps 트랙\r
  "visionApps/01_문서스캐너":\r
    outcomes: [visionApps.documents]\r
    prerequisites: [vision.opencvBasics, vision.filters]\r
    estimatedMinutes: 55\r
  "visionApps/02_QR바코드리더":\r
    outcomes: [visionApps.documents]\r
    prerequisites: [vision.opencvBasics]\r
    estimatedMinutes: 45\r
  "visionApps/03_OCR기초":\r
    outcomes: [visionApps.documents]\r
    prerequisites: [vision.opencvBasics]\r
    estimatedMinutes: 55\r
  "visionApps/04_한국어OCR":\r
    outcomes: [visionApps.documents]\r
    prerequisites: [visionApps.documents]\r
    estimatedMinutes: 50\r
  "visionApps/05_얼굴검출모자이크":\r
    outcomes: [visionApps.faceMedia]\r
    prerequisites: [vision.opencvBasics]\r
    estimatedMinutes: 55\r
  "visionApps/06_얼굴임베딩비교":\r
    outcomes: [visionApps.faceMedia]\r
    prerequisites: [visionApps.faceMedia]\r
    estimatedMinutes: 55\r
  "visionApps/07_이미지중복검출":\r
    outcomes: [visionApps.faceMedia]\r
    prerequisites: [visionApps.faceMedia]\r
    estimatedMinutes: 50\r
  "visionApps/08_영상자동썸네일":\r
    outcomes: [visionApps.faceMedia]\r
    prerequisites: [vision.video]\r
    estimatedMinutes: 50\r
  "visionApps/09_화면캡처분석":\r
    outcomes: [visionApps.faceMedia]\r
    prerequisites: [visionApps.faceMedia]\r
    estimatedMinutes: 55\r
  "visionApps/10_종합사진정리기":
    outcomes: [visionApps.documents, visionApps.faceMedia]
    prerequisites: [visionApps.faceMedia, visionApps.documents]\r
    estimatedMinutes: 90\r
    lessonRole: project\r
\r
  # advancedPython 트랙 - 나머지 백필\r
  "advancedPython/03_클로저와상태관리":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 45\r
  "advancedPython/06_메타클래스":\r
    outcomes: [python.designPatterns]\r
    prerequisites: [python.oop]\r
    estimatedMinutes: 60\r
  "advancedPython/07_디스크립터":\r
    outcomes: [python.designPatterns]\r
    prerequisites: [python.oop]\r
    estimatedMinutes: 55\r
  "advancedPython/08_추상클래스와프로토콜":\r
    outcomes: [python.designPatterns]\r
    prerequisites: [python.oop, python.typing]\r
    estimatedMinutes: 50\r
  "advancedPython/09_다중상속과MRO":\r
    outcomes: [python.oop]\r
    prerequisites: [python.oop]\r
    estimatedMinutes: 50\r
  "advancedPython/10_slots와메모리최적화":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.oop]\r
    estimatedMinutes: 40\r
  "advancedPython/13_collections심화":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 45\r
  "advancedPython/14_enum과상수관리":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.oop]\r
    estimatedMinutes: 35\r
  "advancedPython/15_typing고급":\r
    outcomes: [python.typing]\r
    prerequisites: [python.typing]\r
    estimatedMinutes: 50\r
  "advancedPython/16_재귀와분할정복":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.functions]\r
    estimatedMinutes: 50\r
  "advancedPython/17_정렬알고리즘":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 50\r
  "advancedPython/18_탐색알고리즘":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 45\r
  "advancedPython/19_동적프로그래밍":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 60\r
  "advancedPython/20_자료구조구현":\r
    outcomes: [python.oop, python.advancedSyntax]\r
    sectionOutcomes:\r
      stack: [python.oop]\r
      queue: [python.oop]\r
      linkedlist: [python.oop, python.advancedSyntax]\r
      binarytree: [python.oop]\r
      heap: [python.oop, python.advancedSyntax]\r
      hashtable: [python.oop, python.advancedSyntax]\r
      workflow_validation: [python.oop, python.advancedSyntax]\r
      practice: [python.oop, python.advancedSyntax]\r
    prerequisites: [python.oop]\r
    estimatedMinutes: 60\r
  "advancedPython/23_함수형패턴":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.functools]\r
    estimatedMinutes: 45\r
  "advancedPython/24_메타프로그래밍":\r
    outcomes: [python.designPatterns]\r
    prerequisites: [python.designPatterns]\r
    estimatedMinutes: 55\r
  "advancedPython/25_정규표현식고급":\r
    outcomes: [automation.regex]\r
    prerequisites: [automation.regex]\r
    estimatedMinutes: 50\r
  "advancedPython/26_코드최적화":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 45\r
  "advancedPython/27_문자열알고리즘":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.strings]\r
    estimatedMinutes: 50\r
  "advancedPython/28_수학알고리즘":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 50\r
  "advancedPython/29_클린코드":\r
    outcomes: [python.designPatterns]\r
    prerequisites: [python.functions, python.oop]\r
    estimatedMinutes: 45\r
  "advancedPython/30_종합문제풀이":
    outcomes: [python.advancedSyntax, python.designPatterns]
    prerequisites: [python.advancedSyntax, python.designPatterns]\r
    estimatedMinutes: 90\r
  "advancedPython/31_컨텍스트매니저":\r
    outcomes: [builtins.contextManagers]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 45\r
  "advancedPython/32_제너레이터심화":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 50\r
  "advancedPython/33_async와코루틴":\r
    outcomes: [builtins.async]\r
    prerequisites: [python.advancedSyntax]\r
    estimatedMinutes: 60\r
  "advancedPython/34_match와패턴매칭":\r
    outcomes: [python.advancedSyntax]\r
    prerequisites: [python.controlFlow]\r
    estimatedMinutes: 40\r
  "advancedPython/35_동시성":\r
    outcomes: [builtins.async]\r
    prerequisites: [builtins.async]\r
    estimatedMinutes: 60\r
    lessonRole: project\r
\r
  # folium 잔여\r
  "folium/03_도형그리기":\r
    outcomes: [viz.geoMaps]\r
    prerequisites: [viz.geoMaps]\r
    estimatedMinutes: 40\r
  "folium/04_지도스타일변경":\r
    outcomes: [viz.geoMaps]\r
    prerequisites: [viz.geoMaps]\r
    estimatedMinutes: 40\r
  "folium/05_레이어관리":\r
    outcomes: [viz.geoMaps]\r
    prerequisites: [viz.geoMaps]\r
    estimatedMinutes: 45\r
  "folium/06_GeoJSON활용":\r
    outcomes: [viz.geoMaps]\r
    prerequisites: [viz.geoMaps]\r
    estimatedMinutes: 45\r
  "folium/09_마커클러스터":\r
    outcomes: [viz.geoMaps]\r
    prerequisites: [viz.geoMaps]\r
    estimatedMinutes: 45\r
\r
  # altair 잔여\r
  "altair/03_팁데이터분석":\r
    outcomes: [viz.declarative]\r
    prerequisites: [viz.declarative]\r
    estimatedMinutes: 50\r
  "altair/04_펭귄서식지분석":\r
    outcomes: [viz.declarative]\r
    prerequisites: [viz.declarative]\r
    estimatedMinutes: 55\r
  "altair/05_타이타닉생존분석":\r
    outcomes: [viz.declarative]\r
    prerequisites: [viz.declarative]\r
    estimatedMinutes: 55\r
  "altair/06_항공편분석":\r
    outcomes: [viz.declarative]\r
    prerequisites: [viz.declarative, pandas.timeSeries]\r
    estimatedMinutes: 55\r
\r
  # playwright 잔여\r
  "playwright/05_네트워크모킹":\r
    outcomes: [automation.browser.testFlow]\r
    prerequisites: [automation.browser.formInput]\r
    estimatedMinutes: 50\r
  "playwright/07_페이지객체와재사용":\r
    outcomes: [automation.browser.testFlow]\r
    prerequisites: [automation.browser.formInput, python.oop]\r
    estimatedMinutes: 55\r
  "playwright/09_트레이스와디버깅":\r
    outcomes: [automation.browser.evidence]\r
    prerequisites: [automation.browser.evidence]\r
    estimatedMinutes: 50\r
  "playwright/10_종합브라우저점검프로젝트":
    outcomes: [automation.browser.audit]
    prerequisites: [automation.browser.testFlow, automation.browser.evidence]\r
    estimatedMinutes: 80\r
    lessonRole: project\r
\r
  # pandas 잔여\r
  "pandas/04_붓꽃품종분류":\r
    outcomes: [pandas.aggregate]\r
    prerequisites: [pandas.aggregate]\r
    estimatedMinutes: 55\r
  "pandas/07_다이아몬드가격분석":\r
    outcomes: [pandas.aggregate]\r
    prerequisites: [pandas.aggregate]\r
    estimatedMinutes: 55\r
  "pandas/08_교통사고원인분석":\r
    outcomes: [pandas.aggregate]\r
    prerequisites: [pandas.aggregate]\r
    estimatedMinutes: 55\r
\r
  # 기타\r
  "duckdb/00_MotherDuck소개":\r
    outcomes: [duckdb.intro]\r
    prerequisites: [duckdb.intro]\r
    estimatedMinutes: 30\r
  "practical/00_실전파이썬소개":
    outcomes: [python.practicalWorkflow]
    prerequisites: [python.functions]
    estimatedMinutes: 30

  # 개발 교양 트랙
  "devTools/commandLineIntro":
    outcomes: [devLiteracy.commandLine]
    prerequisites: []
    estimatedMinutes: 30
  "devTools/gitFirstSteps":
    outcomes: [devLiteracy.git, devLiteracy.gitBasics]
    prerequisites: [devLiteracy.commandLine]
    estimatedMinutes: 40
  "devTools/githubIntro":
    outcomes: [devLiteracy.github]
    prerequisites: [devLiteracy.gitBasics]
    estimatedMinutes: 35
\r
  # llmBasics 트랙\r
  "llmBasics/00_LLM통합소개":
    outcomes: [llm.intro]
    prerequisites: [python.functions, python.modulesAndIo]\r
    estimatedMinutes: 25\r
  "llmBasics/01_첫Claude호출":\r
    outcomes: [llm.intro]\r
    prerequisites: [python.functions, python.modulesAndIo]\r
    estimatedMinutes: 40\r
  "llmBasics/02_시스템프롬프트역할부여":\r
    outcomes: [llm.intro]\r
    prerequisites: [llm.intro]\r
    estimatedMinutes: 40\r
  "llmBasics/03_멀티턴대화만들기":\r
    outcomes: [llm.conversations]\r
    prerequisites: [llm.intro]\r
    estimatedMinutes: 45\r
  "llmBasics/04_토큰과비용추적":\r
    outcomes: [llm.conversations]\r
    prerequisites: [llm.conversations]\r
    estimatedMinutes: 40\r
  "llmBasics/05_스트리밍응답":\r
    outcomes: [llm.streaming]\r
    prerequisites: [llm.intro]\r
    estimatedMinutes: 50\r
  "llmBasics/06_JSON구조화출력":\r
    outcomes: [llm.structuredOutput]\r
    prerequisites: [llm.conversations, python.errorHandling]\r
    estimatedMinutes: 55\r
  "llmBasics/07_프롬프트캐싱":\r
    outcomes: [llm.caching]\r
    prerequisites: [llm.conversations]\r
    estimatedMinutes: 55\r
  "llmBasics/08_도구사용기초":\r
    outcomes: [llm.toolUse]\r
    prerequisites: [llm.structuredOutput]\r
    estimatedMinutes: 60\r
  "llmBasics/09_멀티도구라우팅":\r
    outcomes: [llm.toolUse]\r
    prerequisites: [llm.toolUse]\r
    estimatedMinutes: 60\r
  "llmBasics/10_데이터분석봇":
    outcomes: [llm.structuredOutput, llm.caching, llm.toolUse]
    prerequisites: [llm.toolUse, llm.caching, llm.structuredOutput]\r
    estimatedMinutes: 90\r
    lessonRole: project\r
\r
  # PDF 자동화 트랙
  "pdf/00_pdf소개":
    outcomes: [automation.pdf.intro]
    prerequisites: [python.functions, python.modulesAndIo]
    estimatedMinutes: 25
  "pdf/01_pdf열고페이지정보":
    outcomes: [automation.pdf.read]
    prerequisites: [automation.pdf.intro]
    estimatedMinutes: 40
  "pdf/02_pdf병합과분할":
    outcomes: [automation.pdf.merge]
    prerequisites: [automation.pdf.read]
    estimatedMinutes: 45
  "pdf/03_텍스트추출":
    outcomes: [automation.pdf.extract]
    prerequisites: [automation.pdf.read]
    estimatedMinutes: 45
  "pdf/04_표추출":
    outcomes: [automation.pdf.extract]
    prerequisites: [automation.pdf.read, pandas.intro]
    estimatedMinutes: 50
  "pdf/05_첫pdf생성":
    outcomes: [automation.pdf.create]
    prerequisites: [automation.pdf.intro]
    estimatedMinutes: 45
  "pdf/06_한글폰트와스타일":
    outcomes: [automation.pdf.create, automation.pdf.layout]
    prerequisites: [automation.pdf.create]
    estimatedMinutes: 50
  "pdf/07_표와이미지삽입":
    outcomes: [automation.pdf.layout]
    prerequisites: [automation.pdf.create]
    estimatedMinutes: 55
  "pdf/08_워터마크와암호화":
    outcomes: [automation.pdf.security]
    prerequisites: [automation.pdf.merge, automation.pdf.create]
    estimatedMinutes: 55
  "pdf/09_양식채우기":
    outcomes: [automation.pdf.forms]
    prerequisites: [automation.pdf.read, automation.pdf.create]
    estimatedMinutes: 55
  "pdf/10_월간청구서생성기":
    outcomes: [automation.pdf.report]
    prerequisites: [automation.pdf.layout, automation.pdf.security]
    estimatedMinutes: 90
    lessonRole: project

  # 이메일 자동화 트랙
  "email/00_email소개":
    outcomes: [automation.email.intro]
    prerequisites: [python.functions, python.modulesAndIo]
    estimatedMinutes: 25
  "email/01_첫메일발송":
    outcomes: [automation.email.send]
    prerequisites: [automation.email.intro]
    estimatedMinutes: 40
  "email/02_html과첨부":
    outcomes: [automation.email.attachments]
    prerequisites: [automation.email.send]
    estimatedMinutes: 50
  "email/03_다수수신자와개인화":
    outcomes: [automation.email.bulk]
    prerequisites: [automation.email.send, python.strings]
    estimatedMinutes: 55
  "email/04_표와차트삽입":
    outcomes: [automation.email.attachments]
    prerequisites: [automation.email.send, automation.email.attachments]
    estimatedMinutes: 55
  "email/05_imap으로받기":
    outcomes: [automation.email.receive]
    prerequisites: [automation.email.intro]
    estimatedMinutes: 55
  "email/06_첨부자동저장":
    outcomes: [automation.email.receive, automation.email.attachments]
    prerequisites: [automation.email.receive, builtins.fileSystem]
    estimatedMinutes: 50
  "email/07_규칙기반분류":
    outcomes: [automation.email.classify]
    prerequisites: [automation.email.receive, python.controlFlow]
    estimatedMinutes: 55
  "email/08_스크립트결과알림":
    outcomes: [automation.email.notify]
    prerequisites: [automation.email.send, python.errorHandling]
    estimatedMinutes: 50
  "email/09_안전한자격증명관리":
    outcomes: [automation.email.credentials]
    prerequisites: [automation.email.send, python.modulesAndIo]
    estimatedMinutes: 40
  "email/10_주간보고서발송기":
    outcomes: [automation.email.report]
    prerequisites: [automation.email.bulk, automation.email.notify, automation.email.credentials]
    estimatedMinutes: 90
    lessonRole: project

  # Word 자동화 트랙
  "word/00_word소개":
    outcomes: [automation.word.intro]
    prerequisites: [python.functions, python.modulesAndIo]
    estimatedMinutes: 25
  "word/01_첫문서만들기":
    outcomes: [automation.word.paragraphs]
    prerequisites: [automation.word.intro]
    estimatedMinutes: 40
  "word/02_제목과목록":
    outcomes: [automation.word.paragraphs]
    prerequisites: [automation.word.paragraphs]
    estimatedMinutes: 45
  "word/03_텍스트스타일링":
    outcomes: [automation.word.runs]
    prerequisites: [automation.word.paragraphs]
    estimatedMinutes: 45
  "word/04_표만들기":
    outcomes: [automation.word.tables]
    prerequisites: [automation.word.paragraphs]
    estimatedMinutes: 50
  "word/05_이미지와머리말":
    outcomes: [automation.word.media]
    prerequisites: [automation.word.paragraphs]
    estimatedMinutes: 50
  "word/06_스타일과페이지설정":
    outcomes: [automation.word.styles]
    prerequisites: [automation.word.runs]
    estimatedMinutes: 50
  "word/07_기존문서수정":
    outcomes: [automation.word.edit]
    prerequisites: [automation.word.paragraphs, automation.word.runs]
    estimatedMinutes: 50
  "word/08_mailmerge_csv기반":
    outcomes: [automation.word.mailMerge]
    prerequisites: [automation.word.tables, pandas.loadFrame]
    estimatedMinutes: 60
  "word/09_docxtpl템플릿엔진":
    outcomes: [automation.word.template]
    prerequisites: [automation.word.edit, python.strings]
    estimatedMinutes: 60
  "word/10_회의록자동생성기":
    outcomes: [automation.word.report]
    prerequisites: [automation.word.tables, automation.word.media, automation.word.styles, automation.word.template]
    estimatedMinutes: 90
    lessonRole: project

  # Web API 자동화 트랙
  "requests/00_requests소개":
    outcomes: [automation.webApi.intro]
    prerequisites: [python.functions, python.modulesAndIo]
    estimatedMinutes: 25
  "requests/01_첫GET요청":
    outcomes: [automation.webApi.get]
    prerequisites: [automation.webApi.intro]
    estimatedMinutes: 40
  "requests/11_사업자등록상태조회":
    outcomes: [automation.webApi.businessStatus]
    prerequisites: [automation.webApi.get, python.errorHandling]
    estimatedMinutes: 65
  "requests/12_공휴일영업일계산":
    outcomes: [automation.webApi.businessDays]
    prerequisites: [automation.webApi.get, builtins.datetime]
    estimatedMinutes: 65
  "requests/13_환율조회환산":
    outcomes: [automation.webApi.exchangeRate]
    prerequisites: [automation.webApi.get, builtins.numericMath]
    estimatedMinutes: 65
\r
  # openpyxl 트랙 - 파일 기반 엑셀 자동화\r
  "openpyxl/00_openpyxl소개":\r
    outcomes: [automation.excel.intro]\r
    prerequisites: [python.functions, python.modulesAndIo]\r
    estimatedMinutes: 25\r
  "openpyxl/01_워크북과시트만들기":\r
    outcomes: [automation.excel.intro, automation.excel.workbook]\r
    prerequisites: [automation.excel.intro]\r
    estimatedMinutes: 40\r
    sectionOutcomes:\r
      step1_create_workbook: [automation.excel.intro]\r
      step2_add_sheets: [automation.excel.workbook]\r
      step3_remove_sheet: [automation.excel.workbook]\r
      step4_save_and_load: [automation.excel.workbook]\r
      step5_default_sheet_pitfall: [automation.excel.intro]\r
      validation: [automation.excel.workbook]\r
  "openpyxl/02_셀읽기와쓰기":\r
    outcomes: [automation.excel.workbook]\r
    prerequisites: [automation.excel.workbook]\r
    estimatedMinutes: 45\r
  "openpyxl/03_범위와다중시트":\r
    outcomes: [automation.excel.workbook]\r
    prerequisites: [automation.excel.workbook]\r
    estimatedMinutes: 50\r
  "openpyxl/04_수식과이름영역":\r
    outcomes: [automation.excel.formulas]\r
    prerequisites: [automation.excel.workbook]\r
    estimatedMinutes: 55\r
  "openpyxl/05_셀서식과숫자포맷":\r
    outcomes: [automation.excel.styles]\r
    prerequisites: [automation.excel.workbook]\r
    estimatedMinutes: 55\r
  "openpyxl/06_조건부서식":\r
    outcomes: [automation.excel.conditional]\r
    prerequisites: [automation.excel.styles]\r
    estimatedMinutes: 55\r
  "openpyxl/07_차트삽입":\r
    outcomes: [automation.excel.charts]\r
    prerequisites: [automation.excel.workbook]\r
    estimatedMinutes: 60\r
  "openpyxl/08_이미지와하이퍼링크":\r
    outcomes: [automation.excel.images]\r
    prerequisites: [automation.excel.workbook]\r
    estimatedMinutes: 50\r
  "openpyxl/09_표와데이터검증":\r
    outcomes: [automation.excel.tables]\r
    prerequisites: [automation.excel.workbook]\r
    estimatedMinutes: 55\r
  "openpyxl/10_월간매출리포트생성기":\r
    outcomes: [automation.excel.report]\r
    prerequisites:\r
      - automation.excel.workbook\r
      - automation.excel.formulas\r
      - automation.excel.styles\r
      - automation.excel.conditional\r
      - automation.excel.charts\r
      - automation.excel.tables
    estimatedMinutes: 90
    lessonRole: project
`;export{e as default};