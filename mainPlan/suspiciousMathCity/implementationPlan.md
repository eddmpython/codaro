# 구현 계획

## 1. 구현 위치

`수상한 수학도시`는 Codaro 제품 본체가 아니라 공개 정적 웹 표면에 둔다.

예상 구조:

```text
landing/
  src/
    apps/
      suspiciousMathCity/
        MathCityApp.jsx
        data/
          registry.js
          seasons/
            season01.js
          episodes/
            clocktower01.js
            numberBus02.js
            bakery03.js
          artifacts/
            abilityCards.js
            clueCards.js
            repairRecords.js
            revisitHooks.js
          abilities.js
          clues.js
          mapPlaces.js
          sceneObjects.js
          assets.js
          motion.js
          sessionPolicy.js
        domain/
          progressSchema.js
          progressStore.js
          progressMigrations.js
          questEngine.js
          mathTasks.js
          mapState.js
          registryValidation.js
        components/
          ...
        mathCity.css
    App.jsx
    styles.css
  static/
    math-city/
      ...
```

라우트:

```text
/math-city
```

배포 URL:

```text
https://eddmpython.github.io/codaro/math-city
```

## 2. 아키텍처

브라우저 안에서 닫힌 구조로 만든다.

```text
data/registry.js
→ domain/questEngine.js
→ MathCityApp.jsx
→ domain/progressStore.js
→ localStorage
```

역할:

| 파일 | 책임 |
| --- | --- |
| `data/registry.js` | 에피소드, 능력, 단서, 지도, 오브젝트, 에셋, 모션을 묶는 정적 registry |
| `data/seasons/*.js` | 시즌 질문, 개념 범위, 장소 목록, finale 조건 |
| `data/episodes/*.js` | 에피소드별 World Math Beat 데이터 |
| `data/artifacts/*.js` | 능력 카드, 단서 카드, 복구 기록, 재방문 초대 |
| `data/abilities.js` | 개념 능력 정의 |
| `data/clues.js` | 단서 정의와 연결 관계 |
| `data/mapPlaces.js` | 지도 장소와 상태별 copy |
| `data/sceneObjects.js` | 장면 오브젝트와 상태 정의 |
| `data/assets.js` | asset id와 포맷 정의. URL 직접 저장 금지 |
| `data/motion.js` | motion id, trigger, duration, reduced motion 대체 |
| `data/sessionPolicy.js` | 세션 마무리와 과몰입 방지 정책 |
| `domain/mathTasks.js` | 숫자 범위가 있는 작은 문제 생성 |
| `domain/questEngine.js` | 현재 beat, 정답 판정, 다음 단계 계산 |
| `domain/progressSchema.js` | 저장 schema, 허용 id, 기본값 |
| `domain/progressStore.js` | 저장, 로드, 마이그레이션, 초기화 |
| `domain/progressMigrations.js` | schemaVersion별 순차 migration |
| `domain/mapState.js` | 진행 상태를 지도 장소 상태로 변환 |
| `domain/registryValidation.js` | id 참조, asset, 금지 필드, task type 검증 |
| `MathCityApp.jsx` | 화면 조립 |

`landing/src/App.jsx`는 route만 연결하고 게임 내부 상태를 알지 않는다.

정적 registry 원칙:

```js
export const mathCityRegistry = {
  registryVersion: 1,
  schemaVersion: 1,
  contentVersion: "mvp-001",
  assetsVersion: "mvp-assets-001",
  routePath: "/math-city",
  storageKey: "suspiciousMathCity.progress.v1",
  seasonsById,
  episodeOrder: ["clocktower-01", "number-bus-02", "bakery-03"],
  episodesById,
  abilitiesById,
  cluesById,
  mapPlacesById,
  sceneObjectsById,
  artifactsById,
  assetsById,
  motionsById,
  revisitHooksById,
  deprecatedIds,
  replacementIds,
  sessionPolicy,
};
```

`status`, `state`, `found`, `owned` 같은 사용자별 값은 registry에 넣지 않는다. 단서 발견 여부, 지도 상태, 열린 에피소드는 `progress`와 registry의 unlock rule에서 매번 계산한다.

Registry 검증 기준:

- 모든 id는 중복되지 않는다.
- 모든 참조 id는 registry 안에 존재한다.
- 공개된 id는 rename하지 않는다.
- 제거된 id는 `deprecatedIds`와 `replacementIds`로 처리한다.
- 구현되지 않은 task type은 콘텐츠에 넣지 않는다.
- 출석, 순위, 랜덤 보상, 광고 보상 필드는 registry에 없다.

## 3. 상태 모델

### 3.1 진행 상태

```js
const defaultProgress = {
  schemaVersion: 1,
  contentVersion: "mvp-001",
  completedEpisodeIds: [],
  ownedAbilityIds: [],
  restoredWorldStateIds: [],
  foundClueIds: [],
  completedRevisitHookIds: [],
  lastMapFocusPlaceId: "clocktower",
  settings: {
    sound: false,
    reducedMotion: false,
    largeText: false,
  },
};
```

### 3.2 에피소드 상태

에피소드 도중 상태는 메모리 상태로 둔다. 브라우저를 닫으면 에피소드 처음부터 다시 시작해도 된다.

```js
const sessionState = {
  episodeId: "clocktower-01",
  beatIndex: 0,
  taskAttempts: {},
  usedHints: {},
};
```

중간 저장을 하지 않는 이유:

- 구현이 단순하다.
- 개인정보 없는 저장 범위가 작다.
- 에피소드가 5-10분이라 처음부터 재시작해도 부담이 작다.

## 4. 저장 정책

`localStorage`를 1차로 쓴다.

장점:

- 단순하다.
- 정적 Pages에서 동작한다.
- 진행 상태 크기가 작다.

주의:

- 사용자가 브라우저 데이터를 지우면 사라진다.
- 시크릿 모드에서는 저장되지 않을 수 있다.
- 저장 실패 가능성을 처리해야 한다.

정책:

- 저장 실패 시 화면 상단에 짧게 알린다.
- 게임 진행 자체는 막지 않는다.
- `progressStore`만 `localStorage`를 직접 만진다.
- 저장 데이터는 `schemaVersion`으로 검증한다.

브라우저 저장 구분:

| 대상 | 방식 | MVP 여부 |
| --- | --- | --- |
| 진행 상태 | `localStorage` | 사용 |
| 설정 | `localStorage` | 사용 |
| 에피소드 데이터 | JavaScript bundle | 사용 |
| 이미지와 글꼴 | HTTP cache | 사용 |
| 오프라인 실행 cache | Cache API | 보류 |
| 대용량 저장 | IndexedDB | 보류 |

`localStorage`는 origin 단위 저장소다. GitHub Pages에서는 같은 `https://eddmpython.github.io` origin 아래 다른 Pages 앱도 같은 저장소를 쓸 수 있으므로 key prefix를 길게 쓰고, 이름/학년/자유입력/기기 식별자는 절대 저장하지 않는다.

저장 로드 시 처리:

- JSON parse 실패: 기본 상태.
- schemaVersion 불일치: 마이그레이션 또는 기본 상태.
- contentVersion 변경: 저장 초기화 금지. unknown id 제거와 replacement mapping으로 복구.
- 알 수 없는 episode, ability, clue id: 제거.
- deprecated id: replacement mapping 적용.
- 중복 id: 제거.
- 저장 실패: 화면 상단에 짧게 알리고 메모리 상태로 계속 진행.

저장하지 않는 것:

- 열린 에피소드 목록.
- 지도 상태 cache.
- 단서 `found` 상태 cache.
- 능력 `owned` 상태 cache.
- 현재 beat index, 드래그 위치, 선택 중인 답.
- 힌트 사용 이력, 오답 횟수, 클릭 로그.
- 점수, 랭킹, streak, 출석 기록.

service worker는 MVP에서 등록하지 않는다. 오프라인 실행보다 GitHub Pages route 안정성과 stale cache 회피가 먼저다. 후속 PWA 단계에서만 `/codaro/math-city` scope, versioned cache, HTML network-first 정책으로 추가한다.

Migration 구조:

```js
export const migrationsBySchemaVersion = {
  1: progress => progress,
};
```

순차 적용 규칙:

1. parse에 실패하면 기본 상태.
2. 낮은 `schemaVersion`은 한 단계씩 migration.
3. migration 도중 오류가 나면 기본 상태.
4. migration 뒤 `sanitizeProgress`로 unknown id, deprecated id, 중복 id를 정리.
5. 저장 실패는 화면 알림만 내고 플레이를 막지 않음.

## 5. 콘텐츠 데이터 예시

```js
export const episodes = [
  {
    episodeId: "clocktower-01",
    title: "시계탑이 멈춘 날",
    districtId: "clocktower",
    requiredConcepts: ["time-reading", "addition-basic"],
    abilityReward: "time-lens",
    worldChange: "clocktower-fixed",
    clueReward: "zero-is-missing",
    cliffhanger: {
      closedLoop: "시계탑은 다시 움직이고, 버스는 3시에 출발할 수 있게 됐다.",
      newQuestion: "그런데 밤이 되자 번호판에서 0만 사라졌다.",
      nextPlaceId: "number-bus-stop",
      nextEpisodeId: "number-bus-02",
      conceptForeshadow: "규칙",
      urgency: "none",
    },
    beats: [
      {
        type: "dialog",
        speaker: "nova",
        text: "시계탑이 2시 40분에서 멈췄어. 버스는 3시에 출발해야 해.",
      },
      {
        type: "storyChoice",
        question: "버스가 언제 출발해야 하는지 알려면 무엇을 봐야 할까?",
        choices: ["현재 시각과 출발 시각", "빵의 개수", "동물의 키", "가게 이름"],
        answer: "현재 시각과 출발 시각",
      },
      {
        type: "mathChoice",
        taskId: "clock-gap-01",
        sceneObject: "clockFace-and-busTimetable",
        brokenWorldRule: "현재 시각과 출발 시각 사이의 간격이 보이지 않는다",
        concept: "time-difference",
        abilityAction: "시간 렌즈로 두 시각 사이를 색 띠로 잇는다",
        playerOperation: "10분 조각 2개를 2시 40분과 3시 사이에 끌어 놓는다",
        visualModel: "2시 40분부터 3시까지 남은 칸 2개",
        mathModel: "2:40 + 20분 = 3:00",
        question: "2시 40분에서 3시까지는 몇 분 남았을까?",
        choices: ["10분", "20분", "30분", "40분"],
        answer: "20분",
        successWorldChange: "버스 출발등이 켜지고 시계탑 바늘이 다시 움직인다",
      },
    ],
  },
];
```

## 6. 문제 생성

MVP에서는 완전한 랜덤 생성보다 제한된 변형을 쓴다.

예:

```js
const timeGapTasks = [
  { now: "2:40", target: "3:00", answer: "20분" },
  { now: "1:30", target: "2:00", answer: "30분" },
  { now: "4:50", target: "5:00", answer: "10분" },
];
```

이유:

- 초등 대상이라 잘못된 난이도 상승을 막아야 한다.
- 각 문제의 장면 표현을 직접 검수할 수 있다.
- MVP에서는 품질이 다양성보다 중요하다.

나중에 `mathTasks.js`에서 범위 기반 생성으로 확장한다.

## 7. 화면 구성

### 7.1 지도 화면

컴포넌트:

- `MathCityShell`
- `CityMap`
- `EpisodeCard`
- `AbilityDrawer`
- `ClueJournal`
- `SettingsPanel`

### 7.2 에피소드 화면

컴포넌트:

- `EpisodeScene`
- `DialogPanel`
- `TaskCard`
- `ChoiceTask`
- `ArrangeTask`
- `HintPanel`
- `RewardReveal`

### 7.3 도감 화면

컴포넌트:

- `AbilityList`
- `AbilityDetail`

### 7.4 단서장 화면

컴포넌트:

- `ClueList`
- `ClueDetail`

## 8. 영향 파일

예상 변경 파일:

| 파일 | 변경 |
| --- | --- |
| `landing/src/App.jsx` | `/math-city` route 추가 |
| `landing/src/styles.css` | 게임 화면 스타일 추가 또는 import 연결 |
| `landing/src/apps/suspiciousMathCity/*` | 새 게임 구현 |
| `landing/static/math-city/*` | 게임 에셋 |
| `landing/static/manifest.webmanifest` | 필요 시 shortcut 추가. 독립 설치 UX는 후속 판단 |
| `landing/scripts/prerenderReact.js` | `/math-city` route prerender 추가 |
| `landing/scripts/postbuild.js` | sitemap 또는 정적 URL 목록에 `/math-city` 추가 |
| `tests/surface/verifyMathCityContract.py` | registry, 저장 금지 필드, id 참조 검증 |
| `tests/surface/verifyMathCityStorage.py` | migration, 깨진 저장값, unknown id 검증 |
| `tests/surface/verifyMathCityBrowser.py` | route, completion, reset, mobile overflow smoke |

## 9. 영향 함수·심볼

예상 신규 심볼:

| 심볼 | 책임 |
| --- | --- |
| `MathCityApp` | 게임 root |
| `loadProgress` | 브라우저 진행 로드 |
| `saveProgress` | 브라우저 진행 저장 |
| `resetProgress` | 진행 초기화 |
| `migrateProgress` | 버전 마이그레이션 |
| `sanitizeProgress` | registry에 없는 id와 중복 id 제거 |
| `validateRegistry` | registry id 참조, 금지 필드, asset, task type 검증 |
| `applyDeprecatedIdMap` | 공개 후 변경된 id를 replacement id로 변환 |
| `getEpisodeById` | 에피소드 조회 |
| `resolveMapPlaces` | 진행 상태를 지도 표시 상태로 변환 |
| `evaluateBeatAnswer` | 현재 미션 정답 판정 |
| `completeEpisode` | 보상, 단서, worldState 반영 |

## 10. 테스트

필수 확인:

```text
uv run python -X utf8 tests/run.py gate landing-build
uv run python -X utf8 tests/run.py gate root-clean
```

후속 gate:

```text
uv run python -X utf8 tests/run.py gate math-city-contract
uv run python -X utf8 tests/run.py gate math-city-storage
uv run python -X utf8 tests/run.py gate math-city-browser
uv run python -X utf8 tests/run.py gate math-city-accessibility
```

구현 후 브라우저 확인:

- `/math-city` 첫 진입이 빈 화면이 아닌지.
- `/codaro/math-city` 직접 진입이 200 HTML로 동작하는지.
- 모바일 폭에서 지도와 버튼 텍스트가 겹치지 않는지.
- 에피소드 1을 완료하면 시계탑 상태가 복구되는지.
- 새로고침 후 복구 상태가 유지되는지.
- 진행 초기화 후 첫 상태로 돌아가는지.
- `localStorage`를 막거나 지워도 앱이 깨지지 않는지.
- GitHub Pages base path `/codaro/` 아래 route가 맞게 동작하는지.
- 키보드만으로 지도 진입부터 에피소드 완료까지 가능한지.
- 끌기 과제를 끌지 않고도 완료할 수 있는지.
- `largeText`와 200% 확대에서 가로 스크롤이 생기지 않는지.
- `reducedMotion`에서 완료 연출이 플레이를 막지 않는지.
- 360px, 390px, 414px 폭에서 하단 시트와 버튼 텍스트가 겹치지 않는지.

권장 단위 테스트:

- `progressStore` 저장 데이터 검증.
- `migrateProgress` 깨진 데이터 처리.
- `progressMigrations` deprecated id mapping 처리.
- `validateRegistry` 중복 id, orphan asset, 금지 필드 처리.
- `questEngine` 정답 판정.
- `completeEpisode` 중복 완료 처리.
- `resolveMapPlaces` locked, available, restored 상태 변환.

## 11. 롤백

롤백은 단순해야 한다.

1. `landing/src/App.jsx`의 `/math-city` route 제거.
2. `landing/src/apps/suspiciousMathCity/` 제거.
3. `landing/static/math-city/` 제거.
4. manifest 또는 prerender route를 수정했다면 해당 항목 제거.
5. `landing-build`와 `root-clean` 재실행.

진행 데이터는 브라우저에만 있으므로 서버 데이터 롤백이 없다.

## 12. 평가

### 개발자 렌즈

좋은 설계:

- `App.jsx`는 route만 알고 게임 내부를 모른다.
- 저장소 접근은 `progressStore`로 격리된다.
- 에피소드 데이터와 화면 컴포넌트가 분리된다.
- 새 에피소드는 데이터 추가 중심으로 가능하다.
- GitHub Pages base path를 깨지 않는다.
- registry 검증이 콘텐츠 오류를 구현 전에 잡는다.
- storage migration이 contentVersion 변경과 schemaVersion 변경을 분리한다.

위험 신호:

- route root에 게임 상태가 퍼진다.
- 문제 데이터가 JSX 안에 섞인다.
- 진행 저장 실패가 앱 전체 오류로 이어진다.
- 시각 효과가 레이아웃을 밀어 텍스트가 겹친다.
- 랜덤 생성 때문에 문제 검수가 어려워진다.
- 끌기 조작만 있고 선택 기반 대체 조작이 없다.
- id rename으로 기존 브라우저 진행이 끊긴다.

### 제품 렌즈

좋은 결과:

- 아이가 첫 화면에서 바로 도시를 누르고 싶다.
- 문제 전에 상황 단서가 보인다.
- 개념 능력을 얻은 뒤 쓸 곳이 떠오른다.
- 성공 후 도시가 달라진다.
- 다음 이야기가 궁금하다.

나쁜 결과:

- 결국 객관식 문제집처럼 느껴진다.
- 보상이 별, 점수, 배지만 남는다.
- 스토리가 문제 앞뒤 장식에 그친다.
- 수학 개념이 실제 조작으로 연결되지 않는다.
- 에피소드 하나가 너무 길다.

## 13. 첫 구현 순서

1. `/math-city` route와 빈 shell.
2. prerender와 sitemap URL 추가.
3. 진행 저장 `progressStore`.
4. `registryValidation`과 기본 registry.
5. 정적 지도와 장소 상태.
6. 에피소드 1 데이터.
7. `World Math Beat` 기반 `storyChoice`, `mathChoice`, `dragArrange` task.
8. 끌기 대체 조작과 키보드 경로.
9. 에피소드 완료와 보상 반영.
10. 도감과 단서장.
11. 접근성 설정 `largeText`, `reducedMotion`.
12. 에피소드 2, 3 추가.
13. 모바일 검수.
14. 시각 디테일 보강.
