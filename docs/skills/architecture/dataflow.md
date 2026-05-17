---
id: dataflow
title: 데이터흐름 원칙
category: architecture
purpose: Codaro는 상태 가진 편집기. block dependency graph + variable lineage + rerun scope + side effect boundary 초기 고려.
whenToUse: 의존 그래프 변경, rerun 범위 알고리즘 수정, side effect 추적 추가할 때.
---

# 데이터흐름 원칙

- Codaro는 단순 코드 편집기가 아니라 상태를 가진 편집기다.
- 따라서 아래를 초기에 고려한다.
  - block dependency graph
  - variable lineage
  - rerun scope
  - side effect boundary
- "어느 블록을 다시 실행해야 하는가"를 계산할 수 있어야 한다.

## 관련

- [[reactive-execution]] — 자동 재실행 의미론
- [[transparent-scope-isolation]] — 변수 정의/사용 추론
