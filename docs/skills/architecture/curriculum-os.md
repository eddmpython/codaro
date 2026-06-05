---
id: curriculum-os
title: Curriculum OS — 학습 경로 합성
description: 학습 커리큘럼을 outcome 그래프 + prerequisite DAG로 끌어올려 학습 경로를 합성하는 레이어.
category: architecture
section: reference
order: 215
purpose: 사용자/teacher가 도메인을 지정하면 prerequisite을 따라 레슨 순서를 짜고, 커버되지 않는 outcome은 gap으로 리포트한다.
whenToUse: 새 학습 도메인을 정의하거나, 자동 학습 경로 합성/teacher tool을 추가/검토할 때.
---

# Curriculum OS

학습 커리큘럼을 단순 카테고리 트리에서 **outcome 그래프**로 끌어올린 레이어다. 사용자/teacher가 도메인(목적)을 지정하면 prerequisite을 따라 레슨 순서를 짜고, 커버되지 않는 outcome은 gap으로 리포트한다. Skill OS가 "도구 선택"이라면, Curriculum OS는 "학습 경로 합성"이다.

## 5계층 구조 (Phase 1~3 완성형)

```
taxonomy (SSOT YAML — outcomes/domains/lessonOutcomes/sectionOutcomes/lessonRole)
  ↓
lessonGraph (outcome 매핑 + prerequisite DAG + section/role 메타)
  ↓
engine (composer + reviewScheduler + outcomeCredit + outcomeMastery + analyticsTimeline + learnerStateBridge)
  ↓
{REST API, teacher tools}
  ↓
UI surfaces (MasterPlanPanel + MasteryPanel + TodayReviewsCard + AnalyticsPanel)
```

## SSOT — `curricula/python/_taxonomy.yml`

세 가지 vocabulary를 한 파일에 둔다.

- **outcomes**: 학생이 한 레슨을 마치고 얻는 단위 능력. ID는 `<도메인 prefix>.<능력명>` lowerCamelCase. 예: `python.variables`, `pandas.aggregate`, `automation.browser.session`.
- **domains**: 학습자가 실제로 달성하려는 실무 목표. `targetOutcomes` 배열이 도메인을 충족하기 위해 필요한 outcome 집합.
- **lessonOutcomes**: `<category>/<contentId>` 키별 backfill. 레슨 YAML 메타에 `outcomes`/`prerequisites`가 있으면 그 쪽이 우선, 없으면 여기 값으로 채운다.
- **sectionOutcomes** (Phase 2b): 같은 항목 안의 dict — `{sectionId: [outcome, ...]}`. 다중 outcome lesson 에서 어느 섹션이 어느 outcome 을 검증하는지 매핑한다. 미지정 시 lesson outcomes 전체로 fallback.
- **lessonRole** (Phase 2d): `concept | practice | project`. project 는 deliverable-driven plan 합성 시 우측 칼럼에 배치되는 마지막 lesson.

새 레슨을 만들 때 권장 순서:
1. 필요한 outcome/domain이 없으면 `_taxonomy.yml`에 먼저 추가
2. 레슨 YAML `meta`에 `outcomes`/`prerequisites`/`estimatedMinutes` 적기 (권장) 또는 `lessonOutcomes`에 등록
3. `tests/curriculum/testCurriculumOs.py`가 그래프 무결성을 검증

## planComposer 알고리즘

결정적(deterministic). 같은 입력이면 같은 plan을 낸다.

1. **목표 outcome 해석** — `goal.domain.targetOutcomes ∪ goal.outcomes`
2. **projectIntent 매칭** (Phase 2d) — 한국어/영어 키워드를 통해 카테고리 boost, 매칭된 project lesson 들의 outcomes 도 target 에 추가.
3. **skipMasteredOutcomes 필터** (Phase 1) — `MASTERY_THRESHOLD` 이상 outcome 은 target/expansion 모두 차단.
4. **Backward expansion** — 각 target outcome에 대해 best lesson을 선택하고, 그 레슨의 prerequisite outcomes를 큐에 다시 넣는 BFS. 카테고리 우선순위 + sortKey 휴리스틱.
5. **project lesson 강제 포함** (Phase 2d) — projectIntent 매칭 시 backward expansion 이 입문 lesson 으로 같은 outcome 을 cover 했더라도 deliverable lesson 까지 도달.
6. **위상 정렬** — 선택된 레슨 사이의 prerequisite 의존을 그래프로 만들고 Kahn's algorithm으로 정렬. 사이클이 있으면 sortKey fallback.
7. **완료 필터** — `progressTracker`에서 `completedAt`이 있는 레슨 제외 (옵션).
8. **deliverableOnly 분리** (Phase 2d) — mastery>=0.6 인 outcome 만으로 구성된 concept lesson 은 `droppedSteps` 로.
9. **maxMinutes cropping** (Phase 2a) — prerequisite 순서 유지하며 시간 예산 초과 step 을 `droppedSteps` 로.
10. **3단 분리** (Phase 2d) — `lessonRole` 기준으로 `conceptSteps / practiceSteps / projectSteps` 합성.
11. **Gap 리포트** — provider 레슨이 없는 outcome은 `PlanGap`으로 분리 반환 (`gaps`), 학습자 mastery 가 낮으면 `dynamicGaps`.

`PRIMARY_CATEGORY_ORDER`에 카테고리 우선순위가 명시되어 있다 (기초가 앞).

## Phase 2b — Outcome Credit & Review

체크 통과를 outcome 숙련도 신호로 변환:

- `outcomeCredit.py`: weight 매핑 (hintLevel 0 → 1.0, 1 → 0.7, 2 → 0.5, 3 → 0.3, 그 외 0.2).
- `progress.py`: `outcomeCredits`, `autoValidatedOutcomes`, `sectionResults` 필드. `creditCheckPass(category, contentId, sectionId, outcomes, hintLevel)` 가 누적.
- 3 회 이상 credit + 평균 weight ≥ 0.7 → outcome 자동 검증 (`autoValidatedOutcomes`).
- `outcomeMastery.computeMastery`: lesson contribution + credit contribution 을 같은 확률 합성에 넣음. 시간 감쇠 half-life 30 일 (Phase 2c).

## Phase 2c — Review Scheduling

SM-2 lite — binary success/lapse 로 다음 review interval 결정:

- `reviewScheduler.py`: `ReviewState (interval, ease 1.3~2.5, streak, nextReviewAt, lastResult)`, init/updateOnSuccess/updateOnLapse/isDue.
- `progress.completeMission()` 가 lesson 완료 첫 순간 자동으로 `ReviewState` 생성.
- `/api/curriculum/reviews` / `/api/curriculum/reviews/{cat}/{id}` 엔드포인트.
- mastery decay: `_decayedContribution(base, lastTouched)` — half-life 30일, floor 0.25.

## Phase 3 — Analytics & Bridge

학습 패턴을 시간축으로 + 두 mastery source 통합:

- `analyticsTimeline.py`: 일별 `DailySnapshot` (masteredCount, lessons/sections/credits today, hintHistogram, domainsTouched). JSONL append-only, idempotent per day.
- `learnerStateBridge.py`: `outcomeMastery` (progress 합성) 와 `learnerState` (EMA SQLite) 를 0.6/0.4 blend 한 `UnifiedOutcomeMastery`. 두 저장소는 합치지 않음 — 합성 view 만.
- `/api/curriculum/analytics` / `/analytics/summary` / `/mastery/unified` 엔드포인트.

## API 계약

| Endpoint | Method | Payload | 반환 |
|---|---|---|---|
| `/api/curriculum/taxonomy` | GET | — | `{outcomes, domains}` |
| `/api/curriculum/master-plan` | POST | `{domain?, outcomes?, excludeCompleted?, excludeKeys?, skipMasteredOutcomes?, maxMinutes?, projectIntent?, deliverableOnly?}` | `MasterPlan` (steps, gaps, droppedSteps, conceptSteps/practiceSteps/projectSteps, projectMatches, totalMinutes, summary) |
| `/api/curriculum/gaps` | GET | `?domain=` (옵션) | `{gaps: [{domainId, domainLabel, missing}]}` |
| `/api/curriculum/mastery` | GET | — | `MasteryReport` (outcomes, domains, masteredOutcomeCount, totalOutcomeCount) |
| `/api/curriculum/mastery/unified` | GET | — | `UnifiedMasteryReport` (progress + learnerState blend) |
| `/api/curriculum/outcomes/validate` | POST | `{outcomeId, validated}` | toggle 결과 |
| `/api/curriculum/check` | POST | `{... category?, contentId?, sectionId?}` | `CheckResult` + `creditedOutcomes` + `autoValidatedOutcomes` |
| `/api/curriculum/reviews` | GET | — | `{reviews, totalDue}` |
| `/api/curriculum/reviews/{cat}/{id}` | POST | `{success}` | updated `ReviewState` |
| `/api/curriculum/analytics` | GET | `?days=30` | `{snapshots, totalSnapshots}` |
| `/api/curriculum/analytics/summary` | GET | — | 30 일 집계 |

unknown domain/outcome ID는 400 + `curriculum_unknown_domain` / `curriculum_unknown_outcome`.

## Teacher 도구

[teacher-tool-loop](teacher-tool-loop.md)에 등록된 7개:

| 도구 | 용도 |
|---|---|
| `list-curriculum-domains` | 도메인/outcome 카탈로그 |
| `resolve-learning-goal` | 자연어 → 도메인 후보 랭킹 |
| `search-curricula` | 키워드/카테고리/outcome 기준 레슨 검색 |
| `compose-master-plan` | 도메인/outcome → 순서대로 정렬된 레슨 plan |
| `inspect-curriculum` | 특정 레슨의 meta/intro 조회 |
| `list-curriculum-gaps` | 도메인별 미충족 outcome 리포트 |
| `propose-curriculum-draft` | 갭을 채울 새 강의 **초안만** 반환 (사람이 검토·작성) |

> **bulk generation 금지**: `propose-curriculum-draft`는 outline + 메타데이터만 돌려준다. 실제 강의 YAML은 사람이 작성한다 ([CLAUDE.md](../../../CLAUDE.md), `feedback_curriculum_no_bulk_generation`).

## 프론트엔드

세 가지 surface 가 등록되어 있다.

- `SurfaceMode = "plan"` — [`masterPlanPanel.tsx`](../../../editor/src/components/curriculum/masterPlanPanel.tsx):
  - 도메인 칩 선택 → 자동 plan 합성
  - 시간 예산 / 이미 익힌 능력 건너뛰기 토글
  - projectIntent 텍스트 입력 → deliverableOnly 자동 활성 + 매칭 키워드 chip + 단일↔3단 뷰 토글
  - 3단 뷰 (`TieredPlanBody`): 개념(zinc) → 실습(sky) → 프로젝트(emerald) 칼럼
  - `TodayReviewsCard`: 오늘 due review 리스트 + 통과/실패 버튼
  - `MasteryPanel`: outcome 별 progress + credit count + 자동/수동 검증 토글
  - step 클릭 → `selectCurriculumCategory/Content` → 해당 레슨
  - gap "초안 요청" 버튼 → chat surface + propose-curriculum-draft 자동 입력
- `SurfaceMode = "analytics"` — [`analyticsPanel.tsx`](../../../editor/src/components/curriculum/analyticsPanel.tsx):
  - mastered/30일 lessons/sections/credits stat 카드 4 개
  - SVG mastery 추세 라인 차트
  - 힌트 분포 바 차트
  - 최근 활동 도메인 chip
- 체크 통과 시 [`checkResultPanel.tsx`](../../../editor/src/components/curriculum/checkResultPanel.tsx) 가 credit 카드를 그린다 — outcome chip 에 자동 검증된 outcome 은 Trophy 아이콘으로 강조.

## 무결성 게이트

`tests/curriculum/testCurriculumOs.py`에 24개 케이스:
- 모든 domain.targetOutcomes가 outcome 카탈로그에 존재
- 모든 lessonOutcomes의 outcomes/prerequisites가 카탈로그에 존재
- 레슨 메타의 outcomes가 taxonomy backfill보다 우선
- 합성기가 prerequisite 순서를 지킴
- 완료된 레슨이 plan에서 제외됨
- gap이 정확히 리포트됨
- 모든 레슨이 plan 그래프에서 보임 (orphan 0개)
- 모든 outcome이 어떤 레슨에서 제공됨 (115/115)
- 모든 도메인이 비어있지 않은 plan을 만듦 (27/27 도메인, gap 0)
- 같은 입력은 같은 plan을 낸다 (결정성 스냅샷)
- API 엔드포인트 통합 테스트 (FastAPI TestClient)

`tests/auditCurriculumWeakness.py`가 영구 게이트로 등록되어 있다 (`tests/run.py gate curriculum-weakness-audit`):
- 정적 신호: `orphanInPlan`, `noExercise` (intro `00_*` 제외), `exerciseWithoutCheck`, `noHint`, `shortGoal`, `sectionIdMissing` (Phase 2b)
- 카테고리 신호: `categoryWithoutProject` (Phase 2d, builtins/excel/practical 면제)
- 각 신호별 임계치(현재 모두 0)를 넘으면 게이트 실패
- 리포트: `output/test-runner/curriculum-weakness-audit/curriculum-weakness-report.json`

## 확장 가이드

새 도메인 추가:
1. `_taxonomy.yml`의 `domains:`에 항목 추가 — id, label, description, targetOutcomes
2. targetOutcomes에 들어가는 outcome이 모두 존재하는지 확인
3. 해당 outcome을 제공하는 레슨이 없으면 gap으로 리포트됨 — `list-curriculum-gaps`로 확인
4. 갭을 채우려면 새 강의를 직접 작성 (생성기 스크립트 금지)

새 outcome 추가:
1. `outcomes:`에 항목 추가
2. 어느 레슨이 이 outcome을 제공하는지 `lessonOutcomes`에 매핑 — 또는 그 레슨 YAML의 `meta.outcomes`에 등록
3. 이 outcome을 prerequisite으로 갖는 다른 레슨이 있다면 cycle이 생기지 않게 확인

캐시는 lazy — 첫 호출 시 로드, 이후 메모리 보존. 핫 리로드는 `CurriculumOsCache.invalidate()`.
