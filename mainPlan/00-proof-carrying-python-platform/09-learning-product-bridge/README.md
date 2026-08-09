# 학습과 제품 승격

상태: 대기

## 목표

strong evidence와 typed contract를 가진 학습 결과를 복사 없이 기능 블록, 앱, Task로 승격한다. 초보자 canonical project가 learn에서 publication까지 같은 lineage를 유지한다.

## 영향 파일

- `src/codaro/curriculum/learningArchive.py`
- `src/codaro/api/learningArchiveAutomation.py`
- `src/codaro/curriculum/capabilityProjection.py`
- `editor/src/components/curriculum/`
- `editor/src/components/app/`
- `curricula/python/30days/`

## 영향 함수·심볼

- `adoptLearningArchiveAutomationDraft`
- 새 `promoteLearningArtifactToExecutableUnit`
- capability, application, operation, publication projection
- canonical project authoring contract

## 테스트

- weak/noError/self-rating은 기능 블록 승격을 만들지 않는다.
- source block hash가 evidence, publication, operational receipt에 동일하게 연결된다.
- fresh input과 semantic check 없는 Task run은 application rerun을 만들지 않는다.
- 초보자와 entry fast-track 경로가 실제 Chromium에서 같은 final artifact에 도달한다.

## 롤백

학습 evidence는 삭제하지 않는다. 승격 link가 invalid면 기능 블록과 Task만 재검토 상태로 내리고 원래 assurance receipt를 보존한다.

## 평가

개발자 관점에서는 learning 전용 앱 복사본을 만들지 않아야 한다. PM 관점에서는 학습 완료가 페이지 이동이 아니라 실제 사용할 수 있는 결과물로 이어져야 한다.
