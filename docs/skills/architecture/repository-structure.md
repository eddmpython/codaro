---
id: repository-structure
title: Repository Structure
description: Canonical top-level tree and placement rules for Codaro.
category: architecture
section: reference
order: 199
purpose: 새 파일과 폴더가 어디에 들어가야 하는지 고정하고 루트 오염을 root-clean gate로 막는다.
whenToUse: 새 루트 폴더, 배포 산출물, 문서 위치, 로컬 작업공간, 테스트 산출물 위치를 결정할 때.
---

# Repository Structure

이 문서는 저장소 폴더 구조의 SSOT다. 루트에는 제품 코드, 공개 문서, 운영 기준, 배포 기준처럼 오래 살아야 하는 항목만 둔다. 실험, 로그, preview, 임시 데이터, 빌드 산출물은 루트의 새 폴더나 파일로 만들지 않는다.

구조 변경은 문서만 바꾸는 일이 아니다. 새 루트 항목이 필요하면 이 문서, `tests/verifyRootClean.py`, 필요한 인덱스 문서를 함께 바꾼 뒤 `uv run python -X utf8 tests/run.py gate root-clean`을 통과시킨다.

## Things To Watch

- 루트는 작업장이 아니라 계약면이다. 새 파일이나 폴더가 루트에 보여야 할 이유가 약하면 기존 폴더 안으로 넣는다.
- `src/`, `editor/`, `landing/`, `launcher/` 경계는 제품 표면 경계다. 한쪽 convenience 때문에 다른 표면의 내부 파일을 직접 참조하지 않는다.
- `localData/`, `output/`, `dist/`, `sns/`는 로컬 또는 generated workspace다. 제품 runtime, 공개 문서, 테스트 fixture가 이 경로의 현재 내용을 source로 믿으면 안 된다.
- 릴리즈 산출물은 workflow가 만들고 GitHub Release asset과 manifest로 전달한다. wheel, installer, archive를 루트에 커밋하지 않고, launcher는 PyPI 단독 배포를 전제로 삼지 않는다.
- `docs/skills/`와 `docs/blog/`만 문서 source다. GitHub Pages에 보이는 `landing/src/lib/generated/*`는 build output이므로 source 수정 뒤 `landing-build`로 갱신한다.
- 테스트 산출물은 `output/test-runner/<gate>/scratch`, `output/test-runner/<gate>/logs`, gate report 경로 중 하나에 둔다. 수동 서버 로그나 임시 캡처는 `$env:TEMP\codaro\...`를 우선 쓴다.
- `_backup/`, `_archive/`, `_reference/` 같은 백업성 루트는 만들지 않는다. 다시 쓰는 자료라면 정식 위치로 승격하고, 불필요한 로컬 산출물은 명시 요청이 있을 때 삭제한다.
- 새 루트 항목은 반드시 이 문서, `tests/verifyRootClean.py`, 관련 인덱스, generated docs를 같은 변경에서 맞춘다.
- 파일/폴더 이름은 기본적으로 `camelCase`다. 공개 표준 파일, package metadata, 기존 외부 계약 파일만 예외로 둔다.
- 완료 전에는 `git status --short`로 구조 변경과 무관한 dirty file을 구분하고, `root-clean` 실패 상태에서는 완료로 말하지 않는다.

## Canonical Root Tree

```text
codaro/
├── .github/          # CI, Pages, release, security workflow
├── .githooks/        # local commit, branch, push guard
├── assets/           # brand and reusable product assets
├── curricula/        # built-in curriculum YAML registry
├── demos/            # public launch demos and quickstart material
├── docs/             # skills SSOT and public blog source
├── editor/           # product UI surface
├── landing/          # GitHub Pages and docs/blog web surface
├── launcher/         # desktop launcher, packaging notes, release updater
├── notebooks/        # distributable notebooks derived from curricula
├── src/              # Python package source
└── tests/            # 도메인 트리(tests/<domain>/): pytest suites + 같은 도메인 verify/audit 드라이버 + gate runner(run.py) + root enforcer(verifyRootClean.py) + 공유 인프라 + _attempts 샌드박스(git 미추적·로컬 전용)
```

Root files are limited to package metadata and public project documents. Examples are `README.md`, `pyproject.toml`, `uv.lock`, `SECURITY.md`, `PRIVACY.md`, `SUPPORT.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`, `CLAUDE.md`, and `AGENTS.md`.

## Local And Generated Roots

아래 폴더는 Git 추적 대상이 아니며 제품 SSOT가 아니다. 필요할 때만 로컬에 생길 수 있고, 새 기능이 이 위치를 기준 소스로 삼으면 안 된다.

| Path | Meaning |
| --- | --- |
| `.venv/`, `.venv-wsl/` | Python 실행 환경 |
| `.ruff_cache/` | Ruff cache |
| `dist/` | local packaging output before release upload |
| `output/test-runner/<gate>/` | gate logs, scratch, reports |
| `localData/` | installed share packs and user-local product data |
| `sns/` | local content pipeline workspace |
| `data/` | large local datasets available through release assets |

`output/` 아래라도 새 산출물은 가능하면 `output/test-runner/<gate>/scratch`, `output/test-runner/<gate>/logs`, 또는 gate report 경로를 쓴다. 수동 확인 로그는 `$env:TEMP\codaro\...`를 우선 사용한다.

## Placement Rules

| Work | Location |
| --- | --- |
| Python backend/runtime/domain code | `src/codaro/` |
| Product UI components and hooks | `editor/src/` |
| Public docs/blog app code | `landing/` |
| Product philosophy, architecture, ops rules | `docs/skills/` |
| Long-form public posts | `docs/blog/` |
| Built-in learning YAML | `curricula/` |
| Derived distributable notebooks | `notebooks/` |
| Public runnable demos | `demos/` |
| Desktop launcher and update logic | `launcher/` |
| Brand source assets | `assets/` |
| Tests and verifiers | `tests/` |
| Gate scratch/logs/reports | `output/test-runner/<gate>/` |
| User-installed share packs | `localData/sharePacks/` |

## Change Protocol

1. 기존 루트 폴더 안으로 들어갈 수 있으면 새 루트 폴더를 만들지 않는다.
2. 새 루트 항목이 필요하면 이 문서의 tree와 placement table을 먼저 갱신한다.
3. `tests/verifyRootClean.py`의 allowlist 또는 required list를 같은 변경에서 갱신한다.
4. 문서 인덱스가 필요한 경우 `docs/skills/README.md`, `CLAUDE.md`, `docs/skills/architecture/ssot-map.md`를 함께 연결한다.
5. `uv run python -X utf8 tests/run.py gate root-clean`과 `uv run python -X utf8 tests/run.py gate docs`로 구조와 문서 wiring을 확인한다.

## Forbidden Root Drift

- 임시 `.txt`, `.csv`, `.log`, `.pid`, `.tmp`, `.ipynb`, `.sqlite`, `.db`, `.parquet` 파일을 루트에 만들지 않는다.
- `node_modules/`, `logs/`, `screenshots/`, `temp/`, `tmp/`, `build/`, `wheels/`를 루트에 만들지 않는다.
- `_backup/`, `_archive/`, `_reference/` 같은 백업성 루트를 만들지 않는다.
- 새 문서 묶음을 `docs/concepts/`, `docs/guides/`, `docs/reference/` 같은 병렬 트리로 만들지 않는다. 기준 문서는 `docs/skills/`, 공개 글은 `docs/blog/`로 흡수한다.
- 보존해야 하는 애매한 파일은 백업성 루트에 숨기지 말고 정식 위치로 승격할지 별도 판단한다.
