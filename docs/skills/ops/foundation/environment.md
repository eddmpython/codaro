---
id: environment
title: 실행 환경 + 인코딩
description: Environment requirements for Python, uv, and local execution.
category: ops
section: foundation
order: 301
purpose: PowerShell `.venv` (root), WSL은 `.venv-wsl` 분리. 모든 실행은 `uv run python -X utf8`. 텍스트 파일 UTF-8 기본.
whenToUse: 새 머신 셋업, 인코딩 깨짐 디버그, WSL/PowerShell 동시 작업할 때.
---

# 실행 환경 규칙

- PowerShell 메인 가상환경은 프로젝트 루트 `.venv`를 사용한다.
- WSL에서는 루트 `.venv`를 공유하지 않는다.
- WSL 전용 가상환경이 필요하면 `.venv-wsl`을 사용한다.
- Python 3.12 이상과 `uv`를 기준으로 한다.
- Node.js는 `landing/` 문서 표면과 `editor/` 제품 표면 작업에 필요하다.

# 실행 인코딩 규칙

- Python 실행은 기본적으로 `uv run python -X utf8 ...` 형태를 사용한다.
- `uv` 명령은 기본 캐시를 쓰는 기본 실행을 우선한다. `uv run ...`이 첫 선택이며, uv cache 권한 오류가 나와도 권한 상승을 묻지 말고 현재 세션 권한으로 즉시 재실행한다.
- Codex/agent 실행에서 `uv` 때문에 `sandbox_permissions=require_escalated` 같은 승인 요청을 사용하지 않는다. 승인이 막힌 환경에서는 승인 요청 자체가 실패 원인이며, `pip` 직접 실행이나 수동 venv 변경으로 우회하지 않는다.
- 재실행 후에도 같은 uv cache 오류가 지속될 때만 원인을 기록하고, 필요하면 작업 단위에서 `UV_CACHE_DIR` 같은 우회를 명시적으로 남긴다.
- PowerShell에서 인코딩이 의심되면 실행 전에 아래를 적용한다.
  - `[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()`
- 파일 읽기/쓰기 명령은 가능한 한 UTF-8을 명시한다.
- 모든 텍스트 파일은 UTF-8을 기본으로 유지한다.

# 로컬 산출물 위생

- canonical root tree와 새 파일 위치 기준은 `docs/skills/architecture/repository-structure.md`를 따른다.
- 저장소 루트는 항상 제품/운영 SSOT 파일만 보이는 상태를 유지한다. 새 실습 파일, 임시 데이터, 로그, preview 출력은 루트에 만들지 않는다.
- 루트에 `.txt`, `.csv`, `.log`, `.pid`, `.tmp`, `.tsbuildinfo`, `.ipynb`, `.sqlite`, `.db`, `.parquet` 같은 로컬 산출물을 남기면 `root-clean` gate가 실패해야 한다.
- 파일 입출력 예제와 커리큘럼 코드는 `open("data.txt")`, `Path("output.txt")`처럼 루트 상대 경로에 쓰지 않는다. `tempfile.TemporaryDirectory()`, `Path(tempfile.gettempdir()) / "codaro_..."`, 또는 gate runner가 제공하는 `output/test-runner/<gate>/scratch` 아래를 사용한다.
- 프로젝트 루트는 임시 로그/스크린샷/캐시/세션 파일을 쓰는 장소가 아니다.
- 백그라운드 서버를 띄울 때 `*.log`, `*.pid`, `.playwright-cli/`, `vite-dev*.log`, `tsconfig.tsbuildinfo`를 루트나 앱 루트에 만들지 않는다.
- stdout/stderr 리다이렉트가 필요하면 `$env:TEMP\codaro\...` 아래를 우선 사용한다.
- 보존이 필요 없는 로컬 산출물은 명시 요청이 있을 때 삭제한다. 보존이 꼭 필요하면 `_backup/`, `_archive/`, `_reference/` 같은 백업성 루트에 숨기지 말고 정식 제품/문서 위치로 승격한다. 새 실행 산출물은 레포 밖 `$env:TEMP\codaro\...`를 우선 사용한다.
- Playwright CLI는 레포 루트에서 실행하지 않는다. 브라우저 산출물이 필요하면 임시 작업 폴더나 `$env:TEMP\codaro\...`를 사용한다.
- 백그라운드 프로세스를 띄운 작업은 종료 전 반드시 프로세스를 정리하고, 루트에 `*.log`, `.playwright-cli/`, 실습 `.txt`/`.csv`가 남지 않았는지 `uv run python -X utf8 tests/run.py gate root-clean`으로 확인한다.

# 주요 명령

```bash
uv run codaro
uv run codaro path.py
uv run codaro export path.py --format codaro
uv run codaro export path.py --format ipynb
uv run python -X utf8 tests/run.py preflight
uv run python -X utf8 tests/run.py list
```

# 패키지 설치

- 사용자가 에디터에서 라이브러리를 설치해도 내부 경로는 `/api/packages/install` 또는 세션 패키지 capability를 거쳐 `uv pip ... --python .venv`로 실행한다.
- AI 교사 도구도 같은 경로를 사용한다. `packages-check`로 누락 여부를 확인한 뒤 `packages-install`을 호출한다.
- plain package가 이미 `.venv`에 설치되어 있으면 `uv pip install`을 다시 실행하지 않고 즉시 성공으로 보고한다. version specifier나 extras가 있으면 정확성을 위해 `uv` 경로를 탄다.
- 설치 결과는 `installer: uv`, `environment: project .venv`, `durationMs`, `skipped`를 포함한다. 에디터와 teacher trace는 이 값을 사용해 "uv로 준비 중/완료/이미 준비됨"을 표시한다.
- 설치 timeout은 긴 wheel 준비를 고려해 `INSTALL_TIMEOUT_SECONDS` 상수로 관리한다. timeout 변경은 `tests/testSystem.py`에서 함께 고정한다.
- 직접 `pip install` 명령을 문서, 테스트, UI 안내에 추가하지 않는다.

# 프론트 표면 실행

- `editor/` — 실제 제품 UI 표면. React + shadcn/ui 기준.
- `landing/` — GitHub Pages 문서와 블로그 표면.
- 폐기된 이전 편집기는 현재 저장소의 실행 표면으로 보지 않는다.

제품 프론트를 반복 개발할 때는 `editor/`를 기준으로 본다.
