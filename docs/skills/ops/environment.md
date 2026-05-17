---
id: environment
title: 실행 환경 + 인코딩
category: ops
purpose: PowerShell `.venv` (root), WSL은 `.venv-wsl` 분리. 모든 실행은 `uv run python -X utf8`. 텍스트 파일 UTF-8 기본.
whenToUse: 새 머신 셋업, 인코딩 깨짐 디버그, WSL/PowerShell 동시 작업할 때.
---

# 실행 환경 규칙

- PowerShell 메인 가상환경은 프로젝트 루트 `.venv`를 사용한다.
- WSL에서는 루트 `.venv`를 공유하지 않는다.
- WSL 전용 가상환경이 필요하면 `.venv-wsl`을 사용한다.

# 실행 인코딩 규칙

- Python 실행은 기본적으로 `uv run python -X utf8 ...` 형태를 사용한다.
- PowerShell에서 인코딩이 의심되면 실행 전에 아래를 적용한다.
  - `[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()`
- 파일 읽기/쓰기 명령은 가능한 한 UTF-8을 명시한다.
- 모든 텍스트 파일은 UTF-8을 기본으로 유지한다.
