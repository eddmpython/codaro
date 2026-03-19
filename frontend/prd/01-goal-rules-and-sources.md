# Frontend PRD

## Marimo Frontend 1:1 Reverse Engineering Spec

[Back to PRD Index](../PRD.md) | [Resume from Summary](./10-summary-acceptance-and-copy-plan.md#121-current-state)

#### 0.0 Split Navigation

- `frontend/PRD.md` is the short index and safe entrypoint for repo-level references.
- `frontend/prd/*.md` carries the actual source-backed marimo parity contracts.
- session resume starts from `10-summary-acceptance-and-copy-plan.md`, then jumps back into the relevant split file.

### 1. Goal

Codaro `frontend/` must reproduce the marimo edit frontend with `Svelte + CSS` at DOM-contract level.

- The target includes `head`, `root`, `workspace chrome`, `left rail`, `helper sidebar`, `developer panel`, `filename bar`, `floating controls`, `footer`, `settings`, `save dialogs`, `feedback dialog`, `cell wrapper`, `editor`, `hover overlay`, `status rail`, `console output`, and `output surface`.
- Parity means identical source-backed branch behavior, DOM hierarchy, class tokens, state splits, IDs, and `data-testid` hooks.
- Implementation must stay in Codaro Svelte and CSS. Vendor import is not the parity target.
- Guesses are forbidden. Every wrapper, token, and branch in this document is taken from marimo source or local DOM capture.

### 2. Working Rules

- Only source-backed DOM, class tokens, and state branches may be copied.
- Do not add wrappers that are not present in source.
- Do not convert utility tokens such as `rounded-md`, `border`, or `shadow-xs-solid` into guessed pixel values.
- `data-testid`, `id`, and ARIA labels are part of the contract.
- Hover behavior must come from source CSS selectors, not custom JS emulation.
- When source branches differ by mode, Codaro must mirror the same branch boundaries instead of flattening them into one custom layout.

### 3. Source Of Truth

#### 3.1 Static Entry

- `.venv/Lib/site-packages/marimo/_static/index.html`

#### 3.2 Upstream Frontend Root

- `.__marimo_upstream/frontend/src/components/pages/edit-page.tsx`
- `.__marimo_upstream/frontend/src/components/editor/app-container.tsx`

#### 3.3 DOM Capture

- `experiments/marimo-layout.dom.html`

#### 3.4 Shell, Chrome, Layout, Header, and Controls

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/panels.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer.tsx`
- `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/vertical-layout.tsx`
- `.__marimo_upstream/frontend/src/components/editor/notebook-cell.tsx`
- `.__marimo_upstream/frontend/src/components/editor/controls/Controls.tsx`
- `.__marimo_upstream/frontend/src/components/editor/controls/notebook-menu-dropdown.tsx`
- `.__marimo_upstream/frontend/src/components/editor/controls/command-palette.tsx`
- `.__marimo_upstream/frontend/src/components/editor/controls/shutdown-button.tsx`
- `.__marimo_upstream/frontend/src/components/editor/header/filename-form.tsx`
- `.__marimo_upstream/frontend/src/components/editor/header/filename-input.tsx`
- `.__marimo_upstream/frontend/src/components/editor/actions/useNotebookActions.tsx`
- `.__marimo_upstream/frontend/src/components/editor/actions/useCellActionButton.tsx`
- `.__marimo_upstream/frontend/src/components/editor/actions/useConfigActions.tsx`
- `.__marimo_upstream/frontend/src/components/editor/SortableCell.tsx`
- `.__marimo_upstream/frontend/src/components/editor/cell/CreateCellButton.tsx`
- `.__marimo_upstream/frontend/src/components/editor/cell/toolbar.tsx`
- `.__marimo_upstream/frontend/src/components/editor/cell/cell-actions.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-item.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/runtime-settings.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/ai-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/backend-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/copilot-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/rtc-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/machine-stats.tsx`
- `.__marimo_upstream/frontend/src/components/editor/controls/keyboard-shortcuts.tsx`
- `.__marimo_upstream/frontend/src/components/editor/renderers/cell-array.tsx`
- `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/vertical-layout-wrapper.tsx`
- `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/sidebar/wrapped-with-sidebar.tsx`
- `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.styles.ts`
- `.__marimo_upstream/frontend/src/components/ui/button.tsx`
- `.__marimo_upstream/frontend/src/core/edit-app.tsx`

#### 3.5 Editor, Cell, Save, Recovery, and Output

- `.__marimo_upstream/frontend/src/components/editor/cell/code/cell-editor.tsx`
- `.__marimo_upstream/frontend/src/components/editor/cell/code/language-toggle.tsx`
- `.__marimo_upstream/frontend/src/components/editor/cell/CellStatus.tsx`
- `.__marimo_upstream/frontend/src/components/editor/RecoveryButton.tsx`
- `.__marimo_upstream/frontend/src/core/saving/save-component.tsx`
- `.__marimo_upstream/frontend/src/components/editor/Output.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/Outputs.css`
- `.__marimo_upstream/frontend/src/components/editor/output/HtmlOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/TextOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/JsonOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/ImageOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/VideoOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/MarimoErrorOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/MarimoTracebackOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/CalloutOutput.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/console/ConsoleOutput.tsx`

#### 3.6 Helper and Developer Panels

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/file-explorer-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/dependency-graph-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/documentation-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/datasources-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/variable-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/packages-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/snippets-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/outline-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/error-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/scratchpad-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/secrets-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/write-secret-modal.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/logs-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/tracing-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/cache-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/session-panel.tsx`

#### 3.7 Chat and Agent Surfaces

- `.__marimo_upstream/frontend/src/components/chat/chat-panel.tsx`
- `.__marimo_upstream/frontend/src/components/chat/chat-components.tsx`
- `.__marimo_upstream/frontend/src/components/chat/chat-display.tsx`
- `.__marimo_upstream/frontend/src/components/chat/chat-history-popover.tsx`
- `.__marimo_upstream/frontend/src/components/chat/reasoning-accordion.tsx`
- `.__marimo_upstream/frontend/src/components/chat/tool-call-accordion.tsx`
- `.__marimo_upstream/frontend/src/components/ai/ai-model-dropdown.tsx`
- `.__marimo_upstream/frontend/src/components/mcp/mcp-status-indicator.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/agent-panel.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/agent-selector.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/blocks.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/model-selector.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/scroll-to-bottom-button.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/thread.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/session-tabs.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/agent-docs.tsx`

#### 3.8 File Tree and Dependency Graph Internals

- `.__marimo_upstream/frontend/src/components/editor/file-tree/file-explorer.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/file-viewer.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/tree-actions.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/renderers.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/file-icons.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/dnd-wrapper.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/upload.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/state.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/dependency-graph.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/custom-node.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/minimap-content.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/panels.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/elements.ts`
- `.__marimo_upstream/frontend/src/components/dependency-graph/utils/layout.ts`
- `.__marimo_upstream/frontend/src/components/dependency-graph/utils/useFitToViewOnDimensionChange.ts`

#### 3.9 Global CSS, Input, Sidebar, Filename, and Status Styling

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.css`
- `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/sidebar/sidebar.css`
- `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.tsx`
- `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.css`
- `.__marimo_upstream/frontend/src/components/editor/header/filename-input.css`
- `.__marimo_upstream/frontend/src/components/editor/cell/cell-status.css`
- `.__marimo_upstream/frontend/src/components/editor/documentation.css`
- `.__marimo_upstream/frontend/src/components/dependency-graph/dependency-graph.css`
- `.__marimo_upstream/frontend/src/css/app/Cell.css`
- `.__marimo_upstream/frontend/src/css/app/App.css`
- `.__marimo_upstream/frontend/src/css/app/Header.css`
- `.__marimo_upstream/frontend/src/css/app/codemirror.css`
- `.__marimo_upstream/frontend/src/css/app/codemirror-completions.css`
- `.__marimo_upstream/frontend/src/css/app/fonts.css`
- `.__marimo_upstream/frontend/src/css/app/print.css`
- `.__marimo_upstream/frontend/src/css/app/reset.css`
- `.__marimo_upstream/frontend/src/css/common.css`
- `.__marimo_upstream/frontend/src/css/globals.css`
- `.__marimo_upstream/frontend/src/css/index.css`
- `.__marimo_upstream/frontend/src/css/md.css`
- `.__marimo_upstream/frontend/src/components/editor/cell/TinyCode.css`
- `.__marimo_upstream/frontend/src/components/editor/output/Outputs.css`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/outline-panel.css`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/snippets-panel.css`
- `.__marimo_upstream/frontend/src/components/editor/ai/merge-editor.css`
- `.__marimo_upstream/frontend/src/components/terminal/xterm.css`
- `.__marimo_upstream/frontend/src/components/markdown/markdown-renderer.css`
- `.__marimo_upstream/frontend/src/components/chat/acp/agent-panel.css`
- `.__marimo_upstream/frontend/src/components/ui/reorderable-list.css`

