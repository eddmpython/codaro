# Changelog

## 0.1.0 - 2026-03-24

### Added

- AI editor bridge for `insert-block`, `update-block`, `delete-block`, and `execute-reactive`.
- Diff preview flow with pending diff queue, block-level accept/reject, and "Fix with AI" error repair path.
- Inline AI completion endpoint and CodeMirror ghost text integration.
- Automation dashboard surfaces including task list/detail, recording controls, workflow list/builder, scheduler state, channel config, agent activity, safety dashboard, and plan execution view.
- Desktop automation backend capabilities for audit trail, E-Stop, recorder, input guard, vision capture, OCR, voice, integrations, and custom tool registration.
- Learning mode runtime with guide blocks, hint accordion, exercise feedback, progress dashboard data flow, adaptive teaching tools, and achievement tracking.
- Report mode, mobile bottom bar, manifest, and service worker assets for PWA-oriented output viewing.
- Widget renderer coverage for button, toggle, slider, number, dropdown, textarea, progress, and table descriptors.
- Runtime process supervisor and broader execution capability plumbing.
- Frontend smoke tests covering automation, learning, and report mode flows.

### Changed

- Renamed the marimo-compatible document adapter to `reactiveAppFormat`.
- Expanded tool rendering across editor, automation, learning, and integration actions.
- Split large frontend bundles with AutomationMode lazy loading and vendor manual chunking.
- Tightened Svelte 5 runes and accessibility handling across key editor components.
- Updated packaging and launcher documentation to reflect trusted publishing and exact wheel distribution policy.

### Fixed

- Reduced false positives in document dependency analysis for nested scopes and comprehension variables.
- Improved engine/runtime behavior around worker management, variables, and process lifecycle.
- Cleaned frontend warning sources in dialog, toast, mode switcher, hint, guide, and widget surfaces.
- Corrected the PyPI workflow to validate the adapter-static editor output in `src/codaro/webBuild` and run tests with the `dev` extra installed.

### Verification

- `uv run pytest tests/ -q` -> `403 passed, 6 skipped`
- `editor/npm run test` -> `19 passed`
- `editor/npm run build` -> success
- `uv build` -> `codaro-0.1.0.tar.gz`, `codaro-0.1.0-py3-none-any.whl`
