# Notebook Workbench

상태: 진행

## 목표

`/run/`을 빈 화면이 아니라 즉시 실행 가능한 자유 노트북으로 만들고, Local에서도 같은 셀 문법을 유지한다.

## 범위

- 첫 진입 runnable starter cell
- runtime, autosave, 실행 상태를 command bar에서 즉시 확인
- code, output, error, verification의 명확한 시각 계층
- 44px 이상 mobile Run control과 safe area
- 기존 cell 실행, reactive dependency, automation 승격 동작 보존

## 종료 조건

- bare `/run/` 첫 paint에 편집 가능한 코드와 실행 command가 보임
- 실행 뒤 출력과 오류가 같은 cell 아래에 자동 표시됨
- desktop, mobile, Light, Dark screenshot matrix 통과
- notebook 기능 회귀 gate 통과

## 현재 증거

- `scratch.py` starter cell, Web/Local runtime, Python/Markdown 셀 추가와 전체 실행 command bar를 구현했다.
- Web draft는 브라우저 저장소에 즉시 보존되고 reload 뒤 복원된다. Local draft는 700ms debounce 뒤 실제 workspace 파일에 저장되며 pending, saving, saved, error 상태가 command bar에 자동 표시된다.
- page hide와 background 전환은 일반 저장을 먼저 시작하고 UTF-8 요청 body 60KiB 이하에서만 보조 keepalive를 보낸다. 더 큰 미저장 문서는 keepalive를 강제 차단하고 일반 저장이 끝날 때까지 native 이탈 경고를 사용한다.
- Local 경로는 `(documentId, path)`가 함께 소유해 새 문서가 이전 파일을 덮지 않는다. server는 session·document별 revision을 잠가 역순 요청을 거절하고 기존 이름과 겹치면 고유 경로를 할당한다.
- Local 파일은 같은 디렉터리의 임시 파일을 flush·fsync한 뒤 `os.replace`로 교체한다. write, fsync, replace 실패 시 마지막 정상 파일과 원본 mode를 보존하고 임시 파일을 정리한다.
- `.ipynb` 자동 저장은 출력, metadata, attachment, execution count, magic이 있는 원본을 byte-for-byte 보존하고 같은 디렉터리의 고유 `*.codaro.py` 사본으로 승격한다. 수동 Jupyter round trip은 별도 범위다.
- mobile 44px 실행 control과 desktop 전역 도구 예약 영역을 적용했다.
- `web-learning`, `learning-method`, Light/Dark `astryx-journey`에서 Run과 Notebook 대표 case가 통과했다.
- Pages `main@3a18dd97`의 `/run/`을 cold load한 뒤 `모든 셀 실행` 한 번으로 `항목 수: 3`, `합계: 38100`, `평균: 12700` 출력과 브라우저 FS 실행 기록이 같은 cell 아래 자동 표시되는 것을 확인했다.
- 공개 desktop Run에서 전역 도구와 command bar 겹침, page horizontal overflow가 모두 0임을 확인했다.

## 남은 조건

- 실제 WebView2에서 긴 notebook, keyboard-only cell 이동, screen reader reading order 수동 검수
- 배포 commit의 Local 설치본 round trip 증거

## 영향 파일

- `editor/src/components/notebook/notebookCommandBar.tsx`: runtime, autosave, cell 추가와 전체 실행 command bar
- `editor/src/components/notebook/notebookPanel.tsx`: runnable starter cell, code cell, output·error 렌더링
- `editor/src/components/notebook/notebookPanel.css`: code/output 계층, mobile control, desktop global-tool 예약 영역
- `editor/src/components/app/notebookSurface.tsx`: Notebook panel과 inspector 조합
- `editor/src/hooks/useNotebookDocumentState.ts`, `editor/src/lib/notebookPersistence.ts`, `editor/src/lib/documentSavePolicy.ts`: Web durable draft와 Local debounce·revision·경로 소유권·bounded keepalive 저장
- `src/codaro/api/documentRouter.py`: workspace 고유 경로, stale revision 거절, Jupyter 원본 보호 사본
- `src/codaro/document/service.py`: Python·Percent·Jupyter 공용 원자 저장
- `editor/src/lib/notebookRuntime.ts`, `editor/src/hooks/useNotebookRuntimeState.ts`: 단일 cell과 reactive notebook 실행 상태
- `tests/surface/verifyNotebookAutosavePlaywright.py`, `tests/surface/verifyProductExperiencePlaywright.py`, `tests/surface/verifyMobileLayout.py`: 저장·reload와 Run 대표 여정, overlap·viewport 계약

## 영향 함수·심볼

- `NotebookCommandBar`, `NotebookPanel`, `NotebookSurface`
- `SCRATCH_STARTER_CODE`, `CodeCellEditor`, `DocumentBlock`, `InsertCellButton`
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
- `uv run python -X utf8 tests/run.py gate product-experience-browser`: Notebook 실행과 출력, overlap, horizontal overflow 감사
- 실제 긴 문서의 keyboard 순서와 screen reader reading order는 별도 사람 검수로 남긴다.

## 롤백

- command bar와 Notebook CSS를 함께 되돌리되 `runNotebookBlock`, reactive dependency, document 저장 계약은 유지한다.
- starter cell rollback은 durable 사용자 문서를 덮어쓰지 않고 새 빈 문서의 초기값에만 적용한다.
- desktop global-tool 예약 영역을 되돌릴 때 command bar와 floating control의 overlap 검사를 먼저 red로 확인한다.

## 평가

### 개발자 관점

- 기존 runtime API를 유지하면서 starter document와 command surface를 추가해 실행 엔진 회귀 범위를 제한했다.
- 대표 Chromium case는 green이지만 실제 WebView2의 긴 notebook, IME, keyboard-only 조작 증거가 없어 완료 자격은 없다.

### PM 관점

- `/run/` 첫 진입에서 편집 가능한 코드와 실행 결과가 바로 보이고 별도 확인 command 없이 출력이 cell 아래에 나타난다.
- 공개 Web과 Local 설치본의 같은-document round trip 증거가 남아 있어 상태는 `진행`이다.

완료 전에는 `_done`으로 이동하지 않는다.
