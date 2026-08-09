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

## 영속 실행 안전

- 새 태스크와 과거 안전 계약이 없는 태스크는 비활성 상태로 시작한다.
- 태스크를 활성화하기 전에 파일 읽기, 파일 쓰기·삭제, 네트워크, 외부 프로세스 실행 범위와 파괴적 위험을 사용자에게 보여 주고 확인을 받는다.
- 확인 receipt는 태스크 ID, 실제 문서 bytes, 문서 경로, schedule, permission scope, risk level에 결속한다.
- 문서나 schedule, permission scope, risk level이 달라지면 기존 receipt를 인정하지 않고 다시 확인할 때까지 실행과 schedule 재무장을 막는다.
- 수동 실행, webhook, workflow, scheduler callback과 서버 시작 시 schedule 복원은 모두 현재 receipt를 다시 검사한다.
- E-Stop은 승인된 태스크에도 계속 적용되며, 승인 실패와 무효화는 audit trail에 남긴다.

확인 화면과 실제 실행은 같은 `policyHash`를 사용한다. Task 전용 Local worker는 Python audit event를 통해 workspace 밖 파일 접근을 막고, 선언되지 않은 `filesystem.read`, `filesystem.write`, `network`, `process.execute` 동작을 거부한다. 빈 권한 목록도 유효하며 순수 계산 task에 사용할 수 있다. E-Stop은 worker 생성 전과 실행 block 사이에서 모두 다시 검사한다.

## 의미 검증과 운영 증거

- 예외 없이 끝난 `TaskRun.status=success`는 실행 로그일 뿐 검증된 운영 증거가 아니다.
- 새 task는 stdout, 변수, 산출물의 `outputContract@1`을 선언할 수 있다. 이 계약을 통과한 run만 `validated=true`가 된다.
- 파일 산출물은 workspace 상대 경로, byte 크기, content hash로 확인한다. 문서 밖 경로와 workspace를 벗어나는 symlink는 허용하지 않는다.
- `operationalCandidate=true`는 의미 검사, 산출물 검사, 현재 safety policy hash가 일치했다는 뜻이다. 이것만으로 `OperationalRunReceipt`를 만들지는 않는다. 학습 proof와 source lineage를 검증하는 신뢰된 writer가 별도로 receipt를 발급한다.
- `secretRefs`에는 환경 변수 이름만 저장한다. 값은 task 결과, 변수, audit, 알림, API 응답과 진단 요약에 저장하지 않는다.
- 과거 `TaskRun`과 output contract가 없는 성공 run은 계속 조회할 수 있지만 `validated` 또는 proof로 승격하지 않는다.

## 셀 기반 자동화

자동화도 결국 셀 조합이다. Python 실행 셀에서 시작하되, `executionKind`로 브라우저, OS, 마우스, 이미지, 태스크, 스킬 실행을 구분한다. 이렇게 해야 학습 셀, 실습 셀, 자동화 셀이 같은 notebook/cell 모델 위에서 이어진다.

`type="automation"`이고 `executionKind`가 `browser`, `os`, `mouse`인 셀은 kernel Python 실행이 아니라 영속 자동화 세션 셀로 실행된다. 이 셀은 `/api/automation/session-cell`을 통해 live browser/desktop 세션을 열고(`open`), 조회하고(`query`), 한 step씩 실행하고(`step`), 명시적으로 닫는다(`close`). 정상 step 성공은 live 객체를 닫지 않는다. 자동화 표면은 이 셀과 recipe를 검증한 뒤 태스크/스케줄/워크플로우로 키우는 second loop로 남는다.

## 관련

- [[external-channels-mobile]] - Webhook/Slack 트리거
- [[multi-editor-modes]] - 대화, 학습, 노트북, 자동화 네 제품 표면
- [[percent-format]] - .py가 곧 태스크
