---
id: architecture-overview
title: 아키텍처 방향 — 5층 구조
description: Five-layer architecture overview for the Codaro runtime.
category: architecture
section: reference
order: 201
purpose: 편집기 메커니즘 독립이 1차 목표. document model / execution runtime / reactive dataflow / ui·widget bridge / app shell 5층.
whenToUse: 새 모듈 어느 레이어에 속할지 결정, 레이어 간 의존 방향 검토할 때.
---

# 아키텍처 방향

- 1차 목표는 `편집기 메커니즘`의 독립이다.
- 구조는 아래 5층을 기본으로 본다.
  - `document model`
  - `execution runtime`
  - `reactive dataflow`
  - `ui/widget bridge`
  - `app shell`
- UI가 실행기 구현 세부사항에 직접 묶이면 안 된다.
- 웹, 모바일, 로컬은 가능한 한 같은 문서 모델과 같은 실행 인터페이스를 공유해야 한다.

## 폴더 매핑 (PR 3~4 후 목표 상태)

```
src/codaro/
├── core/         # primitives — errorGuard, outputDescriptor, serverLog, appRuntime, customTool
├── engine/       # document model + execution runtime + reactive dataflow
│   ├── document/ kernel/ runtime/ system/
├── domain/       # business — curriculum, ai, automation
├── transport/    # ui/widget bridge + app shell — api, webBuild
├── extensions/   # plugin hooks
├── server.py     # entry
└── cli.py        # entry
```

## 현재 provider engine 트리

큰 이동 전까지는 아래 경계로 유지한다. router가 provider 루프 세부 구현을 직접 소유하지 않게 하고, 제품 표면은 `api.ts`를 통해서만 접근한다.

```
src/codaro/
├── ai/
│   ├── providerSpec.py      # provider catalog/spec
│   ├── profile.py secrets.py
│   ├── factory.py baseProvider.py providers/
│   ├── conversation.py      # conversation state + role prompts
│   ├── teacher/             # provider loop + orchestrator + context + policy + trace + eval
│   ├── teacherLoop.py       # compatibility shim for older context/tool lifecycle imports
│   ├── tools.py             # default tool definitions
│   ├── toolRegistry.py      # ToolDef + schema registry
│   ├── toolManifest.py      # group/lane/risk metadata
│   ├── toolHandlers/        # workbench/runtime/learning/automation handlers
│   └── toolExecutor.py      # dispatch + session/document boundary
├── api/
│   └── aiRouter.py          # HTTP/SSE boundary only
├── system/
│   └── serverState.py       # process/session/curriculum/runtime state factory
└── webBuild/                # built product surface
```

정리 기준:

- `api/aiRouter.py`에는 HTTP/SSE, request parsing, status code만 둔다.
- provider 선택, context 조립, tool payload는 `ai/` 안에서 관리한다.
- 실행기/문서/커리큘럼 세부 모델은 router가 직접 해석하지 않는다.
- `ServerState` 생성과 runtime/domain concrete wiring은 `system/serverState.py`가 소유한다. `api/appState.py`는 legacy import 호환 shim으로만 둔다.

## 계층 import gate

목표 의존 방향은 `core → engine → domain → transport → entry`다. 현재 물리 폴더가 목표 트리와 완전히 같지 않아도 import 방향은 아래 매핑으로 판단한다.

| 목표 계층 | 현재 폴더 | 규칙 |
| --- | --- | --- |
| core | `serverLog.py`, 공용 primitive | 위 계층 구현을 import하지 않는다 |
| engine | `document/`, `runtime/`, `kernel/` | `api/`, `ai/`, `curriculum/`, `automation/`, `share/`, `extensions/`를 import하지 않는다 |
| domain | `curriculum/`, `automation/`, `share/`, `extensions/`, `ai/` | `api/`를 import하지 않는다. tool handler는 engine/domain flow 경계만 호출한다 |
| transport | `api/`, `webBuild/` | HTTP/SSE/WebSocket/payload 변환만 맡고 provider/runtime/domain 내부 판단을 직접 소유하지 않는다 |
| entry | `server.py`, `cli.py` | 앱 조립과 실행 진입점이다 |

`system/`은 현재 전환기 composition seam이다. `serverState.py`는 runtime/domain concrete wiring을 소유할 수 있지만, `api/`를 import하거나 router 판단을 흡수하면 실패다. 이 예외는 영구 설계가 아니라 목표 트리로 이동할 때 줄일 제거 대상이다.

일반 import 방향은 `tests/testArchitectureLayerContract.py`가 검사하고, router별 세부 경계는 `tests/testTransportBoundary.py`가 검사한다. 새 모듈이 생기면 먼저 이 매핑에서 위치를 정하고, 예외가 필요하면 문서·테스트·제거 조건을 같은 변경에서 갱신한다.

## 관련

- [[ssot-map]] [[document-model]] [[execution-engine]] [[dataflow]] [[widget-bridge]]
