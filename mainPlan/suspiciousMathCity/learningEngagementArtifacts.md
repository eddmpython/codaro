# 수학 학습 몰입 아티팩트

## 1. 목적

이 문서는 `수상한 수학도시`의 중독성을 실제 화면과 데이터로 남는 아티팩트로 설계한다. 여기서 중독성은 오래 붙잡아두는 장치가 아니라, 아이가 짧은 세션 뒤에도 `내가 고친 도시`, `새로 얻은 능력`, `아직 풀리지 않은 단서`를 기억하게 만드는 구조다.

핵심 원칙:

```text
보상으로 붙잡지 않는다.
수학 개념으로 세계를 다시 보게 한다.
```

금지:

- 출석 보상
- 랜덤 보상
- 순위 경쟁
- 광고 보상
- 빨간 알림 배지 남발
- 무한 반복 문제
- 실패 패널티

허용:

- 미완성 지도
- 복구 전후 기록
- 단서 연결
- 능력 재사용
- 짧은 재방문 미션
- 에피소드 후 회상 카드

## 2. 아티팩트 루프

아이의 재방문 동기는 아래 아티팩트가 서로 연결될 때 생긴다.

```text
이상현상 카드
→ 개념 능력 카드
→ 장면 조작판
→ 오개념 반응 카드
→ 복구 기록
→ 단서 카드
→ 단서 연결판
→ 재방문 초대
→ 오늘의 마무리 카드
```

각 아티팩트는 다음 중 하나의 역할만 맡는다.

| 역할 | 설명 |
| --- | --- |
| 관심 유발 | 이상한 장면과 구체 물건으로 시작한다 |
| 개념 조작 | 개념을 손으로 만지는 행동으로 바꾼다 |
| 오류 이해 | 틀린 이유를 세계 반응으로 보여준다 |
| 기억 고정 | 오늘 배운 개념을 짧은 문장과 장면으로 남긴다 |
| 재방문 | 새 능력으로 예전 장소를 다르게 보게 한다 |

아티팩트가 점수, 등급, 희귀도, 연속 보상으로 바뀌면 설계 실패다.

## 3. Artifact Registry

구현에서는 모든 몰입 장치를 registry로 관리한다.

```js
const artifactRegistry = {
  schemaVersion: 1,
  contentVersion: "core-001",
  routePath: "/math-city",
  storageKey: "suspiciousMathCity.progress.v1",
  anomalyCards: [],
  abilityCards: [],
  manipulationBoards: [],
  misconceptionCards: [],
  repairRecords: [],
  clueCards: [],
  clueLinks: [],
  revisitInvites: [],
  recapCards: [],
};
```

진행 저장에는 전체 내용을 저장하지 않는다. 브라우저에는 발견/완료 id만 저장한다.

```js
const progress = {
  schemaVersion: 1,
  contentVersion: "core-001",
  completedEpisodeIds: ["clocktower-01"],
  ownedAbilityIds: ["time-lens"],
  restoredWorldStateIds: ["clocktower-fixed"],
  foundClueIds: ["zero-placeholder-note"],
  openedClueLinkIds: ["zero-to-bus-number"],
  completedRevisitHookIds: [],
  lastMapFocusPlaceId: "number-bus-stop",
  settings: {
    sound: false,
    reducedMotion: false,
    largeText: false,
  },
};
```

저장하지 않고 계산하는 값:

- 열린 에피소드 목록.
- 지도 장소의 `locked`, `available`, `corrupted`, `restored`, `revisitable` 상태.
- 단서의 `found` 상태.
- 능력의 `owned` 상태.
- 현재 beat index, 드래그 위치, 선택 중인 답.
- 힌트 사용 이력과 오답 횟수.

이 값들은 registry와 id 목록에서 매번 파생한다.

저장하지 않는 것:

- 이름
- 학년
- 학교
- 자유입력 문장
- 행동 시각 로그
- 클릭 횟수
- 정답률
- 실패 횟수
- 기기 식별자

## 4. 아티팩트 카탈로그

### 4.1 이상현상 카드

역할: 첫 5초 안에 "왜 이래?"를 만든다.

포맷:

```js
const anomalyCard = {
  artifactId: "anomaly-clocktower-stuck",
  episodeId: "clocktower-01",
  placeId: "clocktower",
  visibleObject: "clockFace",
  symptomLine: "시계탑이 2시 40분에서 멈췄어.",
  contradiction: "버스는 3시에 출발해야 해.",
  childQuestion: "얼마나 기다려야 할까?",
  requiredObservation: ["clockFace", "busTimetable"],
};
```

화면:

- 지도에서 장소가 이상한 상태로 보인다.
- 에피소드 첫 장면에서 핵심 물건 2개가 같이 보인다.
- 문제 문장보다 장면이 먼저 나온다.

금지:

- "오늘의 문제"처럼 시작.
- 단원명 먼저 노출.
- 긴 튜토리얼.

### 4.1.1 도시 지도 조각

역할: 진행률 막대 대신 아이가 고친 세계를 보여준다.

포맷:

```js
const cityMapPiece = {
  artifactId: "map-piece-clocktower",
  placeId: "clocktower",
  svgGroupId: "placeClocktower",
  states: ["locked", "available", "corrupted", "restored", "revisitable"],
  corruptedSignals: ["멈춘 분침", "꺼진 정류장 불", "흐린 종"],
  restoredSignals: ["움직이는 분침", "켜진 정류장 불", "밝아진 종"],
  revisitSignal: "작은 종 표시가 반짝임",
};
```

구현 힌트:

- 지도는 `viewBox` 기반 SVG toy-city map으로 만든다.
- 장소는 독립 `g` 그룹과 `data-state`를 가진다.
- 지도 전체를 bitmap으로 만들지 않는다.
- `prefers-reduced-motion`에서는 움직임 대신 상태 컷만 바꾼다.

### 4.2 개념 능력 카드

역할: 개념을 도감 보상이 아니라 화면 조작 문법으로 만든다.

포맷:

```js
const abilityCard = {
  artifactId: "ability-time-lens",
  abilityId: "time-lens",
  conceptId: "time-difference",
  name: "시간 렌즈",
  actionVerb: "두 시각 사이를 본다",
  reveals: "현재 시각과 목표 시각 사이의 빈 칸",
  playerOperation: "10분 조각을 빈 칸에 놓기",
  visualModel: "색 띠로 연결된 시간 간격",
  memoryLine: "두 시각을 함께 보면 남은 시간을 알 수 있어.",
  reusableAt: ["clocktower", "number-bus-stop"],
  printVariant: {
    workbookAction: "10분 타일을 사이 칸에 놓기",
    storybookPrompt: "시계와 시간표를 함께 찾아봐.",
    teacherPrompt: "두 시각 사이에는 어떤 간격이 있을까?",
  },
};
```

화면:

- 앞면: 능력 이름, 아이콘, 한 줄 행동.
- 뒷면: 개념 이름, 쓰는 곳, 3초 재연.
- 잠긴 능력은 실루엣만 보여주고 수집률 압박은 하지 않는다.
- 카드 안에는 작은 미니 장면이 있어야 한다. 시간 렌즈는 두 시각 사이가 색 띠로 이어지는 1초 재연을 보여준다.

금지:

- 희귀도.
- 레벨.
- 별점.
- 연속 사용 보너스.

### 4.3 장면 조작판

역할: 수학을 손으로 움직이는 행동으로 만든다.

포맷:

```js
const manipulationBoard = {
  artifactId: "board-clock-gap",
  taskId: "clock-gap-01",
  sceneObjectIds: ["clockFace", "busTimetable", "timeGapTiles"],
  operationType: "placeTiles",
  manipulatives: [
    { id: "ten-min-1", label: "10분" },
    { id: "ten-min-2", label: "10분" }
  ],
  targetSlots: ["2:40-2:50", "2:50-3:00"],
  modelAfterSuccess: "2:40 + 20분 = 3:00",
};
```

화면:

- 장면 스테이지 아래에 조작판이 붙는다.
- 선택지는 보조이고, 핵심은 타일/선/조각을 움직이는 일이다.
- 성공하면 조작판의 모델이 장면 속 변화로 이어진다.

Core Slice 조작:

- 시간 조각 놓기.
- 버스 번호 타일 끌어놓기.
- 케이크 같은 조각 만들기.

모바일 조작판:

```text
[현재 목표 한 줄]
[능력 토글]
[드래그 타일 또는 조각]
[힌트]
```

구현 힌트:

- 모바일은 화면 하단 작업대로 둔다.
- 데스크톱은 장면 우측 패널로 둘 수 있다.
- 드래그는 pointer events 기반으로 시작하고 키보드 대체 선택도 제공한다.
- 오답은 `wrongNudge`처럼 짧게 되돌아가고, 장면에서 왜 안 맞는지 보여준다.

### 4.4 오개념 반응 카드

역할: 틀린 답을 벌점이 아니라 이해 가능한 세계 반응으로 바꾼다.

포맷:

```js
const misconceptionCard = {
  artifactId: "mis-clock-gap-hour",
  misconceptionId: "clock-gap-full-hour",
  conceptId: "time-difference",
  wrongIdea: "3시까지 60분이라고 생각함",
  triggerAnswers: ["60분", "1시간"],
  diagnosis: "현재 시각이 2시 40분이라는 단서를 놓침",
  worldResponse: "색 띠가 시계 한 바퀴를 넘으려다 멈춘다.",
  hint1Observation: "시계탑의 분침 위치를 다시 보게 함",
  hint2Concept: "두 시각 사이의 빈 칸을 세게 함",
  hint3Procedure: "10분 칸 2개를 놓게 함",
  recoveryAction: "10분 칸 두 개만 다시 놓기",
  transferCheck: "1시 30분에서 2시까지도 찾게 함",
};
```

화면:

- 오답 후 빨간 X보다 장면 반응을 먼저 보여준다.
- 힌트는 정답을 말하지 않고 다시 볼 물건을 알려준다.
- 같은 오개념이 반복되면 더 구체적인 시각 힌트를 보여준다.
- 오개념 카드는 [curriculumMatrix.md](curriculumMatrix.md)의 오개념 대응 레지스트리와 같은 필드를 쓴다.
- `wrongIdea`가 없는 단순 오답 처리는 핵심 미션에 쓰지 않는다.

금지:

- 실패 횟수 표시.
- 점수 차감.
- "틀렸어요" 단독 문구.

### 4.5 표상 사다리 카드

역할: 장면 조작이 수학 문장으로 바뀌는 과정을 남긴다.

포맷:

```js
const representationCard = {
  artifactId: "rep-clock-gap",
  episodeId: "clocktower-01",
  ladder: [
    { level: "scene", text: "시계는 2시 40분, 버스는 3시에 출발" },
    { level: "visual", text: "10분 칸 2개가 비어 있음" },
    { level: "math", text: "2:40 + 20분 = 3:00" },
    { level: "transfer", text: "다른 버스 시간표에도 같은 방법을 쓴다" }
  ],
};
```

화면:

- 에피소드 중에는 작게 접혀 있다.
- 완료 화면에서 오늘 배운 방식으로 보여준다.
- 단어보다 그림과 짧은 문장을 우선한다.
- 다음 에피소드 시작 전에는 1문항 회상으로 다시 연다.

회상 예:

```text
지난번 시간 렌즈로 무엇을 봤지?
[두 시각 사이] [케이크 조각 수] [버스 색깔]
```

정답을 맞혀도 점수를 주지 않는다. 맞으면 다음 장면 단서가 선명해진다.

### 4.6 복구 기록

역할: 지도에서 "내가 바꾼 세계"를 남긴다.

포맷:

```js
const repairRecord = {
  artifactId: "repair-clocktower",
  placeId: "clocktower",
  episodeId: "clocktower-01",
  before: ["시계가 2시 40분에서 멈춤", "버스 정류장 불이 꺼짐"],
  repairAction: "시간 렌즈로 남은 시간을 찾음",
  after: ["시계 바늘이 움직임", "버스가 3시에 출발"],
  replayMotionId: "clockRestore",
};
```

화면:

- 완료 후 지도에서 장소를 다시 누르면 전후 비교를 볼 수 있다.
- 진행률 숫자보다 장소의 변화가 우선이다.
- 재방문 가능 상태가 되면 작은 새 단서만 표시한다.

### 4.7 단서 카드

역할: 이야기를 수학 개념으로 다시 읽게 만든다.

포맷:

```js
const clueCard = {
  artifactId: "clue-zero-placeholder",
  clueId: "zero-placeholder-note",
  sourceEpisodeId: "clocktower-01",
  text: "0은 사라지는 숫자가 아니야. 자리를 지키는 숫자야.",
  firstReadQuestion: "0이 없으면 무엇을 읽기 어려워질까?",
  conceptAfterLearning: "자리값과 규칙",
  rereadMeaning: "0은 없다는 뜻만이 아니라 숫자의 자리를 지키기도 한다.",
  nextAnomalyHint: "버스 번호판에서 10번을 찾아봐.",
  printVariant: {
    storybookAnchor: "시계탑 아래 쪽지",
    workbookQuestion: "0을 지우면 10번 버스는 어떻게 보일까?",
    classroomPrompt: "0은 언제 아무것도 아닌 것이 아니라 자리를 지킬까?",
  },
};
```

화면:

- 처음에는 수수께끼처럼 보인다.
- 관련 개념을 배운 뒤 다시 읽으면 의미가 한 줄 추가된다.
- 단서 총개수는 작게만 보여준다.
- 형태는 제로가 남긴 종이, 영수증, 버스표, 빵집 포장지 같은 증거물로 만든다.

구현 힌트:

- HTML/CSS 카드가 적합하다.
- 찢어진 가장자리는 필요할 때 SVG `clipPath`로 처리한다.
- 처음 발견 시 문장은 살짝 흐릿하고, 의미가 풀리면 핵심 단어에 밑줄이나 도장이 찍힌다.

### 4.8 단서 연결판

역할: 단서가 모여 큰 질문으로 이어지게 한다.

포맷:

```js
const clueLink = {
  artifactId: "link-zero-pattern-fairness",
  requiredClues: [
    "zero-placeholder-note",
    "route-rule-note",
    "leftover-piece-letter"
  ],
  unlocksQuestion: "제로는 숫자를 없애려는 걸까, 아니면 숫자를 이해하지 못하는 걸까?",
  visibleLinks: [
    { from: "zero-placeholder-note", to: "route-rule-note", label: "0이 사라지면 규칙도 흐려짐" },
    { from: "route-rule-note", to: "leftover-piece-letter", label: "규칙을 모르면 공평함도 흔들림" }
  ],
};
```

화면:

- 미스터리 보드처럼 단서 카드가 선으로 연결된다.
- 새 연결은 조용한 빛으로만 표시한다.
- "모두 모으기" 압박을 전면에 세우지 않는다.
- 밝은 코르크 보드나 자석 보드 톤을 쓴다. 어둡고 무서운 추리물 톤은 피한다.

모바일:

- 전체 보드를 축소하지 않는다.
- 카드 스택과 `연결 보기` 미니맵으로 나눈다.
- 연결선은 SVG line으로 그리고 단서 카드는 HTML button으로 유지한다.

### 4.9 재방문 초대

역할: 새 능력으로 예전 장소를 다르게 보게 한다.

포맷:

```js
const revisitInvite = {
  artifactId: "revisit-clocktower-pattern",
  unlockAfterAbility: "pattern-lens",
  targetPlaceId: "clocktower",
  prompt: "시계탑 종소리에도 규칙이 있을까?",
  estimatedMinutes: 2,
  taskType: "inspectScene",
  rewardArtifactId: "clue-clock-chime-pattern",
  maxCompletions: 1,
};
```

규칙:

- 1-2분 관찰 중심.
- 메인 진행을 막지 않는다.
- 보상은 단서 연결 또는 짧은 대사다.
- 같은 장소를 반복 farm으로 만들지 않는다.

### 4.10 오늘의 마무리 카드

역할: 세션을 안전하게 끝내면서 다음 기억을 남긴다.

포맷:

```js
const recapCard = {
  artifactId: "recap-clocktower",
  episodeId: "clocktower-01",
  repairedPlace: "시계탑 광장",
  learnedAbility: "시간 렌즈",
  memoryLine: "두 시각을 함께 보면 남은 시간을 알 수 있어.",
  newClue: "0은 자리를 지키는 숫자야.",
  nextObject: "0이 사라진 버스 번호판",
  primaryAction: "오늘은 여기까지",
  secondaryAction: "지도만 더 보기",
};
```

화면:

- 다음 시작보다 마무리를 기본값으로 둔다.
- 다음 이야기는 저장되어 있다는 안정감을 준다.
- 2개 에피소드 연속 완료 뒤에는 쉬운 종료 카드를 우선한다.

완료 리캡 시각 순서:

```text
장소 변화 이미지
→ 복구된 장소
→ 새 능력
→ 새 단서
→ 다음 이상현상
→ 지도 보기
```

보상 목록이 아니라 복구 전후 엽서처럼 보이게 한다.

### 4.11 모바일 하단 시트

역할: 능력 도감, 단서장, 힌트, 설정을 장면을 완전히 떠나지 않고 열게 한다.

포맷:

```js
const bottomSheetArtifact = {
  artifactId: "mobile-bottom-sheet",
  states: ["peek", "half", "full"],
  minTouchTargetPx: 44,
  maxHeight: "min(78dvh, 620px)",
  safeArea: true,
  contents: ["currentAbility", "newClue", "hintStep", "settings"],
};
```

구현 힌트:

- 360px 폭에서 버튼 텍스트가 잘리지 않아야 한다.
- 기본은 지도와 장면을 가리지 않는 `peek` 상태다.
- 열렸을 때 배경 장면은 유지하되 클릭은 잠근다.
- 모션 줄이기 설정에서는 slide 대신 즉시 열림으로 바꾼다.

## 5. Product Core Slice 아티팩트 세트

Core Slice에서 반드시 구현할 최소 세트:

| 에피소드 | 이상현상 | 능력 | 조작판 | 오개념 반응 | 복구 기록 | 단서 |
| --- | --- | --- | --- | --- | --- | --- |
| 시계탑 | 멈춘 시계와 3시 버스 | 시간 렌즈 | 10분 조각 2개 놓기 | 60분 착각, 정각만 보기 | 시계탑 복구 | 0의 쪽지 |
| 숫자 버스 | 10번에서 0이 사라짐 | 패턴 렌즈 | 번호 타일 배열 | 1번과 10번 혼동, 1씩 증가 착각 | 노선 복구 | 규칙 쪽지 |
| 반쪽 빵집 | 조각 수는 맞지만 크기가 다름 | 나누기 칼 | 4등분 가이드 | 개수만 같으면 공평하다고 생각 | 빵집 복구 | 남은 조각 편지 |

시계탑 에피소드의 아티팩트 완성도가 제품 증명이다. 시계탑이 약하면 에피소드 수를 늘리지 않는다.

Core Slice 우선순위:

1. 도시 지도 조각.
2. 시계탑 장면 조작판.
3. 완료 리캡.
4. 능력 카드와 단서 카드.
5. 미스터리 보드.
6. 모바일 하단 시트 완성도.

## 6. 화면 배치

### 6.1 지도 화면

```text
[제목 + 설정]
[SVG 도시 지도]
[현재 이상현상 카드]
[하단 탭: 능력 도감 / 단서장 / 복구 기록]
```

### 6.2 에피소드 화면

```text
[상단바]
[장면 스테이지]
[노바 말풍선]
[장면 조작판]
[힌트]
```

### 6.3 완료 화면

```text
[복구 애니메이션]
[복구 기록]
[능력 카드]
[단서 카드]
[오늘의 마무리 카드]
```

카드가 많아도 화면에 한 번에 모두 펼치지 않는다. 완료 화면은 세로 순서로 천천히 보여주고, 기본 CTA는 `지도 보기`다.

## 7. 구현 배치

```text
landing/src/apps/suspiciousMathCity/
  data/
    registry.js
    episodes/
      clocktower01.js
      numberBus02.js
      bakery03.js
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
    questEngine.js
    mapState.js
  components/
    ArtifactCard.jsx
    AbilityCard.jsx
    ClueBoard.jsx
    RepairRecord.jsx
    RecapCard.jsx
```

원칙:

- `registry.js`는 아티팩트 내용의 source다.
- `progressStore.js`는 id 목록만 저장한다.
- 컴포넌트는 저장소를 직접 만지지 않는다.
- 에피소드 데이터와 아티팩트 데이터는 id로 연결한다.
- asset URL은 데이터에 직접 박지 않고 base-aware helper가 조립한다.

## 8. 품질 게이트

새 에피소드나 아티팩트는 다음 질문을 통과해야 한다.

- 아이가 손으로 움직이는 수학 조작이 있는가?
- 오답이 장면 반응으로 설명되는가?
- 완료 후 지도에 복구 전후가 남는가?
- 단서가 다음 개념으로 다시 읽히는가?
- 다음 질문은 1개만 열리는가?
- 세션을 끝내기 쉬운가?
- 저장 데이터에 개인정보나 행동 로그가 들어가지 않는가?
- 아티팩트가 점수, 희귀도, 연속 보상으로 변질되지 않는가?
