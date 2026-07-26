# 04 Visual Accessibility Gates

상태: 진행

## 목표

빌드 성공과 주관적 인상을 분리하고, responsive, theme, motion, font, contrast, overflow를 재현 가능한 gate로 판정한다.

## 범위

- exact pin, source hash, generated freshness, font hash, layer order
- Home, Learn, Run, Local 대표 화면의 desktop/mobile
- light/dark/system, reduced motion, density, accent
- 320px horizontal overflow, focus-visible, keyboard overlay fallback
- 교육 카드의 제목·설명·코드·결과 가독성

## 구현 순서

1. 정적 `design-system-contract`를 먼저 고정한다.
2. `theme-runtime-browser`로 Landing·Learn·Run·Local의 공용 mode/density/accent/motion runtime을 고정한다.
3. Landing/Editor 전체 viewport fixture와 screenshot을 만든다.
4. font load, CSS feature tier, contrast와 reduced motion의 시각 결과를 검사한다.
5. 접근성 tree와 focus order를 확인한다.

## 영향 파일

- `tests/assets/testBuildDesignSystem.py`
- `tests/surface/verifyDesignSystemContract.py`
- `tests/surface/verifyThemeRuntimePlaywright.py`
- 후속 전체 visual/accessibility matrix verifier와 수동 AT evidence
- `tests/run.py`, testing gate 문서

## 영향 함수·심볼

- `verifyPackagePins`, `verifyGeneratedArtifacts`, `verifyRepresentativeSurfaces`
- 후속 visual matrix assertion과 browser tier fixture

## 테스트

- `uv run python -X utf8 tests/run.py gate design-system-contract`
- `uv run python -X utf8 tests/run.py gate theme-runtime-browser`
- `uv run python -X utf8 tests/run.py gate learning-card-browser`
- 후속 전체 Astryx visual/accessibility·browser-tier gate와 수동 AT matrix

## 롤백

gate 기준을 지우지 않는다. 일시적 예외는 owner, 만료 조건, 해당 surface를 명시한 allowlist만 허용한다.

## 평가

정적 gate와 공용 테마 런타임 8-case, 학습 browser gate는 구현됐다. `theme-runtime-browser`는 runtime SSOT만 증명하므로 전체 mobile/font/contrast/keyboard/screen-reader와 Firefox/WebKit/WebView2 matrix는 여전히 남아 있고 이 packet은 완료가 아니다.
