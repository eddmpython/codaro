# 최소 outcome과 새 path

상태: 대기

선행: `../../01-capability-task-family`

## 목표

CSV 검증과 JSON 보고서에 필요한 11개 outcome만 가진 `reportAutomationFoundation`을 추가한다. OOP, advanced syntax, day22, day25는 optional enrichment로 남긴다.

## 영향 파일

- `curricula/python/_taxonomy.yml`
- `contracts/learning-content/path-ledgers/reportAutomationFoundation.yml`
- `contracts/learning-content/featured-capstones.yml`
- `curricula/python/schema.yaml`

## 영향 함수·심볼

- `DomainDef`
- path ledger builder
- featured capstone validator

## 테스트

11개 target outcome, lesson ref, prerequisite, claim과 TaskFamily closure를 검사한다. 기존 `pythonFoundation` hash와 의미가 바뀌지 않아야 한다.

## 롤백

새 path row와 ledger만 제거하고 기존 taxonomy, 레슨, evidence는 보존한다.

## 평가

첫 과업에 OOP 또는 decorator 필수 조건 0, 기존 path evidence carry-forward 0, 새 path orphan 0을 요구한다.
