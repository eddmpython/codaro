---
id: automation-tasks-reports
title: 자동화 + 태스크
description: Automation, task, and execution-result concepts for Codaro workflows.
category: identity
section: concepts
order: 108
purpose: 사용자/AI가 작성한 .py 문서가 그 자체로 실행 가능 태스크. 스케줄/웹훅/수동 트리거 + 워크플로우 DAG + 감사 로그 + E-Stop.
whenToUse: 스케줄러 설계, 워크플로우 DAG 구현, audit trail 포맷 결정, E-Stop 로직 구현할 때.
---

# 자동화 + 태스크

- 사용자가 작성하거나 AI가 생성한 Python 문서(.py)는 그 자체가 **실행 가능한 태스크**가 된다.
- 자동화 표면은 에디터에서 만든 셀 조합과 스크립트를 모아두는 곳이다.
- `Codaro 자동화`는 기본 제공 템플릿, `나만의 자동화`는 사용자가 만든 자동화다.
- 태스크는 스케줄(@every_5m, @daily 등)에 자동 실행되거나, 웹훅으로 외부 트리거되거나, 수동 실행할 수 있다.
- 태스크는 자동화 스크립트를 몇 시 몇 분에 실행할지 정하는 예약 단위다.
- 여러 태스크를 의존성(DAG)으로 묶은 **워크플로우**가 가능하다.
- 모든 자동화 액션은 **감사 로그**(audit trail, JSONL)에 기록된다.
- 태스크 실행 결과(변수, stdout, 에러)는 리포트 산출물로 조회 가능하다. 리포트는 제품의 1급 표면이 아니라 자동화 결과를 읽기 좋게 보여주는 결과물이다.
- **비상 정지(E-Stop)**가 모든 자동화를 즉시 중단시킨다.

## 셀 기반 자동화

자동화도 결국 셀 조합이다. Python 실행 셀에서 시작하되, `executionKind`로 브라우저, OS, 마우스, 이미지, 태스크, 스킬 실행을 구분한다. 이렇게 해야 학습 셀, 실습 셀, 자동화 셀이 같은 notebook/cell 모델 위에서 이어진다.

`type="automation"`이고 `executionKind`가 `browser`, `os`, `mouse`인 셀은 kernel Python 실행이 아니라 영속 자동화 세션 셀로 실행된다. 이 셀은 `/api/automation/session-cell`을 통해 live browser/desktop 세션을 열고(`open`), 조회하고(`query`), 한 step씩 실행하고(`step`), 명시적으로 닫는다(`close`). 정상 step 성공은 live 객체를 닫지 않는다. 자동화 표면은 이 셀과 recipe를 검증한 뒤 태스크/스케줄/워크플로우로 키우는 second loop로 남는다.

## 관련

- [[external-channels-mobile]] — Webhook/Slack 트리거
- [[multi-editor-modes]] — 대화, 현재 학습, 노트북, 자동화 네 제품 표면
- [[percent-format]] — .py가 곧 태스크
