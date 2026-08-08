# 01. 능력과 TaskFamily 계약

상태: 대기

선행: `00-evidence-authority`

이 workstream은 472개 레슨과 1,402개 assessment variant를 사용자 능력 중심의 유지 가능한 계약으로 바꿀 최소 구조를 만든다. 전체 catalog를 변환하지 않고 첫 golden 후보만 계약에 올린다. 별도 claim 데이터베이스를 만들지 않고 기존 `DomainDef`, `OutcomeDef`, assessment schema를 확장한다.

## packet 순서

1. [claim과 family 계약](00-claim-family-contract/README.md)
2. [checker discrimination harness](01-checker-discrimination/README.md)
3. [promoted credit allowlist와 closure](02-promoted-credit-closure/README.md)

## 구현 순서

### 1. claim owner를 기존 taxonomy에 둔다

`DomainDef`에 claim collection을 추가한다. 첫 경로는 기존 `pythonFoundation`의 의미를 바꾸지 않고 새 `reportAutomationFoundation` row가 소유한다.

```yaml
capabilityClaims:
  - id: report.record
    statement: 한 레코드를 계산된 결과로 표현한다.
    allowedTools: [languageReference, localEditor]
    inferenceBoundary:
      - 대규모 데이터 성능을 증명하지 않는다.
    requiredTaskFamilyIds: [python.report.record]
    version: 1
  - id: report.pipeline
    statement: 잘못된 입력을 분리하고 보고서 파일을 만든다.
    allowedTools: [languageReference, localEditor]
    inferenceBoundary:
      - 코드 유지보수성을 자동으로 증명하지 않는다.
    requiredTaskFamilyIds: [python.report.collection, python.report.pipeline, python.report.delivery]
    applicationRequirement:
      artifactContractId: python.report.json.v1
      automationHandoff: supported
    version: 1
```

새 domain의 `targetOutcomes`가 네 claim에 필요한 원자 능력의 합집합 authority다. claim 안에 outcome 목록을 복제하지 않는다. material statement, 조건, inference boundary, required family가 바뀌면 semantic version을 올린다.

`OutcomeDef`는 prerequisite와 원자 failure attribution의 owner로 유지한다. 사용자 문장이 필요하면 짧은 can-do label과 측정 경계를 추가하되 domain claim과 같은 의미를 중복 저장하지 않는다.

### 2. 세 역할을 schema에서 분리한다

promoted checkpoint와 TaskFamily에 아래 역할을 명시한다. legacy catalog section에는 migration reader가 기존 의미를 유지하며 전면 schema migration을 요구하지 않는다.

```text
instructionRole: reference | workedExample | practice | project
assessmentRole: none | formative | assurance | application
assessmentMode: acquisition | transfer | retrieval | capstone
```

허용 조합을 schema와 validator로 고정한다.

| instructionRole | 가능한 assessmentRole | 비고 |
| --- | --- | --- |
| reference | none, formative | 실행과 피드백은 기록하지만 assurance credit은 없음 |
| workedExample | none, formative | 정답이 노출되므로 assurance credit은 없음 |
| practice | formative, assurance | assurance는 수업 정답과 단계별 힌트가 없는 explicit checkpoint만 가능 |
| project | formative, assurance, application | project라는 이유만으로 credit을 만들지 않음 |

application과 capstone은 서로 다른 차원이다. application은 credit 권한이고 capstone은 평가 mode다. regular acquisition을 capstone으로 암시하는 필드는 허용하지 않는다.

### 3. TaskFamily를 명시한다

promoted assessment는 다음 계약을 가진다.

```yaml
taskFamily:
  id: python.report.pipeline
  version: 1
  ownerDomainId: reportAutomationFoundation
  ownerClaimId: report.pipeline
  outcomeIds:
    - python.functions
    - python.modulesAndIo
    - python.errorHandling
  invariant: 입력을 읽고 유효 값을 집계하며 잘못된 값을 분리한다.
  inferenceBoundary:
    - 임의 크기의 데이터 성능을 증명하지 않는다.
  evidenceSlices:
    - outcomeId: python.functions
      caseIds: [reuse, empty]
    - outcomeId: python.modulesAndIo
      caseIds: [first-file, second-file]
    - outcomeId: python.errorHandling
      caseIds: [missing-field, invalid-number]
  variants:
    acquisition: ...
    transfer: ...
    retrieval: ...
```

- `taskFamilyId`는 같은 능력과 grading boundary를 묶는다.
- `taskFamilyVersion`은 불변조건과 evidence boundary의 material version이다.
- `taskVariantId`는 지문과 fixture의 한 버전을 식별한다.
- `taskVariantVersion`은 지문과 fixture 의미의 material version이다.
- `fixtureHash`는 실제 숨은 입력을 식별한다.
- `CheckSpec`은 판정 규칙을 식별한다.
- `evidenceSlices`는 case 실패를 특정 outcome으로 귀속한다.
- 하나의 capstone이 여러 outcome을 묶어도 subcheck 없는 일괄 credit을 금지한다.

기존 `masteryVariants`, `transferVariants`, `retrievalVariants`는 legacy migration source로 유지한다. golden path부터 TaskFamily 아래로 이동하고, catalog 전체를 일괄 변환하지 않는다. explicit `assessmentRole=assurance|application`과 promoted TaskFamily가 없는 legacy section은 새 `CreditGranted`를 만들지 않고 formative event만 남긴다. 기존 v1 credit은 역사 projection에 보존하고 검증된 migration map이 있을 때만 새 claim에 연결한다.

### 4. checker discrimination harness를 만든다

TaskFamily 저자가 문구를 세 번 복제하는 대신 아래 세 corpus를 소유하게 한다.

1. reference solution corpus
2. curated mutation corpus
3. contract상 유효한 alternative solution corpus

공통 harness가 상수 반환, zero-edit, 분기 제거, 비교 연산 반전, off-by-one, 오류 처리 삭제, 파일 쓰기 삭제 mutation을 생성한다. 저자는 invalid row 의미, 예시 하드코딩처럼 업무 의미가 필요한 semantic mutant만 추가한다. TaskFamily 특성에 맞지 않는 mutation은 억지로 넣지 않고 `notApplicable` 이유를 schema에 명시한다.

valid alternative는 변수명, 반복 방식, 함수 분해, 허용 대소문자와 공백, 같은 의미의 자료구조 순서를 포함한다. exact formatting은 그 자체가 outcome일 때만 요구한다.

### 5. contract closure ledger를 생성한다

golden 후보마다 아래 관계를 기계적으로 검사하는 ledger를 생성한다.

```text
DomainDef
→ targetOutcomes
→ capabilityClaims
→ requiredTaskFamilyIds
→ variants
→ CheckSpec
→ evidenceSlices
→ artifact contract, 필요한 경우
```

orphan, 중복 owner, 없는 case id, 한 outcome에 귀속되지 않는 assurance case, semantic version 누락을 0으로 만든다. ledger는 source of truth가 아니라 taxonomy와 curriculum에서 파생되는 report다.

## 목표

레슨 단위의 중복 assessment를 능력 단위 TaskFamily로 묶고, 사용자 약속, 원자 outcome, 관찰 task, 판정 case, evidence slice 사이의 닫힌 계약을 만든다.

## 영향 파일

- `src/codaro/curriculum/taxonomy.py`
- `src/codaro/curriculum/sectionContract.py`
- `src/codaro/curriculum/converter.py`
- `src/codaro/curriculum/lessonGraph.py`
- `editor/src/lib/curriculaRegistry.ts`
- `editor/src/lib/learningEvent.ts`
- `curricula/python/_taxonomy.yml`
- `contracts/learning-content/path-ledgers/**`
- `curricula/python/schema.yaml`
- `curricula/python/basics/30days/**`
- `docs/skills/architecture/curriculum-authoring.md`
- `docs/skills/architecture/learning-experience.md`
- `tests/curriculum/**`
- `docs/skills/ops/tools/buildLearningLedgers.py`

## 영향 함수·심볼

- `OutcomeDef`
- `DomainDef`
- `LearningSectionContract`
- `LearningLessonContract`
- `loadTaxonomy`
- `registryLesson`
- `registryAssessmentBlocks`
- `documentFromCurriculumYaml`
- `yamlToDocument`
- `buildLearningLedgers.evaluate`

새 심볼 후보는 `CapabilityClaimDef`, `TaskFamilyDef`, `EvidenceSliceDef`다. top-level claim store와 수동 publication state는 만들지 않는다.

## 테스트

1. schema의 role 조합 허용과 거부 vector
2. `mastery` legacy read와 explicit `acquisition` write migration
3. duplicate `taskFamilyId` owner와 orphan outcome 거부
4. missing variant, missing fixture, missing CheckSpec 거부
5. case id와 evidence slice closure
6. 통합 checkpoint의 outcome별 실패 귀속
7. semantic material change에서 version 미증가 거부
8. reference solution 전부 통과
9. required mutation corpus 전부 거부
10. valid alternative corpus 전부 허용
11. 같은 family의 acquisition, transfer, retrieval taskVariantId와 fixture freshness
12. generated ledger drift 0
13. explicit role과 promoted family가 없는 legacy section의 새 credit 0
14. incompatible claim, family, variant, check version의 carry-forward 0

```powershell
uv run python -X utf8 tests/run.py gate curriculum-quality-matrix
uv run python -X utf8 tests/run.py gate learning-content
uv run python -X utf8 tests/run.py gate curriculum-weakness-audit
uv run python -X utf8 tests/plan/testMainPlanTodoPolicy.py
git diff --check
```

존재하지 않는 gate 이름은 구현 시 `tests/run.py list`에 등록하거나 가장 좁은 기존 gate로 대체하고 문서와 CI mapping을 함께 갱신한다.

## 롤백

- taxonomy의 새 필드는 optional read로 시작하되 golden 승격 validator에서는 필수로 둔다.
- 기존 assessment variant reader는 catalog migration 동안 유지한다.
- TaskFamily ledger는 파생물이므로 source를 되돌린 뒤 재생성한다.
- 새 narrow domain을 되돌려도 기존 `pythonFoundation`과 레슨 source는 삭제하지 않는다.
- writer가 만든 explicit `taskFamilyId`와 version identity를 `${lessonRef}#${sectionId}`로 되돌려 덮어쓰지 않는다.

## 평가

golden 후보에서 다음을 자동 판정한다.

- domain claim owner 중복 0
- target outcome orphan 0
- required TaskFamily 누락 0
- assurance case의 evidence slice 누락 0
- 실패를 특정 outcome에 귀속하지 못하는 통합 checkpoint 0
- curated mutant false accept 0
- curated valid alternative false reject 0
- legacy `mastery`를 새 event에 쓰는 writer 0
- unmarked legacy assessment가 새 capability credit을 만드는 경우 0
- material version 변경 뒤 과거 proof가 현재 stage를 올리는 경우 0
- 외부 검수 상태가 publication 또는 credit을 바꾸는 경우 0
