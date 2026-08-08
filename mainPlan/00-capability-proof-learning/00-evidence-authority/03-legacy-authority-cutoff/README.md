# legacy authority 차단

상태: 대기

선행: `../02-policy-projection`

## 목표

reader, writer, projection parity가 닫힌 뒤 수동 validation, legacy credit 평균, review scheduler, `track-achievement`가 canonical stage를 바꾸지 못하게 한다.

## 영향 파일

- `src/codaro/curriculum/progress.py`
- `src/codaro/curriculum/learnerProgressFlow.py`
- `src/codaro/curriculum/reviewFlow.py`
- `src/codaro/ai/toolHandlers/learning.py`
- `src/codaro/ai/toolHandlers/curriculumOs.py`
- `src/codaro/ai/toolDefinitions/learning.py`
- `src/codaro/ai/toolDefinitions/curriculumOs.py`

## 영향 함수·심볼

- `markOutcomeValidated`
- `clearOutcomeValidation`
- `creditCheckPass`
- `recordReviewResult`
- `updateOutcomeValidation`
- `track-achievement`

## 테스트

legacy true, manual toggle, review success, page view, 자기평가가 모두 canonical projection stage에 영향 0인지 확인한다.

## 롤백

진단용 legacy read는 유지할 수 있으나 stage writer 권한은 복원하지 않는다.

## 평가

`CreditGranted → MasteryPolicy` 외 stage writer 0과 legacy API 우회 0을 요구한다.
