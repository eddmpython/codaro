# path와 lesson 상태 분리

상태: 대기

선행: `../../03-work-proof-surface`

## 목표

derived `PathPublicationState`, 개별 `LessonAvailability`, `Visibility`, 개인 achievement를 분리한다. E0~E3는 effect claim만 제어하고 machine golden 노출을 막지 않는다.

## 영향 파일

- `src/codaro/curriculum/pathPromotion.py`
- `src/codaro/curriculum/efficacyStage.py`
- `curricula/python/_taxonomy.yml`
- 관련 contract와 test

## 영향 함수·심볼

- `resolvePathPromotionState`
- `EfficacyStage`
- `PathPublicationState`
- `LessonAvailability`

## 테스트

machine-ready와 E0, machine-ready와 E3, machine-failed와 E3를 조합해 publication과 effect claim이 독립인지 확인한다.

## 롤백

derived state projector는 되돌릴 수 있으나 DomainDef에 수동 publication state를 추가하지 않는다.

## 평가

E3 없는 machine golden 차단 0, E3 없는 effect claim 0, golden lesson이라는 개별 상태 0을 요구한다.
