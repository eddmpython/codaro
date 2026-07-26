# 02 Landing And Learning Migration

<!-- completion-record:v1 -->
> 완료일: 2026-07-26T17:56:30+00:00
> 구현 커밋: `a9f3903bb80e7efb603e899bb2e757cd7a97e44b`
> 통과 게이트: web-learning-routes, run-route-state, web-learning, landing-seo, public-product-claims, landing-hydration, landing-public, pages-deployment, ci-experience
> 남은 위험: 전체 contrast·keyboard·screen-reader·Firefox·WebKit·WebView2 수동 matrix는 04-visual-accessibility-gates에서 계속 차단한다.; Run·Local의 전체 capability state와 320px 최소 폭 봉인은 03-run-and-local-migration에서 계속 진행한다.; 현재 세션의 연결 브라우저 목록이 비어 공개 URL 수동 클릭은 수행하지 못했으며, 동일 clean A의 Chromium 상호작용 보고서와 Pages build·deploy 성공을 각각 보존했다.
> 증거: [`completion-evidence.yml`](completion-evidence.yml)

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

- `design-system-contract`: Landing·Learning·Run이 생성된 Astryx token과 공용 SNS registry를 소비하는지 확인한다.
- `web-learning`: 472개 canonical route·lazy payload·sitemap·검색 일치, deep link, 자동 저장 reload, Web Run과 390px/1440px 대표 브라우저 화면을 확인한다.
- `landing-public`: Home·Learn의 Web-first CTA, 실제 media, SEO, hydration과 390px/1440px 반응형 화면을 확인한다.
- 전체 contrast·keyboard·screen-reader·Firefox·WebKit·WebView2 수동 matrix는 [04 visual/accessibility gates](../04-visual-accessibility-gates/)가 소유한다.

## 배포 증거

구현 commit을 먼저 `main`에 push하고 같은 commit을 source로 삼은 `Deploy Pages` run의 build·deploy 성공을 evidence commit에 보존한다. 이전 commit의 성공 배포나 working tree의 로컬 결과를 현재 구현의 배포 증거로 재사용하지 않는다.

## 롤백

URL parser와 initial selection을 함께 되돌린다. Landing 링크만 남겨 깨진 deep link를 만들지 않는다.

## 평가

현재 source에는 실제 제품 capture를 쓰는 Web-first Home, domain별 대표 경로를 우선하는 Learn, 472개 canonical direct lesson, URL 초기 선택과 별도 확인 없는 본문 전환이 구현됐다. Home·Learn과 학습 본문은 390px/1440px에서 image/text overlap, 가로 overflow, 이름 없는 버튼, 깨진 이미지가 0인지 브라우저 gate가 검사한다. Web 학습 자동 저장 검증은 번역된 문구 대신 `data-notebook-active-cell` 의미 표식을 사용해 locale과 무관하게 reload 복원을 판정한다.

이 packet은 clean 구현 commit의 `web-learning`·`landing-public`, 동일 commit의 실제 Pages 배포, 별도 evidence commit과 A→E→B 완료 전이가 모두 확인되기 전까지 진행 상태다. 전체 접근성 수동 matrix는 04의 잔여 범위이며 이 packet에 중복 완료 조건으로 두지 않는다.
