# Frontend DEV

## 역할

`frontend/`는 Codaro의 editor/app UI를 담당하는 Svelte 프론트엔드다.

이 문서는 현재 프론트 재구축의 source of truth다.
이번 재구축은 감으로 새 UI를 만드는 작업이 아니다.
먼저 설치된 `marimo`를 기준선으로 정확히 재현하고, 그 다음에 Codaro의 우위를 쌓는다.

## 현재 상태

- `frontend/`는 다시 복구되었고 `src/codaro/webBuild/`로 빌드된다
- notebook shell은 설치된 `marimo` 정적 자산을 직접 벤더링해서 맞춘다
- 벤더 경로는 `frontend/src/lib/vendor/marimo/assets/`다
- 재구축의 기준선은 `eddmlab`이 아니라 프로젝트 `.venv`에 설치된 `marimo`다

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
| Sidebar chrome | `mo.sidebar`와 notebook side panels | parity 후 Codaro panel만 추가 |

### Layout / Output

| 기능 | marimo 기준 파일 | Svelte 구현 원칙 |
| --- | --- | --- |
| `hstack` / `vstack` | `_plugins/stateless/flex.py` | flex container와 child flex 비율을 그대로 모델링 |
| `accordion` | `_plugins/stateless/accordion.py` | labels + slotted content 구조 유지 |
| `tabs` | `_plugins/ui/_impl/tabs.py` | 선택값은 tab key, 렌더 구조는 slotted tab panel 기준으로 맞춤 |
| `sidebar` | `_plugins/stateless/sidebar.py` | notebook 본문 밖 sidebar layout으로 처리 |
| `center/right/left` | `_output/hypertext.py` | 별도 장식 없이 justify 래퍼로 구현 |
| `callout` | `_plugins/stateless/callout.py` | `neutral/warn/success/info/danger` kind 체계를 그대로 유지 |

## Svelte 구조 초안

초기 구조는 아래처럼 간다.

```text
frontend/
  DEV.md
  src/
    lib/
      features/
        notebook/
          NotebookShell.svelte
          CellFrame.svelte
          OutputRenderer.svelte
          LayoutRenderer.svelte
          SidebarHost.svelte
          engine/
            ServerKernelEngine.ts
            PyodideEngine.ts
            ExecutionEngine.ts
          adapters/
            documentAdapter.ts
            outputAdapter.ts
            layoutAdapter.ts
          stores/
            notebookStore.ts
            sessionStore.ts
            workspaceStore.ts
```

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
- 이 문서를 기준선으로 고정

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

`marimo parity -> Codaro adapter -> Codaro advantage`
