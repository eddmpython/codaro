---
id: packaging
title: 로컬 배포 bundle 원칙
description: Packaging rules for local distribution and bundled assets.
category: ops
section: release
order: 306
purpose: 최종 사용자는 Codaro.exe 단일 진입. Embedded Python + manifest exact wheel curated bundle. 외부 앱(Excel) 의존성은 별도 경계.
whenToUse: 새 bundle 정의, manifest 스키마 변경, 외부 앱(xlwings 등) 통합 정책 결정할 때.
---

# Python SDK와 로컬 배포 bundle 원칙

- PyPI의 `codaro` wheel은 Python SDK와 CLI 배포판이다. 설치된 배포판은 `App`, `createServerApp`, `ui`, layout 및 output helper, `state`, `stop`, `tool`, `main`, `__version__`을 root public API로 제공하고 고급 publication API는 `codaro.publication` 아래에 둔다.
- `docs/skills/ops/tools/buildPythonDistribution.py`가 wheel과 sdist 조립의 단일 owner다. current source, `src/codaro/webBuild`, root `curricula/`를 임시 build context로 복사하고 실제 작업트리의 `src/codaro/curricula`는 만들거나 지우지 않는다.
- `tests/packaging/verifyPythonSdk.py`는 built wheel의 direct install, `uv add --find-links`, exact wheel `uvx`, server mount, CLI, plain Python reference source와 package data를 새 환경에서 검증한다.
- publish alias와 product release workflow는 위 builder 및 verifier를 그대로 호출한다. workflow 안에 별도 `cp`, `rm`, inline payload 검사법을 두지 않는다.

- 최종 사용자 배포는 `Codaro.exe` 하나를 기준으로 한다.
- launcher는 embedded Python runtime과 manifest가 지정한 exact wheel 기반 curated bundle만 설치한다.
- Codaro editor frontend는 기본적으로 `codaro` wheel 내부 `codaro/webBuild`에 포함한다. launcher manifest는 `editor.source: "backendWheel"`을 우선하고, 별도 editor zip은 legacy/internal archive release에서만 쓴다.
- launcher는 index에서 arbitrary latest package를 해석하거나 무제한 `pip install` 경로를 제품 기본으로 삼지 않는다.
- `codaro-excel` 같은 automation bundle은 Python package, helper runtime, capability probe, bootstrap을 launcher가 관리한다.
- normal `vX.Y.Z` tag release는 GitHub Release에 exact `codaro` wheel, `release-manifest.json`, `Codaro.exe`, checksum, SPDX SBOM, managed Windows Python runtime archive를 함께 업로드한다.
- 같은 게시 릴리즈는 `.github/workflows/publish.yaml`의 PyPI Trusted Publisher 경로로 검증된 `codaro` wheel과 sdist를 PyPI에 올린다. PyPI publisher 값은 project `codaro`, owner `eddmpython`, repository `codaro`, workflow `publish.yaml`, environment `pypi`와 일치해야 한다.
- GitHub Pages는 다운로드/문서 표면이다. launcher update는 tag 문자열만 보지 않고 `release-manifest.json`의 artifact URL과 sha256을 기준으로 한다.
- PyPI는 Python 생태계 검색과 개발자 SDK 및 CLI 설치 채널이다. 프로젝트 의존성은 `uv add codaro`, 일회성 CLI는 `uvx codaro --help`를 사용한다. launcher는 PyPI index에서 latest를 해석하지 않고 GitHub Release manifest가 지정한 exact wheel만 설치한다.
- 외부 앱과 드라이버 의존성은 별도 경계로 둔다.
  - 예: `xlwings` 기반 Excel app automation은 launcher가 Python 쪽 의존성과 bootstrap을 관리하지만, Microsoft Excel 자체는 사용자가 설치해야 한다.
- 세부 배포 설계의 source of truth는 `launcher/PRD.md`, `launcher/PACKAGING.md`다.
