# 07 Landing Experience

상태: 진행

## 작업 폴더

- [Proof Studio Landing](00-proof-studio-landing/)

이 폴더의 machine gate와 사람 화면 검수, 실제 Pages 배포 증거가 모두 같은 commit을 가리킬 때만 `_done` 전이를 검토한다.

현재 Home은 실제 product capture 위에 code, output, verification을 읽을 수 있는 Proof Studio workbench를 두고 첫 CTA를 canonical interactive lesson으로 연결한다. 공개 `/learn`은 총량·도메인 카드 대신 이어하기, 검색, 여섯 outcome path와 Web 310개·Local 162개의 capability 경계를 보여 준다. 472개 canonical lesson route가 route별 본문 module, 제목·description·breadcrumb·JSON-LD, sitemap과 검색 index로 prerender되며 같은 URL에서 interactive editor가 시작된다. hydration 전후 root/meta/JSON-LD 안정성과 CLS를 검사하고 Home·Learn 390px/1440px Light/Dark 감사에서 image load, text/control overlap과 horizontal overflow 0을 확인했다. source build와 대표 browser case는 green이지만 push된 commit의 실제 Pages 배포 smoke, 검색 index 유입, 수동 접근성 검수와 사람 브랜드 검수가 남아 있어 상태는 `진행`이며 `_done`이 아니다.

## 목표

랜딩을 다운로드 버튼과 fake code frame 중심의 페이지에서, 웹에서 즉시 학습할 수 있다는 사실과 Local 자동화의 확장 가치를 실제 제품 이미지로 증명하는 공개 제품 표면으로 바꾼다. docs/blog/search도 같은 Astryx public shell을 사용한다.

## 첫 화면 구성

- H1: `Codaro`
- supporting copy: Python을 배우고, 실행하고, 반복 업무로 확장하는 programmable studio
- primary action: `웹에서 바로 학습` -> 첫 canonical interactive lesson
- secondary action: `학습 경로 둘러보기` -> `/learn/`
- tertiary text link: `Local 다운로드`
- background media: 실제 Run product capture를 full-bleed 배경으로 사용하고 code·result·verification은 접근 가능한 실제 DOM으로 읽게 한다.
- 다음 proof band: 이해, 수정, 실행, 자동 검증이 한 흐름으로 이어지는 learning proof를 보여 준다.
- desktop과 mobile 모두 첫 viewport 아래에 다음 capability band의 시작이 보이게 한다.

## 페이지 구조

1. Hero: 제품명, code, output, verification과 canonical lesson 진입
2. Learning proof: 이해, 수정, 실행, 자동 검증
3. Outcome paths: 대표 6경로의 결과 이미지와 Web/Local 범위
4. Web to Local: 같은 학습 문서가 강한 자동화로 확장되는 경계
5. Trust: source, privacy, runtime tier와 footer

## Public navigation 계약

- desktop 순서는 brand home, `학습`, `문서`, `소식`, `Run 열기`, search icon, resource menu다. resource menu에 `팩`과 `도구`를 둔다.
- mobile은 같은 순서를 Astryx `Layer` menu에 유지하고 `웹에서 시작`을 첫 command로 둔다. 별도 mobile 정보 구조를 만들지 않는다.
- active는 `/` exact, `/learn`과 lesson prefix, `/docs` prefix, `/docs/blog` longest-prefix 순으로 하나만 표시한다. `Run 열기`와 search는 active nav가 아니라 command다.
- Local 다운로드는 header primary nav가 아니라 footer와 capability 전환 맥락에 둔다.

## 디자인 기준

- marketing card grid를 페이지 전체 구성법으로 쓰지 않는다. 반복되는 goal path와 trust item만 card가 될 수 있다.
- fake terminal, fake editor, emoji icon을 제거한다.
- 실제 product image는 어둡게 blur하거나 과도하게 crop하지 않는다.
- docs/blog/search는 읽기 폭, sticky local nav, 검색과 코드 가독성을 통일한다.
- floating social/download control은 제거하고 명령은 header/footer의 예측 가능한 위치에 둔다.
- mobile action은 44px hit target과 두 줄 label overflow를 보장한다.

## Layout blueprint

| viewport | header·hero | media·action | scroll·focus |
| --- | --- | --- | --- |
| `>=1440` | header 64px, hero 560~720px, content max 1200px | `runLearningHero` full-bleed, safe region CTA, 다음 band `runLearningDetail` | page scroll, 다음 proof band 최소 56px 노출 |
| `768~1439` | header 60px, hero `calc(100svh - 108px)` 이하 | media 중심 crop과 focal point, CTA 2행 허용 | sticky header, skip link가 main heading으로 focus |
| `480~767` | header 56px, hero `calc(100svh - 104px)` 이하 | safe region overlay와 CTA vertical, 핵심 UI 위 scrim 금지 | proof band 최소 48px 노출, horizontal overflow 0 |
| `<480` | 320px reflow, brand와 H1 첫 신호 | 44px action, longest Korean/English label wrap | safe-area, focus ring clipping 0 |

hero text를 card에 넣지 않는다. 390px과 1440px에서 copy가 code·result·check를 가리지 않아야 한다. product media가 로드되지 않아도 brand, H1, primary action과 proof band가 같은 위치를 유지하며, 다음 band에서는 실제 상태를 overlay 없이 읽을 수 있어야 한다.

## 구현 순서

1. 현재 873줄 `App.jsx`, 2,427줄 `styles.css`, 511줄 `homeAstryx.css`의 route/style ownership을 census한다.
2. 공용 `PublicShell`, `PublicHeader`, `PublicFooter`를 Astryx로 만든다.
3. `HomePage`를 실제 media와 새 CTA hierarchy로 재구성한다.
4. docs/blog/search/tools/packs를 공용 page primitives로 옮긴다.
5. 사용되지 않는 `prerenderReact.js.homeBody`를 제거하고 React SSR 한 source만 유지한다.
6. SSR markup이 있는 route는 client `createRoot`가 아니라 `hydrateRoot`로 연결해 중복 렌더와 CLS를 막는다.
7. homepage structured data, OG, sitemap copy를 갱신한다.
8. `postbuild.js`의 `llms.txt`, `llms-full.txt`, generated search와 공개 제품 문서에서 Web 학습을 부정하는 legacy local-only 문장을 제거한다.
9. legacy CSS를 route 단위로 제거하고 public shell token 외 hardcoded color를 없앤다.

공개 copy는 `browser-supported lesson은 Web에서 읽기·실행·strong check·진도 저장까지 완료`, `Local은 파일·패키지·스케줄·상주 자동화를 확장`이라는 두 문장을 함께 지킨다. 모든 레슨이 Web에서 된다고 과장하지 않고, 반대로 Web을 preview나 Local 다운로드 전 체험으로 축소하지 않는다. 현재 `postbuild.js`의 `no browser sandbox`, `no WebAssembly fallback`, `학습과 실행의 기준은 로컬 Python` 절대 문장은 migration 전용 negative fixture로 고정한다.

## 영향 파일

- 신규 `landing/src/components/publicShell.jsx`
- 신규 `landing/src/components/publicHeader.jsx`
- 신규 `landing/src/components/publicFooter.jsx`
- 신규 `landing/src/components/productMedia.jsx`
- 신규 `landing/src/styles/publicShell.css`
- `landing/src/App.jsx`
- `landing/src/main.jsx`
- `landing/src/pages/home.jsx`
- `landing/src/styles.css`
- `landing/src/styles/homeAstryx.css`
- `landing/src/lib/brand.js`
- `landing/src/lib/seo.js`
- `landing/scripts/prerenderReact.js`
- `landing/scripts/postbuild.js`
- `landing/src/lib/faq.js`
- `landing/vite.config.js`
- `docs/skills/ops/product/world-class-blueprint.md`
- `docs/skills/ops/product/service-candidate.md`
- `docs/skills/ops/product/dogfood-alpha.md`
- `docs/skills/ops/product/branding.md`
- `tests/surface/verifyLandingDocsBundleSplit.py`

## 영향 함수·심볼

- 신규 `PublicShell`, `PublicHeader`, `PublicFooter`, `ProductMedia`
- `App`, `resolveRoute`, `HomePage`, `HeroFrame`
- `renderShell`, `homeBody`, `resolveRouteImage`, `writeRoute`
- `buildSoftwareJsonLd`, `buildOrganizationJsonLd`
- `createRoot`에서 `hydrateRoot`로 SSR route hydration 변경

## 테스트

- 수정 `tests/surface/verifyLandingDocsBundleSplit.py`: primary CTA `/learn`, Run secondary action, actual media, docs lazy content, legacy download SEO 문구 교체
- 신규 `tests/surface/verifyLandingExperiencePlaywright.py`: 390, 768, 1440, 1680 viewport, hero next-section hint, image load, nav, light/dark
- 신규 `tests/surface/verifyLandingSeo.py`: canonical, OG, structured data, sitemap
- 신규 `tests/surface/verifyPublicProductClaims.py`: rendered page, `llms.txt`, `llms-full.txt`, search index, FAQ, 공개 docs의 Web-complete·Local-extension 계약과 local-only 금지 문구
- 신규 `tests/surface/verifyLandingHydration.py`: SSR/client markup mismatch, duplicate render, CLS budget
- 신규 `tests/product/verifyFirstLearningJourneyAnalytics.py`: landing view, path select, lesson open, first edit, first run, first strong check event schema와 3분 funnel
- 수정 `tests/surface/verifyFrontendPerformanceBudget.py`: landing entry와 hero media budget 분리
- 실행: `uv run python -X utf8 tests/run.py gate landing-build`
- 실행: `uv run python -X utf8 tests/run.py gate docs`

## 롤백

- public shell 분리, homepage 교체, docs migration을 독립 커밋으로 나눈다.
- 기존 route와 canonical URL은 유지한다.
- 새 hero image가 로드되지 않아도 H1과 CTA가 보이도록 intrinsic size와 background fallback을 둔다.
- prerender가 깨지면 client-only로 숨기지 않고 해당 route migration commit을 되돌린다.

## 평가

### 개발자 관점

- `App.jsx`와 2,427줄 전역 CSS를 먼저 route boundary로 나눠야 이후 변경이 다른 문서 surface를 오염시키지 않는다.
- 실제 이미지와 SSR metadata를 함께 관리해 JS 실패에서도 제품 설명과 CTA가 남아야 한다.

### PM 관점

- 방문자는 다운로드 전에 Codaro가 무엇이며 지금 웹에서 무엇을 할 수 있는지 이해해야 한다.
- 첫 화면의 성공 지표는 download click이 아니라 Run start, Learn path open, first lesson run이다.
