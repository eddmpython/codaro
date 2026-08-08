# policy와 projection parity

상태: 대기

선행: `../01-attempt-observation`

## 목표

MasteryPolicy v2를 추가해 overdue retrieval을 허용하고 v2 capstone을 assurance에서 분리한다. Python과 TypeScript가 같은 archive와 시계에서 같은 결과를 낸다.

## 영향 파일

- `contracts/masteryPolicy.v1.json`
- `contracts/masteryPolicy.v2.json`
- `src/codaro/generatedContracts/**`
- `editor/src/lib/generatedContracts/**`
- `src/codaro/curriculum/masteryPolicy.py`
- `editor/src/lib/masteryPolicy.ts`
- `editor/src/lib/curriculumAssessmentQueue.ts`
- `src/codaro/curriculum/outcomeMastery.py`

## 영향 함수·심볼

- `MasteryPolicy.reduce`
- `MasteryPolicy.advance`
- `MasteryPolicy._advance`
- `dueAssessmentSectionIds`
- `computeMastery`

## 테스트

6일, 7일, 14일, 15일, 장기 overdue 가상 시계와 v1 capstone compatibility, v2 application-only capstone, incompatible version carry-forward를 양쪽 언어에서 비교한다.

## 롤백

writer policy를 v1로 되돌릴 수 있으나 v2 reader와 overdue event 보존은 유지한다.

## 평가

projection parity 불일치 0, overdue eligibility 상실 0, v2 capstone의 assurance 상승 0을 요구한다.
