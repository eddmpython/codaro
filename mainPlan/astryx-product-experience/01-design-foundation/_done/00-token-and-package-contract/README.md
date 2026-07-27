# 00 Token And Package Contract

<!-- completion-record:v1 -->
> 완료일: 2026-07-26T16:00:54+00:00
> 구현 커밋: `38587105aa278a5aaf97773f8dd9870da820f375`
> 통과 게이트: design-system-contract
> 남은 위험: 실제 light/dark/system·viewport·보조기술 검수는 04-visual-accessibility-gates에서 계속 차단한다.; 이 전이는 token·package source 계약만 봉인하며 design foundation workstream 완료를 뜻하지 않는다.
> 증거: [`completion-evidence.yml`](completion-evidence.yml)

상태: 완료

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

`design-system-contract` 보고서는 current `gitHead`, source SHA-256, Astryx·StyleX exact pin과 양쪽 package lock, token/font provenance, generated mirror 결과를 기록한다. 이 packet의 완료 범위는 기계적으로 결정되는 source·package·생성 계약이다. light/dark/system 렌더, 실제 viewport와 사람 시각·접근성 검수는 [04 visual-accessibility-gates](../04-visual-accessibility-gates/)가 소유하며 이 packet의 선행 조건으로 중복 요구하지 않는다.

## 롤백

source와 generated mirror를 함께 되돌린다. generated 파일만 수동 수정하지 않는다.

## 평가

현재 source와 gate는 완료 조건을 충족한다. clean implementation commit의 current-head report, evidence commit과 completion transition을 남긴 뒤에만 `_done`으로 이동한다.
