# 02 Data Reporting

상태: 진행

## 목표

`dataReporting`의 Python 변수·제어·함수와 pandas intro·load·filter·aggregate·report outcome closure를 Web에서 완주 가능한 보고서 경로로 만든다.

각 레슨은 서로 다른 업무형 dataset을 사용하고, capstone은 dataframe schema와 저장된 report artifact를 함께 검증한다. 설명용 `contains`나 실행 성공만으로 통과시키지 않는다.

현재 featured capstone `pandas/10_실전종합프로젝트`는 정상·빈 입력을 분리한 CSV table 2개를 만들고 columns와 row count를 검증한다. 대표 경로 aggregate의 `featured-capstone-contracts` machine 판정은 6/6이며 이 경로는 Local 졸업이 필요하지 않다. 그러나 packet 소유 12개 canonical row의 사람 review, 실제 learner evidence와 독립 assessment 승인은 완료되지 않았으므로 이 machine 판정만으로 `_done`이 아니다.

## 영향 파일

- `curricula/python/dataAnalysis/pandas/*.yaml`과 ledger의 prerequisite Python 레슨
- canonical content ledger에서 `ownerPacket=02-data-reporting`인 12개 레슨의 콘텐츠 이관과 review evidence
- packet 소유 `lesson-ledger.yml`, fixture dataset, report result manifest
- data transformation instructional visual

## 영향 함수·심볼

- `composeMasterPlan`, `checkTableArtifact`, `checkFileArtifact`, `ArtifactDescriptor`
- dataframe schema normalizer와 browser file export adapter

## 테스트

- closure와 metadata 100%, 필수 mission strong check 100%
- capstone이 column type, row condition, aggregate value, export file을 검증
- 새 dataset을 쓰는 delayed retrieval과 unseen transfer fixture 통과
- `uv run python -X utf8 tests/run.py gate learning-content`

## 롤백

fixture version과 content hash를 묶어 관리한다. fixture 변경으로 과거 evidence가 재해석되지 않게 하고 레슨별 commit으로 복구한다.

## 평가

사용자가 설치 없이 원본 데이터를 읽고 정제·집계·보고서 저장까지 완료하며 경로 ledger와 canonical 소유 12개 행이 모두 승인돼야 `_done`이다.
