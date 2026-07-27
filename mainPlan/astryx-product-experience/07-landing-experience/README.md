# 07 Landing Experience

상태: 진행

## 목표

공개 Landing이 Web 학습을 첫 행동으로 제시하고 Local 자동화를 같은 제품의 확장으로 설명하는지 실제 보조기술과 사람 브랜드 검수로 마무리한다.

## 작업 폴더

- [Proof Studio Landing](00-proof-studio-landing/)

## 남은 조건

- 공개 desktop과 mobile 화면의 keyboard, screen reader, forced-colors 검수를 끝낸다.
- Landing, Learn, Lesson, Run의 공용 navigation 어휘와 제품 정체성을 사람 브랜드 검수한다.
- 검수에서 발견한 접근성, 우선순위, media 또는 반응형 결함을 공용 source에서 수정한다.
- leaf TODO가 삭제되면 이 workstream과 상위 작업 지도 링크를 삭제한다.

## 구현 순서

1. Proof Studio Landing의 접근성과 브랜드 일관성을 사람 검수한다.
2. 발견한 결함을 public shell, Home 또는 공용 visual owner에서 수정한다.
3. 공개 route, hydration, media와 responsive 회귀를 검증한다.
4. leaf 종료 조건을 충족하면 leaf와 parent TODO를 함께 삭제한다.

## 영향 파일

- `landing/src/pages/home.jsx`
- `landing/src/components/publicShell.jsx`
- `landing/src/styles/homeAstryx.css`
- `landing/src/styles/publicShell.css`
- `landing/src/components/productVisual.jsx`
- `assets/brand/visuals/`
- `tests/surface/verifyLandingExperiencePlaywright.py`

## 영향 함수·심볼

- `HomePage`
- `Header`
- `Footer`
- `ProductVisual`
- `resolveVisualAsset`

## 테스트

- `uv run python -X utf8 tests/run.py gate landing-public`
- `uv run python -X utf8 tests/run.py gate visual-accessibility-browser`
- `uv run python -X utf8 tests/run.py gate visual-assets`
- keyboard, screen reader, forced-colors와 사람 브랜드 검수

## 롤백

- public shell과 Home 변경은 route, theme preference와 canonical lesson link를 보존한 채 독립적으로 되돌린다.
- 자산은 source, manifest와 generated variant를 같은 변경 단위로 되돌린다.

## 평가

### 개발자 관점

- 공개 route의 자동 검증과 실제 보조기술 검수 결과를 분리해 기록한다.

### PM 관점

- 사람 검수에서 Web 학습과 Local 확장의 관계가 불명확하면 이 workstream을 삭제하지 않는다.
