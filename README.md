# Codaro

<p align="center">
  <img src="assets/brand/mascot/codaro-character.png" width="170" alt="Codaro avatar" />
</p>

<p align="center">
  <a href="notebooks/python30DaysComplete/readme.md"><img alt="Python 30 Days" src="https://img.shields.io/badge/Python_30_Days-open-2563eb" /></a>
  <a href="notebooks/python30DaysComplete/colab/"><img alt="Colab notebooks" src="https://img.shields.io/badge/Colab_notebooks-36-F9AB00?logo=googlecolab" /></a>
  <a href="notebooks/python30DaysComplete/marimo/"><img alt="marimo notebooks" src="https://img.shields.io/badge/marimo_notebooks-36-111827" /></a>
</p>

Codaro는 Python 코드가 곧 인터페이스가 되는 개인 자동화 스튜디오입니다. 현재는 교육용 지능형 GUI 프로그램으로 진화하기 전 단계로, 먼저 독립 실행 가능한 학습 노트북 커리큘럼을 배포합니다.

## 학습 시작

처음 온 학습자는 아래 30일 과정 문서에서 시작하면 됩니다. 과정 문서 안에서 전체 Colab 노트북, 전체 marimo 노트북, 진행표, 코스 가이드로 이동할 수 있습니다.

| 바로가기 | 설명 |
|---|---|
| [Python 30일 완성 열기](notebooks/python30DaysComplete/readme.md) | 30일 커리큘럼의 메인 진입점 |
| [Colab 노트북 모아보기](notebooks/python30DaysComplete/colab/) | 브라우저에서 실행할 `.ipynb` 워크북 |
| [marimo 노트북 모아보기](notebooks/python30DaysComplete/marimo/) | 네이티브 `marimo.App` 형식의 `.py` 워크북 |
| [코스 가이드](notebooks/python30DaysComplete/courseGuide.md) | 학습 방법론, 루브릭, 최종 프로젝트 기준 |

### 현재 배포 중

| 커리큘럼 | 수준 | 완성 목표 | 진입점 | Colab | marimo |
|---|---|---|---|---|---|
| Python 30일 완성 | 입문자부터 작은 프로젝트까지 | 순수 Python 기본기, 디버깅 습관, 5일 리뷰, 최종 학습 리포트 | [과정 문서](notebooks/python30DaysComplete/readme.md) | [전체 보기](notebooks/python30DaysComplete/colab/) | [전체 보기](notebooks/python30DaysComplete/marimo/) |

### 30일 커리큘럼

| 범위 | 주제 | 학습 결과 |
|---|---|---|
| Day 01-05 | 값과 문자열 | 코드 셀 실행, 값 추론, 작은 텍스트 결과물 만들기 |
| Day 06-10 | 핵심 컬렉션 | 문자열, 리스트, 튜플, 집합을 실제 데이터 묶음으로 다루기 |
| Day 11-15 | 데이터 흐름 | 딕셔너리, 조건문, 반복문, 함수로 작은 로직 구성하기 |
| Day 16-20 | 실전 Python | 함수 고급 패턴, 모듈, 파일, 예외 처리 사용하기 |
| Day 21-25 | 프로그램 설계 | 누적 복습과 객체지향 모델링 시작하기 |
| Day 26-30 | Python 응용 | 컴프리헨션, 제너레이터, 컨텍스트 매니저, 알고리즘, 최종 프로젝트 완성하기 |

### 이후 추가 예정

| 커리큘럼 | 상태 | 목적 |
|---|---|---|
| Python Automation 30 Days | 예정 | 파일, 브라우저, 스케줄링 기반 개인 자동화 |
| Data Analysis Starter | 예정 | CSV, 표, 시각화, 리포트 노트북 |
| Web App Runtime Basics | 예정 | Python 문서를 앱 화면으로 전환하는 흐름 |
| Task Builder Recipes | 예정 | 재사용 가능한 자동화 태스크와 리포트 패턴 |

## Overview

Codaro is a programmable studio that combines an editor, execution runtime, learning system, automation builder, and report viewer into a single environment. It provides five connected surfaces:

- **Edit**: write, execute, and save code and markdown blocks with reactive dataflow
- **Learn**: study notebook curricula with progress, feedback, and structured practice
- **Automate**: build personal workflows and scheduled tasks
- **Report**: turn executed documents into readable outputs
- **App**: run the same document as a hidden-code application

## Background

Codaro started by studying [marimo](https://github.com/marimo-team/marimo)'s reactive cell model as an architectural benchmark. The editor chrome was initially built to match marimo's DOM structure as a reference implementation exercise. Codaro diverges in its execution model, default file format, execution environment, and broader scope.

Codaro is not a fork of marimo and shares no source code. It is an independent project that supports reactive-app format import/export for marimo compatibility.

## Architecture

```text
src/codaro/         Python backend: FastAPI, document model, kernel, runtime
  api/              Router layer, server state, request models
  document/         Percent, Codaro, reactive-app, and ipynb parsers
  kernel/           Server-side execution sessions and WebSocket protocol
  runtime/          Engine interface and local worker execution
  system/           File system and package management API
  curriculum/       YAML content loader, progress tracking, learning spec
  ai/               Optional assistant providers and tool execution
  automation/       Task, scheduler, recorder, input, vision, and integrations
  server.py         FastAPI app assembly, middleware, SPA serving
  cli.py            codaro edit | run | export
editor/             SvelteKit editor and app mode
landing/            Public site, docs, blog, and search
launcher/           Rust desktop launcher
notebooks/          Standalone learning notebook distributions
study/python/       Internal YAML learning curriculum
tests/              Backend, document, kernel, system, server, curriculum tests
```

## Quick Start

```bash
# Run the editor
uv run codaro

# Open a specific notebook
uv run codaro path.py

# App mode
uv run codaro app path.py

# Export
uv run codaro export path.py --format codaro
uv run codaro export path.py --format reactive-app
uv run codaro export path.py --format ipynb
```

## Development

```bash
# Install dependencies
uv sync --extra dev

# Run tests
uv run pytest tests/ -v

# Build editor
cd editor && npm install && npm run build

# Watch mode for editor iteration
cd editor && npm run build:watch

# Build public site
cd landing && npm install && npm run build

# Brand asset generation
uv run --with pillow python -X utf8 assets/brand/tools/buildBrandAssets.py
```

The editor builds to `src/codaro/webBuild/`. A build is required before `uv run codaro` works from source checkout. Use `npm run build:watch` for fast iteration; it continuously updates the same output directory.

## Key Decisions

- **Transparent scope isolation**: users write plain Python while the engine isolates cell scope internally.
- **Reactive execution**: running a cell automatically re-executes downstream dependents based on AST-inferred variables.
- **Percent format default**: `# %%` cell boundaries remain runnable with `python file.py` and compatible with editor tooling.
- **Pyodide-first runtime**: the browser runtime is primary, with a local server kernel for file I/O and heavier workloads.
- **Learning system**: notebook mechanics, YAML curriculum, and codified teaching methods stay connected.
- **Mounting**: `createServerApp()` can be mounted into FastAPI, Django ASGI, or Flask WSGI hosts.

## Documentation

Internal development docs live alongside the code they describe:

- `docs/skills/` — project rules, architecture, identity, and operating principles
- `src/codaro/DEV.md` — backend architecture
- `src/codaro/document/DEV.md` — document model
- `src/codaro/kernel/DEV.md` — kernel design
- `src/codaro/runtime/DEV.md` — engine interface
- `editor/DEV.md` — editor development
- `landing/DEV.md` — public site
- `launcher/PRD.md` — desktop launcher design

## License

See [LICENSE](LICENSE).
