# capability projection

상태: 대기

선행: `../../02-golden-automation-path`

## 목표

TaskFamily, claim, path assurance를 required child의 최저 stage로 계산하고 application을 별도 축으로 합성한다. current version과 compatible한 receipt만 현재 stage에 쓴다.

## 영향 파일

- `src/codaro/curriculum/outcomeMastery.py`
- `src/codaro/api/curriculumRouter.py`
- `editor/src/lib/masteryPolicy.ts`
- projection parity fixture

## 영향 함수·심볼

- `computeMastery`
- `MasteryPolicy.reduce`
- `CapabilityProjection`
- `ApplicationProjection`

## 테스트

family 일부 통과, mixed claim, due family, incompatible version, v1과 v2 capstone, application lineage 조합을 Python과 TypeScript에서 비교한다.

## 롤백

projection cache와 UI reader는 되돌릴 수 있으나 canonical event와 version receipt는 유지한다.

## 평가

child 최저 stage보다 높은 parent stage 0, parity 불일치 0, assurance와 application 암묵 승격 0을 요구한다.
