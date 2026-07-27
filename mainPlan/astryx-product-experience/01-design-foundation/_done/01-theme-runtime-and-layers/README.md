# 01 Theme Runtime And Layers

<!-- completion-record:v1 -->
> 완료일: 2026-07-26T16:56:43+00:00
> 구현 커밋: `9d87517bf2ebb8b7fc7cc85d73b06f717c2dc638`
> 통과 게이트: theme-runtime-browser
> 남은 위험: 전체 viewport·font·contrast·keyboard·screen-reader와 Firefox/WebKit/WebView2 검수는 04-visual-accessibility-gates에서 계속 차단한다.; 이 전이는 공용 theme runtime 계약만 봉인하며 Landing·Learning, Run·Local migration이나 design foundation workstream 완료를 뜻하지 않는다.
> 증거: [`completion-evidence.yml`](completion-evidence.yml)

상태: 완료

## 목표

Landing, Run, Local이 같은 `light | dark | system`, resolved theme, density, accent runtime과 CSS layer 순서를 사용한다.

## 범위

- 공용 storage key `codaro-theme`
- Landing 고정 plum, Run/Local 승인 accent plum/blue/teal
- surface 기반 `public | learningComfortable | studioDense`
- reduced motion과 root data attribute
- `reset, theme, base, astryx-base, astryx-theme, components, utilities`

## 구현 순서

1. 두 root에 `CodaroThemeProvider`를 mount한다.
2. theme와 accent의 중복 hook storage를 provider로 합친다.
3. surface 변경 시 density를 provider에 전달한다.
4. 초기 HTML과 hydration 후 root 상태를 일치시킨다.

## 영향 파일

- `landing/src/components/codaroThemeProvider.jsx`
- `editor/src/lib/codaroDesign.tsx`
- `landing/src/styles/layers.css`, `editor/src/styles/layers.css`
- `landing/src/main.jsx`, `editor/src/main.tsx`, `editor/index.html`
- `tests/surface/verifyThemeRuntimePlaywright.py`
- `tests/browserStaticServer.py`, `tests/run.py`, `.github/workflows/ci.yml`

## 영향 함수·심볼

- `CodaroThemeProvider`, `useCodaroTheme`, `useCodaroDesign`
- `useThemeMode`, `useAccentColor`, `resolveDensity`

## 테스트

- `tests/surface/verifyDesignSystemContract.py`
- `npm run build` in Landing and Editor
- `uv run python -X utf8 tests/run.py gate theme-runtime-browser`
- Chromium 8-case: Landing·Learn·Run·Local, 저장 light/dark, system live switch, toggle reload, public/learningComfortable/studioDense, plum/blue/teal, reduced motion

## 롤백

provider와 generated theme import를 한 단위로 되돌린다. legacy storage key를 병행해 다시 만들지 않는다.

## 평가

정적 계약에 더해 전용 Chromium 8-case runtime gate를 구현했고 working-tree 집중 실행은 8/8, failure 0이었다. 이 결과는 아직 clean implementation commit 기준의 completion evidence가 아니므로 상태와 폴더는 진행으로 유지한다. 전체 viewport·contrast·keyboard·screen-reader·Firefox/WebKit/WebView2 검수는 이 packet이 아니라 04가 계속 소유한다.
