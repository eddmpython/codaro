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
- PowerShell에서 인코딩이 의심되면 실행 전에 아래를 적용한다.
  - `[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()`
- 파일 읽기/쓰기 명령은 가능한 한 UTF-8을 명시한다.
- 모든 텍스트 파일은 UTF-8을 기본으로 유지한다.

# 로컬 산출물 위생

- 프로젝트 루트는 임시 로그/스크린샷/캐시/세션 파일을 쓰는 장소가 아니다.
- 백그라운드 서버를 띄울 때 `*.log`, `*.pid`, `.playwright-cli/`, `vite-dev*.log`, `tsconfig.tsbuildinfo`를 루트나 앱 루트에 만들지 않는다.
- stdout/stderr 리다이렉트가 필요하면 `$env:TEMP\codaro\...` 아래를 우선 사용한다.
- 보존이 필요 없는 로컬 산출물은 삭제한다. 보존이 꼭 필요하면 레포 밖 `$env:TEMP\codaro\...` 아래를 사용한다.
- Playwright CLI는 레포 루트에서 실행하지 않는다. 브라우저 산출물이 필요하면 임시 작업 폴더나 `$env:TEMP\codaro\...`를 사용한다.
- 백그라운드 프로세스를 띄운 작업은 종료 전 반드시 프로세스를 정리하고, 루트에 `*.log`와 `.playwright-cli/`가 남지 않았는지 확인한다.

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
- 폐기된 Svelte 편집기는 현재 저장소의 실행 표면으로 보지 않는다.

제품 프론트를 반복 개발할 때는 `editor/`를 기준으로 본다.
