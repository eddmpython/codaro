# Codaro Backend DEV

## 목적

`src/codaro/`는 Codaro의 Python 런타임과 로컬 서버를 담당한다.
현재 구현은 `문서 로드/저장`, `코드 실행`, `파일 시스템`, `패키지 관리`, `프론트 정적 서빙`을 하나의 FastAPI 앱으로 묶는다.

## 현재 계층

- `api/`
  - FastAPI router 계층
  - bootstrap/document/kernel/system/workspace/curriculum/spa 조립
  - 요청 모델과 서버 상태 객체
  - 공통 에러 envelope와 예외 처리
- `document/`
  - 문서 모델
  - codaro/marimo/ipynb 파서와 writer
  - 문서 서비스
- `kernel/`
  - Python 실행 세션
  - 세션 관리자
  - REST/WebSocket 프로토콜 모델
  - 세션 기준 fs/packages capability
- `system/`
  - 파일 시스템 CRUD
  - 패키지 설치/삭제/조회
  - runtime capability가 호출하는 workspace 시스템 어댑터
  - workspace notebook index 스캔
- `../scripts/buildBrandAssets.py`
  - 투명 배경 브랜드 자산 생성 스크립트
- `../landing/`
  - GitHub Pages용 public site
  - docs/blog/search route와 static build
- `../blog/`
  - public blog markdown source
- `../launcher/`
  - 로컬 배포 계층
  - Rust launcher, embedded Python, install/update/rollback PRD
  - package artifact, PyPI, bundle 분리 전략
- `runtime/`
  - 실행 엔진 인터페이스
  - `LocalEngine` 실제 구현
- `../content/studyPython/content/`
  - 학습 커리큘럼 YAML source of truth
- `server.py`
  - FastAPI 앱 조립기
  - middleware
  - router include
  - 빌드된 프론트 정적 자산 서빙
- `cli.py`
  - `codaro edit`
  - `codaro run`
  - `codaro export`

## 주요 흐름

### 문서 편집

1. 프론트가 `/api/document/load`로 문서를 읽는다
2. 편집 중 변경은 현재 프론트 메모리 상태에서 우선 처리한다
3. 저장 시 `/api/document/save`로 Codaro native `.py`로 직렬화한다
4. 내보내기는 `/api/document/export`에서 marimo/ipynb writer를 사용한다

### 워크스페이스 홈

1. `uv run codaro`는 `/` 홈 인덱스로 진입한다
2. `/api/workspace/index`가 현재 workspace root를 스캔한다
3. `.py`, `.ipynb` 중 실제 노트북 문서만 추려서 tree와 recent 목록을 만든다
4. Python 문서는 `codaro`, `marimo`, `jupyter` 타입으로 분류해서 프론트 홈에 전달한다
5. 서버는 workspace scan 시작/완료를 터미널에 기록한다

### 코드 실행

1. 편집기는 먼저 서버 커널 세션을 생성한다
2. 현재 편집기는 HTTP `/api/kernel/...` 경로로 실행/리액티브/변수 요청을 보낸다
3. WebSocket `/ws/kernel/{sessionId}`는 별도 통합 채널로 유지하며, 입력 payload 검증을 거친다
4. `KernelSession`은 `LocalEngine` child process worker를 통해 코드를 실행한다
5. 실행 중 `stdout`, `stderr`, `display`, `stateDelta`, `finished` 이벤트를 전파한다
6. 최종 응답에는 stdout, stderr, 마지막 표현식 값, 변수 목록, 변수 delta, 이벤트 기록이 담긴다

### 앱 모드

1. `codaro run path.py`가 서버를 app 모드로 띄운다
2. `/app?path=...`가 같은 문서를 읽는다
3. 현재 App 모드는 Pyodide worker로 전체 코드 블록을 순서 실행한다
4. `hideCode`를 기준으로 결과 중심 화면을 보여준다

## 설계상 중요한 점

- 문서 포맷은 외부 호환보다 Codaro canonical 모델이 우선이다
- 편집기 UI는 엔진 구현 세부사항을 직접 알면 안 된다
- GUI에서 가능한 조작은 장기적으로 API로도 노출되어야 한다
- 장기 목표상 AI가 편집기를 조작할 수 있어야 하므로 문서/실행/file API는 계속 확장될 예정이다
- `uv run codaro` 기본 진입은 편집기가 아니라 workspace shell 홈이다
- editor는 `path` 또는 `new=1` query가 있을 때만 열린다
- system 파일 API는 현재 workspace root 내부 경로만 허용한다
- package install/list/uninstall은 프로젝트 루트 `.venv`를 기준으로 동작한다
- 제품 배포 기준 source of truth는 장기적으로 `launcher/PRD.md`가 맡는다
- public docs/blog/search는 `landing/` static build로 배포한다
- editor surface는 full docs browser를 내장하지 않는다
  - IDE 안에는 `Context Help`만 둔다
  - 장문 docs/blog/search는 항상 `landing/` public site로 연다
- `curriculum`과 `learning-spec`은 학습 runtime 계약이지 generic docs browsing API가 아니다
- 서버 시작 시 frontend 자산 준비 상태, workspace root, content root, document path를 터미널에 출력한다
- CLI 로그는 명령 정규화 결과, 모드, URL, 브라우저 오픈 여부를 기록한다
- 기본 로그는 제품 모드 기준으로 조용해야 한다
  - startup, ready, save/export, package install/uninstall, interrupt, error 중심
  - 성공 request/fs/curriculum/document-load 같은 상세 흐름은 `--verbose` 또는 `CODARO_VERBOSE_LOGS=1`에서만 본다
- 요청 로그는 기본적으로 4xx/5xx만 기록하고, verbose일 때 `/`, `/app`, `/api/*` 성공 요청까지 method/path/status/duration/client를 기록한다
- frontend 로그는 ready|missing 상태와 build entry path를 기록한다
- document 로그는 load/save/export와 block insert/remove/move/update/run을 기록한다
- system 로그는 fs list/read/write/delete/move/mkdir/exists와 packages list/install/uninstall을 기록한다
- curriculum 로그는 categories, contents, content load, progress, exercise check를 기록한다
- kernel 로그는 session create/list/destroy, execute, variables, reactive execute, interrupt, reset, websocket connect/disconnect를 기록한다
- 에러 로그는 structured error envelope와 같은 기준으로 code/message를 함께 기록한다
- 터미널 로그는 event, level, field key/value에 ANSI 색상을 사용한다
- 경로는 기본적으로 `.` 또는 `./...`, `~/...` 형태로 축약해서 표시한다
- 프론트 시각 원칙과 UI 톤의 source of truth는 `frontend/DEV.md`에 둔다
  - 색상, radius, shadow, 학습 모드 chrome 밀도는 구현 전에 그 문서를 먼저 따른다
  - 학습 모드 툴바 축소와 셀 contextual menu 기준도 그 문서에 함께 묶는다
  - 공용 chrome은 `shadcn` 패턴, 편집기 셀 리듬은 `marimo` 기준이라는 현재 결정도 그 문서가 source of truth다

## 현재 기술 부채

- `api/`가 생겼지만 공통 에러 응답 포맷과 dependency 계층은 아직 더 정리할 여지가 있다
- 문서 블록 조작 API와 프론트 로컬 상태 조작이 이중화되어 있다
- App 모드는 아직 서버 커널이 아니라 Pyodide 전용 실행 경로다
- `system/packageOps.py`는 프로젝트 `.venv`를 전제로 한다
  - `.venv`가 없으면 명시적 에러를 반환한다
- `runtime/`은 이제 서버 커널 실행의 실제 엔진 계층으로 쓰이기 시작했다
  - `KernelSession`은 `LocalEngine` 어댑터 위에 있다
  - `LocalEngine`은 child process worker 기반으로 동작한다
- worker IPC는 단순 최종 응답 외에 실행 이벤트 스트림도 전달한다
- HTTP와 WebSocket kernel API는 변수 delta와 이벤트를 함께 노출한다
- `systemRouter`도 workspace 전용 `LocalEngine` capability를 사용한다
- launcher PRD는 embedded Python, GitHub manifest, PyPI wheel, rollback 구조를 기준으로 한다
- `launcher/codaro-launcher` Rust workspace가 생성됐고 path resolution, manifest/state 모델, backend health check 최소 경로가 있다
- launcher는 exact artifact download, sha256 검증, staged release layout, archive unpack, exact wheel install, active release activation까지 지원한다
- launcher는 `last-known-good`와 `rollback-marker` 상태를 관리하고 backend health failure 시 자동 rollback supervisor를 수행한다
- launcher는 `update check/apply` CLI로 manifest compatibility 판정과 health-gated release switch를 수행한다
- launcher는 persisted `update-config`와 GitHub Releases manifest discovery를 지원한다
- launcher는 `update sync`와 `autoUpdateOnLaunch`를 통해 startup 전 update apply까지 수행할 수 있다
- launcher는 healthy 이후 backend crash를 자동 재시작하고 repeated crash 시 `crash-state` freeze 후 rollback supervisor로 넘긴다
- package 분리와 PyPI publish 정책은 `launcher/PACKAGING.md`를 source of truth로 둔다
- 프론트 기본 실행 경로는 아직 WebSocket이 아니라 HTTP kernel route 중심이다
- source checkout에서는 frontend build가 선행되어야 하며, 서버는 빌드를 수행하지 않는다

## 다음 정리 방향

- `api/` 아래 router와 dependency 계층을 더 명확히 분리
- block 조작을 서버 API 우선으로 재정리
- 서버 커널과 Pyodide의 capability 표면 통일
- soft interrupt / hard interrupt 분리
- 실행 이벤트를 AI tool, diagnostics, audit log가 재사용할 수 있는 공통 표면으로 승격
- launcher runtime cache/dedupe와 signed artifact 검증 마무리
- AI 편집 조작을 위한 문서 API 확장
