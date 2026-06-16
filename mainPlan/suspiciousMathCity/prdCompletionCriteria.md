# PRD 완성 판정

## 1. 현재 판정

현재 PRD 묶음은 `production lock v1`로 둔다. 의미는 다음과 같다.

```text
제품 방향은 확정됐고,
첫 Product Core Slice를 구현 가능한 수준으로 잠갔으며,
시계탑 Episode Pack과 인수조건을 기준으로 바로 작업 티켓을 만들 수 있다.
```

단, 이것은 제품 출시 완료가 아니다. 앱 구현, 브라우저 검증, 접근성 검증, visual smoke를 통과해야 출시 가능 상태가 된다.

## 2. 완성으로 인정하는 범위

| 범위 | 상태 | 근거 |
| --- | --- | --- |
| 제품 정의 | 완료 | [prd.md](prd.md) |
| 개인정보 없음 | 완료 | [prd.md](prd.md), [operationsPrd.md](operationsPrd.md) |
| 학습 설계 | 완료 | [learningDesign.md](learningDesign.md), [curriculumMatrix.md](curriculumMatrix.md) |
| 교과 연계 | 완료 | [standardsAlignment.md](standardsAlignment.md) |
| 세계관 캐논 | 완료 | [ipCanon.md](ipCanon.md), [storyBible.md](storyBible.md) |
| 스택 결정 | 완료 | [technicalStackAdr.md](technicalStackAdr.md) |
| 시계탑 Episode Pack | 완료 | [clocktowerEpisodePack.md](clocktowerEpisodePack.md) |
| 화면/에셋 제작 잠금 | 완료 | [coreSliceProductionLock.md](coreSliceProductionLock.md) |
| 구현 인수조건 | 완료 | [implementationAcceptanceCriteria.md](implementationAcceptanceCriteria.md) |
| 품질 루브릭 | 완료 | [contentQualityRubric.md](contentQualityRubric.md) |
| 출판 변환 | 완료 | [publishingFormatMatrix.md](publishingFormatMatrix.md), [crossMediaPrd.md](crossMediaPrd.md) |

## 3. 아직 출시 완료가 아닌 이유

PRD가 완성권에 들어간 것과 제품이 완성된 것은 다르다. 아래는 구현 후에만 닫힌다.

- `/math-city` route 구현.
- TypeScript game boundary 구성.
- 실제 registry와 progressStore 구현.
- 시계탑 장면 SVG/HTML 조작 구현.
- `localStorage` 실패 경로 확인.
- 키보드만으로 에피소드 완료 확인.
- 360px, 390px, 414px, 768px, 1280px viewport 확인.
- 스토리북/워크북/활동지 adapter가 실제 데이터에서 산출되는지 확인.

## 4. PRD가 더 이상 흔들리면 안 되는 결정

아래 결정은 구현 중 기본값으로 유지한다.

| 결정 | 잠금 |
| --- | --- |
| 배포 | GitHub Pages 정적 route |
| 저장 | 브라우저 `localStorage`만 사용 |
| 개인정보 | 이름, 학년, 학교, 보호자 정보, 원격 학습 기록 저장 금지 |
| 게임 방식 | React/Vite + TypeScript 경계 + SVG/HTML 조작 |
| 그래픽 | 핵심 오브젝트는 통 bitmap 금지, 상태 있는 SVG/HTML 우선 |
| 몰입 | 출석, 순위, 랜덤 보상, 광고 보상 금지 |
| 첫 기준 | 시계탑 1편이 약하면 에피소드 수를 늘리지 않음 |
| 확장 | 같은 Episode Pack에서 앱, 도서, 워크북, 활동지 파생 |

## 5. 다음 단계 판정

다음 단계는 추가 기획이 아니라 구현 착수다.

```text
Phase 1 진입 조건:
시계탑 Episode Pack, 제작 잠금표, 구현 인수조건을 기준으로
/math-city route와 registry fixture부터 구현한다.
```

Phase 1을 완료했다고 말하려면 아래가 통과해야 한다.

1. 시계탑 에피소드가 실제 브라우저에서 처음부터 끝까지 진행된다.
2. 완료 후 시간 렌즈, 제로 단서, 시계탑 복구 상태가 저장된다.
3. 저장을 지워도 다시 시작 가능하다.
4. 저장이 막혀도 현재 플레이가 멈추지 않는다.
5. 큰 글자와 모션 줄이기에서 같은 흐름이 완료된다.
6. 10분 조각 과제는 끌기 없이도 완료된다.
7. 첫 에피소드 데이터가 React 화면에 박히지 않고 registry에서 나온다.
8. storybook, workbook, teacherSheet adapter 필드가 채워진다.
