# reader 호환과 identity

상태: 대기

## 목표

LearningEvent v1을 유지하면서 모든 Python과 TypeScript reader가 optional claim, TaskFamily, variant, check, artifact version과 `masteryPolicyVersion: 1 | 2`를 먼저 읽게 한다. 콘텐츠 역할은 event에 복제하지 않는다.

## 영향 파일

- `contracts/learningEvent.schema.json`
- `editor/src/lib/learningEvent.ts`
- `editor/src/lib/webLearningEvidence.ts`
- `editor/src/lib/learningEvidenceOperations.ts`
- `src/codaro/curriculum/learningEvent.py`
- `src/codaro/curriculum/evidenceArchive.py`

## 영향 함수·심볼

- LearningEvent validation과 archive import/export reader
- `RunContext`
- `masteryPolicyVersion`

## 테스트

v1 fixture, optional identity fixture, unknown material version, Web과 Local export/import를 왕복한다. writer feature gate는 reader parity 전에는 열리지 않아야 한다.

## 롤백

새 writer는 끌 수 있지만 optional identity를 읽는 reader 지원은 유지한다. 기존 v1 event를 재작성하지 않는다.

## 평가

구 archive import 실패 0, supported reader 간 canonical digest 불일치 0, 콘텐츠 역할의 event 중복 0을 요구한다.
