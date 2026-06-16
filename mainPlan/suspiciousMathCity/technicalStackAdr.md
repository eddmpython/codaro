# 기술 스택 ADR

## 1. 결정

`수상한 수학도시`는 정적 웹 기반의 조작형 수학 어드벤처로 만든다. 기술 선택은 화려한 엔진보다 장기 유지, 접근성, 콘텐츠 제작, 도서/워크북 파생 가능성을 우선한다.

채택 스택:

```text
React 19
Vite 7
TypeScript for math-city boundary
Semantic HTML controls
Inline SVG interaction
Scoped CSS
localStorage
GitHub Pages
Playwright visual/accessibility smoke
Registry validation
```

현재 `landing/`은 이미 React와 Vite 기반이다. 새 게임은 이 표면 안에 독립 route로 둔다.

```text
/codaro/math-city
```

## 2. 채택 이유

| 선택 | 이유 |
| --- | --- |
| React + Vite | 기존 `landing/` 스택과 맞고 GitHub Pages 배포가 단순하다 |
| TypeScript | registry와 에피소드 데이터를 장기 계약으로 고정한다 |
| SVG + HTML | 시계, 번호판, 케이크처럼 상태가 바뀌는 수학 오브젝트를 접근성 있게 조작할 수 있다 |
| CSS transition | 의미 있는 짧은 상태 변화에 충분하다 |
| localStorage | 개인정보 없이 브라우저 안 진행만 저장한다 |
| Playwright | 모바일, 큰 글자, 키보드, 모션 축소, 저장 실패를 실제 브라우저에서 검증한다 |

## 3. 비채택

| 기술 | 지금 쓰지 않는 이유 |
| --- | --- |
| Phaser | canvas 중심이라 텍스트, 키보드, 큰 글자, 보조 조작 비용이 크다 |
| Unity | 정적 Pages와 접근성, 에피소드 데이터 운영에 과하다 |
| Three.js | 3D가 핵심 학습 조작에 필요하지 않다 |
| 전역 상태 라이브러리 | reducer/context로 충분하고 저장 범위가 작다 |
| 서버 저장 | 개인정보 없음 원칙과 맞지 않는다 |
| service worker | stale cache와 route 문제를 먼저 피한다 |
| IndexedDB | 진행 데이터가 작다 |

Canvas는 후속에서 자유 그리기, 각도 측정, 많은 점을 다루는 조작처럼 이점이 분명한 경우에만 제한적으로 검토한다. 그때도 텍스트, 포커스, 정답 상태, 키보드 대체 조작은 DOM에 남긴다.

## 4. 구현 경계

게임 코드는 `landing/src/apps/suspiciousMathCity/`에 격리한다.

```text
landing/src/apps/suspiciousMathCity/
  MathCityApp.tsx
  data/
    registry.ts
    seasons/
    episodes/
    artifacts/
    abilities.ts
    clues.ts
    mapPlaces.ts
    sceneObjects.ts
    assets.ts
    motion.ts
    sessionPolicy.ts
  domain/
    progressSchema.ts
    progressStore.ts
    progressMigrations.ts
    questEngine.ts
    mathTasks.ts
    mapState.ts
    registryValidation.ts
  components/
  styles/
    mathCity.css
```

기존 `landing/src/App.jsx`는 route와 lazy import만 안다. 게임 내부 상태와 에피소드 구조를 알면 안 된다.

## 5. 데이터 계약

콘텐츠 source는 React 컴포넌트가 아니라 registry다.

```ts
export const mathCityRegistry = {
  registryVersion: 1,
  schemaVersion: 1,
  contentVersion: "core-001",
  assetsVersion: "core-assets-001",
  routePath: "/math-city",
  storageKey: "suspiciousMathCity.progress.v1",
  seasonsById,
  episodeOrder,
  episodesById,
  abilitiesById,
  cluesById,
  mapPlacesById,
  sceneObjectsById,
  artifactsById,
  assetsById,
  motionsById,
  revisitHooksById,
  formatAdaptersById,
  deprecatedIds,
  replacementIds,
  sessionPolicy,
} satisfies MathCityRegistry;
```

원칙:

- JSX 안에 문제 문장과 정답을 직접 박지 않는다.
- 공개된 id는 rename하지 않는다.
- `contentVersion` 변경은 저장 초기화 사유가 아니다.
- 도서, 워크북, 활동지 파생도 같은 registry에서 나온다.

## 6. 상태 관리

| 상태 | 위치 | 저장 여부 |
| --- | --- | --- |
| 에피소드 진행 beat | React reducer | 저장하지 않음 |
| 드래그 중인 타일 | React state | 저장하지 않음 |
| 힌트 열린 상태 | React state | 저장하지 않음 |
| 완료 에피소드 id | localStorage | 저장 |
| 획득 능력 id | localStorage | 저장 |
| 발견 단서 id | localStorage | 저장 |
| 복구 세계 상태 id | localStorage | 저장 |
| 설정 | localStorage | 저장 |

`progressStore`만 `localStorage`를 직접 만진다.

## 7. 렌더링 원칙

| 화면 | 방식 |
| --- | --- |
| 도시 지도 | SVG viewBox + HTML button overlay 또는 SVG button group |
| 시계탑 | inline SVG 상태 오브젝트 |
| 버스 번호판 | HTML/SVG 혼합 |
| 케이크 조각 | SVG path + 선택 기반 대체 조작 |
| 단서장 | HTML button/card |
| 능력 도감 | HTML list + SVG icon |
| 하단 조작판 | semantic HTML controls |

지도 전체를 통 bitmap으로 만들지 않는다. 핵심 수학 오브젝트는 상태와 focus, 대체 조작을 가져야 한다.

## 8. Lazy Loading

초기 landing bundle에 게임 콘텐츠를 싣지 않는다.

원칙:

- `/math-city` 진입 때 game shell chunk를 로드한다.
- 시즌과 에피소드는 dynamic import한다.
- 큰 bitmap은 asset manifest 기반으로 필요한 장면에서만 preload한다.
- 도서/워크북 export용 데이터는 runtime route에 자동 포함하지 않는다.

## 9. 에셋 파이프라인

에셋 위치:

```text
landing/static/math-city/
```

분류:

| 분류 | 방식 | 위치 |
| --- | --- | --- |
| 상호작용 SVG | source component | `components/sceneObjects/` |
| 장소 아이콘 | optimized SVG | `static/math-city/icons/` |
| 캐릭터 표정 | 1x/2x bitmap 또는 SVG | `static/math-city/characters/` |
| 제로 쪽지 | HTML/CSS 또는 SVG | `static/math-city/clues/` |
| 소리 | 후속 | `static/math-city/audio/` |

runtime data에는 URL을 직접 넣지 않고 `assetId`만 넣는다.

## 10. 검증 Gate

초기 gate:

```text
landing-build
root-clean
docs
```

게임 전용 gate:

| gate | 검증 |
| --- | --- |
| `math-city-contract` | registry schema, id 참조, 금지 필드, asset manifest |
| `math-city-storage` | 깨진 저장값, migration, unknown id, deprecated id |
| `math-city-browser` | 직접 진입, 첫 플레이, 완료, reload, reset |
| `math-city-accessibility` | 키보드, 끌기 대체, 큰 글자, 모션 축소 |
| `math-city-visual` | 주요 뷰포트 스크린샷, blank, overflow, 겹침 |

뷰포트:

```text
360x740
390x844
414x896
768x1024
1280x800
```

## 11. 스택 승격 조건

다음 조건 전에는 스택을 키우지 않는다.

- 시계탑 Product Core Slice가 품질 gate를 통과한다.
- registry validator가 실제 콘텐츠 오류를 잡는다.
- 접근성 대체 조작이 실제 브라우저에서 통과한다.
- 에피소드 3개가 데이터 추가 중심으로 확장된다.

그 뒤에만 검토:

- 제한적 Canvas 미니 조작.
- service worker.
- 내부 에피소드 preview tool.
- 도서/워크북 export tool.

