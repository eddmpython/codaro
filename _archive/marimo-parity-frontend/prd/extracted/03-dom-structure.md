# Marimo DOM Structure Extraction

Source: `.venv/Lib/site-packages/marimo/_static/` built bundles.
Files analyzed:
- `index.html` (entry point)
- `assets/index-CV-Vv3LK.js` (root mount, plugins, virtuoso)
- `assets/cells-wT6clfi5.js` (cell state, sidebar state, panel layout, cell focus)
- `assets/main-DrBRErTM.js` (markdown, filename, code theme)
- `assets/cell-editor-CSaoLcvI.js` (CodeMirror, AI input, language toggle)
- `assets/edit-page-CTVRcSta.js` (full edit-mode page: cell rendering, footer, sidebar, panels, controls)
- `assets/run-page-lC8nyJai.js` (run/app mode page)
- `assets/context-aware-panel-DScGcWey.js` (helper/developer panel)
- `assets/index-CVpJvEAO.css`, `assets/cells-jmgGt1lS.css`, `assets/cell-editor-Iey559K_.css`, `assets/layout-BjXzDXoG.css`

---

## A. Root / HTML Shell

### index.html structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Preload images (needed when disconnected) -->
  <link rel="preload" href="./assets/gradient-yHQUC_QB.png" as="image" />
  <link rel="preload" href="./assets/noise-60BoTA8O.png" as="image" />

  <!-- Preload fonts -->
  <link rel="preload" href="./assets/Lora-VariableFont_wght-B2ootaw-.ttf" as="font" crossorigin="anonymous" />
  <link rel="preload" href="./assets/PTSans-Regular-CxL0S8W7.ttf" as="font" crossorigin="anonymous" />
  <link rel="preload" href="./assets/PTSans-Bold-D9fedIX3.ttf" as="font" crossorigin="anonymous" />
  <link rel="preload" href="./assets/FiraMono-Regular-BTCkDNvf.ttf" as="font" crossorigin="anonymous" />
  <link rel="preload" href="./assets/FiraMono-Medium-DU3aDxX5.ttf" as="font" crossorigin="anonymous" />
  <link rel="preload" href="./assets/FiraMono-Bold-CLVRCuM9.ttf" as="font" crossorigin="anonymous" />

  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="a marimo app" />
  <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
  <link rel="manifest" href="./manifest.json" />

  <!-- Server-injected meta tags -->
  <marimo-filename hidden>{{ filename }}</marimo-filename>
  <marimo-version data-version="{{ version }}" hidden></marimo-version>
  <marimo-user-config data-config="{{ user_config }}" hidden></marimo-user-config>
  <marimo-server-token data-token="{{ server_token }}" hidden></marimo-server-token>

  <title>{{ title }}</title>

  <!-- CSS load order -->
  <link rel="stylesheet" href="./assets/cells-jmgGt1lS.css">
  <link rel="stylesheet" href="./assets/markdown-renderer-DdDKmWlR.css">
  <link rel="stylesheet" href="./assets/JsonOutput-B7vuddcd.css">
  <link rel="stylesheet" href="./assets/index-CVpJvEAO.css">
</head>
<body>
  <div id="root"></div>
  <div id="portal" data-testid="glide-portal"
       style="position: fixed; left: 0; top: 0; z-index: 9999"></div>
  <script data-marimo="true">
    window.__MARIMO_MOUNT_CONFIG__ = '{{ mount_config }}';
  </script>
</body>
</html>
```

### DOM mount points

| Selector | Source | Purpose |
|---|---|---|
| `getElementById("root")` | index JS | React root mount |
| `getElementById("App")` | cells JS | Main app container after React renders |
| `querySelector("#App")` | cell-editor JS | App-level queries |
| `querySelector("marimo-filename")` | cells JS | Read notebook filename |
| `querySelector("head > title")` | cells JS | Update page title |
| `getElementById("portal")` | index.html | Data editor portal overlay |

### Root hierarchy

```
body
  #root                    (React root)
    #App                   (main app container, classes vary by mode)
      [layout content]     (edit-page or run-page)
  #portal                  (data-testid="glide-portal", fixed z-9999)
```

### #App CSS states

- `#App` -- `z-index:1; flex:1; margin:auto; position:relative;`
- `#App.disconnected` -- makes cells/gutters/outputs transparent
- `#App.grid-bordered` -- `background-color: var(--slate-1)` (grid layout mode)
- `body.printing #App` -- `height: fit-content !important`

---

## B. Custom HTML Elements (marimo-*)

### Server-injected meta elements (in `<head>`)

| Tag | Attribute | Purpose |
|---|---|---|
| `<marimo-filename>` | text content | Current notebook filename |
| `<marimo-version>` | `data-version` | Server version |
| `<marimo-user-config>` | `data-config` | User config JSON |
| `<marimo-server-token>` | `data-token` | Session token |

### UI/plugin custom elements (from index JS)

Full list of registered `marimo-*` custom elements:

```
marimo-accordion       marimo-anywidget       marimo-button
marimo-callout-output  marimo-carousel        marimo-chatbot
marimo-checkbox        marimo-code-editor     marimo-data-editor
marimo-data-explorer   marimo-dataframe       marimo-date
marimo-date-range      marimo-datetime        marimo-dict
marimo-download        marimo-dropdown        marimo-error
marimo-file            marimo-file-browser    marimo-form
marimo-image-comparison marimo-json-output    marimo-lazy
marimo-matplotlib      marimo-matrix          marimo-mermaid
marimo-microphone      marimo-mime-renderer   marimo-mpl-interactive
marimo-multiselect     marimo-nav-menu        marimo-number
marimo-outline         marimo-panel           marimo-plotly
marimo-progress        marimo-radio           marimo-range-slider
marimo-refresh         marimo-routes          marimo-sidebar
marimo-slider          marimo-stat            marimo-switch
marimo-table           marimo-tabs            marimo-team
marimo-tex             marimo-text            marimo-text-area
marimo-ui-element      marimo-vega
```

### Cell-related custom elements (from cells/cell-editor JS)

```
marimo-cell            (used as CSS class, not as HTML element)
marimo-import          (import tracking)
```

---

## C. data-testid Values

### Edit page (edit-page-CTVRcSta.js)

```
backend-status                  cell-actions-button
cell-column                     close-find-replace-button
close-helper-pane               column-container
column-drag-spacer              command-palette-button
cpu-bar                         create-cell-button
drag-button                     filename-input
find-input                      find-next-button
find-prev-button                footer-ai-disabled
footer-ai-enabled               footer-backend-status
footer-copilot-status           footer-lsp-status
footer-panel                    footer-rtc-status
footer-runtime-settings         gpu-bar
helper                          hide-code-button
install-package-manager-select  install-packages-button
interrupt-button                loadMoreSentinel
lsp-status                      memory-usage-bar
notebook-menu-dropdown          panel
remove-banner-button            remove-startup-logs-button
replace-all-button              replace-input
replace-next-button             restart-session-button
run-button                      undo-delete-cell
undo-replace-all-button
notebook-menu-dropdown-${label}  (dynamic per menu item)
```

### Index JS (plugins)

```
underlay                            hidden-dateinput-container
marimo-plugin-button                marimo-plugin-checkbox
track                               range
thumb                               virtuoso-scroller
virtuoso-item-list                  virtuoso-top-item-list
selection-panel-search-input        marimo-plugin-searchable-dropdown
marimo-plugin-dropdown              marimo-plugin-data-frames-column-select
marimo-plugin-data-frames-filter-operator-select
marimo-plugin-data-frames-add-transform
marimo-plugin-data-frames-apply     marimo-plugin-file-upload-button
marimo-plugin-form-clear-button     marimo-plugin-form-submit-button
marimo-plugin-matrix                matrix-cell-${index}
audio-recorder-start                audio-recorder-pause
marimo-plugin-number-input          marimo-plugin-radio
```

### Cell editor JS

```
dir-completion-input               cancel-recovery-button
download-recovery-button           save-button
cancel-save-dialog-button          submit-save-dialog-button
include-other-cells-checkbox       decline-completion-button
language-toggle-button             cell-editor
```

### Run page JS

```
copy-static-notebook-dialog-button
download-static-notebook-dialog-button
static-notebook-banner
static-notebook-dialog-trigger
watermark
```

---

## D. data-* Attribute Assignments

### Cells JS

| Attribute | Purpose |
|---|---|
| `data-cell-id` | Cell identifier on cell wrapper (`Bh = "data-cell-id"`) |
| `data-for-cell-id` | References from output back to owning cell (`qh = "data-for-cell-id"`) |
| `data-state` | Generic state attribute |
| `data-disabled` | Disabled state |
| `data-precedence` | CSS stylesheet precedence |
| `data-href` | Style sheet reference |
| `data-temp-href-target` | Temporary href targets |

### Cell editor JS

| Attribute | Purpose |
|---|---|
| `data-ai-input-open` | Whether AI input panel is open (affects editor border radius) |
| `data-selected` | Selection state |
| `data-testid` | Test identifiers |

### Edit page JS (from JSX)

| Attribute | Purpose |
|---|---|
| `data-status` | Cell execution status on cell root |
| `data-has-output-above` | Whether output renders above the editor |
| `data-hidden` | Whether the tray/editor is hidden |
| `data-setup-cell` | Marks setup cells |
| `data-is-dragging` | Drag state (affects hover actions visibility) |

### Index JS (general)

```
data-active              data-disabled          data-entering
data-exiting             data-focus-visible     data-focus-within
data-focused             data-hovered           data-index
data-invalid             data-item-group-index  data-item-index
data-known-size          data-motion            data-open
data-orientation         data-outside-month     data-outside-visible-range
data-placeholder         data-placement         data-pressed
data-radix-toast-*       data-react-aria-prevent-focus
data-readonly            data-required          data-root-id
data-selected            data-selection-end     data-selection-start
data-state               data-status            data-style
data-swipe               data-swipe-direction   data-today
data-trigger             data-type              data-unavailable
data-viewport-type       data-virtuoso-scroller
```

---

## E. Cell DOM Hierarchy (Edit Mode)

### Cell ID scheme

```javascript
En = {
  create(cellId)    { return `cell-${cellId}` },
  parse(elementId)  { return elementId.slice(5) },
  findElement(el)   { return el.closest('div[id^="cell-"]') }
}
```

### SortableCell (Il) wrapper

The outermost cell wrapper is `SortableCell` (aliased as `Il`), using dnd-kit:

```
<SortableCell                       // Il component
  tabIndex={-1}
  ref={m}
  data-status={runtime.status}      // "running" | "queued" | "idle" | etc
  cellId={cellId}
  canMoveX={boolean}
  title={tooltipText}
>
```

### Cell inner structure (interactive edit mode)

```html
<!-- SortableCell wrapper (Il) -->
<div tabIndex={-1}
     data-status="..."
     id="cell-{cellId}">

  <!-- Inner cell div with marimo-cell class -->
  <div tabIndex={-1}
       class="marimo-cell hover-actions-parent z-10 interactive
              [needs-run] [has-error] [stopped] [disabled] [stale] [borderless]
              focus:ring-1 focus:ring-(--slate-8) focus:ring-offset-2"
       data-cell-id="{cellId}"
       ref={dragRef}>

    <!-- Collapse button (for output-above mode) -->
    <AlignmentGuide cellId={cellId} />

    <!-- Output above (if outputArea === "above") -->
    <ExpandableOutput ... />  <!-- or markdown double-click-to-edit div -->

    <!-- Tray: contains editor + controls -->
    <div class="tray"
         data-has-output-above={boolean}
         data-hidden={boolean}>

      <!-- AI input/name indicator -->
      <CellNameIndicator cellId={cellId} />

      <!-- Cell action buttons (hover overlay, top-right) -->
      <div class="absolute right-2 -top-4 z-10">
        <CellActionsDropdown
          data-testid="cell-actions-button"
          edited, status, cellConfig, needsRun, hasOutput, ...
        />
      </div>

      <!-- Code editor (Ws component) -->
      <CellEditor
        data-testid="cell-editor"
        theme, showPlaceholder, id, code, config, status,
        serializedEditorState, runCell, setEditorView, userConfig,
        hidden, hasOutput, showHiddenCode, languageAdapter, outputArea
      />

      <!-- Cell status (shoulder-right position) -->
      <CellStatus
        class="shoulder-right z-20 ..."
        edited, status, isCellStatusInline, uninstantiated, disabled,
        runElapsedTimeMs, runStartTimestamp, staleInputs, interrupted
      />

      <!-- Add-cell button at bottom (shoulder-bottom) -->
      <div class="shoulder-bottom hover-action">
        <RunButton ... />
      </div>
    </div>

    <!-- Console output collapse bar -->
    <ConsoleOutputBar cellId={cellId} hide={errored && !flag} />

    <!-- Output below (if outputArea === "below") -->
    <ExpandableOutput ... />  <!-- or markdown double-click-to-edit div -->

    <!-- Serialization/reusable badge -->
    <div class="py-1 px-2 flex items-center justify-end gap-2 last:rounded-b">
      ...
    </div>

    <!-- Console outputs -->
    <ConsoleOutputs consoleOutputs, stale, cellName, ... />

    <!-- Cell link/dependency indicator -->
    <CellLink cellId={cellId} />
  </div>

  <!-- Expand collapsed cells indicator -->
  <ExpandButton ... />
</div>
```

### Cell class states (CSS from index-CVpJvEAO.css)

| Class | Meaning |
|---|---|
| `.marimo-cell` | Base cell: `border: 1px solid var(--gray-4); border-radius: 10px; width: 100%; position: relative` |
| `.marimo-cell.interactive` | Edit mode cell: output max-height 610px, focus shadow, first/last child border radius 9px |
| `.marimo-cell.published` | Run/app mode: no border, no shadow, output overflow visible |
| `.marimo-cell.borderless` | Markdown with output: transparent border |
| `.marimo-cell.needs-run` | Stale: `border-color: var(--stale); outline-color: var(--stale)` |
| `.marimo-cell.has-error` | Error: `border-color: var(--error); outline-color: var(--error)` |
| `.marimo-cell.error-outline` | Error outline variant |
| `.marimo-cell.stopped` | Execution stopped |
| `.marimo-cell.stale` | Transitively disabled: grayscale + opacity |
| `.marimo-cell.disabled` | Disabled: `background-color: var(--gray-1); opacity: .5` |
| `.marimo-cell.is-moving` | During drag |

### Tray CSS

```css
.tray {
  z-index: 1;
  display: flex;
  position: relative;
}
.tray[data-has-output-above=false] .cm-editor {
  border-top-left-radius: 9px;
  border-top-right-radius: 9px;
}
.tray div[data-ai-input-open=true] .cm-editor {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.tray:last-child .cm-editor {
  border-bottom-right-radius: 9px;
  border-bottom-left-radius: 9px;
}
/* Gutter pseudo-elements */
.tray:after, .tray:before {
  content: "";
  height: 100%;
  max-width: var(--gutter-width);
  width: var(--gutter-width);
  position: absolute;
}
.tray:before { left: calc(var(--gutter-width) * -1); }
.tray:after  { right: calc(var(--gutter-width) * -1); }
```

### Output area CSS

```css
.output-area {
  clear: both;
  max-width: inherit;
  width: 100%;
  padding: 1rem;
  display: flow-root;
  overflow: auto;
}
```

### Hover actions CSS

```css
/* Hover actions hidden by default on hover-capable devices */
@media (hover: hover) and (pointer: fine) {
  .hover-action,
  [data-is-dragging=true] .hover-actions-parent.hover-actions-parent .hover-action:not(:hover) {
    display: none !important;
  }
}

/* Shown on parent hover/focus/state-open */
.hover-action:focus,
.hover-action:hover,
.hover-actions-parent:focus .hover-action,
.hover-actions-parent:has([data-state=open]) .hover-action,
.hover-actions-parent:hover .hover-action {
  display: inline-flex !important;
}
```

### Shoulder positions

```css
.shoulder-bottom { /* hover-action class, add-cell button */ }
.shoulder-right  { /* z-20, cell status indicator */ }
.shoulder-button { /* individual action buttons in shoulder areas */ }
```

---

## F. Sidebar / Panel State Machine

### Panel types and default sections

```javascript
// Sidebar panels (left)
{ type: "files",          Icon: FolderTree,    label: "Files",          defaultSection: "sidebar" }
{ type: "variables",      Icon: Variable,      label: "Variables",      defaultSection: "sidebar" }
{ type: "packages",       Icon: Box,           label: "Packages",       defaultSection: "sidebar" }
{ type: "ai",             Icon: Bot,           label: "AI",             defaultSection: "sidebar" }
{ type: "outline",        Icon: ScrollText,    label: "Outline",        defaultSection: "sidebar" }
{ type: "documentation",  Icon: TextSearch,    label: "Docs",           defaultSection: "sidebar" }
{ type: "dependencies",   Icon: Network,       label: "Dependencies",   defaultSection: "sidebar" }

// Developer panel panels (right/bottom)
{ type: "errors",         Icon: CircleX,       label: "Errors",         defaultSection: "developer-panel" }
{ type: "scratchpad",     Icon: NotebookPen,   label: "Scratchpad",     defaultSection: "developer-panel" }
{ type: "tracing",        Icon: Activity,       label: "Tracing",        defaultSection: "developer-panel" }
{ type: "secrets",        Icon: KeyRound,      label: "Secrets",        defaultSection: "developer-panel" }
{ type: "logs",           Icon: FileText,      label: "Logs",           defaultSection: "developer-panel" }
{ type: "terminal",       Icon: SquareTerminal, label: "Terminal",      defaultSection: "developer-panel" }
{ type: "snippets",       Icon: SquareDashedCode, label: "Snippets",   defaultSection: "developer-panel" }
{ type: "cache",          Icon: DatabaseZap,   label: "Cache",          defaultSection: "developer-panel" }
```

### Sidebar state (persisted to localStorage as "marimo:sidebar")

```javascript
{
  selectedPanel: "variables",           // currently active sidebar tab
  isSidebarOpen: false,                 // sidebar visibility
  isDeveloperPanelOpen: false,          // developer panel visibility
  selectedDeveloperPanelTab: "errors"   // currently active developer panel tab
}
```

### Panel layout (persisted as "marimo:panel-layout")

```javascript
{
  sidebar: ["files", "variables", "packages", "ai", "outline", "documentation", "dependencies"],
  developerPanel: ["errors", "scratchpad", "tracing", "secrets", "logs", "terminal", "snippets", "cache"]
}
```

### Context-aware panel (helper panel) structure

```
<div class="absolute z-40 right-0 h-full bg-background flex flex-row">
  <!-- Resize handle -->
  <div class="resize-handle border-border z-20 print:hidden border-l" />
  <!-- or -->
  <div class="w-1 h-full cursor-col-resize border-l" />

  <!-- Panel content -->
  <div class="flex flex-col gap-1">
    <div class="flex flex-row justify-between items-center mx-2">
      <!-- panel header with close button -->
      <button data-testid="close-helper-pane" />
    </div>
    <div class="mt-2 pb-7 mb-4 h-full overflow-auto">
      <!-- panel body -->
    </div>
  </div>
</div>
```

---

## G. Footer Structure

### Footer item component

```javascript
// xt.displayName = "FooterItem"
// Used throughout footer bar
```

### Footer data-testid values

```
footer-panel              footer-backend-status
footer-ai-disabled        footer-ai-enabled
footer-copilot-status     footer-lsp-status
footer-rtc-status         footer-runtime-settings
```

### Footer status items

- Backend status (`data-testid="footer-backend-status"`)
- AI status (enabled/disabled, `data-testid="footer-ai-enabled"` or `"footer-ai-disabled"`)
- Copilot status (`data-testid="footer-copilot-status"`)
- LSP status (`data-testid="footer-lsp-status"`)
- RTC status (`data-testid="footer-rtc-status"`)
- Runtime settings (`data-testid="footer-runtime-settings"`)
- CPU bar (`data-testid="cpu-bar"`)
- GPU bar (`data-testid="gpu-bar"`)
- Memory usage bar (`data-testid="memory-usage-bar"`)

---

## H. Top-Right Controls (Notebook Menu)

### Notebook menu dropdown

```javascript
// data-testid="notebook-menu-dropdown"
// shape="circle", size="small"
// className: "h-[27px] w-[27px]"
// Each item: data-testid=`notebook-menu-dropdown-${label}`
```

### Other top controls

```
data-testid="command-palette-button"    // Command palette
data-testid="run-button"               // Run cell/add code button
data-testid="interrupt-button"         // Interrupt execution
data-testid="restart-session-button"   // Restart session
data-testid="filename-input"           // Notebook filename input
data-testid="save-button"              // Save button
```

---

## I. Edit Page Layout (Approximate DOM Hierarchy)

```
#root
  #App
    [EditPage / Lg component]
      <!-- Filename bar at top -->
      <input data-testid="filename-input"
             class="bg-transparent group filename-input" />

      <!-- Main layout: sidebar + notebook + helper panel -->
      [PanelGroup - react-resizable-panels]

        <!-- Left sidebar (when open) -->
        [Sidebar panel]
          <div class="flex flex-col overflow-y-hidden w-[180px] shadow-xs h-full">
            <!-- Panel tab icons -->
            <!-- Active panel content (files/variables/packages/etc) -->
          </div>

        <!-- Center: notebook area -->
        [Notebook surface]
          <div class="flex flex-col h-full flex-1 overflow-hidden mr-[-4px]">
            <!-- Column container -->
            <div data-testid="column-container">
              <div data-testid="cell-column">
                <!-- Setup cells -->
                <!-- Regular cells (SortableCell/Il) -->
                <!-- Create cell button -->
                <button data-testid="create-cell-button" />
              </div>
            </div>
          </div>

        <!-- Resize handle -->
        <div class="w-[3px] cursor-col-resize transition-colors duration-200 z-100" />

        <!-- Right: context-aware/helper panel (when open) -->
        [ContextAwarePanel]
          <div data-testid="helper"
               class="absolute z-40 right-0 h-full bg-background flex flex-row">
            ...
          </div>

      <!-- Error/Package banners (fixed positioned) -->
      <div class="flex flex-col gap-4 mb-5 fixed top-5 left-12 min-w-[400px] max-w-[600px] z-200 opacity-95">
        ...
      </div>

      <!-- Bottom: footer bar -->
      <div data-testid="footer-panel"
           class="flex align-items justify-between shrink-0 h-8">
        <!-- Left footer items -->
        <!-- Right footer items -->
      </div>

      <!-- Floating Find/Replace -->
      <div class="fixed top-0 right-0 w-[500px] flex flex-col bg-(--sage-1)">
        ...
      </div>
```

---

## J. Run/App Page Layout

```
#root
  #App
    [RunPage]
      <!-- Cells rendered with published class -->
      <div class="marimo-cell hover-actions-parent z-10 published">
        <div class="output-area ...">
          <!-- Output only, no editor -->
        </div>
      </div>

      <!-- Static notebook banner -->
      <div data-testid="static-notebook-banner" />

      <!-- Watermark -->
      <div data-testid="watermark" class="fixed bottom-0 right-0 z-50" />
```

---

## K. Key CSS Variables Referenced

From class strings and CSS rules:

```
--gray-1 through --gray-6     (cell borders, backgrounds)
--slate-1 through --slate-11   (grid background, text colors)
--blue-4, --blue-9, --blue-10, --blue-11
--green-4, --green-9, --green-11
--amber-2, --amber-9, --amber-11
--purple-9, --purple-11
--red-2, --red-9, --red-10
--cyan-9
--sky-2, --sky-11, --sky-12
--grass-9
--sage-1

--error                 (cell error border/outline)
--stale                 (needs-run border/outline)
--action-foreground     (needs-run hover)
--base-shadow           (focus shadow color)
--base-shadow-darker    (shadow offset color)
--gutter-width          (tray pseudo-element width)

--tw-* properties       (Tailwind v4 theme properties)
```

---

## L. LocalStorage Keys

| Key | Purpose |
|---|---|
| `marimo:sidebar` | Sidebar open/closed state, selected panel |
| `marimo:panel-layout` | Which panels are in sidebar vs developer-panel |
| `marimo:notebook-col-sizes` | Column widths for multi-column layout |
| `marimo:notebook-sql-mode` | SQL mode preference |

---

## M. Key React Component Names (from source mapping)

| Minified | Likely Original | File |
|---|---|---|
| `Il` | `SortableCell` | edit-page |
| `_l` | `SortableCellInternal` | edit-page |
| `Ws` | `CellEditor` | edit-page |
| `wa` | `CellStatus` | edit-page |
| `Ea` | `CellActionsDropdown` | edit-page |
| `eo` | `ExpandableOutput` / `OutputArea` | edit-page |
| `Al` | `AlignmentGuide` (collapse button) | edit-page |
| `Dl` | `CellNameIndicator` | edit-page |
| `Os` | `ConsoleOutputs` | edit-page |
| `Hm` | `ConsoleOutputBar` | edit-page |
| `Pm` | `CellLink` | edit-page |
| `jl` | `CellLink` (alt) | edit-page |
| `yl` | `ExpandButton` | edit-page |
| `vl` | `RunButton` (shoulder) | edit-page |
| `Lg` | `EditPage` (main) | edit-page |
| `xt` | `FooterItem` | edit-page |
| `bl` | `CellEditorProvider` | edit-page |
| `yo` | Context wrapper | edit-page |
| `Rl` | `CellColumn` | edit-page |
| `Eg` | `ColumnContainer` | edit-page |
| `md` | `FilenameBar` | edit-page |
| `Cn` | `cn()` utility for marimo-cell classes | cells |
| `Ya.outputArea` | Output area CSS module class | edit-page |
| `En` | `CellId` utility | cells |

---

## N. CSS File Purposes

| File | Content |
|---|---|
| `index-CVpJvEAO.css` | Main styles: marimo-cell states, tray, shoulder, hover-actions, output-area, #App states, tailwind utilities |
| `cells-jmgGt1lS.css` | CodeMirror tooltip, documentation, code highlight styles |
| `cell-editor-Iey559K_.css` | Filename input shadows, marimo-cell CM merge view, tailwind @property definitions |
| `layout-BjXzDXoG.css` | React grid layout (for grid/dashboard mode), debugger input |
| `markdown-renderer-DdDKmWlR.css` | Markdown preview styles |
| `JsonOutput-B7vuddcd.css` | JSON output viewer styles |

---

## O. Outline/TOC Selectors

From cells JS, the outline panel queries:

```javascript
// Elements that appear in outline TOC:
var NE = ["marimo-carousel", "marimo-tabs", "marimo-accordion", "marimo-sidebar"]
var DE = "h1, h2, h3, h4, h5, h6"
```

The outline panel uses `.auto-collapse-nav` for responsive behavior:
- At narrow widths (<= 200px container), text becomes hidden and only icons show
- `auto-collapse-nav[data-orientation=vertical]` uses container queries

---

## P. Disconnected State

When the server disconnects:

```css
#App.disconnected .cm .cm-gutters,
#App.disconnected .console-output-area,
#App.disconnected .marimo-cell,
#App.disconnected .marimo-cell .cm-editor.cm-focused .cm-activeLine,
#App.disconnected .marimo-cell .cm-editor.cm-focused .cm-activeLineGutter,
#App.disconnected .marimo-cell .shoulder-button {
  background-color: transparent;
}

#App.disconnected .cell-queued-icon,
#App.disconnected .cell-running-icon,
#App.disconnected .elapsed-time {
  visibility: hidden;
  animation: none;
}

.light #App.disconnected,
.light #App.disconnected .transparent-when-disconnected {
  background: none;
}
```

Pre-loaded gradient and noise images ensure the disconnected overlay renders without server access.

---

## Q. Keyboard Shortcut Integration Points

From edit-page:

```javascript
Se("global.focusTop",     focusTopCell)
Se("global.focusBottom",  focusBottomCell)
Se("global.toggleSidebar", toggleSidebarPanel)
Se("global.foldCode",     foldAll)
Se("global.unfoldCode",   unfoldAll)
Se("global.formatAll",    formatAll)
Se("cell.hideCode",       NOOP)     // registered but no-op at page level
Se("cell.format",         NOOP)     // registered but no-op at page level
```

---

## R. CellId Utility Functions

```javascript
// Active element check:
rm = function() {
  return document.activeElement instanceof HTMLElement
    && document.activeElement.classList.contains("marimo-cell")
}

// Focus a cell by ID:
Fw = function(cellId) {
  let el = document.getElementById(En.create(cellId))  // "cell-{id}"
  el ? cf(el) : warn(`focusCell: element not found: ${cellId}`)
}

// Focus cell editor:
// Uses CellFocusManager to find `.cell-editor` within cell
```
