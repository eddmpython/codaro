# Task 실행 보안

상태: 대기

## 목표

Task의 permission scope를 표시와 fingerprint에만 두지 않고 실제 실행 broker가 집행한다. semantic output contract를 통과한 run만 operational receipt 후보가 된다.

## 영향 파일

- `src/codaro/automation/taskModel.py`
- `src/codaro/automation/taskRunner.py`
- `src/codaro/automation/taskSafety.py`
- `src/codaro/runtime/`
- `src/codaro/system/diagnosticSummary.py`
- `tests/automation/`, `tests/runtime/`

## 영향 함수·심볼

- `TaskDefinition.permissionScopes`, `TaskRunner.run`
- 새 task execution broker와 output contract evaluator
- stdout, error, variable, artifact redactor
- workspace path resolver와 secret reference resolver

## 테스트

- workspace 밖 read/write, 미승인 network, child process가 실제로 거부된다.
- E-Stop이 broker 시작 전과 block 사이 모두 차단한다.
- secret canary가 run persistence, audit, notification, API에 나오지 않는다.
- 예외 없는 실행이라도 output contract 실패면 validated가 아니다.

## 롤백

기존 TaskRun은 운영 로그로 읽되 validated로 해석하지 않는다. broker rollout 실패 시 schedule을 자동 재활성화하지 않고 task를 disabled로 유지한다.

## 평가

개발자 관점에서는 safety receipt와 실제 enforcement receipt가 같은 policy hash를 가져야 한다. PM 관점에서는 자동화 성공이 단순 무오류가 아니라 사용자가 선언한 결과를 만들었다는 뜻이어야 한다.
