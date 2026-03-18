# Codaro Package Distribution

## 목적

이 문서는 Codaro의 Python package 배포 전략을 정의한다.
`launcher/PRD.md`가 설치기와 로컬 배포 운영체제의 관점이라면, 이 문서는 PyPI와 wheel 기준의 artifact 관점을 맡는다.

핵심 질문은 아래다.

- Codaro를 어떤 distribution 단위로 나눌 것인가
- `extras`와 별도 패키지 중 무엇을 쓸 것인가
- launcher는 어떤 wheel을 어떤 규칙으로 설치할 것인가
- GitHub Releases와 PyPI는 어떻게 역할을 나눌 것인가
- stable, beta, prerelease를 어떻게 운영할 것인가

## 결론 요약

- core runtime은 `codaro` wheel로 배포한다
- 자동화 capability는 `extras`가 아니라 별도 package로 배포한다
- launcher는 index에서 최신을 해석하지 않고 manifest가 지정한 exact wheel만 설치한다
- GitHub Releases는 control plane, PyPI는 package artifact plane이다
- PyPI publish는 GitHub Actions trusted publishing을 기준으로 한다

## 왜 별도 package인가

`extras`는 개발자 설치에는 편하지만 제품 배포에는 한계가 크다.

문제:

- extras는 core와 lifecycle이 묶인다
- optional capability를 독립 업데이트하기 어렵다
- 설치 크기를 세밀하게 줄이기 어렵다
- launcher가 어떤 capability가 실제로 설치됐는지 관리하기 불편하다
- mobile과 web에서 일부 capability만 끄는 구조와 맞지 않는다

따라서 Codaro는 아래 원칙을 따른다.

- 기능 capability가 다르면 distribution도 분리한다
- core runtime과 automation bundle은 분리한다
- launcher는 필요한 bundle만 설치한다

## Package Topology

### 현재 권장 구조

- `codaro`
  - editor server
  - document model
  - runtime contracts
  - LocalEngine / Pyodide adapter entrypoints
  - curriculum loader
  - public CLI entrypoint

- `codaro-excel`
  - workbook read/write
  - optional Excel COM automation
  - capability probe

- `codaro-browser`
  - browser automation
  - playwright or equivalent runtime helpers

- `codaro-db`
  - db connectors
  - common query helpers

- `codaro-ai-local`
  - local AI integration
  - Ollama or other local provider binding

### 분리하지 않는 것

- `codaro-core` 같은 초세분 core 패키지는 아직 만들지 않는다
- kernel, document, runtime을 당장 separate wheel로 쪼개지 않는다
- 내부 모듈 경계와 배포 경계를 동일시하지 않는다

이유:

- 현재 단계에서는 core wheel 하나가 더 빠르고 단순하다
- premature split은 import 경로와 release coordination만 복잡하게 만든다

## Extras 정책

Codaro에서 extras는 제품 capability 배포가 아니라 아래 용도로만 허용한다.

- dev
- test
- docs
- optional local contributor convenience

예:

- `codaro[dev]`
- `codaro[test]`
- `codaro[docs]`

허용하지 않는 예:

- `codaro[excel]`
- `codaro[browser]`
- `codaro[db]`

이런 사용자 기능은 별도 package로 간다.

## Naming Rules

- public package는 모두 `codaro-` prefix를 사용한다
- launcher가 해석하는 capability id와 package name은 최대한 1:1로 맞춘다
- manifest의 bundle name은 package name suffix와 동일하게 유지한다

예:

- capability `excel` -> package `codaro-excel`
- capability `browser` -> package `codaro-browser`

## Wheel 정책

- launcher는 source distribution을 설치하지 않는다
- launcher는 wheel만 설치한다
- manifest는 exact wheel URL과 sha256을 반드시 가진다
- launcher는 해시 검증 후에만 wheel을 설치한다
- launcher는 index에서 resolver를 돌려 latest를 찾지 않는다

즉 launcher는 package manager라기보다 curated artifact installer다.

## Manifest와 Package Artifact

`launcher/PRD.md`의 manifest는 exact artifact를 가리켜야 한다.
package 쪽 상세 규칙은 아래를 따른다.

### backend artifact 필수 필드

- `name`
- `version`
- `wheelUrl`
- `sha256`
- `entryModule`
- `consoleScript`

### bundle artifact 필수 필드

- `name`
- `packageName`
- `version`
- `required`
- `wheelUrl`
- `sha256`

예시:

```json
{
  "backend": {
    "name": "codaro",
    "version": "0.3.0",
    "wheelUrl": "https://files.pythonhosted.org/packages/.../codaro-0.3.0-py3-none-any.whl",
    "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "entryModule": "codaro.cli",
    "consoleScript": "codaro"
  },
  "bundles": [
    {
      "name": "excel",
      "packageName": "codaro-excel",
      "version": "0.3.0",
      "required": false,
      "wheelUrl": "https://files.pythonhosted.org/packages/.../codaro_excel-0.3.0-py3-none-any.whl",
      "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    }
  ]
}
```

## Launcher Install Rules

- launcher는 active release manifest가 지정한 wheel만 설치한다
- launcher는 이미 설치된 동일 version bundle이라도 sha256이 다르면 재설치한다
- launcher는 core와 bundle을 release 단위로 stage한다
- launcher는 이전 release install 디렉터리를 유지해 rollback에 사용한다
- launcher는 uninstall보다 release switch를 우선한다

## Runtime Layout for Packages

권장 구조:

`%LocalAppData%/Codaro/installs/<releaseId>/backend/`

- `site-packages/`
  - `codaro`
  - `codaro_excel`
  - `codaro_browser`
- `wheels/`
  - stage된 wheel 보관
- `install-record.json`
  - 어떤 package가 어떤 sha256으로 설치됐는지 기록

`install-record.json` 예시:

```json
{
  "backend": {
    "name": "codaro",
    "version": "0.3.0",
    "sha256": "..."
  },
  "bundles": [
    {
      "name": "excel",
      "packageName": "codaro-excel",
      "version": "0.3.0",
      "sha256": "..."
    }
  ]
}
```

## Build and Publish Flow

### Core package

1. Python package version bump
2. wheel build
3. tests
4. publish to PyPI
5. release manifest 생성
6. GitHub Release에 manifest와 launcher/frontend/python runtime asset 업로드

### Bundle package

1. bundle package version bump
2. wheel build
3. capability-specific tests
4. publish to PyPI
5. release manifest에 정확한 wheel과 sha256 반영

## PyPI Publish Policy

- GitHub Actions trusted publishing 사용
- PyPI API token을 long-lived secret로 저장하지 않는다
- release tag 기준 publish를 기본으로 한다
- prerelease channel은 PEP 440 prerelease version을 사용한다

예:

- stable: `0.4.0`
- beta: `0.4.0b1`
- alpha/dev: `0.4.0a1`, `0.4.0.dev1`

## Channel Mapping

launcher channel과 version 정책은 아래를 따른다.

- `stable`
  - final release만 허용
- `beta`
  - prerelease 허용
- `dev`
  - internal build 또는 file/github artifact 허용 가능

중요:

- channel 정책은 launcher가 manifest 단계에서 판단한다
- PyPI index에서 prerelease 자동 선택을 launcher에 맡기지 않는다

## Versioning Rules

- core와 bundle은 semver 느낌을 유지하되 Python 생태계에선 PEP 440 형식을 따른다
- bundle은 가능하면 core와 같은 minor를 유지한다
- compatibility는 launcher manifest가 최종 판단한다

권장:

- `codaro 0.5.x`
- `codaro-excel 0.5.x`
- `codaro-browser 0.5.x`

꼭 같을 필요는 없지만 release manifest가 호환 조합을 고정해야 한다.

## Compatibility Rules

- bundle은 core 없이 설치되지 않는다
- launcher는 incompatible bundle 조합을 install하지 않는다
- bundle metadata에는 최소 core version 범위를 둘 수 있다

권장 메타데이터:

- `Requires-Dist: codaro>=0.5,<0.6`

하지만 launcher는 여기에만 의존하지 않고 manifest 조합을 우선한다.

## Package Capability Discovery

각 bundle은 설치 후 capability registry에 자신을 등록해야 한다.

권장 방향:

- core runtime이 capability entrypoint group을 읽는다
- bundle은 entrypoint를 통해 capability provider를 등록한다

예:

- entrypoint group: `codaro.capabilities`
- item:
  - `excel = codaro_excel.registry:register`
  - `browser = codaro_browser.registry:register`

이 구조면 core가 bundle import를 하드코딩하지 않아도 된다.

## Why Not Just pip install Latest

금지 이유:

- non-deterministic
- release rollback이 어려움
- stable/beta/dev channel 분리가 애매함
- reproducibility가 깨짐
- offline cache와 health-checked staged install이 어려움

따라서 launcher는 아래만 허용한다.

- exact wheel URL
- exact sha256
- exact release manifest

## Public Installation Story

사용자 관점 설치는 두 갈래다.

### Product install

- launcher 사용
- Python 설치 불필요
- update 자동

### Developer install

- `uv sync`
- `uv run codaro`
- frontend build 필요

문서와 README는 이 둘을 명확히 구분해야 한다.

## GitHub Release Asset Matrix

release 하나는 보통 아래 asset을 가진다.

- launcher binary or installer
- frontend zip
- embedded python zip
- manifest json
- optional release notes

wheel은 원칙적으로 PyPI에 두고, manifest가 PyPI wheel URL을 가리킨다.

예외:

- private beta
- temporary internal smoke build

이 경우만 GitHub asset wheel을 허용할 수 있다.

## CI / Workflow Split

권장 workflow:

- `python-package.yml`
  - test
  - build wheel
  - trusted publish to PyPI

- `launcher-release.yml`
  - build launcher
  - package frontend
  - package embedded python
  - generate manifest
  - create GitHub Release

- `bundle-release.yml`
  - bundle wheel publish
  - compatibility test

## Repository Structure Direction

현재는 single Python project지만, package 분리를 위해 장기적으로 아래 중 하나로 간다.

### Option A

단일 repo, 다중 package

- `pyproject.toml`
- `packages/codaro/`
- `packages/codaro-excel/`
- `packages/codaro-browser/`

장점:

- 한 저장소에서 조합 release 관리가 쉽다

### Option B

core repo + bundle repos

초기에는 비추천이다.

현재 단계에서는 `Option A`가 맞다.

## Current State

- 현재 Python 배포는 단일 `codaro` package 기준이다
- launcher는 exact manifest + wheel 설치 구조를 전제로 설계되고 있다
- launcher manifest schema는 `entryModule`, `consoleScript`, `packageName`까지 반영됐다
- launcher는 exact wheel과 archive를 stage하고 `install-record.json`에 기록할 수 있다
- launcher는 staged release의 release-local Python runtime으로 exact backend wheel과 bundle wheel을 `backend/site-packages`에 실제 설치한다
- bundle package는 아직 구현되지 않았다
- `extras`는 아직 정리되지 않았지만 제품 capability용으로 쓰지 않는 것이 확정 방향이다

## Next Action

- package 분리 시점에 대비해 capability registry 방식을 정한다
- 이후 `pyproject`를 monorepo multi-package 구조로 옮길 시점을 정한다
- PyPI trusted publishing workflow 초안을 만든다
- compiled dependency wheel과 platform tag 조합 정책을 정한다

## Verification Left

- multi-package monorepo 도입 시점
- bundle entrypoint registry 표면
- core/bundle dependency pin을 manifest와 wheel metadata 중 어디까지 중복 표현할지
- compiled wheel과 optional native dependency를 launcher가 어디까지 검사할지
- private beta channel에서 GitHub wheel fallback 정책
