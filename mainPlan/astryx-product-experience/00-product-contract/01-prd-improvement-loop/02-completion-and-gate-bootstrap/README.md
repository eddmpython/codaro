# 02 Completion And Gate Bootstrap

상태: 진행

## 목표

존재하지 않는 completion tool과 self-reported score parser를 완료 근거로 쓰는 순서 모순을 없앤다. 이 packet이 00의 첫 구현 packet이며, 이후 모든 packet이 동일한 completion evidence와 실제 red-to-green gate를 사용한다.

## bootstrap 순서

1. commit A에 `mainPlan/completion-evidence.schema.yml`, transition ledger schema, packet completion tool과 verifier를 고정한다.
2. clean A에서 gate를 실행하고 A를 가리키는 report와 bootstrap packet evidence만 commit E에 고정한다. 자기 commit hash를 같은 파일 안에 쓰는 불가능한 self-reference를 요구하지 않는다.
3. A에 포함된 새 tool을 clean E에서 실행해 `E^=A`를 확인하고 이 bootstrap packet의 move와 transition row를 준비해 그 변경만 commit B로 만든다. manual transition 예외는 두지 않는다.
4. 신규 product gate는 runner에 non-blocking red로 먼저 등록하고 negative fixture가 실제로 실패하는지 증명한다.
5. owner workstream이 green evidence를 만든 뒤에만 blocking·CI required로 승격한다.
6. `plan-quality`는 점수 parser가 아니라 evaluation report completeness와 `PlanFactAudit`를 함께 요구한다.

Python·TypeScript·Rust가 함께 소비하는 wire schema source는 root `contracts/`로 채택한다. 첫 schema와 같은 commit에서 `repository-structure.md`, `ssot-map.md`, `verifyRootClean.py`, docs index, wheel/editor/launcher packaging을 갱신한다. runtime은 root source를 임의로 읽지 않고 contract generator가 만든 각 surface generated type을 소비하며 freshness gate가 source hash를 대조한다.

## 영향 파일

- 신규 `mainPlan/completion-evidence.schema.yml`
- 신규 `mainPlan/completion-transition.schema.yml`, `mainPlan/completion-transition-ledger.yml`
- 신규 `docs/skills/ops/tools/completeMainPlanPacket.py`
- 신규 `tests/plan/verifyMainPlanCompletion.py`
- 신규 `tests/product/verifyPlanFactAudit.py`
- 선행 산출물 소비 `tests/product/verifyPrdEvaluationReport.py` (생성 owner는 `00-evaluation-contract`); 신규 `tests/product/bootstrapAfterUse.fixture.yml`
- 신규 `contracts/artifactOwnership.schema.json`, `contracts/artifactOwners.yml`
- 신규 `docs/skills/ops/tools/genProductContracts.py`
- 생성 `src/codaro/generatedContracts/`, `editor/src/lib/generatedContracts/`, `launcher/codaro-launcher/src/generated_contracts/`
- 수정 `tests/run.py`, `.github/workflows/ci.yml`
- 수정 `docs/skills/architecture/repository-structure.md`, `docs/skills/architecture/ssot-map.md`, 관련 docs index, `tests/verifyRootClean.py`
- 수정 backend diagnostic export, editor build, launcher doctor와 release workflow의 contract codegen·packaging

## 영향 함수·심볼

- 신규 `prepareCompletionTransition`, `verifyCompletionTransition`, `verifyPlanFacts`
- 신규 `GATES["plan-quality"]`, `GATE_ARTIFACTS["plan-quality"]`
- 신규 `ArtifactOwner`, `ArtifactRole`

## 테스트

- 정상 move와 stale implementation commit, report hash 변조, 허용 외 diff, 끊긴 parent link 거부
- 임시 Git repository에서 implementation A → evidence E → transition B round-trip 검증
- duplicate packet/from path/nonce/transition ID와 concurrent branch fixture 거부
- 등록 전 green을 가장한 gate, negative fixture를 통과시키는 verifier, 점수표만 있는 plan-quality report 거부
- 신규 root 결정 양쪽 ADR에서 root-clean·clean checkout codegen·packaging 결과 검증

## 롤백

- bootstrap tool 실패 시 packet 이동을 만들지 않고 active tree에 둔다.
- 이미 기록된 transition row는 삭제하지 않고 compensating correction row만 허용한다.

## 평가

### 개발자 관점

- 완료 도구는 마지막 release workstream이 아니라 모든 작업보다 먼저 존재해야 한다.
- self-score와 fact audit를 같은 함수에서 처리하지 않는다.

### PM 관점

- gate 수보다 실제로 현재 실패를 잡고 owner가 green으로 바꿀 수 있는지가 중요하다.
