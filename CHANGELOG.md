# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the GitHub Release body for each tag is generated from that version's section
in this file (see `docs/skills/ops/release/git-and-release.md`).

## Unreleased

(next release accumulates here)

## 0.0.3 - 2026-05-30

First public download train (`v0.0.1` -> `v0.0.3`) documented as a release. The launcher
now opens an embedded native window instead of a browser tab, and provisioning installs a
runtime that actually runs. The `0.0.x` line is the download-first distribution train and
restarts below the historical internal `0.1.0` package version.

### Added

- Embedded native launcher window built on `tao` 0.33 + `wry` 0.49 (WebView2). `CodaroLauncher.exe` shows a zinc loading screen while it provisions, then loads the local backend inside its own window instead of opening a browser tab.
- `--no-webview` headless fallback that provisions the backend and opens it in the system browser, used by the install-launcher smoke gate and CLI paths.
- Public GitHub Pages landing page focused on Codaro desktop download, local-first positioning, product surfaces, and release trust signals.
- Landing SEO metadata for the desktop product surface, including `SoftwareApplication` structured data and canonical URL handling for GitHub Pages.
- Launcher release workflow with stable `CodaroLauncher.exe`, checksum, and SPDX SBOM asset names, plus a managed Windows Python runtime archive pinned by `release-manifest.json`.
- GitHub Release bodies are now derived from this changelog at tag time (the release workflow extracts the tag's section with `docs/skills/ops/tools/extractChangelogSection.py`), so every release ships a written message.

### Fixed

- Bundled the runtime Python archive with backend dependencies (`fastapi`, `pydantic`, `pyyaml`, `requests`, `uvicorn`) pre-installed, so the launcher's `--no-deps` wheel install no longer fails at startup with `ModuleNotFoundError`.
- Staged the bundled curricula into the backend wheel and resolved the curricula root for both the packaged runtime and local checkouts.
- Hid the console window on Windows so the launcher presents only its native app window.
- Corrected the launcher release workflow to upload artifacts from the Cargo workspace target directory at `launcher/target/release`.

### Verification

- `uv run python -X utf8 tests/run.py preflight` -> all gates pass
- `uv run python -X utf8 tests/run.py gate install-launcher-smoke` -> pass
- `uv run python -X utf8 tests/run.py gate launcher-test` -> pass (`cargo test`)
- Local launch with a fresh approot confirmed a native `Codaro` window with embedded `msedgewebview2` processes and the backend serving 39 curriculum categories.

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

- Removed the legacy reactive document adapter from the active document surface.
- Expanded tool rendering across editor, automation, learning, and integration actions.
- Split large frontend bundles with AutomationMode lazy loading and vendor manual chunking.
- Tightened Svelte 5 runes and accessibility handling across key editor components.
- Updated packaging and launcher documentation to reflect trusted publishing and exact wheel distribution policy.

### Fixed

- Reduced false positives in document dependency analysis for nested scopes and comprehension variables.
- Improved engine/runtime behavior around worker management, variables, and process lifecycle.
- Stabilized soft interrupt handling so worker resets do not surface as connection-reset crashes in CI.
- Cleaned frontend warning sources in dialog, toast, mode switcher, hint, guide, and widget surfaces.
- Corrected the PyPI workflow to validate the adapter-static editor output in `src/codaro/webBuild` and run tests with the `dev` extra installed.
- Fixed main CI drift by syncing launcher call sites with the current Rust APIs and installing backend test dependencies in GitHub Actions.

### Verification

- `uv run pytest tests/ -q` -> `403 passed, 6 skipped`
- `editor/npm run test` -> `19 passed`
- `editor/npm run build` -> success
- `uv build` -> `codaro-0.1.0.tar.gz`, `codaro-0.1.0-py3-none-any.whl`
