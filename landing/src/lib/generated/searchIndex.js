export const searchEntries = [
  {
    "kind": "writing",
    "title": "What Codaro is actually building",
    "description": "A public overview of Codaro as an interactive editor runtime for code, learning, and automation.",
    "url": "/codaro/docs/blog/what-is-codaro",
    "text": "Codaro is not just another notebook clone Codaro is building a runtime surface where code, guided learning, and automation share one model. The local editor is only one part of the product. The public site explains the concepts, design choices, and workflow decisions behind that runtime. Three layers 1. A document model that can host code, text, and workflow blocks 2. An execution runtime that can run locally or in browser oriented environments 3. A docs based public knowledge surface for guides, changelog style writing, and product reasoning Why keep the public site separate The editor must stay focused on execution and interaction. The public site has different constraints: static delivery SEO friendly docs and writing stable GitHub Pages deployment searchable product writing That is why Codaro keeps separate from the local editor . Public docs are part of the product The public site is not an afterthought. It becomes the surface for: installation guides concept explanations reference pages writing that explains runtime decisions Public writing should stay close to the repo Codaro stores public docs, operating notes, and writing under the root folder. The Svelte public site reads those sources directly at build time. That keeps writing close to the codebase while still producing a static site.",
    "category": "product-and-runtime"
  },
  {
    "kind": "docs",
    "title": "아키텍처 방향 — 5층 구조",
    "description": "Five-layer architecture overview for the Codaro runtime.",
    "url": "/codaro/docs/skills/architecture/overview",
    "text": "아키텍처 방향 1차 목표는 의 독립이다. 구조는 아래 5층을 기본으로 본다. UI가 실행기 구현 세부사항에 직접 묶이면 안 된다. 웹, 모바일, 로컬은 가능한 한 같은 문서 모델과 같은 실행 인터페이스를 공유해야 한다. 폴더 매핑 (PR 3~4 후 목표 상태) 관련 [[document model]] [[execution engine]] [[dataflow]] [[widget bridge]]",
    "category": "architecture"
  },
  {
    "kind": "docs",
    "title": "문서 모델 원칙",
    "description": "Document model boundaries for cells, files, and notebook state.",
    "url": "/codaro/docs/skills/architecture/document-model",
    "text": "문서 모델 원칙 Codaro는 장기적으로 보다 중심 모델로 간다. 최소 블록 후보: 노트북 포맷 호환은 중요하지만, 내부 모델은 외부 노트북 포맷에 종속되지 않는다. 공개적으로 notebook compatibility를 유지하더라도 제품 내부 판단은 block oriented runtime surface 기준으로 한다. 학습 흐름에서는 YAML curriculum이 block document로 materialize되고, 각 block은 설명/실습/검증/자동화 상태를 가질 수 있다. 관련 [[percent format]] — 기본 직렬화 포맷 [[execution engine]] — 블록 실행 인터페이스",
    "category": "architecture"
  },
  {
    "kind": "docs",
    "title": "실행 엔진 원칙",
    "description": "Execution engine responsibilities for kernels, runtimes, and reruns.",
    "url": "/codaro/docs/skills/architecture/execution-engine",
    "text": "실행 엔진 원칙 실행 엔진은 교체 가능한 인터페이스로 설계한다. 기본 후보: 편집기는 , , , , , 같은 capability를 호출하고, 개별 엔진 구현을 직접 알지 않아야 한다. AI teacher와 제품 표면도 같은 capability surface를 호출한다. 셀 실행/검증은 장기적으로 계약으로 수렴한다. , 는 하위 호환 및 세부 구현 도구다. 관련 [[pyodide first runtime]] — Pyodide 기본, 로컬 슈퍼셋 [[reactive execution]] — 의존 그래프 위에서 동작",
    "category": "architecture"
  },
  {
    "kind": "docs",
    "title": "데이터흐름 원칙",
    "description": "Dataflow rules for block dependency graphs and variable lineage.",
    "url": "/codaro/docs/skills/architecture/dataflow",
    "text": "데이터흐름 원칙 Codaro는 단순 코드 편집기가 아니라 상태를 가진 편집기다. 따라서 아래를 초기에 고려한다. block dependency graph variable lineage rerun scope side effect boundary \"어느 블록을 다시 실행해야 하는가\"를 계산할 수 있어야 한다. 관련 [[reactive execution]] — 자동 재실행 의미론 [[transparent scope isolation]] — 변수 정의/사용 추론",
    "category": "architecture"
  },
  {
    "kind": "docs",
    "title": "위젯/뷰 브리지 원칙",
    "description": "Widget bridge expectations for connecting runtime state to views.",
    "url": "/codaro/docs/skills/architecture/widget-bridge",
    "text": "위젯/뷰 브리지 원칙 Python 코드가 UI descriptor를 만들고, 프론트가 이를 렌더링하는 구조를 기본으로 한다. 위젯은 부가 기능이 아니라 Codaro의 핵심 메커니즘이다. 즉, Codaro는 \"코드가 인터페이스가 되는 편집기\"를 지향한다. 관련 [[multi editor modes]] — 모드별 위젯 표시 [[document model]] — widget/view 블록 타입",
    "category": "architecture"
  },
  {
    "kind": "docs",
    "title": "제품 프론트 표면",
    "description": "React and shadcn/ui strategy for Codaro editor and learning surfaces.",
    "url": "/codaro/docs/skills/architecture/frontend-product-surface",
    "text": "제품 프론트 표면 Codaro의 프론트는 두 표면으로 나눈다. — GitHub Pages 문서와 글쓰기 표면. 현재 Svelte 유지. — Codaro 제품 표면. AI workbench, notebook/editor, learning, automation UI를 모두 포함한다. React + shadcn/ui 기준. 기존 Svelte 앱은 더 이상 제품 표면의 기준이 아니다. 현재 제품 표면의 source of truth는 하나다. 제품 표면 계약 가 Codaro의 실제 제품 UI 표면이다. 제품 내부 실행/편집 단위는 workbench, notebook, cell로 구분한다. 기존 Svelte 편집기는 참고/레거시 판단 대상일 뿐, 현재 저장소의 제품 기준으로 보지 않는다. 제품 기본 진입은 다. 제품 흐름은 이다. 따라서 새 UI 판단 기준은 \"편집기 앱을 어떻게 꾸밀까\"가 아니라 \"채팅에서 만들어진 학습/자동화 작업대가 어떻게 실제 셀과 실행 상태로 변하는가\"다. 작업대 정보 구조 는 아래 정보를 1급 UI로 보여줘야 한다. 현재 conversation과 provider/model 상태 AI가 작성한 curriculum YAML artifact materialized document와 cell 목록 tool lane timeline: , , , , , , cell별 실행 결과, 변수 상태, 검증 결과 pending workbench changes의 diff, accept/reject AI 없이 불러온 reference curriculum과 AI가 생성한 임시 curriculum의 출처 차이 task/report/automation으로 넘기는 handoff 상태 결정 편집기와 학습기 프론트의 신규 작업은 React + shadcn/ui 컴포넌트 구조를 기본값으로 한다. shadcn/ui는 완성된 외부 라이브러리를 가져다 쓰는 방식이 아니라, 컴포넌트 코드를 소유하고 조정하는 방식으로 사용한다. 화면의 난이도는 컴포넌트 자체보다 배치, 상태, 정보 밀도에서 결정한다. 따라서 새 화면은 먼저 레이아웃 계약을 고정한 뒤 기능을 붙인다. 공용 컴포넌트는 아래에 둔다. 제품 기능 화면은 아래에서 AI workbench, notebook/editor, learning, runtime 패널을 분리해 키운다. 편집기 기준 편집기는 코드 셀, 실행 결과, 런타임 상태, 파일 탐색이 한 화면에서 끊기지 않아야 한다. 실행 버튼, 저장, 검색, 명령 팔레트 같은 기본 행동은 shadcn 버튼/탭/패널 패턴 위에서 만든다. 코드 편집 영역은 별도 엔진 영역으로 보고, 주변 크롬은 shadcn/ui 컴포넌트로 구성한다. 출력은 셀 바로 아래에 붙이며, 실행 상태는 셀과 런타임 패널 양쪽에서 확인 가능해야 한다. 학습기 기준 학습기는 설명 페이지가 아니라 실행 흐름이다. 한 화면에는 현재 목표, 실습 셀, 예측/실행/수정 단계, 피드백 패널이 함께 보여야 한다. 초보자용 문구는 화면에서 직접 행동을 유도해야 한다. 용어 설명은 기능 사용을 막지 않는 위치에 둔다. 진행률은 단순 퍼센트보다 현재 단계와 다음 행동을 우선한다. 학습 요청의 기본값은 reference tree 선택이 아니라 채팅에서 작업대를 생성하는 것이다. reference tree는 AI 없이도 학습 가능한 기본 curriculum 경로다. AI 생성 curriculum은 YAML artifact와 셀 전개 결과를 함께 보여준다. 경계 는 React + shadcn/ui 제품 표면이다. 의 빌드 결과는 로 간다. 폐기된 Svelte 편집기는 현재 저장소의 제품 기준에서 제외한다. 은 이 결정의 대상이 아니다. 문서 사이트 전환은 별도 결정 없이는 하지 않는다. 관련 [[overview]] — UI는 실행기 구현 세부사항에 직접 묶이지 않는다 [[widget bridge]] — Python descriptor와 프론트 렌더링 경계 [[learning three pillars]] — 학습 모드의 콘텐츠와 철학",
    "category": "architecture"
  },
  {
    "kind": "docs",
    "title": "커리큘럼 레지스트리",
    "description": "Product content boundary for built-in YAML curricula.",
    "url": "/codaro/docs/skills/architecture/curriculum-registry",
    "text": "커리큘럼 레지스트리 는 Codaro가 기본 제공하는 학습 콘텐츠의 제품 자산 루트다. 문서 사이트에 넣는 읽기 자료가 아니라, 서버와 에디터가 읽어서 runnable notebook cells로 전개하는 YAML 소스다. 기본 구조: 경계 는 제품 사상, 아키텍처, 운영 규칙을 설명한다. 는 공개 글을 담는다. 는 제품이 읽는 built in curriculum YAML과 관련 생성 도구를 담는다. 는 에서 파생된 배포용 노트북 산출물이다. 따라서 를 아래에 넣지 않는다. 공개 사이트에서 커리큘럼 목록을 보여줘야 하면 를 읽어 인덱스를 생성하고, 설명 문서만 에 둔다. 런타임 계약 기본 커리큘럼 루트는 이다. YAML은 변환기를 통해 document/cell 구조로 materialize된다. AI가 채팅에서 만든 임시 curriculum YAML도 같은 변환기를 통과한다. 파일명과 URL은 기존 콘텐츠 포맷과 라우트 계약이므로 폴더명 변경과 별개로 유지한다. 정리 원칙 백업성 커리큘럼 폴더는 레지스트리에 두지 않는다. 레슨 원본은 YAML, 파생 산출물은 로 분리한다. PRD나 설계 메모가 커리큘럼 생성에 필요한 경우 해당 커리큘럼 폴더 안에 둔다. 관련 [[learning three pillars]] — 기본 커리큘럼과 AI 생성 YAML의 제품 사상 [[document model]] — YAML이 block document로 전개되는 방식 [[frontend product surface]] — reference curriculum을 제품 UI에서 다루는 방식",
    "category": "architecture"
  },
  {
    "kind": "docs",
    "title": "실행 모델 — 투명 스코프 격리",
    "description": "Python-native scope isolation principles for Codaro block execution.",
    "url": "/codaro/docs/skills/identity/transparent-scope-isolation",
    "text": "실행 모델: 투명 스코프 격리 사용자는 그냥 Python을 쓴다 . 함수 래핑 없음, return 없음, 보일러플레이트 없음. 엔진이 내부에서 셀마다 격리된 네임스페이스로 실행한다. AST 분석으로 각 셀이 정의하는 변수(defines)와 사용하는 변수(uses)를 자동 추론한다. 셀 실행 시 해당 셀이 사용하는 변수만 레지스트리에서 주입한다. 셀이 삭제되면 그 셀이 정의한 변수도 레지스트리에서 사라진다. Jupyter의 편리함 + 리액티브 안전성 , 사용자에게 보이지 않는 곳에서. 관련 [[reactive execution]] — 변수 변경의 하위 셀 전파 [[percent format]] — 셀 경계 정의",
    "category": "identity"
  },
  {
    "kind": "docs",
    "title": "리액티브 실행",
    "description": "Reactive execution rules for dependency-aware notebook reruns.",
    "url": "/codaro/docs/skills/identity/reactive-execution",
    "text": "리액티브 실행 셀 하나를 실행하면, 그 셀의 변수에 의존하는 하위 셀이 자동으로 재실행 된다. 의존 관계는 AST 분석 기반 (명시적 선언 불필요). 에러 발생 시 전파 중단. 실행 순서는 문서 순서를 따른다 (의존 관계 내에서). 관련 [[transparent scope isolation]] — 변수 정의/사용 추론 [[execution engine]] — 엔진 인터페이스",
    "category": "identity"
  },
  {
    "kind": "docs",
    "title": "파일 포맷 — Percent Format (.py)",
    "description": "Percent-format notebook conventions that keep files executable as Python.",
    "url": "/codaro/docs/skills/identity/percent-format",
    "text": "파일 포맷: Percent Format (.py) Codaro의 기본 저장 포맷은 Percent Format이다. , 주석이 셀 경계를 구분한다. 코드는 모듈 레벨 (들여쓰기 0칸). 함수로 감싸지 않는다. 로 그대로 실행 가능하다. VS Code, Spyder, Jupytext가 동일한 포맷을 인식한다. reactive app/ipynb 호환 import/export는 유지한다. 관련 [[document model]] — 블록 중심 내부 모델 [[transparent scope isolation]] — 셀이 모듈 레벨에서 실행되는 의미",
    "category": "identity"
  },
  {
    "kind": "docs",
    "title": "실행 환경 — Pyodide 기본, 로컬 확장",
    "description": "Runtime policy for Pyodide-first execution with optional local expansion.",
    "url": "/codaro/docs/skills/identity/pyodide-first-runtime",
    "text": "실행 환경: Pyodide 기본, 로컬 확장 Pyodide(브라우저)가 기본 실행 플랫폼 이다. 모든 학습 콘텐츠가 Pyodide에서 동작한다. 로컬(서버 커널)은 Pyodide의 모든 것 + 추가 자동화 를 제공한다. 실제 파일 I/O, 패키지 자동 설치, DB 연결, 무거운 ML, 로컬 AI(Ollama). 프론트엔드는 서버 커널 우선 → Pyodide 폴백으로 동작한다. 편집기 코드가 실행 엔진의 구현을 직접 알지 않는다. 관련 [[execution engine]] — 교체 가능한 엔진 인터페이스 [[mounting and integration]] — createServerApp 마운팅",
    "category": "identity"
  },
  {
    "kind": "docs",
    "title": "학습 시스템 3기둥",
    "description": "Notebook, curriculum, and learning philosophy pillars for Codaro education.",
    "url": "/codaro/docs/skills/identity/learning-three-pillars",
    "text": "학습 시스템 3기둥 기둥 1: 노트북 기능 — 학습의 실행 환경. 셀 편집/실행/리액티브/분할/병합. 기둥 2: 뼈대 커리큘럼 — 의 YAML 기반 130+ 레슨. 카테고리/레슨/미션/진행 추적. 정적 레슨뿐 아니라 AI가 채팅에서 만든 임시 curriculum YAML도 같은 변환기( )를 통과해 학습 에디터 셀이 된다. 사용자가 커리큘럼을 먼저 고르지 않아도, AI가 YAML 명세를 만들고 로 에디터에 보낸 뒤 셀 단위 실행/검증을 이어간다. 기둥 3: 학습 사상 — 코드로 정의된 교육 철학. AI도 사람도 이 사상을 따른다. 최소 설명, 최대 실행 빈칸부터 시작 (빈 셀이 아니라 거의 완성된 코드에서 빈칸 채우기) 예측 → 검증 (먼저 예측하게 하고 실행으로 확인) 오류는 학습 (일부러 버그가 있는 코드를 주고 고치게 한다) 점진적 빌드 (한 셀에 한 개념, 쌓아가며 완성) 수정 실험 (\"이 값을 바꿔보세요\") 3단계 힌트 (개념 → 구조 → 정답, 바로 답을 주지 않는다) 즉시 피드백 (맞았는지 1초 안에) 반복 변주 (같은 개념을 다른 상황에서) 실제 맥락 (추상적 예제가 아니라 현실 상황) 제품 학습 흐름 학습의 기본 진입은 의 Chat first AI workbench다. AI가 없을 때는 의 reference curriculum YAML을 같은 변환기로 열어 학습한다. AI가 있을 때는 같은 YAML/셀 구조 위에서 개인화, 추가 설명, 답 검증, 보충 셀 생성이 붙는다. 관련 [[ai integration]] — AI가 같은 사상으로 가르친다 [[multi editor modes]] — 학습 에디터 모드 [[curriculum registry]] — 기본 curriculum YAML의 제품 자산 경계",
    "category": "identity"
  },
  {
    "kind": "docs",
    "title": "AI 통합 원칙",
    "description": "Optional teacher integration rules that keep assistance transparent and inspectable.",
    "url": "/codaro/docs/skills/identity/ai-integration",
    "text": "AI 통합 원칙 AI 없이도 모든 학습이 완전히 동작 한다. AI는 선택적 확장이다. AI가 붙으면 편집기의 기존 API를 도구(tool use)로 사용 해서 가르친다. : 설명/예시/힌트 셀 삽입 : 학생 코드 실행 후 결과 검증 : 변수 상태 확인 : 피드백 추가 , : 교육 환경 자동 설정 AI는 에서 학습 사상을 읽고 동일한 철학으로 가르친다. 커리큘럼에 없는 주제도 같은 사상(빈칸→수정→작성, 3단계 힌트, 즉시 피드백)으로 생성한다. AI Provider는 교체 가능: GPT(OAuth), Ollama(로컬), Claude, 또는 없음. YAML 우선 학습 작업대 절차 AI가 학습 흐름을 만들 때 기본값은 기존 커리큘럼 선택이 아니라 의 채팅에서 작업대를 생성 하는 것이다. 사용자가 \"pandas 3일 과정 만들어줘\"처럼 말하면 아래 절차를 따른다. 1. 읽기 — , , 로 현재 에디터 상태와 실행 상태를 확인한다. 2. YAML 작성 — , , , 구조의 curriculum YAML을 먼저 만든다. 커리큘럼 파일이 없어도 이 YAML이 임시 학습 명세가 된다. 3. 에디터 전개 — 을 호출해 YAML을 변환기로 보내고, 결과 document를 editor의 learning workbench에 로드한다. 4. 셀 단위 수정 — 추가 설명, 빈칸, 예측, 체크 셀은 로 한 셀씩 삽입/수정/삭제한다. 5. 셀 단위 호출 — 실행과 검증은 을 기본으로 한다. 하위 호환이 필요할 때만 , 를 직접 쓴다. 6. 진행 기록 — 주제 단위 완료, 반복 실패, 숙련도 변화는 로 남긴다. 이 절차의 핵심은 \"YAML이 커리큘럼 SSOT, 에디터가 실행 표면, 툴콜이 셀별 조작 로그\"라는 구조다. AI 응답 텍스트가 커리큘럼이 아니라, YAML과 셀 툴콜이 실제 학습 상태를 만든다. 여기서 는 제품 표면 폴더명이다. 제품 내부의 실행/학습 단위는 workbench, notebook, cell로 부른다. Tool lane 계약 : — YAML 학습 명세를 runnable cells로 materialize. : , , — 현재 셀/런타임/화면 상태 읽기. : , , , , 학습 생성 툴 — 에디터와 워크스페이스 변경. : , , — 특정 셀 실행/검증. : — 학습 완료/숙련도 기록. DartLab 참고 구조 DartLab의 작업대는 tool lifecycle을 로 분리하고, tool call id에 refs/artifacts/workloop UI를 연결한다. Codaro도 같은 방향으로 간다. 단, Codaro의 기본 artifact는 일반 파일이 아니라 학습 에디터 셀과 YAML curriculum spec 이다. 따라서 Codaro 작업대 UI는 최종 답변보다 tool lane, cell id, 실행 결과, 변환된 YAML document를 더 중요하게 보여준다. 사용자는 \"AI가 뭐라고 말했는지\"보다 \"어떤 셀이 만들어졌고 어떤 셀이 실행/검증됐는지\"를 확인할 수 있어야 한다. 관련 [[learning three pillars]] — 학습 사상 SSOT [[ai sensory system]] — AI에게 눈/귀/손을 주는 별도 축 [[ai transparency]] — AI 실제 본 데이터 노출 원칙",
    "category": "identity"
  },
  {
    "kind": "docs",
    "title": "마운팅과 통합",
    "description": "Mounting and integration principles for apps, APIs, and GUI flows.",
    "url": "/codaro/docs/skills/identity/mounting-and-integration",
    "text": "마운팅과 통합 은 독립 실행 가능하면서 동시에 다른 서버에 마운팅 가능하다. FastAPI: Django: ASGI 라우팅 분기 Flask: WSGIMiddleware 래핑 프론트엔드는 태그에서 root path를 자동 감지한다. GUI에서 되는 모든 것은 API로도 된다 (시스템적 수정 가능). 관련 [[execution engine]] — 엔진 추상화 [[architecture overview]] — transport 레이어",
    "category": "identity"
  },
  {
    "kind": "docs",
    "title": "자동화 + 태스크 + 리포트",
    "description": "Automation, task, and report concepts for Codaro workflows.",
    "url": "/codaro/docs/skills/identity/automation-tasks-reports",
    "text": "자동화 + 태스크 + 리포트 사용자가 작성하거나 AI가 생성한 Python 문서(.py)는 그 자체가 실행 가능한 태스크 가 된다. 태스크는 스케줄(@every 5m, @daily 등)에 자동 실행되거나, 웹훅으로 외부 트리거되거나, 수동 실행할 수 있다. 여러 태스크를 의존성(DAG)으로 묶은 워크플로우 가 가능하다. 모든 자동화 액션은 감사 로그 (audit trail, JSONL)에 기록된다. 태스크 실행 결과(변수, stdout, 에러)는 리포트로 조회 가능하다. 비상 정지(E Stop) 가 모든 자동화를 즉시 중단시킨다. 관련 [[external channels mobile]] — Webhook/Slack 트리거 [[multi editor modes]] — 리포트 뷰어 모드 [[percent format]] — .py가 곧 태스크",
    "category": "identity"
  },
  {
    "kind": "docs",
    "title": "다중 에디터 모드",
    "description": "Multi-editor mode principles for notebook, app, and automation surfaces.",
    "url": "/codaro/docs/skills/identity/multi-editor-modes",
    "text": "다중 에디터 모드 Codaro의 제품 표면은 이고, 그 안에서 하나의 런타임 위에 여러 얼굴 을 가진다. 코드 에디터 : 셀 편집 + 실행 + 리액티브 데이터플로우. 개발자의 작업 공간. 학습 에디터 : 커리큘럼 브라우저 + 가이드 카드 + 퀴즈 + 성취 추적. 학습자의 교실. 리포트/앱 에디터 : 코드는 숨기고 출력만 표시. 대시보드, 프레젠테이션, 자동화 결과 뷰어. 세 모드 모두 같은 문서 모델, 같은 실행 엔진, 같은 API 위에서 동작한다. 사용자는 대화로 학습 → 에디터에서 코드 작성 → 태스크로 등록 → 스케줄 자동 실행 → 결과 리포트 확인의 연속 워크플로우 를 가진다. 제품 흐름에서의 editor 위치 는 Codaro 제품 표면 폴더명이다. 제품 내부에서는 materialized notebook/workbench를 실행하고 수정한다. 기본 진입은 Chat first AI workbench다. AI가 만든 YAML curriculum이 learning editor에 셀로 전개되고, 사용자는 그 셀을 실행/수정/검증한다. 같은 문서는 코드 모드에서는 노트북, 학습 모드에서는 수업, 자동화 모드에서는 태스크 원본, 리포트 모드에서는 출력 대시보드가 된다. 기존 Svelte 편집기는 현재 제품 판단 기준이 아니다. 새 제품 판단 기준은 다. 관련 [[learning three pillars]] — 학습 모드의 콘텐츠 [[automation tasks reports]] — 리포트 모드의 데이터 [[widget bridge]] — 모드별 위젯 렌더링",
    "category": "identity"
  },
  {
    "kind": "docs",
    "title": "AI 감각계 — 눈, 귀, 손",
    "description": "Vision, hearing, and action channel concepts for assisted workflows.",
    "url": "/codaro/docs/skills/identity/ai-sensory-system",
    "text": "AI 감각계 — 눈, 귀, 손 AI에게 데스크톱을 보고, 듣고, 조작할 수 있는 능력을 준다. 눈(Vision) : OpenCV + dxcam/mss 화면 캡처, PaddleOCR/EasyOCR 텍스트 인식, 템플릿 매칭/윤곽선 분석 요소 탐지. 귀(Voice) : Whisper 음성 인식 → CommandParser로 구조화된 명령 변환. 손(Input) : PyAutoGUI/DirectInput/Accessibility API로 마우스 클릭, 키보드 입력, 드래그, 핫키. InputGuard가 속도/영역 제한으로 안전 보장. 녹화 → 코드 : 사용자의 동작을 녹화 → 실행 가능한 Python 코드(Percent Format)로 자동 생성. 자동화 루프 : 다단계 액션 + 검증(화면 텍스트 확인) + 재시도 + 상태 머신. 이 모든 감각은 AI tool use로 노출되어 AI가 \"보고 → 판단하고 → 행동하는\" 에이전트로 동작한다. xlwings 같은 도메인 특화 라이브러리로 Excel/Office 자동화도 같은 구조에 탑재 가능. 관련 [[ai integration]] — tool use 표면 [[automation tasks reports]] — 감각계로 만든 .py가 곧 태스크",
    "category": "identity"
  },
  {
    "kind": "docs",
    "title": "외부 채널 + 모바일 조작",
    "description": "External channel and mobile principles for future Codaro access patterns.",
    "url": "/codaro/docs/skills/identity/external-channels-mobile",
    "text": "외부 채널 + 모바일 조작 Codaro는 사용자가 항상 데스크톱 앞에 있지 않아도 동작한다. MessageBridge : Slack, Discord, 커스텀 Webhook으로 태스크 결과/알림 전송. Webhook 트리거 : 외부에서 HTTP 호출로 태스크를 실행 가능. 사용자는 폰에서 Slack/Discord 알림을 받고, 웹훅으로 태스크를 트리거하고, 결과를 확인할 수 있다. 향후 모바일 반응형 UI + PWA로 직접 에디터 접근도 가능. Codaro가 로컬 머신에서 돌면서 외부 세계와 양방향 소통하는 개인 자동화 허브 역할. 관련 [[automation tasks reports]] — 트리거되는 태스크 정의 [[mounting and integration]] — 외부 HTTP surface",
    "category": "identity"
  },
  {
    "kind": "docs",
    "title": "브랜딩 + 프론트 톤",
    "description": "Branding rules for Codaro identity, assets, and product language.",
    "url": "/codaro/docs/skills/ops/branding",
    "text": "브랜딩 원칙 Codaro는 다른 노트북의 \"대체재\"로 소개하지 않는다. 설명 기준: programmable studio interactive editor runtime code, learning, automation 다른 앱이 올라가는 기반 레이어로 보이게 설계한다. 프론트/브랜드 확정 규칙 Codaro 제품 UI 언어는 영어만 사용한다. index, editor, app mode, docs, docs writing 모두 영어 기준이다. 모든 공용 컴포넌트 톤은 계열을 기본으로 한다. 편집기와 학습기 제품 UI는 패턴을 기본으로 사용한다. 는 React + shadcn/ui 기반의 Codaro 제품 표면이다. 폐기된 Svelte 편집기는 현재 제품 기준에서 제외한다. 기본 avatar와 favicon source는 의 첫 번째 왼쪽 pose다. pose sheet source는 , 다. 아바타는 항상 배경 제거 후 캐릭터만 사용한다. Codaro 이름, 아바타, 마스코트, 로고, pose sheet, 브랜드 자산은 기준으로 전권 보유한다. 교육 콘텐츠 라이선스는 브랜드 자산 재사용 권한을 주지 않는다. 제품 favicon/avatar source는 다. 제품 색상/반지름/테두리 source of truth는 의 shadcn token layer다. GitHub Pages 문서 표면은 Svelte로 운영한다. 문서와 글쓰기는 기준의 같은 Svelte 표면에서 운영한다. 브랜드 자산 운영 마스코트 원본은 아래에 둔다. 실제 서비스 반영 파일은 제품 표면별 static/public 경로로 export한다. GitHub에 같이 올려서 브랜딩 자산도 저장소 이력으로 관리한다. 아바타는 얼굴 중심 정사각 크롭을 기본으로 하며, 눈과 입이 살아 있어야 한다. 파비콘은 얼굴 전체나 책 전체를 그대로 축소하지 않고 머리 실루엣, 새싹, 눈 같은 핵심 요소만 남긴 단순 버전을 쓴다. 앱 아이콘은 파비콘보다 디테일을 허용하지만 128, 180, 512 기준으로 따로 검토한다. 브랜드 작업 순서는 원본 저장 → 작업본 생성 → 확정본 export → 프론트 적용이다.",
    "category": "ops"
  },
  {
    "kind": "docs",
    "title": "실행 환경 + 인코딩",
    "description": "Environment requirements for Python, uv, and local execution.",
    "url": "/codaro/docs/skills/ops/environment",
    "text": "실행 환경 규칙 PowerShell 메인 가상환경은 프로젝트 루트 를 사용한다. WSL에서는 루트 를 공유하지 않는다. WSL 전용 가상환경이 필요하면 을 사용한다. Python 3.12 이상과 를 기준으로 한다. Node.js는 문서 표면과 제품 표면 작업에 필요하다. 실행 인코딩 규칙 Python 실행은 기본적으로 형태를 사용한다. PowerShell에서 인코딩이 의심되면 실행 전에 아래를 적용한다. 파일 읽기/쓰기 명령은 가능한 한 UTF 8을 명시한다. 모든 텍스트 파일은 UTF 8을 기본으로 유지한다. 로컬 산출물 위생 프로젝트 루트는 임시 로그/스크린샷/캐시/세션 파일을 쓰는 장소가 아니다. 백그라운드 서버를 띄울 때 , , , , 를 루트나 앱 루트에 만들지 않는다. stdout/stderr 리다이렉트가 필요하면 아래를 우선 사용한다. 보존이 필요 없는 로컬 산출물은 삭제한다. 보존이 꼭 필요하면 레포 밖 아래를 사용한다. Playwright CLI는 레포 루트에서 실행하지 않는다. 브라우저 산출물이 필요하면 임시 작업 폴더나 를 사용한다. 백그라운드 프로세스를 띄운 작업은 종료 전 반드시 프로세스를 정리하고, 루트에 와 가 남지 않았는지 확인한다. 주요 명령 프론트 표면 실행 — 실제 제품 UI 표면. React + shadcn/ui 기준. — GitHub Pages 문서와 블로그 표면. 폐기된 Svelte 편집기는 현재 저장소의 실행 표면으로 보지 않는다. 제품 프론트를 반복 개발할 때는 를 기준으로 본다.",
    "category": "ops"
  },
  {
    "kind": "docs",
    "title": "코드 품질 원칙",
    "description": "Code quality rules for naming, exceptions, and maintainable changes.",
    "url": "/codaro/docs/skills/ops/code-quality",
    "text": "코드 품질 원칙 파일/폴더/함수/변수는 , 클래스는 , 상수는 를 사용한다. 불필요한 캐시, 산출물, 백업성 폴더는 삭제한다. 보존이 필요한 자료만 명확한 제품 자산 위치로 옮긴다. 인라인 주석은 넣지 않는다. bare except ( ) 절대 금지 는 금지. 로깅 없는 삼킴은 허용하지 않는다. 사용 시 반드시: (1) 예외 변수 바인딩 ( ), (2) 최소 logger.debug 이상 로깅, (3) 좁힐 수 없는 사유가 명확해야 한다. 예외 타입은 가능한 한 좁힌다 (json.JSONDecodeError, OSError 등 구체 타입 우선). try except를 if else 대용으로 쓰지 않는다. asyncio.create task()에는 done callback을 붙여 예외를 수면 위로 올린다. dispose/cleanup 패턴은 를 사용한다. raise 시 원본 예외 체인을 유지한다 ( ). 사용자 입력 검증은 가능하면 early return으로 처리한다. ruff 린트 규칙 BLE001, S110, S112, TRY400이 pyproject.toml에 설정되어 있다. 정당한 면제는 주석으로 처리한다. 초기 단계일수록 \"대충 동작\"보다 \"계층이 맞는가\"를 우선한다.",
    "category": "ops"
  },
  {
    "kind": "docs",
    "title": "AI 투명성 원칙",
    "description": "Transparency rules for assisted teaching and tool-visible work.",
    "url": "/codaro/docs/skills/ops/ai-transparency",
    "text": "AI 투명성 원칙 Codaro에 AI 기능을 붙일 때, 모델이 실제로 본 데이터는 UI에서 사용자에게 드러나야 한다. 시스템이 제공한 컨텍스트, 시스템 프롬프트, tool 호출과 결과는 숨기지 않는다. AI 표현을 바꾸려면 UI 임시 가공보다 원천 데이터 계층 개선을 우선한다. 소비자 계층은 원천 데이터를 읽기만 하고, 표시용 이름/정렬/단위를 임의로 재정의하지 않는다. 관련 [[ai integration]] — tool use surface [[ai sensory system]] — 감각계 출력도 동일 원칙",
    "category": "ops"
  },
  {
    "kind": "docs",
    "title": "실험 규칙",
    "description": "Experiment policy for prototypes, validation, and production boundaries.",
    "url": "/codaro/docs/skills/ops/experiment",
    "text": "실험 규칙 실험은 반드시 아래에서만 한다. 실험 먼저 진행하고, 로직이 굳기 전에는 패키지 코드로 바로 들어가지 않는다. 실험별 하위 폴더를 분리한다. 예: 각 실험 폴더에는 를 둔다. 파일명은 숫자 접두사를 붙인다. 예: 실패한 실험도 지우지 말고 결론을 남긴다.",
    "category": "ops"
  },
  {
    "kind": "docs",
    "title": "Git + 릴리즈 원칙",
    "description": "Git, commit, and release rules for Codaro changes.",
    "url": "/codaro/docs/skills/ops/git-and-release",
    "text": "Git 및 릴리즈 원칙 커밋, 주석, 문서 어디에도 AI 생성 흔적 문구를 남기지 않는다. 커밋 메시지와 커밋 본문에도 , , , , , 같은 흔적을 남기지 않는다. GitHub 원격 작업은 사용을 허용한다. 기본 원격 저장소는 이다. 릴리즈 시 에 변경 내용을 상세하게 기록한다. 배포는 GitHub Actions trusted publishing 기준을 유지한다. 버전 릴리즈는 흐름을 기준으로 한다.",
    "category": "ops"
  },
  {
    "kind": "docs",
    "title": "라이선스 경계",
    "description": "Licensing boundaries for Codaro source code, learning content, and brand assets.",
    "url": "/codaro/docs/skills/ops/licensing",
    "text": "라이선스 경계 Codaro는 공개 학습과 검토를 허용하지만, 상업적 재사용을 허용하는 오픈소스 배포가 아니다. 기본 원칙 코드는 의 비상업 소스 라이선스를 따른다. 교육 콘텐츠는 의 CC BY NC SA 4.0 기준을 따른다. 브랜드 자산은 에 따라 전권 보유한다. 상업적 사용, 재판매, 유료 강의 편입, 호스팅 서비스 제공, 브랜드 재사용은 사전 서면 허가가 필요하다. 코드 개인 학습, 연구, 평가, 비상업 수정과 실행은 허용한다. 상업 제품, 유료 서비스, 내부 업무 플랫폼, 유료 교육 프로그램, 컨설팅 산출물 편입은 허용하지 않는다. 수정본을 비상업적으로 배포할 때도 같은 라이선스와 저작권 표시를 유지한다. 교육 콘텐츠 , , 의 학습 자료와 문서는 비상업 학습과 공유를 허용한다. 출처 표시, 변경 표시, 동일 조건 공유를 유지한다. 유료 강의, 부트캠프, 교재, 기업 교육, 유료 플랫폼 번들링은 허가 없이는 금지한다. 브랜드 Codaro 이름, 로고, 아바타, 마스코트, pose sheet, 아이콘, 시각 정체성은 콘텐츠 라이선스에 포함되지 않는다. 비상업 리뷰나 출처 표시는 가능하지만, 다른 제품의 정체성으로 쓰면 안 된다.",
    "category": "ops"
  },
  {
    "kind": "docs",
    "title": "로컬 배포 bundle 원칙",
    "description": "Packaging rules for local distribution and bundled assets.",
    "url": "/codaro/docs/skills/ops/packaging",
    "text": "로컬 배포 bundle 원칙 최종 사용자 배포는 하나를 기준으로 한다. launcher는 embedded Python runtime과 manifest가 지정한 exact wheel 기반 curated bundle만 설치한다. launcher는 index에서 arbitrary latest package를 해석하거나 무제한 경로를 제품 기본으로 삼지 않는다. 같은 automation bundle은 Python package, helper runtime, capability probe, bootstrap을 launcher가 관리한다. 외부 앱과 드라이버 의존성은 별도 경계로 둔다. 예: 기반 Excel app automation은 launcher가 Python 쪽 의존성과 bootstrap을 관리하지만, Microsoft Excel 자체는 사용자가 설치해야 한다. 세부 배포 설계의 source of truth는 , 다.",
    "category": "ops"
  },
  {
    "kind": "docs",
    "title": "문서 유지보수 + 세션 이어가기",
    "description": "Documentation and session rules for keeping project context aligned.",
    "url": "/codaro/docs/skills/ops/doc-and-session",
    "text": "문서 유지보수 원칙 세션 시작 시 와 실제 코드 구조를 대조하고, 낡은 내용이 있으면 즉시 갱신한다. 파일/폴더 추가, 삭제, 이동이 있으면 관련 경로와 구조 설명을 함께 갱신한다. 삭제된 기능이나 파일에 대한 죽은 참조를 남기지 않는다. GitHub Pages 공개 문서는 를 기준으로 한다. 제품 운영 문서, 아키텍처 결정, API 성격의 설명은 별도 API 문서 트리를 만들지 않고 의 identity/architecture/ops 문서로 관리한다. 공개 글쓰기와 블로그성 콘텐츠는 루트 가 아니라 에 둔다. 공개 URL도 를 기준으로 한다. 하위의 장기 유지 폴더는 와 두 개만 둔다. , , , , 같은 폴더가 필요해지면 새 폴더를 만들기 전에 에 흡수한다. 기존 문서를 제거해야 할 때는 먼저 또는 에 흡수됐는지 확인하고, 사용자가 보관을 요구하지 않으면 삭제한다. 세션 이어가기 원칙 세션이 끝나도 다음 세션이 채팅 없이 바로 이어갈 수 있게 현재 결정, 진행 상태, 다음 액션, 남은 검증을 반드시 저장소 문서에 남긴다. 중간 상태의 TODO, blocker, diff는 채팅이 아니라 관련 기능 문서의 체크리스트로 남긴다. 작업이 여러 세션에 걸리면 가장 가까운 (또는 해당 모듈의 SKILL 파일)에 최소한 , , 를 갱신한다. 다음 세션은 먼저 프로젝트 메모리, 그다음 관련 기능 문서, 마지막으로 직전 수정 파일을 읽고 시작한다. 채팅 기록만 믿고 이어가지 않는다. 설계 결정과 남은 작업은 반드시 저장소 안 문서로 고정한다. 코드 변경이 있었는데 문서가 업데이트되지 않았다면 세션 종료 전에 문서를 먼저 맞춘다. 가 로컬 규칙의 SSOT이고, 는 를 먼저 읽으라는 진입점 포인터로 둔다. 포인터 검사는 로 수행한다.",
    "category": "ops"
  },
  {
    "kind": "docs",
    "title": "참고 구현 사용 원칙",
    "description": "Reference implementation rules for borrowing patterns without coupling.",
    "url": "/codaro/docs/skills/ops/reference-impl",
    "text": "참고 구현 사용 원칙 참고 경로: 우선 참고할 영역: 그대로 복제하지 않는다. 먼저 메커니즘을 해부하고, Codaro 목적에 맞는 계층으로 재설계한 뒤 가져온다.",
    "category": "ops"
  },
  {
    "kind": "docs",
    "title": "Codaro Skills",
    "description": "Codaro project rules and shared skill documents for humans and maintainers.",
    "url": "/codaro/docs/skills",
    "text": "Codaro Skills Codaro의 사람 + AI 공용 SSOT. 한 마크다운 파일이 두 청중을 동시에 섬긴다 — 사람은 직접 읽고, AI는 같은 파일을 컨텍스트로 받는다. 문서 구조 결정 Codaro의 저장소 문서는 두 축만 둔다. — 제품 사상, 아키텍처, 운영 규칙의 SSOT. — 공개 글, 릴리즈 스토리, 긴 설명형 콘텐츠. — 문서가 아니라 제품이 읽는 기본 curriculum YAML 레지스트리. , , , , 같은 별도 문서 폴더는 유지하지 않는다. 필요한 내용은 , , 중 하나로 흡수한다. README는 외부 진입점이다. 제품 철학 전체를 README에 길게 복사하지 않고, 바로 시작 링크와 현재 공개 배포 상태만 둔다. 제품 사상 Codaro의 제품 표면은 다. 현재 는 React + shadcn/ui 기준이며, 기존 Svelte 편집기는 제품 기준에서 제외한다. 기본 흐름은 아래와 같다. 핵심 계약: YAML은 학습 설계도의 source of truth다. 기본 curriculum YAML은 에 둔다. Editor는 Codaro 제품 표면의 이름이다. 내부 실행 단위는 workbench/notebook/cell로 구분한다. Tool call은 숨겨진 내부 로그가 아니라 사용자가 검토할 수 있는 제품 액션이다. AI 없이도 기본 curriculum YAML로 학습이 가능해야 한다. AI가 붙으면 개인화, 셀 조율, 답 검증, 자동화 생성이 추가된다. DartLab에서 가져올 점 DartLab은 와 skills를 분리하고, AI가 읽을 작업 지식은 skills에 모은다. Codaro도 같은 원칙을 따르되 공개 사이트가 를 기준으로 동작하므로 루트 를 만들지 않고 를 유지한다. DartLab의 generated reference처럼 코드에서 자동 생성되는 API 표가 필요해지면 별도 를 만들지 말고 또는 아래의 생성 파일로 둔다. 각 스킬은 5필드 frontmatter를 가진다: Identity (11) — 절대 흔들리지 않는 사상 Architecture (7) — 5층 구조 Ops (10) — 운영 규칙 후속 (PR 2 이후) — 기존 src/codaro/ /DEV.md 본문 이관 — launcher/PRD.md 530줄 분할",
    "category": "skills"
  }
];
