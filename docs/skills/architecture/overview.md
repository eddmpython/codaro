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
│   ├── teacherLoop.py       # context injection + tool lifecycle payloads
│   ├── tools.py             # tool manifest/schema
│   └── toolExecutor.py      # tool handlers
├── api/
│   └── aiRouter.py          # HTTP/SSE boundary only
└── webBuild/                # built product surface
```

정리 기준:

- `api/aiRouter.py`에는 HTTP/SSE, request parsing, status code만 둔다.
- provider 선택, context 조립, tool payload는 `ai/` 안에서 관리한다.
- 실행기/문서/커리큘럼 세부 모델은 router가 직접 해석하지 않는다.

## 관련

- [[document-model]] [[execution-engine]] [[dataflow]] [[widget-bridge]]
