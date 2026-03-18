---
title: Installation
description: Install Codaro, start the local server, and understand the public site split.
section: getting-started
order: 1
draft: false
---

# Installation

Codaro currently has a developer install path and a product install direction.

## Product install direction

The long-term product path is a managed launcher:

- `CodaroLauncher.exe`
- embedded Python runtime
- managed backend wheel install
- managed frontend assets
- automatic update and rollback

## Developer install

Today, local development uses `uv` for Python environment and execution.

## Requirements

- Python 3.12 or newer
- `uv`
- Node.js for the Svelte public site and local editor frontends

## Core commands

```bash
cd frontend
npm install
npm run build

uv run codaro
uv run codaro path.py
uv run pytest tests/ -v
```

If you are iterating on the frontend, keep the same runtime model and rebuild into `src/codaro/webBuild/`:

```bash
cd frontend
npm run build:watch
```

## Public site

The public site lives in `landing/`.

Use:

```bash
cd landing
npm install
npm run build
```
