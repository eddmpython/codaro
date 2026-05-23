---
title: Codaro public launch skeleton
date: 2026-05-23
description: A launch-oriented overview of Codaro as a local-first Python learning and automation studio.
category: product-and-runtime
series: codaro-foundations
seriesOrder: 2
thumbnail: /brand/avatar-small.png
cardPreview: ./assets/002-public-launch-map.svg
draft: false
---

# Codaro public launch skeleton

Codaro is a local-first studio for learning Python, running code, and growing useful scripts into personal automation.

The first public story should be simple:

1. Learn with structured cards.
2. Run code in cells.
3. Use real local data.
4. Turn repeated work into a safe automation plan.

## The first five minutes

The launch path starts with two runnable demos:

```powershell
uv run python -X utf8 demos/publicLaunch/expenseSummaryDemo.py
uv run python -X utf8 demos/publicLaunch/fileOrganizerDemo.py
```

The first demo reads a small CSV and summarizes spending by category. The second demo builds a dry-run file organization plan without moving or deleting anything.

That is the product story in miniature: learn, run, inspect, automate.

## Why local-first matters

Codaro should remain useful before any provider is connected. A beginner can open the Python course, run cells, and inspect outputs without sending private files elsewhere.

Provider-backed features can improve personalization, but they are not the foundation of the first-run path.

## What makes the release credible

Public readiness is not a claim in a README. It is checked by gates:

- `quality-cycle`
- `objective-nineplus-audit`
- `public-readiness-audit`

The release also ships with security, privacy, support, contribution, license, and trademark boundaries at the repository root.

## What to show in the video

The 90-second demo should show:

- a learning card and a code cell
- CSV summary output
- a dry-run automation plan
- diagnostic and support paths
- the public readiness checklist

The goal is not to explain every feature. The goal is to make the viewer think: “I can try this right now.”
