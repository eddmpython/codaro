---
id: execution-engine
title: 실행 엔진 원칙
category: architecture
purpose: 엔진은 교체 가능 인터페이스. PyodideEngine / SandboxEngine / LocalEngine. 편집기는 capability만 호출.
whenToUse: 새 엔진 구현, capability 추가 (execute/interrupt/variables/files/packages/docs), 엔진 분기 결정할 때.
---

# 실행 엔진 원칙

- 실행 엔진은 교체 가능한 인터페이스로 설계한다.
- 기본 후보:
  - `PyodideEngine`
  - `SandboxEngine`
  - `LocalEngine`
- 편집기는 `execute`, `interrupt`, `variables`, `files`, `packages`, `docs` 같은 capability를 호출하고, 개별 엔진 구현을 직접 알지 않아야 한다.

## 관련

- [[pyodide-first-runtime]] — Pyodide 기본, 로컬 슈퍼셋
- [[reactive-execution]] — 의존 그래프 위에서 동작
