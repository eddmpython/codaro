# Learn Explorer

상태: 진행

## 목표

472개 레슨을 한 번에 나열하지 않고 이어하기, 여섯 결과 경로, 검색과 필터로 필요한 학습에 바로 진입한다.

## 범위

- 첫 화면에 compact heading, 이어하기, 검색 제공
- 결과 경로마다 완성 결과, Web과 Local 범위, 첫 레슨 표시
- 기본 DOM에는 추천 시작점만 렌더
- 검색과 필터 결과는 최대 30개까지 렌더
- 레슨 행에서 시간, 결과, runtime, 강한 검증 가능 여부 표시

## 종료 조건

- 초기 action count 80 이하
- 초기 lesson row 12개 이하
- 검색, runtime, path filter 접근성과 keyboard flow 통과
- 390x844 첫 화면에서 제목, 이어하기, 검색이 모두 보임
- 결과 경로와 레슨 링크가 canonical interactive lesson으로 연결됨

## 현재 증거

- 첫 화면을 이어하기, 검색, Web/Local 수량과 여섯 결과 경로 중심으로 다시 구성했다.
- 초기 추천 행은 3개, 검색 결과는 최대 30개로 제한하고 모든 진입 링크를 canonical interactive lesson으로 연결했다.
- Light/Dark Landing Learn desktop/mobile Chromium case와 `landing-public` 계약이 통과했다.
- Pages `main@3a18dd97`의 `/learn/` direct load에서 Web 310, Local 162, 전체 472와 이어하기, 검색, 결과 경로가 실제 배포물에 표시됨을 확인했다.
- 390x844 공개 화면에서 제목, 이어하기, 검색, 첫 결과 경로가 한 흐름에 보이고 horizontal overflow가 0임을 확인했다.

## 남은 조건

- 실제 검색 유입과 keyboard, screen reader, 한국어 IME 수동 검수
- 결과 경로별 사람 콘텐츠 검수

## 영향 파일

- `landing/src/pages/learn.jsx`: 이어하기, 검색, 여섯 결과 경로, 추천·검색 lesson row
- `landing/src/styles/learnExplorer.css`: public learning density와 desktop/mobile layout
- `landing/src/lib/curriculumLessons.js`, `landing/src/lib/generated/curriculum.js`: 472개 lesson과 runtime·outcome metadata
- `landing/src/lib/visualAssets.js`, `assets/brand/visuals/manifest.json`: 결과 경로별 instructional image resolution
- `landing/scripts/prerenderReact.js`: Learn route SSR, canonical link와 검색·sitemap 산출물 연결
- `tests/learning/verifyWebLearningRoutes.py`, `tests/surface/verifyLandingExperiencePlaywright.py`: route count와 공개 화면 증거

## 영향 함수·심볼

- `LearnPage`
- `pathDefinitions`, `guidedPaths`, `featuredLessons`
- `lessonHref`, `interactiveLessonHref`, `trackLabel`
- `resolveVisualAsset`
- `renderApplication`, `collectionJsonLd`, `writeRoute`

## 테스트

- `uv run python -X utf8 tests/learning/verifyWebLearningRoutes.py`: contract, generated, prerender, sitemap, search lesson 각 472개와 Web 310·Local 162 분류
- `uv run python -X utf8 tests/run.py gate landing-public`: 390x844·1440x900 Learn, 초기 lesson row 3개, image·overflow·link 감사
- `uv run python -X utf8 tests/run.py gate web-learning`: Learn에서 canonical lesson으로 이어지는 대표 Chromium 여정
- `uv run python -X utf8 tests/product/verifyAstryxJourneyAudit.py`: public Learn과 Web learning home의 공용 Astryx·금지 control 계약
- 실제 검색 유입, keyboard, screen reader, 한국어 IME와 경로별 사람 콘텐츠 품질은 이 machine evidence에 포함되지 않는다.

## 롤백

- Learn 정보 구조와 CSS를 함께 되돌려도 472개 canonical lesson URL과 생성 catalog는 유지한다.
- 검색·filter 실패 시 전체 472개를 초기 DOM에 다시 렌더하지 않고 추천 3개와 direct canonical link를 보존한다.
- visual asset이 실패해도 경로명, 결과 설명, runtime, 첫 lesson link가 읽히는 fallback을 유지한다.

## 평가

### 개발자 관점

- catalog identity와 UI filter를 분리하고 초기 3개, 검색 최대 30개로 DOM 비용을 제한했다.
- route·responsive Chromium 검증은 green이지만 keyboard, IME, screen reader 수동 검증은 남아 있다.

### PM 관점

- 설치 전에 목표와 결과를 고르고 canonical lesson으로 바로 진입할 수 있으며 Web·Local 범위를 숨기지 않는다.
- 여섯 결과 경로의 사람 콘텐츠 검수가 끝나지 않았으므로 상태는 `진행`이고 완료 또는 품질 점수 근거가 아니다.

완료 전에는 `_done`으로 이동하지 않는다.
