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

## 4계층 구조

```
taxonomy (SSOT YAML)
  ↓
lessonGraph (outcome 매핑 + prerequisite DAG)
  ↓
planComposer (결정적 합성 — BFS 백워드 expansion + Kahn 위상정렬)
  ↓
{REST API, teacher tools, MasterPlanPanel UI}
```

## SSOT — `curricula/python/_taxonomy.yml`

세 가지 vocabulary를 한 파일에 둔다.

- **outcomes**: 학생이 한 레슨을 마치고 얻는 단위 능력. ID는 `<도메인 prefix>.<능력명>` lowerCamelCase. 예: `python.variables`, `pandas.aggregate`, `automation.browser.session`.
- **domains**: 학습자가 실제로 달성하려는 실무 목표. `targetOutcomes` 배열이 도메인을 충족하기 위해 필요한 outcome 집합.
- **lessonOutcomes**: `<category>/<contentId>` 키별 backfill. 레슨 YAML 메타에 `outcomes`/`prerequisites`가 있으면 그 쪽이 우선, 없으면 여기 값으로 채운다.

새 레슨을 만들 때 권장 순서:
1. 필요한 outcome/domain이 없으면 `_taxonomy.yml`에 먼저 추가
2. 레슨 YAML `meta`에 `outcomes`/`prerequisites`/`estimatedMinutes` 적기 (권장) 또는 `lessonOutcomes`에 등록
3. `tests/testCurriculumOs.py`가 그래프 무결성을 검증

## planComposer 알고리즘

결정적(deterministic). 같은 입력이면 같은 plan을 낸다.

1. **목표 outcome 해석** — `goal.domain.targetOutcomes ∪ goal.outcomes`
2. **Backward expansion** — 각 target outcome에 대해 best lesson을 선택하고, 그 레슨의 prerequisite outcomes를 큐에 다시 넣는 BFS. 카테고리 우선순위 + sortKey 휴리스틱.
3. **위상 정렬** — 선택된 레슨 사이의 prerequisite 의존을 그래프로 만들고 Kahn's algorithm으로 정렬. 사이클이 있으면 sortKey fallback.
4. **완료 필터** — `progressTracker`에서 `completedAt`이 있는 레슨 제외 (옵션).
5. **Gap 리포트** — provider 레슨이 없는 outcome은 `PlanGap`으로 분리 반환.

`PRIMARY_CATEGORY_ORDER`에 카테고리 우선순위가 명시되어 있다 (기초가 앞).

## API 계약

| Endpoint | Method | Payload | 반환 |
|---|---|---|---|
| `/api/curriculum/taxonomy` | GET | — | `{outcomes, domains}` |
| `/api/curriculum/master-plan` | POST | `{domain?, outcomes?, excludeCompleted?, excludeKeys?}` | `MasterPlan` (steps, gaps, totalMinutes, summary) |
| `/api/curriculum/gaps` | GET | `?domain=` (옵션) | `{gaps: [{domainId, domainLabel, missing}]}` |

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

`SurfaceMode = "plan"`이 별도 surface로 등록되어 있고, 사이드바 네비에 "마스터 플랜" 항목이 있다. [`masterPlanPanel.tsx`](../../../editor/src/components/curriculum/masterPlanPanel.tsx):
- 도메인 칩 선택 → 자동 plan 합성
- step 클릭 → `selectCurriculumCategory/Content` → 해당 레슨으로 이동
- gap에 "초안 요청" 버튼 → chat surface로 이동하면서 propose-curriculum-draft 프롬프트 자동 입력

## 무결성 게이트

`tests/testCurriculumOs.py`에 24개 케이스:
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
- orphanInPlan, noExercise, exerciseWithoutCheck, noHint, shortGoal 신호를 lesson 단위로 점검
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
