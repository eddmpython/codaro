# 운영 PRD

## 1. 목적

이 문서는 `수상한 수학도시`를 장기 유지 가능한 정적 브라우저 게임으로 운영하기 위한 계약이다. 서버, 계정, 원격 저장 없이도 콘텐츠가 늘어날 수 있어야 한다.

운영 목표:

- 새 에피소드를 데이터 중심으로 추가한다.
- 공개된 id는 함부로 바꾸지 않는다.
- 저장 데이터는 작고 복구 가능하게 유지한다.
- 접근성과 학습 품질 검수를 릴리즈 조건으로 둔다.
- 기능 확장보다 첫 vertical slice의 품질을 우선한다.
- Episode Pack 하나에서 앱, 스토리북, 워크북, 활동지를 파생한다.

## 2. 릴리즈 단위

최소 릴리즈 단위:

```text
route
+ registry
+ 저장 계약
+ 플레이 가능한 에피소드 1개
+ format adapter
+ 회귀 테스트
```

에피소드 추가 릴리즈에 필요한 것:

| 항목 | 필수 |
| --- | --- |
| 에피소드 데이터 | World Math Beat, 오개념, 전이 과제 |
| 아티팩트 데이터 | 능력 카드, 단서 카드, 복구 기록 |
| asset manifest | 필요한 이미지, SVG, motion id |
| format adapter | 스토리북, 워크북, 활동지 변환 필드 |
| migration 영향 | 저장 schema 변경 여부 |
| 접근성 확인 | 키보드, 터치, 모션 축소, 확대 |
| 수동 플레이 기록 | 이름 없이 관찰 결과만 |

시즌 확장은 Core Season Opening 3개 에피소드와 저장 회귀가 안정화된 뒤만 허용한다.

## 3. Versioned Registry 계약

정적 registry는 콘텐츠의 source다.

```js
export const mathCityRegistry = {
  registryVersion: 1,
  schemaVersion: 1,
  contentVersion: "core-001",
  assetsVersion: "core-assets-001",
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
  formatAdaptersById,
  deprecatedIds,
  replacementIds,
  sessionPolicy,
};
```

규칙:

- 한 번 공개된 id는 rename하지 않는다.
- 제거가 필요하면 `deprecatedIds`와 `replacementIds`로 처리한다.
- 사용자별 `status`, `state`, `found`, `owned`는 registry에 넣지 않는다.
- 열린 에피소드, 지도 상태, 단서 상태는 `progress`와 registry에서 계산한다.
- `contentVersion` 변경은 저장 초기화 사유가 아니다.
- `formatAdaptersById`는 앱 문구를 긁어오지 않고 Episode Pack 원천 필드를 참조한다.

## 4. Registry 검증 항목

릴리즈 전 자동 또는 수동으로 확인한다.

| 검증 | 기준 |
| --- | --- |
| 중복 id | episode, ability, clue, place, asset id 중복 없음 |
| 참조 무결성 | 참조하는 id가 registry 안에 존재 |
| orphan asset | 쓰지 않는 필수 asset 없음 |
| 미사용 ability | 능력은 최소 1개 에피소드 또는 재방문에서 사용 |
| task type | 구현된 task type만 사용 |
| episode 순서 | `episodeOrder`의 모든 id가 존재 |
| season 연결 | 모든 episode가 season에 연결 |
| 금지 저장 | registry에 사용자별 상태 필드 없음 |
| 금지 몰입 | 출석, 랭킹, 랜덤 보상, 광고 보상 필드 없음 |
| 접근성 필드 | 핵심 오브젝트에 접근성 이름과 대체 조작이 있음 |
| format adapter | 앱, 스토리북, 워크북, 활동지 변환 필드 존재 |
| print refs | 인쇄 산출물에 필요한 장면 anchor와 조작 부록 id 존재 |
| rights status | 외부 자산 없이 권리 상태가 명확함 |

## 5. 저장 마이그레이션

저장 key:

```text
suspiciousMathCity.progress.v1
```

정책:

- 저장 key는 가능하면 유지하고 내부 `schemaVersion`만 올린다.
- `migrationsBySchemaVersion`을 순차 적용한다.
- migration 실패 시 기본 상태로 복구하되 게임 진입은 막지 않는다.
- unknown id는 제거한다.
- deprecated id는 replacement mapping으로 바꾼다.
- 중복 id는 제거한다.
- 저장 실패, parse 실패, storage 차단을 정상 시나리오로 처리한다.

예상 구조:

```js
const migrationsBySchemaVersion = {
  1: progress => progress,
  2: progress => ({
    ...progress,
    completedRevisitHookIds: progress.completedRevisitHookIds ?? [],
  }),
};
```

저장하지 않는 것:

- 이름, 학년, 학교, 보호자 정보.
- 기기 식별자.
- 자유입력 텍스트.
- 클릭 로그와 초 단위 행동 기록.
- 오답 횟수와 힌트 사용 기록.
- 점수, 랭킹, 출석, 연속 기록.

## 6. 품질 Gate

현재 필수 gate:

```text
uv run python -X utf8 tests/run.py gate landing-build
uv run python -X utf8 tests/run.py gate root-clean
```

후속 권장 gate:

| gate | 확인 |
| --- | --- |
| `math-city-contract` | registry schema, id 참조, 개인정보 비저장, 금지 몰입 장치, asset manifest |
| `math-city-storage` | migration, 깨진 JSON, unknown id, duplicate id, deprecated id mapping |
| `math-city-browser` | 직접 진입, 첫 플레이, 에피소드 완료, 새로고침 유지, 초기화, storage 차단 |
| `math-city-accessibility` | 키보드 경로, 끌기 대체, 큰 글자, 모션 축소, 360px overflow |
| `math-city-visual` | 360/390/414/768/1280 뷰포트, blank, overflow, 겹침, 상태 표시 |
| `math-city-publishing` | Episode Pack에서 스토리북, 워크북, 활동지 필드 파생 가능 |

## 7. 회귀 테스트 시나리오

Product Core Slice 구현 후 매 릴리즈에서 확인한다.

1. 신규 사용자 첫 30초가 지도와 사건으로 시작한다.
2. 시계탑 완료 후 지도 상태, 능력, 단서가 갱신된다.
3. 새로고침 후 완료 상태가 유지된다.
4. 초기화 후 첫 상태로 돌아간다.
5. `localStorage` 사용 불가 시에도 플레이가 막히지 않는다.
6. 모션 줄이기, 큰 글자, 키보드 경로가 깨지지 않는다.
7. `/codaro/math-city` 직접 진입이 빈 화면이 아니다.
8. 360px 폭에서 버튼과 하단 시트가 겹치지 않는다.
9. 시계탑 Episode Pack이 스토리북 8-12쪽, 워크북 4쪽, 활동지 15분안으로 파생된다.
10. visual smoke에서 blank, overflow, 텍스트 잘림, 하단 시트 겹침이 없다.

## 8. 시즌 확장 규칙

시즌은 다음 필드를 가진다.

```js
const season = {
  seasonId: "season-01",
  title: "사라진 숫자",
  seasonQuestion: "왜 도시에서 숫자가 사라지고 있을까?",
  conceptBudget: ["time-difference", "pattern", "fair-share", "length", "subtraction", "shape"],
  districtIds: ["clocktower", "number-bus-stop", "bakery", "bridge", "alley", "shape-workshop"],
  reusableAbilityIds: ["time-lens", "pattern-lens", "fraction-knife"],
  finaleCondition: "제로가 숫자를 없애려 한 이유를 단서로 설명한다",
};
```

규칙:

- 새 시즌은 새 시스템 추가보다 기존 능력 재사용과 조합을 우선한다.
- 한 에피소드에는 새 개념 1개, 기존 개념 1개 조합까지만 허용한다.
- 재방문 미션은 1-2분, 1회성, 메인 진행 차단 금지다.
- 시즌 finale는 계산량이 아니라 개념 단서 연결로 해결한다.

## 9. 스코프 관리

Core Slice 고정 제외:

- 계정.
- 원격 저장.
- 원격 분석.
- 결제.
- 광고.
- 순위표.
- 보호자 대시보드.
- 실시간 멀티플레이.
- 오프라인 cache 강화.
- 대용량 저장.

service worker는 route, cache 무효화, 저장 회귀가 안정화된 뒤 별도 phase에서만 검토한다.

## 10. 장기 유지 원칙

| 원칙 | 의미 |
| --- | --- |
| vertical slice 우선 | 시계탑 하나가 제품 약속을 증명하기 전에는 범위를 늘리지 않는다 |
| 데이터 중심 | 새 에피소드는 컴포넌트 수정이 아니라 데이터 추가 중심이어야 한다 |
| id 안정성 | 공개된 id는 진행 저장과 연결되므로 바꾸지 않는다 |
| 검수 우선 | 에피소드 수보다 루브릭 통과가 먼저다 |
| 접근성 기본값 | 대체 조작과 모션 축소는 후순위가 아니다 |
| 개인정보 없음 | 개선을 위해 개인 기록을 만들지 않는다 |
| 매체 원천 공유 | 앱, 책, 워크북은 같은 Episode Pack을 본다 |
| 스택 절제 | Product Core Slice 전에는 game engine, 서버, 과한 캐시를 추가하지 않는다 |
