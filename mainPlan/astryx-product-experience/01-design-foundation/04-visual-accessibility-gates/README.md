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
2. Landing/Editor 브라우저 fixture와 screenshot을 만든다.
3. font load, CSS feature tier, reduced motion을 검사한다.
4. 접근성 tree와 focus order를 확인한다.

## 영향 파일

- `tests/assets/testBuildDesignSystem.py`
- `tests/surface/verifyDesignSystemContract.py`
- 후속 `tests/surface/verifyAstryxFoundationPlaywright.py`
- `tests/run.py`, testing gate 문서

## 영향 함수·심볼

- `verifyPackagePins`, `verifyGeneratedArtifacts`, `verifyRepresentativeSurfaces`
- 후속 visual matrix assertion과 browser tier fixture

## 테스트

- `uv run python -X utf8 tests/run.py gate design-system-contract`
- `uv run python -X utf8 tests/run.py gate learning-card-browser`
- 후속 Astryx visual/accessibility browser gate

## 롤백

gate 기준을 지우지 않는다. 일시적 예외는 owner, 만료 조건, 해당 surface를 명시한 allowlist만 허용한다.

## 평가

정적 gate와 학습 browser gate는 통과했다. 전체 theme/mobile/font/accessibility matrix가 남아 완료가 아니다.
