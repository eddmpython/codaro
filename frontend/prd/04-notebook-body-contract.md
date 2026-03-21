[Back to PRD Index](../PRD.md)

# 6. Notebook Body Contract

[Resume from Summary](./10-summary-acceptance-and-copy-plan.md#121-current-state)

Installed asset evidence for this file:

- `./assets/edit-page-CTVRcSta.js`
- `./assets/cells-wT6clfi5.js`
- `./assets/floating-outline-jCvD7_Ne.js`
- `./assets/add-cell-with-ai-Bl1TJ3Bp.js`
- `./assets/error-banner-CAuK5DPN.js`
- `./assets/index-CVpJvEAO.css`

#### 6.1 Filename Bar

Source:

Installed assets:

- `./assets/edit-page-CTVRcSta.js`
- `./assets/index-CVpJvEAO.css`

Readable source:

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

Installed assets:

- `./assets/edit-page-CTVRcSta.js`
- `./assets/cells-wT6clfi5.js`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/vertical-layout-wrapper.tsx`
- `.__marimo_upstream/frontend/src/components/editor/renderers/vertical-layout/vertical-layout.tsx`

Outer wrapper:

- `px-1 sm:px-16 md:px-20 xl:px-24 print:px-0 print:pb-0`
- `pb-24 sm:pb-12`

Inner container (child div inside outer wrapper):

- `m-auto`
- duplicates `pb-24 sm:pb-12` (same padding as outer — intentional)
- width mode classes applied here (not on outer wrapper)

Width modes (on inner container):

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
  - `gap-5` when `showCode && canShowCode`

Vertical renderer derived gates:

- initial `showCode` resolution:
  - if `showCodeInRunModeAtom` is false, initializes false
  - else uses query param `showCode`
  - if query param is absent, defaults to `true` for:
    - static notebooks
    - wasm notebooks
    - kiosk mode
- `canShowCode` predicate:
  - returns true immediately in kiosk mode
  - otherwise requires:
    - `mode === "read"`
    - `includeCode` query param is not `"false"`
    - at least one cell has code
- renderer appends:
  - `FloatingOutline`
  - only in `mode === "read"` also appends `ActionButtons`

Read-mode empty notebook branches:

- when `cells.length === 0 && !invisible && !kernelState.isInstantiated`
  - wrapper `div.flex-1.flex.flex-col.items-center.justify-center.py-8`
  - icon `Loader2Icon className="w-8 h-8 animate-spin text-muted-foreground"`
- when `cells.length === 0 && !invisible && kernelState.isInstantiated`
  - wrapper `div.flex-1.flex.flex-col.items-center.justify-center.py-8`
  - `Alert variant="info"`
  - title `Empty Notebook`
  - description `This notebook has no code or outputs.`

Column layout branch:

- wrapper:
  - `flex flex-row gap-8 w-full`
- column:
  - `flex-1 flex flex-col gap-2 w-(--content-width)`

#### 6.2.1 Floating Outline Contract

Source:

Installed assets:

- `./assets/floating-outline-jCvD7_Ne.js`
- `./assets/index-CVpJvEAO.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/chrome/panels/outline/floating-outline.tsx`

Mount gate:

- `FloatingOutline` returns `null` when `items.length < 2`

Hover state contract:

- local state:
  - `const [isHovered, setIsHovered] = React.useState(false)`
- root hover handlers:
  - `onMouseEnter={() => setIsHovered(true)}`
  - `onMouseLeave={() => setIsHovered(false)}`

Floating outline root shell:

- `fixed top-[25vh] right-8 z-10000 print:hidden`
- small-screen hide:
  - `hidden md:block`

Child order:

```text
div.fixed.top-[25vh].right-8...
  OutlineList
  MiniMap
```

Floating `OutlineList` shell:

- base root class:
  - `flex flex-col overflow-auto py-4 pl-2`
- floating panel class add-on:
  - `-top-4 max-h-[70vh] bg-background rounded-lg shadow-lg absolute overflow-auto transition-all duration-300 w-[300px] border`
- hovered position branch:
  - `-left-[280px] opacity-100`
- idle position branch:
  - `left-[300px] opacity-0`

MiniMap shell:

- wrapper class:
  - `flex flex-col gap-4 items-end max-h-[70vh] overflow-hidden`

Outline item identity contract:

- identifier branch:
  - `"id" in item.by ? item.by.id : item.by.path`
- both `OutlineList` and `MiniMap` track repeated selectors with:
  - `const seen = new Map<string, number>()`
- click path:
  - `scrollToOutlineItem(item, occurrences)`

Outline list row contract:

- shared row class:
  - `px-2 py-1 cursor-pointer hover:bg-accent/50 hover:text-accent-foreground rounded-l`
- level branches:
  - level 1 -> `font-semibold`
  - level 2 -> `ml-3`
  - level 3 -> `ml-6`
  - level 4 -> `ml-9`
- active row branch:
  - `occurrences === activeOccurrences && activeHeaderId === identifier`
  - adds `text-accent-foreground`
- html-backed heading branch:
  - uses `dangerouslySetInnerHTML`
- plain heading branch:
  - renders `{item.name}`

MiniMap marker contract:

- base marker class:
  - `h-[2px] bg-muted-foreground/60`
- width branches:
  - level 1 -> `w-5`
  - level 2 -> `w-4`
  - level 3 -> `w-3`
  - level 4 -> `w-2`
- active marker branch:
  - `occurrences === activeOccurrences && activeHeaderId === identifier`
  - adds `bg-foreground`

#### 6.2.2 Column Container And Column Chrome

Source:

Installed assets:

- `./assets/cells-wT6clfi5.js`
- `./assets/edit-page-CTVRcSta.js`

Readable source:

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
  - invisible hover area expansion via pseudo-element:
    - `relative before:content-[''] before:absolute before:inset-y-0 before:-left-[3px] before:right-[-3px] before:w-[9px] before:z-[-1]`
  - column hover state:
    - `hover/column:bg-[var(--slate-3)] dark:hover/column:bg-[var(--slate-5)]`
  - double-hover (handle + column):
    - `hover/column:hover:bg-primary/60 dark:hover/column:hover:bg-primary/60`

Column width persistence:

- source uses:
  - `getColumnWidth(index)`
  - `saveColumnWidth(index, width)`

Column grouping helper:

- `groupCellsByColumn(cells)`:
  - starts with `lastSeenColumn = 0`
  - uses `cell.config.column ?? lastSeenColumn`
  - updates `lastSeenColumn` as it iterates
  - returns sorted entries ascending by column index

Setup cell insertion branch:

- when first column and setup marker is present in notebook order, source prepends:
  - `Cell({ cellId: SETUP_CELL_ID, showPlaceholder: false, canDelete: true, mode, userConfig, theme, isCollapsed: false, collapseCount: 0, canMoveX: false })`
- normal column cells render after that setup branch with:
  - `Cell({ cellId, showPlaceholder, canDelete, mode, userConfig, theme, isCollapsed, collapseCount, canMoveX: appConfig.width === "columns" })`

Read-mode notebook action dropdown:

- source component:
  - `ActionButtons`
- returns `null` when computed `actions.length === 0`
- root wrapper:
  - `data-testid="notebook-actions-dropdown"`
  - class `right-0 top-0 z-50 m-4 print:hidden flex gap-2`
  - position branch:
    - static notebook -> `absolute`
    - otherwise -> `fixed`
- root menu:
  - `DropdownMenu modal={false}`
  - `DropdownMenuTrigger asChild={true}`
  - trigger button `Button variant="secondary" size="xs"`
  - trigger icon `MoreHorizontalIcon className="w-4 h-4"`
  - `DropdownMenuContent align="end" className="print:hidden w-[220px]"`
- `Show code` row branch:
  - included only when `canShowCode`
  - `data-testid="notebook-action-show-code"`
  - icon `Code2Icon className="mr-2" size={14} strokeWidth={1.5}`
  - label shell `span.flex-1`
  - check icon `Check className="h-4 w-4"` when `showCode`
  - followed by `DropdownMenuSeparator`
- non-static download rows:
  - `Download as HTML`
    - `data-testid="notebook-action-download-html"`
    - icon `FolderDownIcon className="mr-2" size={14} strokeWidth={1.5}`
  - `Download as .py`
    - only when `canShowCode`
    - `data-testid="notebook-action-download-python"`
    - icon `CodeIcon className="mr-2" size={14} strokeWidth={1.5}`
  - `Download as PNG`
    - preceded by separator
    - `data-testid="notebook-action-download-png"`
    - icon `ImageIcon className="mr-2" size={14} strokeWidth={1.5}`
- download handlers:
  - HTML -> `downloadAsHTML({ filename: document.title, includeCode: true })`
  - Python -> `readCode()` then `downloadBlob(..., Filenames.toPY(document.title))`
  - PNG -> `downloadHTMLAsImage({ element: document.getElementById("App"), filename: document.title, prepare: ADD_PRINTING_CLASS })`

Read-mode cell hiding helper:

- `shouldHideCode(code, output)` returns true when:
  - markdown adapter fully supports the code and output is non-empty
  - or `code.trim() === ""`

#### 6.3 Banner and Blocking Overlays

Source:

Installed assets:

- `./assets/edit-page-CTVRcSta.js`
- `./assets/error-banner-CAuK5DPN.js`
- `./assets/index-CVpJvEAO.css`

Readable source:

- `.__marimo_upstream/frontend/src/components/editor/alerts/connecting-alert.tsx`
- `.__marimo_upstream/frontend/src/components/editor/alerts/floating-alert.tsx`
- `.__marimo_upstream/frontend/src/plugins/impl/common/error-banner.tsx`

Generic banner primitive:

- source component:
  - `Banner`
- base class:
  - `text-sm p-2 border whitespace-pre-wrap overflow-hidden`
- `kind="danger"`:
  - `text-error border-(--red-6) shadow-md-solid shadow-error bg-(--red-1)`
- `kind="info"`:
  - `text-primary border-(--blue-6) shadow-md-solid shadow-accent bg-(--blue-1)`
- `kind="warn"`:
  - `border-(--yellow-6) bg-(--yellow-2) dark:bg-(--yellow-4) text-(--yellow-11) dark:text-(--yellow-12)`
- clickable add-on:
  - `cursor-pointer`
- clickable hover branches:
  - danger -> `hover:bg-(--red-3)`
  - info -> `hover:bg-(--blue-3)`
  - warn -> `hover:bg-(--yellow-3)`

`FloatingAlert` primitive:

- returns `null` when `show === false`
- delay wrapper:
  - `DelayMount milliseconds={delayMs}`
  - default `delayMs = 2000`
- outer shell:
  - `flex flex-col gap-4 mb-5 fixed top-5 left-1/2 transform -translate-x-1/2 z-200 opacity-95`
- inner `Banner` class:
  - `flex flex-col rounded py-2 px-4 animate-in slide-in-from-top w-fit`
- optional title row:
  - `div.flex.justify-between`
  - title shell `span.font-bold.text-lg.flex.items-center.mb-1`
- body wrapper:
  - `div.flex.flex-col.gap-4.justify-between.items-start.text-muted-foreground.text-base`

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

Connecting alert:

- source component:
  - `ConnectingAlert`
- `isConnecting` branch:
  - outer gate `DelayMount milliseconds={1000}`
  - anchor wrapper `div.m-0.flex.items-center.min-h-[28px].fixed.top-5.left-1/2.transform.-translate-x-1/2.z-200`
  - short fallback:
    - `Tooltip content="Connecting to a marimo runtime"`
    - inner `div.flex.items-center`
    - `LoadingEllipsis size={5} className="text-yellow-500"`
  - long branch gate:
    - nested `DelayMount milliseconds={5000}`
  - long branch banner:
    - `Banner kind="info" className="flex flex-col rounded py-2 px-4 animate-in slide-in-from-top w-fit"`
    - body wrapper `div.flex.flex-col.gap-4.justify-between.items-start.text-muted-foreground.text-base`
    - row `div.flex.items-center.gap-2`
    - `Spinner className="h-4 w-4"`
    - text `Connecting to a marimo runtime ...`
- `isClosed` branch:
  - `FloatingAlert show={isClosed} kind="danger"`
  - body `div.flex.items-center.gap-2`
  - text `Failed to connect.`

Not-started connection alert:

- source component:
  - `NotStartedConnectionAlert`
- gate:
  - renders only when `isNotStartedAtom` is true
- wrapper:
  - `FloatingAlert show={isNotStarted} kind="info"`
- body:
  - `div.flex.items-center.gap-2`
  - text `Not connected to a runtime.`
- action button:
  - `Button variant="link"`
  - click path `connectToRuntime`
  - label `Click to connect`

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

Installed assets:

- `./assets/cells-wT6clfi5.js`
- `./assets/add-cell-with-ai-Bl1TJ3Bp.js`

Readable source:

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

Open AI composer contract:

- source component:
  - `AddCellWithAI`
- root class:
  - `flex flex-col w-full py-2`
- persistent language storage:
  - atom key `marimo:ai-language`
  - values `"python" | "sql"`
- prompt history storage:
  - local-storage key `marimo:ai-prompt-history`
- staged-cell pre-submit behavior:
  - stores prompt history from `inputRef.current.view` when present
  - always calls `deleteAllStagedCells()` before sending a new request
- submit payload:
  - `sendMessage({ text: input, files: fileParts })`
- loading predicate:
  - `status === "streaming" || status === "submitted"`
- completion predicate:
  - `stagedAICells.size > 0`
- current model fallback:
  - `ai.models.edit_model ?? DEFAULT_AI_MODEL`
- attachment-support gate:
  - only true when `PROVIDERS_THAT_SUPPORT_ATTACHMENTS` contains the current provider id

Composer input row:

- wrapper class:
  - `flex items-center px-3`
- leading icon:
  - `SparklesIcon className="size-4 text-(--blue-11) mr-2"`
- close button:
  - `Button variant="text" size="sm" className="mb-0 px-1"`
  - icon `XIcon className="size-4"`
- close path:
  - `deleteAllStagedCells()`
  - `onClose()`

Composer footer row:

- wrapper class:
  - `px-3 pt-1 flex flex-row items-center justify-between`
- left cluster:
  - `flex items-center gap-2`
- right cluster:
  - `flex flex-row items-center`
- file-pill wrapper when attachments exist:
  - `flex flex-row gap-1 flex-wrap pr-1`
- model dropdown props:
  - `triggerClassName: "h-7 text-xs max-w-64"`
  - `iconSize: "small"`
  - `forRole: "edit"`
  - `showAddCustomModelDocs: true`
- language trigger:
  - `DropdownMenuTrigger`
  - `className: "flex items-center justify-between h-7 text-xs px-2 py-0.5 border rounded-md hover:text-accent-foreground"`
  - `data-testid="language-button"`
- language menu heading:
  - `Select language`
- language options:
  - `Python`
  - `SQL`
- accept-completion path:
  - `clearStagedCells()`
  - `onClose()`
- decline-completion path:
  - `deleteAllStagedCells()`

`PromptInput` contract inside `AddCellWithAI`:

- primitive:
  - `ReactCodeMirror`
- wrapper class:
  - `flex-1 font-sans overflow-auto my-1`
- width:
  - `100%`
- theme:
  - `"dark"` when `useTheme().theme === "dark"`, otherwise `"light"`
- default placeholder:
  - `Generate with AI, @ to include context`
- extensions include:
  - `autocompletion({})`
  - `markdown()`
  - `resourceExtension(...)`
  - prompt-history storage backed by `ZodLocalStorage`
  - `EditorView.lineWrapping`
  - `minimalSetup()`
- enter-key contract:
  - `Enter` with no meta or ctrl or shift submits
  - `Shift+Enter` inserts a newline manually
  - `Escape` closes the composer
- extra completion hook:
  - `mentionsCompletionSource(...)` via `additionalCompletions`

Open-state visibility rule:

- outer shell always adds:
  - `opacity-100`
  - only when `isAiButtonOpen === true`

