# 00 Python 제품 완결

상태: 구현 중

## 목표

Codaro를 범용 편집기 복제품이 아니라 **평범한 Percent Python 파일을 학습, 작성, reactive 실행하고 같은 소스를 전체 앱, 선택 기능 블록, 자동화 태스크, Python SDK로 승격하는 local-first Python IDE**로 고정한다. browser, server, local, embed publication은 별도 제품이 아니라 이 IDE가 내보내는 검증된 산출물이어야 한다.

## 북극성

> Codaro는 평범한 Python 파일을 학습하고 개발하는 local-first Python IDE다. 같은 소스를 다시 작성하지 않고 전체 앱, 선택한 기능 블록, 자동화 태스크와 재사용 가능한 Python API로 승격하고 browser, server, local에 검증된 산출물로 publication한다.

이 문장은 목표 상태다. 현재 제품이 이 문장을 주장하려면 공개 import, 편집기 앱 projection, compiler target 판정, 네 publication target, deployment receipt, 자동화 proof, 실제 wheel 설치가 한 검증 체인으로 통과해야 한다.

## 범위

1. [02 제품 여정](02-product-journey/README.md)에서 IDE, 앱, 부분 embed, publication, 자동화를 current commit의 단일 gate sequence로 증명한다.

## 제품 경계

- Codaro형 IDE의 필수 범위는 Percent Python 편집과 저장, reactive 실행, 변수와 출력 확인, 앱 preview, publication 작업면, 자동화 승격이다.
- VS Code급 source control UI, 범용 debugger, extension marketplace, 실시간 공동 편집은 이 이니셔티브의 약속이 아니다.
- 앱 `shared` 상태, 공개 server의 source 은닉, 외부 provider의 지속성, 공용 DNS, TLS, uptime은 지원으로 낮춰 말하지 않고 명시적 비검증 경계로 남긴다.
- PyPI는 개발자 설치와 Python SDK 채널이다. Windows 일반 사용자 설치는 계속 GitHub Release manifest가 고정한 runtime과 exact wheel을 사용한다.
- 버전 변경, tag, GitHub Release, PyPI publish는 사용자 릴리즈 요청이 있어야만 별도 릴리즈 게이트로 수행한다. 이 initiative의 자력 종료 조건에는 포함하지 않는다.

## 구현 순서

1. 기존 publication 및 proof gate를 재사용하는 `python-product` sequence를 만들고 reference claim을 current evidence에 결속한다.
2. workstream의 구현, 지정 gate, 문서 갱신이 끝나면 해당 폴더를 삭제한다. 모든 workstream이 사라지면 이 initiative와 활성 링크를 삭제한다.

## 종료 조건

- `from codaro import App, createServerApp, ui`와 `codaro.__version__`이 빌드된 wheel의 빈 환경에서 동작한다.
- `uvx codaro --help`와 `uv add codaro` 기반 import가 같은 wheel을 사용한다.
- 같은 Percent Python source의 plain Python 실행성, app preview, browser publication, interactive 및 editable embed, 자동화 proof가 보존된다.
- server secret 비노출, session 격리, local policy 승인, 손상 bundle 거부, rollback, invalid embed origin과 protocol 거부가 기존 강도를 유지한다.
- `python-sdk` gate와 `python-product` sequence가 current clean commit에서 통과한다.
- `quality-cycle`과 `preflight`가 통과하고 제품 문구가 machine-verified 범위를 넘지 않는다.

## 영향 파일

- `CLAUDE.md`, `AGENTS.md`, `README.md`, `pyproject.toml` - 정체성, 설치 경로, package metadata 정합.
- `docs/skills/ops/product/world-class-blueprint.md`, `docs/skills/identity/multi-editor-modes.md`, `docs/skills/identity/mounting-and-integration.md` - 북극성과 제품 경계 갱신.
- `docs/skills/architecture/python-product-journey.md`, `docs/skills/README.md` - 새 전체 여정 계약과 문서 인덱스.
- `src/codaro/__init__.py`, `src/codaro/server.py`, `src/codaro/publication/__init__.py` - 공개 SDK import와 기존 owner 연결.
- `examples/apps/browser-calculator/app.py`, `examples/apps/csv-dashboard/app.py`, `examples/apps/snapshot-report/app.py`, `examples/apps/server-secret-app/app.py` - 내부 모듈이 아닌 공개 SDK 소비.
- `docs/skills/ops/tools/buildPythonDistribution.py`, `tests/packaging/testPythonSdk.py`, `tests/packaging/verifyPythonSdk.py` - 비파괴 배포판 build와 설치 검증.
- `tests/run.py`, `docs/skills/ops/foundation/testing-and-gates.md`, `.github/workflows/ci.yml` - `python-sdk` gate와 `python-product` sequence 등록.
- `.github/workflows/publish.yml`, `.github/workflows/publish.yaml`, `.github/workflows/product-release.yml` - 로컬 gate와 같은 package build owner 사용.
- `tests/publication/testReferenceProducts.py`, `tests/publication/verifyReferenceProducts.py`, `tests/publication/verifyReferenceProductsPlaywright.py`, `tests/learning/verifyLearningProductBridgePlaywright.py` - 공개 claim과 단일 소스 여정 결속.

## 영향 함수·심볼

- `codaro.__all__`, `codaro.__version__`, `codaro.createServerApp` - 최상위 공개 API 계약.
- `server.py::createServerApp()` - FastAPI, Django ASGI 분기, Flask WSGI wrapping이 소비하는 기존 server factory owner.
- `appRuntime.py::App`, `outputDescriptor.py::ui`, `outputDescriptor.py::hstack`, `outputDescriptor.py::stat` - reference source가 사용하는 공개 authoring API.
- `publication.compiler::compileDocument()`과 `compileExecutableUnit()` - browser, server, local target 판정의 단일 owner.
- `PublicationWorkbench.build()`, `verify()`, `serve()`, `deploy()`, `rollback()` - GUI, HTTP API, Python 제품 여정이 공유하는 publication 조립 경계.
- `buildPythonDistribution.py::buildPythonDistribution()`과 `verifyPythonDistribution()` - curricula와 webBuild를 임시 build context에 넣고 wheel 및 sdist를 검증하는 새 owner.
- `tests.run::GATES`, `PYTHON_PRODUCT_GATES`, `runGateSequence()` - SDK gate와 제품 완결 sequence.

## 테스트

- 집중: `uv run python -X utf8 -m pytest -q tests/packaging/testPythonSdk.py tests/runtime/testAppRuntime.py tests/runtime/testServerApi.py tests/publication/testReferenceProducts.py`.
- SDK: `uv run python -X utf8 tests/run.py gate python-sdk`가 wheel과 sdist build, 빈 venv install, `uv add`, `uvx`, 공개 import, package data를 검증한다.
- 제품: `uv run python -X utf8 tests/run.py python-product`가 architecture, app runtime, compiler, browser/server/local/embed, learning-product-bridge, deployment-adapters, reference-products, automation-ide-audit를 current commit에서 순차 실행한다.
- 프론트: `npm --prefix editor run check`, `npm --prefix editor run build`, 필요한 reference product Chromium 검증.
- 정책: `uv run python -X utf8 -m pytest -q tests/plan/testMainPlanTodoPolicy.py`, `uv run python -X utf8 tests/run.py audit-self`, `uv run python -X utf8 tests/run.py preflight`.
- 최종: `uv run python -X utf8 tests/run.py quality-cycle`에서 이 목표와 무관한 soft skip은 숨기지 않고 보고하며, SDK 및 제품 여정 gate는 hard green이어야 한다.

## 롤백

- workstream별 한 의도 commit으로 구현하고 각 commit은 `git revert <sha>`로 되돌린다.
- 제품 문구 commit을 되돌릴 때 `CLAUDE.md`, `AGENTS.md`, README와 docs 인덱스를 함께 되돌려 서로 다른 북극성이 남지 않게 한다.
- SDK commit을 되돌릴 때 root export, package verifier, 세 workflow를 함께 되돌려 로컬과 배포 build 경로가 갈라지지 않게 한다.
- gate sequence commit은 제품 runtime을 바꾸지 않으므로 `tests/run.py`, gate 문서, CI wiring을 한 묶음으로 되돌린다.
- release, tag, 외부 PyPI artifact는 만들지 않으므로 이 initiative 자체의 외부 파괴적 롤백은 없다.

## 평가

- 개발자 렌즈: 새로운 runtime이나 publication 규칙을 만들지 않고 `createServerApp`, `PublicationWorkbench`, compiler, builder를 owner로 재사용한다. Python root import는 server를 중복 초기화하지 않아야 하며 실제 wheel에서 import cycle과 package-data 누락을 잡는다. 임시 build context는 tracked source와 root curricula를 복사하되 작업트리의 `src/codaro/curricula`를 생성하거나 삭제하지 않는다.
- PM 렌즈: 사용자가 원하는 것은 기능 목록이 아니라 “한 Python 소스가 IDE에서 제품으로 자라는가”다. 따라서 북극성 문구만 고치지 않고 설치 가능한 SDK, 전체 앱, 부분 embed, publication, 자동화까지 하나의 종료 기준으로 묶는다. 범용 IDE 기능과 공용 hosting을 약속에서 제외해 베타 제품의 실제 우위를 흐리지 않는다.
