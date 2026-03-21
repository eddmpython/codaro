# 01 — Goal, Rules, and Sources

## 1.1 Goal

marimo 백엔드의 **모든 레이어**를 소스 기반으로 해부하고, Codaro가 동일한 기능을 재구현하기 위한 정밀 계약서를 만든다. 프론트엔드 PRD가 UI/DOM 표면을 다루듯, 이 백엔드 PRD는 서버 → 세션 → 커널 → AST → 런타임 → 출력까지 전체 실행 파이프라인을 커버한다.

## 1.2 Source of Truth

| 항목 | 경로 |
|------|------|
| marimo 패키지 루트 | `.venv/Lib/site-packages/marimo/` |
| 서버 레이어 | `marimo/_server/` |
| 런타임 엔진 | `marimo/_runtime/` |
| AST / 파서 | `marimo/_ast/` |
| 메시징 프로토콜 | `marimo/_messaging/` |
| 세션 관리 | `marimo/_session/` |
| 설정 시스템 | `marimo/_config/` |
| CLI 엔트리포인트 | `marimo/_cli/` |
| 위젯/플러그인 | `marimo/_plugins/` |
| 출력 포맷터 | `marimo/_output/` |
| 포맷 변환 | `marimo/_convert/` |
| AI 통합 | `marimo/_ai/`, `marimo/_server/ai/`, `marimo/_mcp/` |
| Pyodide 지원 | `marimo/_pyodide/` |
| 퍼블릭 API | `marimo/__init__.py` |
| 버전 잠금 | `marimo==0.21.0` |

## 1.3 Rules

1. **소스 추적 필수**: 모든 계약은 marimo 소스 파일 경로 + 클래스/함수명으로 역추적 가능해야 한다.
2. **추측 금지**: API 시그니처, 메시지 타입, 실행 흐름은 반드시 소스 코드에서 확인한 것만 기술한다.
3. **완전성**: 빠뜨린 엔드포인트, 메시지 타입, 클래스가 없어야 한다.
4. **Codaro 매핑**: 각 문서 말미에 Codaro가 이 계약을 어떻게 수용/변형할지 방향을 기록한다.
5. **분할 문서 우선**: 상세는 항상 분할 문서(02~12)에 둔다. 이 파일은 규칙과 소스 경로만.

## 1.4 Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     Browser / Frontend                            │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP + WebSocket
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  _server/main.py          Starlette App Factory                  │
│  _server/api/middleware   Auth, CORS, Skew, OTel, Timeout        │
│  _server/api/endpoints/   REST Handlers (20+ files)              │
│  _server/api/endpoints/ws WebSocket Handlers (7 files)           │
└────────────────────────┬─────────────────────────────────────────┘
                         │ Control Queue / Stream
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  _session/session.py      Session (per-client kernel wrapper)    │
│  _session/room.py         Room (multi-consumer broadcast)        │
│  _session/managers/       Kernel & Queue Manager                 │
│  _session/notebook/       File I/O, Serialization                │
│  _session/state/          SessionView (replay state)             │
└────────────────────────┬─────────────────────────────────────────┘
                         │ Commands (ExecuteCell, Delete, etc.)
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  _runtime/runtime.py      Kernel (main coordinator, ~3800 lines) │
│  _runtime/executor.py     DefaultExecutor / StrictExecutor       │
│  _runtime/runner/         Cell Runner + Hooks                    │
│  _runtime/state.py        Reactive State Container               │
└────────────────────────┬─────────────────────────────────────────┘
                         │ Cell Code
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  _ast/compiler.py         compile_cell() → bytecode              │
│  _ast/visitor.py          ScopedVisitor → defs/refs extraction   │
│  _ast/parse.py            Notebook Parser (marimo/percent/ipynb) │
│  _ast/app.py / cell.py   App & Cell data model                  │
└────────────────────────┬─────────────────────────────────────────┘
                         │ Dependency edges
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  _runtime/dataflow/       DirectedGraph, Runner, Topology        │
│  _runtime/dataflow/graph  Dependency tracking + cycle detection  │
│  _runtime/dataflow/runner Execution scheduler                    │
└──────────────────────────────────────────────────────────────────┘
```

## 1.5 Layer Inventory

| # | Layer | Source Dir | PRD Doc |
|---|-------|-----------|---------|
| 1 | Server App Factory | `_server/main.py`, `_server/asgi.py` | 02 |
| 2 | Middleware Chain | `_server/api/middleware.py` | 02 |
| 3 | HTTP REST Endpoints | `_server/api/endpoints/*.py` | 03 |
| 4 | WebSocket Protocol | `_server/api/endpoints/ws/` | 04 |
| 5 | Message Types | `_messaging/` | 04 |
| 6 | Session Manager | `_session/` | 05 |
| 7 | Kernel Manager | `_session/managers/` | 05 |
| 8 | AST Visitor | `_ast/visitor.py` | 06 |
| 9 | Code Compiler | `_ast/compiler.py` | 06 |
| 10 | Notebook Parser | `_ast/parse.py` | 06 |
| 11 | Document Model | `_ast/app.py`, `_ast/cell.py` | 06 |
| 12 | Runtime Kernel | `_runtime/runtime.py` | 07 |
| 13 | Cell Executor | `_runtime/executor.py` | 07 |
| 14 | Dataflow Graph | `_runtime/dataflow/` | 07 |
| 15 | Cell Runner | `_runtime/runner/` | 07 |
| 16 | State System | `_runtime/state.py` | 07 |
| 17 | Package Manager | `_runtime/packages/` | 08 |
| 18 | File System | `_server/files/` | 08 |
| 19 | Config System | `_config/` | 09 |
| 20 | CLI Commands | `_cli/` | 09 |
| 21 | Widget/Plugin | `_plugins/` | 10 |
| 22 | Output Formatters | `_output/` | 10 |
| 23 | AI Integration | `_server/ai/`, `_ai/`, `_mcp/` | 11 |
| 24 | RTC (Loro CRDT) | `_server/rtc/` | 11 |
| 25 | Format Conversion | `_convert/` | 11 |

## 1.6 File Size Reference (Largest Backend Files)

| File | Size | Significance |
|------|------|-------------|
| `_runtime/runtime.py` | ~137KB, ~3800 lines | 전체 커널 코디네이터 |
| `_cli/cli.py` | ~42KB | CLI 디스패처 |
| `_ast/visitor.py` | ~43KB | AST 변수 추론 |
| `_ast/parse.py` | ~40KB | 노트북 파서 |
| `_ast/app.py` | ~35KB | App 클래스 |
| `_ast/cell.py` | ~24KB | Cell 클래스 |
| `_ast/compiler.py` | ~21KB | 코드 컴파일러 |
| `_ast/codegen.py` | ~20KB | 코드 생성 |
| `_runtime/runner/cell_runner.py` | ~900+ lines | 셀 실행 라이프사이클 |
| `_messaging/notification.py` | ~24KB | 전체 메시지 타입 enum |
