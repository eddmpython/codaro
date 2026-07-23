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

- `scratch.py` starter cell, Web/Local runtime, 세션 자동 반영, Python/Markdown 셀 추가와 전체 실행 command bar를 구현했다.
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
- `editor/src/lib/notebookRuntime.ts`, `editor/src/hooks/useNotebookRuntimeState.ts`: 단일 cell과 reactive notebook 실행 상태
- `tests/surface/verifyProductExperiencePlaywright.py`, `tests/surface/verifyMobileLayout.py`: Run 대표 여정과 overlap·viewport 계약

## 영향 함수·심볼

- `NotebookCommandBar`, `NotebookPanel`, `NotebookSurface`
- `SCRATCH_STARTER_CODE`, `CodeCellEditor`, `DocumentBlock`, `InsertCellButton`
- `runNotebookBlock`, `runReactiveNotebook`, `ensureRuntimeSession`
- `NotebookSurfaceProps`, `RuntimeSessionResult`, `RunNotebookResult`

## 테스트

- `uv run python -X utf8 tests/run.py gate web-learning`: Web lesson과 Run 실행, 출력, 자동 검증 대표 흐름
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
