# 00 Evaluation Contract

상태: 진행

## 목표

전문 평가가 점수표 채우기가 아니라 재현 가능한 반증 절차가 되게 한다. 평가자에게 목표 점수를 주지 않고, PRD integrity와 product evidence를 분리하며, raw report와 fact audit를 round 폴더에 고정한다.

rubric, report schema, bundle/fact-audit 도구와 draft snapshot은 구현돼 있다. 그러나 2026-07-23 통합 source를 대상으로 한 sealed bundle, 독립 evaluator 세 명과 raw report가 없어 현재 유효한 독립 점수는 없다. 따라서 상태는 `진행`이며 `_done`이 아니다.

## report 계약

각 분야 report는 `evaluationId`, `rubricVersion`, `rubricHash`, `evaluationBundleHash`, `scopeGitCommit`, `scopeDirtyDiffHash`, `scopeManifestHash`, `scopePaths`, `excludedPriorReports`, `discipline`, `evaluatorId`, `startedAt`, `completedAt`, 항목별 `score/max`, finding과 `evidenceRefs`, `counterEvidence`, P0/P1/P2, 총점, product evidence 근거와 판단 한계를 가진다.

[rubric.yml](rubric.yml)이 dimension, weight, evidence rule, severity와 maturity definition의 유일한 source다. README나 evaluator prompt가 weight·severity를 복제하거나 변경하지 않는다.

report schema의 `dimensions`는 rubric version 1의 dimension ID를 object key로 mirror해 중복을 구조적으로 막는다. verifier는 schema의 key set과 rubric ID set이 같은지, 각 `maxScore`가 rubric weight와 같은지, `totalScore`가 합과 같은지를 매번 대조한다. 가중치의 정본은 schema가 아니라 rubric이다.

`excludedPriorReports`에는 평가 전에 열지 않은 이전 점수 파일이 명시돼야 한다. 평가자는 제출 뒤에만 이전 round를 읽고 regression note를 추가할 수 있으며 최초 score를 바꿀 수 없다.

`PlanFactAudit`는 점수와 별도로 다음을 current worktree에서 검사한다.

- 계획이 `기존`, `수정`, `신규`, `소비`, `선행 산출물 소비`, `현재 초안`으로 표시한 path의 baseline·current 존재 기대와 owner 중복
- 기존 symbol과 gate registry의 실제 존재
- 신규 root·package·schema가 repository structure, packaging, generated output에 연결됐는지
- lesson·taxonomy·check 수치의 재현 command와 snapshot hash
- dependency graph cycle, bootstrap-before-use, rollback reader compatibility

## 영향 파일

- 현재 초안 `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/00-evaluation-contract/evaluation-report.schema.yml`
- 현재 초안 `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/00-evaluation-contract/rubric.yml`
- 현재 비판정 snapshot `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/00-evaluation-contract/author-fact-audit.snapshot.yml`
- 신규 `tests/product/verifyPrdEvaluationReport.py`
- 계약 정의 `tests/product/verifyPlanFactAudit.py` (생성 owner는 02-completion-and-gate-bootstrap)
- 수정 `tests/run.py`, `.github/workflows/ci.yml`
- 수정 `docs/skills/ops/foundation/testing-and-gates.md`

## 영향 함수·심볼

- 신규 `PrdEvaluationReport`, `Finding`, `EvidenceRef`, `EvidenceMaturity`, `PrdIntegrityRubric`
- 신규 `verifyEvaluatorIndependence`, `verifyRubricHash`, `verifyPlanFacts`

## 테스트

- 목표 점수·이전 점수가 prompt scope에 포함된 report 거부
- rubric hash 변경, score 합산 오류, 근거 없는 감점·가점, duplicate finding 거부
- scope commit·dirty diff·manifest hash가 bundle manifest와 다르거나 dimension ID가 rubric과 정확히 일치하지 않거나 중복되면 거부
- product evidence stage가 current implementation·자동 검증·사람 검수 근거 없이 E2 이상이면 거부
- rubric에 target score·pass threshold가 생기거나 dimension 합이 100이 아니면 거부
- 점수 100 표만 있고 raw report가 없는 round 거부
- 실제 path·symbol·gate가 틀린 synthetic plan을 fact audit가 거부

## 롤백

- schema 변경은 version을 올리고 이전 report reader를 유지한다.
- 새 evaluator protocol이 실패하면 이전 점수를 복원하지 않고 round를 invalid로 보존한다.

## 평가

### 개발자 관점

- parser는 점수표가 존재하는지만 보지 않고 rubric hash, report completeness와 fact audit artifact를 검증해야 한다.

### PM 관점

- 낮은 점수도 제품 위험을 드러내는 유효 결과다. 평가자에게 상승 방향을 암시하지 않는다.
