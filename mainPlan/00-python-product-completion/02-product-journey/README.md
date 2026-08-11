# 02 제품 여정

상태: 설계

## 목표

이미 존재하는 editor, app runtime, publication, embed, proof, automation 구현을 중복 조립하지 않고 한 명령으로 검증한다. 제품 완결 판정은 개별 unit test 수가 아니라 same-source 사용자 여정과 부정 경계가 current commit에서 함께 통과하는가로 결정한다.

## 검증 여정

```text
Percent Python source
-> plain Python 실행과 IDE 편집
-> reactive graph와 앱 preview
-> compiler의 browser, server, local 판정
-> 전체 app publication 또는 entry closure embed
-> verify, serve, deploy, rollback
-> strong learning evidence에서 기능 블록과 자동화 proof 승격
-> reference product의 desktop 및 mobile 소비
```

## 구현 순서

1. `PYTHON_PRODUCT_GATES`를 `tests/run.py`에 추가해 기존 gate를 의존 순서로 조합한다. `python-product` CLI command와 sequence summary를 추가하되 기존 gate 명령을 복사하지 않는다.
2. sequence에 `root-clean`, `docs`, `backend`, `architecture-boundary`, `python-sdk`, `app-runtime`, `publication-compiler`, `static-publication`, `server-publication`, `local-publication`, `block-embedding`, `learning-product-bridge`, `deployment-adapters`, `reference-products`, `automation-ide-audit`를 포함한다.
3. `referenceProducts.json`과 검증기를 확장해 plain Python, public SDK import, app projection, embed mode, target publication, proof 및 claim boundary를 source별로 추적한다.
4. `verifyReferenceProductsPlaywright.py`는 existing five products를 유지하면서 계산기 embed의 output, interactive, editable 소비와 server/local 부정 경계를 확인한다. 새 데모를 추가해 약한 성공 경로를 만들지 않는다.
5. `world-class-blueprint` Verification Matrix와 gate 문서를 `python-product` sequence에 연결하고 CI는 `python-sdk`를 독립 hard gate로 실행한다. 전체 긴 sequence는 quality-cycle이 소유한다.

## 영향 파일

- `tests/run.py`, `docs/skills/ops/foundation/testing-and-gates.md`, `.github/workflows/ci.yml` - sequence, gate artifact, self-audit, CI wiring.
- `examples/apps/referenceProducts.json`, `contracts/referenceProducts.schema.json`, `docs/skills/ops/tools/genProductContracts.py` - journey 및 claim schema.
- `tests/contracts/testApplicationContracts.py`, `tests/publication/testReferenceProducts.py`, `tests/publication/verifyReferenceProducts.py` - machine contract와 source 불변성.
- `tests/publication/verifyReferenceProductsPlaywright.py`, `tests/runtime/verifyPlaywrightAppRuntime.py` - app preview와 desktop/mobile publication 소비.
- `tests/learning/testLearningProductBridge.py`, `tests/learning/verifyLearningProductBridgePlaywright.py` - strong evidence, 기능 승격, Task input, operational proof의 same-source 결속.
- `tests/automation/verifyAutomationIdeAudit.py` - task, schedule, webhook, workflow, E-Stop, audit의 제품 표면.
- `docs/skills/architecture/python-product-journey.md`, `docs/skills/architecture/reference-products.md`, `docs/skills/architecture/learning-product-bridge.md` - sequence가 증명하는 경계.

## 영향 함수·심볼

- `tests.run::PYTHON_PRODUCT_GATES` - 제품 완결 전용 gate 순서.
- `tests.run::runGateSequence()`과 CLI `python-product` branch - current commit을 한 sequence summary에 결속.
- `referenceProducts.json::products[].journey` - source별 plain Python, app, build, serve, embed, deploy, rollback 단계.
- `referenceProducts.json::claimBoundary` - machineVerified와 notVerified 범위.
- `testReadmePublicationQuickstartRunsWithActualCli()` - 문서 명령과 실제 CLI 계약.
- `verifyReferenceProducts.py::main()` - 다섯 source, target, proof, source 불변성의 machine report.
- `verifyReferenceProductsPlaywright.py::main()` - desktop/mobile UI, external request, console error, state 격리, embed 동작.
- `verifyLearningProductBridgePlaywright.py::main()` - 학습 source가 기능과 자동화로 승격되는 실제 화면 여정.

## 테스트

- 각 수정 중에는 소유 gate를 실행한다: `app-runtime`, `publication-compiler`, `static-publication`, `server-publication`, `local-publication`, `block-embedding`, `learning-product-bridge`, `deployment-adapters`, `reference-products`, `automation-ide-audit`.
- 통합 판정은 `uv run python -X utf8 tests/run.py python-product` 한 명령으로 수행하며 15개 gate가 모두 hard green이어야 한다.
- `uv run python -X utf8 tests/run.py audit-self`가 gate 수, 문서 등록, CI 등록, unknown sequence member를 검사한다.
- `uv run python -X utf8 tests/run.py quality-cycle`과 `uv run python -X utf8 tests/run.py preflight`를 current clean commit에서 실행한다.
- product report의 `gitHead`, sequence summary의 `gitHead`, current HEAD가 같아야 하며 stale artifact는 통과로 세지 않는다.

## 롤백

- reference contract 확장과 verifier 변경을 한 commit, `python-product` sequence wiring을 별도 commit으로 둔다.
- reference schema를 revert할 때 generated Python 및 TypeScript 계약과 tests fixture를 함께 되돌린다.
- sequence revert는 `tests/run.py`, gate 문서, CI만 되돌리며 이미 검증된 publication runtime을 제거하지 않는다.
- 외부 publication과 release를 만들지 않으므로 사용자 배포물을 되돌리는 단계는 없다.

## 평가

- 개발자 렌즈: 기존 강한 gate를 새 이름 아래 복사하면 유지보수와 artifact freshness가 갈라진다. sequence는 오직 기존 gate를 조합하고 새 `python-sdk`만 실제 미검증 경계를 채운다. reference schema는 다섯 제품 고정을 유지하며 target별 기능을 약한 공통분모로 낮추지 않는다.
- PM 렌즈: 사용자는 gate 개수보다 같은 코드가 IDE에서 앱, 일부 embed, 자동화로 이어지는 결과를 원한다. sequence와 claim matrix가 그 여정을 직접 설명하고, 공용 hosting이나 source 은닉처럼 아직 증명하지 않은 기대는 명시적으로 제외한다.
