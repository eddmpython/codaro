# 01 Theme Runtime And Layers

상태: 진행

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
- `editor/src/components/app/codaroThemeProvider.tsx`
- `landing/src/styles/layers.css`, `editor/src/styles/layers.css`
- `landing/src/main.jsx`, `editor/src/main.tsx`, `editor/index.html`

## 영향 함수·심볼

- `CodaroThemeProvider`, `useCodaroTheme`, `useCodaroDesign`
- `useThemeMode`, `useAccentColor`, `resolveDensity`

## 테스트

- `tests/surface/verifyDesignSystemContract.py`
- `npm run build` in Landing and Editor
- 후속: light/dark/system과 reduced motion browser matrix

## 롤백

provider와 generated theme import를 한 단위로 되돌린다. legacy storage key를 병행해 다시 만들지 않는다.

## 평가

정적 계약은 통과했다. 실제 브라우저 mode matrix가 남아 있어 완료가 아니다.
