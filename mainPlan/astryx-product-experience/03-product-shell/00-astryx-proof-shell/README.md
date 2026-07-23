# Astryx Proof Shell

상태: 진행

## 목표

Landing, Learn, Web Run, Local Studio가 한 제품의 탐색, 상태, 밀도, 테마 문법을 사용한다.

## 범위

- Astryx semantic token만 제품 상태 색으로 사용
- Light와 Dark의 canvas, surface, text, focus, success 대응
- Web과 Local에서 같은 surface 이름과 capability 상태 사용
- desktop, tablet, mobile의 product navigation 규칙 통일
- backend health와 runtime 사실을 frontend capability projection 하나로 표시

## 종료 조건

- 미정의 semantic token 0개
- Light와 Dark 첫 paint 불일치 0개
- Web과 Local 상태 어휘 불일치 0개
- 1440x900, 900x640, 390x844에서 겹침과 가로 overflow 0개
- 관련 machine gate와 사람 화면 검수 증거가 같은 commit을 가리킴

## 현재 증거

- Landing, Learn, canonical Lesson, Web Run, Notebook, Local learning, Local Automation이 공용 Astryx semantic token과 Light/Dark theme contract를 사용한다.
- `design-system-contract`, Light/Dark `astryx-journey` 12개 Chromium case가 통과했다.
- 1440x900 Notebook command bar와 전역 도구의 충돌을 제거하고 overlap audit 0을 확인했다.
- `main@3a18dd97`을 Pages workflow `29988292985`로 배포했고, 공개 Home, Learn, canonical Lesson, Web Run을 desktop과 390x844에서 직접 확인했다.
- 공개 surface의 horizontal overflow는 0이며 Light와 Dark Home, Light Learn, Lesson, Run의 상태 어휘와 navigation이 같은 배포물에서 일치했다.

## 남은 조건

- 실제 Windows WebView2와 keyboard, screen reader, IME, forced-colors 수동 검수
- 배포 commit을 기준으로 한 Local 설치본의 동일 상태 증거

## 영향 파일

- `assets/brand/designSystem/tokens.json`, `assets/brand/designSystem/fontManifest.json`: Landing과 Editor가 공유하는 Astryx semantic token과 font source
- `assets/brand/tools/buildDesignSystem.py`: 두 frontend의 theme, token, font mirror 생성기
- `landing/src/styles/generated/`, `editor/src/styles/generated/`: 공용 디자인 source에서 생성되는 앱별 mirror
- `landing/src/components/codaroThemeProvider.jsx`, `editor/src/components/app/codaroThemeProvider.tsx`: Light, Dark, density 적용
- `landing/src/components/publicShell.jsx`, `landing/src/styles/publicShell.css`: 공개 navigation과 theme control
- `editor/src/App.tsx`, `editor/src/lib/codaroDesign.tsx`, `editor/src/lib/runRouteState.ts`: Web과 Local shell의 theme, density, runtime route projection
- `tests/surface/verifyDesignSystemContract.py`, `tests/surface/verifyProductExperiencePlaywright.py`, `tests/product/verifyAstryxJourneyAudit.py`: 공용 계약과 대표 화면 증거

## 영향 함수·심볼

- Landing과 Editor의 `CodaroThemeProvider`
- `Header`, `Footer`, `App`
- `runRouteRuntimeTier`, `runRouteStateFromLocation`, `normalizeRunRouteState`
- `resolveDensity`, `normalizeAccentId`, `DesignRuntimeState`
- Astryx generated theme의 `codaroTheme`, semantic color·surface·focus token

## 테스트

- `uv run python -X utf8 tests/run.py gate design-system-contract`: exact Astryx·StyleX version, token source hash, Landing/Editor mirror 일치
- `uv run python -X utf8 tests/product/verifyAstryxJourneyAudit.py`: Landing, Learn, Web Run, Local learning·automation surface와 금지 학습 control 감사
- `uv run python -X utf8 tests/run.py gate landing-public`: 공개 Light/Dark shell, image, navigation, overflow 대표 Chromium 검증
- `uv run python -X utf8 tests/run.py gate mobile-layout`: mobile와 minimum desktop layout 계약
- 위 machine 검증은 통과했지만 실제 WebView2, AT, IME, forced-colors 수동 matrix를 대신하지 않는다.

## 롤백

- `assets/brand/designSystem/` source와 두 generated mirror를 같은 변경 단위로 되돌리고 generated 파일만 수동 수정하지 않는다.
- route state와 runtime capability 값은 유지한 채 public shell 또는 editor visual layer를 독립적으로 되돌릴 수 있게 한다.
- theme rollback에서도 저장된 사용자 theme 값과 Web/Local surface 이름을 폐기하거나 재해석하지 않는다.

## 평가

### 개발자 관점

- 공용 source와 deterministic mirror가 연결됐고 `design-system-contract`가 green이므로 앱별 임의 색상과 font drift를 막는 기반은 있다.
- 실제 Windows WebView2와 수동 접근성 matrix가 없으므로 cross-runtime shell 완료 판정은 아직 할 수 없다.

### PM 관점

- 공개 Web과 Local이 같은 제품 어휘와 시각 계층을 사용한다는 대표 Chromium 증거는 있다.
- Local 설치본과 공개 배포를 같은 commit에서 비교한 사람 검수가 남아 있어 상태는 `진행`이며 완료 점수나 `_done` 전이 근거가 아니다.

완료 전에는 `_done`으로 이동하지 않는다.
