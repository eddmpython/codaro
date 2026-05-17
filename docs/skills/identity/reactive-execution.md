---
id: reactive-execution
title: 리액티브 실행
category: identity
purpose: 한 셀의 변수에 의존하는 하위 셀이 자동으로 재실행된다. 의존 관계는 AST 추론.
whenToUse: 셀 실행 순서, 재실행 범위, 에러 전파 정책 설계할 때.
---

# 리액티브 실행

- 셀 하나를 실행하면, 그 셀의 변수에 의존하는 하위 셀이 **자동으로 재실행**된다.
- 의존 관계는 AST 분석 기반 (명시적 선언 불필요).
- 에러 발생 시 전파 중단.
- 실행 순서는 문서 순서를 따른다 (의존 관계 내에서).

## 관련

- [[transparent-scope-isolation]] — 변수 정의/사용 추론
- [[execution-engine]] — 엔진 인터페이스
