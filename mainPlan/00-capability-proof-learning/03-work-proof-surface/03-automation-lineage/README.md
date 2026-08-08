# automation lineage

상태: 대기

선행: `../02-artifact-reopen`

## 목표

기존 learning archive automation draft adopt와 TaskRegistry run을 application projection에 연결하고 fixture, 새 입력, schedule 실행을 서로 다른 문구로 표시한다.

## 영향 파일

- `src/codaro/api/learningArchiveAutomation.py`
- `src/codaro/curriculum/learningArchive.py`
- `src/codaro/automation/taskRegistry.py`
- `src/codaro/automation/taskFlow.py`
- automation run receipt component

## 영향 함수·심볼

- `adoptLearningArchiveAutomationDraft`
- task run receipt reader
- `ApplicationProjection`

## 테스트

fixture run, 사용자 선택 입력, schedule trigger, source code 변경, 재검증 전 stale lineage, proof 없는 일반 task를 구분한다.

## 롤백

application label을 숨겨도 일반 task와 기존 automation draft는 유지한다. stale lineage를 유효로 되돌리지 않는다.

## 평가

run 없는 재실행 표시 0, fixture run의 실제 업무 표현 0, source 변경 뒤 검증 없는 application 승격 0을 요구한다.
