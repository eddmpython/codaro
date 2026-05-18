# Codaro Editor Frontend

`editor/` is the Codaro product surface.

## Current Contract

- Framework: React + shadcn/ui.
- Product entry: chat-first AI workbench.
- Learning flow: chat -> curriculum YAML -> materialized cells -> read/write/cell-call.
- Build output: `../src/codaro/webBuild`.
- Product UI language: English only.

## Naming

- `editor/` is the frontend folder and product surface.
- Workbench/notebook/cell are the internal execution surfaces.
- The old Svelte editor is not the product source and is no longer kept in the repo.

## UI Rules

- Do not edit shadcn components for arbitrary visual styling.
- Use shadcn tokens from `src/index.css` for borders, background, foreground, ring, and muted surfaces.
- Do not hard-code white or black borders for layout chrome.
- Keep the default flow AI-first; reference curriculum is optional supporting context.
