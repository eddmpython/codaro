# 12 — Summary, Acceptance, and Codaro Mapping Plan

## 12.1 marimo Backend Complete Inventory

### Layer Count

| # | Layer | Files | Classes | Endpoints | PRD Doc |
|---|-------|-------|---------|-----------|---------|
| 1 | Server App Factory | 5 | 3 | — | 02 |
| 2 | Middleware | 7 | 7 | — | 02 |
| 3 | HTTP Endpoints | 20 | — | 66 | 03 |
| 4 | WebSocket | 7 | 5 | 3 | 04 |
| 5 | Message Protocol | 15 | 30+ types | — | 04 |
| 6 | Session Manager | 12 | 10 | — | 05 |
| 7 | Kernel Manager | 4 | 3 | — | 05 |
| 8 | AST Visitor | 1 (~43KB) | 3 | — | 06 |
| 9 | Compiler | 1 (~21KB) | 1 | — | 06 |
| 10 | Parser | 1 (~40KB) | 2 | — | 06 |
| 11 | Document Model | 3 (~75KB) | 5 | — | 06 |
| 12 | Runtime Kernel | 1 (~137KB) | 1 | — | 07 |
| 13 | Executor | 1 | 3 | — | 07 |
| 14 | Dataflow Graph | 5 | 4 | — | 07 |
| 15 | Cell Runner | 6 | 2 | — | 07 |
| 16 | State System | 1 | 3 | — | 07 |
| 17 | Package Manager | 7 | 6 | — | 08 |
| 18 | File System | 4 | 3 | — | 08 |
| 19 | Config System | 5 | 4 | — | 09 |
| 20 | CLI | 8 | — | — | 09 |
| 21 | Widgets | 30+ | 45+ | — | 10 |
| 22 | Output Formatters | 25+ | 25+ | — | 10 |
| 23 | AI Integration | 8 | 5 | 6 | 11 |
| 24 | RTC | 2 | 1 | 1 | 11 |
| 25 | Format Conversion | 6 | 4 | — | 11 |

### Total Approximate Scale

- **~180+ Python files** in backend
- **~66 HTTP endpoints**
- **~30+ WebSocket message types**
- **~45+ UI components**
- **~25+ output formatters**
- **Runtime kernel alone: ~3,800 lines**

## 12.2 Codaro ↔ marimo Mapping Matrix

### Tier 1: Core (Must Have for MVP)

| marimo Layer | Codaro Existing | Gap | Priority |
|-------------|----------------|-----|----------|
| Runtime Kernel | `src/codaro/kernel/` | 리액티브 재실행 알고리즘 정밀 검증 필요 | P0 |
| Dataflow Graph | `src/codaro/document/` AST 분석 | 위상 정렬, 순환 감지 검증 필요 | P0 |
| AST Visitor (defs/refs) | `src/codaro/document/` | 함수/클래스 스코프, SQL 감지는 미구현 | P0 |
| Compiler (body/last_expr) | `src/codaro/kernel/` | body + last_expr 분리 패턴 확인 필요 | P0 |
| Cell Runner + Hooks | `src/codaro/kernel/` | 실행 훅 시스템 확인 필요 | P0 |
| Executor (Relaxed) | `src/codaro/kernel/` | 기본 exec/eval 이미 동작 | P0 |
| WebSocket session | `src/codaro/kernel/` WS | 메시지 타입 marimo 호환 확인 | P0 |
| CellOutput/Notification | `src/codaro/kernel/` | marimo 형식 호환 확인 필요 | P0 |
| Percent format parser | `src/codaro/document/` | 이미 구현됨 | P0 |
| Package manager (uv) | `src/codaro/system/packageOps.py` | 이미 구현됨 | P0 |
| File system CRUD | `src/codaro/system/fileOps.py` | 이미 구현됨 | P0 |

### Tier 2: Important (Post-MVP Polish)

| marimo Layer | Codaro Existing | Gap | Priority |
|-------------|----------------|-----|----------|
| Config system (MarimoConfig) | 부분 존재 | 전체 스키마 + 계층적 해상도 | P1 |
| CLI (edit/run/export) | `src/codaro/cli.py` | 이미 기본 존재 | P1 |
| State system (reactive state) | 미구현 | `mo.state()` 패턴 필요 | P1 |
| HTTP API 전체 | `src/codaro/api/` | 66개 중 일부만 | P1 |
| SessionView (replay) | 미구현 | 재접속 시 상태 복원 | P1 |
| Session orphan TTL | 미구현 | 접속 해제 시 세션 유지 | P1 |
| Strict Executor | 미구현 | 투명 스코프 격리 완성형 | P1 |
| Autorun/Lazy mode toggle | 부분 구현 | 설정 UI 연동 | P1 |
| Output formatters (DataFrame) | 미구현 | DataFrame 자동 렌더링 | P1 |
| Export (HTML/script/md/ipynb) | `src/codaro/document/` writer | 이미 부분 구현 | P1 |

### Tier 3: Enhancement (Future)

| marimo Layer | Gap | Priority |
|-------------|-----|----------|
| Widget system (mo.ui.*) | 전체 신규 | P2 |
| AI Providers | 전체 신규 (Teacher 형태로) | P2 |
| Pyodide runtime | 전체 신규 | P2 |
| LSP integration | 전체 신규 | P2 |
| Markdown interpolation (mo.md) | 전체 신규 | P2 |
| Format conversion (ipynb↔) | 부분 존재 | P2 |
| Auto-install (missing packages) | 미구현 | P2 |

### Tier 4: Long-term

| marimo Layer | Gap | Priority |
|-------------|-----|----------|
| RTC (Loro CRDT) | 전체 신규 | P3 |
| MCP server | 전체 신규 | P3 |
| Sandbox mode | 전체 신규 | P3 |
| Islands architecture | 전체 신규 | P3 |
| SQL integration | 전체 신규 | P3 |
| Data sources/storage | 전체 신규 | P3 |

## 12.3 Codaro 수용 원칙

### 그대로 수용 (Copy Pattern)

1. **Dataflow graph 구조**: DirectedGraph, topological sort, transitive closure, cycle detection
2. **AST variable inference**: ScopedVisitor의 defs/refs 추론 알고리즘
3. **Compiler pipeline**: body/last_expr 분리, `PyCF_ALLOW_TOP_LEVEL_AWAIT`
4. **Cell Runner**: 위상 정렬 실행, 에러 전파 (cancel descendants)
5. **Message protocol**: CellOutput, CellChannel, KnownMimeType 구조
6. **Config hierarchy**: User → Project → Script → Env 해상도 패턴
7. **Output limits**: 5MB cell output, 1MB console

### 변형 수용 (Adapt Pattern)

1. **Starlette → FastAPI**: Codaro는 FastAPI 기반 (기능적으로 상위호환)
2. **Session per client**: Codaro의 기존 SessionManager에 marimo의 Room/Consumer 패턴 통합
3. **pip → uv only**: Codaro는 CLAUDE.md 규칙에 따라 `uv`만 사용
4. **AI Provider**: marimo는 코드 어시스턴트, Codaro는 AI Teacher (tool_use 기반)
5. **Widget system**: marimo의 UIElement 패턴을 Codaro block 모델에 매핑
6. **Cell → Block**: Codaro는 cell보다 넓은 block 개념 (code, text, guide, widget, view, file)

### 수용하지 않음 (Skip)

1. **marimo native format** (`@app.cell` 데코레이터): Codaro는 Percent Format이 기본
2. **msgspec**: Codaro는 Pydantic 사용 (기존 코드 호환)
3. **multiprocessing.Process per session** (EDIT): Codaro는 자체 엔진 추상화 사용

## 12.4 Critical Implementation Gaps

marimo 분석 결과, Codaro에서 반드시 검증/보강해야 할 핵심 차이:

### Gap 1: Variable Mangling
marimo는 `_` 접두사 변수를 `_{cell_uuid}{name}`으로 맹글링해 셀 간 격리를 강화한다.
→ Codaro의 AST 분석기가 이 패턴을 지원하는지 확인 필요.

### Gap 2: Function/Class Scope in Visitor
marimo의 ScopedVisitor는 함수 내부 변수를 `unbounded_refs`로 분리하고, 함수 정의 시점의 `required_refs`와 구분한다.
→ Codaro의 AST 분석기가 이 수준의 스코프 분석을 하는지 확인 필요.

### Gap 3: Stale Ancestors
실행 시 stale한 조상 셀도 함께 실행된다 (단순히 descendants만이 아님).
→ Codaro의 리액티브 러너가 이 패턴을 구현하는지 확인 필요.

### Gap 4: State Update Resolution
`mo.state()` 세터 호출 → 참조 셀 재실행 → 다시 state update → 재귀적 실행.
→ Codaro에 이 패턴이 없으면 리액티브 상태 시스템 추가 필요.

### Gap 5: Cell Last Expression as Return Value
마지막 문장이 `ast.Expr`이고 세미콜론으로 끝나지 않으면 반환값으로 처리.
→ Codaro 컴파일러가 이 규칙을 따르는지 확인 필요.

### Gap 6: SessionView Replay
클라이언트 재접속 시 전체 상태 리플레이.
→ Codaro에 이 메커니즘이 없으면 추가 필요.

## 12.5 Verification Checklist

### Core Engine

- [ ] AST visitor가 defs/refs를 marimo와 동일하게 추론하는지 unit test
- [ ] 함수/클래스 내부 변수가 unbounded_refs로 정확히 분류되는지 확인
- [ ] 변수 맹글링 (`_` 접두사)이 구현되어 있는지 확인
- [ ] compile_cell()이 body/last_expr를 marimo와 동일하게 분리하는지 확인
- [ ] topological sort가 정확히 실행 순서를 결정하는지 확인
- [ ] 순환 의존 감지가 동작하는지 확인
- [ ] 에러 시 하위 셀 전파 중단이 동작하는지 확인
- [ ] stale ancestor 실행이 구현되어 있는지 확인

### Session/Protocol

- [ ] WebSocket 메시지 타입이 marimo와 호환되는지 확인
- [ ] CellOutput 구조가 marimo 형식과 일치하는지 확인
- [ ] KernelReadyNotification에 해당하는 초기 상태 전송이 있는지 확인
- [ ] 재접속 시 상태 리플레이가 동작하는지 확인

### Config/CLI

- [ ] 설정 스키마가 marimo의 핵심 키를 포함하는지 확인
- [ ] CLI 명령어 (edit, run, export)가 동작하는지 확인
- [ ] autosave, on_cell_change 설정이 동작하는지 확인

## 12.6 Current State

- **PRD 상태**: 12개 분할 문서 전체 작성 완료
- **소스 분석 범위**: marimo 0.21.0 백엔드 전체 (180+ 파일)
- **커버리지**: 서버, 세션, 런타임, AST, 메시징, 설정, CLI, 위젯, AI, RTC

## 12.7 Next Action

1. Codaro 기존 코드와 이 PRD의 Gap 대조 (Gap 1~6 검증)
2. Tier 1 항목의 unit test 작성/확인
3. AST visitor의 스코프 분석 수준 비교
4. 리액티브 러너의 위상 정렬 + stale ancestor 실행 검증

## 12.8 Verification Left

- [ ] Gap 1~6 실제 코드 대조
- [ ] Tier 1 기능의 integration test
- [ ] 프론트엔드 PRD와 백엔드 PRD 간 메시지 프로토콜 정합성 확인
- [ ] Codaro의 기존 `src/codaro/kernel/`과 marimo `_runtime/runtime.py` 세부 비교
