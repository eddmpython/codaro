# 00 제품 계약

상태: 설계

## 목표

분산된 학습, IDE, 앱, 임베딩, publication, 자동화 설명을 하나의 북극성과 검증 가능한 claim matrix로 합친다. 문서가 구현보다 넓거나 과거 예정 gate를 현재 미완성처럼 가리키는 상태를 제거한다.

## 구현 순서

1. `docs/skills/architecture/python-product-journey.md`를 추가해 source부터 SDK와 publication까지의 단계, owner, 증거 gate, 비검증 경계를 링크 중심으로 정의한다. compiler, builder, proof 세부 규칙을 이 문서에 복제하지 않는다.
2. `CLAUDE.md` 정체성을 북극성 문장으로 바꾸고 `syncAgentsMd.py`로 `AGENTS.md` 포인터를 재생성한다.
3. `world-class-blueprint.md`의 한 줄 정의, 카테고리, 성공 정의, North Star Metrics, Verification Matrix를 current gate 이름으로 갱신한다. `learning-to-automation-e2e`는 이미 더 강한 `learning-product-bridge`로 대체됐음을 반영하고 중복 gate를 만들지 않는다.
4. `README.md` 첫 설명, Python 앱과 배포, 비교표, PyPI 절을 같은 claim matrix에 맞춘다. “범용 IDE 완전판” 대신 “Codaro형 local-first Python IDE”를 사용한다.
5. identity 문서와 docs 인덱스를 갱신하고 docs gate로 local link와 generated catalog를 확인한다.

## 영향 파일

- `CLAUDE.md`, `AGENTS.md`, `README.md` - 사용자와 작업 에이전트가 읽는 최상위 정의.
- `docs/skills/ops/product/world-class-blueprint.md` - 제품 성공 정의와 metric SSOT.
- `docs/skills/identity/multi-editor-modes.md` - 앱을 다섯 번째 편집기가 아니라 IDE source의 projection으로 유지.
- `docs/skills/identity/mounting-and-integration.md` - `createServerApp` 공개 import와 GUI/API 관계.
- `docs/skills/architecture/python-product-journey.md`, `docs/skills/README.md` - 전체 여정 계약과 문서 탐색 경로.
- `examples/apps/referenceProducts.json`, `tests/publication/testReferenceProducts.py`, `tests/surface/verifyPublicProductClaims.py` - machine-verified 및 not-verified claim 경계.

## 영향 함수·심볼

- `CLAUDE.md::정체성` - 북극성의 사람 및 에이전트 SSOT.
- `referenceProducts.json::claimBoundary` - IDE, app, embed, publication, SDK 중 공개 가능한 사실과 비검증 사실.
- `testReferenceClaimsStayInsideMachineVerifiedBoundary()` - 공용 URL, 인간 학습 효과, source 은닉을 완료 claim에서 차단.
- `verifyPublicProductClaims.py`의 README 및 landing claim 검사 - 문구가 current reference/gate 범위를 넘으면 실패.
- `syncAgentsMd.py::main()` - CLAUDE 포인터 재생성.

## 테스트

- `uv run python -X utf8 docs/skills/ops/tools/syncAgentsMd.py` 실행 후 의도치 않은 AGENTS 본문 복제가 없는지 확인한다.
- `uv run python -X utf8 -m pytest -q tests/publication/testReferenceProducts.py tests/surface/testProductSurfaceContract.py`.
- `uv run python -X utf8 tests/surface/verifyPublicProductClaims.py`.
- `uv run python -X utf8 tests/run.py gate docs`와 `uv run python -X utf8 tests/run.py gate reference-products`.
- `git diff --check`와 문서 및 curricula의 U+2014 검색 결과 0건.

## 롤백

- 정체성, claim boundary, 문서 인덱스를 한 commit으로 묶고 `git revert <sha>`로 되돌린다.
- `CLAUDE.md`만 선택적으로 되돌리지 않는다. 반드시 `AGENTS.md`, README, blueprint, 새 architecture 문서를 같은 상태로 복원한다.
- 이 workstream은 runtime schema와 저장 데이터를 바꾸지 않으므로 데이터 migration 롤백은 없다.

## 평가

- 개발자 렌즈: 새 문서는 기존 compiler 및 publication 문서의 알고리즘을 복제하지 않고 단계와 owner만 연결한다. stale gate 이름을 새 구현으로 중복 생성하지 않고 current 강한 gate에 매핑한다.
- PM 렌즈: IDE라는 단어를 단순 마케팅으로 추가하지 않는다. 사용자가 작성, 실행, 앱화, 부분 재사용, 자동화, 배포까지 기대할 수 있는 범위와 기대하면 안 되는 범위를 첫 화면에서 구분한다.
