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
- Web Run과 Local의 `NotebookSurface → NotebookPanel` 단일 컴포넌트 트리

## 종료 조건

- bare `/run/` 첫 paint에 예제 없는 편집 가능한 빈 코드 셀과 전체 실행 control이 보임
- 정상 첫 화면에 Local/Web 배지, 저장 완료 배지, cell 종류 label, runtime rail이 상시 보이지 않음
- 실행 뒤 출력과 오류가 같은 cell 아래에 자동 표시됨
- `Shift+Enter`가 실행과 다음 셀 focus를 한 동작으로 처리함
- desktop, mobile, Light, Dark screenshot matrix 통과
- notebook 기능 회귀 gate 통과

## 현재 증거

- 새 자유 노트북은 `새노트북.py`와 빈 코드 셀 하나로 시작하고, Python/Markdown 추가는 문서 하단에 배치했다. 파일명은 상단 중앙, 전체 실행은 우측 하단 원형 control로 분리했다.
- Web draft는 브라우저 저장소에 즉시 보존되고 reload 뒤 복원된다. Local draft는 700ms debounce 뒤 실제 workspace 파일에 저장된다. 저장 측정 속성은 유지하되 화면에는 pending, saving, error만 표시한다.
- page hide와 background 전환은 일반 저장을 먼저 시작하고 UTF-8 요청 body 60KiB 이하에서만 보조 keepalive를 보낸다. 더 큰 미저장 문서는 keepalive를 강제 차단하고 일반 저장이 끝날 때까지 native 이탈 경고를 사용한다.
- Local 경로는 `(documentId, path)`가 함께 소유해 새 문서가 이전 파일을 덮지 않는다. server는 session·document별 revision을 잠가 역순 요청을 거절하고 기존 이름과 겹치면 고유 경로를 할당한다.
- Local 파일은 같은 디렉터리의 임시 파일을 flush·fsync한 뒤 `os.replace`로 교체한다. write, fsync, replace 실패 시 마지막 정상 파일과 원본 mode를 보존하고 임시 파일을 정리한다.
- `.ipynb` 자동 저장은 출력, metadata, attachment, execution count, magic이 있는 원본을 byte-for-byte 보존하고 같은 디렉터리의 고유 `*.codaro.py` 사본으로 승격한다. 수동 Jupyter round trip은 별도 범위다.
- mobile 44px 실행 control과 desktop 우측 하단 실행 영역을 적용했다.
- 노트북과 현재 학습 실행 셀은 `workCell.css`의 frame, output, action primitive를 함께 사용한다.
- Web Run과 Local은 `apiOnline`으로 실행·저장 capability만 나누고 같은 Notebook 컴포넌트 트리와 CSS를 사용한다.
- Chromium 149.0.7827.55에서 Web Run desktop 1440×900, mobile 320×720·390×844의 Dark 대표 case와 390×844 Light case, Local Run 900×640 Dark case가 통과했다.
- Web desktop·mobile 감사에서 빈 code input 1개, 기본 노출 runtime·persistence status 0개, overlap 0개, horizontal overflow 0px를 확인했다. 320px에서는 문맥형 cell action과 48px mobile product navigation target을 유지한다.
- Web desktop에서 빈 첫 셀에 코드를 입력하고 `Shift+Enter`를 누른 뒤 출력 생성, 두 번째 빈 code cell 생성, 두 번째 editor 선택과 DOM focus를 확인했다.
- Local Run은 같은 Notebook 컴포넌트와 CSS로 렌더링됐고 Local kernel session 생성·종료와 runtime tier `local`을 확인했다.
- Web desktop과 Local minimum에서 실제 Python 셀을 `running → success → running → error`로 전이하고, 정상 상태는 다시 숨기며 성공·오류 결과가 해당 셀 아래에 표시되는지 확인했다.
- Run·Local·자동화 6-case 모두 공용 우상단 SNS `github`, `support`, `youtube`, `threads`와 같은 theme runtime을 사용한다. Web 자동화의 Local 전용 template은 `Local 필요`, Local 연결 뒤 같은 template은 가용 상태다.
- 시각 증거는 `output/test-runner/product-experience-browser/screenshots/{dark,light}/web-run-{desktop,mobile}.png`, Local 증거는 `output/test-runner/product-experience-browser/screenshots/dark/local-run-minimum.png`에 남겼다.
- 기계 판정은 `output/test-runner/notebook-redesign/`의 Web Dark·Light와 Local report, `output/test-runner/run-local-state-browser/run-local-state-report.json`에 남겼다.

## 남은 조건

- 실제 WebView2에서 긴 notebook, keyboard-only cell 이동, screen reader reading order 수동 검수
- 배포 commit의 Local 설치본 round trip 증거

## 영향 파일

- `editor/src/components/notebook/notebookCommandBar.tsx`: 가운데 파일명, 점진적 실행·저장 상태, floating 전체 실행
- `editor/src/components/notebook/notebookPanel.tsx`: 빈 code cell, `Shift+Enter` 이동, code/Markdown cell과 output·error 렌더링
- `editor/src/components/notebook/notebookPanel.css`: 조용한 기본 화면, 문맥형 cell action, compact code/output 계층, mobile control
- `editor/src/components/app/workCell.css`: 노트북과 현재 학습이 함께 쓰는 실행 셀 시각 primitive
- `editor/src/components/app/notebookSurface.tsx`: Notebook panel과 inspector 조합
- `editor/src/hooks/useNotebookDocumentState.ts`, `editor/src/lib/notebookPersistence.ts`, `editor/src/lib/documentSavePolicy.ts`: Web durable draft와 Local debounce·revision·경로 소유권·bounded keepalive 저장
- `src/codaro/api/documentRouter.py`: workspace 고유 경로, stale revision 거절, Jupyter 원본 보호 사본
- `src/codaro/document/service.py`: Python·Percent·Jupyter 공용 원자 저장
- `editor/src/lib/notebookRuntime.ts`, `editor/src/hooks/useNotebookRuntimeState.ts`: 단일 cell과 reactive notebook 실행 상태
- `tests/surface/verifyNotebookAutosavePlaywright.py`, `tests/surface/verifyProductExperiencePlaywright.py`, `tests/surface/verifyMobileLayout.py`: 저장·reload와 Run 대표 여정, overlap·viewport 계약

## 영향 함수·심볼

- `NotebookCommandBar`, `NotebookPanel`, `NotebookSurface`
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
- `uv run python -X utf8 tests/run.py gate product-experience-browser`: Notebook 실행과 출력, overlap, horizontal overflow 감사
- 실제 긴 문서의 keyboard 순서와 screen reader reading order는 별도 사람 검수로 남긴다.

## 롤백

- command bar와 Notebook CSS를 함께 되돌리되 `runNotebookBlock`, reactive dependency, document 저장 계약은 유지한다.
- 빈 초기 셀 계약을 되돌려도 durable 사용자 문서를 덮어쓰지 않고 새 문서의 초기값에만 적용한다.
- floating control을 되돌릴 때 우측 패널과 control의 overlap 검사를 먼저 red로 확인한다.

## 평가

### 개발자 관점

- 기존 runtime API를 유지하면서 빈 document, 실행 후 focus 이동, 공통 work-cell primitive만 조정해 실행 엔진 회귀 범위를 제한했다.
- 대표 Chromium case는 green이지만 실제 WebView2의 긴 notebook, IME, keyboard-only 조작 증거가 없어 완료 자격은 없다.

### PM 관점

- `/run/` 첫 진입에서 불필요한 badge와 sample code 없이 편집 가능한 빈 셀이 바로 보이고, 실행 결과는 별도 확인 command 없이 cell 아래에 나타난다.
- 공용 source와 loopback Local 상태의 동일 컴포넌트·실행 전이는 기계 검증됐다. 그러나 배포된 공개 Web에서 실제 설치된 Local WebView2로 같은 문서를 넘기고 다시 여는 round trip 증거가 남아 있어 상태는 `진행`이다.

완료 전에는 `_done`으로 이동하지 않는다.
