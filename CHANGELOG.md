# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the GitHub Release body for each tag is generated from that version's section
in this file (see `docs/skills/ops/release/git-and-release.md`).

## Unreleased

(next release accumulates here)

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
