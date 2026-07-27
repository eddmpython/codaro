# 03 Product Shell

상태: 진행

## 목표

Web Run과 Local이 같은 Astryx 공용 셸, route state, navigation 어휘를 실제 Windows 입력 환경과 보조기술에서도 일관되게 제공하도록 남은 검수를 끝낸다.

## 작업 폴더

- [Astryx Proof Shell](00-astryx-proof-shell/)
- [Notebook Workbench](01-notebook-workbench/)

## 남은 조건

- 공용 셸의 keyboard, screen reader, 한국어 IME, forced-colors 사람 검수를 끝낸다.
- 긴 노트북의 보조기술 읽기 순서와 한글 조합 입력을 실제 WebView2에서 검수한다.
- 검수에서 발견한 결함을 Web·Local 공용 owner에서 수정하고 같은 환경에서 재검수한다.
- 두 하위 TODO가 삭제되면 이 workstream과 상위 작업 지도 링크를 삭제한다.

## 구현 순서

1. Astryx Proof Shell의 공용 navigation과 control lane을 검수한다.
2. Notebook Workbench의 읽기 순서와 IME 경계 이동을 검수한다.
3. 공용 source에서 결함을 수정하고 Web·Local 회귀를 함께 검증한다.
4. 각 leaf 종료 조건을 충족한 순서대로 해당 TODO를 삭제한다.

## 영향 파일

- `editor/src/components/app/productShell.tsx`
- `editor/src/components/app/productTopNav.tsx`
- `editor/src/components/app/productSidebar.tsx`
- `editor/src/components/notebook/notebookPanel.tsx`
- `editor/src/lib/notebookCellNavigation.ts`
- `assets/brand/designSystem/`
- `tests/product/verifyWebView2ProductSmoke.py`

## 영향 함수·심볼

- `ProductShell`
- `ProductTopNav`
- `ProductSidebar`
- `CodeCellEditor`
- `DocumentBlock`
- `resolveNotebookCellBoundaryNavigation`

## 테스트

- `uv run python -X utf8 tests/run.py gate design-system-contract`
- `uv run python -X utf8 tests/run.py gate visual-accessibility-browser`
- `uv run python -X utf8 tests/run.py gate product-browser-webview2-evergreen`
- Windows WebView2의 keyboard, screen reader, 한국어 IME, forced-colors 사람 검수

## 롤백

- 공용 셸 수정은 route state와 사용자 저장 데이터를 보존한 채 변경 단위별로 되돌릴 수 있게 한다.
- 실제 입력이나 보조기술 회귀가 생기면 해당 수정만 되돌리고 관련 leaf TODO를 유지한다.

## 평가

### 개발자 관점

- Web과 Local을 별도 component tree로 분기하지 않고 공용 owner에서 결함을 수정한다.

### PM 관점

- 자동 검사만 통과하거나 한 표면만 검수한 상태에서는 이 workstream을 삭제하지 않는다.
