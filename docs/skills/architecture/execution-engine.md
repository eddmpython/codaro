---
id: execution-engine
title: 실행 엔진 원칙
description: Execution engine responsibilities for kernels, runtimes, and reruns.
category: architecture
section: reference
order: 203
purpose: 엔진은 교체 가능 인터페이스. LocalEngine을 기본으로 두고 편집기는 capability만 호출.
whenToUse: 새 엔진 구현, capability 추가 (execute/interrupt/variables/files/packages/docs), 엔진 분기 결정할 때.
---

# 실행 엔진 원칙

- 실행 엔진은 교체 가능한 인터페이스로 설계한다.
- 기본 후보:
  - `LocalEngine`
  - `SandboxEngine`
- 편집기는 `execute`, `interrupt`, `variables`, `files`, `packages`, `docs` 같은 capability를 호출하고, 개별 엔진 구현을 직접 알지 않아야 한다.
- AI teacher와 `editor/` 제품 표면도 같은 capability surface를 호출한다.
- 셀 실행/검증은 장기적으로 `cell-call` 계약으로 수렴한다. `execute-reactive`, `check-exercise`는 하위 호환 및 세부 구현 도구다.
- editor의 직접 실행 버튼도 kernel execute로 바로 들어가지 않는다. `editor/src/lib/notebookRuntime.ts`가 세션 패키지 목록을 확인하고, 누락 패키지를 세션 `packages/install` capability의 uv 경로로 준비한 뒤 `execute` 또는 `execute-reactive`를 호출한다.
- `editor-runtime-preflight` gate는 이 순서가 `packages-check → packages-install → cell-call` 의미와 어긋나지 않는지 확인한다.
- kernel 실행 결과를 HTTP, websocket, tool payload로 바꾸는 기준은 `src/codaro/kernel/executionPayload.py`에 둔다.

## 관련

- [[local-first-runtime]] — 로컬 기본 실행 정책
- [[reactive-execution]] — 의존 그래프 위에서 동작
