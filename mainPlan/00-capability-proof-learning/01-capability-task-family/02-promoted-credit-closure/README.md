# promoted credit allowlist와 closure

상태: 대기

선행: `../01-checker-discrimination`

## 목표

explicit `assessmentRole=assurance|application`과 promoted TaskFamily가 있는 checkpoint만 새 `CreditGranted`를 만들게 한다. 기존 credit은 역사로 보존하고 검증된 migration map만 새 claim에 연결한다.

## 영향 파일

- `editor/src/lib/canonicalLearningEvidence.ts`
- `editor/src/lib/curriculaRegistry.ts`
- `src/codaro/curriculum/converter.py`
- `docs/skills/ops/tools/buildLearningLedgers.py`
- `contracts/learning-content/path-ledgers/**`

## 영향 함수·심볼

- `creditMode`
- `registryAssessmentBlocks`
- `documentFromCurriculumYaml`
- `yamlToDocument`
- `buildLearningLedgers.evaluate`

## 테스트

unmarked legacy strong pass는 formative event만 남기고 새 credit 0인지 확인한다. mapped legacy receipt와 incompatible version receipt의 projection을 각각 허용과 거부한다.

## 롤백

legacy reader와 역사 receipt는 유지하되 unmarked writer allowlist를 넓히지 않는다.

## 평가

legacy 새 capability credit 0, material version carry-forward 0, generated ledger drift 0을 요구한다.
