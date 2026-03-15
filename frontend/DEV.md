# Frontend DEV

## 역할

`frontend/`는 SvelteKit 기반 Codaro 편집기와 앱 표면을 담당한다.

현재 두 화면이 있다.
- `/`
  - `EditorShell.svelte`
- `/app`
  - `AppShell.svelte`

## 현재 구조

- `src/routes/+page.svelte`
  - 편집기 진입점
- `src/routes/app/+page.svelte`
  - 앱 모드 진입점
- `src/lib/editor/`
  - 셀, 툴바, 사이드바, 실행 클라이언트, API 클라이언트
- `src/styles.css`
  - 전역 토큰과 테마

## 실행 경로

편집기 실행은 현재 두 단계다.

1. `ServerKernel` 시도
  - FastAPI `/api/kernel/create`
  - WebSocket `/ws/kernel/{sessionId}`
2. 실패 시 `WorkerClient` 폴백
  - 브라우저 Pyodide worker 실행

즉 현재 편집 표면은 서버 커널 우선, Pyodide 폴백 구조다.

반면 앱 모드는 아직 `WorkerClient` 기반 순차 실행이다.

## 핵심 파일

- `EditorShell.svelte`
  - 전체 편집기 조립
  - 문서 로드/저장
  - 셀 선택
  - 실행
  - command palette
- `Cell.svelte`
  - 셀 컨테이너
  - 좌우 액션
  - drag/drop
  - output 연결
- `CodeCell.svelte`
  - 코드 셀 래퍼
- `MarkdownCell.svelte`
  - 마크다운 편집/미리보기
- `EditorToolbar.svelte`
  - 상단/하단 플로팅 컨트롤
- `EditorSidebar.svelte`
  - 블록, 변수, runtime, document, graph 패널
- `AddCellButton.svelte`
  - 셀 삽입 메뉴
- `CommandPalette.svelte`
  - 커맨드 팔레트
- `serverKernel.js`
  - 서버 커널 클라이언트
- `workerClient.js`
  - Pyodide worker 클라이언트
- `pyodideWorker.js`
  - 브라우저 실행 worker
- `api.js`
  - 문서, 파일, 패키지, 환경 API 래퍼
- `dataflow.js`
  - 중복 정의와 순환 참조 계산

## 현재 UX 상태

이미 들어간 기능:
- 셀 추가/삭제/이동/복제
- code/markdown 전환
- multi-select
- bulk action
- command palette
- drag reorder
- width mode
- app launch

아직 구조적으로 부족한 부분:
- 셀 계층이 `marimo` 수준으로 더 잘게 분리돼 있지 않다
- header, controls, multi-cell toolbar, create-cell button, sortable wrapper를 더 명확히 분리할 필요가 있다
- app 모드와 edit 모드의 엔진 경로가 아직 통일되지 않았다

## 디자인 방향

현재 톤은 `eddmlab`에서 가져온 노트북 감각을 바탕으로 조정 중이다.
다만 source of truth는 Codaro 쪽 구조와 문서다.

즉 참고는 하되 그대로 복제하지 않는다.
특히 셀 구조는 `marimo`, `eddmlab` 둘 다 메커니즘 단위로 해부해서 Codaro 목적에 맞게 재편해야 한다.

## 다음 작업

- 셀 계층을 `cell shell`, `toolbar`, `actions menu`, `sortable wrapper`로 분리
- 전역 controls와 header 계층 재정리
- 앱 모드도 서버 커널 capability를 활용하도록 정리
- block 중심 모델에 맞는 widget/view 브리지 붙이기
