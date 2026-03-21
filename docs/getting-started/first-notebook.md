---
title: First notebook
description: Open the local editor surface and understand the difference between the editor and the public site.
section: getting-started
order: 2
draft: false
---

# First notebook

Start the local server with:

```bash
uv run codaro
```

The public site and the local editor are separate surfaces.

- `landing/` builds a static public site
- `editor/` serves the editor runtime

That split keeps public docs and interactive editing independent.
