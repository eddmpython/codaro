# 구현 인수조건

## 1. 완성 판정 정의

`수상한 수학도시` PRD는 아이디어 문서가 아니라 제작 가능한 제품 계약이어야 한다. 완성 판정은 다음 상태를 의미한다.

```text
기획자가 더 설명하지 않아도
개발자가 /math-city Product Core Slice를 구현할 수 있고,
검수자가 통과/실패를 명확히 판정할 수 있으며,
후속 에피소드가 같은 구조로 확장될 수 있는 상태
```

PRD 완성 조건은 기능 나열이 아니라 다음 계약이 닫히는 것이다.

- route 계약
- registry 계약
- 진행 저장 계약
- 에피소드 실행 계약
- 저장 실패 계약
- 시각 검수 계약
- 접근성 검수 계약
- 에셋 manifest 계약
- 출판 변환 adapter 계약

## 2. 구현 티켓

| ID | 티켓 | 목표 |
| --- | --- | --- |
| T-01 | `/math-city` route shell | GitHub Pages base path에서도 직접 진입 가능한 게임 입구 구현 |
| T-02 | TypeScript game boundary | 기존 landing 전체 변환 없이 수학도시 경계만 타입 계약 적용 |
| T-03 | Registry schema | 에피소드, 능력, 단서, 지도, 에셋, 변환 데이터를 단일 registry로 묶음 |
| T-04 | Registry validator | 중복 id, orphan reference, 금지 필드, 미구현 task type 차단 |
| T-05 | Progress schema | 브라우저 저장용 진행 데이터 구조와 기본값 확정 |
| T-06 | Progress store | load, save, reset, migrate, sanitize를 저장소 단일 경계로 격리 |
| T-07 | Storage failure mode | 저장 불가, 깨진 JSON, quota 실패, private mode에서도 플레이 유지 |
| T-08 | Quest engine | story beat, task beat, reward beat, cliffhanger 흐름 실행 |
| T-09 | Task renderer set | `storyChoice`, `mathChoice`, `dragArrange` 3종 구현 |
| T-10 | Drag alternative | 끌기 과제를 버튼/선택 방식으로도 완료 가능하게 구현 |
| T-11 | World state resolver | 저장된 완료 id에서 지도 장소 상태를 계산 |
| T-12 | Ability and clue surfaces | 능력 도감, 단서장, 완료 보상 화면 구현 |
| T-13 | Asset manifest | URL 직접 참조 금지, asset id 기반 해석, 누락 에셋 검증 |
| T-14 | Format adapters | 스토리북, 워크북, 활동지 변환에 필요한 필드와 산출 구조 고정 |
| T-15 | Browser smoke path | 첫 진입, 에피소드 완료, 새로고침, 초기화, 직접 URL 진입 검증 |
| T-16 | Accessibility smoke path | 키보드, 큰 글자, 모션 축소, 끌기 대체 조작 검증 |
| T-17 | Visual smoke path | 주요 화면 폭에서 blank, overflow, 텍스트 겹침, 버튼 눌림 영역 검증 |
| T-18 | Content contract fixture | 시계탑 1편을 실제 registry 데이터로 작성해 모든 계약을 통과시킴 |

## 3. 티켓별 인수조건

### T-01 `/math-city` route shell

- `/math-city`와 `/codaro/math-city` 직접 진입이 빈 화면이 아니다.
- 새로고침해도 route가 유지된다.
- 기존 landing 첫 화면 bundle에 게임 전체 데이터가 강제로 실리지 않는다.
- route 실패 시 기존 landing 화면까지 깨지지 않는다.

### T-03 Registry schema

- registry에는 사용자별 상태가 들어가지 않는다.
- 에피소드 문장, 선택지, 정답, 보상, 단서, 에셋 참조는 JSX가 아니라 registry에서 온다.
- 공개 id는 rename하지 않는 전제로 문서화된다.
- `contentVersion` 변경은 진행 초기화 사유가 아니다.

### T-04 Registry validator

- 중복 id를 실패 처리한다.
- 없는 ability, clue, place, asset, sceneObject 참조를 실패 처리한다.
- 출석, 랭킹, 랜덤 보상, 광고 보상 필드가 있으면 실패 처리한다.
- 구현되지 않은 task type이 들어오면 실패 처리한다.
- 모든 에피소드가 앱, 스토리북, 워크북, 활동지 adapter 필드를 가진다.

### T-06 Progress store

- `progressStore` 외부에서 `localStorage`를 직접 접근하지 않는다.
- load, save, reset, migrate, sanitize 책임이 분리된다.
- unknown id는 제거되고 deprecated id는 replacement id로 복구된다.
- 중복 완료 id는 하나로 정리된다.
- 설정값은 sound, reducedMotion, largeText만 저장한다.

### T-07 Storage failure mode

- 저장소 접근 실패 시 앱이 죽지 않는다.
- 저장 실패 안내는 짧고 아이에게 책임을 돌리지 않는다.
- 저장이 안 되는 상태에서도 에피소드 1개는 끝까지 플레이 가능하다.
- 깨진 저장값은 기본 상태로 복구된다.
- 저장 초기화 버튼은 키보드만으로 접근 가능하다.

### T-08 Quest engine

- 에피소드는 intro, story question, task, reward, cliffhanger 흐름을 가진다.
- 정답 판정은 화면 컴포넌트가 아니라 engine/domain 계층에서 수행한다.
- 오답은 벌점이 아니라 오개념 반응과 힌트로 연결된다.
- 완료 처리 시 episode, ability, clue, worldState가 중복 없이 반영된다.

### T-09 Task renderer set

- `storyChoice`는 상황 이해 질문을 처리한다.
- `mathChoice`는 계산 또는 개념 선택을 처리한다.
- `dragArrange`는 직접 조작과 대체 조작을 모두 제공한다.
- 모든 task는 정답, 오답, 힌트, 완료 상태를 시각적으로 구분한다.

### T-13 Asset manifest

- runtime 데이터는 직접 URL이 아니라 asset id만 가진다.
- 모든 asset id는 manifest에 존재해야 한다.
- manifest에는 용도, 포맷, 대체 텍스트 필요 여부, preload 여부가 있다.
- 누락 에셋은 빌드 전 검증에서 잡힌다.
- 핵심 수학 오브젝트는 통 bitmap 하나로 고정하지 않는다.

### T-14 Format adapters

- 시계탑 에피소드는 앱 화면 외에 스토리북 8-12쪽 구조로 변환 가능하다.
- 같은 원천에서 워크북 4쪽 구성이 나온다.
- 같은 원천에서 15분 활동지 구성이 나온다.
- 변환 adapter는 화면 컴포넌트에 의존하지 않는다.

## 4. Gate 목록

| Gate | 실패 조건 |
| --- | --- |
| `math-city-contract` | registry schema 오류, id 참조 오류, 금지 필드, 미구현 task type |
| `math-city-storage` | 깨진 저장값 처리 실패, migration 실패, 저장 실패 시 앱 중단 |
| `math-city-browser` | route 직접 진입 실패, 완료 흐름 실패, reload/reset 실패 |
| `math-city-accessibility` | 키보드 완료 불가, 끌기 대체 없음, 큰 글자 overflow, 모션 축소 실패 |
| `math-city-visual` | 360/390/414/768/1280 폭에서 blank, 겹침, 잘림, 클릭 불가 |
| `math-city-assets` | 누락 asset id, 직접 URL 참조, 대체 정보 누락 |
| `math-city-format` | storybook/workbook/teacher adapter 필수 필드 누락 |

## 5. 구현 착수 체크리스트

아래 항목이 문서에 닫힌 상태에서만 구현 착수로 본다.

- `/math-city` route와 GitHub Pages base path 계약
- registry 필수 필드와 금지 필드
- progress 저장 schema와 migration 정책
- 저장 실패 시 사용자 경험
- 시계탑 1편의 실제 Episode Pack
- task type 3종의 화면, 판정, 힌트 계약
- 끌기 대체 조작 계약
- asset manifest 구조
- visual smoke viewport 목록
- accessibility smoke 완료 조건
- storybook, workbook, teacherSheet 변환 필드
- gate별 실패 조건과 완료 판정

판정:

```text
위 체크리스트가 닫히면 PRD는 제작 착수 가능한 상태다.
그 전까지는 방향은 강하지만, 제작 잠금 문서는 아직 미완성이다.
```
