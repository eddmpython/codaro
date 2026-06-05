---
id: teacher-tool-loop
title: Teacher Tool Loop
description: Skill-guided loop for turning chat requests into curriculum cells, runtime checks, and dependency preparation.
category: architecture
section: teacher-engine
order: 208
purpose: 채팅 요청을 답변 텍스트가 아니라 커리큘럼 YAML, 셀 조작, 실행 검증, 라이브러리 준비로 전개하는 절차를 고정한다.
whenToUse: provider 응답 루프, tool call 표시, 셀 수정 절차, 패키지 준비 절차, 커리큘럼 생성 흐름을 바꿀 때.
---

# Teacher Tool Loop

Codaro의 채팅은 답변 창이 아니라 **skill-guided tool loop**의 입구다. 사용자가 학습이나 자동화를 요청하면 provider는 바로 긴 설명을 쓰지 않고, 아래 절차로 제품 상태를 바꾼다.

## 절차

1. **요청 분류**
   - 단순 질문이면 짧게 답한다.
   - 학습 요청이면 바로 curriculum YAML을 만들지 않고, intake로 목표 축을 모은 뒤 기존 커리큘럼 추천·조합을 먼저 실행한다.
   - 학습 요청이 너무 모호하면 provider를 호출하지 않고 deterministic clarification gate에서 먼저 멈춘다. 수준, 깊이, 환경, 실습/설명 비중 중 결과를 바꿀 핵심 질문만 최대 1-3개 묻는다.
   - 답이 없으면 바로 생성했다고 느껴지지 않도록, 먼저 되묻고 현재 작업 기준을 clarification plan/workloop에 남긴다.
   - clarification gate가 멈춘 대화는 `pendingClarification`으로 `assumptions` payload를 대화 상태에 저장한다. 다음 턴에서 사용자가 `진행`하거나 수준/깊이/환경/실습 비중을 짧게 답하면 이 payload를 `[Clarification plan]`으로 provider prompt에 주입하고 한 번 소비한다. `취소`, `새로`, `다른 주제`처럼 새 요청으로 보이는 턴이나 `초급 pandas 실습 중심 짧은 레슨 만들어줘`처럼 독립적인 새 학습 요청에는 주입하지 않고 stale pending을 비운다. 이전 assistant 텍스트만 다시 읽게 만들거나 무관한 다음 요청에 기준을 섞으면 실패다.
   - **Intake — 대화 누적 후 시작**: `intakePolicy`가 대화 이력에서 핵심 축(수준/범위/실습 비중)을 누적한다. 한 번에 몰아 묻지 않고 `gather` 턴마다 빠진 축 하나만 되묻고, 축이 2개 이상 모이거나 사용자가 `진행`하거나 최대 2회 되물으면 `act`로 전환해 시작한다. 신호 누적은 대화 이력에서 도출하므로 별도 상태 저장이 없고, 저장된 메시지의 `[Clarification plan]` 컨텍스트는 떼고 축을 센다. gather 턴은 `clarification-gate` trace에 `intakeProgress`(`collected/total`, `nextAxis`)를 실어 workloop에 `학습 목표 파악 · 목표 N/3 · 다음: <축>`으로 보인다.
   - **추천·조합 우선 (goal-discovery)**: 목표가 분명해진 `act` 턴은 새로 만들기 전에 먼저 기존 커리큘럼을 추천·조합한다. `resolve-learning-goal`로 목표를 도메인으로 매핑하고, `search-curricula`로 기존 레슨을 찾고, `compose-master-plan`으로 순서가 잡힌 학습 경로를 조합한다. 기존 레슨이 목표를 덮지 못하는 갭일 때만 `write-curriculum-yaml`로 새 레슨을 작성한다. 이 행동 지침은 `[Intake]`로 provider prompt에 주입되고 `goal-discovery` skill로 등록되어 있다. 진행 중에는 무엇을 찾고 무엇을 추천·조합·작성하는지 workloop에 한 줄로 보인다.
   - 셀 수정/답 확인이면 현재 cell map에서 대상 셀을 고른다.
   - 자동화 요청이면 `automation-authoring-loop` 기준으로 recipe, automation 셀, dry-run, task 등록 흐름으로 보낸다.
   - skill registry의 required tool은 등록된 tool과 manifest metadata를 기준으로 검증한다.

2. **Cell Map 확인**
   - 모든 셀은 `type`, `role`, `displayKind`, `executionKind`, `title`, `purpose`, `resultStatus`를 가진다.
   - 타이틀/설명 셀에는 실행 코드를 쓰지 않는다.
   - 스니펫 셀은 예제 표시용이다. 학생 입력은 별도 연습 입력 영역 또는 exercise 셀에 둔다.
   - exercise 셀은 학습자가 직접 수정/작성하는 공간이다.
   - check 셀은 답 확인, 실행 결과 검증, 변수 확인에 쓴다.
   - automation 셀은 OS, 브라우저, 마우스, 이미지, task 흐름에 쓴다.

3. **Dependency Preflight**
   - Codaro 기본 의존성은 제품 실행에 필요한 최소 패키지만 둔다. 커리큘럼 주제별 패키지는 레슨 YAML의 `meta.packages`와 현재 문서 import 추론으로만 판단한다.
   - 외부 라이브러리가 필요한 흐름이면 실행 전에 `packages-check`를 호출한다.
   - `packages-check` 결과의 `missing`이 비어 있으면 바로 다음 단계로 간다.
   - 누락이 있으면 `packages-install`을 누락 패키지별로 호출한다.
   - 누락 패키지가 설치 성공으로 기록되기 전에는 `cell-call` lane 도구(`cell-call`, `execute-reactive`, `check-exercise`)로 넘어가지 않는다.
   - `packages-install`은 workspace `.venv`를 대상으로 `uv pip` 경로만 사용한다. 직접 `pip` 실행 경로를 추가하지 않는다.
   - 학습자에게는 패키지 설치 세부 로그보다 "필요한 도구를 uv로 준비 중"이라고 보여주고, 실패 시 첫 오류 줄을 바로 노출한다.
   - 새 커리큘럼을 만들 때는 설치 설명을 독립 문서로 빼지 않고 소개/첫 실행 섹션에 "라이브러리 확인 → uv 준비 → 작은 코드 검증" 흐름으로 포함한다.

4. **Gap YAML 전개**
   - 추천·조합 뒤 실제 gap으로 판정된 학습 요청만 `meta`, `intro`, `sections` 구조의 YAML로 설계한다.
   - 신규 YAML은 structured section contract를 우선한다. `sections[].blocks[]`는 기존 curriculum 호환용이다.
   - 커리큘럼 작성 세부 기준은 `docs/skills/architecture/curriculum-authoring.md`를 따른다.
   - provider system prompt, teacher skill registry, `write-curriculum-yaml` tool schema는 모두 신규 레슨에서 `sections[].blocks[]` 대신 `intro.diagram.steps`, `intro.diagram.runtime`, `title/subtitle/goal/why/explanation/tips/snippet/exercise/check` fields를 쓰도록 안내해야 한다.
   - 섹션 하나가 학습카드 하나다. 한 개념을 작은 카드 여러 개로 쪼개 반복하지 않는다.
   - `meta.packages`는 패키지 preflight의 1차 입력이다.
   - YAML을 만들면 반드시 `write-curriculum-yaml`로 materialize한다.
   - `create-guide`, `create-learning-card`, `create-quiz`, `create-notebook-exercise`는 기존/단일 실습 보조용이다. 신규 전체 레슨은 이 도구들로 작은 카드 묶음을 만들지 않고 `write-curriculum-yaml`을 쓴다.
   - materialize 결과 document는 `나만의 커리큘럼`에 저장되어 커리큘럼 화면에서 열린다.

5. **Cell 단위 조작**
   - 읽기는 `read-cells`.
   - 수정/삽입/삭제는 `write-cell`.
   - 실행/검증은 `cell-call`.
   - 하위 호환이 필요할 때만 `execute-reactive`, `check-exercise`를 직접 쓴다.

6. **Automation Authoring**
   - 자동화 작성은 curriculum YAML 대신 percent-format Python recipe를 기준으로 한다.
   - 현재 문서를 `read-cells`로 확인한 뒤 `write-automation-recipe`로 `# %% [markdown]` 설명 셀과 `# %% [automation]` 실행 셀을 만든다.
   - 기본 실행 모드는 `dry-run`이다. 외부 입력, 클릭, 파일 쓰기, 알림 전송은 검토 전 실동작으로 시작하지 않는다.
   - 필요한 패키지는 `packages-check → packages-install → cell-call` 순서를 지킨다.
   - 검증된 recipe만 `create-automation-task`로 등록한다.
   - 세부 기준은 `docs/skills/architecture/automation-authoring-loop.md`를 SSOT로 본다.

7. **Workloop 표시**
   - 대화 표면은 tool lifecycle을 숨기지 않는다.
   - `tool_start`가 오면 "처리 중 · {작업명}"으로 표시한다.
   - `tool_results`가 오면 각 tool row를 done/error로 갱신한다.
   - 단계는 `lane`/`category` 기준으로 묶어 보여주고, 오류가 있는 그룹은 바로 식별 가능해야 한다.
   - 노트북/커리큘럼 작성 중에는 "YAML을 섹션 카드와 실행 셀로 변환", "{blockId} 셀 내용 반영", "{package}를 uv로 설치"처럼 현재 상태를 문장으로 보여준다.
   - tool result가 도착하면 시작 문장을 그대로 두지 않고 결과 문장으로 갱신한다. 예: `pandas 기초 · 섹션 카드 2개 · 실습 셀 2개 · 실행 패키지 1개 · 에디터 반영`, `pandas 설치 완료 · uv · project .venv · 42ms`.
   - `clarification-gate`, `tool-policy-violation`, `turn-error`도 사용자용 `trace.workloop` row로 변환한다. 사용자는 작업 전 질문, 정책 차단, provider 오류를 raw JSON 없이 먼저 이해할 수 있어야 한다.
   - clarification workloop detail은 질문 수만 쓰지 않고 실제 작업 기준 요약을 포함한다. 예: `핵심 질문 3개 · 작업 기준: 초급-중급 사이 / 실습 중심 / 현재 Codaro 로컬 Python과 uv 패키지 설치`.
   - 프론트 `workLoop` state는 도구 row와 중복되지 않는 `clarification-gate`/`turn-error`를 메인 작업 단계로 승격한다. raw trace 안쪽에만 묻히면 실패다.
   - provider 오류는 `workDetail`과 `error`를 함께 보존한다. "provider 응답 처리 중단 · provider broken"처럼 무엇을 하다 멈췄는지와 실제 오류를 한 줄에서 읽을 수 있어야 한다.
   - raw payload와 trace event는 기본 노출하지 않고, 필요할 때 `In`/`Out`/`raw trace`로 펼쳐 본다.

8. **Trace와 평가**
   - 모든 turn은 `traceId`를 가진다.
   - tool payload에는 `category`, `lane`, `target`, `risk`, `traceEventIndex`, `turnElapsedMs`, `workLabel`, `workDetail`을 붙인다.
   - `tool-result` trace event에는 평가 가능한 result signal을 보존한다. 예: `write-curriculum-yaml.document`, `write-curriculum-yaml.sectionCount`, `packages-check.missing`, `packages-install.success`, `cell-call.passed`.
   - 다음 provider 호출에 넣는 `role: tool` message는 무제한 raw result가 아니다. 큰 result는 valid JSON envelope로 줄이고 `truncated`, `originalChars`, `sectionCount`, `exerciseCellCount`, `contractGapCount`, `loadedInEditor` 같은 핵심 signal을 보존한다. 현재 turn payload와 trace에는 full result를 남겨 사용자가 펼쳐 확인할 수 있어야 한다.
   - `packages-install` result signal은 `success`뿐 아니라 `installer: uv`, `environment: project .venv`, `durationMs`, `skipped`를 보존한다. 이미 설치된 plain package는 `skipped: true`로 남긴다. 프론트 workloop detail은 이 result signal을 사용해 `설치 완료 · uv · project .venv · 42ms` 또는 `이미 준비됨 · project .venv`처럼 결과까지 읽히게 한다.
   - provider에게 돌려주는 package result에는 `codaroNextRequiredTool`, `codaroProviderInstruction`, `codaroToolPolicy.nextRequiredTool`을 함께 넣는다. live provider가 `packages-check` 완료 뒤 같은 패키지 확인을 반복하지 않고 바로 `packages-install` 또는 `cell-call`로 이어가게 하기 위한 신호다.
   - response의 `trace.toolSequence`와 `trace.policyViolationCount`는 평가 harness의 입력으로 쓴다.
   - response의 `trace.workloop`은 사용자가 읽을 수 있는 단계 품질 평가에 쓴다. golden case는 `workLabel`뿐 아니라 핵심 `workDetail` 문장도 검증한다. 정책 위반, 작업 전 확인 질문, provider 오류는 반드시 사람이 읽을 수 있는 `workLabel`/`workDetail`/`error`를 가진다.
   - provider 오류는 streaming이면 `error` event와 trace `turn-error`로, non-streaming이면 turn payload의 `trace.workloop`에 `provider 오류` row로 남긴다.
   - streaming native tool loop도 예외가 다른 경로가 아니다. `completeWithTools`가 첫 호출 또는 tool result 이후 다음 호출에서 실패하면 이미 실행된 tool row를 유지하고 마지막 workloop row를 `provider 오류`로 끝낸다.
   - golden case는 명시적으로 허용한 경우가 아니면 policy violation이 1건이라도 있으면 실패다.
   - 평가 harness는 `score`, `maxScore`, `minimumScore`를 payload에 남긴다. teacher/provider golden 평가는 10점 만점, 완료 기준은 `minimumScore: 9.0`이다.
   - dependency preflight golden case는 `packages-check → packages-install → cell-call` exact sequence를 요구한다. 필요한 도구가 모두 있어도 순서가 다르거나 불필요한 tool call이 끼면 실패다.
   - `packages-check` 자체가 실패하거나 malformed 결과를 주면 preflight는 완료된 것으로 보지 않는다. provider가 그 다음 `cell-call`을 요청해도 executor로 넘기지 않고 `dependency-preflight-required` policy result를 다음 provider call에 전달한다.
   - 새 provider 동작을 추가하면 golden case가 실제 provider loop payload를 대상으로 tool 순서, workloop 라벨, YAML contract 산출 여부, structured section card flow, 패키지 preflight 결과, 셀 실행/검증 결과를 검증해야 한다.
   - provider loop e2e는 tool call 실행 후 `role: tool` 결과 메시지가 다음 provider 호출에 다시 들어갔는지도 검증해야 한다. tool sequence만 맞고 provider가 결과를 보지 못한 채 다음 응답으로 넘어가면 실패다.
   - `uv run python -X utf8 tests/run.py gate teacher-e2e`는 clarification gate, dependency preflight, provider error workloop, 실제 curriculum YAML handler를 한 번에 통과하는 최소 golden e2e 증거이며, 실행 출력에 teacher golden e2e score를 남긴다.
   - `uv run python -X utf8 tests/run.py gate assistant-workloop-contract`는 프론트 workloop state가 clarification 작업 기준, provider 오류 detail+error, packages-check/install/cell-call 표시 문장을 보존하는지 확인하는 집중 gate다.
   - clarification golden case는 provider를 호출하지 않고 `toolSequence`가 비어 있어야 한다. trace에는 `clarification-gate`, workloop에는 `작업 전 확인 질문`, payload에는 1-3개 질문과 `level`/`depth`/`environment`/`balance` 작업 기준이 남아야 한다.
   - clarification continuation golden case는 첫 turn의 `pendingClarification.assumptions`가 다음 provider turn의 `[Clarification plan]`에 machine-readable JSON으로 들어가고, `defaults` alias 없이 소비되는지 확인한다. 이어 답변이 아닌 새 요청과 이미 구체적인 새 학습 요청에서는 stale clarification이 주입되지 않고 pending이 비워지는지도 함께 확인한다.
   - 커리큘럼 YAML golden case는 실제 `write-curriculum-yaml` 핸들러가 에디터 document를 바꾸는지까지 확인한다. 결과 payload의 `loadedInEditor`, materialize된 `sectionContract:*` block, document runtime packages, `intro.diagram.runtime` detail은 평가 신호로 남겨야 한다.

## 코드 경계

```
src/codaro/ai/
├── conversation.py   # 역할별 prompt와 conversation state
├── teacher/
│   ├── teacherOrchestrator.py
│   ├── turnSession.py
│   ├── turnRuntime.py
│   ├── providerLoop.py
│   ├── providerStream.py
│   ├── clarificationPolicy.py
│   ├── intakePolicy.py      # 대화 누적 → gather/act 결정 + 추천·조합 steering
│   ├── contextBuilder.py
│   ├── toolPolicy.py
│   ├── traceModel.py
│   ├── skillRegistry.py
│   └── evalHarness.py
├── teacherLoop.py    # compatibility shim: older context/tool lifecycle imports only
├── tools.py          # 기본 tool 정의
├── toolRegistry.py   # registry + provider schema 변환
├── toolManifest.py   # group/lane/risk 표시 메타데이터
├── toolHandlers/     # workbench/runtime/learning/automation 실행 핸들러
└── toolExecutor.py   # dispatch와 공통 session/document 경계

src/codaro/api/
└── aiRouter.py       # HTTP/SSE endpoint, provider 호출 경계
```

router가 셀 맥락 조립, tool round 실행, tool payload 포맷을 직접 소유하면 금방 덕지덕지 붙는다. provider loop의 판단 재료와 workloop 표시 payload는 `teacher/` 패키지에서 관리한다.

## 호환 경로

- `src/codaro/ai/teacherLoop.py`는 예전 `injectContext`, `toolCallStart`, `toolCallResult` import를 깨지 않기 위한 얇은 shim이다.
- 새 내부 코드는 `teacherLoop.py`를 import하지 않고 `src/codaro/ai/teacher/`의 기준 모듈이나 `codaro.ai.teacher` public export를 사용한다.
- 이 shim에는 provider loop, stream, runtime turn, router 판단 로직을 추가하지 않는다.
- 제거 조건은 저장소 내부 검색에서 `teacherLoop.py`를 쓰는 코드가 없고, 다음 minor release note에서 외부 import 전환 경로를 안내한 뒤다.
- 테스트 기준은 `tests/architecture/testTransportBoundary.py`의 compatibility shim 계약이다. shim이 두꺼워지거나 내부 코드가 다시 import하면 실패해야 한다.

## Tool Map

| 단계 | Tool | 역할 |
|---|---|---|
| 목표 해석 | `resolve-learning-goal` | 자연어 학습 목표를 커리큘럼 도메인 후보로 매핑 |
| 기존 레슨 검색 | `search-curricula` | 키워드/카테고리/outcome 기준으로 이미 있는 레슨 확인 |
| 학습 경로 조합 | `compose-master-plan` | 기존 레슨을 순서 있는 학습 경로로 조합하고 gap 확인 |
| 환경 확인 | `packages-check` | 필요한 Python 패키지 설치 여부 확인 |
| 환경 준비 | `packages-install` | 누락된 패키지만 설치 |
| gap-only YAML 전개 | `write-curriculum-yaml` | 기존 레슨이 덮지 못하는 gap을 새 개인 커리큘럼 YAML로 변환 |
| 셀 읽기 | `read-cells` | 현재 셀 구조와 내용을 확인 |
| 셀 수정 | `write-cell` | 셀 단위 삽입/수정/삭제 |
| 셀 호출 | `cell-call` | 실행 또는 검증 |
| 변수 확인 | `get-variables` | 런타임 변수 상태 확인 |
| 자동화 작성 | `write-automation-recipe` | percent-format automation recipe와 automation 셀 작성 |
| 태스크 등록 | `create-automation-task` | 검증된 recipe를 task registry에 등록 |
| 진단 읽기 | `read-learner-state` | outcome mastery, misconception hits, 실행 요약 조회 |
| 진단 기록 | `record-prediction-result` | predict vs 실측 4차원 diff → mastery EMA 갱신 |
| 진단 매칭 | `match-misconception` | 코드/에러를 catalog와 매칭, hit 누적, repeat 감지 |
| 진단 추론 | `suggest-next-step` | applyCorrection / replayOutcome / advance / continuePractice 결정 |

## Diagnosis Lane — Predict-Run-Reconcile-Adapt 루프

학습자가 예측을 적고 코드를 실행하고 결과를 보는 순간마다 [[learnerState]] store가 한 줄 갱신된다.
teacher orchestrator는 이 상태에서 다음 발자국을 derive한다.

기본 진단 흐름:
1. **Predict** — 학습자가 `LearningPredictContract` (`exercise.predict.expectedShape|Dtype|Value|Error`)를 채운다.
2. **Run** — 학습자가 셀을 실행, runtime이 `ActualResult` 객체로 결과를 보고한다.
3. **Reconcile** — provider가 `record-prediction-result` 로 4차원 diff를 mastery 신호로 변환한다.
   에러가 났거나 mismatch가 있으면 같은 outcome의 `match-misconception` 도 호출해 [[misconceptionCatalog]] 와 매칭한다.
4. **Adapt** — `suggest-next-step` 이 mastery score/confidence + 미해결 misconception 개수로 다음 행동을 결정한다.

평가 신호 — `match-misconception` 결과의 `doneCriterionViolated=True` 는 같은 학습자가 동일 misconception을 두 번
보였다는 뜻이다. 강의가 그 오개념을 충분히 다루지 못했다는 직접적 신호이며, [[curriculum-weakness-audit]] 게이트의
runtime 차원에서도 같은 신호가 잡힌다 (`CODARO_LEARNER_STATE_DB` 로 익명 aggregate DB를 주입).

[[planComposer]] 는 `learnerStateStore` 입력을 받아 PlanStep에 `learnerMastery`/`learnerConfidence` 를 부착하고,
target outcome 중 mastery<0.3 또는 confidence<0.2 인 항목을 `dynamicGaps` 로 분리한다. 정적 gap(레슨 없음)과
동적 gap(학습자가 약함)이 항상 분리되어야 다음 행동이 정확하게 derive된다.

## 실패 기준

- 학습 요청을 긴 채팅 답변만으로 끝내면 실패다.
- 목표가 분명한 학습 요청에서 `resolve-learning-goal` → `search-curricula` → `compose-master-plan` 없이 곧바로 새 YAML을 만들면 실패다.
- YAML을 만들고도 커리큘럼 화면에 반영하지 않으면 실패다.
- 필요한 패키지를 확인하지 않고 실행 셀부터 만들면 실패다.
- 모호한 학습 요청에 대해 필요한 질문 없이 바로 길고 복잡한 커리큘럼을 만들면 실패다.
- 셀 역할을 보지 않고 설명 셀에 실행 코드를 쓰면 실패다.
- tool call을 raw JSON 로그처럼 항상 노출하면 실패다.
- 자동화 요청을 실행 가능한 recipe와 automation 셀 없이 설명만으로 끝내면 실패다.

## 관련

- [[frontend-product-surface]]
- [[learning-yaml-contract]]
- [[curriculum-registry]]
- [[ai-integration]]
- [[curriculum-authoring]]
