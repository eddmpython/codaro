# Frontend DEV

## 역할

`frontend/`는 Codaro의 editor/app UI를 담당하는 Svelte 프론트엔드다.

이 문서는 현재 프론트 재구축의 source of truth다.
이번 재구축은 감으로 새 UI를 만드는 작업이 아니다.
설치된 `marimo`를 기준선으로 맞춘 상태를 먼저 고정했고, 그 위에서 Codaro의 우위를 쌓는다.

2026-03-20 기준 `marimo-parity` baseline은 `_backup/frontend/marimo-parity-baseline-2026-03-20/`에 그대로 동결했다.

단, 문서 surface는 Codaro 제품 의도로 분기한다.
- notebook chrome parity는 계속 유지한다
- shipped product는 marimo의 full documentation panel을 그대로 싣지 않는다
- helper sidebar의 해당 slot은 `Context Help`로 대체한다
- 장문 docs/blog/search는 항상 `landing/` public site에서 연다

## 현재 상태

- `frontend/`는 다시 복구되었고 `src/codaro/webBuild/`로 빌드된다
- notebook shell은 설치된 `marimo` 정적 자산을 직접 벤더링해서 맞춘다
- 벤더 경로는 `frontend/src/lib/vendor/marimo/assets/`다
- 재구축의 기준선은 `eddmlab`이 아니라 프로젝트 `.venv`에 설치된 `marimo`다
- IDE 안의 문서 surface는 full docs viewer가 아니라 compact `Context Help`로 고정한다
- 현재 marimo-parity 기준 상태는 `_backup/frontend/marimo-parity-baseline-2026-03-20/`에 snapshot으로 보존되어 있다

## 아카이브 규칙

- `marimo-parity`로 맞춘 현재 프론트 상태는 archive baseline으로 취급한다
- archive는 보존본이다. parity 기준을 다시 읽을 때는 `_backup/frontend/marimo-parity-baseline-2026-03-20/`와 `frontend/prd/*.md`를 먼저 본다
- 이후 제품 개발은 archive를 덮어쓰는 방식이 아니라, archive 대비 Codaro 의도적 차이를 쌓는 방식으로 진행한다
- 나중에 다시 `marimo 1:1` 판정을 열고 싶으면 archive 기준에서 새 검증 라운드를 시작한다

## 절대 규칙

### 1. 기준선은 설치된 marimo다

반드시 아래 경로의 실제 코드를 먼저 읽고 따라간다.

- `.venv/Lib/site-packages/marimo/_plugins/stateless/flex.py`
- `.venv/Lib/site-packages/marimo/_plugins/stateless/accordion.py`
- `.venv/Lib/site-packages/marimo/_plugins/ui/_impl/tabs.py`
- `.venv/Lib/site-packages/marimo/_plugins/stateless/sidebar.py`
- `.venv/Lib/site-packages/marimo/_plugins/stateless/callout.py`
- `.venv/Lib/site-packages/marimo/_output/hypertext.py`
- `.venv/Lib/site-packages/marimo/_tutorials/layout.py`
- `.venv/Lib/site-packages/marimo/_static/`
- `frontend/src/lib/vendor/marimo/assets/`

### 2. parity 전에는 개선 금지

아래 항목은 `marimo parity`가 끝나기 전까지 넣지 않는다.

- 임의의 새 header
- marimo에 없는 toolbar chrome
- Codaro 감성이라고 주장하는 장식 레이아웃
- 설명용 문구나 배너
- eddmlab 전용 UX를 그대로 이식한 요소

### 3. 내부와 표면을 분리한다

- 표면 UI는 먼저 `marimo`와 최대한 같게 간다
- 내부 canonical model은 `CodaroDocument`를 유지한다
- 프론트는 `CodaroDocument -> notebook view model` 어댑터를 통해서만 동작한다
- `eddmlab`의 `Notebook` JSON과 `/api/notebook/*` 계약은 가져오지 않는다

### 4. 엔진 우선순위는 유지한다

Codaro의 실행 원칙은 그대로 유지한다.

- 기본: 서버 커널
- 폴백: Pyodide
- 편집기 UI는 엔진 구현 세부사항을 직접 알지 않는다

### 5. 한 번에 한 레이어만 바꾼다

아래를 한 PR 또는 한 작업 단위에서 섞지 않는다.

- notebook shell
- cell chrome
- output renderer
- layout renderer
- engine adapter
- workspace home
- app mode

### 6. parity와 제품 fork point를 같이 기록한다

- `frontend/PRD.md`는 짧은 인덱스와 세션 진입점으로 유지한다
- 실제 marimo source trace와 UI 계약은 `frontend/prd/*.md` 분할 문서에 기록한다
- 세션 재개 시에는 먼저 `frontend/prd/10-summary-acceptance-and-copy-plan.md`를 읽는다
- Codaro shipped product가 의도적으로 갈라지는 지점도 같은 PRD 체계 안에 함께 적는다
- 현재 확정 fork point는 문서 surface다
  - marimo source의 `documentation` panel trace는 남긴다
  - Codaro 구현은 `Context Help`만 싣고 public docs는 외부로 연다

## Codaro 백엔드 경계

프론트는 아래 API를 기준으로 붙는다.

- `/api/bootstrap`
- `/api/workspace/index`
- `/api/document/load`
- `/api/document/save`
- `/api/document/export`
- `/api/document/insert-block`
- `/api/document/remove-block`
- `/api/document/move-block`
- `/api/document/update-block`
- `/api/kernel/create`
- `/api/kernel/{sessionId}/execute`
- `/api/kernel/{sessionId}/execute-reactive`
- `/api/kernel/{sessionId}/variables`
- `/api/kernel/{sessionId}/interrupt`
- `/api/fs/*`
- `/api/packages/*`
- `/ws/kernel/{sessionId}`

SPA base path는 서버가 주입하는 `<meta name="codaro-base">`를 따른다.

## marimo parity 범위

### 1단계: notebook chrome parity

먼저 맞춰야 하는 것은 notebook의 기본 리듬이다.

- 셀 카드 구조
- 셀 간 간격
- 실행 상태 표시
- 코드 셀과 markdown 셀의 출력 흐름
- 마지막 expression output 리듬
- 최소한의 툴바와 액션 위치

### 2단계: layout parity

설치된 marimo 기준으로 아래를 재현한다.

- `mo.hstack`
- `mo.vstack`
- `Html.center()`
- `Html.right()`
- `Html.left()`
- `mo.accordion`
- `mo.ui.tabs`
- `mo.sidebar`
- `mo.callout`

### 3단계: Codaro adapter

parity 이후에만 아래를 붙인다.

- block canonical model
- reactive lineage
- learning mode
- app mode
- AI tool surface

## 컴포넌트 대응표

### Notebook Surface

| 목표 표면 | marimo 기준 | Codaro 구현 원칙 |
| --- | --- | --- |
| Notebook shell | `_static/` notebook chrome | 별도 영웅 섹션 없이 notebook 표면부터 시작 |
| Cell frame | marimo cell rhythm | block id와 execution 상태를 가진 셀 프레임 |
| Output area | `Html` 출력 흐름 | 서버 커널 결과와 Pyodide 결과를 같은 shape로 렌더 |
| Sidebar chrome | `mo.sidebar`와 notebook side panels | shell parity는 유지하되 문서 surface는 `Context Help`로 fork |

### Layout / Output

| 기능 | marimo 기준 파일 | Svelte 구현 원칙 |
| --- | --- | --- |
| `hstack` / `vstack` | `_plugins/stateless/flex.py` | flex container와 child flex 비율을 그대로 모델링 |
| `accordion` | `_plugins/stateless/accordion.py` | labels + slotted content 구조 유지 |
| `tabs` | `_plugins/ui/_impl/tabs.py` | 선택값은 tab key, 렌더 구조는 slotted tab panel 기준으로 맞춤 |
| `sidebar` | `_plugins/stateless/sidebar.py` | notebook 본문 밖 sidebar layout으로 처리 |
| `center/right/left` | `_output/hypertext.py` | 별도 장식 없이 justify 래퍼로 구현 |
| `callout` | `_plugins/stateless/callout.py` | `neutral/warn/success/info/danger` kind 체계를 그대로 유지 |

## Svelte 구조

현재 구현된 구조는 위 "컴포넌트 디렉토리 구조" 섹션 참고. 56개 컴포넌트가 10개 디렉토리에 분산되어 있다.

## view model 원칙

프론트 내부에서만 notebook view model을 둔다.

- source of truth: `CodaroDocument.blocks`
- 프론트 view model: 셀처럼 보이는 얇은 projection
- projection은 reversible 해야 한다
- 프론트가 임의의 새 문서 포맷을 만들지 않는다

예상 최소 projection:

- `code` block -> code cell
- `markdown` / `text` / `guide` block -> markdown or guide surface
- `widget` / `view` block -> layout/output renderer

## 첫 구현 순서

### Phase 0. benchmark 고정

- 설치된 `marimo` 코드 대응표 작성
- `frontend/PRD.md` 인덱스와 `frontend/prd/*.md` 분할 문서를 기준선으로 고정

### Phase 1. shell

- `NotebookShell.svelte`
- `CellFrame.svelte`
- `OutputRenderer.svelte`
- `documentAdapter.ts`

성공 기준:

- `CodaroDocument`를 읽어 셀처럼 보여줄 수 있다
- 커스텀 header 없이 notebook 화면이 열린다

### Phase 2. server engine

- `ServerKernelEngine.ts`
- `sessionStore.ts`
- `/api/kernel/*` 연결

성공 기준:

- 코드 블록 단일 실행
- 변수 조회
- reactive execute

### Phase 3. layout parity

- `LayoutRenderer.svelte`
- `hstack/vstack`
- `accordion`
- `tabs`
- `sidebar`
- `callout`

성공 기준:

- `marimo` tutorial layout 예제가 같은 의미로 보인다

### Phase 4. pyodide fallback

- `PyodideEngine.ts`
- 동일 capability shape 유지

성공 기준:

- 서버 커널 부재 시 기본 notebook 흐름이 유지된다

### Phase 5. Codaro advantage

- learning mode
- app mode
- widget/view bridge
- AI editor tools

## 검증 기준

구현 검증은 추상 감상이 아니라 아래 기준으로 한다.

- `marimo` tutorial example이 같은 layout semantics를 가지는가
- 실행 결과의 정렬과 래핑이 marimo와 어긋나지 않는가
- 임의 header/chrome이 끼어들지 않았는가
- `CodaroDocument`와 프론트 view model이 역변환 가능한가
- 서버 커널과 Pyodide가 같은 capability surface를 노출하는가

## 금지된 해석

아래 해석은 하지 않는다.

- "marimo는 심심하니 헤더를 추가하자"
- "Codaro니까 landing 같은 hero를 넣자"
- "학습 제품이니 안내 카드부터 넣자"
- "eddmlab에 있던 것을 먼저 옮기자"

반드시 순서는 아래다.

`marimo parity baseline -> Codaro adapter -> Codaro advantage`

## Current State

- frontend PRD는 설치본 `marimo==0.21.0` `_static` 자산 기준으로 잠겨 있고, split PRD의 현재 `Source:` 블록들은 모두 `Installed assets -> Readable source` 순서를 갖는다
- 현재 `frontend/`의 marimo-matched 작업 상태는 `_backup/frontend/marimo-parity-baseline-2026-03-20/`에 그대로 snapshot됐다
- 구현 쪽은 전체 notebook chrome/component inventory가 Svelte로 존재하고, `frontend/` production build는 성공한다
- 이번 패스에서 dialog/overlay a11y 경고, Svelte runes `state_referenced_locally` 경고, `svelte:self` deprecation, marimo font unresolved 경고를 제거했다
- 현재 남은 빌드 경고는 large client chunk warning 하나다
- 모든 컴포넌트 Svelte 5 runes 전환 완료 (`export let` 잔존 0개)
- 개발 계획서: `C:\Users\MSI\.claude\plans\idempotent-mapping-aho.md` (11 Phase, 56 컴포넌트)
- helper sidebar의 `documentation` slot은 shipped product에서 `Context Help`로 대체
- `Context Help` 데이터는 `frontend/src/lib/codaro/contextHelp.ts`가 관리
- 이 archive baseline은 `marimo 1:1 완료` 선언이 아니다. browser side-by-side 검증과 일부 정밀 proof는 남은 상태로 얼려 두었다

### 완료된 Phase 목록

아래 Phase는 archive baseline에 반영된 구현 범위다.

| Phase | 내용 | 상태 |
| --- | --- | --- |
| 0 | 기반 구축 (의존성, 프리미티브, 상태 스토어) | 완료 |
| 1 | 셸 분해 (EditPage, AppChrome, PanelGroup, Sidebar, HelperSidebar, DeveloperPanel, Footer, AppContainer, FilenameForm) | 완료 |
| 2 | 셀 표면 (CellFrame Svelte 5 전환) | 완료 |
| 3 | 플로팅 컨트롤 (TopRightControls, BottomRightControls) | 완료 |
| 4 | 출력 표면 + Svelte 5 전환 (OutputRenderer, CodeEditor, MarkdownBlock, DataFrameTable, LayoutRenderer, WidgetRenderer, WorkspaceHome, WorkspaceTree, AppShell) | 완료 |
| 5 | 커맨드 팔레트 + Find/Replace + 키보드 단축키 | 완료 |
| 6 | 헬퍼 사이드바 패널 바디 (FileExplorer, Variables, DependencyGraph, Documentation, Outline, Packages, Snippets, AIChat) | 완료 |
| 7 | 개발자 패널 바디 (Errors, Scratchpad, Tracing, Secrets, Logs, Terminal, Cache) | 완료 |
| 8 | 푸터 아이템 + 상태 위젯 (BackendStatus, RuntimeSettings, CopilotStatus, AIStatus, MachineStats, RTCStatus) | 완료 |
| 9 | 멀티셀 선택 + DnD + 다이얼로그 (MultiCellToolbar, PendingDeleteBar, SortableCell, CreateCellButton, SaveDialog, RecoveryDialog, ShutdownButton) | 완료 |

### 컴포넌트 디렉토리 구조

```text
src/lib/codaro/
  stores/                    -- Svelte 5 runes 상태
    connection.svelte.ts
    panels.svelte.ts
    config.svelte.ts
  primitives/                -- 재사용 기본 요소
    ActionButton.svelte
    Banner.svelte
    FooterItem.svelte
    SidebarItem.svelte
  chrome/                    -- 워크스페이스 크롬
    AppChrome.svelte
    PanelGroup.svelte
    Panel.svelte
    PanelResizeHandle.svelte
    Sidebar.svelte
    HelperSidebar.svelte
    DeveloperPanel.svelte
    Footer.svelte
    footer-items/
      BackendStatus.svelte
      RuntimeSettings.svelte
      CopilotStatus.svelte
      AIStatus.svelte
      MachineStats.svelte
      RTCStatus.svelte
  app/                       -- 앱 진입점
    EditPage.svelte
    AppContainer.svelte
  header/
    FilenameForm.svelte
  editor/                    -- 셀 표면
    SortableCell.svelte
    CreateCellButton.svelte
    MultiCellToolbar.svelte
    PendingDeleteBar.svelte
  controls/                  -- 플로팅 컨트롤
    TopRightControls.svelte
    BottomRightControls.svelte
    CommandPalette.svelte
    KeyboardShortcuts.svelte
    FindReplace.svelte
  components/                -- 코어 노트북 컴포넌트
    NotebookShell.svelte
    CellFrame.svelte
    CodeEditor.svelte
    OutputRenderer.svelte
    MarkdownBlock.svelte
    LayoutRenderer.svelte
    WidgetRenderer.svelte
    DataFrameTable.svelte
    AppShell.svelte
    WorkspaceHome.svelte
    WorkspaceTree.svelte
  panels/                    -- 헬퍼/개발자 패널 바디
    FileExplorerPanel.svelte
    VariablesPanel.svelte
    DependencyGraphPanel.svelte
    DocumentationPanel.svelte
    OutlinePanel.svelte
    PackagesPanel.svelte
    SnippetsPanel.svelte
    AIChatPanel.svelte
    ErrorsPanel.svelte
    ScratchpadPanel.svelte
    TracingPanel.svelte
    SecretsPanel.svelte
    LogsPanel.svelte
    TerminalPanel.svelte
    CachePanel.svelte
  dialogs/                   -- 모달/다이얼로그
    SaveDialog.svelte
    RecoveryDialog.svelte
    ShutdownButton.svelte
```

## Next Action

- archive baseline은 그대로 둔다
- active `frontend/`에서는 archive를 기준점으로 삼아 Codaro 전용 변화만 쌓는다
- 다음 실제 개발은 Codaro 서버 커널/file/package/session API 연결과 제품용 UX 분기로 옮긴다
- parity를 다시 열 필요가 생기면 archive 기준에서 browser side-by-side 검증과 asset proof 정밀화를 별도 라운드로 진행한다

## Verification Left

- archive snapshot과 현재 `frontend/` 작업 트리가 freeze 시점에 같은 기준 상태였는지 필요 시 diff로 다시 확인
- Codaro 제품 변화가 archive baseline을 우발적으로 깨지 않았는지 주요 shell/cell surface 기준으로 확인
- Svelte/a11y/font unresolved 경고 재발 없는지 확인
- large client chunk warning 해소 또는 의도적 허용 여부 결정
- save/recovery/share/settings/feedback/shutdown 흐름이 실제 backend state와 이어지는지 검증
- server kernel, websocket, variables, packages, fs 흐름이 Codaro 런타임 기대치에 맞게 이어지는지 검증
- 만약 `marimo 1:1` 판정을 다시 열면, 브라우저 렌더 비교와 spacing/testid 실측은 별도로 다시 수행
