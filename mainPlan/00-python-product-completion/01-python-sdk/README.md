# 01 Python SDK

상태: 설계

## 목표

PyPI wheel을 Codaro CLI를 담은 운반체에 그치지 않고 실제 Python 라이브러리로 사용 가능하게 한다. 저장소 checkout이 아닌 빈 환경의 built wheel에서 공개 import, server mount, authoring helper, CLI, package data가 같은 계약으로 동작해야 한다.

## 공개 API 결정

- 최상위 `codaro`는 `App`, `createServerApp`, `ui`, layout 및 output helper, `state`, `stop`, `tool`, `main`, `__version__`만 공개한다.
- `codaro.publication`은 compiler, builder, verifier, deployment adapter를 사용하는 고급 namespace로 유지한다. 해당 심볼 전체를 root로 재수출하지 않는다.
- `createServerApp`은 `src/codaro/server.py` 구현을 직접 재수출하며 별도 wrapper나 복제 factory를 만들지 않는다.
- `__version__`은 `importlib.metadata.version("codaro")`가 owner다. source tree에서 distribution metadata가 없을 때만 `PackageNotFoundError`를 좁게 처리한다.
- reference product는 `codaro.outputDescriptor` 같은 내부 경로 대신 `from codaro import ui, hstack, stat`을 사용해 실제 공개 API 소비자가 된다.

## 구현 순서

1. `src/codaro/__init__.py` export와 version을 고치고 source 환경 단위 테스트로 import cycle과 exact `__all__`을 잠근다.
2. `buildPythonDistribution.py`가 OS temp의 build context에 current working source, editor webBuild, root curricula를 복사하고 `uv build`를 실행하게 한다. 실제 작업트리의 ignored package 사본을 만들지 않는다.
3. `verifyPythonSdk.py`가 wheel 및 sdist payload를 검사하고 빈 venv 두 개에서 직접 wheel install과 `uv add --find-links`를 각각 수행한다.
4. 설치 환경에서 root public imports, version, `createServerApp` mount, `codaro --help`, reference source의 plain Python 실행을 확인한다.
5. publish alias 두 개와 product release workflow가 같은 build tool을 호출하게 해 CI 전용 shell staging을 제거한다.

## 영향 파일

- `src/codaro/__init__.py`, `src/codaro/server.py`, `src/codaro/publication/__init__.py` - 공개 import와 기존 고급 namespace.
- `pyproject.toml`, `uv.lock` - package description, IDE와 publication keyword, build metadata 정합. 의존성을 바꾸지 않으면 lock은 check만 수행한다.
- `examples/apps/browser-calculator/app.py`, `examples/apps/csv-dashboard/app.py`, `examples/apps/snapshot-report/app.py`, `examples/apps/server-secret-app/app.py` - 공개 helper import.
- `docs/skills/architecture/python-product-journey.md`, `README.md` - `uv add`와 `uvx` 사용 계약.
- `docs/skills/ops/tools/buildPythonDistribution.py` - 비파괴 distribution build owner.
- `tests/packaging/testPythonSdk.py`, `tests/packaging/verifyPythonSdk.py` - source 및 installed-wheel 검증.
- `.github/workflows/publish.yml`, `.github/workflows/publish.yaml`, `.github/workflows/product-release.yml`, `.github/workflows/ci.yml` - 동일 build와 smoke 사용.
- `tests/run.py`, `docs/skills/ops/foundation/testing-and-gates.md` - `python-sdk` gate 등록.

## 영향 함수·심볼

- `codaro.__all__` - root public symbol exact set.
- `codaro.__version__` - installed distribution version.
- `codaro.createServerApp` - `server.createServerApp()`와 object identity가 같은 공개 factory.
- `buildPythonDistribution(buildRoot, outputRoot)` - current source를 임시 context에서 wheel 및 sdist로 만드는 새 함수.
- `verifyPythonDistribution(distRoot)` - wheel의 `webBuild`, curricula, generated contracts와 sdist payload를 검증하는 새 함수.
- `verifyInstalledSdk(wheelPath, workspaceRoot)` - 빈 venv에서 public imports, server mount, CLI와 plain Python example을 실행하는 새 verifier 경계.
- `tests.run::GATES["python-sdk"]` - local과 CI가 공유하는 hard gate.

## 테스트

- `uv run python -X utf8 -m pytest -q tests/packaging/testPythonSdk.py tests/runtime/testAppRuntime.py tests/runtime/testServerApi.py`.
- `uv run python -X utf8 tests/run.py gate python-sdk`.
- 설치된 wheel에서 `from codaro import App, createServerApp, ui`와 `from codaro.publication import buildStaticPublication, buildBlockEmbed`를 실행한다.
- FastAPI host에 `createServerApp()`을 `/codaro`로 mount하고 제품 bootstrap 또는 health route가 prefix 아래에서 응답하는지 확인한다.
- wheel과 sdist에 `codaro/webBuild/index.html`, `_app/**`, `codaro/curricula/python/**/*.yaml`, generated schema가 존재하는지 확인한다.
- `uv run python -X utf8 tests/run.py audit-self`, `uv lock --check`, `git diff --check`.

## 롤백

- root export와 reference import를 첫 commit, distribution builder와 workflow 통합을 둘째 commit, gate wiring을 셋째 commit으로 분리해 각자 `git revert <sha>`가 가능하게 한다.
- build tool revert 시 세 workflow를 함께 되돌려 어느 alias도 제거된 staging 명령을 참조하지 않게 한다.
- 임시 context와 venv는 `output/test-runner/python-sdk/` 또는 OS temp만 사용하므로 사용자 Python 환경과 공개 PyPI 상태에는 롤백할 변경이 없다.

## 평가

- 개발자 렌즈: `createServerApp` 재수출이 import cycle을 만들 가능성을 source 및 wheel 양쪽에서 검증한다. 배포판 builder는 root curricula SSOT를 복사하되 source tree에 stale package 사본을 남기지 않는다. publish workflow와 local gate가 다른 조립법을 쓰지 않는다.
- PM 렌즈: PyPI 존재 자체를 라이브러리 완성으로 보지 않는다. 사용자가 `uv add codaro` 뒤 README 예제를 그대로 실행할 수 있고, 일반 사용자는 `uvx codaro` 또는 launcher를 선택할 수 있어야 SDK 채널이 의미를 가진다.
