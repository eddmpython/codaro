# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the GitHub Release body for each tag is generated from that version's section
in this file (see `docs/skills/ops/release/git-and-release.md`).

## Unreleased

(next release accumulates here)

## 0.2.3 - 2026-06-06

0.2.2 공개 직후 원격 CI에서 확인된 macOS 런처 health probe와 mobile-layout 정적 게이트를
패치했다. PyPI 발행은 이 CI 정리판 기준으로 진행한다.

### Fixed

- 런처 health check client가 localhost probe에서 proxy 설정을 타지 않도록 `no_proxy`를 적용했다.
- staged backend probe timeout을 실제 launch 경로와 같은 30초로 맞춰 느린 macOS runner의 cold start를 수용한다.
- Unix 런처 테스트 runtime이 shell wrapper보다 실제 Python 실행에 가까운 symlink를 우선 사용하도록 했다.
- `mainSurface` loading shell에 responsive spacing 클래스를 추가해 mobile-layout core surface gate를 통과하도록 했다.
- Playwright dogfood verifier의 위젯 API probe를 page execution context에서 request context로 옮겨 navigation timing flake를 제거했다.

### Verification

- `uv run python -X utf8 tests/run.py preflight` 3/3.
- `uv run python -X utf8 tests/run.py gate widget-bridge` 통과.
- `uv run python -X utf8 tests/run.py gate editor-build` 통과.
- `uv run python -X utf8 tests/run.py gate landing-build` 통과.
- `uv run python -X utf8 tests/run.py gate mobile-layout` 통과.
- `uv run python -X utf8 tests/run.py gate app-runtime` 통과.
- `python -X utf8 tests/run.py gate launcher-check` 통과.
- `python -X utf8 tests/run.py gate launcher-test` 통과.
- `uv run python -X utf8 tests/run.py gate install-launcher-smoke` 통과.
- `uv build --clear` 통과.

## 0.2.2 - 2026-06-06

런처 수신성, 자동화 영속 세션, 과제방 진행 추적, 학습 카드 계약, 테스트/릴리즈 운영면을 한 번에
정리했다. package/tag/launcher 버전을 `0.2.2`로 맞춰 기존 `0.2.1` 런처가 새 `Codaro.exe`를
업데이트 후보로 볼 수 있게 했다.

### Added

- 런처 다운로드 엔진 — `launcher/codaro-launcher/src/download.rs`가 HTTP 다운로드를 timeout, 재시도, resume, sha256 검증으로 처리하고 `provision.rs`가 runtime/wheel 수신 실패를 구조화된 failure card로 연결한다.
- 릴리즈 수신성 게이트 — `docs/skills/ops/tools/verifyPublishedRelease.py`, `.github/workflows/release-smoke.yml`, `.github/workflows/publish.yaml`을 추가해 GitHub Release 자산과 PyPI 발행 경로를 분리 검증한다.
- 자동화 영속 세션 — `src/codaro/automation/session/`과 `sessionFlow.py`, `sessionCellFlow.py`, automation tool handler/manifest/router가 open/run-step/query/list/close와 browser/desktop driver 경계를 제공한다.
- 에디터 automation 셀 런타임 — `editor/src/lib/automationCellRuntime.ts`와 notebook runtime hook이 automation 셀 실행 상태를 프론트 상태와 연결한다.
- 과제방 진행 추적 — `src/codaro/classroom/` 모델/store/sync/router와 `editor/src/components/classroom/assignmentRoomPanel.tsx`, `useAssignmentRoomState.ts`가 숙제 배포·진행 이벤트·relay queue를 다룬다.
- 학습 카드 계약 — `src/codaro/curriculum/cardContract.py`, `docs/skills/architecture/curriculum-card-contract.md`, `tests/curriculum/verifyCardContract.py`가 structured card type과 렌더 계약을 고정한다.
- 커리큘럼 보강 — requests 실무 레슨 3개(사업자등록 상태조회, 공휴일/영업일 계산, 환율 조회/환산)와 개발 교양 GitHub 소개 레슨을 추가했다.
- 테스트 도메인 트리 — `tests/`를 architecture/automation/classroom/curriculum/runtime/surface/teacher 등 책임별 폴더로 정리하고 `tests/_attempts/` 실험 샌드박스를 분리했다.

### Changed

- 릴리즈 자산 계약 — product-release 워크플로우의 package SBOM과 launcher SBOM 이름 충돌을 제거하고, manifest 기반 exact wheel/runtime 수신 검증을 문서화했다.
- 노트북 표면 — 검사기 아이콘 레일, 우측 검사기 상단 safe area, cell schema/model을 조정해 floating controls와 노트북 본문 충돌을 줄였다.
- 커리큘럼 Markdown 렌더러 — 링크, 영상 임베드, callout tone, horizontal card 등 structured card 표현을 확장했다.
- 게이트 운영 — `tests/run.py`, `docs/skills/ops/foundation/testing-and-gates.md`, CI workflow가 도메인별 gate 경로와 artifact freshness 검증을 따르도록 갱신됐다.
- Linux CI 런처 job — Ubuntu에서 GTK/WebKit 개발 패키지를 설치한 뒤 `cargo check/test`를 실행한다.

### Fixed

- widget round-trip 샘플이 `radio`, `multiselect`, `date`, `file`, `form` UI descriptor를 빠뜨려 CI `widget-bridge`가 실패하던 문제를 고쳤다.
- Unix 테스트 runtime wrapper가 shell 자식으로 Python을 띄워 macOS 런처 테스트에서 orphan backend process가 남을 수 있던 문제를 `exec` 기반 wrapper로 고쳤다.
- 런처 provision의 HTTP 본문 수신 timeout/부분 수신 취약점을 스트리밍 다운로드와 range resume 경로로 보강했다.

### Verification

- `uv run python -X utf8 tests/run.py preflight` 3/3.
- `uv run python -X utf8 tests/run.py gate widget-bridge` 통과.
- `uv run python -X utf8 tests/run.py gate editor-build` 통과.
- `uv run python -X utf8 tests/run.py gate landing-build` 통과.
- `python -X utf8 tests/run.py gate launcher-check` 통과.
- `python -X utf8 tests/run.py gate launcher-test` 통과.
- `uv run python -X utf8 tests/run.py gate install-launcher-smoke` 통과.
- `uv build --clear` 통과.

## 0.0.11 - 2026-06-04

marimo의 로컬-우선 리액티브 개념을 에디터 본체로 흡수하고(정합성 계약·탐색 UI·입력 위젯·리액티브
마크다운·제어 흐름·인라인 의존성·ipynb 변환), "운영 안전" 커리큘럼 트랙을 신설했다. WASM/pyodide/marimo
런타임은 제외하고 plain-python·로컬 실행 정체성을 지켰다.

### Added

- 리액티브 정합성 진단 — `ReactiveDiagnostics`가 순환 의존·다중 정의·셀 간 외부 변수 변경(cross-cell mutation)을 잡아 reactive payload·WS에 동봉하고, 셀 삭제 시 커널에서 그 셀의 변수를 정리 (`src/codaro/kernel/reactive.py`, `src/codaro/document/analysis.py`, `src/codaro/kernel/executionPayload.py`).
- 탐색 UI — 노트북 우측 패널을 [튜터·변수·의존성] 탭으로 나누고, 변수 탐색기(이름·shape·dtype·정의 셀)와 의존성 그래프 패널을 추가 (`editor/src/components/notebook/variableExplorerPanel.tsx`, `editor/src/components/notebook/dependencyGraphPanel.tsx`, `editor/src/lib/dependencyGraphLayout.ts`).
- 입력 위젯 5종 — `ui.radio/multiselect/date/file/form`을 `UiValue` 모델에 추가, widgetHost가 native input으로 렌더하고 값 변경 시 의존 셀을 재실행 (`src/codaro/outputDescriptor.py`, `src/codaro/uiValue.py`, `editor/src/components/widgets/widgetHost.tsx`).
- 리액티브 마크다운 — 마크다운 셀이 `{변수}`를 보간하고 HTML로 렌더되며, 의존 변수가 바뀌면 자동 갱신. `markdown()`이 순수 Python `markdown` 라이브러리로 HTML을 생성 (`src/codaro/outputDescriptor.py`, `src/codaro/kernel/reactive.py`, `editor/src/components/notebook/notebookPanel.tsx`).
- 제어·반응 — `stop(predicate, output)`으로 조건부 셀 중단(다운스트림 프루닝), `state(value)`로 셀 간 반응형 공유 상태, 편집 세션 autoreload(임포트한 사용자 모듈 편집 시 재실행) (`src/codaro/outputDescriptor.py`, `src/codaro/runtime/localWorker.py`, `src/codaro/kernel/session.py`).
- PEP 723 인라인 의존성 — 노트북 `.py` 상단 `# /// script` 블록의 `dependencies`를 `tomllib`로 파싱해 `RuntimeConfig.packages`에 병합하고 라운드트립 직렬화 (`src/codaro/document/percentFormat.py`).
- jupyter(.ipynb) 변환 — `.ipynb`를 CodaroDocument로 변환(셀 매핑·출력 버림·`%`/`!`/`%%` magic 주석 처리) (`src/codaro/document/jupyterFormat.py`).
- lint 진단 확장 — self-import·정의 순서·빈 셀·위험 system call(os.system 등)을 정적 진단으로 추가 (`src/codaro/document/analysis.py`, `src/codaro/kernel/reactive.py`, `editor/src/lib/reactiveDiagnostics.ts`).
- 커리큘럼 운영 안전(resilience) 트랙 + 견고한 자동화 4강 — 멱등성과 처리 원장, 재개 가능한 체크포인트, 원자적 쓰기, pandas 읽기 계약과 타입 손상. 표준 라이브러리 기반(P1은 pandas)이고 snippet/solution이 assert로 개념을 검증한다 (`curricula/python/automation/os/resilience/01_멱등성과처리원장.yaml`, `curricula/python/automation/os/resilience/02_재개가능체크포인트.yaml`, `curricula/python/automation/os/resilience/03_원자적쓰기.yaml`, `curricula/python/dataAnalysis/pandas/11_읽기계약과타입손상.yaml`, `curricula/python/__init__.py`, `curricula/python/_taxonomy.yml`, `editor/src/lib/curriculaRegistry.ts`).

### Changed

- 셀 간 변수 재할당이 plain Python처럼 동작 — `total = total + 5`의 우변 자기참조 읽기를 use로 인식해, 같은 변수를 다른 셀에서 재할당해도 에러 없이 동작한다 (`src/codaro/document/analysis.py`).
- `executeReactive`가 stopped 셀의 다운스트림을 `dependents`로 프루닝(에러 break 대신 가지치기)하고, 마크다운 셀을 리액티브 노드로 포함한다 (`src/codaro/kernel/reactive.py`, `src/codaro/runtime/localWorker.py`).

### Fixed

- 편집 세션 autoreload가 codaro 자신을 재로드해 `StopExecution` 클래스 정체성이 깨지던 문제 — `_reloadChangedUserModules`가 `codaro.*`와 site-packages를 제외하도록 수정 (`src/codaro/runtime/localWorker.py`).

### Verification

- `uv run python -X utf8 tests/run.py preflight` 3/3 (1305 passed, 5 skipped).
- `uv run python -X utf8 tests/auditCurriculumExecutability.py` real-bug 0 / yaml-load-error 0 / undeclared-package 0 (4,292 체크).
- `uv run python -X utf8 tests/run.py quality-cycle` 22/22.
- `npm --prefix editor run check && npm --prefix editor run build` 성공.

## 0.0.10 - 2026-06-03

리액티브 노트북을 "살아있게" 만들었다 — 위젯을 변수에 담으면(`slider = ui.slider(0, 100)`) 슬라이더를
드래그할 때 그 변수를 쓰는 셀만 자동 재실행되고(위젯 정의 셀은 값 리셋 방지로 제외), 순환 의존은 실행
순서를 잡아 표면에 노출한다. marimo의 로컬-우선 리액티브 강점을 흡수하되 WASM/pyodide는 제외했다.

### Added

- 리액티브 위젯 값 바인딩 — `ui.slider/dropdown/number/checkbox`가 값 객체(`UiValue`)를 반환하고, 값 변경 시 `POST /api/kernel/{id}/set-ui-value`로 그 변수를 쓰는 다운스트림 셀만 재실행한다. 값은 위치 기반 id(`{blockId}#{index}`)로 워커 store에 영속(셀 재실행에도 유지) (`src/codaro/uiValue.py`, `src/codaro/outputDescriptor.py`, `src/codaro/api/kernelRouter.py`).
- 프론트 위젯 바인딩 — `widgetHost`의 값 위젯이 150ms 디바운스로 값 변경을 송신하고, 노트북 런타임이 의존 셀 출력을 갱신 (`editor/src/components/widgets/widgetHost.tsx`, `editor/src/lib/notebookRuntime.ts`, `editor/src/hooks/useNotebookRuntimeState.ts`).
- 리액티브 순환 의존 감지 — `reactive.detectCycles`가 의존 그래프의 순환(A↔B 등)을 잡아 reactive payload·WS `reactiveComplete`에 `cycles`로 동봉 (`src/codaro/kernel/reactive.py`, `executionPayload.py`).

### Changed

- `getReactiveOrder`/`executeReactive`/`executeKernelReactive`에 `includeSource`(기본 True) — 위젯 값 변경 시 source(위젯 정의) 셀을 제외하고 다운스트림만 재실행.
- 위젯 값 위젯이 bare descriptor가 아닌 `UiValue` 객체를 반환하도록 팩토리 확장(렌더 형태는 `codaroDescriptor()`로 불변, layout 중첩 UiValue도 직렬화).

### Verification

- `uv run python -X utf8 tests/run.py quality-cycle` 22/22 게이트 통과(soft-fail 0).
- 신규 테스트: `tests/testReactiveCycles.py`, `tests/testUiValueBinding.py`; HTTP/WS set-ui-value 라운드트립(`tests/testServerApi.py`).

## 0.0.9 - 2026-06-03

지능형 학습 루프를 라이브 학습 화면에 연결했다 — 검증 버튼이 채점·오개념 진단·다음 행동까지 닫고,
완료한 개념을 간격 반복으로 되살린다. 진단 신호를 정직하게 다듬고(신호강도 가중 mastery·불확실성
하한), 학습/편집기 코드를 자동화 태스크로 가져가는 경로와 실행 리포트 영속·diff를 추가했다. 초보가
첫 화면에서 마주치던 사족(실행 전 예측 카드·검증 기준 덤프)을 걷어내고 5층 아키텍처 경계를 게이트로
강제했다.

### Added

- 라이브 학습 검증 루프 — 검증 버튼 → 채점 → 오개념·다음 행동 패널, 통과 시 레슨 완료 기록과 진행률·여정·복습 advance (`src/codaro/curriculum/checkFlow.py`, `editor/src/components/curriculum/`, `editor/src/lib/curriculumCheck.ts`).
- 오개념 카탈로그 다수 — python.intro, 표준 라이브러리, 연산자·numpy 입문, 데이터 결합·시계열, 시각화·dataclass·머신러닝 입문, JSON 직렬화, asyncio, 문자열 처리, 선형대수, 컨텍스트 매니저, 정규식, HTTP GET, Excel(openpyxl) (`curricula/python/_misconceptions/`).
- 학습 홈 메타인지 surface — 약점 영역(미해결 오개념 집계 + 복습 레슨 바로가기), 복습 due 레슨(간격 반복), 학습 여정 추천(초급→중급→실무→고급), 숙달 개념 수.
- 간격 반복 복습 — 레슨 완료 시 SM-2 복습 상태 seed, 복습 회상 평가로 retention 루프 (`src/codaro/curriculum/reviewScheduler.py`, `reviewFlow.py`, `progress.py`).
- engine 실행 포착 primitive `captureDocument`와 numpy/pandas shape/dtype introspection — authoring·diagnostics·automation 공유 (`src/codaro/kernel/documentExecution.py`, `runtime/localWorker.py`).
- 레퍼런스-솔루션 강한-체크 제안기(dev tooling, 출력 전용·YAML 미변경) (`tests/authorReferenceChecks.py`).
- 자동화 — 실행 기록 디스크 영속화 + 직전대비 diff (`src/codaro/automation/reportDiff.py`, `taskRegistry.py`), 재시작 시 스케줄 복원, 완료 시 채널 알림, 학습 코드 → 태스크 Harvest(`POST /api/tasks/from-code`) + 숙달 졸업 게이트.
- 5층 아키텍처 import 게이트 (`tests/testArchitectureLayerContract.py`), 학습 셀 로컬-우선 정적 자동완성, 런처 로딩 화면 마스코트 아바타.

### Changed

- mastery 정직성 — 체크 신호강도 가중 + slip/guess 결합 (`src/codaro/curriculum/masterySignal.py`), Wilson 불확실성 하한 기반 "mastered" 판정과 강한 관측 요구 (`learnerState.py`), 다음-단계 진급을 raw score가 아닌 정직한 숙달로 (`ai/toolHandlers/diagnostics.py`).
- transport/도메인 경계 정리 — provider·채팅·자동화·커리큘럼 surface 책임 분리(사용자 동작 불변, 계층 게이트 충족).
- 30days day1~2 예측 grain 정리 — day1 타입 예측 제거, day2(데이터 타입) 타입 예측 추가.
- 사이드바 베타 표시 — 커리큘럼(현재 학습)만 정식, 나머지 표면(대화·노트북·자동화)과 터미널에 베타 배지 (`editor/src/lib/surfaceModel.ts`, `components/app/productSidebar.tsx`).

### Removed

- "실행 전 예측" 학습자 카드 — 표면에서 제거(백엔드 predict 인프라는 튜터 도구 경로용으로 보존). `editor/src/components/curriculum/predictCard.tsx` 삭제, predict-contract-strict 비활성.
- 검증 기준 카드 — 내부 채점 설정을 학습자에게 덤프하던 자동 생성 블록을 converter 생성 지점에서 제거 (`src/codaro/curriculum/converter.py`).

### Fixed

- 예측 placeholder("(…적어주세요)") 정규화 + 예측 입력 hint가 정답을 노출하던 스포일러 제거.
- 다운로드 링크 자산명을 게시 자산(`Codaro.exe`·`codaro.spdx.json`)으로 맞춰 404 해소, 성능 예산·품질 audit 게이트 stale 복구, 온보딩 브라우저 게이트 복구.

### Verification

- `uv run python -X utf8 tests/run.py quality-cycle` 22/22 게이트 통과(soft-fail 0).
- `uv run python -X utf8 tests/run.py preflight` green.

## 0.0.7 - 2026-05-31

학습 화면을 정리하고(검증 사족 제거·셀/섹션 배치 개선), polars DataFrame 출력을 깨진 HTML 덤프에서 표로 고치고,
전역 터미널과 레슨별 댓글(Giscus)을 추가했다. 사이드바 네비게이션 버벅임을 없애고, 더블클릭으로 창이 안 뜨던 런처를 고쳤다.

### Added

- 전역 터미널: 좌측 사이드바 터미널 버튼 → 본문을 밀어 올리는 하단 패널(xterm.js)에 실제 로컬 셸 연결. 백엔드 PTY 추가(`src/codaro/api/terminalWebSocket.py`, `terminalRouter.py`; Windows는 pywinpty/ConPTY, POSIX는 `pty.fork`).
- 레슨 하단 댓글 — GitHub Discussions 기반 Giscus(`editor/src/components/curriculum/lessonComments.tsx`, `editor/src/lib/giscusConfig.ts`). 레슨마다 `lesson:<category>/<contentId>` 토론에 매핑, 오프라인이면 안내로 graceful degrade.
- DataFrame 표 렌더 컴포넌트(`editor/src/components/app/appPrimitives.tsx`의 `DataFrameOutput`)와 사이드바 펼침 상태 영속 훅(`editor/src/hooks/useSidebarExpansionState.ts`).
- 랜딩: 브랜드 아바타 이미지/웹폰트 자산 추가.

### Changed

- 에디터 탑바 제거 → floating 컨트롤(`topBar.tsx`의 `TopControls`): SNS 아이콘을 최상단 우측으로, 본문/우측 패널이 세로 전체를 사용. 좌·우상단 아이콘 클러스터 갭 축소.
- 노트북 셀: `+` 버튼을 코드/마크다운 에디터 박스의 위·아래 모서리에 고정(`notebookPanel.tsx`), 셀 간격 축소. 실행 버튼을 에디터 우측·아이콘만·"모두 실행"으로.
- 커리큘럼 섹션 개요 재배치(이번 섹션에서 공부할 것·왜 유용한지·팁을 한 행 3열, 상세 설명은 단독 전체 폭 행) + 가독성 개선(아이콘 틴트 칩·좌측 액센트 보더·본문 대비 상향).
- 시스템 기본 표시 언어를 한국어로(`useLocaleState.ts`, `localeCopy.ts`). 후원 카드 색상/디자인 보강.
- PWA service worker(`editor/vite.config.ts`): `skipWaiting`/`clientsClaim`/`cleanupOutdatedCaches`로 재빌드 후 stale 캐시가 빈 화면을 만들던 문제 방지.
- 랜딩 사이트 재설계(`landing/src/styles.css` 대폭 갱신, `App.jsx`·prerender 스크립트 갱신).
- 런처 버전 0.2.0 → 0.2.1.

### Fixed

- 런처를 더블클릭하면 창이 안 뜨던 문제 — 인자 없이 실행하면 기본 launch로 네이티브 창을 띄우도록(`launcher/codaro-launcher/src/main.rs`, `command: Option<Command>` + `LaunchArgs::default()`).
- 커리큘럼 사이드바에서 다른 레슨을 클릭해도 본문(코드 셀)이 안 바뀌던 문제 — 레슨 변경 시 `CurriculumView`를 `key`로 remount(`mainSurface.tsx`).
- 사이드바 네비게이션 때 펼쳐둔 카테고리가 초기화돼 버벅이던 문제 — 펼침 상태를 localStorage에 영속 + 트리 빌드 `useMemo`(`productSidebar.tsx`).
- polars `DataFrame.head()` 출력이 `<style>`+이스케이프된 HTML 텍스트로 덤프되던 문제 — polars/pandas를 구조화 직렬화(`src/codaro/runtime/localWorker.py`의 `_serializeDataFrame`)하고 프론트에서 표로 렌더.

### Removed

- 검증 시스템 전체 — "검증하기" 버튼, "검증 기준 / 실행 조건 / 확인할 것" 박스, 실습 헤더의 "확인:" 텍스트. 셀마다 비슷한 generic 보일러플레이트라 학습 카드를 어지럽혀 제거(실제 평가 로직은 백엔드에 남김).
- 실행 전 예측 카드, 빈 코드 셀의 입력 플레이스홀더.

### Verification

- `uv run python -X utf8 tests/run.py preflight` → 9/9 게이트 통과(root-clean·docs·backend·widget-bridge·app-runtime·mobile-layout·editor-build·curriculum-quality-matrix·curriculum-executability).
- 에디터 빌드(`npm --prefix editor run build`)와 랜딩 빌드(`npm --prefix landing run build`) 통과.

## 0.0.6 - 2026-05-31

Names and brands the launcher. The download is now `Codaro.exe` (was `CodaroLauncher.exe`)
and the executable and its window carry the Codaro mascot avatar as their icon.

### Changed

- Renamed the launcher download asset from `CodaroLauncher.exe` to `Codaro.exe` across the release workflow, self-update asset resolution, landing download buttons, README, and docs. Self-update resolves the new asset name, so existing launchers can update to it.
- Embedded the Codaro mascot avatar as the Windows executable icon via a `winresource` build script (multi-resolution `.ico`) and set the same avatar as the application window/taskbar icon.

### Verification

- `uv run python -X utf8 tests/run.py preflight` -> all gates pass
- `cargo test` (launcher) and a local release build confirmed; the built executable's embedded icon extracts as the Codaro avatar.
- Downloaded `Codaro.exe` confirmed: avatar file icon, avatar window icon, native window, and curriculum cells run.

## 0.0.5 - 2026-05-30

Fixes the data-science worker crash that still blocked lessons in `0.0.4`. The libraries
were bundled, but executing `import numpy`/`pandas` in a cell crashed the execution worker
with `OpenBLAS error: Memory allocation still failed`, surfaced to the user as a worker
restart and `EOFError`.

### Fixed

- Limited the BLAS/OpenMP thread pools (`OPENBLAS_NUM_THREADS`, `OMP_NUM_THREADS`, `MKL_NUM_THREADS`, `NUMEXPR_NUM_THREADS` = 1) and pinned matplotlib to the headless `Agg` backend in the execution worker, set before any cell imports NumPy. OpenBLAS pre-allocates per-thread buffers sized to the CPU count; in spawned worker processes (especially with several sessions open) that allocation failed and killed the worker, so every data lesson crashed. Values the user sets explicitly are preserved.

### Verification

- `uv run python -X utf8 tests/run.py preflight` -> all gates pass
- Downloaded `CodaroLauncher.exe` confirmed: `import pandas`/`numpy` and a matplotlib `Agg` plot run across multiple kernel sessions without setting any environment variables, and no startup-diagnostics banner.

## 0.0.4 - 2026-05-30

Makes the curriculum actually run from the downloaded launcher. The native window
opened in `0.0.3`, but lesson cells failed with `ModuleNotFoundError` because the
managed runtime shipped only the backend's core dependencies — not the data-science
stack the lessons import.

### Fixed

- Bundled the curriculum library stack (`pandas`, `numpy`, `matplotlib`, `seaborn`, `plotly`, `polars`, `scikit-learn`, `scipy`, `statsmodels`, `openpyxl`, `python-docx`, `pillow`) into the managed Python runtime. Lesson cells execute in the backend interpreter in-process, so these libraries must be present in the runtime — without them every data lesson raised `ModuleNotFoundError`.
- Resolved the package environment to the running interpreter when no project `.venv` exists, so the packaged managed runtime no longer raises the `package_environment_missing` "Startup diagnostics required" banner and on-demand package install targets the runtime. Development checkouts with a project `.venv` are unchanged.

### Verification

- `uv run python -X utf8 tests/run.py preflight` -> all gates pass
- Downloaded `CodaroLauncher.exe` confirmed: native window with no startup-diagnostics banner, and a curriculum cell importing `pandas` runs successfully.

## 0.0.3 - 2026-05-30

First public download train (`v0.0.1` -> `v0.0.3`) documented as a release. The launcher
now opens an embedded native window instead of a browser tab, and provisioning installs a
runtime that actually runs. The `0.0.x` line is the download-first distribution train and
restarts below the historical internal `0.1.0` package version.

### Added

- Embedded native launcher window built on `tao` 0.33 + `wry` 0.49 (WebView2). `CodaroLauncher.exe` shows a zinc loading screen while it provisions, then loads the local backend inside its own window instead of opening a browser tab.
- `--no-webview` headless fallback that provisions the backend and opens it in the system browser, used by the install-launcher smoke gate and CLI paths.
- Public GitHub Pages landing page focused on Codaro desktop download, local-first positioning, product surfaces, and release trust signals.
- Landing SEO metadata for the desktop product surface, including `SoftwareApplication` structured data and canonical URL handling for GitHub Pages.
- Launcher release workflow with stable `CodaroLauncher.exe`, checksum, and SPDX SBOM asset names, plus a managed Windows Python runtime archive pinned by `release-manifest.json`.
- GitHub Release bodies are now derived from this changelog at tag time (the release workflow extracts the tag's section with `docs/skills/ops/tools/extractChangelogSection.py`), so every release ships a written message.

### Fixed

- Bundled the runtime Python archive with backend dependencies (`fastapi`, `pydantic`, `pyyaml`, `requests`, `uvicorn`) pre-installed, so the launcher's `--no-deps` wheel install no longer fails at startup with `ModuleNotFoundError`.
- Staged the bundled curricula into the backend wheel and resolved the curricula root for both the packaged runtime and local checkouts.
- Hid the console window on Windows so the launcher presents only its native app window.
- Corrected the launcher release workflow to upload artifacts from the Cargo workspace target directory at `launcher/target/release`.

### Verification

- `uv run python -X utf8 tests/run.py preflight` -> all gates pass
- `uv run python -X utf8 tests/run.py gate install-launcher-smoke` -> pass
- `uv run python -X utf8 tests/run.py gate launcher-test` -> pass (`cargo test`)
- Local launch with a fresh approot confirmed a native `Codaro` window with embedded `msedgewebview2` processes and the backend serving 39 curriculum categories.

## 0.1.0 - 2026-03-24

### Added

- AI editor bridge for `insert-block`, `update-block`, `delete-block`, and `execute-reactive`.
- Diff preview flow with pending diff queue, block-level accept/reject, and "Fix with AI" error repair path.
- Inline AI completion endpoint and CodeMirror ghost text integration.
- Automation dashboard surfaces including task list/detail, recording controls, workflow list/builder, scheduler state, channel config, agent activity, safety dashboard, and plan execution view.
- Desktop automation backend capabilities for audit trail, E-Stop, recorder, input guard, vision capture, OCR, voice, integrations, and custom tool registration.
- Learning mode runtime with guide blocks, hint accordion, exercise feedback, progress dashboard data flow, adaptive teaching tools, and achievement tracking.
- Report mode, mobile bottom bar, manifest, and service worker assets for PWA-oriented output viewing.
- Widget renderer coverage for button, toggle, slider, number, dropdown, textarea, progress, and table descriptors.
- Runtime process supervisor and broader execution capability plumbing.
- Frontend smoke tests covering automation, learning, and report mode flows.

### Changed

- Removed the legacy reactive document adapter from the active document surface.
- Expanded tool rendering across editor, automation, learning, and integration actions.
- Split large frontend bundles with AutomationMode lazy loading and vendor manual chunking.
- Tightened Svelte 5 runes and accessibility handling across key editor components.
- Updated packaging and launcher documentation to reflect trusted publishing and exact wheel distribution policy.

### Fixed

- Reduced false positives in document dependency analysis for nested scopes and comprehension variables.
- Improved engine/runtime behavior around worker management, variables, and process lifecycle.
- Stabilized soft interrupt handling so worker resets do not surface as connection-reset crashes in CI.
- Cleaned frontend warning sources in dialog, toast, mode switcher, hint, guide, and widget surfaces.
- Corrected the PyPI workflow to validate the adapter-static editor output in `src/codaro/webBuild` and run tests with the `dev` extra installed.
- Fixed main CI drift by syncing launcher call sites with the current Rust APIs and installing backend test dependencies in GitHub Actions.

### Verification

- `uv run pytest tests/ -q` -> `403 passed, 6 skipped`
- `editor/npm run test` -> `19 passed`
- `editor/npm run build` -> success
- `uv build` -> `codaro-0.1.0.tar.gz`, `codaro-0.1.0-py3-none-any.whl`
