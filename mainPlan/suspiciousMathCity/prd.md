# 수상한 수학도시 PRD

> 상태: production lock v1
> 범위: GitHub Pages에 올릴 수 있는 서버 없는 초등 수학 스토리형 학습 게임.
> 원칙: 개인정보를 만들지 않고, 브라우저에 남는 개인 진행만 사용한다.

## 1. 제품 정의

수상한 수학도시는 초등학생이 수학 개념을 능력처럼 획득하고, 그 능력으로 도시의 이상현상을 해결하며, 숨겨진 이야기를 이해하는 정적 웹 학습 게임이다.

이 제품은 수학 문제를 많이 풀게 하는 앱이 아니다. 아이가 먼저 이상한 사건을 보고, 왜 그런 일이 생겼는지 궁금해하고, 필요한 개념을 찾아 세계를 고치는 앱이다. 장기적으로는 같은 Episode Pack에서 스토리북, 워크북, 조작 부록, 교사용 활동지까지 파생할 수 있는 수학 세계관이다.

기획의 출발점은 `게임을 좋아하지만 수학은 싫어하는 초등 3학년 으뜸이`와, `게임 자체보다 공부와 멀어지는 모습이 아쉬운 으뜸아빠`다. 이들은 실제 사용자 정보가 아니라 제품 판단을 위한 대표 페르소나다. 자세한 기준은 [originAndPersona.md](originAndPersona.md)를 따른다.

핵심 문장:

> 개념을 배우면 새로운 능력이 생기고, 새로운 능력으로 도시의 숨겨진 이야기를 이해한다.

첫 출시 단위는 버리는 MVP가 아니다. 이 문서에서는 `Product Core Slice`라고 부른다.

```text
Product Core Slice
= 앞으로 시즌, 도서, 워크북이 올라갈 제품 코어를 시계탑 한 편으로 증명하는 단위
```

PRD 완성 판정은 [prdCompletionCriteria.md](prdCompletionCriteria.md)를 따른다. 현재 PRD 묶음은 제품 출시 완료가 아니라, 시계탑 Product Core Slice를 제작 착수 가능한 수준으로 잠근 상태다.

## 2. 왜 GitHub Pages인가

첫 버전은 서버가 필요 없다.

- 학습 콘텐츠는 정적 JSON 또는 JavaScript 모듈로 충분하다.
- 진행 상태는 `localStorage`에 저장하면 충분하다.
- 이미지와 소리는 `landing/static/`에서 제공하면 충분하다.
- 개인정보, 계정, 원격 동기화가 없으므로 백엔드가 제품 가치를 만들지 않는다.

브라우저 저장소는 영구 보장을 하지 않는다. 그래서 제품 문구도 "내 계정에 저장"이 아니라 "이 브라우저에 저장"으로 정직하게 잡는다. 저장이 사라져도 아이에게 피해가 없도록 모든 에피소드는 다시 시작 가능해야 한다.

## 3. 대상

1차 대상은 초등 2-4학년이다.

이 연령대에 맞는 기준:

- 한 에피소드 5-10분.
- 한 화면에 새 개념 1개만 중심으로 둔다.
- 긴 설명보다 장면, 조작, 짧은 대화로 이해시킨다.
- 실패를 벌하지 않고 힌트와 재시도로 이어간다.
- 계산 속도보다 개념 선택과 상황 해석을 더 중요하게 본다.

보호자 대상 제품이 아니므로 부모 대시보드는 만들지 않는다. 대신 아이가 스스로 볼 수 있는 진행 지도와 단서장을 제공한다.

## 4. 핵심 문제

일반 수학 앱은 다음 구조에 머문다.

```text
단원 선택
문제 풀이
정답/오답
점수 또는 별
반복
```

수상한 수학도시는 다음 구조를 가져야 한다.

```text
이상현상 발견
상황 속 단서 읽기
필요한 수학 개념 추론
개념 능력 사용
작은 문제 해결
도시 상태 변화
다음 비밀 개방
```

아이의 동기는 점수보다 궁금증이어야 한다.

## 5. 제품 원칙

### 5.1 개인정보 없음

저장하지 않는 것:

- 이름
- 이메일
- 학년
- 학교
- 보호자 정보
- 원격 학습 기록
- 기기 식별자

저장하는 것:

- 완료한 에피소드 id
- 획득한 개념 능력 id
- 복구된 세계 상태 id
- 본 단서 id
- 완료한 재방문 id
- 마지막으로 본 지도 장소 id
- 설정값: 소리, 모션 줄이기, 글자 크기

모든 저장은 이 브라우저 안에서만 이뤄진다.

### 5.2 건강한 몰입

금지:

- 출석 압박
- 순위 경쟁
- 랜덤 보상
- 광고 보상
- 실패 패널티
- 무한 플레이 루프

허용:

- 짧은 에피소드
- 미완성 지도
- 다음 이야기 예고
- 개념 도구 수집
- 단서장
- 내가 고친 세계의 시각 변화

### 5.3 개념 우선

문제 수보다 중요한 것은 "왜 이 개념이 필요한가"다.

각 미션은 반드시 다음 질문에 답해야 한다.

- 이 상황에서 어떤 개념이 필요한가?
- 그 개념으로 무엇을 볼 수 있거나 바꿀 수 있는가?
- 아이가 문제를 풀기 전에도 장면 속 단서를 찾을 수 있는가?
- 성공 후 세계가 눈에 띄게 달라지는가?

### 5.4 세계-수학 계약

모든 미션은 `깨진 세계 규칙`, `필요한 수학 개념`, `아이의 조작`, `시각 모델`, `성공 후 세계 반응`, `오답별 세계 반응`을 가진다. 이 여섯 항목 중 하나라도 없으면 미션이 아니라 문제 카드로 판정한다.

능력은 끝에 받는 아이템이 아니라 장면을 읽고 조작하는 입력 방식이다. 예를 들어 시간 렌즈는 보상이 아니라 두 시각 사이를 색 띠로 보여주는 화면 문법이다.

### 5.5 접근성과 단독 사용

초등학생이 혼자 플레이할 수 없으면 Product Core Slice가 아니다. 접근성은 후속 개선이 아니라 완료 조건이다.

필수 기준:

- 키보드만으로 지도, 에피소드, 힌트, 단서장, 설정, 초기화까지 조작 가능.
- 모든 끌기 과제는 선택 기반 대체 조작을 제공.
- 주요 터치 목표는 `48x48 CSS px` 이상.
- 본문 대비, 포커스 표시, 상태 구분은 [accessibilityAndUsability.md](accessibilityAndUsability.md)를 따른다.
- 소리, 색, 빠른 모션만으로 정보를 전달하지 않는다.
- `largeText`와 `reducedMotion` 설정에서 같은 학습 흐름을 완료할 수 있다.

### 5.6 장기 유지 계약

장기 프로젝트가 되려면 콘텐츠를 많이 쓰는 것보다 같은 품질로 계속 만들 수 있어야 한다.

확장 기준:

| 계약 | 기준 문서 | 출시 조건 |
| --- | --- | --- |
| 매체 원천 | [crossMediaPrd.md](crossMediaPrd.md) | Episode Pack이 앱, 스토리북, 워크북, 활동지로 변환 가능 |
| 기술 스택 | [technicalStackAdr.md](technicalStackAdr.md) | TypeScript game boundary, registry validation, visual gate |
| 세계관 캐논 | [ipCanon.md](ipCanon.md) | 제로, 노바, 시즌 질문, 금지 변형을 지킴 |
| 커리큘럼 | [curriculumMatrix.md](curriculumMatrix.md) | 새 개념 1개, 선수 개념, 전이 과제, 오개념 대응이 명확함 |
| 교과 연계 | [standardsAlignment.md](standardsAlignment.md) | 성취기준, 선수 감각, 독해 함정, 전이 수준 명시 |
| 제작 | [episodeAuthoringGuide.md](episodeAuthoringGuide.md) | Episode Brief부터 registry 등록까지 통과 |
| 시계탑 기준본 | [clocktowerEpisodePack.md](clocktowerEpisodePack.md) | 첫 에피소드의 story beat, 조작, 오개념, 출판 변환이 잠김 |
| 출판 변환 | [publishingFormatMatrix.md](publishingFormatMatrix.md) | 8-12쪽 이야기, 4쪽 워크북, 15분 활동지로 변환 |
| 시각 제작 | [premiumProductionPipeline.md](premiumProductionPipeline.md) | graybox, state-art, character, polish, visual QA 통과 |
| Core Slice 제작 잠금 | [coreSliceProductionLock.md](coreSliceProductionLock.md) | 화면 상태, 조작, 그래픽, 에셋, 접근성 인수조건이 잠김 |
| 접근성 | [accessibilityAndUsability.md](accessibilityAndUsability.md) | 키보드, 터치, 큰 글자, 모션 축소 통과 |
| 품질 | [contentQualityRubric.md](contentQualityRubric.md) | 필수 항목 2점 이상 |
| 운영 | [operationsPrd.md](operationsPrd.md) | id 안정성, 저장 migration, 회귀 테스트 통과 |
| 구현 인수조건 | [implementationAcceptanceCriteria.md](implementationAcceptanceCriteria.md) | route, registry, storage, visual, accessibility gate 실패 조건이 명확함 |

## 6. Product Core Slice 범위

첫 Product Core Slice는 `시계탑이 멈춘 날`이다. 단, 장기 구조를 검증하기 위해 시즌 1의 초기 에피소드 3개를 같은 registry 계약 안에서 설계한다.

시계탑 에피소드는 [clocktowerEpisodePack.md](clocktowerEpisodePack.md)를 기준본으로 삼는다. 구현 중 문장, 단서, 오개념, 힌트, 전이 과제, 완료 화면이 흔들리면 이 문서를 우선한다.

| 에피소드 | 개념 | 능력 | 세계 변화 | 다음 단서 |
| --- | --- | --- | --- | --- |
| 시계탑이 멈춘 날 | 시각, 시간 차이, 덧셈 | 시간 렌즈 | 시계탑과 버스 정류장 복구 | 숫자 0이 사라짐 |
| 숫자 버스의 실종 | 수 배열, 규칙 | 패턴 렌즈 | 버스 노선 복구 | 도시 지도가 찢어짐 |
| 반쪽 빵집 | 나눗셈, 분수 기초 | 나누기 칼 | 빵집과 광장 식탁 복구 | 제로의 편지 발견 |

Core Slice 기능:

- 도시 지도 화면
- 에피소드 화면
- 스토리 대화
- 단서 찾기 질문
- 수학 미션 2-4개
- 힌트 2단계
- 성공 후 지도 상태 변화
- 개념 능력 도감
- 단서장
- 브라우저 진행 저장
- 진행 초기화 버튼

Core Slice에서 하지 않는 것:

- 계정
- 원격 저장
- 부모 대시보드
- 난이도 개인화
- 음성 녹음
- 결제
- 교사용 기능

## 7. 기능 목록

| ID | 기능 | 설명 | 우선순위 |
| --- | --- | --- | --- |
| M-01 | Episode Quest Engine | 스토리, 단서 질문, 수학 미션, 보상을 하나의 에피소드로 실행 | High |
| M-02 | Concept Ability System | 수학 개념을 시간 렌즈, 패턴 렌즈, 나누기 칼 같은 능력으로 표시 | High |
| M-03 | World State Store | 복구된 세계 상태 id만 저장하고 지도 상태는 계산 | High |
| M-04 | Mystery Clue Journal | 미션 완료 때 얻은 단서를 아이가 다시 볼 수 있게 함 | High |
| M-05 | Story Comprehension Check | 이야기 상황을 이해했는지 묻는 짧은 질문 | High |
| M-06 | Math Task Generator | 에피소드별 범위 안에서 숫자를 조금씩 바꿔 문제 생성 | High |
| M-07 | Hint Ladder | 바로 정답을 주지 않고 관찰 힌트, 개념 힌트, 풀이 힌트 순서로 제공 | Medium |
| M-08 | Episode Cliffhanger | 완료 후 다음 이야기 1문장 예고 | Medium |
| M-09 | Reset Progress | 같은 브라우저의 진행 상태 초기화 | Medium |
| M-10 | Reduced Motion Mode | 모션 민감 사용자를 위한 움직임 축소 | Medium |
| M-11 | Healthy Engagement Loop | 압박 없이 다음 단서와 미완성 지도로 재방문 동기를 만듦 | High |
| M-12 | Browser-only Save Contract | 진행은 로컬 저장소, 에셋은 브라우저 캐시, 개인정보는 저장하지 않는 계약 | High |
| M-13 | Scene Object Interaction | 장면 속 시계, 번호판, 케이크 같은 오브젝트를 직접 조작 | High |
| M-14 | Accessibility Contract | 키보드, 터치, 큰 글자, 모션 축소, 끌기 대체 조작을 보장 | High |
| M-15 | Episode Authoring Contract | 새 에피소드를 같은 품질로 만들 수 있는 제작 템플릿과 gate | High |
| M-16 | Curriculum Matrix | 시즌별 개념, 능력, 조작, 오개념, 전이 과제를 관리 | High |
| M-17 | Content Quality Rubric | 출시 전 학습 품질과 접근성 기준을 내부 점검 | High |
| M-18 | Versioned Registry | 콘텐츠 id, asset, migration, deprecated mapping을 장기 관리 | High |
| M-19 | Cross-media Episode Pack | 앱, 스토리북, 워크북, 활동지로 파생 가능한 공통 원천 | High |
| M-20 | Technical Stack Boundary | React/Vite 안에 TypeScript 게임 경계와 SVG/HTML 조작 계약 | High |
| M-21 | Premium Visual QA | 주요 뷰포트와 상태별 스크린샷으로 허접한 화면을 차단 | High |
| M-22 | Publishing Adapter | 워크북 4쪽, 스토리북 8-12쪽, 활동지 1장을 파생 | Medium |

## 8. 콘텐츠 단위

에피소드는 데이터로 표현한다.

```json
{
  "episodeId": "clocktower-01",
  "title": "시계탑이 멈춘 날",
  "districtId": "clocktower",
  "requiredConcepts": ["time-reading", "addition-basic"],
  "abilityReward": "time-lens",
  "worldChange": "clocktower-fixed",
  "clueReward": "zero-placeholder-note",
  "cliffhanger": {
    "closedLoop": "시계탑은 다시 움직이고, 버스는 3시에 출발할 수 있게 됐다.",
    "newQuestion": "그런데 밤이 되자 번호판에서 0만 사라졌다.",
    "nextPlaceId": "number-bus-stop",
    "nextEpisodeId": "number-bus-02",
    "conceptForeshadow": "규칙",
    "urgency": "none"
  },
  "beats": [],
  "tasks": []
}
```

각 `task`는 단순 `question/choices/answer`가 아니라 `World Math Beat`를 가진다. 이 계약이 없으면 미션이 아니라 문제 카드로 판정한다.

```json
{
  "taskId": "clock-gap-01",
  "sceneObject": "clockFace-and-busTimetable",
  "brokenWorldRule": "현재 시각과 출발 시각 사이의 간격이 보이지 않는다",
  "concept": "time-difference",
  "abilityAction": "시간 렌즈로 두 시각 사이를 색 띠로 잇는다",
  "playerOperation": "10분 조각 2개를 2시 40분과 3시 사이에 끌어 놓는다",
  "visualModel": "2시 40분부터 3시까지 남은 칸 2개",
  "mathModel": "2:40 + 20분 = 3:00",
  "successWorldChange": "버스 출발등이 켜지고 시계탑 바늘이 다시 움직인다",
  "misconceptionFeedback": [
    {
      "wrongIdea": "3시까지 60분이라고 생각함",
      "worldResponse": "색 띠가 시계 한 바퀴를 넘으려다 멈춘다",
      "hint": "지금은 2시 40분이야. 3시까지 빈 칸만 세어 봐."
    }
  ],
  "clueMeaning": "시간 차이를 알면 멈춘 약속도 다시 이어진다"
}
```

`World Math Beat`의 8개 항목:

1. 이상현상: 세계에서 무엇이 이상하게 보이는가.
2. 수학 규칙: 어떤 개념이 빠져서 이상해졌는가.
3. 관찰 단서: 아이가 문제 전에 무엇을 볼 수 있는가.
4. 조작: 아이가 손으로 무엇을 움직이는가.
5. 모델: 조작이 어떤 수학 표현으로 정리되는가.
6. 세계 반응: 맞으면 무엇이 회복되는가.
7. 오개념 반응: 틀리면 어떤 이유가 장면으로 보이는가.
8. 이야기 단서: 이 개념으로 어떤 비밀이 새롭게 읽히는가.

Core Slice task UI는 다음 중 하나다.

- `storyChoice`: 상황 속 필요한 정보나 개념 선택.
- `mathChoice`: 계산 또는 개념 선택.
- `dragArrange`: 숫자, 조각, 시간 순서 배열.
- `splitWhole`: 전체를 같은 부분으로 나누기.
- `inspectScene`: 장면에서 단서 클릭.

첫 Core Slice는 `storyChoice`, `mathChoice`, `dragArrange`를 구현한다. `splitWhole`은 반쪽 빵집의 핵심 조작이므로 다음 제품 slice에서 곧바로 붙인다.

단, 각 에피소드에는 손가락으로 직접 조작하는 수학 행동이 최소 1개 있어야 한다. 정답 선택만으로 완료되는 에피소드는 Core Slice 완료로 보지 않는다.

## 9. 진행 저장

저장 key:

```text
suspiciousMathCity.progress.v1
```

저장 예:

```json
{
  "schemaVersion": 1,
  "contentVersion": "core-001",
  "completedEpisodeIds": ["clocktower-01"],
  "ownedAbilityIds": ["time-lens"],
  "restoredWorldStateIds": ["clocktower-fixed"],
  "foundClueIds": ["zero-placeholder-note"],
  "completedRevisitHookIds": [],
  "lastMapFocusPlaceId": "number-bus-stop",
  "settings": {
    "sound": false,
    "reducedMotion": false,
    "largeText": false
  }
}
```

정책:

- 저장 실패 시에도 게임은 계속 가능해야 한다.
- 저장 데이터가 깨지면 기본 상태로 복구한다.
- `schemaVersion`이 맞지 않으면 안전하게 마이그레이션하거나 초기화한다.
- 사용자가 직접 초기화할 수 있어야 한다.
- `unlockedEpisodeIds`, 지도 장소 상태, 단서 `found` 상태는 저장하지 않고 registry와 완료 id에서 계산한다.

진행 저장은 브라우저 HTTP 캐시에 맡기지 않는다. HTTP 캐시는 이미지와 스크립트 같은 에셋을 위한 것이고, 아이의 진행 상태는 작은 JSON으로 `localStorage`에 저장한다. 나중에 그림, 소리, 큰 에셋을 오프라인으로 더 강하게 보관해야 할 때만 Cache API와 service worker를 검토한다.

## 10. 성공 지표

Core Slice 성공은 숫자 많은 분석이 아니라 품질 체크로 본다.

| 지표 | 기준 |
| --- | --- |
| 개념 필요성 | 각 에피소드에서 문제 전에 "왜 이 개념이 필요한지"가 장면으로 보인다 |
| 세계 변화 | 완료 후 지도나 장면의 변화가 즉시 보인다 |
| 독해 결합 | 에피소드마다 스토리 이해 질문이 최소 1개 있다 |
| 부담 | 첫 3개 에피소드 총 플레이 시간이 30분을 넘지 않는다 |
| 재시작 가능성 | 저장을 지워도 모든 콘텐츠를 다시 플레이할 수 있다 |
| 개인정보 | 네트워크 전송 없이 진행이 동작한다 |
| 재미 | 다음 에피소드 예고가 단서와 연결된다 |
| 건강한 중독성 | 끝낸 뒤 "한 판 더"보다 "다음 비밀이 궁금하다"는 감정이 남는다 |
| 조작감 | 핵심 개념마다 손으로 바꾸는 오브젝트가 있다 |
| 세계-수학 계약 | 각 미션에 깨진 규칙, 개념, 조작, 시각 모델, 세계 반응, 오개념 반응이 있다 |
| 접근성 | 키보드, 터치, 큰 글자, 모션 축소, 소리 없음에서도 완료 가능하다 |
| 학습 품질 | [contentQualityRubric.md](contentQualityRubric.md)의 필수 항목이 2점 이상이다 |
| 운영 안정성 | registry 참조, 저장 migration, id 안정성 검증을 통과한다 |
| 스택 적합성 | TypeScript game boundary, SVG/HTML 조작, localStorage, lazy loading 계약이 지켜진다 |
| 출판 가능성 | 첫 에피소드가 스토리북 1장, 워크북 1단원, 활동지 1장으로 변환된다 |
| 프리미엄 기준 | graybox부터 visual QA까지 통과하고 버튼/텍스트/장면이 겹치지 않는다 |

## 10.1 Product Core Slice 완료 판정

Product Core Slice는 기능이 보이는 것만으로 완료하지 않는다. 아래 조건을 모두 만족해야 한다.

1. 시계탑 vertical slice가 첫 30초 안에 이상현상, 관찰, 첫 질문을 보여준다.
2. 에피소드 1개 이상이 문제 전 단서 찾기, 직접 조작, 오개념 반응, 전이 과제를 가진다.
3. 저장을 지우거나 막아도 플레이가 멈추지 않는다.
4. `/codaro/math-city` 직접 진입이 빈 화면이 아니다.
5. 360px 모바일 폭, 키보드만 사용, `largeText`, `reducedMotion`에서 완료 가능하다.
6. 완료 화면 기본 행동이 `지도 보기` 또는 `오늘은 여기까지`다.
7. 금지 패턴이 UI, 데이터, 문구에 없다.
8. 첫 시계탑 에피소드가 스토리북 8-12쪽, 워크북 4쪽, 교사용 15분 활동으로 변환 가능하다.
9. `math-city-contract`, `math-city-storage`, `math-city-browser`, `math-city-accessibility`, `math-city-visual` gate 설계가 문서화되어 있다.
10. 에피소드 문장과 수학 데이터가 React 화면에 박히지 않고 registry에서 나온다.
11. [coreSliceProductionLock.md](coreSliceProductionLock.md)의 화면 상태표와 에셋 인벤토리가 실제 구현과 맞는다.
12. [implementationAcceptanceCriteria.md](implementationAcceptanceCriteria.md)의 T-01부터 T-18까지 통과 또는 명시 보류 판정을 가진다.

## 11. 로드맵

### Phase 0: 기획 잠금

- 제품 원칙 문서화.
- 에피소드 3개의 학습 목표와 이야기 구조 확정.
- 개념 능력 3개 확정.
- 데이터 스키마 확정.
- 커리큘럼 매트릭스, 제작 가이드, 접근성 기준, 품질 루브릭, 운영 PRD 확정.
- 크로스미디어 PRD, 세계관 캐논, 기술 스택 ADR, 프리미엄 제작 파이프라인 확정.
- 시계탑 Episode Pack, Core Slice 제작 잠금, 구현 인수조건, PRD 완성 판정 확정.

### Phase 1: Product Core Slice

- `landing` route 추가.
- 지도, 에피소드, 도감, 단서장 화면 구현.
- 에피소드 1개 완성.
- 브라우저 저장 구현.
- 키보드 경로, 큰 글자, 모션 축소, 끌기 대체 조작 구현.
- registry 검증과 저장 failure path 구현.
- TypeScript game boundary와 lazy import 구성.
- 시계탑 에피소드의 스토리북/워크북/활동지 변환 데이터 작성.
- [implementationAcceptanceCriteria.md](implementationAcceptanceCriteria.md)의 route, registry, storage, accessibility, visual, format gate를 실제 테스트로 승격.

### Phase 2: Core Season Opening

- 에피소드 2, 3 추가.
- 패턴 배열 조작과 나누기 조작 추가.
- 시각 변화와 힌트 정리.
- 모바일 화면 검증.
- 콘텐츠 품질 루브릭으로 3개 에피소드 검수.
- 사라진 0, 숫자 버스, 공평 배분, 단위분수 발달 순서 반영.

### Phase 3: 시즌 1 확장

- 도형 공방, 기차역, 지도 다리 에피소드 추가.
- 각도, 길이, 뺄셈, 도형 기초 개념 능력 추가.
- 조합 퍼즐 도입.
- 시즌 확장 규칙에 따라 기존 능력 재사용과 재방문 미션 추가.
- 스토리북 1권, 워크북 1권, 조작 부록 초안으로 확장 가능한 episode pack 검수.

## 12. PRD 완성 판정

이 PRD 묶음은 `production lock v1`로 본다.

완성으로 보는 이유:

- 제품 방향, 개인정보 없음, 건강한 몰입 원칙이 닫혀 있다.
- 기술 스택과 GitHub Pages 배포 방식이 닫혀 있다.
- 시계탑 1편이 실제 Episode Pack으로 내려왔다.
- 화면 상태표, 조작 방식, 에셋 인벤토리, 접근성 인수조건이 잠겼다.
- 구현 티켓과 실패 조건이 분리되어 있다.

아직 출시 완료가 아닌 이유:

- `/math-city` route와 registry fixture가 아직 구현되지 않았다.
- 실제 브라우저에서 visual, accessibility, storage failure gate가 돌지 않았다.
- 에셋은 제작 목록으로 잠겼지만 runtime 파일은 아직 없다.

다음 단계는 추가 방향 회의가 아니라 [implementationAcceptanceCriteria.md](implementationAcceptanceCriteria.md)의 T-01부터 구현하는 것이다.

## 13. 비범위

명시 전까지 하지 않는다.

- 서버 저장
- 계정
- 보호자 대시보드
- 학급 관리
- 결제
- 광고
- 순위표
- 소셜 공유
- 실시간 멀티플레이
- 원격 분석 수집
