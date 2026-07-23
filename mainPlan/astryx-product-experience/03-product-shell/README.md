# 03 Product Shell

상태: 진행

## 작업 폴더

- [Astryx Proof Shell](00-astryx-proof-shell/)
- [Notebook Workbench](01-notebook-workbench/)

각 폴더는 자체 종료 조건과 증거를 가진다. 두 작업이 모두 검증되기 전에는 이 workstream을 `_done`으로 이동하지 않는다.

현재 공용 셸은 `RuntimeCapabilityRail`로 Web Run과 Local Studio capability를 같은 component tree에서 나눈다. 정적 Web은 `codaro-runtime-tier=web`, Local FastAPI SPA router는 `codaro-runtime-tier=local`을 주입하고 canonical lesson은 별도 `codaro-lesson-runtime-tier`로 browser와 Local 필요 범위를 설명한다. `RunRouteState@1` schema와 TypeScript adapter가 surface, path, lesson, section, document, task, runtime tier를 정규화하고 URL query, `history.state`, `popstate`, session storage를 연결한다. `/learn/lesson/<category>/<contentId>/`는 pathname에서 같은 `LessonRef`를 복원해 문서와 실행 학습실을 함께 소유하고 `/run/`은 자유 Notebook으로 분리됐다. `DEFAULT_SURFACE`와 1급 nav도 학습 우선으로 바뀌었다. route contract, `design-system-contract`, Light/Dark 대표 Chromium matrix는 green이지만 실제 배포 `/run/`, Local WebView2와 전체 keyboard/AT matrix가 남아 있어 상태는 `진행`이며 `_done`이 아니다.

## 목표

웹 Run과 Local이 하나의 Astryx AppShell, TopNav, SideNav, command/search, settings 구조를 사용하게 한다. 기존 React state, hooks, runtime, route 조립은 보존하고 지속 셸부터 점진적으로 옮긴다.

## 정보 구조

- 상위 제품 nav: Web은 `학습`, `노트북 beta`, `자동화 beta`, `대화 beta`, Local은 그 앞에 `홈`을 둔다. `공유`는 command나 deep link로 여는 hidden support surface이며 1급 nav로 올리지 않는다.
- global actions: 검색/명령, 환경 상태, 도움말, 설정
- 웹 Run: `웹 실행` 환경 badge와 브라우저 capability 표시
- Local: `로컬` 환경 badge, terminal/패키지/자동화 상태 표시
- 모바일 Web: 768px 미만에서 safe-area를 포함한 bottom navigation으로 visible surface를 직접 이동한다. 320px에서도 44px target과 label이 맞도록 Web 4개까지만 노출한다. Local desktop launcher는 실제 minimum `900x640`을 유지하며 모바일 지원을 주장하지 않는다.
- 현재 학습의 lesson tree와 자동화 task tree는 해당 surface의 secondary nav로 이동

`PRODUCT_SURFACE_NAV`가 surface enum, label, beta, sidebar visibility의 SSOT다. `DEFAULT_SURFACE`는 `curriculum`으로 바꾸고 `00-product-contract`의 `RunRouteState`가 URL과 history를 소유한다.

| surface | order | labelKey | flowRole | beta | visibility |
| --- | ---: | --- | --- | --- | --- |
| `home` | 0 | `surface.home` | `entry` | no | Local only |
| `curriculum` | 10 | `surface.learning` | `learning` | no | Web·Local |
| `editor` | 20 | `surface.notebook` | `notebook` | yes | Web·Local |
| `automation` | 30 | `surface.automation` | `secondLoop` | yes | Web·Local, Web는 `localRequired` capability |
| `chat` | 40 | `surface.chat` | `support` | yes | Web·Local |
| `share` | 90 | `surface.share` | `support` | no | hidden, deep link only |

`SurfaceMode`는 기존 union에 `home`을 추가하고 `ProductSurfaceFlowRole`은 현재 literal `entry | learning | notebook | secondLoop | support`를 그대로 유지한다. 표의 flowRole 값 외 새 문자열을 만들지 않는다.

Local launcher의 durable `RunRouteState.surface=home`은 `LocalHomeSurface`가 소유하고 resume action은 대상 surface를 `pushState`한다. back/forward는 home과 대상 surface를 복원한다. Web에서 `surface=home`을 받으면 새 history entry 없이 `curriculum`으로 canonicalize한다. `productFlowNav.tsx`의 chat-first marker와 별도 순서는 제거하고 이 matrix를 그대로 읽는다.

## Layout blueprint

### Run Learning

| viewport | pane과 폭 | scroll·sticky | focus와 overflow |
| --- | --- | --- | --- |
| `>=1440` | product rail 216px, lesson rail 272px, 본문 720~760px, TOC rail 48px | 본문만 primary scroll, top nav와 TOC sticky | route 복원은 section heading focus, teacher는 Astryx `Layer` 기반 420px side sheet |
| `768~1439` | product rail 64px, lesson rail은 push drawer, 본문 max 760px | 본문 scroll, compact top nav sticky | drawer close 후 trigger focus, 본문 수평 overflow 0 |
| `480~767` | compact top nav, single-column 본문, section selector | page scroll 하나, section selector sticky | 실행 결과가 CodeMirror 아래에 유지, drawer는 full-height |
| `<480` | 320px까지 single-column, icon command bar | page scroll 하나, safe-area padding | label wrap, 44px touch target, result/feedback live region 고정 |

Teacher는 기본 닫힘이다. 질문 action으로 열고 deterministic feedback, code, check result context만 전달한다. hover-only rail이나 겹치는 floating card를 만들지 않는다.

표의 compact top nav는 page title·environment·global command를 가진 context bar다. surface 전환은 위 정보 구조에서 확정한 bottom navigation만 소유하며 두 navigation에 같은 destination을 중복 배치하지 않는다.

### Run Notebook

| viewport | pane과 폭 | 축소 순서 |
| --- | --- | --- |
| `>=1440` | product rail 216px, document rail 260px, editor min 640px, optional inspector 320px | inspector, document rail, product rail 순으로 접음 |
| `768~1439` | product rail 64px, editor 중심, document와 inspector는 push drawer | 선택 cell과 output은 항상 같은 scroll context 유지 |
| `<768` | single editor column, document/variable/terminal은 sheet | side-by-side 금지, keyboard open 시 active cell이 가려지지 않음 |
| `<480` | compact cell toolbar와 stable 44px run/stop | toolbar label overflow 0, horizontal code scroll은 editor 내부만 허용 |

Local과 Web은 같은 token·component·state blueprint를 쓰되 지원 viewport는 다르다. Web은 320px까지, Local WebView2는 900x640 이상을 실제 제품 matrix로 검증한다. `/m/chat`은 별도 디자인 tree로 유지하지 않고 compact `ProductShell`의 `chat` route alias로 이관한다.

## 구현 순서

1. `surfaceModel.ts`의 nav/beta/default contract와 `RunRouteState` adapter를 먼저 고정한다.
2. `App.tsx`의 state와 callbacks를 `ProductShell` props/view model로 정리한다.
3. root를 Astryx `AppShell`로 바꾸고 persistent frame만 교체한다.
4. `ProductSidebar`의 product nav를 Astryx `SideNav`로 교체하고 lesson/task tree는 secondary panel로 분리한다.
5. `TopControls`를 `TopNav` actions로 이동한다.
6. command palette에서 surface, lesson, 최근 파일, automation task를 검색한다.
7. `/m/chat`을 compact shell route alias로 이관한다.
8. mobile navigation, keyboard focus return, collapsed sidebar를 검증한다.
9. surface별 shadcn primitive는 각 후속 workstream에서 제거한다.

## 경계

- `MainSurface`의 lazy route 경계와 surface state는 유지한다.
- `useNotebookRuntimeState`, `useAutomationState`, provider hooks를 재작성하지 않는다.
- 웹과 로컬을 별도 component tree로 fork하지 않는다.
- Astryx wrapper 안에 기존 shadcn Sidebar를 장기 중첩하지 않는다. shell 작업에서 primitive를 실제 교체한다.

## 영향 파일

- 신규 `editor/src/components/app/productShell.tsx`
- 신규 `editor/src/components/app/productTopNav.tsx`
- 신규 `editor/src/components/app/productSideNav.tsx`
- 신규 `editor/src/components/app/productMobileNav.tsx`
- 신규 `editor/src/components/app/productCommandPalette.tsx`
- 신규 `editor/src/lib/productShellModel.ts`
- `editor/src/App.tsx`
- `editor/src/components/app/mainSurface.tsx`
- `editor/src/components/app/productSidebar.tsx`
- `editor/src/components/app/topBar.tsx`
- `editor/src/components/app/productFlowNav.tsx`
- `editor/src/components/app/providerReconnectBar.tsx`
- `editor/src/hooks/useSurfaceRoute.ts`
- `editor/src/lib/surfaceModel.ts`
- `editor/src/lib/localeCopy.ts`
- `editor/src/hooks/useProductSurfaceSelection.ts`
- `editor/src/routes/mobileChat.tsx`
- `editor/src/lib/assistantArtifactRouting.ts`
- `editor/src/lib/pendingChanges.ts`
- `editor/src/hooks/useThemeMode.ts`
- `editor/src/hooks/useAccentColor.ts`
- `docs/skills/architecture/frontend-product-surface.md`

## 영향 함수·심볼

- 신규 `ProductShell`, `ProductTopNav`, `ProductSideNav`, `ProductMobileNav`, `ProductCommandPalette`
- 신규 `buildProductShellModel`, `productCommandItems`
- 신규 `useRunRoute`와 기존 `useSurfaceRoute` migration adapter
- `App`
- `MainSurface`
- `ProductSidebar`
- `TopControls`
- `surfaceForAssistantArtifacts`, `surfaceForAcceptedPendingTarget`
- `PRODUCT_SURFACE_NAV`, `DEFAULT_SURFACE`, `isHiddenSurface`

## 테스트

- 구현 `tests/contracts/testRunRouteStateContract.py`: schema와 generated mirror, Web/Local canonicalization
- 구현 `tests/surface/verifyRunRouteStatePlaywright.py`: public lesson handoff, push/replace, back/forward, session restore
- 수정 `tests/surface/testProductSurfaceContract.py`: route와 pending target 보존
- 신규 `tests/surface/testProductShellContract.py`: nav order, beta, hidden share, learning default, environment badge, command source
- 신규 `tests/surface/verifyProductShellPlaywright.py`: blueprint pane width, collapsed/expanded/mobile, keyboard nav, focus return, light/dark/system
- 신규 `tests/surface/verifyRunRouteHistoryPlaywright.py`: surface/lesson/document/task push, section replace, back/forward와 `/m/chat` alias
- 수정 `tests/surface/verifyMobileLayout.py`: 신규 shell responsive coverage
- 수정 `tests/surface/verifyPlaywrightMobile.py`: 360, 375, 393px에서 핵심 nav와 입력 가능
- 실행: `uv run python -X utf8 tests/run.py gate app-runtime`
- 실행: `uv run python -X utf8 tests/run.py gate mobile-layout`

## 롤백

- state extraction과 visual shell replacement를 다른 커밋으로 나눈다.
- `MainSurface` public props는 shell migration 중 바꾸지 않는다.
- 새 command palette가 불안정하면 palette만 제거할 수 있게 navigation state와 분리한다.
- hash route migration은 legacy hash reader를 한 compatibility release 유지하되 새 navigation은 `RunRouteState`만 쓴다.

## 평가

### 개발자 관점

- 공식 Astryx 권장 순서인 persistent frame 우선 migration과 맞는다.
- 한 번에 모든 Tailwind class를 지우지 않아 runtime regression과 visual regression을 분리할 수 있다.

### PM 관점

- 웹과 로컬을 오갈 때 학습 위치와 메뉴 언어가 바뀌지 않아야 한다.
- Local의 강한 capability는 같은 제품의 확장으로 보여야 하며 다른 앱을 새로 배우는 느낌을 주면 실패다.
