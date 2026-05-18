---
id: environment
title: 실행 환경 + 인코딩
description: Environment requirements for Python, uv, and local execution.
category: ops
section: guides
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
uv run pytest tests/ -v
```

# 프론트 표면 실행

- `editor/` — 실제 제품 UI 표면. React + shadcn/ui 기준.
- `landing/` — GitHub Pages 문서와 블로그 표면.
- 폐기된 Svelte 편집기는 현재 저장소의 실행 표면으로 보지 않는다.

제품 프론트를 반복 개발할 때는 `editor/`를 기준으로 본다.
