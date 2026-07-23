# 00 Token And Package Contract

상태: 진행

## 목표

Astryx와 StyleX 버전을 정확히 고정하고, 두 앱이 공유하는 semantic token과 font source를 결정적으로 생성한다.

## 범위

- `@astryxdesign/core`, `theme-neutral`, `cli` `0.1.6`, StyleX `0.19.0`, tokenizer `3.4.0`
- `assets/brand/designSystem/tokens.json`, schema, font manifest, 여섯 woff2 source
- Astryx CLI output과 Landing/Editor mirror의 source hash
- radius 8px ceiling, plum/blue/teal accent, public/learning/studio density

## 구현 순서

1. package와 lock의 exact pin을 맞춘다.
2. token과 font manifest를 검증한다.
3. CLI theme, runtime CSS, type, font CSS를 atomic하게 생성한다.
4. `--check`가 source와 mirror drift를 차단하게 한다.

## 영향 파일

- `assets/brand/designSystem/`
- `assets/brand/tools/buildDesignSystem.py`
- `landing/src/styles/generated/`, `editor/src/styles/generated/`
- `landing/static/fonts/`, `editor/public/fonts/`
- 두 앱의 `package.json`, `package-lock.json`

## 영향 함수·심볼

- `validateTokenDocument`, `validateFontManifest`, `createExpectedOutputs`, `buildDesignSystem`
- `resolveDensity`, `normalizeAccentId`, `DesignRuntimeState`

## 테스트

- `tests/assets/testBuildDesignSystem.py`
- `assets/brand/tools/buildDesignSystem.py --check`
- `tests/surface/verifyDesignSystemContract.py`

## 롤백

source와 generated mirror를 함께 되돌린다. generated 파일만 수동 수정하지 않는다.

## 평가

현재 gate는 통과했다. completion commit과 evidence가 없어 아직 완료가 아니다.
