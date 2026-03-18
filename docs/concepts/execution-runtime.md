---
title: Execution runtime
description: The runtime layer separates the editor surface from engine-specific execution details.
section: concepts
order: 2
draft: false
---

# Execution runtime

The editor talks to a capability surface rather than a single concrete engine.

Core capabilities include:

- execute
- interrupt
- variables
- files
- packages
- docs

That separation is required for local, browser, and future sandbox execution backends.
