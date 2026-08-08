# 03. 작업 증명과 적용 표면

상태: 대기

선행: `00-evidence-authority`, `01-capability-task-family`, `02-golden-automation-path`

현재 홈의 숫자 세 개를 사용자가 이해할 수 있는 능력과 결과물로 바꾼다. 이 workstream은 새로운 성취 상태를 저장하지 않는다. canonical archive에서 `CapabilityProjection`과 evidence receipt를 매번 파생한다.

## packet 순서

1. [capability projection](00-capability-projection/README.md)
2. [홈과 evidence receipt](01-home-receipt/README.md)
3. [artifact 보존과 reopen](02-artifact-reopen/README.md)
4. [automation lineage](03-automation-lineage/README.md)

## projection 계약

### assurance 축

| 내부 조건 | 사용자 문구 |
| --- | --- |
| 관련 formative event만 있음 | 연습 중 |
| acquisition strong credit, 허용 지원 조건 충족 | 수업 정답 없이 해냄 |
| fresh transfer strong credit | 새 조건에서도 해냄 |
| due 이후 fresh retrieval strong credit | 시간 뒤 다시 해냄 |
| policy 기준 freshness가 지남 | 복습 필요 |

`복습 필요`는 과거 achievement 취소가 아니다. 마지막 증거는 그대로 보여 주고 새 fresh variant를 queue에 올린다.

TaskFamily stage는 해당 mode의 required case와 outcome slice를 모두 통과해야 올라간다. claim stage는 current claim version의 모든 required TaskFamily stage 중 최저값이다. path는 claim별 상태를 최고 단계 하나로 합치지 않는다. required family 일부만 transfer라면 `2/4 능력에서 새 조건 수행`처럼 mixed state와 다음 행동을 보여 준다. required family 하나라도 due이면 path에 복습 필요를 표시하되 과거 receipt는 지우지 않는다.

### application 축

| 내부 조건 | 사용자 문구 |
| --- | --- |
| strong artifact check와 application credit의 같은 transaction | 검증된 결과물을 만듦 |
| 여러 필수 outcome의 evidence slice를 가진 capstone | 여러 능력을 묶어 완성함 |
| canonical proof에서 채택한 automation의 fixture run receipt | 자동화로 다시 실행됨 |
| 사용자가 고른 새 입력과 current source hash의 run receipt | 새 입력으로 다시 실행됨 |
| 실제 schedule trigger의 run receipt | 예약 실행됨 |

application은 assurance stage를 자동 승격하지 않는다. MasteryPolicy v2는 capstone을 assurance에 쓰지 않고 ApplicationProjection만 소비한다. v1 capstone은 compatibility acquisition으로만 읽는다. capstone이 fresh transfer 조건과 claim별 subcheck를 실제로 만족하면 별도의 transfer slice를 만들 수 있지만, due 조건이 없으면 retrieval credit은 만들 수 없다.

assurance의 SSOT는 LearningEvent archive다. application은 `LearningEvent archive + content-hash blob store + learningArchive automation draft lineage + TaskRegistry task run`을 읽기 전용 입력으로 합성한다. 별도 mutable application stage를 저장하지 않는다.

## CapabilityProjection read model

projection은 다음 정보를 제공한다.

```text
domainId
claimVersion
claimStatement
inferenceBoundary
pathPublicationState
assuranceStage
reviewDue
latestAssuranceReceipt
outcomeSlices
applicationStage
artifacts
automationRuns
allowedTools
supportSummary
```

- stage는 event archive와 versioned policy에서 계산한다.
- artifact는 descriptor와 content hash가 일치하고 content가 열릴 때만 표시한다.
- task family, fixture, runtime, check version이 receipt에 남는다.
- migration event는 provenance로 보이되 새로운 assurance를 만들지 않는다.
- projection cache가 필요하면 archive digest와 policy version을 key로 쓰고 언제든 재생성 가능해야 한다.

Python projection은 API와 Local 기능의 owner이고 TypeScript projection은 browser surface의 owner다. 같은 event vector에서 JSON canonical form이 일치해야 한다.

## 홈 정보 구조

기본 홈은 전체 category tree보다 golden path를 먼저 보여 준다.

```text
입력을 검증해 자동화 보고서 만들기

현재: 2/4 능력에서 새 조건 수행
다음: 파일 오류 처리 다시 해보기

증명한 능력
1. 한 레코드를 결과로 표현함
2. 여러 레코드를 판정하고 집계함
3. 파일 오류를 처리하는 파이프라인을 만듦

작업 결과
report-a.json, 검증됨
월간 보고서 자동화, 최근 실행 2일 전

근거 보기
```

숫자 집계는 보조 요약으로 남길 수 있지만 기본 카드의 제목은 capability statement다. golden path 아래에 `다른 주제 찾아보기`로 catalog를 분리한다.

## evidence receipt 화면

한 receipt는 다음 질문에 답해야 한다.

- 무엇을 했는가.
- 어떤 조건과 입력이었는가.
- 어느 정도의 도움을 썼는가.
- 무엇이 검사됐는가.
- 무엇은 검사되지 않았는가.
- 결과물을 다시 열 수 있는가.
- 자동화 실행과 연결됐는가.

원시 event id와 hash는 세부 정보에 두고 첫 화면에는 사용자 문장으로 보여 준다. `독립`, `전이`, `지연 회상`, `capstone` 같은 내부 용어를 기본 label로 쓰지 않는다.

receipt의 outcome slice를 누르면 실패와 교정 이력도 볼 수 있다. 단순 재실행과 공백만 바뀐 attempt는 의미 있는 시도 수에 포함하지 않는다.

## 결과물 보존과 다시 열기

worker의 임시 파일은 실행 종료 후 사라질 수 있다. 일반 formative run은 descriptor만 저장하고, promoted golden application transaction만 아래 content를 보존한다.

1. bytes 또는 지원되는 구조화 representation
2. media type
3. content hash
4. artifact contract version
5. source run과 check event id
6. 사용자에게 보여 줄 안전한 파일명

다시 열기는 hash를 재검증하고 media type에 맞는 viewer를 사용한다. 사용자 개인 파일과 fixture 파일을 섞지 않는다. export와 import 뒤에도 같은 receipt에서 열려야 한다.

artifact archive contract에는 허용 media type, 파일 수, 파일별 최대 크기, archive 총량의 hard limit를 둔다. fixture와 사용자 artifact는 namespace를 분리한다. content hash로 중복을 제거하고 orphan cleanup을 테스트한다. export에는 사용자 artifact 포함 여부를 명시하며 기본값을 계약으로 고정한다.

## 자동화 lineage

일반 task 생성과 학습 적용 증명을 분리한다.

```text
일반 task 만들기
code + name + schedule
→ 학습 proof 불필요

학습 결과를 자동화로 쓰기
canonical proof id + source run id + artifact hash
→ 기존 learning archive automation draft adopt
→ task run receipt
→ application projection 갱신
```

자동화 코드를 수정하면 새 source hash와 lineage를 남긴다. 원래 학습 proof는 사라지지 않지만 수정된 자동화가 같은 claim을 계속 증명하는지는 별도의 validation run으로 확인한다.

## 제품 내부 학습 신호

raw 이벤트에서 아래 지표를 재현 가능하게 계산한다.

- 첫 meaningful edit까지의 시간
- 첫 수업 정답 없는 pass까지의 meaningful attempt 수
- acquisition에서 transfer로의 drop
- transfer에서 시간 뒤 재수행으로의 lapse
- task class가 진행되며 hint가 감소하는지
- 같은 misconception의 반복과 회복
- 결과물 열기와 다시 실행
- 결과물에서 automation draft와 실제 run으로의 전환

지표는 local-first로 저장하고 개인별 raw code를 집계에 넣지 않는다. 사용자 표본이 없거나 적어도 UI와 contract 구현을 막지 않는다. 표본 없는 숫자를 제품 효능으로 홍보하지 않는다.

## 목표

사용자가 숫자가 아니라 자신이 할 수 있는 일, 그 일을 증명한 조건, 결과물, 자동화 재실행을 확인하게 한다. 모든 화면 상태를 canonical event에서 파생하고 별도 수동 achievement writer를 두지 않는다.

## 영향 파일

- `src/codaro/curriculum/outcomeMastery.py`
- `src/codaro/api/curriculumRouter.py`
- `src/codaro/api/learningArchiveAutomation.py`
- `src/codaro/api/automationRouter.py`
- `src/codaro/curriculum/learningArchive.py`
- `src/codaro/automation/taskRegistry.py`
- `src/codaro/automation/taskFlow.py`
- `editor/src/lib/masteryPolicy.ts`
- `editor/src/lib/browserLearningArchive.ts`
- `editor/src/components/app/currentLearningSurface.tsx`
- `editor/src/components/curriculum/curriculumHome.tsx`
- `editor/src/components/curriculum/curriculumSectionRenderer.tsx`
- `editor/src/components/curriculum/**`
- artifact viewer와 automation run receipt component
- projection parity fixture
- `tests/product/**`
- `tests/curriculum/**`

## 영향 함수·심볼

- `computeMastery`
- `MasteryPolicy.reduce`
- `CurriculumHome`
- `LearningArchiveMenu`
- `CurrentLearningSurface`
- `apiHarvestCode`
- `adoptLearningArchiveAutomationDraft`
- automation run receipt reader

새 심볼 후보는 `CapabilityProjection`, `CapabilityReceipt`, `ApplicationProjection`, `LearningArtifactArchive`다.

## 테스트

1. assurance 각 단계의 canonical event projection
2. application 각 단계의 canonical lineage projection
3. 같은 archive의 Python과 TypeScript JSON parity
4. `reviewDue`가 과거 receipt를 삭제하지 않는지 확인
5. self-report, manual toggle, legacy review, page view의 stage 영향 0
6. artifact descriptor만 있고 content가 없을 때 application credit 0
7. artifact content hash 불일치 시 viewer와 credit 거부
8. archive export와 import 뒤 receipt와 artifact reopen
9. 일반 task 생성은 proof 없이 허용
10. 학습 적용 표시는 proof와 lineage 없이 거부
11. 자동화 code 변경 뒤 validation 전 application 상태 과장 방지
12. 홈 기본 golden card, catalog secondary navigation
13. capability receipt 접근성, 좁은 화면, 빈 상태, overdue 상태
14. raw event replay에서 사용자 지표 재현
15. required family 일부 통과에서 전체 claim stage 승격 0
16. mixed family 상태를 단일 최고 stage로 표시하는 경우 0
17. incompatible claim, family, check version의 현재 stage 승격 0
18. artifact 파일 수, 파일 크기, archive 총량 quota와 dedup, orphan cleanup

```powershell
uv run python -X utf8 tests/run.py gate learning-evidence-contract
uv run python -X utf8 tests/run.py gate product-quality-audit
uv run python -X utf8 tests/run.py gate editor-build
uv run python -X utf8 tests/plan/testMainPlanTodoPolicy.py
git diff --check
```

Playwright 또는 저장소의 동등한 browser gate에서 golden card, receipt drawer, artifact opener, automation handoff를 실제로 조작한다.

## 롤백

- projection은 read model이므로 UI를 이전 숫자 화면으로 되돌려도 canonical event와 artifact를 보존한다.
- cache를 제거하고 archive replay로 복구할 수 있어야 한다.
- automation lineage 기능을 되돌려도 일반 task 생성은 유지한다.
- artifact viewer 문제가 생기면 다운로드를 막고 hash 검증된 보존물은 유지한다.
- path publication projection을 되돌려도 콘텐츠와 사용자 receipt는 삭제하지 않는다.

## 평가

다음 조건을 제품 내부에서 자동 판정한다.

- 사용자에게 보이는 모든 stage가 receipt까지 추적된다.
- claim과 path stage가 required family의 최저 단계보다 높아지는 경우가 없다.
- assurance와 application이 서로를 암묵적으로 승격하지 않는다.
- 결과물은 다시 열리고 hash가 검증된다.
- 자동화 재실행은 실제 run receipt가 있을 때만 표시된다.
- 홈의 기본 진입은 golden path이고 catalog는 보조 탐색이다.
- projection과 지표는 raw canonical archive에서 재생된다.
- 사람이 수동으로 성취를 올리는 경로가 없다.
