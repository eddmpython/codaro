---
id: automation-tasks-reports
title: 자동화 + 태스크 + 리포트
category: identity
purpose: 사용자/AI가 작성한 .py 문서가 그 자체로 실행 가능 태스크. 스케줄/웹훅/수동 트리거 + 워크플로우 DAG + 감사 로그 + E-Stop.
whenToUse: 스케줄러 설계, 워크플로우 DAG 구현, audit trail 포맷 결정, E-Stop 로직 구현할 때.
---

# 자동화 + 태스크 + 리포트

- 사용자가 작성하거나 AI가 생성한 Python 문서(.py)는 그 자체가 **실행 가능한 태스크**가 된다.
- 태스크는 스케줄(@every_5m, @daily 등)에 자동 실행되거나, 웹훅으로 외부 트리거되거나, 수동 실행할 수 있다.
- 여러 태스크를 의존성(DAG)으로 묶은 **워크플로우**가 가능하다.
- 모든 자동화 액션은 **감사 로그**(audit trail, JSONL)에 기록된다.
- 태스크 실행 결과(변수, stdout, 에러)는 리포트로 조회 가능하다.
- **비상 정지(E-Stop)**가 모든 자동화를 즉시 중단시킨다.

## 관련

- [[external-channels-mobile]] — Webhook/Slack 트리거
- [[multi-editor-modes]] — 리포트 뷰어 모드
- [[percent-format]] — .py가 곧 태스크
