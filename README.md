# Codaro

Interactive editor runtime for Python — code, learning, and automation in one surface.

## Overview

Codaro is a programmable studio that combines an editor, execution runtime, learning system, and automation builder into a single cohesive environment. It provides three surfaces:

- **Edit** — Write, execute, and save code and markdown blocks with reactive dataflow
- **App** — Run the same document as a hidden-code application
- **Public** — Docs, blog, and search via GitHub Pages

## Background

Codaro started by studying [marimo](https://github.com/marimo-team/marimo)'s reactive cell model as an architectural benchmark. The editor chrome was initially built to match marimo's DOM structure as a reference implementation exercise. Codaro diverges in its execution model (transparent scope isolation), default format (percent format `.py`), execution environment (Pyodide-first with local fallback), and scope (integrated learning system, automation, widget bridge).

Codaro is not a fork of marimo and shares no source code. It is an independent project that supports marimo format import/export for compatibility.

## Architecture

```
src/codaro/         Python backend (FastAPI, document model, kernel, reactive runtime)
  api/              Router layer, server state, request models
  document/         Document model, percent/codaro/marimo/ipynb parsers
  kernel/           Server-side execution sessions, WebSocket protocol
  runtime/          Engine interface, LocalEngine
  system/           File system and package management API
  curriculum/       YAML content loader, progress tracking, learning spec
  server.py         FastAPI app assembly, middleware, SPA serving
  cli.py            codaro edit | run | export
  appRuntime.py     Native .py document runtime (App, md)
editor/             SvelteKit editor and app mode (Tailwind v4, shadcn)
landing/            Public site — docs, blog, search (GitHub Pages)
launcher/           Rust desktop launcher (embedded Python, manifest provisioning)
study/python/       Learning curriculum (YAML, 130+ lessons)
tests/              Document, kernel, system, server, curriculum tests
```

## Quick Start

```bash
# Run the editor (opens workspace home)
uv run codaro

# Open a specific notebook
uv run codaro path.py

# App mode
uv run codaro app path.py

# Export
uv run codaro export path.py --format codaro
uv run codaro export path.py --format marimo
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
uv run --with pillow python -X utf8 scripts/buildBrandAssets.py
```

The editor builds to `src/codaro/webBuild/`. A build is required before `uv run codaro` works from source checkout. Use `npm run build:watch` for fast iteration — it continuously updates the same output directory.

## Key Decisions

- **Execution model**: Transparent scope isolation — users write plain Python (no function wrapping, no return). The engine isolates each cell's namespace internally via AST analysis.
- **Reactive execution**: Running a cell automatically re-executes downstream dependents based on AST-inferred variable dependencies.
- **File format**: Percent format (`.py`) as default — `# %% [code]` cell boundaries, runnable with `python file.py`, compatible with VS Code/Jupytext.
- **Runtime**: Pyodide (browser) as the default platform; local server kernel extends with file I/O, package management, and ML workloads.
- **Learning system**: Three pillars — notebook mechanics, YAML curriculum (130+ lessons), and a codified teaching philosophy (fill-in-the-blank, predict-then-verify, 3-stage hints).
- **AI integration**: Optional — AI uses existing editor APIs as tools (`insert-block`, `execute-reactive`, `GET variables`). Works without AI.
- **Mounting**: `createServerApp()` can be mounted into FastAPI, Django (ASGI), or Flask (WSGI) hosts.

## Documentation

Internal development docs live alongside the code they describe:

- `src/codaro/DEV.md` — Backend architecture
- `src/codaro/document/DEV.md` — Document model
- `src/codaro/kernel/DEV.md` — Kernel design
- `src/codaro/runtime/DEV.md` — Engine interface
- `editor/DEV.md` — Editor development
- `landing/DEV.md` — Public site
- `launcher/PRD.md` — Desktop launcher design

## License

See [LICENSE](LICENSE).
