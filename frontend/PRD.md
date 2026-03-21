# Frontend PRD

## Archived Marimo Baseline Index

This file is the entrypoint for the archived marimo-parity frontend baseline.

- Detailed source-backed contracts now live under `frontend/prd/`.
- The frozen snapshot was copied to `_backup/frontend/marimo-parity-baseline-2026-03-20/`.
- Keep this file short and stable for session handoff.
- Add or refine actual UI contracts in the split files, not here.
- `frontend/PRD.md` remains the top-level source-of-truth pointer that `AGENTS.md` and `CLAUDE.md` can reference safely.

### Reading Order

1. [01 Goal, Rules, and Sources](./prd/01-goal-rules-and-sources.md)
2. [02 Global App Contract](./prd/02-global-app-contract.md)
3. [03 Workspace Chrome Contract](./prd/03-workspace-chrome-contract.md)
4. [04 Notebook Body Contract](./prd/04-notebook-body-contract.md)
5. [05 Floating Actions, Save, and Recovery](./prd/05-floating-actions-save-recovery.md)
6. [06 Settings and App Config](./prd/06-settings-and-app-config.md)
7. [07 Cell, Editor, Hover, and Output](./prd/07-cell-editor-hover-output.md)
8. [08 Footer Contract](./prd/08-footer-contract.md)
9. [09 Feedback, Health, and Auxiliary UI](./prd/09-feedback-health-and-auxiliary-ui.md)
10. [10 Summary, Acceptance, and Copy Plan](./prd/10-summary-acceptance-and-copy-plan.md)

### Update Rules

- Source of truth is the installed marimo static build under `.venv/Lib/site-packages/marimo/_static/`.
- The current build lock is `marimo==0.21.0`; exact entry asset filenames live in `frontend/prd/01-goal-rules-and-sources.md`.
- `.__marimo_upstream/frontend/src/...` is a readable companion only after the documented surface is mapped back to installed `_static` asset(s).
- No guessed DOM, CSS, spacing, hover, or branch behavior is allowed.
- When a visible surface is documented, write the installed asset(s), the readable source path if used, and the actual branch or token contract.
- When a surface is non-visual, record that explicitly instead of forcing it into the UI inventory.

### Current Truth

- The current marimo-matched Codaro frontend state was frozen as an archive at `_backup/frontend/marimo-parity-baseline-2026-03-20/`.
- The split PRD now serves as the reference archive for that baseline and for future Codaro deltas.
- This archive is not allowed to claim finished `marimo 1:1` parity because the remaining browser-backed verification items in `frontend/prd/10-summary-acceptance-and-copy-plan.md` were not closed before freeze.

### Session Resume

When resuming from the archived baseline:

1. Start from [10 Summary, Acceptance, and Copy Plan](./prd/10-summary-acceptance-and-copy-plan.md).
2. Read `12.1 Current State`, `12.2 Next Action`, and `12.3 Verification Left` to see what was frozen and what remained open.
3. Then jump into the specific split file for the visible surface being referenced or intentionally changed by Codaro.

### Current File Map

- Global shell, root, app container, sidebar wrapper, context-aware panel:
  - [02 Global App Contract](./prd/02-global-app-contract.md)
- Left rail, helper sidebar, developer panel, panel bodies:
  - [03 Workspace Chrome Contract](./prd/03-workspace-chrome-contract.md)
- Filename bar, notebook body, banners, add-cell strip:
  - [04 Notebook Body Contract](./prd/04-notebook-body-contract.md)
- Top-right controls, bottom-right stack, find/replace, command palette, save and recovery:
  - [05 Floating Actions, Save, and Recovery](./prd/05-floating-actions-save-recovery.md)
- Settings and app config:
  - [06 Settings and App Config](./prd/06-settings-and-app-config.md)
- Cell root, editor, hover, status, console, output:
  - [07 Cell, Editor, Hover, and Output](./prd/07-cell-editor-hover-output.md)
- Footer:
  - [08 Footer Contract](./prd/08-footer-contract.md)
- Feedback, health, share-static, package alert, auxiliary UI:
  - [09 Feedback, Health, and Auxiliary UI](./prd/09-feedback-health-and-auxiliary-ui.md)
- Inventory, current state, acceptance criteria, checklist, perfect copy plan:
  - [10 Summary, Acceptance, and Copy Plan](./prd/10-summary-acceptance-and-copy-plan.md)
