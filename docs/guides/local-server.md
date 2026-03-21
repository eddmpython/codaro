---
title: Local server
description: Run the local FastAPI server for the editor without mixing it with the public site build.
section: guides
order: 1
draft: false
---

# Local server

Use the local server when you want the editor surface:

```bash
uv run codaro
```

That server is separate from the GitHub Pages build.

- local editor: `src/codaro/server.py` + `editor/`
- public site: `landing/`
