# 04 Visual Accessibility Gates

상태: 진행

## 목표

빌드 성공과 주관적 인상을 분리하고, responsive, theme, motion, font, contrast, overflow를 재현 가능한 gate로 판정한다.

## 범위

- exact pin, source hash, generated freshness, font hash, layer order
- Home, Learn, Web Run·학습, Local Run 대표 화면의 desktop/mobile
- light/dark, reduced motion, forced colors, density
- 320·390·900·1440px horizontal overflow, focus-visible, keyboard overlay
- 공용 우상단 테마·SNS 순서와 후원 dialog focus trap·return
- font load, token·후원 dialog contrast, 이름·alt·ARIA 참조 무결성

## 구현 순서

1. 정적 `design-system-contract`를 먼저 고정한다.
2. `theme-runtime-browser`로 Landing·Learn·Run·Local의 공용 mode/density/accent/motion runtime을 고정한다.
3. locked Playwright의 Chromium·Firefox·WebKit 대표 viewport fixture와 screenshot을 만든다.
4. font load, contrast, reduced motion, forced colors의 실제 계산 결과를 검사한다.
5. 공용 우상단 control의 keyboard 접근과 후원 dialog의 focus 순환·Escape·trigger return을 확인한다.

## 영향 파일

- `tests/assets/testBuildDesignSystem.py`
- `tests/surface/verifyDesignSystemContract.py`
- `tests/surface/verifyThemeRuntimePlaywright.py`
- `tests/surface/verifyVisualAccessibilityPlaywright.py`
- `tests/surface/testVisualAccessibilityBrowser.py`
- `assets/brand/tools/buildDesignSystem.py`와 Landing·Editor generated mirror
- `tests/run.py`, testing gate 문서

## 영향 함수·심볼

- `verifyPackagePins`, `verifyGeneratedArtifacts`, `verifyRepresentativeSurfaces`
- `runBrowserAudit`, `auditCase`, `validateSnapshot`, `validateKeyboard`
- `SupportDialog`, `renderSharedComponentCss`

## 테스트

- `uv run python -X utf8 tests/run.py gate design-system-contract`
- `uv run python -X utf8 tests/run.py gate theme-runtime-browser`
- `uv run python -X utf8 tests/run.py gate visual-accessibility-browser`
- `uv run python -X utf8 tests/run.py gate learning-card-browser`
- `uv run python -X utf8 tests/run.py gate product-experience-browser`

## 롤백

gate 기준을 지우지 않는다. 일시적 예외는 owner, 만료 조건, 해당 surface를 명시한 allowlist만 허용한다.

## 평가

정적 디자인 계약과 공용 테마 런타임 8-case에 더해 `visual-accessibility-browser`가 구현됐다. locked Playwright 1.61.0의 Chromium 149.0.7827.55, Firefox 151.0, WebKit 26.5에서 Landing·Learn·Web Run·Web 학습·Local Run 12/12를 통과했다. 320·390·900·1440px의 가로 overflow는 0이고 핵심 token contrast 최저는 5.66:1, 후원 dialog text contrast 최저는 6.6:1이다. 우상단 순서는 `github → support → youtube → threads`이며 테마 토글이 함께 보이고, 후원 dialog는 정확한 계좌번호, 첫 포커스, 양방향 focus wrap, Escape 닫기와 trigger 복귀를 통과했다.

후원 dialog는 `document.body` portal이므로 application chunk가 CSS layer 순서를 먼저 확정해 reset이 여백을 무너뜨릴 수 있었다. 공용 생성기의 dialog layout을 cascade layer 밖의 SSOT로 고정해 Landing과 Editor가 같은 22px body padding을 실제 계산값으로 사용하게 했다. 실제 Windows WebView2, NVDA·Narrator·VoiceOver·TalkBack, IME·OS zoom과 독립 사람 검수는 이 machine packet의 통과로 주장하지 않으며 10 Quality Release의 수동 evidence 범위로 남긴다. clean implementation commit, completion evidence와 정식 transition 전까지 상태는 `진행`이다.
