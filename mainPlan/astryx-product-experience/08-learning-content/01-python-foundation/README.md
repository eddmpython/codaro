# 01 Python Foundation

상태: 진행

## 목표

`pythonFoundation`의 `intro`, `variables`, `operators`, `strings`, `lists`, `dictsAndSets`, `controlFlow`, `functions`, `modulesAndIo`, `errorHandling`, `oop`, `advancedSyntax` outcome과 prerequisite closure를 Web 완주 경로로 개편한다.

`planComposer` 결과를 시작점으로 삼되 각 레슨을 사람이 직접 읽고 overview, worked example, guided Lab, independent Lab, retrieval variant, transfer, strong check를 레슨별 ledger에 승인한다. starter와 정답 복제, weak-only check, 실행 전 prediction을 허용하지 않는다.

현재 featured capstone `30days/day30_최종프로젝트`는 서로 다른 경로의 JSON file 2개를 만들고 artifact descriptor로 검증한다. 대표 경로 aggregate의 `featured-capstone-contracts` machine 판정은 6/6이며 이 경로는 Local 졸업이 필요하지 않다. 그러나 packet 소유 66개 canonical row의 사람 review, 실제 learner evidence와 독립 assessment 승인은 완료되지 않았으므로 이 machine 판정만으로 `_done`이 아니다.

## 영향 파일

- `curricula/python/basics/30days/*.yaml`, `curricula/python/basics/advancedPython/*.yaml` 중 ledger closure에 포함된 레슨
- canonical content ledger에서 `ownerPacket=01-python-foundation`인 66개 레슨의 콘텐츠 이관과 review evidence
- packet 소유 `lesson-ledger.yml`과 review evidence
- foundation Lab에 쓰이는 instructional visual manifest

## 영향 함수·심볼

- `composeMasterPlan`, `RetrievalTaskVariant`, `CheckSpec`, `BrowserCheckExecutor`
- Python 값, control flow, function, I/O, error, OOP용 artifact/check adapter

## 테스트

- outcome·prerequisite coverage 100%, 필수 mission strong check 100%
- unseen retrieval과 transfer task가 worked example의 데이터·제약을 복제하지 않음
- 320px/400% zoom에서 prose, code, result 순서와 자동 feedback 유지
- `uv run python -X utf8 tests/run.py gate learning-content`

## 롤백

한 레슨 또는 review 가능한 작은 prerequisite 묶음 단위로 되돌린다. 기존 completion은 `legacyCompleted`로만 읽고 새 mastery로 승격하지 않는다.

## 평가

경로의 모든 ledger 행과 canonical 소유 66개 행에 reviewer와 evidence commit이 있고 Web에서 첫 실행부터 전이 과제까지 완료될 때만 `_done`으로 이동한다.
