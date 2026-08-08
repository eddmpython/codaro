# checker discrimination harness

상태: 대기

선행: `../00-claim-family-contract`

## 목표

reference solution, 공통 생성 mutation, family별 semantic mutation, valid alternative를 한 명령으로 실행해 false accept와 false reject를 차단한다.

## 영향 파일

- `tests/curriculum/**`
- `curricula/python/schema.yaml`
- TaskFamily별 fixture와 corpus

## 영향 함수·심볼

- strong check executor
- semantic output matcher
- mutation corpus runner
- valid alternative runner

## 테스트

상수 반환, 분기 제거, 비교 반전, off-by-one, 오류 처리 삭제, 파일 쓰기 삭제를 생성하고 invalid row 무시와 예시 하드코딩 semantic mutant를 추가한다. 다른 변수명, loop, comprehension, 함수 분해를 허용한다.

## 롤백

생성 mutation 종류를 줄일 수 있으나 required corpus를 건너뛰거나 사람 승인으로 대체하지 않는다.

## 평가

required mutant false accept 0, valid alternative false reject 0, zero-edit credit 0, 동일 seed 비결정 0을 요구한다.
