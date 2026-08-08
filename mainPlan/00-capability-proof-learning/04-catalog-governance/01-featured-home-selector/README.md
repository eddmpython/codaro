# featured 강등과 홈 selector

상태: 대기

선행: `../00-path-lesson-state`

## 목표

기존 featured 6개를 candidate로 강등하고 새 `reportAutomationFoundation`만 machine golden일 때 홈 기본 진입과 featured label을 갖게 한다. 나머지 catalog는 기존 report로 availability를 파생한다.

## 영향 파일

- `src/codaro/curriculum/pathPromotion.py`
- `editor/src/lib/curriculaRegistry.ts`
- `editor/src/components/curriculum/curriculumHome.tsx`
- `contracts/learning-content/featured-capstones.yml`

## 영향 함수·심볼

- `featuredPathIds`
- `registryCategories`
- `CurriculumHome`
- curriculum home path selector

## 테스트

golden 한 개 기본 진입, candidate featured 노출 0, catalog secondary navigation, unavailable hidden, 기존 evidence 보존을 확인한다.

## 롤백

새 golden을 candidate로 내릴 수 있으나 기존 6개를 근거 없이 featured로 되돌리지 않는다.

## 평가

golden 외 featured 0, 기본 catalog tree 진입 0, 강등에 따른 evidence 삭제 0을 요구한다.
