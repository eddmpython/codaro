# Notebook Workbench

상태: 진행

## 목표

실제 Windows WebView2의 Codaro 노트북에서 보조기술 읽기 순서와 한글 IME 조합 입력을 사람 기준으로 확인하고, 발견한 결함을 수정한 뒤 이 TODO를 삭제한다.

## 남은 조건

- NVDA 또는 Narrator로 12셀 이상 노트북의 문서, 셀 순번, 입력, 출력, 셀 작업, 문서 하단 control이 화면 순서대로 읽히는지 검수한다.
- CodeMirror 코드 셀과 Markdown textarea에서 한글 조합 시작·갱신·확정을 확인한다.
- IME 조합 중 `↑`·`↓`가 인접 셀 이동을 발동하지 않고, 조합 확정 뒤 문서 시작·끝에서만 셀 경계 이동이 작동하는지 확인한다.
- 검수 중 발견한 focus 유실, 중복 announcement, 읽기 순서 역전, 조합 문자 손실을 수정하고 같은 WebView2 환경에서 재검수한다.

## 다음 검증

- Windows 11의 current Evergreen WebView2에서 `product-browser-webview2-evergreen`을 먼저 통과시킨다.
- 같은 설치본과 1024×768 viewport에서 NVDA 또는 Narrator의 실제 발화 순서를 기록한다.
- 같은 설치본의 Code·Markdown 셀에서 한글 IME 조합과 경계 이동을 사람 입력으로 검수한다.
- 남은 조건이 모두 충족되면 이 packet과 parent index의 링크를 삭제하고, 구현·검수 사실은 상세 commit message에 기록한다.

## 영향 파일

검수에서 결함이 확인될 때 아래 소유 파일과 해당 회귀 검사만 변경한다.

- `editor/src/components/notebook/notebookPanel.tsx`
- `editor/src/lib/notebookCellNavigation.ts`
- `tests/product/verifyWebView2ProductSmoke.py`
- `tests/surface/testProductSurfaceContract.py`

## 영향 함수·심볼

- `CodeCellEditor`
- `DocumentBlock`
- `resolveNotebookCellBoundaryNavigation`
- `verify_long_notebook_keyboard_navigation`

## 테스트

- `uv run python -X utf8 tests/run.py gate product-browser-webview2-evergreen`
- Windows WebView2 1024×768에서 NVDA 또는 Narrator 실제 발화 순서 사람 검수
- CodeMirror와 Markdown textarea의 한글 IME 조합 시작·갱신·확정 및 조합 중 방향키 사람 검수

## 롤백

- 보조기술 또는 IME 결함 수정이 기존 셀 실행과 일반 커서 이동을 회귀시키면 해당 수정만 되돌리고 이 TODO는 유지한다.
- 자동 WebView2 gate는 사람 발화와 실제 조합 입력을 대신하는 완료 근거로 격상하지 않는다.

## 평가

### 개발자 관점

- 조합 입력과 자동완성 guard가 실제 WebView2 입력 이벤트 순서에서도 셀 경계 이동보다 먼저 적용돼야 한다.
- DOM 순서가 맞다는 정적 판정만으로 screen reader 발화 순서까지 통과했다고 주장하지 않는다.

### PM 관점

- 키보드와 한글 IME 사용자가 현재 셀이나 조합 중인 문자를 잃지 않고 긴 노트북을 왕복해야 한다.
- 사람이 실제 발화와 조합 입력을 확인하기 전에는 Notebook Workbench TODO를 삭제하지 않는다.
