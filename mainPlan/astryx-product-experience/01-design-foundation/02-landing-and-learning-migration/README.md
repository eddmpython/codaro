# 02 Landing And Learning Migration

상태: 진행

## 목표

다운로드를 강요하지 않고 첫 화면에서 웹 학습으로 진입하며, 교육 카드는 읽고 실행하는 흐름을 방해하지 않게 만든다.

## 범위

- 실제 제품 capture를 쓰는 Codaro hero
- 웹 학습 1차 행동, Local 자동화 2차 확장
- 472개 전체 덤프 대신 domain별 대표 레슨과 guided path
- lesson deep link와 비상호작용 loading state
- 이미 아래에 있는 내용을 여는 중복 `학습 시작` 버튼 제거

## 구현 순서

1. Home을 제품 capture 배경과 web-first action으로 재구성한다.
2. Learn을 guided path, domain rail, 읽히는 대표 레슨으로 재구성한다.
3. URL의 category/lesson을 Editor 초기 선택으로 전달한다.
4. 선택된 레슨은 별도 확인 없이 본문으로 자동 전환한다.

## 영향 파일

- `landing/src/pages/home.jsx`, `landing/src/pages/learn.jsx`
- `landing/src/styles/homeAstryx.css`, `landing/scripts/syncBrand.js`
- `editor/src/lib/curriculumDeepLink.ts`, `editor/src/hooks/useCurriculumLibraryState.ts`
- `editor/src/components/app/currentLearningSurface.tsx`
- `editor/src/components/curriculum/curriculumSurface.tsx`

## 영향 함수·심볼

- `lessonHref`, `parseCurriculumDeepLink`, `CurrentLearningSurface`
- `useCurriculumLibraryState`, `LearningOverview`

## 테스트

- `design-system-contract`
- `learning-card-browser`
- `learning-system-readiness`
- Landing desktop screenshot review 완료, mobile/full mode matrix는 후속

## 롤백

URL parser와 initial selection을 함께 되돌린다. Landing 링크만 남겨 깨진 deep link를 만들지 않는다.

## 평가

대표 화면과 472개 canonical direct lesson은 구현됐다. Home·Learn 390px/1440px에서 image/text overlap과 lesson row 가독성을 검토하고 mobile hero 아래 다음 band가 보이도록 교정했다. 전체 접근성 수동 matrix와 실제 Pages 배포가 남아 완료가 아니다.
