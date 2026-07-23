# 19 Big Data Pipelines

상태: 설계

## 목표

taxonomy domain `bigDataPipelines`의 target outcome과 prerequisite closure를 path `lesson-ledger.yml`과 canonical content owner row 기준으로 레슨별 개편한다. 이 packet은 source YAML을 생성하지 않으며 각 레슨을 사람이 읽고 실행하고 strong check·retrieval·transfer를 승인한다.

## 영향 파일

- `lesson-ledger.yml`에 고정한 canonical lesson source
- `curricula/python/_taxonomy.yml`의 `bigDataPipelines` membership
- packet fixture, artifact descriptor, visual manifest와 review evidence

## 영향 함수·심볼

- `composeMasterPlan`, `LessonRef`, `CheckSpec`, `RetrievalTaskVariant`, `ArtifactDescriptor`

## 테스트

- path membership closure·target outcome·canonical content reference 100%, gap 0
- owner canonical row의 required CheckSpec, retrieval 3개, near/far transfer ID가 모두 존재
- `uv run python -X utf8 tests/run.py gate learning-content`

## 롤백

한 레슨 또는 review 가능한 prerequisite 묶음 commit만 되돌린다. canonical source를 복제하거나 다른 path의 evidence를 삭제하지 않는다.

## 평가

ledger 모든 행의 author review와 evidence commit이 채워지고 domain strong capstone이 통과해야 내부 `_done`으로 이동한다.
