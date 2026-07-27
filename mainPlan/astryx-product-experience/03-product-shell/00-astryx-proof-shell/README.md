# Astryx Proof Shell

상태: 진행

## 목표

Landing, Learn, Web Run, Local Studio의 공용 셸을 실제 Windows 입력 환경과 보조기술에서도 같은 제품으로 사용할 수 있는지 사람 기준으로 검수하고, 발견한 결함을 수정한 뒤 이 TODO를 삭제한다.

## 남은 조건

- Windows WebView2에서 keyboard, screen reader, 한국어 IME, forced-colors 조합을 수동 검수한다.
- Landing, Learn, Web Run, Local Studio의 탐색 이름, focus 순서, 상태 어휘가 같은지 사람 화면 검수한다.
- 1440×900, 900×640, 390×844에서 수동 검수 중 발견한 겹침, 가로 overflow, 첫 paint theme 불일치와 focus 유실을 수정한다.
- 수정 뒤 관련 machine gate와 같은 Windows 환경의 수동 검수를 다시 통과한다.

## 구현 순서

1. Windows WebView2에서 keyboard와 한국어 IME 흐름을 검수한다.
2. NVDA 또는 Narrator와 forced-colors에서 공용 control lane과 주요 navigation을 검수한다.
3. 발견한 결함을 공용 디자인 source 또는 공용 셸 owner에서 수정한다.
4. Web과 Local을 같은 source 상태로 다시 검수하고 이 packet과 parent index 링크를 삭제한다.

## 영향 파일

- `assets/brand/designSystem/`
- `landing/src/components/publicShell.jsx`
- `landing/src/styles/publicShell.css`
- `editor/src/components/app/productShell.tsx`
- `editor/src/components/app/productTopNav.tsx`
- `tests/surface/verifyProductExperiencePlaywright.py`
- `tests/product/verifyWebView2ProductSmoke.py`

## 영향 함수·심볼

- `CodaroThemeProvider`
- `Header`
- `ProductShell`
- `ProductTopNav`
- `SocialLinks`

## 테스트

- `uv run python -X utf8 tests/run.py gate design-system-contract`
- `uv run python -X utf8 tests/run.py gate visual-accessibility-browser`
- `uv run python -X utf8 tests/run.py gate product-browser-webview2-evergreen`
- Windows WebView2의 keyboard, screen reader, 한국어 IME, forced-colors 사람 검수

## 롤백

- 공용 token과 generated mirror는 같은 변경 단위로 되돌린다.
- 접근성 결함 수정이 기존 navigation이나 저장된 theme를 회귀시키면 해당 수정만 되돌리고 TODO는 유지한다.

## 평가

### 개발자 관점

- 자동 DOM·pixel 검사는 실제 발화 순서, 조합 입력과 forced-colors 식별 가능성을 대신하지 않는다.

### PM 관점

- 사람 검수에서 Web과 Local의 탐색·테마·상태 어휘가 달라 보이거나 핵심 action을 수행할 수 없으면 이 TODO를 삭제하지 않는다.
