# Proof Studio Landing

상태: 진행

## 목표

Codaro 첫 화면에서 실제 코드 수정, 출력, 검증이 선명하게 보이고 Web 학습과 Local 자동화의 관계를 한 제품으로 이해하게 한다.

## 범위

- H1은 `Codaro` 한 번만 사용
- primary는 첫 canonical interactive lesson
- secondary는 결과 경로 탐색
- Local 다운로드는 확장 맥락의 tertiary action
- 실제 code, output, strong check 제품 장면을 hero에 표시
- 학습 루프, 결과 경로, Web과 Local 경계, trust만 남기고 반복 소개 제거
- product capture와 학습 이미지의 Light와 Dark 대응

## 종료 조건

- 1440x900과 390x844 첫 viewport에서 제품명, 코드, 출력, 검증, primary action 확인
- 다음 section의 시작이 첫 viewport에 보임
- dark-only media island, 과도한 암막, 사선 crop 0개
- Landing, Learn, Lesson, Run의 public navigation 어휘 일치
- 실제 Pages 배포 screenshot과 accessibility audit 통과

## 현재 증거

- Home을 실제 code, output, verification이 주인공인 Proof Studio hero와 학습 loop, 결과 경로, Web/Local 경계로 재구성했다.
- 1440x900과 390x844 Light/Dark Chromium screenshot에서 다음 band 노출, image load, overflow와 control overlap 0을 확인했다.
- `landing-public`, hydration, SEO, public claim과 `astryx-journey` machine gate가 통과했다.
- Pages workflow `29988292985`가 `main@3a18dd97`을 성공 배포했고 공개 Home과 primary canonical lesson direct link를 실제 브라우저에서 확인했다.
- 공개 Home을 desktop Light/Dark와 390x844 Light에서 촬영해 제품명, code, output, verification, primary action, 다음 product media가 첫 viewport에 보이고 horizontal overflow가 0임을 확인했다.

## 남은 조건

- keyboard, screen reader, forced-colors 수동 접근성 검수와 사람 브랜드 검수

## 영향 파일

- `landing/src/pages/home.jsx`: Proof Studio hero, proof loop, outcome story와 Web·Local 경계
- `landing/src/styles/homeAstryx.css`: desktop/mobile, Light/Dark hero와 full-width band layout
- `landing/src/components/publicShell.jsx`, `landing/src/styles/publicShell.css`: 공용 public navigation과 theme control
- `landing/src/components/productVisual.jsx`, `landing/src/lib/visualAssets.js`: 실제 제품 capture의 responsive source resolution
- `assets/brand/visuals/manifest.json`, `assets/brand/visuals/product/`: Web lesson·Run과 Local Notebook·Automation source image
- `landing/scripts/prerenderReact.js`: Home SSR, canonical, OG image와 structured data
- `tests/surface/verifyLandingExperiencePlaywright.py`, `tests/surface/verifyPublicProductClaims.py`, `tests/surface/verifyLandingHydration.py`: 공개 제품 경험 계약

## 영향 함수·심볼

- `HomePage`
- `proofSteps`, `outcomeStories`, `firstLessonHref`
- `Header`, `Footer`, `ProductVisual`
- `resolveVisualAsset`
- `renderApplication`, `renderShell`, `resolveRouteImage`, `organizationRef`

## 테스트

- `uv run python -X utf8 tests/run.py gate landing-public`: Home mobile·desktop, Learn, canonical lesson의 image, link, overlap, overflow, hydration, SEO, 공개 claim
- `uv run python -X utf8 tests/product/verifyAstryxJourneyAudit.py`: Landing에서 Web lesson·Run과 Local surface로 이어지는 Astryx 대표 여정
- `uv run python -X utf8 tests/run.py gate visual-assets`: manifest, checksum, provenance, responsive AVIF/WebP variant
- `uv run python -X utf8 tests/run.py gate frontend-performance-budget`: public entry와 product media 예산
- 대표 Chromium case는 통과했지만 keyboard, screen reader, forced-colors와 사람 브랜드 검수는 별도 조건이다.

## 롤백

- Home composition과 `homeAstryx.css`를 같은 변경 단위로 되돌리되 `/learn/`과 canonical lesson URL은 유지한다.
- product image가 실패해도 `Codaro` H1, 실제 Web 학습 primary action, code·output·verification 텍스트가 남는 fallback을 유지한다.
- public shell과 Home 본문을 독립적으로 되돌릴 수 있게 하고 theme preference와 navigation state를 삭제하지 않는다.
- generated visual variant만 수동 수정하지 않고 source image, manifest, generator 결과를 함께 되돌린다.

## 평가

### 개발자 관점

- SSR과 실제 product media를 유지한 채 route 전용 CSS로 Home 변경 범위를 제한했고 대표 responsive·hydration gate는 green이다.
- manual AT·forced-colors와 실제 사용자 환경의 brand review가 없어 release 완료를 주장할 수 없다.

### PM 관점

- 첫 viewport에서 제품명과 코드, 출력, 검증, Web 학습 primary action이 보이고 Local은 확장 capability로 설명된다.
- 공개 배포 확인은 대표 surface 증거일 뿐 사람 브랜드·접근성 승인이 아니므로 상태는 `진행`이며 `_done`으로 이동하지 않는다.

완료 전에는 `_done`으로 이동하지 않는다.
