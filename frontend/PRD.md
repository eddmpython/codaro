# Frontend PRD

## Marimo Frontend 1:1 Reverse Engineering Spec

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

#### 3.5 Editor, Cell, Save, Recovery, and Output

- `.__marimo_upstream/frontend/src/components/editor/cell/code/cell-editor.tsx`
- `.__marimo_upstream/frontend/src/components/editor/cell/code/language-toggle.tsx`
- `.__marimo_upstream/frontend/src/components/editor/cell/CellStatus.tsx`
- `.__marimo_upstream/frontend/src/components/editor/RecoveryButton.tsx`
- `.__marimo_upstream/frontend/src/core/saving/save-component.tsx`
- `.__marimo_upstream/frontend/src/components/editor/Output.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/Outputs.css`

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
- `.__marimo_upstream/frontend/src/components/chat/chat-history-popover.tsx`
- `.__marimo_upstream/frontend/src/components/chat/tool-call-accordion.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/agent-panel.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/blocks.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/thread.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/session-tabs.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/agent-docs.tsx`

#### 3.8 File Tree and Dependency Graph Internals

- `.__marimo_upstream/frontend/src/components/editor/file-tree/file-explorer.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/file-viewer.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/dependency-graph.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/custom-node.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/minimap-content.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/panels.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/elements.ts`
- `.__marimo_upstream/frontend/src/components/dependency-graph/utils/layout.ts`
- `.__marimo_upstream/frontend/src/components/dependency-graph/utils/useFitToViewOnDimensionChange.ts`

#### 3.9 Global CSS, Input, Sidebar, Filename, and Status Styling

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.css`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/sidebar/sidebar.css`
- `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.tsx`
- `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.css`
- `.__marimo_upstream/frontend/src/components/editor/header/filename-input.css`
- `.__marimo_upstream/frontend/src/components/editor/cell/cell-status.css`
- `.__marimo_upstream/frontend/src/components/editor/documentation.css`
- `.__marimo_upstream/frontend/src/components/dependency-graph/dependency-graph.css`

### 4. Global App Contract

#### 4.1 Head, Hidden Mount Tags, and Portal

`index.html` requires these tags:

- `<meta charset="utf-8">`
- `<meta name="viewport" content="width=device-width, initial-scale=1">`
- `<meta name="theme-color" content="#000000">`
- `<meta name="description" content="a marimo app">`
- `<link rel="icon" href="./favicon.ico">`
- `<link rel="apple-touch-icon" href="./apple-touch-icon.png">`
- `<link rel="manifest" href="./manifest.json">`

Required preloads:

- `./assets/gradient-yHQUC_QB.png`
- `./assets/noise-60BoTA8O.png`
- `./assets/Lora-VariableFont_wght-B2ootaw-.ttf`
- `./assets/PTSans-Regular-CxL0S8W7.ttf`
- `./assets/PTSans-Bold-D9fedIX3.ttf`
- `./assets/FiraMono-Regular-BTCkDNvf.ttf`
- `./assets/FiraMono-Medium-DU3aDxX5.ttf`
- `./assets/FiraMono-Bold-CLVRCuM9.ttf`

Required hidden mount tags:

- `<marimo-filename hidden>`
- `<marimo-version data-version hidden>`
- `<marimo-user-config data-config hidden>`
- `<marimo-server-token data-token hidden>`

Required mount script:

- `window.__MARIMO_MOUNT_CONFIG__`

Portal contract:

- `#portal[data-testid="glide-portal"]`
- inline style:
  - `position: fixed`
  - `left: 0`
  - `top: 0`
  - `z-index: 9999`

Global CSS contract:

- `html { font-size: 90% }`
- `@media screen and (height>=1000px) { html { font-size: 100% } }`
- `:root { --content-width: 740px; --content-width-medium: 1110px }`
- `#App { z-index: 1; flex: 1; margin: auto; position: relative }`
- `.disconnected-gradient`
  - `background-image: url(./gradient-yHQUC_QB.png)`
  - `background-repeat: no-repeat`
  - `background-size: cover`
- `.noise`
  - `background-image: url(./noise-60BoTA8O.png)`
  - `background-repeat: repeat`
  - `opacity: .5`

#### 4.2 Root DOM Hierarchy

`experiments/marimo-layout.dom.html` fixes the root shell:

```text
body.light.light-theme[data-theme="light"]
  marimo-filename
  marimo-version
  marimo-user-config
  marimo-server-token
  #root
    .contents[style="--marimo-code-editor-font-size: 0.875rem;"]
      .flex.flex-col.flex-1.overflow-hidden.absolute.inset-0.print:relative
        left chrome rail
        #app-chrome-sidebar[data-testid="helper"]
        #app-chrome-body
          #app
            .noise
            .disconnected-gradient
            #App
              filename bar
              notebook body
              floating action stack
              footer
        #app-chrome-panel[data-testid="panel"]
    #portal[data-testid="glide-portal"]
```

`#App` root class contract:

- `mathjax_ignore disconnected bg-background w-full h-full text-textColor flex flex-col overflow-y-auto overflow-x-hidden print:height-fit`

#### 4.2.1 Top-Level Render Branches

Source:

- `.__marimo_upstream/frontend/src/components/pages/edit-page.tsx`
- `.__marimo_upstream/frontend/src/core/edit-app.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`

Chrome visibility branch:

- local gate:
  - `new URL(window.location.href).searchParams.get(KnownQueryParams.showChrome) === "false"`
- lazy command palette component:
  - `LazyCommandPalette`
- notebook page component:
  - `EditApp`

`showChrome=false` branch:

- notebook page renders as:
  - `<EditApp hideControls={true} {...props} />`
- command palette remains mounted in parallel:
  - `<LazyCommandPalette />`
- fragment child order:
  - `EditApp`
  - `LazyCommandPalette`

Default chrome branch:

- notebook page renders as:
  - `<EditApp {...props} />`
- chrome wrapper:
  - `AppChrome`
- command palette remains mounted in parallel:
  - `<LazyCommandPalette />`
- fragment child order:
  - `AppChrome`
    - child notebook page `EditApp`
  - `LazyCommandPalette`

#### 4.2.2 EditApp Composition

Source:

- `.__marimo_upstream/frontend/src/core/edit-app.tsx`
- `.__marimo_upstream/frontend/src/components/editor/app-container.tsx`
- `.__marimo_upstream/frontend/src/components/editor/header/app-header.tsx`
- `.__marimo_upstream/frontend/src/components/editor/renderers/cells-renderer.tsx`

`EditApp` top-level sibling order:

- `AppContainer`
- `MultiCellActionToolbar`
- optional floating controls branch:
  - `TooltipProvider`
    - `Controls`

`AppContainer` shell order:

- `DynamicFavicon`
- `StatusOverlay`
- `PyodideLoader`
  - `WrappedWithSidebar`
    - `div#App`

`AppContainer` root `#App` data and class contract:

- `id: "App"`
- `data-config-width: width`
- `data-connection-state: connection.state`
- class composition:
  - `mathjax_ignore`
  - adds `disconnected` when `isAppClosed(connection.state)`
  - `bg-background w-full h-full text-textColor`
  - `flex flex-col overflow-y-auto`
  - adds `config-width-full` when `width === "full"`
  - adds `overflow-x-auto` when `width === "columns"`
  - otherwise `overflow-x-hidden`
  - `print:height-fit`

`AppHeader` contract inside `AppContainer`:

- class from `EditApp`:
  - `pt-4 sm:pt-12 pb-2 mb-4 print:hidden z-50 sticky left-0`
- child branch when `viewState.mode === "edit"`:
  - `div.flex.items-center.justify-center.container`
    - `FilenameForm`
- disconnected add-on branch:
  - `Disconnected`
  - props:
    - `reason: connection.reason`
    - `canTakeover: connection.canTakeover`

Notebook body branch inside `AppContainer`:

- when `hasCells`:
  - `CellsRenderer`
    - child `CellArray`
- when `!hasCells`:
  - `NotStartedConnectionAlert`

`CellsRenderer` branch contract:

- when `mode === "edit"` and kiosk mode is false:
  - returns `children` directly
- otherwise:
  - resolves `finalLayout` from `selectedLayout`
  - in `read` mode, `KnownQueryParams.viewAs` can override layout when included in `OVERRIDABLE_LAYOUT_TYPES`
  - finds the plugin in `cellRendererPlugins`
  - if no plugin exists, returns `children`
  - otherwise renders `plugin.Component` with:
    - `appConfig`
    - `mode`
    - `cells: flattenTopLevelNotebookCells(useNotebook())`
    - `layout: layoutData[finalLayout] || plugin.getInitialLayout(cells)`
    - `setLayout: setCurrentLayoutData`

Floating controls gate from `EditApp`:

- controls mount only when `hideControls === false`
- `Controls` props:
  - `presenting: viewState.mode === "present"`
  - `onTogglePresenting: togglePresenting`
  - `onInterrupt: sendInterrupt`
  - `onRun: runStaleCells`
  - `connectionState: connection.state`
  - `running: notebookIsRunningAtom`
  - `appConfig`

#### 4.3 Utility Token Resolution

These utility tokens are fixed by `index-CVpJvEAO.css`.

- `.rounded-md`
  - `border-radius: calc(var(--radius) - 2px)`
- `.rounded`
  - `border-radius: .25rem`
- `.border`
  - `border-style: var(--tw-border-style)`
  - `border-width: 1px`
- `.text-xs`
  - `font-size: var(--text-xs, .75rem)`
  - `line-height: var(--text-xs--line-height, 1.33333)`
- `.text-sm`
  - `font-size: var(--text-sm, .875rem)`
  - `line-height: var(--text-sm--line-height, 1.42857)`
- `.right-5`
  - `right: calc(var(--spacing, .25rem) * 5)`
- `.right-3`
  - `right: calc(var(--spacing, .25rem) * 3)`
- `.top-1`
  - `top: calc(var(--spacing, .25rem) * 1)`
- `.top-2`
  - `top: calc(var(--spacing, .25rem) * 2)`
- `.gap-1`
  - `gap: calc(var(--spacing, .25rem) * 1)`
- `.gap-2`
  - `gap: calc(var(--spacing, .25rem) * 2)`
- `.px-1`
  - `padding-inline: calc(var(--spacing, .25rem) * 1)`
- `.px-3`
  - `padding-inline: calc(var(--spacing, .25rem) * 3)`
- `.py-2`
  - `padding-block: calc(var(--spacing, .25rem) * 2)`
- `.p-2`
  - `padding: calc(var(--spacing, .25rem) * 2)`
- `.h-7`
  - `height: calc(var(--spacing, .25rem) * 7)`
- `.h-8`
  - `height: calc(var(--spacing, .25rem) * 8)`
- `.w-2`
  - `width: calc(var(--spacing, .25rem) * 2)`
- `.m-0`
  - `margin: 0`
- `.opacity-80`
  - `opacity: .8`
- `.leading-none`
  - `line-height: 1`
- `.items-center`
  - `align-items: center`
- `.justify-center`
  - `justify-content: center`
- `.pointer-events-auto`
  - `pointer-events: auto`
- `.z-30`
  - `z-index: 30`
- `.sticky`
  - `position: sticky`
- `.shadow-xs-solid`
  - `--tw-shadow: 1px 1px 0px 0px var(--tw-shadow-color, var(--base-shadow-darker)), 0px 0px 2px 0px var(--tw-shadow-color, #80808033)`
- `.container`
  - breakpoint `max-width` branches remain active and must not be flattened away

### 5. Workspace Chrome Contract

#### 5.1 Left Chrome Rail

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/sidebar.tsx`
- `.__marimo_upstream/frontend/src/components/ui/reorderable-list.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`

Wrapper class:

- `h-full pt-4 pb-1 px-1 flex flex-col items-start text-muted-foreground text-md select-none text-sm z-50 dark:bg-background print:hidden hide-on-fullscreen`

Base sidebar item shell:

- `flex items-center p-2 text-sm mx-px shadow-inset font-mono rounded`
- unselected state adds `hover:bg-(--sage-3)`
- selected state adds `bg-(--sage-4)`

Sidebar item element branch:

- render `button` when `onClick` exists
- render plain `div` when `onClick` is absent

Sidebar item tooltip rules:

- tooltip side is `right`
- tooltip delay is `200`

Sidebar registry contract:

- rail list is reorderable through `ReorderableList`
- `ariaLabel: "Sidebar panels"`
- drag type is `panels`
- list id is `sidebar`
- cross-list drag receiver can move items into the developer panel

Reorderable rail primitive contract:

- cross-list payload MIME:
  - `application/x-reorderable-${dragType}`
- cross-list payload body:
  - `{ itemId: String(key), sourceListId, item }`
- accepted drag types:
  - custom MIME first when cross-list drag is enabled
  - always also accepts `text/plain`
- root collection primitive:
  - `ListBox`
  - `selectionMode: "none"`
- rendered draggable item wrapper:
  - `ListBoxItem`
  - `className: "active:cursor-grabbing data-[dragging]:opacity-60 outline-none"`
- empty placeholder branch:
  - `ListBoxItem`
  - `id: "__empty__"`
  - `className: "min-h-[40px] min-w-[40px]"`
- available-items branch wraps the list with:
  - trigger wrapper `ContextMenuTrigger asChild`
  - option list `ContextMenuContent`
  - combined shell `ContextMenu`
- available item checkbox rows use:
  - `ContextMenuCheckboxItem`
  - disabled when the item is selected and the list length is already at `minItems`
- missing `onAction` target path logs:
  - `handleAction: item not found for key`
- helper label row for sidebar item pickers:
  - `span.flex.items-center.gap-2`
  - icon class `h-4 w-4 text-muted-foreground`

Sidebar panel registry:

- `files` -> `LazyFileExplorerPanel`
- `variables` -> `LazySessionPanel`
- `dependencies` -> `LazyDependencyGraphPanel`
- `packages` -> `LazyPackagesPanel`
- `outline` -> `LazyOutlinePanel`
- `documentation` -> `LazyDocumentationPanel`
- `snippets` -> `LazySnippetsPanel`
- `ai` -> `renderAiPanel()` returning `LazyAgentPanel` when `external_agents` is enabled and the selected AI tab is `agents`; otherwise `LazyChatPanel`
- `errors` -> `LazyErrorsPanel`
- `scratchpad` -> `LazyScratchpadPanel`
- `tracing` -> `LazyTracingPanel`
- `secrets` -> `LazySecretsPanel`
- `logs` -> `LazyLogsPanel`
- `terminal` -> `LazyTerminal` with `visible={isSidebarOpen && selectedPanel === "terminal"}`
- `cache` -> `LazyCachePanel`

Fixed extra rail items:

- feedback item wraps `SidebarItem` with tooltip `Send feedback!`
- running indicator is rendered at the bottom

Rail icon contract:

- generic rail icon renderer `renderIcon(panel, extraClass)` uses:
  - `panel.Icon`
  - base class `h-5 w-5`
- `errors` rail item uses `ErrorPanelIcon`
  - base icon class `h-5 w-5`
  - adds `text-destructive` when `cellErrorCount > 0`
- feedback rail icon:
  - `MessageCircleQuestionIcon`
  - `className: "h-5 w-5"`

Running indicator contract:

- tooltip string when idle: `No cells queued or running`
- tooltip string when non-zero: `${count} cell(s) queued or running`
- tooltip side:
  - `right`
- tooltip delay:
  - `200`
- bar stack wrapper:
  - `flex flex-col-reverse gap-px overflow-hidden`
- bar class:
  - `shrink-0 h-1 w-2 bg-(--grass-6) border border-(--grass-7)`

#### 5.2 Helper Sidebar

Panel identity:

- `id="app-chrome-sidebar"`
- `data-testid="helper"`

Panel class:

- `dark:bg-(--slate-1) print:hidden hide-on-fullscreen`
- adds `border-r border-l border-(--slate-7)` when open

Resizable panel contract:

- `collapsedSize: 0`
- `collapsible: true`
- `minSize: 10`
- `defaultSize: 0`
- `maxSize: 75`

Resize handle contract:

- base class `border-border print:hidden z-10`
- collapsed token `resize-handle-collapsed`
- open token `resize-handle`
- orientation `vertical`
- CSS from `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.css`:
  - `.resize-handle, .resize-handle-collapsed { transition: 250ms linear background-color; outline: none }`
  - `.resize-handle.vertical, .resize-handle-collapsed.vertical { width: 4px }`
  - `.resize-handle:hover, .resize-handle[data-resize-handle-active], .resize-handle-collapsed:hover, .resize-handle-collapsed[data-resize-handle-active] { background-color: var(--slate-11) }`

Helper body wrapper:

- `flex flex-col h-full flex-1 overflow-hidden mr-[-4px]`

Header shell:

- `p-3 border-b flex justify-between items-center`

Close button contract:

- `data-testid="close-helper-pane"`
- `variant: "text"`
- `size: "xs"`
- `className: "m-0"`

Header title branch:

- default label class:
  - `text-sm text-(--slate-11) uppercase tracking-wide font-semibold flex-1`
- `dependencies` branch shows segmented control:
  - label `Dependencies`
  - tabs `Minimap`, `Graph`
  - tab item class `py-0.5 text-xs uppercase tracking-wide font-bold`
- `ai` branch with `external_agents` flag shows segmented control:
  - tabs `Chat`, `Agents`
  - tab item class `py-0.5 text-xs uppercase tracking-wide font-bold`

#### 5.2.1 Files Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/file-explorer-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/file-explorer.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/file-viewer.tsx`
- `.__marimo_upstream/frontend/src/components/editor/file-tree/upload.tsx`

Top-level branch:

- feature flag:
  - `getFeatureFlag("storage_inspector")`
- when disabled:
  - renders only `FileExplorerComponent`
- when enabled:
  - renders accordion sections:
    - `remote-storage`
    - `files`

Files section header when storage inspector is enabled:

- label:
  - `Files`
- icon:
  - `FileIcon`
  - class `w-4 h-4`

Remote storage section header when storage inspector is enabled:

- label:
  - `Remote storage`
- icon:
  - `HardDrive`
  - class `w-4 h-4`
- count badge:
  - `PanelBadge`
  - shows namespace count when the section is closed and count is non-zero

Local files root body:

- source component:
  - `FileExplorerComponent`
- root class:
  - `flex flex-col overflow-hidden relative`
- root uses dropzone input
- active drag overlay class:
  - `absolute inset-0 flex items-center uppercase justify-center text-xl font-bold text-primary/90 bg-accent/85 z-10 border-2 border-dashed border-primary/90 rounded-lg pointer-events-none`
- active drag text:
  - `Drop files here`

Local files toolbar:

- source component:
  - `Toolbar`
- wrapper class:
  - `flex items-center justify-end px-2 shrink-0 border-b`
- buttons in exact order:
  - add notebook
  - add file
  - add folder
  - upload file
  - refresh
  - toggle hidden files
  - collapse all folders
- button testids:
  - `data-testid="file-explorer-add-notebook-button"`
  - `data-testid="file-explorer-add-file-button"`
  - `data-testid="file-explorer-add-folder-button"`
  - `data-testid="file-explorer-upload-button"`
  - `data-testid="file-explorer-refresh-button"`
  - `data-testid="file-explorer-hidden-files-button"`
  - `data-testid="file-explorer-collapse-button"`
- tooltip strings:
  - `Add notebook`
  - `Add file`
  - `Add folder`
  - `Upload file`
  - `Toggle hidden files`
  - `Collapse all folders`

Local files branch states:

- loading:
  - `Spinner`
  - `size: "medium"`
  - `centered: true`
- error:
  - `ErrorBanner`
- selected file branch:
  - shows back button `data-testid="file-explorer-back-button"`
  - selected-file header class:
    - `flex items-center pl-1 pr-3 shrink-0 border-b justify-between`
  - file detail body is mounted lazily

Selected local file detail lazy body:

- source component:
  - `FileViewer`
- data fetch and draft cache:
  - loads file details with `sendFileDetails({ path: file.path })`
  - writes updates with `sendUpdateFile({ path: file.path, contents: draft })`
  - keeps unsaved drafts in local map `unsavedContentsForFile`, keyed by absolute file path
  - pending branch returns `null`
  - error branch renders `ErrorBanner`
- mime and editability gates:
  - `mimeType = fileDetails.mimeType || "text/plain"`
  - media preview branch when `mimeType in qt`
  - editable-text branch only when `!media && mimeType !== "text/csv"`
  - current-running-notebook warning only when:
    - current notebook path exists
    - selected file is a marimo file
    - selected file path equals current notebook path or ends with `/${currentNotebookPath}`
- empty non-preview branch:
  - when `!contents && !media`
  - root class:
    - `grid grid-cols-2 gap-2 p-6`
  - fields:
    - `Name`
    - `Type`
- top bar:
  - reuses `FilePreviewHeader`
  - `filename = fileDetails.file.name`
  - refresh action calls `refetch`
  - download action:
    - media mime uses `downloadByURL(base64ToDataURL(base64, mimeType), filename)`
    - text or binary uses `downloadBlob(new Blob([contents || draft], { type: mimeType }), filename)`
- top bar actions:
  - marimo-file action gate:
    - `file.isMarimoFile && !isWasm()`
  - marimo-file action tooltip:
    - `Open notebook`
  - marimo-file action button:
    - `variant: "text"`
    - `size: "xs"`
    - icon `ExternalLinkIcon`
    - icon class `h-3.5 w-3.5`
  - non-media actions:
    - `Copy contents to clipboard`
    - `renderShortcut("global.save")`
  - copy and save buttons:
    - `variant: "text"`
    - `size: "xs"`
  - copy icon:
    - `CopyIcon`
    - class `h-3.5 w-3.5`
  - save icon:
    - `SaveIcon`
    - class `h-3.5 w-3.5`
  - save disabled gate:
    - `draft === fileDetails.contents`
- running-notebook warning banner:
  - component:
    - `Alert`
  - props:
    - `variant: "warning"`
    - `className: "rounded-none"`
  - icon:
    - `AlertTriangleIcon`
    - class `h-4 w-4`
  - copy:
    - `Editing the notebook file directly while running in marimo's editor may cause unintended changes. Please use with caution.`
- file renderer:
  - component:
    - `FileContentRenderer`
  - props:
    - `mimeType = mimeType`
    - media branch uses `mediaSource: { base64: fileDetails.contents, mime: mimeType }`
    - editable-text branch uses `contents = draft`
    - readonly-text branch uses `contents = fileDetails.contents ?? undefined`
    - `readOnly = !editableText`
    - `onChange = setDraft`
- dirty-draft persistence:
  - on unmount, if original contents exist and draft differs, cache the draft in `unsavedContentsForFile`
  - if draft matches original contents, remove the cached draft entry
- save hotkey:
  - injects CodeMirror extension:
    - `keymap.of([{ key: hotkeys.getHotkey("global.save").key, stopPropagation: true, run: ... }])`
  - hotkey no-ops when draft equals original contents
  - hotkey triggers the same update path as the save button when dirty

Tree contract:

- tree component:
  - `Tree`
- root props:
  - `className: "h-full"`
  - `padding: 15`
  - `rowHeight: 30`
  - `indent: 15`
  - `overscanCount: 1000`
  - `disableMultiSelection: true`
- hidden-file gate:
  - files starting with `.` are excluded unless `showHiddenFiles` is enabled

Tree row contract:

- row wrapper class:
  - `flex items-center cursor-pointer ml-1 text-muted-foreground whitespace-nowrap group`
- item shell class:
  - `flex items-center pl-1 py-1 cursor-pointer hover:bg-accent/50 hover:text-accent-foreground rounded-l flex-1 overflow-hidden group`
- marimo file inline open affordance:
  - text `open`
  - external icon `ExternalLinkIcon`
- row more-menu button testid:
  - `data-testid="file-explorer-more-button"`

File row dropdown inventory:

- `Open file`
- `Open file in external editor`
- `Create notebook`
- `Create file`
- `Create folder`
- `Rename`
- `Duplicate`
- `Copy path`
- `Copy relative path`
- `Insert snippet for reading file`
- `Copy snippet for reading file`
- `Open notebook`
- `Download`
- `Delete`

Local file prompts and dialogs:

- create-folder prompt title:
  - `Folder name`
- create-file prompt title:
  - `File name`
- create-notebook prompt title:
  - `Notebook name`
- delete confirm title:
  - `Delete file`
- delete confirm description:
  - `Are you sure you want to delete ${name}?`
- confirm button label:
  - `Delete`

Tree engine contract:

- explorer root props:
  - `width: "100%"`
  - `openByDefault: false`
- render cursor:
  - `wn -> null`
- disableDrop:
  - `!parentNode.data.isDirectory`
- select callback:
  - directories are ignored
  - files open preview pane

Local file row interaction detail:

- row container is `draggable: true`
- directory row click:
  - `toggle()`
- inline marimo open affordance:
  - hidden by default
  - `group-hover:inline`
- rename input class:
  - `flex-1 bg-transparent border border-border text-muted-foreground`
- rename input behavior:
  - focus on mount
  - select basename before extension
  - `Escape -> reset`
  - `Enter -> submit`
- row drop-highlight for directory target:
  - `bg-accent/80 hover:bg-accent/80 text-accent-foreground`

File row menu detail:

- dropdown class:
  - `print:hidden w-[220px]`
- separators:
  - `DropdownMenuSeparator`
- menu icon class token:
  - `MENU_ITEM_ICON_CLASS`
- duplicate name rule:
  - `${base}_copy${ext}`
- duplicate failure toast:
  - title `Failed to duplicate file`
  - description `Unable to create a duplicate of the file`
- copy-path toast:
  - title `Copied to clipboard`
- copy-read-snippet toast:
  - title `Copied to clipboard`
  - description `Code to open the file has been copied to your clipboard. You can also drag and drop this file into the editor`
- marimo notebook open path:
  - `openMarimoNotebook(event, tree.relativeFromRoot(path))`
- download branch gate:
  - hidden for directories
  - hidden when `disableFileDownloads` is true

Remote storage body:

- source component:
  - `StorageInspector`
- root class:
  - `border-b bg-background rounded-none h-full pb-10 overflow-auto outline-hidden scrollbar-thin`
- search input placeholder:
  - `Search entries...`
- clear-search button:
  - textless text-button with `XIcon`
- search-help tooltip:
  - `Filters loaded entries only. Expand directories to include their contents in the search.`

Remote storage empty state:

- title:
  - `No storage connected`
- description includes:
  - `Create an obstore or fsspec connection in your notebook.`
  - docs link to marimo remote storage guide
- action label:
  - `Add remote storage`

Remote storage namespace row:

- row class:
  - `flex flex-row font-semibold h-7 text-xs gap-1.5 bg-(--slate-2) text-muted-foreground rounded-none`
- refresh tooltip:
  - `Refresh storage connection`
- empty-state strings inside an opened namespace:
  - `Loading...`
  - `No entries`
  - `No matches`

Remote storage entry row:

- row class:
  - `text-xs flex items-center gap-1.5 cursor-pointer rounded-none group h-6.5`
- hover metadata shells:
  - size label class `text-[10px] text-muted-foreground pr-2 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums`
  - modified label class `text-[10px] text-muted-foreground pr-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`
- row dropdown inventory:
  - `View`
  - `Copy path`
  - `Download`
  - `Insert read snippet`
  - `Insert download snippet`

Remote storage preview pane:

- source component:
  - `StorageFileViewer`
- top bar component:
  - `FilePreviewHeader`
- top bar wrapper class:
  - `flex items-center shrink-0 border-b px-1 gap-1`
- back tooltip:
  - `Back to file list`
- refresh tooltip:
  - `Refresh`
- download tooltip:
  - `Download`
- metadata labels:
  - `Path`
  - `Type`
  - `Size`
  - `Modified`
- preview branch strings:
  - `File is too large to preview (...)`
  - `Loading preview...`
  - `Failed to load preview: ...`
  - `Retry`
  - `Preview not available for this file type.`

Remote storage detail pane:

- title row filename shell:
  - `flex items-center gap-1.5 flex-1 min-w-0 text-xs font-semibold truncate`
- top-right actions wrapper:
  - `flex items-center gap-0.5 shrink-0`
- metadata grid:
  - `grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 p-4 text-xs`
- path value shell:
  - `truncate flex items-center gap-1.5`
- raw path text:
  - `font-mono text-[11px]`
- oversize-file note:
  - `px-4 pb-4 text-xs text-muted-foreground italic`
- loading preview shell:
  - `flex-1 flex items-center justify-center gap-2 text-xs text-muted-foreground min-h-24`
- failed preview text:
  - `px-4 pb-4 text-xs text-destructive`
- retry button:
  - `variant: "secondary"`
  - `size: "xs"`
- unavailable-preview shell:
  - `p-4 flex items-center gap-2 text-xs text-muted-foreground`

Files panel local and remote accordion state:

- file explorer state atom key:
  - `marimo:file-explorer-panel:state`
- default atom value:
  - `{ openSections: ["files"], hasUserInteracted: false }`
- when `storage_inspector` is enabled and namespaces exist before user interaction:
  - auto-adds `remote-storage` to `openSections`
- header height constant:
  - `33`
- split rule when both accordion sections are open:
  - `remote-storage maxHeight = Math.round((height - 66) * 0.4)`
  - `files height = Math.max(200, availableHeight - remoteHeight)`

Local upload and drop contract:

- dropzone options:
  - `multiple: true`
  - `maxSize: 104857600`
- upload progress titles:
  - single `Uploading file...`
  - plural `Uploading files...`
- success titles:
  - single `File uploaded`
  - plural `${count} files uploaded`
- failure title:
  - `File upload failed`
- rejection description row:
  - `${file.name} (${errors.join(", ")})`

#### 5.2.2 Variables and Data Sources Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/session-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/components.tsx`
- `.__marimo_upstream/frontend/src/components/datasources/datasources.tsx`
- `.__marimo_upstream/frontend/src/components/variables/variables-table.tsx`

Top-level sections:

- accordion type:
  - `multiple`
- sections:
  - `datasources`
  - `variables`

Data sources section header:

- label:
  - `Data sources`
- icon:
  - `DatabaseIcon`
  - class `w-4 h-4`
- count badge:
  - `PanelBadge`
  - shown when there are data sources and the section is closed

Variables section header:

- label:
  - `Variables`
- icon:
  - `VariableIcon`
  - class `w-4 h-4`

Data sources body:

- source component:
  - `DataSources`
- empty state when both Python tables and external connections are absent:
  - title `No tables found`
  - description `Any datasets/dataframes in the global scope will be shown here.`
  - action `Add database or catalog`
- search input placeholder:
  - `Search tables...`
- search shell wrapper:
  - `flex items-center w-full border-b`
- body wrapper:
  - `border-b bg-background rounded-none h-full pb-10 overflow-auto outline-hidden`

Connection group contract:

- connection row class:
  - `pl-3 pr-2`
- in-memory connection display name:
  - `In-Memory`
- refresh tooltip for external connections:
  - `Refresh connection`
- empty strings:
  - `No databases available`
  - `No schemas available`
  - `No tables found`
  - `Loading tables...`
  - `Loading columns...`
  - `No columns found`

Table tree contract:

- table row base class:
  - `rounded-none group h-8 cursor-pointer`
- hover action tooltip:
  - `Add table to notebook`
- summary text format:
  - `${numRows} rows, ${numColumns} columns`

Column row contract:

- column copy tooltip:
  - `Copy column name`
- primary-key badge tooltip:
  - `Primary key`
- indexed badge tooltip:
  - `Indexed`
- preview wrapper adds:
  - `pr-2 py-2 bg-(--slate-1) shadow-inner border-b`

Variables body:

- when empty:
  - `No variables defined`
- otherwise renders:
  - `VariableTable`
- variable table search placeholder:
  - `Search`

Variable table columns:

- `Name`
- `Type`
- `Value`
- `Declared By`
- `Used By`

Declared and used-by cell affordances:

- declared-by icon:
  - `SquareEqualIcon`
- used-by icon:
  - `WorkflowIcon`
- multiple declared-by cells use destructive text links

#### 5.2.3 Dependencies Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/dependency-graph-panel.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/dependency-graph.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/custom-node.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/minimap-content.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/panels.tsx`
- `.__marimo_upstream/frontend/src/components/dependency-graph/elements.ts`
- `.__marimo_upstream/frontend/src/components/dependency-graph/utils/layout.ts`
- `.__marimo_upstream/frontend/src/components/dependency-graph/utils/useFitToViewOnDimensionChange.ts`

Top-level root:

- class:
  - `w-full h-full flex-1 mx-auto -mb-4 flex flex-col`

Header tab row inside the helper sidebar:

- uses helper header segmented control documented in `5.2`
- values:
  - `minimap`
  - `graph`

Developer-panel-local tab row:

- only renders when `usePanelSection() === "developer-panel"`
- wrapper class:
  - `p-2 shrink-0`
- tabs:
  - `Minimap`
  - `Graph`
- tab item class:
  - `py-0.5 text-xs uppercase tracking-wide font-bold`

Content branch wrapper:

- class:
  - `flex-1 min-h-0 relative`
- branch:
  - `minimap -> MinimapContent`
  - `graph -> DependencyGraph`

Minimap branch:

- outer class:
  - `overflow-y-auto overflow-x-hidden flex-1 scrollbar-none h-full max-w-80`
- inner list class:
  - `py-3 pl-3 pr-4 relative min-h-full`
- hidden filler:
  - `h-0 overflow-hidden`
- column separator line:
  - `absolute left-5 w-[36px] h-px bg-(--gray-4) pointer-events-none`

Minimap row button contract:

- element:
  - `button`
- attributes:
  - `data-node-id={cellId}`
- base class:
  - `group bg-transparent text-left w-full flex relative justify-between items-center`
  - `border-none rounded cursor-pointer`
  - `h-[21px] pl-[51px] font-inherit`
- unfocused color branch:
  - `text-(--gray-8) hover:text-(--gray-9)`
- focused or selected graph branch:
  - `text-primary-foreground`

Minimap row inner shell:

- wrapper class:
  - `group-hover:bg-(--gray-2) flex h-full w-full px-0.5 items-center rounded`
- focused adds:
  - `bg-primary group-hover:bg-primary`
- code text shell:
  - `truncate px-1 font-mono text-sm flex gap-1`
- empty code fallback:
  - `italic`
  - text `empty`

Minimap relation SVG overlay:

- class base:
  - `absolute overflow-visible top-[10.5px] left-[calc(var(--spacing-extra-small,8px)+17px)] pointer-events-none`
- selected row adds:
  - `z-[1]`
- unselected row adds:
  - `z-0`
- focused-row path pitch:
  - vertical delta uses `21px` per row
- focused-row cycle path:
  - `M -3 0 H -7 v ${delta} h 14 v ${-delta} H 3`
- focused-row parent-only path:
  - `M -3 0 H -7 v ${delta} h -4`
- focused-row child-only path:
  - `M 3 0 H 7 v ${delta} h 4`
- focused-row connection lines:
  - `fill: "none"`
  - `strokeWidth: "2"`
  - `stroke: "currentColor"`

Graph branch:

- source component:
  - `DependencyGraph`
- graph element creation:
  - source builder:
    - `TreeElementsBuilder.createElements`
  - skips variable entry when:
    - `variable.name === "mo"`
    - `variable.value === "marimo"`
  - edge creation:
    - creates one edge per `declaredBy x usedBy` pair
    - deduplicates edges by `${declaredCellId}-${usedCellId}`
  - node visibility filters only hide unconnected nodes:
    - `hidePureMarkdown` hides nodes whose trimmed code starts with `mo.md`
    - `hideReusableFunctions` hides nodes whose runtime serialization lowercases to `valid`
- graph node creation:
  - createNode returns:
    - `id = cellId`
    - `data = { atom, forceWidth: 300 }`
    - `width: 300`
    - `type: "custom"`
    - `position: { x: 0, y: 0 }`
- layout state atoms:
  - direction atom:
    - `graphViewAtom = atom<LayoutDirection>("TB")`
  - settings atom:
    - `graphViewSettings = atom<GraphSettings>({ hidePureMarkdown: true, hideReusableFunctions: false })`
- graph layout engine:
  - source helper:
    - `layoutElements`
  - engine:
    - `dagre graphlib`
  - graph config:
    - `rankdir = layoutDirection`
    - `nodesep: 150`
    - `ranksep: 200`
    - `ranker: "longest-path"`
  - each edge is inserted as:
    - `setEdge(edge.source, edge.target)`
  - each node width or height fallback:
    - `width ?? 0`
    - `height ?? 0`
- auto-fit effect:
  - source helper:
    - `useFitToViewOnDimensionChange`
  - watches canvas width and height selectors
  - calls `fitView({ duration: 100 })`
  - fit is debounced by `100ms`
- node type registry:
  - `nodeTypes = { custom: CustomNode }`
- graph canvas uses React Flow wrapper `ReactFlow`
- graph wrapper passes:
  - `minZoom: .2`
  - `fitView: true`
  - `zoomOnDoubleClick: false`
  - `nodesConnectable: false`
- fitView options:
  - `minZoom: .5`
  - `maxZoom: 1.5`
- background:
  - `Background`
  - `variant: BackgroundVariant.Dots`
  - `color: "#ccc"`
- jump-to-focused-cell overlay:
  - `Controls position="bottom-right" showInteractive={false}`
  - tooltip text:
    - `Jump to focused cell`
  - tooltip side:
    - `left`
- tooltip delay:
  - `200`

Custom graph node shell:

- source component:
  - `CustomNode`
- orientation context:
  - React context `EdgeMarkerContext`
  - default value `LR`
- handle color token:
  - selected node uses `var(--gray-9)`
  - unselected node uses `var(--gray-3)`
- input handles:
  - target handle testid `input-one`
  - source handle testid `input-two`
  - `LR` layout positions both on `Left`
  - `TB` layout positions both on `Top`
- output handles:
  - source handle testid `output-one`
  - target handle testid `output-two`
  - `LR` layout positions both on `Right`
  - `TB` layout positions both on `Bottom`
- node card shell class:
  - `flex flex-col bg-card border border-input/50 rounded-md mx-[2px] overflow-hidden`
- selected node adds:
  - `border-primary`
- width rule:
  - `forceWidth || clamp(containerWidth - 100, 100, 400)`
- title bar class:
  - `text-muted-foreground font-semibold text-xs py-1 px-2 bg-muted border-b`
- title text source:
  - `displayCellName(cell.name, cellIndex)`
- body renderer:
  - `TinyCode`
  - receives `code = cell.code`
- node memo equality:
  - compares only `data`, `selected`, and `id`

Graph toolbar:

- root uses React Flow panel:
  - `position: "top-right"`
  - `className: "flex flex-col items-end gap-2"`
- orientation buttons:
  - `Vertical Tree`
  - `Horizontal Tree`
- orientation buttons use:
  - `variant: "outline"`
  - `size: "xs"`
  - `className: "bg-background"`
  - `aria-selected` mirrors active layout
- vertical icon:
  - `NetworkIcon`
  - `className: "w-4 h-4 mr-1"`
- horizontal icon:
  - `NetworkIcon`
  - `className: "w-4 h-4 mr-1 transform -rotate-90"`

Graph settings popover:

- trigger:
  - text button
  - `variant: "text"`
  - `size: "xs"`
  - settings icon `SettingsIcon`
- popover body class:
  - `w-auto p-2 text-muted-foreground`
- title:
  - `Settings`
- checkbox rows:
  - `flex items-center gap-2`
- toggles:
  - `data-testid="hide-pure-markdown-checkbox"`
  - `data-testid="hide-reusable-functions-checkbox"`
- labels:
  - `Hide pure markdown`
  - `Hide reusable functions`

Graph selection panel:

- mounted as React Flow panel:
  - `position: "bottom-left"`
  - `className: "max-h-[90%] flex flex-col w-[calc(100%-5rem)]"`
- card shell:
  - `min-h-[100px] shadow-md rounded-md border max-w-[550px] border-primary/40 my-4 min-w-[240px] bg-(--slate-1) text-muted-foreground/80 flex flex-col overflow-y-auto`

Graph selection: node branch:

- header class:
  - `font-bold py-2 flex items-center gap-2 border-b px-3`
- header icons:
  - `SquareFunction`
  - cell menu trigger `ConnectionCellActionsDropdown` with `MoreVerticalIcon`
  - close button `variant: "text"`, `size: "icon"`
- section root:
  - `text-sm flex flex-col py-3 pl-2 pr-4 flex-1 justify-center`
- subsection shell:
  - `flex flex-col gap-2`
- subsection labels:
  - `Outputs`
  - `Inputs`
- divider:
  - `hr.border-divider.my-3`
- empty placeholder:
  - `--`
- variable grid:
  - `grid grid-cols-5 gap-3 items-center text-sm py-1 flex-1 empty:hidden`
- variable value cell:
  - `truncate col-span-2`
- type suffix:
  - `ml-1 truncate text-foreground/60 font-mono`
- related-cell column:
  - `truncate col-span-2 gap-1 items-center`

Graph selection: edge branch:

- header class:
  - `font-bold py-2 flex items-center gap-2 border-b px-3`
- header icons:
  - `WorkflowIcon`, `ArrowRightIcon`
- body grid:
  - `grid grid-cols-4 gap-3 max-w-[350px] items-center text-sm p-3 flex-1`
- type cell:
  - `truncate text-foreground/60 font-mono`
- value cell:
  - `truncate col-span-2`

Minimap relation glyph contract:

- independent cell circle radius:
  - `1.5`
- connected cell circle radius:
  - `3`
- selected relation shift:
  - `left -> translate(-14, 0)`
  - `right -> translate(14, 0)`
  - both or neither -> `translate(0, 0)`
- whisker paths:
  - left `M 0 0 h -8`
  - right `M 0 0 h 8`
- focused relation graph lines:
  - `strokeWidth: "2"`
  - `stroke: "currentColor"`
- color contract:
  - `hasError -> text-destructive`
  - `no selection and not isolated -> text-foreground`
  - `selected cell or adjacent relation -> text-primary`
  - fallback -> `text-(--gray-8)`

Graph interaction contract:

- single click on graph node:
  - selects node in local state
- edge click on graph canvas:
  - selects edge in local state as `{ type: "edge", source, target }`
- single click on focused minimap row:
  - blurs current focused cell
- single click on unfocused minimap row:
  - `focusCell({ cellId, where: "exact" })`
- double click on graph node:
  - `scrollAndHighlightCell(node.id as CellId, "focus")`
- jump-to-focused-cell action:
  - `fitView({ padding: 1, duration: 600, nodes: [focusedNode] })`
- auto-fit debounce:
  - `100ms`

#### 5.2.4 Documentation Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/documentation-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`
- `.__marimo_upstream/frontend/src/documentation.css`

Empty state:

- title:
  - `View docs as you type`
- description:
  - `Move your text cursor over a symbol to see its documentation.`
- icon:
  - `TextSearchIcon`

Non-empty body:

- root class:
  - `p-3 overflow-y-auto overflow-x-hidden h-full docs-documentation flex flex-col gap-4`
- content source:
  - `renderHTML`

#### 5.2.5 Outline Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/outline-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/outline/floating-outline.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/outline/useActiveOutline.ts`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/outline-panel.css`

Empty state:

- title:
  - `No outline found`
- description:
  - `Add markdown headings to your notebook to create an outline.`
- icon:
  - `ScrollTextIcon`

Non-empty body:

- source renderer:
  - `OutlineList`
- state source:
  - `activeHeaderId`
  - `activeOccurrences`

#### 5.2.6 Packages Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/packages-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/packages-utils.ts`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`

Loading and error branches:

- loading spinner:
  - `size: "medium"`
  - `centered: true`
- error renderer:
  - `ErrorBanner`

Top-level wrapper:

- class:
  - `flex-1 flex flex-col overflow-hidden`

Install/search prompt row:

- wrapper class:
  - `flex items-center w-full border-b`
- input placeholder:
  - `Install packages with ${packageManager}...`
- leading branch:
  - loading spinner `small`
  - otherwise tooltip `Change package manager`
- add button:
  - text `Add`
- tooltip help body documents accepted package formats:
  - package name
  - package and version
  - git
  - URL
  - path

Mode switch header:

- only renders when dependency tree exists
- wrapper class:
  - `flex items-center justify-between px-2 py-1 border-b`
- left switch labels:
  - `List`
  - `Tree`
- right environment pill class:
  - `items-center border px-2 py-0.5 text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground rounded-sm text-ellipsis block overflow-hidden max-w-fit font-medium`
- pill text:
  - `<root> -> sandbox`
  - otherwise `project`

List branch:

- empty state:
  - title `No packages`
  - description `No packages are installed in this environment.`
  - icon `BoxIcon`
- table columns:
  - `Name`
  - `Version`
  - empty actions column
- table wrapper:
  - `overflow-auto flex-1`
- row class:
  - `group`
- row click copies:
  - `${name}==${version}`
- row actions:
  - `Upgrade`
  - `Remove`

Tree branch:

- loading fallback:
  - `size: "medium"`
  - `centered: true`
- empty tree state:
  - title `No dependencies`
  - description `No package dependencies found in this environment.`
  - icon `BoxIcon`
- tree wrapper:
  - `flex-1 overflow-auto`
- top-level node row class:
  - `flex items-center group cursor-pointer text-sm whitespace-nowrap`
  - `hover:bg-(--slate-2) focus:bg-(--slate-2) focus:outline-hidden`
- top-level row adds:
  - `px-2 py-0.5`
- nested row indent:
  - inline `paddingLeft`
- tags:
  - `cycle`
  - `extra`
  - `group`

#### 5.2.7 Snippets Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/snippets-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/components/contribute-snippet-button.tsx`

Loading and error branches:

- loading spinner:
  - `size: "medium"`
  - `centered: true`
- error renderer:
  - `ErrorBanner`

Contribute modal trigger:

- source component:
  - `ContributeSnippetButton`
- trigger button class:
  - `float-right px-2 m-0 h-full hover:bg-accent hover:text-accent-foreground`

Contribute modal:

- title:
  - `Contribute a Snippet`
- body text:
  - `Have a useful snippet you want to share with the community? Make a pull request on GitHub.`
- close button:
  - `data-testid="snippet-close-button"`
  - text `Close`

Split layout:

- left resizable panel:
  - `defaultSize: 40`
  - `minSize: 20`
  - `maxSize: 70`
- divider class:
  - `bg-border hover:bg-primary/50 transition-colors`
- right panel:
  - `defaultSize: 60`
  - `minSize: 20`

Search shell:

- wrapper class:
  - `flex items-center w-full border-b`
- search placeholder:
  - `Search snippets...`
- search input class:
  - `h-6 m-1`
- search input rootClassName:
  - `flex-1 border-r`
- empty search item:
  - `No results`

Snippet list:

- list wrapper class:
  - `flex flex-col overflow-auto`
- item class:
  - `rounded-none`
- item label shell:
  - `flex flex-row gap-2 items-center`
- text class:
  - `mt-1 text-accent-foreground`

Snippet viewer empty state:

- description:
  - `Click on a snippet to view its content.`

Snippet viewer shell:

- root class:
  - `h-full snippet-viewer flex flex-col overflow-hidden`
- header class:
  - `text-sm font-semibold bg-muted border-y px-2 py-1 flex justify-between items-center`
- close button:
  - `size: "sm"`
  - `variant: "ghost"`
  - `className: "h-6 w-6 p-0 hover:bg-muted-foreground/10"`
- content wrapper:
  - `px-2 py-2 space-y-4 overflow-auto flex-1`

Snippet insertion controls:

- main insert button text:
  - `Insert snippet`
- inline hover tooltip:
  - `Insert snippet`
- inline code-card insert button class:
  - `absolute -top-2 -right-1 z-10 hover-action px-2 bg-background`

#### 5.2.8 AI Chat Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/chat/chat-panel.tsx`
- `.__marimo_upstream/frontend/src/components/chat/chat-history-popover.tsx`
- `.__marimo_upstream/frontend/src/components/chat/chat-display.tsx`
- `.__marimo_upstream/frontend/src/components/chat/chat-components.tsx`

Unconfigured AI empty state:

- title:
  - `Chat with AI`
- description:
  - `No AI provider configured or Chat model not selected`
- action:
  - `Edit AI settings`
- icon:
  - `BotMessageSquareIcon`

Configured root shell:

- root class:
  - `flex flex-col h-[calc(100%-53px)]`

Header shell:

- class:
  - `flex border-b px-2 py-1 justify-between shrink-0 items-center`

Header controls:

- left tooltip/button:
  - `New chat`
- right controls:
  - `MCPStatusIndicator`
  - settings tooltip `AI Settings`
  - history popover tooltip `Previous chats`

History popover:

- popover class:
  - `w-[480px] p-0`
- search input wrapper:
  - `pt-3 px-3 w-full`
- search placeholder:
  - `Search chat history...`
- scroll area:
  - `h-[450px] p-2`
- empty states:
  - `No chats yet`
  - `Start a new chat to get started`
  - `No chats found`
  - `No chats match "${query}"`

Message area:

- wrapper class:
  - `flex-1 px-3 bg-(--slate-1) gap-4 py-3 flex flex-col overflow-y-auto`
- new-chat composer wrapper:
  - `rounded-md border bg-background`
- inline loading row:
  - `flex justify-center py-4`
- retry row:
  - `flex items-center justify-center space-x-2 mb-4`
- stop row while streaming:
  - `w-full flex justify-center items-center z-20 border-t`

Composer:

- empty-chat placeholder:
  - `Ask anything, @ to include context about tables or dataframes`
- standard input wrapper:
  - `relative shrink-0 min-h-[80px] flex flex-col border-t`
- footer wrapper:
  - `px-3 py-2 border-t border-border/20 flex flex-row flex-wrap items-center justify-between gap-1`

AI mode selector:

- label:
  - `AI Mode`
- options:
  - `Manual`
  - `Ask`
  - `Agent (beta)`
- trigger class:
  - `h-6 text-xs border-border shadow-none! ring-0! bg-muted hover:bg-muted/30 py-0 px-2 gap-1.5`

Chat footer controls:

- model trigger class:
  - `h-6 text-xs shadow-none! ring-0! bg-muted hover:bg-muted/30 rounded-sm`
- send placeholder during loading:
  - `Processing...`
- stop button text:
  - `Stop`

Chat message row contract:

- row base class:
  - `flex group relative`
- alignment split:
  - `user -> justify-end`
  - `assistant -> justify-start`

Mode option metadata:

- `Manual` subtitle:
  - `Pure chat, no tool usage`
- `Ask` subtitle:
  - `Use AI with access to read-only tools like documentation search`
- `Agent (beta)` subtitle:
  - `Use AI with access to read and write tools`

Input and attachment shells:

- non-empty thread editor wrapper:
  - `px-2 py-3 flex-1`
- new-thread input override class:
  - `px-1 py-0`
- attachment row class:
  - `flex flex-row gap-1 flex-wrap p-1`
- empty-thread attachment row adds:
  - `py-2 px-1`

#### 5.2.9 AI Agent Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/chat/acp/agent-panel.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/thread.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/blocks.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/session-tabs.tsx`
- `.__marimo_upstream/frontend/src/components/chat/acp/common.tsx`

Empty-state branch:

- root class:
  - `flex flex-col h-full`
- header class:
  - `flex border-b px-3 py-2 justify-between shrink-0 items-center`
- header is followed immediately by:
  - `SessionTabs`
- title:
  - `No Agent Sessions`
- description:
  - `Create a new session to start a conversation`
- disconnected helper title:
  - `Connect to an agent`
- disconnected helper description prefix:
  - `Start agents by running these commands in your terminal:`

Connected root:

- class:
  - `flex flex-col flex-1 overflow-hidden mo-agent-panel`
- exact top-level child order:
  - `AgentPanelHeader`
  - `SessionTabs`
  - `renderBody()`

Header contract:

- class:
  - `flex border-b px-3 py-2 justify-between shrink-0 items-center`
- right-side controls:
  - `Restart`
  - `Connect` or `Disconnect`

Connection/session transitional states:

- connecting text:
  - `Connecting to the agent...`
- creating-session text:
  - `Creating a new session...`
- waiting title:
  - `Waiting for agent`
- waiting description:
  - `Your AI agent will appear here when active`
- retry button text:
  - `Retry`

Notification/content area:

- content wrapper:
  - `flex-1 flex flex-col overflow-hidden flex-shrink-0 relative`
- scroll area:
  - `flex-1 bg-muted/20 w-full flex flex-col overflow-y-auto p-2`
- session id label:
  - `Session ID: ${id}`

Permission/loading footer:

- footer class:
  - `px-3 py-2 border-t bg-muted/30 flex-shrink-0`
- message strings:
  - `Waiting for permission to continue...`
  - `Agent is working...`
- stop button text:
  - `Stop`

Prompt area:

- input wrapper:
  - `px-3 py-2 min-h-[80px]`
- placeholder:
  - `Ask anything, @ to include context about tables or dataframes`
- footer wrapper:
  - `px-3 py-2 border-t border-border/20 flex flex-row items-center justify-between`

Agent mode selector:

- label:
  - `Agent Mode`
- trigger class:
  - `h-6 text-xs border-border shadow-none! ring-0! bg-muted hover:bg-muted/30 py-0 px-2 gap-1 capitalize`

Attachment and prompt shells:

- attachment row:
  - `flex flex-row gap-1 flex-wrap p-3 border-t`
- prompt area root:
  - `border-t bg-background flex-shrink-0`

Session notification block registry:

- `tool_call` and `tool_call_update`:
  - render `ToolNotificationsBlock`
- `agent_thought_chunk`:
  - render `AgentThoughtsBlock`
- `user_message_chunk`:
  - render `UserMessagesBlock`
- `agent_message_chunk`:
  - render `AgentMessagesBlock`
- `plan`:
  - render `PlansBlock`
- `available_commands_update`:
  - renders `null`
- `current_mode_update`:
  - renders `CurrentModeBlock` with `Mode: ${currentModeId}`
- unhandled grouped notification fallback:
  - `SimpleAccordion` titled by `sessionUpdate` with `JsonOutput`
- grouped notification wrapper:
  - `flex flex-col text-sm gap-2`
- grouped notification wrapper sets:
  - `data-block-type="${sessionUpdate}"`

Agent connection idle block:

- root class:
  - `flex-1 flex items-center justify-center h-full min-h-[200px] flex-col`
- icon badge shell:
  - `w-12 h-12 mx-auto rounded-full bg-[var(--blue-3)] flex items-center justify-center`
- title:
  - `Agent is connected`
- description:
  - `You can start chatting with your agent now`

Agent error block:

- wrapper class:
  - `border border-[var(--red-6)] bg-[var(--red-2)] rounded-lg p-4 my-2`
- wrapper attribute:
  - `data-block-type="error"`
- title:
  - `Agent Error`
- message class:
  - `text-sm text-[var(--red-11)] leading-relaxed mb-3`
- retry button:
  - `size: "xs"`
  - `variant: "outline"`
  - `className: "text-[var(--red-11)] border-[var(--red-6)] hover:bg-[var(--red-3)]"`
- dismiss button:
  - `size: "xs"`
  - `variant: "ghost"`
  - `className: "text-[var(--red-10)] hover:bg-[var(--red-3)]"`

Connection change block:

- wrapper class template:
  - `border ${borderColor} ${bgColor} rounded-lg p-3 my-2`
- wrapper attributes:
  - `data-block-type="connection-change"`
  - `data-status="${status}"`
- header row:
  - `flex items-center gap-2 mb-1`
- timestamp class:
  - `text-xs text-muted-foreground`
- message class template:
  - `text-sm ${textColor} opacity-90 mb-2`
- disconnected or error branch button text:
  - `Retry Connection`
- state tokens:
  - `connected -> bg-[var(--blue-2)] / border-[var(--blue-6)] / text-[var(--blue-11)] / icon text-[var(--blue-10)]`
  - `disconnected -> bg-[var(--amber-2)] / border-[var(--amber-6)] / text-[var(--amber-11)] / icon text-[var(--amber-10)]`
  - `connecting -> bg-[var(--gray-2)] / border-[var(--gray-6)] / text-[var(--gray-11)] / icon text-[var(--gray-10)]`
  - `error -> bg-[var(--red-2)] / border-[var(--red-6)] / text-[var(--red-11)] / icon text-[var(--red-10)]`

Thought and plan blocks:

- thought wrapper:
  - `text-xs text-muted-foreground`
- thought tooltip title:
  - `Thought for ${seconds}s`
- thought content wrapper:
  - `flex flex-col gap-2 text-muted-foreground`
- plan wrapper:
  - `rounded-lg border bg-background p-2 text-xs`
- plan header row:
  - `flex items-center justify-between mb-2`
- plan heading:
  - `To-dos ${count}`
- plan list class:
  - `flex flex-col gap-1`
- plan item class:
  - `flex items-center gap-2 px-2 py-1 rounded`
- checkbox class:
  - `accent-primary h-4 w-4 rounded border border-muted-foreground/30`
- completed plan text adds:
  - `line-through text-muted-foreground`

User and agent message content blocks:

- `user_message_chunk` wrapper:
  - `flex flex-col gap-2 text-muted-foreground border p-2 bg-background rounded break-words overflow-x-hidden`
- `agent_message_chunk` wrapper:
  - `flex flex-col gap-2`
- adjacent text parts are merged before render:
  - `mergeConsecutiveTextBlocks(props.data.map((item) => item.content))`
- content registry:
  - `text -> MarkdownRenderer`
  - `image -> inline <img>`
  - `audio -> inline <audio controls>`
  - `resource -> ResourceBlock`
  - `resource_link -> ResourceLinkBlock`

Resource and diff shells:

- text resource trigger:
  - `flex items-center gap-1 hover:bg-muted rounded-md px-1`
- text resource helper:
  - `Formatted for agents, not humans.`
- text resource popover content:
  - `max-h-96 overflow-y-auto scrollbar-thin whitespace-pre-wrap w-full max-w-[500px]`
- plain-text resource preview:
  - `text-xs whitespace-pre-wrap p-2 bg-muted rounded-md break-words`
- remote http resource link class:
  - `text-link hover:underline px-1`
- image resource-link trigger:
  - `flex items-center gap-1 hover:bg-muted rounded-md px-1 cursor-pointer`
- image resource-link preview:
  - `w-auto max-w-[500px] p-2`
- diff block shell:
  - `border rounded-md overflow-hidden bg-[var(--gray-2)] overflow-y-auto scrollbar-thin max-h-64`
- diff block path row:
  - `px-2 py-1 bg-[var(--gray-2)] border-b text-xs font-medium text-[var(--gray-11)]`

Tool call accordion:

- wrapper class:
  - `w-full`
- accordion item:
  - `type: "single"`
  - `collapsible: true`
  - `className: "w-full"`
- item value:
  - `tool-${index}`
- trigger class:
  - `py-1 text-xs border-border shadow-none! ring-0! bg-muted hover:bg-muted/30 px-2 gap-1 rounded-sm [&[data-state=open]>svg]:rotate-180`
- trigger error text modifier:
  - `text-destructive/80`
- trigger success text modifier:
  - `text-[var(--blue-8)]`
- icon states:
  - `loading -> h-3 w-3 animate-spin`
  - `error -> h-3 w-3 text-destructive`
  - `success -> h-3 w-3 text-[var(--blue-9)]`
- title node:
  - `<code class="font-mono text-xs truncate">`
- content wrapper:
  - `p-2`
- content scroll shell:
  - `space-y-3 max-h-64 overflow-y-auto scrollbar-thin`
- non-error body label:
  - `text-xs font-medium text-muted-foreground mb-1`
- error body box:
  - `bg-destructive/10 border border-destructive/20 rounded-md p-3 text-xs text-destructive`

#### 5.3 Developer Panel

Panel identity:

- `id="app-chrome-panel"`
- `data-testid="panel"`

Panel class:

- `dark:bg-(--slate-1) print:hidden hide-on-fullscreen`
- adds `border-t` when open

Resizable panel contract:

- `collapsedSize: 0`
- `collapsible: true`
- `minSize: 10`
- `defaultSize: 0`
- `maxSize: 75`

Resize handle contract:

- base class `border-border print:hidden z-20`
- collapsed token `resize-handle-collapsed`
- open token `resize-handle`
- orientation `horizontal`
- CSS from `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.css`:
  - `.resize-handle, .resize-handle-collapsed { transition: 250ms linear background-color; outline: none }`
  - `.resize-handle.horizontal, .resize-handle-collapsed.horizontal { height: 4px }`
  - `.resize-handle:hover, .resize-handle[data-resize-handle-active], .resize-handle-collapsed:hover, .resize-handle-collapsed[data-resize-handle-active] { background-color: var(--slate-11) }`

Header shell:

- `flex items-center justify-between border-b px-2 h-8 bg-background shrink-0`

Developer tab registry contract:

- list is reorderable through `ReorderableList`
- `ariaLabel: "Developer panel tabs"`
- `className: "flex flex-row gap-1"`
- drag type is `panels`
- list id is `developer-panel`
- cross-list drag receiver can move items back to the sidebar

Developer tab token:

- shared:
  - `text-sm flex gap-2 px-2 pt-1 pb-0.5 items-center leading-none rounded-sm cursor-pointer`
- selected adds:
  - `bg-muted`
- unselected adds:
  - `hover:bg-muted/50`

Developer header widgets:

- separator:
  - `border-l border-border h-4 mx-1`
- backend health button:
  - tooltip testid `data-testid="footer-backend-status"`
  - button testid `data-testid="backend-status"`
  - button class:
    - `p-1 hover:bg-accent rounded flex items-center gap-1.5 text-xs text-muted-foreground`
  - label text:
    - `Kernel`
  - tooltip strings:
    - `Not connected to a runtime`
    - `Health: Unknown`
    - `Click to refresh health status`
- LSP health button:
  - tooltip testid `data-testid="footer-lsp-status"`
  - button testid `data-testid="lsp-status"`
  - button class:
    - `p-1 hover:bg-accent rounded flex items-center gap-1.5 text-xs text-muted-foreground`
  - label text:
    - `LSP`
  - restart toast titles:
    - `LSP Servers Restarted`
    - `LSP Restart Failed`
  - degraded or failed tooltip adds:
    - `Click to restart failed servers`
- close button:
  - `variant: "text"`
  - `size: "xs"`

Developer panel registry:

- `errors`
- `scratchpad`
- `tracing`
- `secrets`
- `logs`
- `terminal`
- `cache`
- plus any tabs moved over from the sidebar registry

Panel body wrapper:

- `flex flex-col h-full`
- content area:
  - `flex-1 overflow-hidden`

#### 5.3.1 Errors Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/error-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`

Empty state:

- title:
  - `No errors!`
- icon:
  - `PartyPopperIcon`

Non-empty body:

- root class:
  - `flex flex-col h-full overflow-auto`

Per-cell error block:

- header class:
  - `text-xs font-mono font-semibold bg-muted border-y px-2 py-1`
- header child:
  - `cell-link`
- body class:
  - `px-2`
- body renderer:
  - `MarimoErrorOutput`

#### 5.3.2 Scratchpad Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/scratchpad-panel.tsx`
- `.__marimo_upstream/frontend/src/components/scratchpad/scratchpad.tsx`

Root shell:

- class:
  - `flex flex-col h-full overflow-hidden`

Toolbar:

- class:
  - `flex items-center shrink-0 border-b`
- run button:
  - `data-testid="scratchpad-run-button"`
- tooltip strings:
  - `cell.run`
  - `Clear code and outputs`
  - `Insert code`
  - `Toggle history`
  - `Use this scratchpad to experiment with code without restrictions on variable names. Variables defined here aren't saved to notebook memory, and the code is not saved in the notebook file.`

Toolbar button primitives:

- all use:
  - `variant: "text"`
  - `size: "xs"`

History overlay:

- class:
  - `absolute inset-0 z-100 bg-background p-3 border-none overflow-auto`
- inner wrapper:
  - `overflow-auto flex flex-col gap-3`
- history card class:
  - `border rounded-md hover:shadow-sm cursor-pointer hover:border-input overflow-hidden`

Main split layout:

- outer resizable direction follows panel-context orientation
- editor shell:
  - `h-full flex flex-col overflow-hidden relative`
- editor wrapper:
  - `flex-1 overflow-auto`
- output split shell:
  - `h-full flex flex-col divide-y overflow-hidden`
- output wrapper:
  - `flex-1 overflow-auto`
- console wrapper:
  - `overflow-auto shrink-0 max-h-[50%]`
- divider class:
  - `bg-border hover:bg-primary/50 transition-colors`

#### 5.3.3 Tracing Panel Body

Source:

- `tracing-panel-adLR9Xcg.js`, lazy-mount shell
- `tracing-D_eBhjGe.js`, exported `Tracing`

Fallback while lazy chunk loads:

- wrapper class:
  - `flex flex-col items-center justify-center h-full`
- child:
  - spinner

Empty state:

- title:
  - `No traces`
- description:
  - `Cells that have ran will appear here.`
- icon:
  - `ActivityIcon`

Top controls:

- wrapper class:
  - `flex flex-row justify-start gap-3`
- inline-chart label:
  - `Inline chart`
- checkbox:
  - `data-testid="chartPosition"`
  - class `h-3 cursor-pointer`
- clear button:
  - `dataTestId: "clear-traces-button"`

Body wrapper:

- class:
  - `py-1 px-2 overflow-y-scroll h-full`
- run list class:
  - `flex flex-col gap-3`

Run item contract:

- collapsed title:
  - `Run - ${formattedStartTime}`
- collapsed shell:
  - `pre.font-mono.font-semibold`
- expanded `above` branch:
  - wrapper class `flex flex-col`
  - inner title shell `pre.font-mono.font-semibold`
- expanded `sideBySide` branch:
  - wrapper class `flex flex-row`

Trace chart contract:

- renderer:
  - Vega canvas
- `mark.cornerRadius`:
  - `2`
- color scale:
  - `success -> #37BE5F`
  - `error -> red`

Hovered cell detail list:

- wrapper class:
  - `text-xs mt-0.5 ml-3 flex flex-col gap-0.5`
- row class:
  - `flex flex-row gap-2 py-1 px-1 opacity-70 hover:bg-(--gray-3) hover:opacity-100`
- tooltip strings:
  - `This cell took ${elapsedTime} to run`
  - `This cell has not been run`

#### 5.3.4 Secrets Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/secrets-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/write-secret-modal.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`

Loading and error branches:

- loading spinner:
  - `size: "medium"`
  - `centered: true`
- error renderer:
  - `ErrorBanner`

Empty state:

- title:
  - `No environment variables`
- description:
  - `No environment variables are available in this notebook.`
- icon:
  - `KeyIcon`

Top add-secret bar:

- wrapper class:
  - `flex justify-start h-8 border-b`
- button class:
  - `border-r px-2 m-0 h-full hover:bg-accent hover:text-accent-foreground`

Main split layout:

- direction:
  - `horizontal`
- left resizable panel:
  - `defaultSize: 50`
  - `minSize: 30`
  - `maxSize: 80`
- divider class:
  - `w-1 bg-border hover:bg-primary/50 transition-colors`
- right panel:
  - empty `div`

Environment variable table:

- wrapper class:
  - `overflow-auto flex-1 mb-16`
- columns:
  - `Environment Variable`
  - `Source`
  - empty copy-action column
- provider rows exclude:
  - `env`
- non-env provider badge:
  - `variant: "outline"`

Copy affordance:

- hidden until row hover:
  - `invisible group-hover:visible`
- copy text:
  - `os.environ["${key}"]`
- success toast:
  - title `Copied to clipboard`
  - description `${snippet} has been copied to your clipboard.`

Add Secret modal:

- source:
  - `WriteSecretModal`
- title:
  - `Add Secret`
- description:
  - `Add a new secret to your environment variables.`
- form body class:
  - `grid gap-4 py-4`
- field row class:
  - `grid gap-2`
- key label:
  - `Key`
- key placeholder:
  - `MY_SECRET_KEY`
- key normalization:
  - `replaceAll(/\W/g, "_")`
- value label:
  - `Value`
- value input:
  - `type: "password"`
  - `autoComplete: "off"`
- insecure transport warning:
  - `Note: You are sending this key over http.`
- location label:
  - `Location`
- location trigger placeholder:
  - `Select a provider`
- empty-location helper:
  - `No dotenv locations configured.`
- config helper:
  - `You can configure the location by setting the dotenv configuration.`
- footer buttons:
  - `Cancel`
  - `Add Secret`
- submit disabled gate:
  - `!key || !value || !location`
- validation toasts:
  - `No location selected for the secret.`
  - `Please fill in all fields.`
- success toast:
  - title `Secret created`
  - description `The secret has been created successfully.`
- failure toast:
  - `Failed to create secret. Please try again.`

#### 5.3.5 Logs Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/logs-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`

Empty state:

- title:
  - `No logs`
- description includes pills:
  - `stdout`
  - `stderr`
- icon:
  - `FileTextIcon`

Non-empty root:

- class:
  - `flex flex-col h-full overflow-auto`

Top action row:

- class:
  - `flex flex-row justify-start px-2 py-1`
- clear button testid:
  - `clear-logs-button`

Log viewer:

- wrapper class:
  - `flex flex-col`
- `<pre>` class:
  - `grid text-xs font-mono gap-1 whitespace-break-spaces font-semibold align-left`
- inner grid class:
  - `grid grid-cols-[30px_1fr]`

Log row state colors:

- `stdout -> text-(--grass-9)`
- `stderr -> text-(--red-9)`

#### 5.3.6 Terminal Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/terminal/terminal.tsx`

Terminal root:

- class:
  - `relative w-full h-[calc(100%-4px)] bg-popover`

Xterm configuration:

- `fontFamily`:
  - `Menlo, DejaVu Sans Mono, Consolas, Lucida Console, monospace`
- `fontSize`:
  - `14`
- `scrollback`:
  - `10000`
- `cursorBlink`:
  - `true`
- `cursorStyle`:
  - `block`

Context menu:

- wrapper class:
  - `xterm-context-menu fixed z-50 rounded-md shadow-lg py-1 min-w-[160px] border bg-popover`
- menu item class:
  - `w-full text-left px-3 py-2 text-sm flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted`
- items and shortcuts:
  - `Copy` / `mod-c`
  - `Paste` / `mod-v`
  - `Select all` / `mod-a`
  - `Clear terminal` / `mod-l`

#### 5.3.7 Cache Panel Body

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/cache-panel.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/empty-state.tsx`

Loading state:

- spinner:
  - `size: "medium"`
  - `centered: true`

Empty states:

- title:
  - `No cache data`
- description:
  - `Cache information is not available.`
- second title:
  - `No cache activity`
- second description:
  - `The cache has not been used yet. Cached functions will appear here once they are executed.`

Non-empty root:

- root class:
  - `flex flex-col h-full overflow-auto`
- inner class:
  - `flex flex-col gap-4 p-4 h-full`

Top refresh area:

- icon button:
  - `variant: "ghost"`
  - `size: "icon"`
  - `className: "h-6 w-6"`
- outline refresh button text:
  - `Refresh`

Section titles:

- `Statistics`
- `Storage`

Stat card class:

- `flex flex-col gap-1 p-3 rounded-lg border bg-card`

Purge flow:

- button text:
  - `Purge Cache`
- confirm title:
  - `Purge cache?`
- confirm description:
  - `This will permanently delete all cached data. This action cannot be undone.`
- confirm text:
  - `Purge`
- success toast title:
  - `Cache purged`
- success toast description:
  - `All cached data has been cleared`

#### 5.4 Chrome Layout Persistence

Chrome body layout uses resizable panel groups with persisted IDs:

- `autoSaveId="marimo:chrome:v1:l1"`
- `autoSaveId="marimo:chrome:v1:l2"`

Required wrapper IDs:

- `#app`
- `#app-chrome-body`
- `#app-chrome-sidebar`
- `#app-chrome-panel`

### 6. Notebook Body Contract

#### 6.1 Filename Bar

Source:

- `.__marimo_upstream/frontend/src/components/editor/header/filename-form.tsx`
- `.__marimo_upstream/frontend/src/components/editor/header/filename-input.tsx`
- `.__marimo_upstream/frontend/src/components/editor/header/filename-input.css`

Wrapper class:

- `pt-4 sm:pt-12 pb-2 mb-4 print:hidden z-50 sticky left-0`

Inner container:

- `flex items-center justify-center container`

Filename root shell:

- root `id="filename-input"`
- root class:
  - `flex h-full w-full flex-col overflow-hidden rounded-md text-popover-foreground bg-transparent group filename-input`
- root carries:
  - `cmdk-root`
- root tabindex:
  - `-1`

List wrapper:

- `max-h-[300px] overflow-y-auto overflow-x-hidden`
- carries:
  - `cmdk-list`
  - `role="listbox"`

Input row:

- `flex items-center border-b border-none justify-center px-1`
- carries:
  - `cmdk-input-wrapper`

- input class:
  - `placeholder:text-foreground-muted flex rounded-md bg-transparent text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 filename w-full px-4 py-1 my-1 h-9 font-mono text-foreground/60`
- autocomplete popover class:
  - `p-0 w-full min-w-80 max-w-80vw hidden`
- required input testid:
  - `data-testid="dir-completion-input"`
- example captured placeholder:
  - `layout.py`

Filename value class branch:

- named file:
  - `filename`
- unnamed file:
  - `missing-filename`

Filename styling contract from `filename-input.css`:

- `.filename`
  - `box-shadow: none`
  - `text-align: center`
- `.filename:focus, .filename:hover`
  - `border-width: 1px`
  - `--tw-shadow: 5px 6px 0px 0px var(--tw-shadow-color, var(--base-shadow-darker)), 0 0px 4px 0px var(--tw-shadow-color, #bfbfbf80)`
- `.missing-filename`
  - `text-align: center`
  - `--tw-shadow: 4px 4px 0px 0px var(--tw-shadow-color, var(--base-shadow-darker)), 0 0px 2px 0px var(--tw-shadow-color, #99999980)`
  - `--tw-shadow-color: var(--stale)`
- `.missing-filename:focus, .missing-filename:hover`
  - `--tw-shadow: 5px 6px 0px 0px var(--tw-shadow-color, var(--base-shadow-darker)), 0 0px 4px 0px var(--tw-shadow-color, #bfbfbf80)`
  - `--tw-shadow-color: var(--stale)`

#### 6.2 Width Wrapper and Notebook Layout

Width wrapper source:

- `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/vertical-layout-wrapper.tsx`
- `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/vertical-layout.tsx`

Outer wrapper:

- `px-1 sm:px-16 md:px-20 xl:px-24 print:px-0 print:pb-0`
- `pb-24 sm:pb-12`

Width modes:

- compact:
  - `max-w-(--content-width) min-w-[400px]`
- medium:
  - `max-w-(--content-width-medium) min-w-[400px]`
- columns:
  - `w-fit`
- full:
  - `max-w-full`
- invisible:
  - `invisible`

Vertical notebook layout:

- root:
  - `flex flex-col`
- adds:
  - `gap-5` when `showCode && includeCode`

Column layout branch:

- wrapper:
  - `flex flex-row gap-8 w-full`
- column:
  - `flex-1 flex flex-col gap-2 w-(--content-width)`

#### 6.2.1 Column Container And Column Chrome

Source:

- `.__marimo_upstream/frontend/src/components/editor/renderers/cell-array.tsx`
- `.__marimo_upstream/frontend/src/components/editor/columns/sortable-column.tsx`

Columns-mode notebook container:

- rendered when `appConfig.width === "columns"`
- DnD wrapper hook:
  - `data-testid="column-container"`
- grid shell:
  - `grid grid-flow-col auto-cols-min gap-6`
- notebook width wrapper for columns mode keeps:
  - `className: "pb-[40vh]"`
  - `invisible: false`
  - `innerClassName: "pr-4"`

Column content wrapper:

- non-sortable branch:
  - `div[data-testid="cell-column"].flex.flex-col.gap-5`
- sortable columns branch wraps the content with `SortableColumn`

Sortable column root:

- component `SortableColumn`
- forwarded ref root is `div`
- root keeps:
  - `tabIndex = -1`
  - `data-is-dragging`
- dragging class branch:
  - `z-20`
- idle class branch:
  - `z-1 hover:z-10 focus-within:z-10`
- over-target class branch:
  - `bg-accent/20`
- root inline style includes:
  - `position: "relative"`
  - `zIndex: 2` when dragging
  - `--gutter-width: "50px"`

Column header shell:

- `px-2 pb-0 group flex items-center overflow-hidden border-b border-[var(--slate-7)]`

Move column buttons:

- tooltip side:
  - `top`
- tooltip delay:
  - `300`
- button primitive:
  - `variant: "text"`
  - `size: "xs"`
  - `className: "hover:bg-(--gray-3) aspect-square p-0 w-7 h-7"`
- left tooltip:
  - `Move column left`
- right tooltip:
  - `Move column right`
- disabled gates:
  - left button disabled when `!canMoveLeft`
  - right button disabled when `!canMoveRight`

Column drag spacer:

- root testid:
  - `data-testid="column-drag-spacer"`
- class:
  - `flex gap-2 h-full grow cursor-grab active:cursor-grabbing items-center justify-center`
- icon:
  - `grip-vertical`
  - `className: "size-4 opacity-0 group-hover:opacity-50 transition-opacity duration-200"`

Delete column menu:

- trigger primitive:
  - `variant: "text"`
  - `size: "xs"`
  - `className: "hover:bg-(--gray-3) aspect-square p-0 w-7 h-7"`
- menu action label:
  - `Delete column`
- delete action disabled when `!canDelete`

Add column button:

- tooltip:
  - `Add column`
- primitive:
  - `variant: "text"`
  - `size: "xs"`
  - `className: "hover:bg-(--gray-3) aspect-square p-0 w-7 h-7"`
- click behavior:
  - `addColumn({ columnId })`
  - then `requestAnimationFrame(Cg)` scrolls `#App` horizontally by `1000`

Column body shell:

- outer border wrapper:
  - `border border-[var(--slate-7)]`

Resizable column shell:

- wrapper:
  - `flex flex-row`
- content pane:
  - `flex flex-col gap-5 box-content min-h-[100px] px-11 pt-3 pb-6 min-w-[500px] z-1`
- left and right resize handles:
  - `w-[3px] cursor-col-resize transition-colors duration-200 z-100`

Column width persistence:

- source uses:
  - `getColumnWidth(index)`
  - `saveColumnWidth(index, width)`

Setup cell insertion branch:

- when first column and setup marker is present in notebook order, source prepends:
  - `Cell({ cellId: SETUP_CELL_ID, showPlaceholder: false, canDelete: true, mode, userConfig, theme, isCollapsed: false, collapseCount: 0, canMoveX: false })`
- normal column cells render after that setup branch with:
  - `Cell({ cellId, showPlaceholder, canDelete, mode, userConfig, theme, isCollapsed, collapseCount, canMoveX: appConfig.width === "columns" })`

#### 6.3 Banner and Blocking Overlays

Notebook banner stack:

- wrapper:
  - `flex flex-col gap-4 mb-5 print:hidden`
- columns mode adds:
  - `w-full max-w-[80vw]`

Banner item shell:

- `flex flex-col rounded p-3`
- remove button testid:
  - `data-testid="remove-banner-button"`
- remove button primitive:
  - `variant: "text"`
  - `size: "icon"`
- remove icon:
  - `className: "w-5 h-5"`
- title shell:
  - `font-bold text-lg flex items-center mb-2`
- title icon:
  - `className: "w-5 h-5 inline-block mr-2"`
- body row:
  - `flex justify-between items-end`

Restart banner action:

- renders only when `banner.action === "restart"`
- button:
  - `data-testid="restart-session-button"`
  - `variant: "link"`
  - `size: "xs"`
- icon:
  - `className: "w-3 h-3 mr-2"`
- label:
  - `Restart`

Blocking stdin banner:

- title:
  - `Program waiting for input`
- body:
  - `The program is still running, but blocked on stdin.`
- action:
  - `Jump to the cell`
- outer toast position shell:
  - `flex flex-col gap-4 mb-5 fixed top-5 left-1/2 transform -translate-x-1/2 z-200 opacity-95`
- card shell:
  - `flex flex-col rounded py-2 px-4 animate-in slide-in-from-top w-fit`
- title row:
  - `flex justify-between`
- title text shell:
  - `font-bold text-lg flex items-center mb-1`
- body wrapper:
  - `flex flex-col gap-4 justify-between items-start text-muted-foreground text-base`
- `stdin` token is rendered with:
  - inline `kbd` component
- jump button primitive:
  - `variant: "link"`
  - `className: "h-auto font-normal"`
- jump behavior:
  - query `document.querySelector("[data-stdin-blocking]")`
  - `scrollIntoView({ behavior: "smooth", block: "center" })`
  - then `requestAnimationFrame(() => focus())`
- fallback error path:
  - logs `No element with data-stdin-blocking found`

#### 6.4 Column Footer Add-Cell Strip

Source branch:

- `.__marimo_upstream/frontend/src/components/editor/renderers/cell-array.tsx`
- `.__marimo_upstream/frontend/src/components/editor/ai/add-cell-with-ai.tsx`
- `.__marimo_upstream/frontend/src/core/cells/add-missing-import.ts`

Wrapper:

- `flex justify-center mt-4 pt-6 pb-32 group gap-4 w-full print:hidden`

Column-width reveal gate from `CellColumn.footer`:

- when `appConfig.width === "columns"`, footer `className` adds:
  - `opacity-0 group-hover/column:opacity-100`

Closed strip shell:

- `border border-border rounded transition-all duration-200 overflow-hidden divide-x divide-border flex`
- closed additions:
  - `w-fit shadow-sm-solid-shade`
- open AI additions:
  - `w-full max-w-4xl shadow-md-solid-shade shadow-(color:--blue-3)`

Button token:

- `mb-0 rounded-none sm:px-4 md:px-5 lg:px-8 tracking-wide no-wrap whitespace-nowrap font-semibold opacity-70 hover:opacity-90 uppercase text-xs`
- every closed-state button also uses:
  - `Button`
  - `variant: "text"`
  - `size: "sm"`
  - `disabled: !canInteractWithApp`

Body branch:

- `isAiButtonOpen === true`:
  - body returns `AddCellWithAI`
  - prop:
    - `onClose={isAiButtonOpenActions.toggle}`
- `isAiButtonOpen === false`:
  - body returns four text buttons in order:
    - `Python`
    - `Markdown`
    - `SQL`
    - `Generate with AI`

Python create path:

- icon:
  - `SquareCodeIcon`
  - `className: "mr-2 size-4 shrink-0"`
- click:
  - `createNewCell({ cellId: { type: "__end__", columnId }, before: false })`

Markdown create path:

- icon:
  - `SquareMIcon`
  - `className: "mr-2 size-4 shrink-0"`
- pre-create side effect:
  - `maybeAddMarimoImport({ autoInstantiate: true, createNewCell })`
- click:
  - `createNewCell({ cellId: { type: "__end__", columnId }, before: false, code: LanguageAdapters.markdown.defaultCode, hideCode: MARKDOWN_INITIAL_HIDE_CODE })`

SQL create path:

- icon:
  - `DatabaseIcon`
  - `className: "mr-2 size-4 shrink-0"`
- pre-create side effect:
  - `maybeAddMarimoImport({ autoInstantiate: true, createNewCell })`
- click:
  - `createNewCell({ cellId: { type: "__end__", columnId }, before: false, code: LanguageAdapters.sql.defaultCode })`

Button labels:

- `Python`
- `Markdown`
- `SQL`
- `Generate with AI`

AI-disabled tooltip text:

- `AI provider not found or Edit model not selected`

AI button contract:

- wrapper:
  - `Tooltip`
- tooltip props:
  - `delayDuration: 100`
  - `asChild: false`
  - `content={aiEnabled ? null : <span>AI provider not found or Edit model not selected</span>}`
- icon:
  - `SparklesIcon`
  - `className: "mr-2 size-4 shrink-0"`
- click when AI is enabled:
  - `isAiButtonOpenActions.toggle`
- click when AI is disabled:
  - `handleClick("ai", "ai-providers")`

Open-state visibility rule:

- outer shell always adds:
  - `opacity-100`
  - only when `isAiButtonOpen === true`

### 7. Floating Actions, Save, and Recovery

#### 7.0 Action Button and Text Button Primitives

Source:

- `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.tsx`
- `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.styles.ts`
- `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.css`
- `.__marimo_upstream/frontend/src/components/ui/button.tsx`
- `.__marimo_upstream/frontend/src/components/ui/menu-items.tsx`

Notebook action button primitive:

- base class:
  - `flex items-center justify-center m-0 leading-none font-medium border border-foreground/10 shadow-xs-solid active:shadow-none dark:border-border text-sm`
- color variants:
  - `gray` -> `mo-button gray`
  - `white` -> `mo-button white`
  - `green` -> `mo-button green`
  - `red` -> `mo-button red`
  - `yellow` -> `mo-button yellow`
  - `hint-green` -> `mo-button hint-green`
  - `disabled` -> `mo-button disabled active:shadow-xs-solid`
- shape variants:
  - `rectangle` -> `rounded`
  - `circle` -> `rounded-full`
- compound size and shape variants:
  - `small + circle` -> `h-[24px] w-[24px] px-[5.5px] py-[5.5px]`
  - `medium + circle` -> `px-2 py-2`
  - `small + rectangle` -> `px-1 py-1 h-[24px] w-[24px]`
  - `medium + rectangle` -> `px-3 py-2`

Button color styling:

- `.mo-button.gray`
  - `background-color: var(--slate-1)`
  - `border-color: var(--slate-6)`
  - `color: var(--slate-11)`
- `.mo-button.gray:hover`
  - `background-color: var(--slate-3)`
  - `border-color: var(--slate-8)`
- source selector `.mo-button.gray.selected .mo-button.gray:active`
  - `background-color: var(--slate-4)`
  - `border-color: var(--slate-7)`
- `.mo-button.hint-green`
  - `background-color: var(--background)`
  - `border-color: var(--slate-7)`
  - `color: var(--slate-11)`
- `@supports (color: color-mix(in lab, red, red))` branch for `.mo-button.hint-green`
  - `background-color: color-mix(in srgb, var(--background), transparent 0%)`
- `.mo-button.hint-green:hover`
  - `background-color: var(--grass-2)`
  - `border-color: var(--grass-7)`
  - `color: var(--grass-11)`
- source selector `.mo-button.hint-green.selected .mo-button.hint-green:active`
  - `background-color: var(--grass-4)`
  - `border-color: var(--grass-7)`
  - `color: var(--slate-11)`
- `.mo-button.disabled`
  - `background-color: var(--background)`
  - `border-color: var(--slate-6)`
  - `color: var(--slate-7)`
- `@supports (color: color-mix(in lab, red, red))` branch for `.mo-button.disabled`
  - `background-color: color-mix(in srgb, var(--background), transparent 0%)`
- `.mo-button.green`
  - `background-color: var(--grass-3)`
  - `border-color: var(--grass-6)`
  - `color: var(--grass-11)`
- `.mo-button.green:hover`
  - `background-color: var(--grass-2)`
  - `border-color: var(--grass-7)`
- source selector `.mo-button.green.selected .mo-button.green:active`
  - `background-color: var(--grass-4)`
  - `border-color: var(--grass-7)`
- `.mo-button.red`
  - `background-color: var(--red-3)`
  - `border-color: var(--red-6)`
  - `color: var(--red-11)`
- `.mo-button.red:hover`
  - `background-color: var(--red-4)`
  - `border-color: var(--red-8)`
- source selector `.mo-button.red.selected .mo-button.red:active`
  - `background-color: var(--red-5)`
  - `border-color: var(--red-7)`
- `.mo-button.yellow`
  - `background-color: var(--yellow-3)`
  - `border-color: var(--yellow-6)`
  - `color: var(--yellow-11)`
- `.mo-button.yellow:hover`
  - `background-color: var(--yellow-4)`
  - `border-color: var(--yellow-8)`
- source selector `.mo-button.yellow.selected .mo-button.yellow:active`
  - `background-color: var(--yellow-5)`
  - `border-color: var(--yellow-7)`

Generic text button primitive from `components/ui/button.tsx`:

- base class:
  - `disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background`
- `variant="text"`
  - `opacity-80 hover:opacity-100 active:opacity-100`
- `size="xs"`
  - `h-7 px-2 rounded-md text-xs`

#### 7.1 Top-Right Utility Stack

Source branch:

- `.__marimo_upstream/frontend/src/components/editor/controls/Controls.tsx`
- `.__marimo_upstream/frontend/src/components/editor/controls/notebook-menu-dropdown.tsx`
- `.__marimo_upstream/frontend/src/components/editor/controls/command-palette-button.tsx`
- `.__marimo_upstream/frontend/src/components/editor/renderers/layout-select.tsx`

Wrapper class:

- `absolute top-3 right-5 m-0 flex items-center gap-2 min-h-[28px] print:hidden pointer-events-auto z-30`

Render gate:

- the row does not render when connection state is `CLOSED`

Exact connected-state child order:

- `presenting && <LayoutSelect />`
- `NotebookMenuDropdown`
- `ConfigButton`
- `ShutdownButton`

Child ownership:

- `LayoutSelect`
  - presenting-only toggle branch
- `NotebookMenuDropdown`
  - notebook menu dropdown trigger
- `ConfigButton`
  - app config button
- `ShutdownButton`
  - shutdown button

This row does not own the save button. Save belongs to the bottom-right floating stack.

Notebook menu dropdown contract:

- `data-testid="notebook-menu-dropdown"`
- `aria-label="Config"`
- `shape: "circle"`
- `size: "small"`
- `className: "h-[27px] w-[27px]"`
- enabled color:
  - `hint-green`
- disabled color:
  - `disabled`
- default tooltip:
  - `Actions`
- tooltip content wrapper:
  - `flex flex-col gap-2`
- enabled helper row text:
  - `Open command palette`
- enabled helper row shortcut:
  - `renderShortcut("global.commandPalette", false)`
- enabled helper row class:
  - `text-xs text-muted-foreground font-medium pt-1 -mt-2 border-t border-border flex items-center gap-2`
- root popover primitive:
  - `DropdownMenu`
  - `modal: false`
- trigger primitive:
  - `DropdownMenuTrigger`
  - `asChild: true`
  - `disabled: disabled`
- popover alignment:
  - `align: "end"`
- popover class:
  - `print:hidden w-[240px]`
- root item testid pattern:
  - ``data-testid="notebook-menu-dropdown-${label}"``
- plain item renderer:
  - `renderLeafAction` using `DropdownMenuItem`
- nested dropdown renderer:
  - `renderAction`
  - trigger `DropdownMenuSubTrigger`
  - submenu `o1 -> r1`
- item skip gate:
  - `hidden || redundant -> null`
- item tooltip branch:
  - `side: "left"`
  - `delayDuration: 100`
- footer divider after menu items:
  - `DropdownMenuSeparator`
- locale and version footer wrapper:
  - `flex-1 px-2 text-xs text-muted-foreground flex flex-col gap-1`
- locale row text:
  - `Locale: ${locale}`
- version row text:
  - `Version: ${tx()}`

#### 7.1.1 Notebook Menu Item Inventory

Source:

- `.__marimo_upstream/frontend/src/components/editor/actions/useNotebookActions.tsx`

Menu construction contract:

- `useNotebookActions()` returns:
  - `actions.filter((action) => !action.hidden).map((action) => { if (action.dropdown) return { ...action, dropdown: action.dropdown.filter((item) => !item.hidden) }; return action; })`
- top-level filtering:
  - `.filter((action) => !action.hidden)`
- nested dropdown filtering:
  - `.map((action) => { if (action.dropdown) return { ...action, dropdown: action.dropdown.filter((item) => !item.hidden) }; return action; })`

Exact top-level order after hidden filtering:

- `Download`
- `Share`
- `Helper panel`
- `Present as`
- `Duplicate notebook`
- `Copy code to clipboard`
- `Enable all cells`
- `Add setup cell`
- `Add database connection`
- `Add remote storage`
- `Undo cell deletion`
- `Restart kernel`
- `Re-run all cells`
- `Clear all outputs`
- `Hide all markdown code`
- `Collapse all sections`
- `Expand all sections`
- `Command palette`
- `Keyboard shortcuts`
- `User settings`
- `Resources`
- `Return home`
- `New notebook`

Duplicate notebook prompt contract:

- source helper:
  - `useCopyNotebook(filename)`
- open gate:
  - only visible when `filename` exists
  - hidden when `isWasm()` is true
- modal title:
  - `Copy notebook`
- description:
  - `Enter a new filename for the notebook copy.`
- default value:
  - ``_${Paths.basename(source)}``
- confirm button text:
  - `Copy notebook`
- prompt option:
  - `spellCheck: false`
- destination path:
  - `PathBuilder.guessDeliminator(source).join(Paths.dirname(source), filename)`
- success toast:
  - title `Notebook copied`
  - description `A copy of the notebook has been created.`

Download menu contract:

- top-level icon:
  - `DownloadIcon`
- top-level handle:
  - `NOOP_HANDLER`
- exact dropdown order:
  - `Download as HTML`
    - icon `FolderDownIcon`
    - handle `downloadAsHTML({ filename, includeCode: true })`
  - `Download as HTML (exclude code)`
    - icon `FolderDownIcon`
    - handle `downloadAsHTML({ filename, includeCode: false })`
  - `Download as Markdown`
    - icon `MarkdownIcon`
  - `Download as ipynb`
    - icon `NotebookIcon`
  - `Download Python code`
    - icon `CodeIcon`
  - `Download as PNG`
    - divider `true`
    - icon `ImageIcon`
    - disabled when `mode !== "present"`
    - disabled tooltip:
      - `Only available in app view.`
      - `Toggle with:`
      - `renderShortcut("global.hideCode", false)`
  - `Download as PDF`
    - non-slides branch:
      - divider `true`
      - icon `FileIcon`
      - direct handle `handleDocumentPDF`
    - slides-layout branch:
      - divider `true`
      - icon `FileIcon`
      - top-level handle `NOOP_HANDLER`
      - nested order:
        - `Document Layout`
          - icon `FileIcon`
          - handle `handleDocumentPDF`
        - `Slides Layout`
          - icon `FileIcon`
          - rightElement `renderRecommendedElement(true)`
          - hidden when `serverSidePdfEnabled` is false
          - handle downloads slides PDF

Recommended badge helper from `renderRecommendedElement(true)`:

- tag:
  - `span`
- class:
  - `ml-3 shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700`
- text:
  - `Recommended`

Share menu contract:

- top-level icon:
  - `Share2Icon`
- top-level hidden rule:
  - `hidden: !sharingHtmlEnabled && !sharingWasmEnabled`
- exact dropdown order:
  - `Publish HTML to web`
    - icon `GlobeIcon`
    - hidden when `!sharingHtmlEnabled`
    - opens `Share static notebook` dialog
  - `Create WebAssembly link`
    - icon `LinkIcon`
    - hidden when `!sharingWasmEnabled`
    - success toast:
      - title `Copied`
      - description `Link copied to clipboard.`

Helper panel menu contract:

- top-level icon:
  - `PanelLeftIcon`
- `redundant: true`
- top-level handle:
  - `NOOP_HANDLER`
- dropdown source:
  - `PANELS.flatMap(({ type: id, Icon, hidden, additionalKeywords }) => hidden ? [] : item)`
- dropdown item label:
  - `startCase(id)`
- dropdown item icon:
  - `panel.Icon`
- dropdown item rightElement:
  - `renderCheckboxElement(selectedPanel === id)`
  - exact wrapper class `w-8 flex justify-end`

Present as menu contract:

- top-level icon:
  - `PresentationIcon`
- top-level handle:
  - `NOOP_HANDLER`
- exact dropdown order:
  - `Toggle app view`
    - hotkey `global.hideCode`
    - icon `EditIcon` when `mode === "present"`
    - icon `LayoutTemplateIcon` otherwise
  - first layout option from `LAYOUT_TYPES.map(...)`
    - `divider: true`
  - remaining layout options from `LAYOUT_TYPES.map(...)`
- each layout option:
  - label `displayLayoutName(type)`
  - icon `getLayoutIcon(type)`
  - rightElement wrapper `div.w-8.flex.justify-end`
  - selected state renders `CheckIcon` check icon
  - handle sets layout via `setLayoutView(type)` and toggles app view when current mode is `edit`

Remaining direct notebook menu items:

- `Duplicate notebook`
  - icon `Files`
  - hidden when `!filename || isWasm()`
- `Copy code to clipboard`
  - icon `ClipboardCopyIcon`
  - hidden when `!filename`
- `Enable all cells`
  - icon `ZapIcon`
  - hidden when `!hasDisabledCells || kioskMode`
- `Add setup cell`
  - divider `true`
  - icon `DiamondPlusIcon`
- `Add database connection`
  - icon `DatabaseIcon`
- `Add remote storage`
  - icon `HardDrive`
- `Undo cell deletion`
  - icon `Undo2Icon`
  - hidden when `!canUndoDeletes || kioskMode`
- `Restart kernel`
  - icon `PowerSquareIcon`
  - `variant: "danger"`
  - `additionalKeywords: ["reset", "reload", "restart"]`
- `Re-run all cells`
  - icon `FastForwardIcon`
  - `redundant: true`
  - `hotkey: "global.runAll"`
- `Clear all outputs`
  - icon `XCircleIcon`
  - `redundant: true`
- `Hide all markdown code`
  - icon `EyeOffIcon`
  - `redundant: true`
- `Collapse all sections`
  - icon `ChevronRightCircleIcon`
  - `redundant: true`
  - `hotkey: "global.collapseAllSections"`
- `Expand all sections`
  - icon `ChevronDownCircleIcon`
  - `redundant: true`
  - `hotkey: "global.expandAllSections"`
- `Command palette`
  - icon `CommandIcon`
  - `hotkey: "global.commandPalette"`
- `Keyboard shortcuts`
  - icon `KeyboardIcon`
  - `hotkey: "global.showHelp"`
- `User settings`
  - icon `SettingsIcon`
  - `redundant: true`
  - `additionalKeywords: ["preferences", "options", "configuration"]`
- `Resources`
  - icon `ExternalLinkIcon`
  - top-level handle `NOOP_HANDLER`
  - exact dropdown order:
    - `Documentation`
      - icon `BookMarkedIcon`
    - `GitHub`
      - icon `GithubIcon`
    - `Discord Community`
      - icon `MessagesSquareIcon`
    - `YouTube`
      - icon `YoutubeIcon`
    - `Changelog`
      - icon `FileTextIcon`
- `Return home`
  - divider `true`
  - icon `Home`
  - hidden when `!location.search.includes("file")`
- `New notebook`
  - icon `FilePlus2Icon`
  - hidden when `!location.search.includes("file")`

#### 7.2 Bottom-Right Floating Stack

Wrapper class:

- `absolute bottom-5 right-5 flex flex-col gap-2 items-center print:hidden pointer-events-auto z-30`

Disconnected DOM order from `experiments/marimo-layout.dom.html`:

- `#save-button`
- `#preview-button[data-testid="hide-code-button"]`
- `button[data-testid="command-palette-button"]`
- empty spacer `<div></div>`
- run cluster wrapper `<div class="flex flex-col gap-2 items-center"></div>`

Known items in this stack:

- save button
- preview or hide-code toggle button
- command palette button
- spacer node
- run button cluster
- interrupt button
- undo delete button when applicable

Exact source order from `Controls.tsx`:

- `SaveComponent`
- preview or hide-code toggle button
- `CommandPaletteButton`
- `KeyboardShortcuts`
- empty `<div></div>`
- run cluster wrapper `div.flex.flex-col.gap-2.items-center`
  - child order inside cluster:
    - undo delete button when available
    - interrupt button when connected
    - run button when connected

Save button contract from `save-component.tsx` and `RecoveryButton.tsx`:

- `data-testid="save-button"` in connected branch
- `id="save-button"` in both connected and disconnected branches
- `aria-label="Save"`
- shape `rectangle`
- trigger wrapper:
  - `Tooltip`
- trigger primitive:
  - `ControlButton` or `EditorButton`
- disconnected branch:
  - source component `RecoveryButton`
  - color `gray` when clean
  - color `yellow` when dirty
- connected branch:
  - source component `SaveComponent`
  - color `hint-green` when clean
  - color `yellow` when dirty
- tooltip content:
  - `renderShortcut("global.save")`
- connected click path:
  - `saveOrNameNotebook`
- disconnected click path:
  - `openRecoveryModal`
- persistent filename gate from `isNamedPersistentFile(filename)`:
  - `filename !== null`
  - does not start with `/tmp/`
  - does not start with `/var/folders`
  - does not include `AppData\\Local\\Temp`
- disconnected DOM capture class:
  - `flex items-center justify-center m-0 leading-none font-medium border border-foreground/10 shadow-xs-solid active:shadow-none dark:border-border text-sm mo-button gray rounded px-3 py-2 rectangle`

Preview or hide-code button:

- `data-testid="hide-code-button"`
- `id="preview-button"`
- shape `rectangle`
- color `hint-green`
- tooltip comes from `renderShortcut("global.hideCode")`
- icon size:
  - `18`
- stroke width:
  - `1.5`
- icon branch when `presenting=true`:
  - `EditIcon`
- icon branch when `presenting=false`:
  - `LayoutTemplateIcon`

Command palette button:

- `data-testid="command-palette-button"`
- shape `rectangle`
- color `hint-green`
- tooltip comes from `renderShortcut("global.commandPalette")`
- icon size:
  - `18`
- stroke width:
  - `1.5`
- icon:
  - `CommandIcon`

Undo delete button:

- `data-testid="undo-delete-cell"`
- size `medium`
- color `hint-green`
- shape `circle`
- icon size:
  - `16`
- stroke width:
  - `1.5`
- tooltip text:
  - `Undo cell deletion`

Run button:

- `data-testid="run-button"`
- dirty branch:
  - color `yellow`
  - size `medium`
  - shape `circle`
  - tooltip:
    - `renderShortcut("global.runStale")`
- idle-nothing-to-run branch:
  - color `disabled`
  - `className: "inactive-button"`
  - tooltip text:
    - `Nothing to run`

Interrupt button:

- `data-testid="interrupt-button"`
- size `medium`
- shape `circle`
- tooltip:
  - `renderShortcut("global.interrupt")`
- running branch color:
  - `yellow`
- inactive branch color:
  - `disabled`
- inactive class add:
  - `inactive-button active:shadow-xs-solid`
- inactive click handler:
  - `kr.NOOP`
- icon:
  - `SquareIcon`
  - size `16`
  - stroke width `1.5`

#### 7.3 App Config Button and Shutdown Button

Source:

- `.__marimo_upstream/frontend/src/components/app-config/app-config-button.tsx`
- `.__marimo_upstream/frontend/src/components/editor/controls/shutdown-button.tsx`

App config button contract:

- `data-testid="app-config-button"`
- `aria-label="Config"`
- `shape: "circle"`
- `size: "small"`
- `className: "h-[27px] w-[27px]"`
- enabled color:
  - `hint-green`
- disabled color:
  - `disabled`
- default tooltip:
  - `Settings`

Shutdown button contract:

- `data-testid="shutdown-button"`
- `aria-label="Shutdown"`
- hidden branch:
  - returns `null` when `isWasm()` is true
- `shape: "circle"`
- `size: "small"`
- `className: "h-[27px] w-[27px]"`
- enabled color:
  - `red`
- disabled color:
  - `disabled`
- default tooltip:
  - `Shutdown`
- confirmation dialog title:
  - `Shutdown`
- confirmation action label:
  - `Shutdown`
- confirm action primitive:
  - `AlertDialogDestructiveAction`
  - `aria-label: "Confirm Shutdown"`
- destructive description in shell:
  - `This will terminate the Python kernel. You'll lose all data that's in memory.`
- trigger wrapper:
  - `Tooltip`
- trigger click behavior:
  - `event.stopPropagation()`
  - opens destructive confirm modal
- confirmed shutdown side effect order:
  - `sendShutdown()`
  - `setTimeout(() => window.close(), 200)`
  - `closeModal()`

#### 7.4 Save Dialog and Recovery Dialog

Save dialog source:

- `.__marimo_upstream/frontend/src/core/saving/save-component.tsx`
- `.__marimo_upstream/frontend/src/components/editor/RecoveryButton.tsx`
- `.__marimo_upstream/frontend/src/components/editor/header/filename-input.tsx`

Save dialog strings and hooks:

- title:
  - `Save notebook`
- field label:
  - `Save as`
- label class:
  - `text-md pt-6 px-1`
- filename placeholder:
  - `filename`
- filename input component:
  - `FilenameInput`
- filename input class:
  - `missing-filename`
- `onNameChange` callback behavior:
  - stores the raw value in local state
  - when `value.trim()` is non-empty, immediately calls `onSave(value)` and `onClose()`
- cancel button:
  - `data-testid="cancel-save-dialog-button"`
  - label `Cancel`
- submit button:
  - `data-testid="submit-save-dialog-button"`
  - label `Save`
  - `type: "submit"`
  - `disabled` when local filename state is falsy

Recovery ownership split:

- source wrapper:
  - `RecoveryButton`
- proposed filename base:
  - `filename === null ? "app" : Paths.basename(filename).split(".")[0]`
- top-level save branch:
  - `SaveComponent` returns `RecoveryButton` when `connection.state === WebSocketState.CLOSED`
  - otherwise returns the connected `ControlButton` save trigger
- connected save trigger click:
  - `preventDefault()`
  - `stopPropagation()`
  - `saveOrNameNotebook()`
- global hotkey:
  - `useHotkey("global.save", saveOrNameNotebook)`
- beforeunload protection:
  - active only when `needsSave` is true
  - sets `event.returnValue = "You have unsaved changes. Are you sure you want to leave?"`
- connected save action source:
  - `useSaveNotebook()`
  - `saveOrNameNotebook`
- connected save flow:
  - first calls `saveIfNotebookIsPersistent(true)`
  - opens `SaveDialog` only when the filename is not persistent and connection state is not `CLOSED`
- low-level `saveNotebook(filename, userInitiated)` gates:
  - returns immediately in kiosk mode
  - shows alert `Failed to save notebook: not connected to a kernel.` when connection state is not `OPEN`
  - runs `formatAll()` before serialization when `userInitiated && autoSaveConfig.format_on_save`
  - returns without saving when there are no cells
- serialized save payload includes:
  - `cellIds`
  - `codes`
  - `names`
  - `configs`
  - `layout: getSerializedLayout()`
  - `persist: true`
- post-save snapshot update:
  - `setLastSavedNotebook({ names, codes, configs, layout })`
- `global.save` hotkey is bound to recovery open path when the notebook is in the disconnected recovery branch
- disconnected save button color:
  - `gray`
- connected save button colors are documented in the floating save ownership section

Unsaved recovery dialog source:

- `.__marimo_upstream/frontend/src/components/editor/RecoveryButton.tsx`

Recovery dialog strings and hooks:

- title:
  - `Download unsaved changes?`
- wrapper class:
  - `w-fit`
- intro:
  - `This app has unsaved changes. To recover:`
- step text:
  - `Click the "Download" button. This will download a file called ...`
  - `marimo recover <name>.json > <name>.py`
- generated download filename:
  - `${proposedName}.json`
- download blob source:
  - `downloadBlob(new Blob([getNotebookJSON()], { type: "text/plain" }), \`${proposedName}.json\`)`
- form keydown handler:
  - `Escape -> closeModal()`
- cancel button:
  - `data-testid="cancel-recovery-button"`
  - label `Cancel`
- download button:
  - `data-testid="download-recovery-button"`
  - label `Download`

#### 7.5 Floating Staged Delete Recovery Bar

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/pending-ai-cells.tsx`
- `.__marimo_upstream/frontend/src/components/editor/ai/completion-handlers.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/app-chrome.tsx`

Render gate and ownership:

- reads staged-cell map from `stagedAICellsAtom`
- returns `null` when `stagedAiCells.size === 0`
- mounted by `app-chrome.tsx` as a floating overlay sibling inside the chrome wrapper

Wrapper class:

- `fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80 border border-border rounded-lg px-3 py-2 flex items-center justify-between gap-2.5 w-100 shadow-[0_0_6px_0_#00A2C733]`

State and navigation contract:

- staged cell id list source:
  - `[...stagedAiCells.keys()]`
- selected index local state starts as:
  - `null`
- focus helper:
  - `scrollAndHighlightCell(cellId, "focus")`
- directional navigation helper:
  - `getNextIndex(currentIndex, ids.length, direction)`
- up or down navigation side effect:
  - updates selected index
  - focuses `ids[nextIndex]`

Exact child order:

- leading status icon
- pending-count navigator
- divider
- accept or reject controls

Leading status icon:

- icon:
  - `SparklesIcon`
- class:
  - `h-4 w-4 text-primary`

Pending-count navigator:

- wrapper class:
  - `flex items-center`
- up button:
  - `Button`
  - `variant: "ghost"`
  - `size: "icon"`
  - icon `ChevronUp`
  - icon class `h-3.5 w-3.5`
- count label class:
  - `text-xs font-mono min-w-[3.5rem] text-center`
- count text branch:
  - when selected index is `null`:
    - `${ids.length} pending`
  - otherwise:
    - `${selectedIndex + 1} / ${ids.length}`
- down button:
  - `Button`
  - `variant: "ghost"`
  - `size: "icon"`
  - icon `ChevronDown`
  - icon class `h-3.5 w-3.5`

Divider:

- `div.h-5.w-px.bg-border`

Accept or reject controls:

- wrapper class:
  - `flex items-center gap-1.5`

Accept control branch:

- source call:
  - `AcceptCompletionButton`
- props from `Rh`:
  - `multipleCompletions: true`
  - `onAccept: acceptAll`
  - `isLoading: false`
  - `size: "xs"`
  - `buttonStyles: "h-6.5"`
  - `playButtonStyles: "h-6.5"`
  - `runCell: runStagedIds`
- `acceptAll` loop:
  - iterates every `[cellId, cell]` in the staged map
  - calls `acceptStagedCell(cellId, cell, removeStagedCell, deleteStagedCell)`
- `runStagedIds`:
  - `runCell(ids)`
- left text button label:
  - `Accept all`
- left text button contract:
  - `variant: "text"`
  - `size: "xs"`
  - class chain:
    - `h-6 text-(--grass-11) bg-(--grass-3)/60 hover:bg-(--grass-3) dark:bg-(--grass-4)/80 dark:hover:bg-(--grass-3) font-semibold active:bg-(--grass-5) dark:active:bg-(--grass-4) border-(--green-6) border hover:shadow-xs rounded-r-none h-6.5`
- right play button tooltip:
  - `Accept and run all cells`
- right play button contract:
  - `variant: "text"`
  - `size: "xs"`
  - class chain:
    - `h-6 text-(--grass-11) bg-(--grass-3)/60 hover:bg-(--grass-3) dark:bg-(--grass-4)/80 dark:hover:bg-(--grass-3) font-semibold active:bg-(--grass-5) dark:active:bg-(--grass-4) border-(--green-6) border hover:shadow-xs rounded-l-none px-1.5 h-6.5`
- right play icon:
  - play icon from `AcceptCompletionButton`
  - class `h-2.5 w-2.5`
- internal accept wrapper:
  - `div.flex`

Reject control branch:

- source call:
  - `RejectCompletionButton`
- props from `Rh`:
  - `multipleCompletions: true`
  - `onDecline: rejectAll`
  - `size: "xs"`
  - `className: "h-6.5"`
- `rejectAll` loop:
  - iterates every `[cellId, cell]` in the staged map
  - calls `rejectStagedCell(cellId, cell, removeStagedCell, deleteStagedCell)`
- rendered label:
  - `Reject all`
- button contract:
  - `variant: "text"`
  - `size: "xs"`
  - class chain:
    - `h-6 text-(--red-10) bg-(--red-3)/60 hover:bg-(--red-3) dark:bg-(--red-4)/80 dark:hover:bg-(--red-3) rounded px-3 font-semibold active:bg-(--red-5) dark:active:bg-(--red-4) border-(--red-6) border hover:shadow-xs h-6.5`

#### 7.5.1 Multi-Cell Selection Toolbar

Source:

- `.__marimo_upstream/frontend/src/components/editor/navigation/multi-cell-action-toolbar.tsx`
- `.__marimo_upstream/frontend/src/components/editor/navigation/selection.ts`

Top-level gate:

- `MultiCellActionToolbar` reads `useCellSelectionState()`
- expands `selectedCells` from `selectionState.selected`
- returns `null` when `selectedCells.length < 2`
- otherwise renders in fragment order:
  - `MultiCellActionToolbarInternal`
  - `MultiCellPendingDeleteBar`

Toolbar overlay wrapper:

- outer wrapper class:
  - `absolute top-12 justify-center flex w-full left-0 right-0 z-50`
- attrs:
  - `data-keep-cell-selection={true}`
- inner surface class:
  - `bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 border border-(--slate-7) rounded-lg shadow-lg p-2 overflow-x-auto overflow-y-hidden mx-20 scrollbar-thin`

Toolbar leading label:

- class:
  - `text-sm font-medium text-muted-foreground px-2 shrink-0`
- text:
  - `${selectedCount} cells selected`

Selection-clear behavior:

- window `mousedown` listener clears selection unless:
  - the event target is inside `[data-keep-cell-selection]`
  - or the event target is `HTMLHtmlElement`
- clear path:
  - `pendingDeleteService.clear()`
  - `selectionActions.clear()`

Primary action groups from `useMultiCellActionButtons(cellIds)`:

- returned object keys:
  - `actions`
  - `moreActions`
- both are normalized by:
  - `.map((group) => group.filter((action) => !action.hidden))`
  - `.filter((group) => group.length > 0)`

Primary `actions` group order:

- group 1:
  - `Run cells`
- group 2:
  - `Move up`
  - `Move down`
- group 3:
  - `Delete cells`
  - `variant: "danger"`
  - hidden when `canDelete` is false

Overflow dropdown `moreActions` group order:

- group 1:
  - `Format cells`
  - `Clear outputs`
- group 2:
  - `Hide code`
  - `Show code`
- group 3:
  - `Move up`
  - `Move down`
  - `Send to top`
  - `Send to bottom`
- group 4:
  - `Disable cells`
  - `Enable cells`

Inline action button shell:

- primitive:
  - `Button`
- variant:
  - `linkDestructive` when `action.variant === "danger"`
  - otherwise `ghost`
- size:
  - `sm`
- class:
  - `h-8 px-2 gap-1 shrink-0 flex items-center`
- title attr:
  - `action.label`
- disabled rule:
  - `isPendingDelete && action.label !== "Delete cells"`

Inline hotkey badge:

- wrapper:
  - `div.ml-1.border.bg-muted.rounded-md.px-1`
- content:
  - `MinimalShortcut`

Group separator:

- local primitive:
  - `Separator`
- rendered DOM:
  - `div.h-4.w-px.bg-border.mx-1`

Overflow dropdown trigger:

- component:
  - `CellStateDropdown`
- disabled when:
  - `isPendingDelete`
- trigger button:
  - `Button`
  - `variant: "ghost"`
  - `size: "sm"`
  - `className: "h-8 px-2 gap-1"`
  - `title: "More actions"`
  - icon `MoreHorizontalIcon size={13} strokeWidth={1.5}`
- menu content:
  - `DropdownMenuContent align="start" data-keep-cell-selection={true}`
- menu rows:
  - `DropdownMenuItem`
  - `className: "flex items-center gap-2"`
  - icon slot wrapper `div.mr-2.w-5.text-muted-foreground`
  - label wrapper `div.flex-1`
  - hotkey slot `MinimalShortcut className="ml-4"`
- group divider:
  - `DropdownMenuSeparator`

Pending delete confirmation bar:

- render gate:
  - only when `pendingDeleteService.shouldConfirmDelete`
- outer wrapper class:
  - `absolute top-12 justify-center flex w-full left-0 right-0 z-50`
- inner surface class:
  - `bg-(--amber-2) border border-(--amber-6) rounded-lg shadow-lg mt-14 px-4 py-3 animate-in slide-in-from-top-2 duration-200`
- warning icon:
  - `AlertTriangleIcon`
  - `className: "w-4 h-4 text-(--amber-11) mt-0.5 shrink-0"`
- copy:
  - `Some cells in selection may contain expensive operations.`
  - `Are you sure you want to delete?`
- actions are wrapped in:
  - `FocusScope restoreFocus={true} autoFocus={true}`
- cancel button:
  - `size: "xs"`
  - `variant: "ghost"`
  - class `text-(--amber-11) hover:bg-(--amber-4) hover:text-(--amber-11)`
- delete button:
  - `size: "xs"`
  - `variant: "secondary"`
  - class `bg-(--amber-11) hover:bg-(--amber-12) text-white border-(--amber-11)`
- confirm path:
  - `deleteCell({ cellIds })`
  - `pendingDeleteService.clear()`
  - `selectionActions.clear()`

#### 7.6 Command Palette Overlay

Source:

- `.__marimo_upstream/frontend/src/components/editor/controls/command-palette.tsx`
- `.__marimo_upstream/frontend/src/components/ui/command.tsx`

Top-level behavior:

- the command palette component is mounted in parallel with the notebook page in both top-level render branches
- document keydown listener toggles `open` when the hotkey for `global.commandPalette` matches
- toggle function:
  - `setOpen(previous => !previous)`

Content composition from `components/editor/controls/command-palette.tsx`:

- state inputs:
  - `open`, `setOpen` from `commandPaletteAtom`
  - `lastFocusedCell` from `lastFocusedCellAtom`
  - `hotkeys` from `hotkeysAtom`
  - `registeredActions` from `useRegisteredActions()`
- cell action source:
  - `useCellActionButtons({ cell: lastFocusedCell }).flat()`
  - normalized through `flattenActions`
- notebook action source:
  - `useNotebookActions()`
  - `useConfigActions()`
  - both normalized through `flattenActions`
- notebook label lookup map:
  - `Objects.keyBy(notebookActionsWithoutHotkeys, (action) => action.label)`
- recents source:
  - `useRecentCommands()`
  - guard set `new Set(recentCommands)`
- root dialog:
  - `CommandDialog`
  - props `open`, `onOpenChange`
- input:
  - `CommandInput`
  - placeholder `Type to search...`
- empty state:
  - `CommandEmpty`
  - text `No results found.`
- optional section:
  - `Recently Used`
- main section:
  - `Commands`
- group ordering:
  - optional `Recently Used`
  - `CommandSeparator`
  - `Commands`
- cell command label prefix:
  - `Cell > ${label}`
- selecting an item:
  - stores the recent command key or label
  - closes the palette
  - runs the action inside `requestAnimationFrame`

`Recently Used` branch contract:

- renders only when `recentCommands.length > 0`
- group heading:
  - `Recently Used`
- each recent entry resolves in this order:
  - if `isHotkeyAction(shortcut)`: `renderShortcutCommandItem`
  - else if label maps to a non-parent notebook action: `renderCommandItem`
  - else `null`

`Commands` branch order:

- first `hotkeys.iterate()`
  - skips entries already present in `recentCommandsSet`
- then `notebookActionsWithoutHotkeys`
  - skips labels already present in `recentCommandsSet`
- then flattened `cellActions`
  - skips labels already present in `recentCommandsSet`

Shortcut item contract:

- root primitive:
  - `CommandItem`
- `key: shortcut`
- `value: hotkey.name`
- `keywords: hotkey.additionalKeywords`
- right slot:
  - `CommandShortcut`
    - `KeyboardHotkeys shortcut={hotkey.key}`
- select path:
  - `addRecentCommand(shortcut)`
  - `setOpen(false)`
  - `requestAnimationFrame(() => action())`

Generic command item contract:

- root primitive:
  - `CommandItem`
- `key: label`
- `value: label`
- `keywords: additionalKeywords`
- tooltip suffix when present:
  - `({props.tooltip})`
- optional right slot:
  - `CommandShortcut`
    - `KeyboardHotkeys shortcut={hotkeys.getHotkey(hotkey).key}`
- select path:
  - `addRecentCommand(label)`
  - `setOpen(false)`
  - `requestAnimationFrame(() => handle())`

Dialog shell from `components/ui/command.tsx`:

- outer dialog wrapper:
  - `Dialog`
- dialog content wrapper:
  - `DialogContent`
  - `className: "overflow-hidden p-0 shadow-2xl"`
  - `usePortal: true`
- command root component:
  - `Command`
  - class:
    - `flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground`
- extra root class injected by dialog wrapper:
  - `[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5`

Cmdk attribute contract:

- root:
  - `cmdk-root`
- input:
  - `cmdk-input`
- list:
  - `cmdk-list`
- item:
  - `cmdk-item`
- group:
  - `cmdk-group`
- empty:
  - `cmdk-empty`
- dialog:
  - `cmdk-dialog`
- overlay:
  - `cmdk-overlay`

Input shell:

- wrapper class:
  - `flex items-center border-b px-3`
- default icon:
  - `Search`
  - class `mr-2 h-4 w-4 shrink-0 opacity-50`
- input class:
  - `placeholder:text-foreground-muted flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50`

List and group shell:

- list class:
  - `max-h-[300px] overflow-y-auto overflow-x-hidden`
- group class:
  - `overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground`
- empty state class:
  - `py-6 text-center text-sm`

Command item contract:

- item primitive:
  - `CommandItem`
- item `value` is HTML-escaped before registration
- disabled state comes from the passed command or menu props
- matching uses `filter: yt`
  - primary match score `1`
  - keyword-only fallback score `0.8`
- root props from cmdk:
  - `loop`
  - `shouldFilter`
  - `disablePointerSelection`
  - `vimBindings`

### 8. Notebook Settings and App Config Contract

#### 8.1 App Config Trigger Modes

Source:

- `.__marimo_upstream/frontend/src/components/app-config/app-config-button.tsx`

Trigger branches:

- `showAppConfig=false` opens a dialog modal directly
- `showAppConfig=true` opens a popover, then a `User settings` link opens the full dialog

Trigger button contract:

- `aria-label: "Config"`
- `data-testid="app-config-button"`
- `shape: "circle"`
- `size: "small"`
- `className: "h-[27px] w-[27px]"`
- enabled color:
  - `hint-green`
- disabled color:
  - `disabled`
- default tooltip:
  - `Settings`
- leading icon:
  - settings icon `SettingsIcon`
  - `strokeWidth: 1.8`

Direct dialog branch when `showAppConfig=false`:

- trigger wrapper:
  - `DialogTrigger`
- dialog root:
  - `Dialog`
- child order:
  - trigger
  - full `User settings` dialog

Popover branch when `showAppConfig=true`:

- trigger wrapper:
  - `PopoverTrigger`
  - `asChild: true`
- outer root:
  - `Popover`
- separate full dialog root is still mounted in parallel:
  - `Dialog`
- fragment order:
  - `Popover`
  - `Dialog`

Popover contract:

- class:
  - `w-[650px] overflow-auto max-h-[80vh] max-w-[80vw]`
- `align: "end"`
- `side: "bottom"`
- `onFocusOutside`
  - `preventDefault()`

Modal dialog contract:

- class:
  - `w-[90vw] h-[90vh] overflow-hidden sm:max-w-5xl top-[5vh] p-0`
- dialog shell:
  - `DialogContent`
- dialog header:
  - `VisuallyHidden`
  - title child `DialogTitle`
- dialog body:
  - `UserConfigForm`

Titles:

- popover form title:
  - `Notebook Settings`
- form description:
  - `Configure how your notebook or application looks and behaves.`
- dialog title:
  - `User settings`

Popover footer link:

- button variant:
  - `link`
- button class:
  - `px-0`
- leading icon:
  - settings icon `SettingsIcon`
  - `className: "w-4 h-4 mr-2"`
- label:
  - `User settings`
- divider above footer link:
  - `div.h-px.bg-border.my-2`
- footer click path:
  - `onClick: () => setOpen(true)`

#### 8.2 Notebook Settings Form

The form auto-saves through debounced submit:

- debounce:
  - `100ms`
- save path:
  - `saveAppConfig({config})`
- submit wiring:
  - `handleSubmit(debouncedSave)`
- local config sync after save:
  - success path calls `setConfig(config)`
  - catch path also calls `setConfig(config)`
- width side effect:
  - `useEffect(() => { window.dispatchEvent(new Event("resize")); }, [config.width])`

Form layout:

- root:
  - `flex flex-col gap-6`
- section grid:
  - `grid grid-cols-2 gap-x-8 gap-y-4`
- section wrapper:
  - `flex flex-col gap-y-2`
- section title class:
  - `text-base font-semibold mb-1`
- section helper component:
  - `SettingSection`

Form controller contract:

- schema resolver:
  - `zodResolver(AppConfigSchema as unknown as z.ZodType<unknown, AppConfig>)`
- form default values:
  - `defaultValues: config`
- root form primitive:
  - `Form`

Section inventory:

- `Display`
  - `width`
  - `app_title`
- `Custom Files`
  - `css_file`
  - `html_head_file`
- `Data`
  - `sql_output`
- `Exporting outputs`
  - `auto_download`

Required testids:

- `data-testid="app-width-select"`
- `data-testid="sql-output-select"`
- `data-testid="html-checkbox"`
- `data-testid="ipynb-checkbox"`

Important field strings:

- `Width`
- `App title`
- `Custom CSS`
- `HTML Head`
- `SQL Output Type`
- `HTML`
- `IPYNB`

Field shell details:

- `Width`
  - select class `inline-flex mr-2`
  - options come from `getAppWidths().map((option) => <option value={option}>{option}</option>)`
- `App title`
  - input syncs `document.title` when schema-safe
- `Custom CSS`
  - input placeholder `custom.css`
- `HTML Head`
  - input placeholder `head.html`
- `SQL Output Type`
  - select class `inline-flex mr-2`
- `Exporting outputs`
  - checkbox row wrapper `flex gap-4`
  - checkbox item wrapper `flex items-center space-x-2`

Important descriptions:

- App title:
  - `The application title is put in the title tag in the HTML code and typically displayed in the title bar of the browser window.`
- Custom CSS:
  - `A filepath to a custom css file to be injected into the notebook.`
- HTML Head:
  - `A filepath to an HTML file to be injected into the <head/> section of the notebook. Use this to add analytics, custom fonts, meta tags, or external scripts.`
- SQL output:
  - `The Python type returned by a SQL cell. For best performance with large datasets, we recommend using native.`
- Exporting outputs:
  - `When enabled, marimo will periodically save this notebook in your selected formats (HTML, IPYNB) to a folder named __marimo__ next to your notebook file.`

SQL output change toast:

- title:
  - `Kernel Restart Required`
- description:
  - `This change requires a kernel restart to take effect.`

#### 8.3 User Settings Package Management

Source:

- `.__marimo_upstream/frontend/src/components/app-config/user-config-form.tsx`

Form behavior:

- auto-submit path:
  - `handleSubmit(saveDirtyFields)`
- save function only persists dirty fields:
  - `getDirtyValues(values, form.formState.dirtyFields)`
- save path:
  - `saveUserConfig({ config: dirtyConfig })`
- successful save merges new values into local config with:
  - `setConfig(prev => ({ ...prev, ...values }))`

Form layout:

- root form:
  - `flex flex-col gap-5`
- inner stack:
  - `flex flex-col gap-3`
- wrapper primitive:
  - `Form`

Field inventory:

- `package_management.manager`
  - select testid `data-testid="install-package-manager-select"`
  - select class `inline-flex mr-2`
  - options source `PackageManagerNames.map((option) => <option value={option}>{option}</option>)`

### 9. Cell, Editor, Hover, and Output Contract

#### 9.1 Cell Root

Source:

- `.__marimo_upstream/frontend/src/components/editor/notebook-cell.tsx`
- `.__marimo_upstream/frontend/src/components/editor/common.ts`
- `.__marimo_upstream/frontend/src/components/editor/Output.tsx`

Root attributes:

- `data-cell-id`
- `data-cell-name`
- `id = HTMLCellId.create(cellId)`
- `tabIndex = -1`

Attribute helper contract:

- `cellDomProps(cellId, cellName)` returns
  - `{ "data-cell-id": cellId, "data-cell-name": cellName, id: HTMLCellId.create(cellId) }`

Always-on classes:

- `marimo-cell`
- `hover-actions-parent`
- `empty:invisible`

Conditional classes:

- `published` when `!showCode && !(kiosk && mode !== "present")`
- `has-error` when `errored`
- `stopped` when `stopped`
- `borderless` when `new ir().isSupported(code) && !published`

#### 9.2 Cell Render Branches

Read or kiosk branch condition:

- `(mode === "read" && showCode) || (kiosk && mode !== "present")`

Read or kiosk branch order:

```text
div.marimo-cell...
  if cellOutputArea === "above"
    OutputArea.output-area
  if !shouldHideCode(code, output)
    div.tray
      ReadonlyCode(initiallyHideCode = config.hide_code || kiosk, code)
  if cellOutputArea === "below"
    OutputArea.output-area
  ConsoleOutput
```

Read branch output props:

- `allowExpand: true`
- `className: "output-area"`
- source passes `className: CSSClasses.outputArea`
- source also passes:
  - `output`
  - `cellId`
  - `stale`
  - `loading`

Read branch wrapper contract:

- wrapper is `div`
- wrapper keeps `tabIndex = -1`
- wrapper keeps `ref = cellRef`
- wrapper class is the root class composition from `className`
- wrapper spreads the exact object returned by `cellDomProps(cellId, cellName)`

Hide helper `shouldHideCode(code, output)` returns true when:

- `new MarkdownLanguageAdapter().isSupported(code) && output is non-empty`
- or `code.trim() === ""`

Read branch child gates:

- `U = cellOutputArea === "above" && L`
- `K = !shouldHideCode(code, output) && <div className="tray"><ReadonlyCode initiallyHideCode={config.hide_code || kiosk} code={code} /></div>`
- `V = cellOutputArea === "below" && L`
- console child is always appended as:
  - `ConsoleOutput({ consoleOutputs, stale, cellName, onSubmitDebugger: () => null, cellId, debuggerActive: false })`

Edit branch condition:

- standard edit mode after the read or kiosk early branch

Edit branch early null return when:

- `errored`
- `interrupted`
- `stopped`
- `isErrorMime(output?.mimetype)`

Edit branch wrapper contract:

- wrapper is `div`
- wrapper keeps `tabIndex = -1`
- wrapper keeps `ref = cellRef`
- wrapper class is the root class composition from `className`
- wrapper spreads the exact object returned by `cellDomProps(cellId, cellName)`

Edit branch child order:

- `OutputArea.output-area`

Edit branch output props:

- `allowExpand: mode === "edit"`
- `className: "output-area"`
- source passes `className: CSSClasses.outputArea`
- source also passes:
  - `output`
  - `cellId`
  - `stale`
  - `loading`

#### 9.3 Editor Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/cell/code/cell-editor.tsx`
- `.__marimo_upstream/frontend/src/components/editor/cell/code/language-toggle.tsx`

Editor shell ownership:

- exported editor component is `CellEditor`
- non-RTC export is `memo(CellEditorInternal)`
- RTC export is `WithWaitUntilConnected(memo(CellEditorInternal))`
- `CellEditorInternal` owns:
  - `AiCompletionEditor`
  - `CellCodeMirrorEditor`
  - `LanguageToggles`

Outer editor wrapper:

- `div.relative.w-full`
- wrapper carries the keyboard props returned by `useCellEditorNavigationProps(...)`
- language toggle overlay only renders when:
  - `!hidden`
  - `showLanguageToggles === true`

Editor root:

- `div.cm.mathjax_ignore`
- `data-testid="cell-editor"`
- class composition is `cn("cm mathjax_ignore", className)`

Hidden code class branches:

- when `languageAdapter === "markdown" && hidden && hasOutput`
  - `className = "h-0 overflow-hidden"`
- otherwise when `hidden`
  - `className = "opacity-20 h-8 [&>div.cm-editor]:h-full [&>div.cm-editor]:overflow-hidden [&_.cm-panels]:hidden"`
- otherwise
  - no extra hidden-class token is added

Hidden code interaction contract:

- `CellCodeMirrorEditor` handles `onDoubleClick`
- it only fires the reveal path when `hidden && showHiddenCode`
- reveal call is:
  - `showHiddenCode({ focus: true })`

Language toggle overlay:

```text
div.relative.w-full
  div.cm.mathjax_ignore[data-testid="cell-editor"]
  div.absolute.top-1.right-5
    div.absolute.right-3.top-2.z-20.flex.hover-action.gap-1
      button[data-testid="language-toggle-button"]
```

Language toggle button props:

- `variant: "text"`
- `size: "xs"`
- `className: "opacity-80 px-1"`
- tooltip string branch:
  - `View as SQL`
  - `View as Markdown`
  - `View as Python`
- button does not render when:
  - `!canSwitchToLanguage`
  - or `currentLanguageAdapter === toType`

Language toggle branch gates:

- SQL toggle renders only when:
  - `_a.sql.isSupported(code) || code.trim() === ""`
  - and `currentLanguageAdapter === "python"`
- Markdown toggle renders only when:
  - `_a.markdown.isSupported(code) || code.trim() === ""`
  - and `currentLanguageAdapter === "python"`
- Python toggle renders whenever current adapter is not already `python`

Language adapter sync contract:

- editor extension array pushes:
  - `He.define(update => (setLanguageAdapter(update.state.field(Cn).type), { update(next) { setLanguageAdapter(next.state.field(Cn).type) } }))`
- source of truth for adapter type is the CodeMirror field `languageAdapterState`

Selection ring:

- `data-[selected=true]:ring-1`
- `data-[selected=true]:ring-(--blue-8)`
- `data-[selected=true]:ring-offset-1`
- selection wrapper is built by:
  - `mergeProps(focusWithinProps, keyboardProps, { "data-selected": isSelected, className: "data-[selected=true]:ring-1 data-[selected=true]:ring-(--blue-8) data-[selected=true]:ring-offset-1" })`

Editor reveal-on-focus contract:

- extension array pushes:
  - `EditorView.updateListener.of((update) => { if (update.selectionSet && update.state.selection.ranges.some((range) => range.from !== range.to)) showHiddenCode({ focus: false }); })`
  - `EditorView.domEventHandlers({ focus: () => { showHiddenCode({ focus: false }); } })`

Editor state hydration contract:

- fresh editor path:
  - `new EditorView({ state: EditorState.create({ doc: code, extensions }) })`
- serialized restore path:
  - `new EditorView({ state: EditorState.fromJSON(serializedEditorState, { doc: code, extensions }, { history: historyField }) })`
- non-RTC branch immediately forces language sync with:
  - `switchLanguage(editorView, { language: getInitialLanguageAdapter(editorView.state).type })`
- mount target replacement:
  - `editorViewParentRef.current.replaceChildren(editorView.dom)`

Light editor colors:

- `background: #ffffff`
- `foreground: #000000`
- `caret: #000000`
- `selection: #d7d4f0`
- `lineHighlight: #cceeff44`
- `gutterBackground: var(--color-background)`
- `gutterForeground: var(--gray-10)`

Dark editor colors:

- `background: var(--cm-background)`
- `foreground: #abb2bf`
- `caret: #528bff`
- `selection: #3E4451`
- `lineHighlight: #2c313c`
- `gutterBackground: var(--color-background)`
- `gutterForeground: var(--gray-10)`

Reactive reference styling:

- `.mo-cm-reactive-reference`
  - `font-weight: 400`
  - `border-bottom: 2px solid #bad3de`
- light text color:
  - `#005f87`
- dark text color:
  - `#2a7aa5`
- `.mo-cm-reactive-reference-hover`
  - `cursor: pointer`
  - `border-bottom-width: 3px`
- dark hover border:
  - `#4a90a5`

Tooltip parent:

- `document.querySelector("#App") ?? undefined`

Editor keyboard shell:

- `useCellEditorNavigationProps(cellId, editorViewRef)` handles escape from editor focus shell
- non-vim branch:
  - `Escape` exits editor focus shell
- vim branch:
  - hotkey `command.vimEnterCommandMode` exits editor focus shell
- exit path:
  - remove cell from edit set
  - call `focusCell(cellId)`
  - `raf2(() => { scrollCellIntoView(cellId); })`

#### 9.3.1 Cell Action Dropdown Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/actions/useCellActionButton.tsx`
- hook `useCellActionButtons`

Group construction contract:

- the function returns grouped action arrays
- each group is filtered by:
  - `group.filter((action) => !action.hidden)`
- empty groups are removed by:
  - `filter((group) => group.length > 0)`

Guard contract:

- returns `[]` when `!cell`
- returns `[]` when `kioskMode` is truthy

Derived state gates:

- `isSetupCell = cellId === SETUP_CELL_ID`
- run-hidden gate:
  - `status === "running" || status === "queued" || status === "disabled-transitively" || config.disabled`

Exact action group order:

- group 1:
  - `Run cell`
  - `Refactor with AI`
  - `Split`
  - `Format`
  - `Show code` or `Hide code`
  - `Enable execution` or `Disable execution`
- group 2:
  - `Convert to Markdown`
  - `Convert to SQL`
  - `Toggle as Python`
- group 3:
  - `Create cell above`
  - `Create cell below`
  - `Move cell up`
  - `Move cell down`
  - `Move cell left`
  - `Move cell right`
  - `Send to top`
  - `Send to bottom`
  - `Break into new column`
- group 4:
  - `Export output as PNG`
  - `Clear output`
- group 5:
  - `Name`
  - `Copy link to cell`
- group 6:
  - `Delete`

Group 1 item rules:

- `Run cell`
  - icon `PlayIcon`
  - hotkey `cell.run`
  - hidden when the run-hidden gate is true
  - `redundant: true`
- `Refactor with AI`
  - icon `SparklesIcon`
  - hotkey `cell.aiCompletion`
  - hidden when `!aiEnabled`
- `Split`
  - icon `ScissorsIcon`
  - hotkey `cell.splitCell`
- `Format`
  - icon `Code2Icon`
  - hotkey `cell.format`
- code visibility toggle
  - `Hide code` uses icon `EyeOffIcon`
  - `Show code` uses icon `EyeIcon`
  - hotkey `cell.hideCode`
- execution toggle
  - `Disable execution` uses icon `ZapIcon`
  - `Enable execution` uses icon `ZapOffIcon`
  - hidden when `isSetupCell`

Group 2 item rules:

- `Convert to Markdown`
  - icon `MarkdownIcon`
  - hotkey `cell.viewAsMarkdown`
  - hidden when `isSetupCell`
  - source branch also forces `hide_code: true` when code is visible
- `Convert to SQL`
  - icon `DatabaseIcon`
  - hidden when `isSetupCell`
- `Toggle as Python`
  - icon `PythonIcon`
  - hidden when `isSetupCell`

Group 3 item rules:

- `Create cell above`
  - multi icon `MultiIcon(PlusCircleIcon + ChevronUpIcon)`
  - hotkey `cell.createAbove`
  - hidden when `isSetupCell`
  - `redundant: true`
- `Create cell below`
  - multi icon `MultiIcon(PlusCircleIcon + ChevronDownIcon)`
  - hotkey `cell.createBelow`
  - `redundant: true`
- `Move cell up`
  - icon `ChevronUpIcon`
  - hotkey `cell.moveUp`
  - hidden when `isSetupCell`
- `Move cell down`
  - icon `ChevronDownIcon`
  - hotkey `cell.moveDown`
  - hidden when `isSetupCell`
- `Move cell left`
  - icon `ChevronLeftIcon`
  - hotkey `cell.moveLeft`
  - hidden when `appWidth !== "columns" || isSetupCell`
- `Move cell right`
  - icon `ChevronRightIcon`
  - hotkey `cell.moveRight`
  - hidden when `appWidth !== "columns" || isSetupCell`
- `Send to top`
  - icon `ChevronsUpIcon`
  - hotkey `cell.sendToTop`
  - hidden when `isSetupCell`
- `Send to bottom`
  - icon `ChevronsDownIcon`
  - hotkey `cell.sendToBottom`
  - hidden when `isSetupCell`
- `Break into new column`
  - icon `Columns2Icon`
  - hotkey `cell.addColumnBreakpoint`
  - hidden when `appWidth !== "columns" || isSetupCell`

Group 4 item rules:

- `Export output as PNG`
  - icon `ImageIcon`
  - hidden when `!hasOutput`
- `Clear output`
  - icon `XCircleIcon`
  - hidden when `!(hasOutput || hasConsoleOutput)`

Group 5 item rules:

- `Name`
  - icon `TextCursorInputIcon`
  - `disableClick: true`
  - hidden when `isSetupCell`
  - rightElement:
    - inline name input placeholder `cell name`
  - headless modal title:
    - `Rename cell`
  - headless modal label:
    - `Cell name`
- `Copy link to cell`
  - icon `LinkIcon`
  - disabled when `!canLinkToCell(name)`
  - disabled tooltip:
    - `Only named cells can be linked to`
  - success toast:
    - description `Link copied to clipboard`

Group 6 item rules:

- `Delete`
  - icon `Trash2Icon`
  - `variant: "danger"`
  - hidden when `!canDelete`

#### 9.4 Hover Contract

Hover behavior is CSS contract only.

Media gate:

- `@media (hover: hover) and (pointer: fine)`

Hidden-by-default selectors inside that media query:

- `.hover-action`
- `[data-is-dragging=true] .hover-actions-parent.hover-actions-parent .hover-action:not(:hover)`

Both resolve to:

- `display: none !important`

Show conditions:

- `.hover-action:focus`
- `.hover-action:hover`
- `.hover-actions-parent:focus .hover-action`
- `.hover-actions-parent:has([data-state=open]) .hover-action`
- `.hover-actions-parent:hover .hover-action`

Show result:

- `display: inline-flex !important`

#### 9.5 Status Rail

Source:

- `.__marimo_upstream/frontend/src/components/editor/cell/CellStatus.tsx`
- `.__marimo_upstream/frontend/src/components/editor/cell/cell-status.css`

Common classes:

- `.cell-status-icon`
  - `margin-top: 4px`
  - `margin-bottom: auto`
  - `margin-left: 3px`
- `.elapsed-time`
  - `color: var(--gray-11)`
  - `font-family: var(--monospace-font)`
  - `font-size: .75rem`
- `#App.disconnected .elapsed-time`
  - `visibility: hidden`
- `.cell-status-stale`
  - `color: var(--gray-10)`

Required hook:

- `data-testid="cell-status"`

Status DOM variants:

- `disabled`
- `disabled-transitively`
- `running`
- `queued`
- `outdated`
- `idle`

Required `data-status` values:

- `disabled`
- `disabled-transitively`
- `running`
- `queued`
- `outdated`
- `idle`

Tooltip strings:

- `This cell is stale, but it's disabled and can't be run`
- `This cell is disabled`
- `An ancestor of this cell is disabled, so it can't be run`
- `This cell is running`
- `This cell is queued to run`
- `This cell is stale, but an ancestor is disabled so it can't be run`
- `This cell was interrupted when it was last run`
- `This cell has been modified since it was last run`
- `This cell has not been run with the latest inputs`
- `This cell has not yet been run`
- idle and outdated tooltip detail rows include:
  - `This cell took ${elapsed} to run`
- interrupted outdated tooltip detail includes:
  - `This cell ran for ${elapsed} before being interrupted`

Elapsed time format:

- `>= 60s` -> `XmYs`
- `>= 1s` -> `x.toFixed(2)s`
- otherwise -> `Xms`

Status DOM and class contracts:

- stale disabled branch:
  - root class `cell-status-icon cell-status-stale`
  - `data-status="stale"`
  - icon stack:
    - `ban` icon `h-5 w-5`
    - `refresh` icon `h-3 w-3`
- disabled branch:
  - root class `cell-status-icon cell-status-disabled`
  - `data-status="disabled"`
  - icon:
    - `ban` icon `h-5 w-5`
- disabled-transitively branch without stale inputs:
  - root class `cell-status-icon cell-status-stale`
  - `data-status="disabled-transitively"`
  - icon stack:
    - `workflow` icon `h-5 w-5`
    - `ban` icon `h-3 w-3`
- disabled-transitively branch with stale inputs:
  - root class `cell-status-icon cell-status-stale`
  - `data-status="stale"`
  - icon stack:
    - `refresh` icon `h-5 w-5`
    - `ban` icon `h-3 w-3`
- running branch:
  - root class `cell-status-icon elapsed-time running`
  - `data-status="running"`
- queued branch:
  - root class `cell-status-icon cell-status-queued`
  - `data-status="queued"`
  - icon:
    - `ellipsis` icon `h-5 w-5`
- outdated branch:
  - stale icon root:
    - `cell-status-stale`
    - `data-status="outdated"`
  - elapsed badge root:
    - `elapsed-time hover-action`
    - `data-status="outdated"`
  - combined wrapper:
    - `cell-status-icon flex items-center gap-2`
- idle branch:
  - elapsed badge root:
    - `cell-status-icon elapsed-time hover-action`
    - `data-status="idle"`

Last-run time contract:

- source uses `runStartTimestamp ?? lastRunStartTimestamp`
- last-run tooltip starts with:
  - `Ran at`
- same-day timestamp format options:
  - `hour: "numeric"`
  - `minute: "numeric"`
  - `second: "numeric"`
  - `fractionalSecondDigits: 3`
  - `hour12: true`
- non-same-day timestamp format options:
  - `month: "numeric"`
  - `day: "numeric"`
  - `hour: "numeric"`
  - `minute: "numeric"`
  - `second: "numeric"`
  - `fractionalSecondDigits: 3`
  - `hour12: true`
- relative suffix shell:
  - `span.text-muted-foreground`
  - content `(${distance} ago)`

#### 9.6 Console Output Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/output/console/ConsoleOutput.tsx`

Wrapper:

- `relative group`
- auto-scroll effect:
  - when `scrollHeight - clientHeight - scrollTop < 120`, scrolls to bottom after layout

Hover toolbar:

- `absolute top-1 right-4 z-10 opacity-0 group-hover:opacity-100 flex items-center gap-1 print:hidden`

Hover toolbar item order:

- copy console output control
  - component `CopyClipboardIcon`
  - tooltip `Copy console output`
  - class `h-4 w-4`
- wrap text toggle
  - tooltip branch:
    - `Wrap text`
    - `Disable wrap text`
  - control:
    - `ToggleButton`
  - `aria-label: "Toggle text wrapping"`
  - class:
    - `p-1 rounded bg-transparent text-muted-foreground data-hovered:text-foreground data-selected:text-foreground`
  - icon:
    - `WrapTextIcon`
    - `className: "h-4 w-4"`
- collapse or expand button
  - renders only when `isOverflowing || isExpanded` is truthy
  - root primitive:
    - `Button`
  - `size: "xs"`
  - `variant: null`
  - `className: "p-0 mb-px"`
  - `aria-label` branch:
    - `Collapse output`
    - `Expand output`
  - tooltip branch:
    - `Collapse output`
    - `Expand output`
  - collapse icon:
    - `ChevronsDownUpIcon`
    - `className: "h-4 w-4"`
  - expand icon:
    - `ChevronsUpDownIcon`
    - `className: "h-4 w-4 "`

Required hook:

- `data-testid="console-output-area"`

Console area class:

- `console-output-area overflow-hidden rounded-b-lg flex flex-col-reverse w-full gap-1 focus:outline-hidden`

State classes:

- `marimo-output-stale`
- non-empty padding:
  - `p-5`
- empty-ish padding:
  - `p-3`

Rendered output order contract:

- source renders `const reversedOutputs = [...consoleOutputs].reverse()`
- `channel === "pdb"` returns `null`
- `channel === "stdin"` uses interactive prompt branch `StdInput` only when `response == null` and it is the first pending stdin in reversed order
- all other channels render `OutputRenderer`

Root attributes and stale handling:

- root `title` becomes `This console output is stale` when stale
- root `ref = ref`
- root spreads `useSelectAllContent(hasOutputs)` keyboard handler props
  - root `tabIndex = 0`
- expanded style branch:
  - `style = { maxHeight: "none" }` when expanded

Reply badge class:

- `bg-(--slate-4) border-(--slate-4) hover:bg-(--slate-5) dark:border-(--sky-5) dark:bg-(--sky-6) dark:text-(--sky-12) text-(--slate-12) rounded-l rounded-br-lg absolute right-0 bottom-0 text-xs px-1.5 py-0.5 font-mono max-w-[75%] whitespace-nowrap overflow-hidden`

Select-all keyboard helper from `useSelectAllContent(nonEmpty)`:

- active only when console output is non-empty
- `Ctrl/Cmd + A` selects the current console area contents

Interactive stdin prompt contract:

- input testid:
  - `data-testid="console-input"`
- blocking attr:
  - `data-stdin-blocking="true"`
- type branch:
  - `password`
  - `text`
- attrs:
  - `autoComplete: "off"`
  - `autoFocus: true`
- class:
  - `m-0 h-8 focus-visible:shadow-xs-solid`
- placeholder:
  - `stdin`
- key handling:
  - `ArrowUp` -> history up
  - `ArrowDown` -> history down
  - `Enter` without shift -> submit, add to history, clear input
  - `Meta+Enter` -> prevent default and stop propagation

#### 9.7 Output Surface Contract

Source:

- `.__marimo_upstream/frontend/src/components/editor/Output.tsx`
- `.__marimo_upstream/frontend/src/components/editor/output/Outputs.css`

Required token:

- `output-area`

Width contract:

- `.marimo-error`
- `.media`
- `.output`
- `.return`
- `.stderr`
- `.stdout`
  - all `width: 100%`

Published output rhythm:

- `.marimo-cell.published .output-area .output`
  - `margin-top: 1rem`
  - `margin-bottom: 1rem`

Stdout and stderr typography:

- `font-family: var(--monospace-font)`
- `font-size: .813rem`

Error output:

- `color: var(--error)`
- `white-space: pre-wrap`
- `background: #ffc0cb30`
- `border-radius: 20px`
- `padding: 3%`
- `font-size: .8125rem`
- `font-weight: 700`

### 10. Footer Contract

#### 10.0 Footer Item Primitive

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-item.tsx`

Primitive name:

- `FooterItem`

Base class:

- `h-full flex items-center p-2 text-sm shadow-inset font-mono cursor-pointer rounded`

Root element contract:

- component is `forwardRef`
- root element is `div`
- root spreads the remaining props directly onto that `div`

State classes:

- unselected adds:
  - `hover:bg-(--sage-3)`
- selected adds:
  - `bg-(--sage-4)`

Tooltip contract:

- wrapper exists only when `tooltip` prop is present
- tooltip side:
  - `top`
- tooltip delay:
  - `200`

#### 10.1 Footer Shell

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-item.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/runtime-settings.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/ai-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/backend-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/copilot-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/rtc-status.tsx`
- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/machine-stats.tsx`

Footer class:

- `h-10 py-1 gap-1 bg-background flex items-center text-muted-foreground text-md pl-2 pr-1 border-t border-border select-none print:hidden text-sm z-50 hide-on-fullscreen overflow-x-auto overflow-y-hidden scrollbar-thin`

Footer composition:

- developer panel toggle
- runtime reactivity dropdown
- middle spacer `mx-auto`
- optional kernel health button
- optional kiosk label
- right cluster

Exact child order from `footer.tsx`:

- developer panel toggle `FooterItem`
- `RuntimeSettings`
- `div.mx-auto`
- `ConnectingKernelIndicatorItem`
- kiosk label tooltip block
- right cluster `div.flex.items-center.shrink-0.min-w-0`

Keyboard shortcuts registered in footer shell:

- `global.toggleTerminal`
- `global.togglePanel`
- `global.toggleMinimap`

Issue-count derivation:

- `errorsInSidebar = panelLayout.sidebar.includes("errors")`
- `hasConnectionIssue = connectionStatus === "unhealthy" || connectionStatus === "disconnected"`
- `issueCount = (errorsInSidebar ? 0 : errorCount) + (hasConnectionIssue ? 1 : 0)`
- `warningCount` is currently constant `0`

Connecting-kernel gate:

- `ConnectingKernelIndicatorItem` reads:
  - `isConnectingAtom`
- render branch:
  - returns `null` when `isConnecting` is false
  - otherwise returns `BackendConnectionStatus`

#### 10.2 Footer Developer Panel Button

Required testid:

- `data-testid="footer-panel"`

Tooltip text:

- `Toggle developer panel`
- includes shortcut render from `global.togglePanel`

Visual shell:

- wrapper:
  - `h-full`
- inner content:
  - `flex items-center gap-1 h-full`

Inner content contract from `footer.tsx`:

- first icon:
  - `XCircleIcon`
  - class `w-4 h-4 ${count > 0 ? "text-destructive" : ""}`
- first count:
  - `span`
  - value is the computed `issueCount`
  - formula:
    - `(errorsInSidebar ? 0 : errorCount) + (hasConnectionIssue ? 1 : 0)`
- second icon:
  - `AlertTriangleIcon`
  - class `w-4 h-4 ml-1`
- second count:
  - constant `0`

#### 10.3 Footer Runtime Settings

Required testid:

- `data-testid="footer-runtime-settings"`

Trigger shell:

- footer item shell with tooltip `Runtime reactivity`
- popover root:
  - `DropdownMenu`
- trigger wrapper:
  - `DropdownMenuTrigger`
  - `asChild: true`
- icon branch:
  - muted icon when runtime is effectively lazy
  - amber icon otherwise
- effective-lazy predicate:
  - `!runtime.auto_instantiate && runtime.on_cell_change === "lazy" && (isWasm() || runtime.auto_reload !== "autorun")`
- trigger inner wrapper:
  - `flex items-center gap-1`
- muted icon:
  - `ZapOffIcon`
  - `size: 16`
  - `className: "text-muted-foreground"`
- amber icon:
  - `ZapIcon`
  - `size: 16`
  - `className: "text-amber-500"`
- chevron icon:
  - `ChevronDownIcon`
  - `size: 14`

Popover contract:

- `className: "w-64"`
- `align: "start"`
- content primitive:
  - `DropdownMenuContent`
- child order:
  - header block
  - divider
  - `TooltipProvider` wrapping the runtime setting rows and separators

Header:

- wrapper:
  - `DropdownMenuLabel`
  - child `div.flex.items-center.justify-between.w-full`
- title:
  - `Runtime reactivity`
- docs link:
  - `https://links.marimo.app/runtime-configuration`
- docs label:
  - `Docs`
- docs label class:
  - `text-xs font-normal flex items-center gap-1`
- docs icon:
  - `ExternalLinkIcon`
  - `className: "w-3 h-3"`
- divider primitive:
  - `DropdownMenuSeparator`

Setting rows:

- `runtime.auto_instantiate`
  - row name `runtime.auto_instantiate`
  - title `On startup`
  - subtitle `autorun` or `lazy`
  - switch size `sm`
  - leading icon row:
    - `flex items-center space-x-2`
  - title shell:
    - `text-sm font-medium flex items-center gap-1`
  - row wrapper:
    - `flex items-center justify-between px-2 py-2`
  - tooltip:
    - `Whether to automatically run the notebook on startup`
- `runtime.on_cell_change`
  - row name `runtime.on_cell_change`
  - title `On cell change`
  - subtitle `autorun` or `lazy`
  - switch size `sm`
  - leading icon row:
    - `flex items-center space-x-2`
  - title shell:
    - `text-sm font-medium flex items-center gap-1`
  - row wrapper:
    - `flex items-center justify-between px-2 py-2`
  - tooltip:
    - `Whether to automatically run dependent cells after running a cell`
- `runtime.auto_reload`
  - row name `runtime.auto_reload`
  - hidden in notebook app mode
  - title `On module change`
  - subtitle `off`, `lazy`, or `autorun`
  - outer wrapper:
    - `px-2 py-1`
  - heading row:
    - `flex items-center space-x-2 mb-2`
  - title shell:
    - `text-sm font-medium flex items-center gap-1`
  - option list wrapper:
    - `space-y-1`
  - option list button class:
    - `w-full flex items-center px-2 py-1 text-sm rounded hover:bg-accent`
  - selected row adds:
    - `bg-accent`
  - selected option trailing mark:
    - `span.ml-auto`
    - text `✓`
  - tooltip:
    - `Whether to run affected cells, mark them as stale, or do nothing when an external module is updated`

#### 10.4 Footer Middle and Right Cluster

Kiosk label:

- text:
  - `kiosk mode`
- tooltip:
  - `Kiosk mode is enabled. This allows you to view the outputs of the cells without the ability to edit them.`

Right cluster wrapper:

- `flex items-center shrink-0 min-w-0`

Exact right-cluster child order from `footer.tsx`:

- `MachineStats`
- `AIStatusIcon`
- `CopilotStatusIcon`
- `RTCStatus`

Usage stats cluster:

- wrapper:
  - `flex gap-2 items-center px-1`
- polls every `10s` while visible
- refetch state tick:
  - `setNonce((nonce) => nonce + 1)`
- fetch gate:
  - returns `null` when `isWasm()` is true
  - returns `null` when kernel connection state is not `WebSocketState.OPEN`
- shows GPU, memory, and CPU micro-widgets

Shared usage bar primitive:

- wrapper class:
  - `h-3 w-20 bg-(--slate-4) rounded-lg overflow-hidden border`
- fill width:
  - ``style.width = `${percent}%` ``
- every usage widget tooltip uses:
  - `Tooltip`
  - `delayDuration: 200`

GPU widget:

- only renders when `gpu.length > 0`
- testid:
  - `data-testid="gpu-bar"`
- icon:
  - `MicrochipIcon`
  - `className: "w-4 h-4"`
- displayed percent is:
  - `Math.round(sum(gpu.memory.percent) / gpu.length)`
- fill color:
  - `bg-(--grass-9)`
- tooltip wrapper:
  - `flex flex-col gap-1`
- per-GPU line text:
  - `GPU ${index} (${name}): ${used} / ${total} (${percent}%)`

Memory widget:

- testid:
  - `data-testid="memory-usage-bar"`
- icon:
  - `MemoryStickIcon`
  - `className: "w-4 h-4"`
- fill color:
  - `bg-primary`
- percent is rounded with:
  - `Math.round(memory.percent)`
- heading label branch:
  - `container memory:`
  - `computer memory:`
- value formatter:
  - values over `1073741824` bytes render as `${number} GB` with `maximumFractionDigits: 2`
  - smaller values render as `${number} MB` with `maximumFractionDigits: 0`
- total bar text shell:
  - `flex flex-col gap-1`
- tooltip can include:
  - `${used} / ${total} GB (${percent}%)`
  - `marimo server: ${memory}`
  - `kernel: ${memory}`
- `marimo server:` and `kernel:` rows render only when the source memory value exists

CPU widget:

- testid:
  - `data-testid="cpu-bar"`
- icon:
  - `CpuIcon`
  - `className: "w-4 h-4"`
- fill color:
  - `bg-primary`
- tooltip text:
  - `CPU: ${percent}%`

Footer AI button:

- disabled testid:
  - `data-testid="footer-ai-disabled"`
- enabled testid:
  - `data-testid="footer-ai-enabled"`
- default model fallback:
  - `chat_model ?? "openai/gpt-4o"`
  - `edit_model ?? chat_model`
- disabled tooltip:
  - `Assist is disabled`
- enabled tooltip includes:
  - `Chat model:`
  - `Edit model:`
- disabled icon:
  - `SparklesIcon`
  - `className: "h-4 w-4 opacity-60"`
- enabled icon:
  - `SparklesIcon`
  - `className: "h-4 w-4"`
- both branches use:
  - `FooterItem`
  - `selected: false`
  - `onClick -> handleClick("ai")`

Footer Copilot button:

- `data-testid="footer-copilot-status"`
- only renders when completion provider is exactly:
  - `"github"`
- tooltip starts with:
  - `GitHub Copilot:`
- primary status text branch:
  - `Ready`
  - `Not connected`
  - `Processing...`
  - `status.message`
- signed-in initialization path:
  - `useOnMount` acquires `const client = getCopilotClient()`
  - waits for `client.initializePromise`
  - initialize failure branch:
    - `logger.error("Failed to initialize", error)`
    - `client.close()`
    - rethrows into outer `catch`
  - success path then calls:
    - `client.signedIn()`
- local state transitions:
  - signed in -> `signedIn`
  - signed out -> `signedOut`
  - init failure -> `connectionError`
- mount safety:
  - local `mounted` flag blocks post-await writes after unmount
- disabled visual adds:
  - `opacity-60`
- tooltip wrapper:
  - `div.max-w-[200px]`
- tooltip detail branch:
  - `Status: ${kind}`
- warning or error color:
  - `text-(--yellow-11)`
- loading branch:
  - `Spinner`
  - `className: "h-4 w-4"`
- idle icon:
  - `GitHubCopilotIcon`
  - `className: "h-4 w-4"`
- connection error toast:
  - title `GitHub Copilot Connection Error`
  - description line `Failed to connect to GitHub Copilot. Check settings and try again.`
  - error block class `text-sm font-mono whitespace-pre-wrap`
  - action button:
    - variant `link`
    - label `Settings`
- click path:
  - `handleClick("ai")`

Footer RTC button:

- `data-testid="footer-rtc-status"`
- null gate:
  - returns `null` when `!isRtcEnabled()`
  - returns `null` when `connectedDoc === "disabled"`
- tooltip branch:
  - `Real-time collaboration active`
  - `Connecting to real-time collaboration`
- opens username popover
- popover root:
  - `Popover`
  - props:
    - `open={open}`
    - `onOpenChange={setOpen}`
- trigger:
  - `PopoverTrigger`
  - `asChild: true`
- icon:
  - `UsersIcon`
  - `className: "w-4 h-4"`
- popover content:
  - `PopoverContent`
  - `className: "w-80"`
- inner wrapper:
  - `div.space-y-4`
- heading block:
  - `div.space-y-2`
- title:
  - `Username`
- subtitle:
  - `Set your username for real-time collaboration`
- input shell:
  - `Input`
  - `placeholder: "Enter your username"`
  - `autoCapitalize: "off"`
  - `autoComplete: "off"`
  - `autoCorrect: "off"`
  - `onChange={(e) => setUsername(e.target.value)}`
- username popover title:
  - `Username`
- helper text:
  - `Set your username for real-time collaboration`
- trigger icon:
  - `UsersIcon`
  - `className: "w-4 h-4"`
- trigger wrapper:
  - `PopoverTrigger`
  - `asChild: true`
  - child is `FooterItem`
- popover root:
  - `Popover`
- popover card class:
  - `w-80`
- popover body class:
  - `space-y-4`
- heading wrapper class:
  - `space-y-2`
- title class:
  - `font-medium leading-none`
- helper class:
  - `text-sm text-muted-foreground`
- input placeholder:
  - `Enter your username`
- input attrs:
  - `autoCapitalize: "off"`
  - `autoComplete: "off"`
  - `autoCorrect: "off"`
- input change path:
  - `setUsername(event.target.value)`

### 11. Feedback, Health, and Auxiliary UI

#### 11.1 Feedback Dialog

Source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/components/feedback-button.tsx`

Trigger tooltip:

- `Send feedback!`

Trigger wrapper:

- `FeedbackButton` is a `Slot` wrapper
- it reads modal actions from `useImperativeModal()`
- click path:
  - `openModal(<FeedbackModal onClose={closeModal} />)`

Dialog title:

- `Send Feedback`

Dialog shell:

- outer dialog wrapper:
  - `DialogContent`
  - `className: "w-fit"`
- dialog title primitive:
  - `DialogTitle`
- body primitive:
  - `DialogDescription`
- root content is wrapped by:
  - `form`
- submit handler:
  - reads `rating` and `message` from `new FormData(event.target)`
  - POSTs JSON to feedback endpoint
  - calls `onClose()`

Body copy includes:

- `We want to hear from you - from minor bug reports to wishlist features and everything in between.`
- survey link text:
  - `two-minute survey.`
- GitHub link text:
  - `GitHub issue.`
- Discord link text:
  - `Discord.`
- link list wrapper:
  - `ul.list-disc.ml-8.my-2.prose.dark:prose-invert`
- each list item class:
  - `my-0`
- body paragraph classes:
  - `my-2 prose dark:prose-invert`

Submit target:

- `https://marimo.io/api/feedback`
- submit transport is fire-and-forget:
  - `fetch(... )` is not awaited
- current visible body exposes only informational prose and links:
  - no rendered rating control
  - no rendered message textarea
  - submit handler still reads `rating` and `message` from `FormData`

Success toast:

- title:
  - `Feedback sent!`
- description:
  - `Thank you for your feedback!`

#### 11.2 Backend Health and LSP Health

Backend health source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/backend-status.tsx`

Backend health contract:

- polling:
  - `delayMs: 30000`
  - only when `isAppConnected(connection)` is true
  - `whenVisible: true`
- tooltip testid:
  - `data-testid="footer-backend-status"`
- button testid:
  - `data-testid="backend-status"`
- tooltip wrapper:
  - `text-sm whitespace-pre-line`
- tooltip line assembly:
  - disconnected branch:
    - `Not connected to a runtime`
  - connected branch prepends:
    - `startCase(connection.toLowerCase())`
  - health line branch:
    - `✓ Healthy`
    - `✗ Unhealthy`
    - `Health: Unknown`
- error line:
  - `Error: ${error}`
- helper line when connected:
  - `Click to refresh health status`
- button class:
  - `p-1 hover:bg-accent rounded flex items-center gap-1.5 text-xs text-muted-foreground`
- label text:
  - `Kernel`
- click behavior:
  - disconnected branch:
    - `connectToRuntime()`
  - connected branch:
    - `refetch()`
- icon branch:
  - loading or transitional:
    - `Spinner`
    - `size: "small"`
  - destructive transitional:
    - `Spinner`
    - `className: "text-destructive"`
  - connected healthy:
    - `CheckCircle2Icon`
    - `className: "w-4 h-4 text-(--green-9)"`
  - connected unhealthy after a check:
    - `AlertCircleIcon`
    - `className: "w-4 h-4 text-(--yellow-9)"`
  - connected before first health response:
    - `CheckCircle2Icon`
    - `className: "w-4 h-4"`
  - disconnected:
    - `PowerOffIcon`
    - `className: "w-4 h-4"`
  - disconnected error branch:
    - `PowerOffIcon`
    - `className: "w-4 h-4 text-red-500"`

LSP health source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-items/lsp-status.tsx`

LSP health contract:

- polling:
  - `GET /lsp/health`
  - `delayMs: 60000`
  - only when `isAppConnected(connection)` is true
  - `whenVisible: true`
- restart path:
  - `POST /lsp/restart`
- hidden branch:
  - returns `null` when `!data || data.servers.length === 0`
- button testid:
  - `data-testid="lsp-status"`
- tooltip testid:
  - `data-testid="footer-lsp-status"`
- status label text:
  - `LSP`
- tooltip heading:
  - `LSP Status`
- tooltip wrapper:
  - `text-sm`
- server list wrapper:
  - `mt-1 text-xs space-y-1`
- per-server row class:
  - `flex justify-between gap-2`
- per-server status text:
  - `running -> ✓ OK (${lastPingMs.toFixed(0)}ms)` when ping exists, else `✓ OK`
  - `starting -> ⋯ Starting`
  - `stopped -> ✗ Stopped`
  - `crashed -> ✗ Crashed`
  - `unresponsive -> ✗ Not responding`
- per-server status color:
  - `running -> text-(--green-9)`
  - `starting -> text-(--yellow-11)`
  - default error -> `text-(--red-9)`
- helper text when not healthy:
  - `Click to restart failed servers`
- button class:
  - `p-1 hover:bg-accent rounded flex items-center gap-1.5 text-xs text-muted-foreground`
- icon branch:
  - loading -> `Spinner size:"small"`
  - healthy -> `CheckCircle2Icon className:"w-4 h-4 text-(--green-9)"`
  - degraded -> `AlertCircleIcon className:"w-4 h-4 text-(--yellow-11)"`
  - unhealthy -> `AlertCircleIcon className:"w-4 h-4 text-(--yellow-11)"`
- click behavior:
  - only restarts when `status !== "healthy"`
- restart success toast:
  - title `LSP Servers Restarted`
  - description `Restarted: ${list}` or `No servers needed restart`
- restart failure toast:
  - title `LSP Restart Failed`
  - description from `errors` map or caught error message

#### 11.3 Share Static Notebook Dialog

Source:

- `.__marimo_upstream/frontend/src/components/editor/actions/useNotebookActions.tsx`
- `.__marimo_upstream/frontend/src/components/static-html/share-modal.tsx`

Open path:

- notebook menu item `Share -> Publish HTML to web`

Derived URL contract:

- `BASE_URL = "https://static.marimo.app"`
- `randomHash = Math.random().toString(36).slice(2, 6)`
- `path = \`${slug}-${randomHash}\``
- `url = \`${BASE_URL}/static/${path}\``

Dialog contract:

- title:
  - `Share static notebook`
- body copy includes:
  - `You can publish a static, non-interactive version of this notebook to the public web.`
  - `We will create a link for you that lives on`
  - `https://static.marimo.app`
- dialog wrapper class:
  - `w-fit`

Slug field:

- input testid:
  - `data-testid="slug-input"`
- id:
  - `slug`
- placeholder:
  - `Notebook slug`
- attrs:
  - `autoFocus`
  - `required`
  - `autoComplete: "off"`
- input normalization:
  - lowercase
  - strip whitespace
  - strip characters outside `[0-9a-z-]`

URL preview:

- helper text:
  - `Anyone will be able to access your notebook at this URL:`
- preview wrapper:
  - `font-semibold text-sm text-muted-foreground gap-2 flex flex-col`
- preview row:
  - `flex items-center gap-2`
- URL text shell:
  - `span.text-primary`

Copy URL button:

- testid:
  - `data-testid="copy-static-notebook-url-button"`
- button size:
  - `xs`
- button variant:
  - `secondary`
- tooltip content:
  - `Copied!`
- tooltip open gate:
  - `open={copied}`
- copy click wrapper:
  - `Events.stopPropagation(async (e) => { e.preventDefault(); ... })`
- copied-state lifecycle:
  - `setCopied(true)`
  - `setTimeout(() => setCopied(false), 2000)`
- icon:
  - `CopyIcon`
  - `size: 14`
  - `strokeWidth: 1.5`

Dialog actions:

- cancel button:
  - `data-testid="cancel-share-static-notebook-button"`
  - variant `secondary`
  - label `Cancel`
- submit button:
  - `data-testid="share-static-notebook-button"`
  - `aria-label: "Save"`
  - variant `default`
  - type `submit`
  - label `Create`
  - `onClick` pre-copies the computed URL before form submission

Toast contract:

- submit order:
  - `onClose()`
  - `exportAsHTML({ download: false, includeCode: true, files: VirtualFileTracker.INSTANCE.filenames() })`
  - show upload-progress toast
  - `fetch("${BASE_URL}/api/static", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ html, path }) })`
- upload start:
  - title `Uploading static notebook...`
  - description `Please wait.`
- upload error:
  - title `Error uploading static page`
  - description includes GitHub issue link
- source fallthrough note:
  - the `catch()` branch does not abort the handler
  - after an upload error toast, source still dismisses the progress toast and shows the success toast
- upload success:
  - title `Static page uploaded!`
  - description includes:
    - `The URL has been copied to your clipboard.`
    - `You can share it with anyone.`

#### 11.4 Package Alerts and Install Widgets

Source:

- `.__marimo_upstream/frontend/src/components/editor/package-alert.tsx`

Package install CTA:

- button testid:
  - `data-testid="install-packages-button"`
- button primitive:
  - `variant: "outline"`
  - `size: "sm"`
- leading icon:
  - spinner icon `DownloadCloudIcon`
  - `className: "w-4 h-4 mr-2"`
- label shell:
  - `span.font-semibold`
- click path:
  - clears current package alert
  - fills missing version strings with `""`
  - calls `sendInstallMissingPackages({ manager, versions, source })`

Package banner shells:

- outer placement:
  - `flex flex-col gap-4 mb-5 fixed top-5 left-12 min-w-[400px] z-200 opacity-95 max-w-[600px] pointer-events-none`
- package-state card:
  - `flex flex-col rounded pt-3 pb-4 px-5 overflow-auto max-h-[80vh] scrollbar-thin pointer-events-auto`
- failure card variant:
  - `kind: "danger"`
- install or success card variant:
  - `kind: "info"`
- installed state auto-dismiss:
  - `setTimeout(removeBanner, 10000)`

Package banner text states from `getInstallationStatusElements(packages)`:

- installing:
  - title `Installing packages`
  - description `Installing packages:`
- installed:
  - title `All packages installed!`
  - description `Installed packages:`
- failed:
  - title `Some packages failed to install`
  - description `See error logs.`

Per-package list:

- wrapper:
  - `ul.list-disc.ml-2.mt-1`
- item shell:
  - `flex items-center gap-1 font-mono text-sm`
- installing item adds:
  - `font-semibold`
- failed item adds:
  - `text-destructive`
- installed item adds:
  - `text-accent-foreground`
- status icon mapping:
  - `queued -> BoxIcon size:"1rem"`
  - `installing -> DownloadCloudIcon size:"1rem"`
  - `installed -> CheckIcon size:"1rem"`
  - `failed -> XIcon size:"1rem"`

Installation logs accordion:

- hidden when `Object.keys(packageLogs).length === 0`
- toggle button class:
  - `flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors`
- section wrapper:
  - `mt-4 border-t border-border pt-4 w-full`
- open content wrapper:
  - `mt-3 space-y-3 w-full`
- per-package log title:
  - `font-mono text-sm font-medium mb-2 text-foreground`
- log box:
  - `border border-border rounded w-full`
- log pre:
  - `p-3 text-xs font-mono bg-background max-h-64 overflow-y-auto text-muted-foreground whitespace-pre-wrap scrollbar-thin`
- empty log text:
  - `No logs available`

Package extras selector:

- selected extras shell:
  - `hover:bg-muted/50 rounded text-sm px-1 transition-colors border border-muted-foreground/30 hover:border-muted-foreground/60 min-w-0 flex-1 truncate text-left`
- selected extras title attr:
  - ``Selected extras: ${selected.join(", ")}``
- add-extras button class:
  - `hover:bg-muted/50 rounded text-sm ml-2 transition-colors border border-muted-foreground/30 hover:border-muted-foreground/60 h-5 w-5 flex items-center justify-center p-0`
- disabled add-extras state adds:
  - `opacity-50 cursor-not-allowed`
- add-extras title:
  - loaded `Add extras`
  - loading `Loading extras...`
- extras popover class:
  - `w-64 p-0 max-h-96 flex flex-col`
- extras header when no selection yet:
  - `p-2 bg-popover border-b border-border`
  - text `Package extras`
- selected chips wrapper:
  - `flex flex-wrap gap-1 p-1 min-h-[24px]`
- chip class:
  - `inline-flex items-center gap-1 px-1 py-0.5 text-sm font-mono border border-muted-foreground/30 hover:border-muted-foreground/60 rounded-sm cursor-pointer group transition-colors`
- removable chip trailing icon:
  - `XIcon`
  - `className: "w-3 h-3 opacity-60 group-hover:opacity-100"`
- extras list wrapper:
  - `overflow-y-auto flex-1`
- extras item class:
  - `font-mono text-sm`
- filtered extras rule:
  - exclude `/^(dev|test|testing)$/i`

Package version select:

- normal select class:
  - `inline-flex ml-2 w-24 text-ellipsis`
- loading option:
  - `latest`
- success options:
  - `["latest", ...versions.slice(0, 100)]`
- fetch-error tooltip:
  - `Failed to fetch package versions`
- fetch-error fallback:
  - disabled select with only `latest`

### 12. UI Inventory Summary

The marimo edit UI exposed by the traced sources is composed of these visible regions:

- root document shell and portal
- top-level chrome or chrome-hidden render branch
- left sidebar rail with reorderable panel icons, feedback item, and queued or running indicator
- helper sidebar for active sidebar panels
- developer panel with reorderable tabs, backend health, and LSP status
- helper sidebar panel bodies for files, variables/data sources, dependencies, documentation, outline, packages, snippets, and AI
- developer panel bodies for errors, scratchpad, tracing, secrets, logs, terminal, and cache
- filename bar
- notebook banners and stdin waiting banner
- notebook width wrapper and optional column footer creation strip
- top-right utility controls
- notebook menu inventory and nested action trees
- bottom-right run and command controls
- multi-cell selection toolbar and pending-delete confirmation bar
- bottom-center staged delete recovery bar
- command palette overlay
- notebook settings popover and user settings dialog
- shutdown confirm dialog
- save dialog and unsaved recovery dialog
- share static notebook dialog
- feedback dialog
- footer developer, runtime, and status region
- cell surface, cell action dropdown, editor overlay, hover actions, status rail, console, and output surface

#### 12.1 Current State

- root shell, left rail, helper sidebar, developer panel, filename bar, footer, column chrome, banner stack, cell root, editor overlay, hover CSS, status rail, and output contracts have source-backed entries in this PRD
- the PRD source of truth has been shifted from installed `_static` chunks to upstream React or TS source under `.__marimo_upstream/frontend/src/...` wherever those files are now traced
- button primitives, button color variants, resize-handle CSS, filename hover and missing-filename shadows, bottom-right stack order, notebook menu inventory, and cell action dropdown group order are fixed from source
- app config popover, notebook settings form fields, user settings package manager field, share static notebook dialog, notebook menu footer, duplicate prompt, save or recovery filename flows, package install alert widgets, usage stats widgets, backend or LSP health, Copilot or AI or RTC footer states, footer item primitive, and console hover or stdin shell are now documented from upstream source instead of bundle reconstruction
- reorderable rail primitive, feedback modal shell, backend health button class, exact backend or LSP status strings, floating staged delete recovery bar, and command palette overlay shell are now documented from source instead of inferred from screenshots
- helper sidebar `files`, `variables or data sources`, `dependencies`, `documentation`, `outline`, `packages`, `snippets`, and `AI chat or agents` panel bodies are now documented from source instead of inferred from screenshots
- developer panel `errors`, `scratchpad`, `tracing`, `secrets`, `logs`, `terminal`, and `cache` panel bodies are now documented from source instead of inferred from screenshots
- `write-secret-modal`, AI chat message-row and attachment shells, agent notification block registry, connection-change and error cards, plan or thought blocks, resource popovers, and tool-call accordions are now documented from source instead of inferred from screenshots
- dependency graph toolbar, settings popover, node or edge selection panel, minimap relation glyphs, file explorer prompts or delete dialog, duplicate naming, upload toasts, and remote preview metadata shell are now documented from source instead of inferred from screenshots
- selected local file detail lazy body, draft-cache behavior, running-notebook warning banner, local file save hotkey, dependency graph layout atoms, dagre layout config, graph node creation filters, custom node shell, and focused minimap path geometry are now documented from source instead of inferred from screenshots
- visible panel source blocks that still pointed at installed bundle chunks have now been switched to upstream `.__marimo_upstream/frontend/src/...` files across the traced visible edit UI
- recent cleanup also replaced many short bundle helper names in `file explorer`, `remote storage`, `notebook menu`, `controls`, `app config`, `cell action dropdown`, `console output`, `status rail`, and `machine stats` sections with upstream component or helper names
- top-level `EditPage -> AppChrome/EditApp -> LazyCommandPalette` branching, `EditApp` composition, `AppContainer` shell, `AppHeader` disconnected branch, and `CellsRenderer` layout override path are now documented from upstream source instead of bundle aliases
- command palette overlay is now documented beyond shell level, including recents sourcing, hotkey and notebook action flattening, group order, and per-item select behavior
- multi-cell selection toolbar and its pending-delete confirmation bar are now documented from upstream source, including action group order, disabled rules, overflow dropdown, and selection-clear behavior
- column footer `AddCellButtons` is now documented at branch level, including `createNewCell` payloads for Python or Markdown or SQL, the `maybeAddMarimoImport` pre-create side effect, and the AI-disabled redirect path to `handleClick("ai", "ai-providers")`
- footer shell now documents `ConnectingKernelIndicatorItem`, issue-count derivation, `getCopilotClient -> initializePromise -> signedIn()` flow, and RTC username popover structure from upstream source rather than bundle aliases
- feedback dialog now documents its current source reality: informational prose only, fire-and-forget submit transport, and no rendered rating or message controls despite the submit handler reading both keys
- share static notebook dialog now documents URL derivation, copy-button tooltip lifecycle, and the source fallthrough where an upload error toast is followed by the success toast in the same handler
- shutdown and save or recovery flows now document `isWasm()` shutdown hiding, destructive confirm action wiring, delayed `window.close()`, `beforeunload` protection, `format_on_save`, empty-notebook save guard, and the exact serialized save payload keys

#### 12.2 Next Action

- continue sweeping for any remaining terse helper or icon aliases that survived in prose outside the latest source-backed sections, especially any visible widget still described at shell level instead of branch level
- continue turning modal shells, popover content, and block-level renderer branches into upstream-file-backed PRD entries until no visible marimo surface remains only inventory-level documented
- keep the PRD source-backed and docs-only for now; implementation port starts only after visible marimo frontend coverage is complete
- after PRD completion, port each contract into Codaro Svelte without vendor import fallback

#### 12.3 Verification Left

- confirm the `showChrome=false` branch still mounts the notebook page and command palette in the documented order
- confirm each PRD section source block points to upstream React or TS files when upstream exists, not to installed bundle chunks
- confirm Codaro implementation uses the same split between notebook action buttons and text buttons
- confirm filename bar hover, stale shadow, and rounded radius match these tokens exactly
- confirm top-right row, notebook menu nested dropdowns, and bottom-right stack use the documented ownership split and state colors
- confirm the floating staged delete recovery bar matches source wrapper tokens, count text, and accept or reject button shells
- confirm the multi-cell selection toolbar matches source overlay class, primary action group order, overflow dropdown rows, and pending-delete confirmation flow
- confirm the command palette overlay matches source dialog shell, cmdk attributes, group headings, and placeholder or empty strings
- confirm the column footer add-cell strip matches source wrapper, hover reveal gate, button token, `createNewCell` payloads, AI tooltip, and `AddCellWithAI` open branch
- confirm helper sidebar `files`, `variables or data sources`, `dependencies`, `documentation`, `outline`, `packages`, `snippets`, and `AI` panel bodies match the documented section shells, toolbar buttons, search placeholders, empty states, and split layouts
- confirm helper sidebar `files` body also matches prompt titles, delete dialog copy, duplicate naming rule, upload toasts, drag or drop rules, and remote preview metadata layout
- confirm helper sidebar `files` body also matches selected local file detail lazy body, draft cache, warning banner, editability gates, and save hotkey behavior
- confirm helper sidebar `dependencies` body also matches graph node creation filters, custom node shell, graph toolbar orientation buttons, settings popover toggles, dagre layout defaults, minimap glyph shifts, focused-row path geometry, node or edge selection panels, and focus-jump behavior
- confirm helper sidebar `AI` bodies also match the documented message-row alignment, mode option subtitles, attachment shells, and retry or stop branches
- confirm developer panel `errors`, `scratchpad`, `tracing`, `secrets`, `logs`, `terminal`, and `cache` panel bodies match the documented empty states, toolbars, split shells, and action labels
- confirm `Add Secret` modal matches the documented field labels, placeholder strings, warning text, button states, and toast copy
- confirm agent notification blocks match the documented registry mapping, `data-block-type` values, connection status colors, plan checklist rows, tool-call accordion states, and resource or diff shells
- confirm cell action dropdown group order, rename dialog, and copy-link disabled branch match source
- confirm notebook menu footer locale/version rows and duplicate prompt match source strings and gating
- confirm save dialog and recovery dialog use the same filename derivation, disabled gates, and Escape handling
- confirm save button uses the same connected versus disconnected tooltip wrapper, persistent filename gate, and temp-path branching
- confirm usage stats, backend health, LSP health, Copilot footer states, and RTC username popover use the documented tooltip, icon, gate, and click branches
- confirm console hover toolbar, wrap toggle, collapse button, stale title, and stdin prompt use the documented shell and key handling
- after implementation changes, run build verification and then compare DOM contracts section by section

### 13. Acceptance Criteria

The implementation can only be called `marimo 1:1` when all of the following are true:

- root head tags, preload links, hidden mount tags, and portal structure match source.
- `#root`, `#app`, `#App`, `#portal`, `#app-chrome-sidebar`, and `#app-chrome-panel` match source hierarchy.
- left rail, helper sidebar, developer panel, filename bar, floating controls, footer, and cell wrapper all use source-backed class tokens and IDs.
- utility tokens such as `rounded-md`, `rounded`, `border`, `text-xs`, `text-sm`, `shadow-xs-solid`, and hover selectors resolve exactly as documented here.
- sidebar and developer panel registries match source panel inventory and drag behavior.
- settings popover, user settings dialog, feedback dialog, save dialog, recovery dialog, and shutdown dialog all expose the same strings and hooks.
- notebook menu top-level order, nested dropdown inventories, share-static dialog, and cell action dropdown match the documented source-backed branches.
- top-right utility row contains only the source-owned controls for that row, and the bottom-right stack owns save, preview, command palette, and run controls with the documented state branches and `data-testid` hooks.
- the floating staged delete recovery bar and command palette overlay use the documented mount order, classes, labels, and button primitives.
- multi-cell selection toolbar and pending-delete confirmation bar reproduce the documented group order, disabled rules, overlay shells, and destructive confirmation behavior.
- column footer add-cell strip reproduces the documented reveal gate, text-button token, button order, create payloads, AI tooltip copy, and open-AI replacement branch.
- footer runtime settings reproduces the same rows, labels, toggles, and visibility rules.
- cell read branch and edit branch child order match source exactly.
- editor overlay, hover rules, status rail, console output, and output surface follow source tokens exactly.
- no wrapper, padding rule, hover rule, button mapping, or dialog branch exists without source support.

### 14. Verification Checklist

- [ ] `index.html` meta tags, preload assets, hidden mount tags, mount config, and portal have been reproduced exactly.
- [ ] `body -> #root -> .contents -> chrome -> #app -> #App` hierarchy matches the captured DOM.
- [ ] top-level `showChrome=false` branch reproduces `EditApp(hideControls=true)` plus `LazyCommandPalette` sibling mounting without the chrome wrapper.
- [ ] left rail wrapper, sidebar item shell, feedback item, and queued or running indicator match source.
- [ ] helper sidebar id, testid, resize behavior, header, and special `Dependencies` and `AI` header branches match source.
- [ ] helper sidebar `files` panel body matches source top-level branches, toolbar order, testids, drag overlay, tree row menu inventory, and remote storage shells.
- [ ] helper sidebar `files` panel body matches source prompt titles, delete dialog copy, duplicate naming rule, upload toasts, drag or drop gates, and remote preview metadata shell.
- [ ] helper sidebar `variables` or `data sources` panel matches source accordion sections, search bars, empty states, variable table columns, and add-table affordances.
- [ ] helper sidebar `dependencies` panel matches source minimap and graph branch shells, minimap row button classes, graph fit-view overlay, and `Jump to focused cell` affordance.
- [ ] helper sidebar `dependencies` panel matches source graph toolbar, settings toggles, selection panel shells, minimap relation glyph shifts, and focus-on-double-click behavior.
- [ ] helper sidebar `documentation`, `outline`, `packages`, and `snippets` panels match source empty states, search or split layouts, header or toolbar shells, and action labels.
- [ ] helper sidebar `AI` panel matches source `chat` and `agents` bodies, header rows, history popover, prompt shells, mode selectors, message-row alignment, attachment shells, loading states, stop or retry controls, and agent notification blocks.
- [ ] developer panel id, testid, resize behavior, reorderable tabs, backend health, and LSP health match source.
- [ ] developer panel `errors`, `scratchpad`, `tracing`, `secrets`, `logs`, `terminal`, and `cache` bodies match source empty states, toolbars, split layouts, action strings, and the `Add Secret` modal contract.
- [ ] filename bar shell, cmdk root, list wrapper, input row, input class, hover shadow, and input testids match source.
- [ ] banner stack and stdin waiting banner match source strings and placement.
- [ ] column footer creation strip reproduces the reveal gate, `Python`, `Markdown`, `SQL`, and `Generate with AI` button order, wrapper tokens, `createNewCell` payloads, AI tooltip copy, and `AddCellWithAI` open branch.
- [ ] top-right utility row reproduces the connected-state row ownership, wrapper tokens, and config or menu or shutdown controls without placing save there.
- [ ] notebook menu dropdown reproduces `Actions` tooltip, helper row, `notebook-menu-dropdown-${label}` testid pattern, `w-[240px]` end-aligned popover, and the documented top-level and nested menu inventory.
- [ ] notebook menu dropdown reproduces `modal: false`, `DropdownMenuTrigger asChild={true}`, locale/version footer rows, and the duplicate-notebook prompt contract.
- [ ] bottom-right stack reproduces save, preview, command palette, `KeyboardShortcuts`, spacer, undo delete, run, and interrupt branches in the documented order.
- [ ] shutdown button matches source `isWasm()` hidden gate, tooltip wrapper, destructive confirm action, `Confirm Shutdown` aria-label, and delayed `window.close()` shutdown path.
- [ ] multi-cell selection toolbar reproduces the overlay shell, selected-count label, primary action groups, overflow dropdown rows, selection-clear listener, and pending-delete confirmation bar.
- [ ] floating staged delete recovery bar reproduces the center-bottom wrapper, pending counter, ghost up or down buttons, divider, and accept or reject controls.
- [ ] notebook action button primitive and text button primitive match their source class contracts and color variants.
- [ ] command palette overlay matches the source dialog wrapper, command root class, input wrapper, list or group shells, empty state, and `cmdk-*` attribute contract.
- [ ] footer item primitive matches `FooterItem` base class, selected state, top-side tooltip behavior, and forwarded-ref `div` root contract.
- [ ] notebook settings popover and user settings dialog match source sections, strings, testids, field shells, and popover footer link.
- [ ] user settings package manager select, package install CTA, package banners, extras popover, version select, and installation logs match source shells and strings.
- [ ] reorderable sidebar or developer-panel primitives, cross-list payloads, empty slots, and picker wrappers match source.
- [ ] save dialog and recovery dialog match source titles, helper text, and button testids.
- [ ] save dialog and recovery dialog match source filename derivation, disabled gates, `Escape` close handling, `${proposedName}.json` download naming, `beforeunload` warning, and `format_on_save` pre-save path.
- [ ] save button matches source tooltip wrapper, `ControlButton` or `EditorButton` trigger primitive, connected or disconnected branch ownership, and temp-path persistence gate.
- [ ] share static notebook dialog matches source strings, testids, URL derivation, copy-button tooltip lifecycle, URL pre-copy click path, and toast fallthrough behavior.
- [ ] feedback dialog matches source copy, `Slot` trigger behavior, fire-and-forget submit transport, success toast, and the current no-input body contract.
- [ ] footer shell, developer toggle, runtime settings, kiosk label, usage stats, AI, Copilot, and RTC regions match source composition.
- [ ] GPU, memory, and CPU footer widgets match source testids, tooltip strings, and shared bar primitive.
- [ ] backend health and LSP health match source polling intervals, tooltip strings, icon branches, and click behavior.
- [ ] Copilot footer state matches source `getCopilotClient -> initializePromise -> signedIn()` flow, primary status text, warning color branch, and connection error toast contract.
- [ ] RTC footer state matches source null gates, tooltip strings, popover shell, username heading copy, and input attributes.
- [ ] `cellDomProps(cellId, cellName)` attributes and `VerticalCell` root classes and read and edit render branches match source.
- [ ] cell action dropdown matches source group order, hidden and disabled rules, rename modal branch, and copy-link branch.
- [ ] editor root, language toggle overlay, selection ring, and theme values match source.
- [ ] hover action show and hide selectors match source CSS conditions.
- [ ] status rail states and tooltip strings match source.
- [ ] console output wrapper, hover toolbar, stale title, stdin prompt, and badge tokens match source.
- [ ] `.output-area`, `.stdout`, `.stderr`, `.return`, `.output`, and `.marimo-error` contracts match source.
- [ ] there are no guessed DOM nodes, guessed spacing values, or guessed state mappings left in the implementation.

### 15. Perfect Copy Plan

#### 15.1 Source Lock

- freeze parity work to the traced marimo assets listed in section `3`
- do not import marimo runtime or CSS into Codaro as implementation
- only recreate wrappers, class tokens, strings, ids, `data-testid`, and branch gates that are confirmed in those assets
- if a token or wrapper is not found in source, it is excluded until traced

#### 15.2 Shell Copy Order

Copy shell in this exact order so ownership boundaries do not blur:

1. `index.html` head tags, preload links, hidden mount tags, `window.__MARIMO_MOUNT_CONFIG__`, and `#portal`
2. `body -> #root -> .contents -> #app-chrome-body -> #app -> #App`
3. left rail and helper sidebar
4. developer panel and resize handles
5. filename bar and notebook width wrapper
6. top-right utility stack
7. bottom-right floating stack
8. footer shell and footer item primitive
9. notebook settings, save, recovery, shutdown, and feedback dialogs

#### 15.3 Cell Copy Order

Copy cells in this exact order so `VerticalCell` parity is not flattened:

1. `cellDomProps(cellId, cellName)` attribute helper
2. `marimo-cell` root class composition
3. read or kiosk branch gate
4. read branch child order `output above -> tray -> output below -> console`
5. `shouldHideCode(code, output)` hide helper
6. edit branch early-null gate
7. edit branch output surface
8. editor root and language toggle overlay
9. hover CSS gate and status rail
10. console output area and output surface tokens

#### 15.4 Primitive Rebuild Order

Rebuild the reusable primitives before wiring notebook pages:

1. notebook action button primitive from `.__marimo_upstream/frontend/src/components/editor/inputs/Inputs.tsx` and `Inputs.styles.ts`
2. text button primitive from `.__marimo_upstream/frontend/src/components/ui/button.tsx`
3. sidebar item primitive from `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/sidebar.tsx`
4. footer item primitive from `.__marimo_upstream/frontend/src/components/editor/chrome/wrapper/footer-item.tsx`
5. filename input shell from `.__marimo_upstream/frontend/src/components/editor/header/filename-input.css`
6. notebook menu dropdown trigger and popover
7. app config and shutdown circle buttons
8. helper and developer resize handles

#### 15.5 Verification Gates

Parity cannot be claimed until all gates pass:

1. DOM gate
   - wrapper hierarchy, child order, ids, and `data-testid` match this PRD
2. token gate
   - class tokens, utility tokens, and color variants match traced source
3. branch gate
   - read/edit/kiosk/disconnected/disabled branches match traced source boundaries
4. primitive gate
   - sidebar, footer, action button, text button, filename, and resize handle primitives are source-backed
5. implementation gate
   - no vendor import fallback and no guessed wrapper remain in Codaro
6. build gate
   - frontend build passes after parity changes
