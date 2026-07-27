# Notebook Workbench

상태: 진행

## 목표

`/run/`을 장식과 상태 배지를 덜어낸 즉시 실행 가능한 자유 노트북으로 만들고, Local에서도 같은 컴포넌트와 셀 문법을 유지한다.

## 범위

- 첫 진입 빈 runnable code cell
- 정상 runtime·저장 완료는 숨기고 실행 중·저장 중·오류만 점진적으로 노출
- 가운데 파일명, 조용한 cell frame, 하단 cell 추가와 가장자리 전체 실행
- `Shift+Enter` 실행 후 다음 셀 이동 또는 빈 code cell 생성
- code, output, error, verification의 명확한 시각 계층
- 44px 이상 mobile Run control과 safe area
- 기존 cell 실행, reactive dependency, automation 승격 동작 보존
- DartLab notebook과 같은 `compact`, `medium`, `full` 문서 폭 및 실제 reactive 실행 전환
- Web Run과 Local의 `NotebookSurface → NotebookPanel` 단일 컴포넌트 트리

## 종료 조건

- bare `/run/` 첫 paint에 예제 없는 편집 가능한 빈 코드 셀과 전체 실행 control이 보임
- 정상 첫 화면에 Local/Web 배지, 저장 완료 배지, cell 종류 label, runtime rail이 상시 보이지 않음
- 실행 뒤 출력과 오류가 같은 cell 아래에 자동 표시됨
- `Shift+Enter`가 실행과 다음 셀 focus를 한 동작으로 처리함
- desktop, mobile, Light, Dark screenshot matrix 통과
- notebook 기능 회귀 gate 통과

## 현재 증거

- 새 자유 노트북은 `Untitled`와 빈 코드 셀 하나로 시작한다. 화면 제목은 실제 문서 경로와 분리해 포커스를 잃어도 `.py`를 강제로 붙이지 않는다.
- 상단 왼쪽은 `Codaro notebook`, 중앙은 편집 가능한 제목, 오른쪽은 `테마 → 노트북 설정 → GitHub → 하트 → YouTube → Threads` 순서를 사용한다. 공용 SNS는 생성 컴포넌트를 소비하고, 설정 버튼은 닫힌 상태에서 시작해 tutor·변수·dependency 도구를 명시적으로 열고 닫는다.
- 문서 하단의 추가 control은 DartLab과 같은 `+ Code`, `+ Markdown` 표기다. 왼쪽 아래는 `compact`, `medium`, `full` 폭 전환, 오른쪽 아래는 실제 reactive 실행 전환과 전체 실행을 둔다.
- desktop 우하단 실행 control은 36px 원형이고 mobile에서는 44px target으로 커진다. reactive를 끄면 `codaro:reactive-trigger` 자동 전체 실행을 차단하고 수동 셀 및 전체 실행은 유지한다.
- Web draft는 브라우저 저장소에 즉시 보존되고 reload 뒤 복원된다. Local draft는 700ms debounce 뒤 실제 workspace 파일에 저장된다. 저장 측정 속성은 유지하되 화면에는 pending, saving, error만 표시한다.
- page hide와 background 전환은 일반 저장을 먼저 시작하고 UTF-8 요청 body 60KiB 이하에서만 보조 keepalive를 보낸다. 더 큰 미저장 문서는 keepalive를 강제 차단하고 일반 저장이 끝날 때까지 native 이탈 경고를 사용한다.
- Local 경로는 `(documentId, path)`가 함께 소유해 새 문서가 이전 파일을 덮지 않는다. server는 session·document별 revision을 잠가 역순 요청을 거절하고 기존 이름과 겹치면 고유 경로를 할당한다.
- Local 파일은 같은 디렉터리의 임시 파일을 flush·fsync한 뒤 `os.replace`로 교체한다. write, fsync, replace 실패 시 마지막 정상 파일과 원본 mode를 보존하고 임시 파일을 정리한다.
- `.ipynb` 자동 저장은 출력, metadata, attachment, execution count, magic이 있는 원본을 byte-for-byte 보존하고 같은 디렉터리의 고유 `*.codaro.py` 사본으로 승격한다. 수동 Jupyter round trip은 별도 범위다.
- mobile 44px 실행 control과 desktop 36px 우측 하단 실행 영역을 적용했다.
- mobile에서도 편집 가능한 문서 제목과 공용 테마·SNS 레인을 유지한다. 320px·390px에서 제목과 우상단 control의 겹침은 0이고, 셀 실행과 44px overflow trigger는 셀 프레임 안에 둔다. 도움·삭제는 overflow를 열기 전에는 화면과 접근성 트리에서 숨긴다.
- 노트북과 현재 학습 실행 셀은 `workCell.css`의 frame, output, action primitive를 함께 사용한다.
- Web Run과 Local은 `apiOnline`으로 실행·저장 capability만 나누고 같은 Notebook 컴포넌트 트리와 CSS를 사용한다.
- Chromium 149.0.7827.55에서 Web Run desktop 1440×900, mobile 320×720·390×844의 Dark 대표 case와 390×844 Light case, Local Run 900×640 Dark case가 통과했다.
- Web desktop·mobile 감사에서 빈 code input 1개, 기본 노출 runtime·persistence status 0개, overlap 0개, horizontal overflow 0px를 확인했다. 320px에서는 문맥형 cell action과 48px mobile product navigation target을 유지한다.
- Web desktop에서 빈 첫 셀에 코드를 입력하고 `Shift+Enter`를 누른 뒤 출력 생성, 두 번째 빈 code cell 생성, 두 번째 editor 선택과 DOM focus를 확인했다.
- Local Run은 같은 Notebook 컴포넌트와 CSS로 렌더링됐고 Local kernel session 생성·종료와 runtime tier `local`을 확인했다.
- Web desktop과 Local minimum에서 실제 Python 셀을 `running → success → running → error`로 전이하고, 정상 상태는 다시 숨기며 성공·오류 결과가 해당 셀 아래에 표시되는지 확인했다.
- Run·Local·자동화 6-case 모두 공용 우상단 SNS `github`, `support`, `youtube`, `threads`와 같은 theme runtime을 사용한다. 최소 노트북 case는 `Codaro notebook`, 세 폭 control, reactive control, `+ Code`, `+ Markdown`을 함께 검사한다. Web 자동화의 Local 전용 template은 `Local 필요`, Local 연결 뒤 같은 template은 가용 상태다.
- Chromium, Firefox, WebKit 12-case 시각 접근성 검사에서 theme control, SNS 순서, 키보드 focus, 후원 팝업 focus trap, 정확한 계좌번호 `1002-0421-4626`, Dark·Light 대비와 320px 이상 가로 overflow 0px를 확인했다.
- 2026-07-27 프로덕션 산출물 기준 `web-run-compact` Dark, `web-run-mobile` Light, `web-run-desktop` Dark, `local-run-minimum` Dark가 Chromium 149에서 각각 통과했다. 모바일 case는 제목 노출, 닫힌 셀 보조 메뉴, 44px trigger의 셀 내부 배치까지 검사한다.
- 레슨의 category, lesson, path, section query를 가진 URL에서 자유 노트북으로 전환해도 bundled curriculum 로드를 경고로 표시하지 않는다. `web-run-desktop`은 이 실제 전환 URL에서 상단 배경 알림 0개, 빈 code cell 1개와 노트북 control lane을 확인한다.
- 연결 이력이 없는 외부 제공자 안내와 끊어진 연결 안내는 대화 surface에서만 보인다. backend offline은 실행과 저장에 직접 영향을 주므로 비학습 surface 전체에 유지하고, 집중 학습 surface에는 연결 안내를 렌더하지 않는다.
- 2026-07-27 production build 뒤 Chromium `web-run-desktop` 1440×900 Dark에서 기본 연결 안내 0개, 닫힌 도구 패널 0개를 확인하고 설정 버튼의 `aria-pressed=false → true → false`와 패널 mount·detach를 실제 클릭으로 검증했다.
- 같은 source를 포함한 current-commit wheel을 설치한 Windows 11 build 26200, WebView2 `Edg/150.0.4078.99`의 Local Notebook 1024×768에서 연결 안내 0개, 기본 도구 패널 0개, overflow 0px, 공용 SNS 순서와 테마 control을 확인했다.
- 노트북 문서는 `list`, 셀은 순번이 있는 `listitem`, active cell은 `aria-live=polite` 상태로 노출한다. DOM 읽기 순서는 셀 입력, 출력, 문맥 action, 문서 하단 폭·실행 control 순서이며 Chromium 149의 Web Run desktop에서 실제 순서를 검사했다.
- Chromium 149의 Day 1 `Web → Local → Web` 왕복은 Local 재내보내기 뒤 Web이 증거 3개와 초안, `mixed` runtime identity를 복원하고 같은 root hash와 portable payload bytes를 다시 내보내는지 확인했다.
- 시각 증거는 `output/test-runner/product-experience-browser/screenshots/{dark,light}/web-run-{desktop,mobile}.png`, Local 증거는 `output/test-runner/product-experience-browser/screenshots/dark/local-run-minimum.png`에 남겼다.
- 기계 판정은 `output/test-runner/notebook-redesign/`의 Web Dark·Light와 Local report, `output/test-runner/run-local-state-browser/run-local-state-report.json`에 남겼다.

## 남은 조건

- 실제 WebView2 기본 notebook 1024x768, 공용 테마·SNS와 native client·DOM 크기 일치는 자동 검증됐다.
- 실제 WebView2에서 긴 notebook, keyboard-only cell 이동, screen reader reading order, IME 수동 검수

## 영향 파일

- `editor/src/components/app/topBar.tsx`: 왼쪽 `Codaro notebook`, 가운데 `Untitled` 제목, 오른쪽 테마와 공용 SNS
- `editor/src/lib/curriculumSelection.ts`: Web bundled lesson 로드를 정상 배경 상태로 분류해 자유 노트북의 진짜 경고와 분리
- `editor/src/components/notebook/notebookCommandBar.tsx`: 점진적 실행·저장 상태, 세 문서 폭 control, reactive 전환, floating 전체 실행
- `editor/src/components/notebook/notebookPanel.tsx`: 빈 code cell, `Shift+Enter` 이동, code/Markdown cell과 output·error 렌더링
- `editor/src/components/notebook/notebookPanel.css`: 조용한 기본 화면, 문맥형 cell action, compact code/output 계층, mobile control
- `editor/src/components/app/workCell.css`: 노트북과 현재 학습이 함께 쓰는 실행 셀 시각 primitive
- `editor/src/components/app/notebookSurface.tsx`: Notebook panel과 inspector 조합
- `editor/src/lib/providerReconnectPolicy.ts`: surface와 연결 상태별로 복구 안내를 노출할 수 있는 범위
- `editor/src/hooks/useNotebookDocumentState.ts`, `editor/src/lib/notebookPersistence.ts`, `editor/src/lib/documentSavePolicy.ts`: Web durable draft와 Local debounce·revision·경로 소유권·bounded keepalive 저장
- `src/codaro/api/documentRouter.py`: workspace 고유 경로, stale revision 거절, Jupyter 원본 보호 사본
- `src/codaro/document/service.py`: Python·Percent·Jupyter 공용 원자 저장
- `editor/src/lib/notebookRuntime.ts`, `editor/src/hooks/useNotebookRuntimeState.ts`: 단일 cell 실행과 reactive notebook 실행 상태 및 자동 trigger 전환
- `tests/surface/verifyNotebookAutosavePlaywright.py`, `tests/surface/verifyProductExperiencePlaywright.py`, `tests/surface/verifyMobileLayout.py`: 저장·reload와 Run 대표 여정, overlap·viewport 계약

## 영향 함수·심볼

- `TopControls`, `NotebookCommandBar`, `NotebookPanel`, `NotebookSurface`
- `CodeCellEditor`, `DocumentBlock`, `InsertCellButton`, `NotebookAppendActions`
- `useNotebookAutosave`, `persistNotebookDocument`, `resolveNotebookSaveCompletion`, `documentSaveSupportsKeepalive`
- `allocateDocumentPath`, `allocateCodaroCopyPath`, `safeDocumentStem`
- `_writeTextAtomically`
- `runNotebookBlock`, `runReactiveNotebook`, `ensureRuntimeSession`
- `NotebookSurfaceProps`, `RuntimeSessionResult`, `RunNotebookResult`

## 테스트

- `uv run python -X utf8 tests/run.py gate web-learning`: Web lesson과 Run 실행, 출력, 자동 검증 대표 흐름
- `uv run python -X utf8 tests/surface/verifyNotebookAutosavePlaywright.py`: Web 편집·저장·reload·빈 code cell, 실제 FastAPI Local의 small bounded keepalive·large regular save와 새 문서 경로 분리
- `uv run python -X utf8 -m pytest tests/surface/testNotebookPersistence.py tests/runtime/testServerApi.py tests/document/testDocumentAtomicSave.py`: 브라우저 저장 fail-closed, keepalive byte 한도, Local unique path·revision·Jupyter 원본 보호·원자 저장 실패 보존
- `uv run python -X utf8 tests/product/verifyAstryxJourneyAudit.py`: `web-run-mobile`, `web-run-desktop`, `local-run-minimum` 대표 case
- `uv run python -X utf8 tests/run.py gate mobile-layout`: 44px mobile 실행 control과 responsive layout 계약
- `uv run python -X utf8 tests/run.py gate run-local-state-browser`: Web 320px와 Local 900×640, 실제 실행 상태 전이, 공용 SNS·테마, Local-required 상태
- `uv run python -X utf8 tests/run.py gate product-experience-browser`: Notebook 실행과 출력, 세 문서 폭, reactive 전환, overlap, horizontal overflow 감사
- `uv run python -X utf8 tests/run.py gate visual-accessibility-browser`: 3엔진의 테마·SNS·후원 팝업·키보드·대비 계약
- 실제 긴 문서의 keyboard 순서와 screen reader reading order는 별도 사람 검수로 남긴다.

## 롤백

- top bar, command bar와 Notebook CSS를 함께 되돌리되 `runNotebookBlock`, reactive dependency, document 저장 계약은 유지한다.
- 빈 초기 셀 계약을 되돌려도 durable 사용자 문서를 덮어쓰지 않고 새 문서의 초기값에만 적용한다.
- floating control을 되돌릴 때 우측 패널과 control의 overlap 검사를 먼저 red로 확인한다.

## 평가

### 개발자 관점

- 기존 runtime API를 유지하면서 빈 document, 실행 후 focus 이동, 공통 work-cell primitive만 조정해 실행 엔진 회귀 범위를 제한했다.
- 대표 Chromium과 current Evergreen WebView2 기본 notebook case는 green이지만 긴 notebook, IME, keyboard-only 조작과 보조기술 증거가 없어 완료 자격은 없다.

### PM 관점

- `/run/` 첫 진입에서 불필요한 badge와 sample code 없이 편집 가능한 빈 셀이 바로 보이고, 실행 결과는 별도 확인 command 없이 cell 아래에 나타난다.
- 공용 source와 실제 설치형 Local WebView2의 동일 컴포넌트·실행 전이, 공개 Web archive의 Local 수입·reload·재내보내기와 다시 Web으로 돌아오는 왕복은 기계 검증됐다. 그러나 실제 긴 문서의 keyboard-only 이동, IME와 screen reader 수동 검수가 남아 있어 상태는 `진행`이다.

완료 전에는 TODO 삭제하지 않는다.
