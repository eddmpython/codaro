# 08 R10 Independent Review

상태: 대기

## 목표

R9가 드러낸 결함을 문서 작성자가 스스로 닫았다고 선언하지 못하게 한다. 02~07 remediation의 plan-internal P0·P1 closure evidence가 준비된 뒤, 이전 round 점수와 결론을 보지 않은 새 평가자가 현재 PRD와 current worktree를 독립적으로 반증한다.

## 현재 준비 상태

2026-07-22 `buildPrdEvaluationBundle.py --write`는 당시 source에서 2,339개 파일을 history-free ZIP으로 생성했고, 파일 manifest·dirty diff·archive SHA-256 `692a6ba56a24eb1691502870f07fdff95f6618516331f28b2e034e8bdb31e08d`와 exclusion 목록을 `evaluation-bundle.manifest.yml`에 기록했다. 이후 2026-07-23 Astryx surface, 472개 public route, `RunRouteState@1`, canonical mastery와 full learning archive v2가 통합됐으므로 이 bundle은 현재 source 입력이 아니다. 새 current Git head와 dirty diff로 다시 생성·감사하기 전에는 evaluator에게 제출할 수 없다. ZIP의 모든 entry는 읽기 전용이며 specialist review, PRD 개선 이력, `_done`, output·dist·build·cache를 포함하지 않는 원칙은 유지한다.

기존 bundle integrity와 draft fact audit도 R10 통과가 아니다. 입력 manifest와 scope는 unsealed·stale이고 02~07·09 remediation closure, 세 명의 독립 evaluator 배정, raw report·finding ledger가 없다. Local·Web reader floor, canonical mastery, full archive와 weak-only 0은 machine 구현 사실일 뿐 독립 검수와 전 release compatibility matrix를 대신하지 않는다. 따라서 manifest는 `state: draft`, `sealEligible: false`이며 현재 R10 점수와 통과 판정은 없다. `--seal`은 current bundle, 각 remediation closure evidence·fact audit·negative fixture와 세 evaluator의 독립성·conflict·서명이 모두 유효할 때만 성공해야 한다.

## 착수 조건

- 02~07 각 finding의 상태, 수정 path, fact audit command, negative fixture, owner가 `r10-input-manifest.yml`에 고정돼 있다.
- rubric version·hash와 평가 scope commit·dirty diff hash를 제출 전에 고정한다.
- evaluator에게 전체 worktree 접근을 주지 않는다. `buildPrdEvaluationBundle.py`가 만든 read-only bundle만 제공한다.
- bundle은 current product PRD와 current source·test·curriculum·build manifest를 포함하되 `00-specialist-review/**`, `01-prd-improvement-loop/**`, 이전 score summary, output·build·cache를 물리적으로 제외한다.
- evaluator용 rubric은 history 문장이 없는 versioned `rubric.yml`만 bundle에 넣고 source path·SHA-256을 manifest에 기록한다.
- 학습, UX, 아키텍처 평가자는 서로의 초안과 점수를 제출 전까지 보지 않는다.
- remediation 작성자와 이전 round 평가자는 R10 evaluator가 될 수 없다.
- `evaluator-roster.yml`은 evaluator ID, 전문 분야, remediation·이전 round 참여 여부, conflict-of-interest, 사용 가능 기간과 서명을 기록한다. 세 분야 모두 적격 evaluator가 배정되지 않으면 round를 시작하지 않는다.
- 요청문에 목표 점수, 최소 통과 점수, 점수 상승 요구, 원하는 결론을 넣지 않는다.

## 실행·판정

1. 세 평가자는 frozen rubric으로 PRD integrity를 채점하고 product evidence maturity E0~E4를 근거 reference와 함께 별도 판정한다.
2. 모든 감점은 current file·line·symbol·data command와 counter-evidence를 가진 structured YAML raw report로 제출한다. 같은 이름의 Markdown은 해설 view이며 score·severity 정본이 아니다.
3. 세 report가 봉인된 뒤에만 finding을 비교해 중복 사실을 canonical ID 하나로 합친다. 원문 severity와 점수는 바꾸지 않는다.
4. root fact audit가 path existence, symbol, gate registry, lesson 수치, dependency cycle, bootstrap order, rollback reader compatibility를 다시 실행한다.
5. plan-internal P0는 전체 구현 착수를, P1은 해당 dependency 착수를 차단한다. P2는 owner와 검토 시점 없이 backlog로 숨길 수 없다.
6. R10이 R9보다 낮아도 그대로 기록한다. 수정이 필요하면 새 remediation packet을 만들고, 다음 round는 새 evaluator와 새 폴더에서 시작한다.

PRD 점수는 구현 완료 판정이 아니다. E2 이상은 실행 가능한 vertical slice, 자동 검증 결과, 사람 검수 기록, current commit hash가 함께 있을 때만 부여한다.

## 산출물

- 현재 차단 초안 `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/08-r10-independent-review/r10-input-manifest.yml`
- 현재 차단 초안 `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/08-r10-independent-review/evaluator-roster.yml`
- 현재 draft `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/08-r10-independent-review/evaluation-bundle.manifest.yml`
- 신규 `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/08-r10-independent-review/reports/learning.yml`, 읽기 view `learning.md`
- 신규 `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/08-r10-independent-review/reports/ux.yml`, 읽기 view `ux.md`
- 신규 `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/08-r10-independent-review/reports/architecture.yml`, 읽기 view `architecture.md`
- 신규 `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/08-r10-independent-review/fact-audit.json`
- 신규 `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/08-r10-independent-review/finding-ledger.yml`
- 구현 `docs/skills/ops/tools/buildPrdEvaluationBundle.py`
- 구현 `docs/skills/ops/tools/buildPrdRoundFactAudit.py`

## 완료 조건

세 raw report, fact audit, canonical finding ledger, remediation response가 모두 같은 evaluation bundle hash, scope Git commit, dirty diff hash와 scope manifest hash를 참조해야 한다. evaluator roster의 conflict가 0이고 bundle exclusion audit가 통과해야 한다. 결과가 높다는 이유로 완료하지 않는다. 02의 completion tool이 artifact hash와 허용 diff를 검증하고 이 packet을 `_done/`으로 이동한 transition row를 만들기 전에는 상태를 `완료`로 바꾸지 않는다.

## 영향 파일

- 현재 차단 초안 `r10-input-manifest.yml`, `evaluator-roster.yml`; seal 때 신규 `evaluation-bundle.manifest.yml`, `fact-audit.json`, `finding-ledger.yml`
- 신규 structured raw `reports/learning.yml`, `reports/ux.yml`, `reports/architecture.yml`
- 신규 읽기 view `reports/learning.md`, `reports/ux.md`, `reports/architecture.md`
- 구현 `docs/skills/ops/tools/buildPrdEvaluationBundle.py`
- 구현 `docs/skills/ops/tools/buildPrdRoundFactAudit.py`
- 수정 `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/README.md`

## 영향 함수·심볼

- 구현 `buildPrdEvaluationBundle`, `buildEvaluationScopeManifest`, `verifyExcludedPriorReports`, `verifyEvaluatorRoster`
- 계획 단계 `sealIndependentReport`, `mergeCanonicalFindings`, `verifyRoundEvidence`

## 테스트

- 이전 score path, 목표 점수 문구, 동일 evaluator ID, rubric hash drift가 있는 input manifest 거부
- bundle 안에 제외 path, prior round report hash, output·build·cache가 하나라도 있거나 manifest에 없는 파일이 있으면 거부
- `uv run --no-sync python -X utf8 docs/skills/ops/tools/buildPrdEvaluationBundle.py --write`
- `uv run --no-sync python -X utf8 docs/skills/ops/tools/buildPrdEvaluationBundle.py --check`
- `uv run --no-sync python -X utf8 docs/skills/ops/tools/buildPrdEvaluationBundle.py --seal` (모든 pre-seal 조건 충족 뒤에만 허용)
- `uv run --no-sync python -X utf8 docs/skills/ops/tools/buildPrdRoundFactAudit.py --write`
- `uv run --no-sync python -X utf8 docs/skills/ops/tools/buildPrdRoundFactAudit.py --check`
- evaluator roster의 remediation 참여, 이전 round 참여, conflict, 중복 evaluator, 배정 누락 거부
- 세 YAML report 중 하나가 먼저 다른 report를 참조하거나 raw score가 Markdown·ledger에서 바뀌면 거부
- 근거 없는 점수, 재현 불가 path·symbol, 중복 canonical finding, 누락된 counter-evidence 거부
- rubric dimension 누락·중복·unknown ID, scope hash 불일치, evidence reference 없는 product maturity 거부
- 낮아진 총점과 새 P0가 손실 없이 round 결과에 남는 positive fixture
- 소비 `uv run python -X utf8 tests/run.py gate plan-quality` (생성 owner는 02-completion-and-gate-bootstrap)

## 롤백

- evaluator 독립성이나 scope 봉인이 깨지면 report를 삭제하지 않고 round 전체를 `invalid`로 기록한다.
- 잘못된 rubric이 발견되면 R10 점수를 재계산하지 않고 rubric version을 올려 새 round를 만든다.
- 새 P0·P1이 나오면 이전 remediation을 완료로 유지하지 않고 관련 packet을 active tree로 되돌리는 compensating transition을 기록한다.

## 평가

### 개발자 관점

- current worktree fact audit와 negative fixture가 없는 점수는 gate 입력이 될 수 없다.
- 같은 작성자가 수정과 재채점을 모두 소유하지 않아야 누락된 bootstrap·rollback 결함이 다시 보인다.

### PM 관점

- 좋은 결과는 높은 숫자가 아니라 사용자의 학습 여정과 release risk를 숨기지 않는 report다.
- 평가 round 수를 늘리는 것이 목적이 아니다. 새 사실이 없으면 구현 증거를 만들고, 결함이 있으면 owner가 있는 packet으로 되돌린다.
