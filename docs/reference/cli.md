---
title: CLI reference
description: Commands for editor launch, app mode, export, and test execution.
section: reference
order: 1
draft: false
---

# CLI reference

## Main commands

```bash
uv run codaro
uv run codaro path.py
uv run codaro app path.py
uv run codaro export path.py --format codaro
uv run codaro export path.py --format marimo
uv run codaro export path.py --format ipynb
```

## Tests

```bash
uv run pytest tests/ -v
```
