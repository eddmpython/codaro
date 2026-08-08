# 실패까지 남기는 attempt

상태: 대기

선행: `../00-reader-compatibility`

## 목표

성공한 `StrongCheckVerified`만 저장하는 outer archive에 `AttemptObserved` bundle을 추가해 실패, 지원, reveal, 실제 판정을 보존한다. pass일 때만 `CreditGranted`를 포함한다.

## 영향 파일

- `editor/src/lib/canonicalLearningEvidence.ts`
- `editor/src/lib/webLearningEvidence.ts`
- `editor/src/lib/learningEvidenceOperations.ts`
- `editor/src/components/curriculum/curriculumSectionRenderer.tsx`
- `src/codaro/curriculum/evidenceArchive.py`
- `tests/curriculum/testLearningEvidenceArchive.py`

## 영향 함수·심볼

- `buildCanonicalStrongCheckEvents`
- `storeStrongLearningEvidence`
- `AttemptObserved`
- `SupportProvided`

## 테스트

success, failed check, exception, timeout, hint, worked step, answer reveal을 archive 왕복한다. reveal된 variant의 이후 run은 exposure receipt를 빠뜨려도 credit을 얻지 못해야 한다.

## 롤백

writer를 기존 success-only 경로로 끌 수 있으나 `AttemptObserved` reader는 유지한다. 저장된 실패를 삭제하지 않는다.

## 평가

실패 event 누락 0, 고정 성공값 0, reveal 뒤 같은 variant assurance credit 0, fresh parallel variant 재응시 가능을 요구한다.
