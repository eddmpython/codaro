# 00. 증거 권한과 정책 수렴

상태: 설계

이 workstream은 이후 모든 학습 기능의 선행 조건이다. 새 성취 화면이나 golden 콘텐츠보다 먼저, 같은 수행이 어느 화면에서든 같은 stage와 receipt를 만들도록 authority를 하나로 수렴한다.

## packet 순서

1. [reader 호환과 identity](00-reader-compatibility/README.md)
2. [실패까지 남기는 attempt](01-attempt-observation/README.md)
3. [policy와 projection parity](02-policy-projection/README.md)
4. [legacy authority 차단](03-legacy-authority-cutoff/README.md)
5. [일반 Harvest와 학습 적용 경계](04-harvest-boundary/README.md)

## 구현 순서

### 1. reader-first 호환 계약

LearningEvent의 `schemaVersion: 1`과 기존 event kind를 유지한다. `runStatus`, error class, support, answer reveal, assessment mode, evidence time, artifact descriptor는 이미 v1에 있으므로 다른 이름으로 복제하지 않는다. `instructionRole`과 `assessmentRole`은 콘텐츠 계약에만 두고 event에 복제하지 않는다.

reader를 바꾸기 전에 claim ref, TaskFamily ref, 각 semantic version의 최소 의미를 이 packet에서 먼저 고정한다. `01-capability-task-family`는 이 identity를 사용해 authoring schema와 corpus를 채우며 event 의미를 다시 바꾸지 않는다.

모든 Python과 TypeScript reader, archive import와 export를 먼저 다음 optional identity에 대응시킨다.

- `capabilityClaimId`, `capabilityClaimVersion`
- `taskFamilyId`, `taskFamilyVersion`
- `taskVariantVersion`
- 기존 `checkSpecId`, `checkSpecVersion`
- 필요한 경우 `artifactContractVersion`
- 이전 attempt의 지원 노출을 가리키는 `exposureReceiptIds`
- `masteryPolicyVersion: 1 | 2`

elapsed는 기존 startedAt과 completedAt으로 계산하고 별도 필드를 만들지 않는다. optional identity를 쓰는 writer는 모든 supported reader가 이를 읽고 Web과 Local archive가 왕복한 뒤 feature gate로 연다. writer를 되돌려도 새 identity를 읽는 reader는 되돌리지 않는다.

### 2. MasteryPolicy v2

`masteryPolicy.v2.json`을 추가하고 Python과 TypeScript 생성 사본이 같은 정책을 읽게 한다.

- initial retrieval의 minimum delay는 eligibility로 유지한다.
- 기존 maximum delay는 credit 거부에서 제거하고 queue priority와 freshness 표시에만 사용한다.
- 첫 retrieval이 늦어도 fresh variant, hint 0, answer reveal 없음 조건을 만족하면 실제 지연 시간과 함께 credit을 허용한다.
- acquisition, transfer, retrieval은 서로 다른 event와 task variant를 요구한다.
- v1 capstone은 compatibility acquisition으로만 읽는다.
- v2 capstone은 assurance stage를 올리지 않고 application projection만 소비한다.
- variant 수와 delay 값은 연구 상수가 아니라 policy version에 속한 제품 가설로 기록한다.
- `curriculumAssessmentQueue.ts`의 `7 * 24`는 제거하고 같은 policy loader를 사용한다.

### 3. 성공 전용 outer archive를 attempt archive로 전환

현재 outer archive는 성공한 `StrongCheckVerified`에만 nested canonical events를 붙인다. `buildCanonicalStrongCheckEvents`만 고쳐서는 실패가 저장되지 않는다. outer schemaVersion은 유지하고 새 `AttemptObserved` bundle kind를 추가한다.

1. 실행 시작과 종료 결과로 `RunObserved`를 만든다.
2. 실제 check result로 `CheckEvaluated`를 만든다.
3. 사용한 hint와 answer reveal로 `SupportProvided`를 만든다.
4. 위 event를 성공과 실패 모두 `AttemptObserved`에 담는다.
5. strong pass이고 정책을 만족할 때만 같은 bundle에 `CreditGranted`를 넣는다.

고정된 `runStatus: success`, `passed: true`, `recommendedHintLevel: 0`을 관찰값으로 바꾼다. 기존 `StrongCheckVerified`는 compatibility read 전용으로 유지한다.

지원은 learner와 task variant의 exposure lineage로 누적한다. answer reveal된 variant는 계속 formative로만 쓰고, 단계별 지원을 받은 variant의 재통과는 remediation 성공으로 기록한다. assurance는 노출되지 않은 fresh parallel variant에서만 다시 시도한다.

`creditMode("mastery") → "capstone"` 변환을 제거한다. legacy `mastery` 입력은 `acquisition`으로만 읽는다. artifact descriptor는 `RunObserved`에 복사한다. 과거 descriptor에는 bytes가 없으므로 migration으로 application proof를 소급 생성하지 않는다.

### 4. canonical projection과 legacy cutoff

Python과 TypeScript의 `MasteryPolicy`가 같은 archive를 reduce하도록 parity vector를 만든다. projection은 current claim과 명시적으로 compatible한 claim, TaskFamily, variant, check, artifact contract version의 evidence만 사용한다. material change 전 receipt는 역사 기록으로 보이되 현재 stage를 올리지 않는다.

projection 결과나 UI 상태를 별도 mutable 저장소에 쓰지 않는다. 동일 archive와 `asOf`가 주어지면 언제나 같은 결과를 내야 한다.

reader, writer, parity가 닫힌 뒤 다음 legacy writer의 stage authority를 제거한다.

- `markOutcomeValidated`
- `clearOutcomeValidation`
- `creditCheckPass`
- `recordReviewResult`
- `/api/curriculum/outcomes/validate`
- teacher tool의 수동 outcome validation
- `.codaro/achievements.json` 계열의 수동 mastery 표시

마이그레이션에 필요한 값은 diagnostics metadata로만 보존하고 `CreditGranted`를 만들지 못하게 한다.

### 5. 일반 Harvest와 학습 적용 경계

`/api/tasks/from-code`의 optional `outcomeId`와 legacy `learnerStateStore.getMastery()` gate를 제거하고 순수한 일반 task 생성으로 유지한다. 새 endpoint를 만들지 않는다.

학습 적용은 이미 있는 `/api/curriculum/learning-archive/automation-drafts/{draftId}/adopt`와 `adoptLearningArchiveAutomationDraft`가 소유한다. 기존 `lineageId`와 `sourceDraftId`에 canonical proof id, source run id, check id, artifact hash 검증을 더한다. stale legacy state가 true여도 canonical proof가 없으면 application을 만들 수 없어야 한다.

## 목표

성취 stage, review due, 학습 적용 proof를 `LearningEvent → MasteryPolicy → projection` 한 경로로 수렴한다. 실패, 지원, 결과물, 지연 시간까지 canonical archive에 보존하고 legacy writer가 stage를 바꾸지 못하게 한다.

## 영향 파일

- `contracts/learningEvent.schema.json`
- `contracts/masteryPolicy.v1.json`
- `contracts/masteryPolicy.v2.json`
- `src/codaro/generatedContracts/**`
- `editor/src/lib/generatedContracts/**`
- `editor/src/lib/learningEvent.ts`
- `editor/src/lib/canonicalLearningEvidence.ts`
- `editor/src/lib/webLearningEvidence.ts`
- `editor/src/lib/learningEvidenceOperations.ts`
- `editor/src/lib/browserLearningArchive.ts`
- `editor/src/lib/masteryPolicy.ts`
- `editor/src/lib/curriculumAssessmentQueue.ts`
- `editor/src/components/curriculum/curriculumSectionRenderer.tsx`
- `src/codaro/curriculum/learningEvent.py`
- `src/codaro/curriculum/evidenceArchive.py`
- `src/codaro/curriculum/learningArchive.py`
- `src/codaro/curriculum/masteryPolicy.py`
- `src/codaro/curriculum/outcomeMastery.py`
- `src/codaro/curriculum/learnerProgressFlow.py`
- `src/codaro/curriculum/reviewFlow.py`
- `src/codaro/api/automationRouter.py`
- `src/codaro/api/curriculumRouter.py`
- `src/codaro/api/learningArchiveAutomation.py`
- `src/codaro/automation/taskRegistry.py`
- `src/codaro/automation/taskFlow.py`
- `src/codaro/curriculum/progress.py`
- `src/codaro/ai/toolHandlers/learning.py`
- `src/codaro/ai/toolHandlers/curriculumOs.py`
- `src/codaro/ai/toolDefinitions/learning.py`
- `src/codaro/ai/toolDefinitions/curriculumOs.py`
- `src/codaro/ai/toolManifest.py`
- `src/codaro/ai/conversation.py`
- 관련 Python, TypeScript, product test
- `tests/curriculum/testLearningEvidenceArchive.py`

## 영향 함수·심볼

- `buildCanonicalStrongCheckEvents`
- `creditMode`
- `nestedCanonicalLearningEvents`
- `MasteryPolicy.reduce`
- `MasteryPolicy.advance`
- `MasteryPolicy._advance`
- `dueAssessmentSectionIds`
- `computeMastery`
- `ProgressTracker.markOutcomeValidated`
- `ProgressTracker.clearOutcomeValidation`
- `ProgressTracker.recordReviewResult`
- `ProgressTracker.creditCheckPass`
- `updateOutcomeValidation`
- `recordCurriculumReviewResult`
- `track-achievement`
- `HarvestCodeRequest`
- `apiHarvestCode`
- `adoptLearningArchiveAutomationDraft`

새 심볼 후보는 `AttemptObserved`, `recordCanonicalAttemptEvents`, `CanonicalOutcomeProjection`이다. 실제 이름은 기존 모듈 owner에 맞춰 결정한다.

## 테스트

1. 기존 archive와 optional identity reader 호환 vector
2. Python과 TypeScript policy projection golden vector
3. success, exception, timeout, failed check, hint, answer reveal event chain
4. regular mastery가 acquisition이고 capstone이 아닌지 확인
5. 6일, 7일, 14일, 15일, 장기 overdue의 가상 시계 전이
6. queue가 policy delay 변경을 즉시 반영하는지 확인
7. 같은 task variant와 fingerprint replay credit 0
8. hint, worked step, answer reveal exposure를 누락한 다음 run의 credit 0
9. artifact descriptor와 version identity의 export와 import 왕복
10. stale legacy mastery true가 학습 적용 proof를 만들지 못하는지 확인
11. 일반 task 생성은 outcome과 proof 없이 가능한지 확인
12. 수동 validation과 legacy review가 projection stage에 영향 0인지 확인
13. incompatible claim, family, check version이 현재 stage를 올리지 않는지 확인

```powershell
uv run python -X utf8 tests/run.py gate learning-evidence-contract
uv run python -X utf8 tests/run.py gate backend
uv run python -X utf8 tests/run.py gate product-quality-audit
uv run python -X utf8 tests/plan/testMainPlanTodoPolicy.py
git diff --check
```

실제 gate 이름이 다르면 기존 `tests/run.py list`에서 owner를 확인하고 가장 좁은 관련 gate와 상위 product gate를 함께 기록한다.

## 롤백

- LearningEvent v1과 기존 `StrongCheckVerified` reader는 제거하지 않는다.
- writer rollback 시 optional identity와 `AttemptObserved`를 읽는 reader는 되돌리지 않는다.
- `AttemptObserved`가 없는 과거 실패를 추정하거나 생성하지 않는다.
- 일반 task 생성과 기존 learning archive adopt 경로를 합치지 않는다.
- legacy writer를 다시 authority로 승격하는 rollback은 허용하지 않는다. 필요하면 canonical projection reader만 이전 버전으로 돌린다.

## 평가

다음 조건을 모두 자동 판정한다.

- 같은 archive의 Python과 TypeScript stage, reviewDue, invalid event가 일치한다.
- 실패와 지원 사건이 archive에 남고 credit은 strong pass에서만 생긴다.
- reveal 또는 지원 노출 뒤 같은 variant가 assurance를 만들지 못한다.
- overdue retrieval이 eligibility를 잃지 않는다.
- mastery와 capstone credit이 구분된다.
- version이 incompatible한 과거 receipt가 현재 stage를 올리지 않는다.
- legacy state와 manual API가 stage 또는 application을 바꾸지 못한다.
- 필수 검증은 외부 네트워크, provider, 사람 승인 없이 재현된다.
