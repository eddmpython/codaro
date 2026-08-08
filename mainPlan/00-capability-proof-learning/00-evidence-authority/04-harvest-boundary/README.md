# 일반 Harvest와 학습 적용 경계

상태: 대기

선행: `../03-legacy-authority-cutoff`

## 목표

`/api/tasks/from-code`를 일반 task 생성으로 유지하고 legacy outcome gate를 제거한다. 학습 적용은 기존 automation draft adopt 경로의 canonical proof lineage가 소유한다.

## 영향 파일

- `src/codaro/api/automationRouter.py`
- `src/codaro/api/learningArchiveAutomation.py`
- `src/codaro/curriculum/learningArchive.py`
- `src/codaro/automation/taskRegistry.py`
- `src/codaro/automation/taskFlow.py`

## 영향 함수·심볼

- `HarvestCodeRequest`
- `apiHarvestCode`
- `adoptLearningArchiveAutomationDraft`

## 테스트

일반 task는 proof 없이 생성되고, learning adopt는 proof id, source run, check, artifact hash 없이 거부되는지 확인한다. stale legacy mastery는 application을 만들지 못해야 한다.

## 롤백

learning adopt 검증을 끌 수는 있어도 일반 task에 legacy mastery gate를 되살리지 않는다.

## 평가

일반 생성의 학습 의존 0, canonical proof 없는 application 0, lineage 없는 task run의 작업 증명 0을 요구한다.
