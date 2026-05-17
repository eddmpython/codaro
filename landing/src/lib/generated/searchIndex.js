export const searchEntries = [
  {
    "kind": "blog",
    "title": "What Codaro is actually building",
    "description": "A public overview of Codaro as an interactive editor runtime for code, learning, and automation.",
    "url": "/codaro/blog/what-is-codaro",
    "text": "Codaro is not just another notebook clone Codaro is building a runtime surface where code, guided learning, and automation share one model. The local editor is only one part of the product. The public site explains the concepts, design choices, and workflow decisions behind that runtime. Three layers 1. A document model that can host code, text, and workflow blocks 2. An execution runtime that can run locally or in browser oriented environments 3. A public knowledge surface for docs, changelog style writing, and product reasoning Why keep the public site separate The editor must stay focused on execution and interaction. The public site has different constraints: static delivery SEO friendly docs and blog stable GitHub Pages deployment searchable product writing That is why Codaro keeps separate from the local editor . Public docs are part of the product The public site is not an afterthought. It becomes the surface for: installation guides concept explanations reference pages blog posts that explain runtime decisions Public writing should stay close to the repo Codaro stores blog posts under the root folder and public docs under the root folder. The Svelte public site reads those sources directly at build time. That keeps writing close to the codebase while still producing a static site.",
    "category": "product-and-runtime"
  },
  {
    "kind": "docs",
    "title": "Branding assets",
    "description": "Brand asset rules for Codaro avatars, favicon files, and public site usage.",
    "url": "/codaro/docs/branding",
    "text": "Codaro Branding Guide 현재 결정 마스코트 원본은 실제 서비스 반영 파일은 public site 반영 파일은 GitHub에 같이 올려서 브랜딩 자산도 저장소 이력으로 관리한다 마스코트 적용 기준 아바타 얼굴 중심 정사각 크롭 눈과 입이 살아 있어야 한다 파비콘 얼굴 전체나 책 전체를 그대로 축소하지 않는다 머리 실루엣, 새싹, 눈 같은 핵심 요소만 남긴 단순 버전이 맞다 앱 아이콘 파비콘보다 디테일을 조금 더 허용한다 128, 180, 512 기준으로 따로 검토한다 추천 작업 순서 1. 원본 이미지 사용권 확인 2. 에 원본 저장 3. 에서 아바타용 크롭과 파비콘용 단순화 시안 제작 4. 확정본만 , 로 export 5. 파비콘과 헤더 아바타에 적용",
    "category": "branding"
  },
  {
    "kind": "docs",
    "title": "브랜딩 + 프론트 톤",
    "description": "Branding rules for Codaro identity, assets, and product language.",
    "url": "/codaro/docs/skills/ops/branding",
    "text": "브랜딩 원칙 Codaro는 다른 노트북의 \"대체재\"로 소개하지 않는다. 설명 기준: programmable studio interactive editor runtime code, learning, automation 다른 앱이 올라가는 기반 레이어로 보이게 설계한다. 프론트/브랜드 확정 규칙 Codaro 제품 UI 언어는 영어만 사용한다. index, editor, app mode, docs, blog 모두 영어 기준이다. 모든 공용 컴포넌트 톤은 계열을 기본으로 한다. 공용 UI는 패턴을 기본으로 사용한다. 기본 avatar와 favicon source는 의 첫 번째 왼쪽 pose다. pose sheet source는 , 다. 아바타는 항상 배경 제거 후 캐릭터만 사용한다. 브랜드 자산 경로 source of truth는 다. 색상/반지름/그림자 source of truth는 다. GitHub Pages는 Svelte로 운영한다. 문서와 블로그도 같은 Svelte 기반, 같은 브랜드 톤으로 운영한다.",
    "category": "branding"
  },
  {
    "kind": "docs",
    "title": "Block model",
    "description": "Codaro treats the document as a block-oriented runtime surface rather than a notebook-only clone.",
    "url": "/codaro/docs/concepts/block-model",
    "text": "Block model Codaro keeps notebook compatibility, but its internal direction is block oriented. Initial block candidates: code text guide widget view file This keeps the runtime extensible beyond classic notebook cells.",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "Execution runtime",
    "description": "The runtime layer separates the editor surface from engine-specific execution details.",
    "url": "/codaro/docs/concepts/execution-runtime",
    "text": "Execution runtime The editor talks to a capability surface rather than a single concrete engine. Core capabilities include: execute interrupt variables files packages docs That separation is required for local, browser, and future sandbox execution backends.",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "실행 모델 — 투명 스코프 격리",
    "description": "Python-native scope isolation principles for Codaro block execution.",
    "url": "/codaro/docs/skills/identity/transparent-scope-isolation",
    "text": "실행 모델: 투명 스코프 격리 사용자는 그냥 Python을 쓴다 . 함수 래핑 없음, return 없음, 보일러플레이트 없음. 엔진이 내부에서 셀마다 격리된 네임스페이스로 실행한다. AST 분석으로 각 셀이 정의하는 변수(defines)와 사용하는 변수(uses)를 자동 추론한다. 셀 실행 시 해당 셀이 사용하는 변수만 레지스트리에서 주입한다. 셀이 삭제되면 그 셀이 정의한 변수도 레지스트리에서 사라진다. Jupyter의 편리함 + 리액티브 안전성 , 사용자에게 보이지 않는 곳에서. 관련 [[reactive execution]] — 변수 변경의 하위 셀 전파 [[percent format]] — 셀 경계 정의",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "리액티브 실행",
    "description": "Reactive execution rules for dependency-aware notebook reruns.",
    "url": "/codaro/docs/skills/identity/reactive-execution",
    "text": "리액티브 실행 셀 하나를 실행하면, 그 셀의 변수에 의존하는 하위 셀이 자동으로 재실행 된다. 의존 관계는 AST 분석 기반 (명시적 선언 불필요). 에러 발생 시 전파 중단. 실행 순서는 문서 순서를 따른다 (의존 관계 내에서). 관련 [[transparent scope isolation]] — 변수 정의/사용 추론 [[execution engine]] — 엔진 인터페이스",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "파일 포맷 — Percent Format (.py)",
    "description": "Percent-format notebook conventions that keep files executable as Python.",
    "url": "/codaro/docs/skills/identity/percent-format",
    "text": "파일 포맷: Percent Format (.py) Codaro의 기본 저장 포맷은 Percent Format이다. , 주석이 셀 경계를 구분한다. 코드는 모듈 레벨 (들여쓰기 0칸). 함수로 감싸지 않는다. 로 그대로 실행 가능하다. VS Code, Spyder, Jupytext가 동일한 포맷을 인식한다. reactive app/ipynb 호환 import/export는 유지한다. 관련 [[document model]] — 블록 중심 내부 모델 [[transparent scope isolation]] — 셀이 모듈 레벨에서 실행되는 의미",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "실행 환경 — Pyodide 기본, 로컬 확장",
    "description": "Runtime policy for Pyodide-first execution with optional local expansion.",
    "url": "/codaro/docs/skills/identity/pyodide-first-runtime",
    "text": "실행 환경: Pyodide 기본, 로컬 확장 Pyodide(브라우저)가 기본 실행 플랫폼 이다. 모든 학습 콘텐츠가 Pyodide에서 동작한다. 로컬(서버 커널)은 Pyodide의 모든 것 + 추가 자동화 를 제공한다. 실제 파일 I/O, 패키지 자동 설치, DB 연결, 무거운 ML, 로컬 AI(Ollama). 프론트엔드는 서버 커널 우선 → Pyodide 폴백으로 동작한다. 편집기 코드가 실행 엔진의 구현을 직접 알지 않는다. 관련 [[execution engine]] — 교체 가능한 엔진 인터페이스 [[mounting and integration]] — createServerApp 마운팅",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "학습 시스템 3기둥",
    "description": "Notebook, curriculum, and learning philosophy pillars for Codaro education.",
    "url": "/codaro/docs/skills/identity/learning-three-pillars",
    "text": "학습 시스템 3기둥 기둥 1: 노트북 기능 — 학습의 실행 환경. 셀 편집/실행/리액티브/분할/병합. 기둥 2: 뼈대 커리큘럼 — YAML 기반 130+ 레슨. 카테고리/레슨/미션/진행 추적. 기둥 3: 학습 사상 — 코드로 정의된 교육 철학. AI도 사람도 이 사상을 따른다. 최소 설명, 최대 실행 빈칸부터 시작 (빈 셀이 아니라 거의 완성된 코드에서 빈칸 채우기) 예측 → 검증 (먼저 예측하게 하고 실행으로 확인) 오류는 학습 (일부러 버그가 있는 코드를 주고 고치게 한다) 점진적 빌드 (한 셀에 한 개념, 쌓아가며 완성) 수정 실험 (\"이 값을 바꿔보세요\") 3단계 힌트 (개념 → 구조 → 정답, 바로 답을 주지 않는다) 즉시 피드백 (맞았는지 1초 안에) 반복 변주 (같은 개념을 다른 상황에서) 실제 맥락 (추상적 예제가 아니라 현실 상황) 관련 [[ai integration]] — AI가 같은 사상으로 가르친다 [[multi editor modes]] — 학습 에디터 모드",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "AI 통합 원칙",
    "description": "Optional teacher integration rules that keep assistance transparent and inspectable.",
    "url": "/codaro/docs/skills/identity/ai-integration",
    "text": "AI 통합 원칙 AI 없이도 모든 학습이 완전히 동작 한다. AI는 선택적 확장이다. AI가 붙으면 편집기의 기존 API를 도구(tool use)로 사용 해서 가르친다. : 설명/예시/힌트 셀 삽입 : 학생 코드 실행 후 결과 검증 : 변수 상태 확인 : 피드백 추가 , : 교육 환경 자동 설정 AI는 에서 학습 사상을 읽고 동일한 철학으로 가르친다. 커리큘럼에 없는 주제도 같은 사상(빈칸→수정→작성, 3단계 힌트, 즉시 피드백)으로 생성한다. AI Provider는 교체 가능: GPT(OAuth), Ollama(로컬), Claude, 또는 없음. 관련 [[learning three pillars]] — 학습 사상 SSOT [[ai sensory system]] — AI에게 눈/귀/손을 주는 별도 축 [[ai transparency]] — AI 실제 본 데이터 노출 원칙",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "마운팅과 통합",
    "description": "Mounting and integration principles for apps, APIs, and GUI flows.",
    "url": "/codaro/docs/skills/identity/mounting-and-integration",
    "text": "마운팅과 통합 은 독립 실행 가능하면서 동시에 다른 서버에 마운팅 가능하다. FastAPI: Django: ASGI 라우팅 분기 Flask: WSGIMiddleware 래핑 프론트엔드는 태그에서 root path를 자동 감지한다. GUI에서 되는 모든 것은 API로도 된다 (시스템적 수정 가능). 관련 [[execution engine]] — 엔진 추상화 [[architecture overview]] — transport 레이어",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "자동화 + 태스크 + 리포트",
    "description": "Automation, task, and report concepts for Codaro workflows.",
    "url": "/codaro/docs/skills/identity/automation-tasks-reports",
    "text": "자동화 + 태스크 + 리포트 사용자가 작성하거나 AI가 생성한 Python 문서(.py)는 그 자체가 실행 가능한 태스크 가 된다. 태스크는 스케줄(@every 5m, @daily 등)에 자동 실행되거나, 웹훅으로 외부 트리거되거나, 수동 실행할 수 있다. 여러 태스크를 의존성(DAG)으로 묶은 워크플로우 가 가능하다. 모든 자동화 액션은 감사 로그 (audit trail, JSONL)에 기록된다. 태스크 실행 결과(변수, stdout, 에러)는 리포트로 조회 가능하다. 비상 정지(E Stop) 가 모든 자동화를 즉시 중단시킨다. 관련 [[external channels mobile]] — Webhook/Slack 트리거 [[multi editor modes]] — 리포트 뷰어 모드 [[percent format]] — .py가 곧 태스크",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "다중 에디터 모드",
    "description": "Multi-editor mode principles for notebook, app, and automation surfaces.",
    "url": "/codaro/docs/skills/identity/multi-editor-modes",
    "text": "다중 에디터 모드 Codaro는 하나의 런타임 위에 여러 얼굴 을 가진다. 코드 에디터 : 셀 편집 + 실행 + 리액티브 데이터플로우. 개발자의 작업 공간. 학습 에디터 : 커리큘럼 브라우저 + 가이드 카드 + 퀴즈 + 성취 추적. 학습자의 교실. 리포트/앱 에디터 : 코드는 숨기고 출력만 표시. 대시보드, 프레젠테이션, 자동화 결과 뷰어. 세 모드 모두 같은 문서 모델, 같은 실행 엔진, 같은 API 위에서 동작한다. 사용자는 대화로 학습 → 에디터에서 코드 작성 → 태스크로 등록 → 스케줄 자동 실행 → 결과 리포트 확인의 연속 워크플로우 를 가진다. 관련 [[learning three pillars]] — 학습 모드의 콘텐츠 [[automation tasks reports]] — 리포트 모드의 데이터 [[widget bridge]] — 모드별 위젯 렌더링",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "AI 감각계 — 눈, 귀, 손",
    "description": "Vision, hearing, and action channel concepts for assisted workflows.",
    "url": "/codaro/docs/skills/identity/ai-sensory-system",
    "text": "AI 감각계 — 눈, 귀, 손 AI에게 데스크톱을 보고, 듣고, 조작할 수 있는 능력을 준다. 눈(Vision) : OpenCV + dxcam/mss 화면 캡처, PaddleOCR/EasyOCR 텍스트 인식, 템플릿 매칭/윤곽선 분석 요소 탐지. 귀(Voice) : Whisper 음성 인식 → CommandParser로 구조화된 명령 변환. 손(Input) : PyAutoGUI/DirectInput/Accessibility API로 마우스 클릭, 키보드 입력, 드래그, 핫키. InputGuard가 속도/영역 제한으로 안전 보장. 녹화 → 코드 : 사용자의 동작을 녹화 → 실행 가능한 Python 코드(Percent Format)로 자동 생성. 자동화 루프 : 다단계 액션 + 검증(화면 텍스트 확인) + 재시도 + 상태 머신. 이 모든 감각은 AI tool use로 노출되어 AI가 \"보고 → 판단하고 → 행동하는\" 에이전트로 동작한다. xlwings 같은 도메인 특화 라이브러리로 Excel/Office 자동화도 같은 구조에 탑재 가능. 관련 [[ai integration]] — tool use 표면 [[automation tasks reports]] — 감각계로 만든 .py가 곧 태스크",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "외부 채널 + 모바일 조작",
    "description": "External channel and mobile principles for future Codaro access patterns.",
    "url": "/codaro/docs/skills/identity/external-channels-mobile",
    "text": "외부 채널 + 모바일 조작 Codaro는 사용자가 항상 데스크톱 앞에 있지 않아도 동작한다. MessageBridge : Slack, Discord, 커스텀 Webhook으로 태스크 결과/알림 전송. Webhook 트리거 : 외부에서 HTTP 호출로 태스크를 실행 가능. 사용자는 폰에서 Slack/Discord 알림을 받고, 웹훅으로 태스크를 트리거하고, 결과를 확인할 수 있다. 향후 모바일 반응형 UI + PWA로 직접 에디터 접근도 가능. Codaro가 로컬 머신에서 돌면서 외부 세계와 양방향 소통하는 개인 자동화 허브 역할. 관련 [[automation tasks reports]] — 트리거되는 태스크 정의 [[mounting and integration]] — 외부 HTTP surface",
    "category": "concepts"
  },
  {
    "kind": "docs",
    "title": "Installation",
    "description": "Install Codaro, start the local server, and understand the public site split.",
    "url": "/codaro/docs/getting-started/installation",
    "text": "Installation Codaro currently has a developer install path and a product install direction. Product install direction The long term product path is a managed launcher: embedded Python runtime managed backend wheel install managed editor assets automatic update and rollback Developer install Today, local development uses for Python environment and execution. Requirements Python 3.12 or newer Node.js for the Svelte public site and local editor frontends Core commands If you are iterating on the editor, keep the same runtime model and rebuild into : Public site The public site lives in . Use:",
    "category": "getting-started"
  },
  {
    "kind": "docs",
    "title": "First notebook",
    "description": "Open the local editor surface and understand the difference between the editor and the public site.",
    "url": "/codaro/docs/getting-started/first-notebook",
    "text": "First notebook Start the local server with: The public site and the local editor are separate surfaces. builds a static public site serves the editor runtime That split keeps public docs and interactive editing independent.",
    "category": "getting-started"
  },
  {
    "kind": "docs",
    "title": "Codaro Skills",
    "description": "Codaro project rules and shared skill documents for humans and maintainers.",
    "url": "/codaro/docs/skills",
    "text": "Codaro Skills Codaro의 사람 + AI 공용 SSOT. 한 마크다운 파일이 두 청중을 동시에 섬긴다 — 사람은 직접 읽고, AI는 같은 파일을 컨텍스트로 받는다. 각 스킬은 5필드 frontmatter를 가진다: Identity (11) — 절대 흔들리지 않는 사상 Architecture (5) — 5층 구조 Ops (9) — 운영 규칙 후속 (PR 2 이후) — 기존 src/codaro/ /DEV.md 본문 이관 — launcher/PRD.md 530줄 분할",
    "category": "getting-started"
  },
  {
    "kind": "docs",
    "title": "Local server",
    "description": "Run the local FastAPI server for the editor without mixing it with the public site build.",
    "url": "/codaro/docs/guides/local-server",
    "text": "Local server Use the local server when you want the editor surface: That server is separate from the GitHub Pages build. local editor: + public site:",
    "category": "guides"
  },
  {
    "kind": "docs",
    "title": "실행 환경 + 인코딩",
    "description": "Environment requirements for Python, uv, and local execution.",
    "url": "/codaro/docs/skills/ops/environment",
    "text": "실행 환경 규칙 PowerShell 메인 가상환경은 프로젝트 루트 를 사용한다. WSL에서는 루트 를 공유하지 않는다. WSL 전용 가상환경이 필요하면 을 사용한다. 실행 인코딩 규칙 Python 실행은 기본적으로 형태를 사용한다. PowerShell에서 인코딩이 의심되면 실행 전에 아래를 적용한다. 파일 읽기/쓰기 명령은 가능한 한 UTF 8을 명시한다. 모든 텍스트 파일은 UTF 8을 기본으로 유지한다.",
    "category": "guides"
  },
  {
    "kind": "docs",
    "title": "코드 품질 원칙",
    "description": "Code quality rules for naming, exceptions, and maintainable changes.",
    "url": "/codaro/docs/skills/ops/code-quality",
    "text": "코드 품질 원칙 파일/폴더/함수/변수는 , 클래스는 , 상수는 를 사용한다. 파일 삭제는 금지하고, 정리가 필요하면 으로 이동하는 방식을 우선한다. 인라인 주석은 넣지 않는다. bare except ( ) 절대 금지 는 금지. 로깅 없는 삼킴은 허용하지 않는다. 사용 시 반드시: (1) 예외 변수 바인딩 ( ), (2) 최소 logger.debug 이상 로깅, (3) 좁힐 수 없는 사유가 명확해야 한다. 예외 타입은 가능한 한 좁힌다 (json.JSONDecodeError, OSError 등 구체 타입 우선). try except를 if else 대용으로 쓰지 않는다. asyncio.create task()에는 done callback을 붙여 예외를 수면 위로 올린다. dispose/cleanup 패턴은 를 사용한다. raise 시 원본 예외 체인을 유지한다 ( ). 사용자 입력 검증은 가능하면 early return으로 처리한다. ruff 린트 규칙 BLE001, S110, S112, TRY400이 pyproject.toml에 설정되어 있다. 정당한 면제는 주석으로 처리한다. 초기 단계일수록 \"대충 동작\"보다 \"계층이 맞는가\"를 우선한다.",
    "category": "guides"
  },
  {
    "kind": "docs",
    "title": "AI 투명성 원칙",
    "description": "Transparency rules for assisted teaching and tool-visible work.",
    "url": "/codaro/docs/skills/ops/ai-transparency",
    "text": "AI 투명성 원칙 Codaro에 AI 기능을 붙일 때, 모델이 실제로 본 데이터는 UI에서 사용자에게 드러나야 한다. 시스템이 제공한 컨텍스트, 시스템 프롬프트, tool 호출과 결과는 숨기지 않는다. AI 표현을 바꾸려면 UI 임시 가공보다 원천 데이터 계층 개선을 우선한다. 소비자 계층은 원천 데이터를 읽기만 하고, 표시용 이름/정렬/단위를 임의로 재정의하지 않는다. 관련 [[ai integration]] — tool use surface [[ai sensory system]] — 감각계 출력도 동일 원칙",
    "category": "guides"
  },
  {
    "kind": "docs",
    "title": "실험 규칙",
    "description": "Experiment policy for prototypes, validation, and production boundaries.",
    "url": "/codaro/docs/skills/ops/experiment",
    "text": "실험 규칙 실험은 반드시 아래에서만 한다. 실험 먼저 진행하고, 로직이 굳기 전에는 패키지 코드로 바로 들어가지 않는다. 실험별 하위 폴더를 분리한다. 예: 각 실험 폴더에는 를 둔다. 파일명은 숫자 접두사를 붙인다. 예: 실패한 실험도 지우지 말고 결론을 남긴다.",
    "category": "guides"
  },
  {
    "kind": "docs",
    "title": "Git + 릴리즈 원칙",
    "description": "Git, commit, and release rules for Codaro changes.",
    "url": "/codaro/docs/skills/ops/git-and-release",
    "text": "Git 및 릴리즈 원칙 커밋, 주석, 문서 어디에도 AI 생성 흔적 문구를 남기지 않는다. 커밋 메시지와 커밋 본문에도 , , , , , 같은 흔적을 남기지 않는다. GitHub 원격 작업은 사용을 허용한다. 기본 원격 저장소는 이다. 릴리즈 시 에 변경 내용을 상세하게 기록한다. 배포는 GitHub Actions trusted publishing 기준을 유지한다. 버전 릴리즈는 흐름을 기준으로 한다.",
    "category": "guides"
  },
  {
    "kind": "docs",
    "title": "로컬 배포 bundle 원칙",
    "description": "Packaging rules for local distribution and bundled assets.",
    "url": "/codaro/docs/skills/ops/packaging",
    "text": "로컬 배포 bundle 원칙 최종 사용자 배포는 하나를 기준으로 한다. launcher는 embedded Python runtime과 manifest가 지정한 exact wheel 기반 curated bundle만 설치한다. launcher는 index에서 arbitrary latest package를 해석하거나 무제한 경로를 제품 기본으로 삼지 않는다. 같은 automation bundle은 Python package, helper runtime, capability probe, bootstrap을 launcher가 관리한다. 외부 앱과 드라이버 의존성은 별도 경계로 둔다. 예: 기반 Excel app automation은 launcher가 Python 쪽 의존성과 bootstrap을 관리하지만, Microsoft Excel 자체는 사용자가 설치해야 한다. 세부 배포 설계의 source of truth는 , 다.",
    "category": "guides"
  },
  {
    "kind": "docs",
    "title": "문서 유지보수 + 세션 이어가기",
    "description": "Documentation and session rules for keeping project context aligned.",
    "url": "/codaro/docs/skills/ops/doc-and-session",
    "text": "문서 유지보수 원칙 세션 시작 시 와 실제 코드 구조를 대조하고, 낡은 내용이 있으면 즉시 갱신한다. 파일/폴더 추가, 삭제, 이동이 있으면 관련 경로와 구조 설명을 함께 갱신한다. 삭제된 기능이나 파일에 대한 죽은 참조를 남기지 않는다. 세션 이어가기 원칙 세션이 끝나도 다음 세션이 채팅 없이 바로 이어갈 수 있게 현재 결정, 진행 상태, 다음 액션, 남은 검증을 반드시 저장소 문서에 남긴다. 중간 상태의 TODO, blocker, diff는 채팅이 아니라 관련 기능 문서의 체크리스트로 남긴다. 작업이 여러 세션에 걸리면 가장 가까운 (또는 해당 모듈의 SKILL 파일)에 최소한 , , 를 갱신한다. 다음 세션은 먼저 프로젝트 메모리, 그다음 관련 기능 문서, 마지막으로 직전 수정 파일을 읽고 시작한다. 채팅 기록만 믿고 이어가지 않는다. 설계 결정과 남은 작업은 반드시 저장소 안 문서로 고정한다. 코드 변경이 있었는데 문서가 업데이트되지 않았다면 세션 종료 전에 문서를 먼저 맞춘다. 와 동기화 검사는 로 수행한다.",
    "category": "guides"
  },
  {
    "kind": "docs",
    "title": "참고 구현 사용 원칙",
    "description": "Reference implementation rules for borrowing patterns without coupling.",
    "url": "/codaro/docs/skills/ops/reference-impl",
    "text": "참고 구현 사용 원칙 참고 경로: 우선 참고할 영역: 그대로 복제하지 않는다. 먼저 메커니즘을 해부하고, Codaro 목적에 맞는 계층으로 재설계한 뒤 가져온다.",
    "category": "guides"
  },
  {
    "kind": "docs",
    "title": "CLI reference",
    "description": "Commands for editor launch, app mode, export, and test execution.",
    "url": "/codaro/docs/reference/cli",
    "text": "CLI reference Main commands Tests",
    "category": "reference"
  },
  {
    "kind": "docs",
    "title": "아키텍처 방향 — 5층 구조",
    "description": "Five-layer architecture overview for the Codaro runtime.",
    "url": "/codaro/docs/skills/architecture/overview",
    "text": "아키텍처 방향 1차 목표는 의 독립이다. 구조는 아래 5층을 기본으로 본다. UI가 실행기 구현 세부사항에 직접 묶이면 안 된다. 웹, 모바일, 로컬은 가능한 한 같은 문서 모델과 같은 실행 인터페이스를 공유해야 한다. 폴더 매핑 (PR 3~4 후 목표 상태) 관련 [[document model]] [[execution engine]] [[dataflow]] [[widget bridge]]",
    "category": "reference"
  },
  {
    "kind": "docs",
    "title": "문서 모델 원칙",
    "description": "Document model boundaries for cells, files, and notebook state.",
    "url": "/codaro/docs/skills/architecture/document-model",
    "text": "문서 모델 원칙 Codaro는 장기적으로 보다 중심 모델로 간다. 최소 블록 후보: 노트북 포맷 호환은 중요하지만, 내부 모델은 외부 노트북 포맷에 종속되지 않는다. 관련 [[percent format]] — 기본 직렬화 포맷 [[execution engine]] — 블록 실행 인터페이스",
    "category": "reference"
  },
  {
    "kind": "docs",
    "title": "실행 엔진 원칙",
    "description": "Execution engine responsibilities for kernels, runtimes, and reruns.",
    "url": "/codaro/docs/skills/architecture/execution-engine",
    "text": "실행 엔진 원칙 실행 엔진은 교체 가능한 인터페이스로 설계한다. 기본 후보: 편집기는 , , , , , 같은 capability를 호출하고, 개별 엔진 구현을 직접 알지 않아야 한다. 관련 [[pyodide first runtime]] — Pyodide 기본, 로컬 슈퍼셋 [[reactive execution]] — 의존 그래프 위에서 동작",
    "category": "reference"
  },
  {
    "kind": "docs",
    "title": "데이터흐름 원칙",
    "description": "Dataflow rules for block dependency graphs and variable lineage.",
    "url": "/codaro/docs/skills/architecture/dataflow",
    "text": "데이터흐름 원칙 Codaro는 단순 코드 편집기가 아니라 상태를 가진 편집기다. 따라서 아래를 초기에 고려한다. block dependency graph variable lineage rerun scope side effect boundary \"어느 블록을 다시 실행해야 하는가\"를 계산할 수 있어야 한다. 관련 [[reactive execution]] — 자동 재실행 의미론 [[transparent scope isolation]] — 변수 정의/사용 추론",
    "category": "reference"
  },
  {
    "kind": "docs",
    "title": "위젯/뷰 브리지 원칙",
    "description": "Widget bridge expectations for connecting runtime state to views.",
    "url": "/codaro/docs/skills/architecture/widget-bridge",
    "text": "위젯/뷰 브리지 원칙 Python 코드가 UI descriptor를 만들고, 프론트가 이를 렌더링하는 구조를 기본으로 한다. 위젯은 부가 기능이 아니라 Codaro의 핵심 메커니즘이다. 즉, Codaro는 \"코드가 인터페이스가 되는 편집기\"를 지향한다. 관련 [[multi editor modes]] — 모드별 위젯 표시 [[document model]] — widget/view 블록 타입",
    "category": "reference"
  }
];
