# Proof Studio Landing

상태: 진행

## 목표

공개 첫 화면이 Codaro의 Web 학습과 Local 확장을 정확히 전달하는지 keyboard, screen reader, forced-colors와 사람 브랜드 검수로 확인한 뒤 이 TODO를 삭제한다.

## 남은 조건

- keyboard만으로 공용 navigation, primary 학습 action, 결과 경로와 Local 확장 action을 수행한다.
- screen reader에서 제품명, 가치 제안, 실제 코드·출력·검증, action 우선순위가 이해 가능한 순서로 전달되는지 검수한다.
- forced-colors에서 focus, 실제 제품 media, code·output·verification 구분이 유지되는지 검수한다.
- 사람 브랜드 검수에서 Landing, Learn, Lesson, Run이 같은 제품 어휘와 시각 체계로 인식되는지 확인한다.

## 구현 순서

1. desktop과 mobile 공개 화면을 keyboard, screen reader, forced-colors로 검수한다.
2. Landing, Learn, Lesson, Run의 공용 navigation과 브랜드 일관성을 사람 검수한다.
3. 발견한 결함을 공용 public shell 또는 Home owner에서 수정한다.
4. 관련 gate와 사람 검수를 다시 통과한 뒤 이 packet과 parent index 링크를 삭제한다.

## 영향 파일

- `landing/src/pages/home.jsx`
- `landing/src/styles/homeAstryx.css`
- `landing/src/components/publicShell.jsx`
- `landing/src/styles/publicShell.css`
- `landing/src/components/productVisual.jsx`
- `tests/surface/verifyLandingExperiencePlaywright.py`

## 영향 함수·심볼

- `HomePage`
- `Header`
- `Footer`
- `ProductVisual`

## 테스트

- `uv run python -X utf8 tests/run.py gate landing-public`
- `uv run python -X utf8 tests/run.py gate visual-accessibility-browser`
- `uv run python -X utf8 tests/run.py gate visual-assets`
- keyboard, screen reader, forced-colors와 사람 브랜드 검수

## 롤백

- 접근성 수정이 public route, theme preference 또는 primary action을 회귀시키면 해당 수정만 되돌리고 TODO를 유지한다.
- generated media만 수동 수정하지 않고 source, manifest와 variant를 같은 변경 단위로 다룬다.

## 평가

### 개발자 관점

- 자동 responsive·hydration 검사는 보조기술의 실제 읽기 순서와 forced-colors 식별 가능성을 대신하지 않는다.

### PM 관점

- 첫 방문자가 Web에서 무엇을 시작하고 Local이 무엇을 더하는지 이해하지 못하면 이 TODO를 삭제하지 않는다.
