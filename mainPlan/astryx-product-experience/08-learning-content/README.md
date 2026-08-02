# 08 Learning Content

상태: 진행

## 목표

대표 6경로의 실제 학습자 완주와 필요한 Local 졸업을 독립 증거로 확인한다. 콘텐츠 정체성, 저자 검토, 독립 평가 작성 검토와 나머지 25개 도메인 검토는 끝났으므로 이 TODO에는 남은 사람 실행과 환경 검증만 둔다.

## 현재 blocker

| 범위 | 남은 일 | 삭제 조건 |
| --- | --- | --- |
| 대표 6경로 | `learnerEvidenceClaim: none` | 각 경로에서 실제 학습자가 첫 실행, 자동 feedback, 전이 과제와 capstone 결과물까지 완료한 원본 증거를 독립 검토한다 |
| `fileAutomation` | Local 졸업 독립 증거, 공개 Web export 왕복, 목표 Windows 10 설치본 conformance | 안전한 파일 자동화, 복구, archive 왕복과 설치본 격리를 실제 환경에서 검증한다 |
| `officeAutomation` | Local 졸업 독립 증거 | workbook 결과물과 Web-to-Local handoff를 실제 환경에서 검증한다 |
| `webMonitoring` | Local 졸업 독립 증거 | browser audit 결과물과 Local automation을 실제 환경에서 검증한다 |

`featured-capstone-contracts`는 현재 route와 strong check, 결과물 descriptor 6/6을 기계 검증하지만 완료 자격은 거부한다. 완료 blocker는 실제 학습자 증거 미검증과 `fileAutomation`, `officeAutomation`, `webMonitoring`의 Local 졸업 독립 증거다. 기계 생성 결과를 사람 실행 증거로 승격하지 않는다.

## 활성 패킷

| 순서 | 패킷 | 남은 종료 조건 |
| --- | --- | --- |
| 01 | [python-foundation](01-python-foundation/) | 실제 학습자의 Web 첫 실행부터 전이 과제 완주 |
| 02 | [data-reporting](02-data-reporting/) | 실제 학습자의 report capstone과 unseen transfer 완주 |
| 03 | [data-visualization](03-data-visualization/) | 실제 학습자의 chart 판단, saved image 전이와 접근성 검수 |
| 04 | [file-automation](04-file-automation/) | 실제 학습자 Web 완주와 Local file capstone 독립 증거 |
| 05 | [office-automation](05-office-automation/) | 실제 학습자 Web 완주와 workbook Local handoff 독립 증거 |
| 06 | [web-monitoring](06-web-monitoring/) | 실제 학습자 Web 완주와 browser Local automation 독립 증거 |

`00-identity-integrity`와 `07-remaining-domains`의 완료 TODO 문서는 삭제했다. 부모 검증이 소비하는 canonical identity, content, taxonomy, path ledger YAML은 `08-learning-content` 전체가 종료될 때까지 증거 데이터로 유지한다.

## 증거 계약

- `00-identity-integrity/evidence/direct-content-review.yml`: 472개 identity, 441개 alias, 472개 content row와 468개 assessment의 직접 검토 범위
- `00-identity-integrity/identity-ledger/*.yml`: canonical lesson identity 472개와 승인 메타데이터
- `00-identity-integrity/content-ledger/*.yml`: 단일 content owner, source hash, outcome, runtime, check와 승인 메타데이터
- 각 패킷과 남은 domain 폴더의 `lesson-ledger.yml`: taxonomy 31경로의 순서와 canonical membership
- `evidence/featured-capstones.yml`: 대표 6경로의 learner evidence claim과 Local 졸업 상태

원장 생성기는 `uv run python -X utf8 docs/skills/ops/tools/buildLearningLedgers.py --check`로 source, taxonomy와 31개 경로의 `sourceSetHash`를 다시 계산한다. 직접 검토 승인은 evidence commit과 시간대가 있는 reviewer metadata가 없으면 실패한다.

## 영향 파일

- `mainPlan/astryx-product-experience/08-learning-content/01-python-foundation/`부터 `06-web-monitoring/`
- `mainPlan/astryx-product-experience/08-learning-content/evidence/featured-capstones.yml`
- 실제 학습자 및 Local 졸업 원본 evidence bundle
- `tests/curriculum/verifyFeaturedCapstoneContracts.py`, `verifyLearningContentCompletion.py`

## 테스트

- `uv run python -X utf8 tests/run.py gate learning-content`
- 대표 6경로의 실제 Web 완주와 capstone artifact 대조
- Local 필수 3경로의 설치본 졸업, archive round trip과 환경 격리 대조
- learner evidence reviewer, 시간, evidence commit과 경로 6/6 coverage 검증

## 삭제 조건

실제 학습자 증거 6/6과 Local 필수 경로 3/3이 독립 승인되고 `learning-content` completion blocker가 0이 되면 01부터 06의 TODO, 남은 원장 데이터와 이 폴더를 삭제한다. 관련 영구 계약과 회귀 검증은 `contracts/`, `docs/skills/`, `tests/`에 이관한 뒤 상위 작업 지도에서 08 행을 제거한다.
