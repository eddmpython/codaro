# Visual Interaction Blueprint

## 1. 목적

이 문서는 예쁜 그림 목록이 아니라 상태가 있는 장면 설계서다. 수학 개념을 아이가 직접 만지고, 실패와 성공이 오브젝트 상태로 보이게 만드는 계약이다.

## 2. World State Matrix

모든 장소는 같은 상태 언어를 쓴다.

| 상태 | 지도 | 장면 | 상호작용 |
| --- | --- | --- | --- |
| locked | 흐린 실루엣, 작은 자물쇠 | 접근 불가 | 누르면 필요한 능력 힌트 |
| available | 부드러운 강조, 조사 가능 표시 | 첫 장면 열림 | 시작 가능 |
| corrupted | 어긋난 선, 빠진 숫자, 멈춘 부분 | 핵심 오브젝트가 이상함 | 단서 찾기 가능 |
| restored | 색과 움직임 복구 | 정상 상태와 전후 비교 | 다시 보기 가능 |

예:

| 장소 | corrupted | restored |
| --- | --- | --- |
| clocktower | 멈춘 바늘, 꺼진 정류장 불, 흐린 종 | 움직이는 바늘, 켜진 정류장 불, 밝은 종 |
| numberBus | 빈 번호판, 끊긴 노선, 뒤섞인 표지 | 채워진 번호판, 이어진 노선, 정렬된 표지 |
| bakery | 크기가 다른 조각, 찌그러진 간판, 불만인 손님 | 같은 조각, 복구된 간판, 웃는 손님 |

## 3. Scene Object Sheet

각 에피소드는 조작 오브젝트를 명명한다. 오브젝트 이름은 코드와 문서에서 같이 쓴다.

모든 핵심 오브젝트는 아래 필드를 가진다.

```js
const sceneObject = {
  objectId: "clockFace",
  role: "clue",
  accessibleName: "2시 40분에서 멈춘 시계",
  stateText: {
    corrupted: "시계가 멈춰 있음",
    restored: "시계가 다시 움직임",
  },
  keyboardAction: "Enter로 단서 보기",
  touchTarget: "48x48 CSS px 이상",
};
```

색이나 모양만으로 상태를 표현하지 않는다. 상태는 텍스트, 아이콘, 패턴, focus 표시 중 최소 2개로 전달한다.

### clocktower-01

| objectId | 역할 | 상태 |
| --- | --- | --- |
| `clockFace` | 현재 시각 단서 | `idle`, `focus`, `wrong`, `correct`, `restored` |
| `clockHandMinute` | 시간 차이 시각화 | `stuck`, `moving`, `restored` |
| `busTimetable` | 목표 시각 단서 | `idle`, `focus`, `correct` |
| `stationLight` | 복구 결과 | `off`, `blink`, `on` |

### number-bus-02

| objectId | 역할 | 상태 |
| --- | --- | --- |
| `busNumberPlate` | 빈칸 문제 | `missing`, `wrong`, `filled` |
| `numberTiles` | 선택/끌어놓기 | `idle`, `dragging`, `placed`, `rejected` |
| `routeLine` | 규칙 복구 결과 | `broken`, `connecting`, `restored` |
| `stopSigns` | 순서 배열 | `scrambled`, `ordered` |

### bakery-03

| objectId | 역할 | 상태 |
| --- | --- | --- |
| `cakeWhole` | 전체 개념 | `whole`, `guide2`, `guide4`, `split` |
| `cakeGuide` | 같은 크기 가이드 | `hidden`, `preview`, `accepted` |
| `customerTray` | 공평 배분 | `empty`, `uneven`, `even` |
| `bakerySign` | 복구 결과 | `crooked`, `restored` |

## 4. Asset Manifest

에셋은 구현 가능한 계약으로 관리한다.

| assetId | format | size target | states | screens | required |
| --- | --- | --- | --- | --- | --- |
| `mapToyCity` | SVG | responsive viewBox | locked, available, corrupted, restored | map | yes |
| `placeClocktower` | SVG group | vector | 4 states | map, completion | yes |
| `sceneClocktower` | SVG | responsive | corrupted, restored | episode | yes |
| `sceneNumberBus` | SVG | responsive | corrupted, restored | episode | yes |
| `sceneBakery` | SVG | responsive | corrupted, restored | episode | yes |
| `novaExpressions` | bitmap or SVG | 256 square source | calm, curious, surprised, happy | dialog | yes |
| `zeroNotes` | HTML/CSS or SVG | flexible | 3 clues | clue journal | yes |
| `abilityIcons` | SVG | 64 square | locked, owned | inventory | yes |

## 5. Motion Contract

모션은 작고 의미가 있어야 한다.

| motionId | trigger | duration | meaning | reduced motion |
| --- | --- | --- | --- | --- |
| `focusPulse` | 단서 후보 focus | 300ms | 볼 곳 강조 | outline only |
| `wrongNudge` | 오답 | 180ms | 다시 관찰 | color + text |
| `correctSnap` | 정답 | 240ms | 맞는 위치 고정 | instant state |
| `clockRestore` | 에피소드 완료 | 1200ms | 시간이 다시 흐름 | 1 frame swap |
| `routeConnect` | 버스 완료 | 900ms | 길이 이어짐 | line appears |
| `cakeEvenSplit` | 빵집 완료 | 700ms | 공평한 나눔 | guide appears |
| `mapPlaceRestore` | 지도 복귀 | 1000ms | 장소 복구 | restored badge |

완료 연출 외에는 1초를 넘기지 않는다.

## 6. Mobile Layout Contract

360px 폭 기준:

```text
[상단바: 뒤로 / 에피소드명 / 진행 점]
[장면 스테이지: 16:10 비율, 오브젝트 클릭 가능]
[노바 말풍선: 1-2문장]
[하단 조작판: 선택지 또는 타일]
[힌트 버튼]
```

접근성 기준:

- 하단 조작판은 핵심 장면을 완전히 가리지 않는다.
- 모든 버튼은 최소 `44x44 CSS px`, 주요 버튼은 `48x48 CSS px` 이상이다.
- `largeText` 모드와 200% 확대에서도 버튼 텍스트가 잘리지 않는다.
- `reducedMotion` 모드에서는 모든 완료 연출이 정지 상태 전환으로 대체된다.

지도 화면:

```text
[제목 + 설정]
[지도: 화면 폭 전체]
[현재 사건 카드]
[하단 탭: 능력 / 단서장]
```

데스크톱에서는 지도와 단서장을 양쪽에 둘 수 있지만, 모바일 구조가 먼저다.

## 7. 첫 Product Core Slice 흥미 장면

가장 중요한 장면은 `시계탑이 멈춘 날`이다. 이 장면이 제품의 약속을 증명해야 한다.

필수 연출:

1. 지도에서 시계탑이 멈춰 보인다.
2. 시계탑을 누르면 시계와 버스 시간표가 같은 장면에 보인다.
3. 아이가 현재 시각과 출발 시각을 고른다.
4. 20분을 맞히면 바늘이 움직인다.
5. 지도에 돌아오면 시계탑이 복구되어 있다.

이 흐름이 완성되기 전에는 에피소드 수를 늘리지 않는다.
