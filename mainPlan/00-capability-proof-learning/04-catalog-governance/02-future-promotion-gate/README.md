# future promotion gate

상태: 대기

선행: `../01-featured-home-selector`

## 목표

두 번째 경로를 실제로 승격하지 않고, future path가 claim closure, checker discrimination, runtime, artifact 또는 inference boundary, receipt smoke를 모두 통과해야 machine golden이 되는 gate를 만든다.

## 영향 파일

- `src/codaro/curriculum/pathPromotion.py`
- `docs/skills/ops/tools/buildLearningLedgers.py`
- `docs/skills/architecture/curriculum-authoring.md`
- `docs/skills/ops/product/learning-efficacy-operations.md`
- path promotion test와 report builder

## 영향 함수·심볼

- `resolvePathPromotionState`
- `buildLearningLedgers.evaluate`
- `GoldenPathGateReport`

## 테스트

missing claim, weak checker, mutant false accept, invalid runtime, missing artifact boundary, provider dependency를 각각 거부하고 fully machine-ready fixture만 허용한다.

## 롤백

gate report UI는 숨길 수 있으나 golden selector를 느슨한 이전 조건으로 되돌리지 않는다.

## 평가

외부 승인 조건 0, 사람 표본 대기 0, 두 번째 실제 승격 0, machine gate 우회 0을 요구한다.
